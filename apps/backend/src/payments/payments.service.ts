import * as crypto from 'crypto';
import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import Stripe from 'stripe';
import { MeetingStatus, PaymentStatus, PaymentProvider } from '@prisma/client';
import { throwAppError } from '../common/errors/throw-app-error';
import { ErrorCode } from '../common/errors/error-codes';
import { DocVerificationStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  private stripe?: Stripe;
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private prisma: PrismaService) {
    const stripeKey = process.env.STRIPE_SECRET_KEY;

    if (stripeKey) {
      this.stripe = new Stripe(stripeKey);
    } else {
      this.logger.warn(
        'Stripe is disabled (STRIPE_SECRET_KEY not set). P24 is used for MVP.',
      );
      this.stripe = undefined;
    }
  }

  private getP24BaseUrl() {
    return process.env.P24_BASE_URL ?? 'https://sandbox.przelewy24.pl/api/v1';
  }

  private getP24GatewayUrl() {
    return (
      process.env.P24_GATEWAY_URL ?? 'https://sandbox.przelewy24.pl/trnRequest'
    );
  }

  private getP24AuthHeader() {
    const merchantId = process.env.P24_MERCHANT_ID;
    const apiKey = process.env.P24_API_KEY;

    if (!merchantId || !apiKey) {
      throwAppError(
        ErrorCode.P24_CONFIG_MISSING,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Payment configuration missing',
      );
    }

    const token = Buffer.from(`${merchantId}:${apiKey}`, 'utf8').toString(
      'base64',
    );
    return `Basic ${token}`;
  }

  private p24SignRegister(params: {
    sessionId: string;
    merchantId: number;
    amount: number;
    currency: string;
    crc: string;
  }) {
    // Usually JSON stringify with these fields + sha384.
    // If you get a mismatch, align 1:1 with the P24 calculator.
    const payload = JSON.stringify({
      sessionId: params.sessionId,
      merchantId: params.merchantId,
      amount: params.amount,
      currency: params.currency,
      crc: params.crc,
    });

    return crypto.createHash('sha384').update(payload, 'utf8').digest('hex');
  }

  private async p24Post<T>(path: string, body: unknown): Promise<T> {
    const url = `${this.getP24BaseUrl()}${path}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.getP24AuthHeader(),
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();

    if (!res.ok) {
      this.logger.error(
        `P24 request failed ${res.status} ${res.statusText}: ${text}`,
      );
      throw new Error(`P24 request failed: ${res.status} ${res.statusText}`);
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      throw new Error(`P24 returned non-JSON response: ${text}`);
    }
  }

  private async p24RegisterTransaction(payload: {
    merchantId: number;
    posId: number;
    sessionId: string;
    amount: number;
    currency: string;
    description: string;
    email: string;
    country: string;
    language: string;
    urlReturn: string;
    urlStatus: string;
    sign: string;
  }): Promise<string> {
    const response = await this.p24Post<{
      data?: { token?: string };
      responseCode?: number;
    }>('/transaction/register', payload);

    const token = response?.data?.token;

    if (!token) {
      this.logger.error(
        `P24 register response invalid: ${JSON.stringify(response)}`,
      );
      throw new Error('P24 register response missing token');
    }

    return token;
  }

  private p24SignVerify(params: {
    sessionId: string;
    orderId: number;
    amount: number;
    currency: string;
    crc: string;
  }) {
    const payload = JSON.stringify({
      sessionId: params.sessionId,
      orderId: params.orderId,
      amount: params.amount,
      currency: params.currency,
      crc: params.crc,
    });

    return crypto.createHash('sha384').update(payload, 'utf8').digest('hex');
  }

  private async verifyP24Transaction(params: {
    sessionId: string;
    orderId: number;
    amount: number;
    currency: string;
  }): Promise<'success' | 'failed'> {
    const merchantId = Number(process.env.P24_MERCHANT_ID);
    const posId = Number(process.env.P24_POS_ID);
    const crc = process.env.P24_CRC ?? '';

    if (!merchantId || !posId || !crc) {
      throwAppError(
        ErrorCode.P24_CONFIG_MISSING,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Payment configuration missing',
      );
    }

    const sign = this.p24SignVerify({
      sessionId: params.sessionId,
      orderId: params.orderId,
      amount: params.amount,
      currency: params.currency,
      crc,
    });

    const payload = {
      merchantId,
      posId,
      sessionId: params.sessionId,
      amount: params.amount,
      currency: params.currency,
      orderId: params.orderId,
      sign,
    };

    const resp = await this.p24Post<{ data?: { status?: string } }>(
      '/transaction/verify',
      payload,
    );

    return resp?.data?.status === 'success' ? 'success' : 'failed';
  }

  private async refundP24Transaction(params: {
    sessionId: string;
    orderId: number;
    amount: number;
    currency: string;
  }): Promise<'success' | 'failed'> {
    const merchantId = Number(process.env.P24_MERCHANT_ID);
    const posId = Number(process.env.P24_POS_ID);
    const crc = process.env.P24_CRC ?? '';

    if (!merchantId || !posId || !crc) {
      throwAppError(
        ErrorCode.P24_CONFIG_MISSING,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Payment configuration missing',
      );
    }

    const sign = this.p24SignVerify({
      sessionId: params.sessionId,
      orderId: params.orderId,
      amount: params.amount,
      currency: params.currency,
      crc,
    });

    const payload = {
      merchantId,
      posId,
      sessionId: params.sessionId,
      orderId: params.orderId,
      amount: params.amount,
      currency: params.currency,
      sign,
    };

    const resp = await this.p24Post<{ data?: { status?: string } }>(
      '/transaction/refund',
      payload,
    );

    return resp?.data?.status === 'success' ? 'success' : 'failed';
  }

  async handleP24Webhook(body: any) {
    // P24 can send different field names, so be defensive.
    const sessionId = String(body?.sessionId ?? body?.SessionId ?? '');
    const orderIdRaw = body?.orderId ?? body?.OrderId;
    const amountRaw = body?.amount ?? body?.Amount;

    // sessionId + orderId are required to match and verify a payment
    if (!sessionId || orderIdRaw == null) {
      this.logger.warn(`P24 webhook missing fields: ${JSON.stringify(body)}`);
      return;
    }

    const orderId = Number(orderIdRaw);
    if (!Number.isFinite(orderId)) {
      this.logger.warn(`P24 webhook invalid orderId: ${JSON.stringify(body)}`);
      return;
    }

    // amount may be missing or malformed in some callbacks; we treat DB as source of truth
    const amount = amountRaw == null ? NaN : Number(amountRaw);
    const currency = 'PLN';

    // 1) Find payment by sessionId (provider=p24).
    const payment = await this.prisma.payment.findFirst({
      where: {
        provider: PaymentProvider.p24,
        p24SessionId: sessionId,
      },
    });

    if (!payment) {
      this.logger.warn(
        `P24 webhook: payment not found for sessionId=${sessionId}`,
      );
      return;
    }

    // 1) Idempotency: webhook may be delivered multiple times
    if (payment.status === PaymentStatus.succeeded) {
      this.logger.log(
        `P24 webhook ignored (already succeeded): payment=${payment.id} sessionId=${sessionId}`,
      );
      return;
    }

    if (payment.status === PaymentStatus.failed) {
      this.logger.log(
        `P24 webhook ignored (already failed): payment=${payment.id} sessionId=${sessionId}`,
      );
      return;
    }

    // 2) Amount guard:
    // - We ALWAYS verify using the amount stored in DB (source of truth).
    // - If webhook provides an amount and it doesn't match DB, we fail fast (spoofing / mismatch).
    const dbAmount = payment.unitAmount;

    if (!Number.isFinite(amount)) {
      this.logger.warn(
        `P24 webhook missing/invalid amount for payment=${payment.id}; using dbAmount=${dbAmount} sessionId=${sessionId}`,
      );
    } else if (amount !== dbAmount) {
      this.logger.warn(
        `P24 webhook amount mismatch for payment=${payment.id}: webhookAmount=${amount} dbAmount=${dbAmount} sessionId=${sessionId}`,
      );

      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.failed,
          p24OrderId: orderId,
        },
      });

      return;
    }

    // 3) Verify with P24 (source of truth) using DB amount.
    const verified = await this.verifyP24Transaction({
      sessionId,
      orderId,
      amount: dbAmount,
      currency,
    });

    if (verified !== 'success') {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.failed,
          p24OrderId: orderId,
        },
      });

      this.logger.warn(
        `P24 verify failed for payment=${payment.id} sessionId=${sessionId}`,
      );
      return;
    }

    // 3) success -> transaction: payment succeeded + meeting confirmed (only if meeting is still pending)
    await this.prisma.$transaction(async (tx) => {
      // Always mark payment as succeeded once verified
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.succeeded,
          p24OrderId: orderId,
        },
      });

      // Do not resurrect cancelled/completed meetings
      const currentMeeting = await tx.meeting.findUnique({
        where: { id: payment.meetingId },
        select: { id: true, status: true },
      });

      if (!currentMeeting) {
        this.logger.warn(
          `P24 webhook: meeting not found for payment=${payment.id} meetingId=${payment.meetingId}`,
        );
        return;
      }

      if (currentMeeting.status !== MeetingStatus.pending) {
        this.logger.warn(
          `P24 webhook: meeting status is ${currentMeeting.status}, skipping confirm (payment=${payment.id}, meeting=${currentMeeting.id})`,
        );
        return;
      }

      await tx.meeting.update({
        where: { id: payment.meetingId },
        data: { status: MeetingStatus.confirmed },
      });
    });

    this.logger.log(
      `P24 payment succeeded: payment=${payment.id} meeting=${payment.meetingId}`,
    );
  }

  async startP24PaymentForMeeting(userId: number, meetingId: number) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        doc: true,
        user: { include: { user: true } },
        slot: true,
      },
    });

    if (!meeting)
      throwAppError(
        ErrorCode.MEETING_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        `Meeting ${meetingId} not found`,
      );
    if (meeting.userId !== userId)
      throwAppError(
        ErrorCode.MEETING_NOT_OWNED,
        HttpStatus.FORBIDDEN,
        'You are not allowed to pay for this meeting',
      );
    if (!meeting.doc)
      throwAppError(
        ErrorCode.MEETING_NO_THERAPIST,
        HttpStatus.BAD_REQUEST,
        'Meeting has no assigned therapist',
      );
    if (meeting.status !== MeetingStatus.pending)
      throwAppError(
        ErrorCode.MEETING_NOT_PENDING,
        HttpStatus.BAD_REQUEST,
        'You can only pay for pending meetings',
      );
    // Pending TTL guard: do not allow payment for an expired hold (cron might not have run yet)
    // Default: 15 minutes
    const ttlMinutes = Number(process.env.MEETING_PENDING_TTL_MINUTES ?? 15);
    const ttlMs = (Number.isFinite(ttlMinutes) ? ttlMinutes : 15) * 60 * 1000;
    const expiresAt = new Date(meeting.createdAt.getTime() + ttlMs);

    if (expiresAt <= new Date()) {
      throwAppError(
        ErrorCode.MEETING_EXPIRED,
        HttpStatus.BAD_REQUEST,
        'This booking has expired. Please pick a slot again.',
      );
    }
    // Extra guard: if a succeeded payment already exists for this meeting, do not start another one
    const alreadyPaid = await this.prisma.payment.findFirst({
      where: {
        meetingId: meeting.id,
        provider: PaymentProvider.p24,
        status: PaymentStatus.succeeded,
      },
      select: { id: true },
    });

    if (alreadyPaid) {
      throwAppError(
        ErrorCode.PAYMENT_ALREADY_SUCCEEDED,
        HttpStatus.CONFLICT,
        'This meeting is already paid',
      );
    }
    if (!(meeting.doc.verificationStatus === DocVerificationStatus.approved))
      throwAppError(
        ErrorCode.THERAPIST_NOT_PUBLISHED,
        HttpStatus.BAD_REQUEST,
        'This therapist profile is not published',
      );

    const pricePln = meeting.doc.sessionPricePln;
    if (pricePln == null || pricePln <= 0)
      throwAppError(
        ErrorCode.SESSION_PRICE_NOT_SET,
        HttpStatus.BAD_REQUEST,
        'Session price is not set',
      );

    if (!meeting.slot)
      throwAppError(
        ErrorCode.SLOT_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
        'Meeting has no assigned slot',
      );

    const now = new Date();
    if (meeting.slot.startTime <= now)
      throwAppError(
        ErrorCode.MEETING_EXPIRED,
        HttpStatus.BAD_REQUEST,
        'You cannot pay for a meeting that has already started or finished',
      );

    if (!meeting.user?.user?.email)
      throwAppError(
        ErrorCode.EMAIL_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
        'User email is missing',
      );

    const amount = Math.round(pricePln * 100); // cents
    const currency = 'PLN';

    // Simple protection: reuse existing pending P24 payment for this meeting
    const existing = await this.prisma.payment.findFirst({
      where: {
        meetingId: meeting.id,
        provider: PaymentProvider.p24,
        status: PaymentStatus.pending,
      },
      orderBy: { createdAt: 'desc' },
    });

    // If we already registered in P24, just return the same redirect URL
    if (existing?.p24Token && existing?.p24SessionId) {
      const redirectUrl = `${this.getP24GatewayUrl()}/${existing.p24Token}`;
      return {
        url: redirectUrl,
        token: existing.p24Token,
        sessionId: existing.p24SessionId,
      };
    }

    const payment = existing
      ? existing
      : await this.prisma.payment.create({
          data: {
            meetingId: meeting.id,
            unitAmount: amount,
            currency,
            status: PaymentStatus.pending,
            provider: PaymentProvider.p24,
          },
        });

    let sessionId = payment.p24SessionId;

    if (!sessionId) {
      sessionId = `melius-meeting-${meeting.id}-pay-${payment.id}`;
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { p24SessionId: sessionId },
      });
    }

    // 3) Register with P24.
    const merchantId = Number(process.env.P24_MERCHANT_ID);
    const posId = Number(process.env.P24_POS_ID);
    const crc = process.env.P24_CRC ?? '';
    const apiKey = process.env.P24_API_KEY ?? '';

    if (!merchantId || !posId || !crc || !apiKey) {
      throwAppError(
        ErrorCode.P24_CONFIG_MISSING,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Payment configuration missing',
      );
    }

    const urlReturn =
      process.env.P24_RETURN_URL ??
      (process.env.CLIENT_URL ?? 'http://localhost:3001') + '/payment-success';
    const urlStatus =
      process.env.P24_STATUS_URL ??
      'http://localhost:3000/payments/p24/webhook';

    const sign = this.p24SignRegister({
      sessionId,
      merchantId,
      amount,
      currency,
      crc,
    });

    const body = {
      merchantId,
      posId,
      sessionId,
      amount,
      currency,
      description: 'Sesja terapeutyczna',
      email: meeting.user.user.email,
      country: 'PL',
      language: 'pl',
      urlReturn,
      urlStatus,
      sign,
      // MVP: omit the remaining fields.
    };

    const token = await this.p24RegisterTransaction(body);

    // Store token in Payment (debug + future retries).
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { p24Token: token },
    });

    const redirectUrl = `${this.getP24GatewayUrl()}/${token}`;

    return {
      url: redirectUrl,
      token,
      sessionId,
    };
  }

  async createCheckoutSessionForMeeting(userId: number, meetingId: number) {
    if (!this.stripe) {
      throwAppError(
        ErrorCode.PAYMENT_PROVIDER_DISABLED,
        HttpStatus.SERVICE_UNAVAILABLE,
        'Stripe is disabled',
      );
    }
    // 1. Fetch meeting with docProfile and user (to get email).
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        doc: true, // DocProfile
        user: {
          include: {
            user: true, // UserProfile.user -> User (email)
          },
        },
        slot: true,
      },
    });

    if (!meeting) {
      throwAppError(
        ErrorCode.MEETING_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        `Meeting ${meetingId} not found`,
      );
    }

    if (meeting.userId !== userId) {
      throwAppError(
        ErrorCode.MEETING_NOT_FOUND,
        HttpStatus.FORBIDDEN,
        'You are not allowed to pay for this meeting',
      );
    }

    if (!meeting.doc) {
      throwAppError(
        ErrorCode.MEETING_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
        'Meeting has no assigned therapist',
      );
    }

    if (meeting.status !== MeetingStatus.pending) {
      throwAppError(
        ErrorCode.MEETING_NOT_PENDING,
        HttpStatus.BAD_REQUEST,
        'You can only pay for pending meetings',
      );
    }

    if (!(meeting.doc.verificationStatus === DocVerificationStatus.approved)) {
      throwAppError(
        ErrorCode.MEETING_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
        'This therapist profile is not published',
      );
    }

    const pricePln = meeting.doc.sessionPricePln;

    if (pricePln == null || pricePln <= 0) {
      throwAppError(
        ErrorCode.MEETING_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
        'Session price is not set',
      );
    }

    if (!meeting.slot) {
      throwAppError(
        ErrorCode.SLOT_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
        'Meeting has no assigned slot',
      );
    }

    const now = new Date();
    const slotStart = meeting.slot.startTime;

    if (slotStart <= now) {
      throwAppError(
        ErrorCode.MEETING_EXPIRED,
        HttpStatus.BAD_REQUEST,
        'You cannot pay for a meeting that has already started or finished',
      );
    }

    const unitAmount = Math.round(pricePln * 100);
    const currency = 'pln';

    if (!meeting.user?.user?.email) {
      throwAppError(
        ErrorCode.EMAIL_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
        'User email is missing',
      );
    }

    // 2. Create Payment in DB.
    const payment = await this.prisma.payment.create({
      data: {
        meetingId: meeting.id,
        unitAmount,
        currency: currency.toUpperCase(), // "PLN"
        status: PaymentStatus.pending,
      },
    });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3001';

    // 3. Create Stripe Checkout Session.
    const session = await this.stripe!.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            unit_amount: unitAmount,
            product_data: {
              name: 'Sesja terapeutyczna',
              description:
                meeting.doc.firstName || meeting.doc.lastName
                  ? `Terapeuta: ${meeting.doc.firstName ?? ''} ${meeting.doc.lastName ?? ''}`.trim()
                  : 'Sesja z terapeutą',
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${clientUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/payment-cancelled`,
      customer_email: meeting.user.user.email,
      metadata: {
        paymentId: payment.id.toString(),
        meetingId: meeting.id.toString(),
      },
    });

    // 4. Update Payment with checkout ID.
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        stripeCheckoutId: session.id,
      },
    });

    this.logger.log(
      `Created checkout session ${session.id} for payment ${payment.id} & meeting ${meeting.id}`,
    );

    return {
      url: session.url,
      sessionId: session.id,
    };
  }

  async handleStripeWebhook(rawBody: Buffer, signature: string) {
    if (!this.stripe) {
      throwAppError(
        ErrorCode.PAYMENT_PROVIDER_DISABLED,
        HttpStatus.SERVICE_UNAVAILABLE,
        'Stripe is disabled',
      );
    }
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not set');
    }

    let event: Stripe.Event;

    try {
      event = this.stripe!.webhooks.constructEvent(
        rawBody,
        signature,
        endpointSecret,
      );
    } catch (err: any) {
      this.logger.error(
        `Webhook signature verification failed: ${err.message}`,
      );
      throwAppError(
        ErrorCode.PAYMENT_VERIFY_FAILED,
        HttpStatus.BAD_REQUEST,
        `Webhook Error: ${err.message}`,
      );
    }

    this.logger.log(`Received webhook event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await this.handleCheckoutCompleted(session);
        break;
      }
      // You can add other events later (expired, failed, etc.).
      default:
        this.logger.debug(`Unhandled event type: ${event.type}`);
        break;
    }
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const paymentId = session.metadata?.paymentId;
    const meetingId = session.metadata?.meetingId;

    if (!paymentId || !meetingId) {
      this.logger.warn(
        `Checkout session ${session.id} completed but missing metadata (paymentId: ${paymentId}, meetingId: ${meetingId})`,
      );
      return;
    }

    const paymentIntentId =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : (session.payment_intent?.id ?? null);

    try {
      await this.prisma.$transaction(async (tx) => {
        // Verify payment exists
        const payment = await tx.payment.findUnique({
          where: { id: Number(paymentId) },
        });

        if (!payment) {
          throwAppError(
            ErrorCode.MEETING_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            `Payment ${paymentId} not found`,
          );
        }

        // Verify meeting exists
        const meeting = await tx.meeting.findUnique({
          where: { id: Number(meetingId) },
        });

        if (!meeting) {
          throwAppError(
            ErrorCode.MEETING_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            `Meeting ${meetingId} not found`,
          );
        }

        await tx.payment.update({
          where: { id: Number(paymentId) },
          data: {
            status: PaymentStatus.succeeded,
            stripeCheckoutId: session.id,
            stripePaymentIntentId: paymentIntentId,
          },
        });

        await tx.meeting.update({
          where: { id: Number(meetingId) },
          data: {
            status: MeetingStatus.confirmed,
          },
        });
      });

      this.logger.log(
        `Successfully processed payment ${paymentId} and confirmed meeting ${meetingId}`,
      );
    } catch (error: any) {
      this.logger.error(
        `Failed to process checkout completion for session ${session.id}: ${error.message}`,
      );
      throw error;
    }
  }

  async refundPaymentForMeeting(meetingId: number, reason: string) {
    const payment = await this.prisma.payment.findFirst({
      where: {
        meetingId,
        provider: PaymentProvider.p24,
        status: PaymentStatus.succeeded,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!payment) {
      this.logger.warn(
        `Refund skipped: no succeeded P24 payment found for meeting ${meetingId}`,
      );
      return;
    }

    if (payment.status === PaymentStatus.refunded) {
      return;
    }

    if (!payment.p24OrderId || !payment.p24SessionId) {
      throwAppError(
        ErrorCode.P24_CONFIG_MISSING,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'P24 refund missing orderId/sessionId',
      );
    }

    const currency = payment.currency || 'PLN';

    const result = await this.refundP24Transaction({
      sessionId: payment.p24SessionId,
      orderId: payment.p24OrderId,
      amount: payment.unitAmount,
      currency,
    });

    if (result !== 'success') {
      throwAppError(
        ErrorCode.P24_REFUND_FAILED,
        HttpStatus.BAD_REQUEST,
        `P24 refund failed for meeting ${meetingId}`,
      );
    }

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.refunded },
    });

    this.logger.log(
      `Refunded P24 payment ${payment.id} for meeting ${meetingId} (${reason})`,
    );
  }
}

import {
  Injectable,
  BadRequestException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import Stripe from 'stripe';
import { MeetingStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  }

  async createCheckoutSessionForMeeting(userId: number, meetingId: number) {
    // 1. Pobierz meeting razem z docProfile i użytkownikiem (żeby mieć email)
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
      throw new NotFoundException(`Meeting ${meetingId} not found`);
    }

    if (meeting.userId !== userId) {
      throw new BadRequestException(
        'You are not allowed to pay for this meeting',
      );
    }

    if (!meeting.doc) {
      throw new BadRequestException('Meeting has no assigned therapist');
    }

    if (meeting.status !== MeetingStatus.pending) {
      throw new BadRequestException('You can only pay for pending meetings');
    }

    if (!meeting.doc.published) {
      throw new BadRequestException('This therapist profile is not published');
    }

    const pricePln = meeting.doc.sessionPricePln;

    if (pricePln == null || pricePln <= 0) {
      throw new BadRequestException('Session price is not set');
    }

    if (!meeting.slot) {
      throw new BadRequestException('Meeting has no assigned slot');
    }

    const now = new Date();
    const slotStart = meeting.slot.startTime;

    if (slotStart <= now) {
      throw new BadRequestException(
        'You cannot pay for a meeting that has already started or finished',
      );
    }

    const amountCents = Math.round(pricePln * 100);
    const currency = 'pln';

    if (!meeting.user?.user?.email) {
      throw new BadRequestException('User email is missing');
    }

    // 2. Utwórz Payment w bazie
    const payment = await this.prisma.payment.create({
      data: {
        meetingId: meeting.id,
        amountCents,
        currency: currency.toUpperCase(), // "PLN"
        status: PaymentStatus.pending,
      },
    });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3001';

    // 3. Utwórz Stripe Checkout Session
    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            unit_amount: amountCents,
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

    // 4. Zaktualizuj Payment o ID checkoutu
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
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not set');
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        endpointSecret,
      );
    } catch (err: any) {
      this.logger.error(
        `Webhook signature verification failed: ${err.message}`,
      );
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    this.logger.log(`Received webhook event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await this.handleCheckoutCompleted(session);
        break;
      }
      // tu później możesz dodać inne eventy (expired, failed itd.)
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
          throw new NotFoundException(`Payment ${paymentId} not found`);
        }

        // Verify meeting exists
        const meeting = await tx.meeting.findUnique({
          where: { id: Number(meetingId) },
        });

        if (!meeting) {
          throw new NotFoundException(`Meeting ${meetingId} not found`);
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
    // 1. Znajdź udaną płatność dla tego meetingu
    const payment = await this.prisma.payment.findFirst({
      where: {
        meetingId,
        status: PaymentStatus.succeeded,
      },
    });

    if (!payment) {
      this.logger.warn(
        `No succeeded payment found for meeting ${meetingId}, skipping refund`,
      );
      return;
    }

    if (payment.status === PaymentStatus.refunded) {
      this.logger.log(`Payment ${payment.id} already refunded, skipping`);
      return;
    }

    if (!payment.stripePaymentIntentId) {
      this.logger.error(
        `Payment ${payment.id} has no payment_intent id, cannot refund`,
      );
      return;
    }

    // 2. Refund w Stripe
    await this.stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      reason: 'requested_by_customer',
    });

    // 3. Update statusu w bazie
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.refunded,
      },
    });

    this.logger.log(
      `Refunded payment ${payment.id} for meeting ${meetingId} (${reason})`,
    );
  }
}

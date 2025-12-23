import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from './email.service';

type CancelledBy = 'user' | 'doc' | 'system';

@Injectable()
export class EmailEventsListener {
  private readonly logger = new Logger(EmailEventsListener.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
  ) {}

  @OnEvent('auth.registered')
  async onAuthRegistered(payload: { userId: number }) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          email: true,
          language: true,
        },
      });
      if (!user) return;

      await this.email.sendConfirmationEmail(user.email, user.language ?? 'pl');
    } catch (e) {
      this.logger.error('auth.registered listener failed', e as any);
    }
  }

  @OnEvent('auth.password_reset_requested')
  async onPasswordReset(payload: { userId: number }) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: payload.userId },
        select: { email: true, language: true },
      });
      if (!user) return;

      await this.email.sendPasswordLink(user.email);
    } catch (e) {
      this.logger.error(
        'auth.password_reset_requested listener failed',
        e as any,
      );
    }
  }

  @OnEvent('payment.succeeded')
  async onPaymentSucceeded(payload: { paymentId: number }) {
    try {
      const payment = await this.prisma.payment.findUnique({
        where: { id: payload.paymentId },
        select: {
          id: true,
          unitAmount: true,
          meeting: {
            select: {
              id: true,
              startTime: true,
              endTime: true,
              clientMessage: true,
              user: {
                select: {
                  userId: true,
                  firstName: true,
                  lastName: true,
                },
              },
              doc: {
                select: {
                  docId: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      });

      if (!payment?.meeting) return;
      const m = payment.meeting;

      // Pobierz dane użytkownika
      const user = await this.prisma.user.findUnique({
        where: { id: m.user.userId },
        select: { email: true, language: true },
      });

      // Pobierz dane terapeuty
      const doc = await this.prisma.user.findUnique({
        where: { id: m.doc.docId },
        select: { email: true, language: true },
      });

      if (!user || !doc) return;

      const clientName = [m.user.firstName, m.user.lastName]
        .filter(Boolean)
        .join(' ')
        .trim();
      const docName = [m.doc.firstName, m.doc.lastName]
        .filter(Boolean)
        .join(' ')
        .trim();
      const pricePln = Math.round(payment.unitAmount / 100);

      // klient
      await this.email.sendMeetingConfirmedClient({
        to: user.email,
        lang: user.language ?? 'pl',
        clientName,
        docName,
        startTime: m.startTime,
        pricePln,
      });

      // terapeuta
      await this.email.sendMeetingConfirmedDoc({
        to: doc.email,
        lang: doc.language ?? 'pl',
        docName,
        clientName,
        startTime: m.startTime,
        clientMessage: m.clientMessage ?? undefined,
      });
    } catch (e) {
      this.logger.error('payment.succeeded listener failed', e as any);
    }
  }

  @OnEvent('meeting.cancelled')
  async onMeetingCancelled(payload: {
    meetingId: number;
    cancelledBy: CancelledBy;
  }) {
    try {
      const meeting = await this.prisma.meeting.findUnique({
        where: { id: payload.meetingId },
        select: {
          id: true,
          startTime: true,
          user: {
            select: {
              userId: true,
              firstName: true,
              lastName: true,
            },
          },
          doc: {
            select: {
              docId: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });
      if (!meeting) return;

      // Pobierz dane użytkownika
      const user = await this.prisma.user.findUnique({
        where: { id: meeting.user.userId },
        select: { email: true, language: true },
      });

      // Pobierz dane terapeuty
      const doc = await this.prisma.user.findUnique({
        where: { id: meeting.doc.docId },
        select: { email: true, language: true },
      });

      if (!user || !doc) return;

      const clientName = [meeting.user.firstName, meeting.user.lastName]
        .filter(Boolean)
        .join(' ')
        .trim();
      const docName = [meeting.doc.firstName, meeting.doc.lastName]
        .filter(Boolean)
        .join(' ')
        .trim();

      // do klienta
      await this.email.sendMeetingCancelled({
        to: user.email,
        lang: user.language ?? 'pl',
        recipientName: clientName,
        otherPartyName: docName,
        startTime: meeting.startTime,
        cancelledBy: payload.cancelledBy,
      });

      // do terapeuty
      await this.email.sendMeetingCancelled({
        to: doc.email,
        lang: doc.language ?? 'pl',
        recipientName: docName,
        otherPartyName: clientName,
        startTime: meeting.startTime,
        cancelledBy: payload.cancelledBy,
      });
    } catch (e) {
      this.logger.error('meeting.cancelled listener failed', e as any);
    }
  }
}

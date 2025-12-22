import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { throwAppError } from '../common/errors/throw-app-error';
import { ErrorCode } from '../common/errors/error-codes';

@Injectable()
export class DocService {
  constructor(private readonly prisma: PrismaService) {}

  async getWeekCalendar(docUserId: number, from: string, to: string) {
    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
      throwAppError(
        ErrorCode.INVALID_DATE_RANGE,
        HttpStatus.BAD_REQUEST,
        'Invalid from/to date format',
      );
    }
    if (fromDate > toDate) {
      throwAppError(
        ErrorCode.INVALID_DATE_RANGE,
        HttpStatus.BAD_REQUEST,
        'from must be <= to',
      );
    }

    const docProfile = await this.prisma.docProfile.findUnique({
      where: { docId: docUserId },
      select: { id: true },
    });

    if (!docProfile) {
      throwAppError(
        ErrorCode.DOC_PROFILE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'Doc profile not found',
      );
    }

    const [slots, meetings] = await this.prisma.$transaction([
      this.prisma.availabilitySlot.findMany({
        where: {
          docId: docProfile.id,
          startTime: { gte: fromDate, lt: toDate },
        },
        select: {
          id: true,
          startTime: true,
          endTime: true,
          booked: true,
        },
        orderBy: { startTime: 'asc' },
      }),

      this.prisma.meeting.findMany({
        where: {
          docId: docProfile.id,
          status: 'confirmed',
          startTime: { gte: fromDate, lte: toDate },
        },
        select: {
          id: true,
          slotId: true,
          startTime: true,
          endTime: true,
          status: true,
          clientMessage: true,
          user: {
            select: { firstName: true, lastName: true },
          },
          payments: {
            where: { status: 'succeeded' },
            select: { id: true },
            take: 1,
          },
        },
        orderBy: { startTime: 'asc' },
      }),
    ]);

    const meetingBySlotId = new Map<number, { id: number }>();
    for (const m of meetings) {
      if (m.slotId) meetingBySlotId.set(m.slotId, m);
    }

    return {
      range: { from: fromDate.toISOString(), to: toDate.toISOString() },
      slots: slots.map((s) => ({
        ...s,
        startTime: s.startTime.toISOString(),
        endTime: s.endTime.toISOString(),
        meetingId: meetingBySlotId.get(s.id)?.id ?? null,
      })),
      meetings: meetings.map((m) => ({
        id: m.id,
        slotId: m.slotId ?? null,
        startTime: m.startTime.toISOString(),
        endTime: m.endTime.toISOString(),
        status: m.status,
        paid: m.payments.length > 0,
        clientName:
          m.user?.firstName || m.user?.lastName
            ? `${m.user?.firstName ?? ''} ${m.user?.lastName ?? ''}`.trim()
            : null,
        clientMessage: m.clientMessage ?? null,
      })),
    };
  }
}

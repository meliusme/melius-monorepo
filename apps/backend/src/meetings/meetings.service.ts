import { Injectable, HttpStatus } from '@nestjs/common';
import { MeetingStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMeetingDto } from './dtos/create-meeting.dto';
import { PaymentsService } from 'src/payments/payments.service';
import { throwAppError } from '../common/errors/throw-app-error';
import { ErrorCode } from '../common/errors/error-codes';
@Injectable()
export class MeetingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentsService: PaymentsService,
  ) {}
  async createMeeting(
    userId: number,
    { slotId, clientMessage }: CreateMeetingDto,
  ) {
    // Atomic booking to prevent race conditions: book slot and create meeting in a single transaction.
    return this.prisma.$transaction(async (tx) => {
      const slot = await tx.availabilitySlot.findUnique({
        where: { id: slotId },
        select: {
          id: true,
          docId: true,
          startTime: true,
          endTime: true,
          booked: true,
        },
      });

      if (!slot) {
        throwAppError(
          ErrorCode.SLOT_NOT_FOUND,
          HttpStatus.NOT_FOUND,
          'Slot not found',
        );
      }

      // Try to book the slot only if it is still free.
      const bookedResult = await tx.availabilitySlot.updateMany({
        where: { id: slot.id, booked: false },
        data: { booked: true },
      });

      if (bookedResult.count === 0) {
        throwAppError(
          ErrorCode.SLOT_ALREADY_BOOKED,
          HttpStatus.CONFLICT,
          'Slot already booked',
        );
      }

      const meeting = await tx.meeting.create({
        data: {
          userId,
          docId: slot.docId,
          slotId: slot.id,
          startTime: slot.startTime,
          endTime: slot.endTime,
          status: MeetingStatus.pending,
          clientMessage,
        },
      });

      return meeting;
    });
  }

  async getUserMeetings(
    userId: number,
    scope: 'upcoming' | 'past' | 'all' = 'upcoming',
  ) {
    const now = new Date();

    const where: any = {
      userId,
    };

    if (scope === 'upcoming') {
      where.status = { in: [MeetingStatus.pending, MeetingStatus.confirmed] };
    } else if (scope === 'past') {
      where.status = {
        in: [
          MeetingStatus.completed,
          MeetingStatus.cancelled_by_user,
          MeetingStatus.cancelled_by_doc,
          MeetingStatus.cancelled_by_system,
        ],
      };
    }

    return this.prisma.meeting.findMany({
      where,
      orderBy: {
        startTime: scope === 'past' ? 'desc' : 'asc',
      },
      include: {
        slot: true,
        doc: {
          include: {
            user: {
              include: {
                avatar: true,
                docProfile: true,
              },
            },
          },
        },
      },
    });
  }

  async getDocMeetings(
    docProfileId: number,
    scope: 'upcoming' | 'past' | 'all' = 'upcoming',
  ) {
    const now = new Date();

    const where: any = {
      docId: docProfileId,
    };

    if (scope === 'upcoming') {
      where.status = { in: [MeetingStatus.pending, MeetingStatus.confirmed] };
    } else if (scope === 'past') {
      where.status = {
        in: [
          MeetingStatus.completed,
          MeetingStatus.cancelled_by_user,
          MeetingStatus.cancelled_by_doc,
          MeetingStatus.cancelled_by_system,
        ],
      };
    }

    return this.prisma.meeting.findMany({
      where,
      orderBy: {
        startTime: scope === 'past' ? 'desc' : 'asc',
      },
      include: {
        slot: true,
        user: {
          include: {
            user: {
              include: {
                avatar: true,
              },
            },
            problems: true,
          },
        },
      },
    });
  }

  async getDocMeetingsForUser(
    userId: number,
    scope: 'upcoming' | 'past' | 'all' = 'upcoming',
  ) {
    const docProfile = await this.prisma.docProfile.findUnique({
      where: { docId: userId },
    });

    if (!docProfile) {
      throwAppError(
        ErrorCode.DOC_PROFILE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'Doc profile not found',
      );
    }
    return this.getDocMeetings(docProfile.id, scope);
  }

  async cancelMeetingByDocUser(meetingId: number, userId: number) {
    const docProfile = await this.prisma.docProfile.findUnique({
      where: { docId: userId },
    });

    if (!docProfile) {
      throwAppError(
        ErrorCode.DOC_PROFILE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'Doc profile not found',
      );
    }

    return this.cancelMeetingByDoc(meetingId, docProfile.id);
  }

  async cancelMeetingByUser(meetingId: number, userId: number) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
    });

    if (!meeting) {
      throwAppError(
        ErrorCode.MEETING_NOT_OWNED,
        HttpStatus.NOT_FOUND,
        'Meeting not found',
      );
    }

    if (meeting.userId !== userId) {
      throwAppError(
        ErrorCode.MEETING_NOT_FOUND,
        HttpStatus.FORBIDDEN,
        'You do not have permission to cancel this meeting',
      );
    }

    // 🔹 Limit czasowy dla klienta – tylko dla opłaconych (confirmed)
    // Policy: cancellation (and refund) allowed only up to 24h before start.
    if (meeting.status === MeetingStatus.confirmed) {
      const now = new Date();
      const diffMs = meeting.startTime.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      if (diffHours < 24) {
        throwAppError(
          ErrorCode.CANCEL_NOT_ALLOWED_TOO_LATE,
          HttpStatus.BAD_REQUEST,
          'Cannot cancel a confirmed meeting less than 24 hours before it starts',
        );
      }
    }

    return this.cancelMeeting(meeting, 'cancelled_by_user');
  }

  async cancelMeetingByDoc(meetingId: number, docProfileId: number) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
    });

    if (!meeting) {
      throwAppError(
        ErrorCode.MEETING_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'Meeting not found',
      );
    }

    if (meeting.docId !== docProfileId) {
      throwAppError(
        ErrorCode.MEETING_NOT_OWNED,
        HttpStatus.FORBIDDEN,
        'You do not have permission to cancel this meeting',
      );
    }

    return this.cancelMeeting(meeting, 'cancelled_by_doc');
  }

  private async cancelMeeting(
    meeting: any,
    cancelStatus: 'cancelled_by_user' | 'cancelled_by_doc',
  ) {
    // Check if meeting status allows cancellation
    if (
      meeting.status !== MeetingStatus.pending &&
      meeting.status !== MeetingStatus.confirmed
    ) {
      throwAppError(
        ErrorCode.MEETING_NOT_PENDING,
        HttpStatus.BAD_REQUEST,
        'Meeting cannot be cancelled - invalid status',
      );
    }

    // Check if meeting has already started or passed
    const now = new Date();
    if (meeting.startTime <= now) {
      throwAppError(
        ErrorCode.MEETING_EXPIRED,
        HttpStatus.BAD_REQUEST,
        'Cannot cancel a meeting that has already started or passed',
      );
    }

    // 🔹 1. Transakcja: tylko DB (status + slot)
    const updatedMeeting = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.meeting.update({
        where: { id: meeting.id },
        data: { status: cancelStatus as MeetingStatus },
      });

      if (meeting.slotId) {
        await tx.availabilitySlot.update({
          where: { id: meeting.slotId },
          data: { booked: false },
        });
      }

      return updated;
    });

    // 🔹 2. Refund
    // MVP: refunds are disabled (manual process outside the system).

    // 🔹 3. Zwracamy zaktualizowany meeting
    return updatedMeeting;
  }
}

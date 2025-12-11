import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { MeetingStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMeetingDto } from './dtos/create-meeting.dto';
import { PaymentsService } from 'src/payments/payments.service';
@Injectable()
export class MeetingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentsService: PaymentsService,
  ) {}
  async createMeeting(userId: number, { slotId, message }: CreateMeetingDto) {
    const slot = await this.prisma.availabilitySlot.findUnique({
      where: { id: slotId },
    });

    if (!slot) {
      throw new BadRequestException('Slot not found');
    }

    if (slot.booked) {
      throw new BadRequestException('Slot already booked');
    }

    const meeting = await this.prisma.meeting.create({
      data: {
        userId,
        docId: slot.docId,
        slotId: slot.id,
        startTime: slot.startTime,
        endTime: slot.endTime,
        status: MeetingStatus.pending,
        clientMessage: message,
      },
    });

    await this.prisma.availabilitySlot.update({
      where: { id: slot.id },
      data: { booked: true },
    });

    return meeting;
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
      where.startTime = { gte: now };
    } else if (scope === 'past') {
      where.startTime = { lt: now };
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
      where.startTime = { gte: now };
    } else if (scope === 'past') {
      where.startTime = { lt: now };
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
      throw new NotFoundException('Doc profile not found');
    }

    return this.getDocMeetings(docProfile.id, scope);
  }

  async cancelMeetingByDocUser(meetingId: number, userId: number) {
    const docProfile = await this.prisma.docProfile.findUnique({
      where: { docId: userId },
    });

    if (!docProfile) {
      throw new NotFoundException('Doc profile not found');
    }

    return this.cancelMeetingByDoc(meetingId, docProfile.id);
  }

  async cancelMeetingByUser(meetingId: number, userId: number) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
    });

    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    if (meeting.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to cancel this meeting',
      );
    }

    // 🔹 Limit czasowy dla klienta – min. 12h do startu

    const now = new Date();
    const diffMs = meeting.startTime.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 12) {
      throw new BadRequestException(
        'Cannot cancel a meeting less than 12 hours before it starts',
      );
    }

    return this.cancelMeeting(meeting, 'cancelled_by_user');
  }

  async cancelMeetingByDoc(meetingId: number, docProfileId: number) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
    });

    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    if (meeting.docId !== docProfileId) {
      throw new ForbiddenException(
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
      throw new BadRequestException(
        'Meeting cannot be cancelled - invalid status',
      );
    }

    // Check if meeting has already started or passed
    const now = new Date();
    if (meeting.startTime <= now) {
      throw new BadRequestException(
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

    // 🔹 2. Refund PO transakcji
    await this.paymentsService.refundPaymentForMeeting(
      meeting.id,
      cancelStatus,
    );

    // 🔹 3. Zwracamy zaktualizowany meeting
    return updatedMeeting;
  }
}

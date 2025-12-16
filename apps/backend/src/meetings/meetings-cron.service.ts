import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { MeetingStatus, PaymentProvider, PaymentStatus } from '@prisma/client';

@Injectable()
export class MeetingsCronService {
  private readonly logger = new Logger(MeetingsCronService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Runs every 5 minutes
  @Cron('*/5 * * * *')
  async markCompletedMeetings() {
    const now = new Date();

    this.logger.debug('Checking for completed meetings...');

    // Find confirmed meetings where slot already ended
    const meetingsToComplete = await this.prisma.meeting.findMany({
      where: {
        status: MeetingStatus.confirmed,
        slot: {
          endTime: {
            lte: now,
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (meetingsToComplete.length === 0) {
      return;
    }

    const ids = meetingsToComplete.map((m) => m.id);

    await this.prisma.meeting.updateMany({
      where: { id: { in: ids } },
      data: { status: MeetingStatus.completed },
    });

    this.logger.log(
      `Marked ${meetingsToComplete.length} meeting(s) as completed`,
    );
  }

  // Runs every 5 minutes – auto-cancel old pending meetings without payment
  @Cron('*/5 * * * *')
  async autoCancelUnpaidMeetings() {
    const now = new Date();
    const cutoff = new Date(now.getTime() - 15 * 60 * 1000); // 15 minut temu

    this.logger.debug('Checking for unpaid pending meetings to cancel...');

    const meetingsToCancel = await this.prisma.meeting.findMany({
      where: {
        status: MeetingStatus.pending,
        createdAt: { lte: cutoff },
      },
      select: {
        id: true,
        slotId: true,
      },
    });

    if (meetingsToCancel.length === 0) {
      return;
    }

    const ids = meetingsToCancel.map((m) => m.id);
    const slotIds = meetingsToCancel
      .map((m) => m.slotId)
      .filter((id): id is number => !!id);

    await this.prisma.$transaction(async (tx) => {
      await tx.meeting.updateMany({
        where: { id: { in: ids } },
        data: {
          status: MeetingStatus.cancelled_by_system,
        },
      });

      await tx.payment.updateMany({
        where: {
          meetingId: { in: ids },
          provider: PaymentProvider.p24,
          status: PaymentStatus.pending,
        },
        data: {
          status: PaymentStatus.failed,
        },
      });

      if (slotIds.length > 0) {
        await tx.availabilitySlot.updateMany({
          where: { id: { in: slotIds } },
          data: { booked: false },
        });
      }
    });

    this.logger.log(
      `Auto-cancelled ${meetingsToCancel.length} pending meeting(s) not paid within 15 minutes`,
    );
  }
}

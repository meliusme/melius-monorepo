import { Injectable, BadRequestException } from '@nestjs/common';
import { MeetingStatus, Role, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMeetingDto } from './dtos/create-meeting.dto';
@Injectable()
export class MeetingsService {
  constructor(private prisma: PrismaService) {}

  async createMeeting(userId: number, { slotId }: CreateMeetingDto) {
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
      },
    });

    await this.prisma.availabilitySlot.update({
      where: { id: slot.id },
      data: { booked: true },
    });

    return meeting;
  }

  async changeStatus(id: number, status: MeetingStatus, user: User) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id },
    });

    if (!meeting) {
      throw new BadRequestException('Meeting not found');
    }

    if (user.role === Role.admin) {
      return this.prisma.meeting.update({
        where: { id },
        data: { status },
      });
    }

    if (user.role === Role.user && meeting.userId !== user.id) {
      throw new BadRequestException('Cannot change a meeting you don’t own');
    }

    if (user.role === Role.doc && meeting.docId !== user.id) {
      throw new BadRequestException('Cannot change status of foreign meeting');
    }

    return this.prisma.meeting.update({
      where: { id },
      data: { status },
    });
  }

  async deleteMeeting(id: number, user: User) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id },
    });

    if (!meeting) {
      throw new BadRequestException('Meeting not found');
    }

    if (user.role === Role.admin) {
      return this.prisma.$transaction(async (tx) => {
        if (meeting.slotId) {
          await tx.availabilitySlot.update({
            where: { id: meeting.slotId },
            data: { booked: false },
          });
        }
        return tx.meeting.delete({ where: { id } });
      });
    }

    if (user.role === Role.user && meeting.userId !== user.id) {
      throw new BadRequestException('Cannot delete a meeting you don’t own');
    }

    if (user.role === Role.doc && meeting.docId !== user.id) {
      throw new BadRequestException('Cannot delete meeting of foreign doc');
    }

    return this.prisma.$transaction(async (tx) => {
      if (meeting.slotId) {
        await tx.availabilitySlot.update({
          where: { id: meeting.slotId },
          data: { booked: false },
        });
      }
      return tx.meeting.delete({ where: { id } });
    });
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMeetingDto } from './dtos/create-meeting.dto';
import { MeetingStatus } from '@prisma/client';

@Injectable()
export class MeetingsService {
  constructor(private prisma: PrismaService) {}

  createMeeting(createMeetingDto: CreateMeetingDto) {
    return this.prisma.meeting.create({
      data: {
        ...createMeetingDto,
        status: 'not_confirmed',
      },
    });
  }

  changeStatus(id: number, status: MeetingStatus) {
    return this.prisma.meeting.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
  }

  async deleteMeeting(id: number) {
    return await this.prisma.meeting.delete({
      where: {
        id,
      },
    });
  }
}

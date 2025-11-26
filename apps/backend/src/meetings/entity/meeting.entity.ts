import { Meeting, MeetingStatus } from '@prisma/client';
import { Exclude } from 'class-transformer';
import { IsEnum } from 'class-validator';

export class MeetingEntity implements Meeting {
  constructor(partial: Partial<MeetingEntity>) {
    Object.assign(this, partial);
  }
  @Exclude()
  id: number;

  @Exclude()
  startTime: Date;

  @Exclude()
  endTime: Date;

  @Exclude()
  userId: number;

  @Exclude()
  docId: number;

  @IsEnum(MeetingStatus)
  status: MeetingStatus;
}

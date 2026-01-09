import { MeetingStatus } from '@prisma/client';
import { Exclude } from 'class-transformer';
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MeetingEntity {
  constructor(partial: Partial<MeetingEntity>) {
    Object.assign(this, partial);
  }

  id: number;

  startTime: Date;

  endTime: Date;

  @Exclude()
  userId: number;

  @Exclude()
  docId: number;

  @IsEnum(MeetingStatus)
  @ApiProperty({ enum: MeetingStatus, enumName: 'MeetingStatus' })
  status: MeetingStatus;

  clientMessage: string | null;

  createdAt: Date;

  updatedAt: Date;
}

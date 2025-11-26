import { MeetingStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class ChangeStatusDto {
  @IsEnum(MeetingStatus)
  status: MeetingStatus;
}

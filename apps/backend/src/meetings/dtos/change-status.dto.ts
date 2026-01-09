import { MeetingStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangeStatusDto {
  @IsEnum(MeetingStatus)
  @ApiProperty({ enum: MeetingStatus, enumName: 'MeetingStatus' })
  status: MeetingStatus;
}

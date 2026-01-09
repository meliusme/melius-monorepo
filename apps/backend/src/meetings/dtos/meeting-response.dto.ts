import { ApiProperty } from '@nestjs/swagger';
import { MeetingStatus } from '@prisma/client';

export class MeetingResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ format: 'date-time' })
  startTime: Date;

  @ApiProperty({ format: 'date-time' })
  endTime: Date;

  @ApiProperty({ enum: MeetingStatus, enumName: 'MeetingStatus' })
  status: MeetingStatus;

  @ApiProperty({ nullable: true })
  clientMessage: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ format: 'date-time' })
  updatedAt: Date;
}

import { ApiProperty } from '@nestjs/swagger';
import { MeetingStatus } from '@prisma/client';

export class DocMeetingListItemDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ format: 'date-time' })
  startTime: string;

  @ApiProperty({ format: 'date-time' })
  endTime: string;

  @ApiProperty({ enum: MeetingStatus, enumName: 'MeetingStatus' })
  status: MeetingStatus;

  @ApiProperty()
  paid: boolean;

  @ApiProperty({ nullable: true })
  clientName: string | null;

  @ApiProperty({ nullable: true })
  clientMessage: string | null;
}

export class DocMeetingsListResponseDto {
  @ApiProperty({ type: () => [DocMeetingListItemDto] })
  items: DocMeetingListItemDto[];

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  total: number;
}

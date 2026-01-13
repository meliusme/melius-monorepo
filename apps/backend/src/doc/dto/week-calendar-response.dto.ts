import { ApiProperty } from '@nestjs/swagger';

class CalendarSlotDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '2026-01-13T09:00:00.000Z' })
  startTime: string;

  @ApiProperty({ example: '2026-01-13T10:00:00.000Z' })
  endTime: string;

  @ApiProperty({ example: false })
  booked: boolean;

  @ApiProperty({ example: 123, nullable: true })
  meetingId: number | null;
}

class CalendarMeetingDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 10, nullable: true })
  slotId: number | null;

  @ApiProperty({ example: '2026-01-13T09:00:00.000Z' })
  startTime: string;

  @ApiProperty({ example: '2026-01-13T10:00:00.000Z' })
  endTime: string;

  @ApiProperty({ example: 'confirmed' })
  status: string;

  @ApiProperty({ example: true })
  paid: boolean;

  @ApiProperty({ example: 'John Doe', nullable: true })
  clientName: string | null;

  @ApiProperty({ example: 'I have back pain', nullable: true })
  clientMessage: string | null;
}

class CalendarRangeDto {
  @ApiProperty({ example: '2026-01-13T00:00:00.000Z' })
  from: string;

  @ApiProperty({ example: '2026-01-20T00:00:00.000Z' })
  to: string;
}

export class WeekCalendarResponseDto {
  @ApiProperty({ type: CalendarRangeDto })
  range: CalendarRangeDto;

  @ApiProperty({ type: [CalendarSlotDto] })
  slots: CalendarSlotDto[];

  @ApiProperty({ type: [CalendarMeetingDto] })
  meetings: CalendarMeetingDto[];
}

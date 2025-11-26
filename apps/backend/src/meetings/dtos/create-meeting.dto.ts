import { IsNumber, IsISO8601 } from 'class-validator';

export class CreateMeetingDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  docId: number;

  @IsISO8601()
  startTime: string;
  @IsISO8601()
  endTime: string;
}

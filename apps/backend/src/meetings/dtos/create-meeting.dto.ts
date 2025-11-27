import { IsNumber } from 'class-validator';

export class CreateMeetingDto {
  @IsNumber()
  slotId: number;
}

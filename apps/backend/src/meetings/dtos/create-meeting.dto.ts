import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateMeetingDto {
  @IsNumber()
  slotId: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  clientMessage?: string;
}

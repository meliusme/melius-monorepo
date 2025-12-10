import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateCheckoutSessionDto {
  @IsInt()
  @IsNotEmpty()
  meetingId: number;
}

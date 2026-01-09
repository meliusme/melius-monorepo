import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateCheckoutSessionDto {
  @ApiProperty({ type: 'integer' })
  @IsInt()
  @IsNotEmpty()
  meetingId: number;
}

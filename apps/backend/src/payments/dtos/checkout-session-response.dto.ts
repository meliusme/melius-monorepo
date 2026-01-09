import { ApiProperty } from '@nestjs/swagger';

export class CheckoutSessionResponseDto {
  @ApiProperty()
  url: string;

  @ApiProperty()
  sessionId: string;
}

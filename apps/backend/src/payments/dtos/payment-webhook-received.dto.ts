import { ApiProperty } from '@nestjs/swagger';

export class PaymentWebhookReceivedDto {
  @ApiProperty()
  received: boolean;
}

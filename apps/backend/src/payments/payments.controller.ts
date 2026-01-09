import {
  Controller,
  Post,
  Req,
  HttpCode,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { Request } from 'express';
import { Role, User } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { CurrentUser } from 'src/decorators/user.decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import { CreateCheckoutSessionDto } from './dtos/create-checkout-session.dto';
import { CheckoutSessionResponseDto } from './dtos/checkout-session-response.dto';
import { P24StartResponseDto } from './dtos/p24-start-response.dto';
import { PaymentWebhookReceivedDto } from './dtos/payment-webhook-received.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('webhook')
  @HttpCode(200)
  @ApiOkResponse({ type: PaymentWebhookReceivedDto })
  async handleStripeWebhook(@Req() req: Request) {
    const sig = req.headers['stripe-signature'];

    if (!sig) {
      // Not from Stripe, so do nothing.
      return;
    }

    // We get raw body thanks to bodyParser.raw in main.ts.
    const rawBody = (req as any).body as Buffer;

    await this.paymentsService.handleStripeWebhook(rawBody, sig as string);

    return { received: true };
  }

  @Post('checkout')
  @Roles(Role.user)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(200)
  @ApiOkResponse({ type: CheckoutSessionResponseDto })
  async createCheckoutSession(
    @CurrentUser() user: User,
    @Body() dto: CreateCheckoutSessionDto,
  ): Promise<CheckoutSessionResponseDto> {
    const result = await this.paymentsService.createCheckoutSessionForMeeting(
      user.id,
      dto.meetingId,
    );

    return result; // { url, sessionId }
  }

  @Post('p24/start')
  @Roles(Role.user)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(200)
  @ApiOkResponse({ type: P24StartResponseDto })
  async startP24(
    @CurrentUser() user: User,
    @Body() dto: CreateCheckoutSessionDto,
  ): Promise<P24StartResponseDto> {
    return this.paymentsService.startP24PaymentForMeeting(
      user.id,
      dto.meetingId,
    );
    // -> { url, token, sessionId }
  }

  @Post('p24/webhook')
  @HttpCode(200)
  @ApiOkResponse({ type: PaymentWebhookReceivedDto })
  async handleP24Webhook(@Body() body: any) {
    // P24 has no stripe-signature, so normal JSON body is fine.
    await this.paymentsService.handleP24Webhook(body);
    return { received: true };
  }
}

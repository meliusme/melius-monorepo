import {
  Controller,
  Post,
  Req,
  HttpCode,
  Body,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Request } from 'express';
import { Role, User } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { CurrentUser } from 'src/decorators/user.decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import { CreateCheckoutSessionDto } from './dtos/create-checkout-session.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('webhook')
  @HttpCode(200)
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
  async createCheckoutSession(
    @CurrentUser() user: User,
    @Body() dto: CreateCheckoutSessionDto,
  ) {
    const result = await this.paymentsService.createCheckoutSessionForMeeting(
      user.id,
      dto.meetingId,
    );

    return result; // { url, sessionId }
  }

  @Post('p24/start')
  @Roles(Role.user)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async startP24(
    @CurrentUser() user: User,
    @Body() dto: CreateCheckoutSessionDto,
  ) {
    return this.paymentsService.startP24PaymentForMeeting(
      user.id,
      dto.meetingId,
    );
    // -> { url, token, sessionId }
  }

  @Post('p24/webhook')
  @HttpCode(200)
  async handleP24Webhook(@Body() body: any) {
    // P24 has no stripe-signature, so normal JSON body is fine.
    await this.paymentsService.handleP24Webhook(body);
    return { received: true };
  }
}

import { Body, Controller, Patch, Post } from '@nestjs/common';
import { EmailService } from './email.service';
import { ConfirmEmailDto } from './dtos/confirm-email.dto';
import { EmailDto } from './dtos/email.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('confirm')
  async confirmEmail(@Body() confirmEmailDto: ConfirmEmailDto) {
    const email = await this.emailService.decodeConfirmationToken(
      confirmEmailDto.token,
    );
    await this.emailService.confirmEmail(email);
  }

  @Post('resend-confirm')
  async resendConfirmationMail(@Body() resendEmailDto: EmailDto) {
    await this.emailService.resendConfirmationLink(resendEmailDto.email);
  }

  @Post('password')
  async sendPasswordLink(@Body() emailDto: EmailDto) {
    await this.emailService.sendPasswordLink(emailDto.email);
  }

  @Patch('password-change')
  async changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    await this.emailService.changePassword(changePasswordDto);
  }
}

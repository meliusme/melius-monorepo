import { Body, Controller, Patch, Post, Req, Res, HttpCode } from '@nestjs/common';
import { Response, Request } from 'express';
import { ApiOkResponse } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from './email.service';
import { ConfirmEmailDto } from './dtos/confirm-email.dto';
import { EmailDto } from './dtos/email.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { AuthService } from '../auth/auth.service';
import { setAuthCookies } from '../auth/utils/auth.utils';
import { AuthResponseDto } from '../auth/dto/auth-response.dto';
import { OkResponseDto } from '../common/dtos/ok-response.dto';

@Controller('email')
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  @Post('confirm')
  @HttpCode(200)
  @ApiOkResponse({ type: AuthResponseDto })
  async confirmEmail(
    @Req() req: Request,
    @Body() confirmEmailDto: ConfirmEmailDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const email = await this.emailService.decodeConfirmationToken(
      confirmEmailDto.token,
    );

    await this.emailService.confirmEmail(email);

    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, role: true },
    });

    // Sanity check (confirmEmail should throw, but keep it safe).
    if (!user) return;

    const meta = { userAgent: req.headers['user-agent'], ip: req.ip };
    const issued = await this.authService.issueSession(user.id, meta);
    setAuthCookies(res, issued);
    return { role: user.role, userId: user.id };
  }

  @Post('resend-confirm')
  @HttpCode(200)
  @ApiOkResponse({ type: OkResponseDto })
  async resendConfirmationMail(@Body() resendEmailDto: EmailDto) {
    await this.emailService.resendConfirmationLink(resendEmailDto.email);
    return { ok: true };
  }

  @Post('password')
  @HttpCode(200)
  @ApiOkResponse({ type: OkResponseDto })
  async sendPasswordLink(@Body() emailDto: EmailDto) {
    await this.emailService.sendPasswordLink(emailDto.email);
    return { ok: true };
  }

  @Patch('password-change')
  @HttpCode(200)
  @ApiOkResponse({ type: OkResponseDto })
  async changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    await this.emailService.changePassword(changePasswordDto);
    return { ok: true };
  }
}

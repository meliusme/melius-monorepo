import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcrypt';
import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import ConfirmationTokenPayload from './interfaces/confirmation-token-payload.interface';
import { Language } from '@prisma/client';
import { I18nService } from 'nestjs-i18n';
import { PrismaService } from '../prisma/prisma.service';
import { I18nTranslations } from '../generated/i18n.generated';
import { ChangePasswordDto } from './dtos/change-password.dto';

export const roundsOfHashing = 10;
const TOKEN_COOLDOWN_PERIOD = 10 * 60 * 1000; // 10 minutes

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly jwtService: JwtService,
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly prisma: PrismaService,
  ) {}

  private createToken(email: string): string {
    const payload: ConfirmationTokenPayload = { email };
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '10m',
    });
  }

  private getCommonContext(lang: Language) {
    const header = this.i18n.t('test.welcome', {
      lang,
    });
    const rights = this.i18n.t('test.allRightsReserved', { lang });
    const dontAnswer = this.i18n.t('test.dontAnswer', { lang });
    const year = new Date().getFullYear();

    return { header, rights, dontAnswer, year };
  }

  private async canSendNewToken(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new BadRequestException(
        this.i18n.t('test.exceptions.emailNotFound'),
      );
    }
    const now = new Date();
    const cooldownEnd = new Date(
      user.tokenActivatedAt.getTime() + TOKEN_COOLDOWN_PERIOD,
    );
    return now > cooldownEnd;
  }

  private async updateTokenTimestamp(email: string): Promise<void> {
    await this.prisma.user.update({
      where: { email },
      data: { tokenActivatedAt: new Date() },
    });
  }

  async sendConfirmationEmail(email: string, lang: Language) {
    if (!(await this.canSendNewToken(email))) {
      throw new BadRequestException(
        this.i18n.t('test.exceptions.tokenCooldown'),
      );
    }

    const token = this.createToken(email);
    await this.updateTokenTimestamp(email);

    const text = this.i18n.t('test.welcomeAndConfirm', {
      lang,
    });

    const url = `${process.env.CLIENT_URL}/email?token=${token}`;
    const confirm = this.i18n.t('test.confirmRegister', { lang });

    await this.mailerService.sendMail({
      to: email,
      subject: confirm,
      template: './register',
      context: {
        lang,
        text,
        url,
        confirm,
        ...this.getCommonContext(lang),
      },
    });
  }

  async sendPasswordLink(email: string) {
    if (!(await this.canSendNewToken(email))) {
      throw new BadRequestException(
        this.i18n.t('test.exceptions.tokenCooldown'),
      );
    }
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return;
    }

    const lang = user.language;
    const token = this.createToken(email);
    await this.updateTokenTimestamp(email);

    const text = this.i18n.t('test.welcomeAndChange', {
      lang,
    });

    const url = `${process.env.CLIENT_URL}/password?token=${token}`;
    const confirm = this.i18n.t('test.changePassword', { lang });

    await this.mailerService.sendMail({
      to: email,
      subject: confirm,
      template: './register',
      context: {
        lang,
        text,
        url,
        confirm,
        ...this.getCommonContext(lang),
      },
    });
  }

  async confirmEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user.emailConfirmed)
      throw new BadRequestException(
        this.i18n.t('test.exceptions.emailAlreadyConfirmed'),
      );

    await this.prisma.user.update({
      where: { email },
      data: {
        emailConfirmed: true,
      },
    });
  }

  async decodeConfirmationToken(token: string): Promise<string> {
    try {
      const payload = await this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      if (typeof payload === 'object' && 'email' in payload) {
        return payload.email;
      }
      throw new BadRequestException();
    } catch (error) {
      if (error?.name === 'TokenExpiredError') {
        throw new BadRequestException(
          this.i18n.t('test.exceptions.emailTokenExpired'),
        );
      }
      throw new BadRequestException('Bad confirmation token');
    }
  }

  async resendConfirmationLink(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException(
        this.i18n.t('test.exceptions.emailNotFound'),
      );
    }

    if (user.emailConfirmed) {
      throw new BadRequestException(
        this.i18n.t('test.exceptions.emailAlreadyConfirmed'),
      );
    }
    await this.sendConfirmationEmail(user.email, user.language);
  }

  async changePassword(changePasswordDto: ChangePasswordDto) {
    const email = await this.decodeConfirmationToken(changePasswordDto.token);
    if (changePasswordDto.password) {
      changePasswordDto.password = await bcrypt.hash(
        changePasswordDto.password,
        roundsOfHashing,
      );

      return this.prisma.user.update({
        where: { email },
        data: { password: changePasswordDto.password },
      });
    }
  }
}

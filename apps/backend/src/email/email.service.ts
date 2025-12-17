import * as bcrypt from 'bcrypt';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Resend } from 'resend';
import ConfirmationTokenPayload from './interfaces/confirmation-token-payload.interface';
import { Language } from '@prisma/client';
import { I18nService } from 'nestjs-i18n';
import { PrismaService } from '../prisma/prisma.service';
import { I18nTranslations } from '../generated/i18n.generated';
import { ChangePasswordDto } from './dtos/change-password.dto';

export const roundsOfHashing = 10;
// const TOKEN_COOLDOWN_PERIOD = 10 * 60 * 1000; // 10 minutes
const TOKEN_COOLDOWN_PERIOD = 10 * 1000; // 10 seconds for testing

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend | null = null;
  constructor(
    private readonly jwtService: JwtService,
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly prisma: PrismaService,
  ) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      this.logger.error('RESEND_API_KEY is not set');
      this.resend = null;
    } else {
      this.resend = new Resend(apiKey);
    }
  }

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

    // 🔹 jeśli user nie istnieje — pozwalamy (np. przy pierwszej rejestracji)
    if (!user) {
      return true;
    }

    // 🔹 jeśli e-mail już potwierdzony — nie wysyłamy
    if (user.emailConfirmed) {
      return false;
    }

    // 🔹 jeśli jeszcze nigdy nie wysłano tokena — pozwalamy
    if (!user.tokenActivatedAt) {
      return true;
    }

    // 🔹 cooldown logic
    const now = Date.now();
    const lastSent = user.tokenActivatedAt.getTime();
    const diff = now - lastSent;

    return diff > TOKEN_COOLDOWN_PERIOD;
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
    const subject = this.i18n.t('test.subjectConfirm', { lang });
    const preview = this.i18n.t('test.previewConfirm', { lang });

    const common = this.getCommonContext(lang);
    const fromEmail =
      process.env.RESEND_FROM_EMAIL ?? 'no-reply@melius-app.com';
    const fromName = process.env.RESEND_FROM_NAME ?? 'Melius';
    const templateId = process.env.RESEND_REGISTER_TEMPLATE_ALIAS;

    if (!this.resend) {
      this.logger.error('Resend client is not initialized');
      return;
    }

    if (!templateId) {
      this.logger.error('RESEND_REGISTER_TEMPLATE_ALIAS is not set');
      return;
    }

    try {
      await this.resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: email,
        subject,
        template: {
          id: templateId,
          variables: {
            lang,
            text,
            url,
            confirm,
            preview,
            ...common,
          },
        },
      });

      this.logger.log(
        `Confirmation email sent to ${email} via Resend template`,
      );
    } catch (error) {
      this.logger.error(
        `Error sending confirmation email to ${email}`,
        (error as any).toString(),
      );
    }
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
    const subject = this.i18n.t('test.subjectChange', { lang });
    const preview = this.i18n.t('test.previewChange', { lang });

    const common = this.getCommonContext(lang);
    const fromEmail =
      process.env.RESEND_FROM_EMAIL ?? 'no-reply@melius-app.com';
    const fromName = process.env.RESEND_FROM_NAME ?? 'Melius';
    const templateId = process.env.RESEND_REGISTER_TEMPLATE_ALIAS;

    if (!this.resend) {
      this.logger.error('Resend client is not initialized');
      return;
    }

    if (!templateId) {
      this.logger.error('RESEND_REGISTER_TEMPLATE_ALIAS is not set');
      return;
    }

    try {
      await this.resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: email,
        subject,
        template: {
          id: templateId,
          variables: {
            lang,
            text,
            url,
            confirm,
            preview,
            ...common,
          },
        },
      });
      this.logger.log(
        `Password reset email sent to ${email} via Resend template`,
      );
    } catch (error) {
      this.logger.error(
        `Error sending password reset email to ${email}`,
        (error as any).toString(),
      );
    }
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

  async sendMeetingConfirmedClient(params: {
    to: string;
    lang: Language;
    clientName: string;
    docName: string;
    startTime: Date;
    pricePln: number;
  }) {
    const { to, lang, clientName, docName, startTime, pricePln } = params;

    const formattedTime = startTime.toLocaleString(
      lang === 'pl' ? 'pl-PL' : 'en-US',
    );

    const subject = this.i18n.t('test.meetingConfirmedClientSubject', { lang });
    const preview = this.i18n.t('test.meetingConfirmedClientPreview', { lang });
    const text = this.i18n.t('test.meetingConfirmedClientText', {
      lang,
      args: { docName },
    });
    const details = this.i18n.t('test.meetingConfirmedClientDetails', {
      lang,
      args: { startTime: formattedTime },
    });
    const price = this.i18n.t('test.meetingConfirmedClientPrice', {
      lang,
      args: { pricePln },
    });

    const common = this.getCommonContext(lang);
    const fromEmail =
      process.env.RESEND_FROM_EMAIL ?? 'no-reply@melius-app.com';
    const fromName = process.env.RESEND_FROM_NAME ?? 'Melius';
    const templateId = process.env.RESEND_MEETING_TEMPLATE_ALIAS;

    if (!this.resend) {
      this.logger.error('Resend client is not initialized');
      return;
    }

    if (!templateId) {
      this.logger.error('RESEND_MEETING_TEMPLATE_ALIAS is not set');
      return;
    }

    try {
      await this.resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to,
        subject,
        template: {
          id: templateId,
          variables: {
            lang,
            text,
            details,
            price,
            preview,
            clientName,
            ...common,
          },
        },
      });

      this.logger.log(`Meeting confirmed email sent to client ${to}`);
    } catch (error) {
      this.logger.error(
        `Error sending meeting confirmed email to client ${to}`,
        (error as any).toString(),
      );
    }
  }

  async sendMeetingConfirmedDoc(params: {
    to: string;
    lang: Language;
    docName: string;
    clientName: string;
    startTime: Date;
    clientMessage?: string;
  }) {
    const { to, lang, docName, clientName, startTime, clientMessage } = params;

    const formattedTime = startTime.toLocaleString(
      lang === 'pl' ? 'pl-PL' : 'en-US',
    );

    const subject = this.i18n.t('test.meetingConfirmedDocSubject', { lang });
    const preview = this.i18n.t('test.meetingConfirmedDocPreview', { lang });
    const text = this.i18n.t('test.meetingConfirmedDocText', {
      lang,
      args: { clientName },
    });
    const details = this.i18n.t('test.meetingConfirmedDocDetails', {
      lang,
      args: { startTime: formattedTime },
    });
    const message = clientMessage
      ? this.i18n.t('test.meetingConfirmedDocMessage', {
          lang,
          args: { clientMessage },
        })
      : '';

    const common = this.getCommonContext(lang);
    const fromEmail =
      process.env.RESEND_FROM_EMAIL ?? 'no-reply@melius-app.com';
    const fromName = process.env.RESEND_FROM_NAME ?? 'Melius';
    const templateId = process.env.RESEND_MEETING_TEMPLATE_ALIAS;

    if (!this.resend) {
      this.logger.error('Resend client is not initialized');
      return;
    }

    if (!templateId) {
      this.logger.error('RESEND_MEETING_TEMPLATE_ALIAS is not set');
      return;
    }

    try {
      await this.resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to,
        subject,
        template: {
          id: templateId,
          variables: {
            lang,
            text,
            details,
            message,
            preview,
            docName,
            ...common,
          },
        },
      });

      this.logger.log(`Meeting confirmed email sent to doc ${to}`);
    } catch (error) {
      this.logger.error(
        `Error sending meeting confirmed email to doc ${to}`,
        (error as any).toString(),
      );
    }
  }

  async sendMeetingCancelled(params: {
    to: string;
    lang: Language;
    recipientName: string;
    otherPartyName: string;
    startTime: Date;
    cancelledBy: 'user' | 'doc' | 'system';
  }) {
    const { to, lang, recipientName, otherPartyName, startTime, cancelledBy } =
      params;

    const formattedTime = startTime.toLocaleString(
      lang === 'pl' ? 'pl-PL' : 'en-US',
    );

    const subject = this.i18n.t('test.meetingCancelledSubject', { lang });
    const preview = this.i18n.t('test.meetingCancelledPreview', { lang });
    const text = this.i18n.t('test.meetingCancelledText', {
      lang,
      args: { recipientName },
    });
    const details = this.i18n.t('test.meetingCancelledDetails', {
      lang,
      args: {
        otherPartyName,
        startTime: formattedTime,
      },
    });

    const cancelledByMap = {
      user: this.i18n.t('test.meetingCancelledByUser', { lang }),
      doc: this.i18n.t('test.meetingCancelledByDoc', { lang }),
      system: this.i18n.t('test.meetingCancelledBySystem', { lang }),
    };
    const cancelledByText = cancelledByMap[cancelledBy];

    const common = this.getCommonContext(lang);
    const fromEmail =
      process.env.RESEND_FROM_EMAIL ?? 'no-reply@melius-app.com';
    const fromName = process.env.RESEND_FROM_NAME ?? 'Melius';
    const templateId = process.env.RESEND_MEETING_TEMPLATE_ALIAS;

    if (!this.resend) {
      this.logger.error('Resend client is not initialized');
      return;
    }

    if (!templateId) {
      this.logger.error('RESEND_MEETING_TEMPLATE_ALIAS is not set');
      return;
    }

    try {
      await this.resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to,
        subject,
        template: {
          id: templateId,
          variables: {
            lang,
            text,
            details,
            cancelledByText,
            preview,
            recipientName,
            ...common,
          },
        },
      });

      this.logger.log(`Meeting cancelled email sent to ${to}`);
    } catch (error) {
      this.logger.error(
        `Error sending meeting cancelled email to ${to}`,
        (error as any).toString(),
      );
    }
  }
}

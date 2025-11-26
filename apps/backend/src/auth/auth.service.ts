import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { I18nService } from 'nestjs-i18n';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from './../prisma/prisma.service';
import { AuthEntity } from './entity/auth.entity';
import { I18nTranslations } from '../generated/i18n.generated';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private i18n: I18nService<I18nTranslations>,
  ) {}

  async login(email: string, password: string): Promise<AuthEntity> {
    const user = await this.prisma.user.findUnique({ where: { email: email } });

    if (user && !user.emailConfirmed)
      throw new ConflictException(
        this.i18n.t('test.exceptions.emailNotConfirmed'),
      );

    if (!user) {
      throw new NotFoundException(this.i18n.t('test.exceptions.invalidEmail'));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        this.i18n.t('test.exceptions.invalidPassword'),
      );
    }

    return {
      access_token: this.jwtService.sign({ userId: user.id }),
      user,
    };
  }
}

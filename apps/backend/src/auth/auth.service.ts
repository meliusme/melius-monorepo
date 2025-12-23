import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { randomBytes, createHash } from 'crypto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from './../prisma/prisma.service';
import { AuthEntity } from './entity/auth.entity';
import { throwAppError } from '../common/errors/throw-app-error';
import { ErrorCode } from '../common/errors/error-codes';

const ACCESS_SEC = Number(process.env.JWT_SECRET_TIME ?? 900); // 15 min default
const REFRESH_SEC = Number(process.env.JWT_REFRESH_SECRET_TIME ?? 604800); // 7d default

function genRefreshToken() {
  return randomBytes(64).toString('base64url');
}
function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly MAX_SESSIONS_PER_USER = Number(
    process.env.MAX_SESSIONS_PER_USER ?? 5,
  );

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private issueAccessToken(userId: number) {
    return this.jwtService.sign(
      { userId },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: ACCESS_SEC,
      },
    );
  }

  async issueSession(
    userId: number,
    meta?: { userAgent?: string; ip?: string },
  ) {
    // Sprawdź liczbę aktywnych sesji i usuń najstarsze jeśli będzie przekroczony limit po dodaniu nowej
    const activeTokens = await this.prisma.refreshToken.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'asc' },
      select: { id: true, createdAt: true },
    });

    // Jeśli po dodaniu nowej sesji przekroczymy limit, revoke najstarsze
    const toRevoke = activeTokens.length - this.MAX_SESSIONS_PER_USER + 1;
    if (toRevoke > 0) {
      const idsToRevoke = activeTokens.slice(0, toRevoke).map((t) => t.id);
      await this.prisma.refreshToken.updateMany({
        where: { id: { in: idsToRevoke } },
        data: { revokedAt: new Date() },
      });
      this.logger.log(
        `Revoked ${toRevoke} oldest session(s) for user ${userId} (max sessions: ${this.MAX_SESSIONS_PER_USER})`,
      );
    }

    const accessToken = this.issueAccessToken(userId);

    const refreshToken = genRefreshToken();
    const refreshHash = hashToken(refreshToken);

    const now = Date.now();
    const accessExpMs = now + ACCESS_SEC * 1000;
    const refreshExpMs = now + REFRESH_SEC * 1000;

    const rt = await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: refreshHash,
        expiresAt: new Date(refreshExpMs),
        userAgent: meta?.userAgent,
        ip: meta?.ip,
      },
      select: { id: true },
    });

    return {
      accessToken,
      refreshToken,
      accessExpMs,
      refreshExpMs,
      refreshTokenId: rt.id,
    };
  }

  async revokeRefreshToken(refreshTokenRaw: string) {
    const tokenHash = hashToken(refreshTokenRaw);

    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async refreshSession(
    refreshTokenRaw: string,
    meta?: { userAgent?: string; ip?: string },
  ) {
    const refreshHash = hashToken(refreshTokenRaw);

    const existing = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: refreshHash },
      select: { id: true, userId: true, revokedAt: true, expiresAt: true },
    });

    if (!existing) {
      throwAppError(
        ErrorCode.REFRESH_INVALID,
        HttpStatus.UNAUTHORIZED,
        'Invalid refresh token',
      );
    }

    // reuse detection: ktoś próbuje użyć już unieważnionego refresh
    if (existing.revokedAt) {
      await this.prisma.refreshToken.updateMany({
        where: { userId: existing.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throwAppError(
        ErrorCode.REFRESH_REUSED,
        HttpStatus.UNAUTHORIZED,
        'Refresh token reuse detected',
      );
    }

    if (existing.expiresAt.getTime() <= Date.now()) {
      await this.prisma.refreshToken.update({
        where: { id: existing.id },
        data: { revokedAt: new Date() },
      });
      throwAppError(
        ErrorCode.REFRESH_EXPIRED,
        HttpStatus.UNAUTHORIZED,
        'Refresh token expired',
      );
    }

    // rotacja: wydaj nowy refresh + access, oznacz stary jako revoked + replacedBy
    const issued = await this.issueSession(existing.userId, meta);

    await this.prisma.refreshToken.update({
      where: { id: existing.id },
      data: { revokedAt: new Date(), replacedByTokenId: issued.refreshTokenId },
    });

    return issued;
  }

  async login(
    email: string,
    password: string,
    meta?: { userAgent?: string; ip?: string },
  ): Promise<AuthEntity> {
    const user = await this.prisma.user.findUnique({ where: { email: email } });

    // Sprawdzamy emailConfirmed osobno, bo to inna sytuacja
    if (user && !user.emailConfirmed)
      throwAppError(
        ErrorCode.EMAIL_NOT_CONFIRMED,
        HttpStatus.FORBIDDEN,
        'Email not confirmed',
      );

    // Zunifikowany błąd - nie leakujemy czy email istnieje
    const isPasswordValid = user
      ? await bcrypt.compare(password, user.password)
      : false;

    if (!user || !isPasswordValid) {
      throwAppError(
        ErrorCode.INVALID_CREDENTIALS,
        HttpStatus.UNAUTHORIZED,
        'Invalid email or password',
      );
    }

    const issued = await this.issueSession(user.id, meta);
    return { user, issued };
  }

  async registerLight(
    email: string,
    firstName?: string,
    lastName?: string,
    meta?: { userAgent?: string; ip?: string },
  ): Promise<AuthEntity> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        role: true,
        emailConfirmed: true,
        userProfile: true,
      },
    });

    if (existingUser) {
      // Jeśli to "pełne" konto (ma potwierdzony email) → nie logujemy po samym mailu
      if (existingUser.emailConfirmed) {
        throwAppError(
          ErrorCode.EMAIL_EXISTS,
          HttpStatus.CONFLICT,
          'Email already exists',
        );
      }

      // Jeśli to "lekki" user z poprzedniego register-light:
      // możemy uzupełnić mu profil (o ile przyszły dane)
      if (existingUser.userProfile) {
        const dataToUpdate: {
          firstName?: string | null;
          lastName?: string | null;
        } = {};

        if (firstName) {
          dataToUpdate.firstName = firstName.trim();
        }

        if (lastName) {
          dataToUpdate.lastName = lastName.trim();
        }

        if (Object.keys(dataToUpdate).length > 0) {
          await this.prisma.userProfile.update({
            where: { userId: existingUser.id },
            data: dataToUpdate,
          });
        }
      }

      // I tak go logujemy – to dalej "light" konto, bez hasła
      const issued = await this.issueSession(existingUser.id, meta);
      return { user: existingUser, issued };
    }

    // Nowy email → tworzymy "light" usera
    const tempPassword = await bcrypt.hash(
      Math.random().toString(36).slice(-8),
      10,
    );

    const user = await this.prisma.user.create({
      data: {
        email,
        password: tempPassword,
      },
    });

    await this.prisma.userProfile.create({
      data: {
        userId: user.id,
        firstName: firstName?.trim() || null,
        lastName: lastName?.trim() || null,
      },
    });

    const issued = await this.issueSession(user.id, meta);
    return { user, issued };
  }

  async setPassword(
    userId: number,
    password: string,
    meta?: { userAgent?: string; ip?: string },
  ): Promise<AuthEntity> {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        emailConfirmed: true,
        tokenActivatedAt: new Date(),
      },
    });

    const issued = await this.issueSession(user.id, meta);
    return { user, issued };
  }
}

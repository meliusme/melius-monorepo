import * as bcrypt from 'bcrypt';
import { HttpStatus, Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { v4 as uuid } from 'uuid';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ImageService } from '../image/image.service';
import { EmailService } from '../email/email.service';
import { throwAppError } from '../common/errors/throw-app-error';
import { ErrorCode } from '../common/errors/error-codes';

export const roundsOfHashing = 10;

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private imageService: ImageService,
    private emailService: EmailService,
  ) {}

  async createProfile(
    id: number,
    role: Role,
    consents?: {
      consentTerms: boolean;
      consentAdult: boolean;
      consentHealthData: boolean;
    },
  ) {
    switch (role) {
      case Role.user:
        return await this.prisma.userProfile.create({
          data: {
            userId: id,
            consentTerms: consents?.consentTerms ?? false,
            consentAdult: consents?.consentAdult ?? false,
            consentHealthData: consents?.consentHealthData ?? false,
          },
        });
      case Role.doc:
        return await this.prisma.docProfile.create({
          data: {
            docId: id,
          },
        });
      case Role.admin:
        return await this.prisma.adminProfile.create({
          data: {
            userId: id,
          },
        });
      default:
        throwAppError(
          ErrorCode.MEETING_NOT_FOUND,
          HttpStatus.BAD_REQUEST,
          'Invalid role provided',
        );
    }
  }

  async deleteProfile(id: number, role: Role) {
    switch (role) {
      case Role.user:
        return await this.prisma.userProfile.delete({
          where: {
            userId: id,
          },
        });
      case Role.doc:
        return await this.prisma.docProfile.delete({
          where: {
            docId: id,
          },
        });
      case Role.admin:
        return await this.prisma.adminProfile.delete({
          where: {
            userId: id,
          },
        });
      default:
        throw new Error('Invalid role provided');
    }
  }

  async create(createUserDto: CreateUserDto) {
    const role = createUserDto.role ?? Role.user;
    if (
      role === Role.user &&
      (!createUserDto.consentTerms ||
        !createUserDto.consentAdult ||
        !createUserDto.consentHealthData)
    ) {
      throwAppError(
        ErrorCode.CONSENT_REQUIRED,
        HttpStatus.BAD_REQUEST,
        'Required consents not accepted',
      );
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throwAppError(
        ErrorCode.EMAIL_EXISTS,
        HttpStatus.CONFLICT,
        'Email already exists',
      );
    }

    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      roundsOfHashing,
    );

    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
        role,
        language: createUserDto.language,
      },
    });

    await this.createProfile(user.id, user.role, {
      consentTerms: createUserDto.consentTerms ?? false,
      consentAdult: createUserDto.consentAdult ?? false,
      consentHealthData: createUserDto.consentHealthData ?? false,
    });

    await this.emailService.sendConfirmationEmail(user.email, user.language);

    return user;
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password,
        roundsOfHashing,
      );
    }

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { role: true },
    });

    if (!user) {
      throwAppError(
        ErrorCode.EMAIL_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'User not found',
      );
    }
    await this.deleteAvatar(id);
    await this.deleteProfile(id, user.role);

    return await this.prisma.user.delete({ where: { id } });
  }

  async addAvatar(userId: number, imageBuffer: Buffer, mimetype?: string) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    const maxBytes = 2 * 1024 * 1024;

    if (!mimetype || !allowed.includes(mimetype)) {
      throwAppError(
        ErrorCode.INVALID_FILE_TYPE,
        HttpStatus.BAD_REQUEST,
        'Invalid avatar mimetype',
      );
    }

    if (imageBuffer.length > maxBytes) {
      throwAppError(
        ErrorCode.FILE_TOO_LARGE,
        HttpStatus.BAD_REQUEST,
        'Avatar too large',
      );
    }

    const existing = await this.prisma.avatar.findUnique({
      where: { userId },
      select: { id: true, key: true },
    });

    const key = `avatars/users/${userId}/${uuid()}.webp`;

    const normalized = await this.imageService.normalizeAvatar(imageBuffer);

    const uploaded = await this.imageService.uploadObject({
      key,
      body: normalized,
      contentType: 'image/webp',
      cacheControl: 'public, max-age=604800',
    });

    const avatar = await this.prisma.avatar.upsert({
      where: { userId },
      create: {
        userId,
        key: uploaded.key,
        url: uploaded.url, // may be '' if S3_PUBLIC_BASE_URL is not set
      },
      update: {
        key: uploaded.key,
        url: uploaded.url,
      },
    });

    // Best-effort delete of the old file (after upsert).
    if (existing?.key) {
      this.imageService.deleteObject(existing.key).catch(() => {});
    }

    return avatar;
  }

  async deleteAvatar(userId: number) {
    const existing = await this.prisma.avatar.findUnique({
      where: { userId },
      select: { id: true, key: true },
    });

    if (!existing) return;

    // Best-effort delete of the file.
    await this.imageService.deleteObject(existing.key).catch(() => {});

    // Delete the DB record.
    await this.prisma.avatar.delete({
      where: { userId },
    });
  }
}

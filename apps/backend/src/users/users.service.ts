import * as bcrypt from 'bcrypt';
import { ConflictException, Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { I18nService } from 'nestjs-i18n';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ImageService } from '../image/image.service';
import { EmailService } from '../email/email.service';
import { I18nTranslations } from '../generated/i18n.generated';

export const roundsOfHashing = 10;

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private imageService: ImageService,
    private emailService: EmailService,
    private i18n: I18nService<I18nTranslations>,
  ) {}

  async createProfile(id: number, role: Role) {
    switch (role) {
      case Role.user:
        return await this.prisma.userProfile.create({
          data: {
            userId: id,
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
        throw new Error('Invalid role provided');
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
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException(this.i18n.t('test.exceptions.emailExist'));
    }

    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      roundsOfHashing,
    );

    createUserDto.password = hashedPassword;

    const user = await this.prisma.user.create({
      data: createUserDto,
    });

    await this.createProfile(user.id, user.role);

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
      throw new Error('User not found');
    }
    await this.deleteAvatar(id);
    await this.deleteProfile(id, user.role);

    return await this.prisma.user.delete({ where: { id } });
  }

  async addAvatar(userId: number, imageBuffer: Buffer, filename: string) {
    const addedAvatar = await this.prisma.avatar.findUnique({
      where: {
        userId,
      },
    });

    if (addedAvatar) {
      await this.imageService.deleteImageFromS3(addedAvatar.id);
    }

    const avatar = await this.imageService.uploadImageToS3(
      userId,
      imageBuffer,
      filename,
    );

    return avatar;
  }

  async deleteAvatar(userId: number) {
    const addedAvatar = await this.prisma.avatar.findUnique({
      where: {
        userId,
      },
    });

    if (addedAvatar) {
      await this.imageService.deleteImageFromS3(addedAvatar.id);
    }
  }
}

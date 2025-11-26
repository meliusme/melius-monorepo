import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { Role } from '@prisma/client';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron('0 0 * * *')
  async handleCleanUsers() {
    this.logger.debug('Running daily user cleanup');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const unconfirmedUsers = await this.prisma.user.findMany({
      where: {
        createdAt: {
          lt: yesterday,
        },
        emailConfirmed: false,
      },
    });

    const unconfirmedIds = unconfirmedUsers.map(({ id }) => id);

    const userIds = unconfirmedUsers
      .filter(({ role }) => role === Role.user)
      .map(({ id }) => id);
    const docIds = unconfirmedUsers
      .filter(({ role }) => role === Role.doc)
      .map(({ id }) => id);
    const adminIds = unconfirmedUsers
      .filter(({ role }) => role === Role.admin)
      .map(({ id }) => id);

    await this.prisma.$transaction(async (prisma) => {
      if (userIds.length > 0) {
        await prisma.userProfile.deleteMany({
          where: {
            userId: { in: userIds },
          },
        });
      }

      if (docIds.length > 0) {
        await prisma.docProfile.deleteMany({
          where: {
            docId: { in: docIds },
          },
        });
      }

      if (adminIds.length > 0) {
        await prisma.adminProfile.deleteMany({
          where: {
            userId: { in: adminIds },
          },
        });
      }

      if (unconfirmedIds.length > 0) {
        await prisma.user.deleteMany({
          where: {
            id: { in: unconfirmedIds },
          },
        });
      }
    });

    this.logger.debug(`Deleted ${unconfirmedUsers.length} unconfirmed users`);
  }
}

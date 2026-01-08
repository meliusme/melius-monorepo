import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthCleanupService {
  private readonly logger = new Logger(AuthCleanupService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Cleanup expired refresh tokens - daily at 03:00.
  @Cron('0 3 * * *')
  async cleanupExpiredTokens() {
    try {
      const result = await this.prisma.refreshToken.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: new Date() } },
            {
              revokedAt: {
                lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              },
            }, // revoked > 30 days ago
          ],
        },
      });
      this.logger.log(`Cleaned up ${result.count} expired/old refresh tokens`);
    } catch (error) {
      this.logger.error('Failed to cleanup expired tokens', error);
    }
  }
}

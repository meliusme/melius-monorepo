import { Module } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { AvailabilityController } from './availability.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [AvailabilityController],
  providers: [AvailabilityService, PrismaService],
})
export class AvailabilityModule {}

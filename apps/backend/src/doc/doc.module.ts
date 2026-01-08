import { Module } from '@nestjs/common';
import { DocController } from './doc.controller';
import { DocService } from './doc.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [DocController],
  providers: [DocService, PrismaService],
  exports: [DocService],
})
export class DocModule {}

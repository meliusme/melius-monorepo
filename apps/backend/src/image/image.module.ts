import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ImageService],
  exports: [ImageService],
})
export class ImageModule {}

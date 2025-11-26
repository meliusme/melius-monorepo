import { MiddlewareConsumer, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UserMiddleware } from '../middlewares/user.middleware';
import { ImageModule } from '../image/image.module';
import { EmailModule } from '../email/email.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [PrismaModule, ImageModule, EmailModule],
  exports: [UsersService],
})
export class UsersModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserMiddleware).forRoutes('*');
  }
}

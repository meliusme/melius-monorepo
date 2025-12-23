import { Module, forwardRef } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailEventsListener } from './email-events.listener';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [JwtModule, PrismaModule, forwardRef(() => AuthModule)],
  controllers: [EmailController],
  providers: [EmailService, EmailEventsListener],
  exports: [EmailService],
})
export class EmailModule {}

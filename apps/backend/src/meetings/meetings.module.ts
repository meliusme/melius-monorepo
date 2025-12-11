import { Module } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { MeetingsCronService } from './meetings-cron.service';
import { MeetingsController } from './meetings.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PaymentsModule } from 'src/payments/payments.module';

@Module({
  imports: [PrismaModule, PaymentsModule],
  controllers: [MeetingsController],
  providers: [MeetingsService, MeetingsCronService],
})
export class MeetingsModule {}

import { Module } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ProfilesModule } from '../profiles/profiles.module';

@Module({
  imports: [PrismaModule, ProfilesModule],
  controllers: [MatchesController],
  providers: [MatchesService],
})
export class MatchesModule {}

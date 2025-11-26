import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { I18nModule, QueryResolver } from 'nestjs-i18n';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { ProfilesModule } from './profiles/profiles.module';
import { MeetingsModule } from './meetings/meetings.module';
import { MatchesModule } from './matches/matches.module';
import { join } from 'path';
import { CleanupService } from './cleanup/cleanup.service';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env`,
    }),
    AuthModule,
    UsersModule,
    ProfilesModule,
    MeetingsModule,
    MatchesModule,
    ScheduleModule.forRoot(),
    I18nModule.forRoot({
      fallbackLanguage: 'pl',
      viewEngine: 'hbs',
      loaderOptions: {
        path: join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [{ use: QueryResolver, options: ['lang'] }],
      typesOutputPath: join('./src/generated/i18n.generated.ts'),
    }),
  ],
  controllers: [AppController],
  providers: [AppService, CleanupService, PrismaService],
})
export class AppModule {}

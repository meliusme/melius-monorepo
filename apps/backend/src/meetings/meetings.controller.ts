import {
  Get,
  Query,
  Post,
  Body,
  Param,
  UseGuards,
  Controller,
  ParseIntPipe,
} from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { RolesGuard } from 'src/guards/roles.guard';
import { Role, User } from '@prisma/client';
import { CreateMeetingDto } from './dtos/create-meeting.dto';
import { GetMeetingsQueryDto } from './dtos/get-meetings-query.dto';
import { Roles } from '../decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/user.decorator';
import { MeetingEntity } from './entity/meeting.entity';

@Controller('meetings')
export class MeetingsController {
  constructor(private meetingsService: MeetingsService) {}

  @Post()
  @Roles(Role.user)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async createMeeting(
    @CurrentUser() user: User,
    @Body() createMeetingDto: CreateMeetingDto,
  ) {
    return new MeetingEntity(
      await this.meetingsService.createMeeting(user.id, createMeetingDto),
    );
  }

  @Get('me')
  @Roles(Role.user)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getMyMeetings(
    @CurrentUser() user: User,
    @Query() query: GetMeetingsQueryDto,
  ) {
    const meetings = await this.meetingsService.getUserMeetings(
      user.id,
      query.scope,
    );

    return meetings.map((m) => new MeetingEntity(m));
  }

  @Get('doc/me')
  @Roles(Role.doc)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getMyDocMeetings(
    @CurrentUser() user: User,
    @Query() query: GetMeetingsQueryDto,
  ) {
    const meetings = await this.meetingsService.getDocMeetingsForUser(
      user.id,
      query.scope,
    );

    return meetings.map((m) => new MeetingEntity(m));
  }

  @Post(':id/cancel')
  @Roles(Role.user)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async cancelMyMeeting(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const meeting = await this.meetingsService.cancelMeetingByUser(id, user.id);
    return new MeetingEntity(meeting);
  }

  @Post('doc/:id/cancel')
  @Roles(Role.doc)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async cancelAsDoc(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const meeting = await this.meetingsService.cancelMeetingByDocUser(
      id,
      user.id,
    );
    return new MeetingEntity(meeting);
  }
}

import {
  Get,
  Query,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Controller,
  ParseIntPipe,
} from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { RolesGuard } from 'src/guards/roles.guard';
import { Role, User } from '@prisma/client';
import { CreateMeetingDto } from './dtos/create-meeting.dto';
import { Roles } from '../decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/user.decorator';
import { ChangeStatusDto } from './dtos/change-status.dto';
import { MeetingEntity } from './entity/meeting.entity';

@Controller('meetings')
export class MeetingsController {
  constructor(private meetingsService: MeetingsService) {}

  @Post()
  @Roles(Role.user)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
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
    @Query('scope') scope: 'upcoming' | 'past' | 'all' = 'upcoming',
  ) {
    const meetings = await this.meetingsService.getUserMeetings(user.id, scope);

    return meetings.map((m) => new MeetingEntity(m));
  }

  @Get('doc/me')
  @Roles(Role.doc)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getMyDocMeetings(
    @CurrentUser() user: User,
    @Query('scope') scope: 'upcoming' | 'past' | 'all' = 'upcoming',
  ) {
    const docProfile = await this.meetingsService.getDocProfileForUser(user.id);

    if (!docProfile) {
      throw new Error('Doc profile not found');
    }

    const meetings = await this.meetingsService.getDocMeetings(
      docProfile.id,
      scope,
    );

    return meetings.map((m) => new MeetingEntity(m));
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async changeStatus(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() changeStatusDto: ChangeStatusDto,
  ) {
    return new MeetingEntity(
      await this.meetingsService.changeStatus(id, changeStatusDto.status, user),
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteMeeting(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return new MeetingEntity(
      await this.meetingsService.deleteMeeting(id, user),
    );
  }
}

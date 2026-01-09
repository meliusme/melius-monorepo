import {
  Get,
  Query,
  Post,
  Body,
  Param,
  UseGuards,
  Controller,
  ParseIntPipe,
  HttpCode,
} from '@nestjs/common';
import { ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { MeetingsService } from './meetings.service';
import { RolesGuard } from 'src/guards/roles.guard';
import { Role, User } from '@prisma/client';
import { CreateMeetingDto } from './dtos/create-meeting.dto';
import { GetMeetingsQueryDto } from './dtos/get-meetings-query.dto';
import { Roles } from '../decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/user.decorator';
import { DocMeetingsListResponseDto } from './dtos/doc-meetings-list-response.dto';
import { MeetingResponseDto } from './dtos/meeting-response.dto';
import { toMeetingResponse } from './meetings.mapper';

@Controller('meetings')
export class MeetingsController {
  constructor(private meetingsService: MeetingsService) {}

  @Post()
  @Roles(Role.user)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiCreatedResponse({ type: MeetingResponseDto })
  async createMeeting(
    @CurrentUser() user: User,
    @Body() createMeetingDto: CreateMeetingDto,
  ) {
    return toMeetingResponse(
      await this.meetingsService.createMeeting(user.id, createMeetingDto),
    );
  }

  @Get('me')
  @Roles(Role.user)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOkResponse({ type: MeetingResponseDto, isArray: true })
  async getMyMeetings(
    @CurrentUser() user: User,
    @Query() query: GetMeetingsQueryDto,
  ) {
    const meetings = await this.meetingsService.getUserMeetings(
      user.id,
      query.scope,
    );

    return meetings.map((m) => toMeetingResponse(m));
  }

  @Get('doc')
  @Roles(Role.doc)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOkResponse({ type: DocMeetingsListResponseDto })
  async getDocMeetingsList(
    @CurrentUser() user: User,
    @Query('scope') scope?: 'today' | 'upcoming' | 'past' | 'cancelled',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<DocMeetingsListResponseDto> {
    return this.meetingsService.getDocMeetingsListForUser(
      user.id,
      scope ?? 'today',
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
  }

  @Post(':id/cancel')
  @Roles(Role.user)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(200)
  @ApiOkResponse({ type: MeetingResponseDto })
  async cancelMyMeeting(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const meeting = await this.meetingsService.cancelMeetingByUser(id, user.id);
    return toMeetingResponse(meeting);
  }

  @Post('doc/:id/cancel')
  @Roles(Role.doc)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(200)
  @ApiOkResponse({ type: MeetingResponseDto })
  async cancelAsDoc(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const meeting = await this.meetingsService.cancelMeetingByDocUser(
      id,
      user.id,
    );
    return toMeetingResponse(meeting);
  }
}

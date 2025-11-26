import {
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Controller,
  ParseIntPipe,
  UnauthorizedException,
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
    if (user.id !== createMeetingDto.userId) {
      throw new UnauthorizedException();
    }
    return new MeetingEntity(
      await this.meetingsService.createMeeting(createMeetingDto),
    );
  }

  // temp solution
  @Patch(':id')
  async changeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() changeStatusDto: ChangeStatusDto,
  ) {
    return new MeetingEntity(
      await this.meetingsService.changeStatus(id, changeStatusDto.status),
    );
  }

  @Delete(':id')
  async deleteMeeting(@Param('id', ParseIntPipe) id: number) {
    return new MeetingEntity(await this.meetingsService.deleteMeeting(id));
  }
}

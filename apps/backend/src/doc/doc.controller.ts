import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/user.decorator';
import { Role, User } from '@prisma/client';
import { DocService } from './doc.service';

@Controller('doc')
@Roles(Role.doc)
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocController {
  constructor(private readonly docService: DocService) {}

  @Get('calendar/week')
  getWeekCalendar(
    @CurrentUser() user: User,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.docService.getWeekCalendar(user.id, from, to);
  }
}

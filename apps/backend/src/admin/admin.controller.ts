import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '@prisma/client';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.admin)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('docs/:docProfileId/approve')
  @HttpCode(HttpStatus.OK)
  approveDoc(@Param('docProfileId') docProfileId: string) {
    return this.adminService.approveDocProfile(Number(docProfileId));
  }

  @Post('docs/:docProfileId/reject')
  @HttpCode(HttpStatus.OK)
  rejectDoc(
    @Param('docProfileId') docProfileId: string,
    @Body() body: { reason: string },
  ) {
    return this.adminService.rejectDocProfile(
      Number(docProfileId),
      body.reason,
    );
  }
}

import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '@prisma/client';
import { AdminService } from './admin.service';
import { DocService } from '../doc/doc.service';
import { RejectDocDto } from './dto/reject-doc.dto';
import { DocumentUrlResponseDto } from './dto/document-url-response.dto';
import { OkResponseDto } from '../common/dtos/ok-response.dto';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.admin)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly docService: DocService,
  ) {}

  @Get('documents/:id/url')
  @ApiOkResponse({ type: DocumentUrlResponseDto })
  getDocumentUrl(@Param('id', ParseIntPipe) id: number) {
    return this.docService.getVerificationDocumentUrl(id);
  }

  @Post('docs/:docProfileId/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: OkResponseDto })
  approveDoc(@Param('docProfileId', ParseIntPipe) docProfileId: number) {
    return this.adminService.approveDocProfile(docProfileId);
  }

  @Post('docs/:docProfileId/reject')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: RejectDocDto })
  @ApiOkResponse({ type: OkResponseDto })
  rejectDoc(
    @Param('docProfileId', ParseIntPipe) docProfileId: number,
    @Body() body: RejectDocDto,
  ) {
    if (!body?.reason?.trim()) {
      throw new BadRequestException('reason is required');
    }
    return this.adminService.rejectDocProfile(docProfileId, body.reason);
  }
}

import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOkResponse, ApiConsumes, ApiBody, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/user.decorator';
import { Role, User } from '@prisma/client';
import { DocService } from './doc.service';
import { VerificationDocumentResponseDto } from './dto/verification-document-response.dto';
import { OkResponseDto } from '../common/dtos/ok-response.dto';
import { WeekCalendarResponseDto } from './dto/week-calendar-response.dto';

@ApiTags('doc')
@Controller('doc')
@Roles(Role.doc)
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocController {
  constructor(private readonly docService: DocService) {}

  @Get('calendar/week')
  @ApiOkResponse({ type: WeekCalendarResponseDto })
  getWeekCalendar(
    @CurrentUser() user: User,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.docService.getWeekCalendar(user.id, from, to);
  }

  @Post('verification-documents')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'PDF, JPG or PNG file (max 10MB)',
        },
      },
    },
  })
  @ApiOkResponse({ type: VerificationDocumentResponseDto })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  uploadVerificationDocument(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.docService.uploadVerificationDocument(user.id, file);
  }

  @Get('verification-documents')
  @ApiOkResponse({ type: VerificationDocumentResponseDto, isArray: true })
  listVerificationDocuments(@CurrentUser() user: User) {
    return this.docService.listVerificationDocuments(user.id);
  }

  @Delete('verification-documents/:id')
  @ApiOkResponse({ type: OkResponseDto })
  deleteVerificationDocument(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.docService.deleteVerificationDocument(user.id, id);
  }
}

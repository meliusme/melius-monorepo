import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  UseGuards,
  Param,
  ParseIntPipe,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { CurrentUser } from '../decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Role, User } from '@prisma/client';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UpdateUserProfileDto } from './dtos/update-user-profile.dto';
import { UpdateDocProfileDto } from './dtos/update-doc-profile.dto';
import { UpdateAdminProfileDto } from './dtos/update-admin-profile.dto';
import { RatingService } from '../rating/rating.service';
import { CreateDocRateDto } from '../rating/dto/create-doc-rate.dto';
import { DocRatingsResponseDto } from '../rating/dto/doc-ratings-response.dto';
import { UserProfileResponseDto } from './dtos/user-profile-response.dto';
import { DocProfileResponseDto } from './dtos/doc-profile-response.dto';
import { UserWithProfileResponseDto } from './dtos/user-with-profile-response.dto';
import { DocWithProfileResponseDto } from './dtos/doc-with-profile-response.dto';
import { AdminProfileResponseDto } from './dtos/admin-profile-response.dto';
import {
  toAdminProfileResponse,
  toDocProfileResponse,
  toDocWithProfileResponse,
  toUserProfileResponse,
  toUserWithProfileResponse,
} from './profiles.mapper';

@Controller('profiles')
export class ProfilesController {
  constructor(
    private readonly profilesService: ProfilesService,
    private ratingService: RatingService,
  ) {}

  @Roles(Role.user)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put('user')
  @ApiOkResponse({ type: UserProfileResponseDto })
  async updateUserProfile(
    @CurrentUser() user: User,
    @Body() body: UpdateUserProfileDto,
  ) {
    return toUserProfileResponse(
      await this.profilesService.updateUserProfile(user.id, body),
    );
  }

  @Roles(Role.doc)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put('doc')
  @ApiOkResponse({ type: DocProfileResponseDto })
  async updateDocProfile(
    @CurrentUser() user: User,
    @Body() body: UpdateDocProfileDto,
  ) {
    return toDocProfileResponse(
      await this.profilesService.updateDocProfile(user.id, body),
    );
  }

  @Roles(Role.doc)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('doc/submit')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: DocProfileResponseDto })
  async submitDocProfile(@CurrentUser() user: User) {
    return toDocProfileResponse(
      await this.profilesService.submitDocProfile(user.id),
    );
  }

  @Roles(Role.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AdminProfileResponseDto })
  async updateAdminProfile(
    @CurrentUser() user: User,
    @Body() body: UpdateAdminProfileDto,
  ) {
    const profile = await this.profilesService.updateAdminProfile(user.id, body);
    return toAdminProfileResponse(profile);
  }

  @Roles(Role.user)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('user')
  @ApiOkResponse({ type: UserWithProfileResponseDto })
  async getUserProfile(@CurrentUser() user: User) {
    return toUserWithProfileResponse(
      await this.profilesService.getUserProfile(user.id),
    );
  }

  @Roles(Role.doc)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('doc')
  @ApiOkResponse({ type: DocWithProfileResponseDto })
  async getDocProfile(@CurrentUser() user: User) {
    return toDocWithProfileResponse(
      await this.profilesService.getDocProfile(user.id),
    );
  }

  @Roles(Role.user)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('rate')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: DocProfileResponseDto })
  async addDocRate(
    @CurrentUser() user: User,
    @Body() createDocRateDto: CreateDocRateDto,
  ) {
    const updatedDocProfile = await this.ratingService.addDocRate(
      user,
      createDocRateDto,
    );

    return toDocProfileResponse(updatedDocProfile);
  }

  @Get('doc/:docId/ratings')
  @ApiOkResponse({ type: DocRatingsResponseDto })
  async getDocRatings(
    @Param('docId', ParseIntPipe) docId: number,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ): Promise<DocRatingsResponseDto> {
    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 10;

    const result = await this.ratingService.getDocRatings(
      docId,
      pageNumber,
      limitNumber,
    );
    return result;
  }
}

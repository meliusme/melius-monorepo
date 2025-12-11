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
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { CurrentUser } from '../decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Role, User } from '@prisma/client';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UpdateUserProfileDto } from './dtos/update-user-profile.dto';
import { UpdateDocProfileDto } from './dtos/update-doc-profile.dto';
import { UpdateAdminProfileDto } from './dtos/update-admin-profile.dto';
import { UserProfileEntity } from './entities/user-profile.entity';
import { DocProfileEntity } from './entities/doc-profile.entity';
import { UserWithProfileEntity } from './entities/user-with-profile.entity';
import { DocWithProfileEntity } from './entities/doc-with-profile.entity';
import { RatingService } from '../rating/rating.service';
import { CreateDocRateDto } from '../rating/dto/create-doc-rate.dto';

@Controller('profiles')
export class ProfilesController {
  constructor(
    private readonly profilesService: ProfilesService,
    private ratingService: RatingService,
  ) {}

  @Roles(Role.user)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('user')
  async updateUserProfile(
    @CurrentUser() user: User,
    @Body() body: UpdateUserProfileDto,
  ) {
    return new UserProfileEntity(
      await this.profilesService.updateUserProfile(user.id, body),
    );
  }

  @Roles(Role.doc)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put('doc')
  async updateDocProfile(
    @CurrentUser() user: User,
    @Body() body: UpdateDocProfileDto,
  ) {
    return new DocProfileEntity(
      await this.profilesService.updateDocProfile(user.id, body),
    );
  }

  @Roles(Role.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('admin')
  async updateAdminProfile(
    @CurrentUser() user: User,
    @Body() body: UpdateAdminProfileDto,
  ) {
    return await this.profilesService.updateAdminProfile(user.id, body);
  }

  @Roles(Role.user)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('user')
  async getUserProfile(@CurrentUser() user: User) {
    return new UserWithProfileEntity(
      await this.profilesService.getUserProfile(user.id),
    );
  }

  @Roles(Role.doc)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('doc')
  async getDocProfile(@CurrentUser() user: User) {
    return new DocWithProfileEntity(
      await this.profilesService.getDocProfile(user.id),
    );
  }

  @Get('new')
  async getNewDocsProfiles() {
    const docsProfiles = await this.profilesService.getNewDocsProfiles();
    return docsProfiles.map((p) => new DocWithProfileEntity(p));
  }

  @Get('best')
  async getBestDocsProfiles() {
    const docsProfiles = await this.profilesService.getBestDocsProfiles();
    return docsProfiles.map((p) => new DocWithProfileEntity(p));
  }

  @Roles(Role.user)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('rate')
  async addDocRate(
    @CurrentUser() user: User,
    @Body() createDocRateDto: CreateDocRateDto,
  ) {
    const updatedDocProfile = await this.ratingService.addDocRate(
      user,
      createDocRateDto,
    );

    return new DocProfileEntity(updatedDocProfile);
  }

  @Get('doc/:docId/ratings')
  async getDocRatings(
    @Param('docId', ParseIntPipe) docId: number,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 10;

    const result = await this.ratingService.getDocRatings(
      docId,
      pageNumber,
      limitNumber,
    );
  }
}

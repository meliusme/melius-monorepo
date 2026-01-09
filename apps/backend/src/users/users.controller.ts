import {
  Get,
  Req,
  Res,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Controller,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
  ConflictException,
  UnauthorizedException,
  HttpCode,
} from '@nestjs/common';
import { ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { Role, User } from '@prisma/client';
import { UsersService } from './users.service';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { CurrentUser } from '../decorators/user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OkResponseDto } from '../common/dtos/ok-response.dto';
import { UserResponseDto } from './dtos/user-response.dto';
import { AvatarResponseDto } from './dtos/avatar-response.dto';
import { toAvatarResponse, toUserResponse } from './users.mapper';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiCreatedResponse({ type: UserResponseDto })
  async create(@Body() createUserDto: CreateUserDto) {
    if (!(createUserDto.role in Role)) {
      throw new ConflictException('Invalid role provided');
    }
    return toUserResponse(await this.usersService.create(createUserDto));
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: UserResponseDto })
  async me(@CurrentUser() user: User) {
    return toUserResponse(user);
  }

  @Get()
  @Roles(Role.admin)
  @UseGuards(JwtAuthGuard)
  @UseGuards(RolesGuard)
  @ApiOkResponse({ type: UserResponseDto, isArray: true })
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map((user) => toUserResponse(user));
  }

  @Get(':id')
  @Roles(Role.admin)
  @UseGuards(JwtAuthGuard)
  @UseGuards(RolesGuard)
  @ApiOkResponse({ type: UserResponseDto })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return toUserResponse(await this.usersService.findOne(id));
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: UserResponseDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: Request,
  ) {
    const user = req.user as User;
    if (user.id !== id) {
      throw new UnauthorizedException(
        'You are not authorized to update this user',
      );
    }
    return toUserResponse(await this.usersService.update(id, updateUserDto));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user as User;
    if (user.id !== id) {
      throw new UnauthorizedException(
        'You are not authorized to delete this user',
      );
    }

    const deletedUser = await this.usersService.remove(id);

    if (deletedUser)
      res.cookie('access_token', '', { expires: new Date(Date.now()) });

    return 'Account deleted';
  }

  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    }),
  )
  @ApiOkResponse({ type: AvatarResponseDto })
  async addAvatar(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const avatar = await this.usersService.addAvatar(
      user.id,
      file.buffer,
      file.mimetype,
    );
    return toAvatarResponse(avatar);
  }

  @Delete('avatar/:userId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOkResponse({ type: OkResponseDto })
  async deleteAvatar(
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() user: User,
  ) {
    if (user.id !== userId) {
      throw new UnauthorizedException();
    }
    await this.usersService.deleteAvatar(userId);
    return { ok: true };
  }
}

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
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Role, User } from '@prisma/client';
import { UsersService } from './users.service';
import { RolesGuard } from '../guards/roles.guard';
import { UserEntity } from './entities/user.entity';
import { Roles } from '../decorators/roles.decorator';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { AvatarEntity } from './entities/avatar.entity';
import { CurrentUser } from '../decorators/user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    if (!(createUserDto.role in Role)) {
      throw new ConflictException('Invalid role provided');
    }
    return new UserEntity(await this.usersService.create(createUserDto));
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: User) {
    return new UserEntity(user);
  }

  @Get()
  @Roles(Role.admin)
  @UseGuards(JwtAuthGuard)
  @UseGuards(RolesGuard)
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map((user) => new UserEntity(user));
  }

  @Get(':id')
  @Roles(Role.admin)
  @UseGuards(JwtAuthGuard)
  @UseGuards(RolesGuard)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return new UserEntity(await this.usersService.findOne(id));
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
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
    return new UserEntity(await this.usersService.update(id, updateUserDto));
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

    const deletedUser = new UserEntity(await this.usersService.remove(id));

    if (deletedUser)
      res.cookie('access_token', '', { expires: new Date(Date.now()) });

    return 'Account deleted';
  }

  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async addAvatar(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const avatar = await this.usersService.addAvatar(
      user.id,
      file.buffer,
      file.originalname,
    );
    return new AvatarEntity(avatar);
  }

  @Delete('avatar/:userId')
  @UseGuards(JwtAuthGuard)
  async deleteAvatar(
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() user: User,
  ) {
    if (user.id !== userId) {
      throw new UnauthorizedException();
    }
    return this.usersService.deleteAvatar(userId);
  }
}

import { Body, Controller, Post, Res, Get, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { LoginDto } from './dto/login.dto';
import { RegisterLightDto } from './dto/register-light.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from 'src/decorators/user.decorator';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const { email, password } = loginDto;
    const { access_token, user } = await this.authService.login(
      email,
      password,
    );

    res.cookie('isAuth', true, {
      sameSite: 'lax',
      expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    });
    res
      .cookie('access_token', access_token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      })
      .send({ role: user.role, userId: user.id });
  }

  @Post('/register-light')
  async registerLight(
    @Body() dto: RegisterLightDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const { access_token, user } = await this.authService.registerLight(
      dto.email,
      dto.firstName,
      dto.lastName,
    );
    res.cookie('isAuth', true, {
      sameSite: 'lax',
      expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    });
    res
      .cookie('access_token', access_token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      })
      .send({ role: user.role, userId: user.id });
  }

  @Post('/set-password')
  @UseGuards(JwtAuthGuard)
  async setPassword(
    @CurrentUser() user: User,
    @Body() dto: SetPasswordDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const { access_token, user: updatedUser } =
      await this.authService.setPassword(user.id, dto.password);

    res.cookie('isAuth', true, {
      sameSite: 'lax',
      expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    });
    res
      .cookie('access_token', access_token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      })
      .send({ role: updatedUser.role, userId: updatedUser.id });
  }

  @Get('/logout')
  async logout(@Res({ passthrough: true }) res: Response): Promise<string> {
    res.cookie('access_token', '', { expires: new Date(Date.now()) });
    res.cookie('isAuth', false, { expires: new Date(Date.now()) });
    return 'Logout success';
  }
}

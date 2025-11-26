import { Body, Controller, Post, Res, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { LoginDto } from './dto/login.dto';

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

  @Get('/logout')
  async logout(@Res({ passthrough: true }) res: Response): Promise<string> {
    res.cookie('access_token', '', { expires: new Date(Date.now()) });
    res.cookie('is_auth', false, { expires: new Date(Date.now()) });
    return 'Logout success';
  }
}

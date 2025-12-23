import {
  Body,
  Controller,
  Post,
  Res,
  Req,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { User } from '@prisma/client';
import { SkipThrottle, Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { RegisterLightDto } from './dto/register-light.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from 'src/decorators/user.decorator';
import { setAuthCookies, clearAuthCookies } from './utils/auth.utils';
import { throwAppError } from 'src/common/errors/throw-app-error';
import { ErrorCode } from 'src/common/errors/error-codes';

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 5, ttl: 900 } })
  @Post('/login')
  async login(
    @Req() req: Request,
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const meta = { userAgent: req.headers['user-agent'], ip: req.ip };

    const { email, password } = loginDto;
    const { user, issued } = await this.authService.login(
      email,
      password,
      meta,
    );

    setAuthCookies(res, issued);
    res.send({ role: user.role, userId: user.id });
  }

  @Throttle({ default: { limit: 5, ttl: 900 } })
  @Post('/register-light')
  async registerLight(
    @Req() req: Request,
    @Body() dto: RegisterLightDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const meta = { userAgent: req.headers['user-agent'], ip: req.ip };

    const { user, issued } = await this.authService.registerLight(
      dto.email,
      dto.firstName,
      dto.lastName,
      meta,
    );

    setAuthCookies(res, issued);
    res.send({ role: user.role, userId: user.id });
  }

  @Throttle({ default: { limit: 3, ttl: 900 } })
  @Post('/set-password')
  @UseGuards(JwtAuthGuard)
  async setPassword(
    @Req() req: Request,
    @CurrentUser() user: User,
    @Body() dto: SetPasswordDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const meta = { userAgent: req.headers['user-agent'], ip: req.ip };

    const { user: updatedUser, issued } = await this.authService.setPassword(
      user.id,
      dto.password,
      meta,
    );

    setAuthCookies(res, issued);
    res.send({ role: updatedUser.role, userId: updatedUser.id });
  }

  @Post('/refresh')
  @SkipThrottle()
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      throwAppError(
        ErrorCode.REFRESH_MISSING,
        HttpStatus.UNAUTHORIZED,
        'Missing refresh token',
      );
    }

    const meta = { userAgent: req.headers['user-agent'], ip: req.ip };

    const issued = await this.authService.refreshSession(refreshToken, meta);
    setAuthCookies(res, issued);

    return { ok: true };
  }

  @Post('/logout')
  @SkipThrottle()
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refresh_token;
    if (refreshToken) {
      await this.authService.revokeRefreshToken(refreshToken);
    }
    clearAuthCookies(res);
    return { ok: true };
  }
}

import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UsersService } from '../users/users.service';

@Injectable()
export class UserMiddleware implements NestMiddleware {
  constructor(private usersService: UsersService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const accessToken = req.cookies?.access_token;
    if (accessToken) {
      try {
        const [, base64Payload] = accessToken.split('.');
        const payload = JSON.parse(
          Buffer.from(base64Payload, 'base64').toString(),
        );
        const userId = payload.userId;

        if (userId) {
          const user = await this.usersService.findOne(userId);
          if (user) {
            req.user = user;
          } else {
            throw new UnauthorizedException('Invalid user ID');
          }
        } else {
          throw new UnauthorizedException('User ID missing in JWT payload');
        }
      } catch (error) {
        throw new UnauthorizedException('Invalid access token');
      }
    }

    next();
  }
}

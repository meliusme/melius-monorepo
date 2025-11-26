import { User } from '@prisma/client';

export class AuthEntity {
  access_token: string;
  user: User;
}

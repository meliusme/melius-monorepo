import { User } from '@prisma/client';

export type IssuedSession = {
  accessToken: string;
  refreshToken: string;
  accessExpMs: number;
  refreshExpMs: number;
  refreshTokenId: number;
};

export type AuthUser = Pick<User, 'id' | 'role'>;

export type AuthEntity = {
  user: AuthUser;
  issued: IssuedSession;
};

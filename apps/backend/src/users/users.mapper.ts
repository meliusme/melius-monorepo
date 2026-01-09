import { Avatar, User } from '@prisma/client';
import { AvatarResponseDto } from './dtos/avatar-response.dto';
import { UserResponseDto } from './dtos/user-response.dto';

export const toUserResponse = (user: User): UserResponseDto => ({
  id: user.id,
  role: user.role,
  email: user.email,
});

export const toAvatarResponse = (
  avatar: Avatar | null,
): AvatarResponseDto | null => (avatar ? { url: avatar.url } : null);

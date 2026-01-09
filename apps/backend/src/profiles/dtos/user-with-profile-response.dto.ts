import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AvatarResponseDto } from '../../users/dtos/avatar-response.dto';
import { UserProfileResponseDto } from './user-profile-response.dto';
import { Type } from 'class-transformer';

export class UserWithProfileResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ enum: Role, enumName: 'Role' })
  role: Role;

  @ApiProperty()
  email: string;

  @ApiProperty({ type: () => AvatarResponseDto, nullable: true })
  @Type(() => AvatarResponseDto)
  avatar: AvatarResponseDto | null;

  @ApiProperty({ type: () => UserProfileResponseDto })
  @Type(() => UserProfileResponseDto)
  userProfile: UserProfileResponseDto;
}

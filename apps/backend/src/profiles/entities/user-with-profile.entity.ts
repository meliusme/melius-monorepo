import { Expose, Type } from 'class-transformer';
import { UserEntity } from '../../users/entities/user.entity';
import { AvatarEntity } from '../../users/entities/avatar.entity';
import { UserProfileEntity } from './user-profile.entity';

export class UserWithProfileEntity extends UserEntity {
  @Expose()
  @Type(() => AvatarEntity)
  avatar: AvatarEntity;
  @Expose()
  @Type(() => UserProfileEntity)
  userProfile: UserProfileEntity;
}

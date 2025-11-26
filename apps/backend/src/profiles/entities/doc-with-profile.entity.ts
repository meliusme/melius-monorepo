import { Expose, Type } from 'class-transformer';
import { UserEntity } from '../../users/entities/user.entity';
import { AvatarEntity } from '../../users/entities/avatar.entity';
import { DocProfileEntity } from './doc-profile.entity';

export class DocWithProfileEntity extends UserEntity {
  @Expose()
  @Type(() => AvatarEntity)
  avatar: AvatarEntity;
  @Expose()
  @Type(() => DocProfileEntity)
  docProfile: DocProfileEntity;
}

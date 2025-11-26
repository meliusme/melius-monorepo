import { Avatar } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class AvatarEntity implements Avatar {
  constructor(partial: Partial<AvatarEntity>) {
    Object.assign(this, partial);
  }

  url: string;

  @Exclude()
  id: number;
  @Exclude()
  key: string;
  @Exclude()
  docId: number;
  @Exclude()
  userId: number;
}

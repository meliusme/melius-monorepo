import { Language, Role, User } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserEntity implements User {
  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
  role: Role;

  id: number;

  @Exclude()
  createdAt: Date;
  @Exclude()
  updatedAt: Date;

  email: string;

  @Exclude()
  password: string;

  @Exclude()
  language: Language;

  @Exclude()
  emailConfirmed: boolean;

  @Exclude()
  tokenActivatedAt: Date;
}

import { Language, Role, User } from '@prisma/client';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UserEntity implements User {
  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
  @ApiProperty({ enum: Role, enumName: 'Role' })
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
  @ApiProperty({ enum: Language, enumName: 'Language' })
  language: Language;

  @Exclude()
  emailConfirmed: boolean;

  @Exclude()
  tokenActivatedAt: Date;
}

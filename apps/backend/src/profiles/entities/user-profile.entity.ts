import { UserProfile } from '@prisma/client';
import { Exclude, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ProblemEntity } from './problem.entity';

export class UserProfileEntity implements UserProfile {
  constructor(partial: Partial<UserProfileEntity>) {
    Object.assign(this, partial);
  }

  @Exclude()
  id: number;

  userId: number;

  firstName: string;

  lastName: string;

  @Exclude()
  createdAt: Date;
  @Exclude()
  updatedAt: Date;

  @Exclude()
  published: boolean;

  @Exclude()
  consentTerms: boolean;

  @Exclude()
  consentAdult: boolean;

  @Exclude()
  consentHealthData: boolean;
  @ApiProperty({ type: () => [ProblemEntity] })
  @Type(() => ProblemEntity)
  problems: ProblemEntity[];
}

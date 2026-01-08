import { UserProfile, Problem } from '@prisma/client';
import { Exclude } from 'class-transformer';

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

  problems: Problem[];
}

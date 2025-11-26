import { DocProfile, Profession, Specialization } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class DocProfileEntity implements DocProfile {
  constructor(partial: Partial<DocProfileEntity>) {
    Object.assign(this, partial);
  }

  @Exclude()
  id: number;

  docId: number;

  firstName: string;

  lastName: string;

  workStart: number;

  workEnd: number;

  profession: Profession;

  rate: number;

  ratesLot: number;

  specializations: Specialization[];

  @Exclude()
  createdAt: Date;
  @Exclude()
  updatedAt: Date;
  @Exclude()
  published: boolean;
}

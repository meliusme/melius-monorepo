import { Profession, Specialization } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class DocProfileEntity {
  constructor(partial: Partial<DocProfileEntity>) {
    Object.assign(this, partial);
  }

  @Exclude()
  id: number;

  docId: number;

  firstName: string | null;

  lastName: string | null;

  profession: Profession | null;

  rate: number | null;

  ratesLot: number | null;

  sessionPricePln: number | null;

  specializations: Specialization[];

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  @Exclude()
  published: boolean;
}

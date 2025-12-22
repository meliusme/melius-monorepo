import {
  Profession,
  Specialization,
  DocVerificationStatus,
} from '@prisma/client';
import { Exclude } from 'class-transformer';
import { ArrayNotEmpty } from 'class-validator';

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

  @ArrayNotEmpty()
  specializations: Specialization[];

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  verificationStatus: DocVerificationStatus;

  @Exclude()
  submittedAt: Date | null;

  @Exclude()
  reviewedAt: Date | null;

  rejectionReason: string | null;
}

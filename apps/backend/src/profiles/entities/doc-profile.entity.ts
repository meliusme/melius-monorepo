import { Profession, DocVerificationStatus } from '@prisma/client';
import { Exclude, Type } from 'class-transformer';
import { ArrayNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SpecializationEntity } from './specialization.entity';

export class DocProfileEntity {
  constructor(partial: Partial<DocProfileEntity>) {
    Object.assign(this, partial);
  }

  @Exclude()
  id: number;

  docId: number;

  firstName: string | null;

  lastName: string | null;

  @ApiProperty({ enum: Profession, enumName: 'Profession', nullable: true })
  profession: Profession | null;

  rate: number | null;

  ratesLot: number | null;

  sessionPricePln: number | null;

  @ArrayNotEmpty()
  @ApiProperty({ type: () => [SpecializationEntity] })
  @Type(() => SpecializationEntity)
  specializations: SpecializationEntity[];

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  @ApiProperty({
    enum: DocVerificationStatus,
    enumName: 'DocVerificationStatus',
  })
  verificationStatus: DocVerificationStatus;

  @Exclude()
  submittedAt: Date | null;

  @Exclude()
  reviewedAt: Date | null;

  rejectionReason: string | null;
}

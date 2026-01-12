import { ApiProperty } from '@nestjs/swagger';
import { DocVerificationStatus, Profession } from '@prisma/client';
import { SpecializationEntity } from '../entities/specialization.entity';
import { Type } from 'class-transformer';

export class DocProfileResponseDto {
  @ApiProperty()
  docId: number;

  @ApiProperty()
  firstName: string | null;

  @ApiProperty()
  lastName: string | null;

  @ApiProperty({ enum: Profession, enumName: 'Profession', nullable: true })
  profession: Profession | null;

  @ApiProperty({ nullable: true })
  rate: number | null;

  @ApiProperty({ nullable: true })
  ratesLot: number | null;

  @ApiProperty({ nullable: true })
  unitAmount: number | null;
  currency: string;

  @ApiProperty({ type: () => [SpecializationEntity] })
  @Type(() => SpecializationEntity)
  specializations: SpecializationEntity[];

  @ApiProperty({
    enum: DocVerificationStatus,
    enumName: 'DocVerificationStatus',
  })
  verificationStatus: DocVerificationStatus;

  @ApiProperty({ nullable: true })
  rejectionReason: string | null;
}

import { ApiProperty } from '@nestjs/swagger';
import { Language, Profession } from '@prisma/client';
import { AvailabilitySlotEntity } from '../../availability/entities/availability.entity';

export class SearchMatchesResultDto {
  @ApiProperty()
  id: number;

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

  @ApiProperty()
  currency: string;

  @ApiProperty()
  isApproved: boolean;

  @ApiProperty({
    nullable: true,
    type: 'object',
    properties: {
      url: { type: 'string' },
    },
  })
  avatar: { url: string } | null;

  @ApiProperty({ enum: Language, enumName: 'Language' })
  language: Language;

  @ApiProperty({ type: () => [AvailabilitySlotEntity] })
  slots: AvailabilitySlotEntity[];
}

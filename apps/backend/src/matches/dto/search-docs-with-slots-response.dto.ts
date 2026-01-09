import { ApiProperty } from '@nestjs/swagger';
import { Language, Profession } from '@prisma/client';
import { AvailabilitySlotEntity } from '../../availability/entities/availability.entity';

export class SearchMatchesUserDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: Language, enumName: 'Language' })
  language: Language;
}

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
  sessionPricePln: number | null;

  @ApiProperty()
  isApproved: boolean;

  @ApiProperty({ type: () => SearchMatchesUserDto })
  user: SearchMatchesUserDto;

  @ApiProperty({ type: () => [AvailabilitySlotEntity] })
  slots: AvailabilitySlotEntity[];
}

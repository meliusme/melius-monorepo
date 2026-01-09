import { ApiProperty } from '@nestjs/swagger';
import { Profession } from '@prisma/client';

export class DocProfilePublicResponseDto {
  @ApiProperty()
  docId: number;

  @ApiProperty({ nullable: true })
  firstName: string | null;

  @ApiProperty({ nullable: true })
  lastName: string | null;

  @ApiProperty({ enum: Profession, enumName: 'Profession', nullable: true })
  profession: Profession | null;

  @ApiProperty({ nullable: true })
  rate: number | null;

  @ApiProperty({ nullable: true })
  ratesLot: number | null;

  @ApiProperty({ nullable: true })
  sessionPricePln: number | null;
}

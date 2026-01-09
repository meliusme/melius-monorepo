import { ApiProperty } from '@nestjs/swagger';

export class SpecializationEntity {
  constructor(partial: Partial<SpecializationEntity>) {
    Object.assign(this, partial);
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  specializationKey: string;
}

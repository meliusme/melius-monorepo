import { ApiProperty } from '@nestjs/swagger';

export class AdminProfileEntity {
  constructor(partial: Partial<AdminProfileEntity>) {
    Object.assign(this, partial);
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  firstName: string | null;

  @ApiProperty()
  lastName: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

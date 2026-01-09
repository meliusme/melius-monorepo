import { ApiProperty } from '@nestjs/swagger';

export class AdminProfileResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  userId: number;

  @ApiProperty({ nullable: true })
  firstName: string | null;

  @ApiProperty({ nullable: true })
  lastName: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

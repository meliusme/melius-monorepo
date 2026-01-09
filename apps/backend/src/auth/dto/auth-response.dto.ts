import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class AuthResponseDto {
  @ApiProperty({ enum: Role, enumName: 'Role' })
  role: Role;

  @ApiProperty()
  userId: number;
}

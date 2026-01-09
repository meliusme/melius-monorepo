import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ enum: Role, enumName: 'Role' })
  role: Role;

  @ApiProperty()
  email: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateAdminProfileDto {
  @ApiProperty()
  @IsString()
  firstName: string;
  @ApiProperty()
  @IsString()
  lastName: string;
}

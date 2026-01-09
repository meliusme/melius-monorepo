import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;
  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;
}

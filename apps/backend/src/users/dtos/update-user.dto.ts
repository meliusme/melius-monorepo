import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  @ApiPropertyOptional({ format: 'email' })
  email?: string;
  @IsString()
  @IsOptional()
  @MinLength(8)
  @ApiPropertyOptional({ minLength: 8 })
  password?: string;
}

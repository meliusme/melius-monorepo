import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ format: 'email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}

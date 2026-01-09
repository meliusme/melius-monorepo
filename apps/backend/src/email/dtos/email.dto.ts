import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class EmailDto {
  @ApiProperty({ format: 'email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

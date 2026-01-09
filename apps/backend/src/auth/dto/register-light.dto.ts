import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterLightDto {
  @ApiProperty({ format: 'email' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ minLength: 1 })
  @IsOptional()
  @IsString()
  @MinLength(1)
  firstName?: string;

  @ApiPropertyOptional({ minLength: 1 })
  @IsOptional()
  @IsString()
  @MinLength(1)
  lastName?: string;

  @ApiProperty()
  @IsBoolean()
  consentTerms: boolean;

  @ApiProperty()
  @IsBoolean()
  consentAdult: boolean;

  @ApiProperty()
  @IsBoolean()
  consentHealthData: boolean;
}

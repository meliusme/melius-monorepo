import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { $Enums, Language, Role } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @IsEmail()
  @ApiProperty({ format: 'email' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @ApiProperty({ minLength: 8 })
  password: string;

  @IsOptional()
  @ApiPropertyOptional({ enum: Role, enumName: 'Role' })
  role: $Enums.Role;

  @IsOptional()
  @ApiPropertyOptional({ enum: Language, enumName: 'Language' })
  language: $Enums.Language;

  @ValidateIf((o) => (o.role ?? Role.user) === Role.user)
  @IsBoolean()
  @ApiProperty()
  consentTerms: boolean;

  @ValidateIf((o) => (o.role ?? Role.user) === Role.user)
  @IsBoolean()
  @ApiProperty()
  consentAdult: boolean;

  @ValidateIf((o) => (o.role ?? Role.user) === Role.user)
  @IsBoolean()
  @ApiProperty()
  consentHealthData: boolean;
}

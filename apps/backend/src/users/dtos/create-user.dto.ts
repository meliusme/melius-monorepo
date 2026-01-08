import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { $Enums, Role } from '@prisma/client';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsOptional()
  role: $Enums.Role;

  @IsOptional()
  language: $Enums.Language;

  @ValidateIf((o) => (o.role ?? Role.user) === Role.user)
  @IsBoolean()
  consentTerms: boolean;

  @ValidateIf((o) => (o.role ?? Role.user) === Role.user)
  @IsBoolean()
  consentAdult: boolean;

  @ValidateIf((o) => (o.role ?? Role.user) === Role.user)
  @IsBoolean()
  consentHealthData: boolean;
}

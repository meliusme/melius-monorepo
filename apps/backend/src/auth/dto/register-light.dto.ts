import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterLightDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  lastName?: string;

  @IsBoolean()
  consentTerms: boolean;

  @IsBoolean()
  consentAdult: boolean;

  @IsBoolean()
  consentHealthData: boolean;
}

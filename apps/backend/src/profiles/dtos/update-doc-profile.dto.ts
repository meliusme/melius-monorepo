import { Profession } from '@prisma/client';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsNotEmpty,
  IsArray,
  ArrayNotEmpty,
  IsOptional,
  IsInt,
  IsBoolean,
  Max,
  Min,
} from 'class-validator';

export class UpdateDocProfileDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEnum(Profession)
  @IsNotEmpty()
  profession: Profession;

  @IsOptional()
  @IsInt()
  @Min(50)
  @Max(1000)
  sessionPricePln?: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  specializations: number[];

  @IsOptional()
  @IsBoolean()
  docTermsAccepted?: boolean;
}

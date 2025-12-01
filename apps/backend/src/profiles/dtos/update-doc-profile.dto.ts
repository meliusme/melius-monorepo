import { Profession } from '@prisma/client';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsPositive,
  IsNotEmpty,
  IsArray,
  ArrayNotEmpty,
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

  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  specializations: number[];
}

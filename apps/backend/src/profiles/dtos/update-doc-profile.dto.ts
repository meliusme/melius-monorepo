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

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  workStart: number;

  @IsNumber()
  @IsPositive()
  workEnd: number;

  @IsEnum(Profession)
  @IsNotEmpty()
  profession: Profession;

  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  specializations: number[];
}

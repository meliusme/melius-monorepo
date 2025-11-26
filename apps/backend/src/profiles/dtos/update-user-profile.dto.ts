import {
  IsString,
  IsNotEmpty,
  ArrayNotEmpty,
  IsArray,
  IsNumber,
} from 'class-validator';

export class UpdateUserProfileDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;
  @IsString()
  @IsNotEmpty()
  lastName: string;
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  problems: number[];
}

import {
  IsString,
  IsNotEmpty,
  ArrayNotEmpty,
  IsArray,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserProfileDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;
  @ApiProperty({ type: () => [Number], minItems: 1 })
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  problems: number[];
}

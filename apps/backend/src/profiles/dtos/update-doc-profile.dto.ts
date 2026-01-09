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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDocProfileDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEnum(Profession)
  @IsNotEmpty()
  @ApiProperty({ enum: Profession, enumName: 'Profession' })
  profession: Profession;

  @IsOptional()
  @IsInt()
  @Min(50)
  @Max(1000)
  @ApiPropertyOptional({ minimum: 50, maximum: 1000 })
  sessionPricePln?: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  @ApiProperty({ type: () => [Number], minItems: 1 })
  specializations: number[];

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ type: Boolean })
  docTermsAccepted?: boolean;
}

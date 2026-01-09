import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  Min,
  Max,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDocRateDto {
  @ApiProperty({ type: 'number' })
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  docId: number;

  @ApiProperty({ type: 'number' })
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  meetingId: number;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  rate: number;

  @ApiPropertyOptional({ maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;
}

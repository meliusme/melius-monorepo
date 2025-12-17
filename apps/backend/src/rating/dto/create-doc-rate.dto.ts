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

export class CreateDocRateDto {
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  docId: number;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  meetingId: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  rate: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;
}

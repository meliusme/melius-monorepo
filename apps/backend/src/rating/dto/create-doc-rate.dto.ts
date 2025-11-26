import { IsNotEmpty, IsNumber, IsPositive, Min, Max } from 'class-validator';

export class CreateDocRateDto {
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  docId: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  rate: number;
}

import { IsDateString, IsInt } from 'class-validator';

export class SearchMatchesDto {
  @IsInt()
  problemId: number;

  @IsDateString()
  from: string;

  @IsDateString()
  to: string;
}

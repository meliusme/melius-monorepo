import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt } from 'class-validator';

export class SearchMatchesDto {
  @ApiProperty({ type: 'integer' })
  @IsInt()
  problemId: number;

  @ApiProperty({ format: 'date-time' })
  @IsDateString()
  from: string;

  @ApiProperty({ format: 'date-time' })
  @IsDateString()
  to: string;
}

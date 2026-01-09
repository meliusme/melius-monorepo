import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class CreateAvailabilityDto {
  @ApiProperty({ format: 'date-time' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ format: 'date-time' })
  @IsDateString()
  endTime: string;
}

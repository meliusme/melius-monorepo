import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateMeetingDto {
  @ApiProperty({ type: 'number' })
  @IsNumber()
  slotId: number;

  @ApiPropertyOptional({ maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  clientMessage?: string;
}

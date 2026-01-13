import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RejectDocDto {
  @ApiProperty({
    description: 'Reason for rejecting the document verification',
    example: 'Document is not clear enough',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;
}

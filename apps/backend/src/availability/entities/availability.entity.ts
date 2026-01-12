import { ApiProperty } from '@nestjs/swagger';

export class AvailabilitySlotEntity {
  @ApiProperty()
  id: number;

  @ApiProperty({ format: 'date-time' })
  startTime: Date;

  @ApiProperty({ format: 'date-time' })
  endTime: Date;
}

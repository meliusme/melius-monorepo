import { ApiProperty } from '@nestjs/swagger';

export class AvailabilitySlotEntity {
  @ApiProperty()
  id: number;

  @ApiProperty()
  docId: number;

  @ApiProperty({ format: 'date-time' })
  startTime: Date;

  @ApiProperty({ format: 'date-time' })
  endTime: Date;

  @ApiProperty()
  booked: boolean;
}

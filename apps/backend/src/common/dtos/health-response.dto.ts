import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({
    example: 'ok',
    description: 'Health status of the application',
  })
  status: string;

  @ApiProperty({
    example: '2026-01-13T12:00:00.000Z',
    description: 'Current server timestamp',
  })
  timestamp: string;
}

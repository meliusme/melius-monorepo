import { ApiProperty } from '@nestjs/swagger';

export class P24StartResponseDto {
  @ApiProperty()
  url: string;

  @ApiProperty()
  token: string;

  @ApiProperty()
  sessionId: string;
}

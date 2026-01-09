import { ApiProperty } from '@nestjs/swagger';

export class AvatarResponseDto {
  @ApiProperty()
  url: string;
}

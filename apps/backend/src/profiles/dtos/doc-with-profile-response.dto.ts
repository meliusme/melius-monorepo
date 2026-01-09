import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AvatarResponseDto } from '../../users/dtos/avatar-response.dto';
import { DocProfileResponseDto } from './doc-profile-response.dto';
import { Type } from 'class-transformer';

export class DocWithProfileResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ enum: Role, enumName: 'Role' })
  role: Role;

  @ApiProperty()
  email: string;

  @ApiProperty({ type: () => AvatarResponseDto, nullable: true })
  @Type(() => AvatarResponseDto)
  avatar: AvatarResponseDto | null;

  @ApiProperty({ type: () => DocProfileResponseDto })
  @Type(() => DocProfileResponseDto)
  docProfile: DocProfileResponseDto;
}

import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AvatarResponseDto } from '../../users/dtos/avatar-response.dto';
import { DocProfilePublicResponseDto } from './doc-profile-public-response.dto';
import { Type } from 'class-transformer';

export class DocWithProfilePublicResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ enum: Role, enumName: 'Role' })
  role: Role;

  @ApiProperty()
  email: string;

  @ApiProperty({ type: () => AvatarResponseDto, nullable: true })
  @Type(() => AvatarResponseDto)
  avatar: AvatarResponseDto | null;

  @ApiProperty({ type: () => DocProfilePublicResponseDto })
  @Type(() => DocProfilePublicResponseDto)
  docProfile: DocProfilePublicResponseDto;
}

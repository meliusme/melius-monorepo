import { ApiProperty } from '@nestjs/swagger';
import { ProblemEntity } from '../entities/problem.entity';
import { Type } from 'class-transformer';

export class UserProfileResponseDto {
  @ApiProperty()
  userId: number;

  @ApiProperty({ nullable: true })
  firstName: string | null;

  @ApiProperty({ nullable: true })
  lastName: string | null;

  @ApiProperty({ type: () => [ProblemEntity] })
  @Type(() => ProblemEntity)
  problems: ProblemEntity[];
}

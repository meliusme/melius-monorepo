import { ApiProperty } from '@nestjs/swagger';

export class ProblemEntity {
  constructor(partial: Partial<ProblemEntity>) {
    Object.assign(this, partial);
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  problemKey: string;
}

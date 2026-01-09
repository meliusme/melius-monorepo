import { ApiProperty } from '@nestjs/swagger';

export class DocRatingUserDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  firstName: string | null;

  @ApiProperty()
  lastName: string | null;
}

export class DocRatingItemDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  rate: number;

  @ApiProperty({ nullable: true })
  comment: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: () => DocRatingUserDto })
  user: DocRatingUserDto;
}

export class DocRatingsResponseDto {
  @ApiProperty({ type: () => [DocRatingItemDto] })
  items: DocRatingItemDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}

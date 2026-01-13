import { ApiProperty } from '@nestjs/swagger';

export class DocumentUrlResponseDto {
  @ApiProperty({
    description: 'Temporary signed URL to access the document',
    example:
      'https://s3.amazonaws.com/bucket/doc-verification/123/file.pdf?...',
  })
  url: string;
}

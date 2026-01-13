import { ApiProperty } from '@nestjs/swagger';

export class VerificationDocumentResponseDto {
  @ApiProperty({
    description: 'Document ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'S3 key for the document',
    example: 'doc-verification/123/uuid.pdf',
  })
  key: string;

  @ApiProperty({
    description: 'Upload timestamp',
    example: '2026-01-13T12:00:00.000Z',
  })
  createdAt: Date;
}

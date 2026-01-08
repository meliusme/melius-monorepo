import { Injectable } from '@nestjs/common';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import sharp from 'sharp';

@Injectable()
export class ImageService {
  private readonly bucket = process.env.AWS_BUCKET_NAME;

  // Optional for Cloudflare R2 / custom S3 endpoints:
  private readonly endpoint = process.env.S3_ENDPOINT || undefined;
  private readonly forcePathStyle =
    (process.env.S3_FORCE_PATH_STYLE ?? 'false') === 'true';

  // Optional public base URL if you want to store a stable URL in DB:
  // e.g. https://cdn.melius-app.com or https://<bucket>.s3.<region>.amazonaws.com
  private readonly publicBaseUrl = process.env.S3_PUBLIC_BASE_URL || '';

  private readonly client = new S3Client({
    region: process.env.AWS_REGION ?? 'us-east-1',
    endpoint: this.endpoint,
    forcePathStyle: this.forcePathStyle,
    credentials: process.env.AWS_ACCESS_KEY_ID
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        }
      : undefined,
  });

  private assertBucket() {
    if (!this.bucket) {
      throw new Error('AWS_BUCKET_NAME is missing');
    }
  }

  /**
   * Uploads raw buffer to S3/R2. Does NOT touch DB.
   * Returns key + optional public url (if S3_PUBLIC_BASE_URL set).
   */
  async uploadObject(params: {
    key: string;
    body: Buffer;
    contentType: string;
    cacheControl?: string;
  }): Promise<{ key: string; url: string }> {
    this.assertBucket();

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: params.key,
        Body: params.body,
        ContentType: params.contentType,
        CacheControl: params.cacheControl,
      }),
    );

    const url = this.publicBaseUrl
      ? `${this.publicBaseUrl.replace(/\/+$/, '')}/${params.key}`
      : '';

    return { key: params.key, url };
  }

  /**
   * Deletes object from S3/R2 by key. Does NOT touch DB.
   */
  async deleteObject(key: string): Promise<void> {
    this.assertBucket();

    if (!key) return;

    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  async normalizeAvatar(buffer: Buffer): Promise<Buffer> {
    return await sharp(buffer)
      .rotate()
      .resize(512, 512, { fit: 'cover' })
      .webp({ quality: 82 })
      .toBuffer();
  }
}

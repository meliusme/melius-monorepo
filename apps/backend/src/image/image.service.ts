import { Injectable } from '@nestjs/common';
import { S3Client, S3, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { v4 as uuid } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ImageService {
  constructor(private prisma: PrismaService) {}

  private config = { region: process.env.AWS_REGION };
  private bucket = process.env.AWS_BUCKET_NAME;

  async uploadImageToS3(userId: number, dataBuffer: Buffer, filename: string) {
    try {
      const uploadParams = {
        Bucket: this.bucket,
        Key: `${uuid()}-${filename}`,
        Body: dataBuffer,
      };
      const parallelUploads3 = new Upload({
        client: new S3(this.config) || new S3Client(this.config),
        params: uploadParams,
      });

      parallelUploads3.on('httpUploadProgress', () => {});

      const avatar = await parallelUploads3.done();

      return await this.prisma.avatar.create({
        data: {
          userId,
          key: avatar.Key,
          url: avatar.Location,
        },
      });
    } catch (err) {
      console.error('Error uploading image to S3:', err);
      throw err;
    }
  }

  async deleteImageFromS3(avatarId: number) {
    try {
      const avatar = await this.prisma.avatar.findUnique({
        where: { id: avatarId },
      });
      const client = new S3Client(this.config);
      const input = {
        Bucket: this.bucket,
        Key: avatar.key,
      };
      const command = new DeleteObjectCommand(input);
      await client.send(command);
      await this.prisma.avatar.delete({
        where: { id: avatarId },
      });
    } catch (err) {
      console.error('Error deleting file from S3:', err);
      throw err;
    }
  }
}

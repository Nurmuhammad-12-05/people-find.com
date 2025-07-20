import { HttpException, Injectable } from '@nestjs/common';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';

interface UploadedFileResult {
  url: string;
  fileName: string;
}

@Injectable()
export class S3Service extends S3Client {
  private readonly buckentName: string;

  constructor(private readonly configService: ConfigService) {
    super();

    this.initConfig = {
      region: this.configService.get<string>('AWS_REGION') as string,
      credentials: {
        accessKeyId: this.configService.get<string>(
          'AWS_ACCESS_KEY_ID',
        ) as string,
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        ) as string,
      },
    };

    this.buckentName = this.configService.get<string>(
      'AWS_BUCKET_NAME',
    ) as string;
  }

  async uploadFile(
    file: Express.Multer.File,
    prefix: string,
  ): Promise<UploadedFileResult> {
    try {
      const fileName = `${prefix}/${uuid()}`;

      const command = this.sendFileCommand(file, fileName);

      const response = await this.send(command);

      const {
        $metadata: { httpStatusCode },
      } = response;

      if (httpStatusCode === 200) {
        const url = await this.getFileCommand(fileName, file.originalname);

        return { url, fileName };
      } else {
        throw new HttpException('S3 upload failed', 500);
      }
    } catch (error) {
      throw new HttpException(error, 404);
    }
  }

  async deleteFile(fileName: string) {
    const deleteCommand = this.deleteCommand(fileName);
    const status = await this.send(deleteCommand);
  }

  sendFileCommand(file: Express.Multer.File, fileName: string) {
    const command = new PutObjectCommand({
      Bucket: this.buckentName,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    return command;
  }

  async getFileCommand(fileName: string, orginalFileName: string) {
    const getUrlCommand = new GetObjectCommand({
      Bucket: this.buckentName,
      Key: fileName,
    });

    const url = await getSignedUrl(this, getUrlCommand, {
      expiresIn: 3600,
    });

    return url;
  }

  deleteCommand(fileName: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.buckentName,
      Key: fileName,
    });
    return command;
  }
}

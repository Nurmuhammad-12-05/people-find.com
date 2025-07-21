import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/core/database/database.service';
// import fs from 'fs';
// import path from 'path';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { S3Service } from 'src/core/storage/s3/s3.service';

@Injectable()
export class ProfileService {
  constructor(
    private readonly db: DatabaseService,
    private readonly s3Service: S3Service,
  ) {}

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const updated = await this.db.prisma.user.update({
      where: { id: userId },
      data: dto,
      include: { accounts: true, userFile: true },
    });

    const data = {
      ...updated,
      password: '',
    };

    return {
      success: true,
      message: 'Profil yangilandi',
      data: data,
    };
  }

  async updateAvatar(userId: string, file: Express.Multer.File) {
    const { fileName, url } = await this.s3Service.uploadFile(file, 'avatars');

    const findUser = await this.db.prisma.user.findUnique({
      where: { id: userId },
    });

    if (findUser) {
      await this.db.prisma.userFile.update({
        where: { userId: userId },
        data: {
          avatar_key: fileName,
          userId: userId,
        },
      });

      const user = await this.db.prisma.user.findUnique({
        where: { id: userId },
        include: { userFile: true },
      });

      const data = {
        ...user,
        password: '',
      };

      return {
        success: true,
        message: 'Avatar yangilandi',
        data: data,
      };
    }

    await this.db.prisma.userFile.create({
      data: {
        avatar_key: fileName,
        userId: userId,
      },
    });

    const user = await this.db.prisma.user.findUnique({
      where: { id: userId },
      include: { userFile: true },
    });

    const data = {
      ...user,
      password: '',
    };

    return {
      success: true,
      message: 'Avatar yangilandi',
      data: data,
    };
  }

  async deleteAvatar(userId: string) {
    const user = await this.db.prisma.userFile.findUnique({
      where: { id: userId },
      select: {
        avatar_key: true,
      },
    });

    if (user?.avatar_key) {
      await this.s3Service.deleteFile(user.avatar_key);
    }

    return {
      success: true,
      message: "Avatar o'chirildi",
    };
  }

  async deleteUser(id: string) {
    const user = await this.db.prisma.user.delete({
      where: {
        id: id,
      },
      include: {
        userFile: true,
      },
    });

    const fileName = user.userFile?.avatar_key as string;

    this.s3Service.deleteFile(fileName);

    return {
      success: true,
      message: 'user delete',
    };
  }
}

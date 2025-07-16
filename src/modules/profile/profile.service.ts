import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/core/database/database.service';
import fs from 'fs';
import path from 'path';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly db: DatabaseService) {}

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const updated = await this.db.prisma.user.update({
      where: { id: userId },
      data: dto,
    });

    return {
      success: true,
      message: 'Profil yangilandi',
      data: updated,
    };
  }

  async updateAvatar(userId: string, fileName: string) {
    const user = await this.db.prisma.user.findUnique({
      where: { id: userId },
    });

    if (user?.avatar) {
      const oldPath = path.join(
        __dirname,
        '..',
        '..',
        'uploads',
        'avatars',
        user.avatar,
      );
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const updated = await this.db.prisma.user.update({
      where: { id: userId },
      data: {
        avatar: fileName,
      },
    });

    return {
      success: true,
      message: 'Avatar yangilandi',
      data: updated,
    };
  }

  async deleteAvatar(userId: string) {
    const user = await this.db.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.avatar) {
      return {
        success: false,
        message: 'Avatar topilmadi',
      };
    }

    const avatarPath = path.join(
      __dirname,
      '..',
      '..',
      'uploads',
      'avatars',
      user.avatar,
    );
    if (fs.existsSync(avatarPath)) fs.unlinkSync(avatarPath);

    await this.db.prisma.user.update({
      where: { id: userId },
      data: { avatar: null },
    });

    return {
      success: true,
      message: 'Avatar o‘chirildi',
    };
  }
}

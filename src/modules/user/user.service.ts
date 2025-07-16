import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from 'src/core/database/database.service';
import { SaveProfileDto } from './dto/save.dto';

@Injectable()
export class UserService {
  constructor(private readonly db: DatabaseService) {}

  async getProfileUser(id: string) {
    const findUser = await this.db.prisma.user.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        location: true,
        avatar: true,
        role: true,
        bio: true,
        isVerified: true,
        skills: true,
        accounts: {
          select: { id: true, provider: true, provider_id: true },
        },
      },
    });

    if (!findUser) throw new ConflictException('Reference not found');

    return { findUser };
  }

  async addContactUser(message: string, profileId: string, FromUserId: string) {
    if (FromUserId === profileId)
      throw new BadRequestException('You cannot send a request to yourself.');

    const findProfileUser = await this.db.prisma.user.findUnique({
      where: { id: profileId },
    });

    if (!findProfileUser)
      throw new ConflictException('The owner of this profile does not exist.');

    const existing = await this.db.prisma.contactRequest.findFirst({
      where: {
        userId: FromUserId,
        profileId: profileId,
        status: 'PENDING',
      },
    });

    if (existing)
      throw new ConflictException('The request has already been sent.');

    await this.db.prisma.contactRequest.create({
      data: {
        userId: FromUserId,
        profileId: profileId,
        message: message,
      },
    });

    return { message: 'Message sent.' };
  }

  async saveProfileUser(
    saveProfileDto: SaveProfileDto,
    profileId: string,
    userId: string,
  ) {
    const profile = await this.db.prisma.searchResult.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const existingSave = await this.db.prisma.savedProfile.findFirst({
      where: {
        userId,
        profileId,
      },
    });

    if (existingSave) {
      throw new ConflictException('This profile is already saved.');
    }

    const savedProfile = await this.db.prisma.savedProfile.create({
      data: {
        userId,
        profileId,
        notes: saveProfileDto.notes || null,
        tags: saveProfileDto.tags || [],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      success: true,
      message: 'Profile saved successfully',
      data: savedProfile,
    };
  }

  async getAllSavedProfiles(userId: string) {
    const savedProfiles = await this.db.prisma.savedProfile.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        profile: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      success: true,
      message: 'Saqlangan profillar muvaffaqiyatli olindi',
      data: savedProfiles,
      count: savedProfiles.length,
    };
  }

  async searchSavedProfiles(userId: string, searchQuery: string) {
    if (!searchQuery?.trim()) {
      return {
        success: false,
        message: "Qidiruv so'zi kiritilmagan",
        data: [],
        count: 0,
      };
    }

    const savedProfiles = await this.db.prisma.savedProfile.findMany({
      where: {
        userId,
        OR: [
          {
            notes: {
              contains: searchQuery,
              mode: 'insensitive',
            },
          },
          {
            tags: {
              hasSome: [searchQuery],
            },
          },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        profile: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const searchLower = searchQuery.toLowerCase();

    const filteredProfiles = savedProfiles.filter((item) => {
      const profile = item.profile;
      if (!profile) return false;

      return (
        profile.name?.toLowerCase().includes(searchLower) ||
        profile.title?.toLowerCase().includes(searchLower) ||
        profile.location?.toLowerCase().includes(searchLower) ||
        profile.skills?.some((skill) =>
          skill.toLowerCase().includes(searchLower),
        ) ||
        item.notes?.toLowerCase().includes(searchLower) ||
        item.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    });

    return {
      success: true,
      message: `"${searchQuery}" bo'yicha ${filteredProfiles.length} ta natija topildi`,
      data: filteredProfiles,
      count: filteredProfiles.length,
      searchQuery,
    };
  }

  async deleteSavedProfile(userId: string, profileId: string) {
    const saved = await this.db.prisma.savedProfile.findFirst({
      where: {
        userId,
        profileId,
      },
    });

    if (!saved) {
      return {
        success: false,
        message: 'This profile is not saved or has already been deleted.',
      };
    }

    await this.db.prisma.savedProfile.delete({
      where: {
        id: saved.id,
      },
    });

    return {
      success: true,
      message: 'Profile removed from saved files',
    };
  }
}

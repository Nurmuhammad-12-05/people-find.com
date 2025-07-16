import {
  Body,
  Controller,
  Delete,
  Put,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Profile')
@ApiBearerAuth()
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Put('me')
  @ApiOperation({ summary: 'Foydalanuvchi profilini yangilash' })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({ status: 200, description: 'Profil muvaffaqiyatli yangilandi' })
  async updateProfile(@Req() req: Request, @Body() dto: UpdateProfileDto) {
    const userId = req['userId'];
    return this.profileService.updateProfile(userId, dto);
  }

  @Put('me/avatar')
  @ApiOperation({ summary: 'Profil avatarini yangilash' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Avatar muvaffaqiyatli yuklandi' })
  @UseInterceptors(FileInterceptor('file'))
  async updateAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    const userId = req['userId'];
    return this.profileService.updateAvatar(userId, file);
  }

  @Delete('me/avatar')
  @ApiOperation({ summary: 'Avatarni o‘chirish' })
  @ApiResponse({ status: 200, description: 'Avatar muvaffaqiyatli o‘chirildi' })
  async deleteAvatar(@Req() req: Request) {
    const userId = req['userId'];
    return this.profileService.deleteAvatar(userId);
  }

  @Delete('delete/user')
  @ApiOperation({ summary: 'Foydalanuvchini o‘chirish' })
  @ApiResponse({
    status: 200,
    description: 'Foydalanuvchi muvaffaqiyatli o‘chirildi',
  })
  async deleteUser(@Req() req: Request) {
    const userId = req['userId'];
    return this.profileService.deleteUser(userId);
  }
}

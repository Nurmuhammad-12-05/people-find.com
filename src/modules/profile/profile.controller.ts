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
import { diskStorage } from 'multer';
import {
  editFileName,
  imageFileFilter,
} from 'src/common/utils/file-upload.utils';

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Profile')
@ApiBearerAuth()
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Put('me')
  @ApiOperation({ summary: 'Foydalanuvchi profilini yangilash' })
  @ApiResponse({ status: 200, description: 'Profil muvaffaqiyatli yangilandi' })
  @ApiBody({ type: UpdateProfileDto })
  async updateProfile(@Req() req: Request, @Body() dto: UpdateProfileDto) {
    const userId = req['userId'];
    return this.profileService.updateProfile(userId, dto);
  }

  @Put('me/avatar')
  @ApiOperation({ summary: 'Profil avatarini yangilash' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Avatar muvaffaqiyatli yuklandi' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async updateAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    const userId = req['userId'];
    return this.profileService.updateAvatar(userId, file?.filename);
  }

  @Delete('me/avatar')
  @ApiOperation({ summary: 'Avatarni o‘chirish' })
  @ApiResponse({ status: 200, description: 'Avatar muvaffaqiyatli o‘chirildi' })
  async deleteAvatar(@Req() req: Request) {
    const userId = req['userId'];
    return this.profileService.deleteAvatar(userId);
  }
}

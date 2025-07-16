import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Request } from 'express';
import { SaveProfileDto } from './dto/save.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('User')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile/:id')
  @ApiOperation({ summary: 'Boshqa foydalanuvchi profilini olish' })
  @ApiParam({ name: 'id', description: 'Foydalanuvchi IDsi' })
  @ApiResponse({ status: 200, description: 'Foydalanuvchi profili topildi' })
  async getProfileUser(@Param('id') id: string) {
    const user = await this.userService.getProfileUser(id);
    return { user };
  }

  @Post('profiles/:id/contact')
  @ApiOperation({ summary: 'Foydalanuvchiga kontakt xabar yuborish' })
  @ApiParam({ name: 'id', description: 'Qabul qiluvchi foydalanuvchi IDsi' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Salom, sizning profilingizni ko‘rib chiqdim.',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Kontakt xabari yuborildi' })
  async addContactUser(
    @Body('message') message: string,
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const userId = req['userId'];
    const contact = await this.userService.addContactUser(message, id, userId);
    return contact;
  }

  @Post('profiles/:id/save')
  @ApiOperation({ summary: 'Profilni saqlash (bookmark)' })
  @ApiParam({ name: 'id', description: 'Saqlanadigan profil IDsi' })
  @ApiBody({ type: SaveProfileDto })
  @ApiResponse({ status: 201, description: 'Profil saqlandi' })
  async saveProfileUser(
    @Body() saveProfileDto: SaveProfileDto,
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const userId = req['userId'];
    return await this.userService.saveProfileUser(saveProfileDto, id, userId);
  }

  @Get('profiles/saved')
  @ApiOperation({ summary: 'Saqlangan profillar ro‘yxatini olish' })
  @ApiResponse({ status: 200, description: 'Saqlangan profillar ro‘yxati' })
  async getAllSavedProfiles(@Req() req: Request) {
    const userId = req['userId'];
    return this.userService.getAllSavedProfiles(userId);
  }

  @Get('profiles/saved/search')
  @ApiOperation({ summary: 'Saqlangan profillar orasidan qidirish' })
  @ApiQuery({
    name: 'q',
    description: 'Qidiruv kalit so‘zi',
    required: true,
    example: 'nestjs',
  })
  @ApiResponse({ status: 200, description: 'Qidiruv natijalari' })
  async searchSavedProfiles(@Req() req: Request, @Query('q') query: string) {
    const userId = req['userId'];
    return this.userService.searchSavedProfiles(userId, query);
  }

  @Delete('profiles/:id/save')
  @ApiOperation({ summary: 'Saqlangan profilni o‘chirish' })
  @ApiParam({ name: 'id', description: 'Saqlangan profil IDsi' })
  @ApiResponse({
    status: 200,
    description: 'Profil saqlanganlar ro‘yxatidan o‘chirildi',
  })
  async deleteSavedProfile(
    @Req() req: Request,
    @Param('id') profileId: string,
  ) {
    const userId = req['userId'];
    return this.userService.deleteSavedProfile(userId, profileId);
  }
}

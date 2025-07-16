import { Controller, Get, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('App')
@Controller()
@SetMetadata('isPublic', true)
export class AppController {
  constructor() {}

  @Get()
  @ApiOperation({ summary: 'Test route — salomlashish yoki tekshiruv' })
  @ApiResponse({
    status: 200,
    description: 'Oddiy raqamlar massivi',
    schema: {
      example: [1, 2, 3],
    },
  })
  hello() {
    return [1, 2, 3];
  }
}

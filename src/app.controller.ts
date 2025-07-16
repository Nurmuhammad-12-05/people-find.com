import { Controller, Get, SetMetadata, UseGuards } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() {}

  @Get()
  hello() {
    return [1, 2, 3];
  }
}

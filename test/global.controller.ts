import { Controller, Get } from '@nestjs/common';

@Controller('')
export class GlobalController {

  @Get('error')
  error() {
    throw new Error('Something bad happened');
  }
}
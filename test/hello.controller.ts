import { Controller, Get, HttpException, HttpStatus, UseInterceptors } from '@nestjs/common';
import { RavenInterceptor } from '../lib';

@Controller('')
export class HelloController {

  @Get('works')
  @UseInterceptors(RavenInterceptor())
  works() {
    return 'Works';
  }

  @Get('intercepted')
  @UseInterceptors(RavenInterceptor())
  intercepted() {
    throw new Error('Something bad happened');
  }

  @Get('filter')
  @UseInterceptors(RavenInterceptor({
    filters: [
      // Filter exceptions of type HttpException. Ignore those that
      // have status code of less than 500
      { type: HttpException, filter: (exception: HttpException) => 500 > exception.getStatus() },
    ],
  }))
  filter() {
    throw new HttpException('Something not so bad happened', HttpStatus.NOT_FOUND);
  }

  @Get('tags')
  @UseInterceptors(RavenInterceptor({
    tags: { 'A': 'AAA', 'B': 'BBB' },
  }))
  tags() {
    throw new Error('Something bad happened');
  }

  @Get('extra')
  @UseInterceptors(RavenInterceptor({
    extra: { 'A': 'AAA', 'B': 'BBB' },
  }))
  extra() {
    throw new Error('Something bad happened');
  }

  @Get('fingerprint')
  @UseInterceptors(RavenInterceptor({
    fingerprint: ['A', 'B'],
  }))
  fingerprint() {
    throw new Error('Something bad happened');
  }

  @Get('level')
  @UseInterceptors(RavenInterceptor({
    level: 'CRAZY',
  }))
  level() {
    throw new Error('Something bad happened');
  }
}
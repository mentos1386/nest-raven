import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { RavenInterceptor } from '../../lib';
import * as Sentry from '@sentry/types';

@Controller('')
export class MethodController {
  @Get('works')
  @UseInterceptors(new RavenInterceptor())
  works() {
    return 'Works';
  }

  @Get('intercepted')
  @UseInterceptors(new RavenInterceptor())
  intercepted() {
    throw new Error('Something bad happened');
  }

  @Get('filter')
  @UseInterceptors(
    new RavenInterceptor({
      filters: [
        // Filter exceptions of type HttpException. Ignore those that
        // have status code of less than 500
        {
          type: HttpException,
          filter: (exception: HttpException) => 500 > exception.getStatus(),
        },
      ],
    }),
  )
  filter() {
    throw new HttpException(
      'Something not so bad happened',
      HttpStatus.NOT_FOUND,
    );
  }

  @Get('tags')
  @UseInterceptors(
    new RavenInterceptor({
      tags: { A: 'AAA', B: 'BBB' },
    }),
  )
  tags() {
    throw new Error('Something bad happened');
  }

  @Get('extra')
  @UseInterceptors(
    new RavenInterceptor({
      extra: { A: 'AAA', B: 'BBB' },
    }),
  )
  extra() {
    throw new Error('Something bad happened');
  }

  @Get('fingerprint')
  @UseInterceptors(
    new RavenInterceptor({
      fingerprint: ['A', 'B'],
    }),
  )
  fingerprint() {
    throw new Error('Something bad happened');
  }

  @Get('level')
  @UseInterceptors(
    new RavenInterceptor({
      level: Sentry.Severity.Critical,
    }),
  )
  level() {
    throw new Error('Something bad happened');
  }
}

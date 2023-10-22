import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { RavenInterceptor } from '../lib/raven.interceptor';

describe('RavenInterceptor', () => {
  describe('shouldReport', () => {
    it('is not settings yet', () => {
      const instance = new RavenInterceptor();
      expect(instance['shouldReport'](new Error())).toBeTruthy();
    });

    it.each([
      [
        new HttpException(
          `BAD REQUEST ${HttpStatus.BAD_REQUEST}`,
          HttpStatus.BAD_REQUEST,
        ),
        new BadRequestException(),
      ],
    ])('is not settings yet %s', (exception) => {
      const instance = new RavenInterceptor({
        filters: [
          {
            type: HttpException,
            filter: (exception: HttpException) => 500 > exception.getStatus(),
          },
        ],
      });
      expect(instance['shouldReport'](exception)).toBeFalsy();
    });
  });
});

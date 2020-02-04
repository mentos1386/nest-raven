import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    throw new InternalServerErrorException('This is not good?');
  }
}

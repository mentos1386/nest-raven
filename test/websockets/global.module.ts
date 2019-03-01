import { RavenModule, RavenInterceptor } from '../../lib';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { GlobalGateway } from './global.gateway';

@Module({
  imports: [
    RavenModule,
  ],
  providers: [
    GlobalGateway,
    {
      provide: APP_INTERCEPTOR,
      useValue: new RavenInterceptor(),
    },
  ],
})
export class GlobalModule {
}
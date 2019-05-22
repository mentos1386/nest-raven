import { RavenModule, RavenInterceptor } from '../../lib';
import { Module } from '@nestjs/common';
import { GlobalController } from './global.controller';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
      RavenModule,
  ],
  controllers: [
    GlobalController,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useValue: new RavenInterceptor(),
    },
  ],
})
export class GlobalModule {
}
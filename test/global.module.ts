import { RavenModule, RavenInterceptor } from '../lib';
import { Module } from '@nestjs/common';
import { GlobalController } from './global.controller';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
      RavenModule.forRoot('https://your:sdn@sentry.io/290747'),
  ],
  controllers: [
    GlobalController,
  ],
  providers: [
    {
        provide: APP_INTERCEPTOR,
        useClass: RavenInterceptor(),
    },
  ]
})
export class GlobalModule {
}
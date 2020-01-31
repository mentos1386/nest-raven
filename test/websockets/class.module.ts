import { RavenModule, RavenInterceptor } from '../../lib';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { Severity } from '@sentry/node';
import { classGateway } from './class.gateway';

@Module({
  imports: [
    RavenModule,
  ],
  providers: [
    classGateway,
    {
      provide: APP_INTERCEPTOR,
      useValue: new RavenInterceptor({ context: 'Ws', level: Severity.Info }),
    },
  ],
})
export class ClassModule {
}

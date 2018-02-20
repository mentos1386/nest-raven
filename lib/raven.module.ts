import { DynamicModule, Global, Module } from '@nestjs/common';
import { ravenSentryProviders } from './raven.providers';
import * as Raven from 'raven';
import { RAVEN_SENTRY_CONFIG } from './raven.constants';
import { RavenInterceptor } from './raven.interceptor.mixin';
import { AbstractRavenInterceptor } from './raven.interceptor.abstract';

@Global()
@Module({
  components: [
    ...ravenSentryProviders,
    AbstractRavenInterceptor,
    RavenInterceptor,
  ],
  exports: [
    ...ravenSentryProviders,
    AbstractRavenInterceptor,
    RavenInterceptor,
  ],
})
export class RavenModule {
  static forRoot(dsn?: string, options?: Raven.ConstructorOptions): DynamicModule {
    return {
      module: RavenModule,
      components: [
        {
          provide: RAVEN_SENTRY_CONFIG,
          useValue: { dsn, options },
        },
      ],
      exports: [
        {
          provide: RAVEN_SENTRY_CONFIG,
          useValue: { dsn, options },
        },
      ],
    };
  }
}

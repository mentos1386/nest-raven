import { DynamicModule, Global, Module } from '@nestjs/common';
import { ravenSentryProviders } from './raven.providers';
import * as Raven from 'raven';
import { RAVEN_SENTRY_CONFIG } from './raven.constants';

@Global()
@Module({
  providers: [
    ...ravenSentryProviders,
  ],
  exports: [
    ...ravenSentryProviders,
  ],
})
export class RavenModule {
  static forRoot(dsn?: string, options?: Raven.ConstructorOptions): DynamicModule {
    return {
      module: RavenModule,
      providers: [
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

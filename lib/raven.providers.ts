import { RAVEN_SENTRY_CONFIG, RAVEN_SENTRY_PROVIDER } from './raven.constants';
import * as Raven from 'raven';
import { IRavenConfig } from './raven.interfaces';

export const ravenSentryProviders = [
  {
    provide: RAVEN_SENTRY_PROVIDER,
    useFactory: (config: IRavenConfig): Raven.Client => {
      return Raven.config(config.dsn, config.options);
    },
    inject: [RAVEN_SENTRY_CONFIG],
  },
];

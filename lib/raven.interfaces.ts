import { Scope } from '@sentry/node';
import { SeverityLevel } from '@sentry/types';

export interface IRavenScopeTransformerFunction {
  (scope: Scope): void;
}

export interface IRavenFilterFunction {
  (exception: any): boolean;
}

export interface IRavenInterceptorOptionsFilter {
  type: any;
  filter?: IRavenFilterFunction;
}

export interface IRavenInterceptorOptions {
  filters?: IRavenInterceptorOptionsFilter[];
  transformers?: IRavenScopeTransformerFunction[];
  tags?: { [key: string]: string };
  extra?: { [key: string]: any };
  fingerprint?: string[];
  level?: SeverityLevel;

  // https://github.com/getsentry/sentry-javascript/blob/master/packages/node/src/handlers.ts#L163
  request?: boolean;
  serverName?: boolean;
  transaction?: boolean | 'path' | 'methodPath' | 'handler'; // https://github.com/getsentry/sentry-javascript/blob/master/packages/node/src/handlers.ts#L16
  user?: boolean | string[];
  version?: boolean;
}

import { ExecutionContext } from "@nestjs/common";
import { AddRequestDataToEventOptions, Scope } from "@sentry/node";
import { Extras, Primitive, SeverityLevel } from "@sentry/types";

export interface IRavenScopeTransformerFunction {
  (scope: Scope, context: ExecutionContext): void;
}

export interface IRavenFilterFunction<T> {
  (exception: T): boolean;
}

export interface IRavenInterceptorOptionsFilter<T> {
  type: T;
  filter?: IRavenFilterFunction<T>;
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type IRavenInterceptorOptions<T = any> = {
  filters?: IRavenInterceptorOptionsFilter<T>[];
  transformers?: IRavenScopeTransformerFunction[];
  tags?: { [key: string]: Primitive };
  extra?: Extras;
  fingerprint?: string[];
  level?: SeverityLevel;

  /**
   * @deprecated
   * Use includes instead
   * */
  request?: boolean;
  serverName?: boolean;
  /**
   * @deprecated
   * Use includes instead
   * */
  transaction?: boolean | "path" | "methodPath" | "handler"; // https://github.com/getsentry/sentry-javascript/blob/master/packages/node/src/handlers.ts#L16
  /**
   * @deprecated
   * Use IRavenInterceptorOptions.includes instead
   * */
  user?: boolean | string[];
  /**
   * @deprecated
   */
  version?: boolean;
} & AddRequestDataToEventOptions;

import {
  ExecutionContext,
  Injectable,
  NestInterceptor,
  CallHandler,
} from '@nestjs/common';
import { IRavenInterceptorOptions } from './raven.interfaces';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as Sentry from '@sentry/minimal';
import { Scope } from '@sentry/hub';
import {
  RpcArgumentsHost,
  WsArgumentsHost,
  HttpArgumentsHost,
} from '@nestjs/common/interfaces';
import { Handlers } from '@sentry/node';
import type {
  GraphQLArgumentsHost,
  GqlContextType,
} from '@nestjs/graphql';

let GqlArgumentsHost: any;
try {
  ({ GqlArgumentsHost } = require('@nestjs/graphql'))
} catch(e) {}

@Injectable()
export class RavenInterceptor implements NestInterceptor {
  constructor(private readonly options: IRavenInterceptorOptions = {}) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // first param would be for events, second is for errors
    return next.handle().pipe(
      tap(null, (exception) => {
        if (this.shouldReport(exception)) {
          Sentry.withScope((scope) => {
            switch (context.getType<GqlContextType>()) {
              case 'http':
                return this.captureHttpException(
                  scope,
                  context.switchToHttp(),
                  exception,
                );
              case 'ws':
                return this.captureWsException(
                  scope,
                  context.switchToWs(),
                  exception,
                );
              case 'rpc':
                return this.captureRpcException(
                  scope,
                  context.switchToRpc(),
                  exception,
                );
              case 'graphql':
                if (!GqlArgumentsHost) return this.captureException(scope, exception);
                return this.captureGraphQLException(
                  scope,
                  GqlArgumentsHost.create(context),
                  exception,
                );
              default:
                return this.captureException(scope, exception);
            }
          });
        }
      }),
    );
  }

  private captureGraphQLException(
    scope: Scope,
    gqlHost: GraphQLArgumentsHost,
    exception: any,
  ): void {
    const context = gqlHost.getContext();
    // Same as HttpException
    const data = Handlers.parseRequest(
      {},
      context?.req || context,
      this.options,
    );
    scope.setExtra('req', data.request);
    data.extra && scope.setExtras(data.extra);
    if (data.user) scope.setUser(data.user);

    // GraphQL Specifics
    const info = gqlHost.getInfo();
    scope.setExtra('fieldName', info.fieldName);
    const args = gqlHost.getArgs();
    scope.setExtra('args', args);

    this.captureException(scope, exception);
  }

  private captureHttpException(
    scope: Scope,
    http: HttpArgumentsHost,
    exception: any,
  ): void {
    const data = Handlers.parseRequest(
      <any>{},
      http.getRequest(),
      this.options,
    );

    scope.setExtra('req', data.request);
    data.extra && scope.setExtras(data.extra);
    if (data.user) scope.setUser(data.user);

    this.captureException(scope, exception);
  }

  private captureRpcException(
    scope: Scope,
    rpc: RpcArgumentsHost,
    exception: any,
  ): void {
    scope.setExtra('rpc_data', rpc.getData());

    this.captureException(scope, exception);
  }

  private captureWsException(
    scope: Scope,
    ws: WsArgumentsHost,
    exception: any,
  ): void {
    scope.setExtra('ws_client', ws.getClient());
    scope.setExtra('ws_data', ws.getData());

    this.captureException(scope, exception);
  }

  private captureException(scope: Scope, exception: any): void {
    if (this.options.level) scope.setLevel(this.options.level);
    if (this.options.fingerprint)
      scope.setFingerprint(this.options.fingerprint);
    if (this.options.extra) scope.setExtras(this.options.extra);
    if (this.options.tags) scope.setTags(this.options.tags);

    Sentry.captureException(exception);
  }

  private shouldReport(exception: any): boolean {
    if (!this.options.filters) return true;

    // If all filters pass, then we do not report
    return this.options.filters.every(({ type, filter }) => {
      return !(exception instanceof type && (!filter || filter(exception)));
    });
  }
}

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import {
  HttpArgumentsHost,
  RpcArgumentsHost,
  WsArgumentsHost,
} from '@nestjs/common/interfaces';
import { Reflector } from '@nestjs/core';
import type { GqlContextType, GraphQLArgumentsHost } from '@nestjs/graphql';
import { captureException, Handlers, Scope, withScope } from '@sentry/node';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RAVEN_LOCAL_TRANSFORMERS_METADATA } from './raven.decorators';
import {
  IRavenInterceptorOptions,
  IRavenScopeTransformerFunction,
} from './raven.interfaces';

let GqlArgumentsHost: any;
try {
  ({ GqlArgumentsHost } = require('@nestjs/graphql'));
} catch (e) {}

@Injectable()
export class RavenInterceptor implements NestInterceptor {
  constructor(
    private readonly options: IRavenInterceptorOptions = {},
    private readonly reflector: Reflector = new Reflector(),
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const localTransformers = this.reflector.get<
      IRavenScopeTransformerFunction[]
    >(RAVEN_LOCAL_TRANSFORMERS_METADATA, context.getHandler());

    // first param would be for events, second is for errors
    return next.handle().pipe(
      tap({
        error: (exception) => {
          if (this.shouldReport(exception)) {
            withScope((scope) => {
              switch (context.getType<GqlContextType>()) {
                case 'http':
                  this.addHttpExceptionMetadatas(scope, context.switchToHttp());
                  return this.captureException(
                    scope,
                    exception,
                    localTransformers,
                  );
                case 'ws':
                  this.addWsExceptionMetadatas(scope, context.switchToWs());
                  return this.captureException(
                    scope,
                    exception,
                    localTransformers,
                  );
                case 'rpc':
                  this.addRpcExceptionMetadatas(scope, context.switchToRpc());
                  return this.captureException(
                    scope,
                    exception,
                    localTransformers,
                  );
                case 'graphql':
                  if (!GqlArgumentsHost)
                    return this.captureException(
                      scope,
                      exception,
                      localTransformers,
                    );
                  this.addGraphQLExceptionMetadatas(
                    scope,
                    GqlArgumentsHost.create(context),
                  );
                  return this.captureException(
                    scope,
                    exception,
                    localTransformers,
                  );
                default:
                  return this.captureException(
                    scope,
                    exception,
                    localTransformers,
                  );
              }
            });
          }
        },
      }),
    );
  }

  private addGraphQLExceptionMetadatas(
    scope: Scope,
    gqlHost: GraphQLArgumentsHost,
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
  }

  private addHttpExceptionMetadatas(
    scope: Scope,
    http: HttpArgumentsHost,
  ): void {
    const data = Handlers.parseRequest(
      <any>{},
      http.getRequest(),
      this.options,
    );

    scope.setExtra('req', data.request);
    data.extra && scope.setExtras(data.extra);
    if (data.user) scope.setUser(data.user);
  }

  private addRpcExceptionMetadatas(scope: Scope, rpc: RpcArgumentsHost): void {
    scope.setExtra('rpc_data', rpc.getData());
  }

  private addWsExceptionMetadatas(scope: Scope, ws: WsArgumentsHost): void {
    scope.setExtra('ws_client', ws.getClient());
    scope.setExtra('ws_data', ws.getData());
  }

  private captureException(
    scope: Scope,
    exception: any,
    localTransformers: IRavenScopeTransformerFunction[] | undefined,
  ): void {
    if (this.options.level) scope.setLevel(this.options.level);
    if (this.options.fingerprint)
      scope.setFingerprint(this.options.fingerprint);
    if (this.options.extra) scope.setExtras(this.options.extra);
    if (this.options.tags) scope.setTags(this.options.tags);

    if (this.options.transformers)
      this.options.transformers.forEach((transformer) => transformer(scope));
    if (localTransformers)
      localTransformers.forEach((transformer) => transformer(scope));

    captureException(exception);
  }

  private shouldReport(exception: any): boolean {
    if (!this.options.filters) return true;

    // If all filters pass, then we do not report
    return this.options.filters.every(({ type, filter }) => {
      return !(exception instanceof type && (!filter || filter(exception)));
    });
  }
}

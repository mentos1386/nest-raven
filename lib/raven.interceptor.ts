import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import {
  HttpArgumentsHost,
  RpcArgumentsHost,
  WsArgumentsHost,
} from "@nestjs/common/interfaces";
import { Reflector } from "@nestjs/core";
import type { GqlContextType, GraphQLArgumentsHost } from "@nestjs/graphql";
import {
  Scope,
  addRequestDataToEvent,
  captureException,
  withScope,
} from "@sentry/node";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { RAVEN_LOCAL_TRANSFORMERS_METADATA } from "./raven.decorators";
import {
  IRavenInterceptorOptions,
  IRavenScopeTransformerFunction,
} from "./raven.interfaces";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
let GqlArgumentsHost: any;
try {
  ({ GqlArgumentsHost } = require("@nestjs/graphql"));
} catch (e) {}

@Injectable()
export class RavenInterceptor implements NestInterceptor {
  constructor(
    private readonly options: IRavenInterceptorOptions = {},
    private readonly reflector: Reflector = new Reflector(),
  ) {}

  intercept<T>(context: ExecutionContext, next: CallHandler): Observable<T> {
    const localTransformers = this.reflector.get<
      IRavenScopeTransformerFunction[]
    >(RAVEN_LOCAL_TRANSFORMERS_METADATA, context.getHandler());

    // first param would be for events, second is for errors
    return next.handle().pipe<T>(
      tap({
        error: (exception) => {
          if (this.shouldReport(exception)) {
            withScope((scope) => {
              switch (context.getType<GqlContextType>()) {
                case "http":
                  this.addHttpExceptionMetadatas(scope, context.switchToHttp());
                  return this.captureException(
                    scope,
                    exception,
                    localTransformers,
                    context,
                  );
                case "ws":
                  this.addWsExceptionMetadatas(scope, context.switchToWs());
                  return this.captureException(
                    scope,
                    exception,
                    localTransformers,
                    context,
                  );
                case "rpc":
                  this.addRpcExceptionMetadatas(scope, context.switchToRpc());
                  return this.captureException(
                    scope,
                    exception,
                    localTransformers,
                    context,
                  );
                case "graphql":
                  if (!GqlArgumentsHost)
                    return this.captureException(
                      scope,
                      exception,
                      localTransformers,
                      context,
                    );
                  this.addGraphQLExceptionMetadatas(
                    scope,
                    GqlArgumentsHost.create(context),
                  );
                  return this.captureException(
                    scope,
                    exception,
                    localTransformers,
                    context,
                  );
                default:
                  return this.captureException(
                    scope,
                    exception,
                    localTransformers,
                    context,
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
    const data = addRequestDataToEvent(
      {},
      context?.req || context,
      this.options.include
        ? { include: this.options.include }
        : {
            include: {
              request: this.options.request,
              transaction: this.options.transaction,
              user: this.options.user,
            },
          },
    );
    scope.setExtra("req", data.request);
    data.extra && scope.setExtras(data.extra);
    if (data.user) scope.setUser(data.user);

    // GraphQL Specifics
    const info = gqlHost.getInfo();
    scope.setExtra("fieldName", info.fieldName);
    const args = gqlHost.getArgs();
    scope.setExtra("args", args);
  }

  private addHttpExceptionMetadatas(
    scope: Scope,
    http: HttpArgumentsHost,
  ): void {
    const data = addRequestDataToEvent(
      {},
      http.getRequest(),
      this.options.include
        ? { include: this.options.include }
        : {
            include: {
              request: this.options.request,
              transaction: this.options.transaction,
              user: this.options.user,
            },
          },
    );

    scope.setExtra("req", data.request);
    data.extra && scope.setExtras(data.extra);
    if (data.user) scope.setUser(data.user);
  }

  private addRpcExceptionMetadatas(scope: Scope, rpc: RpcArgumentsHost): void {
    scope.setExtra("rpc_data", rpc.getData());
  }

  private addWsExceptionMetadatas(scope: Scope, ws: WsArgumentsHost): void {
    scope.setExtra("ws_client", ws.getClient());
    scope.setExtra("ws_data", ws.getData());
  }

  private captureException<T>(
    scope: Scope,
    exception: T,
    localTransformers: IRavenScopeTransformerFunction[] | undefined,
    context: ExecutionContext,
  ): void {
    if (this.options.level) scope.setLevel(this.options.level);
    if (this.options.fingerprint)
      scope.setFingerprint(this.options.fingerprint);
    if (this.options.extra) scope.setExtras(this.options.extra);
    if (this.options.tags) scope.setTags(this.options.tags);

    if (this.options.transformers) {
      for (const transformer of this.options.transformers) {
        transformer(scope, context);
      }
    }
    if (localTransformers) {
      for (const transformer of localTransformers) {
        transformer(scope, context);
      }
    }

    captureException(exception);
  }

  shouldReport<T>(exception: T): boolean {
    if (!this.options.filters) return true;

    // If all filters pass, then we do not report
    return this.options.filters.every(({ type, filter }) => {
      return !(exception instanceof type && (!filter || filter(exception)));
    });
  }
}

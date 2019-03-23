import {
  ExecutionContext, Injectable,
  NestInterceptor,
  CallHandler,
} from '@nestjs/common';
import { IRavenInterceptorOptions } from './raven.interfaces';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as Sentry from '@sentry/minimal'
import { Scope } from '@sentry/hub';
import { RpcArgumentsHost, WsArgumentsHost, HttpArgumentsHost } from '@nestjs/common/interfaces';

@Injectable()
export class RavenInterceptor implements NestInterceptor {
  
  constructor(
    private readonly options: IRavenInterceptorOptions = { context: 'Http' },
  ) {
  }
  
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const http = context.switchToHttp();
    const ws = context.switchToWs();
    const rpc = context.switchToRpc();

    // Default to Http as conteext
    if (!this.options.context) this.options.context = 'Http';

    // first param would be for events, second is for errors
    return next.handle()
    .pipe(
      tap(null, (exception) => {
        if (this.shouldReport(exception)) {
          Sentry.withScope(scope => {
            // TODO: When https://github.com/nestjs/nest/issues/1581 gets implemented switch to that
            switch(this.options.context){
              case 'Http': return this.captureHttpException(scope, http, exception);
              case 'Ws': return this.captureWsException(scope, ws, exception);
              case 'Rpc': return this.captureRpcException(scope, rpc, exception);
            }
          });
        }
      })
    );
  }

  private captureHttpException(scope: Scope, http: HttpArgumentsHost, exception): void {
    scope.setExtra('req', http.getRequest());
    scope.setExtra('res', http.getResponse());

    if (http.getRequest() && http.getRequest().user) scope.setUser(http.getRequest().user);

    this.captureException(scope, exception);
  }

  private captureRpcException(scope: Scope, rpc: RpcArgumentsHost, exception): void {
    scope.setExtra('rpc_data', rpc.getData());

    this.captureException(scope, exception)
  }

  private captureWsException(scope: Scope, ws: WsArgumentsHost, exception): void {
    scope.setExtra('ws_client', ws.getClient());
    scope.setExtra('ws_data', ws.getData());

    this.captureException(scope, exception)
  }

  private captureException(scope: Scope, exception): void {
    if (this.options.level) scope.setLevel(this.options.level);
    if (this.options.fingerprint) scope.setFingerprint(this.options.fingerprint);
    if (this.options.extra) for (const key in this.options.extra) {
      if(this.options.extra.hasOwnProperty(key)) scope.setExtra(key, this.options.extra[key]);
    }
    for (const tag in this.options.tags) {
      scope.setTag(tag, this.options.tags[tag])
    }

    Sentry.captureException(exception);
  }
  
  private shouldReport(exception: any): boolean {
    if (!this.options.filters) return true;
    
    // If all filters pass, then we do not report
    return this.options.filters
      .every(({type, filter}) => {
        return !(exception instanceof type && (!filter || filter(exception)));
      });
  }
}

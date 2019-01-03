import {
  ExecutionContext, Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { IRavenInterceptorOptions } from './raven.interfaces';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as Sentry from '@sentry/minimal'
import { Scope } from '@sentry/hub';

@Injectable()
export class RavenInterceptor implements NestInterceptor {
  
  constructor(
    private readonly options: IRavenInterceptorOptions = {},
  ) {
  }
  
  intercept(
    context: ExecutionContext,
    call$: Observable<any>,
  ): Observable<any> {
    const httpRequest = context.switchToHttp().getRequest();
    const userData = httpRequest ? httpRequest.user : null;
    
    // first param would be for events, second is for errors
    return call$.pipe(
      tap(null, (exception) => {
        if (this.shouldReport(exception)) {
          Sentry.withScope(scope => this.captureException(scope, httpRequest, userData, exception));
        }
      })
    );
  }

  private captureException(scope: Scope, httpRequest, userData, exception): void {
    scope.setExtra('req', httpRequest);
    if (userData) scope.setUser(userData)
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

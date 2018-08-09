import {
  ExecutionContext, Inject, Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { RAVEN_SENTRY_PROVIDER } from './raven.constants';
import { IRavenInterceptorOptions } from './raven.interfaces';
import * as Raven from 'raven';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export abstract class AbstractRavenInterceptor implements NestInterceptor {
  
  protected abstract readonly options: IRavenInterceptorOptions = {};
  
  constructor(
    @Inject(RAVEN_SENTRY_PROVIDER) private ravenClient: Raven.Client,
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
          this.ravenClient.captureException(
            exception as any,
            {
              req: httpRequest,
              user: userData,
              tags: this.options.tags,
              fingerprint: this.options.fingerprint,
              level: this.options.level,
              extra: this.options.extra,
            });
        }
      })
    );
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

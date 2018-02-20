import {
  ExecutionContext, Inject, Interceptor,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs/Observable';
import { RAVEN_SENTRY_PROVIDER } from './raven.constants';
import * as Raven from 'raven';
import 'rxjs/add/operator/do';
import { IRavenInterceptorOptions } from './raven.interfaces';

@Interceptor()
export abstract class AbstractRavenInterceptor implements NestInterceptor {

  protected abstract readonly options: IRavenInterceptorOptions = {};

  constructor(
    @Inject(RAVEN_SENTRY_PROVIDER) private ravenClient: Raven.Client,
  ) {
  }

  intercept(
    dataOrRequest: any,
    context: ExecutionContext,
    stream$: Observable<any>,
  ): Observable<any> | Promise<Observable<any>> {
    // first param would be for events, second is for errors
    return stream$.do(null, (exception) => {
      if (this.shouldReport(exception)) {
        this.ravenClient.captureException(
          exception as any,
          {
            req: dataOrRequest,
            user: dataOrRequest.user,
            tags: this.options.tags,
            fingerprint: this.options.fingerprint,
            level: this.options.level,
          });
      }
    });
  }

  private shouldReport(exception: any): boolean {
    if (!this.options.filters) return true;

    // If all filters pass, then we do not report
    return this.options.filters
    .every(({ type, filter }) => {
      return !(exception instanceof type && (!filter || filter(exception)));
    });
  }
}

import { mixin } from '@nestjs/common';
import { AbstractRavenInterceptor } from './raven.interceptor.abstract';
import { IRavenInterceptorOptions } from './raven.interfaces';

// tslint:disable-next-line:function-name
export function RavenInterceptor(
  options?: IRavenInterceptorOptions,
) {
  return mixin(class extends AbstractRavenInterceptor {
    protected readonly options = options;
  });
}

import * as Raven from 'raven';

export interface IRavenConfig {
  dsn: string;
  options: Raven.ConstructorOptions;
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
  tags?: { [key: string]: string };
  extra?: { [key: string]: any };
  fingerprint?: string[];
  level?: string;
}

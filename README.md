<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="http://kamilmysliwiec.com/public/nest-logo.png#1" alt="Nest Logo" /></a>
  <a href="https://sentry.io" target="_blank"><img src="https://sentry-brand.storage.googleapis.com/sentry-logo-black.png" width="380"></a>
</p>


<p align="center">Sentry Raven Module for Nest framework</p>

## Description

This's a [Raven](https://github.com/getsentry/raven-node) module for [Nest](https://github.com/nestjs/nest).

## Installation

```bash
$ npm i --save nest-raven raven @types/raven
```

## Quick Start

### Include Module
Configuration can be directly provided, or taken from ENV.

[Optional Settings](https://docs.sentry.io/clients/node/config/#optional-settings)
can be provided as second argument.

> app.module.ts

```ts
@Module({
    imports: [
        ...
        RavenModule.forRoot('https://your:sdn@sentry.io/290747'),
    ]
})
export class ApplicationModule implements NestModule {
}

```

### Using Interceptor
> app.controller.ts

```ts
  @UseInterceptors(RavenInterceptor())
  @Get('/some/route')
  public async someRoute() {
    ...
  }
```

With this setup, sentry will pick up all exceptions (even 400 types).

#### Filters
Sometimes we don't want to catch all exceptions but only 500 or those
that we didn't handle properly. For that we can add filters on interceptor
to filter out good exceptions.

> app.controller.ts

```ts
  @UseInterceptors(RavenInterceptor({
    filters: [
        // Filter exceptions of type HttpException. Ignore those that
        // have status code of less than 500
        { type: HttpException, filter: (exception: HttpException) => 500 > exception.getStatus() }
    ],
  }))
  @Get('/some/route')
  public async someRoute() {
    ...
  }
```

#### Additional data
Interceptor automatically adds `req` and `req.user` (as user) to additional data.

Other additional data can be added for each interceptor.
 * tags
 * extra
 * fingerprint
 * level

> app.controller.ts

```ts
  @UseInterceptors(RavenInterceptor({
    tags: {
      type: 'fileUpload',
    },
    level: 'warning',
  }))
  @Get('/some/route')
  public async someRoute()
    ...
  }
```


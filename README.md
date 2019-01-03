<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="http://kamilmysliwiec.com/public/nest-logo.png#1" alt="Nest Logo" />   </a>
  <a href="https://sentry.io" target="_blank"><img src="https://sentry-brand.storage.googleapis.com/sentry-logo-black.png" width="380"></a>
</p>

<p align="center">Sentry Raven Module for Nest framework</p>

<p align="center">
<a href="https://www.npmjs.com/package/nest-raven"><img src="https://img.shields.io/npm/v/nest-raven.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/package/nest-raven"><img src="https://img.shields.io/npm/l/nest-raven.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/package/nest-raven"><img src="https://img.shields.io/npm/dm/nest-raven.svg" alt="NPM Downloads" /></a>
<a href="https://travis-ci.org/mentos1386/nest-raven"><img src="https://travis-ci.org/mentos1386/nest-raven.svg?branch=master" alt="Travis build" /></a>
<a href="https://coveralls.io/github/mentos1386/nest-raven"><img src="https://coveralls.io/repos/github/mentos1386/nest-raven/badge.svg?branch=master" alt="Coveralls" /></a>
</p>

## Description
This's a [@sentry/minimal](https://github.com/getsentry/sentry-javascript/tree/master/packages/minimal) module for [Nest](https://github.com/nestjs/nest).

## Installation

```bash
$ npm i --save nest-raven
```

### Versions

 * **3.x** Is for nest v5.x and introduces @sentry/minimal
 * **2.x** Is for Nest v5.x
 * **1.x** Is for Nest v4.x

#### Breaking Changes in version 3.x
- Client needs to be initialised by the user (outside of this module).
- Instead of `@UseInterceptors(RavenInterceptor())` you now have to do `@UseInterceptors(new RavenInterceptor())`
- When importing, you just specify module, there is no need for calling `forRoot()` anymore.

## Quick Start

### Include Module
For Module to work you need to [setup Sentry SDK yourself](https://docs.sentry.io/error-reporting/quickstart/?platform=node),
this should be done in your `main.ts` file where you initialize the NestJS application.

> app.module.ts

```ts
@Module({
    imports: [
        ...
        RavenModule,
    ]
})
export class ApplicationModule implements NestModule {
}

```

### Using Interceptor
> app.controller.ts

```ts
  @UseInterceptors(new RavenInterceptor())
  @Get('/some/route')
  public async someRoute() {
    ...
  }
```

With this setup, sentry will pick up all exceptions (even 400 types).

#### Global
If you want to set up interceptor as global, you have to follow Nest
instructions [here](https://docs.nestjs.com/interceptors). Something like
this:

> app.module.ts

```ts
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
      RavenModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useValue: new RavenInterceptor(),
    },
  ],
})
export class ApplicationModule {}
```

#### Filters
Sometimes we don't want to catch all exceptions but only 500 or those
that we didn't handle properly. For that we can add filters on interceptor
to filter out good exceptions.

> app.controller.ts

```ts
  @UseInterceptors(new RavenInterceptor({
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
  @UseInterceptors(new RavenInterceptor({
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

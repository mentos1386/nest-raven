<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="http://kamilmysliwiec.com/public/nest-logo.png#1" alt="Nest Logo" />   </a>
  <a href="https://sentry.io" target="_blank"><img src="https://sentry-brand.storage.googleapis.com/sentry-logo-black.png" width="380"></a>
</p>

<p align="center">Sentry Raven Module for Nest framework</p>

<p align="center">
<a href="https://www.npmjs.com/package/nest-raven"><img src="https://img.shields.io/npm/v/nest-raven.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/package/nest-raven"><img src="https://img.shields.io/npm/l/nest-raven.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/package/nest-raven"><img src="https://img.shields.io/npm/dm/nest-raven.svg" alt="NPM Downloads" /></a>
<a href="https://github.com/mentos1386/nest-raven/actions?query=workflow%3AMaster"><img src="https://github.com/mentos1386/nest-raven/workflows/Master/badge.svg?event=push" alt="Push Github Actions" /></a>
<a href="https://coveralls.io/github/mentos1386/nest-raven"><img src="https://coveralls.io/repos/github/mentos1386/nest-raven/badge.svg?branch=master" alt="Coveralls" /></a>
</p>

## Description

This's a [@sentry/minimal](https://github.com/getsentry/sentry-javascript/tree/master/packages/minimal) module for [Nest](https://github.com/nestjs/nest).

## Installation

```bash
$ npm i --save nest-raven
```

## Quick Start

### Include Module

For Module to work you need to [setup Sentry SDK yourself](https://docs.sentry.io/error-reporting/quickstart/?platform=node),
this should be done in your `main.ts` file where you initialize the NestJS application.

> app.module.ts

```ts
@Module({
  imports: [RavenModule],
})
export class ApplicationModule implements NestModule {}
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
this. This only works for Controllers not for Gateways (limitation by NestJS):

> app.module.ts

```ts
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [RavenModule],
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

#### Transformers

It may be useful to add some extra data to the Sentry's context before sending
the payload. Adding some request-related properties for instance. To achieve
this we can add scope transformers on interceptor to injecte some data
dynamically.

> app.controller.ts

```ts
  @UseInterceptors(new RavenInterceptor({
    transformers: [
        // Add an extra property to Sentry's scope
        (scope: Scope) => { scope.addExtra('important key', 'useful value') }
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

- tags
- extra
- fingerprint
- level

> app.controller.ts

```ts
import { Severity } from '@sentry/node';

  @UseInterceptors(new RavenInterceptor({
    tags: {
      type: 'fileUpload',
    },
    level: Severity.Warning,
  }))
  @Get('/some/route')
  public async someRoute()
    ...
  }
```

#### Websockets

> **Note:** Websockets ignore Global interceptors.

It will add `ws_client` and `ws_data` extras.

> app.gateway.ts

```ts
  @UseInterceptors(new RavenInterceptor())
  @SubscribeMessage('message_name')
  public someMessage(client, data: string): string {
    ...
  }
```

#### GraphQL

It will add `fieldName` and `args` extras.

> app.gateway.ts

```ts
  @Mutation()
  @UseInterceptors(new RavenInterceptor())
  async upvotePost(@Args('postId') postId: number) {
    ...
  }
```

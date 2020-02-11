import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { RavenInterceptor } from '../../lib';
import { GqlModule } from './gql/gql.module';

@Module({
  imports: [
    GraphQLModule.forRoot({
      autoSchemaFile: 'example/src/schema.gql',
      debug: true,
      playground: true,
    }),
    GqlModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useValue: new RavenInterceptor({
        withGraphQL: true,
      }),
    },
  ],
})
export class AppModule {}

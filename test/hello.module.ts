import { RavenModule } from '../lib';
import { Module } from '@nestjs/common';
import { HelloController } from './hello.controller';

@Module({
  imports: [
      RavenModule.forRoot('https://your:sdn@sentry.io/290747'),
  ],
  controllers: [
    HelloController
  ]
})
export class HelloModule {
}
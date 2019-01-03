import { RavenModule } from '../lib';
import { Module } from '@nestjs/common';
import { HelloController } from './hello.controller';

@Module({
  imports: [
    RavenModule,
  ],
  controllers: [
    HelloController
  ]
})
export class HelloModule {
}
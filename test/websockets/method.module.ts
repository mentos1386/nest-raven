import { RavenModule } from '../../lib';
import { Module } from '@nestjs/common';
import { MethodGateway } from './method.gateway';

@Module({
  imports: [
    RavenModule,
  ],
  providers: [
    MethodGateway,
  ]
})
export class MethodModule {
}
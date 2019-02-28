import { RavenModule } from '../lib';
import { Module } from '@nestjs/common';
import { WebSocketsGateway } from './websockets.gateway';

@Module({
  imports: [
    RavenModule,
  ],
  providers: [
    WebSocketsGateway,
  ]
})
export class WebsocketsModule {
}
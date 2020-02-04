import { RavenModule } from '../../lib';
import { Module } from '@nestjs/common';
import { MethodController } from './method.controller';

@Module({
  imports: [RavenModule],
  controllers: [MethodController],
})
export class MethodModule {}

import { Module } from '@nestjs/common';
import { GqlResolver } from './gql.resolver';

@Module({
  providers: [GqlResolver],
})
export class GqlModule {}

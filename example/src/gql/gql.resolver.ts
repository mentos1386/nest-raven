import { Resolver, Query } from '@nestjs/graphql';
import { ForbiddenError } from 'apollo-server-express';

@Resolver('Gql')
export class GqlResolver {
  @Query(() => Boolean)
  async forbidden() {
    throw new ForbiddenError('forbidden');
  }
}

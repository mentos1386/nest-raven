import { Resolver, Query } from '@nestjs/graphql';
import { ForbiddenError } from 'apollo-server-errors';
import { ForbiddenException } from '@nestjs/common';

@Resolver('Gql')
export class GqlResolver {
  @Query(() => Boolean)
  async forbiddenError() {
    throw new ForbiddenError('forbidden');
  }

  @Query(() => Boolean)
  async forbiddenException() {
    throw new ForbiddenException();
  }
}

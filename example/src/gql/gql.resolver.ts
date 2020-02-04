import { Resolver, Query } from '@nestjs/graphql';
import { ForbiddenError, AuthenticationError } from 'apollo-server-errors';
import { ForbiddenException, UseInterceptors } from '@nestjs/common';
import { Severity } from '@sentry/node'
import { RavenInterceptor } from '../../../lib';

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

  @UseInterceptors(new RavenInterceptor({ level: Severity.Warning }))
  @Query(() => Boolean)
  async authenticationError () {
    throw new AuthenticationError('AuthenticationError')
  }
}

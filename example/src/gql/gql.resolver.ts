import { Resolver, Query } from '@nestjs/graphql';
import {
  ForbiddenException,
  UseInterceptors,
  UnauthorizedException,
} from '@nestjs/common';
import { Severity } from '@sentry/node';
import { RavenInterceptor } from '../../../lib';

@Resolver('Gql')
export class GqlResolver {
  @Query(() => Boolean)
  async forbiddenException() {
    throw new ForbiddenException();
  }

  @UseInterceptors(new RavenInterceptor({ level: Severity.Warning }))
  @Query(() => Boolean)
  async unauthorizedException() {
    throw new UnauthorizedException();
  }
}

import {
  ForbiddenException,
  UnauthorizedException,
  UseInterceptors,
} from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import { RavenInterceptor } from '../../../lib';

@Resolver('Gql')
export class GqlResolver {
  @Query(() => Boolean)
  async forbiddenException() {
    throw new ForbiddenException();
  }

  @UseInterceptors(new RavenInterceptor({ level: 'warning' }))
  @Query(() => Boolean)
  async unauthorizedException() {
    throw new UnauthorizedException();
  }
}

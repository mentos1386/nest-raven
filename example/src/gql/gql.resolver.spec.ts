import { Test, TestingModule } from '@nestjs/testing';
import { GqlResolver } from './gql.resolver';

describe('GqlResolver', () => {
  let resolver: GqlResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GqlResolver],
    }).compile();

    resolver = module.get<GqlResolver>(GqlResolver);
  });

  it('should be defined', () => expect(resolver).toBeDefined());

  it('apollo-server-errors (AuthenticationError)', () =>
    expect(
      resolver.authenticationError(),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`"AuthenticationError"`));

  it('apollo-server-errors (Forbidden)', () =>
    expect(
      resolver.forbiddenError(),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`"forbidden"`));

  it('@nestjs/common (Forbidden)', () =>
    expect(
      resolver.forbiddenException(),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`"Forbidden"`));
});

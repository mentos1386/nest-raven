import { Test, TestingModule } from "@nestjs/testing";
import { GqlResolver } from "./gql.resolver";

describe("GqlResolver", () => {
  let resolver: GqlResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GqlResolver],
    }).compile();

    resolver = module.get<GqlResolver>(GqlResolver);
  });

  it("should be defined", () => expect(resolver).toBeDefined());

  it("UnauthorizedException", () =>
    expect(
      resolver.unauthorizedException(),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`"Unauthorized"`));

  it("@nestjs/common (Forbidden)", () =>
    expect(
      resolver.forbiddenException(),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`"Forbidden"`));
});

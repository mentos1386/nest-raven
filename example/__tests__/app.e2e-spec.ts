import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { createTestClient } from 'apollo-server-testing';
import gql from 'graphql-tag';
import { AppModule } from './../src/app.module';

describe('AppModule', () => {
  let app: INestApplication;
  let apolloClient: ReturnType<typeof createTestClient>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const module: GraphQLModule = moduleFixture.get<GraphQLModule>(
      GraphQLModule,
    );
    // apolloServer is protected, we need to cast module to any to get it
    apolloClient = createTestClient((module as any).apolloServer);
  });

  afterAll(() => app.close());

  it('defined', () => expect(app).toBeDefined());

  it('/ (GET)', () =>
    request(app.getHttpServer())
      .get('/')
      .expect(500));

  it('/graphql (GET)', () =>
    request(app.getHttpServer())
      .get('/graphql')
      .expect(400));

  it('/graphql(POST) forbiddenError warning', async () => {
    const { query } = apolloClient;
    const result = await query({
      query: gql`
        query {
          authenticationError
        }
      `,
      variables: {},
    });
    expect(result.errors).toMatchInlineSnapshot(`
      Array [
        [GraphQLError: AuthenticationError],
      ]
    `);
  });

  it('/graphql(POST) forbiddenError', async () => {
    const { query } = apolloClient;
    const result = await query({
      query: gql`
        query {
          forbiddenError
        }
      `,
      variables: {},
    });
    expect(result.errors).toMatchInlineSnapshot(`
      Array [
        [GraphQLError: forbidden],
      ]
    `);
  });
});

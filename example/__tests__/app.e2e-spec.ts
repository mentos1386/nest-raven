import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { ApolloServer } from '@apollo/server';
import gql from 'graphql-tag';
import { GraphQLError } from 'graphql';
import { AppModule } from './../src/app.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';

describe('AppModule', () => {
  let app: INestApplication;
  let apolloClient: ApolloServer;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const graphqlModule = app.get<GraphQLModule<ApolloDriver>>(GraphQLModule);
    apolloClient = graphqlModule.graphQlAdapter?.instance;
  });

  afterAll(() => app.close());

  it('defined', () => expect(app).toBeDefined());

  it('/ (GET)', () => request(app.getHttpServer()).get('/').expect(500));

  it('/graphql (GET)', () =>
    request(app.getHttpServer()).get('/graphql').expect(400));

  it('/graphql(POST) forbiddenError warning', async () => {
    const result = await apolloClient.executeOperation({
      query: gql`
        query {
          unauthorizedException
        }
      `,
      variables: {},
    });
    expect(
      result.body.kind === 'single' && result.body.singleResult.errors,
    ).toEqual([new GraphQLError('Unauthorized')]);
  });

  it('/graphql(POST) forbiddenError', async () => {
    const result = await apolloClient.executeOperation({
      query: gql`
        query {
          forbiddenException
        }
      `,
      variables: {},
    });
    expect(
      result.body.kind === 'single' && result.body.singleResult.errors,
    ).toEqual([new GraphQLError('Forbidden')]);
  });
});

import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getCurrentHub } from '@sentry/hub';
import { GlobalModule } from './global.module';

declare var global: any;

describe('Http:Global', () => {
  let app: INestApplication;
  const client = {
    captureException: jest.fn(async () => Promise.resolve()),
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [GlobalModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  beforeEach(() => {
    global.__SENTRY__ = {
      hub: undefined,
    };
    client.captureException.mockClear();
    getCurrentHub().pushScope();
    getCurrentHub().bindClient(client);
  });

  it(`/GET error`, async () => {
    await request(app.getHttpServer())
      .get('/error')
      .expect(500);

    expect(client.captureException.mock.calls[0][0]).toBeInstanceOf(Error);
  });

  afterAll(async () => {
    await app.close();
  });
});

import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { GlobalModule } from './global.module';
import { getCurrentHub } from '@sentry/hub';

declare var global: any;

describe('Global', () => {
  let app: INestApplication;
  const client = {
    captureException: jest.fn(async () => Promise.resolve()),
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [GlobalModule],
    })
    .compile();

    app = module.createNestApplication();
    await app.init();
  });

  beforeEach(() => {
    global.__SENTRY__ = {
      hub: undefined,
    };
  });

  it(`/GET error`, async () => {
    getCurrentHub().withScope(async () => {
      getCurrentHub().bindClient(client);

      await request(app.getHttpServer())
      .get('/error')
      .expect(500);
      
      expect(client.captureException.mock.calls[0][0]).toBeInstanceOf(Error);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
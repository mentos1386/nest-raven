import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HelloModule } from './hello.module';
import { INestApplication } from '@nestjs/common';
import { getCurrentHub } from '@sentry/hub';

declare var global: any;

describe('Hello', () => {
  let app: INestApplication;
  const client = {
    captureException: jest.fn(async () => Promise.resolve()),
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [HelloModule],
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

  it(`/GET works`, async () => {
    getCurrentHub().withScope(async () => {
      getCurrentHub().bindClient(client);
      await request(app.getHttpServer())
      .get('/works')
      .expect(200);
  
      expect(client.captureException.mock.calls).toBeNull();
    });
  });

  it(`/GET intercepted`, async () => {
    getCurrentHub().withScope(async () => {
      getCurrentHub().bindClient(client);

      await request(app.getHttpServer())
      .get('/intercepted')
      .expect(500);

      expect(client.captureException.mock.calls[0][0]).toBeInstanceOf(Error);
    });
  });

  it(`/GET filter`, async () => {
    getCurrentHub().withScope(async () => {
      getCurrentHub().bindClient(client);
    
      await request(app.getHttpServer())
      .get('/filter')
      .expect(404);

    });
  });

  it(`/GET tags`, async () => {
    getCurrentHub().withScope(async () => {
      getCurrentHub().bindClient(client);

      await request(app.getHttpServer())
      .get('/tags')
      .expect(500);

      expect(client.captureException.mock.calls[0][0]).toBeInstanceOf(Error);

      // TODO: Figure out how to check for scope changes!
      console.log(global.__SENTRY__);
    });
  });

  it(`/GET extra`, async () => {
    await request(app.getHttpServer())
    .get('/extra')
    .expect(500);

    expect(ravenData).not.toBeNull();
    expect(ravenData.error).toBeInstanceOf(Error);
    expect(ravenData.options.extra).toEqual({ 'A': 'AAA', 'B': 'BBB' });
  });

  it(`/GET fingerprint`, async () => {
    await request(app.getHttpServer())
    .get('/fingerprint')
    .expect(500);

    expect(ravenData).not.toBeNull();
    expect(ravenData.error).toBeInstanceOf(Error);
    expect(ravenData.options.fingerprint).toEqual(["A", "B"]);
  });

  it(`/GET level`, async () => {
    await request(app.getHttpServer())
    .get('/level')
    .expect(500);

    expect(ravenData).not.toBeNull();
    expect(ravenData.error).toBeInstanceOf(Error);
    expect(ravenData.options.level).toEqual("CRAZY");
  });

  afterAll(async () => {
    await app.close();
  });
});
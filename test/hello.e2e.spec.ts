import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HelloModule } from './hello.module';
import { RAVEN_SENTRY_PROVIDER } from '../lib';
import { INestApplication } from '@nestjs/common';
import { CaptureOptions } from 'raven';

describe('Hello', () => {
  let app: INestApplication;
  let ravenData: {
    error: Error,
    options: CaptureOptions,
  };
  let ravenSentry = {
    captureException: (error: Error, options?: CaptureOptions) => ravenData = { error, options },
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [HelloModule],
    })
    .overrideProvider(RAVEN_SENTRY_PROVIDER)
    .useValue(ravenSentry)
    .compile();

    app = module.createNestApplication();
    await app.init();
  });

  beforeEach(() => ravenData = null);

  it(`/GET works`, async () => {
    await request(app.getHttpServer())
    .get('/works')
    .expect(200);

    expect(ravenData).toBeNull();
  });

  it(`/GET intercepted`, async () => {
    await request(app.getHttpServer())
    .get('/intercepted')
    .expect(500);

    expect(ravenData).not.toBeNull();
    expect(ravenData.error).toBeInstanceOf(Error);
  });

  it(`/GET filter`, async () => {
    await request(app.getHttpServer())
    .get('/filter')
    .expect(404);

    expect(ravenData).toBeNull();
  });

  it(`/GET tags`, async () => {
    await request(app.getHttpServer())
    .get('/tags')
    .expect(500);

    expect(ravenData).not.toBeNull();
    expect(ravenData.error).toBeInstanceOf(Error);
    expect(ravenData.options.tags).toEqual({ 'A': 'AAA', 'B': 'BBB' });
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
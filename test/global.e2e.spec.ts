import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { RAVEN_SENTRY_PROVIDER } from '../lib';
import { INestApplication } from '@nestjs/common';
import { CaptureOptions } from 'raven';
import { GlobalModule } from './global.module';

describe('Global', () => {
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
      imports: [GlobalModule],
    })
    .overrideProvider(RAVEN_SENTRY_PROVIDER)
    .useValue(ravenSentry)
    .compile();

    app = module.createNestApplication();
    await app.init();
  });

  beforeEach(() => ravenData = null);

  it(`/GET error`, async () => {
    await request(app.getHttpServer())
    .get('/error')
    .expect(500);

    expect(ravenData).not.toBeNull();
    expect(ravenData.error).toBeInstanceOf(Error);
  });

  afterAll(async () => {
    await app.close();
  });
});
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getCurrentHub } from '@sentry/hub';
import { Severity } from '@sentry/types';
import { MethodModule } from './method.module';

declare var global: any;

describe('Http:Method', () => {
  let app: INestApplication;
  const client = {
    captureException: jest.fn(),
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [MethodModule],
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
    getCurrentHub().bindClient(client as any);
  });

  afterEach(() => {
    getCurrentHub().popScope();
  });

  it(`/GET works`, async () => {
    await request(app.getHttpServer()).get('/works').expect(200);

    expect(client.captureException.mock.calls).toEqual([]);
  });

  it(`/GET intercepted`, async () => {
    await request(app.getHttpServer()).get('/intercepted').expect(500);

    expect(client.captureException.mock.calls[0][0]).toMatchInlineSnapshot(
      `[Error: Something bad happened]`,
    );
    expect(client.captureException.mock.calls[0][2]._extra).toHaveProperty(
      'req',
    );
  });

  it(`/GET filter`, async () => {
    await request(app.getHttpServer()).get('/filter').expect(404);

    expect(client.captureException.mock.calls).toEqual([]);
  });

  it(`/GET transformer`, async () => {
    await request(app.getHttpServer()).get('/transformer').expect(500);

    expect(client.captureException.mock.calls[0][0]).toMatchInlineSnapshot(
      `[Error: Something bad happened]`,
    );
    expect(client.captureException.mock.calls[0][2]._extra).toHaveProperty(
      'A',
      'AAA',
    );
  });

  it(`/GET tags`, async () => {
    await request(app.getHttpServer()).get('/tags').expect(500);

    expect(client.captureException.mock.calls[0][0]).toMatchInlineSnapshot(
      `[Error: Something bad happened]`,
    );
    expect(client.captureException.mock.calls[0][2]._tags).toEqual({
      A: 'AAA',
      B: 'BBB',
    });
  });

  it(`/GET extra`, async () => {
    await request(app.getHttpServer()).get('/extra').expect(500);

    expect(client.captureException.mock.calls[0][0]).toMatchInlineSnapshot(
      `[Error: Something bad happened]`,
    );
    expect(client.captureException.mock.calls[0][2]._extra).toHaveProperty(
      'A',
      'AAA',
    );
    expect(client.captureException.mock.calls[0][2]._extra).toHaveProperty(
      'B',
      'BBB',
    );
  });

  it(`/GET fingerprint`, async () => {
    await request(app.getHttpServer()).get('/fingerprint').expect(500);

    expect(client.captureException.mock.calls[0][0]).toMatchInlineSnapshot(
      `[Error: Something bad happened]`,
    );
    expect(client.captureException.mock.calls[0][2]._fingerprint).toEqual([
      'A',
      'B',
    ]);
  });

  it(`/GET level`, async () => {
    await request(app.getHttpServer()).get('/level').expect(500);

    expect(client.captureException.mock.calls[0][0]).toMatchInlineSnapshot(
      `[Error: Something bad happened]`,
    );
    expect(client.captureException.mock.calls[0][2]._level).toEqual(
      Severity.Critical,
    );
  });

  afterAll(async () => {
    await app.close();
  });
});

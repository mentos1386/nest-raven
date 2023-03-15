import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getCurrentHub } from '@sentry/node';
import { SeverityLevel } from '@sentry/types';
import request from 'supertest';
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
    await request(app.getHttpServer()).get('/transformer?foo=bar').expect(500);

    expect(client.captureException.mock.calls[0][0]).toMatchInlineSnapshot(
      `[Error: Something bad happened]`,
    );
    expect(client.captureException.mock.calls[0][2]._extra).toHaveProperty(
      'A',
      'AAA',
    );
    expect(client.captureException.mock.calls[0][2]._extra).toHaveProperty(
      'REQ',
      'bar',
    );
  });

  it(`/GET local-transformer`, async () => {
    await request(app.getHttpServer()).get('/local-transformer').expect(500);

    expect(client.captureException.mock.calls[0][0]).toMatchInlineSnapshot(
      `[Error: Something bad happened]`,
    );
    expect(client.captureException.mock.calls[0][2]._extra).toHaveProperty(
      'A',
      'AAA',
    );
  });

  it(`/GET combo-transformer`, async () => {
    await request(app.getHttpServer()).get('/combo-transformer').expect(500);

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
    expect(
      client.captureException.mock.calls[0][2]._level,
    ).toEqual<SeverityLevel>('fatal');
  });

  afterAll(async () => {
    await app.close();
  });
});

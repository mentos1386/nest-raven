import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getCurrentHub } from '@sentry/hub';
import { GlobalModule } from './global.module';
import * as io from 'socket.io-client';

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

  it(`emit: test_error`, async () => {
    const socket = io.connect('http://localhost:4466')

    await new Promise((resolve, reject) => {
      socket.on('connect', () => {
        if (!socket.connected) reject(new Error('Socket not connected!'));

        socket.emit('test_error');
        setTimeout(resolve, 1000); // Hacky way to "wait" for server to finish it's stuff
      });
    })

    expect(client.captureException.mock.calls[0][0]).toBeInstanceOf(Error);
  });

  afterAll(async () => {
    await app.close();
  });
});
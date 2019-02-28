import * as io from 'socket.io-client';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getCurrentHub } from '@sentry/hub';
import { WebsocketsModule } from './websockets.module';

declare var global: any;

describe('Websockets', () => {
  let app: INestApplication;
  const client = {
    captureException: jest.fn(async () => Promise.resolve()),
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [WebsocketsModule],
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


  it(`emit: test_error`, async () => {
    const socket = io.connect('http://localhost:4455')

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

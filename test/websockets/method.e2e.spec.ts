import * as io from 'socket.io-client';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getCurrentHub } from '@sentry/hub';
import { MethodModule } from './method.module';

declare var global: any;

describe('Websockets:Method', () => {
  let app: INestApplication;
  let socket: SocketIOClient.Socket;
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
    getCurrentHub().bindClient(client);
    socket = io.connect('http://localhost:4466');
  });

  afterEach(() => {
    socket.disconnect();
  });

  it(`emit:test_error`, async () => {
    await new Promise((resolve, reject) => {
      socket.on('connect', () => {
        if (!socket.connected) reject(new Error('Socket not connected!'));

        socket.emit('test_error');
        setTimeout(resolve, 1000); // Hacky way to "wait" for server to finish it's stuff
      });
    });

    expect(client.captureException.mock.calls[0][0]).toMatchInlineSnapshot(
      `[Error: Something bad happened]`,
    );
  });

  afterAll(async () => {
    await app.close();
  });
});

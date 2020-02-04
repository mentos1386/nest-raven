import * as io from 'socket.io-client';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getCurrentHub } from '@sentry/hub';
import { ClassModule } from './class.module';

declare var global: any;

describe('Websockets:Class', () => {
  let app: INestApplication;
  let socket: SocketIOClient.Socket;
  const client = {
    captureException: jest.fn(async () => Promise.resolve()),
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [ClassModule],
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
    socket = io.connect('http://localhost:4455');
  });

  afterEach(() => {
    socket.disconnect();
  });

  it(`emit:test_error`, async () => {
    const socket = io.connect('http://localhost:4444');

    await new Promise((resolve, reject) => {
      socket.on('connect', () => {
        if (!socket.connected) reject(new Error('Socket not connected!'));

        socket.emit('test_error');
        setTimeout(resolve, 1000); // Hacky way to "wait" for server to finish it's stuff
      });
    });

    expect(client.captureException.mock.calls[0][0]).toBeInstanceOf(Error);
  });

  afterAll(async () => {
    await app.close();
  });
});

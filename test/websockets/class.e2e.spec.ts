import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { getCurrentHub } from "@sentry/node";
import { io } from "socket.io-client";
import { ClassModule } from "./class.module";

declare let global: any;

describe("Websockets:Class", () => {
  let app: INestApplication;
  const client = {
    captureException: jest.fn(),
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
    getCurrentHub().bindClient(client as any);
  });

  it("emit:test_error", async () => {
    const socket = io("http://localhost:4444");

    await new Promise((resolve, reject) => {
      socket.on("connect", () => {
        if (!socket.connected) reject(new Error("Socket not connected!"));

        socket.emit("test_error");
        setTimeout(resolve, 1000); // Hacky way to "wait" for server to finish it's stuff
      });
    });

    expect(client.captureException.mock.calls[0][0]).toMatchInlineSnapshot(
      "[Error: Something bad happened]",
    );

    socket.disconnect();
  });

  afterAll(async () => {
    await app.close();
  });
});

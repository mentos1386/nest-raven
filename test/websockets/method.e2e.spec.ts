import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { getCurrentHub } from "@sentry/node";
import { io } from "socket.io-client";
import { MethodModule } from "./method.module";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
declare let global: any;

describe("Websockets:Method", () => {
  let app: INestApplication;
  let socket: ReturnType<typeof io>;
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
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    getCurrentHub().bindClient(client as any);
    socket = io("http://localhost:4466");
  });

  afterEach(() => {
    socket.disconnect();
  });

  it("emit:test_error", async () => {
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
  });

  afterAll(async () => {
    await app.close();
  });
});

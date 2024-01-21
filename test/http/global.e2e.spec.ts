import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { getCurrentHub } from "@sentry/node";
import request from "supertest";
import { GlobalModule } from "./global.module";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
declare let global: any;

describe("Http:Global", () => {
  let app: INestApplication;
  const client = {
    captureException: jest.fn(),
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [GlobalModule],
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
  });

  it("/GET error", async () => {
    await request(app.getHttpServer()).get("/error").expect(500);

    expect(client.captureException.mock.calls[0][0]).toBeInstanceOf(Error);
  });

  afterAll(async () => {
    await app.close();
  });
});

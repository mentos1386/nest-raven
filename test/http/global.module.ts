import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { RavenInterceptor, RavenModule } from "../../lib";
import { GlobalController } from "./global.controller";

@Module({
  imports: [RavenModule],
  controllers: [GlobalController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useValue: new RavenInterceptor(),
    },
  ],
})
export class GlobalModule {}

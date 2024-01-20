import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { RavenInterceptor, RavenModule } from "../../lib";
import { classGateway } from "./class.gateway";

@Module({
  imports: [RavenModule],
  providers: [
    classGateway,
    {
      provide: APP_INTERCEPTOR,
      useValue: new RavenInterceptor(),
    },
  ],
})
export class ClassModule {}

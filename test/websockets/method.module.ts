import { Module } from "@nestjs/common";
import { RavenModule } from "../../lib";
import { MethodGateway } from "./method.gateway";

@Module({
  imports: [RavenModule],
  providers: [MethodGateway],
})
export class MethodModule {}

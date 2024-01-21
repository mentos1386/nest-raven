import { Module } from "@nestjs/common";
import { RavenModule } from "../../lib";
import { MethodController } from "./method.controller";

@Module({
  imports: [RavenModule],
  controllers: [MethodController],
})
export class MethodModule {}

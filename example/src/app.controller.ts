import { Controller, Get, UseInterceptors } from "@nestjs/common";
import { RavenInterceptor } from "../../lib";
import { AppService } from "./app.service";

@Controller()
@UseInterceptors(new RavenInterceptor())
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}

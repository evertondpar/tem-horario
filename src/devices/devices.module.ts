import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DevicesController } from "./devices.controller";
import { DevicesService } from "./devices.service";
import { Device } from "./entities/device.entity";
import { FirebaseModule } from "src/firebase/firebase.module";

@Module({
  imports: [TypeOrmModule.forFeature([Device]), FirebaseModule],
  controllers: [DevicesController],
  providers: [DevicesService],
  exports: [DevicesService],
})
export class DevicesModule {}

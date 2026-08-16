// schedules/schedules.module.ts
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SchedulesService } from "./schedules.service";
import { SchedulesController } from "./schedules.controller";
import { Schedule } from "./entities/schedule.entity";
import { Collaborator } from "src/collaborators/entities/collaborator.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Schedule, Collaborator])],
  controllers: [SchedulesController],
  providers: [SchedulesService],
  exports: [SchedulesService],
})
export class SchedulesModule {}

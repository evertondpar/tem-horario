// collaborators/collaborators.module.ts
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CollaboratorsService } from "./collaborators.service";
import { CollaboratorsController } from "./collaborators.controller";
import { Collaborator } from "./entities/collaborator.entity";
import { Schedule } from "src/schedules/entities/schedule.entity";
import { SchedulesService } from "src/schedules/schedules.service";
import { CollaboratorService } from "src/collaborator-service/entities/collaborator-service.entity";
import { CollaboratorServiceService } from "src/collaborator-service/collaborator-service.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Collaborator, Schedule, CollaboratorService]),
  ],
  controllers: [CollaboratorsController],
  providers: [
    CollaboratorsService,
    SchedulesService,
    CollaboratorServiceService,
  ],
  exports: [CollaboratorsService],
})
export class CollaboratorsModule {}

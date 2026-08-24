import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Appointment } from "src/appointments/entities/appointment.entity";
import { CollaboratorService } from "src/collaborator-service/entities/collaborator-service.entity";
import { Collaborator } from "src/collaborators/entities/collaborator.entity";
import { Schedule } from "src/schedules/entities/schedule.entity";
import { DevelopmentController } from "./development.controller";
import { DevelopmentService } from "./development.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Appointment,
      Collaborator,
      CollaboratorService,
      Schedule,
    ]),
  ],
  controllers: [DevelopmentController],
  providers: [DevelopmentService],
})
export class DevelopmentModule {}

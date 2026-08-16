import { Module } from "@nestjs/common";
import { EstablishmentsService } from "./establishments.service";
import { EstablishmentsController } from "./establishments.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Establishment } from "./entities/establishment.entity";
import { Service } from "src/services/entities/service.entity";
import { Collaborator } from "src/collaborators/entities/collaborator.entity";
import { Appointment } from "src/appointments/entities/appointment.entity";
import { CollaboratorService } from "src/collaborator-service/entities/collaborator-service.entity";
import { SchedulesModule } from "src/schedules/schedules.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Establishment,
      Service,
      Collaborator,
      Appointment,
      CollaboratorService,
    ]),
    SchedulesModule,
  ],
  controllers: [EstablishmentsController],
  providers: [EstablishmentsService],
  exports: [EstablishmentsService],
})
export class EstablishmentsModule {}

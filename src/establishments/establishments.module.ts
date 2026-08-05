import { Module } from "@nestjs/common";
import { EstablishmentsService } from "./establishments.service";
import { EstablishmentsController } from "./establishments.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Establishment } from "./entities/establishment.entity";
import { Service } from "src/services/entities/service.entity";
import { Collaborator } from "src/collaborators/entities/collaborator.entity";
import { Appointment } from "src/appointments/entities/appointment.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Establishment,
      Service,
      Collaborator,
      Appointment,
    ]),
  ],
  controllers: [EstablishmentsController],
  providers: [EstablishmentsService],
})
export class EstablishmentsModule {}

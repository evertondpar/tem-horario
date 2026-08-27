// appointments/appointments.module.ts
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppointmentsService } from "./appointments.service";
import { AppointmentsController } from "./appointments.controller";
import { Appointment } from "./entities/appointment.entity";
import { Schedule } from "src/schedules/entities/schedule.entity";
import { Service } from "src/services/entities/service.entity";
import { CollaboratorService } from "src/collaborator-service/entities/collaborator-service.entity";
import { Collaborator } from "src/collaborators/entities/collaborator.entity";
import { AuthModule } from "src/auth/auth.module";
import { Client } from "src/clients/entities/client.entity";
import { DevicesModule } from "src/devices/devices.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Appointment,
      Schedule,
      Service,
      CollaboratorService,
      Collaborator,
      Client,
    ]),
    AuthModule,
    DevicesModule,
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}

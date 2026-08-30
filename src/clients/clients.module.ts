import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ClientsService } from "./clients.service";
import { ClientsController } from "./clients.controller";
import { Client } from "./entities/client.entity";
import { Establishment } from "../establishments/entities/establishment.entity";
import { Service } from "../services/entities/service.entity";
import { Collaborator } from "../collaborators/entities/collaborator.entity";
import { AuthModule } from "../auth/auth.module";
import { CloudinaryModule } from "../cloudinary/cloudinary.module";
import { Favorite } from "./entities/favorite.entity";
import { Review } from "./entities/review.entity";
import { Appointment } from "../appointments/entities/appointment.entity";
import { Device } from "../devices/entities/device.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Client, Establishment, Service, Collaborator, Favorite, Review, Appointment, Device]),
    AuthModule,
    CloudinaryModule,
  ],
  controllers: [ClientsController],
  providers: [ClientsService],
  exports: [ClientsService],
})
export class ClientsModule {}

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ClientsService } from "./clients.service";
import { ClientsController } from "./clients.controller";
import { Client } from "./entities/client.entity";
import { Establishment } from "../establishments/entities/establishment.entity";
import { Service } from "../services/entities/service.entity";
import { Collaborator } from "../collaborators/entities/collaborator.entity";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Client, Establishment, Service, Collaborator]),
    AuthModule,
  ],
  controllers: [ClientsController],
  providers: [ClientsService],
  exports: [ClientsService],
})
export class ClientsModule {}

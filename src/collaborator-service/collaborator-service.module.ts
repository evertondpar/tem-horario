// collaborator-service/collaborator-service.module.ts
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CollaboratorServiceService } from "./collaborator-service.service";
import { CollaboratorServiceController } from "./collaborator-service.controller";
import { CollaboratorService } from "./entities/collaborator-service.entity";
import { AuthModule } from "../auth/auth.module";
import { Service } from "../services/entities/service.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([CollaboratorService, Service]),
    AuthModule,
  ],
  controllers: [CollaboratorServiceController],
  providers: [CollaboratorServiceService],
  exports: [CollaboratorServiceService],
})
export class CollaboratorServiceModule {}

// collaborator-service/collaborator-service.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollaboratorServiceService } from './collaborator-service.service';
import { CollaboratorServiceController } from './collaborator-service.controller';
import { CollaboratorService } from './entities/collaborator-service.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CollaboratorService])],
  controllers: [CollaboratorServiceController],
  providers: [CollaboratorServiceService],
  exports: [CollaboratorServiceService],
})
export class CollaboratorServiceModule {}

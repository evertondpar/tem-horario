// collaborator-service/dto/update-collaborator-service.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateCollaboratorServiceDto } from './create-collaborator-service.dto';

export class UpdateCollaboratorServiceDto extends PartialType(
  CreateCollaboratorServiceDto,
) {}

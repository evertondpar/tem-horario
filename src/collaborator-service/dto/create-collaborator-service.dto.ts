/* eslint-disable @typescript-eslint/no-unsafe-call */
// collaborator-service/dto/create-collaborator-service.dto.ts
import { IsInt, IsPositive } from "class-validator";

export class CreateCollaboratorServiceDto {
  @IsInt()
  @IsPositive()
  service_id: number;
}

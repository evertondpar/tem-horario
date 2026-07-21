/* eslint-disable @typescript-eslint/no-unsafe-call */
// collaborators/dto/create-collaborator.dto.ts
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateCollaboratorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;
  @IsString()
  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsString()
  photo?: string;
}

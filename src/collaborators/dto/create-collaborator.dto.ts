/* eslint-disable @typescript-eslint/no-unsafe-call */
// collaborators/dto/create-collaborator.dto.ts
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateCollaboratorDto {
  @IsInt()
  @IsPositive()
  establishment_id: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsOptional()
  @IsString()
  photo?: string;
}

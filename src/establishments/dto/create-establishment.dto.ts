/* eslint-disable @typescript-eslint/no-unsafe-call */
// establishments/dto/create-establishment.dto.ts
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateEstablishmentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsOptional()
  @IsString()
  photo?: string;

  @IsString()
  @IsNotEmpty()
  open_hour: string;

  @IsString()
  @IsNotEmpty()
  close_hour: string;
}

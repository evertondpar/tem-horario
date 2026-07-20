/* eslint-disable @typescript-eslint/no-unsafe-call */
// clients/dto/create-client.dto.ts
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateClientDto {
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

/* eslint-disable @typescript-eslint/no-unsafe-call */
// services/dto/create-service.dto.ts
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from "class-validator";

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @IsPositive()
  duration_minutes: number;

  @IsNumber()
  @IsPositive()
  price: number;
}

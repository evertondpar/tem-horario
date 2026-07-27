/* eslint-disable @typescript-eslint/no-unsafe-call */
// appointments/dto/create-appointment.dto.ts
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
} from "class-validator";
import { AppointmentStatus } from "../entities/appointment.entity";

export class CreateAppointmentDto {
  @IsInt()
  @IsPositive()
  collaborator_id: number;

  @IsString()
  client_name: string;
  @IsString()
  client_phone: string;

  @IsInt()
  @IsPositive()
  service_id: number;

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @IsString()
  appointment_date: string; // 2026-07-25

  @IsString()
  start_time: string; // 14:00
}

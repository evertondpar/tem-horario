/* eslint-disable @typescript-eslint/no-unsafe-call */
// appointments/dto/create-appointment.dto.ts
import { IsEnum, IsInt, IsOptional, IsPositive } from 'class-validator';
import { AppointmentStatus } from '../entities/appointment.entity';

export class CreateAppointmentDto {
  @IsInt()
  @IsPositive()
  collaborator_id: number;

  @IsInt()
  @IsPositive()
  client_id: number;

  @IsInt()
  @IsPositive()
  service_id: number;

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @IsInt()
  @IsPositive()
  start_at: number;

  @IsInt()
  @IsPositive()
  end_at: number;
}

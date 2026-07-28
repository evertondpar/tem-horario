/* eslint-disable @typescript-eslint/no-unsafe-call */
// appointments/dto/create-appointment.dto.ts
import { IsString } from "class-validator";
import { AppointmentStatus } from "../entities/appointment.entity";

export class ChangeAppointmentStatusDto {
  @IsString()
  status: AppointmentStatus;
}

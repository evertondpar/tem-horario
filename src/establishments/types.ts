import { Appointment } from "src/appointments/entities/appointment.entity";
import { Collaborator } from "src/collaborators/entities/collaborator.entity";
import { Service } from "src/services/entities/service.entity";
import { Establishment } from "./entities/establishment.entity";

export interface DashboardResponse {
  establishment: Pick<Establishment, "id" | "name" | "phone" | "photo">;
  services: Partial<Service>[];
  collaborators: Partial<Collaborator>[];
  appointments: Partial<Appointment>[];
}
export interface ListCollaboratorsResponse {
  collaborators: (Omit<Collaborator, "password" | "collaboratorServices"> & {
    services: Partial<Service>[];
  })[];
}

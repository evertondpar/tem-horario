// appointments/entities/appointment.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Collaborator } from "../../collaborators/entities/collaborator.entity";
import { Service } from "../../services/entities/service.entity";
import { Establishment } from "src/establishments/entities/establishment.entity";

export enum AppointmentStatus {
  SCHEDULED = "scheduled",
  CONFIRMED = "confirmed",
  REFUSED = "refused",
  CANCELED = "canceled",
  COMPLETED = "completed",
}

@Entity("appointments")
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  collaborator_id: number;
  @Column()
  establishment_id: number;

  @ManyToOne(() => Collaborator, (collaborator) => collaborator.appointments)
  @JoinColumn({ name: "collaborator_id" })
  collaborator: Collaborator;
  @ManyToOne(() => Establishment, (establishment) => establishment.appointments)
  @JoinColumn({ name: "establishment_id" })
  establishment: Establishment;

  @Column()
  client_name: string;
  @Column()
  client_phone: string;

  @Column()
  service_id: number;

  @ManyToOne(() => Service, (service) => service.appointments)
  @JoinColumn({ name: "service_id" })
  service: Service;

  @Column({
    type: "enum",
    enum: AppointmentStatus,
    default: AppointmentStatus.SCHEDULED,
  })
  status: AppointmentStatus;

  @Column()
  appointment_date: string;
  @Column()
  start_time: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

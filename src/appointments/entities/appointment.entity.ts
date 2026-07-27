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
import { Client } from "../../clients/entities/client.entity";
import { Service } from "../../services/entities/service.entity";

export enum AppointmentStatus {
  SCHEDULED = "scheduled",
  CONFIRMED = "confirmed",
  CANCELED = "canceled",
  COMPLETED = "completed",
}

@Entity("appointments")
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  collaborator_id: number;

  @ManyToOne(() => Collaborator, (collaborator) => collaborator.appointments)
  @JoinColumn({ name: "collaborator_id" })
  collaborator: Collaborator;

  @Column()
  client_name: string;
  @Column()
  client_phone: string;

  // @Column()
  // client_id: number;

  // @ManyToOne(() => Client, (client) => client.appointments)
  // @JoinColumn({ name: "client_id" })
  // client: Client;

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

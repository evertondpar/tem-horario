// collaborators/entities/collaborator.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { Establishment } from "../../establishments/entities/establishment.entity";
import { Schedule } from "../../schedules/entities/schedule.entity";
import { CollaboratorService } from "../../collaborator-service/entities/collaborator-service.entity";
import { Appointment } from "../../appointments/entities/appointment.entity";

@Entity("collaborators")
export class Collaborator {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  establishment_id: number;

  @ManyToOne(
    () => Establishment,
    (establishment) => establishment.collaborators,
  )
  @JoinColumn({ name: "establishment_id" })
  establishment: Establishment;

  @Column()
  name: string;

  @Column()
  phone: string;
  @Column()
  password: string;

  @Column({ nullable: true })
  photo: string;

  @OneToOne(() => Schedule, (schedule) => schedule.collaborator)
  schedule: Schedule;

  @OneToMany(() => CollaboratorService, (cs) => cs.collaborator)
  collaboratorServices: CollaboratorService[];

  @OneToMany(() => Appointment, (appointment) => appointment.collaborator)
  appointments: Appointment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

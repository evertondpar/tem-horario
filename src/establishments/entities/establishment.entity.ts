// establishments/entities/establishment.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Service } from "../../services/entities/service.entity";
import { Collaborator } from "../../collaborators/entities/collaborator.entity";
import { Appointment } from "../../appointments/entities/appointment.entity";

@Entity("establishments")
export class Establishment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  phone: string;
  @Column({ default: "" })
  address: string;

  @Column({ default: "" })
  zip_code: string;

  @Column({ default: "" })
  street: string;

  @Column({ default: "" })
  address_number: string;

  @Column({ default: "" })
  address_complement: string;

  @Column({ default: "" })
  neighborhood: string;

  @Column({ default: "" })
  city: string;

  @Column({ length: 2, default: "" })
  state: string;

  @Column({ nullable: true })
  photo: string;

  @Column({ nullable: true })
  cover_photo: string;

  @Column({ type: "tinyint", default: 50 })
  cover_position: number;

  @Column({ type: "text", nullable: true })
  description: string | null;

  @Column({ type: "text", nullable: true })
  cancellation_policy: string | null;

  @Column()
  open_hour: string;

  @Column()
  close_hour: string;

  @OneToMany(() => Service, (service) => service.establishment)
  services: Service[];

  @OneToMany(() => Collaborator, (collaborator) => collaborator.establishment)
  collaborators: Collaborator[];
  @OneToMany(() => Appointment, (appointment) => appointment.collaborator)
  appointments: Appointment[];

  @Column({ select: false })
  password: string;

  @Column({ default: true })
  onboarding_completed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

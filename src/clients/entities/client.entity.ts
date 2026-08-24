// clients/entities/client.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Appointment } from "../../appointments/entities/appointment.entity";

@Entity("clients")
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  phone: string;

  @Column({ type: "varchar", nullable: true, select: false })
  password: string | null;

  @Column({ nullable: true })
  photo: string;

  @OneToMany(() => Appointment, (appointment) => appointment.client)
  appointments: Appointment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

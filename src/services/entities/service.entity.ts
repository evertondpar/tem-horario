// services/entities/service.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Establishment } from '../../establishments/entities/establishment.entity';
import { CollaboratorService } from '../../collaborator-service/entities/collaborator-service.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  establishment_id: number;

  @ManyToOne(() => Establishment, (establishment) => establishment.services)
  @JoinColumn({ name: 'establishment_id' })
  establishment: Establishment;

  @Column()
  name: string;

  @Column()
  duration_minutes: number;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @OneToMany(() => CollaboratorService, (cs) => cs.service)
  collaboratorServices: CollaboratorService[];

  @OneToMany(() => Appointment, (appointment) => appointment.service)
  appointments: Appointment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

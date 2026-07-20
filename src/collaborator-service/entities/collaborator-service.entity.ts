// collaborator-service/entities/collaborator-service.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Collaborator } from '../../collaborators/entities/collaborator.entity';
import { Service } from '../../services/entities/service.entity';

@Entity('collaborator_service')
export class CollaboratorService {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  collaborator_id: number;

  @ManyToOne(
    () => Collaborator,
    (collaborator) => collaborator.collaboratorServices,
  )
  @JoinColumn({ name: 'collaborator_id' })
  collaborator: Collaborator;

  @Column()
  service_id: number;

  @ManyToOne(() => Service, (service) => service.collaboratorServices)
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

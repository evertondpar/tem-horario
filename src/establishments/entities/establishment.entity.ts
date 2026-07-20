// establishments/entities/establishment.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Service } from '../../services/entities/service.entity';
import { Collaborator } from '../../collaborators/entities/collaborator.entity';

@Entity('establishments')
export class Establishment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  photo: string;

  @Column()
  open_hour: string;

  @Column()
  close_hour: string;

  @OneToMany(() => Service, (service) => service.establishment)
  services: Service[];

  @OneToMany(() => Collaborator, (collaborator) => collaborator.establishment)
  collaborators: Collaborator[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

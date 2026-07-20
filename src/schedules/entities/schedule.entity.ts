// schedules/entities/schedule.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Collaborator } from '../../collaborators/entities/collaborator.entity';

@Entity('schedules')
export class Schedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  collaborator_id: number;

  @OneToOne(() => Collaborator, (collaborator) => collaborator.schedule)
  @JoinColumn({ name: 'collaborator_id' })
  collaborator: Collaborator;

  @Column('json', { nullable: true })
  monday: Record<string, any>;

  @Column('json', { nullable: true })
  tuesday: Record<string, any>;

  @Column('json', { nullable: true })
  wednesday: Record<string, any>;

  @Column('json', { nullable: true })
  thursday: Record<string, any>;

  @Column('json', { nullable: true })
  friday: Record<string, any>;

  @Column('json', { nullable: true })
  saturday: Record<string, any>;

  @Column('json', { nullable: true })
  sunday: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

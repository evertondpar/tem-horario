import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("establishment_reviews")
@Index(["client_id", "establishment_id"], { unique: true })
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  client_id: number;

  @Column()
  establishment_id: number;

  @Column({ type: "tinyint" })
  rating: number;

  @Column({ type: "varchar", length: 500, nullable: true })
  comment: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

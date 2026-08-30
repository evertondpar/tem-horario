import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity("client_favorites")
@Index(["client_id", "establishment_id"], { unique: true })
export class Favorite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  client_id: number;

  @Column()
  establishment_id: number;

  @CreateDateColumn()
  createdAt: Date;
}

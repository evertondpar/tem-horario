import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export enum UserRole {
  ESTABLISHMENT = "establishment",
  COLLABORATOR = "collaborator",
  CLIENT = "client",
}

export enum PushPlatform {
  WEB = "web",
  ANDROID = "android",
  IOS = "ios",
}

@Entity("device")
export class Device {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column({ type: "enum", enum: UserRole })
  user_role: UserRole;

  @Column({ unique: true })
  token: string;

  @Column({
    type: "enum",
    enum: PushPlatform,
    default: PushPlatform.WEB,
  })
  platform: PushPlatform;

  @Column({ default: true })
  active: boolean;

  @Column({ type: "datetime", nullable: true })
  last_seen_at: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

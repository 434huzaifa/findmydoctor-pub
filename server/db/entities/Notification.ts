import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("notifications")
export class Notification {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", default: "inapp" })
  channel!: "inapp" | "sms";

  @Column({ type: "varchar" })
  targetType!: "appointment" | "consultation";

  @Column({ type: "int" })
  targetId!: number;

  @Column({ type: "varchar" })
  recipientPhone!: string;

  @Column({ type: "text" })
  message!: string;

  @Column({ type: "varchar", default: "pending" })
  status!: "pending" | "sent" | "failed";

  @Column({ type: "timestamptz" })
  scheduledFor!: Date;

  @Column({ type: "timestamptz", nullable: true })
  sentAt!: Date | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}

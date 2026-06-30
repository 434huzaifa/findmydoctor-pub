import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("messages")
export class Message {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255 })
  senderName!: string;

  @Column({ type: "varchar", length: 20 })
  senderPhone!: string;

  @Column({ type: "text" })
  message!: string;

  @Column({ type: "varchar", default: "pending" })
  status!: string; // 'pending', 'read', 'replied'

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}

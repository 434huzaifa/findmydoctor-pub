import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Doctor } from "./Doctor";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", unique: true })
  email!: string;

  @Column({ type: "varchar" })
  password!: string;

  @Column({ type: "varchar", default: "doctor" })
  role!: "doctor" | "admin";

  @ManyToOne(() => Doctor, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "doctorId" })
  doctor!: Doctor | null;

  @Column({ type: "int", nullable: true, unique: true })
  doctorId!: number | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}

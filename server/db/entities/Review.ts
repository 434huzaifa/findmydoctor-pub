import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Appointment } from "./Appointment";
import { Doctor } from "./Doctor";

@Entity("reviews")
export class Review {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Appointment, { onDelete: "CASCADE" })
  @JoinColumn({ name: "appointmentId" })
  appointment!: Appointment;

  @Column({ type: "int" })
  appointmentId!: number;

  @ManyToOne(() => Doctor, { onDelete: "CASCADE" })
  @JoinColumn({ name: "doctorId" })
  doctor!: Doctor;

  @Column({ type: "int" })
  doctorId!: number;

  @Column({ type: "varchar" })
  patientName!: string;

  @Column({ type: "varchar" })
  patientPhone!: string;

  @Column({ type: "int" })
  rating!: number;

  @Column({ type: "text", nullable: true })
  comment!: string | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}

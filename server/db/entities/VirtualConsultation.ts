import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import type { Doctor } from "./Doctor";

export enum ConsultationStatus {
  WAITING = "waiting",
  ACTIVE = "active",
  DONE = "done",
}

@Entity("virtual_consultations")
export class VirtualConsultation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int", nullable: false })
  doctorId!: number;

  @Column({ type: "varchar", length: 255, nullable: false })
  patientName!: string;

  @Column({ type: "varchar", length: 20, nullable: false })
  patientPhone!: string;

  @Column({
    type: "enum",
    enum: ConsultationStatus,
    default: ConsultationStatus.WAITING,
    nullable: false,
  })
  status!: ConsultationStatus;

  @Column({ type: "text", nullable: true })
  prescriptionText!: string | null;

  @Column({ type: "varchar", length: 500, nullable: true })
  videoLink!: string | null;

  @ManyToOne("Doctor", { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "doctorId" })
  doctor!: Doctor;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}

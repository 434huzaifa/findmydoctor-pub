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
import { User } from "./User";

@Entity("appointments")
export class Appointment {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "userId" })
  user!: User | null;

  @Column({ type: "int", nullable: true })
  userId!: number | null;

  @ManyToOne(() => Doctor, { onDelete: "CASCADE" })
  @JoinColumn({ name: "doctorId" })
  doctor!: Doctor;

  @Column({ type: "int" })
  doctorId!: number;

  @Column({ type: "varchar" })
  patientName!: string;

  @Column({ type: "varchar" })
  patientPhone!: string;

  @Column({ type: "date" })
  appointmentDate!: string;

  @Column({ type: "varchar" })
  slot!: string;

  @Column({ type: "int" })
  fee!: number;

  @Column({ type: "varchar", default: "confirmed" })
  status!: string;

  @Column({ type: "text", nullable: true })
  prescriptionText!: string | null;

  @Column({ type: "varchar", default: "online" })
  paymentMethod!: "online" | "cash";

  @Column({ type: "varchar", default: "full" })
  paymentChoice!: "full" | "advance";

  @Column({ type: "varchar", default: "paid" })
  paymentStatus!: "paid" | "unpaid" | "partial";

  @Column({ type: "int", nullable: true })
  paidAmount!: number | null;

  @Column({ type: "int", default: 0 })
  amountDue!: number;

  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "paidByUserId" })
  paidByUser!: User | null;

  @Column({ type: "int", nullable: true })
  paidByUserId!: number | null;

  @Column({ type: "timestamptz", nullable: true })
  paidAt!: Date | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Specialty } from "./Specialty";

@Entity("doctors")
export class Doctor {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar" })
  name!: string;

  @ManyToOne(() => Specialty, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "specialtyId" })
  specialty!: Specialty;

  @Column({ type: "int" })
  specialtyId!: number;

  @Column({ type: "varchar" })
  hospital!: string;

  @Column({ type: "varchar" })
  city!: string;

  @Column({ type: "int", default: 0 })
  exp!: number;

  @Column({ type: "int", default: 0 })
  fee!: number;

  @Column({ type: "int", default: 0 })
  advanceFee!: number;

  @Column({ type: "int", default: 0 })
  totalSeats!: number;

  @Column({ type: "int", default: 0 })
  usedSeats!: number;

  @Column({ type: "decimal", precision: 2, scale: 1, default: 4.5 })
  rating!: number;

  @Column({ type: "varchar", default: "" })
  degrees!: string;

  @Column({ type: "varchar", nullable: true })
  chamberAddress!: string | null;

  @Column({ type: "varchar", nullable: true })
  rrule!: string | null;

  @Column({ type: "timestamptz", nullable: true })
  nextAppointment!: Date | null;

  @Column({ type: "varchar", nullable: true })
  chamberOpenTime!: string | null;

  @Column({ type: "varchar", nullable: true })
  chamberCloseTime!: string | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}

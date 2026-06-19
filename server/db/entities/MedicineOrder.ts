import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import type { Medicine } from "./Medicine";

export enum MedicineOrderStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  PROCESSING = "processing",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}

@Entity("medicine_order")
export class MedicineOrder {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int", nullable: false })
  medicineId!: number;

  @Column({ type: "int", default: 1, nullable: false })
  quantity!: number;

  @Column({ type: "varchar", length: 20, nullable: false })
  guestPhone!: string;

  @Column({ type: "varchar", length: 500, nullable: false })
  address!: string;

  @Column({
    type: "enum",
    enum: MedicineOrderStatus,
    default: MedicineOrderStatus.PENDING,
    nullable: false,
  })
  status!: MedicineOrderStatus;

  // ─── Relation ────────────────────────────────────────────────────────────
  @ManyToOne("Medicine", (medicine: Medicine) => medicine.orders, {
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "medicineId" })
  medicine!: Medicine;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}

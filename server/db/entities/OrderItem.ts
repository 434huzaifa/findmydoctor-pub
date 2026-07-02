import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import type { Relation } from "typeorm";
import type { Order } from "./Order";
import type { Medicine } from "./Medicine";

@Entity("order_item")
export class OrderItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int", nullable: false })
  orderId!: number;

  @Column({ type: "int", nullable: false })
  medicineId!: number;

  @Column({ type: "int", default: 1, nullable: false })
  quantity!: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
  unitPrice!: number;

  @ManyToOne("Order", "items", { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "orderId" })
  order!: Relation<Order>;

  @ManyToOne("Medicine", "orderItems", {
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "medicineId" })
  medicine!: Relation<Medicine>;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}

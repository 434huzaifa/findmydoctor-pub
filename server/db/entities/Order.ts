import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import type { Relation } from "typeorm";
import type { OrderItem } from "./OrderItem";

export enum OrderStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  PROCESSING = "processing",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}

@Entity("order")
export class Order {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255, nullable: true })
  guestName!: string | null;

  @Column({ type: "varchar", length: 20, nullable: false })
  guestPhone!: string;

  @Column({ type: "varchar", length: 500, nullable: false })
  address!: string;

  @Column({
    type: "enum",
    enum: OrderStatus,
    default: OrderStatus.PENDING,
    nullable: false,
  })
  status!: OrderStatus;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  total!: number;

  @OneToMany("OrderItem", "order")
  items!: Relation<OrderItem>[];

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}

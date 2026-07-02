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

@Entity("medicine")
export class Medicine {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255, nullable: false })
  name!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  company!: string | null;

  @Column({ type: "varchar", length: 100, nullable: true })
  class!: string | null;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  price!: number;

  @Column({ type: "int", default: 0 })
  stock!: number;

  @Column({ type: "varchar", length: 500, nullable: true })
  imageUrl!: string | null;

  @OneToMany("OrderItem", "medicine")
  orderItems!: Relation<OrderItem>[];

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}

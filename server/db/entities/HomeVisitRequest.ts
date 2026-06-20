import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("home_visit_requests")
export class HomeVisitRequest {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255, nullable: false })
  patientName!: string;

  @Column({ type: "varchar", length: 20, nullable: false })
  phone!: string;

  @Column({ type: "varchar", length: 500, nullable: false })
  address!: string;

  @Column({ type: "text", nullable: true })
  situationDescription!: string | null;

  @Column({ type: "boolean", default: false })
  isPaid!: boolean;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 100 })
  amount!: number;

  @Column({ type: "timestamptz", nullable: true })
  paidAt!: Date | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}

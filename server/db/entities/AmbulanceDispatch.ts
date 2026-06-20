import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Ambulance } from "./Ambulance";

export enum DispatchStatus {
  DISPATCHED = "dispatched",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

@Entity("ambulance_dispatches")
export class AmbulanceDispatch {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int", nullable: false })
  ambulanceId!: number;

  @Column({ type: "varchar", length: 255, nullable: false })
  callerName!: string;

  @Column({ type: "varchar", length: 20, nullable: false })
  callerPhone!: string;

  @Column({ type: "varchar", length: 500, nullable: false })
  pickupLocation!: string;

  @Column({
    type: "enum",
    enum: DispatchStatus,
    default: DispatchStatus.DISPATCHED,
    nullable: false,
  })
  status!: DispatchStatus;

  @ManyToOne(
    () => getAmbulance(),
    (ambulance: Ambulance) => ambulance.dispatches,
    {
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  )
  @JoinColumn({ name: "ambulanceId" })
  ambulance!: Ambulance;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}

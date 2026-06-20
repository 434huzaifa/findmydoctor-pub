import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { AmbulanceDispatch } from "./AmbulanceDispatch";

@Entity("ambulances")
export class Ambulance {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 50, nullable: false })
  vehicleNumber!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  driverName!: string;

  @Column({ type: "varchar", length: 20, nullable: false })
  driverPhone!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  baseLocation!: string;

  @Column({ type: "boolean", default: true })
  isAvailable!: boolean;

  @OneToMany(
    () => AmbulanceDispatch,
    (dispatch: AmbulanceDispatch) => dispatch.ambulance,
  )
  dispatches!: AmbulanceDispatch[];

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}

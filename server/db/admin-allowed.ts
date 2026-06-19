import { EntityTarget, ObjectLiteral } from "typeorm";
import {
  Appointment,
  Doctor,
  Medicine,
  MedicineOrder,
  Specialty,
  User,
} from "./data-source";

export const ALLOWED: Record<string, EntityTarget<ObjectLiteral>> = {
  specialty: Specialty,
  doctor: Doctor,
  user: User,
  appointment: Appointment,
  medicine: Medicine,
  medicine_order: MedicineOrder,
};

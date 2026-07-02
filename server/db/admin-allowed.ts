import { EntityTarget, ObjectLiteral } from "typeorm";
import {
  Appointment,
  Doctor,
  Medicine,
  Order,
  Specialty,
  User,
  Ambulance,
  AmbulanceDispatch,
  HomeVisitRequest,
  VirtualConsultation,
} from "./data-source";

export const ALLOWED: Record<string, EntityTarget<ObjectLiteral>> = {
  specialty: Specialty,
  doctor: Doctor,
  user: User,
  appointment: Appointment,
  medicine: Medicine,
  order: Order,
  ambulance: Ambulance,
  ambulance_dispatch: AmbulanceDispatch,
  home_visit_request: HomeVisitRequest,
  virtual_consultation: VirtualConsultation,
};

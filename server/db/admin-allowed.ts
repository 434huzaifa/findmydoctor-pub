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

// Fields writable only through their dedicated flows (e.g. password hashing on
// register/login) — never through the generic admin table viewer.
const RESTRICTED_FIELDS = new Set(["id", "password", "refreshToken"]);

export function stripRestrictedFields(body: Record<string, unknown>) {
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body)) {
    if (!RESTRICTED_FIELDS.has(key)) clean[key] = value;
  }
  return clean;
}

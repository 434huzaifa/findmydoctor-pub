export type AuthUser = {
  id: number;
  email: string;
  role: "doctor" | "admin";
  doctorId: number | null;
};

export type Specialty = {
  id: number;
  name: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
};

export type Medicine = {
  id: number;
  name: string;
  description: string | null;
  company: string | null;
  class: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Doctor = {
  id: number;
  name: string;
  specialty: Specialty;
  specialtyId: number;
  hospital: string;
  city: string;
  exp: number;
  fee: number;
  advanceFee: number;
  totalSeats: number;
  usedSeats: number;
  rating: number;
  degrees: string;
  chamberAddress: string | null;
  roomNumber: string | null;
  rrule: string | null;
  nextAppointment: string | null;
  chamberOpenTime: string | null;
  chamberCloseTime: string | null;
  isOnlineForVideo: boolean;
  currentVideoLink: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DoctorAvailability = "full" | "limited" | "available";

export type DoctorSort =
  | ""
  | "fee_asc"
  | "fee_desc"
  | "booked_desc"
  | "booked_asc"
  | "rating_asc"
  | "rating_desc";

export type DoctorListParams = {
  page?: string;
  limit?: string;
  search?: string;
  specialty?: string;
  city?: string;
  availability?: DoctorAvailability | "";
  sortBy?: DoctorSort;
};

export type MedicineListParams = {
  page?: string;
  limit?: string;
  search?: string;
  class?: string;
  company?: string;
  sort?: "asc" | "desc";
};

export type MedicineOrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "delivered"
  | "cancelled";

export type MedicineOrder = {
  id: number;
  medicineId: number;
  quantity: number;
  guestName: string | null;
  guestPhone: string;
  address: string;
  status: MedicineOrderStatus;
  medicine: Medicine;
  createdAt: string;
  updatedAt: string;
};

export type Ambulance = {
  id: number;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  baseLocation: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AmbulanceListParams = {
  page?: string;
  limit?: string;
  search?: string;
  availableOnly?: string;
};

export type DispatchStatus = "dispatched" | "completed" | "cancelled";

export type AmbulanceDispatch = {
  id: number;
  ambulanceId: number;
  callerName: string;
  callerPhone: string;
  pickupLocation: string;
  status: DispatchStatus;
  ambulance: Ambulance;
  createdAt: string;
  updatedAt: string;
};

export type HomeVisitRequest = {
  id: number;
  patientName: string;
  phone: string;
  address: string;
  situationDescription: string | null;
  isPaid: boolean;
  amount: number;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ConsultationStatus = "waiting" | "active" | "done";

export type VirtualConsultation = {
  id: number;
  doctorId: number;
  patientName: string;
  patientPhone: string;
  status: ConsultationStatus;
  prescriptionText: string | null;
  videoLink: string | null;
  doctor?: Doctor;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedDoctors = {
  items: Doctor[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type PaginatedMedicines = {
  items: Medicine[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type PaginatedAmbulances = {
  items: Ambulance[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ApiAppointment = {
  id: number;
  doctorId: number;
  userId: number | null;
  patientName: string;
  patientPhone: string;
  appointmentDate: string;
  slot: string;
  fee: number;
  status: string;
  prescriptionText: string | null;
  paymentMethod: "online" | "cash";
  paymentChoice: "full" | "advance";
  paymentStatus: "paid" | "unpaid" | "partial";
  paidAmount: number | null;
  amountDue: number;
  paidAt: string | null;
};

export type PhoneAppointment = ApiAppointment & {
  doctorName: string;
  doctorSpec: string;
  doctorSpecIcon: string;
  doctorHospital: string;
};

export type DoctorDashboard = {
  summary: {
    totalAppointments: number;
    paidAppointments: number;
    partialAppointments: number;
    unpaidAppointments: number;
    expectedAmount: number;
    totalPaid: number;
  };
  items: ApiAppointment[];
};

export type AdminDashboard = {
  doctors: number;
  appointments: number;
  revenue: number;
  medicines: number;
  ambulances: number;
  homeVisits: number;
  consultations: number;
};

export type LoginResult = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
};

export type BookingInfo = {
  appointment: ApiAppointment;
  doctor: Doctor;
} | null;

export type PendingBookingForm = {
  doctorId: number;
  patientName: string;
  patientPhone: string;
  appointmentDate: string;
  slot: string;
};

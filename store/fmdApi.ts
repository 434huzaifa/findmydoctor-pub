import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  AuthUser,
  Doctor,
  Specialty,
  Medicine,
  MedicineOrder,
  Ambulance,
  AmbulanceDispatch,
  HomeVisitRequest,
  VirtualConsultation,
  ApiAppointment,
  PhoneAppointment,
  DoctorDashboard,
  AdminDashboard,
  LoginResult,
  DoctorListParams,
  MedicineListParams,
  AmbulanceListParams,
  PaginatedDoctors,
  PaginatedMedicines,
  PaginatedAmbulances,
} from "@/types/domain";
import type { RootState } from "./index";
import { logout } from "./authSlice";

type OkResponse<T> = { success: true; data: T };
type ErrResponse = { success: false; message: string; code: string };
type Envelope<T> = OkResponse<T> | ErrResponse;

export type SchemaColumn = {
  name: string;
  databaseName: string;
  type: string;
  nullable: boolean;
  isPrimary: boolean;
  isGenerated: boolean;
  default: unknown;
};

export type SchemaTable = {
  key: string;
  tableName: string;
  columns: SchemaColumn[];
};

export type TableRows = {
  rows: Record<string, unknown>[];
  total: number;
  page: number;
  limit: number;
};

export type OtpRequestResult = {
  phone: string;
  otpHint: string;
  expiresInSec: number;
};

export type OtpVerifyResult = { otpToken: string; expiresInSec: number };

export type AdminMedicineOrdersGrouped = {
  status: string;
  label: string;
  count: number;
  rows: Record<string, unknown>[];
};

export type AdminMedicineOrdersResponse = {
  groups: AdminMedicineOrdersGrouped[];
  total: number;
  statuses: string[];
};

export const fmdApi = createApi({
  reducerPath: "fmdApi",
  baseQuery: async (args, api, extra) => {
    const baseUrl =
      typeof window !== "undefined"
        ? "/api/v1"
        : `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/v1`;

    const raw = fetchBaseQuery({
      baseUrl,
      prepareHeaders: (headers, { getState }) => {
        const token = (getState() as RootState).auth.token;
        if (token) headers.set("Authorization", `Bearer ${token}`);
        return headers;
      },
    });

    const result = await raw(args, api, extra);

    if (result.error?.status === 401) {
      api.dispatch(logout());
      return result;
    }

    if (result.data) {
      const env = result.data as Envelope<unknown>;
      if (!env.success)
        return {
          error: {
            status: "CUSTOM_ERROR" as const,
            error: (env as ErrResponse).message ?? "Request failed",
          },
        };
      return { data: (env as OkResponse<unknown>).data };
    }

    return result;
  },
  tagTypes: [
    "Doctors",
    "DoctorDashboard",
    "AdminDashboard",
    "Specialties",
    "Schema",
    "TableRows",
    "Medicines",
    "Ambulances",
    "HomeVisits",
    "Consultations",
    "Messages",
  ],
  endpoints: (build) => ({
    // Auth
    login: build.mutation<LoginResult, { email: string; password: string }>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
    }),
    me: build.query<AuthUser, void>({ query: () => "/auth/me" }),

    // Doctors
    getDoctors: build.query<PaginatedDoctors, DoctorListParams | void>({
      query: (params) => {
        const qs =
          params && Object.keys(params).length
            ? `?${new URLSearchParams(params as Record<string, string>)}`
            : "";
        return `/doctors${qs}`;
      },
      providesTags: ["Doctors"],
    }),
    getFeaturedDoctors: build.query<Doctor[], void>({
      query: () => "/doctors/featured",
      providesTags: ["Doctors"],
    }),
    getSpecialties: build.query<Specialty[], void>({
      query: () => "/doctors/specialties",
    }),
    getDoctorCities: build.query<string[], void>({
      query: () => "/doctors/cities",
    }),
    getDoctor: build.query<Doctor, number>({
      query: (id) => `/doctors/${id}`,
    }),

    // Medicines
    getMedicines: build.query<PaginatedMedicines, MedicineListParams | void>({
      query: (params) => {
        const qs =
          params && Object.keys(params).length
            ? `?${new URLSearchParams(params as Record<string, string>)}`
            : "";
        return `/medicine${qs}`;
      },
      providesTags: ["Medicines"],
    }),
    createMedicineOrder: build.mutation<
      MedicineOrder,
      {
        medicineId: number;
        quantity: number;
        guestName?: string;
        guestPhone: string;
        address: string;
      }
    >({
      query: (body) => ({ url: "/medicine/orders", method: "POST", body }),
      invalidatesTags: ["Medicines"],
    }),

    // Ambulances
    getAmbulances: build.query<PaginatedAmbulances, AmbulanceListParams | void>(
      {
        query: (params) => {
          const qs =
            params && Object.keys(params).length
              ? `?${new URLSearchParams(params as Record<string, string>)}`
              : "";
          return `/ambulances${qs}`;
        },
        providesTags: ["Ambulances"],
      }
    ),
    callAmbulance: build.mutation<
      AmbulanceDispatch,
      {
        ambulanceId: number;
        callerName: string;
        callerPhone: string;
        pickupLocation: string;
      }
    >({
      query: (body) => ({ url: "/ambulances/dispatch", method: "POST", body }),
      invalidatesTags: ["Ambulances"],
    }),
    toggleAmbulanceAvailability: build.mutation<
      Ambulance,
      { id: number; isAvailable: boolean }
    >({
      query: ({ id, ...body }) => ({
        url: `/ambulances/${id}/toggle`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Ambulances"],
    }),

    // Home Visit
    createHomeVisitRequest: build.mutation<
      HomeVisitRequest,
      {
        patientName: string;
        phone: string;
        address: string;
        situationDescription?: string;
      }
    >({
      query: (body) => ({ url: "/home-visit", method: "POST", body }),
      invalidatesTags: ["HomeVisits"],
    }),
    getHomeVisitRequest: build.query<HomeVisitRequest, number>({
      query: (id) => `/home-visit/${id}`,
      providesTags: ["HomeVisits"],
    }),
    simulatePayment: build.mutation<HomeVisitRequest, number>({
      query: (id) => ({
        url: `/home-visit/${id}/simulate-payment`,
        method: "POST",
      }),
      invalidatesTags: ["HomeVisits"],
    }),

    // Virtual Consultations
    joinConsultationQueue: build.mutation<
      VirtualConsultation,
      { doctorId: number; patientName: string; patientPhone: string }
    >({
      query: (body) => ({ url: "/consultations/join", method: "POST", body }),
      invalidatesTags: ["Consultations"],
    }),
    getConsultation: build.query<VirtualConsultation, number>({
      query: (id) => `/consultations/${id}`,
      providesTags: ["Consultations"],
    }),
    getDoctorQueue: build.query<VirtualConsultation[], number>({
      query: (doctorId) => `/consultations/queue/${doctorId}`,
      providesTags: ["Consultations"],
    }),
    acceptPatient: build.mutation<VirtualConsultation, number>({
      query: (id) => ({
        url: `/consultations/${id}/accept`,
        method: "POST",
      }),
      invalidatesTags: ["Consultations"],
    }),
    savePrescription: build.mutation<
      VirtualConsultation,
      { id: number; prescriptionText: string }
    >({
      query: ({ id, prescriptionText }) => ({
        url: `/consultations/${id}/prescription`,
        method: "POST",
        body: { prescriptionText },
      }),
      invalidatesTags: ["Consultations"],
    }),
    completeConsultation: build.mutation<VirtualConsultation, number>({
      query: (id) => ({
        url: `/consultations/${id}/complete`,
        method: "POST",
      }),
      invalidatesTags: ["Consultations"],
    }),
    toggleDoctorOnline: build.mutation<
      Doctor,
      { doctorId: number; isOnlineForVideo: boolean }
    >({
      query: ({ doctorId, isOnlineForVideo }) => ({
        url: `/doctors/${doctorId}/toggle-video`,
        method: "PATCH",
        body: { isOnlineForVideo },
      }),
      invalidatesTags: ["Doctors"],
    }),

    // Online doctors (polled every 5s)
    getOnlineDoctors: build.query<Doctor[], void>({
      query: () => "/doctors/online",
      providesTags: ["Doctors"],
    }),

    // Phone lookup — paginated per type
    phoneLookup: build.query<
      { items: unknown[]; total: number; page: number; limit: number; totalPages: number },
      { phone: string; type: string; page?: number; limit?: number }
    >({
      query: ({ phone, type, page = 1, limit = 5 }) =>
        `/lookup?phone=${encodeURIComponent(phone)}&type=${type}&page=${page}&limit=${limit}`,
    }),

    // Appointments
    createAppointment: build.mutation<ApiAppointment, unknown>({
      query: (body) => ({ url: "/appointments", method: "POST", body }),
      invalidatesTags: ["Doctors"],
    }),
    requestLookupOtp: build.mutation<OtpRequestResult, { phone: string }>({
      query: (body) => ({
        url: "/appointments/otp/request",
        method: "POST",
        body,
      }),
    }),
    verifyLookupOtp: build.mutation<
      OtpVerifyResult,
      { phone: string; code: string }
    >({
      query: (body) => ({
        url: "/appointments/otp/verify",
        method: "POST",
        body,
      }),
    }),
    getAppointmentsByPhone: build.query<
      PhoneAppointment[],
      { phone: string; otpToken: string }
    >({
      query: ({ phone, otpToken }) =>
        `/appointments/by-phone?${new URLSearchParams({ phone, otpToken })}`,
    }),
    getDoctorDashboard: build.query<
      DoctorDashboard,
      { doctorId?: number; from?: string; to?: string } | void
    >({
      query: (params) => {
        const qs = new URLSearchParams();
        if (params?.doctorId) qs.set("doctorId", String(params.doctorId));
        if (params?.from) qs.set("from", params.from);
        if (params?.to) qs.set("to", params.to);
        const s = qs.size ? `?${qs}` : "";
        return `/appointments/doctor/dashboard${s}`;
      },
      providesTags: ["DoctorDashboard"],
    }),
    markAppointmentPaid: build.mutation<
      ApiAppointment,
      { id: number; paidAmount: number; doctorId?: number }
    >({
      query: ({ id, paidAmount, doctorId }) => {
        const qs = doctorId
          ? `?${new URLSearchParams({ doctorId: String(doctorId) })}`
          : "";
        return {
          url: `/appointments/${id}/mark-paid${qs}`,
          method: "PATCH",
          body: { paidAmount },
        };
      },
      invalidatesTags: ["DoctorDashboard"],
    }),

    // Appointment prescription
    saveAppointmentPrescription: build.mutation<
      ApiAppointment,
      { id: number; prescriptionText: string }
    >({
      query: ({ id, prescriptionText }) => ({
        url: `/appointments/${id}/prescription`,
        method: "POST",
        body: { prescriptionText },
      }),
      invalidatesTags: ["DoctorDashboard"],
    }),

    getAdminMedicineOrders: build.query<
      AdminMedicineOrdersResponse,
      void
    >({
      query: () => "/admin/medicine/orders",
      providesTags: ["Medicines"],
    }),
    updateAdminMedicineOrderStatus: build.mutation<
      MedicineOrder,
      { id: number; status: MedicineOrderStatus }
    >({
      query: ({ id, status }) => ({
        url: `/admin/medicine/orders/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Medicines"],
    }),

    // Admin
    getAdminDashboard: build.query<AdminDashboard, void>({
      query: () => "/admin/dashboard",
      providesTags: ["AdminDashboard"],
    }),
    getAdminDoctors: build.query<Doctor[], void>({
      query: () => "/admin/doctors",
      providesTags: ["Doctors"],
    }),
    getSchema: build.query<SchemaTable[], void>({
      query: () => "/admin/schema",
      providesTags: ["Schema"],
    }),
    getTableRows: build.query<
      TableRows,
      { table: string; page?: number; limit?: number }
    >({
      query: ({ table, page = 1, limit = 50 }) =>
        `/admin/tables/${table}?page=${page}&limit=${limit}`,
      providesTags: (_result, _error, arg) => [
        { type: "TableRows", id: arg.table },
      ],
    }),
    createTableRow: build.mutation<
      unknown,
      { table: string; data: Record<string, unknown> }
    >({
      query: ({ table, data }) => ({
        url: `/admin/tables/${table}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "TableRows", id: arg.table },
        "Schema",
        "AdminDashboard",
        "Doctors",
        "Specialties",
      ],
    }),
    updateTableRow: build.mutation<
      unknown,
      { table: string; id: number; data: Record<string, unknown> }
    >({
      query: ({ table, id, data }) => ({
        url: `/admin/tables/${table}/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "TableRows", id: arg.table },
        "Schema",
        "AdminDashboard",
        "Doctors",
        "Specialties",
      ],
    }),
    deleteTableRow: build.mutation<void, { table: string; id: number }>({
      query: ({ table, id }) => ({
        url: `/admin/tables/${table}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "TableRows", id: arg.table },
        "Schema",
        "AdminDashboard",
        "Doctors",
        "Specialties",
      ],
    }),
    getAdminSpecialties: build.query<Specialty[], void>({
      query: () => "/admin/specialties",
      providesTags: ["Specialties"],
    }),
    createAdminSpecialty: build.mutation<
      Specialty,
      { name: string; icon: string }
    >({
      query: (body) => ({ url: "/admin/specialties", method: "POST", body }),
      invalidatesTags: [
        "Specialties",
        "Schema",
        "AdminDashboard",
        { type: "TableRows", id: "specialty" },
      ],
    }),
    createAdminMedicine: build.mutation<Medicine, Partial<Medicine>>({
      query: (body) => ({ url: "/admin/medicine", method: "POST", body }),
      invalidatesTags: [
        "Medicines",
        "Schema",
        "AdminDashboard",
        { type: "TableRows", id: "medicine" },
      ],
    }),
    createAdminDoctor: build.mutation<Doctor, Partial<Doctor>>({
      query: (body) => ({ url: "/admin/doctors", method: "POST", body }),
      invalidatesTags: ["Doctors", "AdminDashboard", "Schema"],
    }),
    updateAdminDoctor: build.mutation<
      Doctor,
      { id: number; data: Partial<Doctor> }
    >({
      query: ({ id, data }) => ({
        url: `/admin/doctors/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Doctors"],
    }),
    deleteAdminDoctor: build.mutation<void, number>({
      query: (id) => ({ url: `/admin/doctors/${id}`, method: "DELETE" }),
      invalidatesTags: ["Doctors"],
    }),

    // Admin — Ambulances
    getAdminAmbulances: build.query<Ambulance[], void>({
      query: () => "/admin/ambulances",
      providesTags: ["Ambulances"],
    }),
    createAdminAmbulance: build.mutation<
      Ambulance,
      {
        vehicleNumber: string;
        driverName: string;
        driverPhone: string;
        baseLocation: string;
      }
    >({
      query: (body) => ({ url: "/admin/ambulances", method: "POST", body }),
      invalidatesTags: [
        "Ambulances",
        "AdminDashboard",
        "Schema",
        { type: "TableRows", id: "ambulance" },
      ],
    }),
    updateAdminAmbulance: build.mutation<
      Ambulance,
      { id: number; data: Partial<Ambulance> }
    >({
      query: ({ id, data }) => ({
        url: `/admin/ambulances/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Ambulances"],
    }),
    deleteAdminAmbulance: build.mutation<void, number>({
      query: (id) => ({ url: `/admin/ambulances/${id}`, method: "DELETE" }),
      invalidatesTags: ["Ambulances", "AdminDashboard"],
    }),

    // Admin — Messages
    getAdminMessages: build.query<
      { items: any[]; total: number; page: number; limit: number; totalPages: number },
      { page: number; limit: number }
    >({
      query: ({ page, limit }) => `/admin/messages?page=${page}&limit=${limit}`,
      providesTags: ["Messages"],
    }),
    updateMessageStatus: build.mutation<
      any,
      { id: number; status: string }
    >({
      query: ({ id, status }) => ({
        url: `/admin/messages/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Messages"],
    }),
  }),
});

export const {
  useLoginMutation,
  useMeQuery,
  useGetDoctorsQuery,
  useGetMedicinesQuery,
  useGetFeaturedDoctorsQuery,
  useGetDoctorCitiesQuery,
  useGetSpecialtiesQuery,
  useGetDoctorQuery,
  useCreateAppointmentMutation,
  useCreateMedicineOrderMutation,
  useRequestLookupOtpMutation,
  useVerifyLookupOtpMutation,
  useLazyGetAppointmentsByPhoneQuery,
  useGetDoctorDashboardQuery,
  useGetAdminMedicineOrdersQuery,
  useUpdateAdminMedicineOrderStatusMutation,
  useLazyGetDoctorDashboardQuery,
  useMarkAppointmentPaidMutation,
  useGetAdminDashboardQuery,
  useGetAdminDoctorsQuery,
  useGetSchemaQuery,
  useGetTableRowsQuery,
  useCreateTableRowMutation,
  useUpdateTableRowMutation,
  useDeleteTableRowMutation,
  useCreateAdminDoctorMutation,
  useCreateAdminMedicineMutation,
  useUpdateAdminDoctorMutation,
  useDeleteAdminDoctorMutation,
  useGetAdminSpecialtiesQuery,
  useCreateAdminSpecialtyMutation,
  // New endpoints
  useGetAmbulancesQuery,
  useCallAmbulanceMutation,
  useToggleAmbulanceAvailabilityMutation,
  useCreateHomeVisitRequestMutation,
  useGetHomeVisitRequestQuery,
  useSimulatePaymentMutation,
  useJoinConsultationQueueMutation,
  useGetConsultationQuery,
  useGetDoctorQueueQuery,
  useAcceptPatientMutation,
  useCompleteConsultationMutation,
  useSavePrescriptionMutation,
  useToggleDoctorOnlineMutation,
  useGetOnlineDoctorsQuery,
  usePhoneLookupQuery,
  useSaveAppointmentPrescriptionMutation,
  // Admin — Ambulances
  useGetAdminAmbulancesQuery,
  useCreateAdminAmbulanceMutation,
  useUpdateAdminAmbulanceMutation,
  useDeleteAdminAmbulanceMutation,
  // Admin — Messages
  useGetAdminMessagesQuery,
  useUpdateMessageStatusMutation,
} = fmdApi;

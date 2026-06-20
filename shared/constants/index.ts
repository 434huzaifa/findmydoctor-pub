// ─── App Configuration ──────────────────────────────────────────────────────

export const APP_CONFIG = {
  name: "FindMyDoctor",
  tagline: "Healthcare Made Simple",
  currency: "৳",
  currencyCode: "BDT",
  locale: "en-BD",
  defaultPageSize: 12,
  maxPageSize: 100,
  pollingInterval: 5000, // 5 seconds
} as const;

// ─── API Configuration ──────────────────────────────────────────────────────

export const API_CONFIG = {
  baseUrl: "/api/v1",
  timeout: 30000,
} as const;

// ─── Route Paths ────────────────────────────────────────────────────────────

export const ROUTES = {
  // Public
  home: "/",
  doctors: "/doctors",
  pharmacy: "/pharmacy",
  ambulances: "/ambulances",
  homeDoctor: "/doctor-home-service",
  about: "/about",
  
  // Auth
  login: "/login",
  
  // Patient
  myAppointments: "/my-appointments",
  booking: (id: number | string) => `/booking/${id}`,
  consultationWait: (id: number | string) => `/consultation/wait/${id}`,
  checkoutSimulation: (id: number | string) => `/checkout/simulation/${id}`,
  checkoutSuccess: (id: number | string) => `/checkout/success/${id}`,
  success: "/success",
  
  // Dashboard
  doctorDashboard: "/doctor-dashboard",
  admin: "/admin",
} as const;

// ─── Payment Configuration ──────────────────────────────────────────────────

export const PAYMENT_CONFIG = {
  homeVisitFee: 5000,
  methods: ["online", "cash"] as const,
  choices: ["full", "advance"] as const,
  statuses: ["paid", "unpaid", "partial"] as const,
} as const;

// ─── Status Mappings ────────────────────────────────────────────────────────

export const STATUS_COLORS = {
  // Payment status
  paid: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
  partial: { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200" },
  unpaid: { bg: "bg-red-100", text: "text-red-700", border: "border-red-200" },
  
  // Availability
  available: { bg: "bg-green-50", text: "text-green-700" },
  limited: { bg: "bg-yellow-50", text: "text-yellow-700" },
  full: { bg: "bg-red-50", text: "text-red-700" },
  
  // Consultation status
  waiting: { bg: "bg-blue-100", text: "text-blue-700" },
  active: { bg: "bg-green-100", text: "text-green-700" },
  done: { bg: "bg-gray-100", text: "text-gray-700" },
  
  // Order status
  pending: { bg: "bg-yellow-100", text: "text-yellow-700" },
  confirmed: { bg: "bg-blue-100", text: "text-blue-700" },
  processing: { bg: "bg-purple-100", text: "text-purple-700" },
  delivered: { bg: "bg-green-100", text: "text-green-700" },
  cancelled: { bg: "bg-red-100", text: "text-red-700" },
  
  // Dispatch status
  dispatched: { bg: "bg-orange-100", text: "text-orange-700" },
  completed: { bg: "bg-green-100", text: "text-green-700" },
} as const;

// ─── Jitsi Configuration (Free, no API key) ────────────────────────────────

export const JITSI_CONFIG = {
  baseUrl: "https://meet.jit.si",
  roomPrefix: "FindMyDoctor_Consultation_",
} as const;

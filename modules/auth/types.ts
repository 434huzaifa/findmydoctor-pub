// ─── Auth User ──────────────────────────────────────────────────────────────

export type UserRole = "doctor" | "admin";

export interface AuthUser {
  id: number;
  email: string;
  role: UserRole;
  doctorId: number | null;
}

// ─── Auth State ─────────────────────────────────────────────────────────────

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ─── Login Form ─────────────────────────────────────────────────────────────

export interface LoginForm {
  email: string;
  password: string;
}

// ─── Login Result ───────────────────────────────────────────────────────────

export interface LoginResult {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

// ─── Auth Guards ────────────────────────────────────────────────────────────

export function isAdmin(user: AuthUser | null): boolean {
  return user?.role === "admin";
}

export function isDoctor(user: AuthUser | null): boolean {
  return user?.role === "doctor";
}

export function canAccessDashboard(user: AuthUser | null): boolean {
  return isAdmin(user) || isDoctor(user);
}

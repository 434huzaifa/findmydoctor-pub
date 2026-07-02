import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthUser } from "@/types/domain";

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
};

const TOKEN_KEY = "fmd_token";
const REFRESH_KEY = "fmd_refresh_token";
const USER_KEY = "fmd_user";

export function loadPersistedAuth(): AuthState {
  if (typeof window === "undefined") {
    return { user: null, token: null, refreshToken: null };
  }
  const token = localStorage.getItem(TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  const rawUser = localStorage.getItem(USER_KEY);
  let user: AuthUser | null = null;
  if (rawUser) {
    try {
      user = JSON.parse(rawUser) as AuthUser;
    } catch {
      user = null;
      localStorage.removeItem(USER_KEY);
    }
  }
  return { user, token, refreshToken };
}

const initial: AuthState = { user: null, token: null, refreshToken: null };

const authSlice = createSlice({
  name: "auth",
  initialState: initial,
  reducers: {
    hydrateAuth(state, { payload }: PayloadAction<AuthState>) {
      state.user = payload.user;
      state.token = payload.token;
      state.refreshToken = payload.refreshToken;
    },
    setCredentials(
      state,
      { payload }: PayloadAction<{ user: AuthUser; token: string; refreshToken?: string }>
    ) {
      state.user = payload.user;
      state.token = payload.token;
      state.refreshToken = payload.refreshToken ?? null;

      if (typeof window !== "undefined") {
        localStorage.setItem(TOKEN_KEY, payload.token);
        if (payload.refreshToken) {
          localStorage.setItem(REFRESH_KEY, payload.refreshToken);
        }
        localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
      }
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.refreshToken = null;

      if (typeof window !== "undefined") {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_KEY);
        localStorage.removeItem(USER_KEY);
      }
    },
  },
});

export const { hydrateAuth, setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;

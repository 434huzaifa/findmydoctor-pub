import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthUser } from "@/types/domain";

type AuthState = { user: AuthUser | null; token: string | null };

const TOKEN_KEY = "fmd_token";
const USER_KEY = "fmd_user";

export function loadPersistedAuth(): AuthState {
  if (typeof window === "undefined") {
    return { user: null, token: null };
  }
  const token = localStorage.getItem(TOKEN_KEY);
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
  return { user, token };
}

const initial: AuthState = { user: null, token: null };

const authSlice = createSlice({
  name: "auth",
  initialState: initial,
  reducers: {
    hydrateAuth(state, { payload }: PayloadAction<AuthState>) {
      state.user = payload.user;
      state.token = payload.token;
    },
    setCredentials(
      state,
      { payload }: PayloadAction<{ user: AuthUser; token: string }>
    ) {
      state.user = payload.user;
      state.token = payload.token;
      if (typeof window !== "undefined") {
        localStorage.setItem(TOKEN_KEY, payload.token);
        localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
      }
    },
    logout(state) {
      state.user = null;
      state.token = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    },
  },
});

export const { hydrateAuth, setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;

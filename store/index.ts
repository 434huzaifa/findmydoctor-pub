
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import bookingReducer from "./bookingSlice";
import { fmdApi } from "./fmdApi";
export const store = configureStore({
  reducer: { auth: authReducer, booking: bookingReducer, [fmdApi.reducerPath]: fmdApi.reducer },
  middleware: (m) => m().concat(fmdApi.middleware),
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

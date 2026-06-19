import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  BookingInfo,
  Doctor,
  MedicineOrder,
  PendingBookingForm,
} from "@/types/domain";

type PendingBooking = { form: PendingBookingForm; doctor: Doctor } | null;
type BookingState = {
  bookingInfo: BookingInfo;
  pendingBooking: PendingBooking;
  medicineOrderInfo: MedicineOrder | null;
};

const bookingSlice = createSlice({
  name: "booking",
  initialState: {
    bookingInfo: null,
    pendingBooking: null,
    medicineOrderInfo: null,
  } as BookingState,
  reducers: {
    setBookingInfo(state, { payload }: PayloadAction<BookingInfo>) {
      state.bookingInfo = payload;
      state.pendingBooking = null;
      state.medicineOrderInfo = null;
    },
    setPendingBooking(state, { payload }: PayloadAction<PendingBooking>) {
      state.pendingBooking = payload;
      state.medicineOrderInfo = null;
    },
    setMedicineOrderInfo(state, { payload }: PayloadAction<MedicineOrder>) {
      state.medicineOrderInfo = payload;
      state.bookingInfo = null;
      state.pendingBooking = null;
    },
  },
});
export const { setBookingInfo, setPendingBooking, setMedicineOrderInfo } =
  bookingSlice.actions;
export default bookingSlice.reducer;

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  medicineId: number;
  name: string;
  price: number;
  company: string | null;
  stock: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
}

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: [] } as CartState,
  reducers: {
    addToCart(state, { payload }: PayloadAction<Omit<CartItem, "quantity"> & { quantity?: number }>) {
      const existing = state.items.find((i) => i.medicineId === payload.medicineId);
      if (existing) {
        existing.quantity = Math.min(existing.quantity + (payload.quantity ?? 1), existing.stock);
      } else {
        state.items.push({ ...payload, quantity: payload.quantity ?? 1 });
      }
    },
    removeFromCart(state, { payload }: PayloadAction<number>) {
      state.items = state.items.filter((i) => i.medicineId !== payload);
    },
    updateQuantity(state, { payload }: PayloadAction<{ medicineId: number; quantity: number }>) {
      const item = state.items.find((i) => i.medicineId === payload.medicineId);
      if (item) {
        item.quantity = Math.max(1, Math.min(payload.quantity, item.stock));
      }
    },
    clearCart(state) {
      state.items = [];
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;

// Selectors
export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartCount = (state: { cart: CartState }) => state.cart.items.reduce((s, i) => s + i.quantity, 0);
export const selectCartTotal = (state: { cart: CartState }) =>
  state.cart.items.reduce((s, i) => s + (typeof i.price === "string" ? parseFloat(i.price) : i.price) * i.quantity, 0);

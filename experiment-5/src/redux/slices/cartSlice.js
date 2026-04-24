import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem: (state, action) => {
      const existing = state.items.find((i) => i.id === action.payload.id);
      if (existing) {
        existing.qty += 1;
      } else {
        state.items.push({ ...action.payload, qty: 1 });
      }
    },
    removeItem: (state, action) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
    updateQty: (state, action) => {
      const { id, qty } = action.payload;
      const item = state.items.find((i) => i.id === id);
      if (item) {
        item.qty = qty < 1 ? 1 : qty;
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addItem, removeItem, updateQty, clearCart } = cartSlice.actions;
export default cartSlice.reducer;

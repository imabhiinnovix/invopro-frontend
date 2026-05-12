import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Invoice } from "../types";

interface InvoiceState {
  mergedData: Invoice[];
}

const initialState: InvoiceState = {
  mergedData: [],
};

const invoiceSlice = createSlice({
  name: "invoice",
  initialState,
  reducers: {
    setMergedInvoices(state, action: PayloadAction<Invoice[]>) {
      state.mergedData = action.payload;
    },
    clearInvoices(state) {
      state.mergedData = [];
    },
  },
});

export const { setMergedInvoices, clearInvoices } = invoiceSlice.actions;
export default invoiceSlice.reducer;
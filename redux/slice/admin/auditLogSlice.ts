import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuditLog, getAuditLogs } from '../../../thunk/admin/auditLog';

interface AuditLogState {
  data: AuditLog[];
  loading: boolean;
  error: string | null;
}

const initialState: AuditLogState = {
  data: [],
  loading: false,
  error: null,
};

const auditLogSlice = createSlice({
  name: 'auditLog',
  initialState,
  reducers: {
    clearAuditLogs: (state) => {
      state.data = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAuditLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAuditLogs.fulfilled, (state, action: PayloadAction<AuditLog[]>) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(getAuditLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAuditLogs } = auditLogSlice.actions;
export default auditLogSlice.reducer;

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AlertState {
  alerts: Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>;
}

const initialState: AlertState = {
  alerts: [],
};

const alertSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    addAlert: (state, action: PayloadAction<{ message: string; type?: 'success' | 'error' | 'warning' | 'info' }>) => {
      const newAlert = {
        id: Date.now().toString(),
        message: action.payload.message,
        type: action.payload.type || 'info',
      };
      state.alerts.push(newAlert);
    },
    removeAlert: (state, action: PayloadAction<string>) => {
      state.alerts = state.alerts.filter((alert) => alert.id !== action.payload);
    },
  },
});

export const { addAlert, removeAlert } = alertSlice.actions;
export default alertSlice.reducer;

import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Machine, MachinePrediction, fetchMachines, fetchMachinePredictions } from '../../services/machineService';

interface MachineState {
  machines: Machine[];
  predictions: MachinePrediction[];
  loading: boolean;
  error: string | null;
  selectedMachineId: number | null;
}

const initialState: MachineState = {
  machines: [],
  predictions: [],
  loading: false,
  error: null,
  selectedMachineId: null,
};

export const loadMachines = createAsyncThunk(
  'machines/loadMachines',
  async (_, { rejectWithValue }) => {
    try {
      const machines = await fetchMachines();
      return machines;
    } catch (error) {
      return rejectWithValue('Failed to load machines');
    }
  }
);

export const loadMachinePredictions = createAsyncThunk(
  'machines/loadMachinePredictions',
  async (_, { rejectWithValue }) => {
    try {
      const predictions = await fetchMachinePredictions();
      return predictions;
    } catch (error) {
      return rejectWithValue('Failed to load machine predictions');
    }
  }
);

const machineSlice = createSlice({
  name: 'machines',
  initialState,
  reducers: {
    setSelectedMachine: (state, action: PayloadAction<number | null>) => {
      state.selectedMachineId = action.payload;
    },
    updateMachineStatus: (state, action: PayloadAction<{ id: number; status: string }>) => {
      const { id, status } = action.payload;
      const machine = state.machines.find((m) => m.id === id);
      if (machine) {
        machine.status = status as any;
      }
    },
    clearMachineError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load Machines
      .addCase(loadMachines.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadMachines.fulfilled, (state, action) => {
        state.loading = false;
        state.machines = action.payload;
        if (action.payload.length > 0 && !state.selectedMachineId) {
          state.selectedMachineId = action.payload[0].id;
        }
      })
      .addCase(loadMachines.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Load Machine Predictions
      .addCase(loadMachinePredictions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadMachinePredictions.fulfilled, (state, action) => {
        state.loading = false;
        state.predictions = action.payload;
      })
      .addCase(loadMachinePredictions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedMachine, updateMachineStatus, clearMachineError } = machineSlice.actions;

export const selectMachines = (state: { machines: MachineState }) => state.machines.machines;
export const selectPredictions = (state: { machines: MachineState }) => state.machines.predictions;
export const selectSelectedMachineId = (state: { machines: MachineState }) => state.machines.selectedMachineId;
export const selectSelectedMachine = (state: { machines: MachineState }) =>
  state.machines.machines.find((m) => m.id === state.machines.selectedMachineId);

export const selectMachineById = (state: { machines: MachineState }, id: number) =>
  state.machines.machines.find((m) => m.id === id);

export const selectPredictionByMachineId = (state: { machines: MachineState }, machineId: string) =>
  state.machines.predictions.find((p) => p.machineId === machineId);

export default machineSlice.reducer;

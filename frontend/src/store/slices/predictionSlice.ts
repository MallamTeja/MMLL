import { createSlice, PayloadAction, createAsyncThunk, createAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface PredictionState {
  predictions: any[];
  loading: boolean;
  error: string | null;
}

const initialState: PredictionState = {
  predictions: [],
  loading: false,
  error: null,
};

export const fetchPredictions = createAsyncThunk(
  'predictions/fetchPredictions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/predictions');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch predictions');
    }
  }
);

export const makePrediction = createAsyncThunk(
  'predictions/makePrediction',
  async (predictionData: any, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/predictions', predictionData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to make prediction');
    }
  }
);

export const clearPredictionError = createAction('predictions/clearError');

const predictionSlice = createSlice({
  name: 'predictions',
  initialState,
  reducers: {
    clearPredictions: (state) => {
      state.predictions = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch predictions
    builder
      .addCase(fetchPredictions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPredictions.fulfilled, (state, action) => {
        state.loading = false;
        state.predictions = action.payload;
      })
      .addCase(fetchPredictions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Make prediction
    builder
      .addCase(makePrediction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(makePrediction.fulfilled, (state, action) => {
        state.loading = false;
        state.predictions = [...state.predictions, action.payload];
      })
      .addCase(makePrediction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Clear error
    builder.addCase(clearPredictionError, (state) => {
      state.error = null;
    });
  },
});

export const { clearPredictions } = predictionSlice.actions;
export default predictionSlice.reducer;

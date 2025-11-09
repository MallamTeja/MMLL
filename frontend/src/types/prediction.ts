export interface Prediction {
  id: string;
  machineId: string;
  timestamp: string;
  predictedRUL: number; // Remaining Useful Life in hours
  confidence: number; // Confidence score between 0 and 1
  status: 'normal' | 'warning' | 'critical';
  explanation?: string;
  recommendedActions?: string[];
  sensorReadings?: {
    [key: string]: number;
  };
  thresholds?: {
    warning: number;
    critical: number;
  };
}

export interface PredictionHistory {
  timestamp: string;
  predictedRUL: number;
  actualRUL?: number; // If available after maintenance/replacement
  confidence: number;
  status: 'normal' | 'warning' | 'critical';
}

export interface PredictionMetrics {
  mae?: number; // Mean Absolute Error
  mse?: number; // Mean Squared Error
  rmse?: number; // Root Mean Squared Error
  r2?: number; // R-squared
  accuracy?: number; // Classification accuracy (0-1)
}

export interface PredictionRequest {
  machineId: string;
  sensorData: {
    [key: string]: number | number[];
  };
  modelId?: string; // Optional: specify which model to use
}

export interface PredictionResponse {
  predictionId: string;
  machineId: string;
  predictedRUL: number;
  confidence: number;
  status: 'normal' | 'warning' | 'critical';
  timestamp: string;
  metrics?: PredictionMetrics;
  explanation?: string;
  recommendedActions?: string[];
}

export interface PredictionInput {
  machineId: string;
  sensorData: {
    [key: string]: number;
  };
}

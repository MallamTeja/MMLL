export interface ModelVersion {
  version: string;
  path: string;
  timestamp: string;
  metrics: ModelMetrics;
  isActive: boolean;
  description?: string;
}

export interface ModelMetrics {
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  mae?: number;
  mse?: number;
  rmse?: number;
  r2?: number;
  trainingTime?: number;
  inferenceTime?: number;
  trainingLoss?: number[];
  validationLoss?: number[];
  trainingAccuracy?: number[];
  validationAccuracy?: number[];
  // Add training progress related fields
  trainingProgress?: number;
  status?: string;
  message?: string;
  test_mae?: number;
  test_loss?: number;
  training_history?: any[];
}

export interface ModelExtended {
  id: string;
  name: string;
  description?: string;
  version?: string;
  framework: string;
  status: 'training' | 'trained' | 'deployed' | 'failed' | 'inactive';
  createdAt: string;
  updatedAt: string;
  metrics?: ModelMetrics & {
    trainingProgress?: number;
    test_mae?: number;
    test_loss?: number;
    training_history?: any[];
  };
  versions?: ModelVersion[];
  file_path?: string;
  type?: string;
  model_type?: string;
  createdBy?: string;
  updatedBy?: string;
  inputShape?: number[];
  outputShape?: number[];
  trainingDataPath?: string;
  validationDataPath?: string;
  testDataPath?: string;
  trainingLogs?: Array<{
    timestamp: string;
    level: 'info' | 'warning' | 'error';
    message: string;
  }>;
  lastTrained?: string;
  deploymentStatus?: string;
  deploymentDate?: string;
  trainingProgress?: number;
  test_mae?: number;
  test_loss?: number;
}

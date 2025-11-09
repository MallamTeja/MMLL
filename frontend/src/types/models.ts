export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  loss: number;
  meanAbsoluteError?: number;
  meanSquaredError?: number;
  trainingSamples: number;
  validationSamples?: number;
  trainingTime?: number;
  lastTrained: string;
  trainingHistory?: Array<{
    epoch: number;
    loss: number;
    val_loss: number;
    accuracy: number;
    val_accuracy: number;
  }>;
}

export interface ModelVersion {
  version: string;
  status: 'active' | 'deprecated' | 'experimental';
  metrics: ModelMetrics;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Model {
  id: string;
  name: string;
  description?: string;
  type: 'classification' | 'regression' | 'segmentation' | 'detection';
  framework: 'tensorflow' | 'pytorch' | 'scikit-learn' | 'other';
  status: 'active' | 'training' | 'deployed' | 'failed' | 'archived';
  metrics?: ModelMetrics;
  versions?: ModelVersion[];
  trainingLogs?: Array<{
    timestamp: string;
    level: 'info' | 'warning' | 'error';
    message: string;
  }>;
  architecture?: string;
  inputShape: number[];
  outputShape: number[];
  trainingDataPath?: string;
  validationDataPath?: string;
  testDataPath?: string;
  labels?: string[];
  parameters?: Record<string, any>;
  hyperparameters?: Record<string, any>;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

// Model service for API calls
export interface TrainingConfig {
  model_type: string;
  machine_id?: number;
  epochs: number;
  batch_size: number;
}

export const modelService = {
  trainModel: async (modelId: string, trainingConfig: TrainingConfig) => {
    // Implement API call to train model
    console.log('Training model:', modelId, trainingConfig);
    return Promise.resolve();
  }
};
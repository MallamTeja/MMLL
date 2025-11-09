import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Alert,
  Stack,
  Divider,
  Container
} from '@mui/material';
import { ModelList } from '../components/models/ModelList';
import { getMachines } from '../services/machineService';
import { ModelExtended } from '../types/model';

// Mock data for models (replace with actual API call)
const mockModels: ModelExtended[] = [
  {
    id: '1',
    name: 'Predictive Maintenance',
    status: 'trained',
    type: 'classification',
    framework: 'TensorFlow',
    createdAt: '2023-10-20T10:30:00Z',
    updatedAt: '2023-10-23T14:45:00Z',
    metrics: {
      accuracy: 0.95,
      precision: 0.94,
      recall: 0.96,
      f1Score: 0.95,
      trainingProgress: 100
    }
  },
  {
    id: '2',
    name: 'Anomaly Detection',
    status: 'training',
    type: 'anomaly',
    framework: 'PyTorch',
    createdAt: '2023-10-21T09:15:00Z',
    updatedAt: '2023-10-23T15:20:00Z',
    metrics: {
      trainingProgress: 75
    }
  },
  {
    id: '3',
    name: 'Quality Control',
    status: 'deployed',
    type: 'object-detection',
    framework: 'TensorFlow',
    createdAt: '2023-10-18T11:20:00Z',
    updatedAt: '2023-10-22T16:30:00Z',
    metrics: {
      accuracy: 0.92,
      precision: 0.91,
      recall: 0.93,
      f1Score: 0.92,
      trainingProgress: 100
    },
    deploymentStatus: 'active'
  }
];

export const ModelsPage: React.FC = () => {
  const [models, setModels] = useState<ModelExtended[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        // TODO: Replace with actual API call
        // const data = await fetch('/api/models').then(res => res.json());
        const data = mockModels;
        setModels(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching models:', err);
        setError('Failed to load models. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchModels();
  }, []);

  const handleModelSelect = (model: ModelExtended) => {
    console.log('Selected model:', model);
    // Handle model selection (e.g., navigate to model details)
  };

  const handleDeleteModel = async (modelId: string) => {
    try {
      // TODO: Implement delete API call
      // await deleteModel(modelId);
      setModels(models.filter(model => model.id !== modelId));
    } catch (err) {
      console.error('Error deleting model:', err);
      throw err; // Let the ModelList component handle the error
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Machine Learning Models
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage and monitor your machine learning models
        </Typography>
      </Box>
      
      <Box sx={{ mt: 3 }}>
        <ModelList 
          models={models}
          onModelSelect={handleModelSelect}
          onDeleteModel={handleDeleteModel}
        />
      </Box>
    </Container>
  );
};

export default ModelsPage;

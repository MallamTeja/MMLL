import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';

// Import types from the models file
import { ModelExtended } from '../../types/model';

interface ModelListProps {
  models: ModelExtended[];
  onModelSelect?: (model: ModelExtended) => void;
  onDeleteModel?: (modelId: string) => Promise<void>;
  onDeployModel?: (modelId: string) => Promise<void>;
  onViewDetails?: (model: ModelExtended) => void;
  isLoading?: boolean;
  error?: Error | null;
}

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'trained':
    case 'deployed':
      return 'success';
    case 'training':
      return 'info';
    case 'failed':
      return 'error';
    default:
      return 'default';
  }
};

export const ModelList: React.FC<ModelListProps> = ({ 
  models = [], 
  onModelSelect,
  onDeleteModel,
  onDeployModel,
  onViewDetails,
  isLoading = false,
  error = null 
}) => {
  const [selectedModel, setSelectedModel] = useState<ModelExtended | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleViewDetails = (model: ModelExtended) => {
    if (onViewDetails) {
      onViewDetails(model);
    } else {
      setSelectedModel(model);
      setIsDetailsDialogOpen(true);
    }
  };

  const handleDeleteClick = (model: ModelExtended) => {
    setSelectedModel(model);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedModel || !onDeleteModel) return;
    
    try {
      setIsDeleting(true);
      await onDeleteModel(selectedModel.id);
      setIsDeleteDialogOpen(false);
      setSelectedModel(null);
    } catch (error) {
      console.error('Error deleting model:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteDialogClose = () => {
    setIsDeleteDialogOpen(false);
    setSelectedModel(null);
  };

  const handleDetailsDialogClose = () => {
    setIsDetailsDialogOpen(false);
    setSelectedModel(null);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">
          Error loading models: {error.message}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Framework</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Accuracy</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {models.length > 0 ? (
              models.map((model) => (
                <TableRow key={model.id}>
                  <TableCell sx={{ fontWeight: 'medium' }}>{model.name}</TableCell>
                  <TableCell>{model.type || model.model_type || 'N/A'}</TableCell>
                  <TableCell>{model.framework || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={model.status || 'Unknown'} 
                      color={getStatusColor(model.status || '')}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {model.metrics?.accuracy ? `${(model.metrics.accuracy * 100).toFixed(1)}%` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {model.createdAt ? new Date(model.createdAt).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewDetails(model)}
                      >
                        View
                      </Button>
                      <Button 
                        variant="outlined" 
                        color="error" 
                        size="small" 
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteClick(model)}
                        disabled={isDeleting && selectedModel?.id === model.id}
                      >
                        Delete
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="textSecondary">
                    No models found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Model Details Dialog */}
      <Dialog 
        open={isDetailsDialogOpen} 
        onClose={handleDetailsDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Model Details: {selectedModel?.name}</DialogTitle>
        <DialogContent>
          {selectedModel && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Type:</strong> {selectedModel.type || selectedModel.model_type || 'N/A'}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Framework:</strong> {selectedModel.framework || 'N/A'}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Status:</strong> {selectedModel.status || 'N/A'}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Created:</strong> {selectedModel.createdAt ? new Date(selectedModel.createdAt).toLocaleString() : 'N/A'}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Updated:</strong> {selectedModel.updatedAt ? new Date(selectedModel.updatedAt).toLocaleString() : 'N/A'}
              </Typography>
              {selectedModel.metrics && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>Metrics</Typography>
                  <Typography variant="body2">
                    <strong>Accuracy:</strong> {selectedModel.metrics.accuracy ? `${(selectedModel.metrics.accuracy * 100).toFixed(1)}%` : 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Precision:</strong> {selectedModel.metrics.precision?.toFixed(3) || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Recall:</strong> {selectedModel.metrics.recall?.toFixed(3) || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>F1 Score:</strong> {selectedModel.metrics.f1Score?.toFixed(3) || 'N/A'}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDetailsDialogClose}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={handleDeleteDialogClose}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Model
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete "{selectedModel?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleDeleteDialogClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={20} /> : null}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ModelList;
import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Card, 
  CardContent, 
  Divider, 
  Tabs, 
  Tab, 
  Button, 
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton
} from '@mui/material';
import { useTheme, styled } from '@mui/material/styles';
import { 
  CloudUpload as UploadIcon, 
  History as HistoryIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { makePrediction, clearPredictionError } from '../store/slices/predictionSlice';
import PredictionResult from '../components/predictions/PredictionResult';
import PredictionHistory from '../components/predictions/PredictionHistory';
import { PredictionInput } from '../types/prediction';

interface Machine {
  id: string;
  name: string;
  status: string;
  lastUpdated: string;
  metrics: {
    temperature: number;
    vibration: number;
    pressure: number;
  };
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 12,
  boxShadow: theme.shadows[3],
  height: '100%',
}));

const Dropzone = styled('div')(({ theme, isDragActive }: { theme: any; isDragActive: boolean }) => ({
  border: `2px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.divider}`,
  borderRadius: 8,
  padding: theme.spacing(4, 2),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  backgroundColor: isDragActive ? 'rgba(75, 0, 130, 0.05)' : theme.palette.background.paper,
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: 'rgba(75, 0, 130, 0.03)',
  },
}));

const PredictionsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [predictionInput, setPredictionInput] = useState<{
    machineId: string;
    modelVersion: string;
    sensorData: { [key: string]: number } | null;
  }>({
    machineId: '',
    modelVersion: 'latest',
    sensorData: null,
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  const dispatch = useAppDispatch();
  const { loading, error, prediction, history } = useAppSelector((state: any) => state.predictions || {});
  const { machines } = useAppSelector((state: any) => state.machines || { machines: [] });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'text/csv': ['.csv']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setSelectedFile(acceptedFiles[0]);
      }
    },
  });

  useEffect(() => {
    if (error) {
      setSnackbarMessage(error);
      setSnackbarOpen(true);
    }
  }, [error]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPredictionInput(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setSnackbarMessage('Please select a file to upload');
      setSnackbarOpen(true);
      return;
    }

    if (!predictionInput.machineId) {
      setSnackbarMessage('Please select a machine');
      setSnackbarOpen(true);
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('machineId', predictionInput.machineId);
    formData.append('modelVersion', predictionInput.modelVersion);
    
    if (predictionInput.sensorData) {
      formData.append('sensorData', JSON.stringify(predictionInput.sensorData));
    }

    try {
      await dispatch(makePrediction(formData)).unwrap();
      setActiveTab(0); // Switch to results tab
    } catch (err) {
      console.error('Prediction failed:', err);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
    dispatch(clearPredictionError());
  };

  const handleRetry = () => {
    setSelectedFile(null);
    setPredictionInput({
      machineId: '',
      modelVersion: 'latest',
      sensorData: null,
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Tool Wear Prediction
      </Typography>
      
      <Grid container spacing={3}>
        <Grid component="div" sx={{ width: { xs: '100%', md: '66.66%' }, p: 1.5 }}>
          <StyledPaper>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              aria-label="prediction tabs"
              sx={{ mb: 3 }}
            >
              <Tab label="New Prediction" />
              <Tab label="History" />
            </Tabs>

            <TabPanel value={activeTab} index={0}>
              {!selectedFile ? (
                <Dropzone {...getRootProps()} isDragActive={isDragActive}>
                  <input {...getInputProps()} />
                  <UploadIcon color="action" fontSize="large" sx={{ mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Drag and drop an image or CSV file here, or click to select
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Supported formats: JPG, PNG, CSV
                  </Typography>
                </Dropzone>
              ) : (
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="subtitle1">
                        {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                      </Typography>
                      <IconButton size="small" onClick={() => setSelectedFile(null)}>
                        <CloseIcon />
                      </IconButton>
                    </Box>
                    
                    <form onSubmit={handleSubmit}>
                      <Grid container spacing={2}>
                        <Grid component="div" sx={{ width: { xs: '100%', md: '50%' }, p: 1 }}>
                          <TextField
                            select
                            fullWidth
                            label="Select Machine"
                            name="machineId"
                            value={predictionInput.machineId}
                            onChange={handleInputChange}
                            required
                            margin="normal"
                            variant="outlined"
                          >
                            {machines.map((machine: Machine) => (
                              <MenuItem key={machine.id} value={machine.id}>
                                {machine.name}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                        <Grid component="div" sx={{ width: { xs: '100%', md: '50%' }, p: 1 }}>
                          <TextField
                            select
                            fullWidth
                            label="Model Version"
                            name="modelVersion"
                            value={predictionInput.modelVersion}
                            onChange={handleInputChange}
                            margin="normal"
                            variant="outlined"
                          >
                            <MenuItem value="latest">Latest</MenuItem>
                            <MenuItem value="v1.0.0">v1.0.0</MenuItem>
                            <MenuItem value="v0.9.0">v0.9.0</MenuItem>
                          </TextField>
                        </Grid>
                      </Grid>
                      
                      <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={handleRetry}
                          startIcon={<RefreshIcon />}
                        >
                          Change File
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          disabled={loading}
                          startIcon={loading ? <CircularProgress size={20} /> : <UploadIcon />}
                        >
                          {loading ? 'Processing...' : 'Predict'}
                        </Button>
                      </Box>
                    </form>
                  </CardContent>
                </Card>
              )}
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <PredictionHistory predictions={history} />
            </TabPanel>
          </StyledPaper>
        </Grid>

        <Grid component="div" sx={{ width: { xs: '100%', md: '33.33%' }, p: 1.5 }}>
          <PredictionResult 
            prediction={prediction} 
            loading={loading} 
            error={error} 
          />
        </Grid>
      </Grid>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity="error" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// TabPanel component
const TabPanel: React.FC<{ children: React.ReactNode; value: number; index: number }> = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`prediction-tabpanel-${index}`}
      aria-labelledby={`prediction-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

export default PredictionsPage;

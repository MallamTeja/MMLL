import * as React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { store } from './store';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import MachineMonitoringPage from './pages/MachineMonitoringPage';
import PredictionsPage from './pages/PredictionsPage';
import AnomalyDetectionPage from './pages/AnomalyDetectionPage';
import MaintenanceSchedulerPage from './pages/MaintenanceSchedulerPage';
import ReportsPage from './pages/ReportsPage';
import DataUploadPage from './pages/DataUploadPage';
import ModelsPage from './pages/Models';
import LoginPage from './pages/LoginPage';
import './App.css';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#4B0082',
    },
    secondary: {
      main: '#1E90FF',
    },
    success: {
      main: '#39FF14',
    },
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF',
    },
    mode: 'light',
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
          '&:hover': {
            boxShadow: '0 8px 30px 0 rgba(0,0,0,0.1)',
          },
        },
      },
    },
  },
});

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Wrap children in a fragment to ensure we always return a single element
  return <>{children}</>;
};

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="machines" element={<MachineMonitoringPage />} />
                <Route path="predictions" element={<PredictionsPage />} />
                <Route path="anomalies" element={<AnomalyDetectionPage />} />
                <Route path="maintenance" element={<MaintenanceSchedulerPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="upload" element={<DataUploadPage />} />
                <Route path="models" element={<ModelsPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;

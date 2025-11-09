import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  LinearProgress,
  Tooltip,
  IconButton,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import MuiGrid, { GridProps as MuiGridProps } from '@mui/material/Grid';

// Create a properly typed Grid component with all necessary props
type GridProps = MuiGridProps & {
  item?: boolean;
  container?: boolean;
  spacing?: number | string;
  xs?: number | 'auto' | boolean;
  sm?: number | 'auto' | boolean;
  md?: number | 'auto' | boolean;
  lg?: number | 'auto' | boolean;
  xl?: number | 'auto' | boolean;
};

const Grid: React.FC<GridProps> = (props) => <MuiGrid {...props} />;
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Build as BuildIcon,
} from '@mui/icons-material';
import { 
  DataGrid, 
  GridColDef, 
  GridToolbar, 
  GridCellParams, 
  GridRenderCellParams,
  GridPaginationModel
} from '@mui/x-data-grid';

type GridValueFormatterParams = {
  value: any;
  field: string;
  id?: unknown;
};

import { useTheme } from '@mui/material/styles';

// Mock data - replace with real data from your API
const mockMachines = [
  {
    id: 1,
    name: 'CNC-001',
    status: 'operational',
    health: 92,
    lastMaintenance: '2023-05-15',
    nextMaintenance: '2023-07-15',
    uptime: '98.5%',
    temperature: 42,
    vibration: 0.25,
    rpm: 2850,
  },
  {
    id: 2,
    name: 'CNC-002',
    status: 'warning',
    health: 65,
    lastMaintenance: '2023-04-20',
    nextMaintenance: '2023-06-20',
    uptime: '95.2%',
    temperature: 56,
    vibration: 0.42,
    rpm: 2750,
  },
  {
    id: 3,
    name: 'CNC-003',
    status: 'critical',
    health: 32,
    lastMaintenance: '2023-03-10',
    nextMaintenance: '2023-05-10',
    uptime: '89.7%',
    temperature: 68,
    vibration: 0.78,
    rpm: 2600,
  },
  {
    id: 4,
    name: 'CNC-004',
    status: 'maintenance',
    health: 15,
    lastMaintenance: '2023-05-01',
    nextMaintenance: '2023-07-01',
    uptime: '91.3%',
    temperature: 0,
    vibration: 0,
    rpm: 0,
  },
];

const MachineCard = ({ machine }: { machine: any }) => {
  const theme = useTheme();
  
  const getStatusColor = () => {
    switch (machine.status) {
      case 'operational':
        return theme.palette.success.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'critical':
        return theme.palette.error.main;
      case 'maintenance':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getStatusIcon = () => {
    switch (machine.status) {
      case 'operational':
        return <CheckCircleIcon sx={{ color: getStatusColor() }} />;
      case 'warning':
        return <WarningIcon sx={{ color: getStatusColor() }} />;
      case 'critical':
        return <ErrorIcon sx={{ color: getStatusColor() }} />;
      case 'maintenance':
        return <BuildIcon sx={{ color: getStatusColor() }} />;
      default:
        return null;
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea sx={{ flexGrow: 1, p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="div">
            {machine.name}
          </Typography>
          {getStatusIcon()}
        </Box>
        
        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2" color="text.secondary">
              Health
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {machine.health}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={machine.health}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: theme.palette.grey[200],
              '& .MuiLinearProgress-bar': {
                backgroundColor: getStatusColor(),
                borderRadius: 4,
              },
            }}
          />
        </Box>
        
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Temperature
            </Typography>
            <Typography variant="body2">
              {machine.temperature}°C
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Vibration
            </Typography>
            <Typography variant="body2">
              {machine.vibration} mm/s²
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              RPM
            </Typography>
            <Typography variant="body2">
              {machine.rpm.toLocaleString()}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Uptime
            </Typography>
            <Typography variant="body2">
              {machine.uptime}
            </Typography>
          </Grid>
        </Grid>
      </CardActionArea>
    </Card>
  );
};

interface MachineListTableProps {
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
}

const MachineListTable = ({ 
  paginationModel, 
  onPaginationModelChange 
}: MachineListTableProps) => {
  const [pageSize, setPageSize] = useState(5);
  
  const columns: GridColDef[] = [
    { 
      field: 'name', 
      headerName: 'Machine ID', 
      flex: 1,
      renderCell: (params) => (
        <Box display="flex" alignItems="center">
          {params.row.status === 'operational' && <CheckCircleIcon color="success" fontSize="small" sx={{ mr: 1 }} />}
          {params.row.status === 'warning' && <WarningIcon color="warning" fontSize="small" sx={{ mr: 1 }} />}
          {params.row.status === 'critical' && <ErrorIcon color="error" fontSize="small" sx={{ mr: 1 }} />}
          {params.row.status === 'maintenance' && <BuildIcon color="info" fontSize="small" sx={{ mr: 1 }} />}
          {params.value}
        </Box>
      ),
    },
    { 
      field: 'status', 
      headerName: 'Status',
      flex: 1,
      valueGetter: (params: { value: string }) => {
        return params.value.charAt(0).toUpperCase() + params.value.slice(1);
      },
      cellClassName: (params: GridCellParams) => {
        return `status-${params.value as string}`;
      },
    },
    { 
      field: 'health', 
      headerName: 'Health',
      type: 'number',
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ width: '100%', pr: 2 }}>
          <Box display="flex" justifyContent="space-between" sx={{ mb: 0.5 }}>
            <Typography variant="body2">{params.value}%</Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={params.value} 
            sx={{ 
              height: 6, 
              borderRadius: 3,
              backgroundColor: (theme) => theme.palette.grey[200],
              '& .MuiLinearProgress-bar': {
                backgroundColor: (theme) => 
                  params.value > 70 ? theme.palette.success.main : 
                  params.value > 30 ? theme.palette.warning.main : 
                  theme.palette.error.main,
                borderRadius: 3,
              },
            }} 
          />
        </Box>
      ),
    },
    { 
      field: 'temperature', 
      headerName: 'Temp (°C)', 
      type: 'number',
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Typography color={params.value > 60 ? 'error' : 'inherit'}>
          {params.value}°C
        </Typography>
      ),
    },
    { 
      field: 'vibration', 
      headerName: 'Vibration (mm/s²)', 
      type: 'number',
      flex: 1,
    },
    { 
      field: 'rpm', 
      headerName: 'RPM', 
      type: 'number',
      flex: 1,
      valueFormatter: (params: GridValueFormatterParams) => params.value?.toLocaleString?.() ?? params.value,
    },
    { 
      field: 'lastMaintenance', 
      headerName: 'Last Maintenance', 
      flex: 1,
      valueFormatter: (params: GridValueFormatterParams) => {
        if (!params.value) return '';
        return new Date(params.value).toLocaleDateString();
      },
    },
  ];

  return (
    <Box sx={{ height: 500, width: '100%', mt: 3 }}>
      <DataGrid
        rows={mockMachines}
        columns={columns}
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        pageSizeOptions={[5, 10, 25]}
        disableRowSelectionOnClick
        slots={{
          toolbar: GridToolbar,
        }}
        sx={{
          '& .status-operational': {
            color: 'success.main',
            fontWeight: 'bold',
          },
          '& .status-warning': {
            color: 'warning.main',
            fontWeight: 'bold',
          },
          '& .status-critical': {
            color: 'error.main',
            fontWeight: 'bold',
          },
          '& .status-maintenance': {
            color: 'info.main',
            fontWeight: 'bold',
          },
        }}
      />
    </Box>
  );
};

const MachineMonitoring: React.FC = () => {
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
  };

  const handlePaginationModelChange = (newModel: GridPaginationModel) => {
    setPaginationModel(newModel);
  };

  const filteredMachines = mockMachines.filter((machine) => {
    const matchesSearch = machine.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || machine.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Machine Monitoring
        </Typography>
        <Box>
          <IconButton 
            onClick={() => setView('grid')} 
            color={view === 'grid' ? 'primary' : 'default'}
          >
            <i className="fas fa-th"></i>
          </IconButton>
          <IconButton 
            onClick={() => setView('table')} 
            color={view === 'table' ? 'primary' : 'default'}
            sx={{ ml: 1 }}
          >
            <i className="fas fa-list"></i>
          </IconButton>
        </Box>
      </Box>

      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search machines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                label="Status"
                startAdornment={
                  <InputAdornment position="start">
                    <FilterIcon />
                  </InputAdornment>
                }
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="operational">Operational</MenuItem>
                <MenuItem value="warning">Warning</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={12} md={5} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Tooltip title="Refresh data">
              <IconButton>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>

      {view === 'grid' ? (
        <Grid container spacing={3}>
          {filteredMachines.map((machine) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={machine.id}>
              <MachineCard machine={machine} />
            </Grid>
          ))}
          {filteredMachines.length === 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="textSecondary">
                  No machines found matching your criteria
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      ) : (
        <MachineListTable 
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
        />
      )}
    </Box>
  );
};

export default MachineMonitoring;

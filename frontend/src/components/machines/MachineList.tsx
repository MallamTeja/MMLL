import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  TextField, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Select, 
  SelectChangeEvent, 
  Typography, 
  CircularProgress,
  Paper,
  IconButton,
  Tooltip,
  useTheme,
  alpha
} from '@mui/material';
import { 
  FilterList as FilterListIcon, 
  Sort as SortIcon, 
  Refresh as RefreshIcon,
  Add as AddIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import MachineCard from './MachineCard';
import { Machine } from '../../types';

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'operational', label: 'Operational' },
  { value: 'warning', label: 'Warning' },
  { value: 'critical', label: 'Critical' },
  { value: 'maintenance', label: 'Maintenance' },
];

const sortOptions = [
  { value: 'name_asc', label: 'Name (A-Z)' },
  { value: 'name_desc', label: 'Name (Z-A)' },
  { value: 'status', label: 'Status' },
  { value: 'last_updated', label: 'Last Updated' },
  { value: 'operating_hours', label: 'Operating Hours' },
];

const MachineList: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { fetchData } = useApi();
  
  const [machines, setMachines] = useState<Machine[]>([]);
  const [filteredMachines, setFilteredMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter and sort states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name_asc');
  
  // Fetch machines from API
  const fetchMachines = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchData<Machine[]>('/api/machines/', 'get');
      if (response) {
        setMachines(response.data);
        setFilteredMachines(response.data);
      }
    } catch (err) {
      console.error('Error fetching machines:', err);
      setError('Failed to load machines. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Initial fetch
  useEffect(() => {
    fetchMachines();
  }, []);
  
  // Apply filters and sorting
  useEffect(() => {
    let result = [...machines];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(machine => 
        machine.name.toLowerCase().includes(term) ||
        (machine.model && machine.model.toLowerCase().includes(term)) ||
        (machine.manufacturer && machine.manufacturer.toLowerCase().includes(term)) ||
        (machine.serial_number && machine.serial_number.toLowerCase().includes(term))
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(machine => 
        machine.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'last_updated': {
          const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
          const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
          return dateB - dateA;
        }
        case 'operating_hours':
          return (b.operating_hours || 0) - (a.operating_hours || 0);
        default:
          return 0;
      }
    });
    
    setFilteredMachines(result);
  }, [machines, searchTerm, statusFilter, sortBy]);
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
  };
  
  const handleSortChange = (event: SelectChangeEvent) => {
    setSortBy(event.target.value);
  };
  
  const handleRefresh = () => {
    fetchMachines();
  };
  
  const handleAddMachine = () => {
    navigate('/machines/new');
  };
  
  const handleMachineClick = (machineId: number) => {
    navigate(`/machines/${machineId}`);
  };

  return (
    <Box>
      {/* Header */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Typography variant="h4" component="h1">
          Machine Monitoring
        </Typography>
        
        <Box display="flex" gap={2} flexWrap="wrap">
          <Tooltip title="Add New Machine">
            <IconButton 
              color="primary" 
              onClick={handleAddMachine}
              sx={{ 
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              }}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Filters and Search */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          mb: 3, 
          backgroundColor: alpha(theme.palette.primary.main, 0.03),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          borderRadius: 2
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid component="div" sx={{ width: { xs: '100%', sm: '50%', md: '33.33%' }, p: 1 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search machines..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
              }}
              size="small"
            />
          </Grid>
          
          <Grid component="div" sx={{ width: { xs: '100%', sm: '50%', md: '25%' }, p: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                value={statusFilter}
                onChange={handleStatusFilterChange}
                label="Status"
                startAdornment={<FilterListIcon color="action" sx={{ mr: 1 }} />}
              >
                {statusOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid component="div" sx={{ width: { xs: '100%', sm: '50%', md: '25%' }, p: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="sort-by-label">Sort By</InputLabel>
              <Select
                labelId="sort-by-label"
                value={sortBy}
                onChange={handleSortChange}
                label="Sort By"
                startAdornment={<SortIcon color="action" sx={{ mr: 1 }} />}
              >
                {sortOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid component="div" sx={{ width: { xs: '100%', sm: '50%', md: '33.33%' }, p: 1, textAlign: 'right' }}>
            <Typography variant="body2" color="textSecondary">
              {filteredMachines.length} {filteredMachines.length === 1 ? 'machine' : 'machines'} found
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Loading State */}
      {loading && machines.length === 0 && (
        <Box display="flex" justifyContent="center" my={8}>
          <CircularProgress />
        </Box>
      )}
      
      {/* Error State */}
      {error && (
        <Paper elevation={0} sx={{ p: 3, textAlign: 'center', backgroundColor: 'error.light' }}>
          <Typography color="error">{error}</Typography>
          <IconButton onClick={fetchMachines} color="error" sx={{ mt: 1 }}>
            <RefreshIcon />
          </IconButton>
        </Paper>
      )}
      
      {/* Empty State */}
      {!loading && !error && filteredMachines.length === 0 && (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No machines found
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'No machines have been added yet.'}
          </Typography>
          <IconButton 
            color="primary" 
            onClick={handleAddMachine}
            size="large"
            sx={{ mt: 1 }}
          >
            <AddIcon fontSize="large" />
          </IconButton>
        </Paper>
      )}
      
      {/* Machine Grid */}
      {!loading && filteredMachines.length > 0 && (
        <Grid container spacing={3}>
          {filteredMachines.map(machine => (
            <Grid component="div" sx={{ width: { xs: '100%', sm: '50%', md: '33.33%', lg: '25%' }, p: 1.5 }} key={machine.id}>
              <MachineCard 
                machine={machine}
                onClick={() => handleMachineClick(parseInt(machine.id))}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default MachineList;

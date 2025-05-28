// src/pages/Financials.tsx - Updated with DateRangeSelector matching FilterSection pattern

import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Popover from '@mui/material/Popover';
import MenuList from '@mui/material/MenuList';
import CircularProgress from '@mui/material/CircularProgress';
import { format } from 'date-fns';

// Import axios for API calls
import axios from 'axios';

// Icons
import PlaceIcon from '@mui/icons-material/Place';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';

// Import components
import FinancialTable from '../components/FinancialTable';
import DayOfWeekAnalysis from '../components/DayOfWeekAnalysis';
import WeekOverWeekChart from '../components/graphs/WeekOverWeekChart';
import BudgetChart from '../components/graphs/BudgetChart';
import SalesChart from '../components/graphs/SalesChart';
import OrdersChart from '../components/graphs/OrdersChart';
import AvgTicketChart from '../components/graphs/AvgTicketChart';
import DateRangeSelector from '../components/DateRangeSelector';

// Import Redux hooks
import { useAppDispatch, useAppSelector } from '../typedHooks';
import { 
  selectFinancialLocation, 
  updateFinancialFilters,
  setTableData,
  setLoading,
  setError
} from '../store/excelSlice';

// API URLs
const FINANCIAL_FILTER_API_URL = 'http://localhost:8000/api/financials/filter';

// TabPanel Component
interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}

// Multi-Select Filter Component matching the image design
interface MultiSelectFilterProps {
  id: string;
  label: string;
  value: string[];
  options: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  icon?: React.ReactNode;
}

const MultiSelectFilter: React.FC<MultiSelectFilterProps> = ({
  id,
  label,
  value,
  options,
  onChange,
  placeholder = "Select options",
  icon
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchText, setSearchText] = useState('');
  const open = Boolean(anchorEl);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSearchText('');
  };

  const handleToggle = (option: string) => {
    const newValue = value.includes(option)
      ? value.filter(item => item !== option)
      : [...value, option];
    onChange(newValue);
  };

  const handleSelectAll = () => {
    if (value.length === options.length) {
      onChange([]);
    } else {
      onChange([...options]);
    }
  };

  const handleClear = (event: React.MouseEvent) => {
    event.stopPropagation();
    onChange([]);
  };

  const displayText = value.length === 0 
    ? placeholder 
    : value.length === 1 
      ? value[0]
      : `Multiple Loc... (${value.length})`;

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <Typography 
        variant="body2" 
        sx={{ 
          mb: 1, 
          color: '#666',
          fontSize: '0.875rem',
          fontWeight: 500
        }}
      >
        {label}
      </Typography>
      
      <Box
        onClick={handleClick}
        sx={{
          display: 'flex',
          alignItems: 'center',
          border: '2px solid #e0e0e0',
          borderRadius: '8px',
          padding: '12px 16px',
          cursor: 'pointer',
          backgroundColor: '#fff',
          minHeight: '48px',
          position: 'relative',
          '&:hover': {
            borderColor: '#1976d2',
          }
        }}
      >
        {icon && (
          <Box sx={{ color: '#1976d2', mr: 1.5, display: 'flex', alignItems: 'center' }}>
            {icon}
          </Box>
        )}
        
        <Typography 
          variant="body1" 
          sx={{ 
            flexGrow: 1,
            color: value.length > 0 ? '#333' : '#999',
            fontSize: '0.95rem'
          }}
        >
          {displayText}
        </Typography>
        
        {value.length > 0 && (
          <IconButton
            size="small"
            onClick={handleClear}
            sx={{
              width: 20,
              height: 20,
              backgroundColor: '#666',
              color: 'white',
              fontSize: '12px',
              mr: 1,
              '&:hover': {
                backgroundColor: '#333',
              }
            }}
          >
            <CloseIcon sx={{ fontSize: '12px' }} />
          </IconButton>
        )}
        
        <SearchIcon sx={{ color: '#666', fontSize: '1.2rem' }} />
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            width: anchorEl?.offsetWidth || 'auto',
            maxHeight: 400,
            mt: 1,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }
        }}
      >
        {/* Search Box */}
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <TextField
            fullWidth
            placeholder="Search..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: '#666' }} />,
              sx: {
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#1976d2',
                  borderWidth: '2px'
                }
              }
            }}
          />
        </Box>

        {/* Select All */}
        <Box sx={{ p: 1 }}>
          <Box
            onClick={handleSelectAll}
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 1,
              cursor: 'pointer',
              borderRadius: 1,
              '&:hover': {
                backgroundColor: '#f5f5f5',
              }
            }}
          >
            <Checkbox
              checked={value.length === options.length}
              indeterminate={value.length > 0 && value.length < options.length}
              size="small"
              sx={{ p: 0, mr: 2 }}
            />
            <ListItemText primary="Select All" />
          </Box>
        </Box>

        <Divider />

        {/* Options List */}
        <MenuList sx={{ py: 0, maxHeight: 250, overflow: 'auto' }}>
          {filteredOptions.length === 0 ? (
            <MenuItem disabled>
              <ListItemText primary="No options found" />
            </MenuItem>
          ) : (
            filteredOptions.map((option) => (
              <MenuItem 
                key={option} 
                onClick={() => handleToggle(option)}
                dense
                sx={{ py: 1 }}
              >
                <Checkbox 
                  checked={value.includes(option)} 
                  size="small" 
                  sx={{ p: 0, mr: 2 }}
                />
                <ListItemText primary={option} />
              </MenuItem>
            ))
          )}
        </MenuList>
      </Popover>
    </Box>
  );
};

// Helper functions remain the same
const extractFinancialMetrics = (table5Data: any[]) => {
  if (!table5Data || table5Data.length === 0) return [];

  const metricsMap = new Map();
  
  table5Data.forEach(row => {
    const metric = row.Metric || row.metric;
    if (metric) {
      metricsMap.set(metric, {
        thisWeek: row['This Week'] || row.thisWeek || '0',
        lastWeek: row['Last Week'] || row.lastWeek || '0',
        twLwChange: row['Tw/Lw (+/-)'] || row.twLwChange || '0',
        budget: row.Budget || row.budget || '0',
        twBdgChange: row['Tw/Bdg (+/-)'] || row.twBdgChange || '0'
      });
    }
  });

  return metricsMap;
};

const formatPercentageChange = (value: string | number): { value: string, isPositive: boolean } => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  const isPositive = numValue >= 0;
  const formattedValue = isPositive ? `+${Math.abs(numValue).toFixed(2)}%` : `${numValue.toFixed(2)}%`;
  
  return { value: formattedValue, isPositive };
};

const formatCurrency = (value: string | number): string => {
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numValue);
};

// Main component
export function Financials() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Get financial-specific data from Redux
  const { 
    financialFiles, 
    currentFinancialLocation, 
    financialFilters,
    financialLocations,
    fileContent,
    loading,
    error
  } = useAppSelector((state) => state.excel);
  
  // Find current financial data for selected location
  const currentFinancialData = financialFiles.find(f => f.location === currentFinancialLocation);
  
  // State variables
  const [tabValue, setTabValue] = useState(0);
  const [statsData, setStatsData] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([currentFinancialLocation || '']);
  const [isLoading, setIsLoading] = useState(false);
  const [filterError, setFilterError] = useState<string>('');
  
  // Date range state - matching FilterSection pattern
  const DEFAULT_START_DATE = new Date(2010, 0, 1); // January 1, 2010
  const DEFAULT_END_DATE = new Date(2025, 0, 1);   // January 1, 2025
  
  const [localStartDate, setLocalStartDate] = useState<string>(
    format(DEFAULT_START_DATE, 'MM/dd/yyyy')
  );
  const [localEndDate, setLocalEndDate] = useState<string>(
    format(DEFAULT_END_DATE, 'MM/dd/yyyy')
  );
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState({
    startDate: DEFAULT_START_DATE,
    endDate: DEFAULT_END_DATE,
  });
  
  // Current table data from Redux or from current financial data
  const [currentTableData, setCurrentTableData] = useState<any>({
    table5: [],
    table2: [],
    table3: [],
    table4: []
  });
  
  // Extract data arrays from current financial data
  const locations = currentFinancialData?.data?.locations || financialLocations || ['Midtown East', 'Downtown West', 'Uptown North'];
  
  // Table data - use local state that gets updated from API calls
  const table5Data = currentTableData.table5 || currentFinancialData?.data?.table5 || [];
  const table2Data = currentTableData.table2 || currentFinancialData?.data?.table2 || [];
  const table3Data = currentTableData.table3 || currentFinancialData?.data?.table3 || [];
  const table4Data = currentTableData.table4 || currentFinancialData?.data?.table4 || [];

  // Initialize selected locations and table data
  useEffect(() => {
    if (locations.length > 0 && selectedLocations.length === 0) {
      setSelectedLocations([locations[0]]);
    }
    
    // Initialize table data from current financial data
    if (currentFinancialData?.data) {
      setCurrentTableData({
        table5: currentFinancialData.data.table5 || [],
        table2: currentFinancialData.data.table2 || [],
        table3: currentFinancialData.data.table3 || [],
        table4: currentFinancialData.data.table4 || []
      });
    }
  }, [locations, currentFinancialData]);

  // Handle filter changes
  const handleLocationChange = (newLocations: string[]) => {
    setSelectedLocations(newLocations);
  };

  // Date range handling - matching FilterSection pattern
  const openDateRangePicker = () => {
    setIsDateRangeOpen(true);
  };

  const handleDateRangeSelect = (range: any) => {
    setSelectedRange(range);
  };

  const applyDateRange = () => {
    const formattedStartDate = format(selectedRange.startDate, 'MM/dd/yyyy');
    const formattedEndDate = format(selectedRange.endDate, 'MM/dd/yyyy');
    
    console.log('📅 Financials: Setting date range locally:', {
      startDate: formattedStartDate,
      endDate: formattedEndDate
    });
    
    // Update local state only
    setLocalStartDate(formattedStartDate);
    setLocalEndDate(formattedEndDate);
    
    // Update Redux state for persistence
    dispatch(updateFinancialFilters({ 
      dateRange: `${formattedStartDate} - ${formattedEndDate}`
    }));
    
    setIsDateRangeOpen(false);
    
    console.log('📅 Date range set. User must click "Apply Filters" to send to backend.');
  };

  // Format display date
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return format(date, 'MMM dd, yyyy');
    } catch (e) {
      return dateStr;
    }
  };

  // Apply filters with backend API call
  const handleApplyFilters = async () => {
    setIsLoading(true);
    setFilterError('');
    
    try {
      // Find the current financial file data
      const currentFile = financialFiles.find(f => f.location === selectedLocations[0]);
      
      if (!currentFile) {
        throw new Error('No financial data found for selected location');
      }

      // Prepare the request payload
      const payload = {
        fileName: currentFile.fileName,
        fileContent: currentFile.fileContent,
        location: selectedLocations[0] || '',
        startDate: localStartDate,
        endDate: localEndDate,
        dashboard: 'Financials'
      };

      console.log('🚀 Sending financial filter request:', payload);

      // Make API call to financial filter endpoint
      const response = await axios.post(FINANCIAL_FILTER_API_URL, payload);

      console.log('📥 Received financial filter response:', response.data);

      if (response.data) {
        // Update local table data state
        setCurrentTableData({
          table5: response.data.table5 || [],
          table2: response.data.table2 || [],
          table3: response.data.table3 || [],
          table4: response.data.table4 || []
        });

        // Also update Redux state if needed
        dispatch(setTableData(response.data));

        // Update Redux filters
        dispatch(updateFinancialFilters({ 
          store: selectedLocations[0],
          dateRange: `${localStartDate} - ${localEndDate}`
        }));

        // Update current location if changed
        if (selectedLocations[0] !== currentFinancialLocation) {
          dispatch(selectFinancialLocation(selectedLocations[0]));
        }
      }

    } catch (err: any) {
      console.error('❌ Financial filter error:', err);
      
      let errorMessage = 'Error applying filters';
      
      if (axios.isAxiosError(err)) {
        if (err.response) {
          const detail = err.response.data?.detail;
          errorMessage = detail || `Server error: ${err.response.status}`;
        } else if (err.request) {
          errorMessage = 'No response from server. Please check if the backend is running.';
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setFilterError(errorMessage);
      dispatch(setError(errorMessage));
      
    } finally {
      setIsLoading(false);
    }
  };

  // Update stats when data changes
  useEffect(() => {
    if (table5Data.length > 0) {
      const metricsMap = extractFinancialMetrics(table5Data);
      
      const keyMetrics = [
        'Net Sales',
        'Orders', 
        'Avg Ticket',
        'Food Cost %',
        'Lbr %',
        'SPMH',
        'LPMH'
      ];

      const newStatsData = keyMetrics.map(metricName => {
        const metricData = metricsMap.get(metricName);
        
        if (!metricData) {
          return {
            label: metricName,
            value: '$0.00',
            bottomChange: '+0%',
            bottomLabel: '% Change',
            changeColor: '#1976d2',
            changeDirection: 'up'
          };
        }

        const twLwChange = formatPercentageChange(metricData.twLwChange);
        
        let formattedValue = metricData.thisWeek;
        let bottomLabel = '% Change';
        
        if (metricName === 'Net Sales') {
          formattedValue = formatCurrency(metricData.thisWeek);
        } else if (metricName === 'Avg Ticket' || metricName === 'SPMH' || metricName === 'LPMH') {
          formattedValue = formatCurrency(metricData.thisWeek);
        } else if (metricName.includes('%')) {
          formattedValue = `${parseFloat(metricData.thisWeek).toFixed(2)}%`;
        } else {
          formattedValue = parseInt(metricData.thisWeek).toLocaleString();
        }

        return {
          label: metricName,
          value: formattedValue,
          bottomChange: twLwChange.value,
          bottomLabel: bottomLabel,
          changeColor: twLwChange.isPositive ? '#2e7d32' : '#d32f2f',
          changeDirection: twLwChange.isPositive ? 'up' : 'down'
        };
      });
      
      setStatsData(newStatsData);
    } else {
      setStatsData([
        { label: 'Net Sales', value: '$0.00', bottomChange: '+0%', bottomLabel: '% Change', changeColor: '#1976d2' },
        { label: 'Orders', value: '0', bottomChange: '+0%', bottomLabel: '% Change', changeColor: '#1976d2' },
        { label: 'Avg Ticket', value: '$0.00', bottomChange: '0.00$', changeDirection: 'up', changeColor: '#2e7d32', bottomLabel: '$ Change' },
        { label: 'Food Cost %', value: '0.00%', bottomChange: '0.00%', changeDirection: 'up', changeColor: '#d32f2f', bottomLabel: '% Change' },
        { label: 'Labor Cost %', value: '0.00%', bottomChange: '0.00%', changeDirection: 'up', changeColor: '#d32f2f', bottomLabel: '% Change' },
        { label: 'SPMH', value: '$0.00', bottomChange: '0.00$', changeDirection: 'up', changeColor: '#2e7d32', bottomLabel: '% Change' },
        { label: 'LPMH', value: '$0.00', bottomChange: '0.00%', changeDirection: 'up', changeColor: '#d32f2f', bottomLabel: '% Change' },
      ]);
    }
  }, [table5Data]);

  // Tab change handler
  const handleTabChange = (event: any, newValue: number) => setTabValue(newValue);

  // Inject rotating animation for loading state
  React.useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      @keyframes rotating {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .rotating {
        animation: rotating 2s linear infinite;
      }
    `;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <Box sx={{ p: 2, backgroundColor: '#ffffff', minHeight: '100vh' }}>
      {/* Dashboard Title */}
      <Typography 
        variant="h4" 
        component="h1" 
        sx={{ 
          fontWeight: 600,
          color: '#1a237e',
          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
          mb: 3
        }}
      >
        Financial Dashboard
      </Typography>

      {/* Alert for no data */}
      {financialFiles.length === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          No financial data available. Please upload financial files with dashboard type "Financials" first.
        </Alert>
      )}

      {/* Error Alert */}
      {(filterError || error) && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => {
          setFilterError('');
          dispatch(setError(null));
        }}>
          {filterError || error}
        </Alert>
      )}

      {/* Filter Card - Updated with DateRangeSelector matching FilterSection */}
      <Card 
        elevation={2} 
        sx={{ 
          mb: 3, 
          borderRadius: 2,
          border: '1px solid #e0e0e0',
          overflow: 'visible'
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Filter Header */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mb: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterListIcon color="primary" />
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 500,
                  color: '#333',
                  fontSize: '1.1rem'
                }}
              >
                Filters
              </Typography>
            </Box>
            
            {/* Apply Filters Button */}
            <Button
              variant="outlined"
              onClick={handleApplyFilters}
              disabled={isLoading || loading}
              startIcon={
                (isLoading || loading) ? (
                  <CircularProgress size={16} />
                ) : (
                  <RefreshIcon />
                )
              }
              sx={{
                borderColor: '#1976d2',
                color: '#1976d2',
                fontWeight: 500,
                height: '30px',
                py: 1,
                px: 1,
                borderRadius: '4px',
                textTransform: 'uppercase',
                fontSize: '0.875rem',
                '&:hover': {
                  borderColor: '#1565c0',
                  backgroundColor: '#f3f7ff',
                }
              }}
            >
              {(isLoading || loading) ? 'Loading...' : 'APPLY FILTERS'}
            </Button>
          </Box>

          {/* Filter Inputs Row - Updated with DateRangeSelector matching FilterSection */}
          <Grid container spacing={3} sx={{ mb: 2 }}>
            {/* Location Filter */}
            <Grid item xs={12} md={6}>
              <MultiSelectFilter
                id="location-filter"
                label="Location"
                value={selectedLocations}
                options={locations}
                onChange={handleLocationChange}
                placeholder="Multiple Loc..."
                icon={<PlaceIcon />}
              />
            </Grid>

            {/* Date Range Button - Updated to match FilterSection pattern */}
            <Grid item xs={12} md={6}>
              <Typography 
                variant="body2" 
                sx={{ 
                  mb: 1, 
                  color: '#666',
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}
              >
                Date Range
              </Typography>
              <Button
                variant="outlined"
                onClick={openDateRangePicker}
                startIcon={<CalendarTodayIcon />}
                fullWidth
                sx={{ 
                  height: 48, 
                  justifyContent: 'flex-start',
                  textTransform: 'none',
                  borderColor: '#e0e0e0',
                  borderWidth: '2px',
                  color: 'text.primary',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  '&:hover': {
                    borderColor: '#1976d2',
                  }
                }}
              >
                <Box sx={{ textAlign: 'left', flexGrow: 1 }}>
                  <Typography variant="body1" component="div" sx={{ fontSize: '0.95rem' }}>
                    {formatDisplayDate(localStartDate)} - {formatDisplayDate(localEndDate)}
                  </Typography>
                </Box>
              </Button>
            </Grid>
          </Grid>

          {/* Active Filters Pills */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {selectedLocations.length > 0 && (
              <Chip
                icon={<PlaceIcon sx={{ fontSize: '1rem' }} />}
                label={selectedLocations.length === 1 
                  ? `Location: ${selectedLocations[0]}` 
                  : `Location: Multiple Locations`
                }
                onDelete={() => setSelectedLocations([])}
                color="primary"
                variant="outlined"
                deleteIcon={<CloseIcon sx={{ fontSize: '1rem' }} />}
                sx={{
                  borderRadius: '20px',
                  height: '32px',
                  fontSize: '0.875rem',
                  '& .MuiChip-icon': {
                    fontSize: '1rem'
                  }
                }}
              />
            )}
            
            <Chip
              icon={<CalendarTodayIcon sx={{ fontSize: '1rem' }} />}
              label={`Date Range: ${formatDisplayDate(localStartDate)} - ${formatDisplayDate(localEndDate)}`}
              onDelete={() => {
                setLocalStartDate(format(DEFAULT_START_DATE, 'MM/dd/yyyy'));
                setLocalEndDate(format(DEFAULT_END_DATE, 'MM/dd/yyyy'));
              }}
              color="secondary"
              variant="outlined"
              deleteIcon={<CloseIcon sx={{ fontSize: '1rem' }} />}
              sx={{
                borderRadius: '20px',
                height: '32px',
                fontSize: '0.875rem',
                '& .MuiChip-icon': {
                  fontSize: '1rem'
                }
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Show current data info */}
      {currentFinancialData && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Data loaded:</strong> {currentFinancialData.fileName} | 
            <strong> Location:</strong> {currentFinancialLocation} | 
            <strong> Metrics:</strong> {table5Data.length} available
            {' | '}
            <strong> Date Range:</strong> {formatDisplayDate(localStartDate)} - {formatDisplayDate(localEndDate)}
          </Typography>
        </Alert>
      )}

      {/* Week-Over-Week Analysis Card - REDUCED HEIGHT */}
      <Card 
        elevation={3} 
        sx={{ 
          borderRadius: 2,
          mb: 3
        }}
      >
        <CardContent sx={{ py: 1.5, px: 3 }}> {/* Reduced padding from py: 2 to py: 1.5 */}
          <Typography 
            variant="h5" 
            align="center" 
            sx={{ 
              fontWeight: 500,
              mb: 1.5, // Reduced margin from mb: 2 to mb: 1.5
              color: '#1565c0'
            }}
          >
            Week-Over-Week Analysis
          </Typography>
          
          {/* Loading State */}
          {(isLoading || loading) && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
              <CircularProgress size={40} />
              <Typography sx={{ ml: 2 }}>Loading financial data...</Typography>
            </Box>
          )}
          
          {/* Stats Grid - Two Rows - REDUCED SPACING */}
          {!isLoading && !loading && (
            <Grid container spacing={1}> {/* Reduced spacing from 1.5 to 1 */}
              {/* First Row - 4 items */}
              {statsData.slice(0, 4).map((stat, index) => (
                <Grid item xs={6} sm={3} key={index}>
                  <Card 
                    elevation={1} 
                    sx={{ 
                      p: 1, // Reduced padding from p: 1.5 to p: 1
                      textAlign: 'center',
                      height: '100%',
                      backgroundColor: '#ffffff',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 3,
                      }
                    }}
                  >
                    <Typography 
                      sx={{ 
                        color: '#1976d2', 
                        fontWeight: 500,
                        fontSize: '0.75rem', // Reduced font size
                        mb: 0.25 // Reduced margin
                      }}
                    >
                      {stat.label}
                    </Typography>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600,
                        color: '#263238',
                        mb: 0.25, // Reduced margin
                        fontSize: '1.1rem' // Reduced font size
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      mb: 0.25,
                      gap: 0.5
                    }}>
                      {stat.changeDirection && (
                        <span style={{ 
                          color: stat.changeColor, 
                          fontSize: '10px', // Reduced font size
                          fontWeight: 'bold'
                        }}>
                          {stat.changeDirection === 'up' ? '▲' : '▼'}
                        </span>
                      )}
                      <Typography 
                        sx={{ 
                          color: stat.changeColor || '#1976d2',
                          fontSize: '0.75rem', // Reduced font size
                          fontWeight: 500
                        }}
                      >
                        {stat.bottomChange}
                      </Typography>
                    </Box>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#757575',
                        fontSize: '0.65rem' // Reduced font size
                      }}
                    >
                      {stat.bottomLabel}
                    </Typography>
                  </Card>
                </Grid>
              ))}
              
              {/* Second Row - 3 items centered */}
              <Grid item xs={12}>
                <Grid container spacing={1} justifyContent="center"> {/* Reduced spacing */}
                  {statsData.slice(4, 7).map((stat, index) => (
                    <Grid item xs={6} sm={4} key={index + 4}>
                      <Card 
                        elevation={1} 
                        sx={{ 
                          p: 1, // Reduced padding
                          textAlign: 'center',
                          height: '100%',
                          backgroundColor: '#ffffff',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: 3,
                          }
                        }}
                      >
                        <Typography 
                          sx={{ 
                            color: '#1976d2', 
                            fontWeight: 500,
                            fontSize: '0.75rem', // Reduced font size
                            mb: 0.25
                          }}
                        >
                          {stat.label}
                        </Typography>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 600,
                            color: '#263238',
                            mb: 0.25,
                            fontSize: '1.1rem' // Reduced font size
                          }}
                        >
                          {stat.value}
                        </Typography>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          mb: 0.25,
                          gap: 0.5
                        }}>
                          {stat.changeDirection && (
                            <span style={{ 
                              color: stat.changeColor, 
                              fontSize: '10px', // Reduced font size
                              fontWeight: 'bold'
                            }}>
                              {stat.changeDirection === 'up' ? '▲' : '▼'}
                            </span>
                          )}
                          <Typography 
                            sx={{ 
                              color: stat.changeColor || '#1976d2',
                              fontSize: '0.75rem', // Reduced font size
                              fontWeight: 500
                            }}
                          >
                            {stat.bottomChange}
                          </Typography>
                        </Box>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#757575',
                            fontSize: '0.65rem' // Reduced font size
                          }}
                        >
                          {stat.bottomLabel}
                        </Typography>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card sx={{ borderRadius: 2 }} elevation={3}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="fullWidth"
          sx={{ 
            '& .MuiTab-root': { 
              fontWeight: 500,
              textTransform: 'none',
              fontSize: '1rem',
              py: 2
            },
            borderBottom: '2px solid #e0e0e0',
            backgroundColor: '#fafafa'
          }}
        >
          <Tab label="Dashboard" />
          <Tab label="Detailed Analysis" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 3 }}>
            <FinancialTable data={table5Data} />
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3 }}>
            <DayOfWeekAnalysis 
              salesData={table2Data}
              ordersData={table3Data} 
              avgTicketData={table4Data}
            />
            
            {currentFinancialData && (table2Data.length > 0 || table3Data.length > 0 || table4Data.length > 0) && (
              <Box sx={{ mt: 4 }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    mb: 3,
                    textAlign: 'center',
                    fontWeight: 600,
                    color: '#424242'
                  }}
                >
                  Day of Week Trends
                </Typography>
                
                {table2Data.length > 0 && (
                  <Box sx={{ mb: 4 }}>
                    <SalesChart data={table2Data} />
                  </Box>
                )}
                
                {table3Data.length > 0 && (
                  <Box sx={{ mb: 4 }}>
                    <OrdersChart data={table3Data} />
                  </Box>
                )}
                
                {table4Data.length > 0 && (
                  <Box>
                    <AvgTicketChart data={table4Data} />
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </TabPanel>
      </Card>

      {/* Date Range Picker Dialog - Added to match FilterSection */}
      <Dialog
        open={isDateRangeOpen}
        onClose={() => setIsDateRangeOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Select Date Range</DialogTitle>
        <DialogContent>
          <DateRangeSelector
            initialState={[
              {
                startDate: selectedRange.startDate,
                endDate: selectedRange.endDate,
                key: 'selection'
              }
            ]}
            onSelect={handleDateRangeSelect}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDateRangeOpen(false)}>Cancel</Button>
          <Button onClick={applyDateRange} variant="contained" color="primary">
            Set Date Range
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Financials;
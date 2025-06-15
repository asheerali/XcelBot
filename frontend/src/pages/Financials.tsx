// src/pages/Financials.tsx - Updated with table1 data and enhanced aesthetics

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
import InputLabel from '@mui/material/InputLabel';
import { alpha, styled } from '@mui/material/styles';

// Import axios for API calls
import axios from 'axios';
import { format } from 'date-fns';

// Icons
import PlaceIcon from '@mui/icons-material/Place';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import DashboardIcon from '@mui/icons-material/Dashboard';

// Import components
import FinancialTable from '../components/FinancialTable';
import DayOfWeekAnalysis from '../components/DayOfWeekAnalysis';
import WeekOverWeekChart from '../components/graphs/WeekOverWeekChart';
import BudgetChart from '../components/graphs/BudgetChart';
import SalesChart from '../components/graphs/SalesChart';
import OrdersChart from '../components/graphs/OrdersChart';
import AvgTicketChart from '../components/graphs/AvgTicketChart';
import DateRangeSelector from '../components/DateRangeSelector';
import ComprehensiveFinancialDashboard from '../components/ComprehensiveFinancialDashboard';

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

// Enhanced styled components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
  boxShadow: `
    0 8px 32px ${alpha(theme.palette.common.black, 0.08)},
    0 2px 16px ${alpha(theme.palette.common.black, 0.04)}
  `,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `
      0 12px 40px ${alpha(theme.palette.common.black, 0.12)},
      0 4px 20px ${alpha(theme.palette.common.black, 0.08)}
    `,
  }
}));

const GradientCard = styled(Card)(({ theme }) => ({
  borderRadius: 20,
  background: `linear-gradient(135deg, 
    ${alpha(theme.palette.primary.main, 0.02)} 0%, 
    ${alpha(theme.palette.secondary.main, 0.02)} 50%,
    ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
  boxShadow: `
    0 20px 60px ${alpha(theme.palette.common.black, 0.08)},
    0 8px 32px ${alpha(theme.palette.common.black, 0.04)},
    inset 0 1px 0 ${alpha(theme.palette.common.white, 0.1)}
  `,
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `
      0 32px 80px ${alpha(theme.palette.common.black, 0.12)},
      0 16px 48px ${alpha(theme.palette.common.black, 0.08)},
      inset 0 1px 0 ${alpha(theme.palette.common.white, 0.2)}
    `,
  }
}));

const MetricCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(1),
  textAlign: 'center',
  height: '100%',
  borderRadius: 12,
  background: `linear-gradient(145deg, 
    ${theme.palette.background.paper} 0%, 
    ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  boxShadow: `
    0 4px 20px ${alpha(theme.palette.common.black, 0.04)},
    0 1px 8px ${alpha(theme.palette.common.black, 0.02)}
  `,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover': {
    transform: 'translateY(-3px) scale(1.02)',
    boxShadow: `
      0 12px 32px ${alpha(theme.palette.common.black, 0.08)},
      0 4px 16px ${alpha(theme.palette.common.black, 0.04)}
    `,
    '&::before': {
      opacity: 1,
    }
  }
}));

const AnimatedTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTab-root': { 
    fontWeight: 600,
    textTransform: 'none',
    fontSize: '1rem',
    padding: theme.spacing(2, 3),
    borderRadius: '12px 12px 0 0',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 2,
      background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
      transform: 'scaleX(0)',
      transition: 'transform 0.3s ease',
    },
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.04),
      '&::before': {
        transform: 'scaleX(1)',
      }
    },
    '&.Mui-selected': {
      color: theme.palette.primary.main,
      backgroundColor: alpha(theme.palette.primary.main, 0.08),
      '&::before': {
        transform: 'scaleX(1)',
      }
    }
  },
  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: '3px 3px 0 0',
    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  },
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  background: `linear-gradient(135deg, 
    ${alpha(theme.palette.background.paper, 0.9)} 0%, 
    ${alpha(theme.palette.background.default, 0.4)} 100%)`,
  backdropFilter: 'blur(10px)',
}));

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

// Multi-Select Filter Component matching the image design (keeping same design)
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

// Date Range Selector Component (keeping same design)
interface DateRangeSelectorComponentProps {
  label: string;
  onDateRangeSelect: (dateRange: any) => void;
  onCancel?: () => void;
}

const DateRangeSelectorComponent: React.FC<DateRangeSelectorComponentProps> = ({
  label,
  onDateRangeSelect,
  onCancel
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<string>('Select date range');
  const [tempRange, setTempRange] = useState<any>(null);

  const handleClick = () => {
    setIsDialogOpen(true);
  };

  const handleClose = () => {
    setIsDialogOpen(false);
    setTempRange(null);
  };

  const handleDateRangeSelect = (range: any) => {
    setTempRange(range);
  };

  const handleApply = () => {
    if (tempRange) {
      // Format the display text
      const startDate = tempRange.startDate.toLocaleDateString();
      const endDate = tempRange.endDate.toLocaleDateString();
      setSelectedRange(`${startDate} - ${endDate}`);
      
      // Pass the range to parent with formatted strings
      const rangeWithStrings = {
        ...tempRange,
        startDateStr: format(tempRange.startDate, 'yyyy-MM-dd'),
        endDateStr: format(tempRange.endDate, 'yyyy-MM-dd')
      };
      
      onDateRangeSelect(rangeWithStrings);
    }
    setIsDialogOpen(false);
  };

  const handleCancel = () => {
    setTempRange(null);
    if (onCancel) {
      onCancel();
    }
    setIsDialogOpen(false);
  };

  const handleClear = (event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedRange('Select date range');
    onDateRangeSelect(null);
  };

  return (
    <>
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
          <Box sx={{ color: '#1976d2', mr: 1.5, display: 'flex', alignItems: 'center' }}>
            <CalendarTodayIcon />
          </Box>
          
          <Typography 
            variant="body1" 
            sx={{ 
              flexGrow: 1,
              color: selectedRange === 'Select date range' ? '#999' : '#333',
              fontSize: '0.95rem'
            }}
          >
            {selectedRange}
          </Typography>
          
          {selectedRange !== 'Select date range' && (
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
      </Box>

      {/* Dialog for Date Range Selection */}
      <Dialog
        open={isDialogOpen}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: '80vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid #e0e0e0',
          pb: 2
        }}>
          Select Date Range
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          <DateRangeSelector onSelect={handleDateRangeSelect} />
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 2,
          borderTop: '1px solid #e0e0e0',
          justifyContent: 'flex-end'
        }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              onClick={handleCancel}
              color="secondary"
              variant="outlined"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleApply} 
              variant="contained" 
              color="primary"
              disabled={!tempRange}
            >
              Select Date Range
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
};

// Helper functions for data processing
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
  const [tabValue, setTabValue] = useState(0); // Start with Comprehensive View
  const [statsData, setStatsData] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([currentFinancialLocation || '']);
  const [selectedDateRange, setSelectedDateRange] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterError, setFilterError] = useState<string>('');
  
  // UPDATED: Current table data from Redux or from current financial data - INCLUDING TABLE1
  const [currentTableData, setCurrentTableData] = useState<any>({
    table1: [], // ADDED: Include table1
    table2: [],
    table3: [],
    table4: [],
    table5: [],
    table6: [],
    table7: [],
    table8: [],
    table9: [],
    table10: [],
    table11: [],
    table12: [],
    table13: [],
    table14: [],
    table15: [],
    table16: []
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
    
    // UPDATED: Initialize table data from current financial data - INCLUDING TABLE1
    if (currentFinancialData?.data) {
      setCurrentTableData({
        table1: currentFinancialData.data.table1 || [], // ADDED: Include table1
        table2: currentFinancialData.data.table2 || [],
        table3: currentFinancialData.data.table3 || [],
        table4: currentFinancialData.data.table4 || [],
        table5: currentFinancialData.data.table5 || [],
        table6: currentFinancialData.data.table6 || [],
        table7: currentFinancialData.data.table7 || [],
        table8: currentFinancialData.data.table8 || [],
        table9: currentFinancialData.data.table9 || [],
        table10: currentFinancialData.data.table10 || [],
        table11: currentFinancialData.data.table11 || [],
        table12: currentFinancialData.data.table12 || [],
        table13: currentFinancialData.data.table13 || [],
        table14: currentFinancialData.data.table14 || [],
        table15: currentFinancialData.data.table15 || [],
        table16: currentFinancialData.data.table16 || []
      });
    }
  }, [locations, currentFinancialData]);

  // Handle filter changes
  const handleLocationChange = (newLocations: string[]) => {
    setSelectedLocations(newLocations);
  };

  const handleDateRangeSelect = (dateRange: any) => {
    setSelectedDateRange(dateRange);
  };

  // Apply filters with backend API call
  const handleApplyFilters = async () => {
    setIsLoading(true);
    setFilterError('');
    
    try {
      // Find the current financial file data for the first selected location
      const currentFile = financialFiles.find(f => f.location === selectedLocations[0]);
      
      if (!currentFile) {
        throw new Error('No financial data found for selected location');
      }

      // Prepare the request payload with all selected locations
      const payload = {
        fileName: currentFile.fileName,
        locations: selectedLocations,
        startDate: selectedDateRange?.startDateStr || null,
        endDate: selectedDateRange?.endDateStr || null,
        dashboard: 'Financials'
      };

      console.log('🚀 Sending financial filter request:', payload);

      // Make API call to financial filter endpoint
      const response = await axios.post(FINANCIAL_FILTER_API_URL, payload);

      console.log('📥 Received financial filter response:', response.data);

      if (response.data) {
        // UPDATED: Update local table data state with all tables INCLUDING TABLE1
        setCurrentTableData({
          table1: response.data.table1 || [], // ADDED: Include table1 from response
          table2: response.data.table2 || [],
          table3: response.data.table3 || [],
          table4: response.data.table4 || [],
          table5: response.data.table5 || [],
          table6: response.data.table6 || [],
          table7: response.data.table7 || [],
          table8: response.data.table8 || [],
          table9: response.data.table9 || [],
          table10: response.data.table10 || [],
          table11: response.data.table11 || [],
          table12: response.data.table12 || [],
          table13: response.data.table13 || [],
          table14: response.data.table14 || [],
          table15: response.data.table15 || [],
          table16: response.data.table16 || []
        });

        // Also update Redux state if needed
        dispatch(setTableData(response.data));

        // Update Redux filters
        dispatch(updateFinancialFilters({ 
          store: selectedLocations[0],
          dateRange: selectedDateRange ? `${selectedDateRange.startDateStr} - ${selectedDateRange.endDateStr}` : ''
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
            value: '0',
            bottomChange: '0%',
            bottomLabel: '% Change',
            changeColor: '#666',
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
      setStatsData([]);
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
    <Box sx={{ 
      p: 3, 
      backgroundColor: '#f8fafc', 
      minHeight: '100vh',
      background: `linear-gradient(135deg, 
        ${alpha(theme.palette.background.default, 0.8)} 0%, 
        ${alpha(theme.palette.primary.main, 0.02)} 50%,
        ${alpha(theme.palette.secondary.main, 0.02)} 100%)`
    }}>
      {/* Enhanced Dashboard Title */}
      <Box sx={{ 
        textAlign: 'center',
        mb: 4,
        position: 'relative'
      }}>
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'center',
            width: '100%'
          }}>
            <h1 
              style={{ 
                fontWeight: 800,
                background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: 'clamp(1.75rem, 5vw, 3rem)',
                marginBottom: '8px',
                letterSpacing: '-0.02em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                margin: '0',
                textAlign: 'center'
              }}
            >
              <span style={{ 
                color: '#1976d2',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                fontSize: 'inherit',
                display: 'inline-flex',
                alignItems: 'center'
              }}>
                <svg 
                  width="1em" 
                  height="1em" 
                  viewBox="0 0 100 100" 
                  fill="currentColor"
                  style={{ fontSize: 'inherit' }}
                >
                  {/* 4-square logo matching your design */}
                  <rect x="10" y="10" width="35" height="35" rx="4" fill="#5A8DEE"/>
                  <rect x="55" y="10" width="35" height="35" rx="4" fill="#4285F4"/>
                  <rect x="10" y="55" width="35" height="35" rx="4" fill="#1976D2"/>
                  <rect x="55" y="55" width="35" height="35" rx="4" fill="#3F51B5"/>
                </svg>
              </span>
              Financial Dashboard
            </h1>
          </div>
  
        <Typography 
          variant="h6" 
          sx={{ 
            color: alpha(theme.palette.text.secondary, 0.8),
            fontWeight: 500,
            letterSpacing: '0.02em'
          }}
        >
          {/* Comprehensive Financial Analytics & Performance Insights */}
        </Typography>
      </Box>

     

      {/* Error Alert */}
      {(filterError || error) && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
            boxShadow: `0 4px 20px ${alpha(theme.palette.error.main, 0.1)}`
          }} 
          onClose={() => {
            setFilterError('');
            dispatch(setError(null));
          }}
        >
          {filterError || error}
        </Alert>
      )}

      {/* Enhanced Filter Card */}
      <GradientCard 
        elevation={0}
        sx={{ 
          mb: 4,
          overflow: 'visible'
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Filter Header */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 3
          }}>
            <FilterListIcon 
              sx={{ 
                color: theme.palette.primary.main,
                fontSize: '1.5rem',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
              }} 
            />
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 700,
                color: theme.palette.text.primary,
                fontSize: '1.25rem',
                ml: 1.5,
                letterSpacing: '-0.01em'
              }}
            >
              Advanced Filters
            </Typography>
          </Box>

          {/* Filter Inputs Row */}
          <Grid container spacing={4} sx={{ mb: 3 }} justifyContent="center">
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

            {/* Date Range Filter */}
            <Grid item xs={12} md={6}>
              <DateRangeSelectorComponent
                label="Date Range"
                onDateRangeSelect={handleDateRangeSelect}
                onCancel={() => setSelectedDateRange(null)}
              />
            </Grid>
          </Grid>

          {/* Enhanced Active Filters Pills */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
            {selectedLocations.length > 0 && (
              <Chip
                icon={<PlaceIcon sx={{ fontSize: '1rem' }} />}
                label={selectedLocations.length === 1 
                  ? `Location: ${selectedLocations[0]}` 
                  : `Location: Multiple Locations (${selectedLocations.length})`
                }
                onDelete={() => setSelectedLocations([])}
                color="primary"
                variant="outlined"
                deleteIcon={<CloseIcon sx={{ fontSize: '1rem' }} />}
                sx={{
                  borderRadius: '24px',
                  height: '36px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                  background: alpha(theme.palette.primary.main, 0.05),
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    background: alpha(theme.palette.primary.main, 0.1),
                    transform: 'translateY(-1px)',
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
                  },
                  '& .MuiChip-icon': {
                    fontSize: '1rem'
                  }
                }}
              />
            )}
            
            {selectedDateRange && (
              <Chip
                icon={<CalendarTodayIcon sx={{ fontSize: '1rem' }} />}
                label={`Date Range: ${selectedDateRange.startDate.toLocaleDateString()} - ${selectedDateRange.endDate.toLocaleDateString()}`}
                onDelete={() => setSelectedDateRange(null)}
                sx={{
                  borderRadius: '24px',
                  height: '36px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                  color: theme.palette.secondary.main,
                  border: `2px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    background: alpha(theme.palette.secondary.main, 0.15),
                    transform: 'translateY(-1px)',
                    boxShadow: `0 4px 12px ${alpha(theme.palette.secondary.main, 0.2)}`
                  },
                  '& .MuiChip-icon': {
                    color: theme.palette.secondary.main,
                    fontSize: '1rem'
                  },
                  '& .MuiChip-deleteIcon': {
                    color: theme.palette.secondary.main,
                    fontSize: '1rem'
                  }
                }}
                deleteIcon={<CloseIcon sx={{ fontSize: '1rem' }} />}
              />
            )}
          </Box>

          {/* Enhanced Apply Filters Button */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'flex-start',
            mt: 2
          }}>
            <Button
              variant="contained"
              onClick={handleApplyFilters}
              disabled={isLoading || loading}
              startIcon={
                (isLoading || loading) ? (
                  <CircularProgress size={18} sx={{ color: theme.palette.common.white }} />
                ) : (
                  <AnalyticsIcon />
                )
              }
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: 'white',
                fontWeight: 700,
                height: '48px',
                px: 4,
                borderRadius: '24px',
                textTransform: 'uppercase',
                fontSize: '0.875rem',
                letterSpacing: '0.05em',
                boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                border: 'none',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.common.white, 0.2)}, transparent)`,
                  transition: 'left 0.5s ease',
                },
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 30px ${alpha(theme.palette.primary.main, 0.4)}`,
                  '&::before': {
                    left: '100%',
                  }
                },
                '&:disabled': {
                  background: alpha(theme.palette.action.disabled, 0.3),
                  color: alpha(theme.palette.text.disabled, 0.6),
                  boxShadow: 'none',
                  transform: 'none'
                }
              }}
            >
              {(isLoading || loading) ? 'Analyzing Data...' : 'Apply Advanced Filters'}
            </Button>
          </Box>
        </CardContent>
      </GradientCard>

  

      {/* Enhanced Week-Over-Week Analysis Card */}
      <StyledCard 
        elevation={0}
        sx={{ 
          mb: 4,
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.background.paper, 0.95)} 0%, 
            ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
          backdropFilter: 'blur(20px)',
        }}
      >
        <CardContent sx={{ py: 2.5, px: 4 }}>
          <Typography 
            variant="h4" 
            align="center" 
            sx={{ 
              fontWeight: 700,
              mb: 2.5,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.01em'
            }}
          >
            <TrendingUpIcon sx={{ 
              fontSize: 'inherit', 
              mr: 2, 
              color: theme.palette.primary.main,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
            }} />
            Week-Over-Week Analysis
          </Typography>
          
          {/* Loading State */}
          {(isLoading || loading) && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              py: 6,
              flexDirection: 'column',
              gap: 2
            }}>
              <CircularProgress 
                size={48} 
                sx={{ 
                  color: theme.palette.primary.main,
                  filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))'
                }} 
              />
              <Typography 
                sx={{ 
                  fontSize: '1.1rem',
                  fontWeight: 500,
                  color: theme.palette.text.secondary
                }}
              >
                Analyzing financial data...
              </Typography>
            </Box>
          )}
          
          {/* Enhanced Stats Grid */}
          {!isLoading && !loading && (
            <>
              {statsData.length > 0 ? (
                <Grid container spacing={1.5}>
                  {/* First Row - 4 items */}
                  {statsData.slice(0, 4).map((stat, index) => (
                    <Grid item xs={6} sm={3} key={index}>
                      <MetricCard elevation={0}>
                        <Typography 
                          sx={{ 
                            color: theme.palette.primary.main, 
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            mb: 0.5,
                            textTransform: 'uppercase',
                            letterSpacing: '0.02em'
                          }}
                        >
                          {stat.label}
                        </Typography>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 700,
                            color: theme.palette.text.primary,
                            mb: 0.5,
                            fontSize: '1.2rem'
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
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}>
                              {stat.changeDirection === 'up' ? '▲' : '▼'}
                            </span>
                          )}
                          <Typography 
                            sx={{ 
                              color: stat.changeColor || theme.palette.primary.main,
                              fontSize: '0.8rem',
                              fontWeight: 600
                            }}
                          >
                            {stat.bottomChange}
                          </Typography>
                        </Box>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: alpha(theme.palette.text.secondary, 0.8),
                            fontSize: '0.7rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.02em'
                          }}
                        >
                          {stat.bottomLabel}
                        </Typography>
                      </MetricCard>
                    </Grid>
                  ))}
                  
                  {/* Second Row - 3 items centered */}
                  <Grid item xs={12}>
                    <Grid container spacing={1.5} justifyContent="center">
                      {statsData.slice(4, 7).map((stat, index) => (
                        <Grid item xs={6} sm={4} key={index + 4}>
                          <MetricCard elevation={0}>
                            <Typography 
                              sx={{ 
                                color: theme.palette.primary.main, 
                                fontWeight: 600,
                                fontSize: '0.8rem',
                                mb: 0.5,
                                textTransform: 'uppercase',
                                letterSpacing: '0.02em'
                              }}
                            >
                              {stat.label}
                            </Typography>
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                fontWeight: 700,
                                color: theme.palette.text.primary,
                                mb: 0.5,
                                fontSize: '1.2rem'
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
                                  fontSize: '12px',
                                  fontWeight: 'bold'
                                }}>
                                  {stat.changeDirection === 'up' ? '▲' : '▼'}
                                </span>
                              )}
                              <Typography 
                                sx={{ 
                                  color: stat.changeColor || theme.palette.primary.main,
                                  fontSize: '0.8rem',
                                  fontWeight: 600
                                }}
                              >
                                {stat.bottomChange}
                              </Typography>
                            </Box>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: alpha(theme.palette.text.secondary, 0.8),
                                fontSize: '0.7rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.02em'
                              }}
                            >
                              {stat.bottomLabel}
                            </Typography>
                          </MetricCard>
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>
                </Grid>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  py: 6,
                  flexDirection: 'column',
                  gap: 2
                }}>
                  <AnalyticsIcon 
                    sx={{ 
                      fontSize: '3rem',
                      color: alpha(theme.palette.text.secondary, 0.3)
                    }} 
                  />
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: alpha(theme.palette.text.secondary, 0.7),
                      fontWeight: 500
                    }}
                  >
                    No financial metrics available
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: alpha(theme.palette.text.secondary, 0.5),
                      textAlign: 'center'
                    }}
                  >
                    Please upload data and apply filters to view analytics
                  </Typography>
                </Box>
              )}
            </>
          )}
        </CardContent>
      </StyledCard>

      {/* Enhanced Tabs */}
      <StyledCard elevation={0} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <AnimatedTabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="fullWidth"
        >
          <Tab 
            label="Comprehensive View"
            icon={<DashboardIcon />}
            iconPosition="start"
          />
          <Tab 
            label="Dashboard"
            icon={<AnalyticsIcon />}
            iconPosition="start"
          />
          <Tab 
            label="Detailed Analysis"
            icon={<TrendingUpIcon />}
            iconPosition="start"
          />
        </AnimatedTabs>

        {/* Tab 1 - Comprehensive View */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ 
            background: `linear-gradient(135deg, 
              ${alpha(theme.palette.background.paper, 0.8)} 0%, 
              ${alpha(theme.palette.background.default, 0.4)} 100%)`,
            backdropFilter: 'blur(20px)'
          }}>
            {/* UPDATED: Pass currentTableData (which now includes table1) to ComprehensiveFinancialDashboard */}
            <ComprehensiveFinancialDashboard financialData={currentTableData} />
          </Box>
        </TabPanel>

        {/* Tab 2 - Dashboard */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 4 }}>
            <FinancialTable data={table5Data} />
          </Box>
        </TabPanel>
        
        {/* Tab 3 - Detailed Analysis */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 4 }}>
            <DayOfWeekAnalysis 
              salesData={table2Data}
              ordersData={table3Data} 
              avgTicketData={table4Data}
            />
            
            {currentFinancialData && (table2Data.length > 0 || table3Data.length > 0 || table4Data.length > 0) && (
              <Box sx={{ mt: 4 }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    mb: 4,
                    textAlign: 'center',
                    fontWeight: 700,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.01em'
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
      </StyledCard>
    </Box>
  );
}

export default Financials;
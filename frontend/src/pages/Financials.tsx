<<<<<<< HEAD
// src/pages/Financials.tsx - Updated with integrated filters using financial-specific Redux state

import React, { useState, useEffect } from 'react';
=======
// src/pages/Financials.tsx - Updated with Redux integration and FIXED auto-filtering with proper array handling
import React, { useState, useEffect, useRef } from 'react';
>>>>>>> integrations_v41
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
<<<<<<< HEAD
=======
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
import LinearProgress from '@mui/material/LinearProgress';
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
import BusinessIcon from '@mui/icons-material/Business';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Import components
>>>>>>> integrations_v41
import FinancialTable from '../components/FinancialTable';
import DayOfWeekAnalysis from '../components/DayOfWeekAnalysis';
import WeekOverWeekChart from '../components/graphs/WeekOverWeekChart';
import BudgetChart from '../components/graphs/BudgetChart';
import SalesChart from '../components/graphs/SalesChart';
import OrdersChart from '../components/graphs/OrdersChart';
import AvgTicketChart from '../components/graphs/AvgTicketChart';
import DateRangeSelector from '../components/DateRangeSelector';
import ComprehensiveFinancialDashboard from '../components/ComprehensiveFinancialDashboard';

<<<<<<< HEAD
// Import Redux hooks
import { useAppDispatch, useAppSelector } from '../typedHooks';
import { 
  selectFinancialLocation, 
  updateFinancialFilters 
} from '../store/excelSlice';

// Tab Panel Component
function TabPanel(props) {
=======
// Import Redux hooks and actions
import { useAppDispatch, useAppSelector } from '../typedHooks';
import { 
  selectFinancialLocation, 
  updateFinancialFilters,
  setTableData,
  setLoading,
  setError,
} from '../store/excelSlice';

// NEW: Import Redux date range actions and selectors
import {
  setFinancialsDashboardDateRange,
  setFinancialsDashboardStartDate,
  setFinancialsDashboardEndDate,
  clearFinancialsDashboardDateRange,
  selectFinancialsDashboardStartDate,
  selectFinancialsDashboardEndDate,
  selectFinancialsDashboardDateRange,
  selectHasFinancialsDashboardDateRange,
} from '../store/slices/dateRangeSlice';

// NEW: Import masterFileSlice Redux actions and selectors
import {
  setSelectedCompanies,
  setSelectedLocations,
  clearSelections,
  selectSelectedCompanies,
  selectSelectedLocations,
  selectLoading as selectMasterFileLoading,
  selectError as selectMasterFileError
} from '../store/slices/masterFileSlice';

import { API_URL_Local } from '../constants';

// Company-Location interfaces
interface CompanyLocation {
  company_id: string;
  company_name: string;
  locations: Array<{
    location_id: string;
    location_name: string;
  }>;
}

// API URLs - UPDATED to use company-locations endpoint
const FINANCIAL_FILTER_API_URL = `${API_URL_Local}/api/financials/filter`;
const COMPANY_LOCATIONS_API_URL = `${API_URL_Local}/company-locations/all`; // NEW: Updated endpoint

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

// NEW: Auto-filtering indicator
const AutoFilterChip = styled(Chip)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.success.main, 0.1),
  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
  '& .MuiChip-icon': {
    color: theme.palette.success.main,
    animation: 'rotating 2s linear infinite',
  },
  '& .MuiChip-label': {
    color: theme.palette.success.main,
    fontWeight: 600,
  },
}));

// Company info display component
const CompanyInfoChip = styled(Chip)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  '& .MuiChip-icon': {
    color: theme.palette.primary.main,
  },
  '& .MuiChip-label': {
    color: theme.palette.primary.main,
    fontWeight: 600,
  },
}));

// TabPanel Component
interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

function TabPanel(props: TabPanelProps) {
>>>>>>> integrations_v41
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

<<<<<<< HEAD
// Main component
export function Financials() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Get financial-specific data from Redux
  const { 
    financialFiles, 
    currentFinancialLocation, 
    financialFilters,
    financialLocations 
  } = useAppSelector((state) => state.excel);
  
  // Find current financial data for selected location
  const currentFinancialData = financialFiles.find(f => f.location === currentFinancialLocation);
  
  // State variables
  const [tabValue, setTabValue] = useState(0);
  const [statsData, setStatsData] = useState([]);
  
  // Get years and date ranges from data or use defaults
  const availableYears = currentFinancialData?.data?.table1?.[0]?.financials_years || ['2025', '2024'];
  const availableDateRanges = currentFinancialData?.data?.dateRanges || [
    '1 | 12/30/2024 - 01/05/2025',
    '2 | 01/06/2025 - 01/12/2025'
  ];

  // Handle store/location change
  const handleStoreChange = (event: SelectChangeEvent) => {
    const newStore = event.target.value;
    dispatch(selectFinancialLocation(newStore));
    dispatch(updateFinancialFilters({ store: newStore }));
  };

  // Handle year change
  const handleYearChange = (event: SelectChangeEvent) => {
    const newYear = event.target.value;
    dispatch(updateFinancialFilters({ year: newYear }));
  };

  // Handle date range change
  const handleDateRangeChange = (event: SelectChangeEvent) => {
    const newDateRange = event.target.value;
    dispatch(updateFinancialFilters({ dateRange: newDateRange }));
  };

  // Update stats when data changes
  useEffect(() => {
    if (currentFinancialData?.data?.table5?.length > 0) {
      const weekStats = currentFinancialData.data.table5[0];
      
      const newStatsData = [
        { 
          label: 'Net Sales', 
          value: weekStats.netSales || '$0.00', 
          bottomChange: weekStats.netSalesChange || '+0%',
          bottomLabel: '% Change',
          changeColor: parseFloat(weekStats.netSalesChange) >= 0 ? '#2e7d32' : '#d32f2f',
          changeDirection: parseFloat(weekStats.netSalesChange) >= 0 ? 'up' : 'down'
        },
        { 
          label: 'Orders', 
          value: weekStats.orders || '0', 
          bottomChange: weekStats.ordersChange || '+0%',
          bottomLabel: '% Change',
          changeColor: parseFloat(weekStats.ordersChange) >= 0 ? '#2e7d32' : '#d32f2f',
          changeDirection: parseFloat(weekStats.ordersChange) >= 0 ? 'up' : 'down'
        },
        { 
          label: 'Avg Ticket', 
          value: weekStats.avgTicket || '$0.00', 
          bottomChange: weekStats.avgTicketChange || '0.00$',
          changeDirection: parseFloat(weekStats.avgTicketChange) >= 0 ? 'up' : 'down',
          changeColor: parseFloat(weekStats.avgTicketChange) >= 0 ? '#2e7d32' : '#d32f2f',
          bottomLabel: '$ Change'
        },
        { 
          label: 'Food Cost', 
          value: weekStats.foodCostPercent || '0.00%', 
          bottomChange: weekStats.foodCostChange || '0.00%',
          changeDirection: parseFloat(weekStats.foodCostChange) >= 0 ? 'up' : 'down',
          changeColor: parseFloat(weekStats.foodCostChange) >= 0 ? '#d32f2f' : '#2e7d32',
          bottomLabel: '% Change'
        },
        { 
          label: 'Labor Cost', 
          value: weekStats.laborCostPercent || '0.00%', 
          bottomChange: weekStats.laborCostChange || '0.00%',
          changeDirection: parseFloat(weekStats.laborCostChange) >= 0 ? 'up' : 'down',
          changeColor: parseFloat(weekStats.laborCostChange) >= 0 ? '#d32f2f' : '#2e7d32',
          bottomLabel: '% Change'
        },
        { 
          label: 'SPMH', 
          value: weekStats.spmh || '$0.00', 
          bottomChange: weekStats.spmhChange || '0.00$',
          changeDirection: parseFloat(weekStats.spmhChange) >= 0 ? 'up' : 'down',
          changeColor: parseFloat(weekStats.spmhChange) >= 0 ? '#2e7d32' : '#d32f2f',
          bottomLabel: '% Change'
        },
        { 
          label: 'LPMH', 
          value: weekStats.lpmh || '$0.00', 
          bottomChange: weekStats.lpmhChange || '0.00%',
          changeDirection: parseFloat(weekStats.lpmhChange) >= 0 ? 'up' : 'down',
          changeColor: parseFloat(weekStats.lpmhChange) >= 0 ? '#d32f2f' : '#2e7d32',
          bottomLabel: '% Change'
        },
      ];
      
      setStatsData(newStatsData);
    } else {
      // Use default data if no stats available
      setStatsData([
        { 
          label: 'Net Sales', 
          value: '$0.00', 
          bottomChange: '+0%',
          bottomLabel: '% Change',
          changeColor: '#1976d2'
        },
        { 
          label: 'Orders', 
          value: '0', 
          bottomChange: '+0%',
          bottomLabel: '% Change',
          changeColor: '#1976d2'
        },
        { 
          label: 'Avg Ticket', 
          value: '$0.00', 
          bottomChange: '0.00$',
          changeDirection: 'up',
          changeColor: '#2e7d32',
          bottomLabel: '$ Change'
        },
        { 
          label: 'Food Cost', 
          value: '0.00%', 
          bottomChange: '0.00%',
          changeDirection: 'up',
          changeColor: '#d32f2f',
          bottomLabel: '% Change'
        },
        { 
          label: 'Labor Cost', 
          value: '0.00%', 
          bottomChange: '0.00%',
          changeDirection: 'up',
          changeColor: '#d32f2f',
          bottomLabel: '% Change'
        },
        { 
          label: 'SPMH', 
          value: '$0.00', 
          bottomChange: '0.00$',
          changeDirection: 'up',
          changeColor: '#2e7d32',
          bottomLabel: '% Change'
        },
        { 
          label: 'LPMH', 
          value: '$0.00', 
          bottomChange: '0.00%',
          changeDirection: 'up',
          changeColor: '#d32f2f',
          bottomLabel: '% Change'
        },
      ]);
    }
  }, [currentFinancialData]);

  // Tab change handler
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
=======
// Multi-Select Filter Component
interface MultiSelectFilterProps {
  id: string;
  label: string;
  value: string[];
  options: Array<{ label: string; value: string }> | string[]; // Support both formats
  onChange: (value: string[]) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

const MultiSelectFilter: React.FC<MultiSelectFilterProps> = ({
  id,
  label,
  value,
  options,
  onChange,
  placeholder = "Select options",
  icon,
  disabled = false
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchText, setSearchText] = useState('');
  const open = Boolean(anchorEl);

  // Normalize options to always have label/value format
  const normalizedOptions = React.useMemo(() => {
    if (options.length === 0) return [];
    
    // Check if options are objects with label/value or just strings
    if (typeof options[0] === 'string') {
      return (options as string[]).map(option => ({
        label: String(option),
        value: String(option)
      }));
    } else {
      return (options as Array<{ label: string; value: string }>).map(option => ({
        label: String(option.label),
        value: String(option.value)
      }));
    }
  }, [options]);

  const filteredOptions = normalizedOptions.filter(option =>
    option.label.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!disabled) {
      setAnchorEl(event.currentTarget);
    }
>>>>>>> integrations_v41
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSearchText('');
  };

  const handleToggle = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter(item => item !== optionValue)
      : [...value, optionValue];
    onChange([...newValue]); // ✅ FIXED: Create copy when calling onChange
  };

  const handleSelectAll = () => {
    if (value.length === normalizedOptions.length) {
      onChange([]);
    } else {
      onChange([...normalizedOptions.map(option => option.value)]); // ✅ FIXED: Create copy
    }
  };

  const handleClear = (event: React.MouseEvent) => {
    event.stopPropagation();
    onChange([]);
  };

  // Get display text based on selected values
  const getDisplayText = () => {
    if (value.length === 0) {
      return placeholder;
    }
    
    if (value.length === 1) {
      const selectedOption = normalizedOptions.find(option => String(option.value) === String(value[0]));
      return selectedOption ? selectedOption.label : String(value[0]);
    }
    
    return `Multiple selected (${value.length})`;
  };

  const displayText = getDisplayText();

  return (
<<<<<<< HEAD
    <Box sx={{ p: 2, backgroundColor: '#ffffff', minHeight: '100vh' }}>
      {/* Dashboard Title */}
       <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            fontWeight: 600,
            color: '#1a237e',
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
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

      {/* Alert for implementation status */}
      {currentFinancialData?.data?.data === "Financial Dashboard is not yet implemented." && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Financial Dashboard is not yet fully implemented. Displaying available data.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left Side Filters */}
        <Grid item xs={12} md={4} lg={3}>
          <Card elevation={3} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 500, color: '#424242' }}>
                Filters
              </Typography>
              
              {/* Current file info */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Current file: {currentFinancialData?.fileName || 'No file selected'}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  {financialFiles.length} financial file(s) available
                </Typography>
              </Box>
              
              {/* Store selector */}
              <Box sx={{ mb: 3 }}>
                <Typography sx={{ mb: 1, fontSize: '0.875rem', color: '#616161' }}>
                  Store
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={financialFilters.store || currentFinancialLocation || ''}
                    onChange={handleStoreChange}
                    displayEmpty
                    sx={{ 
                      backgroundColor: 'white',
                      borderRadius: 1,
                    }}
                    disabled={financialLocations.length === 0}
                  >
                    {financialLocations.length > 0 ? (
                      financialLocations.map(loc => (
                        <MenuItem key={loc} value={loc}>{loc}</MenuItem>
                      ))
                    ) : (
                      [
                        <MenuItem key="default1" value="0001: Midtown East">0001: Midtown East</MenuItem>,
                        <MenuItem key="default2" value="0002: Downtown West">0002: Downtown West</MenuItem>
                      ]
                    )}
                  </Select>
                </FormControl>
              </Box>

              {/* Year selector */}
              <Box sx={{ mb: 3 }}>
                <Typography sx={{ mb: 1, fontSize: '0.875rem', color: '#616161' }}>
                  Year
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={financialFilters.year}
                    onChange={handleYearChange}
                    displayEmpty
                    sx={{ 
                      backgroundColor: 'white',
                      borderRadius: 1,
                    }}
                  >
                    {availableYears.map(year => (
                      <MenuItem key={year} value={year}>{year}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Date range selector */}
              <Box>
                <Typography sx={{ mb: 1, fontSize: '0.875rem', color: '#616161' }}>
                  Week / Date Range
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={financialFilters.dateRange}
                    onChange={handleDateRangeChange}
                    displayEmpty
                    sx={{ 
                      backgroundColor: 'white',
                      borderRadius: 1,
                    }}
                  >
                    {availableDateRanges.map(range => (
                      <MenuItem key={range} value={range}>{range}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Side - Week-Over-Week Analysis */}
        <Grid item xs={12} md={8} lg={9}>
          <Card 
            elevation={3} 
            sx={{ 
              borderRadius: 2,
              height: '100%'
=======
    <Box sx={{ position: 'relative', width: '100%' }}>
      <Typography 
        variant="body2" 
        sx={{ 
          mb: 1, 
          color: disabled ? '#999' : '#666',
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
          border: disabled ? '2px solid #e0e0e0' : '2px solid #e0e0e0',
          borderRadius: '8px',
          padding: '12px 16px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          backgroundColor: disabled ? '#f5f5f5' : '#fff',
          minHeight: '48px',
          position: 'relative',
          opacity: disabled ? 0.6 : 1,
          '&:hover': {
            borderColor: disabled ? '#e0e0e0' : '#1976d2',
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
        
        {value.length > 0 && !disabled && (
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
>>>>>>> integrations_v41
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
              checked={value.length === normalizedOptions.length}
              indeterminate={value.length > 0 && value.length < normalizedOptions.length}
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
                key={option.value} 
                onClick={() => handleToggle(option.value)}
                dense
                sx={{ py: 1 }}
              >
                <Checkbox 
                  checked={value.includes(option.value)} 
                  size="small" 
                  sx={{ p: 0, mr: 2 }}
                />
                <ListItemText primary={option.label} />
              </MenuItem>
            ))
          )}
        </MenuList>
      </Popover>
    </Box>
  );
};

// NEW: Enhanced Date Range Selector Component with Redux Integration
interface DateRangeSelectorComponentProps {
  label: string;
  onDateRangeSelect?: (dateRange: any) => void;
  onCancel?: () => void;
}

const DateRangeSelectorComponent: React.FC<DateRangeSelectorComponentProps> = ({
  label,
  onDateRangeSelect,
  onCancel
}) => {
  const dispatch = useAppDispatch();
  
  // NEW: Redux date range selectors
  const startDate = useAppSelector(selectFinancialsDashboardStartDate);
  const endDate = useAppSelector(selectFinancialsDashboardEndDate);
  const hasDateRange = useAppSelector(selectHasFinancialsDashboardDateRange);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tempRange, setTempRange] = useState<any>(null);

  // NEW: Get display text from Redux state
  const getDisplayText = () => {
    if (!hasDateRange || !startDate || !endDate) {
      return 'Select date range';
    }
    
    // Convert YYYY-MM-DD format to display format
    const startDisplayDate = new Date(startDate + 'T12:00:00').toLocaleDateString();
    const endDisplayDate = new Date(endDate + 'T12:00:00').toLocaleDateString();
    
    return `${startDisplayDate} - ${endDisplayDate}`;
  };

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
      // NEW: Dispatch Redux action to store date range
      dispatch(setFinancialsDashboardDateRange({
        startDate: tempRange.startDate,
        endDate: tempRange.endDate
      }));
      
      // Keep backward compatibility with existing callback
      if (onDateRangeSelect) {
        const rangeWithStrings = {
          ...tempRange,
          startDateStr: format(tempRange.startDate, 'yyyy-MM-dd'),
          endDateStr: format(tempRange.endDate, 'yyyy-MM-dd')
        };
        onDateRangeSelect(rangeWithStrings);
      }
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
    
    // NEW: Clear Redux state
    dispatch(clearFinancialsDashboardDateRange());
    
    // Keep backward compatibility
    if (onDateRangeSelect) {
      onDateRangeSelect(null);
    }
  };

  const displayText = getDisplayText();

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
              color: displayText === 'Select date range' ? '#999' : '#333',
              fontSize: '0.95rem'
            }}
          >
            {displayText}
          </Typography>
          
          {/* NEW: Show clear button based on Redux state */}
          {hasDateRange && (
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
  const formattedValue = isPositive ? `+${Math.abs(numValue)}%` : `${numValue}%`;
  
  return { value: formattedValue, isPositive };
};

const formatCurrency = (value: string | number): string => {
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(numValue);
};

// Main component
export function Financials() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Redux selectors - existing financial data
  const { 
    financialFiles, 
    currentFinancialLocation, 
    financialFilters,
    financialLocations,
    fileContent,
    loading,
    error
  } = useAppSelector((state) => state.excel);

  // NEW: Redux date range selectors
  const startDate = useAppSelector(selectFinancialsDashboardStartDate);
  const endDate = useAppSelector(selectFinancialsDashboardEndDate);
  const hasDateRange = useAppSelector(selectHasFinancialsDashboardDateRange);

  // NEW: Redux selectors from masterFileSlice
  const selectedCompanies = useAppSelector(selectSelectedCompanies);
  const selectedLocations = useAppSelector(selectSelectedLocations);
  const masterFileLoading = useAppSelector(selectMasterFileLoading);
  const masterFileError = useAppSelector(selectMasterFileError);

  // Find current financial data for selected location
  const currentFinancialData = financialFiles.find(f => f.location === currentFinancialLocation);

  // State variables
  const [tabValue, setTabValue] = useState(0);
  const [statsData, setStatsData] = useState([]);
  
  // NEW: Company-location API state
  const [companyLocations, setCompanyLocations] = useState<CompanyLocation[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [companiesError, setCompaniesError] = useState<string>("");

  // Date range state - KEEP for backward compatibility but use Redux as primary source
  const [selectedDateRange, setSelectedDateRange] = useState<any>(null);
  
  // Auto-filtering state
  const [isAutoFiltering, setIsAutoFiltering] = useState(false);
  const [filterError, setFilterError] = useState<string>('');
  const [autoFilterInitialized, setAutoFilterInitialized] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  
  // ✅ FIXED: Refs for tracking changes with proper array handling
  const prevCompaniesRef = useRef<string[]>([]);
  const prevLocationsRef = useRef<string[]>([]);
  const prevDateRangeRef = useRef<any>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();

  // Current table data from Redux or from current financial data
  const [currentTableData, setCurrentTableData] = useState<any>({
    table1: [],
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

  // Available locations based on selected companies
  const availableLocations = React.useMemo(() => {
    if (selectedCompanies.length === 0) return [];
    
    const locations: Array<{ id: string, name: string }> = [];
    
    companyLocations.forEach(company => {
      // Fix: Compare strings to strings
      if (selectedCompanies.includes(String(company.company_id))) {
        company.locations.forEach(location => {
          locations.push({
            id: String(location.location_id), // Ensure string
            name: location.location_name
          });
        });
      }
    });
    
    return locations;
  }, [companyLocations, selectedCompanies]);

  // Get company options for display (name as option, id as value)
  const companyOptions = React.useMemo(() => {
    return companyLocations.map(company => ({
      label: company.company_name,
      value: String(company.company_id) // Ensure string
    }));
  }, [companyLocations]);

  // Get location options for display (name as option, id as value)
  const locationOptions = React.useMemo(() => {
    return availableLocations.map(location => ({
      label: location.name,
      value: String(location.id) // Ensure string
    }));
  }, [availableLocations]);

  // Get location names for display
  const locationDisplayNames = React.useMemo(() => {
    return selectedLocations.map(locationId => {
      const location = availableLocations.find(loc => loc.id === String(locationId));
      return location ? location.name : String(locationId);
    });
  }, [selectedLocations, availableLocations]);

  // NEW: Convert Redux date range to the format expected by the API and change detection
  const getSelectedDateRangeForAPI = React.useMemo(() => {
    if (!hasDateRange || !startDate || !endDate) {
      return null;
    }

    try {
      // Convert YYYY-MM-DD strings to Date objects
      const startDateObj = new Date(startDate + 'T12:00:00'); // Add time to avoid timezone issues
      const endDateObj = new Date(endDate + 'T12:00:00');
      
      return {
        startDate: startDateObj,
        endDate: endDateObj,
        startDateStr: startDate, // Already in YYYY-MM-DD format
        endDateStr: endDate     // Already in YYYY-MM-DD format
      };
    } catch (error) {
      console.error('Error converting Redux date range:', error);
      return null;
    }
  }, [hasDateRange, startDate, endDate]);

  // NEW: Fetch company-locations on component mount
  useEffect(() => {
    const fetchCompanyLocations = async () => {
      setCompaniesLoading(true);
      setCompaniesError("");
      
      try {
        console.log('🏢 Financials: Fetching company-locations from:', COMPANY_LOCATIONS_API_URL);
        const response = await axios.get(COMPANY_LOCATIONS_API_URL);
        
        console.log('📥 Financials: Company-locations response:', response.data);
        setCompanyLocations(response.data || []);
        
        // Auto-select single company/location when only one available
        if (response.data && response.data.length === 1) {
          const singleCompany = response.data[0];
          console.log('🎯 Auto-selecting company:', singleCompany.company_name, 'ID:', singleCompany.company_id);
          dispatch(setSelectedCompanies([String(singleCompany.company_id)]));
          
          if (singleCompany.locations.length === 1) {
            console.log('🎯 Auto-selecting location:', singleCompany.locations[0].location_name, 'ID:', singleCompany.locations[0].location_id);
            dispatch(setSelectedLocations([String(singleCompany.locations[0].location_id)]));
          }
          
          console.log('🎯 Financials: Auto-selected single company and location');
        }
        
      } catch (error) {
        console.error('❌ Financials: Error fetching company-locations:', error);
        
        let errorMessage = "Error loading company-location data";
        if (axios.isAxiosError(error)) {
          if (error.response) {
            errorMessage = `Server error: ${error.response.status}`;
          } else if (error.request) {
            errorMessage = 'Cannot connect to company-locations API. Please check server status.';
          }
        }
        
        setCompaniesError(errorMessage);
      } finally {
        setCompaniesLoading(false);
      }
    };

    fetchCompanyLocations();
  }, [dispatch]);

  // ✅ FIXED: Proper change detection with array copies - NOW INCLUDES REDUX DATE RANGE
  const checkForChanges = React.useCallback(() => {
    const prev = {
      companies: prevCompaniesRef.current,
      locations: prevLocationsRef.current,
      dateRange: prevDateRangeRef.current
    };
    
    // ✅ Create copies before sorting to avoid mutation
    const currentCompaniesCopy = [...selectedCompanies].sort();
    const prevCompaniesCopy = [...prev.companies].sort();
    const currentLocationsCopy = [...selectedLocations].sort();
    const prevLocationsCopy = [...prev.locations].sort();
    
    const companiesChanged = JSON.stringify(currentCompaniesCopy) !== JSON.stringify(prevCompaniesCopy);
    const locationsChanged = JSON.stringify(currentLocationsCopy) !== JSON.stringify(prevLocationsCopy);
    
    // NEW: Use Redux date range instead of local state for change detection
    const currentDateRangeForComparison = getSelectedDateRangeForAPI;
    const dateRangeChanged = JSON.stringify(currentDateRangeForComparison) !== JSON.stringify(prev.dateRange);
    
    return companiesChanged || locationsChanged || dateRangeChanged;
  }, [selectedCompanies, selectedLocations, getSelectedDateRangeForAPI]);

  const hasMinimumRequirements = React.useCallback(() => {
    return selectedCompanies.length > 0 && selectedLocations.length > 0;
  }, [selectedCompanies, selectedLocations]);

  // ✅ FIXED: Apply filters with proper array handling - NOW USES REDUX DATE RANGE WITH ENHANCED DEBUGGING
  const applyFiltersAutomatically = React.useCallback(async () => {
    console.log('🚀 AUTO-FILTER: Starting applyFiltersAutomatically');
    console.log('📋 AUTO-FILTER: Current state check:', {
      hasMinimumRequirements: hasMinimumRequirements(),
      selectedCompanies,
      selectedLocations,
      availableLocations: availableLocations.length,
      getSelectedDateRangeForAPI
    });

    if (!hasMinimumRequirements()) {
      console.log('⏸️ AUTO-FILTER: Minimum requirements not met - aborting');
      return;
    }

    console.log('✅ AUTO-FILTER: Minimum requirements met - proceeding');
    setIsAutoFiltering(true);
    setFilterError('');
    
    try {
      // Find the current financial file data
      const currentFile = financialFiles.find(f => f.location === currentFinancialLocation);
      console.log('📁 AUTO-FILTER: Current file found:', !!currentFile, currentFile?.fileName);
      
      if (!currentFile) {
        console.log('⚠️ AUTO-FILTER: No current financial file found, proceeding with API call');
      }

      // ✅ FIXED: Convert location IDs to names for API compatibility (like your other file)
      let locationNamesForApi = [];
      
      console.log('🔄 AUTO-FILTER: Converting location IDs to names');
      console.log('📍 AUTO-FILTER: Available locations:', availableLocations);
      console.log('📍 AUTO-FILTER: Selected location IDs:', selectedLocations);
      
      if (availableLocations.length > 0) {
        // Convert location IDs to names for API
        locationNamesForApi = selectedLocations.map(locationId => {
          const location = availableLocations.find(loc => String(loc.id) === String(locationId));
          console.log(`📍 AUTO-FILTER: Converting ID ${locationId} to name: ${location?.name || 'NOT_FOUND'}`);
          return location ? location.name : String(locationId);
        });
      } else {
        console.log('⚠️ AUTO-FILTER: No available locations, using raw selected locations');
        locationNamesForApi = [...selectedLocations]; // Create copy
      }

      console.log('📍 AUTO-FILTER: Final location names for API:', locationNamesForApi);

      // NEW: Use Redux date range instead of local state
      const selectedDateRangeForAPI = getSelectedDateRangeForAPI;
      console.log('📅 AUTO-FILTER: Date range for API:', selectedDateRangeForAPI);

      // ✅ FIXED: Send ALL locations as array to backend with Redux date range
      const payload = {
        fileName: currentFile?.fileName || 'financial_data',
        locations: locationNamesForApi, // Send full array of location names
        startDate: selectedDateRangeForAPI?.startDateStr || null,
        endDate: selectedDateRangeForAPI?.endDateStr || null,
        dashboard: 'Financials',
        company_id: String(selectedCompanies[0])
      };

      console.log('🚀 AUTO-FILTER: Sending API request to:', FINANCIAL_FILTER_API_URL);
      console.log('📦 AUTO-FILTER: Request payload:', JSON.stringify(payload, null, 2));
      console.log(`📍 AUTO-FILTER: Selected ${locationNamesForApi.length} locations:`, locationNamesForApi);
      console.log('📅 AUTO-FILTER: Redux Date Range state:', { startDate, endDate, hasDateRange });

      // Make API call to financial filter endpoint
      const response = await axios.post(FINANCIAL_FILTER_API_URL, payload);
      
      console.log('📥 AUTO-FILTER: API Response received');
      console.log('📊 AUTO-FILTER: Response status:', response.status);
      console.log('📊 AUTO-FILTER: Response data keys:', Object.keys(response.data || {}));
      console.log('📊 AUTO-FILTER: Full response data:', response.data);

      if (response.data) {
        // Create new table data object
        const newTableData = {
          table1: response.data.table1 || [],
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
        };

        console.log('📊 AUTO-FILTER: Processing response data');
        console.log('📊 AUTO-FILTER: Table data lengths:', {
          table1: newTableData.table1.length,
          table2: newTableData.table2.length,
          table3: newTableData.table3.length,
          table4: newTableData.table4.length,
          table5: newTableData.table5.length
        });

        setCurrentTableData(newTableData);
        console.log('✅ AUTO-FILTER: Table data updated in state');

        // ✅ FIXED: Update Redux filters with proper array copies
        const storeValue = locationNamesForApi.length === 1 
          ? locationNamesForApi[0] 
          : `${locationNamesForApi.length} locations`;

        const dateRangeString = selectedDateRangeForAPI 
          ? `${selectedDateRangeForAPI.startDateStr} - ${selectedDateRangeForAPI.endDateStr}` 
          : '';

        console.log('🔄 AUTO-FILTER: Updating Redux filters');
        console.log('🔄 AUTO-FILTER: Store value:', storeValue);
        console.log('🔄 AUTO-FILTER: Date range string:', dateRangeString);

        dispatch(updateFinancialFilters({ 
          store: storeValue,
          dateRange: dateRangeString,
          company_id: String(selectedCompanies[0]),
          selectedLocations: [...selectedLocations], // Create copy
          allLocationNames: [...locationNamesForApi] // Create copy
        }));

        // ✅ FIXED: Update refs with copies to avoid mutation - NOW INCLUDES REDUX DATE RANGE
        prevCompaniesRef.current = [...selectedCompanies];
        prevLocationsRef.current = [...selectedLocations];
        prevDateRangeRef.current = selectedDateRangeForAPI ? { ...selectedDateRangeForAPI } : null;

        setLastUpdated(Date.now());
        console.log('✅ AUTO-FILTER: Process completed successfully');
        console.log('✅ AUTO-FILTER: Applied to locations:', locationNamesForApi);
        console.log('✅ AUTO-FILTER: Applied date range:', dateRangeString);
      } else {
        console.log('❌ AUTO-FILTER: No data received in response');
      }
    } catch (err: any) {
      console.error('❌ AUTO-FILTER: Error occurred:', err);
      console.error('❌ AUTO-FILTER: Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        config: err.config
      });
      
      let errorMessage = 'Auto-filtering failed';
      if (axios.isAxiosError(err)) {
        if (err.response) {
          const detail = err.response.data?.detail;
          errorMessage = detail || `Server error: ${err.response.status}`;
          console.error('❌ AUTO-FILTER: Server error details:', err.response.data);
        } else if (err.request) {
          errorMessage = 'No response from server. Please check if the backend is running.';
          console.error('❌ AUTO-FILTER: No response received');
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      console.error('❌ AUTO-FILTER: Final error message:', errorMessage);
      setFilterError(errorMessage);
    } finally {
      setIsAutoFiltering(false);
      console.log('🏁 AUTO-FILTER: Process finished (success or error)');
    }
  }, [selectedCompanies, selectedLocations, getSelectedDateRangeForAPI, availableLocations, financialFiles, currentFinancialLocation, hasMinimumRequirements, dispatch, startDate, endDate, hasDateRange]);

  // NEW: Debug effect to track all state changes
  useEffect(() => {
    console.log('🐛 DEBUG: State updated:', {
      companiesLoading,
      companyLocations: companyLocations.length,
      selectedCompanies,
      selectedLocations,
      hasDateRange,
      startDate,
      endDate,
      autoFilterInitialized,
      hasMinimumRequirements: hasMinimumRequirements(),
      getSelectedDateRangeForAPI: getSelectedDateRangeForAPI
    });
  }, [companiesLoading, companyLocations.length, selectedCompanies, selectedLocations, hasDateRange, startDate, endDate, autoFilterInitialized]);

  // NEW: Effect to run auto-filter immediately when persisted state is detected on page load
  useEffect(() => {
    console.log('🔍 INITIAL LOAD CHECK: Evaluating conditions:', {
      companiesLoading,
      companyLocationsLength: companyLocations.length,
      autoFilterInitialized,
      selectedCompaniesCount: selectedCompanies.length,
      selectedLocationsCount: selectedLocations.length,
      hasDateRange,
      startDate,
      endDate,
      hasMinimumReqs: hasMinimumRequirements()
    });

    // FIXED: Only run when companies are loaded AND we're not already initialized
    if (!companiesLoading && companyLocations.length > 0 && !autoFilterInitialized) {
      console.log('✅ INITIAL LOAD: Companies loaded, checking for persisted Redux state');

      // If we have persisted companies and locations, immediately run auto-filter
      if (hasMinimumRequirements()) {
        console.log('🚀 INITIAL LOAD: Found persisted state - running immediate auto-filter');
        console.log('📋 INITIAL LOAD: Persisted state details:', {
          companies: selectedCompanies,
          locations: selectedLocations,
          dateRange: getSelectedDateRangeForAPI,
          availableLocations: availableLocations.length
        });
        
        // Mark as initialized to prevent duplicate runs
        setAutoFilterInitialized(true);
        
        // Set refs to current state
        prevCompaniesRef.current = [...selectedCompanies];
        prevLocationsRef.current = [...selectedLocations];
        prevDateRangeRef.current = getSelectedDateRangeForAPI ? { ...getSelectedDateRangeForAPI } : null;
        
        console.log('⚡ INITIAL LOAD: Calling applyFiltersAutomatically NOW');
        // Run auto-filter immediately - no timeout needed for initial load
        applyFiltersAutomatically();
      } else {
        console.log('❌ INITIAL LOAD: Minimum requirements not met');
        console.log('📋 INITIAL LOAD: Missing requirements:', {
          hasCompanies: selectedCompanies.length > 0,
          hasLocations: selectedLocations.length > 0,
          minReqsMet: hasMinimumRequirements()
        });
      }
    } else {
      console.log('⏸️ INITIAL LOAD: Conditions not met for auto-filter:', {
        companiesStillLoading: companiesLoading,
        noCompanyLocations: companyLocations.length === 0,
        alreadyInitialized: autoFilterInitialized
      });
    }
  }, [
    companiesLoading,
    companyLocations.length,
    selectedCompanies,
    selectedLocations,
    hasDateRange,
    getSelectedDateRangeForAPI,
    availableLocations.length,
    hasMinimumRequirements,
    applyFiltersAutomatically
    // REMOVED: autoFilterInitialized from dependencies to prevent blocking when it becomes true
  ]);

  // ✅ FIXED: Auto-filtering effect for user interactions and changes after initialization
  useEffect(() => {
    // Skip if not initialized yet (initial load is handled above)
    if (!autoFilterInitialized) {
      return;
    }

    // Check if there are actual changes using proper array comparison
    if (!checkForChanges()) {
      return;
    }

    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout for debounced auto-filtering (for user interactions)
    debounceTimeoutRef.current = setTimeout(() => {
      console.log('🔄 Auto-filter triggered by user changes');
      applyFiltersAutomatically();
    }, 500); // 500ms debounce

    // Cleanup timeout on unmount
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [selectedCompanies, selectedLocations, getSelectedDateRangeForAPI, autoFilterInitialized, checkForChanges, applyFiltersAutomatically]);

  // NEW: Effect to handle manual user interactions when autoFilterInitialized is false
  useEffect(() => {
    // FIXED: This should only handle manual user interactions, NOT persisted state
    // Only trigger when user manually selects companies/locations and companies are loaded
    if (!autoFilterInitialized && companyLocations.length > 0 && (selectedCompanies.length > 0 || selectedLocations.length > 0)) {
      // Check if this looks like a user interaction vs persisted state
      // If we have both companies and locations already, it's likely persisted state - let the initial load effect handle it
      if (selectedCompanies.length > 0 && selectedLocations.length > 0) {
        console.log('🔄 Detected likely persisted state - letting initial load effect handle it');
        return;
      }
      
      console.log('🔄 User interaction detected - initializing auto-filter');
      setAutoFilterInitialized(true);
      prevCompaniesRef.current = [...selectedCompanies];
      prevLocationsRef.current = [...selectedLocations];
      prevDateRangeRef.current = getSelectedDateRangeForAPI ? { ...getSelectedDateRangeForAPI } : null;
    }
  }, [selectedCompanies.length, selectedLocations.length, autoFilterInitialized, getSelectedDateRangeForAPI, companyLocations.length]);

  // ✅ FIXED: Handle company/location changes with proper array copies
  const handleCompanyChange = (newCompanies: string[]) => {
    dispatch(setSelectedCompanies([...newCompanies])); // Create copy
    
    // Clear locations when company changes to maintain data consistency
    if (JSON.stringify([...newCompanies].sort()) !== JSON.stringify([...selectedCompanies].sort())) {
      dispatch(setSelectedLocations([]));
    }
  };

  const handleLocationChange = (newLocationIds: string[]) => {
    dispatch(setSelectedLocations([...newLocationIds])); // Create copy
  };

  // Handle date range changes - KEEP for backward compatibility, but Redux is primary
  const handleDateRangeSelect = (dateRange: any) => {
    setSelectedDateRange(dateRange);
    // Redux date range is handled by the DateRangeSelectorComponent directly
  };

  // Initialize table data from current financial data
  useEffect(() => {
    if (currentFinancialData?.data) {
      setCurrentTableData({
        table1: currentFinancialData.data.table1 || [],
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
  }, [currentFinancialData]);

  // Update stats when data changes
  useEffect(() => {
    console.log('📊 Updating stats data from table5Data:', currentTableData.table5.length);
    
    if (currentTableData.table5.length > 0) {
      const metricsMap = extractFinancialMetrics(currentTableData.table5);
      
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
            label: metricName.toUpperCase(),
            value: '0',
            bottomChange: '0%',
            bottomLabel: 'VS. PREVIOUS',
            changeColor: '#666',
            changeDirection: 'up'
          };
        }

        const twLwChange = formatPercentageChange(metricData.twLwChange);
        
        let formattedValue = metricData.thisWeek;
        let displayLabel = metricName.toUpperCase();
        
        if (metricName === 'Net Sales') {
          formattedValue = formatCurrency(metricData.thisWeek);
        } else if (metricName === 'Avg Ticket' || metricName === 'SPMH' || metricName === 'LPMH') {
          formattedValue = formatCurrency(metricData.thisWeek);
        } else if (metricName.includes('%')) {
          formattedValue = `${parseFloat(metricData.thisWeek)}%`;
        } else if (metricName === 'Orders') {
          formattedValue = parseInt(metricData.thisWeek).toLocaleString();
        }

        return {
          label: displayLabel,
          value: formattedValue,
          bottomChange: twLwChange.value,
          bottomLabel: 'VS. PREVIOUS',
          changeColor: twLwChange.isPositive ? '#10B981' : '#EF4444',
          changeDirection: twLwChange.isPositive ? 'up' : 'down'
        };
      });
      
      setStatsData([...newStatsData]);
      console.log('📊 Stats data updated:', newStatsData.length, 'metrics');
    } else {
      setStatsData([]);
      console.log('📊 No table5Data, clearing stats');
    }
  }, [currentTableData.table5, lastUpdated]);

  // Tab change handler
  const handleTabChange = (event: any, newValue: number) => setTabValue(newValue);

  // Get company names for display
  const getCompanyNames = () => {
    return selectedCompanies.map(companyId => {
      const company = companyLocations.find(c => String(c.company_id) === String(companyId));
      return company ? company.company_name : String(companyId);
    });
  };

  // Get selected company names for display in chips
  const selectedCompanyNames = React.useMemo(() => {
    return getCompanyNames();
  }, [selectedCompanies, companyLocations]);

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
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
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
                <rect x="10" y="10" width="35" height="35" rx="4" fill="#5A8DEE"/>
                <rect x="55" y="10" width="35" height="35" rx="4" fill="#4285F4"/>
                <rect x="10" y="55" width="35" height="35" rx="4" fill="#1976D2"/>
                <rect x="55" y="55" width="35" height="34" rx="4" fill="#3F51B5"/>
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
          {/* Auto-filtering status */}
          {isAutoFiltering && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              mt: 2,
              mb: 1 
            }}>
              <AutoFilterChip
                icon={<AutorenewIcon className="rotating" />}
                label="Auto-updating filters..."
                size="small"
              />
            </Box>
          )}

          {/* Company/Location context display */}
          {selectedCompanies.length > 0 && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: 1,
              mt: 2,
              mb: 1,
              flexWrap: 'wrap'
            }}>
              <CompanyInfoChip
                icon={<BusinessIcon />}
                label={`${selectedCompanyNames.join(', ')}`}
                variant="outlined"
                size="small"
              />
              {selectedLocations.length > 0 && (
                <CompanyInfoChip
                  icon={<PlaceIcon />}
                  label={`${locationDisplayNames.length === 1 ? locationDisplayNames[0] : `${locationDisplayNames.length} locations`}`}
                  variant="outlined"
                  size="small"
                />
              )}
            </Box>
          )}
        </Typography>
      </Box>

      {/* Error Alert */}
      {(filterError || error || masterFileError || companiesError) && (
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
            setCompaniesError('');
            dispatch(setError(null));
          }}
        >
          {filterError || error || masterFileError || companiesError}
        </Alert>
      )}

      {/* Auto-filtering progress indicator */}
      {isAutoFiltering && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress 
            sx={{
              borderRadius: 1,
              height: 4,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              '& .MuiLinearProgress-bar': {
                backgroundColor: theme.palette.primary.main,
              }
            }}
          />
        </Box>
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
            mb: 3,
            justifyContent: 'space-between'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
<<<<<<< HEAD
                  fontWeight: 500,
                  mb: 2,
                  color: '#1565c0'
=======
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                  fontSize: '1.25rem',
                  ml: 1.5,
                  letterSpacing: '-0.01em'
>>>>>>> integrations_v41
                }}
              >
                Auto-Filtering Controls
              </Typography>
            </Box>

            {/* Auto-filtering indicator */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                icon={<CheckCircleIcon />}
                label="Auto-Update Active"
                color="success"
                size="small"
                variant="outlined"
                sx={{ fontWeight: 500 }}
              />
            </Box>
          </Box>

          {/* Filter Inputs Row */}
          <Grid container spacing={4} sx={{ mb: 3 }} justifyContent="center">
            {/* Company Filter */}
            <Grid item xs={12} md={4}>
              <MultiSelectFilter
                id="company-filter"
                label="Company"
                value={selectedCompanies}
                options={companyOptions} // Use the new format with label/value
                onChange={handleCompanyChange}
                placeholder="Select companies"
                icon={<BusinessIcon />}
                disabled={companiesLoading}
              />
            </Grid>

            {/* Location Filter */}
            <Grid item xs={12} md={4}>
              <MultiSelectFilter
                id="location-filter"
                label="Location"
                value={selectedLocations}
                options={locationOptions} // Use the new format with label/value
                onChange={handleLocationChange}
                placeholder={selectedCompanies.length === 0 ? "Select company first" : "Select locations"}
                icon={<PlaceIcon />}
                disabled={selectedCompanies.length === 0}
              />
            </Grid>

            {/* Date Range Filter - NOW USING REDUX */}
            <Grid item xs={12} md={4}>
              <DateRangeSelectorComponent
                label="Date Range (Optional)"
                onDateRangeSelect={handleDateRangeSelect}
                onCancel={() => setSelectedDateRange(null)}
              />
            </Grid>
          </Grid>

          {/* Enhanced Active Filters Pills */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
            {/* Company filter chips */}
            {selectedCompanies.length > 0 && (
              <Chip
                icon={<BusinessIcon sx={{ fontSize: '1rem' }} />}
                label={`Companies: ${selectedCompanyNames.join(', ')}`}
                color="primary"
                variant="outlined"
                onDelete={() => dispatch(setSelectedCompanies([]))}
                sx={{
                  borderRadius: '24px',
                  height: '36px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: theme.palette.primary.main,
                  border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    background: alpha(theme.palette.primary.main, 0.15),
                    transform: 'translateY(-1px)',
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
                  },
                  '& .MuiChip-icon': {
                    fontSize: '1rem',
                    color: theme.palette.primary.main
                  }
                }}
                deleteIcon={<CloseIcon sx={{ fontSize: '1rem' }} />}
              />
            )}

            {selectedLocations.length > 0 && (
              <Chip
                icon={<PlaceIcon sx={{ fontSize: '1rem' }} />}
                label={`Locations: ${locationDisplayNames.join(', ')}`}
                onDelete={() => dispatch(setSelectedLocations([]))}
                color="secondary"
                variant="outlined"
                deleteIcon={<CloseIcon sx={{ fontSize: '1rem' }} />}
                sx={{
                  borderRadius: '24px',
                  height: '36px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  border: `2px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: `0 4px 12px ${alpha(theme.palette.secondary.main, 0.2)}`
                  },
                  '& .MuiChip-icon': {
                    fontSize: '1rem'
                  }
                }}
              />
            )}
            
            {/* NEW: Redux Date Range Chip */}
            {hasDateRange && (
              <Chip
                icon={<CalendarTodayIcon sx={{ fontSize: '1rem' }} />}
                label={`Date Range: ${new Date(startDate + 'T12:00:00').toLocaleDateString()} - ${new Date(endDate + 'T12:00:00').toLocaleDateString()}`}
                onDelete={() => dispatch(clearFinancialsDashboardDateRange())}
                sx={{
                  borderRadius: '24px',
                  height: '36px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  backgroundColor: alpha(theme.palette.info.main, 0.1),
                  color: theme.palette.info.main,
                  border: `2px solid ${alpha(theme.palette.info.main, 0.3)}`,
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    background: alpha(theme.palette.info.main, 0.15),
                    transform: 'translateY(-1px)',
                    boxShadow: `0 4px 12px ${alpha(theme.palette.info.main, 0.2)}`
                  },
                  '& .MuiChip-icon': {
                    color: theme.palette.info.main,
                    fontSize: '1rem'
                  },
                  '& .MuiChip-deleteIcon': {
                    color: theme.palette.info.main,
                    fontSize: '1rem'
                  }
                }}
                deleteIcon={<CloseIcon sx={{ fontSize: '1rem' }} />}
              />
            )}

            {/* Auto-filtering status indicator */}
            {hasMinimumRequirements() && (
              <Chip
                icon={<CheckCircleIcon />}
                label={`Last Updated: ${format(lastUpdated, 'HH:mm:ss')}`}
                size="small"
                sx={{
                  backgroundColor: alpha(theme.palette.success.main, 0.1),
                  color: theme.palette.success.main,
                  fontWeight: 500,
                }}
              />
            )}
          </Box>

          {/* Requirements notice */}
          {!hasMinimumRequirements() && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Auto-filtering requires:</strong> At least one company and one location selected.
              </Typography>
            </Alert>
          )}
        </CardContent>
      </GradientCard>

      {/* Week-Over-Week Analysis Card */}
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
          
          {/* NEW: Redux Date Range Display */}
          {hasDateRange && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              mb: 2 
            }}>
              <Typography 
                variant="body1"
                sx={{ 
                  color: theme.palette.text.secondary,
                  fontWeight: 500,
                  backgroundColor: alpha(theme.palette.info.main, 0.1),
                  padding: '4px 12px',
                  borderRadius: '16px',
                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
                }}
              >
                📅 Filtered by: {new Date(startDate + 'T12:00:00').toLocaleDateString()} - {new Date(endDate + 'T12:00:00').toLocaleDateString()}
              </Typography>
            </Box>
          )}
          
          {/* Loading State */}
          {(isAutoFiltering || loading || masterFileLoading) && (
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
                {isAutoFiltering ? 'Auto-updating financial data...' : 'Loading financial data...'}
              </Typography>
            </Box>
          )}
          
          {/* Enhanced Stats Grid - KEEP EXISTING IMPLEMENTATION */}
          {!isAutoFiltering && !loading && !masterFileLoading && (
            <>
              {statsData.length > 0 ? (
                <Box>
                  {/* First Row - 4 items */}
                  <Grid container spacing={2} justifyContent="center" sx={{ mb: 2 }}>
                    {statsData.slice(0, 4).map((stat, index) => (
                      <Grid item xs={12} sm={6} md={3} key={index}>
                        <Card
                          elevation={0}
                          sx={{
                            padding: theme.spacing(2.5, 2),
                            textAlign: 'center',
                            height: '140px',
                            borderRadius: '12px',
                            background: '#FFFFFF',
                            border: '1px solid #E5E7EB',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              height: 4,
                              background: 'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%)',
                            },
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                            }
                          }}
                        >
                          {/* Label */}
                          <Typography 
                            sx={{ 
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              color: '#3B82F6',
                              mb: 1,
                              letterSpacing: '0.5px',
                              textTransform: 'uppercase'
                            }}
                          >
                            {stat.label}
                          </Typography>
                          {/* Large Number */}
                          <Typography 
                            sx={{ 
                              fontSize: '1.5rem',
                              fontWeight: 700,
                              color: '#1F2937',
                              mb: 1,
                              lineHeight: 1.2
                            }}
                          >
                            {stat.value}
                          </Typography>
                          
                          {/* Change Indicator */}
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            gap: 0.5,
                            mb: 0.5
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
                                color: stat.changeColor,
                                fontSize: '0.875rem',
                                fontWeight: 600
                              }}
                            >
                              {stat.bottomChange}
                            </Typography>
                          </Box>
                          <Typography 
                            sx={{ 
                              fontSize: '0.75rem',
                              color: '#6B7280',
                              fontWeight: 400,
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}
                          >
                            {stat.bottomLabel}
                          </Typography>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                  
                  {/* Second Row - 3 items centered */}
                  <Grid container spacing={2} justifyContent="center">
                    {statsData.slice(4, 7).map((stat, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index + 4}>
                        <Card
                          elevation={0}
                          sx={{
                            padding: theme.spacing(2.5, 2),
                            textAlign: 'center',
                            height: '140px',
                            borderRadius: '12px',
                            background: '#FFFFFF',
                            border: '1px solid #E5E7EB',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              height: 4,
                              background: 'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%)',
                            },
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                            }
                          }}
                        >
                          <Typography 
                            sx={{ 
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              color: '#3B82F6',
                              mb: 1,
                              letterSpacing: '0.5px',
                              textTransform: 'uppercase'
                            }}
                          >
                            {stat.label}
                          </Typography>
                          <Typography 
                            sx={{ 
                              fontSize: '1.5rem',
                              fontWeight: 700,
                              color: '#1F2937',
                              mb: 1,
                              lineHeight: 1.2
                            }}
                          >
                            {stat.value}
                          </Typography>
                          
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            gap: 0.5,
                            mb: 0.5
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
                                color: stat.changeColor,
                                fontSize: '0.875rem',
                                fontWeight: 600
                              }}
                            >
                              {stat.bottomChange}
                            </Typography>
                          </Box>
                          <Typography 
                            sx={{ 
                              fontSize: '0.75rem',
                              color: '#6B7280',
                              fontWeight: 400,
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}
                          >
                            {stat.bottomLabel}
                          </Typography>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
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
                    Please select company and location to view analytics with auto-filtering
                  </Typography>
                </Box>
              )}
            </>
          )}
        </CardContent>
      </StyledCard>

      {/* Enhanced Tabs - KEEP EXISTING IMPLEMENTATION */}
      <StyledCard elevation={0} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <AnimatedTabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="fullWidth"
        >
<<<<<<< HEAD
          <Tab label="Dashboard" />
          <Tab label="Detailed Analysis" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 3 }}>
            {/* Financial Table */}
            <FinancialTable data={currentFinancialData?.data} />
            
            {/* Only show charts if we have data */}
            {currentFinancialData && (
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
                  Comparison Charts
                </Typography>
                
                {/* First Chart - Full width row */}
                <Box sx={{ mb: 4 }}>
                  <WeekOverWeekChart data={currentFinancialData?.data} />
                </Box>
                
                {/* Second Chart - Full width row */}
                <Box>
                  <BudgetChart data={currentFinancialData?.data} />
                </Box>
              </Box>
            )}
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3 }}>
            {/* Day of Week Analysis Tables */}
            <DayOfWeekAnalysis data={currentFinancialData?.data} />
            
            {/* Only show charts if we have data */}
            {currentFinancialData && (
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
                
                {/* Sales Chart - Full width row */}
                <Box sx={{ mb: 4 }}>
                  <SalesChart data={currentFinancialData?.data} />
                </Box>
                
                {/* Orders Chart - Full width row */}
                <Box sx={{ mb: 4 }}>
                  <OrdersChart data={currentFinancialData?.data} />
                </Box>
                
                {/* Average Ticket Chart - Full width row */}
                <Box>
                  <AvgTicketChart data={currentFinancialData?.data} />
                </Box>
              </Box>
            )}
=======
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
            <ComprehensiveFinancialDashboard 
              financialData={currentTableData} 
              key={lastUpdated} 
            />
          </Box>
        </TabPanel>

        {/* Tab 2 - Dashboard */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 4 }}>
            <FinancialTable 
              data={currentTableData.table5} 
              key={`financial-table-${lastUpdated}`} 
            />
>>>>>>> integrations_v41
          </Box>
        </TabPanel>
        
        {/* Tab 3 - Detailed Analysis */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 4 }}>
            <DayOfWeekAnalysis 
              salesData={currentTableData.table2}
              ordersData={currentTableData.table3} 
              avgTicketData={currentTableData.table4}
              key={`dow-analysis-${lastUpdated}`} 
            />
            
            {(currentTableData.table2.length > 0 || currentTableData.table3.length > 0 || currentTableData.table4.length > 0) && (
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
                
                {currentTableData.table2.length > 0 && (
                  <Box sx={{ mb: 4 }}>
                    <SalesChart 
                      data={currentTableData.table2} 
                      key={`sales-chart-${lastUpdated}`} 
                    />
                  </Box>
                )}
                
                {currentTableData.table3.length > 0 && (
                  <Box sx={{ mb: 4 }}>
                    <OrdersChart 
                      data={currentTableData.table3} 
                      key={`orders-chart-${lastUpdated}`} 
                    />
                  </Box>
                )}
                
                {currentTableData.table4.length > 0 && (
                  <Box>
                    <AvgTicketChart 
                      data={currentTableData.table4} 
                      key={`avg-ticket-chart-${lastUpdated}`} 
                    />
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
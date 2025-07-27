// ExcelImport.tsx - OPTIMIZED Version with Single API Call Logic

import * as React from 'react';
import axios from 'axios';
import apiClient from '../api/axiosConfig';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import Snackbar from '@mui/material/Snackbar';
import { SelectChangeEvent } from '@mui/material/Select';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Fade from '@mui/material/Fade';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CardContent from '@mui/material/CardContent';
import { styled, alpha, keyframes } from '@mui/material/styles';

// Icons
import AnalyticsIcon from '@mui/icons-material/Analytics';
import TableChartIcon from '@mui/icons-material/TableChart';
import InsightsIcon from '@mui/icons-material/Insights';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import RefreshIcon from '@mui/icons-material/Refresh';
import BusinessIcon from '@mui/icons-material/Business';

// Import components
import FilterSection from './FilterSection';
import TableDisplay from './TableDisplay';
import SalesCharts from './graphs/SalesCharts';
import DeliveryPercentageChart from './graphs/DeliveryPercentageChart';
import InHousePercentageChart from './graphs/InHousePercentageChart';
import CateringPercentageChart from './graphs/CateringPercentageChart';
import TotalSalesChart from './graphs/TotalSalesChart';
import WowTrendsChart from './graphs/WowTrendsChart';
import PercentageFirstThirdPartyChart from './graphs/PercentageFirstThirdPartyChart';
import SalesSplitDashboard from './SalesSplitDashboard';
import { API_URL_Local } from '../constants';

// Redux hooks and actions
import { useAppDispatch, useAppSelector } from '../typedHooks';
import { 
  excelSlice,
  setTableData,
  selectSalesFilters,
  updateSalesFilters,
  selectCompanyId,
} from '../store/excelSlice';

// Master file slice for company/location management
import { useSelector, useDispatch } from "react-redux";
import {
  setSelectedCompanies, 
  setSelectedLocations,
  selectSelectedCompanies,
  selectSelectedLocations 
} from "../store/slices/masterFileSlice";

// Date range Redux integration
import {
  setSalesSplitDashboardDateRange,
  setSalesSplitDashboardStartDate,
  setSalesSplitDashboardEndDate,
  clearSalesSplitDashboardDateRange,
  selectSalesSplitDashboardDateRange,
  selectSalesSplitDashboardStartDate,
  selectSalesSplitDashboardEndDate,
  selectHasSalesSplitDashboardDateRange
} from '../store/slices/dateRangeSlice';

// Extract actions from the slice
const { setLoading, setError } = excelSlice.actions;

// Interfaces
interface Company {
  company_id: number;
  company_name: string;
  locations: Location[];
}

interface Location {
  location_id: number;
  location_name: string;
}

// Styled components
const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const CleanCard = styled(Card)(({ theme }) => ({
  background: '#ffffff',
  borderRadius: 12,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  border: '1px solid #e0e0e0',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${slideIn} 0.6s ease-out`,
  '&:hover': {
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
  }
}));

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

// API endpoints
const COMPANY_LOCATIONS_API_URL = API_URL_Local + '/company-locations/all';

// Main Component
export function ExcelImport() {
  const dispatch = useAppDispatch();
  const reduxDispatch = useDispatch();
  
  // Get state from Redux
  const { 
    loading: reduxLoading, 
    error: reduxError, 
    tableData: reduxTableData,
  } = useAppSelector((state) => state.excel);
  
  const salesFilters = useAppSelector(selectSalesFilters);
  const currentCompanyId = useAppSelector(selectCompanyId);
  
  // Get current selections from Redux
  const selectedCompanies = useSelector(selectSelectedCompanies);
  const selectedLocations = useSelector(selectSelectedLocations);
  
  // Convert to single values for dropdowns
  const selectedCompany = selectedCompanies.length > 0 ? selectedCompanies[0] : '';
  const selectedLocation = selectedLocations.length > 0 ? selectedLocations[0] : '';
  
  // State for API data
  const [companies, setCompanies] = React.useState<Company[]>([]);
  const [companiesLoading, setCompaniesLoading] = React.useState(false);
  const [companiesError, setCompaniesError] = React.useState<string>("");
  
  // Get available locations for selected company
  const availableLocations = React.useMemo(() => {
    if (!selectedCompany) return [];
    const company = companies.find(c => c.company_id.toString() === selectedCompany);
    return company ? company.locations : [];
  }, [companies, selectedCompany]);
  
  // Local component state
  const [error, setLocalError] = React.useState<string>('');
  const [salesSplitTab, setSalesSplitTab] = React.useState<number>(0);
  const [chartKey, setChartKey] = React.useState<number>(0);
  
  // ✅ OPTIMIZED: Single API call management
  const [isApiCallInProgress, setIsApiCallInProgress] = React.useState(false);
  const apiCallTimeoutRef = React.useRef<NodeJS.Timeout>();
  const lastSuccessfulCallRef = React.useRef<string>(''); // Track last successful call signature
  
  // Get date range from Redux
  const salesSplitDateRange = useSelector(selectSalesSplitDashboardDateRange);
  const startDate = salesSplitDateRange.startDate || '';
  const endDate = salesSplitDateRange.endDate || '';
  const hasDateRange = useSelector(selectHasSalesSplitDashboardDateRange);
  
  // Date and filter state
  const [dateRangeType, setDateRangeType] = React.useState<string>('Custom Date Range');
  const [availableDateRanges] = React.useState<string[]>(['Custom Date Range']);
  const [hasValidData, setHasValidData] = React.useState<boolean>(false);
  const [showSuccessNotification, setShowSuccessNotification] = React.useState<boolean>(false);

  console.log('📈 ExcelImport: Current state:', {
    salesSplitDateRange,
    startDate,
    endDate,
    hasDateRange,
    isApiCallInProgress,
    hasValidData
  });

  // Fetch company-locations data on component mount
  React.useEffect(() => {
    const fetchCompanyLocations = async () => {
      setCompaniesLoading(true);
      setCompaniesError("");
      
      try {
        console.log('🏢 Fetching company-locations from:', COMPANY_LOCATIONS_API_URL);
        const response = await axios.get(COMPANY_LOCATIONS_API_URL);
        
        console.log('📥 Company-locations response:', response.data);
        setCompanies(response.data || []);
        
        // Auto-select the first company if there's only one and none is selected
        if (response.data && response.data.length === 1 && selectedCompanies.length === 0) {
          reduxDispatch(setSelectedCompanies([response.data[0].company_id.toString()]));
          console.log('🎯 Auto-selected single company:', response.data[0]);
        }
        
      } catch (error) {
        console.error('❌ Error fetching company-locations:', error);
        
        let errorMessage = "Error loading companies and locations";
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
  }, [selectedCompanies.length, reduxDispatch]);

  // Auto-select first location when company changes and has only one location
  React.useEffect(() => {
    if (selectedCompany && availableLocations.length === 1 && selectedLocations.length === 0) {
      reduxDispatch(setSelectedLocations([availableLocations[0].location_id.toString()]));
      console.log('🎯 Auto-selected single location:', availableLocations[0]);
    }
  }, [selectedCompany, availableLocations, selectedLocations.length, reduxDispatch]);

  // Set success notification when tableData changes
  React.useEffect(() => {
    if (reduxTableData && Object.keys(reduxTableData).length > 0) {
      console.log('✅ Data loaded successfully');
      setHasValidData(true);
      setShowSuccessNotification(true);
      setChartKey(prevKey => prevKey + 1);
    }
  }, [reduxTableData]);

  // Handle company selection change
  const handleCompanyChange = (event: SelectChangeEvent) => {
    const companyId = event.target.value;
    console.log('🏢 Company selection changed to:', companyId);
    
    reduxDispatch(setSelectedCompanies([companyId]));
    reduxDispatch(setSelectedLocations([])); // Clear locations when company changes
    
    // Clear existing data when company changes
    setHasValidData(false);
    
    console.log('🏢 Cleared locations due to company change');
  };

  // Get selected company and location names for display
  const selectedCompanyName = companies.find(c => c.company_id.toString() === selectedCompany)?.company_name || 
                               (selectedCompany ? `Company ID: ${selectedCompany}` : 'No Company Selected');
  
  const selectedLocationName = availableLocations.find(l => l.location_id.toString() === selectedLocation)?.location_name || 
                                (selectedLocation ? `Location ID: ${selectedLocation}` : 'No Location Selected');

  // Get active company ID
  const activeCompanyId = selectedCompany || currentCompanyId;

  // Handle tab changes
  const handleSalesSplitTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSalesSplitTab(newValue);
  };

  // Handle date range type change
  const handleDateRangeChange = (event: SelectChangeEvent) => {
    const newDateRange = event.target.value;
    setDateRangeType(newDateRange);
    setChartKey(prevKey => prevKey + 1);
  };

  // ✅ OPTIMIZED: Single API call function with improved deduplication
  const handleApplyFiltersWithDates = React.useCallback((
    explicitStartDate: string, 
    explicitEndDate: string, 
    categories: string[],
    selectedFilterLocations: string[]
  ) => {
    // ✅ Create unique call signature to prevent duplicates
    const callSignature = JSON.stringify({
      startDate: explicitStartDate,
      endDate: explicitEndDate,
      categories: categories.sort(),
      locations: selectedFilterLocations.sort(),
      companyId: activeCompanyId
    });

    console.log('🎯 ExcelImport: Filter request received:', {
      explicitStartDate,
      explicitEndDate,
      categories,
      selectedFilterLocations,
      activeCompanyId,
      callSignature
    });

    // ✅ Skip if identical call is already in progress or recently completed
    if (isApiCallInProgress) {
      console.log('⏸️ ExcelImport: API call already in progress, skipping duplicate');
      return;
    }

    if (callSignature === lastSuccessfulCallRef.current) {
      console.log('⏸️ ExcelImport: Identical call recently completed, skipping duplicate');
      return;
    }

    // ✅ Validate required data
    if (!activeCompanyId) {
      setLocalError('Please select a company first.');
      return;
    }

    if (selectedFilterLocations.length === 0) {
      setLocalError('Please select at least one location.');
      return;
    }

    // ✅ Set API call in progress
    setIsApiCallInProgress(true);
    setHasValidData(false);
    setLocalError('');

    // Clear any existing timeout
    if (apiCallTimeoutRef.current) {
      clearTimeout(apiCallTimeoutRef.current);
    }

    try {
      console.log('🔄 Starting SINGLE backend request');
      
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      // ✅ Store dates in Redux for persistence
      if (explicitStartDate && explicitEndDate) {
        reduxDispatch(setSalesSplitDashboardDateRange({
          startDate: explicitStartDate,
          endDate: explicitEndDate
        }));
      }
      
      // ✅ Format dates correctly for API
      let formattedStartDate: string | null = null;
      let formattedEndDate: string | null = null;
      
      const dateToUse = {
        start: explicitStartDate || startDate || '',
        end: explicitEndDate || endDate || ''
      };
      
      console.log('📅 ExcelImport: Processing dates:', {
        explicitStartDate,
        explicitEndDate,
        reduxStartDate: startDate,
        reduxEndDate: endDate,
        finalDates: dateToUse
      });
      
      // Format start date
      if (dateToUse.start) {
        try {
          if (dateToUse.start.includes('/')) {
            const dateParts = dateToUse.start.split('/');
            if (dateParts.length === 3) {
              const [month, day, year] = dateParts;
              formattedStartDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }
          } else if (dateToUse.start.includes('-')) {
            formattedStartDate = dateToUse.start;
          } else {
            const parsedDate = new Date(dateToUse.start);
            if (!isNaN(parsedDate.getTime())) {
              formattedStartDate = parsedDate.toISOString().split('T')[0];
            }
          }
        } catch (error) {
          console.warn('📅 ExcelImport: Error formatting start date:', error);
        }
      }
      
      // Format end date
      if (dateToUse.end) {
        try {
          if (dateToUse.end.includes('/')) {
            const dateParts = dateToUse.end.split('/');
            if (dateParts.length === 3) {
              const [month, day, year] = dateParts;
              formattedEndDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }
          } else if (dateToUse.end.includes('-')) {
            formattedEndDate = dateToUse.end;
          } else {
            const parsedDate = new Date(dateToUse.end);
            if (!isNaN(parsedDate.getTime())) {
              formattedEndDate = parsedDate.toISOString().split('T')[0];
            }
          }
        } catch (error) {
          console.warn('📅 ExcelImport: Error formatting end date:', error);
        }
      }

      console.log('📅 ExcelImport: Formatted dates for API:', {
        original: dateToUse,
        formatted: { start: formattedStartDate, end: formattedEndDate }
      });
      
      // ✅ Prepare comprehensive filter data
      const filterData = {
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        locations: selectedFilterLocations,
        location: selectedFilterLocations[0] || null,
        dateRangeType: 'Custom Date Range',
        selectedCategories: categories,
        categories: categories.join(','),
        company_id: activeCompanyId,
        multipleLocations: selectedFilterLocations.length > 1,
        locationCount: selectedFilterLocations.length,
        // ✅ Add deduplication tracking
        callSignature,
        timestamp: new Date().toISOString()
      };
      
      console.log('📤 ExcelImport: Sending SINGLE optimized request:', filterData);
      
      // ✅ Make single API call
      apiClient.post('/api/salessplit/filter', filterData)
        .then(response => {
          console.log('📥 ExcelImport: Received successful response:', {
            status: response.status,
            dataKeys: Object.keys(response.data || {}),
            locations: selectedFilterLocations
          });
          console.log('📥 ExcelImport: Response data:', response.data);
          if (response.data) {
            dispatch(setTableData(response.data));
            setHasValidData(true);
            lastSuccessfulCallRef.current = callSignature; // Store successful call signature
            
            console.log('✅ ExcelImport: Filter applied successfully');
          } else {
            throw new Error('Invalid response data');
          }
        })
        .catch(err => {
          console.error('❌ ExcelImport: Filter error:', {
            error: err,
            requestData: filterData
          });
          
          setHasValidData(false);
          
          let errorMessage = 'Error filtering data';
          if (err.response) {
            if (err.response.status === 401) {
              errorMessage = 'Authentication failed. Please log in again.';
            } else {
              const detail = err.response.data?.detail;
              errorMessage = `Server error: ${detail || err.response.status}`;
              
              if (err.response.status === 404) {
                errorMessage = 'API endpoint not found. Is the server running?';
              }
              
              if (detail && detail.includes('location')) {
                errorMessage = `Location error: ${detail}. Locations: ${selectedFilterLocations.join(', ')}`;
              }
              
              if (detail && detail.includes('date')) {
                errorMessage = `Date error: ${detail}. Dates: ${formattedStartDate} to ${formattedEndDate}`;
              }
            }
          } else if (err.request) {
            errorMessage = 'No response from server. Please check if the backend is running.';
          }
          
          setLocalError(errorMessage);
          dispatch(setError(errorMessage));
        })
        .finally(() => {
          dispatch(setLoading(false));
          
          // ✅ Reset API call state with timeout to prevent rapid successive calls
          apiCallTimeoutRef.current = setTimeout(() => {
            setIsApiCallInProgress(false);
          }, 1000); // 1 second cooldown period
          
          console.log('🏁 ExcelImport: API request completed');
        });
      
    } catch (err: any) {
      console.error('❌ ExcelImport: Unexpected error:', err);
      setHasValidData(false);
      
      const errorMessage = 'Error applying filters: ' + (err.message || 'Unknown error');
      setLocalError(errorMessage);
      dispatch(setError(errorMessage));
      dispatch(setLoading(false));
      setIsApiCallInProgress(false);
    }
  }, [isApiCallInProgress, activeCompanyId, startDate, endDate, dispatch, reduxDispatch, lastSuccessfulCallRef]);

  // ✅ SIMPLIFIED: Legacy method for backward compatibility
  const handleApplyFilters = React.useCallback(() => {
    console.log('⚠️ ExcelImport: Legacy handleApplyFilters called - redirecting to optimized version');
    
    if (!selectedLocations.length) {
      setLocalError('Please select at least one location.');
      return;
    }

    // Get location names for the legacy API
    const locationNames = selectedLocations.map(locationId => {
      const location = availableLocations.find(loc => loc.location_id.toString() === locationId);
      return location ? location.location_name : locationId;
    });

    const selectedCategories = salesFilters?.selectedCategories || [];
    
    handleApplyFiltersWithDates(
      startDate,
      endDate,
      selectedCategories,
      locationNames
    );
  }, [selectedLocations, availableLocations, salesFilters, startDate, endDate, handleApplyFiltersWithDates]);

  // Redux-based date handlers
  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = event.target.value;
    console.log('📅 Start date changed to:', newStartDate);
    reduxDispatch(setSalesSplitDashboardStartDate(newStartDate));
  };

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = event.target.value;
    console.log('📅 End date changed to:', newEndDate);
    reduxDispatch(setSalesSplitDashboardEndDate(newEndDate));
  };

  // Helper function to clear date range
  const handleClearDateRange = () => {
    console.log('🧹 Clearing Sales Split Dashboard date range');
    reduxDispatch(clearSalesSplitDashboardDateRange());
  };

  // Helper function to determine if we should show data
  const shouldShowData = () => {
    return hasValidData && !isApiCallInProgress && reduxTableData && Object.keys(reduxTableData).length > 0;
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (apiCallTimeoutRef.current) {
        clearTimeout(apiCallTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <Box sx={{ 
        background: '#ffffff',
        minHeight: '100vh',
        p: 3
      }}>
        {/* Header */}
        <Box mb={4}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
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
                margin: '0 0 8px 0'
              }}
            >
              Sales Split Dashboard
            </h1>

            {/* Company Info Display */}
            {activeCompanyId && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                mt: 2,
                mb: 1 
              }}>
                <CompanyInfoChip
                  icon={<BusinessIcon />}
                  label={`Company: ${selectedCompanyName}`}
                  variant="outlined"
                />
              </Box>
            )}

            {/* Date Range Status Display */}
            {hasDateRange && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                mt: 1,
                mb: 1 
              }}>
                <CompanyInfoChip
                  icon={<AnalyticsIcon />}
                  label={`Date Range: ${startDate} to ${endDate}`}
                  variant="outlined"
                  sx={{ 
                    backgroundColor: alpha('#4caf50', 0.1),
                    borderColor: alpha('#4caf50', 0.2),
                    '& .MuiChip-icon': { color: '#4caf50' },
                    '& .MuiChip-label': { color: '#4caf50' }
                  }}
                />
              </Box>
            )}
          </div>
        </Box>

        {/* Company Selection Section */}
        <CleanCard elevation={3} sx={{ 
          mb: 3, 
          borderRadius: 2, 
          overflow: "hidden",
          border: '2px solid #e3f2fd'
        }}>
          <CardContent sx={{ p: { xs: 2, md: 3 }, bgcolor: '#f8f9fa' }}>
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <BusinessIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2' }}>
                Company Selection
              </Typography>
              {companiesLoading && <CircularProgress size={20} />}
            </Box>
            
            {/* Error display */}
            {companiesError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {companiesError}
              </Alert>
            )}
            
            {/* Company Selection */}
            <FormControl fullWidth size="small" disabled={companiesLoading}>
              <InputLabel>Company</InputLabel>
              <Select
                value={selectedCompany}
                label="Company"
                onChange={handleCompanyChange}
                displayEmpty
              >
                <MenuItem value="">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                    <BusinessIcon fontSize="small" />
                    Select Company
                  </Box>
                </MenuItem>
                {companies.map((company) => (
                  <MenuItem key={company.company_id} value={company.company_id.toString()}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BusinessIcon fontSize="small" color="primary" />
                      {company.company_name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {/* Company Selection Summary */}
            {selectedCompany && (
              <Box sx={{ mt: 2 }}>
                <Chip
                  icon={<BusinessIcon />}
                  label={`Selected: ${selectedCompanyName}`}
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 500 }}
                />
                {/* Date Range Management */}
                {hasDateRange && (
                  <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={`📅 ${startDate} to ${endDate}`}
                      color="success"
                      variant="outlined"
                      size="small"
                      onDelete={handleClearDateRange}
                      deleteIcon={<RefreshIcon />}
                    />
                  </Box>
                )}
              </Box>
            )}
          </CardContent>
        </CleanCard>

        {/* ✅ OPTIMIZED: Single API call status indicator */}
        {isApiCallInProgress && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={16} />
              <Typography variant="body2">
                <strong>Processing filter request...</strong>
                <br />
                <small>Single optimized API call in progress</small>
              </Typography>
            </Box>
          </Alert>
        )}

        {/* FILTERS AND DASHBOARD */}
        <Grid container spacing={2}>
          {/* Filter Section - Always visible */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <FilterSection 
              dateRangeType={dateRangeType}
              availableDateRanges={availableDateRanges}
              onDateRangeChange={handleDateRangeChange}
              customDateRange={true}
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={handleStartDateChange}
              onEndDateChange={handleEndDateChange}
              locations={[]} // Legacy fallback
              selectedLocation={selectedLocation}
              onLocationChange={() => {}} // Legacy fallback
              onApplyFilters={handleApplyFilters}
              onApplyFiltersWithDates={handleApplyFiltersWithDates}
              // Redux integration props
              availableLocationObjects={availableLocations}
              selectedCompanyId={selectedCompany}
              reduxSelectedLocations={selectedLocations}
              onReduxLocationChange={(locationIds: string[]) => {
                console.log('📍 Received location change from FilterSection:', locationIds);
                reduxDispatch(setSelectedLocations(locationIds));
              }}
            />
          </Grid>
        </Grid>
        
        {/* Error Alert */}
        {(error || reduxError) && (
          <Fade in>
            <Alert 
              severity="error" 
              sx={{ 
                mt: 2,
                borderRadius: 2,
              }}
              icon={<ErrorIcon />}
              action={
                <Button 
                  color="inherit" 
                  size="small"
                  onClick={() => {
                    setLocalError('');
                    dispatch(setError(null));
                  }}
                >
                  Dismiss
                </Button>
              }
            >
              <Typography variant="subtitle2" fontWeight={600}>
                Processing Error
              </Typography>
              {error || reduxError}
            </Alert>
          </Fade>
        )}

        {/* Loading state */}
        {isApiCallInProgress && (
          <Fade in>
            <Alert 
              severity="info" 
              sx={{ 
                mt: 2,
                borderRadius: 2,
              }}
              icon={<CircularProgress size={20} />}
            >
              <Typography variant="subtitle2" fontWeight={600}>
                Loading Data...
              </Typography>
              Fetching data with optimized single API call.
              <br />
              <small>
                Company: {selectedCompanyName} | Locations: {selectedLocations.length} selected
              </small>
            </Alert>
          </Fade>
        )}

        {/* Main Dashboard */}
        <CleanCard sx={{ borderRadius: 2, mb: 3, overflow: 'hidden', mt: 2 }}>
          <Box sx={{ 
            background: '#ffffff',
            borderBottom: '1px solid #E5E7EB'
          }}>
            <Tabs 
              value={salesSplitTab} 
              onChange={handleSalesSplitTabChange} 
              variant="fullWidth"
            >
              <Tab label="Overview" />
              <Tab label="Detailed Analysis" />
            </Tabs>
          </Box>

          {/* Overview Tab */}
          <div
            role="tabpanel"
            hidden={salesSplitTab !== 0}
          >
            {salesSplitTab === 0 && (
              <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                {shouldShowData() ? (
                  <Fade in timeout={600}>
                    <Box>
                      <SalesSplitDashboard 
                        tableData={reduxTableData}
                        selectedLocation={selectedLocation}
                      />
                    </Box>
                  </Fade>
                ) : isApiCallInProgress ? (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <CircularProgress size={40} sx={{ mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Loading data...
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Company: {selectedCompanyName}
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <AnalyticsIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Ready to View Data
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Select a company and location, then apply filters to view your sales data
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      <Chip
                        label={selectedCompany ? `Company: ${selectedCompanyName}` : 'No Company Selected'}
                        color={selectedCompany ? 'success' : 'default'}
                        variant="outlined"
                      />
                      <Chip
                        label={selectedLocations.length > 0 ? `Locations: ${selectedLocations.length} selected` : 'No Locations Selected'}
                        color={selectedLocations.length > 0 ? 'success' : 'default'}
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </div>

          {/* Detailed Analysis Tab */}
          <div
            role="tabpanel"
            hidden={salesSplitTab !== 1}
          >
            {salesSplitTab === 1 && (
              <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                {shouldShowData() && reduxTableData.table1 && reduxTableData.table1.length > 0 ? (
                  <Fade in timeout={600}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <InsightsIcon sx={{ mr: 2, color: 'primary.main', fontSize: 28 }} />
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                          Detailed Analysis
                        </Typography>
                        {(activeCompanyId || selectedLocations.length > 0) && (
                          <Box sx={{ ml: 2, display: 'flex', gap: 1 }}>
                            {activeCompanyId && (
                              <CompanyInfoChip
                                icon={<BusinessIcon />}
                                label={`${selectedCompanyName}`}
                                size="small"
                              />
                            )}
                            {selectedLocations.length > 0 && (
                              <CompanyInfoChip
                                icon={<BusinessIcon />}
                                label={`${selectedLocations.length} Locations`}
                                size="small"
                              />
                            )}
                          </Box>
                        )}
                      </Box>

                      {/* Analytics Charts Section */}
                      <CleanCard sx={{ p: 3, mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                          <AnalyticsIcon sx={{ mr: 2, color: 'primary.main', fontSize: 28 }} />
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Sales Analytics 
                          </Typography>
                        </Box>
                        
                        <div key={`sales-chart-${chartKey}`}>
                          <SalesCharts 
                            tableData={reduxTableData}
                            dateRangeType={dateRangeType}
                            selectedLocation={selectedLocation}
                            height={250}
                          />
                        </div>
                      </CleanCard>

                      {/* Additional Analytics Sections */}
                      <Grid container spacing={3}>
                        {/* Table Display Section */}
                        <Grid item xs={12}>
                          <CleanCard sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                              <TableChartIcon sx={{ mr: 2, color: 'primary.main', fontSize: 28 }} />
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Data Tables
                              </Typography>
                            </Box>
                            
                            <TableDisplay 
                              tableData={reduxTableData}
                              selectedLocation={selectedLocation}
                            />
                          </CleanCard>
                        </Grid>

                        {/* Additional Chart Sections */}
                        {reduxTableData.table2 && reduxTableData.table2.length > 0 && (
                          <Grid item xs={12} md={6}>
                            <CleanCard sx={{ p: 3 }}>
                              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                Delivery Percentage
                              </Typography>
                              <DeliveryPercentageChart 
                                tableData={reduxTableData}
                                selectedLocation={selectedLocation}
                                height={300}
                              />
                            </CleanCard>
                          </Grid>
                        )}

                        {reduxTableData.table3 && reduxTableData.table3.length > 0 && (
                          <Grid item xs={12} md={6}>
                            <CleanCard sx={{ p: 3 }}>
                              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                In-House Percentage
                              </Typography>
                              <InHousePercentageChart 
                                tableData={reduxTableData}
                                selectedLocation={selectedLocation}
                                height={300}
                              />
                            </CleanCard>
                          </Grid>
                        )}

                        {reduxTableData.table4 && reduxTableData.table4.length > 0 && (
                          <Grid item xs={12} md={6}>
                            <CleanCard sx={{ p: 3 }}>
                              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                Catering Percentage
                              </Typography>
                              <CateringPercentageChart 
                                tableData={reduxTableData}
                                selectedLocation={selectedLocation}
                                height={300}
                              />
                            </CleanCard>
                          </Grid>
                        )}

                        {reduxTableData.table5 && reduxTableData.table5.length > 0 && (
                          <Grid item xs={12} md={6}>
                            <CleanCard sx={{ p: 3 }}>
                              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                First vs Third Party
                              </Typography>
                              <PercentageFirstThirdPartyChart 
                                tableData={reduxTableData}
                                selectedLocation={selectedLocation}
                                height={300}
                              />
                            </CleanCard>
                          </Grid>
                        )}

                        {/* Total Sales Trend */}
                        <Grid item xs={12}>
                          <CleanCard sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                              Total Sales Trend
                            </Typography>
                            <TotalSalesChart 
                              tableData={reduxTableData}
                              selectedLocation={selectedLocation}
                              height={400}
                            />
                          </CleanCard>
                        </Grid>

                        {/* Week-over-Week Trends */}
                        <Grid item xs={12}>
                          <CleanCard sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                              Week-over-Week Trends
                            </Typography>
                            <WowTrendsChart 
                              tableData={reduxTableData}
                              selectedLocation={selectedLocation}
                              height={400}
                            />
                          </CleanCard>
                        </Grid>
                      </Grid>
                    </Box>
                  </Fade>
                ) : isApiCallInProgress ? (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <CircularProgress size={40} sx={{ mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Loading detailed analysis...
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Company: {selectedCompanyName}
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <TableChartIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No detailed data available
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Apply filters to see detailed analysis
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                      <Chip
                        label={selectedCompany ? `✓ Company Selected` : '! Select Company'}
                        color={selectedCompany ? 'success' : 'warning'}
                        variant="outlined"
                        size="small"
                      />
                      <Chip
                        label={selectedLocations.length > 0 ? `✓ Locations Selected` : '! Select Locations'}
                        color={selectedLocations.length > 0 ? 'success' : 'warning'}
                        variant="outlined"
                        size="small"
                      />
                      <Chip
                        label={startDate && endDate ? `✓ Dates Set` : '! Set Date Range'}
                        color={startDate && endDate ? 'success' : 'warning'}
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </div>
        </CleanCard>

        {/* ✅ OPTIMIZED DEBUG: Single API call tracking
        {process.env.NODE_ENV === 'development' && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Debug - Optimized API State:</strong><br />
              API Call In Progress: {isApiCallInProgress ? 'Yes' : 'No'}<br />
              Has Valid Data: {hasValidData ? 'Yes' : 'No'}<br />
              Last Successful Call: {lastSuccessfulCallRef.current ? 'Yes' : 'None'}<br />
              Redux Start Date: {startDate || 'None'}<br />
              Redux End Date: {endDate || 'None'}<br />
              Has Date Range: {hasDateRange ? 'Yes' : 'No'}<br />
              Active Company ID: {activeCompanyId || 'None'}<br />
              Selected Locations: [{selectedLocations.join(', ')}]<br />
              Available Locations: {availableLocations.length} locations<br />
              Chart Key: {chartKey}
            </Typography>
          </Alert>
        )} */}
      </Box>

      {/* Success notification */}
      <Snackbar
        open={showSuccessNotification}
        autoHideDuration={3000}
        onClose={() => setShowSuccessNotification(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setShowSuccessNotification(false)} 
          severity="success" 
          sx={{ 
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
          }}
          icon={<CheckCircleIcon />}
        >
          <Typography variant="subtitle2" fontWeight={600}>
            Success!
          </Typography>
          Data loaded with single optimized API call.
        </Alert>
      </Snackbar>
    </>
  );
}

export default ExcelImport;
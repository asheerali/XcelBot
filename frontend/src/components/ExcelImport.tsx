<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import axios from 'axios';

=======
// ExcelImport.tsx - OPTIMIZED Version with Timezone-Safe Date Handling

import * as React from 'react';
import axios from 'axios';
import apiClient from '../api/axiosConfig';

>>>>>>> integrations_v41
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import Snackbar from '@mui/material/Snackbar';
import { SelectChangeEvent } from '@mui/material/Select';
<<<<<<< HEAD
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
=======
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
>>>>>>> integrations_v41

// Import components
import FilterSection from './FilterSection';
import TableDisplay from './TableDisplay';
import SalesCharts from './graphs/SalesCharts';
import DeliveryPercentageChart from './graphs/DeliveryPercentageChart';
import InHousePercentageChart from './graphs/InHousePercentageChart';
import CateringPercentageChart from './graphs/CateringPercentageChart';
<<<<<<< HEAD
import FirstPartyPercentageChart from './graphs/PercentageFirstThirdPartyChart';
import TotalSalesChart from './graphs/TotalSalesChart';
import WowTrendsChart from './graphs/WowTrendsChart';
import PercentageFirstThirdPartyChart from './graphs/PercentageFirstThirdPartyChart';

// Import Redux hooks
import { useAppDispatch, useAppSelector } from '../typedHooks';
import { 
  setExcelFile, 
  setLoading, 
  setError, 
  setTableData,
  addFileData,
  setLocations,
  selectLocation
} from '../store/excelSlice';

// API base URLs - update to match your backend URL
const API_URL = 'http://13.60.27.209:8000/api/excel/upload';
const FILTER_API_URL = 'http://13.60.27.209:8000/api/excel/filter';
=======
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
>>>>>>> integrations_v41

// ENHANCED: Date range Redux integration with timezone safety
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
// ✅ TIMEZONE-SAFE: Replace the formatDateForAPI function
const formatDateForAPI = (dateString: string): string | null => {
  if (!dateString) return null;
  
  console.log('📅 formatDateForAPI called with:', {
    dateString,
    type: typeof dateString,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  
  try {
    // TIMEZONE FIX: Handle string parsing without Date object conversion when possible
    
    // If already in YYYY-MM-DD format, return as-is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      console.log('✅ formatDateForAPI: Already in YYYY-MM-DD format:', dateString);
      return dateString;
    }
    
    // MM/DD/YYYY format (US) - direct string parsing to avoid timezone issues
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
      const [month, day, year] = dateString.split('/').map(Number);
      const formatted = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      console.log('✅ formatDateForAPI MM/DD/YYYY direct conversion:', {
        input: dateString,
        parsed: { month, day, year },
        formatted: formatted
      });
      return formatted;
    }
    
    // DD.MM.YYYY format (German) - direct string parsing
    if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(dateString)) {
      const [day, month, year] = dateString.split('.').map(Number);
      const formatted = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      console.log('✅ formatDateForAPI DD.MM.YYYY direct conversion:', {
        input: dateString,
        parsed: { day, month, year },
        formatted: formatted
      });
      return formatted;
    }
    
    // DD-MM-YYYY format (German) - direct string parsing
    if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(dateString)) {
      const [day, month, year] = dateString.split('-').map(Number);
      const formatted = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      console.log('✅ formatDateForAPI DD-MM-YYYY direct conversion:', {
        input: dateString,
        parsed: { day, month, year },
        formatted: formatted
      });
      return formatted;
    }
    
    // For ISO strings, extract date part only
    if (dateString.includes('T')) {
      const datePart = dateString.split('T')[0];
      if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
        console.log('✅ formatDateForAPI: Extracted date from ISO string:', datePart);
        return datePart;
      }
    }
    
    // Last resort: try Date parsing but use timezone-safe methods
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime()) && date.getFullYear() > 1970) {
        // Use local timezone methods to avoid UTC conversion
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const formatted = `${year}-${month}-${day}`;
        console.log('✅ formatDateForAPI: Date object conversion (timezone-safe):', {
          input: dateString,
          dateObj: date.toString(),
          formatted: formatted
        });
        return formatted;
      }
    } catch (parseError) {
      console.warn('⚠️ formatDateForAPI: Date parsing failed:', parseError);
    }
    
    console.warn('⚠️ formatDateForAPI: Unrecognized date format:', dateString);
    return null;
  } catch (error) {
    console.error('❌ Error in formatDateForAPI:', error, 'Input:', dateString);
    return null;
  }
};


const formatDateForInput = (dateString: string): string => {
  if (!dateString) return '';
  
  console.log('📅 formatDateForInput called with:', {
    dateString,
    type: typeof dateString,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  
  try {
    // If already in YYYY-MM-DD format for input, return as-is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      console.log('✅ formatDateForInput: Already in YYYY-MM-DD format:', dateString);
      return dateString;
    }
    
    // Handle MM/DD/YYYY format - convert to YYYY-MM-DD for HTML date input
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
      const [month, day, year] = dateString.split('/').map(Number);
      const formatted = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      console.log('✅ formatDateForInput MM/DD/YYYY conversion:', {
        input: dateString,
        parsed: { month, day, year },
        formatted: formatted
      });
      return formatted;
    }
    
    // Handle DD.MM.YYYY format - convert to YYYY-MM-DD for HTML date input
    if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(dateString)) {
      const [day, month, year] = dateString.split('.').map(Number);
      const formatted = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      console.log('✅ formatDateForInput DD.MM.YYYY conversion:', {
        input: dateString,
        parsed: { day, month, year },
        formatted: formatted
      });
      return formatted;
    }
    
    // Handle DD-MM-YYYY format - convert to YYYY-MM-DD for HTML date input
    if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(dateString)) {
      const [day, month, year] = dateString.split('-').map(Number);
      const formatted = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      console.log('✅ formatDateForInput DD-MM-YYYY conversion:', {
        input: dateString,
        parsed: { day, month, year },
        formatted: formatted
      });
      return formatted;
    }
    
    // Convert other formats to YYYY-MM-DD for date input
    const formatted = formatDateForAPI(dateString);
    return formatted || '';
  } catch (error) {
    console.error('❌ Error in formatDateForInput:', error, 'Input:', dateString);
    return '';
  }
};

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
<<<<<<< HEAD
  // Get state from Redux
  const { 
    fileName, 
    fileContent, 
    loading: reduxLoading, 
    error: reduxError, 
    tableData: reduxTableData,
    fileProcessed,
    allLocations,
    salesLocations,
    
    files,
    location: currentLocation
  } = useAppSelector((state) => state.excel);
  
  const dispatch = useAppDispatch();
  
  // Local state
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<number>(0);
  const [viewMode, setViewMode] = useState<string>('tabs'); // 'tabs', 'combined', or 'row'
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<string>(currentLocation || '');
  
  // Location dialog state - not needed in this component since files come pre-loaded
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState<boolean>(false);
  const [locationInput, setLocationInput] = useState<string>('');
  const [locationError, setLocationError] = useState<string>('');
  
  // Separate states for notification
  const [showSuccessNotification, setShowSuccessNotification] = useState<boolean>(false);
  
  // State to force chart re-render
  const [chartKey, setChartKey] = useState<number>(0);
  
  // Date filter states
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [dateRangeType, setDateRangeType] = useState<string>('');
  const [availableDateRanges, setAvailableDateRanges] = useState<string[]>([]);
  const [customDateRange, setCustomDateRange] = useState<boolean>(false);
  
  // Update selected location whenever Redux location changes
  useEffect(() => {
    if (currentLocation && currentLocation !== selectedLocation) {
      setSelectedLocation(currentLocation);
    }
  }, [currentLocation, selectedLocation]);
  
  // Set file processed notification when tableData changes
  useEffect(() => {
    if (fileProcessed) {
      setShowSuccessNotification(true);
      // Force re-render of chart component when data is processed
      setChartKey(prevKey => prevKey + 1);
    }
  }, [fileProcessed]);
  
  // Update available date ranges when data changes or location changes
  useEffect(() => {
    if (reduxTableData && reduxTableData.dateRanges && reduxTableData.dateRanges.length > 0) {
      setAvailableDateRanges(reduxTableData.dateRanges);
      
      // Set default date range if not already set
      if (!dateRangeType && reduxTableData.dateRanges.length > 0) {
        setDateRangeType(reduxTableData.dateRanges[0]);
=======
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
  
  // ENHANCED: Get date range from Redux with timezone safety
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
    hasValidData,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
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
>>>>>>> integrations_v41
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
<<<<<<< HEAD
    
    // Update location if available from Redux state
    if (allLocations && allLocations.length > 0 && !selectedLocation) {
      const firstLocation = currentLocation || allLocations[0];
      setSelectedLocation(firstLocation);
      dispatch(selectLocation(firstLocation));
    }
  }, [reduxTableData, dateRangeType, selectedLocation, allLocations, currentLocation, dispatch]);

  // Effect to handle custom date range selection
  useEffect(() => {
    if (dateRangeType === 'Custom Date Range') {
      setCustomDateRange(true);
    } else {
      setCustomDateRange(false);
    }
  }, [dateRangeType]);

  // Handle location change
  const handleLocationChange = (event: SelectChangeEvent) => {
    const newLocation = event.target.value;
    setSelectedLocation(newLocation);
    
    // Dispatch redux action to select location
    dispatch(selectLocation(newLocation));
    
    // Apply filters with new location
    handleApplyFilters(newLocation, dateRangeType);
    
    // Force re-render of chart component when filters change
    setChartKey(prevKey => prevKey + 1);
=======
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
>>>>>>> integrations_v41
  };

  // Handle date range type change
  const handleDateRangeChange = (event: SelectChangeEvent) => {
    const newDateRange = event.target.value;
    setDateRangeType(newDateRange);
<<<<<<< HEAD
    
    // Apply filters with new date range
    handleApplyFilters(selectedLocation, newDateRange);
    
    // Force re-render of chart component when filters change
    setChartKey(prevKey => prevKey + 1);
  };

  // Apply filters
  const handleApplyFilters = (location = selectedLocation, dateRange = dateRangeType) => {
    // Check if we have any files loaded
    if (!files || files.length === 0) {
      setError('No files uploaded. Please upload Excel files first.');
      return;
    }
    
    // Find the file for the selected location
    const fileForLocation = files.find(f => f.location === location);
    
    if (!fileForLocation) {
      setError(`No file found for location: ${location}`);
      return;
    }

    try {
      // Use direct action objects instead of potentially undefined actions
      dispatch({ type: 'excel/setLoading', payload: true });
      dispatch({ type: 'excel/setError', payload: null });
      
      // Format dates correctly for API
      let formattedStartDate: string | null = null;
      let formattedEndDate: string | null = null;
      
      if (dateRange === 'Custom Date Range' && startDate) {
        // Convert MM/DD/YYYY to YYYY-MM-DD format for backend
        const dateParts = startDate.split('/');
        if (dateParts.length === 3) {
          formattedStartDate = `${dateParts[2]}-${dateParts[0].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}`;
        }
      }
      
      if (dateRange === 'Custom Date Range' && endDate) {
        // Convert MM/DD/YYYY to YYYY-MM-DD format for backend
        const dateParts = endDate.split('/');
        if (dateParts.length === 3) {
          formattedEndDate = `${dateParts[2]}-${dateParts[0].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}`;
        }
      }
      
      // Get the file content from the selected file
      const selectedFile = fileForLocation;
      
      // Prepare filter data
      const filterData = {
        fileName: selectedFile.fileName,
        fileContent: fileContent, // Use stored file content if available
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        location: location || null,
        dateRangeType: dateRange
      };
      
      console.log('Sending filter request:', filterData);
      
      // Call filter API
      axios.post(FILTER_API_URL, filterData)
        .then(response => {
          // Update table data with filtered data
          if (response.data) {
            dispatch({ type: 'excel/setTableData', payload: response.data });
            setError(''); // Clear any previous errors
            
            // Force re-render of chart component when data changes
            setChartKey(prevKey => prevKey + 1);
          } else {
            throw new Error('Invalid response data');
          }
        })
        .catch(err => {
          console.error('Filter error:', err);
          
          let errorMessage = 'Error filtering data';
          if (axios.isAxiosError(err)) {
            if (err.response) {
              // Get detailed error message if available
              const detail = err.response.data?.detail;
              errorMessage = `Server error: ${detail || err.response.status}`;
              
              // Special handling for common errors
              if (detail && typeof detail === 'string' && detail.includes('isinf')) {
                errorMessage = 'Backend error: Please update the backend code to use numpy.isinf instead of pandas.isinf';
              } else if (err.response.status === 404) {
                errorMessage = 'API endpoint not found. Is the server running?';
              }
            } else if (err.request) {
              errorMessage = 'No response from server. Please check if the backend is running.';
            }
          }
          
          setError(errorMessage);
          dispatch({ type: 'excel/setError', payload: errorMessage });
        })
        .finally(() => {
          dispatch({ type: 'excel/setLoading', payload: false });
        });
      
    } catch (err: any) {
      console.error('Filter error:', err);
      const errorMessage = 'Error applying filters: ' + (err.message || 'Unknown error');
      setError(errorMessage);
      dispatch({ type: 'excel/setError', payload: errorMessage });
      dispatch({ type: 'excel/setLoading', payload: false });
    }
  };

  // Handle file selection (not needed since we're not uploading from here)
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // This component doesn't handle file uploads - redirect to upload page
    window.location.href = '/upload-excel';
  };

  // Handle tab changes
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Handle date input changes - these are in MM/DD/YYYY format
  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(event.target.value);
  };

  // Convert file to base64
  const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
  
  // Handle location dialog save
  const handleLocationSave = () => {
    if (!locationInput.trim()) {
      setLocationError('Location name is required');
      return;
    }
    
    // Check for duplicate locations
    if (allLocations && allLocations.some(loc => loc.toLowerCase() === locationInput.trim().toLowerCase())) {
      setLocationError('Location name must be unique');
      return;
    }
    
    // Close the dialog and proceed with upload
    setIsLocationDialogOpen(false);
    setSelectedLocation(locationInput.trim());
    
    // Trigger the upload
    handleUpload(locationInput.trim());
  };

  // Upload and process file
  const handleUpload = async (locationName?: string) => {
    if (!file) {
      setError('Please select a file first');
=======
    setChartKey(prevKey => prevKey + 1);
  };

  // ✅ ENHANCED: Single API call function with timezone-safe date handling
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
      callSignature,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
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
>>>>>>> integrations_v41
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
<<<<<<< HEAD
      // Use explicit action objects if the action creators might be undefined
      dispatch({ type: 'excel/setLoading', payload: true });
      dispatch({ type: 'excel/setError', payload: null });
      setError(''); // Clear any previous errors
      
      // Convert file to base64
      const base64File = await toBase64(file);
      const base64Content = base64File.split(',')[1]; // Remove data:application/... prefix
      
      // Use explicit action object with location if provided
      dispatch({ 
        type: 'excel/setExcelFile', 
        payload: {
          fileName: file.name,
          fileContent: base64Content,
          location: locationName
        }
      });
      
      // Send to backend
      const response = await axios.post(API_URL, {
        fileName: file.name,
        fileContent: base64Content,
        location: locationName // Include location in the request
      });
      
      // Update table data with response
      if (response.data) {
        // Add file data to Redux store
        if (locationName) {
          dispatch({ 
            type: 'excel/addFileData', 
            payload: {
              fileName: file.name,
              location: locationName,
              data: response.data
            }
          });
          
          // Update locations in Redux store
          dispatch({ 
            type: 'excel/setLocations', 
            payload: locationName ? [locationName] : response.data.locations || []
          });
        }
        
        dispatch({ type: 'excel/setTableData', payload: response.data });
        setShowSuccessNotification(true);  // Show notification
        
        // Set location if available
        if (locationName) {
          setSelectedLocation(locationName);
          dispatch({ type: 'excel/selectLocation', payload: locationName });
        } else if (response.data.locations && response.data.locations.length > 0) {
          setSelectedLocation(response.data.locations[0]);
          dispatch({ type: 'excel/selectLocation', payload: response.data.locations[0] });
        }
        
        // Set date ranges if available
        if (response.data.dateRanges && response.data.dateRanges.length > 0) {
          setAvailableDateRanges(response.data.dateRanges);
          setDateRangeType(response.data.dateRanges[0]);
        }
        
        // Show tutorial on first successful upload
        if (!localStorage.getItem('tutorialShown')) {
          setShowTutorial(true);
          localStorage.setItem('tutorialShown', 'true');
        }
        
        // Force re-render of chart component
        setChartKey(prevKey => prevKey + 1);
      } else {
        throw new Error('Invalid response data');
      }
      
    } catch (err: any) {
      console.error('Upload error:', err);
      
      let errorMessage = 'Error processing file';
      
      if (axios.isAxiosError(err)) {
        if (err.response) {
          // Get detailed error message if available
          const detail = err.response.data?.detail;
          errorMessage = `Server error: ${detail || err.response.status}`;
          
          // Special handling for common errors
          if (detail && typeof detail === 'string' && detail.includes('isinf')) {
            errorMessage = 'Backend error: Please update the backend code to use numpy.isinf instead of pandas.isinf';
          } else if (err.response.status === 404) {
            errorMessage = 'API endpoint not found. Is the server running?';
          } else if (detail) {
            // Try to extract a more meaningful message
            if (typeof detail === 'string' && detail.includes('Column')) {
              errorMessage = `File format error: ${detail}`;
            } else {
              errorMessage = `Processing error: ${detail}`;
            }
          }
        } else if (err.request) {
          errorMessage = 'No response from server. Please check if the backend is running.';
        }
      } else if (err.message) {
        errorMessage = `Error: ${err.message}`;
      }
      
      setError(errorMessage);
      dispatch({ type: 'excel/setError', payload: errorMessage });
    } finally {
      dispatch({ type: 'excel/setLoading', payload: false });
=======
      console.log('🔄 Starting SINGLE backend request with timezone-safe dates');
      
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      // ✅ ENHANCED: Store dates in Redux for persistence with timezone safety
      if (explicitStartDate && explicitEndDate) {
        reduxDispatch(setSalesSplitDashboardDateRange({
          startDate: explicitStartDate,
          endDate: explicitEndDate
        }));
      }
      
      // ✅ ENHANCED: Format dates correctly for API with timezone safety
      const formattedStartDate = formatDateForAPI(explicitStartDate || startDate);
      const formattedEndDate = formatDateForAPI(explicitEndDate || endDate);
      
      console.log('📅 ExcelImport: Processing dates with timezone safety:', {
        explicitStartDate,
        explicitEndDate,
        reduxStartDate: startDate,
        reduxEndDate: endDate,
        formattedStartDate,
        formattedEndDate,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
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
        timestamp: new Date().toISOString(),
        // ✅ Add timezone information for debugging
        clientTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        clientTimezoneOffset: new Date().getTimezoneOffset()
      };
      
      console.log('📤 ExcelImport: Sending SINGLE optimized request with timezone-safe dates:', filterData);
      
      // ✅ Make single API call
      apiClient.post('/api/salessplit/filter', filterData)
        .then(response => {
          console.log('📥 ExcelImport: Received successful response:', {
            status: response.status,
            dataKeys: Object.keys(response.data || {}),
            locations: selectedFilterLocations,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          });
          
          if (response.data) {
            dispatch(setTableData(response.data));
            setHasValidData(true);
            lastSuccessfulCallRef.current = callSignature; // Store successful call signature
            
            console.log('✅ ExcelImport: Filter applied successfully with timezone-safe dates');
          } else {
            throw new Error('Invalid response data');
          }
        })
        .catch(err => {
          console.error('❌ ExcelImport: Filter error:', {
            error: err,
            requestData: filterData,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
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
>>>>>>> integrations_v41
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

  // ENHANCED: Redux-based date handlers with timezone safety
  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const newStartDate = event.target.value; // This is already in YYYY-MM-DD format from HTML input
  console.log('📅 Start date changed to (HTML input format):', {
    value: newStartDate,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  
  // Convert YYYY-MM-DD to MM/DD/YYYY for internal consistency
  if (/^\d{4}-\d{2}-\d{2}$/.test(newStartDate)) {
    const [year, month, day] = newStartDate.split('-').map(Number);
    const mmddyyyy = `${month}/${day}/${year}`;
    
    console.log('📅 Converting HTML date input to MM/DD/YYYY:', {
      htmlInput: newStartDate,
      converted: mmddyyyy
    });
    
    // Update Sales Split Dashboard Redux state with MM/DD/YYYY format
    reduxDispatch(setSalesSplitDashboardStartDate(mmddyyyy));
    
    // Update legacy Redux state for compatibility
    dispatch(updateSalesFilters({ startDate: mmddyyyy }));
  } else {
    // Fallback - use the value as-is
    reduxDispatch(setSalesSplitDashboardStartDate(newStartDate));
    dispatch(updateSalesFilters({ startDate: newStartDate }));
  }
};

 const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const newEndDate = event.target.value; // This is already in YYYY-MM-DD format from HTML input
  console.log('📅 End date changed to (HTML input format):', {
    value: newEndDate,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  
  // Convert YYYY-MM-DD to MM/DD/YYYY for internal consistency
  if (/^\d{4}-\d{2}-\d{2}$/.test(newEndDate)) {
    const [year, month, day] = newEndDate.split('-').map(Number);
    const mmddyyyy = `${month}/${day}/${year}`;
    
    console.log('📅 Converting HTML date input to MM/DD/YYYY:', {
      htmlInput: newEndDate,
      converted: mmddyyyy
    });
    
    // Update Sales Split Dashboard Redux state with MM/DD/YYYY format
    reduxDispatch(setSalesSplitDashboardEndDate(mmddyyyy));
    
    // Update legacy Redux state for compatibility
    dispatch(updateSalesFilters({ endDate: mmddyyyy }));
  } else {
    // Fallback - use the value as-is
    reduxDispatch(setSalesSplitDashboardEndDate(newEndDate));
    dispatch(updateSalesFilters({ endDate: newEndDate }));
  }
};
  // Helper function to clear date range
  const handleClearDateRange = () => {
    console.log('🧹 Clearing Sales Split Dashboard date range');
    reduxDispatch(clearSalesSplitDashboardDateRange());
  };

<<<<<<< HEAD
  // Success notification - decoupled from dataProcessed state
  const renderSuccessMessage = () => (
    <Snackbar
      open={showSuccessNotification}
      autoHideDuration={5000}
      onClose={() => setShowSuccessNotification(false)}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert 
        onClose={() => setShowSuccessNotification(false)} 
        severity="success" 
        sx={{ width: '100%' }}
      >
        Excel file processed successfully!
      </Alert>
    </Snackbar>
  );

  // Tutorial snackbar
  const renderTutorial = () => (
    <Snackbar
      open={showTutorial}
      autoHideDuration={15000}
      onClose={() => setShowTutorial(false)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert 
        onClose={() => setShowTutorial(false)} 
        severity="info" 
        sx={{ width: '100%', maxWidth: '500px' }}
      >
        <Typography variant="subtitle1" gutterBottom>Welcome to the Sales Analyzer!</Typography>
        <Typography variant="body2">
          • <strong>Percentage Table</strong>: Shows week-over-week changes<br />
          • <strong>In-House Table</strong>: Categories as % of In-House sales<br />
          • <strong>WOW Table</strong>: Includes 3P totals and 1P/3P ratio<br />
          • <strong>Category Summary</strong>: Overall sales by category<br />
          <br />
          Use the date filter to analyze specific time periods!
        </Typography>
      </Alert>
    </Snackbar>
  );
  
  // Location dialog
  const renderLocationDialog = () => (
    <Dialog
      open={isLocationDialogOpen}
      onClose={() => setIsLocationDialogOpen(false)}
      aria-labelledby="location-dialog-title"
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle id="location-dialog-title">
        Enter Location Name
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" paragraph>
          Please enter a location name for this Excel file. Each file should represent data from a single location.
        </Typography>
        <TextField
          autoFocus
          margin="dense"
          id="location"
          label="Location Name"
          type="text"
          fullWidth
          variant="outlined"
          value={locationInput}
          onChange={(e) => setLocationInput(e.target.value)}
          error={!!locationError}
          helperText={locationError}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setIsLocationDialogOpen(false)} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleLocationSave} color="primary" variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <>
      <Box mb={4}>
         <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            fontWeight: 600,
            color: '#1a237e',
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
          }}
        >
           {/* <Typography variant="h4" gutterBottom> */}
          Sales Analysis Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {files.length > 0 
            ? `Analyzing data from ${files.length} location${files.length > 1 ? 's' : ''}`
            : 'Upload Excel files to analyze sales data across different categories'}
        </Typography>
      </Box>

      {/* Excel Upload Card - Modified to show files loaded status */}
      <Card sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2}>
          {/* File status display */}
          {files.length === 0 ? (
            <Grid item xs={12}>
              <Box textAlign="center" py={4}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No files uploaded yet
                </Typography>
                <Button 
                  variant="contained" 
                  onClick={() => window.location.href = '/upload-excel'}
                  sx={{ mt: 2 }}
                >
                  Go to Upload Page
                </Button>
              </Box>
            </Grid>
          ) : (
            <>
              {/* File summary */}
              <Grid item xs={12}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h6">
                      Files Loaded: {files.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Current file: {fileName || 'None selected'}
                      {selectedLocation && ` (Location: ${selectedLocation})`}
                    </Typography>
                  </Box>
                  <Button 
                    variant="outlined" 
                    onClick={() => window.location.href = '/upload-excel'}
                  >
                    Upload More Files
                  </Button>
                </Box>
              </Grid>
              
              {/* Filter section */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <FilterSection 
                  dateRangeType={dateRangeType}
                  availableDateRanges={availableDateRanges}
                  onDateRangeChange={handleDateRangeChange}
                  customDateRange={customDateRange}
                  startDate={startDate}
                  endDate={endDate}
                  onStartDateChange={handleStartDateChange}
                  onEndDateChange={handleEndDateChange}
                  locations={salesLocations || []} 
                  selectedLocation={selectedLocation}
                  onLocationChange={handleLocationChange}
                  onApplyFilters={() => handleApplyFilters()}
                />
              </Grid>
            </>
          )}
        </Grid>
        
        {/* Error Alert */}
        {(error || reduxError) && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error || reduxError}
=======
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

            {/* ENHANCED: Date Range Status Display with timezone info */}
            {hasDateRange && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                mt: 1,
                mb: 1 
              }}>
                <CompanyInfoChip
                  icon={<AnalyticsIcon />}
                  label={`Date Range: ${startDate} to ${endDate} (${Intl.DateTimeFormat().resolvedOptions().timeZone})`}
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
                {/* ENHANCED: Date Range Management with timezone info */}
                {hasDateRange && (
                  <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={`📅 ${startDate} to ${endDate} (${Intl.DateTimeFormat().resolvedOptions().timeZone})`}
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
                <small>Single optimized API call in progress (Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone})</small>
              </Typography>
            </Box>
>>>>>>> integrations_v41
          </Alert>
        )}

<<<<<<< HEAD
      {/* CHART COMPONENT - Always visible when data is processed */}
      {fileProcessed && files.length > 0 && (
        <Card 
          elevation={2} 
          sx={{ 
            mb: 3, 
            p: 2, 
            position: 'relative'
          }}
        >
          <Typography variant="h5" gutterBottom>
            Sales Analytics {selectedLocation ? `for ${selectedLocation}` : ''}
          </Typography>
          <Divider sx={{ mb: 1 }} />
          
          {/* Using key to force complete remount of the component when filters change */}
          <div key={`sales-chart-${chartKey}`}>
            <SalesCharts 
              fileName={fileName}
=======
        {/* FILTERS AND DASHBOARD */}
        <Grid container spacing={2}>
          {/* Filter Section - Always visible */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <FilterSection 
>>>>>>> integrations_v41
              dateRangeType={dateRangeType}
              availableDateRanges={availableDateRanges}
              onDateRangeChange={handleDateRangeChange}
              customDateRange={true}
              startDate={formatDateForInput(startDate)} // Convert for HTML date input
              endDate={formatDateForInput(endDate)} // Convert for HTML date input
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
<<<<<<< HEAD
          </div>
        </Card>
      )}

      {/* Table Display Component */}
      <TableDisplay 
        tableData={reduxTableData}
        viewMode={viewMode}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Add charts only when data is available */}
      {fileProcessed && reduxTableData.table1 && reduxTableData.table1.length > 0 && (
        <>
          {/* Delivery Percentage Chart */}
          <Card sx={{ mb: 3, p: 2 }}>
            <Divider sx={{ mb: 1 }} />
            <DeliveryPercentageChart tableData={reduxTableData} height={200} />
          </Card>

          {/* In-House Percentage Chart */}
          <Card sx={{ mb: 3, p: 2 }}>
            <Divider sx={{ mb: 1 }} />
            <InHousePercentageChart tableData={reduxTableData} height={200} />
          </Card>
          
          {/* Catering Percentage Chart */}
          <Card sx={{ mb: 3, p: 2 }}>
            <Divider sx={{ mb: 1 }} />
            <CateringPercentageChart tableData={reduxTableData} height={200} />
          </Card>
          
          {/* Total Sales Chart */}
          <Card sx={{ mb: 3, p: 2 }}>
            <Divider sx={{ mb: 1 }} />
            <TotalSalesChart tableData={reduxTableData} height={200} />
          </Card>

          {/* WOW Trends Chart */}
          {reduxTableData.table4 && reduxTableData.table4.length > 0 && (
            <Card sx={{ mb: 3, p: 2 }}>
              <Divider sx={{ mb: 1 }} />
              <WowTrendsChart tableData={reduxTableData} height={200} />
            </Card>
          )}
        </>
      )}
=======
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
>>>>>>> integrations_v41

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
                Company: {selectedCompanyName} | Locations: {selectedLocations.length} selected | Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
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
                    <Typography variant="caption" color="text.secondary">
                      Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
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
                      <Chip
                        label={`Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`}
                        color="info"
                        variant="outlined"
                        size="small"
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
              <CompanyInfoChip
                label={`${Intl.DateTimeFormat().resolvedOptions().timeZone}`}
                size="small"
                sx={{ 
                  backgroundColor: alpha('#ff9800', 0.1),
                  borderColor: alpha('#ff9800', 0.2),
                  '& .MuiChip-label': { color: '#ff9800' }
                }}
              />
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
          {/* Table Display Section - Full Width */}
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

          {/* Delivery Percentage Chart - Single Row on Tablet+ */}
          {reduxTableData.table2 && reduxTableData.table2.length > 0 && (
            <Grid item xs={12} sm={12} md={12}>
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

          {/* In-House Percentage Chart - Single Row on Tablet+ */}
          {reduxTableData.table3 && reduxTableData.table3.length > 0 && (
            <Grid item xs={12} sm={12} md={12}>
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

          {/* Catering Percentage Chart - Single Row on Tablet+ */}
          {reduxTableData.table4 && reduxTableData.table4.length > 0 && (
            <Grid item xs={12} sm={12} md={12}>
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

          {/* First vs Third Party Chart - Single Row on Tablet+ */}
          {reduxTableData.table5 && reduxTableData.table5.length > 0 && (
            <Grid item xs={12} sm={12} md={12}>
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

          {/* Total Sales Trend - Full Width */}
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

          {/* Week-over-Week Trends - Full Width */}
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
      <Typography variant="caption" color="text.secondary">
        Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
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
        <Chip
          label={`Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`}
          color="info"
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

        {/* ENHANCED: Debug info with timezone details */}
      
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
          Data loaded with timezone-safe single optimized API call.
          <br />
          <small>Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}</small>
        </Alert>
      </Snackbar>
    </>
  );
}

export default ExcelImport;
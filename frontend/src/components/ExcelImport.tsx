// Fixed ExcelImport.tsx with proper React imports

import * as React from 'react';
import axios from 'axios';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import Snackbar from '@mui/material/Snackbar';
import { SelectChangeEvent } from '@mui/material/Select';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Skeleton from '@mui/material/Skeleton';
import Fade from '@mui/material/Fade';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Backdrop from '@mui/material/Backdrop';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CardContent from '@mui/material/CardContent';
import { styled, alpha, keyframes } from '@mui/material/styles';

// Icons
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import TableChartIcon from '@mui/icons-material/TableChart';
import InsightsIcon from '@mui/icons-material/Insights';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import RefreshIcon from '@mui/icons-material/Refresh';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BusinessIcon from '@mui/icons-material/Business';

// Import components
import FilterSection from './FilterSection';
import TableDisplay from './TableDisplay';
import SalesCharts from './graphs/SalesCharts';
import DeliveryPercentageChart from './graphs/DeliveryPercentageChart';
import InHousePercentageChart from './graphs/InHousePercentageChart';
import CateringPercentageChart from './graphs/CateringPercentageChart';
import FirstPartyPercentageChart from './graphs/PercentageFirstThirdPartyChart';
import TotalSalesChart from './graphs/TotalSalesChart';
import WowTrendsChart from './graphs/WowTrendsChart';
import PercentageFirstThirdPartyChart from './graphs/PercentageFirstThirdPartyChart';
import SalesDashboard from './SalesDashboard';
import SalesSplitDashboard from './SalesSplitDashboard';
import { API_URL_Local } from '../constants';

// UPDATED: Import Redux hooks and actions from both slices
import { useAppDispatch, useAppSelector } from '../typedHooks';
import { 
  excelSlice,
  setExcelFile, 
  setTableData,
  addFileData,
  setLocations,
  selectLocation,
  addSalesWideData,
  selectSalesWideLocation,
  selectCategoriesByLocation,
  selectSalesFilters,
  updateSalesFilters,
  selectCompanyId,
} from '../store/excelSlice';

// UPDATED: Import masterFileSlice Redux actions and selectors
import { useSelector, useDispatch } from "react-redux";
import {
  setSelectedCompanies, 
  setSelectedLocations,
  selectSelectedCompanies,
  selectSelectedLocations 
} from "../store/slices/masterFileSlice";

// Extract actions from the slice
const { setLoading, setError } = excelSlice.actions;

// Company interface (updated to match API response)
interface Company {
  company_id: number;
  company_name: string;
  locations: Location[];
}

// Location interface (updated to match API response)
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

const LoadingOverlay = styled(Backdrop)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(8px)',
}));

const ModernLoader = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
    <Box sx={{ position: 'relative' }}>
      <CircularProgress size={60} thickness={4} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AnalyticsIcon sx={{ fontSize: 24, color: 'primary.main' }} />
      </Box>
    </Box>
    <Typography variant="h6" sx={{ fontWeight: 500 }}>
      Processing Data...
    </Typography>
    <Typography variant="body2" color="text.secondary">
      Analyzing your Excel data and generating insights
    </Typography>
  </Box>
);

// API URLs (updated to use company-locations/all endpoint)
const API_URL = API_URL_Local + '/api/excel/upload';
const FILTER_API_URL = API_URL_Local + '/api/salessplit/filter';
const COMPANY_LOCATIONS_API_URL = API_URL_Local + '/company-locations/all';

// Main Component
export function ExcelImport() {
  // UPDATED: Use both Redux dispatches
  const dispatch = useAppDispatch();
  const reduxDispatch = useDispatch();
  
  // Get state from Excel Redux slice
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
    location: currentLocation,
    salesWideFiles,
    salesWideLocations,
    currentSalesWideLocation
  } = useAppSelector((state) => state.excel);
  
  const salesFilters = useAppSelector(selectSalesFilters);
  const currentCompanyId = useAppSelector(selectCompanyId);
  
  // UPDATED: Get current selections from Redux (masterFileSlice)
  const selectedCompanies = useSelector(selectSelectedCompanies);
  const selectedLocations = useSelector(selectSelectedLocations);
  
  // UPDATED: Convert to single values for dropdowns (using new API structure)
  const selectedCompany = selectedCompanies.length > 0 ? selectedCompanies[0] : '';
  const selectedLocation = selectedLocations.length > 0 ? selectedLocations[0] : '';
  
  // State for API data (simplified to single companies array)
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
  const [file, setFile] = React.useState<File | null>(null);
  const [error, setLocalError] = React.useState<string>('');
  const [salesSplitTab, setSalesSplitTab] = React.useState<number>(0);
  const [tableTab, setTableTab] = React.useState<number>(0);
  const [viewMode, setViewMode] = React.useState<string>('tabs');
  const [showTutorial, setShowTutorial] = React.useState<boolean>(false);
  const [isLocationDialogOpen, setIsLocationDialogOpen] = React.useState<boolean>(false);
  const [locationInput, setLocationInput] = React.useState<string>('');
  const [locationError, setLocationError] = React.useState<string>('');
  const [showSuccessNotification, setShowSuccessNotification] = React.useState<boolean>(false);
  const [chartKey, setChartKey] = React.useState<number>(0);
  
  // Date and filter state
  const [startDate, setStartDate] = React.useState<string>('');
  const [endDate, setEndDate] = React.useState<string>('');
  const [dateRangeType, setDateRangeType] = React.useState<string>('');
  const [availableDateRanges, setAvailableDateRanges] = React.useState<string[]>([]);
  const [customDateRange, setCustomDateRange] = React.useState<boolean>(false);
  const [isWaitingForBackendResponse, setIsWaitingForBackendResponse] = React.useState<boolean>(false);
  const [hasValidData, setHasValidData] = React.useState<boolean>(false);
  
  // Loading states
  const [isLoadingData, setIsLoadingData] = React.useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = React.useState<number>(0);
  const [loadingMessage, setLoadingMessage] = React.useState<string>('');

  // UPDATED: Fetch company-locations data on component mount
  React.useEffect(() => {
    const fetchCompanyLocations = async () => {
      setCompaniesLoading(true);
      setCompaniesError("");
      
      try {
        console.log('🏢 ExcelImport: Fetching company-locations from:', COMPANY_LOCATIONS_API_URL);
        const response = await axios.get(COMPANY_LOCATIONS_API_URL);
        
        console.log('📥 ExcelImport: Company-locations response:', response.data);
        setCompanies(response.data || []);
        
        // Auto-select the first company if there's only one and none is selected
        if (response.data && response.data.length === 1 && selectedCompanies.length === 0) {
          reduxDispatch(setSelectedCompanies([response.data[0].company_id.toString()]));
          console.log('🎯 ExcelImport: Auto-selected single company:', response.data[0]);
        }
        
      } catch (error) {
        console.error('❌ ExcelImport: Error fetching company-locations:', error);
        
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

  // UPDATED: Auto-select first location when company changes and has only one location
  React.useEffect(() => {
    if (selectedCompany && availableLocations.length === 1 && selectedLocations.length === 0) {
      reduxDispatch(setSelectedLocations([availableLocations[0].location_id.toString()]));
      console.log('🎯 ExcelImport: Auto-selected single location:', availableLocations[0]);
    }
  }, [selectedCompany, availableLocations, selectedLocations.length, reduxDispatch]);

  // UPDATED: Sync with currentCompanyId from Excel slice if it exists
  React.useEffect(() => {
    if (currentCompanyId && selectedCompanies.length === 0) {
      console.log('🏢 ExcelImport: Syncing company ID from Excel Redux:', currentCompanyId);
      reduxDispatch(setSelectedCompanies([currentCompanyId]));
    }
  }, [currentCompanyId, selectedCompanies.length, reduxDispatch]);

  // UPDATED: Handle company selection change (updated for new API structure)
  const handleCompanyChange = (event: SelectChangeEvent) => {
    const companyId = event.target.value;
    console.log('🏢 ExcelImport: Company selection changed to:', companyId);
    
    // Update Redux state with array format
    reduxDispatch(setSelectedCompanies([companyId]));
    
    // Clear locations when company changes (as per requirements)
    reduxDispatch(setSelectedLocations([]));
    
    console.log('🏢 ExcelImport: Cleared locations due to company change');
  };

  // UPDATED: Handle location selection change (new method for location dropdown)
  const handleLocationChange = (event: SelectChangeEvent) => {
    const locationId = event.target.value;
    console.log('📍 ExcelImport: Location selection changed to:', locationId);
    
    // Update Redux state with array format
    reduxDispatch(setSelectedLocations([locationId]));
  };

  // Get selected company and location names for display (updated for new API structure)
  const selectedCompanyName = companies.find(c => c.company_id.toString() === selectedCompany)?.company_name || 
                               (selectedCompany ? `Company ID: ${selectedCompany}` : 'No Company Selected');
  
  const selectedLocationName = availableLocations.find(l => l.location_id.toString() === selectedLocation)?.location_name || 
                                (selectedLocation ? `Location ID: ${selectedLocation}` : 'No Location Selected');

  // Get active company ID
  const activeCompanyId = selectedCompany || currentCompanyId;

  // Log changes for debugging
  React.useEffect(() => {
    console.log('🏢 ExcelImport: Redux state updated:', {
      selectedCompanies,
      selectedLocations,
      selectedCompany,
      activeCompanyId
    });
  }, [selectedCompanies, selectedLocations, selectedCompany, activeCompanyId]);

  // Set file processed notification when tableData changes
  React.useEffect(() => {
    if (fileProcessed && reduxTableData && Object.keys(reduxTableData).length > 0) {
      console.log('✅ Data processed successfully, setting hasValidData to true');
      setHasValidData(true);
      setIsWaitingForBackendResponse(false);
      setShowSuccessNotification(true);
      setChartKey(prevKey => prevKey + 1);
    }
  }, [fileProcessed, reduxTableData]);

  // Update available date ranges when data changes
  React.useEffect(() => {
    if (reduxTableData && reduxTableData.dateRanges && reduxTableData.dateRanges.length > 0) {
      setAvailableDateRanges(reduxTableData.dateRanges);
      
      if (!dateRangeType && reduxTableData.dateRanges.length > 0) {
        setDateRangeType(reduxTableData.dateRanges[0]);
      }
    }
  }, [reduxTableData, dateRangeType]);

  React.useEffect(() => {
    if (dateRangeType === 'Custom Date Range') {
      setCustomDateRange(true);
    } else {
      setCustomDateRange(false);
    }
  }, [dateRangeType]);

  // Handle tab changes
  const handleSalesSplitTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSalesSplitTab(newValue);
  };

  const handleTableTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTableTab(newValue);
  };

  // Handle date range type change
  const handleDateRangeChange = (event: SelectChangeEvent) => {
    const newDateRange = event.target.value;
    setDateRangeType(newDateRange);
    setChartKey(prevKey => prevKey + 1);
  };

  // UPDATED: Enhanced handleApplyFiltersWithDates with full backend integration
  const handleApplyFiltersWithDates = (
    explicitStartDate: string, 
    explicitEndDate: string, 
    categories: string[],
    selectedFilterLocations: string[]
  ) => {
    console.log('🎯 ExcelImport: Applying filters with Redux state:', {
      startDate: explicitStartDate,
      endDate: explicitEndDate,
      categories,
      selectedFilterLocations,
      activeCompanyId
    });

    // Check if we have any files loaded
    if (!files || files.length === 0) {
      setLocalError('No files uploaded. Please upload Excel files first.');
      return;
    }

    // Handle multiple locations - find files for all selected locations
    const filesForLocations = selectedFilterLocations.map(location => {
      const file = files.find(f => f.location === location);
      if (!file) {
        console.warn(`No file found for location: ${location}`);
      }
      return { location, file };
    }).filter(item => item.file !== undefined);

    if (filesForLocations.length === 0) {
      setLocalError(`No files found for selected locations: ${selectedFilterLocations.join(', ')}`);
      return;
    }

    // Use the first file for the request
    const primaryFile = filesForLocations[0].file!;

    try {
      console.log('🔄 Starting backend request with Redux state');
      setIsWaitingForBackendResponse(true);
      setHasValidData(false);
      
      dispatch(setLoading(true));
      dispatch(setError(null));
      setLocalError('');
      
      // Update Redux state with the first selected location for backward compatibility
      dispatch(selectLocation(selectedFilterLocations[0]));
      
      // Format dates correctly for API
      let formattedStartDate: string | null = null;
      let formattedEndDate: string | null = null;
      
      if (explicitStartDate) {
        const dateParts = explicitStartDate.split('/');
        if (dateParts.length === 3) {
          formattedStartDate = `${dateParts[2]}-${dateParts[0].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}`;
        }
      }
      
      if (explicitEndDate) {
        const dateParts = explicitEndDate.split('/');
        if (dateParts.length === 3) {
          formattedEndDate = `${dateParts[2]}-${dateParts[0].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}`;
        }
      }

      console.log('📅 Formatted dates for API:', {
        original: { start: explicitStartDate, end: explicitEndDate },
        formatted: { start: formattedStartDate, end: formattedEndDate }
      });
      
      // Prepare filter data with Redux state
      const filterData = {
        fileName: primaryFile.fileName,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        // Send ALL selected locations as an array
        locations: selectedFilterLocations,
        // Keep single location for backward compatibility
        location: selectedFilterLocations[0] || null,
        dateRangeType: 'Custom Date Range',
        selectedCategories: categories,
        categories: categories.join(','),
        // Use Redux company_id
        company_id: activeCompanyId,
        // Additional metadata for multiple location handling
        multipleLocations: selectedFilterLocations.length > 1,
        allFileNames: filesForLocations.map(item => item.file!.fileName)
      };
      
      console.log('📤 Sending filter request with Redux state:', filterData);
      
      // Call filter API
      axios.post(FILTER_API_URL, filterData)
        .then(response => {
          console.log('📥 Received filter response:', response.data);
          
          if (response.data) {
            // Update Redux state with new data
            dispatch(setTableData(response.data));
            
            setLocalError('');
            setChartKey(prevKey => prevKey + 1);
            
            // Update local state with the values that were actually sent
            setStartDate(explicitStartDate);
            setEndDate(explicitEndDate);
            setDateRangeType('Custom Date Range');
            
            // Mark that we have valid data
            setHasValidData(true);
            setIsWaitingForBackendResponse(false);
            
            console.log('✅ Filter applied successfully with Redux state:', selectedFilterLocations);
          } else {
            throw new Error('Invalid response data');
          }
        })
        .catch(err => {
          console.error('❌ Filter error:', err);
          
          setIsWaitingForBackendResponse(false);
          setHasValidData(false);
          
          let errorMessage = 'Error filtering data';
          if (axios.isAxiosError(err)) {
            if (err.response) {
              const detail = err.response.data?.detail;
              errorMessage = `Server error: ${detail || err.response.status}`;
              
              if (detail && typeof detail === 'string' && detail.includes('isinf')) {
                errorMessage = 'Backend error: Please update the backend code to use numpy.isinf instead of pandas.isinf';
              } else if (err.response.status === 404) {
                errorMessage = 'API endpoint not found. Is the server running?';
              }
            } else if (err.request) {
              errorMessage = 'No response from server. Please check if the backend is running.';
            }
          }
          
          setLocalError(errorMessage);
          dispatch(setError(errorMessage));
        })
        .finally(() => {
          dispatch(setLoading(false));
        });
      
    } catch (err: any) {
      console.error('Filter error:', err);
      setIsWaitingForBackendResponse(false);
      setHasValidData(false);
      
      const errorMessage = 'Error applying filters: ' + (err.message || 'Unknown error');
      setLocalError(errorMessage);
      dispatch(setError(errorMessage));
      dispatch(setLoading(false));
    }
  };

  // UPDATED: Legacy method with full backend integration for backward compatibility
  const handleApplyFilters = (location = selectedLocation, dateRange = dateRangeType) => {
    console.log('⚠️ ExcelImport: Using legacy handleApplyFilters with Redux state');
    
    // Check if we have any files loaded
    if (!files || files.length === 0) {
      setLocalError('No files uploaded. Please upload Excel files first.');
      return;
    }
    
    // Find the file for the selected location
    const fileForLocation = files.find(f => f.location === location);
    
    if (!fileForLocation) {
      setLocalError(`No file found for location: ${location}`);
      return;
    }

    try {
      setIsWaitingForBackendResponse(true);
      setHasValidData(false);
      
      dispatch(setLoading(true));
      dispatch(setError(null));
      setLocalError('');
      
      // Update Redux state with the new location
      dispatch(selectLocation(location));
      
      // Format dates correctly for API
      let formattedStartDate: string | null = null;
      let formattedEndDate: string | null = null;
      
      if (dateRange === 'Custom Date Range' && startDate) {
        const dateParts = startDate.split('/');
        if (dateParts.length === 3) {
          formattedStartDate = `${dateParts[2]}-${dateParts[0].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}`;
        }
      }
      
      if (dateRange === 'Custom Date Range' && endDate) {
        const dateParts = endDate.split('/');
        if (dateParts.length === 3) {
          formattedEndDate = `${dateParts[2]}-${dateParts[0].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}`;
        }
      }
      
      const selectedCategories = salesFilters?.selectedCategories || [];
      
      // Include Redux company_id in legacy filter data
      const filterData = {
        fileName: fileForLocation.fileName,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        location: location || null,
        dateRangeType: dateRange,
        selectedCategories: selectedCategories,
        categories: selectedCategories.join(','),
        company_id: activeCompanyId
      };
      
      console.log('📤 Sending filter request (legacy) with Redux state:', filterData);
      
      // Call filter API
      axios.post(FILTER_API_URL, filterData)
        .then(response => {
          console.log('📥 Received filter response:', response.data);
          
          if (response.data) {
            dispatch(setTableData(response.data));
            setLocalError('');
            setChartKey(prevKey => prevKey + 1);
            setHasValidData(true);
            setIsWaitingForBackendResponse(false);
            
            console.log('✅ Filter applied successfully (legacy) with Redux state');
          } else {
            throw new Error('Invalid response data');
          }
        })
        .catch(err => {
          console.error('❌ Filter error:', err);
          
          setIsWaitingForBackendResponse(false);
          setHasValidData(false);
          
          let errorMessage = 'Error filtering data';
          if (axios.isAxiosError(err)) {
            if (err.response) {
              const detail = err.response.data?.detail;
              errorMessage = `Server error: ${detail || err.response.status}`;
              
              if (detail && typeof detail === 'string' && detail.includes('isinf')) {
                errorMessage = 'Backend error: Please update the backend code to use numpy.isinf instead of pandas.isinf';
              } else if (err.response.status === 404) {
                errorMessage = 'API endpoint not found. Is the server running?';
              }
            } else if (err.request) {
              errorMessage = 'No response from server. Please check if the backend is running.';
            }
          }
          
          setLocalError(errorMessage);
          dispatch(setError(errorMessage));
        })
        .finally(() => {
          dispatch(setLoading(false));
        });
      
    } catch (err: any) {
      console.error('Filter error:', err);
      setIsWaitingForBackendResponse(false);
      setHasValidData(false);
      
      const errorMessage = 'Error applying filters: ' + (err.message || 'Unknown error');
      setLocalError(errorMessage);
      dispatch(setError(errorMessage));
      dispatch(setLoading(false));
    }
  };

  // Handle date input changes
  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(event.target.value);
  };

  // Handle file selection redirect
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    window.location.href = '/upload-excel';
  };

  // Convert file to base64
  const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

  // UPDATED: Upload function with Redux state
  const handleUpload = async (locationName?: string) => {
    if (!file) {
      setLocalError('Please select a file first');
      return;
    }

    try {
      setIsLoadingData(true);
      setLoadingMessage('Uploading file...');
      
      dispatch(setLoading(true));
      dispatch(setError(null));
      setLocalError('');
      
      const base64File = await toBase64(file);
      const base64Content = base64File.split(',')[1];
      
      setLoadingMessage('Processing Excel data...');
      
      // Include Redux state in setExcelFile dispatch
      dispatch(setExcelFile({
        fileName: file.name,
        fileContent: base64Content,
        location: locationName,
        company_id: activeCompanyId
      }));
      
      // Include Redux state in upload payload
      const uploadPayload = {
        fileName: file.name,
        fileContent: base64Content,
        location: locationName,
        company_id: activeCompanyId
      };
      
      console.log('📤 Uploading file with Redux state:', {
        company_id: activeCompanyId
      });
      
      const response = await axios.post(API_URL, uploadPayload);
      
      console.log('📥 Received upload response:', response.data);
      setLoadingMessage('Generating insights...');
      
      if (response.data) {
        if (locationName) {
          dispatch(addFileData({
            fileName: file.name,
            fileContent: base64Content,
            location: locationName,
            data: response.data,
            company_id: activeCompanyId
          }));
          
          dispatch(setLocations(locationName ? [locationName] : response.data.locations || []));
        }
        
        dispatch(setTableData(response.data));
        setShowSuccessNotification(true);
        setHasValidData(true);
        
        if (locationName) {
          dispatch(selectLocation(locationName));
        } else if (response.data.locations && response.data.locations.length > 0) {
          dispatch(selectLocation(response.data.locations[0]));
        }
        
        if (response.data.dateRanges && response.data.dateRanges.length > 0) {
          setAvailableDateRanges(response.data.dateRanges);
          setDateRangeType(response.data.dateRanges[0]);
        }
        
        setChartKey(prevKey => prevKey + 1);
        setLoadingMessage('Complete!');
        
        setTimeout(() => {
          setIsLoadingData(false);
        }, 500);
      } else {
        throw new Error('Invalid response data');
      }
      
    } catch (err: any) {
      console.error('Upload error:', err);
      setIsLoadingData(false);
      setHasValidData(false);
      
      let errorMessage = 'Error processing file';
      
      if (axios.isAxiosError(err)) {
        if (err.response) {
          const detail = err.response.data?.detail;
          errorMessage = `Server error: ${detail || err.response.status}`;
        } else if (err.request) {
          errorMessage = 'No response from server. Please check if the backend is running.';
        }
      } else if (err.message) {
        errorMessage = `Error: ${err.message}`;
      }
      
      setLocalError(errorMessage);
      dispatch(setError(errorMessage));
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Helper function to determine if we should show data
  const shouldShowData = () => {
    return hasValidData && !isWaitingForBackendResponse && reduxTableData && Object.keys(reduxTableData).length > 0;
  };

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

            {/* Company and Location Info Display */}
            {(activeCompanyId || selectedLocation) && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                flexWrap: 'wrap',
                gap: 1,
                mt: 2,
                mb: 1 
              }}>
                {activeCompanyId && (
                  <CompanyInfoChip
                    icon={<BusinessIcon />}
                    label={`Company: ${selectedCompanyName}`}
                    variant="outlined"
                  />
                )}
                {selectedLocation && (
                  <CompanyInfoChip
                    icon={<BusinessIcon />}
                    label={`Location: ${selectedLocationName}`}
                    variant="outlined"
                  />
                )}
              </Box>
            )}
          </div>
        </Box>

        {/* Company and Location Selection Section */}
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
                Company & Location Selection
              </Typography>
              {companiesLoading && <CircularProgress size={20} />}
            </Box>
            
            {/* Error display */}
            {companiesError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {companiesError}
              </Alert>
            )}
            
            <Grid container spacing={2}>
              {/* Company Selection */}
              <Grid item xs={12} md={6}>
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
              </Grid>

              {/* Location Selection */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small" disabled={!selectedCompany || availableLocations.length === 0}>
                  <InputLabel>Location</InputLabel>
                  <Select
                    value={selectedLocation}
                    label="Location"
                    onChange={handleLocationChange}
                    displayEmpty
                  >
                    <MenuItem value="">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                        <BusinessIcon fontSize="small" />
                        {!selectedCompany 
                          ? 'Select Company First' 
                          : availableLocations.length === 0 
                            ? 'No Locations Available'
                            : 'Select Location'
                        }
                      </Box>
                    </MenuItem>
                    {availableLocations.map((location) => (
                      <MenuItem key={location.location_id} value={location.location_id.toString()}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BusinessIcon fontSize="small" color="secondary" />
                          {location.location_name}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            {/* Selection Summary */}
            {(selectedCompany || selectedLocation) && (
              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {selectedCompany && (
                  <Chip
                    icon={<BusinessIcon />}
                    label={`Company: ${selectedCompanyName}`}
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 500 }}
                  />
                )}
                {selectedLocation && (
                  <Chip
                    icon={<BusinessIcon />}
                    label={`Location: ${selectedLocationName}`}
                    color="secondary"
                    variant="outlined"
                    sx={{ fontWeight: 500 }}
                  />
                )}
              </Box>
            )}
            
            {/* Location count info */}
            {selectedCompany && availableLocations.length > 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>{selectedCompanyName}</strong> has {availableLocations.length} location{availableLocations.length > 1 ? 's' : ''} available.
                  {availableLocations.length === 1 && ' Location auto-selected.'}
                </Typography>
              </Alert>
            )}
            
            {/* Redux state info */}
            <Alert severity="success" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Redux State:</strong> Companies: [{selectedCompanies.join(', ')}] | Locations: [{selectedLocations.join(', ')}]
              </Typography>
            </Alert>
          </CardContent>
        </CleanCard>

        {/* Status Card */}
        <CleanCard sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={2}>
            {files.length === 0 ? (
              <Grid item xs={12}>
                <Paper sx={{ textAlign: 'center', py: 6, p: 3 }}>
                  <CloudUploadIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h5" color="text.secondary" gutterBottom fontWeight={600}>
                    Ready to Analyze Your Data
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Upload your Excel files to get started with powerful sales insights
                  </Typography>
                  {/* Show company and location selection status */}
                  {(selectedCompany || selectedLocation) && (
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1 }}>
                      {selectedCompany && (
                        <CompanyInfoChip
                          icon={<BusinessIcon />}
                          label={`Company: ${selectedCompanyName}`}
                          size="small"
                        />
                      )}
                      {selectedLocation && (
                        <CompanyInfoChip
                          icon={<BusinessIcon />}
                          label={`Location: ${selectedLocationName}`}
                          size="small"
                        />
                      )}
                    </Box>
                  )}
                  <Button 
                    variant="contained" 
                    size="large"
                    onClick={() => window.location.href = '/upload-excel'}
                    startIcon={<CloudUploadIcon />}
                    sx={{ 
                      mt: 2,
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
                    }}
                  >
                    Upload Files
                  </Button>
                </Paper>
              </Grid>
            ) : (
              <>
                {/* Filter Section */}
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
                    locations={salesLocations} // Legacy fallback
                    selectedLocation={selectedLocation}
                    onLocationChange={() => {}} // Legacy fallback
                    onApplyFilters={handleApplyFilters}
                    onApplyFiltersWithDates={handleApplyFiltersWithDates}
                    // NEW: Redux integration props
                    availableLocationObjects={availableLocations}
                    selectedCompanyId={selectedCompany}
                    reduxSelectedLocations={selectedLocations}
                    onReduxLocationChange={(locationIds: string[]) => {
                      console.log('📍 ExcelImport: Received location change from FilterSection:', locationIds);
                      reduxDispatch(setSelectedLocations(locationIds));
                    }}
                  />
                </Grid>
              </>
            )}
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

          {/* Show loading state when waiting for backend response */}
          {isWaitingForBackendResponse && (
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
                Please wait while we fetch the latest data from the backend.
                <br />
                <small>Company: {selectedCompanyName} | Location: {selectedLocationName}</small>
              </Alert>
            </Fade>
          )}
        </CleanCard>

        {/* Main Dashboard */}
        {files.length > 0 && (
          <CleanCard sx={{ borderRadius: 2, mb: 3, overflow: 'hidden' }}>
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
                  ) : isWaitingForBackendResponse ? (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <CircularProgress size={40} sx={{ mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        Loading data...
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Company: {selectedCompanyName} | Location: {selectedLocationName}
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 2 }} />
                      <Skeleton variant="text" width="60%" />
                      <Skeleton variant="text" width="40%" />
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
                          {(activeCompanyId || selectedLocation) && (
                            <Box sx={{ ml: 2, display: 'flex', gap: 1 }}>
                              {activeCompanyId && (
                                <CompanyInfoChip
                                  icon={<BusinessIcon />}
                                  label={`${selectedCompanyName}`}
                                  size="small"
                                />
                              )}
                              {selectedLocation && (
                                <CompanyInfoChip
                                  icon={<BusinessIcon />}
                                  label={`${selectedLocationName}`}
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

                        <Typography variant="body1" color="text.secondary">
                          More detailed analysis components would go here...
                        </Typography>
                      </Box>
                    </Fade>
                  ) : isWaitingForBackendResponse ? (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <CircularProgress size={40} sx={{ mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        Loading detailed analysis...
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Company: {selectedCompanyName} | Location: {selectedLocationName}
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No detailed data available
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Upload files or apply filters to see detailed analysis
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </div>
          </CleanCard>
        )}
      </Box>

      {/* Loading Overlay */}
      {(isLoadingData || reduxLoading) && (
        <LoadingOverlay open={true}>
          <ModernLoader />
        </LoadingOverlay>
      )}

      {/* Success notification */}
      <Snackbar
        open={showSuccessNotification}
        autoHideDuration={5000}
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
          Excel file processed successfully and insights generated.
        </Alert>
      </Snackbar>
    </>
  );
}

export default ExcelImport;
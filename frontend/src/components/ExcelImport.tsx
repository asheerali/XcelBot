import React, { useState, useEffect } from 'react';
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
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';

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
const API_URL = 'http://localhost:8000/api/excel/upload';
const FILTER_API_URL = 'http://localhost:8000/api/excel/filter';

// Define types
interface TableData {
  table1: any[];
  table2: any[];
  table3: any[];
  table5: any[];
  locations: string[];
  dateRanges: string[];
  [key: string]: any;
}

interface FileData {
  fileName: string;
  location: string;
  data: TableData;
}

// Main Component
export function ExcelImport() {
  // Get state from Redux
  const { 
    fileName, 
    fileContent, 
    loading: reduxLoading, 
    error: reduxError, 
    tableData: reduxTableData,
    fileProcessed,
    allLocations,
    files
  } = useAppSelector((state) => state.excel);
  
  const dispatch = useAppDispatch();
  
  // Local state
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<number>(0);
  const [viewMode, setViewMode] = useState<string>('tabs'); // 'tabs', 'combined', or 'row'
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  
  // Location dialog state
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
  
  // Set file processed notification when tableData changes
  useEffect(() => {
    if (fileProcessed) {
      setShowSuccessNotification(true);
      // Force re-render of chart component when data is processed
      setChartKey(prevKey => prevKey + 1);
    }
  }, [fileProcessed]);
  
  // Update available date ranges when data changes
  useEffect(() => {
    if (reduxTableData && reduxTableData.dateRanges && reduxTableData.dateRanges.length > 0) {
      setAvailableDateRanges(reduxTableData.dateRanges);
      
      // Set default date range if not already set
      if (!dateRangeType && reduxTableData.dateRanges.length > 0) {
        setDateRangeType(reduxTableData.dateRanges[0]);
      }
      
      // Set location if available from redux state
      if (allLocations && allLocations.length > 0 && !selectedLocation) {
        setSelectedLocation(allLocations[0]);
        dispatch(selectLocation(allLocations[0]));
      }
    }
  }, [reduxTableData, dateRangeType, selectedLocation, allLocations, dispatch]);

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
  };

  // Handle date range type change
  const handleDateRangeChange = (event: SelectChangeEvent) => {
    const newDateRange = event.target.value;
    setDateRangeType(newDateRange);
    
    // Apply filters with new date range
    handleApplyFilters(selectedLocation, newDateRange);
    
    // Force re-render of chart component when filters change
    setChartKey(prevKey => prevKey + 1);
  };

  // Apply filters
  const handleApplyFilters = (location = selectedLocation, dateRange = dateRangeType) => {
    if (!fileProcessed && !file) {
      setError('Please upload a file first.');
      return;
    }

    try {
      // Use explicit action objects instead of potentially undefined action creators
      dispatch({ type: 'excel/setLoading', payload: true });
      dispatch({ type: 'excel/setError', payload: null });
      
      // Format dates correctly for API
      let formattedStartDate: string | null = null;
      let formattedEndDate: string | null = null;
      
      if (dateRange === 'Custom Date Range' && startDate) {
        // Ensure date is in YYYY-MM-DD format for the backend
        formattedStartDate = startDate;
      }
      
      if (dateRange === 'Custom Date Range' && endDate) {
        // Ensure date is in YYYY-MM-DD format for the backend
        formattedEndDate = endDate;
      }
      
      // Get the current file name for the selected location
      let currentFileName = fileName;
      
      // If we have files in the redux store, find the file for this location
      if (files && files.length > 0) {
        const fileForLocation = files.find(f => f.location === location);
        if (fileForLocation) {
          currentFileName = fileForLocation.fileName;
        }
      }
      
      // Prepare filter data
      const filterData = {
        fileName: currentFileName,
        fileContent: fileContent, // Include file content in case the server needs it
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

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile);
        setError('');
        
        // Open the location dialog
        setLocationInput('');
        setLocationError('');
        setIsLocationDialogOpen(true);
      } else {
        setError('Please select an Excel file (.xlsx or .xls)');
        setFile(null);
      }
    }
  };

  // Handle tab changes
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Handle date input changes
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
      return;
    }

    try {
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
          dispatch(selectLocation(locationName));
        } else if (response.data.locations && response.data.locations.length > 0) {
          setSelectedLocation(response.data.locations[0]);
          dispatch(selectLocation(response.data.locations[0]));
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
    }
  };

  // Handle success notification close without affecting data processing state
  const handleSuccessNotificationClose = () => {
    setShowSuccessNotification(false);
    // But dataProcessed remains true in Redux
  };

  // Success notification - decoupled from dataProcessed state
  const renderSuccessMessage = () => (
    <Snackbar
      open={showSuccessNotification}
      autoHideDuration={5000}
      onClose={handleSuccessNotificationClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert 
        onClose={handleSuccessNotificationClose} 
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
        <Typography variant="h4" gutterBottom>
          Sales Analysis Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Upload an Excel file to analyze sales data across different categories
        </Typography>
      </Box>

      {/* Excel Upload Card */}
      <Card sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2}>
          {/* File upload button and location dialog */}
          <Grid item xs={12} sm={6} md={3}>
            <input
              type="file"
              id="excel-upload"
              accept=".xlsx, .xls"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <label htmlFor="excel-upload">
              <Button
                variant="contained"
                component="span"
                fullWidth
                disabled={reduxLoading}
              >
                {reduxLoading ? <CircularProgress size={24} /> : 'Choose Excel File'}
              </Button>
            </label>
            {fileName && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Selected file: {fileName}
              </Typography>
            )}
            {renderLocationDialog()}
          </Grid>
          
          {/* File name display */}
          {fileName && (
            <Grid item xs={12}>
              <Typography variant="body2">
                Current file: {fileName}
                {selectedLocation && ` (Location: ${selectedLocation})`}
              </Typography>
            </Grid>
          )}
          
          {/* Filter section */}
          <Grid item xs={12} sx={{ mt: 1 }}>
            <FilterSection 
              dateRangeType={dateRangeType}
              availableDateRanges={availableDateRanges}
              onDateRangeChange={handleDateRangeChange}
              customDateRange={customDateRange}
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={handleStartDateChange}
              onEndDateChange={handleEndDateChange}
              locations={allLocations || []}
              selectedLocation={selectedLocation}
              onLocationChange={handleLocationChange}
              onApplyFilters={() => handleApplyFilters()}
            />
          </Grid>
        </Grid>
        
        {/* Error Alert */}
        {(error || reduxError) && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error || reduxError}
          </Alert>
        )}
      </Card>

      {/* CHART COMPONENT - Always visible when data is processed */}
      {fileProcessed && (
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
              dateRangeType={dateRangeType}
              selectedLocation={selectedLocation}
              height={200} // Reduced height to make charts more compact
            />
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

      {/* Add Delivery Percentage Chart after the table display */}
      {fileProcessed && reduxTableData.table1 && reduxTableData.table1.length > 0 && (
        <Card sx={{ mb: 3, p: 2 }}>
          {/* <Typography variant="h6" gutterBottom>Delivery Percentages</Typography> */}
          <Divider sx={{ mb: 1 }} />
          <DeliveryPercentageChart tableData={reduxTableData} height={200} />
        </Card>
      )}

      {/* Add In-House Percentage Chart after the Delivery Percentage Chart */}
      {fileProcessed && reduxTableData.table1 && reduxTableData.table1.length > 0 && (
        <Card sx={{ mb: 3, p: 2 }}>
          {/* <Typography variant="h6" gutterBottom>In-House Percentages</Typography> */}
          <Divider sx={{ mb: 1 }} />
          <InHousePercentageChart tableData={reduxTableData} height={200} />
        </Card>
      )}
      
      {/* Add Catering Percentage Chart after the In-House Percentage Chart */}
      {fileProcessed && reduxTableData.table1 && reduxTableData.table1.length > 0 && (
        <Card sx={{ mb: 3, p: 2 }}>
          {/* <Typography variant="h6" gutterBottom>Catering Percentages</Typography> */}
          <Divider sx={{ mb: 1 }} />
          <CateringPercentageChart tableData={reduxTableData} height={200} />
        </Card>
      )}
      
      {/* Add Total Sales Chart before other percentage charts */}
      {fileProcessed && reduxTableData.table1 && reduxTableData.table1.length > 0 && (
        <Card sx={{ mb: 3, p: 2 }}>
          {/* <Typography variant="h6" gutterBottom>Total Sales</Typography> */}
          <Divider sx={{ mb: 1 }} />
          <TotalSalesChart tableData={reduxTableData} height={200} />
        </Card>
      )}

      {/* Add WOW Trends Chart after Total Sales Chart */}
      {fileProcessed && reduxTableData.table4 && reduxTableData.table4.length > 0 && (
        <Card sx={{ mb: 3, p: 2 }}>
          {/* <Typography variant="h6" gutterBottom>Week-over-Week Trends</Typography> */}
          <Divider sx={{ mb: 1 }} />
          <WowTrendsChart tableData={reduxTableData} height={200} />
        </Card>
      )}

      {renderTutorial()}
      {renderSuccessMessage()}
    </>
  );
}

export default ExcelImport;
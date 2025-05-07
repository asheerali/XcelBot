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

// Import components
import FilterSection from './FilterSection';
import TableDisplay from './TableDisplay';
import SalesCharts from './graphs/SalesCharts';
import DeliveryPercentageChart from './graphs/DeliveryPercentageChart';
import InHousePercentageChart from './graphs/InHousePercentageChart'; // Import the new In-House chart
import CateringPercentageChart from './graphs/CateringPercentageChart';
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

// Main Component
export function ExcelImport() {
  // Initial data structure
  const initialTableData: TableData = {
    table1: [], // Percentage Table (1P, Catering, DD, GH, In-House, UB)
    table2: [], // In-House Table (1P, In-House, Catering, DD, GH, UB)
    table3: [], // WOW Table (1P, In-House, Catering, DD, GH, UB, 3P, 1P/3P)
    table5: [], // Category summary
    locations: [], // List of available locations
    dateRanges: [] // List of available dates
  };
  
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<number>(0);
  const [tableData, setTableData] = useState<TableData>(initialTableData);
  const [viewMode, setViewMode] = useState<string>('tabs'); // 'tabs', 'combined', or 'row'
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  
  // Separate states for notification and data processing
  const [showSuccessNotification, setShowSuccessNotification] = useState<boolean>(false);
  const [dataProcessed, setDataProcessed] = useState<boolean>(false);
  
  const [showCharts, setShowCharts] = useState<boolean>(false);
  
  // State to force chart re-render
  const [chartKey, setChartKey] = useState<number>(0);
  
  // Date filter states
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [dateRangeType, setDateRangeType] = useState<string>('');
  const [availableDateRanges, setAvailableDateRanges] = useState<string[]>([]);
  const [customDateRange, setCustomDateRange] = useState<boolean>(false);
  
  // Update available date ranges when data changes
  useEffect(() => {
    if (tableData && tableData.dateRanges && tableData.dateRanges.length > 0) {
      setAvailableDateRanges(tableData.dateRanges);
      
      // Set default date range if not already set
      if (!dateRangeType && tableData.dateRanges.length > 0) {
        setDateRangeType(tableData.dateRanges[0]);
      }
    }
  }, [tableData.dateRanges, dateRangeType]);

  // Effect to handle custom date range selection
  useEffect(() => {
    if (dateRangeType === 'Custom Date Range') {
      setCustomDateRange(true);
    } else {
      setCustomDateRange(false);
    }
  }, [dateRangeType]);

  // Function to toggle between view modes
  const toggleViewMode = () => {
    setViewMode(prevMode => {
      if (prevMode === 'tabs') return 'combined';
      if (prevMode === 'combined') return 'row';
      return 'tabs';
    });
  };

  // Toggle charts view
  const toggleChartsView = () => {
    const newShowCharts = !showCharts;
    setShowCharts(newShowCharts);
    
    // Force re-render of chart component when showing
    if (newShowCharts) {
      setChartKey(prevKey => prevKey + 1);
    }
    
    // Store preference in localStorage
    try {
      localStorage.setItem('showCharts', newShowCharts ? 'true' : 'false');
    } catch (e) {
      console.error('Could not save chart preference to localStorage:', e);
    }
  };

  // Handle location change
  const handleLocationChange = (event: SelectChangeEvent) => {
    const newLocation = event.target.value;
    setSelectedLocation(newLocation);
    
    // Apply filters with new location
    handleApplyFilters(newLocation, dateRangeType);
    
    // Force re-render of chart component when filters change
    if (showCharts) {
      setChartKey(prevKey => prevKey + 1);
    }
  };

  // Handle date range type change
  const handleDateRangeChange = (event: SelectChangeEvent) => {
    const newDateRange = event.target.value;
    setDateRangeType(newDateRange);
    
    // Apply filters with new date range
    handleApplyFilters(selectedLocation, newDateRange);
    
    // Force re-render of chart component when filters change
    if (showCharts) {
      setChartKey(prevKey => prevKey + 1);
    }
  };

  // Apply filters
  const handleApplyFilters = (location = selectedLocation, dateRange = dateRangeType) => {
    if (!dataProcessed && !file) {
      setError('Please upload a file first.');
      return;
    }

    try {
      setLoading(true);
      
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
      
      // Prepare filter data
      const filterData = {
        fileName: fileName,
        fileContent: null, // We'll reuse the already uploaded file on the server
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
            setTableData(response.data);
            setDataProcessed(true);
            setError(''); // Clear any previous errors
            
            // Force re-render of chart component when data changes
            if (showCharts) {
              setChartKey(prevKey => prevKey + 1);
            }
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
        })
        .finally(() => {
          setLoading(false);
        });
      
    } catch (err: any) {
      console.error('Filter error:', err);
      setError('Error applying filters: ' + (err.message || 'Unknown error'));
      setLoading(false);
    }
  };

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile);
        setFileName(selectedFile.name);
        setError('');
      } else {
        setError('Please select an Excel file (.xlsx or .xls)');
        setFile(null);
        setFileName('');
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

  // Upload and process file
  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    try {
      setLoading(true);
      setError(''); // Clear any previous errors
      
      // Convert file to base64
      const base64File = await toBase64(file);
      const base64Content = base64File.split(',')[1]; // Remove data:application/... prefix
      
      // Send to backend
      const response = await axios.post(API_URL, {
        fileName: fileName,
        fileContent: base64Content
      });
      
      // Update table data with response
      if (response.data) {
        setTableData(response.data);
        setDataProcessed(true);  // Data is processed successfully
        setShowSuccessNotification(true);  // Show notification
        
        // Set location if available
        if (response.data.locations && response.data.locations.length > 0) {
          setSelectedLocation(response.data.locations[0]);
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
        
        // Show charts after successful upload based on previous preference
        const savedPreference = localStorage.getItem('showCharts');
        if (savedPreference !== 'false') {
          setShowCharts(true);
          // Force re-render of chart component
          setChartKey(prevKey => prevKey + 1);
        }
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
      setDataProcessed(false);
    } finally {
      setLoading(false);
    }
  };

  // Handle success notification close without affecting data processing state
  const handleSuccessNotificationClose = () => {
    setShowSuccessNotification(false);
    // But dataProcessed remains true
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

      <Card sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
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
              >
                Choose Excel File
              </Button>
            </label>
            {fileName && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Selected file: {fileName}
              </Typography>
            )}
          </Grid>
          
          {/* Filter Section Component */}
          <FilterSection 
            dateRangeType={dateRangeType}
            availableDateRanges={availableDateRanges}
            onDateRangeChange={handleDateRangeChange}
            customDateRange={customDateRange}
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={handleStartDateChange}
            onEndDateChange={handleEndDateChange}
            locations={tableData.locations}
            selectedLocation={selectedLocation}
            onLocationChange={handleLocationChange}
            onApplyFilters={() => handleApplyFilters()}
          />
          
          {/* Upload Button */}
          <Grid item xs={12} md={customDateRange ? 3 : (tableData.locations && tableData.locations.length > 0 ? 3 : 6)} 
                sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={toggleViewMode}
              sx={{ flex: 1 }}
              disabled={loading}
            >
              {viewMode === 'tabs' ? 'View Stacked' : 
               viewMode === 'combined' ? 'View Side-by-Side' : 'View Tabbed'}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpload}
              disabled={!file || loading}
              sx={{ flex: 1 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Upload & Process'}
            </Button>
          </Grid>
          
          {/* Charts Toggle Button */}
          {dataProcessed && (
            <Grid item xs={12} md={3}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={toggleChartsView}
                fullWidth
              >
                {showCharts ? 'Hide Charts' : 'Show Charts'}
              </Button>
            </Grid>
          )}
        </Grid>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Card>

      {/* CHART COMPONENT WITH FIXED DISPLAY PERSISTENCE */}
      {dataProcessed && showCharts && (
        <Card 
          elevation={2} 
          sx={{ 
            mb: 4, 
            p: 3, 
            position: 'relative',
            overflow: 'visible'
          }}
        >
          <Typography variant="h5" gutterBottom>
            Sales Analytics
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          {/* Using key to force complete remount of the component when filters change */}
          <div key={`sales-chart-${chartKey}`} style={{ position: 'relative' }}>
            <SalesCharts 
              fileName={fileName}
              dateRangeType={dateRangeType}
              selectedLocation={selectedLocation}
            />
          </div>
        </Card>
      )}

      {/* Table Display Component */}
      <TableDisplay 
        tableData={tableData}
        viewMode={viewMode}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Add Delivery Percentage Chart after the table display */}
      {dataProcessed && tableData.table1 && tableData.table1.length > 0 && (
        <DeliveryPercentageChart tableData={tableData} />
      )}

      {/* Add In-House Percentage Chart after the Delivery Percentage Chart */}
      {dataProcessed && tableData.table1 && tableData.table1.length > 0 && (
        <InHousePercentageChart tableData={tableData} />
      )}
      {/* Add Catering Percentage Chart after the In-House Percentage Chart */}
      {dataProcessed && tableData.table1 && tableData.table1.length > 0 && (
        <CateringPercentageChart tableData={tableData} />
      )}
      {renderTutorial()}
      {renderSuccessMessage()}
    </>
  );
}

export default ExcelImport;
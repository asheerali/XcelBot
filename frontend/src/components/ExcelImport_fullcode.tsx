import React, { useState, useEffect } from 'react';
import axios from 'axios';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';
import Tooltip from '@mui/material/Tooltip';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

// API base URLs - update to match your backend URL
const API_URL = 'http://13.60.27.209:8000/api/excel/upload';
const FILTER_API_URL = 'http://13.60.27.209::8000/api/excel/filter';

// Main Component
export function ExcelImport() {
  // Initial data structure
  const initialTableData = {
    table1: [], // Percentage Table (1P, Catering, DD, GH, In-House, UB)
    table2: [], // In-House Table (1P, In-House, Catering, DD, GH, UB)
    table3: [], // WOW Table (1P, In-House, Catering, DD, GH, UB, 3P, 1P/3P)
    table5: [], // Category summary
    locations: [], // List of available locations
    dateRanges: [] // List of available dates
  };
  
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [tableData, setTableData] = useState(initialTableData);
  const [viewMode, setViewMode] = useState('tabs'); // 'tabs', 'combined', or 'row'
  const [showTutorial, setShowTutorial] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [processedSuccessfully, setProcessedSuccessfully] = useState(false);
  
  // Date filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateRangeType, setDateRangeType] = useState('');
  const [availableDateRanges, setAvailableDateRanges] = useState([]);
  const [customDateRange, setCustomDateRange] = useState(false);
  
  // Define columns for each table type
  const getTableColumns = (tableIndex) => {
    switch (tableIndex) {
      case 0: // Percentage Table (table1)
        return ['Week', '1P', 'Catering', 'DD', 'GH', 'In-House', 'UB', 'Grand Total'];
      case 1: // In-House Table (table2)
        return ['Week', '1P', 'In-House', 'Catering', 'DD', 'GH', 'UB'];
      case 2: // WOW Table (table3)
        return ['Week', '1P', 'In-House', 'Catering', 'DD', 'GH', 'UB', '3P', '1P/3P'];
      case 3: // Category summary (table5)
        return ['Sales_Category', 'Amount', 'Transactions', '% of Total', 'Avg Transaction'];
      default:
        return [];
    }
  };

  // Table tab labels
  const tableLabels = [
    "Percentage Table",
    "In-House Table",
    "Week-over-Week (WOW)",
    "Category Summary"
  ];

  // Table descriptions for tooltips
  const tableDescriptions = [
    "Shows week-over-week percentage changes for each category. Positive values are good!",
    "Shows each category as a percentage of In-House sales.",
    "Week-over-Week data with 3P (Third-Party) totals and 1P to 3P ratio.",
    "Summarizes sales by category with totals and percentages."
  ];

  // Update available date ranges when data changes
  useEffect(() => {
    if (tableData && tableData.dateRanges && tableData.dateRanges.length > 0) {
      setAvailableDateRanges(tableData.dateRanges);
      
      // Set default date range if not already set
      if (!dateRangeType && tableData.dateRanges.length > 0) {
        setDateRangeType(tableData.dateRanges[0]);
      }
    }
  }, [tableData.dateRanges]);

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

  // Handle location change
  const handleLocationChange = (event) => {
    setSelectedLocation(event.target.value);
    
    // Apply filters with new location
    handleApplyFilters(event.target.value, dateRangeType);
  };

  // Handle date range type change
  const handleDateRangeChange = (event) => {
    setDateRangeType(event.target.value);
    
    // Apply filters with new date range
    handleApplyFilters(selectedLocation, event.target.value);
  };

  // Apply filters
  const handleApplyFilters = (location = selectedLocation, dateRange = dateRangeType) => {
    if (!processedSuccessfully && !file) {
      setError('Please upload a file first.');
      return;
    }

    try {
      setLoading(true);
      
      // Format dates correctly for API
      let formattedStartDate = null;
      let formattedEndDate = null;
      
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
            setProcessedSuccessfully(true);
            setError(''); // Clear any previous errors
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
              if (detail && detail.includes('isinf')) {
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
      
    } catch (err) {
      console.error('Filter error:', err);
      setError('Error applying filters: ' + (err.message || 'Unknown error'));
      setLoading(false);
    }
  };

  // Handle file selection
  const handleFileChange = (event) => {
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
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle date input changes
  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  // Convert file to base64
  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  // Custom render function for percentage values
  const renderPercentValue = (value) => {
    if (value === null || value === undefined || value === '####') {
      return <span>####</span>;
    }
    
    // Convert to number if it's a string with % already
    let numValue = typeof value === 'string' && value.includes('%') 
      ? parseFloat(value.replace('%', '')) 
      : parseFloat(value);
    
    if (isNaN(numValue)) {
      return value;
    }
    
    // Determine color based on value
    let color = 'inherit';
    if (numValue > 0) {
      color = 'green';
    } else if (numValue < 0) {
      color = 'red';
    }
    
    return (
      <Typography component="span" style={{ color, fontWeight: 'bold' }}>
        {typeof value === 'string' && value.includes('%') ? value : `${numValue.toFixed(2)}%`}
      </Typography>
    );
  };

  // Custom render function for currency values
  const renderCurrencyValue = (value) => {
    if (value === null || value === undefined || value === '####') {
      return <span>####</span>;
    }
    
    // If value is already a formatted currency string with $ and commas
    if (typeof value === 'string' && value.includes('$')) {
      return value;
    }
    
    // Try to convert to number
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return value;
    }
    
    // Format as currency
    return `$${numValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Determine if a value should be rendered as percentage
  const isPercentageColumn = (columnName, tableIndex) => {
    // Week column is never a percentage
    if (columnName === 'Week' || columnName === 'Sales_Category' || 
        columnName === 'Amount' || columnName === 'Transactions' || 
        columnName === 'Avg Transaction') {
      return false;
    }
    
    // For specific tables
    if (tableIndex === 0 || tableIndex === 1 || tableIndex === 2) {
      return true; // All columns except Week are percentages in these tables
    }
    
    // For category summary table
    if (tableIndex === 3 && columnName === '% of Total') {
      return true;
    }
    
    return false;
  };

  // Determine if a value should be rendered as currency
  const isCurrencyColumn = (columnName, tableIndex) => {
    if (tableIndex === 3) { // Category summary table
      return columnName === 'Amount' || columnName === 'Avg Transaction';
    }
    
    return false;
  };

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
        setProcessedSuccessfully(true);
        
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
      } else {
        throw new Error('Invalid response data');
      }
      
    } catch (err) {
      console.error('Upload error:', err);
      
      let errorMessage = 'Error processing file';
      
      if (axios.isAxiosError(err)) {
        if (err.response) {
          // Get detailed error message if available
          const detail = err.response.data?.detail;
          errorMessage = `Server error: ${detail || err.response.status}`;
          
          // Special handling for common errors
          if (detail && detail.includes('isinf')) {
            errorMessage = 'Backend error: Please update the backend code to use numpy.isinf instead of pandas.isinf';
          } else if (err.response.status === 404) {
            errorMessage = 'API endpoint not found. Is the server running?';
          } else if (detail) {
            // Try to extract a more meaningful message
            if (detail.includes('Column')) {
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
      setProcessedSuccessfully(false);
    } finally {
      setLoading(false);
    }
  };

  // Create a single table component that can be reused
  const RenderDataTable = ({ tableIndex, compact = false, veryCompact = false }) => {
    // Use table5 for category summary (index 3), otherwise use the right table based on index
    // We skip table4 (raw data) as requested
    const tableKey = tableIndex === 3 ? 'table5' : `table${tableIndex + 1}`;
    const data = tableData[tableKey] || [];
    
    // Get the columns for this table type
    const columns = getTableColumns(tableIndex);
    
    // Get background color for header cells based on table type
    const getHeaderColor = (column, tableIndex) => {
      // First column (Week or Sales_Category) is always light gray
      if (column === 'Week' || column === 'Sales_Category') return '#f5f5f5';
      
      switch (tableIndex) {
        case 0: // Percentage Table - orange/red headers
          return '#ffddcc';
        case 1: // In-House Table - blue headers
          return '#ccddff';
        case 2: // WOW Table - orange headers
          return '#ffeecc';
        case 3: // Category Summary - green headers
          return '#ccffdd';
        default:
          return '#e0e0e0';
      }
    };
    
    // Helper function to render cell value correctly
    const renderCellValue = (columnName, value, tableIndex) => {
      // Special handling for specific columns
      if (columnName === 'Week' || columnName === 'Sales_Category') {
        return value; // Just display as is
      }
      
      if (isPercentageColumn(columnName, tableIndex)) {
        return renderPercentValue(value);
      } else if (isCurrencyColumn(columnName, tableIndex)) {
        return renderCurrencyValue(value);
      } else if (columnName === 'Grand Total') {
        return value; // Display as is, it's already formatted
      } else if (columnName === 'Transactions') {
        return value; // Display as is
      } else {
        return value;
      }
    };
    
    return (
      <Card sx={{ 
        width: '100%', 
        height: veryCompact ? '600px' : 'auto',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {!veryCompact && (
          <Box p={veryCompact ? 1 : 2} bgcolor="#f5f5f5" borderBottom="1px solid #ddd" display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant={veryCompact ? "subtitle1" : "h6"}>{tableLabels[tableIndex]}</Typography>
            
            <Box display="flex" alignItems="center">
              <Tooltip title={tableDescriptions[tableIndex]}>
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        )}
        <TableContainer sx={{ 
          maxHeight: veryCompact ? 570 : (compact ? 400 : 600),
          flex: 1
        }}>
          <Table 
            size={veryCompact ? "small" : (compact ? "small" : "medium")} 
            stickyHeader
            sx={{ tableLayout: veryCompact ? 'fixed' : 'auto' }}
          >
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell 
                    key={column} 
                    align="center"
                    sx={{ 
                      fontWeight: 'bold',
                      padding: veryCompact ? '2px' : (compact ? '4px' : '8px'),
                      backgroundColor: getHeaderColor(column, tableIndex),
                      color: 'black',
                      border: '1px solid #ddd',
                      fontSize: veryCompact ? '0.65rem' : (compact ? '0.75rem' : '0.875rem'),
                      whiteSpace: veryCompact ? 'nowrap' : 'normal',
                      overflow: veryCompact ? 'hidden' : 'visible',
                      textOverflow: veryCompact ? 'ellipsis' : 'clip',
                      maxWidth: veryCompact ? '60px' : 'none'
                    }}
                  >
                    {column}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.length === 0 ? (
                // Show empty rows when no data
                Array(tableIndex === 3 ? 7 : 17).fill(0).map((_, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {columns.map((column, colIndex) => (
                      <TableCell 
                        key={`${rowIndex}-${colIndex}`}
                        align="center"
                        sx={{ 
                          padding: veryCompact ? '2px' : (compact ? '4px' : '8px'),
                          border: '1px solid #ddd',
                          backgroundColor: rowIndex % 2 === 0 ? '#fff' : '#f9f9f9',
                          fontSize: veryCompact ? '0.65rem' : (compact ? '0.75rem' : '0.875rem'),
                          whiteSpace: veryCompact ? 'nowrap' : 'normal',
                          overflow: veryCompact ? 'hidden' : 'visible',
                          textOverflow: veryCompact ? 'ellipsis' : 'clip',
                          maxWidth: veryCompact ? '60px' : 'none'
                        }}
                      >
                        {column === 'Week' ? (rowIndex + 1) : 
                         column === 'Sales_Category' ? 'Category' : '####'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                // Show actual data
                data.map((row, index) => (
                  <TableRow 
                    key={index} 
                    sx={{ 
                      '&:nth-of-type(odd)': { backgroundColor: '#fff' },
                      '&:nth-of-type(even)': { backgroundColor: '#f9f9f9' },
                      '&:hover': { backgroundColor: '#f0f0f0' }
                    }}
                  >
                    {columns.map((column) => {
                      // Get the value, but handle cases where the column might not exist in the data
                      const value = row[column] !== undefined ? row[column] : '####';
                      
                      return (
                        <TableCell 
                          key={`${index}-${column}`}
                          align="center"
                          sx={{ 
                            padding: veryCompact ? '2px' : (compact ? '4px' : '8px'), 
                            border: '1px solid #ddd',
                            fontSize: veryCompact ? '0.65rem' : (compact ? '0.75rem' : '0.875rem'),
                            whiteSpace: veryCompact ? 'nowrap' : 'normal',
                            overflow: veryCompact ? 'hidden' : 'visible',
                            textOverflow: veryCompact ? 'ellipsis' : 'clip',
                            maxWidth: veryCompact ? '60px' : 'none'
                          }}
                        >
                          {renderCellValue(column, value, tableIndex)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    );
  };

  // Render content based on view mode
  const renderContent = () => {
    if (viewMode === 'tabs') {
      // Tabbed view
      return (
        <Paper sx={{ width: '100%' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            {tableLabels.map((label, index) => (
              <Tab key={index} label={label} />
            ))}
            <Tab label="All Tables" />
          </Tabs>
          
          {activeTab < 4 ? (
            <RenderDataTable tableIndex={activeTab} />
          ) : (
            // All tables in row view when "All Tables" tab is selected
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" mb={2}>All Tables View - Side by Side</Typography>
              <Grid container spacing={1}>
                {[0, 1, 2, 3].map(tableIndex => (
                  <Grid item xs={12} sm={6} lg={3} key={tableIndex}>
                    <RenderDataTable tableIndex={tableIndex} veryCompact={true} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Paper>
      );
    } else if (viewMode === 'combined') {
      // Combined view - all tables in vertical stack
      return (
        <Paper sx={{ width: '100%', p: 2 }}>
          <Typography variant="h5" mb={2}>All Tables View - Stacked</Typography>
          
          <Grid container spacing={2}>
            {[0, 1, 2, 3].map(tableIndex => (
              <Grid item xs={12} key={tableIndex}>
                <RenderDataTable tableIndex={tableIndex} compact={true} />
              </Grid>
            ))}
          </Grid>
        </Paper>
      );
    } else {
      // Row view - all tables in a single row for wider screens
      return (
        <Paper sx={{ width: '100%', p: 2 }}>
          <Typography variant="h5" mb={2}>All Tables View - Side by Side</Typography>
          
          <Grid container spacing={1}>
            {[0, 1, 2, 3].map(tableIndex => (
              <Grid item xs={12} sm={6} lg={3} key={tableIndex}>
                <RenderDataTable tableIndex={tableIndex} veryCompact={true} />
              </Grid>
            ))}
          </Grid>
        </Paper>
      );
    }
  };

  // Success snackbar
  const renderSuccessMessage = () => (
    <Snackbar
      open={processedSuccessfully}
      autoHideDuration={5000}
      onClose={() => setProcessedSuccessfully(false)}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert 
        onClose={() => setProcessedSuccessfully(false)} 
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
          
          {/* Date Range Selector */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel id="date-range-select-label">Date Range</InputLabel>
              <Select
                labelId="date-range-select-label"
                id="date-range-select"
                value={dateRangeType}
                label="Date Range"
                onChange={handleDateRangeChange}
                disabled={availableDateRanges.length === 0}
              >
                {availableDateRanges.map((range) => (
                  <MenuItem key={range} value={range}>{range}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {/* Conditional rendering of custom date range inputs */}
          {customDateRange && (
            <>
              <Grid item xs={12} md={3}>
                <TextField
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={handleStartDateChange}
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={handleEndDateChange}
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
            </>
          )}
          
          {/* Location Selector - only show if we have locations */}
          {tableData.locations && tableData.locations.length > 0 && (
            <Grid item xs={12} md={customDateRange ? 3 : 3}>
              <FormControl fullWidth>
                <InputLabel id="location-select-label">Location</InputLabel>
                <Select
                  labelId="location-select-label"
                  id="location-select"
                  value={selectedLocation}
                  label="Location"
                  onChange={handleLocationChange}
                >
                  <MenuItem value="">All Locations</MenuItem>
                  {tableData.locations.map((location) => (
                    <MenuItem key={location} value={location}>{location}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
          
          {/* Apply Filters and Upload Buttons */}
          <Grid item xs={12} md={customDateRange ? 3 : (tableData.locations && tableData.locations.length > 0 ? 3 : 6)} 
                sx={{ display: 'flex', gap: 2 }}>
            {customDateRange && (
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleApplyFilters()}
                disabled={!startDate || !endDate || loading}
                sx={{ flex: 1 }}
              >
                Apply Dates
              </Button>
            )}
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
        </Grid>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Card>

      {renderContent()}
      {renderTutorial()}
      {renderSuccessMessage()}
    </>
  );
}

export default ExcelImport;
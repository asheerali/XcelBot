import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Import components
import FilterSection from './FilterSection';
import TableDisplay from './TableDisplay';
import SalesCharts from './SalesCharts';

// API base URLs - update to match your backend URL
const API_URL = 'http://localhost:8000/api/excel/upload';
const FILTER_API_URL = 'http://localhost:8000/api/excel/filter';

/**
 * ExcelImport Component
 * Handles file upload, filtering, and display of tables and charts
 */
export function ExcelImport() {
  // Initial data structure
  const initialTableData = {
    table1: [], // Raw Data Table
    table2: [], // Percentage Table
    table3: [], // In-House Table
    table4: [], // WOW Table
    table5: [], // Category summary
    locations: [], // List of available locations
    dateRanges: [] // List of available dates
  };
  
  // State variables
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
      setProcessedSuccessfully(false);
    } finally {
      setLoading(false);
    }
  };

  // CSS styles
  const containerStyle = {
    padding: '20px'
  };
  
  const headerStyle = {
    marginBottom: '24px'
  };
  
  const headerTitleStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '8px'
  };
  
  const headerSubtitleStyle = {
    fontSize: '16px',
    color: '#666',
    marginTop: 0
  };
  
  const cardStyle = {
    padding: '24px',
    marginBottom: '32px',
    backgroundColor: 'white',
    borderRadius: '4px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'
  };
  
  const gridContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    margin: '-12px'
  };
  
  const gridItemStyle = {
    flex: '1 1 100%',
    maxWidth: '25%',
    padding: '12px',
    boxSizing: 'border-box'
  };
  
  const buttonStyle = {
    display: 'inline-block',
    padding: '10px 16px',
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    textAlign: 'center',
    textDecoration: 'none',
    width: '100%'
  };
  
  const outlinedButtonStyle = {
    ...buttonStyle,
    backgroundColor: 'transparent',
    color: '#1976d2',
    border: '1px solid #1976d2'
  };
  
  const fileNameStyle = {
    fontSize: '14px',
    marginTop: '8px'
  };
  
  const loadingStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '24px'
  };
  
  const errorStyle = {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '12px',
    borderRadius: '4px',
    marginTop: '16px'
  };
  
  const emptyStateStyle = {
    padding: '32px',
    textAlign: 'center',
    backgroundColor: 'white',
    borderRadius: '4px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    margin: '24px 0'
  };
  
  const emptyStateTitleStyle = {
    color: '#666',
    fontWeight: 500,
    marginTop: 0,
    marginBottom: '8px'
  };
  
  const emptyStateMessageStyle = {
    color: '#888',
    fontSize: '14px',
    marginTop: 0
  };
  
  // Check if we should adapt to mobile view
  let responsiveGridItemStyle = {...gridItemStyle};
  try {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(max-width: 768px)');
      if (mediaQuery.matches) {
        responsiveGridItemStyle = {
          ...responsiveGridItemStyle,
          maxWidth: '100%'
        };
      }
    }
  } catch (error) {
    console.error("Error handling media query:", error);
  }

  // Main render function
  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={headerTitleStyle}>
          Sales Analysis Dashboard
        </h1>
        <p style={headerSubtitleStyle}>
          Upload an Excel file to analyze sales data across different categories
        </p>
      </div>

      <div style={cardStyle}>
        <div style={gridContainerStyle}>
          <div style={responsiveGridItemStyle}>
            <input
              type="file"
              id="excel-upload"
              accept=".xlsx, .xls"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <label htmlFor="excel-upload">
              <button
                style={buttonStyle}
                onClick={() => document.getElementById('excel-upload').click()}
              >
                Choose Excel File
              </button>
            </label>
            {fileName && (
              <div style={fileNameStyle}>
                Selected file: {fileName}
              </div>
            )}
          </div>
          
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
          <div style={{
            ...responsiveGridItemStyle,
            display: 'flex',
            gap: '8px'
          }}>
            <button
              style={outlinedButtonStyle}
              onClick={toggleViewMode}
              disabled={loading}
            >
              {viewMode === 'tabs' ? 'View Stacked' : 
               viewMode === 'combined' ? 'View Side-by-Side' : 'View Tabbed'}
            </button>
            <button
              style={buttonStyle}
              onClick={handleUpload}
              disabled={!file || loading}
            >
              {loading ? (
                <div style={loadingStyle}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '3px solid rgba(255,255,255,0.3)',
                    borderRadius: '50%',
                    borderTopColor: 'white',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                </div>
              ) : 'Upload & Process'}
            </button>
          </div>
        </div>
        
        {error && (
          <div style={errorStyle}>
            {error}
          </div>
        )}
      </div>

      {/* Sales Charts - Always display when data is available */}
      {processedSuccessfully && (
        <SalesCharts tableData={tableData} />
      )}

      {/* Table Display - Always show below charts */}
      {processedSuccessfully && (
        <TableDisplay 
          tableData={tableData}
          viewMode={viewMode}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      )}
      
      {/* Show empty state if not processed yet */}
      {!processedSuccessfully && (
        <div style={emptyStateStyle}>
          <h3 style={emptyStateTitleStyle}>
            No data available
          </h3>
          <p style={emptyStateMessageStyle}>
            Please upload an Excel file to view charts and tables
          </p>
        </div>
      )}
      
      {/* Success and Tutorial Messages (simplified) */}
      {processedSuccessfully && (
        <div id="success-message" style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          backgroundColor: '#e8f5e9',
          color: '#2e7d32',
          padding: '12px 16px',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          zIndex: 1000,
          animation: 'fadeOut 0.5s ease 5s forwards'
        }}>
          Excel file processed successfully!
        </div>
      )}
      
      {showTutorial && (
        <div id="tutorial-message" style={{
          position: 'fixed',
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#e3f2fd',
          color: '#0d47a1',
          padding: '16px',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          maxWidth: '500px',
          width: '100%',
          zIndex: 1000
        }}>
          <h4 style={{ marginTop: 0, marginBottom: '8px' }}>Welcome to the Sales Analyzer!</h4>
          <p style={{ margin: 0, fontSize: '14px' }}>
            • <strong>Percentage Table</strong>: Shows week-over-week changes<br />
            • <strong>In-House Table</strong>: Categories as % of In-House sales<br />
            • <strong>WOW Table</strong>: Includes 3P totals and 1P/3P ratio<br />
            • <strong>Category Summary</strong>: Overall sales by category<br />
            <br />
            Use the date filter to analyze specific time periods!
          </p>
          <button
            onClick={() => setShowTutorial(false)}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            ×
          </button>
        </div>
      )}
      
      {/* Add keyframe animations for fade effects */}
      <style>
        {`
          @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; visibility: hidden; }
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

export default ExcelImport;
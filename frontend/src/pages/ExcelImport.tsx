import React, { useState } from 'react';
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

// API base URL
const API_URL = 'http://localhost:8000/api/excel/upload';

// Main Component
export function ExcelImport() {
  // Initial dummy data structure
  const initialTableData = {
    table1: [], // Raw Data table (1P, Catering, DD, GH, In-House, UB, Sales)
    table2: [], // Percentage Table (1P, Catering, DD, GH, In-House, UB)
    table3: [], // In-House Table (1P, In-House, Catering, DD, GH, UB)
    table4: [], // WOW Table (1P, In-House, Catering, DD, GH, UB, 3P, 1P/3P)
    table5: [], // Legacy table (unused but kept for API compatibility)
  };
  
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [tableData, setTableData] = useState(initialTableData);
  const [viewMode, setViewMode] = useState('tabs'); // 'tabs', 'combined', or 'row'
  const [showTutorial, setShowTutorial] = useState(false);
  
  // Define columns for each table type
  const getTableColumns = (tableIndex) => {
    switch (tableIndex) {
      case 0: // Raw Data
        return ['Week', '1P', 'Catering', 'DD', 'GH', 'In-House', 'UB', 'Sales'];
      case 1: // Percentage Table
        return ['Week', '1P', 'Catering', 'DD', 'GH', 'In-House', 'UB'];
      case 2: // In-House Table
        return ['Week', '1P', 'In-House', 'Catering', 'DD', 'GH', 'UB'];
      case 3: // WOW Table
        return ['Week', '1P', 'In-House', 'Catering', 'DD', 'GH', 'UB', '3P', '1P/3P'];
      default:
        return [];
    }
  };

  // Table tab labels
  const tableLabels = [
    "Raw Data Table",
    "Percentage Table",
    "In-House Table",
    "Week-over-Week (WOW)"
  ];

  // Table descriptions for tooltips
  const tableDescriptions = [
    "Shows raw sales numbers for each category. The Sales column is the sum of all categories.",
    "Shows week-over-week percentage changes for each category. Positive values are good!",
    "Shows each category as a percentage of In-House sales.",
    "Week-over-Week data with 3P (Third-Party) totals and 1P to 3P ratio."
  ];

  // Function to toggle between view modes
  const toggleViewMode = () => {
    setViewMode(prevMode => {
      if (prevMode === 'tabs') return 'combined';
      if (prevMode === 'combined') return 'row';
      return 'tabs';
    });
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
      <Typography component="span" style={{ color, fontWeight: 'normal' }}>
        {numValue.toFixed(2)}%
      </Typography>
    );
  };

  // Custom render function for numeric values
  const renderNumericValue = (value) => {
    if (value === null || value === undefined) {
      return <span>####</span>;
    }
    
    // If the value is the string '####', return it as is
    if (value === '####') {
      return <span>####</span>;
    }
    
    // If value is already a string with commas, just return it
    if (typeof value === 'string' && value.includes(',')) {
      return value;
    }
    
    // Try to convert to number
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return value;
    }
    
    // Format with commas for thousands
    return numValue.toLocaleString();
  };

  // Determine if a value should be rendered as percentage
  const isPercentageColumn = (columnName, tableType) => {
    // Week column is never a percentage
    if (columnName === 'Week') return false;
    
    // For tables that mostly contain percentages
    if (tableType === 'percentages') {
      return true; // All columns except Week are percentages
    }
    
    if (tableType === 'wow') {
      return true; // All columns except Week are percentages
    }
    
    // For the In-House table (table3)
    if (activeTab === 2) {
      return true; // All columns except Week are percentages
    }
    
    // For the raw data table (table1), no columns are percentages
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
      
      // Convert file to base64
      const base64File = await toBase64(file);
      const base64Content = base64File.split(',')[1]; // Remove data:application/... prefix
      
      // Send to backend
      const response = await axios.post(API_URL, {
        fileName: fileName,
        fileContent: base64Content
      });

      // Update table data with response
      setTableData(response.data);
      setError('');
      
      // Show tutorial on first successful upload
      if (!localStorage.getItem('tutorialShown')) {
        setShowTutorial(true);
        localStorage.setItem('tutorialShown', 'true');
      }
      
      // Log success message
      console.log('File processed successfully!');
      
    } catch (err) {
      console.error('Upload error:', err);
      
      let errorMessage = 'Error processing file';
      
      if (axios.isAxiosError(err)) {
        if (err.response) {
          errorMessage = `Server error: ${err.response.status}`;
          if (err.response.status === 404) {
            errorMessage = 'API endpoint not found. Is the server running?';
          }
          // Log response data if available
          if (err.response.data) {
            console.error('Response data:', err.response.data);
          }
        } else if (err.request) {
          errorMessage = 'No response from server. Is the server running?';
        }
      }
      
      setError(errorMessage);
      
      // For development/testing: Create mock data for UI testing
      if (process.env.NODE_ENV === 'development') {
        console.log('Creating mock data for development testing...');
        
        // Example of how you might create mock data for testing
        const mockData = {
          table1: Array(17).fill(0).map((_, i) => ({
            'Week': i + 1,
            '1P': Math.random() > 0.3 ? Math.floor(Math.random() * 50000) : '####',
            'Catering': Math.random() > 0.3 ? Math.floor(Math.random() * 50000) : '####',
            'DD': Math.random() > 0.3 ? Math.floor(Math.random() * 50000) : '####',
            'GH': Math.random() > 0.3 ? Math.floor(Math.random() * 50000) : '####',
            'In-House': Math.random() > 0.3 ? Math.floor(Math.random() * 100000) : '####',
            'UB': Math.random() > 0.3 ? Math.floor(Math.random() * 50000) : '####',
            'Sales': Math.random() > 0.3 ? Math.floor(Math.random() * 200000) : '####',
          })),
          
          table2: Array(17).fill(0).map((_, i) => ({
            'Week': i + 1,
            '1P': Math.random() > 0.3 ? (Math.random() * 20 - 10).toFixed(2) : '####',
            'Catering': Math.random() > 0.3 ? (Math.random() * 20 - 10).toFixed(2) : '####',
            'DD': Math.random() > 0.3 ? (Math.random() * 20 - 10).toFixed(2) : '####',
            'GH': Math.random() > 0.3 ? (Math.random() * 20 - 10).toFixed(2) : '####',
            'In-House': Math.random() > 0.3 ? (Math.random() * 20 - 10).toFixed(2) : '####',
            'UB': Math.random() > 0.3 ? (Math.random() * 20 - 10).toFixed(2) : '####',
          })),
          
          table3: Array(17).fill(0).map((_, i) => ({
            'Week': i + 1,
            '1P': Math.random() > 0.3 ? (Math.random() * 10).toFixed(2) : '####',
            'In-House': Math.random() > 0.3 ? (Math.random() * 80 + 20).toFixed(2) : '####',
            'Catering': Math.random() > 0.3 ? (Math.random() * 30).toFixed(2) : '####',
            'DD': Math.random() > 0.3 ? (Math.random() * 5).toFixed(2) : '####',
            'GH': Math.random() > 0.3 ? (Math.random() * 20).toFixed(2) : '####',
            'UB': Math.random() > 0.3 ? (Math.random() * 15).toFixed(2) : '####',
          })),
          
          table4: Array(17).fill(0).map((_, i) => ({
            'Week': i + 1,
            '1P': Math.random() > 0.3 ? (Math.random() * 10 - 5).toFixed(2) : '####',
            'In-House': Math.random() > 0.3 ? (Math.random() * 10 - 5).toFixed(2) : '####',
            'Catering': Math.random() > 0.3 ? (Math.random() * 10 - 5).toFixed(2) : '####',
            'DD': Math.random() > 0.3 ? (Math.random() * 2 - 1).toFixed(2) : '####',
            'GH': Math.random() > 0.3 ? (Math.random() * 8 - 4).toFixed(2) : '####',
            'UB': Math.random() > 0.3 ? (Math.random() * 6 - 3).toFixed(2) : '####',
            '3P': Math.random() > 0.3 ? (Math.random() * 10 - 5).toFixed(2) : '####',
            '1P/3P': Math.random() > 0.3 ? (Math.random() * 10 - 5).toFixed(2) : '####',
          })),
          
          table5: [],
        };
        
        // Uncomment this to use mock data for testing UI
        setTableData(mockData);
      }
      
    } finally {
      setLoading(false);
    }
  };

  // Create a single table component that can be reused
  const RenderDataTable = ({ tableIndex, compact = false, veryCompact = false }) => {
    const tableKey = `table${tableIndex + 1}`;
    const data = tableData[tableKey] || [];
    
    // Get the columns for this table type
    const columns = getTableColumns(tableIndex);
    
    // Determine table type for special formatting
    let tableType = 'regular';
    if (tableIndex === 1) tableType = 'percentages';
    if (tableIndex === 3) tableType = 'wow';
    
    // Get background color for header cells based on table type
    const getHeaderColor = (column, tableIndex) => {
      // First column (Week) is always light gray
      if (column === 'Week') return '#f5f5f5';
      
      switch (tableIndex) {
        case 0: // Raw Data - red headers
          return '#ffcccc';
        case 1: // Percentage Table - orange/red headers
          return '#ffddcc';
        case 2: // In-House Table - blue headers
          return '#ccddff';
        case 3: // WOW Table - orange headers
          return '#ffeecc';
        default:
          return '#e0e0e0';
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
            <Tooltip title={tableDescriptions[tableIndex]}>
              <IconButton size="small">
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
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
              {/* If no data, show empty rows with the structure */}
              {data.length === 0 ? (
                Array(17).fill(0).map((_, rowIndex) => (
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
                        {column === 'Week' ? (rowIndex + 1) : '####'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
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
                          {isPercentageColumn(column, tableType) 
                            ? renderPercentValue(value) 
                            : renderNumericValue(value)}
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
                  <Grid item xs={3} key={tableIndex}>
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
      // Row view - all tables in a single row
      return (
        <Paper sx={{ width: '100%', p: 2 }}>
          <Typography variant="h5" mb={2}>All Tables View - Side by Side</Typography>
          
          <Grid container spacing={1}>
            {[0, 1, 2, 3].map(tableIndex => (
              <Grid item xs={3} key={tableIndex}>
                <RenderDataTable tableIndex={tableIndex} veryCompact={true} />
              </Grid>
            ))}
          </Grid>
        </Paper>
      );
    }
  };

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
          • <strong>Raw Data Table</strong>: Shows actual sales numbers<br />
          • <strong>Percentage Table</strong>: Shows week-over-week changes<br />
          • <strong>In-House Table</strong>: Categories as % of In-House sales<br />
          • <strong>WOW Table</strong>: Includes 3P totals and 1P/3P ratio<br />
          <br />
          Use the buttons above to switch between different view modes.
        </Typography>
      </Alert>
    </Snackbar>
  );

  return (
    <>
      <Box mb={5}>
        <Typography variant="h4">
          Excel Import & Sales Analysis
        </Typography>
      </Box>

      <Card sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
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
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={toggleViewMode}
            >
              {viewMode === 'tabs' ? 'View Stacked Tables' : 
               viewMode === 'combined' ? 'View Side-by-Side Tables' : 'View Tabbed Tables'}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpload}
              disabled={!file || loading}
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
    </>
  );
}

export default ExcelImport;
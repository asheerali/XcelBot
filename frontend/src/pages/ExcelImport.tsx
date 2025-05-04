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

// API base URL
const API_URL = 'http://localhost:8000/api/excel/upload';

// Main Component
export function ExcelImport() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  
  const [tableData, setTableData] = useState({
    table1: [],  // Raw data
    table2: [],  // Summary statistics
    table3: [],  // Column info
    table4: [],  // Transposed preview
    table5: []   // Value counts
  });
  
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
      
    } catch (err) {
      console.error('Upload error:', err);
      
      let errorMessage = 'Error processing file';
      
      if (axios.isAxiosError(err)) {
        if (err.response) {
          errorMessage = `Server error: ${err.response.status}`;
          if (err.response.status === 404) {
            errorMessage = 'API endpoint not found. Is the server running?';
          }
        } else if (err.request) {
          errorMessage = 'No response from server. Is the server running?';
        }
      }
      
      setError(errorMessage);
      
    } finally {
      setLoading(false);
    }
  };

  // Render table based on active tab
  const renderTable = () => {
    const tableKey = `table${activeTab + 1}`;
    const data = tableData[tableKey] || [];
    
    if (!data.length) {
      return (
        <Card sx={{ mt: 3, p: 3 }}>
          <Typography>No data available</Typography>
        </Card>
      );
    }
    
    // Get column headers from first row
    const columns = data.length > 0 ? Object.keys(data[0]) : [];
    
    return (
      <Card sx={{ mt: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell key={column}>{column}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={column}>{row[column]}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    );
  };

  // Table tab labels
  const tableLabels = [
    "Raw Data",
    "Summary Statistics",
    "Column Information",
    "Data Preview",
    "Categorical Analysis"
  ];

  return (
    <>
      <Box mb={5}>
        <Typography variant="h4">
          Excel Import & Analysis
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
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
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

      {Object.values(tableData).some(table => table.length > 0) && (
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
          </Tabs>
          
          {renderTable()}
        </Paper>
      )}
    </>
  );
}

export default ExcelImport;
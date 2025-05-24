// src/pages/ExcelUploadPage.tsx - Updated version with Sales Wide dashboard support

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormHelperText,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Autocomplete
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Icons
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import DeleteIcon from '@mui/icons-material/Delete';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import EditIcon from '@mui/icons-material/Edit';
import PlaceIcon from '@mui/icons-material/Place';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocationCityIcon from '@mui/icons-material/LocationCity';

// Import Redux hooks
import { useAppDispatch } from '../typedHooks';
import { 
  setExcelFile, 
  setLoading, 
  setError, 
  setTableData,
  addFileData,
  setLocations,
  selectLocation,
  addFinancialData,
  addSalesData,
  addSalesWideData  // Added for Sales Wide dashboard
} from '../store/excelSlice';

// API URL for Excel upload
const API_URL = 'http://localhost:8000/api/excel/upload';

// Styled component for the drop zone
const DropZone = styled(Paper)(({ theme }) => ({
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: theme.shape.borderRadius,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(6),
  cursor: 'pointer',
  backgroundColor: theme.palette.background.default,
  transition: 'border 0.3s ease-in-out, background-color 0.3s ease-in-out',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    borderColor: theme.palette.primary.dark,
  },
}));

// Dashboard label style
const DashboardLabel = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  marginRight: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
}));

// Dashboard options
const DASHBOARD_OPTIONS = [
  'Sales Split',
  'Financials',
  'Sales Wide',
  'Product Mix'
];

// List of popular US cities
const US_CITIES = [
  'New York',
  'Midtown East',
  'Los Angeles, CA',
  'Chicago, IL',
  'Houston, TX',
  'Phoenix, AZ',
  'Philadelphia, PA',
  'San Antonio, TX',
  'San Diego, CA',
  'Dallas, TX',
  'San Jose, CA',
  'Austin, TX',
  'Jacksonville, FL',
  'Fort Worth, TX',
  'Columbus, OH',
  'Charlotte, NC',
  'San Francisco, CA',
  'Indianapolis, IN',
  'Seattle, WA',
  'Denver, CO',
  'Washington, DC',
  'Boston, MA',
  'El Paso, TX',
  'Nashville, TN',
  'Detroit, MI',
  'Portland, OR',
  'Las Vegas, NV',
  'Oklahoma City, OK',
  'Memphis, TN',
  'Louisville, KY',
  'Baltimore, MD',
  'Milwaukee, WI',
  'Albuquerque, NM',
  'Tucson, AZ',
  'Fresno, CA',
  'Sacramento, CA',
  'Kansas City, MO',
  'Mesa, AZ',
  'Atlanta, GA',
  'Omaha, NE',
  'Colorado Springs, CO',
  'Raleigh, NC',
  'Miami, FL',
  'Long Beach, CA',
  'Virginia Beach, VA',
  'Oakland, CA',
  'Minneapolis, MN',
  'Tampa, FL',
  'Tulsa, OK',
  'Arlington, TX',
  'New Orleans, LA'
];

// File status type
type FileStatus = 'pending' | 'uploading' | 'success' | 'error';

// File info type with location and dashboard
interface FileInfo {
  file: File;
  status: FileStatus;
  error?: string;
  progress: number;
  location: string;
  dashboard: string; // Added dashboard field
  data?: any; // To store the processed data
}

const ExcelUploadPage: React.FC = () => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [currentEditingIndex, setCurrentEditingIndex] = useState<number | null>(null);
  const [locationInput, setLocationInput] = useState('');
  const [locationError, setLocationError] = useState('');
  const [selectedDashboard, setSelectedDashboard] = useState('Sales Split'); // Global dashboard selection
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [cityInputValue, setCityInputValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // Function to handle file drop
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      const excelFiles = droppedFiles.filter(file => 
        file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
      );
      
      if (excelFiles.length === 0) {
        setGeneralError('Please upload only Excel files (.xlsx or .xls)');
        return;
      }
      
      // Add the Excel files to our state with current selected dashboard
      const newFiles = excelFiles.map(file => ({
        file,
        status: 'pending' as FileStatus,
        progress: 0,
        location: selectedCity || '', // Use selected city if available
        dashboard: selectedDashboard, // Use the global dashboard selection
      }));
      
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
      setGeneralError(null);
      
      // Only open location dialog if no city is selected
      if (!selectedCity && newFiles.length > 0) {
        setCurrentEditingIndex(files.length);
        setLocationInput('');
        setLocationError('');
        setIsLocationDialogOpen(true);
      }
    }
  }, [files.length, selectedCity, selectedDashboard]);
  
  // Handle drag over event
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  
  // Handle drag leave event
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  
  // Handle file input change
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const excelFiles = selectedFiles.filter(file => 
        file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
      );
      
      if (excelFiles.length === 0) {
        setGeneralError('Please upload only Excel files (.xlsx or .xls)');
        return;
      }
      
      // Add the Excel files to our state with current selected dashboard
      const newFiles = excelFiles.map(file => ({
        file,
        status: 'pending' as FileStatus,
        progress: 0,
        location: selectedCity || '', // Use selected city if available
        dashboard: selectedDashboard, // Use the global dashboard selection
      }));
      
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
      setGeneralError(null);
      
      // Only open location dialog if no city is selected
      if (!selectedCity && newFiles.length > 0) {
        setCurrentEditingIndex(files.length);
        setLocationInput('');
        setLocationError('');
        setIsLocationDialogOpen(true);
      }
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [files.length, selectedCity, selectedDashboard]);
  
  // Handle global dashboard change - ONLY affects NEW files
  const handleDashboardChange = (value: string) => {
    setSelectedDashboard(value);
    // Don't update existing pending files
  };
  
  // Function to convert file to base64
  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };
  
  // Upload a single file
 // Complete uploadFile function for ExcelUploadPage.tsx
// Replace your entire uploadFile function with this version

const uploadFile = async (fileInfo: FileInfo, index: number) => {
  if (!fileInfo.location.trim()) {
    // Don't upload files without a location
    setFiles(prevFiles => {
      const updatedFiles = [...prevFiles];
      updatedFiles[index] = {
        ...updatedFiles[index],
        status: 'error',
        error: 'Location is required',
        progress: 0
      };
      return updatedFiles;
    });
    return false;
  }
  
  try {
    // Update status to uploading
    setFiles(prevFiles => {
      const updatedFiles = [...prevFiles];
      updatedFiles[index] = {
        ...updatedFiles[index],
        status: 'uploading',
        progress: 0
      };
      return updatedFiles;
    });
    
    // Convert file to base64
    const base64File = await toBase64(fileInfo.file);
    const base64Content = base64File.split(',')[1]; // Remove data:application/... prefix
    
    // Store file info in Redux
    dispatch(setExcelFile({
      fileName: fileInfo.file.name,
      fileContent: base64Content,
      location: fileInfo.location
    }));
    
    // Simulate progress updates (since we don't have real progress events with axios)
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 10;
      if (progress <= 90) {
        setFiles(prevFiles => {
          const updatedFiles = [...prevFiles];
          updatedFiles[index] = {
            ...updatedFiles[index],
            progress
          };
          return updatedFiles;
        });
      } else {
        clearInterval(progressInterval);
      }
    }, 300);
    
    // Send to backend with location and dashboard parameters
    const response = await axios.post(API_URL, {
      fileName: fileInfo.file.name,
      fileContent: base64Content,
      location: fileInfo.location,
      dashboard: fileInfo.dashboard
    });
    
    // Clear the progress interval
    clearInterval(progressInterval);
    
    // Route data based on dashboard type from response
    if (response.data) {
      // Check if response.data is an array (multiple dashboards)
      if (Array.isArray(response.data)) {
        console.log('Multiple dashboards detected in response array');
        
        // Handle multiple dashboards (Sales Split + Product Mix)
        response.data.forEach((dashboardData) => {
          const dashboardName = dashboardData.dashboardName;
          console.log(`Processing dashboard: ${dashboardName} from array`);
          
          if (dashboardName === 'Sales Split') {
            console.log('Sales Split dashboard detected in array - processing data');
            console.log('Sales Split data:', dashboardData);
            
            // Add to sales data in Redux
            dispatch(addSalesData({
              fileName: fileInfo.file.name,
              location: fileInfo.location,
              data: dashboardData
            }));
            
            // Also add to regular file data for backward compatibility
            dispatch(addFileData({
              fileName: fileInfo.file.name,
              location: fileInfo.location,
              data: dashboardData
            }));
          } else if (dashboardName === 'Product Mix') {
            // Product Mix functionality not implemented yet
            console.log('Product Mix dashboard detected in array - functionality not implemented yet');
            console.log('Product Mix data:', dashboardData);
            
            // For now, just store in a dummy variable to prevent errors
            const dummyProductMixData = {
              fileName: fileInfo.file.name,
              location: fileInfo.location,
              data: dashboardData
            };
            console.log('Dummy Product Mix data stored (array):', dummyProductMixData);
          }
        });
        
        // Update locations in Redux store for multiple dashboards
        if (fileInfo.location) {
          dispatch(setLocations([fileInfo.location]));
          dispatch(selectLocation(fileInfo.location));
        }
      } else {
        // Handle single dashboard (existing logic)
        const dashboardName = response.data.dashboardName || fileInfo.dashboard;
        console.log(`Processing single dashboard: ${dashboardName}`);
        
        // Dispatch based on dashboard type
        if (dashboardName === 'Financials') {
          console.log('Financials dashboard detected - processing data');
          
          // Add to financial data in Redux
          dispatch(addFinancialData({
            fileName: fileInfo.file.name,
            location: fileInfo.location,
            data: response.data
          }));
        } else if (dashboardName === 'Sales Split') {
          console.log('Sales Split dashboard detected - processing data');
          console.log('Sales Split data:', response.data);
          
          // Add to sales data in Redux
          dispatch(addSalesData({
            fileName: fileInfo.file.name,
            location: fileInfo.location,
            data: response.data
          }));
          
          // Also add to regular file data for backward compatibility
          dispatch(addFileData({
            fileName: fileInfo.file.name,
            location: fileInfo.location,
            data: response.data
          }));
        } else if (dashboardName === 'Sales Wide') {
          console.log('Sales Wide dashboard detected - processing data');
          
          // Add to sales wide data in Redux
          dispatch(addSalesWideData({
            fileName: fileInfo.file.name,
            location: fileInfo.location,
            data: response.data
          }));
        } else if (dashboardName === 'Product Mix') {
          // Product Mix functionality not implemented yet
          console.log('Product Mix dashboard detected - functionality not implemented yet');
          console.log('Product Mix data:', response.data);
          
          // For now, just store in a dummy variable to prevent errors
          const dummyProductMixData = {
            fileName: fileInfo.file.name,
            location: fileInfo.location,
            data: response.data
          };
          console.log('Dummy Product Mix data stored:', dummyProductMixData);
        }
        
        // Update locations in Redux store for single dashboard  
        if (fileInfo.location) {
          dispatch(setLocations([fileInfo.location]));
          dispatch(selectLocation(fileInfo.location));
        }
      }
      
      // Update file status to success and store data
      setFiles(prevFiles => {
        const updatedFiles = [...prevFiles];
        updatedFiles[index] = {
          ...updatedFiles[index],
          status: 'success',
          progress: 100,
          data: response.data
        };
        return updatedFiles;
      });
      
      return true;
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
      } else if (err.request) {
        errorMessage = 'No response from server. Please check if the backend is running.';
      }
    } else if (err instanceof Error) {
      errorMessage = `Error: ${err.message}`;
    }
    
    // Update file status to error
    setFiles(prevFiles => {
      const updatedFiles = [...prevFiles];
      updatedFiles[index] = {
        ...updatedFiles[index],
        status: 'error',
        error: errorMessage,
        progress: 0
      };
      return updatedFiles;
    });
    
    return false;
  }
};
  
  // Upload all pending files
  const uploadAllFiles = async () => {
    setGeneralError(null);
    
    // Check if all files have locations
    const filesWithoutLocation = files.filter(f => f.status === 'pending' && !f.location.trim());
    if (filesWithoutLocation.length > 0) {
      setGeneralError('All files must have a location name before uploading');
      return;
    }
    
    const pendingFiles = files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) {
      setGeneralError('No files to upload');
      return;
    }
    
    let successCount = 0;
    const successfullyUploadedFiles: FileInfo[] = [];
    
    for (let i = 0; i < files.length; i++) {
      if (files[i].status === 'pending') {
        const success = await uploadFile(files[i], i);
        if (success) {
          successCount++;
          successfullyUploadedFiles.push(files[i]);
        }
      }
    }
    
    // Update Redux with all successful files
    if (successfullyUploadedFiles.length > 0) {
      const locations = [...new Set(successfullyUploadedFiles.map(f => f.location))];
      dispatch(setLocations(locations));
      
      // If this is the first successful upload, select the first location
      if (successCount === 1) {
        const firstLocation = successfullyUploadedFiles[0].location;
        dispatch(selectLocation(firstLocation));
      }
    }
  };
  
  // Remove a file from the list
  const removeFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };
  
  // View file analysis (navigate to analysis page)
  const viewAnalysis = () => {
    // Check which dashboards have successful files
    const successfulFiles = files.filter(f => f.status === 'success');
    
    // Separate files by dashboard type
    const salesFiles = successfulFiles.filter(f => f.dashboard === 'Sales Split');
    const financialFiles = successfulFiles.filter(f => f.dashboard === 'Financials');
    const salesWideFiles = successfulFiles.filter(f => f.dashboard === 'Sales Wide' || f.dashboard === 'Companywide Sales');
    const productMixFiles = successfulFiles.filter(f => f.dashboard === 'Product Mix');
    
    // Navigate based on dashboard types
    if (financialFiles.length > 0 && salesFiles.length === 0 && salesWideFiles.length === 0) {
      // Only financial files - navigate to Financials
      navigate('/Financials');
    } else if (salesFiles.length > 0 && financialFiles.length === 0 && salesWideFiles.length === 0) {
      // Only sales files - navigate to manage-reports
      navigate('/manage-reports');
    } else if (salesWideFiles.length > 0 && salesFiles.length === 0 && financialFiles.length === 0) {
      // Only sales wide files - navigate to sales wide dashboard
      navigate('/Saleswide');
    } else if (productMixFiles.length > 0) {
      // Has product mix files - navigate to product mix
      navigate('/Productmix');
    } else {
      // Multiple dashboard types - navigate to the most recent one
      // For now, prioritize Sales Split -> Sales Wide -> Financials
      if (salesFiles.length > 0) {
        navigate('/manage-reports');
      } else if (salesWideFiles.length > 0) {
        navigate('/Saleswide');
      } else {
        navigate('/Financials');
      }
    }
  };
  
  // Open dialog to edit location
  const editLocation = (index: number) => {
    setCurrentEditingIndex(index);
    setLocationInput(files[index].location);
    setLocationError('');
    setIsLocationDialogOpen(true);
  };
  
  // Handle location dialog save
  const handleLocationSave = () => {
    if (!locationInput.trim()) {
      setLocationError('Location name is required');
      return;
    }
    
    if (currentEditingIndex !== null) {
      setFiles(prevFiles => {
        const updatedFiles = [...prevFiles];
        updatedFiles[currentEditingIndex] = {
          ...updatedFiles[currentEditingIndex],
          location: locationInput.trim()
        };
        return updatedFiles;
      });
      
      setIsLocationDialogOpen(false);
      
      // If there are more files without locations, open the dialog for the next one
      const nextFileIndex = files.findIndex((file, index) => 
        index > currentEditingIndex && !file.location.trim()
      );
      
      if (nextFileIndex !== -1) {
        setCurrentEditingIndex(nextFileIndex);
        setLocationInput('');
        setLocationError('');
        setIsLocationDialogOpen(true);
      }
    }
  };
  
  // Calculate overall status
  const pendingCount = files.filter(f => f.status === 'pending').length;
  const successCount = files.filter(f => f.status === 'success').length;
  const errorCount = files.filter(f => f.status === 'error').length;
  const uploadingCount = files.filter(f => f.status === 'uploading').length;
  
  // Files without locations
  const filesWithoutLocationCount = files.filter(f => f.status === 'pending' && !f.location.trim()).length;
  
  return (
    <Box sx={{ py: 4 }}>
      {/* <Typography variant="h4" gutterBottom> */}
       <Typography 
                variant="h4" 
                component="h1" 
                sx={{ 
                  fontWeight: 600,
                  color: '#1a237e',
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
                }}
              >
        Excel File Upload
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Upload Excel files (.xlsx or .xls), with each file representing a single location. 
        Select a city before uploading to assign it to new files.
      </Typography>
      
      <Grid container spacing={3}>
        {/* City selection */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <LocationCityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Select a Location/Store for New Files (Optional)
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Autocomplete
                  id="city-select"
                  options={US_CITIES}
                  value={selectedCity}
                  onChange={(event, newValue) => {
                    setSelectedCity(newValue);
                  }}
                  inputValue={cityInputValue}
                  onInputChange={(event, newInputValue) => {
                    setCityInputValue(newInputValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Store/Location"
                      placeholder="Select a US city"
                      variant="outlined"
                      fullWidth
                      helperText="This city will be assigned to new files only"
                    />
                  )}
                  sx={{ minWidth: 300, flex: 1 }}
                />
                
                {/* Dashboard Selection */}
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel id="dashboard-select-label">Dashboard</InputLabel>
                  <Select
                    labelId="dashboard-select-label"
                    id="dashboard-select"
                    value={selectedDashboard}
                    label="Dashboard"
                    onChange={(e) => handleDashboardChange(e.target.value as string)}
                    startAdornment={<DashboardIcon sx={{ mr: 1, ml: -0.5 }} />}
                  >
                    {DASHBOARD_OPTIONS.map(option => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>Select dashboard for new files</FormHelperText>
                </FormControl>
              </Box>
              
              {selectedCity && (
                <Box mt={2}>
                  <Chip 
                    icon={<PlaceIcon />} 
                    label={`Selected City: ${selectedCity}`} 
                    color="primary" 
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    New files will be associated with this location
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Drop zone */}
        <Grid item xs={12}>
          <input
            type="file"
            id="excel-upload"
            accept=".xlsx, .xls"
            style={{ display: 'none' }}
            onChange={handleFileChange}
            ref={fileInputRef}
            multiple
          />
          <label htmlFor="excel-upload" style={{ width: '100%' }}>
            <DropZone
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              sx={{
                borderColor: isDragging ? 'primary.dark' : undefined,
                backgroundColor: isDragging ? 'action.hover' : undefined
              }}
            >
              <CloudUploadIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" align="center" gutterBottom>
                Drag and drop Excel files here
              </Typography>
              <Typography variant="body2" align="center" color="text.secondary" paragraph>
                or
              </Typography>
              <Button 
                variant="contained" 
                component="span"
                startIcon={<FileUploadIcon />}
              >
                Browse Files
              </Button>
              <Typography variant="caption" align="center" color="text.secondary" sx={{ mt: 2 }}>
                {selectedCity 
                  ? `New files will be associated with ${selectedCity}` 
                  : "You'll be asked to provide a location for each file"}
              </Typography>
            </DropZone>
          </label>
        </Grid>
        
        {/* File list */}
        {files.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ mr: 2 }}>
                      Selected Files
                    </Typography>
                  </Box>
                  
                  <Box>
                    {pendingCount > 0 && (
                      <Button 
                        variant="contained" 
                        color="primary"
                        onClick={uploadAllFiles}
                        disabled={uploadingCount > 0 || filesWithoutLocationCount > 0}
                        startIcon={<FileUploadIcon />}
                        sx={{ mr: 1 }}
                      >
                        Upload {pendingCount > 1 ? `All (${pendingCount})` : ''}
                      </Button>
                    )}
                    {successCount > 0 && (
                      <Button 
                        variant="outlined" 
                        color="primary"
                        onClick={viewAnalysis}
                        startIcon={<FileOpenIcon />}
                      >
                        View Analysis
                      </Button>
                    )}
                  </Box>
                </Box>
                
                {/* Status summary */}
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  {pendingCount > 0 && (
                    <Chip 
                      label={`Pending: ${pendingCount}`} 
                      color="default" 
                      size="small" 
                    />
                  )}
                  {filesWithoutLocationCount > 0 && (
                    <Chip 
                      label={`Missing Location: ${filesWithoutLocationCount}`} 
                      color="warning" 
                      size="small" 
                      icon={<PlaceIcon />} 
                    />
                  )}
                  {uploadingCount > 0 && (
                    <Chip 
                      label={`Uploading: ${uploadingCount}`} 
                      color="primary" 
                      size="small" 
                      icon={<CircularProgress size={16} color="inherit" />} 
                    />
                  )}
                  {successCount > 0 && (
                    <Chip 
                      label={`Uploaded: ${successCount}`} 
                      color="success" 
                      size="small" 
                      icon={<CheckCircleIcon />} 
                    />
                  )}
                  {errorCount > 0 && (
                    <Chip 
                      label={`Failed: ${errorCount}`} 
                      color="error" 
                      size="small" 
                      icon={<ErrorIcon />} 
                    />
                  )}
                </Box>
                
                <Divider sx={{ mb: 2 }} />
                
                {/* File list */}
                <List>
                  {files.map((fileInfo, index) => (
                    <React.Fragment key={`${fileInfo.file.name}-${index}`}>
                      <ListItem
                        secondaryAction={
                          fileInfo.status !== 'uploading' && (
                            <>
                              {fileInfo.status === 'pending' && (
                                <IconButton 
                                  edge="end" 
                                  aria-label="edit location" 
                                  onClick={() => editLocation(index)}
                                  sx={{ mr: 1 }}
                                >
                                  <EditIcon />
                                </IconButton>
                              )}
                              <IconButton 
                                edge="end" 
                                aria-label="delete" 
                                onClick={() => removeFile(index)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </>
                          )
                        }
                      >
                        <ListItemIcon>
                          {fileInfo.status === 'success' ? (
                            <CheckCircleIcon color="success" />
                          ) : fileInfo.status === 'error' ? (
                            <ErrorIcon color="error" />
                          ) : fileInfo.status === 'uploading' ? (
                            <CircularProgress size={24} />
                          ) : (
                            <DescriptionIcon color="primary" />
                          )}
                        </ListItemIcon>
                        <ListItemText 
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                              <Typography component="span" sx={{ mr: 1 }}>
                                {fileInfo.file.name}
                              </Typography>
                              {fileInfo.location && (
                                <Chip 
                                  label={fileInfo.location} 
                                  size="small" 
                                  color="primary"
                                  icon={<PlaceIcon />}
                                  sx={{ fontSize: '0.75rem' }}
                                />
                              )}
                              
                              {/* Dashboard chip for all files */}
                              <Chip 
                                label={fileInfo.dashboard} 
                                size="small" 
                                color="secondary"
                                icon={<DashboardIcon />}
                                sx={{ fontSize: '0.75rem' }}
                              />
                            </Box>
                          }
                          secondary={
                            fileInfo.status === 'error' ? fileInfo.error : 
                            fileInfo.status === 'uploading' ? `Uploading... ${fileInfo.progress}%` :
                            fileInfo.status === 'success' ? 'Upload complete' :
                            !fileInfo.location ? 'Location name required' :
                            `${(fileInfo.file.size / 1024).toFixed(2)} KB`
                          }
                        />
                      </ListItem>
                      {index < files.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}
        
        {/* Error display */}
        {generalError && (
          <Grid item xs={12}>
            <Alert severity="error" onClose={() => setGeneralError(null)}>
              {generalError}
            </Alert>
          </Grid>
        )}
      </Grid>
      
      {/* Location Dialog */}
      <Dialog 
        open={isLocationDialogOpen} 
        onClose={() => setIsLocationDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Enter Location Name
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Please enter a location name for the file: 
            {currentEditingIndex !== null && files[currentEditingIndex] && (
              <strong>{` ${files[currentEditingIndex].file.name}`}</strong>
            )}
          </Typography>
          
          <TextField
            autoFocus
            margin="dense"
            label="Location Name"
            fullWidth
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            error={!!locationError}
            variant="outlined"
            placeholder="e.g., New York, Chicago, Los Angeles"
          />
          
          {locationError && (
            <FormHelperText error>{locationError}</FormHelperText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsLocationDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleLocationSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExcelUploadPage;
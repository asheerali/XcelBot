// src/pages/ExcelUploadPage.tsx
import React, { useState, useCallback, useRef } from 'react';
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
  Autocomplete,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
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
import LocationCityIcon from '@mui/icons-material/LocationCity';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PlaceIcon from '@mui/icons-material/Place';

// Import Redux hooks
import { useAppDispatch } from '../typedHooks';

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

// Dashboard options
const DASHBOARD_OPTIONS = [
  'Sales Split',
  'Financial Dashboard',
  'Sales Wide',
  'Product Mix'
];

// List of popular US cities
const US_CITIES = [
  'New York, NY',
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
  dashboard: string;
  data?: any; // To store the processed data
}

const ExcelUploadPage: React.FC = () => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [cityInputValue, setCityInputValue] = useState('');
  const [selectedDashboard, setSelectedDashboard] = useState('Sales Split');
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
      
      // Only take the first Excel file for simplicity
      const firstExcelFile = excelFiles[0];
      
      // Check if a city is selected
      if (!selectedCity) {
        setGeneralError('Please select a city before uploading a file');
        return;
      }
      
      // Add the file with the selected city and dashboard
      const newFile: FileInfo = {
        file: firstExcelFile,
        status: 'pending',
        progress: 0,
        location: selectedCity,
        dashboard: selectedDashboard,
      };
      
      setFiles(prevFiles => [...prevFiles, newFile]);
      setGeneralError(null);
    }
  }, [selectedCity, selectedDashboard]);
  
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
      
      // Only take the first Excel file for simplicity
      const firstExcelFile = excelFiles[0];
      
      // Check if a city is selected
      if (!selectedCity) {
        setGeneralError('Please select a city before uploading a file');
        return;
      }
      
      // Add the file with the selected city and dashboard
      const newFile: FileInfo = {
        file: firstExcelFile,
        status: 'pending',
        progress: 0,
        location: selectedCity,
        dashboard: selectedDashboard,
      };
      
      setFiles(prevFiles => [...prevFiles, newFile]);
      setGeneralError(null);
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [selectedCity, selectedDashboard]);
  
  // Handle dashboard change
  const handleDashboardChange = (value: string) => {
    setSelectedDashboard(value);
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
  const uploadFile = async (fileInfo: FileInfo, index: number) => {
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
      dispatch({ 
        type: 'excel/setExcelFile', 
        payload: {
          fileName: fileInfo.file.name,
          fileContent: base64Content,
          location: fileInfo.location,
          dashboard: fileInfo.dashboard
        }
      });
      
      // Simulate progress updates
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
        location: fileInfo.location
      });
      
      // Clear the progress interval
      clearInterval(progressInterval);
      
      // Update Redux with the response data
      if (response.data) {
        // Store the location with the data
        const responseWithLocation = {
          ...response.data,
          location: fileInfo.location
        };
        
        dispatch({ 
          type: 'excel/setTableData', 
          payload: responseWithLocation
        });
        
        // Store the location in Redux locations list
        dispatch({
          type: 'excel/addLocation',
          payload: fileInfo.location
        });
        
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
    
    const pendingFiles = files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) {
      setGeneralError('No files to upload');
      return;
    }
    
    let successCount = 0;
    
    for (let i = 0; i < files.length; i++) {
      if (files[i].status === 'pending') {
        const success = await uploadFile(files[i], i);
        if (success) {
          successCount++;
        }
      }
    }
    
    // Store all locations in Redux for later use in filters
    const locations = files
      .filter(f => f.status === 'success')
      .map(f => f.location);
    
    if (locations.length > 0) {
      dispatch({
        type: 'excel/setLocations',
        payload: locations
      });
    }
    
    // Navigate to the analysis page if at least one file was successfully uploaded
    if (successCount > 0) {
      navigate('/manage-reports');
    }
  };
  
  // Remove a file from the list
  const removeFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };
  
  // View file analysis (navigate to analysis page)
  const viewAnalysis = () => {
    // Store all locations in Redux before navigating
    const locations = files
      .filter(f => f.status === 'success')
      .map(f => f.location);
    
    if (locations.length > 0) {
      dispatch({
        type: 'excel/setLocations',
        payload: locations
      });
    }
    
    navigate('/manage-reports');
  };
  
  // Calculate overall status
  const pendingCount = files.filter(f => f.status === 'pending').length;
  const successCount = files.filter(f => f.status === 'success').length;
  const errorCount = files.filter(f => f.status === 'error').length;
  const uploadingCount = files.filter(f => f.status === 'uploading').length;
  
  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Excel File Upload
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Upload Excel files for each location. Select a city first, then upload a file for that location.
      </Typography>
      
      <Grid container spacing={3}>
        {/* City and Dashboard Selection */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <LocationCityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Select Location and Dashboard
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
                      label="City"
                      placeholder="Select a US city"
                      variant="outlined"
                      fullWidth
                      helperText="Search and select a city first"
                    />
                  )}
                  sx={{ minWidth: 300, flex: 1 }}
                />
                
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
                  <FormHelperText>Select dashboard type</FormHelperText>
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
                    The next file you upload will be associated with this location
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
          />
          <label htmlFor="excel-upload" style={{ width: '100%' }}>
            <DropZone
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              sx={{
                borderColor: isDragging ? 'primary.dark' : undefined,
                backgroundColor: isDragging ? 'action.hover' : undefined,
                opacity: selectedCity ? 1 : 0.7,
                pointerEvents: selectedCity ? 'auto' : 'none'
              }}
            >
              <CloudUploadIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" align="center" gutterBottom>
                {selectedCity 
                  ? `Upload Excel file for ${selectedCity}` 
                  : "Please select a city first"
                }
              </Typography>
              <Typography variant="body2" align="center" color="text.secondary" paragraph>
                Drag and drop an Excel file here or
              </Typography>
              <Button 
                variant="contained" 
                component="span"
                startIcon={<FileUploadIcon />}
                disabled={!selectedCity}
              >
                Browse Files
              </Button>
              <Typography variant="caption" align="center" color="text.secondary" sx={{ mt: 2 }}>
                One file per location. Files must be .xlsx or .xls format.
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
                  <Typography variant="h6">
                    Files Ready to Upload
                  </Typography>
                  <Box>
                    {pendingCount > 0 && (
                      <Button 
                        variant="contained" 
                        color="primary"
                        onClick={uploadAllFiles}
                        disabled={uploadingCount > 0}
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
                            <IconButton 
                              edge="end" 
                              aria-label="delete" 
                              onClick={() => removeFile(index)}
                            >
                              <DeleteIcon />
                            </IconButton>
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
    </Box>
  );
};

export default ExcelUploadPage;
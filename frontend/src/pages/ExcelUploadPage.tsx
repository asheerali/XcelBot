// src/pages/ExcelUploadPage.tsx - Updated to extract and save categories from backend response

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
  Autocomplete,
  LinearProgress
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
import CategoryIcon from '@mui/icons-material/Category';

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
  addSalesWideData,
  addProductMixData  // Added for Product Mix dashboard
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

// Dashboard options with icons
const DASHBOARD_OPTIONS = [
  { value: 'Sales Split', label: 'Sales Split', icon: <DashboardIcon /> },
  { value: 'Financials', label: 'Financials', icon: <DashboardIcon /> },
  { value: 'Sales Wide', label: 'Sales Wide', icon: <DashboardIcon /> },
  { value: 'Product Mix', label: 'Product Mix', icon: <CategoryIcon /> }
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
  dashboard: string;
  data?: any;
  categories?: string[]; // Added to store extracted categories
}

// Helper function to extract categories from response data
const extractCategoriesFromData = (data: any): string[] => {
  console.log('🔍 Extracting categories from data:', data);
  
  let categories: string[] = [];
  
  try {
    // Check if data is an array (multiple dashboards)
    if (Array.isArray(data)) {
      console.log('📊 Processing array of dashboards');
      
      // Process each dashboard in the array
      data.forEach((dashboardData, index) => {
        console.log(`Processing dashboard ${index + 1}:`, dashboardData);
        
        // Extract categories from single dashboard
        const dashboardCategories = extractCategoriesFromSingleDashboard(dashboardData);
        
        // Merge categories (remove duplicates)
        categories = [...new Set([...categories, ...dashboardCategories])];
        
        console.log(`Categories after processing dashboard ${index + 1}:`, categories);
      });
    } else {
      // Single dashboard
      console.log('📊 Processing single dashboard');
      categories = extractCategoriesFromSingleDashboard(data);
    }
    
    console.log('✅ Final extracted categories:', categories);
    return categories;
    
  } catch (error) {
    console.error('❌ Error extracting categories:', error);
    return [];
  }
};


// Helper function to extract categories from a single dashboard
const extractCategoriesFromSingleDashboard = (dashboardData: any): string[] => {
  let categories: string[] = [];
  
  try {
    console.log('🔍 Processing single dashboard data:', dashboardData);
    
    // METHOD 1: Check for direct "Categories" field (uppercase C)
    if (dashboardData.Categories && Array.isArray(dashboardData.Categories)) {
      console.log('✅ Found direct Categories array (uppercase):', dashboardData.Categories);
      categories = [...categories, ...dashboardData.Categories];
    }
    
    // METHOD 2: Check for direct "categories" field (lowercase c)
    if (dashboardData.categories && Array.isArray(dashboardData.categories)) {
      console.log('✅ Found direct categories array (lowercase):', dashboardData.categories);
      categories = [...categories, ...dashboardData.categories];
    }
    
    // METHOD 3: If no direct categories found, extract from table1 data - but filter properly
    if (categories.length === 0 && dashboardData.table1 && Array.isArray(dashboardData.table1) && dashboardData.table1.length > 0) {
      console.log('⚠️ No direct categories found, extracting from table1:', dashboardData.table1[0]);
      const firstRow = dashboardData.table1[0];
      if (typeof firstRow === 'object' && firstRow !== null) {
        const tableKeys = Object.keys(firstRow);
        console.log('Table1 keys:', tableKeys);
        
        // Filter out non-category keys - IMPROVED FILTERING
        const filteredTableKeys = tableKeys.filter(key => {
          const keyLower = key.toLowerCase();
          // Exclude common non-category fields
          const excludePatterns = [
            'week', 'date', 'time', 'id', 'index', 'total', 'grand', 
            'sum', 'count', 'avg', 'average', 'min', 'max', 'store',
            'location', 'file', 'upload', 'dashboard', 'data'
          ];
          
          return !excludePatterns.some(pattern => keyLower.includes(pattern));
        });
        
        console.log('Filtered table categories:', filteredTableKeys);
        categories = [...categories, ...filteredTableKeys];
      }
    }
    
    // Remove duplicates and filter out empty strings
    const finalCategories = [...new Set(categories)].filter(cat => 
      cat && 
      typeof cat === 'string' && 
      cat.trim() !== ''
    );
    
    console.log('Final categories for single dashboard:', finalCategories);
    return finalCategories;
    
  } catch (error) {
    console.error('Error extracting categories from single dashboard:', error);
    return [];
  }
};

const ExcelUploadPage: React.FC = () => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [currentEditingIndex, setCurrentEditingIndex] = useState<number | null>(null);
  const [locationInput, setLocationInput] = useState('');
  const [locationError, setLocationError] = useState('');
  const [selectedDashboard, setSelectedDashboard] = useState('Sales Split');
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
        location: selectedCity || '',
        dashboard: selectedDashboard,
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
        location: selectedCity || '',
        dashboard: selectedDashboard,
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
  const handleDashboardChange = (event: any) => {
    const value = event.target.value;
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
  
  // Upload a single file - Complete function with Product Mix support and categories extraction
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
      const base64Content = base64File.split(',')[1];
      
      // Store file info in Redux
      dispatch(setExcelFile({
        fileName: fileInfo.file.name,
        fileContent: base64Content,
        location: fileInfo.location
      }));
      
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
        location: fileInfo.location,
        dashboard: fileInfo.dashboard
      });
      
      // Clear the progress interval
      clearInterval(progressInterval);
      
      // Route data based on dashboard type from response
      if (response.data) {
        console.log('📨 Received response data:', response.data);
        
        // Extract categories from the response data
        const extractedCategories = extractCategoriesFromData(response.data);
        console.log('🏷️ Extracted categories:', extractedCategories);
        
        // Check if response.data is an array (multiple dashboards)
        if (Array.isArray(response.data)) {
          console.log('Multiple dashboards detected in response array');
          
          // Handle multiple dashboards (Sales Split + Product Mix, etc.)
          response.data.forEach((dashboardData) => {
            const dashboardName = dashboardData.dashboardName?.trim(); // Trim whitespace
            console.log(`Processing dashboard: "${dashboardName}" from array`);
            console.log('Dashboard data:', dashboardData);
            
            // Add categories to dashboard data
            const enhancedDashboardData = {
              ...dashboardData,
              categories: extractedCategories
            };
            
            if (dashboardName === 'Sales Split') {
              console.log('Sales Split dashboard detected in array - processing data');
              console.log("response.data[0].fileName", response.data[0].fileName);
              // Add to sales data in Redux
              dispatch(addSalesData({
                fileName: response.data[0].fileName, 
                fileContent: base64Content,
                location: fileInfo.location,
                data: enhancedDashboardData
              }));
              
              // Also add to regular file data for backward compatibility
              dispatch(addFileData({
                fileName: response.data[0].fileName, 
                fileContent: base64Content,
                location: fileInfo.location,
                data: enhancedDashboardData
              }));
            } else if (dashboardName === 'Product Mix') {
              console.log('Product Mix dashboard detected in array - processing data');
              
              // Add to product mix data in Redux
              dispatch(addProductMixData({
                fileName: response.data[0].fileName, 
                fileContent: base64Content,
                location: fileInfo.location,
                data: enhancedDashboardData
              }));
            } else if (dashboardName === 'Financials') {
              console.log('Financials dashboard detected in array - processing data');
              
              // Add to financial data in Redux
              dispatch(addFinancialData({
                fileName: fileInfo.file.name,
                fileContent: base64Content,
                location: fileInfo.location,
                data: enhancedDashboardData
              }));
            } else if (dashboardName === 'Sales Wide') {
              console.log('Sales Wide dashboard detected in array - processing data');
              
              // Add to sales wide data in Redux
              dispatch(addSalesWideData({
                fileName: fileInfo.file.name,
                fileContent: base64Content,
                location: fileInfo.location,
                data: enhancedDashboardData
              }));
            } else {
              console.log(`Unknown dashboard type: "${dashboardName}"`);
            }
          });
          
          // Update locations in Redux store for multiple dashboards
          if (fileInfo.location) {
            dispatch(setLocations([fileInfo.location]));
            dispatch(selectLocation(fileInfo.location));
          }
        } else {
          // Handle single dashboard (existing logic)
          const dashboardName = response.data.dashboardName?.trim() || fileInfo.dashboard;
          console.log(`Processing single dashboard: "${dashboardName}"`);
          console.log('Single dashboard data:', response.data);
          
          // Add categories to dashboard data
          const enhancedDashboardData = {
            ...response.data,
            categories: extractedCategories
          };
          
          // Dispatch based on dashboard type
          if (dashboardName === 'Financials') {
            console.log('Financials dashboard detected - processing data');
            
            // Add to financial data in Redux
            dispatch(addFinancialData({
              fileName: fileInfo.file.name,
              fileContent: base64Content,
              location: fileInfo.location,
              data: enhancedDashboardData
            }));
          } else if (dashboardName === 'Sales Split') {
            console.log('Sales Split dashboard detected - processing data');
            
            // Add to sales data in Redux
            dispatch(addSalesData({
              fileName: fileInfo.file.name,
              fileContent: base64Content,
              location: fileInfo.location,
              data: enhancedDashboardData
            }));
            
            // Also add to regular file data for backward compatibility
            dispatch(addFileData({
              fileName: fileInfo.file.name,
              fileContent: base64Content,
              location: fileInfo.location,
              data: enhancedDashboardData
            }));
          } else if (dashboardName === 'Sales Wide') {
            console.log('Sales Wide dashboard detected - processing data');
            
            // Add to sales wide data in Redux
            dispatch(addSalesWideData({
              fileName: fileInfo.file.name,
              fileContent: base64Content,
              location: fileInfo.location,
              data: enhancedDashboardData
            }));
          } else if (dashboardName === 'Product Mix') {
            console.log('Product Mix dashboard detected - processing data');
            
            // Add to product mix data in Redux
            dispatch(addProductMixData({
              fileName: fileInfo.file.name,
              fileContent: base64Content,
              location: fileInfo.location,
              data: enhancedDashboardData
            }));
          } else {
            console.log(`Unknown single dashboard type: "${dashboardName}"`);
          }
          
          // Update locations in Redux store for single dashboard  
          if (fileInfo.location) {
            dispatch(setLocations([fileInfo.location]));
            dispatch(selectLocation(fileInfo.location));
          }
        }
        
        // Update file status to success and store data with categories
        setFiles(prevFiles => {
          const updatedFiles = [...prevFiles];
          updatedFiles[index] = {
            ...updatedFiles[index],
            status: 'success',
            progress: 100,
            data: response.data,
            categories: extractedCategories // Store categories in file info
          };
          return updatedFiles;
        });
        
        console.log('✅ File upload completed successfully with categories:', extractedCategories);
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
    const pendingFiles = files.filter(file => file.status === 'pending' && file.location.trim());
    
    if (pendingFiles.length === 0) {
      setGeneralError('No files ready for upload. Please add location to files.');
      return;
    }
    
    // Upload files sequentially
    for (let i = 0; i < files.length; i++) {
      if (files[i].status === 'pending' && files[i].location.trim()) {
        await uploadFile(files[i], i);
      }
    }
  };
  
  // Remove file from list
  const removeFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };
  
  // Edit file location
  const editFileLocation = (index: number) => {
    setCurrentEditingIndex(index);
    setLocationInput(files[index].location);
    setLocationError('');
    setIsLocationDialogOpen(true);
  };
  
  // Handle location dialog save
  const handleLocationSave = () => {
    if (!locationInput.trim()) {
      setLocationError('Location is required');
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
    }
    
    setIsLocationDialogOpen(false);
    setCurrentEditingIndex(null);
    setLocationInput('');
    setLocationError('');
  };
  
  // Handle location dialog cancel
  const handleLocationCancel = () => {
    setIsLocationDialogOpen(false);
    setCurrentEditingIndex(null);
    setLocationInput('');
    setLocationError('');
  };
  
  // Handle city selection
  const handleCityChange = (event: any, newValue: string | null) => {
    setSelectedCity(newValue);
    setCityInputValue(newValue || '');
    
    // Update all pending files with the new city
    setFiles(prevFiles => 
      prevFiles.map(file => 
        file.status === 'pending' ? { ...file, location: newValue || '' } : file
      )
    );
  };
  
  // Get status icon
  const getStatusIcon = (status: FileStatus) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'uploading':
        return <CircularProgress size={24} />;
      default:
        return <DescriptionIcon color="action" />;
    }
  };
  
  // Get status color
  const getStatusColor = (status: FileStatus) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'uploading':
        return 'info';
      default:
        return 'default';
    }
  };
  
  // Navigate to dashboard based on file data
  const viewDashboard = (fileInfo: FileInfo) => {
    if (fileInfo.data && fileInfo.status === 'success') {
      const dashboardName = fileInfo.data.dashboardName || fileInfo.dashboard;
      
      switch (dashboardName) {
        case 'Financials':
          navigate('/Financials');
          break;
        case 'Sales Split':
          navigate('/manage-reports');
          break;
        case 'Sales Wide':
          navigate('/Saleswide');
          break;
        case 'Product Mix':
          navigate('/Productmix');
          break;
        default:
          navigate('/dashboard');
      }
    }
  };
  
  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        Excel File Upload & Dashboard Selection
      </Typography>
      
      {/* Dashboard Selection */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Dashboard Configuration
          </Typography>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Dashboard Type</InputLabel>
                <Select
                  value={selectedDashboard}
                  onChange={handleDashboardChange}
                  label="Dashboard Type"
                >
                  {DASHBOARD_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {option.icon}
                        {option.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                value={selectedCity}
                onChange={handleCityChange}
                inputValue={cityInputValue}
                onInputChange={(event, newInputValue) => {
                  setCityInputValue(newInputValue);
                }}
                options={US_CITIES}
                freeSolo
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Default Location"
                    placeholder="Select or type a city"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: <LocationCityIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            New files will use these settings by default. You can modify individual files after upload.
          </Typography>
        </CardContent>
      </Card>
      
      {/* File Upload Area */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <DropZone
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            sx={{
              borderColor: isDragging ? 'primary.dark' : 'primary.main',
              backgroundColor: isDragging ? 'action.hover' : 'background.default',
            }}
          >
            <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Drag & Drop Excel Files Here
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              or click to browse files
            </Typography>
            <Button
              variant="contained"
              startIcon={<FileUploadIcon />}
              onClick={(e) => e.stopPropagation()}
            >
              Browse Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              multiple
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </DropZone>
        </CardContent>
      </Card>
      
      {/* General Error Alert */}
      {generalError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {generalError}
        </Alert>
      )}
      
      {/* Files List */}
      {files.length > 0 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Uploaded Files ({files.length})
              </Typography>
              <Button
                variant="contained"
                onClick={uploadAllFiles}
                disabled={files.every(f => f.status !== 'pending' || !f.location.trim())}
                startIcon={<CloudUploadIcon />}
              >
                Upload All Files
              </Button>
            </Box>
            
            <List>
              {files.map((fileInfo, index) => (
                <React.Fragment key={index}>
                  <ListItem
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                      backgroundColor: 'background.paper'
                    }}
                  >
                    <ListItemIcon>
                      {getStatusIcon(fileInfo.status)}
                    </ListItemIcon>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography variant="subtitle1">
                            {fileInfo.file.name}
                          </Typography>
                          <Chip
                            label={fileInfo.dashboard}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          <Chip
                            label={fileInfo.status}
                            size="small"
                            color={getStatusColor(fileInfo.status) as any}
                          />
                          {/* Show categories count if available */}
                          {fileInfo.categories && fileInfo.categories.length > 0 && (
                            <Chip
                              label={`${fileInfo.categories.length} categories`}
                              size="small"
                              color="info"
                              variant="outlined"
                              icon={<CategoryIcon />}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <PlaceIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              {fileInfo.location || 'No location set'}
                            </Typography>
                          </Box>
                          
                         
                          
                          {fileInfo.status === 'uploading' && (
                            <Box sx={{ width: '100%', mt: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box sx={{ width: '100%', mr: 1 }}>
                                  <LinearProgress variant="determinate" value={fileInfo.progress} />
                                </Box>
                                <Box sx={{ minWidth: 35 }}>
                                  <Typography variant="body2" color="text.secondary">
                                    {`${Math.round(fileInfo.progress)}%`}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          )}
                          
                          {fileInfo.error && (
                            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                              {fileInfo.error}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {fileInfo.status === 'success' && (
                        <IconButton
                          color="primary"
                          onClick={() => viewDashboard(fileInfo)}
                          title="View Dashboard"
                        >
                          <FileOpenIcon />
                        </IconButton>
                      )}
                      
                      {fileInfo.status === 'pending' && (
                        <IconButton
                          color="primary"
                          onClick={() => editFileLocation(index)}
                          title="Edit Location"
                        >
                          <EditIcon />
                        </IconButton>
                      )}
                      
                      <IconButton
                        color="error"
                        onClick={() => removeFile(index)}
                        title="Remove File"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </ListItem>
                  
                  {index < files.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
      
      {/* Location Dialog */}
      <Dialog open={isLocationDialogOpen} onClose={handleLocationCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Set File Location</DialogTitle>
        <DialogContent>
          <Autocomplete
            value={locationInput}
            onChange={(event, newValue) => {
              setLocationInput(newValue || '');
              setLocationError('');
            }}
            inputValue={locationInput}
            onInputChange={(event, newInputValue) => {
              setLocationInput(newInputValue);
              setLocationError('');
            }}
            options={US_CITIES}
            freeSolo
            renderInput={(params) => (
              <TextField
                {...params}
                label="Location"
                placeholder="Select or type a location"
                fullWidth
                margin="normal"
                error={!!locationError}
                helperText={locationError}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: <PlaceIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            )}
          />
          <FormHelperText>
            Choose a location for this file to help organize your data.
          </FormHelperText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLocationCancel}>Cancel</Button>
          <Button onClick={handleLocationSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExcelUploadPage;
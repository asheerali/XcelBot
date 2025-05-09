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
  Tooltip,
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
  FormControl
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
  'Financial Dashboard',
  'Sales Wide',
  'Product Mix'
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
        location: '', // Empty location initially
        dashboard: selectedDashboard, // Use the global dashboard selection
      }));
      
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
      setGeneralError(null);
      
      // Open the location dialog for the first file
      if (newFiles.length > 0) {
        setCurrentEditingIndex(prevFiles.length);
        setLocationInput('');
        setLocationError('');
        setIsLocationDialogOpen(true);
      }
    }
  }, [files.length]);
  
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
        location: '', // Empty location initially
        dashboard: selectedDashboard, // Use the global dashboard selection
      }));
      
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
      setGeneralError(null);
      
      // Open the location dialog for the first file
      if (newFiles.length > 0) {
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
  }, [files.length]);
  
  // Handle global dashboard change
  const handleDashboardChange = (value: string) => {
    setSelectedDashboard(value);
    
    // Update all pending files to use the new dashboard
    setFiles(prevFiles => 
      prevFiles.map(file => 
        file.status === 'pending' 
          ? { ...file, dashboard: value } 
          : file
      )
    );
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
      dispatch({ 
        type: 'excel/setExcelFile', 
        payload: {
          fileName: fileInfo.file.name,
          fileContent: base64Content,
          location: fileInfo.location, // Add location to redux state
          dashboard: fileInfo.dashboard // Add dashboard to redux state
        }
      });
      
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
      
      // Update Redux with the response data
      if (response.data) {
        dispatch({ 
          type: 'excel/addFileData', 
          payload: {
            fileName: fileInfo.file.name,
            location: fileInfo.location,
            dashboard: fileInfo.dashboard,
            data: response.data
          }
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
    
    for (let i = 0; i < files.length; i++) {
      if (files[i].status === 'pending') {
        const success = await uploadFile(files[i], i);
        if (success) {
          successCount++;
        }
      }
    }
    
    // Store all locations and dashboards in Redux
    const successfulFiles = files
      .filter(f => f.status === 'success')
      .map(f => ({ location: f.location, dashboard: f.dashboard }));
    
    if (successfulFiles.length > 0) {
      dispatch({
        type: 'excel/setLocations',
        payload: successfulFiles.map(f => f.location)
      });
      
      dispatch({
        type: 'excel/setDashboards',
        payload: successfulFiles
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
    // Store all locations and dashboards in Redux before navigating
    const successfulFiles = files
      .filter(f => f.status === 'success')
      .map(f => ({ location: f.location, dashboard: f.dashboard }));
    
    if (successfulFiles.length > 0) {
      dispatch({
        type: 'excel/setLocations',
        payload: successfulFiles.map(f => f.location)
      });
      
      dispatch({
        type: 'excel/setDashboards',
        payload: successfulFiles
      });
    }
    
    navigate('/manage-reports');
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
    
    // Check for duplicate locations
    const isDuplicate = files.some((file, index) => 
      index !== currentEditingIndex && 
      file.location.toLowerCase() === locationInput.trim().toLowerCase()
    );
    
    if (isDuplicate) {
      // setLocationError('Location name must be unique');
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
      <Typography variant="h4" gutterBottom>
        Excel File Upload
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Upload Excel files (.xlsx or .xls), with each file representing a single location. 
        All files will be processed for the selected dashboard.
      </Typography>
      
      <Grid container spacing={3}>
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
                Each file should represent a single location
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
                    
                    {/* Global dashboard selection dropdown */}
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                      <InputLabel id="global-dashboard-select">Dashboard</InputLabel>
                      <Select
                        labelId="global-dashboard-select"
                        value={selectedDashboard}
                        label="Dashboard"
                        onChange={(e) => handleDashboardChange(e.target.value)}
                        startAdornment={<DashboardIcon sx={{ mr: 1, ml: -0.5 }} />}
                      >
                        {DASHBOARD_OPTIONS.map(option => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>Select dashboard for all files</FormHelperText>
                    </FormControl>
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
                
                {/* File list with dashboard dropdown */}
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
import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

// Icons
import DescriptionIcon from '@mui/icons-material/Description';
import LaunchIcon from '@mui/icons-material/Launch';
import DeleteIcon from '@mui/icons-material/Delete';
import PlaceIcon from '@mui/icons-material/Place';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

// Redux
import { useAppDispatch, useAppSelector } from '../typedHooks';
import { selectLocation, resetExcelData } from '../store/excelSlice';

interface MinimalFileManagerProps {
  onFileSelect: (location: string) => void;
}

const MinimalFileManager: React.FC<MinimalFileManagerProps> = ({ onFileSelect }) => {
  const [expanded, setExpanded] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  // Get state from Redux
  const { 
    files,
    location: currentLocation,
  } = useAppSelector((state) => state.excel);
  
  const dispatch = useAppDispatch();
  
  // Toggle expand/collapse
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  // Handle file selection
  const handleFileSelect = (location: string) => {
    dispatch(selectLocation(location));
    onFileSelect(location);
  };
  
  return (
    <Card sx={{ mb: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          cursor: 'pointer',
          bgcolor: '#4A90E2',
          color: 'white',
        }}
        onClick={toggleExpanded}
      >
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
          Uploaded Files
          {files.length > 0 && (
            <Chip 
              label={files.length} 
              color="error" 
              size="small" 
              sx={{ ml: 1, height: 20, minWidth: 20 }} 
            />
          )}
        </Typography>
        {expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
      </Box>
      
      {expanded && (
        <Box sx={{ p: 0 }}>
          {files.length === 0 ? (
            <Box p={3} textAlign="center">
              <Typography color="text.secondary">
                No files uploaded yet.
              </Typography>
            </Box>
          ) : (
            <>
              <List sx={{ p: 0 }}>
                {files.map((file, index) => (
                  <ListItem
                    key={`${file.fileName}-${file.location}`}
                    sx={{
                      borderBottom: '1px solid #eee',
                      bgcolor: file.location === currentLocation ? '#f5f5f5' : 'transparent',
                    }}
                  >
                    <ListItemIcon>
                      <DescriptionIcon color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary={file.fileName}
                      secondary={
                        <Chip
                          icon={<PlaceIcon />}
                          label={file.location}
                          size="small"
                          variant="outlined"
                          color="primary"
                          sx={{ mt: 0.5 }}
                        />
                      }
                    />
                    <IconButton 
                      size="small" 
                      onClick={() => handleFileSelect(file.location)}
                      title="View"
                    >
                      <LaunchIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => {
                        // Here you would implement file deletion logic
                        // dispatch(removeFile(index));
                      }}
                      title="Delete"
                      sx={{ ml: 1 }}
                    >
                      <DeleteIcon color="error" />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
              
              <Box p={2} display="flex" justifyContent="flex-end">
                <Button 
                  variant="contained" 
                  color="error" 
                  startIcon={<DeleteIcon />}
                  size="small"
                  onClick={() => setConfirmDelete(true)}
                >
                  CLEAR ALL FILES
                </Button>
              </Box>
            </>
          )}
        </Box>
      )}
      
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
      >
        <DialogTitle>Clear All Files?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to clear all files? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button 
            onClick={() => {
              dispatch(resetExcelData());
              setConfirmDelete(false);
            }} 
            color="error"
            variant="contained"
          >
            Clear All
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default MinimalFileManager;
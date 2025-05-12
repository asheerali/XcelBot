import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Grid,
  Chip,
  Paper,
  Button,
  Divider,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Badge,
  Alert,
  Tooltip,
  Collapse
} from '@mui/material';

// Icons
import DescriptionIcon from '@mui/icons-material/Description';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PlaceIcon from '@mui/icons-material/Place';
import LaunchIcon from '@mui/icons-material/Launch';
import DeleteIcon from '@mui/icons-material/Delete';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import InfoIcon from '@mui/icons-material/Info';
import FileOpenIcon from '@mui/icons-material/FileOpen';

// Redux
import { useAppDispatch, useAppSelector } from '../typedHooks';
import { selectLocation, resetExcelData } from '../store/excelSlice';

interface FileManagerProps {
  onViewFile: (location: string) => void;
}

const FileManagerComponent: React.FC<FileManagerProps> = ({ onViewFile }) => {
  const [expanded, setExpanded] = useState(true);
  const [selectedFileIndex, setSelectedFileIndex] = useState<number | null>(null);
  const [switchDialogOpen, setSwitchDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newLocation, setNewLocation] = useState('');
  
  // Get state from Redux
  const { 
    files,
    allLocations,
    fileName,
    location: currentLocation,
  } = useAppSelector((state) => state.excel);
  
  const dispatch = useAppDispatch();
  
  // Handle expand/collapse
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  
  // Handle view file
  const handleViewFile = (location: string) => {
    dispatch(selectLocation(location));
    onViewFile(location);
  };
  
  // Handle switch location dialog
  const openSwitchDialog = (index: number) => {
    setSelectedFileIndex(index);
    setSwitchDialogOpen(true);
  };
  
  const closeSwitchDialog = () => {
    setSwitchDialogOpen(false);
    setSelectedFileIndex(null);
  };
  
  const handleLocationChange = (event: SelectChangeEvent) => {
    setNewLocation(event.target.value);
  };
  
  const confirmLocationSwitch = () => {
    if (selectedFileIndex !== null && newLocation) {
      // You would dispatch an action to update the location in your store
      // For example: dispatch(updateFileLocation({ index: selectedFileIndex, location: newLocation }));
      closeSwitchDialog();
    }
  };
  
  // Handle delete file dialog
  const openDeleteDialog = (index: number) => {
    setSelectedFileIndex(index);
    setDeleteDialogOpen(true);
  };
  
  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedFileIndex(null);
  };
  
  const confirmDelete = () => {
    if (selectedFileIndex !== null) {
      // You would dispatch an action to delete the file from your store
      // For example: dispatch(removeFile(selectedFileIndex));
      closeDeleteDialog();
    }
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
          bgcolor: 'primary.light',
          color: 'white',
        }}
        onClick={toggleExpand}
      >
        <Typography variant="h6">
          <Badge
            badgeContent={files.length}
            color="error"
            sx={{ '& .MuiBadge-badge': { top: -5, right: -15 } }}
          >
            Uploaded Files
          </Badge>
        </Typography>
        {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </Box>
      
      <Collapse in={expanded}>
        {files.length === 0 ? (
          <Box p={3} textAlign="center">
            <Typography color="text.secondary">
              No files uploaded yet. Go to Upload Excel to add files.
            </Typography>
            <Button 
              variant="outlined" 
              sx={{ mt: 2 }}
              component="a" 
              href="/upload-excel"
              startIcon={<FileOpenIcon />}
            >
              Upload Files
            </Button>
          </Box>
        ) : (
          <List sx={{ p: 1 }}>
            {files.map((file, index) => (
              <ListItem
                key={`${file.fileName}-${file.location}`}
                sx={{
                  mb: 1,
                  border: '1px solid',
                  borderColor: file.location === currentLocation ? 'primary.main' : 'divider',
                  borderRadius: 1,
                  bgcolor: file.location === currentLocation ? 'primary.light' : 'transparent',
                  '&:hover': {
                    bgcolor: file.location === currentLocation ? 'primary.light' : 'action.hover',
                  },
                }}
              >
                <ListItemIcon>
                  <DescriptionIcon color={file.location === currentLocation ? 'primary' : 'action'} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography 
                      variant="body1" 
                      color={file.location === currentLocation ? 'white' : 'text.primary'}
                      sx={{ fontWeight: file.location === currentLocation ? 'bold' : 'normal' }}
                    >
                      {file.fileName}
                    </Typography>
                  }
                  secondary={
                    <Chip
                      icon={<PlaceIcon />}
                      label={file.location}
                      size="small"
                      color={file.location === currentLocation ? 'secondary' : 'default'}
                      sx={{ mt: 0.5 }}
                    />
                  }
                />
                <ListItemSecondaryAction>
                  <Tooltip title="View Analysis">
                    <IconButton 
                      edge="end" 
                      onClick={() => handleViewFile(file.location)}
                      sx={{ mr: 1 }}
                      color={file.location === currentLocation ? 'secondary' : 'default'}
                    >
                      <LaunchIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Switch Location">
                    <IconButton 
                      edge="end" 
                      onClick={() => openSwitchDialog(index)}
                      sx={{ mr: 1 }}
                      color="default"
                    >
                      <SwapHorizIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete File">
                    <IconButton 
                      edge="end" 
                      onClick={() => openDeleteDialog(index)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
        
        {files.length > 0 && (
          <Box p={2} display="flex" justifyContent="flex-end">
            <Button 
              variant="outlined" 
              color="error" 
              startIcon={<DeleteIcon />}
              onClick={() => {
                if (confirm('Are you sure you want to clear all files? This cannot be undone.')) {
                  dispatch(resetExcelData());
                }
              }}
            >
              Clear All Files
            </Button>
          </Box>
        )}
      </Collapse>
      
      {/* Switch Location Dialog */}
      <Dialog open={switchDialogOpen} onClose={closeSwitchDialog}>
        <DialogTitle>Change Location</DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph>
            Change the location for {selectedFileIndex !== null && files[selectedFileIndex]?.fileName}
          </Typography>
          <FormControl fullWidth>
            <InputLabel>New Location</InputLabel>
            <Select
              value={newLocation}
              label="New Location"
              onChange={handleLocationChange}
            >
              {allLocations.map((loc) => (
                <MenuItem key={loc} value={loc}>{loc}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeSwitchDialog}>Cancel</Button>
          <Button onClick={confirmLocationSwitch} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete File Dialog */}
      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>Delete File</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete {selectedFileIndex !== null && files[selectedFileIndex]?.fileName}?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            This action cannot be undone.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default FileManagerComponent;
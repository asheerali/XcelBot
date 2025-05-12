// components/FilesList.tsx
import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Chip,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';

// Icons
import DescriptionIcon from '@mui/icons-material/Description';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DeleteIcon from '@mui/icons-material/Delete';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

// Redux
import { useAppDispatch, useAppSelector } from '../typedHooks';
import { selectLocation } from '../store/excelSlice';

interface FilesListProps {
  onSelectFile?: (location: string) => void;
  onDeleteFile?: (fileName: string, location: string) => void;
}

const FilesList: React.FC<FilesListProps> = ({ onSelectFile, onDeleteFile }) => {
  const dispatch = useAppDispatch();
  const { files, location: selectedLocation } = useAppSelector((state) => state.excel);

  // Sort files by upload date (newest first)
  const sortedFiles = [...files].sort((a, b) => {
    if (!a.uploadDate || !b.uploadDate) return 0;
    return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
  });

  const handleSelectFile = (location: string) => {
    dispatch(selectLocation(location));
    if (onSelectFile) {
      onSelectFile(location);
    }
  };

  const handleDeleteFile = (fileName: string, location: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (onDeleteFile) {
      onDeleteFile(fileName, location);
    }
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Uploaded Files ({files.length})
          </Typography>
        </Box>

        {files.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
            No files uploaded yet. Use the "Choose Excel File" button to upload a file.
          </Typography>
        ) : (
          <List dense>
            {sortedFiles.map((file, index) => (
              <React.Fragment key={`${file.location}-${file.fileName}`}>
                <ListItem 
                  disablePadding
                  secondaryAction={
                    <Tooltip title="Remove file">
                      <IconButton 
                        edge="end" 
                        aria-label="delete" 
                        onClick={(e) => handleDeleteFile(file.fileName, file.location, e)}
                        size="small"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  }
                >
                  <ListItemButton 
                    onClick={() => handleSelectFile(file.location)}
                    selected={selectedLocation === file.location}
                    sx={{
                      borderRadius: 1,
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(25, 118, 210, 0.08)',
                      },
                      '&.Mui-selected:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.12)',
                      },
                    }}
                  >
                    <ListItemIcon>
                      <DescriptionIcon color={selectedLocation === file.location ? "primary" : "action"} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography 
                            component="span" 
                            variant="body2" 
                            color={selectedLocation === file.location ? "primary" : "text.primary"}
                            fontWeight={selectedLocation === file.location ? "medium" : "normal"}
                          >
                            {file.fileName}
                          </Typography>
                          <Chip 
                            icon={<LocationOnIcon fontSize="small" />} 
                            label={file.location} 
                            size="small" 
                            color={selectedLocation === file.location ? "primary" : "default"}
                            variant={selectedLocation === file.location ? "filled" : "outlined"}
                            sx={{ fontSize: '0.75rem' }}
                          />
                          {file.dashboard && (
                            <Chip 
                              icon={<DashboardIcon fontSize="small" />} 
                              label={file.dashboard} 
                              size="small"
                              color={selectedLocation === file.location ? "secondary" : "default"}
                              variant={selectedLocation === file.location ? "filled" : "outlined"}
                              sx={{ fontSize: '0.75rem' }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <AccessTimeIcon sx={{ fontSize: '0.875rem', color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(file.uploadDate)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
                {index < sortedFiles.length - 1 && <Divider component="li" variant="inset" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default FilesList;
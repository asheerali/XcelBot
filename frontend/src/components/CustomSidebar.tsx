// src/components/CustomSidebar.tsx
import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Button,
  Divider,
  IconButton,
  useMediaQuery,
  useTheme,
  styled,
  CircularProgress
} from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Import your icons
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import UploadFileIcon from '@mui/icons-material/UploadFile';

// Import your typed Redux hooks
import { useAppDispatch, useAppSelector } from '../typedHooks';
import { 
  setExcelFile, 
  setLoading, 
  setError, 
  setTableData 
} from '../store/excelSlice';

// API URL for Excel upload
const API_URL = 'http://localhost:8000/api/excel/upload';

const drawerWidth = 260;

// The styled input for hidden file upload
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

// Navigation item type
interface NavItem {
  title: string;
  path: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  logo?: React.ReactNode;
  title?: string;
  onSignOut?: () => void;
}

const CustomSidebar: React.FC<SidebarProps> = ({ 
  logo, 
  title = 'Audit IQ',
  onSignOut
}) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Get state from Redux
  const { fileName, loading } = useAppSelector((state) => state.excel);

  // Define sidebar navigation based on your existing items
  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      path: '/manage-reports',
      icon: <ShoppingCartIcon />
    },
    {
      title: 'Sales Analysis',
      path: '/upload',
      icon: <CloudUploadIcon />
    },
    {
      title: 'Dashboard 2',
      path: '/manage-reports',
      icon: <NewspaperIcon />
    },
    {
      title: 'Dashboard 3',
      path: '/manage-reports',
      icon: <NewspaperIcon />
    },
    {
      title: 'HelpCenter',
      path: '/HelpCenter',
      icon: <NewspaperIcon />
    },
    {
      title: 'Payments',
      path: '/Payments',
      icon: <NewspaperIcon />
    },
    {
      title: 'User Permissions',
      path: '/UserPermissions',
      icon: <NewspaperIcon />
    }
  ];

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setOpen(!open);
    }
  };

  const handleItemClick = (path: string) => {
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  // Convert file to base64
  const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

  // Process uploaded Excel file
  const processExcelFile = async (file: File) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      // Convert file to base64
      const base64File = await toBase64(file);
      const base64Content = base64File.split(',')[1]; // Remove data:application/... prefix
      
      // Store file info in Redux
      dispatch(setExcelFile({
        fileName: file.name,
        fileContent: base64Content
      }));
      
      // Send to backend
      const response = await axios.post(API_URL, {
        fileName: file.name,
        fileContent: base64Content
      });
      
      // Update table data with response
      if (response.data) {
        dispatch(setTableData(response.data));
        
        // Navigate to the Excel import page to show the processed data
        navigate('/upload');
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
      
      dispatch(setError(errorMessage));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Process the Excel file
      await processExcelFile(file);
      
      // If you're using this with mobile view, you might want to close the drawer
      if (isMobile) {
        setMobileOpen(false);
      }
    }
  };

  const renderNavItems = (items: NavItem[]) => {
    return items.map((item) => {
      const isSelected = location.pathname === item.path;
      
      return (
        <ListItem 
          key={item.path}
          disablePadding
        >
          <ListItemButton
            component={Link}
            to={item.path}
            onClick={() => handleItemClick(item.path)}
            selected={isSelected}
            sx={{
              minHeight: 48,
              justifyContent: open ? 'initial' : 'center',
              px: 2.5,
              borderRadius: '8px',
              mx: 1,
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
                '& .MuiListItemIcon-root': {
                  color: 'white'
                }
              }
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 2 : 'auto',
                justifyContent: 'center',
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.title} 
              sx={{ 
                opacity: open ? 1 : 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }} 
            />
          </ListItemButton>
        </ListItem>
      );
    });
  };

  const drawer = (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        {logo ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {logo}
            {open && (
              <Typography
                variant="h6"
                component="div"
                sx={{ ml: 1, fontWeight: 'bold' }}
              >
                {title}
              </Typography>
            )}
          </Box>
        ) : (
          <Typography
            variant="h6"
            component="div"
            sx={{ 
              fontWeight: 'bold',
              opacity: open ? 1 : 0
            }}
          >
            {title}
          </Typography>
        )}
      </Box>
      
      {/* File Upload Button */}
      <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <input
          type="file"
          id="excel-upload"
          accept=".xlsx, .xls"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <label htmlFor="excel-upload" style={{ width: '100%' }}>
          <Button
            variant="contained"
            component="span"
            fullWidth
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <UploadFileIcon />}
            disabled={loading}
          >
            {open ? (loading ? 'Processing...' : 'Upload Excel') : ''}
          </Button>
        </label>
        
        {/* Show file name if a file is selected and drawer is open */}
        {fileName && open && (
          <Typography 
            variant="caption" 
            component="div" 
            sx={{ 
              mt: 1, 
              textAlign: 'center', 
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%'
            }}
          >
            {fileName}
          </Typography>
        )}
      </Box>
      
      <List sx={{ p: 1, mt: 1 }}>
        {renderNavItems(navItems)}
      </List>
      
      <Box sx={{ flexGrow: 1 }} />
      
      <Divider />
      <Box sx={{ p: 2 }}>
        {onSignOut && (
          <Button 
            fullWidth 
            variant="outlined" 
            color="secondary"
            onClick={onSignOut}
            sx={{ justifyContent: open ? 'center' : 'flex-start' }}
          >
            {open && 'Sign Out'}
          </Button>
        )}
      </Box>
    </>
  );

  return (
    <>
      {/* Mobile drawer toggle button */}
      {isMobile && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ 
            position: 'fixed', 
            top: 10, 
            left: 10, 
            zIndex: theme.zIndex.drawer + 2,
            bgcolor: 'background.paper',
            boxShadow: 1,
            '&:hover': {
              bgcolor: 'background.default'
            }
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* Mobile drawer (temporary) */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundImage: 'none',
              bgcolor: 'background.paper'
            },
          }}
        >
          {drawer}
        </Drawer>
      ) : (
        // Desktop drawer (permanent)
        <Drawer
          variant="permanent"
          open={open}
          sx={{
            width: open ? drawerWidth : 64,
            flexShrink: 0,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            '& .MuiDrawer-paper': {
              overflow: 'hidden',
              width: open ? drawerWidth : 64,
              boxSizing: 'border-box',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              backgroundImage: 'none',
              bgcolor: 'background.paper'
            },
          }}
        >
          {drawer}
        </Drawer>
      )}

      {/* Toggle button for desktop */}
      {!isMobile && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 16,
            left: open ? drawerWidth - 20 : 44,
            zIndex: theme.zIndex.drawer + 1,
            transition: theme.transitions.create(['left'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }}
        >
          <IconButton
            onClick={handleDrawerToggle}
            size="small"
            sx={{
              bgcolor: 'background.paper',
              boxShadow: 2,
              borderRadius: '50%',
              width: 32,
              height: 32,
              '&:hover': {
                bgcolor: 'background.default'
              }
            }}
          >
            {open ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>
      )}
    </>
  );
};

export default CustomSidebar;
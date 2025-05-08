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
  styled
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

// Import the same icons you're already using
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const drawerWidth = 260;

// This was causing the error - now it's imported from MUI properly
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
  action?: 'upload';
}

interface SidebarProps {
  logo?: React.ReactNode;
  title?: string;
  onSignOut?: () => void;
  onFileUpload?: (file: File) => void;
}

const CustomSidebar: React.FC<SidebarProps> = ({ 
  logo, 
  title = 'Audit IQ',
  onSignOut,
  onFileUpload
}) => {
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Define sidebar navigation based on your existing items
  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      path: '/manage-reports',
      icon: <ShoppingCartIcon />
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
    },
    // Additional item for file upload functionality
    {
      title: 'Upload Excel',
      path: '/upload',
      icon: <CloudUploadIcon />,
      action: 'upload'
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0 && onFileUpload) {
      onFileUpload(files[0]);
    }
  };

  const renderNavItems = (items: NavItem[]) => {
    return items.map((item) => {
      const isSelected = location.pathname === item.path;
      
      return (
        <React.Fragment key={item.path}>
          {item.action === 'upload' ? (
            <ListItem disablePadding>
              <Button
                component="label"
                variant="outlined"
                startIcon={item.icon}
                sx={{ 
                  m: 1, 
                  width: 'calc(100% - 16px)',
                  justifyContent: 'flex-start'
                }}
              >
                {item.title}
                <VisuallyHiddenInput type="file" onChange={handleFileChange} accept=".xlsx,.xls" />
              </Button>
            </ListItem>
          ) : (
            <ListItem disablePadding>
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
          )}
        </React.Fragment>
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
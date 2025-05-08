// src/components/CustomSidebar.tsx (updated with upload page link)
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
import { Link, useLocation, useNavigate } from 'react-router-dom';

// Import your icons
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import HelpIcon from '@mui/icons-material/Help';
import PaymentIcon from '@mui/icons-material/Payment';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import BarChartIcon from '@mui/icons-material/BarChart';

// Import Redux hooks
import { useAppSelector } from '../typedHooks';

const drawerWidth = 260;

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
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Get state from Redux
  const { fileName } = useAppSelector((state) => state.excel);

  // Define sidebar navigation based on your existing items
  const navItems: NavItem[] = [
    {
      title: 'Upload Excel',
      path: '/upload-excel',
      icon: <UploadFileIcon />
    },
    {
      title: 'Dashboard',
      path: '/manage-reports',
      icon: <BarChartIcon />
    },
    {
      title: 'Dashboard 3',
      path: '/dashboard3',
      icon: <NewspaperIcon />
    },
    {
      title: 'Help Center',
      path: '/HelpCenter',
      icon: <HelpIcon />
    },
    {
      title: 'Payments',
      path: '/Payments',
      icon: <PaymentIcon />
    },
    {
      title: 'User Permissions',
      path: '/UserPermissions',
      icon: <AdminPanelSettingsIcon />
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
      
      {/* If there's an active Excel file, show it at the top */}
      {fileName && (
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="subtitle2" gutterBottom>
            Active File:
          </Typography>
          <Typography
            variant="body2"
            component="div"
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {fileName}
          </Typography>
        </Box>
      )}
      
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
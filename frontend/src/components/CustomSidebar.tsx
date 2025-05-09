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
  alpha,
  Tooltip
} from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';

// Import your icons
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import HelpIcon from '@mui/icons-material/Help';
import PaymentIcon from '@mui/icons-material/Payment';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import BarChartIcon from '@mui/icons-material/BarChart';

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
  title = 'InsightIQ',
  onSignOut
}) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Define sidebar navigation - reordered with Help Center at the end and Payments second to last
  const navItems: NavItem[] = [
    {
      title: 'Upload Excel',
      path: '/upload-excel',
      icon: <UploadFileIcon />
    },
    {
      title: 'Sales Split',
      path: '/manage-reports',
      icon: <BarChartIcon />
    },
    {
      title: 'Financial Dashboard',
      path: '/Financial',
      icon: <NewspaperIcon />
    },
    {
      title: 'Sales Wide',
      path: '/Saleswide',
      icon: <NewspaperIcon />
    },
    {
      title: 'Product Mix',
      path: '/Productmix',
      icon: <NewspaperIcon />
    },
    {
      title: 'User Permissions',
      path: '/UserPermissions',
      icon: <AdminPanelSettingsIcon />
    },
    {
      title: 'Payments',
      path: '/Payments',
      icon: <PaymentIcon />
    },
    {
      title: 'Help Center',
      path: '/HelpCenter',
      icon: <HelpIcon />
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
              borderRadius: '10px',
              mx: 1,
              mb: 0.5,
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.2s ease-in-out',
              '&::before': {
                content: '""',
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                width: '4px',
                backgroundColor: isSelected ? 'primary.main' : 'transparent',
                borderRadius: '4px',
                transition: 'all 0.2s ease-in-out'
              },
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                '&::before': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.5)
                }
              },
              '&.Mui-selected': {
                backgroundColor: alpha(theme.palette.primary.main, 0.15),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.25),
                },
                '& .MuiListItemIcon-root': {
                  color: 'primary.main'
                },
                '& .MuiListItemText-primary': {
                  fontWeight: 'bold',
                  color: 'primary.main'
                },
                '&::before': {
                  backgroundColor: 'primary.main'
                }
              },
              boxShadow: isSelected ? 
                `0 0 10px 1px ${alpha(theme.palette.primary.main, 0.15)}` : 'none'
            }}
          >
            <Tooltip title={open ? "" : item.title} placement="right" arrow>
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 2 : 'auto',
                  justifyContent: 'center',
                  color: isSelected ? 'primary.main' : 'text.secondary',
                }}
              >
                {item.icon}
              </ListItemIcon>
            </Tooltip>
            <ListItemText 
              primary={item.title} 
              sx={{ 
                opacity: open ? 1 : 0,
                display: open ? 'block' : 'none',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                '& .MuiTypography-root': {
                  fontWeight: isSelected ? 600 : 400,
                }
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
          justifyContent: 'center',
          p: open ? 2 : 1,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
          boxShadow: `0 1px 3px ${alpha(theme.palette.common.black, 0.08)}`,
          backgroundColor: theme.palette.background.paper,
          position: 'sticky',
          top: 0,
          zIndex: 1
        }}
      >
        {logo ? (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'flex-start',
            width: '100%'
          }}>
            {logo}
            {open && (
              <Typography
                variant="h6"
                component="div"
                sx={{ 
                  ml: 1, 
                  fontWeight: 'bold',
                  color: 'primary.main',
                  fontSize: '1.5rem'
                }}
              >
                {title}
              </Typography>
            )}
          </Box>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'flex-start',
            width: '100%'
          }}>
            <Typography
              variant="h6"
              component="div"
              sx={{ 
                fontWeight: 'bold',
                color: 'primary.main',
                fontSize: '1.5rem',
                opacity: open ? 1 : 0
              }}
            >
              {open ? title : ''}
            </Typography>
          </Box>
        )}
      </Box>
      
      <List sx={{ p: 1, mt: 1 }}>
        {renderNavItems(navItems)}
      </List>
      
      <Box sx={{ flexGrow: 1 }} />
      
      <Divider sx={{ borderColor: alpha(theme.palette.divider, 0.7) }} />
      <Box sx={{ 
        p: 2, 
        display: 'flex',
        justifyContent: 'center'
      }}>
        {onSignOut && (
          <Tooltip title={open ? "" : "Sign Out"} placement="right">
            <Button 
              fullWidth 
              variant="outlined" 
              color="secondary"
              onClick={onSignOut}
              sx={{ 
                justifyContent: open ? 'center' : 'center',
                minWidth: 0,
                width: open ? '100%' : '40px',
                height: '40px',
                padding: open ? undefined : '8px',
                borderRadius: '10px',
                boxShadow: `0 1px 3px ${alpha(theme.palette.common.black, 0.1)}`,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: `0 3px 6px ${alpha(theme.palette.common.black, 0.15)}`,
                  backgroundColor: alpha(theme.palette.secondary.main, 0.08)
                }
              }}
            >
              {open ? 'Sign Out' : ''}
            </Button>
          </Tooltip>
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
            boxShadow: `0 2px 5px ${alpha(theme.palette.common.black, 0.15)}`,
            '&:hover': {
              bgcolor: alpha(theme.palette.background.default, 0.9)
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
              bgcolor: 'background.paper',
              boxShadow: `5px 0 10px ${alpha(theme.palette.common.black, 0.15)}`,
              borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`
            },
          }}
        >
          {drawer}
        </Drawer>
      ) : (
        // Desktop drawer (permanent)
        <Box sx={{ position: 'relative', display: 'flex' }}>
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
                bgcolor: 'background.paper',
                boxShadow: `4px 0 10px ${alpha(theme.palette.common.black, 0.1)}`,
                borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`
              },
            }}
          >
            {drawer}
          </Drawer>
          
          {/* Add a toggle button outside the drawer for guaranteed visibility */}
          <IconButton
            onClick={handleDrawerToggle}
            aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
            sx={{
              position: 'absolute',
              top: '50%',
              right: open ? -20 : -20,
              transform: 'translateY(-50%)',
              bgcolor: '#FFFFFF',
              boxShadow: '0 0 8px rgba(0,0,0,0.2)',
              borderRadius: '50%',
              width: 40,
              height: 40,
              border: '1px solid rgba(0,0,0,0.1)',
              zIndex: 1300,
              '&:hover': {
                bgcolor: '#F8F9FA',
              }
            }}
          >
            {open 
              ? <ChevronLeftIcon fontSize="small" />
              : <ChevronRightIcon fontSize="small" />
            }
          </IconButton>
        </Box>
      )}
    </>
  );
};

export default CustomSidebar;
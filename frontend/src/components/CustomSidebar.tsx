import { useState } from 'react';
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
  alpha,
  Tooltip
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';

// UPDATED IMPORTS: Better, more relevant icons for each section
import UploadFileIcon from '@mui/icons-material/UploadFile';           // Upload Excel - Perfect fit
import BarChartIcon from '@mui/icons-material/BarChart';               // Sales Split - Chart visualization
import CategoryIcon from '@mui/icons-material/Category';               // Product Mix - Product categories
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';   // Financials - Financial/banking
import TrendingUpIcon from '@mui/icons-material/TrendingUp';           // Companywide Sales - Sales growth
import PaymentIcon from '@mui/icons-material/Payment';                 // Payments - Payment processing
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';        // Help Center - Help/support
import BusinessIcon from '@mui/icons-material/Business';              // Company - Corporate/business

const drawerWidth = 260;
const gradientBackground = 'linear-gradient(180deg, #050b1b 0%, #150949 100%)';

// Custom Logo Component - Exact same design as homepage
const CustomLogo = ({ size = 32 }) => (
  <Box
    sx={{
      width: size,
      height: size,
      borderRadius: '50%', // Perfect circle like homepage
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Exact same gradient
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: `0 4px 20px ${alpha('#667eea', 0.3)}`, // Same shadow as homepage
      position: 'relative',
      overflow: 'hidden'
    }}
  >
    <DashboardIcon 
      sx={{ 
        color: '#ffffff', 
        fontSize: size * 0.5, // Slightly smaller icon to match homepage proportions
        fontWeight: 'bold'
      }} 
    />
  </Box>
);

const CustomSidebar = ({ onSignOut }) => {
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  // App name
  const appName = 'INSIGHTiQ';

  // UPDATED: Navigation items with better, more meaningful icons
  const navItems = [
    { 
      title: 'Upload Excel', 
      path: '/upload-excel', 
      icon: <UploadFileIcon />,
      description: 'Upload and process Excel files'
    },
    { 
      title: 'Sales Split', 
      path: '/manage-reports', 
      icon: <BarChartIcon />,
      description: 'Analyze sales data and reports'
    },
    { 
      title: 'Product Mix', 
      path: '/Productmix', 
      icon: <CategoryIcon />,
      description: 'Product category analysis'
    },
    { 
      title: 'Financials', 
      path: '/Financials', 
      icon: <AccountBalanceIcon />,
      description: 'Financial reports and analytics'
    },
    { 
      title: 'Companywide Sales', 
      path: '/Saleswide', 
      icon: <TrendingUpIcon />,
      description: 'Overall sales performance'
    },
    { 
      title: 'Payments', 
      path: '/Payments', 
      icon: <PaymentIcon />,
      description: 'Payment processing and billing'
    },
    { 
      title: 'Help Center', 
      path: '/HelpCenter', 
      icon: <HelpOutlineIcon />,
      description: 'Support and documentation'
    },
    { 
      title: 'Company', 
      path: '/CompanyLocationManager', 
      icon: <BusinessIcon />,
      description: 'Company and location management'
    },
  ];

  const handleDrawerToggle = () => {
    if (isMobile) setMobileOpen(!mobileOpen);
    else setOpen(!open);
  };

  const handleItemClick = () => {
    if (isMobile) setMobileOpen(false);
  };

  const renderNavItems = (items) =>
    items.map((item) => {
      const isSelected = location.pathname === item.path;
      return (
        <ListItem key={item.path} disablePadding>
          <ListItemButton
            component={Link}
            to={item.path}
            onClick={handleItemClick}
            selected={isSelected}
            sx={{
              minHeight: 48,
              justifyContent: open ? 'initial' : 'center',
              px: 2.5,
              mx: 1,
              mb: 0.5,
              borderRadius: '10px',
              position: 'relative',
              overflow: 'hidden',
              transition: theme.transitions.create(['background-color', 'box-shadow'], {
                duration: 300,
                easing: theme.transitions.easing.easeInOut
              }),
              '&::before': {
                content: '""',
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                width: '4px',
                backgroundColor: isSelected ? '#ffffff' : 'transparent',
                transition: 'all 0.3s ease-in-out'
              },
              '&:hover': {
                backgroundColor: alpha('#ffffff', 0.08),
                '&::before': {
                  backgroundColor: alpha('#ffffff', 0.5)
                }
              },
              '&.Mui-selected': {
                backgroundColor: alpha('#ffffff', 0.12),
                '&:hover': {
                  backgroundColor: alpha('#ffffff', 0.2)
                },
                '& .MuiListItemIcon-root': { color: '#ffffff' },
                '& .MuiListItemText-primary': {
                  color: '#ffffff',
                  fontWeight: 'bold'
                },
                '&::before': { backgroundColor: '#ffffff' }
              },
              boxShadow: isSelected ? `0 0 10px 1px ${alpha('#ffffff', 0.15)}` : 'none'
            }}
          >
            <Tooltip 
              title={open ? '' : `${item.title} - ${item.description}`} 
              placement="right" 
              arrow
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 2 : 'auto',
                  justifyContent: 'center',
                  color: isSelected ? '#ffffff' : '#e0e0e0',
                  transition: 'color 0.3s ease'
                }}
              >
                {item.icon}
              </ListItemIcon>
            </Tooltip>
            <ListItemText
              primary={item.title}
              sx={{
                transition: 'opacity 0.3s ease',
                opacity: open ? 1 : 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                '& .MuiTypography-root': {
                  fontWeight: isSelected ? 700 : 400,
                  color: isSelected ? '#ffffff' : '#f0f0f0'
                }
              }}
            />
          </ListItemButton>
        </ListItem>
      );
    });

  const drawerContent = (
    <>
      {/* Header Section - Aligned with navigation items */}
      <Box
        sx={{
          borderBottom: `1px solid ${alpha('#ffffff', 0.2)}`,
          boxShadow: `0 1px 3px ${alpha('#000000', 0.08)}`,
          backgroundColor: 'transparent',
          position: 'sticky',
          top: 0,
          zIndex: 1,
          minHeight: 64,
          mx: 1,
          mt: 1
        }}
      >
        <ListItemButton
          sx={{
            minHeight: 48,
            justifyContent: open ? 'initial' : 'center',
            px: 2.5,
            borderRadius: '10px',
            cursor: 'default',
            '&:hover': {
              backgroundColor: 'transparent'
            }
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: open ? 2 : 'auto',
              justifyContent: 'center',
              color: '#ffffff'
            }}
          >
            <CustomLogo size={32} />
          </ListItemIcon>
          <ListItemText
            primary={appName}
            sx={{
              transition: 'opacity 0.3s ease',
              opacity: open ? 1 : 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              '& .MuiTypography-root': {
                fontWeight: 'bold',
                color: '#ffffff',
                fontSize: '1.25rem'
              }
            }}
          />
        </ListItemButton>
      </Box>

      {/* Navigation Items */}
      <List sx={{ p: 1, mt: 1, flexGrow: 1 }}>
        {renderNavItems(navItems)}
      </List>

      {/* Divider */}
      <Divider sx={{ borderColor: alpha('#ffffff', 0.3), mx: 1 }} />

      {/* Sign Out Section - Styled like nav items */}
      <Box sx={{ p: 1 }}>
        {onSignOut && (
          <ListItem disablePadding>
            <ListItemButton
              onClick={onSignOut}
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
                mx: 0,
                mb: 0.5,
                borderRadius: '10px',
                transition: theme.transitions.create(['background-color'], {
                  duration: 300,
                  easing: theme.transitions.easing.easeInOut
                }),
                '&:hover': {
                  backgroundColor: alpha('#ffffff', 0.08)
                }
              }}
            >
              <Tooltip title={open ? '' : 'Sign Out'} placement="right" arrow>
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : 'auto',
                    justifyContent: 'center',
                    color: '#e0e0e0',
                    transition: 'color 0.3s ease'
                  }}
                >
                  <LogoutIcon />
                </ListItemIcon>
              </Tooltip>
              <ListItemText
                primary="Sign Out"
                sx={{
                  transition: 'opacity 0.3s ease',
                  opacity: open ? 1 : 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  '& .MuiTypography-root': {
                    fontWeight: 400,
                    color: '#f0f0f0'
                  }
                }}
              />
            </ListItemButton>
          </ListItem>
        )}
      </Box>
    </>
  );

  return (
    <>
      {isMobile && (
        <IconButton
          color="inherit"
          onClick={handleDrawerToggle}
          sx={{
            position: 'fixed',
            top: 10,
            left: 10,
            zIndex: theme.zIndex.drawer + 2,
            bgcolor: 'background.paper',
            boxShadow: `0 2px 5px ${alpha('#000', 0.15)}`,
            '&:hover': {
              bgcolor: alpha(theme.palette.background.default, 0.9)
            }
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              backgroundImage: gradientBackground,
              color: '#ffffff',
              borderRight: 'none',
              display: 'flex',
              flexDirection: 'column'
            }
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Box sx={{ position: 'relative', display: 'flex' }}>
          <Drawer
            variant="permanent"
            open={open}
            sx={{
              width: open ? drawerWidth : 64,
              flexShrink: 0,
              transition: theme.transitions.create('width', {
                duration: 500,
                easing: theme.transitions.easing.easeInOut
              }),
              '& .MuiDrawer-paper': {
                width: open ? drawerWidth : 64,
                backgroundImage: gradientBackground,
                color: '#ffffff',
                borderRight: 'none',
                display: 'flex',
                flexDirection: 'column',
                transition: theme.transitions.create('width', {
                  duration: 500,
                  easing: theme.transitions.easing.easeInOut
                })
              }
            }}
          >
            {drawerContent}
          </Drawer>
          <IconButton
            onClick={handleDrawerToggle}
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
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: '#F8F9FA'
              }
            }}
          >
            {open ? <ChevronLeftIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
          </IconButton>
        </Box>
      )}
    </>
  );
};

export default CustomSidebar;
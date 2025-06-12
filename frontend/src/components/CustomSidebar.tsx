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
import NewspaperIcon from '@mui/icons-material/Newspaper';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import HelpIcon from '@mui/icons-material/Help';
import PaymentIcon from '@mui/icons-material/Payment';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import BarChartIcon from '@mui/icons-material/BarChart';
import LogoutIcon from '@mui/icons-material/Logout';

const drawerWidth = 260;
const gradientBackground = 'linear-gradient(180deg, #050b1b 0%, #150949 100%)';

const CustomSidebar = ({ logo, title = 'INSIGHTiQ', onSignOut }) => {
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { title: 'Upload Excel', path: '/upload-excel', icon: <UploadFileIcon /> },
    { title: 'Sales Split', path: '/manage-reports', icon: <BarChartIcon /> },
    { title: 'Product Mix', path: '/Productmix', icon: <NewspaperIcon /> },
    { title: 'Financials', path: '/Financials', icon: <NewspaperIcon /> },
    { title: 'Companywide Sales', path: '/Saleswide', icon: <NewspaperIcon /> },
    { title: 'User Permissions', path: '/UserPermissions', icon: <AdminPanelSettingsIcon /> },
    { title: 'Payments', path: '/Payments', icon: <PaymentIcon /> },
    { title: 'Help Center', path: '/HelpCenter', icon: <HelpIcon /> },
    { title: 'Company', path: '/CompanyLocationManager', icon: <NewspaperIcon /> },

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
            <Tooltip title={open ? '' : item.title} placement="right" arrow>
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
          mx: 1, // Match the margin of navigation items
          mt: 1  // Add top margin to match nav items spacing
        }}
      >
        <ListItemButton
          sx={{
            minHeight: 48,
            justifyContent: open ? 'initial' : 'center',
            px: 2.5,
            borderRadius: '10px',
            cursor: 'default', // No pointer cursor for the header
            '&:hover': {
              backgroundColor: 'transparent' // No hover effect for header
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
            {logo}
          </ListItemIcon>
          <ListItemText
            primary={title}
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
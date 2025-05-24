import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Button, Divider, IconButton, useMediaQuery, useTheme, alpha, Tooltip } from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import HelpIcon from '@mui/icons-material/Help';
import PaymentIcon from '@mui/icons-material/Payment';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import BarChartIcon from '@mui/icons-material/BarChart';
const drawerWidth = 270;
const CustomSidebar = ({ logo, title = 'InsightIQ', onSignOut }) => {
    const theme = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [open, setOpen] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);
    // Define sidebar navigation - reordered with Help Center at the end and Payments second to last
    const navItems = [
        {
            title: 'Upload Excel',
            path: '/upload-excel',
            icon: _jsx(UploadFileIcon, {})
        },
        {
            title: 'Sales Split',
            path: '/manage-reports',
            icon: _jsx(BarChartIcon, {})
        },
        {
            title: 'Product Mix',
            path: '/Productmix',
            icon: _jsx(NewspaperIcon, {})
        },
        {
            title: 'Financials',
            path: '/Financials',
            icon: _jsx(NewspaperIcon, {})
        },
        {
            title: 'Companywide Sales',
            path: '/Saleswide',
            icon: _jsx(NewspaperIcon, {})
        },
        {
            title: 'User Permissions',
            path: '/UserPermissions',
            icon: _jsx(AdminPanelSettingsIcon, {})
        },
        {
            title: 'Payments',
            path: '/Payments',
            icon: _jsx(PaymentIcon, {})
        },
        {
            title: 'Help Center',
            path: '/HelpCenter',
            icon: _jsx(HelpIcon, {})
        },
         {
            title: 'DebugExcelSlice',
            path: '/DebugExcelSlice',
            icon: _jsx(HelpIcon, {})
        }
        
    ];
    const handleDrawerToggle = () => {
        if (isMobile) {
            setMobileOpen(!mobileOpen);
        }
        else {
            setOpen(!open);
        }
    };
    const handleItemClick = (path) => {
        if (isMobile) {
            setMobileOpen(false);
        }
    };
    const renderNavItems = (items) => {
        return items.map((item) => {
            const isSelected = location.pathname === item.path;
            return (_jsx(ListItem, { disablePadding: true, children: _jsxs(ListItemButton, { component: Link, to: item.path, onClick: () => handleItemClick(item.path), selected: isSelected, sx: {
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
                    }, children: [_jsx(Tooltip, { title: open ? "" : item.title, placement: "right", arrow: true, children: _jsx(ListItemIcon, { sx: {
                                    minWidth: 0,
                                    mr: open ? 2 : 'auto',
                                    justifyContent: 'center',
                                    color: isSelected ? 'primary.main' : 'text.secondary',
                                }, children: item.icon }) }), _jsx(ListItemText, { primary: item.title, sx: {
                                opacity: open ? 1 : 0,
                                display: open ? 'block' : 'none',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                '& .MuiTypography-root': {
                                    fontWeight: isSelected ? 600 : 400,
                                }
                            } })] }) }, item.path));
        });
    };
    const drawer = (_jsxs(_Fragment, { children: [_jsx(Box, { sx: {
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
                }, children: logo ? (_jsxs(Box, { sx: {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        width: '100%'
                    }, children: [logo, open && (_jsx(Typography, { variant: "h6", component: "div", sx: {
                                ml: 1,
                                fontWeight: 'bold',
                                color: 'primary.main',
                                fontSize: '1.5rem'
                            }, children: title }))] })) : (_jsx(Box, { sx: {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        width: '100%'
                    }, children: _jsx(Typography, { variant: "h6", component: "div", sx: {
                            fontWeight: 'bold',
                            color: 'primary.main',
                            fontSize: '1.5rem',
                            opacity: open ? 1 : 0
                        }, children: open ? title : '' }) })) }), _jsx(List, { sx: { p: 1, mt: 1 }, children: renderNavItems(navItems) }), _jsx(Box, { sx: { flexGrow: 1 } }), _jsx(Divider, { sx: { borderColor: alpha(theme.palette.divider, 0.7) } }), _jsx(Box, { sx: {
                    p: 2,
                    display: 'flex',
                    justifyContent: 'center'
                }, children: onSignOut && (_jsx(Tooltip, { title: open ? "" : "Sign Out", placement: "right", children: _jsx(Button, { fullWidth: true, variant: "outlined", color: "secondary", onClick: onSignOut, sx: {
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
                        }, children: open ? 'Sign Out' : '' }) })) })] }));
    return (_jsxs(_Fragment, { children: [isMobile && (_jsx(IconButton, { color: "inherit", "aria-label": "open drawer", edge: "start", onClick: handleDrawerToggle, sx: {
                    position: 'fixed',
                    top: 10,
                    left: 10,
                    zIndex: theme.zIndex.drawer + 2,
                    bgcolor: 'background.paper',
                    boxShadow: `0 2px 5px ${alpha(theme.palette.common.black, 0.15)}`,
                    '&:hover': {
                        bgcolor: alpha(theme.palette.background.default, 0.9)
                    }
                }, children: _jsx(MenuIcon, {}) })), isMobile ? (_jsx(Drawer, { variant: "temporary", open: mobileOpen, onClose: handleDrawerToggle, ModalProps: {
                    keepMounted: true,
                }, sx: {
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: drawerWidth,
                        backgroundImage: 'none',
                        bgcolor: 'background.paper',
                        boxShadow: `5px 0 10px ${alpha(theme.palette.common.black, 0.15)}`,
                        borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                    },
                }, children: drawer })) : (
            // Desktop drawer (permanent)
            _jsxs(Box, { sx: { position: 'relative', display: 'flex' }, children: [_jsx(Drawer, { variant: "permanent", open: open, sx: {
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
                        }, children: drawer }), _jsx(IconButton, { onClick: handleDrawerToggle, "aria-label": open ? "Collapse sidebar" : "Expand sidebar", sx: {
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
                        }, children: open
                            ? _jsx(ChevronLeftIcon, { fontSize: "small" })
                            : _jsx(ChevronRightIcon, { fontSize: "small" }) })] }))] }));
};
export default CustomSidebar;

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
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
  Tooltip,
  Collapse,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { API_URL_Local } from "../constants";
import { 
  setSelectedCompanies, 
  setSelectedLocations,
  selectSelectedCompanies,
  selectSelectedLocations 
} from "../store/slices/masterFileSlice";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import HelpIcon from "@mui/icons-material/Help";
import PaymentIcon from "@mui/icons-material/Payment";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import BarChartIcon from "@mui/icons-material/BarChart";
import LogoutIcon from "@mui/icons-material/Logout";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssessmentIcon from "@mui/icons-material/Assessment";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PieChartIcon from "@mui/icons-material/PieChart";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import InventoryIcon from "@mui/icons-material/Inventory";
import FactoryIcon from "@mui/icons-material/Factory";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import BusinessIcon from "@mui/icons-material/Business";
import LocationOnIcon from "@mui/icons-material/LocationOn";

// Responsive drawer widths - more aggressive scaling
const getDrawerWidth = (theme, isMobile, isTablet, isSmallScreen) => {
  if (isSmallScreen) return 280; // Wider for mobile to accommodate content
  if (isMobile) return 300; // Wider for mobile
  if (isTablet) return 220; // Smaller for tablets
  return 260; // Default for desktop
};

const gradientBackground = "linear-gradient(180deg, #050b1b 0%, #150949 100%)";

// Custom Logo Component - Responsive size
const CustomLogo = ({ size = 32, isMobile = false }) => (
  <Box
    sx={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: `0 4px 20px ${alpha("#667eea", 0.3)}`,
      position: "relative",
      overflow: "hidden",
      flexShrink: 0, // Prevent shrinking
    }}
  >
    <DashboardIcon
      sx={{
        color: "#ffffff",
        fontSize: size * 0.5,
        fontWeight: "bold",
      }}
    />
  </Box>
);

const CustomSidebar = ({ onSignOut }) => {
  const theme = useTheme();
  const location = useLocation();
  const dispatch = useDispatch();
  
  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.between("md", "lg"));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [insightiqOpen, setInsightiqOpen] = useState(false);
  const [orderiqOpen, setOrderiqOpen] = useState(false);
  
  // Redux state for selected companies and locations
  const selectedCompanies = useSelector(selectSelectedCompanies);
  const selectedLocations = useSelector(selectSelectedLocations);
  
  // Local state for companies data and API loading
  const [companies, setCompanies] = useState([]);
  const [availableLocations, setAvailableLocations] = useState([]);
  const [loading, setLoading] = useState(false);

  // NEW: State to track if we've already auto-initialized
  const [hasInitialized, setHasInitialized] = useState(false);

  // Get single selected values for dropdowns
  const selectedCompany = selectedCompanies.length > 0 ? selectedCompanies[0] : '';
  const selectedLocation = selectedLocations.length > 0 ? selectedLocations[0] : '';

  // Responsive drawer width
  const drawerWidth = getDrawerWidth(theme, isMobile, isTablet, isSmallScreen);

  // Define your app name here
  const appName = "KPI360";

  // INSIGHTIQ dropdown items with multiple title options for different screen sizes
  const insightiqItems = [
    { 
      title: "Upload Excel", 
      shortTitle: "Upload",
      compactTitle: "Upload",
      path: "/upload-excel", 
      icon: <UploadFileIcon /> 
    },
    { 
      title: "Sales Split", 
      shortTitle: "Sales",
      compactTitle: "Sales",
      path: "/manage-reports", 
      icon: <PieChartIcon /> 
    },
    { 
      title: "Product Mix", 
      shortTitle: "Products",
      compactTitle: "Products",
      path: "/Productmix", 
      icon: <RestaurantIcon /> 
    },
    { 
      title: "Financials", 
      shortTitle: "Finance",
      compactTitle: "Finance",
      path: "/Financials", 
      icon: <AttachMoneyIcon /> 
    },
    { 
      title: "Companywide Sales", 
      shortTitle: "Company Sales",
      compactTitle: "Sales",
      path: "/Saleswide", 
      icon: <ShowChartIcon /> 
    },
  ];

  // OrderIQ dropdown items with multiple title options
  const orderiqItems = [
    {
      title: "Analytics Dashboard",
      shortTitle: "Analytics",
      compactTitle: "Analytics",
      path: "/AnalyticsDashboard",
      icon: <PieChartIcon />,
    },
    { 
      title: "Master File", 
      shortTitle: "Master",
      compactTitle: "Master",
      path: "/MasterFile", 
      icon: <InventoryIcon /> 
    },
    {
      title: "Store Orders",
      shortTitle: "Orders",
      compactTitle: "Orders",
      path: "/OrderIQDashboard",
      icon: <DashboardIcon />,
    },
    {
      title: "Store Summary",
      shortTitle: "Store Sum",
      compactTitle: "Store",
      path: "/StoreSummaryProduction",
      icon: <FactoryIcon />,
    },
    {
      title: "Financial Summary",
      shortTitle: "Finance",
      compactTitle: "Finance",
      path: "/SummaryFinancialDashboard",
      icon: <TrendingUpIcon />,
    },
     {
      title: "Reports",
      shortTitle: "Reports",
      compactTitle: "Reports",
      path: "/Reports",
      icon: <PieChartIcon />,
    },
  ];

  // Other navigation items with multiple title options
  const navItems = [
    { 
      title: "Payments", 
      shortTitle: "Payments",
      compactTitle: "Pay",
      path: "/Payments", 
      icon: <PaymentIcon /> 
    },
    { 
      title: "Help Center", 
      shortTitle: "Help",
      compactTitle: "Help",
      path: "/HelpCenter", 
      icon: <HelpIcon /> 
    },
    {
      title: "Company",
      shortTitle: "Company",
      compactTitle: "Co.",
      path: "/CompanyLocationManager",
      icon: <BusinessIcon />,
    },
  ];

  // Responsive font sizes - optimized for mobile
  const getFontSizes = () => ({
    appName: isMobile ? "1.1rem" : (isSmallScreen ? "0.9rem" : isTablet ? "1.1rem" : "1.25rem"),
    mainNav: isMobile ? "0.9rem" : (isSmallScreen ? "0.75rem" : isTablet ? "0.9rem" : "1rem"),
    subNav: isMobile ? "0.85rem" : (isSmallScreen ? "0.7rem" : isTablet ? "0.8rem" : "0.875rem"),
    dropdown: isMobile ? "0.9rem" : (isSmallScreen ? "0.7rem" : "0.875rem"),
  });

  const fontSizes = getFontSizes();

  // Function to get display title based on screen size and drawer width
  const getDisplayTitle = (item) => {
    // For very small screens or narrow drawer widths, use compact title
    if (isSmallScreen || (drawerWidth < 250)) {
      return item.compactTitle || item.shortTitle || item.title;
    }
    // For mobile/tablet, use short title
    if (isMobile || isTablet) {
      return item.shortTitle || item.title;
    }
    // For desktop, use full title
    return item.title;
  };

  // Fetch companies and locations data
  useEffect(() => {
    const fetchCompaniesAndLocations = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL_Local}/company-locations/all`);
        if (response.ok) {
          const data = await response.json();
          setCompanies(data);
        } else {
          console.error('Failed to fetch companies and locations');
        }
      } catch (error) {
        console.error('Error fetching companies and locations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompaniesAndLocations();
  }, []);

  // NEW: Auto-initialize first company and location if Redux is empty
  useEffect(() => {
    if (
      !hasInitialized && 
      companies.length > 0 && 
      selectedCompanies.length === 0 && 
      selectedLocations.length === 0
    ) {
      // Select first company
      const firstCompany = companies[0];
      const firstCompanyId = firstCompany.company_id.toString();
      
      // Select first location of the first company
      const firstLocation = firstCompany.locations[0];
      const firstLocationId = firstLocation ? firstLocation.location_id.toString() : '';
      
      console.log('Auto-initializing with first company and location:', {
        companyId: firstCompanyId,
        companyName: firstCompany.company_name,
        locationId: firstLocationId,
        locationName: firstLocation?.location_name
      });
      
      // Dispatch to Redux
      dispatch(setSelectedCompanies([firstCompanyId]));
      if (firstLocationId) {
        dispatch(setSelectedLocations([firstLocationId]));
      }
      
      setHasInitialized(true);
    }
  }, [companies, selectedCompanies, selectedLocations, hasInitialized, dispatch]);

  // Update available locations when selected company changes
  useEffect(() => {
    if (selectedCompany && companies.length > 0) {
      const selectedCompanyData = companies.find(company => company.company_id.toString() === selectedCompany.toString());
      setAvailableLocations(selectedCompanyData ? selectedCompanyData.locations : []);
      
      // NEW: Auto-select first location if no location is selected and we have locations
      if (selectedLocations.length === 0 && selectedCompanyData && selectedCompanyData.locations.length > 0) {
        const firstLocationId = selectedCompanyData.locations[0].location_id.toString();
        console.log('Auto-selecting first location for company:', firstLocationId);
        dispatch(setSelectedLocations([firstLocationId]));
      }
    } else {
      setAvailableLocations([]);
    }
  }, [selectedCompany, companies, selectedLocations, dispatch]);

  // Auto-close sidebar on small screens when open
  useEffect(() => {
    if (isMobile) {
      setOpen(false);
      // Auto-open dropdowns on mobile for better UX
      setInsightiqOpen(true);
      setOrderiqOpen(true);
    } else {
      setOpen(true);
    }
  }, [isMobile]);

  // Handle company selection
  const handleCompanyChange = (event) => {
    const companyId = event.target.value;
    dispatch(setSelectedCompanies([companyId]));
    dispatch(setSelectedLocations([])); // Clear location selection when company changes
  };

  // Handle location selection
  const handleLocationChange = (event) => {
    const locationId = event.target.value;
    dispatch(setSelectedLocations([locationId]));
  };

  // Check if any INSIGHTIQ item is currently selected
  const isInsightiqSelected = insightiqItems.some(
    (item) => location.pathname === item.path
  );

  // Check if any OrderIQ item is currently selected
  const isOrderiqSelected = orderiqItems.some(
    (item) => location.pathname === item.path
  );

  const handleDrawerToggle = () => {
    if (isMobile) setMobileOpen(!mobileOpen);
    else setOpen(!open);
  };

  const handleItemClick = () => {
    if (isMobile) setMobileOpen(false);
  };

  const handleInsightiqToggle = () => {
    setInsightiqOpen(!insightiqOpen);
  };

  const handleOrderiqToggle = () => {
    setOrderiqOpen(!orderiqOpen);
  };

  const renderNavItems = (items, isSubItem = false) =>
    items.map((item) => {
      const isSelected = location.pathname === item.path;
      const displayTitle = isMobile ? item.title : getDisplayTitle(item); // Always show full title on mobile
      const showFullTitleInTooltip = !isMobile && (displayTitle !== item.title);
      
      return (
        <ListItem key={item.path} disablePadding>
          <Tooltip 
            title={showFullTitleInTooltip ? item.title : ""} 
            placement="right" 
            arrow
            enterDelay={500}
            disableHoverListener={isMobile} // Disable tooltips on mobile
          >
            <ListItemButton
              component={Link}
              to={item.path}
              onClick={handleItemClick}
              selected={isSelected}
              sx={{
                minHeight: isMobile ? 48 : (isSmallScreen ? 40 : 48), // Larger touch targets on mobile
                justifyContent: (open || isMobile) ? "initial" : "center",
                px: isMobile ? 2 : (isSmallScreen ? 1 : 2),
                mx: 0.5,
                mb: 0.5,
                ml: isSubItem ? (isMobile ? 2 : (isSmallScreen ? 1 : 1.5)) : 0.5,
                borderRadius: "8px",
                position: "relative",
                overflow: "hidden",
                transition: theme.transitions.create(
                  ["background-color", "box-shadow"],
                  {
                    duration: 300,
                    easing: theme.transitions.easing.easeInOut,
                  }
                ),
                "&::before": {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  top: 0,
                  height: "100%",
                  width: "3px",
                  backgroundColor: isSelected ? "#ffffff" : "transparent",
                  transition: "all 0.3s ease-in-out",
                },
                "&:hover": {
                  backgroundColor: alpha("#ffffff", 0.08),
                  "&::before": {
                    backgroundColor: alpha("#ffffff", 0.5),
                  },
                },
                "&.Mui-selected": {
                  backgroundColor: alpha("#ffffff", 0.12),
                  "&:hover": {
                    backgroundColor: alpha("#ffffff", 0.2),
                  },
                  "& .MuiListItemIcon-root": { color: "#ffffff" },
                  "& .MuiListItemText-primary": {
                    color: "#ffffff",
                    fontWeight: "bold",
                  },
                  "&::before": { backgroundColor: "#ffffff" },
                },
                boxShadow: isSelected
                  ? `0 0 10px 1px ${alpha("#ffffff", 0.15)}`
                  : "none",
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: (open || isMobile) ? (isMobile ? 1.5 : (isSmallScreen ? 1 : 1.5)) : "auto",
                  justifyContent: "center",
                  color: isSelected ? "#ffffff" : "#e0e0e0",
                  transition: "color 0.3s ease",
                  fontSize: isMobile ? "1.4rem" : (isSmallScreen ? "1.1rem" : "1.3rem"),
                  "& .MuiSvgIcon-root": {
                    fontSize: isMobile ? "1.4rem" : (isSmallScreen ? "1.1rem" : "1.3rem"),
                  }
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "100%",
                      lineHeight: 1.2,
                    }}
                  >
                    {displayTitle}
                  </Box>
                }
                sx={{
                  transition: "opacity 0.3s ease",
                  opacity: (open || isMobile) ? 1 : 0,
                  margin: 0,
                  "& .MuiTypography-root": {
                    fontWeight: isSelected ? 700 : 400,
                    color: isSelected ? "#ffffff" : "#f0f0f0",
                    fontSize: isMobile ? fontSizes.mainNav : (isSubItem ? fontSizes.subNav : fontSizes.mainNav),
                    lineHeight: 1.2,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  },
                }}
              />
            </ListItemButton>
          </Tooltip>
        </ListItem>
      );
    });

  const renderDropdownButton = (title, shortTitle, compactTitle, isOpen, isSelected, onToggle, icon) => {
    const displayTitle = isMobile ? title : (isSmallScreen || (drawerWidth < 250) ? 
      (compactTitle || shortTitle || title) : 
      (isMobile || isTablet ? (shortTitle || title) : title));
    const showFullTitleInTooltip = !isMobile && (displayTitle !== title);
    
    return (
      <ListItem disablePadding>
        <Tooltip 
          title={showFullTitleInTooltip ? title : ""} 
          placement="right" 
          arrow
          enterDelay={500}
          disableHoverListener={isMobile} // Disable tooltips on mobile
        >
          <ListItemButton
            onClick={onToggle}
            sx={{
              minHeight: isMobile ? 48 : (isSmallScreen ? 40 : 48), // Larger touch targets on mobile
              justifyContent: (open || isMobile) ? "initial" : "center",
              px: isMobile ? 2 : (isSmallScreen ? 1 : 2),
              mx: 0.5,
              mb: 0.5,
              borderRadius: "8px",
              position: "relative",
              overflow: "hidden",
              transition: theme.transitions.create(
                ["background-color", "box-shadow"],
                {
                  duration: 300,
                  easing: theme.transitions.easing.easeInOut,
                }
              ),
              "&::before": {
                content: '""',
                position: "absolute",
                left: 0,
                top: 0,
                height: "100%",
                width: "3px",
                backgroundColor: isSelected ? "#ffffff" : "transparent",
                transition: "all 0.3s ease-in-out",
              },
              "&:hover": {
                backgroundColor: alpha("#ffffff", 0.08),
                "&::before": {
                  backgroundColor: alpha("#ffffff", 0.5),
                },
              },
              backgroundColor: isSelected ? alpha("#ffffff", 0.12) : "transparent",
              "& .MuiListItemIcon-root": {
                color: isSelected ? "#ffffff" : "#e0e0e0",
              },
              "& .MuiListItemText-primary": {
                color: isSelected ? "#ffffff" : "#f0f0f0",
                fontWeight: isSelected ? "bold" : "normal",
              },
              boxShadow: isSelected
                ? `0 0 10px 1px ${alpha("#ffffff", 0.15)}`
                : "none",
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: (open || isMobile) ? (isMobile ? 1.5 : (isSmallScreen ? 1 : 1.5)) : "auto",
                justifyContent: "center",
                color: isSelected ? "#ffffff" : "#e0e0e0",
                transition: "color 0.3s ease",
                fontSize: isMobile ? "1.4rem" : (isSmallScreen ? "1.1rem" : "1.3rem"),
                "& .MuiSvgIcon-root": {
                  fontSize: isMobile ? "1.4rem" : (isSmallScreen ? "1.1rem" : "1.3rem"),
                }
              }}
            >
              {icon}
            </ListItemIcon>
            <ListItemText
              primary={
                <Box
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: "100%",
                    lineHeight: 1.2,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {displayTitle}
                </Box>
              }
              sx={{
                transition: "opacity 0.3s ease",
                opacity: (open || isMobile) ? 1 : 0,
                margin: 0,
                flex: 1,
                "& .MuiTypography-root": {
                  fontWeight: isSelected ? 700 : 400,
                  color: isSelected ? "#ffffff" : "#f0f0f0",
                  fontSize: fontSizes.mainNav,
                  lineHeight: 1.2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                },
              }}
            />
            {(open || isMobile) && (
              <Box sx={{ ml: isMobile ? 1 : (isSmallScreen ? 0.5 : 1), flexShrink: 0 }}>
                {isOpen ? (
                  <ExpandLess sx={{ 
                    color: isSelected ? "#ffffff" : "#e0e0e0",
                    fontSize: isMobile ? "1.4rem" : (isSmallScreen ? "1.1rem" : "1.3rem")
                  }} />
                ) : (
                  <ExpandMore sx={{ 
                    color: isSelected ? "#ffffff" : "#e0e0e0",
                    fontSize: isMobile ? "1.4rem" : (isSmallScreen ? "1.1rem" : "1.3rem")
                  }} />
                )}
              </Box>
            )}
          </ListItemButton>
        </Tooltip>
      </ListItem>
    );
  };

  // Company and Location Dropdowns Component
  const renderCompanyLocationDropdowns = () => {
    if (!open) return null;

    return (
      <Box sx={{ px: isSmallScreen ? 1 : 1.5, py: 1.5 }}> 
        {/* Company Dropdown */}
        <FormControl 
          fullWidth 
          size="small" 
          sx={{ 
            mb: 1,
            '& .MuiOutlinedInput-root': {
              backgroundColor: alpha('#ffffff', 0.15),
              borderRadius: '6px',
              fontSize: fontSizes.dropdown,
              '& fieldset': {
                borderColor: alpha('#ffffff', 0.3),
              },
              '&:hover fieldset': {
                borderColor: alpha('#ffffff', 0.5),
              },
              '&.Mui-focused fieldset': {
                borderColor: '#ffffff',
              },
              '& .MuiSelect-select': {
                color: '#ffffff',
                fontSize: fontSizes.dropdown,
                padding: isSmallScreen ? '6px 10px' : '8px 12px',
              },
              '& .MuiSelect-icon': {
                color: '#ffffff',
                fontSize: isSmallScreen ? '1.1rem' : '1.3rem',
              },
            },
            '& .MuiInputLabel-root': {
              color: alpha('#ffffff', 0.7),
              fontSize: fontSizes.dropdown,
              '&.Mui-focused': {
                color: '#ffffff',
              },
            },
          }}
        >
          <InputLabel>Company *</InputLabel>
          <Select
            value={selectedCompany}
            onChange={handleCompanyChange}
            label="Company *"
            disabled={loading}
            startAdornment={
              <BusinessIcon sx={{ 
                color: alpha('#ffffff', 0.7), 
                mr: 0.5, 
                fontSize: isSmallScreen ? '0.8rem' : '0.9rem' 
              }} />
            }
            MenuProps={{
              PaperProps: {
                sx: {
                  bgcolor: '#1a1a1a',
                  color: '#ffffff',
                  '& .MuiMenuItem-root': {
                    fontSize: fontSizes.dropdown,
                    padding: isSmallScreen ? '6px 10px' : '8px 12px',
                    '&:hover': {
                      backgroundColor: alpha('#ffffff', 0.1),
                    },
                    '&.Mui-selected': {
                      backgroundColor: alpha('#667eea', 0.3),
                      '&:hover': {
                        backgroundColor: alpha('#667eea', 0.4),
                      },
                    },
                  },
                },
              },
            }}
          >
            {companies.map((company) => (
              <MenuItem key={company.company_id} value={company.company_id.toString()}>
                <Box sx={{ 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap',
                  maxWidth: '100%' 
                }}>
                  {company.company_name}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Location Dropdown */}
        <FormControl 
          fullWidth 
          size="small"
          disabled={!selectedCompany || availableLocations.length === 0}
          sx={{ 
            '& .MuiOutlinedInput-root': {
              backgroundColor: alpha('#ffffff', 0.15),
              borderRadius: '6px',
              '& fieldset': {
                borderColor: alpha('#ffffff', 0.3),
              },
              '&:hover fieldset': {
                borderColor: alpha('#ffffff', 0.5),
              },
              '&.Mui-focused fieldset': {
                borderColor: '#ffffff',
              },
              '&.Mui-disabled fieldset': {
                borderColor: alpha('#ffffff', 0.2),
              },
              '& .MuiSelect-select': {
                color: '#ffffff',
                fontSize: fontSizes.dropdown,
                padding: isSmallScreen ? '6px 10px' : '8px 12px',
              },
              '& .MuiSelect-icon': {
                color: '#ffffff',
                fontSize: isSmallScreen ? '1.1rem' : '1.3rem',
              },
            },
            '& .MuiInputLabel-root': {
              color: alpha('#ffffff', 0.7),
              fontSize: fontSizes.dropdown,
              '&.Mui-focused': {
                color: '#ffffff',
              },
              '&.Mui-disabled': {
                color: alpha('#ffffff', 0.4),
              },
            },
          }}
        >
          <InputLabel>Location *</InputLabel>
          <Select
            value={selectedLocation}
            onChange={handleLocationChange}
            label="Location *"
            startAdornment={
              <LocationOnIcon sx={{ 
                color: alpha('#ffffff', 0.7), 
                mr: 0.5, 
                fontSize: isSmallScreen ? '0.8rem' : '0.9rem' 
              }} />
            }
            MenuProps={{
              PaperProps: {
                sx: {
                  bgcolor: '#1a1a1a',
                  color: '#ffffff',
                  '& .MuiMenuItem-root': {
                    fontSize: fontSizes.dropdown,
                    padding: isSmallScreen ? '6px 10px' : '8px 12px',
                    '&:hover': {
                      backgroundColor: alpha('#ffffff', 0.1),
                    },
                    '&.Mui-selected': {
                      backgroundColor: alpha('#667eea', 0.3),
                      '&:hover': {
                        backgroundColor: alpha('#667eea', 0.4),
                      },
                    },
                  },
                },
              },
            }}
          >
            {availableLocations.map((location) => (
              <MenuItem key={location.location_id} value={location.location_id.toString()}>
                <Box sx={{ 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap',
                  maxWidth: '100%' 
                }}>
                  {location.location_name}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    );
  };

  const drawerContent = (
    <>
      {/* Header Section */}
      <Box
        sx={{
          borderBottom: `1px solid ${alpha("#ffffff", 0.2)}`,
          boxShadow: `0 1px 3px ${alpha("#000000", 0.08)}`,
          backgroundColor: isMobile ? "#050b1b" : "rgba(5, 11, 27, 0.95)",
          backdropFilter: isMobile ? "none" : "blur(10px)",
          position: isMobile ? "relative" : "sticky",
          top: isMobile ? 0 : 0,
          zIndex: isMobile ? "auto" : 10,
          minHeight: isSmallScreen ? 48 : 56,
          mx: 0.5,
          mt: 0.5,
        }}
      >
        <ListItemButton
          sx={{
            minHeight: isSmallScreen ? 40 : 48,
            justifyContent: (open || isMobile) ? "initial" : "center",
            px: isSmallScreen ? 1 : 2,
            borderRadius: "8px",
            cursor: "default",
            "&:hover": {
              backgroundColor: "transparent",
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: (open || isMobile) ? (isSmallScreen ? 1 : 1.5) : "auto",
              justifyContent: "center",
              color: "#ffffff",
            }}
          >
            <CustomLogo size={isSmallScreen ? 24 : 28} isMobile={isMobile} />
          </ListItemIcon>
          <ListItemText
            primary={
              <Box
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "100%",
                }}
              >
                {appName}
              </Box>
            }
            sx={{
              transition: "opacity 0.3s ease",
              opacity: (open || isMobile) ? 1 : 0,
              margin: 0,
              "& .MuiTypography-root": {
                fontWeight: "bold",
                color: "#ffffff",
                fontSize: fontSizes.appName,
                lineHeight: 1.2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              },
            }}
          />
        </ListItemButton>
      </Box>

      {/* Company and Location Dropdowns */}
      <Box
        sx={{
          backgroundColor: isMobile ? "#050b1b" : "rgba(5, 11, 27, 0.95)",
          backdropFilter: isMobile ? "none" : "blur(10px)",
          position: isMobile ? "relative" : "sticky",
          top: isMobile ? 0 : (isSmallScreen ? 48 : 56),
          zIndex: isMobile ? "auto" : 9,
          borderBottom: `1px solid ${alpha("#ffffff", 0.1)}`,
        }}
      >
        {renderCompanyLocationDropdowns()}
      </Box>

      {/* Navigation Items */}
      <List sx={{ 
        p: 1, 
        mt: 1, 
        flexGrow: 1,
        position: "relative",
        zIndex: 1,
        overflowY: isMobile ? "visible" : "auto",
        maxHeight: isMobile ? "none" : "calc(100vh - 200px)",
      }}>
        {/* INSIGHTIQ Dropdown */}
        {renderDropdownButton(
          "INSIGHTiQ",
          "INSIGHTiQ",
          "IQ",
          insightiqOpen,
          isInsightiqSelected,
          handleInsightiqToggle,
          <AssessmentIcon />
        )}

        {/* INSIGHTIQ Sub-items */}
        <Collapse in={insightiqOpen && (open || isMobile)} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {renderNavItems(insightiqItems, true)}
          </List>
        </Collapse>

        {/* OrderIQ Dropdown */}
        {renderDropdownButton(
          "ORDERiQ",
          "ORDERiQ",
          "OQ",
          orderiqOpen,
          isOrderiqSelected,
          handleOrderiqToggle,
          <ShoppingCartIcon />
        )}

        {/* OrderIQ Sub-items */}
        <Collapse in={orderiqOpen && (open || isMobile)} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {renderNavItems(orderiqItems, true)}
          </List>
        </Collapse>

        {/* Other Navigation Items */}
        {renderNavItems(navItems)}
      </List>

      {/* Divider */}
      <Divider sx={{ borderColor: alpha("#ffffff", 0.3), mx: 0.5 }} />

      {/* Sign Out Section */}
      <Box sx={{ p: 1 }}>
        {onSignOut && (
          <ListItem disablePadding>
            <ListItemButton
              onClick={onSignOut}
              sx={{
                minHeight: isMobile ? 48 : (isSmallScreen ? 44 : 48),
                justifyContent: (open || isMobile) ? "initial" : "center",
                px: isMobile ? 2 : (isSmallScreen ? 1.5 : 2.5),
                mx: 0,
                mb: 0.5,
                borderRadius: "10px",
                transition: theme.transitions.create(["background-color"], {
                  duration: 300,
                  easing: theme.transitions.easing.easeInOut,
                }),
                "&:hover": {
                  backgroundColor: alpha("#ffffff", 0.08),
                },
              }}
            >
              <Tooltip 
                title={(open || isMobile) ? "" : "Sign Out"} 
                placement="right" 
                arrow
                disableHoverListener={isMobile}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: (open || isMobile) ? (isMobile ? 1.5 : (isSmallScreen ? 1.5 : 2)) : "auto",
                    justifyContent: "center",
                    color: "#e0e0e0",
                    transition: "color 0.3s ease",
                    fontSize: isMobile ? "1.4rem" : (isSmallScreen ? "1.2rem" : "1.5rem"),
                  }}
                >
                  <LogoutIcon />
                </ListItemIcon>
              </Tooltip>
              <ListItemText
                primary="Sign Out"
                sx={{
                  transition: "opacity 0.3s ease",
                  opacity: (open || isMobile) ? 1 : 0,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  "& .MuiTypography-root": {
                    fontWeight: 400,
                    color: "#f0f0f0",
                    fontSize: fontSizes.mainNav,
                    lineHeight: 1.2,
                  },
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
            position: "fixed",
            top: 16,
            left: 16,
            zIndex: theme.zIndex.drawer + 2,
            bgcolor: "#050b1b",
            color: "#ffffff",
            border: `2px solid ${alpha("#ffffff", 0.2)}`,
            boxShadow: `0 4px 12px ${alpha("#000", 0.3)}`,
            width: 48,
            height: 48,
            "&:hover": {
              bgcolor: "#0f1729",
              borderColor: alpha("#ffffff", 0.4),
            },
          }}
        >
          <MenuIcon fontSize="medium" />
        </IconButton>
      )}

      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ 
            keepMounted: true,
            style: { zIndex: theme.zIndex.drawer }
          }}
          sx={{
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              backgroundImage: gradientBackground,
              color: "#ffffff",
              borderRight: "none",
              display: "flex",
              flexDirection: "column",
              maxWidth: "85vw",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Box sx={{ position: "relative", display: "flex" }}>
          <Drawer
            variant="permanent"
            open={open}
            sx={{
              width: open ? drawerWidth : 64,
              flexShrink: 0,
              transition: theme.transitions.create("width", {
                duration: 500,
                easing: theme.transitions.easing.easeInOut,
              }),
              "& .MuiDrawer-paper": {
                width: open ? drawerWidth : 64,
                backgroundImage: gradientBackground,
                color: "#ffffff",
                borderRight: "none",
                display: "flex",
                flexDirection: "column",
                transition: theme.transitions.create("width", {
                  duration: 500,
                  easing: theme.transitions.easing.easeInOut,
                }),
              },
            }}
          >
            {drawerContent}
          </Drawer>
          <IconButton
            onClick={handleDrawerToggle}
            sx={{
              position: "absolute",
              top: "50%",
              right: open ? -20 : -20,
              transform: "translateY(-50%)",
              bgcolor: "#FFFFFF",
              boxShadow: "0 0 8px rgba(0,0,0,0.2)",
              borderRadius: "50%",
              width: isSmallScreen ? 36 : 40,
              height: isSmallScreen ? 36 : 40,
              border: "1px solid rgba(0,0,0,0.1)",
              zIndex: 1300,
              transition: "all 0.3s ease",
              "&:hover": {
                bgcolor: "#F8F9FA",
              },
            }}
          >
            {open ? (
              <ChevronLeftIcon fontSize={isSmallScreen ? "small" : "medium"} />
            ) : (
              <ChevronRightIcon fontSize={isSmallScreen ? "small" : "medium"} />
            )}
          </IconButton>
        </Box>
      )}
    </>
  );
};

export default CustomSidebar;
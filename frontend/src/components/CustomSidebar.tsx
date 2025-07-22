import { useState, useEffect, useCallback, useMemo } from "react";
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
  Chip,
  Stack,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { API_URL_Local } from "../constants";
import {
  setSelectedCompanies,
  setSelectedLocations,
  selectSelectedCompanies,
  selectSelectedLocations,
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
import SelectAllIcon from "@mui/icons-material/SelectAll";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import BusinessIcon from "@mui/icons-material/Business";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import apiClient from "../api/axiosConfig"; // Add this line

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

  // NEW: State to track if we've already auto-initialized and user interactions
  const [hasInitialized, setHasInitialized] = useState(false);
  const [userHasInteracted, setUserHasInteracted] = useState(false);

  // Get selected values for dropdowns (now supports multiple)
  const selectedCompany = selectedCompanies.length > 0 ? selectedCompanies : [];
  const selectedLocation =
    selectedLocations.length > 0 ? selectedLocations : [];

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
      icon: <UploadFileIcon />,
    },
    {
      title: "Sales Split",
      shortTitle: "Sales",
      compactTitle: "Sales",
      path: "/manage-reports",
      icon: <PieChartIcon />,
    },
    {
      title: "Product Mix",
      shortTitle: "Products",
      compactTitle: "Products",
      path: "/Productmix",
      icon: <RestaurantIcon />,
    },
    {
      title: "Financials",
      shortTitle: "Finance",
      compactTitle: "Finance",
      path: "/Financials",
      icon: <AttachMoneyIcon />,
    },
    {
      title: "Companywide Sales",
      shortTitle: "Company Sales",
      compactTitle: "Sales",
      path: "/Saleswide",
      icon: <ShowChartIcon />,
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
      icon: <InventoryIcon />,
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
      icon: <PaymentIcon />,
    },
    {
      title: "Help Center",
      shortTitle: "Help",
      compactTitle: "Help",
      path: "/HelpCenter",
      icon: <HelpIcon />,
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
    appName: isMobile
      ? "1.1rem"
      : isSmallScreen
      ? "0.9rem"
      : isTablet
      ? "1.1rem"
      : "1.25rem",
    mainNav: isMobile
      ? "0.9rem"
      : isSmallScreen
      ? "0.75rem"
      : isTablet
      ? "0.9rem"
      : "1rem",
    subNav: isMobile
      ? "0.85rem"
      : isSmallScreen
      ? "0.7rem"
      : isTablet
      ? "0.8rem"
      : "0.875rem",
    dropdown: isMobile ? "0.9rem" : isSmallScreen ? "0.7rem" : "0.875rem",
  });

  const fontSizes = getFontSizes();

  // Function to get display title based on screen size and drawer width
  const getDisplayTitle = (item) => {
    // For very small screens or narrow drawer widths, use compact title
    if (isSmallScreen || drawerWidth < 250) {
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
        // const response = await fetch(`${API_URL_Local}/company-locations/all`);
        // if (response.ok) {
        //   const data = await response.json();
        //   setCompanies(data);
        // } else {
        //   console.error('Failed to fetch companies and locations');
        // }
        const response = await apiClient.get("/company-locations/all");
        setCompanies(response.data || []);
        // } catch (error) {
        //   console.error("Error fetching companies and locations:", error);
        // } finally {
      } catch (error) {
        console.error("Error fetching companies and locations:", error);

        let errorMessage = "Error loading companies and locations";
        if (error.response) {
          if (error.response.status === 401) {
            errorMessage = "Authentication failed. Please log in again.";
            // Auth interceptor will handle redirect to login
          } else {
            errorMessage = `Server error: ${error.response.status}`;
          }
        } else if (error.request) {
          errorMessage =
            "Cannot connect to company-locations API. Please check server status.";
        }

        // Set your error state here if you have one
        // setCompaniesError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchCompaniesAndLocations();
  }, []);

  // NEW: Auto-initialize first company and location if Redux is empty (ONLY on first load)
  useEffect(() => {
    if (
      !hasInitialized &&
      !userHasInteracted && // Only auto-select if user hasn't interacted yet
      companies.length > 0 &&
      selectedCompanies.length === 0 &&
      selectedLocations.length === 0
    ) {
      // Select first company
      const firstCompany = companies[0];
      const firstCompanyId = firstCompany.company_id.toString();

      // Select first location of the first company
      const firstLocation = firstCompany.locations[0];
      const firstLocationId = firstLocation
        ? firstLocation.location_id.toString()
        : "";

      console.log("Auto-initializing with first company and location:", {
        companyId: firstCompanyId,
        companyName: firstCompany.company_name,
        locationId: firstLocationId,
        locationName: firstLocation?.location_name,
      });

      // Dispatch to Redux
      dispatch(setSelectedCompanies([firstCompanyId]));
      if (firstLocationId) {
        dispatch(setSelectedLocations([firstLocationId]));
      }

      setHasInitialized(true);
    }
  }, [
    companies,
    selectedCompanies,
    selectedLocations,
    hasInitialized,
    userHasInteracted,
    dispatch,
  ]);

  // Memoize expensive computations
  const availableLocationsMemo = useMemo(() => {
    if (selectedCompanies.length === 0 || companies.length === 0) return [];

    const allLocationsFromSelectedCompanies = [];
    selectedCompanies.forEach((companyId) => {
      const companyData = companies.find(
        (company) => company.company_id.toString() === companyId.toString()
      );
      if (companyData && companyData.locations) {
        allLocationsFromSelectedCompanies.push(...companyData.locations);
      }
    });

    // Remove duplicates based on location_id
    return allLocationsFromSelectedCompanies.filter(
      (location, index, self) =>
        index === self.findIndex((l) => l.location_id === location.location_id)
    );
  }, [selectedCompanies, companies]);

  // Update available locations when computed locations change
  useEffect(() => {
    setAvailableLocations(availableLocationsMemo);

    // Only auto-select first location if user hasn't interacted and no locations are selected
    if (
      !userHasInteracted &&
      selectedLocations.length === 0 &&
      availableLocationsMemo.length > 0
    ) {
      const firstLocationId = availableLocationsMemo[0].location_id.toString();
      console.log(
        "Auto-selecting first location for selected companies:",
        firstLocationId
      );
      dispatch(setSelectedLocations([firstLocationId]));
    }
  }, [availableLocationsMemo, selectedLocations, userHasInteracted, dispatch]);

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

  // Handle bulk company actions
  const handleSelectAllCompanies = useCallback(() => {
    setUserHasInteracted(true);
    const allCompanyIds = companies.map((company) =>
      company.company_id.toString()
    );
    console.log("Selecting all companies:", allCompanyIds);

    setTimeout(() => {
      dispatch(setSelectedCompanies(allCompanyIds));
      dispatch(setSelectedLocations([])); // Clear locations when companies change
    }, 0);
  }, [companies, dispatch]);

  const handleClearAllCompanies = useCallback(() => {
    setUserHasInteracted(true);
    console.log("Clearing all companies");

    setTimeout(() => {
      dispatch(setSelectedCompanies([]));
      dispatch(setSelectedLocations([]));
    }, 0);
  }, [dispatch]);

  // Handle bulk location actions
  const handleSelectAllLocations = useCallback(() => {
    setUserHasInteracted(true);
    const allLocationIds = availableLocations.map((location) =>
      location.location_id.toString()
    );
    console.log("Selecting all locations:", allLocationIds);

    setTimeout(() => {
      dispatch(setSelectedLocations(allLocationIds));
    }, 0);
  }, [availableLocations, dispatch]);

  const handleClearAllLocations = useCallback(() => {
    setUserHasInteracted(true);
    console.log("Clearing all locations");

    setTimeout(() => {
      dispatch(setSelectedLocations([]));
    }, 0);
  }, [dispatch]);
  // Handle company selection (multiple) with debouncing
  const handleCompanyChange = useCallback(
    (event) => {
      const value =
        typeof event.target.value === "string"
          ? event.target.value.split(",")
          : event.target.value;

      // Mark that user has interacted
      setUserHasInteracted(true);

      console.log("Company selection changed:", value);

      // Use setTimeout to debounce Redux updates
      setTimeout(() => {
        dispatch(setSelectedCompanies(value));
        // Clear location selection when companies change to avoid invalid combinations
        dispatch(setSelectedLocations([]));
      }, 0);
    },
    [dispatch]
  );

  // Handle location selection (multiple) with debouncing
  const handleLocationChange = useCallback(
    (event) => {
      const value =
        typeof event.target.value === "string"
          ? event.target.value.split(",")
          : event.target.value;

      // Mark that user has interacted
      setUserHasInteracted(true);

      console.log("Location selection changed:", value);

      // Use setTimeout to debounce Redux updates
      setTimeout(() => {
        dispatch(setSelectedLocations(value));
      }, 0);
    },
    [dispatch]
  );

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
      const showFullTitleInTooltip = !isMobile && displayTitle !== item.title;

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
                minHeight: isMobile ? 48 : isSmallScreen ? 40 : 48, // Larger touch targets on mobile
                justifyContent: open || isMobile ? "initial" : "center",
                px: isMobile ? 2 : isSmallScreen ? 1 : 2,
                mx: 0.5,
                mb: 0.5,
                ml: isSubItem ? (isMobile ? 2 : isSmallScreen ? 1 : 1.5) : 0.5,
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
                  mr:
                    open || isMobile
                      ? isMobile
                        ? 1.5
                        : isSmallScreen
                        ? 1
                        : 1.5
                      : "auto",
                  justifyContent: "center",
                  color: isSelected ? "#ffffff" : "#e0e0e0",
                  transition: "color 0.3s ease",
                  fontSize: isMobile
                    ? "1.4rem"
                    : isSmallScreen
                    ? "1.1rem"
                    : "1.3rem",
                  "& .MuiSvgIcon-root": {
                    fontSize: isMobile
                      ? "1.4rem"
                      : isSmallScreen
                      ? "1.1rem"
                      : "1.3rem",
                  },
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
                  opacity: open || isMobile ? 1 : 0,
                  margin: 0,
                  "& .MuiTypography-root": {
                    fontWeight: isSelected ? 700 : 400,
                    color: isSelected ? "#ffffff" : "#f0f0f0",
                    fontSize: isMobile
                      ? fontSizes.mainNav
                      : isSubItem
                      ? fontSizes.subNav
                      : fontSizes.mainNav,
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

  const renderDropdownButton = (
    title,
    shortTitle,
    compactTitle,
    isOpen,
    isSelected,
    onToggle,
    icon
  ) => {
    const displayTitle = isMobile
      ? title
      : isSmallScreen || drawerWidth < 250
      ? compactTitle || shortTitle || title
      : isMobile || isTablet
      ? shortTitle || title
      : title;
    const showFullTitleInTooltip = !isMobile && displayTitle !== title;

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
              minHeight: isMobile ? 48 : isSmallScreen ? 40 : 48, // Larger touch targets on mobile
              justifyContent: open || isMobile ? "initial" : "center",
              px: isMobile ? 2 : isSmallScreen ? 1 : 2,
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
              backgroundColor: isSelected
                ? alpha("#ffffff", 0.12)
                : "transparent",
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
                mr:
                  open || isMobile
                    ? isMobile
                      ? 1.5
                      : isSmallScreen
                      ? 1
                      : 1.5
                    : "auto",
                justifyContent: "center",
                color: isSelected ? "#ffffff" : "#e0e0e0",
                transition: "color 0.3s ease",
                fontSize: isMobile
                  ? "1.4rem"
                  : isSmallScreen
                  ? "1.1rem"
                  : "1.3rem",
                "& .MuiSvgIcon-root": {
                  fontSize: isMobile
                    ? "1.4rem"
                    : isSmallScreen
                    ? "1.1rem"
                    : "1.3rem",
                },
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
                opacity: open || isMobile ? 1 : 0,
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
              <Box
                sx={{
                  ml: isMobile ? 1 : isSmallScreen ? 0.5 : 1,
                  flexShrink: 0,
                }}
              >
                {isOpen ? (
                  <ExpandLess
                    sx={{
                      color: isSelected ? "#ffffff" : "#e0e0e0",
                      fontSize: isMobile
                        ? "1.4rem"
                        : isSmallScreen
                        ? "1.1rem"
                        : "1.3rem",
                    }}
                  />
                ) : (
                  <ExpandMore
                    sx={{
                      color: isSelected ? "#ffffff" : "#e0e0e0",
                      fontSize: isMobile
                        ? "1.4rem"
                        : isSmallScreen
                        ? "1.1rem"
                        : "1.3rem",
                    }}
                  />
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
        <Box sx={{ mb: 1 }}>
          <FormControl
            fullWidth
            size="small"
            sx={{
              mb: 0.5,
              "& .MuiOutlinedInput-root": {
                backgroundColor: alpha("#ffffff", 0.15),
                borderRadius: "6px",
                fontSize: fontSizes.dropdown,
                "& fieldset": {
                  borderColor: alpha("#ffffff", 0.3),
                },
                "&:hover fieldset": {
                  borderColor: alpha("#ffffff", 0.5),
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#ffffff",
                },
                "& .MuiSelect-select": {
                  color: "#ffffff",
                  fontSize: fontSizes.dropdown,
                  padding: isSmallScreen ? "6px 10px" : "8px 12px",
                },
                "& .MuiSelect-icon": {
                  color: "#ffffff",
                  fontSize: isSmallScreen ? "1.1rem" : "1.3rem",
                },
              },
              "& .MuiInputLabel-root": {
                color: alpha("#ffffff", 0.7),
                fontSize: fontSizes.dropdown,
                "&.Mui-focused": {
                  color: "#ffffff",
                },
              },
            }}
          >
            <InputLabel>Companies *</InputLabel>
            <Select
              multiple
              value={selectedCompany}
              onChange={handleCompanyChange}
              label="Companies *"
              disabled={loading}
              displayEmpty
              renderValue={(selected) => {
                if (selected.length === 0) {
                  return (
                    <Box
                      sx={{ color: alpha("#ffffff", 0.5), fontStyle: "italic" }}
                    >
                      Select companies...
                    </Box>
                  );
                }
                return (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((companyId) => {
                      const company = companies.find(
                        (c) => c.company_id.toString() === companyId.toString()
                      );
                      return (
                        <Chip
                          key={companyId}
                          label={company ? company.company_name : companyId}
                          size="small"
                          sx={{
                            backgroundColor: alpha("#667eea", 0.2),
                            color: "#ffffff",
                            fontSize: isSmallScreen ? "0.7rem" : "0.75rem",
                            maxWidth: "80px",
                            "& .MuiChip-label": {
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              paddingX: "6px",
                            },
                          }}
                        />
                      );
                    })}
                  </Box>
                );
              }}
              startAdornment={
                <BusinessIcon
                  sx={{
                    color: alpha("#ffffff", 0.7),
                    mr: 0.5,
                    fontSize: isSmallScreen ? "0.8rem" : "0.9rem",
                  }}
                />
              }
              MenuProps={{
                PaperProps: {
                  sx: {
                    bgcolor: "#1a1a1a",
                    color: "#ffffff",
                    "& .MuiMenuItem-root": {
                      fontSize: fontSizes.dropdown,
                      padding: isSmallScreen ? "6px 10px" : "8px 12px",
                      "&:hover": {
                        backgroundColor: alpha("#ffffff", 0.1),
                      },
                      "&.Mui-selected": {
                        backgroundColor: alpha("#667eea", 0.3),
                        "&:hover": {
                          backgroundColor: alpha("#667eea", 0.4),
                        },
                      },
                    },
                  },
                },
              }}
            >
              {companies.map((company) => (
                <MenuItem
                  key={company.company_id}
                  value={company.company_id.toString()}
                  sx={{
                    "&.Mui-selected": {
                      backgroundColor: alpha("#667eea", 0.3),
                    },
                  }}
                >
                  <Box
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "100%",
                    }}
                  >
                    {company.company_name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Company Action Buttons */}
          <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={
                <SelectAllIcon sx={{ fontSize: "0.8rem !important" }} />
              }
              onClick={handleSelectAllCompanies}
              disabled={
                loading ||
                companies.length === 0 ||
                selectedCompanies.length === companies.length
              }
              sx={{
                fontSize: isSmallScreen ? "0.65rem" : "0.7rem",
                padding: isSmallScreen ? "2px 6px" : "3px 8px",
                minWidth: "auto",
                borderColor: alpha("#ffffff", 0.3),
                color: alpha("#ffffff", 0.8),
                "&:hover": {
                  borderColor: alpha("#ffffff", 0.5),
                  backgroundColor: alpha("#ffffff", 0.05),
                },
                "&.Mui-disabled": {
                  borderColor: alpha("#ffffff", 0.1),
                  color: alpha("#ffffff", 0.3),
                },
              }}
            >
              All
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={
                <ClearAllIcon sx={{ fontSize: "0.8rem !important" }} />
              }
              onClick={handleClearAllCompanies}
              disabled={loading || selectedCompanies.length === 0}
              sx={{
                fontSize: isSmallScreen ? "0.65rem" : "0.7rem",
                padding: isSmallScreen ? "2px 6px" : "3px 8px",
                minWidth: "auto",
                borderColor: alpha("#ff6b6b", 0.3),
                color: alpha("#ff6b6b", 0.8),
                "&:hover": {
                  borderColor: alpha("#ff6b6b", 0.5),
                  backgroundColor: alpha("#ff6b6b", 0.05),
                },
                "&.Mui-disabled": {
                  borderColor: alpha("#ffffff", 0.1),
                  color: alpha("#ffffff", 0.3),
                },
              }}
            >
              Clear
            </Button>
          </Stack>
        </Box>

        {/* Location Dropdown */}
        <Box>
          <FormControl
            fullWidth
            size="small"
            disabled={
              selectedCompanies.length === 0 || availableLocations.length === 0
            }
            sx={{
              mb: 0.5,
              "& .MuiOutlinedInput-root": {
                backgroundColor: alpha("#ffffff", 0.15),
                borderRadius: "6px",
                "& fieldset": {
                  borderColor: alpha("#ffffff", 0.3),
                },
                "&:hover fieldset": {
                  borderColor: alpha("#ffffff", 0.5),
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#ffffff",
                },
                "&.Mui-disabled fieldset": {
                  borderColor: alpha("#ffffff", 0.2),
                },
                "& .MuiSelect-select": {
                  color: "#ffffff",
                  fontSize: fontSizes.dropdown,
                  padding: isSmallScreen ? "6px 10px" : "8px 12px",
                },
                "& .MuiSelect-icon": {
                  color: "#ffffff",
                  fontSize: isSmallScreen ? "1.1rem" : "1.3rem",
                },
              },
              "& .MuiInputLabel-root": {
                color: alpha("#ffffff", 0.7),
                fontSize: fontSizes.dropdown,
                "&.Mui-focused": {
                  color: "#ffffff",
                },
                "&.Mui-disabled": {
                  color: alpha("#ffffff", 0.4),
                },
              },
            }}
          >
            <InputLabel>Locations *</InputLabel>
            <Select
              multiple
              value={selectedLocation}
              onChange={handleLocationChange}
              label="Locations *"
              displayEmpty
              renderValue={(selected) => {
                if (selected.length === 0) {
                  return (
                    <Box
                      sx={{ color: alpha("#ffffff", 0.5), fontStyle: "italic" }}
                    >
                      Select locations...
                    </Box>
                  );
                }
                return (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((locationId) => {
                      const location = availableLocations.find(
                        (l) =>
                          l.location_id.toString() === locationId.toString()
                      );
                      return (
                        <Chip
                          key={locationId}
                          label={location ? location.location_name : locationId}
                          size="small"
                          sx={{
                            backgroundColor: alpha("#667eea", 0.2),
                            color: "#ffffff",
                            fontSize: isSmallScreen ? "0.7rem" : "0.75rem",
                            maxWidth: "80px",
                            "& .MuiChip-label": {
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              paddingX: "6px",
                            },
                          }}
                        />
                      );
                    })}
                  </Box>
                );
              }}
              startAdornment={
                <LocationOnIcon
                  sx={{
                    color: alpha("#ffffff", 0.7),
                    mr: 0.5,
                    fontSize: isSmallScreen ? "0.8rem" : "0.9rem",
                  }}
                />
              }
              MenuProps={{
                PaperProps: {
                  sx: {
                    bgcolor: "#1a1a1a",
                    color: "#ffffff",
                    "& .MuiMenuItem-root": {
                      fontSize: fontSizes.dropdown,
                      padding: isSmallScreen ? "6px 10px" : "8px 12px",
                      "&:hover": {
                        backgroundColor: alpha("#ffffff", 0.1),
                      },
                      "&.Mui-selected": {
                        backgroundColor: alpha("#667eea", 0.3),
                        "&:hover": {
                          backgroundColor: alpha("#667eea", 0.4),
                        },
                      },
                    },
                  },
                },
              }}
            >
              {availableLocations.map((location) => (
                <MenuItem
                  key={location.location_id}
                  value={location.location_id.toString()}
                  sx={{
                    "&.Mui-selected": {
                      backgroundColor: alpha("#667eea", 0.3),
                    },
                  }}
                >
                  <Box
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "100%",
                    }}
                  >
                    {location.location_name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Location Action Buttons */}
          <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={
                <SelectAllIcon sx={{ fontSize: "0.8rem !important" }} />
              }
              onClick={handleSelectAllLocations}
              disabled={
                selectedCompanies.length === 0 ||
                availableLocations.length === 0 ||
                selectedLocation.length === availableLocations.length
              }
              sx={{
                fontSize: isSmallScreen ? "0.65rem" : "0.7rem",
                padding: isSmallScreen ? "2px 6px" : "3px 8px",
                minWidth: "auto",
                borderColor: alpha("#ffffff", 0.3),
                color: alpha("#ffffff", 0.8),
                "&:hover": {
                  borderColor: alpha("#ffffff", 0.5),
                  backgroundColor: alpha("#ffffff", 0.05),
                },
                "&.Mui-disabled": {
                  borderColor: alpha("#ffffff", 0.1),
                  color: alpha("#ffffff", 0.3),
                },
              }}
            >
              All
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={
                <ClearAllIcon sx={{ fontSize: "0.8rem !important" }} />
              }
              onClick={handleClearAllLocations}
              disabled={selectedLocation.length === 0}
              sx={{
                fontSize: isSmallScreen ? "0.65rem" : "0.7rem",
                padding: isSmallScreen ? "2px 6px" : "3px 8px",
                minWidth: "auto",
                borderColor: alpha("#ff6b6b", 0.3),
                color: alpha("#ff6b6b", 0.8),
                "&:hover": {
                  borderColor: alpha("#ff6b6b", 0.5),
                  backgroundColor: alpha("#ff6b6b", 0.05),
                },
                "&.Mui-disabled": {
                  borderColor: alpha("#ffffff", 0.1),
                  color: alpha("#ffffff", 0.3),
                },
              }}
            >
              Clear
            </Button>
          </Stack>
        </Box>
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
            justifyContent: open || isMobile ? "initial" : "center",
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
              mr: open || isMobile ? (isSmallScreen ? 1 : 1.5) : "auto",
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
              opacity: open || isMobile ? 1 : 0,
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
          top: isMobile ? 0 : isSmallScreen ? 48 : 56,
          zIndex: isMobile ? "auto" : 9,
          borderBottom: `1px solid ${alpha("#ffffff", 0.1)}`,
        }}
      >
        {renderCompanyLocationDropdowns()}
      </Box>

      {/* Navigation Items */}
      <List
        sx={{
          p: 1,
          mt: 1,
          flexGrow: 1,
          position: "relative",
          zIndex: 1,
          overflowY: isMobile ? "visible" : "auto",
          maxHeight: isMobile ? "none" : "calc(100vh - 200px)",
        }}
      >
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
        <Collapse
          in={insightiqOpen && (open || isMobile)}
          timeout="auto"
          unmountOnExit
        >
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
        <Collapse
          in={orderiqOpen && (open || isMobile)}
          timeout="auto"
          unmountOnExit
        >
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
                minHeight: isMobile ? 48 : isSmallScreen ? 44 : 48,
                justifyContent: open || isMobile ? "initial" : "center",
                px: isMobile ? 2 : isSmallScreen ? 1.5 : 2.5,
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
                title={open || isMobile ? "" : "Sign Out"}
                placement="right"
                arrow
                disableHoverListener={isMobile}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr:
                      open || isMobile
                        ? isMobile
                          ? 1.5
                          : isSmallScreen
                          ? 1.5
                          : 2
                        : "auto",
                    justifyContent: "center",
                    color: "#e0e0e0",
                    transition: "color 0.3s ease",
                    fontSize: isMobile
                      ? "1.4rem"
                      : isSmallScreen
                      ? "1.2rem"
                      : "1.5rem",
                  }}
                >
                  <LogoutIcon />
                </ListItemIcon>
              </Tooltip>
              <ListItemText
                primary="Sign Out"
                sx={{
                  transition: "opacity 0.3s ease",
                  opacity: open || isMobile ? 1 : 0,
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
            style: { zIndex: theme.zIndex.drawer },
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

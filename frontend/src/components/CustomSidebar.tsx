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

const drawerWidth = 260;
const gradientBackground = "linear-gradient(180deg, #050b1b 0%, #150949 100%)";

// Custom Logo Component - Exact same design as homepage
const CustomLogo = ({ size = 32 }) => (
  <Box
    sx={{
      width: size,
      height: size,
      borderRadius: "50%", // Perfect circle like homepage
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", // Exact same gradient
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: `0 4px 20px ${alpha("#667eea", 0.3)}`, // Same shadow as homepage
      position: "relative",
      overflow: "hidden",
    }}
  >
    <DashboardIcon
      sx={{
        color: "#ffffff",
        fontSize: size * 0.5, // Slightly smaller icon to match homepage proportions
        fontWeight: "bold",
      }}
    />
  </Box>
);

const CustomSidebar = ({ onSignOut }) => {
  const theme = useTheme();
  const location = useLocation();
  const dispatch = useDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
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

  // Get single selected values for dropdowns (assuming single selection for dropdowns)
  const selectedCompany = selectedCompanies.length > 0 ? selectedCompanies[0] : '';
  const selectedLocation = selectedLocations.length > 0 ? selectedLocations[0] : '';

  // Define your app name here
  const appName = "KPI360";

  // INSIGHTIQ dropdown items (renamed from analyticsItems)
  const insightiqItems = [
    { title: "Upload Excel", path: "/upload-excel", icon: <UploadFileIcon /> },
    { title: "Sales Split", path: "/manage-reports", icon: <PieChartIcon /> },
    { title: "Product Mix", path: "/Productmix", icon: <RestaurantIcon /> },
    { title: "Financials", path: "/Financials", icon: <AttachMoneyIcon /> },
    { title: "Companywide Sales", path: "/Saleswide", icon: <ShowChartIcon /> },
  ];

  // OrderIQ dropdown items
  const orderiqItems = [
    {
      title: "Analytics Dashboard",
      path: "/AnalyticsDashboard",
      icon: <PieChartIcon />,
    },
    { title: "Master File", path: "/MasterFile", icon: <InventoryIcon /> },
    {
      title: "Store Orders",
      path: "/OrderIQDashboard",
      icon: <DashboardIcon />,
    },
    {
      title: "Store Summary",
      path: "/StoreSummaryProduction",
      icon: <FactoryIcon />,
    },
    {
      title: "Financial Summary",
      path: "/SummaryFinancialDashboard",
      icon: <TrendingUpIcon />,
    },
     {
      title: "Reports",
      path: "/Reports",
      icon: <PieChartIcon />,
    },
  ];

  // Other navigation items (removed items that are now in OrderIQ dropdown)
  const navItems = [
    { title: "Payments", path: "/Payments", icon: <PaymentIcon /> },
    { title: "Help Center", path: "/HelpCenter", icon: <HelpIcon /> },
    {
      title: "Company",
      path: "/CompanyLocationManager",
      icon: <BusinessIcon />,
    },
  ];

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

  // Update available locations when selected company changes
  useEffect(() => {
    if (selectedCompany && companies.length > 0) {
      const selectedCompanyData = companies.find(company => company.company_id.toString() === selectedCompany.toString());
      setAvailableLocations(selectedCompanyData ? selectedCompanyData.locations : []);
    } else {
      setAvailableLocations([]);
    }
  }, [selectedCompany, companies]);

  // Handle company selection
  const handleCompanyChange = (event) => {
    const companyId = event.target.value;
    // Update Redux state with selected company
    dispatch(setSelectedCompanies([companyId]));
    // Clear location selection when company changes
    dispatch(setSelectedLocations([]));
  };

  // Handle location selection
  const handleLocationChange = (event) => {
    const locationId = event.target.value;
    // Update Redux state with selected location
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
      return (
        <ListItem key={item.path} disablePadding>
          <ListItemButton
            component={Link}
            to={item.path}
            onClick={handleItemClick}
            selected={isSelected}
            sx={{
              minHeight: 48,
              justifyContent: open ? "initial" : "center",
              px: 2.5,
              mx: 1,
              mb: 0.5,
              ml: isSubItem ? 2 : 1, // Indent sub-items
              borderRadius: "10px",
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
                width: "4px",
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
            <Tooltip title={open ? "" : item.title} placement="right" arrow>
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 2 : "auto",
                  justifyContent: "center",
                  color: isSelected ? "#ffffff" : "#e0e0e0",
                  transition: "color 0.3s ease",
                }}
              >
                {item.icon}
              </ListItemIcon>
            </Tooltip>
            <ListItemText
              primary={item.title}
              sx={{
                transition: "opacity 0.3s ease",
                opacity: open ? 1 : 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                "& .MuiTypography-root": {
                  fontWeight: isSelected ? 700 : 400,
                  color: isSelected ? "#ffffff" : "#f0f0f0",
                  fontSize: isSubItem ? "0.875rem" : "1rem", // Smaller font for sub-items
                },
              }}
            />
          </ListItemButton>
        </ListItem>
      );
    });

  const renderDropdownButton = (title, isOpen, isSelected, onToggle, icon) => (
    <ListItem disablePadding>
      <ListItemButton
        onClick={onToggle}
        sx={{
          minHeight: 48,
          justifyContent: open ? "initial" : "center",
          px: 2.5,
          mx: 1,
          mb: 0.5,
          borderRadius: "10px",
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
            width: "4px",
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
        <Tooltip title={open ? "" : title} placement="right" arrow>
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: open ? 2 : "auto",
              justifyContent: "center",
              color: isSelected ? "#ffffff" : "#e0e0e0",
              transition: "color 0.3s ease",
            }}
          >
            {icon}
          </ListItemIcon>
        </Tooltip>
        <ListItemText
          primary={title}
          sx={{
            transition: "opacity 0.3s ease",
            opacity: open ? 1 : 0,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            "& .MuiTypography-root": {
              fontWeight: isSelected ? 700 : 400,
              color: isSelected ? "#ffffff" : "#f0f0f0",
            },
          }}
        />
        {open && (
          <Box sx={{ ml: 1 }}>
            {isOpen ? (
              <ExpandLess sx={{ color: isSelected ? "#ffffff" : "#e0e0e0" }} />
            ) : (
              <ExpandMore sx={{ color: isSelected ? "#ffffff" : "#e0e0e0" }} />
            )}
          </Box>
        )}
      </ListItemButton>
    </ListItem>
  );

  // Company and Location Dropdowns Component
  const renderCompanyLocationDropdowns = () => {
    if (!open) return null; // Hide dropdowns when sidebar is collapsed

    return (
      <Box sx={{ px: 2, pb: 2 }}>
        {/* Company Dropdown */}
        <FormControl 
          fullWidth 
          size="small" 
          sx={{ 
            mb: 1.5,
            '& .MuiOutlinedInput-root': {
              backgroundColor: alpha('#ffffff', 0.1),
              borderRadius: '8px',
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
                fontSize: '0.875rem',
              },
              '& .MuiSelect-icon': {
                color: '#ffffff',
              },
            },
            '& .MuiInputLabel-root': {
              color: alpha('#ffffff', 0.7),
              fontSize: '0.875rem',
              '&.Mui-focused': {
                color: '#ffffff',
              },
            },
          }}
        >
          <InputLabel>Select Company *</InputLabel>
          <Select
            value={selectedCompany}
            onChange={handleCompanyChange}
            label="Select Company *"
            disabled={loading}
            startAdornment={
              <BusinessIcon sx={{ color: alpha('#ffffff', 0.7), mr: 1, fontSize: '1rem' }} />
            }
            MenuProps={{
              PaperProps: {
                sx: {
                  bgcolor: '#1a1a1a',
                  color: '#ffffff',
                  '& .MuiMenuItem-root': {
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
                {company.company_name}
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
              backgroundColor: alpha('#ffffff', 0.1),
              borderRadius: '8px',
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
                fontSize: '0.875rem',
              },
              '& .MuiSelect-icon': {
                color: '#ffffff',
              },
            },
            '& .MuiInputLabel-root': {
              color: alpha('#ffffff', 0.7),
              fontSize: '0.875rem',
              '&.Mui-focused': {
                color: '#ffffff',
              },
              '&.Mui-disabled': {
                color: alpha('#ffffff', 0.4),
              },
            },
          }}
        >
          <InputLabel>Select Location *</InputLabel>
          <Select
            value={selectedLocation}
            onChange={handleLocationChange}
            label="Select Location *"
            startAdornment={
              <LocationOnIcon sx={{ color: alpha('#ffffff', 0.7), mr: 1, fontSize: '1rem' }} />
            }
            MenuProps={{
              PaperProps: {
                sx: {
                  bgcolor: '#1a1a1a',
                  color: '#ffffff',
                  '& .MuiMenuItem-root': {
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
                {location.location_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    );
  };

  const drawerContent = (
    <>
      {/* Header Section - Aligned with navigation items */}
      <Box
        sx={{
          borderBottom: `1px solid ${alpha("#ffffff", 0.2)}`,
          boxShadow: `0 1px 3px ${alpha("#000000", 0.08)}`,
          backgroundColor: "transparent",
          position: "sticky",
          top: 0,
          zIndex: 1,
          minHeight: 64,
          mx: 1,
          mt: 1,
        }}
      >
        <ListItemButton
          sx={{
            minHeight: 48,
            justifyContent: open ? "initial" : "center",
            px: 2.5,
            borderRadius: "10px",
            cursor: "default",
            "&:hover": {
              backgroundColor: "transparent",
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: open ? 2 : "auto",
              justifyContent: "center",
              color: "#ffffff",
            }}
          >
            <CustomLogo size={32} />
          </ListItemIcon>
          <ListItemText
            primary={appName}
            sx={{
              transition: "opacity 0.3s ease",
              opacity: open ? 1 : 0,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              "& .MuiTypography-root": {
                fontWeight: "bold",
                color: "#ffffff",
                fontSize: "1.25rem",
              },
            }}
          />
        </ListItemButton>
      </Box>

      {/* Company and Location Dropdowns */}
      {renderCompanyLocationDropdowns()}

      {/* Navigation Items */}
      <List sx={{ p: 1, mt: 1, flexGrow: 1 }}>
        {/* INSIGHTIQ Dropdown */}
        {renderDropdownButton(
          "INSIGHTiQ",
          insightiqOpen,
          isInsightiqSelected,
          handleInsightiqToggle,
          <AssessmentIcon />
        )}

        {/* INSIGHTIQ Sub-items */}
        <Collapse in={insightiqOpen && open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {renderNavItems(insightiqItems, true)}
          </List>
        </Collapse>

        {/* OrderIQ Dropdown */}
        {renderDropdownButton(
          "ORDERiQ",
          orderiqOpen,
          isOrderiqSelected,
          handleOrderiqToggle,
          <ShoppingCartIcon />
        )}

        {/* OrderIQ Sub-items */}
        <Collapse in={orderiqOpen && open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {renderNavItems(orderiqItems, true)}
          </List>
        </Collapse>

        {/* Other Navigation Items */}
        {renderNavItems(navItems)}
      </List>

      {/* Divider */}
      <Divider sx={{ borderColor: alpha("#ffffff", 0.3), mx: 1 }} />

      {/* Sign Out Section - Styled like nav items */}
      <Box sx={{ p: 1 }}>
        {onSignOut && (
          <ListItem disablePadding>
            <ListItemButton
              onClick={onSignOut}
              sx={{
                minHeight: 48,
                justifyContent: open ? "initial" : "center",
                px: 2.5,
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
              <Tooltip title={open ? "" : "Sign Out"} placement="right" arrow>
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : "auto",
                    justifyContent: "center",
                    color: "#e0e0e0",
                    transition: "color 0.3s ease",
                  }}
                >
                  <LogoutIcon />
                </ListItemIcon>
              </Tooltip>
              <ListItemText
                primary="Sign Out"
                sx={{
                  transition: "opacity 0.3s ease",
                  opacity: open ? 1 : 0,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  "& .MuiTypography-root": {
                    fontWeight: 400,
                    color: "#f0f0f0",
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
            top: 10,
            left: 10,
            zIndex: theme.zIndex.drawer + 2,
            bgcolor: "background.paper",
            boxShadow: `0 2px 5px ${alpha("#000", 0.15)}`,
            "&:hover": {
              bgcolor: alpha(theme.palette.background.default, 0.9),
            },
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
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              backgroundImage: gradientBackground,
              color: "#ffffff",
              borderRight: "none",
              display: "flex",
              flexDirection: "column",
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
              width: 40,
              height: 40,
              border: "1px solid rgba(0,0,0,0.1)",
              zIndex: 1300,
              transition: "all 0.3s ease",
              "&:hover": {
                bgcolor: "#F8F9FA",
              },
            }}
          >
            {open ? (
              <ChevronLeftIcon fontSize="small" />
            ) : (
              <ChevronRightIcon fontSize="small" />
            )}
          </IconButton>
        </Box>
      )}
    </>
  );
};

export default CustomSidebar;
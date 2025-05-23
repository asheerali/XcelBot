import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Tabs,
  Tab,
  Button,
  useTheme,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  TextField,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Autocomplete,
  Popper,
  Paper,
  ClickAwayListener,
  MenuList,
  Popover,
  useMediaQuery,
} from "@mui/material";

// Icons
import FilterListIcon from "@mui/icons-material/FilterList";
import RefreshIcon from "@mui/icons-material/Refresh";
import PlaceIcon from "@mui/icons-material/Place";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import PersonIcon from "@mui/icons-material/Person";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import MenuAnalysisDashboard from "../components/SalesDashboard";

// Import Redux hooks (assuming you have these set up)
import { useAppDispatch, useAppSelector } from "../typedHooks";
import MenuAnalysisDashboardtwo from "../components/MenuAnalysisDashboardtwo";

// TabPanel Component
interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`product-mix-tabpanel-${index}`}
      aria-labelledby={`product-mix-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

// Custom MultiSelect component with search functionality
interface MultiSelectProps {
  id: string;
  label: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  icon?: React.ReactNode;
  placeholder?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  id,
  label,
  options,
  value,
  onChange,
  icon,
  placeholder,
}) => {
  const [searchText, setSearchText] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleToggle = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
    setAnchorEl(null);
    setSearchText("");
  };

  const handleSelect = (option: string) => {
    const newValue = value.includes(option)
      ? value.filter((item) => item !== option)
      : [...value, option];
    onChange(newValue);
  };

  const handleSelectAll = () => {
    if (value.length === options.length) {
      onChange([]);
    } else {
      onChange([...options]);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      handleClose();
    }
  };

  return (
    <Box sx={{ position: "relative", width: "100%" }}>
      <Box
        onClick={handleToggle}
        sx={{
          display: "flex",
          alignItems: "center",
          border: "1px solid rgba(0, 0, 0, 0.23)",
          borderRadius: 1,
          p: 1,
          cursor: "pointer",
          minHeight: "40px",
          position: "relative",
          height: "40px", // Fixed height to maintain consistency
          overflow: "hidden",
        }}
      >
        {icon && (
          <Box
            sx={{
              color: "primary.light",
              mr: 1,
              ml: -0.5,
              display: "flex",
              alignItems: "center",
            }}
          >
            {icon}
          </Box>
        )}

        <Box
          sx={{
            flexGrow: 1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {value.length === 0 && (
            <Typography color="text.secondary" variant="body2" noWrap>
              {placeholder || "Select options"}
            </Typography>
          )}

          {value.length > 0 && (
            <Box
              sx={{
                display: "flex",
                flexWrap: "nowrap",
                gap: 0.5,
                overflow: "hidden",
              }}
            >
              {value.length <= 2 ? (
                value.map((item) => (
                  <Chip
                    key={item}
                    label={item}
                    size="small"
                    onDelete={(e) => {
                      e.stopPropagation();
                      onChange(value.filter((val) => val !== item));
                    }}
                    onClick={(e) => e.stopPropagation()}
                    sx={{ maxWidth: "120px" }}
                  />
                ))
              ) : (
                <>
                  <Chip
                    label={value[0]}
                    size="small"
                    onDelete={(e) => {
                      e.stopPropagation();
                      onChange(value.filter((val) => val !== value[0]));
                    }}
                    onClick={(e) => e.stopPropagation()}
                    sx={{ maxWidth: "120px" }}
                  />
                  <Chip
                    label={`+${value.length - 1} more`}
                    size="small"
                    onClick={(e) => e.stopPropagation()}
                  />
                </>
              )}
            </Box>
          )}
        </Box>

        <Box
          sx={{
            position: "absolute",
            right: 8,
            top: "50%",
            transform: "translateY(-50%)",
          }}
        >
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
          >
            {isOpen ? (
              <CloseIcon fontSize="small" />
            ) : (
              <SearchIcon fontSize="small" />
            )}
          </IconButton>
        </Box>
      </Box>

      <InputLabel
        htmlFor={id}
        sx={{
          position: "absolute",
          top: -6,
          left: 8,
          backgroundColor: "white",
          px: 0.5,
          fontSize: "0.75rem",
          pointerEvents: "none",
        }}
      >
        {label}
      </InputLabel>

      <Popover
        id={`${id}-popover`}
        open={isOpen}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        PaperProps={{
          style: {
            width: anchorEl ? anchorEl.clientWidth : undefined,
            maxHeight: 300,
            overflow: "auto",
          },
        }}
      >
        <Box sx={{ p: 1 }}>
          <TextField
            autoFocus
            fullWidth
            placeholder="Search..."
            size="small"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={handleKeyDown}
            InputProps={{
              startAdornment: (
                <SearchIcon
                  fontSize="small"
                  sx={{ mr: 1, color: "action.active" }}
                />
              ),
            }}
          />
        </Box>
        <Divider />
        <Box sx={{ p: 1 }}>
          <MenuItem dense onClick={handleSelectAll}>
            <Checkbox
              checked={value.length === options.length}
              indeterminate={value.length > 0 && value.length < options.length}
              size="small"
            />
            <ListItemText primary="Select All" />
          </MenuItem>
        </Box>
        <Divider />
        <MenuList>
          {filteredOptions.length === 0 ? (
            <MenuItem disabled>
              <ListItemText primary="No options found" />
            </MenuItem>
          ) : (
            filteredOptions.map((option) => (
              <MenuItem key={option} dense onClick={() => handleSelect(option)}>
                <Checkbox checked={value.includes(option)} size="small" />
                <ListItemText primary={option} />
              </MenuItem>
            ))
          )}
        </MenuList>
      </Popover>
    </Box>
  );
};

// Sample data for filters
const LOCATIONS = [
  "Midtown East",
  "Downtown West",
  "Uptown North",
  "Southside",
  "West Village",
  "Upper East",
  "Financial District",
];
const DATE_RANGES = [
  "10 | 03/03/2025 - 03/09/2025",
  "11 | 03/10/2025 - 03/16/2025",
  "12 | 03/17/2025 - 03/23/2025",
  "13 | 03/24/2025 - 03/30/2025",
  "14 | 03/31/2025 - 04/06/2025",
  "15 | 04/07/2025 - 04/13/2025",
];
const SERVERS = [
  "John Smith",
  "Maria Garcia",
  "David Johnson",
  "Lisa Williams",
  "Robert Brown",
  "Linda Chen",
  "Michael Rodriguez",
];
const MENU_ITEMS = [
  "Burger",
  "Pizza",
  "Pasta",
  "Salad",
  "Chicken Sandwich",
  "French Fries",
  "Coca Cola",
  "Dessert",
  "Ice Cream",
  "Coffee",
];
const DINING_OPTIONS = [
  "Dine In",
  "Take Out",
  "Delivery",
  "Catering",
  "Drive Thru",
  "Online Order",
  "DoorDash",
  "Uber Eats",
  "GrubHub",
  "Pickup",
];

// Main Dashboard Component
export default function ProductMixDashboard() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  // State variables
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Filter states using multiselect arrays
  const [locations, setLocations] = useState<string[]>([LOCATIONS[0]]);
  const [dateRanges, setDateRanges] = useState<string[]>([DATE_RANGES[1]]);
  const [servers, setServers] = useState<string[]>([]);
  const [menuItems, setMenuItems] = useState<string[]>([]);
  const [diningOptions, setDiningOptions] = useState<string[]>([]);

  // Handlers for filter changes
  const handleLocationChange = (newValue: string[]) => {
    setLocations(newValue);
  };

  const handleDateRangeChange = (newValue: string[]) => {
    setDateRanges(newValue);
  };

  const handleServerChange = (newValue: string[]) => {
    setServers(newValue);
  };

  const handleMenuItemChange = (newValue: string[]) => {
    setMenuItems(newValue);
  };

  const handleDiningOptionChange = (newValue: string[]) => {
    setDiningOptions(newValue);
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle refresh - simulate data loading
  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate data loading
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  // Calculate grid sizing based on mobile/tablet status and current tab
  const getGridSizes = () => {
    // On mobile, always use full width for each filter
    if (isMobile) {
      return { xs: 12 };
    }
    // On tablet, use half width for each filter
    else if (isTablet) {
      return { xs: 12, sm: 6 };
    }
    // On desktop/laptop
    else {
      // Use 25% width (3 out of 12 grid columns) to fit 4 filters in one row
      return { xs: 12, sm: 6, md: 3 };
    }
  };

  const gridSizes = getGridSizes();

  // Inject the rotating animation styles for the refresh icon
  React.useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = `
      @keyframes rotating {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .rotating {
        animation: rotating 2s linear infinite;
      }
    `;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Dashboard Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 600,
            color: "rgb(9, 43, 117)",
            fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
          }}
        >
          Product Mix Dashboard
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Help">
            <IconButton
              color="info"
              sx={{ backgroundColor: "white", boxShadow: 1 }}
            >
              <HelpOutlineIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      {/* Filters Section */}
      <Card elevation={3} sx={{ mb: 3, borderRadius: 2, overflow: "hidden" }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FilterListIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                Filters
              </Typography>
            </Box>
            <Button
              variant="outlined"
              size="small"
              color="primary"
              disabled={isLoading}
              onClick={handleRefresh}
              startIcon={
                isLoading ? (
                  <RefreshIcon className="rotating" />
                ) : (
                  <RefreshIcon />
                )
              }
            >
              {isLoading ? "Loading..." : "Apply Filters"}
            </Button>
          </Box>

          <Grid container spacing={2}>
            {/* Location filter - always visible */}
            <Grid item {...gridSizes}>
              <MultiSelect
                id="location-select"
                label="Location"
                options={LOCATIONS}
                value={locations}
                onChange={handleLocationChange}
                icon={<PlaceIcon />}
                placeholder="Select locations"
              />
            </Grid>

            {/* Date Range filter - always visible */}
            <Grid item {...gridSizes}>
              <MultiSelect
                id="date-range-select"
                label="Date Range"
                options={DATE_RANGES}
                value={dateRanges}
                onChange={handleDateRangeChange}
                icon={<CalendarTodayIcon />}
                placeholder="Select date ranges"
              />
            </Grid>

            {/* Server/Menu filter - conditional based on tab */}
            <Grid item {...gridSizes}>
              {tabValue === 0 ? (
                <MultiSelect
                  id="server-select"
                  label="Server"
                  options={SERVERS}
                  value={servers}
                  onChange={handleServerChange}
                  icon={<PersonIcon />}
                  placeholder="Select servers"
                />
              ) : (
                <MultiSelect
                  id="menu-item-select"
                  label="Menu Item"
                  options={MENU_ITEMS}
                  value={menuItems}
                  onChange={handleMenuItemChange}
                  icon={<RestaurantMenuIcon />}
                  placeholder="disabled filter"
                />
              )}
            </Grid>

            {/* Dining Option filter - always visible */}
            <Grid item {...gridSizes}>
              <MultiSelect
                id="dining-option-select"
                label="Category"
                options={DINING_OPTIONS}
                value={diningOptions}
                onChange={handleDiningOptionChange}
                icon={<FastfoodIcon />}
                placeholder="Select dining category"
              />
            </Grid>
          </Grid>

          {/* Active filters display */}
          {(locations.length > 0 ||
            dateRanges.length > 0 ||
            servers.length > 0 ||
            menuItems.length > 0 ||
            diningOptions.length > 0) && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Active Filters:
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {locations.length > 0 && (
                  <Chip
                    label={
                      locations.length === 1
                        ? `Location: ${locations[0]}`
                        : `Locations: ${locations.length} selected`
                    }
                    color="primary"
                    variant="outlined"
                    size="small"
                    icon={<PlaceIcon />}
                    onDelete={() => setLocations([])}
                  />
                )}

                {dateRanges.length > 0 && (
                  <Chip
                    label={
                      dateRanges.length === 1
                        ? `Date Range: ${dateRanges[0].split("|")[0].trim()}`
                        : `Date Ranges: ${dateRanges.length} selected`
                    }
                    color="secondary"
                    variant="outlined"
                    size="small"
                    icon={<CalendarTodayIcon />}
                    onDelete={() => setDateRanges([])}
                  />
                )}

                {tabValue === 0 && servers.length > 0 && (
                  <Chip
                    label={
                      servers.length === 1
                        ? `Server: ${servers[0]}`
                        : `Servers: ${servers.length} selected`
                    }
                    color="info"
                    variant="outlined"
                    size="small"
                    icon={<PersonIcon />}
                    onDelete={() => setServers([])}
                  />
                )}

                {tabValue === 1 && menuItems.length > 0 && (
                  <Chip
                    label={
                      menuItems.length === 1
                        ? `Menu Item: ${menuItems[0]}`
                        : `Menu Items: ${menuItems.length} selected`
                    }
                    color="success"
                    variant="outlined"
                    size="small"
                    icon={<RestaurantMenuIcon />}
                    onDelete={() => setMenuItems([])}
                  />
                )}

                {diningOptions.length > 0 && (
                  <Chip
                    label={
                      diningOptions.length === 1
                        ? `Dining Option: ${diningOptions[0]}`
                        : `Dining Options: ${diningOptions.length} selected`
                    }
                    color="error"
                    variant="outlined"
                    size="small"
                    icon={<FastfoodIcon />}
                    onDelete={() => setDiningOptions([])}
                  />
                )}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>{" "}
      {/* Tabs */}
      <Card sx={{ borderRadius: 2, mb: 3, overflow: "hidden" }} elevation={3}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            "& .MuiTab-root": {
              fontWeight: 500,
              textTransform: "none",
              fontSize: "1rem",
              py: 1.5,
            },
            "& .Mui-selected": {
              color: "#4285f4",
              fontWeight: 600,
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#4285f4",
              height: 3,
            },
          }}
        >
          <Tab label="Overview" />
          <Tab label="Detailed Analysis" />
        </Tabs>

        {/* Server Performance Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
            <MenuAnalysisDashboard />
          </Box>
        </TabPanel>

        {/* Menu Analysis Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
            <MenuAnalysisDashboardtwo />
          </Box>
        </TabPanel>
      </Card>
      {/* Placeholder for dashboard content */}
      <Box sx={{ mt: 2 }}></Box>
    </Box>
  );
}

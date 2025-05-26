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
  Alert,
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

// Updated imports for the dashboard components
import MenuAnalysisDashboard from "../components/SalesDashboard";
import MenuAnalysisDashboardtwo from "../components/MenuAnalysisDashboardtwo";

// Import Redux hooks
import { useAppDispatch, useAppSelector } from "../typedHooks";
import {
  selectProductMixLocation,
  updateProductMixFilters
} from "../store/excelSlice";

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
          height: "40px",
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

// Main Dashboard Component
export default function ProductMixDashboard() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  // Get Product Mix data from Redux
  const {
    productMixFiles,
    productMixLocations,
    currentProductMixLocation,
    productMixFilters
  } = useAppSelector((state) => state.excel);

  // Find current data for the selected location
  const currentProductMixData = productMixFiles.find(f => f.location === currentProductMixLocation)?.data;

  // State variables
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Extract filter options from actual data
  const locations = productMixLocations.length > 0 ? productMixLocations : ['No locations available'];
  const servers = currentProductMixData?.servers?.filter(server => !server.includes('DO NOT CHANGE')) || ['No servers available'];
  const categories = currentProductMixData?.categories || ['In-House', 'DD', '1P', 'GH', 'Catering', 'UB', 'Others'];
  const menuItems = currentProductMixData?.table7?.map(item => item['Menu Item']).filter(Boolean) || ['No menu items available'];

  // Date ranges - you can customize these based on your needs
  const DATE_RANGES = [
    "10 | 03/03/2025 - 03/09/2025",
    "11 | 03/10/2025 - 03/16/2025",
    "12 | 03/17/2025 - 03/23/2025",
    "13 | 03/24/2025 - 03/30/2025",
    "14 | 03/31/2025 - 04/06/2025",
    "15 | 04/07/2025 - 04/13/2025",
  ];

  // Filter states using multiselect arrays - Initialize with actual data
  const [selectedLocations, setSelectedLocations] = useState<string[]>([currentProductMixLocation || locations[0]]);
  const [dateRanges, setDateRanges] = useState<string[]>([DATE_RANGES[1]]);
  const [selectedServers, setSelectedServers] = useState<string[]>([]);
  const [selectedMenuItems, setSelectedMenuItems] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Update selected locations when currentProductMixLocation changes
  useEffect(() => {
    if (currentProductMixLocation && !selectedLocations.includes(currentProductMixLocation)) {
      setSelectedLocations([currentProductMixLocation]);
    }
  }, [currentProductMixLocation, selectedLocations]);

  // Handlers for filter changes
  const handleLocationChange = (newValue: string[]) => {
    setSelectedLocations(newValue);
    // Update Redux state
    if (newValue.length > 0) {
      dispatch(selectProductMixLocation(newValue[0]));
      dispatch(updateProductMixFilters({ location: newValue[0] }));
    }
  };

  const handleDateRangeChange = (newValue: string[]) => {
    setDateRanges(newValue);
    dispatch(updateProductMixFilters({ dateRange: newValue[0] || '' }));
  };

  const handleServerChange = (newValue: string[]) => {
    setSelectedServers(newValue);
    dispatch(updateProductMixFilters({ server: newValue.join(',') }));
  };

  const handleMenuItemChange = (newValue: string[]) => {
    setSelectedMenuItems(newValue);
    dispatch(updateProductMixFilters({ menuItem: newValue.join(',') }));
  };

  const handleCategoryChange = (newValue: string[]) => {
    setSelectedCategories(newValue);
    dispatch(updateProductMixFilters({ category: newValue.join(',') }));
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

  // Calculate grid sizing based on mobile/tablet status
  const getGridSizes = () => {
    if (isMobile) {
      return { xs: 12 };
    } else if (isTablet) {
      return { xs: 12, sm: 6 };
    } else {
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

      {/* Alert message when no data is available */}
      {!currentProductMixData && (
        <Alert severity="info" sx={{ mb: 3 }}>
          No Product Mix data available. Please upload files with "Product Mix" dashboard type from the Excel Upload page.
        </Alert>
      )}

      {/* Show current data summary */}
      {currentProductMixData && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Data loaded:</strong> {currentProductMixData.fileName} | 
            <strong> Location:</strong> {currentProductMixLocation} | 
            <strong> Net Sales:</strong> ${(currentProductMixData.table1?.[0]?.net_sales?.[0] || 0).toLocaleString()} | 
            <strong> Orders:</strong> {currentProductMixData.table1?.[0]?.orders?.[0] || 0} | 
            <strong> Items Sold:</strong> {currentProductMixData.table1?.[0]?.qty_sold?.[0] || 0}
          </Typography>
        </Alert>
      )}

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
            {/* Location filter */}
            <Grid item {...gridSizes}>
              <MultiSelect
                id="location-select"
                label="Location"
                options={locations}
                value={selectedLocations}
                onChange={handleLocationChange}
                icon={<PlaceIcon />}
                placeholder="Select locations"
              />
            </Grid>

            {/* Date Range filter */}
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
                  options={servers}
                  value={selectedServers}
                  onChange={handleServerChange}
                  icon={<PersonIcon />}
                  placeholder="Select servers"
                />
              ) : (
                <MultiSelect
                  id="menu-item-select"
                  label="Menu Item"
                  options={menuItems}
                  value={selectedMenuItems}
                  onChange={handleMenuItemChange}
                  icon={<RestaurantMenuIcon />}
                  placeholder="Select menu items"
                />
              )}
            </Grid>

            {/* Category filter */}
            <Grid item {...gridSizes}>
              <MultiSelect
                id="category-select"
                label="Category"
                options={categories}
                value={selectedCategories}
                onChange={handleCategoryChange}
                icon={<FastfoodIcon />}
                placeholder="Select categories"
              />
            </Grid>
          </Grid>

          {/* Active filters display */}
          {(selectedLocations.length > 0 ||
            dateRanges.length > 0 ||
            selectedServers.length > 0 ||
            selectedMenuItems.length > 0 ||
            selectedCategories.length > 0) && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Active Filters:
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {selectedLocations.length > 0 && (
                  <Chip
                    label={
                      selectedLocations.length === 1
                        ? `Location: ${selectedLocations[0]}`
                        : `Locations: ${selectedLocations.length} selected`
                    }
                    color="primary"
                    variant="outlined"
                    size="small"
                    icon={<PlaceIcon />}
                    onDelete={() => setSelectedLocations([])}
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

                {tabValue === 0 && selectedServers.length > 0 && (
                  <Chip
                    label={
                      selectedServers.length === 1
                        ? `Server: ${selectedServers[0]}`
                        : `Servers: ${selectedServers.length} selected`
                    }
                    color="info"
                    variant="outlined"
                    size="small"
                    icon={<PersonIcon />}
                    onDelete={() => setSelectedServers([])}
                  />
                )}

                {tabValue === 1 && selectedMenuItems.length > 0 && (
                  <Chip
                    label={
                      selectedMenuItems.length === 1
                        ? `Menu Item: ${selectedMenuItems[0]}`
                        : `Menu Items: ${selectedMenuItems.length} selected`
                    }
                    color="success"
                    variant="outlined"
                    size="small"
                    icon={<RestaurantMenuIcon />}
                    onDelete={() => setSelectedMenuItems([])}
                  />
                )}

                {selectedCategories.length > 0 && (
                  <Chip
                    label={
                      selectedCategories.length === 1
                        ? `Category: ${selectedCategories[0]}`
                        : `Categories: ${selectedCategories.length} selected`
                    }
                    color="error"
                    variant="outlined"
                    size="small"
                    icon={<FastfoodIcon />}
                    onDelete={() => setSelectedCategories([])}
                  />
                )}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Only render dashboard content if data is available */}
      {currentProductMixData && (
        <>
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
              <Tab label="Server Performance" />
              <Tab label="Menu Analysis" />
            </Tabs>

            {/* Server Performance Tab */}
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
                <MenuAnalysisDashboard productMixData={currentProductMixData} />
              </Box>
            </TabPanel>

            {/* Menu Analysis Tab */}
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
                <MenuAnalysisDashboardtwo productMixData={currentProductMixData} />
              </Box>
            </TabPanel>
          </Card>
        </>
      )}

      {/* Show message if no data available */}
      {!currentProductMixData && productMixFiles.length === 0 && (
        <Card sx={{ borderRadius: 2, mb: 3, p: 3 }}>
         
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2 }}
            href="/upload-excel"
          >
            Go to Upload Page
          </Button>
        </Card>
      )}
    </Box>
  );
}
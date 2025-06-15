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
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import axios from "axios"; // Added axios import
import { format } from 'date-fns';

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
import DateRangeSelector from "../components/DateRangeSelector";
// Import MenuItemsTable component
import MenuItemsTable from "../components/MenuItemsTable";

// Import Redux hooks
import { useAppDispatch, useAppSelector } from "../typedHooks";
import {
  selectProductMixLocation,
  updateProductMixFilters,
  setTableData,
  addProductMixData,
  excelSlice,
} from "../store/excelSlice";

// Extract actions from the slice
const { setLoading, setError } = excelSlice.actions;

import { API_URL_Local } from "../constants"; // Import API base URL

// API URL for Product Mix filter
const PRODUCT_MIX_FILTER_API_URL = API_URL_Local + "/api/pmix/filter";

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
    productMixFilters,
    loading,
    error,
  } = useAppSelector((state) => state.excel);

  // Find current data for the selected location
  const currentProductMixData = productMixFiles.find(
    (f) => f.location === currentProductMixLocation
  )?.data;

  // Find current file info
  const currentProductMixFile = productMixFiles.find(
    (f) => f.location === currentProductMixLocation
  );

  // State variables
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [filterError, setFilterError] = useState<string>("");
  const [dataUpdated, setDataUpdated] = useState<boolean>(false);

  // UPDATED: No default date range - empty state
  const [localStartDate, setLocalStartDate] = useState<string>("");
  const [localEndDate, setLocalEndDate] = useState<string>("");
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
  });

  // Extract filter options from actual data
  const locations =
    productMixLocations.length > 0
      ? productMixLocations
      : ["No locations available"];
  const servers = currentProductMixData?.servers?.filter(
    (server) => !server.includes("DO NOT CHANGE")
  ) || ["No servers available"];
  const categories = currentProductMixData?.categories || [
    "In-House",
    "DD",
    "1P",
    "GH",
    "Catering",
    "UB",
    "Others",
  ];
  const menuItems = currentProductMixData?.table7
    ?.map((item) => item["Menu Item"])
    .filter(Boolean) || ["No menu items available"];

  // UPDATED: Filter states using multiselect arrays - No defaults, but initially select all available locations
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedServers, setSelectedServers] = useState<string[]>([]);
  const [selectedMenuItems, setSelectedMenuItems] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [hasInitializedLocations, setHasInitializedLocations] = useState(false);

  // Initially select all available locations (not a default, just initial state)
  useEffect(() => {
    if (
      !hasInitializedLocations && 
      productMixLocations.length > 0 && 
      !productMixLocations.includes("No locations available") &&
      selectedLocations.length === 0
    ) {
      // Initially select ALL available locations
      setSelectedLocations([...productMixLocations]);
      setHasInitializedLocations(true);
      console.log('📍 Initially selecting all available locations:', productMixLocations);
    }
  }, [productMixLocations, selectedLocations.length, hasInitializedLocations]);

  // Clear dataUpdated state when filters change
  useEffect(() => {
    setDataUpdated(false);
  }, [selectedLocations, localStartDate, localEndDate, selectedServers, selectedCategories, selectedMenuItems]);

  // Handlers for filter changes
  const handleLocationChange = (newValue: string[]) => {
    setSelectedLocations(newValue);
    // Update Redux state
    if (newValue.length > 0) {
      dispatch(selectProductMixLocation(newValue[0]));
      dispatch(updateProductMixFilters({ location: newValue[0] }));
    }
  };

  // Date range handling - following DateRangeSelector pattern
  const openDateRangePicker = () => {
    setIsDateRangeOpen(true);
  };

  const handleDateRangeSelect = (range: any) => {
    setSelectedRange(range);
  };

  const applyDateRange = () => {
    const formattedStartDate = format(selectedRange.startDate, 'MM/dd/yyyy');
    const formattedEndDate = format(selectedRange.endDate, 'MM/dd/yyyy');
    
    console.log('📅 ProductMix: Setting date range locally:', {
      startDate: formattedStartDate,
      endDate: formattedEndDate
    });
    
    // Update local state
    setLocalStartDate(formattedStartDate);
    setLocalEndDate(formattedEndDate);
    
    // Update Redux state for persistence
    dispatch(updateProductMixFilters({ 
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      dateRangeType: 'Custom Date Range'
    }));
    
    setIsDateRangeOpen(false);
  };

  // Format display date
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return format(date, 'MMM dd, yyyy');
    } catch (e) {
      return dateStr;
    }
  };

  const handleServerChange = (newValue: string[]) => {
    setSelectedServers(newValue);
    dispatch(updateProductMixFilters({ server: newValue.join(",") }));
  };

  const handleMenuItemChange = (newValue: string[]) => {
    setSelectedMenuItems(newValue);
    dispatch(updateProductMixFilters({ menuItem: newValue.join(",") }));
  };

  const handleCategoryChange = (newValue: string[]) => {
    setSelectedCategories(newValue);
    dispatch(updateProductMixFilters({ category: newValue.join(",") }));
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // UPDATED: Clear all filters - no default values, resets initialization
  const handleClearAllFilters = () => {
    setSelectedLocations([]);
    setLocalStartDate("");
    setLocalEndDate("");
    setSelectedServers([]);
    setSelectedCategories([]);
    setSelectedMenuItems([]);
    setDataUpdated(false);
    setFilterError("");
    setHasInitializedLocations(false); // Reset initialization flag
    
    // Reset Redux filters
    dispatch(updateProductMixFilters({
      location: "",
      startDate: "",
      endDate: "",
      server: "",
      category: "",
      selectedCategories: [],
      dateRangeType: ""
    }));
  };

  // UPDATED: Handle Apply Filters with validation - only location validation needed
  const handleApplyFilters = async () => {
    // Validate required filters (only locations are required)
    if (selectedLocations.length === 0) {
      setFilterError("Please select at least one location");
      return;
    }

    setIsLoading(true);
    setFilterError("");
    setDataUpdated(false);

    try {
      // Check if we have any files loaded
      if (!currentProductMixFile) {
        throw new Error("No Product Mix data found for selected location");
      }

      console.log("🔄 Starting Product Mix filter process...");

      // Format dates correctly for API (convert MM/dd/yyyy to yyyy-MM-dd)
      let formattedStartDate: string | null = null;
      let formattedEndDate: string | null = null;
      
      if (localStartDate) {
        const dateParts = localStartDate.split('/');
        if (dateParts.length === 3) {
          formattedStartDate = `${dateParts[2]}-${dateParts[0].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}`;
        }
      }
      
      if (localEndDate) {
        const dateParts = localEndDate.split('/');
        if (dateParts.length === 3) {
          formattedEndDate = `${dateParts[2]}-${dateParts[0].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}`;
        }
      }

      // Prepare the request payload
      const payload = {
        fileName: currentProductMixFile.fileName,

        location: selectedLocations[0] || currentProductMixLocation,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        servers: selectedServers,
        categories: selectedCategories,
        menuItems: selectedMenuItems,
        dashboard: "Product Mix",
      };

      console.log("🚀 Sending Product Mix filter request:", payload);

      // Make API call to Product Mix filter endpoint
      const response = await axios.post(PRODUCT_MIX_FILTER_API_URL, payload);

      console.log("📥 Received Product Mix filter response:", response.data);

      if (response.data) {
        // Extract categories from the filtered data
        const extractedCategories = response.data.categories || selectedCategories;

        // Create enhanced data with filter metadata
        const enhancedData = {
          ...response.data,
          categories: extractedCategories,
          filterApplied: true,
          filterTimestamp: new Date().toISOString(),
          appliedFilters: {
            location: selectedLocations[0] || currentProductMixLocation,
            startDate: localStartDate,
            endDate: localEndDate,
            servers: selectedServers,
            categories: selectedCategories,
            menuItems: selectedMenuItems,
          }
        };

        console.log("📊 Enhanced data with filters:", enhancedData);

        // Update general table data (for compatibility)
        dispatch(setTableData(enhancedData));

        // IMPORTANT: Update the specific Product Mix data in Redux store
        dispatch(
          addProductMixData({
            fileName: currentProductMixFile.fileName,
            fileContent: currentProductMixFile.fileContent,
            location: selectedLocations[0] || currentProductMixLocation,
            data: enhancedData,
            categories: extractedCategories,
          })
        );

        // Update Redux filters to reflect what was applied
        dispatch(
          updateProductMixFilters({
            location: selectedLocations[0],
            startDate: localStartDate,
            endDate: localEndDate,
            server: selectedServers.join(","),
            category: selectedCategories.join(","),
            selectedCategories: selectedCategories,
            dateRangeType: 'Custom Date Range'
          })
        );

        // Update current location if changed
        if (selectedLocations[0] !== currentProductMixLocation) {
          dispatch(selectProductMixLocation(selectedLocations[0]));
        }

        // Set success state
        setDataUpdated(true);
        
        console.log("✅ Product Mix data updated successfully in Redux store");
        console.log("🔍 Updated product mix data:", enhancedData);

        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setDataUpdated(false);
        }, 5000);

      } else {
        throw new Error("No data received from server");
      }
    } catch (err: any) {
      console.error("❌ Product Mix filter error:", err);

      let errorMessage = "Error applying filters";

      if (axios.isAxiosError(err)) {
        if (err.response) {
          const detail = err.response.data?.detail;
          errorMessage = detail || `Server error: ${err.response.status}`;
        } else if (err.request) {
          errorMessage =
            "No response from server. Please check if the backend is running.";
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setFilterError(errorMessage);
      dispatch(setError(errorMessage));
    } finally {
      setIsLoading(false);
    }
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
    <div style={{ 
      textAlign: 'center', 
      marginBottom: '2rem',
      display: 'flex',
      justifyContent: 'center',
      width: '100%'
    }}>
            <h1 
              style={{ 
                fontWeight: 800,
                background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: 'clamp(1.75rem, 5vw, 3rem)',
                marginBottom: '8px',
                letterSpacing: '-0.02em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                margin: '0',
                textAlign: 'center'
              }}
            >
              <span style={{ 
                color: '#1976d2',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                fontSize: 'inherit',
                display: 'inline-flex',
                alignItems: 'center'
              }}>
                <svg 
                  width="1em" 
                  height="1em" 
                  viewBox="0 0 100 100" 
                  fill="currentColor"
                  style={{ fontSize: 'inherit' }}
                >
                  {/* 4-square logo matching your design */}
                  <rect x="10" y="10" width="35" height="35" rx="4" fill="#5A8DEE"/>
                  <rect x="55" y="10" width="35" height="35" rx="4" fill="#4285F4"/>
                  <rect x="10" y="55" width="35" height="35" rx="4" fill="#1976D2"/>
                  <rect x="55" y="55" width="35" height="35" rx="4" fill="#3F51B5"/>
                </svg>
              </span>
            Product Mix Dashboard
            </h1>
          </div>
      </Box>

      {/* Alert message when no data is available */}
      {!currentProductMixData && (
        <Alert severity="info" sx={{ mb: 3 }}>
          No Product Mix data available. Please upload files with "Product Mix"
          dashboard type from the Excel Upload page.
        </Alert>
      )}

      {/* Error Alert */}
      {(filterError || error) && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => {
            setFilterError("");
            dispatch(setError(null));
          }}
        >
          {filterError || error}
        </Alert>
      )}

      {/* Success Alert for Data Update */}
      {dataUpdated && (
        <Alert 
          severity="success" 
          sx={{ mb: 3 }}
          onClose={() => setDataUpdated(false)}
        >
          <Typography variant="body2">
            <strong>Filters Applied Successfully!</strong> Product Mix data has been updated with your selected filters.
            {currentProductMixData?.filterApplied && (
              <>
                <br />
                <strong>Applied on:</strong> {new Date(currentProductMixData.filterTimestamp).toLocaleString()}
              </>
            )}
          </Typography>
        </Alert>
      )}

      {/* Info Alert for Initial State */}
      {selectedLocations.length > 0 && !dataUpdated && !filterError && !error && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Ready to Filter:</strong> All available locations ({selectedLocations.length}) are initially selected. 
            Optionally modify any filters, then click "Apply Filters" to analyze your data.
          </Typography>
        </Alert>
      )}

      {/* Filters Section */}
      <Card elevation={3} sx={{ mb: 3, borderRadius: 2, overflow: "hidden" }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          {/* Filter Header */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FilterListIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                Filters
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                (All locations initially selected)
              </Typography>
            </Box>
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
                placeholder="All locations initially selected"
              />
            </Grid>

            {/* Date Range filter - Updated to be optional */}
            <Grid item {...gridSizes}>
              <Box sx={{ position: "relative", width: "100%" }}>
                <InputLabel
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
                  Date Range
                </InputLabel>
                <Button
                  variant="outlined"
                  onClick={openDateRangePicker}
                  startIcon={<CalendarTodayIcon />}
                  fullWidth
                  sx={{ 
                    height: 40, 
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    borderColor: 'rgba(0, 0, 0, 0.23)',
                    color: (!localStartDate || !localEndDate) ? 'text.secondary' : 'text.primary',
                    padding: '8px 14px',
                    '&:hover': {
                      borderColor: 'primary.main',
                    }
                  }}
                >
                  <Box sx={{ textAlign: 'left', flexGrow: 1 }}>
                    <Typography variant="body2" component="div" sx={{ fontSize: '0.875rem' }}>
                      {(!localStartDate || !localEndDate) 
                        ? "Select date range (optional)" 
                        : `${formatDisplayDate(localStartDate)} - ${formatDisplayDate(localEndDate)}`
                      }
                    </Typography>
                  </Box>
                </Button>
              </Box>
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
                placeholder="Select categories (optional)"
              />
            </Grid>
            
            {/* Server filter - conditional based on tab */}
            <Grid item {...gridSizes}>
              {tabValue === 0 ? (
                <MultiSelect
                  id="server-select"
                  label="Server"
                  options={servers}
                  value={selectedServers}
                  onChange={handleServerChange}
                  icon={<PersonIcon />}
                  placeholder="Select servers (optional)"
                />
              ) : (
                <></>
              )}
            </Grid>
          </Grid>

          {/* Active filters display */}
          {(selectedLocations.length > 0 ||
            (localStartDate && localEndDate) ||
            selectedServers.length > 0 ||
            selectedMenuItems.length > 0 ||
            selectedCategories.length > 0) && (
            <Box sx={{ mt: 2 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
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

                {(localStartDate && localEndDate) && (
                  <Chip
                    label={`Date Range: ${formatDisplayDate(localStartDate)} - ${formatDisplayDate(localEndDate)}`}
                    color="secondary"
                    variant="outlined"
                    size="small"
                    icon={<CalendarTodayIcon />}
                    onDelete={() => {
                      setLocalStartDate("");
                      setLocalEndDate("");
                    }}
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

          {/* UPDATED: Apply Filters Button with validation feedback */}
          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-start", gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleApplyFilters}
              disabled={
                isLoading || 
                loading || 
                !currentProductMixFile ||
                selectedLocations.length === 0
              }
              startIcon={
                isLoading || loading ? (
                  <CircularProgress size={16} />
                ) : (
                  <RefreshIcon />
                )
              }
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              {isLoading || loading ? "Loading..." : "APPLY FILTERS"}
            </Button>

            {/* Clear All Filters Button - Show if any filters are applied */}
            {(selectedLocations.length > 0 || 
              selectedServers.length > 0 || 
              selectedCategories.length > 0 || 
              selectedMenuItems.length > 0 ||
              localStartDate ||
              localEndDate) && (
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleClearAllFilters}
                disabled={isLoading || loading}
                startIcon={<CloseIcon />}
                sx={{ 
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                  }
                }}
              >
                CLEAR ALL FILTERS
              </Button>
            )}
          </Box>

          {/* Helper text for Clear All behavior */}
          {(selectedLocations.length > 0 || localStartDate || localEndDate) && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                💡 Tip: "Clear All Filters" will reset everything to empty. To re-select all locations, use the location filter's "Select All" option.
                Date range is optional - filters will apply to all available data if no date range is selected.
              </Typography>
            </Box>
          )}

          {/* Validation message for required fields */}
          {selectedLocations.length === 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Required:</strong> Please select at least one location to apply filters.
              </Typography>
            </Alert>
          )}

         
        </CardContent>
      </Card>

      {/* Only render dashboard content if data is available */}
      {currentProductMixData && (
        <>
          {/* Tabs */}
          <Card
            sx={{ borderRadius: 2, mb: 3, overflow: "hidden" }}
            elevation={3}
          >
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
              <Tab label="Performance" />
            </Tabs>

            {/* Server Performance Tab */}
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
                {isLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                    <CircularProgress size={40} />
                    <Typography sx={{ ml: 2 }}>Updating dashboard data...</Typography>
                  </Box>
                ) : (
                  <Box>
                    {/* Sales Dashboard Component */}
                    <MenuAnalysisDashboard 
                      key={`performance-${currentProductMixLocation}-${currentProductMixData?.filterTimestamp || 'original'}`}
                      productMixData={currentProductMixData} 
                    />
                    
                    {/* Divider */}
                    <Box sx={{ my: 4 }}>
                      <Divider sx={{ borderColor: '#e0e0e0', borderWidth: 1 }} />
                    </Box>
                    
                    {/* Menu Items Table Component */}
                    <Box sx={{ mt: 4 }}>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          mb: 3,
                          fontWeight: 600,
                          color: 'rgb(9, 43, 117)',
                          textAlign: 'center'
                        }}
                      >
                      
                      </Typography>
                      <MenuItemsTable 
                        key={`menu-items-${currentProductMixLocation}-${currentProductMixData?.filterTimestamp || 'original'}`}
                        table12={currentProductMixData?.table12 || []} 
                      />
                    </Box>
                  </Box>
                )}
              </Box>
            </TabPanel>

            {/* Menu Analysis Tab */}
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
                {isLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                    <CircularProgress size={40} />
                    <Typography sx={{ ml: 2 }}>Updating dashboard data...</Typography>
                  </Box>
                ) : (
                  <MenuAnalysisDashboardtwo
                    key={`menu-analysis-${currentProductMixLocation}-${currentProductMixData?.filterTimestamp || 'original'}`}
                    productMixData={currentProductMixData}
                  />
                )}
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

      {/* Date Range Picker Dialog */}
      <Dialog
        open={isDateRangeOpen}
        onClose={() => setIsDateRangeOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Select Date Range</DialogTitle>
        <DialogContent>
          <DateRangeSelector
            initialState={[
              {
                startDate: selectedRange.startDate,
                endDate: selectedRange.endDate,
                key: 'selection'
              }
            ]}
            onSelect={handleDateRangeSelect}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDateRangeOpen(false)}>Cancel</Button>
          <Button onClick={applyDateRange} variant="contained" color="primary">
            Set Date Range
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
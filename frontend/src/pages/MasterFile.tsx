import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import apiClient from "../api/axiosConfig"; // Adjust path as needed
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  Chip,
  InputAdornment,
  TablePagination,
  Container,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  Grid,
} from "@mui/material";

// Icons
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import SearchIcon from "@mui/icons-material/Search";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import RefreshIcon from "@mui/icons-material/Refresh";
import DescriptionIcon from "@mui/icons-material/Description";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import FilterListIcon from "@mui/icons-material/FilterList";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ClearIcon from "@mui/icons-material/Clear";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import BusinessIcon from "@mui/icons-material/Business";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import FiltersOrderIQ from "../components/FiltersOrderIQ";
import DateRangeSelector from "../components/DateRangeSelector";
import { API_URL_Local } from "../constants";

// Redux imports
import {
  loadMasterFileData,
  loadMultipleMasterFileData,
  setSelectedCompanies,
  setSelectedLocations,
  setSelectedFilenames,
  updateItem,
  clearError,
  selectMasterFileState,
  selectItems,
  selectColumns,
  selectCurrentPriceColumn,
  selectPreviousPriceColumn,
  selectSelectedCompanies,
  selectSelectedLocations,
  selectSelectedFilenames,
  selectLastAppliedFilters,
  selectLoading,
  selectError,
} from "../store/slices/masterFileSlice"; // Adjust path as needed

// Types
interface MasterFileDetail {
  id: number;
  company_id: number;
  company_name: string;
  filename: string;
  location_id: number;
  location_name: string;
}

interface FilterOption {
  value: string;
  label: string;
}

// Company Location interface for the new API structure
interface CompanyLocation {
  company_id: number;
  company_name: string;
  locations: Array<{
    location_id: number;
    location_name: string;
  }>;
}

// DateRangeSelector Button Component
const DateRangeSelectorButton = ({ onDateRangeSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState("Date Range");
  const [tempRange, setTempRange] = useState(null);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => {
    setIsOpen(false);
    setTempRange(null);
  };

  const handleDateRangeSelect = (range) => {
    setTempRange(range);
  };

  const handleApply = () => {
    if (tempRange) {
      const startDate = tempRange.startDate.toLocaleDateString();
      const endDate = tempRange.endDate.toLocaleDateString();
      setSelectedRange(`${startDate} - ${endDate}`);
      onDateRangeSelect(tempRange);
    }
    setIsOpen(false);
  };

  const handleClear = (event) => {
    event.stopPropagation();
    setSelectedRange("Date Range");
    onDateRangeSelect(null);
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: "12px",
            maxHeight: "80vh",
          },
        }}
      >
        <DialogTitle
          style={{
            borderBottom: "1px solid #e0e0e0",
            paddingBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <CalendarTodayIcon color="primary" />
          Select Date Range
        </DialogTitle>

        <DialogContent style={{ padding: "0" }}>
          <DateRangeSelector
            initialState={[
              {
                startDate: new Date(),
                endDate: new Date(),
                key: "selection",
              },
            ]}
            onSelect={handleDateRangeSelect}
          />
        </DialogContent>

        <DialogActions
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #e0e0e0",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="body2" style={{ color: "#666" }}>
            {tempRange &&
              `${tempRange.startDate?.toLocaleDateString()} - ${tempRange.endDate?.toLocaleDateString()}`}
          </Typography>
          <Box style={{ display: "flex", gap: "8px" }}>
            <Button onClick={handleClose} color="secondary" variant="outlined">
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              variant="contained"
              color="primary"
              disabled={!tempRange}
            >
              Apply Range
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
};

// Improved FiltersOrderIQ2 Component
const FiltersOrderIQ2 = ({
  onFiltersChange,
  totalItems,
  filteredItems,
  units = [],
  categories = [],
  priceRange = [0, 100],
}) => {
  const [filters, setFilters] = useState({
    priceRange: priceRange,
    unit: "all",
    category: "all",
  });

  const [expanded, setExpanded] = useState(false);

  // Update price range when prop changes
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      priceRange: [...priceRange], // Use spread to create new array
    }));
  }, [priceRange[0], priceRange[1]]); // Watch for changes in individual values

  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handlePriceRangeChange = (index, value) => {
    const numValue = value === '' ? 0 : parseFloat(value) || 0;
    const newPriceRange = [...filters.priceRange];
    newPriceRange[index] = numValue;
    
    // Ensure min is not greater than max
    if (index === 0 && numValue > newPriceRange[1] && newPriceRange[1] > 0) {
      newPriceRange[1] = numValue;
    }
    if (index === 1 && numValue < newPriceRange[0] && numValue > 0) {
      newPriceRange[0] = numValue;
    }
    
    handleFilterChange("priceRange", newPriceRange);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      priceRange: priceRange,
      unit: "all",
      category: "all",
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.unit !== "all") count++;
    if (filters.category !== "all") count++;
    if (
      filters.priceRange[0] > priceRange[0] ||
      filters.priceRange[1] < priceRange[1]
    )
      count++;
    return count;
  };

  const formatPriceLabel = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return `${value.toFixed(value < 10 ? 2 : 0)}`;
  };

  return (
    <Box style={{ marginBottom: 24 }}>
      <Accordion
        expanded={expanded}
        onChange={() => setExpanded(!expanded)}
        style={{
          border: "1px solid #e0e0e0",
          borderRadius: 8,
          boxShadow: "none",
          "&:before": { display: "none" },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          style={{
            backgroundColor: "#f8f9fa",
            borderRadius: expanded ? "8px 8px 0 0" : "8px",
            minHeight: 64,
          }}
        >
          <Box
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              marginRight: 16,
            }}
          >
            <Box style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <FilterListIcon color="primary" />
              <Typography variant="h6" style={{ fontWeight: 600 }}>
                Advanced Filters & Search
              </Typography>
              {getActiveFiltersCount() > 0 && (
                <Chip
                  label={`${getActiveFiltersCount()} active`}
                  color="primary"
                  size="small"
                />
              )}
            </Box>
            <Typography variant="body2" style={{ color: "#666" }}>
              Showing {filteredItems} of {totalItems} items
            </Typography>
          </Box>
        </AccordionSummary>

        <AccordionDetails style={{ padding: 24 }}>
          <Grid container spacing={3} alignItems="center">
            {/* Price Range Input Fields with Slider */}
            <Grid item xs={12} md={4}>
              <Typography
                gutterBottom
                variant="subtitle2"
                style={{ fontWeight: 600, marginBottom: 16 }}
              >
                Price Range
              </Typography>
              <Box style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <TextField
                  label="Min Price"
                  type="number"
                  size="small"
                  value={filters.priceRange[0] || ''}
                  onChange={(e) => handlePriceRangeChange(0, e.target.value)}
                  inputProps={{
                    min: 0,
                    step: "0.01",
                  }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  style={{ flex: 1 }}
                />
                <Typography variant="body2" style={{ color: "#666" }}>
                  to
                </Typography>
                <TextField
                  label="Max Price"
                  type="number"
                  size="small"
                  value={filters.priceRange[1] || ''}
                  onChange={(e) => handlePriceRangeChange(1, e.target.value)}
                  inputProps={{
                    min: 0,
                    step: "0.01",
                  }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  style={{ flex: 1 }}
                />
              </Box>
              
              {/* Price Range Slider */}
              <Box style={{ paddingLeft: 8, paddingRight: 8 }}>
                <Slider
                  value={filters.priceRange}
                  onChange={(e, newValue) => handleFilterChange("priceRange", newValue)}
                  valueLabelDisplay="auto"
                  valueLabelFormat={formatPriceLabel}
                  min={priceRange[0]}
                  max={priceRange[1]}
                  step={(priceRange[1] - priceRange[0]) <= 10 ? 0.1 : (priceRange[1] - priceRange[0]) <= 100 ? 1 : (priceRange[1] - priceRange[0]) <= 1000 ? 10 : 100}
                  marks={[
                    { value: priceRange[0], label: formatPriceLabel(priceRange[0]) },
                    { value: priceRange[1], label: formatPriceLabel(priceRange[1]) }
                  ]}
                  color="primary"
                />
              </Box>
              
              <Typography
                variant="caption"
                style={{ 
                  color: "#666", 
                  display: "block", 
                  marginTop: 8 
                }}
              >
                Original range: {formatPriceLabel(priceRange[0])} - {formatPriceLabel(priceRange[1])}
              </Typography>
            </Grid>

            {/* Unit Filter */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Unit Type</InputLabel>
                <Select
                  value={filters.unit}
                  label="Unit Type"
                  onChange={(e) => handleFilterChange("unit", e.target.value)}
                >
                  <MenuItem value="all">All Units</MenuItem>
                  {units.map((unit) => (
                    <MenuItem key={unit} value={unit}>
                      {unit}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Category Filter */}
            {categories.length > 0 && (
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={filters.category}
                    label="Category"
                    onChange={(e) =>
                      handleFilterChange("category", e.target.value)
                    }
                  >
                    <MenuItem value="all">All Categories</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>

          {/* Clear Filters Button */}
          {getActiveFiltersCount() > 0 && (
            <Box
              style={{
                marginTop: 20,
                paddingTop: 16,
                borderTop: "1px solid #e0e0e0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="body2" style={{ color: "#666" }}>
                {getActiveFiltersCount()} filter{getActiveFiltersCount() > 1 ? "s" : ""} applied
              </Typography>
              <Button
                startIcon={<ClearIcon />}
                onClick={clearAllFilters}
                variant="outlined"
                size="small"
                style={{
                  borderColor: "#e0e0e0",
                  color: "#666",
                  "&:hover": {
                    borderColor: "#1976d2",
                    color: "#1976d2",
                    backgroundColor: "#f5f5f5",
                  },
                }}
              >
                Clear All Filters
              </Button>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

// Updated FiltersOrderIQ Component without Apply Button - Auto Apply
const FiltersOrderIQWithFilename = ({
  masterFileDetails,
  selectedCompanies,
  selectedLocations,
  selectedFilenames,
  onCompanyChange,
  onLocationChange,
  onFilenameChange,
  loadingMasterFileDetails = false,
}) => {
  // Get unique companies
  const companyOptions = Array.from(
    new Map(
      masterFileDetails
        .filter(item => item && item.company_id && item.company_name) // Filter out invalid items
        .map((item) => [
          item.company_id,
          {
            value: item.company_id.toString(),
            label: item.company_name,
          },
        ])
    ).values()
  );

  // Get unique locations filtered by selected companies
  const getLocationOptions = () => {
    if (!masterFileDetails || masterFileDetails.length === 0) return [];
    
    let filteredData = masterFileDetails;
    if (selectedCompanies && selectedCompanies.length > 0) {
      filteredData = masterFileDetails.filter((item) =>
        item && selectedCompanies.includes(item.company_id?.toString())
      );
    }

    return Array.from(
      new Map(
        filteredData
          .filter(item => item && item.location_id && item.location_name) // Filter out invalid items
          .map((item) => [
            item.location_id,
            {
              value: item.location_id.toString(),
              label: item.location_name,
            },
          ])
      ).values()
    );
  };

  // Get unique filenames filtered by selected companies and locations
  const getFilenameOptions = () => {
    if (!masterFileDetails || masterFileDetails.length === 0) return [];
    
    let filteredData = masterFileDetails;

    if (selectedCompanies && selectedCompanies.length > 0) {
      filteredData = filteredData.filter((item) =>
        item && selectedCompanies.includes(item.company_id?.toString())
      );
    }

    if (selectedLocations && selectedLocations.length > 0) {
      filteredData = filteredData.filter((item) =>
        item && selectedLocations.includes(item.location_id?.toString())
      );
    }

    return Array.from(
      new Set(
        filteredData
          .filter(item => item && item.filename) // Filter out invalid items
          .map((item) => item.filename)
      )
    ).map((filename) => ({
      value: filename,
      label: filename,
    }));
  };

  // Calculate how many API calls will be made
  const getApiCallCount = () => {
    if (!masterFileDetails || masterFileDetails.length === 0) return 0;
    
    let filteredDetails = masterFileDetails;

    if (selectedCompanies && selectedCompanies.length > 0) {
      filteredDetails = filteredDetails.filter((item) =>
        item && selectedCompanies.includes(item.company_id?.toString())
      );
    }

    if (selectedLocations && selectedLocations.length > 0) {
      filteredDetails = filteredDetails.filter((item) =>
        item && selectedLocations.includes(item.location_id?.toString())
      );
    }

    if (selectedFilenames && selectedFilenames.length > 0) {
      filteredDetails = filteredDetails.filter((item) =>
        item && selectedFilenames.includes(item.filename)
      );
    }

    return filteredDetails.length;
  };

  // Check if dropdowns should be enabled based on current Redux state
  const isLocationDropdownEnabled = selectedCompanies && selectedCompanies.length > 0;
  const isFilenameDropdownEnabled =
    selectedCompanies && selectedCompanies.length > 0 && 
    selectedLocations && selectedLocations.length === 1; // Only enable when exactly one location is selected

  // Handle company selection with Select All functionality
  const handleCompanyChange = (value) => {
    if (!value || !Array.isArray(value)) return;
    
    if (value.includes("select_all")) {
      if (selectedCompanies && selectedCompanies.length === companyOptions.length) {
        // If all are selected, deselect all
        onCompanyChange([]);
      } else {
        // Select all companies
        onCompanyChange(companyOptions.map((option) => option.value));
      }
    } else {
      onCompanyChange(value);
    }
  };

  // Handle location selection - UPDATED for single selection only
  const handleLocationChange = (value) => {
    if (!value || !Array.isArray(value)) {
      onLocationChange([]);
      return;
    }
    
    const locationOptions = getLocationOptions();
    if (value.includes("clear_all")) {
      // Clear all locations
      onLocationChange([]);
    } else if (value.includes("select_all")) {
      // For single selection, we don't allow "select all"
      return;
    } else {
      // Only allow single selection - take the last selected value
      const lastSelected = value[value.length - 1];
      if (lastSelected) {
        onLocationChange([lastSelected]);
      } else {
        onLocationChange([]);
      }
    }
  };

  // Handle filename selection with Select All functionality
  const handleFilenameChange = (value) => {
    if (!value || !Array.isArray(value)) {
      onFilenameChange([]);
      return;
    }
    
    const filenameOptions = getFilenameOptions();
    if (value.includes("select_all")) {
      if (selectedFilenames && selectedFilenames.length === filenameOptions.length) {
        // If all are selected, deselect all
        onFilenameChange([]);
      } else {
        // Select all filenames
        onFilenameChange(filenameOptions.map((option) => option.value));
      }
    } else {
      onFilenameChange(value);
    }
  };

  // Render value functions with proper disabled state handling
  const renderCompanyValue = (selected) => {
    if (!selected || !Array.isArray(selected) || selected.length === 0) return "Select Companies";
    if (selected.length === companyOptions.length) return "All Companies Selected";
    if (selected.length === 1) {
      const foundCompany = companyOptions.find((c) => c && c.value === selected[0]);
      return foundCompany ? foundCompany.label : "Select Companies";
    }
    return `${selected.length} selected`;
  };

  const renderLocationValue = (selected) => {
    if (!isLocationDropdownEnabled) return "Select companies first";
    
    // Handle multiple locations selected
    if (selected && selected.length > 1) {
      return "Multiple locations selected - Please select only one";
    }
    
    if (!selected || selected.length === 0) return "Select One Location";
    
    if (selected.length === 1) {
      const locationOptions = getLocationOptions();
      const foundLocation = locationOptions.find((l) => l && l.value === selected[0]);
      return foundLocation ? foundLocation.label : "Select One Location";
    }
    
    return "Select One Location";
  };

  const renderFilenameValue = (selected) => {
    if (!isLocationDropdownEnabled) return "Select companies first";
    if (!isFilenameDropdownEnabled) return "Select one location first";

    const filenameOptions = getFilenameOptions();
    if (!selected || !Array.isArray(selected) || selected.length === 0) return "Select Files";
    if (
      selected.length === filenameOptions.length &&
      filenameOptions.length > 0
    )
      return "All Files Selected";
    if (selected.length === 1) return selected[0];
    return `${selected.length} selected`;
  };

  // UPDATED: Better status message rendering with location restriction
  const renderStatusMessage = () => {
    if (loadingMasterFileDetails) {
      return (
        <Box style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <LinearProgress style={{ width: 100, height: 4 }} />
          <Typography variant="body2" color="primary" style={{ fontWeight: 500 }}>
            Loading data from {getApiCallCount()} file(s)...
          </Typography>
        </Box>
      );
    }

    if (!selectedCompanies || selectedCompanies.length === 0) {
      return (
        <Typography variant="body2" color="primary" style={{ fontWeight: 500 }}>
          Step 1: Select companies to continue
        </Typography>
      );
    }

    // NEW: Check for multiple locations selected
    if (selectedLocations && selectedLocations.length > 1) {
      return (
        <Alert 
          severity="warning" 
          style={{ 
            marginTop: 8,
            backgroundColor: "#fff3cd",
            color: "#856404",
            border: "1px solid #ffeaa7"
          }}
        >
          <Typography variant="body2" style={{ fontWeight: 500 }}>
            Multiple locations selected. Please clear all locations and select only one location to continue.
          </Typography>
        </Alert>
      );
    }

    if (!selectedLocations || selectedLocations.length === 0) {
      return (
        <Typography variant="body2" color="primary" style={{ fontWeight: 500 }}>
          Step 2: Select one location to enable file selection
        </Typography>
      );
    }

    if (!selectedFilenames || selectedFilenames.length === 0) {
      return (
        <Typography variant="body2" color="warning.main" style={{ fontWeight: 500 }}>
          Step 3: Select files to load data ({getFilenameOptions().length} available)
        </Typography>
      );
    }

    if (getFilenameOptions().length === 0) {
      return (
        <Typography variant="body2" color="warning.main" style={{ fontWeight: 500 }}>
          No files available for selected company and location
        </Typography>
      );
    }

    return (
      <Typography variant="body2" color="textSecondary">
        Ready to load: {selectedFilenames.length} file(s) selected
        <span style={{ marginLeft: 8, color: "#4caf50" }}>
          • Data will auto-load
        </span>
      </Typography>
    );
  };

  return (
    <Box style={{ marginBottom: 16 }}>
      <Grid container spacing={2} alignItems="flex-start">
        {/* Company Filter - Always Enabled */}
        <Grid item xs={12} md={4}>
          <FormControl fullWidth size="small">
            <InputLabel>Companies *</InputLabel>
            <Select
              multiple
              value={selectedCompanies}
              label="Companies *"
              onChange={(e) => handleCompanyChange(e.target.value)}
              renderValue={renderCompanyValue}
            >
              {/* Select All Option */}
              <MenuItem
                value="select_all"
                style={{ fontWeight: "bold", borderBottom: "1px solid #eee" }}
              >
                <Box style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <BusinessIcon fontSize="small" />
                  {selectedCompanies.length === companyOptions.length
                    ? "Deselect All"
                    : "Select All Companies"}
                </Box>
              </MenuItem>
              {companyOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Location Filter - Single selection only */}
        <Grid item xs={12} md={4}>
          <FormControl fullWidth size="small">
            <InputLabel>Locations * (Select One)</InputLabel>
            <Select
              multiple
              value={selectedLocations}
              label="Locations * (Select One)"
              onChange={(e) => handleLocationChange(e.target.value)}
              renderValue={renderLocationValue}
              disabled={!isLocationDropdownEnabled}
              style={{
                opacity: isLocationDropdownEnabled ? 1 : 0.6,
              }}
            >
              {/* Clear All Option - Show when locations are selected */}
              {isLocationDropdownEnabled && selectedLocations.length > 0 && (
                <MenuItem
                  value="clear_all"
                  style={{ fontWeight: "bold", borderBottom: "1px solid #eee", color: "#d32f2f" }}
                >
                  <Box
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <ClearIcon fontSize="small" />
                    Clear All Locations
                  </Box>
                </MenuItem>
              )}
              {/* Only show location options when enabled */}
              {isLocationDropdownEnabled &&
                getLocationOptions().map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Filename Filter - Enabled only when both companies and locations are selected */}
        <Grid item xs={12} md={4}>
          <FormControl fullWidth size="small">
            <InputLabel>Files</InputLabel>
            <Select
              multiple
              value={selectedFilenames}
              label="Files"
              onChange={(e) => handleFilenameChange(e.target.value)}
              renderValue={renderFilenameValue}
              disabled={!isFilenameDropdownEnabled}
              style={{
                opacity: isFilenameDropdownEnabled ? 1 : 0.6,
              }}
            >
              {/* Select All Option - Only show when files are available */}
              {isFilenameDropdownEnabled && getFilenameOptions().length > 0 && (
                <MenuItem
                  value="select_all"
                  style={{ fontWeight: "bold", borderBottom: "1px solid #eee" }}
                >
                  <Box
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <DescriptionIcon fontSize="small" />
                    {selectedFilenames.length === getFilenameOptions().length
                      ? "Deselect All"
                      : "Select All Files"}
                  </Box>
                </MenuItem>
              )}
              {/* Only show filename options when enabled */}
              {isFilenameDropdownEnabled &&
                getFilenameOptions().map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Updated status display */}
      <Box style={{ marginTop: 8 }}>
        {renderStatusMessage()}
      </Box>
    </Box>
  );
};

const MasterFile = () => {
  const dispatch = useDispatch();

  // Redux selectors
  const items = useSelector(selectItems);
  const columns = useSelector(selectColumns);
  const currentPriceColumn = useSelector(selectCurrentPriceColumn);
  const previousPriceColumn = useSelector(selectPreviousPriceColumn);
  const selectedCompanies = useSelector(selectSelectedCompanies);
  const selectedLocations = useSelector(selectSelectedLocations);
  const selectedFilenames = useSelector(selectSelectedFilenames);
  const lastAppliedFilters = useSelector(selectLastAppliedFilters);
  const loading = useSelector(selectLoading);
  const reduxError = useSelector(selectError);

  // Local state for UI-only concerns
  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState("");
  const [savingRowId, setSavingRowId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    priceRange: [0, 100],
    unit: "all",
    category: "all",
  });

  // Master file details and upload states
  const [masterFileDetails, setMasterFileDetails] = useState<
    MasterFileDetail[]
  >([]);
  
  // Updated: Single state for company-locations data
  const [companyLocations, setCompanyLocations] = useState<CompanyLocation[]>([]);
  
  const [loadingMasterFileDetails, setLoadingMasterFileDetails] =
    useState(false);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [selectedDateRange, setSelectedDateRange] = useState(null);

  // UPDATED: Helper function to handle multiple files loading with date range
  const handleMultipleFilesLoadWithDateRange = async (companies, locations, filenames, dateRangeParams) => {
    // Create filter combinations
    let filteredDetails = masterFileDetails;

    if (companies.length > 0) {
      filteredDetails = filteredDetails.filter((item) =>
        companies.includes(item.company_id.toString())
      );
    }

    if (locations.length > 0) {
      filteredDetails = filteredDetails.filter((item) =>
        locations.includes(item.location_id.toString())
      );
    }

    if (filenames.length > 0) {
      filteredDetails = filteredDetails.filter((item) =>
        filenames.includes(item.filename)
      );
    }

    if (filteredDetails.length > 0) {
      // Add date range parameters to each file request
      const filteredDetailsWithDateRange = filteredDetails.map(detail => ({
        ...detail,
        ...dateRangeParams
      }));

      console.log("Batched files API call with date range:", filteredDetailsWithDateRange);
      
      // This should make ONE API call with all files, not multiple calls
      dispatch(loadMultipleMasterFileData(filteredDetailsWithDateRange));
    }
  };

  // Auto-load data on component mount if we have saved filters
  useEffect(() => {
    const autoLoadData = async () => {
      const { companies, locations, filenames } = lastAppliedFilters;

      if (companies.length > 0 && locations.length > 0 && filenames.length > 0) {
        console.log(
          "Auto-loading data from saved filters:",
          lastAppliedFilters
        );

        // Set the selections in Redux
        dispatch(setSelectedCompanies(companies));
        dispatch(setSelectedLocations(locations));
        dispatch(setSelectedFilenames(filenames));

        // Load data automatically
        if (
          companies.length === 1 &&
          locations.length === 1 &&
          filenames.length === 1
        ) {
          // Single file load
          dispatch(
            loadMasterFileData({
              company_id: parseInt(companies[0]),
              location_id: parseInt(locations[0]),
              filename: filenames[0],
            })
          );
        } else {
          // Multiple files load
          await handleMultipleFilesLoadWithDateRange(companies, locations, filenames, {});
        }
      }
    };

    // Only auto-load if we don't already have items loaded
    if (items.length === 0 && lastAppliedFilters.companies.length > 0 && lastAppliedFilters.filenames.length > 0) {
      autoLoadData();
    }
  }, []); // Run only once on mount

  // FIXED: Auto-apply filters when selections change - ONLY when files are selected and single location
  useEffect(() => {
    const autoApplyFilters = async () => {
      // KEY CHANGE: Only auto-apply if we have companies, exactly ONE location, AND at least one filename
      if (selectedCompanies.length > 0 && selectedLocations.length === 1 && selectedFilenames.length > 0) {
        console.log("Auto-applying filters due to selection change:", {
          companies: selectedCompanies,
          locations: selectedLocations,
          filenames: selectedFilenames,
          dateRange: selectedDateRange,
        });

        // Clear any previous errors
        dispatch(clearError());

        try {
          // Prepare date range data for backend
          const dateRangeParams = selectedDateRange ? {
            start_date: selectedDateRange.startDate.toISOString().split('T')[0],
            end_date: selectedDateRange.endDate.toISOString().split('T')[0]
          } : {};

          // Single file scenario
          if (
            selectedCompanies.length === 1 &&
            selectedLocations.length === 1 &&
            selectedFilenames.length === 1
          ) {
            const apiParams = {
              company_id: parseInt(selectedCompanies[0]),
              location_id: parseInt(selectedLocations[0]),
              filename: selectedFilenames[0],
              ...dateRangeParams
            };

            console.log("Single file API params with date range:", apiParams);
            dispatch(loadMasterFileData(apiParams));
          } else {
            // Multiple files scenario - BATCH THEM (but still single location)
            await handleMultipleFilesLoadWithDateRange(
              selectedCompanies,
              selectedLocations,
              selectedFilenames,
              dateRangeParams
            );
          }

          setUploadStatus({
            type: "success",
            message: `Successfully loaded data for ${selectedFilenames.length} file(s)${
              selectedDateRange 
                ? ` for period ${selectedDateRange.startDate.toLocaleDateString()} - ${selectedDateRange.endDate.toLocaleDateString()}` 
                : ''
            }`,
          });

          // Auto-clear success message after 3 seconds
          setTimeout(() => setUploadStatus(null), 3000);
        } catch (error) {
          console.error("Error auto-applying filters:", error);
          setUploadStatus({
            type: "error",
            message: "Failed to load filtered data",
          });
          setTimeout(() => setUploadStatus(null), 5000);
        }

        setPage(0);
      }
    };

    // IMPROVED: Increase debounce time and add proper cleanup
    const timeoutId = setTimeout(autoApplyFilters, 1000); // Increased from 500ms
    return () => clearTimeout(timeoutId);
  }, [selectedCompanies, selectedLocations, selectedFilenames, selectedDateRange]);

  // Get unique values for filters
  const getUniqueValues = (columnKey) => {
    if (!columnKey || items.length === 0) return [];
    return [...new Set(items.map((item) => item[columnKey]).filter(Boolean))];
  };

  // Get unique units for filter options (look for UOM column)
  const getUniqueUnits = () => {
    const uomColumn = Object.keys(columns).find(
      (key) =>
        columns[key].toLowerCase().includes("uom") ||
        columns[key].toLowerCase().includes("unit")
    );
    return getUniqueValues(uomColumn);
  };

  // Get unique categories for filter options
  const getUniqueCategories = () => {
    const categoryColumn = Object.keys(columns).find((key) =>
      columns[key].toLowerCase().includes("category")
    );
    return getUniqueValues(categoryColumn);
  };

  // Get price range for filters
  const getPriceRange = () => {
    if (!items.length || !currentPriceColumn) return [0, 100];

    const prices = items.map(
      (item) => parseFloat(item[currentPriceColumn]) || 0
    );
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);

    // Round up max price to nearest 10 or 100
    const roundedMax =
      maxPrice < 100
        ? Math.ceil(maxPrice / 10) * 10
        : Math.ceil(maxPrice / 100) * 100;

    return [Math.floor(minPrice), roundedMax];
  };

  // Update price range when data changes
  useEffect(() => {
    if (items.length > 0 && currentPriceColumn) {
      const [minPrice, maxPrice] = getPriceRange();
      setFilters((prev) => ({
        ...prev,
        priceRange: [minPrice, maxPrice],
      }));
    }
  }, [items, currentPriceColumn]);

  // Fetch master file details data (for filters)
  const fetchMasterFileDetails = async () => {
    setLoadingMasterFileDetails(true);
    try {
      const response = await apiClient.get("/api/masterfile/details");
      setMasterFileDetails(response.data.data || []);
    } catch (error) {
      console.error("Error fetching master file details:", error);
      setUploadStatus({
        type: "error",
        message: "Failed to fetch master file details",
      });
    } finally {
      setLoadingMasterFileDetails(false);
    }
  };

  // Updated: Fetch company-locations data (for upload dialog)
  const fetchCompanyLocations = async () => {
    try {
      const response = await apiClient.get("/company-locations/all");
      setCompanyLocations(response.data);
      console.log("Company locations data:", response.data);
    } catch (error) {
      console.error("Error fetching company locations:", error);
      setUploadStatus({
        type: "error",
        message: "Failed to fetch company and location data",
      });
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchMasterFileDetails(); // For filters
    fetchCompanyLocations(); // For upload dialog (updated)
  }, []);

  // Updated: Get companies for upload dialog
  const getCompaniesForUpload = () => {
    return companyLocations.map(item => ({
      id: item.company_id,
      name: item.company_name
    }));
  };

  // Updated: Get locations for upload dialog based on selected company
  const getLocationsForUpload = () => {
    if (!selectedCompanyId) return [];
    
    const selectedCompany = companyLocations.find(
      company => company.company_id.toString() === selectedCompanyId
    );
    
    return selectedCompany ? selectedCompany.locations.map(location => ({
      id: location.location_id,
      name: location.location_name
    })) : [];
  };

  // Handler for FiltersOrderIQ filter changes (these will trigger auto-apply)
  const handleCompanyChange = (values: string[]) => {
    dispatch(setSelectedCompanies(values));
    // Clear location and filename selections when company changes
    dispatch(setSelectedLocations([]));
    dispatch(setSelectedFilenames([]));
  };

  const handleLocationChange = (values: string[]) => {
    dispatch(setSelectedLocations(values));
    // Clear filename selections when location changes
    dispatch(setSelectedFilenames([]));
  };

  const handleFilenameChange = (values: string[]) => {
    dispatch(setSelectedFilenames(values));
  };

  // Date range handler (this will trigger auto-apply via useEffect)
  const handleDateRangeSelect = (range) => {
    setSelectedDateRange(range);
    console.log("Selected date range:", range);
  };

  // Apply filters to items - Updated for dynamic data (removed stock and price change filters)
  const applyFilters = (itemsList) => {
    if (!itemsList.length || !currentPriceColumn) return itemsList;

    return itemsList.filter((item) => {
      // Search term filter - search across all text columns
      const searchableText = Object.keys(columns)
        .filter((key) => typeof item[key] === "string")
        .map((key) => item[key])
        .join(" ")
        .toLowerCase();
      const matchesSearch = searchableText.includes(searchTerm.toLowerCase());

      // Price range filter
      const currentPrice = parseFloat(item[currentPriceColumn]) || 0;
      const withinPriceRange =
        currentPrice >= filters.priceRange[0] &&
        currentPrice <= filters.priceRange[1];

      // Unit filter - find UOM column
      const uomColumn = Object.keys(columns).find(
        (key) =>
          columns[key].toLowerCase().includes("uom") ||
          columns[key].toLowerCase().includes("unit")
      );
      const matchesUnit =
        filters.unit === "all" ||
        !uomColumn ||
        item[uomColumn] === filters.unit;

      // Category filter - find category column
      const categoryColumn = Object.keys(columns).find((key) =>
        columns[key].toLowerCase().includes("category")
      );
      const matchesCategory =
        filters.category === "all" ||
        !categoryColumn ||
        item[categoryColumn] === filters.category;

      return (
        matchesSearch &&
        withinPriceRange &&
        matchesUnit &&
        matchesCategory
      );
    });
  };

  // Filter items based on search term and filters
  const filteredItems = applyFilters(items);

  // Paginated items
  const paginatedItems = filteredItems.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setPage(0); // Reset to first page when filters change
  };

  const handleEditClick = (id, currentPrice) => {
    setEditingId(id);
    setEditPrice(currentPrice.toString());
  };

  const handleSaveClick = async (id) => {
    const newPrice = parseFloat(editPrice);
    if (
      !isNaN(newPrice) &&
      newPrice > 0 &&
      currentPriceColumn &&
      previousPriceColumn
    ) {
      const itemToUpdate = items.find((item) => item.id === id);
      if (!itemToUpdate) return;

      setSavingRowId(id); // Set saving state

      // Update Redux state first (optimistic update)
      const updatedItem = {
        [previousPriceColumn]: itemToUpdate[currentPriceColumn], // Move current to previous
        [currentPriceColumn]: newPrice, // Set new current price
      };

      dispatch(updateItem({ id, updates: updatedItem }));

      // Convert column keys to actual column names for API
      const convertToColumnNames = (rowData) => {
        const convertedData = {};

        Object.keys(rowData).forEach((columnKey) => {
          // Skip metadata and id fields
          if (columnKey === "_meta" || columnKey === "id") return;

          // Get the actual column name from the columns mapping
          const columnName = columns[columnKey];
          if (columnName) {
            convertedData[columnName] = rowData[columnKey];
          }
        });

        return convertedData;
      };

      // Prepare data for API call
      try {
        const completeUpdatedItem = { ...itemToUpdate, ...updatedItem };

        const updateData = {
          company_id: itemToUpdate._meta.company_id,
          location_id: itemToUpdate._meta.location_id,
          filename: itemToUpdate._meta.filename,
          row_data: convertToColumnNames(completeUpdatedItem),
        };

        console.log("Sending update data:", updateData);

        // Send update to API
        const response = await apiClient.post(
          "/api/masterfile/updatefile",
          updateData
        );

        console.log("Row update response:", response.data);

        // Show success message
        setUploadStatus({
          type: "success",
          message: `Successfully updated item in ${itemToUpdate._meta.filename}`,
        });

        // Auto-clear success message after 3 seconds
        setTimeout(() => setUploadStatus(null), 3000);
      } catch (error) {
        console.error("Error updating row:", error);

        // Revert Redux state change on API failure
        const revertedItem = {
          [previousPriceColumn]: itemToUpdate[previousPriceColumn], // Restore original previous price
          [currentPriceColumn]: itemToUpdate[currentPriceColumn], // Restore original current price
        };
        dispatch(updateItem({ id, updates: revertedItem }));

        setUploadStatus({
          type: "error",
          message: error.response?.data?.detail || "Failed to update item",
        });

        // Auto-clear error message after 5 seconds
        setTimeout(() => setUploadStatus(null), 5000);
      } finally {
        setSavingRowId(null); // Clear saving state
      }
    }

    setEditingId(null);
    setEditPrice("");
  };

  const handleCancelClick = () => {
    setEditingId(null);
    setEditPrice("");
    setSavingRowId(null); // Clear any saving state
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStockStatus = (item) => {
    // Find stock column dynamically
    const stockColumn = Object.keys(columns).find(
      (key) =>
        columns[key].toLowerCase().includes("stock") ||
        columns[key].toLowerCase().includes("inventory") ||
        columns[key].toLowerCase().includes("quantity")
    );

    if (!stockColumn) return { label: "No Stock Info", color: "default" };

    const stock = parseInt(item[stockColumn]) || 0;
    if (stock === 0) return { label: "Out of Stock", color: "error" };
    if (stock <= 20) return { label: "Low Stock", color: "warning" };
    return { label: "In Stock", color: "success" };
  };

  // Get price change indicator
  const getPriceChangeIndicator = (item) => {
    if (!currentPriceColumn || !previousPriceColumn) return null;

    const currentPrice = parseFloat(item[currentPriceColumn]) || 0;
    const previousPrice = parseFloat(item[previousPriceColumn]) || 0;

    if (currentPrice > previousPrice)
      return { direction: "↑", color: "success" };
    if (currentPrice < previousPrice) return { direction: "↓", color: "error" };
    return null;
  };

  // Render cell content based on column type
  const renderCellContent = (item, columnKey) => {
    const value = item[columnKey];
    const columnName = columns[columnKey];

    // Handle price columns with editing
    if (columnKey === currentPriceColumn) {
      if (editingId === item.id) {
        return (
          <TextField
            value={editPrice}
            onChange={(e) => setEditPrice(e.target.value)}
            type="number"
            size="small"
            inputProps={{
              step: "0.01",
              min: "0",
              style: { textAlign: "center" },
            }}
            autoFocus
            style={{ maxWidth: 100 }}
          />
        );
      } else {
        const priceChange = getPriceChangeIndicator(item);
        return (
          <Box style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Typography
              variant="body2"
              style={{
                fontWeight: 600,
                color: priceChange
                  ? priceChange.color === "success"
                    ? "#2e7d32"
                    : "#d32f2f"
                  : "#666",
              }}
            >
              ${parseFloat(value || 0).toFixed(2)}
            </Typography>
            {priceChange && (
              <Chip
                size="small"
                label={priceChange.direction}
                color={priceChange.color}
                style={{
                  minWidth: 24,
                  height: 20,
                  fontSize: "0.7rem",
                }}
              />
            )}
          </Box>
        );
      }
    }

    // Handle previous price column
    if (columnKey === previousPriceColumn) {
      const numericValue = parseFloat(value);
      const isValidPrice = !isNaN(numericValue) && numericValue > 0;

      return (
        <Typography
          variant="body2"
          style={{
            color: "#666",
            fontStyle: isValidPrice ? "normal" : "italic",
          }}
        >
          {isValidPrice ? `${numericValue.toFixed(2)}` : "-"}
        </Typography>
      );
    }

    // Handle numeric columns (assume price-like formatting for currency)
    if (
      typeof value === "number" &&
      columnName.toLowerCase().includes("price")
    ) {
      return (
        <Typography variant="body2" style={{ fontWeight: 500 }}>
          ${value.toFixed(2)}
        </Typography>
      );
    }

    // Handle regular text/numeric columns
    return (
      <Typography
        variant="body2"
        style={{
          fontWeight:
            columnName.toLowerCase().includes("name") ||
            columnName.toLowerCase().includes("product")
              ? 500
              : 400,
          fontFamily: columnName.toLowerCase().includes("code")
            ? "monospace"
            : "inherit",
        }}
      >
        {value || "-"}
      </Typography>
    );
  };

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data:application/...;base64, prefix
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Excel upload functions
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "text/csv",
      ];

      if (
        validTypes.includes(file.type) ||
        file.name.match(/\.(xlsx|xls|csv)$/i)
      ) {
        setSelectedFile(file);
        setUploadStatus(null);
      } else {
        setUploadStatus({
          type: "error",
          message:
            "Please select a valid Excel file (.xlsx, .xls) or CSV file.",
        });
        setSelectedFile(null);
      }
    }
  };

  // Updated: Handle company selection change and reset location
  const handleUploadCompanyChange = (companyId) => {
    setSelectedCompanyId(companyId);
    setSelectedLocationId(""); // Reset location when company changes
  };

  // Updated upload function with location_id
  const handleUploadFile = async () => {
    if (!selectedFile || !selectedCompanyId || !selectedLocationId) {
      setUploadStatus({
        type: "error",
        message: "Please select a file, company, and location",
      });
      return;
    }

    setUploading(true);
    setUploadStatus(null);

    try {
      // Convert file to base64
      const fileContent = await fileToBase64(selectedFile);

      // Prepare upload data with both company_id and location_id
      const uploadData = {
        company_id: parseInt(selectedCompanyId),
        location_id: parseInt(selectedLocationId),
        fileName: selectedFile.name,
        fileContent: fileContent,
      };

      // Send to API using apiClient (will include auth token automatically)
      const response = await apiClient.post("/api/master/upload", uploadData);

      // Updated: Get company and location names from the new data structure
      const selectedCompany = companyLocations.find(
        (c) => c.company_id.toString() === selectedCompanyId
      );
      const selectedLocation = selectedCompany?.locations.find(
        (l) => l.location_id.toString() === selectedLocationId
      );

      setUploadStatus({
        type: "success",
        message: `Successfully uploaded ${selectedFile.name} for ${selectedCompany?.company_name} - ${selectedLocation?.location_name}`,
      });

      // Refresh master file details after successful upload
      fetchMasterFileDetails();

      // Reset after successful upload
      setTimeout(() => {
        setUploadDialog(false);
        setSelectedFile(null);
        setSelectedCompanyId("");
        setSelectedLocationId("");
        setUploadStatus(null);
      }, 2000);

      console.log("Upload response:", response.data);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus({
        type: "error",
        message:
          error.response?.data?.detail ||
          "Failed to upload file. Please try again.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCloseUploadDialog = () => {
    setUploadDialog(false);
    setSelectedFile(null);
    setSelectedCompanyId("");
    setSelectedLocationId("");
    setUploadStatus(null);
    setUploading(false);
  };

  return (
    <Container maxWidth="xl" style={{ paddingTop: 24, paddingBottom: 24 }}>
      <Paper
        style={{
          borderRadius: 8,
          overflow: "hidden",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Header Section */}
        <Box
          style={{
            background: "#f8f9fa",
            padding: 24,
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          {/* Search and Actions */}
          <Box
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <Box style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <Typography variant="h6" style={{ fontWeight: 600 }}>
                {filteredItems.length}{" "}
                {filteredItems.length === 1 ? "Item" : "Items"}
                {items.length > 0 && (
                  <span
                    style={{ color: "#666", fontSize: "0.9rem", marginLeft: 8 }}
                  >
                    from {Object.keys(columns).length} columns
                  </span>
                )}
              </Typography>
              {selectedDateRange && (
                <Chip
                  label={`${selectedDateRange.startDate?.toLocaleDateString()} - ${selectedDateRange.endDate?.toLocaleDateString()}`}
                  color="primary"
                  size="small"
                  onDelete={() => setSelectedDateRange(null)}
                  style={{ fontSize: "0.75rem" }}
                />
              )}
            </Box>

            <Box style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <DateRangeSelectorButton
                onDateRangeSelect={handleDateRangeSelect}
              />

              <TextField
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                style={{ minWidth: 280 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                variant="contained"
                startIcon={<UploadFileIcon />}
                onClick={() => setUploadDialog(true)}
                style={{
                  backgroundColor: "#4caf50",
                  "&:hover": { backgroundColor: "#45a049" },
                }}
              >
                Upload Excel
              </Button>

              <Tooltip title="Refresh data">
                <IconButton
                  color="primary"
                  style={{ backgroundColor: "#e3f2fd" }}
                  onClick={() => {
                    fetchMasterFileDetails(); // For filters
                    fetchCompanyLocations(); // For upload dialog (updated)
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Updated FiltersOrderIQ Component without Apply Button */}
          <Box style={{ marginTop: 24 }}>
            {loadingMasterFileDetails ? (
              <Box style={{ textAlign: "center", padding: 20 }}>
                <LinearProgress />
                <Typography variant="body2" style={{ marginTop: 8 }}>
                  Loading filter options...
                </Typography>
              </Box>
            ) : (
              <FiltersOrderIQWithFilename
                masterFileDetails={masterFileDetails}
                selectedCompanies={selectedCompanies}
                selectedLocations={selectedLocations}
                selectedFilenames={selectedFilenames}
                onCompanyChange={handleCompanyChange}
                onLocationChange={handleLocationChange}
                onFilenameChange={handleFilenameChange}
                loadingMasterFileDetails={loading} // Use Redux loading state
              />
            )}

            {/* Show upload/filter status - Handle both Redux and local errors */}
            {(uploadStatus || reduxError) && (
              <Box style={{ marginTop: 16 }}>
                {uploadStatus && (
                  <Alert
                    severity={uploadStatus.type}
                    style={{
                      borderRadius: 8,
                      marginBottom: reduxError ? 8 : 0,
                    }}
                  >
                    {uploadStatus.message}
                  </Alert>
                )}
                {reduxError && (
                  <Alert severity="error" style={{ borderRadius: 8 }}>
                    {reduxError}
                  </Alert>
                )}
              </Box>
            )}

            {/* Show auto-loaded data info */}
            {items.length > 0 && lastAppliedFilters.companies.length > 0 && (
              <Box style={{ marginTop: 8 }}>
                <Chip
                  label={`Data auto-loaded from saved filters`}
                  color="info"
                  size="small"
                  icon={<RefreshIcon style={{ fontSize: 16 }} />}
                />
              </Box>
            )}
          </Box>
        </Box>

        {/* Advanced FiltersOrderIQ2 Component */}
        <Box style={{ padding: 24, backgroundColor: "white" }}>
          <FiltersOrderIQ2
            onFiltersChange={handleFiltersChange}
            totalItems={items.length}
            filteredItems={filteredItems.length}
            units={getUniqueUnits()}
            categories={getUniqueCategories()}
            priceRange={getPriceRange()}
          />
        </Box>

        {/* Table Container */}
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow style={{ backgroundColor: "#fafafa" }}>
                <TableCell style={{ fontWeight: 700, width: 40 }}>
                  <DragIndicatorIcon />
                </TableCell>
                {/* Dynamic column headers */}
                {Object.keys(columns).map((columnKey) => (
                  <TableCell key={columnKey} style={{ fontWeight: 700 }}>
                    {columns[columnKey]}
                  </TableCell>
                ))}
                {/* Stock Status Column (if stock column exists) */}
                {Object.keys(columns).some(
                  (key) =>
                    columns[key].toLowerCase().includes("stock") ||
                    columns[key].toLowerCase().includes("inventory") ||
                    columns[key].toLowerCase().includes("quantity")
                ) && (
                  <TableCell style={{ fontWeight: 700 }}>
                    Stock Status
                  </TableCell>
                )}
                <TableCell style={{ fontWeight: 700, width: 100 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedItems.map((item, index) => (
                <TableRow
                  key={item.id}
                  style={{
                    backgroundColor: index % 2 === 1 ? "#fafafa" : "white",
                  }}
                >
                  <TableCell>
                    <IconButton size="small">
                      <DragIndicatorIcon fontSize="small" />
                    </IconButton>
                  </TableCell>

                  {/* Dynamic column cells */}
                  {Object.keys(columns).map((columnKey) => (
                    <TableCell key={columnKey}>
                      {renderCellContent(item, columnKey)}
                    </TableCell>
                  ))}

                  {/* Stock Status Cell (if stock column exists) */}
                  {Object.keys(columns).some(
                    (key) =>
                      columns[key].toLowerCase().includes("stock") ||
                      columns[key].toLowerCase().includes("inventory") ||
                      columns[key].toLowerCase().includes("quantity")
                  ) && (
                    <TableCell>
                      {(() => {
                        const stockColumn = Object.keys(columns).find(
                          (key) =>
                            columns[key].toLowerCase().includes("stock") ||
                            columns[key].toLowerCase().includes("inventory") ||
                            columns[key].toLowerCase().includes("quantity")
                        );
                        const stock = parseInt(item[stockColumn]) || 0;
                        const status = getStockStatus(item);

                        return (
                          <Box
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <Typography
                              variant="body2"
                              style={{ fontWeight: 600, minWidth: 30 }}
                            >
                              {stock}
                            </Typography>
                            <Chip
                              label={status.label}
                              color={status.color}
                              size="small"
                              style={{ fontSize: "0.75rem" }}
                            />
                          </Box>
                        );
                      })()}
                    </TableCell>
                  )}

                  <TableCell>
                    {editingId === item.id ? (
                      <Box style={{ display: "flex", gap: 4 }}>
                        <Tooltip title="Save changes">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleSaveClick(item.id)}
                            disabled={savingRowId === item.id}
                          >
                            {savingRowId === item.id ? (
                              <LinearProgress
                                style={{ width: 16, height: 16 }}
                              />
                            ) : (
                              <SaveIcon fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cancel">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={handleCancelClick}
                            disabled={savingRowId === item.id}
                          >
                            <CancelIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    ) : (
                      <Tooltip title="Edit price">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() =>
                            handleEditClick(item.id, item[currentPriceColumn])
                          }
                          disabled={!currentPriceColumn || savingRowId !== null}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}

              {/* Show message when no data */}
              {paginatedItems.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={Object.keys(columns).length + 3}
                    style={{ textAlign: "center", padding: 40 }}
                  >
                    <Typography variant="body1" color="textSecondary">
                      {items.length === 0
                        ? "No data loaded. Please select companies, locations, and files to auto-load data."
                        : "No items match the current filters."}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Box style={{ borderTop: "1px solid #e0e0e0" }}>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50, 100, 200]}
            component="div"
            count={filteredItems.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
      </Paper>

      {/* Updated Excel Upload Dialog */}
      <Dialog
        open={uploadDialog}
        onClose={handleCloseUploadDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <CloudUploadIcon color="primary" />
            Upload Excel File
          </Box>
        </DialogTitle>

        <DialogContent>
          <Box style={{ padding: "16px 0" }}>
            <Typography
              variant="body2"
              style={{ marginBottom: 16, color: "#666" }}
            >
              Upload an Excel file (.xlsx, .xls) or CSV file with items data.
              Expected columns: Code, Name, Current Price, Unit, Stock
            </Typography>

            {/* Updated Company Selection */}
            <FormControl fullWidth style={{ marginBottom: 16 }}>
              <InputLabel>Select Company *</InputLabel>
              <Select
                value={selectedCompanyId}
                label="Select Company *"
                onChange={(e) => handleUploadCompanyChange(e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <BusinessIcon />
                  </InputAdornment>
                }
                disabled={companyLocations.length === 0}
              >
                {getCompaniesForUpload().map((company) => (
                  <MenuItem key={company.id} value={company.id.toString()}>
                    {company.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Updated Location Selection */}
            <FormControl fullWidth style={{ marginBottom: 16 }}>
              <InputLabel>Select Location *</InputLabel>
              <Select
                value={selectedLocationId}
                label="Select Location *"
                onChange={(e) => setSelectedLocationId(e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <LocationOnIcon />
                  </InputAdornment>
                }
                disabled={!selectedCompanyId || getLocationsForUpload().length === 0}
              >
                {getLocationsForUpload().map((location) => (
                  <MenuItem key={location.id} value={location.id.toString()}>
                    {location.name}
                  </MenuItem>
                ))}
              </Select>
              {selectedCompanyId && getLocationsForUpload().length === 0 && (
                <Typography
                  variant="caption"
                  style={{ color: "#ff9800", marginTop: 4 }}
                >
                  No locations available for selected company
                </Typography>
              )}
            </FormControl>

            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              style={{ display: "none" }}
              id="excel-upload"
            />

            <label htmlFor="excel-upload">
              <Button
                variant="outlined"
                component="span"
                fullWidth
                startIcon={<UploadFileIcon />}
                style={{
                  height: 100,
                  border: "2px dashed #ccc",
                  borderRadius: 8,
                  fontSize: "1.1rem",
                }}
              >
                {selectedFile
                  ? selectedFile.name
                  : "Click to select Excel file"}
              </Button>
            </label>

            {uploading && (
              <Box style={{ marginTop: 16 }}>
                <Typography variant="body2" style={{ marginBottom: 8 }}>
                  Uploading file to server...
                </Typography>
                <LinearProgress />
              </Box>
            )}

            {uploadStatus && (
              <Alert severity={uploadStatus.type} style={{ marginTop: 16 }}>
                {uploadStatus.message}
              </Alert>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseUploadDialog}>Cancel</Button>
          <Button
            onClick={handleUploadFile}
            variant="contained"
            disabled={
              !selectedFile ||
              !selectedCompanyId ||
              !selectedLocationId ||
              uploading
            }
            startIcon={uploading ? null : <UploadFileIcon />}
          >
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

// IMPORTANT: Make sure this export statement is present and correct
export default MasterFile;
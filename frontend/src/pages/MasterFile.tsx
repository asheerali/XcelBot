import React, { useState, useEffect } from "react";
// import axios from 'axios';
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
  FormControlLabel,
  Switch,
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
      <Button
        variant="outlined"
        startIcon={<CalendarTodayIcon />}
        endIcon={
          selectedRange !== "Date Range" && (
            <IconButton
              size="small"
              onClick={handleClear}
              style={{ padding: "2px", marginLeft: "4px" }}
            >
              <ClearIcon style={{ fontSize: "16px" }} />
            </IconButton>
          )
        }
        onClick={handleOpen}
        style={{
          borderRadius: "8px",
          textTransform: "none",
          minWidth: "180px",
          justifyContent: "flex-start",
        }}
      >
        {selectedRange}
      </Button>

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

// FiltersOrderIQ2 Component
const FiltersOrderIQ2 = ({
  onFiltersChange,
  totalItems,
  filteredItems,
  units = [],
  categories = [],
  priceRange = [0, 100]
}) => {
  const [filters, setFilters] = useState({
    priceRange: priceRange,
    stockStatus: "all",
    unit: "all",
    category: "all",
    priceChange: "all",
    showLowStock: false,
    showOutOfStock: false,
  });

  const [expanded, setExpanded] = useState(false);

  // Update price range when prop changes
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      priceRange: priceRange
    }));
  }, [priceRange]);

  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      priceRange: priceRange,
      stockStatus: "all",
      unit: "all",
      category: "all",
      priceChange: "all",
      showLowStock: false,
      showOutOfStock: false,
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.stockStatus !== "all") count++;
    if (filters.unit !== "all") count++;
    if (filters.category !== "all") count++;
    if (filters.priceChange !== "all") count++;
    if (filters.showLowStock) count++;
    if (filters.showOutOfStock) count++;
    if (filters.priceRange[0] > priceRange[0] || filters.priceRange[1] < priceRange[1]) count++;
    return count;
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
          <Grid container spacing={3}>
            {/* Price Range Filter */}
            <Grid item xs={12} md={3}>
              <Typography
                gutterBottom
                variant="subtitle2"
                style={{ fontWeight: 600 }}
              >
                Price Range
              </Typography>
              <Box style={{ paddingLeft: 8, paddingRight: 8 }}>
                <Slider
                  value={filters.priceRange}
                  onChange={(e, newValue) =>
                    handleFilterChange("priceRange", newValue)
                  }
                  valueLabelDisplay="auto"
                  min={priceRange[0]}
                  max={priceRange[1]}
                  step={priceRange[1] > 100 ? 10 : 1}
                  marks={[
                    { value: priceRange[0], label: `$${priceRange[0]}` },
                    { value: Math.round((priceRange[0] + priceRange[1]) / 2), label: `$${Math.round((priceRange[0] + priceRange[1]) / 2)}` },
                    { value: priceRange[1], label: `$${priceRange[1]}+` },
                  ]}
                />
                <Typography
                  variant="body2"
                  style={{ color: "#666", textAlign: "center", marginTop: 8 }}
                >
                  ${filters.priceRange[0]} - ${filters.priceRange[1]}
                </Typography>
              </Box>
            </Grid>

            {/* Stock Status Filter */}
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Stock Status</InputLabel>
                <Select
                  value={filters.stockStatus}
                  label="Stock Status"
                  onChange={(e) =>
                    handleFilterChange("stockStatus", e.target.value)
                  }
                >
                  <MenuItem value="all">All Items</MenuItem>
                  <MenuItem value="inStock">In Stock</MenuItem>
                  <MenuItem value="lowStock">Low Stock</MenuItem>
                  <MenuItem value="outOfStock">Out of Stock</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Unit Filter */}
            <Grid item xs={12} md={2}>
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
              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={filters.category}
                    label="Category"
                    onChange={(e) => handleFilterChange("category", e.target.value)}
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

            {/* Price Change Filter */}
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Price Change</InputLabel>
                <Select
                  value={filters.priceChange}
                  label="Price Change"
                  onChange={(e) =>
                    handleFilterChange("priceChange", e.target.value)
                  }
                >
                  <MenuItem value="all">All Changes</MenuItem>
                  <MenuItem value="increased">Price Increased</MenuItem>
                  <MenuItem value="decreased">Price Decreased</MenuItem>
                  <MenuItem value="unchanged">No Change</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Toggle Switches */}
            <Grid item xs={12} md={3}>
              <Typography
                variant="subtitle2"
                style={{ fontWeight: 600, marginBottom: 8 }}
              >
                Quick Filters
              </Typography>
              <Box style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={filters.showLowStock}
                      onChange={(e) =>
                        handleFilterChange("showLowStock", e.target.checked)
                      }
                      size="small"
                    />
                  }
                  label="Show only low stock"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={filters.showOutOfStock}
                      onChange={(e) =>
                        handleFilterChange("showOutOfStock", e.target.checked)
                      }
                      size="small"
                    />
                  }
                  label="Include out of stock"
                />
              </Box>
            </Grid>
          </Grid>

          {/* Clear Filters Button */}
          {getActiveFiltersCount() > 0 && (
            <Box
              style={{
                marginTop: 16,
                paddingTop: 16,
                borderTop: "1px solid #e0e0e0",
              }}
            >
              <Button
                startIcon={<ClearIcon />}
                onClick={clearAllFilters}
                variant="outlined"
                size="small"
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

// Updated FiltersOrderIQ Component with Filename and Select All
const FiltersOrderIQWithFilename = ({
  masterFileDetails,
  selectedCompanies,
  selectedLocations,
  selectedFilenames,
  onCompanyChange,
  onLocationChange,
  onFilenameChange,
  onApplyFilters,
  showApplyButton = true,
  loadingMasterFileDetails = false,
}) => {
  // Get unique companies
  const companyOptions = Array.from(
    new Map(
      masterFileDetails.map(item => [item.company_id, {
        value: item.company_id.toString(),
        label: item.company_name
      }])
    ).values()
  );

  // Get unique locations filtered by selected companies
  const getLocationOptions = () => {
    let filteredData = masterFileDetails;
    if (selectedCompanies.length > 0) {
      filteredData = masterFileDetails.filter(item => 
        selectedCompanies.includes(item.company_id.toString())
      );
    }
    
    return Array.from(
      new Map(
        filteredData.map(item => [item.location_id, {
          value: item.location_id.toString(),
          label: item.location_name
        }])
      ).values()
    );
  };

  // Get unique filenames filtered by selected companies and locations
  const getFilenameOptions = () => {
    let filteredData = masterFileDetails;
    
    if (selectedCompanies.length > 0) {
      filteredData = filteredData.filter(item => 
        selectedCompanies.includes(item.company_id.toString())
      );
    }
    
    if (selectedLocations.length > 0) {
      filteredData = filteredData.filter(item => 
        selectedLocations.includes(item.location_id.toString())
      );
    }
    
    return Array.from(
      new Set(filteredData.map(item => item.filename))
    ).map(filename => ({
      value: filename,
      label: filename
    }));
  };

  // Calculate how many API calls will be made
  const getApiCallCount = () => {
    let filteredDetails = masterFileDetails;
    
    if (selectedCompanies.length > 0) {
      filteredDetails = filteredDetails.filter(item => 
        selectedCompanies.includes(item.company_id.toString())
      );
    }
    
    if (selectedLocations.length > 0) {
      filteredDetails = filteredDetails.filter(item => 
        selectedLocations.includes(item.location_id.toString())
      );
    }
    
    if (selectedFilenames.length > 0) {
      filteredDetails = filteredDetails.filter(item => 
        selectedFilenames.includes(item.filename)
      );
    }
    
    return filteredDetails.length;
  };

  // Check if filename dropdown should be enabled
  const isFilenameDropdownEnabled = () => {
    return selectedCompanies.length > 0 && selectedLocations.length > 0;
  };

  // Check if location dropdown should be enabled
  const isLocationDropdownEnabled = () => {
    return selectedCompanies.length > 0;
  };

  // Handle company selection with Select All functionality
  const handleCompanyChange = (value) => {
    if (value.includes('select_all')) {
      if (selectedCompanies.length === companyOptions.length) {
        // If all are selected, deselect all
        onCompanyChange([]);
      } else {
        // Select all companies
        onCompanyChange(companyOptions.map(option => option.value));
      }
    } else {
      onCompanyChange(value);
    }
  };

  // Handle location selection with Select All functionality
  const handleLocationChange = (value) => {
    const locationOptions = getLocationOptions();
    if (value.includes('select_all')) {
      if (selectedLocations.length === locationOptions.length) {
        // If all are selected, deselect all
        onLocationChange([]);
      } else {
        // Select all locations
        onLocationChange(locationOptions.map(option => option.value));
      }
    } else {
      onLocationChange(value);
    }
  };

  // Handle filename selection with Select All functionality
  const handleFilenameChange = (value) => {
    const filenameOptions = getFilenameOptions();
    if (value.includes('select_all')) {
      if (selectedFilenames.length === filenameOptions.length) {
        // If all are selected, deselect all
        onFilenameChange([]);
      } else {
        // Select all filenames
        onFilenameChange(filenameOptions.map(option => option.value));
      }
    } else {
      onFilenameChange(value);
    }
  };

  // Render value functions
  const renderCompanyValue = (selected) => {
    if (selected.length === 0) return 'Select Companies';
    if (selected.length === companyOptions.length) return 'All Companies Selected';
    if (selected.length === 1) return companyOptions.find(c => c.value === selected[0])?.label;
    return `${selected.length} selected`;
  };

  const renderLocationValue = (selected) => {
    const locationOptions = getLocationOptions();
    if (!isLocationDropdownEnabled()) return 'Select companies first';
    if (selected.length === 0) return 'Select Locations';
    if (selected.length === locationOptions.length && locationOptions.length > 0) return 'All Locations Selected';
    if (selected.length === 1) return locationOptions.find(l => l.value === selected[0])?.label;
    return `${selected.length} selected`;
  };

  const renderFilenameValue = (selected) => {
    const filenameOptions = getFilenameOptions();
    if (!isFilenameDropdownEnabled()) {
      if (selectedCompanies.length === 0) return 'Select companies first';
      if (selectedLocations.length === 0) return 'Select locations first';
      return 'Select companies & locations first';
    }
    if (selected.length === 0) return 'Select Files';
    if (selected.length === filenameOptions.length && filenameOptions.length > 0) return 'All Files Selected';
    if (selected.length === 1) return selected[0];
    return `${selected.length} selected`;
  };

  return (
    <Box style={{ marginBottom: 16 }}>
      <Grid container spacing={2} alignItems="flex-start">
        {/* Company Filter */}
        <Grid item xs={12} md={3}>
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
              <MenuItem value="select_all" style={{ fontWeight: 'bold', borderBottom: '1px solid #eee' }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <BusinessIcon fontSize="small" />
                  {selectedCompanies.length === companyOptions.length ? 'Deselect All' : 'Select All Companies'}
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

        {/* Location Filter */}
        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Locations *</InputLabel>
            <Select
              multiple
              value={selectedLocations}
              label="Locations *"
              onChange={(e) => handleLocationChange(e.target.value)}
              renderValue={renderLocationValue}
              disabled={!isLocationDropdownEnabled()}
              style={{
                opacity: isLocationDropdownEnabled() ? 1 : 0.6,
              }}
            >
              {/* Select All Option */}
              {getLocationOptions().length > 0 && (
                <MenuItem value="select_all" style={{ fontWeight: 'bold', borderBottom: '1px solid #eee' }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <LocationOnIcon fontSize="small" />
                    {selectedLocations.length === getLocationOptions().length ? 'Deselect All' : 'Select All Locations'}
                  </Box>
                </MenuItem>
              )}
              {getLocationOptions().map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Filename Filter */}
        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Files</InputLabel>
            <Select
              multiple
              value={selectedFilenames}
              label="Files"
              onChange={(e) => handleFilenameChange(e.target.value)}
              renderValue={renderFilenameValue}
              disabled={!isFilenameDropdownEnabled()}
              style={{
                opacity: isFilenameDropdownEnabled() ? 1 : 0.6,
              }}
            >
              {/* Select All Option */}
              {getFilenameOptions().length > 0 && isFilenameDropdownEnabled() && (
                <MenuItem value="select_all" style={{ fontWeight: 'bold', borderBottom: '1px solid #eee' }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <DescriptionIcon fontSize="small" />
                    {selectedFilenames.length === getFilenameOptions().length ? 'Deselect All' : 'Select All Files'}
                  </Box>
                </MenuItem>
              )}
              {getFilenameOptions().map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Apply Button */}
        {showApplyButton && (
          <Grid item xs={12} md={3}>
            <Button
              variant="contained"
              color="primary"
              onClick={onApplyFilters}
              fullWidth
              startIcon={loadingMasterFileDetails ? <RefreshIcon className="rotating" /> : <FilterListIcon />}
              disabled={selectedCompanies.length === 0 || loadingMasterFileDetails}
              style={{ height: '40px' }} // Match dropdown height
            >
              {loadingMasterFileDetails ? 'Loading...' : 'Apply Filters'}
            </Button>
          </Grid>
        )}
      </Grid>
      
      {/* Show selection guidance and active filters */}
      <Box style={{ marginTop: 8 }}>
        {loadingMasterFileDetails ? (
          <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <LinearProgress style={{ width: 100, height: 4 }} />
            <Typography variant="body2" color="primary" style={{ fontWeight: 500 }}>
              Loading filtered data from {getApiCallCount()} source(s)...
            </Typography>
          </Box>
        ) : selectedCompanies.length === 0 ? (
          <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Typography variant="body2" color="primary" style={{ fontWeight: 500 }}>
              Step 1: Select companies to continue
            </Typography>
          </Box>
        ) : selectedLocations.length === 0 ? (
          <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Typography variant="body2" color="primary" style={{ fontWeight: 500 }}>
              Step 2: Select locations to enable file selection
            </Typography>
          </Box>
        ) : getFilenameOptions().length === 0 ? (
          <Typography variant="body2" color="warning.main" style={{ fontWeight: 500 }}>
            No files available for selected companies and locations
          </Typography>
        ) : (
          <Typography variant="body2" color="textSecondary">
            Active filters: {selectedCompanies.length + selectedLocations.length + selectedFilenames.length}
            <span style={{ marginLeft: 8, color: '#4caf50' }}>
              • {getFilenameOptions().length} files available
            </span>
            <span style={{ marginLeft: 8, color: '#2196f3' }}>
              • {getApiCallCount()} API call(s) will be made
            </span>
          </Typography>
        )}
      </Box>
    </Box>
  );
};

const MasterFile = () => {
  // Updated state structure for dynamic data
  const [items, setItems] = useState([]);
  const [columns, setColumns] = useState({});
  const [currentPriceColumn, setCurrentPriceColumn] = useState(null);
  const [previousPriceColumn, setPreviousPriceColumn] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState("");
  const [savingRowId, setSavingRowId] = useState(null); // New state for tracking save operation
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    priceRange: [0, 100],
    stockStatus: "all",
    unit: "all",
    category: "all",
    priceChange: "all",
    showLowStock: false,
    showOutOfStock: false,
  });

  // Updated API Data States
  const [masterFileDetails, setMasterFileDetails] = useState<MasterFileDetail[]>([]);
  const [loadingMasterFileDetails, setLoadingMasterFileDetails] = useState(false);

  // State for FiltersOrderIQ component - Updated
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedFilenames, setSelectedFilenames] = useState<string[]>([]);

  // Excel upload states - Updated to use masterFileDetails
  const [uploadDialog, setUploadDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [selectedLocationId, setSelectedLocationId] = useState("");

  // Date range selector state
  const [selectedDateRange, setSelectedDateRange] = useState(null);

  // Process API response data
  const processApiResponseData = (apiResponses) => {
    let allItems = [];
    let mergedColumns = {};
    let currentPriceCol = null;
    let previousPriceCol = null;

    apiResponses.forEach((response) => {
      if (response.data && response.data.columns && response.data.dataframe) {
        // Merge columns (use first response's column structure as base)
        if (Object.keys(mergedColumns).length === 0) {
          mergedColumns = { ...response.data.columns };
          
          // Find current and previous price columns
          Object.keys(mergedColumns).forEach(key => {
            const columnName = mergedColumns[key].toLowerCase();
            if (columnName.includes('current price')) {
              currentPriceCol = key;
            } else if (columnName.includes('previous price')) {
              previousPriceCol = key;
            }
          });
        }

        // Process dataframe items
        const processedItems = response.data.dataframe.map((item, index) => {
          const processedItem = {
            ...item,
            id: `${response.company_id}_${response.location_id}_${index}`, // Unique ID
            _meta: {
              company_id: response.company_id,
              location_id: response.location_id,
              filename: response.filename,
              company_name: response.company_name,
              location_name: response.location_name
            }
          };

          // Clean up previous price column if it exists
          if (previousPriceCol && processedItem[previousPriceCol]) {
            const prevPrice = parseFloat(processedItem[previousPriceCol]);
            if (isNaN(prevPrice) || prevPrice <= 0) {
              processedItem[previousPriceCol] = null; // Set to null for invalid values
            }
          }

          return processedItem;
        });

        allItems = [...allItems, ...processedItems];
      }
    });

    setItems(allItems);
    setColumns(mergedColumns);
    setCurrentPriceColumn(currentPriceCol);
    setPreviousPriceColumn(previousPriceCol);
  };

  // Get unique values for filters
  const getUniqueValues = (columnKey) => {
    if (!columnKey || items.length === 0) return [];
    return [...new Set(items.map(item => item[columnKey]).filter(Boolean))];
  };

  // Get unique units for filter options (look for UOM column)
  const getUniqueUnits = () => {
    const uomColumn = Object.keys(columns).find(key => 
      columns[key].toLowerCase().includes('uom') || 
      columns[key].toLowerCase().includes('unit')
    );
    return getUniqueValues(uomColumn);
  };

  // Get unique categories for filter options
  const getUniqueCategories = () => {
    const categoryColumn = Object.keys(columns).find(key => 
      columns[key].toLowerCase().includes('category')
    );
    return getUniqueValues(categoryColumn);
  };

  // Get price range for filters
  const getPriceRange = () => {
    if (!items.length || !currentPriceColumn) return [0, 100];
    
    const prices = items.map(item => parseFloat(item[currentPriceColumn]) || 0);
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    
    // Round up max price to nearest 10 or 100
    const roundedMax = maxPrice < 100 ? Math.ceil(maxPrice / 10) * 10 : Math.ceil(maxPrice / 100) * 100;
    
    return [Math.floor(minPrice), roundedMax];
  };

  // Update price range when data changes
  useEffect(() => {
    if (items.length > 0 && currentPriceColumn) {
      const [minPrice, maxPrice] = getPriceRange();
      setFilters(prev => ({
        ...prev,
        priceRange: [minPrice, maxPrice]
      }));
    }
  }, [items, currentPriceColumn]);

  // Fetch master file details data
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

  // Load data on component mount
  useEffect(() => {
    fetchMasterFileDetails();
  }, []);

  // Get unique companies and locations for upload dialog
  const getUniqueCompaniesForUpload = () => {
    return Array.from(
      new Map(
        masterFileDetails.map(item => [item.company_id, {
          id: item.company_id,
          name: item.company_name
        }])
      ).values()
    );
  };

  const getUniqueLocationsForUpload = () => {
    return Array.from(
      new Map(
        masterFileDetails.map(item => [item.location_id, {
          id: item.location_id,
          name: item.location_name
        }])
      ).values()
    );
  };

  // Handler for FiltersOrderIQ filter changes
  const handleCompanyChange = (values: string[]) => {
    setSelectedCompanies(values);
    // Clear location and filename selections when company changes
    setSelectedLocations([]);
    setSelectedFilenames([]);
  };

  const handleLocationChange = (values: string[]) => {
    setSelectedLocations(values);
    // Clear filename selections when location changes
    setSelectedFilenames([]);
  };

  const handleFilenameChange = (values: string[]) => {
    setSelectedFilenames(values);
  };

  // Handler for applying FiltersOrderIQ filters
  const handleApplyOrderIQFilters = async () => {
    console.log("Applied FiltersOrderIQ filters:", {
      companies: selectedCompanies,
      locations: selectedLocations,
      filenames: selectedFilenames,
    });

    // If no specific filters are selected, don't make API calls
    if (selectedCompanies.length === 0) {
      console.log("No companies selected, skipping API calls");
      setPage(0);
      return;
    }

    try {
      setLoadingMasterFileDetails(true);
      
      // Get all valid combinations based on the original masterFileDetails
      let filteredDetails = masterFileDetails;
      
      // Filter by selected companies
      if (selectedCompanies.length > 0) {
        filteredDetails = filteredDetails.filter(item => 
          selectedCompanies.includes(item.company_id.toString())
        );
      }
      
      // Filter by selected locations
      if (selectedLocations.length > 0) {
        filteredDetails = filteredDetails.filter(item => 
          selectedLocations.includes(item.location_id.toString())
        );
      }
      
      // Filter by selected filenames
      if (selectedFilenames.length > 0) {
        filteredDetails = filteredDetails.filter(item => 
          selectedFilenames.includes(item.filename)
        );
      }

      // Create API calls for each filtered combination
      const apiCalls = filteredDetails.map(detail => {
        const url = `/api/masterfile/details/${detail.company_id}/${detail.location_id}/${encodeURIComponent(detail.filename)}`;
        return apiClient.get(url).then(response => ({
          ...response.data,
          company_id: detail.company_id,
          location_id: detail.location_id,
          filename: detail.filename,
          company_name: detail.company_name,
          location_name: detail.location_name
        }));
      });

      console.log(`Making ${apiCalls.length} API calls for filtered combinations`);

      // Execute all API calls
      const results = await Promise.allSettled(apiCalls);
      
      // Process successful results
      const successfulResults = results
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value);
      
      // Process failed results
      const failedResults = results
        .filter(result => result.status === 'rejected')
        .map(result => result.reason);

      console.log(`API Results: ${successfulResults.length} successful, ${failedResults.length} failed`);
      
      if (successfulResults.length > 0) {
        console.log("Successful API responses:", successfulResults);
        
        // Process the API response data
        processApiResponseData(successfulResults);
        
        setUploadStatus({
          type: "success",
          message: `Successfully loaded data from ${successfulResults.length} source(s)`
        });
        
        // Auto-clear success message after 5 seconds
        setTimeout(() => setUploadStatus(null), 5000);
      }
      
      if (failedResults.length > 0) {
        console.error("Failed API calls:", failedResults);
        
        if (successfulResults.length > 0) {
          setUploadStatus({
            type: "warning",
            message: `Loaded ${successfulResults.length} sources successfully, ${failedResults.length} failed`
          });
          // Auto-clear warning message after 7 seconds
          setTimeout(() => setUploadStatus(null), 7000);
        } else {
          setUploadStatus({
            type: "error",
            message: `All ${failedResults.length} API calls failed`
          });
          // Auto-clear error message after 10 seconds
          setTimeout(() => setUploadStatus(null), 10000);
        }
      }

    } catch (error) {
      console.error("Error applying filters:", error);
      setUploadStatus({
        type: "error",
        message: "Failed to load filtered data"
      });
      // Auto-clear error message after 10 seconds
      setTimeout(() => setUploadStatus(null), 10000);
    } finally {
      setLoadingMasterFileDetails(false);
    }

    setPage(0); // Reset to first page when filters change
  };

  // Apply filters to items - Updated for dynamic data
  const applyFilters = (itemsList) => {
    if (!itemsList.length || !currentPriceColumn) return itemsList;

    return itemsList.filter((item) => {
      // Search term filter - search across all text columns
      const searchableText = Object.keys(columns)
        .filter(key => typeof item[key] === 'string')
        .map(key => item[key])
        .join(' ')
        .toLowerCase();
      const matchesSearch = searchableText.includes(searchTerm.toLowerCase());

      // Price range filter
      const currentPrice = parseFloat(item[currentPriceColumn]) || 0;
      const withinPriceRange = currentPrice >= filters.priceRange[0] && currentPrice <= filters.priceRange[1];

      // Unit filter - find UOM column
      const uomColumn = Object.keys(columns).find(key => 
        columns[key].toLowerCase().includes('uom') || 
        columns[key].toLowerCase().includes('unit')
      );
      const matchesUnit = filters.unit === "all" || !uomColumn || item[uomColumn] === filters.unit;

      // Category filter - find category column
      const categoryColumn = Object.keys(columns).find(key => 
        columns[key].toLowerCase().includes('category')
      );
      const matchesCategory = filters.category === "all" || !categoryColumn || item[categoryColumn] === filters.category;

      // Price change filter
      let matchesPriceChange = true;
      if (previousPriceColumn && filters.priceChange !== "all") {
        const previousPrice = parseFloat(item[previousPriceColumn]) || 0;
        if (filters.priceChange === "increased") {
          matchesPriceChange = currentPrice > previousPrice;
        } else if (filters.priceChange === "decreased") {
          matchesPriceChange = currentPrice < previousPrice;
        } else if (filters.priceChange === "unchanged") {
          matchesPriceChange = currentPrice === previousPrice;
        }
      }

      // Stock status filter - look for stock/inventory column
      const stockColumn = Object.keys(columns).find(key => 
        columns[key].toLowerCase().includes('stock') || 
        columns[key].toLowerCase().includes('inventory') ||
        columns[key].toLowerCase().includes('quantity')
      );
      let matchesStockStatus = true;
      if (stockColumn && filters.stockStatus !== "all") {
        const stock = parseInt(item[stockColumn]) || 0;
        if (filters.stockStatus === "inStock") {
          matchesStockStatus = stock > 20;
        } else if (filters.stockStatus === "lowStock") {
          matchesStockStatus = stock > 0 && stock <= 20;
        } else if (filters.stockStatus === "outOfStock") {
          matchesStockStatus = stock === 0;
        }
      }

      // Quick filters for stock
      let matchesLowStock = true;
      let matchesOutOfStock = true;
      if (stockColumn) {
        const stock = parseInt(item[stockColumn]) || 0;
        matchesLowStock = !filters.showLowStock || (stock > 0 && stock <= 20);
        matchesOutOfStock = filters.showOutOfStock || stock > 0;
      }

      return (
        matchesSearch &&
        withinPriceRange &&
        matchesUnit &&
        matchesCategory &&
        matchesPriceChange &&
        matchesStockStatus &&
        matchesLowStock &&
        matchesOutOfStock
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
    if (!isNaN(newPrice) && newPrice > 0 && currentPriceColumn && previousPriceColumn) {
      const itemToUpdate = items.find(item => item.id === id);
      if (!itemToUpdate) return;

      setSavingRowId(id); // Set saving state

      // Update local state first
      const updatedItem = {
        ...itemToUpdate,
        [previousPriceColumn]: itemToUpdate[currentPriceColumn], // Move current to previous
        [currentPriceColumn]: newPrice, // Set new current price
      };

      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === id ? updatedItem : item
        )
      );

      // Prepare data for API call
      try {
        const updateData = {
          company_id: itemToUpdate._meta.company_id,
          location_id: itemToUpdate._meta.location_id,
          filename: itemToUpdate._meta.filename,
          row_data: {
            ...updatedItem,
            // Remove metadata from row data
            _meta: undefined,
            id: undefined
          }
        };
        console.log("Preparing to update row:", updateData);
        // Send update to API
        const response = await apiClient.post("/api/masterfile/updatefile", updateData);
        
        console.log("Row update response:", response.data);
        
        // Show success message
        setUploadStatus({
          type: "success",
          message: `Successfully updated item in ${itemToUpdate._meta.filename}`
        });
        
        // Auto-clear success message after 3 seconds
        setTimeout(() => setUploadStatus(null), 3000);

      } catch (error) {
        console.error("Error updating row:", error);
        
        // Revert local state change on API failure
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.id === id ? itemToUpdate : item
          )
        );
        
        setUploadStatus({
          type: "error",
          message: error.response?.data?.detail || "Failed to update item"
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
    const stockColumn = Object.keys(columns).find(key => 
      columns[key].toLowerCase().includes('stock') || 
      columns[key].toLowerCase().includes('inventory') ||
      columns[key].toLowerCase().includes('quantity')
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
    
    if (currentPrice > previousPrice) return { direction: "↑", color: "success" };
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
                color: priceChange ? (priceChange.color === "success" ? "#2e7d32" : "#d32f2f") : "#666",
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
    if (typeof value === 'number' && columnName.toLowerCase().includes('price')) {
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
          fontWeight: columnName.toLowerCase().includes('name') || columnName.toLowerCase().includes('product') ? 500 : 400,
          fontFamily: columnName.toLowerCase().includes('code') ? 'monospace' : 'inherit'
        }}
      >
        {value || '-'}
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

      const uniqueCompanies = getUniqueCompaniesForUpload();
      const uniqueLocations = getUniqueLocationsForUpload();
      const selectedCompany = uniqueCompanies.find((c) => c.id.toString() === selectedCompanyId);
      const selectedLocation = uniqueLocations.find((l) => l.id.toString() === selectedLocationId);

      setUploadStatus({
        type: "success",
        message: `Successfully uploaded ${selectedFile.name} for ${selectedCompany?.name} - ${selectedLocation?.name}`,
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

  // Date range handler
  const handleDateRangeSelect = (range) => {
    setSelectedDateRange(range);
    console.log("Selected date range:", range);
    // Here you would typically filter items based on the selected date range
    // For example: filterItemsByDateRange(range);
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
                {filteredItems.length} {filteredItems.length === 1 ? 'Item' : 'Items'}
                {items.length > 0 && (
                  <span style={{ color: '#666', fontSize: '0.9rem', marginLeft: 8 }}>
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
                    fetchMasterFileDetails();
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Updated FiltersOrderIQ Component */}
          <Box style={{ marginTop: 24 }}>
            {loadingMasterFileDetails ? (
              <Box style={{ textAlign: 'center', padding: 20 }}>
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
                onApplyFilters={handleApplyOrderIQFilters}
                showApplyButton={true}
                loadingMasterFileDetails={loadingMasterFileDetails}
              />
            )}
            
            {/* Show upload/filter status */}
            {uploadStatus && (
              <Box style={{ marginTop: 16 }}>
                <Alert severity={uploadStatus.type} style={{ borderRadius: 8 }}>
                  {uploadStatus.message}
                </Alert>
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
                {Object.keys(columns).some(key => 
                  columns[key].toLowerCase().includes('stock') || 
                  columns[key].toLowerCase().includes('inventory') ||
                  columns[key].toLowerCase().includes('quantity')
                ) && (
                  <TableCell style={{ fontWeight: 700 }}>Stock Status</TableCell>
                )}
                <TableCell style={{ fontWeight: 700, width: 100 }}>Actions</TableCell>
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
                  {Object.keys(columns).some(key => 
                    columns[key].toLowerCase().includes('stock') || 
                    columns[key].toLowerCase().includes('inventory') ||
                    columns[key].toLowerCase().includes('quantity')
                  ) && (
                    <TableCell>
                      {(() => {
                        const stockColumn = Object.keys(columns).find(key => 
                          columns[key].toLowerCase().includes('stock') || 
                          columns[key].toLowerCase().includes('inventory') ||
                          columns[key].toLowerCase().includes('quantity')
                        );
                        const stock = parseInt(item[stockColumn]) || 0;
                        const status = getStockStatus(item);
                        
                        return (
                          <Box style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
                              <LinearProgress style={{ width: 16, height: 16 }} />
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
                    style={{ textAlign: 'center', padding: 40 }}
                  >
                    <Typography variant="body1" color="textSecondary">
                      {items.length === 0 
                        ? "No data loaded. Please apply filters to load data from selected sources."
                        : "No items match the current filters."
                      }
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
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredItems.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
      </Paper>

      {/* Excel Upload Dialog */}
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

            {/* Company Selection */}
            <FormControl fullWidth style={{ marginBottom: 16 }}>
              <InputLabel>Select Company *</InputLabel>
              <Select
                value={selectedCompanyId}
                label="Select Company *"
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <BusinessIcon />
                  </InputAdornment>
                }
                disabled={loadingMasterFileDetails}
              >
                {getUniqueCompaniesForUpload().map((company) => (
                  <MenuItem key={company.id} value={company.id.toString()}>
                    {company.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Location Selection */}
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
                disabled={loadingMasterFileDetails}
              >
                {getUniqueLocationsForUpload().map((location) => (
                  <MenuItem key={location.id} value={location.id.toString()}>
                    {location.name}
                  </MenuItem>
                ))}
              </Select>
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
            disabled={!selectedFile || !selectedCompanyId || !selectedLocationId || uploading}
            startIcon={uploading ? null : <UploadFileIcon />}
          >
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MasterFile;
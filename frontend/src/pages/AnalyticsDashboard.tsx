import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  Grid,
  Button,
  Chip,
  Paper,
  useTheme,
  alpha,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";

// Material-UI Icons
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ClearIcon from "@mui/icons-material/Clear";
import RefreshIcon from "@mui/icons-material/Refresh";
import AnalyticsComponenet from "../components/AnalyticsComponenet";
import DateRangeSelector from "../components/DateRangeSelector";

// Import API base URL from constants
import { API_URL_Local } from "../constants";

// Import Redux hooks and actions (for companies, locations, and date range)
import { useAppDispatch, useAppSelector } from "../typedHooks";
import {
  selectSelectedCompanies,
  selectSelectedLocations,
  setSelectedCompanies,
  setSelectedLocations,
} from "../store/slices/masterFileSlice";

// Import date range Redux actions and selectors
import {
  selectAnalyticsDashboardDateRange,
  selectHasAnalyticsDashboardDateRange,
  setAnalyticsDashboardDateRange,
  clearAnalyticsDashboardDateRange,
} from "../store/slices/dateRangeSlice";

// DateRangeSelector Button Component
const DateRangeSelectorButton = ({ onDateRangeSelect }) => {
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState("Select Date Range");
  const [tempRange, setTempRange] = useState(null);

  // Get current date range from Redux
  const reduxDateRange = useAppSelector(selectAnalyticsDashboardDateRange);
  const hasDateRange = useAppSelector(selectHasAnalyticsDashboardDateRange);

  // Update display when Redux date range changes
  useEffect(() => {
    if (hasDateRange) {
      const startDate = new Date(reduxDateRange.startDate).toLocaleDateString();
      const endDate = new Date(reduxDateRange.endDate).toLocaleDateString();
      setSelectedRange(`${startDate} - ${endDate}`);
    } else {
      setSelectedRange("Select Date Range");
    }
  }, [reduxDateRange, hasDateRange]);

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
    setSelectedRange("Select Date Range");
    onDateRangeSelect(null);
    dispatch(clearAnalyticsDashboardDateRange());
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<CalendarTodayIcon />}
        endIcon={
          selectedRange !== "Select Date Range" && (
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
        sx={{
          textTransform: "none",
          borderRadius: 1,
          px: 2,
          py: 1,
          borderColor: "#d1d5db",
          color: "#6b7280",
          "&:hover": {
            borderColor: "#9ca3af",
            backgroundColor: "transparent",
          },
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
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle
          sx={{
            borderBottom: "1px solid #e5e7eb",
            pb: 2,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <CalendarTodayIcon color="primary" />
          Select Date Range
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
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
          sx={{
            p: 3,
            borderTop: "1px solid #e5e7eb",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {tempRange &&
              `${tempRange.startDate?.toLocaleDateString()} - ${tempRange.endDate?.toLocaleDateString()}`}
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              onClick={handleClose}
              variant="outlined"
              sx={{ textTransform: "none" }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              variant="contained"
              disabled={!tempRange}
              sx={{ textTransform: "none" }}
            >
              Apply Range
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
};

// Styled components matching your Material-UI theme structure
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  background: `linear-gradient(145deg, ${
    theme.palette.background.paper
  } 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
  boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`,
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: `0 16px 48px ${alpha(theme.palette.common.black, 0.12)}`,
  },
}));

const ContentCard = styled(Card)(({ theme }) => ({
  marginTop: theme.spacing(3),
  borderRadius: 16,
  minHeight: 500,
  background: theme.palette.background.paper,
  boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.08)}`,
  overflow: "visible",
}));

const ActiveFilterChip = styled(Chip)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
  fontWeight: 500,
  "& .MuiChip-deleteIcon": {
    color: theme.palette.primary.contrastText,
    "&:hover": {
      color: alpha(theme.palette.primary.contrastText, 0.8),
    },
  },
}));

const AnalyticsDashboard = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  // Get Redux state (companies, locations, and date range)
  const reduxSelectedCompanies = useAppSelector(selectSelectedCompanies);
  const reduxSelectedLocations = useAppSelector(selectSelectedLocations);
  const reduxDateRange = useAppSelector(selectAnalyticsDashboardDateRange);
  const hasDateRange = useAppSelector(selectHasAnalyticsDashboardDateRange);

  // State for API data
  const [companyLocationData, setCompanyLocationData] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analyticsError, setAnalyticsError] = useState(null);

  // Filter states (for UI selections, not applied yet)
  const [selectedCompanies, setSelectedCompaniesLocal] = useState([]);
  const [selectedLocations, setSelectedLocationsLocal] = useState([]);

  // State for applied filters (what gets sent to AnalyticsComponent)
  const [appliedFilters, setAppliedFilters] = useState({
    companies: [],
    locations: [],
    dateRange: null,
  });

  // Auto-apply filters when Redux state changes (this is the key fix)
  useEffect(() => {
    // Only apply filters if we have both companies and locations selected
    if (reduxSelectedCompanies.length > 0 && reduxSelectedLocations.length > 0) {
      console.log('Auto-applying filters due to Redux state change:', {
        reduxCompanies: reduxSelectedCompanies,
        reduxLocations: reduxSelectedLocations,
        reduxDateRange: reduxDateRange
      });

      // Apply the filters using Redux values directly
      setAppliedFilters({
        companies: reduxSelectedCompanies.map(id => parseInt(id)),
        locations: reduxSelectedLocations.map(id => parseInt(id)),
        dateRange: reduxDateRange
      });

      // Fetch analytics data for the first selected company and location
      const firstCompany = reduxSelectedCompanies[0];
      const firstLocation = reduxSelectedLocations[0];
      
      if (firstCompany && firstLocation) {
        fetchAnalyticsData(parseInt(firstCompany), parseInt(firstLocation), reduxDateRange);
      }
    }
  }, [reduxSelectedCompanies.join(','), reduxSelectedLocations.join(','), hasDateRange]);

  // Fetch analytics data for selected company and location
  const fetchAnalyticsData = async (companyId, locationId, dateRange = null) => {
    try {
      setAnalyticsLoading(true);
      setAnalyticsError(null);

      console.log('Fetching analytics data for:', { companyId, locationId, dateRange });

      // Build the API URL
      let apiUrl = `${API_URL_Local}/api/storeorders/analyticsdashboard/${companyId}/${locationId}`;
      
      // Add date range parameters if provided
      const params = new URLSearchParams();
      if (dateRange && dateRange.startDate && dateRange.endDate) {
        const startDate = new Date(dateRange.startDate).toISOString().split('T')[0];
        const endDate = new Date(dateRange.endDate).toISOString().split('T')[0];
        params.append('start_date', startDate);
        params.append('end_date', endDate);
      }
      
      if (params.toString()) {
        apiUrl += `?${params.toString()}`;
      }

      console.log('Fetching from URL:', apiUrl);

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Add any authentication headers if needed
          // 'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Analytics API response:', result);

      if (result.data) {
        setAnalyticsData(result.data);
      } else {
        throw new Error('No data received from analytics API');
      }

    } catch (err) {
      console.error("Error fetching analytics data:", err);
      setAnalyticsError(err.message);
      setAnalyticsData(null);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Fetch company-location data from API
  const fetchCompanyLocationData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use the correct endpoint for company-locations
      const response = await fetch(`${API_URL_Local}/company-locations/all`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Add any authentication headers if needed
          // 'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCompanyLocationData(data);
    } catch (err) {
      console.error("Error fetching company-location data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load initial data and set from Redux on component mount
  useEffect(() => {
    fetchCompanyLocationData();
  }, []);

  // Initialize local state from Redux when component mounts (companies and locations only)
  useEffect(() => {
    if (reduxSelectedCompanies.length > 0) {
      console.log(
        "Setting initial companies from Redux:",
        reduxSelectedCompanies
      );
      setSelectedCompaniesLocal(
        reduxSelectedCompanies.map((id) => parseInt(id))
      );
    }
  }, [reduxSelectedCompanies.join(',')]);

  useEffect(() => {
    if (reduxSelectedLocations.length > 0) {
      console.log(
        "Setting initial locations from Redux:",
        reduxSelectedLocations
      );
      setSelectedLocationsLocal(
        reduxSelectedLocations.map((id) => parseInt(id))
      );
    }
  }, [reduxSelectedLocations.join(',')]);

  // Auto-apply filters when component loads with Redux data (companies, locations, and date range)
  useEffect(() => {
    if (
      reduxSelectedCompanies.length > 0 &&
      reduxSelectedLocations.length > 0 &&
      companyLocationData.length > 0
    ) {
      console.log("Auto-applying filters from initial Redux state");
      setAppliedFilters({
        companies: reduxSelectedCompanies.map((id) => parseInt(id)),
        locations: reduxSelectedLocations.map((id) => parseInt(id)),
        dateRange: reduxDateRange,
      });

      // Fetch analytics data for the first selected company and location
      const firstCompany = reduxSelectedCompanies[0];
      const firstLocation = reduxSelectedLocations[0];
      
      if (firstCompany && firstLocation) {
        fetchAnalyticsData(parseInt(firstCompany), parseInt(firstLocation), reduxDateRange);
      }
    }
  }, [companyLocationData.length]); // Only run when component data loads

  // Get available companies
  const availableCompanies = companyLocationData.map((item) => ({
    id: item.company_id,
    name: item.company_name,
  }));

  // Get available locations based on selected companies
  const getAvailableLocations = () => {
    // Only show locations if companies are selected
    if (selectedCompanies.length === 0) {
      return [];
    } else {
      // Show only locations for selected companies
      const locations = companyLocationData
        .filter((company) => selectedCompanies.includes(company.company_id))
        .reduce((acc, company) => {
          return acc.concat(
            company.locations.map((location) => ({
              id: location.location_id,
              name: location.location_name,
              companyId: company.company_id,
              companyName: company.company_name,
            }))
          );
        }, []);

      console.log("Available locations:", locations);
      return locations;
    }
  };

  const availableLocations = getAvailableLocations();

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCompaniesLocal([]);
    setSelectedLocationsLocal([]);

    // Update Redux (companies, locations, and date range)
    dispatch(setSelectedCompanies([]));
    dispatch(setSelectedLocations([]));
    dispatch(clearAnalyticsDashboardDateRange());
  };

  // Handle company selection
  const handleCompanyChange = (event) => {
    const value = event.target.value;
    const newSelectedCompanies =
      typeof value === "string" ? value.split(",") : value;

    setSelectedCompaniesLocal(newSelectedCompanies);

    // Update Redux immediately
    dispatch(setSelectedCompanies(newSelectedCompanies.map(id => id.toString())));

    // Clear locations that don't belong to selected companies
    if (newSelectedCompanies.length > 0) {
      const validLocationIds = companyLocationData
        .filter((company) => newSelectedCompanies.includes(company.company_id))
        .reduce((acc, company) => {
          return acc.concat(
            company.locations.map((location) => location.location_id)
          );
        }, []);

      const newValidLocations = selectedLocations.filter((locationId) => validLocationIds.includes(locationId));
      setSelectedLocationsLocal(newValidLocations);
      
      // Update Redux for locations too
      dispatch(setSelectedLocations(newValidLocations.map(id => id.toString())));
    } else {
      // If no companies selected, clear locations
      setSelectedLocationsLocal([]);
      dispatch(setSelectedLocations([]));
    }
  };

  // Handle location selection
  const handleLocationChange = (event) => {
    const value = event.target.value;
    console.log("Location selection event:", { value, type: typeof value });

    const newSelectedLocations =
      typeof value === "string" ? value.split(",") : value;
    console.log("New selected locations:", newSelectedLocations);

    setSelectedLocationsLocal(newSelectedLocations);
    
    // Update Redux immediately
    dispatch(setSelectedLocations(newSelectedLocations.map(id => id.toString())));
  };

  // Handle date range selection (Redux state)
  const handleDateRangeSelect = (range) => {
    if (range) {
      // Convert dates to ISO string format for Redux storage
      const startDateISO = range.startDate.toISOString();
      const endDateISO = range.endDate.toISOString();
      
      dispatch(setAnalyticsDashboardDateRange({
        startDate: startDateISO,
        endDate: endDateISO
      }));
    } else {
      dispatch(clearAnalyticsDashboardDateRange());
    }
    console.log("Selected date range:", range);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchCompanyLocationData();
    
    // Also refresh analytics data if we have selections
    if (reduxSelectedCompanies.length > 0 && reduxSelectedLocations.length > 0) {
      const firstCompany = reduxSelectedCompanies[0];
      const firstLocation = reduxSelectedLocations[0];
      fetchAnalyticsData(parseInt(firstCompany), parseInt(firstLocation), reduxDateRange);
    }
  };

  // Get company name by ID
  const getCompanyNameById = (companyId) => {
    const company = companyLocationData.find((c) => c.company_id === companyId);
    return company ? company.company_name : "";
  };

  // Get location name by ID
  const getLocationNameById = (locationId) => {
    for (const company of companyLocationData) {
      const location = company.locations.find(
        (l) => l.location_id === locationId
      );
      if (location) return location.location_name;
    }
    return "";
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #fafafa 0%, #ffffff 100%)",
        }}
      >
        <CircularProgress size={50} />
        <Typography sx={{ ml: 2 }}>Loading companies and locations...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #fafafa 0%, #ffffff 100%)",
        }}
      >
        <Typography color="error" variant="h6">
          Error loading company/location data: {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #fafafa 0%, #ffffff 100%)",
      }}
    >
      {/* Top Controls */}
      <Container maxWidth="xl" sx={{ pt: 3, pb: 1 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
            sx={{
              textTransform: "none",
              borderRadius: 1,
              px: 2,
              py: 1,
              borderColor: "#d1d5db",
              color: "#6b7280",
              "&:hover": {
                borderColor: "#9ca3af",
                backgroundColor: "transparent",
              },
            }}
          >
            Refresh
          </Button>
          <DateRangeSelectorButton onDateRangeSelect={handleDateRangeSelect} />
        </Box>
      </Container>

      {/* Filters Section */}
      <Container maxWidth="xl">
        <StyledCard sx={{ p: 4, overflow: "visible" }}>
          {/* Filter Header */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
            <FilterListIcon sx={{ color: theme.palette.primary.main }} />
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, color: theme.palette.text.primary }}
            >
              Filters
            </Typography>
          </Box>

          {/* Filter Controls */}
          <Grid container spacing={3} sx={{ mb: 4, overflow: "visible" }}>
            {/* Company Filter */}
            <Grid item xs={12} lg={6}>
              <FormControl fullWidth>
                <InputLabel id="company-select-label">Companies</InputLabel>
                <Select
                  labelId="company-select-label"
                  multiple
                  value={selectedCompanies}
                  onChange={handleCompanyChange}
                  input={<OutlinedInput label="Companies" />}
                  renderValue={(selected) =>
                    selected.length === 0
                      ? "All companies initially selected"
                      : `${selected.length} company(s) selected`
                  }
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300,
                        backgroundColor: "#ffffff",
                        border: "2px solid #1976d2",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                      },
                    },
                    anchorOrigin: {
                      vertical: "bottom",
                      horizontal: "left",
                    },
                    transformOrigin: {
                      vertical: "top",
                      horizontal: "left",
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "&:hover fieldset": {
                        borderColor:
                          selectedCompanies.length === 0
                            ? "#d1d5db"
                            : theme.palette.primary.main,
                      },
                      "&.Mui-disabled": {
                        backgroundColor: "#f9fafb",
                      },
                    },
                  }}
                >
                  <MenuItem
                    value=""
                    onClick={() => {
                      if (
                        selectedCompanies.length === availableCompanies.length
                      ) {
                        setSelectedCompaniesLocal([]);
                        setSelectedLocationsLocal([]);
                      } else {
                        setSelectedCompaniesLocal(
                          availableCompanies.map((c) => c.id)
                        );
                      }
                    }}
                    sx={{
                      backgroundColor: "#ffffff",
                      "&:hover": {
                        backgroundColor: alpha(
                          theme.palette.primary.main,
                          0.04
                        ),
                      },
                    }}
                  >
                    <Checkbox
                      checked={
                        selectedCompanies.length === availableCompanies.length
                      }
                      indeterminate={
                        selectedCompanies.length > 0 &&
                        selectedCompanies.length < availableCompanies.length
                      }
                    />
                    <ListItemText primary="Select All" />
                  </MenuItem>
                  {availableCompanies.map((company) => (
                    <MenuItem
                      key={company.id}
                      value={company.id}
                      sx={{
                        backgroundColor: "#ffffff",
                        "&:hover": {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.04
                          ),
                        },
                      }}
                    >
                      <Checkbox
                        checked={selectedCompanies.indexOf(company.id) > -1}
                      />
                      <ListItemText primary={company.name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Location Filter */}
            <Grid item xs={12} lg={6}>
              <FormControl fullWidth>
                <InputLabel id="location-select-label">Locations</InputLabel>
                <Select
                  labelId="location-select-label"
                  multiple
                  value={selectedLocations}
                  onChange={handleLocationChange}
                  input={<OutlinedInput label="Locations" />}
                  disabled={selectedCompanies.length === 0}
                  renderValue={(selected) =>
                    selectedCompanies.length === 0
                      ? "Please select a company first"
                      : selected.length === 0
                      ? "Select locations"
                      : `${selected.length} location(s) selected`
                  }
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300,
                        backgroundColor: "#ffffff",
                        border: "2px solid #1976d2",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                      },
                    },
                    anchorOrigin: {
                      vertical: "bottom",
                      horizontal: "left",
                    },
                    transformOrigin: {
                      vertical: "top",
                      horizontal: "left",
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "&:hover fieldset": {
                        borderColor: theme.palette.primary.main,
                      },
                    },
                  }}
                >
                  {selectedCompanies.length > 0 &&
                    availableLocations.length > 0 && (
                      <>
                        <MenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            if (
                              selectedLocations.length ===
                              availableLocations.length
                            ) {
                              setSelectedLocationsLocal([]);
                            } else {
                              setSelectedLocationsLocal(
                                availableLocations.map((l) => l.id)
                              );
                            }
                          }}
                          sx={{
                            backgroundColor: "#ffffff",
                            "&:hover": {
                              backgroundColor: alpha(
                                theme.palette.primary.main,
                                0.04
                              ),
                            },
                          }}
                        >
                          <Checkbox
                            checked={
                              availableLocations.length > 0 &&
                              selectedLocations.length ===
                                availableLocations.length
                            }
                            indeterminate={
                              selectedLocations.length > 0 &&
                              selectedLocations.length <
                                availableLocations.length
                            }
                          />
                          <ListItemText primary="Select All" />
                        </MenuItem>
                        {availableLocations.map((location) => (
                          <MenuItem
                            key={location.id}
                            value={location.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              const currentIndex = selectedLocations.indexOf(
                                location.id
                              );
                              const newSelectedLocations = [
                                ...selectedLocations,
                              ];

                              if (currentIndex === -1) {
                                newSelectedLocations.push(location.id);
                              } else {
                                newSelectedLocations.splice(currentIndex, 1);
                              }

                              console.log(
                                "Individual location clicked:",
                                location.id,
                                "New selection:",
                                newSelectedLocations
                              );
                              setSelectedLocationsLocal(newSelectedLocations);
                            }}
                            sx={{
                              backgroundColor: "#ffffff",
                              "&:hover": {
                                backgroundColor: alpha(
                                  theme.palette.primary.main,
                                  0.04
                                ),
                              },
                            }}
                          >
                            <Checkbox
                              checked={selectedLocations.includes(location.id)}
                            />
                            <ListItemText
                              primary={location.name}
                              secondary={location.companyName}
                            />
                          </MenuItem>
                        ))}
                      </>
                    )}
                  {selectedCompanies.length === 0 && (
                    <MenuItem disabled>
                      <ListItemText primary="Please select a company first" />
                    </MenuItem>
                  )}
                  {selectedCompanies.length > 0 &&
                    availableLocations.length === 0 && (
                      <MenuItem disabled>
                        <ListItemText primary="No locations available for selected company" />
                      </MenuItem>
                    )}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Active Filters */}
          {(selectedCompanies.length > 0 || selectedLocations.length > 0 || hasDateRange) && (
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  color: theme.palette.text.primary,
                }}
              >
                Active Filters:
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {selectedCompanies.map((companyId) => (
                  <ActiveFilterChip
                    key={companyId}
                    label={`Company: ${getCompanyNameById(companyId)}`}
                    onDelete={() => {
                      const newCompanies = selectedCompanies.filter(
                        (id) => id !== companyId
                      );
                      setSelectedCompaniesLocal(newCompanies);

                      // Remove locations that belong to this company
                      const companyLocations =
                        companyLocationData.find(
                          (c) => c.company_id === companyId
                        )?.locations || [];
                      const locationIdsToRemove = companyLocations.map(
                        (l) => l.location_id
                      );
                      setSelectedLocationsLocal((prev) =>
                        prev.filter((id) => !locationIdsToRemove.includes(id))
                      );
                    }}
                    deleteIcon={<CloseIcon />}
                  />
                ))}
                {selectedLocations.map((locationId) => (
                  <ActiveFilterChip
                    key={locationId}
                    label={`Location: ${getLocationNameById(locationId)}`}
                    onDelete={() =>
                      setSelectedLocationsLocal((prev) =>
                        prev.filter((id) => id !== locationId)
                      )
                    }
                    deleteIcon={<CloseIcon />}
                  />
                ))}
                {hasDateRange && (
                  <ActiveFilterChip
                    label={`Date: ${new Date(reduxDateRange.startDate).toLocaleDateString()} - ${new Date(reduxDateRange.endDate).toLocaleDateString()}`}
                    onDelete={() => dispatch(clearAnalyticsDashboardDateRange())}
                    deleteIcon={<CloseIcon />}
                  />
                )}
                {(selectedCompanies.length > 0 ||
                  selectedLocations.length > 0 ||
                  hasDateRange) && (
                  <Button
                    size="small"
                    onClick={clearAllFilters}
                    sx={{ ml: 1, textTransform: "none" }}
                  >
                    Clear All
                  </Button>
                )}
              </Box>
            </Box>
          )}
        </StyledCard>
      </Container>

      {/* Analytics Content */}
      <Container maxWidth="xl">
        <ContentCard>
          {analyticsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
              <CircularProgress size={40} />
              <Typography sx={{ ml: 2 }}>Loading analytics data...</Typography>
            </Box>
          ) : analyticsError ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8, flexDirection: 'column' }}>
              <Typography color="error" variant="h6" gutterBottom>
                Error loading analytics data
              </Typography>
              <Typography color="error" variant="body2">
                {analyticsError}
              </Typography>
              {reduxSelectedCompanies.length > 0 && reduxSelectedLocations.length > 0 && (
                <Button 
                  variant="outlined" 
                  onClick={() => fetchAnalyticsData(
                    parseInt(reduxSelectedCompanies[0]), 
                    parseInt(reduxSelectedLocations[0]), 
                    reduxDateRange
                  )}
                  sx={{ mt: 2 }}
                >
                  Retry
                </Button>
              )}
            </Box>
          ) : !analyticsData ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
              <Typography variant="body1" color="text.secondary">
                {reduxSelectedCompanies.length === 0 || reduxSelectedLocations.length === 0 
                  ? "Please select a company and location to view analytics data"
                  : "No analytics data available"
                }
              </Typography>
            </Box>
          ) : (
            <>
              {/* Analytics Data Display */}
              <Box sx={{ p: 3 }}>
                {/* Header with company and location info */}
                <Box sx={{ mb: 4, borderBottom: '1px solid #e0e0e0', pb: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                    Analytics Dashboard
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    {analyticsData.company_name} - {analyticsData.location_name}
                  </Typography>
                </Box>

                {/* Key Metrics Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                        ${analyticsData.total_sales}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Sales
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                        {analyticsData.total_orders}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Orders
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                        ${analyticsData.avg_order_value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Avg Order Value
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                        {analyticsData.daily_orders?.length || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Days of Data
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>

                {/* Pass analytics data to AnalyticsComponent */}
                <AnalyticsComponenet 
                  appliedFilters={appliedFilters} 
                  analyticsData={analyticsData}
                />
              </Box>
            </>
          )}
        </ContentCard>
      </Container>
    </Box>
  );
};

export default AnalyticsDashboard;
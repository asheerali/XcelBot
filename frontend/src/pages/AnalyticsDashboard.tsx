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

// Import Redux hooks and actions
import { useAppDispatch, useAppSelector } from "../typedHooks";
import {
  selectSelectedCompanies,
  selectSelectedLocations,
  setSelectedCompanies,
  setSelectedLocations,
} from "../store/slices/masterFileSlice";

// DateRangeSelector Button Component
const DateRangeSelectorButton = ({ onDateRangeSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState("Select Date Range");
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
    setSelectedRange("Select Date Range");
    onDateRangeSelect(null);
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
  overflow: "visible", // Changed from 'hidden' to 'visible'
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

  // Get Redux state
  const reduxSelectedCompanies = useAppSelector(selectSelectedCompanies);
  const reduxSelectedLocations = useAppSelector(selectSelectedLocations);

  // State for API data
  const [companyLocationData, setCompanyLocationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states (for UI selections, not applied yet)
  const [selectedCompanies, setSelectedCompaniesLocal] = useState([]);
  const [selectedLocations, setSelectedLocationsLocal] = useState([]);
  const [selectedDateRange, setSelectedDateRange] = useState(null);

  // State for applied filters (what gets sent to AnalyticsComponent)
  const [appliedFilters, setAppliedFilters] = useState({
    companies: [],
    locations: [],
    dateRange: null,
  });

  // // Auto-apply filters when locations change
  // useEffect(() => {
  //   if (selectedLocations.length > 0) {
  //     console.log('Auto-applying filters due to location change:', {
  //       companies: selectedCompanies,
  //       locations: selectedLocations,
  //       dateRange: selectedDateRange
  //     });

  //     // Update Redux with current selections
  //     dispatch(setSelectedCompanies(selectedCompanies.map(id => id.toString())));
  //     dispatch(setSelectedLocations(selectedLocations.map(id => id.toString())));

  //     // Apply the filters - this will trigger the analytics data fetch
  //     setAppliedFilters({
  //       companies: selectedCompanies,
  //       locations: selectedLocations,
  //       dateRange: selectedDateRange
  //     });
  //   }
  // }, [selectedLocations, selectedCompanies, selectedDateRange, dispatch]);

  useEffect(() => {
    const newFilters = {
      companies: selectedCompanies,
      locations: selectedLocations,
      dateRange: selectedDateRange,
    };

    const filtersChanged =
      JSON.stringify(appliedFilters) !== JSON.stringify(newFilters);

    if (
      selectedCompanies.length > 0 &&
      selectedLocations.length > 0 &&
      filtersChanged
    ) {
      dispatch(setSelectedCompanies(selectedCompanies.map(String)));
      dispatch(setSelectedLocations(selectedLocations.map(String)));
      setAppliedFilters(newFilters);
    }
  }, [selectedCompanies, selectedLocations, selectedDateRange, dispatch]);

  // Auto-apply filters when date range changes
  useEffect(() => {
    if (selectedDateRange) {
      console.log("Auto-applying filters due to date range change:", {
        companies: selectedCompanies,
        locations: selectedLocations,
        dateRange: selectedDateRange,
      });

      // Update Redux with current selections
      dispatch(
        setSelectedCompanies(selectedCompanies.map((id) => id.toString()))
      );
      dispatch(
        setSelectedLocations(selectedLocations.map((id) => id.toString()))
      );

      // Apply the filters - this will trigger the analytics data fetch
      setAppliedFilters({
        companies: selectedCompanies,
        locations: selectedLocations,
        dateRange: selectedDateRange,
      });
    }
  }, [selectedDateRange, selectedCompanies, selectedLocations, dispatch]);

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

  // Initialize local state from Redux when component mounts or Redux state changes
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
  }, [reduxSelectedCompanies]);

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
  }, [reduxSelectedLocations]);

  // Auto-apply filters when component loads with Redux data
  useEffect(() => {
    if (
      reduxSelectedCompanies.length > 0 &&
      reduxSelectedLocations.length > 0 &&
      companyLocationData.length > 0
    ) {
      console.log("Auto-applying filters from Redux state");
      setAppliedFilters({
        companies: reduxSelectedCompanies.map((id) => parseInt(id)),
        locations: reduxSelectedLocations.map((id) => parseInt(id)),
        dateRange: null,
      });
    }
  }, [reduxSelectedCompanies, reduxSelectedLocations, companyLocationData]);

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
    setSelectedDateRange(null);

    // Update Redux
    dispatch(setSelectedCompanies([]));
    dispatch(setSelectedLocations([]));
  };

  // Handle company selection
  const handleCompanyChange = (event) => {
    const value = event.target.value;
    const newSelectedCompanies =
      typeof value === "string" ? value.split(",") : value;

    setSelectedCompaniesLocal(newSelectedCompanies);

    // Clear locations that don't belong to selected companies
    if (newSelectedCompanies.length > 0) {
      const validLocationIds = companyLocationData
        .filter((company) => newSelectedCompanies.includes(company.company_id))
        .reduce((acc, company) => {
          return acc.concat(
            company.locations.map((location) => location.location_id)
          );
        }, []);

      setSelectedLocationsLocal((prev) =>
        prev.filter((locationId) => validLocationIds.includes(locationId))
      );
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
  };

  // Handle date range selection
  const handleDateRangeSelect = (range) => {
    setSelectedDateRange(range);
    console.log("Selected date range:", range);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchCompanyLocationData();
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
          Error loading data: {error}
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
          {(selectedCompanies.length > 0 || selectedLocations.length > 0) && (
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
                {(selectedCompanies.length > 0 ||
                  selectedLocations.length > 0) && (
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

          {/* Apply Filters Button - Removed as requested */}
          {/* Button has been removed and filters now auto-apply when location or date range is selected */}
        </StyledCard>
      </Container>

      {/* Analytics Content */}
      <Container maxWidth="xl">
        <ContentCard>
          <AnalyticsComponenet appliedFilters={appliedFilters} />
        </ContentCard>
      </Container>
    </Box>
  );
};

export default AnalyticsDashboard;

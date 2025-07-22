import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  useTheme,
  alpha,
  CircularProgress,
  Alert,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { API_URL_Local } from "../constants";
import apiClient from "../api/axiosConfig"; // Add this line

// Filter option interface
interface FilterOption {
  value: string;
  label: string;
}

// API response interfaces
interface Location {
  location_id: number;
  location_name: string;
}

interface Company {
  company_id: number;
  company_name: string;
  locations: Location[];
}

// Component props
interface FiltersOrderIQProps {
  selectedLocations?: string[];
  selectedCompanies?: string[];
  onLocationChange: (values: string[]) => void;
  onCompanyChange: (values: string[]) => void;
  onApplyFilters: () => void;
  showApplyButton?: boolean;
}

const FiltersOrderIQ: React.FC<FiltersOrderIQProps> = ({
  selectedLocations = [],
  selectedCompanies = [],
  onLocationChange,
  onCompanyChange,
  onApplyFilters,
  showApplyButton = true,
}) => {
  const theme = useTheme();

  // State management
  const [companies, setCompanies] = useState<Company[]>([]);
  const [availableLocations, setAvailableLocations] = useState<FilterOption[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch companies and locations data
  useEffect(() => {
    const fetchCompaniesAndLocations = async () => {
      try {
        setLoading(true);
        setError(null);

        // const response = await fetch(`${API_URL_Local}/company-locations/all`);

        // if (!response.ok) {
        //   throw new Error(`HTTP error! status: ${response.status}`);
        // }

        // const data: Company[] = await response.json();

        const response = await apiClient.get("/company-locations/all");
        const data: Company[] = response.data;
        setCompanies(data);

        // Don't set any locations initially - wait for company selection
        setAvailableLocations([]);

        // } catch (err) {
        //   console.error('Error fetching companies and locations:', err);
        //   setError(err instanceof Error ? err.message : 'Failed to fetch data');
        // } finally {
      } catch (err) {
        console.error("Error fetching companies and locations:", err);

        let errorMessage = "Failed to fetch data";
        if (err.response) {
          if (err.response.status === 401) {
            errorMessage = "Authentication failed. Please log in again.";
            // Auth interceptor will handle redirect to login
          } else {
            errorMessage = `Server error: ${err.response.status}`;
          }
        } else if (err.request) {
          errorMessage =
            "Cannot connect to server. Please check if the backend is running.";
        } else {
          errorMessage =
            err instanceof Error ? err.message : "Failed to fetch data";
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchCompaniesAndLocations();
  }, []);

  // Update available locations when companies are selected
  useEffect(() => {
    if (selectedCompanies.length === 0) {
      // No locations available if no companies are selected
      setAvailableLocations([]);
      // Clear any selected locations when no companies are selected
      if (selectedLocations.length > 0) {
        onLocationChange([]);
      }
    } else {
      // Show only locations from selected companies
      const selectedCompanyIds = selectedCompanies.map((id) => parseInt(id));
      const filteredLocations: FilterOption[] = companies
        .filter((company) => selectedCompanyIds.includes(company.company_id))
        .flatMap((company) =>
          company.locations.map((location) => ({
            value: location.location_id.toString(),
            label: location.location_name,
          }))
        );
      setAvailableLocations(filteredLocations);

      // Clear selected locations that are not available anymore
      const availableLocationIds = filteredLocations.map((loc) => loc.value);
      const validSelectedLocations = selectedLocations.filter((locId) =>
        availableLocationIds.includes(locId)
      );

      if (validSelectedLocations.length !== selectedLocations.length) {
        onLocationChange(validSelectedLocations);
      }
    }
  }, [selectedCompanies, companies, selectedLocations, onLocationChange]);

  // Convert companies to filter options
  const companyOptions: FilterOption[] = companies.map((company) => ({
    value: company.company_id.toString(),
    label: company.company_name,
  }));

  // Handle select all/none for locations
  const handleSelectAllLocations = () => {
    const allValues = availableLocations.map((option) => option.value);

    if (selectedLocations.length === allValues.length) {
      onLocationChange([]);
    } else {
      onLocationChange(allValues);
    }
  };

  // Handle select all/none for companies
  const handleSelectAllCompanies = () => {
    const allValues = companyOptions.map((option) => option.value);

    if (selectedCompanies.length === allValues.length) {
      onCompanyChange([]);
    } else {
      onCompanyChange(allValues);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <Box
        sx={{
          p: 3,
          border: "1px solid #e0e0e0",
          borderRadius: 2,
          backgroundColor: "#ffffff",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 200,
        }}
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading filters...</Typography>
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box
        sx={{
          p: 3,
          border: "1px solid #e0e0e0",
          borderRadius: 2,
          backgroundColor: "#ffffff",
        }}
      >
        <Alert severity="error">Error loading filters: {error}</Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 3,
        border: "1px solid #e0e0e0",
        borderRadius: 2,
        backgroundColor: "#ffffff",
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <FilterListIcon sx={{ color: theme.palette.primary.main }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Filters
        </Typography>
      </Box>

      {/* Filter Controls */}
      <Box
        sx={{
          display: "flex",
          gap: 3,
          mb: 3,
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "stretch", md: "flex-start" },
        }}
      >
        {/* Companies Filter */}
        <FormControl
          sx={{
            minWidth: 200,
            flex: 1,
          }}
        >
          <InputLabel>Companies</InputLabel>
          <Select
            multiple
            value={selectedCompanies}
            onChange={(event) => {
              const value = event.target.value;
              const newValues =
                typeof value === "string" ? value.split(",") : value;
              onCompanyChange(newValues);
            }}
            input={<OutlinedInput label="Companies" />}
            renderValue={(selected) => {
              if (selected.length === 0) {
                return "All companies";
              }
              if (selected.length === 1) {
                const company = companyOptions.find(
                  (opt) => opt.value === selected[0]
                );
                return company?.label || "Unknown";
              }
              return `${selected.length} companies selected`;
            }}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 300,
                },
              },
            }}
          >
            {/* Select All option */}
            <MenuItem
              value=""
              onClick={(e) => {
                e.preventDefault();
                handleSelectAllCompanies();
              }}
            >
              <Checkbox
                checked={selectedCompanies.length === companyOptions.length}
                indeterminate={
                  selectedCompanies.length > 0 &&
                  selectedCompanies.length < companyOptions.length
                }
              />
              <ListItemText primary="Select All" />
            </MenuItem>

            {/* Individual company options */}
            {companyOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Checkbox checked={selectedCompanies.includes(option.value)} />
                <ListItemText primary={option.label} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Location Filter */}
        <FormControl
          sx={{
            minWidth: 200,
            flex: 1,
            opacity: selectedCompanies.length === 0 ? 0.6 : 1,
          }}
          disabled={selectedCompanies.length === 0}
        >
          <InputLabel>Location</InputLabel>
          <Select
            multiple
            value={selectedLocations}
            onChange={(event) => {
              const value = event.target.value;
              const newValues =
                typeof value === "string" ? value.split(",") : value;
              onLocationChange(newValues);
            }}
            input={<OutlinedInput label="Location" />}
            renderValue={(selected) => {
              if (selectedCompanies.length === 0) {
                return "Select company first";
              }
              if (selected.length === 0) {
                return availableLocations.length > 0
                  ? "All locations"
                  : "No locations available";
              }
              if (selected.length === 1) {
                const location = availableLocations.find(
                  (opt) => opt.value === selected[0]
                );
                return location?.label || "Unknown";
              }
              return `${selected.length} locations selected`;
            }}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 300,
                },
              },
            }}
          >
            {selectedCompanies.length === 0 ? (
              <MenuItem disabled>
                <ListItemText
                  primary="Please select a company first to view locations"
                  sx={{ fontStyle: "italic", color: "text.secondary" }}
                />
              </MenuItem>
            ) : availableLocations.length > 0 ? (
              [
                /* Select All option */
                <MenuItem
                  key="select-all"
                  value=""
                  onClick={(e) => {
                    e.preventDefault();
                    handleSelectAllLocations();
                  }}
                >
                  <Checkbox
                    checked={
                      selectedLocations.length === availableLocations.length
                    }
                    indeterminate={
                      selectedLocations.length > 0 &&
                      selectedLocations.length < availableLocations.length
                    }
                  />
                  <ListItemText primary="Select All" />
                </MenuItem>,

                /* Individual location options */
                ...availableLocations.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Checkbox
                      checked={selectedLocations.includes(option.value)}
                    />
                    <ListItemText primary={option.label} />
                  </MenuItem>
                )),
              ]
            ) : (
              <MenuItem disabled>
                <ListItemText
                  primary="No locations available for selected companies"
                  sx={{ fontStyle: "italic", color: "text.secondary" }}
                />
              </MenuItem>
            )}
          </Select>
        </FormControl>
      </Box>

      {/* Apply Button */}
      {showApplyButton && (
        <Button
          variant="contained"
          onClick={onApplyFilters}
          sx={{
            textTransform: "uppercase",
            fontWeight: 600,
            px: 3,
            py: 1,
          }}
        >
          Apply Filters
        </Button>
      )}
    </Box>
  );
};

export default FiltersOrderIQ;

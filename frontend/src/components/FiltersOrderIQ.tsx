import React from 'react';
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
  alpha
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';

// Filter option interface
interface FilterOption {
  value: string;
  label: string;
}

// Component props
interface FiltersOrderIQProps {
  locationOptions?: FilterOption[];
  companyOptions?: FilterOption[];
  selectedLocations?: string[];
  selectedCompanies?: string[];
  onLocationChange: (values: string[]) => void;
  onCompanyChange: (values: string[]) => void;
  onApplyFilters: () => void;
  showApplyButton?: boolean;
}

const FiltersOrderIQ: React.FC<FiltersOrderIQProps> = ({
  locationOptions = [],
  companyOptions = [],
  selectedLocations = [],
  selectedCompanies = [],
  onLocationChange,
  onCompanyChange,
  onApplyFilters,
  showApplyButton = true
}) => {
  const theme = useTheme();

  // Handle select all/none for locations
  const handleSelectAllLocations = () => {
    const allValues = locationOptions.map(option => option.value);
    
    if (selectedLocations.length === allValues.length) {
      onLocationChange([]);
    } else {
      onLocationChange(allValues);
    }
  };

  // Handle select all/none for companies
  const handleSelectAllCompanies = () => {
    const allValues = companyOptions.map(option => option.value);
    
    if (selectedCompanies.length === allValues.length) {
      onCompanyChange([]);
    } else {
      onCompanyChange(allValues);
    }
  };

  return (
    

    
    <Box sx={{ 
      p: 3, 
      border: '1px solid #e0e0e0', 
      borderRadius: 2, 
      backgroundColor: '#ffffff' 
    }}>
      
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <FilterListIcon sx={{ color: theme.palette.primary.main }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Filters
        </Typography>
      </Box>

      {/* Filter Controls */}
      <Box sx={{ 
        display: 'flex', 
        gap: 3, 
        mb: 3,
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'stretch', md: 'flex-start' }
      }}>
        {/* Location Filter */}
        <FormControl 
          sx={{ 
            minWidth: 200,
            flex: 1
          }}
        >
          <InputLabel>Location</InputLabel>
          <Select
            multiple
            value={selectedLocations}
            onChange={(event) => {
              const value = event.target.value;
              const newValues = typeof value === 'string' ? value.split(',') : value;
              onLocationChange(newValues);
            }}
            input={<OutlinedInput label="Location" />}
            renderValue={(selected) => {
              if (selected.length === 0) {
                return 'All locations';
              }
              return `${selected.length} selected`;
            }}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 300
                }
              }
            }}
          >
            {/* Select All option */}
            <MenuItem
              value=""
              onClick={(e) => {
                e.preventDefault();
                handleSelectAllLocations();
              }}
            >
              <Checkbox
                checked={selectedLocations.length === locationOptions.length}
                indeterminate={
                  selectedLocations.length > 0 && 
                  selectedLocations.length < locationOptions.length
                }
              />
              <ListItemText primary="Select All" />
            </MenuItem>
            
            {/* Individual location options */}
            {locationOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Checkbox checked={selectedLocations.includes(option.value)} />
                <ListItemText primary={option.label} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Companies Filter */}
        <FormControl 
          sx={{ 
            minWidth: 200,
            flex: 1
          }}
        >
          <InputLabel>Companies</InputLabel>
          <Select
            multiple
            value={selectedCompanies}
            onChange={(event) => {
              const value = event.target.value;
              const newValues = typeof value === 'string' ? value.split(',') : value;
              onCompanyChange(newValues);
            }}
            input={<OutlinedInput label="Companies" />}
            renderValue={(selected) => {
              if (selected.length === 0) {
                return 'All companies';
              }
              return `${selected.length} selected`;
            }}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 300
                }
              }
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
      </Box>

      {/* Apply Button */}
      {showApplyButton && (
        <Button 
          variant="contained" 
          onClick={onApplyFilters}
          sx={{ 
            textTransform: 'uppercase',
            fontWeight: 600,
            px: 3,
            py: 1
          }}
        >
          Apply Filters
        </Button>
      )}
    </Box>
  );
};

export default FiltersOrderIQ;
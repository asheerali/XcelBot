import React from 'react';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

interface FilterSectionProps {
  dateRangeType: string;
  availableDateRanges: string[];
  onDateRangeChange: (event: SelectChangeEvent) => void;
  customDateRange: boolean;
  startDate: string;
  endDate: string;
  onStartDateChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onEndDateChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  locations: string[];
  selectedLocation: string;
  onLocationChange: (event: SelectChangeEvent) => void;
  onApplyFilters: () => void;
}

/**
 * Filter Section Component 
 * Handles date range and location filtering
 */
const FilterSection: React.FC<FilterSectionProps> = ({
  dateRangeType,
  availableDateRanges,
  onDateRangeChange,
  customDateRange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  locations = [],
  selectedLocation,
  onLocationChange,
  onApplyFilters
}) => {
  return (
    <>
      {/* Date Range Selector */}
      <Grid item xs={12} md={3}>
        <FormControl fullWidth>
          <InputLabel id="date-range-select-label">Date Range</InputLabel>
          <Select
            labelId="date-range-select-label"
            id="date-range-select"
            value={dateRangeType}
            label="Date Range"
            onChange={onDateRangeChange}
            disabled={availableDateRanges.length === 0}
          >
            {availableDateRanges.map((range) => (
              <MenuItem key={range} value={range}>{range}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      
      {/* Conditional rendering of custom date range inputs */}
      {customDateRange && (
        <>
          <Grid item xs={12} md={3}>
            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={onStartDateChange}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={onEndDateChange}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
        </>
      )}
      
      {/* Location Selector - only show if we have locations */}
      {locations && locations.length > 0 && (
        <Grid item xs={12} md={customDateRange ? 3 : 3}>
          <FormControl fullWidth>
            <InputLabel id="location-select-label">Location</InputLabel>
            <Select
              labelId="location-select-label"
              id="location-select"
              value={selectedLocation}
              label="Location"
              onChange={onLocationChange}
            >
              <MenuItem value="">All Locations</MenuItem>
              {locations.map((location) => (
                <MenuItem key={location} value={location}>{location}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      )}
      
      {/* Apply button (only for custom date range) */}
      {customDateRange && (
        <Grid item xs={12} md={3}>
          <Button
            variant="contained"
            color="secondary"
            onClick={onApplyFilters}
            disabled={!startDate || !endDate}
            fullWidth
          >
            Apply Dates
          </Button>
        </Grid>
      )}
    </>
  );
};

export default FilterSection;
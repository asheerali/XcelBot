import React from 'react';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

/**
 * Filter Section Component 
 * Handles date range and location filtering
 */
const FilterSection = ({
  dateRangeType,
  availableDateRanges,
  onDateRangeChange,
  customDateRange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  locations,
  selectedLocation,
  onLocationChange,
  onApplyFilters
}) => {
  return (
    <Grid
      container
      spacing={2}
      alignItems="center"
      wrap="nowrap"           // ← added here
    >

      {/* Date Range Block - hidden until ranges exist */}
      {availableDateRanges?.length > 0 && (
        <>
          {/* Date Range Selector */}
          <Grid item xs="auto">
            <FormControl fullWidth>
              <InputLabel id="date-range-select-label">Date Range</InputLabel>
              <Select
                labelId="date-range-select-label"
                id="date-range-select"
                value={dateRangeType}
                label="Date Range"
                onChange={onDateRangeChange}
              >
                {availableDateRanges.map((range) => (
                  <MenuItem key={range} value={range}>
                    {range}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Custom Date Inputs */}
          {customDateRange && (
            <>
              <Grid item xs="auto">
                <TextField
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={onStartDateChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs="auto">
                <TextField
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={onEndDateChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </>
          )}

          {/* Apply Button */}
          {customDateRange && (
            <Grid item xs="auto">
              <Button
                variant="contained"
                color="secondary"
                onClick={onApplyFilters}
                disabled={!startDate || !endDate}
              >
                Apply Dates
              </Button>
            </Grid>
          )}
        </>
      )}

      {/* Location Selector */}
      {locations?.length > 0 && (
        <Grid item xs="auto">
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
                <MenuItem key={location} value={location}>
                  {location}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      )}

    </Grid>
  );
};

export default FilterSection;

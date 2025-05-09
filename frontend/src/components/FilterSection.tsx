import React from 'react';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { SelectChangeEvent } from '@mui/material/Select';
import { useAppDispatch, useAppSelector } from '../typedHooks';
import { selectLocation } from '../store/excelSlice';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import PlaceIcon from '@mui/icons-material/Place';

/**
 * Filter Section Component 
 * Handles date range and location filtering
 */
interface FilterSectionProps {
  dateRangeType: string;
  availableDateRanges: string[];
  onDateRangeChange: (event: SelectChangeEvent) => void;
  customDateRange: boolean;
  startDate: string;
  endDate: string;
  onStartDateChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onEndDateChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  selectedLocation: string;
  onApplyFilters: () => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  dateRangeType,
  availableDateRanges,
  onDateRangeChange,
  customDateRange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  selectedLocation,
  onApplyFilters
}) => {
  // Get all locations from Redux store
  const dispatch = useAppDispatch();
  const { allLocations, files } = useAppSelector((state) => state.excel);
  
  // Handle location change
  const handleLocationChange = (event: SelectChangeEvent) => {
    const newLocation = event.target.value;
    dispatch(selectLocation(newLocation));
    onApplyFilters(); // Apply filters after changing location
  };
  
  return (
    <Grid
      container
      spacing={2}
      alignItems="center"
      wrap="nowrap"
    >
      {/* Location Selector (Prioritized) */}
      {allLocations?.length > 0 && (
        <Grid item xs="auto">
          <FormControl fullWidth>
            <InputLabel id="location-select-label">Location</InputLabel>
            <Select
              labelId="location-select-label"
              id="location-select"
              value={selectedLocation}
              label="Location"
              onChange={handleLocationChange}
            >
              {allLocations.map((location) => (
                <MenuItem key={location} value={location}>
                  <Box display="flex" alignItems="center">
                    <PlaceIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                    {location}
                  </Box>
                </MenuItem>
              ))}
            </Select>
            <Typography variant="caption" color="text.secondary">
              {files.length} file(s) available
            </Typography>
          </FormControl>
        </Grid>
      )}

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
    </Grid>
  );
};

export default FilterSection;
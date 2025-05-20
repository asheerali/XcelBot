// FilterSection.tsx - Updated with DateRangeSelector
import React, { useState, useEffect, useRef } from 'react';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { format } from 'date-fns';

// Import icons
import FilterListIcon from '@mui/icons-material/FilterList';
import PlaceIcon from '@mui/icons-material/Place';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from '@mui/icons-material/Close';

// Import DateRangeSelector component
import DateRangeSelector from './DateRangeSelector';

// Redux imports (if needed)
import { useAppDispatch, useAppSelector } from '../typedHooks';

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

const FilterSection: React.FC<FilterSectionProps> = ({
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
  // State for dining options and employees (keeping from your original component)
  const [isDiningOpen, setIsDiningOpen] = useState(false);
  const [isEmployeeOpen, setIsEmployeeOpen] = useState(false);
  const [selectedDiningOptions, setSelectedDiningOptions] = useState<string[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  
  // New state for date range dialog
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState({
    startDate: startDate ? new Date(startDate) : new Date(),
    endDate: endDate ? new Date(endDate) : new Date(),
  });

  // DINING OPTIONS - keeping these from your original component
  const DINING_OPTIONS = [
    { group: 'Dine in', options: ['Dine In', 'Kiosk Dine-In'] },
    { group: 'Take out', options: ['Take Out', 'Online Ordering - Takeout', 'Kiosk Takeout'] },
    { group: 'Delivery', options: ['Delivery', 'Online Ordering - Delivery'] },
    { group: 'Third Party', options: [
        'DoorDash - Takeout', 'Uber Eats - Takeout', 'Grubhub - Takeout',
        'DoorDash - Delivery', 'Uber Eats - Delivery', 'Grubhub - Delivery'
      ] },
    { group: 'Other', options: ['Curbside', 'No dining option'] }
  ];

  // Sample employee names - keeping from your original component
  const EMPLOYEE_NAMES = [
    'James Smith', 'Maria Garcia', 'David Johnson', 'Lisa Williams',
    'Robert Brown', 'Sarah Miller', 'Michael Davis', 'Jennifer Wilson',
    'William Jones', 'Jessica Taylor', 'Thomas Moore', 'Emily Anderson'
  ];

  // Close handlers for dialogs
  const handleCloseDining = () => {
    setIsDiningOpen(false);
  };

  const handleCloseEmployee = () => {
    setIsEmployeeOpen(false);
  };

  const handleCloseDateRange = () => {
    setIsDateRangeOpen(false);
  };

  // Handler for dining options
  const handleDiningOptionChange = (option: string) => {
    setSelectedDiningOptions(prev => {
      if (prev.includes(option)) {
        return prev.filter(item => item !== option);
      } else {
        return [...prev, option];
      }
    });
  };

  // Handler for employee selection
  const handleEmployeeChange = (employee: string) => {
    setSelectedEmployees(prev => {
      if (prev.includes(employee)) {
        return prev.filter(item => item !== employee);
      } else {
        return [...prev, employee];
      }
    });
  };

  // Clear handlers
  const handleClearDiningOptions = () => {
    setSelectedDiningOptions([]);
  };

  const handleClearEmployees = () => {
    setSelectedEmployees([]);
  };

  // Open date range dialog
  const openDateRangePicker = () => {
    setIsDateRangeOpen(true);
  };

  // Handle date range selection from DateRangeSelector
  const handleDateRangeSelect = (range: any) => {
    setSelectedRange(range);
  };

  // Apply date range and format to MM/DD/YYYY for your backend
  const applyDateRange = () => {
    // Convert dates to MM/DD/YYYY format for your existing handlers
    const formattedStartDate = format(selectedRange.startDate, 'MM/dd/yyyy');
    const formattedEndDate = format(selectedRange.endDate, 'MM/dd/yyyy');
    
    // Create synthetic events for your existing handlers
    const startEvent = {
      target: { value: formattedStartDate }
    } as React.ChangeEvent<HTMLInputElement>;
    
    const endEvent = {
      target: { value: formattedEndDate }
    } as React.ChangeEvent<HTMLInputElement>;
    
    // Call the existing handlers
    onStartDateChange(startEvent);
    onEndDateChange(endEvent);
    
    // Set the date range type to custom
    const customEvent = {
      target: { value: 'Custom Date Range' }
    } as SelectChangeEvent;
    onDateRangeChange(customEvent);
    
    // Close the dialog
    setIsDateRangeOpen(false);
    
    // Apply filters
    onApplyFilters();
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

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'normal' }}>
        Filters
      </Typography>

      <Grid container spacing={2} alignItems="flex-start" sx={{ mb: 2 }}>
        {/* Location filter */}
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth sx={{ height: 80 }}>
            <InputLabel id="location-select-label">Location</InputLabel>
            <Select
              labelId="location-select-label"
              id="location-select"
              value={selectedLocation || ''}
              label="Location"
              onChange={onLocationChange}
              startAdornment={<PlaceIcon sx={{ mr: 1, ml: -0.5, color: 'primary.main' }} />}
              disabled={locations.length === 0}
            >
              {locations.map((location) => (
                <MenuItem key={location} value={location}>{location}</MenuItem>
              ))}
            </Select>
            <Typography variant="caption" color="text.secondary">
              Select a location
            </Typography>
          </FormControl>
        </Grid>

        {/* Date Range Button - Replaced select with button that opens dialog */}
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth sx={{ height: 80 }}>
            <Button
              variant="outlined"
              onClick={openDateRangePicker}
              startIcon={<FilterListIcon />}
              sx={{ 
                height: 56, 
                justifyContent: 'flex-start',
                textTransform: 'none',
                borderColor: 'rgba(0, 0, 0, 0.23)',
                color: 'text.primary'
              }}
            >
              {startDate && endDate ? (
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="body1" component="div">
                    {formatDisplayDate(startDate)} - {formatDisplayDate(endDate)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {dateRangeType}
                  </Typography>
                </Box>
              ) : (
                "Select Date Range"
              )}
            </Button>
            <Typography variant="caption" color="text.secondary">
              Click to select a date range
            </Typography>
          </FormControl>
        </Grid>

        {/* Dining Options - keeping from your original component */}
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth sx={{ height: 80 }}>
            <InputLabel id="dining-select-label">Dining Options</InputLabel>
            <Select
              labelId="dining-select-label"
              id="dining-select"
              value=""
              label="Dining Options"
              open={isDiningOpen}
              onOpen={() => setIsDiningOpen(true)}
              onClose={handleCloseDining}
              renderValue={() => ""}
              startAdornment={<RestaurantIcon sx={{ mr: 1, ml: -0.5, color: 'primary.main' }} />}
              endAdornment={
                selectedDiningOptions.length > 0 && (
                  <Chip
                    size="small"
                    label={selectedDiningOptions.length}
                    color="primary"
                    sx={{ mr: 2, height: 24, minWidth: 28 }}
                  />
                )
              }
            >
              {/* Your existing dining options menu */}
              {/* ... (keeping the existing code) */}
            </Select>
            <Typography variant="caption" color="text.secondary">
              {selectedDiningOptions.length} option(s) selected
            </Typography>
          </FormControl>
        </Grid>

        {/* Employees - keeping from your original component */}
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth sx={{ height: 80 }}>
            <InputLabel id="employee-select-label">Employees</InputLabel>
            <Select
              labelId="employee-select-label"
              id="employee-select"
              value=""
              label="Employees"
              open={isEmployeeOpen}
              onOpen={() => setIsEmployeeOpen(true)}
              onClose={handleCloseEmployee}
              renderValue={() => ""}
              startAdornment={<PersonIcon sx={{ mr: 1, ml: -0.5, color: 'primary.main' }} />}
              endAdornment={
                selectedEmployees.length > 0 && (
                  <Chip
                    size="small"
                    label={selectedEmployees.length}
                    color="primary"
                    sx={{ mr: 2, height: 24, minWidth: 28 }}
                  />
                )
              }
            >
              {/* Your existing employees menu */}
              {/* ... (keeping the existing code) */}
            </Select>
            <Typography variant="caption" color="text.secondary">
              {selectedEmployees.length} employee(s) selected
            </Typography>
          </FormControl>
        </Grid>

        {/* Display selected filters */}
        {(selectedDiningOptions.length > 0 || selectedEmployees.length > 0) && (
          <Grid item xs={12}>
            <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
              {selectedDiningOptions.map(option => (
                <Chip
                  key={option}
                  label={option}
                  size="small"
                  onDelete={() => handleDiningOptionChange(option)}
                  deleteIcon={<CloseIcon fontSize="small" />}
                  icon={<RestaurantIcon fontSize="small" />}
                  sx={{ background: 'rgba(25, 118, 210, 0.08)' }}
                />
              ))}
              {selectedEmployees.map(employee => (
                <Chip
                  key={employee}
                  label={employee}
                  size="small"
                  onDelete={() => handleEmployeeChange(employee)}
                  deleteIcon={<CloseIcon fontSize="small" />}
                  icon={<PersonIcon fontSize="small" />}
                  sx={{ background: 'rgba(25, 118, 210, 0.08)' }}
                />
              ))}
            </Box>
          </Grid>
        )}

        {/* Apply Filters Button */}
        <Grid item xs={12}>
          <Button 
            variant="contained" 
            color="primary"
            onClick={onApplyFilters}
            sx={{ mt: 1 }}
          >
            Apply Filters
          </Button>
        </Grid>
      </Grid>

      {/* Date Range Picker Dialog */}
      <Dialog
        open={isDateRangeOpen}
        onClose={handleCloseDateRange}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Select Date Range</DialogTitle>
        <DialogContent>
          <DateRangeSelector
            initialState={[
              {
                startDate: startDate ? new Date(startDate) : new Date(),
                endDate: endDate ? new Date(endDate) : new Date(),
                key: 'selection'
              }
            ]}
            onSelect={handleDateRangeSelect}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDateRange}>Cancel</Button>
          <Button onClick={applyDateRange} variant="contained" color="primary">
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FilterSection;
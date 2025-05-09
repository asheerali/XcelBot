import React, { useState } from 'react';
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
import FilterListIcon from '@mui/icons-material/FilterList';
import PersonIcon from '@mui/icons-material/Person';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import Popover from '@mui/material/Popover';
import Paper from '@mui/material/Paper';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import Badge from '@mui/material/Badge';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

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

// Sample dining options matching the image
const DINING_OPTIONS = [
  { group: 'Dine in', options: ['Dine In', 'Kiosk Dine-In'] },
  { group: 'Take out', options: ['Take Out', 'Online Ordering - Takeout', 'Kiosk Takeout'] },
  { group: 'Delivery', options: ['Delivery', 'Online Ordering - Delivery'] },
  { group: 'Third Party', options: [
    'DoorDash - Takeout', 'Uber Eats - Takeout', 'Grubhub - Takeout',
    'DoorDash - Delivery', 'Uber Eats - Delivery', 'Grubhub - Delivery'
  ]},
  { group: 'Other', options: ['Curbside', 'No dining option'] }
];

// Sample employee names
const EMPLOYEE_NAMES = [
  'James Smith', 'Maria Garcia', 'David Johnson', 'Lisa Williams', 
  'Robert Brown', 'Sarah Miller', 'Michael Davis', 'Jennifer Wilson',
  'William Jones', 'Jessica Taylor', 'Thomas Moore', 'Emily Anderson'
];

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
  
  // State for filter popovers
  const [isDiningOpen, setIsDiningOpen] = useState(false);
  const [isEmployeeOpen, setIsEmployeeOpen] = useState(false);
  
  // State for selected filters
  const [selectedDiningOptions, setSelectedDiningOptions] = useState<string[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  
  // Handle location change
  const handleLocationChange = (event: SelectChangeEvent) => {
    const newLocation = event.target.value;
    dispatch(selectLocation(newLocation));
    onApplyFilters(); // Apply filters after changing location
  };
  
  // Handle dining options filter button click
  const handleDiningFilterClick = () => {
    setIsDiningOpen(true);
  };
  
  // Handle employee filter button click
  const handleEmployeeFilterClick = () => {
    setIsEmployeeOpen(true);
  };
  
  // Handle closing popovers
  const handleCloseDining = () => {
    setIsDiningOpen(false);
  };
  
  const handleCloseEmployee = () => {
    setIsEmployeeOpen(false);
  };
  
  // Handle dining option checkbox changes
  const handleDiningOptionChange = (option: string) => {
    setSelectedDiningOptions(prev => {
      if (prev.includes(option)) {
        return prev.filter(item => item !== option);
      } else {
        return [...prev, option];
      }
    });
  };
  
  // Handle employee checkbox changes
  const handleEmployeeChange = (employee: string) => {
    setSelectedEmployees(prev => {
      if (prev.includes(employee)) {
        return prev.filter(item => item !== employee);
      } else {
        return [...prev, employee];
      }
    });
  };
  
  // Handle clearing all dining options
  const handleClearDiningOptions = () => {
    setSelectedDiningOptions([]);
  };
  
  // Handle clearing all employees
  const handleClearEmployees = () => {
    setSelectedEmployees([]);
  };
  
  // Whether popovers are open - fix to avoid boolean of boolean
  
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'normal' }}>
        Current file: temp.xlsx (Location: {selectedLocation})
      </Typography>
    
      <Grid
        container
        spacing={2}
        alignItems="flex-start"
        sx={{ mb: 2 }}
      >
      {/* Location Selector (Prioritized) */}
      <Grid item xs={12} sm={3}>
        <FormControl fullWidth sx={{ height: 80 }}>
          <InputLabel id="location-select-label">Location</InputLabel>
          <Select
            labelId="location-select-label"
            id="location-select"
            value={selectedLocation}
            label="Location"
            onChange={handleLocationChange}
            startAdornment={<PlaceIcon sx={{ mr: 1, ml: -0.5, color: 'primary.main' }} />}
          >
            {allLocations.map((location) => (
              <MenuItem key={location} value={location}>
                {location}
              </MenuItem>
            ))}
          </Select>
          <Typography variant="caption" color="text.secondary">
            {files.length} file(s) available
          </Typography>
        </FormControl>
      </Grid>

      {/* Date Range Block */}
      <Grid item xs={12} sm={3}>
        <FormControl fullWidth sx={{ height: 80 }}>
          <InputLabel id="date-range-select-label">Date Range</InputLabel>
          <Select
            labelId="date-range-select-label"
            id="date-range-select"
            value={dateRangeType}
            label="Date Range"
            onChange={onDateRangeChange}
            startAdornment={<FilterListIcon sx={{ mr: 1, ml: -0.5, color: 'primary.main' }} />}
          >
            {availableDateRanges.map((range) => (
              <MenuItem key={range} value={range}>
                {range}
              </MenuItem>
            ))}
          </Select>
          <Box height={20} />
        </FormControl>
      </Grid>

      {/* Dining Options Filter */}
      <Grid item xs={12} sm={3}>
        <FormControl fullWidth sx={{ height: 80 }}>
          <InputLabel id="dining-select-label">Dining Options</InputLabel>
          <Select
            labelId="dining-select-label"
            id="dining-select"
            value=""
            label="Dining Options"
            open={isDiningOpen}
            onOpen={handleDiningFilterClick}
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
            <Box sx={{ p: 2, width: 280 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Dining Options
                </Typography>
                {selectedDiningOptions.length > 0 && (
                  <Button 
                    size="small" 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      handleClearDiningOptions(); 
                    }}
                    color="inherit"
                    sx={{ fontSize: '0.75rem' }}
                  >
                    Clear All ({selectedDiningOptions.length})
                  </Button>
                )}
              </Box>

              {DINING_OPTIONS.map((group, index) => (
                <Box key={group.group} mb={1}>
                  <Typography 
                    variant="subtitle2" 
                    fontWeight="bold" 
                    color="text.secondary"
                    sx={{ mb: 0.5 }}
                  >
                    {group.group}
                  </Typography>
                  <FormGroup onClick={(e) => e.stopPropagation()}>
                    {group.options.map(option => (
                      <FormControlLabel
                        key={option}
                        control={
                          <Checkbox
                            checked={selectedDiningOptions.includes(option)}
                            onChange={() => handleDiningOptionChange(option)}
                            size="small"
                          />
                        }
                        label={<Typography variant="body2">{option}</Typography>}
                      />
                    ))}
                  </FormGroup>
                  {index < DINING_OPTIONS.length - 1 && <Divider sx={{ my: 1 }} />}
                </Box>
              ))}
              
              <Box mt={2} display="flex" justifyContent="flex-end">
                <Button 
                  variant="contained" 
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCloseDining();
                  }}
                >
                  Apply
                </Button>
              </Box>
            </Box>
          </Select>
          <Typography variant="caption" color="text.secondary">
            {selectedDiningOptions.length} option(s) selected
          </Typography>
        </FormControl>
      </Grid>

      {/* Employee Filter */}
      <Grid item xs={12} sm={3}>
        <FormControl fullWidth sx={{ height: 80 }}>
          <InputLabel id="employee-select-label">Employees</InputLabel>
          <Select
            labelId="employee-select-label"
            id="employee-select"
            value=""
            label="Employees"
            open={isEmployeeOpen}
            onOpen={handleEmployeeFilterClick}
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
            <Box sx={{ p: 2, width: 250 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Employees
                </Typography>
                {selectedEmployees.length > 0 && (
                  <Button 
                    size="small" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClearEmployees();
                    }}
                    color="inherit"
                    sx={{ fontSize: '0.75rem' }}
                  >
                    Clear All ({selectedEmployees.length})
                  </Button>
                )}
              </Box>
              
              <TextField
                placeholder="Search employees..."
                variant="outlined"
                size="small"
                fullWidth
                sx={{ mb: 2 }}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              />
              
              <FormGroup onClick={(e) => e.stopPropagation()}>
                {EMPLOYEE_NAMES.map(employee => (
                  <FormControlLabel
                    key={employee}
                    control={
                      <Checkbox
                        checked={selectedEmployees.includes(employee)}
                        onChange={() => handleEmployeeChange(employee)}
                        size="small"
                      />
                    }
                    label={<Typography variant="body2">{employee}</Typography>}
                  />
                ))}
              </FormGroup>
              
              <Box mt={2} display="flex" justifyContent="flex-end">
                <Button 
                  variant="contained" 
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCloseEmployee();
                  }}
                >
                  Apply
                </Button>
              </Box>
            </Box>
          </Select>
          <Typography variant="caption" color="text.secondary">
            {selectedEmployees.length} employee(s) selected
          </Typography>
        </FormControl>
      </Grid>

      {/* Custom Date Range - only shown when needed */}
      {customDateRange && (
        <>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={onStartDateChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
              sx={{ height: 56 }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={onEndDateChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
              sx={{ height: 56 }}
            />
          </Grid>
          <Grid item xs={12} sm={12} md={6}>
            <Button
              variant="contained"
              color="primary"
              onClick={onApplyFilters}
              disabled={!startDate || !endDate}
              sx={{ height: 56, width: '100%' }}
            >
              Apply Filters
            </Button>
          </Grid>
        </>
      )}

      {/* Popovers are now integrated into the Select components */}

      {/* Selected Filter Chips */}
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
      </Grid>
    </Box>
  );
};

export default FilterSection;
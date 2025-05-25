// FilterSection.tsx - Updated with dynamic categories from Redux state
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
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import { format } from 'date-fns';

// Import icons
import FilterListIcon from '@mui/icons-material/FilterList';
import PlaceIcon from '@mui/icons-material/Place';
import CategoryIcon from '@mui/icons-material/Category';
import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from '@mui/icons-material/Close';

// Import DateRangeSelector component
import DateRangeSelector from './DateRangeSelector';

// Redux imports
import { useAppDispatch, useAppSelector } from '../typedHooks';
import { 
  selectSalesCategories, 
  selectAllCategories,
  updateSalesFilters
} from '../store/excelSlice';

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
  // Optional: Allow parent to override which categories to use
  categoriesOverride?: string[];
  // Optional: Dashboard type to determine which categories to use
  dashboardType?: 'Sales Split' | 'Financials' | 'Sales Wide' | 'Product Mix';
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
  onApplyFilters,
  categoriesOverride,
  dashboardType = 'Sales Split'
}) => {
  const dispatch = useAppDispatch();
  
  // Get categories from Redux state based on dashboard type
  const salesCategories = useAppSelector(selectSalesCategories);
  const allCategories = useAppSelector(selectAllCategories);
  const salesFilters = useAppSelector(state => state.excel.salesFilters);
  
  // Determine which categories to use
  const getCategoriesToUse = () => {
    if (categoriesOverride) {
      return categoriesOverride;
    }
    
    switch (dashboardType) {
      case 'Sales Split':
        return salesCategories.length > 0 ? salesCategories : [];
      case 'Financials':
        return useAppSelector(state => state.excel.financialCategories);
      case 'Sales Wide':
        return useAppSelector(state => state.excel.salesWideCategories);
      case 'Product Mix':
        return useAppSelector(state => state.excel.productMixCategories);
      default:
        return allCategories;
    }
  };

  const availableCategories = getCategoriesToUse();
  
  // Filter out common non-category fields and system fields
  const filterCategories = (categories: string[]) => {
    const excludeFields = [
      'dashboardName', 'fileLocation', 'data', 'uploadDate', 'fileName', 
      'location', 'locations', 'dateRanges', 'Week', 'week', 'Grand Total',
      'store', 'Store', 'id', 'ID', 'index', 'key'
    ];
    
    return categories.filter(category => 
      category && 
      typeof category === 'string' && 
      category.trim() !== '' &&
      !excludeFields.includes(category) &&
      !category.toLowerCase().includes('total') &&
      !category.toLowerCase().includes('grand')
    );
  };

  const filteredCategories = filterCategories(availableCategories);
  
  // State for category options and employees
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isEmployeeOpen, setIsEmployeeOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    salesFilters.selectedCategories || []
  );
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  
  // New state for date range dialog
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState({
    startDate: startDate ? new Date(startDate) : new Date(),
    endDate: endDate ? new Date(endDate) : new Date(),
  });

  // Sample employee names - you can replace this with actual employee data from your backend
  const EMPLOYEE_NAMES = [
    'James Smith', 'Maria Garcia', 'David Johnson', 'Lisa Williams',
    'Robert Brown', 'Sarah Miller', 'Michael Davis', 'Jennifer Wilson',
    'William Jones', 'Jessica Taylor', 'Thomas Moore', 'Emily Anderson'
  ];

  // Update local state when Redux filters change
  useEffect(() => {
    setSelectedCategories(salesFilters.selectedCategories || []);
  }, [salesFilters.selectedCategories]);

  // Close handlers for dialogs
  const handleCloseCategory = () => {
    setIsCategoryOpen(false);
  };

  const handleCloseEmployee = () => {
    setIsEmployeeOpen(false);
  };

  const handleCloseDateRange = () => {
    setIsDateRangeOpen(false);
  };

  // Handler for category options
  const handleCategoryChange = (event: SelectChangeEvent<string[]>) => {
    const value = typeof event.target.value === 'string' 
      ? event.target.value.split(',') 
      : event.target.value;
    
    setSelectedCategories(value);
    
    // Update Redux state
    dispatch(updateSalesFilters({ selectedCategories: value }));
  };

  // Handler for individual category selection (for checkbox interface)
  const handleCategoryToggle = (category: string) => {
    const newSelection = selectedCategories.includes(category)
      ? selectedCategories.filter(item => item !== category)
      : [...selectedCategories, category];
    
    setSelectedCategories(newSelection);
    dispatch(updateSalesFilters({ selectedCategories: newSelection }));
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
  const handleClearCategories = () => {
    setSelectedCategories([]);
    dispatch(updateSalesFilters({ selectedCategories: [] }));
  };

  const handleClearEmployees = () => {
    setSelectedEmployees([]);
  };

  // Select all categories
  const handleSelectAllCategories = () => {
    setSelectedCategories(filteredCategories);
    dispatch(updateSalesFilters({ selectedCategories: filteredCategories }));
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

  // Enhanced apply filters to include selected categories
  const handleApplyFilters = () => {
    // Update Redux state with current selections
    dispatch(updateSalesFilters({ 
      selectedCategories: selectedCategories,
      location: selectedLocation,
      dateRangeType: dateRangeType,
      startDate: startDate,
      endDate: endDate
    }));
    
    // Call the parent's apply filters function
    onApplyFilters();
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

        {/* Date Range Button */}
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

        {/* Categories Filter - Dynamic from backend */}
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth sx={{ height: 80 }}>
            <InputLabel id="category-select-label">Categories</InputLabel>
            <Select
              labelId="category-select-label"
              id="category-select"
              multiple
              value={selectedCategories}
              onChange={handleCategoryChange}
              label="Categories"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.length > 2 ? (
                    <Chip size="small" label={`${selected.length} selected`} />
                  ) : (
                    selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))
                  )}
                </Box>
              )}
              startAdornment={<CategoryIcon sx={{ mr: 1, ml: -0.5, color: 'primary.main' }} />}
              disabled={filteredCategories.length === 0}
            >
              {/* Select All option */}
              <MenuItem value="select-all" onClick={handleSelectAllCategories}>
                <Checkbox checked={selectedCategories.length === filteredCategories.length} />
                <ListItemText primary="Select All" />
              </MenuItem>
              
              {/* Clear All option */}
              <MenuItem value="clear-all" onClick={handleClearCategories}>
                <ListItemText primary="Clear All" />
              </MenuItem>
              
              {/* Divider */}
              <MenuItem disabled>
                <Typography variant="caption" color="text.secondary">
                  Available Categories:
                </Typography>
              </MenuItem>
              
              {/* Category options */}
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <MenuItem key={category} value={category}>
                    <Checkbox checked={selectedCategories.includes(category)} />
                    <ListItemText primary={category} />
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>
                  <ListItemText 
                    primary="No categories available" 
                    secondary="Upload a file to see categories"
                  />
                </MenuItem>
              )}
            </Select>
            <Typography variant="caption" color="text.secondary">
              {selectedCategories.length} of {filteredCategories.length} selected
            </Typography>
          </FormControl>
        </Grid>

        {/* Employees Filter */}
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
              {EMPLOYEE_NAMES.map((employee) => (
                <MenuItem key={employee} onClick={() => handleEmployeeChange(employee)}>
                  <Checkbox checked={selectedEmployees.includes(employee)} />
                  <ListItemText primary={employee} />
                </MenuItem>
              ))}
            </Select>
            <Typography variant="caption" color="text.secondary">
              {selectedEmployees.length} employee(s) selected
            </Typography>
          </FormControl>
        </Grid>

        {/* Display selected filters */}
        {(selectedCategories.length > 0 || selectedEmployees.length > 0) && (
          <Grid item xs={12}>
            <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
              {/* Category chips */}
              {selectedCategories.map(category => (
                <Chip
                  key={category}
                  label={category}
                  size="small"
                  onDelete={() => handleCategoryToggle(category)}
                  deleteIcon={<CloseIcon fontSize="small" />}
                  icon={<CategoryIcon fontSize="small" />}
                  sx={{ background: 'rgba(25, 118, 210, 0.08)' }}
                />
              ))}
              
              {/* Employee chips */}
              {selectedEmployees.map(employee => (
                <Chip
                  key={employee}
                  label={employee}
                  size="small"
                  onDelete={() => handleEmployeeChange(employee)}
                  deleteIcon={<CloseIcon fontSize="small" />}
                  icon={<PersonIcon fontSize="small" />}
                  sx={{ background: 'rgba(76, 175, 80, 0.08)' }}
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
            onClick={handleApplyFilters}
            sx={{ mt: 1 }}
          >
            Apply Filters ({selectedCategories.length + selectedEmployees.length} active)
          </Button>
          
          {/* Clear all filters button */}
          {(selectedCategories.length > 0 || selectedEmployees.length > 0) && (
            <Button 
              variant="outlined" 
              color="secondary"
              onClick={() => {
                handleClearCategories();
                handleClearEmployees();
              }}
              sx={{ mt: 1, ml: 1 }}
            >
              Clear All Filters
            </Button>
          )}
        </Grid>
      </Grid>

      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="caption" display="block">
            Debug Info:
          </Typography>
          <Typography variant="caption" display="block">
            Available Categories ({filteredCategories.length}): {filteredCategories.join(', ')}
          </Typography>
          <Typography variant="caption" display="block">
            Selected Categories ({selectedCategories.length}): {selectedCategories.join(', ')}
          </Typography>
          <Typography variant="caption" display="block">
            Dashboard Type: {dashboardType}
          </Typography>
        </Box>
      )}

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
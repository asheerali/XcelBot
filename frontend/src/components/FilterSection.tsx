// FilterSection.tsx - Updated with default date range and "All" dining options functionality
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  SelectChangeEvent
} from '@mui/material';
import { format } from 'date-fns';

// Import icons
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import PlaceIcon from '@mui/icons-material/Place';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CategoryIcon from '@mui/icons-material/Category';
import CloseIcon from '@mui/icons-material/Close';

// Import DateRangeSelector component
import DateRangeSelector from './DateRangeSelector';

// Redux imports
import { useAppDispatch, useAppSelector } from '../typedHooks';
import { 
  selectSalesCategories, 
  selectAllCategories,
  selectFinancialCategories,
  selectSalesWideCategories,
  selectProductMixCategories,
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
  categoriesOverride?: string[];
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
  const financialCategories = useAppSelector(selectFinancialCategories);
  const salesWideCategories = useAppSelector(selectSalesWideCategories);
  const productMixCategories = useAppSelector(selectProductMixCategories);
  const salesFilters = useAppSelector(state => state.excel.salesFilters);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Default date range: 1/1/2010 to 1/1/2025
  const DEFAULT_START_DATE = new Date(2010, 0, 1); // January 1, 2010
  const DEFAULT_END_DATE = new Date(2025, 0, 1);   // January 1, 2025
  
  // Determine which categories to use
  const availableCategories = React.useMemo(() => {
    if (categoriesOverride) {
      return categoriesOverride;
    }
    
    switch (dashboardType) {
      case 'Sales Split':
        return salesCategories.length > 0 ? salesCategories : [];
      case 'Financials':
        return financialCategories.length > 0 ? financialCategories : [];
      case 'Sales Wide':
        return salesWideCategories.length > 0 ? salesWideCategories : [];
      case 'Product Mix':
        return productMixCategories.length > 0 ? productMixCategories : [];
      default:
        return allCategories;
    }
  }, [categoriesOverride, dashboardType, salesCategories, financialCategories, salesWideCategories, productMixCategories, allCategories]);
  
  // Filter out common non-category fields and system fields
  const filterCategories = React.useCallback((categories: string[]) => {
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
  }, []);

  const filteredCategories = React.useMemo(() => 
    filterCategories(availableCategories), 
    [availableCategories, filterCategories]
  );
  
  // State for category selection - Initialize with all categories selected by default
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // State for date range
  const [localStartDate, setLocalStartDate] = useState<string>(
    startDate || format(DEFAULT_START_DATE, 'MM/dd/yyyy')
  );
  const [localEndDate, setLocalEndDate] = useState<string>(
    endDate || format(DEFAULT_END_DATE, 'MM/dd/yyyy')
  );
  
  // State for date range dialog
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState({
    startDate: startDate ? new Date(startDate) : DEFAULT_START_DATE,
    endDate: endDate ? new Date(endDate) : DEFAULT_END_DATE,
  });

  // Initialize with default date range and all categories selected
  useEffect(() => {
    // Set default dates if not already set
    if (!startDate) {
      setLocalStartDate(format(DEFAULT_START_DATE, 'MM/dd/yyyy'));
    }
    if (!endDate) {
      setLocalEndDate(format(DEFAULT_END_DATE, 'MM/dd/yyyy'));
    }
  }, [startDate, endDate]);

  // Update local state when Redux filters change or when categories become available
  useEffect(() => {
    if (salesFilters.selectedCategories && salesFilters.selectedCategories.length > 0) {
      setSelectedCategories(salesFilters.selectedCategories);
    } else if (filteredCategories.length > 0) {
      // Select all categories by default when they become available
      console.log('🎯 FilterSection: Setting all categories as default selection:', filteredCategories);
      setSelectedCategories(filteredCategories);
      dispatch(updateSalesFilters({ selectedCategories: filteredCategories }));
    }
  }, [salesFilters.selectedCategories, filteredCategories, dispatch]);

  // Inject the rotating animation styles for the refresh icon
  React.useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      @keyframes rotating {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .rotating {
        animation: rotating 2s linear infinite;
      }
    `;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Handler for category options
  const handleCategoryChange = (event: SelectChangeEvent<string[]>) => {
    const value = typeof event.target.value === 'string' 
      ? event.target.value.split(',') 
      : event.target.value;
    
    console.log('🏷️ FilterSection: Category selection changed:', {
      previousSelection: selectedCategories,
      newSelection: value,
      availableCategories: filteredCategories
    });
    
    setSelectedCategories(value);
    dispatch(updateSalesFilters({ selectedCategories: value }));
  };

  // Handler for "All" option in dining categories
  const handleSelectAllCategories = () => {
    const isAllSelected = selectedCategories.length === filteredCategories.length;
    const newSelection = isAllSelected ? [] : filteredCategories;
    
    console.log('✅ FilterSection: Toggle all categories:', {
      wasAllSelected: isAllSelected,
      newSelection
    });
    
    setSelectedCategories(newSelection);
    dispatch(updateSalesFilters({ selectedCategories: newSelection }));
  };

  // Handler for individual category selection (for checkbox interface)
  const handleCategoryToggle = (category: string) => {
    const newSelection = selectedCategories.includes(category)
      ? selectedCategories.filter(item => item !== category)
      : [...selectedCategories, category];
    
    console.log('🔄 FilterSection: Category toggled:', {
      category,
      action: selectedCategories.includes(category) ? 'removed' : 'added',
      newSelection
    });
    
    setSelectedCategories(newSelection);
    dispatch(updateSalesFilters({ selectedCategories: newSelection }));
  };

  // Clear handlers
  const handleClearCategories = () => {
    console.log('🧹 FilterSection: Clearing all categories');
    setSelectedCategories([]);
    dispatch(updateSalesFilters({ selectedCategories: [] }));
  };

  // Handle refresh - simulate data loading
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onApplyFilters();
    }, 1500);
  };

  // Open date range dialog
  const openDateRangePicker = () => {
    setIsDateRangeOpen(true);
  };

  // Handle date range selection from DateRangeSelector
  const handleDateRangeSelect = (range: any) => {
    setSelectedRange(range);
  };

  // Apply date range - ONLY sets the date range locally, doesn't send to backend
  const applyDateRange = () => {
    const formattedStartDate = format(selectedRange.startDate, 'MM/dd/yyyy');
    const formattedEndDate = format(selectedRange.endDate, 'MM/dd/yyyy');
    
    console.log('📅 FilterSection: Setting date range locally:', {
      startDate: formattedStartDate,
      endDate: formattedEndDate
    });
    
    // Update local state only
    setLocalStartDate(formattedStartDate);
    setLocalEndDate(formattedEndDate);
    
    // Update Redux state for persistence
    dispatch(updateSalesFilters({ 
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      dateRangeType: 'Custom Date Range'
    }));
    
    setIsDateRangeOpen(false);
    
    // Note: We don't call onApplyFilters here - user needs to click "Apply Filters" button
    console.log('📅 Date range set. User must click "Apply Filters" to send to backend.');
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

  // Enhanced apply filters - sends data to backend with all current filter states
  const handleApplyFilters = () => {
    console.log('🎯 FilterSection: Applying filters to backend with:', {
      selectedCategories,
      filteredCategories,
      selectedLocation,
      dateRangeType: 'Custom Date Range',
      startDate: localStartDate,
      endDate: localEndDate
    });

    // Update Redux state with current selections
    dispatch(updateSalesFilters({ 
      selectedCategories: selectedCategories,
      location: selectedLocation,
      dateRangeType: 'Custom Date Range',
      startDate: localStartDate,
      endDate: localEndDate
    }));
    
    // Create synthetic events to update parent component state before calling API
    const startEvent = {
      target: { value: localStartDate }
    } as React.ChangeEvent<HTMLInputElement>;
    
    const endEvent = {
      target: { value: localEndDate }
    } as React.ChangeEvent<HTMLInputElement>;
    
    const dateRangeEvent = {
      target: { value: 'Custom Date Range' }
    } as SelectChangeEvent;
    
    // Update parent component state
    onStartDateChange(startEvent);
    onEndDateChange(endEvent);
    onDateRangeChange(dateRangeEvent);
    
    // Call the parent's apply filters function to send to backend
    onApplyFilters();
  };

  // Check if all categories are selected
  const isAllCategoriesSelected = selectedCategories.length === filteredCategories.length && filteredCategories.length > 0;

  return (
    <Grid elevation={3} sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterListIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              Filters
            </Typography>
          </Box>
          <Button 
            variant="outlined" 
            size="small" 
            color="primary"
            disabled={isLoading}
            onClick={handleRefresh}
            startIcon={isLoading ? <RefreshIcon className="rotating" /> : <RefreshIcon />}
          >
            {isLoading ? 'Loading...' : 'Refresh Data'}
          </Button>
        </Box>

        <Grid container spacing={2}>
          {/* Location filter */}
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="location-select-label">Location</InputLabel>
              <Select
                labelId="location-select-label"
                id="location-select"
                value={selectedLocation || ''}
                label="Location"
                onChange={onLocationChange}
                startAdornment={<PlaceIcon sx={{ mr: 1, ml: -0.5, color: 'primary.light' }} />}
                disabled={locations.length === 0}
              >
                {locations.map((location) => (
                  <MenuItem key={location} value={location}>{location}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Date Range Button */}
          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="outlined"
              onClick={openDateRangePicker}
              startIcon={<CalendarTodayIcon />}
              fullWidth
              sx={{ 
                height: 40, 
                justifyContent: 'flex-start',
                textTransform: 'none',
                borderColor: 'rgba(0, 0, 0, 0.23)',
                color: 'text.primary',
                '&:hover': {
                  borderColor: 'primary.main',
                }
              }}
            >
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="body2" component="div">
                  {formatDisplayDate(localStartDate)} - {formatDisplayDate(localEndDate)}
                </Typography>
              </Box>
            </Button>
          </Grid>

          {/* Dining Options Filter with "All" option */}
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="category-select-label">Dining Options</InputLabel>
              <Select
                labelId="category-select-label"
                id="category-select"
                multiple
                value={selectedCategories}
                onChange={handleCategoryChange}
                label="Dining Options"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.length === filteredCategories.length && filteredCategories.length > 0 ? (
                      <Chip size="small" label="All" color="primary" />
                    ) : selected.length > 2 ? (
                      <Chip size="small" label={`${selected.length} selected`} />
                    ) : (
                      selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))
                    )}
                  </Box>
                )}
                startAdornment={<CategoryIcon sx={{ mr: 1, ml: -0.5, color: 'primary.light' }} />}
                disabled={filteredCategories.length === 0}
              >
                {/* "All" option */}
                {filteredCategories.length > 0 && (
                  <MenuItem value="all" onClick={(e) => {
                    e.preventDefault();
                    handleSelectAllCategories();
                  }}>
                    <Checkbox 
                      checked={isAllCategoriesSelected}
                      indeterminate={selectedCategories.length > 0 && selectedCategories.length < filteredCategories.length}
                    />
                    <ListItemText 
                      primary="All" 
                      sx={{ fontWeight: 'bold' }}
                    />
                  </MenuItem>
                )}
                
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
                      primary="No dining options available" 
                      secondary="Upload a file to see available options"
                    />
                  </MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Active filters display */}
        {(selectedLocation || selectedCategories.length > 0 || (localStartDate && localEndDate)) && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Active Filters:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {selectedLocation && (
                <Chip 
                  label={`Location: ${selectedLocation}`} 
                  color="primary" 
                  variant="outlined" 
                  size="small" 
                  icon={<PlaceIcon />} 
                  onDelete={() => {
                    const event = { target: { value: '' } } as SelectChangeEvent;
                    onLocationChange(event);
                  }}
                />
              )}
              
              <Chip 
                label={`Date Range: ${formatDisplayDate(localStartDate)} - ${formatDisplayDate(localEndDate)}`} 
                color="secondary" 
                variant="outlined" 
                size="small" 
                icon={<CalendarTodayIcon />} 
                onDelete={() => {
                  setLocalStartDate(format(DEFAULT_START_DATE, 'MM/dd/yyyy'));
                  setLocalEndDate(format(DEFAULT_END_DATE, 'MM/dd/yyyy'));
                }}
              />
              
              {selectedCategories.length > 0 && (
                <Chip 
                  label={
                    isAllCategoriesSelected 
                      ? 'Dining: All' 
                      : selectedCategories.length === 1 
                        ? `Dining: ${selectedCategories[0]}` 
                        : `Dining: ${selectedCategories.length} selected`
                  } 
                  color="error" 
                  variant="outlined" 
                  size="small" 
                  icon={<CategoryIcon />} 
                  onDelete={handleClearCategories}
                />
              )}
            </Box>
          </Box>
        )}

        {/* Apply Filters Button */}
        <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleApplyFilters}
            disabled={locations.length === 0}
            sx={{ px: 3 }}
          >
            Apply Filters 
          </Button>
          
          {/* Clear all filters button */}
          {(selectedLocation || selectedCategories.length > 0) && (
            <Button 
              variant="outlined" 
              color="secondary"
              onClick={() => {
                handleClearCategories();
                const locationEvent = { target: { value: '' } } as SelectChangeEvent;
                onLocationChange(locationEvent);
                setLocalStartDate(format(DEFAULT_START_DATE, 'MM/dd/yyyy'));
                setLocalEndDate(format(DEFAULT_END_DATE, 'MM/dd/yyyy'));
              }}
            >
              Clear All Filters
            </Button>
          )}
        </Box>
        
    
      </CardContent>

      {/* Date Range Picker Dialog */}
      <Dialog
        open={isDateRangeOpen}
        onClose={() => setIsDateRangeOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Select Date Range</DialogTitle>
        <DialogContent>
          <DateRangeSelector
            initialState={[
              {
                startDate: localStartDate ? new Date(localStartDate) : DEFAULT_START_DATE,
                endDate: localEndDate ? new Date(localEndDate) : DEFAULT_END_DATE,
                key: 'selection'
              }
            ]}
            onSelect={handleDateRangeSelect}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDateRangeOpen(false)}>Cancel</Button>
          <Button onClick={applyDateRange} variant="contained" color="primary">
            Set Date Range
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default FilterSection;
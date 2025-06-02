// FilterSection.tsx - Fixed alignment and removed card wrapper

import React, { useState, useEffect } from 'react';
import {
  Box,
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
  SelectChangeEvent,
  TextField,
  Popover,
  IconButton
} from '@mui/material';
import { format } from 'date-fns';

// Import icons
import FilterListIcon from '@mui/icons-material/FilterList';
import PlaceIcon from '@mui/icons-material/Place';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CategoryIcon from '@mui/icons-material/Category';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

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
  // NEW: Add a callback that accepts explicit date values
  onApplyFiltersWithDates?: (startDate: string, endDate: string, categories: string[]) => void;
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
  onApplyFiltersWithDates, // NEW prop
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
  
  // State for category selection
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // State for category dropdown
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [categoryAnchorEl, setCategoryAnchorEl] = useState<null | HTMLElement>(null);
  const [categorySearchText, setCategorySearchText] = useState('');
  
  // Filtered categories based on search
  const filteredCategoriesForSearch = React.useMemo(() => {
    if (!categorySearchText) return filteredCategories;
    return filteredCategories.filter(category =>
      category.toLowerCase().includes(categorySearchText.toLowerCase())
    );
  }, [filteredCategories, categorySearchText]);
  
  // State for date range - LOCAL state that we manage directly
  const [localStartDate, setLocalStartDate] = useState<string>(startDate || '');
  const [localEndDate, setLocalEndDate] = useState<string>(endDate || '');
  
  // State for date range dialog
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState({
    startDate: startDate ? new Date(startDate) : new Date(),
    endDate: endDate ? new Date(endDate) : new Date(),
  });

  // Update local date state when props change
  useEffect(() => {
    setLocalStartDate(startDate || '');
    setLocalEndDate(endDate || '');
  }, [startDate, endDate]);

  // Update local state when Redux filters change - no auto-selection
  useEffect(() => {
    if (salesFilters.selectedCategories && salesFilters.selectedCategories.length > 0) {
      setSelectedCategories(salesFilters.selectedCategories);
    }
    // Removed auto-selection of all categories when they become available
  }, [salesFilters.selectedCategories]);

  // Handler for "All" option in dining categories
  const handleSelectAllCategories = () => {
    const isAllSelected = selectedCategories.length === filteredCategoriesForSearch.length && filteredCategoriesForSearch.length > 0;
    const newSelection = isAllSelected ? [] : filteredCategoriesForSearch;
    
    setSelectedCategories(newSelection);
    dispatch(updateSalesFilters({ selectedCategories: newSelection }));
  };

  // Handler for individual category selection
  const handleCategoryToggle = (category: string) => {
    const newSelection = selectedCategories.includes(category)
      ? selectedCategories.filter(item => item !== category)
      : [...selectedCategories, category];
    
    setSelectedCategories(newSelection);
    dispatch(updateSalesFilters({ selectedCategories: newSelection }));
  };

  // Category dropdown handlers
  const handleCategoryDropdownOpen = (event: React.MouseEvent<HTMLElement>) => {
    setCategoryAnchorEl(event.currentTarget);
    setCategoryDropdownOpen(true);
    setCategorySearchText('');
  };

  const handleCategoryDropdownClose = () => {
    setCategoryDropdownOpen(false);
    setCategoryAnchorEl(null);
    setCategorySearchText('');
  };

  // Clear handlers
  const handleClearCategories = () => {
    setSelectedCategories([]);
    dispatch(updateSalesFilters({ selectedCategories: [] }));
  };

  // Open date range dialog
  const openDateRangePicker = () => {
    setIsDateRangeOpen(true);
  };

  // Handle date range selection from DateRangeSelector
  const handleDateRangeSelect = (range: any) => {
    setSelectedRange(range);
  };

  // Apply date range - sets the date range locally
  const applyDateRange = () => {
    const formattedStartDate = format(selectedRange.startDate, 'MM/dd/yyyy');
    const formattedEndDate = format(selectedRange.endDate, 'MM/dd/yyyy');
    
    console.log('📅 FilterSection: Setting date range locally:', {
      startDate: formattedStartDate,
      endDate: formattedEndDate
    });
    
    // Update local state
    setLocalStartDate(formattedStartDate);
    setLocalEndDate(formattedEndDate);
    
    // Update Redux state for persistence
    dispatch(updateSalesFilters({ 
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      dateRangeType: 'Custom Date Range'
    }));
    
    setIsDateRangeOpen(false);
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

  // FIXED: Enhanced apply filters - use callback with explicit values to avoid state sync issues
  const handleApplyFilters = () => {
    console.log('🎯 FilterSection: Applying filters with explicit values:', {
      startDate: localStartDate,
      endDate: localEndDate,
      selectedCategories,
      selectedLocation,
      useNewCallback: !!onApplyFiltersWithDates
    });

    // Update Redux state
    dispatch(updateSalesFilters({ 
      selectedCategories: selectedCategories,
      location: selectedLocation,
      dateRangeType: 'Custom Date Range',
      startDate: localStartDate,
      endDate: localEndDate
    }));
    
    // FIXED: Use the new callback if available to pass explicit values
    if (onApplyFiltersWithDates) {
      console.log('🚀 Using new callback with explicit values');
      onApplyFiltersWithDates(localStartDate, localEndDate, selectedCategories);
    } else {
      console.log('⚠️ Using legacy callback - may have timing issues');
      
      // Legacy approach - update parent state first, then call API
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
      
      // Add a small delay to allow state to update
      setTimeout(() => {
        onApplyFilters();
      }, 100);
    }
  };

  // Check if all categories are selected
  const isAllCategoriesSelected = selectedCategories.length === filteredCategories.length && filteredCategories.length > 0;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <FilterListIcon color="primary" />
        <Typography variant="h6" sx={{ fontWeight: 500 }}>
          Filters
        </Typography>
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
                {localStartDate && localEndDate 
                  ? `${formatDisplayDate(localStartDate)} - ${formatDisplayDate(localEndDate)}`
                  : 'Select Date Range'
                }
              </Typography>
            </Box>
          </Button>
        </Grid>

        {/* Dining Options Filter - FIXED alignment */}
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth size="small">
            <InputLabel id="dining-options-label">Dining Options</InputLabel>
            <Select
              labelId="dining-options-label"
              value=""
              label="Dining Options"
              onClick={handleCategoryDropdownOpen}
              displayEmpty
              renderValue={() => {
                if (selectedCategories.length === 0) {
                  return <Typography color="text.secondary">Select dining options</Typography>;
                }
                if (selectedCategories.length === filteredCategories.length && filteredCategories.length > 0) {
                  return 'All selected';
                }
                if (selectedCategories.length === 1) {
                  return selectedCategories[0];
                }
                return `${selectedCategories.length} selected`;
              }}
              startAdornment={<CategoryIcon sx={{ mr: 1, ml: -0.5, color: 'primary.light' }} />}
              endAdornment={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {selectedCategories.length > 0 && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearCategories();
                      }}
                      sx={{
                        width: 20,
                        height: 20,
                        backgroundColor: '#666',
                        color: 'white',
                        fontSize: '12px',
                        '&:hover': {
                          backgroundColor: '#333',
                        }
                      }}
                    >
                      <CloseIcon sx={{ fontSize: '12px' }} />
                    </IconButton>
                  )}
                  <ExpandMoreIcon />
                </Box>
              }
            />
          </FormControl>

          <Popover
            open={categoryDropdownOpen}
            anchorEl={categoryAnchorEl}
            onClose={handleCategoryDropdownClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            PaperProps={{
              sx: {
                width: categoryAnchorEl?.offsetWidth || 300,
                maxHeight: 400,
                mt: 1,
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                border: '1px solid #e0e0e0'
              }
            }}
          >
            {/* Search Box */}
            <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
              <TextField
                fullWidth
                placeholder="Search..."
                value={categorySearchText}
                onChange={(e) => setCategorySearchText(e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: '#666', fontSize: '20px' }} />,
                  sx: {
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e0e0e0',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1976d2',
                    }
                  }
                }}
                sx={{
                  '& .MuiInputBase-input': {
                    padding: '8px 12px'
                  }
                }}
              />
            </Box>

            {/* Select All Option */}
            {filteredCategoriesForSearch.length > 0 && (
              <Box sx={{ borderBottom: '1px solid #e0e0e0' }}>
                <Box
                  onClick={handleSelectAllCategories}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                    }
                  }}
                >
                  <Checkbox
                    checked={isAllCategoriesSelected && filteredCategoriesForSearch.length > 0}
                    indeterminate={selectedCategories.length > 0 && selectedCategories.length < filteredCategoriesForSearch.length}
                    size="small"
                    sx={{ 
                      p: 0, 
                      mr: 2,
                      '& .MuiSvgIcon-root': {
                        fontSize: '20px'
                      }
                    }}
                    onChange={handleSelectAllCategories}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      color: '#333'
                    }}
                  >
                    Select All
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Category Options */}
            <Box sx={{ maxHeight: 250, overflow: 'auto' }}>
              {filteredCategoriesForSearch.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    {categorySearchText ? 'No options found' : 'No dining options available'}
                  </Typography>
                  {!categorySearchText && (
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                      Upload a file to see available options
                    </Typography>
                  )}
                </Box>
              ) : (
                filteredCategoriesForSearch.map((category) => (
                  <Box
                    key={category}
                    onClick={() => handleCategoryToggle(category)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 2,
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                      }
                    }}
                  >
                    <Checkbox
                      checked={selectedCategories.includes(category)}
                      size="small"
                      sx={{ 
                        p: 0, 
                        mr: 2,
                        '& .MuiSvgIcon-root': {
                          fontSize: '20px'
                        }
                      }}
                      onChange={() => handleCategoryToggle(category)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Typography 
                      variant="body1"
                      sx={{ 
                        fontSize: '0.875rem',
                        color: '#333'
                      }}
                    >
                      {category}
                    </Typography>
                  </Box>
                ))
              )}
            </Box>
          </Popover>
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
            
            {localStartDate && localEndDate && (
              <Chip 
                label={`Date Range: ${formatDisplayDate(localStartDate)} - ${formatDisplayDate(localEndDate)}`} 
                color="secondary" 
                variant="outlined" 
                size="small" 
                icon={<CalendarTodayIcon />} 
                onDelete={() => {
                  setLocalStartDate('');
                  setLocalEndDate('');
                }}
              />
            )}
            
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
      <Box sx={{ mt: 3 }}>
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleApplyFilters}
          disabled={locations.length === 0}
          sx={{ px: 3 }}
        >
          Apply Filters 
        </Button>
      </Box>

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
                startDate: localStartDate ? new Date(localStartDate) : new Date(),
                endDate: localEndDate ? new Date(localEndDate) : new Date(),
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
    </Box>
  );
};

export default FilterSection;
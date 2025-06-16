// FilterSection.tsx - Updated with no default value but initially all selected

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
  IconButton,
  MenuList,
  Divider,
  OutlinedInput
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
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

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

// Custom MultiSelect component with search functionality (exact copy from ProductMixDashboard)
interface MultiSelectProps {
  id: string;
  label: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  icon?: React.ReactNode;
  placeholder?: string;
  initiallySelectAll?: boolean;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  id,
  label,
  options,
  value,
  onChange,
  icon,
  placeholder,
  initiallySelectAll = false,
}) => {
  const [searchText, setSearchText] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  // FIXED: Initialize with all options selected if initiallySelectAll is true
  useEffect(() => {
    if (initiallySelectAll && options.length > 0 && !hasInitialized && value.length === 0) {
      console.log(`🎯 FilterSection: Initializing ${label} with all options selected:`, options);
      onChange([...options]);
      setHasInitialized(true);
    }
  }, [initiallySelectAll, options, hasInitialized, value.length, onChange, label]);

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleToggle = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
    setAnchorEl(null);
    setSearchText("");
  };

  const handleSelect = (option: string) => {
    const newValue = value.includes(option)
      ? value.filter((item) => item !== option)
      : [...value, option];
    onChange(newValue);
  };

  const handleSelectAll = () => {
    if (value.length === options.length) {
      onChange([]);
    } else {
      onChange([...options]);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      handleClose();
    }
  };

  return (
    <Box sx={{ position: "relative", width: "100%" }}>
      <Box
        onClick={handleToggle}
        sx={{
          display: "flex",
          alignItems: "center",
          border: "1px solid rgba(0, 0, 0, 0.23)",
          borderRadius: 1,
          p: 1,
          cursor: "pointer",
          minHeight: "40px",
          position: "relative",
          height: "40px",
          overflow: "hidden",
        }}
      >
        {icon && (
          <Box
            sx={{
              color: "primary.light",
              mr: 1,
              ml: -0.5,
              display: "flex",
              alignItems: "center",
            }}
          >
            {icon}
          </Box>
        )}

        <Box
          sx={{
            flexGrow: 1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {value.length === 0 && (
            <Typography color="text.secondary" variant="body2" noWrap>
              {placeholder || "Select options"}
            </Typography>
          )}

          {value.length > 0 && (
            <Box
              sx={{
                display: "flex",
                flexWrap: "nowrap",
                gap: 0.5,
                overflow: "hidden",
              }}
            >
              {value.length <= 2 ? (
                value.map((item) => (
                  <Chip
                    key={item}
                    label={item}
                    size="small"
                    onDelete={(e) => {
                      e.stopPropagation();
                      onChange(value.filter((val) => val !== item));
                    }}
                    onClick={(e) => e.stopPropagation()}
                    sx={{ maxWidth: "120px" }}
                  />
                ))
              ) : (
                <>
                  <Chip
                    label={value[0]}
                    size="small"
                    onDelete={(e) => {
                      e.stopPropagation();
                      onChange(value.filter((val) => val !== value[0]));
                    }}
                    onClick={(e) => e.stopPropagation()}
                    sx={{ maxWidth: "120px" }}
                  />
                  <Chip
                    label={`+${value.length - 1} more`}
                    size="small"
                    onClick={(e) => e.stopPropagation()}
                  />
                </>
              )}
            </Box>
          )}
        </Box>

        <Box
          sx={{
            position: "absolute",
            right: 8,
            top: "50%",
            transform: "translateY(-50%)",
          }}
        >
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
          >
            {isOpen ? (
              <CloseIcon fontSize="small" />
            ) : (
              <SearchIcon fontSize="small" />
            )}
          </IconButton>
        </Box>
      </Box>

      <InputLabel
        htmlFor={id}
        sx={{
          position: "absolute",
          top: -6,
          left: 8,
          backgroundColor: "white",
          px: 0.5,
          fontSize: "0.75rem",
          pointerEvents: "none",
        }}
      >
        {label}
      </InputLabel>

      <Popover
        id={`${id}-popover`}
        open={isOpen}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        PaperProps={{
          style: {
            width: anchorEl ? anchorEl.clientWidth : undefined,
            maxHeight: 300,
            overflow: "auto",
          },
        }}
      >
        <Box sx={{ p: 1 }}>
          <TextField
            autoFocus
            fullWidth
            placeholder="Search..."
            size="small"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={handleKeyDown}
            InputProps={{
              startAdornment: (
                <SearchIcon
                  fontSize="small"
                  sx={{ mr: 1, color: "action.active" }}
                />
              ),
            }}
          />
        </Box>
        <Divider />
        <Box sx={{ p: 1 }}>
          <MenuItem dense onClick={handleSelectAll}>
            <Checkbox
              checked={value.length === options.length}
              indeterminate={value.length > 0 && value.length < options.length}
              size="small"
            />
            <ListItemText primary="Select All" />
          </MenuItem>
        </Box>
        <Divider />
        <MenuList>
          {filteredOptions.length === 0 ? (
            <MenuItem disabled>
              <ListItemText primary="No options found" />
            </MenuItem>
          ) : (
            filteredOptions.map((option) => (
              <MenuItem key={option} dense onClick={() => handleSelect(option)}>
                <Checkbox checked={value.includes(option)} size="small" />
                <ListItemText primary={option} />
              </MenuItem>
            ))
          )}
        </MenuList>
      </Popover>
    </Box>
  );
};

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
  // NEW: Add a callback that accepts explicit values including selected locations
  onApplyFiltersWithDates?: (startDate: string, endDate: string, categories: string[], selectedLocations: string[]) => void;
  categoriesOverride?: string[];
  dashboardType?: 'Sales Split' | 'Financials' | 'Sales Wide' | 'Product Mix';
  initiallySelectAll?: boolean;
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
  dashboardType = 'Sales Split',
  initiallySelectAll = false,
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
  
  // FIXED: State for multi-select arrays - NO DEFAULT VALUES, but will be populated by initiallySelectAll
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
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

  // REMOVED: Auto-selection based on selectedLocation prop
  // No default values, but initiallySelectAll will handle the initial population

  // Update local state when Redux filters change
  useEffect(() => {
    if (salesFilters.selectedCategories && salesFilters.selectedCategories.length > 0) {
      setSelectedCategories(salesFilters.selectedCategories);
    }
  }, [salesFilters.selectedCategories]);

  // Handle location change (multi-select) - UPDATED to not trigger parent onChange immediately
  const handleLocationChange = (newValue: string[]) => {
    console.log('📍 FilterSection: Location selection changed to:', newValue);
    setSelectedLocations(newValue);
    // Don't trigger parent onChange - wait for Apply Filters
  };

  // Handle category change (multi-select)
  const handleCategoryChange = (newValue: string[]) => {
    setSelectedCategories(newValue);
    dispatch(updateSalesFilters({ selectedCategories: newValue }));
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

  // Enhanced apply filters - use callback with explicit values including selected locations
  const handleApplyFilters = () => {
    console.log('🎯 FilterSection: Applying filters with explicit values:', {
      startDate: localStartDate,
      endDate: localEndDate,
      selectedCategories,
      selectedLocations,
      useNewCallback: !!onApplyFiltersWithDates
    });

    // Check if at least one location is selected
    if (selectedLocations.length === 0) {
      console.warn('⚠️ No locations selected');
      return;
    }

    // Update Redux state
    dispatch(updateSalesFilters({ 
      selectedCategories: selectedCategories,
      location: selectedLocations[0] || '', // Use first selected location for backward compatibility
      dateRangeType: 'Custom Date Range',
      startDate: localStartDate,
      endDate: localEndDate
    }));
    
    // Use the new callback if available to pass explicit values including locations
    if (onApplyFiltersWithDates) {
      console.log('🚀 Using new callback with explicit values including selected locations');
      onApplyFiltersWithDates(localStartDate, localEndDate, selectedCategories, selectedLocations);
    } else {
      console.log('⚠️ Using legacy callback - may have timing issues');
      
      // Legacy approach - update parent state first, then call API
      const locationEvent = {
        target: { value: selectedLocations[0] || '' }
      } as SelectChangeEvent;
      
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
      onLocationChange(locationEvent);
      onStartDateChange(startEvent);
      onEndDateChange(endEvent);
      onDateRangeChange(dateRangeEvent);
      
      // Add a small delay to allow state to update
      setTimeout(() => {
        onApplyFilters();
      }, 100);
    }
  };

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
        {/* Location filter - Using MultiSelect with NO default but initially all selected */}
        <Grid item xs={12} sm={6} md={4}>
          <MultiSelect
            id="location-select"
            label="Location"
            options={locations}
            value={selectedLocations}
            onChange={handleLocationChange}
            icon={<PlaceIcon />}
            placeholder="Select locations"
            initiallySelectAll={initiallySelectAll}
          />
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

        {/* Dining Options Filter - Using MultiSelect with initially all selected */}
        <Grid item xs={12} sm={6} md={4}>
          <MultiSelect
            id="dining-options-select"
            label="categories"
            options={filteredCategories}
            value={selectedCategories}
            onChange={handleCategoryChange}
            icon={<CategoryIcon />}
            placeholder="Select categories options"
            initiallySelectAll={initiallySelectAll}
          />
        </Grid>
      </Grid>

      {/* Active filters display */}
      {(selectedLocations.length > 0 || selectedCategories.length > 0 || (localStartDate && localEndDate)) && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Active Filters:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {selectedLocations.length > 0 && (
              <Chip 
                label={
                  selectedLocations.length === 1
                    ? `Location: ${selectedLocations[0]}`
                    : `Locations: ${selectedLocations.length} selected`
                } 
                color="primary" 
                variant="outlined" 
                size="small" 
                icon={<PlaceIcon />} 
                onDelete={() => setSelectedLocations([])}
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
                  selectedCategories.length === 1 
                    ? `Dining: ${selectedCategories[0]}` 
                    : `Dining: ${selectedCategories.length} selected`
                } 
                color="error" 
                variant="outlined" 
                size="small" 
                icon={<CategoryIcon />} 
                onDelete={() => setSelectedCategories([])}
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
          disabled={selectedLocations.length === 0}
          sx={{ px: 3 }}
        >
          Apply Filters 
        </Button>
        {selectedLocations.length === 0 && locations.length > 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
            Please select at least one location
          </Typography>
        )}
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
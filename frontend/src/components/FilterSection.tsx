// FilterSection.tsx - Fixed Auto-Filtering with Better Performance and Multiple Location Support

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
  OutlinedInput,
  Alert,
  CircularProgress
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
import BusinessIcon from '@mui/icons-material/Business';
import AutorenewIcon from '@mui/icons-material/Autorenew';

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

// UPDATED: Import masterFileSlice Redux
import { useSelector, useDispatch } from "react-redux";
import {
  setSelectedLocations,
  selectSelectedLocations 
} from "../store/slices/masterFileSlice";

// UPDATED: Location interface to match company-locations API
interface LocationObject {
  location_id: number;
  location_name: string;
}

// Custom MultiSelect component with search functionality (keeping existing implementation)
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

const MultiSelect: React.FC<MultiSelectProps> = React.memo(({
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
});

// UPDATED: Interface with new Redux-related props
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
  onApplyFiltersWithDates?: (startDate: string, endDate: string, categories: string[], selectedLocations: string[]) => void;
  categoriesOverride?: string[];
  dashboardType?: 'Sales Split' | 'Financials' | 'Sales Wide' | 'Product Mix';
  initiallySelectAll?: boolean;
  // NEW: Redux-related props for company-location integration
  availableLocationObjects?: LocationObject[];
  selectedCompanyId?: string;
  reduxSelectedLocations?: string[];
  onReduxLocationChange?: (locationIds: string[]) => void;
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
  onApplyFiltersWithDates,
  categoriesOverride,
  dashboardType = 'Sales Split',
  initiallySelectAll = false,
  // NEW: Redux props
  availableLocationObjects = [],
  selectedCompanyId,
  reduxSelectedLocations = [],
  onReduxLocationChange,
}) => {
  const dispatch = useAppDispatch();
  const reduxDispatch = useDispatch();
  
  // Get categories from Redux state based on dashboard type
  const salesCategories = useAppSelector(selectSalesCategories);
  const allCategories = useAppSelector(selectAllCategories);
  const financialCategories = useAppSelector(selectFinancialCategories);
  const salesWideCategories = useAppSelector(selectSalesWideCategories);
  const productMixCategories = useAppSelector(selectProductMixCategories);
  const salesFilters = useAppSelector(state => state.excel.salesFilters);
  
  // UPDATED: Get Redux locations state
  const reduxLocationSelections = useSelector(selectSelectedLocations);
  
  // Loading state for auto-filtering
  const [isAutoFiltering, setIsAutoFiltering] = useState(false);
  
  // Refs to track previous values and prevent unnecessary re-renders
  const previousFiltersRef = useRef<{
    locations: string[];
    startDate: string;
    endDate: string;
    categories: string[];
  }>({
    locations: [],
    startDate: '',
    endDate: '',
    categories: []
  });
  
  // Timeout ref for debouncing
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  // Track if component has been initialized to avoid initial auto-filter
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Determine which categories to use
  const availableCategories = useMemo(() => {
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
  const filterCategories = useCallback((categories: string[]) => {
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

  const filteredCategories = useMemo(() => 
    filterCategories(availableCategories), 
    [availableCategories, filterCategories]
  );
  
  // UPDATED: State for multi-select arrays - use Redux state for locations when available
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // UPDATED: Use Redux state for locations if available, fallback to local state
  const [localSelectedLocations, setLocalSelectedLocations] = useState<string[]>([]);
  const selectedLocations = onReduxLocationChange ? reduxSelectedLocations : localSelectedLocations;
  
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

  // Update local state when Redux filters change
  useEffect(() => {
    if (salesFilters.selectedCategories && salesFilters.selectedCategories.length > 0) {
      setSelectedCategories(salesFilters.selectedCategories);
    }
  }, [salesFilters.selectedCategories]);

  // UPDATED: Handle location change with Redux integration
  const handleLocationChange = useCallback((newValue: string[]) => {
    console.log('📍 FilterSection: Location selection changed to:', newValue);
    
    if (onReduxLocationChange) {
      // Use Redux dispatch - need to convert names to IDs
      if (availableLocationObjects.length > 0) {
        const locationIds = newValue.map(name => {
          const location = availableLocationObjects.find(loc => loc.location_name === name);
          return location ? location.location_id.toString() : name;
        });
        console.log('📍 FilterSection: Converting location names to IDs for Redux:', {
          names: newValue,
          ids: locationIds
        });
        onReduxLocationChange(locationIds);
      } else {
        onReduxLocationChange(newValue);
      }
    } else {
      // Use local state
      setLocalSelectedLocations(newValue);
    }
  }, [onReduxLocationChange, availableLocationObjects]);

  // Handle category change (multi-select)
  const handleCategoryChange = useCallback((newValue: string[]) => {
    setSelectedCategories(newValue);
    dispatch(updateSalesFilters({ selectedCategories: newValue }));
  }, [dispatch]);

  // Open date range dialog
  const openDateRangePicker = () => {
    setIsDateRangeOpen(true);
  };

  // Handle date range selection from DateRangeSelector
  const handleDateRangeSelect = (range: any) => {
    setSelectedRange(range);
  };

  // Apply date range - sets the date range locally
  const applyDateRange = useCallback(() => {
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
  }, [selectedRange, dispatch]);

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

  // Check if filters have minimum requirements to trigger auto-filter
  const hasMinimumFilters = useCallback((locations: string[], startDate: string, endDate: string, categories: string[]) => {
    return locations.length > 0; // Only location is required, others are optional but will use defaults
  }, []);

  // ✅ FIXED: Check if any filter has actually changed - CREATE COPIES to avoid mutation error
  const hasFiltersChanged = useCallback((currentLocations: string[], currentStartDate: string, currentEndDate: string, currentCategories: string[]) => {
    const prev = previousFiltersRef.current;
    
    // ✅ CRITICAL FIX: Create copies of arrays before sorting to avoid read-only property error
    const currentLocationsCopy = [...currentLocations].sort();
    const prevLocationsCopy = [...prev.locations].sort();
    const currentCategoriesCopy = [...currentCategories].sort();
    const prevCategoriesCopy = [...prev.categories].sort();
    
    const locationsChanged = JSON.stringify(currentLocationsCopy) !== JSON.stringify(prevLocationsCopy);
    const startDateChanged = currentStartDate !== prev.startDate;
    const endDateChanged = currentEndDate !== prev.endDate;
    const categoriesChanged = JSON.stringify(currentCategoriesCopy) !== JSON.stringify(prevCategoriesCopy);
    
    console.log('🔍 FilterSection: Checking for changes:', {
      locationsChanged,
      startDateChanged,
      endDateChanged,
      categoriesChanged,
      current: { 
        locations: currentLocationsCopy, 
        startDate: currentStartDate, 
        endDate: currentEndDate, 
        categories: currentCategoriesCopy 
      },
      previous: {
        locations: prevLocationsCopy,
        startDate: prev.startDate,
        endDate: prev.endDate,
        categories: prevCategoriesCopy
      }
    });
    
    return locationsChanged || startDateChanged || endDateChanged || categoriesChanged;
  }, []);

  // UPDATED: Enhanced apply filters with Redux location handling - AUTO TRIGGER
  const triggerAutoFilter = useCallback(async () => {
    const currentLocations = selectedLocations;
    const currentStartDate = localStartDate;
    const currentEndDate = localEndDate;
    const currentCategories = selectedCategories;

    console.log('🎯 FilterSection: Checking auto-filter trigger:', {
      startDate: currentStartDate,
      endDate: currentEndDate,
      selectedCategories: currentCategories,
      selectedLocations: currentLocations,
      useRedux: !!onReduxLocationChange,
      companyId: selectedCompanyId,
      isInitialized
    });

    // Don't trigger on initial load
    if (!isInitialized) {
      console.log('⏳ FilterSection: Skipping auto-filter - component not initialized');
      return;
    }

    // Check if minimum requirements are met
    if (!hasMinimumFilters(currentLocations, currentStartDate, currentEndDate, currentCategories)) {
      console.warn('⚠️ FilterSection: Minimum filter requirements not met');
      return;
    }

    // Check if company is selected (when using Redux)
    if (onReduxLocationChange && !selectedCompanyId) {
      console.warn('⚠️ FilterSection: No company selected - skipping auto-filter');
      return;
    }

    // ✅ FIXED: Check if filters actually changed with proper array handling
    if (!hasFiltersChanged(currentLocations, currentStartDate, currentEndDate, currentCategories)) {
      console.log('⏭️ FilterSection: No filter changes detected - skipping auto-filter');
      return;
    }

    setIsAutoFiltering(true);

    try {
      // ✅ FIXED: Update Redux state with copied arrays
      dispatch(updateSalesFilters({ 
        selectedCategories: [...currentCategories], // Create copy
        location: currentLocations[0] || '', // Use first selected location for backward compatibility
        dateRangeType: 'Custom Date Range',
        startDate: currentStartDate,
        endDate: currentEndDate
      }));
      
      // Use the new callback if available to pass explicit values including locations
      if (onApplyFiltersWithDates) {
        console.log('🚀 FilterSection: Auto-filtering with new callback and Redux location state');
        
        // UPDATED: Convert location IDs back to location names for API compatibility
        let locationNamesForApi: string[] = [];
        
        if (availableLocationObjects.length > 0 && onReduxLocationChange) {
          // Convert location IDs to names for API
          locationNamesForApi = currentLocations.map(locationId => {
            const location = availableLocationObjects.find(loc => loc.location_id.toString() === locationId);
            return location ? location.location_name : locationId;
          });
          console.log('📍 FilterSection: Converted location IDs to names for API:', {
            locationIds: currentLocations,
            locationNames: locationNamesForApi
          });
        } else {
          // Use location values as-is (legacy mode)
          locationNamesForApi = [...currentLocations]; // Create copy
        }
        
        await onApplyFiltersWithDates(
          currentStartDate || '', 
          currentEndDate || '', 
          [...currentCategories], // Create copy
          locationNamesForApi
        );
      } else {
        console.log('⚠️ FilterSection: Auto-filtering with legacy callback');
        
        // Legacy approach - update parent state first, then call API
        const locationEvent = {
          target: { value: currentLocations[0] || '' }
        } as SelectChangeEvent;
        
        const startEvent = {
          target: { value: currentStartDate }
        } as React.ChangeEvent<HTMLInputElement>;
        
        const endEvent = {
          target: { value: currentEndDate }
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

      // ✅ FIXED: Update previous filters reference with copies
      previousFiltersRef.current = {
        locations: [...currentLocations],
        startDate: currentStartDate,
        endDate: currentEndDate,
        categories: [...currentCategories]
      };

    } catch (error) {
      console.error('❌ FilterSection: Auto-filter error:', error);
    } finally {
      setIsAutoFiltering(false);
    }
  }, [
    selectedLocations,
    localStartDate,
    localEndDate,
    selectedCategories,
    onReduxLocationChange,
    selectedCompanyId,
    isInitialized,
    hasMinimumFilters,
    hasFiltersChanged,
    dispatch,
    onApplyFiltersWithDates,
    availableLocationObjects,
    onLocationChange,
    onStartDateChange,
    onEndDateChange,
    onDateRangeChange,
    onApplyFilters
  ]);

  // Debounced auto-filter function
  const debouncedAutoFilter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      triggerAutoFilter();
    }, 300); // Reduced debounce time for better responsiveness
  }, [triggerAutoFilter]);

  // Single useEffect to monitor all filter changes
  useEffect(() => {
    // Mark as initialized after first render
    if (!isInitialized) {
      setIsInitialized(true);
      return;
    }

    console.log('🔄 FilterSection: Filter change detected, triggering debounced auto-filter');
    debouncedAutoFilter();

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [selectedLocations, localStartDate, localEndDate, selectedCategories, debouncedAutoFilter, isInitialized]);

  // UPDATED: Determine which locations to use and convert for display
  const displayLocations = useMemo(() => {
    if (availableLocationObjects.length > 0) {
      return availableLocationObjects.map(loc => loc.location_name);
    }
    return locations || [];
  }, [availableLocationObjects, locations]);

  // UPDATED: Convert selected location IDs to names for display
  const displaySelectedLocations = useMemo(() => {
    if (availableLocationObjects.length > 0 && onReduxLocationChange) {
      return selectedLocations.map(id => {
        const location = availableLocationObjects.find(loc => loc.location_id.toString() === id);
        return location ? location.location_name : id;
      });
    }
    return selectedLocations;
  }, [selectedLocations, availableLocationObjects, onReduxLocationChange]);

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header with Auto-Filter Indicator */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <FilterListIcon color="primary" />
        <Typography variant="h6" sx={{ fontWeight: 500 }}>
          Filters
        </Typography>
        {selectedCompanyId && (
          <Chip 
            icon={<BusinessIcon />}
            label={`Company Selected`}
            size="small"
            color="primary"
            variant="outlined"
          />
        )}
        {isAutoFiltering && (
          <Chip 
            icon={<CircularProgress size={16} />}
            label="Auto-Filtering..."
            size="small"
            color="secondary"
            variant="outlined"
          />
        )}
        <Chip 
          icon={<AutorenewIcon />}
          label="Auto-Update"
          size="small"
          color="success"
          variant="outlined"
          sx={{ ml: 'auto' }}
        />
      </Box>

      {/* Company Selection Alert */}
      {onReduxLocationChange && !selectedCompanyId && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Please select a company above to see available locations for filtering.
          </Typography>
        </Alert>
      )}

      {/* No locations available alert */}
      {onReduxLocationChange && selectedCompanyId && displayLocations.length === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            No locations available for the selected company.
          </Typography>
        </Alert>
      )}

      <Grid container spacing={2}>
        {/* Location filter - UPDATED to use Redux state */}
        <Grid item xs={12} sm={6} md={4}>
          <MultiSelect
            id="location-select"
            label="Location"
            options={displayLocations}
            value={displaySelectedLocations}
            onChange={handleLocationChange}
            icon={<PlaceIcon />}
            placeholder={selectedCompanyId ? "Select locations" : "Select company first"}
            initiallySelectAll={initiallySelectAll && displayLocations.length > 0}
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
                  : 'Select Date Range (Optional)'
                }
              </Typography>
            </Box>
          </Button>
        </Grid>

        {/* Dining Options Filter - Using MultiSelect with initially all selected */}
        <Grid item xs={12} sm={6} md={4}>
          <MultiSelect
            id="dining-options-select"
            label="Dining Options"
            options={filteredCategories}
            value={selectedCategories}
            onChange={handleCategoryChange}
            icon={<CategoryIcon />}
            placeholder="Select dining options (Optional)"
            initiallySelectAll={initiallySelectAll}
          />
        </Grid>
      </Grid>

      {/* Active filters display with auto-filter status */}
      {(displaySelectedLocations.length > 0 || selectedCategories.length > 0 || (localStartDate && localEndDate)) && (
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Active Filters:
            </Typography>
            {isAutoFiltering && (
              <Box sx={{ ml: 2, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CircularProgress size={16} />
                <Typography variant="caption" color="primary">
                  Updating...
                </Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {displaySelectedLocations.length > 0 && (
              <Chip 
                label={
                  displaySelectedLocations.length === 1
                    ? `Location: ${displaySelectedLocations[0]}`
                    : `Locations: ${displaySelectedLocations.length} selected`
                } 
                color="primary" 
                variant="outlined" 
                size="small" 
                icon={<PlaceIcon />} 
                onDelete={() => handleLocationChange([])}
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

      {/* Filter Requirements Status */}
      {/* <Box sx={{ mt: 3 }}>
        <Alert 
          severity={displaySelectedLocations.length > 0 ? "success" : "warning"}
        >
          <Typography variant="body2">
            <strong>Filter Status:</strong><br />
            • Location: {displaySelectedLocations.length > 0 ? `✓ ${displaySelectedLocations.length} selected` : '✗ Required for auto-filtering'}<br />
            • Date Range: {(localStartDate && localEndDate) ? '✓ Selected' : '○ Optional (will use defaults)'}<br />
            • Dining Options: {selectedCategories.length > 0 ? `✓ ${selectedCategories.length} selected` : '○ Optional (will use defaults)'}<br />
            {displaySelectedLocations.length > 0 && (
              <><br /><strong>Auto-filtering is active - data updates when filters change!</strong></>
            )}
          </Typography>
        </Alert>
      </Box> */}

      {/* Debug Info - Show Redux state in development */}
      {/* {process.env.NODE_ENV === 'development' && onReduxLocationChange && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Debug - Redux Integration:</strong><br />
            Company ID: {selectedCompanyId || 'None'}<br />
            Redux Location IDs: [{selectedLocations.join(', ')}]<br />
            Display Location Names: [{displaySelectedLocations.join(', ')}]<br />
            Available Locations: [{displayLocations.join(', ')}]<br />
            Auto-Filtering: {isAutoFiltering ? 'Active' : 'Idle'}<br />
            Initialized: {isInitialized ? 'Yes' : 'No'}<br />
            Multiple Locations: {displaySelectedLocations.length > 1 ? 'Yes' : 'No'}
          </Typography>
        </Alert>
      )} */}

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
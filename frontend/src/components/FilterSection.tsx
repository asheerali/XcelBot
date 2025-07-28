// FilterSection.tsx - TIMEZONE-SAFE FIXED Version with Proper Date Range Integration

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

// Import masterFileSlice Redux
import { useSelector, useDispatch } from "react-redux";
import {
  setSelectedLocations,
  selectSelectedLocations 
} from "../store/slices/masterFileSlice";

// ✅ FIX: Import proper date range actions for Sales Split Dashboard
import {
  setSalesSplitDashboardDateRange,
  setSalesSplitDashboardStartDate,
  setSalesSplitDashboardEndDate,
  clearSalesSplitDashboardDateRange,
  selectSalesSplitDashboardDateRange,
  selectSalesSplitDashboardStartDate,
  selectSalesSplitDashboardEndDate,
  selectHasSalesSplitDashboardDateRange
} from '../store/slices/dateRangeSlice';

// Location interface to match company-locations API
interface LocationObject {
  location_id: number;
  location_name: string;
}

// Custom MultiSelect component with search functionality
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

  // Initialize with all options selected if initiallySelectAll is true
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

// Interface with Redux-related props
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
  // Redux-related props for company-location integration
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
  // Redux props
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
  
  // Get Redux locations state
  const reduxLocationSelections = useSelector(selectSelectedLocations);
  
  // ✅ FIX: Use proper Redux selectors for Sales Split Dashboard dates
  const salesSplitDateRange = useSelector(selectSalesSplitDashboardDateRange);
  const reduxStartDate = useSelector(selectSalesSplitDashboardStartDate) || '';
  const reduxEndDate = useSelector(selectSalesSplitDashboardEndDate) || '';
  const hasDateRange = useSelector(selectHasSalesSplitDashboardDateRange);
  
  console.log('📅 FilterSection: Redux date state:', {
    salesSplitDateRange,
    reduxStartDate,
    reduxEndDate,
    hasDateRange,
    propsStartDate: startDate,
    propsEndDate: endDate
  });
  
  // ✅ COMPREHENSIVE FIX: Multiple flags to prevent conflicts + TARGETED FIX
  const [isAutoFiltering, setIsAutoFiltering] = useState(false);
  const [isManuallyTriggering, setIsManuallyTriggering] = useState(false);
  const [isApplyingDateRange, setIsApplyingDateRange] = useState(false);
  const [isManualDateRangeApply, setIsManualDateRangeApply] = useState(false);
  const [dateChangeSource, setDateChangeSource] = useState<'manual' | 'auto' | null>(null);
  
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
  
  // State for multi-select arrays - use Redux state for locations when available
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // Use Redux state for locations if available, fallback to local state
  const [localSelectedLocations, setLocalSelectedLocations] = useState<string[]>([]);
  const selectedLocations = onReduxLocationChange ? reduxSelectedLocations : localSelectedLocations;
  
  // ✅ FIX: Use Redux date state as primary source, fallback to props
  const currentStartDate = reduxStartDate || startDate || '';
  const currentEndDate = reduxEndDate || endDate || '';
  
  // State for date range dialog
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState({
    startDate: currentStartDate ? new Date(currentStartDate) : new Date(),
    endDate: currentEndDate ? new Date(currentEndDate) : new Date(),
  });

  // ✅ TIMEZONE-SAFE: Helper function to create Date objects from date strings
  const createDateSafely = (dateStr: string): Date => {
    if (!dateStr) return new Date();
    
    try {
      // Handle MM/DD/YYYY format safely
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
        const [month, day, year] = dateStr.split('/').map(Number);
        // Create date in local timezone at noon to avoid DST issues
        return new Date(year, month - 1, day, 12, 0, 0);
      }
      
      // Handle YYYY-MM-DD format safely
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day, 12, 0, 0);
      }
      
      // Fallback - try to parse and set to noon
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
      }
      
      return new Date();
    } catch (error) {
      console.warn('⚠️ FilterSection: Error creating date safely:', error, 'Input:', dateStr);
      return new Date();
    }
  };

  // ✅ FIX: Update selected range when Redux dates change (TIMEZONE-SAFE)
  useEffect(() => {
    console.log('📅 FilterSection: Updating selectedRange from Redux dates (TIMEZONE-SAFE):', {
      reduxStartDate,
      reduxEndDate,
      currentStartDate,
      currentEndDate
    });
    
    if (currentStartDate && currentEndDate) {
      try {
        const newStartDate = createDateSafely(currentStartDate);
        const newEndDate = createDateSafely(currentEndDate);
        
        setSelectedRange({
          startDate: newStartDate,
          endDate: newEndDate,
        });
      } catch (error) {
        console.warn('📅 FilterSection: Invalid dates from Redux:', { currentStartDate, currentEndDate, error });
      }
    }
  }, [currentStartDate, currentEndDate, reduxStartDate, reduxEndDate]);

  // Update local state when Redux filters change
  useEffect(() => {
    if (salesFilters.selectedCategories && salesFilters.selectedCategories.length > 0) {
      setSelectedCategories(salesFilters.selectedCategories);
    }
  }, [salesFilters.selectedCategories]);

  // Helper function to convert location IDs to names for API
  const getLocationNamesForApi = useCallback((currentLocations: string[]) => {
    if (availableLocationObjects.length > 0 && onReduxLocationChange) {
      // Convert location IDs to names for API
      return currentLocations.map(locationId => {
        const location = availableLocationObjects.find(loc => loc.location_id.toString() === locationId);
        return location ? location.location_name : locationId;
      });
    } else {
      // Use location values as-is (legacy mode)
      return [...currentLocations];
    }
  }, [availableLocationObjects, onReduxLocationChange]);

  // Handle location change with Redux integration and enhanced blocking
  const handleLocationChange = useCallback((newValue: string[]) => {
    console.log('📍 FilterSection: Location selection changed to:', newValue);
    
    // ✅ Set manual triggering flag to prevent double calls
    setIsManuallyTriggering(true);
    setDateChangeSource('manual');
    
    // Clear any pending auto-filter timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
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
    
    // ✅ ENHANCED: Auto-trigger filter if we have locations and optional date range
    if (newValue.length > 0 && onApplyFiltersWithDates) {
      const locationNamesForApi = getLocationNamesForApi(newValue);
      
      console.log('🚀 FilterSection: Location changed - triggering immediate filter with current state:', {
        locations: locationNamesForApi,
        startDate: currentStartDate,
        endDate: currentEndDate,
        categories: selectedCategories
      });
      
      // Small delay to ensure Redux state is updated
      setTimeout(() => {
        onApplyFiltersWithDates(
          currentStartDate || '',
          currentEndDate || '',
          [...selectedCategories],
          locationNamesForApi
        );
      }, 200);
    }
    
    // Reset manual flag after operation
    setTimeout(() => {
      setIsManuallyTriggering(false);
      setDateChangeSource(null);
    }, 2000);
    
  }, [onReduxLocationChange, availableLocationObjects, getLocationNamesForApi, onApplyFiltersWithDates, currentStartDate, currentEndDate, selectedCategories, timeoutRef]);

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

  // ✅ TIMEZONE-SAFE: Helper function to format dates without timezone conversion
  const formatDateSafe = (date: Date): string => {
    if (!date || !(date instanceof Date)) return '';
    
    // Use local timezone methods to avoid UTC conversion
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    return `${month}/${day}/${year}`;
  };

  // ✅ ENHANCED: Apply date range with comprehensive blocking and Redux integration (TIMEZONE-SAFE)
  const applyDateRange = useCallback(() => {
    // TIMEZONE-SAFE: Use manual formatting instead of date-fns format()
    const formattedStartDate = formatDateSafe(selectedRange.startDate);
    const formattedEndDate = formatDateSafe(selectedRange.endDate);
    
    console.log('📅 FilterSection: Applying date range MANUALLY - blocking ALL auto-filters (TIMEZONE-SAFE):', {
      originalStartDate: selectedRange.startDate,
      originalEndDate: selectedRange.endDate,
      formattedStartDate: formattedStartDate,
      formattedEndDate: formattedEndDate,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
    
    // ✅ CRITICAL: Set ALL manual flags to prevent any auto-filtering
    setIsManualDateRangeApply(true);
    setIsManuallyTriggering(true);
    setIsApplyingDateRange(true);
    setDateChangeSource('manual');
    
    // Clear any pending timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // ✅ FIX: Update Redux state for Sales Split Dashboard dates
    reduxDispatch(setSalesSplitDashboardDateRange({
      startDate: formattedStartDate,
      endDate: formattedEndDate
    }));
    
    // Also update legacy Redux state for compatibility
    dispatch(updateSalesFilters({ 
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      dateRangeType: 'Custom Date Range'
    }));
    
    setIsDateRangeOpen(false);
    
    // ✅ MANUAL TRIGGER: Only if locations are selected
    if (onApplyFiltersWithDates && selectedLocations.length > 0) {
      console.log('🚀 FilterSection: MANUALLY triggering filter with new date range');
      
      const locationNamesForApi = getLocationNamesForApi(selectedLocations);
      
      // Use a small delay to ensure state is updated
      setTimeout(() => {
        onApplyFiltersWithDates(
          formattedStartDate,
          formattedEndDate,
          [...selectedCategories],
          locationNamesForApi
        );
      }, 100);
    } else if (selectedLocations.length === 0) {
      console.log('⚠️ FilterSection: No locations selected - date range set but no API call');
    }
    
    // ✅ CRITICAL: Reset ALL flags after a longer delay
    setTimeout(() => {
      console.log('🔄 FilterSection: Resetting ALL manual flags');
      setIsManualDateRangeApply(false);
      setIsManuallyTriggering(false);
      setIsApplyingDateRange(false);
      setDateChangeSource(null);
    }, 5000); // Increased to 5 seconds for safety
    
  }, [selectedRange, dispatch, reduxDispatch, onApplyFiltersWithDates, selectedLocations, selectedCategories, getLocationNamesForApi, timeoutRef]);

  // ✅ TIMEZONE-SAFE: Format display date without timezone conversion
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      // Parse MM/DD/YYYY format safely
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
        const [month, day, year] = dateStr.split('/').map(Number);
        // Create date in local timezone
        const date = new Date(year, month - 1, day);
        
        // Format manually to avoid timezone issues
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                           'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        return `${monthNames[date.getMonth()]} ${date.getDate().toString().padStart(2, '0')}, ${date.getFullYear()}`;
      }
      
      // Fallback to original formatting for other formats
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                           'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${monthNames[date.getMonth()]} ${date.getDate().toString().padStart(2, '0')}, ${date.getFullYear()}`;
      }
      
      return dateStr;
    } catch (e) {
      return dateStr;
    }
  };

  // Check if filters have minimum requirements to trigger auto-filter
  const hasMinimumFilters = useCallback((locations: string[], startDate: string, endDate: string, categories: string[]) => {
    return locations.length > 0; // Only location is required, others are optional but will use defaults
  }, []);

  // Check if any filter has actually changed - CREATE COPIES to avoid mutation error
  const hasFiltersChanged = useCallback((currentLocations: string[], currentStartDate: string, currentEndDate: string, currentCategories: string[]) => {
    const prev = previousFiltersRef.current;
    
    // Create copies of arrays before sorting to avoid read-only property error
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

  // ✅ ENHANCED: Auto-filter with comprehensive blocking and location validation
  const triggerAutoFilter = useCallback(async () => {
    // ✅ CRITICAL FIX: Skip auto-filter if any manual operation is active
    if (isManuallyTriggering || isApplyingDateRange || isManualDateRangeApply) {
      console.log('⏸️ FilterSection: Skipping auto-filter - manual operation in progress:', {
        isManuallyTriggering,
        isApplyingDateRange,
        isManualDateRangeApply,
        dateChangeSource
      });
      return;
    }
    
    // ✅ Additional check: Skip if date change source is manual
    if (dateChangeSource === 'manual') {
      console.log('⏸️ FilterSection: Skipping auto-filter - date change was manual');
      return;
    }
    
    const currentLocations = selectedLocations;
    const currentCategories = selectedCategories;

    console.log('🎯 FilterSection: Checking auto-filter trigger:', {
      startDate: currentStartDate,
      endDate: currentEndDate,
      selectedCategories: currentCategories,
      selectedLocations: currentLocations,
      useRedux: !!onReduxLocationChange,
      companyId: selectedCompanyId,
      isInitialized,
      isManuallyTriggering,
      isApplyingDateRange,
      isManualDateRangeApply,
      dateChangeSource
    });

    // Don't trigger on initial load
    if (!isInitialized) {
      console.log('⏳ FilterSection: Skipping auto-filter - component not initialized');
      return;
    }

    // ✅ ENHANCED: Check if minimum requirements are met (locations are required)
    if (!hasMinimumFilters(currentLocations, currentStartDate, currentEndDate, currentCategories)) {
      console.warn('⚠️ FilterSection: Minimum filter requirements not met - locations required');
      return;
    }

    // Check if company is selected (when using Redux)
    if (onReduxLocationChange && !selectedCompanyId) {
      console.warn('⚠️ FilterSection: No company selected - skipping auto-filter');
      return;
    }

    // Check if filters actually changed with proper array handling
    if (!hasFiltersChanged(currentLocations, currentStartDate, currentEndDate, currentCategories)) {
      console.log('⏭️ FilterSection: No filter changes detected - skipping auto-filter');
      return;
    }

    // ✅ ENHANCED: Validate that we have meaningful data to send
    if (currentLocations.length === 0) {
      console.warn('⚠️ FilterSection: No locations selected - cannot auto-filter');
      return;
    }

    setIsAutoFiltering(true);
    setDateChangeSource('auto'); // Mark as auto-triggered

    try {
      // Update Redux state with copied arrays
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
        
        const locationNamesForApi = getLocationNamesForApi(currentLocations);
        
        console.log('📍 FilterSection: Converted location IDs to names for API:', {
          locationIds: currentLocations,
          locationNames: locationNamesForApi
        });
        
        // ✅ ENHANCED: Only proceed if we have valid locations
        if (locationNamesForApi.length > 0) {
          await onApplyFiltersWithDates(
            currentStartDate || '', 
            currentEndDate || '', 
            [...currentCategories], // Create copy
            locationNamesForApi
          );
        } else {
          console.warn('⚠️ FilterSection: No valid location names for API - skipping call');
        }
      } else {
        console.log('⚠️ FilterSection: Auto-filtering with legacy callback');
        
        // Legacy approach - only proceed if we have locations
        if (currentLocations.length > 0) {
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
      }

      // Update previous filters reference with copies
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
      // Reset source after auto-filter completes
      setTimeout(() => setDateChangeSource(null), 500);
    }
  }, [
    isManuallyTriggering,
    isApplyingDateRange,
    isManualDateRangeApply,
    dateChangeSource,
    selectedLocations,
    currentStartDate,
    currentEndDate,
    selectedCategories,
    onReduxLocationChange,
    selectedCompanyId,
    isInitialized,
    hasMinimumFilters,
    hasFiltersChanged,
    dispatch,
    onApplyFiltersWithDates,
    getLocationNamesForApi,
    onLocationChange,
    onStartDateChange,
    onEndDateChange,
    onDateRangeChange,
    onApplyFilters
  ]);

  // ✅ ENHANCED: Debounced auto-filter with comprehensive blocking
  const debouncedAutoFilter = useCallback(() => {
    // ✅ Skip if any manual operation is in progress
    if (isManuallyTriggering || isApplyingDateRange || isManualDateRangeApply || dateChangeSource === 'manual') {
      console.log('⏸️ FilterSection: Skipping debounced auto-filter - manual operation active');
      return;
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      // Double-check flags before executing
      if (!isManuallyTriggering && !isApplyingDateRange && !isManualDateRangeApply && dateChangeSource !== 'manual') {
        triggerAutoFilter();
      } else {
        console.log('⏸️ FilterSection: Cancelled debounced auto-filter - manual operation detected');
      }
    }, 500); // Increased debounce time
  }, [triggerAutoFilter, isManuallyTriggering, isApplyingDateRange, isManualDateRangeApply, dateChangeSource]);

  // ✅ ENHANCED: useEffect with TARGETED flag checking
  useEffect(() => {
    // Mark as initialized after first render
    if (!isInitialized) {
      setIsInitialized(true);
      return;
    }

    // ✅ Skip auto-filter if any manual operation is active
    if (isManuallyTriggering || isApplyingDateRange || isManualDateRangeApply) {
      console.log('⏸️ FilterSection: Skipping useEffect auto-filter - manual operation active:', {
        isManuallyTriggering,
        isApplyingDateRange,
        isManualDateRangeApply,
        dateChangeSource
      });
      return;
    }

    // ✅ Skip if this is a manual date change
    if (dateChangeSource === 'manual') {
      console.log('⏸️ FilterSection: Skipping useEffect auto-filter - manual date change');
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
  }, [
    selectedLocations, 
    currentStartDate, 
    currentEndDate, 
    selectedCategories, 
    debouncedAutoFilter, 
    isInitialized, 
    isManuallyTriggering,
    isApplyingDateRange,
    isManualDateRangeApply,
    dateChangeSource
  ]);

  // ✅ Cleanup for all flags including new one
  useEffect(() => {
    return () => {
      setIsApplyingDateRange(false);
      setDateChangeSource(null);
      setIsManuallyTriggering(false);
      setIsAutoFiltering(false);
      setIsManualDateRangeApply(false);
    };
  }, []);

  // Determine which locations to use and convert for display
  const displayLocations = useMemo(() => {
    if (availableLocationObjects.length > 0) {
      return availableLocationObjects.map(loc => loc.location_name);
    }
    return locations || [];
  }, [availableLocationObjects, locations]);

  // Convert selected location IDs to names for display
  const displaySelectedLocations = useMemo(() => {
    if (availableLocationObjects.length > 0 && onReduxLocationChange) {
      return selectedLocations.map(id => {
        const location = availableLocationObjects.find(loc => loc.location_id.toString() === id);
        return location ? location.location_name : id;
      });
    }
    return selectedLocations;
  }, [selectedLocations, availableLocationObjects, onReduxLocationChange]);

  // Helper function to clear date range
  const handleClearDateRange = () => {
    console.log('🧹 Clearing date range');
    
    // ✅ FIX: Clear both Redux and legacy state
    reduxDispatch(clearSalesSplitDashboardDateRange());
    
    // Update legacy Redux state for compatibility
    dispatch(updateSalesFilters({ 
      startDate: '',
      endDate: '',
      dateRangeType: 'Custom Date Range'
    }));
  };

  // ✅ FIX: Redux-based date handlers that update Sales Split Dashboard dates
  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = event.target.value;
    console.log('📅 Start date changed to:', newStartDate);
    
    // Update Sales Split Dashboard Redux state
    reduxDispatch(setSalesSplitDashboardStartDate(newStartDate));
    
    // Update legacy Redux state for compatibility
    dispatch(updateSalesFilters({ startDate: newStartDate }));
  };

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = event.target.value;
    console.log('📅 End date changed to:', newEndDate);
    
    // Update Sales Split Dashboard Redux state
    reduxDispatch(setSalesSplitDashboardEndDate(newEndDate));
    
    // Update legacy Redux state for compatibility
    dispatch(updateSalesFilters({ endDate: newEndDate }));
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* ✅ ENHANCED: Header with comprehensive status indicators including new flag */}
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
        {isManuallyTriggering && (
          <Chip 
            icon={<CircularProgress size={16} />}
            label="Applying Filters..."
            size="small"
            color="warning"
            variant="outlined"
          />
        )}
        {isApplyingDateRange && (
          <Chip 
            icon={<CircularProgress size={16} />}
            label="Setting Date Range..."
            size="small"
            color="info"
            variant="outlined"
          />
        )}
        {isManualDateRangeApply && (
          <Chip 
            icon={<CircularProgress size={16} />}
            label="Manual Date Range..."
            size="small"
            color="warning"
            variant="outlined"
          />
        )}
        <Chip 
          icon={<AutorenewIcon />}
          label={dateChangeSource === 'manual' ? 'Manual Mode' : 'Auto-Update'}
          size="small"
          color={dateChangeSource === 'manual' ? 'warning' : 'success'}
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
        {/* Location filter - Using Redux state */}
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
            disabled={isApplyingDateRange || isManualDateRangeApply}
          >
            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="body2" component="div">
                {currentStartDate && currentEndDate 
                  ? `${formatDisplayDate(currentStartDate)} - ${formatDisplayDate(currentEndDate)}`
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

      {/* Active filters display with comprehensive status */}
      {(displaySelectedLocations.length > 0 || selectedCategories.length > 0 || (currentStartDate && currentEndDate)) && (
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Active Filters:
            </Typography>
            {(isAutoFiltering || isManuallyTriggering || isApplyingDateRange || isManualDateRangeApply) && (
              <Box sx={{ ml: 2, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CircularProgress size={16} />
                <Typography variant="caption" color="primary">
                  {isManualDateRangeApply ? 'Manual Date Range...' :
                   isApplyingDateRange ? 'Setting Date Range...' : 
                   isManuallyTriggering ? 'Applying Filters...' : 'Auto-Updating...'}
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
            
            {currentStartDate && currentEndDate && (
              <Chip 
                label={`Date Range: ${formatDisplayDate(currentStartDate)} - ${formatDisplayDate(currentEndDate)}`} 
                color="secondary" 
                variant="outlined" 
                size="small" 
                icon={<CalendarTodayIcon />} 
                onDelete={handleClearDateRange}
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
                startDate: currentStartDate ? (() => {
                  // TIMEZONE-SAFE: Parse MM/DD/YYYY safely to avoid timezone issues
                  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(currentStartDate)) {
                    const [month, day, year] = currentStartDate.split('/').map(Number);
                    return new Date(year, month - 1, day, 12, 0, 0); // Set to noon to avoid timezone edge cases
                  }
                  return createDateSafely(currentStartDate);
                })() : new Date(),
                endDate: currentEndDate ? (() => {
                  // TIMEZONE-SAFE: Parse MM/DD/YYYY safely to avoid timezone issues  
                  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(currentEndDate)) {
                    const [month, day, year] = currentEndDate.split('/').map(Number);
                    return new Date(year, month - 1, day, 12, 0, 0); // Set to noon to avoid timezone edge cases
                  }
                  return createDateSafely(currentEndDate);
                })() : new Date(),
                key: 'selection'
              }
            ]}
            onSelect={handleDateRangeSelect}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDateRangeOpen(false)}>Cancel</Button>
          <Button 
            onClick={applyDateRange} 
            variant="contained" 
            color="primary"
            disabled={isApplyingDateRange || isManualDateRangeApply}
          >
            {(isApplyingDateRange || isManualDateRangeApply) ? 'Setting...' : 'Set Date Range'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FilterSection;
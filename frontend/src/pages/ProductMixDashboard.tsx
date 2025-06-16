import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Tabs,
  Tab,
  Button,
  useTheme,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  TextField,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Autocomplete,
  Popper,
  Paper,
  ClickAwayListener,
  MenuList,
  Popover,
  useMediaQuery,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import axios from "axios"; // Added axios import
import { format } from 'date-fns';

// Icons
import FilterListIcon from "@mui/icons-material/FilterList";
import RefreshIcon from "@mui/icons-material/Refresh";
import PlaceIcon from "@mui/icons-material/Place";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import PersonIcon from "@mui/icons-material/Person";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

// Updated imports for the dashboard components
import MenuAnalysisDashboard from "../components/SalesDashboard";
import MenuAnalysisDashboardtwo from "../components/MenuAnalysisDashboardtwo";
import DateRangeSelector from "../components/DateRangeSelector";
// Import MenuItemsTable component
import MenuItemsTable from "../components/MenuItemsTable";

// Import Redux hooks
import { useAppDispatch, useAppSelector } from "../typedHooks";
import {
  selectProductMixLocation,
  updateProductMixFilters,
  setTableData,
  addProductMixData,
  excelSlice,
} from "../store/excelSlice";

// Extract actions from the slice
const { setLoading, setError } = excelSlice.actions;

import { API_URL_Local } from "../constants"; // Import API base URL

// API URL for Product Mix filter
const PRODUCT_MIX_FILTER_API_URL = API_URL_Local + "/api/pmix/filter";

// =====================
// ENHANCED FORMATTING UTILITIES 
// =====================

/**
 * Format numbers with commas (e.g., 1234 -> "1,234")
 */
export const formatNumber = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === '' || isNaN(Number(value))) {
    return '0';
  }
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '0';
  
  // For whole numbers, don't show decimals
  if (Number.isInteger(numValue)) {
    return new Intl.NumberFormat('en-US').format(numValue);
  }
  
  // For decimals, format appropriately
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(numValue);
};

/**
 * Format currency values with commas (e.g., 1234.56 -> "$1,234.56")
 */
export const formatCurrency = (value: number | string | null | undefined, includeCents: boolean = true): string => {
  if (value === null || value === undefined || value === '' || isNaN(Number(value))) {
    return includeCents ? '$0.00' : '$0';
  }
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return includeCents ? '$0.00' : '$0';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: includeCents ? 2 : 0,
    maximumFractionDigits: includeCents ? 2 : 0,
  }).format(numValue);
};

/**
 * Format percentage values (e.g., 0.1234 -> "12.34%")
 */
export const formatPercentage = (value: number | string | null | undefined, decimals: number = 2): string => {
  if (value === null || value === undefined || value === '' || isNaN(Number(value))) {
    return '0.00%';
  }
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '0.00%';
  
  return `${numValue.toFixed(decimals)}%`;
};

/**
 * Specific formatter for SalesDashboard component data
 * Ensures Sales Categories Performance displays numbers with commas - NO ROUNDING
 */
const prepareSalesDashboardData = (data: any): any => {
  if (!data) return data;
  
  console.log('🎯 Preparing SalesDashboard data (NO ROUNDING):', data);
  
  // Clone the data
  const preparedData = { ...data };
  
  // CRITICAL: Special handling for table2 which powers the Sales Categories Performance section
  if (preparedData.table2) {
    preparedData.table2 = preparedData.table2.map((item: any) => {
      // Get the raw numeric values
      const rawSales = item.SalesRaw || item.Sales;
      const rawPercentage = item.PercentageRaw || item.Percentage;
      
      const processedItem = {
        ...item,
        
        // MAIN VALUES: Format with commas but preserve exact values
        Sales: typeof rawSales === 'number' ? formatNumber(rawSales) : String(rawSales || 0),
        Percentage: typeof rawPercentage === 'number' ? rawPercentage : (rawPercentage || 0),
        
        // RAW VALUES: Keep for calculations
        SalesRaw: typeof rawSales === 'number' ? rawSales : 0,
        PercentageRaw: typeof rawPercentage === 'number' ? rawPercentage : 0,
        
        // DISPLAY VALUES: Multiple formats for different components
        FormattedSales: typeof rawSales === 'number' ? formatNumber(rawSales) : '0',
        FormattedSalesWithCurrency: typeof rawSales === 'number' ? formatCurrency(rawSales, false) : '$0',
        FormattedPercentage: typeof rawPercentage === 'number' ? `${rawPercentage}%` : '0%',
        
        // NUMERIC VALUES: For charts and calculations
        NumericSales: typeof rawSales === 'number' ? rawSales : 0,
        NumericPercentage: typeof rawPercentage === 'number' ? rawPercentage : 0,
      };
      
      console.log('📊 SalesDashboard item prepared (EXACT VALUES):', {
        original: { Sales: rawSales, Percentage: rawPercentage },
        prepared: {
          Sales: processedItem.Sales,
          FormattedSales: processedItem.FormattedSales,
          FormattedSalesWithCurrency: processedItem.FormattedSalesWithCurrency,
          NumericSales: processedItem.NumericSales
        }
      });
      
      return processedItem;
    });
  }
  
  // ALSO: Apply same formatting to other relevant tables
  ['table3', 'table4', 'table5', 'table6'].forEach(tableName => {
    if (preparedData[tableName]) {
      preparedData[tableName] = preparedData[tableName].map((item: any) => ({
        ...item,
        // Ensure Sales values are formatted
        Sales: typeof item.SalesRaw === 'number' ? formatNumber(item.SalesRaw) : 
               typeof item.Sales === 'number' ? formatNumber(item.Sales) : item.Sales,
        
        FormattedSales: typeof item.SalesRaw === 'number' ? formatNumber(item.SalesRaw) :
                       typeof item.Sales === 'number' ? formatNumber(item.Sales) : '0',
      }));
    }
  });
  
  console.log('✅ SalesDashboard data prepared with EXACT FORMATTING:', preparedData);
  return preparedData;
};

/**
 * Debug component to show formatting status
 */
const FormattingDebugInfo: React.FC<{ data: any }> = ({ data }) => {
  if (!data?._formatting) return null;
  
  return ''
};

/**
 * Enhanced data transformation that applies formatting to numerical values
 * Special focus on Sales Categories Performance data (table2)
 */
const enhanceDataWithFormatting = (data: any): any => {
  if (!data) return data;
  
  // Deep clone to avoid mutations
  const enhancedData = JSON.parse(JSON.stringify(data));
  
  console.log('🔍 Raw data before formatting:', enhancedData);
  
  // Apply formatting to various tables
  if (enhancedData.table1) {
    enhancedData.table1 = enhancedData.table1.map((item: any) => ({
      ...item,
      // Format all numerical values in table1
      net_sales: item.net_sales?.map((val: any) => formatNumber(val)),
      orders: item.orders?.map((val: any) => formatNumber(val)),
      qty_sold: item.qty_sold?.map((val: any) => formatNumber(val)),
      average_order_value: item.average_order_value?.map((val: any) => formatCurrency(val)),
      average_items_per_order: item.average_items_per_order?.map((val: any) => formatNumber(val)),
    }));
  }
  
  // ENHANCED: Special handling for table2 - Sales Categories Performance
  if (enhancedData.table2) {
    console.log('🎯 Processing table2 (Sales Categories) before formatting:', enhancedData.table2);
    
    enhancedData.table2 = enhancedData.table2.map((item: any, index: number) => {
      const originalSales = item.Sales;
      const originalPercentage = item.Percentage;
      
      const formatted = {
        ...item,
        // CRITICAL: Keep original raw values for calculations
        SalesRaw: originalSales,
        PercentageRaw: originalPercentage,
        
        // OVERRIDE: Format sales values with commas - NO ROUNDING
        Sales: typeof originalSales === 'number' ? formatNumber(originalSales) : originalSales,
        
        // OVERRIDE: Format percentage - NO ROUNDING, preserve exact value
        Percentage: typeof originalPercentage === 'number' ? 
          formatPercentage(originalPercentage, 2) : 
          originalPercentage,
        
        // Additional formatted versions for different display needs
        DisplaySales: typeof originalSales === 'number' ? formatNumber(originalSales) : originalSales,
        DisplaySalesWithCurrency: typeof originalSales === 'number' ? formatCurrency(originalSales, false) : originalSales,
        DisplayPercentage: typeof originalPercentage === 'number' ? 
          `${originalPercentage}%` : originalPercentage,
        
        // For charts that need numeric values
        NumericSales: originalSales,
        NumericPercentage: originalPercentage,
      };
      
      console.log(`📊 Table2 item ${index} formatted (NO ROUNDING):`, {
        original: { Sales: originalSales, Percentage: originalPercentage },
        formatted: { 
          Sales: formatted.Sales, 
          Percentage: formatted.Percentage,
          DisplaySales: formatted.DisplaySales 
        }
      });
      
      return formatted;
    });
    
    console.log('✅ Table2 after formatting (EXACT VALUES WITH COMMAS):', enhancedData.table2);
  }
  
  // ENHANCED: table3 - Menu Group Sales
  if (enhancedData.table3) {
    console.log('🎯 Processing table3 (Menu Groups) before formatting:', enhancedData.table3);
    
    enhancedData.table3 = enhancedData.table3.map((item: any) => ({
      ...item,
      Sales: typeof item.Sales === 'number' ? formatNumber(item.Sales) : item.Sales,
      SalesRaw: item.Sales, // Keep raw value for calculations
      DisplaySales: typeof item.Sales === 'number' ? formatCurrency(item.Sales, false) : item.Sales,
    }));
  }
  
  // ENHANCED: table4 - Server Sales
  if (enhancedData.table4) {
    console.log('🎯 Processing table4 (Server Sales) before formatting:', enhancedData.table4);
    
    enhancedData.table4 = enhancedData.table4.map((item: any) => ({
      ...item,
      Sales: typeof item.Sales === 'number' ? formatNumber(item.Sales) : item.Sales,
      SalesRaw: item.Sales, // Keep raw value for calculations
      DisplaySales: typeof item.Sales === 'number' ? formatCurrency(item.Sales, false) : item.Sales,
    }));
  }
  
  // ENHANCED: table5 - Item Sales by Server
  if (enhancedData.table5) {
    console.log('🎯 Processing table5 (Item Sales) before formatting:', enhancedData.table5);
    
    enhancedData.table5 = enhancedData.table5.map((item: any) => ({
      ...item,
      Quantity: typeof item.Quantity === 'number' ? formatNumber(item.Quantity) : item.Quantity,
      QuantityRaw: item.Quantity, // Keep raw value for calculations
      Sales: typeof item.Sales === 'number' ? formatNumber(item.Sales) : item.Sales,
      SalesRaw: item.Sales, // Keep raw value for calculations
      DisplaySales: typeof item.Sales === 'number' ? formatCurrency(item.Sales, false) : item.Sales,
    }));
  }
  
  if (enhancedData.table6) {
    enhancedData.table6 = enhancedData.table6.map((item: any) => ({
      ...item,
      Sales: typeof item.Sales === 'number' ? formatCurrency(item.Sales, false) : item.Sales,
      SalesRaw: item.Sales, // Keep raw value for calculations
    }));
  }
  
  if (enhancedData.table7) {
    enhancedData.table7 = enhancedData.table7.map((item: any) => ({
      ...item,
      Price: typeof item.Price === 'number' ? formatCurrency(item.Price / 100) : item.Price, // Convert cents to dollars
      PriceRaw: item.Price, // Keep raw value for calculations
    }));
  }
  
  if (enhancedData.table8) {
    enhancedData.table8 = enhancedData.table8.map((item: any) => ({
      ...item,
      Change: typeof item.Change === 'number' ? formatNumber(item.Change) : item.Change,
      ChangeRaw: item.Change, // Keep raw value for calculations
    }));
  }
  
  if (enhancedData.table9) {
    enhancedData.table9 = enhancedData.table9.map((item: any) => ({
      ...item,
      Price: typeof item.Price === 'number' ? formatCurrency(item.Price / 100) : item.Price, // Convert cents to dollars
      PriceRaw: item.Price, // Keep raw value for calculations
    }));
  }
  
  // Format table12 (Menu Items Table) specifically
  if (enhancedData.table12) {
    enhancedData.table12 = enhancedData.table12.map((item: any) => ({
      ...item,
      // Quantity fields
      Quantity: typeof item.Quantity === 'number' ? formatNumber(item.Quantity) : item.Quantity,
      QuantityRaw: item.Quantity,
      
      // Sales/Revenue fields
      Sales: typeof item.Sales === 'number' ? formatCurrency(item.Sales, false) : item.Sales,
      SalesRaw: item.Sales,
      Revenue: typeof item.Revenue === 'number' ? formatCurrency(item.Revenue, false) : item.Revenue,
      RevenueRaw: item.Revenue,
      
      // Price fields
      Price: typeof item.Price === 'number' ? formatCurrency(item.Price) : item.Price,
      PriceRaw: item.Price,
      'Unit Price': typeof item['Unit Price'] === 'number' ? formatCurrency(item['Unit Price']) : item['Unit Price'],
      'Unit PriceRaw': item['Unit Price'],
      
      // Cost fields
      Cost: typeof item.Cost === 'number' ? formatCurrency(item.Cost) : item.Cost,
      CostRaw: item.Cost,
      'Food Cost': typeof item['Food Cost'] === 'number' ? formatCurrency(item['Food Cost']) : item['Food Cost'],
      'Food CostRaw': item['Food Cost'],
      
      // Percentage fields
      'Margin %': typeof item['Margin %'] === 'number' ? formatPercentage(item['Margin %']) : item['Margin %'],
      'Food Cost %': typeof item['Food Cost %'] === 'number' ? formatPercentage(item['Food Cost %']) : item['Food Cost %'],
      
      // Any other numerical fields
      ...Object.keys(item).reduce((acc, key) => {
        if (typeof item[key] === 'number' && !['Quantity', 'Sales', 'Revenue', 'Price', 'Unit Price', 'Cost', 'Food Cost', 'Margin %', 'Food Cost %'].includes(key)) {
          acc[key] = formatNumber(item[key]);
          acc[`${key}Raw`] = item[key];
        }
        return acc;
      }, {} as any)
    }));
  }
  
  // Add metadata about formatting
  enhancedData._formatting = {
    applied: true,
    timestamp: new Date().toISOString(),
    tables_processed: ['table1', 'table2', 'table3', 'table4', 'table5', 'table6', 'table7', 'table8', 'table9', 'table12'],
    formatting_functions: ['formatNumber', 'formatCurrency', 'formatPercentage'],
    special_handling: {
      table2: 'Sales Categories Performance with enhanced display values',
      table12: 'Menu Items Table with comprehensive formatting'
    }
  };
  
  console.log('📊 Enhanced data with comprehensive formatting:', enhancedData);
  return enhancedData;
};

// TabPanel Component
interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`product-mix-tabpanel-${index}`}
      aria-labelledby={`product-mix-tab-${index}`}
      {...other}
      style={{ width: "100%" }} // Add explicit width
    >
      {value === index && <Box sx={{ pt: 3, width: "100%" }}>{children}</Box>}
    </div>
  );
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
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  id,
  label,
  options,
  value,
  onChange,
  icon,
  placeholder,
}) => {
  const [searchText, setSearchText] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

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

// Main Dashboard Component
export default function ProductMixDashboard() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  // Get Product Mix data from Redux
  const {
    productMixFiles,
    productMixLocations,
    currentProductMixLocation,
    productMixFilters,
    loading,
    error,
  } = useAppSelector((state) => state.excel);

  // Find current data for the selected location
  const currentProductMixData = productMixFiles.find(
    (f) => f.location === currentProductMixLocation
  )?.data;

  // Find current file info
  const currentProductMixFile = productMixFiles.find(
    (f) => f.location === currentProductMixLocation
  );

  // State variables
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [filterError, setFilterError] = useState<string>("");
  const [dataUpdated, setDataUpdated] = useState<boolean>(false);

  // UPDATED: No default date range - empty state
  const [localStartDate, setLocalStartDate] = useState<string>("");
  const [localEndDate, setLocalEndDate] = useState<string>("");
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
  });

  // Extract filter options from actual data
  const locations =
    productMixLocations.length > 0
      ? productMixLocations
      : ["No locations available"];
  const servers = currentProductMixData?.servers?.filter(
    (server) => !server.includes("DO NOT CHANGE")
  ) || ["No servers available"];
  const categories = currentProductMixData?.categories || [
    "In-House",
    "DD",
    "1P",
    "GH",
    "Catering",
    "UB",
    "Others",
  ];
  const menuItems = currentProductMixData?.table7
    ?.map((item) => item["Menu Item"])
    .filter(Boolean) || ["No menu items available"];

  // UPDATED: Filter states using multiselect arrays - No defaults, but initially select all available locations
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedServers, setSelectedServers] = useState<string[]>([]);
  const [selectedMenuItems, setSelectedMenuItems] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [hasInitializedLocations, setHasInitializedLocations] = useState(false);

  // Initially select all available locations (not a default, just initial state)
  useEffect(() => {
    if (
      !hasInitializedLocations && 
      productMixLocations.length > 0 && 
      !productMixLocations.includes("No locations available") &&
      selectedLocations.length === 0
    ) {
      // Initially select ALL available locations
      setSelectedLocations([...productMixLocations]);
      setHasInitializedLocations(true);
      console.log('📍 Initially selecting all available locations:', productMixLocations);
    }
  }, [productMixLocations, selectedLocations.length, hasInitializedLocations]);

  // Clear dataUpdated state when filters change
  useEffect(() => {
    setDataUpdated(false);
  }, [selectedLocations, localStartDate, localEndDate, selectedServers, selectedCategories, selectedMenuItems]);

  // Handlers for filter changes
  const handleLocationChange = (newValue: string[]) => {
    setSelectedLocations(newValue);
    // Update Redux state
    if (newValue.length > 0) {
      dispatch(selectProductMixLocation(newValue[0]));
      dispatch(updateProductMixFilters({ location: newValue[0] }));
    }
  };

  // Date range handling - following DateRangeSelector pattern
  const openDateRangePicker = () => {
    setIsDateRangeOpen(true);
  };

  const handleDateRangeSelect = (range: any) => {
    setSelectedRange(range);
  };

  const applyDateRange = () => {
    const formattedStartDate = format(selectedRange.startDate, 'MM/dd/yyyy');
    const formattedEndDate = format(selectedRange.endDate, 'MM/dd/yyyy');
    
    console.log('📅 ProductMix: Setting date range locally:', {
      startDate: formattedStartDate,
      endDate: formattedEndDate
    });
    
    // Update local state
    setLocalStartDate(formattedStartDate);
    setLocalEndDate(formattedEndDate);
    
    // Update Redux state for persistence
    dispatch(updateProductMixFilters({ 
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

  const handleServerChange = (newValue: string[]) => {
    setSelectedServers(newValue);
    dispatch(updateProductMixFilters({ server: newValue.join(",") }));
  };

  const handleMenuItemChange = (newValue: string[]) => {
    setSelectedMenuItems(newValue);
    dispatch(updateProductMixFilters({ menuItem: newValue.join(",") }));
  };

  const handleCategoryChange = (newValue: string[]) => {
    setSelectedCategories(newValue);
    dispatch(updateProductMixFilters({ category: newValue.join(",") }));
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // UPDATED: Clear all filters - no default values, resets initialization
  const handleClearAllFilters = () => {
    setSelectedLocations([]);
    setLocalStartDate("");
    setLocalEndDate("");
    setSelectedServers([]);
    setSelectedCategories([]);
    setSelectedMenuItems([]);
    setDataUpdated(false);
    setFilterError("");
    setHasInitializedLocations(false); // Reset initialization flag
    
    // Reset Redux filters
    dispatch(updateProductMixFilters({
      location: "",
      startDate: "",
      endDate: "",
      server: "",
      category: "",
      selectedCategories: [],
      dateRangeType: ""
    }));
  };

  // UPDATED: Handle Apply Filters with validation - FIXED to send multiple locations
const handleApplyFilters = async () => {
  // Validate required filters (only locations are required)
  if (selectedLocations.length === 0) {
    setFilterError("Please select at least one location");
    return;
  }

  setIsLoading(true);
  setFilterError("");
  setDataUpdated(false);

  try {
    // Check if we have any files loaded
    if (!currentProductMixFile) {
      throw new Error("No Product Mix data found for selected location");
    }

    console.log("🔄 Starting Product Mix filter process...");

    // Format dates correctly for API (convert MM/dd/yyyy to yyyy-MM-dd)
    let formattedStartDate: string | null = null;
    let formattedEndDate: string | null = null;
    
    if (localStartDate) {
      const dateParts = localStartDate.split('/');
      if (dateParts.length === 3) {
        formattedStartDate = `${dateParts[2]}-${dateParts[0].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}`;
      }
    }
    
    if (localEndDate) {
      const dateParts = localEndDate.split('/');
      if (dateParts.length === 3) {
        formattedEndDate = `${dateParts[2]}-${dateParts[0].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}`;
      }
    }

    // FIXED: Prepare the request payload to handle multiple locations
    const payload = {
      fileName: currentProductMixFile.fileName,
      // FIXED: Send all selected locations instead of just the first one
      locations: selectedLocations, // Send as array
      location: selectedLocations.length === 1 ? selectedLocations[0] : null, // Keep single location for backward compatibility
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      servers: selectedServers,
      categories: selectedCategories,
      menuItems: selectedMenuItems,
      dashboard: "Product Mix",
    };

    console.log("🚀 Sending Product Mix filter request with multiple locations:", payload);

    // Make API call to Product Mix filter endpoint
    const response = await axios.post(PRODUCT_MIX_FILTER_API_URL, payload);

    console.log("📥 Received Product Mix filter response:", response.data);

    if (response.data) {
      // ENHANCED: Apply formatting to the response data
      const formattedResponseData = enhanceDataWithFormatting(response.data);
      
      // Extract categories from the filtered data
      const extractedCategories = formattedResponseData.categories || selectedCategories;

      // Create enhanced data with filter metadata
      const enhancedData = {
        ...formattedResponseData,
        categories: extractedCategories,
        filterApplied: true,
        filterTimestamp: new Date().toISOString(),
        appliedFilters: {
          // FIXED: Store all selected locations
          locations: selectedLocations, // Array of all selected locations
          location: selectedLocations.length === 1 ? selectedLocations[0] : `${selectedLocations.length} locations`, // Display string
          startDate: localStartDate,
          endDate: localEndDate,
          servers: selectedServers,
          categories: selectedCategories,
          menuItems: selectedMenuItems,
        }
      };

      console.log("📊 Enhanced data with filters and formatting:", enhancedData);

      // Update general table data (for compatibility)
      dispatch(setTableData(enhancedData));

      // IMPORTANT: Update Product Mix data for ALL selected locations
      selectedLocations.forEach(location => {
        dispatch(addProductMixData({
          location: location,
          data: enhancedData,
          fileName: currentProductMixFile.fileName,
          fileContent: currentProductMixFile.fileContent || ""
        }));
      });

      // Update Redux filters with all selected locations
      dispatch(updateProductMixFilters({
        locations: selectedLocations, // Store array
        location: selectedLocations.length === 1 ? selectedLocations[0] : selectedLocations.join(","), // Join for display
        startDate: localStartDate,
        endDate: localEndDate,
        servers: selectedServers.join(","),
        categories: selectedCategories.join(","),
        menuItems: selectedMenuItems.join(","),
        selectedCategories: selectedCategories,
        dateRangeType: (localStartDate && localEndDate) ? "Custom Date Range" : ""
      }));

      setDataUpdated(true);
      console.log("✅ Product Mix filters applied successfully for locations:", selectedLocations);

      // Show success message
      setFilterError("");
      
    } else {
      throw new Error("Invalid response data from Product Mix filter API");
    }

  } catch (error) {
    console.error("❌ Product Mix filter error:", error);
    
    let errorMessage = "Error applying Product Mix filters";
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const detail = error.response.data?.detail;
        errorMessage = `Server error: ${detail || error.response.status}`;
        
        if (detail && typeof detail === 'string' && detail.includes('isinf')) {
          errorMessage = 'Backend error: Please update the backend code to use numpy.isinf instead of pandas.isinf';
        } else if (error.response.status === 404) {
          errorMessage = 'Product Mix filter API endpoint not found. Is the server running?';
        } else if (error.response.status === 500) {
          errorMessage = 'Internal server error. Please check the server logs.';
        }
      } else if (error.request) {
        errorMessage = 'Cannot connect to server. Please check your connection and server status.';
      }
    } else if (error instanceof Error) {
      errorMessage = `Product Mix filter error: ${error.message}`;
    }
    
    setFilterError(errorMessage);
    setDataUpdated(false);
    
    // Clear loading state
    dispatch(setLoading(false));
  } finally {
    setIsLoading(false);
  }
};

// OPTIONAL: Helper function to handle single location backward compatibility
const handleSingleLocationFilter = async (location: string) => {
  // Set selectedLocations to single location and apply filters
  setSelectedLocations([location]);
  
  // Wait for state update and then apply filters
  setTimeout(() => {
    handleApplyFilters();
  }, 100);
};

// UPDATED: Enhanced filter display to show multiple locations properly
const formatSelectedLocationsDisplay = (locations: string[]) => {
  if (locations.length === 0) return "No locations selected";
  if (locations.length === 1) return locations[0];
  if (locations.length <= 3) return locations.join(", ");
  return `${locations.slice(0, 2).join(", ")} and ${locations.length - 2} more`;
};

  // Calculate grid sizing based on mobile/tablet status
  const getGridSizes = () => {
    if (isMobile) {
      return { xs: 12 };
    } else if (isTablet) {
      return { xs: 12, sm: 6 };
    } else {
      return { xs: 12, sm: 6, md: 3 };
    }
  };

  const gridSizes = getGridSizes();

  // Inject the rotating animation styles for the refresh icon
  React.useEffect(() => {
    const styleElement = document.createElement("style");
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

  // ENHANCED: Apply formatting to current data before rendering
  const formattedCurrentData = enhanceDataWithFormatting(currentProductMixData);
  
  // ENHANCED: Prepare data specifically for SalesDashboard component
  const salesDashboardData = prepareSalesDashboardData(formattedCurrentData);

  return (
    <Box sx={{ 
      p: { xs: 1, sm: 2, md: 3 },
      width: "100%",  // Ensure full width
      maxWidth: "none",  // Remove any max-width constraints
      boxSizing: "border-box"  // Include padding in width calculation
    }}>
      {/* Dashboard Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
          width: "100%"  // Add explicit width
        }}
      >
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'center',
          width: '100%'
        }}>
          <h1 
            style={{ 
              fontWeight: 800,
              background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: 'clamp(1.75rem, 5vw, 3rem)',
              marginBottom: '8px',
              letterSpacing: '-0.02em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              margin: '0',
              textAlign: 'center'
            }}
          >
            <span style={{ 
              color: '#1976d2',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
              fontSize: 'inherit',
              display: 'inline-flex',
              alignItems: 'center'
            }}>
              <svg 
                width="1em" 
                height="1em" 
                viewBox="0 0 100 100" 
                fill="currentColor"
                style={{ fontSize: 'inherit' }}
              >
                {/* 4-square logo matching your design */}
                <rect x="10" y="10" width="35" height="35" rx="4" fill="#5A8DEE"/>
                <rect x="55" y="10" width="35" height="35" rx="4" fill="#4285F4"/>
                <rect x="10" y="55" width="35" height="35" rx="4" fill="#1976D2"/>
                <rect x="55" y="55" width="35" height="35" rx="4" fill="#3F51B5"/>
              </svg>
            </span>
            Product Mix Dashboard
          </h1>
        </div>
      </Box>

      {/* Alert message when no data is available */}
      {!currentProductMixData && (
        <Alert severity="info" sx={{ mb: 3, width: "100%" }}>
          No Product Mix data available. Please upload files with "Product Mix"
          dashboard type from the Excel Upload page.
        </Alert>
      )}

      {/* Error Alert */}
      {(filterError || error) && (
        <Alert
          severity="error"
          sx={{ mb: 3, width: "100%" }}
          onClose={() => {
            setFilterError("");
            dispatch(setError(null));
          }}
        >
          {filterError || error}
        </Alert>
      )}

      {/* Success Alert for Data Update with Formatting Info */}
      {dataUpdated && (
        <Alert 
          severity="success" 
          sx={{ mb: 3, width: "100%" }}
          onClose={() => setDataUpdated(false)}
        >
          <Typography variant="body2">
            <strong>✅ Filters Applied Successfully!</strong> Product Mix data has been updated with your selected filters and enhanced number formatting.
            {formattedCurrentData?.filterApplied && (
              <>
                <br />
                <strong>Applied on:</strong> {new Date(formattedCurrentData.filterTimestamp).toLocaleString()}
                <br />
                <strong>🔢 Number Formatting:</strong> All numerical values now display with proper comma separators for better readability.
                <br />
                <strong>📊 Sales Categories:</strong> Category performance data formatted for enhanced display.
              </>
            )}
          </Typography>
        </Alert>
      )}

      {/* Debug Info for Development */}
      {formattedCurrentData && (
        <FormattingDebugInfo data={formattedCurrentData} />
      )}

      {/* Filters Section */}
      <Card elevation={3} sx={{ 
        mb: 3, 
        borderRadius: 2, 
        overflow: "hidden",
        width: "100%",  // Add explicit width
        maxWidth: "none"  // Remove any max-width constraints
      }}>
        <CardContent sx={{ p: { xs: 2, md: 3 }, width: "100%" }}>
          {/* Filter Header */}
          <Box sx={{ mb: 2, width: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FilterListIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                Filters
              </Typography>
              <Chip 
                label="🔢 Enhanced Formatting" 
                size="small" 
                color="secondary" 
                variant="outlined"
                sx={{ ml: 1 }}
              />
            </Box>
          </Box>

          <Grid container spacing={2} sx={{ width: "100%" }}>
            {/* Location filter */}
            <Grid item {...gridSizes}>
              <MultiSelect
                id="location-select"
                label="Location"
                options={locations}
                value={selectedLocations}
                onChange={handleLocationChange}
                icon={<PlaceIcon />}
                placeholder="All locations initially selected"
              />
            </Grid>

            {/* Date Range filter - Updated to be optional */}
            <Grid item {...gridSizes}>
              <Box sx={{ position: "relative", width: "100%" }}>
                <InputLabel
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
                  Date Range
                </InputLabel>
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
                    color: (!localStartDate || !localEndDate) ? 'text.secondary' : 'text.primary',
                    padding: '8px 14px',
                    '&:hover': {
                      borderColor: 'primary.main',
                    }
                  }}
                >
                  <Box sx={{ textAlign: 'left', flexGrow: 1 }}>
                    <Typography variant="body2" component="div" sx={{ fontSize: '0.875rem' }}>
                      {(!localStartDate || !localEndDate) 
                        ? "Select date range (optional)" 
                        : `${formatDisplayDate(localStartDate)} - ${formatDisplayDate(localEndDate)}`
                      }
                    </Typography>
                  </Box>
                </Button>
              </Box>
            </Grid>

            {/* Category filter */}
            <Grid item {...gridSizes}>
              <MultiSelect
                id="category-select"
                label="Dining Options"
                options={categories}
                value={selectedCategories}
                onChange={handleCategoryChange}
                icon={<FastfoodIcon />}
                placeholder="Select dining options"
              />
            </Grid>
            
            {/* Server filter - conditional based on tab */}
            <Grid item {...gridSizes}>
              {tabValue === 0 ? (
                <MultiSelect
                  id="server-select"
                  label="Server"
                  options={servers}
                  value={selectedServers}
                  onChange={handleServerChange}
                  icon={<PersonIcon />}
                  placeholder="Select servers (optional)"
                />
              ) : (
                <></>
              )}
            </Grid>
          </Grid>

          {/* Active filters display */}
          {(selectedLocations.length > 0 ||
            (localStartDate && localEndDate) ||
            selectedServers.length > 0 ||
            selectedMenuItems.length > 0 ||
            selectedCategories.length > 0) && (
            <Box sx={{ mt: 2, width: "100%" }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                Active Filters:
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
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

                {(localStartDate && localEndDate) && (
                  <Chip
                    label={`Date Range: ${formatDisplayDate(localStartDate)} - ${formatDisplayDate(localEndDate)}`}
                    color="secondary"
                    variant="outlined"
                    size="small"
                    icon={<CalendarTodayIcon />}
                    onDelete={() => {
                      setLocalStartDate("");
                      setLocalEndDate("");
                    }}
                  />
                )}

                {tabValue === 0 && selectedServers.length > 0 && (
                  <Chip
                    label={
                      selectedServers.length === 1
                        ? `Server: ${selectedServers[0]}`
                        : `Servers: ${selectedServers.length} selected`
                    }
                    color="info"
                    variant="outlined"
                    size="small"
                    icon={<PersonIcon />}
                    onDelete={() => setSelectedServers([])}
                  />
                )}

                {tabValue === 1 && selectedMenuItems.length > 0 && (
                  <Chip
                    label={
                      selectedMenuItems.length === 1
                        ? `Menu Item: ${selectedMenuItems[0]}`
                        : `Menu Items: ${selectedMenuItems.length} selected`
                    }
                    color="success"
                    variant="outlined"
                    size="small"
                    icon={<RestaurantMenuIcon />}
                    onDelete={() => setSelectedMenuItems([])}
                  />
                )}

                {selectedCategories.length > 0 && (
                  <Chip
                    label={
                      selectedCategories.length === 1
                        ? `Category: ${selectedCategories[0]}`
                        : `Categories: ${selectedCategories.length} selected`
                    }
                    color="error"
                    variant="outlined"
                    size="small"
                    icon={<FastfoodIcon />}
                    onDelete={() => setSelectedCategories([])}
                  />
                )}
              </Box>
            </Box>
          )}

          {/* UPDATED: Apply Filters Button with validation feedback */}
          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-start", gap: 2, width: "100%" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleApplyFilters}
              disabled={
                isLoading || 
                loading || 
                !currentProductMixFile ||
                selectedLocations.length === 0
              }
              startIcon={
                isLoading || loading ? (
                  <CircularProgress size={16} />
                ) : (
                  <RefreshIcon />
                )
              }
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              {isLoading || loading ? "Loading..." : "APPLY FILTERS & FORMAT"}
            </Button>

            {/* Clear All Filters Button - Show if any filters are applied */}
            {(selectedLocations.length > 0 || 
              selectedServers.length > 0 || 
              selectedCategories.length > 0 || 
              selectedMenuItems.length > 0 ||
              localStartDate ||
              localEndDate) && (
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleClearAllFilters}
                disabled={isLoading || loading}
                startIcon={<CloseIcon />}
                sx={{ 
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                  }
                }}
              >
                CLEAR ALL FILTERS
              </Button>
            )}
          </Box>

         
          {/* Validation message for required fields */}
          {selectedLocations.length === 0 && (
            <Alert severity="warning" sx={{ mt: 2, width: "100%" }}>
              <Typography variant="body2">
                <strong>Required:</strong> Please select at least one location to apply filters and formatting.
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Only render dashboard content if data is available */}
      {currentProductMixData && (
        <>
          {/* Tabs */}
          <Card
            sx={{ 
              borderRadius: 2, 
              mb: 3, 
              overflow: "hidden",
              width: "100%",  // Add explicit width
              maxWidth: "none"  // Remove any max-width constraints
            }}
            elevation={3}
          >
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                width: "100%",  // Ensure tabs take full width
                "& .MuiTab-root": {
                  fontWeight: 500,
                  textTransform: "none",
                  fontSize: "1rem",
                  py: 1.5,
                },
                "& .Mui-selected": {
                  color: "#4285f4",
                  fontWeight: 600,
                },
                "& .MuiTabs-indicator": {
                  backgroundColor: "#4285f4",
                  height: 3,
                },
              }}
            >
              <Tab label="Performance" />
            </Tabs>

            {/* Server Performance Tab */}
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ 
                p: { xs: 1, sm: 2, md: 3 },
                width: "100%",  // Add explicit width
                boxSizing: "border-box"  // Ensure padding doesn't affect width
              }}>
                {isLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                    <CircularProgress size={40} />
                    <Typography sx={{ ml: 2 }}>Updating dashboard data with enhanced formatting...</Typography>
                  </Box>
                ) : (
                  <Box sx={{ width: "100%" }}>  {/* Add explicit width */}
                    {/* Sales Dashboard Component - Now receives specially formatted data */}
                    <MenuAnalysisDashboard 
                      key={`performance-${currentProductMixLocation}-${salesDashboardData?.filterTimestamp || 'original'}`}
                      productMixData={salesDashboardData} 
                    />
                    
                    {/* Divider */}
                    <Box sx={{ my: 4, width: "100%" }}>  {/* Add explicit width */}
                      <Divider sx={{ borderColor: '#e0e0e0', borderWidth: 1 }} />
                    </Box>
                    
                    {/* Menu Items Table Component - Now receives formatted data */}
                    <Box sx={{ 
                      mt: 4, 
                      width: "100%",  // Add explicit width
                      overflow: "hidden"  // Prevent any overflow issues
                    }}>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          mb: 3,
                          fontWeight: 600,
                          color: 'rgb(9, 43, 117)',
                          textAlign: 'center'
                        }}
                      >
                        📊 Menu Items Analysis (Enhanced with Comma Formatting - NO ROUNDING)
                      </Typography>
                      <MenuItemsTable 
                        key={`menu-items-${currentProductMixLocation}-${formattedCurrentData?.filterTimestamp || 'original'}`}
                        table12={formattedCurrentData?.table12 || []} 
                      />
                    </Box>
                  </Box>
                )}
              </Box>
            </TabPanel>

            {/* Menu Analysis Tab */}
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ 
                p: { xs: 1, sm: 2, md: 3 },
                width: "100%",  // Add explicit width
                boxSizing: "border-box"
              }}>
                {isLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                    <CircularProgress size={40} />
                    <Typography sx={{ ml: 2 }}>Updating dashboard data with enhanced formatting...</Typography>
                  </Box>
                ) : (
                  <MenuAnalysisDashboardtwo
                    key={`menu-analysis-${currentProductMixLocation}-${formattedCurrentData?.filterTimestamp || 'original'}`}
                    productMixData={formattedCurrentData}
                  />
                )}
              </Box>
            </TabPanel>
          </Card>
        </>
      )}

      {/* Show message if no data available */}
      {!currentProductMixData && productMixFiles.length === 0 && (
        <Card sx={{ borderRadius: 2, mb: 3, p: 3, width: "100%" }}>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            href="/upload-excel"
          >
            Go to Upload Page
          </Button>
        </Card>
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
                startDate: selectedRange.startDate,
                endDate: selectedRange.endDate,
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
}
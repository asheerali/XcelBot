import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
import axios from "axios";
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
import BusinessIcon from "@mui/icons-material/Business";
import AutorenewIcon from "@mui/icons-material/Autorenew";

// Updated imports for the dashboard components
import MenuAnalysisDashboard from "../components/SalesDashboard";
import MenuAnalysisDashboardtwo from "../components/MenuAnalysisDashboardtwo";
import DateRangeSelector from "../components/DateRangeSelector";
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

// Import masterFileSlice Redux
import { useSelector, useDispatch } from "react-redux";
import {
  setSelectedCompanies, 
  setSelectedLocations,
  selectSelectedCompanies,
  selectSelectedLocations 
} from "../store/slices/masterFileSlice";

// NEW: Import Redux date range actions and selectors
import {
  setProductMixDashboardDateRange,
  setProductMixDashboardStartDate,
  setProductMixDashboardEndDate,
  clearProductMixDashboardDateRange,
  selectProductMixDashboardStartDate,
  selectProductMixDashboardEndDate,
  selectProductMixDashboardDateRange,
  selectHasProductMixDashboardDateRange,
} from "../store/slices/dateRangeSlice";

// Extract actions from the slice
const { setLoading, setError } = excelSlice.actions;

import { API_URL_Local } from "../constants";

// API URLs
const PRODUCT_MIX_FILTER_API_URL = API_URL_Local + "/api/pmix/filter";
const COMPANY_LOCATIONS_API_URL = API_URL_Local + "/company-locations/all";

// Interfaces
interface Company {
  company_id: number;
  company_name: string;
  locations: Location[];
}

interface Location {
  location_id: number;
  location_name: string;
}

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
 * Clean a value by removing commas, currency symbols, and converting to number
 */
const cleanAndParseValue = (value: any): number => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  
  // Convert to string and remove commas, $, and other formatting
  const cleanedValue = String(value)
    .replace(/[$,]/g, '') // Remove $ and commas
    .trim();
  
  const parsed = parseFloat(cleanedValue);
  return isNaN(parsed) ? 0 : parsed;
};
/**
 * Specific formatter for SalesDashboard component data
 */
const prepareSalesDashboardData = (data: any): any => {
  if (!data) return data;
  
  console.log('🎯 Preparing SalesDashboard data (PRESERVING TABLE1, USING TABLE11):', data);
  
  // Clone the data
  const preparedData = { ...data };
  
  // Preserve table1 formatting from enhanceDataWithFormatting
  if (preparedData.table1) {
    console.log('🔧 Preserving table1 formatting for KPI cards:', preparedData.table1);
    preparedData.table1 = [...preparedData.table1];
    console.log('✅ Table1 preserved for KPI cards:', preparedData.table1);
  }
  
  // Special handling for table11 which powers the Sales Categories Performance section
  if (preparedData.table11) {
    console.log('🎯 Processing table11 (Sales Categories from backend) before formatting:', preparedData.table11);
    
    // Transform table11 to match the expected table2 format for the dashboard
    preparedData.table2 = preparedData.table11.map((item: any, index: number) => {
      const thisPeriodSales = item.This_4_Weeks_Sales || 0;
      const lastPeriodSales = item.Last_4_Weeks_Sales || 0;
      const percentChange = item.Percent_Change || 0;
      const category = item['Sales Category'] || `Category ${index + 1}`;
      
      const formatted = {
        // Original table11 fields preserved
        ...item,
        
        // Transformed fields for dashboard compatibility
        Category: category,
        'Sales Category': category,
        
        // Sales data - use This_4_Weeks_Sales as primary sales value
        Sales: thisPeriodSales,
        SalesRaw: thisPeriodSales,
        
        // Percentage data - use Percent_Change from backend
        Percentage: percentChange,
        PercentageRaw: percentChange,
        
        // Additional comparison data
        ThisPeriodSales: thisPeriodSales,
        LastPeriodSales: lastPeriodSales,
        SalesChange: thisPeriodSales - lastPeriodSales,
        
        // Multiple formats for different components
        FormattedSales: formatNumber(thisPeriodSales),
        FormattedSalesWithCurrency: formatCurrency(thisPeriodSales, false),
        FormattedPercentage: `${percentChange}%`,
        
        // NUMERIC VALUES: For charts and calculations
        NumericSales: thisPeriodSales,
        NumericPercentage: percentChange,
        
        // Display values for different contexts
        DisplaySales: formatNumber(thisPeriodSales),
        DisplaySalesWithCurrency: formatCurrency(thisPeriodSales, false),
        DisplayPercentage: `${percentChange}%`,
      };
      
      return formatted;
    });
    
    console.log('✅ Table11 transformed to Table2 format for Sales Categories Performance:', preparedData.table2);
  }
  
  // Apply same formatting to other relevant tables
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
  
  console.log('✅ SalesDashboard data prepared with TABLE1 PRESERVED and TABLE11->TABLE2 TRANSFORMATION:', preparedData);
  return preparedData;
};

/**
 * Enhanced data transformation that handles table11
 */
const enhanceDataWithFormatting = (data: any): any => {
  if (!data) return data;
  
  // Deep clone to avoid mutations
  const enhancedData = JSON.parse(JSON.stringify(data));
  
  console.log('🔍 Raw data before formatting (looking for table11):', enhancedData);
  
  // Apply formatting to table1 - Handle pre-formatted values
  if (enhancedData.table1) {
    console.log('🎯 Processing table1 BEFORE fix:', enhancedData.table1);
    
    enhancedData.table1 = enhancedData.table1.map((item: any) => {
      console.log('🔧 Fixing table1 item:', item);
      
      const result = {
        ...item,
        
        // Clean values before formatting
        net_sales: (() => {
          const rawValue = Array.isArray(item.net_sales) ? item.net_sales[0] : item.net_sales;
          const cleanValue = cleanAndParseValue(rawValue);
          const formatted = cleanValue > 0 ? formatNumber(cleanValue) : '0';
          return formatted;
        })(),
        net_sales_raw: (() => {
          const rawValue = Array.isArray(item.net_sales) ? item.net_sales[0] : item.net_sales;
          return cleanAndParseValue(rawValue);
        })(),
        
        orders: (() => {
          const rawValue = Array.isArray(item.orders) ? item.orders[0] : item.orders;
          const cleanValue = cleanAndParseValue(rawValue);
          const formatted = cleanValue > 0 ? formatNumber(cleanValue) : '0';
          return formatted;
        })(),
        orders_raw: (() => {
          const rawValue = Array.isArray(item.orders) ? item.orders[0] : item.orders;
          return cleanAndParseValue(rawValue);
        })(),
        
        qty_sold: (() => {
          const rawValue = Array.isArray(item.qty_sold) ? item.qty_sold[0] : item.qty_sold;
          const cleanValue = cleanAndParseValue(rawValue);
          const formatted = cleanValue > 0 ? formatNumber(cleanValue) : '0';
          return formatted;
        })(),
        qty_sold_raw: (() => {
          const rawValue = Array.isArray(item.qty_sold) ? item.qty_sold[0] : item.qty_sold;
          return cleanAndParseValue(rawValue);
        })(),
        
        total_quantity: (() => {
          const rawValue = Array.isArray(item.total_quantity) ? item.total_quantity[0] : item.total_quantity;
          const cleanValue = cleanAndParseValue(rawValue);
          const formatted = cleanValue > 0 ? formatNumber(cleanValue) : '0';
          return formatted;
        })(),
        total_quantity_raw: (() => {
          const rawValue = Array.isArray(item.total_quantity) ? item.total_quantity[0] : item.total_quantity;
          return cleanAndParseValue(rawValue);
        })(),
        
        average_order_value: (() => {
          const rawValue = Array.isArray(item.average_order_value) ? item.average_order_value[0] : item.average_order_value;
          const cleanValue = cleanAndParseValue(rawValue);
          const formatted = cleanValue > 0 ? formatCurrency(cleanValue) : '$0.00';
          return formatted;
        })(),
        average_order_value_raw: (() => {
          const rawValue = Array.isArray(item.average_order_value) ? item.average_order_value[0] : item.average_order_value;
          return cleanAndParseValue(rawValue);
        })(),
        
        average_items_per_order: (() => {
          const rawValue = Array.isArray(item.average_items_per_order) ? item.average_items_per_order[0] : item.average_items_per_order;
          const cleanValue = cleanAndParseValue(rawValue);
          const formatted = cleanValue > 0 ? formatNumber(cleanValue) : '0';
          return formatted;
        })(),
        average_items_per_order_raw: (() => {
          const rawValue = Array.isArray(item.average_items_per_order) ? item.average_items_per_order[0] : item.average_items_per_order;
          return cleanAndParseValue(rawValue);
        })(),
        
        // Additional field variations - using cleaned values
        NetSales: (() => {
          const rawValue = Array.isArray(item.net_sales) ? item.net_sales[0] : item.net_sales;
          const cleanValue = cleanAndParseValue(rawValue);
          return cleanValue > 0 ? formatNumber(cleanValue) : '0';
        })(),
        'Net Sales': (() => {
          const rawValue = Array.isArray(item.net_sales) ? item.net_sales[0] : item.net_sales;
          const cleanValue = cleanAndParseValue(rawValue);
          return cleanValue > 0 ? formatNumber(cleanValue) : '0';
        })(),
        
        // Keep change values as is
        net_sales_change: item.net_sales_change?.[0] || item.net_sales_change || 0,
        orders_change: item.orders_change?.[0] || item.orders_change || 0,
        qty_sold_change: item.qty_sold_change?.[0] || item.qty_sold_change || 0,
        average_order_value_change: item.average_order_value_change?.[0] || item.average_order_value_change || 0,
        average_items_per_order_change: item.average_items_per_order_change?.[0] || item.average_items_per_order_change || 0,
      };
      
      return result;
    });
    
    console.log('✅ Table1 AFTER fix (should show cleaned values):', enhancedData.table1);
  }
  
  // Process table11 (Sales Categories from backend)
  if (enhancedData.table11) {
    console.log('🎯 Processing table11 (Sales Categories from backend) before formatting:', enhancedData.table11);
    
    enhancedData.table11 = enhancedData.table11.map((item: any, index: number) => {
      const originalThisPeriodSales = item.This_4_Weeks_Sales || 0;
      const originalLastPeriodSales = item.Last_4_Weeks_Sales || 0;
      const originalPercentChange = item.Percent_Change || 0;
      const originalCategory = item['Sales Category'] || `Category ${index + 1}`;
      
      const formatted = {
        ...item,
        
        // Keep original backend fields
        'Sales Category': originalCategory,
        This_4_Weeks_Sales: originalThisPeriodSales,
        Last_4_Weeks_Sales: originalLastPeriodSales,
        Percent_Change: originalPercentChange,
        
        // Add formatted versions for display
        This_4_Weeks_Sales_Formatted: formatNumber(originalThisPeriodSales),
        This_4_Weeks_Sales_Currency: formatCurrency(originalThisPeriodSales, false),
        Last_4_Weeks_Sales_Formatted: formatNumber(originalLastPeriodSales),
        Last_4_Weeks_Sales_Currency: formatCurrency(originalLastPeriodSales, false),
        Percent_Change_Formatted: `${originalPercentChange}%`,
        
        // Additional fields for compatibility
        Category: originalCategory,
        CurrentSales: originalThisPeriodSales,
        PreviousSales: originalLastPeriodSales,
        ChangePercent: originalPercentChange,
      };
      
      return formatted;
    });
    
    console.log('✅ Table11 after formatting (Sales Categories with enhanced display):', enhancedData.table11);
  }
  
  // Process other tables
  if (enhancedData.table2 && !enhancedData.table11) {
    console.log('🎯 Processing legacy table2 (fallback when no table11):', enhancedData.table2);
    
    enhancedData.table2 = enhancedData.table2.map((item: any, index: number) => {
      const originalSales = item.Sales;
      const originalPercentage = item.Percentage;
      
      const formatted = {
        ...item,
        // Keep original raw values for calculations
        SalesRaw: originalSales,
        PercentageRaw: originalPercentage,
        
        // Format sales values with commas - NO ROUNDING
        Sales: typeof originalSales === 'number' ? formatNumber(originalSales) : originalSales,
        
        // Format percentage - NO ROUNDING, preserve exact value
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
      
      return formatted;
    });
    
    console.log('✅ Table2 after formatting (LEGACY - prefer table11):', enhancedData.table2);
  }
  
  // Process other tables
  if (enhancedData.table3) {
    enhancedData.table3 = enhancedData.table3.map((item: any) => ({
      ...item,
      Sales: typeof item.Sales === 'number' ? formatNumber(item.Sales) : item.Sales,
      SalesRaw: item.Sales,
      DisplaySales: typeof item.Sales === 'number' ? formatCurrency(item.Sales, false) : item.Sales,
    }));
  }
  
  if (enhancedData.table4) {
    enhancedData.table4 = enhancedData.table4.map((item: any) => ({
      ...item,
      Sales: typeof item.Sales === 'number' ? formatNumber(item.Sales) : item.Sales,
      SalesRaw: item.Sales,
      DisplaySales: typeof item.Sales === 'number' ? formatCurrency(item.Sales, false) : item.Sales,
    }));
  }
  
  if (enhancedData.table5) {
    enhancedData.table5 = enhancedData.table5.map((item: any) => ({
      ...item,
      Quantity: typeof item.Quantity === 'number' ? formatNumber(item.Quantity) : item.Quantity,
      QuantityRaw: item.Quantity,
      Sales: typeof item.Sales === 'number' ? formatNumber(item.Sales) : item.Sales,
      SalesRaw: item.Sales,
      DisplaySales: typeof item.Sales === 'number' ? formatCurrency(item.Sales, false) : item.Sales,
    }));
  }
  
  if (enhancedData.table6) {
    enhancedData.table6 = enhancedData.table6.map((item: any) => ({
      ...item,
      Sales: typeof item.Sales === 'number' ? formatCurrency(item.Sales, false) : item.Sales,
      SalesRaw: item.Sales,
    }));
  }
  
  if (enhancedData.table7) {
    enhancedData.table7 = enhancedData.table7.map((item: any) => ({
      ...item,
      Price: typeof item.Price === 'number' ? formatCurrency(item.Price / 100) : item.Price,
      PriceRaw: item.Price,
    }));
  }
  
  if (enhancedData.table8) {
    enhancedData.table8 = enhancedData.table8.map((item: any) => ({
      ...item,
      Change: typeof item.Change === 'number' ? formatNumber(item.Change) : item.Change,
      ChangeRaw: item.Change,
    }));
  }
  
  if (enhancedData.table9) {
    enhancedData.table9 = enhancedData.table9.map((item: any) => ({
      ...item,
      Price: typeof item.Price === 'number' ? formatCurrency(item.Price / 100) : item.Price,
      PriceRaw: item.Price,
    }));
  }
  
  // Format table12 (Menu Items Table) specifically
  if (enhancedData.table12) {
    console.log('🎯 Processing table12 BEFORE T_Sales fix:', enhancedData.table12);
    
    enhancedData.table12 = enhancedData.table12.map((item: any) => {
      const formatted = {
        ...item,
        
        // T_Sales field - ensure it's a number and format properly
        T_Sales: typeof item.T_Sales === 'number' ? item.T_Sales : (parseFloat(item.T_Sales) || 0),
        T_Sales_Raw: item.T_Sales,
        T_Sales_Formatted: typeof item.T_Sales === 'number' ? 
          formatCurrency(item.T_Sales, false) : 
          formatCurrency(parseFloat(item.T_Sales) || 0, false),
        
        // B_Sales field - ensure it's a number and format properly  
        B_Sales: typeof item.B_Sales === 'number' ? item.B_Sales : (parseFloat(item.B_Sales) || 0),
        B_Sales_Raw: item.B_Sales,
        B_Sales_Formatted: typeof item.B_Sales === 'number' ? 
          formatCurrency(item.B_Sales, false) : 
          formatCurrency(parseFloat(item.B_Sales) || 0, false),
        
        // Quantity fields
        T_Quantity: typeof item.T_Quantity === 'number' ? item.T_Quantity : (parseFloat(item.T_Quantity) || 0),
        T_Quantity_Formatted: typeof item.T_Quantity === 'number' ? 
          formatNumber(item.T_Quantity) : 
          formatNumber(parseFloat(item.T_Quantity) || 0),
        
        B_Quantity: typeof item.B_Quantity === 'number' ? item.B_Quantity : (parseFloat(item.B_Quantity) || 0),
        B_Quantity_Formatted: typeof item.B_Quantity === 'number' ? 
          formatNumber(item.B_Quantity) : 
          formatNumber(parseFloat(item.B_Quantity) || 0),
        
        // Difference Sales
        Difference_Sales: typeof item.Difference_Sales === 'number' ? item.Difference_Sales : (parseFloat(item.Difference_Sales) || 0),
        Difference_Sales_Formatted: typeof item.Difference_Sales === 'number' ? 
          formatNumber(item.Difference_Sales) : 
          formatNumber(parseFloat(item.Difference_Sales) || 0),
        
        // Legacy formatting for compatibility
        Quantity: typeof item.Quantity === 'number' ? formatNumber(item.Quantity) : item.Quantity,
        QuantityRaw: item.Quantity,
        
        Sales: typeof item.Sales === 'number' ? formatCurrency(item.Sales, false) : item.Sales,
        SalesRaw: item.Sales,
        Revenue: typeof item.Revenue === 'number' ? formatCurrency(item.Revenue, false) : item.Revenue,
        RevenueRaw: item.Revenue,
        
        Price: typeof item.Price === 'number' ? formatCurrency(item.Price) : item.Price,
        PriceRaw: item.Price,
        'Unit Price': typeof item['Unit Price'] === 'number' ? formatCurrency(item['Unit Price']) : item['Unit Price'],
        'Unit PriceRaw': item['Unit Price'],
        
        Cost: typeof item.Cost === 'number' ? formatCurrency(item.Cost) : item.Cost,
        CostRaw: item.Cost,
        'Food Cost': typeof item['Food Cost'] === 'number' ? formatCurrency(item['Food Cost']) : item['Food Cost'],
        'Food CostRaw': item['Food Cost'],
        
        'Margin %': typeof item['Margin %'] === 'number' ? formatPercentage(item['Margin %']) : item['Margin %'],
        'Food Cost %': typeof item['Food Cost %'] === 'number' ? formatPercentage(item['Food Cost %']) : item['Food Cost %'],
      };
      
      return formatted;
    });
    
    console.log('✅ Table12 AFTER T_Sales/B_Sales fix (should show proper currency):', enhancedData.table12);
  }
  
  // Add metadata about formatting
  enhancedData._formatting = {
    applied: true,
    timestamp: new Date().toISOString(),
    tables_processed: ['table1', 'table11', 'table2', 'table3', 'table4', 'table5', 'table6', 'table7', 'table8', 'table9', 'table12'],
    formatting_functions: ['formatNumber', 'formatCurrency', 'formatPercentage'],
    fixes_applied: {
      table1: 'FIXED: Array extraction and pre-formatted value cleaning - now extracts single values from arrays for KPI cards',
      table11: 'NEW: Sales Categories from backend - processes This_4_Weeks_Sales, Last_4_Weeks_Sales, Percent_Change',
      table12: 'FIXED: T_Sales and B_Sales formatting - now properly handles currency formatting'
    },
    special_handling: {
      table11: 'Primary Sales Categories Performance data from backend with enhanced display values',
      table2: 'Legacy fallback for Sales Categories Performance (table11 takes precedence)',
      table12: 'Menu Items Table with comprehensive formatting including T_Sales/B_Sales fixes'
    },
    priority: {
      sales_categories: 'table11 > table2 (backend data takes precedence over legacy format)'
    }
  };
  
  console.log('📊 Enhanced data with TABLE11 SUPPORT and ALL FIXES APPLIED:', enhancedData);
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
      style={{ width: "100%" }}
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
  const reduxDispatch = useDispatch();
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

  // NEW: Get Redux date range state for Product Mix Dashboard
  const reduxStartDate = useAppSelector(selectProductMixDashboardStartDate);
  const reduxEndDate = useAppSelector(selectProductMixDashboardEndDate);
  const hasReduxDateRange = useAppSelector(selectHasProductMixDashboardDateRange);

  console.log('🏷️ ProductMix Redux dates:', {
    reduxStartDate,
    reduxEndDate,
    hasReduxDateRange,
    reduxStartType: typeof reduxStartDate,
    reduxEndType: typeof reduxEndDate
  });

  // Get current selections from Redux (masterFileSlice)
  const selectedCompanies = useSelector(selectSelectedCompanies);
  const selectedLocations = useSelector(selectSelectedLocations);
  
  // Convert to single values for dropdowns (using new API structure)
  const selectedCompany = selectedCompanies.length > 0 ? selectedCompanies[0] : '';
  const selectedLocation = selectedLocations.length > 0 ? selectedLocations[0] : '';
  // FIXED: Improved data selection logic - prefers filtered data over original data
  const currentProductMixData = useMemo(() => {
    console.log('🔍 Selecting ProductMix data for location:', currentProductMixLocation);
    console.log('📁 Available files:', productMixFiles.map(f => ({
      location: f.location,
      hasData: !!f.data,
      isFiltered: f.data?.filterApplied,
      timestamp: f.data?.filterTimestamp,
      company_id: f.company_id
    })));

    // Get all files for current location
    const locationFiles = productMixFiles.filter(f => f.location === currentProductMixLocation);
    
    if (locationFiles.length === 0) {
      console.log('❌ No files found for location:', currentProductMixLocation);
      return null;
    }

    // Prefer filtered data over original data
    const filteredFile = locationFiles.find(f => f.data?.filterApplied);
    const originalFile = locationFiles.find(f => !f.data?.filterApplied);
    
    const selectedData = filteredFile?.data || originalFile?.data;
    
    console.log('✅ Selected data:', {
      source: filteredFile ? 'filtered' : 'original',
      hasData: !!selectedData,
      filterTimestamp: selectedData?.filterTimestamp,
      tablesAvailable: selectedData ? Object.keys(selectedData).filter(k => k.startsWith('table')) : []
    });

    return selectedData;
  }, [productMixFiles, currentProductMixLocation]);

  // Find current file info
  const currentProductMixFile = productMixFiles.find(
    (f) => f.location === currentProductMixLocation
  );

  // Company-related state for new API structure
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [companiesError, setCompaniesError] = useState<string>("");

  // Get available locations for selected company
  const availableLocations = React.useMemo(() => {
    if (!selectedCompany) return [];
    const company = companies.find(c => c.company_id.toString() === selectedCompany);
    return company ? company.locations : [];
  }, [companies, selectedCompany]);

  // State variables
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [filterError, setFilterError] = useState<string>("");
  const [dataUpdated, setDataUpdated] = useState<boolean>(false);
  
  // ADDED: Data version tracking for force re-renders
  const [dataVersion, setDataVersion] = useState(0);

  // Auto-filtering state
  const [isAutoFiltering, setIsAutoFiltering] = useState(false);
  
  // Refs to track previous values and prevent unnecessary re-renders
  const previousFiltersRef = useRef<{
    company: string;
    locations: string[];
    startDate: string;
    endDate: string;
    categories: string[];
    servers: string[];
    menuItems: string[];
  }>({
    company: '',
    locations: [],
    startDate: '',
    endDate: '',
    categories: [],
    servers: [],
    menuItems: []
  });
  
  // Timeout ref for debouncing
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  // Track if component has been initialized to avoid initial auto-filter
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize dates from Redux state, convert YYYY-MM-DD to MM/dd/yyyy for display
  const [localStartDate, setLocalStartDate] = useState<string>("");
  const [localEndDate, setLocalEndDate] = useState<string>("");

  // Function to convert Redux date format (YYYY-MM-DD) to display format (MM/dd/yyyy)
  const convertReduxDateToDisplay = (reduxDate: string | null): string => {
    if (!reduxDate) return "";
    try {
      const [year, month, day] = reduxDate.split('-');
      return `${month}/${day}/${year}`;
    } catch (e) {
      console.error('Error converting Redux date to display:', e);
      return "";
    }
  };

  // Function to convert display date format (MM/dd/yyyy) to Redux format (YYYY-MM-DD)
  const convertDisplayDateToRedux = (displayDate: string): string => {
    if (!displayDate) return "";
    try {
      const [month, day, year] = displayDate.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    } catch (e) {
      console.error('Error converting display date to Redux:', e);
      return "";
    }
  };

  // Initialize local dates from Redux on component mount
  useEffect(() => {
    if (hasReduxDateRange) {
      const displayStartDate = convertReduxDateToDisplay(reduxStartDate);
      const displayEndDate = convertReduxDateToDisplay(reduxEndDate);
      
      console.log('🏷️ ProductMix: Initializing from Redux dates:', {
        reduxStartDate,
        reduxEndDate,
        displayStartDate,
        displayEndDate
      });
      
      setLocalStartDate(displayStartDate);
      setLocalEndDate(displayEndDate);
    }
  }, [reduxStartDate, reduxEndDate, hasReduxDateRange]);

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

  // Filter states using multiselect arrays - No defaults, but use Redux for locations
  const [localSelectedLocations, setLocalSelectedLocations] = useState<string[]>([]);
  const [selectedServers, setSelectedServers] = useState<string[]>([]);
  const [selectedMenuItems, setSelectedMenuItems] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [hasInitializedLocations, setHasInitializedLocations] = useState(false);
  // UPDATED: Apply formatting to current data before rendering with useMemo and data version
  const formattedCurrentData = useMemo(() => {
    if (!currentProductMixData) {
      console.log('⚠️ No current data to format');
      return null;
    }

    console.log('🎨 Formatting current ProductMix data:', {
      hasFilterApplied: currentProductMixData.filterApplied,
      timestamp: currentProductMixData.filterTimestamp,
      location: currentProductMixLocation
    });

    const formatted = enhanceDataWithFormatting(currentProductMixData);
    
    console.log('✅ Data formatted successfully:', {
      hasTable1: !!formatted?.table1,
      hasTable11: !!formatted?.table11,
      hasTable12: !!formatted?.table12
    });

    return formatted;
  }, [currentProductMixData, currentProductMixLocation, dataVersion]);

  // UPDATED: Prepare data specifically for SalesDashboard component with useMemo and data version
  const salesDashboardData = useMemo(() => {
    const prepared = prepareSalesDashboardData(formattedCurrentData);
    console.log('📊 Sales dashboard data prepared:', {
      hasData: !!prepared,
      timestamp: prepared?.filterTimestamp
    });
    return prepared;
  }, [formattedCurrentData, dataVersion]);

  // ADDED: Data validation before rendering
  const isDataReady = useMemo(() => {
    const hasValidData = !!currentProductMixData;
    const hasRequiredTables = !!(currentProductMixData?.table1 || currentProductMixData?.table11);
    
    console.log('✅ ProductMix Data Readiness Check:', {
      hasValidData,
      hasRequiredTables,
      filterApplied: currentProductMixData?.filterApplied,
      location: currentProductMixLocation,
      dataVersion
    });
    
    return hasValidData && hasRequiredTables;
  }, [currentProductMixData, currentProductMixLocation, dataVersion]);

  // Fetch company-locations data on component mount
  useEffect(() => {
    const fetchCompanyLocations = async () => {
      setCompaniesLoading(true);
      setCompaniesError("");
      
      try {
        console.log('🏢 ProductMix: Fetching company-locations from:', COMPANY_LOCATIONS_API_URL);
        const response = await axios.get(COMPANY_LOCATIONS_API_URL);
        
        console.log('📥 ProductMix: Company-locations response:', response.data);
        setCompanies(response.data || []);
        
        // Auto-select the first company if there's only one and none is selected
        if (response.data && response.data.length === 1 && selectedCompanies.length === 0) {
          reduxDispatch(setSelectedCompanies([response.data[0].company_id.toString()]));
          console.log('🎯 ProductMix: Auto-selected single company:', response.data[0]);
        }
        
      } catch (error) {
        console.error('❌ ProductMix: Error fetching company-locations:', error);
        
        let errorMessage = "Error loading companies and locations";
        if (axios.isAxiosError(error)) {
          if (error.response) {
            errorMessage = `Server error: ${error.response.status}`;
          } else if (error.request) {
            errorMessage = 'Cannot connect to company-locations API. Please check server status.';
          }
        }
        
        setCompaniesError(errorMessage);
      } finally {
        setCompaniesLoading(false);
      }
    };

    fetchCompanyLocations();
  }, [selectedCompanies.length, reduxDispatch]);

  // Auto-select first location when company changes and has only one location
  useEffect(() => {
    if (selectedCompany && availableLocations.length === 1 && selectedLocations.length === 0) {
      reduxDispatch(setSelectedLocations([availableLocations[0].location_id.toString()]));
      console.log('🎯 ProductMix: Auto-selected single location:', availableLocations[0]);
    }
  }, [selectedCompany, availableLocations, selectedLocations.length, reduxDispatch]);

  // Clear dataUpdated state when filters change
  useEffect(() => {
    setDataUpdated(false);
  }, [selectedCompany, selectedLocations, localStartDate, localEndDate, selectedServers, selectedCategories, selectedMenuItems]);

  // ADDED: Data monitoring useEffect
  useEffect(() => {
    console.log('🔄 ProductMix Data Change Detected:', {
      location: currentProductMixLocation,
      hasData: !!currentProductMixData,
      isFiltered: currentProductMixData?.filterApplied,
      timestamp: currentProductMixData?.filterTimestamp,
      dataVersion,
      reduxFilesCount: productMixFiles.length,
      availableTables: currentProductMixData ? Object.keys(currentProductMixData).filter(k => k.startsWith('table')) : []
    });

    // If we have filtered data, ensure dataUpdated is true
    if (currentProductMixData?.filterApplied && !dataUpdated) {
      console.log('📢 Setting dataUpdated to true - filtered data detected');
      setDataUpdated(true);
    }
  }, [currentProductMixData, currentProductMixLocation, dataVersion, productMixFiles.length, dataUpdated]);

  // Check if filters have minimum requirements to trigger auto-filter
  const hasMinimumFilters = useCallback((company: string, locations: string[]) => {
    return company && locations.length > 0; // Company and at least one location required
  }, []);

  // Check if any filter has actually changed
  const hasFiltersChanged = useCallback((
    currentCompany: string, 
    currentLocations: string[], 
    currentStartDate: string, 
    currentEndDate: string, 
    currentCategories: string[],
    currentServers: string[],
    currentMenuItems: string[]
  ) => {
    const prev = previousFiltersRef.current;
    
    const companyChanged = currentCompany !== prev.company;
    const locationsChanged = JSON.stringify(currentLocations.sort()) !== JSON.stringify(prev.locations.sort());
    const startDateChanged = currentStartDate !== prev.startDate;
    const endDateChanged = currentEndDate !== prev.endDate;
    const categoriesChanged = JSON.stringify(currentCategories.sort()) !== JSON.stringify(prev.categories.sort());
    const serversChanged = JSON.stringify(currentServers.sort()) !== JSON.stringify(prev.servers.sort());
    const menuItemsChanged = JSON.stringify(currentMenuItems.sort()) !== JSON.stringify(prev.menuItems.sort());
    
    console.log('🔍 ProductMix: Checking for changes:', {
      companyChanged,
      locationsChanged,
      startDateChanged,
      endDateChanged,
      categoriesChanged,
      serversChanged,
      menuItemsChanged,
      current: { currentCompany, currentLocations, currentStartDate, currentEndDate, currentCategories, currentServers, currentMenuItems },
      previous: prev
    });
    
    return companyChanged || locationsChanged || startDateChanged || endDateChanged || categoriesChanged || serversChanged || menuItemsChanged;
  }, []);
  // Handle company selection change (updated for new API structure)
  const handleCompanyChange = (event: SelectChangeEvent) => {
    const companyId = event.target.value;
    console.log('🏢 ProductMix: Company selection changed to:', companyId);
    
    // Update Redux state with array format
    reduxDispatch(setSelectedCompanies([companyId]));
    
    // Clear locations when company changes (as per requirements)
    reduxDispatch(setSelectedLocations([]));
    
    setDataUpdated(false);
    console.log('🏢 ProductMix: Cleared locations due to company change');
  };

  // Get selected company and location names for display (updated for new API structure)
  const selectedCompanyName = companies.find(c => c.company_id.toString() === selectedCompany)?.company_name || 
                               (selectedCompany ? `Company ID: ${selectedCompany}` : 'No Company Selected');
  
  const selectedLocationName = availableLocations.find(l => l.location_id.toString() === selectedLocation)?.location_name || 
                                (selectedLocation ? `Location ID: ${selectedLocation}` : 'No Location Selected');

  // Determine which locations to use and convert for display
  const displayLocations = React.useMemo(() => {
    if (availableLocations.length > 0) {
      return availableLocations.map(loc => loc.location_name);
    }
    return locations || [];
  }, [availableLocations, locations]);

  // Convert selected location IDs to names for display
  const displaySelectedLocations = React.useMemo(() => {
    if (availableLocations.length > 0) {
      return selectedLocations.map(id => {
        const location = availableLocations.find(loc => loc.location_id.toString() === id);
        return location ? location.location_name : id;
      });
    }
    return localSelectedLocations;
  }, [selectedLocations, availableLocations, localSelectedLocations]);

  // Handle location change with Redux integration
  const handleLocationChange = (newValue: string[]) => {
    console.log('📍 ProductMix: Location selection changed to:', newValue);
    
    if (availableLocations.length > 0) {
      // Convert names to IDs for Redux
      const locationIds = newValue.map(name => {
        const location = availableLocations.find(loc => loc.location_name === name);
        return location ? location.location_id.toString() : name;
      });
      console.log('📍 ProductMix: Converting location names to IDs for Redux:', {
        names: newValue,
        ids: locationIds
      });
      reduxDispatch(setSelectedLocations(locationIds));
    } else {
      // Use local state fallback
      setLocalSelectedLocations(newValue);
    }
    
    // Update Redux state
    if (newValue.length > 0) {
      dispatch(selectProductMixLocation(newValue[0]));
      dispatch(updateProductMixFilters({ location: newValue[0] }));
    }
  };

  // Date range handling with Redux integration
  const openDateRangePicker = () => {
    setIsDateRangeOpen(true);
  };

  const handleDateRangeSelect = (range: any) => {
    setSelectedRange(range);
  };

  // Apply date range with Redux integration
  const applyDateRange = () => {
    const formattedStartDate = format(selectedRange.startDate, 'MM/dd/yyyy');
    const formattedEndDate = format(selectedRange.endDate, 'MM/dd/yyyy');
    
    console.log('📅 ProductMix: Setting date range with Redux integration:', {
      startDate: formattedStartDate,
      endDate: formattedEndDate
    });
    
    // Update local state for display
    setLocalStartDate(formattedStartDate);
    setLocalEndDate(formattedEndDate);
    
    // Update Redux date range state
    const reduxStartDate = convertDisplayDateToRedux(formattedStartDate);
    const reduxEndDate = convertDisplayDateToRedux(formattedEndDate);
    
    console.log('📅 ProductMix: Storing in Redux:', {
      reduxStartDate,
      reduxEndDate
    });
    
    reduxDispatch(setProductMixDashboardDateRange({
      startDate: selectedRange.startDate,
      endDate: selectedRange.endDate
    }));
    
    // Update existing Redux state for persistence (backward compatibility)
    dispatch(updateProductMixFilters({ 
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      dateRangeType: 'Custom Date Range'
    }));
    
    setIsDateRangeOpen(false);
  };

  // Clear date range with Redux integration
  const clearDateRange = () => {
    console.log('🧹 ProductMix: Clearing date range from Redux and local state');
    
    // Clear local state
    setLocalStartDate("");
    setLocalEndDate("");
    
    // Clear Redux state
    reduxDispatch(clearProductMixDashboardDateRange());
    
    // Clear existing Redux filters (backward compatibility)
    dispatch(updateProductMixFilters({ 
      startDate: "",
      endDate: "",
      dateRangeType: ""
    }));
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
  // Auto-filter function (converted from handleApplyFilters)
  const triggerAutoFilter = useCallback(async () => {
    const currentCompany = selectedCompany;
    const effectiveSelectedLocations = availableLocations.length > 0 ? displaySelectedLocations : localSelectedLocations;
    const currentStartDate = localStartDate;
    const currentEndDate = localEndDate;
    const currentCategories = selectedCategories;
    const currentServers = selectedServers;
    const currentMenuItems = selectedMenuItems;

    console.log('🎯 ProductMix: Checking auto-filter trigger:', {
      company: currentCompany,
      locations: effectiveSelectedLocations,
      startDate: currentStartDate,
      endDate: currentEndDate,
      categories: currentCategories,
      servers: currentServers,
      menuItems: currentMenuItems,
      isInitialized
    });

    // Don't trigger on initial load
    if (!isInitialized) {
      console.log('⏳ ProductMix: Skipping auto-filter - component not initialized');
      return;
    }

    // Check if minimum requirements are met
    if (!hasMinimumFilters(currentCompany, effectiveSelectedLocations)) {
      console.warn('⚠️ ProductMix: Minimum filter requirements not met');
      return;
    }

    // Check if filters actually changed
    if (!hasFiltersChanged(currentCompany, effectiveSelectedLocations, currentStartDate, currentEndDate, currentCategories, currentServers, currentMenuItems)) {
      console.log('⏭️ ProductMix: No filter changes detected - skipping auto-filter');
      return;
    }

    setIsAutoFiltering(true);
    setFilterError("");
    setDataUpdated(false);

    try {
      console.log("🔄 Starting Product Mix auto-filter process...");

      // Format dates correctly for API (convert MM/dd/yyyy to yyyy-MM-dd)
      let formattedStartDate: string | null = null;
      let formattedEndDate: string | null = null;
      
      if (currentStartDate) {
        const dateParts = currentStartDate.split('/');
        if (dateParts.length === 3) {
          formattedStartDate = `${dateParts[2]}-${dateParts[0].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}`;
        }
      }
      
      if (currentEndDate) {
        const dateParts = currentEndDate.split('/');
        if (dateParts.length === 3) {
          formattedEndDate = `${dateParts[2]}-${dateParts[0].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}`;
        }
      }

      // Prepare the request payload with Redux company and location data
      const payload = {
        fileName: currentProductMixFile?.fileName || "",
        locations: effectiveSelectedLocations, // Send as array
        location: effectiveSelectedLocations.length === 1 ? effectiveSelectedLocations[0] : null, // Keep single location for backward compatibility
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        servers: currentServers,
        categories: currentCategories,
        menuItems: currentMenuItems,
        dashboard: "Product Mix",
        company_id: currentCompany, // Use Redux selected company ID
      };

      console.log("🚀 Sending Product Mix auto-filter request with Redux state:", payload);

      // Make API call to Product Mix filter endpoint
      const response = await axios.post(PRODUCT_MIX_FILTER_API_URL, payload);

      console.log("📥 Received Product Mix auto-filter response:", response.data);

      if (response.data) {
        // Apply formatting to the response data
        const formattedResponseData = enhanceDataWithFormatting(response.data);
        
        // Extract categories from the filtered data
        const extractedCategories = formattedResponseData.categories || currentCategories;

        // Create enhanced data with filter metadata and Redux company_id
        const enhancedData = {
          ...formattedResponseData,
          categories: extractedCategories,
          company_id: currentCompany, // Use Redux selected company ID
          filterApplied: true,
          filterTimestamp: new Date().toISOString(),
          appliedFilters: {
            company_id: currentCompany, // Store Redux selected company ID
            company_name: selectedCompanyName, // Store company name for display
            locations: effectiveSelectedLocations, // Array of all selected locations
            location: effectiveSelectedLocations.length === 1 ? effectiveSelectedLocations[0] : `${effectiveSelectedLocations.length} locations`, // Display string
            startDate: currentStartDate,
            endDate: currentEndDate,
            servers: currentServers,
            categories: currentCategories,
            menuItems: currentMenuItems,
          }
        };

        console.log("📊 Enhanced data with auto-filters, formatting, and Redux company:", enhancedData);

        // Update Product Mix data for ALL selected locations with Redux company_id
        effectiveSelectedLocations.forEach(location => {
          dispatch(addProductMixData({
            location: location,
            data: enhancedData,
            fileName: currentProductMixFile?.fileName || "Unknown",
            fileContent: currentProductMixFile?.fileContent || "",
            company_id: currentCompany, // Use Redux selected company ID
          }));
        });

        // Update Redux filters with all selected locations and Redux company_id
        dispatch(updateProductMixFilters({
          company_id: currentCompany, // Store Redux selected company ID
          locations: effectiveSelectedLocations, // Store array
          location: effectiveSelectedLocations.length === 1 ? effectiveSelectedLocations[0] : effectiveSelectedLocations.join(","), // Join for display
          startDate: currentStartDate,
          endDate: currentEndDate,
          servers: currentServers.join(","),
          categories: currentCategories.join(","),
          menuItems: currentMenuItems.join(","),
          selectedCategories: currentCategories,
          dateRangeType: (currentStartDate && currentEndDate) ? "Custom Date Range" : "",
        }));

        // ADDED: Update data version to force re-renders
        setDataVersion(prev => prev + 1);
        setDataUpdated(true);

        // Force re-selection of current location to ensure UI updates
        if (effectiveSelectedLocations.length > 0) {
          dispatch(selectProductMixLocation(effectiveSelectedLocations[0]));
        }

        console.log("✅ Product Mix auto-filters applied successfully for company:", selectedCompanyName, "locations:", effectiveSelectedLocations);
        console.log("✅ Data version updated, UI should re-render");

        // Update previous filters reference
        previousFiltersRef.current = {
          company: currentCompany,
          locations: [...effectiveSelectedLocations],
          startDate: currentStartDate,
          endDate: currentEndDate,
          categories: [...currentCategories],
          servers: [...currentServers],
          menuItems: [...currentMenuItems]
        };

        // Show success message
        setFilterError("");
        
      } else {
        throw new Error("Invalid response data from Product Mix filter API");
      }

    } catch (error) {
      console.error("❌ Product Mix auto-filter error:", error);
      
      let errorMessage = "Error applying Product Mix auto-filters";
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
        errorMessage = `Product Mix auto-filter error: ${error.message}`;
      }
      
      setFilterError(errorMessage);
      setDataUpdated(false);
      
      // Clear loading state
      dispatch(setLoading(false));
    } finally {
      setIsAutoFiltering(false);
    }
  }, [
    selectedCompany,
    availableLocations.length,
    displaySelectedLocations,
    localSelectedLocations,
    localStartDate,
    localEndDate,
    selectedCategories,
    selectedServers,
    selectedMenuItems,
    isInitialized,
    hasMinimumFilters,
    hasFiltersChanged,
    currentProductMixFile?.fileName,
    currentProductMixFile?.fileContent,
    selectedCompanyName,
    dispatch
  ]);

  // Debounced auto-filter function
  const debouncedAutoFilter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      triggerAutoFilter();
    }, 500); // 500ms debounce for responsiveness
  }, [triggerAutoFilter]);

  // Single useEffect to monitor all filter changes
  useEffect(() => {
    // Mark as initialized after first render
    if (!isInitialized) {
      setIsInitialized(true);
      return;
    }

    console.log('🔄 ProductMix: Filter change detected, triggering debounced auto-filter');
    debouncedAutoFilter();

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [selectedCompany, displaySelectedLocations, localSelectedLocations, localStartDate, localEndDate, selectedCategories, selectedServers, selectedMenuItems, debouncedAutoFilter, isInitialized]);
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

  // Show Redux date range status in filters section
  const renderDateRangeFilter = () => (
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
          Date Range {hasReduxDateRange && <span style={{ color: '#1976d2' }}>• Redux</span>}
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
            borderColor: hasReduxDateRange ? '#1976d2' : 'rgba(0, 0, 0, 0.23)',
            color: (!localStartDate || !localEndDate) ? 'text.secondary' : 'text.primary',
            padding: '8px 14px',
            '&:hover': {
              borderColor: 'primary.main',
            }
          }}
        >
          <Box sx={{ textAlign: 'left', flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body2" component="div" sx={{ fontSize: '0.875rem' }}>
              {(!localStartDate || !localEndDate) 
                ? "Select date range (optional)" 
                : `${formatDisplayDate(localStartDate)} - ${formatDisplayDate(localEndDate)}`
              }
            </Typography>
            {(localStartDate && localEndDate) && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  clearDateRange();
                }}
                sx={{ ml: 1 }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Button>
      </Box>
    </Grid>
  );
  return (
    <Box sx={{ 
      p: { xs: 1, sm: 2, md: 3 },
      width: "100%",
      maxWidth: "none",
      boxSizing: "border-box"
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
          width: "100%"
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
                <rect x="10" y="10" width="35" height="35" rx="4" fill="#5A8DEE"/>
                <rect x="55" y="10" width="35" height="35" rx="4" fill="#4285F4"/>
                <rect x="10" y="55" width="35" height="35" rx="4" fill="#1976D2"/>
                <rect x="55" y="55" width="35" height="35" rx="4" fill="#3F51B5"/>
              </svg>
            </span>
            Product Mix Dashboard
            {hasReduxDateRange && (
              <Chip 
                label="Redux Dates Active" 
                size="small" 
                color="primary" 
                variant="outlined"
                sx={{ fontSize: '0.75rem', ml: 2 }}
              />
            )}
          </h1>
        </div>
      </Box>

      {/* Company Selection Section */}
      <Card elevation={3} sx={{ 
        mb: 3, 
        borderRadius: 2, 
        overflow: "hidden",
        width: "100%",
        border: '2px solid #e3f2fd'
      }}>
        <CardContent sx={{ p: { xs: 2, md: 3 }, bgcolor: '#f8f9fa' }}>
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <BusinessIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2' }}>
              Company Selection
            </Typography>
            {companiesLoading && <CircularProgress size={20} />}
            {hasReduxDateRange && (
              <Chip 
                label={`Date Range: ${formatDisplayDate(localStartDate)} - ${formatDisplayDate(localEndDate)}`}
                size="small" 
                color="secondary" 
                variant="outlined"
                sx={{ ml: 'auto' }}
              />
            )}
          </Box>
          
          {/* Error display */}
          {companiesError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {companiesError}
            </Alert>
          )}
          
          {/* Company Selection Only */}
          <FormControl fullWidth size="small" disabled={companiesLoading}>
            <InputLabel>Company</InputLabel>
            <Select
              value={selectedCompany}
              label="Company"
              onChange={handleCompanyChange}
              displayEmpty
            >
              <MenuItem value="">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                  <BusinessIcon fontSize="small" />
                  Select Company
                </Box>
              </MenuItem>
              {companies.map((company) => (
                <MenuItem key={company.company_id} value={company.company_id.toString()}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BusinessIcon fontSize="small" color="primary" />
                    {company.company_name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {/* Company Selection Summary */}
          {selectedCompany && (
            <Box sx={{ mt: 2 }}>
              <Chip
                icon={<BusinessIcon />}
                label={`Selected: ${selectedCompanyName}`}
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 500 }}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Company Selection Alert */}
      {!selectedCompany && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Please select a company above to see available locations for filtering.
          </Typography>
        </Alert>
      )}

      {/* Alert message when no data is available */}
      {!isDataReady && (
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

      {/* Success Alert for Data Update with Redux Date Range Info */}
      {dataUpdated && (
        <Alert 
          severity="success" 
          sx={{ mb: 3, width: "100%" }}
          onClose={() => setDataUpdated(false)}
        >
          <Typography variant="body2">
            <strong>✅ Filters Applied Successfully!</strong>
            {hasReduxDateRange && (
              <span> | <strong>Redux Date Range:</strong> {formatDisplayDate(localStartDate)} - {formatDisplayDate(localEndDate)}</span>
            )}
            {selectedCompany && (
              <span> | <strong>Company:</strong> {selectedCompanyName}</span>
            )}
          </Typography>
        </Alert>
      )}
      {/* Filters Section with Redux Date Range Integration */}
      <Card elevation={3} sx={{ 
        mb: 3, 
        borderRadius: 2, 
        overflow: "hidden",
        width: "100%",
        maxWidth: "none"
      }}>
        <CardContent sx={{ p: { xs: 2, md: 3 }, width: "100%" }}>
          {/* Filter Header */}
          <Box sx={{ mb: 2, width: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FilterListIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                Filters
              </Typography>
            
              {/* Company ID chip */}
              {selectedCompany && (
                <Chip 
                  label={`🏢 ${selectedCompanyName}`} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                  icon={<BusinessIcon />}
                  sx={{ ml: 1 }}
                />
              )}

              {/* Redux Date Range Status */}
              {hasReduxDateRange && (
                <Chip 
                  label="🕒 Redux Dates"
                  size="small"
                  color="secondary"
                  variant="outlined"
                  sx={{ ml: 1 }}
                />
              )}

              {/* Auto-filtering indicator */}
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
          </Box>

          {/* No locations available alert */}
          {selectedCompany && displayLocations.length === 0 && (
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                No locations available for the selected company.
              </Typography>
            </Alert>
          )}

          <Grid container spacing={2} sx={{ width: "100%" }}>
            {/* Location filter */}
            <Grid item {...gridSizes}>
              <MultiSelect
                id="location-select"
                label="Location"
                options={displayLocations}
                value={displaySelectedLocations}
                onChange={handleLocationChange}
                icon={<PlaceIcon />}
                placeholder={selectedCompany ? "Select locations" : "Select company first"}
              />
            </Grid>

            {/* Date Range filter with Redux integration */}
            {renderDateRangeFilter()}

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

          {/* Active filters display with Redux date range status */}
          {(selectedCompany ||
            displaySelectedLocations.length > 0 ||
            (localStartDate && localEndDate) ||
            selectedServers.length > 0 ||
            selectedMenuItems.length > 0 ||
            selectedCategories.length > 0) && (
            <Box sx={{ mt: 2, width: "100%" }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
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
                {hasReduxDateRange && (
                  <Box sx={{ ml: 2, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="caption" color="secondary">
                      Redux Date Range Active
                    </Typography>
                  </Box>
                )}
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {/* Company filter chip */}
                {selectedCompany && (
                  <Chip
                    label={`Company: ${selectedCompanyName}`}
                    color="primary"
                    variant="outlined"
                    size="small"
                    icon={<BusinessIcon />}
                    onDelete={() => reduxDispatch(setSelectedCompanies([]))}
                  />
                )}

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

                {(localStartDate && localEndDate) && (
                  <Chip
                    label={`Date Range: ${formatDisplayDate(localStartDate)} - ${formatDisplayDate(localEndDate)}`}
                    color={hasReduxDateRange ? "secondary" : "default"}
                    variant="outlined"
                    size="small"
                    icon={<CalendarTodayIcon />}
                    onDelete={clearDateRange}
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
        </CardContent>
      </Card>
      {/* Only render dashboard content if data is ready */}
      {isDataReady ? (
        <>
          {/* Tabs */}
          <Card
            sx={{ 
              borderRadius: 2, 
              mb: 3, 
              overflow: "hidden",
              width: "100%",
              maxWidth: "none"
            }}
            elevation={3}
          >
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                width: "100%",
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
              <Tab label="Menu Analysis" />
            </Tabs>

            {/* Server Performance Tab */}
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ 
                p: { xs: 1, sm: 2, md: 3 },
                width: "100%",
                boxSizing: "border-box"
              }}>
                {isAutoFiltering ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                    <CircularProgress size={40} />
                    <Typography sx={{ ml: 2 }}>
                      Auto-filtering data with Redux date range integration...
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ width: "100%" }}>
                    {/* Sales Dashboard Component with forced re-render */}
                    <MenuAnalysisDashboard 
                      key={`performance-${dataVersion}-${currentProductMixLocation}-${salesDashboardData?.filterTimestamp || 'original'}`}
                      productMixData={salesDashboardData} 
                    />
                    
                    {/* Divider */}
                    <Box sx={{ my: 4, width: "100%" }}>
                      <Divider sx={{ borderColor: '#e0e0e0', borderWidth: 1 }} />
                    </Box>
                    
                    {/* Menu Items Table Component with forced re-render */}
                    <Box sx={{ 
                      mt: 4, 
                      width: "100%",
                      overflow: "hidden"
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
                        📊 Menu Items Analysis 
                        {hasReduxDateRange && (
                          <Chip 
                            label="Redux Dates" 
                            size="small" 
                            color="secondary" 
                            variant="outlined"
                            sx={{ ml: 2 }}
                          />
                        )}
                      </Typography>
                      <MenuItemsTable 
                        key={`menu-items-${dataVersion}-${currentProductMixLocation}-${formattedCurrentData?.filterTimestamp || 'original'}`}
                        table12={formattedCurrentData?.table12 || []} 
                      />
                    </Box>
                  </Box>
                )}
              </Box>
            </TabPanel>

            {/* Menu Analysis Tab with Redux integration */}
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ 
                p: { xs: 1, sm: 2, md: 3 },
                width: "100%",
                boxSizing: "border-box"
              }}>
                {isAutoFiltering ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                    <CircularProgress size={40} />
                    <Typography sx={{ ml: 2 }}>
                      Auto-filtering data with Redux date range integration...
                    </Typography>
                  </Box>
                ) : (
                  <MenuAnalysisDashboardtwo
                    key={`menu-analysis-${dataVersion}-${currentProductMixLocation}-${formattedCurrentData?.filterTimestamp || 'original'}`}
                    productMixData={formattedCurrentData}
                  />
                )}
              </Box>
            </TabPanel>
          </Card>
        </>
      ) : (
        <Card sx={{ borderRadius: 2, mb: 3, p: 3, width: "100%" }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            {isAutoFiltering ? (
              <>
                <CircularProgress size={40} />
                <Typography>Processing filters...</Typography>
              </>
            ) : (
              <>
                <Typography variant="h6">No Data Available</Typography>
                <Typography color="text.secondary">
                  {!selectedCompany 
                    ? "Please select a company and location above"
                    : "Please apply filters to see data"}
                </Typography>
              </>
            )}
          </Box>
        </Card>
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

      {/* Date Range Picker Dialog with Redux integration */}
      <Dialog
        open={isDateRangeOpen}
        onClose={() => setIsDateRangeOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Select Date Range
          {hasReduxDateRange && (
            <Chip 
              label="Will update Redux state" 
              size="small" 
              color="secondary" 
              variant="outlined"
              sx={{ ml: 2 }}
            />
          )}
        </DialogTitle>
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
            Set Date Range (Redux)
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
// Enhanced TableDisplay.tsx - Color-coded percentage cells with comprehensive comma formatting
import React, { useState, useCallback, useMemo } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Tabs,
  Tab,
  Card,
  Divider,
  useTheme,
  alpha,
} from "@mui/material";
import { styled } from "@mui/material/styles";

// Icons
import TableChartIcon from "@mui/icons-material/TableChart";
import PercentIcon from "@mui/icons-material/Percent";
import HomeIcon from "@mui/icons-material/Home";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CategoryIcon from "@mui/icons-material/Category";

// Clean styled components
const CleanTab = styled(Tab)(({ theme }) => ({
  textTransform: "none",
  fontWeight: 500,
  fontSize: "0.95rem",
  minHeight: 48,
  padding: "12px 16px",
  margin: "0 2px",
  color: "#6B7280",
  transition: "all 0.2s ease",
  "&.Mui-selected": {
    color: "#3B82F6",
    fontWeight: 600,
  },
  "&:hover": {
    color: "#3B82F6",
    backgroundColor: alpha("#3B82F6", 0.04),
  },
}));

const CleanTabs = styled(Tabs)(({ theme }) => ({
  "& .MuiTabs-indicator": {
    backgroundColor: "#3B82F6",
    height: 2,
    borderRadius: 1,
  },
  "& .MuiTabs-flexContainer": {
    borderBottom: "1px solid #E5E7EB",
    gap: 4,
  },
  minHeight: 48,
}));

// Color-coded TableCell component
const ColorCodedTableCell = styled(TableCell)<{
  isPercentage?: boolean;
  value?: number;
  align?: "left" | "center" | "right";
}>(({ theme, isPercentage, value, align }) => {
  let backgroundColor = "transparent";
  let color = theme.palette.text.primary;

  if (isPercentage && typeof value === "number") {
    if (value > 0) {
      backgroundColor = "#d4edda"; // Light green background
      color = "#155724"; // Dark green text
    } else if (value < 0) {
      backgroundColor = "#f8d7da"; // Light red background
      color = "#721c24"; // Dark red text
    }
  }

  return {
    backgroundColor,
    color,
    fontWeight: isPercentage ? 600 : "normal",
    textAlign: align || "center",
    whiteSpace: "nowrap",
    fontSize: "0.875rem",
    padding: "8px 16px",
    borderRadius: isPercentage ? "4px" : "none",
    margin: isPercentage ? "2px" : "0",
  };
});

// Enhanced utility function to detect if a value is a currency
const isCurrencyValue = (value: any): boolean => {
  if (typeof value === "string") {
    // Check for dollar signs, currency symbols, or decimal patterns
    return /^\$/.test(value.trim()) || /^\d+\.\d{2}$/.test(value.trim());
  }
  return false;
};

// Enhanced utility function to detect if a value is numeric
const isNumericValue = (value: any): boolean => {
  if (typeof value === "number") return true;
  if (typeof value === "string") {
    // Remove common formatting characters and check if it's a number
    const cleanValue = value.replace(/[$,\s%]/g, "");
    return !isNaN(parseFloat(cleanValue)) && isFinite(parseFloat(cleanValue));
  }
  return false;
};

// Enhanced number formatting with comprehensive comma support
const formatNumber = (value: any): string => {
  if (value === null || value === undefined || value === "") return "N/A";

  // Handle string values
  if (typeof value === "string") {
    const trimmedValue = value.trim();

    // If it's already formatted or non-numeric text, return as-is
    if (!isNumericValue(trimmedValue)) {
      return trimmedValue;
    }

    // Extract numeric value from string (remove $, commas, etc.)
    const cleanValue = trimmedValue.replace(/[$,\s]/g, "");
    const numValue = parseFloat(cleanValue);

    if (isNaN(numValue)) return trimmedValue;

    // Check if it was a currency
    const wasCurrency = trimmedValue.includes("$");

    // Format with commas
    const formatted = numValue.toLocaleString("en-US", {
      minimumFractionDigits: numValue % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    });

    return wasCurrency ? `$${formatted}` : formatted;
  }

  // Handle numeric values
  const numValue = typeof value === "number" ? value : parseFloat(value);

  if (isNaN(numValue)) return String(value);

  // Format with commas
  return numValue.toLocaleString("en-US", {
    minimumFractionDigits: numValue % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
};

// Enhanced percentage formatting with comma support for large percentages
const formatPercentage = (
  value: any
): { formatted: string; numValue: number | null } => {
  if (value === null || value === undefined || value === "") {
    return { formatted: "N/A", numValue: null };
  }

  let numValue: number;

  if (typeof value === "string") {
    // Remove percentage sign, commas, and any extra characters
    const cleanValue = value.replace(/[%,\s]/g, "");
    numValue = parseFloat(cleanValue);
  } else {
    numValue = parseFloat(value);
  }

  if (isNaN(numValue)) {
    return { formatted: String(value), numValue: null };
  }

  const sign = numValue >= 0 ? "↑" : "↓";

  // Format the percentage value with commas if it's large
  const absValue = Math.abs(numValue);
  const formattedNumber = absValue.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formatted = `${sign} ${formattedNumber}%`;

  return { formatted, numValue };
};

// Enhanced function to detect currency columns
const isCurrencyColumn = (header: string, values: any[]): boolean => {
  const currencyHeaders = [
    "sales",
    "revenue",
    "cost",
    "price",
    "amount",
    "total",
    "value",
    "pay",
    "salary",
    "wage",
    "budget",
    "profit",
    "loss",
    "$",
    "dollar",
    "usd",
    "money",
    "fee",
    "charge",
  ];

  const headerLower = header.toLowerCase();
  const hasCurrencyHeader = currencyHeaders.some((keyword) =>
    headerLower.includes(keyword)
  );

  // Check if most values in the column look like currency
  const currencyValueCount = values
    .slice(0, 5) // Check first 5 values for performance
    .filter((val) => isCurrencyValue(val)).length;

  return hasCurrencyHeader || currencyValueCount >= 2;
};

const isPercentageColumn = (header: string, value: any): boolean => {
  // Check if header suggests percentage
  const percentageHeaders = [
    "percentage",
    "percent",
    "%",
    "change",
    "growth",
    "wow",
    "week over week",
    "monthly",
    "yearly",
    "variance",
    "delta",
    "rate",
  ];

  const headerLower = header.toLowerCase();
  const isPercentageHeader = percentageHeaders.some((keyword) =>
    headerLower.includes(keyword)
  );

  // Check if value looks like a percentage
  const isPercentageValue =
    typeof value === "string" &&
    (value.includes("%") || /^[+-]?\d+(\.\d+)?$/.test(value.trim()));

  return isPercentageHeader || isPercentageValue;
};

// Tab Panel Component - Using forceRender approach
interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
  forceRender?: boolean;
}

const TabPanel: React.FC<TabPanelProps> = ({
  children,
  value,
  index,
  forceRender = true,
  ...other
}) => {
  const isActive = value === index;

  if (forceRender) {
    // Always render but hide inactive panels
    return (
      <div
        role="tabpanel"
        id={`table-tabpanel-${index}`}
        aria-labelledby={`table-tab-${index}`}
        style={{ display: isActive ? "block" : "none" }}
        {...other}
      >
        <Box sx={{ pt: 2 }}>{children}</Box>
      </div>
    );
  }

  // Standard implementation (causes unmounting)
  return (
    <div
      role="tabpanel"
      hidden={!isActive}
      id={`table-tabpanel-${index}`}
      aria-labelledby={`table-tab-${index}`}
      {...other}
    >
      {isActive && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

// Helper function for tab accessibility
function a11yProps(index: number) {
  return {
    id: `table-tab-${index}`,
    "aria-controls": `table-tabpanel-${index}`,
  };
}

// Enhanced Table component with comprehensive formatting
interface DataTableProps {
  title: string;
  data: any[];
  icon?: React.ReactNode;
  excludePercentageFormatting?: boolean;
}

const DataTable: React.FC<DataTableProps> = ({
  title,
  data,
  icon,
  excludePercentageFormatting = false,
}) => {
  const theme = useTheme();

  if (!data || data.length === 0) {
    return (
      <Card sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No data available
        </Typography>
      </Card>
    );
  }

  // Get table headers from the first row
  const headers = Object.keys(data[0]);

  // Analyze columns to determine formatting types
  const columnTypes = useMemo(() => {
    const types: {
      [key: string]: {
        isPercentage: boolean;
        isCurrency: boolean;
        isNumeric: boolean;
      };
    } = {};

    headers.forEach((header) => {
      const values = data.map((row) => row[header]);

      types[header] = {
        isPercentage:
          !excludePercentageFormatting &&
          values.some((val) => isPercentageColumn(header, val)),
        isCurrency: isCurrencyColumn(header, values),
        isNumeric: values.some((val) => isNumericValue(val)),
      };
    });

    return types;
  }, [data, headers, excludePercentageFormatting]);

  return (
    <Card elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
      {/* Table Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          backgroundColor: "#f8f9fa",
          px: 3,
          py: 2,
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        {icon && <Box sx={{ mr: 2, color: "primary.main" }}>{icon}</Box>}
        <Typography variant="h6" fontWeight={600}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
          ({data.length} rows)
        </Typography>
      </Box>

      {/* Table Content */}
      <TableContainer>
        <Table size="small">
          <TableHead sx={{ backgroundColor: alpha("#f8f9fa", 0.5) }}>
            <TableRow>
              {headers.map((header, index) => (
                <TableCell
                  key={header}
                  align={index === 0 ? "left" : "center"}
                  sx={{
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    textTransform: "capitalize",
                    borderBottom: "2px solid #e0e0e0",
                    padding: "12px 16px",
                  }}
                >
                  {header.replace(/([A-Z])/g, " $1").trim()}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow
                key={rowIndex}
                sx={{
                  "&:nth-of-type(odd)": {
                    backgroundColor: alpha("#f8f9fa", 0.25),
                  },
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  },
                }}
              >
                {headers.map((header, cellIndex) => {
                  const cellValue = row[header];
                  const isFirstColumn = cellIndex === 0;
                  const columnType = columnTypes[header];

                  let displayValue: string;
                  let numericValue: number | null = null;

                  // Apply formatting based on column type and content
                  if (columnType.isPercentage && !isFirstColumn) {
                    const { formatted, numValue } = formatPercentage(cellValue);
                    displayValue = formatted;
                    numericValue = numValue;
                  } else if (columnType.isCurrency || columnType.isNumeric) {
                    // Apply number formatting with commas
                    displayValue = formatNumber(cellValue);
                  } else {
                    // For non-numeric columns, still check if individual values are numeric
                    if (isNumericValue(cellValue) && !isFirstColumn) {
                      displayValue = formatNumber(cellValue);
                    } else {
                      displayValue =
                        cellValue !== undefined ? String(cellValue) : "N/A";
                    }
                  }

                  return (
                    <ColorCodedTableCell
                      key={`${rowIndex}-${header}`}
                      align={isFirstColumn ? "left" : "center"}
                      isPercentage={columnType.isPercentage && !isFirstColumn}
                      value={numericValue}
                    >
                      {displayValue}
                    </ColorCodedTableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
};

// Main TableDisplay Component
interface TableDisplayProps {
  tableData: {
    table1?: any[];
    table2?: any[];
    table3?: any[];
    table4?: any[];
    table5?: any[];
  };
  viewMode?: string;
  activeTab?: number;
  onTabChange?: (event: React.SyntheticEvent, newValue: number) => void;
}

const TableDisplay: React.FC<TableDisplayProps> = ({
  tableData,
  viewMode = "tabs",
  activeTab,
  onTabChange,
}) => {
  // Internal tab state - isolated from parent state
  const [internalTabValue, setInternalTabValue] = useState(3);

  // Use internal state to prevent external state changes from causing restarts
  const currentTabValue =
    activeTab !== undefined ? activeTab : internalTabValue;

  // Memoize the tab change handler to prevent recreation on every render
  const handleTabChange = useCallback(
    (event: React.SyntheticEvent, newValue: number) => {
      // Prevent default behavior that might cause issues
      event.preventDefault();
      event.stopPropagation();

      // Update internal state
      setInternalTabValue(newValue);

      // Call parent handler if provided
      if (onTabChange) {
        onTabChange(event, newValue);
      }
    },
    [onTabChange]
  );

  // Memoize table data to prevent unnecessary re-renders
  const memoizedTableData = useMemo(
    () => ({
      table1: tableData?.table1 || [],
      table2: tableData?.table2 || [],
      table3: tableData?.table3 || [],
      table4: tableData?.table4 || [],
      table5: tableData?.table5 || [],
    }),
    [tableData]
  );

  // If no data, show empty state
  if (!tableData || Object.keys(tableData).length === 0) {
    return (
      <Card sx={{ p: 4, textAlign: "center" }}>
        <TableChartIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No Table Data Available
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Upload and process Excel files to view data tables
        </Typography>
      </Card>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      {/* Tabs Navigation */}
      <Paper sx={{ borderRadius: 2, overflow: "hidden", mb: 2 }}>
        <CleanTabs
          value={currentTabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          <CleanTab
            label="Pivot"
            icon={<CategoryIcon />}
            iconPosition="start"
            {...a11yProps(0)}
          />

          <CleanTab
            label="Percentage Table"
            icon={<PercentIcon />}
            iconPosition="start"
            {...a11yProps(1)}
          />
          <CleanTab
            label="In-House Table"
            icon={<HomeIcon />}
            iconPosition="start"
            {...a11yProps(2)}
          />
          <CleanTab
            label="Week-over-Week (WOW)"
            icon={<TrendingUpIcon />}
            iconPosition="start"
            {...a11yProps(3)}
          />
        </CleanTabs>
      </Paper>

      {/* Tab Panels - All rendered but hidden when not active */}
      <Box sx={{ mt: 2 }}>
        {/* Pivot Table */}
        <TabPanel value={currentTabValue} index={0} forceRender>
          <DataTable
            title="Category Summary"
            data={memoizedTableData.table1}
            icon={<CategoryIcon />}
            excludePercentageFormatting={true}
          />
        </TabPanel>
        {/* Percentage Table */}
        <TabPanel value={currentTabValue} index={1} forceRender>
          <DataTable
            title="Percentage Table - Week over Week Changes"
            data={memoizedTableData.table2}
            icon={<PercentIcon />}
          />
        </TabPanel>

        {/* In-House Table */}
        <TabPanel value={currentTabValue} index={2} forceRender>
          <DataTable
            title="In-House Table - Category Percentages"
            data={memoizedTableData.table3}
            icon={<HomeIcon />}
          />
        </TabPanel>

        {/* WOW Table */}
        <TabPanel value={currentTabValue} index={3} forceRender>
          <DataTable
            title="Week-over-Week Analysis"
            data={memoizedTableData.table4}
            icon={<TrendingUpIcon />}
          />
        </TabPanel>

        {/* Category Summary */}
      </Box>
    </Box>
  );
};

export default TableDisplay;

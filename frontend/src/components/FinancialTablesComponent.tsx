<<<<<<< HEAD
// Updated FinancialTablesComponent.tsx to ensure all 7 tables are properly displayed
=======
// Updated FinancialTablesComponent.tsx with $ signs for Labor Cost and no $ signs for Labor Hours
>>>>>>> integrations_v41
import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Tabs,
  Tab,
  useTheme,
  alpha,
  Card,
<<<<<<< HEAD
  Alert
} from '@mui/material';

// Interface for financial data
interface StoreValuePair {
  store: string;
  value1: string | number;
  value2: string | number;
  value3: string | number;
  change1?: string | number;
  change2?: string | number;
  isGrandTotal?: boolean;
}

// Interface for table type
interface FinancialTable {
  title: string;
  columns: string[];
  data: StoreValuePair[];
=======
  Alert,
  Chip
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

// Interface for the backend data structure
interface BackendTableData {
  table1?: Array<{
    Store: string;
    'Tw Sales': number;
    'Lw Sales': number;
    'Ly Sales': number;
    'Tw vs. Lw': number;
    'Tw vs. Ly': number;
  }>;
  table2?: Array<{
    Store: string;
    'Tw Orders': number;
    'Lw Orders': number;
    'Ly Orders': number;
    'Tw vs. Lw': number;
    'Tw vs. Ly': number;
  }>;
  table3?: Array<{
    Store: string;
    'Tw Avg Ticket': number;
    'Lw Avg Ticket': number;
    'Ly Avg Ticket': number;
    'Tw vs. Lw': number;
    'Tw vs. Ly': number;
  }>;
  table4?: Array<{
    Store: string;
    'Tw COGS': number;
    'Lw COGS': number;
    'Tw vs. Lw': number;
    'Tw Fc %': number;
    'Lw Fc %': number;
  }>;
  table5?: Array<{
    Store: string;
    'Tw Reg Pay': number;
    'Lw Reg Pay': number;
    'Tw vs. Lw': number;
    'Tw Lc %': number;
    'Lw Lc %': number;
  }>;
  table6?: Array<{
    Store: string;
    'Tw Lb Hrs': number;
    'Lw Lb Hrs': number;
    'Tw vs. Lw': number;
  }>;
  table7?: Array<{
    Store: string;
    'Tw SPMH': number;
    'Lw SPMH': number;
    'Tw vs. Lw': number;
  }>;
>>>>>>> integrations_v41
}

// TabPanel Component
interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

function TablePanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`financial-tabpanel-${index}`}
      aria-labelledby={`financial-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Props for the component
interface FinancialTablesComponentProps {
<<<<<<< HEAD
  financialTables?: FinancialTable[];
}

const FinancialTablesComponent: React.FC<FinancialTablesComponentProps> = ({ financialTables = [] }) => {
=======
  financialTables?: BackendTableData;
}

const FinancialTablesComponent: React.FC<FinancialTablesComponentProps> = ({ financialTables = {} }) => {
>>>>>>> integrations_v41
  const theme = useTheme();
  const [tableTab, setTableTab] = useState(0);

  useEffect(() => {
<<<<<<< HEAD
    console.log("Financial tables received:", financialTables);
=======
    console.log("Financial tables received from backend:", financialTables);
>>>>>>> integrations_v41
  }, [financialTables]);

  // Handle table tab change
  const handleTableTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTableTab(newValue);
  };

<<<<<<< HEAD
  // Format value with color based on whether it's positive or negative
  const formatValueWithColor = (value: string | number): { value: string, color: string } => {
    if (typeof value === 'string') {
      // Convert percentage string to number for comparison
      if (value.includes('%')) {
        const numValue = parseFloat(value.replace('%', ''));
        return {
          value,
          color: numValue < 0 ? theme.palette.error.main : numValue > 0 ? theme.palette.success.main : 'inherit'
        };
      }
      // Handle dollar values
      if (value.includes('$')) {
        const numValue = parseFloat(value.replace('$', '').replace(/,/g, ''));
        return {
          value,
          color: numValue < 0 ? theme.palette.error.main : 'inherit'
        };
      }
      // Return as is for other strings
      return { value, color: 'inherit' };
    } else {
      // For number values
      return {
        value: value.toString(),
        color: value < 0 ? theme.palette.error.main : value > 0 ? theme.palette.success.main : 'inherit'
      };
    }
  };

  // Sample financial data tables - use passed data if available
  const tablesToDisplay = financialTables.length > 0 ? financialTables : [
    {
      title: "Sales",
      columns: ["Store", "Tw Sales", "Lw Sales", "Ly Sales", "Tw vs. Lw", "Tw vs. Ly"],
      data: [
        { store: "0001: Midtown East", value1: "$684,828.09", value2: "$682,457.38", value3: "$1,732,837.11", change1: "0.35%", change2: "-60.48%" },
        { store: "0002: Lenox Hill", value1: "$783,896.10", value2: "$783,896.10", value3: "$2,235,045.87", change1: "0.00%", change2: "-64.93%" },
        { store: "0003: Hell's Kitchen", value1: "$894,800.88", value2: "$891,400.08", value3: "$2,402,680.02", change1: "0.38%", change2: "-62.76%" },
        { store: "0004: Union Square", value1: "$230,012.76", value2: "$229,111.90", value3: "$535,126.89", change1: "0.39%", change2: "-57.02%" },
        { store: "0005: Flatiron", value1: "$773,556.81", value2: "$771,903.19", value3: "$1,831,389.44", change1: "0.21%", change2: "-57.76%" },
        { store: "0011: Williamsburg", value1: "$129,696.74", value2: "$129,696.74", value3: "$454,048.17", change1: "0.00%", change2: "-71.44%" },
        { store: "Grand Total", value1: "$3,496,791.38", value2: "$3,488,465.39", value3: "$9,191,127.50", change1: "0.24%", change2: "-61.95%", isGrandTotal: true },
      ]
    },
    {
      title: "Orders",
      columns: ["Store", "Tw Orders", "Lw Orders", "Ly Orders", "Tw vs. Lw", "Tw vs. Ly"],
      data: [
        { store: "0001: Midtown East", value1: "25,157", value2: "25,157", value3: "71,201", change1: "0.00%", change2: "-64.67%" },
        { store: "0002: Lenox Hill", value1: "38,239", value2: "38,239", value3: "104,549", change1: "0.00%", change2: "-63.42%" },
        { store: "0003: Hell's Kitchen", value1: "41,880", value2: "41,880", value3: "111,192", change1: "0.00%", change2: "-62.34%" },
        { store: "0004: Union Square", value1: "10,509", value2: "10,509", value3: "25,316", change1: "0.00%", change2: "-58.49%" },
        { store: "0005: Flatiron", value1: "35,434", value2: "35,434", value3: "88,407", change1: "0.00%", change2: "-59.92%" },
        { store: "0011: Williamsburg", value1: "1,283", value2: "1,283", value3: "749", change1: "0.00%", change2: "71.30%" },
        { store: "Grand Total", value1: "152,502", value2: "152,502", value3: "401,414", change1: "0.00%", change2: "-62.01%", isGrandTotal: true },
      ]
    },
    {
      title: "Average Ticket",
      columns: ["Store", "Tw Avg Ticket", "Lw Avg Ticket", "Ly Avg Ticket", "Tw vs. Lw", "Tw vs. Ly"],
      data: [
        { store: "0001: Midtown East", value1: "$27.22", value2: "$27.13", value3: "$24.34", change1: "0.35%", change2: "11.85%" },
        { store: "0002: Lenox Hill", value1: "$20.50", value2: "$20.50", value3: "$21.38", change1: "0.00%", change2: "-4.11%" },
        { store: "0003: Hell's Kitchen", value1: "$21.37", value2: "$21.28", value3: "$21.61", change1: "0.38%", change2: "-1.12%" },
        { store: "0004: Union Square", value1: "$21.89", value2: "$21.80", value3: "$21.14", change1: "0.39%", change2: "3.54%" },
        { store: "0005: Flatiron", value1: "$21.83", value2: "$21.78", value3: "$20.72", change1: "0.21%", change2: "5.38%" },
        { store: "0011: Williamsburg", value1: "$101.09", value2: "$101.09", value3: "$606.21", change1: "0.00%", change2: "-83.32%" },
        { store: "Grand Total", value1: "$22.93", value2: "$22.87", value3: "$22.90", change1: "0.24%", change2: "0.14%", isGrandTotal: true },
      ]
    },
    {
      title: "COGS",
      columns: ["Store", "Tw COGS", "Lw COGS", "Tw vs. Lw", "Tw Fc %", "Lw Fc %"],
      data: [
        { store: "0001: Midtown East", value1: "$209,202.98", value2: "$208,770.59", value3: "0.21%", change1: "30.55%", change2: "30.59%" },
        { store: "0002: Lenox Hill", value1: "$263,932.59", value2: "$263,932.59", value3: "0.00%", change1: "33.67%", change2: "33.67%" },
        { store: "0003: Hell's Kitchen", value1: "$286,700.07", value2: "$286,259.49", value3: "0.15%", change1: "32.04%", change2: "32.11%" },
        { store: "0004: Union Square", value1: "$67,410.90", value2: "$66,989.23", value3: "0.63%", change1: "29.31%", change2: "29.24%" },
        { store: "0005: Flatiron", value1: "$242,340.09", value2: "$241,910.65", value3: "0.18%", change1: "31.33%", change2: "31.34%" },
        { store: "0011: Williamsburg", value1: "$72,649.35", value2: "$72,162.13", value3: "0.68%", change1: "2.08%", change2: "2.07%" },
        { store: "Grand Total", value1: "$1,142,235.99", value2: "$1,140,024.68", value3: "0.19%", change1: "32.67%", change2: "32.68%", isGrandTotal: true },
      ]
    },
    {
      title: "Regular Pay",
      columns: ["Store", "Tw Reg Pay", "Lw Reg Pay", "Tw vs. Lw", "Tw Lc %", "Lw Lc %"],
      data: [
        { store: "0001: Midtown East", value1: "$120,317.61", value2: "$120,317.61", value3: "0.00%", change1: "17.57%", change2: "17.63%" },
        { store: "0002: Lenox Hill", value1: "$187,929.88", value2: "$186,309.88", value3: "0.87%", change1: "23.97%", change2: "23.77%" },
        { store: "0003: Hell's Kitchen", value1: "$200,590.94", value2: "$199,078.22", value3: "0.76%", change1: "22.42%", change2: "22.33%" },
        { store: "0004: Union Square", value1: "$56,704.25", value2: "$56,704.25", value3: "0.00%", change1: "24.65%", change2: "24.75%" },
        { store: "0005: Flatiron", value1: "$174,991.94", value2: "$173,694.02", value3: "0.75%", change1: "22.62%", change2: "22.50%" },
        { store: "0011: Williamsburg", value1: "$290,133.01", value2: "$290,929.09", value3: "-0.27%", change1: "8.30%", change2: "8.34%" },
        { store: "Grand Total", value1: "$1,030,667.64", value2: "$1,027,033.08", value3: "0.35%", change1: "29.47%", change2: "29.44%", isGrandTotal: true },
      ]
    },
    {
      title: "Labor Hours",
      columns: ["Store", "Tw Lb Hrs", "Lw Lb Hrs", "Tw vs. Lw"],
      data: [
        { store: "0001: Midtown East", value1: "5,737.37", value2: "5,737.37", value3: "0.00%", change1: "", change2: "" },
        { store: "0002: Lenox Hill", value1: "9,291.48", value2: "9,291.48", value3: "0.00%", change1: "", change2: "" },
        { store: "0003: Hell's Kitchen", value1: "9,436.65", value2: "9,436.65", value3: "0.00%", change1: "", change2: "" },
        { store: "0004: Union Square", value1: "2,830.92", value2: "2,830.92", value3: "0.00%", change1: "", change2: "" },
        { store: "0005: Flatiron", value1: "8,598.96", value2: "8,598.96", value3: "0.00%", change1: "", change2: "" },
        { store: "0011: Williamsburg", value1: "12,297.80", value2: "12,297.80", value3: "0.00%", change1: "", change2: "" },
        { store: "Grand Total", value1: "48,193.18", value2: "48,193.18", value3: "0.00%", change1: "", change2: "", isGrandTotal: true },
      ]
    },
    {
      title: "SPMH",
      columns: ["Store", "Tw SPMH", "Lw SPMH", "Tw vs. Lw"],
      data: [
        { store: "0001: Midtown East", value1: "117.44", value2: "389.74", value3: "-69.87%", change1: "", change2: "" },
        { store: "0002: Lenox Hill", value1: "84.34", value2: "84.34", value3: "0.00%", change1: "", change2: "" },
        { store: "0003: Hell's Kitchen", value1: "105.41", value2: "345.76", value3: "-69.51%", change1: "", change2: "" },
        { store: "0004: Union Square", value1: "71.39", value2: "198.36", value3: "-64.01%", change1: "", change2: "" },
        { store: "0005: Flatiron", value1: "99.08", value2: "305.27", value3: "-67.54%", change1: "", change2: "" },
        { store: "0011: Williamsburg", value1: "10.12", value2: "668.70", value3: "-98.49%", change1: "", change2: "" },
        { store: "Grand Total", value1: "83.65", value2: "325.89", value3: "-74.33%", change1: "", change2: "", isGrandTotal: true },
      ]
    }
  ];

  return (
    <Box sx={{ width: '100%' }}>
      {/* Message for debugging */}
      {financialTables.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Using default sample data. No financial tables received from backend.
        </Alert>
      )}

      {/* Table filter tabs */}
      <Tabs 
        value={tableTab}
        onChange={handleTableTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: 2,
          '& .MuiTab-root': {
            textTransform: 'none',
            minWidth: 'unset',
            fontWeight: 500,
            fontSize: '0.9rem',
            px: 3,
            '&.Mui-selected': {
              color: theme.palette.primary.main,
              fontWeight: 600
            }
          }
        }}
      >
        <Tab label="All Tables" />
        {tablesToDisplay.map((table, index) => (
          <Tab key={table.title} label={table.title} />
        ))}
      </Tabs>
=======
  // Format currency
  const formatCurrency = (value: number): string => {
    if (value === 0 || value === null || value === undefined) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Format percentage
  const formatPercentage = (value: number): string => {
    if (value === 0 || value === null || value === undefined) return '0.00%';
    return `${value.toFixed(2)}%`;
  };

  // Format number with $ sign for Orders table
  const formatNumberWithDollar = (value: number): string => {
    if (value === 0 || value === null || value === undefined) return '$0';
    return '$' + new Intl.NumberFormat('en-US').format(Math.round(value));
  };

  // Format number with commas (for non-currency numbers)
  const formatNumber = (value: number): string => {
    if (value === 0 || value === null || value === undefined) return '0';
    return new Intl.NumberFormat('en-US').format(Math.round(value));
  };

  // Format hours with $ sign (removed - no longer used)
  const formatHoursWithDollar = (value: number): string => {
    if (value === 0 || value === null || value === undefined) return '$0.00';
    return '$' + value.toFixed(2);
  };

  // Format hours (for Labor Hours table - no currency)
  const formatHours = (value: number): string => {
    if (value === 0 || value === null || value === undefined) return '0.00';
    return value.toFixed(2);
  };

  // Get change indicator with color and icon
  const getChangeIndicator = (value: number) => {
    if (value === 0) {
      return {
        color: theme.palette.text.secondary,
        icon: null,
        text: '0.00%'
      };
    }
    
    const isPositive = value > 0;
    return {
      color: isPositive ? theme.palette.success.main : theme.palette.error.main,
      icon: isPositive ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />,
      text: `${isPositive ? '+' : ''}${value.toFixed(2)}%`
    };
  };

  // Create table structure from backend data
  const createTableStructure = () => {
    const tables = [
      {
        id: 'sales',
        title: 'Sales',
        icon: '💰',
        data: financialTables.table1 || [],
        columns: [
          { key: 'Store', label: 'Store Location', align: 'left' as const },
          { key: 'Tw Sales', label: 'This Week', align: 'center' as const, format: 'currency' },
          { key: 'Lw Sales', label: 'Last Week', align: 'center' as const, format: 'currency' },
          { key: 'Ly Sales', label: 'Last Year', align: 'center' as const, format: 'currency' },
          { key: 'Tw vs. Lw', label: 'TW vs LW', align: 'center' as const, format: 'percentage' },
          { key: 'Tw vs. Ly', label: 'TW vs LY', align: 'center' as const, format: 'percentage' }
        ]
      },
      {
        id: 'orders',
        title: 'Orders',
        icon: '📋',
        data: financialTables.table2 || [],
        columns: [
          { key: 'Store', label: 'Store Location', align: 'left' as const },
          { key: 'Tw Orders', label: 'This Week', align: 'center' as const, format: 'numberWithDollar' },
          { key: 'Lw Orders', label: 'Last Week', align: 'center' as const, format: 'numberWithDollar' },
          { key: 'Ly Orders', label: 'Last Year', align: 'center' as const, format: 'numberWithDollar' },
          { key: 'Tw vs. Lw', label: 'TW vs LW', align: 'center' as const, format: 'percentage' },
          { key: 'Tw vs. Ly', label: 'TW vs LY', align: 'center' as const, format: 'percentage' }
        ]
      },
      {
        id: 'avgticket',
        title: 'Avg Ticket',
        icon: '🎫',
        data: financialTables.table3 || [],
        columns: [
          { key: 'Store', label: 'Store Location', align: 'left' as const },
          { key: 'Tw Avg Ticket', label: 'This Week', align: 'center' as const, format: 'currency' },
          { key: 'Lw Avg Ticket', label: 'Last Week', align: 'center' as const, format: 'currency' },
          { key: 'Ly Avg Ticket', label: 'Last Year', align: 'center' as const, format: 'currency' },
          { key: 'Tw vs. Lw', label: 'TW vs LW', align: 'center' as const, format: 'percentage' },
          { key: 'Tw vs. Ly', label: 'TW vs LY', align: 'center' as const, format: 'percentage' }
        ]
      },
      {
        id: 'cogs',
        title: 'Cost of Goods',
        icon: '📦',
        data: financialTables.table4 || [],
        columns: [
          { key: 'Store', label: 'Store Location', align: 'left' as const },
          { key: 'Tw COGS', label: 'This Week', align: 'center' as const, format: 'currency' },
          { key: 'Lw COGS', label: 'Last Week', align: 'center' as const, format: 'currency' },
          { key: 'Tw vs. Lw', label: 'Change', align: 'center' as const, format: 'percentage' },
          { key: 'Tw Fc %', label: 'TW %', align: 'center' as const, format: 'percentage' },
          { key: 'Lw Fc %', label: 'LW %', align: 'center' as const, format: 'percentage' }
        ]
      },
      {
        id: 'labor',
        title: 'Labor Cost',
        icon: '👥',
        data: financialTables.table5 || [],
        columns: [
          { key: 'Store', label: 'Store Location', align: 'left' as const },
          { key: 'Tw Reg Pay', label: 'This Week', align: 'center' as const, format: 'currency' }, // UPDATED: Changed from 'number' to 'currency'
          { key: 'Lw Reg Pay', label: 'Last Week', align: 'center' as const, format: 'currency' }, // UPDATED: Changed from 'number' to 'currency'
          { key: 'Tw vs. Lw', label: 'Change', align: 'center' as const, format: 'percentage' },
          { key: 'Tw Lc %', label: 'TW %', align: 'center' as const, format: 'percentage' },
          { key: 'Lw Lc %', label: 'LW %', align: 'center' as const, format: 'percentage' }
        ]
      },
      {
        id: 'hours',
        title: 'Labor Hours',
        icon: '⏰',
        data: financialTables.table6 || [],
        columns: [
          { key: 'Store', label: 'Store Location', align: 'left' as const },
          { key: 'Tw Lb Hrs', label: 'This Week', align: 'center' as const, format: 'hours' }, // UPDATED: Changed from 'hoursWithDollar' to 'hours'
          { key: 'Lw Lb Hrs', label: 'Last Week', align: 'center' as const, format: 'hours' }, // UPDATED: Changed from 'hoursWithDollar' to 'hours'
          { key: 'Tw vs. Lw', label: 'Change', align: 'center' as const, format: 'percentage' }
        ]
      },
      {
        id: 'spmh',
        title: 'Sales per Hour',
        icon: '⚡',
        data: financialTables.table7 || [],
        columns: [
          { key: 'Store', label: 'Store Location', align: 'left' as const },
          { key: 'Tw SPMH', label: 'This Week', align: 'center' as const, format: 'currency' },
          { key: 'Lw SPMH', label: 'Last Week', align: 'center' as const, format: 'currency' },
          { key: 'Tw vs. Lw', label: 'Change', align: 'center' as const, format: 'percentage' }
        ]
      }
    ];

    return tables.filter(table => table.data.length > 0);
  };

  // Format cell value based on type
  const formatCellValue = (value: any, format: string) => {
    if (value === null || value === undefined) return '-';
    
    switch (format) {
      case 'currency':
        return formatCurrency(value);
      case 'percentage':
        return formatPercentage(value);
      case 'number':
        return formatNumber(value);
      case 'numberWithDollar':
        return formatNumberWithDollar(value);
      case 'hours':
        return formatHours(value);
      case 'hoursWithDollar':
        return formatHoursWithDollar(value);
      default:
        return value.toString();
    }
  };

  // Render table cell with clean, simple styling
  const renderTableCell = (value: any, format: string, isGrandTotal: boolean = false, align: string = 'center') => {
    const formattedValue = formatCellValue(value, format);
    
    if (format === 'percentage' && typeof value === 'number' && value !== 0) {
      const changeIndicator = getChangeIndicator(value);
      return (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: align === 'left' ? 'flex-start' : 'center', 
          gap: 0.5 
        }}>
          <Box sx={{
            backgroundColor: changeIndicator.color,
            borderRadius: '50%',
            width: 16,
            height: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 0.5
          }}>
            <Typography sx={{ 
              color: 'white', 
              fontSize: '0.6rem', 
              fontWeight: 'bold',
              lineHeight: 1
            }}>
              {value > 0 ? '↗' : '↘'}
            </Typography>
          </Box>
          <Typography
            sx={{
              color: theme.palette.grey[700],
              fontWeight: isGrandTotal ? 600 : 500,
              fontSize: '0.875rem'
            }}
          >
            {changeIndicator.text}
          </Typography>
        </Box>
      );
    }

    return (
      <Typography
        sx={{
          fontWeight: isGrandTotal ? 600 : 500,
          fontSize: '0.875rem',
          color: isGrandTotal ? theme.palette.primary.main : theme.palette.grey[700],
          textAlign: align === 'left' ? 'left' : 'center'
        }}
      >
        {formattedValue}
      </Typography>
    );
  };

  const tablesData = createTableStructure();

  // Check if we have any data
  const hasData = tablesData.length > 0;

  if (!hasData) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        <Typography variant="h6" gutterBottom>No Financial Data Available</Typography>
        <Typography variant="body2">
          Financial tables data is not available. Please ensure data is loaded from the backend.
        </Typography>
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Compact table filter tabs with smaller spacing to fit all on one screen */}
      <Box sx={{ 
        borderBottom: 1, 
        borderColor: 'divider', 
        mb: 2,
        backgroundColor: alpha(theme.palette.primary.main, 0.02),
        borderRadius: 1,
        p: 0.5,
        overflow: 'hidden'
      }}>
        <Tabs 
          value={tableTab}
          onChange={handleTableTabChange}
          variant="scrollable"
          scrollButtons={false}
          allowScrollButtonsMobile={false}
          sx={{
            minHeight: 'auto',
            '& .MuiTabs-flexContainer': {
              gap: 0.5,
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              minWidth: 'auto',
              minHeight: 'auto',
              fontWeight: 500,
              fontSize: '0.75rem',
              px: 1,
              py: 0.5,
              margin: '0 2px',
              borderRadius: 0.5,
              transition: 'all 0.2s ease',
              maxWidth: '140px',
              '&.Mui-selected': {
                color: theme.palette.primary.main,
                fontWeight: 600,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                fontSize: '0.75rem',
              },
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.05)
              }
            },
            '& .MuiTabs-indicator': {
              display: 'none'
            }
          }}
        >
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <span style={{ fontSize: '0.75rem' }}>📊</span>
                <span>All</span>
                <Chip 
                  label={tablesData.length} 
                  size="small" 
                  sx={{ 
                    height: 16, 
                    fontSize: '0.65rem',
                    minWidth: 16,
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    '& .MuiChip-label': {
                      px: 0.5
                    }
                  }} 
                />
              </Box>
            } 
          />
          {tablesData.map((table, index) => (
            <Tab 
              key={table.id} 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <span style={{ fontSize: '0.75rem' }}>{table.icon}</span>
                  <span>{table.title}</span>
                  <Chip 
                    label={table.data.length} 
                    size="small" 
                    sx={{ 
                      height: 16, 
                      fontSize: '0.65rem',
                      minWidth: 16,
                      backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                      color: theme.palette.secondary.main,
                      '& .MuiChip-label': {
                        px: 0.5
                      }
                    }} 
                  />
                </Box>
              } 
            />
          ))}
        </Tabs>
      </Box>
>>>>>>> integrations_v41

      {/* All Tables Panel */}
      <TablePanel value={tableTab} index={0}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
<<<<<<< HEAD
          {tablesToDisplay.map((table, index) => (
            <Card 
              key={index} 
              elevation={2}
              sx={{ 
                borderRadius: 1,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: theme.palette.divider
              }}
            >
              {/* Table Header */}
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                  px: 2,
                  py: 1
                }}
              >
                <Typography variant="subtitle1" fontWeight={600}>
                  {table.title}
                </Typography>
              </Box>
              
              {/* Table Content */}
              <TableContainer>
                <Table size="small" sx={{ '& th, & td': { px: 2, py: 1 } }}>
                  <TableHead sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
=======
          {tablesData.map((table, index) => (
            <Card 
              key={index} 
              elevation={0}
              sx={{ 
                borderRadius: 3,
                overflow: 'hidden',
                border: `1px solid ${theme.palette.grey[200]}`,
                transition: 'all 0.2s ease',
                backgroundColor: '#ffffff',
                '&:hover': {
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  borderColor: theme.palette.primary.light
                }
              }}
            >
              {/* Clean Simple Header */}
              <Box 
                sx={{ 
                  backgroundColor: '#f8fafc',
                  borderBottom: `1px solid ${theme.palette.grey[200]}`,
                  px: 3,
                  py: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <Box sx={{ 
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: 2,
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 40,
                  height: 40
                }}>
                  <Typography sx={{ fontSize: '1.1rem' }}>
                    {table.icon}
                  </Typography>
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ 
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    color: theme.palette.grey[800],
                    mb: 0.5
                  }}>
                    {table.title}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: theme.palette.grey[600],
                    fontSize: '0.875rem'
                  }}>
                    {table.data.length} locations
                  </Typography>
                </Box>
              </Box>
              
              {/* Clean Table Content */}
              <TableContainer sx={{ backgroundColor: '#ffffff' }}>
                <Table sx={{ '& th, & td': { px: 2, py: 1.5 } }}>
                  <TableHead>
>>>>>>> integrations_v41
                    <TableRow>
                      {table.columns.map((column, colIndex) => (
                        <TableCell 
                          key={colIndex}
<<<<<<< HEAD
                          align={colIndex === 0 ? 'left' : 'right'}
                          sx={{ 
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                            borderBottom: `2px solid ${theme.palette.primary.main}`
                          }}
                        >
                          {column}
=======
                          align={column.align}
                          sx={{ 
                            fontWeight: 600,
                            backgroundColor: '#f8fafc',
                            borderBottom: `1px solid ${theme.palette.grey[200]}`,
                            color: theme.palette.grey[700],
                            fontSize: '0.875rem',
                            py: 1.5,
                            '&:first-of-type': {
                              borderTopLeftRadius: 0
                            },
                            '&:last-of-type': {
                              borderTopRightRadius: 0
                            }
                          }}
                        >
                          {column.label}
>>>>>>> integrations_v41
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {table.data.map((row, rowIndex) => {
<<<<<<< HEAD
                      // Determine if this is the last row (Grand Total)
                      const isLastRow = rowIndex === table.data.length - 1 || row.isGrandTotal;
=======
                      const isGrandTotal = row.Store === 'Grand Total';
>>>>>>> integrations_v41
                      
                      return (
                        <TableRow 
                          key={rowIndex}
                          sx={{ 
<<<<<<< HEAD
                            backgroundColor: isLastRow ? alpha(theme.palette.primary.main, 0.05) : 'inherit',
                            '&:hover': {
                              backgroundColor: isLastRow ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.action.hover, 0.1)
                            },
                            // Add a top border for the Grand Total row
                            ...(isLastRow && {
                              '& td': { 
                                borderTop: `1px solid ${theme.palette.divider}`,
                                fontWeight: 'bold'
                              }
                            })
                          }}
                        >
                          <TableCell 
                            sx={{ 
                              fontWeight: isLastRow ? 'bold' : 'medium',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {row.store}
                          </TableCell>
                          <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                            {row.value1}
                          </TableCell>
                          <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                            {row.value2}
                          </TableCell>
                          <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                            {row.value3}
                          </TableCell>
                          {row.change1 !== undefined && row.change1 !== "" && (
                            <TableCell 
                              align="right" 
                              sx={{ 
                                whiteSpace: 'nowrap',
                                color: formatValueWithColor(row.change1).color
                              }}
                            >
                              {row.change1}
                            </TableCell>
                          )}
                          {row.change2 !== undefined && row.change2 !== "" && (
                            <TableCell 
                              align="right" 
                              sx={{ 
                                whiteSpace: 'nowrap',
                                color: formatValueWithColor(row.change2).color
                              }}
                            >
                              {row.change2}
                            </TableCell>
                          )}
=======
                            backgroundColor: isGrandTotal 
                              ? alpha(theme.palette.primary.main, 0.04)
                              : 'transparent',
                            borderBottom: isGrandTotal 
                              ? `2px solid ${theme.palette.primary.main}`
                              : `1px solid ${theme.palette.grey[100]}`,
                            '&:hover': {
                              backgroundColor: isGrandTotal 
                                ? alpha(theme.palette.primary.main, 0.08)
                                : alpha(theme.palette.grey[50], 0.8)
                            },
                            '&:last-child': {
                              borderBottom: 'none'
                            }
                          }}
                        >
                          {table.columns.map((column, colIndex) => (
                            <TableCell 
                              key={colIndex}
                              align={column.align}
                              sx={{ 
                                borderBottom: 'none',
                                py: 1.5,
                                fontSize: '0.875rem'
                              }}
                            >
                              {colIndex === 0 ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {isGrandTotal && (
                                    <Box sx={{
                                      backgroundColor: theme.palette.warning.main,
                                      borderRadius: '50%',
                                      width: 20,
                                      height: 20,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '0.7rem'
                                    }}>
                                      ⭐
                                    </Box>
                                  )}
                                  <Typography
                                    sx={{
                                      fontWeight: isGrandTotal ? 700 : 500,
                                      color: isGrandTotal ? theme.palette.primary.main : theme.palette.grey[800],
                                      fontSize: '0.875rem'
                                    }}
                                  >
                                    {row[column.key]}
                                  </Typography>
                                </Box>
                              ) : (
                                renderTableCell(row[column.key], column.format, isGrandTotal, column.align)
                              )}
                            </TableCell>
                          ))}
>>>>>>> integrations_v41
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          ))}
        </Box>
      </TablePanel>

      {/* Individual table panels */}
<<<<<<< HEAD
      {tablesToDisplay.map((table, index) => (
        <TablePanel value={tableTab} index={index + 1} key={index}>
          <Card 
            elevation={2}
            sx={{ 
              borderRadius: 1,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: theme.palette.divider
            }}
          >
            {/* Table Header */}
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                backgroundColor: theme.palette.primary.main,
                color: 'white',
                px: 2,
                py: 1
              }}
            >
              <Typography variant="subtitle1" fontWeight={600}>
                {table.title}
              </Typography>
            </Box>
            
            {/* Table Content */}
            <TableContainer>
              <Table size="small" sx={{ '& th, & td': { px: 2, py: 1 } }}>
                <TableHead sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
=======
      {tablesData.map((table, index) => (
        <TablePanel value={tableTab} index={index + 1} key={index}>
          <Card 
            elevation={0}
            sx={{ 
              borderRadius: 3,
              overflow: 'hidden',
              border: `1px solid ${theme.palette.grey[200]}`,
              backgroundColor: '#ffffff'
            }}
          >
            {/* Clean Simple Header */}
            <Box 
              sx={{ 
                backgroundColor: '#f8fafc',
                borderBottom: `1px solid ${theme.palette.grey[200]}`,
                px: 3,
                py: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <Box sx={{ 
                backgroundColor: theme.palette.primary.main,
                borderRadius: 2,
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 40,
                height: 40
              }}>
                <Typography sx={{ fontSize: '1.1rem' }}>
                  {table.icon}
                </Typography>
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" sx={{ 
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: theme.palette.grey[800],
                  mb: 0.5
                }}>
                  {table.title}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: theme.palette.grey[600],
                  fontSize: '0.875rem'
                }}>
                  {table.data.length} locations
                </Typography>
              </Box>
            </Box>
            
            {/* Clean Table Content */}
            <TableContainer sx={{ backgroundColor: '#ffffff' }}>
              <Table sx={{ '& th, & td': { px: 2, py: 1.5 } }}>
                <TableHead>
>>>>>>> integrations_v41
                  <TableRow>
                    {table.columns.map((column, colIndex) => (
                      <TableCell 
                        key={colIndex}
<<<<<<< HEAD
                        align={colIndex === 0 ? 'left' : 'right'}
                        sx={{ 
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          borderBottom: `2px solid ${theme.palette.primary.main}`
                        }}
                      >
                        {column}
=======
                        align={column.align}
                        sx={{ 
                          fontWeight: 600,
                          backgroundColor: '#f8fafc',
                          borderBottom: `1px solid ${theme.palette.grey[200]}`,
                          color: theme.palette.grey[700],
                          fontSize: '0.875rem',
                          py: 1.5
                        }}
                      >
                        {column.label}
>>>>>>> integrations_v41
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {table.data.map((row, rowIndex) => {
<<<<<<< HEAD
                    // Determine if this is the last row (Grand Total)
                    const isLastRow = rowIndex === table.data.length - 1 || row.isGrandTotal;
=======
                    const isGrandTotal = row.Store === 'Grand Total';
>>>>>>> integrations_v41
                    
                    return (
                      <TableRow 
                        key={rowIndex}
                        sx={{ 
<<<<<<< HEAD
                          backgroundColor: isLastRow ? alpha(theme.palette.primary.main, 0.05) : 'inherit',
                          '&:hover': {
                            backgroundColor: isLastRow ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.action.hover, 0.1)
                          },
                          // Add a top border for the Grand Total row
                          ...(isLastRow && {
                            '& td': { 
                              borderTop: `1px solid ${theme.palette.divider}`,
                              fontWeight: 'bold'
                            }
                          })
                        }}
                      >
                        <TableCell 
                          sx={{ 
                            fontWeight: isLastRow ? 'bold' : 'medium',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {row.store}
                        </TableCell>
                        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                          {row.value1}
                        </TableCell>
                        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                          {row.value2}
                        </TableCell>
                        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                          {row.value3}
                        </TableCell>
                        {row.change1 !== undefined && row.change1 !== "" && (
                          <TableCell 
                            align="right" 
                            sx={{ 
                              whiteSpace: 'nowrap',
                              color: formatValueWithColor(row.change1).color
                            }}
                          >
                            {row.change1}
                          </TableCell>
                        )}
                        {row.change2 !== undefined && row.change2 !== "" && (
                          <TableCell 
                            align="right" 
                            sx={{ 
                              whiteSpace: 'nowrap',
                              color: formatValueWithColor(row.change2).color
                            }}
                          >
                            {row.change2}
                          </TableCell>
                        )}
=======
                          backgroundColor: isGrandTotal 
                            ? alpha(theme.palette.primary.main, 0.04)
                            : 'transparent',
                          borderBottom: isGrandTotal 
                            ? `2px solid ${theme.palette.primary.main}`
                            : `1px solid ${theme.palette.grey[100]}`,
                          '&:hover': {
                            backgroundColor: isGrandTotal 
                              ? alpha(theme.palette.primary.main, 0.08)
                              : alpha(theme.palette.grey[50], 0.8)
                          },
                          '&:last-child': {
                            borderBottom: 'none'
                          }
                        }}
                      >
                        {table.columns.map((column, colIndex) => (
                          <TableCell 
                            key={colIndex}
                            align={column.align}
                            sx={{ 
                              borderBottom: 'none',
                              py: 1.5,
                              fontSize: '0.875rem'
                            }}
                          >
                            {colIndex === 0 ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {isGrandTotal && (
                                  <Box sx={{
                                    backgroundColor: theme.palette.warning.main,
                                    borderRadius: '50%',
                                    width: 20,
                                    height: 20,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.7rem'
                                  }}>
                                    ⭐
                                  </Box>
                                )}
                                <Typography
                                  sx={{
                                    fontWeight: isGrandTotal ? 700 : 500,
                                    color: isGrandTotal ? theme.palette.primary.main : theme.palette.grey[800],
                                    fontSize: '0.875rem'
                                  }}
                                >
                                  {row[column.key]}
                                </Typography>
                              </Box>
                            ) : (
                              renderTableCell(row[column.key], column.format, isGrandTotal, column.align)
                            )}
                          </TableCell>
                        ))}
>>>>>>> integrations_v41
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </TablePanel>
      ))}
    </Box>
  );
};

export default FinancialTablesComponent;
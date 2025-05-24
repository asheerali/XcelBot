// Fixed TableDisplay.tsx - Prevents component restart when switching tabs
import React, { useState, useCallback, useMemo } from 'react';
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
  alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Icons
import TableChartIcon from '@mui/icons-material/TableChart';
import PercentIcon from '@mui/icons-material/Percent';
import HomeIcon from '@mui/icons-material/Home';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CategoryIcon from '@mui/icons-material/Category';

// Clean styled components
const CleanTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '0.95rem',
  minHeight: 48,
  padding: '12px 16px',
  margin: '0 2px',
  color: '#6B7280',
  transition: 'all 0.2s ease',
  '&.Mui-selected': {
    color: '#3B82F6',
    fontWeight: 600,
  },
  '&:hover': {
    color: '#3B82F6',
    backgroundColor: alpha('#3B82F6', 0.04),
  }
}));

const CleanTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTabs-indicator': {
    backgroundColor: '#3B82F6',
    height: 2,
    borderRadius: 1,
  },
  '& .MuiTabs-flexContainer': {
    borderBottom: '1px solid #E5E7EB',
    gap: 4,
  },
  minHeight: 48,
}));

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
        style={{ display: isActive ? 'block' : 'none' }}
        {...other}
      >
        <Box sx={{ pt: 2 }}>
          {children}
        </Box>
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
      {isActive && (
        <Box sx={{ pt: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

// Helper function for tab accessibility
function a11yProps(index: number) {
  return {
    id: `table-tab-${index}`,
    'aria-controls': `table-tabpanel-${index}`,
  };
}

// Table component for consistent styling
interface DataTableProps {
  title: string;
  data: any[];
  icon?: React.ReactNode;
}

const DataTable: React.FC<DataTableProps> = ({ title, data, icon }) => {
  const theme = useTheme();
  
  if (!data || data.length === 0) {
    return (
      <Card sx={{ p: 3, textAlign: 'center' }}>
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

  return (
    <Card elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
      {/* Table Header */}
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center',
          backgroundColor: '#f8f9fa',
          px: 3,
          py: 2,
          borderBottom: '1px solid #e0e0e0'
        }}
      >
        {icon && (
          <Box sx={{ mr: 2, color: 'primary.main' }}>
            {icon}
          </Box>
        )}
        <Typography variant="h6" fontWeight={600}>
          {title}
        </Typography>
      </Box>
      
      {/* Table Content */}
      <TableContainer>
        <Table size="small">
          <TableHead sx={{ backgroundColor: alpha('#f8f9fa', 0.5) }}>
            <TableRow>
              {headers.map((header, index) => (
                <TableCell 
                  key={header}
                  align={index === 0 ? 'left' : 'center'}
                  sx={{ 
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    textTransform: 'capitalize',
                    borderBottom: '2px solid #e0e0e0'
                  }}
                >
                  {header.replace(/([A-Z])/g, ' $1').trim()}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow 
                key={rowIndex}
                sx={{ 
                  '&:nth-of-type(odd)': {
                    backgroundColor: alpha('#f8f9fa', 0.25)
                  },
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.04)
                  }
                }}
              >
                {headers.map((header, cellIndex) => (
                  <TableCell 
                    key={`${rowIndex}-${header}`}
                    align={cellIndex === 0 ? 'left' : 'center'}
                    sx={{ 
                      whiteSpace: 'nowrap',
                      fontSize: '0.875rem'
                    }}
                  >
                    {row[header] !== undefined ? row[header] : 'N/A'}
                  </TableCell>
                ))}
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
  viewMode = 'tabs',
  activeTab,
  onTabChange
}) => {
  // Internal tab state - isolated from parent state
  const [internalTabValue, setInternalTabValue] = useState(0);
  
  // Use internal state to prevent external state changes from causing restarts
  const currentTabValue = activeTab !== undefined ? activeTab : internalTabValue;
  
  // Memoize the tab change handler to prevent recreation on every render
  const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
    // Prevent default behavior that might cause issues
    event.preventDefault();
    event.stopPropagation();
    
    // Update internal state
    setInternalTabValue(newValue);
    
    // Call parent handler if provided
    if (onTabChange) {
      onTabChange(event, newValue);
    }
  }, [onTabChange]);

  // Memoize table data to prevent unnecessary re-renders
  const memoizedTableData = useMemo(() => ({
    table1: tableData?.table1 || [],
    table2: tableData?.table2 || [],
    table3: tableData?.table3 || [],
    table4: tableData?.table4 || [],
    table5: tableData?.table5 || []
  }), [tableData]);

  // If no data, show empty state
  if (!tableData || Object.keys(tableData).length === 0) {
    return (
      <Card sx={{ p: 4, textAlign: 'center' }}>
        <TableChartIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
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
    <Box sx={{ width: '100%' }}>
      {/* Tabs Navigation */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden', mb: 2 }}>
        <CleanTabs
          value={currentTabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          <CleanTab 
            label="Percentage Table" 
            icon={<PercentIcon />}
            iconPosition="start"
            {...a11yProps(0)}
          />
          <CleanTab 
            label="In-House Table" 
            icon={<HomeIcon />}
            iconPosition="start"
            {...a11yProps(1)}
          />
          <CleanTab 
            label="Week-over-Week (WOW)" 
            icon={<TrendingUpIcon />}
            iconPosition="start"
            {...a11yProps(2)}
          />
          <CleanTab 
            label="Category Summary" 
            icon={<CategoryIcon />}
            iconPosition="start"
            {...a11yProps(3)}
          />
        </CleanTabs>
      </Paper>

      {/* Tab Panels - All rendered but hidden when not active */}
      <Box sx={{ mt: 2 }}>
        {/* Percentage Table */}
        <TabPanel value={currentTabValue} index={0} forceRender>
          <DataTable
            title="Percentage Table - Week over Week Changes"
            data={memoizedTableData.table2}
            icon={<PercentIcon />}
          />
        </TabPanel>

        {/* In-House Table */}
        <TabPanel value={currentTabValue} index={1} forceRender>
          <DataTable
            title="In-House Table - Category Percentages"
            data={memoizedTableData.table3}
            icon={<HomeIcon />}
          />
        </TabPanel>

        {/* WOW Table */}
        <TabPanel value={currentTabValue} index={2} forceRender>
          <DataTable
            title="Week-over-Week Analysis"
            data={memoizedTableData.table4}
            icon={<TrendingUpIcon />}
          />
        </TabPanel>

        {/* Category Summary */}
        <TabPanel value={currentTabValue} index={3} forceRender>
          <DataTable
            title="Category Summary"
            data={memoizedTableData.table5}
            icon={<CategoryIcon />}
          />
        </TabPanel>
      </Box>
    </Box>
  );
};

export default TableDisplay;
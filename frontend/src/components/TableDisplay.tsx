import React, { useEffect } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';

interface TableData {
  [key: string]: any[];
}

interface TableDisplayProps {
  tableData: TableData;
  viewMode: string;
  activeTab: number;
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
}

interface TableInfo {
  index: number;
  label: string;
  description: string;
  columns: string[];
  key: string;
}

/**
 * Fixed Table Display Component
 * Renders data tables in different view modes
 */
const TableDisplay: React.FC<TableDisplayProps> = ({ 
  tableData, 
  viewMode, 
  activeTab, 
  onTabChange 
}) => {
  // Define table properties
  const tableProps: TableInfo[] = [
    {
      index: 0,
      label: "Percentage Table",
      description: "Shows week-over-week percentage changes for each category. Positive values are good!",
      columns: ['Week', '1P', 'Catering', 'DD', 'GH', 'In-House', 'UB', 'Grand Total'],
      key: 'table1'
    },
    {
      index: 1,
      label: "In-House Table",
      description: "Shows each category as a percentage of In-House sales.",
      columns: ['Week', '1P', 'In-House', 'Catering', 'DD', 'GH', 'UB'],
      key: 'table2'
    },
    {
      index: 2,
      label: "Week-over-Week (WOW)",
      description: "Week-over-Week data with 3P (Third-Party) totals and 1P to 3P ratio.",
      columns: ['Week', '1P', 'In-House', 'Catering', 'DD', 'GH', 'UB', '3P', '1P/3P'],
      key: 'table3'
    },
    {
      index: 3,
      label: "Category Summary",
      description: "Summarizes sales by category with totals and percentages.",
      columns: ['Sales_Category', 'Amount', 'Transactions', '% of Total', 'Avg Transaction'],
      key: 'table5'
    }
  ];

  // Effect to reset activeTab if it's out of bounds
  useEffect(() => {
    if (activeTab >= tableProps.length) {
      // Reset to the first tab if the active tab is out of bounds
      onTabChange({} as React.SyntheticEvent, 0);
    }
  }, [activeTab, onTabChange]);

  // Ensure activeTab is valid
  const safeActiveTab = Math.min(activeTab, tableProps.length - 1);

  // Custom render function for percentage values
  const renderPercentValue = (value: any): JSX.Element | string => {
    if (value === null || value === undefined || value === '####') {
      return <span>####</span>;
    }
    
    // Convert to number if it's a string with % already
    let numValue = typeof value === 'string' && value.includes('%') 
      ? parseFloat(value.replace('%', '')) 
      : parseFloat(value);
    
    if (isNaN(numValue)) {
      return value;
    }
    
    // Determine color based on value
    let color = 'inherit';
    if (numValue > 0) {
      color = 'green';
    } else if (numValue < 0) {
      color = 'red';
    }
    
    return (
      <Typography component="span" style={{ color, fontWeight: 'bold' }}>
        {typeof value === 'string' && value.includes('%') ? value : `${numValue.toFixed(2)}%`}
      </Typography>
    );
  };

  // Custom render function for currency values
  const renderCurrencyValue = (value: any): string => {
    if (value === null || value === undefined || value === '####') {
      return '####';
    }
    
    // If value is already a formatted currency string with $ and commas
    if (typeof value === 'string' && value.includes('$')) {
      return value;
    }
    
    // Try to convert to number
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return value;
    }
    
    // Format as currency
    return `$${numValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Determine if a value should be rendered as percentage
  const isPercentageColumn = (columnName: string, tableIndex: number): boolean => {
    // Week column is never a percentage
    if (columnName === 'Week' || columnName === 'Sales_Category' || 
        columnName === 'Amount' || columnName === 'Transactions' || 
        columnName === 'Avg Transaction') {
      return false;
    }
    
    // For specific tables
    if (tableIndex === 0 || tableIndex === 1 || tableIndex === 2) {
      return true; // All columns except Week are percentages in these tables
    }
    
    // For category summary table
    if (tableIndex === 3 && columnName === '% of Total') {
      return true;
    }
    
    return false;
  };

  // Determine if a value should be rendered as currency
  const isCurrencyColumn = (columnName: string, tableIndex: number): boolean => {
    if (tableIndex === 3) { // Category summary table
      return columnName === 'Amount' || columnName === 'Avg Transaction';
    }
    
    return false;
  };

  // Get background color for header cells based on table type
  const getHeaderColor = (column: string, tableIndex: number): string => {
    // First column (Week or Sales_Category) is always light gray
    if (column === 'Week' || column === 'Sales_Category') return '#f5f5f5';
    
    switch (tableIndex) {
      case 0: // Percentage Table - orange/red headers
        return '#ffddcc';
      case 1: // In-House Table - blue headers
        return '#ccddff';
      case 2: // WOW Table - orange headers
        return '#ffeecc';
      case 3: // Category Summary - green headers
        return '#ccffdd';
      default:
        return '#e0e0e0';
    }
  };
  
  // Helper function to render cell value correctly
  const renderCellValue = (columnName: string, value: any, tableIndex: number): JSX.Element | string => {
    // Special handling for specific columns
    if (columnName === 'Week' || columnName === 'Sales_Category') {
      return value; // Just display as is
    }
    
    if (isPercentageColumn(columnName, tableIndex)) {
      return renderPercentValue(value);
    } else if (isCurrencyColumn(columnName, tableIndex)) {
      return renderCurrencyValue(value);
    } else if (columnName === 'Grand Total') {
      return value; // Display as is, it's already formatted
    } else if (columnName === 'Transactions') {
      return value; // Display as is
    } else {
      return value;
    }
  };

  interface RenderDataTableProps {
    tableIndex: number;
    data: any[];
    columns: string[];
    label: string;
    description: string;
    compact?: boolean;
  }

  // Component to render a single data table
  const RenderDataTable: React.FC<RenderDataTableProps> = ({ 
    tableIndex, 
    data, 
    columns, 
    label, 
    description, 
    compact = false
  }) => {
    return (
      <Card sx={{ 
        width: '100%', 
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <Box
          p={compact ? 1 : 2}
          bgcolor="#f5f5f5" 
          borderBottom="1px solid #ddd"
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant={compact ? "subtitle1" : "h6"}>
            {label}
          </Typography>
          
          <Box display="flex" alignItems="center">
            <Tooltip title={description}>
              <IconButton size="small">
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <TableContainer sx={{ 
          maxHeight: compact ? 400 : 600,
          flex: 1
        }}>
          <Table 
            size={compact ? "small" : "medium"} 
            stickyHeader
          >
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell 
                    key={column} 
                    align="center"
                    sx={{ 
                      fontWeight: 'bold',
                      padding: compact ? '4px' : '8px',
                      backgroundColor: getHeaderColor(column, tableIndex),
                      color: 'black',
                      border: '1px solid #ddd'
                    }}
                  >
                    {column}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.length === 0 ? (
                // Show empty rows when no data
                Array(tableIndex === 3 ? 7 : 17).fill(0).map((_, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {columns.map((column, colIndex) => (
                      <TableCell 
                        key={`${rowIndex}-${colIndex}`}
                        align="center"
                        sx={{ 
                          padding: compact ? '4px' : '8px',
                          border: '1px solid #ddd',
                          backgroundColor: rowIndex % 2 === 0 ? '#fff' : '#f9f9f9'
                        }}
                      >
                        {column === 'Week' ? (rowIndex + 1) : 
                         column === 'Sales_Category' ? 'Category' : '####'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                // Show actual data
                data.map((row, index) => (
                  <TableRow 
                    key={index} 
                    sx={{ 
                      '&:nth-of-type(odd)': { backgroundColor: '#fff' },
                      '&:nth-of-type(even)': { backgroundColor: '#f9f9f9' },
                      '&:hover': { backgroundColor: '#f0f0f0' }
                    }}
                  >
                    {columns.map((column) => {
                      // Get the value, but handle cases where the column might not exist in the data
                      const value = row[column] !== undefined ? row[column] : '####';
                      
                      return (
                        <TableCell 
                          key={`${index}-${column}`}
                          align="center"
                          sx={{ 
                            padding: compact ? '4px' : '8px', 
                            border: '1px solid #ddd' 
                          }}
                        >
                          {renderCellValue(column, value, tableIndex)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    );
  };

  // Render content based on view mode
  if (viewMode === 'tabs') {
    // Tabbed view
    return (
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={safeActiveTab}
          onChange={onTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          {tableProps.map(table => (
            <Tab key={table.index} label={table.label} />
          ))}
        </Tabs>
        
        <Box p={2}>
          <RenderDataTable 
            tableIndex={safeActiveTab}
            data={tableData[tableProps[safeActiveTab].key] || []}
            columns={tableProps[safeActiveTab].columns}
            label={tableProps[safeActiveTab].label}
            description={tableProps[safeActiveTab].description}
          />
        </Box>
      </Paper>
    );
  } else if (viewMode === 'combined') {
    // Combined view - all tables in vertical stack
    return (
      <Paper sx={{ width: '100%', p: 2 }}>
        <Typography variant="h5" mb={2}>Stacked Tables View</Typography>
        
        <Grid container spacing={2}>
          {tableProps.map(table => (
            <Grid item xs={12} key={table.index}>
              <RenderDataTable 
                tableIndex={table.index}
                data={tableData[table.key] || []}
                columns={table.columns}
                label={table.label}
                description={table.description}
                compact={true}
              />
            </Grid>
          ))}
        </Grid>
      </Paper>
    );
  }
};

export default TableDisplay;
// src/pages/Financials.tsx - Updated with ComprehensiveFinancialDashboard integration

import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Popover from '@mui/material/Popover';
import MenuList from '@mui/material/MenuList';
import CircularProgress from '@mui/material/CircularProgress';

// Import axios for API calls
import axios from 'axios';

// Icons
import PlaceIcon from '@mui/icons-material/Place';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';

// Import components
import FinancialTable from '../components/FinancialTable';
import DayOfWeekAnalysis from '../components/DayOfWeekAnalysis';
import WeekOverWeekChart from '../components/graphs/WeekOverWeekChart';
import BudgetChart from '../components/graphs/BudgetChart';
import SalesChart from '../components/graphs/SalesChart';
import OrdersChart from '../components/graphs/OrdersChart';
import AvgTicketChart from '../components/graphs/AvgTicketChart';
import DateRangeSelector from '../components/DateRangeSelector';

// Import Redux hooks
import { useAppDispatch, useAppSelector } from '../typedHooks';
import { 
  selectFinancialLocation, 
  updateFinancialFilters,
  setTableData,
  setLoading,
  setError
} from '../store/excelSlice';

// API URLs
const FINANCIAL_FILTER_API_URL = 'http://localhost:8000/api/financials/filter';

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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}

// Multi-Select Filter Component matching the image design
interface MultiSelectFilterProps {
  id: string;
  label: string;
  value: string[];
  options: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  icon?: React.ReactNode;
}

const MultiSelectFilter: React.FC<MultiSelectFilterProps> = ({
  id,
  label,
  value,
  options,
  onChange,
  placeholder = "Select options",
  icon
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchText, setSearchText] = useState('');
  const open = Boolean(anchorEl);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSearchText('');
  };

  const handleToggle = (option: string) => {
    const newValue = value.includes(option)
      ? value.filter(item => item !== option)
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

  const handleClear = (event: React.MouseEvent) => {
    event.stopPropagation();
    onChange([]);
  };

  const displayText = value.length === 0 
    ? placeholder 
    : value.length === 1 
      ? value[0]
      : `Multiple Loc... (${value.length})`;

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <Typography 
        variant="body2" 
        sx={{ 
          mb: 1, 
          color: '#666',
          fontSize: '0.875rem',
          fontWeight: 500
        }}
      >
        {label}
      </Typography>
      
      <Box
        onClick={handleClick}
        sx={{
          display: 'flex',
          alignItems: 'center',
          border: '2px solid #e0e0e0',
          borderRadius: '8px',
          padding: '12px 16px',
          cursor: 'pointer',
          backgroundColor: '#fff',
          minHeight: '48px',
          position: 'relative',
          '&:hover': {
            borderColor: '#1976d2',
          }
        }}
      >
        {icon && (
          <Box sx={{ color: '#1976d2', mr: 1.5, display: 'flex', alignItems: 'center' }}>
            {icon}
          </Box>
        )}
        
        <Typography 
          variant="body1" 
          sx={{ 
            flexGrow: 1,
            color: value.length > 0 ? '#333' : '#999',
            fontSize: '0.95rem'
          }}
        >
          {displayText}
        </Typography>
        
        {value.length > 0 && (
          <IconButton
            size="small"
            onClick={handleClear}
            sx={{
              width: 20,
              height: 20,
              backgroundColor: '#666',
              color: 'white',
              fontSize: '12px',
              mr: 1,
              '&:hover': {
                backgroundColor: '#333',
              }
            }}
          >
            <CloseIcon sx={{ fontSize: '12px' }} />
          </IconButton>
        )}
        
        <SearchIcon sx={{ color: '#666', fontSize: '1.2rem' }} />
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
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
            width: anchorEl?.offsetWidth || 'auto',
            maxHeight: 400,
            mt: 1,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }
        }}
      >
        {/* Search Box */}
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <TextField
            fullWidth
            placeholder="Search..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: '#666' }} />,
              sx: {
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#1976d2',
                  borderWidth: '2px'
                }
              }
            }}
          />
        </Box>

        {/* Select All */}
        <Box sx={{ p: 1 }}>
          <Box
            onClick={handleSelectAll}
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 1,
              cursor: 'pointer',
              borderRadius: 1,
              '&:hover': {
                backgroundColor: '#f5f5f5',
              }
            }}
          >
            <Checkbox
              checked={value.length === options.length}
              indeterminate={value.length > 0 && value.length < options.length}
              size="small"
              sx={{ p: 0, mr: 2 }}
            />
            <ListItemText primary="Select All" />
          </Box>
        </Box>

        <Divider />

        {/* Options List */}
        <MenuList sx={{ py: 0, maxHeight: 250, overflow: 'auto' }}>
          {filteredOptions.length === 0 ? (
            <MenuItem disabled>
              <ListItemText primary="No options found" />
            </MenuItem>
          ) : (
            filteredOptions.map((option) => (
              <MenuItem 
                key={option} 
                onClick={() => handleToggle(option)}
                dense
                sx={{ py: 1 }}
              >
                <Checkbox 
                  checked={value.includes(option)} 
                  size="small" 
                  sx={{ p: 0, mr: 2 }}
                />
                <ListItemText primary={option} />
              </MenuItem>
            ))
          )}
        </MenuList>
      </Popover>
    </Box>
  );
};

// Date Range Selector Component
interface DateRangeSelectorComponentProps {
  label: string;
  onDateRangeSelect: (dateRange: any) => void;
}

const DateRangeSelectorComponent: React.FC<DateRangeSelectorComponentProps> = ({
  label,
  onDateRangeSelect
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRange, setSelectedRange] = useState<string>('Select date range');
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDateRangeSelect = (range: any) => {
    // Format the display text
    const startDate = range.startDate.toLocaleDateString();
    const endDate = range.endDate.toLocaleDateString();
    setSelectedRange(`${startDate} - ${endDate}`);
    
    // Pass the range to parent
    onDateRangeSelect(range);
    
    // Close the popover
    handleClose();
  };

  const handleClear = (event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedRange('Select date range');
    onDateRangeSelect(null);
  };

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <Typography 
        variant="body2" 
        sx={{ 
          mb: 1, 
          color: '#666',
          fontSize: '0.875rem',
          fontWeight: 500
        }}
      >
        {label}
      </Typography>
      
      <Box
        onClick={handleClick}
        sx={{
          display: 'flex',
          alignItems: 'center',
          border: '2px solid #e0e0e0',
          borderRadius: '8px',
          padding: '12px 16px',
          cursor: 'pointer',
          backgroundColor: '#fff',
          minHeight: '48px',
          position: 'relative',
          '&:hover': {
            borderColor: '#1976d2',
          }
        }}
      >
        <Box sx={{ color: '#1976d2', mr: 1.5, display: 'flex', alignItems: 'center' }}>
          <CalendarTodayIcon />
        </Box>
        
        <Typography 
          variant="body1" 
          sx={{ 
            flexGrow: 1,
            color: selectedRange === 'Select date range' ? '#999' : '#333',
            fontSize: '0.95rem'
          }}
        >
          {selectedRange}
        </Typography>
        
        {selectedRange !== 'Select date range' && (
          <IconButton
            size="small"
            onClick={handleClear}
            sx={{
              width: 20,
              height: 20,
              backgroundColor: '#666',
              color: 'white',
              fontSize: '12px',
              mr: 1,
              '&:hover': {
                backgroundColor: '#333',
              }
            }}
          >
            <CloseIcon sx={{ fontSize: '12px' }} />
          </IconButton>
        )}
        
        <SearchIcon sx={{ color: '#666', fontSize: '1.2rem' }} />
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
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
            mt: 1,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DateRangeSelector onSelect={handleDateRangeSelect} />
      </Popover>
    </Box>
  );
};

// Comprehensive Financial Dashboard Component (Updated to use backend data)
const ComprehensiveFinancialDashboard = ({ financialData }: { financialData: any }) => {
  // Extract data from backend tables
  const salesData = financialData?.table6 || [];
  const laborData = financialData?.table7 || [];
  const avgTicketData = financialData?.table8 || [];
  const primeCostData = financialData?.table9 || [];
  const foodCostData = financialData?.table10 || [];
  const spmhData = financialData?.table11 || [];
  const lpmhData = financialData?.table12 || [];
  const weeklySalesData = financialData?.table13 || [];
  const ordersByDayData = financialData?.table14 || [];
  const avgTicketChartData = financialData?.table15 || [];
  const kpiData = financialData?.table16 || [];

  // Helper function to format change values
  const formatChange = (value: string) => {
    if (!value) return { value: '0%', color: '#666', arrow: '' };
    
    const numValue = parseFloat(value.replace('%', ''));
    const isPositive = numValue >= 0;
    return {
      value: value,
      color: isPositive ? '#2e7d32' : '#d32f2f',
      arrow: isPositive ? '▲' : '▼'
    };
  };

  // Simple Line Chart Component
  const SimpleLineChart = ({ data, title, height = 250, dataKeys = ['This Week', 'Last Week', 'Last Year'] }) => {
    if (!data || data.length === 0) {
      return (
        <div style={{ 
          padding: '20px', 
          background: '#fff', 
          borderRadius: '8px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          width: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: height
        }}>
          <Typography>No data available</Typography>
        </div>
      );
    }

    const maxValue = Math.max(...data.map(d => Math.max(...dataKeys.map(key => d[key] || 0))));
    const minValue = Math.min(...data.map(d => Math.min(...dataKeys.map(key => d[key] || 0))));
    const range = maxValue - minValue || 1;
    
    const getY = (value: number) => {
      return height - 40 - ((value - minValue) / range) * (height - 80);
    };
    
    const getX = (index: number) => {
      return 60 + (index * (320 / (data.length - 1)));
    };

    return (
      <div style={{ 
        padding: '20px', 
        background: '#fff', 
        borderRadius: '8px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600' }}>{title}</h3>
        <div style={{ overflow: 'auto' }}>
          <svg width="400" height={height} style={{ overflow: 'visible', minWidth: '350px' }}>
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
              <line
                key={i}
                x1="60"
                y1={40 + ratio * (height - 80)}
                x2="380"
                y2={40 + ratio * (height - 80)}
                stroke="#e0e0e0"
                strokeWidth="1"
              />
            ))}
            
            {/* Lines for each data key */}
            {dataKeys.map((key, keyIndex) => {
              const colors = ['#1976d2', '#90caf9', '#424242', '#ff6b35', '#4caf50'];
              const strokeWidths = [3, 2, 2, 2, 2];
              
              return (
                <polyline
                  key={key}
                  fill="none"
                  stroke={colors[keyIndex] || '#666'}
                  strokeWidth={strokeWidths[keyIndex] || 2}
                  points={data.map((d, i) => `${getX(i)},${getY(d[key] || 0)}`).join(' ')}
                />
              );
            })}
            
            {/* Data points */}
            {data.map((d, i) => (
              <g key={i}>
                {dataKeys.map((key, keyIndex) => {
                  const colors = ['#1976d2', '#90caf9', '#424242', '#ff6b35', '#4caf50'];
                  const radii = [4, 3, 3, 3, 3];
                  
                  return (
                    <circle 
                      key={key}
                      cx={getX(i)} 
                      cy={getY(d[key] || 0)} 
                      r={radii[keyIndex] || 3} 
                      fill={colors[keyIndex] || '#666'} 
                    />
                  );
                })}
              </g>
            ))}
            
            {/* X-axis labels */}
            {data.map((d, i) => (
              <text
                key={i}
                x={getX(i)}
                y={height - 10}
                textAnchor="middle"
                fontSize="12"
                fill="#666"
              >
                {d.Day || d.day || d.label || i + 1}
              </text>
            ))}
            
            {/* Y-axis labels */}
            {[minValue, (minValue + maxValue) / 2, maxValue].map((value, i) => (
              <text
                key={i}
                x="50"
                y={getY(value) + 4}
                textAnchor="end"
                fontSize="12"
                fill="#666"
              >
                {value.toFixed(1)}
              </text>
            ))}
          </svg>
        </div>
        
        {/* Legend */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '10px', flexWrap: 'wrap' }}>
          {dataKeys.map((key, index) => {
            const colors = ['#1976d2', '#90caf9', '#424242', '#ff6b35', '#4caf50'];
            
            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '12px', height: '3px', background: colors[index] || '#666' }}></div>
                <span style={{ fontSize: '12px', color: '#666' }}>{key}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Financial Data Table Component
  const FinancialDataTable = ({ title, mainValue, data, columns }: any) => {
    if (!data || data.length === 0) {
      return (
        <div style={{ 
          background: '#fff', 
          borderRadius: '12px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0',
          height: '300px',
          width: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Typography>No data available for {title}</Typography>
        </div>
      );
    }

    return (
      <div style={{ 
        background: '#fff', 
        borderRadius: '12px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #e0e0e0',
        transition: 'all 0.3s ease',
        height: '100%',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#333' }}>{title}</h3>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#1976d2' }}>{mainValue}</div>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '300px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5' }}>
                  <th style={{ padding: '8px 4px', textAlign: 'left', fontWeight: '600', fontSize: '11px', borderBottom: '1px solid #ddd' }}>Time Period</th>
                  <th style={{ padding: '8px 4px', textAlign: 'left', fontWeight: '600', fontSize: '11px', borderBottom: '1px solid #ddd' }}>% Change</th>
                  {columns.map((col: any, index: number) => (
                    <th key={index} style={{ padding: '8px 4px', textAlign: 'left', fontWeight: '600', fontSize: '11px', borderBottom: '1px solid #ddd' }}>
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row: any, index: number) => (
                  <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                    <td style={{ padding: '6px 4px', fontWeight: '600', borderBottom: '1px solid #eee' }}>
                      {row['Time Period'] || row.period}
                    </td>
                    <td style={{ padding: '6px 4px', borderBottom: '1px solid #eee' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <span style={{ color: formatChange(row['% Change'] || row.change).color, fontSize: '10px' }}>
                          {formatChange(row['% Change'] || row.change).arrow}
                        </span>
                        <span style={{ color: formatChange(row['% Change'] || row.change).color, fontWeight: '600' }}>
                          {row['% Change'] || row.change}
                        </span>
                      </div>
                    </td>
                    {columns.map((col: any, colIndex: number) => (
                      <td key={colIndex} style={{ padding: '6px 4px', borderBottom: '1px solid #eee' }}>
                        {row[col.key] || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Get main value for each section (first row's total or average)
  const getSalesMainValue = () => {
    if (salesData.length === 0) return '$0.00';
    const firstRow = salesData[0];
    return firstRow['TTL'] || firstRow.total || '$0.00';
  };

  const getLaborMainValue = () => {
    if (laborData.length === 0) return '0%';
    // Calculate total labor percentage
    const firstRow = laborData[0];
    return firstRow['Total'] || '35.25%';
  };

  return (
    <div style={{ 
      padding: '24px',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      maxWidth: '100vw',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: 'clamp(24px, 5vw, 36px)',
          fontWeight: '700',
          color: '#1976d2',
          margin: '0 0 8px 0'
        }}>
          Comprehensive Financial Dashboard
        </h1>
        <p style={{ 
          fontSize: 'clamp(14px, 3vw, 18px)',
          color: '#666',
          margin: 0
        }}>
          Complete Financial Analytics & Performance Metrics
        </p>
      </div>

      {/* Top Row - Sales and Labor Cost */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(400px, 100%), 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        <FinancialDataTable
          title="Sales"
          mainValue={getSalesMainValue()}
          data={salesData}
          columns={[
            { label: 'In-House', key: 'In-House' },
            { label: '% (+/-)', key: '% (+/-)_In-House' },
            { label: '1p', key: '1p' },
            { label: '% (+/-)', key: '% (+/-)_1p' },
            { label: '3p', key: '3p' },
            { label: '% (+/-)', key: '% (+/-)_3p' },
            { label: 'Catering', key: 'Catering' },
            { label: '% (+/-)', key: '% (+/-)_Catering' },
            { label: 'TTL', key: 'TTL' }
          ]}
        />
        <FinancialDataTable
          title="Labor Cost"
          mainValue={getLaborMainValue()}
          data={laborData}
          columns={[
            { label: 'Manager', key: 'Manager' },
            { label: '% (+/-)', key: '% (+/-)_Manager' },
            { label: 'FOH', key: 'FOH' },
            { label: '% (+/-)', key: '% (+/-)_FOH' },
            { label: 'BOH', key: 'BOH' },
            { label: '% (+/-)', key: '% (+/-)_BOH' },
            { label: 'Training', key: 'Training' },
            { label: '% (+/-)', key: '% (+/-)_Training' },
            { label: 'Other', key: 'Other' }
          ]}
        />
      </div>

      {/* Second Row - Average Ticket & Prime Cost */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(400px, 100%), 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        <FinancialDataTable
          title="Avg Ticket"
          mainValue={avgTicketData[0]?.['Avg'] || '$0.00'}
          data={avgTicketData}
          columns={[
            { label: 'In-House', key: 'In-House' },
            { label: '% (+/-)', key: '% (+/-)_In-House' },
            { label: '1p', key: '1p' },
            { label: '% (+/-)', key: '% (+/-)_1p' },
            { label: '3p', key: '3p' },
            { label: '% (+/-)', key: '% (+/-)_3p' },
            { label: 'Catering', key: 'Catering' },
            { label: '% (+/-)', key: '% (+/-)_Catering' },
            { label: 'Avg', key: 'Avg' }
          ]}
        />
        <FinancialDataTable
          title="Prime Cost"
          mainValue={primeCostData[0]?.['Total'] || '0%'}
          data={primeCostData}
          columns={[
            { label: 'Labor', key: 'Labor' },
            { label: '% (+/-)', key: '% (+/-)_Labor' },
            { label: 'Food', key: 'Food' },
            { label: '% (+/-)', key: '% (+/-)_Food' },
            { label: 'Paper', key: 'Paper' },
            { label: '% (+/-)', key: '% (+/-)_Paper' },
            { label: 'OK', key: 'OK' },
            { label: '% (+/-)', key: '% (+/-)_OK' },
            { label: 'Total', key: 'Total' }
          ]}
        />
      </div>

      {/* Third Row - Food Cost, SPMH, LPMH */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        <FinancialDataTable
          title="Food Cost"
          mainValue={foodCostData[0]?.['Total'] || '0%'}
          data={foodCostData}
          columns={[
            { label: 'Johns', key: 'Johns' },
            { label: '% (+/-)', key: '% (+/-)_Johns' },
            { label: 'Terra', key: 'Terra' },
            { label: '% (+/-)', key: '% (+/-)_Terra' },
            { label: 'Metro', key: 'Metro' },
            { label: '% (+/-)', key: '% (+/-)_Metro' },
            { label: 'Victory', key: 'Victory' },
            { label: '% (+/-)', key: '% (+/-)_Victory' },
            { label: 'CK', key: 'CK' }
          ]}
        />
        
        {/* SPMH Card */}
        <div style={{ 
          background: '#fff', 
          borderRadius: '12px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0',
          height: 'fit-content',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>SPMH</h3>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#1976d2' }}>
                {spmhData[0]?.['$ Change'] || '$0.00'}
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '200px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ padding: '8px 4px', textAlign: 'left', fontWeight: '600', fontSize: '11px' }}>Time Period</th>
                    <th style={{ padding: '8px 4px', textAlign: 'left', fontWeight: '600', fontSize: '11px' }}>$ Change</th>
                    <th style={{ padding: '8px 4px', textAlign: 'left', fontWeight: '600', fontSize: '11px' }}>% Change</th>
                  </tr>
                </thead>
                <tbody>
                  {spmhData.map((row: any, index: number) => (
                    <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                      <td style={{ padding: '6px 4px', fontWeight: '600' }}>
                        {row['Time Period'] || row.period}
                      </td>
                      <td style={{ padding: '6px 4px' }}>
                        {row['$ Change'] || row.dollarChange}
                      </td>
                      <td style={{ padding: '6px 4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <span style={{ color: formatChange(row['% Change'] || row.percentChange).color, fontSize: '10px' }}>
                            {formatChange(row['% Change'] || row.percentChange).arrow}
                          </span>
                          <span style={{ color: formatChange(row['% Change'] || row.percentChange).color, fontWeight: '600' }}>
                            {row['% Change'] || row.percentChange}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* LPMH Card */}
        <div style={{ 
          background: '#fff', 
          borderRadius: '12px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0',
          height: 'fit-content',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>LPMH</h3>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#1976d2' }}>
                {lpmhData[0]?.['$ Change'] || '$0.00'}
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '200px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ padding: '8px 4px', textAlign: 'left', fontWeight: '600', fontSize: '11px' }}>Time Period</th>
                    <th style={{ padding: '8px 4px', textAlign: 'left', fontWeight: '600', fontSize: '11px' }}>$ Change</th>
                    <th style={{ padding: '8px 4px', textAlign: 'left', fontWeight: '600', fontSize: '11px' }}>% Change</th>
                  </tr>
                </thead>
                <tbody>
                  {lpmhData.map((row: any, index: number) => (
                    <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                      <td style={{ padding: '6px 4px', fontWeight: '600' }}>
                        {row['Time Period'] || row.period}
                      </td>
                      <td style={{ padding: '6px 4px' }}>
                        {row['$ Change'] || row.dollarChange}
                      </td>
                      <td style={{ padding: '6px 4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <span style={{ color: formatChange(row['% Change'] || row.percentChange).color, fontSize: '10px' }}>
                            {formatChange(row['% Change'] || row.percentChange).arrow}
                          </span>
                          <span style={{ color: formatChange(row['% Change'] || row.percentChange).color, fontWeight: '600' }}>
                            {row['% Change'] || row.percentChange}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(350px, 100%), 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        <SimpleLineChart 
          data={weeklySalesData} 
          title="Weekly Sales" 
          dataKeys={['This Week', 'Last Week', 'Last Year', 'L4wt', 'Bdg']}
        />
        <SimpleLineChart 
          data={ordersByDayData} 
          title="Orders by Day of Week" 
          dataKeys={['This Week', 'Last Week', 'Last Year', 'L4wt', 'Bdg']}
        />
      </div>

      {/* Bottom Row - Average Ticket Chart and KPI vs Budget */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))',
        gap: '24px'
      }}>
        <SimpleLineChart 
          data={avgTicketChartData} 
          title="Average Ticket Trends" 
          height={200}
          dataKeys={['This Week', 'Last Week', 'Last Year', 'L4wt', 'Bdg']}
        />
        
        {/* KPI vs Budget Table */}
        <div style={{ 
          background: '#fff', 
          borderRadius: '12px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0',
          height: 'fit-content',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{ padding: '16px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>KPI vs Budget</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '300px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ padding: '8px 4px', textAlign: 'left', fontWeight: '600', fontSize: '11px' }}>Metric</th>
                    <th style={{ padding: '8px 4px', textAlign: 'left', fontWeight: '600', fontSize: '11px' }}>This Week</th>
                    <th style={{ padding: '8px 4px', textAlign: 'left', fontWeight: '600', fontSize: '11px' }}>Budget</th>
                    <th style={{ padding: '8px 4px', textAlign: 'left', fontWeight: '600', fontSize: '11px' }}>Tw/Bdg (+/-)</th>
                  </tr>
                </thead>
                <tbody>
                  {kpiData.map((row: any, index: number) => (
                    <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                      <td style={{ padding: '6px 4px', fontWeight: '600' }}>
                        {row.Metric || row.metric}
                      </td>
                      <td style={{ padding: '6px 4px' }}>
                        {row['This Week'] || row.thisWeek}
                      </td>
                      <td style={{ padding: '6px 4px' }}>
                        {row.Budget || row.budget}
                      </td>
                      <td style={{ padding: '6px 4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                          <span style={{ 
                            color: (row['Tw/Bdg (+/-)'] || row.twBdg || '').startsWith('+') ? '#2e7d32' : '#d32f2f',
                            fontWeight: '600' 
                          }}>
                            {row['Tw/Bdg (+/-)'] || row.twBdg}
                          </span>
                          <span style={{ 
                            background: '#e3f2fd',
                            color: '#1976d2',
                            padding: '2px 6px',
                            borderRadius: '12px',
                            fontSize: '10px'
                          }}>
                            {row.percent || row['%'] || '0%'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions remain the same
const extractFinancialMetrics = (table5Data: any[]) => {
  if (!table5Data || table5Data.length === 0) return [];

  const metricsMap = new Map();
  
  table5Data.forEach(row => {
    const metric = row.Metric || row.metric;
    if (metric) {
      metricsMap.set(metric, {
        thisWeek: row['This Week'] || row.thisWeek || '0',
        lastWeek: row['Last Week'] || row.lastWeek || '0',
        twLwChange: row['Tw/Lw (+/-)'] || row.twLwChange || '0',
        budget: row.Budget || row.budget || '0',
        twBdgChange: row['Tw/Bdg (+/-)'] || row.twBdgChange || '0'
      });
    }
  });

  return metricsMap;
};

const formatPercentageChange = (value: string | number): { value: string, isPositive: boolean } => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  const isPositive = numValue >= 0;
  const formattedValue = isPositive ? `+${Math.abs(numValue).toFixed(2)}%` : `${numValue.toFixed(2)}%`;
  
  return { value: formattedValue, isPositive };
};

const formatCurrency = (value: string | number): string => {
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numValue);
};

// Main component
export function Financials() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Get financial-specific data from Redux
  const { 
    financialFiles, 
    currentFinancialLocation, 
    financialFilters,
    financialLocations,
    fileContent,
    loading,
    error
  } = useAppSelector((state) => state.excel);
  
  // Find current financial data for selected location
  const currentFinancialData = financialFiles.find(f => f.location === currentFinancialLocation);
  
  // State variables
  const [tabValue, setTabValue] = useState(0);
  const [statsData, setStatsData] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([currentFinancialLocation || '']);
  const [selectedDateRange, setSelectedDateRange] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterError, setFilterError] = useState<string>('');
  
  // Current table data from Redux or from current financial data
  const [currentTableData, setCurrentTableData] = useState<any>({
    table5: [],
    table2: [],
    table3: [],
    table4: [],
    table6: [],
    table7: [],
    table8: [],
    table9: [],
    table10: [],
    table11: [],
    table12: [],
    table13: [],
    table14: [],
    table15: [],
    table16: []
  });
  
  // Extract data arrays from current financial data
  const locations = currentFinancialData?.data?.locations || financialLocations || ['Midtown East', 'Downtown West', 'Uptown North'];
  
  // Table data - use local state that gets updated from API calls
  const table5Data = currentTableData.table5 || currentFinancialData?.data?.table5 || [];
  const table2Data = currentTableData.table2 || currentFinancialData?.data?.table2 || [];
  const table3Data = currentTableData.table3 || currentFinancialData?.data?.table3 || [];
  const table4Data = currentTableData.table4 || currentFinancialData?.data?.table4 || [];

  // Initialize selected locations and table data
  useEffect(() => {
    if (locations.length > 0 && selectedLocations.length === 0) {
      setSelectedLocations([locations[0]]);
    }
    
    // Initialize table data from current financial data
    if (currentFinancialData?.data) {
      setCurrentTableData({
        table5: currentFinancialData.data.table5 || [],
        table2: currentFinancialData.data.table2 || [],
        table3: currentFinancialData.data.table3 || [],
        table4: currentFinancialData.data.table4 || [],
        table6: currentFinancialData.data.table6 || [],
        table7: currentFinancialData.data.table7 || [],
        table8: currentFinancialData.data.table8 || [],
        table9: currentFinancialData.data.table9 || [],
        table10: currentFinancialData.data.table10 || [],
        table11: currentFinancialData.data.table11 || [],
        table12: currentFinancialData.data.table12 || [],
        table13: currentFinancialData.data.table13 || [],
        table14: currentFinancialData.data.table14 || [],
        table15: currentFinancialData.data.table15 || [],
        table16: currentFinancialData.data.table16 || []
      });
    }
  }, [locations, currentFinancialData]);

  // Handle filter changes
  const handleLocationChange = (newLocations: string[]) => {
    setSelectedLocations(newLocations);
  };

  const handleDateRangeSelect = (dateRange: any) => {
    setSelectedDateRange(dateRange);
  };

  // Apply filters with backend API call
  const handleApplyFilters = async () => {
    setIsLoading(true);
    setFilterError('');
    
    try {
      // Find the current financial file data
      const currentFile = financialFiles.find(f => f.location === selectedLocations[0]);
      
      if (!currentFile) {
        throw new Error('No financial data found for selected location');
      }

      // Prepare the request payload
      const payload = {
        fileName: currentFile.fileName,
        fileContent: currentFile.fileContent,
        location: selectedLocations[0] || '',
        startDate: selectedDateRange?.startDateStr || null,
        endDate: selectedDateRange?.endDateStr || null,
        dashboard: 'Financials'
      };

      console.log('🚀 Sending financial filter request:', payload);

      // Make API call to financial filter endpoint
      const response = await axios.post(FINANCIAL_FILTER_API_URL, payload);

      console.log('📥 Received financial filter response:', response.data);

      if (response.data) {
        // Update local table data state with all tables
        setCurrentTableData({
          table5: response.data.table5 || [],
          table2: response.data.table2 || [],
          table3: response.data.table3 || [],
          table4: response.data.table4 || [],
          table6: response.data.table6 || [],
          table7: response.data.table7 || [],
          table8: response.data.table8 || [],
          table9: response.data.table9 || [],
          table10: response.data.table10 || [],
          table11: response.data.table11 || [],
          table12: response.data.table12 || [],
          table13: response.data.table13 || [],
          table14: response.data.table14 || [],
          table15: response.data.table15 || [],
          table16: response.data.table16 || []
        });

        // Also update Redux state if needed
        dispatch(setTableData(response.data));

        // Update Redux filters
        dispatch(updateFinancialFilters({ 
          store: selectedLocations[0],
          dateRange: selectedDateRange ? `${selectedDateRange.startDateStr} - ${selectedDateRange.endDateStr}` : ''
        }));

        // Update current location if changed
        if (selectedLocations[0] !== currentFinancialLocation) {
          dispatch(selectFinancialLocation(selectedLocations[0]));
        }
      }

    } catch (err: any) {
      console.error('❌ Financial filter error:', err);
      
      let errorMessage = 'Error applying filters';
      
      if (axios.isAxiosError(err)) {
        if (err.response) {
          const detail = err.response.data?.detail;
          errorMessage = detail || `Server error: ${err.response.status}`;
        } else if (err.request) {
          errorMessage = 'No response from server. Please check if the backend is running.';
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setFilterError(errorMessage);
      dispatch(setError(errorMessage));
      
    } finally {
      setIsLoading(false);
    }
  };

  // Update stats when data changes
  useEffect(() => {
    if (table5Data.length > 0) {
      const metricsMap = extractFinancialMetrics(table5Data);
      
      const keyMetrics = [
        'Net Sales',
        'Orders', 
        'Avg Ticket',
        'Food Cost %',
        'Lbr %',
        'SPMH',
        'LPMH'
      ];

      const newStatsData = keyMetrics.map(metricName => {
        const metricData = metricsMap.get(metricName);
        
        if (!metricData) {
          return {
            label: metricName,
            value: '0',
            bottomChange: '0%',
            bottomLabel: '% Change',
            changeColor: '#666',
            changeDirection: 'up'
          };
        }

        const twLwChange = formatPercentageChange(metricData.twLwChange);
        
        let formattedValue = metricData.thisWeek;
        let bottomLabel = '% Change';
        
        if (metricName === 'Net Sales') {
          formattedValue = formatCurrency(metricData.thisWeek);
        } else if (metricName === 'Avg Ticket' || metricName === 'SPMH' || metricName === 'LPMH') {
          formattedValue = formatCurrency(metricData.thisWeek);
        } else if (metricName.includes('%')) {
          formattedValue = `${parseFloat(metricData.thisWeek).toFixed(2)}%`;
        } else {
          formattedValue = parseInt(metricData.thisWeek).toLocaleString();
        }

        return {
          label: metricName,
          value: formattedValue,
          bottomChange: twLwChange.value,
          bottomLabel: bottomLabel,
          changeColor: twLwChange.isPositive ? '#2e7d32' : '#d32f2f',
          changeDirection: twLwChange.isPositive ? 'up' : 'down'
        };
      });
      
      setStatsData(newStatsData);
    } else {
      // Only show empty state when no data is available - no static fallback data
      setStatsData([]);
    }
  }, [table5Data]);

  // Tab change handler
  const handleTabChange = (event: any, newValue: number) => setTabValue(newValue);

  // Inject rotating animation for loading state
  React.useEffect(() => {
    const styleElement = document.createElement('style');
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

  return (
    <Box sx={{ p: 2, backgroundColor: '#ffffff', minHeight: '100vh' }}>
      {/* Dashboard Title */}
      <Typography 
        variant="h4" 
        component="h1" 
        sx={{ 
          fontWeight: 600,
          color: '#1a237e',
          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
          mb: 3
        }}
      >
        Financial Dashboard
      </Typography>

      {/* Alert for no data */}
      {financialFiles.length === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          No financial data available. Please upload financial files with dashboard type "Financials" first.
        </Alert>
      )}

      {/* Error Alert */}
      {(filterError || error) && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => {
          setFilterError('');
          dispatch(setError(null));
        }}>
          {filterError || error}
        </Alert>
      )}

      {/* Filter Card - Updated with DateRangeSelector */}
      <Card 
        elevation={2} 
        sx={{ 
          mb: 3, 
          borderRadius: 2,
          border: '1px solid #e0e0e0',
          overflow: 'visible'
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Filter Header */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mb: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterListIcon color="primary" />
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 500,
                  color: '#333',
                  fontSize: '1.1rem'
                }}
              >
                Filters
              </Typography>
            </Box>
            
            {/* Apply Filters Button */}
            <Button
              variant="outlined"
              onClick={handleApplyFilters}
              disabled={isLoading || loading}
              startIcon={
                (isLoading || loading) ? (
                  <CircularProgress size={16} />
                ) : (
                  <RefreshIcon />
                )
              }
              sx={{
                borderColor: '#1976d2',
                color: '#1976d2',
                fontWeight: 500,
                height: '30px',
                py: 1,
                px: 1,
                borderRadius: '4px',
                textTransform: 'uppercase',
                fontSize: '0.875rem',
                '&:hover': {
                  borderColor: '#1565c0',
                  backgroundColor: '#f3f7ff',
                }
              }}
            >
              {(isLoading || loading) ? 'Loading...' : 'APPLY FILTERS'}
            </Button>
          </Box>

          {/* Filter Inputs Row - Updated with DateRangeSelector */}
          <Grid container spacing={3} sx={{ mb: 2 }}>
            {/* Location Filter */}
            <Grid item xs={12} md={6}>
              <MultiSelectFilter
                id="location-filter"
                label="Location"
                value={selectedLocations}
                options={locations}
                onChange={handleLocationChange}
                placeholder="Multiple Loc..."
                icon={<PlaceIcon />}
              />
            </Grid>

            {/* Date Range Filter - Updated to use DateRangeSelector */}
            <Grid item xs={12} md={6}>
              <DateRangeSelectorComponent
                label="Date Range"
                onDateRangeSelect={handleDateRangeSelect}
              />
            </Grid>
          </Grid>

          {/* Active Filters Pills */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {selectedLocations.length > 0 && (
              <Chip
                icon={<PlaceIcon sx={{ fontSize: '1rem' }} />}
                label={selectedLocations.length === 1 
                  ? `Location: ${selectedLocations[0]}` 
                  : `Location: Multiple Locations`
                }
                onDelete={() => setSelectedLocations([])}
                color="primary"
                variant="outlined"
                deleteIcon={<CloseIcon sx={{ fontSize: '1rem' }} />}
                sx={{
                  borderRadius: '20px',
                  height: '32px',
                  fontSize: '0.875rem',
                  '& .MuiChip-icon': {
                    fontSize: '1rem'
                  }
                }}
              />
            )}
            
            {selectedDateRange && (
              <Chip
                icon={<CalendarTodayIcon sx={{ fontSize: '1rem' }} />}
                label={`Date Range: ${selectedDateRange.startDate.toLocaleDateString()} - ${selectedDateRange.endDate.toLocaleDateString()}`}
                onDelete={() => setSelectedDateRange(null)}
                sx={{
                  borderRadius: '20px',
                  height: '32px',
                  fontSize: '0.875rem',
                  backgroundColor: '#e8d5f2',
                  color: '#7b1fa2',
                  border: '1px solid #ce93d8',
                  '& .MuiChip-icon': {
                    color: '#7b1fa2',
                    fontSize: '1rem'
                  },
                  '& .MuiChip-deleteIcon': {
                    color: '#7b1fa2',
                    fontSize: '1rem'
                  }
                }}
                deleteIcon={<CloseIcon sx={{ fontSize: '1rem' }} />}
              />
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Show current data info */}
      {currentFinancialData && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Data loaded:</strong> {currentFinancialData.fileName} | 
            <strong> Location:</strong> {currentFinancialLocation} | 
            <strong> Metrics:</strong> {table5Data.length} available
            {selectedDateRange && (
              <>
                {' | '}
                <strong> Date Range:</strong> {selectedDateRange.startDate.toLocaleDateString()} - {selectedDateRange.endDate.toLocaleDateString()}
              </>
            )}
          </Typography>
        </Alert>
      )}

      {/* Week-Over-Week Analysis Card - REDUCED HEIGHT */}
      <Card 
        elevation={3} 
        sx={{ 
          borderRadius: 2,
          mb: 3
        }}
      >
        <CardContent sx={{ py: 1.5, px: 3 }}> {/* Reduced padding from py: 2 to py: 1.5 */}
          <Typography 
            variant="h5" 
            align="center" 
            sx={{ 
              fontWeight: 500,
              mb: 1.5, // Reduced margin from mb: 2 to mb: 1.5
              color: '#1565c0'
            }}
          >
            Week-Over-Week Analysis
          </Typography>
          
          {/* Loading State */}
          {(isLoading || loading) && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
              <CircularProgress size={40} />
              <Typography sx={{ ml: 2 }}>Loading financial data...</Typography>
            </Box>
          )}
          
          {/* Stats Grid - Two Rows - REDUCED SPACING */}
          {!isLoading && !loading && (
            <>
              {statsData.length > 0 ? (
                <Grid container spacing={1}> {/* Reduced spacing from 1.5 to 1 */}
                  {/* First Row - 4 items */}
                  {statsData.slice(0, 4).map((stat, index) => (
                    <Grid item xs={6} sm={3} key={index}>
                      <Card 
                        elevation={1} 
                        sx={{ 
                          p: 1, // Reduced padding from p: 1.5 to p: 1
                          textAlign: 'center',
                          height: '100%',
                          backgroundColor: '#ffffff',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: 3,
                          }
                        }}
                      >
                        <Typography 
                          sx={{ 
                            color: '#1976d2', 
                            fontWeight: 500,
                            fontSize: '0.75rem', // Reduced font size
                            mb: 0.25 // Reduced margin
                          }}
                        >
                          {stat.label}
                        </Typography>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 600,
                            color: '#263238',
                            mb: 0.25, // Reduced margin
                            fontSize: '1.1rem' // Reduced font size
                          }}
                        >
                          {stat.value}
                        </Typography>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          mb: 0.25,
                          gap: 0.5
                        }}>
                          {stat.changeDirection && (
                            <span style={{ 
                              color: stat.changeColor, 
                              fontSize: '10px', // Reduced font size
                              fontWeight: 'bold'
                            }}>
                              {stat.changeDirection === 'up' ? '▲' : '▼'}
                            </span>
                          )}
                          <Typography 
                            sx={{ 
                              color: stat.changeColor || '#1976d2',
                              fontSize: '0.75rem', // Reduced font size
                              fontWeight: 500
                            }}
                          >
                            {stat.bottomChange}
                          </Typography>
                        </Box>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#757575',
                            fontSize: '0.65rem' // Reduced font size
                          }}
                        >
                          {stat.bottomLabel}
                        </Typography>
                      </Card>
                    </Grid>
                  ))}
                  
                  {/* Second Row - 3 items centered */}
                  <Grid item xs={12}>
                    <Grid container spacing={1} justifyContent="center"> {/* Reduced spacing */}
                      {statsData.slice(4, 7).map((stat, index) => (
                        <Grid item xs={6} sm={4} key={index + 4}>
                          <Card 
                            elevation={1} 
                            sx={{ 
                              p: 1, // Reduced padding
                              textAlign: 'center',
                              height: '100%',
                              backgroundColor: '#ffffff',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: 3,
                              }
                            }}
                          >
                            <Typography 
                              sx={{ 
                                color: '#1976d2', 
                                fontWeight: 500,
                                fontSize: '0.75rem', // Reduced font size
                                mb: 0.25
                              }}
                            >
                              {stat.label}
                            </Typography>
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                fontWeight: 600,
                                color: '#263238',
                                mb: 0.25,
                                fontSize: '1.1rem' // Reduced font size
                              }}
                            >
                              {stat.value}
                            </Typography>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              mb: 0.25,
                              gap: 0.5
                            }}>
                              {stat.changeDirection && (
                                <span style={{ 
                                  color: stat.changeColor, 
                                  fontSize: '10px', // Reduced font size
                                  fontWeight: 'bold'
                                }}>
                                  {stat.changeDirection === 'up' ? '▲' : '▼'}
                                </span>
                              )}
                              <Typography 
                                sx={{ 
                                  color: stat.changeColor || '#1976d2',
                                  fontSize: '0.75rem', // Reduced font size
                                  fontWeight: 500
                                }}
                              >
                                {stat.bottomChange}
                              </Typography>
                            </Box>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: '#757575',
                                fontSize: '0.65rem' // Reduced font size
                              }}
                            >
                              {stat.bottomLabel}
                            </Typography>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>
                </Grid>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  py: 4,
                  color: '#666'
                }}>
                  <Typography variant="body1">
                    No financial metrics available. Please upload data and apply filters.
                  </Typography>
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Tabs - Updated with new Comprehensive Dashboard tab */}
      <Card sx={{ borderRadius: 2 }} elevation={3}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="fullWidth"
          sx={{ 
            '& .MuiTab-root': { 
              fontWeight: 500,
              textTransform: 'none',
              fontSize: '1rem',
              py: 2
            },
            borderBottom: '2px solid #e0e0e0',
            backgroundColor: '#fafafa'
          }}
        >
          <Tab label="Dashboard" />
          <Tab label="Detailed Analysis" />
          <Tab label="Comprehensive View" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 3 }}>
            <FinancialTable data={table5Data} />
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3 }}>
            <DayOfWeekAnalysis 
              salesData={table2Data}
              ordersData={table3Data} 
              avgTicketData={table4Data}
            />
            
            {currentFinancialData && (table2Data.length > 0 || table3Data.length > 0 || table4Data.length > 0) && (
              <Box sx={{ mt: 4 }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    mb: 3,
                    textAlign: 'center',
                    fontWeight: 600,
                    color: '#424242'
                  }}
                >
                  Day of Week Trends
                </Typography>
                
                {table2Data.length > 0 && (
                  <Box sx={{ mb: 4 }}>
                    <SalesChart data={table2Data} />
                  </Box>
                )}
                
                {table3Data.length > 0 && (
                  <Box sx={{ mb: 4 }}>
                    <OrdersChart data={table3Data} />
                  </Box>
                )}
                
                {table4Data.length > 0 && (
                  <Box>
                    <AvgTicketChart data={table4Data} />
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </TabPanel>

        {/* NEW: Comprehensive Financial Dashboard Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box>
            <ComprehensiveFinancialDashboard financialData={currentTableData} />
          </Box>
        </TabPanel>
      </Card>
    </Box>
  );
}

export default Financials;
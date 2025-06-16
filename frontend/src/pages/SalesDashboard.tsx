// Custom theme for Nivo charts to fix label cutoff
const getChartTheme = () => {
  return {
    axis: {
      ticks: {
        text: {
          fontSize: 14,
          fontWeight: 'bold'
        }
      },
      legend: {
        text: {
          fontSize: 14,
          fontWeight: 'bold'
        }
      }
    },
    labels: {
      text: {
        fontSize: 12,
        fontWeight: 'bold'
      }
    },
    legends: {
      text: {
        fontSize: 14
      }
    },
    tooltip: {
      container: {
        fontSize: 14
      }
    }
  };
};

// Function to get tailored chart margins based on chart type
const getChartMargins = (chartType: string) => {
  const margins = { top: 50, right: 50, bottom: 80, left: 60 };
  
  switch(chartType) {
    case 'laborHrs':
    case 'laborCost':
    case 'cogs':
      return { top: 50, right: 50, bottom: 80, left: 80 };
    case 'salesPercentage':
    case 'avgTicket':
      return { top: 50, right: 50, bottom: 100, left: 60 };
    default:
      return margins;
  }
};

// NIVO Chart function for Labor charts
const createNivoChart = (
  data: any[], 
  keys: string[], 
  colors: string[], 
  chartType: string,
  labelFormat: (value: number) => string,
  isStacked: boolean = false
) => {
  if (!data || data.length === 0) {
    return (
      <Box sx={{ 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'text.secondary'
      }}>
        <Typography>No data available</Typography>
      </Box>
    );
  }

  const margins = getChartMargins(chartType);
  
  return (
    <Box sx={{ height: '100%', width: '100%', overflow: 'visible' }}>
      <ResponsiveBar
        data={data}
        keys={keys}
        indexBy="store"
        margin={margins}
        padding={0.25}
        groupMode={isStacked ? 'stacked' : 'grouped'}
        valueScale={{ type: 'linear' }}
        indexScale={{ type: 'band', round: true }}
        colors={colors}
        theme={getChartTheme()}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legendPosition: 'middle',
          legendOffset: 42,
          truncateTickAt: 0
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legendPosition: 'middle',
          legendOffset: -50,
          format: (value) => {
            if (chartType === 'laborHrs' || chartType === 'laborCost' || chartType === 'cogs') {
              return `${(value / 1000).toFixed(0)}k`;
            }
            if (chartType.includes('Percentage')) {
              return `${value}%`;
            }
            return `${value}`;
          }
        }}
        labelSkipWidth={16}
        labelSkipHeight={16}
        labelTextColor="#ffffff"
        legends={[
          {
            dataFrom: 'keys',
            anchor: 'top',
            direction: 'row',
            justify: false,
            translateX: 0,
            translateY: -35,
            itemsSpacing: 8,
            itemWidth: 100,
            itemHeight: 20,
            itemDirection: 'left-to-right',
            itemOpacity: 0.85,
            symbolSize: 18
          }
        ]}
        valueFormat={labelFormat}
        enableGridY={true}
        animate={true}
      />
    </Box>
  );
};// Updated SalesDashboard.tsx with proper data formatting for FinancialTablesComponent
import React, { useState, useEffect } from 'react';
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
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  TextField,
  Divider,
  Popover,
  MenuList,
  Checkbox,
  ListItemText
} from '@mui/material';
import axios from 'axios';

// For charts - UPDATED TO USE BOTH RECHARTS AND NIVO
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { ResponsiveBar } from '@nivo/bar';

// Icons
import FilterListIcon from '@mui/icons-material/FilterList';
import PlaceIcon from '@mui/icons-material/Place';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import BarChartIcon from '@mui/icons-material/BarChart';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';

// Components
import FinancialTablesComponent from '../components/FinancialTablesComponent';
import DateRangeSelector from '../components/DateRangeSelector';

// Import Redux hooks and actions
import { useAppDispatch, useAppSelector } from '../typedHooks';
import { 
  selectSalesWideLocation, 
  updateSalesWideFilters,
  setTableData,
  setLoading,
  setError
} from '../store/excelSlice';
import { API_URL_Local } from '../constants';



// API URL for Sales Wide filter
// const SALES_WIDE_FILTER_API_URL = 'http://localhost:8000/api/companywide/filter';

const SALES_WIDE_FILTER_API_URL = `${API_URL_Local}/api/companywide/filter`;

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
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
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

// Enhanced Date Range Selector Component - Fixed Modal with Button Trigger
interface DateRangeSelectorComponentProps {
  onDateRangeSelect: (dateRange: any) => void;
}

const DateRangeSelectorComponent: React.FC<DateRangeSelectorComponentProps> = ({
  onDateRangeSelect
}) => {
  const [open, setOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<string>('');
  const [tempRange, setTempRange] = useState<any>(null);

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setTempRange(null);
  };

  const handleTempDateRangeSelect = (range: any) => {
    setTempRange(range);
  };

  const handleSetDateRange = () => {
    if (tempRange) {
      // Format the display text  
      const startDate = tempRange.startDate.toLocaleDateString();
      const endDate = tempRange.endDate.toLocaleDateString();
      setSelectedRange(`${startDate} - ${endDate}`);
      
      // Pass the range to parent
      onDateRangeSelect(tempRange);
    }
    
    // Close the modal
    handleClose();
  };

  const handleCancel = () => {
    setTempRange(null);
    handleClose();
  };

  const handleClear = (event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedRange('');
    onDateRangeSelect(null);
  };

  return (
    <>
      {/* Date Range Selector Button */}
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
          Date Range
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
              color: selectedRange ? '#333' : '#999',
              fontSize: '0.95rem'
            }}
          >
            {selectedRange || 'Select date range'}
          </Typography>
          
          {selectedRange && (
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
      </Box>

      {/* Fixed Modal Dialog - Made even bigger with buttons at bottom right */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth={false}
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: 'visible',
            width: '1200px',
            height: '700px',
            maxWidth: '95vw',
            maxHeight: '95vh'
          }
        }}
        sx={{
          '& .MuiDialog-container': {
            alignItems: 'center',
            justifyContent: 'center',
            padding: 2
          },
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
          }
        }}
      >
        <Box sx={{ 
          p: 4, 
          width: '100%', 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Select Date Range
          </Typography>
          
          {/* Container for DateRangeSelector with more space */}
          <Box sx={{ 
            flexGrow: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '500px',
            mb: 3,
            overflow: 'auto'
          }}>
            <DateRangeSelector onSelect={handleTempDateRangeSelect} />
          </Box>
          
          {/* Action Buttons - Moved to bottom right */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            pt: 2, 
            borderTop: '1px solid #e0e0e0',
            gap: 2,
            flexShrink: 0
          }}>
            <Button
              variant="outlined"
              onClick={handleCancel}
              sx={{
                borderColor: '#e0e0e0',
                color: '#666',
                minWidth: '100px',
                textTransform: 'uppercase',
                py: 1.5,
                px: 3,
                '&:hover': {
                  borderColor: '#999',
                  backgroundColor: '#f5f5f5',
                }
              }}
            >
              CANCEL
            </Button>
            <Button
              variant="contained"
              onClick={handleSetDateRange}
              disabled={!tempRange}
              sx={{
                backgroundColor: '#1976d2',
                minWidth: '160px',
                textTransform: 'uppercase',
                py: 1.5,
                px: 3,
                '&:hover': {
                  backgroundColor: '#1565c0',
                },
                '&:disabled': {
                  backgroundColor: '#ccc'
                }
              }}
            >
              SET DATE RANGE
            </Button>
          </Box>
        </Box>
      </Dialog>
    </>
  );
};

// Chart Base Component with improved layout to prevent text cutoff
interface BaseChartProps {
  title: string;
  children: React.ReactNode;
  height?: number | string;
}

const BaseChart: React.FC<BaseChartProps> = ({ title, children, height = 450 }) => {
  const theme = useTheme();
  
  return (
    <Card 
      elevation={2} 
      sx={{ 
        borderRadius: 1, 
        overflow: 'hidden',
        mb: 3,
        height: height
      }}
    >
      <Box sx={{ p: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="h6" sx={{ fontWeight: 500 }}>
          {title}
        </Typography>
      </Box>
      <Box sx={{ height: 'calc(100% - 60px)', position: 'relative' }}>
        {children}
      </Box>
    </Card>
  );
};

// UPDATED: Custom Tooltip Component for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: 1,
        padding: 1.5,
        boxShadow: 2
      }}>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
          {label}
        </Typography>
        {payload.map((entry: any, index: number) => (
          <Typography
            key={index}
            variant="body2"
            sx={{ color: entry.color, display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <Box
              sx={{
                width: 12,
                height: 12,
                backgroundColor: entry.color,
                borderRadius: 0.5
              }}
            />
            {entry.dataKey}: {entry.value.toFixed(2)}%
          </Typography>
        ))}
        
        {/* For single bar charts, show both Tw vs. Lw and Tw vs. Ly values */}
        {payload.length === 1 && payload[0].payload && (
          <>
            {payload[0].payload['Tw vs. Lw'] !== undefined && (
              <Typography
                variant="body2"
                sx={{ color: '#4285f4', display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}
              >
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    backgroundColor: '#4285f4',
                    borderRadius: 0.5
                  }}
                />
                Tw vs. Lw: {payload[0].payload['Tw vs. Lw'].toFixed(2)}%
              </Typography>
            )}
            {payload[0].payload['Tw vs. Ly'] !== undefined && payload[0].dataKey !== 'Tw vs. Ly' && (
              <Typography
                variant="body2"
                sx={{ color: '#ea4335', display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    backgroundColor: '#ea4335',
                    borderRadius: 0.5
                  }}
                />
                Tw vs. Ly: {payload[0].payload['Tw vs. Ly'].toFixed(2)}%
              </Typography>
            )}
          </>
        )}
      </Box>
    );
  }
  return null;
};

// Main Component
export default function SalesDashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useAppDispatch();

  // Get data from Redux store
  const {
    salesWideFiles,
    salesWideLocations,
    currentSalesWideLocation,
    salesWideFilters,
    loading,
    error
  } = useAppSelector((state) => state.excel);

  // Find current data for the selected location
  const currentSalesWideData = salesWideFiles.find(f => f.location === currentSalesWideLocation)?.data;

  // State variables
  const [tabValue, setTabValue] = useState(0);
  const [chartTab, setChartTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [filterError, setFilterError] = useState<string>('');
  
  // Filter states
  const [selectedLocations, setSelectedLocations] = useState<string[]>([currentSalesWideLocation || '']);
  const [selectedDateRange, setSelectedDateRange] = useState<any>(null);
  
  // Current table data from local state that gets updated from API calls
  const [currentTableData, setCurrentTableData] = useState<any>({
    table1: [],
    table2: [],
    table3: [],
    table4: [],
    table5: [],
    table6: [],
    table7: []
  });

  // Extract data arrays from backend response or use defaults
  const locations = currentSalesWideData?.locations || salesWideLocations || ['Midtown East', 'Downtown West', 'Uptown North', 'Southside'];

  // Initialize local state with current data
  useEffect(() => {
    if (currentSalesWideData) {
      setCurrentTableData({
        table1: currentSalesWideData.table1 || [],
        table2: currentSalesWideData.table2 || [],
        table3: currentSalesWideData.table3 || [],
        table4: currentSalesWideData.table4 || [],
        table5: currentSalesWideData.table5 || [],
        table6: currentSalesWideData.table6 || [],
        table7: currentSalesWideData.table7 || []
      });
    }
  }, [currentSalesWideData]);

  // Initialize selected locations
  useEffect(() => {
    if (locations.length > 0 && selectedLocations.length === 0) {
      setSelectedLocations([locations[0]]);
    }
  }, [locations, selectedLocations]);

  // Apply filters with backend API call
  const handleApplyFilters = async () => {
    setIsLoading(true);
    setFilterError('');
    
    try {
      // Find the current sales wide file data - check all selected locations
      let currentFile = null;
      
      // If multiple locations selected, find the first file that matches any of them
      for (const location of selectedLocations) {
        currentFile = salesWideFiles.find(f => f.location === location);
        if (currentFile) break;
      }
      
      // If no file found in selected locations, try current location
      if (!currentFile) {
        currentFile = salesWideFiles.find(f => f.location === currentSalesWideLocation);
      }
      
      if (!currentFile) {
        throw new Error('No Sales Wide data found for selected location(s)');
      }

      // Prepare the request payload with multiple locations
      const payload = {
        fileName: currentFile.fileName,
        fileContent: currentFile.fileContent,
        // Send all selected locations, not just the first one
        locations: selectedLocations.length > 0 ? selectedLocations : [currentFile.location],
        // Keep single location for backward compatibility
        location: selectedLocations.length > 0 ? selectedLocations[0] : currentFile.location,
        startDate: selectedDateRange?.startDateStr || null,
        endDate: selectedDateRange?.endDateStr || null,
        dashboard: 'Sales Wide'
      };

      console.log('🚀 Sending Sales Wide filter request:', payload);

      // Make API call to sales wide filter endpoint
      const response = await axios.post(SALES_WIDE_FILTER_API_URL, payload);

      console.log('📥 Received Sales Wide filter response:', response.data);

      if (response.data) {
        // Update local table data state
        setCurrentTableData({
          table1: response.data.table1 || [],
          table2: response.data.table2 || [],
          table3: response.data.table3 || [],
          table4: response.data.table4 || [],
          table5: response.data.table5 || [],
          table6: response.data.table6 || [],
          table7: response.data.table7 || []
        });

        // Also update Redux state if needed
        dispatch(setTableData(response.data));

        // Update Redux filters
        dispatch(updateSalesWideFilters({ 
          location: selectedLocations.join(','), // Store all locations as comma-separated string
          dateRange: selectedDateRange ? `${selectedDateRange.startDateStr} - ${selectedDateRange.endDateStr}` : ''
        }));

        // Update current location if changed (use first selected location)
        if (selectedLocations.length > 0 && selectedLocations[0] !== currentSalesWideLocation) {
          dispatch(selectSalesWideLocation(selectedLocations[0]));
        }
      }

    } catch (err: any) {
      console.error('❌ Sales Wide filter error:', err);
      
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

  // Handlers for filter changes
  const handleLocationChange = (newLocations: string[]) => {
    setSelectedLocations(newLocations);
  };

  const handleDateRangeSelect = (dateRange: any) => {
    setSelectedDateRange(dateRange);
  };

  // Process backend data for charts
  const processTableDataForCharts = (tableData: any[], keys: string[]) => {
    if (!tableData || tableData.length === 0) return [];
    
    return tableData
      .filter(row => row.Store !== 'Grand Total') // Exclude grand total from charts
      .map(row => {
        const processedRow: any = { store: row.Store };
        keys.forEach(key => {
          processedRow[key] = row[key] || 0;
        });
        return processedRow;
      });
  };

  // Chart data from local table data
  const salesData = processTableDataForCharts(
    currentTableData.table1 || [], 
    ['Tw vs. Lw', 'Tw vs. Ly']
  );

  const ordersData = processTableDataForCharts(
    currentTableData.table2 || [], 
    ['Tw vs. Lw', 'Tw vs. Ly']
  );

  const avgTicketData = processTableDataForCharts(
    currentTableData.table3 || [], 
    ['Tw vs. Lw', 'Tw vs. Ly']
  );

  const laborHrsData = processTableDataForCharts(
    currentTableData.table6 || [], 
    ['Tw Lb Hrs', 'Lw Lb Hrs']
  );

  const spmhData = processTableDataForCharts(
    currentTableData.table7 || [], 
    ['Tw SPMH', 'Lw SPMH']
  );

  const laborCostData = processTableDataForCharts(
    currentTableData.table5 || [], 
    ['Tw Reg Pay', 'Lw Reg Pay']
  );

  const laborPercentageData = processTableDataForCharts(
    currentTableData.table5 || [], 
    ['Tw Lc %', 'Lw Lc %']
  );

  const cogsData = processTableDataForCharts(
    currentTableData.table4 || [], 
    ['Tw COGS', 'Lw COGS']
  );

  const cogsPercentageData = processTableDataForCharts(
    currentTableData.table4 || [], 
    ['Tw Fc %', 'Lw Fc %']
  );

  // UPDATED: Create properly formatted financial tables data for FinancialTablesComponent
  const financialTablesData = React.useMemo(() => {
    console.log('🔄 Creating financial tables data from currentTableData:', currentTableData);
    console.log('salesData:-----', salesData);
    // Return the data in the exact format expected by FinancialTablesComponent
    const formattedData = {
      table1: currentTableData.table1 || [], // Sales Performance
      table2: currentTableData.table2 || [], // Order Volume  
      table3: currentTableData.table3 || [], // Average Ticket
      table4: currentTableData.table4 || [], // Cost of Goods Sold
      table5: currentTableData.table5 || [], // Regular Pay (Labor)
      table6: currentTableData.table6 || [], // Labor Hours
      table7: currentTableData.table7 || []  // Sales per Man Hour
    };
    
    console.log('✅ Formatted financial tables data:', formattedData);
    return formattedData;
  }, [currentTableData]);

  // Handle main tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle chart tab change
  const handleChartTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setChartTab(newValue);
  };

  // Format values for charts
  const formatPercentage = (value: number) => `${value.toFixed(2)}%`;
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString(undefined, { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // UPDATED: Function to create charts (Recharts for some, Nivo for others)
  const createNivoBarChart = (
    data: any[], 
    keys: string[], 
    colors: string[], 
    chartType: string,
    labelFormat: (value: number) => string = formatPercentage,
    enableLabels: boolean = false,
    customLabelFormat?: (d: any) => string
  ) => {
    console.log('🎯 createNivoBarChart called with:', chartType);
    
    if (!data || data.length === 0) {
      return (
        <Box sx={{ 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: 'text.secondary'
        }}>
          <Typography>No data available</Typography>
        </Box>
      );
    }

    // Sales/Orders/Avg Ticket: Use Recharts with single bars
    const isSingleBarChart = chartType === 'salesPercentage' || chartType === 'ordersPercentage' || chartType === 'avgTicket';
    
    if (isSingleBarChart) {
      const primaryKey = keys[1] || keys[0]; // Use "Tw vs. Ly" as primary
      
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
            barCategoryGap="25%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="store" 
              tick={{ fontSize: 12, fontWeight: 'bold' }}
              height={60}
              interval={0}
            />
            <YAxis 
              tick={{ fontSize: 12, fontWeight: 'bold' }}
              tickFormatter={labelFormat}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '14px', fontWeight: 'bold' }} />
            
            <Bar
              dataKey={primaryKey}
              fill={colors[1] || colors[0] || '#ea4335'}
              name={`${chartType === 'salesPercentage' ? 'Sales' : chartType === 'ordersPercentage' ? 'Orders' : 'Avg Ticket'} Performance`}
              radius={[2, 2, 0, 0]}
              maxBarSize={80}
            />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    // Labor $ Spent, Labor %, Labor Hrs, SPMH, COGS $, COGS %: Use Nivo with STACKED bars
    const isStackedChart = chartType === 'laborCost' || chartType === 'laborPercentage' || 
                          chartType === 'laborHrs' || chartType === 'spmh' || 
                          chartType === 'cogs' || chartType === 'cogsPercentage';
    
    if (isStackedChart) {
      return createNivoChart(data, keys, colors, chartType, labelFormat, true); // true = stacked
    }

    // Any remaining charts: Use Nivo with GROUPED bars (fallback)
    return createNivoChart(data, keys, colors, chartType, labelFormat, false); // false = grouped
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Dashboard Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
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
            Companywide Sales Dashboard 
            </h1>
          </div>
  

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Help">
            <IconButton 
              color="info" 
              sx={{ backgroundColor: 'white', boxShadow: 1 }}
            >
              <HelpOutlineIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Alert message when no data is available */}
      {!currentSalesWideData && (
        <Card sx={{ mb: 3, p: 3, borderRadius: 2 }}>
          <Typography variant="h6" color="error" gutterBottom>
            No Sales Wide data available
          </Typography>
          <Typography variant="body1">
            Please upload files with "Sales Wide" dashboard type from the Excel Upload page.
          </Typography>
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

      {/* Error Alert */}
      {(filterError || error) && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => {
          setFilterError('');
          dispatch(setError(null));
        }}>
          {filterError || error}
        </Alert>
      )}

      {/* Filters Section */}
      <Card elevation={3} sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <FilterListIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              Filters
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* Location filter - Using MultiSelectFilter to match design */}
            <Grid item xs={12} sm={6}>
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

            {/* Date Range filter */}
            <Grid item xs={12} sm={6}>
              <DateRangeSelectorComponent
                onDateRangeSelect={handleDateRangeSelect}
              />
            </Grid>
          </Grid>

          {/* Active filters and Apply button */}
          <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Active filter chips */}
            {(selectedLocations.length > 0 || selectedDateRange) && (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Active Filters:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {selectedLocations.length > 0 && (
                    <Chip 
                      label={selectedLocations.length === 1 
                        ? `Location: ${selectedLocations[0]}` 
                        : `Location: Multiple Locations`
                      }
                      onDelete={() => setSelectedLocations([])}
                      sx={{
                        backgroundColor: '#e3f2fd',
                        color: '#1976d2',
                        border: '1px solid #90caf9',
                        borderRadius: '20px',
                        height: '32px',
                        fontSize: '0.875rem',
                        '& .MuiChip-icon': {
                          color: '#1976d2',
                        },
                        '& .MuiChip-deleteIcon': {
                          color: '#1976d2',
                          fontSize: '18px'
                        }
                      }}
                      deleteIcon={<CloseIcon />}
                    />
                  )}
                  
                  {selectedDateRange && (
                    <Chip
                      label={`Date Range: ${selectedDateRange.startDate.toLocaleDateString()} - ${selectedDateRange.endDate.toLocaleDateString()}`}
                      onDelete={() => setSelectedDateRange(null)}
                      sx={{
                        backgroundColor: '#e8d5f2',
                        color: '#7b1fa2',
                        border: '1px solid #ce93d8',
                        borderRadius: '20px',
                        height: '32px',
                        fontSize: '0.875rem',
                        '& .MuiChip-icon': {
                          color: '#7b1fa2',
                        },
                        '& .MuiChip-deleteIcon': {
                          color: '#7b1fa2',
                          fontSize: '18px'
                        }
                      }}
                      deleteIcon={<CloseIcon />}
                    />
                  )}
                </Box>
              </>
            )}

            {/* Apply Filters Button - positioned at bottom left */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
              <Button
                variant="contained"
                onClick={handleApplyFilters}
                disabled={isLoading || loading}
                startIcon={
                  (isLoading || loading) ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : null
                }
                sx={{
                  backgroundColor: '#1976d2',
                  color: 'white',
                  fontWeight: 600,
                  py: 1.5,
                  px: 4,
                  borderRadius: '8px',
                  textTransform: 'uppercase',
                  fontSize: '0.875rem',
                  minWidth: '160px',
                  '&:hover': {
                    backgroundColor: '#1565c0',
                  },
                  '&:disabled': {
                    backgroundColor: '#ccc',
                    color: '#666'
                  }
                }}
              >
                {(isLoading || loading) ? 'Loading...' : 'APPLY FILTERS'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Only render dashboard content if data is available */}
      {currentSalesWideData && (
        <>
          {/* Tabs - Styled to match Image 2 */}
          <Card sx={{ borderRadius: 2, mb: 3, overflow: 'hidden' }} elevation={3}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': { 
                  fontWeight: 500,
                  textTransform: 'none',
                  fontSize: '1rem',
                  py: 1.5
                },
                '& .Mui-selected': {
                  color: '#4285f4',
                  fontWeight: 600
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#4285f4',
                  height: 3
                }
              }}
            >
              <Tab label="Tables" />
              <Tab label="Graphs" />
            </Tabs>
  
            {/* Financial Dashboard Tab - UPDATED to pass real backend data */}
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
                {/* UPDATED: Pass the formatted backend data to FinancialTablesComponent */}
                <FinancialTablesComponent financialTables={financialTablesData} />
              </Box>
            </TabPanel>
  
            {/* Day of Week Analysis Tab */}
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
                {/* Chart Tabs */}
                <Tabs
                  value={chartTab}
                  onChange={handleChartTabChange}
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
                  <Tab label="All Charts" />
                  <Tab label="Sales" />
                  <Tab label="Orders" />
                  <Tab label="Avg Ticket" />
                  <Tab label="Labor" />
                  <Tab label="COGS" />
                </Tabs>
                
                {/* All Charts Panel */}
                <TabPanel value={chartTab} index={0}>
                  <Grid container spacing={3}>
                    {/* Sales Chart - Full width */}
                    <Grid item xs={12}>
                      <BaseChart title="Sales">
                        {createNivoBarChart(
                          salesData,
                          ['Tw vs. Lw', 'Tw vs. Ly'],
                          ['#4285f4', '#ea4335'],
                          'salesPercentage'
                        )}
                      </BaseChart>
                    </Grid>
                    
                    {/* Orders Chart - Full width */}
                    <Grid item xs={12}>
                      <BaseChart title="Orders">
                        {createNivoBarChart(
                          ordersData,
                          ['Tw vs. Lw', 'Tw vs. Ly'],
                          ['#4285f4', '#ea4335'],
                          'ordersPercentage',
                          formatPercentage,
                          false
                        )}
                      </BaseChart>
                    </Grid>
                    
                    {/* Average Ticket Chart - Full width */}
                    <Grid item xs={12}>
                      <BaseChart title="Avg Ticket">
                        {createNivoBarChart(
                          avgTicketData,
                          ['Tw vs. Lw', 'Tw vs. Ly'],
                          ['#4285f4', '#ea4335'],
                          'avgTicket',
                          formatPercentage,
                          false
                        )}
                      </BaseChart>
                    </Grid>
                    
                    {/* Labor Hours Chart - Full width */}
                    <Grid item xs={12}>
                      <BaseChart title="Labor Hrs">
                        {createNivoBarChart(
                          laborHrsData,
                          ['Tw Lb Hrs', 'Lw Lb Hrs'],
                          ['#000000', '#8bc34a'],
                          'laborHrs',
                          value => value.toFixed(2),
                          true,
                          d => d.data[`${d.id}`].toFixed(2)
                        )}
                      </BaseChart>
                    </Grid>
                    
                    {/* SPMH Chart - Full width */}
                    <Grid item xs={12}>
                      <BaseChart title="SPMH">
                        {createNivoBarChart(
                          spmhData,
                          ['Tw SPMH', 'Lw SPMH'],
                          ['#000000', '#8bc34a'],
                          'spmh',
                          value => value.toFixed(2),
                          true,
                          d => d.data[`${d.id}`].toFixed(2)
                        )}
                      </BaseChart>
                    </Grid>
                    
                    {/* Labor Cost Chart - Full width */}
                    <Grid item xs={12}>
                      <BaseChart title="Labor $ Spent">
                        {createNivoBarChart(
                          laborCostData,
                          ['Tw Reg Pay', 'Lw Reg Pay'],
                          ['#4285f4', '#ea4335'],
                          'laborCost',
                          formatCurrency,
                          true,
                          d => `${Math.floor(d.value / 1000)}k`
                        )}
                      </BaseChart>
                    </Grid>
                    
                    {/* Labor Percentage Chart - Full width */}
                    <Grid item xs={12}>
                      <BaseChart title="Labor %">
                        {createNivoBarChart(
                          laborPercentageData,
                          ['Tw Lc %', 'Lw Lc %'],
                          ['#4285f4', '#ea4335'],
                          'laborPercentage',
                          formatPercentage,
                          true,
                          d => `${d.value.toFixed(2)}%`
                        )}
                      </BaseChart>
                    </Grid>
                    
                    {/* COGS Chart - Full width */}
                    <Grid item xs={12}>
                      <BaseChart title="COGS $">
                        {createNivoBarChart(
                          cogsData,
                          ['Tw COGS', 'Lw COGS'],
                          ['#9c27b0', '#e57373'],
                          'cogs',
                          formatCurrency,
                          true,
                          d => `${Math.floor(d.value / 1000)}k`
                        )}
                      </BaseChart>
                    </Grid>
                    
                    {/* COGS Percentage Chart - Full width */}
                    <Grid item xs={12}>
                      <BaseChart title="COGS %">
                        {createNivoBarChart(
                          cogsPercentageData,
                          ['Tw Fc %', 'Lw Fc %'],
                          ['#9c27b0', '#e57373'],
                          'cogsPercentage',
                          formatPercentage,
                          true,
                          d => `${d.value.toFixed(2)}%`
                        )}
                      </BaseChart>
                    </Grid>
                  </Grid>
                </TabPanel>
                
               {/* Sales Panel */}
                <TabPanel value={chartTab} index={1}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <BaseChart title="Sales">
                        {createNivoBarChart(
                          salesData,
                          ['Tw vs. Lw', 'Tw vs. Ly'],
                          ['#4285f4', '#ea4335'],
                          'salesPercentage',
                          formatPercentage,
                          false
                        )}
                      </BaseChart>
                    </Grid>
                  </Grid>
                </TabPanel>
                
                {/* Orders Panel */}
                <TabPanel value={chartTab} index={2}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <BaseChart title="Orders">
                        {createNivoBarChart(
                          ordersData,
                          ['Tw vs. Lw', 'Tw vs. Ly'],
                          ['#4285f4', '#ea4335'],
                          'ordersPercentage',
                          formatPercentage,
                          false
                        )}
                      </BaseChart>
                    </Grid>
                  </Grid>
                </TabPanel>
                
                {/* Avg Ticket Panel */}
                <TabPanel value={chartTab} index={3}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <BaseChart title="Avg Ticket">
                        {createNivoBarChart(
                          avgTicketData,
                          ['Tw vs. Lw', 'Tw vs. Ly'],
                          ['#4285f4', '#ea4335'],
                          'avgTicket',
                          formatPercentage,
                          false
                        )}
                      </BaseChart>
                    </Grid>
                  </Grid>
                </TabPanel>
                
                {/* Labor Panel */}
                <TabPanel value={chartTab} index={4}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <BaseChart title="Labor Hrs">
                        {createNivoBarChart(
                          laborHrsData,
                          ['Tw Lb Hrs', 'Lw Lb Hrs'],
                          ['#000000', '#8bc34a'],
                          'laborHrs',
                          value => value.toFixed(2),
                          true,
                          d => d.data[`${d.id}`].toFixed(2)
                        )}
                      </BaseChart>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <BaseChart title="SPMH">
                        {createNivoBarChart(
                          spmhData,
                          ['Tw SPMH', 'Lw SPMH'],
                          ['#000000', '#8bc34a'],
                          'spmh',
                          value => value.toFixed(2),
                          true,
                          d => d.data[`${d.id}`].toFixed(2)
                        )}
                      </BaseChart>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <BaseChart title="Labor $ Spent">
                        {createNivoBarChart(
                          laborCostData,
                          ['Tw Reg Pay', 'Lw Reg Pay'],
                          ['#4285f4', '#ea4335'],
                          'laborCost',
                          formatCurrency,
                          true,
                          d => `${Math.floor(d.value / 1000)}k`
                        )}
                      </BaseChart>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <BaseChart title="Labor %">
                        {createNivoBarChart(
                          laborPercentageData,
                          ['Tw Lc %', 'Lw Lc %'],
                          ['#4285f4', '#ea4335'],
                          'laborPercentage',
                          formatPercentage,
                          true,
                          d => `${d.value.toFixed(2)}%`
                          )}
                      </BaseChart>
                    </Grid>
                  </Grid>
                </TabPanel>
                
                {/* COGS Panel */}
                <TabPanel value={chartTab} index={5}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <BaseChart title="COGS $">
                        {createNivoBarChart(
                          cogsData,
                          ['Tw COGS', 'Lw COGS'],
                          ['#9c27b0', '#e57373'],
                          'cogs',
                          formatCurrency,
                          true,
                          d => `${Math.floor(d.value / 1000)}k`
                        )}
                      </BaseChart>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <BaseChart title="COGS %">
                        {createNivoBarChart(
                          cogsPercentageData,
                          ['Tw Fc %', 'Lw Fc %'],
                          ['#9c27b0', '#e57373'],
                          'cogsPercentage',
                          formatPercentage,
                          true,
                          d => `${d.value.toFixed(2)}%`
                        )}
                      </BaseChart>
                    </Grid>
                  </Grid>
                </TabPanel>
              </Box>
            </TabPanel>
          </Card>
        </>
      )}
    </Box>
  );
}
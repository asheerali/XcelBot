// Updated SalesDashboard.tsx to use backend data structure
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
  Button
} from '@mui/material';

// For charts
import { ResponsiveBar } from '@nivo/bar';

// Icons
import FilterListIcon from '@mui/icons-material/FilterList';
import PlaceIcon from '@mui/icons-material/Place';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import BarChartIcon from '@mui/icons-material/BarChart';
import RefreshIcon from '@mui/icons-material/Refresh';

// Components
import FinancialTablesComponent from '../components/FinancialTablesComponent';

// Import Redux hooks and actions
import { useAppDispatch, useAppSelector } from '../typedHooks';
import { 
  selectSalesWideLocation, 
  updateSalesWideFilters 
} from '../store/excelSlice';

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

// Custom theme for Nivo charts to fix label cutoff
const getChartTheme = () => {
  return {
    axis: {
      ticks: {
        text: {
          fontSize: 8
        }
      },
      legend: {
        text: {
          fontSize: 8,
          fontWeight: 'bold'
        }
      }
    },
    labels: {
      text: {
        fontSize: 8,
        fontWeight: 'bold'
      }
    },
    legends: {
      text: {
        fontSize: 12
      }
    },
    tooltip: {
      container: {
        fontSize: 12
      }
    }
  };
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
    salesWideFilters
  } = useAppSelector((state) => state.excel);

  // Find current data for the selected location
  const currentSalesWideData = salesWideFiles.find(f => f.location === currentSalesWideLocation)?.data;

  // State variables
  const [tabValue, setTabValue] = useState(0);
  const [chartTab, setChartTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Use location and other filters from Redux state
  const location = salesWideFilters.location;
  const helper = salesWideFilters.helper || 'Helper 1';
  const year = salesWideFilters.year || '2025';
  const equator = salesWideFilters.equator || 'Equator A';

  // Extract data arrays from backend response
  const locations = currentSalesWideData?.locations || salesWideLocations || ['Midtown East', 'Downtown West', 'Uptown North', 'Southside'];
  const helpers = ['Helper 1', 'Helper 2', 'Helper 3', 'Helper 4'];
  const years = currentSalesWideData?.years || [2024, 2025, 2026];
  const equators = ['Equator A', 'Equator B', 'Equator C', 'Equator D'];

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

  // Chart data from backend tables
  const salesData = processTableDataForCharts(
    currentSalesWideData?.table1 || [], 
    ['Tw vs. Lw', 'Tw vs. Ly']
  );

  const ordersData = processTableDataForCharts(
    currentSalesWideData?.table2 || [], 
    ['Tw vs. Lw', 'Tw vs. Ly']
  );

  const avgTicketData = processTableDataForCharts(
    currentSalesWideData?.table3 || [], 
    ['Tw vs. Lw', 'Tw vs. Ly']
  );

  const laborHrsData = processTableDataForCharts(
    currentSalesWideData?.table6 || [], 
    ['Tw Lb Hrs', 'Lw Lb Hrs']
  );

  const spmhData = processTableDataForCharts(
    currentSalesWideData?.table7 || [], 
    ['Tw SPMH', 'Lw SPMH']
  );

  const laborCostData = processTableDataForCharts(
    currentSalesWideData?.table5 || [], 
    ['Tw Reg Pay', 'Lw Reg Pay']
  );

  const laborPercentageData = processTableDataForCharts(
    currentSalesWideData?.table5 || [], 
    ['Tw Lc %', 'Lw Lc %']
  );

  const cogsData = processTableDataForCharts(
    currentSalesWideData?.table4 || [], 
    ['Tw COGS', 'Lw COGS']
  );

  const cogsPercentageData = processTableDataForCharts(
    currentSalesWideData?.table4 || [], 
    ['Tw Fc %', 'Lw Fc %']
  );

  // Create financial tables structure from backend data
  const financialTables = React.useMemo(() => {
    if (!currentSalesWideData) return [];

    const createTableFromBackendData = (tableData: any[], title: string, columns: string[]) => {
      if (!tableData || tableData.length === 0) return { title, columns, data: [] };
      
      return {
        title,
        columns,
        data: tableData.map(row => ({
          store: row.Store,
          value1: row[columns[1]?.replace('Tw ', 'Tw ').replace('Store', '')] || 0,
          value2: row[columns[2]?.replace('Lw ', 'Lw ').replace('Store', '')] || 0,
          value3: row[columns[3]?.replace('Ly ', 'Ly ').replace('Store', '')] || 0,
          change1: typeof row['Tw vs. Lw'] === 'number' ? `${row['Tw vs. Lw'].toFixed(2)}%` : '0%',
          change2: typeof row['Tw vs. Ly'] === 'number' ? `${row['Tw vs. Ly'].toFixed(2)}%` : '0%',
          isGrandTotal: row.Store === 'Grand Total'
        }))
      };
    };

    return [
      createTableFromBackendData(
        currentSalesWideData.table1 || [],
        'Sales',
        ['Store', 'Tw Sales', 'Lw Sales', 'Ly Sales', 'Tw vs. Lw', 'Tw vs. Ly']
      ),
      createTableFromBackendData(
        currentSalesWideData.table2 || [],
        'Orders',
        ['Store', 'Tw Orders', 'Lw Orders', 'Ly Orders', 'Tw vs. Lw', 'Tw vs. Ly']
      ),
      createTableFromBackendData(
        currentSalesWideData.table3 || [],
        'Average Ticket',
        ['Store', 'Tw Avg Ticket', 'Lw Avg Ticket', 'Ly Avg Ticket', 'Tw vs. Lw', 'Tw vs. Ly']
      ),
      createTableFromBackendData(
        currentSalesWideData.table4 || [],
        'COGS',
        ['Store', 'Tw COGS', 'Lw COGS', 'Tw vs. Lw', 'Tw Fc %', 'Lw Fc %']
      ),
      createTableFromBackendData(
        currentSalesWideData.table5 || [],
        'Regular Pay',
        ['Store', 'Tw Reg Pay', 'Lw Reg Pay', 'Tw vs. Lw', 'Tw Lc %', 'Lw Lc %']
      ),
      createTableFromBackendData(
        currentSalesWideData.table6 || [],
        'Labor Hours',
        ['Store', 'Tw Lb Hrs', 'Lw Lb Hrs', 'Tw vs. Lw']
      ),
      createTableFromBackendData(
        currentSalesWideData.table7 || [],
        'SPMH',
        ['Store', 'Tw SPMH', 'Lw SPMH', 'Tw vs. Lw']
      )
    ];
  }, [currentSalesWideData]);

  // Inject the rotating animation styles
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

  // Handlers for filter changes
  const handleLocationChange = (event: SelectChangeEvent) => {
    const newLocation = event.target.value;
    dispatch(selectSalesWideLocation(newLocation));
    dispatch(updateSalesWideFilters({ location: newLocation }));
  };

  const handleHelperChange = (event: SelectChangeEvent) => {
    const newHelper = event.target.value;
    dispatch(updateSalesWideFilters({ helper: newHelper }));
  };

  const handleYearChange = (event: SelectChangeEvent) => {
    const newYear = event.target.value;
    dispatch(updateSalesWideFilters({ year: newYear }));
  };

  const handleEquatorChange = (event: SelectChangeEvent) => {
    const newEquator = event.target.value;
    dispatch(updateSalesWideFilters({ equator: newEquator }));
  };

  // Handle main tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle chart tab change
  const handleChartTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setChartTab(newValue);
  };

  // Handle refresh - simulate data loading
  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate data loading
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  // Format values for charts
  const formatPercentage = (value: number) => `${value.toFixed(2)}%`;
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString(undefined, { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Function to get tailored chart margins based on chart type and container size
  const getChartMargins = (chartType: string) => {
    // Base margins
    const margins = { top: 50, right: 50, bottom: 80, left: 60 };
    
    // Adjust based on chart type
    switch(chartType) {
      case 'laborHrs':
      case 'laborCost':
      case 'cogs':
        // These charts need more left margin for currency values
        return { top: 50, right: 50, bottom: 80, left: 80 };
      case 'salesPercentage':
      case 'avgTicket':
        // These need more bottom margin for rotated store names
        return { top: 50, right: 50, bottom: 100, left: 60 };
      default:
        return margins;
    }
  };

  // Function to create a common Nivo bar chart with text overflow fixed
  const createNivoBarChart = (
    data: any[], 
    keys: string[], 
    colors: string[], 
    chartType: string,
    labelFormat: (value: number) => string = formatPercentage,
    enableLabels: boolean = false,
    customLabelFormat?: (d: any) => string
  ) => {
    const margins = getChartMargins(chartType);
    
    // Set appropriate dimensions based on chart type
    const chartHeight = '100%';
    const barPadding = 0.25; // More space between bars
    
    // Get appropriate rotation angle based on number of items
    const tickRotation = data.length > 4 ? -45 : 0;
    
    return (
      <Box sx={{ height: chartHeight, width: '100%', overflow: 'visible' }}>
        <ResponsiveBar
          data={data}
          keys={keys}
          indexBy="store"
          margin={margins}
          padding={barPadding}
          valueScale={{ type: 'linear' }}
          indexScale={{ type: 'band', round: true }}
          colors={colors}
          theme={getChartTheme()}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: tickRotation,
            legendPosition: 'middle',
            legendOffset: 42, // Move labels further down
            truncateTickAt: 0  // Don't truncate labels
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legendPosition: 'middle',
            legendOffset: -50, // Move legend further left
            format: (value) => {
              // Different formatting based on chart type
              if (chartType === 'laborHrs' || chartType === 'laborCost' || chartType === 'cogs') {
                return `${(value / 1000).toFixed(0)}k`;
              }
              if (chartType.includes('Percentage')) {
                return `${value}%`;
              }
              return `${value}`;
            }
          }}
          labelSkipWidth={16} // Skip labels on narrow bars
          labelSkipHeight={16} // Skip labels on short bars
          labelTextColor="#ffffff"
          legends={[
            {
              dataFrom: 'keys',
              anchor: 'top',
              direction: 'row',
              justify: false,
              translateX: 0,
              translateY: -35,
              itemsSpacing: 8, // More space between legend items
              itemWidth: 100,
              itemHeight: 20,
              itemDirection: 'left-to-right',
              itemOpacity: 0.85,
              symbolSize: 18
            }
          ]}
          valueFormat={labelFormat}
          enableGridY={true}
          enableLabel={enableLabels}
          label={customLabelFormat}
          animate={true}
        />
      </Box>
    );
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Dashboard Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            fontWeight: 600,
            color: '#1a237e',
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
          }}
        >
          Sales Wide Dashboard
        </Typography>

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

      {/* Data Info Display */}
      {currentSalesWideData && (
        <Card sx={{ mb: 3, p: 2, borderRadius: 2, backgroundColor: '#f8f9fa' }}>
          <Typography variant="body1">
            <strong>Data Source:</strong> {currentSalesWideData.fileName || 'Sales Wide Data'} | 
            <strong> Locations:</strong> {locations.length} stores | 
            <strong> Current Selection:</strong> {currentSalesWideLocation || 'All Stores'}
          </Typography>
          {currentSalesWideData.dates && (
            <Typography variant="body2" color="text.secondary">
              <strong>Date Ranges Available:</strong> {currentSalesWideData.dates.length} periods ({currentSalesWideData.dates[0]} to {currentSalesWideData.dates[currentSalesWideData.dates.length - 1]})
            </Typography>
          )}
        </Card>
      )}

      {/* Filters Section */}
      <Card elevation={3} sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterListIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                Filters
              </Typography>
            </Box>
            <Button 
              variant="outlined" 
              size="small" 
              color="primary"
              disabled={isLoading}
              onClick={handleRefresh}
              startIcon={isLoading ? <RefreshIcon className="rotating" /> : <RefreshIcon />}
            >
              {isLoading ? 'Loading...' : 'Apply Filters'}
            </Button>
          </Box>

          <Grid container spacing={3}>
            {/* Location filter */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="location-select-label">Location</InputLabel>
                <Select
                  labelId="location-select-label"
                  id="location-select"
                  value={location}
                  label="Location"
                  onChange={handleLocationChange}
                  startAdornment={<PlaceIcon sx={{ mr: 1, ml: -0.5, color: 'primary.light' }} />}
                >
                  {locations.map(loc => (
                    <MenuItem key={loc} value={loc}>{loc}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Helper filter */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="helper-select-label">Helper</InputLabel>
                <Select
                  labelId="helper-select-label"
                  id="helper-select"
                  value={helper}
                  label="Helper"
                  onChange={handleHelperChange}
                  startAdornment={<InfoOutlinedIcon sx={{ mr: 1, ml: -0.5, color: 'secondary.light' }} />}
                >
                  {helpers.map(h => (
                    <MenuItem key={h} value={h}>{h}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Year filter */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="year-select-label">Year</InputLabel>
                <Select
                  labelId="year-select-label"
                  id="year-select"
                  value={year}
                  label="Year"
                  onChange={handleYearChange}
                  startAdornment={<CalendarTodayIcon sx={{ mr: 1, ml: -0.5, color: 'info.light' }} />}
                >
                  {years.map(y => (
                    <MenuItem key={y} value={y.toString()}>{y}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Equator filter */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="equator-select-label">Equator</InputLabel>
                <Select
                  labelId="equator-select-label"
                  id="equator-select"
                  value={equator}
                  label="Equator"
                  onChange={handleEquatorChange}
                  startAdornment={<IconButton size="small" sx={{ mr: 0.5, ml: -1, p: 0 }}><BarChartIcon fontSize="small" color="success" /></IconButton>}
                >
                  {equators.map(eq => (
                    <MenuItem key={eq} value={eq}>{eq}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Active filters */}
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip 
              label={`Helper: ${helper}`} 
              color="secondary" 
              variant="outlined" 
              size="small" 
              icon={<InfoOutlinedIcon />} 
            />
            <Chip 
              label={`Year: ${year}`} 
              color="info" 
              variant="outlined" 
              size="small" 
              icon={<CalendarTodayIcon />} 
            />
            <Chip 
              label={`Equator: ${equator}`} 
              color="success" 
              variant="outlined" 
              size="small" 
              icon={<BarChartIcon />} 
            />
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
              <Tab label="Financial Dashboard" />
              <Tab label="Day of Week Analysis" />
            </Tabs>
  
            {/* Financial Dashboard Tab */}
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
                {/* Pass the financial tables data to the component */}
                <FinancialTablesComponent financialTables={financialTables} />
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
                  <Grid container spacing={2}>
                    {/* Sales Chart */}
                    <Grid item xs={12} md={6}>
                      <BaseChart title="Sales">
                        {createNivoBarChart(
                          salesData,
                          ['Tw vs. Lw', 'Tw vs. Ly'],
                          ['#4285f4', '#ea4335'],
                          'salesPercentage'
                        )}
                      </BaseChart>
                    </Grid>
                    
                    {/* Orders Chart */}
                    <Grid item xs={12} md={6}>
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
                    
                    {/* Average Ticket Chart */}
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
                    
                    {/* Labor Hours Chart */}
                    <Grid item xs={12} md={6}>
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
                    
                    {/* SPMH Chart */}
                    <Grid item xs={12} md={6}>
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
                    
                    {/* Labor Cost Chart */}
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
                    
                    {/* Labor Percentage Chart */}
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
                    
                    {/* COGS Chart */}
                    <Grid item xs={12} md={6}>
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
                    
                    {/* COGS Percentage Chart */}
                    <Grid item xs={12} md={6}>
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
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
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
                    
                    <Grid item xs={12} md={6}>
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
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
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
                    
                    <Grid item xs={12} md={6}>
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
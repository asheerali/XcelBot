// src/pages/Financials.tsx - Updated with integrated filters using financial-specific Redux state

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
import FinancialTable from '../components/FinancialTable';
import DayOfWeekAnalysis from '../components/DayOfWeekAnalysis';
import WeekOverWeekChart from '../components/graphs/WeekOverWeekChart';
import BudgetChart from '../components/graphs/BudgetChart';
import SalesChart from '../components/graphs/SalesChart';
import OrdersChart from '../components/graphs/OrdersChart';
import AvgTicketChart from '../components/graphs/AvgTicketChart';

// Import Redux hooks
import { useAppDispatch, useAppSelector } from '../typedHooks';
import { 
  selectFinancialLocation, 
  updateFinancialFilters 
} from '../store/excelSlice';

// Tab Panel Component
function TabPanel(props) {
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

// Main component
export function Financials() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Get financial-specific data from Redux
  const { 
    financialFiles, 
    currentFinancialLocation, 
    financialFilters,
    financialLocations 
  } = useAppSelector((state) => state.excel);
  
  // Find current financial data for selected location
  const currentFinancialData = financialFiles.find(f => f.location === currentFinancialLocation);
  
  // State variables
  const [tabValue, setTabValue] = useState(0);
  const [statsData, setStatsData] = useState([]);
  
  // Get years and date ranges from data or use defaults
  const availableYears = currentFinancialData?.data?.table1?.[0]?.financials_years || ['2025', '2024'];
  const availableDateRanges = currentFinancialData?.data?.dateRanges || [
    '1 | 12/30/2024 - 01/05/2025',
    '2 | 01/06/2025 - 01/12/2025'
  ];

  // Handle store/location change
  const handleStoreChange = (event: SelectChangeEvent) => {
    const newStore = event.target.value;
    dispatch(selectFinancialLocation(newStore));
    dispatch(updateFinancialFilters({ store: newStore }));
  };

  // Handle year change
  const handleYearChange = (event: SelectChangeEvent) => {
    const newYear = event.target.value;
    dispatch(updateFinancialFilters({ year: newYear }));
  };

  // Handle date range change
  const handleDateRangeChange = (event: SelectChangeEvent) => {
    const newDateRange = event.target.value;
    dispatch(updateFinancialFilters({ dateRange: newDateRange }));
  };

  // Update stats when data changes
  useEffect(() => {
    if (currentFinancialData?.data?.table5?.length > 0) {
      const weekStats = currentFinancialData.data.table5[0];
      
      const newStatsData = [
        { 
          label: 'Net Sales', 
          value: weekStats.netSales || '$0.00', 
          bottomChange: weekStats.netSalesChange || '+0%',
          bottomLabel: '% Change',
          changeColor: parseFloat(weekStats.netSalesChange) >= 0 ? '#2e7d32' : '#d32f2f',
          changeDirection: parseFloat(weekStats.netSalesChange) >= 0 ? 'up' : 'down'
        },
        { 
          label: 'Orders', 
          value: weekStats.orders || '0', 
          bottomChange: weekStats.ordersChange || '+0%',
          bottomLabel: '% Change',
          changeColor: parseFloat(weekStats.ordersChange) >= 0 ? '#2e7d32' : '#d32f2f',
          changeDirection: parseFloat(weekStats.ordersChange) >= 0 ? 'up' : 'down'
        },
        { 
          label: 'Avg Ticket', 
          value: weekStats.avgTicket || '$0.00', 
          bottomChange: weekStats.avgTicketChange || '0.00$',
          changeDirection: parseFloat(weekStats.avgTicketChange) >= 0 ? 'up' : 'down',
          changeColor: parseFloat(weekStats.avgTicketChange) >= 0 ? '#2e7d32' : '#d32f2f',
          bottomLabel: '$ Change'
        },
        { 
          label: 'Food Cost', 
          value: weekStats.foodCostPercent || '0.00%', 
          bottomChange: weekStats.foodCostChange || '0.00%',
          changeDirection: parseFloat(weekStats.foodCostChange) >= 0 ? 'up' : 'down',
          changeColor: parseFloat(weekStats.foodCostChange) >= 0 ? '#d32f2f' : '#2e7d32',
          bottomLabel: '% Change'
        },
        { 
          label: 'Labor Cost', 
          value: weekStats.laborCostPercent || '0.00%', 
          bottomChange: weekStats.laborCostChange || '0.00%',
          changeDirection: parseFloat(weekStats.laborCostChange) >= 0 ? 'up' : 'down',
          changeColor: parseFloat(weekStats.laborCostChange) >= 0 ? '#d32f2f' : '#2e7d32',
          bottomLabel: '% Change'
        },
        { 
          label: 'SPMH', 
          value: weekStats.spmh || '$0.00', 
          bottomChange: weekStats.spmhChange || '0.00$',
          changeDirection: parseFloat(weekStats.spmhChange) >= 0 ? 'up' : 'down',
          changeColor: parseFloat(weekStats.spmhChange) >= 0 ? '#2e7d32' : '#d32f2f',
          bottomLabel: '% Change'
        },
        { 
          label: 'LPMH', 
          value: weekStats.lpmh || '$0.00', 
          bottomChange: weekStats.lpmhChange || '0.00%',
          changeDirection: parseFloat(weekStats.lpmhChange) >= 0 ? 'up' : 'down',
          changeColor: parseFloat(weekStats.lpmhChange) >= 0 ? '#d32f2f' : '#2e7d32',
          bottomLabel: '% Change'
        },
      ];
      
      setStatsData(newStatsData);
    } else {
      // Use default data if no stats available
      setStatsData([
        { 
          label: 'Net Sales', 
          value: '$0.00', 
          bottomChange: '+0%',
          bottomLabel: '% Change',
          changeColor: '#1976d2'
        },
        { 
          label: 'Orders', 
          value: '0', 
          bottomChange: '+0%',
          bottomLabel: '% Change',
          changeColor: '#1976d2'
        },
        { 
          label: 'Avg Ticket', 
          value: '$0.00', 
          bottomChange: '0.00$',
          changeDirection: 'up',
          changeColor: '#2e7d32',
          bottomLabel: '$ Change'
        },
        { 
          label: 'Food Cost', 
          value: '0.00%', 
          bottomChange: '0.00%',
          changeDirection: 'up',
          changeColor: '#d32f2f',
          bottomLabel: '% Change'
        },
        { 
          label: 'Labor Cost', 
          value: '0.00%', 
          bottomChange: '0.00%',
          changeDirection: 'up',
          changeColor: '#d32f2f',
          bottomLabel: '% Change'
        },
        { 
          label: 'SPMH', 
          value: '$0.00', 
          bottomChange: '0.00$',
          changeDirection: 'up',
          changeColor: '#2e7d32',
          bottomLabel: '% Change'
        },
        { 
          label: 'LPMH', 
          value: '$0.00', 
          bottomChange: '0.00%',
          changeDirection: 'up',
          changeColor: '#d32f2f',
          bottomLabel: '% Change'
        },
      ]);
    }
  }, [currentFinancialData]);

  // Tab change handler
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ p: 2, backgroundColor: '#ffffff', minHeight: '100vh' }}>
      {/* Dashboard Title */}
       <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            fontWeight: 600,
            color: '#1a237e',
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
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

      {/* Alert for implementation status */}
      {currentFinancialData?.data?.data === "Financial Dashboard is not yet implemented." && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Financial Dashboard is not yet fully implemented. Displaying available data.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left Side Filters */}
        <Grid item xs={12} md={4} lg={3}>
          <Card elevation={3} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 500, color: '#424242' }}>
                Filters
              </Typography>
              
              {/* Current file info */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Current file: {currentFinancialData?.fileName || 'No file selected'}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  {financialFiles.length} financial file(s) available
                </Typography>
              </Box>
              
              {/* Store selector */}
              <Box sx={{ mb: 3 }}>
                <Typography sx={{ mb: 1, fontSize: '0.875rem', color: '#616161' }}>
                  Store
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={financialFilters.store || currentFinancialLocation || ''}
                    onChange={handleStoreChange}
                    displayEmpty
                    sx={{ 
                      backgroundColor: 'white',
                      borderRadius: 1,
                    }}
                    disabled={financialLocations.length === 0}
                  >
                    {financialLocations.length > 0 ? (
                      financialLocations.map(loc => (
                        <MenuItem key={loc} value={loc}>{loc}</MenuItem>
                      ))
                    ) : (
                      [
                        <MenuItem key="default1" value="0001: Midtown East">0001: Midtown East</MenuItem>,
                        <MenuItem key="default2" value="0002: Downtown West">0002: Downtown West</MenuItem>
                      ]
                    )}
                  </Select>
                </FormControl>
              </Box>

              {/* Year selector */}
              <Box sx={{ mb: 3 }}>
                <Typography sx={{ mb: 1, fontSize: '0.875rem', color: '#616161' }}>
                  Year
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={financialFilters.year}
                    onChange={handleYearChange}
                    displayEmpty
                    sx={{ 
                      backgroundColor: 'white',
                      borderRadius: 1,
                    }}
                  >
                    {availableYears.map(year => (
                      <MenuItem key={year} value={year}>{year}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Date range selector */}
              <Box>
                <Typography sx={{ mb: 1, fontSize: '0.875rem', color: '#616161' }}>
                  Week / Date Range
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={financialFilters.dateRange}
                    onChange={handleDateRangeChange}
                    displayEmpty
                    sx={{ 
                      backgroundColor: 'white',
                      borderRadius: 1,
                    }}
                  >
                    {availableDateRanges.map(range => (
                      <MenuItem key={range} value={range}>{range}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Side - Week-Over-Week Analysis */}
        <Grid item xs={12} md={8} lg={9}>
          <Card 
            elevation={3} 
            sx={{ 
              borderRadius: 2,
              height: '100%'
            }}
          >
            <CardContent sx={{ py: 2, px: 3 }}>
              <Typography 
                variant="h5" 
                align="center" 
                sx={{ 
                  fontWeight: 500,
                  mb: 2,
                  color: '#1565c0'
                }}
              >
                Week-Over-Week Analysis
              </Typography>
              
              {/* Stats Grid - Two Rows */}
              <Grid container spacing={1.5}>
                {/* First Row - 4 items */}
                {statsData.slice(0, 4).map((stat, index) => (
                  <Grid item xs={6} sm={3} key={index}>
                    <Card 
                      elevation={1} 
                      sx={{ 
                        p: 1.5,
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
                          fontSize: '0.8rem',
                          mb: 0.5
                        }}
                      >
                        {stat.label}
                      </Typography>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 600,
                          color: '#263238',
                          mb: 0.5,
                          fontSize: '1.2rem'
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
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            {stat.changeDirection === 'up' ? '▲' : '▼'}
                          </span>
                        )}
                        <Typography 
                          sx={{ 
                            color: stat.changeColor || '#1976d2',
                            fontSize: '0.8rem',
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
                          fontSize: '0.7rem'
                        }}
                      >
                        {stat.bottomLabel}
                      </Typography>
                    </Card>
                  </Grid>
                ))}
                
                {/* Second Row - 3 items centered */}
                <Grid item xs={12}>
                  <Grid container spacing={1.5} justifyContent="center">
                    {statsData.slice(4, 7).map((stat, index) => (
                      <Grid item xs={6} sm={4} key={index + 4}>
                        <Card 
                          elevation={1} 
                          sx={{ 
                            p: 1.5,
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
                              fontSize: '0.8rem',
                              mb: 0.5
                            }}
                          >
                            {stat.label}
                          </Typography>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 600,
                              color: '#263238',
                              mb: 0.5,
                              fontSize: '1.2rem'
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
                                fontSize: '12px',
                                fontWeight: 'bold'
                              }}>
                                {stat.changeDirection === 'up' ? '▲' : '▼'}
                              </span>
                            )}
                            <Typography 
                              sx={{ 
                                color: stat.changeColor || '#1976d2',
                                fontSize: '0.8rem',
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
                              fontSize: '0.7rem'
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
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card sx={{ mt: 3, borderRadius: 2 }} elevation={3}>
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
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 3 }}>
            {/* Financial Table */}
            <FinancialTable data={currentFinancialData?.data} />
            
            {/* Only show charts if we have data */}
            {currentFinancialData && (
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
                  Comparison Charts
                </Typography>
                
                {/* First Chart - Full width row */}
                <Box sx={{ mb: 4 }}>
                  <WeekOverWeekChart data={currentFinancialData?.data} />
                </Box>
                
                {/* Second Chart - Full width row */}
                <Box>
                  <BudgetChart data={currentFinancialData?.data} />
                </Box>
              </Box>
            )}
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3 }}>
            {/* Day of Week Analysis Tables */}
            <DayOfWeekAnalysis data={currentFinancialData?.data} />
            
            {/* Only show charts if we have data */}
            {currentFinancialData && (
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
                
                {/* Sales Chart - Full width row */}
                <Box sx={{ mb: 4 }}>
                  <SalesChart data={currentFinancialData?.data} />
                </Box>
                
                {/* Orders Chart - Full width row */}
                <Box sx={{ mb: 4 }}>
                  <OrdersChart data={currentFinancialData?.data} />
                </Box>
                
                {/* Average Ticket Chart - Full width row */}
                <Box>
                  <AvgTicketChart data={currentFinancialData?.data} />
                </Box>
              </Box>
            )}
          </Box>
        </TabPanel>
      </Card>
    </Box>
  );
}

export default Financials;
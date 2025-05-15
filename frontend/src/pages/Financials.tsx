import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import FinancialTable from '../components/FinancialTable';
import DayOfWeekAnalysis from '../components/DayOfWeekAnalysis';
import WeekOverWeekChart from '../components/graphs/WeekOverWeekChart';
import BudgetChart from '../components/graphs/BudgetChart';
import SalesChart from '../components/graphs/SalesChart';
import OrdersChart from '../components/graphs/OrdersChart';
import AvgTicketChart from '../components/graphs/AvgTicketChart';

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

// Main component - same name as original
export function Financials() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // State variables
  const [store, setStore] = useState('0001: Midtown East');
  const [year, setYear] = useState('2025');
  const [dateRange, setDateRange] = useState('1 | 12/30/2024 - 01/05/2025');
  const [tabValue, setTabValue] = useState(0);

  // Sample data for the Week-Over-Week Analysis
  const statsData = [
    { 
      label: 'Net Sales', 
      value: '$8,268.68', 
      bottomChange: '+0%',
      bottomLabel: '% Change',
      changeColor: '#1976d2'
    },
    { 
      label: 'Orders', 
      value: '372', 
      bottomChange: '+0%',
      bottomLabel: '% Change',
      changeColor: '#1976d2'
    },
    { 
      label: 'Avg Ticket', 
      value: '$22.23', 
      bottomChange: '22.23$',
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
      value: '30.23%', 
      bottomChange: '30.23%',
      changeDirection: 'up',
      changeColor: '#d32f2f',
      bottomLabel: '% Change'
    },
    { 
      label: 'SPMH', 
      value: '$68.91', 
      bottomChange: '68.91$',
      changeDirection: 'up',
      changeColor: '#2e7d32',
      bottomLabel: '% Change'
    },
    { 
      label: 'LPMH', 
      value: '$20.83', 
      bottomChange: '20.83%',
      changeDirection: 'up',
      changeColor: '#d32f2f',
      bottomLabel: '% Change'
    },
  ];

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
        align="center" 
        sx={{ 
          mb: 2.5, 
          fontWeight: 600,
          color: '#1a237e',
          fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' }
        }}
      >
        FINANCIAL DASHBOARD
      </Typography>

      <Grid container spacing={3}>
        {/* Left Side Filters */}
        <Grid item xs={12} md={4} lg={3}>
          <Card elevation={3} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 500, color: '#424242' }}>
                Filters
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography sx={{ mb: 1, fontSize: '0.875rem', color: '#616161' }}>
                  Store
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={store}
                    onChange={(e) => setStore(e.target.value)}
                    displayEmpty
                    sx={{ 
                      backgroundColor: 'white',
                      borderRadius: 1,
                    }}
                  >
                    <MenuItem value="0001: Midtown East">0001: Midtown East</MenuItem>
                    <MenuItem value="0002: Downtown West">0002: Downtown West</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography sx={{ mb: 1, fontSize: '0.875rem', color: '#616161' }}>
                  Year
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    displayEmpty
                    sx={{ 
                      backgroundColor: 'white',
                      borderRadius: 1,
                    }}
                  >
                    <MenuItem value="2025">2025</MenuItem>
                    <MenuItem value="2024">2024</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box>
                <Typography sx={{ mb: 1, fontSize: '0.875rem', color: '#616161' }}>
                  Week / Date Range
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    displayEmpty
                    sx={{ 
                      backgroundColor: 'white',
                      borderRadius: 1,
                    }}
                  >
                    <MenuItem value="1 | 12/30/2024 - 01/05/2025">1 | 12/30/2024 - 01/05/2025</MenuItem>
                    <MenuItem value="2 | 01/06/2025 - 01/12/2025">2 | 01/06/2025 - 01/12/2025</MenuItem>
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
              height: '100%' // Match filter card height
            }}
          >
            <CardContent sx={{ py: 2, px: 3 }}>
              <Typography 
                variant="h5" 
                align="center" 
                sx={{ 
                  fontWeight: 500,
                  mb: 2,
                  // color: '#1565c0'
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
          <Tab label="Financial Dashboard" />
          <Tab label="Day of Week Analysis" />
        </Tabs>


        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 3 }}>
            {/* Financial Table */}
            <FinancialTable />
            
            
            <Box sx={{ mt: 4 }}>
              {/* <Typography 
                variant="h5" 
                sx={{ 
                  mb: 3,
                  textAlign: 'center',
                  fontWeight: 600,
                  color: '#424242'
                }}
              >
                Comparison Charts
              </Typography> */}
              
              {/* First Chart - Full width row */}
              {/* <Box sx={{ mb: 4 }}>
                <WeekOverWeekChart />
              </Box>
               */}
              {/* Second Chart - Full width row */}
              {/* <Box>
                <BudgetChart />
              </Box> */}
            </Box>
          </Box>
        </TabPanel>
        
        
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3 }}>
            {/* Day of Week Analysis Tables */}
            <DayOfWeekAnalysis />
            
            {/* Charts Section */}
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
                <SalesChart />
              </Box>
              
              {/* Orders Chart - Full width row */}
              <Box sx={{ mb: 4 }}>
                <OrdersChart />
              </Box>
              
              {/* Average Ticket Chart - Full width row */}
              <Box>
                <AvgTicketChart />
              </Box>
            </Box>
          </Box>
        </TabPanel>
      </Card>
    </Box>
  );
}

export default Financials;
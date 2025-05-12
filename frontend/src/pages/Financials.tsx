<<<<<<< HEAD
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
import FinancialTable from '../components/FinancialTable';
import DayOfWeekAnalysis from '../components/DayOfWeekAnalysis';
import WeekOverWeekChart from '../components/graphs/WeekOverWeekChart';
import BudgetChart from '../components/graphs/BudgetChart';
import SalesChart from '../components/graphs/SalesChart';
import OrdersChart from '../components/graphs/OrdersChart';
import AvgTicketChart from '../components/graphs/AvgTicketChart';

// Main component
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
      bottomLabel: '% Change'
    },
    { 
      label: 'Orders', 
      value: '372', 
      bottomChange: '+0%',
      bottomLabel: '% Change'
    },
    { 
      label: 'Avg Ticket', 
      value: '$22.23', 
      bottomChange: '22.23$',
      changeDirection: 'up',
      changeColor: 'green',
      bottomLabel: '$ Change'
    },
    { 
      label: 'Food Cost', 
      value: '0.00%', 
      bottomChange: '0.00%',
      changeDirection: 'up',
      changeColor: 'red',
      bottomLabel: '% Change'
    },
    { 
      label: 'Labor Cost', 
      value: '30.23%', 
      bottomChange: '30.23%',
      changeDirection: 'up',
      changeColor: 'red',
      bottomLabel: '% Change'
    },
    { 
      label: 'SPMH', 
      value: '$68.91', 
      bottomChange: '68.91$',
      changeDirection: 'up',
      changeColor: 'green',
      bottomLabel: '% Change'
    },
    { 
      label: 'LPMH', 
      value: '$20.83', 
      bottomChange: '20.83%',
      changeDirection: 'up',
      changeColor: 'red',
      bottomLabel: '% Change'
    },
  ];

  // Tab change handler
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ p: 2, maxWidth: '100%' }}>
      {/* Dashboard Title */}
      <Typography 
        variant="h4" 
        component="h1" 
        align="center" 
        sx={{ 
          mb: 3, 
          fontWeight: 'bold',
          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
        }}
      >
        FINANCIAL DASHBOARD
      </Typography>

      <Box sx={{ 
        display: 'flex', 
        flexDirection: isTablet ? 'column' : 'row', 
        justifyContent: 'space-between', 
        mb: 3,
        gap: 3
      }}>
        {/* Left Side Filters */}
        <Box sx={{ width: isTablet ? '100%' : '30%' }}>
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ mb: 0.5 }}>
              Store
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={store}
                onChange={(e) => setStore(e.target.value)}
                displayEmpty
                sx={{ 
                  backgroundColor: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#cccccc',
                  }
                }}
              >
                <MenuItem value="0001: Midtown East">0001: Midtown East</MenuItem>
                <MenuItem value="0002: Downtown West">0002: Downtown West</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography sx={{ mb: 0.5 }}>
              Year
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                displayEmpty
                sx={{ 
                  backgroundColor: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#cccccc',
                  }
                }}
              >
                <MenuItem value="2025">2025</MenuItem>
                <MenuItem value="2024">2024</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box>
            <Typography sx={{ mb: 0.5 }}>
              Week / Date Range
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                displayEmpty
                sx={{ 
                  backgroundColor: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#cccccc',
                  }
                }}
              >
                <MenuItem value="1 | 12/30/2024 - 01/05/2025">1 | 12/30/2024 - 01/05/2025</MenuItem>
                <MenuItem value="2 | 01/06/2025 - 01/12/2025">2 | 01/06/2025 - 01/12/2025</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Week-Over-Week Analysis */}
        <Box sx={{ width: isTablet ? '100%' : '68%' }}>
          <Typography 
            variant="h6" 
            align="center" 
            sx={{ 
              fontWeight: 'bold', 
              mb: 2,
              fontSize: { xs: '1rem', sm: '1.25rem' } 
            }}
          >
            Week-Over-Week Analysis
          </Typography>
          
          {/* Stats Grid - Exact match to the image */}
          <Box sx={{ 
            display: 'flex',
            flexWrap: 'wrap',
            border: '1px solid #ccc'
          }}>
            {statsData.map((stat, index) => (
              <Box key={index} sx={{ 
                width: `${100 / 7}%`, 
                borderRight: index < statsData.length - 1 ? '1px solid #ccc' : 'none',
                textAlign: 'center',
                padding: 1,
                boxSizing: 'border-box'
              }}>
                <Typography sx={{ color: 'blue', fontWeight: 'bold' }}>
                  {stat.label}
                </Typography>
                <Typography variant="h6" sx={{ my: 1 }}>
                  {stat.value}
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center'
                }}>
                  {stat.changeDirection && (
                    stat.changeDirection === 'up' ? 
                      <span style={{ 
                        color: stat.changeColor, 
                        marginRight: '4px',
                        fontSize: '16px',
                        fontWeight: 'bold'
                      }}>▲</span> : 
                      <span style={{ 
                        color: stat.changeColor, 
                        marginRight: '4px',
                        fontSize: '16px',
                        fontWeight: 'bold'
                      }}>▼</span>
                  )}
                  <Typography sx={{ color: stat.changeColor || 'blue' }}>
                    {stat.bottomChange}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'blue' }}>
                  {stat.bottomLabel}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="fullWidth"
          sx={{ 
            '& .MuiTab-root': { 
              fontWeight: 'bold',
              textTransform: 'none',
              fontSize: '1rem'
            },
            borderBottom: '1px solid #ccc'
          }}
        >
          <Tab label="Financial Dashboard" />
          <Tab label="Day of Week Analysis" />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        {/* Financial Table */}
        <FinancialTable />
        
        {/* Charts Section - At bottom of Financial Dashboard tab */}
        <Box sx={{ mt: 4 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              mb: 3,
              textAlign: 'center',
              fontWeight: 'bold'
            }}
          >
            Comparison Charts
          </Typography>
          
          {/* First Chart - Full width row */}
          <Box sx={{ mb: 4 }}>
            <WeekOverWeekChart />
          </Box>
          
          {/* Second Chart - Full width row */}
          <Box>
            <BudgetChart />
          </Box>
        </Box>
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        {/* Day of Week Analysis Tables */}
        <DayOfWeekAnalysis />
        
        {/* Charts Section */}
        <Box sx={{ mt: 4 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              mb: 3,
              textAlign: 'center',
              fontWeight: 'bold'
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
      </TabPanel>
    </Box>
  );
}

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

export default Financials;
=======
import React from "react";
import { Box, Typography } from "@mui/material";
import { useLocation } from "react-router-dom";

const Financials: React.FC = () => {
  const location = useLocation();
  const message =
    (location.state as any)?.message || "Welcome to the Financial Dashboard";

  return (
    <Box sx={{ py: 4, px: 2 }}>
      <Typography variant="h4" gutterBottom>
        {message}
      </Typography>
    </Box>
  );
};

export default Financials;
>>>>>>> feat/financials2

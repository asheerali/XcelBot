import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  useTheme,
  alpha,
  CircularProgress,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, ComposedChart, ReferenceLine } from 'recharts';

// Icons
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AnalyticsIcon from '@mui/icons-material/Analytics';

// Styled Components
const ChartCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  background: theme.palette.background.paper,
  boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.08)}`,
  overflow: 'hidden',
  height: '400px'
}));

// Format currency
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
};

// Format number with commas
const formatNumber = (value) => {
  return new Intl.NumberFormat('en-US').format(value);
};

// Custom Tooltip for Charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: 1,
          padding: 2,
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
          {label}
        </Typography>
        {payload.map((entry, index) => (
          <Typography
            key={index}
            variant="body2"
            sx={{ color: entry.color }}
          >
            {entry.name}: {typeof entry.value === 'number' && entry.name.toLowerCase().includes('sales') 
              ? formatCurrency(entry.value) 
              : formatNumber(entry.value)}
          </Typography>
        ))}
      </Box>
    );
  }
  return null;
};

// FIXED: Accept analyticsData as prop instead of fetching independently
const AnalyticsComponenet = ({ 
  appliedFilters = { companies: [], locations: [], dateRange: null },
  analyticsData = null // NEW: Accept analyticsData from parent
}) => {
  const theme = useTheme();

  // Remove all the fetching logic since we're now getting data from parent
  // const [analyticsData, setAnalyticsData] = useState(null);
  // const [loading, setLoading] = useState(false);
  // const [error, setError] = useState(null);

  // Extract applied filter values for display purposes
  const { companies: appliedCompanies, locations: appliedLocations, dateRange: appliedDateRange } = appliedFilters;

  // Debug logging
  console.log('AnalyticsComponenet received analyticsData:', analyticsData);

  // No applied filters state
  if (!appliedCompanies || !appliedLocations || appliedCompanies.length === 0 || appliedLocations.length === 0) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: 400,
        flexDirection: 'column',
        gap: 2,
        p: 4
      }}>
        <AnalyticsIcon sx={{ fontSize: 60, color: 'text.secondary' }} />
        <Typography variant="h6" color="text.secondary" align="center">
          Select company and location to view analytics
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          Use the filters above to choose a company and location
        </Typography>
      </Box>
    );
  }

  // No data state
  if (!analyticsData) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: 400,
        flexDirection: 'column',
        gap: 2,
        p: 4
      }}>
        <AnalyticsIcon sx={{ fontSize: 60, color: 'text.secondary' }} />
        <Typography variant="h6" color="text.secondary" align="center">
          No analytics data available for the selected filters
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* REMOVED: Header section - no longer needed since parent handles this */}
      
      {/* REMOVED: Stats Cards - parent component now handles metrics display */}

      {/* Charts Only - This is what AnalyticsComponent should focus on */}
      <Grid container spacing={3}>
        {/* Daily Orders Chart */}
        <Grid item xs={12} md={6}>
          <ChartCard>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Daily Orders
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Daily order count with red moving average trend line
              </Typography>
              <Box sx={{ flexGrow: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={analyticsData.daily_orders}>
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                    <XAxis 
                      dataKey="date" 
                      stroke={theme.palette.text.secondary}
                      fontSize={11}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis stroke={theme.palette.text.secondary} fontSize={11} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="order_count" 
                      fill="#7c4dff"
                      name="Order Count"
                      radius={[2, 2, 0, 0]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="moving_avg" 
                      stroke="#f44336"
                      strokeWidth={2}
                      dot={false}
                      name="Moving Average"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </ChartCard>
        </Grid>

        {/* Average Order Value Chart */}
        <Grid item xs={12} md={6}>
          <ChartCard>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Average Order Value
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Line bar chart with red moving average trend line
              </Typography>
              <Box sx={{ flexGrow: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={analyticsData.avg_order_value_table}>
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                    <XAxis 
                      dataKey="date" 
                      stroke={theme.palette.text.secondary}
                      fontSize={11}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis stroke={theme.palette.text.secondary} fontSize={11} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="avg_order_value" 
                      fill="#66bb6a"
                      name="Avg Order Value"
                      radius={[2, 2, 0, 0]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="moving_avg" 
                      stroke="#f44336"
                      strokeWidth={2}
                      dot={false}
                      name="Moving Average"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </ChartCard>
        </Grid>

        {/* Daily Sales Trend Chart */}
        <Grid item xs={12}>
          <ChartCard>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Daily Sales Trends
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Daily sales with red moving average trend line
              </Typography>
              <Box sx={{ flexGrow: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={analyticsData.daily_sales_trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                    <XAxis 
                      dataKey="date" 
                      stroke={theme.palette.text.secondary}
                      fontSize={11}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis stroke={theme.palette.text.secondary} fontSize={11} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="total_sales" 
                      fill="#7c4dff"
                      name="Total Sales"
                      radius={[2, 2, 0, 0]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="moving_avg" 
                      stroke="#f44336"
                      strokeWidth={2}
                      dot={false}
                      name="Moving Average"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </ChartCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsComponenet;
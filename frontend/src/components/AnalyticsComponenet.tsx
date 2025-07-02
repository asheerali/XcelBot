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

// Import API base URL
import { API_URL_Local } from "../constants";

// Styled Components
const StatsCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
  boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 16px 48px ${alpha(theme.palette.common.black, 0.12)}`
  }
}));

const ChartCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  background: theme.palette.background.paper,
  boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.08)}`,
  overflow: 'hidden',
  height: '400px'
}));

const StatsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(3)
}));

const StatsContent = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 8
}));

const StatsIcon = styled(Box)(({ theme, color }) => ({
  width: 60,
  height: 60,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
  color: theme.palette.common.white,
  boxShadow: `0 8px 16px ${alpha(color, 0.3)}`
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

const AnalyticsComponenet = ({ appliedFilters = { companies: [], locations: [], dateRange: null } }) => {
  const theme = useTheme();
  
  // State for analytics data
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Extract applied filter values
  const { companies: appliedCompanies, locations: appliedLocations, dateRange: appliedDateRange } = appliedFilters;

  // Debug logging
  console.log('AnalyticsComponenet appliedFilters:', appliedFilters);

  // Fetch analytics data from API
  const fetchAnalyticsData = async () => {
    // Only fetch if we have both company and location applied
    if (!appliedCompanies || !appliedLocations || appliedCompanies.length === 0 || appliedLocations.length === 0) {
      console.log('Not fetching - no applied filters');
      setAnalyticsData(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Use the first applied company and location
      const companyId = appliedCompanies[0];
      const locationId = appliedLocations[0];

      console.log(`Fetching analytics data for company ${companyId}, location ${locationId}`);

      const response = await fetch(
        `${API_URL_Local}/api/storeorders/analyticsdashboard/${companyId}/${locationId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.data) {
        setAnalyticsData(result.data);
        console.log('Analytics data fetched successfully:', result.data);
      } else {
        throw new Error('No data received from API');
      }
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when applied filters change
  useEffect(() => {
    fetchAnalyticsData();
  }, [appliedFilters]);

  // Loading state
  if (loading) {
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
        <CircularProgress size={50} />
        <Typography variant="body1">Loading analytics data...</Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error loading analytics data: {error}
        </Alert>
      </Box>
    );
  }

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
          Select company and location, then click "Apply Filters" to view analytics
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          Use the filters above to choose a company and location, then click the Apply Filters button
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
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
          Analytics Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {analyticsData.company_name} - {analyticsData.location_name}
        </Typography>
      </Box>

      {/* Stats Cards - Only 3 cards, removed Total Guests */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Sales */}
        <Grid item xs={12} sm={6} md={4}>
          <StatsCard>
            <StatsContainer>
              <StatsContent>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Total Sales
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                  {formatCurrency(analyticsData.total_sales)}
                </Typography>
              </StatsContent>
              <StatsIcon color={theme.palette.success.main}>
                <AttachMoneyIcon sx={{ fontSize: 28 }} />
              </StatsIcon>
            </StatsContainer>
          </StatsCard>
        </Grid>

        {/* Total Orders */}
        <Grid item xs={12} sm={6} md={4}>
          <StatsCard>
            <StatsContainer>
              <StatsContent>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Total Orders
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.info.main }}>
                  {formatNumber(analyticsData.total_orders)}
                </Typography>
              </StatsContent>
              <StatsIcon color={theme.palette.info.main}>
                <ShoppingCartIcon sx={{ fontSize: 28 }} />
              </StatsIcon>
            </StatsContainer>
          </StatsCard>
        </Grid>

        {/* Average Order Value */}
        <Grid item xs={12} sm={6} md={4}>
          <StatsCard>
            <StatsContainer>
              <StatsContent>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Avg Order Value
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.warning.main }}>
                  {formatCurrency(analyticsData.avg_order_value)}
                </Typography>
              </StatsContent>
              <StatsIcon color={theme.palette.warning.main}>
                <TrendingUpIcon sx={{ fontSize: 28 }} />
              </StatsIcon>
            </StatsContainer>
          </StatsCard>
        </Grid>
      </Grid>

      {/* Charts */}
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
import React from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  useTheme,
  Divider,
  Avatar
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PercentIcon from '@mui/icons-material/Percent';

const MenuAnalysisDashboard = () => {
  const theme = useTheme();

  // Data for Sales per Location line chart
  const locationSalesData = [
    { name: 'Lenox Hill', value: 10.5 },
    { name: '', value: 14 },
    { name: '', value: 12 },
    { name: 'Midtown', value: 11.5 },
    { name: '', value: 18.5 },
    { name: '', value: 14 },
    { name: 'Riverside Park', value: 13 },
    { name: '', value: 13 },
    { name: '', value: 11.5 },
    { name: 'Union Square', value: 14 }
  ];

  // Continuous data for the line chart (to make it smooth)
  const continuousData = [
    { name: 'Lenox Hill', value: 10.5 },
    { name: '', value: 14 },
    { name: '', value: 12 },
    { name: 'Midtown', value: 11.5 },
    { name: '', value: 18.5 },
    { name: '', value: 14 },
    { name: 'Riverside Park', value: 13 },
    { name: '', value: 13 },
    { name: '', value: 11.5 },
    { name: 'Union Square', value: 14 }
  ];

  // Data for Average Price by Menu Item bar chart
  const menuItemsData = [
    { name: 'Grilled Chicken Breast', price: 15.99 },
    { name: 'Sophies Spicy Chicken Sandwich', price: 5.99 },
    { name: 'AM Beef', price: 1.99 },
    { name: 'AM Guava', price: 1.99 },
    { name: 'AM Chicken', price: 1.99 }
  ];

  // Function to format currency values
  const formatCurrency = (value) => {
    return `${value.toLocaleString('en-US', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Custom metric display component
  const MetricCard = ({ 
    icon, 
    value, 
    label, 
    sublabel = null, 
    iconColor, 
    prefix = '', 
    suffix = '' 
  }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box 
        sx={{ 
          bgcolor: iconColor + '20', // 20% opacity version of color
          color: iconColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          width: 56,
          height: 56
        }}
      >
        {icon}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
          <Typography variant="h5" fontWeight="bold" color="text.primary">
            {prefix}{value}{suffix}
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          {label}
        </Typography>
        {sublabel && (
          <Typography variant="body2" color="text.secondary">
            {sublabel}
          </Typography>
        )}
      </Box>
    </Box>
  );

  // Custom product metric display component
  const ProductMetricCard = ({ icon, name, price, iconColor, special = false }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {special ? (
        <Avatar 
          sx={{ 
            bgcolor: '#4CB0B0', 
            width: 56, 
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <PercentIcon />
        </Avatar>
      ) : (
        <Box 
          sx={{ 
            bgcolor: iconColor + '20', 
            color: iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            width: 56,
            height: 56
          }}
        >
          {icon}
        </Box>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant="body1" fontWeight="bold" color="text.primary">
          {name}
        </Typography>
        {price && (
          <Typography variant="h6" color="text.secondary">
            {price}
          </Typography>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 3 }}>
      {/* First row - Sales per Location and Additional Metrics */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Sales per Location
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={continuousData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: '#666' }}
                  />
                  <YAxis 
                    domain={[0, 20]} 
                    ticks={[0, 4, 8, 12, 16, 20]} 
                    axisLine={false} 
                    tickLine={false}
                  />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#4CB0B0" 
                    strokeWidth={3}
                    dot={{ r: 0 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Grid container spacing={3} height="100%">
            <Grid item xs={12}>
              <Paper sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Additional Metrics
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <MetricCard 
                    icon={<TrendingUpIcon fontSize="large" />} 
                    prefix="+" 
                    value="0.9" 
                    label="NET PRICE" 
                    sublabel="PRICE" 
                    iconColor="#4CB0B0" 
                  />
                  <Divider />
                  <MetricCard 
                    icon={<TrendingDownIcon fontSize="large" />} 
                    prefix="-" 
                    value="1.99" 
                    label="GUAVA AND CHEESE" 
                    sublabel="APPV" 
                    iconColor="#D32F2F" 
                  />
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Additional Metrics
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <MetricCard 
                    icon={<TrendingUpIcon fontSize="large" />}
                    value="0.9" 
                    label="PRIT" 
                    sublabel="NET PRICE" 
                    iconColor="#4CB0B0" 
                  />
                  <Divider />
                  <ProductMetricCard 
                    name="SOPHIE'S SPICY CHICKEN SANDWICH"
                    price="5,99"
                    special={true}
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Second row - Average Price by Menu Item and Order Values */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Average Price by Menu Item
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={menuItemsData}
                  margin={{ top: 20, right: 70, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" axisLine={false} tickLine={false} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    width={150}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value}`, 'Price']}
                    labelFormatter={(value) => `Item: ${value}`}
                  />
                  <Bar 
                    dataKey="price" 
                    fill="#4CB0B0" 
                    barSize={20}
                    radius={[0, 4, 4, 0]}
                    label={{ 
                      position: 'right', 
                      formatter: (value) => formatCurrency(value),
                      fill: '#333',
                      fontSize: 14
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Average Order Value
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  height: 140
                }}>
                  <Typography variant="h1" fontWeight="bold" sx={{ color: '#333' }}>
                    4,11
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Average Items per Order
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  height: 140
                }}>
                  <Typography variant="h1" fontWeight="bold" sx={{ color: '#333' }}>
                    2,7
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MenuAnalysisDashboard;
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

const MenuAnalysisDashboardtwo = () => {
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
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 2 }}>
      {/* First row - Sales per Location and Additional Metrics - REDUCED HEIGHT */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={7}>
          <Paper 
            sx={{ 
              p: 2.5, 
              borderRadius: 2, 
              height: '100%', 
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                boxShadow: '0 6px 25px rgba(0,0,0,0.1)',
                transform: 'translateY(-3px)'
              }
            }}
          >
            <Typography 
              variant="h6" 
              fontWeight="600" 
              gutterBottom
              sx={{ 
                borderBottom: '2px solid #4CB0B0',
                paddingBottom: 1,
                display: 'inline-block'
              }}
            >
              Sales per Location
            </Typography>
            <Box sx={{ height: 450 }}>  {/* Reduced from 400px to 320px */}
              <ResponsiveContainer width="100%" height="100%"  sx={{ 
          
                paddingBottom: 5,
                
              }}>
                <LineChart
                  data={continuousData}
                  margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: '#666' }}
                  />
                  <YAxis 
                    domain={[0, 20]} 
                    ticks={[0, 5, 10, 15, 20]} 
                    axisLine={false} 
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255,255,255,0.95)', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      border: 'none'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#4CB0B0" 
                    strokeWidth={3}
                    dot={{ r: 1, strokeWidth: 2, fill: 'white' }}
                    activeDot={{ r: 6, stroke: '#4CB0B0', strokeWidth: 2, fill: 'white' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Grid container spacing={2.5} height="100%">
            <Grid item xs={12}>
              <Paper 
                sx={{ 
                  p: 2.5, 
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    boxShadow: '0 6px 25px rgba(0,0,0,0.1)',
                    transform: 'translateY(-3px)'
                  }
                }}
              >
                <Typography 
                  variant="h6" 
                  fontWeight="600" 
                  gutterBottom
                  sx={{ 
                    borderBottom: '2px solid #4CB0B0',
                    paddingBottom: 1,
                    display: 'inline-block'
                  }}
                >
                  Additional Metrics
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 1 }}>
                  <MetricCard 
                    icon={<TrendingUpIcon fontSize="large" />} 
                    prefix="+" 
                    value="0.9" 
                    label="NET PRICE" 
                    sublabel="PRICE" 
                    iconColor="#4CB0B0" 
                  />
                  <Divider sx={{ opacity: 0.5 }} />
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
              <Paper 
                sx={{ 
                  p: 2.5, 
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    boxShadow: '0 6px 25px rgba(0,0,0,0.1)',
                    transform: 'translateY(-3px)'
                  }
                }}
              >
                <Typography 
                  variant="h6" 
                  fontWeight="600" 
                  gutterBottom
                  sx={{ 
                    borderBottom: '2px solid #4CB0B0',
                    paddingBottom: 1,
                    display: 'inline-block'
                  }}
                >
                  Additional Metrics
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 1 }}>
                  <MetricCard 
                    icon={<TrendingUpIcon fontSize="large" />}
                    value="0.9" 
                    label="PRIT" 
                    sublabel="NET PRICE" 
                    iconColor="#4CB0B0" 
                  />
                  <Divider sx={{ opacity: 0.5 }} />
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
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={7}>
          <Paper 
            sx={{ 
              p: 2.5, 
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                boxShadow: '0 6px 25px rgba(0,0,0,0.1)',
                transform: 'translateY(-3px)'
              }
            }}
          >
            <Typography 
              variant="h6" 
              fontWeight="600" 
              gutterBottom
              sx={{ 
                borderBottom: '2px solid #4CB0B0',
                paddingBottom: 1,
                display: 'inline-block'
              }}
            >
              Average Price by Menu Item
            </Typography>
            <Box sx={{ height: 280 }}>  {/* Reduced from 300px to 280px */}
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={menuItemsData}
                  margin={{ top: 20, right: 70, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.2} />
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
                    contentStyle={{ 
                      backgroundColor: 'rgba(255,255,255,0.95)', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      border: 'none'
                    }}
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

        {/* Order statistics cards - More modern style with centered content */}
        <Grid item xs={12} md={5}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%', 
            justifyContent: 'space-between'
          }}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={12}>  {/* Changed to full width */}
                <Paper 
                  sx={{ 
                    p: 2.5, 
                    borderRadius: 2,
                    textAlign: 'center',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      boxShadow: '0 6px 25px rgba(0,0,0,0.1)',
                      transform: 'translateY(-3px)'
                    }
                  }}
                >
                   <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    height: 77,  /* Reduced from 140px */
                    mt: 1
                  }}>
                    <Typography 
                      variant="h2" 
                      fontWeight="bold" 
                      sx={{ 
                        color: '#4CB0B0',
                        position: 'relative',
                        // '&::after': {
                        //   content: '""',
                        //   position: 'absolute',
                        //   width: '40%',
                        //   height: '4px',
                        //   backgroundColor: '#4CB0B0',
                        //   bottom: '-8px',
                        //   left: '30%',
                        //   borderRadius: '2px'
                        // }
                      }}
                    >
                     <span>$</span>4.5
                    </Typography>
                  </Box>
                  <Typography 
                    variant="h6" 
                    // fontWeight="600" 
                    gutterBottom
                    sx={{ 
                      // borderBottom: '2px solid #4CB0B0',
                      paddingBottom: 1,
                      display: 'inline-block'
                    }}
                  >
                    Average Order Value
                  </Typography>
                 
                </Paper>
              </Grid>
              <Grid item xs={12} md={12}>  {/* Changed to full width */}
                <Paper 
                  sx={{ 
                    p: 2.5, 
                    borderRadius: 2,
                    textAlign: 'center',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      boxShadow: '0 6px 25px rgba(0,0,0,0.1)',
                      transform: 'translateY(-3px)'
                    }
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    height: 77,  /* Reduced from 140px */
                    mt: 1
                  }}>
                    <Typography 
                      variant="h2" 
                      fontWeight="bold" 
                      sx={{ 
                        color: '#4CB0B0',
                        position: 'relative',
                        // '&::after': {
                        //   content: '""',
                        //   position: 'absolute',
                        //   width: '40%',
                        //   height: '4px',
                        //   backgroundColor: '#4CB0B0',
                        //   bottom: '-8px',
                        //   left: '30%',
                        //   borderRadius: '2px'
                        // }
                      }}
                    >
                      3
                    </Typography>
                  </Box>
                  <Typography 
                    variant="h6" 
                    // fontWeight="600" 
                    gutterBottom
                    sx={{ 
                      // borderBottom: '2px solid #4CB0B0',
                      paddingBottom: 1,
                      display: 'inline-block'
                    }}
                  >
                    Average Items per Order
                  </Typography>
                  
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MenuAnalysisDashboardtwo;
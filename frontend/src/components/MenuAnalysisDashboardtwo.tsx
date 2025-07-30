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
<<<<<<< HEAD

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
=======
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';

// Interface for the product mix data
interface ProductMixData {
  table1?: Array<{
    net_sales?: number[];
    orders?: number[];
    qty_sold?: number[];
    average_order_value?: number[];
    average_items_per_order?: number[];
    unique_orders?: number[];
    total_quantity?: number[];
  }>;
  table2?: Array<{
    Category: string;
    Sales: number;
    Percentage: number;
  }>;
  table3?: Array<{
    'Menu Group': string;
    Sales: number;
  }>;
  table4?: Array<{
    Server: string;
    Sales: number;
  }>;
  table5?: Array<{
    Item: string;
    Server: string;
    Quantity: number;
    Sales: number;
  }>;
  table6?: Array<{
    Location: string;
    Sales: number;
  }>;
  table7?: Array<{
    'Menu Item': string;
    Price: number;
  }>;
  table8?: Array<{
    Item: string;
    Change: number;
    Direction: string;
    Category: string;
  }>;
  table9?: Array<{
    Item: string;
    Price: number;
  }>;
  servers?: string[];
  categories?: string[];
  locations?: string[];
}

interface MenuAnalysisDashboardtwoProps {
  productMixData?: ProductMixData;
}

const MenuAnalysisDashboardtwo: React.FC<MenuAnalysisDashboardtwoProps> = ({ productMixData }) => {
  const theme = useTheme();

  // Extract real data from backend
  const summaryData = productMixData?.table1?.[0] || {};
  const locationData = productMixData?.table6 || [];
  const menuItemsData = productMixData?.table7 || [];
  const performanceData = productMixData?.table8 || [];
  const itemPricesData = productMixData?.table9 || [];
  const topSellingItemsData = productMixData?.table5 || [];

  // Get average order value and items per order from summary
  const averageOrderValue = summaryData.average_order_value?.[0] || 0;
  const averageItemsPerOrder = summaryData.average_items_per_order?.[0] || 0;

  // Transform location data for line chart (Sales per Location)
  const transformLocationData = () => {
    if (!locationData || locationData.length === 0) {
      return [
        { name: 'No Location Data', value: 0 }
      ];
    }

    // Create a line chart with location sales data
    const baseData = locationData.map(item => ({
      name: item.Location || 'Unknown',
      value: Math.round((item.Sales || 0) / 1000) // Convert to thousands
    }));

    // Add trend points if we have multiple locations
    if (baseData.length > 1) {
      const interpolatedData = [];
      baseData.forEach((point, index) => {
        interpolatedData.push(point);
        if (index < baseData.length - 1) {
          const nextPoint = baseData[index + 1];
          const avgValue = (point.value + nextPoint.value) / 2;
          interpolatedData.push({ name: '', value: avgValue });
        }
      });
      return interpolatedData;
    }

    return baseData;
  };

  const locationSalesData = transformLocationData();

  // Transform menu items data for bar chart (Price by Menu Item)
  const transformMenuItemsData = () => {
    if (!menuItemsData || menuItemsData.length === 0) {
      return [
        { name: 'No Menu Data', price: 0 }
      ];
    }

    return menuItemsData.map(item => ({
      name: item['Menu Item'] || 'Unknown Item',
      price: (item.Price || 0) / 100 // Convert cents to dollars
    }));
  };

  const menuItemsPriceData = transformMenuItemsData();

  // Get performance metrics from table8
  const getPerformanceMetrics = () => {
    if (!performanceData || performanceData.length === 0) {
      return [
        {
          icon: <TrendingUpIcon fontSize="large" />,
          value: '0.00',
          label: 'NO DATA',
          sublabel: 'AVAILABLE',
          iconColor: '#4CB0B0',
          prefix: ''
        }
      ];
    }

    const metrics = [];
    
    performanceData.forEach(item => {
      if (item.Direction === 'up') {
        metrics.push({
          icon: <TrendingUpIcon fontSize="large" />,
          value: Math.abs(item.Change || 0).toFixed(2),
          label: item.Item || 'Unknown',
          sublabel: item.Category || 'METRIC',
          iconColor: '#4CB0B0',
          prefix: '+'
        });
      } else if (item.Direction === 'down') {
        metrics.push({
          icon: <TrendingDownIcon fontSize="large" />,
          value: Math.abs(item.Change || 0).toFixed(2),
          label: item.Item || 'Unknown',
          sublabel: item.Category || 'METRIC',
          iconColor: '#D32F2F',
          prefix: '-'
        });
      }
    });

    return metrics.length > 0 ? metrics : [
      {
        icon: <TrendingUpIcon fontSize="large" />,
        value: '0.00',
        label: 'NO CHANGES',
        sublabel: 'DETECTED',
        iconColor: '#4CB0B0',
        prefix: ''
      }
    ];
  };

  const performanceMetrics = getPerformanceMetrics();

  // Get special product highlight from highest selling item
  const getSpecialProduct = () => {
    if (!topSellingItemsData || topSellingItemsData.length === 0) {
      return {
        name: 'No Items Available',
        price: '0.00'
      };
    }

    // Find the item with highest sales value
    const topItem = topSellingItemsData
      .filter(item => (item.Sales || 0) > 0)
      .sort((a, b) => (b.Sales || 0) - (a.Sales || 0))[0];
    
    if (!topItem) {
      return {
        name: 'No Sales Data',
        price: '0.00'
      };
    }

    return {
      name: topItem.Item || 'Unknown Item',
      price: ((topItem.Sales || 0) / 100).toFixed(2) // Convert cents to dollars
    };
  };

  const specialProduct = getSpecialProduct();

  // Format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
>>>>>>> integrations_v41
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
<<<<<<< HEAD
          <PercentIcon />
=======
          <RestaurantMenuIcon />
>>>>>>> integrations_v41
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
<<<<<<< HEAD
            {price}
=======
            ${price}
>>>>>>> integrations_v41
          </Typography>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 2 }}>
<<<<<<< HEAD
      {/* First row - Sales per Location and Additional Metrics - REDUCED HEIGHT */}
=======
      {/* First row - Sales per Location and Additional Metrics */}
>>>>>>> integrations_v41
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
<<<<<<< HEAD
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
=======
            <Box sx={{ height: 450 }}>
              <ResponsiveContainer width="100%" height="100%" sx={{ paddingBottom: 5 }}>
                {locationSalesData.length > 0 && locationSalesData[0].value > 0 ? (
                  <LineChart
                    data={locationSalesData}
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
                      formatter={(value) => [`${value}k`, 'Sales']}
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
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '100%',
                    color: '#666',
                    fontSize: '16px'
                  }}>
                    No location data available
                  </Box>
                )}
>>>>>>> integrations_v41
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
<<<<<<< HEAD
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
=======
                  Performance Metrics
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 1 }}>
                  {performanceMetrics.slice(0, 2).map((metric, index) => (
                    <React.Fragment key={index}>
                      <MetricCard 
                        icon={metric.icon}
                        prefix={metric.prefix}
                        value={metric.value}
                        label={metric.label}
                        sublabel={metric.sublabel}
                        iconColor={metric.iconColor}
                      />
                      {index === 0 && performanceMetrics.length > 1 && <Divider sx={{ opacity: 0.5 }} />}
                    </React.Fragment>
                  ))}
                  {performanceMetrics.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                      No performance metrics available
                    </Typography>
                  )}
>>>>>>> integrations_v41
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
<<<<<<< HEAD
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
=======
                  Top Selling Item
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 1 }}>
                  {performanceMetrics.slice(2, 3).map((metric, index) => (
                    <MetricCard 
                      key={index}
                      icon={metric.icon}
                      value={metric.value}
                      label={metric.label}
                      sublabel={metric.sublabel}
                      iconColor={metric.iconColor}
                    />
                  ))}
                  {performanceMetrics.length <= 2 && <Divider sx={{ opacity: 0.5 }} />}
                  {specialProduct ? (
                    <ProductMetricCard 
                      name={specialProduct.name}
                      price={specialProduct.price}
                      special={true}
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No featured items available
                    </Typography>
                  )}
>>>>>>> integrations_v41
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

<<<<<<< HEAD
      {/* Second row - Average Price by Menu Item and Order Values */}
=======
      {/* Second row - Menu Item Prices and Order Values */}
>>>>>>> integrations_v41
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
<<<<<<< HEAD
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
=======
              Menu Item Prices
            </Typography>
            <Box sx={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                {menuItemsPriceData.length > 0 && menuItemsPriceData[0].price > 0 ? (
                  <BarChart
                    layout="vertical"
                    data={menuItemsPriceData}
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
                      formatter={(value) => [`${value.toFixed(2)}`, 'Price']}
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
                        formatter: (value) => `${value.toFixed(2)}`,
                        fill: '#333',
                        fontSize: 14
                      }}
                    />
                  </BarChart>
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '100%',
                    color: '#666',
                    fontSize: '16px'
                  }}>
                    No menu items data available
                  </Box>
                )}
>>>>>>> integrations_v41
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

<<<<<<< HEAD
        {/* Order statistics cards - More modern style with centered content */}
=======
        {/* Order statistics cards */}
>>>>>>> integrations_v41
        <Grid item xs={12} md={5}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%', 
            justifyContent: 'space-between'
          }}>
            <Grid container spacing={2.5}>
<<<<<<< HEAD
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
=======
              <Grid item xs={12} md={12}>
>>>>>>> integrations_v41
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
<<<<<<< HEAD
                    height: 77,  /* Reduced from 140px */
=======
                    height: 77,
>>>>>>> integrations_v41
                    mt: 1
                  }}>
                    <Typography 
                      variant="h2" 
                      fontWeight="bold" 
                      sx={{ 
                        color: '#4CB0B0',
                        position: 'relative',
<<<<<<< HEAD
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
=======
                      }}
                    >
                      {formatCurrency(averageOrderValue)}
                    </Typography>
                  </Box>
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{ 
                      paddingBottom: 1,
                      display: 'inline-block'
                    }}
                  >
                    Average Order Value
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={12}>
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
                    height: 77,
                    mt: 1
                  }}>
                    <Typography 
                      variant="h2" 
                      fontWeight="bold" 
                      sx={{ 
                        color: '#4CB0B0',
                        position: 'relative',
                      }}
                    >
                      {Math.round(averageItemsPerOrder)}
>>>>>>> integrations_v41
                    </Typography>
                  </Box>
                  <Typography 
                    variant="h6" 
<<<<<<< HEAD
                    // fontWeight="600" 
                    gutterBottom
                    sx={{ 
                      // borderBottom: '2px solid #4CB0B0',
=======
                    gutterBottom
                    sx={{ 
>>>>>>> integrations_v41
                      paddingBottom: 1,
                      display: 'inline-block'
                    }}
                  >
                    Average Items per Order
                  </Typography>
<<<<<<< HEAD
                  
=======
>>>>>>> integrations_v41
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
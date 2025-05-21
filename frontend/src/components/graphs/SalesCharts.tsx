import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import RefreshIcon from '@mui/icons-material/Refresh';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

const API_URL = 'http://localhost:8000/api/excel/analytics';

const SalesCharts = ({ fileName, dateRangeType, selectedLocation }) => {
  // State for analytics data
  const [analyticsData, setAnalyticsData] = useState({
    salesByWeek: [],
    salesByDayOfWeek: [],
    salesByTimeOfDay: [],
    salesByCategory: []
  });
  
  // State for loading, error, and fetch status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasFetched, setHasFetched] = useState(false);
  
  // Memoized fetch function to prevent unnecessary re-renders
  const fetchAnalyticsData = useCallback(async () => {
    if (!fileName) {
      setError('No file selected. Please upload a file first.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Prepare request payload
      const payload = {
        fileName: fileName,
        dateRangeType: dateRangeType,
        location: selectedLocation
      };
      
      console.log('Fetching analytics with payload:', payload);
      
      // Make API call to backend
      const response = await axios.post(API_URL, payload);
      
      // Process the response
      if (response.data) {
        console.log('Received analytics data:', response.data);
        setAnalyticsData(response.data);
        setHasFetched(true);
      } else {
        throw new Error('Invalid response data');
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      
      let errorMessage = 'Error fetching analytics data';
      
      if (axios.isAxiosError(err)) {
        if (err.response) {
          const detail = err.response.data?.detail;
          errorMessage = `Server error: ${detail || err.response.status}`;
        } else if (err.request) {
          errorMessage = 'No response from server. Please check if the backend is running.';
        }
      } else if (err.message) {
        errorMessage = `Error: ${err.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fileName, dateRangeType, selectedLocation]);
  
  // Fetch analytics data when component mounts or when filters change
  useEffect(() => {
    if (fileName) {
      console.log('SalesCharts - Fetching data with:', { fileName, dateRangeType, selectedLocation });
      fetchAnalyticsData();
    }
  }, [fetchAnalyticsData]);
  
  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #ccc',
          padding: '10px',
          borderRadius: '5px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ margin: 0, color: entry.color }}>
              {`${entry.name}: $${parseFloat(entry.value).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  // Format currency for axis labels
  const formatCurrency = (value) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`;
    }
    return `$${value}`;
  };
  
  // Render bar chart
  const renderBarChart = (data, dataKey, valueKey, label, height = 250) => {
    // Safety check - make sure data is an array
    const safeData = Array.isArray(data) ? data : [];
    
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={safeData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey={dataKey}
            tickSize={5}
            axisLine={{ stroke: '#E0E0E0' }}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            tickCount={5}
            tick={{ fontSize: 12 }}
            tickFormatter={formatCurrency}
            domain={[0, 'auto']}
            axisLine={{ stroke: '#E0E0E0' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey={valueKey} 
            fill="#4B79FF" 
            name={label}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    );
  };
  
  // Render stacked bar chart for categories
  const renderStackedBarChart = (data, height = 300) => {
    // Safety check - make sure data is an array
    const safeData = Array.isArray(data) ? data : [];
    
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={safeData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="week"
            tickSize={5}
            axisLine={{ stroke: '#E0E0E0' }}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            tickCount={5}
            tick={{ fontSize: 12 }}
            tickFormatter={formatCurrency}
            domain={[0, 'auto']}
            axisLine={{ stroke: '#E0E0E0' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="inHouse" stackId="a" fill="#4B79FF" name="In-House" />
          <Bar dataKey="catering" stackId="a" fill="#FF4B4B" name="Catering" />
          <Bar dataKey="doordash" stackId="a" fill="#7F4BFF" name="DoorDash" />
          <Bar dataKey="grubhub" stackId="a" fill="#4BFF9F" name="GrubHub" />
          <Bar dataKey="uber" stackId="a" fill="#FFC04B" name="UberEats" />
          <Bar dataKey="firstParty" stackId="a" fill="#FF9F4B" name="First Party" />
        </BarChart>
      </ResponsiveContainer>
    );
  };
  
  // Dynamic chart title based on date range
  const getChartTitle = () => {
    if (!dateRangeType) return "Sales by Week";
    
    // if (dateRangeType.includes("7 Days")) return "Sales - Last 7 Days";
    if (dateRangeType.includes("30 Days")) return "Sales - Last 30 Days";
    if (dateRangeType.includes("Month")) return "Sales by Week - Monthly View";
    if (dateRangeType.includes("Custom")) return "Sales - Custom Period";
    
    return "Sales by Week";
  };
  
  // Title for day of week chart based on date range
  const getDayOfWeekTitle = () => {
    if (!dateRangeType) return "Sales by Day of Week";
    
    // if (dateRangeType.includes("7 Days")) return "Daily Sales - Last 7 Days";s
    if (dateRangeType.includes("30 Days")) return "Average Sales by Day of Week - Last 30 Days";
    if (dateRangeType.includes("Month")) return "Average Sales by Day of Week - Monthly";
    if (dateRangeType.includes("3 Months")) return "Total Sales by Day of Week - Last 3 Months";
    
    return "Sales by Day of Week";
  };
  
  // Style definitions
  const chartContainerStyle = {
    margin: 0,
    padding: 0
  };
  
  const chartCardStyle = {
    marginBottom: '24px', 
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'
  };
  
  const chartHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #eee',
    padding: '16px 20px'
  };
  
  const chartContentStyle = {
    padding: '20px'
  };
  
  const chartRowStyle = {
    display: 'flex', 
    flexWrap: 'wrap', 
    margin: '-12px'
  };
  
  const chartColumnStyle = {
    flex: '1 1 100%', 
    minWidth: '300px',
    padding: '12px',
    boxSizing: 'border-box'
  };
  
  // If there's no file uploaded yet
  if (!fileName) {
    return (
      <Box sx={chartContainerStyle}>
        <Alert severity="info">
          Please upload and process an Excel file to view sales analytics.
        </Alert>
      </Box>
    );
  }
  
  // If data is loading
  if (loading) {
    return (
      <Box sx={chartContainerStyle} display="flex" justifyContent="center" alignItems="center" height="200px">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>Loading sales analytics...</Typography>
      </Box>
    );
  }
  
  // If there's an error
  if (error) {
    return (
      <Box sx={chartContainerStyle}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={fetchAnalyticsData}>
              <RefreshIcon fontSize="small" sx={{ mr: 1 }} />
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }
  
  // If no data has been fetched yet or empty data was returned
  if (!hasFetched || 
      (analyticsData.salesByWeek.length === 0 && 
       analyticsData.salesByDayOfWeek.length === 0)) {
    return (
      <Box sx={chartContainerStyle}>
        <Alert severity="info">
          No sales data available for the selected filters. Try adjusting your filters or uploading a different file.
        </Alert>
      </Box>
    );
  }
  
  // Render the charts with data
  return (
    <Box sx={chartContainerStyle} className="sales-charts-root">
      {/* Sales by Week Chart */}
      <Card sx={chartCardStyle}>
        <Box sx={chartHeaderStyle}>
          <Typography variant="h6" fontWeight={600} color="#333">
            {getChartTitle()}
          </Typography>
          <Button 
            size="small" 
            onClick={fetchAnalyticsData}
            startIcon={<RefreshIcon />}
          >
            Refresh
          </Button>
        </Box>
        <CardContent sx={chartContentStyle}>
          {analyticsData.salesByWeek.length > 0 ? (
            renderBarChart(analyticsData.salesByWeek, 'week', 'value', 'Sales', 300)
          ) : (
            <Typography color="text.secondary">No weekly data available</Typography>
          )}
        </CardContent>
      </Card>
      
      {/* Stacked Categories Chart */}
      {/* <Card sx={chartCardStyle}>
        <Box sx={chartHeaderStyle}>
          <Typography variant="h6" fontWeight={600} color="#333">
            Sales by Category
          </Typography>
        </Box>
        <CardContent sx={chartContentStyle}>
          {analyticsData.salesByCategory.length > 0 ? (
            renderStackedBarChart(analyticsData.salesByCategory, 350)
          ) : (
            <Typography color="text.secondary">No category data available</Typography>
          )}
        </CardContent>
      </Card> */}
      
      {/* Two-column layout for day of week and time of day */}
      <Box sx={chartRowStyle}>
        {/* Day of Week Chart */}
        <Box sx={{...chartColumnStyle, flex: '1 1 50%'}}>
          <Card sx={chartCardStyle}>
            <Box sx={chartHeaderStyle}>
              <Typography variant="h6" fontWeight={600} color="#333">
                {getDayOfWeekTitle()}
              </Typography>
            </Box>
            <CardContent sx={chartContentStyle}>
              {analyticsData.salesByDayOfWeek.length > 0 ? (
                renderBarChart(analyticsData.salesByDayOfWeek, 'day', 'value', 'Sales')
              ) : (
                <Typography color="text.secondary">No day of week data available</Typography>
              )}
            </CardContent>
          </Card>
        </Box>
        
        {/* Time of Day Chart */}
        <Box sx={{...chartColumnStyle, flex: '1 1 50%'}}>
          <Card sx={chartCardStyle}>
            <Box sx={chartHeaderStyle}>
              <Typography variant="h6" fontWeight={600} color="#333">
                Sales by Time of Day
              </Typography>
            </Box>
            <CardContent sx={chartContentStyle}>
              {analyticsData.salesByTimeOfDay.length > 0 ? (
                renderBarChart(analyticsData.salesByTimeOfDay, 'hour', 'value', 'Sales')
              ) : (
                <Typography color="text.secondary">No time of day data available</Typography>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};
export default SalesCharts;
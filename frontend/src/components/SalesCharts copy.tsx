import React, { useEffect, useState } from 'react';
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

const SalesCharts = (props) => {
  // Add safe default handling
  const { tableData, dateRangeType } = props || {};
  const safeTableData = tableData || {};
  const table1 = safeTableData.table1 || [];
  
  // State for storing processed chart data
  const [chartData, setChartData] = useState({
    weeklyData: [],
    dayOfWeekData: [],
    timeOfDayData: []
  });

  // Process data when tableData changes
  useEffect(() => {
    if (table1 && table1.length > 0) {
      // Process the data based on the table1 data and filter selections
      const weeklyData = processWeeklyData(table1);
      const dayOfWeekData = processDayOfWeekData(table1);
      const timeOfDayData = processTimeOfDayData(table1);
      
      setChartData({
        weeklyData,
        dayOfWeekData,
        timeOfDayData
      });
    }
  }, [table1, dateRangeType]);
  
  // Helper function to parse currency values
  const parseCurrencyValue = (value) => {
    if (!value || value === '####') return 0;
    if (typeof value === 'string' && value.includes('$')) {
      return parseFloat(value.replace('$', '').replace(/,/g, ''));
    }
    return parseFloat(value);
  };
  
  // Process data for weekly sales chart
  const processWeeklyData = (data) => {
    if (!data || data.length === 0) {
      return [];
    }
    
    // Sort data by week number
    const sortedData = [...data].sort((a, b) => a.Week - b.Week);
    
    // Generate the chart data
    return sortedData.map(weekData => {
      // Parse Grand Total value
      const total = parseCurrencyValue(weekData['Grand Total']);
      
      // Set labels based on date range type
      let label = `Week ${weekData.Week}`;
      if (dateRangeType && dateRangeType.includes('Month')) {
        // For monthly views, show Week X (Month)
        label = `Week ${weekData.Week % 4 || 4}`;
      }
      
      return {
        week: label,
        value: total,
        // Parse individual category values for potential use in stacked charts
        inHouse: parseCurrencyValue(weekData['In-House']),
        catering: parseCurrencyValue(weekData['Catering']),
        doordash: parseCurrencyValue(weekData['DD']),
        grubhub: parseCurrencyValue(weekData['GH']),
        uber: parseCurrencyValue(weekData['UB'])
      };
    });
  };
  
  // Process data for day of week chart
  // In a real app, this would use actual daily data from your backend
  const processDayOfWeekData = (data) => {
    if (!data || data.length === 0) {
      return getDefaultDayOfWeekData();
    }
    
    // Since we don't have actual day-of-week data in the sample data,
    // we'll create a realistic distribution based on the total sales
    // In a real app, you would fetch this data from your backend
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    // Calculate average total sales from table data
    const totalSales = data.reduce((sum, row) => {
      return sum + parseCurrencyValue(row['Grand Total'] || 0);
    }, 0);
    
    const avgDailySales = totalSales / (data.length * 7); // Assume weeks have 7 days
    
    // Create realistic distribution - normally this would come from actual data
    // This is just an estimate based on typical restaurant patterns
    const dayDistribution = [0.9, 1.0, 1.1, 1.3, 1.5, 1.2, 0.6]; 
    
    return daysOfWeek.map((day, index) => ({
      day,
      value: Math.round(avgDailySales * dayDistribution[index])
    }));
  };
  
  // Process data for time of day chart
  const processTimeOfDayData = (data) => {
    if (!data || data.length === 0) {
      return getDefaultTimeOfDayData();
    }
    
    // Since we don't have actual hourly data in the sample data,
    // we'll create a realistic distribution based on the total sales
    // In a real app, you would fetch this data from your backend
    const hoursOfDay = ['6 AM', '8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM', '10 PM'];
    
    // Calculate average total sales from table data
    const totalSales = data.reduce((sum, row) => {
      return sum + parseCurrencyValue(row['Grand Total'] || 0);
    }, 0);
    
    const avgHourlySales = totalSales / (data.length * 24); // Assume 24 hours per day
    
    // Create realistic distribution for a typical restaurant
    // This is just an estimate based on typical patterns
    const hourDistribution = [0.2, 0.5, 1.0, 2.5, 1.8, 1.2, 2.0, 1.5, 0.8];
    
    return hoursOfDay.map((hour, index) => ({
      hour,
      value: Math.round(avgHourlySales * hourDistribution[index])
    }));
  };
  
  // Default day of week data
  const getDefaultDayOfWeekData = () => [
    { day: 'Mon', value: 500 },
    { day: 'Tue', value: 800 },
    { day: 'Wed', value: 1000 },
    { day: 'Thu', value: 1200 },
    { day: 'Fri', value: 1500 },
    { day: 'Sat', value: 1200 },
    { day: 'Sun', value: 600 }
  ];
  
  // Default time of day data
  const getDefaultTimeOfDayData = () => [
    { hour: '6 AM', value: 100 },
    { hour: '8 AM', value: 250 },
    { hour: '10 AM', value: 500 },
    { hour: '12 PM', value: 1250 },
    { hour: '2 PM', value: 900 },
    { hour: '4 PM', value: 600 },
    { hour: '6 PM', value: 1000 },
    { hour: '8 PM', value: 750 },
    { hour: '10 PM', value: 400 }
  ];
  
  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #ccc',
          padding: '10px',
          borderRadius: '5px'
        }}>
          <p style={{ margin: 0 }}>{`${label}: $${payload[0].value.toLocaleString()}`}</p>
        </div>
      );
    }
    return null;
  };
  
  // Render custom Recharts bar chart
  const renderBarChart = (data, dataKey = 'week', valueKey = 'value', label, height = 250) => {
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
            tickFormatter={(value) => `$${value.toLocaleString()}`}
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
            tickFormatter={(value) => `$${value.toLocaleString()}`}
            domain={[0, 'auto']}
            axisLine={{ stroke: '#E0E0E0' }}
          />
          <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
          <Legend />
          <Bar dataKey="inHouse" stackId="a" fill="#4B79FF" name="In-House" />
          <Bar dataKey="catering" stackId="a" fill="#FF4B4B" name="Catering" />
          <Bar dataKey="doordash" stackId="a" fill="#7F4BFF" name="DoorDash" />
          <Bar dataKey="grubhub" stackId="a" fill="#4BFF9F" name="GrubHub" />
          <Bar dataKey="uber" stackId="a" fill="#FFC04B" name="UberEats" />
        </BarChart>
      </ResponsiveContainer>
    );
  };
  
  // Dynamic chart title based on date range
  const getChartTitle = () => {
    if (!dateRangeType) return "Sales by Week";
    
    if (dateRangeType.includes("7 Days")) return "Sales - Last 7 Days";
    if (dateRangeType.includes("30 Days")) return "Sales - Last 30 Days";
    if (dateRangeType.includes("Month")) return "Sales by Week - Monthly View";
    if (dateRangeType.includes("Custom")) return "Sales - Custom Period";
    
    return "Sales by Week";
  };
  
  // Define styles
  const chartContainerStyle = {
    marginBottom: '32px', 
    marginTop: '16px'
  };
  
  const chartCardStyle = {
    padding: '20px', 
    marginBottom: '24px', 
    backgroundColor: 'white', 
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'
  };
  
  const chartHeaderStyle = {
    marginBottom: '16px', 
    fontSize: '18px', 
    fontWeight: 600,
    marginTop: 0,
    color: '#333'
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
  
  // Handle empty data scenario
  if (table1.length === 0) {
    return (
      <div style={chartContainerStyle}>
        <div style={chartCardStyle}>
          <h6 style={chartHeaderStyle}>No Data Available</h6>
          <p>Please upload and process an Excel file to view sales analytics.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div style={chartContainerStyle}>
      {/* Sales by Week Chart */}
      <div style={chartCardStyle}>
        <h6 style={chartHeaderStyle}>
          {getChartTitle()}
        </h6>
        {renderBarChart(chartData.weeklyData, 'week', 'value', 'Sales', 300)}
      </div>
      
      {/* Stacked Categories Chart */}
      <div style={chartCardStyle}>
        <h6 style={chartHeaderStyle}>
          Sales by Category
        </h6>
        {renderStackedBarChart(chartData.weeklyData, 350)}
      </div>
      
      {/* Two-column layout for day of week and time of day */}
      <div style={chartRowStyle}>
        {/* Day of Week Chart */}
        <div style={{...chartColumnStyle, flex: '1 1 50%'}}>
          <div style={chartCardStyle}>
            <h6 style={chartHeaderStyle}>
              Sales by Day of Week
            </h6>
            {renderBarChart(chartData.dayOfWeekData, 'day', 'value', 'Sales')}
          </div>
        </div>
        
        {/* Time of Day Chart */}
        <div style={{...chartColumnStyle, flex: '1 1 50%'}}>
          <div style={chartCardStyle}>
            <h6 style={chartHeaderStyle}>
              Sales by Time of Day
            </h6>
            {renderBarChart(chartData.timeOfDayData, 'hour', 'value', 'Sales')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesCharts;
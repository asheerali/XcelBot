// src/components/graphs/SalesChart.tsx - Updated to use lines instead of bars

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Box, Typography, Paper } from '@mui/material';

interface SalesChartProps {
  data: any[]; // table2 data (Day of week SALES) from financial backend
}

const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
  // Transform table2 data for sales chart
  const transformDataForChart = () => {
    if (!data || data.length === 0) {
      return [];
    }

    // Filter out Grand Total row and transform data
    return data
      .filter(row => !row['Day of the Week']?.includes('Grand Total'))
      .map(row => {
        const dayOfWeek = row['Day of the Week'] || row['Day of The Week'] || '';
        // Helper function to safely parse values that might be strings or numbers
        const parseValue = (value: any) => {
          if (typeof value === 'number') return value;
          if (typeof value === 'string') return parseFloat(value.replace(/[$,%]/g, ''));
          return 0;
        };

        const twSales = parseValue(row['Tw Sales']) || 0;
        const lwSales = parseValue(row['Lw Sales']) || 0;
        const lySales = parseValue(row['Ly Sales']) || 0;
        const twLwChange = parseValue(row['Tw/Lw (+/-)']) || 0;
        const twLyChange = parseValue(row['Tw/Ly (+/-)']) || 0;

        // Extract day name from format "1 - Monday"
        const dayName = dayOfWeek.split(' - ')[1] || dayOfWeek;
        
        return {
          day: dayName,
          fullDay: dayOfWeek,
          thisWeek: twSales / 1000, // Convert to thousands for better chart readability
          lastWeek: lwSales / 1000,
          lastYear: lySales / 1000,
          twLwChange: twLwChange,
          twLyChange: twLyChange,
          // Format display values
          displayThisWeek: formatCurrency(twSales),
          displayLastWeek: formatCurrency(lwSales),
          displayLastYear: formatCurrency(lySales),
          displayTwLwChange: `${twLwChange >= 0 ? '+' : ''}${twLwChange.toFixed(2)}%`,
          displayTwLyChange: `${twLyChange >= 0 ? '+' : ''}${twLyChange.toFixed(2)}%`
        };
      });
  };

  // Helper function to format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Paper sx={{ p: 2, boxShadow: 3, maxWidth: 250 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            {data.fullDay}
          </Typography>
          <Typography variant="body2" sx={{ color: '#1976d2' }}>
            This Week: {data.displayThisWeek}
          </Typography>
          <Typography variant="body2" sx={{ color: '#9c27b0' }}>
            Last Week: {data.displayLastWeek}
          </Typography>
          <Typography variant="body2" sx={{ color: '#ff9800' }}>
            Last Year: {data.displayLastYear}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: data.twLwChange >= 0 ? '#2e7d32' : '#d32f2f',
              fontWeight: 'bold'
            }}
          >
            WoW Change: {data.displayTwLwChange}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: data.twLyChange >= 0 ? '#2e7d32' : '#d32f2f',
              fontWeight: 'bold'
            }}
          >
            YoY Change: {data.displayTwLyChange}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  const chartData = transformDataForChart();

  if (chartData.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Daily Sales Trends
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          No sales data available
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, boxShadow: 2, borderRadius: 2 }}>
      <Typography 
        variant="h6" 
        sx={{ mb: 2, textAlign: 'center', fontWeight: 600 }}
      >
        Daily Sales Performance
      </Typography>
      
      <Box sx={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="day" 
              fontSize={12}
              tick={{ fill: '#666' }}
            />
            <YAxis 
              fontSize={12}
              tick={{ fill: '#666' }}
              label={{ value: 'Sales ($K)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {/* This Week Line - Blue solid line with circles */}
            <Line 
              type="monotone" 
              dataKey="thisWeek" 
              name="This Week"
              stroke="#1976d2" 
              strokeWidth={3}
              dot={{ fill: '#1976d2', strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, stroke: '#1976d2', strokeWidth: 2, fill: '#fff' }}
            />
            
            {/* Last Week Line - Purple solid line with circles */}
            <Line 
              type="monotone" 
              dataKey="lastWeek" 
              name="Last Week"
              stroke="#9c27b0" 
              strokeWidth={3}
              dot={{ fill: '#9c27b0', strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, stroke: '#9c27b0', strokeWidth: 2, fill: '#fff' }}
            />
            
            {/* Last Year Line - Orange dashed line with circles */}
            <Line 
              type="monotone" 
              dataKey="lastYear" 
              name="Last Year"
              stroke="#ff9800" 
              strokeWidth={3}
              strokeDasharray="8 4"
              dot={{ fill: '#ff9800', strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, stroke: '#ff9800', strokeWidth: 2, fill: '#fff' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
      
      {/* Daily performance summary */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, textAlign: 'center' }}>
          Week-over-Week Performance by Day
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
          {chartData.map((item, index) => (
            <Box 
              key={index} 
              sx={{ 
                textAlign: 'center', 
                minWidth: 80,
                p: 1,
                borderRadius: 1,
                backgroundColor: item.twLwChange >= 0 ? '#e8f5e8' : '#ffeaea'
              }}
            >
              <Typography variant="caption" display="block">
                {item.day}
              </Typography>
              <Typography 
                variant="body2" 
                fontWeight="bold"
                sx={{ 
                  color: item.twLwChange >= 0 ? '#2e7d32' : '#d32f2f'
                }}
              >
                {item.displayTwLwChange}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
};

export default SalesChart;
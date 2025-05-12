import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const SalesChart = () => {
  const data = [
    { day: '1 - Monday', twSales: 78342, lwSales: 73538, lySales: 204935 },
    { day: '2 - Tuesday', twSales: 136646, lwSales: 139080, lySales: 383819 },
    { day: '3 - Wednesday', twSales: 154380, lwSales: 154380, lySales: 419204 },
    { day: '4 - Thursday', twSales: 142480, lwSales: 142480, lySales: 395944 },
    { day: '5 - Friday', twSales: 80651, lwSales: 80651, lySales: 223736 },
    { day: '6 - Saturday', twSales: 834, lwSales: 834, lySales: 60192 },
    { day: '7 - Sunday', twSales: 1208, lwSales: 1208, lySales: 45003 }
  ];

  const formatYAxis = (value) => {
    return value.toLocaleString();
  };

  return (
    <Paper sx={{ p: 2, height: '400px' }}>
      <Typography 
        variant="h5" 
        sx={{ mb: 2, textAlign: 'center', fontWeight: 'bold', color: '#666' }}
      >
        Sales
      </Typography>
      <Box sx={{ height: '350px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 30, left: 20, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="day" 
              angle={0}
              textAnchor="middle"
              style={{ fontSize: '13px', fontWeight: '600' }}
            />
            <YAxis 
              tickFormatter={formatYAxis}
              style={{ fontSize: '13px', fontWeight: '600' }}
              domain={[0, 500000]}
              ticks={[0, 100000, 200000, 300000, 400000, 500000]}
            />
            <Tooltip 
              formatter={(value) => value.toLocaleString()}
              labelStyle={{ color: '#000' }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '14px', fontWeight: '600' }}
              iconType="circle"
            />
            <Line 
              type="monotone" 
              dataKey="twSales" 
              stroke="#4285F4" 
              strokeWidth={3}
              dot={{ fill: '#4285F4', r: 6 }}
              name="Tw Sales"
            />
            <Line 
              type="monotone" 
              dataKey="lwSales" 
              stroke="#EA4335" 
              strokeWidth={3}
              dot={{ fill: '#EA4335', r: 6 }}
              name="Lw Sales"
            />
            <Line 
              type="monotone" 
              dataKey="lySales" 
              stroke="#FBBC04" 
              strokeWidth={3}
              dot={{ fill: '#FBBC04', r: 6 }}
              name="Ly Sales"
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default SalesChart;
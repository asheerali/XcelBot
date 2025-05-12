import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const OrdersChart = () => {
  const data = [
    { day: '1 - Monday', twOrders: 3328, lwOrders: 3328, lyOrders: 10238 },
    { day: '2 - Tuesday', twOrders: 5020, lwOrders: 5020, lyOrders: 15017 },
    { day: '3 - Wednesday', twOrders: 5025, lwOrders: 5025, lyOrders: 15688 },
    { day: '4 - Thursday', twOrders: 5362, lwOrders: 5362, lyOrders: 15246 },
    { day: '5 - Friday', twOrders: 3427, lwOrders: 3427, lyOrders: 9603 },
    { day: '6 - Saturday', twOrders: 2, lwOrders: 2, lyOrders: 3060 },
    { day: '7 - Sunday', twOrders: 1, lwOrders: 1, lyOrders: 2349 }
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
        Orders
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
              domain={[0, 20000]}
              ticks={[0, 5000, 10000, 15000, 20000]}
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
              dataKey="twOrders" 
              stroke="#4285F4" 
              strokeWidth={3}
              dot={{ fill: '#4285F4', r: 6 }}
              name="Tw Orders"
            />
            <Line 
              type="monotone" 
              dataKey="lwOrders" 
              stroke="#EA4335" 
              strokeWidth={3}
              dot={{ fill: '#EA4335', r: 6 }}
              name="Lw Orders"
            />
            <Line 
              type="monotone" 
              dataKey="lyOrders" 
              stroke="#FBBC04" 
              strokeWidth={3}
              dot={{ fill: '#FBBC04', r: 6 }}
              name="Ly Orders"
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default OrdersChart;
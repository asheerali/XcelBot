import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const AvgTicketChart = () => {
  const data = [
    { day: '1 - Monday', twAvgTckt: 400.75, lwAvgTckt: 400.75, lyAvgTckt: 981.27 },
    { day: '2 - Tuesday', twAvgTckt: 464.78, lwAvgTckt: 464.78, lyAvgTckt: 1336.11 },
    { day: '3 - Wednesday', twAvgTckt: 488.08, lwAvgTckt: 488.08, lyAvgTckt: 1356.76 },
    { day: '4 - Thursday', twAvgTckt: 449.57, lwAvgTckt: 449.57, lyAvgTckt: 2383.05 },
    { day: '5 - Friday', twAvgTckt: 401.79, lwAvgTckt: 401.79, lyAvgTckt: 1233.34 },
    { day: '6 - Saturday', twAvgTckt: 834.99, lwAvgTckt: 834.99, lyAvgTckt: 237.09 },
    { day: '7 - Sunday', twAvgTckt: 1208.99, lwAvgTckt: 1208.99, lyAvgTckt: 893.36 }
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
        Avg. Ticket
      </Typography>
      <Box sx={{ height: '350px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
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
              domain={[0, 2500]}
              ticks={[0, 500, 1000, 1500, 2000, 2500]}
            />
            <Tooltip 
              formatter={(value) => `$${value.toFixed(2)}`}
              labelStyle={{ color: '#000' }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '14px', fontWeight: '600' }}
            />
            <Bar 
              dataKey="twAvgTckt" 
              fill="#4285F4" 
              name="Tw Avg Tckt"
            />
            <Bar 
              dataKey="lwAvgTckt" 
              fill="#EA4335" 
              name="Lw Avg Tckt"
            />
            <Bar 
              dataKey="lyAvgTckt" 
              fill="#FBBC04" 
              name="Ly Avg Tckt"
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default AvgTicketChart;
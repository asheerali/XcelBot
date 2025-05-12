import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList
} from 'recharts';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

const BudgetChart = () => {
  const data = [
    { name: 'Tw Net Sales', value: -57.99, showLabel: true },
    { name: 'Orders', value: -52.75, showLabel: false },
    { name: 'Avg Ticket', value: -11.09, showLabel: true },
    { name: 'Lbr hrs', value: -48.18, showLabel: true },
    { name: 'Lbr Pay', value: -55.71, showLabel: true },
    { name: 'Lbr %', value: 1.56, showLabel: true },
    { name: 'SPMH', value: -18.93, showLabel: true },
    { name: 'LPMH', value: -14.53, showLabel: true },
    { name: 'Tw Johns', value: -100, showLabel: false },
    { name: 'Terra', value: -100, showLabel: false },
    { name: 'Metro', value: -100, showLabel: false },
    { name: 'Victory', value: -100, showLabel: false },
    { name: 'Central Kitchen', value: -100, showLabel: true },
    { name: 'Other', value: 0, showLabel: false },
    { name: 'TTL', value: -100, showLabel: false },
    { name: 'Food Cost %', value: -30, showLabel: true },
    { name: 'Prime Cost $', value: -78.36, showLabel: true },
    { name: 'Prime Cost %', value: -28.44, showLabel: true }
  ];

  // Custom label renderer
  const renderCustomLabel = (props) => {
    const { x, y, width, height, value, index } = props;
    const labelY = value >= 0 ? y - 5 : y + height + 15;
    
    // Access the data item directly using the index
    const dataItem = data[index];
    if (!dataItem || !dataItem.showLabel || value === 0) return null;
    
    return (
      <text 
        x={x + width / 2} 
        y={labelY} 
        fill="#0000FF"
        textAnchor="middle" 
        fontWeight="bold"
        fontSize="14"
      >
        {value > 0 ? '▲' : '▼'} {Math.abs(value).toFixed(2)}%
      </text>
    );
  };

  // All bars are blue in the budget chart
  const getBarColor = () => '#0000FF';

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Box sx={{ 
        height: '500px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Typography 
          variant="h5" 
          sx={{ 
            mb: 2, 
            textAlign: 'center',
            fontWeight: 'bold' 
          }}
        >
          TW vs. Budget
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end',
          mb: 1,
          pr: 2
        }}>
          <Typography variant="body2" sx={{ color: '#0000FF', fontWeight: 'bold' }}>
            ▲ 1.56%
          </Typography>
        </Box>
        
        <Box sx={{ flex: 1 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
                style={{ fontSize: '13px', fontWeight: 'bold' }}
              />
              <YAxis 
                domain={[-100, 25]}
                ticks={[-100, -75, -50, -25, 0, 25]}
                tickFormatter={(value) => value.toFixed(0)}
                style={{ fontSize: '13px', fontWeight: '600' }}
              />
              <Tooltip 
                formatter={(value) => `${value.toFixed(2)}%`}
                labelStyle={{ color: '#000' }}
              />
              <Bar dataKey="value">
                <LabelList content={renderCustomLabel} />
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor()} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </Paper>
  );
};

export default BudgetChart;
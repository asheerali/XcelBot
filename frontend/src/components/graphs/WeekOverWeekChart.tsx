import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList
} from 'recharts';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

const WeekOverWeekChart = () => {
  const data = [
    { name: 'Lbr %', value: -6.95 },
    { name: 'SPMH', value: 41.01 },
    { name: 'LPMH', value: 5.16 },
    { name: 'Tw Johns', value: 0 },
    { name: 'Terra', value: 0 },
    { name: 'Metro', value: 0 },
    { name: 'Victory', value: 0 },
    { name: 'Central Kitchen', value: 0 },
    { name: 'Other', value: 0 },
    { name: 'Food Cost %', value: 0 },
    { name: 'Prime Cost $', value: 30.23 },
    { name: 'Prime Cost %', value: 0 }
  ];

  // Custom label renderer
  const renderCustomLabel = (props) => {
    const { x, y, width, height, value } = props;
    const radius = 10;
    const labelY = value >= 0 ? y - 5 : y + height + 15;
    
    if (value === 0) return null;
    
    return (
      <text 
        x={x + width / 2} 
        y={labelY} 
        fill={value > 0 ? '#8B4513' : '#DC143C'}
        textAnchor="middle" 
        fontWeight="bold"
        fontSize="14"
      >
        {value > 0 ? '▲' : '▼'} {Math.abs(value).toFixed(2)}%
      </text>
    );
  };

  // Get bar color based on value
  const getBarColor = (value) => {
    if (value > 0) return '#8B4513'; // Brown for positive
    if (value < 0) return '#DC143C'; // Crimson for negative
    return '#999999'; // Grey for zero
  };

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
          TW vs. LW
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end',
          mb: 1,
          pr: 2
        }}>
          <Typography variant="body2" sx={{ color: '#8B4513', fontWeight: 'bold' }}>
            ▲ 41.01%
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
                // angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
                style={{ fontSize: '14px', fontWeight: 'bold' }}
              />
              <YAxis 
                domain={[-10, 50]}
                ticks={[-10, 0, 10, 20, 30, 40, 50]}
                tickFormatter={(value) => value.toFixed(1)}
                style={{ fontSize: '13px', fontWeight: '600' }}
              />
              <Tooltip 
                formatter={(value) => `${value.toFixed(2)}%`}
                labelStyle={{ color: '#000' }}
              />
              <Bar dataKey="value">
                <LabelList content={renderCustomLabel} />
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.value)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          mt: 1,
          px: 2
        }}>
          <Typography variant="body2" sx={{ color: '#DC143C' }}>
            ▼ -6.95%
          </Typography>
          <Typography variant="body2" color="text.secondary">
            $26,781.83 1,118 $23.96 282.75 $5,619.00
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default WeekOverWeekChart;
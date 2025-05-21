// src/components/charts/BaseChart.tsx
import React from 'react';
import { Box, Typography, Card, useTheme } from '@mui/material';

interface BaseChartProps {
  title: string;
  children: React.ReactNode;
  height?: number | string;
}

const BaseChart: React.FC<BaseChartProps> = ({ title, children, height = 350 }) => {
  const theme = useTheme();
  
  return (
    <Card 
      elevation={2} 
      sx={{ 
        borderRadius: 1, 
        overflow: 'hidden',
        mb: 3,
        height: height
      }}
    >
      <Box sx={{ p: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="h6" sx={{ fontWeight: 500 }}>
          {title}
        </Typography>
      </Box>
      <Box sx={{ p: 1.5, height: 'calc(100% - 60px)' }}>
        {children}
      </Box>
    </Card>
  );
};

export default BaseChart;
// src/components/graphs/BudgetChart.tsx - Updated to use real financial data

import React from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Box, Typography, Paper } from '@mui/material';

interface BudgetChartProps {
  data: any[]; // table5 data from financial backend
}

const BudgetChart: React.FC<BudgetChartProps> = ({ data }) => {
  // Transform table5 data for budget comparison chart
  const transformDataForChart = () => {
    if (!data || data.length === 0) {
      return [];
    }

    // Key metrics for budget comparison
    const keyMetrics = [
      'Net Sales',
      'Orders', 
      'Avg Ticket',
      'Lbr Pay', // Labor Pay
      'Food Cost %',
      'Lbr %' // Labor %
    ];

    return data
      .filter(row => keyMetrics.includes(row.Metric) && row.Budget)
      .map(row => {
        const thisWeek = parseFloat(row['This Week']) || 0;
        const budget = parseFloat(row['Budget']) || 0;
        const twBdgChange = parseFloat(row['Tw/Bdg (+/-)']) || 0;
        
        // Calculate percentage of budget achieved
        const budgetAchievement = budget > 0 ? (thisWeek / budget) * 100 : 0;
        
        return {
          metric: row.Metric,
          actual: thisWeek,
          budget: budget,
          achievement: budgetAchievement,
          variance: twBdgChange,
          // Format display values
          displayActual: formatMetricValue(row.Metric, thisWeek),
          displayBudget: formatMetricValue(row.Metric, budget),
          displayVariance: `${twBdgChange >= 0 ? '+' : ''}${twBdgChange.toFixed(2)}%`
        };
      });
  };

  // Helper function to format values based on metric type
  const formatMetricValue = (metric: string, value: number) => {
    if (metric === 'Net Sales' || metric === 'Lbr Pay' || metric === 'Avg Ticket') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    } else if (metric.includes('%')) {
      return `${value.toFixed(2)}%`;
    } else {
      return value.toLocaleString();
    }
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Paper sx={{ p: 2, boxShadow: 3 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            {label}
          </Typography>
          <Typography variant="body2" color="primary">
            Actual: {data.displayActual}
          </Typography>
          <Typography variant="body2" color="secondary">
            Budget: {data.displayBudget}
          </Typography>
          <Typography variant="body2">
            Achievement: {data.achievement.toFixed(1)}%
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: data.variance >= 0 ? '#2e7d32' : '#d32f2f',
              fontWeight: 'bold'
            }}
          >
            Variance: {data.displayVariance}
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
          Budget vs Actual Comparison
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          No budget data available
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
        Budget vs Actual Performance
      </Typography>
      
      <Box sx={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="metric" 
              angle={-45}
              textAnchor="end"
              height={80}
              fontSize={12}
            />
            <YAxis yAxisId="left" fontSize={12} />
            <YAxis yAxisId="right" orientation="right" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              yAxisId="left"
              dataKey="actual" 
              name="Actual"
              fill="#1976d2" 
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
            <Bar 
              yAxisId="left"
              dataKey="budget" 
              name="Budget"
              fill="#ff9800" 
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="achievement" 
              name="Achievement %"
              stroke="#4caf50" 
              strokeWidth={3}
              dot={{ fill: '#4caf50', strokeWidth: 2, r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Box>
      
      {/* Budget achievement summary */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, textAlign: 'center' }}>
          Budget Achievement Summary
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
          {chartData.map((item, index) => (
            <Box 
              key={index} 
              sx={{ 
                textAlign: 'center', 
                minWidth: 100,
                p: 1,
                borderRadius: 1,
                backgroundColor: item.achievement >= 100 ? '#e8f5e8' : item.achievement >= 80 ? '#fff3e0' : '#ffeaea'
              }}
            >
              <Typography variant="caption" display="block">
                {item.metric}
              </Typography>
              <Typography 
                variant="body2" 
                fontWeight="bold"
                sx={{ 
                  color: item.achievement >= 100 ? '#2e7d32' : item.achievement >= 80 ? '#f57c00' : '#d32f2f'
                }}
              >
                {item.achievement.toFixed(1)}%
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
};

export default BudgetChart;
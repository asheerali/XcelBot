// src/components/graphs/AvgTicketChart.tsx - Fixed spacing and layout

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart
} from 'recharts';
import { Box, Typography, Paper, useTheme, Chip, useMediaQuery } from '@mui/material';

interface AvgTicketChartProps {
  data: any[]; // Real table4 data from financial backend (Day of week AVERAGE TICKET data)
  height?: number;
}

const AvgTicketChart: React.FC<AvgTicketChartProps> = ({ data = [], height = 400 }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Transform real financial data to chart format
  const transformDataForChart = () => {
    if (!data || data.length === 0) {
      console.log('AvgTicketChart: No data provided');
      return [];
    }

    console.log('AvgTicketChart: Raw data received:', data);

    // Filter out Grand Total row and transform the data
    const chartData = data
      .filter(item => {
        const dayOfWeek = item['Day of The Week'] || item['Day of the Week'] || item.dayOfWeek || '';
        return dayOfWeek && !dayOfWeek.toString().toLowerCase().includes('grand total');
      })
      .map(item => {
        // Extract day name from "1 - Monday" format
        const dayOfWeek = item['Day of The Week'] || item['Day of the Week'] || item.dayOfWeek || '';
        const dayName = dayOfWeek.toString().split(' - ')[1] || dayOfWeek.toString();
        
        // Get average ticket values - these might be in cents, so check the magnitude
        let twAvgTicket = parseFloat((item['Tw Avg Tckt'] || item.twAvgTicket || '0').toString().replace(/[$,]/g, ''));
        let lwAvgTicket = parseFloat((item['Lw Avg Tckt'] || item.lwAvgTicket || '0').toString().replace(/[$,]/g, ''));
        let lyAvgTicket = parseFloat((item['Ly Avg Tckt'] || item.lyAvgTicket || '0').toString().replace(/[$,]/g, ''));
        
        // If values are very high (likely in cents), convert to dollars
        if (twAvgTicket > 1000 || lwAvgTicket > 1000 || lyAvgTicket > 1000) {
          twAvgTicket = twAvgTicket / 100;
          lwAvgTicket = lwAvgTicket / 100;
          lyAvgTicket = lyAvgTicket / 100;
        }
        
        // Get percentage changes
        const twLwChange = parseFloat((item['Tw/Lw (+/-)'] || item.twLwChange || '0').toString().replace(/[%]/g, ''));
        const twLyChange = parseFloat((item['Tw/Ly (+/-)'] || item.twLyChange || '0').toString().replace(/[%]/g, ''));

        return {
          day: isMobile ? dayName.slice(0, 3) : dayName, // Truncate on mobile
          fullDay: dayOfWeek,
          'This Week': twAvgTicket,
          'Last Week': lwAvgTicket,
          'Last Year': lyAvgTicket,
          'TW vs LW': twLwChange,
          'TW vs LY': twLyChange,
          twAvgTicket: twAvgTicket,
          lwAvgTicket: lwAvgTicket,
          lyAvgTicket: lyAvgTicket
        };
      })
      .sort((a, b) => {
        // Sort by day of week (Monday = 1, Sunday = 7)
        const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const aDay = a.fullDay.toString().split(' - ')[1] || a.fullDay.toString();
        const bDay = b.fullDay.toString().split(' - ')[1] || b.fullDay.toString();
        return dayOrder.indexOf(aDay) - dayOrder.indexOf(bDay);
      });

    console.log('AvgTicketChart: Transformed data:', chartData);
    return chartData;
  };

  const chartData = transformDataForChart();

  // Calculate summary statistics
  const calculateStats = () => {
    if (chartData.length === 0) return null;

    const thisWeekAvg = chartData.reduce((sum, item) => sum + item['This Week'], 0) / chartData.length;
    const lastWeekAvg = chartData.reduce((sum, item) => sum + item['Last Week'], 0) / chartData.length;
    const lastYearAvg = chartData.reduce((sum, item) => sum + item['Last Year'], 0) / chartData.length;
    
    const weekOverWeekChange = lastWeekAvg > 0 ? ((thisWeekAvg - lastWeekAvg) / lastWeekAvg) * 100 : 0;
    const yearOverYearChange = lastYearAvg > 0 ? ((thisWeekAvg - lastYearAvg) / lastYearAvg) * 100 : 0;

    return {
      thisWeekAvg,
      lastWeekAvg,
      lastYearAvg,
      weekOverWeekChange,
      yearOverYearChange
    };
  };

  const stats = calculateStats();

  // Calculate Y-axis domain to reduce empty space
  const calculateYAxisDomain = () => {
    if (chartData.length === 0) return [0, 100];
    
    const allValues = chartData.flatMap(item => [
      item['This Week'],
      item['Last Week'],
      item['Last Year']
    ]).filter(val => val > 0);
    
    if (allValues.length === 0) return [0, 100];
    
    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);
    
    // Add 10% padding above and below
    const padding = (maxValue - minValue) * 0.1;
    const yMin = Math.max(0, minValue - padding);
    const yMax = maxValue + padding;
    
    return [yMin, yMax];
  };

  const [yMin, yMax] = calculateYAxisDomain();

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Paper
          sx={{
            p: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #ccc',
            borderRadius: 1,
            boxShadow: 2,
            maxWidth: 250
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            {label}
          </Typography>
          {payload.map((entry: any, index: number) => (
            <Typography
              key={index}
              variant="body2"
              sx={{ 
                color: entry.color,
                display: 'flex',
                alignItems: 'center',
                mb: 0.5
              }}
            >
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  backgroundColor: entry.color,
                  borderRadius: '50%',
                  mr: 1,
                  display: 'inline-block'
                }}
              />
              {entry.name}: ${entry.value.toFixed(2)}
            </Typography>
          ))}
          
          {/* Show percentage changes */}
          {payload[0] && payload[0].payload && (
            <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid #eee' }}>
              <Typography variant="caption" color="text.secondary">
                TW vs LW: {payload[0].payload['TW vs LW'] >= 0 ? '+' : ''}{payload[0].payload['TW vs LW'].toFixed(2)}%
              </Typography>
              <br />
              <Typography variant="caption" color="text.secondary">
                TW vs LY: {payload[0].payload['TW vs LY'] >= 0 ? '+' : ''}{payload[0].payload['TW vs LY'].toFixed(2)}%
              </Typography>
            </Box>
          )}
        </Paper>
      );
    }
    return null;
  };

  // Get chart dimensions based on screen size - REDUCED bottom margin
  const getChartMargins = () => {
    if (isMobile) {
      return { top: 20, right: 15, left: 60, bottom: 60 }; // Reduced from 80
    } else if (isTablet) {
      return { top: 20, right: 30, left: 70, bottom: 70 }; // Reduced from 90
    } else {
      return { top: 20, right: 40, left: 80, bottom: 80 }; // Reduced from 100
    }
  };

  const chartMargins = getChartMargins();

  if (chartData.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', height }}>
        <Typography variant="h6" color="text.secondary">
          Average Ticket Chart
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          No average ticket data available
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: { xs: 1, sm: 2 }, height }}>
      {/* Header - Responsive */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'center', sm: 'center' }, 
        mb: 2,
        gap: 1
      }}>
        <Typography 
          variant={isMobile ? "subtitle1" : "h6"} 
          sx={{ 
            fontWeight: 600,
            color: theme.palette.text.primary,
            textAlign: 'center',
            width: '100%'
          }}
        >
          Daily Average Ticket Analysis
        </Typography>
        
        {/* Summary chips - Responsive
        {stats && (
          <Box sx={{ 
            display: 'flex', 
            gap: 0.5, 
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            mt: { xs: 1, sm: 0 }
          }}>
            <Chip
              label={`Avg: ${stats.thisWeekAvg.toFixed(2)}`}
              color="primary"
              size="small"
              variant="outlined"
              sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}
            />
            <Chip
              label={`WoW: ${stats.weekOverWeekChange >= 0 ? '+' : ''}${stats.weekOverWeekChange.toFixed(1)}%`}
              color={stats.weekOverWeekChange >= 0 ? 'success' : 'error'}
              size="small"
              variant="outlined"
              sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}
            />
          </Box>
        )} */}
      </Box>
      
      {/* Chart Container - INCREASED height by reducing margins */}
      <Box sx={{ width: '100%', height: height - 60, overflow: 'hidden' }}> {/* Reduced from 80 */}
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={chartMargins}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis 
              dataKey="day"
              angle={-45}
              textAnchor="end"
              height={60} // Reduced from 80
              interval={0}
              tick={{ fontSize: isMobile ? 10 : 12 }}
              stroke={theme.palette.text.secondary}
              axisLine={{ stroke: theme.palette.divider }}
              tickLine={{ stroke: theme.palette.divider }}
            />
            <YAxis 
              domain={[yMin, yMax]} // Set custom domain to reduce empty space
              tick={{ fontSize: isMobile ? 10 : 12 }}
              stroke={theme.palette.text.secondary}
              tickFormatter={(value) => `${value.toFixed(0)}`}
              width={isMobile ? 60 : 70}
              axisLine={{ stroke: theme.palette.divider }}
              tickLine={{ stroke: theme.palette.divider }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ 
                paddingTop: '10px', // Reduced from 15px
                fontSize: isMobile ? '12px' : '14px'
              }}
              iconType="line"
              layout="horizontal"
              align="center"
              verticalAlign="bottom"
            />
            
            {/* Use lines for better visualization of trends */}
            <Line 
              type="monotone" 
              dataKey="This Week" 
              name="This Week"
              stroke={theme.palette.primary.main}
              strokeWidth={isMobile ? 2 : 3}
              dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: isMobile ? 4 : 5 }}
              activeDot={{ r: isMobile ? 6 : 7, stroke: theme.palette.primary.main, strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="Last Week" 
              name="Last Week"
              stroke={theme.palette.secondary.main}
              strokeWidth={isMobile ? 1.5 : 2}
              strokeDasharray="5 5"
              dot={{ fill: theme.palette.secondary.main, strokeWidth: 2, r: isMobile ? 3 : 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="Last Year" 
              name="Last Year"
              stroke={theme.palette.warning.main}
              strokeWidth={isMobile ? 1.5 : 2}
              strokeDasharray="10 5"
              dot={{ fill: theme.palette.warning.main, strokeWidth: 2, r: isMobile ? 3 : 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default AvgTicketChart;
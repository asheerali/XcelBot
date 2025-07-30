// src/components/graphs/OrdersChart.tsx - Updated with moving average functionality

import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import { Box, Typography, Paper, useTheme, Switch, FormControlLabel } from "@mui/material";

interface OrdersChartProps {
  data: any[]; // Real table3 data from financial backend (Day of week ORDERS data)
  height?: number;
  showMovingAverage?: boolean;
  movingAveragePeriod?: number;
}

const OrdersChart: React.FC<OrdersChartProps> = ({
  data = [],
  height = 400,
  showMovingAverage = true,
  movingAveragePeriod = 3,
}) => {
  const theme = useTheme();
  const [displayMovingAverage, setDisplayMovingAverage] = React.useState(showMovingAverage);

  // Calculate moving average
  const calculateMovingAverage = (data: any[], period: number = movingAveragePeriod) => {
    const result = [...data];
    
    for (let i = 0; i < result.length; i++) {
      let sum = 0;
      let count = 0;
      
      // Calculate average for the current window
      for (let j = Math.max(0, i - Math.floor(period / 2)); 
           j <= Math.min(result.length - 1, i + Math.floor(period / 2)); 
           j++) {
        sum += result[j]["This Week"] || 0;
        count++;
      }
      
      result[i].movingAverage = count > 0 ? Math.round(sum / count) : 0;
    }
    
    return result;
  };

  // Transform real financial data to chart format
  const transformDataForChart = () => {
    if (!data || data.length === 0) {
      console.log("OrdersChart: No data provided");
      return [];
    }

    console.log("OrdersChart: Raw data received:", data);

    // Filter out Grand Total row and transform the data
    let chartData = data
      .filter((item) => {
        const dayOfWeek =
          item["Day of The Week"] ||
          item["Day of the Week"] ||
          item.dayOfWeek ||
          "";
        return (
          dayOfWeek &&
          !dayOfWeek.toString().toLowerCase().includes("grand total")
        );
      })
      .map((item) => {
        // Extract day name from "1 - Monday" format
        const dayOfWeek =
          item["Day of The Week"] ||
          item["Day of the Week"] ||
          item.dayOfWeek ||
          "";
        const dayName =
          dayOfWeek.toString().split(" - ")[1] || dayOfWeek.toString();

        // Get order values
        const twOrders = parseFloat(item["Tw Orders"] || item.twOrders || 0);
        const lwOrders = parseFloat(item["Lw Orders"] || item.lwOrders || 0);
        const lyOrders = parseFloat(item["Ly Orders"] || item.lyOrders || 0);

        // Get percentage changes
        const twLwChange = parseFloat(
          item["Tw/Lw (+/-)"] || item.twLwChange || 0
        );
        const twLyChange = parseFloat(
          item["Tw/Ly (+/-)"] || item.twLyChange || 0
        );

        return {
          day: dayName,
          fullDay: dayOfWeek,
          "This Week": Math.round(twOrders),
          "Last Week": Math.round(lwOrders),
          "Last Year": Math.round(lyOrders),
          "TW vs LW": twLwChange,
          "TW vs LY": twLyChange,
          twOrders: Math.round(twOrders),
          lwOrders: Math.round(lwOrders),
          lyOrders: Math.round(lyOrders),
        };
      });

    // Add moving average if enabled
    if (displayMovingAverage && chartData.length > 0) {
      chartData = calculateMovingAverage(chartData, movingAveragePeriod);
    }

    console.log("OrdersChart: Transformed data with moving average:", chartData);
    return chartData;
  };

  const chartData = transformDataForChart();

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Paper
          sx={{
            p: 2,
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            border: "1px solid #ccc",
            borderRadius: 1,
            boxShadow: 2,
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
                display: "flex",
                alignItems: "center",
                mb: 0.5,
              }}
            >
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  backgroundColor: entry.color,
                  borderRadius: entry.dataKey === 'movingAverage' ? "0%" : "50%",
                  mr: 1,
                  display: "inline-block",
                }}
              />
              {entry.name}: {entry.value.toLocaleString()} 
              {entry.dataKey === 'movingAverage' ? ' (avg)' : ' orders'}
            </Typography>
          ))}

          {/* Show percentage changes */}
          {payload[0] && payload[0].payload && (
            <Box sx={{ mt: 1, pt: 1, borderTop: "1px solid #eee" }}>
              <Typography variant="caption" color="text.secondary">
                TW vs LW: {payload[0].payload["TW vs LW"] >= 0 ? "+" : ""}
                {payload[0].payload["TW vs LW"].toFixed(2)}%
              </Typography>
              <br />
              <Typography variant="caption" color="text.secondary">
                TW vs LY: {payload[0].payload["TW vs LY"] >= 0 ? "+" : ""}
                {payload[0].payload["TW vs LY"].toFixed(2)}%
              </Typography>
            </Box>
          )}
        </Paper>
      );
    }
    return null;
  };

  // Custom bar colors
  const getBarColor = (entry: any, dataKey: string) => {
    switch (dataKey) {
      case "This Week":
        return theme.palette.primary.main;
      case "Last Week":
        return theme.palette.secondary.main;
      case "Last Year":
        return theme.palette.warning.main;
      default:
        return theme.palette.grey[500];
    }
  };

  if (chartData.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: "center", height }}>
        <Typography variant="h6" color="text.secondary">
          Orders Chart
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          No orders data available
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, height }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: theme.palette.text.primary,
          }}
        >
          Daily Orders Analysis
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={displayMovingAverage}
              onChange={(e) => setDisplayMovingAverage(e.target.checked)}
              size="small"
              color="primary"
            />
          }
          label={
            <Typography variant="caption" color="text.secondary">
              {movingAveragePeriod}-Day Moving Average
            </Typography>
          }
        />
      </Box>

      <Box sx={{ width: "100%", height: height - 120 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60,
            }}
            barCategoryGap="20%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={theme.palette.divider}
            />
            <XAxis
              dataKey="day"
              textAnchor="end"
              height={80}
              interval={0}
              tick={{ fontSize: 12 }}
              stroke={theme.palette.text.secondary}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              stroke={theme.palette.text.secondary}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="rect" />

            <Bar
              dataKey="This Week"
              name="This Week"
              fill={theme.palette.primary.main}
              radius={[2, 2, 0, 0]}
            />
            <Bar
              dataKey="Last Week"
              name="Last Week"
              fill={theme.palette.secondary.main}
              radius={[2, 2, 0, 0]}
            />
            <Bar
              dataKey="Last Year"
              name="Last Year"
              fill={theme.palette.warning.main}
              radius={[2, 2, 0, 0]}
            />
            
            {/* Moving Average Line */}
            {displayMovingAverage && (
              <Line
                type="monotone"
                dataKey="movingAverage"
                name={`${movingAveragePeriod}-Day Moving Average`}
                stroke={theme.palette.success.main}
                strokeWidth={3}
                dot={{ 
                  fill: theme.palette.success.main, 
                  strokeWidth: 2, 
                  r: 4 
                }}
                activeDot={{ 
                  r: 6, 
                  stroke: theme.palette.success.main, 
                  strokeWidth: 2 
                }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default OrdersChart;
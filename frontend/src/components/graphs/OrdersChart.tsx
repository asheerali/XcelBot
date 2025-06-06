// src/components/graphs/OrdersChart.tsx - Updated with real financial data

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import { Box, Typography, Paper, useTheme } from "@mui/material";

interface OrdersChartProps {
  data: any[]; // Real table3 data from financial backend (Day of week ORDERS data)
  height?: number;
}

const OrdersChart: React.FC<OrdersChartProps> = ({
  data = [],
  height = 400,
}) => {
  const theme = useTheme();

  // Transform real financial data to chart format
  const transformDataForChart = () => {
    if (!data || data.length === 0) {
      console.log("OrdersChart: No data provided");
      return [];
    }

    console.log("OrdersChart: Raw data received:", data);

    // Filter out Grand Total row and transform the data
    const chartData = data
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

    console.log("OrdersChart: Transformed data:", chartData);
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
                  borderRadius: "50%",
                  mr: 1,
                  display: "inline-block",
                }}
              />
              {entry.name}: {entry.value.toLocaleString()} orders
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
      <Typography
        variant="h6"
        sx={{
          mb: 2,
          textAlign: "center",
          fontWeight: 600,
          color: theme.palette.text.primary,
        }}
      >
        Daily Orders Analysis
      </Typography>
      {/* Summary statistics
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
        {chartData.length > 0 && (
          <>
            <Box sx={{ textAlign: 'center', minWidth: 100 }}>
              <Typography variant="body2" color="text.secondary">
                Total This Week
              </Typography>
              <Typography variant="h6" color="primary.main">
                {chartData.reduce((sum, item) => sum + item['This Week'], 0).toLocaleString()}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', minWidth: 100 }}>
              <Typography variant="body2" color="text.secondary">
                Total Last Week
              </Typography>
              <Typography variant="h6" color="secondary.main">
                {chartData.reduce((sum, item) => sum + item['Last Week'], 0).toLocaleString()}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', minWidth: 100 }}>
              <Typography variant="body2" color="text.secondary">
                Total Last Year
              </Typography>
              <Typography variant="h6" color="warning.main">
                {chartData.reduce((sum, item) => sum + item['Last Year'], 0).toLocaleString()}
              </Typography>
            </Box>
          </>
        )}
      </Box> */}
      <Box sx={{ width: "100%", height: height - 80 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
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
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default OrdersChart;

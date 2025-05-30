import React, { useEffect, useState } from "react";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  LabelList,
} from "recharts";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

interface TotalSalesChartProps {
  tableData: any;
}

const TotalSalesChart: React.FC<TotalSalesChartProps> = ({ tableData }) => {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Process the data for the chart whenever tableData changes
    if (tableData && tableData.table1 && tableData.table1.length > 0) {
      const processedData = processDataForChart(tableData.table1);
      setChartData(processedData);
    }
  }, [tableData]);

  // Helper function to parse currency values
  const parseCurrencyValue = (value: string | number): number => {
    if (typeof value === "number") return value;
    if (!value || value === "####") return 0;

    if (typeof value === "string" && value.includes("$")) {
      return parseFloat(value.replace(/[$,]/g, ""));
    }

    return parseFloat(value) || 0;
  };

  // Process the raw data to extract total sales values
  const processDataForChart = (rawData: any[]): any[] => {
    return rawData.map((weekData) => {
      // Get the grand total value
      const totalSales = parseCurrencyValue(weekData["Grand Total"]);

      return {
        week: weekData.Week,
        Total: totalSales,
        // Store the raw value for tooltips and labels
        Total_formatted: formatCurrency(totalSales),
      };
    });
  };

  // Format currency for display
  const formatCurrency = (value: number): string => {
    return value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Calculate trend line
  const calculateTrendLine = (data: any[]): any[] => {
    if (!data || data.length === 0) return [];

    // We'll use a simple 3-point moving average if we have enough data points
    const windowSize = Math.min(3, data.length);

    const result = [...data];

    // Calculate moving average
    if (data.length >= windowSize) {
      for (let i = 0; i < data.length; i++) {
        // Get values for the window (windowSize points centered on current point)
        const startIdx = Math.max(0, i - Math.floor(windowSize / 2));
        const endIdx = Math.min(
          data.length - 1,
          i + Math.floor(windowSize / 2)
        );

        let totalSum = 0;
        let count = 0;

        for (let j = startIdx; j <= endIdx; j++) {
          totalSum += data[j].Total;
          count++;
        }

        // Add trend line data
        result[i].Total_trend = totalSum / count;
      }
    } else {
      // Not enough data for a moving average, just use the values as is
      result.forEach((item) => {
        item.Total_trend = item.Total;
      });
    }

    return result;
  };

  // Custom tooltip to show formatted currency
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Filter out trend lines from tooltip
      const barPayload = payload.find(
        (entry: any) => entry.dataKey === "Total"
      );

      if (!barPayload) return null;

      return (
        <div
          style={{
            backgroundColor: "#fff",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "5px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
          }}
        >
          <p style={{ margin: 0, fontWeight: "bold", marginBottom: "5px" }}>
            Week {label}
          </p>
          <p style={{ margin: 0, color: barPayload.color }}>
            Total Sales: {formatCurrency(barPayload.value)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom bar label renderer
  const renderCustomizedLabel = (props: any) => {
    const { x, y, width, height, value } = props;
    const radius = 10;

    return (
      <text
        x={x + width / 2}
        y={y - radius}
        fill="#761919"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={11}
        fontWeight="bold"
      >
        {formatCurrency(value)}
      </text>
    );
  };

  // If no data is available
  if (!chartData || chartData.length === 0) {
    return (
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6">Total Sales</Typography>
          <Typography color="text.secondary">
            No data available. Please upload an Excel file with valid sales
            data.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Add trend line to chart data
  const dataWithTrendLine = calculateTrendLine(chartData);

  // Format Y-axis labels
  const formatYAxis = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}k`;
    }
    return `$${value}`;
  };

  // Calculate Y-axis range
  const minValue =
    Math.min(...dataWithTrendLine.map((item: any) => item.Total)) * 0.9;
  const maxValue =
    Math.max(...dataWithTrendLine.map((item: any) => item.Total)) * 1.1;

  // Round to nearest $5,000 for better readability
  const yAxisMin = Math.max(0, Math.floor(minValue / 5000) * 5000);
  const yAxisMax = Math.ceil(maxValue / 5000) * 5000;

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Total Sales
        </Typography>

        <Box sx={{ width: "100%", height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={dataWithTrendLine}
              margin={{ top: 40, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis
                tickFormatter={formatYAxis}
                domain={[yAxisMin, yAxisMax]}
                // label={{
                //   value: 'Total Sales ($)',
                //   angle: -90,
                //   position: 'insideLeft',
                //   style: { textAnchor: 'middle' }
                // }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Total" fill="#B22222" name="Total Sales">
                <LabelList
                  dataKey="Total"
                  position="top"
                  content={renderCustomizedLabel}
                />
              </Bar>

              {/* Trend line */}
              <Line
                type="monotone"
                dataKey="Total_trend"
                stroke="#761919"
                strokeWidth={2}
                dot={false}
                activeDot={false}
                legendType="none"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TotalSalesChart;

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
  ComposedChart,
  Line,
  LineChart,
} from "recharts";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

<<<<<<< HEAD
const API_URL = 'http://13.60.27.209:8000/api/excel/analytics';
=======
// Interface for props
interface SalesChartsProps {
  tableData?: {
    table5?: Array<{ Week: string; Sales: number; Orders: number; Moving_Avg: number }>;
    table6?: Array<{ Day: string; Sales: number; Orders: number; Moving_Avg: number }>;
    table7?: Array<{ [key: string]: string | number }>;
  };
  selectedLocation?: string;
  dateRangeType?: string;
  height?: number;
}
>>>>>>> integrations_v41

const SalesCharts: React.FC<SalesChartsProps> = ({
  tableData,
  selectedLocation,
  dateRangeType,
  height = 250,
}) => {
  // REMOVED: calculateMovingAverage function since moving average now comes from backend

  // UPDATED: Custom tooltip that shows sales, orders, and backend moving average
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0]?.payload;

      return (
        <div
          style={{
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            padding: "10px",
            borderRadius: "5px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
          }}
        >
          <p style={{ margin: 0, fontWeight: "bold" }}>{`${label}`}</p>
          {/* Always show sales */}
          <p style={{ margin: 0, color: "#8ffcff" }}>
            {`Sales: $${parseFloat(
              dataPoint?.Sales || payload[0]?.value || 0
            ).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
          </p>
          {/* Show backend moving average if available */}
          {dataPoint?.Moving_Avg !== undefined && (
            <p style={{ margin: 0, color: "#ff0000" }}>
              {`Moving Avg: $${parseFloat(
                dataPoint.Moving_Avg
              ).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
            </p>
          )}
          {/* Show orders if available */}
          {dataPoint?.Orders !== undefined && (
            <p style={{ margin: 0, color: "#FF6B6B" }}>
              {`Orders: ${dataPoint.Orders}`}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Format currency for axis labels
  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`;
    }
    return `$${value}`;
  };

  // Format orders for axis labels
  const formatOrders = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return `${value}`;
  };

  // UPDATED: ComposedChart with bars and line using backend moving average
  const renderComposedChart = (
    data: any[],
    dataKey: string,
    chartHeight = 250
  ) => {
    const safeData = Array.isArray(data) ? data : [];
    // No need to calculate moving average since it comes from backend

    return (
      <ResponsiveContainer width="100%" height={chartHeight}>
        <ComposedChart
          data={safeData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey={dataKey}
            tickSize={5}
            axisLine={{ stroke: "#E0E0E0" }}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            tickCount={5}
            tick={{ fontSize: 12 }}
            tickFormatter={formatCurrency}
            domain={[0, "auto"]}
            axisLine={{ stroke: "#E0E0E0" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {/* Sales bars - UPDATED COLOR */}
          <Bar
            dataKey="Sales"
            fill="#8ffcff"
            name="Sales"
            radius={[4, 4, 0, 0]}
          />
          {/* Moving average line using backend data - UPDATED COLOR */}
          <Line
            type="monotone"
            dataKey="Moving_Avg"
            stroke="#ff0000"
            strokeWidth={3}
            dot={{ fill: "#ff0000", strokeWidth: 2, r: 4 }}
            name="Moving Average"
          />
        </ComposedChart>
      </ResponsiveContainer>
    );
  };

  // Process table7 data for time ranges (now includes Moving_Avg from backend)
  const processTimeRangeData = (data: any[]) => {
    if (!Array.isArray(data)) return [];

    return data
      .map((item) => ({
        TimeRange: item["Time Range"] || item.timeRange || item.TimeRange,
        Sales: item.Sales || 0,
        Orders: item.Orders || 0,
        Moving_Avg: item.Moving_Avg || 0, // Include backend moving average
      }))
      .filter((item) => item.TimeRange);
  };

  // Dynamic chart title based on date range
  const getChartTitle = () => {
    if (!dateRangeType) return "Sales by Week";

    if (dateRangeType.includes("30 Days"))
      return "Sales - Last 30 Days with Moving Average";
    if (dateRangeType.includes("Month"))
      return "Sales by Week - Monthly View with Moving Average";
    if (dateRangeType.includes("Custom"))
      return "Sales - Custom Period with Moving Average";

    return "Sales by Week with Moving Average";
  };

  // Title for day of week chart based on date range
  const getDayOfWeekTitle = () => {
    if (!dateRangeType) return "Sales by Day of Week";

    if (dateRangeType.includes("30 Days"))
      return "Average Sales by Day of Week - Last 30 Days with Moving Average";
    if (dateRangeType.includes("Month"))
      return "Average Sales by Day of Week - Monthly with Moving Average";
    if (dateRangeType.includes("3 Months"))
      return "Total Sales by Day of Week - Last 3 Months with Moving Average";

    return "Sales by Day of Week with Moving Average";
  };

  // Style definitions
  const chartContainerStyle = {
    margin: 0,
    padding: 0,
  };

  const chartCardStyle = {
    marginBottom: "24px",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
  };

  const chartHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #eee",
    padding: "16px 20px",
  };

  const chartContentStyle = {
    padding: "20px",
  };

  const chartRowStyle = {
    display: "flex",
    flexWrap: "wrap",
    margin: "-12px",
  };

  const chartColumnStyle = {
    flex: "1 1 100%",
    minWidth: "300px",
    padding: "12px",
    boxSizing: "border-box",
  };

  // Check if we have any data
  const hasWeeklyData =
    tableData?.table5 &&
    Array.isArray(tableData.table5) &&
    tableData.table5.length > 0;
  const hasDayOfWeekData =
    tableData?.table6 &&
    Array.isArray(tableData.table6) &&
    tableData.table6.length > 0;
  const hasTimeRangeData =
    tableData?.table7 &&
    Array.isArray(tableData.table7) &&
    tableData.table7.length > 0;

  // If there's no data at all
  if (!hasWeeklyData && !hasDayOfWeekData && !hasTimeRangeData) {
    return (
      <Box sx={chartContainerStyle}>
        <Alert severity="info">
          No sales data available. Please upload and process an Excel file to
          view sales analytics.
        </Alert>
      </Box>
    );
  }

  // Process time range data
  const timeRangeData = hasTimeRangeData
    ? processTimeRangeData(tableData!.table7!)
    : [];

  // Render the charts with data
  return (
    <Box sx={chartContainerStyle} className="sales-charts-root">
<<<<<<< HEAD
      {/* Sales by Week Chart */}
      <Card sx={chartCardStyle}>
        <Box sx={chartHeaderStyle}>
          <Typography variant="h6" fontWeight={600} color="#333">
            {getChartTitle()}
          </Typography>
          <Button 
            size="small" 
            onClick={fetchAnalyticsData}
            startIcon={<RefreshIcon />}
          >
            Refresh
          </Button>
        </Box>
        <CardContent sx={chartContentStyle}>
          {analyticsData.salesByWeek.length > 0 ? (
            renderBarChart(analyticsData.salesByWeek, 'week', 'value', 'Sales', 300)
          ) : (
            <Typography color="text.secondary">No weekly data available</Typography>
          )}
        </CardContent>
      </Card>
      
      {/* Stacked Categories Chart */}
      {/* <Card sx={chartCardStyle}>
        <Box sx={chartHeaderStyle}>
          <Typography variant="h6" fontWeight={600} color="#333">
            Sales by Category
          </Typography>
        </Box>
        <CardContent sx={chartContentStyle}>
          {analyticsData.salesByCategory.length > 0 ? (
            renderStackedBarChart(analyticsData.salesByCategory, 350)
          ) : (
            <Typography color="text.secondary">No category data available</Typography>
          )}
        </CardContent>
      </Card> */}
      
=======
      {/* Sales by Week Chart with Backend Moving Average */}
      {hasWeeklyData && (
        <Card sx={chartCardStyle}>
          <Box sx={chartHeaderStyle}>
            <Typography variant="h6" fontWeight={600} color="#333">
              {getChartTitle()}
            </Typography>
          </Box>
          <CardContent sx={chartContentStyle}>
            {renderComposedChart(tableData!.table5!, "Week", 300)}
          </CardContent>
        </Card>
      )}

>>>>>>> integrations_v41
      {/* Two-column layout for day of week and time of day */}
      <Box sx={chartRowStyle}>
        {/* Day of Week Chart with Backend Moving Average */}
        {hasDayOfWeekData && (
          <Box sx={{ ...chartColumnStyle, flex: "1 1 50%" }}>
            <Card sx={chartCardStyle}>
              <Box sx={chartHeaderStyle}>
                <Typography variant="h6" fontWeight={600} color="#333">
                  {getDayOfWeekTitle()}
                </Typography>
              </Box>
              <CardContent sx={chartContentStyle}>
                {renderComposedChart(tableData!.table6!, "Day")}
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Time of Day Chart with Backend Moving Average */}
        {hasTimeRangeData && timeRangeData.length > 0 && (
          <Box sx={{ ...chartColumnStyle, flex: "1 1 50%" }}>
            <Card sx={chartCardStyle}>
              <Box sx={chartHeaderStyle}>
                <Typography variant="h6" fontWeight={600} color="#333">
                  Sales by Time Range with Moving Average
                </Typography>
              </Box>
              <CardContent sx={chartContentStyle}>
                {renderComposedChart(timeRangeData, "TimeRange")}
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>

      {/* Show info message if some data is missing */}
      {(!hasWeeklyData || !hasDayOfWeekData || !hasTimeRangeData) && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Some analytics data is not available. Charts are shown for available
          data only.
        </Alert>
      )}
    </Box>
  );
};

export default SalesCharts;
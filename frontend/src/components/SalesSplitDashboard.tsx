// Updated SalesSplitDashboard.tsx - Added Moving Average, Removed Linear Trend
import React from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip,
  ComposedChart,
} from "recharts";
import { Box, Typography, Card, CardContent, Grid } from "@mui/material";
import { bars_color } from "../constants";

interface SalesSplitDashboardProps {
  tableData?: any;
  selectedLocation?: string;
}

const SalesSplitDashboard: React.FC<SalesSplitDashboardProps> = ({
  tableData,
  selectedLocation,
}) => {
  // Return early if no data
  if (
    !tableData ||
    !tableData.table1 ||
    !Array.isArray(tableData.table1) ||
    tableData.table1.length === 0
  ) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary">
          No sales data available
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please upload Excel files to view sales analysis
        </Typography>
      </Box>
    );
  }

  // Dynamic helper functions to extract table structure
  const getTableColumns = (table: any[]) => {
    if (!table || table.length === 0) return [];
    return Object.keys(table[0]).filter((key) => key !== "Week");
  };

  const getNumericColumns = (table: any[]) => {
    if (!table || table.length === 0) return [];
    const firstRow = table[0];
    return Object.keys(firstRow).filter((key) => {
      if (key === "Week") return false;
      const value = firstRow[key];
      return (
        typeof value === "number" ||
        (typeof value === "string" &&
          !value.includes("%") &&
          !isNaN(parseFloat(value.replace(/[$,]/g, ""))))
      );
    });
  };

  // Process Daily Sales data from table8 (Day of Week data)
  const processDailySalesData = () => {
    if (
      !tableData.table8 ||
      !Array.isArray(tableData.table8) ||
      tableData.table8.length === 0
    ) {
      console.log("No table8 data available, using fallback");
      // Fallback to table1 data if table8 is not available
      return tableData.table1.map((row: any) => ({
        day: `Week ${row.Week}`,
        sales: Math.round(
          (row["Grand Total"] ||
            row[
              Object.keys(row).find((key) =>
                key.toLowerCase().includes("total")
              ) || ""
            ] ||
            0) / 1000
        ),
      }));
    }

    console.log("Processing table8 data:", tableData.table8);

    // Define all 7 days of the week in order
    const daysOfWeek = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    // Define abbreviated days for display
    const daysOfWeek1 = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    // Create a map of existing data
    const dataMap = new Map();
    tableData.table8
      .filter(
        (row: any) => row.Day_of_Week && row.Day_of_Week !== "Grand Total"
      )
      .forEach((row: any) => {
        const salesValue =
          parseFloat(String(row["Grand Total"] || 0).replace(/[$,]/g, "")) || 0;
        dataMap.set(row.Day_of_Week, Math.round(salesValue / 1000));
      });

    // Ensure all 7 days are included, with 0 for missing days
    return daysOfWeek.map((day, index) => ({
      day: daysOfWeek1[index],
      sales: dataMap.get(day) || 0, // Use 0 if no data for that day
    }));
  };

  // Process Sales Category Line Chart data from table9 (Category data)
  const processSalesCategoryData = () => {
    if (
      !tableData.table9 ||
      !Array.isArray(tableData.table9) ||
      tableData.table9.length === 0
    ) {
      console.log("No table9 data available");
      return [];
    }

    console.log("Processing table9 data:", tableData.table9);

    // Get all week columns (exclude Category and Grand Total columns)
    const weekColumns = Object.keys(tableData.table9[0] || {}).filter(
      (key) => key.startsWith("Week") && key !== "Grand Total"
    );

    console.log("Available week columns:", weekColumns);

    // Transform data to have weeks as x-axis and categories as separate lines
    const weeklyData: any[] = [];

    weekColumns.forEach((weekCol) => {
      const weekData: any = { week: weekCol };

      // Filter out 'Grand Total' category and add each category's value for this week
      tableData.table9
        .filter((row: any) => row.Category && row.Category !== "Grand Total")
        .forEach((row: any) => {
          const value =
            parseFloat(String(row[weekCol] || 0).replace(/[$,]/g, "")) || 0;
          weekData[row.Category] = Math.round(value / 1000); // Convert to thousands
        });

      weeklyData.push(weekData);
    });

    console.log("Processed weekly category data:", weeklyData);
    return weeklyData;
  };

  // Process Categories List from table10
  const processCategoriesList = () => {
    if (
      !tableData.table10 ||
      !Array.isArray(tableData.table10) ||
      tableData.table10.length === 0
    ) {
      console.log("No table10 data available, using table9 categories");
      // Fallback to table9 categories if table10 is not available
      if (tableData.table9 && tableData.table9.length > 0) {
        return tableData.table9
          .filter((row: any) => row.Category && row.Category !== "Grand Total")
          .map((row: any, index: number) => ({
            name: row.Category,
            color: getCategoryColor(index),
            lastWeeksSales: `$${Math.round((row["Grand Total"] || 0) / 1000)}k`,
            percentChange: "N/A",
            thisWeeksSales: `$${Math.round((row["Grand Total"] || 0) / 1000)}k`,
          }));
      }
      return [];
    }

    console.log("Processing table10 data:", tableData.table10);

    return tableData.table10.map((row: any, index: number) => ({
      name: row.Category || `Category ${index + 1}`,
      color: getCategoryColor(index),
      lastWeeksSales: `$${Math.round((row.Last_4_Weeks_Sales || 0) / 1000)}k`,
      percentChange: `${row.Percent_Change || 0}%`,
      thisWeeksSales: `$${Math.round((row.This_4_Weeks_Sales || 0) / 1000)}k`,
    }));
  };

  // Process Weekly Sales Trend data from table11
  const processWeeklySalesData = () => {
    if (
      !tableData.table11 ||
      !Array.isArray(tableData.table11) ||
      tableData.table11.length === 0
    ) {
      console.log("No table11 data available");
      return [];
    }

    console.log("Processing table11 data:", tableData.table11);

    // Filter out 'Grand Total' row and process weekly data
    return tableData.table11
      .filter((row: any) => row.Week && row.Week !== "Grand Total")
      .map((row: any) => ({
        week: row.Week,
        totalSales:
          parseFloat(String(row.Total_Sales || 0).replace(/[$,]/g, "")) || 0,
        totalOrders:
          parseFloat(String(row.Total_Orders || 0).replace(/[$,]/g, "")) || 0,
        // Convert sales to thousands for display
        salesDisplay: Math.round(
          (parseFloat(String(row.Total_Sales || 0).replace(/[$,]/g, "")) || 0) /
            1000
        ),
      }));
  };

  // ENHANCED: Calculate moving average for weekly sales data with multiple periods
  const calculateMovingAverage = (data: any[], periods: { [key: string]: number } = { '3week': 3, '5week': 5 }) => {
    if (data.length < 2) return data;

    return data.map((item, index) => {
      const enhanced = { ...item };
      
      // Calculate different moving averages
      Object.entries(periods).forEach(([name, period]) => {
        if (index < period - 1) {
          // For the first few points, use available data
          const startIndex = 0;
          const endIndex = index + 1;
          const subset = data.slice(startIndex, endIndex);
          const average = subset.reduce((sum, d) => sum + d.salesDisplay, 0) / subset.length;
          enhanced[`movingAverage${period}Week`] = Math.round(average);
        } else {
          // Calculate moving average for the specified period
          const startIndex = index - period + 1;
          const endIndex = index + 1;
          const subset = data.slice(startIndex, endIndex);
          const average = subset.reduce((sum, d) => sum + d.salesDisplay, 0) / period;
          enhanced[`movingAverage${period}Week`] = Math.round(average);
        }
      });
      
      return enhanced;
    });
  };

  // REMOVED: calculateDailyTrendline function (linear trend removal)
  // Instead, we'll focus on moving averages for trend analysis

  // Enhanced daily sales processing with moving average
  const processDailySalesWithMovingAverage = () => {
    const dailyData = processDailySalesData();
    
    // Calculate 3-day moving average for daily data
    return dailyData.map((item, index) => {
      if (index < 2) {
        // For first two days, use available data
        const subset = dailyData.slice(0, index + 1);
        const average = subset.reduce((sum, d) => sum + d.sales, 0) / subset.length;
        return {
          ...item,
          movingAverage: Math.round(average),
        };
      } else {
        // Calculate 3-day moving average
        const subset = dailyData.slice(index - 2, index + 1);
        const average = subset.reduce((sum, d) => sum + d.sales, 0) / 3;
        return {
          ...item,
          movingAverage: Math.round(average),
        };
      }
    });
  };

  // Color palette for categories
  const getCategoryColor = (index: number) => {
    const colors = [
      "#4D8D8D",
      "#7DCBC4",
      "#2D5F5F",
      "#FFCE56",
      "#8BC34A",
      "#9E9E9E",
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
    ];
    return colors[index % colors.length];
  };

  // Get processed data
  const dailySalesDataWithMA = processDailySalesWithMovingAverage();
  const salesCategoryData = processSalesCategoryData();
  const categoriesList = processCategoriesList();
  const weeklySalesData = processWeeklySalesData();

  // Calculate enhanced moving average for weekly sales data with multiple periods
  const weeklySalesWithMovingAvg = calculateMovingAverage(weeklySalesData, { 
    '3': 3,  // 3-week moving average
    '5': 5   // 5-week moving average
  });

  console.log("Processed data:", {
    dailySalesDataWithMA,
    salesCategoryData,
    categoriesList,
    weeklySalesData: weeklySalesWithMovingAvg,
  });

  // Calculate total sales for display
  const totalSalesValue = dailySalesDataWithMA.reduce(
    (sum, item) => sum + item.sales,
    0
  );

  // Enhanced Categories Legend Component
  const CategoriesLegend = ({ data }: { data: any[] }) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        padding: "16px",
        backgroundColor: "#f8f9fa",
        borderRadius: "8px",
        height: "100%",
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
        Category Performance Summary
      </Typography>
      {data.map((entry, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            alignItems: "center",
            padding: "8px 12px",
            borderRadius: "6px",
            transition: "background-color 0.2s ease",
            cursor: "pointer",
            backgroundColor: "white",
            border: "1px solid #e0e0e0",
          }}
          className="legend-item"
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              marginRight: "12px",
              backgroundColor: entry.color,
            }}
          />
          <div
            style={{
              fontSize: "14px",
              flex: 1,
              fontWeight: "500",
            }}
          >
            {entry.name}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "2px",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                color: "#666",
                fontWeight: "400",
              }}
            >
              Last 4 Weeks: {entry.lastWeeksSales}
            </div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: entry.percentChange.includes("-")
                  ? "#d32f2f"
                  : "#2e7d32",
              }}
            >
              {entry.percentChange} | This Week: {entry.thisWeeksSales}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Render lines for sales category chart based on table9 categories
  const renderCategoryLines = () => {
    if (salesCategoryData.length === 0) return null;

    // Get categories from table9 (excluding Grand Total)
    const categories =
      tableData.table9
        ?.filter((row: any) => row.Category && row.Category !== "Grand Total")
        ?.map((row: any) => row.Category) || [];

    return categories.map((category: string, index: number) => (
      <Line
        key={category}
        type="monotone"
        dataKey={category}
        stroke={getCategoryColor(index)}
        strokeWidth={3}
        dot={{ r: 4, strokeWidth: 2, fill: "white" }}
        activeDot={{
          r: 6,
          stroke: getCategoryColor(index),
          strokeWidth: 2,
          fill: "white",
        }}
        name={category}
      />
    ));
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        gap: "24px",
        padding: "24px",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        backgroundColor: "#f5f5f5",
      }}
    >
      {/* Header */}
      {selectedLocation && (
        <Typography
          variant="h5"
          sx={{ mb: 2, color: "#333", fontWeight: "bold" }}
        >
          Sales Analysis for {selectedLocation}
        </Typography>
      )}

      {/* UPDATED: Daily Sales Performance with Moving Average (Removed Linear Trend) */}
      <div
        style={{
          width: "100%",
          padding: "24px",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          backgroundColor: "white",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
        className="stat-card"
      >
        {/* Chart heading */}
        <div
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            marginBottom: "16px",
            color: "#333",
            textAlign: "center",
            width: "100%",
          }}
        >
          Daily Sales Performance with Moving Average
        </div>

        {/* Chart container */}
        <div
          style={{
            height: "350px",
            width: "100%",
            marginBottom: "0px",
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={dailySalesDataWithMA}
              margin={{
                top: 20,
                right: 30,
                left: 0,
                bottom: 20,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="rgba(0,0,0,0.1)"
              />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                textAnchor="end"
                height={60}
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value}k`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div
                        style={{
                          backgroundColor: "white",
                          padding: "16px",
                          border: "2px solid #4D8D8D",
                          borderRadius: "8px",
                          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                          minWidth: "200px"
                        }}
                      >
                        <div style={{ fontWeight: "bold", marginBottom: "8px", color: "#333" }}>
                          Day: {label}
                        </div>
                        <div style={{ color: "#4D8D8D", marginBottom: "4px" }}>
                          Sales: ${(data.sales * 1000).toLocaleString()}
                        </div>
                        <div style={{ color: "#FF6B6B", marginBottom: "4px" }}>
                          3-Day Moving Avg: ${(data.movingAverage * 1000).toLocaleString()}
                        </div>
                        <div style={{ color: "#666", marginBottom: "4px" }}>
                          Orders: 1,000
                        </div>
                        <div style={{ color: "#666" }}>
                          Avg. Ticket: $8.32
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: "20px" }}
              />
              <Bar
                dataKey="sales"
                fill={bars_color}
                barSize={50}
                radius={[4, 4, 0, 0]}
                animationDuration={1500}
                name="Daily Sales ($k)"
              />
              {/* UPDATED: Moving Average Line (Replaces Linear Trend) */}
              <Line
                type="monotone"
                dataKey="movingAverage"
                stroke="#FF6B6B"
                strokeWidth={3}
                dot={{ r: 4, fill: "#FF6B6B", strokeWidth: 2 }}
                activeDot={{ r: 6, fill: "#FF6B6B", strokeWidth: 2 }}
                name="Day Moving Average"
              />
            </ComposedChart>
          </ResponsiveContainer> 
        </div>
    
      </div>

      {/* Second row - Category Performance Trends and Summary side by side */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "24px" }}>
        {/* Sales Category Line Chart from Table9 */}
        <div
          style={{
            width: "calc(60% - 12px)",
            minWidth: "400px",
            flexGrow: 1,
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            backgroundColor: "white",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
          }}
          className="stat-card"
        >
          {/* Chart heading */}
          <div
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              marginBottom: "16px",
              color: "#333",
              textAlign: "center",
            }}
          >
            Category Performance Trends
          </div>

          <div
            style={{
              height: "500px",
              marginBottom: "10px",
            }}
          >
            {salesCategoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={salesCategoryData}
                  margin={{ top: 20, right: 20, left: 10, bottom: -10 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    opacity={0.2}
                  />
                  <XAxis
                    dataKey="week"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#666", fontSize: 12 }}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${value}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255,255,255,0.95)",
                      borderRadius: "8px",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                      border: "none",
                    }}
                  />
                  <Legend
                    layout="horizontal"
                    verticalAlign="top"
                    align="center"
                    wrapperStyle={{ paddingBottom: "10px" }}
                  />
                  {renderCategoryLines()}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  color: "#666",
                  fontSize: "16px",
                }}
              >
                No category trend data available
              </div>
            )}
          </div>
        </div>

        {/* Categories List from Table10 */}
        <div
          style={{
            width: "calc(40% - 12px)",
            minWidth: "300px",
            flexGrow: 1,
            padding: "24px",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            backgroundColor: "white",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
          }}
          className="stat-card"
        >
          {categoriesList.length > 0 && (
            <CategoriesLegend data={categoriesList} />
          )}
        </div>
      </div>

      {/* ENHANCED: Weekly Sales Trend with Multiple Moving Averages */}
      {weeklySalesWithMovingAvg.length > 0 && (
        <div
          style={{
            padding: "24px",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            backgroundColor: "white",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
          }}
          className="stat-card"
        >
          {/* Chart heading */}
          <div
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              marginBottom: "16px",
              color: "#333",
              textAlign: "center",
            }}
          >
            Weekly Sales Trend with Moving Averages
          </div>
          <div style={{ height: "450px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={weeklySalesWithMovingAvg}
                margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgba(0,0,0,0.1)"
                />
                <XAxis
                  dataKey="week"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tickFormatter={(value) => `${value}k`}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div
                          style={{
                            backgroundColor: "white",
                            padding: "16px",
                            border: "none",
                            borderRadius: "8px",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                            minWidth: "250px"
                          }}
                        >
                          <p
                            style={{ margin: "0 0 8px 0", fontWeight: "bold", fontSize: "14px" }}
                          >{`Week: ${label}`}</p>
                          <p style={{ margin: "0 0 4px 0", color: "#4D8D8D", fontSize: "13px" }}>
                            {`Total Sales: $${(data.totalSales / 1000).toFixed(1)}k`}
                          </p>
                          <p style={{ margin: "0 0 4px 0", color: "#666", fontSize: "13px" }}>
                            {`Total Orders: ${data.totalOrders}`}
                          </p>
                          <p style={{ margin: "0 0 4px 0", color: "#9C27B0", fontSize: "13px" }}>
                            {`3-Week Moving Avg: $${data.movingAverage3Week}k`}
                          </p>
                          <p style={{ margin: "0", color: "#FF9800", fontSize: "13px" }}>
                            {`5-Week Moving Avg: $${data.movingAverage5Week}k`}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: "20px" }}
                  iconType="line"
                />
                
                {/* Weekly Sales Bars */}
                <Bar
                  dataKey="salesDisplay"
                  fill= {bars_color}
                  barSize={40}
                  radius={[4, 4, 0, 0]}
                  animationDuration={1500}
                  name="Weekly Sales ($k)"
                />
                
                {/* ENHANCED: 3-Week Moving Average Line */}
                <Line
                  type="monotone"
                  dataKey="movingAverage3Week"
                  // stroke = "#FF9800"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#ff0000", strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: "#9C27B0", strokeWidth: 2 }}
                  name="3-Week Moving Average"
                />
                
               
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          
         
        </div>
      )}

      {/* Add CSS for hover effects */}
      <style>
        {`
          .stat-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 30px rgba(0,0,0,0.12);
          }
          .legend-item:hover {
            background-color: rgba(77, 141, 141, 0.1);
          }
          @media (max-width: 1200px) {
            .stat-card {
              width: 100% !important;
              min-width: 300px;
            }
          }
          @media (max-width: 768px) {
            .stat-card {
              width: 100% !important;
              min-width: 300px;
            }
          }
          @media (max-width: 480px) {
            .stat-card {
              min-width: 280px;
            }
          }
        `}
      </style>
    </div>
  );
};

export default SalesSplitDashboard;
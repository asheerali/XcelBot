// Updated SalesSplitDashboard.tsx - Fixed to show all 7 days and added headings
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
} from "recharts";
import { Box, Typography, Card, CardContent, Grid } from "@mui/material";

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
    if (!tableData.table8 || !Array.isArray(tableData.table8) || tableData.table8.length === 0) {
      console.log("No table8 data available, using fallback");
      // Fallback to table1 data if table8 is not available
      return tableData.table1.map((row: any) => ({
        day: `Week ${row.Week}`,
        sales: Math.round(
          (row["Grand Total"] || 
           row[Object.keys(row).find((key) => key.toLowerCase().includes("total")) || ""] || 
           0) / 1000
        ),
      }));
    }

    console.log("Processing table8 data:", tableData.table8);
    
    // Define all 7 days of the week in order
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    // Create a map of existing data
    const dataMap = new Map();
    tableData.table8
      .filter((row: any) => row.Day_of_Week && row.Day_of_Week !== 'Grand Total')
      .forEach((row: any) => {
        const salesValue = parseFloat(String(row["Grand Total"] || 0).replace(/[$,]/g, "")) || 0;
        dataMap.set(row.Day_of_Week, Math.round(salesValue / 1000));
      });
    
    // Ensure all 7 days are included, with 0 for missing days
    return daysOfWeek.map(day => ({
      day: day,
      sales: dataMap.get(day) || 0, // Use 0 if no data for that day
    }));
  };

  // Process Sales Category Line Chart data from table9 (Category data)
  const processSalesCategoryData = () => {
    if (!tableData.table9 || !Array.isArray(tableData.table9) || tableData.table9.length === 0) {
      console.log("No table9 data available");
      return [];
    }

    console.log("Processing table9 data:", tableData.table9);
    
    // Get all week columns (exclude Category and Grand Total columns)
    const weekColumns = Object.keys(tableData.table9[0] || {}).filter(key => 
      key.startsWith('Week') && key !== 'Grand Total'
    );
    
    console.log("Available week columns:", weekColumns);

    // Transform data to have weeks as x-axis and categories as separate lines
    const weeklyData: any[] = [];
    
    weekColumns.forEach(weekCol => {
      const weekData: any = { week: weekCol };
      
      // Filter out 'Grand Total' category and add each category's value for this week
      tableData.table9
        .filter((row: any) => row.Category && row.Category !== 'Grand Total')
        .forEach((row: any) => {
          const value = parseFloat(String(row[weekCol] || 0).replace(/[$,]/g, "")) || 0;
          weekData[row.Category] = Math.round(value / 1000); // Convert to thousands
        });
      
      weeklyData.push(weekData);
    });

    console.log("Processed weekly category data:", weeklyData);
    return weeklyData;
  };

  // Process Categories List from table10
  const processCategoriesList = () => {
    if (!tableData.table10 || !Array.isArray(tableData.table10) || tableData.table10.length === 0) {
      console.log("No table10 data available, using table9 categories");
      // Fallback to table9 categories if table10 is not available
      if (tableData.table9 && tableData.table9.length > 0) {
        return tableData.table9
          .filter((row: any) => row.Category && row.Category !== 'Grand Total')
          .map((row: any, index: number) => ({
            name: row.Category,
            color: getCategoryColor(index),
            lastWeeksSales: `$${Math.round((row["Grand Total"] || 0) / 1000)}k`,
            percentChange: "N/A",
            thisWeeksSales: `$${Math.round((row["Grand Total"] || 0) / 1000)}k`
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
      thisWeeksSales: `$${Math.round((row.This_4_Weeks_Sales || 0) / 1000)}k`
    }));
  };

  // Process Weekly Sales Trend data from table11
  const processWeeklySalesData = () => {
    if (!tableData.table11 || !Array.isArray(tableData.table11) || tableData.table11.length === 0) {
      console.log("No table11 data available");
      return [];
    }

    console.log("Processing table11 data:", tableData.table11);
    
    // Filter out 'Grand Total' row and process weekly data
    return tableData.table11
      .filter((row: any) => row.Week && row.Week !== 'Grand Total')
      .map((row: any) => ({
        week: row.Week,
        totalSales: parseFloat(String(row.Total_Sales || 0).replace(/[$,]/g, "")) || 0,
        totalOrders: parseFloat(String(row.Total_Orders || 0).replace(/[$,]/g, "")) || 0,
        // Convert sales to thousands for display
        salesDisplay: Math.round((parseFloat(String(row.Total_Sales || 0).replace(/[$,]/g, "")) || 0) / 1000),
      }));
  };

  // Color palette for categories
  const getCategoryColor = (index: number) => {
    const colors = [
      "#4D8D8D", "#7DCBC4", "#2D5F5F", "#FFCE56", "#8BC34A", 
      "#9E9E9E", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"
    ];
    return colors[index % colors.length];
  };

  // Get processed data
  const dailySalesData = processDailySalesData();
  const salesCategoryData = processSalesCategoryData();
  const categoriesList = processCategoriesList();
  const weeklySalesData = processWeeklySalesData();

  console.log("Processed data:", {
    dailySalesData,
    salesCategoryData,
    categoriesList,
    weeklySalesData
  });

  // Calculate total sales for display
  const totalSalesValue = dailySalesData.reduce(
    (sum, item) => sum + item.sales,
    0
  );

  // Categories Legend Component with Table10 structure
  const CategoriesLegend = ({ data }: { data: any[] }) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        marginTop: "16px",
        padding: "16px",
        backgroundColor: "#f8f9fa",
        borderRadius: "8px",
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
          <div style={{ 
            fontSize: "14px", 
            flex: 1, 
            fontWeight: "500" 
          }}>
            {entry.name}
          </div>
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "2px"
          }}>
            <div style={{ 
              fontSize: "12px", 
              color: "#666",
              fontWeight: "400"
            }}>
              Last 4 Weeks: {entry.lastWeeksSales}
            </div>
            <div style={{ 
              fontSize: "14px", 
              fontWeight: "600",
              color: entry.percentChange.includes('-') ? '#d32f2f' : '#2e7d32'
            }}>
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
    const categories = tableData.table9
      ?.filter((row: any) => row.Category && row.Category !== 'Grand Total')
      ?.map((row: any) => row.Category) || [];
    
    return categories.map((category: string, index: number) => (
      <Line
        key={category}
        type="monotone"
        dataKey={category}
        stroke={getCategoryColor(index)}
        strokeWidth={3}
        dot={{ r: 4, strokeWidth: 2, fill: 'white' }}
        activeDot={{ r: 6, stroke: getCategoryColor(index), strokeWidth: 2, fill: 'white' }}
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
          Sales Analysis 
        </Typography>
      )}

      {/* First row - Daily Sales (Table8) and Sales Category Line Chart (Table9) */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "24px" }}>
        {/* Daily Sales from Table8 - FIXED: Improved width calculation and margins */}
        <div
          style={{
            width: "calc(50% - 12px)",
            minWidth: "350px", // Increased minimum width
            flexGrow: 1,
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
          {/* ADDED: Chart heading */}
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
            Daily Sales Performance
          </div>

          {/* Chart container - FIXED: Improved width and margins */}
          <div
            style={{
              height: "300px", // Increased height
              width: "100%",
              marginBottom: "20px",
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dailySalesData}
                margin={{ 
                  top: 20, 
                  right: 40, // Increased right margin
                  left: 40,  // Increased left margin
                  bottom: 60 // Increased bottom margin for day labels
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
                  angle={-45} // Rotate labels for better fit
                  textAnchor="end"
                  height={60}
                  interval={0} // Show all labels
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value) => [`$${value}k`, "Sales"]}
                  labelFormatter={(label) => `Day: ${label}`}
                  contentStyle={{
                    borderRadius: 8,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    border: "none",
                  }}
                />
                <Bar
                  dataKey="sales"
                  fill="#4D8D8D"
                  barSize={40} // Reduced bar size to fit all 7 days
                  radius={[4, 4, 0, 0]}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Large centered total value below the chart */}
          <div
            style={{
              fontSize: "36px", // Slightly reduced to fit better
              fontWeight: "700",
              color: "#4D8D8D",
              textAlign: "center",
              lineHeight: "1.1",
              width: "100%",
            }}
          >
            <span style={{ color: "black" }}>Total: </span> $
            {totalSalesValue.toFixed(1)}k
          </div>
        </div>

        {/* Sales Category Line Chart from Table9 with Categories List from Table10 */}
        <div
          style={{
            width: "calc(50% - 12px)",
            minWidth: "350px", // Increased minimum width
            flexGrow: 1,
            padding: "24px",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            backgroundColor: "white",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
          }}
          className="stat-card"
        >
          {/* ADDED: Chart heading */}
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
              height: "300px", // Increased height to match daily sales
              marginBottom: "16px",
            }}
          >
            {salesCategoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={salesCategoryData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis 
                    dataKey="week" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: '#666', fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255,255,255,0.95)', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      border: 'none'
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
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%',
                color: '#666',
                fontSize: '16px'
              }}>
                No category trend data available
              </div>
            )}
          </div>

          {/* Categories List from Table10 */}
          {categoriesList.length > 0 && (
            <CategoriesLegend data={categoriesList} />
          )}
        </div>
      </div>

      {/* Second row - Weekly Sales Trend from Table11 */}
      {weeklySalesData.length > 0 && (
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
          {/* ADDED: Chart heading */}
          <div
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              marginBottom: "16px",
              color: "#333",
              textAlign: "center",
            }}
          >
            Weekly Sales & Orders Trend
          </div>
          <div style={{ height: "350px" }}> {/* Increased height */}
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={weeklySalesData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
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
                  formatter={(value, name) => {
                    if (name === 'salesDisplay') {
                      return [`$${value}k`, 'Total Sales'];
                    }
                    return [value, name];
                  }}
                  labelFormatter={(label) => `Week: ${label}`}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div style={{
                          backgroundColor: 'white',
                          padding: '12px',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                        }}>
                          <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>{`Week: ${label}`}</p>
                          <p style={{ margin: '0 0 4px 0', color: '#4D8D8D' }}>
                            {`Total Sales: $${(data.totalSales / 1000).toFixed(1)}k`}
                          </p>
                          <p style={{ margin: '0', color: '#666' }}>
                            {`Total Orders: ${data.totalOrders}`}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="salesDisplay"
                  fill="#4D8D8D"
                  barSize={50} // Increased bar size for better visibility
                  radius={[4, 4, 0, 0]}
                  animationDuration={1500}
                />
              </BarChart>
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
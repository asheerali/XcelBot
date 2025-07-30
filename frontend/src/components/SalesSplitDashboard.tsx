<<<<<<< HEAD
import React from 'react';
import {
  BarChart, Bar, PieChart, Pie, LineChart, Cell, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label
} from 'recharts';

const SalesSplitDashboard = () => {
  // Total Sales Data
  const totalSalesData = [
    { week: '1', sales: 45 },
    { week: '3', sales: 42 },
    { week: '5', sales: 44 },
    { week: '8', sales: 48 },
    { week: '11', sales: 58 },
    { week: '13', sales: 68 },
    { week: '15', sales: 78 },
    { week: '17', sales: 86 },
  ];

  // Sales Category Data
  const salesCategoryData = [
    { name: 'Catering', value: 31 },
    { name: '31%', value: 56 },
    { name: 'DD', value: 5 },
  ];
  const COLORS = ['#4D8D8D', '#7DCBC4', '#2D5F5F'];

  // % of In-House Data
  const inHousePercentData = [
    { week: '1', percent: 10 },
    { week: '3', percent: 12 },
    { week: '5', percent: 15 },
    { week: '6', percent: 18 },
    { week: '8', percent: 25 },
    { week: '9', percent: 16 },
    { week: '10', percent: 20 },
    { week: '11', percent: 22 },
    { week: '12', percent: 25 },
    { week: '13', percent: 40 },
  ];

  // in-House Data
  const inHouseData = [
    { week: '1', percent: 20 },
    { week: '6', percent: 18 },
    { week: '8', percent: 17 },
    { week: '13', percent: 18 },
    { week: '15', percent: 22 },
    { week: '17', percent: 25 },
  ];

  // WOW Trends Data
  const wowTrendsData = [
    { week: '1', Estimates: 5, Catering: 15, InHouse: 42, DD: 70, CIV: 25, UB: 15 },
    { week: '3', Estimates: 15, Catering: 5, InHouse: 5, DD: 10, CIV: 5, UB: 5 },
    { week: '6', Estimates: 25, Catering: 30, InHouse: 15, DD: 2, CIV: 5, UB: 20 },
    { week: '7', Estimates: 2, Catering: 10, InHouse: 5, DD: -5, CIV: 15, UB: 10 },
    { week: '8', Estimates: 18, Catering: 35, InHouse: 25, DD: -10, CIV: 30, UB: 25 },
    { week: '10', Estimates: 25, Catering: 15, InHouse: 5, DD: -15, CIV: 5, UB: 20 },
    { week: '13', Estimates: 12, Catering: 20, InHouse: 15, DD: -20, CIV: 20, UB: 15 },
    { week: '15', Estimates: 5, Catering: 30, InHouse: 25, DD: -15, CIV: 30, UB: 30 },
    { week: '17', Estimates: 15, Catering: 25, InHouse: 5, DD: 75, CIV: -10, UB: 5 },
  ];

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Sales Card */}
        <div className="bg-white rounded-lg shadow-md p-4 transition-all duration-300 hover:shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Total Sales</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={totalSalesData}
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}k`]} />
                <Bar dataKey="sales" fill="#4D8D8D" barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-xl font-semibold text-gray-700">$45,40 k</div>
        </div>

        {/* Sales Category Card */}
        <div className="bg-white rounded-lg shadow-md p-4 transition-all duration-300 hover:shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Sales Category</h2>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={salesCategoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={0}
                  dataKey="value"
                  label={({ name, value }) => `${name} ${value}%`}
                >
                  {salesCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* % of In-House Card */}
        <div className="bg-white rounded-lg shadow-md p-4 transition-all duration-300 hover:shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">% of In-House</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={inHousePercentData}
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="week" />
                <YAxis tickFormatter={(value) => `${value}%`} domain={[0, 40]} />
                <Tooltip formatter={(value) => [`${value}%`]} />
                <Bar dataKey="percent" fill="#4D8D8D" barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-gray-700">0%</span>
            <span className="text-gray-700">20%</span>
            <span className="text-gray-700">40%</span>
          </div>
        </div>

        {/* in-House Card */}
        <div className="bg-white rounded-lg shadow-md p-4 transition-all duration-300 hover:shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">in-House</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={inHouseData}
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="week" />
                <YAxis tickFormatter={(value) => `${value}%`} domain={[15, 25]} />
                <Tooltip formatter={(value) => [`${value}%`]} />
                <Bar dataKey="percent" fill="#4D8D8D" barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-gray-700">15%</span>
            <span className="text-gray-700">20%</span>
            <span className="text-gray-700">25%</span>
          </div>
        </div>
      </div>

      {/* WOW Trends Card - Full Width */}
      <div className="bg-white rounded-lg shadow-md p-4 mt-4 transition-all duration-300 hover:shadow-lg">
        <h3 className="text-base font-medium text-gray-700 mb-2">Week-over Week ($: WOW) Trends</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={wowTrendsData}
              margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
              barCategoryGap={5}
              barGap={0}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="week" />
              <YAxis 
                tickFormatter={(value) => `${value}%`} 
                domain={[-75, 265]}
              />
              <Tooltip formatter={(value) => [`${value}%`]} />
              <Legend />
              <Bar dataKey="Estimates" fill="#4D8D8D" barSize={5} stackId="a" />
              <Bar dataKey="Catering" fill="#2D5F5F" barSize={5} stackId="b" />
              <Bar dataKey="InHouse" fill="#7DCBC4" barSize={5} stackId="c" />
              <Bar dataKey="DD" fill="#FFCE56" barSize={5} stackId="d" />
              <Bar dataKey="CIV" fill="#9FE2E0" barSize={5} stackId="e" />
              <Bar dataKey="UB" fill="#8BC34A" barSize={5} stackId="f" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
=======
// Updated SalesSplitDashboard.tsx - Full Values Display with Decimals Preserved
// IMPORTANT: All decimal values (like 4150.77) are now preserved and displayed as "4,150.77" or "$4,150.77"
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

  // Helper function to format numbers with commas (preserving decimals)
  const formatNumber = (value: number) => {
    if (isNaN(value) || value === null || value === undefined) return "0";
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Helper function to format currency (preserving decimals)
  const formatCurrency = (value: number) => {
    if (isNaN(value) || value === null || value === undefined) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

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

  // Process Daily Sales data from table8 (Day of Week data) - FULL VALUES
  // Process Daily Sales data from table8 (Day of Week data) - CONSISTENT DAY ORDER
  // Process Daily Sales data from table8 (Day of Week data) - FULL VALUES
  // Process Daily Sales data from table8 (Day of Week data) - FULL VALUES
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
        sales: parseFloat(
          row["Grand Total"] ||
            row[
              Object.keys(row).find((key) =>
                key.toLowerCase().includes("total")
              ) || ""
            ] ||
            0
        ),
        movingAverage: 0, // No moving average for fallback data
      }));
    }

    console.log("Processing table8 data:", tableData.table8);

    // Define day order (Monday first) and abbreviated days for display
    const dayOrder = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    const daysOfWeekMap = {
      Monday: "Mon",
      Tuesday: "Tue",
      Wednesday: "Wed",
      Thursday: "Thu",
      Friday: "Fri",
      Saturday: "Sat",
      Sunday: "Sun",
    };

    // Process the data from table8 - FULL VALUES (preserving decimals)
    const processedData = tableData.table8.map((row: any) => ({
      day: daysOfWeekMap[row.Day_of_Week] || row.Day_of_Week,
      fullDayName: row.Day_of_Week,
      sales: parseFloat(String(row.Sales || 0).replace(/[$,]/g, "")) || 0,
      movingAverage:
        parseFloat(String(row.Moving_Avg || 0).replace(/[$,]/g, "")) || 0,
      date: row.Date, // Keep the date for reference
      dayFormatted: row.Day, // add this line

    }));

    // Sort the data to ensure Monday comes first
    return processedData.sort((a, b) => {
      const aIndex = dayOrder.indexOf(a.fullDayName);
      const bIndex = dayOrder.indexOf(b.fullDayName);
      return aIndex - bIndex;
    });
  };

  // Enhanced version with both options available
  const processDailySalesDataWithOptions = (startWithSunday = false) => {
    if (
      !tableData.table8 ||
      !Array.isArray(tableData.table8) ||
      tableData.table8.length === 0
    ) {
      console.log("No table8 data available, using fallback");
      return tableData.table1.map((row: any) => ({
        day: `Week ${row.Week}`,
        sales: parseFloat(
          row["Grand Total"] ||
            row[
              Object.keys(row).find((key) =>
                key.toLowerCase().includes("total")
              ) || ""
            ] ||
            0
        ),
        movingAverage: 0,
      }));
    }

    const daysOfWeekMap = {
      Monday: "Mon",
      Tuesday: "Tue",
      Wednesday: "Wed",
      Thursday: "Thu",
      Friday: "Fri",
      Saturday: "Sat",
      Sunday: "Sun",
    };

    // Choose day order based on parameter
    const dayOrder = startWithSunday
      ? [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ]
      : [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ];

    // Process the data and create a map for easy lookup
    const dataMap = new Map();
    tableData.table8.forEach((row: any) => {
      const dayName = row.Day_of_Week;
      dataMap.set(dayName, {
        day: daysOfWeekMap[dayName] || dayName,
        sales: parseFloat(String(row.Sales || 0).replace(/[$,]/g, "")) || 0,
        movingAverage:
          parseFloat(String(row.Moving_Avg || 0).replace(/[$,]/g, "")) || 0,
        date: row.Date,
      });
    });

    // Return data in consistent order
    return dayOrder
      .filter((day) => dataMap.has(day))
      .map((day) => dataMap.get(day));
  };

  // ENHANCED: Process Sales Category Line Chart data from table9 - FULL VALUES
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
          const rawValue =
            parseFloat(String(row[weekCol] || 0).replace(/[$,]/g, "")) || 0;
          // FULL VALUES: Preserve decimals, no rounding
          weekData[row.Category] = rawValue;
        });

      weeklyData.push(weekData);
    });

    console.log("Processed weekly category data:", weeklyData);
    return weeklyData;
  };

  // ENHANCED: Get categories with better validation
  const getCategoriesFromTable9 = () => {
    if (!tableData.table9 || !Array.isArray(tableData.table9)) {
      return [];
    }

    return tableData.table9
      .filter((row: any) => row.Category && row.Category !== "Grand Total")
      .map((row: any) => row.Category);
  };

  // Process Categories List from table10 - FULL VALUES
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
            lastWeeksSales: formatCurrency(parseFloat(row["Grand Total"]) || 0),
            percentChange: "N/A",
            thisWeeksSales: formatCurrency(parseFloat(row["Grand Total"]) || 0),
          }));
      }
      return [];
    }

    console.log("Processing table10 data:", tableData.table10);

    return tableData.table10.map((row: any, index: number) => ({
      name: row.Category || `Category ${index + 1}`,
      color: getCategoryColor(index),
      lastWeeksSales: formatCurrency(parseFloat(row.Last_4_Weeks_Sales) || 0),
      percentChange: `${row.Percent_Change || 0}%`,
      thisWeeksSales: formatCurrency(parseFloat(row.This_4_Weeks_Sales) || 0),
    }));
  };

  // Process Weekly Sales Trend data from table11 - FULL VALUES
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
        // FULL VALUES: Keep original sales values with decimals
        salesDisplay:
          parseFloat(String(row.Total_Sales || 0).replace(/[$,]/g, "")) || 0,
      }));
  };

  // ENHANCED: Calculate moving average for weekly sales data - FULL VALUES
  const calculateMovingAverage = (
    data: any[],
    periods: { [key: string]: number } = { "3week": 3, "5week": 5 }
  ) => {
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
          const average =
            subset.reduce((sum, d) => sum + d.salesDisplay, 0) / subset.length;
          enhanced[`movingAverage${period}Week`] = average;
        } else {
          // Calculate moving average for the specified period
          const startIndex = index - period + 1;
          const endIndex = index + 1;
          const subset = data.slice(startIndex, endIndex);
          const average =
            subset.reduce((sum, d) => sum + d.salesDisplay, 0) / period;
          enhanced[`movingAverage${period}Week`] = average;
        }
      });

      return enhanced;
    });
  };

  // Enhanced daily sales processing with moving average - FULL VALUES
  const processDailySalesWithMovingAverage = () => {
    const dailyData = processDailySalesData();

    // Calculate 3-day moving average for daily data
    return dailyData.map((item, index) => {
      if (index < 2) {
        // For first two days, use available data
        const subset = dailyData.slice(0, index + 1);
        const average =
          subset.reduce((sum, d) => sum + d.sales, 0) / subset.length;
        return {
          ...item,
          movingAverage: average,
        };
      } else {
        // Calculate 3-day moving average
        const subset = dailyData.slice(index - 2, index + 1);
        const average = subset.reduce((sum, d) => sum + d.sales, 0) / 3;
        return {
          ...item,
          movingAverage: average,
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
    "3": 3, // 3-week moving average
    "5": 5, // 5-week moving average
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

  // ENHANCED: Render lines for sales category chart with better error handling and tooltips
  const renderCategoryLines = () => {
    if (salesCategoryData.length === 0) {
      console.log("No sales category data to render");
      return null;
    }

    // Get categories from table9 (excluding Grand Total)
    const categories = getCategoriesFromTable9();

    console.log("Rendering lines for categories:", categories);

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
        connectNulls={false} // Don't connect null/undefined values
      />
    ));
  };

  // DEBUGGING: Table9 Debug Component (remove in production)
  const Table9DebugInfo = () => {
    if (!tableData.table9) return null;

    return (
      <div
        style={{
          padding: "10px",
          backgroundColor: "#f0f9ff",
          borderRadius: "4px",
          margin: "10px 0",
          fontSize: "12px",
          fontFamily: "monospace",
          border: "1px solid #0ea5e9",
        }}
      >
        <strong>📊 Table9 Debug Info:</strong>
        <div style={{ marginTop: "8px" }}>
          <strong>Categories:</strong> {getCategoriesFromTable9().join(", ")}
        </div>
        <div>
          <strong>Weeks:</strong>{" "}
          {Object.keys(tableData.table9[0] || {})
            .filter((k) => k.startsWith("Week"))
            .join(", ")}
        </div>
        <details style={{ marginTop: "8px" }}>
          <summary style={{ cursor: "pointer", fontWeight: "bold" }}>
            Raw Data (First 2 rows)
          </summary>
          <pre style={{ marginTop: "8px", fontSize: "10px" }}>
            {JSON.stringify(tableData.table9.slice(0, 2), null, 2)}
          </pre>
        </details>
      </div>
    );
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

      {/* DEBUG: Uncomment to see table9 structure */}
      {/* <Table9DebugInfo /> */}

      {/* Daily Sales Performance with Moving Average - FULL VALUES */}
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
          Latest Week Sales Performance
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
                tickFormatter={(value) => formatNumber(value)}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    // Format date for display
                    const formatDate = (dateStr: string) => {
                      if (!dateStr) return "";
                      const date = new Date(dateStr);
                      return date.toLocaleDateString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      });
                    };

                    return (
                      <div
                        style={{
                          backgroundColor: "white",
                          padding: "16px",
                          border: "2px solid #4D8D8D",
                          borderRadius: "8px",
                          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                          minWidth: "200px",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: "bold",
                            marginBottom: "8px",
                            color: "#333",
                          }}
                        >
                          Day: {label}
                        </div>
                        <div
                          style={{
                            color: "#555",
                            marginBottom: "8px",
                            fontSize: "12px",
                          }}
                        >
                          {/* Date: {data.Day} */}
                          Date: {data.dayFormatted}
                          {/* Date: {formatDate(data.date)} */}
                        </div>
                        <div style={{ color: "#4D8D8D", marginBottom: "4px" }}>
                          Sales: {formatCurrency(data.sales)}
                        </div>
                        <div style={{ color: "#ff0000" }}>
                          Moving Avg: {formatCurrency(data.movingAverage)}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ paddingTop: "20px" }} />
              <Bar
                dataKey="sales"
                fill={bars_color}
                barSize={50}
                radius={[4, 4, 0, 0]}
                animationDuration={1500}
                name="Daily Sales"
              />
              {/* Moving Average Line (red color) */}
              <Line
                type="monotone"
                dataKey="movingAverage"
                stroke="#ff0000"
                strokeWidth={3}
                dot={{ r: 4, fill: "#ff0000", strokeWidth: 2 }}
                activeDot={{ r: 6, fill: "#ff0000", strokeWidth: 2 }}
                name="Moving Average"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Second row - Category Performance Trends and Summary side by side */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "24px" }}>
        {/* ENHANCED: Sales Category Line Chart from Table9 - FULL VALUES */}
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

          {/* ENHANCED: Data validation and debug info */}
          <div
            style={{
              fontSize: "12px",
              color: "#666",
              marginBottom: "10px",
              textAlign: "center",
            }}
          >
            Showing {salesCategoryData.length} weeks •{" "}
            {getCategoriesFromTable9().length} categories
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
                    tickFormatter={(value) => formatNumber(value)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255,255,255,0.95)",
                      borderRadius: "8px",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                      border: "none",
                      minWidth: "250px",
                    }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div
                            style={{
                              backgroundColor: "white",
                              padding: "16px",
                              border: "2px solid #4D8D8D",
                              borderRadius: "8px",
                              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                              minWidth: "200px",
                            }}
                          >
                            <div
                              style={{
                                fontWeight: "bold",
                                marginBottom: "8px",
                                color: "#333",
                              }}
                            >
                              {label}: Category Sales
                            </div>
                            {payload.map((entry, index) => (
                              <div
                                key={index}
                                style={{
                                  color: entry.color,
                                  marginBottom: "4px",
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <span>{entry.name}:</span>
                                <span style={{ fontWeight: "bold" }}>
                                  {formatCurrency(entry.value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
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
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  color: "#666",
                  fontSize: "16px",
                }}
              >
                <div>No category trend data available</div>
                <div style={{ fontSize: "14px", marginTop: "8px" }}>
                  Expected table9 structure: Category, Week 14, Week 15, Week
                  16, Week 17
                </div>
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

      {/* Weekly Sales Trend with Multiple Moving Averages - FULL VALUES */}
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
            Weekly Sales Trend
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
                  tickFormatter={(value) => formatNumber(value)}
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
                            minWidth: "250px",
                          }}
                        >
                          <p
                            style={{
                              margin: "0 0 8px 0",
                              fontWeight: "bold",
                              fontSize: "14px",
                            }}
                          >{`${label}`}</p>
                          <p
                            style={{
                              margin: "0 0 4px 0",
                              color: "#4D8D8D",
                              fontSize: "13px",
                            }}
                          >
                            {`Total Sales: ${formatCurrency(data.totalSales)}`}
                          </p>
                          <p
                            style={{
                              margin: "0 0 4px 0",
                              color: "#666",
                              fontSize: "13px",
                            }}
                          >
                            {`Total Orders: ${formatNumber(data.totalOrders)}`}
                          </p>
                          <p
                            style={{
                              margin: "0 0 4px 0",
                              color: "#ff0000",
                              fontSize: "13px",
                            }}
                          >
                            {`Moving Avg: ${formatCurrency(
                              data.movingAverage3Week
                            )}`}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="line" />

                {/* Weekly Sales Bars */}
                <Bar
                  dataKey="salesDisplay"
                  fill={bars_color}
                  barSize={40}
                  radius={[4, 4, 0, 0]}
                  animationDuration={1500}
                  name="Weekly Sales"
                />

                {/* 3-Week Moving Average Line (red color) */}
                <Line
                  type="monotone"
                  dataKey="movingAverage3Week"
                  stroke="#ff0000"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#ff0000", strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: "#ff0000", strokeWidth: 2 }}
                  name="Moving Average"
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
>>>>>>> integrations_v41
    </div>
  );
};

<<<<<<< HEAD
export default SalesSplitDashboard;
=======
export default SalesSplitDashboard;
>>>>>>> integrations_v41

// Updated SalesSplitDashboard.tsx - Dynamic parameters from all 4 tables
import React from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Box, Typography, Card, CardContent, Grid } from "@mui/material";
import { color } from "@mui/system";

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

  const getPercentageColumns = (table: any[]) => {
    if (!table || table.length === 0) return [];
    const firstRow = table[0];
    return Object.keys(firstRow).filter((key) => {
      if (key === "Week") return false;
      const value = firstRow[key];
      return typeof value === "string" && value.includes("%");
    });
  };

  // Process real data from all 4 tables dynamically
  const processTableData = () => {
    console.log("Processing table data:", tableData);

    // TABLE 1: Raw Sales Data - Extract all numeric columns dynamically
    const table1Columns = getNumericColumns(tableData.table1);
    console.log("Table1 numeric columns:", table1Columns);

    const totalSalesData = tableData.table1.map((row: any) => ({
      week: `${row.Week}`,
      sales: Math.round(
        (row["Grand Total"] ||
          row[
            table1Columns.find((col) => col.toLowerCase().includes("total")) ||
              table1Columns[table1Columns.length - 1]
          ] ||
          0) / 1000
      ),
    }));

    // Calculate category percentages from table1 data - dynamic categories
    const categoryData = [];
    let totalSales = 0;
    const categories = table1Columns.filter(
      (col) =>
        !col.toLowerCase().includes("total") &&
        !col.toLowerCase().includes("week")
    );
    console.log("Dynamic categories from table1:", categories);

    const categoryTotals: { [key: string]: number } = {};

    // Sum up all category totals across all weeks
    tableData.table1.forEach((row: any) => {
      categories.forEach((category) => {
        const value =
          parseFloat(String(row[category] || 0).replace(/[$,]/g, "")) || 0;
        categoryTotals[category] = (categoryTotals[category] || 0) + value;
        totalSales += value;
      });
    });

    // Create pie chart data with percentages
    if (totalSales > 0) {
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

      Object.entries(categoryTotals).forEach(([category, total], index) => {
        const percentage = (total / totalSales) * 100;
        if (percentage > 0.5) {
          // Only show categories with > 0.5%
          categoryData.push({
            name: category,
            value: Math.round(percentage * 10) / 10,
            color: colors[index % colors.length],
          });
        }
      });
    }

    // TABLE 2: Percentage Changes - Dynamic processing
    let table2Data = [];
    if (
      tableData.table2 &&
      Array.isArray(tableData.table2) &&
      tableData.table2.length > 0
    ) {
      const table2Columns = getTableColumns(tableData.table2);
      console.log("Table2 columns:", table2Columns);

      table2Data = tableData.table2.map((row: any) => {
        const processedRow: any = { week: `${row.Week}` };
        table2Columns.forEach((col) => {
          let value = row[col];
          if (typeof value === "string" && value.includes("%")) {
            value = parseFloat(value.replace(/%/g, "")) || 0;
          } else if (typeof value === "string") {
            value = parseFloat(value.replace(/[$,]/g, "")) || 0;
          }
          processedRow[col] = value || 0;
        });
        return processedRow;
      });
    }

    // TABLE 3: In-House Percentages - Dynamic processing
    let inHousePercentData = [];
    if (
      tableData.table3 &&
      Array.isArray(tableData.table3) &&
      tableData.table3.length > 0
    ) {
      const table3Columns = getTableColumns(tableData.table3);
      console.log("Table3 columns:", table3Columns);

      // Find In-House column dynamically
      const inHouseColumn =
        table3Columns.find(
          (col) =>
            col.toLowerCase().includes("house") ||
            col.toLowerCase().includes("in-house")
        ) || table3Columns[0];

      inHousePercentData = tableData.table3.map((row: any) => {
        let value = row[inHouseColumn];
        if (typeof value === "string" && value.includes("%")) {
          value = parseFloat(value.replace(/%/g, "")) || 0;
        } else if (typeof value === "string") {
          value = parseFloat(value.replace(/[$,]/g, "")) || 0;
        }
        return {
          week: `${row.Week}`,
          percent: Math.round((value || 0) * 10) / 10,
        };
      });
    }

    // TABLE 4: Additional analysis data - Dynamic processing
    let table4Data = [];
    if (
      tableData.table4 &&
      Array.isArray(tableData.table4) &&
      tableData.table4.length > 0
    ) {
      const table4Columns = getTableColumns(tableData.table4);
      console.log("Table4 columns:", table4Columns);

      table4Data = tableData.table4.map((row: any) => {
        const processedRow: any = { week: `${row.Week}` };
        table4Columns.forEach((col) => {
          let value = row[col];
          if (typeof value === "string" && value.includes("%")) {
            value = parseFloat(value.replace(/%/g, "")) || 0;
          } else if (typeof value === "string") {
            value = parseFloat(value.replace(/[$,]/g, "")) || 0;
          }
          processedRow[col] = value || 0;
        });
        return processedRow;
      });
    }

    // Process regular In-House data (percentage of total sales per week from table1)
    const inHouseData = tableData.table1.map((row: any) => {
      const inHouseColumn = categories.find(
        (col) =>
          col.toLowerCase().includes("house") ||
          col.toLowerCase().includes("in-house")
      );

      const inHouseValue =
        parseFloat(String(row[inHouseColumn] || 0).replace(/[$,]/g, "")) || 0;
      const grandTotalColumn =
        table1Columns.find((col) => col.toLowerCase().includes("total")) ||
        "Grand Total";
      const grandTotal =
        parseFloat(String(row[grandTotalColumn] || 0).replace(/[$,]/g, "")) ||
        0;
      const percent = grandTotal > 0 ? (inHouseValue / grandTotal) * 100 : 0;

      return {
        week: `${row.Week}`,
        percent: Math.round(percent * 10) / 10,
      };
    });

    // WOW trends data - use table2 or table4 based on availability
    const wowTrendsData = table2Data.length > 0 ? table2Data : table4Data;

    return {
      totalSalesData,
      categoryData,
      inHousePercentData,
      inHouseData,
      wowTrendsData,
      availableColumns: {
        table1: table1Columns,
        table2: getTableColumns(tableData.table2 || []),
        table3: getTableColumns(tableData.table3 || []),
        table4: getTableColumns(tableData.table4 || []),
      },
    };
  };

  const chartData = processTableData();
  console.log("Processed chart data:", chartData);

  // Calculate total sales for display
  const totalSalesValue = chartData.totalSalesData.reduce(
    (sum, item) => sum + item.sales,
    0
  );

  // Custom label for pie charts
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    if (percent < 0.05) return null; // Don't show labels for slices < 5%

    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180);
    const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Category legend component
  const CategoryLegend = ({ data }: { data: any[] }) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        marginTop: "8px",
      }}
    >
      {data.map((entry, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            alignItems: "center",
            padding: "4px",
            borderRadius: "4px",
            transition: "background-color 0.2s ease",
          }}
          className="legend-item"
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              marginRight: "8px",
              backgroundColor: entry.color,
            }}
          />
          <div style={{ fontSize: "14px" }}>{entry.name}</div>
          <div
            style={{ fontSize: "14px", fontWeight: "500", marginLeft: "auto" }}
          >
            {entry.value}%
          </div>
        </div>
      ))}
    </div>
  );

  // In-House Percentage Progress Bars - dynamic based on real data
  const InHouseProgressBars = () => {
    if (chartData.inHouseData.length === 0) return null;

    const maxPercent = Math.max(...chartData.inHouseData.map((d) => d.percent));
    const uniquePercentages = [
      ...new Set(chartData.inHouseData.map((d) => d.percent)),
    ]
      .filter((p) => p > 0)
      .sort((a, b) => a - b)
      .slice(0, 3); // Show top 3 percentages

    if (uniquePercentages.length === 0) return null;

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          marginTop: "16px",
        }}
      >
        {uniquePercentages.map((percentage, index) => (
          <div
            key={percentage}
            style={{ display: "flex", flexDirection: "column" }}
          >
            <div
              style={{
                width: "100%",
                height: "24px",
                backgroundColor: "rgba(77, 141, 141, 0.1)",
                borderRadius: "12px",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${Math.min((percentage / maxPercent) * 100, 100)}%`,
                  backgroundColor: "#4D8D8D",
                  borderRadius: "12px",
                  transition: "width 0.8s ease",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "12px",
                  fontWeight: "500",
                  color: percentage > 50 ? "white" : "#4D8D8D",
                }}
              >
                {percentage.toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Dynamic WOW chart bars based on available columns
  const renderWOWBars = () => {
    if (chartData.wowTrendsData.length === 0) return null;

    const availableColumns =
      chartData.availableColumns.table2.length > 0
        ? chartData.availableColumns.table2
        : chartData.availableColumns.table4;

    const colors = [
      "#4D8D8D",
      "#2D5F5F",
      "#7DCBC4",
      "#FFCE56",
      "#9FE2E0",
      "#8BC34A",
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
    ];

    return availableColumns.map((column, index) => (
      <Bar
        key={column}
        dataKey={column}
        fill={colors[index % colors.length]}
        barSize={8}
        name={column}
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
          {/* for {selectedLocation} */}
        </Typography>
      )}

      {/* Debug info - show available tables */}
      {/* <Typography variant="caption" sx={{ color: "#666", mb: 1 }}>
        Available tables: Table1 ({chartData.availableColumns.table1.length}{" "}
        cols), Table2 ({chartData.availableColumns.table2.length} cols), Table3
        ({chartData.availableColumns.table3.length} cols), Table4 (
        {chartData.availableColumns.table4.length} cols)
      </Typography> */}

      {/* First row - Total Sales and Sales Category */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "24px" }}>
        {/* Total Sales (from Table1) */}
        {/* <div style={{ 
          width: 'calc(50% - 12px)', 
          minWidth: '300px',
          flexGrow: 1,
          padding: '24px', 
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          backgroundColor: 'white',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        }} className="stat-card">
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#333' }}>
            Total Sales
          </div>
          <div style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData.totalSalesData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.1)" />
                <XAxis dataKey="week" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  formatter={(value) => [`${value}k`, 'Sales']}
                  contentStyle={{ 
                    borderRadius: 8, 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    border: 'none' 
                  }} 
                />
                <Bar 
                  dataKey="sales" 
                  fill="#4D8D8D" 
                  barSize={30} 
                  radius={[4, 4, 0, 0]}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ fontSize: '22px', fontWeight: '600', marginTop: '8px', color: '#4D8D8D' }}>
            ${totalSalesValue.toFixed(1)}k
          </div>
        </div> */}
        <div
          style={{
            width: "calc(50% - 12px)",
            minWidth: "300px",
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
          <div
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              marginBottom: "16px",
              color: "#333",
              textAlign: "left",
              width: "100%",
            }}
          >
            Daily Sales
          </div>

          {/* Chart container */}
          <div
            style={{
              height: "250px",
              width: "100%",
              marginBottom: "20px",
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData.totalSalesData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgba(0,0,0,0.1)"
                />
                <XAxis dataKey="week" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value) => [`${value}k`, "Sales"]}
                  contentStyle={{
                    borderRadius: 8,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    border: "none",
                  }}
                />
                <Bar
                  dataKey="sales"
                  fill="#4D8D8D"
                  barSize={30}
                  radius={[4, 4, 0, 0]}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Large centered total value below the chart */}
          <div
            style={{
              fontSize: "48px",
              fontWeight: "700",
              color: "#4D8D8D",
              textAlign: "center",
              lineHeight: "4.1",
              width: "100%",
            }}
          >
            <span style={{ color: "black" }}>Sales : </span> $
            {totalSalesValue.toFixed(1)}k
          </div>
        </div>

        {/* Sales Category (from Table1) */}
        <div
          style={{
            width: "calc(50% - 12px)",
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
          <div
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              marginBottom: "16px",
              color: "#333",
            }}
          >
            Sales Category
          </div>
          <div
            style={{
              height: "250px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {chartData.categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    labelLine={false}
                    label={renderCustomizedLabel}
                  >
                    {chartData.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: "center", color: "#999" }}>
                No category data available
              </div>
            )}
          </div>
          <CategoryLegend data={chartData.categoryData} />
        </div>
      </div>

      {/* Second row - In-House Analysis */}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "24px" }}>
        {/* % of In-House (from Table3) */}
        {/* <div
          style={{
            width: "calc(50% - 12px)",
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
          <div
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              marginBottom: "16px",
              color: "#333",
            }}
          >
            In-House Analysis
          </div>
          <div style={{ height: "250px" }}>
            {chartData.inHousePercentData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData.inHousePercentData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="rgba(0,0,0,0.1)"
                  />
                  <XAxis dataKey="week" axisLine={false} tickLine={false} />
                  <YAxis
                    tickFormatter={(value) => `${value}%`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value) => [`${value}%`, "Percentage"]}
                    contentStyle={{
                      borderRadius: 8,
                      boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                      border: "none",
                    }}
                  />
                  <Bar
                    dataKey="percent"
                    fill="#4D8D8D"
                    barSize={30}
                    radius={[4, 4, 0, 0]}
                    animationDuration={1500}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  color: "#999",
                }}
              >
                No Table3 data available
              </div>
            )}
          </div>
          <InHouseProgressBars />
        </div> */}

        {/* In-House % of Total (calculated from Table1) */}
        {/* <div
          style={{
            width: "calc(50% - 12px)",
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
          <div
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              marginBottom: "16px",
              color: "#333",
            }}
          >
            In-House % of Total
          </div>
          <div style={{ height: "250px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData.inHouseData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgba(0,0,0,0.1)"
                />
                <XAxis dataKey="week" axisLine={false} tickLine={false} />
                <YAxis
                  tickFormatter={(value) => `${value}%`}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value) => [`${value}%`, "Percentage"]}
                  contentStyle={{
                    borderRadius: 8,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    border: "none",
                  }}
                />
                <Bar
                  dataKey="percent"
                  fill="#7DCBC4"
                  barSize={30}
                  radius={[4, 4, 0, 0]}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "16px",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            {chartData.inHouseData.slice(0, 3).map((item, index) => (
              <div
                key={index}
                style={{
                  flex: 1,
                  minWidth: "60px",
                  textAlign: "center",
                  padding: "8px",
                  borderRadius: "4px",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#4D8D8D",
                  backgroundColor: "rgba(77, 141, 141, 0.1)",
                  transition: "background-color 0.2s ease",
                  cursor: "pointer",
                }}
                className="percentage-pill"
              >
                W{item.week}: {item.percent}%
              </div>
            ))}
          </div>
        </div> */}
      </div>

      {/* Third row - WOW Trends (from Table2 or Table4) */}
      {chartData.wowTrendsData.length > 0 && (
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
          <div
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              marginBottom: "16px",
              color: "#333",
            }}
          >
            Weekly Sales
            {/* ({chartData.availableColumns.table2.length > 0 ? 'Table2' : 'Table4'}) */}
          </div>
          <div style={{ height: "300px", overflow: "auto" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData.wowTrendsData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                barCategoryGap={20}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgba(0,0,0,0.1)"
                />
                <XAxis dataKey="week" axisLine={false} tickLine={false} />
                <YAxis
                  tickFormatter={(value) => `${value}%`}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value) => [`${value}%`, ""]}
                  contentStyle={{
                    borderRadius: 8,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    border: "none",
                  }}
                />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ paddingTop: "20px" }}
                />
                {renderWOWBars()}
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
            cursor: pointer;
          }
          .percentage-pill:hover {
            background-color: rgba(77, 141, 141, 0.2);
          }
          @media (max-width: 768px) {
            .stat-card {
              width: 100%;
            }
          }
        `}
      </style>
    </div>
  );
};

export default SalesSplitDashboard;

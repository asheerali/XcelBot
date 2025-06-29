import React, { useState } from "react";
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
  LabelList,
  Legend,
  Tooltip,
  LineChart,
  Line,
  ComposedChart,
} from "recharts";

// Interface for the product mix data
interface ProductMixData {
  table1?: Array<{
    net_sales?: number[];
    net_sales_change?: number[];
    orders?: number[];
    orders_change?: number[];
    qty_sold?: number[];
    qty_sold_change?: number[];
    average_order_value?: number[];
    average_order_value_change?: number[];
    average_items_per_order?: number[];
    average_items_per_order_change?: number[];
    unique_orders?: number[];
    unique_orders_change?: number[];
    total_quantity?: number[];
    total_quantity_change?: number[];
  }>;
  table2?: Array<{
    Category: string;
    Sales: number;
    Percentage: number;
  }>;
  table3?: Array<{
    "Menu Group": string;
    Sales: number;
  }>;
  table4?: Array<{
    Server: string;
    Sales: number;
  }>;
  table5?: Array<{
    Item: string;
    Server: string;
    Quantity: number;
    Sales: number;
  }>;
  table6?: Array<{
    Location: string;
    Sales: number;
  }>;
  table7?: Array<{
    "Menu Item": string;
    Price: number;
  }>;
  table8?: Array<{
    Item: string;
    Change: number;
    Direction: string;
    Category: string;
  }>;
  table9?: Array<{
    Item: string;
    Price: number;
  }>;
  table10?: Array<{
    "Sales Category": string;
    "Grand Total": number;
    [key: string]: any; // This allows any week keys like "Week 14", "Week 15", etc.
  }>;
  table11?: Array<{
    "Sales Category": string;
    This_4_Weeks_Sales: number;
    Last_4_Weeks_Sales: number;
    Percent_Change: number;
  }>;
  table12?: Array<{
    "Sales Category": string;
    [key: string]: any; // This allows for different time periods
  }>;
  table13?: Array<{
    Sales_Category: string; // FIXED: Updated to use Sales_Category with underscore
    "Grand Total": number;
    Monday?: number;
    Tuesday?: number;
    Wednesday?: number;
    Thursday?: number;
    Friday?: number;
    Saturday?: number;
    Sunday?: number;
  }>;
  servers?: string[];
  categories?: string[];
  locations?: string[];
}

interface SalesDashboardProps {
  productMixData?: ProductMixData;
}

const SalesDashboard: React.FC<SalesDashboardProps> = ({ productMixData }) => {
  // State for hover functionality
  const [hoveredPoint, setHoveredPoint] = useState<{
    categoryIndex: number;
    dayIndex: number;
    data: any;
  } | null>(null);

  // Use ONLY backend data - no fallback to dummy data
  const data = productMixData;

  // Debug log to see what data is being received from backend
  console.log("ProductMixData received from backend:", data);

  // Extract summary data from table1 with proper handling
  const summaryData = data?.table1?.[0] || {};

  // Helper function to safely get values and changes
  const getSafeValue = (data: any, defaultValue: any = 0) => {
    if (Array.isArray(data) && data.length > 0) {
      return data[0] !== null && data[0] !== undefined ? data[0] : defaultValue;
    }
    return data !== null && data !== undefined ? data : defaultValue;
  };

  // Helper function to safely get change values (return exact value from backend)
  const getSafeChangeValue = (data: any) => {
    if (Array.isArray(data) && data.length > 0) {
      return data[0]; // Return exact value, including -1, null, etc.
    }
    return data; // Return exact value as is
  };

  // Extract values from table1
  const netSales = getSafeValue(summaryData.net_sales, 0);
  const netSalesChange = getSafeChangeValue(summaryData.net_sales_change);

  const orders = getSafeValue(summaryData.orders, 0);
  const ordersChange = getSafeChangeValue(summaryData.orders_change);

  const qtySold = getSafeValue(summaryData.qty_sold, 0);
  const qtySoldChange = getSafeChangeValue(summaryData.qty_sold_change);

  const averageOrderValue = getSafeValue(summaryData.average_order_value, 0);
  const averageOrderValueChange = getSafeChangeValue(
    summaryData.average_order_value_change
  );

  const averageItemsPerOrder = getSafeValue(
    summaryData.average_items_per_order,
    0
  );
  const averageItemsPerOrderChange = getSafeChangeValue(
    summaryData.average_items_per_order_change
  );

  const uniqueOrders = getSafeValue(summaryData.unique_orders, 0);
  const uniqueOrdersChange = getSafeChangeValue(
    summaryData.unique_orders_change
  );

  const totalQuantity = getSafeValue(summaryData.total_quantity, 0);
  const totalQuantityChange = getSafeChangeValue(
    summaryData.total_quantity_change
  );

  // Format currency - UPDATED: Shows exact value with $ prefix
  const formatCurrency = (value: number) => {
    return `$${value}`;
  };

  // Format percentage change with proper styling - show exact backend values
  // Updated formatPercentageChange function with comma formatting
  // Replace this function in your SalesDashboard component

  // Updated formatPercentageChange function with comma formatting
  // Replace this function in your SalesDashboard component

  const formatPercentageChange = (value: any) => {
    // If value is null or undefined, show as is
    if (value === null || value === undefined) {
      return { text: "null", color: "#666", arrow: "" };
    }

    // If value is exactly -1, show it as -1%
    if (value === -1) {
      return { text: "-1%", color: "#d32f2f", arrow: "▼" };
    }

    // If it's a number, format it as percentage with commas and proper decimal places
    if (typeof value === "number") {
      const isPositive = value > 0;
      const isZero = value === 0;

      if (isZero) {
        return { text: "0%", color: "#666", arrow: "" };
      }

      // Format the number with commas and exactly 2 decimal places for decimals
      const absValue = Math.abs(value);
      let formattedValue;

      if (absValue % 1 === 0) {
        // Integer value - no decimal places needed
        formattedValue = absValue.toLocaleString("en-US");
      } else {
        // Decimal value - format with exactly 2 decimal places
        formattedValue = absValue.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      }

      return {
        text: `${isPositive ? "+" : "-"}${formattedValue}%`,
        color: isPositive ? "#2e7d32" : "#d32f2f",
        arrow: isPositive ? "▲" : "▼",
      };
    }

    // For any other type, convert to string
    return { text: String(value), color: "#666", arrow: "" };
  };
  // Stat card component with change indicator
  const StatCard = ({ title, value, change, color, formatValue }) => {
    const changeFormatted = formatPercentageChange(change);

    return (
      <div
        style={{
          padding: "16px",
          borderRadius: "8px",
          borderTop: `4px solid ${color}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          backgroundColor: "white",
          height: "100%",
          minHeight: "90px",
        }}
        className="stat-card"
      >
        <div
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: color,
            marginBottom: "2px",
          }}
        >
          {formatValue(value)}
        </div>
        <div style={{ fontSize: "14px", color: "#666", marginBottom: "4px" }}>
          {title}
        </div>

        {/* Change indicator with "vs. previous period" text */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            marginTop: "auto",
            whiteSpace: "nowrap",
            flexWrap: "nowrap",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              color: "#999",
              marginRight: "4px",
              whiteSpace: "nowrap",
            }}
          >
            vs. previous period
          </span>
          {changeFormatted.arrow && (
            <span
              style={{
                color: changeFormatted.color,
                fontSize: "10px",
                fontWeight: "bold",
              }}
            >
              {changeFormatted.arrow}
            </span>
          )}
          <span
            style={{
              color: changeFormatted.color,
              fontSize: "12px",
              fontWeight: "600",
            }}
          >
            {changeFormatted.text}
          </span>
        </div>
      </div>
    );
  };

  // FIXED: Enhanced Sales Trend Bar Chart Component using table13 data with correct field name
  const SalesTrendChart = () => {
    // FIXED: Get all categories from table13 using Sales_Category (with underscore)
    // Include empty Sales_Category if it has sales data, but exclude "Grand Total"
    const allCategories = (data?.table13 || []).filter((item) => {
      const isGrandTotal = item["Sales_Category"] === "Grand Total";
      const hasValidCategory =
        item["Sales_Category"] !== undefined && item["Sales_Category"] !== null;
      console.log(
        `Filtering item: "${item["Sales_Category"]}" - isGrandTotal: ${isGrandTotal}, hasValidCategory: ${hasValidCategory}, Monday: ${item.Monday}`
      );
      return !isGrandTotal && hasValidCategory;
    });

    console.log("All categories found:", allCategories); // Debug log
    console.log(
      "Categories with sales data:",
      allCategories.map((cat) => ({
        category: cat["Sales_Category"] || "(empty)",
        monday: cat.Monday,
        tuesday: cat.Tuesday,
        wednesday: cat.Wednesday,
      }))
    ); // Debug log

    if (allCategories.length === 0) {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "400px",
            color: "#666",
            fontSize: "16px",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <div>No category data available</div>
          <div style={{ fontSize: "12px", color: "#999" }}>
            Found {(data?.table13 || []).length} total items in table13
          </div>
        </div>
      );
    }

    // Days of week from table13 structure
    const dayKeys = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    // Filter out days that don't have data across categories (keep Sunday even if 0)
    const availableDays = dayKeys.filter((day) =>
      allCategories.some(
        (category) => typeof category[day] === "number" && category[day] >= 0
      )
    );

    if (availableDays.length === 0) {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "400px",
            color: "#666",
            fontSize: "16px",
          }}
        >
          No daily sales data found
        </div>
      );
    }

    // Generate dynamic color palette based on number of categories
    const generateColors = (count) => {
      const baseColors = [
        "#4285f4",
        "#8bc34a",
        "#ff9800",
        "#9c27b0",
        "#f44336",
        "#00bcd4",
        "#795548",
        "#607d8b",
        "#e91e63",
        "#3f51b5",
      ];
      const colors = [];
      for (let i = 0; i < count; i++) {
        if (i < baseColors.length) {
          colors.push(baseColors[i]);
        } else {
          // Generate additional colors using HSL
          const hue = (i * 137.508) % 360;
          colors.push(`hsl(${hue}, 70%, 50%)`);
        }
      }
      return colors;
    };

    const colors = generateColors(allCategories.length);

    // Transform data for Recharts format - create aggregated data with category details
    const chartData = availableDays.map((day) => {
      const dataPoint = { day };
      let totalSales = 0;
      const categoryBreakdown = [];

      allCategories.forEach((category, index) => {
        const categoryName = category["Sales_Category"] || "Other Items"; // FIXED: Handle empty category names
        const categoryValue = category[day] || 0;
        totalSales += categoryValue;

        if (categoryValue > 0) {
          categoryBreakdown.push({
            name: categoryName,
            value: categoryValue,
            color: colors[index],
          });
        }
      });

      // Sort breakdown by value (highest first)
      categoryBreakdown.sort((a, b) => b.value - a.value);

      dataPoint.totalSales = totalSales;
      dataPoint.categoryBreakdown = categoryBreakdown;

      // Debug log to verify totals
      if (day === "Monday") {
        console.log(`📊 Monday total calculated: ${totalSales}`);
        console.log(`📊 Monday categories included:`, categoryBreakdown);
        console.log(`📊 Expected Monday total: $119,925`);
      }

      return dataPoint;
    });

    // Calculate moving average (3-day moving average)
    const calculateMovingAverage = (data, period = 3) => {
      return data.map((item, index) => {
        if (index < period - 1) {
          // For early data points, use available data
          const availableData = data.slice(0, index + 1);
          const sum = availableData.reduce(
            (acc, curr) => acc + curr.totalSales,
            0
          );
          return {
            ...item,
            movingAverage: sum / availableData.length,
          };
        } else {
          // Calculate moving average for the specified period
          const slice = data.slice(index - period + 1, index + 1);
          const sum = slice.reduce((acc, curr) => acc + curr.totalSales, 0);
          return {
            ...item,
            movingAverage: sum / period,
          };
        }
      });
    };

    const chartDataWithMA = calculateMovingAverage(chartData);

    // Custom tooltip for better formatting
    // Updated CustomTooltip component - replace the existing one in your SalesTrendChart
    const CustomTooltip = ({ active, payload, label }) => {
      if (
        active &&
        payload &&
        payload.length &&
        payload[0].payload.categoryBreakdown
      ) {
        const breakdown = payload[0].payload.categoryBreakdown;
        const total = payload[0].payload.totalSales;

        return (
          <div
            style={{
              background: "white",
              color: "#333",
              padding: "12px 16px",
              borderRadius: "8px",
              fontSize: "12px",
              minWidth: "250px",
              maxWidth: "350px", // Increased maxWidth to accommodate more content
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              border: "2px solid #4caf50",
              // Removed any height constraints to allow natural expansion
            }}
          >
            <div
              style={{
                fontWeight: "bold",
                marginBottom: "8px",
                fontSize: "14px",
                borderBottom: "1px solid rgba(0,0,0,0.1)",
                paddingBottom: "6px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>{label}</span>
              <span style={{ color: "#4caf50", fontWeight: "bold" }}>
                Total: $
                {total.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            {/* Category breakdown - REMOVED maxHeight and overflowY to prevent scrolling */}
            <div>
              {breakdown.map((entry, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "4px",
                    alignItems: "center",
                    padding: "2px 0",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "2px",
                        backgroundColor: entry.color,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontSize: "11px",
                      }}
                    >
                      {entry.name}
                    </span>
                  </span>
                  <span
                    style={{
                      fontWeight: "bold",
                      marginLeft: "8px",
                      flexShrink: 0,
                      fontSize: "11px",
                    }}
                  >
                    $
                    {entry.value.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              ))}
            </div>

            {/* Show percentage of top categories */}
            {breakdown.length > 3 && (
              <div
                style={{
                  marginTop: "8px",
                  paddingTop: "6px",
                  borderTop: "1px solid rgba(0,0,0,0.1)",
                  fontSize: "10px",
                  color: "#666",
                }}
              >
                Top 3 categories:{" "}
                {(
                  (breakdown
                    .slice(0, 3)
                    .reduce((sum, cat) => sum + cat.value, 0) /
                    total) *
                  100
                ).toFixed(1)}
                % of total
              </div>
            )}
          </div>
        );
      }
      return null;
    };

    return (
      <div style={{ width: "100%", height: "400px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartDataWithMA}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#666" />
            <YAxis
              tick={{ fontSize: 12 }}
              stroke="#666"
              tickFormatter={(value) =>
                `${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: "12px" }} />

            {/* Single aggregated bar showing total sales */}
            <Bar
              dataKey="totalSales"
              fill="#8ffcff"
              radius={[4, 4, 0, 0]}
              name="Total Sales"
            />

            {/* Moving average line */}
            <Line
              type="monotone"
              dataKey="movingAverage"
              stroke="#ff6b35"
              strokeWidth={3}
              dot={{ fill: "#ff6b35", strokeWidth: 2, r: 4 }}
              activeDot={{
                r: 6,
                stroke: "#ff6b35",
                strokeWidth: 2,
                fill: "white",
              }}
              name="Moving Average"
              connectNulls={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // UPDATED: Get categories data using ONLY table11 - showing exact table11 fields
  const getCategoriesData = () => {
    // PRIORITY: Use ONLY table11 data (no fallbacks to table10 or table13)
    const table11Categories = (data?.table11 || [])
      .filter(
        (item) =>
          item["Sales Category"] &&
          item["Sales Category"].trim() !== "" &&
          item["Sales Category"] !== "Grand Total"
      )
      .sort(
        (a, b) =>
          (b["This_4_Weeks_Sales"] || 0) - (a["This_4_Weeks_Sales"] || 0)
      );

    // Generate colors for all categories
    const generateColors = (count) => {
      const baseColors = [
        "#4285f4",
        "#8bc34a",
        "#ff9800",
        "#9c27b0",
        "#f44336",
        "#00bcd4",
        "#795548",
        "#607d8b",
        "#e91e63",
        "#3f51b5",
      ];
      const colors = [];
      for (let i = 0; i < count; i++) {
        if (i < baseColors.length) {
          colors.push(baseColors[i]);
        } else {
          // Generate additional colors using HSL
          const hue = (i * 137.508) % 360;
          colors.push(`hsl(${hue}, 70%, 50%)`);
        }
      }
      return colors;
    };

    const colors = generateColors(table11Categories.length);

    // UPDATED: Return table11 data with exact field mappings
    return table11Categories.map((category, index) => {
      // Extract exact table11 fields
      const salesCategory = category["Sales Category"] || "";
      const this4WeeksSales = category["This_4_Weeks_Sales"] || 0;
      const last4WeeksSales = category["Last_4_Weeks_Sales"] || 0;
      const percentChange = category["Percent_Change"] || 0;

      return {
        // Keep all original table11 fields
        ...category,

        // Add convenience fields for display
        salesCategory,
        this4WeeksSales,
        last4WeeksSales,
        percentChange,
        color: colors[index],

        // Calculate additional metrics
        salesDifference: this4WeeksSales - last4WeeksSales,
        isIncrease: percentChange >= 0,
      };
    });
  };

  const categoriesData = getCategoriesData();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        gap: "24px",
        padding: "16px",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      {/* First row - ALL 5 Stats Cards in one row - Only show if table1 data exists */}
      {data?.table1?.[0] ? (
        <div style={{ width: "100%" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <StatCard
              title="Net Sales"
              value={netSales}
              change={netSalesChange}
              color="#1e88e5"
              formatValue={(v) => `${v.toLocaleString("en-US")}`}
            />

            <StatCard
              title="Orders"
              value={orders}
              change={ordersChange}
              color="#7cb342"
              formatValue={(v) => v.toLocaleString("en-US")}
            />

            <StatCard
              title="Qty Sold"
              value={qtySold}
              change={qtySoldChange}
              color="#fb8c00"
              formatValue={(v) => v.toLocaleString("en-US")}
            />

            <StatCard
              title="Avg Order Value"
              value={averageOrderValue}
              change={averageOrderValueChange}
              color="#9c27b0"
              formatValue={(v) =>
                `${v.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              }
            />

            <StatCard
              title="Average items per order"
              value={averageItemsPerOrder}
              change={averageItemsPerOrderChange}
              color="#f44336"
              formatValue={(v) =>
                v.toLocaleString("en-US", {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })
              }
            />
          </div>
        </div>
      ) : (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            backgroundColor: "white",
            borderRadius: "8px",
            color: "#666",
            border: "1px dashed #ddd",
            marginBottom: "24px",
          }}
        >
          No summary statistics available. Please ensure your backend is
          providing table1 data with the required fields.
        </div>
      )}

      {/* Second row - Sales Trend Bar Chart using table13 data - Only show if table13 data exists */}
      {data?.table13 && data.table13.length > 0 ? (
        <div style={{ width: "100%" }}>
          <div
            style={{
              padding: "12px",
              borderRadius: "8px",
              height: "100%",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              backgroundColor: "white",
              minHeight: "500px",
            }}
          >
            <div
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                marginBottom: "12px",
              }}
            >
              Daily Sales Overview
            </div>

            {/* Enhanced Bar Chart using table13 data */}
            <SalesTrendChart />
          </div>
        </div>
      ) : (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            backgroundColor: "white",
            borderRadius: "8px",
            color: "#666",
            border: "1px dashed #ddd",
            marginBottom: "24px",
          }}
        >
          No table13 data available. Please ensure your backend is providing
          table13 with Sales_Category and daily sales data (Monday, Tuesday,
          etc.).
        </div>
      )}

      {/* UPDATED: Sales Categories Performance section - showing table11 fields */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div
          style={{
            fontSize: "18px",
            fontWeight: "bold",
            marginBottom: "8px",
            color: "#333",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          Sales Categories Performance
        </div>

        {/* Show table11 categories with same UI as image but table11 field names */}
        {categoriesData.length === 0 ? (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              backgroundColor: "white",
              borderRadius: "8px",
              color: "#666",
              border: "1px dashed #ddd",
            }}
          >
            No table11 data available. Please ensure your backend is providing
            table11 with Sales Category, This_4_Weeks_Sales, Last_4_Weeks_Sales,
            and Percent_Change fields.
          </div>
        ) : (
          Array.from(
            { length: Math.ceil(categoriesData.length / 2) },
            (_, rowIndex) => (
              <div
                key={rowIndex}
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "16px",
                }}
              >
                {categoriesData
                  .slice(rowIndex * 2, rowIndex * 2 + 2)
                  .map((category, index) => (
                    <div
                      key={category["Sales Category"]}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "12px 16px",
                        backgroundColor: "white",
                        borderRadius: "8px",
                        borderLeft: `6px solid ${category.color}`,
                        minHeight: "65px",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                        transition: "transform 0.3s ease, box-shadow 0.3s ease",
                        cursor: "pointer",
                      }}
                      className="category-card"
                    >
                      <div
                        style={{
                          width: "16px",
                          height: "16px",
                          borderRadius: "50%",
                          backgroundColor: category.color,
                          marginRight: "16px",
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontWeight: "700",
                            fontSize: "15px",
                            color: "#333",
                            marginBottom: "4px",
                          }}
                        >
                          {category["Sales Category"]}
                        </div>
                        <div style={{ fontSize: "13px", color: "#666" }}>
                          Last 4 Weeks Sales: $
                          {category["Last_4_Weeks_Sales"].toLocaleString()}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            fontSize: "16px",
                            fontWeight: "bold",
                            color:
                              category.percentChange >= 0
                                ? "#2e7d32"
                                : "#d32f2f",
                            marginBottom: "4px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            gap: "4px",
                          }}
                        >
                          <span style={{ fontSize: "12px" }}>
                            {category.percentChange >= 0 ? "▲" : "▼"}
                          </span>
                          {category.percentChange >= 0 ? "+" : ""}
                          {category.percentChange}%
                        </div>
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: "600",
                            color: "#333",
                          }}
                        >
                          This 4 Weeks Sales: $
                          {category["This_4_Weeks_Sales"].toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )
          )
        )}
      </div>

      {/* Add CSS for hover effects */}
      <style>
        {`
          .stat-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 30px rgba(0,0,0,0.12);
          }
          .category-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 30px rgba(0,0,0,0.12);
          }
          .legend-item:hover {
            background-color: rgba(76, 176, 176, 0.1);
          }
          .item-name:hover {
            color: #4CB0B0;
            font-weight: 500;
          }
        `}
      </style>
    </div>
  );
};

export default SalesDashboard;

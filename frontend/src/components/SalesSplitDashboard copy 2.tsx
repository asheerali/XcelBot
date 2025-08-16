// // Updated SalesSplitDashboard.tsx - Bar Chart for Category Performance Trends
// // IMPORTANT: All decimal values (like 4150.77) are now preserved and displayed as "4,150.77" or "$4,150.77"
// import React from "react";
// import {
//   BarChart,
//   Bar,
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   ResponsiveContainer,
//   Legend,
//   Tooltip,
//   ComposedChart,
// } from "recharts";
// import { Box, Typography, Card, CardContent, Grid } from "@mui/material";
// import { bars_color } from "../constants";

// interface SalesSplitDashboardProps {
//   tableData?: any;
//   selectedLocation?: string;
// }

// const SalesSplitDashboard: React.FC<SalesSplitDashboardProps> = ({
//   tableData,
//   selectedLocation,
// }) => {
//   // Return early if no data
//   if (
//     !tableData ||
//     !tableData.table1 ||
//     !Array.isArray(tableData.table1) ||
//     tableData.table1.length === 0
//   ) {
//     return (
//       <Box sx={{ p: 3, textAlign: "center" }}>
//         <Typography variant="h6" color="text.secondary">
//           No sales data available
//         </Typography>
//         <Typography variant="body2" color="text.secondary">
//           Please upload Excel files to view sales analysis
//         </Typography>
//       </Box>
//     );
//   }

//   // Helper function to format numbers with commas (preserving decimals)
//   const formatNumber = (value: number) => {
//     if (isNaN(value) || value === null || value === undefined) return "0";
//     return new Intl.NumberFormat("en-US", {
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 2,
//     }).format(value);
//   };

//   // Helper function to format currency (preserving decimals)
//   const formatCurrency = (value: number) => {
//     if (isNaN(value) || value === null || value === undefined) return "$0.00";
//     return new Intl.NumberFormat("en-US", {
//       style: "currency",
//       currency: "USD",
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     }).format(value);
//   };

//   // Dynamic helper functions to extract table structure
//   const getTableColumns = (table: any[]) => {
//     if (!table || table.length === 0) return [];
//     return Object.keys(table[0]).filter((key) => key !== "Week");
//   };

//   const getNumericColumns = (table: any[]) => {
//     if (!table || table.length === 0) return [];
//     const firstRow = table[0];
//     return Object.keys(firstRow).filter((key) => {
//       if (key === "Week") return false;
//       const value = firstRow[key];
//       return (
//         typeof value === "number" ||
//         (typeof value === "string" &&
//           !value.includes("%") &&
//           !isNaN(parseFloat(value.replace(/[$,]/g, ""))))
//       );
//     });
//   };

//   // Process Daily Sales data from table8 (Day of Week data) - FULL VALUES
//   const processDailySalesData = () => {
//     if (
//       !tableData.table8 ||
//       !Array.isArray(tableData.table8) ||
//       tableData.table8.length === 0
//     ) {
//       console.log("No table8 data available, using fallback");
//       // Fallback to table1 data if table8 is not available
//       return tableData.table1.map((row: any) => ({
//         day: `Week ${row.Week}`,
//         sales: parseFloat(
//           row["Grand Total"] ||
//             row[
//               Object.keys(row).find((key) =>
//                 key.toLowerCase().includes("total")
//               ) || ""
//             ] ||
//             0
//         ),
//         movingAverage: 0, // No moving average for fallback data
//       }));
//     }

//     console.log("Processing table8 data:", tableData.table8);

//     // Define day order (Monday first) and abbreviated days for display
//     const dayOrder = [
//       "Monday",
//       "Tuesday",
//       "Wednesday",
//       "Thursday",
//       "Friday",
//       "Saturday",
//       "Sunday",
//     ];
//     const daysOfWeekMap = {
//       Monday: "Mon",
//       Tuesday: "Tue",
//       Wednesday: "Wed",
//       Thursday: "Thu",
//       Friday: "Fri",
//       Saturday: "Sat",
//       Sunday: "Sun",
//     };

//     // Process the data from table8 - FULL VALUES (preserving decimals)
//     const processedData = tableData.table8.map((row: any) => ({
//       day: daysOfWeekMap[row.Day_of_Week] || row.Day_of_Week,
//       fullDayName: row.Day_of_Week,
//       sales: parseFloat(String(row.Sales || 0).replace(/[$,]/g, "")) || 0,
//       movingAverage:
//         parseFloat(String(row.Moving_Avg || 0).replace(/[$,]/g, "")) || 0,
//       date: row.Date, // Keep the date for reference
//       dayFormatted: row.Day, // add this line
//     }));

//     // Sort the data to ensure Monday comes first
//     return processedData.sort((a, b) => {
//       const aIndex = dayOrder.indexOf(a.fullDayName);
//       const bIndex = dayOrder.indexOf(b.fullDayName);
//       return aIndex - bIndex;
//     });
//   };

//   // NEW: Process Sales Category Bar Chart data from table9 - FULL VALUES
//   // Transform data to have weeks on X-axis and categories as bars
//   const processCategoryBarData = () => {
//     if (
//       !tableData.table9 ||
//       !Array.isArray(tableData.table9) ||
//       tableData.table9.length === 0
//     ) {
//       console.log("No table9 data available");
//       return [];
//     }

//     console.log("Processing table9 data for bar chart:", tableData.table9);

//     // Get all week columns (exclude Category and Grand Total columns)
//     const weekColumns = Object.keys(tableData.table9[0] || {}).filter(
//       (key) => key.startsWith("Week") && key !== "Grand Total"
//     );

//     console.log("Available week columns:", weekColumns);

//     // Transform data to have weeks as x-axis and categories as separate bars
//     const weeklyData: any[] = [];

//     weekColumns.forEach((weekCol) => {
//       const weekData: any = { week: weekCol };

//       // Filter out 'Grand Total' category and add each category's value for this week
//       tableData.table9
//         .filter((row: any) => row.Category && row.Category !== "Grand Total")
//         .forEach((row: any) => {
//           const rawValue =
//             parseFloat(String(row[weekCol] || 0).replace(/[$,]/g, "")) || 0;
//           // FULL VALUES: Preserve decimals, no rounding
//           weekData[row.Category] = rawValue;
//         });

//       weeklyData.push(weekData);
//     });

//     console.log("Processed weekly category data:", weeklyData);
//     return weeklyData;
//   };

//   // Get available categories from table9 data
//   const getAvailableCategories = () => {
//     if (
//       !tableData.table9 ||
//       !Array.isArray(tableData.table9) ||
//       tableData.table9.length === 0
//     ) {
//       return [];
//     }

//     return tableData.table9
//       .filter((row: any) => row.Category && row.Category !== "Grand Total")
//       .map((row: any) => row.Category);
//   };

//   // Process Categories List from table10 - FULL VALUES
//   const processCategoriesList = () => {
//     if (
//       !tableData.table10 ||
//       !Array.isArray(tableData.table10) ||
//       tableData.table10.length === 0
//     ) {
//       console.log("No table10 data available, using table9 categories");
//       // Fallback to table9 categories if table10 is not available
//       if (tableData.table9 && tableData.table9.length > 0) {
//         return tableData.table9
//           .filter((row: any) => row.Category && row.Category !== "Grand Total")
//           .map((row: any, index: number) => ({
//             name: row.Category,
//             color: getCategoryColor(index),
//             lastWeeksSales: formatCurrency(parseFloat(row["Grand Total"]) || 0),
//             percentChange: "N/A",
//             thisWeeksSales: formatCurrency(parseFloat(row["Grand Total"]) || 0),
//           }));
//       }
//       return [];
//     }

//     console.log("Processing table10 data:", tableData.table10);

//     return tableData.table10.map((row: any, index: number) => ({
//       name: row.Category || `Category ${index + 1}`,
//       color: getCategoryColor(index),
//       lastWeeksSales: formatCurrency(parseFloat(row.Last_4_Weeks_Sales) || 0),
//       percentChange: `${row.Percent_Change || 0}%`,
//       thisWeeksSales: formatCurrency(parseFloat(row.This_4_Weeks_Sales) || 0),
//     }));
//   };

//   // Process Weekly Sales Trend data from table11 - FULL VALUES
//   const processWeeklySalesData = () => {
//     if (
//       !tableData.table11 ||
//       !Array.isArray(tableData.table11) ||
//       tableData.table11.length === 0
//     ) {
//       console.log("No table11 data available");
//       return [];
//     }

//     console.log("Processing table11 data:", tableData.table11);

//     // Filter out 'Grand Total' row and process weekly data
//     return tableData.table11
//       .filter((row: any) => row.Week && row.Week !== "Grand Total")
//       .map((row: any) => ({
//         week: row.Week,
//         totalSales:
//           parseFloat(String(row.Total_Sales || 0).replace(/[$,]/g, "")) || 0,
//         totalOrders:
//           parseFloat(String(row.Total_Orders || 0).replace(/[$,]/g, "")) || 0,
//         // FULL VALUES: Keep original sales values with decimals
//         salesDisplay:
//           parseFloat(String(row.Total_Sales || 0).replace(/[$,]/g, "")) || 0,
//       }));
//   };

//   // Calculate moving average for weekly sales data - FULL VALUES
//   const calculateMovingAverage = (
//     data: any[],
//     periods: { [key: string]: number } = { "3week": 3, "5week": 5 }
//   ) => {
//     if (data.length < 2) return data;

//     return data.map((item, index) => {
//       const enhanced = { ...item };

//       // Calculate different moving averages
//       Object.entries(periods).forEach(([name, period]) => {
//         if (index < period - 1) {
//           // For the first few points, use available data
//           const startIndex = 0;
//           const endIndex = index + 1;
//           const subset = data.slice(startIndex, endIndex);
//           const average =
//             subset.reduce((sum, d) => sum + d.salesDisplay, 0) / subset.length;
//           enhanced[`movingAverage${period}Week`] = average;
//         } else {
//           // Calculate moving average for the specified period
//           const startIndex = index - period + 1;
//           const endIndex = index + 1;
//           const subset = data.slice(startIndex, endIndex);
//           const average =
//             subset.reduce((sum, d) => sum + d.salesDisplay, 0) / period;
//           enhanced[`movingAverage${period}Week`] = average;
//         }
//       });

//       return enhanced;
//     });
//   };

//   // Enhanced daily sales processing with moving average - FULL VALUES
//   const processDailySalesWithMovingAverage = () => {
//     const dailyData = processDailySalesData();

//     // Calculate 3-day moving average for daily data
//     return dailyData.map((item, index) => {
//       if (index < 2) {
//         // For first two days, use available data
//         const subset = dailyData.slice(0, index + 1);
//         const average =
//           subset.reduce((sum, d) => sum + d.sales, 0) / subset.length;
//         return {
//           ...item,
//           movingAverage: average,
//         };
//       } else {
//         // Calculate 3-day moving average
//         const subset = dailyData.slice(index - 2, index + 1);
//         const average = subset.reduce((sum, d) => sum + d.sales, 0) / 3;
//         return {
//           ...item,
//           movingAverage: average,
//         };
//       }
//     });
//   };

//   // Color palette for categories
//   const getCategoryColor = (index: number) => {
//     const colors = [
//       "#4D8D8D",
//       "#7DCBC4",
//       "#2D5F5F",
//       "#FFCE56",
//       "#8BC34A",
//       "#9E9E9E",
//       "#FF6B6B",
//       "#4ECDC4",
//       "#45B7D1",
//       "#96CEB4",
//     ];
//     return colors[index % colors.length];
//   };

//   // NEW: Render bars for each category in the chart
//   const renderCategoryBars = () => {
//     const availableCategories = getAvailableCategories();

//     if (availableCategories.length === 0) {
//       console.log("No categories available to render");
//       return null;
//     }

//     console.log("Rendering bars for categories:", availableCategories);

//     return availableCategories.map((category: string, index: number) => (
//       <Bar
//         key={category}
//         dataKey={category}
//         fill={getCategoryColor(index)}
//         name={category}
//         barSize={30}
//         radius={[2, 2, 0, 0]}
//       />
//     ));
//   };

//   // Get processed data
//   const dailySalesDataWithMA = processDailySalesWithMovingAverage();
//   const categoryBarData = processCategoryBarData();
//   const categoriesList = processCategoriesList();
//   const weeklySalesData = processWeeklySalesData();

//   // Calculate enhanced moving average for weekly sales data with multiple periods
//   const weeklySalesWithMovingAvg = calculateMovingAverage(weeklySalesData, {
//     "3": 3, // 3-week moving average
//     "5": 5, // 5-week moving average
//   });

//   console.log("Processed data:", {
//     dailySalesDataWithMA,
//     categoryBarData,
//     categoriesList,
//     weeklySalesData: weeklySalesWithMovingAvg,
//   });

//   // Calculate total sales for display
//   const totalSalesValue = dailySalesDataWithMA.reduce(
//     (sum, item) => sum + item.sales,
//     0
//   );

//   // Enhanced Categories Legend Component
//   const CategoriesLegend = ({ data }: { data: any[] }) => (
//     <div
//       style={{
//         display: "flex",
//         flexDirection: "column",
//         gap: "8px",
//         padding: "16px",
//         backgroundColor: "#f8f9fa",
//         borderRadius: "8px",
//         height: "100%",
//       }}
//     >
//       <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
//         Category Performance Summary
//       </Typography>
//       {data.map((entry, index) => (
//         <div
//           key={index}
//           style={{
//             display: "flex",
//             alignItems: "center",
//             padding: "8px 12px",
//             borderRadius: "6px",
//             transition: "background-color 0.2s ease",
//             cursor: "pointer",
//             backgroundColor: "white",
//             border: "1px solid #e0e0e0",
//           }}
//           className="legend-item"
//         >
//           <div
//             style={{
//               width: "12px",
//               height: "12px",
//               borderRadius: "50%",
//               marginRight: "12px",
//               backgroundColor: entry.color,
//             }}
//           />
//           <div
//             style={{
//               fontSize: "14px",
//               flex: 1,
//               fontWeight: "500",
//             }}
//           >
//             {entry.name}
//           </div>
//           <div
//             style={{
//               display: "flex",
//               flexDirection: "column",
//               alignItems: "flex-end",
//               gap: "2px",
//             }}
//           >
//             <div
//               style={{
//                 fontSize: "12px",
//                 color: "#666",
//                 fontWeight: "400",
//               }}
//             >
//               Last 4 Weeks: {entry.lastWeeksSales}
//             </div>
//             <div
//               style={{
//                 fontSize: "14px",
//                 fontWeight: "600",
//                 color: entry.percentChange.includes("-")
//                   ? "#d32f2f"
//                   : "#2e7d32",
//               }}
//             >
//               {entry.percentChange} | This Week: {entry.thisWeeksSales}
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );

//   return (
//     <div
//       style={{
//         display: "flex",
//         flexDirection: "column",
//         width: "100%",
//         gap: "24px",
//         padding: "24px",
//         fontFamily:
//           '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
//         backgroundColor: "#f5f5f5",
//       }}
//     >
//       {/* Header */}
//       {selectedLocation && (
//         <Typography
//           variant="h5"
//           sx={{ mb: 2, color: "#333", fontWeight: "bold" }}
//         >
//           Sales Analysis (for recent week)
//         </Typography>
//       )}

//       {/* Daily Sales Performance with Moving Average - FULL VALUES */}
//       <div
//         style={{
//           width: "100%",
//           padding: "24px",
//           borderRadius: "12px",
//           boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
//           backgroundColor: "white",
//           transition: "transform 0.3s ease, box-shadow 0.3s ease",
//           display: "flex",
//           flexDirection: "column",
//           alignItems: "center",
//         }}
//         className="stat-card"
//       >
//         {/* Chart heading */}
//         <div
//           style={{
//             fontSize: "24px",
//             fontWeight: "bold",
//             marginBottom: "16px",
//             color: "#333",
//             textAlign: "center",
//             width: "100%",
//           }}
//         >
//           Latest Week Sales Performance
//         </div>

//         {/* Chart container */}
//         <div
//           style={{
//             height: "350px",
//             width: "100%",
//             marginBottom: "0px",
//           }}
//         >
//           <ResponsiveContainer width="100%" height="100%">
//             <ComposedChart
//               data={dailySalesDataWithMA}
//               margin={{
//                 top: 20,
//                 right: 30,
//                 left: 0,
//                 bottom: 20,
//               }}
//             >
//               <CartesianGrid
//                 strokeDasharray="3 3"
//                 vertical={false}
//                 stroke="rgba(0,0,0,0.1)"
//               />
//               <XAxis
//                 dataKey="day"
//                 axisLine={false}
//                 tickLine={false}
//                 textAnchor="end"
//                 height={60}
//                 interval={0}
//                 tick={{ fontSize: 12 }}
//               />
//               <YAxis
//                 axisLine={false}
//                 tickLine={false}
//                 tick={{ fontSize: 12 }}
//                 tickFormatter={(value) => formatNumber(value)}
//               />
//               <Tooltip
//                 content={({ active, payload, label }) => {
//                   if (active && payload && payload.length) {
//                     const data = payload[0].payload;
//                     return (
//                       <div
//                         style={{
//                           backgroundColor: "white",
//                           padding: "16px",
//                           border: "2px solid #4D8D8D",
//                           borderRadius: "8px",
//                           boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
//                           minWidth: "200px",
//                         }}
//                       >
//                         <div
//                           style={{
//                             fontWeight: "bold",
//                             marginBottom: "8px",
//                             color: "#333",
//                           }}
//                         >
//                           Day: {label}
//                         </div>
//                         <div
//                           style={{
//                             color: "#555",
//                             marginBottom: "8px",
//                             fontSize: "12px",
//                           }}
//                         >
//                           Date: {data.dayFormatted}
//                         </div>
//                         <div style={{ color: "#4D8D8D", marginBottom: "4px" }}>
//                           Sales: {formatCurrency(data.sales)}
//                         </div>
//                         <div style={{ color: "#ff0000" }}>
//                           Moving Avg: {formatCurrency(data.movingAverage)}
//                         </div>
//                       </div>
//                     );
//                   }
//                   return null;
//                 }}
//               />
//               <Legend wrapperStyle={{ paddingTop: "20px" }} />
//               <Bar
//                 dataKey="sales"
//                 fill={bars_color}
//                 barSize={50}
//                 radius={[4, 4, 0, 0]}
//                 animationDuration={1500}
//                 name="Daily Sales"
//               />
//               {/* Moving Average Line (red color) */}
//               <Line
//                 type="monotone"
//                 dataKey="movingAverage"
//                 stroke="#ff0000"
//                 strokeWidth={3}
//                 dot={{ r: 4, fill: "#ff0000", strokeWidth: 2 }}
//                 activeDot={{ r: 6, fill: "#ff0000", strokeWidth: 2 }}
//                 name="Moving Average"
//               />
//             </ComposedChart>
//           </ResponsiveContainer>
//         </div>
//       </div>

//       {/* Second row - Category Performance Bar Chart and Summary side by side */}
//       <div style={{ display: "flex", flexWrap: "wrap", gap: "24px" }}>
//         {/* NEW: Sales Category Bar Chart from Table9 - FULL VALUES */}
//         <div
//           style={{
//             width: "calc(60% - 12px)",
//             minWidth: "400px",
//             flexGrow: 1,
//             padding: "20px",
//             borderRadius: "12px",
//             boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
//             backgroundColor: "white",
//             transition: "transform 0.3s ease, box-shadow 0.3s ease",
//           }}
//           className="stat-card"
//         >
//           {/* Chart heading */}
//           <div
//             style={{
//               fontSize: "24px",
//               fontWeight: "bold",
//               marginBottom: "16px",
//               color: "#333",
//               textAlign: "center",
//             }}
//           >
//             Category Performance by Week
//           </div>

//           {/* Data validation and debug info */}
//           <div
//             style={{
//               fontSize: "12px",
//               color: "#666",
//               marginBottom: "10px",
//               textAlign: "center",
//             }}
//           >
//             Showing {getAvailableCategories().length} categories •{" "}
//             {categoryBarData.length} weeks
//           </div>

//           <div
//             style={{
//               height: "500px",
//               marginBottom: "10px",
//             }}
//           >
//             {categoryBarData.length > 0 ? (
//               <ResponsiveContainer width="100%" height="100%">
//                 <BarChart
//                   data={categoryBarData}
//                   margin={{ top: 20, right: 20, left: 10, bottom: 60 }}
//                   barCategoryGap="20%"
//                 >
//                   <CartesianGrid
//                     strokeDasharray="3 3"
//                     vertical={false}
//                     opacity={0.2}
//                   />
//                   <XAxis
//                     dataKey="week"
//                     axisLine={false}
//                     tickLine={false}
//                     tick={{ fill: "#666", fontSize: 12 }}
//                     textAnchor="middle"
//                     height={60}
//                     interval={0}
//                   />
//                   <YAxis
//                     axisLine={false}
//                     tickLine={false}
//                     tick={{ fontSize: 12 }}
//                     tickFormatter={(value) => formatNumber(value)}
//                   />
//                   <Tooltip
//                     contentStyle={{
//                       backgroundColor: "rgba(255,255,255,0.95)",
//                       borderRadius: "8px",
//                       boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
//                       border: "none",
//                       minWidth: "250px",
//                     }}
//                     content={({ active, payload, label }) => {
//                       if (active && payload && payload.length) {
//                         return (
//                           <div
//                             style={{
//                               backgroundColor: "white",
//                               padding: "16px",
//                               border: "2px solid #4D8D8D",
//                               borderRadius: "8px",
//                               boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
//                               minWidth: "200px",
//                             }}
//                           >
//                             <div
//                               style={{
//                                 fontWeight: "bold",
//                                 marginBottom: "8px",
//                                 color: "#333",
//                               }}
//                             >
//                               {label}: Weekly Sales by Category
//                             </div>
//                             {payload.map((entry, index) => (
//                               <div
//                                 key={index}
//                                 style={{
//                                   color: entry.color,
//                                   marginBottom: "4px",
//                                   display: "flex",
//                                   justifyContent: "space-between",
//                                 }}
//                               >
//                                 <span>{entry.name}:</span>
//                                 <span style={{ fontWeight: "bold" }}>
//                                   {formatCurrency(entry.value)}
//                                 </span>
//                               </div>
//                             ))}
//                           </div>
//                         );
//                       }
//                       return null;
//                     }}
//                   />
//                   <Legend
//                     layout="horizontal"
//                     verticalAlign="top"
//                     align="center"
//                     wrapperStyle={{ paddingBottom: "10px" }}
//                   />
//                   {renderCategoryBars()}
//                 </BarChart>
//               </ResponsiveContainer>
//             ) : (
//               <div
//                 style={{
//                   display: "flex",
//                   flexDirection: "column",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   height: "100%",
//                   color: "#666",
//                   fontSize: "16px",
//                 }}
//               >
//                 <div>No category data available</div>
//                 <div style={{ fontSize: "14px", marginTop: "8px" }}>
//                   Expected table9 structure: Category, Week columns, Grand Total
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Categories List from Table10 */}
//         <div
//           style={{
//             width: "calc(40% - 12px)",
//             minWidth: "300px",
//             flexGrow: 1,
//             padding: "24px",
//             borderRadius: "12px",
//             boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
//             backgroundColor: "white",
//             transition: "transform 0.3s ease, box-shadow 0.3s ease",
//           }}
//           className="stat-card"
//         >
//           {categoriesList.length > 0 && (
//             <CategoriesLegend data={categoriesList} />
//           )}
//         </div>
//       </div>

//       {/* Third row - Weekly Sales Trend with Multiple Moving Averages - FULL VALUES */}
//       {weeklySalesWithMovingAvg.length > 0 && (
//         <div
//           style={{
//             padding: "24px",
//             borderRadius: "12px",
//             boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
//             backgroundColor: "white",
//             transition: "transform 0.3s ease, box-shadow 0.3s ease",
//           }}
//           className="stat-card"
//         >
//           {/* Chart heading */}
//           <div
//             style={{
//               fontSize: "24px",
//               fontWeight: "bold",
//               marginBottom: "16px",
//               color: "#333",
//               textAlign: "center",
//             }}
//           >
//             Weekly Sales Trend
//           </div>
//           <div style={{ height: "450px" }}>
//             <ResponsiveContainer width="100%" height="100%">
//               <ComposedChart
//                 data={weeklySalesWithMovingAvg}
//                 margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
//               >
//                 <CartesianGrid
//                   strokeDasharray="3 3"
//                   vertical={false}
//                   stroke="rgba(0,0,0,0.1)"
//                 />
//                 <XAxis
//                   dataKey="week"
//                   axisLine={false}
//                   tickLine={false}
//                   tick={{ fontSize: 12 }}
//                 />
//                 <YAxis
//                   tickFormatter={(value) => formatNumber(value)}
//                   axisLine={false}
//                   tickLine={false}
//                   tick={{ fontSize: 12 }}
//                 />
//                 <Tooltip
//                   content={({ active, payload, label }) => {
//                     if (active && payload && payload.length) {
//                       const data = payload[0].payload;
//                       return (
//                         <div
//                           style={{
//                             backgroundColor: "white",
//                             padding: "16px",
//                             border: "none",
//                             borderRadius: "8px",
//                             boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
//                             minWidth: "250px",
//                           }}
//                         >
//                           <p
//                             style={{
//                               margin: "0 0 8px 0",
//                               fontWeight: "bold",
//                               fontSize: "14px",
//                             }}
//                           >{`${label}`}</p>
//                           <p
//                             style={{
//                               margin: "0 0 4px 0",
//                               color: "#4D8D8D",
//                               fontSize: "13px",
//                             }}
//                           >
//                             {`Total Sales: ${formatCurrency(data.totalSales)}`}
//                           </p>
//                           <p
//                             style={{
//                               margin: "0 0 4px 0",
//                               color: "#666",
//                               fontSize: "13px",
//                             }}
//                           >
//                             {`Total Orders: ${formatNumber(data.totalOrders)}`}
//                           </p>
//                           <p
//                             style={{
//                               margin: "0 0 4px 0",
//                               color: "#ff0000",
//                               fontSize: "13px",
//                             }}
//                           >
//                             {`Moving Avg: ${formatCurrency(
//                               data.movingAverage3Week
//                             )}`}
//                           </p>
//                         </div>
//                       );
//                     }
//                     return null;
//                   }}
//                 />
//                 <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="line" />

//                 {/* Weekly Sales Bars */}
//                 <Bar
//                   dataKey="salesDisplay"
//                   fill={bars_color}
//                   barSize={40}
//                   radius={[4, 4, 0, 0]}
//                   animationDuration={1500}
//                   name="Weekly Sales"
//                 />

//                 {/* 3-Week Moving Average Line (red color) */}
//                 <Line
//                   type="monotone"
//                   dataKey="movingAverage3Week"
//                   stroke="#ff0000"
//                   strokeWidth={3}
//                   dot={{ r: 4, fill: "#ff0000", strokeWidth: 2 }}
//                   activeDot={{ r: 6, fill: "#ff0000", strokeWidth: 2 }}
//                   name="Moving Average"
//                 />
//               </ComposedChart>
//             </ResponsiveContainer>
//           </div>
//         </div>
//       )}

//       {/* Add CSS for hover effects */}
//       <style>
//         {`
//           .stat-card:hover {
//             transform: translateY(-4px);
//             box-shadow: 0 8px 30px rgba(0,0,0,0.12);
//           }
//           .legend-item:hover {
//             background-color: rgba(77, 141, 141, 0.1);
//           }
//           @media (max-width: 1200px) {
//             .stat-card {
//               width: 100% !important;
//               min-width: 300px;
//             }
//           }
//           @media (max-width: 768px) {
//             .stat-card {
//               width: 100% !important;
//               min-width: 300px;
//             }
//           }
//           @media (max-width: 480px) {
//             .stat-card {
//               min-width: 280px;
//             }
//           }
//         `}
//       </style>
//     </div>
//   );
// };

// export default SalesSplitDashboard;

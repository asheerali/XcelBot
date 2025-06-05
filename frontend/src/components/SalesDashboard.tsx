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
    "This_4_Weeks_Sales": number;
    "Last_4_Weeks_Sales": number;
    "Percent_Change": number;
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
    weekIndex: number;
    data: any;
  } | null>(null);

  // Extract summary data from table1 with proper handling
  const summaryData = productMixData?.table1?.[0] || {};
  
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
  const averageOrderValueChange = getSafeChangeValue(summaryData.average_order_value_change);
  
  const averageItemsPerOrder = getSafeValue(summaryData.average_items_per_order, 0);
  const averageItemsPerOrderChange = getSafeChangeValue(summaryData.average_items_per_order_change);
  
  const uniqueOrders = getSafeValue(summaryData.unique_orders, 0);
  const uniqueOrdersChange = getSafeChangeValue(summaryData.unique_orders_change);
  
  const totalQuantity = getSafeValue(summaryData.total_quantity, 0);
  const totalQuantityChange = getSafeChangeValue(summaryData.total_quantity_change);

  // Transform table3 data for menu group chart (Menu Group -> Sales)
  const transformMenuGroupData = () => {
    if (!productMixData?.table3 || productMixData.table3.length === 0) {
      return [{ name: "No Data", value: 0 }];
    }

    return productMixData.table3.map((item) => ({
      name: item["Menu Group"] || "Unknown",
      value: Math.round((item.Sales || 0) / 1000), // Convert to thousands for better display
    }));
  };

  // Transform table10 data for category sales (using current week data)
  const transformCategoryData = () => {
    if (!productMixData?.table10 || productMixData.table10.length === 0) {
      return {
        category1Data: [{ name: "No Data", value: 100, color: "#cccccc" }],
        category2Data: [{ name: "No Data", value: 100, color: "#cccccc" }],
      };
    }

    // Color palette for categories
    const colors = [
      "#69c0b8",
      "#4296a3", 
      "#f0d275",
      "#e74c3c",
      "#9b59b6",
      "#3498db",
    ];

    // Filter out empty categories and Grand Total, then calculate percentages
    const validCategories = productMixData.table10.filter(
      item => item['Sales Category'] && 
               item['Sales Category'] !== 'Grand Total' && 
               item['Sales Category'] !== ''
    );

    // Get the latest week dynamically
    const sampleEntry = validCategories[0];
    if (!sampleEntry) return {
      category1Data: [{ name: "No Data", value: 100, color: "#cccccc" }],
      category2Data: [{ name: "No Data", value: 100, color: "#cccccc" }],
    };

    const weekKeys = Object.keys(sampleEntry)
      .filter(key => key.startsWith('Week ') && !isNaN(parseInt(key.split(' ')[1])))
      .sort((a, b) => {
        const weekA = parseInt(a.split(' ')[1]);
        const weekB = parseInt(b.split(' ')[1]);
        return weekB - weekA; // Sort descending to get latest week first
      });

    const latestWeekKey = weekKeys[0] || 'Grand Total';

    // Calculate total for percentage calculation
    const totalSales = validCategories.reduce((sum, item) => sum + (item[latestWeekKey] || 0), 0);

    // Create category data with calculated percentages
    const allCategoryData = validCategories.map((item, index) => ({
      name: item['Sales Category'] || "Unknown",
      value: totalSales > 0 ? Math.round(((item[latestWeekKey] || 0) / totalSales) * 100) : 0,
      color: colors[index % colors.length],
    }));

    // If we have multiple categories, split them. Otherwise, show all in first chart
    if (allCategoryData.length > 1) {
      const midPoint = Math.ceil(allCategoryData.length / 2);
      return {
        category1Data: allCategoryData.slice(0, midPoint),
        category2Data: allCategoryData.slice(midPoint),
      };
    } else {
      return {
        category1Data: allCategoryData,
        category2Data: [{ name: "Other", value: 0, color: "#cccccc" }],
      };
    }
  };

  // Transform table4 data for server performance (Server -> Sales)
  const transformServerData = () => {
    if (!productMixData?.table4 || productMixData.table4.length === 0) {
      return [{ name: "No Server Data", value: 0 }];
    }

    // Filter out system entries and calculate percentages
    const validServers = productMixData.table4.filter(
      (item) => item.Server && !item.Server.includes("DO NOT CHANGE")
    );

    if (validServers.length === 0) {
      // If only system entries, show the system entry but with a clean name
      const systemEntry = productMixData.table4[0];
      return [{ name: "System/Integration", value: 100 }];
    }

    const totalSales = validServers.reduce(
      (sum, item) => sum + (item.Sales || 0),
      0
    );

    return validServers.map((item) => ({
      name: item.Server || "Unknown",
      value:
        totalSales > 0 ? Math.round(((item.Sales || 0) / totalSales) * 100) : 0,
    }));
  };

  // Transform table5 data for top selling items
  const transformTopSellingItems = () => {
    if (!productMixData?.table5 || productMixData.table5.length === 0) {
      return [{ name: "No Items", total: 0 }];
    }

    // Group by item and sum quantities
    const itemMap = new Map();

    productMixData.table5.forEach((item) => {
      const itemName = item.Item || "Unknown";
      const quantity = item.Quantity || 0;

      if (quantity > 0) {
        // Only include items with actual quantities
        itemMap.set(itemName, (itemMap.get(itemName) || 0) + quantity);
      }
    });

    // Convert to array and sort by quantity
    const topItems = Array.from(itemMap.entries())
      .map(([itemName, quantity]) => ({
        name: itemName,
        total: quantity,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5); // Top 5 items

    return topItems.length > 0 ? topItems : [{ name: "No Items", total: 0 }];
  };

  // Get transformed data
  const menuGroupData = transformMenuGroupData();
  const { category1Data, category2Data } = transformCategoryData();
  const serverData = transformServerData();
  const topSellingItems = transformTopSellingItems();

  // Custom label for pie charts
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    if (percent === 0) return null;

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
        fontSize={14}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Format percentage change with proper styling - show exact backend values
  const formatPercentageChange = (value: any) => {
    // If value is null or undefined, show as is
    if (value === null || value === undefined) {
      return { text: "null", color: "#666", arrow: "" };
    }
    
    // If value is exactly -1, show it as -1%
    if (value === -1) {
      return { text: "-1%", color: "#d32f2f", arrow: "▼" };
    }
    
    // If it's a number, format it as percentage
    if (typeof value === 'number') {
      const isPositive = value > 0;
      const isZero = value === 0;
      
      if (isZero) {
        return { text: "0%", color: "#666", arrow: "" };
      }
      
      return {
        text: `${isPositive ? "+" : ""}${value.toFixed(1)}%`,
        color: isPositive ? "#2e7d32" : "#d32f2f",
        arrow: isPositive ? "▲" : "▼"
      };
    }
    
    // For any other type, convert to string
    return { text: String(value), color: "#666", arrow: "" };
  };

  // Stat card component with change indicator - REDUCED PADDING
  const StatCard = ({ 
    title, 
    value, 
    change, 
    color, 
    formatValue = (v) => v.toString() 
  }) => {
    const changeFormatted = formatPercentageChange(change);
    
    return (
      <div
        style={{
          padding: "16px",
          borderRadius: "8px",
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
        
        {/* Change indicator */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "4px",
          marginTop: "auto"
        }}>
          {changeFormatted.arrow && (
            <span style={{ 
              color: changeFormatted.color, 
              fontSize: "10px",
              fontWeight: "bold"
            }}>
              {changeFormatted.arrow}
            </span>
          )}
          <span style={{ 
            color: changeFormatted.color,
            fontSize: "12px",
            fontWeight: "600"
          }}>
            {changeFormatted.text}
          </span>
        </div>
      </div>
    );
  };

  // Category legend component
  const CategoryLegend = ({ data }) => (
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

  // Enhanced Sales Trend Chart Component with Clickable Line Points
  const SalesTrendChart = () => {
    // Get all categories from table10 (dynamic, not limited)
    const allCategories = (productMixData?.table10 || [])
      .filter(item => item['Sales Category'] && 
                     item['Sales Category'] !== 'Grand Total' && 
                     item['Sales Category'] !== '');

    if (allCategories.length === 0) {
      return (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          color: '#666',
          fontSize: '16px'
        }}>
          No category data available
        </div>
      );
    }

    // Dynamically detect available weeks from table10 data
    const sampleEntry = allCategories[0];
    const allKeys = Object.keys(sampleEntry);
    const weekKeys = allKeys
      .filter(key => key.startsWith('Week ') && !isNaN(parseInt(key.split(' ')[1])))
      .sort((a, b) => {
        const weekA = parseInt(a.split(' ')[1]);
        const weekB = parseInt(b.split(' ')[1]);
        return weekA - weekB;
      });

    if (weekKeys.length === 0) {
      return (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          color: '#666',
          fontSize: '16px'
        }}>
          No week data found
        </div>
      );
    }

    // Generate dynamic color palette based on number of categories
    const generateColors = (count) => {
      const baseColors = ['#4285f4', '#8bc34a', '#ff9800', '#9c27b0', '#f44336', '#00bcd4', '#795548', '#607d8b', '#e91e63', '#3f51b5'];
      const colors = [];
      for (let i = 0; i < count; i++) {
        if (i < baseColors.length) {
          colors.push(baseColors[i]);
        } else {
          // Generate additional colors using HSL
          const hue = (i * 137.508) % 360; // Golden angle approximation for good color distribution
          colors.push(`hsl(${hue}, 70%, 50%)`);
        }
      }
      return colors;
    };

    const colors = generateColors(allCategories.length);
    
    // Calculate max value for scaling from all week data
    const allValues = allCategories.flatMap(cat => 
      weekKeys.map(weekKey => cat[weekKey] || 0)
    );
    const maxValue = Math.max(...allValues);
    
    // Fixed dimensions and margins for proper alignment - INCREASED SIZE
    const svgWidth = 1000;
    const svgHeight = 500;
    const margin = { top: 50, right: 100, bottom: 80, left: 100 };
    const chartWidth = svgWidth - margin.left - margin.right;
    const chartHeight = svgHeight - margin.top - margin.bottom;
    
    // Scale functions with proper handling for single week
    const xScale = (index) => {
      if (weekKeys.length === 1) {
        // Center the single point
        return margin.left + chartWidth / 2;
      }
      return margin.left + (index * chartWidth / (weekKeys.length - 1));
    };
    
    const yScale = (value) => {
      return margin.top + chartHeight - ((value / maxValue) * chartHeight);
    };

    // Enhanced Custom tooltip component with complete table10 data
    const CustomTooltip = ({ category, weekIndex }) => {
      if (!hoveredPoint || hoveredPoint.categoryIndex !== category || hoveredPoint.weekIndex !== weekIndex) {
        return null;
      }

      const categoryData = allCategories[category];
      const weekKey = weekKeys[weekIndex];
      const currentWeekValue = categoryData[weekKey] || 0;

      // Get all table11 data for additional context
      const table11Data = (productMixData?.table11 || []).find(
        item => item['Sales Category'] === categoryData['Sales Category']
      );

      const point = {
        x: xScale(weekIndex),
        y: yScale(currentWeekValue),
        value: currentWeekValue
      };

      return (
        <div
          style={{
            position: 'absolute',
            left: Math.min(point.x + 15, 600), // Prevent tooltip from going off-screen
            top: Math.max(point.y - 120, 10),
            background: 'rgba(0, 0, 0, 0.95)',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '12px',
            pointerEvents: 'none',
            zIndex: 1000,
            minWidth: '200px',
            maxWidth: '300px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            border: `2px solid ${colors[category]}`
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '14px', color: colors[category] }}>
            {categoryData['Sales Category']}
          </div>
          
          <div style={{ marginBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '6px' }}>
            <strong>Current Week ({weekKey}):</strong> {formatCurrency(currentWeekValue)}
          </div>

          <div style={{ marginBottom: '4px' }}>
            <strong>Grand Total:</strong> {formatCurrency(categoryData['Grand Total'] || 0)}
          </div>
          
          {table11Data && (
            <>
              <div style={{ marginBottom: '4px' }}>
                <strong>Last 4 Weeks:</strong> {formatCurrency(table11Data['This_4_Weeks_Sales'] || 0)}
              </div>
              <div style={{ marginBottom: '4px' }}>
                <strong>Previous 4 Weeks:</strong> {formatCurrency(table11Data['Last_4_Weeks_Sales'] || 0)}
              </div>
              <div style={{ 
                color: (table11Data['Percent_Change'] || 0) >= 0 ? '#4ade80' : '#f87171',
                fontWeight: 'bold'
              }}>
                <strong>Change:</strong> {(table11Data['Percent_Change'] || 0) >= 0 ? '+' : ''}{table11Data['Percent_Change'] || 0}%
              </div>
            </>
          )}

          {/* Show all available weeks data */}
          {weekKeys.length > 1 && (
            <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>All Weeks:</div>
              <div style={{ fontSize: '10px', maxHeight: '80px', overflowY: 'auto' }}>
                {weekKeys.map(wk => (
                  <div key={wk} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    marginBottom: '2px',
                    backgroundColor: wk === weekKey ? 'rgba(255,255,255,0.1)' : 'transparent',
                    padding: '2px 4px',
                    borderRadius: '3px'
                  }}>
                    <span>{wk}:</span>
                    <span>{formatCurrency(categoryData[wk] || 0)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    };

    return (
      <div style={{ position: 'relative', width: '100%', height: '480px' }}>
        <svg 
          width="100%" 
          height="100%" 
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ 
            width: "100%", 
            height: "100%",
            background: 'white'
          }}
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <line
              key={i}
              x1={margin.left}
              y1={margin.top + ratio * chartHeight}
              x2={margin.left + chartWidth}
              y2={margin.top + ratio * chartHeight}
              stroke="#e0e0e0"
              strokeWidth="1"
            />
          ))}
          
          {/* Vertical grid lines for weeks */}
          {weekKeys.map((_, index) => (
            <line
              key={index}
              x1={xScale(index)}
              y1={margin.top}
              x2={xScale(index)}
              y2={margin.top + chartHeight}
              stroke="#f0f0f0"
              strokeWidth="1"
            />
          ))}
          
          {/* Chart lines for each category */}
          {allCategories.map((category, catIndex) => {
            // Get actual data points from table10
            const dataPoints = weekKeys.map((weekKey, weekIndex) => {
              const value = category[weekKey] || 0;
              return {
                x: xScale(weekIndex),
                y: yScale(value),
                value: value,
                weekIndex: weekIndex
              };
            });

            return (
              <g key={catIndex}>
                {/* Line (only draw if more than one point) */}
                {weekKeys.length > 1 && (
                  <polyline
                    fill="none"
                    stroke={colors[catIndex]}
                    strokeWidth={catIndex === 0 ? 3 : 2}
                    points={dataPoints.map(p => `${p.x},${p.y}`).join(' ')}
                    style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))' }}
                  />
                )}
                
                {/* Invisible thick line for better hover detection */}
                {weekKeys.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="transparent"
                    strokeWidth="12"
                    points={dataPoints.map(p => `${p.x},${p.y}`).join(' ')}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={(e) => {
                      // Find the closest point to mouse position
                      const rect = e.currentTarget.getBoundingClientRect();
                      const svgRect = e.currentTarget.closest('svg')?.getBoundingClientRect();
                      if (svgRect) {
                        const mouseX = ((e.clientX - svgRect.left) / svgRect.width) * svgWidth;
                        let closestIndex = 0;
                        let minDistance = Math.abs(mouseX - dataPoints[0].x);
                        
                        dataPoints.forEach((point, idx) => {
                          const distance = Math.abs(mouseX - point.x);
                          if (distance < minDistance) {
                            minDistance = distance;
                            closestIndex = idx;
                          }
                        });
                        
                        setHoveredPoint({
                          categoryIndex: catIndex,
                          weekIndex: closestIndex,
                          data: {
                            category: category['Sales Category'],
                            week: weekKeys[closestIndex],
                            value: dataPoints[closestIndex].value,
                            fullData: category
                          }
                        });
                      }
                    }}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                )}
                
                {/* Data points - Enhanced clickable areas */}
                {dataPoints.map((point, pointIndex) => (
                  <g key={pointIndex}>
                    {/* Invisible large clickable area */}
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={15}
                      fill="transparent"
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setHoveredPoint({
                        categoryIndex: catIndex,
                        weekIndex: pointIndex,
                        data: {
                          category: category['Sales Category'],
                          week: weekKeys[pointIndex],
                          value: point.value,
                          fullData: category
                        }
                      })}
                      onMouseLeave={() => setHoveredPoint(null)}
                      onClick={() => {
                        // You can add click functionality here if needed
                        console.log(`Clicked on ${category['Sales Category']} - ${weekKeys[pointIndex]}: ${formatCurrency(point.value)}`);
                      }}
                    />
                    
                    {/* Visible data point */}
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={catIndex === 0 ? 6 : 5}
                      fill={colors[catIndex]}
                      stroke="white"
                      strokeWidth="2"
                      style={{ 
                        filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))',
                        pointerEvents: 'none'
                      }}
                    />
                  </g>
                ))}
              </g>
            );
          })}
          
          {/* X-axis labels */}
          {weekKeys.map((weekKey, index) => (
            <text
              key={index}
              x={xScale(index)}
              y={svgHeight - 20}
              textAnchor="middle"
              fontSize="16"
              fill="#666"
              fontWeight="500"
            >
              {weekKey}
            </text>
          ))}
          
          {/* Y-axis labels */}
          {[0, maxValue/4, maxValue/2, (maxValue*3)/4, maxValue].map((value, i) => (
            <text
              key={i}
              x={margin.left - 15}
              y={yScale(value) + 5}
              textAnchor="end"
              fontSize="16"
              fill="#666"
              fontWeight="500"
            >
              {value >= 1000 ? `${(value/1000).toFixed(0)}k` : value.toFixed(0)}
            </text>
          ))}
          
          {/* Chart title */}
          <text
            x={svgWidth / 2}
            y={25}
            textAnchor="middle"
            fontSize="16"
            fill="#333"
            fontWeight="bold"
          >
            Sales Trend by Category ({weekKeys.length} Week{weekKeys.length !== 1 ? 's' : ''})
          </text>
        </svg>

        {/* Render enhanced tooltips */}
        {hoveredPoint && (
          <CustomTooltip
            category={hoveredPoint.categoryIndex}
            weekIndex={hoveredPoint.weekIndex}
          />
        )}
      </div>
    );
  };

  // Get categories data for the new separate section
  const getCategoriesData = () => {
    // Get ALL categories from table11 first, then fallback to table10
    let allCategories = (productMixData?.table11 || [])
      .filter(item => item['Sales Category'] && item['Sales Category'] !== 'Grand Total' && item['Sales Category'] !== '')
      .sort((a, b) => (b['This_4_Weeks_Sales'] || 0) - (a['This_4_Weeks_Sales'] || 0));

    // If no table11 data, use table10
    if (allCategories.length === 0) {
      allCategories = (productMixData?.table10 || [])
        .filter(item => item['Sales Category'] && item['Sales Category'] !== 'Grand Total' && item['Sales Category'] !== '')
        .sort((a, b) => (b['Grand Total'] || 0) - (a['Grand Total'] || 0));
    }

    // Generate colors for all categories
    const generateColors = (count) => {
      const baseColors = ['#4285f4', '#8bc34a', '#ff9800', '#9c27b0', '#f44336', '#00bcd4', '#795548', '#607d8b', '#e91e63', '#3f51b5'];
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

    // Get the latest week key dynamically for current sales
    const sampleTable10Entry = (productMixData?.table10 || [])[0];
    const weekKeys = sampleTable10Entry ? Object.keys(sampleTable10Entry)
      .filter(key => key.startsWith('Week ') && !isNaN(parseInt(key.split(' ')[1])))
      .sort((a, b) => {
        const weekA = parseInt(a.split(' ')[1]);
        const weekB = parseInt(b.split(' ')[1]);
        return weekB - weekA; // Sort descending to get latest week first
      }) : [];

    const latestWeekKey = weekKeys[0]; // Get the most recent week

    return allCategories.map((category, index) => {
      // Get current week sales from table10
      const table10Entry = (productMixData?.table10 || []).find(
        item => item['Sales Category'] === category['Sales Category']
      );
      const currentSales = table10Entry ? (table10Entry[latestWeekKey] || table10Entry['Grand Total'] || 0) : 0;
      
      const lastWeeksSales = category['This_4_Weeks_Sales'] || category['Grand Total'] || 0;
      const percentChange = category['Percent_Change'] || 0;

      return {
        ...category,
        currentSales,
        lastWeeksSales,
        percentChange,
        color: colors[index]
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
      {/* First row - Enhanced Stats Cards with Changes */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "24px" }}>
        {/* Stats Cards in left half - REDUCED SIZE */}
        <div style={{ width: "calc(40% - 12px)", minWidth: "280px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <StatCard
              title="Net Sales"
              value={netSales}
              change={netSalesChange}
              color="#1e88e5"
              formatValue={formatCurrency}
            />
            
            <StatCard
              title="Orders"
              value={orders}
              change={ordersChange}
              color="#7cb342"
              formatValue={(v) => v.toLocaleString()}
            />
            
            <StatCard
              title="Qty Sold"
              value={qtySold}
              change={qtySoldChange}
              color="#fb8c00"
              formatValue={(v) => v.toLocaleString()}
            />
          </div>

          {/* Second row of stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <StatCard
              title="Avg Order Value"
              value={averageOrderValue}
              change={averageOrderValueChange}
              color="#9c27b0"
              formatValue={formatCurrency}
            />

            <StatCard
              title="Avg Items/Order"
              value={averageItemsPerOrder}
              change={averageItemsPerOrderChange}
              color="#f44336"
              formatValue={(v) => v.toFixed(1)}
            />
          </div>

          {/* Third row - Additional metrics */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "12px",
            }}
          >
            <StatCard
              title="Unique Orders"
              value={uniqueOrders}
              change={uniqueOrdersChange}
              color="#00bcd4"
              formatValue={(v) => v.toLocaleString()}
            />

            <StatCard
              title="Total Quantity"
              value={totalQuantity}
              change={totalQuantityChange}
              color="#795548"
              formatValue={(v) => v.toLocaleString()}
            />
          </div>
        </div>

        {/* Sales Trend Chart - INCREASED SIZE */}
        <div
          style={{ width: "calc(60% - 12px)", minWidth: "500px", flexGrow: 1 }}
        >
          <div
            style={{
              padding: "12px",
              borderRadius: "8px",
              height: "100%",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              backgroundColor: "white",
              minHeight: "500px"
            }}
          >
            <div
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                marginBottom: "12px",
              }}
            >
              Sales Trend by Category
            </div>
            
            {/* Enhanced Line Chart with clickable points */}
            <SalesTrendChart />
          </div>
        </div>
      </div>

      {/* NEW SECTION: Category Cards in separate rows - 2 items per row */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div
          style={{
            fontSize: "18px",
            fontWeight: "bold",
            marginBottom: "8px",
            color: "#333"
          }}
        >
          Sales Categories Performance
        </div>
        
        {/* Split categories into rows of 2 */}
        {Array.from({ length: Math.ceil(categoriesData.length / 2) }, (_, rowIndex) => (
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
                  key={category['Sales Category']}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 16px',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    borderLeft: `6px solid ${category.color}`,
                    minHeight: '65px',
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    cursor: "pointer"
                  }}
                  className="category-card"
                >
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      backgroundColor: category.color,
                      marginRight: '16px',
                      flexShrink: 0
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700', fontSize: '15px', color: '#333', marginBottom: '4px' }}>
                      {category['Sales Category']}
                    </div>
                    <div style={{ fontSize: '13px', color: '#666' }}>
                      Total Sales: {formatCurrency(category.lastWeeksSales)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {category['Percent_Change'] !== undefined && (
                      <div style={{ 
                        fontSize: '16px', 
                        fontWeight: 'bold',
                        color: category.percentChange >= 0 ? '#2e7d32' : '#d32f2f',
                        marginBottom: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '4px'
                      }}>
                        <span style={{ fontSize: '12px' }}>
                          {category.percentChange >= 0 ? '▲' : '▼'}
                        </span>
                        {category.percentChange >= 0 ? '+' : ''}{category.percentChange}%
                      </div>
                    )}
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#333' }}>
                      Current: {formatCurrency(category.currentSales)}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ))}
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
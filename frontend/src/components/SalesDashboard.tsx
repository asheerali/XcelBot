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
  LabelList,
  Legend,
  Tooltip,
} from "recharts";

// Interface for the product mix data
interface ProductMixData {
  table1?: Array<{
    net_sales?: number[];
    orders?: number[];
    qty_sold?: number[];
    average_order_value?: number[];
    average_items_per_order?: number[];
    unique_orders?: number[];
    total_quantity?: number[];
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
  servers?: string[];
  categories?: string[];
  locations?: string[];
}

interface SalesDashboardProps {
  productMixData?: ProductMixData;
}

const SalesDashboard: React.FC<SalesDashboardProps> = ({ productMixData }) => {
  // Extract summary data from table1
  const summaryData = productMixData?.table1?.[0] || {};
  const netSales = summaryData.net_sales?.[0] || 0;
  const orders = summaryData.orders?.[0] || 0;
  const qtySold = summaryData.qty_sold?.[0] || 0;
  const averageOrderValue = summaryData.average_order_value?.[0] || 0;
  const averageItemsPerOrder = summaryData.average_items_per_order?.[0] || 0;

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

  // Transform table2 data for pie charts (Category -> Sales/Percentage)
  const transformCategoryData = () => {
    if (!productMixData?.table2 || productMixData.table2.length === 0) {
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

    // Create category data with actual percentages
    const allCategoryData = productMixData.table2.map((item, index) => ({
      name: item.Category || "Unknown",
      value: Math.round(item.Percentage || 0),
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
      {/* First row - Stats Cards + Sales by Menu Group */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "24px" }}>
        {/* Stats Cards in left half */}
        <div style={{ width: "calc(50% - 12px)", minWidth: "300px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                padding: "24px",
                borderRadius: "8px",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                backgroundColor: "white",
              }}
              className="stat-card"
            >
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: "bold",
                  color: "#1e88e5",
                }}
              >
                {formatCurrency(netSales)}
              </div>
              <div style={{ fontSize: "16px", color: "#666" }}>Net Sales</div>
            </div>

            <div
              style={{
                padding: "24px",
                borderRadius: "8px",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                backgroundColor: "white",
              }}
              className="stat-card"
            >
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: "bold",
                  color: "#7cb342",
                }}
              >
                {orders}
              </div>
              <div style={{ fontSize: "16px", color: "#666" }}>Orders</div>
            </div>

            <div
              style={{
                padding: "24px",
                borderRadius: "8px",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                backgroundColor: "white",
              }}
              className="stat-card"
            >
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: "bold",
                  color: "#fb8c00",
                }}
              >
                {qtySold}
              </div>
              <div style={{ fontSize: "16px", color: "#666" }}>Qty Sold</div>
            </div>
          </div>

          {/* Additional Stats Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                padding: "20px",
                borderRadius: "8px",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                backgroundColor: "white",
              }}
            >
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#9c27b0",
                }}
              >
                {formatCurrency(averageOrderValue)}
              </div>
              <div style={{ fontSize: "14px", color: "#666" }}>
                Avg Order Value
              </div>
            </div>

            <div
              style={{
                padding: "20px",
                borderRadius: "8px",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                backgroundColor: "white",
              }}
            >
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#f44336",
                }}
              >
                {averageItemsPerOrder.toFixed(1)}
              </div>
              <div style={{ fontSize: "14px", color: "#666" }}>
                Avg Items/Order
              </div>
            </div>
          </div>

          {/* Menu Group Chart */}
          <div
            style={{
              padding: "16px",
              borderRadius: "8px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              backgroundColor: "white",
            }}
          >
            <div
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                marginBottom: "8px",
              }}
            >
              Sales by Menu Group
            </div>
            <div style={{ height: "200px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={menuGroupData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="rgba(0,0,0,0.1)"
                  />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                      border: "none",
                    }}
                    formatter={(value) => [`${value}k`, "Sales"]}
                  />
                  <Bar
                    dataKey="value"
                    fill="#4CB0B0"
                    barSize={30}
                    radius={[4, 4, 0, 0]}
                    animationDuration={1500}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Category Pie Charts on right */}
        <div
          style={{ width: "calc(50% - 12px)", minWidth: "300px", flexGrow: 1 }}
        >
          <div
            style={{
              padding: "16px",
              borderRadius: "8px",
              height: "100%",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              backgroundColor: "white",
            }}
          >
            <div
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                marginBottom: "8px",
              }}
            >
              Sales by Category
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(1, 1fr)",
                gap: "16px",
              }}
            >
              {/* Main pie chart */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ height: "300px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={category1Data}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        labelLine={false}
                        label={renderCustomizedLabel}
                      >
                        {category1Data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <CategoryLegend data={category1Data} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Second row - Sales by Server and Top Selling Items */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "24px" }}>
        {/* Sales by Server */}
        <div style={{ width: "calc(50% - 12px)", minWidth: "300px" }}>
          <div
            style={{
              padding: "16px",
              borderRadius: "8px",
              height: "100%",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              backgroundColor: "white",
            }}
          >
            <div
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                marginBottom: "16px",
              }}
            >
              Highest-Grossing Servers
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              {serverData.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    marginBottom: "4px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "4px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        maxWidth: "200px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.name}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#666",
                        marginLeft: "auto",
                      }}
                    >
                      {item.value}%
                    </div>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: "24px",
                      backgroundColor: "rgba(76, 176, 176, 0.1)",
                      borderRadius: "12px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${item.value}%`,
                        backgroundColor: "#4CB0B0",
                        borderRadius: "12px",
                        transition: "width 0.8s ease",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Selling Items */}
        <div
          style={{ width: "calc(50% - 12px)", minWidth: "300px", flexGrow: 1 }}
        >
          <div
            style={{
              padding: "16px",
              borderRadius: "8px",
              height: "100%",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              backgroundColor: "white",
            }}
          >
            <div
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                marginBottom: "16px",
              }}
            >
              Top Selling Items
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              {topSellingItems.map((item, index) => {
                const maxQuantity = Math.max(
                  ...topSellingItems.map((i) => i.total)
                );
                const barWidth =
                  maxQuantity > 0 ? (item.total / maxQuantity) * 100 : 0;

                return (
                  <div
                    key={index}
                    style={{
                      borderBottom:
                        index < topSellingItems.length - 1
                          ? "1px solid #eee"
                          : "none",
                      paddingBottom: "12px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "8px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "500",
                          maxWidth: "200px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {item.name}
                      </div>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "bold",
                          color: "#4CB0B0",
                        }}
                      >
                        {item.total}
                      </div>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: "8px",
                        backgroundColor: "rgba(76, 176, 176, 0.1)",
                        borderRadius: "4px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${barWidth}%`,
                          backgroundColor: "#4CB0B0",
                          borderRadius: "4px",
                          transition: "width 0.8s ease",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS for hover effects */}
      <style>
        {`
          .stat-card:hover {
            transform: translateY(-4px);
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

import React, { useState } from "react";

const MenuItemsTable = ({ table12 = [] }) => {
  const [viewMode, setViewMode] = useState("sales"); // 'sales' or 'quantity'

  // Transform backend data to component format
  const tableData = table12.map((item) => ({
    rank: item.Rank,
    topItem: item.Top_10_Items,
    tSales: item.T_Sales,
    tQuantity: item.T_Quantity,
    differenceSales: item.Difference_Sales,
    bottomItem: item.Bottom_10_Items,
    bSales: item.B_Sales,
    bQuantity: item.B_Quantity,
  }));

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Function to get color and formatting for difference values
  const getDifferenceStyle = (value) => {
    const numValue = parseFloat(value);
    if (numValue > 0) {
      return {
        color: "#2e7d32", // Green for positive
        fontWeight: "600",
        prefix: "+",
        backgroundColor: "rgba(46, 125, 50, 0.1)", // Light green background
      };
    } else if (numValue < 0) {
      return {
        color: "#d32f2f", // Red for negative
        fontWeight: "600",
        prefix: "",
        backgroundColor: "rgba(211, 47, 47, 0.1)", // Light red background
      };
    } else {
      return {
        color: "#666", // Gray for zero
        fontWeight: "500",
        prefix: "",
        backgroundColor: "transparent",
      };
    }
  };

  return (
    <div
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        width: "100%",
      }}
    >
      {/* Toggle Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "24px",
          gap: "8px",
        }}
      >
        <button
          onClick={() => setViewMode("sales")}
          style={{
            padding: "12px 24px",
            fontSize: "16px",
            fontWeight: "600",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            background: viewMode === "sales" ? "#1976d2" : "#e0e0e0",
            color: viewMode === "sales" ? "white" : "#666",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow:
              viewMode === "sales"
                ? "0 4px 12px rgba(25, 118, 210, 0.3)"
                : "none",
          }}
        >
          <span style={{ fontSize: "18px" }}>$</span>
          Sales View
        </button>

        <button
          onClick={() => setViewMode("quantity")}
          style={{
            padding: "12px 24px",
            fontSize: "16px",
            fontWeight: "600",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            background: viewMode === "quantity" ? "#1976d2" : "#e0e0e0",
            color: viewMode === "quantity" ? "white" : "#666",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow:
              viewMode === "quantity"
                ? "0 4px 12px rgba(25, 118, 210, 0.3)"
                : "none",
          }}
        >
          <span style={{ fontSize: "18px" }}>#</span>
          Quantity View
        </button>
      </div>

      {/* Table Container */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
          border: "1px solid #e0e0e0",
          width: "100%",
        }}
      >
        <div style={{ overflowX: "auto", width: "100%" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              tableLayout: "fixed", // Fixed layout to ensure columns fill container
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f5f7fa" }}>
                <th
                  style={{
                    width: "25%",
                    padding: "16px 12px",
                    textAlign: "left",
                    fontWeight: "600",
                    fontSize: "14px",
                    color: "#1a237e",
                    borderBottom: "2px solid #e0e0e0",
                    borderRight: "1px solid #e0e0e0",
                    wordWrap: "break-word",
                  }}
                >
                  Top 10 Items
                </th>
                <th
                  style={{
                    width: "18%",
                    padding: "16px 12px",
                    textAlign: "center",
                    fontWeight: "600",
                    fontSize: "14px",
                    color: "#1a237e",
                    borderBottom: "2px solid #e0e0e0",
                    borderRight: "1px solid #e0e0e0",
                    wordWrap: "break-word",
                  }}
                >
                  {viewMode === "sales" ? "T_Sales" : "T_Quantity"}
                </th>
                <th
                  style={{
                    width: "19%",
                    padding: "16px 12px",
                    textAlign: "center",
                    fontWeight: "600",
                    fontSize: "14px",
                    color: "#1a237e",
                    borderBottom: "2px solid #e0e0e0",
                    borderRight: "1px solid #e0e0e0",
                    wordWrap: "break-word",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px",
                    }}
                  >
                    <span>Difference_Sales</span>

                    <div style={{ fontSize: "10px", color: "#666" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "2px",
                        }}
                      >
                        <span style={{ color: "#2e7d32" }}>▲</span>
                        <span>+</span>
                        <span style={{ color: "#d32f2f" }}>▼</span>
                        <span>-</span>
                      </div>
                    </div>
                  </div>
                </th>
                <th
                  style={{
                    width: "18%",
                    padding: "16px 12px",
                    textAlign: "center",
                    fontWeight: "600",
                    fontSize: "14px",
                    color: "#1a237e",
                    borderBottom: "2px solid #e0e0e0",
                    borderRight: "1px solid #e0e0e0",
                    wordWrap: "break-word",
                  }}
                >
                  {viewMode === "sales" ? "B_Sales" : "B_Quantity"}
                </th>
                <th
                  style={{
                    width: "20%",
                    padding: "16px 12px",
                    textAlign: "left",
                    fontWeight: "600",
                    fontSize: "14px",
                    color: "#1a237e",
                    borderBottom: "2px solid #e0e0e0",
                    wordWrap: "break-word",
                  }}
                >
                  Bottom 10 Items
                </th>
              </tr>
            </thead>
            <tbody>
              {tableData.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      padding: "40px",
                      textAlign: "center",
                      color: "#666",
                      fontSize: "16px",
                    }}
                  >
                    No data available
                  </td>
                </tr>
              ) : (
                tableData.map((row, index) => {
                  const differenceStyle = getDifferenceStyle(
                    row.differenceSales
                  );

                  return (
                    <tr
                      key={index}
                      style={{
                        backgroundColor:
                          index % 2 === 0 ? "#ffffff" : "#f9f9f9",
                        transition: "background-color 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#e3f2fd";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor =
                          index % 2 === 0 ? "#ffffff" : "#f9f9f9";
                      }}
                    >
                      <td
                        style={{
                          padding: "14px 12px",
                          borderBottom: "1px solid #e0e0e0",
                          borderRight: "1px solid #e0e0e0",
                          fontSize: "14px",
                          fontWeight: "500",
                          color: "#333",
                          wordWrap: "break-word",
                          overflow: "hidden",
                        }}
                      >
                        {row.topItem}
                      </td>
                      <td
                        style={{
                          padding: "14px 12px",
                          textAlign: "center",
                          borderBottom: "1px solid #e0e0e0",
                          borderRight: "1px solid #e0e0e0",
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#1976d2",
                          wordWrap: "break-word",
                          overflow: "hidden",
                        }}
                      >
                        {viewMode === "sales"
                          ? formatCurrency(row.tSales)
                          : row.tQuantity}
                      </td>
                      <td
                        style={{
                          padding: "14px 12px",
                          textAlign: "center",
                          borderBottom: "1px solid #e0e0e0",
                          borderRight: "1px solid #e0e0e0",
                          fontSize: "14px",
                          fontWeight: differenceStyle.fontWeight,
                          color: differenceStyle.color,
                          backgroundColor: differenceStyle.backgroundColor,
                          wordWrap: "break-word",
                          overflow: "hidden",
                          position: "relative",
                          borderRadius: "4px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "4px",
                          }}
                        >
                          {parseFloat(row.differenceSales) > 0 && (
                            <span
                              style={{
                                fontSize: "12px",
                                color: differenceStyle.color,
                              }}
                            >
                              ▲
                            </span>
                          )}
                          {parseFloat(row.differenceSales) < 0 && (
                            <span
                              style={{
                                fontSize: "12px",
                                color: differenceStyle.color,
                              }}
                            >
                              ▼
                            </span>
                          )}
                          <span>
                            {differenceStyle.prefix}
                            {Math.abs(row.differenceSales).toFixed(2)}
                          </span>
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "14px 12px",
                          textAlign: "center",
                          borderBottom: "1px solid #e0e0e0",
                          borderRight: "1px solid #e0e0e0",
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#ff6b35",
                          wordWrap: "break-word",
                          overflow: "hidden",
                        }}
                      >
                        {viewMode === "sales"
                          ? formatCurrency(row.bSales)
                          : row.bQuantity}
                      </td>
                      <td
                        style={{
                          padding: "14px 12px",
                          textAlign: "left",
                          borderBottom: "1px solid #e0e0e0",
                          fontSize: "14px",
                          fontWeight: "500",
                          color: "#333",
                          wordWrap: "break-word",
                          overflow: "hidden",
                        }}
                      >
                        {row.bottomItem}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with summary and legend */}
        <div
          style={{
            padding: "16px",
            backgroundColor: "#f5f7fa",
            borderTop: "1px solid #e0e0e0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              color: "#666",
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <span>Showing {tableData.length} items</span>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "12px" }}>Legend:</span>
              <div
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                <span style={{ color: "#2e7d32", fontSize: "12px" }}>▲</span>
                <span style={{ color: "#2e7d32", fontSize: "12px" }}>
                  Positive
                </span>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                <span style={{ color: "#d32f2f", fontSize: "12px" }}>▼</span>
                <span style={{ color: "#d32f2f", fontSize: "12px" }}>
                  Negative
                </span>
              </div>
            </div>
          </div>
          <div
            style={{
              fontSize: "14px",
              color: "#1976d2",
              fontWeight: "500",
            }}
          >
            Current view:{" "}
            {viewMode === "sales"
              ? "Sales Performance ($)"
              : "Quantity Performance (#)"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuItemsTable;

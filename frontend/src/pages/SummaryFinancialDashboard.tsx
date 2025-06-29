import React, { useState } from "react";
import FiltersOrderIQ from "../components/FiltersOrderIQ";

const SummaryFinancialDashboard = () => {
  // Filter state
  const [filters, setFilters] = useState({
    location: [],
    companies: [],
  });

  // Sample data
  const summaryStats = {
    totalCost: 717.26,
    totalOrders: 12,
    activeStores: 12,
    dailyAverage: 89.66,
  };

  const storeBreakdown = [
    { name: "25", cost: 0, percentage: 0 },
    { name: "Upper West Side", cost: 0, percentage: 0 },
    { name: "Park Slope", cost: 0, percentage: 0 },
    { name: "Test 4", cost: 0, percentage: 0 },
    { name: "Downtown Brooklyn", cost: 0, percentage: 0 },
    { name: "test 8", cost: 0, percentage: 0 },
    { name: "store 9", cost: 0, percentage: 0 },
    { name: "s1", cost: 0, percentage: 0 },
    { name: "IH7 Store", cost: 0, percentage: 0 },
    { name: "Test 8", cost: 0, percentage: 0 },
    { name: "All 2", cost: 0, percentage: 0 },
    { name: "Midtown East", cost: 717.26, percentage: 100 },
  ];

  const categoryBreakdown = [
    { name: "Ingredients", cost: 487.74, percentage: 68 },
    { name: "Dairy/Eggs", cost: 164.97, percentage: 23 },
    { name: "Packaging", cost: 64.55, percentage: 9 },
  ];

  const dailyData = [
    {
      date: "6/22/2025",
      stores: {
        "Midtown East": 0,
        "Upper West Side": 0,
        "Park Slope": 0,
        "Test 4": 0,
        "Downtown Brooklyn": 0,
        "test 8": 0,
        "store 9": 0,
        s1: 0,
        "IH7 Store": 0,
        "Test 8": 0,
        "All 2": 0,
        "25": 0,
      },
      total: 0,
    },
    {
      date: "6/21/2025",
      stores: {
        "Midtown East": 435.84,
        "Upper West Side": 0,
        "Park Slope": 0,
        "Test 4": 0,
        "Downtown Brooklyn": 0,
        "test 8": 0,
        "store 9": 0,
        s1: 0,
        "IH7 Store": 0,
        "Test 8": 0,
        "All 2": 0,
        "25": 0,
      },
      total: 435.84,
    },
    {
      date: "6/20/2025",
      stores: {
        "Midtown East": 4.68,
        "Upper West Side": 0,
        "Park Slope": 0,
        "Test 4": 0,
        "Downtown Brooklyn": 0,
        "test 8": 0,
        "store 9": 0,
        s1: 0,
        "IH7 Store": 0,
        "Test 8": 0,
        "All 2": 0,
        "25": 0,
      },
      total: 4.68,
    },
    {
      date: "6/19/2025",
      stores: {
        "Midtown East": 0,
        "Upper West Side": 0,
        "Park Slope": 0,
        "Test 4": 0,
        "Downtown Brooklyn": 0,
        "test 8": 0,
        "store 9": 0,
        s1: 0,
        "IH7 Store": 0,
        "Test 8": 0,
        "All 2": 0,
        "25": 0,
      },
      total: 0,
    },
    {
      date: "6/18/2025",
      stores: {
        "Midtown East": 0,
        "Upper West Side": 0,
        "Park Slope": 0,
        "Test 4": 0,
        "Downtown Brooklyn": 0,
        "test 8": 0,
        "store 9": 0,
        s1: 0,
        "IH7 Store": 0,
        "Test 8": 0,
        "All 2": 0,
        "25": 0,
      },
      total: 0,
    },
    {
      date: "6/17/2025",
      stores: {
        "Midtown East": 0,
        "Upper West Side": 0,
        "Park Slope": 0,
        "Test 4": 0,
        "Downtown Brooklyn": 0,
        "test 8": 0,
        "store 9": 0,
        s1: 0,
        "IH7 Store": 0,
        "Test 8": 0,
        "All 2": 0,
        "25": 0,
      },
      total: 0,
    },
    {
      date: "6/16/2025",
      stores: {
        "Midtown East": 276.74,
        "Upper West Side": 0,
        "Park Slope": 0,
        "Test 4": 0,
        "Downtown Brooklyn": 0,
        "test 8": 0,
        "store 9": 0,
        s1: 0,
        "IH7 Store": 0,
        "Test 8": 0,
        "All 2": 0,
        "25": 0,
      },
      total: 276.74,
    },
    {
      date: "6/15/2025",
      stores: {
        "Midtown East": 0,
        "Upper West Side": 0,
        "Park Slope": 0,
        "Test 4": 0,
        "Downtown Brooklyn": 0,
        "test 8": 0,
        "store 9": 0,
        s1: 0,
        "IH7 Store": 0,
        "Test 8": 0,
        "All 2": 0,
        "25": 0,
      },
      total: 0,
    },
  ];

  // Filter configuration
  const filterFields = [
    {
      key: "location",
      label: "Location",
      options: [
        { value: "midtown-east", label: "Midtown East" },
        { value: "upper-west-side", label: "Upper West Side" },
        { value: "park-slope", label: "Park Slope" },
        { value: "downtown-brooklyn", label: "Downtown Brooklyn" },
        { value: "test-4", label: "Test 4" },
        { value: "test-8", label: "Test 8" },
        { value: "store-9", label: "Store 9" },
        { value: "s1", label: "S1" },
        { value: "ih7-store", label: "IH7 Store" },
        { value: "all-2", label: "All 2" },
        { value: "25", label: "25" },
      ],
    },
    {
      key: "companies",
      label: "Companies",
      options: [
        { value: "company-a", label: "Company A" },
        { value: "company-b", label: "Company B" },
        { value: "company-c", label: "Company C" },
      ],
    },
  ];

  const handleFilterChange = (fieldKey, values) => {
    setFilters((prev) => ({
      ...prev,
      [fieldKey]: values,
    }));
  };

  const handleApplyFilters = () => {
    console.log("Applying filters:", filters);
    // Apply filter logic here
  };

  const StatCard = ({ icon, title, value, subtitle, color }) => (
    <div
      style={{
        border: "1px solid #e0e0e0",
        borderRadius: "8px",
        padding: "16px",
        backgroundColor: "white",
        transition: "all 0.3s ease",
        minHeight: "100px",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          width: "100%",
        }}
      >
        <div
          style={{
            padding: "8px",
            borderRadius: "8px",
            backgroundColor: `${color}20`,
            color: color,
            fontSize: "20px",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: color,
              marginBottom: "2px",
            }}
          >
            {value}
          </div>
          <div style={{ fontSize: "12px", color: "#666", lineHeight: "1.2" }}>
            {subtitle}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "32px" }}></div>

      {/* Filters Section */}
      <FiltersOrderIQ
        filterFields={filterFields}
        filters={filters}
        onFilterChange={handleFilterChange}
        onApplyFilters={handleApplyFilters}
        showApplyButton={true}
      />

      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        <StatCard
          icon="💰"
          title="Total Cost"
          value={`${summaryStats.totalCost.toFixed(2)}`}
          subtitle="8 days of data"
          color="#1976d2"
        />
        <StatCard
          icon="🛒"
          title="Total Orders"
          value={summaryStats.totalOrders}
          subtitle="In selected period"
          color="#2e7d32"
        />
        <StatCard
          icon="🔥"
          title="Active Stores"
          value={summaryStats.activeStores}
          subtitle="With orders in period"
          color="#ed6c02"
        />
        <StatCard
          icon="📈"
          title="Daily Average"
          value={`${summaryStats.dailyAverage.toFixed(2)}`}
          subtitle="Cost per day"
          color="#9c27b0"
        />
      </div>

      {/* Cost Breakdown Section */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: "24px",
          marginBottom: "32px",
        }}
      >
        {/* Cost Breakdown by Store */}
        <div
          style={{
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            backgroundColor: "white",
            padding: "24px",
          }}
        >
          <h3
            style={{
              fontSize: "20px",
              fontWeight: 600,
              marginBottom: "24px",
              color: "#333",
            }}
          >
            Cost Breakdown by Store
          </h3>
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            {storeBreakdown.map((store, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom:
                    index < storeBreakdown.length - 1
                      ? "1px solid #f0f0f0"
                      : "none",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: store.cost > 0 ? "#1976d2" : "#e0e0e0",
                    }}
                  />
                  <span style={{ fontSize: "14px", color: "#333" }}>
                    {store.name}
                  </span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{ fontSize: "14px", fontWeight: 600, color: "#333" }}
                  >
                    ${store.cost.toFixed(2)}
                  </div>
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    {store.percentage}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cost Breakdown by Category */}
        <div
          style={{
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            backgroundColor: "white",
            padding: "24px",
          }}
        >
          <h3
            style={{
              fontSize: "20px",
              fontWeight: 600,
              marginBottom: "24px",
              color: "#333",
            }}
          >
            Cost Breakdown by Category
          </h3>
          <div>
            {categoryBreakdown.map((category, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px 0",
                  borderBottom:
                    index < categoryBreakdown.length - 1
                      ? "1px solid #f0f0f0"
                      : "none",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor:
                        index === 0
                          ? "#1976d2"
                          : index === 1
                          ? "#2e7d32"
                          : "#ed6c02",
                    }}
                  />
                  <span style={{ fontSize: "14px", color: "#333" }}>
                    {category.name}
                  </span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{ fontSize: "14px", fontWeight: 600, color: "#333" }}
                  >
                    ${category.cost.toFixed(2)}
                  </div>
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    {category.percentage}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Cost Summary Table */}
      <div
        style={{
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
          backgroundColor: "white",
          padding: "24px",
          marginBottom: "32px",
        }}
      >
        <h3
          style={{
            fontSize: "20px",
            fontWeight: 600,
            marginBottom: "8px",
            color: "#333",
          }}
        >
          Daily Cost Summary
        </h3>
        <p style={{ fontSize: "14px", color: "#666", marginBottom: "24px" }}>
          Cost breakdown by day and store for the selected week period
          (11/06/2023 - 22/06/2023)
        </p>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              border: "1px solid #e0e0e0",
              fontSize: "14px",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f8f9fa" }}>
                <th
                  style={{
                    padding: "12px 8px",
                    border: "1px solid #e0e0e0",
                    fontWeight: 600,
                    textAlign: "left",
                  }}
                >
                  Date
                </th>
                <th
                  style={{
                    padding: "12px 8px",
                    border: "1px solid #e0e0e0",
                    fontWeight: 600,
                    textAlign: "left",
                  }}
                >
                  Upper West Side
                </th>
                <th
                  style={{
                    padding: "12px 8px",
                    border: "1px solid #e0e0e0",
                    fontWeight: 600,
                    textAlign: "left",
                  }}
                >
                  Park Slope
                </th>
                <th
                  style={{
                    padding: "12px 8px",
                    border: "1px solid #e0e0e0",
                    fontWeight: 600,
                    textAlign: "left",
                  }}
                >
                  Test 4
                </th>
                <th
                  style={{
                    padding: "12px 8px",
                    border: "1px solid #e0e0e0",
                    fontWeight: 600,
                    textAlign: "left",
                  }}
                >
                  Downtown Brooklyn
                </th>
                <th
                  style={{
                    padding: "12px 8px",
                    border: "1px solid #e0e0e0",
                    fontWeight: 600,
                    textAlign: "left",
                  }}
                >
                  test 8
                </th>
                <th
                  style={{
                    padding: "12px 8px",
                    border: "1px solid #e0e0e0",
                    fontWeight: 600,
                    textAlign: "left",
                  }}
                >
                  store 9
                </th>
                <th
                  style={{
                    padding: "12px 8px",
                    border: "1px solid #e0e0e0",
                    fontWeight: 600,
                    textAlign: "left",
                  }}
                >
                  s1
                </th>
                <th
                  style={{
                    padding: "12px 8px",
                    border: "1px solid #e0e0e0",
                    fontWeight: 600,
                    textAlign: "left",
                  }}
                >
                  IH7 Store
                </th>
                <th
                  style={{
                    padding: "12px 8px",
                    border: "1px solid #e0e0e0",
                    fontWeight: 600,
                    textAlign: "left",
                  }}
                >
                  Test 8
                </th>
                <th
                  style={{
                    padding: "12px 8px",
                    border: "1px solid #e0e0e0",
                    fontWeight: 600,
                    textAlign: "left",
                  }}
                >
                  All 2
                </th>
                <th
                  style={{
                    padding: "12px 8px",
                    border: "1px solid #e0e0e0",
                    fontWeight: 600,
                    textAlign: "left",
                  }}
                >
                  Midtown East
                </th>
                <th
                  style={{
                    padding: "12px 8px",
                    border: "1px solid #e0e0e0",
                    fontWeight: 600,
                    textAlign: "left",
                  }}
                >
                  25
                </th>
                <th
                  style={{
                    padding: "12px 8px",
                    border: "1px solid #e0e0e0",
                    fontWeight: 600,
                    textAlign: "left",
                    color: "#1976d2",
                  }}
                >
                  Daily Total
                </th>
              </tr>
            </thead>
            <tbody>
              {dailyData.map((row, index) => (
                <tr
                  key={index}
                  style={{
                    backgroundColor: index % 2 === 1 ? "#fafafa" : "white",
                  }}
                >
                  <td
                    style={{
                      padding: "12px 8px",
                      border: "1px solid #e0e0e0",
                      fontWeight: 500,
                    }}
                  >
                    {row.date}
                  </td>
                  {Object.entries(row.stores).map(([store, value]) => (
                    <td
                      key={store}
                      style={{
                        padding: "12px 8px",
                        border: "1px solid #e0e0e0",
                      }}
                    >
                      {value > 0 ? (
                        <span
                          style={{
                            backgroundColor: "#e3f2fd",
                            color: "#1976d2",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            border: "1px solid #1976d2",
                          }}
                        >
                          ${value.toFixed(2)}
                        </span>
                      ) : (
                        "$0.00"
                      )}
                    </td>
                  ))}
                  <td
                    style={{
                      padding: "12px 8px",
                      border: "1px solid #e0e0e0",
                      fontWeight: 600,
                      color: "#1976d2",
                    }}
                  >
                    ${row.total.toFixed(2)}
                  </td>
                </tr>
              ))}
              {/* Period Total Row */}
              <tr style={{ backgroundColor: "#e3f2fd", fontWeight: 600 }}>
                <td
                  style={{
                    padding: "12px 8px",
                    border: "1px solid #e0e0e0",
                    fontWeight: 600,
                  }}
                >
                  Period Total:
                </td>
                {Object.keys(dailyData[0].stores).map((store) => (
                  <td
                    key={store}
                    style={{
                      padding: "12px 8px",
                      border: "1px solid #e0e0e0",
                      fontWeight: 600,
                    }}
                  >
                    ${store === "Midtown East" ? "717.26" : "0.00"}
                  </td>
                ))}
                <td
                  style={{
                    padding: "12px 8px",
                    border: "1px solid #e0e0e0",
                    fontWeight: 700,
                    color: "#1976d2",
                    fontSize: "16px",
                  }}
                >
                  $717.26
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Reports Section */}
      <div
        style={{
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
          backgroundColor: "white",
          padding: "24px",
        }}
      >
        <h3
          style={{
            fontSize: "20px",
            fontWeight: 600,
            marginBottom: "24px",
            color: "#333",
          }}
        >
          Export Reports
        </h3>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <button
            style={{
              backgroundColor: "#1976d2",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "4px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            📥 Export to Excel
          </button>
          <button
            style={{
              backgroundColor: "white",
              color: "#1976d2",
              border: "1px solid #1976d2",
              padding: "12px 24px",
              borderRadius: "4px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            📄 Export to PDF
          </button>
          <button
            style={{
              backgroundColor: "white",
              color: "#1976d2",
              border: "1px solid #1976d2",
              padding: "12px 24px",
              borderRadius: "4px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            📧 Email Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default SummaryFinancialDashboard;

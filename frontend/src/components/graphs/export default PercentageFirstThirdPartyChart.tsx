import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  ComposedChart,
  LabelList,
} from "recharts";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

interface PercentageFirstThirdPartyChartProps {
  tableData: any;
}

const PercentageFirstThirdPartyChart: React.FC<
  PercentageFirstThirdPartyChartProps
> = ({ tableData }) => {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Process the data for the chart whenever tableData changes
    if (
      tableData &&
      tableData.table1 &&
      tableData.table1.length > 0 &&
      tableData.table4 &&
      tableData.table4.length > 0
    ) {
      const processedData = processDataForChart(tableData);
      setChartData(processedData);
    }
  }, [tableData]);

  // Helper function to parse values
  const parseCurrencyValue = (value: string | number): number => {
    if (typeof value === "number") return value;
    if (!value || value === "####") return 0;

    if (typeof value === "string" && value.includes("$")) {
      return parseFloat(value.replace(/[$,]/g, ""));
    }

    return parseFloat(value) || 0;
  };

  // Helper function to parse percentage values
  const parsePercentageValue = (value: string | number): number => {
    if (typeof value === "number") return value;
    if (!value || value === "####") return 0;

    if (typeof value === "string" && value.includes("%")) {
      return parseFloat(value.replace("%", ""));
    }

    return parseFloat(value) || 0;
  };

  // Process the raw data from tableData
  const processDataForChart = (data: any): any[] => {
    const table1 = data.table1 || []; // Raw data table
    const table4 = data.table4 || []; // WOW table with 1P/3P ratio

    // Create a map for ratios
    const ratioMap: { [key: number]: number } = {};

    table4.forEach((item: any) => {
      if (item.Week && item["1P/3P"] && item["1P/3P"] !== "####") {
        ratioMap[parseInt(item.Week)] = parsePercentageValue(item["1P/3P"]);
      }
    });

    return table1
      .map((item: any) => {
        const week = parseInt(item.Week);

        // Get the values from table1
        const firstParty = parseCurrencyValue(item["1P"]);

        // Calculate 3P as sum of DD, GH, UB
        const doorDash = parseCurrencyValue(item["DD"]);
        const grubHub = parseCurrencyValue(item["GH"]);
        const uberEats = parseCurrencyValue(item["UB"]);
        const thirdParty = doorDash + grubHub + uberEats;

        // Get the ratio from the map or calculate it
        let ratio = ratioMap[week] || 0;

        // If the ratio is not in the map, calculate it
        if (ratio === 0 && thirdParty > 0) {
          ratio = (firstParty / thirdParty) * 100;
        }

        // Get total of all sales categories
        const total =
          firstParty +
          thirdParty +
          parseCurrencyValue(item["Catering"]) +
          parseCurrencyValue(item["In-House"]);

        // Calculate percentages for the stacked bar chart
        const firstPartyPct = total > 0 ? (firstParty / total) * 100 : 0;
        const thirdPartyPct = total > 0 ? (thirdParty / total) * 100 : 0;
        const ratioPct =
          total > 0
            ? ((firstParty + thirdParty) / total) * 100 -
              firstPartyPct -
              thirdPartyPct
            : 0;

        return {
          week: week,
          "1P": firstPartyPct,
          "1P/3P": ratio, // This is for the line trend
          "3P": thirdPartyPct,
          // For display in the bars
          "1P_display": firstPartyPct.toFixed(2) + "%",
          "3P_display": thirdPartyPct.toFixed(2) + "%",
          // For the middle section (between 1P and 3P)
          ratio_display: ratio.toFixed(2) + "%",
        };
      })
      .sort((a, b) => a.week - b.week);
  };

  // Custom label renderer for percentage values in bars
  const renderPercentageLabel = (props: any) => {
    const { x, y, width, height, value, name } = props;

    // Don't render for very small values
    if (value < 2) return null;

    // Position label in the middle of each section
    return (
      <text
        x={x + width / 2}
        y={y + height / 2}
        fill="#FFFFFF"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={10}
        fontWeight="bold"
      >
        {`${value.toFixed(2)}%`}
      </text>
    );
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Get the values
      const firstPartyPct =
        payload.find((p: any) => p.name === "1P")?.value || 0;
      const thirdPartyPct =
        payload.find((p: any) => p.name === "3P")?.value || 0;
      const ratio = payload.find((p: any) => p.name === "1P/3P")?.value || 0;

      return (
        <div
          style={{
            backgroundColor: "#fff",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "5px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
          }}
        >
          <p style={{ margin: 0, fontWeight: "bold", marginBottom: "5px" }}>
            Week {label}
          </p>
          <p style={{ margin: 0, color: "#B9C6FF" }}>
            1P: {firstPartyPct.toFixed(2)}%
          </p>
          <p style={{ margin: 0, color: "#F3D479" }}>
            3P: {thirdPartyPct.toFixed(2)}%
          </p>
          <p
            style={{
              margin: "5px 0 0 0",
              color: "#C687A7",
              fontWeight: "bold",
              borderTop: "1px solid #eee",
              paddingTop: "5px",
            }}
          >
            1P/3P Ratio: {ratio.toFixed(2)}%
          </p>
        </div>
      );
    }
    return null;
  };

  // Render empty component if no data
  if (!chartData || chartData.length === 0) {
    return (
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6">1P / 3P</Typography>
          <Typography color="text.secondary">
            No 1P/3P data available. Please upload an Excel file with valid
            sales data.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          1P / 3P
        </Typography>

        <Box sx={{ width: "100%", height: 500 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={true}
                vertical={false}
              />
              <XAxis dataKey="week" />
              <YAxis
                tickFormatter={(value) => `${value.toFixed(0)}%`}
                domain={[0, 60]} // Set domain to 0-60% to match image
                label={{
                  value: "",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              {/* Stacked bars - bottom to top: 3P, 1P/3P ratio, 1P */}

              <Bar dataKey="1P/3P" stackId="a" name="1P/3P" fill="#C687A7">
                <LabelList dataKey="1P/3P" content={renderPercentageLabel} />
              </Bar>
              <Bar dataKey="3P" stackId="a" name="3P" fill="#F3D479">
                <LabelList dataKey="3P" content={renderPercentageLabel} />
              </Bar>
              <Bar dataKey="1P" stackId="a" name="1P" fill="#B9C6FF">
                <LabelList dataKey="1P" content={renderPercentageLabel} />
              </Bar>

              {/* Add a trend line */}
              <Line
                type="monotone"
                dataKey="1P/3P"
                stroke="#C687A7"
                strokeWidth={2}
                dot={false}
                legendType="none" // Hide from legend since we have the bar version
              />
            </ComposedChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PercentageFirstThirdPartyChart;

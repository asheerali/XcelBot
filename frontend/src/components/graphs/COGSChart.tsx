// src/components/charts/COGSChart.tsx
import React from "react";
import { ResponsiveBar } from "@nivo/bar";
import { Box, useTheme } from "@mui/material";
import BaseChart from "./BaseChart";

interface DataItem {
  store: string;
  "Tw COGS": number;
  "Lw COGS": number;
}

const COGSChart: React.FC = () => {
  const theme = useTheme();

  // Data based on Image 4
  const data: DataItem[] = [
    {
      store: "0001: Midtown East",
      "Tw COGS": 209202.98,
      "Lw COGS": 208770.59,
    },
    {
      store: "0002: Lenox Hill",
      "Tw COGS": 263932.59,
      "Lw COGS": 263932.59,
    },
    {
      store: "0003: Hell's Kitchen",
      "Tw COGS": 286700.07,
      "Lw COGS": 286259.49,
    },
    {
      store: "0004: Union Square",
      "Tw COGS": 67410.9,
      "Lw COGS": 66989.23,
    },
    {
      store: "0005: Flatiron",
      "Tw COGS": 242340.09,
      "Lw COGS": 241910.65,
    },
    {
      store: "0011: Williamsburg",
      "Tw COGS": 72649.35,
      "Lw COGS": 72162.13,
    },
    {
      store: "Grand Total",
      "Tw COGS": 1142235.99,
      "Lw COGS": 1140024.68,
    },
  ];

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <BaseChart title="COGS $">
      <Box sx={{ height: "100%" }}>
        <ResponsiveBar
          data={data}
          keys={["Tw COGS", "Lw COGS"]}
          indexBy="store"
          margin={{ top: 50, right: 70, bottom: 50, left: 70 }}
          padding={0.3}
          // src/components/charts/COGSChart.tsx (continuation)
          valueScale={{ type: "linear" }}
          indexScale={{ type: "band", round: true }}
          colors={["#9c27b0", "#e57373"]}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legendPosition: "middle",
            legendOffset: 32,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legendPosition: "middle",
            legendOffset: -60,
            format: (value) => `$${(value / 1000).toFixed(0)}k`,
          }}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor="white"
          legends={[
            {
              dataFrom: "keys",
              anchor: "top",
              direction: "row",
              justify: false,
              translateX: 0,
              translateY: -30,
              itemsSpacing: 2,
              itemWidth: 100,
              itemHeight: 20,
              itemDirection: "left-to-right",
              itemOpacity: 0.85,
              symbolSize: 20,
            },
          ]}
          valueFormat={formatCurrency}
          enableGridY={true}
          enableLabel={true}
          label={(d) => `$${Math.floor(d.value / 1000)}k`}
          labelSkipHeight={16}
          animate={true}
          motionStiffness={90}
          motionDamping={15}
          theme={{
            axis: {
              ticks: {
                text: {
                  fontSize: 11,
                },
              },
            },
          }}
        />
      </Box>
    </BaseChart>
  );
};

export default COGSChart;

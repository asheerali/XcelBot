
// src/components/charts/LaborCostChart.tsx
import React from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { Box, useTheme } from '@mui/material';
import BaseChart from './BaseChart';

interface DataItem {
  store: string;
  'Tw Reg Pay': number;
  'Lw Reg Pay': number;
}

const LaborCostChart: React.FC = () => {
  const theme = useTheme();
  
  // Data based on Image 3
  const data: DataItem[] = [
    {
      store: '0001: Midtown East',
      'Tw Reg Pay': 120317.61,
      'Lw Reg Pay': 120317.61
    },
    {
      store: '0002: Lenox Hill',
      'Tw Reg Pay': 187929.88,
      'Lw Reg Pay': 186309.88
    },
    {
      store: '0003: Hell\'s Kitchen',
      'Tw Reg Pay': 200590.94,
      'Lw Reg Pay': 199078.22
    },
    {
      store: '0004: Union Square',
      'Tw Reg Pay': 56704.25,
      'Lw Reg Pay': 56704.25
    },
    {
      store: '0005: Flatiron',
      'Tw Reg Pay': 174991.94,
      'Lw Reg Pay': 173694.02
    },
    {
      store: '0011: Williamsburg',
      'Tw Reg Pay': 290133.01,
      'Lw Reg Pay': 290929.09
    },
    {
      store: 'Grand Total',
      'Tw Reg Pay': 1030667.64,
      'Lw Reg Pay': 1027033.08
    }
  ];
  
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString(undefined, { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };
  
  return (
    <BaseChart title="Labor $ Spent">
      <Box sx={{ height: '100%' }}>
        <ResponsiveBar
          data={data}
          keys={['Tw Reg Pay', 'Lw Reg Pay']}
          indexBy="store"
          margin={{ top: 50, right: 70, bottom: 50, left: 70 }}
          padding={0.3}
          valueScale={{ type: 'linear' }}
          indexScale={{ type: 'band', round: true }}
          colors={['#4285f4', '#ea4335']}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -45,
            legendPosition: 'middle',
            legendOffset: 32
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legendPosition: 'middle',
            legendOffset: -60,
            format: (value) => `$${(value / 1000).toFixed(0)}k`
          }}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor="white"
          legends={[
            {
              dataFrom: 'keys',
              anchor: 'top',
              direction: 'row',
              justify: false,
              translateX: 0,
              translateY: -30,
              itemsSpacing: 2,
              itemWidth: 100,
              itemHeight: 20,
              itemDirection: 'left-to-right',
              itemOpacity: 0.85,
              symbolSize: 20
            }
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
                  fontSize: 11
                }
              }
            }
          }}
        />
      </Box>
    </BaseChart>
  );
};

export default LaborCostChart;
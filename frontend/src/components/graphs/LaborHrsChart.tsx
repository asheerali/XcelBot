
// src/components/charts/LaborHrsChart.tsx
import React from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { Box, useTheme } from '@mui/material';
import BaseChart from './BaseChart';

interface DataItem {
  store: string;
  'Tw Lb Hrs': number;
  'Lw Lb Hrs': number;
}

const LaborHrsChart: React.FC = () => {
  const theme = useTheme();
  
  // Data based on Image 2
  const data: DataItem[] = [
    {
      store: '0001: Midtown East',
      'Tw Lb Hrs': 5737.37,
      'Lw Lb Hrs': 5737.37
    },
    {
      store: '0002: Lenox Hill',
      'Tw Lb Hrs': 9291.48,
      'Lw Lb Hrs': 9291.48
    },
    {
      store: '0003: Hell\'s Kitchen',
      'Tw Lb Hrs': 9436.65,
      'Lw Lb Hrs': 9436.65
    },
    {
      store: '0004: Union Square',
      'Tw Lb Hrs': 2830.92,
      'Lw Lb Hrs': 2830.92
    },
    {
      store: '0005: Flatiron',
      'Tw Lb Hrs': 8598.96,
      'Lw Lb Hrs': 8598.96
    },
    {
      store: '0011: Williamsburg',
      'Tw Lb Hrs': 12297.80,
      'Lw Lb Hrs': 12297.80
    },
    {
      store: 'Grand Total',
      'Tw Lb Hrs': 48193.18,
      'Lw Lb Hrs': 48193.18
    }
  ];
  
  // Format data values with commas for thousands
  const formatValue = (value: number) => value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  
  return (
    <BaseChart title="Labor Hrs">
      <Box sx={{ height: '100%' }}>
        <ResponsiveBar
          data={data}
          keys={['Tw Lb Hrs', 'Lw Lb Hrs']}
          indexBy="store"
          margin={{ top: 50, right: 50, bottom: 50, left: 70 }}
          padding={0.3}
          valueScale={{ type: 'linear' }}
          indexScale={{ type: 'band', round: true }}
          colors={['#000000', '#8bc34a']}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            // tickRotation: -45,
            legendPosition: 'middle',
            legendOffset: 32
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legendPosition: 'middle',
            legendOffset: -60,
            format: (value) => `${(value / 1000).toFixed(0)}k`
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
          valueFormat={formatValue}
          enableGridY={true}
          enableLabel={true}
          label={(d) => d.data[`${d.id}`].toFixed(2)}
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

export default LaborHrsChart;
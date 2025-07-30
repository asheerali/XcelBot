// src/components/charts/COGSPercentageChart.tsx
import React from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { Box, useTheme } from '@mui/material';
import BaseChart from './BaseChart';

interface DataItem {
  store: string;
  'Tw Fc %': number;
  'Lw Fc %': number;
}

const COGSPercentageChart: React.FC = () => {
  const theme = useTheme();
  
  // Data based on Image 4
  const data: DataItem[] = [
    {
      store: '0001: Midtown East',
      'Tw Fc %': 30.55,
      'Lw Fc %': 30.59
    },
    {
      store: '0002: Lenox Hill',
      'Tw Fc %': 33.67,
      'Lw Fc %': 33.67
    },
    {
      store: '0003: Hell\'s Kitchen',
      'Tw Fc %': 32.04,
      'Lw Fc %': 32.11
    },
    {
      store: '0004: Union Square',
      'Tw Fc %': 29.31,
      'Lw Fc %': 29.24
    },
    {
      store: '0005: Flatiron',
      'Tw Fc %': 31.33,
      'Lw Fc %': 31.34
    },
    {
      store: '0011: Williamsburg',
      'Tw Fc %': 2.08,
      'Lw Fc %': 2.07
    }
  ];
  
  // Format data values as percentages for display
  const formatValue = (value: number) => `${value.toFixed(2)}%`;
  
  return (
    <BaseChart title="COGS %">
      <Box sx={{ height: '100%' }}>
        <ResponsiveBar
          data={data}
          keys={['Tw Fc %', 'Lw Fc %']}
          indexBy="store"
          margin={{ top: 50, right: 50, bottom: 50, left: 50 }}
          padding={0.3}
          valueScale={{ type: 'linear' }}
          indexScale={{ type: 'band', round: true }}
          colors={['#9c27b0', '#e57373']}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
<<<<<<< HEAD
            tickRotation: -45,
=======
            tickRotation: 0,
>>>>>>> integrations_v41
            legendPosition: 'middle',
            legendOffset: 32
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Percentage',
            legendPosition: 'middle',
            legendOffset: -40,
            format: (value) => `${value}%`
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
          maxValue={40}
          minValue={0}
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

export default COGSPercentageChart;
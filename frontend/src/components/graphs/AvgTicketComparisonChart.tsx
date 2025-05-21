// src/components/charts/AvgTicketComparisonChart.tsx
import React from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { Box, useTheme } from '@mui/material';
import BaseChart from './BaseChart';

interface DataItem {
  store: string;
  'Tw vs. Lw': number;
  'Tw vs. Ly': number;
}

const AvgTicketComparisonChart: React.FC = () => {
  const theme = useTheme();
  
  // Data based on Image 1
  const data: DataItem[] = [
    {
      store: '0001: Midtown East',
      'Tw vs. Lw': 0.35,
      'Tw vs. Ly': 11.85
    },
    {
      store: '0002: Lenox Hill',
      'Tw vs. Lw': 0.00,
      'Tw vs. Ly': -4.11
    },
    {
      store: '0003: Hell\'s Kitchen',
      'Tw vs. Lw': 0.38,
      'Tw vs. Ly': -1.12
    },
    {
      store: '0004: Union Square',
      'Tw vs. Lw': 0.39,
      'Tw vs. Ly': 3.54
    },
    {
      store: '0005: Flatiron',
      'Tw vs. Lw': 0.21,
      'Tw vs. Ly': 5.38
    }
  ];
  
  // Format data values as percentages for display
  const formatValue = (value: number) => `${value.toFixed(2)}%`;
  
  return (
    <BaseChart title="Avg Ticket">
      <Box sx={{ height: '100%' }}>
        <ResponsiveBar
          data={data}
          keys={['Tw vs. Lw', 'Tw vs. Ly']}
          indexBy="store"
          margin={{ top: 50, right: 50, bottom: 50, left: 50 }}
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
          enableLabel={false}
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

export default AvgTicketComparisonChart;
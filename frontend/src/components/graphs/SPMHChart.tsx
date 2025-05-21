
// src/components/charts/SPMHChart.tsx
import React from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { Box, useTheme } from '@mui/material';
import BaseChart from './BaseChart';

interface DataItem {
  store: string;
  'Tw SPMH': number;
  'Lw SPMH': number;
}

const SPMHChart: React.FC = () => {
  const theme = useTheme();
  
  // Data based on Image 2
  const data: DataItem[] = [
    {
      store: '0001: Midtown East',
      'Tw SPMH': 117.44,
      'Lw SPMH': 389.74
    },
    {
      store: '0002: Lenox Hill',
      'Tw SPMH': 84.34,
      'Lw SPMH': 84.34
    },
    {
      store: '0003: Hell\'s Kitchen',
      'Tw SPMH': 105.41,
      'Lw SPMH': 345.76
    },
    {
      store: '0004: Union Square',
      'Tw SPMH': 71.39,
      'Lw SPMH': 198.36
    },
    {
      store: '0005: Flatiron',
      'Tw SPMH': 99.08,
      'Lw SPMH': 305.27
    },
    {
      store: '0011: Williamsburg',
      'Tw SPMH': 10.12,
      'Lw SPMH': 668.70
    }
  ];
  
  return (
    <BaseChart title="SPMH">
      <Box sx={{ height: '100%' }}>
        <ResponsiveBar
          data={data}
          keys={['Tw SPMH', 'Lw SPMH']}
          indexBy="store"
          margin={{ top: 50, right: 50, bottom: 50, left: 50 }}
          padding={0.3}
          valueScale={{ type: 'linear' }}
          indexScale={{ type: 'band', round: true }}
          colors={['#000000', '#8bc34a']}
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
            legend: 'SPMH',
            legendPosition: 'middle',
            legendOffset: -40
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
          enableGridY={true}
          enableLabel={true}
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

export default SPMHChart;
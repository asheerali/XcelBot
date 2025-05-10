import React, { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  LabelList,
  ReferenceLine
} from 'recharts';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

interface WowTrendsChartProps {
  tableData: any;
}

const WowTrendsChart: React.FC<WowTrendsChartProps> = ({ tableData }) => {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Process the data for the chart whenever tableData changes
    if (tableData && tableData.table4 && tableData.table4.length > 0) {
      const processedData = processDataForChart(tableData.table4);
      setChartData(processedData);
    }
  }, [tableData]);

  // Helper function to parse percentage values
  const parsePercentageValue = (value: string | number): number => {
    if (typeof value === 'number') return value;
    if (!value || value === '####') return 0;
    
    if (typeof value === 'string' && value.includes('%')) {
      return parseFloat(value.replace('%', ''));
    }
    
    return parseFloat(value) || 0;
  };

  // Process the raw data from tableData.table4 (WOW table)
  const processDataForChart = (rawData: any[]): any[] => {
    // Skip the first item since it doesn't have WOW changes (it's the base week)
    return rawData.filter((item, index) => index > 0).map(weekData => {
      // Get values for each category
      const firstParty = parsePercentageValue(weekData['1P']);
      const inHouse = parsePercentageValue(weekData['In-House']);
      const catering = parsePercentageValue(weekData['Catering']);
      const doordash = parsePercentageValue(weekData['DD']);
      const grubhub = parsePercentageValue(weekData['GH']);
      const uber = parsePercentageValue(weekData['UB']);
      
      return {
        week: weekData.Week,
        "1P": firstParty,
        "In-House": inHouse,
        "Catering": catering,
        "DD": doordash,
        "GH": grubhub,
        "UB": uber
      };
    });
  };

  // Custom label renderer for bar values
  const renderCustomizedLabel = (props: any) => {
    const { x, y, width, value, fill } = props;
    
    // Don't show label if value is close to zero
    if (Math.abs(value) < 0.05) return null;
    
    return (
      <text 
        x={x + width / 2} 
        y={value >= 0 ? y - 6 : y + 15}
        fill={fill}
        textAnchor="middle"
        fontSize={10}
        fontWeight="bold"
      >
        {`${value.toFixed(2)}%`}
      </text>
    );
  };

  // Custom tooltip showing formatted percentages
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ 
          backgroundColor: '#fff', 
          padding: '10px', 
          border: '1px solid #ccc',
          borderRadius: '5px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold', marginBottom: '5px' }}>Week {label}</p>
          {payload.map((entry: any, index: number) => (
            <p 
              key={`tooltip-${index}`} 
              style={{ 
                margin: 0, 
                color: entry.color,
                fontWeight: Math.abs(entry.value) > 5 ? 'bold' : 'normal'
              }}
            >
              {`${entry.name}: ${entry.value.toFixed(2)}%`}
              {Math.abs(entry.value) > 10 && 
                <span style={{ 
                  fontWeight: 'bold', 
                  marginLeft: '5px',
                  color: entry.value > 0 ? 'green' : 'red' 
                }}>
                  {entry.value > 0 ? '↑' : '↓'}
                </span>
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // If no data is available
  if (!chartData || chartData.length === 0) {
    return (
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6">Week-over-Week Trends</Typography>
          <Typography color="text.secondary">
            No WOW trend data available. Please upload an Excel file with valid sales data.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Format Y-axis labels
  const formatYAxis = (value: number) => {
    return `${value}`;
  };

  // Calculate Y-axis range based on min and max values
  const allValues = chartData.flatMap(item => [
    item['1P'], item['In-House'], item['Catering'], 
    item['DD'], item['GH'], item['UB']
  ]);
  
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  
  // Add padding to the Y-axis range
  const yAxisMin = Math.min(-20, Math.floor(minValue / 5) * 5);
  const yAxisMax = Math.max(20, Math.ceil(maxValue / 5) * 5);

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Week-over-Week (WOW) Trends
        </Typography>
        
        <Box sx={{ width: '100%', height: 500 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis 
                tickFormatter={formatYAxis}
                domain={[yAxisMin, yAxisMax]}
                label={{ 
                  value: 'Percentage Change (%)', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' }
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <ReferenceLine y={0} stroke="#000" />
              
              {/* Using different colors for each category */}
              <Bar dataKey="1P" fill="#6495ED" name="1P">
                <LabelList dataKey="1P" content={renderCustomizedLabel} fill="#6495ED" />
              </Bar>
              <Bar dataKey="In-House" fill="#DC143C" name="In-House">
                <LabelList dataKey="In-House" content={renderCustomizedLabel} fill="#DC143C" />
              </Bar>
              <Bar dataKey="Catering" fill="#FFD700" name="Catering">
                <LabelList dataKey="Catering" content={renderCustomizedLabel} fill="#FFD700" />
              </Bar>
              <Bar dataKey="DD" fill="#32CD32" name="DD">
                <LabelList dataKey="DD" content={renderCustomizedLabel} fill="#32CD32" />
              </Bar>
              <Bar dataKey="GH" fill="#FF8C00" name="GH">
                <LabelList dataKey="GH" content={renderCustomizedLabel} fill="#FF8C00" />
              </Bar>
              <Bar dataKey="UB" fill="#20B2AA" name="UB">
                <LabelList dataKey="UB" content={renderCustomizedLabel} fill="#20B2AA" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default WowTrendsChart;
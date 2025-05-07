import React, { useEffect, useState } from 'react';
import { 
  ComposedChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Line,
  LabelList
} from 'recharts';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

interface FirstPartyPercentageChartProps {
  tableData: any;
}

const FirstPartyPercentageChart: React.FC<FirstPartyPercentageChartProps> = ({ tableData }) => {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Process the data for the chart whenever tableData changes
    if (tableData && tableData.table1 && tableData.table1.length > 0) {
      const processedData = processDataForChart(tableData.table1);
      setChartData(processedData);
    }
  }, [tableData]);

  // Helper function to parse currency values
  const parseCurrencyValue = (value: string | number): number => {
    if (typeof value === 'number') return value;
    if (!value || value === '####') return 0;
    
    if (typeof value === 'string' && value.includes('$')) {
      return parseFloat(value.replace(/[$,]/g, ''));
    }
    
    return parseFloat(value) || 0;
  };

  // Process the raw data to calculate 1P as a percentage of total sales
  const processDataForChart = (rawData: any[]): any[] => {
    return rawData.map(weekData => {
      // Get the grand total and 1P values
      const grandTotal = parseCurrencyValue(weekData['Grand Total']);
      const firstPartyValue = parseCurrencyValue(weekData['1P']);
      
      // Calculate 1P as percentage of total
      let firstPartyPercentage = grandTotal ? (firstPartyValue / grandTotal * 100) : 0;
      
      // Round to 2 decimal places
      firstPartyPercentage = parseFloat(firstPartyPercentage.toFixed(2));
      
      return {
        week: weekData.Week,
        "1P": firstPartyPercentage,
        // Store the raw values for tooltips
        "1P_raw": firstPartyValue,
        "Grand Total_raw": grandTotal
      };
    });
  };
  
  // Calculate trend line
  const calculateTrendLine = (data: any[]): any[] => {
    if (!data || data.length === 0) return [];
    
    // We'll use a simple 3-point moving average if we have enough data points
    const windowSize = Math.min(3, data.length);
    
    const result = [...data];
    
    // Calculate moving average
    if (data.length >= windowSize) {
      for (let i = 0; i < data.length; i++) {
        // Get values for the window (windowSize points centered on current point)
        const startIdx = Math.max(0, i - Math.floor(windowSize / 2));
        const endIdx = Math.min(data.length - 1, i + Math.floor(windowSize / 2));
        
        let firstPartySum = 0;
        let count = 0;
        
        for (let j = startIdx; j <= endIdx; j++) {
          firstPartySum += data[j]["1P"];
          count++;
        }
        
        // Add trend line data
        result[i]["1P_trend"] = parseFloat((firstPartySum / count).toFixed(2));
      }
    } else {
      // Not enough data for a moving average, just use the values as is
      result.forEach(item => {
        item["1P_trend"] = item["1P"];
      });
    }
    
    return result;
  };

  // Custom tooltip to show both percentage and actual value
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Filter out trend lines from tooltip
      const barPayload = payload.find((entry: any) => entry.dataKey === "1P");
      
      if (!barPayload) return null;
      
      return (
        <div style={{ 
          backgroundColor: '#fff', 
          padding: '10px', 
          border: '1px solid #ccc',
          borderRadius: '5px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold', marginBottom: '5px' }}>Week {label}</p>
          <p style={{ margin: 0, color: barPayload.color }}>
            1P: {barPayload.value.toFixed(2)}% of total
          </p>
          <p style={{ margin: '5px 0 0 0', color: '#555', borderTop: '1px solid #eee', paddingTop: '5px' }}>
            1P: ${barPayload.payload["1P_raw"].toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </p>
          <p style={{ margin: 0, color: '#555' }}>
            Total Sales: ${barPayload.payload["Grand Total_raw"].toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom bar label renderer
  const renderCustomizedLabel = (props: any) => {
    const { x, y, width, height, value } = props;
    const radius = 10;
    
    return (
      <text
        x={x + width / 2}
        y={y - radius}
        fill="#9C4275"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={12}
        fontWeight="bold"
      >
        {`${value.toFixed(2)}%`}
      </text>
    );
  };

  // If no data is available
  if (!chartData || chartData.length === 0) {
    return (
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6">1P Percentage</Typography>
          <Typography color="text.secondary">
            No data available. Please upload an Excel file with valid sales data.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Add trend line to chart data
  const dataWithTrendLine = calculateTrendLine(chartData);

  // Format Y-axis labels
  const formatYAxis = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Calculate Y-axis range
  const minPercentage = Math.min(...dataWithTrendLine.map((item: any) => item['1P'])) * 0.9;
  const maxPercentage = Math.max(...dataWithTrendLine.map((item: any) => item['1P'])) * 1.1;
  
  // Round to nearest 5% for better readability
  const yAxisMin = Math.max(0, Math.floor(minPercentage / 5) * 5);
  const yAxisMax = Math.ceil(maxPercentage / 5) * 5;

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          1P (First Party)
        </Typography>
        
        <Box sx={{ width: '100%', height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={dataWithTrendLine}
              margin={{ top: 40, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis 
                tickFormatter={formatYAxis}
                domain={[yAxisMin, yAxisMax]}
                label={{ 
                  value: 'Percentage of Total Sales', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' }
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="1P" 
                fill="#E9A5C9" 
                name="1P"
              >
                <LabelList dataKey="1P" position="top" content={renderCustomizedLabel} />
              </Bar>
              
              {/* Trend line */}
              <Line 
                type="monotone" 
                dataKey="1P_trend" 
                stroke="#9C4275" 
                strokeWidth={2} 
                dot={false} 
                activeDot={false}
                legendType="none"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default FirstPartyPercentageChart;
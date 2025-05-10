import React, { useEffect, useState } from 'react';
import { 
  ComposedChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Line
} from 'recharts';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

interface DeliveryPercentageChartProps {
  tableData: any;
}

const DeliveryPercentageChart: React.FC<DeliveryPercentageChartProps> = ({ tableData }) => {
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

  // Process the raw data into percentage format for the chart
  const processDataForChart = (rawData: any[]): any[] => {
    // First pass: calculate all percentages
    const data = rawData.map(weekData => {
      // Get the In-House value as base for percentage calculation
      const inHouseValue = parseCurrencyValue(weekData['In-House']);
      
      // Calculate percentages for each delivery type
      // Using 0 as fallback if the value doesn't exist or can't be parsed
      const firstPartyValue = parseCurrencyValue(weekData['1P']);
      const ddValue = parseCurrencyValue(weekData['DD']);
      const ghValue = parseCurrencyValue(weekData['GH']);
      const ubValue = parseCurrencyValue(weekData['UB']);
      
      // Calculate percentages (relative to In-House) with 2 decimal places
      let fp = inHouseValue ? (firstPartyValue / inHouseValue * 100) : 0;
      let dd = inHouseValue ? (ddValue / inHouseValue * 100) : 0;
      let gh = inHouseValue ? (ghValue / inHouseValue * 100) : 0;
      let ub = inHouseValue ? (ubValue / inHouseValue * 100) : 0;
      
      // Round to 2 decimal places
      fp = parseFloat(fp.toFixed(2));
      dd = parseFloat(dd.toFixed(2));
      gh = parseFloat(gh.toFixed(2));
      ub = parseFloat(ub.toFixed(2));
      
      return {
        week: weekData.Week,
        "1P": fp,
        "DD": dd,
        "GH": gh,
        "UB": ub,
        // Store the raw values for tooltips
        "1P_raw": firstPartyValue,
        "DD_raw": ddValue,
        "GH_raw": ghValue,
        "UB_raw": ubValue,
        "In-House_raw": inHouseValue
      };
    });

    // Second pass: calculate trend lines
    // We'll create a moving average for each category
    
    // We'll use a simple 3-point moving average if we have enough data points
    const windowSize = Math.min(3, data.length);
    
    // Calculate moving averages for each series
    if (data.length >= windowSize) {
      for (let i = 0; i < data.length; i++) {
        // Get values for the window (windowSize points centered on current point)
        const startIdx = Math.max(0, i - Math.floor(windowSize / 2));
        const endIdx = Math.min(data.length - 1, i + Math.floor(windowSize / 2));
        
        let fpSum = 0, ddSum = 0, ghSum = 0, ubSum = 0;
        let count = 0;
        
        for (let j = startIdx; j <= endIdx; j++) {
          fpSum += data[j]["1P"];
          ddSum += data[j]["DD"];
          ghSum += data[j]["GH"];
          ubSum += data[j]["UB"];
          count++;
        }
        
        // Add trend lines data
        data[i]["1P_trend"] = parseFloat((fpSum / count).toFixed(2));
        data[i]["DD_trend"] = parseFloat((ddSum / count).toFixed(2));
        data[i]["GH_trend"] = parseFloat((ghSum / count).toFixed(2));
        data[i]["UB_trend"] = parseFloat((ubSum / count).toFixed(2));
      }
    } else {
      // Not enough data for a moving average, just use the values as is
      data.forEach(item => {
        item["1P_trend"] = item["1P"];
        item["DD_trend"] = item["DD"];
        item["GH_trend"] = item["GH"];
        item["UB_trend"] = item["UB"];
      });
    }
    
    return data;
  };

  // Custom tooltip to show both percentage and actual value
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Filter out trend lines from tooltip, we only want to show bar values
      const filteredPayload = payload.filter((entry: any) => 
        !entry.dataKey.includes('_trend')
      );
      
      return (
        <div style={{ 
          backgroundColor: '#fff', 
          padding: '10px', 
          border: '1px solid #ccc',
          borderRadius: '5px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold', marginBottom: '5px' }}>Week {label}</p>
          {filteredPayload.map((entry: any, index: number) => (
            <p key={`tooltip-${index}`} style={{ margin: 0, color: entry.color }}>
              {entry.name}: {entry.value.toFixed(2)}% 
              {entry.payload[`${entry.name}_raw`] !== undefined && 
                ` ($${entry.payload[`${entry.name}_raw`].toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })})`
              }
            </p>
          ))}
          {filteredPayload[0]?.payload["In-House_raw"] !== undefined && (
            <p style={{ margin: '5px 0 0 0', color: '#555', borderTop: '1px solid #eee', paddingTop: '5px' }}>
              In-House: ${filteredPayload[0].payload["In-House_raw"].toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Function to format Y-axis labels
  const formatYAxis = (value: number) => {
    return `${value.toFixed(1)}`;
  };

  // If no data is available
  if (!chartData || chartData.length === 0) {
    return (
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6">Delivery Percentages</Typography>
          <Typography color="text.secondary">
            No data available. Please upload an Excel file with valid delivery data.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Calculate the maximum percentage value for Y-axis scale
  const maxPercentage = Math.max(
    ...chartData.map(item => Math.max(
      item['1P'] || 0, 
      item['DD'] || 0, 
      item['GH'] || 0, 
      item['UB'] || 0
    ))
  );
  // Round up to nearest 5% for better readability
  const yAxisMax = Math.ceil((maxPercentage + 2) / 5) * 5;

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          1P, DD, GH and UB (Percentage of In-House)
        </Typography>
        
        <Box sx={{ width: '100%', height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis 
                tickFormatter={formatYAxis} 
                domain={[0, yAxisMax || 20]} 
                label={{ 
                  value: 'Percentage of In-House', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' }
                }} 
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* Bar charts first */}
              <Bar dataKey="1P" fill="#8884d8" name="1P" />
              <Bar dataKey="DD" fill="#FF4B4B" name="DD" />
              <Bar dataKey="GH" fill="#FFA500" name="GH" />
              <Bar dataKey="UB" fill="#000000" name="UB" />
              
              {/* Trend lines on top */}
              <Line 
                type="monotone" 
                dataKey="1P_trend" 
                stroke="#8884d8" 
                strokeWidth={2} 
                dot={false} 
                activeDot={false}
                legendType="none"
              />
              <Line 
                type="monotone" 
                dataKey="DD_trend" 
                stroke="#FF4B4B" 
                strokeWidth={2} 
                dot={false} 
                activeDot={false}
                legendType="none"
              />
              <Line 
                type="monotone" 
                dataKey="GH_trend" 
                stroke="#FFA500" 
                strokeWidth={2} 
                dot={false} 
                activeDot={false}
                legendType="none"
              />
              <Line 
                type="monotone" 
                dataKey="UB_trend" 
                stroke="#000000" 
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

export default DeliveryPercentageChart;
// SalesVisualizations.js
import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';

// Sample data based on the images provided
const sampleData = {
  weeks: Array.from({ length: 18 }, (_, i) => i + 1),
  
  // First chart data (1P, DD, GH, UB)
  chart1: {
    '1P': [7.04, 7.57, 8.79, 7.07, 6.10, 7.23, 5.30, 15.09, 7.43, 5.03, 6.80, 5.11, 7.18, 7.95, 9.46, 7.17, 4.00, 9.53],
    'DD': [2.01, 1.07, 1.43, 2.92, 1.69, 0.83, 1.04, 2.57, 2.37, 2.01, 1.55, 1.63, 2.50, 1.73, 1.04, 3.04, 0.71, 1.30],
    'GH': [5.04, 7.98, 6.66, 7.66, 4.43, 7.48, 9.32, 6.47, 3.32, 4.75, 4.29, 3.30, 4.83, 10.15, 3.85, 3.47, 4.57, 3.13],
    'UB': [2.48, 3.19, 2.51, 2.60, 2.23, 3.49, 1.79, 3.04, 4.48, 4.75, 3.30, 4.83, 3.04, 4.30, 3.85, 4.57, 4.46, 3.13]
  },
  
  // Second chart data (In-House)
  chart2: {
    'In-House': [58.35, 56.94, 47.10, 47.15, 42.45, 48.64, 49.67, 60.69, 47.08, 54.32, 47.27, 48.74, 49.63, 54.70, 46.23, 54.93, 40.77, 35.43]
  },
  
  // Full table data matching the second image
  tableData: [
    { Week: 1, Catering: "$3,862.90", DD: "$920.10", GH: "$776.01", "In-House": "$9,982.34", UB: "$542.00", "Grand Total": "$16,083.35", "1P": 7.04, "In-House%": 58.35, "Catering%": 38.7, "DD%": 2.01, "GH%": 5.04, "UB%": 2.48 },
    { Week: 2, Catering: "$6,620.91", DD: "$305.84", GH: "$2,272.54", "In-House": "$16,215.89", UB: "$907.55", "Grand Total": "$28,479.62", "1P": 99.04, "In-House%": 56.94, "Catering%": 23.25, "DD%": 1.07, "GH%": 7.98, "UB%": 3.19 },
    { Week: 3, Catering: "$12,213.61", DD: "$529.24", GH: "$2,349.54", "In-House": "$17,261.96", UB: "$921.94", "Grand Total": "$39,662.12", "1P": 49.54, "In-House%": 47.10, "Catering%": 33.10, "DD%": 1.43, "GH%": 6.66, "UB%": 2.51 },
    { Week: 4, Catering: "$10,161.99", DD: "$882.81", GH: "$2,318.65", "In-House": "$14,270.70", UB: "$788.15", "Grand Total": "$30,268.94", "1P": 42.75, "In-House%": 47.15, "Catering%": 33.57, "DD%": 2.92, "GH%": 7.66, "UB%": 2.60 },
    { Week: 5, Catering: "$16,170.00", DD: "$657.86", GH: "$2,818.18", "In-House": "$16,548.96", UB: "$897.98", "Grand Total": "$38,988.55", "1P": -8.56, "In-House%": 42.45, "Catering%": 41.99, "DD%": 1.69, "GH%": 4.43, "UB%": 2.23 },
    { Week: 6, Catering: "$12,193.91", DD: "$302.89", GH: "$2,767.02", "In-House": "$17,993.78", UB: "$1,264.80", "Grand Total": "$36,997.90", "1P": 41.71, "In-House%": 48.64, "Catering%": 32.96, "DD%": 0.83, "GH%": 7.48, "UB%": 3.49 },
    { Week: 7, Catering: "$11,896.56", DD: "$374.71", GH: "$3,369.88", "In-House": "$17,962.92", UB: "$547.16", "Grand Total": "$36,168.44", "1P": 21.66, "In-House%": 49.67, "Catering%": 32.89, "DD%": 1.04, "GH%": 9.32, "UB%": 1.79 },
    { Week: 8, Catering: "$5,782.04", DD: "$680.14", GH: "$1,713.01", "In-House": "$16,077.08", UB: "$805.35", "Grand Total": "$26,490.79", "1P": -25.18, "In-House%": 60.69, "Catering%": 21.83, "DD%": 2.57, "GH%": 6.47, "UB%": 3.04 },
    { Week: 9, Catering: "$10,447.77", DD: "$947.17", GH: "$1,756.82", "In-House": "$19,805.20", UB: "$924.77", "Grand Total": "$39,940.98", "1P": 320.67, "In-House%": 47.08, "Catering%": 25.05, "DD%": 2.37, "GH%": 3.32, "UB%": 4.48 },
    { Week: 10, Catering: "$8,236.15", DD: "$690.61", GH: "$2,583.12", "In-House": "$18,664.21", UB: "$1,030.29", "Grand Total": "$34,357.37", "1P": -57.65, "In-House%": 54.32, "Catering%": 23.97, "DD%": 2.01, "GH%": 4.75, "UB%": 4.75 },
    { Week: 11, Catering: "$14,133.91", DD: "$519.90", GH: "$2,828.98", "In-House": "$19,824.91", UB: "$1,717.28", "Grand Total": "$49,037.19", "1P": -21.14, "In-House%": 47.27, "Catering%": 35.30, "DD%": 1.55, "GH%": 6.57, "UB%": 3.30 },
    { Week: 12, Catering: "$12,448.16", DD: "$596.65", GH: "$2,453.14", "In-House": "$17,879.45", UB: "$1,210.37", "Grand Total": "$36,861.54", "1P": -0.31, "In-House%": 48.74, "Catering%": 33.99, "DD%": 1.63, "GH%": 6.80, "UB%": 3.30 },
    { Week: 13, Catering: "$11,303.91", DD: "$919.80", GH: "$2,639.77", "In-House": "$18,245.43", UB: "$1,776.52", "Grand Total": "$36,762.65", "1P": -6.42, "In-House%": 49.63, "Catering%": 30.75, "DD%": 2.50, "GH%": 7.18, "UB%": 4.83 },
    { Week: 14, Catering: "$7,564.37", DD: "$629.38", GH: "$3,669.55", "In-House": "$19,730.30", UB: "$1,556.17", "Grand Total": "$36,443.19", "1P": 53.13, "In-House%": 54.70, "Catering%": 21.17, "DD%": 1.73, "GH%": 10.15, "UB%": 4.30 },
    { Week: 15, Catering: "$12,066.20", DD: "$421.60", GH: "$3,880.70", "In-House": "$18,703.13", UB: "$1,559.54", "Grand Total": "$40,460.13", "1P": 33.13, "In-House%": 46.23, "Catering%": 29.82, "DD%": 1.04, "GH%": 9.59, "UB%": 3.85 },
    { Week: 16, Catering: "$7,189.67", DD: "$1,106.89", GH: "$2,346.87", "In-House": "$17,942.19", UB: "$1,458.56", "Grand Total": "$31,935.49", "1P": -40.21, "In-House%": 54.93, "Catering%": 22.51, "DD%": 3.47, "GH%": 7.35, "UB%": 4.57 },
    { Week: 17, Catering: "$27,799.66", DD: "$327.33", GH: "$1,772.06", "In-House": "$18,664.44", UB: "$2,065.63", "Grand Total": "$64,288.13", "1P": 35.47, "In-House%": 40.77, "Catering%": 47.03, "DD%": 0.71, "GH%": 3.83, "UB%": 4.46 },
    { Week: 18, Catering: "$28,484.68", DD: "$732.52", GH: "$2,055.86", "In-House": "$19,897.12", UB: "$1,756.81", "Grand Total": "$56,154.28", "1P": 52.17, "In-House%": 35.43, "Catering%": 52.47, "DD%": 1.30, "GH%": 3.66, "UB%": 3.13 }
  ]
};

export function SalesVisualizations({ tableData = null }) {
  // Use provided data or sample data
  const data = tableData || sampleData;
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  // Track window resize for responsive charts
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Determine if we should stack charts vertically or horizontally based on window width
  const isVerticalLayout = windowWidth < 1200;

  // Create the first chart - 1P, DD, GH, UB (bar/line combo)
  const createDeliveryChart = () => {
    const weeks = data.weeks;
    const chart1Data = data.chart1;
    
    // Create traces for each series
    const traces = [
      // 1P (Light pink bars)
      {
        x: weeks,
        y: chart1Data['1P'],
        type: 'bar',
        name: '1P',
        marker: {
          color: 'rgba(221, 182, 208, 0.8)'
        },
      },
      // DD (Red bars)
      {
        x: weeks,
        y: chart1Data['DD'],
        type: 'bar',
        name: 'DD',
        marker: {
          color: 'rgba(227, 74, 51, 0.8)'
        },
      },
      // GH (Orange bars)
      {
        x: weeks,
        y: chart1Data['GH'],
        type: 'bar',
        name: 'GH',
        marker: {
          color: 'rgba(255, 165, 0, 0.8)'
        },
      },
      // UB (Dark gray bars)
      {
        x: weeks,
        y: chart1Data['UB'],
        type: 'bar',
        name: 'UB',
        marker: {
          color: 'rgba(100, 100, 100, 0.8)'
        },
      }
    ];
    
    // Create layout
    const layout = {
      title: '1P, DD, GH and UB',
      barmode: 'group',
      bargap: 0.15,
      bargroupgap: 0.1,
      margin: { l: 50, r: 30, t: 50, b: 50 },
      xaxis: {
        title: 'Week',
        tickmode: 'linear',
        dtick: 1
      },
      yaxis: {
        title: 'Percentage (%)',
        ticksuffix: '%',
        range: [0, 21]  // Set max to 21% to match the image
      },
      legend: {
        orientation: 'h',
        y: 1.1
      },
      height: 350,
      grid: {
        ygap: 0.1
      }
    };
    
    return { data: traces, layout };
  };
  
  // Create the second chart - In-House percentages (bar chart)
  const createInHouseChart = () => {
    const weeks = data.weeks;
    const chart2Data = data.chart2;
    
    // Create bar chart for In-House
    const traces = [
      {
        x: weeks,
        y: chart2Data['In-House'],
        type: 'bar',
        name: 'In-House',
        marker: {
          color: 'rgba(144, 238, 144, 0.7)'  // Light green
        },
        width: 0.8
      }
    ];
    
    // Create layout
    const layout = {
      title: 'In-House',
      margin: { l: 50, r: 30, t: 50, b: 50 },
      xaxis: {
        title: 'Week',
        tickmode: 'linear',
        dtick: 1
      },
      yaxis: {
        title: 'Percentage (%)',
        ticksuffix: '%',
        range: [0, 81]  // Set max to 81% to match the image
      },
      height: 350
    };
    
    return { data: traces, layout };
  };
  
  // Get chart configurations
  const deliveryChart = createDeliveryChart();
  const inHouseChart = createInHouseChart();
  
  return (
    <Box sx={{ width: '100%', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Sales Performance Visualizations
      </Typography>
      
      <Grid container spacing={3} direction={isVerticalLayout ? 'column' : 'row'}>
        <Grid item xs={12} md={isVerticalLayout ? 12 : 12}>
          <Card sx={{ p: 2, boxShadow: 3 }}>
            <Plot
              data={deliveryChart.data}
              layout={deliveryChart.layout}
              config={{ responsive: true }}
              style={{ width: '100%' }}
            />
          </Card>
        </Grid>
        
        <Grid item xs={12} md={isVerticalLayout ? 12 : 12}>
          <Card sx={{ p: 2, boxShadow: 3 }}>
            <Plot
              data={inHouseChart.data}
              layout={inHouseChart.layout}
              config={{ responsive: true }}
              style={{ width: '100%' }}
            />
          </Card>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Combined Visualization
        </Typography>
        <Card sx={{ p: 2, boxShadow: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Comprehensive Sales Trend Analysis
          </Typography>
          <Plot
            data={[...deliveryChart.data, ...inHouseChart.data]}
            layout={{
              title: 'Combined Sales Performance Metrics',
              grid: { rows: 2, columns: 1, pattern: 'independent' },
              margin: { l: 50, r: 30, t: 50, b: 50 },
              yaxis: {
                title: 'Percentage (%)',
                ticksuffix: '%',
                domain: [0.55, 1],
                range: [0, 21]
              },
              yaxis2: {
                title: 'In-House (%)',
                ticksuffix: '%',
                domain: [0, 0.45],
                range: [0, 81]
              },
              xaxis: {
                domain: [0, 1],
                tickmode: 'linear',
                dtick: 1
              },
              xaxis2: {
                tickmode: 'linear',
                dtick: 1,
                anchor: 'y2'
              },
              height: 700,
              legend: {
                orientation: 'h',
                y: 1.05
              }
            }}
            config={{ responsive: true }}
            style={{ width: '100%' }}
          />
        </Card>
      </Box>
    </Box>
  );
}

// Additional component for displaying data in a tabular format
export function SalesDataTable({ tableData = null }) {
  // Use provided data or sample data
  const data = tableData?.tableData || sampleData.tableData;
  
  return (
    <Box sx={{ mt: 4, overflow: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Sales Data Table
      </Typography>
      <Card sx={{ boxShadow: 3 }}>
        <Box sx={{ overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1200px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={{ padding: '12px 8px', border: '1px solid #ddd', textAlign: 'center' }}>Week</th>
                <th style={{ padding: '12px 8px', border: '1px solid #ddd', textAlign: 'center' }}>Catering</th>
                <th style={{ padding: '12px 8px', border: '1px solid #ddd', textAlign: 'center' }}>DD</th>
                <th style={{ padding: '12px 8px', border: '1px solid #ddd', textAlign: 'center' }}>GH</th>
                <th style={{ padding: '12px 8px', border: '1px solid #ddd', textAlign: 'center' }}>In-House</th>
                <th style={{ padding: '12px 8px', border: '1px solid #ddd', textAlign: 'center' }}>UB</th>
                <th style={{ padding: '12px 8px', border: '1px solid #ddd', textAlign: 'center' }}>Grand Total</th>
                <th style={{ padding: '12px 8px', border: '1px solid #ddd', textAlign: 'center' }}>1P %</th>
                <th style={{ padding: '12px 8px', border: '1px solid #ddd', textAlign: 'center' }}>In-House %</th>
                <th style={{ padding: '12px 8px', border: '1px solid #ddd', textAlign: 'center' }}>Catering %</th>
                <th style={{ padding: '12px 8px', border: '1px solid #ddd', textAlign: 'center' }}>DD %</th>
                <th style={{ padding: '12px 8px', border: '1px solid #ddd', textAlign: 'center' }}>GH %</th>
                <th style={{ padding: '12px 8px', border: '1px solid #ddd', textAlign: 'center' }}>UB %</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                  <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>{row.Week}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>{row.Catering}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>{row.DD}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>{row.GH}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>{row["In-House"]}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>{row.UB}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>{row["Grand Total"]}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>{row["1P"].toFixed(2)}%</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>{row["In-House%"]?.toFixed(2)}%</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>{row["Catering%"]?.toFixed(2)}%</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>{row["DD%"]?.toFixed(2)}%</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>{row["GH%"]?.toFixed(2)}%</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>{row["UB%"]?.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </Card>
    </Box>
  );
}

// Main component that combines visualizations
export function SalesAnalyticsDashboard({ tableData = null }) {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
        Sales Analytics Dashboard
      </Typography>
      <Divider sx={{ mb: 4 }} />
      
      <SalesVisualizations tableData={tableData} />
      <SalesDataTable tableData={tableData} />
    </Box>
  );
}

// Usage:
// <SalesAnalyticsDashboard tableData={yourData} />
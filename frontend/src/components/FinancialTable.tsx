// src/components/FinancialTable.tsx - Updated with real data integration

import React from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

interface FinancialTableProps {
  data?: any[]; // table5 data from backend
}

const FinancialTable: React.FC<FinancialTableProps> = ({ data = [] }) => {
  // Helper function to categorize metrics
  const categorizeMetrics = (metrics: any[]) => {
    const categories = {
      sales: [],
      labor: [],
      foodCost: []
    };

    metrics.forEach(row => {
      const metric = row.Metric || row.metric || '';
      const metricLower = metric.toLowerCase();
      
      if (['net sales', 'orders', 'avg ticket'].some(term => metricLower.includes(term))) {
        categories.sales.push(row);
      } else if (['lbr', 'labor', 'spmh', 'lpmh'].some(term => metricLower.includes(term))) {
        categories.labor.push(row);
      } else if (['johns', 'terra', 'metro', 'victory', 'central kitchen', 'other', 'ttl', 'food cost', 'prime cost'].some(term => metricLower.includes(term))) {
        categories.foodCost.push(row);
      }
    });

    return categories;
  };

  // Helper function to format percentage with color
  const formatPercentageWithColor = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    const isPositive = numValue >= 0;
    const color = isPositive ? '#2e7d32' : '#d32f2f'; // Green for positive, red for negative
    const arrow = isPositive ? '▲' : '▼';
    
    return {
      color,
      arrow,
      value: `${isPositive ? '+' : ''}${numValue.toFixed(2)}%`,
      isPositive
    };
  };

  // Helper function to format currency
  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numValue);
  };

  // Helper function to format values based on metric type
  const formatValue = (value: string | number, metricName: string) => {
    if (!value && value !== 0) return '$0.00';
    
    const metricLower = metricName.toLowerCase();
    
    if (metricLower.includes('%') || metricLower === 'lbr %' || metricLower === 'food cost %' || metricLower === 'prime cost %') {
      return `${parseFloat(value.toString()).toFixed(2)}%`;
    } else if (metricLower.includes('sales') || metricLower.includes('pay') || metricLower.includes('spmh') || metricLower.includes('lpmh') || metricLower.includes('avg ticket') || metricLower.includes('cost') || metricLower.includes('johns') || metricLower.includes('terra') || metricLower.includes('metro') || metricLower.includes('victory') || metricLower.includes('central') || metricLower.includes('other') || metricLower.includes('ttl') || metricLower.includes('prime')) {
      return formatCurrency(value);
    } else if (metricLower.includes('orders') || metricLower.includes('hrs')) {
      return parseInt(value.toString()).toLocaleString();
    } else {
      return value.toString();
    }
  };

  // If no data provided, show placeholder
  if (!data || data.length === 0) {
    return (
      <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden', width: '100%', p: 4 }}>
        <Typography variant="h6" sx={{ textAlign: 'center', color: 'text.secondary' }}>
          No financial data available
        </Typography>
        <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', mt: 1 }}>
          Upload financial files to see detailed metrics
        </Typography>
      </Paper>
    );
  }

  // Categorize the metrics
  const categorizedMetrics = categorizeMetrics(data);
  
  // Calculate row heights dynamically
  const salesRows = Math.max(categorizedMetrics.sales.length, 5);
  const laborRows = Math.max(categorizedMetrics.labor.length, 5);
  const foodRows = Math.max(categorizedMetrics.foodCost.length, 10);
  const rowHeight = 45;
  
  const salesHeight = salesRows * rowHeight;
  const laborHeight = laborRows * rowHeight;
  const foodHeight = foodRows * rowHeight;

  // Render a table row for a metric
  const renderMetricRow = (metric: any, index: number) => {
    const metricName = metric.Metric || metric.metric || 'Unknown';
    const thisWeek = metric['This Week'] || metric.thisWeek || '0';
    const lastWeek = metric['Last Week'] || metric.lastWeek || '0';
    const twLwChange = formatPercentageWithColor(metric['Tw/Lw (+/-)'] || metric.twLwChange || '0');
    const budget = metric.Budget || metric.budget || '0';
    const twBdgChange = formatPercentageWithColor(metric['Tw/Bdg (+/-)'] || metric.twBdgChange || '0');

    return (
      <TableRow 
        key={index}
        sx={{ 
          height: `${rowHeight}px`,
          borderBottom: '1px solid #e0e0e0',
          backgroundColor: index % 2 === 0 ? '#fafafa' : '#ffffff',
          '&:hover': {
            backgroundColor: '#f5f5f5'
          }
        }}
      >
        {/* This Week Label */}
        <TableCell 
          align="center"
          sx={{ 
            borderRight: '1px solid #e0e0e0',
            padding: '4px 8px',
            width: '15%',
            fontSize: '14px',
            fontWeight: 400
          }}
        >
          {metricName}
        </TableCell>

        {/* This Week Value */}
        <TableCell 
          align="center"
          sx={{ 
            borderRight: '1px solid #e0e0e0',
            padding: '4px 8px',
            width: '15%',
            fontSize: '14px',
            fontWeight: 400
          }}
        >
          {formatValue(thisWeek, metricName)}
        </TableCell>
        
        {/* Last Week Label */}
        <TableCell 
          align="center"
          sx={{ 
            borderRight: '1px solid #e0e0e0',
            padding: '4px 8px',
            width: '15%',
            fontSize: '14px',
            fontWeight: 400
          }}
        >
          {metricName}
        </TableCell>

        {/* Last Week Value */}
        <TableCell 
          align="center"
          sx={{ 
            borderRight: '1px solid #e0e0e0',
            padding: '4px 8px',
            width: '15%',
            fontSize: '14px',
            fontWeight: 400
          }}
        >
          {formatValue(lastWeek, metricName)}
        </TableCell>
        
        {/* TW/LW Change */}
        <TableCell 
          align="center"
          sx={{ 
            borderRight: '1px solid #e0e0e0',
            padding: '4px 8px',
            fontSize: '14px',
            fontWeight: 400
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 0.5
          }}>
            <span style={{ 
              color: twLwChange.color, 
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              {twLwChange.arrow}
            </span>
            <Typography sx={{ 
              color: twLwChange.color,
              fontSize: '14px',
              fontWeight: 400
            }}>
              {twLwChange.value}
            </Typography>
          </Box>
        </TableCell>
        
        {/* Budget Label */}
        <TableCell 
          align="center"
          sx={{ 
            borderRight: '1px solid #e0e0e0',
            padding: '4px 8px',
            width: '10%',
            fontSize: '13px',
            fontWeight: 400
          }}
        >
          {metricName}
        </TableCell>

        {/* Budget Value */}
        <TableCell 
          align="center"
          sx={{ 
            borderRight: '1px solid #e0e0e0',
            padding: '4px 8px',
            width: '10%',
            fontSize: '14px',
            fontWeight: 400
          }}
        >
          {formatValue(budget, metricName)}
        </TableCell>
        
        {/* TW/Budget Change */}
        <TableCell 
          align="center"
          sx={{ 
            padding: '4px 8px',
            fontSize: '14px',
            fontWeight: 400
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 0.5
          }}>
            <Typography sx={{ 
              color: twBdgChange.color,
              fontSize: '14px',
              fontWeight: 400
            }}>
              {twBdgChange.value}
            </Typography>
            <span style={{ 
              color: twBdgChange.color, 
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              {twBdgChange.arrow}
            </span>
          </Box>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden', width: '100%' }}>
      <Box sx={{ display: 'flex', width: '100%', backgroundColor: '#ffffff' }}>
        {/* Side Labels */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          width: '40px',
          flexShrink: 0,
          borderRight: '1px solid #e0e0e0',
        }}>
          {/* SALES label */}
          <Box sx={{ 
            height: `${salesHeight}px`,
            backgroundColor: '#f5f5f5',
            color: 'black',
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '14px',
            letterSpacing: '1px',
            borderBottom: '1px solid #e0e0e0'
          }}>
            SALES
          </Box>
          
          {/* LABOR COST label */}
          <Box sx={{ 
            height: `${laborHeight}px`,
            backgroundColor: '#f5f5f5',
            color: 'black',
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '14px',
            letterSpacing: '1px',
            borderBottom: '1px solid #e0e0e0'
          }}>
            LABOR COST
          </Box>
          
          {/* FOOD COST label */}
          <Box sx={{ 
            height: `${foodHeight}px`,
            backgroundColor: '#f5f5f5',
            color: 'black',
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '14px',
            letterSpacing: '1px'
          }}>
            FOOD COST
          </Box>
        </Box>
        
        {/* Main Table */}
        <TableContainer sx={{ flexGrow: 1, overflowX: 'auto' }}>
          <Table size="small" sx={{ tableLayout: 'fixed', minWidth: '800px' }}>
            <TableHead>
              <TableRow>
                <TableCell 
                  colSpan={2}
                  align="center"
                  sx={{ 
                    backgroundColor: '#0000ee', 
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '16px',
                    width: '30%',
                    border: '1px solid #e0e0e0',
                    padding: '10px 8px'
                  }}
                >
                  This Weeks Trend
                </TableCell>
                <TableCell 
                  colSpan={2}
                  align="center"
                  sx={{ 
                    backgroundColor: '#fff8dc',
                    fontWeight: 600,
                    fontSize: '16px',
                    width: '30%',
                    border: '1px solid #e0e0e0',
                    padding: '10px 8px'
                  }}
                >
                  Last Weeks Trend
                </TableCell>
                <TableCell 
                  align="center"
                  sx={{ 
                    backgroundColor: '#ff6d00', 
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '16px',
                    width: '10%',
                    border: '1px solid #e0e0e0',
                    padding: '10px 8px'
                  }}
                >
                  TW/LW (+/-)
                </TableCell>
                <TableCell 
                  colSpan={2}
                  align="center"
                  sx={{ 
                    backgroundColor: '#000000', 
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '16px',
                    width: '20%',
                    border: '1px solid #e0e0e0',
                    padding: '10px 8px'
                  }}
                >
                  This Weeks Budget
                </TableCell>
                <TableCell 
                  align="center"
                  sx={{ 
                    backgroundColor: '#ff6d00', 
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '16px',
                    width: '10%',
                    border: '1px solid #e0e0e0',
                    padding: '10px 8px'
                  }}
                >
                  TW/Bdg (+/-)
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Render Sales metrics */}
              {categorizedMetrics.sales.map((metric, index) => renderMetricRow(metric, index))}
              
              {/* Render Labor metrics */}
              {categorizedMetrics.labor.map((metric, index) => renderMetricRow(metric, index + 100))}
              
              {/* Render Food Cost metrics */}
              {categorizedMetrics.foodCost.map((metric, index) => renderMetricRow(metric, index + 200))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Paper>
  );
};

export default FinancialTable;
import React from 'react';

// Interface for the comprehensive financial data structure
interface FinancialDashboardProps {
  financialData: {
    table1?: Array<{
      financials_avg_ticket?: number;
      financials_food_cost?: number;
      financials_labor_cost?: number;
      financials_lmph?: number;
      financials_prime_cost?: number;
      financials_sales?: number;
      financials_spmh?: number;
    }>;
    table6?: any[]; // Sales data
    table7?: any[]; // Labor cost data
    table8?: any[]; // Average ticket data
    table9?: any[]; // Prime cost data
    table10?: any[]; // Food cost data
    table11?: any[]; // SPMH data
    table12?: any[]; // LPMH data
    table13?: any[]; // Weekly sales by day
    table14?: any[]; // Orders by day
    table15?: any[]; // Average ticket by day
    table16?: any[]; // KPI vs Budget
    [key: string]: any;
  };
}

// Debug component to check table1 data
const DebugDataDisplay = ({ table1Data }: { table1Data: any }) => {
  return (
    <div style={{
      background: '#fee2e2',
      border: '1px solid #fecaca',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '16px',
      fontSize: '12px',
      fontFamily: 'monospace'
    }}>
      <strong>DEBUG - Table1 Data:</strong>
      <pre>{JSON.stringify(table1Data, null, 2)}</pre>
    </div>
  );
};

// Utility function to format change values with modern styling
const formatChange = (value: string) => {
  const numValue = parseFloat(value.replace('%', ''));
  const isPositive = numValue >= 0;
  return {
    value: value,
    color: isPositive ? '#059669' : '#dc2626',
    arrow: isPositive ? '▲' : '▼'
  };
};

// Modern Line Chart Component with real data
const ModernLineChart = ({ data, title, height = 300, dataKeys = ['This Week', 'Last Week', 'Last Year'] }: any) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ 
        padding: '32px', 
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', 
        borderRadius: '24px', 
        boxShadow: '0 20px 40px rgba(0,0,0,0.08), 0 8px 25px rgba(0,0,0,0.04)',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: height,
        width: '100%'
      }}>
        <span style={{ color: '#64748b', fontSize: '16px', fontWeight: '500' }}>No data available for {title}</span>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d: any) => Math.max(...dataKeys.map(key => d[key] || 0))));
  const minValue = Math.min(...data.map((d: any) => Math.min(...dataKeys.map(key => d[key] || 0))));
  const range = maxValue - minValue || 1;
  
  const getY = (value: number) => {
    return height - 80 - ((value - minValue) / range) * (height - 140);
  };
  
  const getX = (index: number) => {
    return 100 + (index * (400 / (data.length - 1)));
  };

  const colors = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444'];
  const labels = ['This Week', 'Last Week', 'Last Year', 'L4wt', 'Budget'];

  return (
    <div style={{ 
      padding: '32px', 
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', 
      borderRadius: '24px', 
      boxShadow: '0 20px 40px rgba(0,0,0,0.08), 0 8px 25px rgba(0,0,0,0.04)',
      border: '1px solid #e2e8f0',
      width: '100%',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      <h3 style={{ 
        margin: '0 0 28px 0', 
        fontSize: '24px', 
        fontWeight: '700', 
        color: '#1e293b',
        letterSpacing: '-0.01em'
      }}>
        {title}
      </h3>
      <div style={{ overflow: 'auto', width: '100%' }}>
        <svg width="100%" height={height} viewBox="0 0 600 300" style={{ overflow: 'visible', minWidth: '500px' }}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <line
              key={i}
              x1="100"
              y1={70 + ratio * (height - 140)}
              x2="500"
              y2={70 + ratio * (height - 140)}
              stroke="#f1f5f9"
              strokeWidth="1"
            />
          ))}
          
          {/* Lines for each data key */}
          {dataKeys.map((key: string, keyIndex: number) => {
            if (keyIndex >= colors.length) return null;
            const strokeWidths = [4, 3, 3, 3, 3];
            
            return (
              <polyline
                key={key}
                fill="none"
                stroke={colors[keyIndex]}
                strokeWidth={strokeWidths[keyIndex] || 3}
                points={data.map((d: any, i: number) => `${getX(i)},${getY(d[key] || 0)}`).join(' ')}
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
              />
            );
          })}
          
          {/* Data points */}
          {data.map((d: any, i: number) => (
            <g key={i}>
              {dataKeys.map((key: string, keyIndex: number) => {
                if (keyIndex >= colors.length) return null;
                const radii = [6, 5, 5, 5, 5];
                
                return (
                  <circle 
                    key={key}
                    cx={getX(i)} 
                    cy={getY(d[key] || 0)} 
                    r={radii[keyIndex] || 5} 
                    fill={colors[keyIndex]} 
                    stroke="#ffffff"
                    strokeWidth="3"
                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}
                  />
                );
              })}
            </g>
          ))}
          
          {/* X-axis labels */}
          {data.map((d: any, i: number) => (
            <text
              key={i}
              x={getX(i)}
              y={height - 30}
              textAnchor="middle"
              fontSize="14"
              fill="#64748b"
              fontWeight="600"
            >
              {d.Day || d.day || d.label || i + 1}
            </text>
          ))}
          
          {/* Y-axis labels */}
          {[minValue, (minValue + maxValue) / 2, maxValue].map((value, i) => (
            <text
              key={i}
              x="90"
              y={getY(value) + 4}
              textAnchor="end"
              fontSize="14"
              fill="#64748b"
              fontWeight="600"
            >
              {value.toFixed(1)}
            </text>
          ))}
        </svg>
      </div>
      
      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '20px', flexWrap: 'wrap' }}>
        {dataKeys.map((key: string, index: number) => {
          if (index >= colors.length) return null;
          
          return (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ 
                width: '20px', 
                height: '4px', 
                background: colors[index], 
                borderRadius: '2px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}></div>
              <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>
                {labels[index] || key}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Modern Bar Chart Component with real data and full width
const ModernBarChart = ({ data, title, height = 300 }: any) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ 
        padding: '32px', 
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', 
        borderRadius: '24px', 
        boxShadow: '0 20px 40px rgba(0,0,0,0.08), 0 8px 25px rgba(0,0,0,0.04)',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: height,
        width: '100%'
      }}>
        <span style={{ color: '#64748b', fontSize: '16px', fontWeight: '500' }}>No data available for {title}</span>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d: any) => Math.max(d['This Week'] || 0, d['Last Week'] || 0, d['Last Year'] || 0)));
  const barWidth = 20;
  const groupWidth = 80;
  
  const getY = (value: number) => {
    return height - 80 - (value / maxValue) * (height - 140);
  };
  
  const getX = (index: number, barIndex: number) => {
    return 100 + (index * groupWidth) + (barIndex * (barWidth + 4));
  };

  const colors = ['#3b82f6', '#f59e0b', '#10b981'];

  return (
    <div style={{ 
      padding: '32px', 
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', 
      borderRadius: '24px', 
      boxShadow: '0 20px 40px rgba(0,0,0,0.08), 0 8px 25px rgba(0,0,0,0.04)',
      border: '1px solid #e2e8f0',
      width: '100%',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      <h3 style={{ 
        margin: '0 0 28px 0', 
        fontSize: '24px', 
        fontWeight: '700', 
        color: '#1e293b',
        letterSpacing: '-0.01em'
      }}>
        {title}
      </h3>
      <div style={{ overflow: 'auto', width: '100%' }}>
        <svg width="100%" height={height} viewBox="0 0 700 300" style={{ overflow: 'visible', minWidth: '600px' }}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <line
              key={i}
              x1="100"
              y1={70 + ratio * (height - 140)}
              x2="680"
              y2={70 + ratio * (height - 140)}
              stroke="#f1f5f9"
              strokeWidth="1"
            />
          ))}
          
          {/* Bars */}
          {data.map((d: any, i: number) => (
            <g key={i}>
              <rect
                x={getX(i, 0)}
                y={getY(d['This Week'] || 0)}
                width={barWidth}
                height={(d['This Week'] || 0) / maxValue * (height - 140)}
                fill={colors[0]}
                rx="6"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
              />
              <rect
                x={getX(i, 1)}
                y={getY(d['Last Week'] || 0)}
                width={barWidth}
                height={(d['Last Week'] || 0) / maxValue * (height - 140)}
                fill={colors[1]}
                rx="6"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
              />
              <rect
                x={getX(i, 2)}
                y={getY(d['Last Year'] || 0)}
                width={barWidth}
                height={(d['Last Year'] || 0) / maxValue * (height - 140)}
                fill={colors[2]}
                rx="6"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
              />
            </g>
          ))}
          
          {/* X-axis labels */}
          {data.map((d: any, i: number) => (
            <text
              key={i}
              x={getX(i, 1)}
              y={height - 30}
              textAnchor="middle"
              fontSize="12"
              fill="#64748b"
              fontWeight="600"
              transform={`rotate(-45, ${getX(i, 1)}, ${height - 30})`}
            >
              {d.Day}
            </text>
          ))}
          
          {/* Y-axis labels */}
          {[0, maxValue / 2, maxValue].map((value, i) => (
            <text
              key={i}
              x="90"
              y={getY(value) + 4}
              textAnchor="end"
              fontSize="14"
              fill="#64748b"
              fontWeight="600"
            >
              {value.toFixed(0)}
            </text>
          ))}
        </svg>
      </div>
      
      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '20px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '20px', height: '20px', background: colors[0], borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}></div>
          <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>This Week</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '20px', height: '20px', background: colors[1], borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}></div>
          <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>Last Week</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '20px', height: '20px', background: colors[2], borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}></div>
          <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>Last Year</span>
        </div>
      </div>
    </div>
  );
};

// Responsive Financial Data Table Component
const ResponsiveFinancialTable = ({ title, mainValue, data, columns, isCompact = false }: any) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ 
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', 
        borderRadius: '24px', 
        boxShadow: '0 20px 40px rgba(0,0,0,0.08), 0 8px 25px rgba(0,0,0,0.04)',
        border: '1px solid #e2e8f0',
        padding: '32px',
        textAlign: 'center'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>{title}</h3>
        <div style={{ 
          fontSize: '36px', 
          fontWeight: '800', 
          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '16px'
        }}>
          {mainValue}
        </div>
        <span style={{ color: '#64748b', fontSize: '16px' }}>No breakdown data available</span>
      </div>
    );
  }

  // For mobile, show fewer columns
  const priorityColumns = columns.slice(0, isCompact ? 4 : columns.length);

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', 
      borderRadius: '24px', 
      boxShadow: '0 20px 40px rgba(0,0,0,0.08), 0 8px 25px rgba(0,0,0,0.04)',
      border: '1px solid #e2e8f0',
      transition: 'all 0.3s ease',
      width: '100%',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      <div style={{ padding: '32px 28px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '28px', 
          flexWrap: 'wrap', 
          gap: '16px' 
        }}>
          <h3 style={{ 
            margin: 0, 
            fontSize: '26px', 
            fontWeight: '700', 
            color: '#1e293b',
            letterSpacing: '-0.01em'
          }}>
            {title}
          </h3>
          <div style={{ 
            fontSize: '36px', 
            fontWeight: '800', 
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {mainValue}
          </div>
        </div>
        
        <div style={{ 
          overflowX: 'auto', 
          borderRadius: '16px', 
          backgroundColor: '#f8fafc',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)'
        }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse', 
            fontSize: '14px', 
            minWidth: isCompact ? '400px' : '600px'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9' }}>
                <th style={{ 
                  padding: '20px 16px', 
                  textAlign: 'left', 
                  fontWeight: '700', 
                  fontSize: '13px', 
                  color: '#475569', 
                  borderRadius: '16px 0 0 0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Time Period
                </th>
                <th style={{ 
                  padding: '20px 16px', 
                  textAlign: 'left', 
                  fontWeight: '700', 
                  fontSize: '13px', 
                  color: '#475569',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  % Change
                </th>
                {priorityColumns.map((col: any, index: number) => (
                  <th key={index} style={{ 
                    padding: '20px 16px', 
                    textAlign: 'left', 
                    fontWeight: '700', 
                    fontSize: '13px', 
                    color: '#475569',
                    borderRadius: index === priorityColumns.length - 1 ? '0 16px 0 0' : '0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row: any, index: number) => (
                <tr key={index} style={{ 
                  backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc',
                  borderBottom: index === data.length - 1 ? 'none' : '1px solid #e2e8f0'
                }}>
                  <td style={{ 
                    padding: '16px', 
                    fontWeight: '700', 
                    color: '#334155',
                    fontSize: '15px'
                  }}>
                    {row['Time Period']}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ 
                        color: formatChange(row['% Change'] || '0%').color, 
                        fontSize: '14px',
                        fontWeight: '700'
                      }}>
                        {formatChange(row['% Change'] || '0%').arrow}
                      </span>
                      <span style={{ 
                        color: formatChange(row['% Change'] || '0%').color, 
                        fontWeight: '700',
                        fontSize: '15px'
                      }}>
                        {row['% Change']}
                      </span>
                    </div>
                  </td>
                  {priorityColumns.map((col: any, colIndex: number) => (
                    <td key={colIndex} style={{ 
                      padding: '16px', 
                      color: '#64748b',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}>
                      {row[col.key] || '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Compact metric cards for SPMH and LPMH
const MetricCard = ({ title, value, data }: any) => {
  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', 
      borderRadius: '24px', 
      boxShadow: '0 20px 40px rgba(0,0,0,0.08), 0 8px 25px rgba(0,0,0,0.04)',
      border: '1px solid #e2e8f0',
      width: '100%',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      <div style={{ padding: '28px 24px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '24px', 
          flexWrap: 'wrap', 
          gap: '12px' 
        }}>
          <h3 style={{ 
            margin: 0, 
            fontSize: '22px', 
            fontWeight: '700', 
            color: '#1e293b',
            letterSpacing: '-0.01em'
          }}>
            {title}
          </h3>
          <div style={{ 
            fontSize: '32px', 
            fontWeight: '800', 
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {value}
          </div>
        </div>
        
        {data && data.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', minWidth: '300px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9' }}>
                  <th style={{ 
                    padding: '16px 12px', 
                    textAlign: 'left', 
                    fontWeight: '700', 
                    fontSize: '12px', 
                    color: '#475569', 
                    borderRadius: '12px 0 0 12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Period
                  </th>
                  <th style={{ 
                    padding: '16px 12px', 
                    textAlign: 'left', 
                    fontWeight: '700', 
                    fontSize: '12px', 
                    color: '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    $ Change
                  </th>
                  <th style={{ 
                    padding: '16px 12px', 
                    textAlign: 'left', 
                    fontWeight: '700', 
                    fontSize: '12px', 
                    color: '#475569', 
                    borderRadius: '0 12px 12px 0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    % Change
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((row: any, index: number) => (
                  <tr key={index} style={{ 
                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc',
                    borderBottom: index === data.length - 1 ? 'none' : '1px solid #e2e8f0'
                  }}>
                    <td style={{ 
                      padding: '14px 12px', 
                      fontWeight: '700', 
                      color: '#334155',
                      fontSize: '14px'
                    }}>
                      {row['Time Period']}
                    </td>
                    <td style={{ 
                      padding: '14px 12px', 
                      color: '#64748b',
                      fontWeight: '600'
                    }}>
                      {row['$ Change']}
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ 
                          color: formatChange(row['% Change'] || '0%').color, 
                          fontSize: '12px',
                          fontWeight: '700'
                        }}>
                          {formatChange(row['% Change'] || '0%').arrow}
                        </span>
                        <span style={{ 
                          color: formatChange(row['% Change'] || '0%').color, 
                          fontWeight: '700'
                        }}>
                          {row['% Change']}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>
            No breakdown data available
          </div>
        )}
      </div>
    </div>
  );
};

const ComprehensiveFinancialDashboard: React.FC<FinancialDashboardProps> = ({ financialData }) => {
  console.log('🔍 ComprehensiveFinancialDashboard received data:', financialData);
  
  // Extract real data from table1 with better error handling
  const table1Data = financialData?.table1?.[0] || {};
  console.log('📊 Table1 extracted data:', table1Data);
  
  // Helper functions
  const formatCurrency = (value: number): string => {
    if (isNaN(value) || value === null || value === undefined) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value: number): string => {
    if (isNaN(value) || value === null || value === undefined) return '0.0%';
    return `${value.toFixed(1)}%`;
  };

  const formatDollar = (value: number): string => {
    if (isNaN(value) || value === null || value === undefined) return '$0.00';
    return `$${value.toFixed(2)}`;
  };

  // Extract real data from tables
  const salesData = financialData?.table6 || [];
  const laborCostData = financialData?.table7 || [];
  const avgTicketData = financialData?.table8 || [];
  const primeCostData = financialData?.table9 || [];
  const foodCostData = financialData?.table10 || [];
  const spmhData = financialData?.table11 || [];
  const lpmhData = financialData?.table12 || [];
  const weeklySalesData = financialData?.table13 || [];
  const ordersByDayData = financialData?.table14 || [];
  const avgTicketByDayData = financialData?.table15 || []; // Added this for average ticket graph
  const kpiData = financialData?.table16 || [];

  // Main values from table1 (dynamic) - with fallbacks
  const mainSalesValue = formatCurrency(table1Data.financials_sales || 0);
  const mainLaborCostValue = formatPercentage(table1Data.financials_labor_cost || 0);
  const mainAvgTicketValue = formatDollar(table1Data.financials_avg_ticket || 0);
  const mainPrimeCostValue = formatPercentage(table1Data.financials_prime_cost || 0);
  const mainFoodCostValue = formatPercentage(table1Data.financials_food_cost || 0);
  const mainSpmhValue = formatDollar(table1Data.financials_spmh || 0);
  const mainLpmhValue = formatDollar(table1Data.financials_lmph || 0);

  console.log('💰 Formatted main values:', {
    sales: mainSalesValue,
    laborCost: mainLaborCostValue,
    avgTicket: mainAvgTicketValue,
    primeCost: mainPrimeCostValue,
    foodCost: mainFoodCostValue,
    spmh: mainSpmhValue,
    lpmh: mainLpmhValue
  });

  // Column definitions for tables
  const salesColumns = [
    { label: 'In-House', key: 'In-House' },
    { label: '% (+/-)', key: '% (+/-)_In-House' },
    { label: '1P', key: '1p' },
    { label: '% (+/-)', key: '% (+/-)_1p' },
    { label: '3P', key: '3p' },
    { label: '% (+/-)', key: '% (+/-)_3p' },
    { label: 'Catering', key: 'Catering' },
    { label: 'Total', key: 'TTL' }
  ];

  const laborColumns = [
    { label: 'Manager', key: 'Manager' },
    { label: '% (+/-)', key: '% (+/-)_Manager' },
    { label: 'FOH', key: 'FOH' },
    { label: '% (+/-)', key: '% (+/-)_FOH' },
    { label: 'BOH', key: 'BOH' },
    { label: '% (+/-)', key: '% (+/-)_BOH' },
    { label: 'Training', key: 'Training' },
    { label: 'Other', key: 'Other' }
  ];

  const avgTicketColumns = [
    { label: 'In-House', key: 'In-House' },
    { label: '% (+/-)', key: '% (+/-)_In-House' },
    { label: '1P', key: '1p' },
    { label: '% (+/-)', key: '% (+/-)_1p' },
    { label: '3P', key: '3p' },
    { label: '% (+/-)', key: '% (+/-)_3p' },
    { label: 'Catering', key: 'Catering' },
    { label: 'Avg', key: 'Avg' }
  ];

  const primeCostColumns = [
    { label: 'Labor', key: 'Labor' },
    { label: '% (+/-)', key: '% (+/-)_Labor' },
    { label: 'Food', key: 'Food' },
    { label: '% (+/-)', key: '% (+/-)_Food' },
    { label: 'Paper', key: 'Paper' },
    { label: '% (+/-)', key: '% (+/-)_Paper' },
    { label: 'OK', key: 'OK' },
    { label: 'Other', key: 'Other' }
  ];

  const foodCostColumns = [
    { label: 'Johns', key: 'Johns' },
    { label: '% (+/-)', key: '% (+/-)_Johns' },
    { label: 'Terra', key: 'Terra' },
    { label: '% (+/-)', key: '% (+/-)_Terra' },
    { label: 'Metro', key: 'Metro' },
    { label: '% (+/-)', key: '% (+/-)_Metro' },
    { label: 'Victory', key: 'Victory' },
    { label: 'CK', key: 'Ck' }
  ];

  // Container styles with modern design
  const containerStyle = {
    padding: '40px 32px',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    maxWidth: '100vw',
    overflow: 'hidden'
  };

  const headerStyle = {
    marginBottom: '48px',
    textAlign: 'center' as const
  };

  const titleStyle = {
    fontSize: 'clamp(32px, 5vw, 48px)',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    margin: '0 0 16px 0',
    letterSpacing: '-0.02em'
  };

  const subtitleStyle = {
    fontSize: 'clamp(18px, 3vw, 22px)',
    color: '#64748b',
    margin: 0,
    fontWeight: '600'
  };

  // Responsive grid styles
  const singleColumnGrid = {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '32px',
    marginBottom: '48px',
    width: '100%'
  };

  const twoColumnGrid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(500px, 100%), 1fr))',
    gap: '32px',
    marginBottom: '48px',
    width: '100%'
  };

  const chartsGrid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(450px, 100%), 1fr))',
    gap: '32px',
    marginBottom: '48px',
    width: '100%'
  };

  // Single row for orders chart
  const singleRowGrid = {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '32px',
    marginBottom: '48px',
    width: '100%'
  };

  return (
    <div style={containerStyle}>
      {/* Debug Display - Remove in production */}
      {/* <DebugDataDisplay table1Data={table1Data} /> */}

      {/* Header */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>Financial Dashboard</h1>
        <p style={subtitleStyle}>Comprehensive Financial Analytics & Performance Metrics</p>
      </div>

      {/* Single Column Layout for Main Financial Tables */}
      <div style={singleColumnGrid}>
        <ResponsiveFinancialTable
          title="Sales"
          mainValue={mainSalesValue}
          data={salesData}
          columns={salesColumns}
        />
        
        <ResponsiveFinancialTable
          title="Labor Cost"
          mainValue={mainLaborCostValue}
          data={laborCostData}
          columns={laborColumns}
        />
        
        <ResponsiveFinancialTable
          title="Avg Ticket"
          mainValue={mainAvgTicketValue}
          data={avgTicketData}
          columns={avgTicketColumns}
        />
        
        <ResponsiveFinancialTable
          title="Prime Cost"
          mainValue={mainPrimeCostValue}
          data={primeCostData}
          columns={primeCostColumns}
        />
        
        <ResponsiveFinancialTable
          title="Food Cost"
          mainValue={mainFoodCostValue}
          data={foodCostData}
          columns={foodCostColumns}
        />
      </div>

      {/* SPMH and LPMH Cards - Side by Side */}
      <div style={twoColumnGrid}>
        <MetricCard
          title="SPMH"
          value={mainSpmhValue}
          data={spmhData}
        />
        
        <MetricCard
          title="LPMH"
          value={mainLpmhValue}
          data={lpmhData}
        />
      </div>

      {/* Charts Section - Weekly Sales and Average Ticket */}
      <div style={chartsGrid}>
        <ModernLineChart 
          data={weeklySalesData} 
          title="Weekly Sales Trends" 
          dataKeys={['This Week', 'Last Week', 'Last Year', 'L4wt', 'Bdg']}
        />
        <ModernLineChart 
          data={avgTicketByDayData} 
          title="Average Ticket by Day" 
          dataKeys={['This Week', 'Last Week', 'Last Year', 'L4wt', 'Bdg']}
        />
      </div>

      {/* Orders Chart - Single Row as requested */}
      <div style={singleRowGrid}>
        <ModernBarChart 
          data={ordersByDayData} 
          title="Orders by Day of Week" 
        />
      </div>

      {/* Bottom Row - KPI vs Budget Table */}
      <div style={singleColumnGrid}>
        {kpiData.length > 0 && (
          <div style={{ 
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', 
            borderRadius: '24px', 
            boxShadow: '0 20px 40px rgba(0,0,0,0.08), 0 8px 25px rgba(0,0,0,0.04)',
            border: '1px solid #e2e8f0',
            width: '100%',
            boxSizing: 'border-box',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '32px 28px' }}>
              <h3 style={{ 
                margin: '0 0 28px 0', 
                fontSize: '26px', 
                fontWeight: '700', 
                color: '#1e293b',
                letterSpacing: '-0.01em'
              }}>
                KPI vs Budget
              </h3>
              <div style={{ 
                overflowX: 'auto', 
                borderRadius: '16px', 
                backgroundColor: '#f8fafc',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)'
              }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse', 
                  fontSize: '14px', 
                  minWidth: '500px' 
                }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9' }}>
                      <th style={{ 
                        padding: '20px 16px', 
                        textAlign: 'left', 
                        fontWeight: '700', 
                        fontSize: '13px', 
                        color: '#475569', 
                        borderRadius: '16px 0 0 0',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Metric
                      </th>
                      <th style={{ 
                        padding: '20px 16px', 
                        textAlign: 'left', 
                        fontWeight: '700', 
                        fontSize: '13px', 
                        color: '#475569',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        This Week
                      </th>
                      <th style={{ 
                        padding: '20px 16px', 
                        textAlign: 'left', 
                        fontWeight: '700', 
                        fontSize: '13px', 
                        color: '#475569',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Budget
                      </th>
                      <th style={{ 
                        padding: '20px 16px', 
                        textAlign: 'left', 
                        fontWeight: '700', 
                        fontSize: '13px', 
                        color: '#475569', 
                        borderRadius: '0 16px 0 0',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Tw/Bdg (+/-)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {kpiData.map((row, index) => (
                      <tr key={index} style={{ 
                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc',
                        borderBottom: index === kpiData.length - 1 ? 'none' : '1px solid #e2e8f0'
                      }}>
                        <td style={{ 
                          padding: '16px', 
                          fontWeight: '700', 
                          color: '#334155',
                          fontSize: '15px'
                        }}>
                          {row.Metric}
                        </td>
                        <td style={{ 
                          padding: '16px', 
                          color: '#64748b',
                          fontWeight: '600'
                        }}>
                          {row['This Week']}
                        </td>
                        <td style={{ 
                          padding: '16px', 
                          color: '#64748b',
                          fontWeight: '600'
                        }}>
                          {row.Budget}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '12px', 
                            flexWrap: 'wrap' 
                          }}>
                            <span style={{ 
                              color: row['Tw/Bdg (+/-)'].startsWith('+') ? '#059669' : '#dc2626',
                              fontWeight: '700',
                              fontSize: '16px'
                            }}>
                              {row['Tw/Bdg (+/-)']}
                            </span>
                            <span style={{ 
                              background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                              color: '#1d4ed8',
                              padding: '6px 12px',
                              borderRadius: '16px',
                              fontSize: '12px',
                              fontWeight: '700',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}>
                              {row['Percent Change']}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComprehensiveFinancialDashboard;
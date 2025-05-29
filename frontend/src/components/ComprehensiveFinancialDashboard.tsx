import React from 'react';

// Sample data based on the image
const salesData = {
  sales: 45000.00,
  periods: [
    { period: 'Tw', change: '0%', inHouse: '50.00%', inHouseChange: '3.00%', firstParty: '25.00%', firstPartyChange: '3.00%', thirdParty: '17.00%', thirdPartyChange: '3.00%', catering: '8.00%', cateringChange: '3.00%', total: '100.00%' },
    { period: 'Lw', change: '5.00%', inHouse: '50.00%', inHouseChange: '3.00%', firstParty: '25.00%', firstPartyChange: '3.00%', thirdParty: '17.00%', thirdPartyChange: '3.00%', catering: '8.00%', cateringChange: '3.00%', total: '100.00%' },
    { period: 'L4wt', change: '15.00%', inHouse: '45.00%', inHouseChange: '-4.00%', firstParty: '23.00%', firstPartyChange: '-5.00%', thirdParty: '22.00%', thirdPartyChange: '-4.00%', catering: '10.00%', cateringChange: '-4.00%', total: '100.00%' },
    { period: 'Ly', change: '25.00%', inHouse: '50.00%', inHouseChange: '3.00%', firstParty: '25.00%', firstPartyChange: '3.00%', thirdParty: '17.00%', thirdPartyChange: '3.00%', catering: '8.00%', cateringChange: '3.00%', total: '100.00%' },
    { period: 'Bdg', change: '-12.00%', inHouse: '50.00%', inHouseChange: '-14.00%', firstParty: '25.00%', firstPartyChange: '-14.00%', thirdParty: '17.00%', thirdPartyChange: '-14.00%', catering: '8.00%', cateringChange: '-14.00%', total: '100.00%' }
  ]
};

const avgTicketData = {
  avgTicket: 14.59,
  periods: [
    { period: 'Tw', change: '0%', inHouse: '$16.25', inHouseChange: '3.00%', firstParty: '$16.25', firstPartyChange: '3.00%', thirdParty: '$16.25', thirdPartyChange: '3.00%', catering: '$16.25', cateringChange: '3.00%', avg: '$16.25' },
    { period: 'Lw', change: '5.00%', inHouse: '$16.25', inHouseChange: '3.00%', firstParty: '$16.25', firstPartyChange: '3.00%', thirdParty: '$16.25', thirdPartyChange: '3.00%', catering: '$16.25', cateringChange: '3.00%', avg: '$16.25' },
    { period: 'L4wt', change: '-15.00%', inHouse: '$16.57', inHouseChange: '-5.00%', firstParty: '$16.57', firstPartyChange: '-5.00%', thirdParty: '$16.57', thirdPartyChange: '-5.00%', catering: '$16.57', cateringChange: '-5.00%', avg: '$16.57' },
    { period: 'Ly', change: '25.00%', inHouse: '$14.50', inHouseChange: '3.00%', firstParty: '$14.50', firstPartyChange: '3.00%', thirdParty: '$14.50', thirdPartyChange: '3.00%', catering: '$14.50', cateringChange: '3.00%', avg: '$14.50' },
    { period: 'Bdg', change: '-12.00%', inHouse: '$19.50', inHouseChange: '-14.00%', firstParty: '$19.50', firstPartyChange: '-14.00%', thirdParty: '$19.50', thirdPartyChange: '-14.00%', catering: '$19.50', cateringChange: '-14.00%', avg: '$19.50' }
  ]
};

const laborCostData = {
  laborCost: '35.25%',
  periods: [
    { period: 'Tw', change: '0%', manager: '15.25%', managerChange: '3.00%', foh: '15.25%', fohChange: '3.00%', boh: '15.25%', bohChange: '3.00%', training: '15.25%', trainingChange: '3.00%', other: '15.25%' },
    { period: 'Lw', change: '5.00%', manager: '15.25%', managerChange: '3.00%', foh: '15.25%', fohChange: '3.00%', boh: '15.25%', bohChange: '3.00%', training: '15.25%', trainingChange: '3.00%', other: '15.25%' },
    { period: 'L4wt', change: '-15.00%', manager: '18.25%', managerChange: '-5.00%', foh: '15.25%', fohChange: '-5.00%', boh: '16.25%', bohChange: '-5.00%', training: '19.25%', trainingChange: '-4.00%', other: '18.25%' },
    { period: 'Ly', change: '25.00%', manager: '15.25%', managerChange: '3.00%', foh: '15.25%', fohChange: '3.00%', boh: '15.25%', bohChange: '3.00%', training: '15.25%', trainingChange: '3.00%', other: '15.25%' },
    { period: 'Bdg', change: '-12.00%', manager: '15.25%', managerChange: '-14.00%', foh: '15.25%', fohChange: '-14.00%', boh: '16.25%', bohChange: '-14.00%', training: '15.25%', trainingChange: '-14.00%', other: '15.25%' }
  ]
};

const spmhData = {
  spmh: 65.25,
  periods: [
    { period: 'Tw', dollarChange: '$65.15', percentChange: '5.00%' },
    { period: 'Lw', dollarChange: '$66.15', percentChange: '6.00%' },
    { period: 'L4wt', dollarChange: '$64.25', percentChange: '-15.00%' },
    { period: 'Ly', dollarChange: '$44.25', percentChange: '25.00%' },
    { period: 'Bdg', dollarChange: '$64.29', percentChange: '-12.00%' }
  ]
};

const lpmhData = {
  spmh: 15.24,
  periods: [
    { period: 'Tw', dollarChange: '$17.25', percentChange: '5.00%' },
    { period: 'Lw', dollarChange: '$17.25', percentChange: '5.00%' },
    { period: 'L4wt', dollarChange: '$15.25', percentChange: '-15.00%' },
    { period: 'Ly', dollarChange: '$14.66', percentChange: '25.00%' },
    { period: 'Bdg', dollarChange: '$18.25', percentChange: '-12.00%' }
  ]
};

const kpiData = [
  { metric: 'Net Sales', thisWeek: '3,406,791', budget: '3,178,203', twBdg: '-61.5', percent: '8%' },
  { metric: 'Orders', thisWeek: '152,562', budget: '423,065', twBdg: '-63.9', percent: '89%' },
  { metric: 'Avg Ticket', thisWeek: '22.93', budget: '21.69', twBdg: '+3.7', percent: '5%' },
  { metric: 'Food Cost %', thisWeek: '32.8%', budget: '29.6%', twBdg: '+3.0', percent: '6%' }
];

// Weekly sales chart data
const weeklySalesData = [
  { day: 'Mon', thisWeek: 8.5, lastWeek: 8.2, lastYear: 7.8 },
  { day: 'Tue', thisWeek: 8.8, lastWeek: 8.1, lastYear: 7.5 },
  { day: 'Wed', thisWeek: 9.2, lastWeek: 8.9, lastYear: 8.1 },
  { day: 'Thu', thisWeek: 8.1, lastWeek: 8.8, lastYear: 7.9 },
  { day: 'Fri', thisWeek: 8.9, lastWeek: 8.5, lastYear: 8.2 },
  { day: 'Sat', thisWeek: 8.7, lastWeek: 8.4, lastYear: 8.0 },
  { day: 'Sun', thisWeek: 8.6, lastWeek: 8.3, lastYear: 7.7 }
];

const ordersByDayData = [
  { day: 'Monday', thisWeek: 850, lastWeek: 780, lastYear: 720 },
  { day: 'Tuesday', thisWeek: 920, lastWeek: 880, lastYear: 810 },
  { day: 'Wednesday', thisWeek: 780, lastWeek: 760, lastYear: 690 },
  { day: 'Thursday', thisWeek: 680, lastWeek: 650, lastYear: 620 },
  { day: 'Friday', thisWeek: 750, lastWeek: 720, lastYear: 680 },
  { day: 'Saturday', thisWeek: 820, lastWeek: 800, lastYear: 750 },
  { day: 'Sunday', thisWeek: 780, lastWeek: 740, lastYear: 700 }
];

// Utility function to format change values
const formatChange = (value) => {
  const numValue = parseFloat(value.replace('%', ''));
  const isPositive = numValue >= 0;
  return {
    value: value,
    color: isPositive ? '#2e7d32' : '#d32f2f',
    arrow: isPositive ? '▲' : '▼'
  };
};

// Simple Line Chart Component
const SimpleLineChart = ({ data, title, height = 250 }) => {
  const maxValue = Math.max(...data.map(d => Math.max(d.thisWeek || 0, d.lastWeek || 0, d.lastYear || 0)));
  const minValue = Math.min(...data.map(d => Math.min(d.thisWeek || 0, d.lastWeek || 0, d.lastYear || 0)));
  const range = maxValue - minValue || 1;
  
  const getY = (value) => {
    return height - 40 - ((value - minValue) / range) * (height - 80);
  };
  
  const getX = (index) => {
    return 60 + (index * (320 / (data.length - 1)));
  };

  return (
    <div style={{ 
      padding: '20px', 
      background: '#fff', 
      borderRadius: '8px', 
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600' }}>{title}</h3>
      <div style={{ overflow: 'auto' }}>
        <svg width="400" height={height} style={{ overflow: 'visible', minWidth: '350px' }}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <line
              key={i}
              x1="60"
              y1={40 + ratio * (height - 80)}
              x2="380"
              y2={40 + ratio * (height - 80)}
              stroke="#e0e0e0"
              strokeWidth="1"
            />
          ))}
          
          {/* This Week Line */}
          <polyline
            fill="none"
            stroke="#1976d2"
            strokeWidth="3"
            points={data.map((d, i) => `${getX(i)},${getY(d.thisWeek || 0)}`).join(' ')}
          />
          
          {/* Last Week Line */}
          <polyline
            fill="none"
            stroke="#90caf9"
            strokeWidth="2"
            points={data.map((d, i) => `${getX(i)},${getY(d.lastWeek || 0)}`).join(' ')}
          />
          
          {/* Last Year Line */}
          <polyline
            fill="none"
            stroke="#424242"
            strokeWidth="2"
            points={data.map((d, i) => `${getX(i)},${getY(d.lastYear || 0)}`).join(' ')}
          />
          
          {/* Data points */}
          {data.map((d, i) => (
            <g key={i}>
              <circle cx={getX(i)} cy={getY(d.thisWeek || 0)} r="4" fill="#1976d2" />
              <circle cx={getX(i)} cy={getY(d.lastWeek || 0)} r="3" fill="#90caf9" />
              <circle cx={getX(i)} cy={getY(d.lastYear || 0)} r="3" fill="#424242" />
            </g>
          ))}
          
          {/* X-axis labels */}
          {data.map((d, i) => (
            <text
              key={i}
              x={getX(i)}
              y={height - 10}
              textAnchor="middle"
              fontSize="12"
              fill="#666"
            >
              {d.day}
            </text>
          ))}
          
          {/* Y-axis labels */}
          {[minValue, (minValue + maxValue) / 2, maxValue].map((value, i) => (
            <text
              key={i}
              x="50"
              y={getY(value) + 4}
              textAnchor="end"
              fontSize="12"
              fill="#666"
            >
              {value.toFixed(1)}
            </text>
          ))}
        </svg>
      </div>
      
      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '12px', height: '3px', background: '#1976d2' }}></div>
          <span style={{ fontSize: '12px', color: '#666' }}>This Week</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '12px', height: '2px', background: '#90caf9' }}></div>
          <span style={{ fontSize: '12px', color: '#666' }}>Last Week</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '12px', height: '2px', background: '#424242' }}></div>
          <span style={{ fontSize: '12px', color: '#666' }}>Last Year</span>
        </div>
      </div>
    </div>
  );
};

// Simple Bar Chart Component
const SimpleBarChart = ({ data, title, height = 250 }) => {
  const maxValue = Math.max(...data.map(d => Math.max(d.thisWeek || 0, d.lastWeek || 0, d.lastYear || 0)));
  const barWidth = 15;
  const groupWidth = 60;
  
  const getY = (value) => {
    return height - 40 - (value / maxValue) * (height - 80);
  };
  
  const getX = (index, barIndex) => {
    return 60 + (index * groupWidth) + (barIndex * (barWidth + 2));
  };

  return (
    <div style={{ 
      padding: '20px', 
      background: '#fff', 
      borderRadius: '8px', 
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600' }}>{title}</h3>
      <div style={{ overflow: 'auto' }}>
        <svg width="500" height={height} style={{ overflow: 'visible', minWidth: '400px' }}>
          {/* Bars */}
          {data.map((d, i) => (
            <g key={i}>
              <rect
                x={getX(i, 0)}
                y={getY(d.thisWeek || 0)}
                width={barWidth}
                height={(d.thisWeek || 0) / maxValue * (height - 80)}
                fill="#1976d2"
              />
              <rect
                x={getX(i, 1)}
                y={getY(d.lastWeek || 0)}
                width={barWidth}
                height={(d.lastWeek || 0) / maxValue * (height - 80)}
                fill="#90caf9"
              />
              <rect
                x={getX(i, 2)}
                y={getY(d.lastYear || 0)}
                width={barWidth}
                height={(d.lastYear || 0) / maxValue * (height - 80)}
                fill="#424242"
              />
            </g>
          ))}
          
          {/* X-axis labels */}
          {data.map((d, i) => (
            <text
              key={i}
              x={getX(i, 1)}
              y={height - 10}
              textAnchor="middle"
              fontSize="10"
              fill="#666"
              transform={`rotate(-45, ${getX(i, 1)}, ${height - 10})`}
            >
              {d.day}
            </text>
          ))}
        </svg>
      </div>
      
      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '10px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '12px', height: '12px', background: '#1976d2' }}></div>
          <span style={{ fontSize: '12px', color: '#666' }}>This Week</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '12px', height: '12px', background: '#90caf9' }}></div>
          <span style={{ fontSize: '12px', color: '#666' }}>Last Week</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '12px', height: '12px', background: '#424242' }}></div>
          <span style={{ fontSize: '12px', color: '#666' }}>Last Year</span>
        </div>
      </div>
    </div>
  );
};

// Table component for financial data
const FinancialDataTable = ({ title, mainValue, data, columns }) => {
  return (
    <div style={{ 
      background: '#fff', 
      borderRadius: '12px', 
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0',
      transition: 'all 0.3s ease',
      height: '100%',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#333' }}>{title}</h3>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#1976d2' }}>{mainValue}</div>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '300px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={{ padding: '8px 4px', textAlign: 'left', fontWeight: '600', fontSize: '11px', borderBottom: '1px solid #ddd' }}>Time Period</th>
                <th style={{ padding: '8px 4px', textAlign: 'left', fontWeight: '600', fontSize: '11px', borderBottom: '1px solid #ddd' }}>% Change</th>
                {columns.map((col, index) => (
                  <th key={index} style={{ padding: '8px 4px', textAlign: 'left', fontWeight: '600', fontSize: '11px', borderBottom: '1px solid #ddd' }}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                  <td style={{ padding: '6px 4px', fontWeight: '600', borderBottom: '1px solid #eee' }}>{row.period}</td>
                  <td style={{ padding: '6px 4px', borderBottom: '1px solid #eee' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <span style={{ color: formatChange(row.change).color, fontSize: '10px' }}>
                        {formatChange(row.change).arrow}
                      </span>
                      <span style={{ color: formatChange(row.change).color, fontWeight: '600' }}>
                        {row.change}
                      </span>
                    </div>
                  </td>
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} style={{ padding: '6px 4px', borderBottom: '1px solid #eee' }}>
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

const ComprehensiveFinancialDashboard = () => {
  const containerStyle = {
    padding: '24px',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    maxWidth: '100vw',
    overflow: 'hidden'
  };

  const headerStyle = {
    marginBottom: '32px',
    textAlign: 'center'
  };

  const titleStyle = {
    fontSize: 'clamp(24px, 5vw, 36px)',
    fontWeight: '700',
    color: '#1976d2',
    margin: '0 0 8px 0'
  };

  const subtitleStyle = {
    fontSize: 'clamp(14px, 3vw, 18px)',
    color: '#666',
    margin: 0
  };

  // Responsive grid styles
  const baseGridStyle = {
    display: 'grid',
    gap: '24px',
    marginBottom: '32px',
    width: '100%'
  };

  // Two column layout for larger items
  const twoColumnGrid = {
    ...baseGridStyle,
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(400px, 100%), 1fr))',
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
      gap: '16px'
    }
  };

  // Three column layout - FIXED for proper responsiveness
  const threeColumnGrid = {
    ...baseGridStyle,
    // Desktop: 3 columns, Tablet: 2 columns, Mobile: 1 column
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    '@media (min-width: 1024px)': {
      gridTemplateColumns: 'repeat(3, 1fr)'
    },
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
      gap: '16px'
    }
  };

  // Charts grid - ensures responsive behavior
  const chartsGrid = {
    ...baseGridStyle,
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(350px, 100%), 1fr))',
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
      gap: '16px'
    }
  };

  // Bottom section with mixed layouts
  const bottomGrid = {
    ...baseGridStyle,
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))',
    '@media (min-width: 1200px)': {
      gridTemplateColumns: '1fr 1fr 1.2fr' // Average Ticket, Labor Chart, KPI Table
    },
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
      gap: '16px'
    }
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>Financial Dashboard</h1>
        <p style={subtitleStyle}>Comprehensive Financial Analytics & Performance Metrics</p>
      </div>

      {/* Top Row - Main Financial Tables */}
      <div style={twoColumnGrid}>
        <FinancialDataTable
          title="Sales"
          mainValue="$45,000.00"
          data={salesData.periods}
          columns={[
            { label: 'In-House', key: 'inHouse' },
            { label: '% (+/-)', key: 'inHouseChange' },
            { label: '1p', key: 'firstParty' },
            { label: '% (+/-)', key: 'firstPartyChange' },
            { label: '3p', key: 'thirdParty' },
            { label: '% (+/-)', key: 'thirdPartyChange' },
            { label: 'Catering', key: 'catering' },
            { label: '% (+/-)', key: 'cateringChange' },
            { label: 'TTL', key: 'total' }
          ]}
        />
        <FinancialDataTable
          title="Labor Cost"
          mainValue="35.25%"
          data={laborCostData.periods}
          columns={[
            { label: 'Manager', key: 'manager' },
            { label: '% (+/-)', key: 'managerChange' },
            { label: 'FOH', key: 'foh' },
            { label: '% (+/-)', key: 'fohChange' },
            { label: 'BOH', key: 'boh' },
            { label: '% (+/-)', key: 'bohChange' },
            { label: 'Training', key: 'training' },
            { label: '% (+/-)', key: 'trainingChange' },
            { label: 'Other', key: 'other' }
          ]}
        />
      </div>

      {/* Second Row - Average Ticket & Prime Cost */}
      <div style={twoColumnGrid}>
        <FinancialDataTable
          title="Avg Ticket"
          mainValue="$14.59"
          data={avgTicketData.periods}
          columns={[
            { label: 'In-House', key: 'inHouse' },
            { label: '% (+/-)', key: 'inHouseChange' },
            { label: '1p', key: 'firstParty' },
            { label: '% (+/-)', key: 'firstPartyChange' },
            { label: '3p', key: 'thirdParty' },
            { label: '% (+/-)', key: 'thirdPartyChange' },
            { label: 'Catering', key: 'catering' },
            { label: '% (+/-)', key: 'cateringChange' },
            { label: 'Avg', key: 'avg' }
          ]}
        />
        <FinancialDataTable
          title="Prime Cost"
          mainValue="70.50%"
          data={laborCostData.periods}
          columns={[
            { label: 'Labor', key: 'manager' },
            { label: '% (+/-)', key: 'managerChange' },
            { label: 'Food', key: 'foh' },
            { label: '% (+/-)', key: 'fohChange' },
            { label: 'Paper', key: 'boh' },
            { label: '% (+/-)', key: 'bohChange' },
            { label: 'OK', key: 'training' },
            { label: '% (+/-)', key: 'trainingChange' },
            { label: 'Other', key: 'other' }
          ]}
        />
      </div>

      {/* FIXED: Third Row - Food Cost, SPMH, LPMH - Now properly in one row on laptop */}
      <div style={threeColumnGrid}>
        <FinancialDataTable
          title="Food Cost"
          mainValue="35.25%"
          data={laborCostData.periods}
          columns={[
            { label: 'Johns', key: 'manager' },
            { label: '% (+/-)', key: 'managerChange' },
            { label: 'Terra', key: 'foh' },
            { label: '% (+/-)', key: 'fohChange' },
            { label: 'Metro', key: 'boh' },
            { label: '% (+/-)', key: 'bohChange' },
            { label: 'Victory', key: 'training' },
            { label: '% (+/-)', key: 'trainingChange' },
            { label: 'Ck', key: 'other' }
          ]}
        />
        
        {/* SPMH Card */}
        <div style={{ 
          background: '#fff', 
          borderRadius: '12px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0',
          height: 'fit-content',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>SPMH</h3>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#1976d2' }}>$65.25</div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '200px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ padding: '8px 4px', textAlign: 'left', fontWeight: '600', fontSize: '11px' }}>Time Period</th>
                    <th style={{ padding: '8px 4px', textAlign: 'left', fontWeight: '600', fontSize: '11px' }}>$ Change</th>
                    <th style={{ padding: '8px 4px', textAlign: 'left', fontWeight: '600', fontSize: '11px' }}>% Change</th>
                  </tr>
                </thead>
                <tbody>
                  {spmhData.periods.map((row, index) => (
                    <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                      <td style={{ padding: '6px 4px', fontWeight: '600' }}>{row.period}</td>
                      <td style={{ padding: '6px 4px' }}>{row.dollarChange}</td>
                      <td style={{ padding: '6px 4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <span style={{ color: formatChange(row.percentChange).color, fontSize: '10px' }}>
                            {formatChange(row.percentChange).arrow}
                          </span>
                          <span style={{ color: formatChange(row.percentChange).color, fontWeight: '600' }}>
                            {row.percentChange}
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
        
        {/* LPMH Card */}
        <div style={{ 
          background: '#fff', 
          borderRadius: '12px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0',
          height: 'fit-content',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>LPMH</h3>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#1976d2' }}>$15.24</div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '200px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ padding: '8px 4px', textAlign: 'left', fontWeight: '600', fontSize: '11px' }}>Time Period</th>
                    <th style={{ padding: '8px 4px', textAlign: 'left', fontWeight: '600', fontSize: '11px' }}>$ Change</th>
                    <th style={{ padding: '8px 4px', textAlign: 'left', fontWeight: '600', fontSize: '11px' }}>% Change</th>
                  </tr>
                </thead>
                <tbody>
                  {lpmhData.periods.map((row, index) => (
                    <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                      <td style={{ padding: '6px 4px', fontWeight: '600' }}>{row.period}</td>
                      <td style={{ padding: '6px 4px' }}>{row.dollarChange}</td>
                      <td style={{ padding: '6px 4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <span style={{ color: formatChange(row.percentChange).color, fontSize: '10px' }}>
                            {formatChange(row.percentChange).arrow}
                          </span>
                          <span style={{ color: formatChange(row.percentChange).color, fontWeight: '600' }}>
                            {row.percentChange}
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
      </div>

      {/* Charts Section */}
      <div style={chartsGrid}>
        <SimpleLineChart data={weeklySalesData} title="Weekly Sales" />
        <SimpleBarChart data={ordersByDayData} title="Orders by Day of Week" />
      </div>

      {/* FIXED: Bottom Row - Average Ticket, Labor Cost vs Labor Hours, KPI vs Budget */}
      <div style={bottomGrid}>
        <SimpleLineChart data={weeklySalesData} title="Average Ticket" height={200} />
        
      

        {/* KPI vs Budget Table */}
        <div style={{ 
          background: '#fff', 
          borderRadius: '12px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0',
          height: 'fit-content',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{ padding: '16px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>KPI vs Budget</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '300px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ padding: '8px 4px', textAlign: 'left', fontWeight: '600', fontSize: '11px' }}>Metric</th>
                    <th style={{ padding: '8px 4px', textAlign: 'left', fontWeight: '600', fontSize: '11px' }}>This Week</th>
                    <th style={{ padding: '8px 4px', textAlign: 'left', fontWeight: '600', fontSize: '11px' }}>Budget</th>
                    <th style={{ padding: '8px 4px', textAlign: 'left', fontWeight: '600', fontSize: '11px' }}>Tw/Bdg (+/-)</th>
                  </tr>
                </thead>
                <tbody>
                  {kpiData.map((row, index) => (
                    <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                      <td style={{ padding: '6px 4px', fontWeight: '600' }}>{row.metric}</td>
                      <td style={{ padding: '6px 4px' }}>{row.thisWeek}</td>
                      <td style={{ padding: '6px 4px' }}>{row.budget}</td>
                      <td style={{ padding: '6px 4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                          <span style={{ 
                            color: row.twBdg.startsWith('+') ? '#2e7d32' : '#d32f2f',
                            fontWeight: '600' 
                          }}>
                            {row.twBdg}
                          </span>
                          <span style={{ 
                            background: '#e3f2fd',
                            color: '#1976d2',
                            padding: '2px 6px',
                            borderRadius: '12px',
                            fontSize: '10px'
                          }}>
                            {row.percent}
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
      </div>
    </div>
  );
};

export default ComprehensiveFinancialDashboard;
import React from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  Legend, Tooltip
} from 'recharts';

const SalesSplitDashboard = () => {
  // Total Sales Data
  const totalSalesData = [
    { week: '1', sales: 45 },
    { week: '3', sales: 42 },
    { week: '5', sales: 44 },
    { week: '8', sales: 48 },
    { week: '11', sales: 58 },
    { week: '13', sales: 68 },
    { week: '15', sales: 78 },
    { week: '17', sales: 86 },
  ];

  // Sales Category Data
  const salesCategoryData = [
    { name: 'Catering', value: 31, color: '#4D8D8D' },
    { name: '31%', value: 56, color: '#7DCBC4' },
    { name: 'DD', value: 5, color: '#2D5F5F' }
  ];

  // % of In-House Data
  const inHousePercentData = [
    { week: '1', percent: 10 },
    { week: '3', percent: 12 },
    { week: '5', percent: 15 },
    { week: '6', percent: 18 },
    { week: '8', percent: 25 },
    { week: '9', percent: 16 },
    { week: '10', percent: 20 },
    { week: '11', percent: 22 },
    { week: '12', percent: 25 },
    { week: '13', percent: 40 },
  ];

  // in-House Data
  const inHouseData = [
    { week: '1', percent: 20 },
    { week: '6', percent: 18 },
    { week: '8', percent: 17 },
    { week: '13', percent: 18 },
    { week: '15', percent: 22 },
    { week: '17', percent: 25 },
  ];

  // WOW Trends Data
  const wowTrendsData = [
    { week: '1', Estimates: 5, Catering: 15, InHouse: 42, DD: 70, CIV: 25, UB: 15 },
    { week: '3', Estimates: 15, Catering: 5, InHouse: 5, DD: 10, CIV: 5, UB: 5 },
    { week: '6', Estimates: 25, Catering: 30, InHouse: 15, DD: 2, CIV: 5, UB: 20 },
    { week: '7', Estimates: 2, Catering: 10, InHouse: 5, DD: -5, CIV: 15, UB: 10 },
    { week: '8', Estimates: 18, Catering: 35, InHouse: 25, DD: -10, CIV: 30, UB: 25 },
    { week: '10', Estimates: 25, Catering: 15, InHouse: 5, DD: -15, CIV: 5, UB: 20 },
    { week: '13', Estimates: 12, Catering: 20, InHouse: 15, DD: -20, CIV: 20, UB: 15 },
    { week: '15', Estimates: 5, Catering: 30, InHouse: 25, DD: -15, CIV: 30, UB: 30 },
    { week: '17', Estimates: 15, Catering: 25, InHouse: 5, DD: 75, CIV: -10, UB: 5 },
  ];

  // Custom label for pie charts
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        fontSize={14}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Category legend component
  const CategoryLegend = ({ data }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
      {data.map((entry, index) => (
        <div key={index} style={{ 
          display: 'flex', 
          alignItems: 'center',
          padding: '4px',
          borderRadius: '4px',
          transition: 'background-color 0.2s ease',
        }}
        className="legend-item"
        >
          <div 
            style={{ 
              width: '12px', 
              height: '12px', 
              borderRadius: '50%', 
              marginRight: '8px',
              backgroundColor: entry.color,
            }}
          />
          <div style={{ fontSize: '14px' }}>{entry.name}</div>
          <div style={{ fontSize: '14px', fontWeight: '500', marginLeft: 'auto' }}>{entry.value}%</div>
        </div>
      ))}
    </div>
  );

  // In-House Percentage Progress Bars
  const InHouseProgressBars = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
      {/* 0% */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ 
          width: '100%', 
          height: '24px', 
          backgroundColor: 'rgba(77, 141, 141, 0.1)', 
          borderRadius: '12px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', fontWeight: '500' }}>
            0%
          </div>
        </div>
      </div>
      
      {/* 20% */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ 
          width: '100%', 
          height: '24px', 
          backgroundColor: 'rgba(77, 141, 141, 0.1)', 
          borderRadius: '12px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div 
            style={{ 
              height: '100%', 
              width: '20%', 
              backgroundColor: '#4D8D8D', 
              borderRadius: '12px',
              transition: 'width 0.8s ease'
            }}
          />
          <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', fontWeight: '500', color: 'white' }}>
            20%
          </div>
        </div>
      </div>
      
      {/* 40% */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ 
          width: '100%', 
          height: '24px', 
          backgroundColor: 'rgba(77, 141, 141, 0.1)', 
          borderRadius: '12px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div 
            style={{ 
              height: '100%', 
              width: '40%', 
              backgroundColor: '#4D8D8D', 
              borderRadius: '12px',
              transition: 'width 0.8s ease'
            }}
          />
          <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', fontWeight: '500', color: 'white' }}>
            40%
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      width: '100%', 
      gap: '24px', 
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      backgroundColor: '#f5f5f5'
    }}>
      {/* First row - Total Sales and Sales Category */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
        {/* Total Sales */}
        <div style={{ 
          width: 'calc(50% - 12px)', 
          minWidth: '300px',
          flexGrow: 1,
          padding: '24px', 
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          backgroundColor: 'white',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        }} className="stat-card">
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#333' }}>
            Total Sales
          </div>
          <div style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={totalSalesData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.1)" />
                <XAxis dataKey="week" axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} />
                <Tooltip 
                  formatter={(value) => [`${value}k`]}
                  contentStyle={{ 
                    borderRadius: 8, 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    border: 'none' 
                  }} 
                />
                <Bar 
                  dataKey="sales" 
                  fill="#4D8D8D" 
                  barSize={30} 
                  radius={[4, 4, 0, 0]}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ fontSize: '22px', fontWeight: '600', marginTop: '8px', color: '#4D8D8D' }}>
            $45,40 k
          </div>
        </div>

        {/* Sales Category */}
        <div style={{ 
          width: 'calc(50% - 12px)', 
          minWidth: '300px',
          flexGrow: 1,
          padding: '24px', 
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          backgroundColor: 'white',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        }} className="stat-card">
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#333' }}>
            Sales Category
          </div>
          <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={salesCategoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={0}
                  dataKey="value"
                  labelLine={false}
                  label={renderCustomizedLabel}
                >
                  {salesCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <CategoryLegend data={salesCategoryData} />
        </div>
      </div>

      {/* Second row - % of In-House and in-House */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
        {/* % of In-House */}
        <div style={{ 
          width: 'calc(50% - 12px)', 
          minWidth: '300px',
          flexGrow: 1,
          padding: '24px', 
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          backgroundColor: 'white',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        }} className="stat-card">
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#333' }}>
            % of In-House
          </div>
          <div style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={inHousePercentData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.1)" />
                <XAxis dataKey="week" axisLine={false} tickLine={false} />
                <YAxis 
                  domain={[0, 40]} 
                  ticks={[0, 20, 40]} 
                  tickFormatter={(value) => `${value}%`}
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip 
                  formatter={(value) => [`${value}%`]}
                  contentStyle={{ 
                    borderRadius: 8, 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    border: 'none' 
                  }}
                />
                <Bar 
                  dataKey="percent" 
                  fill="#4D8D8D" 
                  barSize={30} 
                  radius={[4, 4, 0, 0]}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <InHouseProgressBars />
        </div>

        {/* in-House */}
        <div style={{ 
          width: 'calc(50% - 12px)', 
          minWidth: '300px',
          flexGrow: 1,
          padding: '24px', 
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          backgroundColor: 'white',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        }} className="stat-card">
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#333' }}>
            in-House
          </div>
          <div style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={inHouseData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.1)" />
                <XAxis dataKey="week" axisLine={false} tickLine={false} />
                <YAxis 
                  domain={[15, 25]} 
                  ticks={[15, 20, 25]} 
                  tickFormatter={(value) => `${value}%`}
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip 
                  formatter={(value) => [`${value}%`]}
                  contentStyle={{ 
                    borderRadius: 8, 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    border: 'none' 
                  }}
                />
                <Bar 
                  dataKey="percent" 
                  fill="#4D8D8D" 
                  barSize={30} 
                  radius={[4, 4, 0, 0]}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginTop: '16px' 
          }}>
            <div style={{ 
              width: '32%', 
              textAlign: 'center', 
              padding: '8px', 
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: '500',
              color: '#4D8D8D',
              backgroundColor: 'rgba(77, 141, 141, 0.1)',
              transition: 'background-color 0.2s ease',
              cursor: 'pointer'
            }} className="percentage-pill">15%</div>
            <div style={{ 
              width: '32%', 
              textAlign: 'center', 
              padding: '8px', 
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: '500',
              color: '#4D8D8D',
              backgroundColor: 'rgba(77, 141, 141, 0.1)',
              transition: 'background-color 0.2s ease',
              cursor: 'pointer'
            }} className="percentage-pill">20%</div>
            <div style={{ 
              width: '32%', 
              textAlign: 'center', 
              padding: '8px', 
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: '500',
              color: '#4D8D8D',
              backgroundColor: 'rgba(77, 141, 141, 0.1)',
              transition: 'background-color 0.2s ease',
              cursor: 'pointer'
            }} className="percentage-pill">25%</div>
          </div>
        </div>
      </div>

      {/* Third row - WOW Trends */}
      <div style={{ 
        padding: '24px', 
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        backgroundColor: 'white',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      }} className="stat-card">
        <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#333' }}>
          Week-over Week ($: WOW) Trends
        </div>
        <div style={{ height: '300px', overflow: 'auto' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={wowTrendsData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              barCategoryGap={20}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.1)" />
              <XAxis dataKey="week" axisLine={false} tickLine={false} />
              <YAxis 
                domain={[-75, 265]} 
                tickFormatter={(value) => `${value}%`}
                axisLine={false} 
                tickLine={false}
              />
              <Tooltip 
                formatter={(value) => [`${value}%`]}
                contentStyle={{ 
                  borderRadius: 8, 
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  border: 'none' 
                }}
              />
              <Legend 
                layout="horizontal" 
                verticalAlign="bottom" 
                align="center"
                wrapperStyle={{ paddingTop: '20px' }}
              />
              <Bar dataKey="Estimates" fill="#4D8D8D" barSize={5} />
              <Bar dataKey="Catering" fill="#2D5F5F" barSize={5} />
              <Bar dataKey="InHouse" fill="#7DCBC4" barSize={5} />
              <Bar dataKey="DD" fill="#FFCE56" barSize={5} />
              <Bar dataKey="CIV" fill="#9FE2E0" barSize={5} />
              <Bar dataKey="UB" fill="#8BC34A" barSize={5} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Add CSS for hover effects */}
      <style>
        {`
          .stat-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 30px rgba(0,0,0,0.12);
          }
          .legend-item:hover {
            background-color: rgba(77, 141, 141, 0.1);
            cursor: pointer;
          }
          .percentage-pill:hover {
            background-color: rgba(77, 141, 141, 0.2);
          }
          @media (max-width: 768px) {
            .stat-card {
              width: 100%;
            }
          }
        `}
      </style>
    </div>
  );
};

export default SalesSplitDashboard;
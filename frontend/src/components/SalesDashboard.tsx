import React from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  LabelList, Legend, Tooltip
} from 'recharts';

const SalesDashboard = () => {
  // Data for sales by menu group
  const menuGroupData = [
    { name: 'Category 1', value: 17 },
    { name: 'Category 2', value: 12 },
    { name: 'Category 3', value: 9 },
    { name: 'Category 4', value: 7 },
    { name: 'Category 5', value: 4 },
    { name: 'Category 6', value: 1.5 }
  ];

  // Data for first pie chart
  const category1Data = [
    { name: 'Sandwiches', value: 49, color: '#69c0b8' },
    { name: 'Promotional', value: 51, color: '#4296a3' }
  ];

  // Data for second pie chart
  const category2Data = [
    { name: 'Entrees', value: 34, color: '#4296a3' },
    { name: 'Pnndwiches', value: 17, color: '#69c0b8' },
    { name: 'Promotional', value: 49, color: '#f0d275' }
  ];

  // Data for sales by server
  const serverData = [
    { name: 'Dianihuva Polanco', value: 65 },
    { name: 'Brayan Rivas', value: 45 },
    { name: 'dummy', value: 30 }
  ];

  // Top selling items data
  const topSellingItems = [
    { name: 'Grilled Chicken Breast', dianihuva: 2, brayan: 14, rivas: 18 },
    { name: 'AM Beef', dianihuva: 1, brayan: 13, rivas: 15 },
    { name: 'Sophie\'s Spicy Chicken Sandwich', dianihuva: 1, brayan: 9, rivas: 12 },
    { name: 'AM Chicken', dianihuva: 1, brayan: 7, rivas: 9 },
    { name: 'AM Guava and Cheese', dianihuva: 3, brayan: 8, rivas: 5 }
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

  // Custom server bar chart
  const ServerBarChart = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {serverData.map((item, index) => (
        <div key={index} style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.name}</div>
          </div>
          <div style={{ 
            width: '100%', 
            height: '24px', 
            backgroundColor: 'rgba(76, 176, 176, 0.1)', 
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            <div 
              style={{ 
                height: '100%', 
                width: `${item.value}%`, 
                backgroundColor: '#4CB0B0', 
                borderRadius: '12px',
                transition: 'width 0.8s ease'
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );

  // Custom top selling items chart
  const TopSellingItemsChart = () => (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {topSellingItems.map((item, index) => (
        <div key={index} style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '16px',
        }}>
          <div style={{ width: '45%', paddingRight: '8px' }}>
            <div style={{ fontSize: '14px', transition: 'color 0.2s ease' }} className="item-name">
              {item.name}
            </div>
          </div>
          <div style={{ width: '55%', display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
            {/* Dianihuva bar */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '12%' }}>
              <div 
                style={{ 
                  height: `${item.dianihuva * 6}px`, 
                  width: '100%',
                  minHeight: '5px',
                  maxWidth: '20px',
                  backgroundColor: '#4CB0B0',
                  borderRadius: '3px 3px 0 0',
                  transition: 'height 0.8s ease'
                }}
              />
            </div>
            
            {/* Brayan bar */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '12%' }}>
              <div 
                style={{ 
                  height: `${item.brayan * 6}px`, 
                  width: '100%',
                  minHeight: '5px',
                  maxWidth: '20px',
                  backgroundColor: '#4CB0B0',
                  borderRadius: '3px 3px 0 0',
                  transition: 'height 0.8s ease'
                }}
              />
            </div>
            
            {/* Rivas bar */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '12%' }}>
              <div 
                style={{ 
                  height: `${item.rivas * 6}px`, 
                  width: '100%',
                  minHeight: '5px',
                  maxWidth: '20px',
                  backgroundColor: '#4CB0B0',
                  borderRadius: '3px 3px 0 0',
                  transition: 'height 0.8s ease'
                }}
              />
            </div>
          </div>
        </div>
      ))}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        gap: '16px',
        paddingTop: '8px', 
        borderTop: '1px solid #e0e0e0'
      }}>
        <div style={{ fontSize: '12px', fontWeight: '500' }}>Dianihuva</div>
        <div style={{ fontSize: '12px', fontWeight: '500' }}>Brayan</div>
        <div style={{ fontSize: '12px', fontWeight: '500' }}>Rivas</div>
      </div>
    </div>
  );

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

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      width: '100%', 
      gap: '24px', 
      padding: '16px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
      {/* First row - Stats Cards + Sales by Menu Group */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
        {/* Stats Cards in left half */}
        <div style={{ width: 'calc(50% - 12px)', minWidth: '300px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <div style={{ 
              padding: '24px', 
              borderRadius: '8px', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'flex-start',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              backgroundColor: 'white',
            }}
            className="stat-card"
            >
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1e88e5' }}>$46.46</div>
              <div style={{ fontSize: '16px', color: '#666' }}>Net Sales</div>
            </div>

            <div style={{ 
              padding: '24px', 
              borderRadius: '8px', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'flex-start',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              backgroundColor: 'white',
            }}
            className="stat-card"
            >
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#7cb342' }}>7</div>
              <div style={{ fontSize: '16px', color: '#666' }}>Orders</div>
            </div>

            <div style={{ 
              padding: '24px', 
              borderRadius: '8px', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'flex-start',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              backgroundColor: 'white',
            }}
            className="stat-card"
            >
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#fb8c00' }}>11</div>
              <div style={{ fontSize: '16px', color: '#666' }}>Qty Sold</div>
            </div>
          </div>

          {/* Menu Group Chart below stats cards */}
          <div style={{ 
            padding: '16px', 
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            backgroundColor: 'white',
          }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
              Sales by Menu Group
            </div>
            <div style={{ height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={menuGroupData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 20]} ticks={[0, 5, 10, 15, 20]} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: 8, 
                      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                      border: 'none' 
                    }} 
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#4CB0B0" 
                    barSize={30} 
                    radius={[4, 4, 0, 0]}
                    animationDuration={1500}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Category Pie Charts on right */}
        <div style={{ width: 'calc(50% - 12px)', minWidth: '300px', flexGrow: 1 }}>
          <div style={{ 
            padding: '16px', 
            borderRadius: '8px',
            height: '100%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            backgroundColor: 'white',
          }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
              Sales by Category
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '16px'
            }}>
              {/* First pie chart */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '200px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={category1Data}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        labelLine={false}
                        label={renderCustomizedLabel}
                      >
                        {category1Data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <CategoryLegend data={category1Data} />
              </div>

              {/* Second pie chart */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '200px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={category2Data}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        labelLine={false}
                        label={renderCustomizedLabel}
                      >
                        {category2Data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <CategoryLegend data={category2Data} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Second row - Sales by Server and Top Selling Items */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
        {/* Sales by Server - Fixed without empty space */}
        <div style={{ width: 'calc(50% - 12px)', minWidth: '300px' }}>
          <div style={{ 
            padding: '16px', 
            borderRadius: '8px',
            height: '100%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            backgroundColor: 'white',
          }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
              Sales by Server
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {serverData.map((item, index) => (
                <div key={index} style={{ display: 'flex', flexDirection: 'column', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.name}</div>
                  </div>
                  <div style={{ 
                    width: '100%', 
                    height: '24px', 
                    backgroundColor: 'rgba(76, 176, 176, 0.1)', 
                    borderRadius: '12px',
                    overflow: 'hidden'
                  }}>
                    <div 
                      style={{ 
                        height: '100%', 
                        width: `${item.value}%`, 
                        backgroundColor: '#4CB0B0', 
                        borderRadius: '12px',
                        transition: 'width 0.8s ease'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Selling Items - Reduced gap between items */}
        <div style={{ width: 'calc(50% - 12px)', minWidth: '300px', flexGrow: 1 }}>
          <div style={{ 
            padding: '16px', 
            borderRadius: '8px',
            height: '100%', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            backgroundColor: 'white',
          }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
              Top Selling Items
            </div>
            
            <div style={{ 
              display: 'flex',
              flexDirection: 'row'
            }}>
              {/* Item names on left side with reduced gaps */}
              <div style={{ 
                width: '40%', 
                borderRight: '1px solid #f5f5f5',
                paddingRight: '10px'
              }}>
                {topSellingItems.map((item, index) => (
                  <div key={index} style={{ 
                    borderBottom: '1px solid #eee',
                    paddingTop: '8px',
                    paddingBottom: '8px',
                    fontSize: '16px',
                    fontWeight: '400'
                  }}>
                    {item.name}
                  </div>
                ))}
              </div>
              
              {/* Bar graph on right side */}
              <div style={{ 
                width: '60%', 
                position: 'relative',
                height: '230px'
              }}>
                {/* Horizontal grid lines */}
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div key={i} style={{
                    position: 'absolute',
                    left: '0',
                    right: '0',
                    top: `${i * 46}px`,
                    height: '1px',
                    backgroundColor: '#eee',
                    zIndex: 1
                  }}></div>
                ))}
                
                {/* Dianihuva Bar */}
                <div style={{
                  position: 'absolute',
                  left: '25%',
                  bottom: '30px',
                  width: '36px',
                  height: '80px',
                  backgroundColor: '#1c7d7e',
                  zIndex: 2
                }}></div>
                
                {/* Brayan Bar */}
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  bottom: '30px',
                  width: '36px',
                  height: '150px',
                  backgroundColor: '#1c7d7e',
                  zIndex: 2
                }}></div>
                
                {/* Rivas Bar */}
                <div style={{
                  position: 'absolute',
                  left: '75%',
                  bottom: '30px',
                  width: '36px',
                  height: '200px',
                  backgroundColor: '#1c7d7e',
                  zIndex: 2
                }}></div>
                
                {/* Server names at the bottom */}
                <div style={{
                  position: 'absolute',
                  left: '15%',
                  right: '0',
                  bottom: '5px',
                  display: 'flex',
                  justifyContent: 'space-around'
                }}>
                  <div style={{ fontSize: '15px' }}>Dianihuva</div>
                  <div style={{ fontSize: '15px' }}>Brayan</div>
                  <div style={{ fontSize: '15px' }}>Rivas</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add CSS to make the component more interactive
const style = document.createElement('style');
style.textContent = `
  .stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0,0,0,0.12);
  }
  .legend-item:hover {
    background-color: rgba(76, 176, 176, 0.1);
  }
  .item-name:hover {
    color: #4CB0B0;
    font-weight: 500;
  }
`;
document.head.appendChild(style);

export default SalesDashboard;
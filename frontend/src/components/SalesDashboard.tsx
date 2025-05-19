import React from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  LabelList, Legend, Tooltip
} from 'recharts';
import { Box, Paper, Typography, useTheme } from '@mui/material';

const SalesDashboard = () => {
  const theme = useTheme();
  
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
    { name: '', value: 30 }
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {serverData.map((item, index) => (
        <Box key={index} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="body2">{item.name}</Typography>
          </Box>
          <Box sx={{ 
            width: '100%', 
            height: '24px', 
            bgcolor: 'grey.100', 
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            <Box 
              sx={{ 
                height: '100%', 
                width: `${item.value}%`, 
                bgcolor: '#4CB0B0', 
                borderRadius: '12px' 
              }}
            />
          </Box>
        </Box>
      ))}
    </Box>
  );

  // Custom top selling items chart
  const TopSellingItemsChart = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      {topSellingItems.map((item, index) => (
        <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ width: '50%', pr: 1 }}>
            <Typography variant="body2">{item.name}</Typography>
          </Box>
          <Box sx={{ width: '50%', display: 'flex', alignItems: 'flex-end', gap: 0.5 }}>
            {/* Dianihuva bar */}
            <Box 
              sx={{ 
                height: `${item.dianihuva * 5}px`, 
                width: '20px',
                minHeight: '5px',
                bgcolor: '#4CB0B0',
                borderRadius: 1
              }}
            />
            {/* Brayan bar */}
            <Box 
              sx={{ 
                height: `${item.brayan * 5}px`, 
                width: '20px',
                minHeight: '5px',
                bgcolor: '#4CB0B0',
                borderRadius: 1
              }}
            />
            {/* Rivas bar */}
            <Box 
              sx={{ 
                height: `${item.rivas * 5}px`, 
                width: '20px',
                minHeight: '5px',
                bgcolor: '#4CB0B0',
                borderRadius: 1
              }}
            />
          </Box>
        </Box>
      ))}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        pt: 1, 
        borderTop: `1px solid ${theme.palette.divider}` 
      }}>
        <Typography variant="body2">Dianihuva</Typography>
        <Typography variant="body2">Brayan</Typography>
        <Typography variant="body2">Rivas</Typography>
      </Box>
    </Box>
  );

  // Category legend component
  const CategoryLegend = ({ data }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
      {data.map((entry, index) => (
        <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
          <Box 
            sx={{ 
              width: '12px', 
              height: '12px', 
              borderRadius: '50%', 
              mr: 1,
              bgcolor: entry.color
            }}
          />
          <Typography variant="body2">{entry.name}</Typography>
          <Typography variant="body2" sx={{ ml: 'auto' }}>{entry.value}%</Typography>
        </Box>
      ))}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 3 }}>
      {/* Top Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
        <Paper sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <Typography variant="h4" fontWeight="bold">$46.46</Typography>
          <Typography variant="h6">Net Sales</Typography>
        </Paper>
        <Paper sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <Typography variant="h4" fontWeight="bold">7</Typography>
          <Typography variant="h6">Orders</Typography>
        </Paper>
        <Paper sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <Typography variant="h4" fontWeight="bold">11</Typography>
          <Typography variant="h6">Qty Sold</Typography>
        </Paper>
      </Box>

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: {
          xs: '1fr',
          md: 'repeat(2, 1fr)'
        },
        gap: 2
      }}>
        {/* Sales by Menu Group */}
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Sales by Menu Group
          </Typography>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={menuGroupData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis domain={[0, 20]} ticks={[0, 5, 10, 15, 20]} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#4CB0B0" barSize={30} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>

        {/* Sales by Category */}
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Sales by Category
          </Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: 2
          }}>
            {/* First pie chart */}
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ height: 200 }}>
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
              </Box>
              <CategoryLegend data={category1Data} />
            </Box>

            {/* Second pie chart */}
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ height: 200 }}>
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
              </Box>
              <CategoryLegend data={category2Data} />
            </Box>
          </Box>
        </Paper>
      </Box>

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: {
          xs: '1fr',
          md: 'repeat(2, 1fr)'
        },
        gap: 2
      }}>
        {/* Sales by Server */}
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Sales by Server
          </Typography>
          <ServerBarChart />
        </Paper>

        {/* Top Selling Items */}
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Top Selling Items
          </Typography>
          <TopSellingItemsChart />
        </Paper>
      </Box>
    </Box>
  );
};

export default SalesDashboard;
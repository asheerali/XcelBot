import React from 'react';
import {
  BarChart, Bar, PieChart, Pie, LineChart, Cell, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label
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
    { name: 'Catering', value: 31 },
    { name: '31%', value: 56 },
    { name: 'DD', value: 5 },
  ];
  const COLORS = ['#4D8D8D', '#7DCBC4', '#2D5F5F'];

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

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Sales Card */}
        <div className="bg-white rounded-lg shadow-md p-4 transition-all duration-300 hover:shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Total Sales</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={totalSalesData}
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}k`]} />
                <Bar dataKey="sales" fill="#4D8D8D" barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-xl font-semibold text-gray-700">$45,40 k</div>
        </div>

        {/* Sales Category Card */}
        <div className="bg-white rounded-lg shadow-md p-4 transition-all duration-300 hover:shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Sales Category</h2>
          <div className="h-64 flex items-center justify-center">
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
                  label={({ name, value }) => `${name} ${value}%`}
                >
                  {salesCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* % of In-House Card */}
        <div className="bg-white rounded-lg shadow-md p-4 transition-all duration-300 hover:shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">% of In-House</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={inHousePercentData}
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="week" />
                <YAxis tickFormatter={(value) => `${value}%`} domain={[0, 40]} />
                <Tooltip formatter={(value) => [`${value}%`]} />
                <Bar dataKey="percent" fill="#4D8D8D" barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-gray-700">0%</span>
            <span className="text-gray-700">20%</span>
            <span className="text-gray-700">40%</span>
          </div>
        </div>

        {/* in-House Card */}
        <div className="bg-white rounded-lg shadow-md p-4 transition-all duration-300 hover:shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">in-House</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={inHouseData}
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="week" />
                <YAxis tickFormatter={(value) => `${value}%`} domain={[15, 25]} />
                <Tooltip formatter={(value) => [`${value}%`]} />
                <Bar dataKey="percent" fill="#4D8D8D" barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-gray-700">15%</span>
            <span className="text-gray-700">20%</span>
            <span className="text-gray-700">25%</span>
          </div>
        </div>
      </div>

      {/* WOW Trends Card - Full Width */}
      <div className="bg-white rounded-lg shadow-md p-4 mt-4 transition-all duration-300 hover:shadow-lg">
        <h3 className="text-base font-medium text-gray-700 mb-2">Week-over Week ($: WOW) Trends</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={wowTrendsData}
              margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
              barCategoryGap={5}
              barGap={0}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="week" />
              <YAxis 
                tickFormatter={(value) => `${value}%`} 
                domain={[-75, 265]}
              />
              <Tooltip formatter={(value) => [`${value}%`]} />
              <Legend />
              <Bar dataKey="Estimates" fill="#4D8D8D" barSize={5} stackId="a" />
              <Bar dataKey="Catering" fill="#2D5F5F" barSize={5} stackId="b" />
              <Bar dataKey="InHouse" fill="#7DCBC4" barSize={5} stackId="c" />
              <Bar dataKey="DD" fill="#FFCE56" barSize={5} stackId="d" />
              <Bar dataKey="CIV" fill="#9FE2E0" barSize={5} stackId="e" />
              <Bar dataKey="UB" fill="#8BC34A" barSize={5} stackId="f" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SalesSplitDashboard;
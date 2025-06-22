import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { styled, alpha } from '@mui/material/styles';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import RefreshIcon from '@mui/icons-material/Refresh';
import BarChartIcon from '@mui/icons-material/BarChart';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, ComposedChart } from 'recharts';

// Import the external DateRangeSelector component
import DateRangeSelector from './DateRangeSelector';

// Date utility functions
const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  
  if (formatStr === 'yyyy-MM-dd') {
    const monthNum = (date.getMonth() + 1).toString().padStart(2, '0');
    const dayNum = day.toString().padStart(2, '0');
    return `${year}-${monthNum}-${dayNum}`;
  }
  
  return `${month} ${day}, ${year}`;
};

// Enhanced mock data based on the image
const mockDailyOrdersData = [
  { date: 'Jan 4', orders: 320, movingAvg: 310 },
  { date: 'Jan 7', orders: 380, movingAvg: 315 },
  { date: 'Jan 11', orders: 290, movingAvg: 320 },
  { date: 'Jan 16', orders: 420, movingAvg: 325 },
  { date: 'Jan 21', orders: 450, movingAvg: 340 },
  { date: 'Jan 25', orders: 380, movingAvg: 345 },
  { date: 'Feb 1', orders: 360, movingAvg: 350 },
  { date: 'Feb 5', orders: 400, movingAvg: 355 },
  { date: 'Feb 11', orders: 430, movingAvg: 365 },
  { date: 'Feb 16', orders: 390, movingAvg: 370 },
  { date: 'Feb 21', orders: 410, movingAvg: 375 },
  { date: 'Mar 1', orders: 340, movingAvg: 370 },
  { date: 'Mar 11', orders: 370, movingAvg: 365 },
  { date: 'Mar 21', orders: 390, movingAvg: 360 },
  { date: 'Apr 1', orders: 420, movingAvg: 365 },
  { date: 'Apr 11', orders: 450, movingAvg: 375 },
  { date: 'Apr 21', orders: 380, movingAvg: 380 },
  { date: 'May 1', orders: 410, movingAvg: 385 },
  { date: 'May 14', orders: 440, movingAvg: 390 },
  { date: 'May 21', orders: 360, movingAvg: 385 },
  { date: 'Jun 1', orders: 390, movingAvg: 380 },
  { date: 'Jun 11', orders: 320, movingAvg: 375 }
];

const mockAvgOrderData = [
  { date: 'Jan 4', avgOrder: 45, movingAvg: 48 },
  { date: 'Jan 7', avgOrder: 52, movingAvg: 49 },
  { date: 'Jan 11', avgOrder: 38, movingAvg: 47 },
  { date: 'Jan 16', avgOrder: 65, movingAvg: 50 },
  { date: 'Jan 21', avgOrder: 71, movingAvg: 54 },
  { date: 'Jan 25', avgOrder: 55, movingAvg: 55 },
  { date: 'Feb 1', avgOrder: 48, movingAvg: 56 },
  { date: 'Feb 5', avgOrder: 62, movingAvg: 57 },
  { date: 'Feb 11', avgOrder: 58, movingAvg: 58 },
  { date: 'Feb 16', avgOrder: 43, movingAvg: 56 },
  { date: 'Feb 21', avgOrder: 69, movingAvg: 58 },
  { date: 'Mar 1', avgOrder: 51, movingAvg: 57 },
  { date: 'Mar 11', avgOrder: 44, movingAvg: 55 },
  { date: 'Mar 21', avgOrder: 66, movingAvg: 57 },
  { date: 'Apr 1', avgOrder: 59, movingAvg: 58 },
  { date: 'Apr 11', avgOrder: 47, movingAvg: 57 },
  { date: 'Apr 21', avgOrder: 63, movingAvg: 58 },
  { date: 'May 1', avgOrder: 72, movingAvg: 61 },
  { date: 'May 14', avgOrder: 54, movingAvg: 60 },
  { date: 'May 21', avgOrder: 41, movingAvg: 58 },
  { date: 'Jun 1', avgOrder: 67, movingAvg: 59 },
  { date: 'Jun 11', avgOrder: 49, movingAvg: 58 }
];

const mockDailySalesData = [
  { date: 'Jan 7', sales: 7800, movingAvg: 7200 },
  { date: 'Jan 16', sales: 6800, movingAvg: 7000 },
  { date: 'Jan 25', sales: 8200, movingAvg: 7100 },
  { date: 'Feb 4', sales: 7600, movingAvg: 7200 },
  { date: 'Feb 12', sales: 8800, movingAvg: 7400 },
  { date: 'Feb 21', sales: 11200, movingAvg: 7800 },
  { date: 'Mar 3', sales: 8400, movingAvg: 8000 },
  { date: 'Mar 12', sales: 7200, movingAvg: 7900 },
  { date: 'Mar 22', sales: 9200, movingAvg: 8100 },
  { date: 'Apr 1', sales: 8600, movingAvg: 8200 },
  { date: 'Apr 10', sales: 6800, movingAvg: 8000 },
  { date: 'Apr 19', sales: 10800, movingAvg: 8300 },
  { date: 'Apr 30', sales: 9600, movingAvg: 8500 },
  { date: 'May 10', sales: 10400, movingAvg: 8700 },
  { date: 'May 19', sales: 8800, movingAvg: 8600 },
  { date: 'May 30', sales: 7400, movingAvg: 8400 },
  { date: 'Jun 11', sales: 8200, movingAvg: 8300 }
];

// Styled components matching your design pattern
const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, 
    ${theme.palette.primary.main}20 0%, 
    ${theme.palette.secondary.main}15 50%, 
    ${theme.palette.primary.light}10 100%)`,
  padding: theme.spacing(4, 0, 3),
  borderRadius: '0 0 24px 24px',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'><circle cx=\'20\' cy=\'20\' r=\'2\' fill=\'%23ffffff\' opacity=\'0.1\'/><circle cx=\'80\' cy=\'40\' r=\'1.5\' fill=\'%23ffffff\' opacity=\'0.1\'/><circle cx=\'60\' cy=\'80\' r=\'1\' fill=\'%23ffffff\' opacity=\'0.1\'/></svg>")',
    backgroundSize: '100px 100px',
    pointerEvents: 'none'
  }
}));

const ModernCard = styled(Card)(({ theme }) => ({
  borderRadius: '20px',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  background: `linear-gradient(145deg, 
    ${theme.palette.background.paper} 0%, 
    ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
  backdropFilter: 'blur(10px)',
  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 16px 48px ${alpha(theme.palette.primary.main, 0.15)}`
  }
}));

const MetricCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  background: `linear-gradient(145deg, 
    ${theme.palette.background.paper} 0%, 
    ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
  backdropFilter: 'blur(10px)',
  boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.08)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-6px)',
    boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.15)}`
  }
}));

const ChartCard = styled(Card)(({ theme }) => ({
  borderRadius: '20px',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  background: `linear-gradient(135deg, 
    ${theme.palette.primary.main} 0%, 
    ${theme.palette.secondary.main} 100%)`,
  backdropFilter: 'blur(10px)',
  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.2)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 16px 48px ${alpha(theme.palette.primary.main, 0.25)}`
  }
}));

const WhiteChartCard = styled(Card)(({ theme }) => ({
  borderRadius: '20px',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  background: theme.palette.background.paper,
  backdropFilter: 'blur(10px)',
  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 16px 48px ${alpha(theme.palette.primary.main, 0.15)}`
  }
}));

const FloatingElement = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  background: theme.palette.primary.main,
  opacity: 0.3,
  animation: 'float 6s ease-in-out infinite',
  '@keyframes float': {
    '0%, 100%': { transform: 'translateY(0px)' },
    '50%': { transform: 'translateY(-20px)' }
  }
}));

// DateRangeSelector Button Component
const DateRangeSelectorButton = ({ onDateRangeSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState('Date Range');
  const [tempRange, setTempRange] = useState(null);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => {
    setIsOpen(false);
    setTempRange(null);
  };

  const handleDateRangeSelect = (range) => {
    setTempRange(range);
  };

  const handleApply = () => {
    if (tempRange) {
      const startDate = formatDate(tempRange.startDate);
      const endDate = formatDate(tempRange.endDate);
      setSelectedRange(`${startDate} - ${endDate}`);
      onDateRangeSelect(tempRange);
    }
    setIsOpen(false);
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<CalendarTodayIcon />}
        onClick={handleOpen}
        sx={{
          borderRadius: '12px',
          px: 3,
          py: 1,
          bgcolor: alpha('#fff', 0.9),
          border: '1px solid',
          borderColor: alpha('#1976d2', 0.3),
          '&:hover': {
            bgcolor: '#fff',
            borderColor: '#1976d2'
          }
        }}
      >
        {selectedRange}
      </Button>

      <Dialog
        open={isOpen}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: '80vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid #e0e0e0',
          pb: 2
        }}>
          Select Date Range
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          <DateRangeSelector 
            initialState={[
              {
                startDate: new Date(),
                endDate: new Date(),
                key: 'selection'
              }
            ]}
            onSelect={handleDateRangeSelect} 
          />
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 2,
          borderTop: '1px solid #e0e0e0',
          justifyContent: 'flex-end'
        }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              onClick={handleClose}
              color="secondary"
              variant="outlined"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleApply} 
              variant="contained" 
              color="primary"
              disabled={!tempRange}
            >
              Apply
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
};

// Metric Card Component
const MetricCardComponent = ({ title, value, change, changeType, icon: Icon, color = 'primary' }) => {
  const isPositive = changeType === 'positive';
  
  return (
    <MetricCard>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" color="text.secondary" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
            {title}
          </Typography>
          <Box sx={{ 
            p: 1, 
            borderRadius: '50%', 
            bgcolor: `${color}.50`, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <Icon sx={{ fontSize: 20, color: `${color}.main` }} />
          </Box>
        </Box>
        
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
          {value}
        </Typography>
        
        {change && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {isPositive ? (
              <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
            ) : (
              <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main' }} />
            )}
            <Typography 
              variant="body2" 
              sx={{ 
                color: isPositive ? 'success.main' : 'error.main',
                fontWeight: 600 
              }}
            >
              {change}% vs last period
            </Typography>
          </Box>
        )}
      </CardContent>
    </MetricCard>
  );
};

// Chart Card Component for white background charts
const WhiteChartCardComponent = ({ title, subtitle, children, height = 300 }) => (
  <WhiteChartCard>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      <Box sx={{ height }}>
        {children}
      </Box>
    </CardContent>
  </WhiteChartCard>
);

// Chart Card Component for colored background charts
const ChartCardComponent = ({ title, subtitle, children, height = 300 }) => (
  <ChartCard>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'white', mb: 0.5 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ opacity: 0.8, color: 'white' }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      <Box sx={{ height }}>
        {children}
      </Box>
    </CardContent>
  </ChartCard>
);

// Header Component
const DashboardHeader = ({ onDateRangeSelect, onRefresh }) => (
  <HeroSection>
    <Container maxWidth="lg">
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
        position: 'relative',
        zIndex: 1
      }}>
        <Box>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 700,
              color: '#1a237e',
              fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.8rem' },
              background: 'linear-gradient(135deg, #1a237e 0%, #1976d2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}
          >
            Sales Analytics
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'text.secondary',
              fontSize: { xs: '0.95rem', sm: '1.1rem' },
              fontWeight: 400,
              lineHeight: 1.6
            }}
          >
            Track and analyze your sales performance with moving average trends
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <DateRangeSelectorButton onDateRangeSelect={onDateRangeSelect} />
          
          <IconButton 
            onClick={onRefresh} 
            sx={{ 
              color: 'text.secondary',
              bgcolor: alpha('#fff', 0.8),
              '&:hover': {
                bgcolor: '#fff'
              }
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>
    </Container>
  </HeroSection>
);

// Main Analytics Dashboard Component
export function AnalyticsComponent() {
  const [selectedDateRange, setSelectedDateRange] = useState(null);
  
  const handleDateRangeSelect = (range) => {
    setSelectedDateRange(range);
    console.log('Selected date range:', range);
    // Here you would typically make an API call with the selected date range
    // Example: fetchAnalyticsData(range.startDateStr, range.endDateStr);
  };
  
  const handleRefresh = () => {
    console.log('Refresh clicked');
    // Here you would typically refresh the data
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(180deg, #fafafa 0%, #ffffff 100%)' }}>
      {/* Floating decorative elements */}
      <FloatingElement sx={{ top: '15%', left: '8%', animationDelay: '0s' }} />
      <FloatingElement sx={{ top: '40%', right: '12%', animationDelay: '2s' }} />
      <FloatingElement sx={{ bottom: '25%', left: '15%', animationDelay: '4s' }} />
      
      <DashboardHeader 
        onDateRangeSelect={handleDateRangeSelect}
        onRefresh={handleRefresh}
      />
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        {/* Display selected date range info */}
      
        {/* Metrics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCardComponent
              title="Total Sales"
              value="$968,878.9"
              change={null}
              changeType="positive"
              icon={AttachMoneyIcon}
              color="primary"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <MetricCardComponent
              title="Total Orders"
              value="47,088"
              change={null}
              changeType="positive"
              icon={ShoppingCartIcon}
              color="primary"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <MetricCardComponent
              title="Avg Order Value"
              value="$20.58"
              change={null}
              changeType="negative"
              icon={BarChartIcon}
              color="primary"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <MetricCardComponent
              title="Total Guests"
              value="47,088"
              change={null}
              changeType="positive"
              icon={PeopleIcon}
              color="primary"
            />
          </Grid>
        </Grid>
        
        {/* Charts Row */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <WhiteChartCardComponent
              title="Daily Orders"
              subtitle="Daily order count with red moving average trend line"
              height={280}
            >
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={mockDailyOrdersData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#666', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#666', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #ddd', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="orders" 
                    fill="#7B68EE"
                    radius={[2, 2, 0, 0]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="movingAvg" 
                    stroke="#FF4444" 
                    strokeWidth={3}
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </WhiteChartCardComponent>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <WhiteChartCardComponent
              title="Average Order Value"
              subtitle="Line bar chart with red moving average trend line"
              height={280}
            >
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={mockAvgOrderData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#666', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#666', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #ddd', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value, name) => [`$${value.toFixed(2)}`, name === 'avgOrder' ? 'Avg Order Value' : 'Moving Average']}
                  />
                  <Bar 
                    dataKey="avgOrder" 
                    fill="#90EE90"
                    radius={[2, 2, 0, 0]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="movingAvg" 
                    stroke="#FF4444" 
                    strokeWidth={3}
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </WhiteChartCardComponent>
          </Grid>
        </Grid>
        
        {/* Full Width Chart */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <WhiteChartCardComponent
              title="Daily Sales Trends"
              subtitle="Daily sales with red moving average trend line"
              height={350}
            >
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={mockDailySalesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#666', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#666', fontSize: 12 }}
                    tickFormatter={(value) => `${value/1000}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #ddd', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value, name) => [`${value.toLocaleString()}`, name === 'sales' ? 'Sales' : 'Moving Average']}
                  />
                  <Bar 
                    dataKey="sales" 
                    fill="#7B68EE"
                    radius={[2, 2, 0, 0]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="movingAvg" 
                    stroke="#FF4444" 
                    strokeWidth={3}
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </WhiteChartCardComponent>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

// Export the component for use in other parts of the application
export default AnalyticsComponent;
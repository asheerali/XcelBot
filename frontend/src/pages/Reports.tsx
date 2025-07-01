import React, { useState } from 'react';
import {
  Box,
  Card,
  Grid,
  Paper,
  Button,
  Typography,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tab,
  Tabs,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Select,
  MenuItem,
  InputLabel
} from '@mui/material';
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Info,
  ChevronDown
} from 'lucide-react';
import { styled, alpha } from '@mui/material/styles';
// Import your DateRangeSelector component
import DateRangeSelector from "../components/DateRangeSelector";

// Date utility functions
const formatDate = (date, formatStr) => {
  if (formatStr === 'yyyy-MM-dd') {
    return date.toISOString().split('T')[0];
  }
  
  const options = {
    'MMM dd, yyyy': { year: 'numeric', month: 'short', day: '2-digit' },
    'MMM dd': { month: 'short', day: '2-digit' }
  };
  
  return date.toLocaleDateString('en-US', options[formatStr] || options['MMM dd, yyyy']);
};

// Styled components matching the modern design
const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, 
    ${theme.palette.primary.main}15 0%, 
    ${theme.palette.secondary.main}10 50%, 
    ${theme.palette.primary.light}08 100%)`,
  padding: theme.spacing(4, 0),
  borderRadius: '0 0 24px 24px',
  position: 'relative',
  overflow: 'hidden'
}));

const ModernCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
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
  padding: theme.spacing(3),
  borderRadius: '16px',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  background: `linear-gradient(145deg, 
    ${theme.palette.background.paper} 0%, 
    ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  height: '100%',
  '&:hover': {
    transform: 'translateY(-6px)',
    boxShadow: `0 16px 40px ${alpha(theme.palette.primary.main, 0.15)}`
  }
}));

const DateRangeButton = styled(Button)(({ theme }) => ({
  borderRadius: '20px',
  padding: theme.spacing(1, 2),
  border: `2px solid ${theme.palette.primary.main}`,
  background: 'transparent',
  color: theme.palette.primary.main,
  textTransform: 'none',
  fontWeight: 500,
  minWidth: '140px',
  '&:hover': {
    background: alpha(theme.palette.primary.main, 0.05),
    border: `2px solid ${theme.palette.primary.dark}`
  }
}));

const PriceChangeFilterSelect = styled(FormControl)(({ theme }) => ({
  minWidth: 200,
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    border: `2px solid ${theme.palette.primary.main}`,
    backgroundColor: 'transparent',
    '&:hover': {
      borderColor: theme.palette.primary.dark
    },
    '&.Mui-focused': {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`
    }
  },
  '& .MuiInputLabel-root': {
    fontWeight: 600,
    color: theme.palette.text.primary,
    '&.Mui-focused': {
      color: theme.palette.primary.main
    }
  }
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
    height: 3,
    borderRadius: '3px 3px 0 0'
  }
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '0.95rem',
  minHeight: 48,
  color: theme.palette.text.secondary,
  '&.Mui-selected': {
    color: theme.palette.primary.main,
    fontWeight: 600
  }
}));

// Enhanced DateRangeModal Component that wraps your DateRangeSelector
const DateRangeModal = ({ isOpen, onClose, onSelect }) => {
  const [tempSelectedRange, setTempSelectedRange] = useState(null);

  const handleDateRangeSelect = (range) => {
    // Store the selected range temporarily, don't close modal yet
    setTempSelectedRange(range);
  };

  const handleApply = () => {
    // Apply the selected range and close modal
    if (tempSelectedRange) {
      onSelect(tempSelectedRange);
    }
    onClose();
  };

  const handleCancel = () => {
    // Reset temp selection and close modal
    setTempSelectedRange(null);
    onClose();
  };

  const handleModalClose = (event, reason) => {
    // Prevent closing on backdrop click or escape key
    if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
      return;
    }
    handleCancel();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleModalClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          boxShadow: '0 16px 48px rgba(0,0,0,0.15)',
          border: '1px solid rgba(0,0,0,0.1)',
          m: 2,
          height: '80vh',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      {/* Header - Fixed */}
      <Box sx={{ 
        p: 3, 
        borderBottom: '1px solid', 
        borderColor: 'divider',
        flexShrink: 0
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Calendar size={24} color="#1976d2" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Select Date Range for Orders
          </Typography>
        </Box>
      </Box>

      {/* DateRangeSelector Content - Scrollable */}
      <Box sx={{ 
        flex: 1,
        overflow: 'auto',
        '& .DateRangeSelector': {
          height: '100%'
        }
      }}>
        <DateRangeSelector
          onSelect={handleDateRangeSelect}
        />
      </Box>

      {/* Footer - Fixed at bottom */}
      <Box sx={{ 
        p: 3, 
        borderTop: '1px solid', 
        borderColor: 'divider',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: alpha('#f5f5f5', 0.3),
        flexShrink: 0
      }}>
        <Typography variant="body2" color="text.secondary">
          {tempSelectedRange ? (
            `${formatDate(tempSelectedRange.startDate, 'MMM dd, yyyy')} - ${formatDate(tempSelectedRange.endDate, 'MMM dd, yyyy')}`
          ) : (
            'Select a date range'
          )}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            onClick={handleCancel}
            sx={{ 
              textTransform: 'none',
              color: '#1976d2',
              fontWeight: 500,
              px: 3,
              py: 1
            }}
          >
            CANCEL
          </Button>
          <Button
            onClick={handleApply}
            variant="contained"
            disabled={!tempSelectedRange}
            sx={{ 
              textTransform: 'none',
              fontWeight: 500,
              px: 3,
              py: 1,
              backgroundColor: tempSelectedRange ? '#1976d2' : '#ccc',
              color: 'white',
              '&:hover': {
                backgroundColor: tempSelectedRange ? '#1565c0' : '#bbb'
              },
              '&:disabled': {
                backgroundColor: '#ccc',
                color: 'white'
              }
            }}
          >
            APPLY RANGE
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

// Main Dashboard Component
const Reports = () => {
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    startDateStr: formatDate(new Date(), 'yyyy-MM-dd'),
    endDateStr: formatDate(new Date(), 'yyyy-MM-dd')
  });
  const [activeTab, setActiveTab] = useState(0);
  const [priceChangeFilter, setPriceChangeFilter] = useState('all');

  const handleDateRangeClick = () => {
    setDateRangeOpen(true);
  };

  const handleDateRangeClose = () => {
    setDateRangeOpen(false);
  };

  const handleDateRangeSelect = (range) => {
    setSelectedDateRange(range);
    setDateRangeOpen(false);
  };

  const handlePriceFilterChange = (event) => {
    setPriceChangeFilter(event.target.value);
  };

  const formatDateRange = () => {
    if (selectedDateRange.startDateStr === selectedDateRange.endDateStr) {
      return formatDate(selectedDateRange.startDate, 'MMM dd, yyyy');
    }
    return `${formatDate(selectedDateRange.startDate, 'MMM dd')} - ${formatDate(selectedDateRange.endDate, 'MMM dd, yyyy')}`;
  };

  const mockData = [
    {
      id: '12OZCO_7415',
      description: '12 oz coffee cup',
      store: 'Unknown Store',
      changePercent: '+1.71%',
      oldPrice: 2.34,
      newPrice: 2.38,
      change: '+$0.04',
      date: 'Jun 24, 2025',
      isIncrease: true
    },
    {
      id: '12OZCO_5802',
      description: '12 oz coffee cup',
      store: 'Midtown East',
      changePercent: '+2.93%',
      oldPrice: 2.39,
      newPrice: 2.46,
      change: '+$0.07',
      date: 'Jun 30, 2025',
      isIncrease: true
    },
    {
      id: '16OZCO_5802',
      description: '16 oz coffee cup',
      store: 'Midtown East',
      changePercent: '+2.14%',
      oldPrice: 2.34,
      newPrice: 2.39,
      change: '+$0.05',
      date: 'Jun 30, 2025',
      isIncrease: true
    },
    // Add some decrease examples
    {
      id: '20OZCO_1234',
      description: '20 oz coffee cup',
      store: 'Downtown Brooklyn',
      changePercent: '-1.50%',
      oldPrice: 3.00,
      newPrice: 2.95,
      change: '-$0.05',
      date: 'Jun 29, 2025',
      isIncrease: false
    },
    {
      id: '16OZCO_5678',
      description: '16 oz coffee cup',
      store: 'Upper West Side',
      changePercent: '-3.20%',
      oldPrice: 2.50,
      newPrice: 2.42,
      change: '-$0.08',
      date: 'Jun 28, 2025',
      isIncrease: false
    }
  ];

  // Filter data based on price change filter
  const filteredData = mockData.filter(item => {
    if (priceChangeFilter === 'all') return true;
    if (priceChangeFilter === 'increase') return item.isIncrease;
    if (priceChangeFilter === 'decrease') return !item.isIncrease;
    return true;
  });

  const tabs = ['Price Changes', 'Trend Analysis', 'Store Comparison'];

  const trendAnalysisData = [
    { id: '12OZCO_5802', store: 'Midtown East', changePercent: '+2.93%' },
    { id: '16OZCO_5802', store: 'Midtown East', changePercent: '+2.14%' },
    { id: '12OZCO_7415', store: 'Unknown Store', changePercent: '+1.71%' }
  ];

  const storeComparisonData = [
    { name: 'Upper West Side', totalChanges: 0, increases: 0, decreases: 0 },
    { name: 'Park Slope', totalChanges: 0, increases: 0, decreases: 0 },
    { name: 'Test 4', totalChanges: 0, increases: 0, decreases: 0 },
    { name: 'Downtown Brooklyn', totalChanges: 0, increases: 0, decreases: 0 },
    { name: 'tes 8', totalChanges: 0, increases: 0, decreases: 0 },
    { name: 'store 9', totalChanges: 0, increases: 0, decreases: 0 },
    { name: 'st', totalChanges: 0, increases: 0, decreases: 0 },
    { name: 'tst7 Store', totalChanges: 0, increases: 0, decreases: 0 },
    { name: 'Test 8', totalChanges: 0, increases: 0, decreases: 0 },
    { name: 'All 2', totalChanges: 0, increases: 0, decreases: 0 },
    { name: 'Midtown East', totalChanges: 2, increases: 2, decreases: 0 },
    { name: '25', totalChanges: 0, increases: 0, decreases: 0 }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp size={24} color="#1976d2" />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a237e' }}>
                  Recent Price Changes
                </Typography>
              </Box>
              
              {/* Price Change Filter */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#1a237e' }}>
                  Price Change Filter
                </Typography>
                <PriceChangeFilterSelect>
                  <InputLabel>Filter</InputLabel>
                  <Select
                    value={priceChangeFilter}
                    onChange={handlePriceFilterChange}
                    label="Filter"
                    displayEmpty
                  >
                    <MenuItem value="all">All Changes</MenuItem>
                    <MenuItem value="increase">Price Increases</MenuItem>
                    <MenuItem value="decrease">Price Decreases</MenuItem>
                  </Select>
                </PriceChangeFilterSelect>
              </Box>
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: '12px', boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
              <Table>
                <TableHead sx={{ bgcolor: alpha('#1976d2', 0.05) }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Item</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Store</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Change</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary' }}>Price</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary' }}>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData.map((item, index) => (
                    <TableRow key={index} sx={{ '&:hover': { bgcolor: alpha('#1976d2', 0.02) } }}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            {item.id}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.description}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {item.store}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${item.isIncrease ? '↑' : '↓'} ${item.changePercent}`}
                          size="small"
                          sx={{
                            backgroundColor: item.isIncrease ? alpha('#4caf50', 0.1) : alpha('#f44336', 0.1),
                            color: item.isIncrease ? '#4caf50' : '#f44336',
                            fontWeight: 600,
                            borderRadius: '8px'
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            ${item.oldPrice.toFixed(2)} → ${item.newPrice.toFixed(2)}
                          </Typography>
                          <Typography variant="caption" sx={{ color: item.isIncrease ? '#4caf50' : '#f44336' }}>
                            {item.change}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="text.secondary">
                          {item.date}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {filteredData.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No {priceChangeFilter === 'increase' ? 'price increases' : priceChangeFilter === 'decrease' ? 'price decreases' : 'price changes'} found for the selected period.
                </Typography>
              </Box>
            )}
          </Box>
        );
      
      case 1:
        return (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <TrendingUp size={24} color="#1976d2" />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a237e' }}>
                Trend Analysis
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {/* Price Increase Trends */}
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 3, borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#1a237e' }}>
                    Price Increase Trends
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {trendAnalysisData.map((item, index) => (
                      <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: alpha('#f5f5f5', 0.5), borderRadius: '12px' }}>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {item.id}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.store}
                          </Typography>
                        </Box>
                        <Chip
                          label={item.changePercent}
                          sx={{
                            backgroundColor: alpha('#f44336', 0.1),
                            color: '#f44336',
                            fontWeight: 600,
                            borderRadius: '20px'
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                </Card>
              </Grid>

              {/* Price Decrease Trends */}
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 3, borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#1a237e' }}>
                    Price Decrease Trends
                  </Typography>
                  <Box sx={{ p: 6, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                      No price decreases in the selected period
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );
      
      case 2:
        return (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <DollarSign size={24} color="#1976d2" />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a237e' }}>
                Store-by-Store Analysis
              </Typography>
            </Box>

            <Grid container spacing={2}>
              {storeComparisonData.map((store, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card sx={{ p: 3, borderRadius: '12px', border: '1px solid', borderColor: 'divider', height: '100%' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1a237e' }}>
                      {store.name}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Total Changes:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {store.totalChanges}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Increases:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#f44336' }}>
                          {store.increases}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Decreases:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#4caf50' }}>
                          {store.decreases}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );
      
      default:
        return null;
    }
  };

  const metricCards = [
    {
      title: 'Total Items Tracked',
      value: filteredData.length.toString(),
      subtitle: 'Items with price changes',
      icon: <Info size={20} color="#6c757d" />
    },
    {
      title: 'Price Increases',
      value: filteredData.filter(item => item.isIncrease).length.toString(),
      subtitle: `Avg: ${filteredData.filter(item => item.isIncrease).length > 0 ? '2.26%' : '0.00%'}`,
      icon: <TrendingUp size={20} color="#4caf50" />,
      valueColor: '#4caf50'
    },
    {
      title: 'Price Decreases',
      value: filteredData.filter(item => !item.isIncrease).length.toString(),
      subtitle: `Avg: ${filteredData.filter(item => !item.isIncrease).length > 0 ? '2.35%' : '0.00%'}`,
      icon: <TrendingDown size={20} color="#f44336" />,
      valueColor: '#f44336'
    },
    {
      title: 'Total Value Impact',
      value: filteredData.length > 0 ? '$0.16' : '$0.00',
      subtitle: filteredData.length > 0 ? 'Cost increase' : 'No impact',
      icon: <DollarSign size={20} color="#1976d2" />,
      valueColor: '#f44336'
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa' }}>
      {/* Header */}
      <HeroSection>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 700,
                  color: '#1a237e',
                  fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.8rem' },
                  background: 'linear-gradient(135deg, #1a237e 0%, #1976d2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                OrderIQ Dashboard
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'text.secondary',
                  fontSize: { xs: '0.95rem', sm: '1.1rem' },
                  fontWeight: 400,
                  mt: 1
                }}
              >
                Manage your orders and track analytics with intelligent insights
              </Typography>
            </Box>
            
            {/* Date Range Picker */}
            <DateRangeButton
              onClick={handleDateRangeClick}
              startIcon={<Calendar size={16} />}
            >
              Date Range
            </DateRangeButton>
            
            <DateRangeModal
              isOpen={dateRangeOpen}
              onClose={handleDateRangeClose}
              onSelect={handleDateRangeSelect}
            />
          </Box>
        </Container>
      </HeroSection>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
        {/* Metrics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {metricCards.map((card, index) => (
            <Grid item xs={12} sm={6} lg={3} key={index}>
              <MetricCard>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {card.title}
                  </Typography>
                  {card.icon}
                </Box>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700, 
                    mb: 0.5,
                    color: card.valueColor || 'text.primary'
                  }}
                >
                  {card.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.subtitle}
                </Typography>
              </MetricCard>
            </Grid>
          ))}
        </Grid>

        {/* Navigation Tabs and Content */}
        <ModernCard>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <StyledTabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
              {tabs.map((tab, index) => (
                <StyledTab key={index} label={tab} />
              ))}
            </StyledTabs>
          </Box>

          {/* Tab Content */}
          {renderTabContent()}
        </ModernCard>
      </Container>
    </Box>
  );
};

export default Reports;
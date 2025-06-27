import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  Badge,
  Paper,
  Chip,
  Container
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  ShoppingCart as ShoppingCartIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  Receipt as ReceiptIcon,
  FilterList as FilterListIcon,
  CalendarToday as CalendarTodayIcon,
  Clear as ClearIcon
} from '@mui/icons-material';

// Import your existing FiltersOrderIQ component and DateRangeSelector
import FiltersOrderIQ from '../components/FiltersOrderIQ'; // Adjust the import path as needed
import DateRangeSelector from '../components/DateRangeSelector'; // Adjust the import path as needed

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
      const startDate = tempRange.startDate.toLocaleDateString();
      const endDate = tempRange.endDate.toLocaleDateString();
      setSelectedRange(`${startDate} - ${endDate}`);
      onDateRangeSelect(tempRange);
    }
    setIsOpen(false);
  };

  const handleClear = (event) => {
    event.stopPropagation();
    setSelectedRange('Date Range');
    onDateRangeSelect(null);
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<CalendarTodayIcon />}
        endIcon={selectedRange !== 'Date Range' && (
          <IconButton 
            size="small" 
            onClick={handleClear}
            style={{ padding: '2px', marginLeft: '4px' }}
          >
            <ClearIcon style={{ fontSize: '16px' }} />
          </IconButton>
        )}
        onClick={handleOpen}
        sx={{
          borderRadius: 2,
          textTransform: 'none',
          minWidth: '180px',
          justifyContent: 'flex-start',
          borderColor: 'primary.main',
          '&:hover': {
            borderColor: 'primary.dark'
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
            borderRadius: 3,
            maxHeight: '80vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid #e0e0e0',
          pb: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5
        }}>
          <CalendarTodayIcon color="primary" />
          Select Date Range for Orders
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
          p: 3,
          borderTop: '1px solid #e0e0e0',
          justifyContent: 'space-between'
        }}>
          <Typography variant="body2" color="text.secondary">
            {tempRange && `${tempRange.startDate?.toLocaleDateString()} - ${tempRange.endDate?.toLocaleDateString()}`}
          </Typography>
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
              Apply Range
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
};

// Mock data for available items
const availableItems = [
  { id: '12OZCO_7415', name: '12 oz coffee cup', price: 2.34, unit: 'Bag' },
  { id: '12OZCO_5802', name: '12 oz coffee cup', price: 2.34, unit: 'Bag' },
  { id: '12OZCO_0996', name: '12 oz coffee cup', price: 2.34, unit: 'Bag' },
  { id: '16OZCO_7415', name: '16 oz coffee cup', price: 2.30, unit: 'Bag' },
  { id: '16OZCO_5802', name: '16 oz coffee cup', price: 2.30, unit: 'Bag' }
];

// Mock data for recent orders with detailed items
const recentOrders = [
  { 
    id: 1, 
    items: 1, 
    total: 38.08, 
    avg: 92.38, 
    qty: 16, 
    date: '24/06/2025',
    orderItems: [
      { id: '12OZCO_7415', name: '12 oz coffee cup', price: 2.34, unit: 'Bag', quantity: 16 }
    ]
  },
  { 
    id: 2, 
    items: 6, 
    total: 435.84, 
    avg: 513.62, 
    qty: 32, 
    date: '21/06/2025',
    orderItems: [
      { id: '12OZCO_7415', name: '12 oz coffee cup', price: 2.34, unit: 'Bag', quantity: 10 },
      { id: '16OZCO_7415', name: '16 oz coffee cup', price: 2.30, unit: 'Bag', quantity: 8 },
      { id: '12OZCO_5802', name: '12 oz coffee cup', price: 2.34, unit: 'Bag', quantity: 5 },
      { id: '16OZCO_5802', name: '16 oz coffee cup', price: 2.30, unit: 'Bag', quantity: 4 },
      { id: '12OZCO_0996', name: '12 oz coffee cup', price: 2.34, unit: 'Bag', quantity: 3 },
      { id: '12OZCO_7415', name: '12 oz coffee cup', price: 2.34, unit: 'Bag', quantity: 2 }
    ]
  },
  { 
    id: 3, 
    items: 2, 
    total: 4.68, 
    avg: 92.34, 
    qty: 2, 
    date: '21/06/2025',
    orderItems: [
      { id: '12OZCO_7415', name: '12 oz coffee cup', price: 2.34, unit: 'Bag', quantity: 1 },
      { id: '16OZCO_7415', name: '16 oz coffee cup', price: 2.30, unit: 'Bag', quantity: 1 }
    ]
  },
  { 
    id: 4, 
    items: 4, 
    total: 276.74, 
    avg: 512.58, 
    qty: 22, 
    date: '16/06/2025',
    orderItems: [
      { id: '12OZCO_7415', name: '12 oz coffee cup', price: 2.34, unit: 'Bag', quantity: 8 },
      { id: '16OZCO_7415', name: '16 oz coffee cup', price: 2.30, unit: 'Bag', quantity: 6 },
      { id: '12OZCO_5802', name: '12 oz coffee cup', price: 2.34, unit: 'Bag', quantity: 4 },
      { id: '16OZCO_5802', name: '16 oz coffee cup', price: 2.30, unit: 'Bag', quantity: 4 }
    ]
  },
  { 
    id: 5, 
    items: 6, 
    total: 91.87, 
    avg: 510.21, 
    qty: 9, 
    date: '14/06/2025',
    orderItems: [
      { id: '12OZCO_7415', name: '12 oz coffee cup', price: 2.34, unit: 'Bag', quantity: 3 },
      { id: '16OZCO_7415', name: '16 oz coffee cup', price: 2.30, unit: 'Bag', quantity: 2 },
      { id: '12OZCO_5802', name: '12 oz coffee cup', price: 2.34, unit: 'Bag', quantity: 2 },
      { id: '16OZCO_5802', name: '16 oz coffee cup', price: 2.30, unit: 'Bag', quantity: 1 },
      { id: '12OZCO_0996', name: '12 oz coffee cup', price: 2.34, unit: 'Bag', quantity: 1 },
      { id: '12OZCO_7415', name: '12 oz coffee cup', price: 2.34, unit: 'Bag', quantity: 0 }
    ]
  },
  { 
    id: 6, 
    items: 4, 
    total: 84.55, 
    avg: 512.08, 
    qty: 7, 
    date: '13/06/2025',
    orderItems: [
      { id: '12OZCO_7415', name: '12 oz coffee cup', price: 2.34, unit: 'Bag', quantity: 3 },
      { id: '16OZCO_7415', name: '16 oz coffee cup', price: 2.30, unit: 'Bag', quantity: 2 },
      { id: '12OZCO_5802', name: '12 oz coffee cup', price: 2.34, unit: 'Bag', quantity: 1 },
      { id: '16OZCO_5802', name: '16 oz coffee cup', price: 2.30, unit: 'Bag', quantity: 1 }
    ]
  },
  { 
    id: 7, 
    items: 2, 
    total: 16.42, 
    avg: 52.35, 
    qty: 7, 
    date: '11/06/2025',
    orderItems: [
      { id: '12OZCO_7415', name: '12 oz coffee cup', price: 2.34, unit: 'Bag', quantity: 4 },
      { id: '16OZCO_7415', name: '16 oz coffee cup', price: 2.30, unit: 'Bag', quantity: 3 }
    ]
  }
];

// Quantity Selection Dialog Component
const QuantityDialog = ({ open, onClose, item, onAdd }) => {
  const [quantity, setQuantity] = useState(1);

  const handleAdd = () => {
    onAdd(item, quantity);
    setQuantity(1);
    onClose();
  };

  const adjustQuantity = (delta) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Item to Order</DialogTitle>
      <DialogContent>
        <Box sx={{ py: 2 }}>
          <Typography variant="h6" gutterBottom>
            {item?.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            ${item?.price}/{item?.unit}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 3 }}>
            <Typography variant="body1">Quantity:</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton 
                onClick={() => adjustQuantity(-1)}
                size="small"
                disabled={quantity <= 1}
              >
                <RemoveIcon />
              </IconButton>
              <TextField
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                sx={{ width: 80 }}
                inputProps={{ style: { textAlign: 'center' } }}
                type="number"
                size="small"
              />
              <Typography variant="body2" sx={{ minWidth: 30 }}>
                {item?.unit}
              </Typography>
              <IconButton 
                onClick={() => adjustQuantity(1)}
                size="small"
              >
                <AddIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleAdd} variant="contained">Add to Order</Button>
      </DialogActions>
    </Dialog>
  );
};

// Main OrderIQ Dashboard Component
const OrderIQDashboard = () => {
  // State management
  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentOrder, setCurrentOrder] = useState([]);
  const [emailOrder, setEmailOrder] = useState(false);
  const [quantityDialog, setQuantityDialog] = useState({ open: false, item: null });
  
  // Date range selector state
  const [selectedDateRange, setSelectedDateRange] = useState(null);

  // Filter configuration for FiltersOrderIQ component
  const filterFields = [
    {
      key: 'location',
      label: 'Location',
      placeholder: 'Select Location',
      options: [
        { value: 'midtown-east', label: 'Midtown East' },
        { value: 'downtown', label: 'Downtown' },
        { value: 'uptown', label: 'Uptown' }
      ]
    },
    {
      key: 'companies',
      label: 'Companies',
      placeholder: 'Select Companies',
      options: [
        { value: 'company-a', label: 'Company A' },
        { value: 'company-b', label: 'Company B' },
        { value: 'company-c', label: 'Company C' }
      ]
    }
  ];

  // Event handlers
  const handleFilterChange = (fieldKey, values) => {
    setFilters(prev => ({ ...prev, [fieldKey]: values }));
  };

  const handleApplyFilters = () => {
    console.log('Applying filters:', filters);
    // Add your filter logic here
  };

  // Date range handler
  const handleDateRangeSelect = (range) => {
    setSelectedDateRange(range);
    console.log('Selected date range for orders:', range);
    // Here you would typically filter orders based on the selected date range
    // For example: filterOrdersByDateRange(range);
  };

  const handleAddToOrder = (item, quantity) => {
    setCurrentOrder(prev => {
      const existingIndex = prev.findIndex(orderItem => orderItem.id === item.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prev, { ...item, quantity }];
      }
    });
  };

  const handleRemoveFromOrder = (itemId) => {
    setCurrentOrder(prev => prev.filter(item => item.id !== itemId));
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromOrder(itemId);
      return;
    }
    setCurrentOrder(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const calculateOrderTotal = () => {
    return currentOrder.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleAddRecentOrderToCart = (recentOrder) => {
    // Add all items from the recent order to current order
    recentOrder.orderItems.forEach(item => {
      if (item.quantity > 0) { // Only add items with quantity > 0
        handleAddToOrder(item, item.quantity);
      }
    });
  };

  const handleSubmitOrder = () => {
    console.log('Submitting order:', currentOrder);
    console.log('Email order:', emailOrder);
    console.log('Date range:', selectedDateRange);
    // Add your order submission logic here
    alert('Order submitted successfully!');
    setCurrentOrder([]);
    setEmailOrder(false);
  };

  const filteredItems = availableItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header Section with Filters and Date Range */}
      <Box sx={{ mb: 3 }}>
        {/* Title and Date Range Selector */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
              OrderIQ Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your orders and track analytics with intelligent insights
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {selectedDateRange && (
              <Chip
                label={`${selectedDateRange.startDate?.toLocaleDateString()} - ${selectedDateRange.endDate?.toLocaleDateString()}`}
                color="primary"
                size="small"
                onDelete={() => setSelectedDateRange(null)}
                sx={{ fontSize: '0.75rem' }}
              />
            )}
            <DateRangeSelectorButton onDateRangeSelect={handleDateRangeSelect} />
          </Box>
        </Box>

        {/* Filters Section using your existing component */}
        <FiltersOrderIQ
          filterFields={filterFields}
          filters={filters}
          onFilterChange={handleFilterChange}
          onApplyFilters={handleApplyFilters}
          showApplyButton={true}
        />
      </Box>

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} lg={8}>
          {/* Store Analytics */}
          <Card sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <TrendingUpIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Store Analytics
                </Typography>
                {selectedDateRange && (
                  <Chip 
                    label="Filtered by date range" 
                    size="small" 
                    variant="outlined" 
                    color="primary"
                  />
                )}
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Paper 
                    sx={{ 
                      p: 3, 
                      background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                      borderRadius: 2,
                      textAlign: 'center'
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Avg Daily Order
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1565c0' }}>
                      $158.03
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper 
                    sx={{ 
                      p: 3, 
                      background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
                      borderRadius: 2,
                      textAlign: 'center'
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Orders
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                      25
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Top Items */}
          <Card sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  🏆 Top Items
                </Typography>
                {selectedDateRange && (
                  <Chip 
                    label="Date filtered" 
                    size="small" 
                    variant="outlined" 
                    color="primary"
                  />
                )}
              </Box>
              
              <List>
                <ListItem>
                  <ListItemText 
                    primary="#1 Unknown Item" 
                    secondary="93 orders"
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText 
                    primary="#2 12 oz coffee cup" 
                    secondary="2 orders"
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <ReceiptIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Recent Orders
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedDateRange ? 'Filtered by selected date range' : 'Last 7 orders for this location (all)'}
                </Typography>
                {selectedDateRange && (
                  <Chip 
                    label="Date filtered" 
                    size="small" 
                    variant="outlined" 
                    color="primary"
                  />
                )}
              </Box>

              <List>
                {recentOrders.map((order, index) => (
                  <React.Fragment key={order.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {order.items} item{order.items > 1 ? 's' : ''} ordered
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                ${order.total}
                              </Typography>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<AddIcon />}
                                onClick={() => handleAddRecentOrderToCart(order)}
                                sx={{ ml: 1 }}
                              >
                                Add to Cart
                              </Button>
                            </Box>
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                Qty: {order.qty} • {order.date}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                @${order.avg}
                              </Typography>
                            </Box>
                            {/* Order Items Preview */}
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                                Items:
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                {order.orderItems.slice(0, 3).map((item, itemIndex) => (
                                  <Chip
                                    key={itemIndex}
                                    label={`${item.name} (${item.quantity})`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontSize: '0.7rem', height: 20 }}
                                  />
                                ))}
                                {order.orderItems.length > 3 && (
                                  <Chip
                                    label={`+${order.orderItems.length - 3} more`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontSize: '0.7rem', height: 20, fontStyle: 'italic' }}
                                  />
                                )}
                              </Box>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < recentOrders.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Available Items */}
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Available Items
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Search and select items to add to your order
              </Typography>
              
              <TextField
                fullWidth
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
                sx={{ mb: 3 }}
              />

              <List>
                {filteredItems.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText
                        primary={item.name}
                        secondary={`${item.id} - $${item.price}/${item.unit}`}
                        primaryTypographyProps={{ fontWeight: 500 }}
                      />
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => setQuantityDialog({ open: true, item })}
                        sx={{ ml: 2 }}
                      >
                        Add
                      </Button>
                    </ListItem>
                    {index < filteredItems.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Current Order */}
        <Grid item xs={12} lg={4}>
          <Box sx={{ position: 'sticky', top: 20 }}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Badge badgeContent={currentOrder.length} color="primary">
                    <ShoppingCartIcon />
                  </Badge>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Current Order
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Store: Midtown East
                </Typography>

                {currentOrder.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <ShoppingCartIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                      Your order is empty
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Start adding items from the Available Items section to build your order
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => alert('AI suggestions feature coming soon!')}
                      >
                        🤖 Get AI Suggestions
                      </Button>
                      <Button 
                        variant="contained" 
                        size="small"
                        onClick={() => {
                          if (availableItems.length > 0) {
                            setQuantityDialog({ open: true, item: availableItems[0] });
                          }
                        }}
                      >
                        ➕ Add First Item
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <>
                    <List sx={{ mb: 2 }}>
                      {currentOrder.map((item, index) => (
                        <React.Fragment key={item.id}>
                          <ListItem sx={{ px: 0 }}>
                            <ListItemText
                              primary={item.name}
                              secondary={`$${item.price}/${item.unit}`}
                              primaryTypographyProps={{ fontWeight: 500 }}
                            />
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <IconButton 
                                size="small"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              >
                                <RemoveIcon />
                              </IconButton>
                              <Typography sx={{ minWidth: 30, textAlign: 'center', fontWeight: 500 }}>
                                {item.quantity}
                              </Typography>
                              <Typography variant="body2" sx={{ minWidth: 30, fontSize: '0.75rem' }}>
                                {item.unit}
                              </Typography>
                              <IconButton 
                                size="small"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              >
                                <AddIcon />
                              </IconButton>
                              <IconButton 
                                size="small"
                                color="error"
                                onClick={() => handleRemoveFromOrder(item.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </ListItem>
                          {index < currentOrder.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>

                    <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Order Total:
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                          ${calculateOrderTotal().toFixed(2)}
                        </Typography>
                      </Box>

                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={emailOrder}
                            onChange={(e) => setEmailOrder(e.target.checked)}
                          />
                        }
                        label="Email order details"
                        sx={{ mb: 2 }}
                      />

                      <Button 
                        variant="contained" 
                        fullWidth 
                        size="large"
                        startIcon={<ReceiptIcon />}
                        sx={{ fontWeight: 600, py: 1.5 }}
                        onClick={handleSubmitOrder}
                      >
                        Submit Order
                      </Button>

                      {selectedDateRange && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                          Order period: {selectedDateRange.startDate?.toLocaleDateString()} - {selectedDateRange.endDate?.toLocaleDateString()}
                        </Typography>
                      )}
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>

      {/* Quantity Selection Dialog */}
      <QuantityDialog
        open={quantityDialog.open}
        onClose={() => setQuantityDialog({ open: false, item: null })}
        item={quantityDialog.item}
        onAdd={handleAddToOrder}
      />
    </Container>
  );
};

export default OrderIQDashboard;
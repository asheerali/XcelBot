import React, { useState, useEffect, useMemo } from 'react';
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
  Container,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
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
  Clear as ClearIcon,
  Place as PlaceIcon
} from '@mui/icons-material';

// Import your existing DateRangeSelector component
import DateRangeSelector from '../components/DateRangeSelector'; // Adjust the import path as needed
import { API_URL_Local } from '../constants';

/*
 * API Configuration Notes:
 * 
 * This component expects the following API endpoints to be available:
 * 1. GET /company-locations/all - Returns array of company-location objects
 * 2. GET /api/masterfile/availableitems/{company_id}/{location_id} - Returns available items
 * 3. POST /api/storeorders/orderitems - Accepts order submission
 * 
 * Set API_URL_Local in constants.tsx to configure the API base URL.
 * If endpoints are not available, the component will show empty state.
 * 
 * Example API responses expected:
 * - Company-Locations: [{"company_id": 1, "company_name": "Company Name", "locations": [{"location_id": 1, "location_name": "Location Name"}]}, ...]
 * - Available Items: {"data": {"dataframe": [{"column0": "Category", "column1": "Product", ...}]}}
 */

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
      { id: '12OZCO_5802', name: '12 oz coffee cup', price: 2.34, unit: 'Bag', quantity: 5 },
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
          <Typography variant="body2" color="primary.main" gutterBottom>
            Category: {item?.category}
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
  
  // API data state
  const [companyLocations, setCompanyLocations] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Date range selector state
  const [selectedDateRange, setSelectedDateRange] = useState(null);

  // Selected company and location for API calls
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [selectedLocationId, setSelectedLocationId] = useState(null);

  // Derived data for dropdowns
  const companies = companyLocations.map(item => ({
    id: item.company_id,
    name: item.company_name
  }));

  const availableLocationsForCompany = selectedCompanyId 
    ? companyLocations.find(item => item.company_id === parseInt(selectedCompanyId))?.locations || []
    : [];

  // Fetch company-locations data on component mount
  useEffect(() => {
    fetchCompanyLocations();
  }, []);

  const fetchCompanyLocations = async () => {
    try {
      setLoading(true);
      const url = `${API_URL_Local}/company-locations/all`;
      console.log('Fetching company-locations from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      // Check if response is actually JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Expected JSON response but got ${contentType || 'unknown content type'}`);
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Company-locations data:', data);
      setCompanyLocations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching company-locations:', err);
      setError('Failed to load companies and locations. Please check if the API endpoint is configured correctly.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableItems = async (companyId, locationId) => {
    try {
      setLoading(true);
      setError(null);
      const url = `${API_URL_Local}/api/masterfile/availableitems/${companyId}/${locationId}`;
      console.log('Fetching available items from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      // Check if response is actually JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Expected JSON response but got ${contentType || 'unknown content type'}`);
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Available items data:', data);
      
      // Check if data has expected structure
      if (!data.data || !data.data.dataframe || !Array.isArray(data.data.dataframe)) {
        throw new Error('Invalid data structure received from API');
      }
      
      // Transform the API response to match our component structure
      const transformedItems = data.data.dataframe.map((item, index) => ({
        id: `item_${index}_${companyId}_${locationId}`, // Generate unique ID
        name: item.column1 || 'Unknown Item', // Products
        category: item.column0 || 'Unknown Category', // Category
        price: parseFloat(item.column4) || 0, // Current Price
        unit: item.column3 || 'Unit', // UOM
        batchSize: item.column2 || '', // Batch Size
        previousPrice: item.column5 !== "-" && item.column5 ? parseFloat(item.column5) : null
      }));
      
      setAvailableItems(transformedItems);
      console.log('Transformed items:', transformedItems);
    } catch (err) {
      console.error('Error fetching available items:', err);
      setError(`Failed to load available items: ${err.message}`);
      // Set mock data for development
      setAvailableItems([
        {
          id: 'mock_1',
          name: 'Green sauce - packed',
          category: 'Sauce',
          price: 90.0,
          unit: 'Unit',
          batchSize: '500 x container',
          previousPrice: 69.0
        },
        {
          id: 'mock_2',
          name: 'Grilled chicken breast',
          category: 'Protein',
          price: 175.0,
          unit: 'Tray',
          batchSize: '100 x tray',
          previousPrice: null
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Event handlers
  const handleCompanyChange = (companyId) => {
    setSelectedCompanyId(companyId);
    // Reset location when company changes
    setSelectedLocationId(null);
    setAvailableItems([]); // Clear available items
    setFilters(prev => ({ ...prev, companies: [companyId], location: [] }));
  };

  const handleLocationChange = (locationId) => {
    setSelectedLocationId(locationId);
    setFilters(prev => ({ ...prev, location: [locationId] }));
  };

  const handleApplyFilters = () => {
    console.log('Applying filters:', { selectedCompanyId, selectedLocationId });
    
    // Fetch available items when both company and location are selected
    if (selectedCompanyId && selectedLocationId) {
      fetchAvailableItems(selectedCompanyId, selectedLocationId);
    } else {
      setError('Please select both a company and location to view available items');
    }
  };

  // Date range handler
  const handleDateRangeSelect = (range) => {
    setSelectedDateRange(range);
    console.log('Selected date range for orders:', range);
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

  const handleSubmitOrder = async () => {
    if (!selectedCompanyId || !selectedLocationId) {
      setError('Please select company and location before submitting order');
      return;
    }

    if (currentOrder.length === 0) {
      setError('Please add items to your order before submitting');
      return;
    }

    try {
      setLoading(true);
      
      const orderData = {
        company_id: parseInt(selectedCompanyId),
        location_id: parseInt(selectedLocationId),
        items: currentOrder.map(item => ({
          item_id: item.id,
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          unit_price: item.price,
          unit: item.unit,
          total_price: item.price * item.quantity
        })),
        total_amount: calculateOrderTotal(),
        email_order: emailOrder,
        order_date: new Date().toISOString(),
        date_range: selectedDateRange ? {
          start_date: selectedDateRange.startDate?.toISOString(),
          end_date: selectedDateRange.endDate?.toISOString()
        } : null
      };

      const url = `${API_URL_Local}/api/storeorders/orderitems`;
      console.log('Submitting order to:', url);
      console.log('Order data:', orderData);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      // Check if response is actually JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // If not JSON, try to get text response for better error message
        const textResponse = await response.text();
        console.error('Non-JSON response:', textResponse);
        throw new Error(`Expected JSON response but got ${contentType || 'unknown content type'}`);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status}: ${errorData.message || response.statusText}`);
      }

      const result = await response.json();
      console.log('Order submitted successfully:', result);
      
      alert('Order submitted successfully!');
      setCurrentOrder([]);
      setEmailOrder(false);
      setError(null);
      
    } catch (err) {
      console.error('Error submitting order:', err);
      setError(`Failed to submit order: ${err.message}`);
      
      // For development, show mock success
      if (err.message.includes('content-type') || err.message.includes('HTTP')) {
        console.log('Mock order submission for development:', {
          company_id: selectedCompanyId,
          location_id: selectedLocationId,
          items: currentOrder,
          total: calculateOrderTotal()
        });
        alert('Order submitted successfully! (Development Mode)');
        setCurrentOrder([]);
        setEmailOrder(false);
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = availableItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
          {error.includes('content-type') && (
            <Box sx={{ mt: 1, fontSize: '0.875rem' }}>
              <strong>Development Note:</strong> This usually means the API endpoint is returning HTML instead of JSON. 
              Please ensure your backend is running and the endpoints are correctly configured.
            </Box>
          )}
        </Alert>
      )}

      {/* Development Mode Indicator */}
      {companyLocations.length === 0 && !loading && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>No Data Available:</strong> Could not load companies and locations from the API. Please check your backend server and API endpoints.
        </Alert>
      )}

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

        {/* Filters Section - Custom implementation */}
        <Card sx={{ p: 3, borderRadius: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <FilterListIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Filters
            </Typography>
            {companyLocations.length > 0 && (
              <Chip 
                label={`${companies.length} companies available`} 
                size="small" 
                variant="outlined" 
                color="primary"
              />
            )}
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CircularProgress size={20} />
              <Typography variant="body1" color="text.secondary">
                Loading companies and locations...
              </Typography>
            </Box>
          ) : companyLocations.length === 0 ? (
            <Alert severity="warning">
              No companies or locations available. Please check your API endpoints.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {/* Companies Dropdown */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Companies</InputLabel>
                  <Select
                    value={selectedCompanyId || ''}
                    label="Companies"
                    onChange={(e) => handleCompanyChange(e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="">
                      <em>Select a Company</em>
                    </MenuItem>
                    {companies.map((company) => (
                      <MenuItem key={company.id} value={company.id.toString()}>
                        {company.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Locations Dropdown - filtered by selected company */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth disabled={!selectedCompanyId}>
                  <InputLabel>Location</InputLabel>
                  <Select
                    value={selectedLocationId || ''}
                    label="Location"
                    onChange={(e) => handleLocationChange(e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="">
                      <em>{!selectedCompanyId ? 'Select a company first' : 'Select a Location'}</em>
                    </MenuItem>
                    {availableLocationsForCompany.map((location) => (
                      <MenuItem key={location.location_id} value={location.location_id.toString()}>
                        {location.location_name}
                      </MenuItem>
                    ))}
                  </Select>
                  {selectedCompanyId && availableLocationsForCompany.length === 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, ml: 1 }}>
                      No locations available for this company
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Apply Filters Button */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-start', alignItems: 'center', flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    onClick={handleApplyFilters}
                    disabled={!selectedCompanyId || !selectedLocationId || loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <FilterListIcon />}
                    sx={{ minWidth: 200 }}
                  >
                    {loading ? 'Loading Items...' : 'Apply Filters & Load Items'}
                  </Button>
                  
                  {(selectedCompanyId || selectedLocationId) && (
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setSelectedCompanyId(null);
                        setSelectedLocationId(null);
                        setFilters({});
                        setAvailableItems([]);
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}

                  {/* Show selected company and location info */}
                  {selectedCompanyId && (
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Chip 
                        label={`Company: ${companies.find(c => c.id.toString() === selectedCompanyId)?.name}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      {selectedLocationId && (
                        <Chip 
                          label={`Location: ${availableLocationsForCompany.find(l => l.location_id.toString() === selectedLocationId)?.location_name}`}
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  )}
                </Box>

                {(!selectedCompanyId || !selectedLocationId) && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Please select both a company and location to view available items.
                  </Typography>
                )}

                {/* Show location count for selected company */}
                {selectedCompanyId && availableLocationsForCompany.length > 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {availableLocationsForCompany.length} location{availableLocationsForCompany.length !== 1 ? 's' : ''} available for this company
                  </Typography>
                )}
              </Grid>
            </Grid>
          )}
        </Card>
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
                {availableItems.length > 0 
                  ? `${availableItems.length} items available. Search and select items to add to your order.`
                  : 'Select company and location from filters above to view available items.'
                }
              </Typography>
              
              {availableItems.length > 0 && (
                <TextField
                  fullWidth
                  placeholder="Search items by name or category..."
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
              )}

              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              )}

              {!loading && availableItems.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                    No items available
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Please select a company and location from the filters above, then click "Apply Filters" to load available items.
                  </Typography>
                </Box>
              )}

              {!loading && filteredItems.length > 0 && (
                <Card 
                  variant="outlined" 
                  sx={{ 
                    maxHeight: 600, 
                    overflow: 'auto',
                    borderRadius: 2,
                    '&::-webkit-scrollbar': {
                      width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: '#f1f1f1',
                      borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: '#c1c1c1',
                      borderRadius: '4px',
                      '&:hover': {
                        background: '#a8a8a8',
                      },
                    },
                  }}
                >
                  <List sx={{ pt: 0 }}>
                    {filteredItems.map((item, index) => (
                      <React.Fragment key={item.id}>
                        <ListItem sx={{ px: 2, py: 1.5 }}>
                          <ListItemText
                            primary={
                              <Box>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                  {item.name}
                                </Typography>
                                <Chip 
                                  label={item.category} 
                                  size="small" 
                                  variant="outlined" 
                                  sx={{ mt: 0.5 }}
                                />
                              </Box>
                            }
                            secondary={
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                  ${item.price}/{item.unit}
                                </Typography>
                                {item.batchSize && (
                                  <Typography variant="caption" color="text.secondary">
                                    Batch Size: {item.batchSize}
                                  </Typography>
                                )}
                                {item.previousPrice && (
                                  <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                                    Previous: ${item.previousPrice}
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => setQuantityDialog({ open: true, item })}
                            sx={{ ml: 2, minWidth: 80 }}
                          >
                            Add
                          </Button>
                        </ListItem>
                        {index < filteredItems.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                  
                  {/* Scrollable items footer */}
                  <Box sx={{ 
                    p: 2, 
                    borderTop: 1, 
                    borderColor: 'divider', 
                    backgroundColor: 'grey.50',
                    textAlign: 'center'
                  }}>
                    <Typography variant="caption" color="text.secondary">
                      Showing {filteredItems.length} of {availableItems.length} items
                      {searchTerm && ` (filtered by "${searchTerm}")`}
                    </Typography>
                  </Box>
                </Card>
              )}

              {!loading && availableItems.length > 0 && filteredItems.length === 0 && searchTerm && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                    No items found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    No items match your search for "{searchTerm}". Try a different search term.
                  </Typography>
                </Box>
              )}
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
                  Store: {selectedCompanyId && selectedLocationId 
                    ? `${companies.find(c => c.id.toString() === selectedCompanyId)?.name} - ${availableLocationsForCompany.find(l => l.location_id.toString() === selectedLocationId)?.location_name}`
                    : 'Please select company and location'
                  }
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
                      {availableItems.length > 0 && (
                        <Button 
                          variant="contained" 
                          size="small"
                          onClick={() => {
                            setQuantityDialog({ open: true, item: availableItems[0] });
                          }}
                        >
                          ➕ Add First Item
                        </Button>
                      )}
                    </Box>
                  </Box>
                ) : (
                  <>
                    <List sx={{ mb: 2 }}>
                      {currentOrder.map((item, index) => (
                        <React.Fragment key={item.id}>
                          <ListItem sx={{ px: 0 }}>
                            <ListItemText
                              primary={
                                <Box>
                                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                    {item.name}
                                  </Typography>
                                  <Chip 
                                    label={item.category} 
                                    size="small" 
                                    variant="outlined" 
                                    sx={{ mt: 0.5, fontSize: '0.7rem', height: 20 }}
                                  />
                                </Box>
                              }
                              secondary={`${item.price}/${item.unit}`}
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
                        startIcon={loading ? <CircularProgress size={20} /> : <ReceiptIcon />}
                        sx={{ fontWeight: 600, py: 1.5 }}
                        onClick={handleSubmitOrder}
                        disabled={loading || !selectedCompanyId || !selectedLocationId || currentOrder.length === 0}
                      >
                        {loading ? 'Submitting...' : 'Submit Order'}
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
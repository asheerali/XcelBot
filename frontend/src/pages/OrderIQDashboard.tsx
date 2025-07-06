import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
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

// Import Redux actions and selectors
import {
  setSelectedCompanies,
  setSelectedLocations,
  selectSelectedCompanies,
  selectSelectedLocations
} from '../store/slices/masterFileSlice'; // Adjust path as needed

import { API_URL_Local } from '../constants';
import apiClient from "../api/axiosConfig";

// Import your actual DateRangeSelector component
import DateRangeSelector from '../components/DateRangeSelector'; // Adjust path as needed

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

// Update Order Dialog Component
const UpdateOrderDialog = ({ open, onClose, order, onConfirm }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ 
        borderBottom: '1px solid #e0e0e0',
        pb: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5
      }}>
        <ReceiptIcon color="primary" />
        Update Order #{order?.id}
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Order Details
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Original Date: {order?.date}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Company: {order?.company_name}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Location: {order?.location_name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Original Total: ${order?.total?.toFixed(2)}
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            The order items have been loaded into your current order basket. 
            You can modify quantities, add new items, or remove items before updating.
          </Typography>
        </Alert>

        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          Original Items:
        </Typography>
        <List dense>
          {order?.orderItems?.map((item, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={item.name}
                secondary={`${item.quantity} ${item.unit} × ${item.unit_price || item.price} = ${item.total_price || (item.quantity * (item.unit_price || item.price)).toFixed(2)}`}
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
        <Button onClick={onClose} color="secondary" variant="outlined">
          Cancel Update
        </Button>
        <Button onClick={onConfirm} variant="contained" color="primary">
          Continue to Update
        </Button>
      </DialogActions>
    </Dialog>
  );
};

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
  // Redux hooks
  const dispatch = useDispatch();
  const reduxSelectedCompanies = useSelector(selectSelectedCompanies);
  const reduxSelectedLocations = useSelector(selectSelectedLocations);

  // State management
  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentOrder, setCurrentOrder] = useState([]);
  const [emailOrder, setEmailOrder] = useState(false);
  const [quantityDialog, setQuantityDialog] = useState({ open: false, item: null });
  const [updateOrderDialog, setUpdateOrderDialog] = useState({ open: false, order: null });
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);
  const [orderToUpdate, setOrderToUpdate] = useState(null);
  
  // API data state
  const [companyLocations, setCompanyLocations] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [error, setError] = useState(null);
  
  // Date range selector state
  const [selectedDateRange, setSelectedDateRange] = useState(null);

  // Selected company and location for API calls - Initialize from Redux
  const [selectedCompanyId, setSelectedCompanyId] = useState(() => {
    return reduxSelectedCompanies.length > 0 ? reduxSelectedCompanies[0] : null;
  });
  
  const [selectedLocationId, setSelectedLocationId] = useState(() => {
    return reduxSelectedLocations.length > 0 ? reduxSelectedLocations[0] : null;
  });

  // Derived data for dropdowns
  const companies = companyLocations.map(item => ({
    id: item.company_id,
    name: item.company_name
  }));

  const availableLocationsForCompany = selectedCompanyId 
    ? companyLocations.find(item => item.company_id === parseInt(selectedCompanyId))?.locations || []
    : [];

  // Initialize component state from Redux on mount
  useEffect(() => {
    if (reduxSelectedCompanies.length > 0) {
      const companyId = reduxSelectedCompanies[0];
      setSelectedCompanyId(companyId);
      console.log('OrderIQ: Loaded company from Redux:', companyId);
    }
    
    if (reduxSelectedLocations.length > 0) {
      const locationId = reduxSelectedLocations[0];
      setSelectedLocationId(locationId);
      console.log('OrderIQ: Loaded location from Redux:', locationId);
    }
  }, [reduxSelectedCompanies, reduxSelectedLocations]);

  // Auto-fetch data when both company and location are available and company-locations are loaded
  useEffect(() => {
    if (selectedCompanyId && selectedLocationId && companyLocations.length > 0 && availableItems.length === 0) {
      console.log('OrderIQ: Auto-fetching data:', { 
        companyId: selectedCompanyId, 
        locationId: selectedLocationId 
      });
      
      // Only auto-fetch if we don't already have data
      fetchAvailableItems(selectedCompanyId, selectedLocationId);
      fetchRecentOrders(selectedCompanyId, selectedLocationId);
      fetchAnalytics(selectedCompanyId, selectedLocationId);
    }
  }, [selectedCompanyId, selectedLocationId, companyLocations.length]);

  // Fetch company-locations data on component mount
  useEffect(() => {
    fetchCompanyLocations();
  }, []);

  const fetchCompanyLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching company-locations...');
      
      const response = await apiClient.get('/company-locations/all');
      
      console.log('Company-locations API response:', response.data);
      
      // Check if data has the expected structure
      if (!Array.isArray(response.data)) {
        console.error('API response is not an array:', response.data);
        throw new Error('Invalid response format: expected array of companies');
      }
      
      // Validate the structure of each company
      const validCompanies = response.data.filter(company => {
        const isValid = company.company_id && company.company_name && Array.isArray(company.locations);
        if (!isValid) {
          console.warn('Invalid company structure:', company);
        }
        return isValid;
      });
      
      if (validCompanies.length === 0) {
        throw new Error('No valid companies found in response');
      }
      
      console.log('Valid companies found:', validCompanies.length);
      setCompanyLocations(validCompanies);
      
    } catch (err) {
      console.error('Error fetching company-locations:', err);
      
      // Provide specific error messages based on the error type
      let errorMessage = 'Failed to load companies and locations.';
      
      if (err.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Access forbidden. You do not have permission to view companies and locations.';
      } else if (err.response?.status === 404) {
        errorMessage = 'API endpoint not found. Please verify the company-locations/all endpoint exists.';
      } else if (err.response?.status === 500) {
        errorMessage = 'Server internal error. Please check the server logs.';
      } else if (err.code === 'NETWORK_ERROR' || err.message.includes('Network Error')) {
        errorMessage = 'Network error: Cannot connect to the API server. Please check if the server is running and the URL is correct.';
      }
      
      setError(errorMessage);
      
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentOrders = async (companyId, locationId, dateRange = null) => {
    try {
      setLoadingOrders(true);
      
      console.log('Fetching recent orders...', { companyId, locationId, dateRange });
      
      // Build URL with date range parameters if provided
      let url = `/api/storeorders/detailsrecent/${companyId}/${locationId}`;
      const params = new URLSearchParams();
      
      if (dateRange && dateRange.startDateStr && dateRange.endDateStr) {
        params.append('start_date', dateRange.startDateStr);
        params.append('end_date', dateRange.endDateStr);
        url += `?${params.toString()}`;
      }
      
      const response = await apiClient.get(url);
      
      console.log('Recent orders data:', response.data);
      
      // Check if data has expected structure
      if (!response.data.data || !Array.isArray(response.data.data)) {
        throw new Error('Invalid recent orders data structure received from API');
      }
      
      // Transform the API response to match our component structure
      const transformedOrders = response.data.data.map((order) => ({
        id: order.id,
        items: order.items_ordered?.total_items || 0,
        total: order.items_ordered?.items?.reduce((sum, item) => sum + item.total_price, 0) || 0,
        avg: order.items_ordered?.items?.length > 0 
          ? (order.items_ordered.items.reduce((sum, item) => sum + item.total_price, 0) / order.items_ordered.items.length) 
          : 0,
        qty: order.items_ordered?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
        date: new Date(order.created_at).toLocaleDateString('en-GB'),
        created_at: order.created_at,
        company_name: order.company_name,
        location_name: order.location_name,
        orderItems: order.items_ordered?.items?.map(item => ({
          id: item.item_id,
          name: item.name,
          price: item.unit_price,
          unit: item.unit,
          quantity: item.quantity,
          category: item.category,
          total_price: item.total_price
        })) || []
      }));
      
      setRecentOrders(transformedOrders);
      console.log('Transformed recent orders:', transformedOrders);
      
    } catch (err) {
      console.error('Error fetching recent orders:', err);
      let errorMessage = 'Failed to load recent orders.';
      
      if (err.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Access forbidden. You do not have permission to view recent orders.';
      }
      
      setError(errorMessage);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchAnalytics = async (companyId, locationId, dateRange = null) => {
    try {
      setLoadingAnalytics(true);
      
      console.log('Fetching analytics...', { companyId, locationId, dateRange });
      
      // Build URL with date range parameters if provided
      let url = `/api/storeorders/analytics/${companyId}/${locationId}`;
      const params = new URLSearchParams();
      
      if (dateRange && dateRange.startDateStr && dateRange.endDateStr) {
        params.append('start_date', dateRange.startDateStr);
        params.append('end_date', dateRange.endDateStr);
        url += `?${params.toString()}`;
      }
      
      const response = await apiClient.get(url);
      
      console.log('Analytics data:', response.data);
      
      if (!response.data.data) {
        throw new Error('Invalid analytics data structure received from API');
      }
      
      setAnalyticsData(response.data.data);
      
    } catch (err) {
      console.error('Error fetching analytics:', err);
      let errorMessage = 'Failed to load analytics.';
      
      if (err.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Access forbidden. You do not have permission to view analytics.';
      }
      
      setError(errorMessage);
      setAnalyticsData(null);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const fetchAvailableItems = async (companyId, locationId) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching available items...');
      
      const response = await apiClient.get(`/api/masterfile/availableitems/${companyId}/${locationId}`);
      
      console.log('Available items data:', response.data);
      
      // Check if data has expected structure
      if (!response.data.data || !response.data.data.dataframe || !Array.isArray(response.data.data.dataframe)) {
        throw new Error('Invalid data structure received from API');
      }
      
      // Transform the API response to match our component structure
      const transformedItems = response.data.data.dataframe.map((item, index) => ({
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
      let errorMessage = 'Failed to load available items.';
      
      if (err.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Access forbidden. You do not have permission to view available items.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Event handlers - Updated to sync with Redux
  const handleCompanyChange = (companyId) => {
    console.log('OrderIQ: Company changed to:', companyId);
    
    setSelectedCompanyId(companyId);
    // Reset location when company changes
    setSelectedLocationId(null);
    setAvailableItems([]); // Clear available items
    setRecentOrders([]); // Clear recent orders
    setFilters(prev => ({ ...prev, companies: [companyId], location: [] }));
    
    // Update Redux - store as array to match the existing pattern
    dispatch(setSelectedCompanies(companyId ? [companyId] : []));
    dispatch(setSelectedLocations([])); // Clear locations when company changes
  };

  const handleLocationChange = (locationId) => {
    console.log('OrderIQ: Location changed to:', locationId);
    
    setSelectedLocationId(locationId);
    setFilters(prev => ({ ...prev, location: [locationId] }));
    
    // Update Redux - store as array to match the existing pattern
    dispatch(setSelectedLocations(locationId ? [locationId] : []));
    
    // Don't auto-fetch data - wait for user to click Apply Filters
  };

  const handleApplyFilters = () => {
    console.log('OrderIQ: Applying filters:', { selectedCompanyId, selectedLocationId, selectedDateRange });
    
    // Ensure date range is properly formatted for backend
    let formattedDateRange = null;
    if (selectedDateRange && selectedDateRange.startDate && selectedDateRange.endDate) {
      formattedDateRange = {
        startDateStr: selectedDateRange.startDateStr || selectedDateRange.startDate.toISOString().split('T')[0],
        endDateStr: selectedDateRange.endDateStr || selectedDateRange.endDate.toISOString().split('T')[0],
        startDate: selectedDateRange.startDate,
        endDate: selectedDateRange.endDate
      };
      console.log('Formatted date range for API:', formattedDateRange);
    }
    
    // Fetch available items, recent orders, and analytics when both company and location are selected
    if (selectedCompanyId && selectedLocationId) {
      fetchAvailableItems(selectedCompanyId, selectedLocationId);
      fetchRecentOrders(selectedCompanyId, selectedLocationId, formattedDateRange);
      fetchAnalytics(selectedCompanyId, selectedLocationId, formattedDateRange);
    } else {
      setError('Please select both a company and location to view available items and recent orders');
    }
  };

  // Date range handler - Updated to NOT automatically apply filters when date range changes
  const handleDateRangeSelect = (range) => {
    // Ensure the range has the proper format for backend
    const formattedRange = {
      startDate: range.startDate,
      endDate: range.endDate,
      startDateStr: range.startDateStr || range.startDate.toISOString().split('T')[0],
      endDateStr: range.endDateStr || range.endDate.toISOString().split('T')[0]
    };
    
    setSelectedDateRange(formattedRange);
    console.log('Selected date range for orders:', formattedRange);
    
    // DON'T auto-apply filters - wait for user to click Apply Filters button
    console.log('Date range selected - waiting for user to click Apply Filters');
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

  const handleUpdateRecentOrder = (recentOrder) => {
    // Set the order for updating and populate current order with its items
    setOrderToUpdate(recentOrder);
    setIsUpdatingOrder(true);
    
    // Clear current order and populate with the order being updated
    const orderItems = recentOrder.orderItems.map(item => ({
      ...item,
      // Ensure we have all required fields for the order update
      id: item.id,
      name: item.name,
      price: item.unit_price || item.price,
      unit: item.unit,
      quantity: item.quantity,
      category: item.category
    }));
    
    setCurrentOrder(orderItems);
    // Remove the dialog popup - directly proceed to update mode
  };

  const handleCancelOrderUpdate = () => {
    setIsUpdatingOrder(false);
    setOrderToUpdate(null);
    setCurrentOrder([]);
  };

  const handleSubmitOrderUpdate = async () => {
    if (!orderToUpdate) {
      setError('No order selected for update');
      return;
    }

    if (currentOrder.length === 0) {
      setError('Please add items to your order before updating');
      return;
    }

    try {
      setLoading(true);
      
      const updateData = {
        order_id: orderToUpdate.id,
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
        updated_date: new Date().toISOString(),
        date_range: selectedDateRange ? {
          start_date: selectedDateRange.startDateStr || selectedDateRange.startDate?.toISOString(),
          end_date: selectedDateRange.endDateStr || selectedDateRange.endDate?.toISOString()
        } : null
      };

      console.log('Updating order with data:', updateData);

      const response = await apiClient.post('/api/storeorders/orderupdate', updateData);

      console.log('Order updated successfully:', response.data);
      
      alert(`Order #${orderToUpdate.id} updated successfully!`);
      handleCancelOrderUpdate();
      setError(null);
      
      // Refresh recent orders and analytics after successful update
      if (selectedCompanyId && selectedLocationId) {
        fetchRecentOrders(selectedCompanyId, selectedLocationId, selectedDateRange);
        fetchAnalytics(selectedCompanyId, selectedLocationId, selectedDateRange);
      }
      
    } catch (err) {
      console.error('Error updating order:', err);
      let errorMessage = 'Failed to update order.';
      
      if (err.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Access forbidden. You do not have permission to update orders.';
      } else if (err.response?.data?.message) {
        errorMessage = `Failed to update order: ${err.response.data.message}`;
      }
      
      setError(errorMessage);
      
    } finally {
      setLoading(false);
    }
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
          start_date: selectedDateRange.startDateStr || selectedDateRange.startDate?.toISOString(),
          end_date: selectedDateRange.endDateStr || selectedDateRange.endDate?.toISOString()
        } : null
      };

      console.log('Submitting order with data:', orderData);

      const response = await apiClient.post('/api/storeorders/orderitems', orderData);

      console.log('Order submitted successfully:', response.data);
      
      alert('Order submitted successfully!');
      setCurrentOrder([]);
      setEmailOrder(false);
      setError(null);
      
      // Refresh recent orders and analytics after successful submission
      if (selectedCompanyId && selectedLocationId) {
        fetchRecentOrders(selectedCompanyId, selectedLocationId, selectedDateRange);
        fetchAnalytics(selectedCompanyId, selectedLocationId, selectedDateRange);
      }
      
    } catch (err) {
      console.error('Error submitting order:', err);
      let errorMessage = 'Failed to submit order.';
      
      if (err.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Access forbidden. You do not have permission to submit orders.';
      } else if (err.response?.data?.message) {
        errorMessage = `Failed to submit order: ${err.response.data.message}`;
      }
      
      setError(errorMessage);
      
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
          {error.includes('Authentication failed') && (
            <Box sx={{ mt: 1, fontSize: '0.875rem' }}>
              <strong>Note:</strong> Your session may have expired. Please try logging in again.
            </Box>
          )}
        </Alert>
      )}

      {/* Development Mode Indicator */}
      {companyLocations.length === 0 && !loading && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <strong>No Data Available:</strong> API connection failed. Please check:
          <br />• Is your backend server running?
          <br />• Is the API_URL_Local configured correctly? (Currently: {API_URL_Local})
          <br />• Does the /company-locations/all endpoint exist and return JSON?
          <br />• Are you properly authenticated?
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
                onDelete={() => {
                  setSelectedDateRange(null);
                  // Clear date range but don't auto-fetch data
                }}
                sx={{ fontSize: '0.75rem' }}
              />
            )}
            <DateRangeSelectorButton onDateRangeSelect={handleDateRangeSelect} />
            <Button
              variant="contained"
              color="primary"
              onClick={handleApplyFilters}
              disabled={!selectedCompanyId || !selectedLocationId || loading || loadingOrders}
              startIcon={(loading || loadingOrders) ? <CircularProgress size={16} /> : <FilterListIcon />}
              sx={{ 
                minWidth: 140,
                height: 44,
                fontWeight: 600
              }}
            >
              {(loading || loadingOrders) ? 'Loading...' : 'Apply Filters'}
            </Button>
          </Box>
        </Box>

        {/* Filters Section */}
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
              No companies or locations available. Please check your authentication or contact support.
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
                      <em>Select Company</em>
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
                  <InputLabel shrink>Location</InputLabel>
                  <Select
                    value={selectedLocationId || ''}
                    label="Location"
                    onChange={(e) => handleLocationChange(e.target.value)}
                    displayEmpty
                    notched
                  >
                    <MenuItem value="">
                      <em>Select Location</em>
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
                    disabled={!selectedCompanyId || !selectedLocationId || loading || loadingOrders}
                    startIcon={(loading || loadingOrders) ? <CircularProgress size={20} /> : <FilterListIcon />}
                    sx={{ minWidth: 220 }}
                  >
                    {(loading || loadingOrders) ? 'Loading Data...' : 'Apply Filters & Load Data'}
                  </Button>
                  
                  {(selectedCompanyId || selectedLocationId || selectedDateRange) && (
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setSelectedCompanyId(null);
                        setSelectedLocationId(null);
                        setFilters({});
                        setAvailableItems([]);
                        setRecentOrders([]);
                        setSelectedDateRange(null);
                        setAnalyticsData(null);
                        
                        // Clear Redux state
                        dispatch(setSelectedCompanies([]));
                        dispatch(setSelectedLocations([]));
                      }}
                    >
                      Clear All Filters
                    </Button>
                  )}

                  {/* Show selected filters info */}
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
                      {selectedDateRange && (
                        <Chip 
                          label={`Date: ${selectedDateRange.startDate?.toLocaleDateString()} - ${selectedDateRange.endDate?.toLocaleDateString()}`}
                          size="small"
                          color="info"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  )}
                </Box>

                {(!selectedCompanyId || !selectedLocationId) && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Please select both a company and location, then click "Apply Filters" to load available items and recent orders.
                  </Typography>
                )}

                {/* Show ready to apply status */}
                {selectedCompanyId && selectedLocationId && availableItems.length === 0 && recentOrders.length === 0 && !loading && !loadingOrders && (
                  <Typography variant="body2" color="primary.main" sx={{ mt: 1, fontWeight: 500 }}>
                    ✅ Ready to load data{selectedDateRange ? ' with date filter' : ''}. Click "Apply Filters & Load Data" to fetch items and recent orders.
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
                      Avg Daily Orders
                    </Typography>
                    {loadingAnalytics ? (
                      <CircularProgress size={24} />
                    ) : (
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#1565c0' }}>
                        {analyticsData?.avg_daily_orders?.toFixed(1) || '0.0'}
                      </Typography>
                    )}
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
                    {loadingAnalytics ? (
                      <CircularProgress size={24} />
                    ) : (
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                        {analyticsData?.total_orders || '0'}
                      </Typography>
                    )}
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
                {analyticsData?.top_items && analyticsData.top_items.length > 0 ? (
                  analyticsData.top_items.slice(0, 3).map((item, index) => (
                    <React.Fragment key={item.name}>
                      <ListItem>
                        <ListItemText 
                          primary={`#${index + 1} ${item.name}`}
                          secondary={`${item.total_quantity} units total`}
                          primaryTypographyProps={{ fontWeight: 500 }}
                        />
                      </ListItem>
                      {index < Math.min(analyticsData.top_items.length, 3) - 1 && <Divider />}
                    </React.Fragment>
                  ))
                ) : loadingAnalytics ? (
                  <ListItem>
                    <CircularProgress size={20} sx={{ mr: 2 }} />
                    <ListItemText 
                      primary="Loading top items..."
                      primaryTypographyProps={{ fontWeight: 500, color: 'text.secondary' }}
                    />
                  </ListItem>
                ) : (
                  <ListItem>
                    <ListItemText 
                      primary="No top items available"
                      secondary="Select a company and location to view top items"
                      primaryTypographyProps={{ fontWeight: 500, color: 'text.secondary' }}
                    />
                  </ListItem>
                )}
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
                {loadingOrders && (
                  <CircularProgress size={20} />
                )}
                <Typography variant="body2" color="text.secondary">
                  {selectedCompanyId && selectedLocationId 
                    ? recentOrders.length === 0 && !loadingOrders
                      ? 'Click "Apply Filters & Load Data" above to load recent orders.'
                      : `Recent orders for ${companies.find(c => c.id.toString() === selectedCompanyId)?.name} - ${availableLocationsForCompany.find(l => l.location_id.toString() === selectedLocationId)?.location_name}`
                    : 'Select company and location to view recent orders'
                  }
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

              {loadingOrders ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : recentOrders.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <ReceiptIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                    No recent orders found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedCompanyId && selectedLocationId 
                      ? 'No orders have been placed yet for this location, or data hasn\'t been loaded yet. Try clicking "Apply Filters & Load Data" above.'
                      : 'Please select a company and location, then click "Apply Filters & Load Data" to view recent orders.'
                    }
                  </Typography>
                </Box>
              ) : (
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
                                  ${order.total.toFixed(2)}
                                </Typography>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<AddIcon />}
                                  onClick={() => handleAddRecentOrderToCart(order)}
                                  sx={{ ml: 1, mr: 1 }}
                                >
                                  Add to Cart
                                </Button>
                                <Button
                                  variant="contained"
                                  size="small"
                                  color="secondary"
                                  startIcon={<ReceiptIcon />}
                                  onClick={() => handleUpdateRecentOrder(order)}
                                >
                                  Update Order
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
                                  @${order.avg.toFixed(2)}
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
              )}
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
                  : selectedCompanyId && selectedLocationId
                    ? 'Click "Apply Filters & Load Data" above to view available items.'
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
                    {selectedCompanyId && selectedLocationId 
                      ? 'Click "Apply Filters & Load Data" above to load available items.'
                      : 'Please select a company and location from the filters above, then click "Apply Filters" to load available items.'
                    }
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
                    {isUpdatingOrder ? `Update Order #${orderToUpdate?.id}` : 'Current Order'}
                  </Typography>
                  {isUpdatingOrder && (
                    <Chip 
                      label="Updating" 
                      color="secondary" 
                      size="small" 
                      variant="outlined"
                    />
                  )}
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
                      {recentOrders.length > 0 && (
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={() => handleAddRecentOrderToCart(recentOrders[0])}
                        >
                          🔄 Repeat Last Order
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
                        label={isUpdatingOrder ? "Email updated order details" : "Email order details"}
                        sx={{ mb: 2 }}
                      />

                      {isUpdatingOrder ? (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button 
                            variant="outlined" 
                            fullWidth 
                            size="medium"
                            onClick={handleCancelOrderUpdate}
                            sx={{ fontWeight: 600, py: 1 }}
                          >
                            Cancel Update
                          </Button>
                          <Button 
                            variant="contained" 
                            fullWidth 
                            size="medium"
                            startIcon={loading ? <CircularProgress size={16} /> : <ReceiptIcon />}
                            sx={{ fontWeight: 600, py: 1 }}
                            onClick={handleSubmitOrderUpdate}
                            disabled={loading || currentOrder.length === 0}
                            color="secondary"
                          >
                            {loading ? 'Updating...' : 'Update Order'}
                          </Button>
                        </Box>
                      ) : (
                        <Button 
                          variant="contained" 
                          fullWidth 
                          size="medium"
                          startIcon={loading ? <CircularProgress size={16} /> : <ReceiptIcon />}
                          sx={{ fontWeight: 600, py: 1 }}
                          onClick={handleSubmitOrder}
                          disabled={loading || !selectedCompanyId || !selectedLocationId || currentOrder.length === 0}
                        >
                          {loading ? 'Submitting...' : 'Submit Order'}
                        </Button>
                      )}

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
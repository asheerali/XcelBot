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
  MenuItem,
  Tooltip,
  Snackbar
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
  Place as PlaceIcon,
  BugReport as BugReportIcon
} from '@mui/icons-material';

// Import Redux actions and selectors
import {
  setSelectedCompanies,
  setSelectedLocations,
  selectSelectedCompanies,
  selectSelectedLocations
} from '../store/slices/masterFileSlice'; // Adjust path as needed

// Import OrderIQ Dashboard date range Redux actions and selectors
import {
  setOrderIQDashboardDateRange,
  setOrderIQDashboardStartDate,
  setOrderIQDashboardEndDate,
  clearOrderIQDashboardDateRange,
  selectOrderIQDashboardStartDate,
  selectOrderIQDashboardEndDate,
  selectOrderIQDashboardDateRange,
  selectHasOrderIQDashboardDateRange
} from '../store/slices/dateRangeSlice'; // Adjust path as needed

import { API_URL_Local } from '../constants';
import apiClient from "../api/axiosConfig";

// Import your actual DateRangeSelector component
import DateRangeSelector from '../components/DateRangeSelector'; // Adjust path as needed

// DateRangeSelector Button Component
const DateRangeSelectorButton = ({ onDateRangeSelect, selectedRange, onClear }) => {
  const [isOpen, setIsOpen] = useState(false);
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
      onDateRangeSelect(tempRange);
    }
    setIsOpen(false);
  };

  const handleClear = (event) => {
    event.stopPropagation();
    onClear();
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<CalendarTodayIcon />}
        endIcon={selectedRange && (
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
        {selectedRange || 'Date Range'}
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

// Main OrderIQ Dashboard Component
const OrderIQDashboard = () => {
  // Redux hooks
  const dispatch = useDispatch();
  const reduxSelectedCompanies = useSelector(selectSelectedCompanies);
  const reduxSelectedLocations = useSelector(selectSelectedLocations);

  // ENHANCED: Redux date range selectors with debugging
  const reduxDateRange = useSelector(selectOrderIQDashboardDateRange);
  const hasDateRange = useSelector(selectHasOrderIQDashboardDateRange);
  
  console.log('🔍 DEBUG: OrderIQ Redux State Investigation:');
  console.log('reduxDateRange:', reduxDateRange);
  console.log('hasDateRange:', hasDateRange);
  console.log('reduxDateRange type:', typeof reduxDateRange);
  console.log('reduxDateRange keys:', reduxDateRange ? Object.keys(reduxDateRange) : 'null');

  // State management
  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentOrder, setCurrentOrder] = useState([]);
  const [emailOrder, setEmailOrder] = useState(false);
  const [updateOrderDialog, setUpdateOrderDialog] = useState({ open: false, order: null });
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);
  const [orderToUpdate, setOrderToUpdate] = useState(null);
  
  // NEW: State for quantity inputs for each item
  const [itemQuantities, setItemQuantities] = useState({});
  
  // API data state
  const [companyLocations, setCompanyLocations] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [loadingAISuggestions, setLoadingAISuggestions] = useState(false);
  const [error, setError] = useState(null);
  
  // Success notification state
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Selected company and location for API calls - Initialize from Redux
  const [selectedCompanyId, setSelectedCompanyId] = useState(() => {
    return reduxSelectedCompanies.length > 0 ? reduxSelectedCompanies[0] : null;
  });
  
  const [selectedLocationId, setSelectedLocationId] = useState(() => {
    return reduxSelectedLocations.length > 0 ? reduxSelectedLocations[0] : null;
  });

  // ENHANCED: Improved apiDateRange computation with comprehensive debugging
  const apiDateRange = useMemo(() => {
    console.log('🔍 Computing apiDateRange with:', {
      hasDateRange,
      reduxDateRange,
      startDate: reduxDateRange?.startDate,
      endDate: reduxDateRange?.endDate
    });

    // Check all possible date range formats that might exist in Redux
    if (!hasDateRange) {
      console.log('❌ No date range in Redux (hasDateRange is false)');
      return null;
    }

    if (!reduxDateRange) {
      console.log('❌ reduxDateRange is null/undefined');
      return null;
    }

    // Try different possible field names that might exist in Redux
    let startDateStr = null;
    let endDateStr = null;

    // Check various possible field names
    if (reduxDateRange.startDate && reduxDateRange.endDate) {
      startDateStr = reduxDateRange.startDate;
      endDateStr = reduxDateRange.endDate;
      console.log('✅ Found dates in startDate/endDate fields');
    } else if (reduxDateRange.start_date && reduxDateRange.end_date) {
      startDateStr = reduxDateRange.start_date;
      endDateStr = reduxDateRange.end_date;
      console.log('✅ Found dates in start_date/end_date fields');
    } else if (reduxDateRange.startDateStr && reduxDateRange.endDateStr) {
      startDateStr = reduxDateRange.startDateStr;
      endDateStr = reduxDateRange.endDateStr;
      console.log('✅ Found dates in startDateStr/endDateStr fields');
    } else {
      console.log('❌ No valid date fields found in reduxDateRange:', reduxDateRange);
      return null;
    }

    if (!startDateStr || !endDateStr) {
      console.log('❌ Missing start or end date:', { startDateStr, endDateStr });
      return null;
    }

    // Ensure dates are in YYYY-MM-DD format
    const formatDateString = (dateStr) => {
      // If already in YYYY-MM-DD format, return as-is
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr;
      }
      
      // If it's a Date object or Date string, convert it
      try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          throw new Error('Invalid date');
        }
        return date.toISOString().split('T')[0]; // YYYY-MM-DD format
      } catch (error) {
        console.error('Error formatting date:', dateStr, error);
        return null;
      }
    };

    const formattedStartDate = formatDateString(startDateStr);
    const formattedEndDate = formatDateString(endDateStr);

    if (!formattedStartDate || !formattedEndDate) {
      console.log('❌ Failed to format dates:', { startDateStr, endDateStr });
      return null;
    }

    // Convert YYYY-MM-DD strings to Date objects for display
    const startDate = new Date(formattedStartDate + 'T00:00:00');
    const endDate = new Date(formattedEndDate + 'T00:00:00');

    const result = {
      startDate: startDate,
      endDate: endDate,
      startDateStr: formattedStartDate,
      endDateStr: formattedEndDate
    };

    console.log('✅ Successfully computed apiDateRange:', result);
    return result;
  }, [hasDateRange, reduxDateRange]);

  // ENHANCED: Better date range display string computation
  const dateRangeDisplayString = useMemo(() => {
    console.log('🔍 Computing dateRangeDisplayString with apiDateRange:', apiDateRange);
    
    if (!apiDateRange || !apiDateRange.startDate || !apiDateRange.endDate) {
      console.log('❌ No valid apiDateRange for display');
      return null;
    }
    
    try {
      const displayString = `${apiDateRange.startDate.toLocaleDateString()} - ${apiDateRange.endDate.toLocaleDateString()}`;
      console.log('✅ Date range display string:', displayString);
      return displayString;
    } catch (error) {
      console.error('Error creating display string:', error);
      return null;
    }
  }, [apiDateRange]);

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

  // Auto-fetch data when company, location, OR date range changes
  useEffect(() => {
    if (selectedCompanyId && selectedLocationId && companyLocations.length > 0) {
      console.log('🚀 OrderIQ: Auto-fetching data due to filter change:', { 
        companyId: selectedCompanyId, 
        locationId: selectedLocationId,
        dateRange: apiDateRange,
        companyLocationsLoaded: companyLocations.length > 0
      });
      
      fetchAvailableItems(selectedCompanyId, selectedLocationId, apiDateRange);
      fetchRecentOrders(selectedCompanyId, selectedLocationId, apiDateRange);
      fetchAnalytics(selectedCompanyId, selectedLocationId, apiDateRange);
    } else {
      console.log('⏸️ OrderIQ: Not fetching data:', {
        selectedCompanyId: !!selectedCompanyId,
        selectedLocationId: !!selectedLocationId,
        companyLocationsLoaded: companyLocations.length > 0
      });
    }
  }, [selectedCompanyId, selectedLocationId, companyLocations.length, apiDateRange]);

  // Initialize item quantities when available items change
  useEffect(() => {
    if (availableItems.length > 0) {
      const initialQuantities = {};
      availableItems.forEach(item => {
        initialQuantities[item.id] = 1; // Default quantity is 1
      });
      setItemQuantities(initialQuantities);
    }
  }, [availableItems]);

  // Success notification function
  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification(prev => ({ ...prev, open: false }));
  };

  // NEW: Handle quantity change for specific item
  const handleQuantityChange = (itemId, newQuantity) => {
    // Allow empty string for user to clear and type new number
    if (newQuantity === '') {
      setItemQuantities(prev => ({
        ...prev,
        [itemId]: ''
      }));
      return;
    }
    
    const quantity = parseInt(newQuantity);
    // Allow any positive integer, including 0 temporarily for editing
    if (!isNaN(quantity) && quantity >= 0) {
      setItemQuantities(prev => ({
        ...prev,
        [itemId]: quantity
      }));
    }
  };

  // TESTING: Add a test function to manually set a date range for debugging
  const testDateRange = () => {
    console.log('🧪 Testing date range functionality...');
    
    const testRange = {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31'),
      startDateStr: '2024-01-01',
      endDateStr: '2024-01-31'
    };
    
    console.log('Setting test date range:', testRange);
    handleDateRangeSelect(testRange);
  };

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
        date: new Date(order.created_at).toLocaleString('en-US', {
          month: 'numeric',
          day: 'numeric', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
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

  const fetchAvailableItems = async (companyId, locationId, dateRange = null) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📦 Fetching available items for:', { companyId, locationId, dateRange });
      
      // Build URL with date range parameters if provided
      let url = `/api/masterfile/availableitems/${companyId}/${locationId}`;
      const params = new URLSearchParams();
      
      if (dateRange && dateRange.startDateStr && dateRange.endDateStr) {
        params.append('start_date', dateRange.startDateStr);
        params.append('end_date', dateRange.endDateStr);
        url += `?${params.toString()}`;
      }
      
      const response = await apiClient.get(url);
      
      console.log('📦 Available items API response:', response.data);
      
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
      
      console.log('📦 Transformed items:', transformedItems.length, 'items');
      setAvailableItems(transformedItems);
      
    } catch (err) {
      console.error('❌ Error fetching available items:', err);
      let errorMessage = 'Failed to load available items.';
      
      if (err.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Access forbidden. You do not have permission to view available items.';
      } else if (err.response?.data?.message) {
        errorMessage = `API Error: ${err.response.data.message}`;
      } else if (err.message) {
        errorMessage = `Error: ${err.message}`;
      }
      
      setError(errorMessage);
      setAvailableItems([]); // Clear items on error
      
    } finally {
      setLoading(false);
    }
  };

  // AI Suggestions function
  const fetchAISuggestions = async () => {
    if (!selectedCompanyId || !selectedLocationId) {
      setError('Please select company and location to get AI suggestions');
      return;
    }

    try {
      setLoadingAISuggestions(true);
      setError(null);
      
      console.log('Fetching AI suggestions...', { 
        companyId: selectedCompanyId, 
        locationId: selectedLocationId 
      });
      
      const response = await apiClient.get(`/api/storeorders/aisuggestions/${selectedCompanyId}/${selectedLocationId}`);
      
      console.log('AI suggestions response:', response.data);
      
      // Check if data has expected structure
      if (!response.data.data || !response.data.data.items_ordered || !Array.isArray(response.data.data.items_ordered.items)) {
        throw new Error('Invalid AI suggestions data structure received from API');
      }
      
      // Transform the API response to match our current order structure
      const suggestedItems = response.data.data.items_ordered.items.map((item) => ({
        id: item.item_id,
        name: item.name,
        category: item.category,
        price: item.unit_price,
        unit: item.unit,
        quantity: item.quantity
      }));
      
      console.log('Transformed AI suggestions:', suggestedItems);
      
      // Add suggested items to current order
      if (suggestedItems.length > 0) {
        // Replace current order with AI suggestions
        setCurrentOrder(suggestedItems);
        showNotification(`🤖 AI suggested ${suggestedItems.length} item${suggestedItems.length > 1 ? 's' : ''} based on your order history!`);
      } else {
        showNotification('🤖 No AI suggestions available at the moment. Try placing some orders first!', 'info');
      }
      
    } catch (err) {
      console.error('Error fetching AI suggestions:', err);
      let errorMessage = 'Failed to load AI suggestions.';
      
      if (err.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Access forbidden. You do not have permission to access AI suggestions.';
      } else if (err.response?.status === 404) {
        errorMessage = 'AI suggestions not available. No order history found for this location.';
      } else if (err.response?.data?.message) {
        errorMessage = `AI suggestions error: ${err.response.data.message}`;
      }
      
      setError(errorMessage);
      
    } finally {
      setLoadingAISuggestions(false);
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
    
    // Data will auto-fetch via useEffect when both company and location are selected
  };

  // ENHANCED: Updated date range handler to use Redux with better debugging
  const handleDateRangeSelect = (range) => {
    console.log('🔥 OrderIQ: handleDateRangeSelect called with:', range);
    console.log('Range startDate type:', typeof range.startDate);
    console.log('Range endDate type:', typeof range.endDate);
    console.log('Range startDateStr:', range.startDateStr);
    console.log('Range endDateStr:', range.endDateStr);
    
    // Ensure we have the proper format
    let startDateStr, endDateStr;
    
    if (range.startDateStr && range.endDateStr) {
      // Use the pre-formatted strings if available
      startDateStr = range.startDateStr;
      endDateStr = range.endDateStr;
    } else if (range.startDate && range.endDate) {
      // Format the Date objects
      try {
        startDateStr = range.startDate.toISOString().split('T')[0]; // YYYY-MM-DD
        endDateStr = range.endDate.toISOString().split('T')[0]; // YYYY-MM-DD
      } catch (error) {
        console.error('Error formatting dates for Redux:', error);
        return;
      }
    } else {
      console.error('Invalid date range format:', range);
      return;
    }
    
    console.log('📤 Dispatching to Redux:', { startDateStr, endDateStr });
    
    // Dispatch to Redux to store the date range
    dispatch(setOrderIQDashboardDateRange({
      startDate: startDateStr,
      endDate: endDateStr
    }));
    
    console.log('✅ OrderIQ: Date range dispatched to Redux, this will trigger data refresh via useEffect');
  };

  // NEW: Handle date range clear
  const handleDateRangeClear = () => {
    console.log('🧹 OrderIQ: Clearing date range from Redux, this will trigger data refresh');
    dispatch(clearOrderIQDashboardDateRange());
  };

  // UPDATED: Now uses quantity from itemQuantities state
  const handleAddToOrder = (item, quantity = null, showNotif = true) => {
    // Use provided quantity or get from itemQuantities state
    let quantityToAdd = quantity !== null ? quantity : (itemQuantities[item.id] || 1);
    
    // Convert to number if it's a string, and ensure it's at least 1
    if (typeof quantityToAdd === 'string') {
      quantityToAdd = parseInt(quantityToAdd) || 1;
    }
    
    // Only add if quantity is 1 or greater
    if (quantityToAdd < 1) {
      return;
    }
    
    setCurrentOrder(prev => {
      const existingIndex = prev.findIndex(orderItem => orderItem.id === item.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantityToAdd;
        if (showNotif) {
          showNotification(`Added ${quantityToAdd} more ${item.name} to cart`);
        }
        return updated;
      } else {
        if (showNotif) {
          showNotification(`${quantityToAdd} × ${item.name} added to cart`);
        }
        return [...prev, { ...item, quantity: quantityToAdd }];
      }
    });
  };

  const handleRemoveFromOrder = (itemId) => {
    const removedItem = currentOrder.find(item => item.id === itemId);
    setCurrentOrder(prev => prev.filter(item => item.id !== itemId));
    if (removedItem) {
      showNotification(`${removedItem.name} removed from cart`);
    }
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
    let itemsAdded = 0;
    recentOrder.orderItems.forEach(item => {
      if (item.quantity > 0) { // Only add items with quantity > 0
        handleAddToOrder(item, item.quantity, false); // Don't show individual notifications
        itemsAdded++;
      }
    });
    
    if (itemsAdded > 0) {
      showNotification(`Added ${itemsAdded} item${itemsAdded > 1 ? 's' : ''} from recent order to cart`);
    }
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

  // ENHANCED: Order submission with comprehensive date range handling and debugging
  const handleSubmitOrder = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
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
      setError(null);
      
      // Get local time
      const now = new Date();
      const localTime = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString();
      
      // DEBUGGING: Log the date range state before using it
      console.log('🔍 SUBMIT ORDER - Date Range Debug:');
      console.log('hasDateRange:', hasDateRange);
      console.log('reduxDateRange:', reduxDateRange);
      console.log('apiDateRange:', apiDateRange);
      console.log('apiDateRange type:', typeof apiDateRange);
      
      // Build order data with comprehensive date range handling
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
        order_date: localTime
      };

      // Add date range information if available
      if (apiDateRange && apiDateRange.startDateStr && apiDateRange.endDateStr) {
        console.log('✅ Adding date range to order data:', {
          start: apiDateRange.startDateStr,
          end: apiDateRange.endDateStr
        });
        
        // Add multiple formats for backend compatibility
        orderData.date_range = {
          start_date: apiDateRange.startDateStr,
          end_date: apiDateRange.endDateStr
        };
        orderData.start_date = apiDateRange.startDateStr;
        orderData.end_date = apiDateRange.endDateStr;
        orderData.has_date_range = true;
        
      } else {
        console.log('❌ No valid date range to add to order data');
        orderData.date_range = null;
        orderData.start_date = null;
        orderData.end_date = null;
        orderData.has_date_range = false;
      }

      console.log('=== FINAL ORDER DATA FOR BACKEND ===');
      console.log('Endpoint: /api/storeorders/orderitems');
      console.log('Method: POST');
      console.log('Has Date Range:', orderData.has_date_range);
      if (orderData.has_date_range) {
        console.log('Date Range:', orderData.date_range);
        console.log('Start Date:', orderData.start_date);
        console.log('End Date:', orderData.end_date);
      }

      console.log(`=== FINAL ORDER DATA FOR BACKEND ===
      Endpoint: /api/storeorders/orderitems
      Method: POST
      Has Date Range: ${orderData.has_date_range}
      ${orderData.has_date_range ? `Date Range: ${JSON.stringify(orderData.date_range)}
      Start Date: ${orderData.start_date}
      End Date: ${orderData.end_date}` : ''}
      `);
      console.log('Full Payload:', JSON.stringify(orderData, null, 2));
      console.log('=====================================');

      const response = await apiClient.post('/api/storeorders/orderitems', orderData);

      console.log('Order submitted successfully:', response.data);
      
      showNotification('Order submitted successfully! 🎉');
      setCurrentOrder([]);
      setEmailOrder(false);
      setError(null);
      
      // Refresh data
      if (selectedCompanyId && selectedLocationId) {
        console.log('🔄 Refreshing all data after order submission with date range:', {
          companyId: selectedCompanyId,
          locationId: selectedLocationId,
          dateRange: apiDateRange,
          hasDateRange: !!apiDateRange
        });
        fetchAvailableItems(selectedCompanyId, selectedLocationId, apiDateRange);
        fetchRecentOrders(selectedCompanyId, selectedLocationId, apiDateRange);
        fetchAnalytics(selectedCompanyId, selectedLocationId, apiDateRange);
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
      showNotification(errorMessage, 'error');
      
    } finally {
      setLoading(false);
    }
  };

  // ENHANCED: Order update with same comprehensive date range handling
  const handleSubmitOrderUpdate = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
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
      setError(null);
      
      // Get local time
      const now = new Date();
      const localTime = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString();
      
      // DEBUGGING: Log the date range state for updates too
      console.log('🔍 UPDATE ORDER - Date Range Debug:');
      console.log('hasDateRange:', hasDateRange);
      console.log('reduxDateRange:', reduxDateRange);
      console.log('apiDateRange:', apiDateRange);
      
      // Build update data with same comprehensive date range handling
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
        updated_date: localTime
      };

      // Add date range information if available
      if (apiDateRange && apiDateRange.startDateStr && apiDateRange.endDateStr) {
        console.log('✅ Adding date range to update data:', {
          start: apiDateRange.startDateStr,
          end: apiDateRange.endDateStr
        });
        
        // Add multiple formats for backend compatibility
        updateData.date_range = {
          start_date: apiDateRange.startDateStr,
          end_date: apiDateRange.endDateStr
        };
        updateData.start_date = apiDateRange.startDateStr;
        updateData.end_date = apiDateRange.endDateStr;
        updateData.has_date_range = true;
        
      } else {
        console.log('❌ No valid date range to add to update data');
        updateData.date_range = null;
        updateData.start_date = null;
        updateData.end_date = null;
        updateData.has_date_range = false;
      }

      console.log('=== ENHANCED ORDER UPDATE DATA BEING SENT TO BACKEND ===');
      console.log('Endpoint: /api/storeorders/orderupdate');
      console.log('Method: POST');
      console.log('Has Date Range:', updateData.has_date_range);
      if (updateData.has_date_range) {
        console.log('Date Range:', updateData.date_range);
        console.log('Start Date fuck this bith:', updateData.start_date);
        console.log('End Date:', updateData.end_date);
      }
      console.log('Full Update Payload:', JSON.stringify(updateData, null, 2));
      console.log('========================================================');

      const response = await apiClient.post('/api/storeorders/orderupdate', updateData);

      console.log('Order updated successfully:', response.data);
      
      showNotification(`Order #${orderToUpdate.id} updated successfully! 🎉`);
      handleCancelOrderUpdate();
      setError(null);
      
      // Refresh all data after successful order update
      if (selectedCompanyId && selectedLocationId) {
        console.log('🔄 Refreshing all data after order update with date range:', {
          companyId: selectedCompanyId,
          locationId: selectedLocationId,
          dateRange: apiDateRange,
          hasDateRange: !!apiDateRange
        });
        fetchAvailableItems(selectedCompanyId, selectedLocationId, apiDateRange);
        fetchRecentOrders(selectedCompanyId, selectedLocationId, apiDateRange);
        fetchAnalytics(selectedCompanyId, selectedLocationId, apiDateRange);
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
      showNotification(errorMessage, 'error');
      
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
            <DateRangeSelectorButton 
              onDateRangeSelect={handleDateRangeSelect}
              selectedRange={dateRangeDisplayString}
              onClear={handleDateRangeClear}
            />
            {/* DEBUG: Test button for date range functionality */}
            <Button 
              onClick={() => {
                console.log('🧪 Testing date range...');
                dispatch(setOrderIQDashboardDateRange({
                  startDate: '2024-01-01',
                  endDate: '2024-01-31'
                }));
              }} 
              variant="outlined" 
              size="small"
              startIcon={<BugReportIcon />}
              sx={{ ml: 1 }}
            >
              🧪 Test Date Range
            </Button>
          </Box>
        </Box>

        {/* Debug Info Panel */}
        <Card sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5', borderLeft: '4px solid #2196f3' }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            🔍 Debug Info:
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
            hasDateRange: {hasDateRange ? 'true' : 'false'} | 
            reduxDateRange: {reduxDateRange ? JSON.stringify(reduxDateRange) : 'null'} | 
            apiDateRange: {apiDateRange ? JSON.stringify(apiDateRange) : 'null'}
          </Typography>
        </Card>

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

              {/* Status Display */}
              <Grid item xs={12}>
                {(!selectedCompanyId || !selectedLocationId) && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Please select both a company and location to automatically load available items and recent orders.
                  </Typography>
                )}

                {/* Show loading status */}
                {selectedCompanyId && selectedLocationId && (loading || loadingOrders) && (
                  <Typography variant="body2" color="primary.main" sx={{ mt: 1, fontWeight: 500 }}>
                    🔄 Loading data for {companies.find(c => c.id.toString() === selectedCompanyId)?.name}...
                  </Typography>
                )}

                {/* Show data loaded status */}
                {selectedCompanyId && selectedLocationId && !loading && !loadingOrders && availableItems.length > 0 && (
                  <Typography variant="body2" color="success.main" sx={{ mt: 1, fontWeight: 500 }}>
                    ✅ Data loaded for {companies.find(c => c.id.toString() === selectedCompanyId)?.name}
                    {hasDateRange && (
                      <span style={{ color: '#666', fontWeight: 400 }}>
                        {' '}with date filter: {dateRangeDisplayString}
                      </span>
                    )}
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
                <Box sx={{ minWidth: 140 }}>
                  {hasDateRange && (
                    <Chip 
                      label="Filtered by date range" 
                      size="small" 
                      variant="outlined" 
                      color="primary"
                    />
                  )}
                </Box>
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
                <Box sx={{ minWidth: 100 }}>
                  {hasDateRange && (
                    <Chip 
                      label="Date filtered" 
                      size="small" 
                      variant="outlined" 
                      color="primary"
                    />
                  )}
                </Box>
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
                <Typography variant="body2" color="text.secondary" sx={{ flex: 1, minWidth: 200 }}>
                  {selectedCompanyId && selectedLocationId 
                    ? recentOrders.length === 0 && !loadingOrders
                      ? 'No orders found for the selected filters.'
                      : `Recent orders for ${companies.find(c => c.id.toString() === selectedCompanyId)?.name} - ${availableLocationsForCompany.find(l => l.location_id.toString() === selectedLocationId)?.location_name}`
                    : 'Select company and location to view recent orders'
                  }
                </Typography>
                <Box sx={{ minWidth: 100 }}>
                  {hasDateRange && (
                    <Chip 
                      label="Date filtered" 
                      size="small" 
                      variant="outlined" 
                      color="primary"
                    />
                  )}
                </Box>
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
                      ? 'No orders have been placed yet for this location with the current filters.'
                      : 'Please select a company and location to view recent orders.'
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
                  ? `${availableItems.length} items available. Enter desired quantity and click "Add" to add items to your cart.`
                  : selectedCompanyId && selectedLocationId
                    ? loading ? 'Loading available items...' : 'No items available for the selected company and location.'
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
                      ? 'No items available for the selected company and location.'
                      : 'Please select a company and location from the filters above to load available items.'
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
                          {/* NEW: Quantity input and Add button */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
                            <TextField
                              type="number"
                              value={itemQuantities[item.id] || ''}
                              onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                              placeholder="1"
                              size="small"
                              inputProps={{ 
                                min: 1, 
                                max: 999,
                                style: { textAlign: 'center' }
                              }}
                              sx={{ 
                                width: 80,
                                '& .MuiOutlinedInput-root': {
                                  height: 36
                                }
                              }}
                            />
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<AddIcon />}
                              onClick={() => handleAddToOrder(item)}
                              disabled={!itemQuantities[item.id] || itemQuantities[item.id] < 1}
                              sx={{ minWidth: 80, height: 36 }}
                            >
                              Add
                            </Button>
                          </Box>
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
                      Enter quantity and click "Add" on any item to add it to your cart.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                      <Tooltip title="Get personalized item suggestions based on your order history">
                        <span>
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={fetchAISuggestions}
                            disabled={loadingAISuggestions || !selectedCompanyId || !selectedLocationId}
                            startIcon={loadingAISuggestions ? <CircularProgress size={16} /> : null}
                            sx={{ 
                              minWidth: 140,
                              '&:disabled': {
                                opacity: 0.6
                              }
                            }}
                          >
                            {loadingAISuggestions ? 'Getting Suggestions...' : '🤖 Get AI Suggestions'}
                          </Button>
                        </span>
                      </Tooltip>
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
                            type="button"
                            startIcon={loading ? <CircularProgress size={16} /> : <ReceiptIcon />}
                            sx={{ fontWeight: 600, py: 1 }}
                            onClick={(e) => handleSubmitOrderUpdate(e)}
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
                          type="button"
                          startIcon={loading ? <CircularProgress size={16} /> : <ReceiptIcon />}
                          sx={{ fontWeight: 600, py: 1 }}
                          onClick={(e) => handleSubmitOrder(e)}
                          disabled={loading || !selectedCompanyId || !selectedLocationId || currentOrder.length === 0}
                        >
                          {loading ? 'Submitting...' : 'Submit Order'}
                        </Button>
                      )}

                      {hasDateRange && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                          Order period: {dateRangeDisplayString}
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

      {/* Success Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            backgroundColor: notification.severity === 'success' ? '#4caf50' : 
                           notification.severity === 'info' ? '#2196f3' : 
                           notification.severity === 'warning' ? '#ff9800' : '#f44336',
            color: 'white',
            fontWeight: 500,
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            minWidth: '300px',
            '& .MuiSnackbarContent-message': {
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }
          },
          '& .MuiSnackbar-root': {
            bottom: '24px !important'
          }
        }}
        message={notification.message}
      />

      {/* AI Suggestions Dialog */}
    </Container>
  );
};

export default OrderIQDashboard;
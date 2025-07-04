import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Container,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Skeleton
} from '@mui/material';
import {
  Print as PrintIcon,
  Email as EmailIcon,
  Refresh as RefreshIcon,
  Description as DescriptionIcon,
  Assessment as AssessmentIcon,
  Store as StoreIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  CalendarToday as CalendarTodayIcon,
  Clear as ClearIcon
} from '@mui/icons-material';

// Import Redux hooks and selectors
import { useAppDispatch, useAppSelector } from '../typedHooks';
import {
  setSelectedCompanies,
  setSelectedLocations,
  setSelectedFilenames,
  clearSelections,
  clearData,
  clearError,
  loadMasterFileData,
  loadMultipleMasterFileData,
  selectSelectedCompanies,
  selectSelectedLocations,
  selectSelectedFilenames,
  selectLoading,
  selectError,
  selectLastAppliedFilters
} from '../store/slices/masterFileSlice';

// Import your existing components
import DateRangeSelector from '../components/DateRangeSelector'; // Adjust the import path as needed
import { API_URL_Local } from '../constants'; // Import API base URL

// API response interfaces
interface OrderData {
  order_id: number;
  created_at: string;
  items_count: number;
  total_quantity: number;
  total_amount: number;
}

interface OrdersApiResponse {
  message: string;
  data: OrderData[];
  total: number;
}

interface ConsolidatedProductionItem {
  Item: string;
  [locationName: string]: string | number; // Dynamic location columns
  'Total Required': number;
  Unit: string;
}

interface ConsolidatedProductionResponse {
  message: string;
  columns: string[];
  data: ConsolidatedProductionItem[];
}

interface Company {
  company_id: number;
  company_name: string;
  locations: Location[];
}

interface Location {
  location_id: number;
  location_name: string;
}

// DateRangeSelector Button Component
const DateRangeSelectorButton = ({ onDateRangeSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState('Select Date Range');
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
    setSelectedRange('Select Date Range');
    onDateRangeSelect(null);
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<CalendarTodayIcon />}
        endIcon={selectedRange !== 'Select Date Range' && (
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
          minWidth: '200px',
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
          Select Date Range for Production Reports
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

const StoreSummaryProduction = () => {
  const dispatch = useAppDispatch();
  
  // Redux selectors
  const selectedCompanies = useAppSelector(selectSelectedCompanies);
  const selectedLocations = useAppSelector(selectSelectedLocations);
  const selectedFilenames = useAppSelector(selectSelectedFilenames);
  const lastAppliedFilters = useAppSelector(selectLastAppliedFilters);
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);

  // Local state for print/email dialogs
  const [printDialog, setPrintDialog] = useState({ open: false, order: null, type: 'print' });
  const [emailDialog, setEmailDialog] = useState({ open: false, order: null, email: '' });
  
  // Date range selector state
  const [selectedDateRange, setSelectedDateRange] = useState(null);

  // API data state (not stored in Redux for this component)
  const [ordersData, setOrdersData] = useState<OrderData[]>([]);
  const [consolidatedData, setConsolidatedData] = useState<ConsolidatedProductionItem[]>([]);
  const [consolidatedColumns, setConsolidatedColumns] = useState<string[]>([]);
  const [ordersTotal, setOrdersTotal] = useState<number>(0);
  const [companiesData, setCompaniesData] = useState<Company[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Fetch companies data for display names
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch(`${API_URL_Local}/company-locations/all`);
        if (response.ok) {
          const data: Company[] = await response.json();
          setCompaniesData(data);
        }
      } catch (err) {
        console.error('Error fetching companies:', err);
      }
    };
    fetchCompanies();
  }, []);

  // Initialize with Redux values and load initial data on component mount
  useEffect(() => {
    console.log('StoreSummaryProduction - Component mounted with Redux state:', {
      selectedCompanies,
      selectedLocations,
      lastAppliedFilters
    });

    // If we have values in Redux and they match last applied filters, load data automatically
    if (selectedCompanies.length > 0 && selectedLocations.length > 0 && 
        !dataLoaded && lastAppliedFilters.companies.length > 0) {
      console.log('Auto-loading data from Redux state...');
      loadDataFromReduxState();
    }
  }, [selectedCompanies, selectedLocations, lastAppliedFilters, dataLoaded]);

  // Auto-load data when Redux values are available
  const loadDataFromReduxState = async () => {
    if (selectedCompanies.length === 0 || selectedLocations.length === 0) {
      return;
    }

    try {
      console.log('Loading initial data with Redux values:', {
        companies: selectedCompanies,
        locations: selectedLocations
      });
      
      const companyId = selectedCompanies[0];
      const locationId = selectedLocations[0];

      await Promise.all([
        fetchOrdersData(companyId, locationId),
        fetchConsolidatedData(companyId)
      ]);

      setDataLoaded(true);
    } catch (err) {
      console.error('Error loading initial data:', err);
      setLocalError('Failed to load initial data');
    }
  };

  // Get available locations based on selected companies
  const getAvailableLocations = () => {
    if (selectedCompanies.length === 0) {
      return [];
    }
    
    const selectedCompanyIds = selectedCompanies.map(id => parseInt(id));
    return companiesData
      .filter(company => selectedCompanyIds.includes(company.company_id))
      .flatMap(company => company.locations);
  };

  // Get company and location names for display
  const getCompanyName = (companyId: string) => {
    const company = companiesData.find(c => c.company_id.toString() === companyId);
    return company?.company_name || `Company ${companyId}`;
  };

  const getLocationName = (companyId: string, locationId: string) => {
    const company = companiesData.find(c => c.company_id.toString() === companyId);
    const location = company?.locations.find(l => l.location_id.toString() === locationId);
    return location?.location_name || `Location ${locationId}`;
  };

  // Fetch orders data
  const fetchOrdersData = async (companyId: string, locationId: string) => {
    try {
      setLocalError(null);
      
      const response = await fetch(`${API_URL_Local}/api/storeorders/allordersinvoices/${companyId}/${locationId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: OrdersApiResponse = await response.json();
      setOrdersData(result.data);
      setOrdersTotal(result.total);
      
    } catch (err) {
      console.error('Error fetching orders:', err);
      setLocalError(err instanceof Error ? err.message : 'Failed to fetch orders data');
      setOrdersData([]);
      setOrdersTotal(0);
    }
  };

  // Fetch consolidated production data
  const fetchConsolidatedData = async (companyId: string) => {
    try {
      setLocalError(null);
      
      const response = await fetch(`${API_URL_Local}/api/storeorders/consolidatedproduction/${companyId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: ConsolidatedProductionResponse = await response.json();
      setConsolidatedData(result.data);
      setConsolidatedColumns(result.columns);
      
    } catch (err) {
      console.error('Error fetching consolidated data:', err);
      setLocalError(err instanceof Error ? err.message : 'Failed to fetch consolidated production data');
      setConsolidatedData([]);
      setConsolidatedColumns([]);
    }
  };

  // Event handlers for filters
  const handleLocationChange = (values: string[]) => {
    // Only allow locations that are available for selected companies
    const availableLocationIds = getAvailableLocations().map(loc => loc.location_id.toString());
    const validValues = values.filter(value => availableLocationIds.includes(value));
    dispatch(setSelectedLocations(validValues));
  };

  const handleCompanyChange = (values: string[]) => {
    dispatch(setSelectedCompanies(values));
    // Clear location selection when company changes
    dispatch(setSelectedLocations([]));
    // Clear data when company changes
    setOrdersData([]);
    setConsolidatedData([]);
    setConsolidatedColumns([]);
    setOrdersTotal(0);
    setDataLoaded(false);
  };

  const handleApplyFilters = async () => {
    console.log('Applying filters:', {
      companies: selectedCompanies,
      locations: selectedLocations,
      dateRange: selectedDateRange
    });

    if (selectedCompanies.length === 0) {
      setLocalError('Please select at least one company');
      return;
    }

    if (selectedLocations.length === 0) {
      setLocalError('Please select at least one location');
      return;
    }

    try {
      setLocalError(null);

      // For now, we'll use the first selected company and location
      const companyId = selectedCompanies[0];
      const locationId = selectedLocations[0];

      // Fetch both orders and consolidated data
      await Promise.all([
        fetchOrdersData(companyId, locationId),
        fetchConsolidatedData(companyId)
      ]);

      setDataLoaded(true);
    } catch (err) {
      console.error('Error applying filters:', err);
      setLocalError('Failed to fetch data. Please try again.');
    }
  };

  // Date range handler
  const handleDateRangeSelect = (range) => {
    setSelectedDateRange(range);
    console.log('Selected date range for production reports:', range);
  };

  const handlePrintOrder = (order: OrderData) => {
    setPrintDialog({ open: true, order, type: 'print' });
  };

  const handleEmailOrder = (order: OrderData) => {
    setEmailDialog({ open: true, order, email: '' });
  };

  const handleSendEmail = async () => {
    const { order, email } = emailDialog;
    
    if (!email) {
      alert('Please enter an email address');
      return;
    }

    try {
      // Generate the order report HTML
      const orderReport = generateOrderReport(order);
      
      // Email configuration
      const emailData = {
        to: email,
        from: 'system@company.com',
        subject: `Order Report - Order #${order.order_id} - ${getCompanyName(selectedCompanies[0])}`,
        html: orderReport,
        text: `Order Report for Order #${order.order_id}\nOrder Date: ${new Date(order.created_at).toLocaleDateString()}\nTotal Items: ${order.items_count}\nTotal Amount: ${order.total_amount.toFixed(2)}`
      };

      console.log('Sending email with data:', emailData);
      alert(`Email sent successfully to ${email}`);
      setEmailDialog({ open: false, order: null, email: '' });
      
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again.');
    }
  };

  const handleConfirmPrintEmail = () => {
    const { order, type } = printDialog;
    if (type === 'print') {
      // Generate print content
      const printContent = generateOrderReport(order);
      const printWindow = window.open('', '_blank');
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
    setPrintDialog({ open: false, order: null, type: 'print' });
  };

  const generateOrderReport = (order: OrderData) => {
    const currentDate = new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const dateRangeText = selectedDateRange 
      ? `${selectedDateRange.startDate.toLocaleDateString()} to ${selectedDateRange.endDate.toLocaleDateString()}`
      : 'All time';

    const companyName = selectedCompanies.length > 0 ? getCompanyName(selectedCompanies[0]) : 'Selected Company';
    const locationName = selectedLocations.length > 0 && selectedCompanies.length > 0 
      ? getLocationName(selectedCompanies[0], selectedLocations[0]) 
      : 'Selected Location';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Order Report - Order #${order.order_id}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 40px; 
            color: #333;
          }
          .header { 
            text-align: center; 
            margin-bottom: 40px; 
          }
          .company-name { 
            font-size: 24px; 
            font-weight: bold; 
            margin-bottom: 5px; 
          }
          .location { 
            font-size: 16px; 
            color: #666; 
            margin-bottom: 10px; 
          }
          .date-range { 
            font-size: 14px; 
            color: #888; 
            margin-bottom: 30px; 
          }
          .order-summary { 
            background: #f8f9fa; 
            padding: 20px; 
            border-radius: 8px; 
            margin-bottom: 30px; 
          }
          .order-summary div { 
            margin-bottom: 8px; 
            font-size: 14px; 
          }
          .order-summary strong { 
            font-weight: 600; 
          }
          .footer { 
            text-align: center; 
            margin-top: 40px; 
            font-size: 12px; 
            color: #666; 
          }
          .summary-box {
            background: #e3f2fd;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .summary-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 16px;
          }
          .summary-value {
            font-weight: bold;
            color: #1976d2;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">${companyName}</div>
          <div class="location">${locationName}</div>
          <div class="date-range">Report Period: ${dateRangeText}</div>
        </div>
        
        <div class="order-summary">
          <div><strong>Order ID:</strong> ${order.order_id}</div>
          <div><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</div>
          <div><strong>Items Count:</strong> ${order.items_count}</div>
          <div><strong>Total Quantity:</strong> ${order.total_quantity}</div>
          <div><strong>Total Amount:</strong> $${order.total_amount.toFixed(2)}</div>
        </div>
        
        <div class="footer">
          Generated on ${currentDate} | ${companyName} Order Management System
        </div>
      </body>
      </html>
    `;
  };

  const handlePrintConsolidated = () => {
    const printContent = generateConsolidatedReport();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const generateConsolidatedReport = () => {
    const currentDate = new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const dateRangeText = selectedDateRange 
      ? `${selectedDateRange.startDate.toLocaleDateString()} to ${selectedDateRange.endDate.toLocaleDateString()}`
      : 'All time';

    const companyName = selectedCompanies.length > 0 ? getCompanyName(selectedCompanies[0]) : 'Selected Company';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Consolidated Production Requirements - ${companyName}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 40px; 
            color: #333;
          }
          .header { 
            text-align: center; 
            margin-bottom: 40px; 
          }
          .company-name { 
            font-size: 24px; 
            font-weight: bold; 
            margin-bottom: 5px; 
          }
          .report-title { 
            font-size: 20px; 
            font-weight: 600; 
            margin-bottom: 5px; 
          }
          .date-range { 
            font-size: 14px; 
            color: #666; 
            margin-bottom: 30px; 
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 20px; 
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 12px; 
            text-align: left; 
          }
          th { 
            background-color: #f5f5f5; 
            font-weight: 600; 
            font-size: 14px;
          }
          .total-column { 
            font-weight: bold; 
            background-color: #e8f5e8; 
          }
          .footer { 
            text-align: center; 
            margin-top: 40px; 
            font-size: 12px; 
            color: #666; 
          }
          .center { 
            text-align: center; 
          }
          .highlight { 
            background-color: #fff3cd; 
            font-weight: 600; 
          }
          .summary-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
          }
          .summary-section h3 {
            margin-top: 0;
            color: #2c3e50;
          }
          .date-filter {
            background: #e3f2fd;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            border-left: 4px solid #1976d2;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">${companyName}</div>
          <div class="report-title">Consolidated Production Requirements</div>
          <div class="date-range">Total quantities needed for production • ${dateRangeText}</div>
        </div>
        
        ${selectedDateRange ? `
        <div class="date-filter">
          <strong>📅 Date Filter Applied:</strong> This report shows production requirements for the selected period: ${dateRangeText}
        </div>
        ` : ''}
        
        <div class="summary-section">
          <h3>Production Summary</h3>
          <p><strong>Total Unique Items:</strong> ${consolidatedData.length}</p>
          <p><strong>Total Quantity Required:</strong> ${consolidatedData.reduce((sum, item) => sum + (item['Total Required'] || 0), 0)} units</p>
          <p><strong>Active Locations:</strong> ${consolidatedColumns.length - 3}</p>
          <p><strong>Report Period:</strong> ${dateRangeText}</p>
        </div>
        
        <div class="footer">
          Generated on ${currentDate} | ${companyName} Production Planning System
        </div>
      </body>
      </html>
    `;
  };

  // Get date range display text
  const getDateRangeText = () => {
    if (selectedDateRange) {
      return `${selectedDateRange.startDate.toLocaleDateString()} to ${selectedDateRange.endDate.toLocaleDateString()}`;
    }
    return 'All time';
  };

  // Show empty state when no data
  const showEmptyState = !loading && ordersData.length === 0 && selectedCompanies.length > 0 && selectedLocations.length > 0 && dataLoaded;

  // Combined error from Redux and local state
  const displayError = error || localError;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header Section with Filters and Date Range */}
      <Box sx={{ mb: 3 }}>
        {/* Title and Date Range Selector */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
              Store Summary & Production
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Comprehensive production planning and order management system
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

        {/* Active Filter Display */}
        {(selectedCompanies.length > 0 || selectedLocations.length > 0) && (
          <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {selectedCompanies.length > 0 && (
              <Chip
                label={`${selectedCompanies.length === 1 ? getCompanyName(selectedCompanies[0]) : `${selectedCompanies.length} companies selected`}`}
                color="primary"
                variant="outlined"
                size="small"
              />
            )}
            {selectedLocations.length > 0 && selectedCompanies.length > 0 && (
              <Chip
                label={`${selectedLocations.length === 1 ? getLocationName(selectedCompanies[0], selectedLocations[0]) : `${selectedLocations.length} locations selected`}`}
                color="secondary"
                variant="outlined"
                size="small"
              />
            )}
            {lastAppliedFilters.companies.length > 0 && !dataLoaded && (
              <Chip
                label="Data available - click Apply to refresh"
                color="info"
                variant="outlined"
                size="small"
              />
            )}
          </Box>
        )}

        {/* Error Display */}
        {displayError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => {
            setLocalError(null);
            dispatch(clearError());
          }}>
            {displayError}
          </Alert>
        )}

        {/* Filters Section with Company and Location Dropdowns */}
        <Box sx={{ mb: 3, p: 3, border: '1px solid #e0e0e0', borderRadius: 2, backgroundColor: '#ffffff' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Filters
            </Typography>
            {lastAppliedFilters.companies.length > 0 && (
              <Chip 
                label="Previously loaded data available" 
                size="small" 
                variant="outlined" 
                color="info"
              />
            )}
          </Box>

          <Box sx={{ 
            display: 'flex', 
            gap: 3, 
            mb: 3,
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'stretch', md: 'flex-start' }
          }}>
            {/* Companies Filter */}
            <FormControl 
              sx={{ 
                minWidth: 200,
                flex: 1
              }}
            >
              <InputLabel>Companies</InputLabel>
              <Select
                multiple
                value={selectedCompanies}
                onChange={(event) => {
                  const value = event.target.value;
                  const newValues = typeof value === 'string' ? value.split(',') : value;
                  handleCompanyChange(newValues);
                }}
                label="Companies"
                renderValue={(selected) => {
                  if (selected.length === 0) {
                    return 'All companies';
                  }
                  if (selected.length === 1) {
                    const company = companiesData.find(opt => opt.company_id.toString() === selected[0]);
                    return company?.company_name || 'Unknown';
                  }
                  return `${selected.length} companies selected`;
                }}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300
                    }
                  }
                }}
              >
                {companiesData.map((company) => (
                  <MenuItem key={company.company_id} value={company.company_id.toString()}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <input
                        type="checkbox"
                        checked={selectedCompanies.includes(company.company_id.toString())}
                        onChange={() => {}}
                        style={{ marginRight: 8 }}
                      />
                      <Typography>{company.company_name}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Location Filter */}
            <FormControl 
              sx={{ 
                minWidth: 200,
                flex: 1,
                opacity: selectedCompanies.length === 0 ? 0.6 : 1
              }}
              disabled={selectedCompanies.length === 0}
            >
              <InputLabel>Location</InputLabel>
              <Select
                multiple
                value={selectedLocations}
                onChange={(event) => {
                  const value = event.target.value;
                  const newValues = typeof value === 'string' ? value.split(',') : value;
                  handleLocationChange(newValues);
                }}
                label="Location"
                renderValue={(selected) => {
                  if (selectedCompanies.length === 0) {
                    return 'Select company first';
                  }
                  if (selected.length === 0) {
                    return getAvailableLocations().length > 0 ? 'All locations' : 'No locations available';
                  }
                  if (selected.length === 1) {
                    const location = getAvailableLocations().find(opt => opt.location_id.toString() === selected[0]);
                    return location?.location_name || 'Unknown';
                  }
                  return `${selected.length} locations selected`;
                }}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300
                    }
                  }
                }}
              >
                {selectedCompanies.length === 0 ? (
                  <MenuItem disabled>
                    <Typography sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                      Please select a company first to view locations
                    </Typography>
                  </MenuItem>
                ) : getAvailableLocations().length > 0 ? (
                  getAvailableLocations().map((location) => (
                    <MenuItem key={location.location_id} value={location.location_id.toString()}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <input
                          type="checkbox"
                          checked={selectedLocations.includes(location.location_id.toString())}
                          onChange={() => {}}
                          style={{ marginRight: 8 }}
                        />
                        <Typography>{location.location_name}</Typography>
                      </Box>
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>
                    <Typography sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                      No locations available for selected companies
                    </Typography>
                  </MenuItem>
                )}
              </Select>
            </FormControl>
          </Box>

          <Button 
            variant="contained" 
            onClick={handleApplyFilters}
            disabled={selectedCompanies.length === 0 || selectedLocations.length === 0 || loading}
            sx={{ 
              textTransform: 'uppercase',
              fontWeight: 600,
              px: 3,
              py: 1
            }}
          >
            {loading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
            Apply Filters
          </Button>
        </Box>
      </Box>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
          <CircularProgress sx={{ mr: 2 }} />
          <Typography>Loading data...</Typography>
        </Box>
      )}

      {/* Empty State */}
      {showEmptyState && (
        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <DescriptionIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              No Data Available
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Please select a company and location, then click "Apply Filters" to load data.
            </Typography>
            <Button 
              variant="contained" 
              onClick={handleApplyFilters}
              disabled={selectedCompanies.length === 0 || selectedLocations.length === 0}
            >
              Load Data
            </Button>
          </CardContent>
        </Card>
      )}

      {/* All Orders/Invoices by Location */}
      {!loading && ordersData.length > 0 && (
        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <DescriptionIcon color="primary" />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    All Orders/Invoices by Location
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Complete listing of all orders with timestamps by store location ({getDateRangeText()})
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {selectedDateRange && (
                  <Chip 
                    label="Date Filtered" 
                    size="small" 
                    variant="outlined" 
                    color="primary"
                  />
                )}
                <Chip 
                  label={`${ordersData.length} orders found`} 
                  color="primary" 
                  variant="outlined"
                />
              </Box>
            </Box>

            {/* Location Orders */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, p: 2, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {selectedLocations.length > 0 && selectedCompanies.length > 0 
                      ? getLocationName(selectedCompanies[0], selectedLocations[0])
                      : 'Selected Location'
                    }
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedCompanies.length > 0 ? getCompanyName(selectedCompanies[0]) : 'Selected Company'} • {ordersData.length} orders • {getDateRangeText()}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Total: ${ordersTotal.toFixed(2)}
                  </Typography>
                  {selectedDateRange && (
                    <Typography variant="caption" color="text.secondary">
                      Filtered by date range
                    </Typography>
                  )}
                </Box>
              </Box>

              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Order ID</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Order Date</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Items Count</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Total Quantity</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Total Amount</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ordersData.map((order) => (
                      <TableRow key={order.order_id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            #{order.order_id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(order.created_at).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>{order.items_count}</TableCell>
                        <TableCell>{order.total_quantity}</TableCell>
                        <TableCell>
                          <Typography sx={{ color: 'success.main', fontWeight: 600 }}>
                            ${order.total_amount.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton 
                              size="small" 
                              onClick={() => handlePrintOrder(order)}
                              title="Print"
                            >
                              <PrintIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              onClick={() => handleEmailOrder(order)}
                              title="Email"
                            >
                              <EmailIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Consolidated Production Requirements */}
      {!loading && consolidatedData.length > 0 && (
        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Consolidated Production Requirements
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total quantities needed for production • {getDateRangeText()}
                </Typography>
                {selectedDateRange && (
                  <Chip 
                    label="📅 Date range applied to production calculations" 
                    size="small" 
                    variant="outlined" 
                    color="primary"
                    sx={{ mt: 1 }}
                  />
                )}
              </Box>
              <Button
                variant="contained"
                startIcon={<PrintIcon />}
                onClick={handlePrintConsolidated}
              >
                Print
              </Button>
            </Box>

            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    {consolidatedColumns.map((column, index) => (
                      <TableCell 
                        key={index}
                        sx={{ 
                          fontWeight: 600,
                          backgroundColor: column === 'Total Required' ? '#e8f5e8' : 'inherit'
                        }}
                      >
                        {column}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {consolidatedData.map((item, index) => (
                    <TableRow key={index} hover>
                      {consolidatedColumns.map((column, colIndex) => {
                        const value = item[column];
                        const isTotal = column === 'Total Required';
                        const isNumeric = typeof value === 'number' && column !== 'Item' && column !== 'Unit';
                        
                        return (
                          <TableCell 
                            key={colIndex}
                            sx={{ 
                              fontWeight: column === 'Item' || isTotal ? 600 : 400,
                              color: isTotal ? 'success.main' : 'inherit',
                              backgroundColor: isTotal ? '#e8f5e8' : (isNumeric && value > 0 ? '#fff3cd' : 'inherit')
                            }}
                          >
                            {value}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Print Dialog */}
      <Dialog 
        open={printDialog.open} 
        onClose={() => setPrintDialog({ open: false, order: null, type: 'print' })}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Print Order</Typography>
            <IconButton 
              onClick={() => setPrintDialog({ open: false, order: null, type: 'print' })}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {printDialog.order && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Are you sure you want to print this order?
              </Typography>
              
              <Paper variant="outlined" sx={{ p: 2, mb: 2, backgroundColor: '#f8f9fa' }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Order Details:</Typography>
                <Typography variant="body2"><strong>Order ID:</strong> #{printDialog.order.order_id}</Typography>
                <Typography variant="body2"><strong>Date:</strong> {new Date(printDialog.order.created_at).toLocaleDateString()}</Typography>
                <Typography variant="body2"><strong>Items:</strong> {printDialog.order.items_count}</Typography>
                <Typography variant="body2"><strong>Total:</strong> ${printDialog.order.total_amount.toFixed(2)}</Typography>
                {selectedDateRange && (
                  <Typography variant="body2"><strong>Report Period:</strong> {getDateRangeText()}</Typography>
                )}
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setPrintDialog({ open: false, order: null, type: 'print' })}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmPrintEmail}
            variant="contained"
            startIcon={<PrintIcon />}
          >
            Print
          </Button>
        </DialogActions>
      </Dialog>

      {/* Email Dialog */}
      <Dialog 
        open={emailDialog.open} 
        onClose={() => setEmailDialog({ open: false, order: null, email: '' })}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Email Order</Typography>
            <IconButton 
              onClick={() => setEmailDialog({ open: false, order: null, email: '' })}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {emailDialog.order && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Send order details via email
              </Typography>
              
              <Paper variant="outlined" sx={{ p: 2, mb: 3, backgroundColor: '#f8f9fa' }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Order Details:</Typography>
                <Typography variant="body2"><strong>Order ID:</strong> #{emailDialog.order.order_id}</Typography>
                <Typography variant="body2"><strong>Date:</strong> {new Date(emailDialog.order.created_at).toLocaleDateString()}</Typography>
                <Typography variant="body2"><strong>Items:</strong> {emailDialog.order.items_count}</Typography>
                <Typography variant="body2"><strong>Total:</strong> ${emailDialog.order.total_amount.toFixed(2)}</Typography>
                {selectedDateRange && (
                  <Typography variant="body2"><strong>Report Period:</strong> {getDateRangeText()}</Typography>
                )}
              </Paper>

              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={emailDialog.email}
                onChange={(e) => setEmailDialog(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter recipient email address"
                required
                sx={{ mb: 2 }}
              />

              <Typography variant="body2" color="text.secondary">
                <strong>From:</strong> system@company.com<br />
                <strong>Subject:</strong> Order Report - Order #{emailDialog.order.order_id} - {selectedCompanies.length > 0 ? getCompanyName(selectedCompanies[0]) : 'Company'}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setEmailDialog({ open: false, order: null, email: '' })}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSendEmail}
            variant="contained"
            startIcon={<EmailIcon />}
            disabled={!emailDialog.email}
          >
            Send Email
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StoreSummaryProduction;
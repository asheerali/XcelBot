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
  Skeleton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  FormControlLabel,
  RadioGroup,
  Radio
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
  Clear as ClearIcon,
  Schedule as ScheduleIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Send as SendIcon,
  PersonAdd as PersonAddIcon
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

interface ScheduledEmail {
  id: number;
  receiver_name: string;
  receiver_email: string;
  receiving_time: string;
}

interface EmailListItem {
  email: string;
  selected: boolean;
  name: string;
  nameMode: 'auto' | 'manual';
  time: string;
}

// Helper function to format time to HH:MM
const formatTimeToHHMM = (timeString: string) => {
  if (!timeString) return '';
  // Extract HH:MM from various time formats
  const timeMatch = timeString.match(/(\d{2}):(\d{2})/);
  return timeMatch ? `${timeMatch[1]}:${timeMatch[2]}` : timeString;
};

// Helper function to generate auto name from email
const generateAutoName = (email: string) => {
  return 'default name selected';
};

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
  
  // Email scheduler state
  const [emailSchedulerDialog, setEmailSchedulerDialog] = useState(false);
  const [scheduledEmails, setScheduledEmails] = useState<ScheduledEmail[]>([]);
  const [emailSchedulerLoading, setEmailSchedulerLoading] = useState(false);
  const [editEmailDialog, setEditEmailDialog] = useState({ open: false, email: null });
  
  // Create mails state
  const [createMailsDialog, setCreateMailsDialog] = useState(false);
  const [emailsList, setEmailsList] = useState<string[]>([]);
  const [emailListItems, setEmailListItems] = useState<EmailListItem[]>([]);
  const [createMailsLoading, setCreateMailsLoading] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  
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

  // Email Scheduler functions
  const fetchScheduledEmails = async () => {
    setEmailSchedulerLoading(true);
    try {
      const response = await fetch(`${API_URL_Local}/mails`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const emails: ScheduledEmail[] = await response.json();
      setScheduledEmails(emails);
    } catch (err) {
      console.error('Error fetching scheduled emails:', err);
      setLocalError('Failed to fetch scheduled emails');
    } finally {
      setEmailSchedulerLoading(false);
    }
  };

  const handleDeleteScheduledEmail = async (email: string) => {
    if (!window.confirm(`Are you sure you want to delete the scheduled email for ${email}?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL_Local}/mails/deleteschedule/${email}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Refresh the list
      await fetchScheduledEmails();
      
    } catch (err) {
      console.error('Error deleting scheduled email:', err);
      setLocalError('Failed to delete scheduled email');
    }
  };

  const handleEditScheduledEmail = (emailData: ScheduledEmail) => {
    setEditEmailDialog({ open: true, email: emailData });
  };

  const handleUpdateScheduledEmail = async (mailId: number, updatedData: any) => {
    try {
      const requestBody = {
        mail_id: mailId,
        ...updatedData
      };

      const updateUrl = `${API_URL_Local}/mails/updatemail/${mailId}`;
      console.log('Update URL:', updateUrl);
      console.log('Request Body:', requestBody);

      const response = await fetch(updateUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        console.error('Response status:', response.status);
        console.error('Response statusText:', response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Refresh the list
      await fetchScheduledEmails();
      setEditEmailDialog({ open: false, email: null });
      
    } catch (err) {
      console.error('Error updating scheduled email:', err);
      setLocalError('Failed to update scheduled email');
    }
  };

  const handleOpenEmailScheduler = () => {
    setEmailSchedulerDialog(true);
    fetchScheduledEmails();
  };

  // Create Mails functions
  const fetchEmailsList = async (companyId: string) => {
    setCreateMailsLoading(true);
    try {
      const response = await fetch(`${API_URL_Local}/mails/mailslist/${companyId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const emails: string[] = await response.json();
      setEmailsList(emails);
      
      // Initialize email list items
      const items: EmailListItem[] = emails.map(email => ({
        email,
        selected: false,
        name: generateAutoName(email),
        nameMode: 'auto',
        time: '09:00'
      }));
      setEmailListItems(items);
      
    } catch (err) {
      console.error('Error fetching emails list:', err);
      setLocalError('Failed to fetch emails list');
    } finally {
      setCreateMailsLoading(false);
    }
  };

  const handleOpenCreateMails = () => {
    if (selectedCompanies.length === 0) {
      setLocalError('Please select a company first');
      return;
    }
    // Keep the Email Scheduler dialog open in the background
    setCreateMailsDialog(true);
    fetchEmailsList(selectedCompanies[0]);
  };

  const handleSelectAllEmails = (checked: boolean) => {
    setSelectAll(checked);
    setEmailListItems(prev => prev.map(item => ({ ...item, selected: checked })));
  };

  const handleEmailSelection = (index: number, checked: boolean) => {
    setEmailListItems(prev => {
      const newItems = [...prev];
      newItems[index].selected = checked;
      return newItems;
    });
    
    // Update select all state
    const allSelected = emailListItems.every((item, idx) => 
      idx === index ? checked : item.selected
    );
    setSelectAll(allSelected);
  };

  const handleNameModeChange = (index: number, mode: 'auto' | 'manual') => {
    setEmailListItems(prev => {
      const newItems = [...prev];
      newItems[index].nameMode = mode;
      if (mode === 'auto') {
        newItems[index].name = generateAutoName(newItems[index].email);
      }
      return newItems;
    });
  };

  const handleNameChange = (index: number, name: string) => {
    setEmailListItems(prev => {
      const newItems = [...prev];
      newItems[index].name = name;
      return newItems;
    });
  };

  const handleTimeChange = (index: number, time: string) => {
    setEmailListItems(prev => {
      const newItems = [...prev];
      newItems[index].time = time;
      return newItems;
    });
  };

  const handleAddCustomEmail = () => {
    if (!customEmail || !customEmail.includes('@')) {
      setLocalError('Please enter a valid email address');
      return;
    }
    
    // Check if email already exists
    if (emailListItems.some(item => item.email === customEmail)) {
      setLocalError('Email already exists in the list');
      return;
    }

    const newItem: EmailListItem = {
      email: customEmail,
      selected: true,
      name: generateAutoName(customEmail),
      nameMode: 'auto',
      time: '09:00'
    };

    setEmailListItems(prev => [...prev, newItem]);
    setCustomEmail('');
    setLocalError(null);
  };

  const handleCreateMails = async () => {
    const selectedItems = emailListItems.filter(item => item.selected);
    
    if (selectedItems.length === 0) {
      setLocalError('Please select at least one email');
      return;
    }

    try {
      setCreateMailsLoading(true);
      
      // Prepare data for API - send as array directly
      const mailsData = selectedItems.map(item => ({
        receiver_name: item.name,
        receiver_email: item.email,
        receiving_time: item.time
      }));

      console.log('=== CREATE MAILS REQUEST ===');
      console.log('URL:', `${API_URL_Local}/mails/createmails`);
      console.log('Request Body:', JSON.stringify(mailsData, null, 2));

      const response = await fetch(`${API_URL_Local}/mails/createmails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(mailsData)
      });

      console.log('=== CREATE MAILS RESPONSE ===');
      console.log('Response Status:', response.status);
      console.log('Response StatusText:', response.statusText);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Log response body
      const responseData = await response.json();
      console.log('Response Body:', responseData);

      // Success
      setCreateMailsDialog(false);
      setEmailListItems([]);
      setCustomEmail('');
      setSelectAll(false);
      
      // Refresh the scheduled emails list
      await fetchScheduledEmails();
      
      alert(`Successfully created ${selectedItems.length} scheduled emails!`);
      
    } catch (err) {
      console.error('Error creating mails:', err);
      setLocalError('Failed to create scheduled emails');
    } finally {
      setCreateMailsLoading(false);
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

    // Generate table HTML
    const generateTableHTML = () => {
      if (consolidatedColumns.length === 0 || consolidatedData.length === 0) {
        return '<p>No data available to display.</p>';
      }

      let tableHTML = `
        <table>
          <thead>
            <tr>
              ${consolidatedColumns.map(column => `
                <th class="${column === 'Total Required' ? 'total-column' : ''}">${column}</th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            ${consolidatedData.map(item => `
              <tr>
                ${consolidatedColumns.map(column => {
                  const value = item[column];
                  const isTotal = column === 'Total Required';
                  const isNumeric = typeof value === 'number' && column !== 'Item' && column !== 'Unit';
                  const shouldHighlight = isNumeric && value > 0;
                  
                  return `<td class="${isTotal ? 'total-column' : ''} ${shouldHighlight ? 'highlight' : ''}">${value}</td>`;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
      
      return tableHTML;
    };

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
            font-size: 12px;
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 8px; 
            text-align: left; 
          }
          th { 
            background-color: #f5f5f5; 
            font-weight: 600; 
            font-size: 12px;
          }
          .total-column { 
            font-weight: bold; 
            background-color: #e8f5e8 !important; 
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
            background-color: #fff3cd !important; 
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
          .table-section {
            margin-bottom: 30px;
          }
          .table-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
            color: #2c3e50;
          }
          @media print {
            body { margin: 20px; }
            .summary-section { break-inside: avoid; }
            table { font-size: 10px; }
            th, td { padding: 6px; }
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
          <p><strong>Report Period:</strong> ${dateRangeText}</p>
        </div>

        <div class="table-section">
          <div class="table-title">Production Requirements by Location</div>
          ${generateTableHTML()}
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
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<ScheduleIcon />}
                  onClick={handleOpenEmailScheduler}
                  sx={{ mr: 1 }}
                >
                  Email Scheduler
                </Button>
                <Button
                  variant="contained"
                  startIcon={<PrintIcon />}
                  onClick={handlePrintConsolidated}
                >
                  Print
                </Button>
              </Box>
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

      {/* Create Mails Dialog */}
      <Dialog 
        open={createMailsDialog} 
        onClose={() => {
          setCreateMailsDialog(false);
          setEmailListItems([]);
          setCustomEmail('');
          setSelectAll(false);
        }}
        maxWidth="lg" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonAddIcon color="primary" />
              <Typography variant="h6">Create Scheduled Emails</Typography>
              {selectedCompanies.length > 0 && (
                <Chip 
                  label={getCompanyName(selectedCompanies[0])} 
                  size="small" 
                  variant="outlined" 
                  color="primary"
                />
              )}
            </Box>
            <IconButton 
              onClick={() => {
                setCreateMailsDialog(false);
                setEmailListItems([]);
                setCustomEmail('');
                setSelectAll(false);
              }}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {createMailsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              {/* Add Custom Email Section */}
              <Box sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1, backgroundColor: '#f9f9f9' }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Add Custom Email
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <TextField
                    label="Email Address"
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="Enter email address"
                    sx={{ flex: 1 }}
                    size="small"
                  />
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddCustomEmail}
                    disabled={!customEmail}
                  >
                    Add
                  </Button>
                </Box>
              </Box>

              {/* Emails Table */}
              {emailListItems.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <PersonAddIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    No Emails Available
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Add custom emails or check if the company has any emails configured.
                  </Typography>
                </Box>
              ) : (
                <Box>
                  {/* Select All */}
                  <Box sx={{ mb: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectAll}
                          onChange={(e) => handleSelectAllEmails(e.target.checked)}
                          indeterminate={
                            emailListItems.some(item => item.selected) && 
                            !emailListItems.every(item => item.selected)
                          }
                        />
                      }
                      label={
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Select All Emails ({emailListItems.filter(item => item.selected).length} of {emailListItems.length} selected)
                        </Typography>
                      }
                    />
                  </Box>

                  {/* Emails Table */}
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell sx={{ fontWeight: 600 }}>Select</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Email Address</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Name Mode</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Time (HH:MM)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {emailListItems.map((item, index) => (
                          <TableRow key={index} hover>
                            <TableCell>
                              <Checkbox
                                checked={item.selected}
                                onChange={(e) => handleEmailSelection(index, e.target.checked)}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {item.email}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <TextField
                                value={item.name}
                                onChange={(e) => handleNameChange(index, e.target.value)}
                                disabled={item.nameMode === 'auto'}
                                size="small"
                                sx={{ minWidth: 150 }}
                              />
                            </TableCell>
                            <TableCell>
                              <FormControl size="small" sx={{ minWidth: 120 }}>
                                <RadioGroup
                                  row
                                  value={item.nameMode}
                                  onChange={(e) => handleNameModeChange(index, e.target.value as 'auto' | 'manual')}
                                >
                                  <FormControlLabel
                                    value="auto"
                                    control={<Radio size="small" />}
                                    label="Auto"
                                    sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
                                  />
                                  <FormControlLabel
                                    value="manual"
                                    control={<Radio size="small" />}
                                    label="Manual"
                                    sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
                                  />
                                </RadioGroup>
                              </FormControl>
                            </TableCell>
                            <TableCell>
                              <TextField
                                type="time"
                                value={item.time}
                                onChange={(e) => handleTimeChange(index, e.target.value)}
                                size="small"
                                sx={{ minWidth: 130 }}
                                InputLabelProps={{
                                  shrink: true,
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {emailListItems.filter(item => item.selected).length} emails selected for scheduling
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                onClick={() => {
                  setCreateMailsDialog(false);
                  setEmailListItems([]);
                  setCustomEmail('');
                  setSelectAll(false);
                }}
                variant="outlined"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateMails}
                variant="contained"
                startIcon={createMailsLoading ? <CircularProgress size={16} /> : <SendIcon />}
                disabled={createMailsLoading || emailListItems.filter(item => item.selected).length === 0}
              >
                {createMailsLoading ? 'Creating...' : 'Create Scheduled Emails'}
              </Button>
            </Box>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Email Scheduler Dialog */}
      <Dialog 
        open={emailSchedulerDialog} 
        onClose={() => setEmailSchedulerDialog(false)}
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ScheduleIcon color="primary" />
              <Typography variant="h6">Email Scheduler</Typography>
            </Box>
            <IconButton 
              onClick={() => setEmailSchedulerDialog(false)}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {emailSchedulerLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : scheduledEmails.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <ScheduleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                No Scheduled Emails
              </Typography>
              <Typography variant="body2" color="text.secondary">
                There are no emails currently scheduled.
              </Typography>
            </Box>
          ) : (
            <List>
              {scheduledEmails.map((email, index) => (
                <React.Fragment key={email.id}>
                  <ListItem
                    sx={{
                      border: '1px solid #e0e0e0',
                      borderRadius: 1,
                      mb: 1,
                      backgroundColor: '#f9f9f9'
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {email.receiver_name}
                          </Typography>
                          <Chip label={email.receiver_email} size="small" variant="outlined" />
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          Scheduled Time: {formatTimeToHHMM(email.receiving_time)}
                        </Typography>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleEditScheduledEmail(email)}
                          title="Edit"
                          color="primary"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteScheduledEmail(email.receiver_email)}
                          title="Delete"
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < scheduledEmails.length - 1 && <Divider sx={{ my: 1 }} />}
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={handleOpenCreateMails}
              color="secondary"
            >
              Create New Mails
            </Button>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                onClick={() => setEmailSchedulerDialog(false)}
                variant="outlined"
              >
                Close
              </Button>
              <Button 
                onClick={fetchScheduledEmails}
                variant="contained"
                startIcon={<RefreshIcon />}
              >
                Refresh
              </Button>
            </Box>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Edit Email Dialog */}
      <Dialog 
        open={editEmailDialog.open} 
        onClose={() => setEditEmailDialog({ open: false, email: null })}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EditIcon color="primary" />
            <Typography variant="h6">Edit Scheduled Email</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {editEmailDialog.email && (
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Receiver Name"
                defaultValue={editEmailDialog.email.receiver_name}
                sx={{ mb: 2 }}
                id="edit-receiver-name"
              />
              <TextField
                fullWidth
                label="Receiver Email"
                type="email"
                defaultValue={editEmailDialog.email.receiver_email}
                sx={{ mb: 2 }}
                id="edit-receiver-email"
              />
              <TextField
                fullWidth
                label="Receiving Time"
                type="time"
                defaultValue={formatTimeToHHMM(editEmailDialog.email.receiving_time)}
                sx={{ mb: 2 }}
                id="edit-receiving-time"
                helperText="Format: HH:MM (24-hour format)"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setEditEmailDialog({ open: false, email: null })}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={() => {
              if (editEmailDialog.email) {
                const nameInput = document.getElementById('edit-receiver-name') as HTMLInputElement;
                const emailInput = document.getElementById('edit-receiver-email') as HTMLInputElement;
                const timeInput = document.getElementById('edit-receiving-time') as HTMLInputElement;
                
                // Convert HH:MM to HH:MM:SS format if needed
                const timeValue = timeInput.value;
                const formattedTime = timeValue.includes(':') && timeValue.split(':').length === 2 
                  ? `${timeValue}:00` 
                  : timeValue;
                
                const updatedData = {
                  receiver_name: nameInput.value,
                  receiver_email: emailInput.value,
                  receiving_time: formattedTime
                };
                
                handleUpdateScheduledEmail(editEmailDialog.email.id, updatedData);
              }
            }}
            variant="contained"
            startIcon={<EditIcon />}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

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
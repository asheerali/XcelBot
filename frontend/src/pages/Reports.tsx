import React, { useState, useEffect } from 'react';
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
  ChevronDown,
  Building2
} from 'lucide-react';
import { styled, alpha } from '@mui/material/styles';
import axios from 'axios';

// Import Redux hooks
import { useAppDispatch, useAppSelector } from "../typedHooks";
import {
  selectSelectedCompanies,
  excelSlice,
} from "../store/excelSlice";

// Import masterFile selectors (don't modify masterFileSlice)
import { selectSelectedCompanies as selectMasterFileCompanies } from "../store/slices/masterFileSlice";

// Extract actions from the slice
const { setLoading, setError } = excelSlice.actions;

// Import your DateRangeSelector component
import DateRangeSelector from "../components/DateRangeSelector";

// Import API base URL from constants (following your project pattern)
import { API_URL_Local } from "../constants";

// API Configuration
const COMPANIES_API_URL = `${API_URL_Local}/companies`;
const LOGS_DETAILS_API_URL = `${API_URL_Local}/api/logs/details`;

// Interfaces for API response
interface LogsAPIResponse {
  message: string;
  data: LogEntry[];
  trend_analysis: TrendAnalysis[];
  totals: Totals;
  store_by_store: StoreByStore[];
}

interface LogEntry {
  id: number;
  company_id: number;
  company_name: string;
  filename: string;
  location_id: number;
  location_name: string;
  created_at: string;
  created_at_readable: string;
  file_data: {
    action: string;
    timestamp: string;
    user_id: number;
    original_data: {
      Category: string;
      Products: string;
      "Batch Size": string;
      UOM: string;
      "Current Price": number;
      "Previous Price": number;
    };
    updated_rows_count: number;
    masterfile_id: number;
    changes: {
      previous_price: number;
      new_price: number;
      change_percent: number;
      change_delta: number;
      change_p_n: string;
    };
  };
}

interface TrendAnalysis {
  location_id: number;
  location_name: string;
  created_at: string;
  products: string;
  change_percent: number;
  change_p_n: string;
}

interface Totals {
  total_items_tracked: number;
  price_increases: number;
  price_decreases: number;
  avg_price_increase: number;
  avg_price_decrease: number;
  total_value_impact: number;
}

interface StoreByStore {
  location_name: string;
  total_changes: number;
  increases: number;
  decreases: number;
}

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

// Company interface based on your actual API structure
interface Company {
  id: number;
  name: string;
  address: string;
  state: string;
  postcode: string;
  phone: string;
  email?: string;
  website?: string | null;
  created_at: string;
}

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

const StyledFormControl = styled(FormControl)(({ theme }) => ({
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
  const dispatch = useAppDispatch();
  
  // Redux selectors - get selected companies from masterFileSlice
  const masterFileSelectedCompanies = useAppSelector(selectMasterFileCompanies);
  
  // Local state
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    startDateStr: formatDate(new Date(), 'yyyy-MM-dd'),
    endDateStr: formatDate(new Date(), 'yyyy-MM-dd')
  });
  const [activeTab, setActiveTab] = useState(0);
  const [priceChangeFilter, setPriceChangeFilter] = useState('all');
  
  // Local company state for form display (not Redux)
  const [selectedCompany, setSelectedCompany] = useState<number | string>('all');
  
  // Companies state
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [companiesError, setCompaniesError] = useState<string | null>(null);

  // Logs data state
  const [logsData, setLogsData] = useState<LogsAPIResponse | null>(null);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState<string | null>(null);

  // Initialize with masterFile Redux company on component mount
  useEffect(() => {
    fetchCompanies();
    
    // Initialize with masterFile Redux company value if it exists
    if (masterFileSelectedCompanies && masterFileSelectedCompanies.length > 0) {
      const firstSelectedCompany = masterFileSelectedCompanies[0];
      console.log('🔄 Initializing with masterFile Redux company:', firstSelectedCompany);
      setSelectedCompany(firstSelectedCompany);
      fetchLogsData(parseInt(firstSelectedCompany));
    }
  }, []);

  // Watch for changes in masterFile selected companies
  useEffect(() => {
    if (masterFileSelectedCompanies && masterFileSelectedCompanies.length > 0) {
      const firstSelectedCompany = masterFileSelectedCompanies[0];
      console.log('🔄 masterFile Redux company changed:', firstSelectedCompany);
      setSelectedCompany(firstSelectedCompany);
      fetchLogsData(parseInt(firstSelectedCompany));
    }
  }, [masterFileSelectedCompanies]);

  const fetchCompanies = async () => {
    try {
      setCompaniesLoading(true);
      setCompaniesError(null);
      
      console.log('🔍 Fetching companies from:', COMPANIES_API_URL);
      const response = await axios.get(COMPANIES_API_URL);
      
      console.log('📥 Companies API response:', response.data);
      
      if (response.status === 200) {
        // Since your API doesn't include isActive field, we'll show all companies
        setCompanies(response.data);
        console.log('✅ Companies loaded successfully:', response.data);
      } else {
        throw new Error(`Failed to fetch companies: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error fetching companies:', error);
      setCompaniesError(error.message || 'Failed to load companies');
    } finally {
      setCompaniesLoading(false);
    }
  };

  const fetchLogsData = async (companyId: number) => {
    try {
      setLogsLoading(true);
      setLogsError(null);
      
      const url = `${LOGS_DETAILS_API_URL}/${companyId}`;
      console.log('🔍 Fetching logs data from:', url);
      
      const response = await axios.get(url);
      
      console.log('📥 Logs API response:', response.data);
      
      if (response.status === 200) {
        setLogsData(response.data);
        console.log('✅ Logs data loaded successfully');
      } else {
        throw new Error(`Failed to fetch logs data: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error fetching logs data:', error);
      setLogsError(error.message || 'Failed to load logs data');
      setLogsData(null);
    } finally {
      setLogsLoading(false);
    }
  };

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

  const handleCompanyChange = (event) => {
    const companyId = event.target.value;
    setSelectedCompany(companyId);
    console.log('🏢 User selected company:', companyId);
    
    // Fetch logs data when a specific company is selected
    if (companyId !== 'all') {
      fetchLogsData(companyId);
    } else {
      // Clear logs data when "All Companies" is selected
      setLogsData(null);
    }
    
    // DO NOT update Redux here - only when user applies filters
    // This maintains the requirement to not update Redux on filter change
  };

  const getSelectedCompanyName = () => {
    if (selectedCompany === 'all') return 'All Companies';
    const company = companies.find(c => c.id === selectedCompany);
    return company ? company.name : 'Unknown Company';
  };

  const formatDateRange = () => {
    if (selectedDateRange.startDateStr === selectedDateRange.endDateStr) {
      return formatDate(selectedDateRange.startDate, 'MMM dd, yyyy');
    }
    return `${formatDate(selectedDateRange.startDate, 'MMM dd')} - ${formatDate(selectedDateRange.endDate, 'MMM dd, yyyy')}`;
  };

  const formatDateOnly = (dateString: string) => {
    return dateString.split(' ')[0]; // Extract date part only (2025-07-01)
  };

  const formatChangePercent = (percent: number) => {
    if (Math.abs(percent) > 1000) {
      return `${percent > 0 ? '+' : ''}${percent.toExponential(1)}%`;
    }
    return `${percent > 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  const formatCurrency = (amount: number) => {
    if (Math.abs(amount) > 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (Math.abs(amount) > 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return `${amount.toFixed(2)}`;
  };

  // Process API data for the table
  const getFilteredData = () => {
    if (!logsData || !logsData.data) return [];
    
    return logsData.data.filter(item => {
      const isIncrease = item.file_data.changes.change_p_n === 'positive';
      
      if (priceChangeFilter === 'increase') return isIncrease;
      if (priceChangeFilter === 'decrease') return !isIncrease;
      return true; // 'all'
    });
  };

  const filteredData = getFilteredData();

  const tabs = ['Price Changes', 'Trend Analysis', 'Store Comparison'];

  // Get trend analysis data from API
  const getTrendAnalysisData = () => {
    if (!logsData || !logsData.trend_analysis) return { positive: [], negative: [] };
    
    const positive = logsData.trend_analysis.filter(item => item.change_p_n === 'positive');
    const negative = logsData.trend_analysis.filter(item => item.change_p_n === 'negative');
    
    return { positive, negative };
  };

  // Get store comparison data from API
  const getStoreComparisonData = () => {
    if (!logsData || !logsData.store_by_store) return [];
    return logsData.store_by_store;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp size={24} color="#1976d2" />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a237e' }}>
                  Recent Price Changes
                </Typography>
              </Box>
              
              {/* Price Change Filter Only */}
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

            {/* Loading state */}
            {logsLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  Loading price changes...
                </Typography>
              </Box>
            )}

            {/* Error state */}
            {logsError && (
              <Box sx={{ mb: 2 }}>
                <Chip
                  label={`Error loading data: ${logsError}`}
                  color="error"
                  variant="outlined"
                  size="small"
                />
              </Box>
            )}

            {/* No company selected */}
            {selectedCompany === 'all' && !logsLoading && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  Please select a company to view price changes.
                </Typography>
              </Box>
            )}

            {/* Data table */}
            {selectedCompany !== 'all' && !logsLoading && !logsError && (
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
                    {filteredData.map((item, index) => {
                      const isIncrease = item.file_data.changes.change_p_n === 'positive';
                      const changePercent = formatChangePercent(item.file_data.changes.change_percent);
                      const changeDelta = formatCurrency(item.file_data.changes.change_delta);
                      
                      return (
                        <TableRow key={index} sx={{ '&:hover': { bgcolor: alpha('#1976d2', 0.02) } }}>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                {item.file_data.original_data.Products}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {item.file_data.original_data.Category}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {item.location_name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={`${isIncrease ? '↑' : '↓'} ${changePercent}`}
                              size="small"
                              sx={{
                                backgroundColor: isIncrease ? alpha('#4caf50', 0.1) : alpha('#f44336', 0.1),
                                color: isIncrease ? '#4caf50' : '#f44336',
                                fontWeight: 600,
                                borderRadius: '8px'
                              }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                ${item.file_data.original_data['Previous Price']} → ${item.file_data.original_data['Current Price']}
                              </Typography>
                              <Typography variant="caption" sx={{ color: isIncrease ? '#4caf50' : '#f44336' }}>
                                {isIncrease ? '+' : ''}{changeDelta}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" color="text.secondary">
                              {formatDateOnly(item.created_at_readable)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {selectedCompany !== 'all' && !logsLoading && !logsError && filteredData.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No {priceChangeFilter === 'increase' ? 'price increases' : priceChangeFilter === 'decrease' ? 'price decreases' : 'price changes'} found for {getSelectedCompanyName()}.
                </Typography>
              </Box>
            )}
          </Box>
        );
      
      case 1:
        const trendData = getTrendAnalysisData();
        return (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <TrendingUp size={24} color="#1976d2" />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a237e' }}>
                Trend Analysis
              </Typography>
            </Box>

            {selectedCompany === 'all' && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  Please select a company to view trend analysis.
                </Typography>
              </Box>
            )}

            {selectedCompany !== 'all' && (
              <Grid container spacing={3}>
                {/* Price Increase Trends */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 3, borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#1a237e' }}>
                      Price Increase Trends
                    </Typography>
                    {trendData.positive.length === 0 ? (
                      <Box sx={{ p: 6, textAlign: 'center' }}>
                        <Typography variant="body1" color="text.secondary">
                          No price increases in the selected period
                        </Typography>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {trendData.positive.map((item, index) => (
                          <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: alpha('#f5f5f5', 0.5), borderRadius: '12px' }}>
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {item.products}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {item.location_name}
                              </Typography>
                            </Box>
                            <Chip
                              label={formatChangePercent(item.change_percent)}
                              sx={{
                                backgroundColor: alpha('#4caf50', 0.1),
                                color: '#4caf50',
                                fontWeight: 600,
                                borderRadius: '20px'
                              }}
                            />
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Card>
                </Grid>

                {/* Price Decrease Trends */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 3, borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#1a237e' }}>
                      Price Decrease Trends
                    </Typography>
                    {trendData.negative.length === 0 ? (
                      <Box sx={{ p: 6, textAlign: 'center' }}>
                        <Typography variant="body1" color="text.secondary">
                          No price decreases in the selected period
                        </Typography>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {trendData.negative.map((item, index) => (
                          <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: alpha('#f5f5f5', 0.5), borderRadius: '12px' }}>
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {item.products}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {item.location_name}
                              </Typography>
                            </Box>
                            <Chip
                              label={formatChangePercent(item.change_percent)}
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
                    )}
                  </Card>
                </Grid>
              </Grid>
            )}
          </Box>
        );
      
      case 2:
        const storeData = getStoreComparisonData();
        return (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <DollarSign size={24} color="#1976d2" />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a237e' }}>
                Store-by-Store Analysis
              </Typography>
            </Box>

            {selectedCompany === 'all' && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  Please select a company to view store analysis.
                </Typography>
              </Box>
            )}

            {selectedCompany !== 'all' && (
              <Grid container spacing={2}>
                {storeData.map((store, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card sx={{ p: 3, borderRadius: '12px', border: '1px solid', borderColor: 'divider', height: '100%' }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1a237e' }}>
                        {store.location_name}
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">
                            Total Changes:
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {store.total_changes}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">
                            Increases:
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#4caf50' }}>
                            {store.increases}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">
                            Decreases:
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#f44336' }}>
                            {store.decreases}
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        );
      
      default:
        return null;
    }
  };

  const metricCards = [
    {
      title: 'Total Items Tracked',
      value: logsData?.totals?.total_items_tracked?.toString() || '0',
      subtitle: `Items in ${getSelectedCompanyName()}`,
      icon: <Info size={20} color="#6c757d" />
    },
    {
      title: 'Price Increases',
      value: logsData?.totals?.price_increases?.toString() || '0',
      subtitle: `Avg: ${logsData?.totals?.avg_price_increase ? formatChangePercent(logsData.totals.avg_price_increase).replace('+', '') : '0.00%'}`,
      icon: <TrendingUp size={20} color="#4caf50" />,
      valueColor: '#4caf50'
    },
    {
      title: 'Price Decreases',
      value: logsData?.totals?.price_decreases?.toString() || '0',
      subtitle: `Avg: ${logsData?.totals?.avg_price_decrease ? formatChangePercent(Math.abs(logsData.totals.avg_price_decrease)).replace('+', '') : '0.00%'}`,
      icon: <TrendingDown size={20} color="#f44336" />,
      valueColor: '#f44336'
    },
    {
      title: 'Total Value Impact',
      value: logsData?.totals?.total_value_impact ? formatCurrency(logsData.totals.total_value_impact) : '$0.00',
      subtitle: logsData?.totals?.total_value_impact ? (logsData.totals.total_value_impact > 0 ? 'Cost increase' : 'Cost decrease') : 'No impact',
      icon: <DollarSign size={20} color="#1976d2" />,
      valueColor: logsData?.totals?.total_value_impact ? (logsData.totals.total_value_impact > 0 ? '#f44336' : '#4caf50') : '#1976d2'
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa' }}>
      {/* Header */}
      <HeroSection>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
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
              {selectedCompany !== 'all' && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#1976d2',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    mt: 0.5
                  }}
                >
                  Currently viewing: {getSelectedCompanyName()}
                  {masterFileSelectedCompanies.length > 0 && (
                    <Typography component="span" sx={{ fontSize: '0.8rem', color: 'text.secondary', ml: 1 }}>
                      (from master file selection)
                    </Typography>
                  )}
                </Typography>
              )}
            </Box>
            
            {/* Controls */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Company Selector */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#1a237e' }}>
                  Company
                </Typography>
                <StyledFormControl size="small">
                  <InputLabel>Company</InputLabel>
                  <Select
                    value={selectedCompany}
                    onChange={handleCompanyChange}
                    label="Company"
                    disabled={companiesLoading}
                    startAdornment={<Building2 size={16} style={{ marginRight: 8, color: '#1976d2' }} />}
                  >
                    <MenuItem value="all">All Companies</MenuItem>
                    {companies.map((company) => (
                      <MenuItem key={company.id} value={company.id}>
                        {company.name}
                      </MenuItem>
                    ))}
                  </Select>
                </StyledFormControl>
                
                {/* Company Loading/Error States */}
                {companiesLoading && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    Loading companies...
                  </Typography>
                )}
                
                {companiesError && (
                  <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                    Error loading companies
                  </Typography>
                )}
              </Box>

              {/* Date Range Picker */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#1a237e' }}>
                  Date Range
                </Typography>
                <DateRangeButton
                  onClick={handleDateRangeClick}
                  startIcon={<Calendar size={16} />}
                  size="small"
                >
                  {formatDateRange()}
                </DateRangeButton>
              </Box>
            </Box>
            
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
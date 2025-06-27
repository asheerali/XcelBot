import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  Chip,
  InputAdornment,
  TablePagination,
  Container,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  FormControlLabel,
  Switch,
  Grid
} from '@mui/material';

// Icons
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import SearchIcon from '@mui/icons-material/Search';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import RefreshIcon from '@mui/icons-material/Refresh';
import DescriptionIcon from '@mui/icons-material/Description';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ClearIcon from '@mui/icons-material/Clear';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FiltersOrderIQ from '../components/FiltersOrderIQ';
import DateRangeSelector from '../components/DateRangeSelector';

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
        style={{
          borderRadius: '8px',
          textTransform: 'none',
          minWidth: '180px',
          justifyContent: 'flex-start'
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
          style: {
            borderRadius: '12px',
            maxHeight: '80vh'
          }
        }}
      >
        <DialogTitle style={{ 
          borderBottom: '1px solid #e0e0e0',
          paddingBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <CalendarTodayIcon color="primary" />
          Select Date Range
        </DialogTitle>
        
        <DialogContent style={{ padding: '0' }}>
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
        
        <DialogActions style={{ 
          padding: '16px 24px',
          borderTop: '1px solid #e0e0e0',
          justifyContent: 'space-between'
        }}>
          <Typography variant="body2" style={{ color: '#666' }}>
            {tempRange && `${tempRange.startDate?.toLocaleDateString()} - ${tempRange.endDate?.toLocaleDateString()}`}
          </Typography>
          <Box style={{ display: 'flex', gap: '8px' }}>
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

// FiltersOrderIQ2 Component
const FiltersOrderIQ2 = ({ 
  onFiltersChange, 
  totalItems, 
  filteredItems,
  units = [],
  categories = []
}) => {
  const [filters, setFilters] = useState({
    priceRange: [0, 20],
    stockStatus: 'all',
    unit: 'all',
    category: 'all',
    priceChange: 'all',
    showLowStock: false,
    showOutOfStock: false
  });
  
  const [expanded, setExpanded] = useState(false);

  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      priceRange: [0, 20],
      stockStatus: 'all',
      unit: 'all',
      category: 'all',
      priceChange: 'all',
      showLowStock: false,
      showOutOfStock: false
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.stockStatus !== 'all') count++;
    if (filters.unit !== 'all') count++;
    if (filters.category !== 'all') count++;
    if (filters.priceChange !== 'all') count++;
    if (filters.showLowStock) count++;
    if (filters.showOutOfStock) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 20) count++;
    return count;
  };

  return (
    <Box style={{ marginBottom: 24 }}>
      <Accordion 
        expanded={expanded} 
        onChange={() => setExpanded(!expanded)}
        style={{ 
          border: '1px solid #e0e0e0',
          borderRadius: 8,
          boxShadow: 'none',
          '&:before': { display: 'none' }
        }}
      >
        <AccordionSummary 
          expandIcon={<ExpandMoreIcon />}
          style={{ 
            backgroundColor: '#f8f9fa',
            borderRadius: expanded ? '8px 8px 0 0' : '8px',
            minHeight: 64
          }}
        >
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginRight: 16 }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <FilterListIcon color="primary" />
              <Typography variant="h6" style={{ fontWeight: 600 }}>
                Advanced Filters & Search
              </Typography>
              {getActiveFiltersCount() > 0 && (
                <Chip 
                  label={`${getActiveFiltersCount()} active`}
                  color="primary"
                  size="small"
                />
              )}
            </Box>
            <Typography variant="body2" style={{ color: '#666' }}>
              Showing {filteredItems} of {totalItems} items
            </Typography>
          </Box>
        </AccordionSummary>
        
        <AccordionDetails style={{ padding: 24 }}>
          <Grid container spacing={3}>
            {/* Price Range Filter */}
            <Grid item xs={12} md={3}>
              <Typography gutterBottom variant="subtitle2" style={{ fontWeight: 600 }}>
                Price Range
              </Typography>
              <Box style={{ paddingLeft: 8, paddingRight: 8 }}>
                <Slider
                  value={filters.priceRange}
                  onChange={(e, newValue) => handleFilterChange('priceRange', newValue)}
                  valueLabelDisplay="auto"
                  min={0}
                  max={20}
                  step={0.25}
                  marks={[
                    { value: 0, label: '$0' },
                    { value: 10, label: '$10' },
                    { value: 20, label: '$20+' }
                  ]}
                />
                <Typography variant="body2" style={{ color: '#666', textAlign: 'center', marginTop: 8 }}>
                  ${filters.priceRange[0]} - ${filters.priceRange[1]}
                </Typography>
              </Box>
            </Grid>

            {/* Stock Status Filter */}
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Stock Status</InputLabel>
                <Select
                  value={filters.stockStatus}
                  label="Stock Status"
                  onChange={(e) => handleFilterChange('stockStatus', e.target.value)}
                >
                  <MenuItem value="all">All Items</MenuItem>
                  <MenuItem value="inStock">In Stock</MenuItem>
                  <MenuItem value="lowStock">Low Stock</MenuItem>
                  <MenuItem value="outOfStock">Out of Stock</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Unit Filter */}
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Unit Type</InputLabel>
                <Select
                  value={filters.unit}
                  label="Unit Type"
                  onChange={(e) => handleFilterChange('unit', e.target.value)}
                >
                  <MenuItem value="all">All Units</MenuItem>
                  {units.map(unit => (
                    <MenuItem key={unit} value={unit}>{unit}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Price Change Filter */}
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Price Change</InputLabel>
                <Select
                  value={filters.priceChange}
                  label="Price Change"
                  onChange={(e) => handleFilterChange('priceChange', e.target.value)}
                >
                  <MenuItem value="all">All Changes</MenuItem>
                  <MenuItem value="increased">Price Increased</MenuItem>
                  <MenuItem value="decreased">Price Decreased</MenuItem>
                  <MenuItem value="unchanged">No Change</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Toggle Switches */}
            <Grid item xs={12} md={3}>
              <Typography variant="subtitle2" style={{ fontWeight: 600, marginBottom: 8 }}>
                Quick Filters
              </Typography>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={filters.showLowStock}
                      onChange={(e) => handleFilterChange('showLowStock', e.target.checked)}
                      size="small"
                    />
                  }
                  label="Show only low stock"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={filters.showOutOfStock}
                      onChange={(e) => handleFilterChange('showOutOfStock', e.target.checked)}
                      size="small"
                    />
                  }
                  label="Include out of stock"
                />
              </Box>
            </Grid>
          </Grid>

          {/* Clear Filters Button */}
          {getActiveFiltersCount() > 0 && (
            <Box style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e0e0e0' }}>
              <Button
                startIcon={<ClearIcon />}
                onClick={clearAllFilters}
                variant="outlined"
                size="small"
              >
                Clear All Filters
              </Button>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

// Mock data with more items
const initialItems = [
  { id: 1, code: '12OZCO_7415', name: '12 oz coffee cup', currentPrice: 2.34, previousPrice: 2.20, unit: 'Bag', stock: 0 },
  { id: 2, code: '12OZCO_5802', name: '12 oz coffee cup', currentPrice: 2.34, previousPrice: 2.25, unit: 'Bag', stock: 0 },
  { id: 3, code: '12OZCO_0995', name: '12 oz coffee cup', currentPrice: 2.34, previousPrice: 2.30, unit: 'Bag', stock: 0 },
  { id: 4, code: '16OZCO_7415', name: '16 oz coffee cup', currentPrice: 2.30, previousPrice: 2.15, unit: 'Bag', stock: 0 },
  { id: 5, code: '16OZCO_5802', name: '16 oz coffee cup', currentPrice: 2.30, previousPrice: 2.20, unit: 'Bag', stock: 0 },
  { id: 6, code: '20OZCO_1234', name: '20 oz coffee cup', currentPrice: 2.50, previousPrice: 2.35, unit: 'Bag', stock: 15 },
  { id: 7, code: 'NAPKIN_001', name: 'Paper napkins', currentPrice: 1.25, previousPrice: 1.15, unit: 'Pack', stock: 200 },
  { id: 8, code: 'STIRRER_99', name: 'Coffee stirrers', currentPrice: 0.85, previousPrice: 0.80, unit: 'Box', stock: 50 },
  { id: 9, code: 'SLEEVE_12', name: '12 oz cup sleeves', currentPrice: 1.95, previousPrice: 1.85, unit: 'Pack', stock: 0 },
  { id: 10, code: 'SLEEVE_16', name: '16 oz cup sleeves', currentPrice: 2.10, previousPrice: 1.95, unit: 'Pack', stock: 25 },
  { id: 11, code: 'LID_12_WHITE', name: '12 oz white lid', currentPrice: 1.75, previousPrice: 1.65, unit: 'Bag', stock: 0 },
  { id: 12, code: 'LID_16_WHITE', name: '16 oz white lid', currentPrice: 1.85, previousPrice: 1.70, unit: 'Bag', stock: 30 },
  { id: 13, code: 'SUGAR_PACK', name: 'Sugar packets', currentPrice: 0.05, previousPrice: 0.04, unit: 'Each', stock: 1000 },
  { id: 14, code: 'CREAM_PACK', name: 'Cream packets', currentPrice: 0.08, previousPrice: 0.07, unit: 'Each', stock: 500 },
  { id: 15, code: 'STRAW_BEND', name: 'Bendable straws', currentPrice: 0.95, previousPrice: 0.85, unit: 'Pack', stock: 75 },
  { id: 16, code: 'FORK_PLAST', name: 'Plastic forks', currentPrice: 1.20, previousPrice: 1.10, unit: 'Pack', stock: 100 },
  { id: 17, code: 'KNIFE_PLAST', name: 'Plastic knives', currentPrice: 1.15, previousPrice: 1.05, unit: 'Pack', stock: 85 },
  { id: 18, code: 'SPOON_PLAST', name: 'Plastic spoons', currentPrice: 1.10, previousPrice: 1.00, unit: 'Pack', stock: 90 },
  { id: 19, code: 'PLATE_PAPER', name: 'Paper plates 9"', currentPrice: 3.25, previousPrice: 3.10, unit: 'Pack', stock: 40 },
  { id: 20, code: 'BOWL_FOAM', name: 'Foam bowls', currentPrice: 2.85, previousPrice: 2.70, unit: 'Pack', stock: 60 },
  { id: 21, code: 'BAG_TAKEOUT', name: 'Takeout bags', currentPrice: 4.50, previousPrice: 4.25, unit: 'Pack', stock: 25 },
  { id: 22, code: 'CONTAINER_16', name: '16 oz containers', currentPrice: 5.75, previousPrice: 5.50, unit: 'Pack', stock: 35 },
  { id: 23, code: 'WRAP_FOIL', name: 'Foil wrap', currentPrice: 8.95, previousPrice: 8.50, unit: 'Roll', stock: 12 },
  { id: 24, code: 'GLOVES_VINYL', name: 'Vinyl gloves', currentPrice: 12.50, previousPrice: 11.75, unit: 'Box', stock: 20 },
  { id: 25, code: 'TOWEL_PAPER', name: 'Paper towels', currentPrice: 6.25, previousPrice: 5.95, unit: 'Pack', stock: 18 }
];

const MasterFile = () => {
  const [items, setItems] = useState(initialItems);
  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    priceRange: [0, 20],
    stockStatus: 'all',
    unit: 'all',
    category: 'all',
    priceChange: 'all',
    showLowStock: false,
    showOutOfStock: false
  });

  // State for FiltersOrderIQ component
  const [orderIQFilters, setOrderIQFilters] = useState({
    stockStatus: [],
    unit: [],
    priceChange: []
  });
  
  // Excel upload states
  const [uploadDialog, setUploadDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Date range selector state
  const [selectedDateRange, setSelectedDateRange] = useState(null);

  // Get unique units for filter options
  const uniqueUnits = [...new Set(items.map(item => item.unit))];

  // Define filter fields for FiltersOrderIQ
  const filterFields = [
    {
      key: 'stockStatus',
      label: 'Stock Status',
      placeholder: 'All stock levels',
      options: [
        { value: 'inStock', label: 'In Stock' },
        { value: 'lowStock', label: 'Low Stock' },
        { value: 'outOfStock', label: 'Out of Stock' }
      ]
    },
    {
      key: 'unit',
      label: 'Unit Type',
      placeholder: 'All units',
      options: uniqueUnits.map(unit => ({ value: unit, label: unit }))
    },
    {
      key: 'priceChange',
      label: 'Price Change',
      placeholder: 'All changes',
      options: [
        { value: 'increased', label: 'Price Increased' },
        { value: 'decreased', label: 'Price Decreased' },
        { value: 'unchanged', label: 'No Change' }
      ]
    }
  ];

  // Handler for FiltersOrderIQ filter changes
  const handleOrderIQFilterChange = (fieldKey, values) => {
    setOrderIQFilters(prev => ({
      ...prev,
      [fieldKey]: values
    }));
  };

  // Handler for applying FiltersOrderIQ filters
  const handleApplyOrderIQFilters = () => {
    console.log('Applied FiltersOrderIQ filters:', orderIQFilters);
    
    // Integrate with existing filters
    const newFilters = { ...filters };
    
    // Map orderIQFilters to existing filter structure
    if (orderIQFilters.stockStatus.length > 0) {
      newFilters.stockStatus = orderIQFilters.stockStatus[0];
    }
    
    if (orderIQFilters.unit.length > 0) {
      newFilters.unit = orderIQFilters.unit[0];
    }
    
    if (orderIQFilters.priceChange.length > 0) {
      newFilters.priceChange = orderIQFilters.priceChange[0];
    }
    
    setFilters(newFilters);
    setPage(0); // Reset to first page when filters change
  };

  // Apply filters to items
  const applyFilters = (itemsList) => {
    return itemsList.filter(item => {
      // Search term filter
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.code.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Price range filter
      const withinPriceRange = item.currentPrice >= filters.priceRange[0] && 
                              item.currentPrice <= filters.priceRange[1];
      
      // Stock status filter
      let matchesStockStatus = true;
      if (filters.stockStatus === 'inStock') matchesStockStatus = item.stock > 20;
      else if (filters.stockStatus === 'lowStock') matchesStockStatus = item.stock > 0 && item.stock <= 20;
      else if (filters.stockStatus === 'outOfStock') matchesStockStatus = item.stock === 0;
      
      // Unit filter
      const matchesUnit = filters.unit === 'all' || item.unit === filters.unit;
      
      // Price change filter
      let matchesPriceChange = true;
      if (filters.priceChange === 'increased') matchesPriceChange = item.currentPrice > item.previousPrice;
      else if (filters.priceChange === 'decreased') matchesPriceChange = item.currentPrice < item.previousPrice;
      else if (filters.priceChange === 'unchanged') matchesPriceChange = item.currentPrice === item.previousPrice;
      
      // Quick filters
      const matchesLowStock = !filters.showLowStock || (item.stock > 0 && item.stock <= 20);
      const matchesOutOfStock = filters.showOutOfStock || item.stock > 0;
      
      return matchesSearch && withinPriceRange && matchesStockStatus && 
             matchesUnit && matchesPriceChange && matchesLowStock && matchesOutOfStock;
    });
  };

  // Filter items based on search term and filters
  const filteredItems = applyFilters(items);

  // Paginated items
  const paginatedItems = filteredItems.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setPage(0); // Reset to first page when filters change
  };

  const handleEditClick = (id, currentPrice) => {
    setEditingId(id);
    setEditPrice(currentPrice.toString());
  };

  const handleSaveClick = (id) => {
    const newPrice = parseFloat(editPrice);
    if (!isNaN(newPrice) && newPrice > 0) {
      setItems(prevItems =>
        prevItems.map(item =>
          item.id === id
            ? { ...item, previousPrice: item.currentPrice, currentPrice: newPrice }
            : item
        )
      );
    }
    setEditingId(null);
    setEditPrice('');
  };

  const handleCancelClick = () => {
    setEditingId(null);
    setEditPrice('');
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'error' };
    if (stock <= 20) return { label: 'Low Stock', color: 'warning' };
    return { label: 'In Stock', color: 'success' };
  };

  // Excel upload functions
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
      ];
      
      if (validTypes.includes(file.type) || file.name.match(/\.(xlsx|xls|csv)$/i)) {
        setSelectedFile(file);
        setUploadStatus(null);
      } else {
        setUploadStatus({ type: 'error', message: 'Please select a valid Excel file (.xlsx, .xls) or CSV file.' });
        setSelectedFile(null);
      }
    }
  };

  const processExcelFile = async (file) => {
    // Simulate Excel processing - in real implementation, use a library like xlsx
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock processed data - this would come from the actual Excel file
        const mockExcelData = [
          { code: 'EXCEL_001', name: 'Imported Item 1', currentPrice: 3.50, unit: 'Pack', stock: 25 },
          { code: 'EXCEL_002', name: 'Imported Item 2', currentPrice: 2.75, unit: 'Box', stock: 40 },
          { code: 'EXCEL_003', name: 'Imported Item 3', currentPrice: 1.95, unit: 'Each', stock: 100 }
        ];
        resolve(mockExcelData);
      }, 2000);
    });
  };

  const handleUploadFile = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadStatus(null);

    try {
      const excelData = await processExcelFile(selectedFile);
      
      // Add new items to the existing list
      const maxId = Math.max(...items.map(item => item.id));
      const newItems = excelData.map((item, index) => ({
        id: maxId + index + 1,
        code: item.code,
        name: item.name,
        currentPrice: item.currentPrice,
        previousPrice: 0,
        unit: item.unit,
        stock: item.stock
      }));

      setItems(prevItems => [...prevItems, ...newItems]);
      setUploadStatus({ 
        type: 'success', 
        message: `Successfully imported ${newItems.length} items from ${selectedFile.name}` 
      });
      
      // Reset after successful upload
      setTimeout(() => {
        setUploadDialog(false);
        setSelectedFile(null);
        setUploadStatus(null);
      }, 2000);

    } catch (error) {
      setUploadStatus({ 
        type: 'error', 
        message: 'Failed to process the Excel file. Please check the file format and try again.' 
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCloseUploadDialog = () => {
    setUploadDialog(false);
    setSelectedFile(null);
    setUploadStatus(null);
    setUploading(false);
  };

  // Date range handler
  const handleDateRangeSelect = (range) => {
    setSelectedDateRange(range);
    console.log('Selected date range:', range);
    // Here you would typically filter items based on the selected date range
    // For example: filterItemsByDateRange(range);
  };

  return (
    <Container maxWidth="xl" style={{ paddingTop: 24, paddingBottom: 24 }}>
      <Paper 
        style={{ 
          borderRadius: 8, 
          overflow: 'hidden',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}
      >
        
        {/* Header Section */}
        <Box 
          style={{ 
            background: '#f8f9fa',
            padding: 24,
            borderBottom: '1px solid #e0e0e0'
          }}
        >
          {/* Search and Actions */}
          <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Typography variant="h6" style={{ fontWeight: 600 }}>
                {filteredItems.length} Items
              </Typography>
              {selectedDateRange && (
                <Chip
                  label={`${selectedDateRange.startDate?.toLocaleDateString()} - ${selectedDateRange.endDate?.toLocaleDateString()}`}
                  color="primary"
                  size="small"
                  onDelete={() => setSelectedDateRange(null)}
                  style={{ fontSize: '0.75rem' }}
                />
              )}
            </Box>
            
            <Box style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <DateRangeSelectorButton onDateRangeSelect={handleDateRangeSelect} />
              
              <TextField
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                style={{ minWidth: 280 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              
              <Button
                variant="contained"
                startIcon={<UploadFileIcon />}
                onClick={() => setUploadDialog(true)}
                style={{ 
                  backgroundColor: '#4caf50',
                  '&:hover': { backgroundColor: '#45a049' }
                }}
              >
                Upload Excel
              </Button>
              
              <Tooltip title="Refresh data">
                <IconButton 
                  color="primary"
                  style={{ backgroundColor: '#e3f2fd' }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Basic FiltersOrderIQ Component */}
          <Box style={{ marginTop: 24 }}>
            <FiltersOrderIQ
              filterFields={filterFields}
              filters={orderIQFilters}
              onFilterChange={handleOrderIQFilterChange}
              onApplyFilters={handleApplyOrderIQFilters}
              showApplyButton={true}
            />
          </Box>
        </Box>

        {/* Advanced FiltersOrderIQ2 Component */}
        <Box style={{ padding: 24, backgroundColor: 'white' }}>
          <FiltersOrderIQ2
            onFiltersChange={handleFiltersChange}
            totalItems={items.length}
            filteredItems={filteredItems.length}
            units={uniqueUnits}
            categories={[]} // Add categories if needed
          />
        </Box>

        {/* Table Container */}
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow style={{ backgroundColor: '#fafafa' }}>
                <TableCell style={{ fontWeight: 700, width: 40 }}>
                  <DragIndicatorIcon />
                </TableCell>
                <TableCell style={{ fontWeight: 700 }}>Code</TableCell>
                <TableCell style={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell style={{ fontWeight: 700 }}>Current Price</TableCell>
                <TableCell style={{ fontWeight: 700 }}>Previous Price</TableCell>
                <TableCell style={{ fontWeight: 700 }}>Unit</TableCell>
                <TableCell style={{ fontWeight: 700 }}>Stock</TableCell>
                <TableCell style={{ fontWeight: 700, width: 100 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedItems.map((item, index) => (
                <TableRow 
                  key={item.id}
                  style={{
                    backgroundColor: index % 2 === 1 ? '#fafafa' : 'white'
                  }}
                >
                  <TableCell>
                    <IconButton size="small">
                      <DragIndicatorIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2" style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                      {item.code}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2" style={{ fontWeight: 500 }}>
                      {item.name}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    {editingId === item.id ? (
                      <TextField
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        type="number"
                        size="small"
                        inputProps={{ 
                          step: "0.01", 
                          min: "0",
                          style: { textAlign: 'center' }
                        }}
                        autoFocus
                        style={{ maxWidth: 100 }}
                      />
                    ) : (
                      <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Typography 
                          variant="body2" 
                          style={{ 
                            fontWeight: 600,
                            color: item.currentPrice > item.previousPrice ? '#2e7d32' : 
                                   item.currentPrice < item.previousPrice ? '#d32f2f' : '#666'
                          }}
                        >
                          ${item.currentPrice.toFixed(2)}
                        </Typography>
                        {item.currentPrice !== item.previousPrice && (
                          <Chip
                            size="small"
                            label={item.currentPrice > item.previousPrice ? '↑' : '↓'}
                            color={item.currentPrice > item.previousPrice ? 'success' : 'error'}
                            style={{ minWidth: 24, height: 20, fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      style={{ 
                        color: '#666',
                        fontStyle: item.previousPrice ? 'normal' : 'italic'
                      }}
                    >
                      {item.previousPrice ? `${item.previousPrice.toFixed(2)}` : '-'}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2" style={{ color: '#666' }}>
                      {item.unit}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Typography variant="body2" style={{ fontWeight: 600, minWidth: 30 }}>
                        {item.stock}
                      </Typography>
                      <Chip
                        label={getStockStatus(item.stock).label}
                        color={getStockStatus(item.stock).color}
                        size="small"
                        style={{ fontSize: '0.75rem' }}
                      />
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    {editingId === item.id ? (
                      <Box style={{ display: 'flex', gap: 4 }}>
                        <Tooltip title="Save changes">
                          <IconButton 
                            size="small" 
                            color="success"
                            onClick={() => handleSaveClick(item.id)}
                          >
                            <SaveIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cancel">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={handleCancelClick}
                          >
                            <CancelIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    ) : (
                      <Tooltip title="Edit price">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditClick(item.id, item.currentPrice)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Box style={{ borderTop: '1px solid #e0e0e0' }}>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredItems.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
      </Paper>

      {/* Excel Upload Dialog */}
      <Dialog 
        open={uploadDialog} 
        onClose={handleCloseUploadDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <CloudUploadIcon color="primary" />
            Upload Excel File
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box style={{ padding: '16px 0' }}>
            <Typography variant="body2" style={{ marginBottom: 16, color: '#666' }}>
              Upload an Excel file (.xlsx, .xls) or CSV file with items data. 
              Expected columns: Code, Name, Current Price, Unit, Stock
            </Typography>
            
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              id="excel-upload"
            />
            
            <label htmlFor="excel-upload">
              <Button
                variant="outlined"
                component="span"
                fullWidth
                startIcon={<UploadFileIcon />}
                style={{ 
                  height: 100,
                  border: '2px dashed #ccc',
                  borderRadius: 8,
                  fontSize: '1.1rem'
                }}
              >
                {selectedFile ? selectedFile.name : 'Click to select Excel file'}
              </Button>
            </label>

            {uploading && (
              <Box style={{ marginTop: 16 }}>
                <Typography variant="body2" style={{ marginBottom: 8 }}>
                  Processing file...
                </Typography>
                <LinearProgress />
              </Box>
            )}

            {uploadStatus && (
              <Alert 
                severity={uploadStatus.type} 
                style={{ marginTop: 16 }}
              >
                {uploadStatus.message}
              </Alert>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseUploadDialog}>
            Cancel
          </Button>
          <Button 
            onClick={handleUploadFile}
            variant="contained"
            disabled={!selectedFile || uploading}
            startIcon={uploading ? null : <UploadFileIcon />}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MasterFile;
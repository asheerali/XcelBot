import React, { useState } from 'react';
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
  DialogActions
} from '@mui/material';
import {
  Print as PrintIcon,
  Email as EmailIcon,
  Refresh as RefreshIcon,
  Description as DescriptionIcon,
  Assessment as AssessmentIcon,
  Store as StoreIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon
} from '@mui/icons-material';

// Import your existing FiltersOrderIQ component
import FiltersOrderIQ from '../components/FiltersOrderIQ'; // Adjust the import path as needed

// Mock data for orders by location with detailed items
const ordersData = [
  {
    orderDate: '24/06/2025',
    orderNumber: '#24',
    itemsCount: 1,
    totalQuantity: 16,
    totalAmount: 38.08,
    items: [
      { name: 'Unknown Item', code: 'N/A', quantity: 16.00, unit: 'unit', unitCost: 2.38, totalCost: 38.08 }
    ]
  },
  {
    orderDate: '21/06/2025',
    orderNumber: '#21',
    itemsCount: 6,
    totalQuantity: 32,
    totalAmount: 435.84,
    items: [
      { name: '12 oz coffee cup', code: '12OZCO_7415', quantity: 10.00, unit: 'Bag', unitCost: 2.34, totalCost: 23.40 },
      { name: '16 oz coffee cup', code: '16OZCO_7415', quantity: 8.00, unit: 'Bag', unitCost: 2.30, totalCost: 18.40 },
      { name: '12 oz coffee cup', code: '12OZCO_5802', quantity: 5.00, unit: 'Bag', unitCost: 2.34, totalCost: 11.70 },
      { name: '16 oz coffee cup', code: '16OZCO_5802', quantity: 4.00, unit: 'Bag', unitCost: 2.30, totalCost: 9.20 },
      { name: '12 oz coffee cup', code: '12OZCO_0996', quantity: 3.00, unit: 'Bag', unitCost: 2.34, totalCost: 7.02 },
      { name: 'Unknown Item', code: 'N/A', quantity: 2.00, unit: 'unit', unitCost: 2.38, totalCost: 4.76 }
    ]
  },
  {
    orderDate: '20/06/2025',
    orderNumber: '#20',
    itemsCount: 2,
    totalQuantity: 2,
    totalAmount: 4.68,
    items: [
      { name: '12 oz coffee cup', code: '12OZCO_7415', quantity: 1.00, unit: 'Bag', unitCost: 2.34, totalCost: 2.34 },
      { name: '16 oz coffee cup', code: '16OZCO_7415', quantity: 1.00, unit: 'Bag', unitCost: 2.34, totalCost: 2.34 }
    ]
  },
  {
    orderDate: '16/06/2025',
    orderNumber: '#16',
    itemsCount: 4,
    totalQuantity: 22,
    totalAmount: 276.74,
    items: [
      { name: '12 oz coffee cup', code: '12OZCO_7415', quantity: 8.00, unit: 'Bag', unitCost: 2.34, totalCost: 18.72 },
      { name: '16 oz coffee cup', code: '16OZCO_7415', quantity: 6.00, unit: 'Bag', unitCost: 2.30, totalCost: 13.80 },
      { name: '12 oz coffee cup', code: '12OZCO_5802', quantity: 4.00, unit: 'Bag', unitCost: 2.34, totalCost: 9.36 },
      { name: '16 oz coffee cup', code: '16OZCO_5802', quantity: 4.00, unit: 'Bag', unitCost: 2.30, totalCost: 9.20 }
    ]
  },
  {
    orderDate: '14/06/2025',
    orderNumber: '#14',
    itemsCount: 6,
    totalQuantity: 9,
    totalAmount: 91.87,
    items: [
      { name: '12 oz coffee cup', code: '12OZCO_7415', quantity: 3.00, unit: 'Bag', unitCost: 2.34, totalCost: 7.02 },
      { name: '16 oz coffee cup', code: '16OZCO_7415', quantity: 2.00, unit: 'Bag', unitCost: 2.30, totalCost: 4.60 },
      { name: '12 oz coffee cup', code: '12OZCO_5802', quantity: 2.00, unit: 'Bag', unitCost: 2.34, totalCost: 4.68 },
      { name: '16 oz coffee cup', code: '16OZCO_5802', quantity: 1.00, unit: 'Bag', unitCost: 2.30, totalCost: 2.30 },
      { name: '12 oz coffee cup', code: '12OZCO_0996', quantity: 1.00, unit: 'Bag', unitCost: 2.34, totalCost: 2.34 },
      { name: 'Unknown Item', code: 'N/A', quantity: 0.00, unit: 'unit', unitCost: 2.38, totalCost: 0.00 }
    ]
  },
  {
    orderDate: '13/06/2025',
    orderNumber: '#13',
    itemsCount: 4,
    totalQuantity: 7,
    totalAmount: 84.55,
    items: [
      { name: '12 oz coffee cup', code: '12OZCO_7415', quantity: 3.00, unit: 'Bag', unitCost: 2.34, totalCost: 7.02 },
      { name: '16 oz coffee cup', code: '16OZCO_7415', quantity: 2.00, unit: 'Bag', unitCost: 2.30, totalCost: 4.60 },
      { name: '12 oz coffee cup', code: '12OZCO_5802', quantity: 1.00, unit: 'Bag', unitCost: 2.34, totalCost: 2.34 },
      { name: '16 oz coffee cup', code: '16OZCO_5802', quantity: 1.00, unit: 'Bag', unitCost: 2.30, totalCost: 2.30 }
    ]
  },
  {
    orderDate: '11/06/2025',
    orderNumber: '#11',
    itemsCount: 2,
    totalQuantity: 7,
    totalAmount: 16.42,
    items: [
      { name: '12 oz coffee cup', code: '12OZCO_7415', quantity: 4.00, unit: 'Bag', unitCost: 2.34, totalCost: 9.36 },
      { name: '16 oz coffee cup', code: '16OZCO_7415', quantity: 3.00, unit: 'Bag', unitCost: 2.30, totalCost: 6.90 }
    ]
  }
];

// Mock data for store locations
const storeLocations = [
  {
    name: 'Downtown Brooklyn',
    status: 'Active',
    lastUpdated: 'Last Updated: No orders',
    itemsOrdered: 0,
    totalValue: 0.00
  },
  {
    name: 'tst7 Store',
    status: 'Active',
    lastUpdated: 'Last Updated: No orders',
    itemsOrdered: 0,
    totalValue: 0.00
  },
  {
    name: 'Test 8',
    status: 'Active',
    lastUpdated: 'Last Updated: No orders',
    itemsOrdered: 0,
    totalValue: 0.00
  },
  {
    name: 'All 2',
    status: 'Active',
    lastUpdated: 'Last Updated: No orders',
    itemsOrdered: 0,
    totalValue: 0.00
  },
  {
    name: 'Midtown East',
    status: 'Active',
    lastUpdated: 'Last Updated: 4:00:00 AM',
    itemsOrdered: 12,
    totalValue: 717.26
  },
  {
    name: '25',
    status: 'Active',
    lastUpdated: 'Last Updated: No orders',
    itemsOrdered: 0,
    totalValue: 0.00
  }
];

// Mock data for consolidated production requirements
const consolidatedData = [
  {
    item: '12 oz coffee cup',
    locations: {
      'Downtown Brooklyn': 0,
      'tst7 Store': 0,
      'Test 8': 0,
      'All 2': 0,
      'Midtown East': 1,
      '25': 0
    },
    totalRequired: 1,
    unit: 'Bag'
  },
  {
    item: '12 oz coffee cup',
    locations: {
      'Downtown Brooklyn': 0,
      'tst7 Store': 0,
      'Test 8': 0,
      'All 2': 0,
      'Midtown East': 1,
      '25': 0
    },
    totalRequired: 1,
    unit: 'Bag'
  }
];

const StoreSummaryProduction = () => {
  // State management
  const [filters, setFilters] = useState({});
  const [printDialog, setPrintDialog] = useState({ open: false, order: null, type: 'print' });
  const [emailDialog, setEmailDialog] = useState({ open: false, order: null, email: '' });
  const [viewDetailsDialog, setViewDetailsDialog] = useState({ open: false, store: null, orders: [] });

  // Filter configuration for FiltersOrderIQ component
  const filterFields = [
    {
      key: 'location',
      label: 'Location',
      placeholder: 'Select Location',
      options: [
        { value: 'midtown-east', label: 'Midtown East' },
        { value: 'downtown-brooklyn', label: 'Downtown Brooklyn' },
        { value: 'tst7-store', label: 'tst7 Store' },
        { value: 'test-8', label: 'Test 8' },
        { value: 'all-2', label: 'All 2' },
        { value: '25', label: '25' }
      ]
    },
    {
      key: 'companies',
      label: 'Companies',
      placeholder: 'Select Companies',
      options: [
        { value: 'company-1', label: 'Company 1' },
        { value: 'company-2', label: 'Company 2' },
        { value: 'company-3', label: 'Company 3' }
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

  const handlePrintOrder = (order) => {
    setPrintDialog({ open: true, order, type: 'print' });
  };

  const handleEmailOrder = (order) => {
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
        from: 'asheerali1997@gmail.com',
        subject: `Order Report - ${order.orderNumber} - Company 2`,
        html: orderReport,
        // You can also add a plain text version
        text: `Order Report for ${order.orderNumber}\nOrder Date: ${order.orderDate}\nTotal Items: ${order.totalQuantity}\nTotal Amount: ${order.totalAmount.toFixed(2)}`
      };

      // Here you would typically send to your backend API
      console.log('Sending email with data:', emailData);
      
      // For demo purposes, we'll just show success
      // In real implementation, you'd call your email API:
      // const response = await fetch('/api/send-email', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(emailData)
      // });
      
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
    } else {
      // Handle email - you can integrate with your email service
      console.log('Sending email for order:', order.orderNumber);
      alert(`Email sent for order ${order.orderNumber}`);
    }
    setPrintDialog({ open: false, order: null, type: 'print' });
  };

  const generateOrderReport = (order) => {
    const currentDate = new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Order Report - ${order.orderNumber}</title>
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
          }
          .total-row { 
            font-weight: bold; 
            background-color: #f8f9fa; 
          }
          .footer { 
            text-align: center; 
            margin-top: 40px; 
            font-size: 12px; 
            color: #666; 
          }
          .amount { 
            text-align: right; 
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">Company 2</div>
          <div class="location">Midtown East</div>
        </div>
        
        <div class="order-summary">
          <div><strong>Order Date:</strong> ${order.orderDate}</div>
          <div><strong>Total Items:</strong> ${order.totalQuantity}</div>
          <div><strong>Total Amount:</strong> $${order.totalAmount.toFixed(2)}</div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Item Code</th>
              <th>Quantity</th>
              <th>Unit</th>
              <th>Unit Cost</th>
              <th>Total Cost</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.code}</td>
                <td>${item.quantity.toFixed(2)}</td>
                <td>${item.unit}</td>
                <td class="amount">$${item.unitCost.toFixed(2)}</td>
                <td class="amount">$${item.totalCost.toFixed(2)}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="5"><strong>Total</strong></td>
              <td class="amount"><strong>$${order.totalAmount.toFixed(2)}</strong></td>
            </tr>
          </tbody>
        </table>
        
        <div class="footer">
          Generated on ${currentDate}
        </div>
      </body>
      </html>
    `;
  };

  const handleViewDetails = (storeName) => {
    // Find store details
    const storeData = storeLocations.find(store => store.name === storeName);
    
    // Generate mock order details for the store
    let storeOrders = [];
    
    if (storeName === 'Downtown Brooklyn') {
      storeOrders = [
        { name: 'Unknown Item', code: 'N/A', quantity: 6.00, unit: 'unit', unitCost: 2.34, totalCost: 14.04 },
        { name: 'Unknown Item', code: 'N/A', quantity: 1.00, unit: 'unit', unitCost: 2.38, totalCost: 2.38 },
        { name: 'Unknown Item', code: 'N/A', quantity: 1.00, unit: 'unit', unitCost: 2.35, totalCost: 2.35 },
        { name: 'Unknown Item', code: 'N/A', quantity: 4.00, unit: 'unit', unitCost: 2.38, totalCost: 9.52 },
        { name: 'Unknown Item', code: 'N/A', quantity: 1.00, unit: 'unit', unitCost: 21.95, totalCost: 21.95 },
        { name: 'Unknown Item', code: 'N/A', quantity: 1.00, unit: 'unit', unitCost: 50.73, totalCost: 50.73 },
        { name: 'Unknown Item', code: 'N/A', quantity: 3.00, unit: 'unit', unitCost: 2.38, totalCost: 7.14 },
        { name: 'Unknown Item', code: 'N/A', quantity: 1.00, unit: 'unit', unitCost: 2.35, totalCost: 2.35 },
        { name: 'Unknown Item', code: 'N/A', quantity: 1.00, unit: 'unit', unitCost: 50.73, totalCost: 50.73 },
        { name: 'Unknown Item', code: 'N/A', quantity: 1.00, unit: 'unit', unitCost: 22.01, totalCost: 22.01 },
        { name: 'Unknown Item', code: 'N/A', quantity: 1.00, unit: 'unit', unitCost: 1.16, totalCost: 1.16 },
        { name: 'Unknown Item', code: 'N/A', quantity: 2.00, unit: 'unit', unitCost: 4.24, totalCost: 8.48 },
        { name: 'Unknown Item', code: 'N/A', quantity: 5.00, unit: 'unit', unitCost: 2.38, totalCost: 11.90 }
      ];
    } else if (storeName === 'Midtown East') {
      // Use existing order data for Midtown East
      storeOrders = ordersData.flatMap(order => order.items);
    } else {
      // For other stores with no orders
      storeOrders = [];
    }
    
    setViewDetailsDialog({ open: true, store: storeData, orders: storeOrders });
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

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Consolidated Production Requirements - Company 2</title>
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
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">Company 2</div>
          <div class="report-title">Consolidated Production Requirements</div>
          <div class="date-range">Total quantities needed for production • 06/15/2025 to 06/22/2025</div>
        </div>
        
        <div class="summary-section">
          <h3>Production Summary</h3>
          <p><strong>Total Unique Items:</strong> ${consolidatedData.length}</p>
          <p><strong>Total Quantity Required:</strong> ${consolidatedData.reduce((sum, item) => sum + item.totalRequired, 0)} units</p>
          <p><strong>Active Locations:</strong> ${Object.keys(consolidatedData[0]?.locations || {}).length}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th class="center">Downtown Brooklyn</th>
              <th class="center">tst7 Store</th>
              <th class="center">Test 8</th>
              <th class="center">All 2</th>
              <th class="center">Midtown East</th>
              <th class="center">25</th>
              <th class="center total-column">Total Required</th>
              <th class="center">Unit</th>
            </tr>
          </thead>
          <tbody>
            ${consolidatedData.map(item => `
              <tr>
                <td><strong>${item.item}</strong></td>
                <td class="center">${item.locations['Downtown Brooklyn']}</td>
                <td class="center">${item.locations['tst7 Store']}</td>
                <td class="center">${item.locations['Test 8']}</td>
                <td class="center">${item.locations['All 2']}</td>
                <td class="center ${item.locations['Midtown East'] > 0 ? 'highlight' : ''}">${item.locations['Midtown East']}</td>
                <td class="center">${item.locations['25']}</td>
                <td class="center total-column">${item.totalRequired}</td>
                <td class="center">${item.unit}</td>
              </tr>
            `).join('')}
            <tr style="border-top: 2px solid #333;">
              <td colspan="7" style="text-align: right; font-weight: bold; background-color: #f8f9fa;">
                <strong>GRAND TOTAL:</strong>
              </td>
              <td class="center total-column" style="font-weight: bold; font-size: 16px;">
                ${consolidatedData.reduce((sum, item) => sum + item.totalRequired, 0)}
              </td>
              <td class="center" style="background-color: #f8f9fa;">
                <strong>Units</strong>
              </td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top: 30px; padding: 15px; background-color: #e7f3ff; border-radius: 8px;">
          <h4 style="margin-top: 0; color: #1565c0;">Production Notes:</h4>
          <ul style="margin-bottom: 0;">
            <li>Items with quantities > 0 require immediate production</li>
            <li>Highlighted locations (Midtown East) have active orders</li>
            <li>Contact production team for items requiring special handling</li>
            <li>Update inventory systems after production completion</li>
          </ul>
        </div>
        
        <div class="footer">
          Generated on ${currentDate} | Company 2 Production Planning System
        </div>
      </body>
      </html>
    `;
  };

  const totalOrdersFound = ordersData.length;
  const totalOrderValue = ordersData.reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Filters Section using FiltersOrderIQ component */}
      <FiltersOrderIQ
        filterFields={filterFields}
        filters={filters}
        onFilterChange={handleFilterChange}
        onApplyFilters={handleApplyFilters}
        showApplyButton={true}
      />

      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
       
      </Box>

      {/* All Orders/Invoices by Location */}
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
                  Complete listing of all orders with timestamps by store location (06/15/2025 to 06/22/2025)
                </Typography>
              </Box>
            </Box>
            <Chip 
              label={`${totalOrdersFound} orders found`} 
              color="primary" 
              variant="outlined"
            />
          </Box>

          {/* Midtown East Orders */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, p: 2, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Midtown East
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Company 2 • 7 orders
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Total: ${totalOrderValue.toFixed(2)}
              </Typography>
            </Box>

            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Order Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Items Count</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Total Quantity</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Total Amount</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ordersData.map((order, index) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {order.orderDate}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Order {order.orderNumber}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{order.itemsCount}</TableCell>
                      <TableCell>{order.totalQuantity}</TableCell>
                      <TableCell>
                        <Typography sx={{ color: 'success.main', fontWeight: 600 }}>
                          ${order.totalAmount}
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

      {/* Store Locations Grid */}
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Grid container spacing={3}>
            {storeLocations.map((store, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    borderRadius: 2,
                    '&:hover': { boxShadow: 2 },
                    transition: 'box-shadow 0.2s'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <StoreIcon color="primary" />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {store.name}
                      </Typography>
                      <Chip 
                        icon={<CheckCircleIcon />}
                        label={store.status} 
                        color="success" 
                        size="small"
                      />
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {store.lastUpdated}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Items Ordered:</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {store.itemsOrdered}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" color="text.secondary">Total Value:</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                        ${store.totalValue.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Button 
                    variant="outlined" 
                    size="small" 
                    fullWidth
                    onClick={() => handleViewDetails(store.name)}
                  >
                    View Details
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Consolidated Production Requirements */}
      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Consolidated Production Requirements
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total quantities needed for production • 06/15/2025 to 06/22/2025
              </Typography>
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
                  <TableCell sx={{ fontWeight: 600 }}>Item</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Downtown Brooklyn</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>tst7 Store</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Test 8</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>All 2</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Midtown East</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>25</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Total Required</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Unit</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {consolidatedData.map((item, index) => (
                  <TableRow key={index} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{item.item}</TableCell>
                    <TableCell>{item.locations['Downtown Brooklyn']}</TableCell>
                    <TableCell>{item.locations['tst7 Store']}</TableCell>
                    <TableCell>{item.locations['Test 8']}</TableCell>
                    <TableCell>{item.locations['All 2']}</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>
                      {item.locations['Midtown East']}
                    </TableCell>
                    <TableCell>{item.locations['25']}</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'success.main' }}>
                      {item.totalRequired}
                    </TableCell>
                    <TableCell>{item.unit}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Print/Email Confirmation Dialog */}
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
                <Typography variant="body2"><strong>Order:</strong> {printDialog.order.orderNumber}</Typography>
                <Typography variant="body2"><strong>Date:</strong> {printDialog.order.orderDate}</Typography>
                <Typography variant="body2"><strong>Items:</strong> {printDialog.order.itemsCount}</Typography>
                <Typography variant="body2"><strong>Total:</strong> ${printDialog.order.totalAmount.toFixed(2)}</Typography>
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
                <Typography variant="body2"><strong>Order:</strong> {emailDialog.order.orderNumber}</Typography>
                <Typography variant="body2"><strong>Date:</strong> {emailDialog.order.orderDate}</Typography>
                <Typography variant="body2"><strong>Items:</strong> {emailDialog.order.itemsCount}</Typography>
                <Typography variant="body2"><strong>Total:</strong> ${emailDialog.order.totalAmount.toFixed(2)}</Typography>
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
                <strong>From:</strong> asheerali1997@gmail.com<br />
                <strong>Subject:</strong> Order Report - {emailDialog.order.orderNumber} - Company 2
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

      {/* View Details Dialog */}
      <Dialog 
        open={viewDetailsDialog.open} 
        onClose={() => setViewDetailsDialog({ open: false, store: null, orders: [] })}
        maxWidth="lg" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              {viewDetailsDialog.store?.name} - Order Details
            </Typography>
            <IconButton 
              onClick={() => setViewDetailsDialog({ open: false, store: null, orders: [] })}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {viewDetailsDialog.store && (
            <Box sx={{ pt: 1 }}>
              {/* Store Summary */}
              <Grid container spacing={4} sx={{ mb: 3 }}>
                <Grid item xs={3}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Status:</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'success.main' }} />
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {viewDetailsDialog.store.status}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Items Ordered:</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {viewDetailsDialog.orders.reduce((sum, order) => sum + order.quantity, 0)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Total Value:</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      ${viewDetailsDialog.orders.reduce((sum, order) => sum + order.totalCost, 0).toFixed(2)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Last Updated:</Typography>
                    <Typography variant="body1">
                      {viewDetailsDialog.store.lastUpdated.replace('Last Updated: ', '')}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Orders Table */}
              {viewDetailsDialog.orders.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell sx={{ fontWeight: 600 }}>Item Name</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Item Code</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Quantity</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Unit</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Unit Cost</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Total Cost</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {viewDetailsDialog.orders.map((item, index) => (
                        <TableRow key={index} hover>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.code}</TableCell>
                          <TableCell>{item.quantity.toFixed(2)}</TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell>${item.unitCost.toFixed(2)}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>
                            ${item.totalCost.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary">
                    No orders found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This store has no order history.
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setViewDetailsDialog({ open: false, store: null, orders: [] })}
            variant="contained"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StoreSummaryProduction;
// src/components/DayOfWeekAnalysis.tsx - Updated with real financial data integration

import React from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";

// Interface for the component props
interface DayOfWeekAnalysisProps {
  salesData?: any[];     // table2 data - Day of week SALES
  ordersData?: any[];    // table3 data - Day of week ORDERS  
  avgTicketData?: any[]; // table4 data - Day of week AVERAGE TICKET
}

// Helper function to format percentage changes with color
const formatPercentageChange = (value: string | number): { value: string, isPositive: boolean } => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  const isPositive = numValue >= 0;
  const formattedValue = isPositive ? `+${Math.abs(numValue).toFixed(2)}%` : `${numValue.toFixed(2)}%`;
  
  return { value: formattedValue, isPositive };
};

// Helper function to format currency values
const formatCurrency = (value: string | number): string => {
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numValue);
};

// Helper function to format numbers with commas
const formatNumber = (value: string | number): string => {
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
  return new Intl.NumberFormat('en-US').format(numValue);
};

const DayOfWeekAnalysis: React.FC<DayOfWeekAnalysisProps> = ({ 
  salesData = [], 
  ordersData = [], 
  avgTicketData = [] 
}) => {

  // Transform backend data to match component format
  const transformSalesData = () => {
    if (!salesData || salesData.length === 0) return [];
    
    return salesData.map((row, index) => ({
      day: row["Day of the Week"] || row["Day of The Week"] || `${index + 1} - Day`,
      twSales: formatCurrency(row["Tw Sales"] || 0),
      lwSales: formatCurrency(row["Lw Sales"] || 0),
      lySales: formatCurrency(row["Ly Sales"] || 0),
      twLwChange: formatPercentageChange(row["Tw/Lw (+/-)"] || 0),
      twLyChange: formatPercentageChange(row["Tw/Ly (+/-)"] || 0),
      isTotal: row["Day of the Week"]?.includes("Grand Total") || row["Day of The Week"]?.includes("Grand Total")
    }));
  };

  const transformOrdersData = () => {
    if (!ordersData || ordersData.length === 0) return [];
    
    return ordersData.map((row, index) => ({
      day: row["Day of The Week"] || row["Day of the Week"] || `${index + 1} - Day`,
      twOrders: formatNumber(row["Tw Orders"] || 0),
      lwOrders: formatNumber(row["Lw Orders"] || 0),
      lyOrders: formatNumber(row["Ly Orders"] || 0),
      twLwChange: formatPercentageChange(row["Tw/Lw (+/-)"] || 0),
      twLyChange: formatPercentageChange(row["Tw/Ly (+/-)"] || 0),
      isTotal: row["Day of The Week"]?.includes("Grand Total") || row["Day of the Week"]?.includes("Grand Total")
    }));
  };

  const transformAvgTicketData = () => {
    if (!avgTicketData || avgTicketData.length === 0) return [];
    
    return avgTicketData.map((row, index) => ({
      day: row["Day of The Week"] || row["Day of the Week"] || `${index + 1} - Day`,
      twAvgTicket: formatCurrency(row["Tw Avg Tckt"] || 0),
      lwAvgTicket: formatCurrency(row["Lw Avg Tckt"] || 0),
      lyAvgTicket: formatCurrency(row["Ly Avg Tckt"] || 0),
      twLwChange: formatPercentageChange(row["Tw/Lw (+/-)"] || 0),
      twLyChange: formatPercentageChange(row["Tw/Ly (+/-)"] || 0),
      isTotal: row["Day of The Week"]?.includes("Grand Total") || row["Day of the Week"]?.includes("Grand Total")
    }));
  };

  // Get transformed data
  const dayOfWeekSalesData = transformSalesData();
  const dayOfWeekOrdersData = transformOrdersData();
  const dayOfWeekAvgTicketData = transformAvgTicketData();

  // Render table function
  const renderTable = (title: string, data: any[], metrics: any) => (
    <Paper sx={{ mb: 4, overflow: "hidden" }}>
      <Typography
        variant="h5"
        sx={{
          p: 3,
          backgroundColor: "#f5f5f5",
          fontWeight: "bold",
          textAlign: "center",
          fontSize: "1.75rem",
        }}
      >
        {title}
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f0f0f0" }}>
              <TableCell
                align="center"
                sx={{
                  fontWeight: "bold",
                  border: "1px solid #ddd",
                  fontSize: "1rem",
                }}
              >
                Day of The Week
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  fontWeight: "bold",
                  border: "1px solid #ddd",
                  fontSize: "1rem",
                }}
              >
                {metrics.twLabel}
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  fontWeight: "bold",
                  border: "1px solid #ddd",
                  fontSize: "1rem",
                }}
              >
                {metrics.lwLabel}
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  fontWeight: "bold",
                  border: "1px solid #ddd",
                  fontSize: "1rem",
                }}
              >
                {metrics.lyLabel}
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  fontWeight: "bold",
                  border: "1px solid #ddd",
                  backgroundColor: "#ffeb3b",
                  color: "#000",
                  fontSize: "1rem",
                }}
              >
                Tw/Lw (+/-)
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  fontWeight: "bold",
                  border: "1px solid #ddd",
                  backgroundColor: "#ffeb3b",
                  color: "#000",
                  fontSize: "1rem",
                }}
              >
                Tw/Ly (+/-)
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow
                key={index}
                sx={{
                  backgroundColor: row.isTotal
                    ? "#e0e0e0"
                    : index % 2 === 0
                    ? "#f9f9f9"
                    : "#fff",
                  "&:hover": {
                    backgroundColor: row.isTotal ? "#d0d0d0" : "#f0f0f0",
                  },
                }}
              >
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: row.isTotal ? "bold" : "normal",
                    border: "1px solid #ddd",
                    fontSize: row.isTotal ? "0.95rem" : "0.9rem",
                  }}
                >
                  {row.day}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: row.isTotal ? "bold" : "normal",
                    border: "1px solid #ddd",
                    fontSize: row.isTotal ? "0.95rem" : "0.9rem",
                  }}
                >
                  {row[metrics.twField]}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: row.isTotal ? "bold" : "normal",
                    border: "1px solid #ddd",
                    fontSize: row.isTotal ? "0.95rem" : "0.9rem",
                  }}
                >
                  {row[metrics.lwField]}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: row.isTotal ? "bold" : "normal",
                    border: "1px solid #ddd",
                    fontSize: row.isTotal ? "0.95rem" : "0.9rem",
                  }}
                >
                  {row[metrics.lyField]}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: row.isTotal ? "bold" : "normal",
                    border: "1px solid #ddd",
                    color: row.twLwChange?.isPositive ? "green" : "red",
                    backgroundColor: row.isTotal ? "#fff3c4" : "transparent",
                    fontSize: row.isTotal ? "0.95rem" : "0.9rem",
                  }}
                >
                  {row.twLwChange?.value || "0.00%"}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: row.isTotal ? "bold" : "normal",
                    border: "1px solid #ddd",
                    color: row.twLyChange?.isPositive ? "green" : "red",
                    backgroundColor: row.isTotal ? "#fff3c4" : "transparent",
                    fontSize: row.isTotal ? "0.95rem" : "0.9rem",
                  }}
                >
                  {row.twLyChange?.value || "0.00%"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );

  return (
    <Box sx={{ p: 2 }}>
      {/* Show alert if no data available */}
      {(!salesData || salesData.length === 0) && 
       (!ordersData || ordersData.length === 0) && 
       (!avgTicketData || avgTicketData.length === 0) && (
        <Alert severity="info" sx={{ mb: 3 }}>
          No day-of-week analysis data available. Please ensure financial data is loaded.
        </Alert>
      )}

      {/* Sales Analysis Table */}
      {dayOfWeekSalesData.length > 0 && renderTable(
        "Day of Week - Sales Analysis", 
        dayOfWeekSalesData, 
        {
          twLabel: "Tw Sales",
          lwLabel: "Lw Sales",
          lyLabel: "Ly Sales",
          twField: "twSales",
          lwField: "lwSales",
          lyField: "lySales",
        }
      )}

      {/* Orders Analysis Table */}
      {dayOfWeekOrdersData.length > 0 && renderTable(
        "Day of Week - Orders Analysis", 
        dayOfWeekOrdersData, 
        {
          twLabel: "Tw Orders",
          lwLabel: "Lw Orders",
          lyLabel: "Ly Orders",
          twField: "twOrders",
          lwField: "lwOrders",
          lyField: "lyOrders",
        }
      )}

      {/* Average Ticket Analysis Table */}
      {dayOfWeekAvgTicketData.length > 0 && renderTable(
        "Day of Week - Average Ticket Analysis",
        dayOfWeekAvgTicketData,
        {
          twLabel: "Tw Avg Tckt",
          lwLabel: "Lw Avg Tckt",
          lyLabel: "Ly Avg Tckt",
          twField: "twAvgTicket",
          lwField: "lwAvgTicket",
          lyField: "lyAvgTicket",
        }
      )}
    </Box>
  );
};

export default DayOfWeekAnalysis;
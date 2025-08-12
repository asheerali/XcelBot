// Updated FinancialTablesComponent.tsx with $ signs for Labor Cost and no $ signs for Labor Hours
import React, { useState, useEffect } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Tabs,
  Tab,
  useTheme,
  alpha,
  Card,
  Alert,
  Chip,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

// Interface for the backend data structure
interface BackendTableData {
  table1?: Array<{
    Store: string;
    "Tw Sales": number;
    "Lw Sales": number;
    "Ly Sales": number;
    "Tw vs. Lw": number;
    "Tw vs. Ly": number;
  }>;
  table2?: Array<{
    Store: string;
    "Tw Orders": number;
    "Lw Orders": number;
    "Ly Orders": number;
    "Tw vs. Lw": number;
    "Tw vs. Ly": number;
  }>;
  table3?: Array<{
    Store: string;
    "Tw Avg Ticket": number;
    "Lw Avg Ticket": number;
    "Ly Avg Ticket": number;
    "Tw vs. Lw": number;
    "Tw vs. Ly": number;
  }>;
  table4?: Array<{
    Store: string;
    "Tw COGS": number;
    "Lw COGS": number;
    "Tw vs. Lw": number;
    "Tw Fc %": number;
    "Lw Fc %": number;
  }>;
  table5?: Array<{
    Store: string;
    "Tw Reg Pay": number;
    "Lw Reg Pay": number;
    "Tw vs. Lw": number;
    "Tw Lc %": number;
    "Lw Lc %": number;
  }>;
  table6?: Array<{
    Store: string;
    "Tw Lb Hrs": number;
    "Lw Lb Hrs": number;
    "Tw vs. Lw": number;
  }>;
  table7?: Array<{
    Store: string;
    "Tw SPMH": number;
    "Lw SPMH": number;
    "Tw vs. Lw": number;
  }>;
}

// TabPanel Component
interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

function TablePanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`financial-tabpanel-${index}`}
      aria-labelledby={`financial-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

// Props for the component
interface FinancialTablesComponentProps {
  financialTables?: BackendTableData;
}

const FinancialTablesComponent: React.FC<FinancialTablesComponentProps> = ({
  financialTables = {},
}) => {
  const theme = useTheme();
  const [tableTab, setTableTab] = useState(0);

  useEffect(() => {
    console.log("Financial tables received from backend:", financialTables);
  }, [financialTables]);

  // Handle table tab change
  const handleTableTabChange = (
    event: React.SyntheticEvent,
    newValue: number
  ) => {
    setTableTab(newValue);
  };

  // Format currency
  const formatCurrency = (value: number): string => {
    if (value === 0 || value === null || value === undefined) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Format percentage
  const formatPercentage = (value: number): string => {
    if (value === 0 || value === null || value === undefined) return "0.00%";
    return `${value.toFixed(2)}%`;
  };

  // Format number with $ sign for Orders table
  const formatNumberWithDollar = (value: number): string => {
    if (value === 0 || value === null || value === undefined) return "$0";
    return "$" + new Intl.NumberFormat("en-US").format(Math.round(value));
  };

  // Format number with commas (for non-currency numbers)
  const formatNumber = (value: number): string => {
    if (value === 0 || value === null || value === undefined) return "0";
    return new Intl.NumberFormat("en-US").format(Math.round(value));
  };

  // Format hours with $ sign (removed - no longer used)
  const formatHoursWithDollar = (value: number): string => {
    if (value === 0 || value === null || value === undefined) return "$0.00";
    return "$" + value.toFixed(2);
  };

  // Format hours (for Labor Hours table - no currency)
  const formatHours = (value: number): string => {
    if (value === 0 || value === null || value === undefined) return "0.00";
    return value.toFixed(2);
  };

  // Get change indicator with color and icon
  const getChangeIndicator = (value: number) => {
    if (value === 0) {
      return {
        color: theme.palette.text.secondary,
        icon: null,
        text: "0.00%",
      };
    }

    const isPositive = value > 0;
    return {
      color: isPositive ? theme.palette.success.main : theme.palette.error.main,
      icon: isPositive ? (
        <TrendingUpIcon fontSize="small" />
      ) : (
        <TrendingDownIcon fontSize="small" />
      ),
      text: `${isPositive ? "+" : ""}${value.toFixed(2)}%`,
    };
  };

  // Create table structure from backend data
  const createTableStructure = () => {
    const tables = [
      {
        id: "sales",
        title: "Sales",
        icon: "💰",
        data: financialTables.table1 || [],
        columns: [
          { key: "Store", label: "Store Location", align: "left" as const },
          {
            key: "Tw Sales",
            label: "This Week",
            align: "center" as const,
            format: "currency",
          },
          {
            key: "Lw Sales",
            label: "Last Week",
            align: "center" as const,
            format: "currency",
          },
          {
            key: "Ly Sales",
            label: "Last Year",
            align: "center" as const,
            format: "currency",
          },
          {
            key: "Tw vs. Lw",
            label: "TW vs LW",
            align: "center" as const,
            format: "percentage",
          },
          {
            key: "Tw vs. Ly",
            label: "TW vs LY",
            align: "center" as const,
            format: "percentage",
          },
        ],
      },
      {
        id: "orders",
        title: "Orders",
        icon: "📋",
        data: financialTables.table2 || [],
        columns: [
          { key: "Store", label: "Store Location", align: "left" as const },
          {
            key: "Tw Orders",
            label: "This Week",
            align: "center" as const,
            format: "number",
          },
          {
            key: "Lw Orders",
            label: "Last Week",
            align: "center" as const,
            format: "number",
          },
          {
            key: "Ly Orders",
            label: "Last Year",
            align: "center" as const,
            format: "number",
          },
          {
            key: "Tw vs. Lw",
            label: "TW vs LW",
            align: "center" as const,
            format: "percentage",
          },
          {
            key: "Tw vs. Ly",
            label: "TW vs LY",
            align: "center" as const,
            format: "percentage",
          },
        ],
      },
      {
        id: "avgticket",
        title: "Avg Ticket",
        icon: "🎫",
        data: financialTables.table3 || [],
        columns: [
          { key: "Store", label: "Store Location", align: "left" as const },
          {
            key: "Tw Avg Ticket",
            label: "This Week",
            align: "center" as const,
            format: "currency",
          },
          {
            key: "Lw Avg Ticket",
            label: "Last Week",
            align: "center" as const,
            format: "currency",
          },
          {
            key: "Ly Avg Ticket",
            label: "Last Year",
            align: "center" as const,
            format: "currency",
          },
          {
            key: "Tw vs. Lw",
            label: "TW vs LW",
            align: "center" as const,
            format: "percentage",
          },
          {
            key: "Tw vs. Ly",
            label: "TW vs LY",
            align: "center" as const,
            format: "percentage",
          },
        ],
      },
      {
        id: "cogs",
        title: "Cost of Goods",
        icon: "📦",
        data: financialTables.table4 || [],
        columns: [
          { key: "Store", label: "Store Location", align: "left" as const },
          {
            key: "Tw COGS",
            label: "This Week",
            align: "center" as const,
            format: "currency",
          },
          {
            key: "Lw COGS",
            label: "Last Week",
            align: "center" as const,
            format: "currency",
          },
          {
            key: "Tw vs. Lw",
            label: "Change",
            align: "center" as const,
            format: "percentage",
          },
          {
            key: "Tw Fc %",
            label: "TW %",
            align: "center" as const,
            format: "percentage",
          },
          {
            key: "Lw Fc %",
            label: "LW %",
            align: "center" as const,
            format: "percentage",
          },
        ],
      },
      {
        id: "labor",
        title: "Labor Cost",
        icon: "👥",
        data: financialTables.table5 || [],
        columns: [
          { key: "Store", label: "Store Location", align: "left" as const },
          {
            key: "Tw Reg Pay",
            label: "This Week",
            align: "center" as const,
            format: "currency",
          }, // UPDATED: Changed from 'number' to 'currency'
          {
            key: "Lw Reg Pay",
            label: "Last Week",
            align: "center" as const,
            format: "currency",
          }, // UPDATED: Changed from 'number' to 'currency'
          {
            key: "Tw vs. Lw",
            label: "Change",
            align: "center" as const,
            format: "percentage",
          },
          {
            key: "Tw Lc %",
            label: "TW %",
            align: "center" as const,
            format: "percentage",
          },
          {
            key: "Lw Lc %",
            label: "LW %",
            align: "center" as const,
            format: "percentage",
          },
        ],
      },
      {
        id: "hours",
        title: "Labor Hours",
        icon: "⏰",
        data: financialTables.table6 || [],
        columns: [
          { key: "Store", label: "Store Location", align: "left" as const },
          {
            key: "Tw Lb Hrs",
            label: "This Week",
            align: "center" as const,
            format: "hours",
          }, // UPDATED: Changed from 'hoursWithDollar' to 'hours'
          {
            key: "Lw Lb Hrs",
            label: "Last Week",
            align: "center" as const,
            format: "hours",
          }, // UPDATED: Changed from 'hoursWithDollar' to 'hours'
          {
            key: "Tw vs. Lw",
            label: "Change",
            align: "center" as const,
            format: "percentage",
          },
        ],
      },
      {
        id: "spmh",
        title: "Sales per Hour",
        icon: "⚡",
        data: financialTables.table7 || [],
        columns: [
          { key: "Store", label: "Store Location", align: "left" as const },
          {
            key: "Tw SPMH",
            label: "This Week",
            align: "center" as const,
            format: "currency",
          },
          {
            key: "Lw SPMH",
            label: "Last Week",
            align: "center" as const,
            format: "currency",
          },
          {
            key: "Tw vs. Lw",
            label: "Change",
            align: "center" as const,
            format: "percentage",
          },
        ],
      },
    ];

    return tables.filter((table) => table.data.length > 0);
  };

  // Format cell value based on type
  const formatCellValue = (value: any, format: string) => {
    if (value === null || value === undefined) return "-";

    switch (format) {
      case "currency":
        return formatCurrency(value);
      case "percentage":
        return formatPercentage(value);
      case "number":
        return formatNumber(value);
      case "numberWithDollar":
        return formatNumberWithDollar(value);
      case "hours":
        return formatHours(value);
      case "hoursWithDollar":
        return formatHoursWithDollar(value);
      default:
        return value.toString();
    }
  };

  // Render table cell with clean, simple styling
  const renderTableCell = (
    value: any,
    format: string,
    isGrandTotal: boolean = false,
    align: string = "center"
  ) => {
    const formattedValue = formatCellValue(value, format);

    if (format === "percentage" && typeof value === "number" && value !== 0) {
      const changeIndicator = getChangeIndicator(value);
      return (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: align === "left" ? "flex-start" : "center",
            gap: 0.5,
          }}
        >
          <Box
            sx={{
              backgroundColor: changeIndicator.color,
              borderRadius: "50%",
              width: 16,
              height: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mr: 0.5,
            }}
          >
            <Typography
              sx={{
                color: "white",
                fontSize: "0.6rem",
                fontWeight: "bold",
                lineHeight: 1,
              }}
            >
              {value > 0 ? "↗" : "↘"}
            </Typography>
          </Box>
          <Typography
            sx={{
              color: theme.palette.grey[700],
              fontWeight: isGrandTotal ? 600 : 500,
              fontSize: "0.875rem",
            }}
          >
            {changeIndicator.text}
          </Typography>
        </Box>
      );
    }

    return (
      <Typography
        sx={{
          fontWeight: isGrandTotal ? 600 : 500,
          fontSize: "0.875rem",
          color: isGrandTotal
            ? theme.palette.primary.main
            : theme.palette.grey[700],
          textAlign: align === "left" ? "left" : "center",
        }}
      >
        {formattedValue}
      </Typography>
    );
  };

  const tablesData = createTableStructure();

  // Check if we have any data
  const hasData = tablesData.length > 0;

  if (!hasData) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        <Typography variant="h6" gutterBottom>
          No Financial Data Available
        </Typography>
        <Typography variant="body2">
          Financial tables data is not available. Please ensure data is loaded
          from the backend.
        </Typography>
      </Alert>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      {/* Compact table filter tabs with smaller spacing to fit all on one screen */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          mb: 2,
          backgroundColor: alpha(theme.palette.primary.main, 0.02),
          borderRadius: 1,
          p: 0.5,
          overflow: "hidden",
        }}
      >
        <Tabs
          value={tableTab}
          onChange={handleTableTabChange}
          variant="scrollable"
          scrollButtons={false}
          allowScrollButtonsMobile={false}
          sx={{
            minHeight: "auto",
            "& .MuiTabs-flexContainer": {
              gap: 0.5,
            },
            "& .MuiTab-root": {
              textTransform: "none",
              minWidth: "auto",
              minHeight: "auto",
              fontWeight: 500,
              fontSize: "0.75rem",
              px: 1,
              py: 0.5,
              margin: "0 2px",
              borderRadius: 0.5,
              transition: "all 0.2s ease",
              maxWidth: "140px",
              "&.Mui-selected": {
                color: theme.palette.primary.main,
                fontWeight: 600,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                fontSize: "0.75rem",
              },
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
              },
            },
            "& .MuiTabs-indicator": {
              display: "none",
            },
          }}
        >
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <span style={{ fontSize: "0.75rem" }}>📊</span>
                <span>All</span>
                <Chip
                  label={tablesData.length}
                  size="small"
                  sx={{
                    height: 16,
                    fontSize: "0.65rem",
                    minWidth: 16,
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    "& .MuiChip-label": {
                      px: 0.5,
                    },
                  }}
                />
              </Box>
            }
          />
          {tablesData.map((table, index) => (
            <Tab
              key={table.id}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <span style={{ fontSize: "0.75rem" }}>{table.icon}</span>
                  <span>{table.title}</span>
                  <Chip
                    label={table.data.length}
                    size="small"
                    sx={{
                      height: 16,
                      fontSize: "0.65rem",
                      minWidth: 16,
                      backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                      color: theme.palette.secondary.main,
                      "& .MuiChip-label": {
                        px: 0.5,
                      },
                    }}
                  />
                </Box>
              }
            />
          ))}
        </Tabs>
      </Box>

      {/* All Tables Panel */}
      <TablePanel value={tableTab} index={0}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {tablesData.map((table, index) => (
            <Card
              key={index}
              elevation={0}
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                border: `1px solid ${theme.palette.grey[200]}`,
                transition: "all 0.2s ease",
                backgroundColor: "#ffffff",
                "&:hover": {
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                  borderColor: theme.palette.primary.light,
                },
              }}
            >
              {/* Clean Simple Header */}
              <Box
                sx={{
                  backgroundColor: "#f8fafc",
                  borderBottom: `1px solid ${theme.palette.grey[200]}`,
                  px: 3,
                  py: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    borderRadius: 2,
                    p: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: 40,
                    height: 40,
                  }}
                >
                  <Typography sx={{ fontSize: "1.1rem" }}>
                    {table.icon}
                  </Typography>
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      color: theme.palette.grey[800],
                      mb: 0.5,
                    }}
                  >
                    {table.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.grey[600],
                      fontSize: "0.875rem",
                    }}
                  >
                    {table.data.length} locations
                  </Typography>
                </Box>
              </Box>

              {/* Clean Table Content */}
              <TableContainer sx={{ backgroundColor: "#ffffff" }}>
                <Table sx={{ "& th, & td": { px: 2, py: 1.5 } }}>
                  <TableHead>
                    <TableRow>
                      {table.columns.map((column, colIndex) => (
                        <TableCell
                          key={colIndex}
                          align={column.align}
                          sx={{
                            fontWeight: 600,
                            backgroundColor: "#f8fafc",
                            borderBottom: `1px solid ${theme.palette.grey[200]}`,
                            color: theme.palette.grey[700],
                            fontSize: "0.875rem",
                            py: 1.5,
                            "&:first-of-type": {
                              borderTopLeftRadius: 0,
                            },
                            "&:last-of-type": {
                              borderTopRightRadius: 0,
                            },
                          }}
                        >
                          {column.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {table.data.map((row, rowIndex) => {
                      const isGrandTotal = row.Store === "Grand Total";

                      return (
                        <TableRow
                          key={rowIndex}
                          sx={{
                            backgroundColor: isGrandTotal
                              ? alpha(theme.palette.primary.main, 0.04)
                              : "transparent",
                            borderBottom: isGrandTotal
                              ? `2px solid ${theme.palette.primary.main}`
                              : `1px solid ${theme.palette.grey[100]}`,
                            "&:hover": {
                              backgroundColor: isGrandTotal
                                ? alpha(theme.palette.primary.main, 0.08)
                                : alpha(theme.palette.grey[50], 0.8),
                            },
                            "&:last-child": {
                              borderBottom: "none",
                            },
                          }}
                        >
                          {table.columns.map((column, colIndex) => (
                            <TableCell
                              key={colIndex}
                              align={column.align}
                              sx={{
                                borderBottom: "none",
                                py: 1.5,
                                fontSize: "0.875rem",
                              }}
                            >
                              {colIndex === 0 ? (
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  {isGrandTotal && (
                                    <Box
                                      sx={{
                                        backgroundColor:
                                          theme.palette.warning.main,
                                        borderRadius: "50%",
                                        width: 20,
                                        height: 20,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "0.7rem",
                                      }}
                                    >
                                      ⭐
                                    </Box>
                                  )}
                                  <Typography
                                    sx={{
                                      fontWeight: isGrandTotal ? 700 : 500,
                                      color: isGrandTotal
                                        ? theme.palette.primary.main
                                        : theme.palette.grey[800],
                                      fontSize: "0.875rem",
                                    }}
                                  >
                                    {row[column.key]}
                                  </Typography>
                                </Box>
                              ) : (
                                renderTableCell(
                                  row[column.key],
                                  column.format,
                                  isGrandTotal,
                                  column.align
                                )
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          ))}
        </Box>
      </TablePanel>

      {/* Individual table panels */}
      {tablesData.map((table, index) => (
        <TablePanel value={tableTab} index={index + 1} key={index}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              border: `1px solid ${theme.palette.grey[200]}`,
              backgroundColor: "#ffffff",
            }}
          >
            {/* Clean Simple Header */}
            <Box
              sx={{
                backgroundColor: "#f8fafc",
                borderBottom: `1px solid ${theme.palette.grey[200]}`,
                px: 3,
                py: 2,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: 2,
                  p: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 40,
                  height: 40,
                }}
              >
                <Typography sx={{ fontSize: "1.1rem" }}>
                  {table.icon}
                </Typography>
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    color: theme.palette.grey[800],
                    mb: 0.5,
                  }}
                >
                  {table.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.grey[600],
                    fontSize: "0.875rem",
                  }}
                >
                  {table.data.length} locations
                </Typography>
              </Box>
            </Box>

            {/* Clean Table Content */}
            <TableContainer sx={{ backgroundColor: "#ffffff" }}>
              <Table sx={{ "& th, & td": { px: 2, py: 1.5 } }}>
                <TableHead>
                  <TableRow>
                    {table.columns.map((column, colIndex) => (
                      <TableCell
                        key={colIndex}
                        align={column.align}
                        sx={{
                          fontWeight: 600,
                          backgroundColor: "#f8fafc",
                          borderBottom: `1px solid ${theme.palette.grey[200]}`,
                          color: theme.palette.grey[700],
                          fontSize: "0.875rem",
                          py: 1.5,
                        }}
                      >
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {table.data.map((row, rowIndex) => {
                    const isGrandTotal = row.Store === "Grand Total";

                    return (
                      <TableRow
                        key={rowIndex}
                        sx={{
                          backgroundColor: isGrandTotal
                            ? alpha(theme.palette.primary.main, 0.04)
                            : "transparent",
                          borderBottom: isGrandTotal
                            ? `2px solid ${theme.palette.primary.main}`
                            : `1px solid ${theme.palette.grey[100]}`,
                          "&:hover": {
                            backgroundColor: isGrandTotal
                              ? alpha(theme.palette.primary.main, 0.08)
                              : alpha(theme.palette.grey[50], 0.8),
                          },
                          "&:last-child": {
                            borderBottom: "none",
                          },
                        }}
                      >
                        {table.columns.map((column, colIndex) => (
                          <TableCell
                            key={colIndex}
                            align={column.align}
                            sx={{
                              borderBottom: "none",
                              py: 1.5,
                              fontSize: "0.875rem",
                            }}
                          >
                            {colIndex === 0 ? (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                {isGrandTotal && (
                                  <Box
                                    sx={{
                                      backgroundColor:
                                        theme.palette.warning.main,
                                      borderRadius: "50%",
                                      width: 20,
                                      height: 20,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: "0.7rem",
                                    }}
                                  >
                                    ⭐
                                  </Box>
                                )}
                                <Typography
                                  sx={{
                                    fontWeight: isGrandTotal ? 700 : 500,
                                    color: isGrandTotal
                                      ? theme.palette.primary.main
                                      : theme.palette.grey[800],
                                    fontSize: "0.875rem",
                                  }}
                                >
                                  {row[column.key]}
                                </Typography>
                              </Box>
                            ) : (
                              renderTableCell(
                                row[column.key],
                                column.format,
                                isGrandTotal,
                                column.align
                              )
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </TablePanel>
      ))}
    </Box>
  );
};

export default FinancialTablesComponent;

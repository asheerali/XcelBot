import React, { useState, useEffect } from "react";
import type { AlertColor } from "@mui/material";
import {
  Box,
  Container,
  Typography,
  Card,
  Grid,
  Button,
  Chip,
  Paper,
  useTheme,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Tabs,
  Tab,
  Divider,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import apiClient from "../api/axiosConfig";
import { API_URL_Local } from "../constants";

// Material-UI Icons
import DeleteIcon from "@mui/icons-material/Delete";
import FolderIcon from "@mui/icons-material/Folder";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import DescriptionIcon from "@mui/icons-material/Description";
import RefreshIcon from "@mui/icons-material/Refresh";
import WarningIcon from "@mui/icons-material/Warning";
import StorageIcon from "@mui/icons-material/Storage";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AssessmentIcon from "@mui/icons-material/Assessment";
import CloseIcon from "@mui/icons-material/Close";

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  background: `linear-gradient(145deg, ${
    theme.palette.background.paper
  } 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
  boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`,
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: `0 16px 48px ${alpha(theme.palette.common.black, 0.12)}`,
  },
}));

const ContentCard = styled(Card)(({ theme }) => ({
  marginTop: theme.spacing(3),
  borderRadius: 16,
  minHeight: 500,
  background: theme.palette.background.paper,
  boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.08)}`,
  overflow: "visible",
}));

const TabContainer = styled(Box)(({ theme }) => ({
  borderBottom: 1,
  borderColor: "divider",
  marginBottom: theme.spacing(3),
  "& .MuiTabs-root": {
    minHeight: 48,
  },
  "& .MuiTab-root": {
    textTransform: "none",
    fontWeight: 600,
    fontSize: "0.875rem",
    minHeight: 48,
    padding: theme.spacing(1.5, 3),
    "&.Mui-selected": {
      color: theme.palette.primary.main,
    },
  },
}));

const MetricCard = styled(Card)(({ theme }) => ({
  position: "relative",
  borderRadius: 16,
  overflow: "hidden",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  height: 140,
  cursor: "pointer",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: `0 12px 24px ${alpha(theme.palette.common.black, 0.15)}`,
  },
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
}));

const FileManagementPage = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [files, setFiles] = useState([]);
  const [sortBy, setSortBy] = useState("file_timestamp");
  const [sortOrder, setSortOrder] = useState("desc");

  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    fileName: "",
    type: "",
  });
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    severity: "success",
  });

  const dataTypes = [
    {
      name: "PMix Sales",
      key: "salespmix",
      icon: TrendingUpIcon,
      color: theme.palette.primary.main,
      gradient: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
      bgGradient: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
      fileListEndpoint: "/salespmix/analytics/file-list",
      deleteEndpoint: "/salespmix/bulk/by-filename",
      locationsEndpoint: "/salespmix/analytics/locations",
      locationKey: "location",
      hasSales: true, // Fixed typo: was "hasSeales"
    },
    {
      name: "Financials Companywide",
      key: "financialscompanywide",
      icon: AttachMoneyIcon,
      color: theme.palette.success.main,
      gradient: "linear-gradient(135deg, #388e3c 0%, #2e7d32 100%)",
      bgGradient: "linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)",
      fileListEndpoint: "/financialscompanywide/analytics/file-list",
      deleteEndpoint: "/financialscompanywide/bulk/by-filename",
      locationsEndpoint: "/financialscompanywide/analytics/stores",
      locationKey: "store",
      hasSales: true, // Changed from false to true to show sales
    },
    {
      name: "Budget",
      key: "budget",
      icon: AssessmentIcon,
      color: theme.palette.warning.main,
      gradient: "linear-gradient(135deg, #f57c00 0%, #ef6c00 100%)",
      bgGradient: "linear-gradient(135deg, #fff3e0 0%, #ffcc02 100%)",
      fileListEndpoint: "/budget/analytics/file-list",
      deleteEndpoint: "/budget/bulk/by-filename",
      locationsEndpoint: "/budget/analytics/stores",
      locationKey: "store",
      hasSales: true, // Changed to true to show sales data
    },
  ];

  const currentDataType = dataTypes[activeTab];

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log("🔄 Fetching data for:", currentDataType.name);

      // Fetch files
      const filesResponse = await apiClient.get(
        currentDataType.fileListEndpoint
      );
      console.log("📂 Files response:", filesResponse.data);
      setFiles(Array.isArray(filesResponse.data) ? filesResponse.data : []);

      // Fetch locations
      const locationsResponse = await apiClient.get(
        currentDataType.locationsEndpoint
      );
      console.log("📍 Locations response:", locationsResponse.data);
      setLocations(
        Array.isArray(locationsResponse.data) ? locationsResponse.data : []
      );
    } catch (error) {
      console.error("❌ Error fetching data:", error);

      let errorMessage = "Error fetching data";
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = "Authentication failed. Please log in again.";
        } else {
          const detail = error.response.data?.detail;
          errorMessage = `Server error: ${detail || error.response.status}`;

          if (error.response.status === 404) {
            errorMessage = "API endpoint not found. Is the server running?";
          }
        }
      } else if (error.request) {
        errorMessage =
          "No response from server. Please check if the backend is running.";
      } else {
        errorMessage = error.message || "Unknown error occurred";
      }

      showAlert(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleDeleteClick = (fileName) => {
    setDeleteDialog({ open: true, fileName, type: currentDataType.name });
  };

  const handleDeleteConfirm = async () => {
    try {
      console.log("🗑️ Deleting file:", deleteDialog.fileName);

      const response = await apiClient.delete(currentDataType.deleteEndpoint, {
        params: {
          file_name: deleteDialog.fileName,
          confirm: true,
        },
      });

      console.log("✅ File deleted successfully:", response.data);
      showAlert(
        `File "${deleteDialog.fileName}" deleted successfully`,
        "success"
      );
      fetchData();
    } catch (error) {
      console.error("❌ Error deleting file:", error);

      let errorMessage = "Error deleting file";
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = "Authentication failed. Please log in again.";
        } else {
          const detail = error.response.data?.detail;
          errorMessage = `Delete failed: ${detail || error.response.status}`;
        }
      } else if (error.request) {
        errorMessage =
          "No response from server. Please check if the backend is running.";
      } else {
        errorMessage = error.message || "Unknown delete error";
      }

      showAlert(errorMessage, "error");
    } finally {
      setDeleteDialog({ open: false, fileName: "", type: "" });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, fileName: "", type: "" });
  };

  const showAlert = (message, severity) => {
    setAlert({ show: true, message, severity });
    setTimeout(
      () => setAlert({ show: false, message: "", severity: "success" }),
      5000
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'

    return `${month}-${day}-${year} - ${hours}:${minutes} ${ampm}`;
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handleRefresh = () => {
    fetchData();
  };

  // Calculate total sales for data types that have sales
  const getTotalSales = () => {
    if (currentDataType.hasSales && locations.length > 0) {
      return locations.reduce((sum, location) => {
        // Handle different property names for sales data
        const salesAmount =
          location.total_sales || location.sales || location.amount || 0;
        return sum + salesAmount;
      }, 0);
    }
    return 0;
  };

  const renderFileColumns = () => {
    const handleSort = (field) => {
      if (sortBy === field) {
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
      } else {
        setSortBy(field);
        setSortOrder("asc");
      }
    };

    const getSortIcon = (field) => {
      if (sortBy !== field) {
        return (
          <Box component="span" sx={{ ml: 1, opacity: 0.3 }}>
            <Box component="span" sx={{ fontSize: "0.75rem" }}>
              ↕
            </Box>
          </Box>
        );
      }

      return (
        <Box component="span" sx={{ ml: 1 }}>
          {sortOrder === "asc" ? (
            <Box
              component="span"
              sx={{ fontSize: "0.75rem", color: theme.palette.primary.main }}
            >
              ↑
            </Box>
          ) : (
            <Box
              component="span"
              sx={{ fontSize: "0.75rem", color: theme.palette.primary.main }}
            >
              ↓
            </Box>
          )}
        </Box>
      );
    };

    const renderHeader = (label, field) => (
      <TableCell
        sx={{
          fontWeight: 600,
          color: theme.palette.text.secondary,
          cursor: "pointer",
          userSelect: "none",
          position: "relative",
          "&:hover": {
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
          },
          transition: "background-color 0.2s ease",
        }}
        onClick={() => handleSort(field)}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>{label}</span>
          {getSortIcon(field)}
        </Box>
      </TableCell>
    );

    return (
      <>
        {renderHeader("Company", "company_name")}
        {renderHeader("Uploaded At", "file_timestamp")}
        {renderHeader("Records", "record_count")}
        {renderHeader(
          currentDataType.key === "salespmix" ? "Date Range" : "Year Range",
          currentDataType.key === "salespmix"
            ? "earliest_date"
            : "earliest_year"
        )}
      </>
    );
  };

  const renderFileData = (file) => {
    return (
      <>
        <TableCell>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {file.company_name || "N/A"}
          </Typography>
        </TableCell>

        <TableCell>
          <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
            {formatDateTime(file.file_timestamp)}
          </Typography>
        </TableCell>

        <TableCell>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <StorageIcon
              sx={{
                mr: 1,
                color: theme.palette.text.secondary,
                fontSize: 16,
              }}
            />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {file.record_count?.toLocaleString() || "N/A"}
            </Typography>
          </Box>
        </TableCell>

        <TableCell>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <CalendarTodayIcon
              sx={{
                mr: 1,
                color: theme.palette.text.secondary,
                fontSize: 16,
              }}
            />
            <Typography variant="body2">
              {currentDataType.key === "salespmix"
                ? `${formatDate(file.earliest_date)} - ${formatDate(
                    file.latest_date
                  )}`
                : `${file.earliest_year || "N/A"} - ${
                    file.latest_year || "N/A"
                  }`}
            </Typography>
          </Box>
        </TableCell>
      </>
    );
  };

  if (loading && files.length === 0 && locations.length === 0) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #fafafa 0%, #ffffff 100%)",
        }}
      >
        <CircularProgress size={50} />
        <Typography sx={{ ml: 2 }}>Loading file management data...</Typography>
      </Box>
    );
  }

  const sortedFiles = [...files].sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];

    if (sortBy === "file_timestamp") {
      valA = new Date(valA);
      valB = new Date(valB);
      return sortOrder === "asc" ? valA - valB : valB - valA;
    }

    if (typeof valA === "string") valA = valA.toLowerCase();
    if (typeof valB === "string") valB = valB.toLowerCase();

    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #fafafa 0%, #ffffff 100%)",
      }}
    >
      {/* Top Controls */}
      <Container maxWidth="xl" sx={{ pt: 3, pb: 1 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                p: 1.5,
                background: currentDataType.gradient,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FolderIcon sx={{ color: "white", fontSize: 28 }} />
            </Box>
            <Box>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: theme.palette.text.primary }}
              >
                File Management Dashboard
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{ color: theme.palette.text.secondary }}
              >
                Manage your data files across different systems
              </Typography>
            </Box>
          </Box>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              px: 3,
              py: 1.5,
              borderColor: alpha(theme.palette.primary.main, 0.3),
              color: theme.palette.primary.main,
              "&:hover": {
                borderColor: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.primary.main, 0.04),
              },
            }}
          >
            Refresh Data
          </Button>
        </Box>
      </Container>

      {/* Alert */}
      <Container maxWidth="xl">
        {alert.show && (
          <Alert
            severity={alert.severity as AlertColor}
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setAlert({ ...alert, show: false })}
          >
            {alert.message}
          </Alert>
        )}
      </Container>

      {/* Main Content */}
      <Container maxWidth="xl">
        <StyledCard sx={{ p: 4, overflow: "visible" }}>
          {/* Enhanced Tabs */}
          <TabContainer>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="file management tabs"
              sx={{
                "& .MuiTabs-indicator": {
                  height: 3,
                  borderRadius: 1.5,
                  background: currentDataType.gradient,
                },
              }}
            >
              {dataTypes.map((type, index) => {
                const IconComponent = type.icon;
                return (
                  <Tab
                    key={index}
                    label={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <IconComponent sx={{ fontSize: 20 }} />
                        {type.name}
                      </Box>
                    }
                  />
                );
              })}
            </Tabs>
          </TabContainer>

          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={currentDataType.hasSales ? 3 : 4}>
              <MetricCard
                sx={{
                  background: currentDataType.bgGradient,
                  border: `1px solid ${alpha(currentDataType.color, 0.2)}`,
                  "&::before": { background: currentDataType.gradient },
                }}
              >
                <Box
                  sx={{
                    p: 3,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: currentDataType.color,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      Total Files
                    </Typography>
                    <DescriptionIcon
                      sx={{ color: currentDataType.color, fontSize: 24 }}
                    />
                  </Box>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      color: currentDataType.color,
                      lineHeight: 1,
                    }}
                  >
                    {files.length}
                  </Typography>
                </Box>
              </MetricCard>
            </Grid>

            <Grid item xs={12} sm={6} md={currentDataType.hasSales ? 3 : 4}>
              <MetricCard
                sx={{
                  background:
                    "linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)",
                  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                  "&::before": {
                    background:
                      "linear-gradient(135deg, #388e3c 0%, #2e7d32 100%)",
                  },
                }}
              >
                <Box
                  sx={{
                    p: 3,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.palette.success.main,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      Total Records
                    </Typography>
                    <StorageIcon
                      sx={{ color: theme.palette.success.main, fontSize: 24 }}
                    />
                  </Box>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      color: theme.palette.success.main,
                      lineHeight: 1,
                    }}
                  >
                    {files
                      .reduce((sum, file) => sum + (file.record_count || 0), 0)
                      .toLocaleString()}
                  </Typography>
                </Box>
              </MetricCard>
            </Grid>

            <Grid item xs={12} sm={6} md={currentDataType.hasSales ? 3 : 4}>
              <MetricCard
                sx={{
                  background:
                    "linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)",
                  border: `1px solid ${alpha(
                    theme.palette.secondary.main,
                    0.2
                  )}`,
                  "&::before": {
                    background:
                      "linear-gradient(135deg, #8e24aa 0%, #7b1fa2 100%)",
                  },
                }}
              >
                <Box
                  sx={{
                    p: 3,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.palette.secondary.main,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      {currentDataType.key === "salespmix"
                        ? "Locations"
                        : "Stores"}
                    </Typography>
                    <LocationOnIcon
                      sx={{ color: theme.palette.secondary.main, fontSize: 24 }}
                    />
                  </Box>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      color: theme.palette.secondary.main,
                      lineHeight: 1,
                    }}
                  >
                    {locations.length}
                  </Typography>
                </Box>
              </MetricCard>
            </Grid>

            {/* Total Sales Card - Show for data types that have sales */}
            {currentDataType.hasSales && (
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                  sx={{
                    background:
                      "linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)",
                    border: `1px solid ${alpha(
                      theme.palette.warning.main,
                      0.2
                    )}`,
                    "&::before": {
                      background:
                        "linear-gradient(135deg, #ff8f00 0%, #ff6f00 100%)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      p: 3,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: theme.palette.warning.main,
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                        }}
                      >
                        Total Sales
                      </Typography>
                      <AttachMoneyIcon
                        sx={{ color: theme.palette.warning.main, fontSize: 24 }}
                      />
                    </Box>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 800,
                        color: theme.palette.warning.main,
                        lineHeight: 1,
                        fontSize: "1.5rem", // Smaller font for currency
                      }}
                    >
                      {formatCurrency(getTotalSales())}
                    </Typography>
                  </Box>
                </MetricCard>
              </Grid>
            )}
          </Grid>
        </StyledCard>
      </Container>

      {/* Content Cards */}
      <Container maxWidth="xl">
        <Grid container spacing={3}>
          {/* Files Section */}
          <Grid item xs={12} lg={8}>
            <ContentCard>
              <Box
                sx={{
                  p: 3,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <DescriptionIcon sx={{ color: currentDataType.color }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Files - {currentDataType.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Manage and delete your data files
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {loading ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    py: 8,
                  }}
                >
                  <CircularProgress />
                  <Typography sx={{ ml: 2 }}>Loading files...</Typography>
                </Box>
              ) : (
                <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow
                          sx={{
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              0.04
                            ),
                          }}
                        >
                          <TableCell
                            sx={{
                              fontWeight: 600,
                              color: theme.palette.text.secondary,
                            }}
                          >
                            File Name
                          </TableCell>
                          {renderFileColumns()}
                          <TableCell
                            align="center"
                            sx={{
                              fontWeight: 600,
                              color: theme.palette.text.secondary,
                            }}
                          >
                            Actions
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {files.length > 0 ? (
                          sortedFiles.map((file, index) => (
                            <TableRow
                              key={index}
                              hover
                              sx={{
                                "&:hover": {
                                  backgroundColor: alpha(
                                    currentDataType.color,
                                    0.04
                                  ),
                                },
                              }}
                            >
                              <TableCell>
                                <Box
                                  sx={{ display: "flex", alignItems: "center" }}
                                >
                                  <Box
                                    sx={{
                                      width: 40,
                                      height: 40,
                                      borderRadius: 2,
                                      background: alpha(
                                        currentDataType.color,
                                        0.1
                                      ),
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      mr: 2,
                                    }}
                                  >
                                    <DescriptionIcon
                                      sx={{
                                        color: currentDataType.color,
                                        fontSize: 20,
                                      }}
                                    />
                                  </Box>
                                  <Box>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontWeight: 500,
                                        fontFamily: "monospace",
                                        wordBreak: "break-all",
                                        maxWidth: 300,
                                      }}
                                    >
                                      {file.file_name}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              {renderFileData(file)}
                              <TableCell align="center">
                                <Button
                                  variant="outlined"
                                  color="error"
                                  size="small"
                                  startIcon={<DeleteIcon />}
                                  onClick={() =>
                                    handleDeleteClick(file.file_name)
                                  }
                                  sx={{
                                    textTransform: "none",
                                    borderRadius: 2,
                                    px: 2,
                                    py: 1,
                                  }}
                                >
                                  Delete
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={6}
                              align="center"
                              sx={{ py: 8 }}
                            >
                              <DescriptionIcon
                                sx={{
                                  fontSize: 48,
                                  color: theme.palette.text.disabled,
                                  mb: 2,
                                }}
                              />
                              <Typography
                                variant="h6"
                                color="text.secondary"
                                gutterBottom
                              >
                                No files found
                              </Typography>
                              <Typography variant="body2" color="text.disabled">
                                Upload some files to get started
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </ContentCard>
          </Grid>

          {/* Locations Section */}
          <Grid item xs={12} lg={4}>
            <ContentCard>
              <Box
                sx={{
                  p: 3,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <LocationOnIcon sx={{ color: currentDataType.color }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {currentDataType.key === "salespmix"
                        ? "Locations"
                        : "Stores"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {locations.length} locations available
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ p: 3, maxHeight: 500, overflowY: "auto" }}>
                {locations.length > 0 ? (
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    {locations.map((location, index) => (
                      <StyledCard key={index} sx={{ p: 3 }}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 2 }}
                        >
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              background: currentDataType.gradient,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              mr: 2,
                            }}
                          >
                            <LocationOnIcon
                              sx={{ color: "white", fontSize: 16 }}
                            />
                          </Box>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 600,
                              textTransform: "capitalize",
                              color: theme.palette.text.primary,
                            }}
                          >
                            {location[currentDataType.locationKey]}
                          </Typography>
                        </Box>

                        <Grid container spacing={2}>
                          {/* Records Count */}
                          <Grid item xs={currentDataType.hasSales ? 6 : 12}>
                            <Box sx={{ textAlign: "center" }}>
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: 700,
                                  color: theme.palette.primary.main,
                                }}
                              >
                                {location.record_count?.toLocaleString() ||
                                  "N/A"}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Records
                              </Typography>
                            </Box>
                          </Grid>

                          {/* Total Sales - Show for data types that have sales */}
                          {currentDataType.hasSales && (
                            <Grid item xs={6}>
                              <Box sx={{ textAlign: "center" }}>
                                <Typography
                                  variant="h6"
                                  sx={{
                                    fontWeight: 700,
                                    color: theme.palette.success.main,
                                    fontSize: "1rem", // Smaller for currency
                                  }}
                                >
                                  {formatCurrency(
                                    location.total_sales ||
                                      location.sales ||
                                      location.amount ||
                                      0
                                  )}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Total Sales
                                </Typography>
                              </Box>
                            </Grid>
                          )}
                        </Grid>
                      </StyledCard>
                    ))}
                  </Box>
                ) : (
                  <Box sx={{ textAlign: "center", py: 6 }}>
                    <LocationOnIcon
                      sx={{
                        fontSize: 48,
                        color: theme.palette.text.disabled,
                        mb: 2,
                      }}
                    />
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      gutterBottom
                    >
                      No locations found
                    </Typography>
                    <Typography variant="body2" color="text.disabled">
                      Data will appear here when available
                    </Typography>
                  </Box>
                )}
              </Box>
            </ContentCard>
          </Grid>
        </Grid>
      </Container>

      {/* Enhanced Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: "linear-gradient(145deg, #ffffff 0%, #fafafa 100%)",
          },
        }}
      >
        <DialogTitle
          sx={{
            borderBottom: `1px solid ${theme.palette.divider}`,
            pb: 2,
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <WarningIcon sx={{ color: "white", fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Confirm File Deletion
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This action cannot be undone
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to delete this file?
          </Typography>

          <Box
            sx={{
              mt: 2,
              p: 2,
              backgroundColor: alpha(theme.palette.grey[500], 0.08),
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.grey[500], 0.2)}`,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontFamily: "monospace",
                wordBreak: "break-all",
                fontWeight: 500,
              }}
            >
              {deleteDialog.fileName}
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            From: <strong>{deleteDialog.type}</strong>
          </Typography>

          <Alert
            severity="warning"
            sx={{
              mt: 3,
              borderRadius: 2,
              "& .MuiAlert-icon": {
                fontSize: 20,
              },
            }}
          >
            <Typography variant="body2">
              This file will be permanently deleted and cannot be recovered.
            </Typography>
          </Alert>
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
            borderTop: `1px solid ${theme.palette.divider}`,
            gap: 2,
          }}
        >
          <Button
            onClick={handleDeleteCancel}
            variant="outlined"
            sx={{
              textTransform: "none",
              borderRadius: 2,
              px: 3,
              py: 1.5,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            sx={{
              textTransform: "none",
              borderRadius: 2,
              px: 3,
              py: 1.5,
              background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
              },
            }}
          >
            Delete File
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FileManagementPage;

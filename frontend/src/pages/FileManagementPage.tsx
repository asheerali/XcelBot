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
  Collapse,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import StorefrontIcon from "@mui/icons-material/Storefront";

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

const LocationChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.25),
  height: 24,
  fontSize: "0.75rem",
  "& .MuiChip-label": {
    padding: theme.spacing(0, 1),
  },
}));

const FileManagementPage = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [files, setFiles] = useState([]);
  const [sortBy, setSortBy] = useState("file_timestamp");
  const [sortOrder, setSortOrder] = useState("desc");
  const [expandedFiles, setExpandedFiles] = useState(new Set());

  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    fileName: "",
    type: "",
    companyName: "",
    selectedLocation: "",
    availableLocations: [],
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
      locationDeleteEndpoint: "/salespmix/bulk/by-location-and-company",
      locationsEndpoint: "/salespmix/analytics/locations",
      locationKey: "location",
      locationsField: "locations",
      hasSales: true,
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
      locationDeleteEndpoint: "/financialscompanywide/bulk/by-store-and-company",
      locationsEndpoint: "/financialscompanywide/analytics/stores",
      locationKey: "store",
      locationsField: "stores",
      hasSales: true,
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
      locationDeleteEndpoint: "/budget/bulk/by-store-and-company",
      locationsEndpoint: "/budget/analytics/stores",
      locationKey: "store",
      locationsField: "stores",
      hasSales: true,
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
    setExpandedFiles(new Set()); // Reset expanded files when switching tabs
  };

  const toggleFileExpansion = (fileName) => {
    const newExpanded = new Set(expandedFiles);
    if (newExpanded.has(fileName)) {
      newExpanded.delete(fileName);
    } else {
      newExpanded.add(fileName);
    }
    setExpandedFiles(newExpanded);
  };

  const handleDeleteClick = (fileName, companyName, fileLocations = []) => {
    const availableLocations = fileLocations.map(loc => ({
      name: loc[currentDataType.locationKey],
      ...loc
    }));
    
    setDeleteDialog({
      open: true,
      fileName,
      type: currentDataType.name,
      companyName,
      selectedLocation: "",
      availableLocations,
    });
  };

  const handleLocationDeleteClick = (fileName, companyName, locationName) => {
    setDeleteDialog({
      open: true,
      fileName,
      type: currentDataType.name,
      companyName,
      selectedLocation: locationName,
      availableLocations: [],
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      console.log("🗑️ Deleting:", {
        fileName: deleteDialog.fileName,
        location: deleteDialog.selectedLocation,
        company: deleteDialog.companyName,
      });

      let response;
      if (deleteDialog.selectedLocation) {
        // Delete specific location
        response = await apiClient.delete(
          currentDataType.locationDeleteEndpoint,
          {
            params: {
              [currentDataType.locationKey]: deleteDialog.selectedLocation,
              company_name: deleteDialog.companyName,
              confirm: true,
            },
          }
        );
      } else {
        // Delete entire file
        response = await apiClient.delete(currentDataType.deleteEndpoint, {
          params: {
            file_name: deleteDialog.fileName,
            confirm: true,
          },
        });
      }

      console.log("✅ Delete successful:", response.data);
      
      const successMessage = deleteDialog.selectedLocation
        ? `Location "${deleteDialog.selectedLocation}" deleted successfully from "${deleteDialog.fileName}"`
        : `File "${deleteDialog.fileName}" deleted successfully`;
        
      showAlert(successMessage, "success");
      fetchData();
    } catch (error) {
      console.error("❌ Error deleting:", error);

      let errorMessage = "Error deleting";
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
      setDeleteDialog({
        open: false,
        fileName: "",
        type: "",
        companyName: "",
        selectedLocation: "",
        availableLocations: [],
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({
      open: false,
      fileName: "",
      type: "",
      companyName: "",
      selectedLocation: "",
      availableLocations: [],
    });
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
    hours = hours ? hours : 12;

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
        const salesAmount =
          location.total_sales || location.sales || location.amount || 0;
        return sum + salesAmount;
      }, 0);
    }
    return 0;
  };

  // Calculate total locations/stores from files
  const getTotalLocationsFromFiles = () => {
    const allLocations = new Set();
    files.forEach(file => {
      const fileLocations = file[currentDataType.locationsField] || [];
      fileLocations.forEach(loc => {
        allLocations.add(loc[currentDataType.locationKey]);
      });
    });
    return allLocations.size;
  };

  // Calculate total sales from files
  const getTotalSalesFromFiles = () => {
    return files.reduce((sum, file) => {
      return sum + (file.total_sales || 0);
    }, 0);
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
          fontSize: "0.875rem",
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
        {renderHeader("Uploaded", "file_timestamp")}
        {renderHeader("Records", "record_count")}
        {renderHeader(
          currentDataType.key === "salespmix" ? "Date Range" : "Year Range",
          currentDataType.key === "salespmix"
            ? "earliest_date"
            : "earliest_year"
        )}
        <TableCell
          sx={{
            fontWeight: 600,
            color: theme.palette.text.secondary,
            fontSize: "0.875rem",
          }}
        >
          {currentDataType.key === "salespmix" ? "Locations" : "Stores"}
        </TableCell>
      </>
    );
  };

  const renderFileData = (file) => {
    const fileLocations = file[currentDataType.locationsField] || [];
    const isExpanded = expandedFiles.has(file.file_name);

    return (
      <>
        <TableCell sx={{ maxWidth: 120 }}>
          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: "0.875rem" }}>
            {file.company_name || "N/A"}
          </Typography>
        </TableCell>

        <TableCell sx={{ maxWidth: 140 }}>
          <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
            {formatDateTime(file.file_timestamp)}
          </Typography>
        </TableCell>

        <TableCell sx={{ maxWidth: 100 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <StorageIcon
              sx={{
                mr: 1,
                color: theme.palette.text.secondary,
                fontSize: 16,
              }}
            />
            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: "0.875rem" }}>
              {file.record_count?.toLocaleString() || "N/A"}
            </Typography>
          </Box>
        </TableCell>

        <TableCell sx={{ maxWidth: 160 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <CalendarTodayIcon
              sx={{
                mr: 1,
                color: theme.palette.text.secondary,
                fontSize: 16,
              }}
            />
            <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
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

        <TableCell sx={{ maxWidth: 200 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500, fontSize: "0.875rem" }}>
                {fileLocations.length} {currentDataType.key === "salespmix" ? "locations" : "stores"}
              </Typography>
              
              {/* Compact location chips */}
              <Box sx={{ mt: 0.5, display: "flex", flexWrap: "wrap", gap: 0.25 }}>
                {fileLocations.slice(0, isExpanded ? fileLocations.length : 2).map((location, idx) => (
                  <Chip
                    key={idx}
                    label={location[currentDataType.locationKey]}
                    size="small"
                    variant="outlined"
                    sx={{
                      height: 20,
                      fontSize: "0.7rem",
                      textTransform: "capitalize",
                      "& .MuiChip-label": {
                        px: 0.5,
                      },
                    }}
                  />
                ))}
                {!isExpanded && fileLocations.length > 2 && (
                  <Chip
                    label={`+${fileLocations.length - 2}`}
                    size="small"
                    variant="outlined"
                    sx={{
                      height: 20,
                      fontSize: "0.7rem",
                      "& .MuiChip-label": {
                        px: 0.5,
                      },
                    }}
                    onClick={() => toggleFileExpansion(file.file_name)}
                    clickable
                  />
                )}
              </Box>
            </Box>
            
            {fileLocations.length > 0 && (
              <IconButton
                size="small"
                onClick={() => toggleFileExpansion(file.file_name)}
                sx={{ 
                  ml: 1,
                  color: theme.palette.primary.main,
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  }
                }}
              >
                {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
              </IconButton>
            )}
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
            <Grid item xs={12} sm={6} md={3}>
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

            <Grid item xs={12} sm={6} md={3}>
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

            <Grid item xs={12} sm={6} md={3}>
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
                    {getTotalLocationsFromFiles()}
                  </Typography>
                </Box>
              </MetricCard>
            </Grid>

            {/* Total Sales Card */}
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
                      fontSize: "1.5rem",
                    }}
                  >
                    {formatCurrency(getTotalSalesFromFiles())}
                  </Typography>
                </Box>
              </MetricCard>
            </Grid>
          </Grid>
        </StyledCard>
      </Container>

      {/* Content Cards */}
      <Container maxWidth="xl">
        <Grid container spacing={3}>
          {/* Files Section */}
          <Grid item xs={12}>
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
                      Manage and delete your data files with location breakdown
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
                <Box sx={{ maxHeight: 600, overflowY: "auto" }}>
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
                          <>
                            {sortedFiles.map((file, index) => (
                              <React.Fragment key={index}>
                                <TableRow
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
                                  <TableCell sx={{ maxWidth: 200 }}>
                                    <Box
                                      sx={{ display: "flex", alignItems: "center" }}
                                    >
                                      <Box
                                        sx={{
                                          width: 32,
                                          height: 32,
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
                                            fontSize: 16,
                                          }}
                                        />
                                      </Box>
                                      <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            fontWeight: 500,
                                            fontFamily: "monospace",
                                            fontSize: "0.8rem",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                          }}
                                          title={file.file_name}
                                        >
                                          {file.file_name}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </TableCell>
                                  {renderFileData(file)}
                                  <TableCell align="center" sx={{ width: 120 }}>
                                    <Button
                                      variant="outlined"
                                      color="error"
                                      size="small"
                                      startIcon={<DeleteIcon sx={{ fontSize: 16 }} />}
                                      onClick={() =>
                                        handleDeleteClick(
                                          file.file_name,
                                          file.company_name,
                                          file[currentDataType.locationsField]
                                        )
                                      }
                                      sx={{
                                        textTransform: "none",
                                        borderRadius: 2,
                                        px: 1.5,
                                        py: 0.5,
                                        fontSize: "0.75rem",
                                        minWidth: "auto",
                                      }}
                                    >
                                      Delete
                                    </Button>
                                  </TableCell>
                                </TableRow>
                                
                                {/* Expanded location details */}
                                <TableRow>
                                  <TableCell
                                    colSpan={7}
                                    sx={{ py: 0, border: 0 }}
                                  >
                                    <Collapse
                                      in={expandedFiles.has(file.file_name)}
                                      timeout="auto"
                                      unmountOnExit
                                    >
                                      <Box sx={{ py: 2, pl: 4, pr: 2 }}>
                                        <Typography
                                          variant="subtitle2"
                                          sx={{ mb: 2, fontWeight: 600, fontSize: "0.875rem" }}
                                        >
                                          {currentDataType.key === "salespmix" ? "Location" : "Store"} Details:
                                        </Typography>
                                        <Grid container spacing={1.5}>
                                          {(file[currentDataType.locationsField] || []).map((location, locIndex) => (
                                            <Grid item xs={12} sm={6} md={4} lg={3} key={locIndex}>
                                              <Paper
                                                elevation={0}
                                                sx={{
                                                  p: 2,
                                                  border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                                                  borderRadius: 2,
                                                  position: "relative",
                                                  transition: "all 0.2s ease",
                                                  "&:hover": {
                                                    borderColor: alpha(currentDataType.color, 0.3),
                                                    backgroundColor: alpha(currentDataType.color, 0.02),
                                                  },
                                                }}
                                              >
                                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                                                  <Typography
                                                    variant="subtitle2"
                                                    sx={{
                                                      fontWeight: 600,
                                                      textTransform: "capitalize",
                                                      fontSize: "0.8rem",
                                                      color: currentDataType.color,
                                                    }}
                                                  >
                                                    {location[currentDataType.locationKey]}
                                                  </Typography>
                                                  <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() =>
                                                      handleLocationDeleteClick(
                                                        file.file_name,
                                                        file.company_name,
                                                        location[currentDataType.locationKey]
                                                      )
                                                    }
                                                    sx={{
                                                      p: 0.25,
                                                      "&:hover": {
                                                        backgroundColor: alpha(theme.palette.error.main, 0.1),
                                                      },
                                                    }}
                                                  >
                                                    <DeleteIcon sx={{ fontSize: 14 }} />
                                                  </IconButton>
                                                </Box>
                                                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                                                    Records: <strong>{location.record_count?.toLocaleString() || "N/A"}</strong>
                                                  </Typography>
                                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                                                    Sales: <strong>{formatCurrency(location.total_sales)}</strong>
                                                  </Typography>
                                                  {currentDataType.key === "salespmix" ? (
                                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                                                      Period: <strong>{formatDate(location.earliest_date)} - {formatDate(location.latest_date)}</strong>
                                                    </Typography>
                                                  ) : (
                                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                                                      Years: <strong>{location.earliest_year} - {location.latest_year}</strong>
                                                    </Typography>
                                                  )}
                                                </Box>
                                              </Paper>
                                            </Grid>
                                          ))}
                                        </Grid>
                                      </Box>
                                    </Collapse>
                                  </TableCell>
                                </TableRow>
                              </React.Fragment>
                            ))}
                          </>
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={7}
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
              Confirm {deleteDialog.selectedLocation ? "Location" : "File"} Deletion
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This action cannot be undone
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to delete this {deleteDialog.selectedLocation ? "location" : "file"}?
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
              {deleteDialog.selectedLocation ? (
                <>
                  <strong>Location:</strong> {deleteDialog.selectedLocation}<br />
                  <strong>File:</strong> {deleteDialog.fileName}<br />
                  <strong>Company:</strong> {deleteDialog.companyName}
                </>
              ) : (
                deleteDialog.fileName
              )}
            </Typography>
          </Box>

          {!deleteDialog.selectedLocation && deleteDialog.availableLocations.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Or delete a specific {currentDataType.key === "salespmix" ? "location" : "store"}:
              </Typography>
              <FormControl fullWidth size="small">
                <InputLabel>Select {currentDataType.key === "salespmix" ? "Location" : "Store"}</InputLabel>
                <Select
                  value={deleteDialog.selectedLocation}
                  label={`Select ${currentDataType.key === "salespmix" ? "Location" : "Store"}`}
                  onChange={(e) => setDeleteDialog(prev => ({ ...prev, selectedLocation: e.target.value }))}
                >
                  <MenuItem value="">
                    <em>Delete entire file</em>
                  </MenuItem>
                  {deleteDialog.availableLocations.map((location, index) => (
                    <MenuItem key={index} value={location.name}>
                      {location.name} ({location.record_count} records, {formatCurrency(location.total_sales)})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}

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
              {deleteDialog.selectedLocation 
                ? `This location will be permanently deleted from the file and cannot be recovered.`
                : `This file will be permanently deleted and cannot be recovered.`
              }
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
            Delete {deleteDialog.selectedLocation ? "Location" : "File"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FileManagementPage;
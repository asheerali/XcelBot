// Updated FileManagementPage.jsx - Replace fetch calls with apiClient

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
import apiClient from "../api/axiosConfig"; // ✅ Already imported
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

// Styled components (keeping all existing styled components unchanged)
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

  // ✅ UPDATED: Convert endpoints to use relative paths for apiClient
  const dataTypes = [
    {
      name: "PMix Sales",
      key: "salespmix",
      icon: TrendingUpIcon,
      color: theme.palette.primary.main,
      gradient: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
      bgGradient: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
      fileListEndpoint: "/salespmix/analytics/file-list", // ✅ Relative path for apiClient
      deleteEndpoint: "/salespmix/bulk/by-filename", // ✅ Relative path for apiClient
      locationsEndpoint: "/salespmix/analytics/locations", // ✅ Relative path for apiClient
      locationKey: "location",
    },
    {
      name: "Financials Companywide",
      key: "financialscompanywide",
      icon: AttachMoneyIcon,
      color: theme.palette.success.main,
      gradient: "linear-gradient(135deg, #388e3c 0%, #2e7d32 100%)",
      bgGradient: "linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)",
      fileListEndpoint: "/financialscompanywide/analytics/file-list", // ✅ Relative path
      deleteEndpoint: "/financialscompanywide/bulk/by-filename", // ✅ Relative path
      locationsEndpoint: "/financialscompanywide/analytics/stores", // ✅ Relative path
      locationKey: "store",
    },
    {
      name: "Budget",
      key: "budget",
      icon: AssessmentIcon,
      color: theme.palette.warning.main,
      gradient: "linear-gradient(135deg, #f57c00 0%, #ef6c00 100%)",
      bgGradient: "linear-gradient(135deg, #fff3e0 0%, #ffcc02 100%)",
      fileListEndpoint: "/budget/analytics/file-list", // ✅ Relative path
      deleteEndpoint: "/budget/bulk/by-filename", // ✅ Relative path
      locationsEndpoint: "/budget/analytics/stores", // ✅ Relative path
      locationKey: "store",
    },
  ];

  const currentDataType = dataTypes[activeTab];

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // Load data immediately when component mounts
  useEffect(() => {
    fetchData();
  }, []);

  // ✅ MAIN CHANGE: Replace fetch calls with apiClient
  const fetchData = async () => {
    setLoading(true);
    try {
      console.log("🔄 Fetching data for:", currentDataType.name);

      // ✅ UPDATED: Use apiClient instead of fetch for files
      console.log("📂 Fetching files from:", currentDataType.fileListEndpoint);
      const filesResponse = await apiClient.get(
        currentDataType.fileListEndpoint
      );
      const filesData = filesResponse.data;

      console.log("📥 Files response:", filesData);
      setFiles(filesData);

      // ✅ UPDATED: Use apiClient instead of fetch for locations
      console.log(
        "📍 Fetching locations from:",
        currentDataType.locationsEndpoint
      );
      const locationsResponse = await apiClient.get(
        currentDataType.locationsEndpoint
      );
      const locationsData = locationsResponse.data;

      console.log("📥 Locations response:", locationsData);
      setLocations(locationsData);
    } catch (error) {
      console.error("❌ Error fetching data:", error);

      // ✅ IMPROVED: Better error handling for axios
      let errorMessage = "Error fetching data";
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = "Authentication failed. Please log in again.";
          // Auth interceptor will handle redirect to login
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

  // ✅ DELETE FUNCTION: Already using apiClient correctly
  const handleDeleteConfirm = async () => {
    try {
      console.log("🗑️ Deleting file:", deleteDialog.fileName);

      const response = await apiClient.delete(currentDataType.deleteEndpoint, {
        params: {
          file_name: deleteDialog.fileName,
          confirm: true, // must be set to avoid HTTP 400
        },
      });

      console.log("✅ File deleted successfully:", response.data);
      showAlert(
        `File "${deleteDialog.fileName}" deleted successfully`,
        "success"
      );
      fetchData(); // Refresh the data
    } catch (error) {
      console.error("❌ Error deleting file:", error);

      // ✅ IMPROVED: Better error handling for delete
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

  // Rest of your component methods remain unchanged...
  const renderFileColumns = () => {
    if (currentDataType.key === "salespmix") {
      return (
        <>
          <TableCell
            sx={{ fontWeight: 600, color: theme.palette.text.secondary }}
          >
            Records
          </TableCell>
          <TableCell
            sx={{ fontWeight: 600, color: theme.palette.text.secondary }}
          >
            Date Range
          </TableCell>
        </>
      );
    } else {
      return (
        <>
          <TableCell
            sx={{ fontWeight: 600, color: theme.palette.text.secondary }}
          >
            Records
          </TableCell>
          <TableCell
            sx={{ fontWeight: 600, color: theme.palette.text.secondary }}
          >
            Year Range
          </TableCell>
        </>
      );
    }
  };

  const renderFileData = (file) => {
    if (currentDataType.key === "salespmix") {
      return (
        <>
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
                {file.record_count.toLocaleString()}
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
                {formatDate(file.earliest_date)} -{" "}
                {formatDate(file.latest_date)}
              </Typography>
            </Box>
          </TableCell>
        </>
      );
    } else {
      return (
        <>
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
                {file.record_count.toLocaleString()}
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
                {file.earliest_year} - {file.latest_year}
              </Typography>
            </Box>
          </TableCell>
        </>
      );
    }
  };

  // Rest of your JSX return remains exactly the same...
  if (loading && files.length === 0) {
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

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #fafafa 0%, #ffffff 100%)",
      }}
    >
      {/* Rest of your JSX remains unchanged - only the API calls were modified */}
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

      {/* Main Content - Rest of JSX unchanged */}
      {/* ... Rest of your existing JSX ... */}

      {/* Enhanced Delete Confirmation Dialog - Unchanged */}
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

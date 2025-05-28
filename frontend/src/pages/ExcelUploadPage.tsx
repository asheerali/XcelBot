// src/pages/ExcelUploadPage.tsx - Updated with multiple location selection and reduced drag/drop height

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormHelperText,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Autocomplete,
  LinearProgress,
  Container,
  Stack,
  Avatar,
  Fade,
  Grow,
  useTheme,
  alpha,
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Icons
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import DescriptionIcon from "@mui/icons-material/Description";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import DeleteIcon from "@mui/icons-material/Delete";
import FileOpenIcon from "@mui/icons-material/FileOpen";
import EditIcon from "@mui/icons-material/Edit";
import PlaceIcon from "@mui/icons-material/Place";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import CategoryIcon from "@mui/icons-material/Category";
import GridViewIcon from "@mui/icons-material/GridView";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AssessmentIcon from "@mui/icons-material/Assessment";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import BusinessIcon from "@mui/icons-material/Business";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import LocationOnIcon from "@mui/icons-material/LocationOn";

// Import Redux hooks
import { useAppDispatch } from "../typedHooks";
import {
  setExcelFile,
  setLoading,
  setError,
  setTableData,
  addFileData,
  setLocations,
  selectLocation,
  addFinancialData,
  addSalesData,
  addSalesWideData,
  addProductMixData,
} from "../store/excelSlice";
import { API_URL_Local } from "../constants";

// API URL for Excel upload
const API_URL = API_URL_Local + "/api/excel/upload";

// Animation keyframes
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

// Styled components
const PageContainer = styled(Container)(({ theme }) => ({
  minHeight: "100vh",
  background: `linear-gradient(135deg, 
    ${alpha(theme.palette.grey[50], 0.3)} 0%, 
    ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

const HeaderCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, 
    ${theme.palette.primary.main}20 0%, 
    ${theme.palette.secondary.main}15 50%, 
    ${theme.palette.primary.light}10 100%)`,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(4),
  borderRadius: theme.spacing(3),
  overflow: "hidden",
  position: "relative",
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow: "none",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("data:image/svg+xml,")',
    backgroundSize: "100px 100px",
    pointerEvents: "none",
  },
}));

const DashboardCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== "selected",
})<{ selected?: boolean }>(({ theme, selected }) => ({
  height: "80%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  cursor: "pointer",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "relative",
  overflow: "hidden",
  border: selected
    ? `3px solid ${theme.palette.primary.main}`
    : `1px solid ${theme.palette.divider}`,
  background: selected
    ? `linear-gradient(135deg, ${alpha(
        theme.palette.primary.main,
        0.1
      )} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`
    : theme.palette.background.paper,
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.15)}`,
  },
  "&::before": selected
    ? {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "4px",
        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
      }
    : {},
}));

const DashboardIconAvatar = styled(Avatar)(({ theme }) => ({
  width: 60,
  height: 60,
  marginBottom: theme.spacing(1.5),
  background: `linear-gradient(135deg, ${alpha(
    theme.palette.primary.main,
    0.1
  )} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
  border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
}));

// UPDATED: Reduced height of the drag and drop area
const ModernDropZone = styled(Paper)(({ theme }) => ({
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: theme.spacing(2),
  padding: theme.spacing(4), // REDUCED from theme.spacing(8) to theme.spacing(4)
  textAlign: "center",
  cursor: "pointer",
  transition: "all 0.3s ease",
  background: `linear-gradient(135deg, ${alpha(
    theme.palette.primary.main,
    0.02
  )} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
  "&:hover": {
    borderColor: theme.palette.primary.dark,
    background: `linear-gradient(135deg, ${alpha(
      theme.palette.primary.main,
      0.05
    )} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
    transform: "translateY(-2px)",
  },
}));

const DashboardSelectionCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  background: `linear-gradient(145deg, 
    ${theme.palette.background.paper} 0%, 
    ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  backdropFilter: "blur(10px)",
}));

const FileCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(2),
  background: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: theme.shadows[4],
    transform: "translateY(-2px)",
  },
}));

const ProcessButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  padding: theme.spacing(1.5, 4),
  fontWeight: 600,
  fontSize: "1rem",
  textTransform: "none",
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  "&:hover": {
    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
    transform: "translateY(-2px)",
  },
}));

const SelectedBadge = styled(Chip)(({ theme }) => ({
  position: "absolute",
  top: theme.spacing(1),
  right: theme.spacing(1),
  background: theme.palette.primary.main,
  color: "white",
  fontWeight: 600,
  fontSize: "0.75rem",
}));

// Dashboard options with modern icons and colors - UPDATED with combination cards
const DASHBOARD_OPTIONS = [
  {
    value: "Sales Split and Product Mix",
    label: "Sales Split & Product Mix",
    icon: <AnalyticsIcon />,
    description: " ",
    color: "#e91e63",
    height: "150px",
  },
  {
    value: "Financials and Sales Wide",
    label: "Financials & Sales Wide",
    icon: <AssessmentIcon />,
    description: " ",
    color: "#00bcd4",
    height: "150px",
  },
  {
    value: "Sales Split",
    label: "Sales Split",
    icon: <GridViewIcon />,
    description: "",
    color: "#4285f4",
    height: "150px",
  },
  {
    value: "Product Mix",
    label: "Product Mix",
    icon: <RestaurantIcon />,
    description: "",
    color: "#689f38",
    height: "150px",
  },
  {
    value: "Financials",
    label: "Financials",
    icon: <AttachMoneyIcon />,
    description: "",
    color: "#9c27b0",
    height: "150px",
  },
  {
    value: "Sales Wide",
    label: "Companywide Sales",
    icon: <TrendingUpIcon />,
    description: "",
    color: "#f57c00",
    height: "150px",
  },
];

// List of popular US cities
const US_CITIES = [
  "Multiple Locations",
  "Midtown East",
  "Lenox Hill",
  "Hell's Kitchen",
  "Union Square",
  "Flatiron",
  "Williamsburg",
  "New York",
  "Los Angeles",
  "Chicago",
  "Houston",
  "Phoenix",
  "Philadelphia",
  "San Antonio",
  "San Diego",
  "Dallas",
];

// File status type
type FileStatus = "pending" | "uploading" | "success" | "error";

// File info type with location and dashboard
interface FileInfo {
  file: File;
  status: FileStatus;
  error?: string;
  progress: number;
  locations: string[]; // UPDATED: Changed from single location to multiple locations
  dashboard: string;
  data?: any;
  categories?: string[];
}

// Helper function to extract categories from response data
const extractCategoriesFromData = (data: any): string[] => {
  let categories: string[] = [];

  try {
    if (Array.isArray(data)) {
      data.forEach((dashboardData, index) => {
        const dashboardCategories =
          extractCategoriesFromSingleDashboard(dashboardData);
        categories = [...new Set([...categories, ...dashboardCategories])];
      });
    } else {
      categories = extractCategoriesFromSingleDashboard(data);
    }

    return categories;
  } catch (error) {
    console.error("❌ Error extracting categories:", error);
    return [];
  }
};

const extractCategoriesFromSingleDashboard = (dashboardData: any): string[] => {
  let categories: string[] = [];

  try {
    if (dashboardData.Categories && Array.isArray(dashboardData.Categories)) {
      categories = [...categories, ...dashboardData.Categories];
    }

    if (dashboardData.categories && Array.isArray(dashboardData.categories)) {
      categories = [...categories, ...dashboardData.categories];
    }

    if (
      categories.length === 0 &&
      dashboardData.table1 &&
      Array.isArray(dashboardData.table1) &&
      dashboardData.table1.length > 0
    ) {
      const firstRow = dashboardData.table1[0];
      if (typeof firstRow === "object" && firstRow !== null) {
        const tableKeys = Object.keys(firstRow);
        const filteredTableKeys = tableKeys.filter((key) => {
          const keyLower = key.toLowerCase();
          const excludePatterns = [
            "week",
            "date",
            "time",
            "id",
            "index",
            "total",
            "grand",
            "sum",
            "count",
            "avg",
            "average",
            "min",
            "max",
            "store",
            "location",
            "file",
            "upload",
            "dashboard",
            "data",
          ];
          return !excludePatterns.some((pattern) => keyLower.includes(pattern));
        });
        categories = [...categories, ...filteredTableKeys];
      }
    }

    const finalCategories = [...new Set(categories)].filter(
      (cat) => cat && typeof cat === "string" && cat.trim() !== ""
    );

    return finalCategories;
  } catch (error) {
    return [];
  }
};

const ExcelUploadPage: React.FC = () => {
  const theme = useTheme();
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [currentEditingIndex, setCurrentEditingIndex] = useState<number | null>(
    null
  );
  const [locationInput, setLocationInput] = useState<string[]>([]); // UPDATED: Changed to array
  const [locationError, setLocationError] = useState("");
  const [selectedDashboard, setSelectedDashboard] = useState("Financials");

  // UPDATED: Changed to multiple locations
  const [selectedLocations, setSelectedLocations] = useState<string[]>([
    "Midtown East",
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // UPDATED: Handle multiple location changes
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const droppedFiles = Array.from(e.dataTransfer.files);
        const excelFiles = droppedFiles.filter(
          (file) => file.name.endsWith(".xlsx") || file.name.endsWith(".xls")
        );

        if (excelFiles.length === 0) {
          setGeneralError("Please upload only Excel files (.xlsx or .xls)");
          return;
        }

        const newFiles = excelFiles.map((file) => ({
          file,
          status: "pending" as FileStatus,
          progress: 0,
          locations: selectedLocations.length > 0 ? [...selectedLocations] : [], // UPDATED: Use selected locations
          dashboard: selectedDashboard,
        }));

        setFiles((prevFiles) => [...prevFiles, ...newFiles]);
        setGeneralError(null);

        // Show location dialog if no locations selected
        if (selectedLocations.length === 0 && newFiles.length > 0) {
          setCurrentEditingIndex(files.length);
          setLocationInput([]);
          setLocationError("");
          setIsLocationDialogOpen(true);
        }
      }
    },
    [files.length, selectedLocations, selectedDashboard] // UPDATED: Use selectedLocations
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  // UPDATED: Handle file change with multiple locations
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const selectedFiles = Array.from(e.target.files);
        const excelFiles = selectedFiles.filter(
          (file) => file.name.endsWith(".xlsx") || file.name.endsWith(".xls")
        );

        if (excelFiles.length === 0) {
          setGeneralError("Please upload only Excel files (.xlsx or .xls)");
          return;
        }

        const newFiles = excelFiles.map((file) => ({
          file,
          status: "pending" as FileStatus,
          progress: 0,
          locations: selectedLocations.length > 0 ? [...selectedLocations] : [], // UPDATED: Use selected locations
          dashboard: selectedDashboard,
        }));

        setFiles((prevFiles) => [...prevFiles, ...newFiles]);
        setGeneralError(null);

        // Show location dialog if no locations selected
        if (selectedLocations.length === 0 && newFiles.length > 0) {
          setCurrentEditingIndex(files.length);
          setLocationInput([]);
          setLocationError("");
          setIsLocationDialogOpen(true);
        }

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [files.length, selectedLocations, selectedDashboard] // UPDATED: Use selectedLocations
  );

  const handleDashboardChange = (dashboardType: string) => {
    setSelectedDashboard(dashboardType);
  };

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // UPDATED: Upload file for each location
  const uploadFile = async (fileInfo: FileInfo, index: number) => {
    if (!fileInfo.locations || fileInfo.locations.length === 0) {
      setFiles((prevFiles) => {
        const updatedFiles = [...prevFiles];
        updatedFiles[index] = {
          ...updatedFiles[index],
          status: "error",
          error: "At least one location is required",
          progress: 0,
        };
        return updatedFiles;
      });
      return false;
    }

    try {
      setFiles((prevFiles) => {
        const updatedFiles = [...prevFiles];
        updatedFiles[index] = {
          ...updatedFiles[index],
          status: "uploading",
          progress: 0,
        };
        return updatedFiles;
      });

      const base64File = await toBase64(fileInfo.file);
      const base64Content = base64File.split(",")[1];

      // Upload file for each selected location
      const uploadPromises = fileInfo.locations.map(async (location) => {
        dispatch(
          setExcelFile({
            fileName: fileInfo.file.name,
            fileContent: base64Content,
            location: location,
          })
        );

        return axios.post(API_URL, {
          fileName: fileInfo.file.name,
          fileContent: base64Content,
          location: location,
          dashboard: fileInfo.dashboard,
        });
      });

      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 10;
        if (progress <= 90) {
          setFiles((prevFiles) => {
            const updatedFiles = [...prevFiles];
            updatedFiles[index] = {
              ...updatedFiles[index],
              progress,
            };
            return updatedFiles;
          });
        } else {
          clearInterval(progressInterval);
        }
      }, 300);

      // Wait for all uploads to complete
      const responses = await Promise.all(uploadPromises);
      clearInterval(progressInterval);

      // Process responses for each location
      responses.forEach((response, locationIndex) => {
        const location = fileInfo.locations[locationIndex];

        if (response.data) {
          console.log(
            `📨 Received response data for ${location}:`,
            response.data
          );

          const extractedCategories = extractCategoriesFromData(response.data);
          console.log("🏷️ Extracted categories:", extractedCategories);

          if (Array.isArray(response.data)) {
            response.data.forEach((dashboardData) => {
              const dashboardName = dashboardData.dashboardName?.trim();
              const enhancedDashboardData = {
                ...dashboardData,
                categories: extractedCategories,
              };

              // Dispatch to appropriate store based on dashboard type
              if (dashboardName === "Sales Split") {
                dispatch(
                  addSalesData({
                    fileName: fileInfo.file.name,
                    fileContent: base64Content,
                    location: location,
                    data: enhancedDashboardData,
                  })
                );

                dispatch(
                  addFileData({
                    fileName: fileInfo.file.name,
                    fileContent: base64Content,
                    location: location,
                    data: enhancedDashboardData,
                  })
                );
              } else if (dashboardName === "Product Mix") {
                dispatch(
                  addProductMixData({
                    fileName: fileInfo.file.name,
                    fileContent: base64Content,
                    location: location,
                    data: enhancedDashboardData,
                  })
                );
              } else if (dashboardName === "Financials") {
                dispatch(
                  addFinancialData({
                    fileName: fileInfo.file.name,
                    fileContent: base64Content,
                    location: location,
                    data: enhancedDashboardData,
                  })
                );
              } else if (dashboardName === "Sales Wide") {
                dispatch(
                  addSalesWideData({
                    fileName: fileInfo.file.name,
                    fileContent: base64Content,
                    location: location,
                    data: enhancedDashboardData,
                  })
                );
              }
            });
          } else {
            const dashboardName =
              response.data.dashboardName?.trim() || fileInfo.dashboard;
            const enhancedDashboardData = {
              ...response.data,
              categories: extractedCategories,
            };

            // Dispatch to appropriate store based on dashboard type
            if (dashboardName === "Financials") {
              dispatch(
                addFinancialData({
                  fileName: fileInfo.file.name,
                  fileContent: base64Content,
                  location: location,
                  data: enhancedDashboardData,
                })
              );
            } else if (dashboardName === "Sales Split") {
              dispatch(
                addSalesData({
                  fileName: fileInfo.file.name,
                  fileContent: base64Content,
                  location: location,
                  data: enhancedDashboardData,
                })
              );

              dispatch(
                addFileData({
                  fileName: fileInfo.file.name,
                  fileContent: base64Content,
                  location: location,
                  data: enhancedDashboardData,
                })
              );
            } else if (dashboardName === "Sales Wide") {
              dispatch(
                addSalesWideData({
                  fileName: fileInfo.file.name,
                  fileContent: base64Content,
                  location: location,
                  data: enhancedDashboardData,
                })
              );
            } else if (dashboardName === "Product Mix") {
              dispatch(
                addProductMixData({
                  fileName: fileInfo.file.name,
                  fileContent: base64Content,
                  location: location,
                  data: enhancedDashboardData,
                })
              );
            }
          }

          // Update locations in Redux
          dispatch(setLocations([location]));
          dispatch(selectLocation(location));
        }
      });

      setFiles((prevFiles) => {
        const updatedFiles = [...prevFiles];
        updatedFiles[index] = {
          ...updatedFiles[index],
          status: "success",
          progress: 100,
          data: responses[0].data, // Use first response for display
          categories: extractCategoriesFromData(responses[0].data),
        };
        return updatedFiles;
      });

      console.log("✅ File upload completed successfully for all locations");
      return true;
    } catch (err) {
      console.error("Upload error:", err);

      let errorMessage = "Error processing file";

      if (axios.isAxiosError(err)) {
        if (err.response) {
          const detail = err.response.data?.detail;
          errorMessage = `Server error: ${detail || err.response.status}`;
        } else if (err.request) {
          errorMessage =
            "No response from server. Please check if the backend is running.";
        }
      } else if (err instanceof Error) {
        errorMessage = `Error: ${err.message}`;
      }

      setFiles((prevFiles) => {
        const updatedFiles = [...prevFiles];
        updatedFiles[index] = {
          ...updatedFiles[index],
          status: "error",
          error: errorMessage,
          progress: 0,
        };
        return updatedFiles;
      });

      return false;
    }
  };

  const uploadAllFiles = async () => {
    const pendingFiles = files.filter(
      (file) => file.status === "pending" && file.locations.length > 0
    );

    if (pendingFiles.length === 0) {
      setGeneralError(
        "No files ready for upload. Please add locations to files."
      );
      return;
    }

    for (let i = 0; i < files.length; i++) {
      if (files[i].status === "pending" && files[i].locations.length > 0) {
        await uploadFile(files[i], i);
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const editFileLocation = (index: number) => {
    setCurrentEditingIndex(index);
    setLocationInput([...files[index].locations]); // UPDATED: Set array of locations
    setLocationError("");
    setIsLocationDialogOpen(true);
  };

  // UPDATED: Handle multiple location save with exclusion logic
  const handleLocationSave = () => {
    if (!locationInput || locationInput.length === 0) {
      setLocationError("At least one location is required");
      return;
    }

    let finalLocations = [...locationInput];

    // Apply the same exclusion logic
    if (locationInput.includes("Multiple Locations")) {
      finalLocations = ["Multiple Locations"];
    } else {
      finalLocations = locationInput.filter(
        (location) => location !== "Multiple Locations"
      );
    }

    if (currentEditingIndex !== null) {
      setFiles((prevFiles) => {
        const updatedFiles = [...prevFiles];
        updatedFiles[currentEditingIndex] = {
          ...updatedFiles[currentEditingIndex],
          locations: finalLocations,
        };
        return updatedFiles;
      });
    }

    setIsLocationDialogOpen(false);
    setCurrentEditingIndex(null);
    setLocationInput([]);
    setLocationError("");
  };

  const handleLocationCancel = () => {
    setIsLocationDialogOpen(false);
    setCurrentEditingIndex(null);
    setLocationInput([]);
    setLocationError("");
  };

  // UPDATED: Handle multiple location changes with exclusion logic
  const handleLocationsChange = (event: any, newValue: string[]) => {
    let filteredValue = [...newValue];

    // If "Multiple Locations" is selected, remove all other locations
    if (newValue.includes("Multiple Locations")) {
      filteredValue = ["Multiple Locations"];
    } else {
      // If any other location is selected, remove "Multiple Locations"
      filteredValue = newValue.filter(
        (location) => location !== "Multiple Locations"
      );
    }

    setSelectedLocations(filteredValue);

    // Update all pending files with new locations
    setFiles((prevFiles) =>
      prevFiles.map((file) =>
        file.status === "pending"
          ? { ...file, locations: [...filteredValue] }
          : file
      )
    );
  };

  const getStatusIcon = (status: FileStatus) => {
    switch (status) {
      case "success":
        return <CheckCircleIcon color="success" />;
      case "error":
        return <ErrorIcon color="error" />;
      case "uploading":
        return <CircularProgress size={24} />;
      default:
        return <DescriptionIcon color="action" />;
    }
  };

  const getStatusColor = (status: FileStatus) => {
    switch (status) {
      case "success":
        return "success";
      case "error":
        return "error";
      case "uploading":
        return "info";
      default:
        return "default";
    }
  };

  const viewDashboard = (fileInfo: FileInfo) => {
    if (fileInfo.data && fileInfo.status === "success") {
      const dashboardName = fileInfo.data.dashboardName || fileInfo.dashboard;

      switch (dashboardName) {
        case "Financials":
          navigate("/Financials");
          break;
        case "Sales Split":
          navigate("/manage-reports");
          break;
        case "Sales Wide":
          navigate("/Saleswide");
          break;
        case "Product Mix":
          navigate("/Productmix");
          break;
        default:
          navigate("/dashboard");
      }
    }
  };

  return (
    <PageContainer maxWidth="lg">
      {/* Modern Header */}
      <Fade in timeout={800}>
        <HeaderCard>
          <CardContent sx={{ p: 2.5, position: "relative", zIndex: 1 }}>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 700,
                mb: 2,
                color: "text.primary",
                textAlign: "center",
              }}
            >
              Choose Your Dashboard Type
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "text.secondary",
                fontWeight: 400,
                lineHeight: 1.6,
                textAlign: "center",
              }}
            >
              Select the dashboard type that best fits your data analysis needs
            </Typography>
          </CardContent>
        </HeaderCard>
      </Fade>

      {/* Dashboard Type Selection & Location Settings - Combined */}
      <Grow in timeout={1000}>
        <DashboardSelectionCard sx={{ mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            {/* Dashboard Selection */}
            <Typography
              variant="h5"
              sx={{ mb: 3, fontWeight: 600, color: "text.primary" }}
            >
              Dashboard & Location Settings
            </Typography>

            <Grid container spacing={3}>
              {DASHBOARD_OPTIONS.map((option, index) => (
                <Grid item xs={12} sm={2} md={2} key={option.value}>
                  <Fade in timeout={1200 + index * 200}>
                    <DashboardCard
                      selected={selectedDashboard === option.value}
                      onClick={() => handleDashboardChange(option.value)}
                      sx={{ height: option.height || "100%" }} // Apply height here
                    >
                      {selectedDashboard === option.value && (
                        <SelectedBadge label="Selected" />
                      )}

                      <DashboardIconAvatar
                        sx={{ bgcolor: alpha(option.color, 0.1) }}
                      >
                        <Box sx={{ color: option.color, fontSize: 24 }}>
                          {option.icon}
                        </Box>
                      </DashboardIconAvatar>

                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          mb: 0.5,
                          color:
                            selectedDashboard === option.value
                              ? "primary.main"
                              : "text.primary",
                        }}
                      >
                        {option.label}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ lineHeight: 1.3 }}
                      >
                        {option.description}
                      </Typography>
                    </DashboardCard>
                  </Fade>
                </Grid>
              ))}
            </Grid>

            {/* UPDATED: Multiple Location Settings */}
            <Box
              sx={{
                mt: 4,
                pt: 3,
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              }}
            >
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <LocationOnIcon sx={{ mr: 1, color: "text.secondary" }} />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontWeight: 500 }}
                    >
                      Default Locations (Multiple Selection - "Multiple
                      Locations" excludes others)
                    </Typography>
                  </Box>

                  {/* UPDATED: Multiple location selection with exclusion logic */}
                  <Autocomplete
                    multiple
                    value={selectedLocations}
                    onChange={handleLocationsChange}
                    options={US_CITIES}
                    freeSolo
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          variant="outlined"
                          label={option}
                          {...getTagProps({ index })}
                          sx={{ margin: "2px" }}
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Select or type locations"
                        variant="outlined"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            backgroundColor: "background.paper",
                          },
                        }}
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <>
                              <LocationCityIcon
                                sx={{ mr: 1, color: "primary.main" }}
                              />
                              {params.InputProps.startAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontStyle: "italic",
                      p: 2,
                      backgroundColor: alpha(theme.palette.info.main, 0.05),
                      borderRadius: 2,
                      border: `1px solid ${alpha(
                        theme.palette.info.main,
                        0.1
                      )}`,
                    }}
                  >
                    {selectedLocations.length === 0
                      ? "Select locations to apply to all new files automatically."
                      : selectedLocations.includes("Multiple Locations")
                      ? "Files will be processed for multiple locations. 'Multiple Locations' excludes other specific location selections."
                      : `New files will be processed for ${
                          selectedLocations.length
                        } location${
                          selectedLocations.length > 1 ? "s" : ""
                        }. You can modify individual files after upload.`}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </DashboardSelectionCard>
      </Grow>

      {/* UPDATED: File Upload Area with reduced height */}
      <Grow in timeout={1600}>
        <Card sx={{ mb: 4, borderRadius: 3, overflow: "hidden" }}>
          <CardContent sx={{ p: 0 }}>
            <ModernDropZone
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              sx={{
                borderColor: isDragging ? "primary.dark" : "primary.main",
                transform: isDragging ? "scale(1.02)" : "scale(1)",
                animation: isDragging ? `${pulse} 1s infinite` : "none",
              }}
            >
              <CloudUploadIcon
                sx={{
                  fontSize: 48, // REDUCED from 64 to 48
                  color: "primary.main",
                  mb: 1.5, // REDUCED from mb: 2 to mb: 1.5
                  animation: isDragging ? `${pulse} 0.5s infinite` : "none",
                }}
              />

              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                Drag & Drop Excel Files Here
              </Typography>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {" "}
                {/* REDUCED from mb: 3 to mb: 2 */}
                or click to browse files
              </Typography>

              <ProcessButton
                variant="contained"
                startIcon={<UploadFileIcon />}
                endIcon={<ArrowForwardIcon />}
                sx={{ mb: 1 }} // REDUCED from mb: 2 to mb: 1
              >
                Browse Files
              </ProcessButton>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                multiple
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </ModernDropZone>
          </CardContent>
        </Card>
      </Grow>

      {/* General Error Alert */}
      {generalError && (
        <Fade in>
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: 2,
              "& .MuiAlert-icon": { fontSize: 24 },
            }}
            onClose={() => setGeneralError(null)}
          >
            {generalError}
          </Alert>
        </Fade>
      )}

      {/* Files List */}
      {files.length > 0 && (
        <Grow in timeout={1800}>
          <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
            <CardContent sx={{ p: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Uploaded Files ({files.length})
                </Typography>

                <ProcessButton
                  variant="contained"
                  onClick={uploadAllFiles}
                  disabled={files.every(
                    (f) => f.status !== "pending" || f.locations.length === 0
                  )}
                  startIcon={<CloudUploadIcon />}
                  endIcon={<ArrowForwardIcon />}
                >
                  Process All Files
                </ProcessButton>
              </Box>

              <Stack spacing={2}>
                {files.map((fileInfo, index) => (
                  <Fade in timeout={300 + index * 100} key={index}>
                    <FileCard>
                      <CardContent sx={{ p: 3 }}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} md={8}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                                mb: 2,
                              }}
                            >
                              {getStatusIcon(fileInfo.status)}

                              <Box sx={{ flexGrow: 1 }}>
                                <Typography
                                  variant="h6"
                                  sx={{ fontWeight: 600, mb: 1 }}
                                >
                                  {fileInfo.file.name}
                                </Typography>

                                <Stack
                                  direction="row"
                                  spacing={1}
                                  sx={{ mb: 1 }}
                                >
                                  <Chip
                                    label={fileInfo.dashboard}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                    icon={<DashboardIcon />}
                                  />
                                  <Chip
                                    label={fileInfo.status}
                                    size="small"
                                    color={
                                      getStatusColor(fileInfo.status) as any
                                    }
                                  />
                                  {fileInfo.categories &&
                                    fileInfo.categories.length > 0 && (
                                      <Chip
                                        label={`${fileInfo.categories.length} categories`}
                                        size="small"
                                        color="info"
                                        variant="outlined"
                                        icon={<CategoryIcon />}
                                      />
                                    )}
                                </Stack>

                                {/* UPDATED: Display multiple locations */}
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    flexWrap: "wrap",
                                  }}
                                >
                                  <PlaceIcon fontSize="small" color="action" />
                                  {fileInfo.locations.length === 0 ? (
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      No locations set
                                    </Typography>
                                  ) : fileInfo.locations.length === 1 ? (
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      {fileInfo.locations[0]}
                                    </Typography>
                                  ) : (
                                    <>
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                      >
                                        {fileInfo.locations.length} locations:
                                      </Typography>
                                      <Box
                                        sx={{
                                          display: "flex",
                                          gap: 0.5,
                                          flexWrap: "wrap",
                                        }}
                                      >
                                        {fileInfo.locations
                                          .slice(0, 3)
                                          .map((location, locIndex) => (
                                            <Chip
                                              key={locIndex}
                                              label={location}
                                              size="small"
                                              variant="outlined"
                                              sx={{
                                                fontSize: "0.75rem",
                                                height: "20px",
                                              }}
                                            />
                                          ))}
                                        {fileInfo.locations.length > 3 && (
                                          <Chip
                                            label={`+${
                                              fileInfo.locations.length - 3
                                            } more`}
                                            size="small"
                                            variant="outlined"
                                            sx={{
                                              fontSize: "0.75rem",
                                              height: "20px",
                                            }}
                                          />
                                        )}
                                      </Box>
                                    </>
                                  )}
                                </Box>
                              </Box>
                            </Box>

                            {fileInfo.status === "uploading" && (
                              <Box sx={{ width: "100%", mt: 2 }}>
                                <Box
                                  sx={{ display: "flex", alignItems: "center" }}
                                >
                                  <Box sx={{ width: "100%", mr: 1 }}>
                                    <LinearProgress
                                      variant="determinate"
                                      value={fileInfo.progress}
                                      sx={{
                                        height: 8,
                                        borderRadius: 4,
                                        backgroundColor: alpha(
                                          theme.palette.primary.main,
                                          0.1
                                        ),
                                        "& .MuiLinearProgress-bar": {
                                          borderRadius: 4,
                                        },
                                      }}
                                    />
                                  </Box>
                                  <Box sx={{ minWidth: 35 }}>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      sx={{ fontWeight: 600 }}
                                    >
                                      {`${Math.round(fileInfo.progress)}%`}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>
                            )}

                            {fileInfo.error && (
                              <Alert
                                severity="error"
                                sx={{ mt: 2, borderRadius: 2 }}
                              >
                                {fileInfo.error}
                              </Alert>
                            )}
                          </Grid>

                          <Grid item xs={12} md={4}>
                            <Stack
                              direction="row"
                              spacing={1}
                              justifyContent="flex-end"
                            >
                              {fileInfo.status === "success" && (
                                <Button
                                  variant="contained"
                                  color="primary"
                                  onClick={() => viewDashboard(fileInfo)}
                                  startIcon={<FileOpenIcon />}
                                  sx={{ borderRadius: 2 }}
                                >
                                  View Dashboard
                                </Button>
                              )}

                              {fileInfo.status === "pending" && (
                                <Button
                                  variant="outlined"
                                  color="primary"
                                  onClick={() => editFileLocation(index)}
                                  startIcon={<EditIcon />}
                                  sx={{ borderRadius: 2 }}
                                >
                                  Edit Locations
                                </Button>
                              )}

                              <IconButton
                                color="error"
                                onClick={() => removeFile(index)}
                                sx={{
                                  borderRadius: 2,
                                  "&:hover": {
                                    backgroundColor: alpha(
                                      theme.palette.error.main,
                                      0.1
                                    ),
                                  },
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Stack>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </FileCard>
                  </Fade>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grow>
      )}

      {/* UPDATED: Location Dialog for multiple locations */}
      <Dialog
        open={isLocationDialogOpen}
        onClose={handleLocationCancel}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <LocationOnIcon color="primary" />
            Set File Locations
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Typography
            variant="body1"
            sx={{ mb: 3, color: "text.secondary", lineHeight: 1.6 }}
          >
            Please specify one or more locations for this file. Note: Selecting
            "Multiple Locations" will exclude other specific location choices.
          </Typography>

          {/* UPDATED: Multiple location selection in dialog with exclusion logic */}
          <Autocomplete
            multiple
            value={locationInput}
            onChange={(event, newValue) => {
              let filteredValue = [...newValue];

              // Apply exclusion logic: "Multiple Locations" excludes all others
              if (newValue.includes("Multiple Locations")) {
                filteredValue = ["Multiple Locations"];
              } else {
                filteredValue = newValue.filter(
                  (location) => location !== "Multiple Locations"
                );
              }

              setLocationInput(filteredValue);
              setLocationError("");
            }}
            options={US_CITIES}
            freeSolo
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={option}
                  {...getTagProps({ index })}
                  sx={{ margin: "2px" }}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Locations"
                placeholder="Select or type multiple locations"
                fullWidth
                margin="normal"
                error={!!locationError}
                helperText={
                  locationError ||
                  "Choose locations to help organize your data. 'Multiple Locations' excludes other selections."
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <LocationOnIcon sx={{ mr: 1, color: "primary.main" }} />
                      {params.InputProps.startAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={handleLocationCancel}
            sx={{ borderRadius: 2, px: 3 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleLocationSave}
            variant="contained"
            sx={{ borderRadius: 2, px: 3 }}
            startIcon={<CheckCircleIcon />}
          >
            Save Locations
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default ExcelUploadPage;

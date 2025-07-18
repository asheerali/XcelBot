// ExcelUploadPage.tsx - Updated with company-locations API and responsive location handling

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
  Menu,
  ListItemButton,
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Icons (keeping existing imports)
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
import StarIcon from "@mui/icons-material/Star";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import BarChartIcon from "@mui/icons-material/BarChart";
import PieChartIcon from "@mui/icons-material/PieChart";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LaunchIcon from "@mui/icons-material/Launch";

// Import Redux hooks
import { useAppDispatch } from "../typedHooks";
import { useSelector, useDispatch } from "react-redux";
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
import {
  setSelectedCompanies,
  setSelectedLocations,
  selectSelectedCompanies,
  selectSelectedLocations,
} from "../store/slices/masterFileSlice";
import { API_URL_Local } from "../constants";
import apiClient from "../api/axiosConfig";

// API URLs
const API_URL = API_URL_Local + "/api/excel/upload";
const COMPANY_LOCATIONS_API_URL = API_URL_Local + "/company-locations/all";

// UPDATED: Company interface based on new API structure
interface Company {
  company_id: number;
  company_name: string;
}

// Styled components (keeping existing ones)
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
}));

const CompanySelectionCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  borderRadius: theme.spacing(3),
  background: theme.palette.background.paper,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
}));

const ModernDashboardCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== "selected",
})<{ selected?: boolean }>(({ theme, selected }) => ({
  height: "160px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  padding: theme.spacing(2.5),
  borderRadius: theme.spacing(2.5),
  cursor: "pointer",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "relative",
  overflow: "hidden",
  border: selected
    ? `2px solid ${theme.palette.primary.main}`
    : `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  background: selected
    ? `linear-gradient(135deg, 
        ${alpha(theme.palette.primary.main, 0.08)} 0%, 
        ${alpha(theme.palette.background.paper, 0.95)} 100%)`
    : theme.palette.background.paper,
  boxShadow: selected
    ? `0 8px 32px ${alpha(theme.palette.primary.main, 0.15)}`
    : "0 2px 12px rgba(0, 0, 0, 0.04)",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
    border: `2px solid ${theme.palette.primary.main}`,
  },
}));

const ModernIconAvatar = styled(Avatar)(({ theme }) => ({
  width: 60,
  height: 60,
  marginBottom: theme.spacing(1.5),
  position: "relative",
  zIndex: 2,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)",
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
}));

const ModernDropZone = styled(Paper)(({ theme }) => ({
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: theme.spacing(2),
  padding: theme.spacing(4),
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
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: "white",
  fontWeight: 600,
  fontSize: "0.75rem",
  zIndex: 3,
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
}));

// Dashboard options (keeping existing)
const DASHBOARD_OPTIONS = [
  {
    value: "Sales Split and Product Mix",
    label: "Sales Split & Product Mix",
    icon: <AnalyticsIcon className="dashboard-icon" />,
    color: "#e91e63",
    gradient: "linear-gradient(135deg, #e91e63 0%, #f06292 100%)",
  },
  {
    value: "Financials and Sales Wide",
    label: "Financials & Companywide Sales",
    icon: <AssessmentIcon className="dashboard-icon" />,
    color: "#00bcd4",
    gradient: "linear-gradient(135deg, #00bcd4 0%, #4dd0e1 100%)",
  },
  {
    value: "Sales Split",
    label: "Sales Split",
    icon: <PieChartIcon className="dashboard-icon" />,
    color: "#4285f4",
    gradient: "linear-gradient(135deg, #4285f4 0%, #64b5f6 100%)",
  },
  {
    value: "Product Mix",
    label: "Product Mix",
    icon: <RestaurantIcon className="dashboard-icon" />,
    color: "#689f38",
    gradient: "linear-gradient(135deg, #689f38 0%, #8bc34a 100%)",
  },
  {
    value: "Financials",
    label: "Financials",
    icon: <AttachMoneyIcon className="dashboard-icon" />,
    color: "#9c27b0",
    gradient: "linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)",
  },
  {
    value: "Sales Wide",
    label: "Companywide Sales",
    icon: <ShowChartIcon className="dashboard-icon" />,
    color: "#f57c00",
    gradient: "linear-gradient(135deg, #f57c00 0%, #ffb74d 100%)",
  },
];

// File status type
type FileStatus = "pending" | "uploading" | "success" | "error";

// UPDATED: Enhanced FileInfo interface with multiple locations support
interface FileInfo {
  file: File;
  status: FileStatus;
  error?: string;
  progress: number;
  dashboard: string;
  data?: any;
  categories?: string[];
  extractedFileName?: string;
  // NEW: Support for multiple locations
  locations?: string[];
  primaryLocation?: string;
  allLocationsData?: Array<{
    location: string;
    data: any;
    categories?: string[];
  }>;
}

// UPDATED: Enhanced location extraction function
const extractLocationsFromResponse = (response: any): string[] => {
  console.log("🔍 Extracting locations from response:", response);

  let locations: string[] = [];

  try {
    // Handle array responses (multiple dashboards)
    if (Array.isArray(response)) {
      response.forEach((dashboardData) => {
        // Extract from fileLocation field
        if (dashboardData.fileLocation) {
          if (Array.isArray(dashboardData.fileLocation)) {
            locations = [...locations, ...dashboardData.fileLocation];
          } else {
            locations.push(dashboardData.fileLocation);
          }
        }

        // Extract from locations field
        if (dashboardData.locations && Array.isArray(dashboardData.locations)) {
          locations = [...locations, ...dashboardData.locations];
        }

        // Extract from fileName if no explicit location
        if (dashboardData.fileName && locations.length === 0) {
          const locationFromFileName = dashboardData.fileName.replace(
            /\.(xlsx|xls)$/i,
            ""
          );
          locations.push(locationFromFileName);
        }
      });
    } else {
      // Handle single object responses
      if (response.fileLocation) {
        if (Array.isArray(response.fileLocation)) {
          locations = [...locations, ...response.fileLocation];
        } else {
          locations.push(response.fileLocation);
        }
      }

      if (response.locations && Array.isArray(response.locations)) {
        locations = [...locations, ...response.locations];
      }

      // Fallback to fileName
      if (response.fileName && locations.length === 0) {
        const locationFromFileName = response.fileName.replace(
          /\.(xlsx|xls)$/i,
          ""
        );
        locations.push(locationFromFileName);
      }
    }

    // Remove duplicates and filter out empty strings
    const uniqueLocations = [...new Set(locations)].filter(
      (loc) => loc && typeof loc === "string" && loc.trim() !== ""
    );

    console.log("📍 Extracted unique locations:", uniqueLocations);
    return uniqueLocations;
  } catch (error) {
    console.error("❌ Error extracting locations:", error);
    return [];
  }
};

// UPDATED: Enhanced categories extraction with location awareness
const extractCategoriesFromData = (data: any, location?: string): string[] => {
  let categories: string[] = [];

  try {
    if (Array.isArray(data)) {
      data.forEach((dashboardData) => {
        const dashboardCategories =
          extractCategoriesFromSingleDashboard(dashboardData);
        categories = [...new Set([...categories, ...dashboardCategories])];
      });
    } else {
      categories = extractCategoriesFromSingleDashboard(data);
    }

    console.log(
      `🏷️ Extracted categories for location ${location}:`,
      categories
    );
    return categories;
  } catch (error) {
    console.error("❌ Error extracting categories:", error);
    return [];
  }
};

const extractCategoriesFromSingleDashboard = (dashboardData: any): string[] => {
  let categories: string[] = [];

  try {
    // Direct categories fields
    if (dashboardData.Categories && Array.isArray(dashboardData.Categories)) {
      categories = [...categories, ...dashboardData.Categories];
    }

    if (dashboardData.categories && Array.isArray(dashboardData.categories)) {
      categories = [...categories, ...dashboardData.categories];
    }

    // Extract from table data if no explicit categories
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

    return [...new Set(categories)].filter(
      (cat) => cat && typeof cat === "string" && cat.trim() !== ""
    );
  } catch (error) {
    return [];
  }
};

const ExcelUploadPage: React.FC = () => {
  const theme = useTheme();
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [selectedDashboard, setSelectedDashboard] = useState("Financials");

  // UPDATED: Redux state management for company selection
  const dispatch = useDispatch();
  const appDispatch = useAppDispatch();
  
  // Get current selections from Redux
  const selectedCompanies = useSelector(selectSelectedCompanies);
  const selectedLocations = useSelector(selectSelectedLocations);
  
  // Convert to single values for dropdowns
  const selectedCompanyId = selectedCompanies.length > 0 ? selectedCompanies[0] : '';
  
  // UPDATED: Company state management for API fetching
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [companiesError, setCompaniesError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // UPDATED: Fetch companies on component mount
  useEffect(() => {
    fetchCompanies();
  }, []);

  // UPDATED: Sync local selectedCompany with Redux state
  useEffect(() => {
    if (selectedCompanyId && companies.length > 0) {
      const company = companies.find(c => c.company_id.toString() === selectedCompanyId);
      if (company && company !== selectedCompany) {
        setSelectedCompany(company);
        console.log('🔄 Synced selectedCompany from Redux:', company);
      }
    } else if (!selectedCompanyId && selectedCompany) {
      setSelectedCompany(null);
      console.log('🔄 Cleared selectedCompany from Redux');
    }
  }, [selectedCompanyId, companies, selectedCompany]);

  // UPDATED: Fetch companies function using new API
  const fetchCompanies = async () => {
    try {
      setCompaniesLoading(true);
      setCompaniesError(null);

      console.log("🏢 Fetching companies and locations from:", COMPANY_LOCATIONS_API_URL);
      const response = await apiClient.get("/company-locations/all");

      if (response.data && Array.isArray(response.data)) {
        setCompanies(response.data);
        console.log("✅ Companies with locations fetched successfully:", response.data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("❌ Error fetching companies:", error);
      setCompaniesError("Failed to fetch companies and locations");
    } finally {
      setCompaniesLoading(false);
    }
  };

  // Existing event handlers (keeping them the same)
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
          dashboard: selectedDashboard,
        }));

        setFiles((prevFiles) => [...prevFiles, ...newFiles]);
        setGeneralError(null);
      }
    },
    [selectedDashboard]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

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
          dashboard: selectedDashboard,
        }));

        setFiles((prevFiles) => [...prevFiles, ...newFiles]);
        setGeneralError(null);

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [selectedDashboard]
  );

  const handleDashboardChange = (dashboardType: string) => {
    setSelectedDashboard(dashboardType);
  };

  // UPDATED: Company selection handler with Redux integration
  const handleCompanyChange = (event: any, newValue: Company | null) => {
    console.log("🏢 Company selection changed:", newValue);
    
    // Update local state
    setSelectedCompany(newValue);
    
    // Update Redux state
    if (newValue) {
      dispatch(setSelectedCompanies([newValue.company_id.toString()]));
      dispatch(setSelectedLocations([])); // Clear locations when company changes
      console.log('📦 Updated Redux: selectedCompanies =', [newValue.company_id.toString()]);
    } else {
      dispatch(setSelectedCompanies([]));
      dispatch(setSelectedLocations([]));
      console.log('📦 Cleared Redux: selectedCompanies and selectedLocations');
    }
  };

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // UPDATED: Enhanced upload function with company ID
  const uploadFile = async (fileInfo: FileInfo, index: number) => {
    // Check if company is selected
    if (!selectedCompany) {
      setFiles((prevFiles) => {
        const updatedFiles = [...prevFiles];
        updatedFiles[index] = {
          ...updatedFiles[index],
          status: "error",
          error: "Please select a company before uploading",
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

      dispatch(
        setExcelFile({
          fileName: fileInfo.file.name,
          fileContent: base64Content,
          company_id: selectedCompany.company_id.toString(),
        })
      );

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

      // UPDATED: Include company ID in upload payload
      const uploadPayload = {
        fileName: fileInfo.file.name,
        fileContent: base64Content,
        dashboard: fileInfo.dashboard,
        company_id: selectedCompany.company_id, // UPDATED: Use company_id
      };

      console.log("📤 Uploading with payload:", {
        ...uploadPayload,
        fileContent: "[BASE64_DATA]", // Don't log the full content
        company: selectedCompany.company_name,
      });

      const response = await apiClient.post("/api/excel/upload", uploadPayload);

      clearInterval(progressInterval);

      console.log("✅ Upload response:", response);

      if (response.data) {
        console.log("📨 Received response data:", response.data);

        // UPDATED: Extract all locations from response
        const extractedLocations = extractLocationsFromResponse(response.data);
        console.log("📍 All extracted locations:", extractedLocations);

        // Get primary location (first one or from filename)
        let primaryLocation = "";
        if (extractedLocations.length > 0) {
          primaryLocation = extractedLocations[0];
        } else {
          // Fallback to filename
          primaryLocation = fileInfo.file.name.replace(/\.(xlsx|xls)$/i, "");
          extractedLocations.push(primaryLocation);
        }

        // Extract filename from response
        let extractedFileName = fileInfo.file.name;
        if (Array.isArray(response.data) && response.data.length > 0) {
          extractedFileName = response.data[0]?.fileName || fileInfo.file.name;
        } else if (response.data.fileName) {
          extractedFileName = response.data.fileName;
        }

        // UPDATED: Process data for all locations
        const allLocationsData: Array<{
          location: string;
          data: any;
          categories?: string[];
        }> = [];

        if (Array.isArray(response.data)) {
          // Handle multiple dashboard response
          response.data.forEach((dashboardData) => {
            const dashboardName = dashboardData.dashboardName?.trim();
            const extractedCategories = extractCategoriesFromData(
              dashboardData,
              primaryLocation
            );

            const enhancedDashboardData = {
              ...dashboardData,
              categories: extractedCategories,
              company_id: selectedCompany.company_id, // UPDATED: Use company_id
              company_name: selectedCompany.company_name, // UPDATED: Use company_name
            };

            // Store data for all locations
            extractedLocations.forEach((location) => {
              allLocationsData.push({
                location,
                data: enhancedDashboardData,
                categories: extractedCategories,
              });

              // Dispatch to appropriate store based on dashboard type
              if (dashboardName === "Sales Split") {
                appDispatch(
                  addSalesData({
                    fileName: extractedFileName,
                    fileContent: base64Content,
                    location: location,
                    data: enhancedDashboardData,
                    categories: extractedCategories,
                    company_id: selectedCompany.company_id.toString(),
                  })
                );

                appDispatch(
                  addFileData({
                    fileName: extractedFileName,
                    fileContent: base64Content,
                    location: location,
                    data: enhancedDashboardData,
                    categories: extractedCategories,
                    company_id: selectedCompany.company_id.toString(),
                  })
                );
              } else if (dashboardName === "Product Mix") {
                appDispatch(
                  addProductMixData({
                    fileName: extractedFileName,
                    fileContent: base64Content,
                    location: location,
                    data: enhancedDashboardData,
                    categories: extractedCategories,
                    company_id: selectedCompany.company_id.toString(),
                  })
                );
              } else if (dashboardName === "Financials") {
                appDispatch(
                  addFinancialData({
                    fileName: extractedFileName,
                    fileContent: base64Content,
                    location: location,
                    data: enhancedDashboardData,
                    categories: extractedCategories,
                    company_id: selectedCompany.company_id.toString(),
                  })
                );
              } else if (dashboardName === "Sales Wide") {
                appDispatch(
                  addSalesWideData({
                    fileName: extractedFileName,
                    fileContent: base64Content,
                    location: location,
                    data: enhancedDashboardData,
                    categories: extractedCategories,
                    company_id: selectedCompany.company_id.toString(),
                  })
                );
              }
            });
          });
        } else {
          // Handle single dashboard response
          const dashboardName =
            response.data.dashboardName?.trim() || fileInfo.dashboard;
          const extractedCategories = extractCategoriesFromData(
            response.data,
            primaryLocation
          );

          const enhancedDashboardData = {
            ...response.data,
            categories: extractedCategories,
            company_id: selectedCompany.company_id, // UPDATED: Use company_id
            company_name: selectedCompany.company_name, // UPDATED: Use company_name
          };

          // Store data for all locations
          extractedLocations.forEach((location) => {
            allLocationsData.push({
              location,
              data: enhancedDashboardData,
              categories: extractedCategories,
            });

            // Dispatch to appropriate store
            if (dashboardName === "Financials") {
              appDispatch(
                addFinancialData({
                  fileName: extractedFileName,
                  fileContent: base64Content,
                  location: location,
                  data: enhancedDashboardData,
                  categories: extractedCategories,
                  company_id: selectedCompany.company_id.toString(),
                })
              );
            } else if (dashboardName === "Sales Split") {
              appDispatch(
                addSalesData({
                  fileName: extractedFileName,
                  fileContent: base64Content,
                  location: location,
                  data: enhancedDashboardData,
                  categories: extractedCategories,
                  company_id: selectedCompany.company_id.toString(),
                })
              );

              appDispatch(
                addFileData({
                  fileName: extractedFileName,
                  fileContent: base64Content,
                  location: location,
                  data: enhancedDashboardData,
                  categories: extractedCategories,
                  company_id: selectedCompany.company_id.toString(),
                })
              );
            } else if (dashboardName === "Sales Wide") {
              appDispatch(
                addSalesWideData({
                  fileName: extractedFileName,
                  fileContent: base64Content,
                  location: location,
                  data: enhancedDashboardData,
                  categories: extractedCategories,
                  company_id: selectedCompany.company_id.toString(),
                })
              );
            } else if (dashboardName === "Product Mix") {
              appDispatch(
                addProductMixData({
                  fileName: extractedFileName,
                  fileContent: base64Content,
                  location: location,
                  data: enhancedDashboardData,
                  categories: extractedCategories,
                  company_id: selectedCompany.company_id.toString(),
                })
              );
            }
          });
        }

        // UPDATED: Update Redux with all locations
        appDispatch(setLocations(extractedLocations));

        // Set primary location as selected
        if (primaryLocation) {
          appDispatch(selectLocation(primaryLocation));
        }

        // UPDATED: Update file state with all location data
        setFiles((prevFiles) => {
          const updatedFiles = [...prevFiles];
          updatedFiles[index] = {
            ...updatedFiles[index],
            status: "success",
            progress: 100,
            data: response.data,
            categories: extractCategoriesFromData(response.data),
            extractedFileName: extractedFileName,
            locations: extractedLocations, // Store all locations
            primaryLocation: primaryLocation, // Store primary location
            allLocationsData: allLocationsData, // Store all location data
          };
          return updatedFiles;
        });

        console.log(
          "✅ File upload completed successfully with company_id:",
          selectedCompany.company_id,
          "and locations:",
          extractedLocations
        );
        return true;
      } else {
        throw new Error("Invalid response data");
      }
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

  // Rest of the component logic remains the same...
  const uploadAllFiles = async () => {
    // Check if company is selected
    if (!selectedCompany) {
      setGeneralError("Please select a company before uploading files.");
      return;
    }

    const pendingFiles = files.filter((file) => file.status === "pending");

    if (pendingFiles.length === 0) {
      setGeneralError("No files ready for upload.");
      return;
    }

    for (let i = 0; i < files.length; i++) {
      if (files[i].status === "pending") {
        await uploadFile(files[i], i);
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
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

  // Updated view dashboard function for responsive location handling
  const viewDashboard = (fileInfo: FileInfo, specificDashboard?: string) => {
    if (fileInfo.data && fileInfo.status === "success") {
      const dashboardName = fileInfo.data.dashboardName || fileInfo.dashboard;

      // Handle specific dashboard navigation for combination dashboards
      if (specificDashboard) {
        switch (specificDashboard) {
          case "Sales Split":
            navigate("/manage-reports");
            break;
          case "Product Mix":
            navigate("/Productmix");
            break;
          case "Financials":
            navigate("/Financials");
            break;
          case "Sales Wide":
            navigate("/Saleswide");
            break;
          default:
            navigate("/dashboard");
        }
        return;
      }

      // Handle single dashboards (original logic)
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

      {/* UPDATED: Company Selection with new API structure */}
      <Fade in timeout={900}>
        <CompanySelectionCard>
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h5"
              sx={{
                mb: 3,
                fontWeight: 600,
                color: "text.primary",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <BusinessIcon color="primary" />
              Select Company
            </Typography>

            <Box sx={{ position: "relative" }}>
              <Autocomplete
                value={selectedCompany}
                onChange={handleCompanyChange}
                options={companies}
                getOptionLabel={(option) => option.company_name}
                loading={companiesLoading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Choose a company"
                    variant="outlined"
                    fullWidth
                    error={!!companiesError}
                    helperText={
                      companiesError || "Select a company to upload files for"
                    }
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <BusinessIcon sx={{ mr: 1, color: "action.active" }} />
                      ),
                      endAdornment: (
                        <>
                          {companiesLoading ? (
                            <CircularProgress color="inherit" size={20} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <Box
                    component="li"
                    {...props}
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <BusinessIcon fontSize="small" color="action" />
                    <Box>
                      <Typography variant="body1" fontWeight={500}>
                        {option.company_name}
                      </Typography>
                    </Box>
                  </Box>
                )}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>
          </CardContent>
        </CompanySelectionCard>
      </Fade>

      {/* Dashboard Type Selection */}
      <Grow in timeout={1000}>
        <Card sx={{ mb: 4, borderRadius: 3, overflow: "hidden" }}>
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h5"
              sx={{ mb: 3, fontWeight: 600, color: "text.primary" }}
            >
              Dashboard Selection
            </Typography>

            {/* Modern Dashboard Cards Grid */}
            <Grid container spacing={3}>
              {DASHBOARD_OPTIONS.map((option, index) => (
                <Grid item xs={12} sm={6} md={4} lg={2} key={option.value}>
                  <Fade in timeout={1200 + index * 200}>
                    <ModernDashboardCard
                      className="dashboard-card"
                      selected={selectedDashboard === option.value}
                      onClick={() => handleDashboardChange(option.value)}
                    >
                      {selectedDashboard === option.value && (
                        <SelectedBadge
                          label="Selected"
                          icon={<StarIcon sx={{ fontSize: "12px" }} />}
                        />
                      )}

                      <ModernIconAvatar
                        sx={{
                          background: option.gradient,
                          border: `3px solid ${alpha(option.color, 0.2)}`,
                          "& .dashboard-icon": {
                            color: "white",
                            fontSize: 32,
                            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                          },
                        }}
                      >
                        {option.icon}
                      </ModernIconAvatar>

                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          mb: 0.5,
                          color:
                            selectedDashboard === option.value
                              ? "primary.main"
                              : "text.primary",
                          fontSize: "1rem",
                          lineHeight: 1.2,
                          zIndex: 2,
                          position: "relative",
                        }}
                      >
                        {option.label}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          lineHeight: 1.3,
                          fontSize: "0.875rem",
                          zIndex: 2,
                          position: "relative",
                        }}
                      >
                        {option.description}
                      </Typography>
                    </ModernDashboardCard>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grow>

      {/* File Upload Area */}
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
                opacity: !selectedCompany ? 0.5 : 1,
                pointerEvents: !selectedCompany ? "none" : "auto",
              }}
            >
              <CloudUploadIcon
                sx={{
                  fontSize: 48,
                  color: "primary.main",
                  mb: 1.5,
                  animation: isDragging ? `${pulse} 0.5s infinite` : "none",
                }}
              />

              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                {!selectedCompany
                  ? "Select a Company First"
                  : "Drag & Drop Excel Files Here"}
              </Typography>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {!selectedCompany
                  ? "Choose a company before uploading files"
                  : "or click to browse files"}
              </Typography>

              {selectedCompany && (
                <ProcessButton
                  variant="contained"
                  startIcon={<UploadFileIcon />}
                  endIcon={<ArrowForwardIcon />}
                  sx={{ mb: 1 }}
                >
                  Browse Files
                </ProcessButton>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                multiple
                onChange={handleFileChange}
                style={{ display: "none" }}
                disabled={!selectedCompany}
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

      {/* Files List with Enhanced Location Display */}
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
                  disabled={
                    files.every((f) => f.status !== "pending") ||
                    !selectedCompany
                  }
                  startIcon={<CloudUploadIcon />}
                  endIcon={<ArrowForwardIcon />}
                >
                  Process All Files
                </ProcessButton>
              </Box>

              {/* Show selected company info */}
              {selectedCompany && (
                <Box
                  sx={{
                    mb: 3,
                    p: 2,
                    bgcolor: "grey.50",
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <BusinessIcon color="primary" />
                  <Typography variant="body1" fontWeight={500}>
                    Uploading for: {selectedCompany.company_name} (ID: {selectedCompany.company_id})
                  </Typography>
                </Box>
              )}

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
                                  {selectedCompany && (
                                    <Chip
                                      label={`Company: ${selectedCompany.company_id}`}
                                      size="small"
                                      color="secondary"
                                      variant="outlined"
                                      icon={<BusinessIcon />}
                                    />
                                  )}
                                </Stack>

                                {/* Enhanced location display with multiple location support */}
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 1,
                                  }}
                                >
                                  {/* All Locations */}
                                  {fileInfo.locations &&
                                    fileInfo.locations.length > 0 && (
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 1,
                                          flexWrap: "wrap",
                                        }}
                                      >
                                        <LocationCityIcon
                                          fontSize="small"
                                          color="action"
                                        />
                                        <Typography
                                          variant="body2"
                                          color="text.secondary"
                                          sx={{ mr: 1 }}
                                        >
                                          All Locations (
                                          {fileInfo.locations.length}):
                                        </Typography>
                                        {fileInfo.locations.map(
                                          (location, locIndex) => (
                                            <Chip
                                              key={locIndex}
                                              label={location}
                                              size="small"
                                              variant="outlined"
                                              color={
                                                location ===
                                                fileInfo.primaryLocation
                                                  ? "default"
                                                  : "default"
                                              }
                                              icon={<LocationOnIcon />}
                                            />
                                          )
                                        )}
                                      </Box>
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
                                <>
                                  {/* Single dashboard button for individual dashboards */}
                                  {!fileInfo.dashboard.includes(" and ") && (
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

                                  {/* Two separate buttons for combination dashboards */}
                                  {fileInfo.dashboard ===
                                    "Sales Split and Product Mix" && (
                                    <>
                                      <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() =>
                                          viewDashboard(fileInfo, "Sales Split")
                                        }
                                        startIcon={<FileOpenIcon />}
                                        sx={{ borderRadius: 2 }}
                                      >
                                        Sales Split
                                      </Button>
                                      <Button
                                        variant="outlined"
                                        color="primary"
                                        onClick={() =>
                                          viewDashboard(fileInfo, "Product Mix")
                                        }
                                        startIcon={<RestaurantIcon />}
                                        sx={{ borderRadius: 2 }}
                                      >
                                        Product Mix
                                      </Button>
                                    </>
                                  )}

                                  {fileInfo.dashboard ===
                                    "Financials and Sales Wide" && (
                                    <>
                                      <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() =>
                                          viewDashboard(fileInfo, "Financials")
                                        }
                                        startIcon={<AttachMoneyIcon />}
                                        sx={{ borderRadius: 2 }}
                                      >
                                        Financials
                                      </Button>
                                      <Button
                                        variant="outlined"
                                        color="primary"
                                        onClick={() =>
                                          viewDashboard(fileInfo, "Sales Wide")
                                        }
                                        startIcon={<TrendingUpIcon />}
                                        sx={{ borderRadius: 2 }}
                                      >
                                        Sales Wide
                                      </Button>
                                    </>
                                  )}
                                </>
                              )}

                              <IconButton
                                color="error"
                                onClick={() => removeFile(index)}
                                disabled={fileInfo.status === "uploading"}
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
    </PageContainer>
  );
};

export default ExcelUploadPage;
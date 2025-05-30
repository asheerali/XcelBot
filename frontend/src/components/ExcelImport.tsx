// Fixed ExcelImport.tsx - Improved chart layout and alignment
import React, { useState, useEffect } from "react";
import axios from "axios";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import LinearProgress from "@mui/material/LinearProgress";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import Snackbar from "@mui/material/Snackbar";
import { SelectChangeEvent } from "@mui/material/Select";
import Divider from "@mui/material/Divider";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Skeleton from "@mui/material/Skeleton";
import Fade from "@mui/material/Fade";
import Grow from "@mui/material/Grow";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Backdrop from "@mui/material/Backdrop";
import { styled, alpha, keyframes } from "@mui/material/styles";

// Icons
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import TableChartIcon from "@mui/icons-material/TableChart";
import InsightsIcon from "@mui/icons-material/Insights";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import RefreshIcon from "@mui/icons-material/Refresh";
import DashboardIcon from "@mui/icons-material/Dashboard";

// Import components
import FilterSection from "./FilterSection";
import TableDisplay from "./TableDisplay";
import SalesCharts from "./graphs/SalesCharts";
import DeliveryPercentageChart from "./graphs/DeliveryPercentageChart";
import InHousePercentageChart from "./graphs/InHousePercentageChart";
import CateringPercentageChart from "./graphs/CateringPercentageChart";
import FirstPartyPercentageChart from "./graphs/PercentageFirstThirdPartyChart";
import TotalSalesChart from "./graphs/TotalSalesChart";
import WowTrendsChart from "./graphs/WowTrendsChart";
import PercentageFirstThirdPartyChart from "./graphs/PercentageFirstThirdPartyChart";
import SalesDashboard from "./SalesDashboard";
import SalesSplitDashboard from "./SalesSplitDashboard";
import { API_URL_Local } from "../constants";

// Import Redux hooks and actions with proper error handling
import { useAppDispatch, useAppSelector } from "../typedHooks";
import {
  excelSlice, // Import the slice itself to access actions
  setExcelFile,
  setTableData,
  addFileData,
  setLocations,
  selectLocation,
  addSalesWideData,
  selectSalesWideLocation,
  selectCategoriesByLocation,
  selectSalesFilters,
  updateSalesFilters,
} from "../store/excelSlice";

// Extract actions from the slice to ensure they're properly defined
const { setLoading, setError } = excelSlice.actions;

// Modern styled components with clean white background
const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const CleanCard = styled(Card)(({ theme }) => ({
  background: "#ffffff",
  borderRadius: 12,
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  border: "1px solid #e0e0e0",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  animation: `${slideIn} 0.6s ease-out`,
  "&:hover": {
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.12)",
  },
}));

// FIXED: Improved Chart Container with proper height and responsive design
const ChartContainer = styled(Card)(({ theme }) => ({
  background: "#ffffff",
  borderRadius: 12,
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  border: "1px solid #e0e0e0",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  overflow: "visible", // FIXED: Allow content to overflow properly
  display: "flex",
  flexDirection: "column",
  "&:hover": {
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.12)",
  },
  // FIXED: Responsive heights for different chart types
  "&.chart-small": {
    minHeight: "420px", // Increased from 350px
    [theme.breakpoints.down("md")]: {
      minHeight: "380px",
    },
    [theme.breakpoints.down("sm")]: {
      minHeight: "350px",
    },
  },
  "&.chart-medium": {
    minHeight: "480px", // New medium size
    [theme.breakpoints.down("md")]: {
      minHeight: "420px",
    },
    [theme.breakpoints.down("sm")]: {
      minHeight: "380px",
    },
  },
  "&.chart-large": {
    minHeight: "520px", // Increased from 400px
    [theme.breakpoints.down("md")]: {
      minHeight: "480px",
    },
    [theme.breakpoints.down("sm")]: {
      minHeight: "420px",
    },
  },
}));

// FIXED: Improved Chart Content Container
const ChartContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  display: "flex",
  flexDirection: "column",
  height: "100%",
  flex: 1,
  overflow: "visible", // FIXED: Allow content to show properly
  // FIXED: Ensure proper spacing for chart elements
  "& > *:not(:last-child)": {
    marginBottom: theme.spacing(2),
  },
  // FIXED: Chart wrapper styling
  "& .chart-wrapper": {
    flex: 1,
    minHeight: 0, // Allow flex child to shrink
    display: "flex",
    flexDirection: "column",
    overflow: "visible",
  },
}));

// Product Mix style tabs - matching the image
const ProductMixTab = styled(Tab)(({ theme }) => ({
  textTransform: "none",
  fontWeight: 500,
  fontSize: "1rem",
  minHeight: 48,
  padding: "12px 24px",
  margin: "0 2px",
  color: "#6B7280",
  transition: "all 0.2s ease",
  "&.Mui-selected": {
    color: "#3B82F6",
    fontWeight: 600,
  },
  "&:hover": {
    color: "#3B82F6",
  },
}));

const ProductMixTabs = styled(Tabs)(({ theme }) => ({
  "& .MuiTabs-indicator": {
    backgroundColor: "#3B82F6",
    height: 2,
    borderRadius: 1,
  },
  "& .MuiTabs-flexContainer": {
    borderBottom: "1px solid #E5E7EB",
  },
  minHeight: 48,
}));

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 12,
  background: "#ffffff",
  border: "1px solid #e0e0e0",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.12)",
  },
}));

const LoadingOverlay = styled(Backdrop)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  background: "rgba(255, 255, 255, 0.9)",
  backdropFilter: "blur(8px)",
}));

const ModernLoader = () => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 2,
    }}
  >
    <Box sx={{ position: "relative" }}>
      <CircularProgress size={60} thickness={4} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: "absolute",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AnalyticsIcon sx={{ fontSize: 24, color: "primary.main" }} />
      </Box>
    </Box>
    <Typography variant="h6" sx={{ fontWeight: 500 }}>
      Processing Data...
    </Typography>
    <Typography variant="body2" color="text.secondary">
      Analyzing your Excel data and generating insights
    </Typography>
  </Box>
);

// API base URLs
// const API_URL = 'http://localhost:8000/api/excel/upload';
const API_URL = API_URL_Local + "/api/excel/upload";

// const FILTER_API_URL = 'http://localhost:8000/api/salessplit/filter';
const FILTER_API_URL = API_URL_Local + "/api/salessplit/filter";

// Tab Panel Component
interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Fade in={value === index} timeout={500}>
          <Box sx={{ pt: 0 }}>
            {" "}
            {/* FIXED: Removed top padding to better utilize space */}
            {children}
          </Box>
        </Fade>
      )}
    </div>
  );
}

// FIXED: Improved Chart Wrapper Component
interface ChartWrapperProps {
  title: string;
  children: React.ReactNode;
  size?: "small" | "medium" | "large";
  className?: string;
}

const ChartWrapper: React.FC<ChartWrapperProps> = ({
  title,
  children,
  size = "small",
  className = "",
}) => (
  <ChartContainer className={`chart-${size} ${className}`}>
    <ChartContent>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          color: "#374151",
          mb: 2,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <TrendingUpIcon sx={{ fontSize: 20, color: "primary.main" }} />
        {title}
      </Typography>
      <Box className="chart-wrapper">{children}</Box>
    </ChartContent>
  </ChartContainer>
);

// Main Component
export function ExcelImport() {
  // Get state from Redux
  const {
    fileName,
    fileContent,
    loading: reduxLoading,
    error: reduxError,
    tableData: reduxTableData,
    fileProcessed,
    allLocations,
    salesLocations,
    files,
    location: currentLocation,
    salesWideFiles,
    salesWideLocations,
    currentSalesWideLocation,
  } = useAppSelector((state) => state.excel);

  // Get salesFilters from Redux state
  const salesFilters = useAppSelector(selectSalesFilters);

  const dispatch = useAppDispatch();

  // Local state - simplified to remove main tabs since everything is Sales Split
  const [file, setFile] = useState<File | null>(null);
  const [error, setLocalError] = useState<string>(""); // Renamed to avoid confusion
  const [salesSplitTab, setSalesSplitTab] = useState<number>(0);
  const [tableTab, setTableTab] = useState<number>(0);
  const [viewMode, setViewMode] = useState<string>("tabs");
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<string>(
    currentLocation || ""
  );
  const [isLocationDialogOpen, setIsLocationDialogOpen] =
    useState<boolean>(false);
  const [locationInput, setLocationInput] = useState<string>("");
  const [locationError, setLocationError] = useState<string>("");
  const [showSuccessNotification, setShowSuccessNotification] =
    useState<boolean>(false);
  const [chartKey, setChartKey] = useState<number>(0);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [dateRangeType, setDateRangeType] = useState<string>("");
  const [availableDateRanges, setAvailableDateRanges] = useState<string[]>([]);
  const [customDateRange, setCustomDateRange] = useState<boolean>(false);

  // Loading states
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [loadingMessage, setLoadingMessage] = useState<string>("");

  // Update selected location whenever Redux location changes
  useEffect(() => {
    if (currentLocation && currentLocation !== selectedLocation) {
      setSelectedLocation(currentLocation);
    }
  }, [currentLocation, selectedLocation]);

  // Set file processed notification when tableData changes
  useEffect(() => {
    if (fileProcessed) {
      setShowSuccessNotification(true);
      setChartKey((prevKey) => prevKey + 1);
    }
  }, [fileProcessed]);

  // Update available date ranges when data changes or location changes
  useEffect(() => {
    if (
      reduxTableData &&
      reduxTableData.dateRanges &&
      reduxTableData.dateRanges.length > 0
    ) {
      setAvailableDateRanges(reduxTableData.dateRanges);

      if (!dateRangeType && reduxTableData.dateRanges.length > 0) {
        setDateRangeType(reduxTableData.dateRanges[0]);
      }
    }

    if (allLocations && allLocations.length > 0 && !selectedLocation) {
      const firstLocation = currentLocation || allLocations[0];
      setSelectedLocation(firstLocation);
      dispatch(selectLocation(firstLocation));
    }
  }, [
    reduxTableData,
    dateRangeType,
    selectedLocation,
    allLocations,
    currentLocation,
    dispatch,
  ]);

  useEffect(() => {
    if (dateRangeType === "Custom Date Range") {
      setCustomDateRange(true);
    } else {
      setCustomDateRange(false);
    }
  }, [dateRangeType]);

  // Simulate loading progress
  const simulateProgress = (duration: number) => {
    setLoadingProgress(0);
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 100 / (duration / 100);
      });
    }, 100);
    return interval;
  };

  // Handle tab changes
  const handleSalesSplitTabChange = (
    event: React.SyntheticEvent,
    newValue: number
  ) => {
    setSalesSplitTab(newValue);
  };

  const handleTableTabChange = (
    event: React.SyntheticEvent,
    newValue: number
  ) => {
    setTableTab(newValue);
  };

  // Handle location change
  const handleLocationChange = (event: SelectChangeEvent) => {
    const newLocation = event.target.value;
    setSelectedLocation(newLocation);
    dispatch(selectLocation(newLocation));
    handleApplyFilters(newLocation, dateRangeType);
    setChartKey((prevKey) => prevKey + 1);
  };

  // Handle date range type change
  const handleDateRangeChange = (event: SelectChangeEvent) => {
    const newDateRange = event.target.value;
    setDateRangeType(newDateRange);
    handleApplyFilters(selectedLocation, newDateRange);
    setChartKey((prevKey) => prevKey + 1);
  };

  // FIXED: Updated handleApplyFilters function with proper error handling and Redux actions
  const handleApplyFilters = (
    location = selectedLocation,
    dateRange = dateRangeType
  ) => {
    console.log("🎯 ExcelImport: Starting handleApplyFilters with:", {
      location,
      dateRange,
      salesFilters: salesFilters || "undefined",
      filesCount: files?.length || 0,
    });

    // Check if we have any files loaded
    if (!files || files.length === 0) {
      setLocalError("No files uploaded. Please upload Excel files first.");
      return;
    }

    // Find the file for the selected location
    const fileForLocation = files.find((f) => f.location === location);

    if (!fileForLocation) {
      setLocalError(`No file found for location: ${location}`);
      return;
    }

    try {
      // FIXED: Use proper Redux actions with null checks
      if (setLoading && typeof setLoading === "function") {
        dispatch(setLoading(true));
      }

      if (setError && typeof setError === "function") {
        dispatch(setError(null));
      }

      // Clear local error state
      setLocalError("");

      // Format dates correctly for API
      let formattedStartDate: string | null = null;
      let formattedEndDate: string | null = null;

      if (dateRange === "Custom Date Range" && startDate) {
        const dateParts = startDate.split("/");
        if (dateParts.length === 3) {
          formattedStartDate = `${dateParts[2]}-${dateParts[0].padStart(
            2,
            "0"
          )}-${dateParts[1].padStart(2, "0")}`;
        }
      }

      if (dateRange === "Custom Date Range" && endDate) {
        const dateParts = endDate.split("/");
        if (dateParts.length === 3) {
          formattedEndDate = `${dateParts[2]}-${dateParts[0].padStart(
            2,
            "0"
          )}-${dateParts[1].padStart(2, "0")}`;
        }
      }

      // Get the file content from the selected file
      const selectedFile = fileForLocation;

      // Get selected categories from salesFilters with proper null checking
      const selectedCategories = salesFilters?.selectedCategories || [];

      console.log("🎯 ExcelImport: Applying filters with categories:", {
        selectedCategories,
        location,
        dateRange,
        fileName: selectedFile.fileName,
        salesFiltersExists: !!salesFilters,
      });

      // Prepare filter data with selected categories
      const filterData = {
        fileName: selectedFile.fileName,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        location: location || null,
        dateRangeType: dateRange,
        selectedCategories: selectedCategories,
        categories: selectedCategories.join(","),
      };

      console.log("📤 Sending filter request with categories:", filterData);

      // Call filter API
      axios
        .post(FILTER_API_URL, filterData)
        .then((response) => {
          console.log("📥 Received filter response:", response.data);

          if (response.data) {
            dispatch(setTableData(response.data));
            setLocalError("");
            setChartKey((prevKey) => prevKey + 1);

            console.log("✅ Filter applied successfully");
          } else {
            throw new Error("Invalid response data");
          }
        })
        .catch((err) => {
          console.error("❌ Filter error:", err);

          let errorMessage = "Error filtering data";
          if (axios.isAxiosError(err)) {
            if (err.response) {
              const detail = err.response.data?.detail;
              errorMessage = `Server error: ${detail || err.response.status}`;

              if (
                detail &&
                typeof detail === "string" &&
                detail.includes("isinf")
              ) {
                errorMessage =
                  "Backend error: Please update the backend code to use numpy.isinf instead of pandas.isinf";
              } else if (err.response.status === 404) {
                errorMessage = "API endpoint not found. Is the server running?";
              }
            } else if (err.request) {
              errorMessage =
                "No response from server. Please check if the backend is running.";
            }
          }

          setLocalError(errorMessage);
          if (setError && typeof setError === "function") {
            dispatch(setError(errorMessage));
          }
        })
        .finally(() => {
          if (setLoading && typeof setLoading === "function") {
            dispatch(setLoading(false));
          }
        });
    } catch (err: any) {
      console.error("Filter error:", err);
      const errorMessage =
        "Error applying filters: " + (err.message || "Unknown error");
      setLocalError(errorMessage);

      if (setError && typeof setError === "function") {
        dispatch(setError(errorMessage));
      }

      if (setLoading && typeof setLoading === "function") {
        dispatch(setLoading(false));
      }
    }
  };

  // Handle date input changes
  const handleStartDateChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(event.target.value);
  };

  // Handle file selection redirect
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    window.location.href = "/upload-excel";
  };

  // Convert file to base64
  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  // Handle location dialog save
  const handleLocationSave = () => {
    if (!locationInput.trim()) {
      setLocationError("Location name is required");
      return;
    }

    if (
      allLocations &&
      allLocations.some(
        (loc) => loc.toLowerCase() === locationInput.trim().toLowerCase()
      )
    ) {
      setLocationError("Location name must be unique");
      return;
    }

    setIsLocationDialogOpen(false);
    setSelectedLocation(locationInput.trim());
    handleUpload(locationInput.trim());
  };

  // Upload and process file with enhanced loading
  const handleUpload = async (locationName?: string) => {
    if (!file) {
      setLocalError("Please select a file first");
      return;
    }

    try {
      setIsLoadingData(true);
      setLoadingMessage("Uploading file...");
      const progressInterval = simulateProgress(3000);

      if (setLoading && typeof setLoading === "function") {
        dispatch(setLoading(true));
      }

      if (setError && typeof setError === "function") {
        dispatch(setError(null));
      }

      setLocalError("");

      const base64File = await toBase64(file);
      const base64Content = base64File.split(",")[1];

      setLoadingMessage("Processing Excel data...");

      dispatch(
        setExcelFile({
          fileName: file.name,
          fileContent: base64Content,
          location: locationName,
        })
      );

      const response = await axios.post(API_URL, {
        fileName: file.name,
        fileContent: base64Content,
        location: locationName,
      });

      setLoadingMessage("Generating insights...");

      if (response.data) {
        if (locationName) {
          dispatch(
            addFileData({
              fileName: file.name,
              fileContent: base64Content,
              location: locationName,
              data: response.data,
            })
          );

          dispatch(
            setLocations(
              locationName ? [locationName] : response.data.locations || []
            )
          );
        }

        dispatch(setTableData(response.data));
        setShowSuccessNotification(true);

        if (locationName) {
          setSelectedLocation(locationName);
          dispatch(selectLocation(locationName));
        } else if (
          response.data.locations &&
          response.data.locations.length > 0
        ) {
          setSelectedLocation(response.data.locations[0]);
          dispatch(selectLocation(response.data.locations[0]));
        }

        if (response.data.dateRanges && response.data.dateRanges.length > 0) {
          setAvailableDateRanges(response.data.dateRanges);
          setDateRangeType(response.data.dateRanges[0]);
        }

        if (!localStorage.getItem("tutorialShown")) {
          setShowTutorial(true);
          localStorage.setItem("tutorialShown", "true");
        }

        setChartKey((prevKey) => prevKey + 1);
        setLoadingMessage("Complete!");

        setTimeout(() => {
          setIsLoadingData(false);
          clearInterval(progressInterval);
        }, 500);
      } else {
        throw new Error("Invalid response data");
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setIsLoadingData(false);

      let errorMessage = "Error processing file";

      if (axios.isAxiosError(err)) {
        if (err.response) {
          const detail = err.response.data?.detail;
          errorMessage = `Server error: ${detail || err.response.status}`;

          if (
            detail &&
            typeof detail === "string" &&
            detail.includes("isinf")
          ) {
            errorMessage =
              "Backend error: Please update the backend code to use numpy.isinf instead of pandas.isinf";
          } else if (err.response.status === 404) {
            errorMessage = "API endpoint not found. Is the server running?";
          } else if (detail) {
            if (typeof detail === "string" && detail.includes("Column")) {
              errorMessage = `File format error: ${detail}`;
            } else {
              errorMessage = `Processing error: ${detail}`;
            }
          }
        } else if (err.request) {
          errorMessage =
            "No response from server. Please check if the backend is running.";
        }
      } else if (err.message) {
        errorMessage = `Error: ${err.message}`;
      }

      setLocalError(errorMessage);
      if (setError && typeof setError === "function") {
        dispatch(setError(errorMessage));
      }
    } finally {
      if (setLoading && typeof setLoading === "function") {
        dispatch(setLoading(false));
      }
    }
  };

  // Success notification
  const renderSuccessNotification = () => (
    <Snackbar
      open={showSuccessNotification}
      autoHideDuration={5000}
      onClose={() => setShowSuccessNotification(false)}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Alert
        onClose={() => setShowSuccessNotification(false)}
        severity="success"
        sx={{
          width: "100%",
          borderRadius: 2,
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
        }}
        icon={<CheckCircleIcon />}
      >
        <Typography variant="subtitle2" fontWeight={600}>
          Success!
        </Typography>
        Excel file processed successfully and insights generated.
      </Alert>
    </Snackbar>
  );

  // Tutorial snackbar
  const renderTutorial = () => (
    <Snackbar
      open={showTutorial}
      autoHideDuration={15000}
      onClose={() => setShowTutorial(false)}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert
        onClose={() => setShowTutorial(false)}
        severity="info"
        sx={{
          width: "100%",
          maxWidth: "500px",
          borderRadius: 2,
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Typography variant="subtitle1" gutterBottom fontWeight={600}>
          🎉 Welcome to the Sales Analyzer!
        </Typography>
        <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
          <strong>Overview</strong>: Interactive dashboard overview
          <br />
          <strong>Detailed Analysis</strong>: Advanced sales insights
          <br />
          <br />
          <strong>Tip:</strong> Use the filters to analyze specific time periods
          and locations!
        </Typography>
      </Alert>
    </Snackbar>
  );

  // Location dialog
  const renderLocationDialog = () => (
    <Dialog
      open={isLocationDialogOpen}
      onClose={() => setIsLocationDialogOpen(false)}
      aria-labelledby="location-dialog-title"
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: "#ffffff",
        },
      }}
    >
      <DialogTitle id="location-dialog-title" sx={{ pb: 1 }}>
        <Typography variant="h5" fontWeight={600}>
          📍 Enter Location Name
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" paragraph sx={{ color: "text.secondary" }}>
          Please enter a location name for this Excel file. Each file should
          represent data from a single location.
        </Typography>
        <TextField
          autoFocus
          margin="dense"
          id="location"
          label="Location Name"
          type="text"
          fullWidth
          variant="outlined"
          value={locationInput}
          onChange={(e) => setLocationInput(e.target.value)}
          error={!!locationError}
          helperText={locationError}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
          }}
        />
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button
          onClick={() => setIsLocationDialogOpen(false)}
          color="inherit"
          sx={{ borderRadius: 2 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleLocationSave}
          color="primary"
          variant="contained"
          sx={{
            borderRadius: 2,
            px: 3,
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <>
      {/* Clean white background */}
      <Box
        sx={{
          background: "#ffffff",
          minHeight: "100vh",
          p: 3,
        }}
      >
        {/* Product Mix Dashboard Header */}
        <Box mb={4}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 600,
              color: "rgb(9, 43, 117)",
              fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
              mb: 2,
            }}
          >
            Sales Split Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {files.length > 0
              ? `Analyzing data from ${files.length} location${
                  files.length > 1 ? "s" : ""
                }`
              : "Upload Excel files to analyze sales data across different categories"}
          </Typography>
        </Box>

        {/* Status Card */}
        <CleanCard sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={2}>
            {files.length === 0 ? (
              <Grid item xs={12}>
                <StatsCard sx={{ textAlign: "center", py: 6 }}>
                  <CloudUploadIcon
                    sx={{ fontSize: 60, color: "primary.main", mb: 2 }}
                  />
                  <Typography
                    variant="h5"
                    color="text.secondary"
                    gutterBottom
                    fontWeight={600}
                  >
                    Ready to Analyze Your Data
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Upload your Excel files to get started with powerful sales
                    insights
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => (window.location.href = "/upload-excel")}
                    startIcon={<CloudUploadIcon />}
                    sx={{
                      mt: 2,
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
                    }}
                  >
                    Upload Files
                  </Button>
                </StatsCard>
              </Grid>
            ) : (
              <>
                {/* File Summary */}
                <Grid item xs={12}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    flexWrap="wrap"
                    gap={2}
                  >
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        Data Sources Active
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        Current: {fileName || "None selected"}
                        {selectedLocation && ` • 📍 ${selectedLocation}`}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* Filter Section */}
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      background: "#ffffff",
                      border: "1px solid #e0e0e0",
                    }}
                  >
                    <FilterSection
                      dateRangeType={dateRangeType}
                      availableDateRanges={availableDateRanges}
                      onDateRangeChange={handleDateRangeChange}
                      customDateRange={customDateRange}
                      startDate={startDate}
                      endDate={endDate}
                      onStartDateChange={handleStartDateChange}
                      onEndDateChange={handleEndDateChange}
                      locations={salesLocations}
                      selectedLocation={selectedLocation}
                      onLocationChange={handleLocationChange}
                      onApplyFilters={() => handleApplyFilters()}
                    />
                  </Paper>
                </Grid>
              </>
            )}
          </Grid>

          {/* Error Alert */}
          {(error || reduxError) && (
            <Fade in>
              <Alert
                severity="error"
                sx={{
                  mt: 2,
                  borderRadius: 2,
                  "& .MuiAlert-icon": {
                    fontSize: 24,
                  },
                }}
                icon={<ErrorIcon />}
                action={
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => {
                      setLocalError("");
                      dispatch(setError(null));
                    }}
                  >
                    Dismiss
                  </Button>
                }
              >
                <Typography variant="subtitle2" fontWeight={600}>
                  Processing Error
                </Typography>
                {error || reduxError}
              </Alert>
            </Fade>
          )}
        </CleanCard>

        {/* Main Dashboard - Product Mix Style */}
        {files.length > 0 && (
          <CleanCard sx={{ borderRadius: 2, mb: 3, overflow: "hidden" }}>
            {/* Product Mix Style Tabs - matching the image */}
            <Box
              sx={{
                background: "#ffffff",
                borderBottom: "1px solid #E5E7EB",
              }}
            >
              <ProductMixTabs
                value={salesSplitTab}
                onChange={handleSalesSplitTabChange}
                variant="fullWidth"
              >
                <ProductMixTab label="Overview" />
                <ProductMixTab label="Detailed Analysis" />
              </ProductMixTabs>
            </Box>

            {/* Overview Tab */}
            <TabPanel value={salesSplitTab} index={0}>
              <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                {fileProcessed && files.length > 0 ? (
                  <Fade in timeout={600}>
                    <Box>
                      <SalesSplitDashboard
                        tableData={reduxTableData}
                        selectedLocation={selectedLocation}
                      />
                    </Box>
                  </Fade>
                ) : (
                  <Box sx={{ textAlign: "center", py: 6 }}>
                    <Skeleton
                      variant="rectangular"
                      height={200}
                      sx={{ borderRadius: 2, mb: 2 }}
                    />
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="40%" />
                  </Box>
                )}
              </Box>
            </TabPanel>

            {/* FIXED: Detailed Analysis Tab with improved chart layout */}
            <TabPanel value={salesSplitTab} index={1}>
              <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                {fileProcessed &&
                reduxTableData.table1 &&
                reduxTableData.table1.length > 0 ? (
                  <Fade in timeout={600}>
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 4 }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 2 }}
                      >
                        <InsightsIcon
                          sx={{ mr: 2, color: "primary.main", fontSize: 28 }}
                        />
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                          Detailed Analysis
                        </Typography>
                      </Box>

                      {/* Analytics Charts Section - UPDATED to use Redux data */}
                      <CleanCard sx={{ p: 3, mb: 3 }}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 3 }}
                        >
                          <AnalyticsIcon
                            sx={{ mr: 2, color: "primary.main", fontSize: 28 }}
                          />
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Sales Analytics
                            {/* {selectedLocation ? `for ${selectedLocation}` : ''} */}
                          </Typography>
                        </Box>
                        <Divider sx={{ mb: 3 }} />

                        <div key={`sales-chart-${chartKey}`}>
                          <SalesCharts
                            tableData={reduxTableData} // Pass Redux table data instead of fileName/API props
                            dateRangeType={dateRangeType}
                            selectedLocation={selectedLocation}
                            height={250}
                          />
                        </div>
                      </CleanCard>

                      {/* Data Tables Section */}
                      <CleanCard sx={{ p: 3, mb: 3 }}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 3 }}
                        >
                          <TableChartIcon
                            sx={{ mr: 2, color: "primary.main", fontSize: 28 }}
                          />
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Data Tables
                          </Typography>
                        </Box>
                        <TableDisplay
                          tableData={reduxTableData}
                          viewMode="tabs"
                          activeTab={tableTab}
                          onTabChange={handleTableTabChange}
                        />
                      </CleanCard>

                      {/* FIXED: Detailed Charts Grid with improved layout and responsive heights */}
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 600, mb: 3, color: "#374151" }}
                      >
                        Detailed Charts
                      </Typography>

                      {/* FIXED: Grid layout with proper spacing and responsive design */}
                      <Grid container spacing={4}>
                        {/* Row 1: 1P, DD, GH and UB + In-House */}
                        <Grid item xs={12} lg={12}>
                          <DeliveryPercentageChart
                            tableData={reduxTableData}
                            height={100}
                          />
                        </Grid>

                        <Grid item xs={12} lg={12}>
                          <InHousePercentageChart
                            tableData={reduxTableData}
                            height={100}
                          />
                        </Grid>

                        {/* Row 2: Catering + Total Sales */}
                        <Grid item xs={12} lg={12}>
                          <CateringPercentageChart
                            tableData={reduxTableData}
                            height={100}
                          />
                        </Grid>

                        <Grid item xs={12} lg={12}>
                          <TotalSalesChart
                            tableData={reduxTableData}
                            height={100}
                          />
                        </Grid>

                        {/* Row 3: WOW Trends - Full width if data available */}
                        {reduxTableData.table4 &&
                          reduxTableData.table4.length > 0 && (
                            <Grid item xs={12}>
                              <WowTrendsChart
                                tableData={reduxTableData}
                                height={420}
                              />
                            </Grid>
                          )}

                        {/* Row 4: 1P / 3P - Full width */}
                        <Grid item xs={12}>
                          <PercentageFirstThirdPartyChart
                            tableData={reduxTableData}
                            height={420}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  </Fade>
                ) : (
                  <Box sx={{ textAlign: "center", py: 6 }}>
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      gutterBottom
                    >
                      No detailed data available
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Upload files to see detailed analysis
                    </Typography>
                  </Box>
                )}
              </Box>
            </TabPanel>
          </CleanCard>
        )}
      </Box>

      {/* Loading Overlay */}
      {(isLoadingData || reduxLoading) && (
        <LoadingOverlay open={true}>
          <ModernLoader />
        </LoadingOverlay>
      )}

      {renderTutorial()}
      {renderSuccessNotification()}
      {renderLocationDialog()}
    </>
  );
}

export default ExcelImport;

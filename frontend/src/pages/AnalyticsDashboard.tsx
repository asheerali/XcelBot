import React, { useState, useEffect } from "react";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";

// Material-UI Icons
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ClearIcon from "@mui/icons-material/Clear";
import RefreshIcon from "@mui/icons-material/Refresh";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

import AnalyticsComponenet from "../components/AnalyticsComponenet";
import DateRangeSelector from "../components/DateRangeSelector";

// Import API base URL from constants
import { API_URL_Local } from "../constants";

// Import Redux hooks and actions (for companies, locations, and date range)
import { useAppDispatch, useAppSelector } from "../typedHooks";
import {
  selectSelectedCompanies,
  selectSelectedLocations,
  setSelectedCompanies,
  setSelectedLocations,
} from "../store/slices/masterFileSlice";

// Import date range Redux actions and selectors
import {
  selectAnalyticsDashboardDateRange,
  selectHasAnalyticsDashboardDateRange,
  setAnalyticsDashboardDateRange,
  clearAnalyticsDashboardDateRange,
} from "../store/slices/dateRangeSlice";

// Add this helper function at the top, after imports
const createLocalDate = (year, month, day) => {
  // Create date at noon to avoid timezone issues
  const date = new Date(year, month, day, 12, 0, 0, 0);
  return date;
};

const parseDateSafely = (dateInput) => {
  if (!dateInput) return null;

  try {
    if (typeof dateInput === "string") {
      // Parse YYYY-MM-DD format
      const parts = dateInput.split("-");
      if (parts.length === 3) {
        return createLocalDate(
          parseInt(parts[0]),
          parseInt(parts[1]) - 1,
          parseInt(parts[2])
        );
      }
    }

    if (dateInput instanceof Date) {
      return createLocalDate(
        dateInput.getFullYear(),
        dateInput.getMonth(),
        dateInput.getDate()
      );
    }

    // Fallback
    const date = new Date(dateInput);
    return createLocalDate(date.getFullYear(), date.getMonth(), date.getDate());
  } catch (error) {
    console.error("Error parsing date:", error);
    return null;
  }
};

// DateRangeSelector Button Component - FIXED for proper Redux persistence
const DateRangeSelectorButton = ({ onDateRangeSelect }) => {
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [tempRange, setTempRange] = useState(null);

  // Get current date range from Redux
  const reduxDateRange = useAppSelector(selectAnalyticsDashboardDateRange);
  const hasDateRange = useAppSelector(selectHasAnalyticsDashboardDateRange);

  // Debug: Monitor Redux state changes
  useEffect(() => {
    console.log("🔍 Redux state changed:", {
      hasDateRange,
      reduxDateRange,
      startDate: reduxDateRange?.startDate,
      endDate: reduxDateRange?.endDate,
    });
  }, [hasDateRange, reduxDateRange]);

  // // FIXED: Properly format display text from Redux state
  // const getDisplayText = () => {
  //   if (hasDateRange && reduxDateRange?.startDate && reduxDateRange?.endDate) {
  //     try {
  //       const startDate = new Date(reduxDateRange.startDate);
  //       const endDate = new Date(reduxDateRange.endDate);

  //       // Validate dates before formatting - check for valid dates and not epoch
  //       if (
  //         !isNaN(startDate.getTime()) &&
  //         !isNaN(endDate.getTime()) &&
  //         startDate.getFullYear() > 1970 &&
  //         endDate.getFullYear() > 1970
  //       ) {
  //         // const displayText = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
  //         // FIX: Use consistent date formatting
  //         const options = { year: "numeric", month: "2-digit", day: "2-digit" };
  //         const displayText = `${startDate.toLocaleDateString(
  //           "en-GB",
  //           options
  //         )} - ${endDate.toLocaleDateString("en-GB", options)}`;

  //         console.log("📅 Display text generated:", displayText);
  //         return displayText;
  //       } else {
  //         console.warn("📅 Invalid dates in Redux for display:", {
  //           startDate,
  //           endDate,
  //         });
  //       }
  //     } catch (error) {
  //       console.error(
  //         "Error formatting dates from Redux:",
  //         error,
  //         reduxDateRange
  //       );
  //     }
  //   }
  //   console.log("📅 No valid date range for display, showing default");
  //   return "Select Date Range";
  // };

  // FIXED: Properly format display text from Redux state using consistent parsing
  const getDisplayText = () => {
    if (hasDateRange && reduxDateRange?.startDate && reduxDateRange?.endDate) {
      try {
        // Use the same parsing method as everywhere else
        const startDate = parseDateSafely(reduxDateRange.startDate);
        const endDate = parseDateSafely(reduxDateRange.endDate);

        // Validate dates before formatting
        if (
          startDate &&
          endDate &&
          !isNaN(startDate.getTime()) &&
          !isNaN(endDate.getTime()) &&
          startDate.getFullYear() > 1970 &&
          endDate.getFullYear() > 1970
        ) {
          // Use consistent date formatting
          const options = { year: "numeric", month: "2-digit", day: "2-digit" };
          const displayText = `${startDate.toLocaleDateString(
            "en-GB",
            options
          )} - ${endDate.toLocaleDateString("en-GB", options)}`;

          console.log("📅 Display text generated:", displayText);
          return displayText;
        } else {
          console.warn("📅 Invalid dates in Redux for display:", {
            startDate,
            endDate,
          });
        }
      } catch (error) {
        console.error(
          "Error formatting dates from Redux:",
          error,
          reduxDateRange
        );
      }
    }
    console.log("📅 No valid date range for display, showing default");
    return "Select Date Range";
  };

  const handleOpen = () => setIsOpen(true);

  const handleClose = () => {
    setIsOpen(false);
    setTempRange(null);
  };

  // const handleDateRangeSelect = (range) => {
  //   console.log('📅 DateRangeSelectorButton: handleDateRangeSelect called with:', range);
  //   console.log('📅 Range structure:', {
  //     hasStartDate: !!range?.startDate,
  //     hasEndDate: !!range?.endDate,
  //     hasStartDateStr: !!range?.startDateStr,
  //     hasEndDateStr: !!range?.endDateStr,
  //     startDateType: typeof range?.startDate,
  //     endDateType: typeof range?.endDate
  //   });

  //   // FIXED: Handle the exact format from your DateRangeSelector component
  //   if (range && range.startDate && range.endDate) {
  //     const selectedRange = {
  //       startDate: range.startDate, // Already Date objects from your component
  //       endDate: range.endDate
  //     };

  //     console.log('📅 Valid range detected:', {
  //       startDate: selectedRange.startDate,
  //       endDate: selectedRange.endDate,
  //       startDateISO: selectedRange.startDate.toISOString(),
  //       endDateISO: selectedRange.endDate.toISOString(),
  //       startDateLocal: selectedRange.startDate.toLocaleDateString(),
  //       endDateLocal: selectedRange.endDate.toLocaleDateString()
  //     });

  //     setTempRange(selectedRange);
  //   } else {
  //     console.warn('📅 Invalid range format:', range);
  //     setTempRange(null);
  //   }
  // };

  const handleDateRangeSelect = (range) => {
    console.log(
      "📅 DateRangeSelectorButton: handleDateRangeSelect called with:",
      range
    );

    if (range && range.startDate && range.endDate) {
      // Use the helper function to create safe dates
      const startDate = parseDateSafely(range.startDate);
      const endDate = parseDateSafely(range.endDate);

      if (startDate && endDate) {
        const selectedRange = {
          startDate: startDate,
          endDate: endDate,
        };

        console.log("📅 Valid range detected:", selectedRange);
        setTempRange(selectedRange);
      } else {
        console.warn("📅 Could not parse dates:", range);
        setTempRange(null);
      }
    } else {
      console.warn("📅 Invalid range format:", range);
      setTempRange(null);
    }
  };

  // const handleApply = () => {
  //   console.log("📅 Apply button clicked. TempRange:", tempRange);

  //   if (tempRange?.startDate && tempRange?.endDate) {
  //     // Dates are already Date objects from DateRangeSelector
  //     const startDate = tempRange.startDate;
  //     const endDate = tempRange.endDate;

  //     // Validate dates before storing
  //     if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
  //       // FIXED: Store as Date objects, let Redux slice handle the formatting
  //       console.log(
  //         "📅 DateRangeSelectorButton: Storing date range in Redux:",
  //         {
  //           startDate: startDate,
  //           endDate: endDate,
  //           localStartDate: startDate.toLocaleDateString(),
  //           localEndDate: endDate.toLocaleDateString(),
  //         }
  //       );

  //       // Store Date objects - Redux slice will format them as YYYY-MM-DD
  //       dispatch(
  //         setAnalyticsDashboardDateRange({
  //           startDate: startDate,
  //           endDate: endDate,
  //         })
  //       );

  //       // Also call parent callback with Date objects for immediate use
  //       onDateRangeSelect({
  //         startDate: startDate,
  //         endDate: endDate,
  //       });

  //       console.log("✅ Date range applied successfully to Redux");

  //       // Verify Redux state immediately after dispatch
  //       setTimeout(() => {
  //         console.log("🔍 Checking Redux state after dispatch...");
  //       }, 100);
  //     } else {
  //       console.error("📅 Invalid dates, cannot apply:", {
  //         startDate,
  //         endDate,
  //       });
  //     }
  //   } else {
  //     console.error("📅 No temp range to apply. TempRange:", tempRange);
  //   }

  //   setIsOpen(false);
  //   setTempRange(null);
  // };

  const handleApply = () => {
    console.log("📅 Apply button clicked. TempRange:", tempRange);

    if (tempRange?.startDate && tempRange?.endDate) {
      const startDate = tempRange.startDate;
      const endDate = tempRange.endDate;

      // Validate dates before storing
      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        // Create dates at noon to avoid timezone issues
        const cleanStartDate = createLocalDate(
          startDate.getFullYear(),
          startDate.getMonth(),
          startDate.getDate()
        );
        const cleanEndDate = createLocalDate(
          endDate.getFullYear(),
          endDate.getMonth(),
          endDate.getDate()
        );

        console.log(
          "📅 DateRangeSelectorButton: Storing date range in Redux:",
          {
            originalStartDate: startDate,
            originalEndDate: endDate,
            cleanStartDate: cleanStartDate,
            cleanEndDate: cleanEndDate,
            localStartDate: cleanStartDate.toLocaleDateString(),
            localEndDate: cleanEndDate.toLocaleDateString(),
          }
        );

        // Store clean Date objects
        dispatch(
          setAnalyticsDashboardDateRange({
            startDate: cleanStartDate,
            endDate: cleanEndDate,
          })
        );

        // Also call parent callback with clean Date objects
        onDateRangeSelect({
          startDate: cleanStartDate,
          endDate: cleanEndDate,
        });

        console.log("✅ Date range applied successfully to Redux");
      } else {
        console.error("📅 Invalid dates, cannot apply:", {
          startDate,
          endDate,
          startDateValid: !isNaN(startDate.getTime()),
          endDateValid: !isNaN(endDate.getTime()),
        });
      }
    } else {
      console.error("📅 No temp range to apply. TempRange:", tempRange);
    }

    setIsOpen(false);
    setTempRange(null);
  };

  const handleClear = (event) => {
    event.stopPropagation();
    console.log("📅 DateRangeSelectorButton: Clearing date range from Redux");
    dispatch(clearAnalyticsDashboardDateRange());
    onDateRangeSelect(null);
  };

  // // FIXED: Get initial state for DateRangeSelector from Redux
  // const getInitialDateRangeState = () => {
  //   if (hasDateRange && reduxDateRange?.startDate && reduxDateRange?.endDate) {
  //     try {
  //       const startDate = new Date(reduxDateRange.startDate);
  //       const endDate = new Date(reduxDateRange.endDate);

  //       // Validate dates and ensure they're not epoch dates
  //       if (
  //         !isNaN(startDate.getTime()) &&
  //         !isNaN(endDate.getTime()) &&
  //         startDate.getFullYear() > 1970 &&
  //         endDate.getFullYear() > 1970
  //       ) {
  //         return [
  //           {
  //             startDate: startDate,
  //             endDate: endDate,
  //             key: "selection",
  //           },
  //         ];
  //       }
  //     } catch (error) {
  //       console.error(
  //         "Error parsing Redux dates for DateRangeSelector:",
  //         error
  //       );
  //     }
  //   }

  //   // Default to last 7 days if no valid Redux state
  //   const today = new Date();
  //   const sevenDaysAgo = new Date(today);
  //   sevenDaysAgo.setDate(today.getDate() - 7);

  //   return [
  //     {
  //       startDate: sevenDaysAgo,
  //       endDate: today,
  //       key: "selection",
  //     },
  //   ];
  // };

  const getInitialDateRangeState = () => {
    if (hasDateRange && reduxDateRange?.startDate && reduxDateRange?.endDate) {
      try {
        // Parse dates from Redux and create clean date objects
        let startDate, endDate;

        if (typeof reduxDateRange.startDate === "string") {
          const parts = reduxDateRange.startDate.split("-");
          startDate = new Date(
            parseInt(parts[0]),
            parseInt(parts[1]) - 1,
            parseInt(parts[2])
          );
        } else {
          const originalStart = new Date(reduxDateRange.startDate);
          startDate = new Date(
            originalStart.getFullYear(),
            originalStart.getMonth(),
            originalStart.getDate()
          );
        }

        if (typeof reduxDateRange.endDate === "string") {
          const parts = reduxDateRange.endDate.split("-");
          endDate = new Date(
            parseInt(parts[0]),
            parseInt(parts[1]) - 1,
            parseInt(parts[2])
          );
        } else {
          const originalEnd = new Date(reduxDateRange.endDate);
          endDate = new Date(
            originalEnd.getFullYear(),
            originalEnd.getMonth(),
            originalEnd.getDate()
          );
        }

        // Validate dates and ensure they're not epoch dates
        if (
          !isNaN(startDate.getTime()) &&
          !isNaN(endDate.getTime()) &&
          startDate.getFullYear() > 1970 &&
          endDate.getFullYear() > 1970
        ) {
          return [
            {
              startDate: startDate,
              endDate: endDate,
              key: "selection",
            },
          ];
        }
      } catch (error) {
        console.error(
          "Error parsing Redux dates for DateRangeSelector:",
          error
        );
      }
    }

    // Default to last 7 days if no valid Redux state
    const today = new Date();
    const sevenDaysAgo = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 7
    );

    return [
      {
        startDate: sevenDaysAgo,
        endDate: today,
        key: "selection",
      },
    ];
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<CalendarTodayIcon />}
        endIcon={
          hasDateRange && (
            <IconButton
              size="small"
              onClick={handleClear}
              style={{ padding: "2px", marginLeft: "4px" }}
            >
              <ClearIcon style={{ fontSize: "16px" }} />
            </IconButton>
          )
        }
        onClick={handleOpen}
        sx={{
          textTransform: "none",
          borderRadius: 1,
          px: 2,
          py: 1,
          borderColor: "#d1d5db",
          color: "#6b7280",
          "&:hover": {
            borderColor: "#9ca3af",
            backgroundColor: "transparent",
          },
        }}
      >
        {getDisplayText()}
      </Button>

      <Dialog
        open={isOpen}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle
          sx={{
            borderBottom: "1px solid #e5e7eb",
            pb: 2,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <CalendarTodayIcon color="primary" />
          Select Date Range
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          <DateRangeSelector
            initialState={getInitialDateRangeState()}
            onSelect={handleDateRangeSelect}
          />

          {/* Debug Information */}
          {process.env.NODE_ENV === "development" && (
            <Box
              sx={{
                p: 2,
                backgroundColor: "#f5f5f5",
                borderTop: "1px solid #ddd",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Debug Info:
              </Typography>
              <pre style={{ fontSize: "10px", margin: "4px 0" }}>
                Redux State:{" "}
                {JSON.stringify({ hasDateRange, reduxDateRange }, null, 2)}
              </pre>
              <pre style={{ fontSize: "10px", margin: "4px 0" }}>
                Temp Range: {JSON.stringify(tempRange, null, 2)}
              </pre>
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
            borderTop: "1px solid #e5e7eb",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {tempRange
              ? `Selected: ${tempRange.startDate?.toLocaleDateString()} - ${tempRange.endDate?.toLocaleDateString()}`
              : hasDateRange &&
                reduxDateRange?.startDate &&
                reduxDateRange?.endDate
              ? `Current: ${new Date(
                  reduxDateRange.startDate
                ).toLocaleDateString()} - ${new Date(
                  reduxDateRange.endDate
                ).toLocaleDateString()}`
              : "No date range selected"}
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            {/* Debug Test Button - Development Only */}
            {process.env.NODE_ENV === "development" && (
              <Button
                onClick={() => {
                  const testRange = {
                    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
                    endDate: new Date(),
                  };
                  console.log("🧪 Testing with manual date range:", testRange);
                  setTempRange(testRange);
                }}
                variant="text"
                size="small"
                sx={{ textTransform: "none", fontSize: "12px" }}
              >
                Test Range
              </Button>
            )}

            <Button
              onClick={handleClose}
              variant="outlined"
              sx={{ textTransform: "none" }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              variant="contained"
              disabled={
                !tempRange || !tempRange.startDate || !tempRange.endDate
              }
              sx={{ textTransform: "none" }}
            >
              Apply Range
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
};

// Styled components matching your Material-UI theme structure
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

const ActiveFilterChip = styled(Chip)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
  fontWeight: 500,
  "& .MuiChip-deleteIcon": {
    color: theme.palette.primary.contrastText,
    "&:hover": {
      color: alpha(theme.palette.primary.contrastText, 0.8),
    },
  },
}));

const AnalyticsDashboard = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  // Get Redux state (companies, locations, and date range)
  const reduxSelectedCompanies = useAppSelector(selectSelectedCompanies);
  const reduxSelectedLocations = useAppSelector(selectSelectedLocations);
  const reduxDateRange = useAppSelector(selectAnalyticsDashboardDateRange);
  const hasDateRange = useAppSelector(selectHasAnalyticsDashboardDateRange);

  // Add a debug selector to inspect the full Redux state
  const fullReduxState = useAppSelector((state) => state);

  // Debug: Monitor Redux state changes in main component
  useEffect(() => {
    console.log("🔍 === REDUX STATE MONITOR ===");
    console.log("🔍 reduxSelectedCompanies:", reduxSelectedCompanies);
    console.log("🔍 reduxSelectedLocations:", reduxSelectedLocations);
    console.log("🔍 hasDateRange:", hasDateRange);
    console.log("🔍 reduxDateRange:", reduxDateRange);
    console.log("🔍 === END REDUX MONITOR ===");
  }, [hasDateRange, reduxDateRange?.startDate, reduxDateRange?.endDate]);

  // Debug: Log Redux state changes in main component
  useEffect(() => {
    console.log("🏠 Main Component - Redux Date Range State:", {
      hasDateRange,
      reduxDateRange,
      startDate: reduxDateRange?.startDate,
      endDate: reduxDateRange?.endDate,
      timestamp: new Date().toISOString(),
    });
  }, [hasDateRange, reduxDateRange?.startDate, reduxDateRange?.endDate]);

  // State for API data
  const [companyLocationData, setCompanyLocationData] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analyticsError, setAnalyticsError] = useState(null);

  // Filter states (for UI selections, not applied yet)
  const [selectedCompanies, setSelectedCompaniesLocal] = useState([]);
  const [selectedLocations, setSelectedLocationsLocal] = useState([]);

  // State for applied filters (what gets sent to AnalyticsComponent)
  const [appliedFilters, setAppliedFilters] = useState({
    companies: [],
    locations: [],
    dateRange: null,
  });

  // // FIXED: Enhanced analytics data fetching with support for multiple companies and locations
  // const fetchAnalyticsData = async (
  //   companyIds,
  //   locationIds,
  //   dateRange = null
  // ) => {
  //   try {
  //     setAnalyticsLoading(true);
  //     setAnalyticsError(null);

  //     console.log("🔍 Fetching analytics data for:", {
  //       companyIds,
  //       locationIds,
  //       dateRange,
  //       hasDateRange,
  //     });

  //     // Validate inputs
  //     if (
  //       !companyIds ||
  //       !locationIds ||
  //       companyIds.length === 0 ||
  //       locationIds.length === 0
  //     ) {
  //       throw new Error("Company IDs and Location IDs are required");
  //     }

  //     // Convert arrays to comma-separated strings
  //     const companyIdsStr = Array.isArray(companyIds)
  //       ? companyIds.join(",")
  //       : companyIds;
  //     const locationIdsStr = Array.isArray(locationIds)
  //       ? locationIds.join(",")
  //       : locationIds;

  //     // Build the API URL with multiple IDs
  //     let apiUrl = `${API_URL_Local}/api/storeorders/analyticsdashboard/${companyIdsStr}/${locationIdsStr}`;

  //     // FIXED: Improved date range parameter handling
  //     const params = new URLSearchParams();

  //     if (dateRange?.startDate && dateRange?.endDate) {
  //       // Handle both Date objects and ISO strings
  //       let startDateObj, endDateObj;

  //       if (dateRange.startDate instanceof Date) {
  //         startDateObj = dateRange.startDate;
  //       } else {
  //         startDateObj = new Date(dateRange.startDate);
  //       }

  //       if (dateRange.endDate instanceof Date) {
  //         endDateObj = dateRange.endDate;
  //       } else {
  //         endDateObj = new Date(dateRange.endDate);
  //       }

  //       // Validate dates before formatting
  //       if (
  //         !isNaN(startDateObj.getTime()) &&
  //         !isNaN(endDateObj.getTime()) &&
  //         startDateObj.getFullYear() > 1970 &&
  //         endDateObj.getFullYear() > 1970
  //       ) {
  //         // Format dates correctly for backend (yyyy-MM-dd)
  //         // const startDate = startDateObj.toISOString().split('T')[0];
  //         // const endDate = endDateObj.toISOString().split('T')[0];

  //         // FIX: Use local timezone instead of UTC
  //         const startDate =
  //           startDateObj.getFullYear() +
  //           "-" +
  //           String(startDateObj.getMonth() + 1).padStart(2, "0") +
  //           "-" +
  //           String(startDateObj.getDate()).padStart(2, "0");

  //         const endDate =
  //           endDateObj.getFullYear() +
  //           "-" +
  //           String(endDateObj.getMonth() + 1).padStart(2, "0") +
  //           "-" +
  //           String(endDateObj.getDate()).padStart(2, "0");

  //         params.append("start_date", startDate);
  //         params.append("end_date", endDate);

  //         console.log(
  //           "📅 FIXED: Date range parameters being sent to backend:",
  //           {
  //             original: dateRange,
  //             formatted: { start_date: startDate, end_date: endDate },
  //           }
  //         );
  //       } else {
  //         console.warn("⚠️ Invalid dates provided, skipping date range");
  //       }
  //     } else {
  //       console.log("📅 No date range provided - fetching all data");
  //     }

  //     if (params.toString()) {
  //       apiUrl += `?${params.toString()}`;
  //     }

  //     console.log("🌐 Backend API Request:", {
  //       url: apiUrl,
  //       company_ids: companyIdsStr,
  //       location_ids: locationIdsStr,
  //       company_count: Array.isArray(companyIds) ? companyIds.length : 1,
  //       location_count: Array.isArray(locationIds) ? locationIds.length : 1,
  //       timestamp: new Date().toISOString(),
  //     });

  //     const response = await fetch(apiUrl, {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //     });

  //     console.log("🔄 Backend Response Status:", {
  //       status: response.status,
  //       statusText: response.statusText,
  //       ok: response.ok,
  //     });

  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }

  //     const result = await response.json();

  //     console.log("📊 Backend Data Received:", {
  //       success: true,
  //       dataReceived: !!result.data,
  //       totalSales: result.data?.total_sales,
  //       totalOrders: result.data?.total_orders,
  //       recordCount: result.data?.daily_orders?.length || 0,
  //       companiesProcessed: Array.isArray(companyIds) ? companyIds.length : 1,
  //       locationsProcessed: Array.isArray(locationIds) ? locationIds.length : 1,
  //     });

  //     if (result.data) {
  //       setAnalyticsData(result.data);
  //     } else {
  //       throw new Error("No data received from analytics API");
  //     }
  //   } catch (err) {
  //     console.error("❌ Error fetching analytics data:", {
  //       error: err.message,
  //       companyIds,
  //       locationIds,
  //       dateRange,
  //     });
  //     setAnalyticsError(err.message);
  //     setAnalyticsData(null);
  //   } finally {
  //     setAnalyticsLoading(false);
  //   }
  // };

  // FIXED: Enhanced analytics data fetching with support for multiple companies and locations
  const fetchAnalyticsData = async (
    companyIds,
    locationIds,
    dateRange = null
  ) => {
    try {
      setAnalyticsLoading(true);
      setAnalyticsError(null);

      console.log("🔍 Fetching analytics data for:", {
        companyIds,
        locationIds,
        dateRange,
        hasDateRange,
      });

      // Validate inputs
      if (
        !companyIds ||
        !locationIds ||
        companyIds.length === 0 ||
        locationIds.length === 0
      ) {
        throw new Error("Company IDs and Location IDs are required");
      }

      // Convert arrays to comma-separated strings
      const companyIdsStr = Array.isArray(companyIds)
        ? companyIds.join(",")
        : companyIds;
      const locationIdsStr = Array.isArray(locationIds)
        ? locationIds.join(",")
        : locationIds;

      // Build the API URL with multiple IDs
      let apiUrl = `${API_URL_Local}/api/storeorders/analyticsdashboard/${companyIdsStr}/${locationIdsStr}`;

      // FIXED: Improved date range parameter handling with consistent parsing
      const params = new URLSearchParams();

      if (dateRange?.startDate && dateRange?.endDate) {
        try {
          // Use consistent date parsing
          const startDateObj = parseDateSafely(dateRange.startDate);
          const endDateObj = parseDateSafely(dateRange.endDate);

          if (startDateObj && endDateObj) {
            // Double-check we have valid dates
            if (
              !isNaN(startDateObj.getTime()) &&
              !isNaN(endDateObj.getTime()) &&
              startDateObj.getFullYear() > 1970 &&
              endDateObj.getFullYear() > 1970
            ) {
              // Format using local date components (no timezone conversion)
              const startDate = [
                startDateObj.getFullYear(),
                String(startDateObj.getMonth() + 1).padStart(2, "0"),
                String(startDateObj.getDate()).padStart(2, "0"),
              ].join("-");

              const endDate = [
                endDateObj.getFullYear(),
                String(endDateObj.getMonth() + 1).padStart(2, "0"),
                String(endDateObj.getDate()).padStart(2, "0"),
              ].join("-");

              params.append("start_date", startDate);
              params.append("end_date", endDate);

              console.log(
                "📅 FIXED: Date range parameters being sent to backend:",
                {
                  originalStartDate: dateRange.startDate,
                  originalEndDate: dateRange.endDate,
                  parsedStartDate: startDateObj,
                  parsedEndDate: endDateObj,
                  finalFormatted: { start_date: startDate, end_date: endDate },
                  startDateComponents: {
                    year: startDateObj.getFullYear(),
                    month: startDateObj.getMonth() + 1,
                    date: startDateObj.getDate(),
                  },
                  endDateComponents: {
                    year: endDateObj.getFullYear(),
                    month: endDateObj.getMonth() + 1,
                    date: endDateObj.getDate(),
                  },
                }
              );
            } else {
              console.warn("⚠️ Invalid parsed dates:", {
                startDateObj,
                endDateObj,
              });
            }
          } else {
            console.warn("⚠️ Could not parse dates:", {
              startDate: dateRange.startDate,
              endDate: dateRange.endDate,
            });
          }
        } catch (error) {
          console.error("❌ Error processing date range:", error);
        }
      } else {
        console.log("📅 No date range provided - fetching all data");
      }

      if (params.toString()) {
        apiUrl += `?${params.toString()}`;
      }

      console.log("🌐 Backend API Request:", {
        url: apiUrl,
        company_ids: companyIdsStr,
        location_ids: locationIdsStr,
        company_count: Array.isArray(companyIds) ? companyIds.length : 1,
        location_count: Array.isArray(locationIds) ? locationIds.length : 1,
        timestamp: new Date().toISOString(),
      });

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("🔄 Backend Response Status:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      console.log("📊 Backend Data Received:", {
        success: true,
        dataReceived: !!result.data,
        totalSales: result.data?.total_sales,
        totalOrders: result.data?.total_orders,
        recordCount: result.data?.daily_orders?.length || 0,
        companiesProcessed: Array.isArray(companyIds) ? companyIds.length : 1,
        locationsProcessed: Array.isArray(locationIds) ? locationIds.length : 1,
      });

      if (result.data) {
        setAnalyticsData(result.data);
      } else {
        throw new Error("No data received from analytics API");
      }
    } catch (err) {
      console.error("❌ Error fetching analytics data:", {
        error: err.message,
        companyIds,
        locationIds,
        dateRange,
      });
      setAnalyticsError(err.message);
      setAnalyticsData(null);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // FIXED: Auto-apply filters when Redux state changes - Updated to use all selected IDs
  useEffect(() => {
    // Only apply filters if we have both companies and locations selected
    if (
      reduxSelectedCompanies.length > 0 &&
      reduxSelectedLocations.length > 0
    ) {
      console.log("🔄 Auto-applying filters due to Redux state change:", {
        companies: reduxSelectedCompanies,
        locations: reduxSelectedLocations,
        dateRange: reduxDateRange,
        hasDateRange,
      });

      // Apply the filters using Redux values directly
      setAppliedFilters({
        companies: reduxSelectedCompanies.map((id) => parseInt(id)),
        locations: reduxSelectedLocations.map((id) => parseInt(id)),
        dateRange: reduxDateRange,
      });

      // FIXED: Fetch analytics data for ALL selected companies and locations
      const companyIds = reduxSelectedCompanies.map((id) => parseInt(id));
      const locationIds = reduxSelectedLocations.map((id) => parseInt(id));

      if (companyIds.length > 0 && locationIds.length > 0) {
        // FIXED: Use Redux date range state properly
        const dateRangeToPass = hasDateRange ? reduxDateRange : null;
        fetchAnalyticsData(companyIds, locationIds, dateRangeToPass);
      }
    }
  }, [
    reduxSelectedCompanies.join(","),
    reduxSelectedLocations.join(","),
    hasDateRange,
    reduxDateRange?.startDate,
    reduxDateRange?.endDate,
  ]);

  // Fetch company-location data from API
  const fetchCompanyLocationData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL_Local}/company-locations/all`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCompanyLocationData(data);
    } catch (err) {
      console.error("Error fetching company-location data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load initial data on component mount
  useEffect(() => {
    fetchCompanyLocationData();
  }, []);

  // FIXED: Initialize local state from Redux when component mounts or Redux changes
  useEffect(() => {
    console.log(
      "🔄 Syncing local companies state with Redux:",
      reduxSelectedCompanies
    );
    setSelectedCompaniesLocal(reduxSelectedCompanies.map((id) => parseInt(id)));
  }, [reduxSelectedCompanies.join(",")]);

  useEffect(() => {
    console.log(
      "🔄 Syncing local locations state with Redux:",
      reduxSelectedLocations
    );
    setSelectedLocationsLocal(reduxSelectedLocations.map((id) => parseInt(id)));
  }, [reduxSelectedLocations.join(",")]);

  // Auto-apply filters when component loads with Redux data - Updated to use all selected IDs
  useEffect(() => {
    if (
      reduxSelectedCompanies.length > 0 &&
      reduxSelectedLocations.length > 0 &&
      companyLocationData.length > 0
    ) {
      console.log(
        "🚀 Auto-applying filters from initial Redux state on component load"
      );
      setAppliedFilters({
        companies: reduxSelectedCompanies.map((id) => parseInt(id)),
        locations: reduxSelectedLocations.map((id) => parseInt(id)),
        dateRange: reduxDateRange,
      });

      // FIXED: Fetch analytics data for ALL selected companies and locations
      const companyIds = reduxSelectedCompanies.map((id) => parseInt(id));
      const locationIds = reduxSelectedLocations.map((id) => parseInt(id));

      if (companyIds.length > 0 && locationIds.length > 0) {
        const dateRangeToPass = hasDateRange ? reduxDateRange : null;
        fetchAnalyticsData(companyIds, locationIds, dateRangeToPass);
      }
    }
  }, [companyLocationData.length]); // Only run when component data loads

  // Get available companies
  const availableCompanies = companyLocationData.map((item) => ({
    id: item.company_id,
    name: item.company_name,
  }));

  // Get available locations based on selected companies
  const getAvailableLocations = () => {
    if (selectedCompanies.length === 0) {
      return [];
    } else {
      const locations = companyLocationData
        .filter((company) => selectedCompanies.includes(company.company_id))
        .reduce((acc, company) => {
          return acc.concat(
            company.locations.map((location) => ({
              id: location.location_id,
              name: location.location_name,
              companyId: company.company_id,
              companyName: company.company_name,
            }))
          );
        }, []);

      return locations;
    }
  };

  const availableLocations = getAvailableLocations();

  // Clear all filters including Redux state
  const clearAllFilters = () => {
    setSelectedCompaniesLocal([]);
    setSelectedLocationsLocal([]);

    // Update Redux state
    dispatch(setSelectedCompanies([]));
    dispatch(setSelectedLocations([]));
    dispatch(clearAnalyticsDashboardDateRange());
  };

  // Handle company selection with immediate Redux update
  const handleCompanyChange = (event) => {
    const selectedCompanyId = event.target.value;

    // For single selection, create array with one item or empty array
    const newSelectedCompanies = selectedCompanyId ? [selectedCompanyId] : [];

    setSelectedCompaniesLocal(newSelectedCompanies);

    // Update Redux immediately
    dispatch(
      setSelectedCompanies(newSelectedCompanies.map((id) => id.toString()))
    );

    // Clear locations that don't belong to selected company
    if (newSelectedCompanies.length > 0) {
      const validLocationIds = companyLocationData
        .filter((company) => newSelectedCompanies.includes(company.company_id))
        .reduce((acc, company) => {
          return acc.concat(
            company.locations.map((location) => location.location_id)
          );
        }, []);

      const newValidLocations = selectedLocations.filter((locationId) =>
        validLocationIds.includes(locationId)
      );
      setSelectedLocationsLocal(newValidLocations);

      // Update Redux for locations too
      dispatch(
        setSelectedLocations(newValidLocations.map((id) => id.toString()))
      );
    } else {
      // If no company selected, clear locations
      setSelectedLocationsLocal([]);
      dispatch(setSelectedLocations([]));
    }
  };

  // Handle location selection with immediate Redux update
  const handleLocationChange = (event) => {
    const value = event.target.value;
    const newSelectedLocations =
      typeof value === "string" ? value.split(",") : value;

    setSelectedLocationsLocal(newSelectedLocations);

    // Update Redux immediately
    dispatch(
      setSelectedLocations(newSelectedLocations.map((id) => id.toString()))
    );
  };

  // FIXED: Handle date range selection (stores in Redux for persistence)
  const handleDateRangeSelect = (range) => {
    console.log("📅 Main handleDateRangeSelect called with:", range);

    if (range?.startDate && range?.endDate) {
      // This is called from DateRangeSelectorButton which already handles Redux updates
      // Just log for debugging - Redux state is already updated by the button component
      console.log("📅 Date range selection handled by DateRangeSelectorButton");
    } else if (range === null) {
      // Handle clearing date range
      console.log("📅 Date range cleared");
      dispatch(clearAnalyticsDashboardDateRange());
    }
  };

  // Handle refresh - Updated to use all selected IDs
  const handleRefresh = () => {
    console.log("🔄 Refreshing data...");
    fetchCompanyLocationData();

    // Also refresh analytics data if we have selections
    if (
      reduxSelectedCompanies.length > 0 &&
      reduxSelectedLocations.length > 0
    ) {
      const companyIds = reduxSelectedCompanies.map((id) => parseInt(id));
      const locationIds = reduxSelectedLocations.map((id) => parseInt(id));
      console.log("🔄 Refreshing analytics data with current selections:", {
        companyIds,
        locationIds,
      });
      const dateRangeToPass = hasDateRange ? reduxDateRange : null;
      fetchAnalyticsData(companyIds, locationIds, dateRangeToPass);
    }
  };

  // Get company name by ID
  const getCompanyNameById = (companyId) => {
    const company = companyLocationData.find((c) => c.company_id === companyId);
    return company ? company.company_name : "";
  };

  // Get location name by ID
  const getLocationNameById = (locationId) => {
    for (const company of companyLocationData) {
      const location = company.locations.find(
        (l) => l.location_id === locationId
      );
      if (location) return location.location_name;
    }
    return "";
  };

  if (loading) {
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
        <Typography sx={{ ml: 2 }}>
          Loading companies and locations...
        </Typography>
      </Box>
    );
  }

  if (error) {
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
        <Typography color="error" variant="h6">
          Error loading company/location data: {error}
        </Typography>
      </Box>
    );
  }

  return (
    <>
      {/* Add CSS keyframes for pulse animation */}
      <style jsx global>{`
        @keyframes pulse {
          0% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.05);
          }
          100% {
            opacity: 0.3;
            transform: scale(1);
          }
        }
      `}</style>

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
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={loading}
              sx={{
                textTransform: "none",
                borderRadius: 1,
                px: 2,
                py: 1,
                borderColor: "#d1d5db",
                color: "#6b7280",
                "&:hover": {
                  borderColor: "#9ca3af",
                  backgroundColor: "transparent",
                },
              }}
            >
              Refresh
            </Button>

            <DateRangeSelectorButton
              onDateRangeSelect={handleDateRangeSelect}
            />
          </Box>
        </Container>

        {/* Filters Section */}
        <Container maxWidth="xl">
          <StyledCard sx={{ p: 4, overflow: "visible" }}>
            {/* Filter Header */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
              <FilterListIcon sx={{ color: theme.palette.primary.main }} />
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: theme.palette.text.primary }}
              >
                Filters
              </Typography>
            </Box>

            {/* Filter Controls */}
            <Grid container spacing={3} sx={{ mb: 4, overflow: "visible" }}>
              {/* Company Filter */}
              <Grid item xs={12} lg={6}>
                <FormControl fullWidth>
                  <InputLabel id="company-select-label">Company</InputLabel>
                  <Select
                    labelId="company-select-label"
                    // Remove 'multiple' prop for single selection
                    value={
                      selectedCompanies.length > 0 ? selectedCompanies[0] : ""
                    }
                    onChange={handleCompanyChange}
                    input={<OutlinedInput label="Company" />}
                    // Remove renderValue for single selection
                    displayEmpty
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                          backgroundColor: "#ffffff",
                          border: "2px solid #1976d2",
                          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                        },
                      },
                      anchorOrigin: {
                        vertical: "bottom",
                        horizontal: "left",
                      },
                      transformOrigin: {
                        vertical: "top",
                        horizontal: "left",
                      },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        "&:hover fieldset": {
                          borderColor:
                            selectedCompanies.length === 0
                              ? "#d1d5db"
                              : theme.palette.primary.main,
                        },
                      },
                    }}
                  >
                    {/* Empty option for clearing selection */}
                    <MenuItem value="">
                      <em>Select a company</em>
                    </MenuItem>

                    {availableCompanies.map((company) => (
                      <MenuItem key={company.id} value={company.id}>
                        {company.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Location Filter */}
              <Grid item xs={12} lg={6}>
                <FormControl fullWidth>
                  <InputLabel id="location-select-label">Locations</InputLabel>
                  <Select
                    labelId="location-select-label"
                    multiple
                    value={selectedLocations}
                    onChange={handleLocationChange}
                    input={<OutlinedInput label="Locations" />}
                    disabled={selectedCompanies.length === 0}
                    renderValue={(selected) =>
                      selectedCompanies.length === 0
                        ? "Please select a company first"
                        : selected.length === 0
                        ? "Select locations"
                        : `${selected.length} location(s) selected`
                    }
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                          backgroundColor: "#ffffff",
                          border: "2px solid #1976d2",
                          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                        },
                      },
                      anchorOrigin: {
                        vertical: "bottom",
                        horizontal: "left",
                      },
                      transformOrigin: {
                        vertical: "top",
                        horizontal: "left",
                      },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        "&:hover fieldset": {
                          borderColor: theme.palette.primary.main,
                        },
                      },
                    }}
                  >
                    {selectedCompanies.length > 0 &&
                      availableLocations.length > 0 && (
                        <>
                          <MenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              if (
                                selectedLocations.length ===
                                availableLocations.length
                              ) {
                                setSelectedLocationsLocal([]);
                                dispatch(setSelectedLocations([]));
                              } else {
                                const allLocationIds = availableLocations.map(
                                  (l) => l.id
                                );
                                setSelectedLocationsLocal(allLocationIds);
                                dispatch(
                                  setSelectedLocations(
                                    allLocationIds.map((id) => id.toString())
                                  )
                                );
                              }
                            }}
                            sx={{
                              backgroundColor: "#ffffff",
                              "&:hover": {
                                backgroundColor: alpha(
                                  theme.palette.primary.main,
                                  0.04
                                ),
                              },
                            }}
                          >
                            <Checkbox
                              checked={
                                availableLocations.length > 0 &&
                                selectedLocations.length ===
                                  availableLocations.length
                              }
                              indeterminate={
                                selectedLocations.length > 0 &&
                                selectedLocations.length <
                                  availableLocations.length
                              }
                            />
                            <ListItemText primary="Select All" />
                          </MenuItem>
                          {availableLocations.map((location) => (
                            <MenuItem
                              key={location.id}
                              value={location.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                const currentIndex = selectedLocations.indexOf(
                                  location.id
                                );
                                const newSelectedLocations = [
                                  ...selectedLocations,
                                ];

                                if (currentIndex === -1) {
                                  newSelectedLocations.push(location.id);
                                } else {
                                  newSelectedLocations.splice(currentIndex, 1);
                                }

                                setSelectedLocationsLocal(newSelectedLocations);
                                dispatch(
                                  setSelectedLocations(
                                    newSelectedLocations.map((id) =>
                                      id.toString()
                                    )
                                  )
                                );
                              }}
                              sx={{
                                backgroundColor: "#ffffff",
                                "&:hover": {
                                  backgroundColor: alpha(
                                    theme.palette.primary.main,
                                    0.04
                                  ),
                                },
                              }}
                            >
                              <Checkbox
                                checked={selectedLocations.includes(
                                  location.id
                                )}
                              />
                              <ListItemText
                                primary={location.name}
                                secondary={location.companyName}
                              />
                            </MenuItem>
                          ))}
                        </>
                      )}
                    {selectedCompanies.length === 0 && (
                      <MenuItem disabled>
                        <ListItemText primary="Please select a company first" />
                      </MenuItem>
                    )}
                    {selectedCompanies.length > 0 &&
                      availableLocations.length === 0 && (
                        <MenuItem disabled>
                          <ListItemText primary="No locations available for selected company" />
                        </MenuItem>
                      )}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Active Filters Display */}
            {(selectedCompanies.length > 0 ||
              selectedLocations.length > 0 ||
              hasDateRange) && (
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    color: theme.palette.text.primary,
                  }}
                >
                  Active Filters:
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1,
                    alignItems: "center",
                  }}
                >
                  {/* Company Filter Chips */}
                  {selectedCompanies.map((companyId) => (
                    <ActiveFilterChip
                      key={`company-${companyId}`}
                      label={`Company: ${getCompanyNameById(companyId)}`}
                      onDelete={() => {
                        const newCompanies = selectedCompanies.filter(
                          (id) => id !== companyId
                        );
                        setSelectedCompaniesLocal(newCompanies);
                        dispatch(
                          setSelectedCompanies(
                            newCompanies.map((id) => id.toString())
                          )
                        );

                        // Remove locations that belong to this company
                        const companyLocations =
                          companyLocationData.find(
                            (c) => c.company_id === companyId
                          )?.locations || [];
                        const locationIdsToRemove = companyLocations.map(
                          (l) => l.location_id
                        );
                        const newLocations = selectedLocations.filter(
                          (id) => !locationIdsToRemove.includes(id)
                        );
                        setSelectedLocationsLocal(newLocations);
                        dispatch(
                          setSelectedLocations(
                            newLocations.map((id) => id.toString())
                          )
                        );
                      }}
                      deleteIcon={<CloseIcon />}
                      sx={{
                        background: `linear-gradient(135deg, #1976d2 0%, #1565c0 100%)`,
                        maxWidth: 250,
                        minWidth: 120,
                        "& .MuiChip-label": {
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontSize: "0.875rem",
                        },
                      }}
                    />
                  ))}

                  {/* Location Filter Chips */}
                  {selectedLocations.map((locationId) => (
                    <ActiveFilterChip
                      key={`location-${locationId}`}
                      label={`Location: ${getLocationNameById(locationId)}`}
                      onDelete={() => {
                        const newLocations = selectedLocations.filter(
                          (id) => id !== locationId
                        );
                        setSelectedLocationsLocal(newLocations);
                        dispatch(
                          setSelectedLocations(
                            newLocations.map((id) => id.toString())
                          )
                        );
                      }}
                      deleteIcon={<CloseIcon />}
                      sx={{
                        background: `linear-gradient(135deg, #388e3c 0%, #2e7d32 100%)`,
                        maxWidth: 250,
                        minWidth: 120,
                        "& .MuiChip-label": {
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontSize: "0.875rem",
                        },
                      }}
                    />
                  ))}

                  {/* Date Range Filter Chip */}
                  {/* {hasDateRange &&
                    reduxDateRange?.startDate &&
                    reduxDateRange?.endDate && (
                      <ActiveFilterChip
                        key="date-range"
                        label={`Date Range: ${(() => {
                          try {
                            const startDate = new Date(
                              reduxDateRange.startDate
                            );
                            const endDate = new Date(reduxDateRange.endDate);

                            if (
                              !isNaN(startDate.getTime()) &&
                              !isNaN(endDate.getTime()) &&
                              startDate.getFullYear() > 1970 &&
                              endDate.getFullYear() > 1970
                            ) {
                              return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
                            }
                            return "Invalid Date Range";
                          } catch (error) {
                            console.error(
                              "Error formatting date range for chip:",
                              error
                            );
                            return "Invalid Date Range";
                          }
                        })()}`} */}

{/* Date Range Filter Chip */}
{hasDateRange &&
  reduxDateRange?.startDate &&
  reduxDateRange?.endDate && (
    <ActiveFilterChip
      key="date-range"
      label={`Date Range: ${(() => {
        try {
          // Use consistent parsing with parseDateSafely
          const startDate = parseDateSafely(reduxDateRange.startDate);
          const endDate = parseDateSafely(reduxDateRange.endDate);

          if (
            startDate &&
            endDate &&
            !isNaN(startDate.getTime()) &&
            !isNaN(endDate.getTime()) &&
            startDate.getFullYear() > 1970 &&
            endDate.getFullYear() > 1970
          ) {
            return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
          }
          return "Invalid Date Range";
        } catch (error) {
          console.error("Error formatting date range for chip:", error);
          return "Invalid Date Range";
        }
      })()}`}


                        onDelete={() => {
                          console.log(
                            "🗑️ Clearing date range from active filter chip"
                          );
                          dispatch(clearAnalyticsDashboardDateRange());
                        }}
                        deleteIcon={<CloseIcon />}
                        sx={{
                          background: `linear-gradient(135deg, #f57c00 0%, #ef6c00 100%)`,
                          maxWidth: 300,
                          minWidth: 180,
                          "& .MuiChip-label": {
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            fontSize: "0.875rem",
                          },
                        }}
                      />
                    )}

                  {/* Clear All Button */}
                  {(selectedCompanies.length > 0 ||
                    selectedLocations.length > 0 ||
                    hasDateRange) && (
                    <Button
                      size="small"
                      onClick={clearAllFilters}
                      variant="outlined"
                      sx={{
                        ml: 1,
                        textTransform: "none",
                        borderColor: theme.palette.error.main,
                        color: theme.palette.error.main,
                        "&:hover": {
                          borderColor: theme.palette.error.dark,
                          backgroundColor: alpha(
                            theme.palette.error.main,
                            0.04
                          ),
                        },
                      }}
                    >
                      Clear All Filters
                    </Button>
                  )}
                </Box>
              </Box>
            )}
          </StyledCard>
        </Container>

        {/* Analytics Content */}
        <Container maxWidth="xl">
          <ContentCard>
            {analyticsLoading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  py: 8,
                }}
              >
                <CircularProgress size={40} />
                <Typography sx={{ ml: 2 }}>
                  Loading analytics data...
                </Typography>
              </Box>
            ) : analyticsError ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  py: 8,
                  flexDirection: "column",
                }}
              >
                <Typography color="error" variant="h6" gutterBottom>
                  Error loading analytics data
                </Typography>
                <Typography color="error" variant="body2">
                  {analyticsError}
                </Typography>
                {reduxSelectedCompanies.length > 0 &&
                  reduxSelectedLocations.length > 0 && (
                    <Button
                      variant="outlined"
                      onClick={() => {
                        const companyIds = reduxSelectedCompanies.map((id) =>
                          parseInt(id)
                        );
                        const locationIds = reduxSelectedLocations.map((id) =>
                          parseInt(id)
                        );
                        fetchAnalyticsData(
                          companyIds,
                          locationIds,
                          hasDateRange ? reduxDateRange : null
                        );
                      }}
                      sx={{ mt: 2 }}
                    >
                      Retry
                    </Button>
                  )}
              </Box>
            ) : !analyticsData ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  py: 8,
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  {reduxSelectedCompanies.length === 0 ||
                  reduxSelectedLocations.length === 0
                    ? "Please select a company and location to view analytics data"
                    : "No analytics data available"}
                </Typography>
              </Box>
            ) : (
              <>
                {/* Analytics Data Display */}
                <Box sx={{ p: 3 }}>
                  {/* Header with company and location info - Updated for multiple selections */}
                  <Box sx={{ mb: 4, borderBottom: "1px solid #e0e0e0", pb: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                      Analytics Dashboard
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                      {/* FIXED: Display information for multiple companies and locations */}
                      {reduxSelectedCompanies.length === 1 &&
                      reduxSelectedLocations.length === 1
                        ? // Single company and location - try to get names from analytics data or fallback to IDs
                          `${
                            analyticsData.company_name ||
                            getCompanyNameById(
                              parseInt(reduxSelectedCompanies[0])
                            )
                          } - ${
                            analyticsData.location_name ||
                            getLocationNameById(
                              parseInt(reduxSelectedLocations[0])
                            )
                          }`
                        : // Multiple companies or locations
                          `${reduxSelectedCompanies.length} Company(s) & ${reduxSelectedLocations.length} Location(s) Selected`}
                  
                  
{/*                   
                      {hasDateRange && (
                        <span style={{ marginLeft: 16 }}>
                          (
                          {new Date(
                            reduxDateRange.startDate
                          ).toLocaleDateString()}{" "}
                          -{" "}
                          {new Date(
                            reduxDateRange.endDate
                          ).toLocaleDateString()}
                          )
                        </span>
                      )} */}

{hasDateRange && (
  <span style={{ marginLeft: 16 }}>
    (
    {parseDateSafely(reduxDateRange.startDate)?.toLocaleDateString()}{" "}
    -{" "}
    {parseDateSafely(reduxDateRange.endDate)?.toLocaleDateString()}
    )
  </span>
)}


                    </Typography>

                    {/* Show detailed breakdown for multiple selections */}
                    {(reduxSelectedCompanies.length > 1 ||
                      reduxSelectedLocations.length > 1) && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Companies:</strong>{" "}
                          {reduxSelectedCompanies
                            .map((id) => getCompanyNameById(parseInt(id)))
                            .join(", ")}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Locations:</strong>{" "}
                          {reduxSelectedLocations
                            .map((id) => getLocationNameById(parseInt(id)))
                            .join(", ")}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Enhanced Key Metrics Cards - Responsive Design */}

                  {/* Fixed Modern Key Metrics Cards - No Text Wrapping */}
                  <Grid
                    container
                    spacing={{ xs: 2, sm: 3, md: 4 }}
                    sx={{ mb: 4 }}
                  >
                    {/* Total Sales Card */}
                    <Grid item xs={12} sm={6} lg={4}>
                      <Card
                        sx={{
                          position: "relative",
                          borderRadius: 4,
                          overflow: "hidden",
                          background:
                            "linear-gradient(135deg,rgb(255, 255, 255) 0%,rgb(220, 246, 232) 100%)",
                          border: "1px solid #bbf7d0",
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          height: 160, // Fixed height
                          cursor: "pointer",
                          "&:hover": {
                            transform: "translateY(-8px)",
                            boxShadow: "0 20px 40px rgba(34, 197, 94, 0.15)",
                            border: "1px solidrgb(49, 131, 79)",
                          },
                          "&::before": {
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 4,
                            background:
                              "linear-gradient(90deg, #22c55e 0%, #16a34a 100%)",
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
                          {/* Header */}
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mb: 1,
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#15803d",
                                fontWeight: 600,
                                fontSize: "0.7rem",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                                lineHeight: 1,
                                whiteSpace: "nowrap",
                              }}
                            >
                              TOTAL SALES
                            </Typography>
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: "50%",
                                background:
                                  "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 8px 16px rgba(34, 197, 94, 0.3)",
                                flexShrink: 0,
                              }}
                            >
                              <AttachMoneyIcon
                                sx={{
                                  fontSize: 20,
                                  color: "white",
                                }}
                              />
                            </Box>
                          </Box>

                          {/* Value - Single line with responsive font size */}
                          <Box
                            sx={{
                              flex: 1,
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                            }}
                          >
                            <Typography
                              variant="h3"
                              sx={{
                                fontWeight: 800,
                                color: "#15803d",
                                fontSize: "clamp(1.5rem, 4vw, 2.2rem)", // Responsive font size
                                lineHeight: 1,
                                mb: 1,
                                fontFamily:
                                  '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              $
                              {parseFloat(
                                analyticsData.total_sales || 0
                              ).toLocaleString("en-US", {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                              })}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#16a34a",
                                fontWeight: 500,
                                backgroundColor: "rgba(34, 197, 94, 0.1)",
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 2,
                                fontSize: "0.65rem",
                                textTransform: "uppercase",
                                letterSpacing: "0.3px",
                                alignSelf: "flex-start",
                                whiteSpace: "nowrap",
                              }}
                            >
                              Revenue
                            </Typography>
                          </Box>
                        </Box>
                      </Card>
                    </Grid>

                    {/* Total Orders Card */}
                    <Grid item xs={12} sm={6} lg={4}>
                      <Card
                        sx={{
                          position: "relative",
                          borderRadius: 4,
                          overflow: "hidden",
                          background:
                            "linear-gradient(135deg, #eff6ff 0%,rgb(235, 243, 255) 100%)",
                          border: "1px solid #bfdbfe",
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          height: 160, // Fixed heightx
                          cursor: "pointer",
                          "&:hover": {
                            transform: "translateY(-8px)",
                            boxShadow: "0 20px 40px rgba(59, 130, 246, 0.15)",
                            border: "1px solid #93c5fd",
                          },
                          "&::before": {
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 4,
                            background:
                              "linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)",
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
                          {/* Header */}
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mb: 1,
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#1d4ed8",
                                fontWeight: 600,
                                fontSize: "0.7rem",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                                lineHeight: 1,
                                whiteSpace: "nowrap",
                              }}
                            >
                              TOTAL ORDERS
                            </Typography>
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: "50%",
                                background:
                                  "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 8px 16px rgba(59, 130, 246, 0.3)",
                                flexShrink: 0,
                              }}
                            >
                              <ShoppingCartIcon
                                sx={{
                                  fontSize: 20,
                                  color: "white",
                                }}
                              />
                            </Box>
                          </Box>

                          {/* Value - Single line with responsive font size */}
                          <Box
                            sx={{
                              flex: 1,
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                            }}
                          >
                            <Typography
                              variant="h3"
                              sx={{
                                fontWeight: 800,
                                color: "#1d4ed8",
                                fontSize: "clamp(1.5rem, 4vw, 2.2rem)", // Responsive font size
                                lineHeight: 1,
                                mb: 1,
                                fontFamily:
                                  '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {(analyticsData.total_orders || 0).toLocaleString(
                                "en-US"
                              )}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#2563eb",
                                fontWeight: 500,
                                backgroundColor: "rgba(59, 130, 246, 0.1)",
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 2,
                                fontSize: "0.65rem",
                                textTransform: "uppercase",
                                letterSpacing: "0.3px",
                                alignSelf: "flex-start",
                                whiteSpace: "nowrap",
                              }}
                            >
                              Transactions
                            </Typography>
                          </Box>
                        </Box>
                      </Card>
                    </Grid>

                    {/* Average Order Value Card */}
                    <Grid item xs={12} sm={12} lg={4}>
                      <Card
                        sx={{
                          position: "relative",
                          borderRadius: 4,
                          overflow: "hidden",
                          background:
                            "linear-gradient(135deg, #fff7ed 0%,rgb(251, 233, 212) 100%)",
                          border: "1px solid #fdba74",
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          height: 160, // Fixed height
                          cursor: "pointer",
                          "&:hover": {
                            transform: "translateY(-8px)",
                            boxShadow: "0 20px 40px rgba(249, 115, 22, 0.15)",
                            border: "1px solid #fb923c",
                          },
                          "&::before": {
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 4,
                            background:
                              "linear-gradient(90deg, #f97316 0%, #ea580c 100%)",
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
                          {/* Header */}
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mb: 1,
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#c2410c",
                                fontWeight: 600,
                                fontSize: "0.7rem",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                                lineHeight: 1,
                                whiteSpace: "nowrap",
                              }}
                            >
                              AVG ORDER VALUE
                            </Typography>
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: "50%",
                                background:
                                  "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 8px 16px rgba(249, 115, 22, 0.3)",
                                flexShrink: 0,
                              }}
                            >
                              <TrendingUpIcon
                                sx={{
                                  fontSize: 20,
                                  color: "white",
                                }}
                              />
                            </Box>
                          </Box>

                          {/* Value - Single line with responsive font size */}
                          <Box
                            sx={{
                              flex: 1,
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                            }}
                          >
                            <Typography
                              variant="h3"
                              sx={{
                                fontWeight: 800,
                                color: "#c2410c",
                                fontSize: "clamp(1.5rem, 4vw, 2.2rem)", // Responsive font size
                                lineHeight: 1,
                                mb: 1,
                                fontFamily:
                                  '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              $
                              {parseFloat(
                                analyticsData.avg_order_value || 0
                              ).toLocaleString("en-US", {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                              })}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#ea580c",
                                fontWeight: 500,
                                backgroundColor: "rgba(249, 115, 22, 0.1)",
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 2,
                                fontSize: "0.65rem",
                                textTransform: "uppercase",
                                letterSpacing: "0.3px",
                                alignSelf: "flex-start",
                                whiteSpace: "nowrap",
                              }}
                            >
                              Per Transaction
                            </Typography>
                          </Box>
                        </Box>
                      </Card>
                    </Grid>
                  </Grid>
                  {/* Pass analytics data to AnalyticsComponent */}
                  <AnalyticsComponenet
                    appliedFilters={appliedFilters}
                    analyticsData={analyticsData}
                  />
                </Box>
              </>
            )}
          </ContentCard>
        </Container>
      </Box>
    </>
  );
};

export default AnalyticsDashboard;

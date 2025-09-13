import React, { useState, useEffect } from "react";
import EmailScheduler from "../components/EmailScheduler"; // Adjust path as needed

import {
  Box,
  Typography,
  Card,
  CardContent,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Print as PrintIcon,
  Email as EmailIcon,
  Description as DescriptionIcon,
  Close as CloseIcon,
  CalendarToday as CalendarTodayIcon,
  Clear as ClearIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import apiClient from "../api/axiosConfig";
// Import Redux hooks and selectors
import { useAppDispatch, useAppSelector } from "../typedHooks";
import {
  setSelectedCompanies,
  setSelectedLocations,
  clearError,
  selectSelectedCompanies,
  selectSelectedLocations,
  selectSelectedFilenames,
  selectLoading,
  selectError,
  selectLastAppliedFilters,
} from "../store/slices/masterFileSlice";

// Import date range Redux selectors and actions
import {
  selectStoreSummaryProductionDateRange,
  selectHasStoreSummaryProductionDateRange,
  setStoreSummaryProductionDateRange,
  clearStoreSummaryProductionDateRange,
} from "../store/slices/dateRangeSlice";

// Import your existing components
import DateRangeSelector from "../components/DateRangeSelector"; // Adjust the import path as needed
import { API_URL_Local } from "../constants"; // Import API base URL

// API response interfaces
interface OrderData {
  order_id: number;
  created_at: string;
  items_count: number;
  total_quantity: number;
  total_amount: number;
}

interface OrdersApiResponse {
  message: string;
  data: OrderData[];
  total: number;
}

interface ConsolidatedProductionItem {
  Item: string;
  [locationName: string]: string | number; // Dynamic location columns
  "Total Required": number;
  Unit: string;
}

interface ConsolidatedProductionResponse {
  message: string;
  columns: string[];
  data: ConsolidatedProductionItem[];
}

interface Company {
  company_id: number;
  company_name: string;
  locations: Location[];
}

interface Location {
  location_id: number;
  location_name: string;
}

// Helper function to convert Redux date strings to Date objects
const parseReduxDate = (dateStr: string | null): Date | null => {
  if (!dateStr) return null;
  try {
    // Redux stores dates as YYYY-MM-DD format
    const [year, month, day] = dateStr.split("-").map(Number);
    // FIXED: Create date in local timezone (not UTC)
    return new Date(year, month - 1, day); // month is 0-indexed in Date constructor
  } catch (error) {
    console.error("Error parsing Redux date:", error);
    return null;
  }
};

// Helper function to format date range for API calls
const formatDateForAPI = (date: Date): string => {
  if (!date) return "";
  try {
    // FIXED: Use local timezone instead of UTC to avoid date shifting
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("Error formatting date for API:", error);
    return "";
  }
};

// DateRangeSelector Button Component - UPDATED with Redux integration
const DateRangeSelectorButton = ({ onDateRangeSelect, currentRange }) => {
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [tempRange, setTempRange] = useState(null);

  // Initialize display text from currentRange
  const getDisplayText = () => {
    if (currentRange && currentRange.startDate && currentRange.endDate) {
      return `${currentRange.startDate.toLocaleDateString()} - ${currentRange.endDate.toLocaleDateString()}`;
    }
    return "Select Date Range";
  };

  const [selectedRange, setSelectedRange] = useState(getDisplayText());

  // Update display when currentRange changes
  useEffect(() => {
    setSelectedRange(getDisplayText());
  }, [currentRange]);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => {
    setIsOpen(false);
    setTempRange(null);
  };

  const handleDateRangeSelect = (range) => {
    setTempRange(range);
  };

  const handleApply = () => {
    if (tempRange) {
      const startDate = tempRange.startDate.toLocaleDateString();
      const endDate = tempRange.endDate.toLocaleDateString();
      setSelectedRange(`${startDate} - ${endDate}`);

      // Update Redux store
      dispatch(
        setStoreSummaryProductionDateRange({
          startDate: tempRange.startDate,
          endDate: tempRange.endDate,
        })
      );

      // Call parent callback
      onDateRangeSelect(tempRange);
    }
    setIsOpen(false);
  };

  const handleClear = (event) => {
    event.stopPropagation();
    setSelectedRange("Select Date Range");

    // Clear Redux store
    dispatch(clearStoreSummaryProductionDateRange());

    // Call parent callback with null
    onDateRangeSelect(null);
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<CalendarTodayIcon />}
        endIcon={
          selectedRange !== "Select Date Range" && (
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
          borderRadius: 2,
          textTransform: "none",
          minWidth: "200px",
          justifyContent: "flex-start",
          borderColor: "primary.main",
          "&:hover": {
            borderColor: "primary.dark",
          },
        }}
      >
        {selectedRange}
      </Button>

      <Dialog
        open={isOpen}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: "80vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            borderBottom: "1px solid #e0e0e0",
            pb: 2,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <CalendarTodayIcon color="primary" />
          Select Date Range for Production Reports
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          <DateRangeSelector
            initialState={[
              {
                startDate: new Date(),
                endDate: new Date(),
                key: "selection",
              },
            ]}
            onSelect={handleDateRangeSelect}
          />
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
            borderTop: "1px solid #e0e0e0",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {tempRange &&
              `${tempRange.startDate?.toLocaleDateString()} - ${tempRange.endDate?.toLocaleDateString()}`}
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button onClick={handleClose} color="secondary" variant="outlined">
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              variant="contained"
              color="primary"
              disabled={!tempRange}
            >
              Apply Range
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
};

const StoreSummaryProduction = () => {
  const dispatch = useAppDispatch();

  // Redux selectors
  const selectedCompanies = useAppSelector(selectSelectedCompanies);
  const selectedLocations = useAppSelector(selectSelectedLocations);
  const selectedFilenames = useAppSelector(selectSelectedFilenames);
  const lastAppliedFilters = useAppSelector(selectLastAppliedFilters);
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);

  // NEW: Redux date range selectors
  const reduxDateRange = useAppSelector(selectStoreSummaryProductionDateRange);
  const hasReduxDateRange = useAppSelector(
    selectHasStoreSummaryProductionDateRange
  );

  // Email Scheduler state
  const [emailSchedulerOpen, setEmailSchedulerOpen] = useState(false);

  const [printOptions, setPrintOptions] = useState({
    pageLayout: "single",
    pageSize: "A4",
    orientation: "portrait",
    customWidth: 210, // Default A4 width in mm
    customHeight: 297, // Default A4 height in mm
  });

  // // Local state for print/email dialogs
  // const [printDialog, setPrintDialog] = useState({
  //   open: false,
  //   order: null,
  //   type: "print",
  // });

  const [printDialog, setPrintDialog] = useState({
    open: false,
    order: null,
    type: "print",
    showOptions: false, // Add this flag
  });
  const [emailDialog, setEmailDialog] = useState({
    open: false,
    order: null,
    email: "",
  });

  // UPDATED: Date range state now synced with Redux
  const [selectedDateRange, setSelectedDateRange] = useState(null);

  // API data state (not stored in Redux for this component)
  const [ordersData, setOrdersData] = useState<OrderData[]>([]);
  const [consolidatedData, setConsolidatedData] = useState<
    ConsolidatedProductionItem[]
  >([]);
  const [consolidatedColumns, setConsolidatedColumns] = useState<string[]>([]);
  const [ordersTotal, setOrdersTotal] = useState<number>(0);
  const [companiesData, setCompaniesData] = useState<Company[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  // NEW: Initialize local date range from Redux on component mount
  useEffect(() => {
    console.log(
      "🏪 StoreSummaryProduction - Initializing from Redux date range:",
      {
        reduxDateRange,
        hasReduxDateRange,
        startDate: reduxDateRange?.startDate,
        endDate: reduxDateRange?.endDate,
      }
    );

    if (
      hasReduxDateRange &&
      reduxDateRange.startDate &&
      reduxDateRange.endDate
    ) {
      const startDate = parseReduxDate(reduxDateRange.startDate);
      const endDate = parseReduxDate(reduxDateRange.endDate);

      if (startDate && endDate) {
        setSelectedDateRange({
          startDate,
          endDate,
          key: "selection",
        });
        console.log("✅ Initialized date range from Redux:", {
          startDate,
          endDate,
        });
      }
    }
  }, [reduxDateRange, hasReduxDateRange]);

  // Fetch companies data for display names
  // Add this import at the top of your file

  // Fetch companies data for display names
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await apiClient.get("/company-locations/all");

        if (!Array.isArray(response.data)) {
          throw new Error(
            "Invalid response format: expected array of companies"
          );
        }

        const validCompanies = response.data.filter((company: Company) => {
          return (
            company.company_id &&
            company.company_name &&
            Array.isArray(company.locations)
          );
        });

        if (validCompanies.length === 0) {
          throw new Error("No valid companies found in response");
        }

        setCompaniesData(validCompanies);
      } catch (err) {
        console.error("Error fetching companies:", err);
      }
    };
    fetchCompanies();
  }, []);

  // NEW: Auto-fetch data whenever company, location, or date range changes
  useEffect(() => {
    // Add defensive checks for undefined/null values
    const companies = selectedCompanies || [];
    const locations = selectedLocations || [];

    const shouldFetchOrders = companies.length > 0 && locations.length > 0;
    const shouldFetchConsolidated = companies.length > 0; // Only needs company

    if (shouldFetchOrders || shouldFetchConsolidated) {
      console.log("🔄 Auto-fetching data due to filter/date range change:", {
        companies: companies,
        locations: locations,
        dateRange: selectedDateRange,
        hasDateRange: !!selectedDateRange,
        willFetchOrders: shouldFetchOrders,
        willFetchConsolidated: shouldFetchConsolidated,
      });

      const fetchData = async () => {
        try {
          setLocalError(null);
          const companyId = companies[0];

          const fetchPromises = [];

          // Always fetch consolidated data if we have a company
          if (shouldFetchConsolidated) {
            fetchPromises.push(fetchConsolidatedData(companyId));
          }

          // Only fetch orders if we have both company and location
          if (shouldFetchOrders) {
            // FIXED: Pass entire locations array instead of just first location
            fetchPromises.push(fetchOrdersData(companyId, locations));
          } else {
            // Clear orders data if no location selected
            setOrdersData([]);
            setOrdersTotal(0);
          }

          await Promise.all(fetchPromises);
          setDataLoaded(true);
        } catch (err) {
          console.error("❌ Error auto-fetching data:", err);
          setLocalError("Failed to fetch data. Please try again.");
        }
      };

      fetchData();
    } else {
      console.log("🔍 Not fetching data - missing required filters:", {
        hasCompany: companies.length > 0,
        hasLocation: locations.length > 0,
        companiesCount: companies.length,
        locationsCount: locations.length,
      });

      // Clear all data if no company selected
      if (companies.length === 0) {
        setOrdersData([]);
        setConsolidatedData([]);
        setConsolidatedColumns([]);
        setOrdersTotal(0);
        setDataLoaded(false);
      }
    }
  }, [selectedCompanies, selectedLocations, selectedDateRange]); // Watch for changes in any of these

  // Initialize with Redux values on component mount
  useEffect(() => {
    console.log(
      "StoreSummaryProduction - Component mounted with Redux state:",
      {
        selectedCompanies,
        selectedLocations,
        lastAppliedFilters,
      }
    );
  }, []); // Only run on mount

  // Get available locations based on selected companies
  const getAvailableLocations = () => {
    // Add defensive checks
    if (
      !selectedCompanies ||
      selectedCompanies.length === 0 ||
      !companiesData ||
      companiesData.length === 0
    ) {
      return [];
    }

    try {
      const selectedCompanyIds = selectedCompanies.map((id) => parseInt(id));
      return companiesData
        .filter(
          (company) =>
            company && selectedCompanyIds.includes(company.company_id)
        )
        .flatMap((company) => company.locations || []);
    } catch (error) {
      console.error("Error getting available locations:", error);
      return [];
    }
  };

  // Get company and location names for display
  const getCompanyName = (companyId: string) => {
    if (!companyId || !companiesData || companiesData.length === 0) {
      return `Company ${companyId || "Unknown"}`;
    }
    try {
      const company = companiesData.find(
        (c) => c && c.company_id && c.company_id.toString() === companyId
      );
      return company?.company_name || `Company ${companyId}`;
    } catch (error) {
      console.error("Error getting company name:", error);
      return `Company ${companyId}`;
    }
  };

  const getLocationName = (companyId: string, locationId: string) => {
    if (
      !companyId ||
      !locationId ||
      !companiesData ||
      companiesData.length === 0
    ) {
      return `Location ${locationId || "Unknown"}`;
    }
    try {
      const company = companiesData.find(
        (c) => c && c.company_id && c.company_id.toString() === companyId
      );
      const location = company?.locations?.find(
        (l) => l && l.location_id && l.location_id.toString() === locationId
      );
      return location?.location_name || `Location ${locationId}`;
    } catch (error) {
      console.error("Error getting location name:", error);
      return `Location ${locationId}`;
    }
  };

  // NEW: Helper function to get multiple location names
  const getMultipleLocationNames = (
    companyId: string,
    locationIds: string[]
  ) => {
    if (
      !companyId ||
      !locationIds ||
      locationIds.length === 0 ||
      !companiesData ||
      companiesData.length === 0
    ) {
      return "No locations selected";
    }

    if (locationIds.length === 1) {
      return getLocationName(companyId, locationIds[0]);
    }

    try {
      const company = companiesData.find(
        (c) => c && c.company_id && c.company_id.toString() === companyId
      );
      const locationNames = locationIds
        .map((locationId) => {
          const location = company?.locations?.find(
            (l) => l && l.location_id && l.location_id.toString() === locationId
          );
          return location?.location_name || `Location ${locationId}`;
        })
        .filter(Boolean);

      if (locationNames.length <= 2) {
        return locationNames.join(" & ");
      } else {
        return `${locationNames[0]} & ${locationNames.length - 1} others`;
      }
    } catch (error) {
      console.error("Error getting multiple location names:", error);
      return `${locationIds.length} locations selected`;
    }
  };

  // UPDATED: Fetch orders data with multiple locations support and URL logging
  const fetchOrdersData = async (companyId: string, locationIds: string[]) => {
    try {
      setLocalError(null);

      // Build URL with multiple location IDs
      const locationIdsStr = locationIds.join(",");
      let url = `${API_URL_Local}/api/storeorders/allordersinvoices/${companyId}/${locationIdsStr}`;
      const urlParams = new URLSearchParams();

      if (selectedDateRange) {
        const startDate = formatDateForAPI(selectedDateRange.startDate);
        const endDate = formatDateForAPI(selectedDateRange.endDate);
        urlParams.append("startDate", startDate);
        urlParams.append("endDate", endDate);
      }

      if (urlParams.toString()) {
        url += `?${urlParams.toString()}`;
      }

      console.log("📤 Fetching Orders Data - URL:", url);
      console.log("📤 Orders API Call Details:", {
        companyId,
        locationIds, // Now shows array of location IDs
        locationCount: locationIds.length,
        dateRange: selectedDateRange
          ? {
              startDate: formatDateForAPI(selectedDateRange.startDate),
              endDate: formatDateForAPI(selectedDateRange.endDate),
            }
          : null,
        fullUrl: url,
      });

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: OrdersApiResponse = await response.json();
      setOrdersData(result.data);
      setOrdersTotal(result.total);

      console.log("✅ Orders data fetched successfully:", {
        count: result.data.length,
        total: result.total,
        locationCount: locationIds.length,
        dateFiltered: !!selectedDateRange,
        url: url,
      });
    } catch (err) {
      console.error("❌ Error fetching orders:", err);
      setLocalError(
        err instanceof Error ? err.message : "Failed to fetch orders data"
      );
      setOrdersData([]);
      setOrdersTotal(0);
    }
  };

  // UPDATED: Fetch consolidated production data with date range support and URL logging
  const fetchConsolidatedData = async (companyId: string) => {
    try {
      setLocalError(null);

      // Build URL with date range parameters if available
      let url = `${API_URL_Local}/api/storeorders/consolidatedproduction/${companyId}`;
      const urlParams = new URLSearchParams();

      if (selectedDateRange) {
        const startDate = formatDateForAPI(selectedDateRange.startDate);
        const endDate = formatDateForAPI(selectedDateRange.endDate);
        urlParams.append("startDate", startDate);
        urlParams.append("endDate", endDate);
      }

      if (urlParams.toString()) {
        url += `?${urlParams.toString()}`;
      }

      console.log("📤 Fetching Consolidated Data - URL:", url);
      console.log("📤 Consolidated API Call Details:", {
        companyId,
        dateRange: selectedDateRange
          ? {
              startDate: formatDateForAPI(selectedDateRange.startDate),
              endDate: formatDateForAPI(selectedDateRange.endDate),
            }
          : null,
        fullUrl: url,
      });

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ConsolidatedProductionResponse = await response.json();
      setConsolidatedData(result.data);
      setConsolidatedColumns(result.columns);

      console.log("✅ Consolidated data fetched successfully:", {
        itemCount: result.data.length,
        columnCount: result.columns.length,
        dateFiltered: !!selectedDateRange,
        url: url,
      });
    } catch (err) {
      console.error("❌ Error fetching consolidated data:", err);
      setLocalError(
        err instanceof Error
          ? err.message
          : "Failed to fetch consolidated production data"
      );
      setConsolidatedData([]);
      setConsolidatedColumns([]);
    }
  };

  // Event handlers for filters - UPDATED to only update state, useEffect handles fetching
  const handleLocationChange = (values: string[]) => {
    // Add defensive checks
    if (!values) {
      console.warn("⚠️ Location change called with undefined values");
      return;
    }

    // Only allow locations that are available for selected companies
    const availableLocations = getAvailableLocations();
    const availableLocationIds = availableLocations
      .map((loc) => loc?.location_id?.toString())
      .filter(Boolean);
    const validValues = values.filter(
      (value) => value && availableLocationIds.includes(value)
    );

    console.log("📍 Location changed:", {
      from: selectedLocations || [],
      to: validValues,
      available: availableLocationIds,
      receivedValues: values,
    });

    dispatch(setSelectedLocations(validValues));
    // Data fetching will be handled by useEffect
  };

  const handleCompanyChange = (values: string[]) => {
    // Add defensive checks
    if (!values) {
      console.warn("⚠️ Company change called with undefined values");
      return;
    }

    console.log("🏭 Company changed:", {
      from: selectedCompanies || [],
      to: values,
    });

    dispatch(setSelectedCompanies(values));
    // Clear location selection when company changes
    dispatch(setSelectedLocations([]));
    // Clear data when company changes
    setOrdersData([]);
    setConsolidatedData([]);
    setConsolidatedColumns([]);
    setOrdersTotal(0);
    setDataLoaded(false);
    // Data fetching will be handled by useEffect when location is selected
  };

  // UPDATED: Date range handler with Redux integration - simplified
  const handleDateRangeSelect = (range) => {
    console.log("📅 Date range selected:", range);
    setSelectedDateRange(range);

    if (range) {
      // Update Redux store
      dispatch(
        setStoreSummaryProductionDateRange({
          startDate: range.startDate,
          endDate: range.endDate,
        })
      );

      console.log("✅ Date range saved to Redux:", {
        startDate: range.startDate,
        endDate: range.endDate,
      });
    } else {
      // Clear Redux store
      dispatch(clearStoreSummaryProductionDateRange());
      console.log("🧹 Date range cleared from Redux");
    }
    // Data fetching will be handled by useEffect
  };

  // const handlePrintOrder = (order: OrderData) => {
  //   setPrintDialog({ open: true, order, type: "print" });
  // };

  const handlePrintOrder = (order: OrderData) => {
    setPrintDialog({ open: true, order, type: "print", showOptions: true });
  };
  // Helper function for CSS styling based on print options
  const getPageCSS = (
    pageLayout,
    pageSize,
    orientation,
    customWidth,
    customHeight
  ) => {
    const sizes = {
      A4: orientation === "landscape" ? "A4 landscape" : "A4 portrait",
      A3: orientation === "landscape" ? "A3 landscape" : "A3 portrait",
      Letter:
        orientation === "landscape" ? "Letter landscape" : "Letter portrait",
      Custom:
        orientation === "landscape"
          ? `${customHeight}mm ${customWidth}mm`
          : `${customWidth}mm ${customHeight}mm`,
    };

    const margins = {
      single: "8mm",
      double: "15mm",
      auto: "10mm",
    };

    const fontSizes = {
      single: { body: "8px", table: "7px", header: "16px" },
      double: { body: "10px", table: "9px", header: "18px" },
      auto: { body: "9px", table: "8px", header: "17px" },
    };

    const heights = {
      single: "height: 100vh; overflow: hidden;",
      double: "height: auto; page-break-after: auto;",
      auto: "height: auto; page-break-inside: avoid;",
    };

    return {
      pageSize: sizes[pageSize],
      margin: margins[pageLayout],
      fontSize: fontSizes[pageLayout],
      height: heights[pageLayout],
    };
  };

  // New direct print function (no new window)
  const printDirectly = (htmlContent) => {
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.left = "-999px";
    iframe.style.top = "-999px";

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(htmlContent);
    doc.close();

    iframe.onload = () => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();

      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    };
  };

  // Handler for consolidated print
  const handleConfirmConsolidatedPrint = () => {
    const printContent = generateConsolidatedReport(printOptions);
    printDirectly(printContent);
    setPrintDialog({
      open: false,
      order: null,
      type: "print",
      showOptions: false,
    });
  };

  const handleEmailOrder = (order: OrderData) => {
    setEmailDialog({ open: true, order, email: "" });
  };

  const handleSendEmail = async () => {
    const { order, email } = emailDialog;

    if (!email) {
      alert("Please enter an email address");
      return;
    }

    try {
      // Generate the order report HTML
      const orderReport = generateOrderReport(order);

      // Email configuration
      const emailData = {
        to: email,
        from: "system@company.com",
        subject: `Order Report - Order #${order.order_id} - ${getCompanyName(
          selectedCompanies[0]
        )}`,
        html: orderReport,
        text: `Order Report for Order #${
          order.order_id
        }\nOrder Date: ${new Date(
          order.created_at
        ).toLocaleDateString()}\nTotal Items: ${
          order.items_count
        }\nTotal Amount: ${order.total_amount.toFixed(2)}`,
      };

      console.log("Sending email with data:", emailData);
      alert(`Email sent successfully to ${email}`);
      setEmailDialog({ open: false, order: null, email: "" });
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Failed to send email. Please try again.");
    }
  };

  const handleConfirmPrintEmail = () => {
    const { order, type } = printDialog;
    if (type === "print") {
      const printContent = generateOrderReport(order, printOptions);
      printDirectly(printContent);
    }
    setPrintDialog({
      open: false,
      order: null,
      type: "print",
      showOptions: false,
    });
  };
  // const generateOrderReport = (order: OrderData) => {
  //   const currentDate = new Date().toLocaleString("en-GB", {
  //     day: "2-digit",
  //     month: "2-digit",
  //     year: "numeric",
  //     hour: "2-digit",
  //     minute: "2-digit",
  //     second: "2-digit",
  //   });

  //   const dateRangeText = selectedDateRange
  //     ? `${selectedDateRange.startDate.toLocaleDateString()} to ${selectedDateRange.endDate.toLocaleDateString()}`
  //     : "All time";

  //   const companyName =
  //     selectedCompanies.length > 0
  //       ? getCompanyName(selectedCompanies[0])
  //       : "Selected Company";
  //   // UPDATED: Handle multiple locations in report
  //   const locationText =
  //     selectedLocations.length > 0 && selectedCompanies.length > 0
  //       ? getMultipleLocationNames(selectedCompanies[0], selectedLocations)
  //       : "Selected Locations";

  //   return `
  //     <!DOCTYPE html>
  //     <html>
  //     <head>
  //       <title>Order Report - Order #${order.order_id}</title>
  //       <style>
  //         body {
  //           font-family: Arial, sans-serif;
  //           margin: 40px;
  //           color: #333;
  //         }
  //         .header {
  //           text-align: center;
  //           margin-bottom: 40px;
  //         }
  //         .company-name {
  //           font-size: 24px;
  //           font-weight: bold;
  //           margin-bottom: 5px;
  //         }
  //         .location {
  //           font-size: 16px;
  //           color: #666;
  //           margin-bottom: 10px;
  //         }
  //         .date-range {
  //           font-size: 14px;
  //           color: #888;
  //           margin-bottom: 30px;
  //         }
  //         .order-summary {
  //           background: #f8f9fa;
  //           padding: 20px;
  //           border-radius: 8px;
  //           margin-bottom: 30px;
  //         }
  //         .order-summary div {
  //           margin-bottom: 8px;
  //           font-size: 14px;
  //         }
  //         .order-summary strong {
  //           font-weight: 600;
  //         }
  //         .footer {
  //           text-align: center;
  //           margin-top: 40px;
  //           font-size: 12px;
  //           color: #666;
  //         }
  //         .summary-box {
  //           background: #e3f2fd;
  //           padding: 20px;
  //           border-radius: 8px;
  //           margin-bottom: 20px;
  //         }
  //         .summary-item {
  //           display: flex;
  //           justify-content: space-between;
  //           margin-bottom: 10px;
  //           font-size: 16px;
  //         }
  //         .summary-value {
  //           font-weight: bold;
  //           color: #1976d2;
  //         }
  //       </style>
  //     </head>
  //     <body>
  //       <div class="header">
  //         <div class="company-name">${companyName}</div>
  //         <div class="location">${locationText}</div>
  //         <div class="date-range">Report Period: ${dateRangeText}</div>
  //       </div>

  //       <div class="order-summary">
  //         <div><strong>Order ID:</strong> ${order.order_id}</div>
  //         <div>
  //           <strong>Order Date:</strong>
  //           ${new Date(order.created_at).toLocaleString("en-US", {
  //             month: "numeric",
  //             day: "numeric",
  //             year: "numeric",
  //             hour: "2-digit",
  //             minute: "2-digit",
  //             hour12: true,
  //           })}
  //         </div>
  //         <div><strong>Items Count:</strong> ${order.items_count}</div>
  //         <div><strong>Total Quantity:</strong> ${order.total_quantity}</div>
  //         <div><strong>Total Amount:</strong> ${order.total_amount.toFixed(
  //           2
  //         )}</div>
  //       </div>

  //       <div class="footer">
  //         Generated on ${currentDate} | ${companyName} Order Management System
  //       </div>
  //     </body>
  //     </html>
  //   `;
  // };

  const generateOrderReport = (order, options = printOptions) => {
    const css = getPageCSS(
      options.pageLayout,
      options.pageSize,
      options.orientation,
      options.customWidth,
      options.customHeight
    );
    const currentDate = new Date().toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const dateRangeText = selectedDateRange
      ? `${selectedDateRange.startDate.toLocaleDateString()} to ${selectedDateRange.endDate.toLocaleDateString()}`
      : "All time";

    const companyName =
      selectedCompanies.length > 0
        ? getCompanyName(selectedCompanies[0])
        : "Selected Company";

    const locationText =
      selectedLocations.length > 0 && selectedCompanies.length > 0
        ? getMultipleLocationNames(selectedCompanies[0], selectedLocations)
        : "Selected Locations";

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Order Report - Order #${order.order_id}</title>
      <style>
        @page {
          size: ${css.pageSize};
          margin: ${css.margin};
        }
        
        * {
          box-sizing: border-box;
        }
        
        body { 
          font-family: Arial, sans-serif; 
          margin: 0;
          padding: 0;
          color: #333;
          font-size: ${css.fontSize.body};
          line-height: 1.4;
          ${css.height}
        }
        
        .page-container {
          ${
            options.pageLayout === "single"
              ? "height: 100vh; display: flex; flex-direction: column; justify-content: space-between;"
              : ""
          }
          padding: 10px;
        }
        
        .header { 
          text-align: center; 
          margin-bottom: ${options.pageLayout === "single" ? "20px" : "30px"};
          ${options.pageLayout === "single" ? "flex-shrink: 0;" : ""}
        }
        
        .company-name { 
          font-size: ${css.fontSize.header}; 
          font-weight: bold; 
          margin-bottom: 5px; 
        }
        
        .location { 
          font-size: ${parseInt(css.fontSize.body) + 2}px; 
          color: #666; 
          margin-bottom: 5px; 
        }
        
        .date-range { 
          font-size: ${css.fontSize.body}; 
          color: #888; 
          margin-bottom: 15px; 
        }
        
        .content {
          ${
            options.pageLayout === "single"
              ? "flex: 1; display: flex; flex-direction: column; justify-content: center;"
              : ""
          }
        }
        
        .order-summary { 
          background: #f8f9fa; 
          padding: ${options.pageLayout === "double" ? "20px" : "15px"}; 
          border-radius: 8px; 
          margin-bottom: 20px;
          border: 1px solid #dee2e6;
          ${options.pageLayout === "double" ? "page-break-inside: avoid;" : ""}
        }
        
        .order-summary div { 
          margin-bottom: ${options.pageLayout === "double" ? "8px" : "6px"}; 
          font-size: ${parseInt(css.fontSize.body) + 1}px; 
        }
        
        .order-summary strong { 
          font-weight: 600; 
          color: #2c3e50;
        }
        
        .summary-box {
          background: #e3f2fd;
          padding: ${options.pageLayout === "double" ? "20px" : "15px"};
          border-radius: 8px;
          margin-bottom: 15px;
          border: 1px solid #bbdefb;
          ${options.pageLayout === "double" ? "page-break-inside: avoid;" : ""}
        }
        
        .summary-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: ${parseInt(css.fontSize.body) + 2}px;
        }
        
        .summary-value {
          font-weight: bold;
          color: #1976d2;
        }
        
        .footer { 
          text-align: center; 
          font-size: ${parseInt(css.fontSize.body) - 2}px; 
          color: #666; 
          ${options.pageLayout === "single" ? "flex-shrink: 0;" : ""}
          margin-top: 20px;
          padding-top: 10px;
          border-top: 1px solid #eee;
        }
        
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      <div class="page-container">
        <div class="header">
          <div class="company-name">${companyName}</div>
          <div class="location">${locationText}</div>
          <div class="date-range">Report Period: ${dateRangeText}</div>
        </div>
        
        <div class="content">
          <div class="summary-box">
            <h3 style="margin: 0 0 10px 0; color: #1976d2; font-size: ${
              parseInt(css.fontSize.header) - 2
            }px;">Order Summary</h3>
            <div class="summary-item">
              <span>Order ID:</span>
              <span class="summary-value">#${order.order_id}</span>
            </div>
            <div class="summary-item">
              <span>Order Date:</span>
              <span class="summary-value">${new Date(
                order.created_at
              ).toLocaleString("en-US", {
                month: "numeric",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}</span>
            </div>
            <div class="summary-item">
              <span>Items Count:</span>
              <span class="summary-value">${order.items_count}</span>
            </div>
            <div class="summary-item">
              <span>Total Quantity:</span>
              <span class="summary-value">${order.total_quantity}</span>
            </div>
            <div class="summary-item">
              <span>Total Amount:</span>
              <span class="summary-value">$${order.total_amount.toFixed(
                2
              )}</span>
            </div>
          </div>
          
          <div class="order-summary">
            <h4 style="margin: 0 0 10px 0; color: #2c3e50;">Order Details</h4>
            <div><strong>Order ID:</strong> ${order.order_id}</div>
            <div>
              <strong>Order Date:</strong>
              ${new Date(order.created_at).toLocaleString("en-US", {
                month: "numeric",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </div>
            <div><strong>Items Count:</strong> ${order.items_count}</div>
            <div><strong>Total Quantity:</strong> ${order.total_quantity}</div>
            <div><strong>Total Amount:</strong> $${order.total_amount.toFixed(
              2
            )}</div>
          </div>
        </div>
        
        <div class="footer">
          Generated on ${currentDate} | ${companyName} Order Management System
        </div>
      </div>
    </body>
    </html>
  `;
  };

  const handlePrintConsolidated = () => {
    setPrintDialog({
      open: true,
      order: null,
      type: "consolidated",
      showOptions: true,
    });
  };

  const generateConsolidatedReport = (options = printOptions) => {
    const css = getPageCSS(
      options.pageLayout,
      options.pageSize,
      options.orientation,
      options.customWidth,
      options.customHeight
    );
    const currentDate = new Date().toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const dateRangeText = selectedDateRange
      ? `${selectedDateRange.startDate.toLocaleDateString()} to ${selectedDateRange.endDate.toLocaleDateString()}`
      : "All time";

    const companyName =
      selectedCompanies.length > 0
        ? getCompanyName(selectedCompanies[0])
        : "Selected Company";

    // Generate table HTML with responsive sizing
    const generateTableHTML = () => {
      if (consolidatedColumns.length === 0 || consolidatedData.length === 0) {
        return "<p>No data available to display.</p>";
      }

      // Calculate column width based on number of columns
      const columnWidth = Math.max(
        8,
        Math.floor(90 / consolidatedColumns.length)
      );

      let tableHTML = `
      <table>
        <thead>
          <tr>
            ${consolidatedColumns
              .map(
                (column) => `
              <th class="${
                column === "Total Required" ? "total-column" : ""
              }" style="width: ${columnWidth}%">${column}</th>
            `
              )
              .join("")}
          </tr>
        </thead>
        <tbody>
          ${consolidatedData
            .map(
              (item) => `
            <tr>
              ${consolidatedColumns
                .map((column) => {
                  const value = item[column];
                  const isTotal = column === "Total Required";
                  const isNumeric =
                    typeof value === "number" &&
                    column !== "Item" &&
                    column !== "Unit";
                  const shouldHighlight = isNumeric && value > 0;

                  return `<td class="${isTotal ? "total-column" : ""} ${
                    shouldHighlight ? "highlight" : ""
                  }">${value}</td>`;
                })
                .join("")}
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;

      return tableHTML;
    };

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Consolidated Production Requirements - ${companyName}</title>
      <style>
        @page {
          size: A4 landscape;
          margin: 10mm;
        }
        
        * {
          box-sizing: border-box;
        }
        
        body { 
          font-family: Arial, sans-serif; 
          margin: 0;
          padding: 0;
          color: #333;
          font-size: 10px;
          line-height: 1.3;
          height: 100vh;
          overflow: hidden;
        }
        
        .page-container {
          height: 100vh;
          display: flex;
          flex-direction: column;
          padding: 5px;
        }
        
        .header { 
          text-align: center; 
          margin-bottom: 15px;
          flex-shrink: 0;
        }
        
        .company-name { 
          font-size: 18px; 
          font-weight: bold; 
          margin-bottom: 3px; 
        }
        
        .report-title { 
          font-size: 16px; 
          font-weight: 600; 
          margin-bottom: 3px; 
        }
        
        .date-range { 
          font-size: 11px; 
          color: #666; 
          margin-bottom: 10px; 
        }
        
        .content {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        
        .summary-section {
          background: #f8f9fa;
          padding: 10px;
          border-radius: 5px;
          margin-bottom: 10px;
          font-size: 9px;
          flex-shrink: 0;
          border: 1px solid #dee2e6;
        }
        
        .summary-section h3 {
          margin: 0 0 8px 0;
          color: #2c3e50;
          font-size: 12px;
        }
        
        .date-filter {
          background: #e3f2fd;
          padding: 8px;
          border-radius: 5px;
          margin-bottom: 10px;
          border-left: 3px solid #1976d2;
          font-size: 9px;
          flex-shrink: 0;
        }
        
        .table-section {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        
        .table-title {
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #2c3e50;
          flex-shrink: 0;
        }
        
        table { 
          width: 100%; 
          border-collapse: collapse; 
          font-size: 8px;
          flex: 1;
          height: 100%;
        }
        
        th, td { 
          border: 1px solid #ddd; 
          padding: 3px; 
          text-align: left; 
          vertical-align: top;
        }
        
        th { 
          background-color: #f5f5f5; 
          font-weight: 600; 
          font-size: 8px;
          position: sticky;
          top: 0;
        }
        
        .total-column { 
          font-weight: bold; 
          background-color: #e8f5e8 !important; 
        }
        
        .highlight { 
          background-color: #fff3cd !important; 
          font-weight: 600; 
        }
        
        .footer { 
          text-align: center; 
          margin-top: 10px; 
          font-size: 8px; 
          color: #666; 
          flex-shrink: 0;
          padding-top: 5px;
          border-top: 1px solid #eee;
        }
        
        @media print {
          @page {
            size: A4 landscape;
            margin: 8mm;
          }
          
          body {
            font-size: 8px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .page-container {
            height: 100vh;
            page-break-inside: avoid;
            page-break-after: avoid;
          }
          
          table {
            font-size: 7px;
            page-break-inside: auto;
          }
          
          th, td {
            padding: 2px;
          }
          
          .summary-section {
            page-break-inside: avoid;
            font-size: 8px;
          }
          
          .date-filter {
            page-break-inside: avoid;
            font-size: 8px;
          }
        }
      </style>
    </head>
    <body>
      <div class="page-container">
        <div class="header">
          <div class="company-name">${companyName}</div>
          <div class="report-title">Consolidated Production Requirements</div>
          <div class="date-range">Total quantities needed for production • ${dateRangeText}</div>
        </div>
        
        <div class="content">
          ${
            selectedDateRange
              ? `
          <div class="date-filter">
            <strong>📅 Date Filter Applied:</strong> This report shows production requirements for the selected period: ${dateRangeText}
          </div>
          `
              : ""
          }
          
          <div class="summary-section">
            <h3>Production Summary</h3>
            <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
              <span><strong>Total Unique Items:</strong> ${
                consolidatedData.length
              }</span>
              <span><strong>Total Quantity Required:</strong> ${consolidatedData.reduce(
                (sum, item) => sum + (item["Total Required"] || 0),
                0
              )} units</span>
              <span><strong>Report Period:</strong> ${dateRangeText}</span>
            </div>
          </div>

          <div class="table-section">
            <div class="table-title">Production Requirements by Location</div>
            ${generateTableHTML()}
          </div>
        </div>
        
        <div class="footer">
          Generated on ${currentDate} | ${companyName} Production Planning System
        </div>
      </div>
    </body>
    </html>
  `;
  };

  // Get date range display text
  const getDateRangeText = () => {
    if (selectedDateRange) {
      return `${selectedDateRange.startDate.toLocaleDateString()} to ${selectedDateRange.endDate.toLocaleDateString()}`;
    }
    return "All time";
  };

  // Convert current date range to format expected by DateRangeSelectorButton
  const getCurrentDateRangeForButton = () => {
    if (selectedDateRange) {
      return {
        startDate: selectedDateRange.startDate,
        endDate: selectedDateRange.endDate,
      };
    }
    return null;
  };

  console.log("ordersData:", ordersData);
  // Combined error from Redux and local state
  const displayError = error || localError;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header Section with Filters and Date Range */}
      <Box sx={{ mb: 3 }}>
        {/* Title Section */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, color: "primary.main", mb: 1 }}
            >
              Store Summary & Production
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Comprehensive production planning and order management system
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <DateRangeSelectorButton
              onDateRangeSelect={handleDateRangeSelect}
              currentRange={getCurrentDateRangeForButton()}
            />
          </Box>
        </Box>

        {/* Error Display */}
        {displayError && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            onClose={() => {
              setLocalError(null);
              dispatch(clearError());
            }}
          >
            {displayError}
          </Alert>
        )}

        {/* Filters Section with Company and Location Dropdowns */}
        <Box
          sx={{
            mb: 3,
            p: 3,
            border: "1px solid #e0e0e0",
            borderRadius: 2,
            backgroundColor: "#ffffff",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Filters
            </Typography>
            {lastAppliedFilters.companies.length > 0 && (
              <Chip
                label="Previously loaded data available"
                size="small"
                variant="outlined"
                color="info"
              />
            )}
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 3,
              mb: 3,
              flexDirection: { xs: "column", md: "row" },
              alignItems: { xs: "stretch", md: "flex-start" },
            }}
          >
            {/* Companies Filter */}
            <FormControl
              sx={{
                minWidth: 200,
                flex: 1,
              }}
            >
              <InputLabel>Companies</InputLabel>

              <Select
                value={selectedCompanies.length > 0 ? selectedCompanies[0] : ""}
                onChange={(event) => {
                  const value = event.target.value;
                  handleCompanyChange([value]); // Wrap in array since your handler expects array
                }}
                displayEmpty
                label="Companies"
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                    },
                  },
                }}
              >
                <MenuItem disabled value="">
                  <em>Select Company</em>
                </MenuItem>
                {companiesData.map((company) => (
                  <MenuItem
                    key={company.company_id}
                    value={company.company_id.toString()}
                  >
                    {company.company_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Location Filter */}
            <FormControl
              sx={{
                minWidth: 200,
                flex: 1,
                opacity: selectedCompanies.length === 0 ? 0.6 : 1,
              }}
              disabled={selectedCompanies.length === 0}
            >
              <InputLabel>Location</InputLabel>
              <Select
                multiple
                value={selectedLocations}
                onChange={(event) => {
                  const value = event.target.value;
                  const newValues =
                    typeof value === "string" ? value.split(",") : value;
                  handleLocationChange(newValues);
                }}
                label="Location"
                renderValue={(selected) => {
                  if (selectedCompanies.length === 0) {
                    return "Select company first";
                  }
                  if (selected.length === 0) {
                    return getAvailableLocations().length > 0
                      ? "All locations"
                      : "No locations available";
                  }
                  if (selected.length === 1) {
                    const location = getAvailableLocations().find(
                      (opt) => opt.location_id.toString() === selected[0]
                    );
                    return location?.location_name || "Unknown";
                  }
                  return `${selected.length} locations selected`;
                }}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                    },
                  },
                }}
              >
                {selectedCompanies.length === 0 ? (
                  <MenuItem disabled>
                    <Typography
                      sx={{ fontStyle: "italic", color: "text.secondary" }}
                    >
                      Please select a company first to view locations
                    </Typography>
                  </MenuItem>
                ) : getAvailableLocations().length > 0 ? (
                  getAvailableLocations().map((location) => (
                    <MenuItem
                      key={location.location_id}
                      value={location.location_id.toString()}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          width: "100%",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedLocations.includes(
                            location.location_id.toString()
                          )}
                          onChange={() => {}}
                          style={{ marginRight: 8 }}
                        />
                        <Typography>{location.location_name}</Typography>
                      </Box>
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>
                    <Typography
                      sx={{ fontStyle: "italic", color: "text.secondary" }}
                    >
                      No locations available for selected companies
                    </Typography>
                  </MenuItem>
                )}
              </Select>
            </FormControl>
          </Box>

          {/* Selected Filters Display - UPDATED to show multiple locations */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {selectedCompanies && selectedCompanies.length > 0 && (
              <Chip
                label={`${
                  selectedCompanies.length === 1
                    ? getCompanyName(selectedCompanies[0])
                    : `${selectedCompanies.length} companies selected`
                }`}
                color="primary"
                variant="outlined"
                size="small"
              />
            )}
            {selectedLocations &&
              selectedLocations.length > 0 &&
              selectedCompanies &&
              selectedCompanies.length > 0 && (
                <Chip
                  label={getMultipleLocationNames(
                    selectedCompanies[0],
                    selectedLocations
                  )}
                  color="secondary"
                  variant="outlined"
                  size="small"
                />
              )}
            {selectedDateRange && (
              <Chip
                label={`📅 ${selectedDateRange.startDate?.toLocaleDateString()} - ${selectedDateRange.endDate?.toLocaleDateString()}`}
                color="primary"
                size="small"
                onDelete={() => handleDateRangeSelect(null)}
                sx={{ fontSize: "0.75rem" }}
              />
            )}
            {hasReduxDateRange && !selectedDateRange && (
              <Chip
                label="📅 Date range from Redux"
                color="info"
                size="small"
                variant="outlined"
                sx={{ fontSize: "0.75rem" }}
              />
            )}
            {loading && (
              <Chip
                label="🔄 Loading data..."
                color="info"
                size="small"
                variant="outlined"
                sx={{ fontSize: "0.75rem" }}
              />
            )}
          </Box>
        </Box>
      </Box>

      {/* Loading State */}
      {loading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            py: 4,
          }}
        >
          <CircularProgress sx={{ mr: 2 }} />
          <Typography>Loading data...</Typography>
        </Box>
      )}

      {/* Empty State - Updated conditions */}
      {!loading &&
        ((selectedCompanies && selectedCompanies.length === 0) ||
          (selectedCompanies &&
            selectedCompanies.length > 0 &&
            selectedLocations &&
            selectedLocations.length > 0 &&
            (!ordersData || ordersData.length === 0) &&
            (!consolidatedData || consolidatedData.length === 0) &&
            dataLoaded)) && (
          <Card sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent sx={{ textAlign: "center", py: 6 }}>
              <DescriptionIcon
                sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
              />
              <Typography variant="h6" sx={{ mb: 1 }}>
                {selectedCompanies && selectedCompanies.length === 0
                  ? "Select a Company"
                  : "No Data Available"}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {selectedCompanies && selectedCompanies.length === 0
                  ? "Please select a company to view production requirements and order data."
                  : "No data found for the selected filters. Try adjusting your date range or filters."}
              </Typography>
            </CardContent>
          </Card>
        )}

      {/* All Orders/Invoices by Location - Only show when both company and location selected */}
      {!loading &&
        ordersData &&
        ordersData.length > 0 &&
        selectedCompanies &&
        selectedCompanies.length > 0 &&
        selectedLocations &&
        selectedLocations.length > 0 && (
          <Card sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <DescriptionIcon color="primary" />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      All Orders/Invoices by Location
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Complete listing of all orders with timestamps by store
                      location ({getDateRangeText()})
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {selectedDateRange && (
                    <Chip
                      label="Date Filtered"
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  )}
                  <Chip
                    label={`${ordersData.length} orders found`}
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              </Box>

              {/* Location Orders - UPDATED to show multiple locations */}
              <Box sx={{ mb: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                    p: 2,
                    backgroundColor: "#f8f9fa",
                    borderRadius: 1,
                  }}
                >
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {selectedLocations.length > 0 &&
                      selectedCompanies.length > 0
                        ? getMultipleLocationNames(
                            selectedCompanies[0],
                            selectedLocations
                          )
                        : "Selected Locations"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedCompanies.length > 0
                        ? getCompanyName(selectedCompanies[0])
                        : "Selected Company"}{" "}
                      • {ordersData.length} orders • {getDateRangeText()}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Total: ${ordersTotal.toFixed(2)}
                    </Typography>
                    {selectedDateRange && (
                      <Typography variant="caption" color="text.secondary">
                        Filtered by date range
                      </Typography>
                    )}
                  </Box>
                </Box>

                <TableContainer
                  component={Paper}
                  variant="outlined"
                  sx={{
                    maxHeight: ordersData.length > 10 ? 700 : "auto",
                    overflowY: ordersData.length > 10 ? "auto" : "visible",
                  }}
                >
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                        <TableCell sx={{ fontWeight: 600 }}>Order ID</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          Order Date
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          Items Count
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          Total Quantity
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          Total Amount
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {ordersData.map((order) => (
                        <TableRow key={order.order_id} hover>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500 }}
                            >
                              #{order.order_id}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(
                                order.created_at.split(".")[0]
                              ).toLocaleString("en-US")}
                            </Typography>
                          </TableCell>
                          <TableCell>{order.items_count}</TableCell>
                          <TableCell>{order.total_quantity}</TableCell>
                          <TableCell>
                            <Typography
                              sx={{ color: "success.main", fontWeight: 600 }}
                            >
                              ${order.total_amount.toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", gap: 1 }}>
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
        )}

      {/* Consolidated Production Requirements - Show even without location */}
      {!loading &&
        consolidatedData &&
        consolidatedData.length > 0 &&
        selectedCompanies &&
        selectedCompanies.length > 0 && (
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Consolidated Production Requirements
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total quantities needed for production •{" "}
                    {getDateRangeText()}
                  </Typography>
                  {selectedDateRange && (
                    <Chip
                      label="📅 Date range applied to production calculations"
                      size="small"
                      variant="outlined"
                      color="primary"
                      sx={{ mt: 1 }}
                    />
                  )}
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<ScheduleIcon />}
                    onClick={() => setEmailSchedulerOpen(true)}
                    sx={{ mr: 1 }}
                  >
                    Email Scheduler
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<PrintIcon />}
                    onClick={handlePrintConsolidated}
                  >
                    Print
                  </Button>
                </Box>
              </Box>

              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{
                  maxHeight: consolidatedData.length > 10 ? 700 : "auto",
                  overflowY: consolidatedData.length > 10 ? "auto" : "visible",
                }}
              >
                <Table stickyHeader>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                      {consolidatedColumns.map((column, index) => (
                        <TableCell
                          key={index}
                          sx={{
                            fontWeight: 600,
                            backgroundColor:
                              column === "Total Required"
                                ? "#e8f5e8"
                                : "inherit",
                          }}
                        >
                          {column}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {consolidatedData.map((item, index) => (
                      <TableRow key={index} hover>
                        {consolidatedColumns.map((column, colIndex) => {
                          const value = item[column];
                          const isTotal = column === "Total Required";
                          const isNumeric =
                            typeof value === "number" &&
                            column !== "Item" &&
                            column !== "Unit";

                          return (
                            <TableCell
                              key={colIndex}
                              sx={{
                                fontWeight:
                                  column === "Item" || isTotal ? 600 : 400,
                                color: isTotal ? "success.main" : "inherit",
                                backgroundColor: isTotal
                                  ? "#e8f5e8"
                                  : isNumeric && value > 0
                                  ? "#fff3cd"
                                  : "inherit",
                              }}
                            >
                              {value}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}

      {/* Print Dialog */}
      {/* Enhanced Print Dialog with Options */}
      <Dialog
        open={printDialog.open}
        onClose={() =>
          setPrintDialog({
            open: false,
            order: null,
            type: "print",
            showOptions: false,
          })
        }
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h6">
              {printDialog.type === "consolidated"
                ? "Print Production Report"
                : "Print Order"}
            </Typography>
            <IconButton
              onClick={() =>
                setPrintDialog({
                  open: false,
                  order: null,
                  type: "print",
                  showOptions: false,
                })
              }
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {/* Print Options Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Print Options
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Page Layout */}
              <FormControl fullWidth>
                <InputLabel>Page Layout</InputLabel>
                <Select
                  value={printOptions.pageLayout}
                  label="Page Layout"
                  onChange={(e) =>
                    setPrintOptions((prev) => ({
                      ...prev,
                      pageLayout: e.target.value,
                    }))
                  }
                >
                  <MenuItem value="single">
                    <Box>
                      <Typography>Single Page</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Fit everything on one page (smaller fonts)
                      </Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="double">
                    <Box>
                      <Typography>Multiple Pages</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Allow content to span multiple pages (larger fonts)
                      </Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="auto">
                    <Box>
                      <Typography>Auto Layout</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Automatically adjust based on content
                      </Typography>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>

              {/* Page Size */}
              {/* Page Size */}
              <FormControl fullWidth>
                <InputLabel>Page Size</InputLabel>
                <Select
                  value={printOptions.pageSize}
                  label="Page Size"
                  onChange={(e) =>
                    setPrintOptions((prev) => ({
                      ...prev,
                      pageSize: e.target.value,
                    }))
                  }
                >
                  <MenuItem value="A4">A4 (210 × 297 mm)</MenuItem>
                  <MenuItem value="A3">A3 (297 × 420 mm)</MenuItem>
                  <MenuItem value="Letter">Letter (8.5 × 11 in)</MenuItem>
                  <MenuItem value="Custom">Custom Size</MenuItem>
                </Select>
              </FormControl>

              {/* Custom Size Fields - Show only when Custom is selected */}
              {printOptions.pageSize === "Custom" && (
                <Box sx={{ display: "flex", gap: 2 }}>
                  <TextField
                    label="Width (mm)"
                    type="number"
                    value={printOptions.customWidth}
                    onChange={(e) =>
                      setPrintOptions((prev) => ({
                        ...prev,
                        customWidth: Math.max(
                          50,
                          Math.min(500, parseInt(e.target.value) || 210)
                        ),
                      }))
                    }
                    inputProps={{ min: 50, max: 500 }}
                    helperText="50-500mm"
                    fullWidth
                  />
                  <TextField
                    label="Height (mm)"
                    type="number"
                    value={printOptions.customHeight}
                    onChange={(e) =>
                      setPrintOptions((prev) => ({
                        ...prev,
                        customHeight: Math.max(
                          50,
                          Math.min(500, parseInt(e.target.value) || 297)
                        ),
                      }))
                    }
                    inputProps={{ min: 0, max: 500 }}
                    helperText="50-500mm"
                    fullWidth
                  />
                </Box>
              )}
              {/* Orientation */}
              <FormControl fullWidth>
                <InputLabel>Orientation</InputLabel>
                <Select
                  value={printOptions.orientation}
                  label="Orientation"
                  onChange={(e) =>
                    setPrintOptions((prev) => ({
                      ...prev,
                      orientation: e.target.value,
                    }))
                  }
                >
                  <MenuItem value="portrait">
                    <Box>
                      <Typography>Portrait</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Recommended for orders
                      </Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="landscape">
                    <Box>
                      <Typography>Landscape</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Recommended for wide tables
                      </Typography>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Order/Report Details */}
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              {printDialog.type === "consolidated"
                ? "Report Details"
                : "Order Details"}
            </Typography>

            <Paper
              variant="outlined"
              sx={{ p: 2, mb: 2, backgroundColor: "#f8f9fa" }}
            >
              {printDialog.type === "consolidated" ? (
                <Box>
                  <Typography variant="body2">
                    <strong>Company:</strong>{" "}
                    {selectedCompanies.length > 0
                      ? getCompanyName(selectedCompanies[0])
                      : "N/A"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Total Items:</strong> {consolidatedData.length}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Report Period:</strong> {getDateRangeText()}
                  </Typography>
                </Box>
              ) : printDialog.order ? (
                <Box>
                  <Typography variant="body2">
                    <strong>Order ID:</strong> #{printDialog.order.order_id}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Date:</strong>{" "}
                    {new Date(
                      printDialog.order.created_at
                    ).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Items:</strong> {printDialog.order.items_count}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Total:</strong> $
                    {printDialog.order.total_amount.toFixed(2)}
                  </Typography>
                  {selectedDateRange && (
                    <Typography variant="body2">
                      <strong>Report Period:</strong> {getDateRangeText()}
                    </Typography>
                  )}
                </Box>
              ) : null}
            </Paper>

            {/* Print Preview Info */}
            <Box
              sx={{ p: 2, backgroundColor: "#e3f2fd", borderRadius: 1, mb: 2 }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Print Preview:
              </Typography>
              <Typography variant="caption" color="text.secondary">
                • Layout:{" "}
                {printOptions.pageLayout === "single"
                  ? "Single page (compressed)"
                  : printOptions.pageLayout === "double"
                  ? "Multiple pages (readable)"
                  : "Auto-adjust"}
              </Typography>
              <br />
              <Typography variant="caption" color="text.secondary">
                • Size:{" "}
                {printOptions.pageSize === "Custom"
                  ? `${printOptions.customWidth}×${printOptions.customHeight}mm`
                  : printOptions.pageSize}{" "}
                {printOptions.orientation}
              </Typography>
              <br />
              <Typography variant="caption" color="text.secondary">
                • Will print directly without opening new window
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() =>
              setPrintDialog({
                open: false,
                order: null,
                type: "print",
                showOptions: false,
              })
            }
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={
              printDialog.type === "consolidated"
                ? handleConfirmConsolidatedPrint
                : handleConfirmPrintEmail
            }
            variant="contained"
            startIcon={<PrintIcon />}
          >
            Print Now
          </Button>
        </DialogActions>
      </Dialog>
      {/* Email Dialog */}
      <Dialog
        open={emailDialog.open}
        onClose={() => setEmailDialog({ open: false, order: null, email: "" })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h6">Email Order</Typography>
            <IconButton
              onClick={() =>
                setEmailDialog({ open: false, order: null, email: "" })
              }
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

              <Paper
                variant="outlined"
                sx={{ p: 2, mb: 3, backgroundColor: "#f8f9fa" }}
              >
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Order Details:
                </Typography>
                <Typography variant="body2">
                  <strong>Order ID:</strong> #{emailDialog.order.order_id}
                </Typography>
                <Typography variant="body2">
                  <strong>Date:</strong>{" "}
                  {new Date(emailDialog.order.created_at).toLocaleDateString()}
                </Typography>
                <Typography variant="body2">
                  <strong>Items:</strong> {emailDialog.order.items_count}
                </Typography>
                <Typography variant="body2">
                  <strong>Total:</strong> $
                  {emailDialog.order.total_amount.toFixed(2)}
                </Typography>
                {selectedDateRange && (
                  <Typography variant="body2">
                    <strong>Report Period:</strong> {getDateRangeText()}
                  </Typography>
                )}
              </Paper>

              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={emailDialog.email}
                onChange={(e) =>
                  setEmailDialog((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="Enter recipient email address"
                required
                sx={{ mb: 2 }}
              />

              <Typography variant="body2" color="text.secondary">
                <strong>From:</strong> system@company.com
                <br />
                <strong>Subject:</strong> Order Report - Order #
                {emailDialog.order.order_id} -{" "}
                {selectedCompanies.length > 0
                  ? getCompanyName(selectedCompanies[0])
                  : "Company"}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setEmailDialog({ open: false, order: null, email: "" })
            }
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

      {/* Email Scheduler Component */}
      <EmailScheduler
        open={emailSchedulerOpen}
        onClose={() => setEmailSchedulerOpen(false)}
        selectedCompanies={selectedCompanies}
        getCompanyName={getCompanyName}
      />
    </Container>
  );
};

export default StoreSummaryProduction;

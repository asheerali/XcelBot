// Updated SalesDashboard.tsx with complete Redux state management for company/location selection
// FIXED: Now fetches data based on company/location selection without requiring uploaded files

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  TextField,
  Divider,
  Popover,
  MenuList,
  Checkbox,
  ListItemText,
} from "@mui/material";
import axios from "axios";
import { alpha, styled } from "@mui/material/styles";

// For charts - UPDATED TO USE BOTH RECHARTS AND NIVO
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ResponsiveBar } from "@nivo/bar";

// Icons
import FilterListIcon from "@mui/icons-material/FilterList";
import PlaceIcon from "@mui/icons-material/Place";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import BarChartIcon from "@mui/icons-material/BarChart";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import BusinessIcon from "@mui/icons-material/Business";

// Components
import FinancialTablesComponent from "../components/FinancialTablesComponent";
import DateRangeSelector from "../components/DateRangeSelector";

// Import Redux hooks and actions
import { useAppDispatch, useAppSelector } from "../typedHooks";
import {
  selectSalesWideLocation,
  updateSalesWideFilters,
  setTableData,
  setLoading,
  setError,
  selectCompanyId,
} from "../store/excelSlice";

// Redux imports for company/location management
import { useSelector, useDispatch } from "react-redux";
import {
  setSelectedCompanies,
  setSelectedLocations,
  selectSelectedCompanies,
  selectSelectedLocations,
} from "../store/slices/masterFileSlice";

// ADDED: Import date range Redux actions and selectors
import {
  setSalesDashboardDateRange,
  selectSalesDashboardStartDate,
  selectSalesDashboardEndDate,
  selectSalesDashboardDateRange,
  selectHasSalesDashboardDateRange,
  clearSalesDashboardDateRange,
} from "../store/slices/dateRangeSlice";

import { API_URL_Local } from "../constants";

// Company interface with nested locations
interface Company {
  company_id: number;
  company_name: string;
  locations: Location[];
}

// Location interface
interface Location {
  location_id: number;
  location_name: string;
}

// API URLs
const SALES_WIDE_FILTER_API_URL = `${API_URL_Local}/api/companywide/filter`;
const COMPANY_LOCATIONS_API_URL = `${API_URL_Local}/company-locations/all`;
// NEW: Add dedicated dashboard data API endpoint
const SALES_DASHBOARD_DATA_API_URL = `${API_URL_Local}/api/sales/dashboard-data`;

// Company info display component
const CompanyInfoChip = styled(Chip)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  "& .MuiChip-icon": {
    color: theme.palette.primary.main,
  },
  "& .MuiChip-label": {
    color: theme.palette.primary.main,
    fontWeight: 600,
  },
}));

// Custom theme for Nivo charts to fix label cutoff
const getChartTheme = () => {
  return {
    axis: {
      ticks: {
        text: {
          fontSize: 14,
          fontWeight: "bold",
        },
      },
      legend: {
        text: {
          fontSize: 14,
          fontWeight: "bold",
        },
      },
    },
    labels: {
      text: {
        fontSize: 12,
        fontWeight: "bold",
      },
    },
    legends: {
      text: {
        fontSize: 14,
      },
    },
    tooltip: {
      container: {
        fontSize: 14,
      },
    },
  };
};

// Function to get tailored chart margins based on chart type
const getChartMargins = (chartType: string) => {
  const margins = { top: 50, right: 50, bottom: 80, left: 60 };

  switch (chartType) {
    case "laborHrs":
    case "laborCost":
    case "cogs":
      return { top: 50, right: 50, bottom: 80, left: 80 };
    case "salesPercentage":
    case "avgTicket":
      return { top: 50, right: 50, bottom: 100, left: 60 };
    default:
      return margins;
  }
};

// NIVO Chart function for Labor charts
const createNivoChart = (
  data: any[],
  keys: string[],
  colors: string[],
  chartType: string,
  labelFormat: (value: number) => string,
  isStacked: boolean = false
) => {
  if (!data || data.length === 0) {
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "text.secondary",
        }}
      >
        <Typography>No data available</Typography>
      </Box>
    );
  }

  const margins = getChartMargins(chartType);

  return (
    <Box sx={{ height: "100%", width: "100%", overflow: "visible" }}>
      <ResponsiveBar
        data={data}
        keys={keys}
        indexBy="store"
        margin={margins}
        padding={0.25}
        groupMode={isStacked ? "stacked" : "grouped"}
        valueScale={{ type: "linear" }}
        indexScale={{ type: "band", round: true }}
        colors={colors}
        theme={getChartTheme()}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legendPosition: "middle",
          legendOffset: 42,
          truncateTickAt: 0,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legendPosition: "middle",
          legendOffset: -50,
          format: (value) => {
            if (
              chartType === "laborHrs" ||
              chartType === "laborCost" ||
              chartType === "cogs"
            ) {
              return `${(value / 1000).toFixed(0)}k`;
            }
            if (chartType.includes("Percentage")) {
              return `${value}%`;
            }
            return `${value}`;
          },
        }}
        labelSkipWidth={16}
        labelSkipHeight={16}
        labelTextColor="#ffffff"
        legends={[
          {
            dataFrom: "keys",
            anchor: "top",
            direction: "row",
            justify: false,
            translateX: 0,
            translateY: -35,
            itemsSpacing: 8,
            itemWidth: 100,
            itemHeight: 20,
            itemDirection: "left-to-right",
            itemOpacity: 0.85,
            symbolSize: 18,
          },
        ]}
        valueFormat={labelFormat}
        enableGridY={true}
        animate={true}
      />
    </Box>
  );
};

// TabPanel Component
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
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

// Multi-Select Filter Component matching the image design
interface MultiSelectFilterProps {
  id: string;
  label: string;
  value: string[];
  options: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  icon?: React.ReactNode;
}

const MultiSelectFilter: React.FC<MultiSelectFilterProps> = ({
  id,
  label,
  value,
  options,
  onChange,
  placeholder = "Select options",
  icon,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchText, setSearchText] = useState("");
  const open = Boolean(anchorEl);

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSearchText("");
  };

  const handleToggle = (option: string) => {
    const newValue = value.includes(option)
      ? value.filter((item) => item !== option)
      : [...value, option];
    onChange(newValue);
  };

  const handleSelectAll = () => {
    if (value.length === options.length) {
      onChange([]);
    } else {
      onChange([...options]);
    }
  };

  const handleClear = (event: React.MouseEvent) => {
    event.stopPropagation();
    onChange([]);
  };

  const displayText =
    value.length === 0
      ? placeholder
      : value.length === 1
      ? value[0]
      : `${value.length} locations selected`;

  return (
    <Box sx={{ position: "relative", width: "100%" }}>
      <Typography
        variant="body2"
        sx={{
          mb: 1,
          color: "#666",
          fontSize: "0.875rem",
          fontWeight: 500,
        }}
      >
        {label}
      </Typography>

      <Box
        onClick={handleClick}
        sx={{
          display: "flex",
          alignItems: "center",
          border: "2px solid #e0e0e0",
          borderRadius: "8px",
          padding: "12px 16px",
          cursor: "pointer",
          backgroundColor: "#fff",
          minHeight: "48px",
          position: "relative",
          "&:hover": {
            borderColor: "#1976d2",
          },
        }}
      >
        {icon && (
          <Box
            sx={{
              color: "#1976d2",
              mr: 1.5,
              display: "flex",
              alignItems: "center",
            }}
          >
            {icon}
          </Box>
        )}

        <Typography
          variant="body1"
          sx={{
            flexGrow: 1,
            color: value.length > 0 ? "#333" : "#999",
            fontSize: "0.95rem",
          }}
        >
          {displayText}
        </Typography>

        {value.length > 0 && (
          <IconButton
            size="small"
            onClick={handleClear}
            sx={{
              width: 20,
              height: 20,
              backgroundColor: "#666",
              color: "white",
              fontSize: "12px",
              mr: 1,
              "&:hover": {
                backgroundColor: "#333",
              },
            }}
          >
            <CloseIcon sx={{ fontSize: "12px" }} />
          </IconButton>
        )}

        <SearchIcon sx={{ color: "#666", fontSize: "1.2rem" }} />
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        PaperProps={{
          sx: {
            width: anchorEl?.offsetWidth || "auto",
            maxHeight: 400,
            mt: 1,
            borderRadius: 2,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          },
        }}
      >
        {/* Search Box */}
        <Box sx={{ p: 2, borderBottom: "1px solid #e0e0e0" }}>
          <TextField
            fullWidth
            placeholder="Search..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: "#666" }} />,
              sx: {
                borderRadius: 2,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#1976d2",
                  borderWidth: "2px",
                },
              },
            }}
          />
        </Box>

        {/* Select All */}
        <Box sx={{ p: 1 }}>
          <Box
            onClick={handleSelectAll}
            sx={{
              display: "flex",
              alignItems: "center",
              p: 1,
              cursor: "pointer",
              borderRadius: 1,
              "&:hover": {
                backgroundColor: "#f5f5f5",
              },
            }}
          >
            <Checkbox
              checked={value.length === options.length}
              indeterminate={value.length > 0 && value.length < options.length}
              size="small"
              sx={{ p: 0, mr: 2 }}
            />
            <ListItemText primary="Select All" />
          </Box>
        </Box>

        <Divider />

        {/* Options List */}
        <MenuList sx={{ py: 0, maxHeight: 250, overflow: "auto" }}>
          {filteredOptions.length === 0 ? (
            <MenuItem disabled>
              <ListItemText primary="No options found" />
            </MenuItem>
          ) : (
            filteredOptions.map((option) => (
              <MenuItem
                key={option}
                onClick={() => handleToggle(option)}
                dense
                sx={{ py: 1 }}
              >
                <Checkbox
                  checked={value.includes(option)}
                  size="small"
                  sx={{ p: 0, mr: 2 }}
                />
                <ListItemText primary={option} />
              </MenuItem>
            ))
          )}
        </MenuList>
      </Popover>
    </Box>
  );
};

// Enhanced Date Range Selector Component
interface DateRangeSelectorComponentProps {
  onDateRangeSelect: (dateRange: any) => void;
}

const DateRangeSelectorComponent: React.FC<DateRangeSelectorComponentProps> = ({
  onDateRangeSelect,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<string>("");
  const [tempRange, setTempRange] = useState<any>(null);

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setTempRange(null);
  };

  const handleTempDateRangeSelect = (range: any) => {
    setTempRange(range);
  };

  const handleSetDateRange = () => {
    if (tempRange) {
      const startDate = tempRange.startDate.toLocaleDateString();
      const endDate = tempRange.endDate.toLocaleDateString();
      setSelectedRange(`${startDate} - ${endDate}`);
      onDateRangeSelect(tempRange);
    }
    handleClose();
  };

  const handleCancel = () => {
    setTempRange(null);
    handleClose();
  };

  const handleClear = (event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedRange("");
    // FIXED: Use Redux action to clear date range
    onDateRangeSelect(null);
  };

  return (
    <>
      <Box sx={{ position: "relative", width: "100%" }}>
        <Typography
          variant="body2"
          sx={{
            mb: 1,
            color: "#666",
            fontSize: "0.875rem",
            fontWeight: 500,
          }}
        >
          Date Range
        </Typography>

        <Box
          onClick={handleClick}
          sx={{
            display: "flex",
            alignItems: "center",
            border: "2px solid #e0e0e0",
            borderRadius: "8px",
            padding: "12px 16px",
            cursor: "pointer",
            backgroundColor: "#fff",
            minHeight: "48px",
            position: "relative",
            "&:hover": {
              borderColor: "#1976d2",
            },
          }}
        >
          <Box
            sx={{
              color: "#1976d2",
              mr: 1.5,
              display: "flex",
              alignItems: "center",
            }}
          >
            <CalendarTodayIcon />
          </Box>

          <Typography
            variant="body1"
            sx={{
              flexGrow: 1,
              color: selectedRange ? "#333" : "#999",
              fontSize: "0.95rem",
            }}
          >
            {selectedRange || "Select date range"}
          </Typography>

          {selectedRange && (
            <IconButton
              size="small"
              onClick={handleClear}
              sx={{
                width: 20,
                height: 20,
                backgroundColor: "#666",
                color: "white",
                fontSize: "12px",
                mr: 1,
                "&:hover": {
                  backgroundColor: "#333",
                },
              }}
            >
              <CloseIcon sx={{ fontSize: "12px" }} />
            </IconButton>
          )}

          <SearchIcon sx={{ color: "#666", fontSize: "1.2rem" }} />
        </Box>
      </Box>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth={false}
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: "visible",
            width: "1200px",
            height: "700px",
            maxWidth: "95vw",
            maxHeight: "95vh",
          },
        }}
      >
        <Box
          sx={{
            p: 4,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Select Date Range
          </Typography>

          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "flex-start",
              minHeight: "500px",
              mb: 3,
              overflow: "auto",
            }}
          >
            <Box sx={{ width: "100%" }}>
              <DateRangeSelector onSelect={handleTempDateRangeSelect} />
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              pt: 2,
              borderTop: "1px solid #e0e0e0",
              gap: 2,
              flexShrink: 0,
            }}
          >
            <Button
              variant="outlined"
              onClick={handleCancel}
              sx={{
                borderColor: "#e0e0e0",
                color: "#666",
                minWidth: "100px",
                textTransform: "uppercase",
                py: 1.5,
                px: 3,
              }}
            >
              CANCEL
            </Button>
            <Button
              variant="contained"
              onClick={handleSetDateRange}
              disabled={!tempRange}
              sx={{
                backgroundColor: "#1976d2",
                minWidth: "160px",
                textTransform: "uppercase",
                py: 1.5,
                px: 3,
                "&:disabled": {
                  backgroundColor: "#ccc",
                },
              }}
            >
              SET DATE RANGE
            </Button>
          </Box>
        </Box>
      </Dialog>
    </>
  );
};

// Chart Base Component
interface BaseChartProps {
  title: string;
  children: React.ReactNode;
  height?: number | string;
}

const BaseChart: React.FC<BaseChartProps> = ({
  title,
  children,
  height = 450,
}) => {
  const theme = useTheme();

  return (
    <Card
      elevation={2}
      sx={{
        borderRadius: 1,
        overflow: "hidden",
        mb: 3,
        height: height,
      }}
    >
      <Box sx={{ p: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="h6" sx={{ fontWeight: 500 }}>
          {title}
        </Typography>
      </Box>
      <Box sx={{ height: "calc(100% - 60px)", position: "relative" }}>
        {children}
      </Box>
    </Card>
  );
};

// Custom Tooltip Component for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          backgroundColor: "white",
          border: "1px solid #ccc",
          borderRadius: 1,
          padding: 1.5,
          boxShadow: 2,
          minWidth: "150px",
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
          {label}
        </Typography>
        {payload.map((entry: any, index: number) => (
          <Typography
            key={index}
            variant="body2"
            sx={{
              color: entry.color,
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 0.5,
            }}
          >
            <Box
              sx={{
                width: 12,
                height: 12,
                backgroundColor: entry.color,
                borderRadius: 0.5,
              }}
            />
            {entry.name || entry.dataKey}:{" "}
            {typeof entry.value === "number"
              ? entry.value % 1 !== 0
                ? entry.value.toFixed(2) +
                  (entry.dataKey.includes("vs.") ? "%" : "")
                : entry.value.toLocaleString()
              : entry.value}
          </Typography>
        ))}
      </Box>
    );
  }
  return null;
};

// Main Component with Redux state management
export default function SalesDashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  // Use both dispatch hooks
  const dispatch = useAppDispatch(); // For existing excel slice
  const reduxDispatch = useDispatch(); // For master file slice

  // Get data from Redux store
  const {
    salesWideFiles,
    salesWideLocations,
    currentSalesWideLocation,
    salesWideFilters,
    loading,
    error,
  } = useAppSelector((state) => state.excel);

  // Get company_id from Redux (from uploaded files)
  const currentCompanyId = useAppSelector(selectCompanyId);

  // Redux state for company/location selection
  const selectedCompanies = useSelector(selectSelectedCompanies);
  const selectedLocations = useSelector(selectSelectedLocations);

  // ADDED: Redux state for date range
  const salesDashboardStartDate = useSelector(selectSalesDashboardStartDate);
  const salesDashboardEndDate = useSelector(selectSalesDashboardEndDate);
  const hasSalesDashboardDateRange = useSelector(selectHasSalesDashboardDateRange);
  const salesDashboardDateRange = useSelector(selectSalesDashboardDateRange);

  // Convert to single values for dropdown compatibility
  const selectedCompany =
    selectedCompanies.length > 0 ? selectedCompanies[0] : "";
  const selectedLocation =
    selectedLocations.length > 0 ? selectedLocations[0] : "";

  // Company and location data state
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [companiesError, setCompaniesError] = useState<string>("");

  // Get current company's locations
  const currentCompanyData = companies.find(
    (c) => c.company_id.toString() === selectedCompany
  );
  const availableLocations = currentCompanyData?.locations || [];

  // Find current data for the selected location - UPDATED: Make this optional
  const currentSalesWideData = salesWideFiles.find(
    (f) => f.location === currentSalesWideLocation
  )?.data;

  // State variables
  const [tabValue, setTabValue] = useState(0);
  const [chartTab, setChartTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [filterError, setFilterError] = useState<string>("");

  // REMOVED: Local selectedDateRange state - now using Redux
  // const [selectedDateRange, setSelectedDateRange] = useState<any>(null);

  // Current table data from local state that gets updated from API calls
  const [currentTableData, setCurrentTableData] = useState<any>({
    table1: [],
    table2: [],
    table3: [],
    table4: [],
    table5: [],
    table6: [],
    table7: [],
  });

  // Fetch companies with locations on component mount
  useEffect(() => {
    const fetchCompaniesWithLocations = async () => {
      setCompaniesLoading(true);
      setCompaniesError("");

      try {
        console.log(
          "🏢 SalesDashboard: Fetching companies with locations from:",
          COMPANY_LOCATIONS_API_URL
        );
        const response = await axios.get(COMPANY_LOCATIONS_API_URL);

        console.log(
          "📥 SalesDashboard: Companies with locations response:",
          response.data
        );
        setCompanies(response.data || []);

        // Auto-select the first company if there's only one and none selected
        if (
          response.data &&
          response.data.length === 1 &&
          selectedCompanies.length === 0
        ) {
          reduxDispatch(
            setSelectedCompanies([response.data[0].company_id.toString()])
          );
          console.log(
            "🎯 SalesDashboard: Auto-selected single company:",
            response.data[0]
          );
        }
      } catch (error) {
        console.error(
          "❌ SalesDashboard: Error fetching companies with locations:",
          error
        );

        let errorMessage = "Error loading companies and locations";
        if (axios.isAxiosError(error)) {
          if (error.response) {
            errorMessage = `Server error: ${error.response.status}`;
          } else if (error.request) {
            errorMessage =
              "Cannot connect to companies API. Please check server status.";
          }
        }

        setCompaniesError(errorMessage);
      } finally {
        setCompaniesLoading(false);
      }
    };

    fetchCompaniesWithLocations();
  }, [selectedCompanies.length, reduxDispatch]);

  // Sync selectedCompany with Redux currentCompanyId if it exists
  useEffect(() => {
    if (currentCompanyId && selectedCompanies.length === 0) {
      console.log(
        "🏢 SalesDashboard: Syncing company ID from Redux files:",
        currentCompanyId
      );
      reduxDispatch(setSelectedCompanies([currentCompanyId]));
    }
  }, [currentCompanyId, selectedCompanies.length, reduxDispatch]);

  // FIXED: Initialize local state with current data - Make optional
  useEffect(() => {
    if (currentSalesWideData) {
      setCurrentTableData({
        table1: currentSalesWideData.table1 || [],
        table2: currentSalesWideData.table2 || [],
        table3: currentSalesWideData.table3 || [],
        table4: currentSalesWideData.table4 || [],
        table5: currentSalesWideData.table5 || [],
        table6: currentSalesWideData.table6 || [],
        table7: currentSalesWideData.table7 || [],
      });
    }
  }, [currentSalesWideData]);

  // FIXED: Auto-fetch data when company changes and on initial load
  useEffect(() => {
    const fetchInitialData = async () => {
      // FIXED: Fetch data when company is selected, regardless of loading state
      if (selectedCompany) {
        try {
          console.log("🔄 Auto-fetching data for company:", selectedCompany);
          await handleApplyFilters();
        } catch (error) {
          // Silently handle auto-fetch errors to prevent breaking the UI
          console.warn("⚠️ Auto-fetch failed:", error);
        }
      }
    };

    // FIXED: Immediate fetch on company change
    if (selectedCompany) {
      fetchInitialData();
    }
  }, [selectedCompany]); // Only trigger on company change

  // FIXED: Auto-fetch when locations change
  useEffect(() => {
    const fetchLocationData = async () => {
      if (selectedCompany && selectedLocations.length > 0) {
        try {
          console.log("🔄 Auto-fetching data for location change:", selectedLocations);
          await handleApplyFilters();
        } catch (error) {
          console.warn("⚠️ Location auto-fetch failed:", error);
        }
      }
    };

    // Debounce location changes slightly to avoid too many API calls
    const timeoutId = setTimeout(fetchLocationData, 300);
    return () => clearTimeout(timeoutId);
  }, [selectedLocations]); // Changed from selectedLocation to selectedLocations

  // FIXED: Simple auto-fetch when date range state changes (including clearing)
  useEffect(() => {
    const fetchDataOnDateChange = async () => {
      if (selectedCompany) {
        try {
          console.log("🔄 Auto-fetching data due to date range change:", {
            hasDates: hasSalesDashboardDateRange,
            startDate: salesDashboardStartDate,
            endDate: salesDashboardEndDate
          });
          await handleApplyFilters();
        } catch (error) {
          console.warn("⚠️ Date range change auto-fetch failed:", error);
        }
      }
    };

    // Debounce to avoid too many API calls
    const timeoutId = setTimeout(fetchDataOnDateChange, 300);
    return () => clearTimeout(timeoutId);
  }, [hasSalesDashboardDateRange]); // SIMPLIFIED: Only watch the boolean state change

  // Separate effect for actual date value changes (when dates exist)
  useEffect(() => {
    const fetchDataOnDateValueChange = async () => {
      if (selectedCompany && hasSalesDashboardDateRange) {
        try {
          console.log("🔄 Auto-fetching data due to date value change:", {
            startDate: salesDashboardStartDate,
            endDate: salesDashboardEndDate
          });
          await handleApplyFilters();
        } catch (error) {
          console.warn("⚠️ Date value change auto-fetch failed:", error);
        }
      }
    };

    const timeoutId = setTimeout(fetchDataOnDateValueChange, 500);
    return () => clearTimeout(timeoutId);
  }, [salesDashboardStartDate, salesDashboardEndDate]); // Watch actual date values

  // Redux-based change handlers
  const handleCompanyChange = (event: SelectChangeEvent) => {
    const companyId = event.target.value;
    console.log("🏢 SalesDashboard: Company selected:", companyId);

    // Update Redux state - always clear locations when company changes
    reduxDispatch(setSelectedCompanies([companyId]));
    reduxDispatch(setSelectedLocations([])); // Clear locations when company changes
  };

  const handleLocationFilterChange = (newLocationNames: string[]) => {
    // FIXED: Handle multiple locations properly
    if (newLocationNames.length > 0 && selectedCompany) {
      const selectedLocationIds = newLocationNames.map(locationName => {
        const locationData = availableLocations.find(
          (loc) => loc.location_name === locationName
        );
        return locationData ? locationData.location_id.toString() : null;
      }).filter(id => id !== null);
      
      reduxDispatch(setSelectedLocations(selectedLocationIds));
      console.log("🏢 Multiple locations selected:", newLocationNames, "IDs:", selectedLocationIds);
    } else {
      reduxDispatch(setSelectedLocations([]));
      console.log("🏢 Locations cleared");
    }
  };

  const handleDateRangeSelect = (dateRange: any) => {
    // UPDATED: Use Redux action to set date range
    if (dateRange && dateRange.startDate && dateRange.endDate) {
      console.log("📅 SalesDashboard: Setting date range in Redux:", {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        startDateStr: dateRange.startDateStr,
        endDateStr: dateRange.endDateStr
      });
      
      reduxDispatch(setSalesDashboardDateRange({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      }));
    } else {
      // Clear date range
      console.log("📅 SalesDashboard: Clearing date range in Redux");
      reduxDispatch(clearSalesDashboardDateRange());
    }
  };

  // Get selected company and location names for display
  const selectedCompanyName =
    companies.find((c) => c.company_id.toString() === selectedCompany)
      ?.company_name ||
    (selectedCompany
      ? `Company ID: ${selectedCompany}`
      : "No Company Selected");

  const selectedLocationName =
    availableLocations.find(
      (l) => l.location_id.toString() === selectedLocation
    )?.location_name ||
    (selectedLocation
      ? `Location ID: ${selectedLocation}`
      : "No Location Selected");

  // Get active company ID (prioritize Redux selectedCompany, fallback to currentCompanyId)
  const activeCompanyId = selectedCompany || currentCompanyId;

  // FIXED: Updated Apply filters function - works without uploaded files
  const handleApplyFilters = async () => {
    setIsLoading(true);
    setFilterError("");

    try {
      // Check if we have selected company
      if (!selectedCompany) {
        throw new Error("Please select a company first");
      }

      // FIXED: Try to use existing file data first, but allow API-only fetching
      let currentFile = null;
      let useFileData = false;

      // Try to find file by Redux selected location name first
      if (selectedLocation && selectedLocationName && salesWideFiles.length > 0) {
        currentFile = salesWideFiles.find(
          (f) => f.location === selectedLocationName
        );
        useFileData = !!currentFile;
      }

      // Fallback to current location from uploaded files
      if (!currentFile && salesWideFiles.length > 0) {
        currentFile = salesWideFiles.find(
          (f) => f.location === currentSalesWideLocation
        );
        useFileData = !!currentFile;
      }

      // Prepare the request payload - FIXED: Support multiple locations and Redux date range
      const selectedLocationNames = selectedLocations.map(locId => {
        const loc = availableLocations.find(l => l.location_id.toString() === locId);
        return loc ? loc.location_name : null;
      }).filter(Boolean);

      const payload: any = {
        locations: selectedLocationNames, // FIXED: Send array of location names
        location: selectedLocationNames.length === 1 ? selectedLocationNames[0] : null, // Single location for backwards compatibility
        startDate: salesDashboardStartDate || null, // UPDATED: Use Redux date range
        endDate: salesDashboardEndDate || null, // UPDATED: Use Redux date range
        dashboard: "Sales Wide",
        company_id: activeCompanyId,
        location_id: selectedLocations.length === 1 ? selectedLocations[0] : null, // Single location ID for backwards compatibility
        location_ids: selectedLocations, // FIXED: Send array of location IDs
      };

      // Include file data only if available
      if (useFileData && currentFile) {
        payload.fileName = currentFile.fileName;
        payload.fileContent = currentFile.fileContent;
        console.log("🚀 Using uploaded file data for request");
      } else {
        console.log("🚀 Fetching data from database without uploaded files");
      }

      console.log("🚀 Sending Sales Wide filter request:", {
        ...payload,
        fileContent: payload.fileContent ? "[FILE_CONTENT]" : "NO_FILE"
      });

      const response = await axios.post(SALES_WIDE_FILTER_API_URL, payload);
      console.log("📥 Received Sales Wide filter response:", response.data);

      if (response.data) {
        // Update local table data state
        setCurrentTableData({
          table1: response.data.table1 || [],
          table2: response.data.table2 || [],
          table3: response.data.table3 || [],
          table4: response.data.table4 || [],
          table5: response.data.table5 || [],
          table6: response.data.table6 || [],
          table7: response.data.table7 || [],
        });

        // Update Redux state
        dispatch(setTableData(response.data));

        // Update Redux filters
        dispatch(
          updateSalesWideFilters({
            location: selectedLocationNames.length === 1 ? selectedLocationNames[0] : "",
            dateRange: hasSalesDashboardDateRange
              ? `${salesDashboardStartDate} - ${salesDashboardEndDate}`
              : "",
            company_id: activeCompanyId,
            location_id: selectedLocations.length === 1 ? selectedLocations[0] : null,
          })
        );

        // Update current location if changed
        if (
          selectedLocation &&
          selectedLocationName !== currentSalesWideLocation
        ) {
          dispatch(selectSalesWideLocation(selectedLocationName));
        }

        console.log("✅ Sales Wide filters applied successfully");
      }
    } catch (err: any) {
      console.error("❌ Sales Wide filter error:", err);

      let errorMessage = "Error applying filters";

      if (axios.isAxiosError(err)) {
        if (err.response) {
          // FIXED: Handle error objects properly
          const detail = err.response.data?.detail;
          
          // Check if detail is an object with validation errors
          if (detail && typeof detail === 'object' && detail.type && detail.msg) {
            errorMessage = `Validation error: ${detail.msg}`;
          } else if (detail && typeof detail === 'string') {
            errorMessage = detail;
          } else if (err.response.data?.message) {
            errorMessage = err.response.data.message;
          } else {
            errorMessage = `Server error: ${err.response.status}`;
          }
        } else if (err.request) {
          errorMessage =
            "No response from server. Please check if the backend is running.";
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      // FIXED: Ensure error message is always a string
      const safeErrorMessage = typeof errorMessage === 'string' ? errorMessage : 'An unknown error occurred';
      
      setFilterError(safeErrorMessage);
      dispatch(setError(safeErrorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  // Process backend data for charts
  const processTableDataForCharts = (tableData: any[], keys: string[]) => {
    if (!tableData || tableData.length === 0) return [];

    return tableData
      .filter((row) => row.Store !== "Grand Total")
      .map((row) => {
        const processedRow: any = { store: row.Store };
        keys.forEach((key) => {
          processedRow[key] = row[key] || 0;
        });
        return processedRow;
      });
  };

  // Chart data from local table data
  const salesData = processTableDataForCharts(currentTableData.table1 || [], [
    "Tw vs. Lw",
    "Tw vs. Ly",
  ]);

  const ordersData = processTableDataForCharts(currentTableData.table2 || [], [
    "Tw vs. Lw",
    "Tw vs. Ly",
  ]);

  const avgTicketData = processTableDataForCharts(
    currentTableData.table3 || [],
    ["Tw vs. Lw", "Tw vs. Ly"]
  );

  const laborHrsData = processTableDataForCharts(
    currentTableData.table6 || [],
    ["Tw Lb Hrs", "Lw Lb Hrs"]
  );

  const spmhData = processTableDataForCharts(currentTableData.table7 || [], [
    "Tw SPMH",
    "Lw SPMH",
  ]);

  const laborCostData = processTableDataForCharts(
    currentTableData.table5 || [],
    ["Tw Reg Pay", "Lw Reg Pay"]
  );

  const laborPercentageData = processTableDataForCharts(
    currentTableData.table5 || [],
    ["Tw Lc %", "Lw Lc %"]
  );

  const cogsData = processTableDataForCharts(currentTableData.table4 || [], [
    "Tw COGS",
    "Lw COGS",
  ]);

  const cogsPercentageData = processTableDataForCharts(
    currentTableData.table4 || [],
    ["Tw Fc %", "Lw Fc %"]
  );

  // Create properly formatted financial tables data
  const financialTablesData = React.useMemo(() => {
    return {
      table1: currentTableData.table1 || [],
      table2: currentTableData.table2 || [],
      table3: currentTableData.table3 || [],
      table4: currentTableData.table4 || [],
      table5: currentTableData.table5 || [],
      table6: currentTableData.table6 || [],
      table7: currentTableData.table7 || [],
    };
  }, [currentTableData]);

  // Handle tab changes
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleChartTabChange = (
    event: React.SyntheticEvent,
    newValue: number
  ) => {
    setChartTab(newValue);
  };

  // Format values for charts
  const formatPercentage = (value: number) => `${value.toFixed(2)}%`;
  const formatCurrency = (value: number) => {
    return `${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Function to create charts
  const createNivoBarChart = (
    data: any[],
    keys: string[],
    colors: string[],
    chartType: string,
    labelFormat: (value: number) => string = formatPercentage,
    enableLabels: boolean = false,
    customLabelFormat?: (d: any) => string
  ) => {
    if (!data || data.length === 0) {
      return (
        <Box
          sx={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "text.secondary",
          }}
        >
          <Typography>No data available</Typography>
        </Box>
      );
    }

    const isSingleBarChart =
      chartType === "salesPercentage" ||
      chartType === "ordersPercentage" ||
      chartType === "avgTicket";

    if (isSingleBarChart) {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
            barCategoryGap="25%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="store"
              tick={{ fontSize: 12, fontWeight: "bold" }}
              height={60}
              interval={0}
            />
            <YAxis
              tick={{ fontSize: 12, fontWeight: "bold" }}
              tickFormatter={labelFormat}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{
                paddingTop: "20px",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            />

            <Bar
              dataKey={keys[0]}
              fill={colors[0] || "#4285f4"}
              name="Tw vs. Lw"
              radius={[2, 2, 0, 0]}
              maxBarSize={60}
            />
            <Bar
              dataKey={keys[1]}
              fill={colors[1] || "#ea4335"}
              name="Tw vs. Ly"
              radius={[2, 2, 0, 0]}
              maxBarSize={60}
            />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    const isStackedChart =
      chartType === "laborCost" ||
      chartType === "laborPercentage" ||
      chartType === "laborHrs" ||
      chartType === "spmh" ||
      chartType === "cogs" ||
      chartType === "cogsPercentage";

    if (isStackedChart) {
      return createNivoChart(data, keys, colors, chartType, labelFormat, true);
    }

    return createNivoChart(data, keys, colors, chartType, labelFormat, false);
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Dashboard Header */}
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
        <div
          style={{
            textAlign: "center",
            marginBottom: "2rem",
            display: "flex",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <h1
            style={{
              fontWeight: 800,
              background: "linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: "clamp(1.75rem, 5vw, 3rem)",
              marginBottom: "8px",
              letterSpacing: "-0.02em",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
              margin: "0",
              textAlign: "center",
            }}
          >
            <span
              style={{
                color: "#1976d2",
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                fontSize: "inherit",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              <svg
                width="1em"
                height="1em"
                viewBox="0 0 100 100"
                fill="currentColor"
                style={{ fontSize: "inherit" }}
              >
                <rect
                  x="10"
                  y="10"
                  width="35"
                  height="35"
                  rx="4"
                  fill="#5A8DEE"
                />
                <rect
                  x="55"
                  y="10"
                  width="35"
                  height="35"
                  rx="4"
                  fill="#4285F4"
                />
                <rect
                  x="10"
                  y="55"
                  width="35"
                  height="35"
                  rx="4"
                  fill="#1976D2"
                />
                <rect
                  x="55"
                  y="55"
                  width="35"
                  height="35"
                  rx="4"
                  fill="#3F51B5"
                />
              </svg>
            </span>
            Companywide Sales Dashboard
            {(isLoading || loading) && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 2 }}>
                <CircularProgress size={20} />
                <Typography variant="body2" color="text.secondary">
                  Updating...
                </Typography>
              </Box>
            )}
            {(activeCompanyId || selectedLocations.length > 0) && !(isLoading || loading) && (
              <Box sx={{ display: "flex", gap: 1, ml: 2 }}>
                {activeCompanyId && (
                  <CompanyInfoChip
                    icon={<BusinessIcon />}
                    label={selectedCompanyName}
                    size="small"
                    sx={{ fontSize: "0.75rem" }}
                  />
                )}
                {selectedLocations.length > 0 && (
                  <CompanyInfoChip
                    icon={<PlaceIcon />}
                    label={selectedLocations.length === 1 ? 
                      (availableLocations.find(l => l.location_id.toString() === selectedLocations[0])?.location_name || `Location ${selectedLocations[0]}`) :
                      `${selectedLocations.length} Locations`
                    }
                    size="small"
                    sx={{ fontSize: "0.75rem" }}
                  />
                )}
              </Box>
            )}
          </h1>
        </div>
      </Box>

      {/* Company Selection Section - Single Card at Top */}
      {companies.length > 0 && (
        <Card
          elevation={3}
          sx={{
            mb: 3,
            borderRadius: 2,
            overflow: "hidden",
            border: "2px solid #e3f2fd",
          }}
        >
          <CardContent sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f8f9fa" }}>
            <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <BusinessIcon color="primary" />
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "#1976d2" }}
              >
                Select Company
              </Typography>
              {companiesLoading && <CircularProgress size={20} />}
            </Box>

            {companiesError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {companiesError}
              </Alert>
            )}

            <FormControl fullWidth size="small" disabled={companiesLoading}>
              <InputLabel id="company-select-label">Company</InputLabel>
              <Select
                labelId="company-select-label"
                value={selectedCompany}
                label="Company"
                onChange={handleCompanyChange}
                sx={{
                  "& .MuiSelect-select": {
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  },
                }}
              >
                <MenuItem value="">
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      color: "text.secondary",
                    }}
                  >
                    <BusinessIcon fontSize="small" />
                    Select Company
                  </Box>
                </MenuItem>
                {companies.map((company) => (
                  <MenuItem
                    key={company.company_id}
                    value={company.company_id.toString()}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <BusinessIcon fontSize="small" color="primary" />
                      {company.company_name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedCompany && (
              <Box sx={{ mt: 2 }}>
                <Chip
                  icon={<BusinessIcon />}
                  label={`Selected: ${selectedCompanyName}`}
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 500 }}
                />
              </Box>
            )}

            {currentCompanyId && currentCompanyId !== selectedCompany && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Note:</strong> Your uploaded files are associated with
                  Company ID: {currentCompanyId}. Current selection will be used
                  for new operations.
                </Typography>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error Alert - FIXED: Handle error objects properly */}
      {(filterError || error) && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => {
            setFilterError("");
            dispatch(setError(null));
          }}
        >
          {/* FIXED: Ensure error is always rendered as string */}
          {typeof (filterError || error) === 'string' 
            ? (filterError || error) 
            : typeof (filterError || error) === 'object'
            ? JSON.stringify(filterError || error)
            : 'An error occurred'
          }
        </Alert>
      )}

      {/* Sales Data Filters Section - Integrated with Company-Location API */}
      <Card elevation={3} sx={{ mb: 3, borderRadius: 2, overflow: "hidden" }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
            <FilterListIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              Data Filters
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              (Auto-updates on selection)
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* Location filter - FIXED: Support multiple locations */}
            <Grid item xs={12} sm={6}>
              <MultiSelectFilter
                id="location-filter"
                label="Location"
                value={selectedLocations.length > 0 ? 
                  selectedLocations.map(locId => {
                    const loc = availableLocations.find(l => l.location_id.toString() === locId);
                    return loc ? loc.location_name : locId;
                  }).filter(Boolean) : []
                }
                options={
                  selectedCompany
                    ? availableLocations.map((loc) => loc.location_name)
                    : []
                }
                onChange={handleLocationFilterChange}
                placeholder={
                  !selectedCompany
                    ? "Select Company First"
                    : "Select Locations..."
                }
                icon={<PlaceIcon />}
              />
              {!selectedCompany && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1, fontSize: "0.75rem" }}
                >
                  Please select a company first to see available locations
                </Typography>
              )}
            </Grid>

            {/* Date Range filter */}
            <Grid item xs={12} sm={6}>
              <DateRangeSelectorComponent
                onDateRangeSelect={handleDateRangeSelect}
              />
            </Grid>
          </Grid>

            {/* Active filters display - REMOVED Apply button */}
            {(activeCompanyId || selectedLocations.length > 0 || hasSalesDashboardDateRange) && (
              <Box sx={{ mt: 3 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Active Filters:
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {/* Company filter chip */}
                  {activeCompanyId && (
                    <Chip
                      label={`Company: ${selectedCompanyName}`}
                      sx={{
                        backgroundColor: "#e3f2fd",
                        color: "#1976d2",
                        border: "1px solid #90caf9",
                        borderRadius: "20px",
                        height: "32px",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                      }}
                      icon={<BusinessIcon />}
                    />
                  )}

                  {/* FIXED: Multiple Location filter chips */}
                  {selectedLocations.length > 0 && 
                    selectedLocations.map((locId, index) => {
                      const locationData = availableLocations.find(l => l.location_id.toString() === locId);
                      const locationName = locationData ? locationData.location_name : `Location ID: ${locId}`;
                      
                      return (
                        <Chip
                          key={locId}
                          label={selectedLocations.length === 1 ? 
                            `Location: ${locationName}` : 
                            `${locationName}`
                          }
                          onDelete={() => {
                            const newLocations = selectedLocations.filter(id => id !== locId);
                            reduxDispatch(setSelectedLocations(newLocations));
                          }}
                          sx={{
                            backgroundColor: "#f3e5f5",
                            color: "#7b1fa2",
                            border: "1px solid #ce93d8",
                            borderRadius: "20px",
                            height: "32px",
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            "& .MuiChip-deleteIcon": {
                              color: "#7b1fa2",
                              fontSize: "18px",
                            },
                          }}
                          icon={<PlaceIcon />}
                          deleteIcon={<CloseIcon />}
                        />
                      );
                    })
                  }

                  {/* UPDATED: Date range chip using Redux */}
                  {hasSalesDashboardDateRange && (
                    <Chip
                      label={`Date Range: ${salesDashboardStartDate} - ${salesDashboardEndDate}`}
                      onDelete={() => reduxDispatch(clearSalesDashboardDateRange())}
                      sx={{
                        backgroundColor: "#fff3e0",
                        color: "#f57c00",
                        border: "1px solid #ffcc02",
                        borderRadius: "20px",
                        height: "32px",
                        fontSize: "0.875rem",
                        "& .MuiChip-deleteIcon": {
                          color: "#f57c00",
                          fontSize: "18px",
                        },
                      }}
                      deleteIcon={<CloseIcon />}
                    />
                  )}
                </Box>

                {/* ADDED: Loading indicator when data is being fetched */}
                {(isLoading || loading) && (
                  <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1 }}>
                    <CircularProgress size={16} />
                    <Typography variant="body2" color="text.secondary">
                      Loading data...
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
        </CardContent>
      </Card>

      {/* FIXED: Always render dashboard content - data will be fetched via API */}
      <>
        {/* Show "No data" message only when no table data and not loading */}
        {(!currentTableData.table1 || currentTableData.table1.length === 0) && 
         !isLoading && 
         !loading && 
         selectedCompany && (
          <Alert severity="info" sx={{ mb: 3 }}>
            No data available for the selected company and location. Try adjusting your filters or check if data exists for this selection.
          </Alert>
        )}

        {/* Tabs */}
        <Card
          sx={{ borderRadius: 2, mb: 3, overflow: "hidden" }}
          elevation={3}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              "& .MuiTab-root": {
                fontWeight: 500,
                textTransform: "none",
                fontSize: "1rem",
                py: 1.5,
              },
              "& .Mui-selected": {
                color: "#4285f4",
                fontWeight: 600,
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#4285f4",
                height: 3,
              },
            }}
          >
            <Tab label="Tables" />
            <Tab label="Graphs" />
          </Tabs>

          {/* Financial Dashboard Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
              {/* Show company/location context in tables */}
              {(activeCompanyId || selectedLocations.length > 0) && (
                <Box
                  sx={{
                    mb: 3,
                    display: "flex",
                    justifyContent: "center",
                    flexWrap: "wrap",
                    gap: 1,
                  }}
                >
                  {activeCompanyId && (
                    <CompanyInfoChip
                      icon={<BusinessIcon />}
                      label={`Data for: ${selectedCompanyName}`}
                      variant="outlined"
                    />
                  )}
                  {selectedLocations.length > 0 && (
                    <CompanyInfoChip
                      icon={<PlaceIcon />}
                      label={selectedLocations.length === 1 ? 
                        `Location: ${availableLocations.find(l => l.location_id.toString() === selectedLocations[0])?.location_name || selectedLocations[0]}` :
                        `Locations: ${selectedLocations.length} selected`
                      }
                      variant="outlined"
                    />
                  )}
                </Box>
              )}
              <FinancialTablesComponent
                financialTables={financialTablesData}
              />
            </Box>
          </TabPanel>

          {/* Charts Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
              {/* Show company/location context in graphs */}
              {(activeCompanyId || selectedLocations.length > 0) && (
                <Box
                  sx={{
                    mb: 3,
                    display: "flex",
                    justifyContent: "center",
                    flexWrap: "wrap",
                    gap: 1,
                  }}
                >
                  {activeCompanyId && (
                    <CompanyInfoChip
                      icon={<BusinessIcon />}
                      label={`Charts for: ${selectedCompanyName}`}
                      variant="outlined"
                    />
                  )}
                  {selectedLocations.length > 0 && (
                    <CompanyInfoChip
                      icon={<PlaceIcon />}
                      label={selectedLocations.length === 1 ? 
                        `Location: ${availableLocations.find(l => l.location_id.toString() === selectedLocations[0])?.location_name || selectedLocations[0]}` :
                        `Locations: ${selectedLocations.length} selected`
                      }
                      variant="outlined"
                    />
                  )}
                </Box>
              )}

              {/* Chart Tabs */}
              <Tabs
                value={chartTab}
                onChange={handleChartTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  mb: 2,
                  "& .MuiTab-root": {
                    textTransform: "none",
                    minWidth: "unset",
                    fontWeight: 500,
                    fontSize: "0.9rem",
                    px: 3,
                    "&.Mui-selected": {
                      color: theme.palette.primary.main,
                      fontWeight: 600,
                    },
                  },
                }}
              >
                <Tab label="All Charts" />
                <Tab label="Sales" />
                <Tab label="Orders" />
                <Tab label="Avg Ticket" />
                <Tab label="Labor" />
                <Tab label="COGS" />
              </Tabs>

              {/* All Charts Panel */}
              <TabPanel value={chartTab} index={0}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <BaseChart title="Sales">
                      {createNivoBarChart(
                        salesData,
                        ["Tw vs. Lw", "Tw vs. Ly"],
                        ["#4285f4", "#ea4335"],
                        "salesPercentage",
                        formatPercentage,
                        false
                      )}
                    </BaseChart>
                  </Grid>

                  <Grid item xs={12}>
                    <BaseChart title="Orders">
                      {createNivoBarChart(
                        ordersData,
                        ["Tw vs. Lw", "Tw vs. Ly"],
                        ["#4285f4", "#ea4335"],
                        "ordersPercentage",
                        formatPercentage,
                        false
                      )}
                    </BaseChart>
                  </Grid>

                  <Grid item xs={12}>
                    <BaseChart title="Avg Ticket">
                      {createNivoBarChart(
                        avgTicketData,
                        ["Tw vs. Lw", "Tw vs. Ly"],
                        ["#4285f4", "#ea4335"],
                        "avgTicket",
                        formatPercentage,
                        false
                      )}
                    </BaseChart>
                  </Grid>

                  <Grid item xs={12}>
                    <BaseChart title="Labor Hrs">
                      {createNivoBarChart(
                        laborHrsData,
                        ["Tw Lb Hrs", "Lw Lb Hrs"],
                        ["#000000", "#8bc34a"],
                        "laborHrs",
                        (value) => value.toFixed(2),
                        true,
                        (d) => d.data[`${d.id}`].toFixed(2)
                      )}
                    </BaseChart>
                  </Grid>

                  <Grid item xs={12}>
                    <BaseChart title="SPMH">
                      {createNivoBarChart(
                        spmhData,
                        ["Tw SPMH", "Lw SPMH"],
                        ["#000000", "#8bc34a"],
                        "spmh",
                        (value) => value.toFixed(2),
                        true,
                        (d) => d.data[`${d.id}`].toFixed(2)
                      )}
                    </BaseChart>
                  </Grid>

                  <Grid item xs={12}>
                    <BaseChart title="Labor $ Spent">
                      {createNivoBarChart(
                        laborCostData,
                        ["Tw Reg Pay", "Lw Reg Pay"],
                        ["#4285f4", "#ea4335"],
                        "laborCost",
                        formatCurrency,
                        true,
                        (d) => `${Math.floor(d.value / 1000)}k`
                      )}
                    </BaseChart>
                  </Grid>

                  <Grid item xs={12}>
                    <BaseChart title="Labor %">
                      {createNivoBarChart(
                        laborPercentageData,
                        ["Tw Lc %", "Lw Lc %"],
                        ["#4285f4", "#ea4335"],
                        "laborPercentage",
                        formatPercentage,
                        true,
                        (d) => `${d.value.toFixed(2)}%`
                      )}
                    </BaseChart>
                  </Grid>

                  <Grid item xs={12}>
                    <BaseChart title="COGS $">
                      {createNivoBarChart(
                        cogsData,
                        ["Tw COGS", "Lw COGS"],
                        ["#9c27b0", "#e57373"],
                        "cogs",
                        formatCurrency,
                        true,
                        (d) => `${Math.floor(d.value / 1000)}k`
                      )}
                    </BaseChart>
                  </Grid>

                  <Grid item xs={12}>
                    <BaseChart title="COGS %">
                      {createNivoBarChart(
                        cogsPercentageData,
                        ["Tw Fc %", "Lw Fc %"],
                        ["#9c27b0", "#e57373"],
                        "cogsPercentage",
                        formatPercentage,
                        true,
                        (d) => `${d.value.toFixed(2)}%`
                      )}
                    </BaseChart>
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Individual Chart Panels */}
              <TabPanel value={chartTab} index={1}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <BaseChart title="Sales">
                      {createNivoBarChart(
                        salesData,
                        ["Tw vs. Lw", "Tw vs. Ly"],
                        ["#4285f4", "#ea4335"],
                        "salesPercentage",
                        formatPercentage,
                        false
                      )}
                    </BaseChart>
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={chartTab} index={2}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <BaseChart title="Orders">
                      {createNivoBarChart(
                        ordersData,
                        ["Tw vs. Lw", "Tw vs. Ly"],
                        ["#4285f4", "#ea4335"],
                        "ordersPercentage",
                        formatPercentage,
                        false
                      )}
                    </BaseChart>
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={chartTab} index={3}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <BaseChart title="Avg Ticket">
                      {createNivoBarChart(
                        avgTicketData,
                        ["Tw vs. Lw", "Tw vs. Ly"],
                        ["#4285f4", "#ea4335"],
                        "avgTicket",
                        formatPercentage,
                        false
                      )}
                    </BaseChart>
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={chartTab} index={4}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <BaseChart title="Labor Hrs">
                      {createNivoBarChart(
                        laborHrsData,
                        ["Tw Lb Hrs", "Lw Lb Hrs"],
                        ["#000000", "#8bc34a"],
                        "laborHrs",
                        (value) => value.toFixed(2),
                        true,
                        (d) => d.data[`${d.id}`].toFixed(2)
                      )}
                    </BaseChart>
                  </Grid>

                  <Grid item xs={12}>
                    <BaseChart title="SPMH">
                      {createNivoBarChart(
                        spmhData,
                        ["Tw SPMH", "Lw SPMH"],
                        ["#000000", "#8bc34a"],
                        "spmh",
                        (value) => value.toFixed(2),
                        true,
                        (d) => d.data[`${d.id}`].toFixed(2)
                      )}
                    </BaseChart>
                  </Grid>

                  <Grid item xs={12}>
                    <BaseChart title="Labor $ Spent">
                      {createNivoBarChart(
                        laborCostData,
                        ["Tw Reg Pay", "Lw Reg Pay"],
                        ["#4285f4", "#ea4335"],
                        "laborCost",
                        formatCurrency,
                        true,
                        (d) => `${Math.floor(d.value / 1000)}k`
                      )}
                    </BaseChart>
                  </Grid>

                  <Grid item xs={12}>
                    <BaseChart title="Labor %">
                      {createNivoBarChart(
                        laborPercentageData,
                        ["Tw Lc %", "Lw Lc %"],
                        ["#4285f4", "#ea4335"],
                        "laborPercentage",
                        formatPercentage,
                        true,
                        (d) => `${d.value.toFixed(2)}%`
                      )}
                    </BaseChart>
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={chartTab} index={5}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <BaseChart title="COGS $">
                      {createNivoBarChart(
                        cogsData,
                        ["Tw COGS", "Lw COGS"],
                        ["#9c27b0", "#e57373"],
                        "cogs",
                        formatCurrency,
                        true,
                        (d) => `${Math.floor(d.value / 1000)}k`
                      )}
                    </BaseChart>
                  </Grid>

                  <Grid item xs={12}>
                    <BaseChart title="COGS %">
                      {createNivoBarChart(
                        cogsPercentageData,
                        ["Tw Fc %", "Lw Fc %"],
                        ["#9c27b0", "#e57373"],
                        "cogsPercentage",
                        formatPercentage,
                        true,
                        (d) => `${d.value.toFixed(2)}%`
                      )}
                    </BaseChart>
                  </Grid>
                </Grid>
              </TabPanel>
            </Box>
          </TabPanel>
        </Card>
      </>
      
    </Box>
  );
}
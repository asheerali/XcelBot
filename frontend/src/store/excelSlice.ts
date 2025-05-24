// store/excelSlice.ts - Updated with Product Mix support and all improvements

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { AppThunk } from "../index";

// Define the interfaces for our state
interface TableData {
  table1: any[];
  table2: any[];
  table3: any[];
  table4: any[];
  table5: any[];
  table6?: any[]; // Additional table for Product Mix
  table7?: any[]; // Additional table for Product Mix
  table8?: any[]; // Additional table for Product Mix
  table9?: any[]; // Additional table for Product Mix
  locations: string[];
  servers?: string[]; // Server list for Product Mix
  categories?: string[]; // Category list for Product Mix
  dateRanges: string[];
  fileLocation?: string | string[];
  dashboardName?: string;
  fileName?: string;
  data?: any;

  // Sales Wide specific data
  salesData?: any[];
  ordersData?: any[];
  avgTicketData?: any[];
  laborHrsData?: any[];
  spmhData?: any[];
  laborCostData?: any[];
  laborPercentageData?: any[];
  cogsData?: any[];
  cogsPercentageData?: any[];
  financialTables?: any[];
  dateOptions?: string[];
  years?: string[];
  quarters?: string[];
}

interface AnalyticsData {
  salesByWeek: any[];
  salesByDayOfWeek: any[];
  salesByTimeOfDay: any[];
  salesByCategory: any[];
  fileLocation?: string;
}

interface FileData {
  fileName: string;
  fileContent: string; // Added to store the file content for each file
  location: string;
  data: TableData;
  analyticsData?: AnalyticsData; // Store analytics data with each file
  uploadDate?: string;
  dashboard?: string;
}

interface FinancialData {
  fileName: string;
  fileContent: string; // Added to store the file content
  location: string;
  data: TableData;
  uploadDate?: string;
}

interface SalesData {
  fileName: string;
  fileContent: string; // Added to store the file content
  location: string;
  data: TableData;
  analyticsData?: AnalyticsData; // Added to store analytics with each sales file
  uploadDate?: string;
}

interface SalesWideData {
  fileName: string;
  fileContent: string; // Added to store the file content
  location: string;
  data: TableData;
  uploadDate?: string;
}

interface ProductMixData {
  fileName: string;
  fileContent: string; // Added to store the file content
  location: string;
  data: TableData;
  uploadDate?: string;
}

interface ExcelState {
  // General state
  fileName: string;
  fileContent: string | null;
  location: string;
  fileProcessed: boolean;
  tableData: TableData;
  analyticsData: AnalyticsData | null; // Added to store current analytics
  loading: boolean;
  error: string | null;

  // Files by type
  files: FileData[];
  financialFiles: FinancialData[];
  salesFiles: SalesData[];
  salesWideFiles: SalesWideData[];
  productMixFiles: ProductMixData[];

  // Locations by dashboard
  allLocations: string[];
  salesLocations: string[]; // Locations for sales split dashboard
  financialLocations: string[]; // Locations for financial dashboard
  salesWideLocations: string[]; // Locations for sales wide dashboard
  productMixLocations: string[]; // Locations for product mix dashboard

  // Current selected locations by dashboard
  currentSalesLocation: string;
  currentFinancialLocation: string;
  currentSalesWideLocation: string;
  currentProductMixLocation: string;

  // Filter states by dashboard
  salesFilters: {
    dateRangeType: string;
    startDate: string;
    endDate: string;
    location: string;
  };

  financialFilters: {
    store: string;
    year: string;
    dateRange: string;
  };

  salesWideFilters: {
    dateRangeType: string;
    startDate: string;
    endDate: string;
    location: string;
    date: string;
    year: string;
    quarters: number;
  };

  productMixFilters: {
    dateRangeType: string;
    startDate: string;
    endDate: string;
    location: string;
    server: string;
    category: string;
  };

  // Added to track the active file
  activeFileIndex: number;
}

// Define initial state
const initialState: ExcelState = {
  fileName: "",
  fileContent: null,
  location: "",
  fileProcessed: false,
  tableData: {
    table1: [],
    table2: [],
    table3: [],
    table4: [],
    table5: [],
    locations: [],
    dateRanges: [],
  },
  analyticsData: null, // Initialize analytics data as null
  loading: false,
  error: null,
  files: [],
  financialFiles: [],
  salesFiles: [],
  salesWideFiles: [],
  productMixFiles: [],
  allLocations: [],
  salesLocations: [],
  financialLocations: [],
  salesWideLocations: [],
  productMixLocations: [],
  currentSalesLocation: "",
  currentFinancialLocation: "",
  currentSalesWideLocation: "",
  currentProductMixLocation: "",
  salesFilters: {
    dateRangeType: "",
    startDate: "",
    endDate: "",
    location: "",
  },
  financialFilters: {
    store: "0001: Midtown East",
    year: "2025",
    dateRange: "1 | 12/30/2024 - 01/05/2025",
  },
  salesWideFilters: {
    dateRangeType: "Last 30 Days",
    startDate: "",
    endDate: "",
    location: "",
    date: "2 | 01/06/2025 - 01/12/2025",
    year: "2025",
    quarters: 1,
  },
  productMixFilters: {
    dateRangeType: "Last 30 Days",
    startDate: "",
    endDate: "",
    location: "",
    server: "All",
    category: "All",
  },
  activeFileIndex: -1, // Initialize with no active file
};

// Helper function to add a location to the appropriate dashboard location list
const addLocationToDashboardList = (
  state: ExcelState,
  location: string,
  dashboardName?: string
) => {
  // Add to allLocations if it doesn't exist
  if (!state.allLocations.includes(location)) {
    state.allLocations.push(location);
  }
  
  // Only add to specific dashboard location lists based on dashboard type
  if (
    dashboardName === "Sales Split" &&
    !state.salesLocations.includes(location)
  ) {
    state.salesLocations.push(location);
  } else if (
    dashboardName === "Financials" &&
    !state.financialLocations.includes(location)
  ) {
    state.financialLocations.push(location);
  } else if (
    dashboardName === "Sales Wide" &&
    !state.salesWideLocations.includes(location)
  ) {
    state.salesWideLocations.push(location);
  } else if (
    (dashboardName === "Product Mix" || dashboardName === "Product Mix ") &&
    !state.productMixLocations.includes(location)
  ) {
    state.productMixLocations.push(location);
  }
};

export const excelSlice = createSlice({
  name: "excel",
  initialState,
  reducers: {
    setExcelFile: (
      state,
      action: PayloadAction<{
        fileName: string;
        fileContent: string;
        location?: string;
      }>
    ) => {
      state.fileName = action.payload.fileName;
      state.fileContent = action.payload.fileContent;
      state.fileProcessed = false;
      if (action.payload.location) {
        state.location = action.payload.location;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setTableData: (state, action: PayloadAction<TableData>) => {
      state.tableData = action.payload;
      state.fileProcessed = true;

      // Update location from fileLocation if present
      if (action.payload.fileLocation) {
        if (Array.isArray(action.payload.fileLocation)) {
          state.location = action.payload.fileLocation[0];
        } else {
          state.location = action.payload.fileLocation;
        }
      }

      // Update the active file with this data if there is an active file
      if (state.activeFileIndex >= 0) {
        state.files[state.activeFileIndex].data = action.payload;
      }
    },
    // New action to set analytics data
    setAnalyticsData: (
      state,
      action: PayloadAction<{
        fileName: string;
        location: string;
        data: AnalyticsData;
      }>
    ) => {
      state.analyticsData = action.payload.data;

      // Find the matching file to store the analytics data with it
      const fileIndex = state.files.findIndex(
        (f) =>
          f.fileName === action.payload.fileName &&
          f.location === action.payload.location
      );

      if (fileIndex >= 0) {
        state.files[fileIndex].analyticsData = action.payload.data;
      }

      // Also update sales files if needed
      const salesFileIndex = state.salesFiles.findIndex(
        (f) =>
          f.fileName === action.payload.fileName &&
          f.location === action.payload.location
      );

      if (salesFileIndex >= 0) {
        state.salesFiles[salesFileIndex].analyticsData = action.payload.data;
      }
    },
    // Modified to properly categorize locations by dashboard type
    addFileData: (
      state,
      action: PayloadAction<{
        fileName: string;
        fileContent: string;
        location: string;
        data: TableData;
      }>
    ) => {
      // Check if file already exists for this location
      const existingFileIndex = state.files.findIndex(
        (f) => f.location === action.payload.location
      );

      // Get the dashboard type from the data
      const dashboardName = action.payload.data.dashboardName;

      // Create file data with upload timestamp and file content
      const fileData: FileData = {
        fileName: action.payload.fileName,
        fileContent: action.payload.fileContent, // Store the file content
        location: action.payload.location,
        data: action.payload.data,
        uploadDate: new Date().toISOString(),
        dashboard: dashboardName,
      };

      if (existingFileIndex >= 0) {
        // Update existing file
        state.files[existingFileIndex] = fileData;
        state.activeFileIndex = existingFileIndex;
      } else {
        // Add new file
        state.files.push(fileData);
        state.activeFileIndex = state.files.length - 1;
      }

      // Add location to appropriate dashboard lists
      addLocationToDashboardList(state, action.payload.location, dashboardName);

      // Update the current display data if it matches the location or if this is the first file
      if (
        state.location === action.payload.location ||
        state.files.length === 1
      ) {
        state.tableData = action.payload.data;
        state.fileName = action.payload.fileName;
        state.fileContent = action.payload.fileContent; // Update file content in main state
        state.fileProcessed = true;
        state.location = action.payload.location;
      }
    },
    // Fixed to only add location to financial locations
    addFinancialData: (
      state,
      action: PayloadAction<{
        fileName: string;
        fileContent: string;
        location: string;
        data: TableData;
      }>
    ) => {
      // Check if financial file already exists for this location
      const existingIndex = state.financialFiles.findIndex(
        (f) => f.location === action.payload.location
      );

      // Create financial data with upload timestamp and file content
      const financialData: FinancialData = {
        fileName: action.payload.fileName,
        fileContent: action.payload.fileContent, // Store file content
        location: action.payload.location,
        data: action.payload.data,
        uploadDate: new Date().toISOString(),
      };

      if (existingIndex >= 0) {
        // Update existing file
        state.financialFiles[existingIndex] = financialData;
      } else {
        // Add new file
        state.financialFiles.push(financialData);
      }

      // Add location to financial locations only
      if (!state.allLocations.includes(action.payload.location)) {
        state.allLocations.push(action.payload.location);
      }

      if (!state.financialLocations.includes(action.payload.location)) {
        state.financialLocations.push(action.payload.location);
      }

      // Set current financial location if this is the first file
      if (
        state.financialFiles.length === 1 ||
        !state.currentFinancialLocation
      ) {
        state.currentFinancialLocation = action.payload.location;
        state.financialFilters.store = action.payload.location;
      }
    },
    // Fixed to only add location to sales locations
    addSalesData: (
      state,
      action: PayloadAction<{
        fileName: string;
        fileContent: string;
        location: string;
        data: TableData;
      }>
    ) => {
      // Check if sales file already exists for this location
      const existingIndex = state.salesFiles.findIndex(
        (f) => f.location === action.payload.location
      );

      // Create sales data with upload timestamp and file content
      const salesData: SalesData = {
        fileName: action.payload.fileName,
        fileContent: action.payload.fileContent, // Store file content
        location: action.payload.location,
        data: action.payload.data,
        uploadDate: new Date().toISOString(),
      };

      if (existingIndex >= 0) {
        // Update existing file
        state.salesFiles[existingIndex] = salesData;
      } else {
        // Add new file
        state.salesFiles.push(salesData);
      }

      // Add location to sales locations only
      if (!state.allLocations.includes(action.payload.location)) {
        state.allLocations.push(action.payload.location);
      }

      if (!state.salesLocations.includes(action.payload.location)) {
        state.salesLocations.push(action.payload.location);
      }

      // Set current sales location if this is the first file
      if (state.salesFiles.length === 1 || !state.currentSalesLocation) {
        state.currentSalesLocation = action.payload.location;
        state.salesFilters.location = action.payload.location;
      }
    },
    // Fixed to only add location to sales wide locations
    addSalesWideData: (
      state,
      action: PayloadAction<{
        fileName: string;
        fileContent: string;
        location: string;
        data: TableData;
      }>
    ) => {
      // Check if sales wide file already exists for this location
      const existingIndex = state.salesWideFiles.findIndex(
        (f) => f.location === action.payload.location
      );

      // Create sales wide data with upload timestamp and file content
      const salesWideData: SalesWideData = {
        fileName: action.payload.fileName,
        fileContent: action.payload.fileContent, // Store file content
        location: action.payload.location,
        data: action.payload.data,
        uploadDate: new Date().toISOString(),
      };

      if (existingIndex >= 0) {
        // Update existing file
        state.salesWideFiles[existingIndex] = salesWideData;
      } else {
        // Add new file
        state.salesWideFiles.push(salesWideData);
      }

      // Add location to sales wide locations only
      if (!state.allLocations.includes(action.payload.location)) {
        state.allLocations.push(action.payload.location);
      }

      if (!state.salesWideLocations.includes(action.payload.location)) {
        state.salesWideLocations.push(action.payload.location);
      }

      // Set current sales wide location if this is the first file
      if (
        state.salesWideFiles.length === 1 ||
        !state.currentSalesWideLocation
      ) {
        state.currentSalesWideLocation = action.payload.location;
        state.salesWideFilters.location = action.payload.location;
      }
    },
    // NEW: Add Product Mix data
    addProductMixData: (
      state,
      action: PayloadAction<{
        fileName: string;
        fileContent: string;
        location: string;
        data: TableData;
      }>
    ) => {
      // Check if product mix file already exists for this location
      const existingIndex = state.productMixFiles.findIndex(
        (f) => f.location === action.payload.location
      );

      // Create product mix data with upload timestamp and file content
      const productMixData: ProductMixData = {
        fileName: action.payload.fileName,
        fileContent: action.payload.fileContent, // Store file content
        location: action.payload.location,
        data: action.payload.data,
        uploadDate: new Date().toISOString(),
      };

      if (existingIndex >= 0) {
        // Update existing file
        state.productMixFiles[existingIndex] = productMixData;
      } else {
        // Add new file
        state.productMixFiles.push(productMixData);
      }

      // Add location to product mix locations only
      if (!state.allLocations.includes(action.payload.location)) {
        state.allLocations.push(action.payload.location);
      }

      if (!state.productMixLocations.includes(action.payload.location)) {
        state.productMixLocations.push(action.payload.location);
      }

      // Set current product mix location if this is the first file
      if (
        state.productMixFiles.length === 1 ||
        !state.currentProductMixLocation
      ) {
        state.currentProductMixLocation = action.payload.location;
        state.productMixFilters.location = action.payload.location;
      }
    },
    // Now just maintains the allLocations list
    setLocations: (state, action: PayloadAction<string[]>) => {
      // Set all locations (without duplicates)
      const newLocations = action.payload.filter(
        (loc) => loc && loc.trim() !== ""
      );
      state.allLocations = [
        ...new Set([...state.allLocations, ...newLocations]),
      ];
    },
    // Below methods now just set their specific location lists
    setSalesLocations: (state, action: PayloadAction<string[]>) => {
      state.salesLocations = action.payload;
    },
    setFinancialLocations: (state, action: PayloadAction<string[]>) => {
      state.financialLocations = action.payload;
    },
    setSalesWideLocations: (state, action: PayloadAction<string[]>) => {
      state.salesWideLocations = action.payload;
    },
    setProductMixLocations: (state, action: PayloadAction<string[]>) => {
      state.productMixLocations = action.payload;
    },
    // Enhanced to update active file index and handle dashboard-specific file selection
    selectLocation: (state, action: PayloadAction<string>) => {
      const location = action.payload;
      state.location = location;

      // Find file data for this location
      const fileIndex = state.files.findIndex((f) => f.location === location);

      if (fileIndex >= 0) {
        // Update active file index
        state.activeFileIndex = fileIndex;

        // Get the file
        const file = state.files[fileIndex];

        // Update current data with the file's data
        state.tableData = file.data;
        state.fileName = file.fileName;
        state.fileContent = file.fileContent; // Update file content
        state.fileProcessed = true;

        // Update analytics data if available
        if (file.analyticsData) {
          state.analyticsData = file.analyticsData;
        } else {
          state.analyticsData = null; // Clear if not available
        }

        // Update dashboard-specific location based on file's dashboard type
        if (file.dashboard === "Sales Split") {
          state.currentSalesLocation = location;
          state.salesFilters.location = location;
        } else if (file.dashboard === "Financials") {
          state.currentFinancialLocation = location;
          state.financialFilters.store = location;
        } else if (file.dashboard === "Sales Wide") {
          state.currentSalesWideLocation = location;
          state.salesWideFilters.location = location;
        } else if (file.dashboard === "Product Mix" || file.dashboard === "Product Mix ") {
          state.currentProductMixLocation = location;
          state.productMixFilters.location = location;
        }
      } else {
        // If no matching file found, try to find in specialized files
        const salesData = state.salesFiles.find((f) => f.location === location);
        const financialData = state.financialFiles.find(
          (f) => f.location === location
        );
        const salesWideData = state.salesWideFiles.find(
          (f) => f.location === location
        );
        const productMixData = state.productMixFiles.find(
          (f) => f.location === location
        );

        // Use the first available data
        if (salesData) {
          state.tableData = salesData.data;
          state.fileName = salesData.fileName;
          state.fileContent = salesData.fileContent;
          state.fileProcessed = true;
          state.analyticsData = salesData.analyticsData || null;
          state.currentSalesLocation = location;
          state.salesFilters.location = location;
        } else if (financialData) {
          state.tableData = financialData.data;
          state.fileName = financialData.fileName;
          state.fileContent = financialData.fileContent;
          state.fileProcessed = true;
          state.analyticsData = null; // Financial files don't have analytics
          state.currentFinancialLocation = location;
          state.financialFilters.store = location;
        } else if (salesWideData) {
          state.tableData = salesWideData.data;
          state.fileName = salesWideData.fileName;
          state.fileContent = salesWideData.fileContent;
          state.fileProcessed = true;
          state.analyticsData = null; // Sales wide files don't have analytics
          state.currentSalesWideLocation = location;
          state.salesWideFilters.location = location;
        } else if (productMixData) {
          state.tableData = productMixData.data;
          state.fileName = productMixData.fileName;
          state.fileContent = productMixData.fileContent;
          state.fileProcessed = true;
          state.analyticsData = null; // Product mix files don't have analytics
          state.currentProductMixLocation = location;
          state.productMixFilters.location = location;
        } else {
          // If no matching file found, keep the current data but update location
          state.location = location;
        }
      }
    },
    // Enhanced to update file content - Sales-specific location selection
    selectSalesLocation: (state, action: PayloadAction<string>) => {
      const location = action.payload;
      state.currentSalesLocation = location;
      state.salesFilters.location = location;

      // Find sales data for this location
      const salesData = state.salesFiles.find((f) => f.location === location);

      if (salesData) {
        state.tableData = salesData.data;
        state.fileName = salesData.fileName;
        state.fileContent = salesData.fileContent; // Update file content
        state.fileProcessed = true;
        state.location = location;
        state.analyticsData = salesData.analyticsData || null;

        // Update active file index in main files array
        const fileIndex = state.files.findIndex(
          (f) => f.location === location && f.dashboard === "Sales Split"
        );
        if (fileIndex >= 0) {
          state.activeFileIndex = fileIndex;
        }
      }
    },
    // Enhanced to update file content - Financial-specific location selection
    selectFinancialLocation: (state, action: PayloadAction<string>) => {
      const location = action.payload;
      state.currentFinancialLocation = location;
      state.financialFilters.store = location;

      // Find financial data for this location
      const financialData = state.financialFiles.find(
        (f) => f.location === location
      );

      if (financialData) {
        state.tableData = financialData.data;
        state.fileName = financialData.fileName;
        state.fileContent = financialData.fileContent; // Update file content
        state.fileProcessed = true;
        state.location = location;

        // Update active file index in main files array
        const fileIndex = state.files.findIndex(
          (f) => f.location === location && f.dashboard === "Financials"
        );
        if (fileIndex >= 0) {
          state.activeFileIndex = fileIndex;
        }
      }
    },
    // Enhanced to update file content - Sales Wide-specific location selection
    selectSalesWideLocation: (state, action: PayloadAction<string>) => {
      const location = action.payload;
      state.currentSalesWideLocation = location;
      state.salesWideFilters.location = location;

      // Find sales wide data for this location
      const salesWideData = state.salesWideFiles.find(
        (f) => f.location === location
      );

      if (salesWideData) {
        state.tableData = salesWideData.data;
        state.fileName = salesWideData.fileName;
        state.fileContent = salesWideData.fileContent; // Update file content
        state.fileProcessed = true;
        state.location = location;

        // Update active file index in main files array
        const fileIndex = state.files.findIndex(
          (f) => f.location === location && f.dashboard === "Sales Wide"
        );
        if (fileIndex >= 0) {
          state.activeFileIndex = fileIndex;
        }
      }
    },
    // NEW: Product Mix-specific location selection
    selectProductMixLocation: (state, action: PayloadAction<string>) => {
      const location = action.payload;
      state.currentProductMixLocation = location;
      state.productMixFilters.location = location;

      // Find product mix data for this location
      const productMixData = state.productMixFiles.find(
        (f) => f.location === location
      );

      if (productMixData) {
        state.tableData = productMixData.data;
        state.fileName = productMixData.fileName;
        state.fileContent = productMixData.fileContent; // Update file content
        state.fileProcessed = true;
        state.location = location;

        // Update active file index in main files array
        const fileIndex = state.files.findIndex(
          (f) => f.location === location && (f.dashboard === "Product Mix" || f.dashboard === "Product Mix ")
        );
        if (fileIndex >= 0) {
          state.activeFileIndex = fileIndex;
        }
      }
    },
    updateSalesFilters: (
      state,
      action: PayloadAction<Partial<typeof initialState.salesFilters>>
    ) => {
      state.salesFilters = { ...state.salesFilters, ...action.payload };
    },
    updateFinancialFilters: (
      state,
      action: PayloadAction<Partial<typeof initialState.financialFilters>>
    ) => {
      state.financialFilters = { ...state.financialFilters, ...action.payload };
    },
    updateSalesWideFilters: (
      state,
      action: PayloadAction<Partial<typeof initialState.salesWideFilters>>
    ) => {
      state.salesWideFilters = { ...state.salesWideFilters, ...action.payload };
    },
    // NEW: Update Product Mix filters
    updateProductMixFilters: (
      state,
      action: PayloadAction<Partial<typeof initialState.productMixFilters>>
    ) => {
      state.productMixFilters = { ...state.productMixFilters, ...action.payload };
    },
    resetExcelData: (state) => {
      return initialState;
    },
  },
});

// Export actions
export const {
  setExcelFile,
  setLoading,
  setError,
  setTableData,
  setAnalyticsData,
  addFileData,
  addFinancialData,
  addSalesData,
  addSalesWideData,
  addProductMixData,
  setLocations,
  setSalesLocations,
  setFinancialLocations,
  setSalesWideLocations,
  setProductMixLocations,
  selectLocation,
  selectSalesLocation,
  selectFinancialLocation,
  selectSalesWideLocation,
  selectProductMixLocation,
  updateSalesFilters,
  updateFinancialFilters,
  updateSalesWideFilters,
  updateProductMixFilters,
  resetExcelData,
} = excelSlice.actions;

// Thunk action creators
export const fetchAnalytics =
  (fileName: string, dateRangeType: string, location: string): AppThunk =>
  async (dispatch, getState) => {
    try {
      dispatch(setLoading(true));

      // Get the file content from state
      const state = getState();
      let fileContent: string | null = null;

      // Check if the file exists in any of the file collections
      const file = state.excel.files.find(
        (f) => f.fileName === fileName && f.location === location
      );
      const salesFile = state.excel.salesFiles.find(
        (f) => f.fileName === fileName && f.location === location
      );

      if (file) {
        fileContent = file.fileContent;
      } else if (salesFile) {
        fileContent = salesFile.fileContent;
      } else {
        // If no file found, use the current fileContent from state
        fileContent = state.excel.fileContent;
      }

      if (!fileContent) {
        throw new Error(
          `No file content found for ${fileName} at location ${location}`
        );
      }

      // Create the payload
      const payload = {
        fileName,
        fileContent,
        dateRangeType,
        location,
        // Add any other necessary parameters for your API
        startDate: state.excel.salesFilters.startDate,
        endDate: state.excel.salesFilters.endDate,
      };

      console.log("Fetching analytics with payload:", payload);

      // Make the API call
      const response = await axios.post("/api/excel/analytics", payload);

      if (response.data) {
        dispatch(
          setAnalyticsData({
            fileName,
            location,
            data: response.data,
          })
        );
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      dispatch(
        setError(error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

// Updated to check if the file is of the appropriate dashboard type
export const selectFileAndFetchData =
  (location: string, dashboardType: string = ""): AppThunk =>
  async (dispatch, getState) => {
    const state = getState();

    // Find the file for the selected location with matching dashboard type if specified
    let fileIndex = -1;

    if (dashboardType) {
      fileIndex = state.excel.files.findIndex(
        (f) => f.location === location && f.dashboard === dashboardType
      );
    } else {
      fileIndex = state.excel.files.findIndex((f) => f.location === location);
    }

    if (fileIndex >= 0) {
      const file = state.excel.files[fileIndex];

      // Select based on dashboard type
      if (file.dashboard === "Sales Split") {
        dispatch(selectSalesLocation(location));
      } else if (file.dashboard === "Financials") {
        dispatch(selectFinancialLocation(location));
      } else if (file.dashboard === "Sales Wide") {
        dispatch(selectSalesWideLocation(location));
      } else if (file.dashboard === "Product Mix" || file.dashboard === "Product Mix ") {
        dispatch(selectProductMixLocation(location));
      } else {
        // Fallback to general selection
        dispatch(selectLocation(location));
      }

      // Then fetch the analytics data if needed for Sales Split dashboard
      if (file.dashboard === "Sales Split" && !file.analyticsData) {
        dispatch(
          fetchAnalytics(
            file.fileName,
            state.excel.salesFilters.dateRangeType,
            location
          )
        );
      }
    }
  };

// Updated to use the correct file for the current dashboard
export const applyFilters =
  (dashboardType: string = "Sales Split"): AppThunk =>
  async (dispatch, getState) => {
    const state = getState();

    if (state.excel.files.length === 0) {
      dispatch(setError("No files uploaded"));
      return;
    }

    try {
      dispatch(setLoading(true));

      // Determine which file to use based on the dashboard type
      let file: FileData | undefined;
      let location: string = "";
      let payload: any = {};

      if (dashboardType === "Sales Split") {
        location =
          state.excel.salesFilters.location || state.excel.currentSalesLocation;
        file = state.excel.files.find(
          (f) => f.location === location && f.dashboard === "Sales Split"
        );

        // Fall back to the first Sales Split file if we couldn't find one for this location
        if (!file) {
          file = state.excel.files.find((f) => f.dashboard === "Sales Split");
          if (file) location = file.location;
        }

        if (file) {
          payload = {
            fileName: file.fileName,
            fileContent: file.fileContent,
            location: location,
            dateRangeType: state.excel.salesFilters.dateRangeType,
            startDate: state.excel.salesFilters.startDate,
            endDate: state.excel.salesFilters.endDate,
          };
        }
      } else if (dashboardType === "Financials") {
        location =
          state.excel.financialFilters.store ||
          state.excel.currentFinancialLocation;
        file = state.excel.files.find(
          (f) => f.location === location && f.dashboard === "Financials"
        );

        // Fall back to the first Financial file
        if (!file) {
          file = state.excel.files.find((f) => f.dashboard === "Financials");
          if (file) location = file.location;
        }

        if (file) {
          payload = {
            fileName: file.fileName,
            fileContent: file.fileContent,
            location: location,
            // Add financial-specific filter parameters as needed
          };
        }
      } else if (dashboardType === "Sales Wide") {
        location =
          state.excel.salesWideFilters.location ||
          state.excel.currentSalesWideLocation;
        file = state.excel.files.find(
          (f) => f.location === location && f.dashboard === "Sales Wide"
        );

        // Fall back to the first Sales Wide file
        if (!file) {
          file = state.excel.files.find((f) => f.dashboard === "Sales Wide");
          if (file) location = file.location;
        }

        if (file) {
          payload = {
            fileName: file.fileName,
            fileContent: file.fileContent,
            location: location,
            dateRangeType: state.excel.salesWideFilters.dateRangeType,
            startDate: state.excel.salesWideFilters.startDate,
            endDate: state.excel.salesWideFilters.endDate,
          };
        }
      } else if (dashboardType === "Product Mix") {
        location =
          state.excel.productMixFilters.location ||
          state.excel.currentProductMixLocation;
        file = state.excel.files.find(
          (f) => f.location === location && (f.dashboard === "Product Mix" || f.dashboard === "Product Mix ")
        );

        // Fall back to the first Product Mix file
        if (!file) {
          file = state.excel.files.find((f) => f.dashboard === "Product Mix" || f.dashboard === "Product Mix ");
          if (file) location = file.location;
        }

        if (file) {
          payload = {
            fileName: file.fileName,
            fileContent: file.fileContent,
            location: location,
            server: state.excel.productMixFilters.server,
            dateRangeType: state.excel.productMixFilters.dateRangeType,
            startDate: state.excel.productMixFilters.startDate,
            endDate: state.excel.productMixFilters.endDate,
          };
        }
      }

      // Use the active file as a last resort
      if (!file && state.excel.activeFileIndex >= 0) {
        file = state.excel.files[state.excel.activeFileIndex];
        location = file.location;
        payload = {
          fileName: file.fileName,
          fileContent: file.fileContent,
          location: location,
          dateRangeType: state.excel.salesFilters.dateRangeType,
          startDate: state.excel.salesFilters.startDate,
          endDate: state.excel.salesFilters.endDate,
        };
      }

      if (!file) {
        throw new Error(`No ${dashboardType} file available to apply filters`);
      }

      console.log(`Sending filter request for ${dashboardType}:`, payload);

      // Make the API call to filter endpoint
      const response = await axios.post("/api/excel/filter", payload);

      if (response.data) {
        // Handle array response (multiple dashboards)
        let dashboardsData = [];
        
        if (Array.isArray(response.data)) {
          dashboardsData = response.data;
        } else {
          dashboardsData = [response.data];
        }

        // Process the first matching dashboard or fallback to first dashboard
        const relevantData = dashboardsData.find(data => 
          data.dashboardName === dashboardType || 
          (dashboardType === "Product Mix" && (data.dashboardName === "Product Mix" || data.dashboardName === "Product Mix "))
        ) || dashboardsData[0];

        // Update the table data
        dispatch(setTableData(relevantData));

        // Also fetch analytics with the new filters for Sales Split dashboard
        if (dashboardType === "Sales Split") {
          dispatch(
            fetchAnalytics(
              file.fileName,
              state.excel.salesFilters.dateRangeType,
              location
            )
          );
        }
      }
    } catch (error) {
      console.error(`Error applying ${dashboardType} filters:`, error);
      dispatch(
        setError(error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

export default excelSlice.reducer;
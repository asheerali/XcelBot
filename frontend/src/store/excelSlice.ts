// store/excelSlice.ts - Updated with Categories support and all improvements

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
  categories?: string[]; // Added to store categories for each file
}

interface FinancialData {
  fileName: string;
  fileContent: string; // Added to store the file content
  location: string;
  data: TableData;
  uploadDate?: string;
  categories?: string[]; // Added categories support
}

interface SalesData {
  fileName: string;
  fileContent: string; // Added to store the file content
  location: string;
  data: TableData;
  analyticsData?: AnalyticsData; // Added to store analytics with each sales file
  uploadDate?: string;
  categories?: string[]; // Added categories support
}

interface SalesWideData {
  fileName: string;
  fileContent: string; // Added to store the file content
  location: string;
  data: TableData;
  uploadDate?: string;
  categories?: string[]; // Added categories support
}

interface ProductMixData {
  fileName: string;
  fileContent: string; // Added to store the file content
  location: string;
  data: TableData;
  uploadDate?: string;
  categories?: string[]; // Added categories support
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

  // Global categories - aggregated from all files
  allCategories: string[];
  
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

  // Categories by dashboard type
  salesCategories: string[]; // Categories for sales split dashboard
  financialCategories: string[]; // Categories for financial dashboard
  salesWideCategories: string[]; // Categories for sales wide dashboard
  productMixCategories: string[]; // Categories for product mix dashboard

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
    selectedCategories: string[]; // Added for category filtering
  };

  financialFilters: {
    store: string;
    year: string;
    dateRange: string;
    selectedCategories: string[]; // Added for category filtering
  };

  salesWideFilters: {
    dateRangeType: string;
    startDate: string;
    endDate: string;
    location: string;
    date: string;
    year: string;
    quarters: number;
    selectedCategories: string[]; // Added for category filtering
  };

  productMixFilters: {
    dateRangeType: string;
    startDate: string;
    endDate: string;
    location: string;
    server: string;
    category: string;
    selectedCategories: string[]; // Added for category filtering
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
  allCategories: [], // Initialize global categories
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
  salesCategories: [],
  financialCategories: [],
  salesWideCategories: [],
  productMixCategories: [],
  currentSalesLocation: "",
  currentFinancialLocation: "",
  currentSalesWideLocation: "",
  currentProductMixLocation: "",
  salesFilters: {
    dateRangeType: "",
    startDate: "",
    endDate: "",
    location: "",
    selectedCategories: [],
  },
  financialFilters: {
    store: "0001: Midtown East",
    year: "2025",
    dateRange: "1 | 12/30/2024 - 01/05/2025",
    selectedCategories: [],
  },
  salesWideFilters: {
    dateRangeType: "Last 30 Days",
    startDate: "",
    endDate: "",
    location: "",
    date: "2 | 01/06/2025 - 01/12/2025",
    year: "2025",
    quarters: 1,
    selectedCategories: [],
  },
  productMixFilters: {
    dateRangeType: "Last 30 Days",
    startDate: "",
    endDate: "",
    location: "",
    server: "All",
    category: "All",
    selectedCategories: [],
  },
  activeFileIndex: -1, // Initialize with no active file
};

// Helper function to add categories to global and dashboard-specific lists
const addCategoriesToState = (
  state: ExcelState,
  categories: string[],
  dashboardName?: string
) => {
  if (!categories || categories.length === 0) return;

  // Add to global categories
  const newGlobalCategories = [...new Set([...state.allCategories, ...categories])];
  state.allCategories = newGlobalCategories;

  // Add to dashboard-specific categories
  if (dashboardName === "Sales Split") {
    const newSalesCategories = [...new Set([...state.salesCategories, ...categories])];
    state.salesCategories = newSalesCategories;
  } else if (dashboardName === "Financials") {
    const newFinancialCategories = [...new Set([...state.financialCategories, ...categories])];
    state.financialCategories = newFinancialCategories;
  } else if (dashboardName === "Sales Wide") {
    const newSalesWideCategories = [...new Set([...state.salesWideCategories, ...categories])];
    state.salesWideCategories = newSalesWideCategories;
  } else if (dashboardName === "Product Mix" || dashboardName === "Product Mix ") {
    const newProductMixCategories = [...new Set([...state.productMixCategories, ...categories])];
    state.productMixCategories = newProductMixCategories;
  }
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

      // Update categories if present in table data
      if (action.payload.categories) {
        addCategoriesToState(state, action.payload.categories, action.payload.dashboardName);
      }

      // Update the active file with this data if there is an active file
      if (state.activeFileIndex >= 0) {
        state.files[state.activeFileIndex].data = action.payload;
        // Update categories for the active file
        if (action.payload.categories) {
          state.files[state.activeFileIndex].categories = action.payload.categories;
        }
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
    // Modified to properly categorize locations by dashboard type and handle categories
    addFileData: (
      state,
      action: PayloadAction<{
        fileName: string;
        fileContent: string;
        location: string;
        data: TableData;
        categories?: string[];
      }>
    ) => {
      // Check if file already exists for this location
      const existingFileIndex = state.files.findIndex(
        (f) => f.location === action.payload.location
      );

      // Get the dashboard type from the data
      const dashboardName = action.payload.data.dashboardName;
      const categories = action.payload.categories || action.payload.data.categories || [];

      // Create file data with upload timestamp, file content, and categories
      const fileData: FileData = {
        fileName: action.payload.fileName,
        fileContent: action.payload.fileContent, // Store the file content
        location: action.payload.location,
        data: action.payload.data,
        uploadDate: new Date().toISOString(),
        dashboard: dashboardName,
        categories: categories, // Store categories with the file
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
      
      // Add categories to state
      addCategoriesToState(state, categories, dashboardName);

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
    // Fixed to only add location to financial locations and handle categories
    addFinancialData: (
      state,
      action: PayloadAction<{
        fileName: string;
        fileContent: string;
        location: string;
        data: TableData;
        categories?: string[];
      }>
    ) => {
      // Check if financial file already exists for this location
      const existingIndex = state.financialFiles.findIndex(
        (f) => f.location === action.payload.location
      );

      const categories = action.payload.categories || action.payload.data.categories || [];

      // Create financial data with upload timestamp, file content, and categories
      const financialData: FinancialData = {
        fileName: action.payload.fileName,
        fileContent: action.payload.fileContent, // Store file content
        location: action.payload.location,
        data: action.payload.data,
        uploadDate: new Date().toISOString(),
        categories: categories, // Store categories
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

      // Add categories to state
      addCategoriesToState(state, categories, "Financials");

      // Set current financial location if this is the first file
      if (
        state.financialFiles.length === 1 ||
        !state.currentFinancialLocation
      ) {
        state.currentFinancialLocation = action.payload.location;
        state.financialFilters.store = action.payload.location;
      }
    },
    // Fixed to only add location to sales locations and handle categories
    addSalesData: (
      state,
      action: PayloadAction<{
        fileName: string;
        fileContent: string;
        location: string;
        data: TableData;
        categories?: string[];
      }>
    ) => {
      // Check if sales file already exists for this location
      const existingIndex = state.salesFiles.findIndex(
        (f) => f.location === action.payload.location
      );

      const categories = action.payload.categories || action.payload.data.categories || [];

      // Create sales data with upload timestamp, file content, and categories
      const salesData: SalesData = {
        fileName: action.payload.fileName,
        fileContent: action.payload.fileContent, // Store file content
        location: action.payload.location,
        data: action.payload.data,
        uploadDate: new Date().toISOString(),
        categories: categories, // Store categories
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

      // Add categories to state
      addCategoriesToState(state, categories, "Sales Split");

      // Set current sales location if this is the first file
      if (state.salesFiles.length === 1 || !state.currentSalesLocation) {
        state.currentSalesLocation = action.payload.location;
        state.salesFilters.location = action.payload.location;
      }
    },
    // Fixed to only add location to sales wide locations and handle categories
    addSalesWideData: (
      state,
      action: PayloadAction<{
        fileName: string;
        fileContent: string;
        location: string;
        data: TableData;
        categories?: string[];
      }>
    ) => {
      // Check if sales wide file already exists for this location
      const existingIndex = state.salesWideFiles.findIndex(
        (f) => f.location === action.payload.location
      );

      const categories = action.payload.categories || action.payload.data.categories || [];

      // Create sales wide data with upload timestamp, file content, and categories
      const salesWideData: SalesWideData = {
        fileName: action.payload.fileName,
        fileContent: action.payload.fileContent, // Store file content
        location: action.payload.location,
        data: action.payload.data,
        uploadDate: new Date().toISOString(),
        categories: categories, // Store categories
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

      // Add categories to state
      addCategoriesToState(state, categories, "Sales Wide");

      // Set current sales wide location if this is the first file
      if (
        state.salesWideFiles.length === 1 ||
        !state.currentSalesWideLocation
      ) {
        state.currentSalesWideLocation = action.payload.location;
        state.salesWideFilters.location = action.payload.location;
      }
    },
    // NEW: Add Product Mix data with categories support
    addProductMixData: (
      state,
      action: PayloadAction<{
        fileName: string;
        fileContent: string;
        location: string;
        data: TableData;
        categories?: string[];
      }>
    ) => {
      // console.log('🎯 addProductMixData action received:', action.payload);
      
      // Check if product mix file already exists for this location
      const existingIndex = state.productMixFiles.findIndex(
        (f) => f.location === action.payload.location
      );

      // console.log('Existing Product Mix file index:', existingIndex);

      const categories = action.payload.categories || action.payload.data.categories || [];
      // console.log('Categories for Product Mix:', categories);

      // Create product mix data with upload timestamp, file content, and categories
      const productMixData: ProductMixData = {
        fileName: action.payload.fileName,
        fileContent: action.payload.fileContent, // Store file content
        location: action.payload.location,
        data: action.payload.data,
        uploadDate: new Date().toISOString(),
        categories: categories, // Store categories
      };

      // console.log('Creating Product Mix data object:', productMixData);

      if (existingIndex >= 0) {
        // Update existing file
        state.productMixFiles[existingIndex] = productMixData;
        // console.log('Updated existing Product Mix file at index:', existingIndex);
      } else {
        // Add new file
        state.productMixFiles.push(productMixData);
        // console.log('Added new Product Mix file. Total Product Mix files:', state.productMixFiles.length);
      }

      // Add location to product mix locations only
      if (!state.allLocations.includes(action.payload.location)) {
        state.allLocations.push(action.payload.location);
      }

      if (!state.productMixLocations.includes(action.payload.location)) {
        state.productMixLocations.push(action.payload.location);
        // console.log('Added location to Product Mix locations:', action.payload.location);
      }

      // Add categories to state
      addCategoriesToState(state, categories, "Product Mix");

      // Set current product mix location if this is the first file
      if (
        state.productMixFiles.length === 1 ||
        !state.currentProductMixLocation
      ) {
        state.currentProductMixLocation = action.payload.location;
        state.productMixFilters.location = action.payload.location;
        console.log('Set current Product Mix location:', action.payload.location);
      }

      console.log('Product Mix state after update:', {
        filesCount: state.productMixFiles.length,
        locations: state.productMixLocations,
        currentLocation: state.currentProductMixLocation,
        categories: state.productMixCategories
      });
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
    // NEW: Set global categories
    setCategories: (state, action: PayloadAction<string[]>) => {
      const newCategories = action.payload.filter(
        (cat) => cat && cat.trim() !== ""
      );
      state.allCategories = [
        ...new Set([...state.allCategories, ...newCategories]),
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
    // NEW: Category setters for each dashboard type
    setSalesCategories: (state, action: PayloadAction<string[]>) => {
      state.salesCategories = action.payload;
    },
    setFinancialCategories: (state, action: PayloadAction<string[]>) => {
      state.financialCategories = action.payload;
    },
    setSalesWideCategories: (state, action: PayloadAction<string[]>) => {
      state.salesWideCategories = action.payload;
    },
    setProductMixCategories: (state, action: PayloadAction<string[]>) => {
      state.productMixCategories = action.payload;
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
  setCategories,
  setSalesLocations,
  setFinancialLocations,
  setSalesWideLocations,
  setProductMixLocations,
  setSalesCategories,
  setFinancialCategories,
  setSalesWideCategories,
  setProductMixCategories,
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

// Thunk action creators (keeping existing ones)
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

// Selectors for accessing state data
export const selectExcelFile = (state: { excel: ExcelState }) => state.excel;
export const selectTableData = (state: { excel: ExcelState }) => state.excel.tableData;
export const selectAnalyticsData = (state: { excel: ExcelState }) => state.excel.analyticsData;
export const selectLoading = (state: { excel: ExcelState }) => state.excel.loading;
export const selectError = (state: { excel: ExcelState }) => state.excel.error;
export const selectCurrentLocation = (state: { excel: ExcelState }) => state.excel.location;
export const selectAllLocations = (state: { excel: ExcelState }) => state.excel.allLocations;

// Categories selectors
export const selectAllCategories = (state: { excel: ExcelState }) => state.excel.allCategories;
export const selectSalesCategories = (state: { excel: ExcelState }) => state.excel.salesCategories;
export const selectFinancialCategories = (state: { excel: ExcelState }) => state.excel.financialCategories;
export const selectSalesWideCategories = (state: { excel: ExcelState }) => state.excel.salesWideCategories;
export const selectProductMixCategories = (state: { excel: ExcelState }) => state.excel.productMixCategories;

// Dashboard-specific selectors
export const selectSalesLocations = (state: { excel: ExcelState }) => state.excel.salesLocations;
export const selectFinancialLocations = (state: { excel: ExcelState }) => state.excel.financialLocations;
export const selectSalesWideLocations = (state: { excel: ExcelState }) => state.excel.salesWideLocations;
export const selectProductMixLocations = (state: { excel: ExcelState }) => state.excel.productMixLocations;

// Current location selectors
export const selectCurrentSalesLocation = (state: { excel: ExcelState }) => state.excel.currentSalesLocation;
export const selectCurrentFinancialLocation = (state: { excel: ExcelState }) => state.excel.currentFinancialLocation;
export const selectCurrentSalesWideLocation = (state: { excel: ExcelState }) => state.excel.currentSalesWideLocation;
export const selectCurrentProductMixLocation = (state: { excel: ExcelState }) => state.excel.currentProductMixLocation;

// Filter selectors
export const selectSalesFilters = (state: { excel: ExcelState }) => state.excel.salesFilters;
export const selectFinancialFilters = (state: { excel: ExcelState }) => state.excel.financialFilters;
export const selectSalesWideFilters = (state: { excel: ExcelState }) => state.excel.salesWideFilters;
export const selectProductMixFilters = (state: { excel: ExcelState }) => state.excel.productMixFilters;

// File data selectors
export const selectFiles = (state: { excel: ExcelState }) => state.excel.files;
export const selectFinancialFiles = (state: { excel: ExcelState }) => state.excel.financialFiles;
export const selectSalesFiles = (state: { excel: ExcelState }) => state.excel.salesFiles;
export const selectSalesWideFiles = (state: { excel: ExcelState }) => state.excel.salesWideFiles;
export const selectProductMixFiles = (state: { excel: ExcelState }) => state.excel.productMixFiles;

// Data by location selectors
export const selectSalesDataByLocation = (state: { excel: ExcelState }, location: string) =>
  state.excel.salesFiles.find(f => f.location === location);

export const selectFinancialDataByLocation = (state: { excel: ExcelState }, location: string) =>
  state.excel.financialFiles.find(f => f.location === location);

export const selectSalesWideDataByLocation = (state: { excel: ExcelState }, location: string) =>
  state.excel.salesWideFiles.find(f => f.location === location);

export const selectProductMixDataByLocation = (state: { excel: ExcelState }, location: string) =>
  state.excel.productMixFiles.find(f => f.location === location);

// Categories by location selectors
export const selectCategoriesByLocation = (state: { excel: ExcelState }, location: string, dashboardType?: string) => {
  let file;
  
  switch (dashboardType) {
    case 'Sales Split':
      file = state.excel.salesFiles.find(f => f.location === location);
      break;
    case 'Financials':
      file = state.excel.financialFiles.find(f => f.location === location);
      break;
    case 'Sales Wide':
      file = state.excel.salesWideFiles.find(f => f.location === location);
      break;
    case 'Product Mix':
      file = state.excel.productMixFiles.find(f => f.location === location);
      break;
    default:
      file = state.excel.files.find(f => f.location === location);
  }
  
  return file?.categories || [];
};

export default excelSlice.reducer;
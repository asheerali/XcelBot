// store/excelSlice.ts - Complete implementation with Sales Wide support

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the interfaces for our state
interface TableData {
  table1: any[];
  table2: any[];
  table3: any[];
  table4: any[];
  table5: any[];
  locations: string[];
  dateRanges: string[];
  fileLocation?: string;
  dashboardName?: string;
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
  helpers?: string[];
  years?: string[];
  equators?: string[];
}

interface FileData {
  fileName: string;
  location: string;
  data: TableData;
  uploadDate?: string;
  dashboard?: string;
}

interface FinancialData {
  fileName: string;
  location: string;
  data: TableData;
  uploadDate?: string;
}

interface SalesData {
  fileName: string;
  location: string;
  data: TableData;
  uploadDate?: string;
}

interface SalesWideData {
  fileName: string;
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
  loading: boolean;
  error: string | null;
  
  // Files by type
  files: FileData[];
  financialFiles: FinancialData[];
  salesFiles: SalesData[];
  salesWideFiles: SalesWideData[];
  
  // Locations by dashboard
  allLocations: string[];
  salesLocations: string[];      // Locations for sales split dashboard
  financialLocations: string[];  // Locations for financial dashboard
  salesWideLocations: string[];  // Locations for sales wide dashboard
  
  // Current selected locations by dashboard
  currentSalesLocation: string;
  currentFinancialLocation: string;
  currentSalesWideLocation: string;
  
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
    helper: string;
    year: string;
    equator: string;
  };
}

// Define initial state
const initialState: ExcelState = {
  fileName: '',
  fileContent: null,
  location: '',
  fileProcessed: false,
  tableData: {
    table1: [],
    table2: [],
    table3: [],
    table4: [],
    table5: [],
    locations: [],
    dateRanges: []
  },
  loading: false,
  error: null,
  files: [],
  financialFiles: [],
  salesFiles: [],
  salesWideFiles: [],
  allLocations: [],
  salesLocations: [],
  financialLocations: [],
  salesWideLocations: [],
  currentSalesLocation: '',
  currentFinancialLocation: '',
  currentSalesWideLocation: '',
  salesFilters: {
    dateRangeType: '',
    startDate: '',
    endDate: '',
    location: ''
  },
  financialFilters: {
    store: '0001: Midtown East',
    year: '2025',
    dateRange: '1 | 12/30/2024 - 01/05/2025'
  },
  salesWideFilters: {
    dateRangeType: 'Last 30 Days',
    startDate: '',
    endDate: '',
    location: '',
    helper: 'Helper 3',
    year: '2025',
    equator: 'Equator A'
  }
};

export const excelSlice = createSlice({
  name: 'excel',
  initialState,
  reducers: {
    setExcelFile: (state, action: PayloadAction<{fileName: string; fileContent: string; location?: string}>) => {
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
        state.location = action.payload.fileLocation;
      }
    },
    addFileData: (state, action: PayloadAction<{fileName: string; location: string; data: TableData}>) => {
      // Check if file already exists for this location
      const existingFileIndex = state.files.findIndex(
        f => f.location === action.payload.location
      );
      
      // Create file data with upload timestamp
      const fileData: FileData = {
        ...action.payload,
        uploadDate: new Date().toISOString(),
        dashboard: action.payload.data.dashboardName
      };
      
      if (existingFileIndex >= 0) {
        // Update existing file
        state.files[existingFileIndex] = fileData;
      } else {
        // Add new file
        state.files.push(fileData);
      }
      
      // Add location to allLocations if it doesn't exist
      if (!state.allLocations.includes(action.payload.location)) {
        state.allLocations.push(action.payload.location);
      }
      
      // Update the current display data if it matches the location or if this is the first file
      if (state.location === action.payload.location || state.files.length === 1) {
        state.tableData = action.payload.data;
        state.fileName = action.payload.fileName;
        state.fileProcessed = true;
        state.location = action.payload.location;
      }
    },
    addFinancialData: (state, action: PayloadAction<{fileName: string; location: string; data: TableData}>) => {
      // Check if financial file already exists for this location
      const existingIndex = state.financialFiles.findIndex(
        f => f.location === action.payload.location
      );
      
      // Create financial data with upload timestamp
      const financialData: FinancialData = {
        ...action.payload,
        uploadDate: new Date().toISOString()
      };
      
      if (existingIndex >= 0) {
        // Update existing file
        state.financialFiles[existingIndex] = financialData;
      } else {
        // Add new file
        state.financialFiles.push(financialData);
      }
      
      // Add location to allLocations if it doesn't exist
      if (!state.allLocations.includes(action.payload.location)) {
        state.allLocations.push(action.payload.location);
      }
      
      // Add location to financialLocations if it doesn't exist
      if (!state.financialLocations.includes(action.payload.location)) {
        state.financialLocations.push(action.payload.location);
      }
      
      // Set current financial location if this is the first file
      if (state.financialFiles.length === 1 || !state.currentFinancialLocation) {
        state.currentFinancialLocation = action.payload.location;
        state.financialFilters.store = action.payload.location;
      }
    },
    addSalesData: (state, action: PayloadAction<{fileName: string; location: string; data: TableData}>) => {
      // Check if sales file already exists for this location
      const existingIndex = state.salesFiles.findIndex(
        f => f.location === action.payload.location
      );
      
      // Create sales data with upload timestamp
      const salesData: SalesData = {
        ...action.payload,
        uploadDate: new Date().toISOString()
      };
      
      if (existingIndex >= 0) {
        // Update existing file
        state.salesFiles[existingIndex] = salesData;
      } else {
        // Add new file
        state.salesFiles.push(salesData);
      }
      
      // Add location to allLocations if it doesn't exist
      if (!state.allLocations.includes(action.payload.location)) {
        state.allLocations.push(action.payload.location);
      }
      
      // Add location to salesLocations if it doesn't exist
      if (!state.salesLocations.includes(action.payload.location)) {
        state.salesLocations.push(action.payload.location);
      }
      
      // Set current sales location if this is the first file
      if (state.salesFiles.length === 1 || !state.currentSalesLocation) {
        state.currentSalesLocation = action.payload.location;
        state.salesFilters.location = action.payload.location;
      }
    },
    addSalesWideData: (state, action: PayloadAction<{fileName: string; location: string; data: TableData}>) => {
      // Check if sales wide file already exists for this location
      const existingIndex = state.salesWideFiles.findIndex(
        f => f.location === action.payload.location
      );
      
      // Create sales wide data with upload timestamp
      const salesWideData: SalesWideData = {
        ...action.payload,
        uploadDate: new Date().toISOString()
      };
      
      if (existingIndex >= 0) {
        // Update existing file
        state.salesWideFiles[existingIndex] = salesWideData;
      } else {
        // Add new file
        state.salesWideFiles.push(salesWideData);
      }
      
      // Add location to allLocations if it doesn't exist
      if (!state.allLocations.includes(action.payload.location)) {
        state.allLocations.push(action.payload.location);
      }
      
      // Add location to salesWideLocations if it doesn't exist
      if (!state.salesWideLocations.includes(action.payload.location)) {
        state.salesWideLocations.push(action.payload.location);
      }
      
      // Set current sales wide location if this is the first file
      if (state.salesWideFiles.length === 1 || !state.currentSalesWideLocation) {
        state.currentSalesWideLocation = action.payload.location;
        state.salesWideFilters.location = action.payload.location;
      }
    },
    setLocations: (state, action: PayloadAction<string[]>) => {
      // Set all locations (without duplicates)
      const newLocations = action.payload.filter(loc => loc && loc.trim() !== '');
      state.allLocations = [...new Set([...state.allLocations, ...newLocations])];
    },
    setSalesLocations: (state, action: PayloadAction<string[]>) => {
      state.salesLocations = action.payload;
    },
    setFinancialLocations: (state, action: PayloadAction<string[]>) => {
      state.financialLocations = action.payload;
    },
    setSalesWideLocations: (state, action: PayloadAction<string[]>) => {
      state.salesWideLocations = action.payload;
    },
    selectLocation: (state, action: PayloadAction<string>) => {
      const location = action.payload;
      state.location = location;
      
      // Find file data for this location (first check sales, then financial, then sales wide, then general)
      const salesData = state.salesFiles.find(f => f.location === location);
      const financialData = state.financialFiles.find(f => f.location === location);
      const salesWideData = state.salesWideFiles.find(f => f.location === location);
      const fileData = state.files.find(f => f.location === location);
      
      // Use sales data if available, otherwise financial, or sales wide, or general
      const dataToUse = salesData || financialData || salesWideData || fileData;
      
      if (dataToUse) {
        state.tableData = dataToUse.data;
        state.fileName = dataToUse.fileName;
        state.fileProcessed = true;
      } else {
        // If no matching file found, keep the current data but update location
        state.location = location;
      }
    },
    selectSalesLocation: (state, action: PayloadAction<string>) => {
      const location = action.payload;
      state.currentSalesLocation = location;
      state.salesFilters.location = location;
      
      // Find sales data for this location
      const salesData = state.salesFiles.find(f => f.location === location);
      
      if (salesData) {
        state.tableData = salesData.data;
        state.fileName = salesData.fileName;
        state.fileProcessed = true;
        state.location = location;
      }
    },
    selectFinancialLocation: (state, action: PayloadAction<string>) => {
      const location = action.payload;
      state.currentFinancialLocation = location;
      state.financialFilters.store = location;
      
      // Find financial data for this location
      const financialData = state.financialFiles.find(f => f.location === location);
      
      if (financialData) {
        state.tableData = financialData.data;
        state.fileName = financialData.fileName;
        state.fileProcessed = true;
        state.location = location;
      }
    },
    selectSalesWideLocation: (state, action: PayloadAction<string>) => {
      const location = action.payload;
      state.currentSalesWideLocation = location;
      state.salesWideFilters.location = location;
      
      // Find sales wide data for this location
      const salesWideData = state.salesWideFiles.find(f => f.location === location);
      
      if (salesWideData) {
        state.tableData = salesWideData.data;
        state.fileName = salesWideData.fileName;
        state.fileProcessed = true;
        state.location = location;
      }
    },
    updateSalesFilters: (state, action: PayloadAction<Partial<typeof initialState.salesFilters>>) => {
      state.salesFilters = { ...state.salesFilters, ...action.payload };
    },
    updateFinancialFilters: (state, action: PayloadAction<Partial<typeof initialState.financialFilters>>) => {
      state.financialFilters = { ...state.financialFilters, ...action.payload };
    },
    updateSalesWideFilters: (state, action: PayloadAction<Partial<typeof initialState.salesWideFilters>>) => {
      state.salesWideFilters = { ...state.salesWideFilters, ...action.payload };
    },
    resetExcelData: (state) => {
      return initialState;
    }
  }
});

// Export actions and reducer
export const { 
  setExcelFile, 
  setLoading, 
  setError, 
  setTableData,
  addFileData,
  addFinancialData,
  addSalesData,
  addSalesWideData,
  setLocations,
  setSalesLocations,
  setFinancialLocations,
  setSalesWideLocations,
  selectLocation,
  selectSalesLocation,
  selectFinancialLocation,
  selectSalesWideLocation,
  updateSalesFilters,
  updateFinancialFilters,
  updateSalesWideFilters,
  resetExcelData
} = excelSlice.actions;

export default excelSlice.reducer;
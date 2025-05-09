// store/excelSlice.ts
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
}

interface FileData {
  fileName: string;
  location: string;
  data: TableData;
}

interface ExcelState {
  fileName: string;
  fileContent: string | null;
  location: string;
  fileProcessed: boolean;
  tableData: TableData;
  loading: boolean;
  error: string | null;
  files: FileData[];
  allLocations: string[];
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
  allLocations: []
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
    },
    addFileData: (state, action: PayloadAction<{fileName: string; location: string; data: TableData}>) => {
      // Check if file already exists
      const existingFileIndex = state.files.findIndex(
        f => f.fileName === action.payload.fileName && f.location === action.payload.location
      );
      
      if (existingFileIndex >= 0) {
        // Update existing file
        state.files[existingFileIndex] = action.payload;
      } else {
        // Add new file
        state.files.push(action.payload);
      }
      
      // Add location to allLocations if it doesn't exist
      if (!state.allLocations.includes(action.payload.location)) {
        state.allLocations.push(action.payload.location);
      }
      
      // Update the current display data if it matches the location
      if (state.location === action.payload.location) {
        state.tableData = action.payload.data;
        state.fileName = action.payload.fileName;
        state.fileProcessed = true;
      }
    },
    setLocations: (state, action: PayloadAction<string[]>) => {
      // Set all locations (without duplicates)
      state.allLocations = [...new Set([...state.allLocations, ...action.payload])];
    },
    selectLocation: (state, action: PayloadAction<string>) => {
      const location = action.payload;
      state.location = location;
      
      // Find file data for this location
      const fileData = state.files.find(f => f.location === location);
      
      if (fileData) {
        state.tableData = fileData.data;
        state.fileName = fileData.fileName;
        state.fileProcessed = true;
      } else {
        // Clear the table data if no matching file found
        state.tableData = {
          table1: [],
          table2: [],
          table3: [],
          table4: [],
          table5: [],
          locations: [],
          dateRanges: []
        };
        state.fileProcessed = false;
      }
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
  setLocations,
  selectLocation,
  resetExcelData
} = excelSlice.actions;

export default excelSlice.reducer;
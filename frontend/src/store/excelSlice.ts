// store/excelSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the interfaces for our state
// interface TableData {
//   table1: any[];
//   table2: any[];
//   table3: any[];
//   table4: any[];
//   table5: any[];
//   locations: string[];
//   dateRanges: string[];
//   fileLocation?: string;
//   data?: string | null;
// }

interface TableData {
  table1: any[];
  table2: any[];
  table3: any[];
  table4: any[];
  table5: any[];
  locations: string[];
  dateRanges: string[];
  fileLocation?: string[] | string; // Support both string and array
  data?: string | null;
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
    fileLocation: undefined,
    data: null,
  },
  loading: false,
  error: null,
  files: [],
  allLocations: [],
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
      if (
        action.payload.fileLocation &&
        ((Array.isArray(action.payload.fileLocation) &&
          action.payload.fileLocation.length > 0) ||
          (typeof action.payload.fileLocation === "string" &&
            action.payload.fileLocation.trim() !== ""))
      ) {
        state.location = Array.isArray(action.payload.fileLocation)
          ? action.payload.fileLocation[0]
          : action.payload.fileLocation;
      }
    },
    addFileData: (
      state,
      action: PayloadAction<{
        fileName: string;
        location: string;
        data: TableData;
      }>
    ) => {
      console.log("Adding file data to Redux:", action.payload);

      // Check if file already exists for this location
      const existingFileIndex = state.files.findIndex(
        (f) => f.location === action.payload.location
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

      // Update the current display data if it matches the location or if this is the first file
      if (
        state.location === action.payload.location ||
        state.files.length === 1
      ) {
        console.log("Data being set to tableData:", action.payload.data);

        state.tableData = action.payload.data;
        state.fileName = action.payload.fileName;
        state.fileProcessed = true;
        state.location = action.payload.location;
      }
    },
    setLocations: (state, action: PayloadAction<string[]>) => {
      // Set all locations (without duplicates)
      const newLocations = action.payload.filter(
        (loc) => loc && loc.trim() !== ""
      );
      state.allLocations = [
        ...new Set([...state.allLocations, ...newLocations]),
      ];
    },
    selectLocation: (state, action: PayloadAction<string>) => {
      const location = action.payload;
      state.location = location;

      // Find file data for this location
      const fileData = state.files.find((f) => f.location === location);

      if (fileData) {
        state.tableData = fileData.data;
        state.fileName = fileData.fileName;
        state.fileProcessed = true;
      } else {
        // If no matching file found, keep the current data but update location
        // This allows for API calls to fetch data for the new location
        state.location = location;
      }
    },
    resetExcelData: (state) => {
      return initialState;
    },
  },
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
  resetExcelData,
} = excelSlice.actions;

export default excelSlice.reducer;

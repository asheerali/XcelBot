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

interface ExcelState {
  fileName: string;
  fileContent: string | null;
  fileProcessed: boolean;
  tableData: TableData;
  loading: boolean;
  error: string | null;
}

// Define initial state
const initialState: ExcelState = {
  fileName: '',
  fileContent: null,
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
  error: null
};

export const excelSlice = createSlice({
  name: 'excel',
  initialState,
  reducers: {
    setExcelFile: (state, action: PayloadAction<{fileName: string; fileContent: string}>) => {
      state.fileName = action.payload.fileName;
      state.fileContent = action.payload.fileContent;
      state.fileProcessed = false;
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
  resetExcelData
} = excelSlice.actions;

export default excelSlice.reducer;

// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import excelReducer from './excelSlice';

export const store = configureStore({
  reducer: {
    excel: excelReducer
  }
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
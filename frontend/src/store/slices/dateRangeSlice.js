import { createSlice } from '@reduxjs/toolkit';

// Initial state for date range
const initialState = {
  AnalyticsDashboardStart: null,
  AnalyticsDashboardEnd: null,
  MasterfileStart: null,
  MasterfileEnd: null,
};

// Create the date range slice
const dateRangeSlice = createSlice({
  name: 'dateRange',
  initialState,
  reducers: {
    // Analytics Dashboard Date Range Actions
    setAnalyticsDashboardDateRange: (state, action) => {
      const { startDate, endDate } = action.payload;
      state.AnalyticsDashboardStart = startDate;
      state.AnalyticsDashboardEnd = endDate;
    },
    
    setAnalyticsDashboardStartDate: (state, action) => {
      state.AnalyticsDashboardStart = action.payload;
    },
    
    setAnalyticsDashboardEndDate: (state, action) => {
      state.AnalyticsDashboardEnd = action.payload;
    },
    
    clearAnalyticsDashboardDateRange: (state) => {
      state.AnalyticsDashboardStart = null;
      state.AnalyticsDashboardEnd = null;
    },

    // Masterfile Date Range Actions
    setMasterfileDateRange: (state, action) => {
      const { startDate, endDate } = action.payload;
      state.MasterfileStart = startDate;
      state.MasterfileEnd = endDate;
    },
    
    setMasterfileStartDate: (state, action) => {
      state.MasterfileStart = action.payload;
    },
    
    setMasterfileEndDate: (state, action) => {
      state.MasterfileEnd = action.payload;
    },
    
    clearMasterfileDateRange: (state) => {
      state.MasterfileStart = null;
      state.MasterfileEnd = null;
    },

    // Clear all date ranges
    clearAllDateRanges: (state) => {
      state.AnalyticsDashboardStart = null;
      state.AnalyticsDashboardEnd = null;
      state.MasterfileStart = null;
      state.MasterfileEnd = null;
    },
  },
});

// Export actions
export const {
  // Analytics Dashboard actions
  setAnalyticsDashboardDateRange,
  setAnalyticsDashboardStartDate,
  setAnalyticsDashboardEndDate,
  clearAnalyticsDashboardDateRange,
  
  // Masterfile actions
  setMasterfileDateRange,
  setMasterfileStartDate,
  setMasterfileEndDate,
  clearMasterfileDateRange,
  
  // Clear all
  clearAllDateRanges,
} = dateRangeSlice.actions;

// Analytics Dashboard Selectors with safe fallbacks
export const selectAnalyticsDashboardStartDate = (state) => 
  state.dateRange?.AnalyticsDashboardStart || null;

export const selectAnalyticsDashboardEndDate = (state) => 
  state.dateRange?.AnalyticsDashboardEnd || null;

export const selectAnalyticsDashboardDateRange = (state) => ({
  startDate: state.dateRange?.AnalyticsDashboardStart || null,
  endDate: state.dateRange?.AnalyticsDashboardEnd || null,
});

export const selectHasAnalyticsDashboardDateRange = (state) => 
  state.dateRange?.AnalyticsDashboardStart !== null && 
  state.dateRange?.AnalyticsDashboardEnd !== null;

// Masterfile Selectors with safe fallbacks
export const selectMasterfileStartDate = (state) => 
  state.dateRange?.MasterfileStart || null;

export const selectMasterfileEndDate = (state) => 
  state.dateRange?.MasterfileEnd || null;

export const selectMasterfileDateRange = (state) => ({
  startDate: state.dateRange?.MasterfileStart || null,
  endDate: state.dateRange?.MasterfileEnd || null,
});

export const selectHasMasterfileDateRange = (state) => 
  state.dateRange?.MasterfileStart !== null && 
  state.dateRange?.MasterfileEnd !== null;

// Combined selectors for convenience
export const selectAllDateRanges = (state) => ({
  analyticsDashboard: {
    startDate: state.dateRange?.AnalyticsDashboardStart || null,
    endDate: state.dateRange?.AnalyticsDashboardEnd || null,
  },
  masterfile: {
    startDate: state.dateRange?.MasterfileStart || null,
    endDate: state.dateRange?.MasterfileEnd || null,
  },
});

export const selectHasAnyDateRange = (state) => 
  (state.dateRange?.AnalyticsDashboardStart !== null && state.dateRange?.AnalyticsDashboardEnd !== null) ||
  (state.dateRange?.MasterfileStart !== null && state.dateRange?.MasterfileEnd !== null);

// Export reducer
export default dateRangeSlice.reducer;
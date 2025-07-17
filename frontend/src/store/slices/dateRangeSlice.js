import { createSlice } from '@reduxjs/toolkit';

// Initial state for date range
const initialState = {
  AnalyticsDashboardStart: null,
  AnalyticsDashboardEnd: null,
  MasterfileStart: null,
  MasterfileEnd: null,
};

// Helper function to format date as YYYY-MM-DD (date only, no time) in LOCAL timezone
const formatDateOnly = (date) => {
  if (!date) return null;
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime()) || dateObj.getFullYear() <= 1970) {
      return null;
    }
    
    // FIXED: Use local timezone instead of UTC
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return null;
  }
};

// Create the date range slice
const dateRangeSlice = createSlice({
  name: 'dateRange',
  initialState,
  reducers: {
    // Analytics Dashboard Date Range Actions
    setAnalyticsDashboardDateRange: (state, action) => {
      const { startDate, endDate } = action.payload;
      console.log('🔥 Redux BEFORE: setAnalyticsDashboardDateRange called with:', { 
        startDate, 
        endDate,
        startType: typeof startDate,
        endType: typeof endDate 
      });
      
      // Format dates to date-only strings (YYYY-MM-DD)
      const formattedStartDate = formatDateOnly(startDate);
      const formattedEndDate = formatDateOnly(endDate);
      
      console.log('🔥 Redux AFTER formatting:', {
        formattedStartDate,
        formattedEndDate,
        formattedStartType: typeof formattedStartDate,
        formattedEndType: typeof formattedEndDate
      });
      
      if (formattedStartDate && formattedEndDate) {
        state.AnalyticsDashboardStart = formattedStartDate;
        state.AnalyticsDashboardEnd = formattedEndDate;
        
        console.log('✅ Redux: Date range stored successfully:', {
          storedStart: state.AnalyticsDashboardStart,
          storedEnd: state.AnalyticsDashboardEnd,
          stateAfterUpdate: {
            AnalyticsDashboardStart: state.AnalyticsDashboardStart,
            AnalyticsDashboardEnd: state.AnalyticsDashboardEnd
          }
        });
      } else {
        console.error('❌ Redux: Invalid dates provided, not storing:', { 
          originalStart: startDate, 
          originalEnd: endDate,
          formattedStart: formattedStartDate,
          formattedEnd: formattedEndDate
        });
      }
    },
    
    setAnalyticsDashboardStartDate: (state, action) => {
      const formattedDate = formatDateOnly(action.payload);
      if (formattedDate) {
        state.AnalyticsDashboardStart = formattedDate;
        console.log('✅ Redux: Start date set:', formattedDate);
      }
    },
    
    setAnalyticsDashboardEndDate: (state, action) => {
      const formattedDate = formatDateOnly(action.payload);
      if (formattedDate) {
        state.AnalyticsDashboardEnd = formattedDate;
        console.log('✅ Redux: End date set:', formattedDate);
      }
    },
    
    clearAnalyticsDashboardDateRange: (state) => {
      console.log('🧹 Redux: Clearing Analytics Dashboard date range');
      state.AnalyticsDashboardStart = null;
      state.AnalyticsDashboardEnd = null;
    },

    // Masterfile Date Range Actions
    setMasterfileDateRange: (state, action) => {
      const { startDate, endDate } = action.payload;
      const formattedStartDate = formatDateOnly(startDate);
      const formattedEndDate = formatDateOnly(endDate);
      
      if (formattedStartDate && formattedEndDate) {
        state.MasterfileStart = formattedStartDate;
        state.MasterfileEnd = formattedEndDate;
      }
    },
    
    setMasterfileStartDate: (state, action) => {
      const formattedDate = formatDateOnly(action.payload);
      if (formattedDate) {
        state.MasterfileStart = formattedDate;
      }
    },
    
    setMasterfileEndDate: (state, action) => {
      const formattedDate = formatDateOnly(action.payload);
      if (formattedDate) {
        state.MasterfileEnd = formattedDate;
      }
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

// FIXED: Simple direct selectors that match the actual state structure
export const selectAnalyticsDashboardStartDate = (state) => {
  const value = state.dateRange?.AnalyticsDashboardStart;
  console.log('🔍 selectAnalyticsDashboardStartDate:', { value, type: typeof value });
  return value;
};

export const selectAnalyticsDashboardEndDate = (state) => {
  const value = state.dateRange?.AnalyticsDashboardEnd;
  console.log('🔍 selectAnalyticsDashboardEndDate:', { value, type: typeof value });
  return value;
};

export const selectAnalyticsDashboardDateRange = (state) => {
  const startDate = state.dateRange?.AnalyticsDashboardStart;
  const endDate = state.dateRange?.AnalyticsDashboardEnd;
  
  console.log('🔍 selectAnalyticsDashboardDateRange raw state:', {
    rawState: state.dateRange,
    startDate,
    endDate,
    startType: typeof startDate,
    endType: typeof endDate
  });
  
  return {
    startDate: startDate,
    endDate: endDate,
  };
};

export const selectHasAnalyticsDashboardDateRange = (state) => {
  const startDate = state.dateRange?.AnalyticsDashboardStart;
  const endDate = state.dateRange?.AnalyticsDashboardEnd;
  const hasRange = startDate !== null && endDate !== null;
  
  console.log('🔍 selectHasAnalyticsDashboardDateRange:', {
    startDate,
    endDate,
    hasRange,
    startIsNull: startDate === null,
    endIsNull: endDate === null
  });
  
  return hasRange;
};

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
  selectHasAnalyticsDashboardDateRange(state) ||
  selectHasMasterfileDateRange(state);

// Export reducer
export default dateRangeSlice.reducer;
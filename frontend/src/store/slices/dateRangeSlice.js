import { createSlice } from '@reduxjs/toolkit';

// Initial state for date range
const initialState = {
  AnalyticsDashboardStart: null,
  AnalyticsDashboardEnd: null,
  MasterfileStart: null,
  MasterfileEnd: null,
  ReportsStart: null,
  ReportsEnd: null,
  // NEW: Add SummaryFinancialDashboard date range
  SummaryFinancialDashboardStart: null,
  SummaryFinancialDashboardEnd: null,
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

    // Reports Date Range Actions
    setReportsDateRange: (state, action) => {
      const { startDate, endDate } = action.payload;
      console.log('📊 Redux BEFORE: setReportsDateRange called with:', { 
        startDate, 
        endDate,
        startType: typeof startDate,
        endType: typeof endDate 
      });
      
      // Format dates to date-only strings (YYYY-MM-DD)
      const formattedStartDate = formatDateOnly(startDate);
      const formattedEndDate = formatDateOnly(endDate);
      
      console.log('📊 Redux AFTER formatting:', {
        formattedStartDate,
        formattedEndDate,
        formattedStartType: typeof formattedStartDate,
        formattedEndType: typeof formattedEndDate
      });
      
      if (formattedStartDate && formattedEndDate) {
        state.ReportsStart = formattedStartDate;
        state.ReportsEnd = formattedEndDate;
        
        console.log('✅ Redux: Reports date range stored successfully:', {
          storedStart: state.ReportsStart,
          storedEnd: state.ReportsEnd,
          stateAfterUpdate: {
            ReportsStart: state.ReportsStart,
            ReportsEnd: state.ReportsEnd
          }
        });
      } else {
        console.error('❌ Redux: Invalid dates provided for Reports, not storing:', { 
          originalStart: startDate, 
          originalEnd: endDate,
          formattedStart: formattedStartDate,
          formattedEnd: formattedEndDate
        });
      }
    },
    
    setReportsStartDate: (state, action) => {
      const formattedDate = formatDateOnly(action.payload);
      if (formattedDate) {
        state.ReportsStart = formattedDate;
        console.log('✅ Redux: Reports start date set:', formattedDate);
      }
    },
    
    setReportsEndDate: (state, action) => {
      const formattedDate = formatDateOnly(action.payload);
      if (formattedDate) {
        state.ReportsEnd = formattedDate;
        console.log('✅ Redux: Reports end date set:', formattedDate);
      }
    },
    
    clearReportsDateRange: (state) => {
      console.log('🧹 Redux: Clearing Reports date range');
      state.ReportsStart = null;
      state.ReportsEnd = null;
    },

    // NEW: Summary Financial Dashboard Date Range Actions
    setSummaryFinancialDashboardDateRange: (state, action) => {
      const { startDate, endDate } = action.payload;
      console.log('💰 Redux BEFORE: setSummaryFinancialDashboardDateRange called with:', { 
        startDate, 
        endDate,
        startType: typeof startDate,
        endType: typeof endDate 
      });
      
      // Format dates to date-only strings (YYYY-MM-DD)
      const formattedStartDate = formatDateOnly(startDate);
      const formattedEndDate = formatDateOnly(endDate);
      
      console.log('💰 Redux AFTER formatting:', {
        formattedStartDate,
        formattedEndDate,
        formattedStartType: typeof formattedStartDate,
        formattedEndType: typeof formattedEndDate
      });
      
      if (formattedStartDate && formattedEndDate) {
        state.SummaryFinancialDashboardStart = formattedStartDate;
        state.SummaryFinancialDashboardEnd = formattedEndDate;
        
        console.log('✅ Redux: Summary Financial Dashboard date range stored successfully:', {
          storedStart: state.SummaryFinancialDashboardStart,
          storedEnd: state.SummaryFinancialDashboardEnd,
          stateAfterUpdate: {
            SummaryFinancialDashboardStart: state.SummaryFinancialDashboardStart,
            SummaryFinancialDashboardEnd: state.SummaryFinancialDashboardEnd
          }
        });
      } else {
        console.error('❌ Redux: Invalid dates provided for Summary Financial Dashboard, not storing:', { 
          originalStart: startDate, 
          originalEnd: endDate,
          formattedStart: formattedStartDate,
          formattedEnd: formattedEndDate
        });
      }
    },
    
    setSummaryFinancialDashboardStartDate: (state, action) => {
      const formattedDate = formatDateOnly(action.payload);
      if (formattedDate) {
        state.SummaryFinancialDashboardStart = formattedDate;
        console.log('✅ Redux: Summary Financial Dashboard start date set:', formattedDate);
      }
    },
    
    setSummaryFinancialDashboardEndDate: (state, action) => {
      const formattedDate = formatDateOnly(action.payload);
      if (formattedDate) {
        state.SummaryFinancialDashboardEnd = formattedDate;
        console.log('✅ Redux: Summary Financial Dashboard end date set:', formattedDate);
      }
    },
    
    clearSummaryFinancialDashboardDateRange: (state) => {
      console.log('🧹 Redux: Clearing Summary Financial Dashboard date range');
      state.SummaryFinancialDashboardStart = null;
      state.SummaryFinancialDashboardEnd = null;
    },

    // Clear all date ranges
    clearAllDateRanges: (state) => {
      state.AnalyticsDashboardStart = null;
      state.AnalyticsDashboardEnd = null;
      state.MasterfileStart = null;
      state.MasterfileEnd = null;
      state.ReportsStart = null;
      state.ReportsEnd = null;
      state.SummaryFinancialDashboardStart = null;
      state.SummaryFinancialDashboardEnd = null;
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
  
  // Reports actions
  setReportsDateRange,
  setReportsStartDate,
  setReportsEndDate,
  clearReportsDateRange,
  
  // NEW: Summary Financial Dashboard actions
  setSummaryFinancialDashboardDateRange,
  setSummaryFinancialDashboardStartDate,
  setSummaryFinancialDashboardEndDate,
  clearSummaryFinancialDashboardDateRange,
  
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

// Reports Selectors with safe fallbacks
export const selectReportsStartDate = (state) => {
  const value = state.dateRange?.ReportsStart;
  console.log('🔍 selectReportsStartDate:', { value, type: typeof value });
  return value;
};

export const selectReportsEndDate = (state) => {
  const value = state.dateRange?.ReportsEnd;
  console.log('🔍 selectReportsEndDate:', { value, type: typeof value });
  return value;
};

export const selectReportsDateRange = (state) => {
  const startDate = state.dateRange?.ReportsStart;
  const endDate = state.dateRange?.ReportsEnd;
  
  console.log('🔍 selectReportsDateRange raw state:', {
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

export const selectHasReportsDateRange = (state) => {
  const startDate = state.dateRange?.ReportsStart;
  const endDate = state.dateRange?.ReportsEnd;
  const hasRange = startDate !== null && endDate !== null;
  
  console.log('🔍 selectHasReportsDateRange:', {
    startDate,
    endDate,
    hasRange,
    startIsNull: startDate === null,
    endIsNull: endDate === null
  });
  
  return hasRange;
};

// NEW: Summary Financial Dashboard Selectors with safe fallbacks
export const selectSummaryFinancialDashboardStartDate = (state) => {
  const value = state.dateRange?.SummaryFinancialDashboardStart;
  console.log('🔍 selectSummaryFinancialDashboardStartDate:', { value, type: typeof value });
  return value;
};

export const selectSummaryFinancialDashboardEndDate = (state) => {
  const value = state.dateRange?.SummaryFinancialDashboardEnd;
  console.log('🔍 selectSummaryFinancialDashboardEndDate:', { value, type: typeof value });
  return value;
};

export const selectSummaryFinancialDashboardDateRange = (state) => {
  const startDate = state.dateRange?.SummaryFinancialDashboardStart;
  const endDate = state.dateRange?.SummaryFinancialDashboardEnd;
  
  console.log('🔍 selectSummaryFinancialDashboardDateRange raw state:', {
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

export const selectHasSummaryFinancialDashboardDateRange = (state) => {
  const startDate = state.dateRange?.SummaryFinancialDashboardStart;
  const endDate = state.dateRange?.SummaryFinancialDashboardEnd;
  const hasRange = startDate !== null && endDate !== null;
  
  console.log('🔍 selectHasSummaryFinancialDashboardDateRange:', {
    startDate,
    endDate,
    hasRange,
    startIsNull: startDate === null,
    endIsNull: endDate === null
  });
  
  return hasRange;
};

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
  reports: {
    startDate: state.dateRange?.ReportsStart || null,
    endDate: state.dateRange?.ReportsEnd || null,
  },
  summaryFinancialDashboard: {
    startDate: state.dateRange?.SummaryFinancialDashboardStart || null,
    endDate: state.dateRange?.SummaryFinancialDashboardEnd || null,
  },
});

export const selectHasAnyDateRange = (state) => 
  selectHasAnalyticsDashboardDateRange(state) ||
  selectHasMasterfileDateRange(state) ||
  selectHasReportsDateRange(state) ||
  selectHasSummaryFinancialDashboardDateRange(state);

// Export reducer
export default dateRangeSlice.reducer;
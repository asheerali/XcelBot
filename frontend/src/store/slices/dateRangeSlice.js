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
  // NEW: Add StoreSummaryProduction date range
  StoreSummaryProductionStart: null,
  StoreSummaryProductionEnd: null,
  // NEW: Add OrderIQDashboard date range
  OrderIQDashboardStart: null,
  OrderIQDashboardEnd: null,
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

    // Summary Financial Dashboard Date Range Actions
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

    // StoreSummaryProduction Date Range Actions
    setStoreSummaryProductionDateRange: (state, action) => {
      const { startDate, endDate } = action.payload;
      console.log('🏪 Redux BEFORE: setStoreSummaryProductionDateRange called with:', { 
        startDate, 
        endDate,
        startType: typeof startDate,
        endType: typeof endDate 
      });
      
      // Format dates to date-only strings (YYYY-MM-DD)
      const formattedStartDate = formatDateOnly(startDate);
      const formattedEndDate = formatDateOnly(endDate);
      
      console.log('🏪 Redux AFTER formatting:', {
        formattedStartDate,
        formattedEndDate,
        formattedStartType: typeof formattedStartDate,
        formattedEndType: typeof formattedEndDate
      });
      
      if (formattedStartDate && formattedEndDate) {
        state.StoreSummaryProductionStart = formattedStartDate;
        state.StoreSummaryProductionEnd = formattedEndDate;
        
        console.log('✅ Redux: Store Summary Production date range stored successfully:', {
          storedStart: state.StoreSummaryProductionStart,
          storedEnd: state.StoreSummaryProductionEnd,
          stateAfterUpdate: {
            StoreSummaryProductionStart: state.StoreSummaryProductionStart,
            StoreSummaryProductionEnd: state.StoreSummaryProductionEnd
          }
        });
      } else {
        console.error('❌ Redux: Invalid dates provided for Store Summary Production, not storing:', { 
          originalStart: startDate, 
          originalEnd: endDate,
          formattedStart: formattedStartDate,
          formattedEnd: formattedEndDate
        });
      }
    },
    
    setStoreSummaryProductionStartDate: (state, action) => {
      const formattedDate = formatDateOnly(action.payload);
      if (formattedDate) {
        state.StoreSummaryProductionStart = formattedDate;
        console.log('✅ Redux: Store Summary Production start date set:', formattedDate);
      }
    },
    
    setStoreSummaryProductionEndDate: (state, action) => {
      const formattedDate = formatDateOnly(action.payload);
      if (formattedDate) {
        state.StoreSummaryProductionEnd = formattedDate;
        console.log('✅ Redux: Store Summary Production end date set:', formattedDate);
      }
    },
    
    clearStoreSummaryProductionDateRange: (state) => {
      console.log('🧹 Redux: Clearing Store Summary Production date range');
      state.StoreSummaryProductionStart = null;
      state.StoreSummaryProductionEnd = null;
    },

    // NEW: OrderIQDashboard Date Range Actions
    setOrderIQDashboardDateRange: (state, action) => {
      const { startDate, endDate } = action.payload;
      console.log('🛒 Redux BEFORE: setOrderIQDashboardDateRange called with:', { 
        startDate, 
        endDate,
        startType: typeof startDate,
        endType: typeof endDate 
      });
      
      // Format dates to date-only strings (YYYY-MM-DD)
      const formattedStartDate = formatDateOnly(startDate);
      const formattedEndDate = formatDateOnly(endDate);
      
      console.log('🛒 Redux AFTER formatting:', {
        formattedStartDate,
        formattedEndDate,
        formattedStartType: typeof formattedStartDate,
        formattedEndType: typeof formattedEndDate
      });
      
      if (formattedStartDate && formattedEndDate) {
        state.OrderIQDashboardStart = formattedStartDate;
        state.OrderIQDashboardEnd = formattedEndDate;
        
        console.log('✅ Redux: OrderIQ Dashboard date range stored successfully:', {
          storedStart: state.OrderIQDashboardStart,
          storedEnd: state.OrderIQDashboardEnd,
          stateAfterUpdate: {
            OrderIQDashboardStart: state.OrderIQDashboardStart,
            OrderIQDashboardEnd: state.OrderIQDashboardEnd
          }
        });
      } else {
        console.error('❌ Redux: Invalid dates provided for OrderIQ Dashboard, not storing:', { 
          originalStart: startDate, 
          originalEnd: endDate,
          formattedStart: formattedStartDate,
          formattedEnd: formattedEndDate
        });
      }
    },
    
    setOrderIQDashboardStartDate: (state, action) => {
      const formattedDate = formatDateOnly(action.payload);
      if (formattedDate) {
        state.OrderIQDashboardStart = formattedDate;
        console.log('✅ Redux: OrderIQ Dashboard start date set:', formattedDate);
      }
    },
    
    setOrderIQDashboardEndDate: (state, action) => {
      const formattedDate = formatDateOnly(action.payload);
      if (formattedDate) {
        state.OrderIQDashboardEnd = formattedDate;
        console.log('✅ Redux: OrderIQ Dashboard end date set:', formattedDate);
      }
    },
    
    clearOrderIQDashboardDateRange: (state) => {
      console.log('🧹 Redux: Clearing OrderIQ Dashboard date range');
      state.OrderIQDashboardStart = null;
      state.OrderIQDashboardEnd = null;
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
      state.StoreSummaryProductionStart = null;
      state.StoreSummaryProductionEnd = null;
      state.OrderIQDashboardStart = null;
      state.OrderIQDashboardEnd = null;
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
  
  // Summary Financial Dashboard actions
  setSummaryFinancialDashboardDateRange,
  setSummaryFinancialDashboardStartDate,
  setSummaryFinancialDashboardEndDate,
  clearSummaryFinancialDashboardDateRange,
  
  // StoreSummaryProduction actions
  setStoreSummaryProductionDateRange,
  setStoreSummaryProductionStartDate,
  setStoreSummaryProductionEndDate,
  clearStoreSummaryProductionDateRange,
  
  // NEW: OrderIQDashboard actions
  setOrderIQDashboardDateRange,
  setOrderIQDashboardStartDate,
  setOrderIQDashboardEndDate,
  clearOrderIQDashboardDateRange,
  
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

// Summary Financial Dashboard Selectors with safe fallbacks
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

// StoreSummaryProduction Selectors with safe fallbacks
export const selectStoreSummaryProductionStartDate = (state) => {
  const value = state.dateRange?.StoreSummaryProductionStart;
  console.log('🔍 selectStoreSummaryProductionStartDate:', { value, type: typeof value });
  return value;
};

export const selectStoreSummaryProductionEndDate = (state) => {
  const value = state.dateRange?.StoreSummaryProductionEnd;
  console.log('🔍 selectStoreSummaryProductionEndDate:', { value, type: typeof value });
  return value;
};

export const selectStoreSummaryProductionDateRange = (state) => {
  const startDate = state.dateRange?.StoreSummaryProductionStart;
  const endDate = state.dateRange?.StoreSummaryProductionEnd;
  
  console.log('🔍 selectStoreSummaryProductionDateRange raw state:', {
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

export const selectHasStoreSummaryProductionDateRange = (state) => {
  const startDate = state.dateRange?.StoreSummaryProductionStart;
  const endDate = state.dateRange?.StoreSummaryProductionEnd;
  const hasRange = startDate !== null && endDate !== null;
  
  console.log('🔍 selectHasStoreSummaryProductionDateRange:', {
    startDate,
    endDate,
    hasRange,
    startIsNull: startDate === null,
    endIsNull: endDate === null
  });
  
  return hasRange;
};

// NEW: OrderIQDashboard Selectors with safe fallbacks
export const selectOrderIQDashboardStartDate = (state) => {
  const value = state.dateRange?.OrderIQDashboardStart;
  console.log('🔍 selectOrderIQDashboardStartDate:', { value, type: typeof value });
  return value;
};

export const selectOrderIQDashboardEndDate = (state) => {
  const value = state.dateRange?.OrderIQDashboardEnd;
  console.log('🔍 selectOrderIQDashboardEndDate:', { value, type: typeof value });
  return value;
};

export const selectOrderIQDashboardDateRange = (state) => {
  const startDate = state.dateRange?.OrderIQDashboardStart;
  const endDate = state.dateRange?.OrderIQDashboardEnd;
  
  console.log('🔍 selectOrderIQDashboardDateRange raw state:', {
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

export const selectHasOrderIQDashboardDateRange = (state) => {
  const startDate = state.dateRange?.OrderIQDashboardStart;
  const endDate = state.dateRange?.OrderIQDashboardEnd;
  const hasRange = startDate !== null && endDate !== null;
  
  console.log('🔍 selectHasOrderIQDashboardDateRange:', {
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
  storeSummaryProduction: {
    startDate: state.dateRange?.StoreSummaryProductionStart || null,
    endDate: state.dateRange?.StoreSummaryProductionEnd || null,
  },
  orderIQDashboard: {
    startDate: state.dateRange?.OrderIQDashboardStart || null,
    endDate: state.dateRange?.OrderIQDashboardEnd || null,
  },
});

export const selectHasAnyDateRange = (state) => 
  selectHasAnalyticsDashboardDateRange(state) ||
  selectHasMasterfileDateRange(state) ||
  selectHasReportsDateRange(state) ||
  selectHasSummaryFinancialDashboardDateRange(state) ||
  selectHasStoreSummaryProductionDateRange(state) ||
  selectHasOrderIQDashboardDateRange(state);

// Export reducer
export default dateRangeSlice.reducer;
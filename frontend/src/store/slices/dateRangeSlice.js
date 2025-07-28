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
  // NEW: Add SalesSplitDashboard date range (for ExcelImport component)
  SalesSplitDashboardStart: null,
  SalesSplitDashboardEnd: null,
  // NEW: Add FinancialsDashboard date range (for Financials component)
  FinancialsDashboardStart: null,
  FinancialsDashboardEnd: null,
  // NEW: Add SalesDashboard date range
  SalesDashboardStart: null,
  SalesDashboardEnd: null,
  // NEW: Add ProductMixDashboard date range
  ProductMixDashboardStart: null,
  ProductMixDashboardEnd: null,
};

// ENHANCED: Helper function to format date as YYYY-MM-DD with timezone safety
const formatDateOnly = (date) => {
  if (!date) return null;
  
  console.log('🔧 formatDateOnly called with:', {
    date,
    type: typeof date,
    isDate: date instanceof Date,
    toString: date?.toString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime()) || dateObj.getFullYear() <= 1970) {
      console.error('❌ Invalid date in formatDateOnly:', {
        original: date,
        parsed: dateObj,
        isNaN: isNaN(dateObj.getTime()),
        year: dateObj.getFullYear()
      });
      return null;
    }
    
    // CRITICAL FIX: Use local timezone methods consistently
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    
    const formatted = `${year}-${month}-${day}`;
    
    console.log('✅ formatDateOnly result:', {
      original: date,
      originalType: typeof date,
      dateObj: dateObj.toString(),
      localString: dateObj.toLocaleDateString(),
      formatted: formatted,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezoneOffset: dateObj.getTimezoneOffset()
    });
    
    return formatted;
  } catch (error) {
    console.error('❌ Error in formatDateOnly:', error, 'Input:', date);
    return null;
  }
};

// ENHANCED: Timezone-safe formatter specifically for Summary Financial Dashboard
const formatDateOnlySummaryFinancial = (date) => {
  if (!date) return null;
  
  console.log('💰 formatDateOnlySummaryFinancial called with:', {
    date,
    type: typeof date,
    isDate: date instanceof Date,
    toString: date?.toString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  
  try {
    let dateObj;
    
    // Handle different input types with enhanced parsing
    if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === 'string') {
      // If it's already in YYYY-MM-DD format, validate and return
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        // Create a test date with noon time to avoid timezone edge cases
        const testDate = new Date(date + 'T12:00:00');
        if (!isNaN(testDate.getTime()) && testDate.getFullYear() > 1970) {
          console.log('✅ formatDateOnlySummaryFinancial: Already formatted string, returning as-is:', date);
          return date;
        }
      }
      
      // For ISO strings or other formats, be more careful
      if (date.includes('T')) {
        // ISO string - extract date part only
        const datePart = date.split('T')[0];
        if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
          return datePart;
        }
      }
      // For other string formats, parse carefully
      dateObj = new Date(date);
    } else if (typeof date === 'number') {
      dateObj = new Date(date);
    } else {
      dateObj = new Date(date);
    }
    
    if (isNaN(dateObj.getTime()) || dateObj.getFullYear() <= 1970) {
      console.error('❌ formatDateOnlySummaryFinancial: Invalid date after parsing:', {
        original: date,
        parsed: dateObj,
        isNaN: isNaN(dateObj.getTime()),
        year: dateObj.getFullYear()
      });
      return null;
    }
    
    // CRITICAL FIX: Use local timezone methods to avoid UTC conversion issues
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    
    const formatted = `${year}-${month}-${day}`;
    
    console.log('✅ formatDateOnlySummaryFinancial: Successfully formatted:', {
      original: date,
      originalType: typeof date,
      dateObj: dateObj.toString(),
      localString: dateObj.toLocaleDateString(),
      formatted: formatted,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezoneOffset: dateObj.getTimezoneOffset(),
      isDST: dateObj.getTimezoneOffset() !== new Date(dateObj.getFullYear(), 0, 1).getTimezoneOffset()
    });
    
    return formatted;
  } catch (error) {
    console.error('❌ Error in formatDateOnlySummaryFinancial:', error, 'Input:', date);
    return null;
  }
};

// ENHANCED: Helper function specifically for OrderIQ Dashboard with timezone safety
const formatDateOnlyOrderIQ = (date) => {
  if (!date) return null;
  try {
    let dateObj;
    
    // Handle different input types
    if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === 'string') {
      // If it's already in YYYY-MM-DD format, validate and return
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        const testDate = new Date(date + 'T12:00:00'); // Add noon time to avoid timezone issues
        if (!isNaN(testDate.getTime()) && testDate.getFullYear() > 1970) {
          return date; // Return the already formatted string
        }
      }
      // For other string formats, parse carefully
      dateObj = new Date(date);
    } else {
      dateObj = new Date(date);
    }
    
    if (isNaN(dateObj.getTime()) || dateObj.getFullYear() <= 1970) {
      return null;
    }
    
    // CRITICAL FIX: Use local timezone methods to avoid UTC conversion issues
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error formatting date for OrderIQ:', error);
    return null;
  }
};

// NEW: Helper function to create Date object from YYYY-MM-DD string in local timezone
const createLocalDateFromString = (dateString) => {
  if (!dateString) return null;
  
  if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-').map(Number);
    // Create date in local timezone (month is 0-indexed) - set to noon for timezone safety
    return new Date(year, month - 1, day, 12, 0, 0);
  }
  
  return null;
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

    // ENHANCED: Summary Financial Dashboard Date Range Actions with timezone safety
    setSummaryFinancialDashboardDateRange: (state, action) => {
      const { startDate, endDate } = action.payload;
      console.log('💰 Redux BEFORE: setSummaryFinancialDashboardDateRange called with:', { 
        startDate, 
        endDate,
        startType: typeof startDate,
        endType: typeof endDate,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
      
      // ENHANCED: Use the improved formatting function for Summary Financial Dashboard
      const formattedStartDate = formatDateOnlySummaryFinancial(startDate);
      const formattedEndDate = formatDateOnlySummaryFinancial(endDate);
      
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
          },
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
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
      const formattedDate = formatDateOnlySummaryFinancial(action.payload);
      if (formattedDate) {
        state.SummaryFinancialDashboardStart = formattedDate;
        console.log('✅ Redux: Summary Financial Dashboard start date set:', formattedDate);
      }
    },
    
    setSummaryFinancialDashboardEndDate: (state, action) => {
      const formattedDate = formatDateOnlySummaryFinancial(action.payload);
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

    // FIXED: OrderIQDashboard Date Range Actions with enhanced timezone safety
    setOrderIQDashboardDateRange: (state, action) => {
      const { startDate, endDate } = action.payload;
      console.log('🛒 Redux BEFORE: setOrderIQDashboardDateRange called with:', { 
        startDate, 
        endDate,
        startType: typeof startDate,
        endType: typeof endDate 
      });
      
      // ENHANCED: Use the improved formatting function for OrderIQ
      const formattedStartDate = formatDateOnlyOrderIQ(startDate);
      const formattedEndDate = formatDateOnlyOrderIQ(endDate);
      
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
      const formattedDate = formatDateOnlyOrderIQ(action.payload);
      if (formattedDate) {
        state.OrderIQDashboardStart = formattedDate;
        console.log('✅ Redux: OrderIQ Dashboard start date set:', formattedDate);
      }
    },
    
    setOrderIQDashboardEndDate: (state, action) => {
      const formattedDate = formatDateOnlyOrderIQ(action.payload);
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

    // Sales Split Dashboard Date Range Actions (for ExcelImport component)
    setSalesSplitDashboardDateRange: (state, action) => {
      const { startDate, endDate } = action.payload;
      console.log('📈 Redux BEFORE: setSalesSplitDashboardDateRange called with:', { 
        startDate, 
        endDate,
        startType: typeof startDate,
        endType: typeof endDate 
      });
      
      // Format dates to date-only strings (YYYY-MM-DD)
      const formattedStartDate = formatDateOnly(startDate);
      const formattedEndDate = formatDateOnly(endDate);
      
      console.log('📈 Redux AFTER formatting:', {
        formattedStartDate,
        formattedEndDate,
        formattedStartType: typeof formattedStartDate,
        formattedEndType: typeof formattedEndDate
      });
      
      if (formattedStartDate && formattedEndDate) {
        state.SalesSplitDashboardStart = formattedStartDate;
        state.SalesSplitDashboardEnd = formattedEndDate;
        
        console.log('✅ Redux: Sales Split Dashboard date range stored successfully:', {
          storedStart: state.SalesSplitDashboardStart,
          storedEnd: state.SalesSplitDashboardEnd,
          stateAfterUpdate: {
            SalesSplitDashboardStart: state.SalesSplitDashboardStart,
            SalesSplitDashboardEnd: state.SalesSplitDashboardEnd
          }
        });
      } else {
        console.error('❌ Redux: Invalid dates provided for Sales Split Dashboard, not storing:', { 
          originalStart: startDate, 
          originalEnd: endDate,
          formattedStart: formattedStartDate,
          formattedEnd: formattedEndDate
        });
      }
    },
    
    setSalesSplitDashboardStartDate: (state, action) => {
      const formattedDate = formatDateOnly(action.payload);
      if (formattedDate) {
        state.SalesSplitDashboardStart = formattedDate;
        console.log('✅ Redux: Sales Split Dashboard start date set:', formattedDate);
      }
    },
    
    setSalesSplitDashboardEndDate: (state, action) => {
      const formattedDate = formatDateOnly(action.payload);
      if (formattedDate) {
        state.SalesSplitDashboardEnd = formattedDate;
        console.log('✅ Redux: Sales Split Dashboard end date set:', formattedDate);
      }
    },
    
    clearSalesSplitDashboardDateRange: (state) => {
      console.log('🧹 Redux: Clearing Sales Split Dashboard date range');
      state.SalesSplitDashboardStart = null;
      state.SalesSplitDashboardEnd = null;
    },

    // NEW: Financials Dashboard Date Range Actions (for Financials component)
    setFinancialsDashboardDateRange: (state, action) => {
      const { startDate, endDate } = action.payload;
      console.log('💼 Redux BEFORE: setFinancialsDashboardDateRange called with:', { 
        startDate, 
        endDate,
        startType: typeof startDate,
        endType: typeof endDate 
      });
      
      // Format dates to date-only strings (YYYY-MM-DD)
      const formattedStartDate = formatDateOnly(startDate);
      const formattedEndDate = formatDateOnly(endDate);
      
      console.log('💼 Redux AFTER formatting:', {
        formattedStartDate,
        formattedEndDate,
        formattedStartType: typeof formattedStartDate,
        formattedEndType: typeof formattedEndDate
      });
      
      if (formattedStartDate && formattedEndDate) {
        state.FinancialsDashboardStart = formattedStartDate;
        state.FinancialsDashboardEnd = formattedEndDate;
        
        console.log('✅ Redux: Financials Dashboard date range stored successfully:', {
          storedStart: state.FinancialsDashboardStart,
          storedEnd: state.FinancialsDashboardEnd,
          stateAfterUpdate: {
            FinancialsDashboardStart: state.FinancialsDashboardStart,
            FinancialsDashboardEnd: state.FinancialsDashboardEnd
          }
        });
      } else {
        console.error('❌ Redux: Invalid dates provided for Financials Dashboard, not storing:', { 
          originalStart: startDate, 
          originalEnd: endDate,
          formattedStart: formattedStartDate,
          formattedEnd: formattedEndDate
        });
      }
    },
    
    setFinancialsDashboardStartDate: (state, action) => {
      const formattedDate = formatDateOnly(action.payload);
      if (formattedDate) {
        state.FinancialsDashboardStart = formattedDate;
        console.log('✅ Redux: Financials Dashboard start date set:', formattedDate);
      }
    },
    
    setFinancialsDashboardEndDate: (state, action) => {
      const formattedDate = formatDateOnly(action.payload);
      if (formattedDate) {
        state.FinancialsDashboardEnd = formattedDate;
        console.log('✅ Redux: Financials Dashboard end date set:', formattedDate);
      }
    },
    
    clearFinancialsDashboardDateRange: (state) => {
      console.log('🧹 Redux: Clearing Financials Dashboard date range');
      state.FinancialsDashboardStart = null;
      state.FinancialsDashboardEnd = null;
    },

    // NEW: Sales Dashboard Date Range Actions
    setSalesDashboardDateRange: (state, action) => {
      const { startDate, endDate } = action.payload;
      console.log('🛍️ Redux BEFORE: setSalesDashboardDateRange called with:', { 
        startDate, 
        endDate,
        startType: typeof startDate,
        endType: typeof endDate 
      });
      
      // Format dates to date-only strings (YYYY-MM-DD)
      const formattedStartDate = formatDateOnly(startDate);
      const formattedEndDate = formatDateOnly(endDate);
      
      console.log('🛍️ Redux AFTER formatting:', {
        formattedStartDate,
        formattedEndDate,
        formattedStartType: typeof formattedStartDate,
        formattedEndType: typeof formattedEndDate
      });
      
      if (formattedStartDate && formattedEndDate) {
        state.SalesDashboardStart = formattedStartDate;
        state.SalesDashboardEnd = formattedEndDate;
        
        console.log('✅ Redux: Sales Dashboard date range stored successfully:', {
          storedStart: state.SalesDashboardStart,
          storedEnd: state.SalesDashboardEnd,
          stateAfterUpdate: {
            SalesDashboardStart: state.SalesDashboardStart,
            SalesDashboardEnd: state.SalesDashboardEnd
          }
        });
      } else {
        console.error('❌ Redux: Invalid dates provided for Sales Dashboard, not storing:', { 
          originalStart: startDate, 
          originalEnd: endDate,
          formattedStart: formattedStartDate,
          formattedEnd: formattedEndDate
        });
      }
    },
    
    setSalesDashboardStartDate: (state, action) => {
      const formattedDate = formatDateOnly(action.payload);
      if (formattedDate) {
        state.SalesDashboardStart = formattedDate;
        console.log('✅ Redux: Sales Dashboard start date set:', formattedDate);
      }
    },
    
    setSalesDashboardEndDate: (state, action) => {
      const formattedDate = formatDateOnly(action.payload);
      if (formattedDate) {
        state.SalesDashboardEnd = formattedDate;
        console.log('✅ Redux: Sales Dashboard end date set:', formattedDate);
      }
    },
    
    clearSalesDashboardDateRange: (state) => {
      console.log('🧹 Redux: Clearing Sales Dashboard date range');
      state.SalesDashboardStart = null;
      state.SalesDashboardEnd = null;
    },

    // NEW: Product Mix Dashboard Date Range Actions
    setProductMixDashboardDateRange: (state, action) => {
      const { startDate, endDate } = action.payload;
      console.log('🏷️ Redux BEFORE: setProductMixDashboardDateRange called with:', { 
        startDate, 
        endDate,
        startType: typeof startDate,
        endType: typeof endDate 
      });
      
      // Format dates to date-only strings (YYYY-MM-DD)
      const formattedStartDate = formatDateOnly(startDate);
      const formattedEndDate = formatDateOnly(endDate);
      
      console.log('🏷️ Redux AFTER formatting:', {
        formattedStartDate,
        formattedEndDate,
        formattedStartType: typeof formattedStartDate,
        formattedEndType: typeof formattedEndDate
      });
      
      if (formattedStartDate && formattedEndDate) {
        state.ProductMixDashboardStart = formattedStartDate;
        state.ProductMixDashboardEnd = formattedEndDate;
        
        console.log('✅ Redux: Product Mix Dashboard date range stored successfully:', {
          storedStart: state.ProductMixDashboardStart,
          storedEnd: state.ProductMixDashboardEnd,
          stateAfterUpdate: {
            ProductMixDashboardStart: state.ProductMixDashboardStart,
            ProductMixDashboardEnd: state.ProductMixDashboardEnd
          }
        });
      } else {
        console.error('❌ Redux: Invalid dates provided for Product Mix Dashboard, not storing:', { 
          originalStart: startDate, 
          originalEnd: endDate,
          formattedStart: formattedStartDate,
          formattedEnd: formattedEndDate
        });
      }
    },
    
    setProductMixDashboardStartDate: (state, action) => {
      const formattedDate = formatDateOnly(action.payload);
      if (formattedDate) {
        state.ProductMixDashboardStart = formattedDate;
        console.log('✅ Redux: Product Mix Dashboard start date set:', formattedDate);
      }
    },
    
    setProductMixDashboardEndDate: (state, action) => {
      const formattedDate = formatDateOnly(action.payload);
      if (formattedDate) {
        state.ProductMixDashboardEnd = formattedDate;
        console.log('✅ Redux: Product Mix Dashboard end date set:', formattedDate);
      }
    },
    
    clearProductMixDashboardDateRange: (state) => {
      console.log('🧹 Redux: Clearing Product Mix Dashboard date range');
      state.ProductMixDashboardStart = null;
      state.ProductMixDashboardEnd = null;
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
      state.SalesSplitDashboardStart = null;
      state.SalesSplitDashboardEnd = null;
      state.FinancialsDashboardStart = null;
      state.FinancialsDashboardEnd = null;
      state.SalesDashboardStart = null;
      state.SalesDashboardEnd = null;
      state.ProductMixDashboardStart = null;
      state.ProductMixDashboardEnd = null;
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
  
  // OrderIQDashboard actions
  setOrderIQDashboardDateRange,
  setOrderIQDashboardStartDate,
  setOrderIQDashboardEndDate,
  clearOrderIQDashboardDateRange,
  
  // Sales Split Dashboard actions
  setSalesSplitDashboardDateRange,
  setSalesSplitDashboardStartDate,
  setSalesSplitDashboardEndDate,
  clearSalesSplitDashboardDateRange,
  
  // NEW: Financials Dashboard actions
  setFinancialsDashboardDateRange,
  setFinancialsDashboardStartDate,
  setFinancialsDashboardEndDate,
  clearFinancialsDashboardDateRange,
  
  // NEW: Sales Dashboard actions
  setSalesDashboardDateRange,
  setSalesDashboardStartDate,
  setSalesDashboardEndDate,
  clearSalesDashboardDateRange,
  
  // NEW: Product Mix Dashboard actions
  setProductMixDashboardDateRange,
  setProductMixDashboardStartDate,
  setProductMixDashboardEndDate,
  clearProductMixDashboardDateRange,
  
  // Clear all
  clearAllDateRanges,
} = dateRangeSlice.actions;

// ENHANCED: Simple direct selectors with timezone safety
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

// ENHANCED: Summary Financial Dashboard Selectors with timezone safety
export const selectSummaryFinancialDashboardStartDate = (state) => {
  const value = state.dateRange?.SummaryFinancialDashboardStart;
  console.log('🔍 selectSummaryFinancialDashboardStartDate:', { 
    value, 
    type: typeof value,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  return value;
};

export const selectSummaryFinancialDashboardEndDate = (state) => {
  const value = state.dateRange?.SummaryFinancialDashboardEnd;
  console.log('🔍 selectSummaryFinancialDashboardEndDate:', { 
    value, 
    type: typeof value,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
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
    endType: typeof endDate,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
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
    endIsNull: endDate === null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
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

// ENHANCED: OrderIQDashboard Selectors with timezone safety
const parseStoredDateOrderIQ = (storedDate) => {
  if (!storedDate) return null;
  
  // If it's already a valid YYYY-MM-DD string, return as-is
  if (typeof storedDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(storedDate)) {
    return storedDate;
  }
  
  // Otherwise, format it properly using the enhanced OrderIQ formatter
  return formatDateOnlyOrderIQ(storedDate);
};

export const selectOrderIQDashboardStartDate = (state) => {
  const value = parseStoredDateOrderIQ(state.dateRange?.OrderIQDashboardStart);
  console.log('🔍 selectOrderIQDashboardStartDate:', { value, type: typeof value });
  return value;
};

export const selectOrderIQDashboardEndDate = (state) => {
  const value = parseStoredDateOrderIQ(state.dateRange?.OrderIQDashboardEnd);
  console.log('🔍 selectOrderIQDashboardEndDate:', { value, type: typeof value });
  return value;
};

export const selectOrderIQDashboardDateRange = (state) => {
  const startDate = parseStoredDateOrderIQ(state.dateRange?.OrderIQDashboardStart);
  const endDate = parseStoredDateOrderIQ(state.dateRange?.OrderIQDashboardEnd);
  
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
  const startDate = parseStoredDateOrderIQ(state.dateRange?.OrderIQDashboardStart);
  const endDate = parseStoredDateOrderIQ(state.dateRange?.OrderIQDashboardEnd);
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

// Sales Split Dashboard Selectors with safe fallbacks
export const selectSalesSplitDashboardStartDate = (state) => {
  const value = state.dateRange?.SalesSplitDashboardStart;
  console.log('🔍 selectSalesSplitDashboardStartDate:', { value, type: typeof value });
  return value;
};

export const selectSalesSplitDashboardEndDate = (state) => {
  const value = state.dateRange?.SalesSplitDashboardEnd;
  console.log('🔍 selectSalesSplitDashboardEndDate:', { value, type: typeof value });
  return value;
};

export const selectSalesSplitDashboardDateRange = (state) => {
  const startDate = state.dateRange?.SalesSplitDashboardStart;
  const endDate = state.dateRange?.SalesSplitDashboardEnd;
  
  console.log('🔍 selectSalesSplitDashboardDateRange raw state:', {
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

export const selectHasSalesSplitDashboardDateRange = (state) => {
  const startDate = state.dateRange?.SalesSplitDashboardStart;
  const endDate = state.dateRange?.SalesSplitDashboardEnd;
  const hasRange = startDate !== null && endDate !== null;
  
  console.log('🔍 selectHasSalesSplitDashboardDateRange:', {
    startDate,
    endDate,
    hasRange,
    startIsNull: startDate === null,
    endIsNull: endDate === null
  });
  
  return hasRange;
};

// NEW: Financials Dashboard Selectors with safe fallbacks
export const selectFinancialsDashboardStartDate = (state) => {
  const value = state.dateRange?.FinancialsDashboardStart;
  console.log('🔍 selectFinancialsDashboardStartDate:', { value, type: typeof value });
  return value;
};

export const selectFinancialsDashboardEndDate = (state) => {
  const value = state.dateRange?.FinancialsDashboardEnd;
  console.log('🔍 selectFinancialsDashboardEndDate:', { value, type: typeof value });
  return value;
};

export const selectFinancialsDashboardDateRange = (state) => {
  const startDate = state.dateRange?.FinancialsDashboardStart;
  const endDate = state.dateRange?.FinancialsDashboardEnd;
  
  console.log('🔍 selectFinancialsDashboardDateRange raw state:', {
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

export const selectHasFinancialsDashboardDateRange = (state) => {
  const startDate = state.dateRange?.FinancialsDashboardStart;
  const endDate = state.dateRange?.FinancialsDashboardEnd;
  const hasRange = startDate !== null && endDate !== null;
  
  console.log('🔍 selectHasFinancialsDashboardDateRange:', {
    startDate,
    endDate,
    hasRange,
    startIsNull: startDate === null,
    endIsNull: endDate === null
  });
  
  return hasRange;
};

// NEW: Sales Dashboard Selectors with safe fallbacks
export const selectSalesDashboardStartDate = (state) => {
  const value = state.dateRange?.SalesDashboardStart;
  console.log('🔍 selectSalesDashboardStartDate:', { value, type: typeof value });
  return value;
};

export const selectSalesDashboardEndDate = (state) => {
  const value = state.dateRange?.SalesDashboardEnd;
  console.log('🔍 selectSalesDashboardEndDate:', { value, type: typeof value });
  return value;
};

export const selectSalesDashboardDateRange = (state) => {
  const startDate = state.dateRange?.SalesDashboardStart;
  const endDate = state.dateRange?.SalesDashboardEnd;
  
  console.log('🔍 selectSalesDashboardDateRange raw state:', {
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

export const selectHasSalesDashboardDateRange = (state) => {
  const startDate = state.dateRange?.SalesDashboardStart;
  const endDate = state.dateRange?.SalesDashboardEnd;
  const hasRange = startDate !== null && endDate !== null;
  
  console.log('🔍 selectHasSalesDashboardDateRange:', {
    startDate,
    endDate,
    hasRange,
    startIsNull: startDate === null,
    endIsNull: endDate === null
  });
  
  return hasRange;
};

// NEW: Product Mix Dashboard Selectors with safe fallbacks
export const selectProductMixDashboardStartDate = (state) => {
  const value = state.dateRange?.ProductMixDashboardStart;
  console.log('🔍 selectProductMixDashboardStartDate:', { value, type: typeof value });
  return value;
};

export const selectProductMixDashboardEndDate = (state) => {
  const value = state.dateRange?.ProductMixDashboardEnd;
  console.log('🔍 selectProductMixDashboardEndDate:', { value, type: typeof value });
  return value;
};

export const selectProductMixDashboardDateRange = (state) => {
  const startDate = state.dateRange?.ProductMixDashboardStart;
  const endDate = state.dateRange?.ProductMixDashboardEnd;
  
  console.log('🔍 selectProductMixDashboardDateRange raw state:', {
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

export const selectHasProductMixDashboardDateRange = (state) => {
  const startDate = state.dateRange?.ProductMixDashboardStart;
  const endDate = state.dateRange?.ProductMixDashboardEnd;
  const hasRange = startDate !== null && endDate !== null;
  
  console.log('🔍 selectHasProductMixDashboardDateRange:', {
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
  salesSplitDashboard: {
    startDate: state.dateRange?.SalesSplitDashboardStart || null,
    endDate: state.dateRange?.SalesSplitDashboardEnd || null,
  },
  // NEW: Add Financials Dashboard to combined selectors
  financialsDashboard: {
    startDate: state.dateRange?.FinancialsDashboardStart || null,
    endDate: state.dateRange?.FinancialsDashboardEnd || null,
  },
  // NEW: Add Sales Dashboard to combined selectors
  salesDashboard: {
    startDate: state.dateRange?.SalesDashboardStart || null,
    endDate: state.dateRange?.SalesDashboardEnd || null,
  },
  // NEW: Add Product Mix Dashboard to combined selectors
  productMixDashboard: {
    startDate: state.dateRange?.ProductMixDashboardStart || null,
    endDate: state.dateRange?.ProductMixDashboardEnd || null,
  },
});

export const selectHasAnyDateRange = (state) => 
  selectHasAnalyticsDashboardDateRange(state) ||
  selectHasMasterfileDateRange(state) ||
  selectHasReportsDateRange(state) ||
  selectHasSummaryFinancialDashboardDateRange(state) ||
  selectHasStoreSummaryProductionDateRange(state) ||
  selectHasOrderIQDashboardDateRange(state) ||
  selectHasSalesSplitDashboardDateRange(state) ||
  selectHasFinancialsDashboardDateRange(state) || // NEW: Include Financials Dashboard
  selectHasSalesDashboardDateRange(state) || // NEW: Include Sales Dashboard
  selectHasProductMixDashboardDateRange(state); // NEW: Include Product Mix Dashboard

// Export utility functions for OrderIQ Dashboard components to use
export { createLocalDateFromString, formatDateOnlyOrderIQ };

// Export reducer
export default dateRangeSlice.reducer;
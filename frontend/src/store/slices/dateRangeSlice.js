// store/slices/dateRangeSlice.js

import { createSlice } from '@reduxjs/toolkit';

/**
 * Date Range Redux Slice
 * 
 * This slice manages date ranges for different dashboards.
 * Each dashboard can have its own independent date range.
 * 
 * State Structure:
 * {
 *   analyticsDashboard: { startDate: string, endDate: string },
 *   salesDashboard: { startDate: string, endDate: string },
 *   reportsDashboard: { startDate: string, endDate: string },
 *   // ... other dashboards
 * }
 */

const initialState = {
  // Analytics Dashboard date range
  analyticsDashboard: {
    startDate: null,
    endDate: null
  },
  
  // Future dashboards can be added here
  // salesDashboard: {
  //   startDate: null,
  //   endDate: null
  // },
  // reportsDashboard: {
  //   startDate: null,
  //   endDate: null
  // }
};

const dateRangeSlice = createSlice({
  name: 'dateRange',
  initialState,
  reducers: {
    /**
     * Set date range for Analytics Dashboard
     * @param {Object} state - Current state
     * @param {Object} action - Action with payload: { startDate: string, endDate: string }
     */
    setAnalyticsDashboardDateRange: (state, action) => {
      const { startDate, endDate } = action.payload;
      state.analyticsDashboard.startDate = startDate;
      state.analyticsDashboard.endDate = endDate;
    },

    /**
     * Clear date range for Analytics Dashboard
     * @param {Object} state - Current state
     */
    clearAnalyticsDashboardDateRange: (state) => {
      state.analyticsDashboard.startDate = null;
      state.analyticsDashboard.endDate = null;
    },

    // Future dashboard actions can be added here following the same pattern
    // 
    // setSalesDashboardDateRange: (state, action) => {
    //   const { startDate, endDate } = action.payload;
    //   state.salesDashboard.startDate = startDate;
    //   state.salesDashboard.endDate = endDate;
    // },
    // 
    // clearSalesDashboardDateRange: (state) => {
    //   state.salesDashboard.startDate = null;
    //   state.salesDashboard.endDate = null;
    // },
    //
    // setReportsDashboardDateRange: (state, action) => {
    //   const { startDate, endDate } = action.payload;
    //   state.reportsDashboard.startDate = startDate;
    //   state.reportsDashboard.endDate = endDate;
    // },
    //
    // clearReportsDashboardDateRange: (state) => {
    //   state.reportsDashboard.startDate = null;
    //   state.reportsDashboard.endDate = null;
    // }
  }
});

// Export actions
export const {
  setAnalyticsDashboardDateRange,
  clearAnalyticsDashboardDateRange,
  // Future dashboard actions will be exported here
} = dateRangeSlice.actions;

// Selectors for Analytics Dashboard
/**
 * Select the complete date range object for Analytics Dashboard
 * @param {Object} state - Redux state
 * @returns {Object} { startDate: string, endDate: string }
 */
export const selectAnalyticsDashboardDateRange = (state) => {
  return state.dateRange?.analyticsDashboard || { startDate: null, endDate: null };
};

/**
 * Select start date for Analytics Dashboard
 * @param {Object} state - Redux state
 * @returns {string|null} startDate
 */
export const selectAnalyticsDashboardStartDate = (state) => {
  return state.dateRange?.analyticsDashboard?.startDate || null;
};

/**
 * Select end date for Analytics Dashboard
 * @param {Object} state - Redux state
 * @returns {string|null} endDate
 */
export const selectAnalyticsDashboardEndDate = (state) => {
  return state.dateRange?.analyticsDashboard?.endDate || null;
};

/**
 * Check if Analytics Dashboard has a date range set
 * @param {Object} state - Redux state
 * @returns {boolean} true if both startDate and endDate are set
 */
export const selectAnalyticsDashboardHasDateRange = (state) => {
  const dateRange = state.dateRange?.analyticsDashboard;
  if (!dateRange) return false;
  return dateRange.startDate !== null && dateRange.endDate !== null;
};

// Future dashboard selectors can be added here following the same pattern
//
// export const selectSalesDashboardDateRange = (state) => state.dateRange.salesDashboard;
// export const selectSalesDashboardStartDate = (state) => state.dateRange.salesDashboard.startDate;
// export const selectSalesDashboardEndDate = (state) => state.dateRange.salesDashboard.endDate;
// export const selectSalesDashboardHasDateRange = (state) => {
//   const { startDate, endDate } = state.dateRange.salesDashboard;
//   return startDate !== null && endDate !== null;
// };

export default dateRangeSlice.reducer;
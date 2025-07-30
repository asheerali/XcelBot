// store/slices/masterFileSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../api/axiosConfig';

// Async thunk for loading data from selected filters
export const loadMasterFileData = createAsyncThunk(
  'masterFile/loadData',
  async ({ company_id, location_id, filename }, { rejectWithValue }) => {
    try {
      const url = `/api/masterfile/details/${company_id}/${location_id}/${encodeURIComponent(filename)}`;
      const response = await apiClient.get(url);
      
      return {
        ...response.data,
        company_id,
        location_id,
        filename,
        company_name: response.data.company_name,
        location_name: response.data.location_name
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to load data');
    }
  }
);

// Async thunk for loading multiple files
export const loadMultipleMasterFileData = createAsyncThunk(
  'masterFile/loadMultipleData',
  async (filterSelections, { rejectWithValue }) => {
    try {
      const apiCalls = filterSelections.map(selection => {
        const url = `/api/masterfile/details/${selection.company_id}/${selection.location_id}/${encodeURIComponent(selection.filename)}`;
        return apiClient.get(url).then(response => ({
          ...response.data,
          company_id: selection.company_id,
          location_id: selection.location_id,
          filename: selection.filename,
          company_name: selection.company_name,
          location_name: selection.location_name
        }));
      });

      const results = await Promise.allSettled(apiCalls);
      
      const successfulResults = results
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value);
      
      const failedResults = results
        .filter(result => result.status === 'rejected')
        .map(result => result.reason);

      return {
        successful: successfulResults,
        failed: failedResults
      };
    } catch (error) {
      return rejectWithValue('Failed to load data');
    }
  }
);

const initialState = {
  // Current selections
  selectedCompanies: [],
  selectedLocations: [], 
  selectedFilenames: [],
  
  // Last applied filters (for auto-loading)
  lastAppliedFilters: {
    companies: [],
    locations: [],
    filenames: []
  },
  
  // Data state
  items: [],
  columns: {},
  currentPriceColumn: null,
  previousPriceColumn: null,
  
  // Loading states
  loading: false,
  error: null,
  
  // Status
  lastLoadedAt: null,
  dataSource: null // 'single' or 'multiple'
};

const masterFileSlice = createSlice({
  name: 'masterFile',
  initialState,
  reducers: {
    // Update filter selections
    setSelectedCompanies: (state, action) => {
      state.selectedCompanies = action.payload;
    },
    setSelectedLocations: (state, action) => {
      state.selectedLocations = action.payload;
    },
    setSelectedFilenames: (state, action) => {
      state.selectedFilenames = action.payload;
    },
    
    // Clear all selections
    clearSelections: (state) => {
      state.selectedCompanies = [];
      state.selectedLocations = [];
      state.selectedFilenames = [];
    },
    
    // Update individual item (for editing)
    updateItem: (state, action) => {
      const { id, updates } = action.payload;
      const itemIndex = state.items.findIndex(item => item.id === id);
      if (itemIndex !== -1) {
        state.items[itemIndex] = { ...state.items[itemIndex], ...updates };
      }
    },
    
    // Clear data
    clearData: (state) => {
      state.items = [];
      state.columns = {};
      state.currentPriceColumn = null;
      state.previousPriceColumn = null;
      state.error = null;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Single file loading
      .addCase(loadMasterFileData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadMasterFileData.fulfilled, (state, action) => {
        state.loading = false;
        
        // Process single response
        const response = action.payload;
        if (response.data && response.data.columns && response.data.dataframe) {
          state.columns = response.data.columns;
          
          // Find price columns
          let currentPriceCol = null;
          let previousPriceCol = null;
          
          Object.keys(state.columns).forEach(key => {
            const columnName = state.columns[key].toLowerCase();
            if (columnName.includes('current price')) {
              currentPriceCol = key;
            } else if (columnName.includes('previous price')) {
              previousPriceCol = key;
            }
          });
          
          state.currentPriceColumn = currentPriceCol;
          state.previousPriceColumn = previousPriceCol;
          
          // Process items
          state.items = response.data.dataframe.map((item, index) => {
            const processedItem = {
              ...item,
              id: `${response.company_id}_${response.location_id}_${index}`,
              _meta: {
                company_id: response.company_id,
                location_id: response.location_id,
                filename: response.filename,
                company_name: response.company_name,
                location_name: response.location_name
              }
            };

            // Clean up previous price column
            if (previousPriceCol && processedItem[previousPriceCol]) {
              const prevPrice = parseFloat(processedItem[previousPriceCol]);
              if (isNaN(prevPrice) || prevPrice <= 0) {
                processedItem[previousPriceCol] = null;
              }
            }

            return processedItem;
          });
        }
        
        state.dataSource = 'single';
        state.lastLoadedAt = new Date().toISOString();
        
        // Save last applied filters for single selection
        state.lastAppliedFilters = {
          companies: [response.company_id.toString()],
          locations: [response.location_id.toString()],
          filenames: [response.filename]
        };
      })
      .addCase(loadMasterFileData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Multiple files loading
      .addCase(loadMultipleMasterFileData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadMultipleMasterFileData.fulfilled, (state, action) => {
        state.loading = false;
        
        const { successful, failed } = action.payload;
        
        if (successful.length > 0) {
          let allItems = [];
          let mergedColumns = {};
          let currentPriceCol = null;
          let previousPriceCol = null;

          successful.forEach((response) => {
            if (response.data && response.data.columns && response.data.dataframe) {
              // Use first response's column structure
              if (Object.keys(mergedColumns).length === 0) {
                mergedColumns = { ...response.data.columns };
                
                Object.keys(mergedColumns).forEach(key => {
                  const columnName = mergedColumns[key].toLowerCase();
                  if (columnName.includes('current price')) {
                    currentPriceCol = key;
                  } else if (columnName.includes('previous price')) {
                    previousPriceCol = key;
                  }
                });
              }

              // Process items
              const processedItems = response.data.dataframe.map((item, index) => {
                const processedItem = {
                  ...item,
                  id: `${response.company_id}_${response.location_id}_${index}`,
                  _meta: {
                    company_id: response.company_id,
                    location_id: response.location_id,
                    filename: response.filename,
                    company_name: response.company_name,
                    location_name: response.location_name
                  }
                };

                // Clean up previous price column
                if (previousPriceCol && processedItem[previousPriceCol]) {
                  const prevPrice = parseFloat(processedItem[previousPriceCol]);
                  if (isNaN(prevPrice) || prevPrice <= 0) {
                    processedItem[previousPriceCol] = null;
                  }
                }

                return processedItem;
              });

              allItems = [...allItems, ...processedItems];
            }
          });

          state.items = allItems;
          state.columns = mergedColumns;
          state.currentPriceColumn = currentPriceCol;
          state.previousPriceColumn = previousPriceCol;
          
          // Set error if some failed
          if (failed.length > 0) {
            state.error = `Loaded ${successful.length} sources successfully, ${failed.length} failed`;
          }
        } else {
          state.error = `All ${failed.length} API calls failed`;
        }
        
        state.dataSource = 'multiple';
        state.lastLoadedAt = new Date().toISOString();
        
        // Save last applied filters
        state.lastAppliedFilters = {
          companies: state.selectedCompanies,
          locations: state.selectedLocations,
          filenames: state.selectedFilenames
        };
      })
      .addCase(loadMultipleMasterFileData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  setSelectedCompanies,
  setSelectedLocations,
  setSelectedFilenames,
  clearSelections,
  updateItem,
  clearData,
  clearError
} = masterFileSlice.actions;

export default masterFileSlice.reducer;

// Selectors
export const selectMasterFileState = (state) => state.masterFile;
export const selectItems = (state) => state.masterFile.items;
export const selectColumns = (state) => state.masterFile.columns;
export const selectCurrentPriceColumn = (state) => state.masterFile.currentPriceColumn;
export const selectPreviousPriceColumn = (state) => state.masterFile.previousPriceColumn;
export const selectSelectedCompanies = (state) => state.masterFile.selectedCompanies;
export const selectSelectedLocations = (state) => state.masterFile.selectedLocations;
export const selectSelectedFilenames = (state) => state.masterFile.selectedFilenames;
export const selectLastAppliedFilters = (state) => state.masterFile.lastAppliedFilters;
export const selectLoading = (state) => state.masterFile.loading;
export const selectError = (state) => state.masterFile.error;
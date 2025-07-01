// store/index.js
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer, createTransform } from "redux-persist";
import storage from "redux-persist/lib/storage"; // uses localStorage
import excelReducer from "./excelSlice";
import masterFileReducer from "./slices/masterFileSlice"; // Add masterFile reducer

// Create a transform to remove large or non-serializable `fileContent` before persisting
const excelTransform = createTransform(
  // Transform state on its way to being persisted
  (inboundState: any) => {
    if (!inboundState) return inboundState;
    const stripFileContent = (files: any[]) =>
      files?.map(({ fileContent, ...rest }) => rest) ?? [];
    return {
      ...inboundState,
      files: stripFileContent(inboundState.files),
      financialFiles: stripFileContent(inboundState.financialFiles),
      salesFiles: stripFileContent(inboundState.salesFiles),
      salesWideFiles: stripFileContent(inboundState.salesWideFiles),
      productMixFiles: stripFileContent(inboundState.productMixFiles),
    };
  },
  // Transform state coming from persistence (rehydrated state)
  (outboundState: any) => outboundState,
  // Only apply this transform to the "excel" slice
  { whitelist: ["excel"] }
);

// Create a transform for masterFile to optimize persistence
const masterFileTransform = createTransform(
  // Transform state on its way to being persisted
  (inboundState: any) => {
    if (!inboundState) return inboundState;
    
    // Only persist essential data, not large item arrays if they're too big
    const maxItems = 1000; // Limit to prevent localStorage bloat
    const persistedState = {
      ...inboundState,
      // Truncate items if too many to prevent localStorage issues
      items: inboundState.items.length > maxItems 
        ? inboundState.items.slice(0, maxItems)
        : inboundState.items
    };
    
    return persistedState;
  },
  // Transform state coming from persistence (rehydrated state)
  (outboundState: any) => outboundState,
  // Only apply this transform to the "masterFile" slice
  { whitelist: ["masterFile"] }
);

// Configuration for redux-persist
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["excel", "masterFile"], // Add masterFile to persistence
  transforms: [excelTransform, masterFileTransform], // Apply both transforms
};

// Combine all reducers
const rootReducer = combineReducers({
  excel: excelReducer,
  masterFile: masterFileReducer, // Add masterFile reducer
});

// Wrap root reducer with persistence capabilities
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create the store with middleware adjusted for redux-persist
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        // Ignore these field paths in all actions
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['items.meta'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Create the persistor object
export const persistor = persistStore(store);

// Export RootState and AppDispatch types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
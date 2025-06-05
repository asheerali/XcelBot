// // // store/index.ts
// // import { configureStore } from '@reduxjs/toolkit';
// // import excelReducer from './excelSlice';

// // export const store = configureStore({
// //   reducer: {
// //     excel: excelReducer
// //   }
// // });

// // // Infer the `RootState` and `AppDispatch` types from the store itself
// // export type RootState = ReturnType<typeof store.getState>;
// // export type AppDispatch = typeof store.dispatch;

// // store/index.ts
// import { configureStore, combineReducers } from "@reduxjs/toolkit";
// import { persistStore, persistReducer } from "redux-persist";
// import storage from "redux-persist/lib/storage"; // uses localStorage
// import excelReducer from "./excelSlice";

// const persistConfig = {
//   key: "root",
//   storage,
//   whitelist: ["excel"], // persist only the excel slice
// };

// const rootReducer = combineReducers({
//   excel: excelReducer,
// });

// const persistedReducer = persistReducer(persistConfig, rootReducer);

// export const store = configureStore({
//   reducer: persistedReducer,
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({
//       serializableCheck: false, // needed for redux-persist
//     }),
// });

// export const persistor = persistStore(store);

// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;




import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer, createTransform } from "redux-persist";
import storage from "redux-persist/lib/storage"; // uses localStorage
import excelReducer from "./excelSlice";

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

// Configuration for redux-persist
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["excel"],
  transforms: [excelTransform],
};

// Combine all reducers
const rootReducer = combineReducers({
  excel: excelReducer,
});

// Wrap root reducer with persistence capabilities
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create the store with middleware adjusted for redux-persist
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Create the persistor object
export const persistor = persistStore(store);

// Export RootState and AppDispatch types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

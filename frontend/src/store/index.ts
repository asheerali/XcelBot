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
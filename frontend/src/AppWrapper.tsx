// src/AppWrapper.tsx
import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import your components
import CustomSidebar from './components/CustomSidebar';
import ExcelImport from './components/ExcelImport';
import Financials from './pages/Financials';

// Create a material UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#fff',
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8', 
      dark: '#7b1fa2',
      contrastText: '#fff',
    },
  },
});

const AppWrapper: React.FC = () => {
  // Mock sign out function
  const handleSignOut = () => {
    console.log('User signed out');
  };

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <CustomSidebar 
            title="Sales Dashboard" 
            onSignOut={handleSignOut}
          />
          <div style={{ marginLeft: 64, padding: '20px' }}>
            <Routes>
              <Route path="/" element={<ExcelImport />} />
              <Route path="/upload" element={<ExcelImport />} />
              <Route path="/manage-reports" element={<ExcelImport />} />
              <Route path="/Financials" element={<Financials />} />
              <Route path="*" element={<ExcelImport />} />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </Provider>
  );
};

export default AppWrapper;
// App.tsx
import * as React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline, Box } from "@mui/material";
import logoMidPng from "./assets/icon/IG_logo.svg" // Adjust the path as necessary
import { Session } from "@toolpad/core/AppProvider"; // Keep this for Session type
import { SessionContext } from "./SessionContext";
import * as agentService from "./services/agentService";
import * as productService from "./services/productService";
import * as customerService from "./services/customerService";
import * as orderService from "./services/orderService";

// Import CustomSidebar
import CustomSidebar from "./components/CustomSidebar";

// Import your specific icons - kept for reference only
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import NewspaperIcon from "@mui/icons-material/Newspaper";

// Create a material UI theme
const muiTheme = createTheme({
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
    error: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#c62828',
      contrastText: '#fff',
    },
    warning: {
      main: '#ed6c02',
      light: '#ff9800',
      dark: '#e65100',
      contrastText: '#fff',
    },
    info: {
      main: '#0288d1',
      light: '#03a9f4',
      dark: '#01579b',
      contrastText: '#fff',
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
      contrastText: '#fff',
    },
    grey: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
      A100: '#f5f5f5',
      A200: '#eeeeee',
      A400: '#bdbdbd',
      A700: '#616161',
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
      disabled: 'rgba(0, 0, 0, 0.38)',
    },
    divider: 'rgba(0, 0, 0, 0.12)',
    background: {
      paper: '#fff',
      default: '#fff',
    },
    action: {
      active: 'rgba(0, 0, 0, 0.54)',
      hover: 'rgba(0, 0, 0, 0.04)',
      selected: 'rgba(0, 0, 0, 0.08)',
      disabled: 'rgba(0, 0, 0, 0.26)',
      disabledBackground: 'rgba(0, 0, 0, 0.12)',
    }
  },
  shape: {
    borderRadius: 4,
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 14,
  },
  spacing: 8,
});

// Initialize services
agentService.init();
customerService.init();
productService.init();
orderService.init();

// Create a logo component
const Logo = () => <img src={logoMidPng} alt="Logo" height="30" />;

export default function App() {
  const [session, setSession] = React.useState<Session | null>(null);
  const navigate = useNavigate();

  const signIn = React.useCallback(() => {
    navigate("/sign-in");
  }, [navigate]);

  const signOut = React.useCallback(() => {
    // setSession(null);
    navigate("/sign-in");
  }, [navigate]);

  const sessionContextValue = React.useMemo(
    () => ({ session, setSession }),
    [session, setSession]
  );

  return (
    <SessionContext.Provider value={sessionContextValue}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', height: '100vh' }}>
          {/* Use your CustomSidebar here */}
          <CustomSidebar
            logo={<Logo />}
            title="Audit IQ"
            onSignOut={signOut}
          />
          
          {/* Main content area */}
          <Box 
            component="main" 
            sx={{ 
              flexGrow: 1, 
              p: 3,
              overflow: 'auto'
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </ThemeProvider>
    </SessionContext.Provider>
  );
}
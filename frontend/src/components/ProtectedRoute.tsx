import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, Typography, Button, Paper, Container } from '@mui/material';
import { Lock as LockIcon, Home as HomeIcon } from '@mui/icons-material';
import apiClient from '../api/axiosConfig';

// Route permission mapping - same as in CustomSidebar
const ROUTE_PERMISSIONS = {
  // INSIGHTiQ routes
  '/upload-excel': 'ADMIN_ONLY', // Changed from null to ADMIN_ONLY
  '/manage-reports': 'sales_split',
  '/Productmix': 'product_mix',
  '/Financials': 'finance',
  '/Saleswide': 'sales_wide',
  
  // ORDERiQ routes
  '/AnalyticsDashboard': 'orderiq',
  '/MasterFile': 'orderiq',
  '/OrderIQDashboard': 'orderiq',
  '/StoreSummaryProduction': 'orderiq',
  '/SummaryFinancialDashboard': 'orderiq',
  '/Reports': 'orderiq',
  
  // Always accessible routes (but still require active user)
  '/Payments': null,
  '/FileManagement': 'ADMIN_ONLY', // Changed from null to ADMIN_ONLY
  '/HelpCenter': null,
  '/CompanyLocationManager': null,
  '/profile-info': null,
  
  // Public routes
  '/': null,
  '/dashboard': null,
  '/sign-in': null,
  '/sign-out': null,
};

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const [userDetails, setUserDetails] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to check if user has permission - same logic as CustomSidebar
  const hasPermission = (permission) => {
  // Check if user is active first
  if (!userDetails?.isActive) {
    return false; // Inactive users have no permissions
  }

  // Admin and superuser have access to everything (when active)
  if (userRole === 'Admin' || userRole === 'Superuser') {
    return true;
  }

  // Check for admin-only pages
  if (permission === 'ADMIN_ONLY') {
    return userRole === 'Admin' || userRole === 'Superuser';
  }

  // Check if user has specific permission
  return userPermissions.includes(permission);
};

  // Fetch user details and permissions
  useEffect(() => {
    const fetchUserDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await apiClient.get('/company-overview/user-details');
        
        if (response.data && response.data.length > 0) {
          const userData = response.data[0];
          setUserDetails(userData);
          setUserPermissions(userData.permissions || []);
          setUserRole(userData.role || '');
        } else {
          setError('No user data received');
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
        setError('Failed to fetch user permissions');
        
        // If unauthorized, redirect to sign-in
        if (error.response?.status === 401) {
          window.location.href = '/sign-in';
          return;
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  // Check if current route requires permission
  const currentPath = location.pathname;
  const requiredPermission = ROUTE_PERMISSIONS[currentPath];

  // If still loading, show loading state
  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100vh',
          backgroundColor: '#f5f5f5'
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Loading permissions...
        </Typography>
      </Box>
    );
  }

  // If error fetching permissions, show error
  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <LockIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom color="error.main">
            Permission Error
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {error}
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<HomeIcon />}
            onClick={() => window.location.href = '/sign-in'}
          >
            Go to Sign In
          </Button>
        </Paper>
      </Container>
    );
  }

  // If route is not in our permissions map, allow access (unknown routes)
  if (requiredPermission === undefined) {
    return children;
  }

  // If no permission required, allow access
  if (requiredPermission === null) {
    return children;
  }

  // Check if user has required permission
  if (!hasPermission(requiredPermission) && !userDetails.isActive ) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#fff3e0' }}>
          <LockIcon sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom color="warning.dark">
            Unauthorized Access
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            You don't have permission to access this page.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Required permission: <strong>{requiredPermission}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Your role: <strong>{userRole}</strong>
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button 
              variant="outlined" 
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
            {/* <Button 
              variant="contained" 
              startIcon={<HomeIcon />}
              onClick={() => window.location.href = '/profile-info'}
            >
              Go to Dashboard
            </Button> */}
          </Box>
        </Paper>
      </Container>
    );
  }

  // User has permission, render the protected component
  return children;
};

export default ProtectedRoute;
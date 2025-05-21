import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Grid, 
  FormControlLabel, 
  Switch, 
  Button, 
  Divider, 
  Alert, 
  Snackbar,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  IconButton
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { SelectChangeEvent } from '@mui/material/Select';

// Mock user data - in a real application, this would come from an API
const MOCK_USERS = [
  { id: 1, name: 'John Doe', email: 'john.doe@example.com', role: 'Manager' },
  { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', role: 'Analyst' },
  { id: 3, name: 'Mike Johnson', email: 'mike.johnson@example.com', role: 'Sales Rep' },
  { id: 4, name: 'Sarah Williams', email: 'sarah.williams@example.com', role: 'Admin' },
  { id: 5, name: 'David Brown', email: 'david.brown@example.com', role: 'Manager' },
];

// Mock permission data - in a real application, this would come from an API
const MOCK_PERMISSIONS = {
  1: { canUploadExcel: true },
  2: { canUploadExcel: true },
  3: { canUploadExcel: false },
  4: { canUploadExcel: true },
  5: { canUploadExcel: false },
};

const ExcelUploadPermissions: React.FC = () => {
  // State for selected user and permissions
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('');
  const [permissions, setPermissions] = useState({
    canUploadExcel: false,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [allPermissions, setAllPermissions] = useState<any>(MOCK_PERMISSIONS);
  const [showPermissionTable, setShowPermissionTable] = useState<boolean>(false);
  const [selectedStore, setSelectedStore] = useState<string>('');

  // Handle store selection change
  const handleStoreChange = (event: SelectChangeEvent<string>) => {
    setSelectedStore(event.target.value);
  };

  // Handle user selection change
  const handleUserChange = (event: SelectChangeEvent<typeof selectedUserId>) => {
    const userId = event.target.value as number;
    setSelectedUserId(userId);
    
    // Reset error state
    setError('');
    
    // Load permissions for the selected user
    if (userId && allPermissions[userId]) {
      setPermissions(allPermissions[userId]);
      setIsEditing(false);
    } else {
      // Default permissions for new users
      setPermissions({
        canUploadExcel: false,
      });
    }
  };
  
  // Handle permission toggle
  const handlePermissionChange = (permission: keyof typeof permissions) => {
    setPermissions(prev => ({
      ...prev,
      [permission]: !prev[permission]
    }));
  };
  
  // Handle save permissions
  const handleSavePermissions = () => {
    if (!selectedUserId) {
      setError('Please select a user first');
      return;
    }
    
    setLoading(true);
    
    // Simulate API call with setTimeout
    setTimeout(() => {
      try {
        // Update permissions in our mock data
        setAllPermissions(prev => ({
          ...prev,
          [selectedUserId]: { ...permissions }
        }));
        
        setSuccess(true);
        setIsEditing(false);
        setLoading(false);
        setError('');
      } catch (err) {
        setError('Error saving permissions');
        setLoading(false);
      }
    }, 800); // Simulate network delay
  };
  
  // Handle edit mode toggle
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };
  
  // Handle success notification close
  const handleSuccessClose = () => {
    setSuccess(false);
  };
  
  // Toggle permission table view
  const togglePermissionTable = () => {
    setShowPermissionTable(!showPermissionTable);
  };
  
  // Get user name from ID
  const getUserName = (userId: number): string => {
    const user = MOCK_USERS.find(u => u.id === userId);
    return user ? user.name : 'Unknown User';
  };

  // User detail card
  const renderUserDetail = () => {
    if (!selectedUserId) return null;
    
    const user = MOCK_USERS.find(u => u.id === selectedUserId);
    if (!user) return null;
    
    return (
      <Paper elevation={2} sx={{ p: 2, mb: 3, backgroundColor: '#f8f9fa' }}>
        <Box display="flex" alignItems="center">
          <PersonIcon sx={{ fontSize: 40, color: '#3f51b5', mr: 2 }} />
          <Box>
            <Typography variant="h6">{user.name}</Typography>
            <Typography variant="body2" color="text.secondary">{user.email}</Typography>
            <Typography variant="body2" color="text.secondary">Role: {user.role}</Typography>
          </Box>
        </Box>
      </Paper>
    );
  };

  // Permissions table
  const renderPermissionsTable = () => {
    return (
      <TableContainer component={Paper} sx={{ mb: 4, maxHeight: 400 }}>
        <Table stickyHeader aria-label="permissions table">
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Role</TableCell>
              <TableCell align="center">Excel Upload Permission</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(allPermissions).map(([userId, userPermissions]) => {
              const userInfo = MOCK_USERS.find(u => u.id === Number(userId));
              return (
                <TableRow 
                  key={userId}
                  sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}
                >
                  <TableCell component="th" scope="row">
                    {getUserName(Number(userId))}
                  </TableCell>
                  <TableCell>{userInfo?.role || 'Unknown'}</TableCell>
                  <TableCell align="center">
                    {userPermissions.canUploadExcel ? 
                      <Typography sx={{ color: 'green', fontWeight: 'bold' }}>✅ Allowed</Typography> : 
                      <Typography sx={{ color: 'red' }}>❌ Not Allowed</Typography>
                    }
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* <Typography variant="h4"gutterBottom> */}
                 <Typography 
                          variant="h4" 
                          component="h1" 
                          sx={{ 
                            fontWeight: 600,
                            color: '#1a237e',
                            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
                          }}
                        >
        Excel Upload Permissions
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Manage which users can upload Excel files 
      </Typography>
      
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Button 
          variant="outlined" 
          onClick={togglePermissionTable}
          startIcon={showPermissionTable ? <ArrowBackIcon /> : undefined}
        >
          {showPermissionTable ? 'Back to Permission Editor' : 'View All Permissions'}
        </Button>
      </Box>
      
      {/* All Permissions Table View */}
      {showPermissionTable && renderPermissionsTable()}
      
      {/* Permission Editor View */}
      {!showPermissionTable && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={3}>
                 {/* Stores Selection */}
      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel id="store-select-label">Select Store</InputLabel>
          <Select
            labelId="store-select-label"
            id="store-select"
            value={selectedStore}
            label="Select Store"
            onChange={handleStoreChange}
          >
            <MenuItem value="midtown-east">Midtown East</MenuItem>
            <MenuItem value="hells-kitchen">Hell's Kitchen</MenuItem>
            <MenuItem value="lenox-hill">Lenox Hill</MenuItem>
          </Select>
        </FormControl>
      </Grid>



              {/* User Selection */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="user-select-label">Select User</InputLabel>
                  <Select
                    labelId="user-select-label"
                    id="user-select"
                    value={selectedUserId}
                    label="Select User"
                    onChange={handleUserChange}
                  >
                    {MOCK_USERS.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              {/* Edit/Save Controls */}
              <Grid item xs={12} md={6} display="flex" alignItems="center" justifyContent="flex-end">
                {selectedUserId && (
                  <>
                    {isEditing ? (
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        onClick={handleSavePermissions}
                        disabled={loading}
                      >
                        {loading ? 'Saving...' : 'Save Permission'}
                      </Button>
                    ) : (
                      <Button
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={handleEditToggle}
                      >
                        Edit Permission
                      </Button>
                    )}
                  </>
                )}
              </Grid>
              
              {/* User Details */}
              <Grid item xs={12}>
                {renderUserDetail()}
              </Grid>
              
              {/* Error Display */}
              {error && (
                <Grid item xs={12}>
                  <Alert severity="error">{error}</Alert>
                </Grid>
              )}
              
              {/* Permission Toggle */}
              <Grid item xs={12}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Excel Upload Permission
                </Typography>
                
                <Grid container justifyContent="center">
                  <Grid item xs={12} sm={6}>
                    <Paper 
                      elevation={3} 
                      sx={{ 
                        p: 3, 
                        textAlign: 'center',
                        backgroundColor: permissions.canUploadExcel ? '#e3f2fd' : '#ffebee',
                        borderLeft: permissions.canUploadExcel ? '6px solid #2196f3' : '6px solid #f44336',
                        transition: 'all 0.3s ease-in-out'
                      }}
                    >
                      <Typography variant="h6" gutterBottom>
                        {permissions.canUploadExcel ? 
                          "Excel Upload Permission" : 
                          "Excel Upload Restricted"}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        {permissions.canUploadExcel ?
                          "This user can upload Excel files " :
                          "This user cannot upload Excel files  "
                        }
                      </Typography>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={permissions.canUploadExcel}
                            onChange={() => isEditing && handlePermissionChange('canUploadExcel')}
                            disabled={!isEditing}
                            color={permissions.canUploadExcel ? "primary" : "error"}
                            size="large"
                          />
                        }
                        label={
                          <Typography variant="body1" fontWeight="bold">
                            {permissions.canUploadExcel ? "Allowed" : "Not Allowed"}
                          </Typography>
                        }
                      />
                    </Paper>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
      
      {/* Success Notification */}
      <Snackbar
        open={success}
        autoHideDuration={4000}
        onClose={handleSuccessClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleSuccessClose} severity="success" sx={{ width: '100%' }}>
          Excel upload permission updated successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ExcelUploadPermissions;
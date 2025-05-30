import React, { useState, useEffect } from "react";
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
  IconButton,
  Chip,
  Avatar,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import PersonIcon from "@mui/icons-material/Person";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ViewListIcon from "@mui/icons-material/ViewList";
import SettingsIcon from "@mui/icons-material/Settings";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import BusinessIcon from "@mui/icons-material/Business";
import { SelectChangeEvent } from "@mui/material/Select";

// Styled components for modern design
const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, 
    ${theme.palette.primary.main}15 0%, 
    ${theme.palette.secondary.main}10 50%, 
    ${theme.palette.primary.light}08 100%)`,
  padding: theme.spacing(3, 0),
  borderRadius: "0 0 20px 20px",
  marginBottom: theme.spacing(3),
  position: "relative",
  overflow: "hidden",
}));

const ModernCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(145deg, 
    ${theme.palette.background.paper} 0%, 
    ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
  backdropFilter: "blur(10px)",
  borderRadius: "16px",
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: `0 8px 25px -8px ${alpha(theme.palette.primary.main, 0.2)}`,
  },
}));

const PermissionCard = styled(Paper)(({ theme, isallowed }) => ({
  padding: theme.spacing(2),
  textAlign: "center",
  background: isallowed
    ? `linear-gradient(135deg, ${alpha(
        theme.palette.success.main,
        0.1
      )} 0%, ${alpha(theme.palette.success.light, 0.05)} 100%)`
    : `linear-gradient(135deg, ${alpha(
        theme.palette.error.main,
        0.1
      )} 0%, ${alpha(theme.palette.error.light, 0.05)} 100%)`,
  borderLeft: `4px solid ${
    isallowed ? theme.palette.success.main : theme.palette.error.main
  }`,
  borderRadius: "12px",
  transition: "all 0.3s ease",
  height: "140px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
}));

const CompactTable = styled(TableContainer)(({ theme }) => ({
  maxHeight: "300px",
  borderRadius: "12px",
  "& .MuiTableCell-root": {
    padding: theme.spacing(1),
    fontSize: "0.875rem",
  },
  "& .MuiTableHead-root": {
    background: alpha(theme.palette.primary.main, 0.05),
  },
}));

// Mock data
const MOCK_USERS = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Manager",
    avatar: "JD",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "Analyst",
    avatar: "JS",
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike.johnson@example.com",
    role: "Sales Rep",
    avatar: "MJ",
  },
  {
    id: 4,
    name: "Sarah Williams",
    email: "sarah.williams@example.com",
    role: "Admin",
    avatar: "SW",
  },
  {
    id: 5,
    name: "David Brown",
    email: "david.brown@example.com",
    role: "Manager",
    avatar: "DB",
  },
];

const MOCK_PERMISSIONS = {
  1: { canUploadExcel: true },
  2: { canUploadExcel: true },
  3: { canUploadExcel: false },
  4: { canUploadExcel: true },
  5: { canUploadExcel: false },
};

const STORES = [
  { value: "midtown-east", label: "Midtown East" },
  { value: "hells-kitchen", label: "Hell's Kitchen" },
  { value: "lenox-hill", label: "Lenox Hill" },
  { value: "union-square", label: "Union Square" },
  { value: "brooklyn", label: "Brooklyn" },
];

const ExcelUploadPermissions = () => {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [permissions, setPermissions] = useState({ canUploadExcel: false });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [allPermissions, setAllPermissions] = useState(MOCK_PERMISSIONS);
  const [showPermissionTable, setShowPermissionTable] = useState(false);
  const [selectedStore, setSelectedStore] = useState("midtown-east");

  const handleStoreChange = (event) => {
    setSelectedStore(event.target.value);
  };

  const handleUserChange = (event) => {
    const userId = event.target.value;
    setSelectedUserId(userId);
    setError("");

    if (userId && allPermissions[userId]) {
      setPermissions(allPermissions[userId]);
      setIsEditing(false);
    } else {
      setPermissions({ canUploadExcel: false });
    }
  };

  const handlePermissionChange = (permission) => {
    setPermissions((prev) => ({
      ...prev,
      [permission]: !prev[permission],
    }));
  };

  const handleSavePermissions = () => {
    if (!selectedUserId) {
      setError("Please select a user first");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      try {
        setAllPermissions((prev) => ({
          ...prev,
          [selectedUserId]: { ...permissions },
        }));

        setSuccess(true);
        setIsEditing(false);
        setLoading(false);
        setError("");
      } catch (err) {
        setError("Error saving permissions");
        setLoading(false);
      }
    }, 800);
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSuccessClose = () => {
    setSuccess(false);
  };

  const togglePermissionTable = () => {
    setShowPermissionTable(!showPermissionTable);
  };

  const getUserName = (userId) => {
    const user = MOCK_USERS.find((u) => u.id === userId);
    return user ? user.name : "Unknown User";
  };

  const getSelectedUser = () => {
    return MOCK_USERS.find((u) => u.id === selectedUserId);
  };

  const renderUserDetail = () => {
    const user = getSelectedUser();
    if (!user) return null;

    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          p: 2,
          backgroundColor: alpha("#1976d2", 0.05),
          borderRadius: "12px",
          border: `1px solid ${alpha("#1976d2", 0.1)}`,
        }}
      >
        <Avatar
          sx={{
            bgcolor: "#1976d2",
            width: 48,
            height: 48,
            mr: 2,
            fontSize: "1.2rem",
            fontWeight: "bold",
          }}
        >
          {user.avatar}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
            {user.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.email} • {user.role}
          </Typography>
        </Box>
        <Chip
          label={user.role}
          color="primary"
          variant="outlined"
          size="small"
        />
      </Box>
    );
  };

  const renderPermissionsTable = () => {
    return (
      <CompactTable component={Paper}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>User</strong>
              </TableCell>
              <TableCell>
                <strong>Role</strong>
              </TableCell>
              <TableCell align="center">
                <strong>Excel Upload</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(allPermissions).map(([userId, userPermissions]) => {
              const userInfo = MOCK_USERS.find((u) => u.id === Number(userId));
              return (
                <TableRow
                  key={userId}
                  sx={{
                    "&:hover": { backgroundColor: alpha("#1976d2", 0.04) },
                    height: "48px",
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Avatar
                        sx={{
                          width: 28,
                          height: 28,
                          fontSize: "0.75rem",
                          mr: 1,
                          bgcolor: "#1976d2",
                        }}
                      >
                        {userInfo?.avatar}
                      </Avatar>
                      {getUserName(Number(userId))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={userInfo?.role || "Unknown"}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    {userPermissions.canUploadExcel ? (
                      <CheckCircleIcon
                        sx={{ color: "success.main", fontSize: "1.5rem" }}
                      />
                    ) : (
                      <CancelIcon
                        sx={{ color: "error.main", fontSize: "1.5rem" }}
                      />
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CompactTable>
    );
  };

  return (
    <Box
      sx={{
        height: "100vh",
        overflow: "hidden",
        background: "linear-gradient(180deg, #fafafa 0%, #ffffff 100%)",
      }}
    >
      {/* Compact Hero Section */}
      <HeroSection>
        <Box sx={{ textAlign: "center", px: 3 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 1,
            }}
          >
            <SettingsIcon sx={{ fontSize: 32, color: "primary.main", mr: 1 }} />
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 600,
                color: "#1a237e",
                fontSize: { xs: "1.5rem", sm: "2rem" },
              }}
            >
              Excel Upload Permissions
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Manage user access to Excel file uploads across stores
          </Typography>
        </Box>
      </HeroSection>

      <Box sx={{ px: 3, height: "calc(100vh - 140px)", overflow: "auto" }}>
        {/* Action Bar */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Button
            variant={showPermissionTable ? "contained" : "outlined"}
            onClick={togglePermissionTable}
            startIcon={
              showPermissionTable ? <ArrowBackIcon /> : <ViewListIcon />
            }
            size="small"
          >
            {showPermissionTable ? "Permission Editor" : "View All Permissions"}
          </Button>

          {error && (
            <Alert severity="error" sx={{ fontSize: "0.875rem", py: 0.5 }}>
              {error}
            </Alert>
          )}
        </Box>

        {/* All Permissions Table View */}
        {showPermissionTable && (
          <ModernCard>
            <CardContent sx={{ p: 2 }}>
              <Typography
                variant="h6"
                sx={{ mb: 2, display: "flex", alignItems: "center" }}
              >
                <ViewListIcon sx={{ mr: 1 }} />
                All User Permissions
              </Typography>
              {renderPermissionsTable()}
            </CardContent>
          </ModernCard>
        )}

        {/* Permission Editor View */}
        {!showPermissionTable && (
          <ModernCard>
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={3}>
                {/* Store and User Selection Row */}
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Store Location</InputLabel>
                    <Select
                      value={selectedStore}
                      label="Store Location"
                      onChange={handleStoreChange}
                      startAdornment={
                        <BusinessIcon sx={{ mr: 1, color: "action.active" }} />
                      }
                    >
                      {STORES.map((store) => (
                        <MenuItem key={store.value} value={store.value}>
                          {store.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Select User</InputLabel>
                    <Select
                      value={selectedUserId}
                      label="Select User"
                      onChange={handleUserChange}
                      startAdornment={
                        <PersonIcon sx={{ mr: 1, color: "action.active" }} />
                      }
                    >
                      {MOCK_USERS.map((user) => (
                        <MenuItem key={user.id} value={user.id}>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Avatar
                              sx={{
                                width: 24,
                                height: 24,
                                fontSize: "0.75rem",
                                mr: 1,
                                bgcolor: "#1976d2",
                              }}
                            >
                              {user.avatar}
                            </Avatar>
                            {user.name} ({user.role})
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  {selectedUserId && (
                    <Box sx={{ display: "flex", gap: 1, height: "40px" }}>
                      {isEditing ? (
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={
                            loading ? (
                              <CircularProgress size={16} color="inherit" />
                            ) : (
                              <SaveIcon />
                            )
                          }
                          onClick={handleSavePermissions}
                          disabled={loading}
                          fullWidth
                        >
                          {loading ? "Saving..." : "Save"}
                        </Button>
                      ) : (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={handleEditToggle}
                          fullWidth
                        >
                          Edit
                        </Button>
                      )}
                    </Box>
                  )}
                </Grid>

                {/* User Details */}
                {selectedUserId && (
                  <Grid item xs={12}>
                    {renderUserDetail()}
                  </Grid>
                )}

                {/* Permission Control */}
                {selectedUserId && (
                  <Grid item xs={12}>
                    <Grid container justifyContent="center">
                      <Grid item xs={12} sm={8} md={6}>
                        <PermissionCard
                          elevation={2}
                          isallowed={permissions.canUploadExcel}
                        >
                          <Typography
                            variant="h6"
                            gutterBottom
                            sx={{ fontWeight: 600 }}
                          >
                            Excel Upload Permission
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 2 }}
                          >
                            {permissions.canUploadExcel
                              ? "User can upload Excel files"
                              : "User cannot upload Excel files"}
                          </Typography>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={permissions.canUploadExcel}
                                onChange={() =>
                                  isEditing &&
                                  handlePermissionChange("canUploadExcel")
                                }
                                disabled={!isEditing}
                                color={
                                  permissions.canUploadExcel
                                    ? "success"
                                    : "error"
                                }
                                size="medium"
                              />
                            }
                            label={
                              <Typography variant="body1" fontWeight="bold">
                                {permissions.canUploadExcel
                                  ? "Allowed"
                                  : "Restricted"}
                              </Typography>
                            }
                          />
                        </PermissionCard>

                        <PermissionCard
                          elevation={2}
                          isallowed={permissions.canUploadExcel}
                        >
                          <Typography
                            variant="h6"
                            gutterBottom
                            sx={{ fontWeight: 600 }}
                          >
                            Sales Split
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 2 }}
                          >
                            {permissions.canUploadExcel
                              ? "User can upload Excel files"
                              : "User cannot upload Excel files"}
                          </Typography>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={permissions.canUploadExcel}
                                onChange={() =>
                                  isEditing &&
                                  handlePermissionChange("canUploadExcel")
                                }
                                disabled={!isEditing}
                                color={
                                  permissions.canUploadExcel
                                    ? "success"
                                    : "error"
                                }
                                size="medium"
                              />
                            }
                            label={
                              <Typography variant="body1" fontWeight="bold">
                                {permissions.canUploadExcel
                                  ? "Allowed"
                                  : "Restricted"}
                              </Typography>
                            }
                          />
                        </PermissionCard>
                        <PermissionCard
                          elevation={2}
                          isallowed={permissions.canUploadExcel}
                        >
                          <Typography
                            variant="h6"
                            gutterBottom
                            sx={{ fontWeight: 600 }}
                          >
                            Product Mix
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 2 }}
                          >
                            {permissions.canUploadExcel
                              ? "User can upload Excel files"
                              : "User cannot upload Excel files"}
                          </Typography>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={permissions.canUploadExcel}
                                onChange={() =>
                                  isEditing &&
                                  handlePermissionChange("canUploadExcel")
                                }
                                disabled={!isEditing}
                                color={
                                  permissions.canUploadExcel
                                    ? "success"
                                    : "error"
                                }
                                size="medium"
                              />
                            }
                            label={
                              <Typography variant="body1" fontWeight="bold">
                                {permissions.canUploadExcel
                                  ? "Allowed"
                                  : "Restricted"}
                              </Typography>
                            }
                          />
                        </PermissionCard>
                        <PermissionCard
                          elevation={2}
                          isallowed={permissions.canUploadExcel}
                        >
                          <Typography
                            variant="h6"
                            gutterBottom
                            sx={{ fontWeight: 600 }}
                          >
                            Financials
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 2 }}
                          >
                            {permissions.canUploadExcel
                              ? "User can upload Excel files"
                              : "User cannot upload Excel files"}
                          </Typography>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={permissions.canUploadExcel}
                                onChange={() =>
                                  isEditing &&
                                  handlePermissionChange("canUploadExcel")
                                }
                                disabled={!isEditing}
                                color={
                                  permissions.canUploadExcel
                                    ? "success"
                                    : "error"
                                }
                                size="medium"
                              />
                            }
                            label={
                              <Typography variant="body1" fontWeight="bold">
                                {permissions.canUploadExcel
                                  ? "Allowed"
                                  : "Restricted"}
                              </Typography>
                            }
                          />
                        </PermissionCard>
                        <PermissionCard
                          elevation={2}
                          isallowed={permissions.canUploadExcel}
                        >
                          <Typography
                            variant="h6"
                            gutterBottom
                            sx={{ fontWeight: 600 }}
                          >
                            Company Wide
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 2 }}
                          >
                            {permissions.canUploadExcel
                              ? "User can upload Excel files"
                              : "User cannot upload Excel files"}
                          </Typography>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={permissions.canUploadExcel}
                                onChange={() =>
                                  isEditing &&
                                  handlePermissionChange("canUploadExcel")
                                }
                                disabled={!isEditing}
                                color={
                                  permissions.canUploadExcel
                                    ? "success"
                                    : "error"
                                }
                                size="medium"
                              />
                            }
                            label={
                              <Typography variant="body1" fontWeight="bold">
                                {permissions.canUploadExcel
                                  ? "Allowed"
                                  : "Restricted"}
                              </Typography>
                            }
                          />
                        </PermissionCard>
                      </Grid>
                    </Grid>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </ModernCard>
        )}
      </Box>

      {/* Success Notification */}
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={handleSuccessClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleSuccessClose}
          severity="success"
          sx={{ width: "100%" }}
        >
          Permission updated successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ExcelUploadPermissions;

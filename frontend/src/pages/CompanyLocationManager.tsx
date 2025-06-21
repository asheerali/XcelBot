import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
  Chip,
  Paper,
  Stack,
  Fab,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Avatar,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  Switch,
  FormControlLabel,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Autocomplete,
  Badge,
  LinearProgress,
  CircularProgress,
} from "@mui/material";

// Icons
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import BusinessIcon from "@mui/icons-material/Business";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import CompanyIcon from "@mui/icons-material/Domain";
import PlaceIcon from "@mui/icons-material/Place";
import PersonIcon from "@mui/icons-material/Person";
import SecurityIcon from "@mui/icons-material/Security";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import GroupIcon from "@mui/icons-material/Group";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import FilterListIcon from "@mui/icons-material/FilterList";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import StarIcon from "@mui/icons-material/Star";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import RefreshIcon from "@mui/icons-material/Refresh";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import WebIcon from "@mui/icons-material/Web";
import CloseIcon from "@mui/icons-material/Close";
import { API_URL_Local } from "../constants";

const SALES_WIDE_FILTER_API_URL = `${API_URL_Local}/company-overview/`;

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

// Updated User interface with firstName, lastName, and phone
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  permissions: string[];
  assignedLocations: string[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

interface Location {
  id: string;
  name: string;
  city: string;
  state: string;
  postcode: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  manager?: string; // User ID of location manager
  createdAt: Date;
  updatedAt: Date;
}

interface Company {
  id: string;
  name: string;
  city: string;
  state: string;
  postcode: string;
  phone: string;
  email?: string;
  website?: string;
  industry?: string;
  locations: Location[];
  users: User[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type DialogMode = "add" | "edit" | "view" | null;
type EntityType = "company" | "location" | "user";
type ViewMode = "table" | "cards";

const AVAILABLE_PERMISSIONS: Permission[] = [
  {
    id: "excel_upload",
    name: "Excel Upload",
    description: "Upload and manage Excel files",
    category: "Data Management",
  },
  {
    id: "sales_split",
    name: "Sales Split",
    description: "Access Sales Split dashboard",
    category: "Analytics",
  },
  {
    id: "product_mix",
    name: "Product Mix",
    description: "Access Product Mix dashboard",
    category: "Analytics",
  },
  {
    id: "finance",
    name: "Finance",
    description: "Access Finance dashboard",
    category: "Financial",
  },
  {
    id: "sales_wide",
    name: "Sales Wide",
    description: "Access Sales Wide dashboard",
    category: "Sales",
  },
  {
    id: "user_management",
    name: "User Management",
    description: "Manage users and permissions",
    category: "Administration",
  },
  {
    id: "location_management",
    name: "Location Management",
    description: "Manage locations",
    category: "Administration",
  },
  {
    id: "reporting",
    name: "Reporting",
    description: "Generate and view reports",
    category: "Analytics",
  },
];

const USER_ROLES = [
  { value: "superuser", label: "Super User", color: "#f44336", level: 1 },
  { value: "admin", label: "Admin", color: "#ff9800", level: 2 },
  { value: "manager", label: "Manager", color: "#2196f3", level: 3 },
  { value: "user", label: "User", color: "#4caf50", level: 4 },
  { value: "trial", label: "Trial", color: "#9c27b0", level: 5 },
];

const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Manufacturing",
  "Retail",
  "Education",
  "Construction",
  "Transportation",
  "Energy",
  "Other",
];

const CompanyLocationManager: React.FC = () => {
  const theme = useTheme();

  // State for companies and locations
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(
    new Set()
  );

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI States
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [showInactiveOnly, setShowInactiveOnly] = useState(false);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [entityType, setEntityType] = useState<EntityType>("company");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form states
  const [companyForm, setCompanyForm] = useState({
    name: "",
    city: "",
    state: "",
    postcode: "",
    phone: "",
    email: "",
    website: "",
    industry: "",
    isActive: true,
  });

  const [locationForm, setLocationForm] = useState({
    name: "",
    city: "",
    state: "",
    postcode: "",
    phone: "",
    email: "",
    manager: "",
    isActive: true,
  });

  // Updated userForm to include firstName, lastName, phone
  const [userForm, setUserForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    permissions: [] as string[],
    assignedLocations: [] as string[],
    isActive: true,
  });

  // UI states
  const [searchTerm, setSearchTerm] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [selectedItemType, setSelectedItemType] =
    useState<EntityType>("company");

  // Notification states
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning" | "info";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // API call to fetch company data
  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(SALES_WIDE_FILTER_API_URL);
      
      console.log('API Response:', response.data); // Debug log
      
      // Handle different API response structures
      let apiData = response.data;
      
      // If the response is not an array, it might be wrapped in a data property
      if (!Array.isArray(apiData)) {
        if (apiData.data && Array.isArray(apiData.data)) {
          apiData = apiData.data;
        } else {
          // If we still don't have an array, create empty array
          console.warn('API response is not an array:', apiData);
          apiData = [];
        }
      }
      
      // Transform the API response to match our interface
      const transformedCompanies: Company[] = apiData.map((apiCompany: any) => ({
        id: apiCompany.id || apiCompany.company_id || generateId(),
        name: apiCompany.name || apiCompany.company_name || '',
        city: apiCompany.city || '',
        state: apiCompany.state || '',
        postcode: apiCompany.postcode || apiCompany.post_code || '',
        phone: apiCompany.phone || '',
        email: apiCompany.email || '',
        website: apiCompany.website || '',
        industry: apiCompany.industry || '',
        isActive: apiCompany.isActive !== undefined ? apiCompany.isActive : true,
        createdAt: apiCompany.createdAt ? new Date(apiCompany.createdAt) : new Date(),
        updatedAt: apiCompany.updatedAt ? new Date(apiCompany.updatedAt) : new Date(),
        locations: Array.isArray(apiCompany.locations) ? apiCompany.locations.map((apiLocation: any) => ({
          id: apiLocation.id || apiLocation.location_id || generateId(),
          name: apiLocation.name || apiLocation.location_name || '',
          city: apiLocation.city || '',
          state: apiLocation.state || '',
          postcode: apiLocation.postcode || apiLocation.post_code || '',
          phone: apiLocation.phone || '',
          email: apiLocation.email || '',
          isActive: apiLocation.isActive !== undefined ? apiLocation.isActive : true,
          manager: apiLocation.manager || '',
          createdAt: apiLocation.createdAt ? new Date(apiLocation.createdAt) : new Date(),
          updatedAt: apiLocation.updatedAt ? new Date(apiLocation.updatedAt) : new Date(),
        })) : [],
        users: Array.isArray(apiCompany.users) ? apiCompany.users.map((apiUser: any) => ({
          id: apiUser.id || apiUser.user_id || generateId(),
          firstName: apiUser.firstName || apiUser.first_name || '',
          lastName: apiUser.lastName || apiUser.last_name || '',
          email: apiUser.email || '',
          phone: apiUser.phone || '',
          role: apiUser.role || 'user',
          permissions: Array.isArray(apiUser.permissions) ? apiUser.permissions : [],
          assignedLocations: Array.isArray(apiUser.assignedLocations) ? apiUser.assignedLocations : [],
          isActive: apiUser.isActive !== undefined ? apiUser.isActive : true,
          createdAt: apiUser.createdAt ? new Date(apiUser.createdAt) : new Date(),
        })) : [],
      }));
      
      setCompanies(transformedCompanies);
      
    } catch (err) {
      console.error('Error fetching company data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch company data');
      // Set empty companies array on error to prevent rendering issues
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchCompanyData();
  }, []);

  // Handle refresh
  const handleRefresh = () => {
    fetchCompanyData();
  };

  // Filter companies based on search and filters
  const filteredAndSortedCompanies = useMemo(() => {
    let filtered = companies;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (company) =>
          company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.locations?.some(
            (location) =>
              location.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              location.city?.toLowerCase().includes(searchTerm.toLowerCase())
          ) ||
          company.users?.some(
            (user) =>
              user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              user.email?.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Apply role filter
    if (selectedRole) {
      filtered = filtered.filter((company) =>
        company.users?.some((user) => user.role === selectedRole)
      );
    }

    // Apply active/inactive filter
    if (showInactiveOnly) {
      filtered = filtered.filter((company) => !company.isActive);
    }

    return filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [companies, searchTerm, selectedRole, showInactiveOnly]);

  useEffect(() => {
    setFilteredCompanies(filteredAndSortedCompanies);
  }, [filteredAndSortedCompanies]);

  // Helper functions
  const showNotification = (
    message: string,
    severity: "success" | "error" | "warning" | "info"
  ) => {
    setNotification({ open: true, message, severity });
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const resetForms = () => {
    setCompanyForm({
      name: "",
      city: "",
      state: "",
      postcode: "",
      phone: "",
      email: "",
      website: "",
      industry: "",
      isActive: true,
    });

    setLocationForm({
      name: "",
      city: "",
      state: "",
      postcode: "",
      phone: "",
      email: "",
      manager: "",
      isActive: true,
    });

    setUserForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "",
      permissions: [],
      assignedLocations: [],
      isActive: true,
    });
  };

  // Get role color
  const getRoleColor = (role: string) => {
    const roleConfig = USER_ROLES.find((r) => r.value === role);
    return roleConfig?.color || "#9e9e9e";
  };

  // Get users assigned to a specific location
  const getUsersForLocation = (companyId: string, locationId: string) => {
    const company = companies.find((c) => c.id === companyId);
    if (!company || !company.users) return [];

    return company.users.filter(
      (user) => 
        user.assignedLocations && 
        Array.isArray(user.assignedLocations) &&
        user.assignedLocations.includes(locationId) && 
        user.isActive
    );
  };

  // Get location name by ID
  const getLocationName = (companyId: string, locationId: string) => {
    const company = companies.find((c) => c.id === companyId);
    if (!company || !company.locations) return "Unknown Location";

    const location = company.locations.find((l) => l.id === locationId);
    return location ? location.name || "Unknown Location" : "Unknown Location";
  };

  // CRUD Operations for Users
  const handleCreateUser = async () => {
    try {
      setLoading(true);
      const userData = {
        ...userForm,
        companyId: selectedCompany?.id,
      };

      const response = await axios.post(`${API_URL_Local}/users`, userData);
      
      showNotification("User created successfully", "success");
      await fetchCompanyData(); // Refresh data
      setDialogOpen(false);
      resetForms();
    } catch (error) {
      console.error('Error creating user:', error);
      showNotification("Failed to create user", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    try {
      setLoading(true);
      const userData = {
        ...userForm,
        id: selectedUser?.id,
      };

      await axios.put(`${API_URL_Local}/users/${selectedUser?.id}`, userData);
      
      showNotification("User updated successfully", "success");
      await fetchCompanyData(); // Refresh data
      setDialogOpen(false);
      resetForms();
    } catch (error) {
      console.error('Error updating user:', error);
      showNotification("Failed to update user", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setLoading(true);
      await axios.delete(`${API_URL_Local}/users/${userId}`);
      
      showNotification("User deleted successfully", "success");
      await fetchCompanyData(); // Refresh data
    } catch (error) {
      console.error('Error deleting user:', error);
      showNotification("Failed to delete user", "error");
    } finally {
      setLoading(false);
    }
  };

  // CRUD Operations for Locations
  const handleCreateLocation = async () => {
    try {
      setLoading(true);
      const locationData = {
        ...locationForm,
        companyId: selectedCompany?.id,
      };

      await axios.post(`${API_URL_Local}/stores`, locationData);
      
      showNotification("Location created successfully", "success");
      await fetchCompanyData(); // Refresh data
      setDialogOpen(false);
      resetForms();
    } catch (error) {
      console.error('Error creating location:', error);
      showNotification("Failed to create location", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLocation = async () => {
    try {
      setLoading(true);
      const locationData = {
        ...locationForm,
        id: selectedLocation?.id,
      };

      await axios.put(`${API_URL_Local}/stores/${selectedLocation?.id}`, locationData);
      
      showNotification("Location updated successfully", "success");
      await fetchCompanyData(); // Refresh data
      setDialogOpen(false);
      resetForms();
    } catch (error) {
      console.error('Error updating location:', error);
      showNotification("Failed to update location", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLocation = async (locationId: string) => {
    try {
      setLoading(true);
      await axios.delete(`${API_URL_Local}/stores/${locationId}`);
      
      showNotification("Location deleted successfully", "success");
      await fetchCompanyData(); // Refresh data
    } catch (error) {
      console.error('Error deleting location:', error);
      showNotification("Failed to delete location", "error");
    } finally {
      setLoading(false);
    }
  };

  // CRUD Operations for Companies
  const handleCreateCompany = async () => {
    console.log('Creating company with form data:', companyForm); // Debug log
    try {
      setLoading(true);
      await axios.post(`${API_URL_Local}/companies`, companyForm);
      
      showNotification("Company created successfully", "success");
      await fetchCompanyData(); // Refresh data
      setDialogOpen(false);
      resetForms();
    } catch (error) {
      console.error('Error creating company:', error);
      showNotification("Failed to create company", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCompany = async () => {
    try {
      setLoading(true);
      const companyData = {
        ...companyForm,
        id: selectedCompany?.id,
      };

      await axios.put(`${API_URL_Local}/companies/${selectedCompany?.id}`, companyData);
      
      showNotification("Company updated successfully", "success");
      await fetchCompanyData(); // Refresh data
      setDialogOpen(false);
      resetForms();
    } catch (error) {
      console.error('Error updating company:', error);
      showNotification("Failed to update company", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCompany = async (companyId: string) => {
    try {
      setLoading(true);
      await axios.delete(`${API_URL_Local}/companies/${companyId}`);
      
      showNotification("Company deleted successfully", "success");
      await fetchCompanyData(); // Refresh data
    } catch (error) {
      console.error('Error deleting company:', error);
      showNotification("Failed to delete company", "error");
    } finally {
      setLoading(false);
    }
  };

  // Dialog handlers
  const handleOpenDialog = (
    mode: DialogMode,
    type: EntityType,
    company?: Company,
    location?: Location,
    user?: User
  ) => {
    setDialogMode(mode);
    setEntityType(type);
    setSelectedCompany(company || null);
    setSelectedLocation(location || null);
    setSelectedUser(user || null);

    if (mode === "edit") {
      if (type === "company" && company) {
        setCompanyForm({
          name: company.name,
          city: company.city,
          state: company.state,
          postcode: company.postcode,
          phone: company.phone,
          email: company.email || "",
          website: company.website || "",
          industry: company.industry || "",
          isActive: company.isActive,
        });
      } else if (type === "location" && location) {
        setLocationForm({
          name: location.name,
          city: location.city,
          state: location.state,
          postcode: location.postcode,
          phone: location.phone || "",
          email: location.email || "",
          manager: location.manager || "",
          isActive: location.isActive,
        });
      } else if (type === "user" && user) {
        setUserForm({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          permissions: user.permissions,
          assignedLocations: user.assignedLocations,
          isActive: user.isActive,
        });
      }
    } else {
      resetForms();
    }

    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setDialogMode(null);
    resetForms();
  };

  const handleSave = () => {
    if (dialogMode === "add") {
      if (entityType === "company") {
        handleCreateCompany();
      } else if (entityType === "location") {
        handleCreateLocation();
      } else if (entityType === "user") {
        handleCreateUser();
      }
    } else if (dialogMode === "edit") {
      if (entityType === "company") {
        handleUpdateCompany();
      } else if (entityType === "location") {
        handleUpdateLocation();
      } else if (entityType === "user") {
        handleUpdateUser();
      }
    }
  };

  // Menu handlers
  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    itemId: string,
    itemType: EntityType
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedItemId(itemId);
    setSelectedItemType(itemType);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItemId("");
  };

  const handleMenuAction = (action: string) => {
    const company = companies.find((c) => c.id === selectedItemId);
    const location = company?.locations.find((l) => l.id === selectedItemId);
    const user = company?.users.find((u) => u.id === selectedItemId);

    if (action === "edit") {
      if (selectedItemType === "company") {
        handleOpenDialog("edit", "company", company);
      } else if (selectedItemType === "location") {
        handleOpenDialog("edit", "location", company, location);
      } else if (selectedItemType === "user") {
        handleOpenDialog("edit", "user", company, undefined, user);
      }
    } else if (action === "delete") {
      if (selectedItemType === "company") {
        handleDeleteCompany(selectedItemId);
      } else if (selectedItemType === "location") {
        handleDeleteLocation(selectedItemId);
      } else if (selectedItemType === "user") {
        handleDeleteUser(selectedItemId);
      }
    }

    handleMenuClose();
  };

  const handleToggleCompany = (companyId: string) => {
    setExpandedCompanies((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(companyId)) {
        newSet.delete(companyId);
      } else {
        newSet.add(companyId);
      }
      return newSet;
    });
  };

  if (loading && companies.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Safety check: if companies is not an array, show error
  if (!Array.isArray(companies)) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          Error: Invalid data structure received from API. Expected array but got: {typeof companies}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Card elevation={0} sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Box>
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                Company & Location Manager
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Manage companies, locations, and users in your organization
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={loading}
              sx={{ borderRadius: 2 }}
            >
              Refresh
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Search and Filters */}
      <Card elevation={1} sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search companies, locations, or users..."
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Filter by Role</InputLabel>
                <Select
                  value={selectedRole}
                  label="Filter by Role"
                  onChange={(e: SelectChangeEvent) => setSelectedRole(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">All Roles</MenuItem>
                  {USER_ROLES.map((role) => (
                    <MenuItem key={role.value} value={role.value}>
                      {role.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showInactiveOnly}
                    onChange={(e) => setShowInactiveOnly(e.target.checked)}
                    color="primary"
                  />
                }
                label="Show Inactive Only"
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog("add", "company")}
                sx={{ borderRadius: 2 }}
              >
                Add Company
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Companies List */}
      <Card elevation={1} sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Companies ({filteredCompanies.length})
          </Typography>

          {filteredCompanies.length === 0 ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              py={6}
            >
              <BusinessIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No companies found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {searchTerm
                  ? "Try adjusting your search or filters"
                  : "Get started by adding your first company"}
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog("add", "company")}
                sx={{ borderRadius: 2 }}
              >
                Add Company
              </Button>
            </Box>
          ) : (
            <Stack spacing={2}>
              {filteredCompanies.map((company) => (
                <Paper
                  key={company.id}
                  elevation={2}
                  sx={{
                    borderRadius: 2,
                    overflow: "hidden",
                    border: !company.isActive ? `2px solid ${theme.palette.error.light}` : undefined,
                  }}
                >
                  {/* Company Header */}
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: company.isActive ? "background.paper" : "grey.50",
                      borderBottom: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      spacing={2}
                    >
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <IconButton
                          onClick={() => handleToggleCompany(company.id)}
                          size="small"
                        >
                          {expandedCompanies.has(company.id) ? (
                            <ExpandLessIcon />
                          ) : (
                            <ExpandMoreIcon />
                          )}
                        </IconButton>

                        <Avatar
                          sx={{
                            bgcolor: company.isActive ? "primary.main" : "grey.400",
                            width: 48,
                            height: 48,
                          }}
                        >
                          <BusinessIcon />
                        </Avatar>

                        <Box>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography variant="h6" fontWeight="600">
                              {company.name || 'Unnamed Company'}
                            </Typography>
                            <Chip
                              label={company.isActive ? "Active" : "Inactive"}
                              color={company.isActive ? "success" : "error"}
                              size="small"
                              variant="outlined"
                            />
                          </Stack>
                          <Typography variant="body2" color="text.secondary">
                            📍 {(company.city || '') + ', ' + (company.state || '') + ' ' + (company.postcode || '')}
                          </Typography>
                          <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                            {company.phone && (
                              <Typography variant="caption" color="text.secondary">
                                📞 {company.phone}
                              </Typography>
                            )}
                            {company.email && (
                              <Typography variant="caption" color="text.secondary">
                                ✉️ {company.email}
                              </Typography>
                            )}
                            {company.website && (
                              <Typography variant="caption" color="text.secondary">
                                🌐 {company.website}
                              </Typography>
                            )}
                          </Stack>
                        </Box>
                      </Stack>

                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Chip
                          label={`${company.locations?.length || 0} Locations`}
                          variant="outlined"
                          size="small"
                          icon={<LocationOnIcon />}
                        />
                        <Chip
                          label={`${company.users?.length || 0} Users`}
                          variant="outlined"
                          size="small"
                          icon={<PersonIcon />}
                        />
                        <IconButton
                          onClick={(e) => handleMenuClick(e, company.id, "company")}
                          size="small"
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </Box>

                  {/* Expanded Content */}
                  <Collapse in={expandedCompanies.has(company.id)}>
                    <Box sx={{ p: 2 }}>
                      <Grid container spacing={3}>
                        {/* Locations Section */}
                        <Grid item xs={12} md={6}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{ mb: 2 }}
                          >
                            <Typography variant="subtitle1" fontWeight="600">
                              Locations ({company.locations?.length || 0})
                            </Typography>
                            <Button
                              size="small"
                              startIcon={<AddIcon />}
                              onClick={() => handleOpenDialog("add", "location", company)}
                              variant="outlined"
                              sx={{ borderRadius: 2 }}
                            >
                              Add Location
                            </Button>
                          </Stack>

                          {company.locations?.length === 0 ? (
                            <Paper
                              sx={{
                                p: 3,
                                textAlign: "center",
                                bgcolor: "grey.50",
                                borderRadius: 2,
                              }}
                            >
                              <PlaceIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
                              <Typography variant="body2" color="text.secondary">
                                No locations added yet
                              </Typography>
                            </Paper>
                          ) : (
                            <Stack spacing={1}>
                              {company.locations?.map((location) => (
                                <Paper
                                  key={location.id}
                                  sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    border: !location.isActive
                                      ? `1px solid ${theme.palette.error.light}`
                                      : `1px solid ${theme.palette.divider}`,
                                  }}
                                >
                                  <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center"
                                  >
                                    <Box>
                                      <Stack direction="row" alignItems="center" spacing={1}>
                                        <Typography variant="subtitle2" fontWeight="500">
                                          {location.name || 'Unnamed Location'}
                                        </Typography>
                                        <Chip
                                          label={location.isActive ? "Active" : "Inactive"}
                                          color={location.isActive ? "success" : "error"}
                                          size="small"
                                          variant="outlined"
                                        />
                                      </Stack>
                                      <Typography variant="body2" color="text.secondary">
                                        📍 {(location.city || '') + ', ' + (location.state || '') + ' ' + (location.postcode || '')}
                                      </Typography>
                                      <Box>
                                        {location.phone && (
                                          <Typography variant="body2" sx={{ mb: 0.5 }}>
                                            📞 {location.phone}
                                          </Typography>
                                        )}
                                        {location.email && (
                                          <Typography variant="body2">
                                            ✉️ {location.email}
                                          </Typography>
                                        )}
                                        {!location.phone && !location.email && (
                                          <Typography variant="caption" color="text.secondary">
                                            No contact info
                                          </Typography>
                                        )}
                                      </Box>
                                    </Box>
                                    <IconButton
                                      onClick={(e) => handleMenuClick(e, location.id, "location")}
                                      size="small"
                                    >
                                      <MoreVertIcon />
                                    </IconButton>
                                  </Stack>
                                </Paper>
                              ))}
                            </Stack>
                          )}
                        </Grid>

                        {/* Users Section */}
                        <Grid item xs={12} md={6}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{ mb: 2 }}
                          >
                            <Typography variant="subtitle1" fontWeight="600">
                              Users ({company.users?.length || 0})
                            </Typography>
                            <Button
                              size="small"
                              startIcon={<AddIcon />}
                              onClick={() => handleOpenDialog("add", "user", company)}
                              variant="outlined"
                              sx={{ borderRadius: 2 }}
                            >
                              Add User
                            </Button>
                          </Stack>

                          {company.users?.length === 0 ? (
                            <Paper
                              sx={{
                                p: 3,
                                textAlign: "center",
                                bgcolor: "grey.50",
                                borderRadius: 2,
                              }}
                            >
                              <PersonIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
                              <Typography variant="body2" color="text.secondary">
                                No users added yet
                              </Typography>
                            </Paper>
                          ) : (
                            <Stack spacing={1}>
                              {company.users?.map((user) => (
                                <Paper
                                  key={user.id}
                                  sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    border: !user.isActive
                                      ? `1px solid ${theme.palette.error.light}`
                                      : `1px solid ${theme.palette.divider}`,
                                  }}
                                >
                                  <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center"
                                  >
                                    <Box>
                                      <Stack direction="row" alignItems="center" spacing={1}>
                                        <Typography variant="subtitle2" fontWeight="500">
                                          {(user.firstName || '') + ' ' + (user.lastName || '')}
                                        </Typography>
                                        <Chip
                                          label={user.role || 'user'}
                                          size="small"
                                          sx={{
                                            bgcolor: getRoleColor(user.role || 'user') + "20",
                                            color: getRoleColor(user.role || 'user'),
                                            fontWeight: 500,
                                          }}
                                        />
                                        <Chip
                                          label={user.isActive ? "Active" : "Inactive"}
                                          color={user.isActive ? "success" : "error"}
                                          size="small"
                                          variant="outlined"
                                        />
                                      </Stack>
                                      <Typography variant="body2" color="text.secondary">
                                        ✉️ {user.email || 'No email'}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        📞 {user.phone || 'No phone'}
                                      </Typography>
                                      {user.assignedLocations && user.assignedLocations.length > 0 && (
                                        <Typography variant="caption" color="text.secondary">
                                          📍 {user.assignedLocations.length} location(s) assigned
                                        </Typography>
                                      )}
                                    </Box>
                                    <IconButton
                                      onClick={(e) => handleMenuClick(e, user.id, "user")}
                                      size="small"
                                    >
                                      <MoreVertIcon />
                                    </IconButton>
                                  </Stack>
                                </Paper>
                              ))}
                            </Stack>
                          )}
                        </Grid>
                      </Grid>
                    </Box>
                  </Collapse>
                </Paper>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={() => handleMenuAction("edit")}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Edit
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction("delete")} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>

      {/* Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="600">
              {dialogMode === "add" ? "Add" : "Edit"}{" "}
              {entityType === "company"
                ? "Company"
                : entityType === "location"
                ? "Location"
                : "User"}
            </Typography>
            <IconButton onClick={handleCloseDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent>
          {entityType === "company" ? (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Company Name *"
                  value={companyForm.name}
                  onChange={(e) =>
                    setCompanyForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  required
                  error={!companyForm.name.trim()}
                  helperText={!companyForm.name.trim() ? "Company name is required" : ""}
                  placeholder="Enter company name"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="City *"
                  value={companyForm.city}
                  onChange={(e) =>
                    setCompanyForm((prev) => ({
                      ...prev,
                      city: e.target.value,
                    }))
                  }
                  required
                  error={!companyForm.city.trim()}
                  helperText={!companyForm.city.trim() ? "City is required" : ""}
                  placeholder="Enter city"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="State *"
                  value={companyForm.state}
                  onChange={(e) =>
                    setCompanyForm((prev) => ({
                      ...prev,
                      state: e.target.value,
                    }))
                  }
                  required
                  error={!companyForm.state.trim()}
                  helperText={!companyForm.state.trim() ? "State is required" : ""}
                  placeholder="Enter state"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Post Code *"
                  value={companyForm.postcode}
                  onChange={(e) =>
                    setCompanyForm((prev) => ({
                      ...prev,
                      postcode: e.target.value,
                    }))
                  }
                  required
                  error={!companyForm.postcode.trim()}
                  helperText={!companyForm.postcode.trim() ? "Post code is required" : ""}
                  placeholder="12345"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone *"
                  value={companyForm.phone}
                  onChange={(e) =>
                    setCompanyForm((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  required
                  error={!companyForm.phone.trim()}
                  helperText={!companyForm.phone.trim() ? "Phone is required" : ""}
                  placeholder="(555) 123-4567"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email (Optional)"
                  type="email"
                  value={companyForm.email}
                  onChange={(e) =>
                    setCompanyForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder="contact@company.com"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Website (Optional)"
                  value={companyForm.website}
                  onChange={(e) =>
                    setCompanyForm((prev) => ({
                      ...prev,
                      website: e.target.value,
                    }))
                  }
                  placeholder="https://company.com"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Industry</InputLabel>
                  <Select
                    value={companyForm.industry}
                    label="Industry"
                    onChange={(e: SelectChangeEvent) =>
                      setCompanyForm((prev) => ({
                        ...prev,
                        industry: e.target.value,
                      }))
                    }
                    sx={{ borderRadius: 2 }}
                  >
                    {INDUSTRIES.map((industry) => (
                      <MenuItem key={industry} value={industry}>
                        {industry}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={companyForm.isActive}
                      onChange={(e) =>
                        setCompanyForm((prev) => ({
                          ...prev,
                          isActive: e.target.checked,
                        }))
                      }
                      color="primary"
                    />
                  }
                  label="Active Company"
                />
              </Grid>
            </Grid>
          ) : entityType === "location" ? (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location Name *"
                  value={locationForm.name}
                  onChange={(e) =>
                    setLocationForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  required
                  error={!locationForm.name.trim()}
                  helperText={!locationForm.name.trim() ? "Location name is required" : ""}
                  placeholder="Enter location name"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="City *"
                  value={locationForm.city}
                  onChange={(e) =>
                    setLocationForm((prev) => ({
                      ...prev,
                      city: e.target.value,
                    }))
                  }
                  required
                  error={!locationForm.city.trim()}
                  helperText={!locationForm.city.trim() ? "City is required" : ""}
                  placeholder="Enter city"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="State *"
                  value={locationForm.state}
                  onChange={(e) =>
                    setLocationForm((prev) => ({
                      ...prev,
                      state: e.target.value,
                    }))
                  }
                  required
                  error={!locationForm.state.trim()}
                  helperText={!locationForm.state.trim() ? "State is required" : ""}
                  placeholder="Enter state"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Post Code *"
                  value={locationForm.postcode}
                  onChange={(e) =>
                    setLocationForm((prev) => ({
                      ...prev,
                      postcode: e.target.value,
                    }))
                  }
                  required
                  error={!locationForm.postcode.trim()}
                  helperText={!locationForm.postcode.trim() ? "Post code is required" : ""}
                  placeholder="12345"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone (Optional)"
                  value={locationForm.phone}
                  onChange={(e) =>
                    setLocationForm((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  placeholder="(555) 123-4567"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email (Optional)"
                  type="email"
                  value={locationForm.email}
                  onChange={(e) =>
                    setLocationForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder="location@company.com"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </Grid>

              {selectedCompany && selectedCompany.users?.length > 0 && (
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Location Manager (Optional)</InputLabel>
                    <Select
                      value={locationForm.manager}
                      label="Location Manager (Optional)"
                      onChange={(e: SelectChangeEvent) =>
                        setLocationForm((prev) => ({
                          ...prev,
                          manager: e.target.value,
                        }))
                      }
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="">No Manager</MenuItem>
                                      {selectedCompany?.users
                        .filter((user) => user.isActive)
                        .map((user) => (
                          <MenuItem key={user.id} value={user.id}>
                            {user.firstName} {user.lastName} ({user.role})
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={locationForm.isActive}
                      onChange={(e) =>
                        setLocationForm((prev) => ({
                          ...prev,
                          isActive: e.target.checked,
                        }))
                      }
                      color="primary"
                    />
                  }
                  label="Active Location"
                />
              </Grid>
            </Grid>
          ) : (
            // User Form - Updated with firstName, lastName, phone
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="First Name *"
                  value={userForm.firstName}
                  onChange={(e) =>
                    setUserForm((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                  required
                  error={!userForm.firstName.trim()}
                  helperText={!userForm.firstName.trim() ? "First name is required" : ""}
                  placeholder="Enter first name"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Last Name *"
                  value={userForm.lastName}
                  onChange={(e) =>
                    setUserForm((prev) => ({
                      ...prev,
                      lastName: e.target.value,
                    }))
                  }
                  required
                  error={!userForm.lastName.trim()}
                  helperText={!userForm.lastName.trim() ? "Last name is required" : ""}
                  placeholder="Enter last name"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email *"
                  type="email"
                  value={userForm.email}
                  onChange={(e) =>
                    setUserForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  required
                  error={!userForm.email.trim()}
                  helperText={!userForm.email.trim() ? "Email is required" : ""}
                  placeholder="user@company.com"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone *"
                  value={userForm.phone}
                  onChange={(e) =>
                    setUserForm((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  required
                  error={!userForm.phone.trim()}
                  helperText={!userForm.phone.trim() ? "Phone number is required" : ""}
                  placeholder="(555) 123-4567"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Role *</InputLabel>
                  <Select
                    value={userForm.role}
                    label="Role *"
                    onChange={(e: SelectChangeEvent) =>
                      setUserForm((prev) => ({
                        ...prev,
                        role: e.target.value,
                      }))
                    }
                    error={!userForm.role}
                    sx={{ borderRadius: 2 }}
                  >
                    {USER_ROLES.map((role) => (
                      <MenuItem key={role.value} value={role.value}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              bgcolor: role.color,
                            }}
                          />
                          <Typography>{role.label}</Typography>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Assigned Locations</InputLabel>
                  <Select
                    multiple
                    value={userForm.assignedLocations}
                    onChange={(e: SelectChangeEvent<string[]>) =>
                      setUserForm((prev) => ({
                        ...prev,
                        assignedLocations: e.target.value as string[],
                      }))
                    }
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {(selected as string[]).map((value) => (
                          <Chip
                            key={value}
                            label={getLocationName(selectedCompany?.id || "", value)}
                            size="small"
                          />
                        ))}
                      </Box>
                    )}
                    sx={{ borderRadius: 2 }}
                  >
                    {selectedCompany?.locations && selectedCompany.locations.map((location) => (
                      <MenuItem key={location.id} value={location.id}>
                        <Checkbox
                          checked={userForm.assignedLocations.indexOf(location.id) > -1}
                        />
                        <ListItemText primary={location.name || 'Unnamed Location'} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Permissions</InputLabel>
                  <Select
                    multiple
                    value={userForm.permissions}
                    onChange={(e: SelectChangeEvent<string[]>) =>
                      setUserForm((prev) => ({
                        ...prev,
                        permissions: e.target.value as string[],
                      }))
                    }
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {(selected as string[]).map((value) => {
                          const permission = AVAILABLE_PERMISSIONS.find(p => p.id === value);
                          return (
                            <Chip
                              key={value}
                              label={permission?.name || value}
                              size="small"
                            />
                          );
                        })}
                      </Box>
                    )}
                    sx={{ borderRadius: 2 }}
                  >
                    {AVAILABLE_PERMISSIONS.map((permission) => (
                      <MenuItem key={permission.id} value={permission.id}>
                        <Checkbox
                          checked={userForm.permissions.indexOf(permission.id) > -1}
                        />
                        <ListItemText 
                          primary={permission.name}
                          secondary={permission.description}
                        />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={userForm.isActive}
                      onChange={(e) =>
                        setUserForm((prev) => ({
                          ...prev,
                          isActive: e.target.checked,
                        }))
                      }
                      color="primary"
                    />
                  }
                  label="Active User"
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            sx={{ borderRadius: 2 }}
          >
            {dialogMode === "add" ? "Create" : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
          severity={notification.severity}
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          {notification.message}
        </Alert>
      </Snackbar>

      {/* Loading Overlay */}
      {loading && companies.length > 0 && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "rgba(255, 255, 255, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <CircularProgress size={60} />
        </Box>
      )}
    </Box>
  );
};

export default CompanyLocationManager;
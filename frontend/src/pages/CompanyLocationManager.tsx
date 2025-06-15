import React, { useState, useEffect, useMemo } from "react";
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

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface User {
  id: string;
  name: string;
  email: string;
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
  postCode: string;
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
  postCode: string;
  phone: string;
  email?: string;
  website?: string;
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
    postCode: "",
    phone: "",
    email: "",
    website: "",
    isActive: true,
  });

  const [locationForm, setLocationForm] = useState({
    name: "",
    city: "",
    state: "",
    postCode: "",
    phone: "",
    email: "",
    manager: "",
    isActive: true,
  });

  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
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
      
      const response = await fetch('http://localhost:8000/company-overview/');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform the API response to match our interface
      const transformedCompanies: Company[] = data.map((apiCompany: any) => ({
        id: apiCompany.id,
        name: apiCompany.name,
        city: apiCompany.city,
        state: apiCompany.state,
        postCode: apiCompany.postCode,
        phone: apiCompany.phone,
        email: apiCompany.email,
        website: apiCompany.website,
        isActive: apiCompany.isActive,
        createdAt: new Date(apiCompany.createdAt),
        updatedAt: new Date(apiCompany.updatedAt),
        locations: apiCompany.locations.map((apiLocation: any) => ({
          id: apiLocation.id,
          name: apiLocation.name,
          city: apiLocation.city,
          state: apiLocation.state,
          postCode: apiLocation.postCode,
          phone: apiLocation.phone,
          email: apiLocation.email,
          isActive: apiLocation.isActive,
          manager: apiLocation.manager,
          createdAt: new Date(apiLocation.createdAt),
          updatedAt: new Date(apiLocation.updatedAt),
        })),
        users: apiCompany.users.map((apiUser: any) => ({
          id: apiUser.id,
          name: apiUser.name,
          email: apiUser.email,
          role: apiUser.role,
          permissions: apiUser.permissions || [],
          assignedLocations: apiUser.assignedLocations || [],
          isActive: apiUser.isActive,
          createdAt: new Date(apiUser.createdAt),
        })),
      }));
      
      setCompanies(transformedCompanies);
      
    } catch (err) {
      console.error('Error fetching company data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch company data');
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
          company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.locations.some(
            (location) =>
              location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              location.city.toLowerCase().includes(searchTerm.toLowerCase())
          ) ||
          company.users.some(
            (user) =>
              user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              user.email.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Apply role filter
    if (selectedRole) {
      filtered = filtered.filter((company) =>
        company.users.some((user) => user.role === selectedRole)
      );
    }

    // Apply active/inactive filter
    if (showInactiveOnly) {
      filtered = filtered.filter((company) => !company.isActive);
    }

    return filtered.sort((a, b) => a.name.localeCompare(b.name));
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
      postCode: "",
      phone: "",
      email: "",
      website: "",
      isActive: true,
    });

    setLocationForm({
      name: "",
      city: "",
      state: "",
      postCode: "",
      phone: "",
      email: "",
      manager: "",
      isActive: true,
    });

    setUserForm({
      name: "",
      email: "",
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
    if (!company) return [];

    return company.users.filter(
      (user) => user.assignedLocations.includes(locationId) && user.isActive
    );
  };

  // Get location name by ID
  const getLocationName = (companyId: string, locationId: string) => {
    const company = companies.find((c) => c.id === companyId);
    if (!company) return "Unknown Location";

    const location = company.locations.find((l) => l.id === locationId);
    return location ? location.name : "Unknown Location";
  };

  // Toggle functions
  const toggleCompanyExpansion = (companyId: string) => {
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

  // CRUD operations (these would need to be implemented with actual API calls)
  const handleSaveCompany = () => {
    if (dialogMode === "add") {
      const newCompany: Company = {
        id: generateId(),
        ...companyForm,
        locations: [],
        users: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setCompanies((prev) => [...prev, newCompany]);
      showNotification("Company added successfully", "success");
    } else if (dialogMode === "edit" && selectedCompany) {
      setCompanies((prev) =>
        prev.map((company) =>
          company.id === selectedCompany.id
            ? { ...company, ...companyForm, updatedAt: new Date() }
            : company
        )
      );
      showNotification("Company updated successfully", "success");
    }
    setDialogOpen(false);
    resetForms();
  };

  const handleSaveLocation = () => {
    if (!selectedCompany) return;

    if (dialogMode === "add") {
      const newLocation: Location = {
        id: generateId(),
        ...locationForm,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setCompanies((prev) =>
        prev.map((company) =>
          company.id === selectedCompany.id
            ? {
                ...company,
                locations: [...company.locations, newLocation],
                updatedAt: new Date(),
              }
            : company
        )
      );
      showNotification("Location added successfully", "success");
    } else if (dialogMode === "edit" && selectedLocation) {
      setCompanies((prev) =>
        prev.map((company) =>
          company.id === selectedCompany.id
            ? {
                ...company,
                locations: company.locations.map((location) =>
                  location.id === selectedLocation.id
                    ? { ...location, ...locationForm, updatedAt: new Date() }
                    : location
                ),
                updatedAt: new Date(),
              }
            : company
        )
      );
      showNotification("Location updated successfully", "success");
    }
    setDialogOpen(false);
    resetForms();
  };

  const handleSaveUser = () => {
    if (!selectedCompany) return;

    if (dialogMode === "add") {
      const newUser: User = {
        id: generateId(),
        ...userForm,
        createdAt: new Date(),
      };
      setCompanies((prev) =>
        prev.map((company) =>
          company.id === selectedCompany.id
            ? {
                ...company,
                users: [...company.users, newUser],
                updatedAt: new Date(),
              }
            : company
        )
      );
      showNotification("User added successfully", "success");
    } else if (dialogMode === "edit" && selectedUser) {
      setCompanies((prev) =>
        prev.map((company) =>
          company.id === selectedCompany.id
            ? {
                ...company,
                users: company.users.map((user) =>
                  user.id === selectedUser.id ? { ...user, ...userForm } : user
                ),
                updatedAt: new Date(),
              }
            : company
        )
      );
      showNotification("User updated successfully", "success");
    }
    setDialogOpen(false);
    resetForms();
  };

  // Handle dialog opening for different entities
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
          postCode: company.postCode,
          phone: company.phone,
          email: company.email || "",
          website: company.website || "",
          isActive: company.isActive,
        });
      } else if (type === "location" && location) {
        setLocationForm({
          name: location.name,
          city: location.city,
          state: location.state,
          postCode: location.postCode,
          phone: location.phone || "",
          email: location.email || "",
          manager: location.manager || "",
          isActive: location.isActive,
        });
      } else if (type === "user" && user) {
        setUserForm({
          name: user.name,
          email: user.email,
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

  // Handle menu actions
  const handleMenuAction = (action: string) => {
    setAnchorEl(null);
    
    if (action === "edit") {
      if (selectedItemType === "company") {
        const company = companies.find((c) => c.id === selectedItemId);
        if (company) {
          handleOpenDialog("edit", "company", company);
        }
      }
    } else if (action === "delete") {
      showNotification("Delete functionality not implemented yet", "info");
    }
  };

  // Show loading state
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="textSecondary">
          Loading company data...
        </Typography>
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={handleRefresh} startIcon={<RefreshIcon />}>
              Retry
            </Button>
          }
        >
          <Typography variant="h6">Error loading company data</Typography>
          <Typography variant="body2">{error}</Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Modern Header with Stats */}
      <Box sx={{ mb: 4 }}>
        {/* Title Section */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: 4,
            p: 4,
            mb: 3,
            color: "white",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              right: 0,
              width: "200px",
              height: "200px",
              background: "rgba(255,255,255,0.1)",
              borderRadius: "50%",
              transform: "translate(25%, -25%)",
            },
          }}
        >
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Typography variant="h3" sx={{ fontWeight: "bold", mb: 1 }}>
              Company & Location Manager
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Manage your organizations, locations, and team members
            </Typography>
          </Box>
        </Box>

        {/* Compact Stats Cards Grid */}
        <Grid container spacing={2} sx={{ justifyContent: "center" }}>
          {/* Total Companies Card */}
          <Grid item xs={6} sm={3}>
            <Card
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                borderRadius: 3,
                boxShadow: "0 8px 24px rgba(102, 126, 234, 0.15)",
                border: "1px solid rgba(255,255,255,0.1)",
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 12px 32px rgba(102, 126, 234, 0.25)",
                },
                height: 160,
              }}
            >
              <CardContent sx={{ p: 2.5, height: "100%" }}>
                <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                    <Typography variant="h3" sx={{ fontWeight: "900", fontSize: "2rem" }}>
                      {companies.length}
                    </Typography>
                    <CompanyIcon sx={{ fontSize: 32, opacity: 0.4 }} />
                  </Box>
                  <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: "600", mb: 1 }}>
                    Total Companies
                  </Typography>
                  <Box sx={{ height: 3, bgcolor: "rgba(255,255,255,0.3)", borderRadius: 1.5, mb: 1 }}>
                    <Box 
                      sx={{ 
                        height: "100%", 
                        bgcolor: "white", 
                        borderRadius: 1.5,
                        width: `${companies.length > 0 ? (companies.filter(c => c.isActive).length / companies.length) * 100 : 0}%`,
                        transition: "width 0.3s ease"
                      }} 
                    />
                  </Box>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    {companies.filter(c => c.isActive).length} Active • {companies.filter(c => !c.isActive).length} Inactive
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Total Locations Card */}
          <Grid item xs={6} sm={3}>
            <Card
              sx={{
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                color: "white",
                borderRadius: 3,
                boxShadow: "0 8px 24px rgba(240, 147, 251, 0.15)",
                border: "1px solid rgba(255,255,255,0.1)",
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 12px 32px rgba(240, 147, 251, 0.25)",
                },
                height: 160,
              }}
            >
              <CardContent sx={{ p: 2.5, height: "100%" }}>
                <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                    <Typography variant="h3" sx={{ fontWeight: "900", fontSize: "2rem" }}>
                      {companies.reduce((acc, company) => acc + company.locations.length, 0)}
                    </Typography>
                    <PlaceIcon sx={{ fontSize: 32, opacity: 0.4 }} />
                  </Box>
                  <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: "600", mb: 1 }}>
                    Total Locations
                  </Typography>
                  <Box sx={{ height: 3, bgcolor: "rgba(255,255,255,0.3)", borderRadius: 1.5, mb: 1 }}>
                    <Box 
                      sx={{ 
                        height: "100%", 
                        bgcolor: "white", 
                        borderRadius: 1.5,
                        width: `${companies.reduce((acc, company) => acc + company.locations.length, 0) > 0 ? (companies.reduce((acc, company) => acc + company.locations.filter(l => l.isActive).length, 0) / companies.reduce((acc, company) => acc + company.locations.length, 0)) * 100 : 0}%`,
                        transition: "width 0.3s ease"
                      }} 
                    />
                  </Box>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    {companies.reduce((acc, company) => acc + company.locations.filter(l => l.isActive).length, 0)} Active • {companies.reduce((acc, company) => acc + company.locations.filter(l => !l.isActive).length, 0)} Inactive
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Total Users Card */}
          <Grid item xs={6} sm={3}>
            <Card
              sx={{
                background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                color: "white",
                borderRadius: 3,
                boxShadow: "0 8px 24px rgba(79, 172, 254, 0.15)",
                border: "1px solid rgba(255,255,255,0.1)",
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 12px 32px rgba(79, 172, 254, 0.25)",
                },
                height: 160,
              }}
            >
              <CardContent sx={{ p: 2.5, height: "100%" }}>
                <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                    <Typography variant="h3" sx={{ fontWeight: "900", fontSize: "2rem" }}>
                      {companies.reduce((acc, company) => acc + company.users.length, 0)}
                    </Typography>
                    <PersonIcon sx={{ fontSize: 32, opacity: 0.4 }} />
                  </Box>
                  <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: "600", mb: 1 }}>
                    Total Users
                  </Typography>
                  <Box sx={{ height: 3, bgcolor: "rgba(255,255,255,0.3)", borderRadius: 1.5, mb: 1 }}>
                    <Box 
                      sx={{ 
                        height: "100%", 
                        bgcolor: "white", 
                        borderRadius: 1.5,
                        width: `${companies.reduce((acc, company) => acc + company.users.length, 0) > 0 ? (companies.reduce((acc, company) => acc + company.users.filter(u => u.isActive).length, 0) / companies.reduce((acc, company) => acc + company.users.length, 0)) * 100 : 0}%`,
                        transition: "width 0.3s ease"
                      }} 
                    />
                  </Box>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    {companies.reduce((acc, company) => acc + company.users.filter(u => u.isActive).length, 0)} Active • {companies.reduce((acc, company) => acc + company.users.filter(u => !u.isActive).length, 0)} Inactive
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Add Company Button */}
          <Grid item xs={6} sm={3}>
            <Card
              sx={{
                background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                color: "white",
                borderRadius: 3,
                boxShadow: "0 8px 24px rgba(67, 233, 123, 0.15)",
                border: "1px solid rgba(255,255,255,0.1)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 12px 32px rgba(67, 233, 123, 0.25)",
                },
                height: 160,
              }}
              onClick={() => handleOpenDialog("add", "company")}
            >
              <CardContent sx={{ p: 2.5, textAlign: "center", height: "100%" }}>
                <Box sx={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  justifyContent: "center", 
                  alignItems: "center",
                  height: "100%" 
                }}>
                  <AddIcon sx={{ fontSize: 36, mb: 1, opacity: 0.9 }} />
                  <Typography variant="h6" sx={{ fontWeight: "bold", mb: 0.5 }}>
                    ADD COMPANY
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Create new organization
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Modern Filters Section */}
      <Card 
        elevation={0} 
        sx={{ 
          mb: 4, 
          bgcolor: "white", 
          borderRadius: 4,
          border: "1px solid",
          borderColor: "grey.200",
          boxShadow: "0 10px 40px rgba(0,0,0,0.05)",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <FilterListIcon sx={{ color: "primary.main" }} />
            <Typography variant="h6" sx={{ fontWeight: "bold", color: "text.primary" }}>
              Filters & Search
            </Typography>
          </Box>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search companies, locations, users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: "action.active" }} />,
                }}
                sx={{
                  bgcolor: "grey.50",
                  borderRadius: 3,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    "&:hover fieldset": {
                      borderColor: "primary.main",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "primary.main",
                      borderWidth: 2,
                    },
                  },
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4} md={2}>
              <FormControl fullWidth>
                <InputLabel sx={{ fontWeight: "500" }}>Role</InputLabel>
                <Select
                  value={selectedRole}
                  label="Role"
                  onChange={(e) => setSelectedRole(e.target.value)}
                  sx={{ 
                    bgcolor: "grey.50", 
                    borderRadius: 3,
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderRadius: 3,
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "primary.main",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "primary.main",
                      borderWidth: 2,
                    },
                  }}
                >
                  <MenuItem value="">All Roles</MenuItem>
                  {USER_ROLES.map((role) => (
                    <MenuItem key={role.value} value={role.value}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            bgcolor: role.color,
                          }}
                        />
                        {role.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4} md={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showInactiveOnly}
                    onChange={(e) => setShowInactiveOnly(e.target.checked)}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: "primary.main",
                      },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                        backgroundColor: "primary.main",
                      },
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontWeight: "500" }}>
                    Inactive Only
                  </Typography>
                }
              />
            </Grid>

            <Grid item xs={12} sm={4} md={2}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                disabled={loading}
                fullWidth
                sx={{
                  borderRadius: 3,
                  py: 1.5,
                  fontWeight: "600",
                  borderColor: "primary.main",
                  color: "primary.main",
                  "&:hover": {
                    borderColor: "primary.dark",
                    bgcolor: "primary.50",
                  },
                }}
              >
                Refresh
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Companies Table */}
      {filteredCompanies.length === 0 ? (
        <Paper 
          sx={{ 
            p: 8, 
            textAlign: "center", 
            borderRadius: 4,
            background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
            border: "1px solid",
            borderColor: "grey.200",
            boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
          }}
        >
          <Box
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "50%",
              width: 120,
              height: 120,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px auto",
              boxShadow: "0 20px 40px rgba(102, 126, 234, 0.3)",
            }}
          >
            <BusinessIcon sx={{ fontSize: 64, color: "white" }} />
          </Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", color: "text.primary" }}>
            No companies found
          </Typography>
          <Typography variant="h6" color="textSecondary" sx={{ mb: 4, maxWidth: 400, mx: "auto" }}>
            {companies.length === 0 
              ? "Welcome! Start building your organization by adding your first company."
              : "No companies match your current filters. Try adjusting your search terms or filters."
            }
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog("add", "company")}
            sx={{ 
              borderRadius: 3, 
              py: 2, 
              px: 4,
              fontSize: "1.1rem",
              fontWeight: "bold",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              boxShadow: "0 10px 30px rgba(102, 126, 234, 0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)",
                boxShadow: "0 15px 40px rgba(102, 126, 234, 0.4)",
                transform: "translateY(-2px)",
              },
            }}
          >
            Add Your First Company
          </Button>
        </Paper>
      ) : (
        <TableContainer 
          component={Paper} 
          sx={{ 
            borderRadius: 4, 
            boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
            border: "1px solid",
            borderColor: "grey.200",
            overflow: "hidden",
          }}
        >
          <Table>
            <TableHead>
              <TableRow 
                sx={{ 
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}
              >
                <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: "1rem", py: 3 }}>
                  Company Details
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: "1rem", py: 3 }}>
                  Contact & Info
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: "1rem", py: 3 }}>
                  Locations
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: "1rem", py: 3 }}>
                  Users
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: "1rem", py: 3 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCompanies.map((company, index) => (
                <React.Fragment key={company.id}>
                  <TableRow
                    sx={{
                      backgroundColor: index % 2 === 0 ? "white" : "grey.50",
                      "&:hover": { 
                        backgroundColor: "primary.50",
                        transform: "scale(1.002)",
                        transition: "all 0.2s ease",
                      },
                      cursor: "pointer",
                    }}
                  >
                    {/* Company Details */}
                    <TableCell sx={{ py: 3 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <IconButton
                          size="small"
                          onClick={() => toggleCompanyExpansion(company.id)}
                          sx={{ 
                            color: "primary.main",
                            bgcolor: "primary.50",
                            "&:hover": { bgcolor: "primary.100" },
                          }}
                        >
                          {expandedCompanies.has(company.id) ? (
                            <ExpandLessIcon />
                          ) : (
                            <ExpandMoreIcon />
                          )}
                        </IconButton>
                        <Avatar 
                          sx={{ 
                            bgcolor: "primary.main", 
                            width: 48, 
                            height: 48,
                            boxShadow: "0 4px 14px rgba(102, 126, 234, 0.3)",
                          }}
                        >
                          <CompanyIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 0.5 }}>
                            {company.name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                            {company.city}, {company.state} {company.postCode}
                          </Typography>
                          <Chip
                            label={company.isActive ? "Active" : "Inactive"}
                            size="small"
                            color={company.isActive ? "success" : "default"}
                            sx={{ 
                              fontWeight: "600",
                              ...(company.isActive && {
                                bgcolor: "success.main",
                                color: "white",
                              }),
                            }}
                          />
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Contact & Info */}
                    <TableCell sx={{ py: 3 }}>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Avatar sx={{ bgcolor: "grey.100", width: 24, height: 24 }}>
                            <PhoneIcon sx={{ fontSize: 14, color: "grey.600" }} />
                          </Avatar>
                          <Typography variant="body2">{company.phone}</Typography>
                        </Box>
                        {company.email && (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Avatar sx={{ bgcolor: "grey.100", width: 24, height: 24 }}>
                              <EmailIcon sx={{ fontSize: 14, color: "grey.600" }} />
                            </Avatar>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                              {company.email}
                            </Typography>
                          </Box>
                        )}
                        {company.website && (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Avatar sx={{ bgcolor: "grey.100", width: 24, height: 24 }}>
                              <WebIcon sx={{ fontSize: 14, color: "grey.600" }} />
                            </Avatar>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                              {company.website}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </TableCell>

                    {/* Locations */}
                    <TableCell sx={{ py: 3 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Badge
                          badgeContent={company.locations.length}
                          color="primary"
                          sx={{
                            "& .MuiBadge-badge": {
                              right: -3,
                              top: 13,
                              fontWeight: "bold",
                            },
                          }}
                        >
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<PlaceIcon />}
                            onClick={() => handleOpenDialog("add", "location", company)}
                            sx={{ 
                              mr: 1,
                              borderRadius: 2,
                              borderColor: "primary.main",
                              color: "primary.main",
                              "&:hover": {
                                borderColor: "primary.dark",
                                bgcolor: "primary.50",
                              },
                            }}
                          >
                            {company.locations.length} location{company.locations.length !== 1 ? 's' : ''}
                          </Button>
                        </Badge>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog("add", "location", company)}
                          sx={{ 
                            color: "primary.main",
                            bgcolor: "primary.50",
                            "&:hover": { bgcolor: "primary.100" },
                          }}
                        >
                          <AddIcon />
                        </IconButton>
                      </Box>
                    </TableCell>

                    {/* Users */}
                    <TableCell sx={{ py: 3 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Badge
                          badgeContent={company.users.length}
                          color="secondary"
                          sx={{
                            "& .MuiBadge-badge": {
                              right: -3,
                              top: 13,
                              fontWeight: "bold",
                            },
                          }}
                        >
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<PersonIcon />}
                            onClick={() => handleOpenDialog("add", "user", company)}
                            sx={{ 
                              mr: 1,
                              borderRadius: 2,
                              borderColor: "secondary.main",
                              color: "secondary.main",
                              "&:hover": {
                                borderColor: "secondary.dark",
                                bgcolor: "secondary.50",
                              },
                            }}
                          >
                            {company.users.length} user{company.users.length !== 1 ? 's' : ''}
                          </Button>
                        </Badge>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog("add", "user", company)}
                          sx={{ 
                            color: "secondary.main",
                            bgcolor: "secondary.50",
                            "&:hover": { bgcolor: "secondary.100" },
                          }}
                        >
                          <AddIcon />
                        </IconButton>
                      </Box>
                    </TableCell>

                    {/* Actions */}
                    <TableCell sx={{ py: 3 }}>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog("edit", "company", company)}
                          sx={{ 
                            color: "primary.main",
                            bgcolor: "primary.50",
                            "&:hover": { bgcolor: "primary.100" },
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            setAnchorEl(e.currentTarget);
                            setSelectedItemId(company.id);
                            setSelectedItemType("company");
                          }}
                          sx={{ 
                            color: "grey.600",
                            bgcolor: "grey.100",
                            "&:hover": { bgcolor: "grey.200" },
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>

                  {/* Expanded Row Content */}
                  <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                      <Collapse in={expandedCompanies.has(company.id)} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 3, bgcolor: "grey.50", borderRadius: 2, p: 3 }}>
                          {/* Locations Section */}
                          {company.locations.length > 0 && (
                            <Box sx={{ mb: 4 }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                                <PlaceIcon sx={{ color: "primary.main" }} />
                                <Typography variant="h6" sx={{ color: "primary.main", fontWeight: "bold" }}>
                                  Locations ({company.locations.length})
                                </Typography>
                              </Box>
                              <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
                                <Table size="small">
                                  <TableHead>
                                    <TableRow sx={{ bgcolor: "primary.main" }}>
                                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>Location Details</TableCell>
                                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>Address</TableCell>
                                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>Contact</TableCell>
                                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>Manager</TableCell>
                                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>Assigned Users</TableCell>
                                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>Actions</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {company.locations.map((location, locationIndex) => (
                                      <TableRow
                                        key={location.id}
                                        sx={{
                                          backgroundColor: locationIndex % 2 === 0 ? "white" : "grey.50",
                                          "&:hover": { backgroundColor: "primary.50" },
                                        }}
                                      >
                                        <TableCell>
                                          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                            <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32 }}>
                                              <PlaceIcon fontSize="small" />
                                            </Avatar>
                                            <Box>
                                              <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                                                {location.name}
                                              </Typography>
                                              <Chip
                                                label={location.isActive ? "Active" : "Inactive"}
                                                size="small"
                                                color={location.isActive ? "success" : "default"}
                                                sx={{ mt: 0.5 }}
                                              />
                                            </Box>
                                          </Box>
                                        </TableCell>
                                        <TableCell>
                                          <Typography variant="body2">
                                            {location.city}, {location.state}
                                          </Typography>
                                          <Typography variant="body2" color="textSecondary">
                                            {location.postCode}
                                          </Typography>
                                        </TableCell>
                                        <TableCell>
                                          {location.phone && (
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                                              <PhoneIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                                              <Typography variant="body2">{location.phone}</Typography>
                                            </Box>
                                          )}
                                          {location.email && (
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                              <EmailIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                                              <Typography variant="body2">{location.email}</Typography>
                                            </Box>
                                          )}
                                        </TableCell>
                                        <TableCell>
                                          {location.manager ? (
                                            <Chip
                                              label={company.users.find(u => u.id === location.manager)?.name || "Unknown Manager"}
                                              size="small"
                                              variant="outlined"
                                              color="primary"
                                            />
                                          ) : (
                                            <Typography variant="body2" color="textSecondary">
                                              No manager assigned
                                            </Typography>
                                          )}
                                        </TableCell>
                                        <TableCell>
                                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                            {getUsersForLocation(company.id, location.id).map((user) => (
                                              <Chip
                                                key={user.id}
                                                avatar={
                                                  <Avatar sx={{ bgcolor: getRoleColor(user.role), width: 24, height: 24 }}>
                                                    {user.name.charAt(0)}
                                                  </Avatar>
                                                }
                                                label={user.name}
                                                size="small"
                                                variant="outlined"
                                              />
                                            ))}
                                            {getUsersForLocation(company.id, location.id).length === 0 && (
                                              <Typography variant="body2" color="textSecondary">
                                                No users assigned
                                              </Typography>
                                            )}
                                          </Box>
                                        </TableCell>
                                        <TableCell>
                                          <Box sx={{ display: "flex", gap: 0.5 }}>
                                            <IconButton
                                              size="small"
                                              onClick={() => handleOpenDialog("edit", "location", company, location)}
                                              color="primary"
                                            >
                                              <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                              size="small"
                                              color="error"
                                            >
                                              <DeleteIcon fontSize="small" />
                                            </IconButton>
                                          </Box>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Box>
                          )}

                          {/* Users Section */}
                          {company.users.length > 0 && (
                            <Box>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                                <GroupIcon sx={{ color: "primary.main" }} />
                                <Typography variant="h6" sx={{ color: "primary.main", fontWeight: "bold" }}>
                                  Company Users ({company.users.length})
                                </Typography>
                              </Box>
                              <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
                                <Table size="small">
                                  <TableHead>
                                    <TableRow sx={{ bgcolor: "primary.main" }}>
                                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>User Details</TableCell>
                                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>Role & Status</TableCell>
                                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>Assigned Locations</TableCell>
                                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>Permissions</TableCell>
                                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>Actions</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {company.users.map((user, userIndex) => (
                                      <TableRow
                                        key={user.id}
                                        sx={{
                                          backgroundColor: userIndex % 2 === 0 ? "white" : "grey.50",
                                          "&:hover": { backgroundColor: "primary.50" },
                                        }}
                                      >
                                        <TableCell>
                                          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                            <Avatar
                                              sx={{
                                                bgcolor: getRoleColor(user.role),
                                                width: 40,
                                                height: 40,
                                                fontWeight: "bold",
                                              }}
                                            >
                                              {user.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase()}
                                            </Avatar>
                                            <Box>
                                              <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                                                {user.name}
                                              </Typography>
                                              <Typography variant="body2" color="textSecondary">
                                                {user.email}
                                              </Typography>
                                              <Typography variant="caption" color="textSecondary">
                                                Last login: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                                              </Typography>
                                            </Box>
                                          </Box>
                                        </TableCell>
                                        <TableCell>
                                          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                                            <Chip
                                              label={USER_ROLES.find(r => r.value === user.role)?.label || user.role}
                                              size="small"
                                              sx={{
                                                bgcolor: getRoleColor(user.role),
                                                color: "white",
                                                fontWeight: "bold",
                                              }}
                                            />
                                            <Chip
                                              label={user.isActive ? "Active" : "Inactive"}
                                              size="small"
                                              color={user.isActive ? "success" : "default"}
                                            />
                                          </Box>
                                        </TableCell>
                                        <TableCell>
                                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                            {user.assignedLocations.map((locationId) => (
                                              <Chip
                                                key={locationId}
                                                label={getLocationName(company.id, locationId)}
                                                size="small"
                                                variant="outlined"
                                                color="primary"
                                                icon={<PlaceIcon />}
                                              />
                                            ))}
                                            {user.assignedLocations.length === 0 && (
                                              <Typography variant="body2" color="textSecondary">
                                                No locations assigned
                                              </Typography>
                                            )}
                                          </Box>
                                        </TableCell>
                                        <TableCell>
                                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                            {user.permissions.slice(0, 2).map((permission) => (
                                              <Chip
                                                key={permission}
                                                label={
                                                  AVAILABLE_PERMISSIONS.find(p => p.id === permission)?.name || permission
                                                }
                                                size="small"
                                                variant="outlined"
                                                color="secondary"
                                              />
                                            ))}
                                            {user.permissions.length > 2 && (
                                              <Chip
                                                label={`+${user.permissions.length - 2} more`}
                                                size="small"
                                                variant="outlined"
                                                color="secondary"
                                              />
                                            )}
                                            {user.permissions.length === 0 && (
                                              <Typography variant="body2" color="textSecondary">
                                                No permissions assigned
                                              </Typography>
                                            )}
                                          </Box>
                                        </TableCell>
                                        <TableCell>
                                          <Box sx={{ display: "flex", gap: 0.5 }}>
                                            <IconButton
                                              size="small"
                                              onClick={() => handleOpenDialog("edit", "user", company, undefined, user)}
                                              color="primary"
                                            >
                                              <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                              size="small"
                                              color="error"
                                            >
                                              <DeleteIcon fontSize="small" />
                                            </IconButton>
                                          </Box>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Box>
                          )}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => handleMenuAction("edit")}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Edit
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction("delete")}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6">
              {dialogMode === "add" ? "Add" : "Edit"} {entityType}
            </Typography>
            <IconButton onClick={() => setDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {entityType === "company" && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Company Name"
                  value={companyForm.name}
                  onChange={(e) =>
                    setCompanyForm({ ...companyForm, name: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  value={companyForm.city}
                  onChange={(e) =>
                    setCompanyForm({ ...companyForm, city: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="State"
                  value={companyForm.state}
                  onChange={(e) =>
                    setCompanyForm({ ...companyForm, state: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Post Code"
                  value={companyForm.postCode}
                  onChange={(e) =>
                    setCompanyForm({ ...companyForm, postCode: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={companyForm.phone}
                  onChange={(e) =>
                    setCompanyForm({ ...companyForm, phone: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={companyForm.email}
                  onChange={(e) =>
                    setCompanyForm({ ...companyForm, email: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Website"
                  value={companyForm.website}
                  onChange={(e) =>
                    setCompanyForm({ ...companyForm, website: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={companyForm.isActive}
                      onChange={(e) =>
                        setCompanyForm({ ...companyForm, isActive: e.target.checked })
                      }
                    />
                  }
                  label="Active"
                />
              </Grid>
            </Grid>
          )}

          {entityType === "location" && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location Name"
                  value={locationForm.name}
                  onChange={(e) =>
                    setLocationForm({ ...locationForm, name: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Manager</InputLabel>
                  <Select
                    value={locationForm.manager}
                    label="Manager"
                    onChange={(e) =>
                      setLocationForm({ ...locationForm, manager: e.target.value })
                    }
                  >
                    <MenuItem value="">No Manager</MenuItem>
                    {selectedCompany?.users.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  value={locationForm.city}
                  onChange={(e) =>
                    setLocationForm({ ...locationForm, city: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="State"
                  value={locationForm.state}
                  onChange={(e) =>
                    setLocationForm({ ...locationForm, state: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Post Code"
                  value={locationForm.postCode}
                  onChange={(e) =>
                    setLocationForm({ ...locationForm, postCode: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={locationForm.phone}
                  onChange={(e) =>
                    setLocationForm({ ...locationForm, phone: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={locationForm.email}
                  onChange={(e) =>
                    setLocationForm({ ...locationForm, email: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={locationForm.isActive}
                      onChange={(e) =>
                        setLocationForm({ ...locationForm, isActive: e.target.checked })
                      }
                    />
                  }
                  label="Active"
                />
              </Grid>
            </Grid>
          )}

          {entityType === "user" && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name"
                  value={userForm.name}
                  onChange={(e) =>
                    setUserForm({ ...userForm, name: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={userForm.email}
                  onChange={(e) =>
                    setUserForm({ ...userForm, email: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={userForm.role}
                    label="Role"
                    onChange={(e) =>
                      setUserForm({ ...userForm, role: e.target.value })
                    }
                    required
                  >
                    {USER_ROLES.map((role) => (
                      <MenuItem key={role.value} value={role.value}>
                        {role.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Assigned Locations</InputLabel>
                  <Select
                    multiple
                    value={userForm.assignedLocations}
                    label="Assigned Locations"
                    onChange={(e) =>
                      setUserForm({
                        ...userForm,
                        assignedLocations: typeof e.target.value === 'string' 
                          ? e.target.value.split(',') 
                          : e.target.value,
                      })
                    }
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip 
                            key={value} 
                            label={getLocationName(selectedCompany?.id || '', value)} 
                            size="small" 
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {selectedCompany?.locations.map((location) => (
                      <MenuItem key={location.id} value={location.id}>
                        <Checkbox checked={userForm.assignedLocations.indexOf(location.id) > -1} />
                        <ListItemText primary={location.name} />
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
                    label="Permissions"
                    onChange={(e) =>
                      setUserForm({
                        ...userForm,
                        permissions: typeof e.target.value === 'string' 
                          ? e.target.value.split(',') 
                          : e.target.value,
                      })
                    }
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip 
                            key={value} 
                            label={AVAILABLE_PERMISSIONS.find(p => p.id === value)?.name || value} 
                            size="small" 
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {AVAILABLE_PERMISSIONS.map((permission) => (
                      <MenuItem key={permission.id} value={permission.id}>
                        <Checkbox checked={userForm.permissions.indexOf(permission.id) > -1} />
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
                        setUserForm({ ...userForm, isActive: e.target.checked })
                      }
                    />
                  }
                  label="Active"
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (entityType === "company") handleSaveCompany();
              else if (entityType === "location") handleSaveLocation();
              else if (entityType === "user") handleSaveUser();
            }}
            startIcon={<SaveIcon />}
          >
            {dialogMode === "add" ? "Add" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CompanyLocationManager;
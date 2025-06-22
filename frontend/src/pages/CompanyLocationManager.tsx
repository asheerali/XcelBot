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
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import axios from "axios";

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

// Import API base URL
import { API_URL_Local } from "../constants";

// API endpoints - Using the working endpoints without /api/ prefix
const COMPANY_OVERVIEW_API_URL = `${API_URL_Local}/company-overview/`;
const COMPANY_API_URL = `${API_URL_Local}/companies/`;
const LOCATION_API_URL = `${API_URL_Local}/stores/`;
const USER_API_URL = `${API_URL_Local}/users/`;

// Interface definitions based on new API structure
interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface AssignedLocation {
  location_id: number;
  company_id: number;
  location_name: string;
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: string;
  permissions: string[];
  assignedLocations: AssignedLocation[];
  isActive: boolean;
  createdAt: Date;
}

interface Location {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  postcode: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  manager?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Company {
  id: number;
  name: string;
  address: string;
  state: string;
  postcode: string;
  phone: string;
  email?: string;
  website?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  locations: Location[];
  users: User[];
}

type DialogMode = "add" | "edit" | "view" | null;
type EntityType = "company" | "location" | "user";

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

  { value: "admin", label: "Admin", color: "#9c27b0", bgColor: "#f3e5f5" },
  { value: "manager", label: "Manager", color: "#2196f3", bgColor: "#e3f2fd" },
  { value: "user", label: "User", color: "#4caf50", bgColor: "#e8f5e8" },
  { value: "trial", label: "Trial", color: "#ff9800", bgColor: "#fff3e0" },

];

const CompanyLocationManager: React.FC = () => {
  const theme = useTheme();

  // State for companies and locations
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [expandedCompanies, setExpandedCompanies] = useState<Set<number>>(new Set());
  const [expandedLocations, setExpandedLocations] = useState<Set<number>>(new Set());

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
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form states
  const [companyForm, setCompanyForm] = useState({
    name: "",
    address: "",
    state: "",
    postcode: "",
    phone: "",
    email: "",
    website: "",
    isActive: true,
  });

  const [locationForm, setLocationForm] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    postcode: "",
    phone: "",
    email: "",
    company_id: 0,
    isActive: true,
  });

  const [userForm, setUserForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "",
    permissions: [] as string[],
    assignedLocations: [] as AssignedLocation[],
    company_id: 0,
    isActive: true,
  });

  // UI states
  const [searchTerm, setSearchTerm] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItemId, setSelectedItemId] = useState<number>(0);
  const [selectedItemType, setSelectedItemType] = useState<EntityType>("company");

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

  // API Functions
  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(COMPANY_OVERVIEW_API_URL);
      
      if (response.status === 200) {
        setCompanies(response.data);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
    } catch (err) {
      console.error('Error fetching company data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch company data');
    } finally {
      setLoading(false);
    }
  };

  const createCompany = async (companyData: any) => {
    try {
      setLoading(true);
      console.log('🏢 Creating Company - Data being sent to backend:', companyData);
      
      const response = await axios.post(COMPANY_API_URL, companyData);
      
      if (response.status === 200 || response.status === 201) {
        console.log('✅ Company created successfully - Response:', response.data);
        await fetchCompanyData(); // Refresh data
        showNotification("Company created successfully", "success");
        return response.data;
      } else {
        throw new Error(`Failed to create company: ${response.status}`);
      }
    } catch (err) {
      console.error('❌ Error creating company:', err);
      showNotification(err instanceof Error ? err.message : 'Failed to create company', "error");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCompany = async (company_id: number, companyData: any) => {
    try {
      setLoading(true);
      console.log('🏢 Updating Company - ID:', company_id, 'Data being sent to backend:', companyData);
      
      const response = await axios.put(`${COMPANY_API_URL}${company_id}/`, companyData);
      
      if (response.status === 200) {
        console.log('✅ Company updated successfully - Response:', response.data);
        await fetchCompanyData(); // Refresh data
        showNotification("Company updated successfully", "success");
        return response.data;
      } else {
        throw new Error(`Failed to update company: ${response.status}`);
      }
    } catch (err) {
      console.error('❌ Error updating company:', err);
      showNotification(err instanceof Error ? err.message : 'Failed to update company', "error");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCompany = async (company_id: number) => {
    try {
      setLoading(true);
      console.log('🗑️ Deleting Company - ID being sent to backend:', company_id);
      
      const response = await axios.delete(`${COMPANY_API_URL}${company_id}/`);
      
      if (response.status === 200 || response.status === 204) {
        console.log('✅ Company deleted successfully');
        await fetchCompanyData(); // Refresh data
        showNotification("Company deleted successfully", "success");
      } else {
        throw new Error(`Failed to delete company: ${response.status}`);
      }
    } catch (err) {
      console.error('❌ Error deleting company:', err);
      showNotification(err instanceof Error ? err.message : 'Failed to delete company', "error");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createLocation = async (locationData: any) => {
    try {
      setLoading(true);
      console.log('📍 Creating Location - Data being sent to backend:', locationData);
      
      const response = await axios.post(LOCATION_API_URL, locationData);
      
      if (response.status === 200 || response.status === 201) {
        console.log('✅ Location created successfully - Response:', response.data);
        await fetchCompanyData(); // Refresh data
        showNotification("Location created successfully", "success");
        return response.data;
      } else {
        throw new Error(`Failed to create location: ${response.status}`);
      }
    } catch (err) {
      console.error('❌ Error creating location:', err);
      showNotification(err instanceof Error ? err.message : 'Failed to create location', "error");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateLocation = async (locationId: number, locationData: any) => {
    try {
      setLoading(true);
      console.log('📍 Updating Location - ID:', locationId, 'Data being sent to backend:', locationData);
      
      const response = await axios.put(`${LOCATION_API_URL}${locationId}/`, locationData);
      
      if (response.status === 200) {
        console.log('✅ Location updated successfully - Response:', response.data);
        await fetchCompanyData(); // Refresh data
        showNotification("Location updated successfully", "success");
        return response.data;
      } else {
        throw new Error(`Failed to update location: ${response.status}`);
      }
    } catch (err) {
      console.error('❌ Error updating location:', err);
      showNotification(err instanceof Error ? err.message : 'Failed to update location', "error");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteLocation = async (locationId: number) => {
    try {
      setLoading(true);
      console.log('🗑️ Deleting Location - ID being sent to backend:', locationId);
      
      const response = await axios.delete(`${LOCATION_API_URL}${locationId}/`);
      
      if (response.status === 200 || response.status === 204) {
        console.log('✅ Location deleted successfully');
        await fetchCompanyData(); // Refresh data
        showNotification("Location deleted successfully", "success");
      } else {
        throw new Error(`Failed to delete location: ${response.status}`);
      }
    } catch (err) {
      console.error('❌ Error deleting location:', err);
      showNotification(err instanceof Error ? err.message : 'Failed to delete location', "error");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: any) => {
    try {
      setLoading(true);
      console.log('👤 Creating User - Data being sent to backend:', userData);
      
      const response = await axios.post(USER_API_URL, userData);
      
      if (response.status === 200 || response.status === 201) {
        console.log('✅ User created successfully - Response:', response.data);
        await fetchCompanyData(); // Refresh data
        showNotification("User created successfully", "success");
        return response.data;
      } else {
        throw new Error(`Failed to create user: ${response.status}`);
      }
    } catch (err) {
      console.error('❌ Error creating user:', err);
      showNotification(err instanceof Error ? err.message : 'Failed to create user', "error");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userId: number, userData: any) => {
    try {
      setLoading(true);
      console.log('👤 Updating User - ID:', userId, 'Data being sent to backend:', userData);
      
      const response = await axios.put(`${USER_API_URL}${userId}/`, userData);
      
      if (response.status === 200) {
        console.log('✅ User updated successfully - Response:', response.data);
        await fetchCompanyData(); // Refresh data
        showNotification("User updated successfully", "success");
        return response.data;
      } else {
        throw new Error(`Failed to update user: ${response.status}`);
      }
    } catch (err) {
      console.error('❌ Error updating user:', err);
      showNotification(err instanceof Error ? err.message : 'Failed to update user', "error");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: number) => {
    try {
      setLoading(true);
      console.log('🗑️ Deleting User - ID being sent to backend:', userId);
      
      const response = await axios.delete(`${USER_API_URL}${userId}/`);
      
      if (response.status === 200 || response.status === 204) {
        console.log('✅ User deleted successfully');
        await fetchCompanyData(); // Refresh data
        showNotification("User deleted successfully", "success");
      } else {
        throw new Error(`Failed to delete user: ${response.status}`);
      }
    } catch (err) {
      console.error('❌ Error deleting user:', err);
      showNotification(err instanceof Error ? err.message : 'Failed to delete user', "error");
      throw err;
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
    console.log('🔄 User requested data refresh');
    fetchCompanyData();
  };

  // Filter companies based on search and filters
  const filteredAndSortedCompanies = useMemo(() => {
    let filtered = companies;

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (company) =>
          company.name.toLowerCase().includes(searchLower) ||
          company.email?.toLowerCase().includes(searchLower) ||
          company.address.toLowerCase().includes(searchLower) ||
          company.locations.some(
            (location) =>
              location.name.toLowerCase().includes(searchLower) ||
              location.city.toLowerCase().includes(searchLower) ||
              location.address.toLowerCase().includes(searchLower)
          ) ||
          company.users.some(
            (user) =>
              user.first_name.toLowerCase().includes(searchLower) ||
              user.last_name.toLowerCase().includes(searchLower) ||
              user.email.toLowerCase().includes(searchLower)
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

  const resetForms = () => {
    setCompanyForm({
      name: "",
      address: "",
      state: "",
      postcode: "",
      phone: "",
      email: "",
      website: "",
      isActive: true,
    });

    setLocationForm({
      name: "",
      address: "",
      city: "",
      state: "",
      postcode: "",
      phone: "",
      email: "",
      company_id: 0,
      isActive: true,
    });

    setUserForm({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      role: "",
      permissions: [],
      assignedLocations: [],
      company_id: 0,
      isActive: true,
    });
  };

  // Get role color
  const getRoleColor = (role: string) => {
    const roleConfig = USER_ROLES.find((r) => r.value === role);
    return roleConfig?.color || "#9e9e9e";
  };

  // Get users assigned to a specific location
  const getUsersForLocation = (company_id: number, locationId: number) => {
    const company = companies.find((c) => c.id === company_id);
    if (!company) return [];

    return company.users.filter(
      (user) => 
        user.assignedLocations.some(al => al.location_id === locationId) && 
        user.isActive
    );
  };

  // Get location name by ID
  const getLocationName = (company_id: number, locationId: number) => {
    const company = companies.find((c) => c.id === company_id);
    if (!company) return "Unknown Location";

    const location = company.locations.find((l) => l.id === locationId);
    return location ? location.name : "Unknown Location";
  };

  // Get user name by ID
  const getUserName = (company_id: number, userId: number) => {
    const company = companies.find((c) => c.id === company_id);
    if (!company) return "Unknown User";

    const user = company.users.find((u) => u.id === userId);
    return user ? `${user.first_name} ${user.last_name}`.trim() : "Unknown User";
  };

  // Toggle functions
  const toggleCompanyExpansion = (company_id: number) => {
    setExpandedCompanies((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(company_id)) {
        newSet.delete(company_id);
      } else {
        newSet.add(company_id);
      }
      return newSet;
    });
  };

  const toggleLocationExpansion = (locationId: number) => {
    setExpandedLocations((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(locationId)) {
        newSet.delete(locationId);
      } else {
        newSet.add(locationId);
      }
      return newSet;
    });
  };

  // Company CRUD operations
  const handleAddCompany = () => {
    setDialogMode("add");
    setEntityType("company");
    resetForms();
    setDialogOpen(true);
  };

  const handleEditCompany = (company: Company) => {
    setDialogMode("edit");
    setEntityType("company");
    setSelectedCompany(company);
    setCompanyForm({
      name: company.name,
      address: company.address,
      state: company.state,
      postcode: company.postcode,
      phone: company.phone,
      email: company.email || "",
      website: company.website || "",
      isActive: company.isActive,
    });
    setDialogOpen(true);
  };

  const handleDeleteCompany = async (company_id: number) => {
    const company = companies.find((c) => c.id === company_id);
    if (
      company &&
      window.confirm(
        `Are you sure you want to delete "${company.name}"? This will also delete all associated locations and users.`
      )
    ) {
      console.log('🗑️ User confirmed deletion of Company:', company.name, '(ID:', company_id, ')');
      await deleteCompany(company_id);
    }
  };

  const handleSaveCompany = async () => {
    if (
      !companyForm.name.trim() ||
      !companyForm.address.trim() ||
      !companyForm.state.trim() ||
      !companyForm.postcode.trim() ||
      !companyForm.phone.trim()
    ) {
      showNotification("All required fields must be filled", "error");
      return;
    }

    console.log('📝 Preparing Company Data for:', dialogMode === "add" ? "CREATE" : "UPDATE");
    console.log('📋 Company Form Data:', companyForm);

    try {
      if (dialogMode === "add") {
        await createCompany(companyForm);
      } else if (dialogMode === "edit" && selectedCompany) {
        await updateCompany(selectedCompany.id, companyForm);
      }
      
      setDialogOpen(false);
      resetForms();
    } catch (error) {
      // Error handling is done in the API functions
    }
  };

  // Location CRUD operations
  const handleAddLocation = (company_id: number) => {
    setDialogMode("add");
    setEntityType("location");
    setSelectedCompany(companies.find((c) => c.id === company_id) || null);
    setLocationForm({ 
      name: "",
      address: "",
      city: "",
      state: "",
      postcode: "",
      phone: "",
      email: "",
      company_id: company_id,
      isActive: true,
    });
    setDialogOpen(true);
  };

  const handleEditLocation = (company_id: number, location: Location) => {
    setDialogMode("edit");
    setEntityType("location");
    setSelectedCompany(companies.find((c) => c.id === company_id) || null);
    setSelectedLocation(location);
    setLocationForm({
      name: location.name,
      address: location.address,
      city: location.city,
      state: location.state,
      postcode: location.postcode,
      phone: location.phone || "",
      email: location.email || "",
      company_id: company_id,
      isActive: location.isActive,
    });
    setDialogOpen(true);
  };

  const handleDeleteLocation = async (locationId: number) => {
    const location = companies
      .flatMap(c => c.locations)
      .find(l => l.id === locationId);
      
    if (
      location &&
      window.confirm(`Are you sure you want to delete location "${location.name}"?`)
    ) {
      await deleteLocation(locationId);
    }
  };

  const handleSaveLocation = async () => {
    if (
      !locationForm.name.trim() ||
      !locationForm.address.trim() ||
      !locationForm.city.trim() ||
      !locationForm.state.trim() ||
      !locationForm.postcode.trim() ||
      !selectedCompany
    ) {
      showNotification("All required fields must be filled", "error");
      return;
    }

    console.log('📝 Preparing Location Data for:', dialogMode === "add" ? "CREATE" : "UPDATE");
    console.log('📋 Location Form Data:', locationForm);
    console.log('🏢 Associated Company:', selectedCompany?.name, '(ID:', locationForm.company_id, ')');

    try {
      if (dialogMode === "add") {
        await createLocation(locationForm);
      } else if (dialogMode === "edit" && selectedLocation) {
        await updateLocation(selectedLocation.id, locationForm);
      }
      
      setDialogOpen(false);
      resetForms();
    } catch (error) {
      // Error handling is done in the API functions
    }
  };

  // User CRUD operations
  const handleAddUser = (company_id: number) => {
    setDialogMode("add");
    setEntityType("user");
    setSelectedCompany(companies.find((c) => c.id === company_id) || null);
    setUserForm({ 
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      role: "",
      permissions: [],
      assignedLocations: [],
      company_id: company_id,
      isActive: true,
    });
    setDialogOpen(true);
  };

  const handleEditUser = (company_id: number, user: User) => {
    setDialogMode("edit");
    setEntityType("user");
    setSelectedCompany(companies.find((c) => c.id === company_id) || null);
    setSelectedUser(user);
    setUserForm({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
      permissions: user.permissions,
      assignedLocations: user.assignedLocations,
      company_id: company_id,
      isActive: user.isActive,
    });
    setDialogOpen(true);
  };

  const handleDeleteUser = async (userId: number) => {
    const user = companies
      .flatMap(c => c.users)
      .find(u => u.id === userId);
      
    if (
      user &&
      window.confirm(`Are you sure you want to delete user "${user.first_name} ${user.last_name}"?`)
    ) {
      await deleteUser(userId);
    }
  };

  const handleSaveUser = async () => {
    if (
      !userForm.first_name.trim() ||
      !userForm.last_name.trim() ||
      !userForm.email.trim() ||
      !userForm.role.trim() ||
      !selectedCompany
    ) {
      showNotification("First name, last name, email, and role are required", "error");
      return;
    }

    console.log('📝 Preparing User Data for:', dialogMode === "add" ? "CREATE" : "UPDATE");
    console.log('📋 User Form Data:', userForm);
    console.log('🏢 Associated Company:', selectedCompany?.name, '(ID:', selectedCompany?.id, ')');
    console.log('📍 Assigned Locations:', userForm.assignedLocations);
    console.log('🔐 Permissions:', userForm.permissions);

    try {
      if (dialogMode === "add") {
        await createUser(userForm);
      } else if (dialogMode === "edit" && selectedUser) {
        await updateUser(selectedUser.id, userForm);
      }
      
      setDialogOpen(false);
      resetForms();
    } catch (error) {
      // Error handling is done in the API functions
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    setUserForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((p) => p !== permissionId)
        : [...prev.permissions, permissionId],
    }));
  };

  const handleLocationAssignmentToggle = (locationId: number, locationName: string) => {
    const assignedLocation = {
      location_id: locationId,
      company_id: selectedCompany?.id || 0,
      location_name: locationName,
    };

    setUserForm((prev) => ({
      ...prev,
      assignedLocations: prev.assignedLocations.some(al => al.location_id === locationId)
        ? prev.assignedLocations.filter(al => al.location_id !== locationId)
        : [...prev.assignedLocations, assignedLocation],
    }));
  };

  const getStatsData = () => {
    const totalCompanies = companies.length;
    const activeCompanies = companies.filter((c) => c.isActive).length;
    const totalLocations = companies.reduce(
      (acc, company) => acc + company.locations.length,
      0
    );
    const activeLocations = companies.reduce(
      (acc, company) =>
        acc + company.locations.filter((l) => l.isActive).length,
      0
    );
    const totalUsers = companies.reduce(
      (acc, company) => acc + company.users.length,
      0
    );
    const activeUsers = companies.reduce(
      (acc, company) => acc + company.users.filter((u) => u.isActive).length,
      0
    );

    return {
      totalCompanies,
      activeCompanies,
      totalLocations,
      activeLocations,
      totalUsers,
      activeUsers,
    };
  };

  const stats = getStatsData();

  // Group permissions by category
  const groupedPermissions = useMemo(() => {
    const grouped: { [key: string]: Permission[] } = {};
    AVAILABLE_PERMISSIONS.forEach((permission) => {
      if (!grouped[permission.category]) {
        grouped[permission.category] = [];
      }
      grouped[permission.category].push(permission);
    });
    return grouped;
  }, []);

  // Show loading state
  if (loading && companies.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#f8f9fa",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box sx={{ p: 3, backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: 3, 
      backgroundColor: "#f8f9fa",
      minHeight: "100vh" 
    }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            color: "#1a237e",
            mb: 1,
          }}
        >
          🏢 Company Management Hub
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          Comprehensive management of companies, locations, and users
        </Typography>

        {/* Stats Cards and Add Button */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 3, flexWrap: "wrap" }}>
          <Grid container spacing={2} sx={{ flex: 1, maxWidth: "800px" }}>
            <Grid item xs={12} sm={4}>
              <Card sx={{ 
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                transition: "transform 0.2s",
                "&:hover": { transform: "translateY(-2px)" }
              }}>
                <CardContent sx={{ textAlign: "center", py: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: "rgba(255,255,255,0.2)",
                      mx: "auto",
                      mb: 1,
                      width: 40,
                      height: 40,
                    }}
                  >
                    <BusinessIcon />
                  </Avatar>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {stats.totalCompanies}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Companies
                  </Typography>
                  <Chip 
                    label={`${stats.activeCompanies} active`}
                    size="small"
                    sx={{ 
                      backgroundColor: "rgba(76, 175, 80, 0.9)", 
                      color: "white",
                      fontWeight: 600
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ 
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                color: "white",
                transition: "transform 0.2s",
                "&:hover": { transform: "translateY(-2px)" }
              }}>
                <CardContent sx={{ textAlign: "center", py: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: "rgba(255,255,255,0.2)",
                      mx: "auto",
                      mb: 1,
                      width: 40,
                      height: 40,
                    }}
                  >
                    <LocationOnIcon />
                  </Avatar>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {stats.totalLocations}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Locations
                  </Typography>
                  <Chip 
                    label={`${stats.activeLocations} active`}
                    size="small"
                    sx={{ 
                      backgroundColor: "rgba(76, 175, 80, 0.9)", 
                      color: "white",
                      fontWeight: 600
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ 
                background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                color: "white",
                transition: "transform 0.2s",
                "&:hover": { transform: "translateY(-2px)" }
              }}>
                <CardContent sx={{ textAlign: "center", py: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: "rgba(255,255,255,0.2)",
                      mx: "auto",
                      mb: 1,
                      width: 40,
                      height: 40,
                    }}
                  >
                    <PersonIcon />
                  </Avatar>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {stats.totalUsers}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Users
                  </Typography>
                  <Chip 
                    label={`${stats.activeUsers} active`}
                    size="small"
                    sx={{ 
                      backgroundColor: "rgba(76, 175, 80, 0.9)", 
                      color: "white",
                      fontWeight: 600
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Action buttons */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={handleAddCompany}
              sx={{
                background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
                boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
                "&:hover": { 
                  background: "linear-gradient(45deg, #FE6B8B 60%, #FF8E53 100%)",
                  transform: "translateY(-1px)",
                  boxShadow: "0 6px 10px 2px rgba(255, 105, 135, .3)"
                },
                transition: "all 0.2s",
                fontWeight: 600,
                py: 1.5,
                px: 3,
                minWidth: 160
              }}
            >
              Add Company
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={loading}
              sx={{
                fontWeight: 600,
                py: 1.5,
                px: 3,
                minWidth: 160
              }}
            >
              Refresh
            </Button>
          </Box>
        </Box>

        {/* Search and Filters */}
        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="🔍 Search companies, locations, users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: "#667eea" }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>👔 Filter by Role</InputLabel>
                  <Select
                    value={selectedRole}
                    label="👔 Filter by Role"
                    onChange={(e) => setSelectedRole(e.target.value)}
                  >
                    <MenuItem value="">All Roles</MenuItem>
                    {USER_ROLES.map((role) => (
                      <MenuItem key={role.value} value={role.value}>
                        <Chip
                          label={role.label}
                          size="small"
                          sx={{
                            backgroundColor: role.color,
                            color: "white",
                            fontWeight: 600,
                          }}
                        />
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
                    />
                  }
                  label="🚫 Show Inactive Only"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      {/* Companies Table */}
      <Card sx={{ mb: 2, borderRadius: 2 }}>
        <CardContent sx={{ pb: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h5" sx={{ 
              fontWeight: 700,
              color: "#1a237e",
              display: "flex",
              alignItems: "center"
            }}>
              🏢 Companies ({filteredCompanies.length})
            </Typography>
          </Box>
        </CardContent>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell sx={{ fontWeight: 700, fontSize: "1rem" }}>Company</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "1rem" }}>Address</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "1rem" }}>Contact</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "1rem" }}>Locations</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "1rem" }}>Users</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "1rem" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "1rem" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCompanies.map((company) => (
                <React.Fragment key={company.id}>
                  <TableRow 
                    hover
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: '#f8f9fa',
                      },
                      borderLeft: company.isActive ? '4px solid #4caf50' : '4px solid #f44336'
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Avatar
                          sx={{
                            bgcolor: company.isActive ? "#1a237e" : "grey.500",
                            mr: 2,
                            width: 40,
                            height: 40,
                          }}
                        >
                          <BusinessIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {company.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {company.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        📍 {company.address}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {company.state} {company.postcode}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Box>
                        <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                          <PhoneIcon sx={{ mr: 0.5, fontSize: 16, color: "#4caf50" }} />
                          <Typography variant="body2">{company.phone}</Typography>
                        </Box>
                        {company.email && (
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <EmailIcon sx={{ mr: 0.5, fontSize: 16, color: "#2196f3" }} />
                            <Typography variant="body2">{company.email}</Typography>
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={`📍 ${company.locations.length} locations`}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={`👥 ${company.users.length} users`}
                        size="small"
                        color="info"
                        variant="outlined"
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={company.isActive ? "✅ Active" : "❌ Inactive"}
                        color={company.isActive ? "success" : "error"}
                        size="small"
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Edit Company">
                          <IconButton 
                            size="small" 
                            onClick={() => handleEditCompany(company)}
                            color="primary"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Company">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteCompany(company.id)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={expandedCompanies.has(company.id) ? "Collapse" : "Expand"}>
                          <IconButton
                            size="small"
                            onClick={() => toggleCompanyExpansion(company.id)}
                            color="secondary"
                          >
                            {expandedCompanies.has(company.id) ? (
                              <ExpandLessIcon fontSize="small" />
                            ) : (
                              <ExpandMoreIcon fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                  
                  {/* Expanded Company Details */}
                  <TableRow>
                    <TableCell colSpan={7} sx={{ p: 0, border: 0 }}>
                      <Collapse in={expandedCompanies.has(company.id)} timeout="auto" unmountOnExit>
                        <Box sx={{ 
                          p: 4, 
                          background: "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
                          borderTop: '1px solid rgba(102, 126, 234, 0.2)' 
                        }}>
                          
                          {/* Locations Table */}
                          <Box sx={{ mb: 4 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                              <Typography variant="h5" sx={{ 
                                display: "flex", 
                                alignItems: "center",
                                fontWeight: 700,
                                background: "linear-gradient(45deg, #f093fb 30%, #f5576c 90%)",
                                backgroundClip: "text",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                              }}>
                                📍 Locations ({company.locations.length})
                              </Typography>
                              <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => handleAddLocation(company.id)}
                                sx={{ 
                                  background: "linear-gradient(45deg, #f093fb 30%, #f5576c 90%)",
                                  boxShadow: "0 3px 5px 2px rgba(240, 147, 251, .3)",
                                  "&:hover": { 
                                    background: "linear-gradient(45deg, #f093fb 60%, #f5576c 100%)",
                                    transform: "translateY(-1px)",
                                    boxShadow: "0 6px 10px 2px rgba(240, 147, 251, .3)"
                                  },
                                  transition: "all 0.2s",
                                  fontWeight: 600,
                                  borderRadius: 2
                                }}
                              >
                                Add Location
                              </Button>
                            </Box>
                            
                            {company.locations.length > 0 ? (
                              <TableContainer component={Paper} sx={{ 
                                borderRadius: 3, 
                                overflow: "hidden",
                                boxShadow: "0 4px 16px rgba(0,0,0,0.1)"
                              }}>
                                <Table size="small">
                                  <TableHead>
                                    <TableRow sx={{ 
                                      background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                                    }}>
                                      <TableCell sx={{ fontWeight: 700, color: "white" }}>Location Name</TableCell>
                                      <TableCell sx={{ fontWeight: 700, color: "white" }}>Address</TableCell>
                                      <TableCell sx={{ fontWeight: 700, color: "white" }}>City & State</TableCell>
                                      <TableCell sx={{ fontWeight: 700, color: "white" }}>Contact</TableCell>
                                      <TableCell sx={{ fontWeight: 700, color: "white" }}>Assigned Users</TableCell>
                                      <TableCell sx={{ fontWeight: 700, color: "white" }}>Status</TableCell>
                                      <TableCell sx={{ fontWeight: 700, color: "white" }}>Actions</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {company.locations.map((location) => (
                                      <TableRow key={location.id} hover sx={{
                                        '&:hover': { 
                                          backgroundColor: 'rgba(240, 147, 251, 0.1)',
                                          transform: "scale(1.001)",
                                          transition: "all 0.2s"
                                        },
                                        backgroundColor: "rgba(255,255,255,0.9)"
                                      }}>
                                        <TableCell>
                                          <Box sx={{ display: "flex", alignItems: "center" }}>
                                            <Avatar
                                              sx={{
                                                background: location.isActive 
                                                  ? "linear-gradient(45deg, #f093fb 30%, #f5576c 90%)" 
                                                  : "linear-gradient(45deg, #bdbdbd 30%, #757575 90%)",
                                                mr: 2,
                                                width: 36,
                                                height: 36,
                                              }}
                                            >
                                              <LocationOnIcon fontSize="small" />
                                            </Avatar>
                                            <Box>
                                              <Typography variant="subtitle2" fontWeight="bold">
                                                {location.name}
                                              </Typography>
                                              <Chip
                                                label={`ID: ${location.id}`}
                                                size="small"
                                                sx={{
                                                  backgroundColor: "rgba(240, 147, 251, 0.1)",
                                                  color: "#f093fb",
                                                  fontWeight: 600
                                                }}
                                              />
                                            </Box>
                                          </Box>
                                        </TableCell>
                                        
                                        <TableCell>
                                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            🏠 {location.address}
                                          </Typography>
                                        </TableCell>
                                        
                                        <TableCell>
                                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            📍 {location.city}, {location.state}
                                          </Typography>
                                          <Typography variant="body2" color="text.secondary">
                                            {location.postcode}
                                          </Typography>
                                        </TableCell>
                                        
                                        <TableCell>
                                          {location.phone && (
                                            <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                                              <PhoneIcon sx={{ mr: 0.5, fontSize: 14, color: "#4caf50" }} />
                                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{location.phone}</Typography>
                                            </Box>
                                          )}
                                          {location.email && (
                                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                              <EmailIcon sx={{ mr: 0.5, fontSize: 14, color: "#2196f3" }} />
                                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{location.email}</Typography>
                                            </Box>
                                          )}
                                        </TableCell>
                                        
                                        <TableCell>
                                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                            {getUsersForLocation(company.id, location.id).slice(0, 2).map((user) => (
                                              <Chip
                                                key={user.id}
                                                label={`${user.first_name} ${user.last_name}`.trim()}
                                                size="small"
                                                sx={{
                                                  background: "linear-gradient(45deg, #4facfe 30%, #00f2fe 90%)",
                                                  color: "white",
                                                  fontWeight: 600
                                                }}
                                              />
                                            ))}
                                            {getUsersForLocation(company.id, location.id).length > 2 && (
                                              <Chip
                                                label={`+${getUsersForLocation(company.id, location.id).length - 2} more`}
                                                size="small"
                                                sx={{
                                                  backgroundColor: "rgba(79, 172, 254, 0.1)",
                                                  color: "#4facfe",
                                                  fontWeight: 600
                                                }}
                                              />
                                            )}
                                          </Box>
                                        </TableCell>
                                        
                                        <TableCell>
                                          <Chip
                                            label={location.isActive ? "✅ Active" : "❌ Inactive"}
                                            sx={{
                                              backgroundColor: location.isActive ? "#4caf50" : "#f44336",
                                              color: "white",
                                              fontWeight: 700
                                            }}
                                          />
                                        </TableCell>
                                        
                                        <TableCell>
                                          <Stack direction="row" spacing={1}>
                                            <Tooltip title="Edit Location">
                                              <IconButton
                                                size="small"
                                                onClick={() => handleEditLocation(company.id, location)}
                                                sx={{ 
                                                  color: "white",
                                                  background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                                                  "&:hover": { 
                                                    background: "linear-gradient(45deg, #2196F3 60%, #21CBF3 100%)",
                                                    transform: "scale(1.1)"
                                                  },
                                                  transition: "all 0.2s"
                                                }}
                                              >
                                                <EditIcon fontSize="small" />
                                              </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete Location">
                                              <IconButton
                                                size="small"
                                                onClick={() => handleDeleteLocation(location.id)}
                                                sx={{ 
                                                  color: "white",
                                                  background: "linear-gradient(45deg, #f44336 30%, #ff1744 90%)",
                                                  "&:hover": { 
                                                    background: "linear-gradient(45deg, #f44336 60%, #ff1744 100%)",
                                                    transform: "scale(1.1)"
                                                  },
                                                  transition: "all 0.2s"
                                                }}
                                              >
                                                <DeleteIcon fontSize="small" />
                                              </IconButton>
                                            </Tooltip>
                                          </Stack>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            ) : (
                              <Paper sx={{ 
                                p: 4, 
                                textAlign: "center", 
                                background: "linear-gradient(135deg, rgba(240, 147, 251, 0.1) 0%, rgba(245, 87, 108, 0.1) 100%)",
                                borderRadius: 3,
                                border: "2px dashed rgba(240, 147, 251, 0.3)"
                              }}>
                                <LocationOnIcon sx={{ fontSize: 48, color: "#f093fb", mb: 2 }} />
                                <Typography variant="h6" sx={{ color: "#f093fb", fontWeight: 700 }}>
                                  No locations found for this company
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                  Add the first location to get started!
                                </Typography>
                              </Paper>
                            )}
                          </Box>

                          {/* Users Table */}
                          <Box>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                              <Typography variant="h5" sx={{ 
                                display: "flex", 
                                alignItems: "center",
                                fontWeight: 700,
                                background: "linear-gradient(45deg, #4facfe 30%, #00f2fe 90%)",
                                backgroundClip: "text",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                              }}>
                                👥 Users ({company.users.length})
                              </Typography>
                              <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => handleAddUser(company.id)}
                                sx={{ 
                                  background: "linear-gradient(45deg, #4facfe 30%, #00f2fe 90%)",
                                  boxShadow: "0 3px 5px 2px rgba(79, 172, 254, .3)",
                                  "&:hover": { 
                                    background: "linear-gradient(45deg, #4facfe 60%, #00f2fe 100%)",
                                    transform: "translateY(-1px)",
                                    boxShadow: "0 6px 10px 2px rgba(79, 172, 254, .3)"
                                  },
                                  transition: "all 0.2s",
                                  fontWeight: 600,
                                  borderRadius: 2
                                }}
                              >
                                Add User
                              </Button>
                            </Box>
                            
                            {company.users.length > 0 ? (
                              <TableContainer component={Paper} sx={{ 
                                borderRadius: 3, 
                                overflow: "hidden",
                                boxShadow: "0 4px 16px rgba(0,0,0,0.1)"
                              }}>
                                <Table size="small">
                                  <TableHead>
                                    <TableRow sx={{ 
                                      background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                                    }}>
                                      <TableCell sx={{ fontWeight: 700, color: "white" }}>Name</TableCell>
                                      <TableCell sx={{ fontWeight: 700, color: "white" }}>Contact</TableCell>
                                      <TableCell sx={{ fontWeight: 700, color: "white" }}>Role</TableCell>
                                      <TableCell sx={{ fontWeight: 700, color: "white" }}>Assigned Locations</TableCell>
                                      <TableCell sx={{ fontWeight: 700, color: "white" }}>Permissions</TableCell>
                                      <TableCell sx={{ fontWeight: 700, color: "white" }}>Status</TableCell>
                                      <TableCell sx={{ fontWeight: 700, color: "white" }}>Actions</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {company.users.map((user) => (
                                      <TableRow key={user.id} hover sx={{
                                        '&:hover': { 
                                          backgroundColor: 'rgba(79, 172, 254, 0.1)',
                                          transform: "scale(1.001)",
                                          transition: "all 0.2s"
                                        },
                                        backgroundColor: "rgba(255,255,255,0.9)"
                                      }}>
                                        <TableCell>
                                          <Box sx={{ display: "flex", alignItems: "center" }}>
                                            <Avatar
                                              sx={{
                                                background: getRoleColor(user.role),
                                                mr: 2,
                                                width: 36,
                                                height: 36,
                                              }}
                                            >
                                              <PersonIcon fontSize="small" />
                                            </Avatar>
                                            <Box>
                                              <Typography variant="subtitle2" fontWeight="bold">
                                                {user.first_name} {user.last_name}
                                              </Typography>
                                              <Chip
                                                label={`ID: ${user.id}`}
                                                size="small"
                                                sx={{
                                                  backgroundColor: "rgba(79, 172, 254, 0.1)",
                                                  color: "#4facfe",
                                                  fontWeight: 600
                                                }}
                                              />
                                            </Box>
                                          </Box>
                                        </TableCell>
                                        
                                        <TableCell>
                                          <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                                            <EmailIcon sx={{ mr: 0.5, fontSize: 14, color: "#2196f3" }} />
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{user.email}</Typography>
                                          </Box>
                                          {user.phone && (
                                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                              <PhoneIcon sx={{ mr: 0.5, fontSize: 14, color: "#4caf50" }} />
                                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{user.phone}</Typography>
                                            </Box>
                                          )}
                                        </TableCell>
                                        
                                        <TableCell>
                                          <Chip
                                            label={user.role}
                                            sx={{
                                              backgroundColor: getRoleColor(user.role),
                                              color: "white",
                                              fontWeight: 700,
                                              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                                            }}
                                          />
                                        </TableCell>
                                        
                                        <TableCell>
                                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                            {user.assignedLocations.slice(0, 2).map((al) => (
                                              <Chip
                                                key={al.location_id}
                                                label={al.location_name}
                                                size="small"
                                                sx={{
                                                  background: "linear-gradient(45deg, #f093fb 30%, #f5576c 90%)",
                                                  color: "white",
                                                  fontWeight: 600
                                                }}
                                              />
                                            ))}
                                            {user.assignedLocations.length > 2 && (
                                              <Chip
                                                label={`+${user.assignedLocations.length - 2} more`}
                                                size="small"
                                                sx={{
                                                  backgroundColor: "rgba(240, 147, 251, 0.1)",
                                                  color: "#f093fb",
                                                  fontWeight: 600
                                                }}
                                              />
                                            )}
                                          </Box>
                                        </TableCell>
                                        
                                        <TableCell>
                                          <Chip
                                            label={`🔐 ${user.permissions.length} permissions`}
                                            sx={{
                                              background: "linear-gradient(45deg, #9c27b0 30%, #e91e63 90%)",
                                              color: "white",
                                              fontWeight: 700,
                                              boxShadow: "0 2px 4px rgba(156, 39, 176, 0.3)"
                                            }}
                                          />
                                        </TableCell>
                                        
                                        <TableCell>
                                          <Chip
                                            label={user.isActive ? "✅ Active" : "❌ Inactive"}
                                            sx={{
                                              backgroundColor: user.isActive ? "#4caf50" : "#f44336",
                                              color: "white",
                                              fontWeight: 700
                                            }}
                                          />
                                        </TableCell>
                                        
                                        <TableCell>
                                          <Stack direction="row" spacing={1}>
                                            <Tooltip title="Edit User">
                                              <IconButton
                                                size="small"
                                                onClick={() => handleEditUser(company.id, user)}
                                                sx={{ 
                                                  color: "white",
                                                  background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                                                  "&:hover": { 
                                                    background: "linear-gradient(45deg, #2196F3 60%, #21CBF3 100%)",
                                                    transform: "scale(1.1)"
                                                  },
                                                  transition: "all 0.2s"
                                                }}
                                              >
                                                <EditIcon fontSize="small" />
                                              </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete User">
                                              <IconButton
                                                size="small"
                                                onClick={() => handleDeleteUser(user.id)}
                                                sx={{ 
                                                  color: "white",
                                                  background: "linear-gradient(45deg, #f44336 30%, #ff1744 90%)",
                                                  "&:hover": { 
                                                    background: "linear-gradient(45deg, #f44336 60%, #ff1744 100%)",
                                                    transform: "scale(1.1)"
                                                  },
                                                  transition: "all 0.2s"
                                                }}
                                              >
                                                <DeleteIcon fontSize="small" />
                                              </IconButton>
                                            </Tooltip>
                                          </Stack>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            ) : (
                              <Paper sx={{ 
                                p: 4, 
                                textAlign: "center", 
                                background: "linear-gradient(135deg, rgba(79, 172, 254, 0.1) 0%, rgba(0, 242, 254, 0.1) 100%)",
                                borderRadius: 3,
                                border: "2px dashed rgba(79, 172, 254, 0.3)"
                              }}>
                                <PersonIcon sx={{ fontSize: 48, color: "#4facfe", mb: 2 }} />
                                <Typography variant="h6" sx={{ color: "#4facfe", fontWeight: 700 }}>
                                  No users found for this company
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                  Add the first user to get started!
                                </Typography>
                              </Paper>
                            )}
                          </Box>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* No Results */}
      {filteredCompanies.length === 0 && !loading && (
        <Card sx={{ 
          mt: 4,
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
        }}>
          <CardContent sx={{ 
            textAlign: "center", 
            py: 8,
            background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
          }}>
            <BusinessIcon sx={{ 
              fontSize: 80, 
              color: "#667eea", 
              mb: 3,
              filter: "drop-shadow(0 4px 8px rgba(102, 126, 234, 0.2))"
            }} />
            <Typography variant="h4" sx={{ 
              color: "#667eea", 
              fontWeight: 700,
              mb: 1
            }}>
              No companies found
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
              Try adjusting your search criteria or add a new company to get started.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={handleAddCompany}
              sx={{
                background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
                boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
                "&:hover": { 
                  background: "linear-gradient(45deg, #FE6B8B 60%, #FF8E53 100%)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 16px 2px rgba(255, 105, 135, .3)"
                },
                transition: "all 0.3s",
                fontWeight: 700,
                py: 2,
                px: 4,
                fontSize: "1.1rem"
              }}
            >
              🚀 Add Your First Company
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dialog for Add/Edit */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 24px 48px rgba(0,0,0,0.2)"
          }
        }}
      >
        <DialogTitle sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          textAlign: "center",
          py: 3
        }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {dialogMode === "add" ? "➕ Add" : "✏️ Edit"} {
              entityType === "company" ? "🏢 Company" : 
              entityType === "location" ? "📍 Location" : 
              "👤 User"
            }
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {entityType === "company" && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="🏢 Company Name *"
                  value={companyForm.name}
                  onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: "rgba(102, 126, 234, 0.05)",
                      "& fieldset": {
                        borderColor: "rgba(102, 126, 234, 0.3)",
                      },
                      "&:hover fieldset": {
                        borderColor: "rgba(102, 126, 234, 0.6)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#667eea",
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="🏠 Address *"
                  value={companyForm.address}
                  onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                  multiline
                  rows={2}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: "rgba(102, 126, 234, 0.05)",
                      "& fieldset": {
                        borderColor: "rgba(102, 126, 234, 0.3)",
                      },
                      "&:hover fieldset": {
                        borderColor: "rgba(102, 126, 234, 0.6)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#667eea",
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="🏛️ State *"
                  value={companyForm.state}
                  onChange={(e) => setCompanyForm({ ...companyForm, state: e.target.value })}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: "rgba(102, 126, 234, 0.05)",
                      "& fieldset": {
                        borderColor: "rgba(102, 126, 234, 0.3)",
                      },
                      "&:hover fieldset": {
                        borderColor: "rgba(102, 126, 234, 0.6)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#667eea",
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="📮 Postcode *"
                  value={companyForm.postcode}
                  onChange={(e) => setCompanyForm({ ...companyForm, postcode: e.target.value })}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: "rgba(102, 126, 234, 0.05)",
                      "& fieldset": {
                        borderColor: "rgba(102, 126, 234, 0.3)",
                      },
                      "&:hover fieldset": {
                        borderColor: "rgba(102, 126, 234, 0.6)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#667eea",
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="📞 Phone *"
                  value={companyForm.phone}
                  onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: "rgba(102, 126, 234, 0.05)",
                      "& fieldset": {
                        borderColor: "rgba(102, 126, 234, 0.3)",
                      },
                      "&:hover fieldset": {
                        borderColor: "rgba(102, 126, 234, 0.6)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#667eea",
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="📧 Email"
                  value={companyForm.email}
                  onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: "rgba(102, 126, 234, 0.05)",
                      "& fieldset": {
                        borderColor: "rgba(102, 126, 234, 0.3)",
                      },
                      "&:hover fieldset": {
                        borderColor: "rgba(102, 126, 234, 0.6)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#667eea",
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="🌐 Website"
                  value={companyForm.website}
                  onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: "rgba(102, 126, 234, 0.05)",
                      "& fieldset": {
                        borderColor: "rgba(102, 126, 234, 0.3)",
                      },
                      "&:hover fieldset": {
                        borderColor: "rgba(102, 126, 234, 0.6)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#667eea",
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={companyForm.isActive}
                      onChange={(e) => setCompanyForm({ ...companyForm, isActive: e.target.checked })}
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: "#667eea",
                        },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                          backgroundColor: "#667eea",
                        },
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ fontWeight: 600, color: "#667eea" }}>
                      ✅ Active Company
                    </Typography>
                  }
                />
              </Grid>
            </Grid>
          )}

          {entityType === "location" && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {/* Hidden Company ID field */}
              <input
                type="hidden"
                value={locationForm.company_id}
                name="company_id"
              />
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="📍 Location Name *"
                  value={locationForm.name}
                  onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="🏠 Address *"
                  value={locationForm.address}
                  onChange={(e) => setLocationForm({ ...locationForm, address: e.target.value })}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="🏙️ City *"
                  value={locationForm.city}
                  onChange={(e) => setLocationForm({ ...locationForm, city: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="🏛️ State *"
                  value={locationForm.state}
                  onChange={(e) => setLocationForm({ ...locationForm, state: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="📮 Postcode *"
                  value={locationForm.postcode}
                  onChange={(e) => setLocationForm({ ...locationForm, postcode: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="📞 Phone"
                  value={locationForm.phone}
                  onChange={(e) => setLocationForm({ ...locationForm, phone: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="📧 Email"
                  value={locationForm.email}
                  onChange={(e) => setLocationForm({ ...locationForm, email: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={locationForm.isActive}
                      onChange={(e) => setLocationForm({ ...locationForm, isActive: e.target.checked })}
                    />
                  }
                  label="✅ Active Location"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                  📋 Company: {selectedCompany?.name} (ID: {locationForm.company_id})
                </Typography>
              </Grid>
            </Grid>
          )}

          {entityType === "user" && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {/* Hidden Company ID field */}
              <input
                type="hidden"
                value={userForm.company_id}
                name="company_id"
              />
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="👤 First Name *"
                  value={userForm.first_name}
                  onChange={(e) => setUserForm({ ...userForm, first_name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="👤 Last Name *"
                  value={userForm.last_name}
                  onChange={(e) => setUserForm({ ...userForm, last_name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="📧 Email *"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="📞 Phone"
                  value={userForm.phone}
                  onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>👔 Role *</InputLabel>
                  <Select
                    value={userForm.role}
                    label="👔 Role *"
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  >
                    {USER_ROLES.map((role) => (
                      <MenuItem key={role.value} value={role.value}>
                        <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                          <Chip
                            label={role.label}
                            sx={{
                              backgroundColor: role.color,
                              color: "white",
                              fontWeight: 600,
                              mr: 1
                            }}
                          />
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Company Information */}
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" sx={{ 
                  fontStyle: "italic",
                  p: 2,
                  backgroundColor: "rgba(25, 118, 210, 0.1)",
                  borderRadius: 1,
                  border: "1px solid rgba(25, 118, 210, 0.2)"
                }}>
                  🏢 Company: {selectedCompany?.name} (ID: {userForm.company_id})
                </Typography>
              </Grid>

              {/* Permissions */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 700,
                  color: "#1976d2",
                  mb: 2,
                  display: "flex",
                  alignItems: "center"
                }}>
                  🔐 Permissions
                </Typography>
                <Box sx={{ 
                  maxHeight: 300, 
                  overflowY: "auto",
                  border: "2px solid rgba(25, 118, 210, 0.2)",
                  borderRadius: 2,
                  p: 2,
                  backgroundColor: "rgba(25, 118, 210, 0.05)"
                }}>
                  {Object.entries(groupedPermissions).map(([category, permissions]) => (
                    <Box key={category} sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ 
                        fontWeight: 700, 
                        color: "#1976d2",
                        mb: 1,
                        borderBottom: "1px solid rgba(25, 118, 210, 0.2)",
                        pb: 0.5
                      }}>
                        {category}
                      </Typography>
                      <Grid container spacing={1}>
                        {permissions.map((permission) => (
                          <Grid item xs={12} sm={6} key={permission.id}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={userForm.permissions.includes(permission.id)}
                                  onChange={() => handlePermissionToggle(permission.id)}
                                  sx={{
                                    color: "#1976d2",
                                    "&.Mui-checked": {
                                      color: "#1976d2",
                                    },
                                  }}
                                />
                              }
                              label={
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {permission.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {permission.description}
                                  </Typography>
                                </Box>
                              }
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  ))}
                </Box>
              </Grid>

              {/* Assigned Locations */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 700,
                  color: "#1976d2",
                  mb: 2,
                  display: "flex",
                  alignItems: "center"
                }}>
                  📍 Assigned Locations
                </Typography>
                {selectedCompany?.locations && selectedCompany.locations.length > 0 ? (
                  <Box sx={{ 
                    maxHeight: 200, 
                    overflowY: "auto",
                    border: "2px solid rgba(25, 118, 210, 0.2)",
                    borderRadius: 2,
                    p: 2,
                    backgroundColor: "rgba(25, 118, 210, 0.05)"
                  }}>
                    <Grid container spacing={1}>
                      {selectedCompany.locations.map((location) => (
                        <Grid item xs={12} sm={6} key={location.id}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={userForm.assignedLocations.some(al => al.location_id === location.id)}
                                onChange={() => handleLocationAssignmentToggle(location.id, location.name)}
                                sx={{
                                  color: "#f093fb",
                                  "&.Mui-checked": {
                                    color: "#f093fb",
                                  },
                                }}
                              />
                            }
                            label={
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {location.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {location.city}, {location.state}
                                </Typography>
                              </Box>
                            }
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                ) : (
                  <Paper sx={{ 
                    p: 3, 
                    textAlign: "center", 
                    backgroundColor: "rgba(25, 118, 210, 0.05)",
                    borderRadius: 2,
                    border: "2px dashed rgba(25, 118, 210, 0.3)"
                  }}>
                    <LocationOnIcon sx={{ fontSize: 48, color: "#1976d2", mb: 1 }} />
                    <Typography variant="body1" sx={{ color: "#1976d2", fontWeight: 600 }}>
                      No locations available for this company
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Add locations to the company first to assign them to users.
                    </Typography>
                  </Paper>
                )}
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={userForm.isActive}
                      onChange={(e) => setUserForm({ ...userForm, isActive: e.target.checked })}
                    />
                  }
                  label="✅ Active User"
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          p: 3,
          background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
        }}>
          <Button 
            onClick={() => setDialogOpen(false)}
            sx={{
              color: "#666",
              fontWeight: 600,
              "&:hover": {
                backgroundColor: "rgba(0,0,0,0.05)"
              }
            }}
          >
            ❌ Cancel
          </Button>
          <Button
            onClick={
              entityType === "company"
                ? handleSaveCompany
                : entityType === "location"
                ? handleSaveLocation
                : handleSaveUser
            }
            variant="contained"
            disabled={loading}
            sx={{
              background: "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
              boxShadow: "0 3px 5px 2px rgba(102, 126, 234, .3)",
              "&:hover": { 
                background: "linear-gradient(45deg, #667eea 60%, #764ba2 100%)",
                transform: "translateY(-1px)",
                boxShadow: "0 6px 10px 2px rgba(102, 126, 234, .3)"
              },
              transition: "all 0.2s",
              fontWeight: 600,
              px: 4
            }}
          >
            {loading ? (
              <CircularProgress size={20} sx={{ color: "white" }} />
            ) : (
              `💾 Save ${entityType === "company" ? "Company" : entityType === "location" ? "Location" : "User"}`
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ 
            width: "100%",
            borderRadius: 2,
            fontWeight: 600,
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            backdropFilter: "blur(10px)"
          }}
          icon={
            notification.severity === "success" ? "✅" :
            notification.severity === "error" ? "❌" :
            notification.severity === "warning" ? "⚠️" : "ℹ️"
          }
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
            background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
            backdropFilter: "blur(10px)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <Box sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: 3,
            p: 4,
            textAlign: "center",
            boxShadow: "0 24px 48px rgba(0,0,0,0.2)"
          }}>
            <CircularProgress 
              size={60} 
              sx={{ 
                color: "white",
                mb: 2
              }} 
            />
            <Typography variant="h6" sx={{ color: "white", fontWeight: 700 }}>
              🔄 Processing...
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
              Please wait while we update your data
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default CompanyLocationManager;
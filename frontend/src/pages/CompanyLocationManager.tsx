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
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { API_URL_Local } from "../constants";

const COMPANY_OVERVIEW_API_URL = `${API_URL_Local}/company-overview/`;

// API Endpoints
const API_ENDPOINTS = {
  users: `${API_URL_Local}/users`,
  stores: `${API_URL_Local}/stores`,
  companies: `${API_URL_Local}/companies`,
};

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

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
  address: string;
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
  address: string;
  state: string;
  postcode: string;
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

  // Utility function to normalize ID format (remove hyphens if present)
  const normalizeId = (id: string): string => {
    if (!id) return id;
    // Remove hyphens to get the original format
    const normalized = id.replace(/-/g, '');
    console.log(`ID normalization: "${id}" -> "${normalized}"`);
    return normalized;
  };

  // Utility function to extract location ID only (remove company prefix if present)
  const extractLocationId = (fullId: string, company_id?: string): string => {
    if (!fullId) return fullId;
    
    console.log(`=== ID EXTRACTION PROCESS ===`);
    console.log(`Full ID: "${fullId}"`);
    console.log(`Company ID: "${company_id}"`);
    console.log(`Full ID type: ${typeof fullId}`);
    console.log(`Company ID type: ${typeof company_id}`);
    
    // Convert to strings to ensure proper comparison
    const fullIdStr = String(fullId);
    const company_idStr = String(company_id || '');
    
    // If we have the company ID and the full ID starts with it, extract the location part
    if (company_idStr && fullIdStr.startsWith(company_idStr)) {
      const locationId = fullIdStr.substring(company_idStr.length);
      console.log(`SUCCESS: Extracted location ID by removing company prefix`);
      console.log(`"${fullIdStr}" - "${company_idStr}" = "${locationId}"`);
      console.log(`=== END ID EXTRACTION ===`);
      return locationId;
    }
    
    // Check for common compound ID patterns
    if (fullIdStr.includes('_')) {
      // Pattern: "company123_location456"
      const parts = fullIdStr.split('_');
      const locationId = parts[parts.length - 1];
      console.log(`Split by underscore: "${fullIdStr}" -> "${locationId}"`);
      console.log(`=== END ID EXTRACTION ===`);
      return locationId;
    }
    
    if (fullIdStr.includes('-') && fullIdStr.split('-').length > 4) {
      // Pattern might be "company_id-locationId" where both are UUIDs
      // UUID format: 8-4-4-4-12 characters
      const parts = fullIdStr.split('-');
      if (parts.length > 5) {
        // Take last 5 parts as location UUID
        const locationId = parts.slice(-5).join('-');
        console.log(`Split compound UUID: "${fullIdStr}" -> "${locationId}"`);
        console.log(`=== END ID EXTRACTION ===`);
        return locationId;
      }
    }
    
    // If no pattern matches, return the original ID
    console.log(`WARNING: No pattern matched, using original ID: "${fullIdStr}"`);
    console.log(`=== END ID EXTRACTION ===`);
    return fullIdStr;
  };

  // Utility function to get clean location ID for API calls
  const getLocationIdForAPI = (fullId: string, company_id?: string): string => {
    // First extract location part using company ID if available, then normalize
    const locationPart = extractLocationId(fullId, company_id);
    const normalized = normalizeId(locationPart);
    console.log(`Location ID for API: "${fullId}" (company: "${company_id}") -> "${normalized}"`);
    return normalized;
  };

  // Utility function to format ID for display (if needed)
  const getOriginalId = (id: string): string => {
    // Always return the ID without hyphens for consistency
    return normalizeId(id);
  };

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
    manager: "",
    company_id: "", // Hidden field for company association
    isActive: true,
  });

  // Updated user form with firstName, lastName, and phone
  const [userForm, setUserForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    permissions: [] as string[],
    assignedLocations: [] as string[],
    company_id: "", // Hidden field for company association
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

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalCompanies = companies.length;
    const activeCompanies = companies.filter(c => c.isActive).length;
    const inactiveCompanies = totalCompanies - activeCompanies;
    
    const totalLocations = companies.reduce((sum, company) => sum + company.locations.length, 0);
    const activeLocations = companies.reduce((sum, company) => 
      sum + company.locations.filter(l => l.isActive).length, 0);
    const inactiveLocations = totalLocations - activeLocations;
    
    const totalUsers = companies.reduce((sum, company) => sum + company.users.length, 0);
    const activeUsers = companies.reduce((sum, company) => 
      sum + company.users.filter(u => u.isActive).length, 0);
    const inactiveUsers = totalUsers - activeUsers;

    return {
      companies: { total: totalCompanies, active: activeCompanies, inactive: inactiveCompanies },
      locations: { total: totalLocations, active: activeLocations, inactive: inactiveLocations },
      users: { total: totalUsers, active: activeUsers, inactive: inactiveUsers }
    };
  }, [companies]);

  // API Functions for Users
  const createUser = async (userData: any) => {
    try {
      console.log("Creating user with data (including company ID):", userData);
      console.log("Company ID being sent:", userData.company_id);
      
      const response = await axios.post(API_ENDPOINTS.users, userData);
      
      console.log("User creation response:", response.data);
      showNotification("User created successfully", "success");
      return response.data;
    } catch (error) {
      console.error("Error creating user:", error);
      showNotification("Failed to create user", "error");
      throw error;
    }
  };

  const updateUser = async (userId: string, userData: any) => {
    try {
      const response = await axios.put(`${API_ENDPOINTS.users}/${userId}`, userData);
      showNotification("User updated successfully", "success");
      return response.data;
    } catch (error) {
      console.error("Error updating user:", error);
      showNotification("Failed to update user", "error");
      throw error;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const normalizedId = normalizeId(userId);
      console.log("Deleting user with normalized ID:", normalizedId);
      await axios.delete(`${API_ENDPOINTS.users}/${normalizedId}`);
      showNotification("User deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting user:", error);
      showNotification("Failed to delete user", "error");
      throw error;
    }
  };

  // API Functions for Locations/Stores
  const createLocation = async (locationData: any) => {
    try {
      console.log("Creating location with data (including company ID):", locationData);
      console.log("Company ID being sent:", locationData.company_id);
      
      const response = await axios.post(API_ENDPOINTS.stores, locationData);
      
      console.log("Location creation response:", response.data);
      showNotification("Location created successfully", "success");
      return response.data;
    } catch (error) {
      console.error("Error creating location:", error);
      showNotification("Failed to create location", "error");
      throw error;
    }
  };

  const updateLocation = async (locationId: string, locationData: any) => {
    try {
      const response = await axios.put(`${API_ENDPOINTS.stores}/${locationId}`, locationData);
      showNotification("Location updated successfully", "success");
      return response.data;
    } catch (error) {
      console.error("Error updating location:", error);
      showNotification("Failed to update location", "error");
      throw error;
    }
  };

  const deleteLocation = async (locationId: string) => {
    try {
      await axios.delete(`${API_ENDPOINTS.stores}/${locationId}`);
      showNotification("Location deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting location:", error);
      showNotification("Failed to delete location", "error");
      throw error;
    }
  };

  // API Functions for Companies
  const createCompany = async (companyData: any) => {
    try {
      const response = await axios.post(API_ENDPOINTS.companies, companyData);
      showNotification("Company created successfully", "success");
      return response.data;
    } catch (error) {
      console.error("Error creating company:", error);
      showNotification("Failed to create company", "error");
      throw error;
    }
  };

  const updateCompany = async (company_id: string, companyData: any) => {
    try {
      const response = await axios.put(`${API_ENDPOINTS.companies}/${company_id}`, companyData);
      showNotification("Company updated successfully", "success");
      return response.data;
    } catch (error) {
      console.error("Error updating company:", error);
      showNotification("Failed to update company", "error");
      throw error;
    }
  };

  const deleteCompany = async (company_id: string) => {
    try {
      await axios.delete(`${API_ENDPOINTS.companies}/${company_id}`);
      showNotification("Company deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting company:", error);
      showNotification("Failed to delete company", "error");
      throw error;
    }
  };

  // API call to fetch company data
  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching data from:", COMPANY_OVERVIEW_API_URL);
      
      const response = await fetch(COMPANY_OVERVIEW_API_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Raw API Response:", data);
      
      // Handle different possible response structures
      let companiesData = [];
      
      if (data && Array.isArray(data)) {
        companiesData = data;
        console.log("Set companies from direct array:", data);
      } else if (data && data.companies && Array.isArray(data.companies)) {
        companiesData = data.companies;
        console.log("Set companies from data.companies:", data.companies);
      } else if (data && data.data && Array.isArray(data.data)) {
        companiesData = data.data;
        console.log("Set companies from data.data:", data.data);
      } else if (data && data.results && Array.isArray(data.results)) {
        companiesData = data.results;
        console.log("Set companies from data.results:", data.results);
      } else {
        console.warn("No companies data found in response. Response structure:", data);
        
        // Create sample data for testing if no data is returned
        const sampleData = [
          {
            id: "4f50ec60c70046669490bd34d3953046", // Keep original format
            name: "Default Company",
            address: "123 Main Street",
            state: "NY",
            postcode: "10001",
            phone: "000-000-0000",
            email: "default@company.com",
            website: "",
            isActive: true,
            locations: [
              {
                id: "loc1",
                name: "Main Office",
                address: "456 Business Ave",
                city: "Default City",
                state: "DC",
                postcode: "00000",
                phone: "000-000-0000",
                email: "main@company.com",
                isActive: true,
                manager: "",
                createdAt: new Date(),
                updatedAt: new Date()
              }
            ],
            users: [
              {
                id: "user1",
                firstName: "John",
                lastName: "Doe",
                email: "john@company.com",
                phone: "000-000-0000",
                role: "admin",
                permissions: ["user_management"],
                assignedLocations: ["Main Office"],
                isActive: true,
                createdAt: new Date()
              }
            ],
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];
        
        console.log("Using sample data for testing:", sampleData);
        companiesData = sampleData;
      }
      
      // Debug: Check ID formats in the received data
      companiesData.forEach((company, index) => {
        console.log(`Company ${index} - Original ID from API:`, company.id);
        console.log(`Company ${index} - ID type:`, typeof company.id);
        console.log(`Company ${index} - ID length:`, company.id?.length);
        
        // Debug location IDs
        if (company.locations) {
          company.locations.forEach((location, locIndex) => {
            console.log(`  Location ${locIndex} - Original ID from API:`, location.id);
            console.log(`  Location ${locIndex} - Extracted location ID:`, extractLocationId(location.id, company.id));
            console.log(`  Location ${locIndex} - Clean API ID:`, getLocationIdForAPI(location.id, company.id));
          });
        }
      });
      
      setCompanies(companiesData);
      
    } catch (error) {
      console.error("Error fetching company data:", error);
      setError(`Failed to load company data: ${error.message}`);
      setCompanies([]);
      
      // Show more detailed error information
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setError("Network error: Cannot connect to the API. Please check if the server is running.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Initialize data
  useEffect(() => {
    console.log("Component mounted, API_URL_Local:", API_URL_Local);
    console.log("Full API URL:", COMPANY_OVERVIEW_API_URL);
    fetchCompanyData();
  }, []);

  // Filter companies based on search and filters
  const filteredCompaniesData = useMemo(() => {
    let filtered = companies;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (company) =>
          company.name.toLowerCase().includes(searchLower) ||
          company.address.toLowerCase().includes(searchLower) ||
          company.state.toLowerCase().includes(searchLower) ||
          company.email?.toLowerCase().includes(searchLower) ||
          company.locations.some(
            (location) =>
              location.name.toLowerCase().includes(searchLower) ||
              location.address.toLowerCase().includes(searchLower) ||
              location.city.toLowerCase().includes(searchLower)
          ) ||
          company.users.some(
            (user) =>
              `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchLower) ||
              user.email.toLowerCase().includes(searchLower)
          )
      );
    }

    // Role filter
    if (selectedRole) {
      filtered = filtered.filter((company) =>
        company.users.some((user) => user.role === selectedRole)
      );
    }

    // Active/Inactive filter
    if (showInactiveOnly) {
      filtered = filtered.filter((company) => !company.isActive);
    }

    return filtered;
  }, [companies, searchTerm, selectedRole, showInactiveOnly]);

  // Update filtered companies when data changes
  useEffect(() => {
    setFilteredCompanies(filteredCompaniesData);
  }, [filteredCompaniesData]);

  // Notification helper
  const showNotification = (
    message: string,
    severity: "success" | "error" | "warning" | "info"
  ) => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  // Dialog handlers
  const handleOpenDialog = (
    mode: DialogMode,
    type: EntityType,
    item?: Company | Location | User,
    company_id?: string // Add optional company ID parameter
  ) => {
    setDialogMode(mode);
    setEntityType(type);
    
    // Reset forms first
    resetForms();
    
    // Populate forms for edit mode
    if (mode === "edit" && item) {
      console.log("Opening edit dialog for item:", item);
      console.log("Original item ID:", item.id);
      console.log("Normalized item ID:", normalizeId(item.id));
      
      if (type === "company" && "name" in item && !("manager" in item) && !("firstName" in item)) {
        const company = item as Company;
        console.log("Populating company form with:", company);
        console.log("Company ID before normalization:", company.id);
        
        // Create a company object with normalized ID
        const normalizedCompany = {
          ...company,
          id: normalizeId(company.id)
        };
        
        console.log("Company ID after normalization:", normalizedCompany.id);
        
        setCompanyForm({
          name: company.name || "",
          address: company.address || "",
          state: company.state || "",
          postcode: company.postcode || "",
          phone: company.phone || "",
          email: company.email || "",
          website: company.website || "",
          isActive: company.isActive,
        });
        setSelectedCompany(normalizedCompany);
      } else if (type === "location" && "manager" in item) {
        const location = item as Location;
        console.log("Populating location form with:", location);
        console.log("Original location ID:", location.id);
        console.log("Company ID provided for location edit:", company_id);
        
        // Extract clean location ID using the company ID
        const cleanLocationId = getLocationIdForAPI(location.id, company_id);
        console.log("Extracted clean location ID:", cleanLocationId);
        
        const normalizedLocation = {
          ...location,
          id: cleanLocationId // Use clean location ID
        };
        
        console.log("Clean location ID for form:", normalizedLocation.id);
        
        setLocationForm({
          name: location.name || "",
          address: location.address || "",
          city: location.city || "",
          state: location.state || "",
          postcode: location.postcode || "",
          phone: location.phone || "",
          email: location.email || "",
          manager: location.manager || "",
          company_id: company_id ? normalizeId(company_id) : "", // Always set company ID for edit mode
          isActive: location.isActive,
        });
        setSelectedLocation(normalizedLocation);
      } else if (type === "user" && "firstName" in item) {
        const user = item as User;
        console.log("Populating user form with:", user);
        console.log("User ID before normalization:", user.id);
        
        const normalizedUser = {
          ...user,
          id: normalizeId(user.id)
        };
        
        console.log("User ID after normalization:", normalizedUser.id);
        
        setUserForm({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          phone: user.phone || "",
          role: user.role || "",
          permissions: user.permissions || [],
          assignedLocations: user.assignedLocations || [],
          isActive: user.isActive,
        });
        setSelectedUser(normalizedUser);
      }
    } else if (mode === "add") {
      // For add mode, set company ID if provided (for location/user creation)
      if (type === "location" && company_id) {
        console.log("Setting company ID for new location:", company_id);
        setLocationForm(prev => ({
          ...prev,
          company_id: normalizeId(company_id) // Normalize the company ID
        }));
      } else if (type === "user" && company_id) {
        console.log("Setting company ID for new user:", company_id);
        setUserForm(prev => ({
          ...prev,
          company_id: normalizeId(company_id) // Normalize the company ID
        }));
      }
      
      // Clear selections for add mode
      setSelectedCompany(null);
      setSelectedLocation(null);
      setSelectedUser(null);
    }
    
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setDialogMode(null);
    setEntityType("company");
    setSelectedCompany(null);
    setSelectedLocation(null);
    setSelectedUser(null);
    resetForms();
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
      manager: "",
      company_id: "", // Reset company ID
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
      company_id: "", // Reset company ID
      isActive: true,
    });
  };

  // Save handlers
  const handleSave = async () => {
    try {
      if (dialogMode === "add") {
        console.log("Creating new entity..."); // Debug log
        if (entityType === "company") {
          console.log("Creating company with data:", companyForm); // Debug log
          await createCompany(companyForm);
        } else if (entityType === "location") {
          console.log("Creating location with data:", locationForm);
          
          // Validate that company ID is present
          if (!locationForm.company_id) {
            console.error("Company ID is missing for location creation");
            showNotification("Error: Company ID is required for location creation", "error");
            return;
          }
          
          // Create update data without the company_id field (it becomes company_id)
          const { company_id, ...locationDataWithoutCompanyId } = locationForm;
          
          // Prepare data for creation with company_id
          const createData = {
            ...locationDataWithoutCompanyId,
            company_id: locationForm.company_id // Include company_id in request body
          };
          
          console.log("Creating location with prepared data:", createData);
          await createLocation(createData);
        } else if (entityType === "user") {
          console.log("Creating user with data:", userForm);
          
          // Validate that company ID is present
          if (!userForm.company_id) {
            console.error("Company ID is missing for user creation");
            showNotification("Error: Company ID is required for user creation", "error");
            return;
          }
          
          await createUser(userForm);
        }
      } else if (dialogMode === "edit") {
        console.log("Updating existing entity..."); // Debug log
        if (entityType === "company" && selectedCompany) {
          const updateData = { ...companyForm, id: selectedCompany.id };
          console.log("Updating company with data:", updateData); // Debug log
          await updateCompany(selectedCompany.id, updateData);
        } else if (entityType === "location" && selectedLocation) {
          const updateData = { ...locationForm, id: selectedLocation.id };
          console.log("Updating location with data:", updateData); // Debug log
          await updateLocation(selectedLocation.id, updateData);
        } else if (entityType === "user" && selectedUser) {
          const updateData = { ...userForm, id: selectedUser.id };
          console.log("Updating user with data:", updateData); // Debug log
          await updateUser(selectedUser.id, updateData);
        }
      }
      
      handleCloseDialog();
      fetchCompanyData(); // Refresh data
    } catch (error) {
      console.error("Error saving:", error);
    }
  };

  // Delete handlers
  const handleDelete = async (id: string, type: EntityType) => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      try {
        if (type === "company") {
          await deleteCompany(id);
        } else if (type === "location") {
          await deleteLocation(id);
        } else if (type === "user") {
          await deleteUser(id);
        }
        
        fetchCompanyData(); // Refresh data
      } catch (error) {
        console.error("Error deleting:", error);
      }
    }
  };

  // Toggle company expansion
  const toggleCompanyExpansion = (company_id: string) => {
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

  // Get user role color
  const getUserRoleColor = (role: string) => {
    const roleConfig = USER_ROLES.find((r) => r.value === role);
    return roleConfig?.color || "#666";
  };

  // Loading state
  if (loading) {
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

  // Error state
  if (error) {
    return (
      <Box p={3}>
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={fetchCompanyData}
              startIcon={<RefreshIcon />}
            >
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
    <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 3,
          p: 4,
          mb: 3,
          color: 'white'
        }}
      >
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Company & Location Manager
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Manage your organizations, locations, and team members
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Companies Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="h3" fontWeight="bold">
                    {summaryStats.companies.total}
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
                    Total Companies
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {summaryStats.companies.active} Active • {summaryStats.companies.inactive} Inactive
                  </Typography>
                </Box>
                <BusinessIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Locations Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="h3" fontWeight="bold">
                    {summaryStats.locations.total}
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
                    Total Locations
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {summaryStats.locations.active} Active • {summaryStats.locations.inactive} Inactive
                  </Typography>
                </Box>
                <LocationOnIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Users Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="h3" fontWeight="bold">
                    {summaryStats.users.total}
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
                    Total Users
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {summaryStats.users.active} Active • {summaryStats.users.inactive} Inactive
                  </Typography>
                </Box>
                <PersonIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Add Company Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              color: 'white',
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)'
              }
            }}
            onClick={() => handleOpenDialog("add", "company")}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" height="100%">
                <Box>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    ADD COMPANY
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Create new organization
                  </Typography>
                </Box>
                <AddIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters & Search Section */}
      <Box sx={{ mb: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <FilterListIcon sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="h6" color="text.secondary">
            Filters & Search
          </Typography>
        </Box>
        
        <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search companies, addresses, locations, users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={selectedRole}
                    label="Role"
                    onChange={(e) => setSelectedRole(e.target.value)}
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
              <Grid item xs={12} md={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showInactiveOnly}
                      onChange={(e) => setShowInactiveOnly(e.target.checked)}
                    />
                  }
                  label="Inactive Only"
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchCompanyData}
                  disabled={loading}
                  sx={{ borderRadius: 2, height: 56 }}
                >
                  REFRESH
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      {/* Main Table */}
      <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#667eea' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>
                  Company Details
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>
                  Contact & Info
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>
                  Locations
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>
                  Users
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCompanies.map((company) => (
                <React.Fragment key={company.id}>
                  <TableRow sx={{ 
                    '&:hover': { bgcolor: '#f5f5f5' },
                    borderLeft: `4px solid ${company.isActive ? '#4caf50' : '#f44336'}`
                  }}>
                    {/* Company Details */}
                    <TableCell sx={{ py: 3 }}>
                      <Box display="flex" alignItems="center">
                        <IconButton
                          size="small"
                          onClick={() => toggleCompanyExpansion(company.id)}
                          sx={{ mr: 1 }}
                        >
                          {expandedCompanies.has(company.id) ? (
                            <ExpandLessIcon />
                          ) : (
                            <KeyboardArrowDownIcon />
                          )}
                        </IconButton>
                        <Avatar
                          sx={{
                            bgcolor: company.isActive ? 'primary.main' : 'grey.400',
                            mr: 2,
                            width: 48,
                            height: 48,
                          }}
                        >
                          <BusinessIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight="bold">
                            {company.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {company.address}, {company.state} {company.postcode}
                          </Typography>
                          <Chip
                            label={company.isActive ? "Active" : "Inactive"}
                            color={company.isActive ? "success" : "error"}
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Contact & Info */}
                    <TableCell sx={{ py: 3 }}>
                      <Stack spacing={1}>
                        <Box display="flex" alignItems="center">
                          <PhoneIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2">{company.phone}</Typography>
                        </Box>
                        {company.email && (
                          <Box display="flex" alignItems="center">
                            <EmailIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2">{company.email}</Typography>
                          </Box>
                        )}
                        {company.website && (
                          <Box display="flex" alignItems="center">
                            <WebIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2">{company.website}</Typography>
                          </Box>
                        )}
                      </Stack>
                    </TableCell>

                    {/* Locations */}
                    <TableCell sx={{ py: 3 }}>
                      <Box display="flex" alignItems="center">
                        <LocationOnIcon sx={{ color: '#f093fb', mr: 1 }} />
                        <Chip
                          label={`${company.locations.length} LOCATIONS`}
                          sx={{
                            bgcolor: '#f093fb',
                            color: 'white',
                            fontWeight: 'bold',
                            mr: 1
                          }}
                        />
                        <Badge
                          badgeContent={company.locations.filter(l => l.isActive).length}
                          color="success"
                          sx={{ mr: 1 }}
                        >
                          <Box />
                        </Badge>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog("add", "location", undefined, company.id)}
                          sx={{ color: '#f093fb' }}
                        >
                          <AddIcon />
                        </IconButton>
                      </Box>
                    </TableCell>

                    {/* Users */}
                    <TableCell sx={{ py: 3 }}>
                      <Box display="flex" alignItems="center">
                        <PersonIcon sx={{ color: '#4facfe', mr: 1 }} />
                        <Chip
                          label={`${company.users.length} USER${company.users.length !== 1 ? 'S' : ''}`}
                          sx={{
                            bgcolor: '#4facfe',
                            color: 'white',
                            fontWeight: 'bold',
                            mr: 1
                          }}
                        />
                        <Badge
                          badgeContent={company.users.filter(u => u.isActive).length}
                          color="success"
                          sx={{ mr: 1 }}
                        >
                          <Box />
                        </Badge>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog("add", "user", undefined, company.id)}
                          sx={{ color: '#4facfe' }}
                        >
                          <AddIcon />
                        </IconButton>
                      </Box>
                    </TableCell>

                    {/* Actions */}
                    <TableCell sx={{ py: 3 }}>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog("edit", "company", company)}
                          sx={{ color: '#667eea' }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => {
                            if (window.confirm(
                              `⚠️ DELETE COMPANY WARNING ⚠️\n\n` +
                              `Are you sure you want to delete "${company.name}"?\n\n` +
                              `This will permanently delete:\n` +
                              `• The company and all its data\n` +
                              `• ${company.locations?.length || 0} associated location(s)\n` +
                              `• ${company.users?.length || 0} associated user(s)\n\n` +
                              `⚠️ THIS ACTION CANNOT BE UNDONE! ⚠️\n\n` +
                              `Type "DELETE" in the next prompt to confirm.`
                            )) {
                              const confirmation = window.prompt(
                                `To confirm deletion of "${company.name}", please type "DELETE" (in capital letters):`
                              );
                              if (confirmation === "DELETE") {
                                handleDelete(company.id, "company");
                              } else {
                                alert("Deletion cancelled - confirmation text did not match.");
                              }
                            }
                          }}
                          sx={{ color: '#f44336' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={async (e) => {
                            e.stopPropagation();
                            const menu = document.createElement('div');
                            // Simple menu implementation
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>

                  {/* Expanded Row Content */}
                  <TableRow>
                    <TableCell colSpan={5} sx={{ p: 0, border: 0 }}>
                      <Collapse in={expandedCompanies.has(company.id)}>
                        <Box sx={{ p: 3, bgcolor: '#fafafa' }}>
                          
                          {/* Locations Table */}
                          {company.locations.length > 0 && (
                            <Box sx={{ mb: 4 }}>
                              <Typography variant="h6" color="primary" gutterBottom sx={{ mb: 2 }}>
                                📍 Locations ({company.locations.length})
                              </Typography>
                              <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 2 }}>
                                <Table size="small">
                                  <TableHead>
                                    <TableRow sx={{ bgcolor: '#f093fb' }}>
                                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Location Name</TableCell>
                                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Address</TableCell>
                                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Contact</TableCell>
                                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Manager</TableCell>
                                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {company.locations.map((location) => (
                                      <TableRow key={location.id} sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}>
                                        <TableCell>
                                          <Typography variant="subtitle2" fontWeight="bold">
                                            {location.name}
                                          </Typography>
                                        </TableCell>
                                        <TableCell>
                                          <Typography variant="body2">
                                            {location.address}, {location.city}, {location.state} {location.postcode}
                                          </Typography>
                                        </TableCell>
                                        <TableCell>
                                          <Stack spacing={0.5}>
                                            {location.phone && (
                                              <Typography variant="caption">
                                                📞 {location.phone}
                                              </Typography>
                                            )}
                                            {location.email && (
                                              <Typography variant="caption">
                                                ✉️ {location.email}
                                              </Typography>
                                            )}
                                            {!location.phone && !location.email && (
                                              <Typography variant="caption" color="text.secondary">
                                                No contact info
                                              </Typography>
                                            )}
                                          </Stack>
                                        </TableCell>
                                        <TableCell>
                                          <Typography variant="body2">
                                            {location.manager || "No manager assigned"}
                                          </Typography>
                                        </TableCell>
                                        <TableCell>
                                          <Chip
                                            label={location.isActive ? "Active" : "Inactive"}
                                            color={location.isActive ? "success" : "error"}
                                            size="small"
                                          />
                                        </TableCell>
                                        <TableCell>
                                          <Stack direction="row" spacing={1}>
                                            <IconButton
                                              size="small"
                                              onClick={() => handleOpenDialog("edit", "location", location, company.id)}
                                              color="primary"
                                            >
                                              <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                              size="small"
                                              onClick={() => handleDelete(location.id, "location", company.id)}
                                              color="error"
                                            >
                                              <DeleteIcon fontSize="small" />
                                            </IconButton>
                                          </Stack>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Box>
                          )}

                          {/* Users Table */}
                          {company.users.length > 0 && (
                            <Box>
                              <Typography variant="h6" color="primary" gutterBottom sx={{ mb: 2 }}>
                                👥 Users ({company.users.length})
                              </Typography>
                              <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 2 }}>
                                <Table size="small">
                                  <TableHead>
                                    <TableRow sx={{ bgcolor: '#4facfe' }}>
                                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Contact</TableCell>
                                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Role</TableCell>
                                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Assigned Locations</TableCell>
                                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {company.users.map((user) => (
                                      <TableRow key={user.id} sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}>
                                        <TableCell>
                                          <Typography variant="subtitle2" fontWeight="bold">
                                            {user.firstName} {user.lastName}
                                          </Typography>
                                        </TableCell>
                                        <TableCell>
                                          <Stack spacing={0.5}>
                                            <Typography variant="caption">
                                              ✉️ {user.email}
                                            </Typography>
                                            {user.phone && (
                                              <Typography variant="caption">
                                                📞 {user.phone}
                                              </Typography>
                                            )}
                                          </Stack>
                                        </TableCell>
                                        <TableCell>
                                          <Chip
                                            label={user.role}
                                            size="small"
                                            sx={{
                                              bgcolor: getUserRoleColor(user.role),
                                              color: "white",
                                            }}
                                          />
                                        </TableCell>
                                        <TableCell>
                                          <Box sx={{ maxWidth: 200 }}>
                                            {user.assignedLocations.length > 0 ? (
                                              <Stack direction="row" spacing={0.5} flexWrap="wrap">
                                                {user.assignedLocations.slice(0, 2).map((location, index) => (
                                                  <Chip
                                                    key={index}
                                                    label={location}
                                                    size="small"
                                                    variant="outlined"
                                                  />
                                                ))}
                                                {user.assignedLocations.length > 2 && (
                                                  <Chip
                                                    label={`+${user.assignedLocations.length - 2} more`}
                                                    size="small"
                                                    variant="outlined"
                                                    color="primary"
                                                  />
                                                )}
                                              </Stack>
                                            ) : (
                                              <Typography variant="caption" color="text.secondary">
                                                No locations assigned
                                              </Typography>
                                            )}
                                          </Box>
                                        </TableCell>
                                        <TableCell>
                                          <Chip
                                            label={user.isActive ? "Active" : "Inactive"}
                                            color={user.isActive ? "success" : "error"}
                                            size="small"
                                          />
                                        </TableCell>
                                        <TableCell>
                                          <Stack direction="row" spacing={1}>
                                            <IconButton
                                              size="small"
                                              onClick={() => handleOpenDialog("edit", "user", user)}
                                              color="primary"
                                            >
                                              <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                              size="small"
                                              onClick={() => handleDelete(user.id, "user")}
                                              color="error"
                                            >
                                              <DeleteIcon fontSize="small" />
                                            </IconButton>
                                          </Stack>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Box>
                          )}

                          {/* Empty States */}
                          {company.locations.length === 0 && company.users.length === 0 && (
                            <Box textAlign="center" py={4}>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                No locations or users added yet
                              </Typography>
                              <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
                                <Button
                                  variant="outlined"
                                  startIcon={<AddIcon />}
                                  onClick={() => handleOpenDialog("add", "location", undefined, company.id)}
                                  size="small"
                                >
                                  Add Location
                                </Button>
                                <Button
                                  variant="outlined"
                                  startIcon={<AddIcon />}
                                  onClick={() => handleOpenDialog("add", "user", undefined, company.id)}
                                  size="small"
                                >
                                  Add User
                                </Button>
                              </Stack>
                            </Box>
                          )}

                          {company.locations.length === 0 && company.users.length > 0 && (
                            <Box textAlign="center" py={2} mb={2}>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                No locations added yet
                              </Typography>
                              <Button
                                variant="outlined"
                                startIcon={<AddIcon />}
                                onClick={() => handleOpenDialog("add", "location", undefined, company.id)}
                                size="small"
                              >
                                Add Location
                              </Button>
                            </Box>
                          )}

                          {company.locations.length > 0 && company.users.length === 0 && (
                            <Box textAlign="center" py={2}>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                No users added yet
                              </Typography>
                              <Button
                                variant="outlined"
                                startIcon={<AddIcon />}
                                onClick={() => handleOpenDialog("add", "user", undefined, company.id)}
                                size="small"
                              >
                                Add User
                              </Button>
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
      </Card>

      {/* Empty State */}
      {filteredCompanies.length === 0 && (
        <Box textAlign="center" py={8}>
          <BusinessIcon sx={{ fontSize: 80, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No companies found
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {searchTerm || selectedRole || showInactiveOnly
              ? "Try adjusting your filters"
              : "Get started by adding your first company"}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog("add", "company")}
            size="large"
            sx={{ borderRadius: 2 }}
          >
            Add Company
          </Button>
        </Box>
      )}

      {/* Dialog for Add/Edit */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle
          sx={{
            pb: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box display="flex" alignItems="center">
            {entityType === "company" && <CompanyIcon sx={{ mr: 2 }} />}
            {entityType === "location" && <PlaceIcon sx={{ mr: 2 }} />}
            {entityType === "user" && <PersonIcon sx={{ mr: 2 }} />}
            <Box>
              <Typography variant="h6">
                {dialogMode === "add" ? "Add" : "Edit"}{" "}
                {entityType.charAt(0).toUpperCase() + entityType.slice(1)}
              </Typography>
              {dialogMode === "edit" && (
                <Typography variant="body2" color="text.secondary">
                  {entityType === "company" && selectedCompany && `Editing: ${selectedCompany.name} (ID: ${selectedCompany.id})`}
                  {entityType === "location" && selectedLocation && `Editing: ${selectedLocation.name} (ID: ${selectedLocation.id})`}
                  {entityType === "user" && selectedUser && `Editing: ${selectedUser.firstName} ${selectedUser.lastName} (ID: ${selectedUser.id})`}
                </Typography>
              )}
            </Box>
          </Box>
          <IconButton onClick={handleCloseDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {/* Company Form */}
          {entityType === "company" && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Company Name *"
                  value={companyForm.name}
                  onChange={(e) =>
                    setCompanyForm({ ...companyForm, name: e.target.value })
                  }
                  required
                  error={!companyForm.name.trim()}
                  helperText={!companyForm.name.trim() ? "Company name is required" : ""}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Website"
                  value={companyForm.website}
                  onChange={(e) =>
                    setCompanyForm({ ...companyForm, website: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Address *"
                  value={companyForm.address}
                  onChange={(e) =>
                    setCompanyForm({ ...companyForm, address: e.target.value })
                  }
                  required
                  error={!companyForm.address.trim()}
                  helperText={!companyForm.address.trim() ? "Address is required" : ""}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="State *"
                  value={companyForm.state}
                  onChange={(e) =>
                    setCompanyForm({ ...companyForm, state: e.target.value })
                  }
                  required
                  error={!companyForm.state.trim()}
                  helperText={!companyForm.state.trim() ? "State is required" : ""}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Post Code *"
                  value={companyForm.postcode}
                  onChange={(e) =>
                    setCompanyForm({ ...companyForm, postcode: e.target.value })
                  }
                  required
                  error={!companyForm.postcode.trim()}
                  helperText={!companyForm.postcode.trim() ? "Post code is required" : ""}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone *"
                  value={companyForm.phone}
                  onChange={(e) =>
                    setCompanyForm({ ...companyForm, phone: e.target.value })
                  }
                  required
                  error={!companyForm.phone.trim()}
                  helperText={!companyForm.phone.trim() ? "Phone is required" : ""}
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

              {/* Delete Section for Edit Mode */}
              {dialogMode === "edit" && selectedCompany && (
                <Grid item xs={12}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      mt: 2, 
                      border: '1px solid #f44336', 
                      borderRadius: 2,
                      bgcolor: '#ffebee' 
                    }}
                  >
                    <Typography variant="h6" color="error" gutterBottom>
                      ⚠️ Danger Zone
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Permanently delete this company and all associated data. This action cannot be undone.
                    </Typography>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => {
                        if (window.confirm(
                          `Are you sure you want to delete "${selectedCompany.name}"?\n\n` +
                          `This will permanently delete:\n` +
                          `• The company and all its data\n` +
                          `• ${selectedCompany.locations?.length || 0} associated location(s)\n` +
                          `• ${selectedCompany.users?.length || 0} associated user(s)\n\n` +
                          `This action CANNOT be undone!`
                        )) {
                          handleDelete(selectedCompany.id, "company");
                          handleCloseDialog();
                        }
                      }}
                      sx={{ borderRadius: 2 }}
                    >
                      Delete Company
                    </Button>
                  </Paper>
                </Grid>
              )}
            </Grid>
          )}

          {/* Location Form */}
          {entityType === "location" && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {/* Hidden Company ID field */}
              <input 
                type="hidden" 
                value={locationForm.company_id} 
                onChange={() => {}} // Read-only hidden field
              />
              
              {/* Debug info for company ID (remove in production) */}
              {locationForm.company_id && (
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ mb: 1 }}>
                    {dialogMode === "add" ? "Creating" : "Updating"} location for Company ID: {locationForm.company_id}
                    <br />
                    Will be sent as company_id: {locationForm.company_id}
                    {dialogMode === "edit" && selectedLocation && (
                      <>
                        <br />
                        Clean location ID for API: {selectedLocation.id}
                        <br />
                        API endpoint: /stores/{selectedLocation.id}
                      </>
                    )}
                  </Alert>
                </Grid>
              )}
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location Name *"
                  value={locationForm.name}
                  onChange={(e) =>
                    setLocationForm({ ...locationForm, name: e.target.value })
                  }
                  required
                  error={!locationForm.name.trim()}
                  helperText={!locationForm.name.trim() ? "Location name is required" : ""}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Manager"
                  value={locationForm.manager}
                  onChange={(e) =>
                    setLocationForm({ ...locationForm, manager: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address *"
                  value={locationForm.address}
                  onChange={(e) =>
                    setLocationForm({ ...locationForm, address: e.target.value })
                  }
                  required
                  error={!locationForm.address.trim()}
                  helperText={!locationForm.address.trim() ? "Address is required" : ""}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="City *"
                  value={locationForm.city}
                  onChange={(e) =>
                    setLocationForm({ ...locationForm, city: e.target.value })
                  }
                  required
                  error={!locationForm.city.trim()}
                  helperText={!locationForm.city.trim() ? "City is required" : ""}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="State *"
                  value={locationForm.state}
                  onChange={(e) =>
                    setLocationForm({ ...locationForm, state: e.target.value })
                  }
                  required
                  error={!locationForm.state.trim()}
                  helperText={!locationForm.state.trim() ? "State is required" : ""}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Post Code *"
                  value={locationForm.postcode}
                  onChange={(e) =>
                    setLocationForm({ ...locationForm, postcode: e.target.value })
                  }
                  required
                  error={!locationForm.postcode.trim()}
                  helperText={!locationForm.postcode.trim() ? "Post code is required" : ""}
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

          {/* User Form */}
          {entityType === "user" && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {/* Hidden Company ID field */}
              <input 
                type="hidden" 
                value={userForm.company_id} 
                onChange={() => {}} // Read-only hidden field
              />
              
              {/* Debug info for company ID (remove in production) */}
              {userForm.company_id && (
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ mb: 1 }}>
                    Creating user for Company ID: {userForm.company_id}
                  </Alert>
                </Grid>
              )}
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name *"
                  value={userForm.firstName}
                  onChange={(e) =>
                    setUserForm({ ...userForm, firstName: e.target.value })
                  }
                  required
                  error={!userForm.firstName.trim()}
                  helperText={!userForm.firstName.trim() ? "First name is required" : ""}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name *"
                  value={userForm.lastName}
                  onChange={(e) =>
                    setUserForm({ ...userForm, lastName: e.target.value })
                  }
                  required
                  error={!userForm.lastName.trim()}
                  helperText={!userForm.lastName.trim() ? "Last name is required" : ""}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email *"
                  type="email"
                  value={userForm.email}
                  onChange={(e) =>
                    setUserForm({ ...userForm, email: e.target.value })
                  }
                  required
                  error={!userForm.email.trim()}
                  helperText={!userForm.email.trim() ? "Email is required" : ""}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone *"
                  value={userForm.phone}
                  onChange={(e) =>
                    setUserForm({ ...userForm, phone: e.target.value })
                  }
                  required
                  error={!userForm.phone.trim()}
                  helperText={!userForm.phone.trim() ? "Phone is required" : ""}
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
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {companies.flatMap(company => 
                      company.locations.map(location => (
                        <MenuItem key={location.id} value={location.name}>
                          <Checkbox 
                            checked={userForm.assignedLocations.indexOf(location.name) > -1} 
                          />
                          <ListItemText primary={location.name} />
                        </MenuItem>
                      ))
                    )}
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
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
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

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={
              (entityType === "company" && (!companyForm.name.trim() || !companyForm.phone.trim() || !companyForm.address.trim() || !companyForm.state.trim() || !companyForm.postcode.trim())) ||
              (entityType === "location" && (
                !locationForm.name.trim() || 
                !locationForm.address.trim() || 
                !locationForm.city.trim() || 
                !locationForm.state.trim() || 
                !locationForm.postcode.trim() || 
                !locationForm.company_id.trim() // Always require company ID for locations
              )) ||
              (entityType === "user" && (!userForm.firstName.trim() || !userForm.lastName.trim() || !userForm.email.trim() || !userForm.phone.trim() || (dialogMode === "add" && !userForm.company_id.trim())))
            }
          >
            {dialogMode === "add" ? "Create" : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CompanyLocationManager;
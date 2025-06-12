import React, { useState, useEffect, useMemo } from 'react';
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
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';

// Icons
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import CompanyIcon from '@mui/icons-material/Domain';
import PlaceIcon from '@mui/icons-material/Place';
import PersonIcon from '@mui/icons-material/Person';
import SecurityIcon from '@mui/icons-material/Security';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import GroupIcon from '@mui/icons-material/Group';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import FilterListIcon from '@mui/icons-material/FilterList';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

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
  industry?: string;
  locations: Location[];
  users: User[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type DialogMode = 'add' | 'edit' | 'view' | null;
type EntityType = 'company' | 'location' | 'user';
type ViewMode = 'table' | 'cards';

const AVAILABLE_PERMISSIONS: Permission[] = [
  { id: 'excel_upload', name: 'Excel Upload', description: 'Upload and manage Excel files', category: 'Data Management' },
  { id: 'sales_split', name: 'Sales Split', description: 'Access Sales Split dashboard', category: 'Analytics' },
  { id: 'product_mix', name: 'Product Mix', description: 'Access Product Mix dashboard', category: 'Analytics' },
  { id: 'finance', name: 'Finance', description: 'Access Finance dashboard', category: 'Financial' },
  { id: 'sales_wide', name: 'Sales Wide', description: 'Access Sales Wide dashboard', category: 'Sales' },
  { id: 'user_management', name: 'User Management', description: 'Manage users and permissions', category: 'Administration' },
  { id: 'location_management', name: 'Location Management', description: 'Manage locations', category: 'Administration' },
  { id: 'reporting', name: 'Reporting', description: 'Generate and view reports', category: 'Analytics' }
];

const USER_ROLES = [
  { value: 'Administrator', label: 'Administrator', color: '#f44336' },
  { value: 'Manager', label: 'Manager', color: '#ff9800' },
  { value: 'Supervisor', label: 'Supervisor', color: '#2196f3' },
  { value: 'Staff', label: 'Staff', color: '#4caf50' },
  { value: 'Analyst', label: 'Analyst', color: '#9c27b0' },
  { value: 'Viewer', label: 'Viewer', color: '#607d8b' }
];

const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail',
  'Education', 'Construction', 'Transportation', 'Energy', 'Other'
];

const CompanyLocationManager: React.FC = () => {
  const theme = useTheme();
  
  // State for companies and locations
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());
  const [expandedLocations, setExpandedLocations] = useState<Set<string>>(new Set());
  
  // UI States
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [showInactiveOnly, setShowInactiveOnly] = useState(false);
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [entityType, setEntityType] = useState<EntityType>('company');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Form states
  const [companyForm, setCompanyForm] = useState({
    name: '',
    city: '',
    state: '',
    postCode: '',
    phone: '',
    email: '',
    website: '',
    industry: '',
    isActive: true
  });
  
  const [locationForm, setLocationForm] = useState({
    name: '',
    city: '',
    state: '',
    postCode: '',
    phone: '',
    email: '',
    manager: '',
    isActive: true
  });

  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: '',
    permissions: [] as string[],
    assignedLocations: [] as string[],
    isActive: true
  });
  
  // UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [selectedItemType, setSelectedItemType] = useState<EntityType>('company');
  
  // Notification states
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Sample data initialization with enhanced structure
  useEffect(() => {
    const sampleCompanies: Company[] = [
      {
        id: '1',
        name: 'TechCorp Solutions',
        city: 'San Francisco',
        state: 'CA',
        postCode: '94102',
        phone: '(555) 123-4567',
        email: 'contact@techcorp.com',
        website: 'https://techcorp.com',
        industry: 'Technology',
        isActive: true,
        createdAt: new Date('2023-01-15'),
        updatedAt: new Date('2024-12-10'),
        locations: [
          {
            id: '1-1',
            name: 'TechCorp HQ',
            city: 'San Francisco',
            state: 'CA',
            postCode: '94102',
            phone: '(555) 123-4567',
            email: 'hq@techcorp.com',
            isActive: true,
            manager: 'u1-1',
            createdAt: new Date('2023-01-15'),
            updatedAt: new Date('2024-12-10')
          },
          {
            id: '1-2',
            name: 'TechCorp East',
            city: 'New York',
            state: 'NY',
            postCode: '10001',
            phone: '(555) 234-5678',
            email: 'east@techcorp.com',
            isActive: true,
            manager: 'u1-2',
            createdAt: new Date('2023-06-20'),
            updatedAt: new Date('2024-12-10')
          },
          {
            id: '1-3',
            name: 'TechCorp West',
            city: 'Los Angeles',
            state: 'CA',
            postCode: '90210',
            phone: '(555) 345-6789',
            email: 'west@techcorp.com',
            isActive: true,
            createdAt: new Date('2023-08-10'),
            updatedAt: new Date('2024-12-10')
          }
        ],
        users: [
          {
            id: 'u1-1',
            name: 'John Smith',
            email: 'john.smith@techcorp.com',
            role: 'Manager',
            permissions: ['excel_upload', 'sales_split', 'product_mix', 'user_management'],
            assignedLocations: ['1-1', '1-2'],
            isActive: true,
            lastLogin: new Date('2024-12-09'),
            createdAt: new Date('2023-02-01')
          },
          {
            id: 'u1-2',
            name: 'Sarah Wilson',
            email: 'sarah.wilson@techcorp.com',
            role: 'Administrator',
            permissions: ['excel_upload', 'sales_split', 'product_mix', 'finance', 'sales_wide', 'user_management', 'location_management', 'reporting'],
            assignedLocations: ['1-1', '1-2', '1-3'],
            isActive: true,
            lastLogin: new Date('2024-12-10'),
            createdAt: new Date('2023-02-15')
          },
          {
            id: 'u1-3',
            name: 'Mike Johnson',
            email: 'mike.johnson@techcorp.com',
            role: 'Staff',
            permissions: ['sales_split', 'product_mix'],
            assignedLocations: ['1-3'],
            isActive: true,
            lastLogin: new Date('2024-12-08'),
            createdAt: new Date('2023-05-20')
          },
          {
            id: 'u1-4',
            name: 'Lisa Chen',
            email: 'lisa.chen@techcorp.com',
            role: 'Analyst',
            permissions: ['sales_split', 'product_mix', 'reporting'],
            assignedLocations: ['1-1', '1-3'],
            isActive: false,
            lastLogin: new Date('2024-11-15'),
            createdAt: new Date('2023-08-10')
          }
        ]
      },
      {
        id: '2',
        name: 'Green Energy Inc',
        city: 'Austin',
        state: 'TX',
        postCode: '73301',
        phone: '(555) 987-6543',
        email: 'info@greenenergy.com',
        website: 'https://greenenergy.com',
        industry: 'Energy',
        isActive: true,
        createdAt: new Date('2023-03-10'),
        updatedAt: new Date('2024-12-10'),
        locations: [
          {
            id: '2-1',
            name: 'Green Energy Main',
            city: 'Austin',
            state: 'TX',
            postCode: '73301',
            phone: '(555) 987-6543',
            email: 'main@greenenergy.com',
            isActive: true,
            createdAt: new Date('2023-03-10'),
            updatedAt: new Date('2024-12-10')
          },
          {
            id: '2-2',
            name: 'Solar Division',
            city: 'Houston',
            state: 'TX',
            postCode: '77001',
            phone: '(555) 876-5432',
            email: 'solar@greenenergy.com',
            isActive: true,
            createdAt: new Date('2023-07-15'),
            updatedAt: new Date('2024-12-10')
          }
        ],
        users: [
          {
            id: 'u2-1',
            name: 'David Brown',
            email: 'david.brown@greenenergy.com',
            role: 'Manager',
            permissions: ['excel_upload', 'sales_split', 'finance'],
            assignedLocations: ['2-1', '2-2'],
            isActive: true,
            lastLogin: new Date('2024-12-09'),
            createdAt: new Date('2023-04-01')
          }
        ]
      }
    ];
    
    setCompanies(sampleCompanies);
    setFilteredCompanies(sampleCompanies);
  }, []);

  // Enhanced filtering logic
  const filteredAndSortedCompanies = useMemo(() => {
    let filtered = companies;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.locations.some(location =>
          location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          location.city.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        company.users.some(user =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.role.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    // Apply industry filter
    if (selectedIndustry) {
      filtered = filtered.filter(company => company.industry === selectedIndustry);
    }
    
    // Apply role filter
    if (selectedRole) {
      filtered = filtered.filter(company =>
        company.users.some(user => user.role === selectedRole)
      );
    }
    
    // Apply active/inactive filter
    if (showInactiveOnly) {
      filtered = filtered.filter(company => !company.isActive);
    }
    
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [companies, searchTerm, selectedIndustry, selectedRole, showInactiveOnly]);

  useEffect(() => {
    setFilteredCompanies(filteredAndSortedCompanies);
  }, [filteredAndSortedCompanies]);

  // Helper functions
  const showNotification = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setNotification({ open: true, message, severity });
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const resetForms = () => {
    setCompanyForm({
      name: '',
      city: '',
      state: '',
      postCode: '',
      phone: '',
      email: '',
      website: '',
      industry: '',
      isActive: true
    });
    
    setLocationForm({
      name: '',
      city: '',
      state: '',
      postCode: '',
      phone: '',
      email: '',
      manager: '',
      isActive: true
    });

    setUserForm({
      name: '',
      email: '',
      role: '',
      permissions: [],
      assignedLocations: [],
      isActive: true
    });
  };

  // Get role color
  const getRoleColor = (role: string) => {
    const roleConfig = USER_ROLES.find(r => r.value === role);
    return roleConfig?.color || '#9e9e9e';
  };

  // Get users assigned to a specific location
  const getUsersForLocation = (companyId: string, locationId: string) => {
    const company = companies.find(c => c.id === companyId);
    if (!company) return [];
    
    return company.users.filter(user => 
      user.assignedLocations.includes(locationId) && user.isActive
    );
  };

  // Get location name by ID
  const getLocationName = (companyId: string, locationId: string) => {
    const company = companies.find(c => c.id === companyId);
    if (!company) return 'Unknown Location';
    
    const location = company.locations.find(l => l.id === locationId);
    return location ? location.name : 'Unknown Location';
  };

  // Get user name by ID
  const getUserName = (companyId: string, userId: string) => {
    const company = companies.find(c => c.id === companyId);
    if (!company) return 'Unknown User';
    
    const user = company.users.find(u => u.id === userId);
    return user ? user.name : 'Unknown User';
  };

  // Toggle functions
  const toggleCompanyExpansion = (companyId: string) => {
    setExpandedCompanies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(companyId)) {
        newSet.delete(companyId);
      } else {
        newSet.add(companyId);
      }
      return newSet;
    });
  };

  const toggleLocationExpansion = (locationId: string) => {
    setExpandedLocations(prev => {
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
    setDialogMode('add');
    setEntityType('company');
    resetForms();
    setDialogOpen(true);
  };

  const handleEditCompany = (company: Company) => {
    setDialogMode('edit');
    setEntityType('company');
    setSelectedCompany(company);
    setCompanyForm({
      name: company.name,
      city: company.city,
      state: company.state,
      postCode: company.postCode,
      phone: company.phone,
      email: company.email || '',
      website: company.website || '',
      industry: company.industry || '',
      isActive: company.isActive
    });
    setDialogOpen(true);
  };

  const handleDeleteCompany = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    if (company && window.confirm(`Are you sure you want to delete "${company.name}"? This will also delete all its locations and users.`)) {
      setCompanies(prev => prev.filter(c => c.id !== companyId));
      showNotification('Company deleted successfully', 'success');
    }
  };

  const handleSaveCompany = () => {
    if (!companyForm.name.trim() || !companyForm.city.trim() || !companyForm.state.trim() || 
        !companyForm.postCode.trim() || !companyForm.phone.trim()) {
      showNotification('Name, city, state, post code, and phone are required', 'error');
      return;
    }

    const now = new Date();
    
    if (dialogMode === 'add') {
      const newCompany: Company = {
        id: generateId(),
        name: companyForm.name,
        city: companyForm.city,
        state: companyForm.state,
        postCode: companyForm.postCode,
        phone: companyForm.phone,
        email: companyForm.email,
        website: companyForm.website,
        industry: companyForm.industry,
        locations: [],
        users: [],
        isActive: companyForm.isActive,
        createdAt: now,
        updatedAt: now
      };
      
      setCompanies(prev => [...prev, newCompany]);
      showNotification('Company added successfully', 'success');
    } else if (dialogMode === 'edit' && selectedCompany) {
      setCompanies(prev => prev.map(company =>
        company.id === selectedCompany.id
          ? {
              ...company,
              name: companyForm.name,
              city: companyForm.city,
              state: companyForm.state,
              postCode: companyForm.postCode,
              phone: companyForm.phone,
              email: companyForm.email,
              website: companyForm.website,
              industry: companyForm.industry,
              isActive: companyForm.isActive,
              updatedAt: now
            }
          : company
      ));
      showNotification('Company updated successfully', 'success');
    }
    
    setDialogOpen(false);
    resetForms();
  };

  // Location CRUD operations
  const handleAddLocation = (companyId: string) => {
    setDialogMode('add');
    setEntityType('location');
    setSelectedCompany(companies.find(c => c.id === companyId) || null);
    resetForms();
    setDialogOpen(true);
  };

  const handleEditLocation = (companyId: string, location: Location) => {
    setDialogMode('edit');
    setEntityType('location');
    setSelectedCompany(companies.find(c => c.id === companyId) || null);
    setSelectedLocation(location);
    setLocationForm({
      name: location.name,
      city: location.city,
      state: location.state,
      postCode: location.postCode,
      phone: location.phone || '',
      email: location.email || '',
      manager: location.manager || '',
      isActive: location.isActive
    });
    setDialogOpen(true);
  };

  const handleDeleteLocation = (companyId: string, locationId: string) => {
    const location = companies.find(c => c.id === companyId)?.locations.find(l => l.id === locationId);
    if (location && window.confirm(`Are you sure you want to delete "${location.name}"?`)) {
      setCompanies(prev => prev.map(company =>
        company.id === companyId
          ? {
              ...company,
              locations: company.locations.filter(l => l.id !== locationId),
              users: company.users.map(user => ({
                ...user,
                assignedLocations: user.assignedLocations.filter(locId => locId !== locationId)
              })),
              updatedAt: new Date()
            }
          : company
      ));
      showNotification('Location deleted successfully', 'success');
    }
  };

  const handleSaveLocation = () => {
    if (!locationForm.name.trim() || !locationForm.city.trim() || !locationForm.state.trim() || 
        !locationForm.postCode.trim() || !selectedCompany) {
      showNotification('Name, city, state, and post code are required', 'error');
      return;
    }

    const now = new Date();
    
    if (dialogMode === 'add') {
      const newLocation: Location = {
        id: generateId(),
        name: locationForm.name,
        city: locationForm.city,
        state: locationForm.state,
        postCode: locationForm.postCode,
        phone: locationForm.phone,
        email: locationForm.email,
        manager: locationForm.manager,
        isActive: locationForm.isActive,
        createdAt: now,
        updatedAt: now
      };
      
      setCompanies(prev => prev.map(company =>
        company.id === selectedCompany.id
          ? {
              ...company,
              locations: [...company.locations, newLocation],
              updatedAt: now
            }
          : company
      ));
      showNotification('Location added successfully', 'success');
    } else if (dialogMode === 'edit' && selectedLocation) {
      setCompanies(prev => prev.map(company =>
        company.id === selectedCompany.id
          ? {
              ...company,
              locations: company.locations.map(location =>
                location.id === selectedLocation.id
                  ? {
                      ...location,
                      name: locationForm.name,
                      city: locationForm.city,
                      state: locationForm.state,
                      postCode: locationForm.postCode,
                      phone: locationForm.phone,
                      email: locationForm.email,
                      manager: locationForm.manager,
                      isActive: locationForm.isActive,
                      updatedAt: now
                    }
                  : location
              ),
              updatedAt: now
            }
          : company
      ));
      showNotification('Location updated successfully', 'success');
    }
    
    setDialogOpen(false);
    resetForms();
  };

  // User CRUD operations
  const handleAddUser = (companyId: string) => {
    setDialogMode('add');
    setEntityType('user');
    setSelectedCompany(companies.find(c => c.id === companyId) || null);
    resetForms();
    setDialogOpen(true);
  };

  const handleEditUser = (companyId: string, user: User) => {
    setDialogMode('edit');
    setEntityType('user');
    setSelectedCompany(companies.find(c => c.id === companyId) || null);
    setSelectedUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      assignedLocations: user.assignedLocations,
      isActive: user.isActive
    });
    setDialogOpen(true);
  };

  const handleDeleteUser = (companyId: string, userId: string) => {
    const user = companies.find(c => c.id === companyId)?.users.find(u => u.id === userId);
    if (user && window.confirm(`Are you sure you want to delete user "${user.name}"?`)) {
      setCompanies(prev => prev.map(company =>
        company.id === companyId
          ? {
              ...company,
              users: company.users.filter(u => u.id !== userId),
              locations: company.locations.map(location => ({
                ...location,
                manager: location.manager === userId ? undefined : location.manager
              })),
              updatedAt: new Date()
            }
          : company
      ));
      showNotification('User deleted successfully', 'success');
    }
  };

  const handleSaveUser = () => {
    if (!userForm.name.trim() || !userForm.email.trim() || !userForm.role.trim() || !selectedCompany) {
      showNotification('Name, email, and role are required', 'error');
      return;
    }

    const now = new Date();
    
    if (dialogMode === 'add') {
      const newUser: User = {
        id: generateId(),
        name: userForm.name,
        email: userForm.email,
        role: userForm.role,
        permissions: userForm.permissions,
        assignedLocations: userForm.assignedLocations,
        isActive: userForm.isActive,
        createdAt: now
      };
      
      setCompanies(prev => prev.map(company =>
        company.id === selectedCompany.id
          ? {
              ...company,
              users: [...company.users, newUser],
              updatedAt: now
            }
          : company
      ));
      showNotification('User added successfully', 'success');
    } else if (dialogMode === 'edit' && selectedUser) {
      setCompanies(prev => prev.map(company =>
        company.id === selectedCompany.id
          ? {
              ...company,
              users: company.users.map(user =>
                user.id === selectedUser.id
                  ? {
                      ...user,
                      name: userForm.name,
                      email: userForm.email,
                      role: userForm.role,
                      permissions: userForm.permissions,
                      assignedLocations: userForm.assignedLocations,
                      isActive: userForm.isActive
                    }
                  : user
              ),
              updatedAt: now
            }
          : company
      ));
      showNotification('User updated successfully', 'success');
    }
    
    setDialogOpen(false);
    resetForms();
  };

  const handlePermissionToggle = (permissionId: string) => {
    setUserForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const handleLocationAssignmentToggle = (locationId: string) => {
    setUserForm(prev => ({
      ...prev,
      assignedLocations: prev.assignedLocations.includes(locationId)
        ? prev.assignedLocations.filter(l => l !== locationId)
        : [...prev.assignedLocations, locationId]
    }));
  };

  const getStatsData = () => {
    const totalCompanies = companies.length;
    const activeCompanies = companies.filter(c => c.isActive).length;
    const totalLocations = companies.reduce((acc, company) => acc + company.locations.length, 0);
    const activeLocations = companies.reduce((acc, company) => 
      acc + company.locations.filter(l => l.isActive).length, 0);
    const totalUsers = companies.reduce((acc, company) => acc + company.users.length, 0);
    const activeUsers = companies.reduce((acc, company) => 
      acc + company.users.filter(u => u.isActive).length, 0);
    
    return {
      totalCompanies,
      activeCompanies,
      totalLocations,
      activeLocations,
      totalUsers,
      activeUsers
    };
  };

  const stats = getStatsData();

  // Group permissions by category
  const groupedPermissions = useMemo(() => {
    const grouped: { [key: string]: Permission[] } = {};
    AVAILABLE_PERMISSIONS.forEach(permission => {
      if (!grouped[permission.category]) {
        grouped[permission.category] = [];
      }
      grouped[permission.category].push(permission);
    });
    return grouped;
  }, []);

  return (
    <Box sx={{ p: 3, backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            fontWeight: 700,
            color: '#1a237e',
            mb: 1,
            background: 'linear-gradient(45deg, #1a237e 30%, #3f51b5 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Company & Location Management
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
          Comprehensive management of companies, locations, and user assignments
        </Typography>
        
        {/* Quick Stats */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip 
            icon={<TrendingUpIcon />} 
            label={`${stats.activeCompanies}/${stats.totalCompanies} Active Companies`}
            color="primary" 
            variant="outlined" 
          />
          <Chip 
            icon={<LocationOnIcon />} 
            label={`${stats.activeLocations} Active Locations`}
            color="secondary" 
            variant="outlined" 
          />
          <Chip 
            icon={<GroupIcon />} 
            label={`${stats.activeUsers} Active Users`}
            color="success" 
            variant="outlined" 
          />
        </Box>
      </Box>

      {/* Enhanced Action Bar with Filters */}
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
        <CardContent sx={{ pb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search companies, locations, users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
                }}
                size="small"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Industry</InputLabel>
                <Select
                  value={selectedIndustry}
                  label="Industry"
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">All Industries</MenuItem>
                  {INDUSTRIES.map((industry) => (
                    <MenuItem key={industry} value={industry}>{industry}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Role</InputLabel>
                <Select
                  value={selectedRole}
                  label="Role"
                  onChange={(e) => setSelectedRole(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">All Roles</MenuItem>
                  {USER_ROLES.map((role) => (
                    <MenuItem key={role.value} value={role.value}>{role.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showInactiveOnly}
                      onChange={(e) => setShowInactiveOnly(e.target.checked)}
                      size="small"
                    />
                  }
                  label="Inactive Only"
                  sx={{ m: 0 }}
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddCompany}
                fullWidth
                sx={{ 
                  py: 1,
                  borderRadius: 2,
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                }}
              >
                Add Company
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Enhanced Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ 
            borderRadius: 3, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.37)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.18)'
          }}>
            <CardContent sx={{ color: 'white', position: 'relative', overflow: 'hidden' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Box>
                  <Typography variant="h3" fontWeight="bold" sx={{ mb: 0.5 }}>
                    {stats.totalCompanies}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Companies
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={(stats.activeCompanies / stats.totalCompanies) * 100} 
                    sx={{ 
                      mt: 1, 
                      backgroundColor: 'rgba(255,255,255,0.3)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: 'rgba(255,255,255,0.8)'
                      }
                    }}
                  />
                </Box>
                <BusinessIcon sx={{ fontSize: 50, opacity: 0.8 }} />
              </Box>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {stats.activeCompanies} Active • {stats.totalCompanies - stats.activeCompanies} Inactive
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ 
            borderRadius: 3, 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            boxShadow: '0 8px 32px rgba(240, 147, 251, 0.37)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.18)'
          }}>
            <CardContent sx={{ color: 'white', position: 'relative', overflow: 'hidden' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Box>
                  <Typography variant="h3" fontWeight="bold" sx={{ mb: 0.5 }}>
                    {stats.totalLocations}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Locations
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={(stats.activeLocations / stats.totalLocations) * 100} 
                    sx={{ 
                      mt: 1, 
                      backgroundColor: 'rgba(255,255,255,0.3)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: 'rgba(255,255,255,0.8)'
                      }
                    }}
                  />
                </Box>
                <LocationOnIcon sx={{ fontSize: 50, opacity: 0.8 }} />
              </Box>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {stats.activeLocations} Active • {stats.totalLocations - stats.activeLocations} Inactive
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ 
            borderRadius: 3, 
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            boxShadow: '0 8px 32px rgba(79, 172, 254, 0.37)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.18)'
          }}>
            <CardContent sx={{ color: 'white', position: 'relative', overflow: 'hidden' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Box>
                  <Typography variant="h3" fontWeight="bold" sx={{ mb: 0.5 }}>
                    {stats.totalUsers}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Users
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={(stats.activeUsers / stats.totalUsers) * 100} 
                    sx={{ 
                      mt: 1, 
                      backgroundColor: 'rgba(255,255,255,0.3)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: 'rgba(255,255,255,0.8)'
                      }
                    }}
                  />
                </Box>
                <GroupIcon sx={{ fontSize: 50, opacity: 0.8 }} />
              </Box>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {stats.activeUsers} Active • {stats.totalUsers - stats.activeUsers} Inactive
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Companies Table */}
      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent sx={{ p: 0 }}>
          {filteredCompanies.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <CompanyIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No companies found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {searchTerm || selectedIndustry || selectedRole || showInactiveOnly
                  ? 'Try adjusting your filters' 
                  : 'Get started by adding your first company'}
              </Typography>
              {!searchTerm && !selectedIndustry && !selectedRole && !showInactiveOnly && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddCompany}
                  sx={{ borderRadius: 2 }}
                >
                  Add First Company
                </Button>
              )}
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                    <TableCell sx={{ width: 50, fontWeight: 'bold' }}></TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>Company Details</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>Contact & Industry</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>Locations</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>Users</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'primary.main', width: 120 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCompanies.map((company) => (
                    <React.Fragment key={company.id}>
                      {/* Company Row */}
                      <TableRow 
                        sx={{ 
                          '&:hover': { backgroundColor: '#f5f7fa' },
                          borderLeft: `4px solid ${company.isActive ? '#4caf50' : '#f44336'}`,
                          transition: 'all 0.2s ease-in-out'
                        }}
                      >
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => toggleCompanyExpansion(company.id)}
                            sx={{ 
                              transition: 'transform 0.2s',
                              transform: expandedCompanies.has(company.id) ? 'rotate(180deg)' : 'rotate(0deg)'
                            }}
                          >
                            <ExpandMoreIcon />
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Badge
                              badgeContent={company.isActive ? <CheckCircleIcon sx={{ fontSize: 12 }} /> : <ErrorIcon sx={{ fontSize: 12 }} />}
                              color={company.isActive ? 'success' : 'error'}
                              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            >
                              <Avatar sx={{ 
                                bgcolor: company.isActive ? 'primary.main' : 'grey.500',
                                width: 48,
                                height: 48
                              }}>
                                <BusinessIcon />
                              </Avatar>
                            </Badge>
                            <Box>
                              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 0.5 }}>
                                {company.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {company.city}, {company.state} {company.postCode}
                              </Typography>
                              {company.industry && (
                                <Chip 
                                  label={company.industry} 
                                  size="small" 
                                  variant="outlined" 
                                  sx={{ mt: 0.5, fontSize: '0.7rem' }}
                                />
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                              📞 {company.phone}
                            </Typography>
                            {company.email && (
                              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                ✉️ {company.email}
                              </Typography>
                            )}
                            {company.website && (
                              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                🌐 {company.website}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Badge badgeContent={company.locations.filter(l => l.isActive).length} color="primary">
                              <Chip
                                label={`${company.locations.length} location${company.locations.length !== 1 ? 's' : ''}`}
                                color="primary"
                                variant="outlined"
                                size="small"
                              />
                            </Badge>
                            <Tooltip title="Add Location">
                              <IconButton
                                size="small"
                                onClick={() => handleAddLocation(company.id)}
                                color="success"
                                sx={{ 
                                  '&:hover': { 
                                    transform: 'scale(1.1)',
                                    backgroundColor: 'success.light',
                                    color: 'white'
                                  },
                                  transition: 'all 0.2s'
                                }}
                              >
                                <AddIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Badge badgeContent={company.users.filter(u => u.isActive).length} color="secondary">
                              <Chip
                                label={`${company.users.length} user${company.users.length !== 1 ? 's' : ''}`}
                                color="secondary"
                                variant="outlined"
                                size="small"
                              />
                            </Badge>
                            <Tooltip title="Add User">
                              <IconButton
                                size="small"
                                onClick={() => handleAddUser(company.id)}
                                color="info"
                                sx={{ 
                                  '&:hover': { 
                                    transform: 'scale(1.1)',
                                    backgroundColor: 'info.light',
                                    color: 'white'
                                  },
                                  transition: 'all 0.2s'
                                }}
                              >
                                <PersonIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Edit Company">
                              <IconButton
                                size="small"
                                onClick={() => handleEditCompany(company)}
                                color="primary"
                                sx={{ '&:hover': { backgroundColor: 'primary.light', color: 'white' } }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Company">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteCompany(company.id)}
                                color="error"
                                sx={{ '&:hover': { backgroundColor: 'error.light', color: 'white' } }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>

                      {/* Expanded Company Content */}
                      <TableRow>
                        <TableCell colSpan={6} sx={{ p: 0, border: 'none' }}>
                          <Collapse in={expandedCompanies.has(company.id)} timeout="auto" unmountOnExit>
                            <Box sx={{ m: 3, bgcolor: '#fafbfc', borderRadius: 2, p: 3 }}>
                              
                              {/* Locations Section */}
                              <Accordion defaultExpanded sx={{ mb: 2, boxShadow: 2 }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                  <Typography variant="h6" sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <LocationOnIcon /> Locations ({company.locations.length})
                                  </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                  {company.locations.length === 0 ? (
                                    <Box sx={{ textAlign: 'center', py: 4, bgcolor: 'grey.50', borderRadius: 2 }}>
                                      <PlaceIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                                      <Typography variant="body2" color="text.secondary" gutterBottom>
                                        No locations yet
                                      </Typography>
                                      <Button
                                        size="small"
                                        startIcon={<AddIcon />}
                                        onClick={() => handleAddLocation(company.id)}
                                        variant="contained"
                                        sx={{ borderRadius: 2 }}
                                      >
                                        Add First Location
                                      </Button>
                                    </Box>
                                  ) : (
                                    <Table size="small">
                                      <TableHead>
                                        <TableRow>
                                          <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>Location Details</TableCell>
                                          <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>Address</TableCell>
                                          <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>Contact</TableCell>
                                          <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>Manager</TableCell>
                                          <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>Assigned Users</TableCell>
                                          <TableCell sx={{ fontWeight: 'bold', color: 'primary.main', width: 100 }}>Actions</TableCell>
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                        {company.locations.map((location) => {
                                          const assignedUsers = getUsersForLocation(company.id, location.id);
                                          const managerName = location.manager ? getUserName(company.id, location.manager) : null;
                                          
                                          return (
                                            <TableRow 
                                              key={location.id} 
                                              sx={{ 
                                                '&:hover': { backgroundColor: '#f0f8ff' },
                                                borderLeft: `4px solid ${location.isActive ? '#4caf50' : '#f44336'}`,
                                                opacity: location.isActive ? 1 : 0.7
                                              }}
                                            >
                                              <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                  <Badge
                                                    badgeContent={location.isActive ? <CheckCircleIcon sx={{ fontSize: 10 }} /> : <ErrorIcon sx={{ fontSize: 10 }} />}
                                                    color={location.isActive ? 'success' : 'error'}
                                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                  >
                                                    <Avatar sx={{ 
                                                      bgcolor: location.isActive ? 'primary.main' : 'grey.500',
                                                      width: 36,
                                                      height: 36 
                                                    }}>
                                                      <LocationOnIcon fontSize="small" />
                                                    </Avatar>
                                                  </Badge>
                                                  <Box>
                                                    <Typography variant="subtitle2" fontWeight="bold">
                                                      {location.name}
                                                    </Typography>
                                                    <Chip 
                                                      label={location.isActive ? 'Active' : 'Inactive'}
                                                      color={location.isActive ? 'success' : 'error'}
                                                      size="small"
                                                      variant="outlined"
                                                    />
                                                  </Box>
                                                </Box>
                                              </TableCell>
                                              <TableCell>
                                                <Typography variant="body2">
                                                  📍 {location.city}, {location.state} {location.postCode}
                                                </Typography>
                                              </TableCell>
                                              <TableCell>
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
                                              </TableCell>
                                              <TableCell>
                                                {managerName ? (
                                                  <Chip 
                                                    label={managerName}
                                                    size="small"
                                                    color="warning"
                                                    variant="outlined"
                                                    icon={<StarIcon />}
                                                  />
                                                ) : (
                                                  <Typography variant="caption" color="text.secondary">
                                                    No manager assigned
                                                  </Typography>
                                                )}
                                              </TableCell>
                                              <TableCell>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                  {assignedUsers.length === 0 ? (
                                                    <Typography variant="caption" color="text.secondary">
                                                      No users assigned
                                                    </Typography>
                                                  ) : (
                                                    assignedUsers.slice(0, 3).map((user) => (
                                                      <Chip
                                                        key={user.id}
                                                        label={user.name}
                                                        size="small"
                                                        variant="outlined"
                                                        color="secondary"
                                                        avatar={
                                                          <Avatar 
                                                            sx={{ 
                                                              bgcolor: getRoleColor(user.role),
                                                              width: 20,
                                                              height: 20,
                                                              fontSize: '0.7rem'
                                                            }}
                                                          >
                                                            {user.name.charAt(0)}
                                                          </Avatar>
                                                        }
                                                      />
                                                    ))
                                                  )}
                                                  {assignedUsers.length > 3 && (
                                                    <Chip
                                                      label={`+${assignedUsers.length - 3} more`}
                                                      size="small"
                                                      variant="outlined"
                                                      color="info"
                                                    />
                                                  )}
                                                </Box>
                                              </TableCell>
                                              <TableCell>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                  <Tooltip title="Edit Location">
                                                    <IconButton
                                                      size="small"
                                                      onClick={() => handleEditLocation(company.id, location)}
                                                      color="primary"
                                                    >
                                                      <EditIcon fontSize="small" />
                                                    </IconButton>
                                                  </Tooltip>
                                                  <Tooltip title="Delete Location">
                                                    <IconButton
                                                      size="small"
                                                      onClick={() => handleDeleteLocation(company.id, location.id)}
                                                      color="error"
                                                    >
                                                      <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                  </Tooltip>
                                                </Box>
                                              </TableCell>
                                            </TableRow>
                                          );
                                        })}
                                      </TableBody>
                                    </Table>
                                  )}
                                </AccordionDetails>
                              </Accordion>

                              {/* Users Section */}
                              <Accordion sx={{ boxShadow: 2 }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                  <Typography variant="h6" sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <GroupIcon /> Company Users ({company.users.length})
                                  </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                  {company.users.length === 0 ? (
                                    <Box sx={{ textAlign: 'center', py: 4, bgcolor: 'grey.50', borderRadius: 2 }}>
                                      <PersonIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                                      <Typography variant="body2" color="text.secondary" gutterBottom>
                                        No users assigned to this company
                                      </Typography>
                                      <Button
                                        size="small"
                                        startIcon={<AddIcon />}
                                        onClick={() => handleAddUser(company.id)}
                                        variant="contained"
                                        sx={{ borderRadius: 2 }}
                                      >
                                        Add First User
                                      </Button>
                                    </Box>
                                  ) : (
                                    <Table size="small">
                                      <TableHead>
                                        <TableRow>
                                          <TableCell sx={{ fontWeight: 'bold' }}>User Details</TableCell>
                                          <TableCell sx={{ fontWeight: 'bold' }}>Role & Status</TableCell>
                                          <TableCell sx={{ fontWeight: 'bold' }}>Assigned Locations</TableCell>
                                          <TableCell sx={{ fontWeight: 'bold' }}>Permissions</TableCell>
                                          <TableCell sx={{ fontWeight: 'bold', width: 100 }}>Actions</TableCell>
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                        {company.users.map((user) => (
                                          <TableRow 
                                            key={user.id} 
                                            sx={{ 
                                              '&:hover': { backgroundColor: '#f0f8ff' },
                                              opacity: user.isActive ? 1 : 0.6
                                            }}
                                          >
                                            <TableCell>
                                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Badge
                                                  badgeContent={user.isActive ? <CheckCircleIcon sx={{ fontSize: 10 }} /> : <ErrorIcon sx={{ fontSize: 10 }} />}
                                                  color={user.isActive ? 'success' : 'error'}
                                                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                >
                                                  <Avatar 
                                                    sx={{ 
                                                      width: 36, 
                                                      height: 36, 
                                                      bgcolor: getRoleColor(user.role),
                                                      fontSize: '0.9rem'
                                                    }}
                                                  >
                                                    {user.name.split(' ').map(n => n.charAt(0)).join('')}
                                                  </Avatar>
                                                </Badge>
                                                <Box>
                                                  <Typography variant="body2" fontWeight="bold">
                                                    {user.name}
                                                  </Typography>
                                                  <Typography variant="caption" color="text.secondary">
                                                    {user.email}
                                                  </Typography>
                                                  {user.lastLogin && (
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                      Last login: {user.lastLogin.toLocaleDateString()}
                                                    </Typography>
                                                  )}
                                                </Box>
                                              </Box>
                                            </TableCell>
                                            <TableCell>
                                              <Box>
                                                <Chip
                                                  label={user.role}
                                                  size="small"
                                                  sx={{ 
                                                    bgcolor: getRoleColor(user.role),
                                                    color: 'white',
                                                    fontWeight: 'bold',
                                                    mb: 1
                                                  }}
                                                />
                                                <Box>
                                                  <Chip
                                                    label={user.isActive ? 'Active' : 'Inactive'}
                                                    size="small"
                                                    color={user.isActive ? 'success' : 'error'}
                                                    variant="outlined"
                                                  />
                                                </Box>
                                              </Box>
                                            </TableCell>
                                            <TableCell>
                                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {user.assignedLocations.slice(0, 2).map((locationId) => (
                                                  <Chip
                                                    key={locationId}
                                                    label={getLocationName(company.id, locationId)}
                                                    size="small"
                                                    variant="outlined"
                                                    color="info"
                                                  />
                                                ))}
                                                {user.assignedLocations.length > 2 && (
                                                  <Chip
                                                    label={`+${user.assignedLocations.length - 2} more`}
                                                    size="small"
                                                    variant="outlined"
                                                  />
                                                )}
                                                {user.assignedLocations.length === 0 && (
                                                  <Typography variant="caption" color="text.secondary">
                                                    No locations assigned
                                                  </Typography>
                                                )}
                                              </Box>
                                            </TableCell>
                                            <TableCell>
                                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {user.permissions.slice(0, 2).map((permissionId) => {
                                                  const permission = AVAILABLE_PERMISSIONS.find(p => p.id === permissionId);
                                                  return permission ? (
                                                    <Chip
                                                      key={permissionId}
                                                      label={permission.name}
                                                      size="small"
                                                      variant="outlined"
                                                      color="secondary"
                                                    />
                                                  ) : null;
                                                })}
                                                {user.permissions.length > 2 && (
                                                  <Chip
                                                    label={`+${user.permissions.length - 2} more`}
                                                    size="small"
                                                    variant="outlined"
                                                  />
                                                )}
                                                {user.permissions.length === 0 && (
                                                  <Typography variant="caption" color="text.secondary">
                                                    No permissions
                                                  </Typography>
                                                )}
                                              </Box>
                                            </TableCell>
                                            <TableCell>
                                              <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Tooltip title="Edit User">
                                                  <IconButton
                                                    size="small"
                                                    onClick={() => handleEditUser(company.id, user)}
                                                    color="primary"
                                                  >
                                                    <EditIcon fontSize="small" />
                                                  </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete User">
                                                  <IconButton
                                                    size="small"
                                                    onClick={() => handleDeleteUser(company.id, user.id)}
                                                    color="error"
                                                  >
                                                    <DeleteIcon fontSize="small" />
                                                  </IconButton>
                                                </Tooltip>
                                              </Box>
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  )}
                                </AccordionDetails>
                              </Accordion>
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
        </CardContent>
      </Card>

      {/* Enhanced Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: 3,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {entityType === 'company' && <BusinessIcon />}
            {entityType === 'location' && <LocationOnIcon />}
            {entityType === 'user' && <PersonIcon />}
            <Typography variant="h6" fontWeight="bold">
              {dialogMode === 'add' ? 'Add New' : 'Edit'} {
                entityType === 'company' ? 'Company' : 
                entityType === 'location' ? 'Location' : 'User'
              }
            </Typography>
          </Box>
          {entityType === 'location' && selectedCompany && (
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
              Adding location to: {selectedCompany.name}
            </Typography>
          )}
          {entityType === 'user' && selectedCompany && (
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
              Adding user to: {selectedCompany.name}
            </Typography>
          )}
        </DialogTitle>
        
        <DialogContent dividers sx={{ bgcolor: '#fafbfc' }}>
          {entityType === 'company' ? (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Company Name *"
                  value={companyForm.name}
                  onChange={(e) => setCompanyForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  error={!companyForm.name.trim()}
                  helperText={!companyForm.name.trim() ? 'Company name is required' : ''}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="City *"
                  value={companyForm.city}
                  onChange={(e) => setCompanyForm(prev => ({ ...prev, city: e.target.value }))}
                  required
                  error={!companyForm.city.trim()}
                  helperText={!companyForm.city.trim() ? 'City is required' : ''}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="State *"
                  value={companyForm.state}
                  onChange={(e) => setCompanyForm(prev => ({ ...prev, state: e.target.value }))}
                  required
                  error={!companyForm.state.trim()}
                  helperText={!companyForm.state.trim() ? 'State is required' : ''}
                  placeholder="e.g., CA, NY, TX"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Post Code *"
                  value={companyForm.postCode}
                  onChange={(e) => setCompanyForm(prev => ({ ...prev, postCode: e.target.value }))}
                  required
                  error={!companyForm.postCode.trim()}
                  helperText={!companyForm.postCode.trim() ? 'Post code is required' : ''}
                  placeholder="12345"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone *"
                  value={companyForm.phone}
                  onChange={(e) => setCompanyForm(prev => ({ ...prev, phone: e.target.value }))}
                  required
                  error={!companyForm.phone.trim()}
                  helperText={!companyForm.phone.trim() ? 'Phone is required' : ''}
                  placeholder="(555) 123-4567"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email (Optional)"
                  type="email"
                  value={companyForm.email}
                  onChange={(e) => setCompanyForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="contact@company.com"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Website (Optional)"
                  value={companyForm.website}
                  onChange={(e) => setCompanyForm(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://company.com"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Industry</InputLabel>
                  <Select
                    value={companyForm.industry}
                    label="Industry"
                    onChange={(e: SelectChangeEvent) => setCompanyForm(prev => ({ ...prev, industry: e.target.value }))}
                    sx={{ borderRadius: 2 }}
                  >
                    {INDUSTRIES.map((industry) => (
                      <MenuItem key={industry} value={industry}>{industry}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={companyForm.isActive}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, isActive: e.target.checked }))}
                      color="primary"
                    />
                  }
                  label="Active Company"
                />
              </Grid>
            </Grid>
          ) : entityType === 'location' ? (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location Name *"
                  value={locationForm.name}
                  onChange={(e) => setLocationForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  error={!locationForm.name.trim()}
                  helperText={!locationForm.name.trim() ? 'Location name is required' : ''}
                  placeholder="e.g., Main Office, Branch 1, Warehouse"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="City *"
                  value={locationForm.city}
                  onChange={(e) => setLocationForm(prev => ({ ...prev, city: e.target.value }))}
                  required
                  error={!locationForm.city.trim()}
                  helperText={!locationForm.city.trim() ? 'City is required' : ''}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="State *"
                  value={locationForm.state}
                  onChange={(e) => setLocationForm(prev => ({ ...prev, state: e.target.value }))}
                  required
                  error={!locationForm.state.trim()}
                  helperText={!locationForm.state.trim() ? 'State is required' : ''}
                  placeholder="e.g., CA, NY, TX"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Post Code *"
                  value={locationForm.postCode}
                  onChange={(e) => setLocationForm(prev => ({ ...prev, postCode: e.target.value }))}
                  required
                  error={!locationForm.postCode.trim()}
                  helperText={!locationForm.postCode.trim() ? 'Post code is required' : ''}
                  placeholder="12345"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone (Optional)"
                  value={locationForm.phone}
                  onChange={(e) => setLocationForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(555) 123-4567"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email (Optional)"
                  type="email"
                  value={locationForm.email}
                  onChange={(e) => setLocationForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="location@company.com"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              
              {selectedCompany && selectedCompany.users.length > 0 && (
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Location Manager (Optional)</InputLabel>
                    <Select
                      value={locationForm.manager}
                      label="Location Manager (Optional)"
                      onChange={(e: SelectChangeEvent) => setLocationForm(prev => ({ ...prev, manager: e.target.value }))}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="">No Manager</MenuItem>
                      {selectedCompany.users
                        .filter(user => user.isActive)
                        .map((user) => (
                          <MenuItem key={user.id} value={user.id}>
                            {user.name} ({user.role})
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
                      onChange={(e) => setLocationForm(prev => ({ ...prev, isActive: e.target.checked }))}
                      color="primary"
                    />
                  }
                  label="Active Location"
                />
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name *"
                  value={userForm.name}
                  onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  error={!userForm.name.trim()}
                  helperText={!userForm.name.trim() ? 'Name is required' : ''}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email *"
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                  error={!userForm.email.trim()}
                  helperText={!userForm.email.trim() ? 'Email is required' : ''}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required error={!userForm.role.trim()}>
                  <InputLabel>Role *</InputLabel>
                  <Select
                    value={userForm.role}
                    label="Role *"
                    onChange={(e: SelectChangeEvent) => setUserForm(prev => ({ ...prev, role: e.target.value }))}
                    sx={{ borderRadius: 2 }}
                  >
                    {USER_ROLES.map((role) => (
                      <MenuItem key={role.value} value={role.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box 
                            sx={{ 
                              width: 12, 
                              height: 12, 
                              borderRadius: '50%', 
                              bgcolor: role.color 
                            }} 
                          />
                          {role.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                  {!userForm.role.trim() && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                      Role is required
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={userForm.isActive}
                      onChange={(e) => setUserForm(prev => ({ ...prev, isActive: e.target.checked }))}
                      color="primary"
                    />
                  }
                  label="Active User"
                />
              </Grid>
              
              {/* Location Assignment */}
              {selectedCompany && selectedCompany.locations.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AssignmentIndIcon /> Location Assignment
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, maxHeight: 200, overflow: 'auto', borderRadius: 2 }}>
                    {selectedCompany.locations.map((location) => (
                      <Box key={location.id} sx={{ mb: 1 }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={userForm.assignedLocations.includes(location.id)}
                              onChange={() => handleLocationAssignmentToggle(location.id)}
                              color="primary"
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body2" fontWeight="bold">
                                {location.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {location.city}, {location.state} {location.postCode}
                              </Typography>
                            </Box>
                          }
                        />
                      </Box>
                    ))}
                  </Paper>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Selected: {userForm.assignedLocations.length} location{userForm.assignedLocations.length !== 1 ? 's' : ''}
                  </Typography>
                </Grid>
              )}
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SecurityIcon /> Permissions
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, maxHeight: 300, overflow: 'auto', borderRadius: 2 }}>
                  {Object.entries(groupedPermissions).map(([category, permissions]) => (
                    <Box key={category} sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        {category}
                      </Typography>
                      {permissions.map((permission) => (
                        <Box key={permission.id} sx={{ ml: 2, mb: 1 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={userForm.permissions.includes(permission.id)}
                                onChange={() => handlePermissionToggle(permission.id)}
                                color="primary"
                              />
                            }
                            label={
                              <Box>
                                <Typography variant="body2" fontWeight="bold">
                                  {permission.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {permission.description}
                                </Typography>
                              </Box>
                            }
                          />
                        </Box>
                      ))}
                    </Box>
                  ))}
                </Paper>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Selected: {userForm.permissions.length} permission{userForm.permissions.length !== 1 ? 's' : ''}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, gap: 1, bgcolor: '#f8f9fa' }}>
          <Button
            onClick={() => setDialogOpen(false)}
            startIcon={<CancelIcon />}
            color="inherit"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={entityType === 'company' ? handleSaveCompany : entityType === 'location' ? handleSaveLocation : handleSaveUser}
            variant="contained"
            startIcon={<SaveIcon />}
            sx={{ 
              borderRadius: 2,
              background: 'linear-gradient(45deg, #4caf50 30%, #8bc34a 90%)',
              boxShadow: '0 3px 5px 2px rgba(76, 175, 80, .3)',
            }}
          >
            {dialogMode === 'add' ? 'Add' : 'Update'} {
              entityType === 'company' ? 'Company' : 
              entityType === 'location' ? 'Location' : 'User'
            }
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enhanced Floating Action Button */}
      <Tooltip title="Add Company" arrow>
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            zIndex: 1000,
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            boxShadow: '0 8px 32px rgba(33, 150, 243, 0.4)',
            '&:hover': {
              transform: 'scale(1.1)',
              boxShadow: '0 12px 40px rgba(33, 150, 243, 0.6)',
            },
            transition: 'all 0.3s ease-in-out'
          }}
          onClick={handleAddCompany}
        >
          <AddIcon />
        </Fab>
      </Tooltip>

      {/* Enhanced Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={() => setNotification(prev => ({ ...prev, open: false }))}
          severity={notification.severity}
          variant="filled"
          sx={{ 
            borderRadius: 3,
            boxShadow: 3,
            '& .MuiAlert-icon': {
              fontSize: '1.5rem'
            }
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CompanyLocationManager;
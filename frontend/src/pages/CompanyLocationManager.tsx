import React, { useState, useEffect } from 'react';
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
  Divider
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

interface Permission {
  id: string;
  name: string;
  description: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  status: 'active' | 'inactive';
  createdAt: Date;
}

interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  email?: string;
  status: 'active' | 'inactive';
  users: User[];
  createdAt: Date;
  updatedAt: Date;
}

interface Company {
  id: string;
  name: string;
  description?: string;
  website?: string;
  phone?: string;
  email?: string;
  status: 'active' | 'inactive';
  locations: Location[];
  createdAt: Date;
  updatedAt: Date;
}

type DialogMode = 'add' | 'edit' | 'view' | null;
type EntityType = 'company' | 'location' | 'user';

const AVAILABLE_PERMISSIONS: Permission[] = [
  { id: 'read_reports', name: 'View Reports', description: 'Can view all reports and analytics' },
  { id: 'edit_reports', name: 'Edit Reports', description: 'Can modify and update reports' },
  { id: 'manage_inventory', name: 'Manage Inventory', description: 'Can add, edit, and delete inventory items' },
  { id: 'manage_users', name: 'Manage Users', description: 'Can add, edit, and remove users' },
  { id: 'financial_access', name: 'Financial Access', description: 'Can view financial data and reports' },
  { id: 'system_admin', name: 'System Administrator', description: 'Full system access and configuration' }
];

const CompanyLocationManager: React.FC = () => {
  const theme = useTheme();
  
  // State for companies and locations
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());
  const [expandedLocations, setExpandedLocations] = useState<Set<string>>(new Set());
  
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
    description: '',
    website: '',
    phone: '',
    email: ''
  });
  
  const [locationForm, setLocationForm] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: ''
  });

  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: '',
    permissions: [] as string[]
  });
  
  // UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
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

  // Sample data initialization
  useEffect(() => {
    const sampleCompanies: Company[] = [
      {
        id: '1',
        name: 'TechCorp Solutions',
        description: 'Leading technology solutions provider',
        website: 'https://techcorp.com',
        phone: '(555) 123-4567',
        email: 'contact@techcorp.com',
        status: 'active',
        createdAt: new Date('2023-01-15'),
        updatedAt: new Date('2024-12-10'),
        locations: [
          {
            id: '1-1',
            name: 'TechCorp HQ',
            address: '123 Tech Street',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94102',
            phone: '(555) 123-4567',
            email: 'hq@techcorp.com',
            status: 'active',
            createdAt: new Date('2023-01-15'),
            updatedAt: new Date('2024-12-10'),
            users: [
              {
                id: 'u1-1',
                name: 'John Smith',
                email: 'john.smith@techcorp.com',
                role: 'Manager',
                permissions: ['read_reports', 'edit_reports', 'manage_inventory'],
                status: 'active',
                createdAt: new Date('2023-02-01')
              },
              {
                id: 'u1-2',
                name: 'Sarah Wilson',
                email: 'sarah.wilson@techcorp.com',
                role: 'Administrator',
                permissions: ['read_reports', 'edit_reports', 'manage_users', 'system_admin'],
                status: 'active',
                createdAt: new Date('2023-02-15')
              }
            ]
          },
          {
            id: '1-2',
            name: 'TechCorp East',
            address: '456 Innovation Ave',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            phone: '(555) 234-5678',
            email: 'east@techcorp.com',
            status: 'active',
            createdAt: new Date('2023-06-20'),
            updatedAt: new Date('2024-12-10'),
            users: [
              {
                id: 'u2-1',
                name: 'Mike Johnson',
                email: 'mike.johnson@techcorp.com',
                role: 'Staff',
                permissions: ['read_reports'],
                status: 'active',
                createdAt: new Date('2023-07-01')
              }
            ]
          }
        ]
      },
      {
        id: '2',
        name: 'Green Energy Inc',
        description: 'Sustainable energy solutions',
        website: 'https://greenenergy.com',
        phone: '(555) 987-6543',
        email: 'info@greenenergy.com',
        status: 'active',
        createdAt: new Date('2023-03-10'),
        updatedAt: new Date('2024-12-10'),
        locations: [
          {
            id: '2-1',
            name: 'Green Energy Main',
            address: '789 Solar Lane',
            city: 'Austin',
            state: 'TX',
            zipCode: '73301',
            phone: '(555) 987-6543',
            email: 'main@greenenergy.com',
            status: 'active',
            createdAt: new Date('2023-03-10'),
            updatedAt: new Date('2024-12-10'),
            users: []
          }
        ]
      },
      {
        id: '3',
        name: 'Retail Solutions Ltd',
        description: 'Comprehensive retail management',
        website: 'https://retailsolutions.com',
        phone: '(555) 456-7890',
        email: 'contact@retailsolutions.com',
        status: 'inactive',
        createdAt: new Date('2022-11-05'),
        updatedAt: new Date('2024-11-20'),
        locations: []
      }
    ];
    
    setCompanies(sampleCompanies);
    setFilteredCompanies(sampleCompanies);
  }, []);

  // Filter companies based on search and status
  useEffect(() => {
    let filtered = companies;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.locations.some(location =>
          location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          location.city.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(company => company.status === statusFilter);
    }
    
    setFilteredCompanies(filtered);
  }, [companies, searchTerm, statusFilter]);

  // Helper functions
  const showNotification = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setNotification({ open: true, message, severity });
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const resetForms = () => {
    setCompanyForm({
      name: '',
      description: '',
      website: '',
      phone: '',
      email: ''
    });
    
    setLocationForm({
      name: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      email: ''
    });

    setUserForm({
      name: '',
      email: '',
      role: '',
      permissions: []
    });
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

  // Status toggle functions
  const toggleCompanyStatus = (companyId: string) => {
    setCompanies(prev => prev.map(company =>
      company.id === companyId
        ? {
            ...company,
            status: company.status === 'active' ? 'inactive' : 'active',
            updatedAt: new Date()
          }
        : company
    ));
    showNotification('Company status updated', 'success');
  };

  const toggleLocationStatus = (companyId: string, locationId: string) => {
    setCompanies(prev => prev.map(company =>
      company.id === companyId
        ? {
            ...company,
            locations: company.locations.map(location =>
              location.id === locationId
                ? {
                    ...location,
                    status: location.status === 'active' ? 'inactive' : 'active',
                    updatedAt: new Date()
                  }
                : location
            ),
            updatedAt: new Date()
          }
        : company
    ));
    showNotification('Location status updated', 'success');
  };

  const toggleUserStatus = (companyId: string, locationId: string, userId: string) => {
    setCompanies(prev => prev.map(company =>
      company.id === companyId
        ? {
            ...company,
            locations: company.locations.map(location =>
              location.id === locationId
                ? {
                    ...location,
                    users: location.users.map(user =>
                      user.id === userId
                        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
                        : user
                    ),
                    updatedAt: new Date()
                  }
                : location
            ),
            updatedAt: new Date()
          }
        : company
    ));
    showNotification('User status updated', 'success');
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
      description: company.description || '',
      website: company.website || '',
      phone: company.phone || '',
      email: company.email || ''
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
    if (!companyForm.name.trim()) {
      showNotification('Company name is required', 'error');
      return;
    }

    const now = new Date();
    
    if (dialogMode === 'add') {
      const newCompany: Company = {
        id: generateId(),
        name: companyForm.name,
        description: companyForm.description,
        website: companyForm.website,
        phone: companyForm.phone,
        email: companyForm.email,
        status: 'active',
        locations: [],
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
              description: companyForm.description,
              website: companyForm.website,
              phone: companyForm.phone,
              email: companyForm.email,
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
      address: location.address,
      city: location.city,
      state: location.state,
      zipCode: location.zipCode,
      phone: location.phone || '',
      email: location.email || ''
    });
    setDialogOpen(true);
  };

  const handleDeleteLocation = (companyId: string, locationId: string) => {
    const location = companies.find(c => c.id === companyId)?.locations.find(l => l.id === locationId);
    if (location && window.confirm(`Are you sure you want to delete "${location.name}"? This will also delete all users associated with this location.`)) {
      setCompanies(prev => prev.map(company =>
        company.id === companyId
          ? {
              ...company,
              locations: company.locations.filter(l => l.id !== locationId),
              updatedAt: new Date()
            }
          : company
      ));
      showNotification('Location deleted successfully', 'success');
    }
  };

  const handleSaveLocation = () => {
    if (!locationForm.name.trim() || !selectedCompany) {
      showNotification('Location name and company are required', 'error');
      return;
    }

    const now = new Date();
    
    if (dialogMode === 'add') {
      const newLocation: Location = {
        id: generateId(),
        name: locationForm.name,
        address: locationForm.address,
        city: locationForm.city,
        state: locationForm.state,
        zipCode: locationForm.zipCode,
        phone: locationForm.phone,
        email: locationForm.email,
        status: 'active',
        users: [],
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
                      address: locationForm.address,
                      city: locationForm.city,
                      state: locationForm.state,
                      zipCode: locationForm.zipCode,
                      phone: locationForm.phone,
                      email: locationForm.email,
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
  const handleAddUser = (companyId: string, locationId: string) => {
    setDialogMode('add');
    setEntityType('user');
    setSelectedCompany(companies.find(c => c.id === companyId) || null);
    setSelectedLocation(companies.find(c => c.id === companyId)?.locations.find(l => l.id === locationId) || null);
    resetForms();
    setDialogOpen(true);
  };

  const handleEditUser = (companyId: string, locationId: string, user: User) => {
    setDialogMode('edit');
    setEntityType('user');
    setSelectedCompany(companies.find(c => c.id === companyId) || null);
    setSelectedLocation(companies.find(c => c.id === companyId)?.locations.find(l => l.id === locationId) || null);
    setSelectedUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions
    });
    setDialogOpen(true);
  };

  const handleDeleteUser = (companyId: string, locationId: string, userId: string) => {
    const user = companies.find(c => c.id === companyId)?.locations.find(l => l.id === locationId)?.users.find(u => u.id === userId);
    if (user && window.confirm(`Are you sure you want to delete user "${user.name}"?`)) {
      setCompanies(prev => prev.map(company =>
        company.id === companyId
          ? {
              ...company,
              locations: company.locations.map(location =>
                location.id === locationId
                  ? {
                      ...location,
                      users: location.users.filter(u => u.id !== userId),
                      updatedAt: new Date()
                    }
                  : location
              ),
              updatedAt: new Date()
            }
          : company
      ));
      showNotification('User deleted successfully', 'success');
    }
  };

  const handleSaveUser = () => {
    if (!userForm.name.trim() || !userForm.email.trim() || !selectedCompany || !selectedLocation) {
      showNotification('Name, email, company and location are required', 'error');
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
        status: 'active',
        createdAt: now
      };
      
      setCompanies(prev => prev.map(company =>
        company.id === selectedCompany.id
          ? {
              ...company,
              locations: company.locations.map(location =>
                location.id === selectedLocation.id
                  ? {
                      ...location,
                      users: [...location.users, newUser],
                      updatedAt: now
                    }
                  : location
              ),
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
              locations: company.locations.map(location =>
                location.id === selectedLocation.id
                  ? {
                      ...location,
                      users: location.users.map(user =>
                        user.id === selectedUser.id
                          ? {
                              ...user,
                              name: userForm.name,
                              email: userForm.email,
                              role: userForm.role,
                              permissions: userForm.permissions
                            }
                          : user
                      ),
                      updatedAt: now
                    }
                  : location
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

  // Menu handlers
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, itemId: string, itemType: EntityType) => {
    setAnchorEl(event.currentTarget);
    setSelectedItemId(itemId);
    setSelectedItemType(itemType);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItemId('');
  };

  const handleMenuAction = (action: 'edit' | 'delete') => {
    if (selectedItemType === 'company') {
      const company = companies.find(c => c.id === selectedItemId);
      if (company) {
        if (action === 'edit') {
          handleEditCompany(company);
        } else if (action === 'delete') {
          handleDeleteCompany(selectedItemId);
        }
      }
    } else if (selectedItemType === 'location') {
      let companyId = '';
      let location: Location | undefined;
      
      for (const company of companies) {
        const foundLocation = company.locations.find(l => l.id === selectedItemId);
        if (foundLocation) {
          companyId = company.id;
          location = foundLocation;
          break;
        }
      }
      
      if (location && companyId) {
        if (action === 'edit') {
          handleEditLocation(companyId, location);
        } else if (action === 'delete') {
          handleDeleteLocation(companyId, selectedItemId);
        }
      }
    } else if (selectedItemType === 'user') {
      let companyId = '';
      let locationId = '';
      let user: User | undefined;
      
      for (const company of companies) {
        for (const location of company.locations) {
          const foundUser = location.users.find(u => u.id === selectedItemId);
          if (foundUser) {
            companyId = company.id;
            locationId = location.id;
            user = foundUser;
            break;
          }
        }
        if (user) break;
      }
      
      if (user && companyId && locationId) {
        if (action === 'edit') {
          handleEditUser(companyId, locationId, user);
        } else if (action === 'delete') {
          handleDeleteUser(companyId, locationId, selectedItemId);
        }
      }
    }
    handleMenuClose();
  };

  const handlePermissionToggle = (permissionId: string) => {
    setUserForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            fontWeight: 600,
            color: '#1a237e',
            mb: 1
          }}
        >
          Company & Location Management
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage your companies, locations, and users
        </Typography>
      </Box>

      {/* Action Bar */}
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search companies or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Filter by Status"
                  onChange={(e: SelectChangeEvent) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddCompany}
                fullWidth
                sx={{ py: 1 }}
              >
                Add Company
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <CardContent sx={{ color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {companies.length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Companies
                  </Typography>
                </Box>
                <BusinessIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <CardContent sx={{ color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {companies.reduce((acc, company) => acc + company.locations.length, 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Locations
                  </Typography>
                </Box>
                <LocationOnIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <CardContent sx={{ color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {companies.reduce((acc, company) => 
                      acc + company.locations.reduce((locAcc, location) => 
                        locAcc + location.users.length, 0), 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Users
                  </Typography>
                </Box>
                <GroupIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Companies Table */}
      <Card sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 0 }}>
          {filteredCompanies.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <CompanyIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No companies found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'Get started by adding your first company'}
              </Typography>
              {!searchTerm && statusFilter === 'all' && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddCompany}
                >
                  Add First Company
                </Button>
              )}
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ width: 50 }}></TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Company</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Contact</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Locations</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', width: 100 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCompanies.map((company) => (
                    <React.Fragment key={company.id}>
                      {/* Company Row */}
                      <TableRow 
                        sx={{ 
                          '&:hover': { backgroundColor: '#f9f9f9' },
                          borderLeft: `4px solid ${company.status === 'active' ? '#4caf50' : '#f44336'}`
                        }}
                      >
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => toggleCompanyExpansion(company.id)}
                          >
                            {expandedCompanies.has(company.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              <BusinessIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {company.name}
                              </Typography>
                              {company.description && (
                                <Typography variant="body2" color="text.secondary">
                                  {company.description}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            {company.phone && (
                              <Typography variant="body2">📞 {company.phone}</Typography>
                            )}
                            {company.email && (
                              <Typography variant="body2">✉️ {company.email}</Typography>
                            )}
                            {company.website && (
                              <Typography variant="body2">🌐 {company.website}</Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${company.locations.length} location${company.locations.length !== 1 ? 's' : ''}`}
                            color="primary"
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={company.status === 'active'}
                                onChange={() => toggleCompanyStatus(company.id)}
                                color="primary"
                              />
                            }
                            label={company.status === 'active' ? 'Active' : 'Inactive'}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => handleEditCompany(company)}
                              color="primary"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteCompany(company.id)}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleAddLocation(company.id)}
                              color="success"
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>

                      {/* Locations Rows */}
                      <TableRow>
                        <TableCell colSpan={6} sx={{ p: 0, border: 'none' }}>
                          <Collapse in={expandedCompanies.has(company.id)} timeout="auto" unmountOnExit>
                            <Box sx={{ m: 2 }}>
                              {company.locations.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 4, bgcolor: 'grey.50', borderRadius: 1 }}>
                                  <PlaceIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                                  <Typography variant="body2" color="text.secondary" gutterBottom>
                                    No locations yet
                                  </Typography>
                                  <Button
                                    size="small"
                                    startIcon={<AddIcon />}
                                    onClick={() => handleAddLocation(company.id)}
                                  >
                                    Add First Location
                                  </Button>
                                </Box>
                              ) : (
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell sx={{ width: 50 }}></TableCell>
                                      <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>Location</TableCell>
                                      <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>Address</TableCell>
                                      <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>Users</TableCell>
                                      <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>Status</TableCell>
                                      <TableCell sx={{ fontWeight: 'bold', color: 'primary.main', width: 100 }}>Actions</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {company.locations.map((location) => (
                                      <React.Fragment key={location.id}>
                                        {/* Location Row */}
                                        <TableRow sx={{ '&:hover': { backgroundColor: '#f0f8ff' } }}>
                                          <TableCell>
                                            <IconButton
                                              size="small"
                                              onClick={() => toggleLocationExpansion(location.id)}
                                            >
                                              {expandedLocations.has(location.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                            </IconButton>
                                          </TableCell>
                                          <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                              <LocationOnIcon color="primary" fontSize="small" />
                                              <Typography variant="subtitle2" fontWeight="bold">
                                                {location.name}
                                              </Typography>
                                            </Box>
                                          </TableCell>
                                          <TableCell>
                                            <Box>
                                              <Typography variant="body2">{location.address}</Typography>
                                              <Typography variant="body2" color="text.secondary">
                                                {location.city}, {location.state} {location.zipCode}
                                              </Typography>
                                            </Box>
                                          </TableCell>
                                          <TableCell>
                                            <Chip
                                              label={`${location.users.length} user${location.users.length !== 1 ? 's' : ''}`}
                                              color="secondary"
                                              variant="outlined"
                                              size="small"
                                            />
                                          </TableCell>
                                          <TableCell>
                                            <FormControlLabel
                                              control={
                                                <Switch
                                                  checked={location.status === 'active'}
                                                  onChange={() => toggleLocationStatus(company.id, location.id)}
                                                  color="primary"
                                                  size="small"
                                                />
                                              }
                                              label={location.status === 'active' ? 'Active' : 'Inactive'}
                                            />
                                          </TableCell>
                                          <TableCell>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                              <IconButton
                                                size="small"
                                                onClick={() => handleEditLocation(company.id, location)}
                                                color="primary"
                                              >
                                                <EditIcon fontSize="small" />
                                              </IconButton>
                                              <IconButton
                                                size="small"
                                                onClick={() => handleDeleteLocation(company.id, location.id)}
                                                color="error"
                                              >
                                                <DeleteIcon fontSize="small" />
                                              </IconButton>
                                              <IconButton
                                                size="small"
                                                onClick={() => handleAddUser(company.id, location.id)}
                                                color="success"
                                              >
                                                <PersonIcon fontSize="small" />
                                              </IconButton>
                                            </Box>
                                          </TableCell>
                                        </TableRow>

                                        {/* Users Section */}
                                        <TableRow>
                                          <TableCell colSpan={6} sx={{ p: 0, border: 'none' }}>
                                            <Collapse in={expandedLocations.has(location.id)} timeout="auto" unmountOnExit>
                                              <Box sx={{ ml: 4, mr: 2, mb: 2, mt: 1, p: 2, bgcolor: '#fafafa', borderRadius: 1 }}>
                                                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                                                  Users & Permissions
                                                </Typography>
                                                {location.users.length === 0 ? (
                                                  <Box sx={{ textAlign: 'center', py: 3 }}>
                                                    <PersonIcon sx={{ fontSize: 32, color: 'text.secondary', mb: 1 }} />
                                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                                      No users assigned to this location
                                                    </Typography>
                                                    <Button
                                                      size="small"
                                                      startIcon={<AddIcon />}
                                                      onClick={() => handleAddUser(company.id, location.id)}
                                                      variant="outlined"
                                                    >
                                                      Add First User
                                                    </Button>
                                                  </Box>
                                                ) : (
                                                  <Box>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                                      <Typography variant="subtitle2">
                                                        {location.users.length} user{location.users.length !== 1 ? 's' : ''} assigned
                                                      </Typography>
                                                      <Button
                                                        size="small"
                                                        startIcon={<AddIcon />}
                                                        onClick={() => handleAddUser(company.id, location.id)}
                                                        variant="outlined"
                                                      >
                                                        Add User
                                                      </Button>
                                                    </Box>
                                                    <Table size="small">
                                                      <TableHead>
                                                        <TableRow>
                                                          <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>
                                                          <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                                                          <TableCell sx={{ fontWeight: 'bold' }}>Permissions</TableCell>
                                                          <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                                          <TableCell sx={{ fontWeight: 'bold', width: 100 }}>Actions</TableCell>
                                                        </TableRow>
                                                      </TableHead>
                                                      <TableBody>
                                                        {location.users.map((user) => (
                                                          <TableRow key={user.id} sx={{ '&:hover': { backgroundColor: '#fff' } }}>
                                                            <TableCell>
                                                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                                                                  <PersonIcon fontSize="small" />
                                                                </Avatar>
                                                                <Box>
                                                                  <Typography variant="body2" fontWeight="bold">
                                                                    {user.name}
                                                                  </Typography>
                                                                  <Typography variant="caption" color="text.secondary">
                                                                    {user.email}
                                                                  </Typography>
                                                                </Box>
                                                              </Box>
                                                            </TableCell>
                                                            <TableCell>
                                                              <Chip
                                                                label={user.role}
                                                                size="small"
                                                                color="primary"
                                                                variant="outlined"
                                                              />
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
                                                              </Box>
                                                            </TableCell>
                                                            <TableCell>
                                                              <FormControlLabel
                                                                control={
                                                                  <Switch
                                                                    checked={user.status === 'active'}
                                                                    onChange={() => toggleUserStatus(company.id, location.id, user.id)}
                                                                    color="primary"
                                                                    size="small"
                                                                  />
                                                                }
                                                                label={user.status === 'active' ? 'Active' : 'Inactive'}
                                                              />
                                                            </TableCell>
                                                            <TableCell>
                                                              <Box sx={{ display: 'flex', gap: 1 }}>
                                                                <IconButton
                                                                  size="small"
                                                                  onClick={() => handleEditUser(company.id, location.id, user)}
                                                                  color="primary"
                                                                >
                                                                  <EditIcon fontSize="small" />
                                                                </IconButton>
                                                                <IconButton
                                                                  size="small"
                                                                  onClick={() => handleDeleteUser(company.id, location.id, user.id)}
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
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {entityType === 'company' && <BusinessIcon />}
            {entityType === 'location' && <LocationOnIcon />}
            {entityType === 'user' && <PersonIcon />}
            <Typography variant="h6" fontWeight="bold">
              {dialogMode === 'add' ? 'Add New' : 'Edit'} {entityType === 'company' ? 'Company' : entityType === 'location' ? 'Location' : 'User'}
            </Typography>
          </Box>
          {entityType === 'location' && selectedCompany && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Adding location to: {selectedCompany.name}
            </Typography>
          )}
          {entityType === 'user' && selectedCompany && selectedLocation && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Adding user to: {selectedCompany.name} → {selectedLocation.name}
            </Typography>
          )}
        </DialogTitle>
        
        <DialogContent dividers>
          {entityType === 'company' ? (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Company Name"
                  value={companyForm.name}
                  onChange={(e) => setCompanyForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  error={!companyForm.name.trim()}
                  helperText={!companyForm.name.trim() ? 'Company name is required' : ''}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={companyForm.description}
                  onChange={(e) => setCompanyForm(prev => ({ ...prev, description: e.target.value }))}
                  multiline
                  rows={2}
                  placeholder="Brief description of the company..."
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Website"
                  value={companyForm.website}
                  onChange={(e) => setCompanyForm(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://example.com"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={companyForm.phone}
                  onChange={(e) => setCompanyForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(555) 123-4567"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={companyForm.email}
                  onChange={(e) => setCompanyForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="contact@company.com"
                />
              </Grid>
            </Grid>
          ) : entityType === 'location' ? (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location Name"
                  value={locationForm.name}
                  onChange={(e) => setLocationForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  error={!locationForm.name.trim()}
                  helperText={!locationForm.name.trim() ? 'Location name is required' : ''}
                  placeholder="e.g., Main Office, Branch 1, Warehouse"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={locationForm.address}
                  onChange={(e) => setLocationForm(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Street address"
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="City"
                  value={locationForm.city}
                  onChange={(e) => setLocationForm(prev => ({ ...prev, city: e.target.value }))}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="State"
                  value={locationForm.state}
                  onChange={(e) => setLocationForm(prev => ({ ...prev, state: e.target.value }))}
                  placeholder="e.g., CA, NY, TX"
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="ZIP Code"
                  value={locationForm.zipCode}
                  onChange={(e) => setLocationForm(prev => ({ ...prev, zipCode: e.target.value }))}
                  placeholder="12345"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={locationForm.phone}
                  onChange={(e) => setLocationForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(555) 123-4567"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={locationForm.email}
                  onChange={(e) => setLocationForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="location@company.com"
                />
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={userForm.name}
                  onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  error={!userForm.name.trim()}
                  helperText={!userForm.name.trim() ? 'Name is required' : ''}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                  error={!userForm.email.trim()}
                  helperText={!userForm.email.trim() ? 'Email is required' : ''}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Role"
                  value={userForm.role}
                  onChange={(e) => setUserForm(prev => ({ ...prev, role: e.target.value }))}
                  placeholder="e.g., Manager, Staff, Administrator"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SecurityIcon /> Permissions
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, maxHeight: 300, overflow: 'auto' }}>
                  {AVAILABLE_PERMISSIONS.map((permission) => (
                    <Box key={permission.id} sx={{ mb: 1 }}>
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
                </Paper>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Selected: {userForm.permissions.length} permission{userForm.permissions.length !== 1 ? 's' : ''}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={() => setDialogOpen(false)}
            startIcon={<CancelIcon />}
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            onClick={entityType === 'company' ? handleSaveCompany : entityType === 'location' ? handleSaveLocation : handleSaveUser}
            variant="contained"
            startIcon={<SaveIcon />}
          >
            {dialogMode === 'add' ? 'Add' : 'Update'} {entityType === 'company' ? 'Company' : entityType === 'location' ? 'Location' : 'User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Tooltip title="Add Company">
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            zIndex: 1000
          }}
          onClick={handleAddCompany}
        >
          <AddIcon />
        </Fab>
      </Tooltip>

      {/* Notification Snackbar */}
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
          sx={{ borderRadius: 2 }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CompanyLocationManager;
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  InputAdornment,
  Button,
  Chip,
  Tabs,
  Tab,
  Paper,
  useTheme,
  alpha,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Material-UI Icons
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import DollarSignIcon from '@mui/icons-material/AttachMoney';
import FileTextIcon from '@mui/icons-material/Description';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BarChart3Icon from '@mui/icons-material/BarChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FileBarChartIcon from '@mui/icons-material/Assessment';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import MasterFile from './MasterFile';
import AnalyticsComponenet from '../components/AnalyticsComponenet';

// Styled components matching your Material-UI theme structure
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
  boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 16px 48px ${alpha(theme.palette.common.black, 0.12)}`
  }
}));

const FilterSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, 
    ${alpha(theme.palette.primary.main, 0.02)} 0%, 
    ${alpha(theme.palette.secondary.main, 0.01)} 50%, 
    ${alpha(theme.palette.primary.light, 0.01)} 100%)`,
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  padding: theme.spacing(3, 0),
  overflow: 'visible'
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  background: 'transparent',
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
    height: 3,
    borderRadius: '3px 3px 0 0'
  },
  '& .MuiTabs-flexContainer': {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1)
  }
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  minHeight: 64,
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '0.875rem',
  color: theme.palette.text.secondary,
  transition: 'all 0.3s ease',
  '&.Mui-selected': {
    color: theme.palette.primary.main,
    fontWeight: 600
  },
  '&:hover': {
    color: theme.palette.primary.main,
    background: alpha(theme.palette.primary.main, 0.04)
  },
  [theme.breakpoints.down('sm')]: {
    minWidth: 'auto',
    padding: theme.spacing(1, 1),
    '& .MuiTab-iconWrapper': {
      marginBottom: 0,
      marginRight: 0
    }
  }
}));

const ContentCard = styled(Card)(({ theme }) => ({
  marginTop: theme.spacing(3),
  borderRadius: 16,
  minHeight: 500,
  background: theme.palette.background.paper,
  boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.08)}`,
  overflow: 'hidden'
}));

const ActiveFilterChip = styled(Chip)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
  fontWeight: 500,
  '& .MuiChip-deleteIcon': {
    color: theme.palette.primary.contrastText,
    '&:hover': {
      color: alpha(theme.palette.primary.contrastText, 0.8)
    }
  }
}));

interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
}

const AnalyticsDashboard = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);

  // Sample data - replace with your actual data
  const availableLocations = ['Midtown East', 'Lenox Hill', 'Upper West Side', 'Downtown', 'Brooklyn Heights'];
  const availableCompanies = ['TechCorp', 'BuildCorp', 'ZTech', 'InnovateCo', 'GlobalTech'];

  const tabs = [
    { id: 0, label: 'Sales Analytics', icon: <DollarSignIcon /> },
    { id: 1, label: 'Master File', icon: <FileTextIcon /> },
    { id: 2, label: 'Store Orders', icon: <ShoppingCartIcon /> },
    { id: 3, label: 'Store Summary', icon: <BarChart3Icon /> },
    { id: 4, label: 'Financial Summary', icon: <TrendingUpIcon /> },
    { id: 5, label: 'Reports', icon: <FileBarChartIcon /> }
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const clearAllFilters = () => {
    setSelectedLocations([]);
    setSelectedCompanies([]);
  };

  const handleLocationChange = (event: any) => {
    const value = event.target.value;
    setSelectedLocations(typeof value === 'string' ? value.split(',') : value);
  };

  const handleCompanyChange = (event: any) => {
    const value = event.target.value;
    setSelectedCompanies(typeof value === 'string' ? value.split(',') : value);
  };

  const renderTabContent = (tabIndex: number) => {
    const tabInfo = [
      { 
        title: 'Sales Analytics', 
        description: 'Comprehensive sales data analysis and performance metrics', 
        icon: <DollarSignIcon sx={{ fontSize: 48, color: alpha(theme.palette.primary.main, 0.3) }} />,
        color: theme.palette.primary.main
      },
      { 
        title: 'Master File', 
        description: 'Central repository for all business data and records', 
        icon: <FileTextIcon sx={{ fontSize: 48, color: alpha(theme.palette.secondary.main, 0.3) }} />,
        color: theme.palette.secondary.main
      },
      { 
        title: 'Store Orders', 
        description: 'Order management and tracking system', 
        icon: <ShoppingCartIcon sx={{ fontSize: 48, color: alpha(theme.palette.info.main, 0.3) }} />,
        color: theme.palette.info.main
      },
      { 
        title: 'Store Summary', 
        description: 'Overview of store performance and key metrics', 
        icon: <BarChart3Icon sx={{ fontSize: 48, color: alpha(theme.palette.success.main, 0.3) }} />,
        color: theme.palette.success.main
      },
      { 
        title: 'Financial Summary', 
        description: 'Financial performance and analytics dashboard', 
        icon: <TrendingUpIcon sx={{ fontSize: 48, color: alpha(theme.palette.warning.main, 0.3) }} />,
        color: theme.palette.warning.main
      },
      { 
        title: 'Reports', 
        description: 'Generate and manage business reports', 
        icon: <FileBarChartIcon sx={{ fontSize: 48, color: alpha(theme.palette.error.main, 0.3) }} />,
        color: theme.palette.error.main
      }
    ];

    const currentTab = tabInfo[tabIndex];

    return (
      <Box 
        sx={{ 
          p: 6, 
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 400,
          background: `linear-gradient(135deg, ${alpha(currentTab.color, 0.02)} 0%, transparent 100%)`
        }}
      >
        <Box sx={{ 
          mb: 4,
          p: 3,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${alpha(currentTab.color, 0.1)} 0%, ${alpha(currentTab.color, 0.05)} 100%)`,
          border: `2px solid ${alpha(currentTab.color, 0.1)}`
        }}>
          {currentTab.icon}
        </Box>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 600, 
            mb: 2, 
            color: currentTab.color,
            background: `linear-gradient(135deg, ${currentTab.color} 0%, ${alpha(currentTab.color, 0.7)} 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          {currentTab.title}
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: theme.palette.text.secondary,
            maxWidth: 500,
            lineHeight: 1.6,
            fontSize: '1.1rem'
          }}
        >
          {currentTab.description}
        </Typography>
        
        {/* Add sample content preview for Financial Summary */}
        {tabIndex === 4 && (
          <Box sx={{ mt: 4, width: '100%', maxWidth: 600 }}>
            <Card sx={{ 
              p: 3, 
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 100%)`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
            }}>
              <Typography variant="h6" sx={{ color: theme.palette.primary.main, mb: 2, textAlign: 'left' }}>
                Quick Preview
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Total Sales
                </Typography>
                <Typography variant="h6" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
                  $3,496,791.38
                </Typography>
              </Box>
            </Card>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(180deg, #fafafa 0%, #ffffff 100%)' }}>
      {/* Page Header */}
      <Box sx={{ 
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.primary.main, 0.1)} 0%, 
          ${alpha(theme.palette.secondary.main, 0.05)} 50%, 
          ${alpha(theme.palette.primary.light, 0.02)} 100%)`,
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        py: 4
      }}>
        <Container maxWidth="xl">
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700, 
              color: theme.palette.primary.main,
              textAlign: 'center',
              mb: 1
            }}
          >
            Analytics Dashboard
          </Typography>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: theme.palette.text.secondary,
              textAlign: 'center'
            }}
          >
            Comprehensive business intelligence and reporting platform
          </Typography>
        </Container>
      </Box>

      {/* Filters Section */}
      <FilterSection>
        <Container maxWidth="xl">
          <StyledCard sx={{ p: 4, overflow: 'visible' }}>
            {/* Filter Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
              <FilterListIcon sx={{ color: theme.palette.primary.main }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                Filters
              </Typography>
            </Box>

            {/* Filter Controls */}
            <Grid container spacing={3} sx={{ mb: 4, overflow: 'visible' }}>
              {/* Location Filter */}
              <Grid item xs={12} lg={6}>
                <FormControl fullWidth>
                  <InputLabel id="location-select-label">Location</InputLabel>
                  <Select
                    labelId="location-select-label"
                    multiple
                    value={selectedLocations}
                    onChange={handleLocationChange}
                    input={<OutlinedInput label="Location" />}
                    renderValue={(selected) => 
                      selected.length === 0 
                        ? 'All locations initially selected'
                        : `${selected.length} location(s) selected`
                    }
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                          backgroundColor: '#ffffff',
                          border: '2px solid #1976d2',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                        },
                      },
                      anchorOrigin: {
                        vertical: 'bottom',
                        horizontal: 'left',
                      },
                      transformOrigin: {
                        vertical: 'top',
                        horizontal: 'left',
                      },
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: theme.palette.primary.main
                        }
                      }
                    }}
                  >
                    <MenuItem
                      value=""
                      onClick={() => {
                        if (selectedLocations.length === availableLocations.length) {
                          setSelectedLocations([]);
                        } else {
                          setSelectedLocations(availableLocations);
                        }
                      }}
                      sx={{ 
                        backgroundColor: '#ffffff',
                        '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.04) }
                      }}
                    >
                      <Checkbox
                        checked={selectedLocations.length === availableLocations.length}
                        indeterminate={selectedLocations.length > 0 && selectedLocations.length < availableLocations.length}
                      />
                      <ListItemText primary="Select All" />
                    </MenuItem>
                    {availableLocations.map((location) => (
                      <MenuItem 
                        key={location} 
                        value={location}
                        sx={{ 
                          backgroundColor: '#ffffff',
                          '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.04) }
                        }}
                      >
                        <Checkbox checked={selectedLocations.indexOf(location) > -1} />
                        <ListItemText primary={location} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Company Filter */}
              <Grid item xs={12} lg={6}>
                <FormControl fullWidth>
                  <InputLabel id="company-select-label">Companies</InputLabel>
                  <Select
                    labelId="company-select-label"
                    multiple
                    value={selectedCompanies}
                    onChange={handleCompanyChange}
                    input={<OutlinedInput label="Companies" />}
                    renderValue={(selected) => 
                      selected.length === 0 
                        ? 'All companies initially selected'
                        : `${selected.length} company(s) selected`
                    }
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                          backgroundColor: '#ffffff',
                          border: '2px solid #1976d2',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                        },
                      },
                      anchorOrigin: {
                        vertical: 'bottom',
                        horizontal: 'left',
                      },
                      transformOrigin: {
                        vertical: 'top',
                        horizontal: 'left',
                      },
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: theme.palette.primary.main
                        }
                      }
                    }}
                  >
                    <MenuItem
                      value=""
                      onClick={() => {
                        if (selectedCompanies.length === availableCompanies.length) {
                          setSelectedCompanies([]);
                        } else {
                          setSelectedCompanies(availableCompanies);
                        }
                      }}
                      sx={{ 
                        backgroundColor: '#ffffff',
                        '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.04) }
                      }}
                    >
                      <Checkbox
                        checked={selectedCompanies.length === availableCompanies.length}
                        indeterminate={selectedCompanies.length > 0 && selectedCompanies.length < availableCompanies.length}
                      />
                      <ListItemText primary="Select All" />
                    </MenuItem>
                    {availableCompanies.map((company) => (
                      <MenuItem 
                        key={company} 
                        value={company}
                        sx={{ 
                          backgroundColor: '#ffffff',
                          '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.04) }
                        }}
                      >
                        <Checkbox checked={selectedCompanies.indexOf(company) > -1} />
                        <ListItemText primary={company} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Active Filters */}
            {(selectedLocations.length > 0 || selectedCompanies.length > 0) && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: theme.palette.text.primary }}>
                  Active Filters:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedLocations.map((location) => (
                    <ActiveFilterChip
                      key={location}
                      label={`Location: ${location}`}
                      onDelete={() => setSelectedLocations(prev => prev.filter(l => l !== location))}
                      deleteIcon={<CloseIcon />}
                    />
                  ))}
                  {selectedCompanies.map((company) => (
                    <ActiveFilterChip
                      key={company}
                      label={`Company: ${company}`}
                      onDelete={() => setSelectedCompanies(prev => prev.filter(c => c !== company))}
                      deleteIcon={<CloseIcon />}
                    />
                  ))}
                  {(selectedLocations.length > 0 || selectedCompanies.length > 0) && (
                    <Button
                      size="small"
                      onClick={clearAllFilters}
                      sx={{ ml: 1, textTransform: 'none' }}
                    >
                      Clear All
                    </Button>
                  )}
                </Box>
              </Box>
            )}

            {/* Apply Filters Button */}
            <Button 
              variant="contained" 
              size="large"
              sx={{ 
                px: 4, 
                py: 1.5, 
                borderRadius: 2,
                textTransform: 'uppercase',
                fontWeight: 600,
                boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                '&:hover': {
                  boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`
                }
              }}
            >
              Apply Filters
            </Button>
          </StyledCard>
        </Container>
      </FilterSection>

      {/* Tab Content with Integrated Navigation */}
      <Container maxWidth="xl">
        <ContentCard>
          {/* Navigation Tabs Inside Card */}
          <Box sx={{ borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <StyledTabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                '& .MuiTabs-flexContainer': {
                  borderBottom: 'none'
                },
                '& .MuiTabs-indicator': {
                  bottom: 0
                }
              }}
            >
              {tabs.map((tab) => (
                <StyledTab
                  key={tab.id}
                  icon={tab.icon}
                  label={<Box sx={{ display: { xs: 'none', sm: 'block' } }}>{tab.label}</Box>}
                  iconPosition="start"
                  sx={{
                    mx: 1,
                    minHeight: 56,
                    '&:first-of-type': { ml: 2 },
                    '&:last-of-type': { mr: 2 }
                  }}
                />
              ))}
            </StyledTabs>
          </Box>

          {/* Tab Content */}
          {tabs.map((tab) => (
            <TabPanel key={tab.id} value={activeTab} index={tab.id}>
              {tab.id === 0 ? (
                // Sales Analytics Tab - Use AnalyticsComponenet
                <Box sx={{ p: 0 }}>
                  <AnalyticsComponenet 
                    selectedLocations={selectedLocations}
                    selectedCompanies={selectedCompanies}
                  />
                </Box>
              ) : tab.id === 1 ? (
                // Master File Tab - Use MasterFile
                <Box sx={{ p: 0 }}>
                  <MasterFile
                    selectedLocations={selectedLocations}
                    selectedCompanies={selectedCompanies}
                  />
                </Box>
              ) : (
                // Other tabs - Show placeholder content
                renderTabContent(tab.id)
              )}
            </TabPanel>
          ))}
        </ContentCard>
      </Container>
    </Box>
  );
};

export default AnalyticsDashboard;
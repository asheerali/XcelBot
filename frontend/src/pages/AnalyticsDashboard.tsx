import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  Grid,
  Button,
  Chip,
  Paper,
  useTheme,
  alpha,
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
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
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

const AnalyticsDashboard = () => {
  const theme = useTheme();
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);

  // Sample data - replace with your actual data
  const availableLocations = ['Midtown East', 'Lenox Hill', 'Upper West Side', 'Downtown', 'Brooklyn Heights'];
  const availableCompanies = ['TechCorp', 'BuildCorp', 'ZTech', 'InnovateCo', 'GlobalTech'];

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
            Sales Analytics Dashboard
          </Typography>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: theme.palette.text.secondary,
              textAlign: 'center'
            }}
          >
            Comprehensive sales data analysis and performance metrics
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

      {/* Analytics Content */}
      <Container maxWidth="xl">
        <ContentCard>
          <AnalyticsComponenet 
            selectedLocations={selectedLocations}
            selectedCompanies={selectedCompanies}
          />
        </ContentCard>
      </Container>
    </Box>
  );
};

export default AnalyticsDashboard;
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import TextField from '@mui/material/TextField';
import { styled, alpha } from '@mui/material/styles';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SendIcon from '@mui/icons-material/Send';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import BusinessIcon from '@mui/icons-material/Business';

// Styled components for modern design
const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, 
    ${theme.palette.primary.main}15 0%, 
    ${theme.palette.secondary.main}10 50%, 
    ${theme.palette.primary.light}08 100%)`,
  padding: theme.spacing(6, 0, 4),
  borderRadius: '0 0 32px 32px',
  position: 'relative',
  overflow: 'hidden',
  marginBottom: theme.spacing(6),
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'><circle cx=\'25\' cy=\'25\' r=\'1.5\' fill=\'%23ffffff\' opacity=\'0.1\'/><circle cx=\'75\' cy=\'45\' r=\'1\' fill=\'%23ffffff\' opacity=\'0.1\'/><circle cx=\'50\' cy=\'75\' r=\'0.8\' fill=\'%23ffffff\' opacity=\'0.1\'/></svg>")',
    backgroundSize: '80px 80px',
    pointerEvents: 'none'
  }
}));

const ModernCard = styled(Card)(({ theme }) => ({
  borderRadius: '20px',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  background: `linear-gradient(145deg, 
    ${theme.palette.background.paper} 0%, 
    ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 12px 24px -4px ${alpha(theme.palette.primary.main, 0.15)}`
  }
}));

const ContactCard = styled(ModernCard)(({ theme }) => ({
  padding: theme.spacing(4),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, 
      ${theme.palette.primary.main}, 
      ${theme.palette.secondary.main})`,
  }
}));

const ContactInfoItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  borderRadius: '12px',
  background: alpha(theme.palette.primary.main, 0.04),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    background: alpha(theme.palette.primary.main, 0.08),
    transform: 'translateX(4px)'
  }
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  width: 48,
  height: 48,
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: theme.spacing(2),
  background: `linear-gradient(135deg, 
    ${alpha(theme.palette.primary.main, 0.1)} 0%, 
    ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
}));

const ContactForm = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: '20px',
  background: `linear-gradient(145deg, 
    ${theme.palette.background.paper} 0%, 
    ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  backdropFilter: 'blur(10px)',
}));
const ContactSection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(10),
  padding: theme.spacing(6, 4),
  background: `linear-gradient(135deg, 
    ${alpha(theme.palette.grey[50], 0.8)} 0%, 
    ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
  borderRadius: '20px',
  textAlign: 'center',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  backdropFilter: 'blur(10px)'
}));

const ModernButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  padding: theme.spacing(1.5, 4),
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '1rem',
  background: `linear-gradient(135deg, 
    ${theme.palette.primary.main} 0%, 
    ${theme.palette.primary.dark} 100%)`,
  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
  '&:hover': {
    background: `linear-gradient(135deg, 
      ${theme.palette.primary.dark} 0%, 
      ${theme.palette.primary.main} 100%)`,
    boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
    transform: 'translateY(-2px)'
  }
}));

const FloatingElement = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  background: theme.palette.primary.main,
  opacity: 0.2,
  animation: 'float 8s ease-in-out infinite',
  '@keyframes float': {
    '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
    '50%': { transform: 'translateY(-30px) rotate(180deg)' }
  }
}));

export function ContactUs() {
  const [expanded, setExpanded] = useState<string | false>(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleFormChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission logic here
  };

  // Contact support information
  const supportInfo = {
    email: 'asheer.ali@kpi360.ai',
    phone: '+1 (555) 123-4567',
    hours: 'Monday - Friday: 9:00 AM - 6:00 PM EST',
    // address: '123 Business Ave, Suite 100, New York, NY 10001'
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, position: 'relative' }}>
      {/* Floating decorative elements */}
      <FloatingElement sx={{ top: '10%', left: '5%', animationDelay: '0s' }} />
      <FloatingElement sx={{ top: '30%', right: '10%', animationDelay: '2s' }} />
      <FloatingElement sx={{ bottom: '20%', left: '15%', animationDelay: '4s' }} />
      <FloatingElement sx={{ bottom: '40%', right: '5%', animationDelay: '6s' }} />

      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontWeight: 700,
                color: '#1a237e',
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                mb: 2,
                background: 'linear-gradient(135deg, #1a237e 0%, #1976d2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Get in Touch
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'text.secondary',
                fontSize: { xs: '1rem', sm: '1.25rem' },
                fontWeight: 400,
                maxWidth: '600px',
                mx: 'auto',
                lineHeight: 1.6
              }}
            >
              We're dedicated to providing exceptional service and innovative solutions to help your business succeed.
            </Typography>
          </Box>
        </Container>
      </HeroSection>

      <Grid container spacing={4}>
        {/* Contact Information */}
        <Grid item xs={12} md={6}>
          <ContactCard>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <SupportAgentIcon sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 600, color: '#1a237e' }}>
                Contact Support
              </Typography>
            </Box>

            <ContactInfoItem>
              <IconWrapper>
                <EmailIcon sx={{ color: 'primary.main', fontSize: 24 }} />
              </IconWrapper>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Email
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: 'primary.main',
                    fontWeight: 500,
                    cursor: 'pointer',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  {supportInfo.email}
                </Typography>
              </Box>
            </ContactInfoItem>

            <ContactInfoItem>
              <IconWrapper>
                <PhoneIcon sx={{ color: 'primary.main', fontSize: 24 }} />
              </IconWrapper>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Phone
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: 'primary.main',
                    fontWeight: 500,
                    cursor: 'pointer',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  {supportInfo.phone}
                </Typography>
              </Box>
            </ContactInfoItem>

            <ContactInfoItem>
              <IconWrapper>
                <AccessTimeIcon sx={{ color: 'primary.main', fontSize: 24 }} />
              </IconWrapper>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Business Hours
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {supportInfo.hours}
                </Typography>
              </Box>
            </ContactInfoItem>

            {/* <ContactInfoItem sx={{ mb: 0 }}>
              <IconWrapper>
                <LocationOnIcon sx={{ color: 'primary.main', fontSize: 24 }} />
              </IconWrapper>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Address
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {supportInfo.address}
                </Typography>
              </Box>
            </ContactInfoItem> */}
          </ContactCard>
        </Grid>

        {/* Contact Form */}
        <Grid item xs={12} md={6}>
          <ContactForm elevation={0}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <BusinessIcon sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 600, color: '#1a237e' }}>
                Send Email
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Your Name"
                    variant="outlined"
                    value={formData.name}
                    onChange={handleFormChange('name')}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'primary.main',
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    variant="outlined"
                    value={formData.email}
                    onChange={handleFormChange('email')}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'primary.main',
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Subject"
                    variant="outlined"
                    value={formData.subject}
                    onChange={handleFormChange('subject')}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'primary.main',
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Message"
                    variant="outlined"
                    multiline
                    rows={6}
                    value={formData.message}
                    onChange={handleFormChange('message')}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'primary.main',
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ModernButton
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    endIcon={<SendIcon />}
                  >
                    Send Email
                  </ModernButton>
                </Grid>
              </Grid>
            </Box>
          </ContactForm>
        </Grid>
      </Grid>

      <ContactSection>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
            <EmailIcon sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 600,
                color: '#1a237e'
              }}
            >
              Still Need Help?
            </Typography>
          </Box>
          
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'text.secondary',
              fontSize: '1.1rem',
              lineHeight: 1.6,
              mb: 3
            }}
          >
            Can't find what you're looking for? Our dedicated support team is always ready to assist you.
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="body1" color="text.secondary">
              Email us at
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                fontWeight: 600,
                color: 'primary.main',
                background: alpha('#1976d2', 0.1),
                px: 2,
                py: 0.5,
                borderRadius: '8px',
                fontSize: '1.1rem'
              }}
            >
              support@kpi360.ai
            </Typography>
          </Box>
        </ContactSection>
    </Container>
  );
}
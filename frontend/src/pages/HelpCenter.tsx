import React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { styled, alpha } from '@mui/material/styles';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EmailIcon from '@mui/icons-material/Email';

// Styled components for modern design
const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, 
    ${theme.palette.primary.main}20 0%, 
    ${theme.palette.secondary.main}15 50%, 
    ${theme.palette.primary.light}10 100%)`,
  padding: theme.spacing(8, 0, 6),
  borderRadius: '0 0 24px 24px',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'><circle cx=\'20\' cy=\'20\' r=\'2\' fill=\'%23ffffff\' opacity=\'0.1\'/><circle cx=\'80\' cy=\'40\' r=\'1.5\' fill=\'%23ffffff\' opacity=\'0.1\'/><circle cx=\'60\' cy=\'80\' r=\'1\' fill=\'%23ffffff\' opacity=\'0.1\'/></svg>")',
    backgroundSize: '100px 100px',
    pointerEvents: 'none'
  }
}));

const ModernCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  padding: theme.spacing(4),
  borderRadius: '20px',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  background: `linear-gradient(145deg, 
    ${theme.palette.background.paper} 0%, 
    ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
  backdropFilter: 'blur(10px)',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
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
    transform: 'translateY(-4px)',
    transition: 'transform 0.4s ease'
  },
  '&:hover': {
    transform: 'translateY(-12px) scale(1.02)',
    boxShadow: `0 20px 40px -8px ${alpha(theme.palette.primary.main, 0.25)}`,
    '&::before': {
      transform: 'translateY(0)'
    }
  }
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: '20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(3),
  background: `linear-gradient(135deg, 
    ${alpha(theme.palette.primary.main, 0.1)} 0%, 
    ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  transition: 'all 0.3s ease',
  '.MuiCard-root:hover &': {
    transform: 'rotate(5deg) scale(1.1)',
    background: `linear-gradient(135deg, 
      ${alpha(theme.palette.primary.main, 0.2)} 0%, 
      ${alpha(theme.palette.secondary.main, 0.2)} 100%)`
  }
}));

const ModernButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  padding: theme.spacing(1.5, 3),
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

const FloatingElement = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  background: theme.palette.primary.main,
  opacity: 0.3,
  animation: 'float 6s ease-in-out infinite',
  '@keyframes float': {
    '0%, 100%': { transform: 'translateY(0px)' },
    '50%': { transform: 'translateY(-20px)' }
  }
}));

export function HelpCenter() {
  const navigate = useNavigate();
  
  const handleNavigation = (path: string): void => {
    navigate(path);
  };

  const helpOptions = [
    {
      icon: QuestionAnswerIcon,
      title: 'Frequently Asked Questions',
      description: 'Find instant answers to common questions about our platform, features, and best practices.',
      path: '/Faq',
      color: '#1976d2',
      delay: '0ms'
    },
    {
      icon: SupportAgentIcon,
      title: 'Technical Support',
      description: 'Get expert help from our support team for technical issues and troubleshooting.',
      path: '/ContactUs',
      color: '#9c27b0',
      delay: '100ms'
    },
    {
      icon: PeopleAltIcon,
      title: 'Meet Our Team',
      description: 'Connect with our team members for partnerships, business inquiries, and collaboration.',
      path: '/ContactTeam',
      color: '#ed6c02',
      delay: '200ms'
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(180deg, #fafafa 0%, #ffffff 100%)' }}>
      {/* Floating decorative elements */}
      <FloatingElement sx={{ top: '20%', left: '10%', animationDelay: '0s' }} />
      <FloatingElement sx={{ top: '60%', right: '15%', animationDelay: '2s' }} />
      <FloatingElement sx={{ bottom: '30%', left: '20%', animationDelay: '4s' }} />
      
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
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
                mb: 2,
                background: 'linear-gradient(135deg, #1a237e 0%, #1976d2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 4px 8px rgba(26, 35, 126, 0.1)'
              }}
            >
              Help Center
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
              Welcome to our comprehensive Help Center. We're here to support you every step of the way.
            </Typography>
          </Box>
        </Container>
      </HeroSection>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 6, mb: 8 }}>
        <Grid container spacing={4} justifyContent="center">
          {helpOptions.map((option, index) => {
            const IconComponent = option.icon;
            return (
              <Grid 
                item 
                xs={12} 
                md={4} 
                key={index}
                sx={{
                  animation: `fadeInUp 0.6s ease forwards`,
                  animationDelay: option.delay,
                  opacity: 0,
                  '@keyframes fadeInUp': {
                    from: {
                      opacity: 0,
                      transform: 'translateY(30px)'
                    },
                    to: {
                      opacity: 1,
                      transform: 'translateY(0)'
                    }
                  }
                }}
              >
                <ModernCard>
                  <IconWrapper>
                    <IconComponent 
                      sx={{ 
                        fontSize: 36, 
                        color: option.color,
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                      }} 
                    />
                  </IconWrapper>
                  
                  <Typography 
                    variant="h5" 
                    gutterBottom
                    sx={{
                      fontWeight: 600,
                      color: '#1a237e',
                      mb: 2
                    }}
                  >
                    {option.title}
                  </Typography>
                  
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: 'text.secondary',
                      mb: 4,
                      flexGrow: 1,
                      lineHeight: 1.6,
                      fontSize: '1rem'
                    }}
                  >
                    {option.description}
                  </Typography>
                  
                  <ModernButton
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={() => handleNavigation(option.path)}
                    endIcon={<ArrowForwardIcon />}
                  >
                    {index === 0 ? 'View FAQs' : index === 1 ? 'Get Support' : 'Meet The Team'}
                  </ModernButton>
                </ModernCard>
              </Grid>
            );
          })}
        </Grid>

        {/* Contact Section */}
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
    </Box>
  );
}
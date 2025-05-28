import React, { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import { styled, alpha } from "@mui/material/styles";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PersonIcon from "@mui/icons-material/Person";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import TwitterIcon from "@mui/icons-material/Twitter";
import LaunchIcon from "@mui/icons-material/Launch";

// Modern styled components
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
    background: 'url("data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 60 60\'><circle cx=\'30\' cy=\'30\' r=\'1.5\' fill=\'%23ffffff\' opacity=\'0.1\'/><circle cx=\'15\' cy=\'15\' r=\'1\' fill=\'%23ffffff\' opacity=\'0.1\'/><circle cx=\'45\' cy=\'45\' r=\'1\' fill=\'%23ffffff\' opacity=\'0.1\'/></svg>")',
    backgroundSize: '60px 60px',
    pointerEvents: 'none'
  }
}));

const TeamCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: '20px',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  background: `linear-gradient(145deg, 
    ${theme.palette.background.paper} 0%, 
    ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
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
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: `0 16px 32px -8px ${alpha(theme.palette.primary.main, 0.25)}`,
    '&::before': {
      transform: 'translateY(0)'
    }
  }
}));

const ProfileSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(3, 3, 2),
  position: 'relative'
}));

const AvatarWrapper = styled(Box)(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: '20px',
  background: `linear-gradient(135deg, 
    ${theme.palette.primary.main}20 0%, 
    ${theme.palette.secondary.main}20 100%)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.3s ease',
  '.MuiCard-root:hover &': {
    transform: 'rotate(5deg) scale(1.1)',
    background: `linear-gradient(135deg, 
      ${theme.palette.primary.main}30 0%, 
      ${theme.palette.secondary.main}30 100%)`
  }
}));

const ContactInfo = styled(Box)(({ theme }) => ({
  padding: theme.spacing(0, 3, 3),
  '& .contact-item': {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1.5, 2),
    margin: theme.spacing(0.5, 0),
    borderRadius: '12px',
    background: alpha(theme.palette.primary.main, 0.04),
    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    '&:hover': {
      background: alpha(theme.palette.primary.main, 0.08),
      transform: 'translateX(4px)',
      borderColor: alpha(theme.palette.primary.main, 0.2)
    }
  }
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  padding: theme.spacing(1, 2),
  margin: theme.spacing(0.5),
  textTransform: 'none',
  fontWeight: 500,
  transition: 'all 0.3s ease',
  '&.primary': {
    background: `linear-gradient(135deg, 
      ${theme.palette.primary.main} 0%, 
      ${theme.palette.primary.dark} 100%)`,
    color: 'white',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.3)}`
    }
  },
  '&.secondary': {
    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
    color: theme.palette.primary.main,
    '&:hover': {
      background: alpha(theme.palette.primary.main, 0.1),
      transform: 'translateY(-2px)'
    }
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
    '33%': { transform: 'translateY(-15px) rotate(120deg)' },
    '66%': { transform: 'translateY(10px) rotate(240deg)' }
  }
}));

export function ContactTeam() {
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  // Contact team information with enhanced details
  const teamMembers = [
    {
      name: "Afshin Shirazi",
      role: "CEO & Founder",
      email: "afshin.shirazi@kpi360.ai",
      phone: "+1 (555) 987-6543",
      description: "Visionary leader with 15+ years of experience in AI and business intelligence solutions.",
      linkedin: "https://linkedin.com/in/afshin-shirazi",
      twitter: "https://twitter.com/afshin_shirazi"
    },
    {
      name: "Asheer Ali",
      role: "CTO",
      email: "asheer.ali@kpi360.ai",
      phone: "+1 (555) 456-7890",
      description: "Technology expert specializing in scalable architecture and machine learning systems.",
      linkedin: "https://linkedin.com/in/asheer-ali",
      twitter: "https://twitter.com/asheer_ali"
    },
    {
      name: "Musawar Soomro",
      role: "Frontend Developer",
      email: "musawar.soomro@kpi360.ai",
      phone: "+1 (555) 234-5678",
      description: "Creative developer focused on building intuitive and performant user experiences.",
      linkedin: "https://linkedin.com/in/musawar-soomro",
      twitter: "https://twitter.com/musawar_soomro"
    },
  ];

  const handleEmailClick = (email: string) => {
    window.open(`mailto:${email}`, '_blank');
  };

  const handlePhoneClick = (phone: string) => {
    window.open(`tel:${phone}`, '_blank');
  };

  const handleSocialClick = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(180deg, #fafafa 0%, #ffffff 100%)' }}>
      {/* Floating decorative elements */}
      <FloatingElement sx={{ top: '15%', left: '8%', animationDelay: '0s' }} />
      <FloatingElement sx={{ top: '45%', right: '12%', animationDelay: '3s' }} />
      <FloatingElement sx={{ bottom: '25%', left: '15%', animationDelay: '6s' }} />
      
      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="lg">
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
              Meet Our Team
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'text.secondary',
                fontSize: { xs: '1rem', sm: '1.1rem' },
                fontWeight: 400,
                maxWidth: '600px',
                mx: 'auto',
                lineHeight: 1.6
              }}
            >
              Connect with the passionate individuals behind KPI360.ai who are dedicated to transforming your business intelligence experience.
            </Typography>
          </Box>
        </Container>
      </HeroSection>

      {/* Contact Team Section */}
      <Container maxWidth="lg" sx={{ pb: 8 }}>
        <Box id="contact-team">
          <Grid container spacing={4} justifyContent="center">
            {teamMembers.map((member, index) => (
              <Grid 
                item 
                xs={12} 
                md={4} 
                key={index}
                sx={{
                  animation: `slideInUp 0.6s ease forwards`,
                  animationDelay: `${index * 150}ms`,
                  opacity: 0,
                  '@keyframes slideInUp': {
                    from: {
                      opacity: 0,
                      transform: 'translateY(40px)'
                    },
                    to: {
                      opacity: 1,
                      transform: 'translateY(0)'
                    }
                  }
                }}
              >
                <TeamCard>
                  {/* Profile Section */}
                  <ProfileSection>
                    <AvatarWrapper>
                      <PersonIcon 
                        sx={{ 
                          fontSize: 40, 
                          color: 'primary.main',
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                        }} 
                      />
                    </AvatarWrapper>
                    
                    <Typography 
                      variant="h5" 
                      sx={{
                        fontWeight: 600,
                        color: '#1a237e',
                        mb: 0.5,
                        textAlign: 'center'
                      }}
                    >
                      {member.name}
                    </Typography>
                    
                    <Typography
                      variant="subtitle1"
                      sx={{
                        color: 'primary.main',
                        fontWeight: 500,
                        mb: 2,
                        textAlign: 'center'
                      }}
                    >
                      {member.role}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        textAlign: 'center',
                        lineHeight: 1.5,
                        px: 1
                      }}
                    >
                      {member.description}
                    </Typography>
                  </ProfileSection>

                  <Divider sx={{ mx: 2 }} />

                  {/* Contact Information */}
                  <ContactInfo>
                    <Box 
                      className="contact-item"
                      onClick={() => handleEmailClick(member.email)}
                    >
                      <EmailIcon
                        sx={{
                          mr: 2,
                          color: "primary.main",
                          fontSize: 20,
                        }}
                      />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Email
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {member.email}
                        </Typography>
                      </Box>
                      <LaunchIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    </Box>

                    <Box 
                      className="contact-item"
                      onClick={() => handlePhoneClick(member.phone)}
                    >
                      <PhoneIcon
                        sx={{
                          mr: 2,
                          color: "primary.main",
                          fontSize: 20,
                        }}
                      />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Phone
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {member.phone}
                        </Typography>
                      </Box>
                      <LaunchIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    </Box>

                 
                  </ContactInfo>
                </TeamCard>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Additional Contact Information
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: '20px',
              background: `linear-gradient(135deg, 
                ${alpha('#1976d2', 0.05)} 0%, 
                ${alpha('#9c27b0', 0.05)} 100%)`,
              border: `1px solid ${alpha('#1976d2', 0.1)}`
            }}
          >
            <LocationOnIcon sx={{ fontSize: 32, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a237e', mb: 1 }}>
              Our Location
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              123 Innovation Drive, Tech Valley, CA 94000
            </Typography>
            <Typography variant="body2" color="text.secondary">
              We're always excited to meet new partners and discuss how we can help transform your business with AI-powered insights.
            </Typography>
          </Paper>
        </Box> */}
      </Container>
    </Box>
  );
}
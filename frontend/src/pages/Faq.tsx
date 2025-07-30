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
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import { styled, alpha } from '@mui/material/styles';

// Styled components matching the Help Center design
const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, 
    ${theme.palette.primary.main}20 0%, 
    ${theme.palette.secondary.main}15 50%, 
    ${theme.palette.primary.light}10 100%)`,
  padding: theme.spacing(6, 0, 4),
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
  borderRadius: '20px',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  background: `linear-gradient(145deg, 
    ${theme.palette.background.paper} 0%, 
    ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
  backdropFilter: 'blur(10px)',
  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 16px 48px ${alpha(theme.palette.primary.main, 0.15)}`
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

const ModernAccordion = styled(Accordion)(({ theme }) => ({
  borderRadius: '12px !important',
  marginBottom: theme.spacing(2),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  background: `linear-gradient(145deg, 
    ${theme.palette.background.paper} 0%, 
    ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
  backdropFilter: 'blur(10px)',
  boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.08)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.12)}`
  },
  '&.Mui-expanded': {
    transform: 'translateY(-4px)',
    boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.15)}`,
    background: `linear-gradient(145deg, 
      ${theme.palette.background.paper} 0%, 
      ${alpha(theme.palette.primary.main, 0.05)} 100%)`
  },
  '&:before': {
    display: 'none'
  }
}));

const ModernAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  borderRadius: '12px',
  '& .MuiAccordionSummary-content': {
    margin: theme.spacing(1, 0)
  },
  '& .MuiAccordionSummary-expandIconWrapper': {
    color: theme.palette.primary.main,
    transition: 'all 0.3s ease',
    '&.Mui-expanded': {
      transform: 'rotate(180deg)',
      color: theme.palette.primary.dark
    }
  }
}));

const ModernAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
  padding: theme.spacing(0, 3, 3, 3),
  background: alpha(theme.palette.primary.main, 0.02),
  borderRadius: '0 0 12px 12px'
}));

const ContactCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '16px',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  background: `linear-gradient(145deg, 
    ${theme.palette.background.paper} 0%, 
    ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  height: '100%',
  '&:hover': {
    transform: 'translateY(-6px)',
    boxShadow: `0 16px 40px ${alpha(theme.palette.primary.main, 0.15)}`
  }
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

export function Faq() {
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  // Enhanced FAQ questions with more comprehensive content
  const faqs = [
    {
      id: 'panel1',
      question: 'What services do you offer?',
      answer: 'We offer a comprehensive range of services including software development, consulting, and technical support for businesses of all sizes. Our expertise spans across web applications, mobile development, cloud solutions, and enterprise software integration.'
    },
    {
      id: 'panel2',
      question: 'How can I get started with your platform?',
      answer: 'Getting started is easy! Simply create an account, explore our comprehensive documentation, and take advantage of our guided onboarding process. Our support team is available to assist you every step of the way, ensuring a smooth transition to our platform.'
    },
    {
      id: 'panel3',
      question: 'What are your business hours?',
      answer: 'Our support team is available Monday through Friday from 9:00 AM to 6:00 PM EST. For urgent matters, we provide 24/7 emergency support. Additionally, our online resources and documentation are available around the clock.'
    },
    {
      id: 'panel4',
      question: 'Do you offer custom solutions?',
      answer: 'Absolutely! We specialize in creating custom solutions tailored to your specific business needs and requirements. Our team of experts will work closely with you to understand your goals and deliver solutions that drive results.'
    },
    {
      id: 'panel5',
      question: 'What kind of support do you provide?',
      answer: 'We provide comprehensive support including technical assistance, training resources, documentation, video tutorials, and dedicated account management. Our multi-tiered support system ensures you get the help you need when you need it.'
    },
    {
      id: 'panel6',
      question: 'How secure is your platform?',
      answer: 'Security is our top priority. We implement industry-standard encryption, regular security audits, multi-factor authentication, and comply with major security frameworks including SOC 2 and ISO 27001. Your data is protected with enterprise-grade security measures.'
    }
  ];

  // Contact support information
  const supportInfo = {
    email: 'support@kpi360.ai',
    phone: '+1 (555) 123-4567',
    hours: 'Monday - Friday: 9:00 AM - 6:00 PM EST'
  };

  // Contact team information
  const teamMembers = [
    {
      name: 'Jane Smith',
      role: 'Customer Success Manager',
      email: 'jane.smith@kpi360.ai',
      phone: '+1 (555) 987-6543'
    },
    {
      name: 'John Doe',
      role: 'Technical Support Lead',
      email: 'john.doe@kpi360.ai',
      phone: '+1 (555) 456-7890'
    },
    {
      name: 'Sarah Johnson',
      role: 'Sales Representative',
      email: 'musawar.soomro@kpi360.ai',
      phone: '+1 (555) 234-5678'
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(180deg, #fafafa 0%, #ffffff 100%)' }}>
      {/* Floating decorative elements */}
      <FloatingElement sx={{ top: '15%', left: '8%', animationDelay: '0s' }} />
      <FloatingElement sx={{ top: '40%', right: '12%', animationDelay: '2s' }} />
      <FloatingElement sx={{ bottom: '25%', left: '15%', animationDelay: '4s' }} />
      
      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <QuestionAnswerIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontWeight: 700,
                  color: '#1a237e',
                  fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.8rem' },
                  background: 'linear-gradient(135deg, #1a237e 0%, #1976d2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Frequently Asked Questions
              </Typography>
            </Box>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'text.secondary',
                fontSize: { xs: '0.95rem', sm: '1.1rem' },
                fontWeight: 400,
                maxWidth: '600px',
                mx: 'auto',
                lineHeight: 1.6
              }}
            >
              Find answers to common questions about our services, platform, and support options.
            </Typography>
          </Box>
        </Container>
      </HeroSection>

      <Container maxWidth="lg" sx={{ mt: 6, mb: 8 }}>
        {/* FAQs Section */}
        <Box id="faqs" sx={{ mb: 8 }}>
          <ModernCard sx={{ p: 4 }}>
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 600,
                  color: '#1a237e',
                  textAlign: 'center',
                  mb: 1
                }}
              >
                Common Questions & Answers
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'text.secondary',
                  textAlign: 'center',
                  mb: 4
                }}
              >
                Click on any question below to view the detailed answer
              </Typography>
            </Box>

            <Box sx={{ maxWidth: '900px', mx: 'auto' }}>
              {faqs.map((faq, index) => (
                <Box
                  key={faq.id}
                  sx={{
                    animation: `fadeInUp 0.5s ease forwards`,
                    animationDelay: `${index * 0.1}s`,
                    opacity: 0,
                    '@keyframes fadeInUp': {
                      from: {
                        opacity: 0,
                        transform: 'translateY(20px)'
                      },
                      to: {
                        opacity: 1,
                        transform: 'translateY(0)'
                      }
                    }
                  }}
                >
                  <ModernAccordion
                    expanded={expanded === faq.id}
                    onChange={handleChange(faq.id)}
                  >
                    <ModernAccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls={`${faq.id}-content`}
                      id={`${faq.id}-header`}
                    >
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          fontWeight: 600,
                          color: '#1a237e',
                          fontSize: '1.1rem'
                        }}
                      >
                        {faq.question}
                      </Typography>
                    </ModernAccordionSummary>
                    <ModernAccordionDetails>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          color: 'text.secondary',
                          lineHeight: 1.7,
                          fontSize: '1rem'
                        }}
                      >
                        {faq.answer}
                      </Typography>
                    </ModernAccordionDetails>
                  </ModernAccordion>
                </Box>
              ))}
            </Box>
          </ModernCard>
        </Box>


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
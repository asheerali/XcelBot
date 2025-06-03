import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Button,
  Card,
  CardContent,
  Grid,
  AppBar,
  Toolbar,
  useTheme,
  useMediaQuery,
  Fade,
  Grow,
  Paper,
  Avatar,
  IconButton,
  Dialog,
  DialogContent,
  TextField,
  InputAdornment,
  Divider,
  Alert,
  CircularProgress,
  Backdrop,
  Slide,
  Zoom
} from '@mui/material';
import { styled, alpha, keyframes } from '@mui/material/styles';

// Icons
import AnalyticsIcon from '@mui/icons-material/Analytics';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import GoogleIcon from '@mui/icons-material/Google';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BusinessIcon from '@mui/icons-material/Business';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

// Enhanced Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(2deg); }
`;

const slideInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(66, 133, 244, 0.4); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(66, 133, 244, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(66, 133, 244, 0); }
`;

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const bounce = keyframes`
  0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
  40%, 43% { transform: translateY(-10px); }
  70% { transform: translateY(-5px); }
`;

// Styled Components
const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, 
    ${theme.palette.primary.main}15 0%, 
    ${theme.palette.secondary.main}10 50%, 
    ${theme.palette.primary.light}05 100%)`,
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'><defs><pattern id=\'grain\' width=\'100\' height=\'100\' patternUnits=\'userSpaceOnUse\'><circle cx=\'25\' cy=\'25\' r=\'1\' fill=\'%23ffffff\' opacity=\'0.05\'/><circle cx=\'75\' cy=\'75\' r=\'1\' fill=\'%23ffffff\' opacity=\'0.05\'/><circle cx=\'75\' cy=\'25\' r=\'1\' fill=\'%23ffffff\' opacity=\'0.05\'/><circle cx=\'25\' cy=\'75\' r=\'1\' fill=\'%23ffffff\' opacity=\'0.05\'/></pattern></defs><rect width=\'100\' height=\'100\' fill=\'url(%23grain)\'/></svg>")',
    pointerEvents: 'none',
  }
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  background: alpha(theme.palette.background.paper, 0.9),
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.1)}, transparent)`,
    transition: 'left 0.5s ease',
  },
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: `0 20px 60px ${alpha(theme.palette.primary.main, 0.25)}`,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
    '&::before': {
      left: '100%',
    }
  }
}));

const FloatingIcon = styled(Box)(({ theme }) => ({
  animation: `${float} 6s ease-in-out infinite`,
  borderRadius: '50%',
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  width: 80,
  height: 80,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    animation: `${pulse} 2s infinite`,
  }
}));

const GradientText = styled(Typography)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontWeight: 'bold',
}));

const AnimatedButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  padding: theme.spacing(1.5, 4),
  fontWeight: 600,
  fontSize: '1rem',
  textTransform: 'none',
  position: 'relative',
  overflow: 'hidden',
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  transition: 'all 0.3s ease',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, transparent, ${alpha('#ffffff', 0.2)}, transparent)`,
    transition: 'left 0.5s ease',
  },
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: `0 15px 35px ${alpha(theme.palette.primary.main, 0.4)}`,
    '&::before': {
      left: '100%',
    }
  }
}));

// UPDATED: Modern Footer with proper styling and animations
const ModernFooter = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, 
    #0f1419 0%, 
    #1a1f2e 50%, 
    #0f1419 100%)`,
  color: '#ffffff',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `radial-gradient(circle at 20% 50%, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 50%),
                  radial-gradient(circle at 80% 50%, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 50%)`,
    pointerEvents: 'none',
  }
}));

const FooterLink = styled(Typography)(({ theme }) => ({
  color: alpha('#ffffff', 0.7),
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  position: 'relative',
  display: 'inline-block',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -2,
    left: 0,
    width: 0,
    height: 2,
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    transition: 'width 0.3s ease',
  },
  '&:hover': {
    color: '#ffffff',
    transform: 'translateX(5px)',
    '&::after': {
      width: '100%',
    }
  }
}));

const SocialIconButton = styled(IconButton)(({ theme }) => ({
  background: alpha('#ffffff', 0.1),
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha('#ffffff', 0.2)}`,
  color: '#ffffff',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: alpha(theme.palette.primary.main, 0.8),
    transform: 'translateY(-3px) scale(1.1)',
    boxShadow: `0 10px 25px ${alpha(theme.palette.primary.main, 0.3)}`,
  }
}));

const ScrollToTopButton = styled(IconButton)(({ theme }) => ({
  position: 'fixed',
  bottom: 30,
  right: 30,
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: '#ffffff',
  width: 56,
  height: 56,
  boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`,
  transition: 'all 0.3s ease',
  zIndex: 1000,
  '&:hover': {
    transform: 'translateY(-5px) scale(1.1)',
    boxShadow: `0 15px 35px ${alpha(theme.palette.primary.main, 0.4)}`,
    animation: `${bounce} 1s ease`,
  }
}));

const LoginDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 20,
    background: `linear-gradient(135deg, 
      ${alpha(theme.palette.background.paper, 0.95)} 0%, 
      ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
    backdropFilter: 'blur(20px)',
    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
    boxShadow: `0 20px 60px ${alpha(theme.palette.common.black, 0.3)}`,
    overflow: 'visible',
  }
}));

const AuthCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 20,
  background: `linear-gradient(135deg, 
    ${alpha(theme.palette.background.paper, 0.98)} 0%, 
    ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow: `0 20px 60px ${alpha(theme.palette.common.black, 0.1)}`,
}));

const GoogleButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(1.5, 3),
  background: '#ffffff',
  color: '#757575',
  border: '2px solid #e0e0e0',
  fontWeight: 500,
  textTransform: 'none',
  fontSize: '1rem',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: '#f5f5f5',
    borderColor: '#4285f4',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 20px rgba(66, 133, 244, 0.2)',
  }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    background: alpha(theme.palette.background.paper, 0.8),
    transition: 'all 0.3s ease',
    '&:hover': {
      background: alpha(theme.palette.background.paper, 0.9),
    },
    '&.Mui-focused': {
      background: alpha(theme.palette.background.paper, 1),
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
    }
  }
}));

const SuccessIcon = styled(CheckCircleIcon)(({ theme }) => ({
  color: theme.palette.success.main,
  fontSize: 60,
  marginBottom: theme.spacing(2),
}));

// Main Component
const ModernHomepage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State management
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    company: ''
  });

  // Scroll to top functionality
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Sample data
  const features = [
    {
      icon: <AnalyticsIcon fontSize="large" />,
      title: "Sales Analytics",
      description: "Deep insights into your sales performance with interactive dashboards and real-time metrics.",
      color: "#4285f4"
    },
    {
      icon: <RestaurantIcon fontSize="large" />,
      title: "Product Mix Analysis",
      description: "Understand your menu performance and optimize product offerings for maximum profitability.",
      color: "#34a853"
    },
    {
      icon: <AttachMoneyIcon fontSize="large" />,
      title: "Financial Reporting",
      description: "Comprehensive financial dashboards with budget tracking and performance indicators.",
      color: "#ea4335"
    },
    {
      icon: <TrendingUpIcon fontSize="large" />,
      title: "Trend Forecasting",
      description: "Predictive analytics to help you stay ahead of market trends and customer preferences.",
      color: "#fbbc04"
    },
    {
      icon: <CloudUploadIcon fontSize="large" />,
      title: "Easy Data Import",
      description: "Simply upload your Excel files and get instant insights without complex setup.",
      color: "#9c27b0"
    },
    {
      icon: <SecurityIcon fontSize="large" />,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with cloud backup and 99.9% uptime guarantee.",
      color: "#ff5722"
    }
  ];

  const benefits = [
    {
      icon: <SpeedIcon />,
      title: "10x Faster Analysis",
      description: "Transform hours of manual work into minutes of automated insights."
    },
    {
      icon: <AutoGraphIcon />,
      title: "Real-time Dashboards",
      description: "Live data visualization that updates as your business grows."
    },
    {
      icon: <BusinessIcon />,
      title: "Multi-location Support",
      description: "Manage and compare performance across all your business locations."
    }
  ];

  // Event handlers (keeping existing handlers)
  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      setLoading(false);
      return;
    }

    if (!isLogin) {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }
      if (!formData.firstName || !formData.lastName) {
        setError('First name and last name are required');
        setLoading(false);
        return;
      }
    }

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setLoginOpen(false);
        setRegisterOpen(false);
        setLoading(false);
        // Redirect to dashboard
        window.location.href = '/manage-reports';
      }, 2000);
      
    } catch (err) {
      setError('Authentication failed. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    // Simulate Google OAuth
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setLoginOpen(false);
        setRegisterOpen(false);
        setLoading(false);
        window.location.href = '/manage-reports';
      }, 2000);
    } catch (err) {
      setError('Google authentication failed. Please try again.');
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      company: ''
    });
    setError('');
    setShowPassword(false);
  };

  const openLogin = () => {
    resetForm();
    setIsLogin(true);
    setLoginOpen(true);
  };

  const openRegister = () => {
    resetForm();
    setIsLogin(false);
    setRegisterOpen(true);
  };

  const switchMode = () => {
    resetForm();
    setIsLogin(!isLogin);
    if (isLogin) {
      setLoginOpen(false);
      setRegisterOpen(true);
    } else {
      setRegisterOpen(false);
      setLoginOpen(true);
    }
  };

  // Auth Dialog Content (keeping existing)
  const AuthDialogContent = () => (
    <Box sx={{ width: 400, maxWidth: '90vw' }}>
      {loading && (
        <Backdrop open sx={{ position: 'absolute', zIndex: 10, borderRadius: 5 }}>
          <CircularProgress color="primary" />
        </Backdrop>
      )}
      
      {success ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <SuccessIcon />
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            {isLogin ? 'Welcome Back!' : 'Account Created!'}
          </Typography>
          <Typography color="text.secondary">
            {isLogin ? 'Redirecting to your dashboard...' : 'Welcome to INSIGHTiQ! Redirecting...'}
          </Typography>
        </Box>
      ) : (
        <>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Avatar
              sx={{
                width: 60,
                height: 60,
                bgcolor: 'primary.main',
                mx: 'auto',
                mb: 2
              }}
            >
              <DashboardIcon fontSize="large" />
            </Avatar>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </Typography>
            <Typography color="text.secondary">
              {isLogin 
                ? 'Sign in to access your analytics dashboard' 
                : 'Join thousands of businesses using INSIGHTiQ'
              }
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Google Button */}
          <GoogleButton
            fullWidth
            onClick={handleGoogleLogin}
            startIcon={<GoogleIcon />}
            sx={{ mb: 2 }}
          >
            Continue with Google
          </GoogleButton>

          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary">
              or continue with email
            </Typography>
          </Divider>

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit}>
            {!isLogin && (
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <StyledTextField
                    fullWidth
                    label="First Name"
                    value={formData.firstName}
                    onChange={handleInputChange('firstName')}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <StyledTextField
                    fullWidth
                    label="Last Name"
                    value={formData.lastName}
                    onChange={handleInputChange('lastName')}
                  />
                </Grid>
              </Grid>
            )}

            {!isLogin && (
              <StyledTextField
                fullWidth
                label="Company (Optional)"
                value={formData.company}
                onChange={handleInputChange('company')}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            )}

            <StyledTextField
              fullWidth
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <StyledTextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange('password')}
              sx={{ mb: !isLogin ? 2 : 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {!isLogin && (
              <StyledTextField
                fullWidth
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            )}

            <AnimatedButton
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
              }}
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </AnimatedButton>
          </Box>

          {/* Switch Mode */}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <Button
                variant="text"
                onClick={switchMode}
                sx={{ 
                  fontWeight: 600,
                  textTransform: 'none',
                  color: 'primary.main'
                }}
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </Button>
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );

  return (
    <Box>
      {/* Navigation */}
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          background: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                mr: 2,
                width: 40,
                height: 40
              }}
            >
              <DashboardIcon />
            </Avatar>
            <GradientText variant="h5" sx={{ fontWeight: 700 }}>
              INSIGHTiQ
            </GradientText>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={openLogin}
              sx={{
                borderRadius: 3,
                px: 3,
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Sign In
            </Button>
            <AnimatedButton
              variant="contained"
              onClick={openRegister}
              sx={{
                px: 3,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Get Started
            </AnimatedButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Fade in timeout={1000}>
                <Box>
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: '2.5rem', md: '4rem' },
                      fontWeight: 800,
                      mb: 2,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      lineHeight: 1.1
                    }}
                  >
                    Transform Your Business Data
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontSize: { xs: '1.5rem', md: '2rem' },
                      fontWeight: 400,
                      mb: 3,
                      color: 'text.secondary',
                      lineHeight: 1.4
                    }}
                  >
                    Into Powerful Insights
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 4,
                      color: 'text.secondary',
                      maxWidth: 500,
                      lineHeight: 1.6
                    }}
                  >
                    Upload your Excel files and get instant analytics dashboards. 
                    Track sales, analyze trends, and make data-driven decisions with ease.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <AnimatedButton
                      variant="contained"
                      size="large"
                      onClick={openRegister}
                      sx={{
                        px: 4,
                        py: 2,
                        fontSize: '1.2rem',
                        fontWeight: 600,
                        textTransform: 'none',
                      }}
                    >
                      Start Free Trial
                    </AnimatedButton>
                    <Button
                      variant="outlined"
                      size="large"
                      sx={{
                        borderRadius: 4,
                        px: 4,
                        py: 2,
                        fontSize: '1.2rem',
                        fontWeight: 500,
                        textTransform: 'none',
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.2)}`,
                        }
                      }}
                    >
                      Watch Demo
                    </Button>
                  </Box>
                </Box>
              </Fade>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Grow in timeout={1500}>
                <Box sx={{ position: 'relative', textAlign: 'center' }}>
                  <Card
                    elevation={20}
                    sx={{
                      borderRadius: 4,
                      overflow: 'hidden',
                      background: `linear-gradient(135deg, 
                        ${alpha(theme.palette.background.paper, 0.9)} 0%, 
                        ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                      backdropFilter: 'blur(20px)',
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                      transform: 'perspective(1000px) rotateY(-5deg) rotateX(5deg)',
                      transition: 'transform 0.6s ease',
                      '&:hover': {
                        transform: 'perspective(1000px) rotateY(0deg) rotateX(0deg)',
                      }
                    }}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 3 }}>
                        <FloatingIcon sx={{ animationDelay: '0s' }}>
                          <AnalyticsIcon sx={{ color: 'white', fontSize: 30 }} />
                        </FloatingIcon>
                        <FloatingIcon sx={{ animationDelay: '2s' }}>
                          <TrendingUpIcon sx={{ color: 'white', fontSize: 30 }} />
                        </FloatingIcon>
                        <FloatingIcon sx={{ animationDelay: '4s' }}>
                          <ShowChartIcon sx={{ color: 'white', fontSize: 30 }} />
                        </FloatingIcon>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Real-time Analytics Dashboard
                      </Typography>
                      <Typography color="text.secondary">
                        See your business performance at a glance
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              </Grow>
            </Grid>
          </Grid>
        </Container>
      </HeroSection>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 700,
              mb: 2
            }}
          >
            Everything You Need to
            <GradientText component="span" sx={{ ml: 1 }}>
              Succeed
            </GradientText>
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: 'auto' }}
          >
            Powerful features designed to transform your data into actionable insights
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Grow in timeout={800 + index * 200}>
                <FeatureCard elevation={2}>
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Avatar
                      sx={{
                        width: 70,
                        height: 70,
                        bgcolor: feature.color,
                        mx: 'auto',
                        mb: 3,
                        boxShadow: `0 8px 25px ${alpha(feature.color, 0.3)}`
                      }}
                    >
                      {feature.icon}
                    </Avatar>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 600, mb: 2 }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      color="text.secondary"
                      sx={{ lineHeight: 1.6 }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </FeatureCard>
              </Grow>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Benefits Section */}
      <Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02), py: 10 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: '2rem', md: '3rem' },
                  fontWeight: 700,
                  mb: 3
                }}
              >
                Why Choose
                <GradientText component="span" sx={{ ml: 1 }}>
                  INSIGHTiQ?
                </GradientText>
              </Typography>
              
              {benefits.map((benefit, index) => (
                <Fade in timeout={1000 + index * 300} key={index}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 4 }}>
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        mr: 3,
                        mt: 0.5,
                        width: 50,
                        height: 50
                      }}
                    >
                      {benefit.icon}
                    </Avatar>
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 600, mb: 1 }}
                      >
                        {benefit.title}
                      </Typography>
                      <Typography
                        color="text.secondary"
                        sx={{ lineHeight: 1.6 }}
                      >
                        {benefit.description}
                      </Typography>
                    </Box>
                  </Box>
                </Fade>
              ))}
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative' }}>
                <Card
                  elevation={10}
                  sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    background: `linear-gradient(135deg, 
                      ${theme.palette.background.paper} 0%, 
                      ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                      📊 Sales Performance Dashboard
                    </Typography>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        This Week vs Last Week
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                          +24.5%
                        </Typography>
                        <TrendingUpIcon color="success" />
                      </Box>
                    </Box>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Revenue Growth
                      </Typography>
                      <Box sx={{ 
                        width: '100%', 
                        height: 8, 
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        borderRadius: 4,
                        overflow: 'hidden'
                      }}>
                        <Box sx={{
                          width: '78%',
                          height: '100%',
                          bgcolor: 'primary.main',
                          borderRadius: 4,
                          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                        }} />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        78% of monthly target reached
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          1,247
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Orders
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          $45.2K
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Revenue
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          $36.3
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Avg Ticket
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="md" sx={{ py: 10, textAlign: 'center' }}>
        <Card
          elevation={10}
          sx={{
            background: `linear-gradient(135deg, 
              ${theme.palette.primary.main} 0%, 
              ${theme.palette.primary.dark} 50%,
              ${theme.palette.secondary.main} 100%)`,
            borderRadius: 4,
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'url("data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'><defs><pattern id=\'stars\' width=\'20\' height=\'20\' patternUnits=\'userSpaceOnUse\'><circle cx=\'10\' cy=\'10\' r=\'1\' fill=\'%23ffffff\' opacity=\'0.1\'/></pattern></defs><rect width=\'100\' height=\'100\' fill=\'url(%23stars)\'/></svg>")',
              pointerEvents: 'none',
            }
          }}
        >
          <CardContent sx={{ p: 6, position: 'relative', zIndex: 1 }}>
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: '2rem', md: '2.5rem' },
                fontWeight: 700,
                mb: 2
              }}
            >
              Ready to Transform Your Business?
            </Typography>
            <Typography
              variant="h6"
              sx={{ mb: 4, opacity: 0.9, maxWidth: 500, mx: 'auto' }}
            >
              Join thousands of businesses already using INSIGHTiQ to make better decisions
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                onClick={openRegister}
                sx={{
                  borderRadius: 3,
                  px: 4,
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: alpha('#ffffff', 0.9),
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                  }
                }}
              >
                Start Your Free Trial
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  borderRadius: 3,
                  px: 4,
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: alpha('#ffffff', 0.1),
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                Contact Sales
              </Button>
            </Box>
            <Typography
              variant="body2"
              sx={{ mt: 3, opacity: 0.8 }}
            >
              No credit card required • 14-day free trial • Cancel anytime
            </Typography>
          </CardContent>
        </Card>
      </Container>

      {/* UPDATED: Modern Footer with enhanced styling and animations */}
      <ModernFooter sx={{ py: 8, position: 'relative', zIndex: 1 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6}>
            {/* Company Info */}
            <Grid item xs={12} md={4}>
              <Fade in timeout={1000}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        mr: 2,
                        width: 50,
                        height: 50,
                        boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`,
                      }}
                    >
                      <DashboardIcon fontSize="large" />
                    </Avatar>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 700, 
                        color: '#ffffff',
                        background: `linear-gradient(135deg, #ffffff, ${alpha('#ffffff', 0.8)})`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      INSIGHTiQ
                    </Typography>
                  </Box>
                  <Typography 
                    sx={{ 
                      mb: 3, 
                      color: alpha('#ffffff', 0.8),
                      lineHeight: 1.6,
                      fontSize: '1rem'
                    }}
                  >
                    Transform your business data into powerful insights with our advanced analytics platform.
                  </Typography>
                  
                  {/* Social Media Icons */}
                  <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <SocialIconButton size="small">
                      <LinkedInIcon />
                    </SocialIconButton>
                    <SocialIconButton size="small">
                      <TwitterIcon />
                    </SocialIconButton>
                    <SocialIconButton size="small">
                      <FacebookIcon />
                    </SocialIconButton>
                    <SocialIconButton size="small">
                      <InstagramIcon />
                    </SocialIconButton>
                  </Box>
                  
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: alpha('#ffffff', 0.6),
                      fontSize: '0.875rem'
                    }}
                  >
                    © 2025 INSIGHTiQ. All rights reserved.
                  </Typography>
                </Box>
              </Fade>
            </Grid>
            
            {/* Product Links */}
            <Grid item xs={12} sm={6} md={2}>
              <Slide direction="up" in timeout={1200}>
                <Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600, 
                      mb: 3, 
                      color: '#ffffff',
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: -8,
                        left: 0,
                        width: 30,
                        height: 2,
                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        borderRadius: 1,
                      }
                    }}
                  >
                    Product
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FooterLink variant="body2">Features</FooterLink>
                    <FooterLink variant="body2">Pricing</FooterLink>
                    <FooterLink variant="body2">Security</FooterLink>
                    <FooterLink variant="body2">Integrations</FooterLink>
                    <FooterLink variant="body2">API</FooterLink>
                  </Box>
                </Box>
              </Slide>
            </Grid>
            
            {/* Company Links */}
            <Grid item xs={12} sm={6} md={2}>
              <Slide direction="up" in timeout={1400}>
                <Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600, 
                      mb: 3, 
                      color: '#ffffff',
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: -8,
                        left: 0,
                        width: 30,
                        height: 2,
                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        borderRadius: 1,
                      }
                    }}
                  >
                    Company
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FooterLink variant="body2">About Us</FooterLink>
                    <FooterLink variant="body2">Blog</FooterLink>
                    <FooterLink variant="body2">Careers</FooterLink>
                    <FooterLink variant="body2">Contact</FooterLink>
                    <FooterLink variant="body2">News</FooterLink>
                  </Box>
                </Box>
              </Slide>
            </Grid>
            
            {/* Resources Links */}
            <Grid item xs={12} sm={6} md={2}>
              <Slide direction="up" in timeout={1600}>
                <Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600, 
                      mb: 3, 
                      color: '#ffffff',
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: -8,
                        left: 0,
                        width: 30,
                        height: 2,
                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        borderRadius: 1,
                      }
                    }}
                  >
                    Resources
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FooterLink variant="body2">Documentation</FooterLink>
                    <FooterLink variant="body2">Help Center</FooterLink>
                    <FooterLink variant="body2">Community</FooterLink>
                    <FooterLink variant="body2">Status</FooterLink>
                    <FooterLink variant="body2">Tutorials</FooterLink>
                  </Box>
                </Box>
              </Slide>
            </Grid>
            
            {/* Legal Links */}
            <Grid item xs={12} sm={6} md={2}>
              <Slide direction="up" in timeout={1800}>
                <Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600, 
                      mb: 3, 
                      color: '#ffffff',
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: -8,
                        left: 0,
                        width: 30,
                        height: 2,
                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        borderRadius: 1,
                      }
                    }}
                  >
                    Legal
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FooterLink variant="body2">Privacy Policy</FooterLink>
                    <FooterLink variant="body2">Terms of Service</FooterLink>
                    <FooterLink variant="body2">Cookie Policy</FooterLink>
                    <FooterLink variant="body2">GDPR</FooterLink>
                    <FooterLink variant="body2">Compliance</FooterLink>
                  </Box>
                </Box>
              </Slide>
            </Grid>
          </Grid>
          
          {/* Bottom Section */}
          <Divider 
            sx={{ 
              my: 6, 
              borderColor: alpha('#ffffff', 0.2),
              '&::before, &::after': {
                borderColor: alpha('#ffffff', 0.2),
              }
            }} 
          />
          
          <Fade in timeout={2000}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2
            }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: alpha('#ffffff', 0.7),
                  fontSize: '0.875rem'
                }}
              >
                Built with ❤️ for data-driven businesses worldwide
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: alpha('#ffffff', 0.7),
                  fontSize: '0.875rem'
                }}
              >
                Version 2.0.1 • Last updated: January 2025
              </Typography>
            </Box>
          </Fade>
        </Container>
      </ModernFooter>

      {/* Scroll to Top Button */}
      <Zoom in={showScrollToTop}>
        <ScrollToTopButton onClick={scrollToTop}>
          <ArrowUpwardIcon />
        </ScrollToTopButton>
      </Zoom>

      {/* Login Dialog */}
      <LoginDialog
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent sx={{ p: 0 }}>
          <AuthCard elevation={0}>
            <AuthDialogContent />
          </AuthCard>
        </DialogContent>
      </LoginDialog>

      {/* Register Dialog */}
      <LoginDialog
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent sx={{ p: 0 }}>
          <AuthCard elevation={0}>
            <AuthDialogContent />
          </AuthCard>
        </DialogContent>
      </LoginDialog>
    </Box>
  );
};

export default ModernHomepage;
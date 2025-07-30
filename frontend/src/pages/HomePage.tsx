import React, { useState, useEffect, useRef } from 'react';
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
  Slide,
  Zoom,
  Chip,
  LinearProgress,
  Rating,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Divider,
  TextField,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Snackbar,
  Alert,
  Badge,
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
import BusinessIcon from '@mui/icons-material/Business';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import GroupIcon from '@mui/icons-material/Group';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import InsightsIcon from '@mui/icons-material/Insights';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import DiamondIcon from '@mui/icons-material/Diamond';
import ChatIcon from '@mui/icons-material/Chat';
import EmailIcon from '@mui/icons-material/Email';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CodeIcon from '@mui/icons-material/Code';
import StorageIcon from '@mui/icons-material/Storage';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import DevicesIcon from '@mui/icons-material/Devices';
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import PieChartIcon from '@mui/icons-material/PieChart';
import AssessmentIcon from '@mui/icons-material/Assessment';
import InventoryIcon from '@mui/icons-material/Inventory';
import WorkflowIcon from '@mui/icons-material/AccountTree';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle';
import PersonIcon from '@mui/icons-material/Person';

// Advanced Animations
const morphing = keyframes`
  0%, 100% { 
    clip-path: polygon(40% 40%, 20% 40%, 40% 20%, 60% 20%, 60% 40%, 80% 40%, 80% 60%, 60% 60%, 60% 80%, 40% 80%);
  }
  50% { 
    clip-path: polygon(20% 60%, 20% 20%, 60% 20%, 60% 40%, 80% 40%, 80% 80%, 40% 80%, 40% 60%, 20% 60%, 20% 60%);
  }
`;

const parallaxFloat = keyframes`
  0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
  25% { transform: translateY(-20px) translateX(10px) rotate(5deg); }
  50% { transform: translateY(-10px) translateX(-5px) rotate(-3deg); }
  75% { transform: translateY(-30px) translateX(15px) rotate(7deg); }
`;

const liquidMove = keyframes`
  0%, 100% { transform: translateY(0px) scale(1) rotate(0deg); }
  33% { transform: translateY(-15px) scale(1.1) rotate(120deg); }
  66% { transform: translateY(-25px) scale(0.9) rotate(240deg); }
`;

const textGlow = keyframes`
  0%, 100% { text-shadow: 0 0 20px rgba(66, 133, 244, 0.5); }
  50% { text-shadow: 0 0 40px rgba(66, 133, 244, 0.8), 0 0 60px rgba(66, 133, 244, 0.4); }
`;

const slideUpStagger = keyframes`
  from {
    opacity: 0;
    transform: translateY(60px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const rippleEffect = keyframes`
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
`;

const gradientMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const holographic = keyframes`
  0%, 100% { 
    filter: hue-rotate(0deg) saturate(1); 
    box-shadow: 0 0 50px rgba(66, 133, 244, 0.3);
  }
  25% { 
    filter: hue-rotate(90deg) saturate(1.2); 
    box-shadow: 0 0 50px rgba(138, 43, 226, 0.3);
  }
  50% { 
    filter: hue-rotate(180deg) saturate(1.4); 
    box-shadow: 0 0 50px rgba(255, 20, 147, 0.3);
  }
  75% { 
    filter: hue-rotate(270deg) saturate(1.2); 
    box-shadow: 0 0 50px rgba(0, 191, 255, 0.3);
  }
`;

const scrollFadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const scrollSlideLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-40px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const scrollSlideRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(40px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const scrollZoomIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const scrollRotateIn = keyframes`
  from {
    opacity: 0;
    transform: rotate(-10deg) scale(0.9);
  }
  to {
    opacity: 1;
    transform: rotate(0deg) scale(1);
  }
`;

const scrollBounceIn = keyframes`
  0% {
    opacity: 0;
    transform: translateY(60px) scale(0.3);
  }
  50% {
    opacity: 1;
    transform: translateY(-10px) scale(1.05);
  }
  70% {
    transform: translateY(5px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const interactiveHover = keyframes`
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-5px) scale(1.02);
  }
`;

const graphPulse = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(66, 133, 244, 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba(66, 133, 244, 0.6), 0 0 60px rgba(66, 133, 244, 0.3);
  }
`;

const modernGraphGlow = keyframes`
  0%, 100% {
    border-color: rgba(66, 133, 244, 0.3);
    box-shadow: 0 8px 25px rgba(66, 133, 244, 0.2);
  }
  50% {
    border-color: rgba(66, 133, 244, 0.8);
    box-shadow: 0 12px 35px rgba(66, 133, 244, 0.4);
  }
`;

const floatingCircle = keyframes`
  0%, 100% { 
    transform: translate(0, 0) scale(1);
    opacity: 0.7;
  }
  25% { 
    transform: translate(20px, -30px) scale(1.1);
    opacity: 0.9;
  }
  50% { 
    transform: translate(-15px, -20px) scale(0.9);
    opacity: 0.8;
  }
  75% { 
    transform: translate(25px, -40px) scale(1.05);
    opacity: 0.85;
  }
`;

// Styled Components
const HeroContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: `
    radial-gradient(circle at 20% 50%, ${alpha(theme.palette.primary.main, 0.15)} 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, ${alpha(theme.palette.secondary.main, 0.15)} 0%, transparent 50%),
    radial-gradient(circle at 40% 80%, ${alpha(theme.palette.error.main, 0.1)} 0%, transparent 50%),
    linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)
  `,
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  paddingTop: '80px',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23${theme.palette.primary.main.slice(1)}' fill-opacity='0.03'%3E%3Ccircle cx='7' cy='7' r='3'/%3E%3Ccircle cx='53' cy='53' r='3'/%3E%3Ccircle cx='53' cy='7' r='3'/%3E%3Ccircle cx='7' cy='53' r='3'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    pointerEvents: 'none',
  }
}));

const FloatingCircle = styled(Box)(({ theme }) => ({
  position: 'absolute',
  borderRadius: '50%',
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.8)}, ${alpha(theme.palette.secondary.main, 0.8)})`,
  animation: `${floatingCircle} 8s ease-in-out infinite`,
  boxShadow: `0 10px 30px ${alpha(theme.palette.primary.main, 0.3)}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontSize: '2rem',
  zIndex: 1,
  backdropFilter: 'blur(10px)',
}));

const GlassCard = styled(Card)(({ theme }) => ({
  background: alpha(theme.palette.background.paper, 0.1),
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  borderRadius: 24,
  transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
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
    transition: 'left 0.6s ease',
  },
  '&:hover': {
    transform: 'translateY(-15px) scale(1.02)',
    boxShadow: `0 30px 80px ${alpha(theme.palette.primary.main, 0.3)}`,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.4)}`,
    '&::before': {
      left: '100%',
    }
  }
}));

const HolographicButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(45deg, 
    ${theme.palette.primary.main} 0%, 
    ${theme.palette.secondary.main} 25%, 
    ${theme.palette.primary.main} 50%, 
    ${theme.palette.secondary.main} 75%, 
    ${theme.palette.primary.main} 100%)`,
  backgroundSize: '400% 400%',
  animation: `${gradientMove} 3s ease infinite`,
  borderRadius: 50,
  padding: '16px 40px',
  color: 'white',
  fontWeight: 700,
  fontSize: '1.2rem',
  textTransform: 'none',
  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
  position: 'relative',
  overflow: 'hidden',
  border: 'none',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '0',
    height: '0',
    borderRadius: '50%',
    background: alpha('#ffffff', 0.3),
    transition: 'all 0.6s ease',
    transform: 'translate(-50%, -50%)',
  },
  '&:hover': {
    transform: 'translateY(-4px) scale(1.05)',
    boxShadow: `0 15px 50px ${alpha(theme.palette.primary.main, 0.5)}`,
    animation: `${gradientMove} 1.5s ease infinite, ${holographic} 2s ease infinite`,
    '&::before': {
      width: '300px',
      height: '300px',
      animation: `${rippleEffect} 0.6s ease`,
    }
  }
}));

const ChatButton = styled(IconButton)(({ theme }) => ({
  position: 'fixed',
  bottom: 30,
  right: 30,
  width: 60,
  height: 60,
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: 'white',
  boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.4)}`,
  zIndex: 1000,
  transition: 'all 0.3s ease',
  animation: `${liquidMove} 6s ease-in-out infinite`,
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: `0 12px 35px ${alpha(theme.palette.primary.main, 0.5)}`,
    animation: 'none',
  }
}));

const ScrollToTopButton = styled(IconButton)(({ theme }) => ({
  position: 'fixed',
  bottom: 110,
  right: 30,
  width: 50,
  height: 50,
  background: alpha(theme.palette.background.paper, 0.9),
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  color: theme.palette.primary.main,
  transition: 'all 0.3s ease',
  zIndex: 999,
  '&:hover': {
    background: theme.palette.primary.main,
    color: 'white',
    transform: 'translateY(-3px)',
  }
}));

const DashboardCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, 
    ${alpha(theme.palette.background.paper, 0.95)} 0%, 
    ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
  backdropFilter: 'blur(30px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  borderRadius: 20,
  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  height: '100%',
  cursor: 'pointer',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    padding: 1,
    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.5)}, ${alpha(theme.palette.secondary.main, 0.5)})`,
    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    maskComposite: 'xor',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover': {
    transform: 'translateY(-10px) scale(1.02)',
    boxShadow: `0 25px 70px ${alpha(theme.palette.primary.main, 0.25)}`,
    '&::before': {
      opacity: 1,
    }
  }
}));

const AnimatedSection = styled(Box)(({ theme, animationType = 'fadeIn', delay = 0 }) => {
  const getAnimation = () => {
    switch (animationType) {
      case 'slideLeft':
        return scrollSlideLeft;
      case 'slideRight':
        return scrollSlideRight;
      case 'zoomIn':
        return scrollZoomIn;
      case 'rotateIn':
        return scrollRotateIn;
      case 'bounceIn':
        return scrollBounceIn;
      default:
        return scrollFadeIn;
    }
  };

  return {
    opacity: 0,
    transform: 'translateY(30px)',
    animation: `${getAnimation()} 0.8s ease forwards`,
    animationDelay: `${delay}ms`,
  };
});

const InteractiveGraphCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, 
    ${alpha(theme.palette.background.paper, 0.95)} 0%, 
    ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
  backdropFilter: 'blur(30px)',
  border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  borderRadius: 20,
  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  cursor: 'pointer',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: `linear-gradient(45deg, transparent, ${alpha(theme.palette.primary.main, 0.1)}, transparent)`,
    transform: 'translateX(-100%)',
    transition: 'transform 0.6s ease',
  },
  '&:hover': {
    transform: 'translateY(-10px) scale(1.02)',
    boxShadow: `0 25px 70px ${alpha(theme.palette.primary.main, 0.25)}`,
    animation: `${modernGraphGlow} 2s ease infinite`,
    '&::before': {
      transform: 'translateX(100%)',
    }
  }
}));

// Main Component
const ModernHomepage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [emailData, setEmailData] = useState({ name: '', email: '', message: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [visibleElements, setVisibleElements] = useState({});

  const heroRef = useRef();
  const dashboardsRef = useRef();
  const featuresRef = useRef();
  const testimonialsRef = useRef();

  // Scroll animations
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 500);
      
      const refs = [
        { ref: dashboardsRef, key: 'dashboards' },
        { ref: featuresRef, key: 'features' },
        { ref: testimonialsRef, key: 'testimonials' }
      ];

      refs.forEach(({ ref, key }) => {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          if (rect.top < window.innerHeight * 0.8) {
            setVisibleElements(prev => ({ ...prev, [key]: true }));
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChatSubmit = () => {
    if (emailData.name && emailData.email && emailData.message) {
      console.log('Email data:', emailData);
      setSnackbar({ open: true, message: 'Message sent successfully!', severity: 'success' });
      setChatOpen(false);
      setEmailData({ name: '', email: '', message: '' });
    } else {
      setSnackbar({ open: true, message: 'Please fill all fields', severity: 'error' });
    }
  };

  // 7 Dashboards data
  const dashboards = [
    {
      id: 'sales-split',
      title: 'Sales Split',
      description: 'Advanced revenue breakdown analysis by categories, locations, and time periods with AI-powered insights',
      icon: <PieChartIcon fontSize="large" />,
      color: '#4285f4',
      gradient: 'linear-gradient(135deg, #4285f4, #34a853)',
      features: ['Category Analysis', 'Location Breakdown', 'Time-based Insights', 'Interactive Charts']
    },
    {
      id: 'product-mix',
      title: 'Product Mix',
      description: 'Comprehensive menu performance analysis and product optimization with interactive visualizations',
      icon: <RestaurantIcon fontSize="large" />,
      color: '#34a853',
      gradient: 'linear-gradient(135deg, #34a853, #fbbc04)',
      features: ['Menu Performance', 'Product Rankings', 'Profitability Analysis', 'Trend Graphs']
    },
    {
      id: 'financial',
      title: 'Financial',
      description: 'Complete financial metrics dashboard with real-time tracking and predictive analytics',
      icon: <AttachMoneyIcon fontSize="large" />,
      color: '#fbbc04',
      gradient: 'linear-gradient(135deg, #fbbc04, #ea4335)',
      features: ['Revenue Analysis', 'Cost Management', 'Profit Margins', 'Financial Forecasting']
    },
    {
      id: 'company-wide',
      title: 'Company Wide',
      description: 'Enterprise-wide insights and cross-location analytics with modern interactive graphs',
      icon: <BusinessIcon fontSize="large" />,
      color: '#ea4335',
      gradient: 'linear-gradient(135deg, #ea4335, #9c27b0)',
      features: ['Multi-location View', 'Comparative Analysis', 'Trend Identification', 'Executive Dashboard']
    },
    {
      id: 'order',
      title: 'Order',
      description: 'Advanced order analytics with customer behavior insights and interactive data visualization',
      icon: <AssessmentIcon fontSize="large" />,
      color: '#9c27b0',
      gradient: 'linear-gradient(135deg, #9c27b0, #4285f4)',
      features: ['Order Patterns', 'Customer Insights', 'Service Metrics', 'Real-time Charts']
    },
    {
      id: 'inventory',
      title: 'Inventory',
      description: 'Smart inventory management with waste reduction analytics and supply chain optimization',
      icon: <InventoryIcon fontSize="large" />,
      color: '#00bcd4',
      gradient: 'linear-gradient(135deg, #00bcd4, #4285f4)',
      features: ['Stock Levels', 'Waste Analysis', 'Supply Chain', 'Automated Alerts']
    },
    {
      id: 'orderflow',
      title: 'Orderflow',
      description: 'Real-time order processing workflow with operational efficiency tracking and modern graphs',
      icon: <WorkflowIcon fontSize="large" />,
      color: '#ff5722',
      gradient: 'linear-gradient(135deg, #ff5722, #34a853)',
      features: ['Real-time Tracking', 'Process Optimization', 'Efficiency Metrics', 'Flow Visualization']
    }
  ];

  // User roles data
  const userRoles = [
    {
      role: 'Employee',
      icon: <PersonIcon fontSize="large" />,
      color: '#4285f4',
      permissions: [
        'View assigned dashboards',
        'Access interactive graphs',
        'Basic reporting tools',
        'Data visualization',
        'Export basic reports'
      ],
      description: 'Standard access for day-to-day operations with interactive graph viewing'
    },
    {
      role: 'Admin',
      icon: <AdminPanelSettingsIcon fontSize="large" />,
      color: '#34a853',
      permissions: [
        'Full dashboard access',
        'Advanced interactive graphs',
        'User management',
        'Advanced analytics',
        'Custom report generation',
        'System configuration'
      ],
      description: 'Management level access with enhanced capabilities and full graph interaction'
    },
    {
      role: 'Super Admin',
      icon: <SupervisedUserCircleIcon fontSize="large" />,
      color: '#ea4335',
      permissions: [
        'Complete system control',
        'All dashboard permissions',
        'Advanced graph customization',
        'Security settings management',
        'AI model configuration',
        'Enterprise-level controls'
      ],
      description: 'Complete system control with full access to all interactive features'
    }
  ];

  const features = [
    {
      icon: <SmartToyIcon fontSize="large" />,
      title: "AI-Enhanced Analytics",
      description: "Advanced AI algorithms that automatically detect patterns, predict trends, and provide intelligent recommendations with modern interactive graphs and real-time data visualization.",
      color: "#4285f4",
      gradient: "linear-gradient(135deg, #4285f4, #34a853)"
    },
    {
      icon: <ShowChartIcon fontSize="large" />,
      title: "Modern Interactive Graphs",
      description: "Cutting-edge responsive charts and graphs with real-time updates, drill-down capabilities, customizable visualization options, and seamless user interaction across all devices.",
      color: "#34a853",
      gradient: "linear-gradient(135deg, #34a853, #fbbc04)"
    },
    {
      icon: <SecurityIcon fontSize="large" />,
      title: "Role-Based Permissions",
      description: "Sophisticated permission system with granular control over data access for Employees, Admins, and Super Admins, ensuring security while enabling seamless collaboration.",
      color: "#ea4335",
      gradient: "linear-gradient(135deg, #ea4335, #9c27b0)"
    },
    {
      icon: <SpeedIcon fontSize="large" />,
      title: "Real-Time Interactive Processing",
      description: "Lightning-fast data processing with live interactive updates and modern graph animations, ensuring you always have the most current information with beautiful visualizations.",
      color: "#fbbc04",
      gradient: "linear-gradient(135deg, #fbbc04, #ff5722)"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "CEO",
      company: "TechStart Inc.",
      rating: 5,
      content: "The AI-enhanced analytics have transformed our decision-making process. We've seen 40% revenue growth since implementation.",
      avatar: "SC"
    },
    {
      name: "Michael Rodriguez",
      role: "Operations Director", 
      company: "RetailPro",
      rating: 5,
      content: "Having 7 specialized dashboards gives us incredible visibility into every aspect of our business operations.",
      avatar: "MR"
    },
    {
      name: "Emily Watson",
      role: "Data Analyst",
      company: "DataFlow Solutions", 
      rating: 5,
      content: "The role-based permissions and interactive graphs make collaboration seamless while maintaining data security.",
      avatar: "EW"
    }
  ];

  const stats = [
    { number: "7", label: "Specialized Dashboards", icon: <DashboardIcon />, color: "#4285f4" },
    { number: "3", label: "User Role Types", icon: <GroupIcon />, color: "#34a853" },
    { number: "99.99%", label: "Uptime", icon: <SecurityIcon />, color: "#ea4335" },
    { number: "24/7", label: "AI Enhancement", icon: <SmartToyIcon />, color: "#fbbc04" }
  ];

  return (
    <Box>
      {/* Navigation */}
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          background: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                mr: 2,
                width: 45,
                height: 45,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`
              }}
            >
              <DashboardIcon />
            </Avatar>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 800,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: `${textGlow} 3s ease-in-out infinite`
              }}
            >
              INSIGHTiQ
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              variant="outlined"
              sx={{
                borderRadius: 25,
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 600,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  transform: 'translateY(-2px)',
                }
              }}
            >
              Sign In
            </Button>
            <HolographicButton startIcon={<RocketLaunchIcon />}>
              Get Started
            </HolographicButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Hero Section with Fixed Floating Circles */}
      <HeroContainer ref={heroRef}>
        {/* Properly positioned floating circles */}
        <FloatingCircle 
          sx={{ 
            width: 80, 
            height: 80, 
            top: '15%', 
            left: '8%',
            animationDelay: '0s',
          }}
        >
          📊
        </FloatingCircle>
        <FloatingCircle 
          sx={{ 
            width: 60, 
            height: 60, 
            top: '70%', 
            left: '85%',
            animationDelay: '2s',
          }}
        >
          💡
        </FloatingCircle>
        <FloatingCircle 
          sx={{ 
            width: 70, 
            height: 70, 
            top: '35%', 
            right: '12%',
            animationDelay: '4s',
          }}
        >
          🚀
        </FloatingCircle>
        <FloatingCircle 
          sx={{ 
            width: 50, 
            height: 50, 
            top: '80%', 
            left: '20%',
            animationDelay: '6s',
          }}
        >
          ⚡
        </FloatingCircle>
        <FloatingCircle 
          sx={{ 
            width: 65, 
            height: 65, 
            top: '25%', 
            left: '50%',
            animationDelay: '3s',
          }}
        >
          🎯
        </FloatingCircle>

        <Container maxWidth="lg">
          <Grid container spacing={8} alignItems="center">
            <Grid item xs={12} md={6}>
              <Fade in timeout={1000}>
                <Box>
                  <Chip 
                    label="🔥 7 Specialized Dashboards" 
                    sx={{
                      mb: 4,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                      fontWeight: 600,
                      fontSize: '1rem',
                      py: 2,
                      px: 3,
                      animation: `${slideUpStagger} 1s ease 0.2s both`
                    }}
                  />
                  
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: '3rem', md: '5rem' },
                      fontWeight: 900,
                      mb: 2,
                      lineHeight: 1,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.primary.dark})`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      animation: `${slideUpStagger} 1s ease 0.4s both, ${textGlow} 4s ease-in-out infinite`
                    }}
                  >
                    Analytics That
                  </Typography>
                  
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: '3rem', md: '5rem' },
                      fontWeight: 900,
                      mb: 3,
                      lineHeight: 1,
                      color: 'text.primary',
                      animation: `${slideUpStagger} 1s ease 0.6s both`
                    }}
                  >
                    Drives Success ✨
                  </Typography>
                  
                  <Typography
                    variant="h5"
                    sx={{
                      mb: 5,
                      color: 'text.secondary',
                      maxWidth: 550,
                      lineHeight: 1.6,
                      fontSize: { xs: '1.3rem', md: '1.5rem' },
                      animation: `${slideUpStagger} 1s ease 0.8s both`
                    }}
                  >
                    Transform your business with AI-enhanced analytics across 7 specialized dashboards. 
                    From sales split to inventory management - all with role-based access and real-time insights.
                  </Typography>
                  
                  <Stack 
                    direction="row" 
                    spacing={2} 
                    sx={{ 
                      mb: 4,
                      animation: `${slideUpStagger} 1s ease 1s both`,
                      flexWrap: 'wrap'
                    }}
                  >
                    {['🤖 AI-Enhanced', '📊 Interactive Graphs', '👥 Role-Based', '⚡ Real-time'].map((item, index) => (
                      <Chip 
                        key={index}
                        label={item} 
                        variant="outlined"
                        sx={{
                          fontWeight: 600,
                          borderColor: 'primary.main',
                          mb: 1,
                          '&:hover': {
                            background: alpha(theme.palette.primary.main, 0.1),
                            transform: 'scale(1.05)'
                          }
                        }}
                      />
                    ))}
                  </Stack>
                  
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      gap: 3, 
                      flexWrap: 'wrap',
                      animation: `${slideUpStagger} 1s ease 1.2s both`
                    }}
                  >
                    <HolographicButton
                      size="large"
                      startIcon={<AutoFixHighIcon />}
                      sx={{ fontSize: '1.3rem', px: 5, py: 2.5 }}
                    >
                      Start Free Today
                    </HolographicButton>
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<PlayArrowIcon />}
                      sx={{
                        borderRadius: 25,
                        px: 5,
                        py: 2.5,
                        fontSize: '1.3rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        borderWidth: 2,
                        transition: 'all 0.4s ease',
                        '&:hover': {
                          borderWidth: 2,
                          transform: 'translateY(-3px) scale(1.05)',
                          boxShadow: `0 15px 40px ${alpha(theme.palette.primary.main, 0.3)}`,
                          background: alpha(theme.palette.primary.main, 0.05)
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
                  <GlassCard
                    elevation={0}
                    sx={{
                      p: 5,
                      transform: 'perspective(1000px) rotateY(-10deg) rotateX(5deg)',
                      animation: `${slideUpStagger} 1.5s ease 0.5s both`,
                      '&:hover': {
                        transform: 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1.05)',
                      }
                    }}
                  >
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h4" sx={{ fontWeight: 800, mb: 3, color: 'primary.main' }}>
                        🎯 Live Analytics Dashboard
                      </Typography>
                      
                      <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={4}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h3" sx={{ fontWeight: 900, color: 'success.main', mb: 1 }}>
                              +67%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Revenue
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={4}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h3" sx={{ fontWeight: 900, color: 'primary.main', mb: 1 }}>
                              7
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Dashboards
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={4}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h3" sx={{ fontWeight: 900, color: 'secondary.main', mb: 1 }}>
                              99.2%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Accuracy
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                      
                      <LinearProgress 
                        variant="determinate" 
                        value={85} 
                        sx={{ 
                          height: 12, 
                          borderRadius: 6,
                          mb: 2,
                          '& .MuiLinearProgress-bar': {
                            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                          }
                        }} 
                      />
                      
                      <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                        🚀 AI-enhanced performance increased by 85% this month
                      </Typography>
                    </Box>
                  </GlassCard>
                </Box>
              </Grow>
            </Grid>
          </Grid>
        </Container>
      </HeroContainer>

      {/* Interactive Stats */}
      <Box sx={{ py: 8, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <AnimatedSection delay={index * 100}>
                  <Paper 
                    elevation={0}
                    sx={{
                      background: `linear-gradient(135deg, 
                        ${alpha(theme.palette.background.paper, 0.95)} 0%, 
                        ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                      backdropFilter: 'blur(20px)',
                      borderRadius: 20,
                      padding: 4,
                      textAlign: 'center',
                      transition: 'all 0.4s ease',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.1)}`,
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '4px',
                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        transform: 'scaleX(0)',
                        transformOrigin: 'left',
                        transition: 'transform 0.3s ease',
                      },
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.05)',
                        boxShadow: `0 20px 60px ${alpha(theme.palette.primary.main, 0.3)}`,
                        '&::before': {
                          transform: 'scaleX(1)',
                        }
                      }
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 60,
                        height: 60,
                        mx: 'auto',
                        mb: 2,
                        bgcolor: stat.color,
                        boxShadow: `0 8px 25px ${alpha(stat.color, 0.3)}`
                      }}
                    >
                      {stat.icon}
                    </Avatar>
                    <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, color: stat.color }}>
                      {stat.number}
                    </Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>
                      {stat.label}
                    </Typography>
                  </Paper>
                </AnimatedSection>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* 7 Specialized Dashboards */}
      <Container maxWidth="lg" sx={{ py: 12 }} ref={dashboardsRef}>
        <Box sx={{ textAlign: 'center', mb: 10 }}>
          <Chip 
            label="📊 Specialized Dashboards" 
            sx={{
              mb: 4,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              fontWeight: 600,
              fontSize: '1rem',
              py: 2,
              px: 3
            }}
          />
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2.5rem', md: '4rem' },
              fontWeight: 900,
              mb: 3,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            7 Powerful Dashboards
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{ maxWidth: 700, mx: 'auto', fontSize: '1.3rem', lineHeight: 1.6 }}
          >
            Complete business intelligence across every aspect of your operations
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {dashboards.map((dashboard, index) => (
            <Grid item xs={12} md={6} lg={4} key={dashboard.id}>
              <AnimatedSection animationType={index % 2 === 0 ? 'slideLeft' : 'slideRight'} delay={index * 150}>
                <InteractiveGraphCard 
                  elevation={0}
                  sx={{
                    height: '100%',
                    opacity: visibleElements.dashboards ? 1 : 0,
                    transform: visibleElements.dashboards ? 'translateY(0)' : 'translateY(30px)',
                    transition: `all 0.6s ease ${index * 0.1}s`
                  }}
                >
                  <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        mb: 3,
                        background: dashboard.gradient,
                        boxShadow: `0 10px 30px ${alpha(dashboard.color, 0.3)}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.1) rotate(10deg)',
                          animation: `${holographic} 2s ease infinite, ${interactiveHover} 1.5s ease infinite`
                        }
                      }}
                    >
                      {dashboard.icon}
                    </Avatar>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}
                    >
                      {dashboard.title}
                    </Typography>
                    <Typography
                      color="text.secondary"
                      sx={{ lineHeight: 1.7, mb: 3, fontSize: '1.1rem' }}
                    >
                      {dashboard.description}
                    </Typography>
                    <Box sx={{ mt: 'auto' }}>
                      {dashboard.features.map((feature, featureIndex) => (
                        <Chip
                          key={featureIndex}
                          label={feature}
                          size="small"
                          sx={{
                            mr: 1,
                            mb: 1,
                            bgcolor: alpha(dashboard.color, 0.1),
                            color: dashboard.color,
                            fontWeight: 600,
                            border: `1px solid ${alpha(dashboard.color, 0.3)}`,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              bgcolor: alpha(dashboard.color, 0.2),
                              transform: 'scale(1.05)',
                              animation: `${graphPulse} 1s ease infinite`
                            }
                          }}
                        />
                      ))}
                    </Box>
                    
                    {/* Interactive Graph Preview */}
                    <Box
                      sx={{
                        mt: 3,
                        p: 2,
                        bgcolor: alpha(dashboard.color, 0.05),
                        borderRadius: 2,
                        border: `1px dashed ${alpha(dashboard.color, 0.3)}`,
                        textAlign: 'center',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: alpha(dashboard.color, 0.1),
                          animation: `${modernGraphGlow} 2s ease infinite`
                        }
                      }}
                    >
                      <ShowChartIcon sx={{ color: dashboard.color, fontSize: 32, mb: 1 }} />
                      <Typography variant="caption" sx={{ color: dashboard.color, fontWeight: 600 }}>
                        Interactive Graphs Available
                      </Typography>
                    </Box>
                  </CardContent>
                </InteractiveGraphCard>
              </AnimatedSection>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* User Roles & Permissions */}
      <Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02), py: 12 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Chip 
              label="👥 User Management" 
              sx={{
                mb: 4,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                fontWeight: 600,
                fontSize: '1rem',
                py: 2,
                px: 3
              }}
            />
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2.5rem', md: '4rem' },
                fontWeight: 900,
                mb: 3,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Role-Based Access Control
            </Typography>
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{ maxWidth: 700, mx: 'auto', fontSize: '1.3rem', lineHeight: 1.6 }}
            >
              Secure, granular permissions system for teams of any size
            </Typography>
          </Box>

          <Grid container spacing={5}>
            {userRoles.map((role, index) => (
              <Grid item xs={12} md={4} key={role.role}>
                <AnimatedSection animationType="bounceIn" delay={index * 200}>
                  <InteractiveGraphCard elevation={0}>
                    <CardContent sx={{ p: 4, textAlign: 'center' }}>
                      <Avatar
                        sx={{
                          width: 80,
                          height: 80,
                          mx: 'auto',
                          mb: 3,
                          bgcolor: role.color,
                          boxShadow: `0 10px 30px ${alpha(role.color, 0.3)}`,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            animation: `${interactiveHover} 1.5s ease infinite`
                          }
                        }}
                      >
                        {role.icon}
                      </Avatar>
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: role.color }}>
                        {role.role}
                      </Typography>
                      <Typography
                        color="text.secondary"
                        sx={{ lineHeight: 1.7, mb: 3, fontSize: '1.1rem' }}
                      >
                        {role.description}
                      </Typography>
                      <Box>
                        {role.permissions.map((permission, permIndex) => (
                          <Box
                            key={permIndex}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              mb: 1.5,
                              justifyContent: 'flex-start',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateX(10px)',
                                color: role.color
                              }
                            }}
                          >
                            <CheckCircleIcon
                              sx={{
                                color: role.color,
                                mr: 2,
                                fontSize: '1.2rem'
                              }}
                            />
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                              {permission}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                      
                      {/* Interactive Graph Access Indicator */}
                      <Box
                        sx={{
                          mt: 3,
                          p: 2,
                          bgcolor: alpha(role.color, 0.05),
                          borderRadius: 2,
                          border: `1px dashed ${alpha(role.color, 0.3)}`,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            bgcolor: alpha(role.color, 0.1),
                            animation: `${modernGraphGlow} 2s ease infinite`
                          }
                        }}
                      >
                        <AutoGraphIcon sx={{ color: role.color, fontSize: 28, mb: 1 }} />
                        <Typography variant="caption" sx={{ color: role.color, fontWeight: 600 }}>
                          {role.role === 'Super Admin' ? 'Full Graph Control' : 
                           role.role === 'Admin' ? 'Advanced Graph Access' : 
                           'Basic Graph Viewing'}
                        </Typography>
                      </Box>
                    </CardContent>
                  </InteractiveGraphCard>
                </AnimatedSection>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 12 }} ref={featuresRef}>
        <Box sx={{ textAlign: 'center', mb: 10 }}>
          <Chip 
            label="🚀 Advanced Features" 
            sx={{
              mb: 4,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              fontWeight: 600,
              fontSize: '1rem',
              py: 2,
              px: 3
            }}
          />
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2.5rem', md: '4rem' },
              fontWeight: 900,
              mb: 3,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            AI-Powered Intelligence
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{ maxWidth: 700, mx: 'auto', fontSize: '1.3rem', lineHeight: 1.6 }}
          >
            Cutting-edge technology that transforms data into actionable insights
          </Typography>
        </Box>

        <Grid container spacing={5}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} key={index}>
              <AnimatedSection animationType={index % 2 === 0 ? 'rotateIn' : 'zoomIn'} delay={index * 150}>
                <InteractiveGraphCard 
                  elevation={0}
                  sx={{
                    height: '100%',
                    opacity: visibleElements.features ? 1 : 0,
                    transform: visibleElements.features ? 'translateY(0)' : 'translateY(30px)',
                    transition: `all 0.6s ease ${index * 0.1}s`
                  }}
                >
                  <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        mb: 3,
                        background: feature.gradient,
                        boxShadow: `0 10px 30px ${alpha(feature.color, 0.3)}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.1) rotate(10deg)',
                          animation: `${holographic} 2s ease infinite, ${interactiveHover} 1.5s ease infinite`
                        }
                      }}
                    >
                      {feature.icon}
                    </Avatar>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      color="text.secondary"
                      sx={{ lineHeight: 1.7, flex: 1, fontSize: '1.1rem', mb: 3 }}
                    >
                      {feature.description}
                    </Typography>
                    
                    {/* Interactive Demo Preview */}
                    <Box
                      sx={{
                        p: 3,
                        bgcolor: alpha(feature.color, 0.05),
                        borderRadius: 3,
                        border: `2px solid ${alpha(feature.color, 0.2)}`,
                        textAlign: 'center',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: alpha(feature.color, 0.1),
                          animation: `${modernGraphGlow} 2s ease infinite`,
                          transform: 'scale(1.02)'
                        }
                      }}
                    >
                      <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" sx={{ mb: 2 }}>
                        <AutoGraphIcon sx={{ color: feature.color, fontSize: 24 }} />
                        <VisibilityIcon sx={{ color: feature.color, fontSize: 20 }} />
                        <ShowChartIcon sx={{ color: feature.color, fontSize: 24 }} />
                      </Stack>
                      <Typography variant="body2" sx={{ color: feature.color, fontWeight: 700, mb: 1 }}>
                        Interactive Demo Available
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={75 + (index * 5)} 
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          bgcolor: alpha(feature.color, 0.2),
                          '& .MuiLinearProgress-bar': {
                            bgcolor: feature.color,
                            borderRadius: 3
                          }
                        }} 
                      />
                      <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
                        {75 + (index * 5)}% Performance Boost
                      </Typography>
                    </Box>
                  </CardContent>
                </InteractiveGraphCard>
              </AnimatedSection>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Testimonials */}
      <Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02), py: 12 }}>
        <Container maxWidth="lg" ref={testimonialsRef}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Chip 
              label="💬 Success Stories" 
              sx={{
                mb: 4,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                fontWeight: 600,
                fontSize: '1rem',
                py: 2,
                px: 3
              }}
            />
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2.5rem', md: '4rem' },
                fontWeight: 900,
                mb: 3,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Trusted by Industry Leaders
            </Typography>
          </Box>

          <Grid container spacing={5}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <AnimatedSection animationType="slideLeft" delay={index * 200}>
                  <InteractiveGraphCard
                    elevation={0}
                    sx={{
                      padding: 4,
                      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      height: '100%',
                      boxShadow: `0 10px 40px ${alpha(theme.palette.primary.main, 0.1)}`,
                      opacity: visibleElements.testimonials ? 1 : 0,
                      transform: visibleElements.testimonials ? 'translateY(0)' : 'translateY(30px)',
                      transitionDelay: `${index * 0.1}s`,
                      '&:hover': {
                        transform: 'translateY(-10px) scale(1.02)',
                        boxShadow: `0 25px 70px ${alpha(theme.palette.primary.main, 0.25)}`,
                      }
                    }}
                  >
                    <Box sx={{ mb: 3 }}>
                      <Rating value={testimonial.rating} readOnly sx={{ mb: 2 }} />
                      <Typography
                        variant="h6"
                        sx={{ 
                          lineHeight: 1.7, 
                          fontStyle: 'italic',
                          fontSize: '1.2rem',
                          fontWeight: 500
                        }}
                      >
                        "{testimonial.content}"
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', mb: 3 }}>
                      <Avatar
                        sx={{
                          bgcolor: 'primary.main',
                          mr: 3,
                          width: 60,
                          height: 60,
                          fontWeight: 700,
                          fontSize: '1.5rem',
                          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                        }}
                      >
                        {testimonial.avatar}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {testimonial.role}
                        </Typography>
                        <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
                          {testimonial.company}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Interactive Graph Usage Badge */}
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        borderRadius: 2,
                        border: `1px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                        textAlign: 'center',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          animation: `${modernGraphGlow} 2s ease infinite`
                        }
                      }}
                    >
                      <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                        <ShowChartIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                        <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
                          Uses Interactive Dashboards Daily
                        </Typography>
                      </Stack>
                    </Box>
                  </InteractiveGraphCard>
                </AnimatedSection>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="md" sx={{ py: 12, textAlign: 'center' }}>
        <GlassCard
          elevation={0}
          sx={{
            p: 8,
            background: `linear-gradient(135deg, 
              ${theme.palette.primary.main}15 0%, 
              ${theme.palette.secondary.main}10 50%,
              ${theme.palette.primary.main}15 100%)`,
            border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`
          }}
        >
          <DiamondIcon sx={{ fontSize: 80, mb: 3, color: 'primary.main' }} />
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              fontWeight: 900,
              mb: 3,
              lineHeight: 1.2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Ready to Transform Your Analytics?
          </Typography>
          <Typography
            variant="h5"
            sx={{ mb: 5, color: 'text.secondary', maxWidth: 600, mx: 'auto', lineHeight: 1.6 }}
          >
            Join thousands of businesses using our 7 specialized dashboards with AI-enhanced insights and role-based access control
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap', mb: 4 }}>
            <HolographicButton
              size="large"
              startIcon={<RocketLaunchIcon />}
              sx={{ fontSize: '1.4rem', px: 6, py: 3 }}
            >
              Start Your Journey
            </HolographicButton>
            <Button
              variant="outlined"
              size="large"
              startIcon={<BusinessIcon />}
              sx={{
                borderRadius: 25,
                px: 6,
                py: 3,
                fontSize: '1.4rem',
                fontWeight: 600,
                textTransform: 'none',
                borderColor: 'primary.main',
                color: 'primary.main',
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  transform: 'translateY(-3px)',
                  boxShadow: `0 15px 40px ${alpha(theme.palette.primary.main, 0.3)}`
                }
              }}
            >
              Enterprise Demo
            </Button>
          </Box>
          
          <Stack direction="row" spacing={4} justifyContent="center" flexWrap="wrap">
            {['⚡ Instant Setup', '🔒 100% Secure', '📞 24/7 Support'].map((item, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                  {item}
                </Typography>
              </Box>
            ))}
          </Stack>
        </GlassCard>
      </Container>

      {/* Footer */}
      <Box 
        sx={{ 
          background: `linear-gradient(135deg, #0a0e1a 0%, #1a1f2e 50%, #0f1419 100%)`,
          color: 'white',
          py: 8,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    mr: 2,
                    width: 50,
                    height: 50,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                  }}
                >
                  <DashboardIcon />
                </Avatar>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'white' }}>
                  INSIGHTiQ
                </Typography>
              </Box>
              <Typography sx={{ mb: 3, color: alpha('#ffffff', 0.8), lineHeight: 1.7 }}>
                Revolutionizing business intelligence with 7 specialized dashboards, AI-enhanced analytics, and role-based access control.
              </Typography>
              <Stack direction="row" spacing={2}>
                {[LinkedInIcon, TwitterIcon, FacebookIcon, InstagramIcon].map((Icon, index) => (
                  <IconButton
                    key={index}
                    sx={{
                      background: alpha('#ffffff', 0.1),
                      color: 'white',
                      '&:hover': {
                        background: 'primary.main',
                        transform: 'translateY(-3px)'
                      }
                    }}
                  >
                    <Icon />
                  </IconButton>
                ))}
              </Stack>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Grid container spacing={4}>
                {[
                  { 
                    title: 'Dashboards', 
                    links: ['Sales Split', 'Product Mix', 'Financial', 'Company Wide', 'Order', 'Inventory', 'Orderflow'] 
                  },
                  { 
                    title: 'Features', 
                    links: ['AI Enhancement', 'Interactive Graphs', 'Role Management', 'Real-time Analytics'] 
                  },
                  { 
                    title: 'Support', 
                    links: ['Documentation', 'Help Center', 'Community', 'Contact Us'] 
                  },
                  { 
                    title: 'Company', 
                    links: ['About', 'Careers', 'Privacy', 'Terms'] 
                  }
                ].map((section, index) => (
                  <Grid item xs={6} md={3} key={index}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'white' }}>
                      {section.title}
                    </Typography>
                    {section.links.map((link, linkIndex) => (
                      <Typography
                        key={linkIndex}
                        sx={{
                          mb: 1,
                          color: alpha('#ffffff', 0.7),
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            color: 'white',
                            transform: 'translateX(5px)'
                          }
                        }}
                      >
                        {link}
                      </Typography>
                    ))}
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 4, borderColor: alpha('#ffffff', 0.2) }} />
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.6) }}>
              © 2025 INSIGHTiQ. All rights reserved. Built with ❤️ for data-driven success.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Fixed Chat Button */}
      <Tooltip title="Need help? Send us an email!" placement="left">
        <ChatButton onClick={() => setChatOpen(true)}>
          <ChatIcon />
        </ChatButton>
      </Tooltip>

      {/* Scroll to Top Button */}
      <Zoom in={showScrollToTop}>
        <ScrollToTopButton onClick={scrollToTop}>
          <ArrowUpwardIcon />
        </ScrollToTopButton>
      </Zoom>

      {/* Email Contact Dialog */}
      <Dialog
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: 'blur(20px)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center' }}>
              <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />
              Contact Our Team
            </Typography>
            <IconButton onClick={() => setChatOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Have questions about our dashboards or need a demo? We're here to help!
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Your Name"
              value={emailData.name}
              onChange={(e) => setEmailData({ ...emailData, name: e.target.value })}
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={emailData.email}
              onChange={(e) => setEmailData({ ...emailData, email: e.target.value })}
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
            <TextField
              fullWidth
              label="Message"
              multiline
              rows={4}
              value={emailData.message}
              onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
              placeholder="Tell us about your analytics needs, which dashboards interest you, or ask about our AI features..."
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={() => setChatOpen(false)} 
            sx={{ 
              mr: 1,
              borderRadius: 2,
              textTransform: 'none'
            }}
          >
            Cancel
          </Button>
          <HolographicButton
            onClick={handleChatSubmit}
            startIcon={<SendIcon />}
            sx={{ 
              borderRadius: 2,
              px: 3,
              py: 1.5
            }}
          >
            Send Message
          </HolographicButton>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ 
            width: '100%',
            borderRadius: 2,
            fontWeight: 600
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ModernHomepage;
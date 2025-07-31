import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Grid,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  TextField,
  Divider,
  CircularProgress,
  Alert,
  styled,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
  Container,
  alpha,
  keyframes,
} from "@mui/material";
import {
  CreditCard as CreditCardIcon,
  Business as BuildingIcon,
  AccountBalanceWallet as WalletIcon,
  Check as CheckIcon,
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
  Star as StarIcon,
  Rocket as RocketIcon,
  Close as CloseIcon,
  BarChart,
  TableChart,
  PieChart,
  Timeline,
  Assignment,
  Security as SecurityIcon,
  Verified as VerifiedIcon,
  Email as EmailIcon,
  Inventory,
  Inventory2,
  ScheduleRounded,
} from "@mui/icons-material";

// Animations
const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
`;

// Define types for our data structures
// type PlanKey = "basic" | "advanced";
type PlanKey = "advanced";
type BillingPeriod = "monthly" | "annual";
type PaymentMethodType = "creditCard" | "invoice" | "paypal";

interface Feature {
  name: string;
  included: boolean;
  icon?: React.ReactNode;
}

interface PlanDetails {
  title: string;
  subtitle: string;
  monthlyPrice: number;
  annualPrice: number;
  features: Feature[];
  description: string;
  icon: React.ReactNode;
  popular?: boolean;
}

interface PlansType {
  // basic: PlanDetails;
  advanced: PlanDetails;
}

// Modern styled components
const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, 
    ${theme.palette.primary.main}20 0%, 
    ${theme.palette.secondary.main}15 50%, 
    ${theme.palette.primary.light}10 100%)`,
  padding: theme.spacing(6, 0, 4),
  borderRadius: "0 0 24px 24px",
  position: "relative",
  overflow: "hidden",
  marginBottom: theme.spacing(6),
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      "url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='20' cy='20' r='2' fill='%23ffffff' opacity='0.1'/><circle cx='80' cy='40' r='1.5' fill='%23ffffff' opacity='0.1'/><circle cx='60' cy='80' r='1' fill='%23ffffff' opacity='0.1'/></svg>\")",
    backgroundSize: "100px 100px",
    pointerEvents: "none",
  },
}));

const ModernStepper = styled(Stepper)(({ theme }) => ({
  background: `linear-gradient(145deg, 
    ${theme.palette.background.paper} 0%, 
    ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
  padding: theme.spacing(3),
  borderRadius: "20px",
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  marginBottom: theme.spacing(4),
  "& .MuiStepLabel-root": {
    "& .MuiStepIcon-root": {
      fontSize: "1.8rem",
      "&.Mui-active": {
        color: theme.palette.primary.main,
      },
      "&.Mui-completed": {
        color: theme.palette.success.main,
      },
    },
  },
}));

const ModernPlanCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  borderRadius: "20px",
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  background: `linear-gradient(145deg, 
    ${theme.palette.background.paper} 0%, 
    ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
  backdropFilter: "blur(10px)",
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "relative",
  overflow: "hidden",
  cursor: "pointer",
  animation: `${slideIn} 0.6s ease forwards`,
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    background: `linear-gradient(90deg, 
      ${theme.palette.primary.main}, 
      ${theme.palette.secondary.main})`,
    transform: "translateY(-4px)",
    transition: "transform 0.4s ease",
  },
  "&:hover": {
    transform: "translateY(-12px) scale(1.02)",
    boxShadow: `0 20px 40px -8px ${alpha(theme.palette.primary.main, 0.25)}`,
    "&::before": {
      transform: "translateY(0)",
    },
  },
}));

const PopularBadge = styled(Chip)(({ theme }) => ({
  position: "absolute",
  top: +15,
  left: "50%",
  transform: "translateX(-20%)",
  fontWeight: "bold",
  background: `linear-gradient(135deg, 
    ${theme.palette.warning.main} 0%, 
    ${theme.palette.warning.dark} 100%)`,
  color: "white",
  zIndex: 2,
  "& .MuiChip-icon": {
    color: "white",
  },
  animation: `${float} 3s ease-in-out infinite`,
}));

const SelectedBadge = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: theme.spacing(2),
  right: theme.spacing(2),
  backgroundColor: theme.palette.success.main,
  color: theme.palette.success.contrastText,
  borderRadius: "50px",
  padding: theme.spacing(0.5, 1.5),
  display: "flex",
  alignItems: "center",
  fontSize: "0.875rem",
  fontWeight: 600,
  boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.3)}`,
  zIndex: 2,
}));

const ModernToggleGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  borderRadius: "12px",
  border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  background: theme.palette.background.paper,
  "& .MuiToggleButton-root": {
    border: "none",
    borderRadius: "10px !important",
    padding: theme.spacing(1.5, 3),
    fontWeight: 600,
    textTransform: "none",
    "&.Mui-selected": {
      background: `linear-gradient(135deg, 
        ${theme.palette.primary.main} 0%, 
        ${theme.palette.primary.dark} 100%)`,
      color: "white",
      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
      "&:hover": {
        background: `linear-gradient(135deg, 
          ${theme.palette.primary.dark} 0%, 
          ${theme.palette.primary.main} 100%)`,
      },
    },
  },
}));

const ModernCard = styled(Card)(({ theme }) => ({
  borderRadius: "20px",
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  background: `linear-gradient(145deg, 
    ${theme.palette.background.paper} 0%, 
    ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
  backdropFilter: "blur(10px)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
  },
}));

const PaymentMethodCard = styled(ModernCard)(
  ({ theme, selected }: { selected: boolean }) => ({
    cursor: "pointer",
    border: selected
      ? `2px solid ${theme.palette.primary.main}`
      : `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
    "&::before": {
      content: selected ? '""' : "none",
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "4px",
      background: `linear-gradient(90deg, 
      ${theme.palette.primary.main}, 
      ${theme.palette.secondary.main})`,
      borderRadius: "20px 20px 0 0",
    },
  })
);

const ModernTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    background: alpha(theme.palette.background.paper, 0.8),
    "& fieldset": {
      borderColor: alpha(theme.palette.primary.main, 0.2),
    },
    "&:hover fieldset": {
      borderColor: alpha(theme.palette.primary.main, 0.4),
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
      borderWidth: "2px",
    },
  },
}));

const ModernButton = styled(Button)(({ theme }) => ({
  borderRadius: "12px",
  padding: theme.spacing(1.5, 3),
  fontWeight: 600,
  textTransform: "none",
  fontSize: "1rem",
  transition: "all 0.3s ease",
  "&.MuiButton-contained": {
    background: `linear-gradient(135deg, 
      ${theme.palette.primary.main} 0%, 
      ${theme.palette.primary.dark} 100%)`,
    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
    "&:hover": {
      background: `linear-gradient(135deg, 
        ${theme.palette.primary.dark} 0%, 
        ${theme.palette.primary.main} 100%)`,
      boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
      transform: "translateY(-2px)",
    },
  },
  "&.MuiButton-outlined": {
    borderColor: alpha(theme.palette.primary.main, 0.3),
    borderWidth: "2px",
    "&:hover": {
      borderColor: theme.palette.primary.main,
      background: alpha(theme.palette.primary.main, 0.05),
      transform: "translateY(-1px)",
    },
  },
}));

const FloatingElement = styled(Box)(({ theme }) => ({
  position: "absolute",
  width: "6px",
  height: "6px",
  borderRadius: "50%",
  background: theme.palette.primary.main,
  opacity: 0.3,
  animation: `${float} 6s ease-in-out infinite`,
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  width: 60,
  height: 60,
  borderRadius: "16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: theme.spacing(2),
  background: `linear-gradient(135deg, 
    ${alpha(theme.palette.primary.main, 0.1)} 0%, 
    ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
  backdropFilter: "blur(10px)",
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  transition: "all 0.3s ease",
}));

const SuccessSection = styled(Box)(({ theme }) => ({
  textAlign: "center",
  padding: theme.spacing(8, 0),
  background: `linear-gradient(135deg, 
    ${alpha(theme.palette.success.main, 0.05)} 0%, 
    ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
  borderRadius: "20px",
  position: "relative",
  overflow: "hidden",
}));

export default function PaymentPage() {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>("advanced");
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethodType>("creditCard");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const plans: PlansType = {
    // basic: {
    //   title: 'Basic Plan',
    //   subtitle: 'Essential analytics for your business',
    //   monthlyPrice: 35,
    //   annualPrice: 350,
    //   features: [
    //     { name: 'Sales Split Dashboard', included: true, icon: <BarChart /> },
    //     { name: 'Financial Dashboard', included: true, icon: <Timeline /> },
    //     { name: 'Sales Wide Dashboard', included: true, icon: <PieChart /> },
    //     { name: 'Product Mix Dashboard', included: true, icon: <TableChart /> },
    //     { name: 'Order Sheet Dashboard', included: false, icon: <Assignment /> },
    //   ],
    //   description: 'Perfect for small to medium businesses looking for core analytics capabilities.',
    //   icon: <StarIcon />
    // },
    advanced: {
      title: "Advanced Plan",
      subtitle: "Complete analytics suite",
      monthlyPrice: 50,
      annualPrice: 500,
      features: [
        { name: "Sales Split", included: true, icon: <BarChart /> },
        { name: "Product Mix", included: true, icon: <TableChart /> },
        { name: "Financial", included: true, icon: <Timeline /> },
        { name: "CompanWide", included: true, icon: <PieChart /> },
        { name: "Order Sheet", included: true, icon: <Assignment /> },
        // inventpory icon
        { name: "Inventory", included: true, icon: <Inventory2 /> },
        // Scheduler
        { name: "Scheduler", included: true, icon: <ScheduleRounded /> },
      ],
      description:
        "Full access to all dashboards including advanced order sheet analytics.",
      icon: <RocketIcon />,
      popular: true,
    },
  };

  const steps: string[] = [
    "Select Plan",
    "Billing Information",
    "Payment Method",
    "Review & Confirm",
  ];

  const handlePlanChange = (plan: PlanKey): void => {
    setSelectedPlan(plan);
  };

  const handleBillingPeriodChange = (
    event: React.MouseEvent<HTMLElement>,
    newPeriod: BillingPeriod | null
  ): void => {
    if (newPeriod !== null) {
      setBillingPeriod(newPeriod);
    }
  };

  const handlePaymentMethodChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setPaymentMethod(event.target.value as PaymentMethodType);
  };

  const handleNext = (): void => {
    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = (): void => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = (): void => {
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
    }, 2000);
  };

  const renderPlanSelection = () => (
    <Box my={4}>
      <Typography variant="h5" fontWeight="bold" mb={1} color="#1a237e">
        Choose your plan
      </Typography>
      <Typography color="text.secondary" mb={4} fontSize="1.1rem">
        Select the perfect plan for your business needs
      </Typography>

      {/* Modern Billing Period Toggle */}
      <Box display="flex" justifyContent="center" mb={4}>
        <ModernToggleGroup
          value={billingPeriod}
          exclusive
          onChange={handleBillingPeriodChange}
          aria-label="billing period"
        >
          <ToggleButton value="monthly">Monthly</ToggleButton>
          <ToggleButton value="annual">Annual (Save 2 months!)</ToggleButton>
        </ModernToggleGroup>
      </Box>

      {billingPeriod === "annual" && (
        <Alert
          severity="success"
          sx={{
            mb: 3,
            borderRadius: "12px",
            background: `linear-gradient(135deg, 
              ${alpha("#4caf50", 0.1)} 0%, 
              ${alpha("#81c784", 0.1)} 100%)`,
          }}
        >
          <Typography variant="body2" fontWeight={500}>
            💰 Save 2 months with annual billing! Pay for 10 months and get 12
            months of access.
          </Typography>
        </Alert>
      )}

      <Grid container spacing={4} justifyContent="center">
        {Object.entries(plans).map(([key, plan], index) => (
          <Grid item xs={12} md={6} key={key}>
            <ModernPlanCard
              onClick={() => handlePlanChange(key as PlanKey)}
              sx={{
                borderColor:
                  selectedPlan === key ? "primary.main" : "transparent",
                borderWidth: selectedPlan === key ? 2 : 1,
                animationDelay: `${index * 100}ms`,
              }}
            >
              {plan.popular && (
                <PopularBadge
                  icon={<StarIcon />}
                  label="Most Popular"
                  color="warning"
                />
              )}

              {selectedPlan === key && (
                <SelectedBadge>
                  <CheckIcon sx={{ fontSize: "1rem", mr: 0.5 }} />
                  Selected
                </SelectedBadge>
              )}

              <CardContent
                sx={{
                  p: 4,
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box display="flex" alignItems="center" mb={3}>
                  <IconWrapper>
                    {React.cloneElement(plan.icon as React.ReactElement, {
                      sx: { fontSize: 28, color: "primary.main" },
                    })}
                  </IconWrapper>
                  <Box ml={2}>
                    <Typography variant="h6" fontWeight="bold" color="#1a237e">
                      {plan.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {plan.subtitle}
                    </Typography>
                  </Box>
                </Box>

                <Box textAlign="center" mb={3}>
                  <Typography
                    variant="h3"
                    component="div"
                    fontWeight="bold"
                    color="primary.main"
                  >
                    $
                    {billingPeriod === "monthly"
                      ? plan.monthlyPrice
                      : plan.annualPrice}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {billingPeriod === "monthly" ? "/month" : "/year"}
                  </Typography>
                  {billingPeriod === "annual" && (
                    <Typography
                      variant="body2"
                      color="success.main"
                      fontWeight="medium"
                    >
                      Save ${plan.monthlyPrice * 2}!
                    </Typography>
                  )}
                </Box>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  mb={3}
                  sx={{ minHeight: 40 }}
                >
                  {plan.description}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Box mt={3} flexGrow={1}>
                  {plan.features.map((feature, index) => (
                    <Box key={index} display="flex" alignItems="center" mb={2}>
                      {feature.included ? (
                        <CheckIcon
                          color="success"
                          fontSize="small"
                          sx={{ mr: 2 }}
                        />
                      ) : (
                        <CloseIcon
                          color="error"
                          fontSize="small"
                          sx={{ mr: 2 }}
                        />
                      )}
                      {feature.icon && (
                        <Box
                          sx={{
                            mr: 1.5,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          {React.cloneElement(
                            feature.icon as React.ReactElement,
                            {
                              fontSize: "small",
                              color: feature.included ? "action" : "disabled",
                            }
                          )}
                        </Box>
                      )}
                      <Typography
                        variant="body2"
                        color={
                          feature.included ? "text.primary" : "text.secondary"
                        }
                        fontWeight={feature.included ? 500 : 400}
                      >
                        {feature.name}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Box mt={4}>
                  <ModernButton
                    fullWidth
                    variant={selectedPlan === key ? "contained" : "outlined"}
                    size="large"
                    onClick={() => handlePlanChange(key as PlanKey)}
                  >
                    {selectedPlan === key ? "✓ Selected" : "Select Plan"}
                  </ModernButton>
                </Box>
              </CardContent>
            </ModernPlanCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderBillingInformation = () => (
    <Box my={4}>
      <Typography variant="h5" fontWeight="bold" mb={2} color="#1a237e">
        Billing Information
      </Typography>
      <Typography color="text.secondary" mb={4} fontSize="1.1rem">
        Please provide your billing details
      </Typography>

      <ModernCard elevation={0} sx={{ p: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <ModernTextField
              label="First name"
              fullWidth
              required
              variant="outlined"
              placeholder="Enter your first name"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <ModernTextField
              label="Last name"
              fullWidth
              required
              variant="outlined"
              placeholder="Enter your last name"
            />
          </Grid>
          <Grid item xs={12}>
            <ModernTextField
              label="Email address"
              fullWidth
              required
              variant="outlined"
              type="email"
              placeholder="Enter your email"
            />
          </Grid>
          <Grid item xs={12}>
            <ModernTextField
              label="Company name"
              fullWidth
              required
              variant="outlined"
              placeholder="Enter your company name"
            />
          </Grid>
          <Grid item xs={12}>
            <ModernTextField
              label="Address line 1"
              fullWidth
              required
              variant="outlined"
              placeholder="Enter your address"
            />
          </Grid>
          <Grid item xs={12}>
            <ModernTextField
              label="Address line 2"
              fullWidth
              variant="outlined"
              placeholder="Apartment, suite, unit, etc. (optional)"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <ModernTextField
              label="City"
              fullWidth
              required
              variant="outlined"
              placeholder="Enter your city"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <ModernTextField
              label="State/Province"
              fullWidth
              required
              variant="outlined"
              placeholder="Enter your state"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <ModernTextField
              label="Zip / Postal code"
              fullWidth
              required
              variant="outlined"
              placeholder="Enter your postal code"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <ModernTextField
              label="Country"
              fullWidth
              required
              variant="outlined"
              placeholder="Enter your country"
            />
          </Grid>
        </Grid>
      </ModernCard>
    </Box>
  );

  const renderPaymentMethod = () => (
    <Box my={4}>
      <Typography variant="h5" fontWeight="bold" mb={2} color="#1a237e">
        Payment Method
      </Typography>
      <Typography color="text.secondary" mb={4} fontSize="1.1rem">
        Choose your preferred payment method
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <PaymentMethodCard
            selected={paymentMethod === "creditCard"}
            onClick={() => setPaymentMethod("creditCard")}
            sx={{ p: 3, height: "100%" }}
          >
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              mb={3}
            >
              <IconWrapper>
                <CreditCardIcon sx={{ fontSize: 28, color: "primary.main" }} />
              </IconWrapper>
              <Typography variant="h6" fontWeight="bold">
                Credit Card
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
              >
                Secure payment with your credit card
              </Typography>
            </Box>

            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                value={paymentMethod}
                onChange={handlePaymentMethodChange}
              >
                <FormControlLabel
                  value="creditCard"
                  control={<Radio />}
                  label="Pay with credit card"
                />
              </RadioGroup>
            </FormControl>

            {paymentMethod === "creditCard" && (
              <Box mt={3}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <ModernTextField
                      label="Name on card"
                      fullWidth
                      required
                      variant="outlined"
                      placeholder="Enter name on card"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <ModernTextField
                      label="Card number"
                      fullWidth
                      required
                      variant="outlined"
                      placeholder="XXXX XXXX XXXX XXXX"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <ModernTextField
                      label="Expiry date"
                      fullWidth
                      required
                      variant="outlined"
                      placeholder="MM/YY"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <ModernTextField
                      label="CVV"
                      fullWidth
                      required
                      variant="outlined"
                      placeholder="XXX"
                      size="small"
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
          </PaymentMethodCard>
        </Grid>

        {/* <Grid item xs={12} md={4}>
          <PaymentMethodCard
            selected={paymentMethod === "invoice"}
            onClick={() => setPaymentMethod("invoice")}
            sx={{ p: 3, height: "100%" }}
          >
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              mb={3}
            >
              <IconWrapper>
                <BuildingIcon sx={{ fontSize: 28, color: "primary.main" }} />
              </IconWrapper>
              <Typography variant="h6" fontWeight="bold">
                Invoice
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
              >
                Pay via invoice for business accounts
              </Typography>
            </Box>

            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                value={paymentMethod}
                onChange={handlePaymentMethodChange}
              >
                <FormControlLabel
                  value="invoice"
                  control={<Radio />}
                  label="Pay with invoice"
                />
              </RadioGroup>
            </FormControl>

            {paymentMethod === "invoice" && (
              <Box mt={3}>
                <Typography variant="body2" color="text.secondary" paragraph>
                  An invoice will be sent to your billing email address. Please
                  make payment within 30 days.
                </Typography>
                <ModernTextField
                  label="Purchase Order Number (if applicable)"
                  fullWidth
                  variant="outlined"
                  placeholder="Enter PO number"
                  size="small"
                />
              </Box>
            )}
          </PaymentMethodCard>
        </Grid> */}

        {/* <Grid item xs={12} md={4}>
          <PaymentMethodCard
            selected={paymentMethod === "paypal"}
            onClick={() => setPaymentMethod("paypal")}
            sx={{ p: 3, height: "100%" }}
          >
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              mb={3}
            >
              <IconWrapper>
                <WalletIcon sx={{ fontSize: 28, color: "primary.main" }} />
              </IconWrapper>
              <Typography variant="h6" fontWeight="bold">
                PayPal
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
              >
                Quick and secure PayPal payment
              </Typography>
            </Box>

            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                value={paymentMethod}
                onChange={handlePaymentMethodChange}
              >
                <FormControlLabel
                  value="paypal"
                  control={<Radio />}
                  label="Pay with PayPal"
                />
              </RadioGroup>
            </FormControl>

            {paymentMethod === "paypal" && (
              <Box mt={3}>
                <Typography variant="body2" color="text.secondary">
                  You will be redirected to PayPal to complete your payment.
                </Typography>
              </Box>
            )}
          </PaymentMethodCard>
        </Grid> */}
      </Grid>
    </Box>
  );

  const renderReviewAndConfirm = () => {
    const plan = plans[selectedPlan];
    const price =
      billingPeriod === "monthly" ? plan.monthlyPrice : plan.annualPrice;

    return (
      <Box my={4}>
        <Typography variant="h5" fontWeight="bold" mb={2}>
          Review & Confirm
        </Typography>

        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" fontWeight="bold" mb={2}>
            Order Summary
          </Typography>

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            mb={2}
          >
            <Box>
              <Box display="flex" alignItems="center">
                {React.cloneElement(plan.icon as React.ReactElement, {
                  sx: { mr: 1 },
                })}
                <Typography fontWeight="medium">{plan.title}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                {billingPeriod === "monthly" ? "Monthly" : "Annual"}{" "}
                subscription
              </Typography>
            </Box>
            <Typography fontWeight="bold">${price}</Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography fontWeight="medium">Subtotal</Typography>
            <Typography fontWeight="medium">${price}</Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2">Tax</Typography>
            <Typography variant="body2">$0.00</Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography fontWeight="bold">Total</Typography>
            <Typography fontWeight="bold" color="primary">
              ${price}
            </Typography>
          </Box>

          <Alert severity="info" sx={{ mt: 2 }}>
            You will be charged ${price}{" "}
            {billingPeriod === "monthly" ? "monthly" : "annually"}. You can
            cancel anytime.
          </Alert>
        </Paper>

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            By clicking "Complete Payment", you agree to our Terms of Service
            and Privacy Policy.
          </Typography>
        </Box>
      </Box>
    );
  };

  const renderSuccess = () => (
    <Box textAlign="center" py={6}>
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          backgroundColor: "success.main",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mx: "auto",
        }}
      >
        <CheckIcon sx={{ color: "white", fontSize: 36 }} />
      </Box>
      <Typography variant="h4" fontWeight="bold" mt={3} mb={2}>
        Payment Successful!
      </Typography>
      <Typography color="text.secondary" mb={4}>
        Your {plans[selectedPlan].title} subscription has been activated.
      </Typography>
      <Typography variant="body2" mb={1}>
        Order #: ORD-{Math.floor(Math.random() * 10000000)}
      </Typography>
      <Typography variant="body2" mb={4}>
        A confirmation email has been sent to your email address.
      </Typography>
      <Button
        variant="contained"
        size="large"
        onClick={() => (window.location.href = "/dashboard")}
      >
        Go to Dashboard
      </Button>
    </Box>
  );

  const renderContent = () => {
    if (isSuccess) {
      return renderSuccess();
    }

    switch (activeStep) {
      case 0:
        return renderPlanSelection();
      case 1:
        return renderBillingInformation();
      case 2:
        return renderPaymentMethod();
      case 3:
        return renderReviewAndConfirm();
      default:
        return null;
    }
  };

  return (
    <Box maxWidth="lg" mx="auto" px={2}>
      <Box mb={6} textAlign="center">
        {/* <Typography variant="h3" fontWeight="bold" mb={1}> */}
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 600,
            color: "#1a237e",
            fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
          }}
        >
          Complete Your Purchase
        </Typography>
        <Typography color="text.secondary">
          You're just a few steps away from accessing our analytics platform
        </Typography>
      </Box>

      {!isSuccess && (
        <Box mb={4}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
      )}

      {renderContent()}

      {!isSuccess && (
        <Box display="flex" justifyContent="space-between" mt={4}>
          <Button
            disabled={activeStep === 0 || isProcessing}
            onClick={handleBack}
            startIcon={<ChevronLeftIcon />}
            variant="outlined"
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={isProcessing}
            endIcon={
              activeStep !== steps.length - 1 ? <ChevronRightIcon /> : undefined
            }
            variant="contained"
          >
            {isProcessing ? (
              <CircularProgress size={24} color="inherit" />
            ) : activeStep === steps.length - 1 ? (
              "Complete Payment"
            ) : (
              "Continue"
            )}
          </Button>
        </Box>
      )}
    </Box>
  );
}

import React, { useState } from 'react';
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
  CardHeader,
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
  Chip
} from '@mui/material';
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
  Assignment
} from '@mui/icons-material';

// Define types for our data structures
type PlanKey = 'basic' | 'advanced';
type BillingPeriod = 'monthly' | 'annual';
type PaymentMethodType = 'creditCard' | 'invoice' | 'paypal';

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
  basic: PlanDetails;
  advanced: PlanDetails;
}

// Styled components
const StyledPlanCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
  cursor: 'pointer',
  position: 'relative',
}));

const SelectedBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  borderRadius: theme.spacing(2),
  padding: theme.spacing(0.5, 1),
  display: 'flex',
  alignItems: 'center',
}));

const PopularBadge = styled(Chip)(({ theme }) => ({
  position: 'absolute',
  top: -12,
  left: '50%',
  transform: 'translateX(-50%)',
  fontWeight: 'bold',
}));

const FeatureItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1.5),
}));

export default function PaymentPage() {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>('basic');
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('creditCard');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  
  const plans: PlansType = {
    basic: {
      title: 'Basic Plan',
      subtitle: 'Essential analytics for your business',
      monthlyPrice: 35,
      annualPrice: 350,
      features: [
        { name: 'Sales Split Dashboard', included: true, icon: <BarChart /> },
        { name: 'Financial Dashboard', included: true, icon: <Timeline /> },
        { name: 'Sales Wide Dashboard', included: true, icon: <PieChart /> },
        { name: 'Product Mix Dashboard', included: true, icon: <TableChart /> },
        { name: 'Order Sheet Dashboard', included: false, icon: <Assignment /> },
      ],
      description: 'Perfect for small to medium businesses looking for core analytics capabilities.',
      icon: <StarIcon />
    },
    advanced: {
      title: 'Advanced Plan',
      subtitle: 'Complete analytics suite',
      monthlyPrice: 50,
      annualPrice: 500,
      features: [
        { name: 'Sales Split Dashboard', included: true, icon: <BarChart /> },
        { name: 'Financial Dashboard', included: true, icon: <Timeline /> },
        { name: 'Sales Wide Dashboard', included: true, icon: <PieChart /> },
        { name: 'Product Mix Dashboard', included: true, icon: <TableChart /> },
        { name: 'Order Sheet Dashboard', included: true, icon: <Assignment /> },
      ],
      description: 'Full access to all dashboards including advanced order sheet analytics.',
      icon: <RocketIcon />,
      popular: true
    }
  };

  const steps: string[] = ['Select Plan', 'Billing Information', 'Payment Method', 'Review & Confirm'];

  const handlePlanChange = (plan: PlanKey): void => {
    setSelectedPlan(plan);
  };

  const handleBillingPeriodChange = (event: React.MouseEvent<HTMLElement>, newPeriod: BillingPeriod | null): void => {
    if (newPeriod !== null) {
      setBillingPeriod(newPeriod);
    }
  };

  const handlePaymentMethodChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
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
      <Typography variant="h5" fontWeight="bold" mb={1}>
        Choose your plan
      </Typography>
      <Typography color="text.secondary" mb={3}>
        Select the perfect plan for your business needs
      </Typography>

      {/* Billing Period Toggle */}
      <Box display="flex" justifyContent="center" mb={4}>
        <ToggleButtonGroup
          value={billingPeriod}
          exclusive
          onChange={handleBillingPeriodChange}
          aria-label="billing period"
        >
          <ToggleButton value="monthly">
            Monthly
          </ToggleButton>
          <ToggleButton value="annual">
            Annual (Save 2 months!)
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {billingPeriod === 'annual' && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Save 2 months with annual billing! Pay for 10 months and get 12 months of access.
          </Typography>
        </Alert>
      )}
      
      <Grid container spacing={3} justifyContent="center">
        {Object.entries(plans).map(([key, plan]) => (
          <Grid item xs={12} md={6} key={key}>
            <StyledPlanCard
              variant="outlined"
              onClick={() => handlePlanChange(key as PlanKey)}
              sx={{
                borderColor: selectedPlan === key ? 'primary.main' : 'divider',
                borderWidth: selectedPlan === key ? 2 : 1,
                position: 'relative',
              }}
            >
              
              
              {selectedPlan === key && (
                <SelectedBadge>
                  <CheckIcon fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography variant="caption">Selected</Typography>
                </SelectedBadge>
              )}
              
              <CardHeader
                avatar={React.cloneElement(plan.icon as React.ReactElement, { color: 'primary' })}
                title={plan.title}
                subheader={plan.subtitle}
              />
              
              <CardContent>
                <Box textAlign="center" mb={3}>
                  <Typography variant="h3" component="div" fontWeight="bold">
                    ${billingPeriod === 'monthly' ? plan.monthlyPrice : plan.annualPrice}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {billingPeriod === 'monthly' ? '/month' : '/year'}
                  </Typography>
                  {billingPeriod === 'annual' && (
                    <Typography variant="body2" color="success.main" fontWeight="medium">
                      Save ${plan.monthlyPrice * 2}!
                    </Typography>
                  )}
                </Box>
                
                <Typography variant="body2" color="text.secondary" mb={3} sx={{ minHeight: 40 }}>
                  {plan.description}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Box mt={3}>
                  {plan.features.map((feature, index) => (
                    <FeatureItem key={index}>
                      {feature.included ? (
                        <CheckIcon color="success" fontSize="small" sx={{ mr: 1.5 }} />
                      ) : (
                        <CloseIcon color="error" fontSize="small" sx={{ mr: 1.5 }} />
                      )}
                      {feature.icon && (
                        <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                          {React.cloneElement(feature.icon as React.ReactElement, { 
                            fontSize: 'small',
                            color: feature.included ? 'action' : 'disabled'
                          })}
                        </Box>
                      )}
                      <Typography 
                        variant="body2" 
                        color={feature.included ? 'text.primary' : 'text.secondary'}
                      >
                        {feature.name}
                      </Typography>
                    </FeatureItem>
                  ))}
                </Box>
                
                <Box mt={3}>
                  <Button
                    fullWidth
                    variant={selectedPlan === key ? "contained" : "outlined"}
                    onClick={() => handlePlanChange(key as PlanKey)}
                  >
                    {selectedPlan === key ? 'Selected' : 'Select Plan'}
                  </Button>
                </Box>
              </CardContent>
            </StyledPlanCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderBillingInformation = () => (
    <Box my={4}>
      <Typography variant="h5" fontWeight="bold" mb={2}>
        Billing Information
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              label="First name"
              fullWidth
              required
              variant="outlined"
              placeholder="Enter your first name"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Last name"
              fullWidth
              required
              variant="outlined"
              placeholder="Enter your last name"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Email address"
              fullWidth
              required
              variant="outlined"
              type="email"
              placeholder="Enter your email"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Company name"
              fullWidth
              required
              variant="outlined"
              placeholder="Enter your company name"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Address line 1"
              fullWidth
              required
              variant="outlined"
              placeholder="Enter your address"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Address line 2"
              fullWidth
              variant="outlined"
              placeholder="Apartment, suite, unit, etc. (optional)"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="City"
              fullWidth
              required
              variant="outlined"
              placeholder="Enter your city"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="State/Province"
              fullWidth
              required
              variant="outlined"
              placeholder="Enter your state"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Zip / Postal code"
              fullWidth
              required
              variant="outlined"
              placeholder="Enter your postal code"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Country"
              fullWidth
              required
              variant="outlined"
              placeholder="Enter your country"
            />
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );

  const renderPaymentMethod = () => (
    <Box my={4}>
      <Typography variant="h5" fontWeight="bold" mb={2}>
        Payment Method
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              borderColor: paymentMethod === 'creditCard' ? 'primary.main' : 'transparent',
              borderWidth: paymentMethod === 'creditCard' ? 2 : 0,
              borderStyle: 'solid'
            }}
          >
            <Box display="flex" alignItems="center" mb={2}>
              <CreditCardIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Credit Card</Typography>
            </Box>
            
            <FormControl component="fieldset">
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
            
            {paymentMethod === 'creditCard' && (
              <Box mt={3}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Name on card"
                      fullWidth
                      required
                      variant="outlined"
                      placeholder="Enter name on card"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Card number"
                      fullWidth
                      required
                      variant="outlined"
                      placeholder="XXXX XXXX XXXX XXXX"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Expiry date"
                      fullWidth
                      required
                      variant="outlined"
                      placeholder="MM/YY"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="CVV"
                      fullWidth
                      required
                      variant="outlined"
                      placeholder="XXX"
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              borderColor: paymentMethod === 'invoice' ? 'primary.main' : 'transparent',
              borderWidth: paymentMethod === 'invoice' ? 2 : 0,
              borderStyle: 'solid'
            }}
          >
            <Box display="flex" alignItems="center" mb={2}>
              <BuildingIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Invoice</Typography>
            </Box>
            
            <FormControl component="fieldset">
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
            
            {paymentMethod === 'invoice' && (
              <Box mt={3}>
                <Typography variant="body2" color="text.secondary" paragraph>
                  An invoice will be sent to your billing email address. Please make payment within 30 days.
                </Typography>
                <TextField
                  label="Purchase Order Number (if applicable)"
                  fullWidth
                  variant="outlined"
                  placeholder="Enter PO number"
                />
              </Box>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              borderColor: paymentMethod === 'paypal' ? 'primary.main' : 'transparent',
              borderWidth: paymentMethod === 'paypal' ? 2 : 0,
              borderStyle: 'solid'
            }}
          >
            <Box display="flex" alignItems="center" mb={2}>
              <WalletIcon sx={{ mr: 1 }} />
              <Typography variant="h6">PayPal</Typography>
            </Box>
            
            <FormControl component="fieldset">
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
            
            {paymentMethod === 'paypal' && (
              <Box mt={3}>
                <Typography variant="body2" color="text.secondary">
                  You will be redirected to PayPal to complete your payment.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  const renderReviewAndConfirm = () => {
    const plan = plans[selectedPlan];
    const price = billingPeriod === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
    
    return (
      <Box my={4}>
        <Typography variant="h5" fontWeight="bold" mb={2}>
          Review & Confirm
        </Typography>
        
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" fontWeight="bold" mb={2}>
            Order Summary
          </Typography>
          
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box>
              <Box display="flex" alignItems="center">
                {React.cloneElement(plan.icon as React.ReactElement, { sx: { mr: 1 } })}
                <Typography fontWeight="medium">
                  {plan.title}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                {billingPeriod === 'monthly' ? 'Monthly' : 'Annual'} subscription
              </Typography>
            </Box>
            <Typography fontWeight="bold">
              ${price}
            </Typography>
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
            <Typography fontWeight="bold" color="primary">${price}</Typography>
          </Box>
          
          <Alert severity="info" sx={{ mt: 2 }}>
            You will be charged ${price} {billingPeriod === 'monthly' ? 'monthly' : 'annually'}. You can cancel anytime.
          </Alert>
        </Paper>
        
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            By clicking "Complete Payment", you agree to our Terms of Service and Privacy Policy.
          </Typography>
        </Box>
      </Box>
    );
  };

  const renderSuccess = () => (
    <Box textAlign="center" py={6}>
      <Box sx={{ 
        width: 64, 
        height: 64, 
        borderRadius: '50%', 
        backgroundColor: 'success.main', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        mx: 'auto'
      }}>
        <CheckIcon sx={{ color: 'white', fontSize: 36 }} />
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
        onClick={() => window.location.href = '/dashboard'}
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
                              color: '#1a237e',
                              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
                            }}
                          >
          Complete Your Purchase</Typography>
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
            endIcon={activeStep !== steps.length - 1 ? <ChevronRightIcon /> : undefined}
            variant="contained"
          >
            {isProcessing ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              activeStep === steps.length - 1 ? 'Complete Payment' : 'Continue'
            )}
          </Button>
        </Box>
      )}
    </Box>
  );
}
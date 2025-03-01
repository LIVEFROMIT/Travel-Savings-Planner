import React, { useState } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Card,
  CardContent,
  InputAdornment,
  Stack,
  Divider,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { differenceInMonths, differenceInDays, format } from 'date-fns';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import SavingsIcon from '@mui/icons-material/Savings';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import FlightPriceTrends from './FlightPriceTrends';

// Exchange rate (1 USD to KRW)
const KRW_EXCHANGE_RATE = 1315;

const TRIP_STYLES = {
  budget: {
    label: 'Budget',
    description: 'Hostels, public transport, local eateries',
    multipliers: {
      flight: 1,
      accommodation: 0.7,
      food: 0.6,
      activities: 0.5,
    },
  },
  comfort: {
    label: 'Comfort',
    description: '3-star hotels, occasional taxis, casual restaurants',
    multipliers: {
      flight: 1,
      accommodation: 1,
      food: 1,
      activities: 1,
    },
  },
  luxury: {
    label: 'Luxury',
    description: '4-5 star hotels, private transport, fine dining',
    multipliers: {
      flight: 1.5,
      accommodation: 2.5,
      food: 2,
      activities: 2,
    },
  },
};

// Currency formatter
const formatCurrency = (amount, currency) => {
  if (currency === 'KRW') {
    const krwAmount = Math.round(amount * KRW_EXCHANGE_RATE);
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0,
    }).format(krwAmount);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const MOCK_TRAVEL_COSTS = {
  'New York': {
    flight: 1200,
    accommodation: 200,
    food: 60,
    activities: 100,
  },
  'Paris': {
    flight: 1500,
    accommodation: 180,
    food: 50,
    activities: 80,
  },
  'Tokyo': {
    flight: 1800,
    accommodation: 150,
    food: 40,
    activities: 70,
  },
};

const DESTINATIONS = Object.keys(MOCK_TRAVEL_COSTS);

const TravelPlanner = () => {
  const [destination, setDestination] = useState('');
  const [arrivalDate, setArrivalDate] = useState(null);
  const [departureDate, setDepartureDate] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [savingsData, setSavingsData] = useState(null);
  const [dateError, setDateError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [savingsSet, setSavingsSet] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [tripStyle, setTripStyle] = useState('comfort');

  const handleCurrencyChange = (event, newCurrency) => {
    if (newCurrency !== null) {
      setCurrency(newCurrency);
    }
  };

  const handleTripStyleChange = (event, newStyle) => {
    if (newStyle !== null) {
      setTripStyle(newStyle);
      if (showResults) {
        calculateSavings();
      }
    }
  };

  const validateDates = () => {
    if (!arrivalDate || !departureDate) {
      setDateError('Please select both arrival and departure dates');
      return false;
    }
    if (arrivalDate >= departureDate) {
      setDateError('Departure date must be after arrival date');
      return false;
    }
    if (arrivalDate <= new Date()) {
      setDateError('Arrival date must be in the future');
      return false;
    }
    setDateError('');
    return true;
  };

  const calculateSavings = () => {
    if (!validateDates()) return;

    const baseCosts = MOCK_TRAVEL_COSTS[destination] || MOCK_TRAVEL_COSTS['New York'];
    const multipliers = TRIP_STYLES[tripStyle].multipliers;
    const monthsUntilTrip = differenceInMonths(arrivalDate, new Date());
    const stayDuration = differenceInDays(departureDate, arrivalDate);
    
    const costs = {
      flight: baseCosts.flight * multipliers.flight,
      accommodation: baseCosts.accommodation * multipliers.accommodation,
      food: baseCosts.food * multipliers.food,
      activities: baseCosts.activities * multipliers.activities,
    };

    const totalCost = (
      costs.flight + 
      (costs.accommodation * stayDuration) + 
      (costs.food * stayDuration) + 
      (costs.activities * stayDuration)
    );
    
    const monthlySavings = Math.ceil(totalCost / monthsUntilTrip);

    setSavingsData({
      totalCost,
      monthlySavings,
      stayDuration,
      monthsToSave: monthsUntilTrip,
      breakdown: {
        flight: costs.flight,
        accommodation: costs.accommodation * stayDuration,
        food: costs.food * stayDuration,
        activities: costs.activities * stayDuration,
      },
    });
    setShowResults(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    calculateSavings();
  };

  const handleSetSavings = () => {
    setOpenDialog(true);
  };

  const handleConfirmSavings = () => {
    setSavingsSet(true);
    setOpenDialog(false);
  };

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 0 }}>
            Travel Savings Planner
          </Typography>
          <ToggleButtonGroup
            value={currency}
            exclusive
            onChange={handleCurrencyChange}
            aria-label="currency selection"
            size="small"
          >
            <ToggleButton value="USD" aria-label="USD">
              USD
            </ToggleButton>
            <ToggleButton value="KRW" aria-label="KRW">
              KRW
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <Autocomplete
              options={DESTINATIONS}
              value={destination}
              onChange={(_, newValue) => setDestination(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Destination"
                  placeholder="e.g., New York"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <FlightTakeoffIcon color="primary" />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Arrival Date"
                  value={arrivalDate}
                  onChange={(newValue) => {
                    setArrivalDate(newValue);
                    setDateError('');
                  }}
                  minDate={new Date()}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!dateError,
                      helperText: dateError,
                    },
                  }}
                />
              </LocalizationProvider>

              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Departure Date"
                  value={departureDate}
                  onChange={(newValue) => {
                    setDepartureDate(newValue);
                    setDateError('');
                  }}
                  minDate={arrivalDate || new Date()}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!dateError,
                    },
                  }}
                />
              </LocalizationProvider>
            </Box>

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Trip Style
              </Typography>
              <ToggleButtonGroup
                value={tripStyle}
                exclusive
                onChange={handleTripStyleChange}
                aria-label="trip style"
                fullWidth
              >
                {Object.entries(TRIP_STYLES).map(([style, { label, description }]) => (
                  <ToggleButton 
                    key={style} 
                    value={style}
                    sx={{
                      py: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AttachMoneyIcon />
                      <Typography variant="subtitle2">{label}</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
                      {description}
                    </Typography>
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>

            <Button
              variant="contained"
              size="large"
              type="submit"
              fullWidth
              disabled={!destination || !arrivalDate || !departureDate}
              sx={{ mt: 2 }}
            >
              Calculate Savings Plan
            </Button>
          </Stack>
        </form>
      </Paper>

      {destination && <FlightPriceTrends destination={destination} currency={currency} tripStyle={tripStyle} />}

      {showResults && savingsData && (
        <Card elevation={3}>
          <CardContent>
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SavingsIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h5">Your Savings Plan</Typography>
                </Box>
                <Typography variant="subtitle1" color="text.secondary">
                  {TRIP_STYLES[tripStyle].label} Trip
                </Typography>
              </Box>

              <Box>
                <Typography variant="h4" color="primary" gutterBottom>
                  {formatCurrency(savingsData.monthlySavings, currency)}/month
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  for {savingsData.monthsToSave} months until your trip
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h6" gutterBottom>Trip Details:</Typography>
                <Stack spacing={1}>
                  <Typography>
                    Duration: {savingsData.stayDuration} days
                  </Typography>
                  <Typography>
                    Total Cost: {formatCurrency(savingsData.totalCost, currency)}
                  </Typography>
                </Stack>
              </Box>

              <Box>
                <Typography variant="h6" gutterBottom>Cost Breakdown:</Typography>
                <Stack spacing={1} sx={{ pl: 2 }}>
                  <Typography>
                    Flight: {formatCurrency(savingsData.breakdown.flight, currency)}
                  </Typography>
                  <Typography>
                    Accommodation ({savingsData.stayDuration} nights): {formatCurrency(savingsData.breakdown.accommodation, currency)}
                  </Typography>
                  <Typography>
                    Food ({savingsData.stayDuration} days): {formatCurrency(savingsData.breakdown.food, currency)}
                  </Typography>
                  <Typography>
                    Activities: {formatCurrency(savingsData.breakdown.activities, currency)}
                  </Typography>
                </Stack>
              </Box>

              <Divider />

              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AccountBalanceWalletIcon />}
                  onClick={handleSetSavings}
                  disabled={savingsSet}
                  sx={{ 
                    minWidth: 250,
                    py: 1.5,
                    backgroundColor: savingsSet ? 'success.main' : 'primary.main',
                    '&:hover': {
                      backgroundColor: savingsSet ? 'success.dark' : 'primary.dark',
                    }
                  }}
                >
                  {savingsSet ? 'Savings Goal Set!' : 'Set Savings Goal in TOSS'}
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      )}

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        aria-labelledby="savings-dialog-title"
      >
        <DialogTitle id="savings-dialog-title">
          Set Up Travel Savings Goal
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            You're about to set up an automatic savings goal in TOSS for your {TRIP_STYLES[tripStyle].label.toLowerCase()} trip to {destination}.
            <Box component="ul" sx={{ mt: 2, mb: 1 }}>
              <li>Monthly savings: {formatCurrency(savingsData?.monthlySavings, currency)}</li>
              <li>Total goal: {formatCurrency(savingsData?.totalCost, currency)}</li>
              <li>Target date: {arrivalDate ? format(arrivalDate, 'MMMM dd, yyyy') : ''}</li>
            </Box>
            TOSS will help you automatically save this amount each month.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmSavings} 
            variant="contained"
            autoFocus
          >
            Confirm Savings Goal
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TravelPlanner; 
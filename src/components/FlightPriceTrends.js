import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Paper, Typography, Box } from '@mui/material';
import { format, addMonths } from 'date-fns';

// Exchange rate (1 USD to KRW)
const KRW_EXCHANGE_RATE = 1315;

const TRIP_STYLES = {
  budget: {
    label: 'Budget',
    flightMultiplier: 1,
  },
  comfort: {
    label: 'Comfort',
    flightMultiplier: 1,
  },
  luxury: {
    label: 'Luxury',
    flightMultiplier: 1.5,
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

// Mock data generator for flight prices
const generateFlightPriceData = (destination, currency, tripStyle = 'comfort') => {
  const basePrice = {
    'New York': 1200,
    'Paris': 1500,
    'Tokyo': 1800
  }[destination] || 1200;

  const seasonalMultipliers = {
    'New York': {
      summer: 1.4,
      winter: 1.2,
      spring: 1.1,
      fall: 1.0
    },
    'Paris': {
      summer: 1.5,
      winter: 0.9,
      spring: 1.2,
      fall: 1.0
    },
    'Tokyo': {
      summer: 1.3,
      winter: 1.1,
      spring: 1.4,
      fall: 1.0
    }
  }[destination] || {
    summer: 1.3,
    winter: 1.1,
    spring: 1.2,
    fall: 1.0
  };

  const data = [];
  const today = new Date();
  const styleMultiplier = TRIP_STYLES[tripStyle].flightMultiplier;

  for (let i = 0; i < 12; i++) {
    const date = addMonths(today, i);
    const month = date.getMonth();
    
    // Determine season multiplier
    let seasonMultiplier;
    if (month >= 5 && month <= 7) seasonMultiplier = seasonalMultipliers.summer;      // Summer
    else if (month >= 11 || month <= 1) seasonMultiplier = seasonalMultipliers.winter; // Winter
    else if (month >= 2 && month <= 4) seasonMultiplier = seasonalMultipliers.spring;  // Spring
    else seasonMultiplier = seasonalMultipliers.fall;                                  // Fall

    // Add some randomness
    const randomVariation = 0.9 + Math.random() * 0.2; // ±10% random variation

    const price = Math.round(basePrice * seasonMultiplier * randomVariation * styleMultiplier);
    const displayPrice = currency === 'KRW' ? price * KRW_EXCHANGE_RATE : price;
    
    data.push({
      month: format(date, 'MMM yyyy'),
      price: displayPrice,
      isLowPrice: price < basePrice * styleMultiplier,
    });
  }

  return data;
};

const FlightPriceTrends = ({ destination, currency = 'USD', tripStyle = 'comfort' }) => {
  const data = generateFlightPriceData(destination, currency, tripStyle);
  const lowestPrice = Math.min(...data.map(d => d.price));
  const highestPrice = Math.max(...data.map(d => d.price));

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Flight Price Trends for {destination}
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Best time to book: {data.find(d => d.price === lowestPrice)?.month} ({formatCurrency(lowestPrice, currency)})
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {TRIP_STYLES[tripStyle].label} Class Flights
        </Typography>
      </Box>
      <Box sx={{ width: '100%', height: 300, mt: 2 }}>
        <ResponsiveContainer>
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: currency === 'KRW' ? 60 : 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month"
              tick={{ fontSize: 12 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              domain={[
                Math.floor(lowestPrice * 0.9 / (currency === 'KRW' ? 10000 : 100)) * (currency === 'KRW' ? 10000 : 100),
                Math.ceil(highestPrice * 1.1 / (currency === 'KRW' ? 10000 : 100)) * (currency === 'KRW' ? 10000 : 100)
              ]}
              tickFormatter={(value) => formatCurrency(value, currency)}
              label={{ 
                value: `Price (${currency})`, 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle' }
              }}
            />
            <Tooltip
              formatter={(value) => [formatCurrency(value, currency), 'Price']}
              labelStyle={{ color: '#666' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#2196f3"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 8 }}
              name="Flight Price"
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        * Prices are estimates based on historical data and seasonal trends
      </Typography>
    </Paper>
  );
};

export default FlightPriceTrends; 
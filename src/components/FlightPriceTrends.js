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

// Destination information including best time to travel
const DESTINATION_INFO = {
  'New York': {
    bestTimeToVisit: {
      weather: 'September to November',
      reason: 'Fall season with mild temperatures and beautiful autumn colors',
      peakSeason: 'Summer (June-August)',
      lowSeason: 'January-February',
    },
    seasonalTips: {
      spring: 'Mild weather, cherry blossoms in Central Park',
      summer: 'Warm, perfect for rooftop bars and outdoor events',
      fall: 'Pleasant temperatures, fall foliage, lower crowds',
      winter: 'Christmas festivities, New Year celebrations',
    }
  },
  'Paris': {
    bestTimeToVisit: {
      weather: 'April to June or September to October',
      reason: 'Mild weather, fewer tourists, and beautiful scenery',
      peakSeason: 'Summer (June-August)',
      lowSeason: 'November-February',
    },
    seasonalTips: {
      spring: 'Cherry blossoms, cafe culture, art exhibitions',
      summer: 'Long days, outdoor dining, festivals',
      fall: 'Wine harvest, cultural events, comfortable weather',
      winter: 'Christmas markets, winter sales, fewer tourists',
    }
  },
  'Tokyo': {
    bestTimeToVisit: {
      weather: 'March to May or September to November',
      reason: 'Cherry blossoms in spring, autumn colors in fall',
      peakSeason: 'Cherry blossom season (late March-April)',
      lowSeason: 'January-February',
    },
    seasonalTips: {
      spring: 'Cherry blossoms, perfect weather for sightseeing',
      summer: 'Festivals and fireworks, but humid',
      fall: 'Autumn colors, comfortable temperatures',
      winter: 'New Year celebrations, winter illuminations',
    }
  },
  'Seoul': {
    bestTimeToVisit: {
      weather: 'March to May or September to November',
      reason: 'Mild temperatures and beautiful seasonal changes',
      peakSeason: 'Cherry blossom season (April)',
      lowSeason: 'Winter (December-February)',
    },
    seasonalTips: {
      spring: 'Cherry blossoms, outdoor festivals',
      summer: 'Hot and humid, but great for night markets',
      fall: 'Autumn foliage, perfect hiking weather',
      winter: 'Winter festivals, skiing opportunities',
    }
  }
};

// Base flight prices for routes (USD)
const ROUTE_PRICES = {
  'Seoul': {
    'New York': 1200,
    'Paris': 1100,
    'Tokyo': 400,
    'Seoul': 0
  },
  'New York': {
    'Seoul': 1200,
    'Paris': 800,
    'Tokyo': 1400,
    'New York': 0
  },
  'Paris': {
    'Seoul': 1100,
    'New York': 800,
    'Tokyo': 1200,
    'Paris': 0
  },
  'Tokyo': {
    'Seoul': 400,
    'New York': 1400,
    'Paris': 1200,
    'Tokyo': 0
  }
};

// Currency formatter
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Mock data generator for flight prices
const generateFlightPriceData = (destination, fromLocation, tripStyle = 'comfort') => {
  const basePrice = ROUTE_PRICES[fromLocation]?.[destination] || 1200;

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
    
    let seasonMultiplier;
    if (month >= 5 && month <= 7) seasonMultiplier = seasonalMultipliers.summer;
    else if (month >= 11 || month <= 1) seasonMultiplier = seasonalMultipliers.winter;
    else if (month >= 2 && month <= 4) seasonMultiplier = seasonalMultipliers.spring;
    else seasonMultiplier = seasonalMultipliers.fall;

    const randomVariation = 0.9 + Math.random() * 0.2;
    const price = Math.round(basePrice * seasonMultiplier * randomVariation * styleMultiplier);
    
    data.push({
      month: format(date, 'MMM yyyy'),
      price: price,
      isLowPrice: price < basePrice * styleMultiplier,
    });
  }

  return data;
};

const getCurrentSeason = (month) => {
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
};

const FlightPriceTrends = ({ destination, fromLocation = 'Seoul', tripStyle = 'comfort' }) => {
  const data = generateFlightPriceData(destination, fromLocation, tripStyle);
  const lowestPrice = Math.min(...data.map(d => d.price));
  const highestPrice = Math.max(...data.map(d => d.price));
  const destinationInfo = DESTINATION_INFO[destination];
  const currentMonth = new Date().getMonth();
  const currentSeason = getCurrentSeason(currentMonth);

  const getDomainValue = (value, isMin) => {
    const roundTo = 100;
    return Math.round(value * (isMin ? 0.9 : 1.1) / roundTo) * roundTo;
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Flight Price Trends: {fromLocation} → {destination}
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="subtitle1" color="primary" gutterBottom>
              Best Time to Visit {destination}
            </Typography>
            <Typography variant="body2">
              🌤️ {destinationInfo.bestTimeToVisit.weather}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {destinationInfo.bestTimeToVisit.reason}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" color="warning.main">
              Peak Season: {destinationInfo.bestTimeToVisit.peakSeason}
            </Typography>
            <Typography variant="body2" color="success.main">
              Low Season: {destinationInfo.bestTimeToVisit.lowSeason}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ 
          backgroundColor: 'grey.50', 
          p: 2, 
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'grey.200'
        }}>
          <Typography variant="subtitle2" gutterBottom>
            Current Season ({currentSeason.charAt(0).toUpperCase() + currentSeason.slice(1)}) Tips:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {destinationInfo.seasonalTips[currentSeason]}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Best time to book: {data.find(d => d.price === lowestPrice)?.month} ({formatCurrency(lowestPrice)})
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {TRIP_STYLES[tripStyle].label} Class Flights
          </Typography>
        </Box>
      </Box>

      <Box sx={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
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
                getDomainValue(lowestPrice, true),
                getDomainValue(highestPrice, false)
              ]}
              tickFormatter={formatCurrency}
              label={{ 
                value: 'Price (USD)', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle' }
              }}
            />
            <Tooltip
              formatter={(value) => [formatCurrency(value), 'Price']}
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
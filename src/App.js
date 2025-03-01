import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import TravelPlanner from './components/TravelPlanner';
import { Container, Box } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3', // A nice blue color that matches TOSS's style
    },
    secondary: {
      main: '#ff9800',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Pretendard", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: 'background.default',
          py: 4,
        }}
      >
        <Container maxWidth="md">
          <TravelPlanner />
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App; 
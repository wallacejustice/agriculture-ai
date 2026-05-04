import { createTheme } from '@mui/material/styles';

/**
 * AI for Agriculture - Professional Theme Configuration
 */

const colors = {
  primary: {
    light: '#81c784',
    main: '#2e7d32',
    dark: '#1b5e20',
    contrastText: '#ffffff',
  },
  secondary: {
    light: '#ffb74d',
    main: '#f57c00',
    dark: '#e65100',
    contrastText: '#ffffff',
  },
};

// ✅ CRITICAL FIX: borderRadius MUST be a NUMBER (not object)
export const getTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: colors.primary,
    secondary: colors.secondary,
    background: {
      default: mode === 'dark' ? '#0f131a' : '#ffffff',
      paper: mode === 'dark' ? '#1e2530' : '#ffffff',
    },
    text: {
      primary: mode === 'dark' ? '#e6e6e6' : '#121212',
      secondary: mode === 'dark' ? '#94a3b8' : '#64748b',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 14,
    h4: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  spacing: 4,
  // ✅ CRITICAL FIX: Changed from object to NUMBER
  shape: {
    borderRadius: 8, // ← MUST BE A NUMBER (not object)
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 16 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 16 },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
});

export default getTheme;
import { createTheme } from '@mui/material/styles';
import { indigo, teal, lightGreen, grey } from '@mui/material/colors';

declare module '@mui/material/styles' {
  interface Theme {
    status: {
      danger: string;
      warning: string;
      success: string;
    };
  }
  interface ThemeOptions {
    status?: {
      danger?: string;
      warning?: string;
      success?: string;
    };
  }
}

const theme = createTheme({
  palette: {
    primary: {
      main: indigo[700],
      light: indigo[500],
      dark: indigo[900],
    },
    secondary: {
      main: teal[500],
      light: teal[300],
      dark: teal[700],
    },
    success: {
      main: lightGreen[600],
    },
    background: {
      default: grey[50],
      paper: '#ffffff',
    },
  },
  status: {
    danger: '#ff4444',
    warning: '#ffbb33',
    success: '#00C851',
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
          '&:hover': {
            boxShadow: '0 6px 24px 0 rgba(0,0,0,0.1)',
          },
        },
      },
    },
  },
});

export default theme;

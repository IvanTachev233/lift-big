import { createTheme, ThemeOptions } from '@mui/material/styles';

// Base theme options shared between dark and light modes
const baseThemeOptions: ThemeOptions = {
  typography: {
    fontFamily: "'Inter', sans-serif",
    fontWeightBold: 600,
    h1: { fontWeight: 600, letterSpacing: '-0.025em' },
    h2: { fontWeight: 600, letterSpacing: '-0.025em' },
    h3: { fontWeight: 600, letterSpacing: '-0.025em' },
    h4: { fontWeight: 600, letterSpacing: '-0.025em' },
    h5: { fontWeight: 600, letterSpacing: '-0.025em' },
    h6: { fontWeight: 600, letterSpacing: '-0.025em' },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          textTransform: 'none',
          borderRadius: '0.5rem',
          padding: '0.5rem 1.25rem',
          transition: 'all 0.2s ease',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '0.75rem',
          boxShadow:
            '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          transition: 'all 0.3s ease',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '0.75rem',
        },
      },
    },
  },
};

// Dark theme - matches :root in design-system.css
export const darkTheme = createTheme({
  ...baseThemeOptions,
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1', // --primary (Electric Indigo)
      dark: '#4f46e5', // --primary-hover
      light: 'rgba(99, 102, 241, 0.1)', // --primary-light
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#334155', // --border-color
    },
    success: {
      main: '#10b981', // --accent-success (Neon Mint)
      dark: '#059669',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#f59e0b', // --accent-warning (Signal Orange)
      contrastText: '#ffffff',
    },
    error: {
      main: '#ef4444', // --accent-danger
      dark: '#dc2626',
      contrastText: '#ffffff',
    },
    info: {
      main: '#06b6d4', // --accent-info
    },
    background: {
      default: '#0f172a', // --bg-deep (Gunmetal Deep)
      paper: '#1e293b', // --bg-surface (Slate Grey)
    },
    text: {
      primary: '#f8fafc', // --text-main (Cloud White)
      secondary: '#94a3b8', // --text-muted (Steel Blue)
    },
    divider: '#334155', // --border-color
  },
  components: {
    ...baseThemeOptions.components,
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '0.75rem',
          boxShadow:
            '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          transition: 'all 0.3s ease',
          backgroundColor: '#1e293b', // --bg-surface
          border: '1px solid #334155', // --border-color
          '&:hover': {
            borderColor: 'rgba(99, 102, 241, 0.3)',
            boxShadow:
              '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          textTransform: 'none',
          borderRadius: '0.5rem',
          padding: '0.5rem 1.25rem',
          transition: 'all 0.2s ease',
        },
        containedPrimary: {
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '0.75rem',
          backgroundImage: 'none',
        },
      },
    },
  },
});

// Light theme - matches .light-mode in design-system.css
export const lightTheme = createTheme({
  ...baseThemeOptions,
  palette: {
    mode: 'light',
    primary: {
      main: '#4f46e5', // --primary (slightly darker for contrast)
      dark: '#4338ca', // --primary-hover
      light: 'rgba(79, 70, 229, 0.1)', // --primary-light
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#e2e8f0', // --border-color (light)
    },
    success: {
      main: '#10b981',
      dark: '#059669',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#f59e0b',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ef4444',
      dark: '#dc2626',
      contrastText: '#ffffff',
    },
    info: {
      main: '#06b6d4',
    },
    background: {
      default: '#f8fafc', // --bg-deep (Cloud White)
      paper: '#ffffff', // --bg-surface (Pure White)
    },
    text: {
      primary: '#0f172a', // --text-main (Gunmetal Deep)
      secondary: '#64748b', // --text-muted (Slate)
    },
    divider: '#e2e8f0', // --border-color
  },
  components: {
    ...baseThemeOptions.components,
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '0.75rem',
          boxShadow:
            '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          transition: 'all 0.3s ease',
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          '&:hover': {
            borderColor: 'rgba(79, 70, 229, 0.3)',
            boxShadow:
              '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          textTransform: 'none',
          borderRadius: '0.5rem',
          padding: '0.5rem 1.25rem',
          transition: 'all 0.2s ease',
        },
        containedPrimary: {
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.4)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '0.75rem',
          backgroundImage: 'none',
        },
      },
    },
  },
});

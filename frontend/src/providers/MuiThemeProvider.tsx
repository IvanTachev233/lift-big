import React from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { useTheme } from '../contexts/ThemeContext';
import { darkTheme, lightTheme } from '../theme';

interface MidnightMuiThemeProviderProps {
  children: React.ReactNode;
}

/**
 * MUI Theme Provider that syncs with the existing ThemeContext
 * Automatically switches between dark and light MUI themes
 */
const MidnightMuiThemeProvider: React.FC<MidnightMuiThemeProviderProps> = ({ children }) => {
  const { theme } = useTheme();

  // Select the appropriate MUI theme based on current theme context
  const muiTheme = theme === 'dark' ? darkTheme : lightTheme;

  return <MuiThemeProvider theme={muiTheme}>{children}</MuiThemeProvider>;
};

export default MidnightMuiThemeProvider;

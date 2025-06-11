import React from 'react';
import { ThemeProvider } from 'styled-components';
import { theme } from './theme';
import GlobalStyles from './GlobalStyles';

/**
 * Theme provider component that wraps the entire application
 * Provides theme context and global styles to all child components
 */
const AppThemeProvider = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      {children}
    </ThemeProvider>
  );
};

export default AppThemeProvider;

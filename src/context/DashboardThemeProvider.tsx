import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { useAppSelector } from '../storeHooks';
import { DashboardTheme } from '../types/dashboardTheme';
import '../theme/themeAugmentation';
import { createMuiThemeFromDashboardTheme, getDefaultDashboardTheme } from '../styles/themeConstants';

interface DashboardThemeContextType {
  currentTheme: DashboardTheme | null;
  applyTheme: (theme: DashboardTheme) => void;
  resetToDefault: () => void;
}

const DashboardThemeContext = createContext<DashboardThemeContextType | undefined>(undefined);

interface DashboardThemeProviderProps {
  children: React.ReactNode;
}

export const DashboardThemeProvider: React.FC<DashboardThemeProviderProps> = ({ children }) => {
  const { currentTheme } = useAppSelector((state) => state.dashboardTheme);
  const [theme, setTheme] = useState<DashboardTheme>(getDefaultDashboardTheme());

  useEffect(() => {
    if (currentTheme) {
      setTheme(currentTheme);
    } else {
      setTheme(getDefaultDashboardTheme());
    }
  }, [currentTheme]);

  const applyTheme = (newTheme: DashboardTheme) => {
    setTheme(newTheme);
  };

  const resetToDefault = () => {
    setTheme(getDefaultDashboardTheme());
  };

  const muiTheme = createMuiThemeFromDashboardTheme(theme);

  const contextValue: DashboardThemeContextType = {
    currentTheme: theme,
    applyTheme,
    resetToDefault,
  };

  return (
    <DashboardThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </DashboardThemeContext.Provider>
  );
};

export const useDashboardTheme = () => {
  const context = useContext(DashboardThemeContext);
  if (context === undefined) {
    throw new Error('useDashboardTheme must be used within a DashboardThemeProvider');
  }
  return context;
}; 
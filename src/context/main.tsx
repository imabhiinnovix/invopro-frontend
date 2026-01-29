import { ReactNode } from 'react';
import AuthProvider from './AuthContext';
import GeneralProvider from './GeneralContext';
import { NavProvider } from './NavContext';
import { AppThemeProvider } from './AppThemeContext';

interface MainProviderProps {
  children: ReactNode;
}

const MainProvider = ({ children }: MainProviderProps) => {
  return (
    <AppThemeProvider>
      <AuthProvider>
        <GeneralProvider>
          <NavProvider>{children}</NavProvider>
        </GeneralProvider>
      </AuthProvider>
    </AppThemeProvider>
  );
};

export default MainProvider;

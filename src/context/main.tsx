import { ReactNode } from 'react';
import AuthProvider from './AuthContext';
import GeneralProvider from './GeneralContext';
import { NavProvider } from './NavContext';

interface MainProviderProps {
  children: ReactNode;
}

const MainProvider = ({ children }: MainProviderProps) => {
  return (
    <AuthProvider>
      <GeneralProvider>
        <NavProvider>{children}</NavProvider>
      </GeneralProvider>
    </AuthProvider>
  );
};

export default MainProvider;

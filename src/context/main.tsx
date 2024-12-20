import { ReactNode } from 'react';
import AuthProvider from './AuthContext';
import GeneralProvider from './GeneralContext';

interface MainProviderProps {
  children: ReactNode;
}

const MainProvider = ({ children }: MainProviderProps) => {
  return (
    <AuthProvider>
      <GeneralProvider>{children}</GeneralProvider>
    </AuthProvider>
  );
};

export default MainProvider;

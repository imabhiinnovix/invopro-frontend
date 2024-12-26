import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of the context value
export interface NavContextType {
  openNav: boolean;
  setOpenNav: (open: boolean) => void;
}

// Create the context with an undefined default value
export const NavContext = createContext<NavContextType | undefined>(undefined);

// Create a provider component
interface NavProviderProps {
  children: ReactNode;
}

export const NavProvider: React.FC<NavProviderProps> = ({ children }) => {
  const [openNav, setOpenNav] = useState<boolean>(true);

  return <NavContext.Provider value={{ openNav, setOpenNav }}>{children}</NavContext.Provider>;
};

// Custom hook to consume the NavContext
export const useNav = (): NavContextType => {
  const context = useContext(NavContext);
  if (!context) {
    throw new Error('useNav must be used within a NavProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { TYPOGRAPHY } from '../styles/typography';

export interface TypographySettings {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
}

interface TypographyContextType {
  typographySettings: TypographySettings;
  updateTypographySettings: (settings: Partial<TypographySettings>) => void;
  resetTypographySettings: () => void;
  fontOptions: Array<{ label: string; value: string }>;
  fontSizeOptions: Array<{ label: string; value: string }>;
  fontWeightOptions: Array<{ label: string; value: string }>;
}

const defaultTypographySettings: TypographySettings = {
  fontFamily: TYPOGRAPHY.fontFamily.primary,
  fontSize: TYPOGRAPHY.fontSize.base,
  fontWeight: TYPOGRAPHY.fontWeight.regular,
};

const TypographyContext = createContext<TypographyContextType | undefined>(undefined);

export const useTypography = () => {
  const context = useContext(TypographyContext);
  if (!context) {
    throw new Error('ERROR');
  }
  return context;
};

interface TypographyProviderProps {
  children: ReactNode;
  initialSettings?: Partial<TypographySettings>;
}

export const TypographyProvider: React.FC<TypographyProviderProps> = ({ 
  children, 
  initialSettings = {} 
}) => {
  const [typographySettings, setTypographySettings] = useState<TypographySettings>({
    ...defaultTypographySettings,
    ...initialSettings,
  });

  const updateTypographySettings = (settings: Partial<TypographySettings>) => {
    setTypographySettings(prev => ({
      ...prev,
      ...settings,
    }));
  };

  const resetTypographySettings = () => {
    setTypographySettings(defaultTypographySettings);
  };

  const fontOptions = TYPOGRAPHY.fontOptions;

  const fontSizeOptions = Object.entries(TYPOGRAPHY.fontSize).map(([key, value]) => ({
    label: `${key.charAt(0).toUpperCase() + key.slice(1)} (${value})`,
    value,
  }));

  const fontWeightOptions = Object.entries(TYPOGRAPHY.fontWeight).map(([key, value]) => ({
    label: `${key.charAt(0).toUpperCase() + key.slice(1)} (${value})`,
    value,
  }));

  const value: TypographyContextType = {
    typographySettings,
    updateTypographySettings,
    resetTypographySettings,
    fontOptions,
    fontSizeOptions,
    fontWeightOptions,
  };

  return (
    <TypographyContext.Provider value={value}>
      {children}
    </TypographyContext.Provider>
  );
}; 
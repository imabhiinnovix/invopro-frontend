import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';
import { useComponentTypography } from '../../../hooks/useComponentTypography';

interface ButtonProps extends MuiButtonProps {
  forceTypography?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  sx, 
  forceTypography = true,
  ...props 
}) => {
  const { getButtonSx } = useComponentTypography();
  
  const typographySx = getButtonSx();
  
  return (
    <MuiButton
      {...props}
      sx={{
        ...typographySx,
        ...sx,
      }}
    >
      {children}
    </MuiButton>
  );
};

export default Button; 
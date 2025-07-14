import React from 'react';
import { Select, SelectProps, FormControl, InputLabel } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface StyledSelectProps extends Omit<SelectProps, 'MenuProps'> {
  label?: string;
  name?: string;
  children: React.ReactNode;
}

const StyledSelect: React.FC<StyledSelectProps> = ({ 
  label, 
  name,
  children, 
  sx = {}, 
  ...props 
}) => {
  const theme = useTheme();

  const selectSx = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: theme.palette.dropdown?.background || theme.palette.background.paper,
      '& fieldset': {
        borderColor: theme.palette.input?.border || theme.palette.divider,
      },
      '&:hover fieldset': {
        borderColor: theme.palette.dropdown?.focusedBorder || theme.palette.primary.main,
      },
      '&.Mui-focused fieldset': {
        borderColor: theme.palette.dropdown?.focusedBorder || theme.palette.primary.main,
      },
    },
    '& .MuiInputLabel-root': {
      color: theme.palette.dropdown?.labelColor || theme.palette.text.secondary,
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: theme.palette.dropdown?.focusedLabel || theme.palette.primary.main,
    },
    '& .MuiSelect-select': {
      color: theme.palette.dropdown?.selectedText || theme.palette.text.primary,
    },
    ...sx,
  };

  const menuProps = {
    PaperProps: {
      sx: {
        backgroundColor: theme.palette.dropdown?.background || theme.palette.background.paper,
        '& .MuiMenuItem-root': {
          color: theme.palette.dropdown?.optionText || theme.palette.text.primary,
          '&:hover': {
            backgroundColor: theme.palette.dropdown?.optionHoverBackground || theme.palette.action.hover,
          },
          '&.Mui-selected': {
            backgroundColor: theme.palette.dropdown?.optionBackground || theme.palette.action.selected,
            color: theme.palette.dropdown?.selectedText || theme.palette.primary.main,
            '&:hover': {
              backgroundColor: theme.palette.dropdown?.optionHoverBackground || theme.palette.action.hover,
              color: theme.palette.dropdown?.selectedText || theme.palette.primary.main,
            },
          },
        },
      },
    },
  };

  if (label) {
    const inputId = `${name || 'select'}-input`;
    
    return (
      <FormControl fullWidth>
        <InputLabel id={inputId}>{label}</InputLabel>
        <Select
          labelId={inputId}
          id={inputId}
          label={label}
          MenuProps={menuProps}
          sx={selectSx}
          {...props}
        >
          {children}
        </Select>
      </FormControl>
    );
  }

  return (
    <Select
      MenuProps={menuProps}
      sx={selectSx}
      {...props}
    >
      {children}
    </Select>
  );
};

export default StyledSelect; 
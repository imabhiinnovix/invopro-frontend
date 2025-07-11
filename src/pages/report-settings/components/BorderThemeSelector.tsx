import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  useTheme,
} from '@mui/material';

interface BorderTheme {
  name: string;
  main: string;
  hover: string;
  description: string;
}

const borderThemes: BorderTheme[] = [
  {
    name: 'Purple',
    main: '#9c27b0',
    hover: '#7b1fa2',
    description: 'Purple theme with dark purple hover'
  },
  {
    name: 'Blue',
    main: '#1976d2',
    hover: '#1565c0',
    description: 'Blue theme with dark blue hover'
  },
  {
    name: 'Green',
    main: '#2e7d32',
    hover: '#1b5e20',
    description: 'Green theme with dark green hover'
  },
  {
    name: 'Orange',
    main: '#ed6c02',
    hover: '#e65100',
    description: 'Orange theme with dark orange hover'
  },
  {
    name: 'Red',
    main: '#d32f2f',
    hover: '#c62828',
    description: 'Red theme with dark red hover'
  },
  {
    name: 'Gray',
    main: '#757575',
    hover: '#616161',
    description: 'Gray theme with dark gray hover'
  },
  {
    name: 'Teal',
    main: '#00796b',
    hover: '#004d40',
    description: 'Teal theme with dark teal hover'
  },
  {
    name: 'Indigo',
    main: '#3f51b5',
    hover: '#303f9f',
    description: 'Indigo theme with dark indigo hover'
  }
];

interface BorderThemeSelectorProps {
  selectedTheme: string;
  onThemeChange: (theme: BorderTheme) => void;
}

const BorderThemeSelector: React.FC<BorderThemeSelectorProps> = ({
  selectedTheme,
  onThemeChange,
}) => {
  const theme = useTheme();

  const handleThemeChange = (event: any) => {
    const themeName = event.target.value;
    const borderTheme = borderThemes.find(t => t.name === themeName);
    if (borderTheme) {
      onThemeChange(borderTheme);
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ 
        fontWeight: 600,
        color: theme.palette.text.primary,
        mb: 2
      }}>
        Border Theme Selection
      </Typography>
      
      <FormControl fullWidth>
        <InputLabel id="border-theme-select-label">Select Border Theme</InputLabel>
        <Select
          labelId="border-theme-select-label"
          value={selectedTheme}
          label="Select Border Theme"
          onChange={handleThemeChange}
        >
          {borderThemes.map((borderTheme) => (
            <MenuItem key={borderTheme.name} value={borderTheme.name}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: '4px',
                      backgroundColor: borderTheme.main,
                      border: '1px solid #ccc',
                    }}
                  />
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: '4px',
                      backgroundColor: borderTheme.hover,
                      border: '1px solid #ccc',
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {borderTheme.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {borderTheme.description}
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedTheme && (
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label={`Main: ${borderThemes.find(t => t.name === selectedTheme)?.main}`}
            size="small"
            sx={{
              backgroundColor: borderThemes.find(t => t.name === selectedTheme)?.main,
              color: 'white',
              fontWeight: 500,
            }}
          />
          <Chip
            label={`Hover: ${borderThemes.find(t => t.name === selectedTheme)?.hover}`}
            size="small"
            sx={{
              backgroundColor: borderThemes.find(t => t.name === selectedTheme)?.hover,
              color: 'white',
              fontWeight: 500,
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default BorderThemeSelector; 
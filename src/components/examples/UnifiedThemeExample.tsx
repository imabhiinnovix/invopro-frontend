import React from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import { useUnifiedTheme } from '../../hooks/useUnifiedTheme';

/**
 * Example component showing how to use the unified theme system
 * This replaces the need for separate useTheme() and useDashboardTheme() calls
 */
export const UnifiedThemeExample: React.FC = () => {
  const theme = useUnifiedTheme();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Unified Theme Example
      </Typography>

      {/* Using MUI theme properties */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ color: theme.palette.primary.main }}>
          MUI Theme Properties
        </Typography>
        <Typography>
          Primary Color: {theme.palette.primary.main}
        </Typography>
        <Typography>
          Background: {theme.palette.background.paper}
        </Typography>
      </Box>

      {/* Using custom palette properties */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ color: theme.palette.primary.main }}>
          Custom Palette Properties
        </Typography>
        <Typography>
          Icon Color: {theme.getIconColor()}
        </Typography>
        <Typography>
          Input Text Color: {theme.getInputTextColor()}
        </Typography>
        <Typography>
          Border Color: {theme.border?.main}
        </Typography>
      </Box>

      {/* Using helper methods */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ color: theme.palette.primary.main }}>
          Helper Methods
        </Typography>
        <Button 
          variant="contained" 
          sx={{ 
            mr: 2,
            '& .MuiSvgIcon-root': {
              color: theme.getIconColor()
            }
          }}
        >
          Button with Icon Color
        </Button>
      </Box>

      {/* Using custom input styling */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ color: theme.palette.primary.main }}>
          Custom Input Styling
        </Typography>
        <TextField
          label="Custom Styled Input"
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              color: theme.getInputTextColor(),
              '& fieldset': {
                borderColor: theme.getInputBorderColor(),
              },
              '&:hover fieldset': {
                borderColor: theme.border?.hover,
              },
            },
            '& .MuiInputLabel-root': {
              color: theme.palette.text.secondary,
            },
          }}
        />
      </Box>

      {/* Access to full dashboard theme for backward compatibility */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ color: theme.palette.primary.main }}>
          Dashboard Theme (Backward Compatibility)
        </Typography>
        <Typography>
          Theme Name: {theme.dashboardTheme?.name}
        </Typography>
        <Typography>
          Primary Color: {theme.dashboardTheme?.colors?.primary?.main}
        </Typography>
      </Box>
    </Box>
  );
}; 
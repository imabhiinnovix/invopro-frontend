import React, { useState } from 'react';
import { Box, TextField, IconButton, Typography, Paper, InputAdornment } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useAppDispatch, useAppSelector } from '../../storeHooks';

import { ChartGrid } from '../dashboard/components/ChartGrid';
import { fetchWidgetSettingBasedOnNaturalLanguage } from '../dashboard/dashboardActions';
import { STYLE_GUIDE } from '../../styles';
import { useUnifiedTheme } from '../../hooks/useUnifiedTheme';

const ChatPage: React.FC = () => {
  const theme = useUnifiedTheme();
  
  const dispatch = useAppDispatch();
  const { chartsLoading } = useAppSelector((state) => ({
    chartsLoading: state.dashboard.chartsLoading,
  }));

  const [input, setInput] = useState('');

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    await dispatch(fetchWidgetSettingBasedOnNaturalLanguage(trimmedInput));

    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <Box
      component={Paper}
      elevation={3}
      display="flex"
      flexDirection="column"
      height="100%"
      sx={{ backgroundColor: theme.palette.background.paper }}
    >
      <Box p={STYLE_GUIDE.SPACING.s4} color={STYLE_GUIDE.COLORS.black}>
        <Typography variant="h5">Generate Smart Charts from Your Questions</Typography>
      </Box>

      <Box flex={1} display="flex" flexDirection="column" overflow="hidden">
        <Box flex={1} overflow="auto" px={STYLE_GUIDE.SPACING.s4} py={STYLE_GUIDE.SPACING.s2}>
          <ChartGrid
            dashboardId={'1'}
            isEditMode={false}
            onEditChart={() => { }}
            isAddChartModalOpen={false}
            isEditChartModalOpen={false}
            gridColumns={1}
            isNaturalLangauage={true}
          />
        </Box>
      </Box>

      {/* <Box display="flex" p={2}>
        <TextField
          fullWidth
          label="Type your message"
          variant="outlined"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={chartsLoading}
        />

        <IconButton color="primary" onClick={handleSend} sx={{ ml: 1 }}>
          <SendIcon />
        </IconButton>
      </Box> */}

      <Box display="flex" p={STYLE_GUIDE.SPACING.s4} mr={STYLE_GUIDE.SPACING.s7} alignItems="center">
        <TextField
          multiline
          minRows={3}
          fullWidth
          label="Ask anything"
          variant="outlined"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={chartsLoading}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleSend}
                  disabled={chartsLoading || !input.trim()}
                  sx={{
                    backgroundColor: theme.dashboardTheme?.colors?.primary?.main || STYLE_GUIDE.COLORS.darkBackground,
                    color: theme.dashboardTheme?.colors?.primary?.contrastText || STYLE_GUIDE.COLORS.white,
                    borderRadius: STYLE_GUIDE.SPACING.s4,
                    '&:hover': {
                      backgroundColor: theme.dashboardTheme?.colors?.primary?.light || STYLE_GUIDE.COLORS.darkDarker,
                    },
                    width: 48,
                    height: 48,
                  }}
                >
                  <SendIcon sx={{ color: theme.getIconColor() }} />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: STYLE_GUIDE.SPACING.s6,
              alignItems: 'flex-start',
              paddingRight: STYLE_GUIDE.SPACING.s2,
              fontSize: '14px',
              backgroundColor: theme.dashboardTheme?.colors?.background?.paper || '#ffffff',
              '& fieldset': {
                borderColor: theme.dashboardTheme?.colors?.inputBorder || STYLE_GUIDE.COLORS.darkBackground,
              },
              '&:hover fieldset': {
                borderColor: theme.dashboardTheme?.colors?.borderHover || STYLE_GUIDE.COLORS.darkBorderHover,
              },
                              '&.Mui-focused fieldset': {
                  borderColor: theme.dashboardTheme?.components?.input?.focusBorderColor || theme.dashboardTheme?.components?.input?.focusBorderColorFallback || STYLE_GUIDE.COLORS.inputFocusFallback,
                },
            },
            '& .MuiInputLabel-root': {
              color: theme.dashboardTheme?.colors?.text?.secondary || STYLE_GUIDE.COLORS.darkBorderFocus,
            },
                          '& .MuiInputLabel-root.Mui-focused': {
                color: theme.dashboardTheme?.components?.input?.focusBorderColor || theme.dashboardTheme?.components?.input?.focusBorderColorFallback || STYLE_GUIDE.COLORS.inputFocusFallback,
              },
            '& .MuiInputBase-input': {
              color: `${theme.dashboardTheme?.colors?.inputText || theme.palette.text.primary} !important`,
            },
            '& .MuiInputBase-input::placeholder': {
              color: `${theme.dashboardTheme?.colors?.text?.secondary || '#666'} !important`,
            },
            '& .MuiInputBase-input:-webkit-autofill': {
              WebkitTextFillColor: `${theme.dashboardTheme?.colors?.inputText || theme.palette.text.primary} !important`,
              WebkitBoxShadow: `0 0 0 1000px ${theme.dashboardTheme?.colors?.background?.paper || '#ffffff'} inset !important`,
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default ChatPage;

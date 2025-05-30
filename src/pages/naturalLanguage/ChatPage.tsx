import React, { useState } from 'react';
import { Box, TextField, IconButton, Typography, Paper, InputAdornment } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useAppDispatch, useAppSelector } from '../../storeHooks';

import { ChartGrid } from '../dashboard/components/ChartGrid';
import { fetchWidgetSettingBasedOnNaturalLanguage } from '../dashboard/dashboardActions';

const ChatPage: React.FC = () => {
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
    <Box component={Paper} elevation={3} display="flex" flexDirection="column" height="100%">
      <Box p={2} color="black">
        <Typography variant="h5">Generate Smart Charts from Your Questions</Typography>
      </Box>

      <Box flex={1} display="flex" flexDirection="column" overflow="hidden">
        <Box flex={1} overflow="auto" px={2} py={1}>
          <ChartGrid
            dashboardId={'1'}
            isEditMode={false}
            onEditChart={() => {}}
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

      <Box display="flex" p={2} mr={3.5} alignItems="center">
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
                    backgroundColor: '#5c5c5c',
                    color: 'white',
                    borderRadius: '16px',
                    '&:hover': {
                      backgroundColor: '#222',
                    },
                    width: 48,
                    height: 48,
                  }}
                >
                  <SendIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '24px',
              alignItems: 'flex-start',
              paddingRight: '8px',
              '& fieldset': {
                borderColor: '#5c5c5c', // Darker border
              },
              '&:hover fieldset': {
                borderColor: '#444', // Even darker on hover
              },
              '&.Mui-focused fieldset': {
                borderColor: '#333', // Darkest when focused
              },
            },
            '& .MuiInputLabel-root': {
              color: '#333', // Darker label
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#222', // Even darker when focused
            },
          }}
          // sx={{
          //   '& .MuiOutlinedInput-root': {
          //     borderRadius: '24px',
          //     alignItems: 'flex-start',
          //     paddingRight: '8px',
          //     paddingLeft: '8px',
          //   },
          //   '& .MuiInputLabel-root': {
          //     top: '-4px',
          //   },
          // }}
        />
      </Box>
    </Box>
  );
};

export default ChatPage;

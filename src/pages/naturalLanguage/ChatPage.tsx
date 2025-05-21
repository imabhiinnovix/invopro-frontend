import React, { useState } from 'react';
import { Box, TextField, IconButton, Typography, Paper } from '@mui/material';
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

      <Box display="flex" p={2} borderTop="1px solid #ccc">
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
      </Box>
    </Box>
  );
};

export default ChatPage;

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { AddChartModal } from '../dashboard/components/AddChartModal';
import { useAppDispatch, useAppSelector } from '../../storeHooks';

import { ChartGrid } from '../dashboard/components/ChartGrid';
import { fetchWidgetSettingBasedOnNaturalLanguage } from '../dashboard/dashboardActions';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

const ChatPage: React.FC = () => {
  const dispatch = useAppDispatch();
  // const { widgetSettingsHistory, widgetSettingsLoading, widgetSettingsError } = useAppSelector((state) => ({
  //   widgetSettingsHistory: state.naturalLanguageReducer.widgetSettingsHistory || [],
  //   widgetSettingsLoading: state.naturalLanguageReducer.widgetSettingsLoading,
  //   widgetSettingsError: state.naturalLanguageReducer.widgetSettingsError,
  // }));

  const [input, setInput] = useState('');
  const [openModalIndex, setOpenModalIndex] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    await dispatch(fetchWidgetSettingBasedOnNaturalLanguage(trimmedInput));

    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  // useEffect(() => {
  //   bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  // }, [widgetSettingsHistory]);

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
          {/* <List>
            {widgetSettingsHistory.map((data, index) => (
              <ListItem key={`chart-${index}`} alignItems="flex-start" sx={{ flexDirection: 'column' }}>
                <Typography fontWeight="bold" color="text.secondary">
                  Query: <span style={{ color: '#000' }}>{data.userQuery}</span>
                </Typography>

                <AddChartModal
                  open={true}
                  onClose={() => setOpenModalIndex(null)}
                  isSubmitting={false}
                  dashboardId={''}
                  initialData={data}
                  isNaturalLangauage={true}
                  // onSave={handleChartUpdate}
                />
              </ListItem>
            ))}
            {widgetSettingsLoading && (
              <ListItem>
                <CircularProgress size={20} />
                <ListItemText sx={{ ml: 2 }} primary="Fetching chart settings..." />
              </ListItem>
            )}
            <div ref={bottomRef} />
          </List> */}
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
          // disabled={widgetSettingsLoading}
        />
        {/* disabled={widgetSettingsLoading} */}
        <IconButton color="primary" onClick={handleSend} sx={{ ml: 1 }}>
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ChatPage;

import React, { useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  Avatar,
  InputAdornment,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PersonIcon from '@mui/icons-material/Person';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../../services/axiosInstance';
import { GET } from '../../services/apiRoutes';

const validationSchema = yup.object().shape({
  query: yup.string().required('Please enter your question'),
});

interface QAPair {
  userQuery: string;
  htmlContent: string;
  loading?: boolean;
  error?: string;
}

function extractHtmlFromApiData(data: any): string {
  if (typeof data !== 'string') return '';
  if (data.startsWith('```')) {
    return data.replace(/^```[a-zA-Z]*\n?|```$/g, '').replace(/```$/, '');
  }
  return data;
}

const AIInsightPage: React.FC = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [qaPairs, setQAPairs] = React.useState<QAPair[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<{ query: string }>({
    resolver: yupResolver(validationSchema),
  });

  const insightMutation = useMutation({
    mutationFn: async (userQuery: string) => {
      const { data } = await axiosInstance.get(`${GET.NL_Query_INSIGHTS}`, {
        params: { userQuery }
      });
      return data;
    },
    onSuccess: (result) => {
      setQAPairs(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          htmlContent: extractHtmlFromApiData(result.data),
          loading: false,
        };
        return updated;
      });
    },
    onError: (error: any) => {
      setQAPairs(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          htmlContent: '',
          loading: false,
          error: error?.response?.data?.message || 'API error',
        };
        return updated;
      });
    }
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [qaPairs]);

  const onSubmit = async (formData: { query: string }) => {
    const userQuery = formData.query;
    setQAPairs(prev => [
      ...prev,
      { userQuery, htmlContent: '', loading: true },
    ]);
    reset();
    insightMutation.mutate(userQuery);
  };

  return (
    <Box sx={{
      height: '100%',
      bgcolor: '#f7f9fb',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Box px={2} py={3} borderBottom={1} borderColor="divider" bgcolor="white">
        <Typography variant="h5" fontWeight={700} gutterBottom>
          AI Insights
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Ask questions about your data and get AI-powered insights
        </Typography>
      </Box>
      <Box sx={{
        flex: 1,
        overflowY: 'auto',
        px: { xs: 2, sm: 2 },
        py: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        backgroundColor: 'white',
      }}>
        {qaPairs.length === 0 && (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
            Start the conversation by asking a question below.
          </Typography>
        )}
        {qaPairs.map((qa, index) => (
          <React.Fragment key={index}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                <Box
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    px: 2.5,
                    py: 1.2,
                    borderRadius: '24px',
                    maxWidth: 420,
                    fontSize: '1rem',
                    wordBreak: 'break-word',
                    boxShadow: 'none',
                  }}
                >
                  {qa.userQuery}
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, ml: 0.5 }}>
                  <PersonIcon />
                </Avatar>
              </Box>
            </Box>
            {qa.loading && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32, mr: 0.5 }}>
                    <AutoAwesomeIcon />
                  </Avatar>
                  <Box
                    sx={{
                      bgcolor: 'grey.100',
                      color: 'text.primary',
                      px: 2.5,
                      py: 1.2,
                      borderRadius: '24px',
                      maxWidth: 520,
                      fontSize: '1rem',
                      wordBreak: 'break-word',
                      boxShadow: 'none',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <CircularProgress size={20} sx={{ mr: 1 }} /> Generating insight...
                  </Box>
                </Box>
              </Box>
            )}
            {qa.htmlContent && !qa.loading && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32, mr: 0.5 }}>
                    <AutoAwesomeIcon />
                  </Avatar>
                  <Box
                    sx={{
                      bgcolor: 'grey.100',
                      color: 'text.primary',
                      px: 2.5,
                      py: 1.2,
                      borderRadius: '24px',
                      maxWidth: 520,
                      fontSize: '1rem',
                      wordBreak: 'break-word',
                      boxShadow: 'none',
                    }}
                  >
                    <Box sx={{ mt: 0.5 }} dangerouslySetInnerHTML={{ __html: qa.htmlContent }} />
                  </Box>
                </Box>
              </Box>
            )}
            {qa.error && !qa.loading && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32, mr: 0.5 }}>
                    <AutoAwesomeIcon />
                  </Avatar>
                  <Box
                    sx={{
                      bgcolor: 'grey.100',
                      color: 'error.main',
                      px: 2.5,
                      py: 1.2,
                      borderRadius: '24px',
                      maxWidth: 520,
                      fontSize: '1rem',
                      wordBreak: 'break-word',
                      boxShadow: 'none',
                    }}
                  >
                    {qa.error}
                  </Box>
                </Box>
              </Box>
            )}
          </React.Fragment>
        ))}
        <div ref={messagesEndRef} />
      </Box>
        {/* {insightMutation.isError && (
          <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
            {insightMutation.error?.response?.data?.message || 'An error occurred'}
          </Alert>
        )} */}
      <Box sx={{
        width: '100%',
        bgcolor: 'white',
        py: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
    
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', gap: 1, width: '100%', maxWidth: 900 }}>
          <TextField
            multiline
            minRows={2}
            fullWidth
            placeholder="Ask anything"
            variant="outlined"
            {...register('query')}
            error={!!errors.query}
            helperText={errors.query?.message}
            disabled={insightMutation.isPending}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    type="submit"
                    color="primary"
                    disabled={insightMutation.isPending}
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
                    {insightMutation.isPending ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '24px',
                alignItems: 'center',
                padding: '20px',
                '& fieldset': {
                  borderColor: '#5c5c5c',
                },
                '&:hover fieldset': {
                  borderColor: '#444',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#333',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#333',
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#222',
              },
            }}
            autoComplete="off"
          />
        </Box>
      </Box>
    </Box>
  );
};

export default AIInsightPage; 
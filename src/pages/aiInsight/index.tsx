import React, { useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  Avatar,
  InputAdornment,
  useTheme,
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
import { useDashboardTheme } from '../../context/DashboardThemeProvider';
import { STYLE_GUIDE } from '../../styles';


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
  const theme = useTheme();
  const { currentTheme } = useDashboardTheme();
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

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
      bgcolor: theme.palette.background.paper,
      display: 'flex',
      flexDirection: 'column',
      boxShadow: theme.shadows[1],
      fontFamily: theme.typography.fontFamily,
    }}>
      <Box
        px={3}
        py={3}
        borderBottom={1}
        borderColor={theme.palette.divider}
        bgcolor={theme.palette.background.paper}
      >
        <Typography
          variant="h5"
          fontWeight={600}
          gutterBottom
          color={theme.palette.text.primary}
          fontSize="1.5rem"
          fontFamily={theme.typography.fontFamily}
        >
          AI Insights
        </Typography>
        <Typography
          variant="body1"
          color={theme.palette.text.secondary}
          fontSize="1rem"
          fontFamily={theme.typography.fontFamily}
        >
          Ask questions about your data and get AI-powered insights
        </Typography>
      </Box>
      <Box sx={{
        flex: 1,
        overflowY: 'auto',
        px: 3,
        py: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        backgroundColor: theme.palette.background.paper,
      }}>
        {qaPairs.length === 0 && (
          <Typography
            variant="body2"
            color={theme.palette.text.secondary}
            align="center"
            sx={{ mt: 6 }}
            fontSize="1rem"
            fontFamily={theme.typography.fontFamily}
          >
            Start the conversation by asking a question below.
          </Typography>
        )}
        {qaPairs.map((qa, index) => (
          <React.Fragment key={index}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                <Box
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    px: 3,
                    py: 1.5,
                    borderRadius: 3,
                    maxWidth: 420,
                    fontSize: '1rem',
                    wordBreak: 'break-word',
                    boxShadow: 'none',
                    fontFamily: theme.typography.fontFamily,
                  }}
                >
                  <Typography
                    variant="body1"
                    color="inherit"
                    fontSize="1rem"
                    fontFamily={theme.typography.fontFamily}
                  >
                    {qa.userQuery}
                  </Typography>
                </Box>
                <Avatar sx={{
                  bgcolor: theme.palette.primary.main,
                  width: 32,
                  height: 32,
                  ml: 1
                }}>
                  <PersonIcon />
                </Avatar>
              </Box>
            </Box>
            {qa.loading && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                  <Avatar sx={{
                    bgcolor: theme.palette.secondary.main,
                    width: 32,
                    height: 32,
                    mr: 1
                  }}>
                    <AutoAwesomeIcon />
                  </Avatar>
                  <Box
                    sx={{
                      bgcolor: theme.palette.background.default,
                      color: theme.palette.text.primary,
                      px: 3,
                      py: 1.5,
                      borderRadius: 3,
                      maxWidth: 520,
                      fontSize: '1rem',
                      wordBreak: 'break-word',
                      boxShadow: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      fontFamily: theme.typography.fontFamily,
                    }}
                  >
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    <Typography
                      variant="body2"
                      color={theme.palette.text.secondary}
                      component="span"
                      fontSize="0.875rem"
                      fontFamily={theme.typography.fontFamily}
                    >
                      Generating insights...
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
            {qa.htmlContent && !qa.loading && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                  <Avatar sx={{
                    bgcolor: theme.palette.secondary.main,
                    width: 32,
                    height: 32,
                    mr: 1
                  }}>
                    <AutoAwesomeIcon />
                  </Avatar>
                  <Box
                    sx={{
                      bgcolor: theme.palette.background.default,
                      color: theme.palette.text.primary,
                      px: 3,
                      py: 1.5,
                      borderRadius: 3,
                      maxWidth: 520,
                      fontSize: '1rem',
                      wordBreak: 'break-word',
                      boxShadow: 'none',
                      fontFamily: theme.typography.fontFamily,
                    }}
                  >
                    <Box sx={{ mt: 1 }}>
                      <Typography
                        variant="body1"
                        color={theme.palette.text.primary}
                        component="span"
                        fontSize="1rem"
                        fontFamily={theme.typography.fontFamily}
                        sx={{ wordBreak: 'break-word' }}
                        dangerouslySetInnerHTML={{ __html: qa.htmlContent }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}
            {qa.error && !qa.loading && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                  <Avatar sx={{
                    bgcolor: theme.palette.error.main,
                    width: 32,
                    height: 32,
                    mr: 1
                  }}>
                    <AutoAwesomeIcon />
                  </Avatar>
                  <Box
                    sx={{
                      bgcolor: theme.palette.background.default,
                      color: theme.palette.error.main,
                      px: 3,
                      py: 1.5,
                      borderRadius: 3,
                      maxWidth: 520,
                      fontSize: '1rem',
                      wordBreak: 'break-word',
                      boxShadow: 'none',
                      fontFamily: theme.typography.fontFamily,
                    }}
                  >
                    <Typography
                      variant="body2"
                      color={theme.palette.error.main}
                      fontSize="0.875rem"
                      fontFamily={theme.typography.fontFamily}
                    >
                      {qa.error}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </React.Fragment>
        ))}
        <div ref={messagesEndRef} />
      </Box>
      <Box sx={{
        width: '100%',
        bgcolor: theme.palette.background.paper,
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
            onKeyDown={handleKeyPress}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    type="submit"
                    color="primary"
                    disabled={insightMutation.isPending}
                    sx={{
                      backgroundColor: currentTheme?.colors?.primary?.main || STYLE_GUIDE.COLORS.darkBackground,
                      color: currentTheme?.colors?.primary?.contrastText || STYLE_GUIDE.COLORS.white,
                      borderRadius: currentTheme?.components?.button?.borderRadius || STYLE_GUIDE.SPACING.s4,
                      '&:hover': {
                        backgroundColor: currentTheme?.colors?.primary?.light || STYLE_GUIDE.COLORS.darkDarker,
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
                borderRadius: STYLE_GUIDE.SPACING.s6,
                alignItems: 'flex-start',
                padding: 3,
                paddingRight: STYLE_GUIDE.SPACING.s2,
                fontSize: '14px',
                backgroundColor: currentTheme?.colors?.background?.paper || '#ffffff',
                '& fieldset': {
                  borderColor: currentTheme?.colors?.inputBorder || STYLE_GUIDE.COLORS.darkBackground,
                },
                '&:hover fieldset': {
                  borderColor: currentTheme?.colors?.borderHover || STYLE_GUIDE.COLORS.darkBorderHover,
                },
                '&.Mui-focused fieldset': {
                  borderColor: currentTheme?.components?.input?.focusBorderColor || currentTheme?.components?.input?.focusBorderColorFallback || STYLE_GUIDE.COLORS.inputFocusFallback,
                },
              },
              '& .MuiInputLabel-root': {
                color: currentTheme?.colors?.text?.secondary || STYLE_GUIDE.COLORS.darkBorderFocus,
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: currentTheme?.components?.input?.focusBorderColor || currentTheme?.components?.input?.focusBorderColorFallback || STYLE_GUIDE.COLORS.inputFocusFallback,
              },
              '& .MuiInputBase-input': {
                color: `${currentTheme?.colors?.inputText || theme.palette.text.primary} !important`,
              },
              '& .MuiInputBase-input::placeholder': {
                color: `${currentTheme?.colors?.text?.secondary || '#666'} !important`,
              },
              '& .MuiInputBase-input:-webkit-autofill': {
                WebkitTextFillColor: `${currentTheme?.colors?.inputText || theme.palette.text.primary} !important`,
                WebkitBoxShadow: `0 0 0 1000px ${currentTheme?.colors?.background?.paper || '#ffffff'} inset !important`,
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
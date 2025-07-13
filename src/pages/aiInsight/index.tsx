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
      boxShadow: STYLE_GUIDE.SHADOWS.xs,
      fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
    }}>
      <Box
        px={STYLE_GUIDE.SPACING.s4}
        py={STYLE_GUIDE.SPACING.s4}
        borderBottom={1}
        borderColor={STYLE_GUIDE.COLORS.divider}
        bgcolor={STYLE_GUIDE.COLORS.white}
      >
        <Typography
          variant="h5"
          fontWeight={STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold}
          gutterBottom
          color={STYLE_GUIDE.COLORS.textDarkBlue}
          fontSize={STYLE_GUIDE.TYPOGRAPHY.fontSize.xxl}
          fontFamily={STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary}
        >
          AI Insights
        </Typography>
        <Typography
          variant="body1"
          color={STYLE_GUIDE.COLORS.textMediumGray}
          fontSize={STYLE_GUIDE.TYPOGRAPHY.fontSize.base}
          fontFamily={STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary}
        >
          Ask questions about your data and get AI-powered insights
        </Typography>
      </Box>
      <Box sx={{
        flex: 1,
        overflowY: 'auto',
        px: STYLE_GUIDE.SPACING.s4,
        py: STYLE_GUIDE.SPACING.s3,
        display: 'flex',
        flexDirection: 'column',
        gap: STYLE_GUIDE.SPACING.s3,
        backgroundColor: STYLE_GUIDE.COLORS.white,
      }}>
        {qaPairs.length === 0 && (
          <Typography
            variant="body2"
            color={STYLE_GUIDE.COLORS.textMediumGray}
            align="center"
            sx={{ mt: STYLE_GUIDE.SPACING.s6 }}
            fontSize={STYLE_GUIDE.TYPOGRAPHY.fontSize.base}
            fontFamily={STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary}
          >
            Start the conversation by asking a question below.
          </Typography>
        )}
        {qaPairs.map((qa, index) => (
          <React.Fragment key={index}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: STYLE_GUIDE.SPACING.s1 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: STYLE_GUIDE.SPACING.s1 }}>
                <Box
                  sx={{
                    bgcolor: STYLE_GUIDE.COLORS.primary,
                    color: STYLE_GUIDE.COLORS.white,
                    px: STYLE_GUIDE.SPACING.s4,
                    py: STYLE_GUIDE.SPACING.s2,
                    borderRadius: STYLE_GUIDE.SPACING.s4,
                    maxWidth: 420,
                    fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base,
                    wordBreak: 'break-word',
                    boxShadow: 'none',
                    fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
                  }}
                >
                  <Typography
                    variant="body1"
                    color="inherit"
                    fontSize={STYLE_GUIDE.TYPOGRAPHY.fontSize.base}
                    fontFamily={STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary}
                  >
                    {qa.userQuery}
                  </Typography>
                </Box>
                <Avatar sx={{
                  bgcolor: STYLE_GUIDE.COLORS.primary,
                  width: 32,
                  height: 32,
                  ml: STYLE_GUIDE.SPACING.s1
                }}>
                  <PersonIcon />
                </Avatar>
              </Box>
            </Box>
            {qa.loading && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: STYLE_GUIDE.SPACING.s2 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: STYLE_GUIDE.SPACING.s1 }}>
                  <Avatar sx={{
                    bgcolor: STYLE_GUIDE.COLORS.materialPurple,
                    width: 32,
                    height: 32,
                    mr: STYLE_GUIDE.SPACING.s1
                  }}>
                    <AutoAwesomeIcon />
                  </Avatar>
                  <Box
                    sx={{
                      bgcolor: STYLE_GUIDE.COLORS.backgroundGray,
                      color: STYLE_GUIDE.COLORS.textDarkBlue,
                      px: STYLE_GUIDE.SPACING.s4,
                      py: STYLE_GUIDE.SPACING.s2,
                      borderRadius: STYLE_GUIDE.SPACING.s4,
                      maxWidth: 520,
                      fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base,
                      wordBreak: 'break-word',
                      boxShadow: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
                    }}
                  >
                    <CircularProgress size={20} sx={{ mr: STYLE_GUIDE.SPACING.s1 }} />
                    <Typography
                      variant="body2"
                      color={STYLE_GUIDE.COLORS.textMediumGray}
                      component="span"
                      fontSize={STYLE_GUIDE.TYPOGRAPHY.fontSize.small}
                      fontFamily={STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary}
                    >
                      Generating insights...
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
            {qa.htmlContent && !qa.loading && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: STYLE_GUIDE.SPACING.s2 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: STYLE_GUIDE.SPACING.s1 }}>
                  <Avatar sx={{
                    bgcolor: STYLE_GUIDE.COLORS.materialPurple,
                    width: 32,
                    height: 32,
                    mr: STYLE_GUIDE.SPACING.s1
                  }}>
                    <AutoAwesomeIcon />
                  </Avatar>
                  <Box
                    sx={{
                      bgcolor: STYLE_GUIDE.COLORS.backgroundGray,
                      color: STYLE_GUIDE.COLORS.textDarkBlue,
                      px: STYLE_GUIDE.SPACING.s4,
                      py: STYLE_GUIDE.SPACING.s2,
                      borderRadius: STYLE_GUIDE.SPACING.s4,
                      maxWidth: 520,
                      fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base,
                      wordBreak: 'break-word',
                      boxShadow: 'none',
                      fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
                    }}
                  >
                    <Box sx={{ mt: STYLE_GUIDE.SPACING.s1 }}>
                      <Typography
                        variant="body1"
                        color={STYLE_GUIDE.COLORS.textDarkBlue}
                        component="span"
                        fontSize={STYLE_GUIDE.TYPOGRAPHY.fontSize.base}
                        fontFamily={STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary}
                        sx={{ wordBreak: 'break-word' }}
                        dangerouslySetInnerHTML={{ __html: qa.htmlContent }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}
            {qa.error && !qa.loading && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: STYLE_GUIDE.SPACING.s2 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: STYLE_GUIDE.SPACING.s1 }}>
                  <Avatar sx={{
                    bgcolor: STYLE_GUIDE.COLORS.materialPurple,
                    width: 32,
                    height: 32,
                    mr: STYLE_GUIDE.SPACING.s1
                  }}>
                    <AutoAwesomeIcon />
                  </Avatar>
                  <Box
                    sx={{
                      bgcolor: STYLE_GUIDE.COLORS.backgroundGray,
                      color: STYLE_GUIDE.COLORS.materialError,
                      px: STYLE_GUIDE.SPACING.s4,
                      py: STYLE_GUIDE.SPACING.s2,
                      borderRadius: STYLE_GUIDE.SPACING.s4,
                      maxWidth: 520,
                      fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base,
                      wordBreak: 'break-word',
                      boxShadow: 'none',
                      fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
                    }}
                  >
                    <Typography
                      variant="body2"
                      color={STYLE_GUIDE.COLORS.materialError}
                      fontSize={STYLE_GUIDE.TYPOGRAPHY.fontSize.small}
                      fontFamily={STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary}
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
      {/* {insightMutation.isError && (
          <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
            {insightMutation.error?.response?.data?.message || 'An error occurred'}
          </Alert>
        )} */}
      <Box sx={{
        width: '100%',
        bgcolor: STYLE_GUIDE.COLORS.white,
        py: STYLE_GUIDE.SPACING.s3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', gap: STYLE_GUIDE.SPACING.s1, width: '100%', maxWidth: 900 }}>
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
                      backgroundColor: STYLE_GUIDE.COLORS.darkBackground,
                      color: STYLE_GUIDE.COLORS.white,
                      borderRadius: STYLE_GUIDE.SPACING.s3,
                      '&:hover': {
                        backgroundColor: STYLE_GUIDE.COLORS.darkDarker,
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
                borderRadius: STYLE_GUIDE.SPACING.s4,
                alignItems: 'center',
                padding: STYLE_GUIDE.SPACING.s4,
                fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base,
                fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
                '& fieldset': {
                  borderColor: STYLE_GUIDE.COLORS.darkBorder,
                },
                '&:hover fieldset': {
                  borderColor: STYLE_GUIDE.COLORS.darkBorderHover,
                },
                '&.Mui-focused fieldset': {
                  borderColor: STYLE_GUIDE.COLORS.darkBorderFocus,
                },
              },
              '& .MuiInputLabel-root': {
                color: STYLE_GUIDE.COLORS.textDarkBlue,
                fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: STYLE_GUIDE.COLORS.textDarkGray,
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
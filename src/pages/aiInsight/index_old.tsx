import React, { useRef, useEffect } from "react";
import {
  Box,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  Avatar,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import PersonIcon from "@mui/icons-material/Person";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../../services/axiosInstance";
import { GET } from "../../services/apiRoutes";
import { useUnifiedTheme } from "../../hooks/useUnifiedTheme";
import { useComponentTypography } from "../../hooks/useComponentTypography";

const validationSchema = yup.object().shape({
  query: yup.string().required("Please enter your question"),
});

interface QAPair {
  userQuery: string;
  htmlContent: string;
  loading?: boolean;
  error?: string;
}

function extractHtmlFromApiData(data: any): string {
  if (typeof data !== "string") return "";
  if (data.startsWith("```")) {
    return data.replace(/^```[a-zA-Z]*\n?|```$/g, "").replace(/```$/, "");
  }
  return data;
}

const AIInsightPage: React.FC = () => {
  const theme = useUnifiedTheme();
  const { getHeadingSx } = useComponentTypography();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
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
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  const insightMutation = useMutation({
    mutationFn: async (userQuery: string) => {
      const { data } = await axiosInstance.get(`${GET.NL_Query_INSIGHTS}`, {
        params: { userQuery },
      });
      return data;
    },
    onSuccess: (result) => {
      setQAPairs((prev) => {
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
      setQAPairs((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          htmlContent: "",
          loading: false,
          error: error?.response?.data?.message || "API error",
        };
        return updated;
      });
    },
  });

  useEffect(() => {
    if (qaPairs.length > 0 && messagesContainerRef.current) {
      // Scroll to bottom smoothly when new messages arrive
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [qaPairs]);

  const onSubmit = async (formData: { query: string }) => {
    const userQuery = formData.query;
    setQAPairs((prev) => [
      ...prev,
      { userQuery, htmlContent: "", loading: true },
    ]);
    reset();
    insightMutation.mutate(userQuery);
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "calc(100vh - 64px)",
        backgroundColor: theme.palette.background.paper,
        p: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden", // Prevent page scroll
      }}
    >
      {/* Header Section - Fixed at top */}
      <Box
        sx={{
          p: 2,
          backgroundColor: theme.palette.background.paper,
          borderRadius: 1,
          mb: 2,
          boxShadow: theme.shadows[1],
          flexShrink: 0, // Prevent shrinking
        }}
      >
        <Typography
          variant="h5"
          sx={{
            ...getHeadingSx(),
            fontSize: getHeadingSx().fontSize,
            fontWeight: getHeadingSx().fontWeight,
            color: theme.palette.text.primary,
            mb: 0.5,
          }}
        >
          AI Insights
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.secondary,
            fontFamily: theme.typography.fontFamily,
          }}
        >
          Ask questions about your data and get AI-powered insights
        </Typography>
      </Box>

      {/* Messages Container - Scrollable area */}
      <Box
        sx={{
          backgroundColor: theme.palette.background.paper,
          borderRadius: 1,
          boxShadow: theme.shadows[1],
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          flex: 1, // Take remaining space
          minHeight: 0, // Important for flex scrolling
        }}
      >
        {/* Messages Section - Scrollable */}
        <Box
          ref={messagesContainerRef}
          sx={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            p: 3,
            display: "flex",
            flexDirection: "column",
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: theme.palette.background.default,
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: theme.palette.divider,
              borderRadius: "4px",
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
              },
            },
          }}
        >
          {qaPairs.length === 0 && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: "0.95rem",
                  fontFamily: theme.typography.fontFamily,
                }}
              >
                Start the conversation by asking a question below.
              </Typography>
            </Box>
          )}

          {qaPairs.map((qa, index) => (
            <React.Fragment key={index}>
              {/* User Message - Right Aligned */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1,
                    maxWidth: "70%",
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                      px: 2,
                      py: 1.5,
                      borderRadius: 2,
                      fontSize: "0.95rem",
                      wordBreak: "break-word",
                      fontFamily: theme.typography.fontFamily,
                    }}
                  >
                    {qa.userQuery}
                  </Box>
                  <Avatar
                    sx={{
                      bgcolor: theme.palette.primary.main,
                      width: 32,
                      height: 32,
                    }}
                  >
                    <PersonIcon sx={{ fontSize: 20 }} />
                  </Avatar>
                </Box>
              </Box>

              {/* AI Response - Left Aligned */}
              {qa.loading && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-start",
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1,
                      maxWidth: "70%",
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: theme.palette.secondary.main,
                        width: 32,
                        height: 32,
                      }}
                    >
                      <AutoAwesomeIcon sx={{ fontSize: 20 }} />
                    </Avatar>
                    <Box
                      sx={{
                        bgcolor: theme.palette.background.default,
                        color: theme.palette.text.primary,
                        px: 2,
                        py: 1.5,
                        borderRadius: 2,
                        fontSize: "0.95rem",
                        fontFamily: theme.typography.fontFamily,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <CircularProgress size={16} />
                      <Typography
                        variant="body2"
                        color={theme.palette.text.secondary}
                        fontSize="0.95rem"
                        fontFamily={theme.typography.fontFamily}
                      >
                        Generating insights...
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}

              {qa.htmlContent && !qa.loading && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-start",
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1,
                      maxWidth: "70%",
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: theme.palette.secondary.main,
                        width: 32,
                        height: 32,
                      }}
                    >
                      <AutoAwesomeIcon sx={{ fontSize: 20 }} />
                    </Avatar>
                    <Box
                      sx={{
                        bgcolor: theme.palette.background.default,
                        color: theme.palette.text.primary,
                        px: 2,
                        py: 1.5,
                        borderRadius: 2,
                        fontSize: "0.95rem",
                        wordBreak: "break-word",
                        fontFamily: theme.typography.fontFamily,
                      }}
                      dangerouslySetInnerHTML={{ __html: qa.htmlContent }}
                    />
                  </Box>
                </Box>
              )}

              {qa.error && !qa.loading && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-start",
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1,
                      maxWidth: "70%",
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: theme.palette.error.main,
                        width: 32,
                        height: 32,
                      }}
                    >
                      <AutoAwesomeIcon sx={{ fontSize: 20 }} />
                    </Avatar>
                    <Box
                      sx={{
                        bgcolor: theme.palette.background.default,
                        color: theme.palette.error.main,
                        px: 2,
                        py: 1.5,
                        borderRadius: 2,
                        fontSize: "0.95rem",
                        wordBreak: "break-word",
                        fontFamily: theme.typography.fontFamily,
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

        {/* Input Section - Fixed at bottom */}
        <Box
          sx={{
            p: 2,
            backgroundColor: theme.palette.background.paper,
            borderTop: 1,
            borderColor: theme.palette.divider,
            flexShrink: 0, // Prevent shrinking
          }}
        >
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{
              display: "flex",
              alignItems: "flex-end",
              gap: 1,
            }}
          >
            <TextField
              multiline
              maxRows={4}
              fullWidth
              placeholder="Ask anything..."
              variant="outlined"
              {...register("query")}
              error={!!errors.query}
              helperText={errors.query?.message}
              disabled={insightMutation.isPending}
              onKeyDown={handleKeyPress}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  backgroundColor: theme.palette.background.default,
                  fontSize: "0.95rem",
                  fontFamily: theme.typography.fontFamily,
                  "& fieldset": {
                    borderColor: theme.palette.divider,
                  },
                  "&:hover fieldset": {
                    borderColor: theme.palette.primary.main,
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: theme.palette.primary.main,
                  },
                },
                "& .MuiInputBase-input": {
                  color: theme.palette.text.primary,
                },
                "& .MuiInputBase-input::placeholder": {
                  color: theme.palette.text.secondary,
                  opacity: 0.7,
                },
              }}
              autoComplete="off"
            />
            <IconButton
              type="submit"
              disabled={insightMutation.isPending}
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                width: 48,
                height: 48,
                "&:hover": {
                  backgroundColor: theme.palette.primary.dark,
                },
                "&.Mui-disabled": {
                  backgroundColor: theme.palette.action.disabledBackground,
                },
              }}
            >
              {insightMutation.isPending ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <SendIcon />
              )}
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AIInsightPage;

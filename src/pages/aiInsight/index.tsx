import React, { useRef, useEffect } from "react";
import { Box, TextField, IconButton, Typography, Stack } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../../services/axiosInstance";
import { GET } from "../../services/apiRoutes";
import { useUnifiedTheme } from "../../hooks/useUnifiedTheme";
import { useComponentTypography } from "../../hooks/useComponentTypography";
import { AI_INSIGHT_SESSION_ID, AI_INSIGHT_URL } from "../../utils/constants";
import { getAuthToken } from "../../utils/handleLocalStorage";

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

  const token = getAuthToken();

  return (
    <Stack height="100%" width="100%">
      <Stack
        direction="column"
        sx={{
          // borderBottom: 1,
          borderColor: "divider",
          p: 2,
          backgroundColor: "#f9f9f9",
          borderRadius: 1,
        }}
      >
        <Typography variant="h6">AI Insights</Typography>
        <Typography variant="body2">
          Ask questions about your data and get AI-powered insights
        </Typography>
      </Stack>
      {window.location.hostname === "app.reportivix.com" ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            width: "100%",
          }}
        >
          <Typography variant="h4" color="text.secondary">
            Coming Soon
          </Typography>
        </Box>
      ) : (
        <iframe
          src={`${AI_INSIGHT_URL}?session_id=${AI_INSIGHT_SESSION_ID}&token=${token}`}
          width="100%"
          height="100%"
        />
      )}
    </Stack>
  );
};

export default AIInsightPage;

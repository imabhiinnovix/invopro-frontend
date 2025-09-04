import Box from "@mui/material/Box";
import { Card, CircularProgress, Button, Typography } from "@mui/material";
import { STYLE_GUIDE } from "../../styles";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import usePut from "../../hooks/usePut";
import { PUT } from "../../services/apiRoutes";

function AcknowledgeNotification() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
const key = searchParams.get('key');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  // Initialize usePut hook
  const acknowledgeNotification = usePut(["acknowledgeNotification"]);
  console.log("id", id, key);

  useEffect(() => {
    const sendAcknowledgement = async () => {
      try {
        const response: any = await acknowledgeNotification.mutateAsync({
          url: `${PUT.SEND_ACKNOWLEDGE}/${id}`,
          payload: { identifierKey: key },
        });

        if (response.success) {
          setMessage(
            response.message || "Notification acknowledged successfully"
          );
          setSuccess(true);
        } else {
          throw new Error(response.message || "Page Expired or Not Found");
        }
      } catch (error: any) {
        setMessage(error.message || "Failed to acknowledge notification");
        setSuccess(false);
      } finally {
        setLoading(false);
      }
    };

    if (id && key) {
      sendAcknowledgement();
    }
  }, [id, key]);

  const handleReturnToLogin = () => {
    navigate("/login");
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{ margin: STYLE_GUIDE.SPACING.s3 }}
    >
      <Card sx={{ p: 4, textAlign: "center", maxWidth: 800, pt: 9 }}>
        {loading ? (
          <>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Processing your request...
            </Typography>
          </>
        ) : (
          <>
            <Typography
              variant="h6"
              color={success ? "success.main" : "error.main"}
              sx={{ mb: 3 }}
            >
              {message}
            </Typography>
            <Button
              variant="contained"
              //   color="primary"
              onClick={handleReturnToLogin}
              sx={{ mt: 2 }}
            >
              Return to Login Page
            </Button>
          </>
        )}
      </Card>
    </Box>
  );
}

export default AcknowledgeNotification;

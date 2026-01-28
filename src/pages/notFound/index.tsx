import { useNavigate } from "react-router-dom";
import { Button, Typography, Container, Box } from "@mui/material";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        textAlign: "center",
        padding: 3,
      }}
    >
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: "6rem", md: "10rem" },
            fontWeight: 800,
            color: "#1a237e",
            textShadow: "4px 4px 10px rgba(0,0,0,0.1)",
          }}
        >
          404
        </Typography>
      </Box>

      <Box sx={{ mb: 6 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            color: "#37474f",
            marginBottom: 2,
          }}
        >
          Page Not Found
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "#546e7a",
            maxWidth: "500px",
            fontSize: "1.1rem",
            mx: "auto",
          }}
        >
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </Typography>
      </Box>

      <Box>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate("/")}
          sx={{
            borderRadius: "50px",
            padding: "10px 30px",
            fontSize: "1rem",
            textTransform: "none",
            backgroundColor: "#1a237e",
            "&:hover": {
              backgroundColor: "#0d47a1",
              boxShadow: "0 6px 15px rgba(26, 35, 126, 0.4)",
            },
          }}
        >
          Go Back
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound;

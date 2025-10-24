import { Box } from "@mui/material";
import { Stack } from "@mui/material";
import landingPage from "../../assets/landing_page.jpg";

export const LoginFlowLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <Stack flexDirection="row" height="100vh" width="100vw">
      <Box flex={2}>
        <img
          src={landingPage}
          alt="login"
          className="w-full h-full object-cover "
        />
      </Box>
      {children}
    </Stack>
  );
};

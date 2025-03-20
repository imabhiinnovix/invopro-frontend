import { Box, Button, CircularProgress } from "@mui/material";
import { ContainedButtonProps } from "./types";
import Text from "../text";

const ContainedButton = (props: ContainedButtonProps) => {
  const { text, disabled, handleClick, loading } = props;
  return (
    <Button
      sx={{ m: 1 }}
      variant="contained"
      type="submit"
      disabled={disabled}
      onClick={handleClick}
      className="p-2"
    >
      {loading ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "56px",
            height: "24px",
          }}
        >
          <CircularProgress size={20} className="text-white" />
        </Box>
      ) : (
        <Text text={text} variant="button" className="text-sm" />
      )}
    </Button>
  );
};

export default ContainedButton;

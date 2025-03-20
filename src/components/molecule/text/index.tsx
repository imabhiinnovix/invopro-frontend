import { Typography, TypographyProps } from "@mui/material";

interface TextProps extends TypographyProps {
  text?: string;
}

const Text = (props: TextProps) => {
  const { text, variant, component = "p", ...rest } = props;

  return (
    <Typography variant={variant} component={component} {...rest}>
      {text}
    </Typography>
  );
};

export default Text;

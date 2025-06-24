import { styled } from '@mui/material/styles';
import { STYLE_GUIDE } from '../../../styles';

type DividerProps = {
  width: string;
  color: string;
  opacity?: number;
};

const StyledDivider = styled('hr')(({ width, color, opacity }: DividerProps) => ({
  margin: `${STYLE_GUIDE.SPACING.s2} auto`,
  border: 0,
  borderTop: `1px solid ${color}`,
  backgroundColor: color,
  opacity: opacity ?? 1,
  width,
}));

const Divider = (props: DividerProps) => {
  return <StyledDivider {...props} />;
};

export default Divider;

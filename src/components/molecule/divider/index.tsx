import React from 'react';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

type DividerProps = {
  width: string;
  color: string;
  opacity?: number;
};

const StyledDivider = styled('hr')(({ width, color, opacity }: DividerProps) => ({
  margin: '8px auto',
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

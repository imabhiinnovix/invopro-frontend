import React, { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

interface CommonProgressBarProps {
  value?: number;
  variant?: 'determinate' | 'indeterminate' | 'buffer' | 'query';
  [key: string]: any; // Allow additional props
}

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 15,
  borderRadius: 5,
  width: '100%',

  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: theme.palette.grey[200],
    ...theme.applyStyles('dark', {
      backgroundColor: theme.palette.grey[800],
    }),
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: '#1a90ff',
    ...theme.applyStyles('dark', {
      backgroundColor: '#308fe8',
    }),
  },
}));

const ProgressBar: React.FC<CommonProgressBarProps> = ({ value = 10, variant = 'determinate', ...rest }) => {
  const [progress, setProgress] = useState(value);
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 90) {
          // Cap at 90%
          return 90;
        }
        const diff = Math.random() * 10;
        return Math.min(oldProgress + diff, 90); // Ensure it doesn't exceed 90%
      });
    }, 500);

    return () => {
      clearInterval(timer);
    };
  }, []);
  return <BorderLinearProgress variant={variant} value={progress} {...rest} />;
};

export default ProgressBar;

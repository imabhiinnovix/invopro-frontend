import React from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { STYLE_GUIDE } from '../../../styles';
import { useUnifiedTheme } from '../../../hooks/useUnifiedTheme';
import { useComponentTypography } from '../../../hooks/useComponentTypography';

// Styled components for metric cards
const MetricCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'backgroundColor',
})<{ backgroundColor: string }>(({ theme, backgroundColor }) => ({
  height: '120px',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
  transition: 'all 0.3s ease-in-out',
  backgroundColor: backgroundColor,
  border: 'none',
  '&:hover': {
    boxShadow: theme.shadows[4],
    transform: 'translateY(-2px)',
  },
}));

const MetricNumberDisplay = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'center',
  gap: '8px',
  height: '100%',
});

const MetricNumberValue = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'textColor',
})<{ textColor: string }>(({ textColor }) => ({
  fontSize: '2.5rem',
  fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold,
  color: textColor,
  lineHeight: STYLE_GUIDE.TYPOGRAPHY.lineHeight.tight,
}));

const MetricNumberLabel = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'textColor',
})<{ textColor: string }>(({ textColor }) => ({
  fontSize: '0.875rem',
  fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
  color: textColor,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}));

interface MetricData {
  value: number;
  label: string;
  backgroundColor: string;
  textColor: string;
}

interface MetricCardsProps {
  metrics: MetricData[];
}

export const MetricCards: React.FC<MetricCardsProps> = ({ metrics }) => {
  const { getCardSx } = useComponentTypography();

  return (
    <Box sx={{ mb: STYLE_GUIDE.SPACING.s6 }}>
      <Grid container spacing={STYLE_GUIDE.SPACING.s4}>
        {metrics?.map((metric, index) => (
          <Grid item xs={12} md={4} key={index}>
            <MetricCard backgroundColor={metric.backgroundColor} sx={{ ...getCardSx() }}>
              <CardContent
                sx={{
                  flexGrow: 1,
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                }}
              >
                <MetricNumberDisplay>
                  <MetricNumberValue textColor={metric.textColor}>{metric.value.toLocaleString()}</MetricNumberValue>
                  <MetricNumberLabel textColor={metric.textColor}>{metric.label}</MetricNumberLabel>
                </MetricNumberDisplay>
              </CardContent>
            </MetricCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

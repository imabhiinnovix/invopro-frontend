import React, { useEffect, useRef } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { Chart as ChartJS, LineController, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend } from 'chart.js';
import { Theme } from '../types';

ChartJS.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

interface ThemePreviewProps {
  theme: Theme;
}

const ThemePreview: React.FC<ThemePreviewProps> = ({ theme }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<ChartJS | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      // Destroy existing chart if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      // Create new chart with theme settings
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        chartInstance.current = new ChartJS(ctx, {
          type: 'line',
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
              {
                label: 'Dataset 1',
                data: [12, 19, 3, 5, 2, 3],
                borderColor: theme.colors[0],
                backgroundColor: theme.backgroundColor[0],
                borderWidth: 2,
                fill: theme.fill.enabled,
                tension: theme.fill.type === 'Smooth' ? 0.4 : 0,
              },
              {
                label: 'Dataset 2',
                data: [7, 11, 5, 8, 3, 7],
                borderColor: theme.colors[1],
                backgroundColor: theme.backgroundColor[1],
                borderWidth: 2,
                fill: theme.fill.enabled,
                tension: theme.fill.type === 'Smooth' ? 0.4 : 0,
              },
            ],
          },
          options: {
            responsive: theme.responsive,
            maintainAspectRatio: theme.maintainAspectRatio,
            plugins: {
              title: {
                display: theme.title.display,
                text: 'Theme Preview',
                color: theme.title.color,
                font: {
                  size: theme.title.font.size,
                  family: theme.title.font.family,
                  weight: theme.title.font.weight as 'bold' | 'normal' | 'lighter' | 'bolder' | undefined,
                },
                align: theme.title.align as 'center' | 'start' | 'end' | undefined,
                position: theme.title.position as 'top' | 'bottom' | 'left' | 'right' | undefined,
              },
              subtitle: {
                display: theme.subtitle.display,
                text: 'Sample Data',
                color: theme.subtitle.color,
                font: {
                  size: theme.subtitle.font.size,
                  family: theme.subtitle.font.family,
                },
                align: theme.subtitle.align as 'center' | 'start' | 'end' | undefined,
                position: theme.subtitle.position as 'top' | 'bottom' | 'left' | 'right' | undefined,
              },
              legend: {
                display: theme.legend.display,
                position: theme.legend.position as 'top' | 'bottom' | 'left' | 'right' | 'chartArea' | undefined,
                labels: {
                  font: {
                    size: theme.legend.labels.font.size,
                    family: theme.legend.labels.font.family,
                  },
                  color: theme.legend.labels.color,
                  usePointStyle: theme.legend.labels.usePointStyle,
                  padding: theme.legend.labels.padding,
                  boxWidth: theme.legend.labels.boxWidth,
                  boxHeight: theme.legend.labels.boxHeight,
                },
                maxHeight: theme.legend.maxHeight,
              },
              tooltip: {
                enabled: theme.tooltip.display,
                backgroundColor: theme.tooltip.backgroundColor,
                titleColor: theme.tooltip.titleColor,
                borderColor: theme.tooltip.borderColor,
                borderWidth: theme.tooltip.borderWidth,
                padding: theme.tooltip.padding,
                usePointStyle: theme.tooltip.usePointStyle,
                displayColors: theme.tooltip.displayColors,
              },
            },
            scales: {
              y: {
                display: theme.scales.y.display,
                beginAtZero: theme.scales.y.beginAtZero,
                grid: {
                  color: theme.scales.y.grid.color,
                  display: theme.scales.y.grid.display,
                },
                ticks: {
                  padding: theme.scales.y.ticks.padding,
                  maxRotation: theme.scales.y.ticks.maxRotation,
                  minRotation: theme.scales.y.ticks.minRotation,
                },
                title: {
                  display: theme.scales.y.title.display,
                  text: 'Y-Axis',
                  color: theme.scales.y.title.color,
                  font: {
                    size: theme.scales.y.title.font.size,
                  },
                },
                offset: theme.scales.y.offset,
              },
              x: {
                display: theme.scales.x.display,
                beginAtZero: theme.scales.x.beginAtZero,
                grid: {
                  display: theme.scales.x.grid.display,
                },
                ticks: {
                  color: theme.scales.x.ticks.color,
                  padding: theme.scales.x.ticks.padding,
                  maxRotation: theme.scales.x.ticks.maxRotation,
                  minRotation: theme.scales.x.ticks.minRotation,
                },
                offset: theme.scales.x.offset,
              },
            },
            interaction: {
              mode: theme.interaction.mode as 'x' | 'y' | 'nearest' | 'index' | 'dataset' | 'point' | undefined,
              intersect: theme.interaction.intersect,
            },
            layout: {
              padding: theme.layout.padding,
            },
          },
        });
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [theme]);

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" gutterBottom>
          {theme.name}
        </Typography>
        <Box sx={{ flexGrow: 1, position: 'relative', height: 300 }}>
          <canvas ref={chartRef} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default ThemePreview; 
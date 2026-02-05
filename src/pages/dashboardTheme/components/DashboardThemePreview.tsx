import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Stack,
  IconButton,
  Tooltip,
  Avatar,
} from '@mui/material';
import {
  EditOutlined,
  DeleteOutlined,
  ContentCopy as DuplicateIcon,
  CheckCircle as ApplyIcon,
  Palette as PaletteIcon,
} from '@mui/icons-material';
import { DashboardTheme } from '../../../types/dashboardTheme';
import { STYLE_GUIDE } from '../../../styles';
import { useComponentTypography } from '../../../hooks/useComponentTypography';

interface DashboardThemePreviewProps {
  theme: DashboardTheme;
  onUpdate: (theme: DashboardTheme) => void;
  onDelete: (themeId: string) => void;
  onDuplicate: (themeId: string) => void;
  onApply: (theme: DashboardTheme) => void;
  isCurrentTheme?: boolean;
}

const DashboardThemePreview: React.FC<DashboardThemePreviewProps> = ({
  theme,
  onUpdate,
  onDelete,
  onDuplicate,
  onApply,
  isCurrentTheme = false,
}) => {
  const { getCardSx } = useComponentTypography();
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (theme._id) {
      onDelete(theme._id);
    }
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (theme._id) {
      onDuplicate(theme._id);
    }
  };

  const handleApply = (e: React.MouseEvent) => {
    e.stopPropagation();
    onApply(theme);
  };

  const handleUpdate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate(theme);
  };

  const handleCardClick = () => {
    if (!isCurrentTheme) {
      onApply(theme);
    }
  };

  return (
    <Card
      onClick={handleCardClick}
      sx={{
        ...getCardSx(),
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        border: isCurrentTheme ? 2 : 1,
        borderColor: isCurrentTheme ? 'success.main' : 'divider',
        cursor: isCurrentTheme ? 'default' : 'pointer',
        backgroundColor: theme.colors.background.card || STYLE_GUIDE.COLORS.backgroundSurface,
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-2px)',
          transition: 'all 0.2s ease-in-out',
        },
      }}
    >


      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: theme.colors.primary.main,
              width: 32,
              height: 32,
            }}
          >
            <PaletteIcon sx={{ fontSize: 18 }} />
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="h3" noWrap>
              {theme.name}
            </Typography>
            {theme.description && (
              <Typography variant="body2" color="text.secondary" noWrap>
                {theme.description}
              </Typography>
            )}
          </Box>
        </Stack>

        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Color Palette
          </Typography>
          <Stack direction="row" spacing={0.5}>
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: 1,
                bgcolor: theme.colors.primary.main,
                border: '1px solid',
                borderColor: 'divider',
              }}
            />
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: 1,
                bgcolor: theme.colors.secondary.main,
                border: '1px solid',
                borderColor: 'divider',
              }}
            />


          </Stack>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Component Styles
          </Typography>
          <Stack spacing={1}>
            <Box
              sx={{
                height: 24,
                borderRadius: STYLE_GUIDE.SPACING.s2,
                bgcolor: theme.colors.primary.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: theme.colors.primary.contrastText,
                  fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
                  fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
                }}
              >
                Button
              </Typography>
            </Box>

            <Box
              sx={{
                height: 16,
                borderRadius: STYLE_GUIDE.SPACING.s2,
                bgcolor: theme.colors.background.paper,
                border: '1px solid',
                borderColor: theme.colors.border,
                boxShadow: STYLE_GUIDE.SHADOWS.sm,
              }}
            />
          </Stack>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Typography
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
              fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
              fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
              color: theme.colors.text.primary,
            }}
          >
            Sample Text
          </Typography>
        </Box>
      </CardContent>

      <CardActions sx={{ pt: 0, pb: 1, px: 2 }}>
        <Stack direction="row" spacing={1} sx={{ width: '100%', justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Edit Theme">
              <IconButton size="small" onClick={handleUpdate}>
                <EditOutlined sx={{ fontSize: "16px" }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Duplicate Theme">
              <IconButton size="small" onClick={handleDuplicate}>
                <DuplicateIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
          
          <Stack direction="row" spacing={0.5}>
            {!isCurrentTheme && (
              <Tooltip title="Apply Theme">
                <IconButton
                  size="small"
                  onClick={handleApply}
                  sx={{ 
                    color: 'success.main',
                  }}
                >
                  <ApplyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title={isCurrentTheme ? "Cannot delete active theme" : "Delete Theme"}>
              <span>
                <IconButton
                  size="small"
                  onClick={handleDelete}
                  disabled={isCurrentTheme}
                  sx={{ 
                    color: isCurrentTheme ? 'text.disabled' : 'error.main',
                    '&:disabled': {
                      cursor: 'not-allowed'
                    }
                  }}
                >
                  <DeleteOutlined fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Stack>
      </CardActions>
    </Card>
  );
};

export default DashboardThemePreview; 
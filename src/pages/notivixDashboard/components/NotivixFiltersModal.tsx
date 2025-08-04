import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
} from '@mui/material';
import { STYLE_GUIDE } from '../../../styles';
import { useUnifiedTheme } from '../../../hooks/useUnifiedTheme';
import { useComponentTypography } from '../../../hooks/useComponentTypography';

interface NotivixFiltersModalProps {
  open: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
  currentFilters?: FilterOptions;
  availableFilters?: Array<{
    attributeId: string;
    label: string;
    type: string;
    isDashboardFilter: boolean;
    attributeType?: string;
    optionAttributeId?: string | null;
  }>;
  isLoading?: boolean;
}

export interface FilterOptions {
  status?: string;
  priority?: string;
  category?: string;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  searchText?: string;
}

const NotivixFiltersModal: React.FC<NotivixFiltersModalProps> = ({
  open,
  onClose,
  onApplyFilters,
  currentFilters = {},
  availableFilters = [],
  isLoading = false,
}) => {
  const theme = useUnifiedTheme();
  const { getButtonSx } = useComponentTypography();
  
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);

  const handleApplyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleClearFilters = () => {
    const clearedFilters: FilterOptions = {};
    setFilters(clearedFilters);
    onApplyFilters(clearedFilters);
  };

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };


  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && 
    (typeof value !== 'object' || Object.values(value).some(v => v !== undefined && v !== ''))
  );


  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: theme.palette.background.paper,
          borderRadius: STYLE_GUIDE.SPACING.s2,
        },
      }}
    >
      <DialogTitle
        sx={{
          borderBottom: `1px solid ${theme.palette.divider}`,
          pb: STYLE_GUIDE.SPACING.s4,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium }}>
          Dashboard Filters
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: STYLE_GUIDE.SPACING.s4 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: STYLE_GUIDE.SPACING.s6 }}>
            <Typography variant="body2" color="text.secondary">
              Loading filters...
            </Typography>
          </Box>
        ) : (
          <Stack spacing={STYLE_GUIDE.SPACING.s4}>

            {/* Dynamic Filters based on available filters */}
            {availableFilters
              .filter((filter) => filter.isDashboardFilter)
              .map((filter) => {
                // Render different filter types based on attributeType
                if (filter.attributeType === 'boolean') {
                  return (
                    <Box key={filter.attributeId}>
                      <Typography variant="subtitle2" sx={{ mb: STYLE_GUIDE.SPACING.s2, color: theme.palette.text.secondary }}>
                        {filter.label}
                      </Typography>
                      <FormControl component="fieldset">
                        <Stack direction="row" spacing={STYLE_GUIDE.SPACING.s4}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                              type="radio"
                              name={filter.attributeId}
                              value="true"
                              checked={filters[filter.attributeId as keyof FilterOptions] === 'true'}
                              onChange={(e) => handleFilterChange(filter.attributeId as keyof FilterOptions, e.target.value)}
                              style={{ accentColor: theme.palette.primary.main }}
                            />
                            <span style={{ color: theme.palette.text.primary }}>True</span>
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                              type="radio"
                              name={filter.attributeId}
                              value="false"
                              checked={filters[filter.attributeId as keyof FilterOptions] === 'false'}
                              onChange={(e) => handleFilterChange(filter.attributeId as keyof FilterOptions, e.target.value)}
                              style={{ accentColor: theme.palette.primary.main }}
                            />
                            <span style={{ color: theme.palette.text.primary }}>False</span>
                          </label>
                        </Stack>
                      </FormControl>
                    </Box>
                  );
                } else if (filter.attributeType === 'multioption') {
                  return (
                    <FormControl key={filter.attributeId} fullWidth size="small">
                      <InputLabel sx={{ color: theme.palette.text.secondary }}>{filter.label}</InputLabel>
                      <Select
                        value={filters[filter.attributeId as keyof FilterOptions] || ''}
                        onChange={(e) => handleFilterChange(filter.attributeId as keyof FilterOptions, e.target.value)}
                        label={filter.label}
                        sx={{
                          backgroundColor: theme.getDropdownBackground(),
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.getInputBorderColor(),
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.border?.hover || STYLE_GUIDE.COLORS.darkBorderHover,
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.input?.focusBorder || STYLE_GUIDE.COLORS.inputFocusFallback,
                          },
                          '& .MuiSelect-icon': {
                            color: theme.palette.text.secondary,
                          },
                        }}
                      >
                        <MenuItem value="">All {filter.label}</MenuItem>
                        <MenuItem value="option1">Option 1</MenuItem>
                        <MenuItem value="option2">Option 2</MenuItem>
                        <MenuItem value="option3">Option 3</MenuItem>
                      </Select>
                    </FormControl>
                  );
                } else {
                  // Default to text input
                  return (
                    <TextField
                      key={filter.attributeId}
                      label={filter.label}
                      placeholder={`Enter ${filter.label.toLowerCase()}...`}
                      value={filters[filter.attributeId as keyof FilterOptions] || ''}
                      onChange={(e) => handleFilterChange(filter.attributeId as keyof FilterOptions, e.target.value)}
                      fullWidth
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: theme.getDropdownBackground(),
                          '& fieldset': {
                            borderColor: theme.getInputBorderColor(),
                          },
                          '&:hover fieldset': {
                            borderColor: theme.border?.hover || STYLE_GUIDE.COLORS.darkBorderHover,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: theme.input?.focusBorder || STYLE_GUIDE.COLORS.inputFocusFallback,
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: theme.palette.text.secondary,
                        },
                        '& .MuiInputBase-input': {
                          color: theme.getInputTextColor(),
                        },
                      }}
                    />
                  );
                }
              })}


            {/* {hasActiveFilters && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: STYLE_GUIDE.SPACING.s2, color: theme.palette.text.secondary }}>
                  Active Filters:
                </Typography>
                <Stack direction="row" spacing={STYLE_GUIDE.SPACING.s1} flexWrap="wrap" useFlexGap>
                  {filters.searchText && (
                    <Chip
                      label={`Search: ${filters.searchText}`}
                      size="small"
                      onDelete={() => handleFilterChange('searchText', '')}
                      sx={{
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                      }}
                    />
                  )}
                  {availableFilters
                    .filter((filter) => filter.isDashboardFilter)
                    .map((filter) => {
                      const filterValue = filters[filter.attributeId as keyof FilterOptions];
                      return filterValue ? (
                        <Chip
                          key={filter.attributeId}
                          label={`${filter.label}: ${filterValue}`}
                          size="small"
                          onDelete={() => handleFilterChange(filter.attributeId as keyof FilterOptions, '')}
                          sx={{
                            backgroundColor: theme.palette.secondary.main,
                            color: theme.palette.secondary.contrastText,
                          }}
                        />
                      ) : null;
                    })}
                  {filters.dateRange?.startDate && filters.dateRange?.endDate && (
                    <Chip
                      label={`Date: ${filters.dateRange.startDate} - ${filters.dateRange.endDate}`}
                      size="small"
                      onDelete={() => handleFilterChange('dateRange', { startDate: '', endDate: '' })}
                      sx={{
                        backgroundColor: theme.palette.success.main,
                        color: theme.palette.success.contrastText,
                      }}
                    />
                  )}
                </Stack>
              </Box>
            )} */}
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ p: STYLE_GUIDE.SPACING.s4, gap: STYLE_GUIDE.SPACING.s2 }}>
        <Button
          onClick={handleClearFilters}
          variant="outlined"
          sx={{
            ...getButtonSx(),
            borderColor: theme.palette.error.main,
            color: theme.palette.error.main,
            '&:hover': {
              borderColor: theme.palette.error.dark,
              backgroundColor: theme.palette.error.light,
            },
          }}
        >
          Clear All
        </Button>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            ...getButtonSx(),
            borderColor: theme.getInputBorderColor(),
            color: theme.palette.text.primary,
            '&:hover': {
              borderColor: theme.border?.hover || STYLE_GUIDE.COLORS.darkBorderHover,
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleApplyFilters}
          variant="contained"
          sx={{
            ...getButtonSx(),
            backgroundColor: STYLE_GUIDE.COLORS.primary,
            color: STYLE_GUIDE.COLORS.white,
            '&:hover': {
              backgroundColor: STYLE_GUIDE.COLORS.primaryDark,
            },
          }}
        >
          Apply Filters
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NotivixFiltersModal; 
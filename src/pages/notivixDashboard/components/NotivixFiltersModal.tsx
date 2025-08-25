import React, { useState, useEffect } from 'react';
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
  Checkbox,
  ListItemText,
  FormControlLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import { STYLE_GUIDE } from '../../../styles';
import { useUnifiedTheme } from '../../../hooks/useUnifiedTheme';
import { useComponentTypography } from '../../../hooks/useComponentTypography';
import useGet from '../../../hooks/useGet';

interface NotivixFiltersModalProps {
  open: boolean;
  onClose: () => void;
  onApplyFilters: (filters: Record<string, any>) => void;
  currentFilters?: Record<string, any>;
  dataSourceId: string;
  filterFlag?: 'isFilterEnable' | 'isDashboardFilter';
  isLoading?: boolean;
}

interface FieldSetting {
  attributeId: string;
  label: string;
  type: string;
  isDashboardFilter: boolean;
  isFilterEnable: boolean;
  optionAttributeId?: string;
}

interface EntityFieldOption {
  label: string;
  value: {
    attributeId: string;
    type: string;
  };
}

interface DataSourceResponse {
  success: boolean;
  data: {
    fieldSettings: FieldSetting[];
    entityFieldOptions: EntityFieldOption[];
  };
}

interface AttributeOptionsResponse {
  success: boolean;
  data: {
    attributeValue: string[];
  };
}

const NotivixFiltersModal: React.FC<NotivixFiltersModalProps> = ({
  open,
  onClose,
  onApplyFilters,
  currentFilters = {},
  dataSourceId,
  filterFlag = 'isFilterEnable',
  isLoading = false,
}) => {
  const theme = useUnifiedTheme();
  const { getButtonSx } = useComponentTypography();
  const [filters, setFilters] = useState<Record<string, any>>(currentFilters);
  const [optionsCache, setOptionsCache] = useState<Record<string, string[]>>({});

  // Fetch data source details
  const dataSourceQuery = useGet<DataSourceResponse>(
    ['dataSourceDetails', dataSourceId],
    `/common/dataSource/dataSourceDetails/${dataSourceId}`,
    !!dataSourceId
  );

  // Get filtered field settings based on the flag
  const filteredFieldSettings =
    dataSourceQuery.data?.data.fieldSettings?.filter((field) => field[filterFlag] === true) || [];

  // Map entity field options by attributeId for easy lookup
  const entityFieldOptionsMap = React.useMemo(() => {
    const map: Record<string, EntityFieldOption> = {};
    dataSourceQuery.data?.data.entityFieldOptions?.forEach((option) => {
      map[option.value.attributeId] = option;
    });
    return map;
  }, [dataSourceQuery.data]);

  // Fetch attribute options for option/multioption fields
  const fetchAttributeOptions = async (optionAttributeId: string) => {
    if (optionsCache[optionAttributeId]) {
      return optionsCache[optionAttributeId];
    }

    try {
      const response = await fetch(`/common/attributeOptions/get/${optionAttributeId}`);
      const data: AttributeOptionsResponse = await response.json();

      if (data.success && data.data.attributeValue) {
        setOptionsCache((prev) => ({
          ...prev,
          [optionAttributeId]: data.data.attributeValue,
        }));
        return data.data.attributeValue;
      }
    } catch (error) {
      console.error('Error fetching attribute options:', error);
    }

    return [];
  };

  // Load options for option/multioption fields
  useEffect(() => {
    filteredFieldSettings.forEach(async (field) => {
      if ((field.type === 'option' || field.type === 'multioption') && field.optionAttributeId) {
        await fetchAttributeOptions(field.optionAttributeId);
      }
    });
  }, [filteredFieldSettings]);

  const handleApplyFilters = () => {
    // Convert filters to use entity field option labels as keys
    const transformedFilters: Record<string, any> = {};

    Object.entries(filters).forEach(([attributeId, value]) => {
      const entityOption = entityFieldOptionsMap[attributeId];
      if (entityOption && value !== undefined && value !== '' && value !== null) {
        transformedFilters[entityOption.label] = value;
      }
    });

    onApplyFilters(transformedFilters);
    onClose();
  };

  const handleClearFilters = () => {
    setFilters({});
    onApplyFilters({});
  };

  const handleFilterChange = (attributeId: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [attributeId]: value,
    }));
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) =>
      value !== undefined &&
      value !== '' &&
      value !== null &&
      (typeof value !== 'object' ||
        (Array.isArray(value) && value.length > 0) ||
        (!Array.isArray(value) && Object.values(value).some((v) => v !== undefined && v !== '' && v !== null)))
  );

  const renderFilterField = (field: FieldSetting) => {
    const options = field.optionAttributeId ? optionsCache[field.optionAttributeId] || [] : [];
    const currentValue = filters[field.attributeId];

    switch (field.type) {
      case 'boolean':
        return (
          <Box key={field.attributeId}>
            <Typography variant="subtitle2" sx={{ mb: STYLE_GUIDE.SPACING.s2, color: theme.palette.text.secondary }}>
              {field.label}
            </Typography>
            <RadioGroup
              value={currentValue || ''}
              onChange={(e) => handleFilterChange(field.attributeId, e.target.value)}
              row
            >
              <FormControlLabel
                value=""
                control={<Radio size="small" />}
                label="All"
                sx={{ color: theme.palette.text.primary }}
              />
              <FormControlLabel
                value="true"
                control={<Radio size="small" />}
                label="True"
                sx={{ color: theme.palette.text.primary }}
              />
              <FormControlLabel
                value="false"
                control={<Radio size="small" />}
                label="False"
                sx={{ color: theme.palette.text.primary }}
              />
            </RadioGroup>
          </Box>
        );

      case 'date':
        return (
          <TextField
            key={field.attributeId}
            label={field.label}
            placeholder={`Enter ${field.label.toLowerCase()}...`}
            type="date"
            value={currentValue || ''}
            onChange={(e) => handleFilterChange(field.attributeId, e.target.value)}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
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

      case 'dateRange':
        return (
          <Stack key={field.attributeId} spacing={STYLE_GUIDE.SPACING.s2}>
            <Typography variant="subtitle2" color="text.secondary">
              {field.label}
            </Typography>
            <Stack direction="row" spacing={STYLE_GUIDE.SPACING.s2}>
              <TextField
                label="Start Date"
                type="date"
                value={currentValue?.startDate || ''}
                onChange={(e) =>
                  handleFilterChange(field.attributeId, {
                    ...currentValue,
                    startDate: e.target.value,
                  })
                }
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: theme.getDropdownBackground(),
                    '& fieldset': {
                      borderColor: theme.getInputBorderColor(),
                    },
                  },
                }}
              />
              <TextField
                label="End Date"
                type="date"
                value={currentValue?.endDate || ''}
                onChange={(e) =>
                  handleFilterChange(field.attributeId, {
                    ...currentValue,
                    endDate: e.target.value,
                  })
                }
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: theme.getDropdownBackground(),
                    '& fieldset': {
                      borderColor: theme.getInputBorderColor(),
                    },
                  },
                }}
              />
            </Stack>
          </Stack>
        );

      case 'option':
        return (
          <FormControl key={field.attributeId} fullWidth size="small">
            <InputLabel sx={{ color: theme.palette.text.secondary }}>{field.label}</InputLabel>
            <Select
              value={currentValue || ''}
              onChange={(e) => handleFilterChange(field.attributeId, e.target.value)}
              label={field.label}
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
              }}
            >
              <MenuItem value="">All {field.label}</MenuItem>
              {options.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'multioption':
        return (
          <FormControl key={field.attributeId} fullWidth size="small">
            <InputLabel sx={{ color: theme.palette.text.secondary }}>{field.label}</InputLabel>
            <Select
              multiple
              value={currentValue || []}
              onChange={(e) => handleFilterChange(field.attributeId, e.target.value)}
              label={field.label}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as string[]).map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
              sx={{
                backgroundColor: theme.getDropdownBackground(),
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.getInputBorderColor(),
                },
              }}
            >
              {options.map((option) => (
                <MenuItem key={option} value={option}>
                  <Checkbox checked={(currentValue || []).includes(option)} size="small" />
                  <ListItemText primary={option} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'number':
        return (
          <TextField
            key={field.attributeId}
            label={field.label}
            placeholder={`Enter ${field.label.toLowerCase()}...`}
            type="number"
            value={currentValue || ''}
            onChange={(e) => handleFilterChange(field.attributeId, e.target.value)}
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
            }}
          />
        );

      default: // text, richtext, url, user, email, text-with-option
        return (
          <TextField
            key={field.attributeId}
            label={field.label}
            placeholder={`Enter ${field.label.toLowerCase()}...`}
            value={currentValue || ''}
            onChange={(e) => handleFilterChange(field.attributeId, e.target.value)}
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
  };

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
        {isLoading || dataSourceQuery.isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: STYLE_GUIDE.SPACING.s6 }}>
            <Typography variant="body2" color="text.secondary">
              Loading filters...
            </Typography>
          </Box>
        ) : filteredFieldSettings.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: STYLE_GUIDE.SPACING.s6 }}>
            <Typography variant="body2" color="text.secondary">
              No filters available
            </Typography>
          </Box>
        ) : (
          <Stack spacing={STYLE_GUIDE.SPACING.s4}>
            {filteredFieldSettings.map((field) => renderFilterField(field))}
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ p: STYLE_GUIDE.SPACING.s4, gap: STYLE_GUIDE.SPACING.s2 }}>
        <Button
          onClick={handleClearFilters}
          variant="outlined"
          disabled={!hasActiveFilters}
          sx={{
            ...getButtonSx(),
            borderColor: theme.palette.error.main,
            color: theme.palette.error.main,
            '&:hover': {
              borderColor: theme.palette.error.dark,
              backgroundColor: theme.palette.error.light,
            },
            '&:disabled': {
              borderColor: theme.palette.action.disabled,
              color: theme.palette.action.disabled,
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

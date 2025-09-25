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
import axiosInstance from '../../../services/axiosInstance';
import { GET } from '../../../services/apiRoutes';
import { useQueryClient } from '@tanstack/react-query';

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
  refAttributeId?: string[];
  label: string;
  type: string;
  isDashboardFilter: boolean;
  isFilterEnable: boolean;
  isDerived?: boolean;
  optionAttributeId?: string;
}

interface EntityFieldOption {
  label: string;
  value: {
    attributeId: string;
    refAttributeId?: string[];
    type: string;
    isDerived?: boolean;
    optionAttributeId: string;
  };
}

interface DataSourceResponse {
  success: boolean;
  message: string;
  data: {
    _id: string;
    code: string;
    name: string;
    description: string;
    entityId: {
      _id: string;
      name: string;
      description: string;
      attributes: EntityAttribute[];
    };
    fieldSettings: FieldSetting[];
    entityFieldOptions: EntityFieldOption[];
    isActive: boolean;
    isShowMenu: boolean;
    isVisible: boolean;
    versionType: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
  };
}

interface EntityAttribute {
  _id: string;
  name: string;
  mappingName: string;
  type: string;
  required: string;
  validation: any[];
  transformations: any[];
  optionAttributeId: string | null;
  cleaner: any[];
  isReferenceEdit: boolean;
  referenceEntitySetting?: {
    refEntityId: string;
    refEntityField: string;
    relationType: string;
  };
}

interface AttributeOptionsResponse {
  success: boolean;
  data: {
    attributeValue: string[];
  };
}

interface DerivedFieldResponse {
  success: boolean;
  message: string;
  data: {
    _id: string;
    name: string;
    type: string;
    valueRules: Array<{
      value: string;
      conditionOperator: string;
      conditions: Array<{
        fieldId: string;
        operator: string;
        matchValues: any[];
      }>;
      _id: string;
    }>;
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
  const [derivedFieldsCache, setDerivedFieldsCache] = useState<Record<string, string[]>>({});
  const queryClient = useQueryClient();

  // Fetch data source details
  const dataSourceQuery = useGet<DataSourceResponse>(
    ['dataSourceDetails', dataSourceId],
    `${GET.GET_VERSION_DATA_BY_ID}${dataSourceId}`,
    !!dataSourceId && open // Only fetch when modal is open and dataSourceId exists
  );

  // console.log('dataSourceQuery',dataSourceQuery);

  // Force refetch when modal opens
  useEffect(() => {
    if (open && dataSourceId) {
      dataSourceQuery.refetch?.();
    }
  }, [open, dataSourceId, dataSourceQuery.refetch]);

  // Prefetch data when dataSourceId is available but modal is closed
  useEffect(() => {
    if (dataSourceId && !open) {
      queryClient.prefetchQuery({
        queryKey: ['dataSourceDetails', dataSourceId],
        queryFn: async () => {
          const response = await axiosInstance.get<DataSourceResponse>(`${GET.GET_VERSION_DATA_BY_ID}${dataSourceId}`);
          return response.data;
        },
        staleTime: 5 * 60 * 1000,
      });
    }
  }, [dataSourceId, open, queryClient]);

  const filteredFieldSettings = React.useMemo(() => {
    // console.log('dataSourceQuery.data.data.fieldSettings',dataSourceQuery?.data?.data?.fieldSettings);
    if (!dataSourceQuery.data?.data?.fieldSettings) return [];
    return dataSourceQuery.data.data.fieldSettings.filter((field) => field[filterFlag] === true);
  }, [dataSourceQuery.data, filterFlag]);

  const entityFieldOptionsMap = React.useMemo(() => {
    const map: Record<string, EntityFieldOption> = {};
    // console.log('dataSourceQuery.data?.data.entityFieldOptions',dataSourceQuery.data?.data.entityFieldOptions);
    dataSourceQuery.data?.data.entityFieldOptions?.forEach((option) => {
      // console.log('option',option);
      // Create unique key by combining attributeId with refAttributeId array
      const refKey = option.value.refAttributeId?.length > 0 ? `-${option.value.refAttributeId.join('-')}` : '';
      const uniqueKey = `${option.label}${option.value.attributeId}${refKey}`;
      map[uniqueKey] = option;
    });
    // console.log('map',map);
    return map;
  }, [dataSourceQuery.data]);

  const entityFieldOptionsMapByAttributeId = React.useMemo(() => {
    const map: Record<string, EntityFieldOption> = {};
    let originalAttributeId: string;
    // console.log('dataSourceQuery.data?.data.entityFieldOptions',dataSourceQuery.data?.data.entityFieldOptions);
    dataSourceQuery.data?.data.entityFieldOptions?.forEach((option) => {
      originalAttributeId = option?.value?.attributeId;
      if(option?.value?.refAttributeId?.length > 0){
        originalAttributeId= option?.value?.refAttributeId[option?.value?.refAttributeId?.length - 1];
      }
      map[originalAttributeId] = option;
    });
    // console.log('map',map);
    return map;
  }, [dataSourceQuery.data]);

  const entityAttributeOptionMap = React.useMemo(() => {
    const attrMap: Record<string, string | null> = {};
    let originalAttributeId: string;
    dataSourceQuery.data?.data?.fieldSettings.forEach((attr) => {
      originalAttributeId = attr?.attributeId;
      if(attr?.refAttributeId?.length > 0){
        originalAttributeId= attr?.refAttributeId[attr?.refAttributeId?.length - 1];
      }
      // console.log('originalAttributeId',originalAttributeId);
      attrMap[originalAttributeId] = entityFieldOptionsMapByAttributeId[originalAttributeId]? entityFieldOptionsMapByAttributeId[originalAttributeId]?.value?.optionAttributeId : null;
    });
    return attrMap;
  }, [dataSourceQuery.data]);

  // Fetch attribute options for option/multioption fields
  const fetchAttributeOptions = async (optionAttributeId: string) => {
    if (optionsCache[optionAttributeId]) {
      return optionsCache[optionAttributeId];
    }
    try {
      const { data } = await axiosInstance.get<AttributeOptionsResponse>(
        `/common/attributeOptions/get/${optionAttributeId}`
      );
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

  // Fetch derived field options
  const fetchDerivedFieldOptions = async (attributeId: string) => {
    if (derivedFieldsCache[attributeId]) {
      return derivedFieldsCache[attributeId];
    }
    try {
      const { data } = await axiosInstance.get<DerivedFieldResponse>(`/common/derivedField/${attributeId}`);
      if (data.success && data.data.valueRules) {
        const options = data.data.valueRules.map((rule) => rule.value);
        setDerivedFieldsCache((prev) => ({
          ...prev,
          [attributeId]: options,
        }));
        return options;
      }
    } catch (error) {
      console.error('Error fetching derived field options:', error);
    }
    return [];
  };

  // Load options for option/multioption fields
  useEffect(() => {
    if (filteredFieldSettings.length > 0) {
      let originalAttributeId:string;
      const fetchOptions = async () => {
        const promises = filteredFieldSettings.map(async (field) => {
          if (field.type === 'option' || field.type === 'multioption' || field.type === 'text-with-option') {
             originalAttributeId = field?.attributeId;
            if(field?.refAttributeId?.length > 0){
              originalAttributeId= field?.refAttributeId[field?.refAttributeId?.length - 1];
            }
            if (field.isDerived) {
              // Fetch derived field options
              await fetchDerivedFieldOptions(originalAttributeId);
            } else if (!!entityAttributeOptionMap[originalAttributeId]) {
              // Fetch regular attribute options
              await fetchAttributeOptions(entityAttributeOptionMap[originalAttributeId]!);
            }
          }
        });
        await Promise.all(promises);
      };
      fetchOptions();
    }
  }, [filteredFieldSettings]);

  const handleApplyFilters = () => {
    // Convert filters to use entity field option labels as keys
    const transformedFilters: Record<string, any> = {};
    // console.log('filters', filters);
    Object.entries(filters).forEach(([filterKey, value]) => {
      // filterKey might be just attributeId or attributeId-refAttributeId1-refAttributeId2
      const entityOption = entityFieldOptionsMap[filterKey];
      //  console.log('entityOption',entityOption);

      if (entityOption && value !== undefined && value !== '' && value !== null) {
        if (entityOption?.value?.isDerived) {
          transformedFilters[`Derived.${entityOption.label}`] = value;
        } else {
          transformedFilters[entityOption.label] = value;
        }
      }
    });
    // console.log('transformedFilters',JSON.stringify(transformedFilters));
    onApplyFilters(transformedFilters);
    onClose();
  };

  const handleClearFilters = () => {
    setFilters({});
    onApplyFilters({});
  };

  const handleFilterChange = (uniqueKey: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [uniqueKey]: value,
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
    // console.log(field, 'fieldKishan');

    // Generate the same unique key used in entityFieldOptionsMap
    const refKey = field.refAttributeId?.length > 0 ? `-${field.refAttributeId.join('-')}` : '';
    

    // Get options based on field type
    let options: string[] = [];
    let originalAttributeId:string = field?.attributeId;
    if (field.type === 'option' || field.type === 'multioption') {
      if(field?.refAttributeId?.length > 0){
        originalAttributeId= field?.refAttributeId[field?.refAttributeId?.length - 1];
      }
      if (field.isDerived) {
        options = derivedFieldsCache[originalAttributeId] || [];
      } else if (entityAttributeOptionMap[originalAttributeId]) {
        options = optionsCache[entityAttributeOptionMap[originalAttributeId]!] || [];
      }
    }

    const uniqueKey = `${entityFieldOptionsMapByAttributeId[originalAttributeId]?.label || ''}${field.attributeId}${refKey}`;
    const currentValue = filters[uniqueKey];

    switch (field.type) {
      case 'boolean':
        return (
          <Box key={uniqueKey}>
            <Typography
              variant="subtitle2"
              sx={{
                mb: STYLE_GUIDE.SPACING.s2,
                color: theme.palette.text.secondary,
              }}
            >
              {field.label}
            </Typography>
            <RadioGroup value={currentValue || ''} onChange={(e) => handleFilterChange(uniqueKey, e.target.value)} row>
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
            key={uniqueKey}
            label={field.label}
            placeholder={`Enter ${field.label.toLowerCase()}...`}
            type="date"
            value={currentValue || ''}
            onChange={(e) => handleFilterChange(uniqueKey, e.target.value)}
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
          <Stack key={uniqueKey} spacing={STYLE_GUIDE.SPACING.s2}>
            <Typography variant="subtitle2" color="text.secondary">
              {field.label}
            </Typography>
            <Stack direction="row" spacing={STYLE_GUIDE.SPACING.s2}>
              <TextField
                label="Start Date"
                type="date"
                value={currentValue?.startDate || ''}
                onChange={(e) =>
                  handleFilterChange(uniqueKey, {
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
                  handleFilterChange(uniqueKey, {
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
          <FormControl key={uniqueKey} fullWidth size="small">
            <InputLabel sx={{ color: theme.palette.text.secondary }}>
              {field.label} {field.isDerived && '(Derived)'}
            </InputLabel>
            <Select
              value={currentValue || ''}
              onChange={(e) => handleFilterChange(uniqueKey, e.target.value)}
              label={`${field.label}${field.isDerived ? ' (Derived)' : ''}`}
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
          <FormControl key={uniqueKey} fullWidth size="small">
            <InputLabel sx={{ color: theme.palette.text.secondary }}>
              {field.label} {field.isDerived && '(Derived)'}
            </InputLabel>
            <Select
              multiple
              value={currentValue || []}
              onChange={(e) => handleFilterChange(uniqueKey, e.target.value)}
              label={`${field.label}${field.isDerived ? ' (Derived)' : ''}`}
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
            key={uniqueKey}
            label={field.label}
            placeholder={`Enter ${field.label.toLowerCase()}...`}
            type="number"
            value={currentValue || ''}
            onChange={(e) => handleFilterChange(uniqueKey, e.target.value)}
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
            key={uniqueKey}
            label={field.label}
            placeholder={`Enter ${field.label.toLowerCase()}...`}
            value={currentValue || ''}
            onChange={(e) => handleFilterChange(uniqueKey, e.target.value)}
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
          Filters
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ pt: STYLE_GUIDE.SPACING.s4 }}>
        {isLoading || dataSourceQuery.isLoading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              py: STYLE_GUIDE.SPACING.s6,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Loading filters...
            </Typography>
          </Box>
        ) : dataSourceQuery.isError ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              py: STYLE_GUIDE.SPACING.s6,
            }}
          >
            <Typography variant="body2" color="error" sx={{ mb: 2 }}>
              Error loading filters: {dataSourceQuery.error?.message || 'Unknown error'}
            </Typography>
            <Button variant="outlined" onClick={() => dataSourceQuery.refetch()}>
              Retry
            </Button>
          </Box>
        ) : filteredFieldSettings.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              py: STYLE_GUIDE.SPACING.s6,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No filters available
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              pt: 1.5,
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: STYLE_GUIDE.SPACING.s4,
              '@media (max-width: 900px)': {
                gridTemplateColumns: 'repeat(2, 1fr)',
              },
              '@media (max-width: 600px)': {
                gridTemplateColumns: '1fr',
              },
            }}
          >
            {filteredFieldSettings.map((field) => renderFilterField(field))}
          </Box>
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

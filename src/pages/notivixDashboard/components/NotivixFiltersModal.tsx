// import React, { useState, useEffect } from 'react';
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   Box,
//   Typography,
//   TextField,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Chip,
//   Stack,
//   Checkbox,
//   ListItemText,
//   FormControlLabel,
//   Radio,
//   RadioGroup,
// } from '@mui/material';
// import { STYLE_GUIDE } from '../../../styles';
// import { useUnifiedTheme } from '../../../hooks/useUnifiedTheme';
// import { useComponentTypography } from '../../../hooks/useComponentTypography';
// import useGet from '../../../hooks/useGet';
// import axiosInstance from '../../../services/axiosInstance';
// import { GET } from '../../../services/apiRoutes';
// import { useQueryClient } from '@tanstack/react-query';
// import DatePicker, { Calendar, DateObject } from 'react-multi-date-picker';

// interface NotivixFiltersModalProps {
//   open: boolean;
//   onClose: () => void;
//   onApplyFilters: (filters: Record<string, any>) => void;
//   currentFilters?: Record<string, any>;
//   dataSourceId: string;
//   filterFlag?: 'isFilterEnable' | 'isDashboardFilter';
//   isLoading?: boolean;
// }

// interface FieldSetting {
//   attributeId: string;
//   refAttributeId?: string[];
//   label: string;
//   type: string;
//   isDashboardFilter: boolean;
//   isFilterEnable: boolean;
//   isDerived?: boolean;
//   optionAttributeId?: string;
// }

// interface EntityFieldOption {
//   label: string;
//   value: {
//     attributeId: string;
//     refAttributeId?: string[];
//     type: string;
//     isDerived?: boolean;
//     optionAttributeId: string;
//   };
// }

// interface DataSourceResponse {
//   success: boolean;
//   message: string;
//   data: {
//     _id: string;
//     code: string;
//     name: string;
//     description: string;
//     entityId: {
//       _id: string;
//       name: string;
//       description: string;
//       attributes: EntityAttribute[];
//     };
//     fieldSettings: FieldSetting[];
//     entityFieldOptions: EntityFieldOption[];
//     isActive: boolean;
//     isShowMenu: boolean;
//     isVisible: boolean;
//     versionType: string;
//     createdAt: string;
//     updatedAt: string;
//     createdBy: string;
//     updatedBy: string;
//   };
// }

// interface EntityAttribute {
//   _id: string;
//   name: string;
//   mappingName: string;
//   type: string;
//   required: string;
//   validation: any[];
//   transformations: any[];
//   optionAttributeId: string | null;
//   cleaner: any[];
//   isReferenceEdit: boolean;
//   referenceEntitySetting?: {
//     refEntityId: string;
//     refEntityField: string;
//     relationType: string;
//   };
// }

// interface AttributeOptionsResponse {
//   success: boolean;
//   data: {
//     attributeValue: string[];
//   };
// }

// interface DerivedFieldResponse {
//   success: boolean;
//   message: string;
//   data: {
//     _id: string;
//     name: string;
//     type: string;
//     valueRules: Array<{
//       value: string;
//       conditionOperator: string;
//       conditions: Array<{
//         fieldId: string;
//         operator: string;
//         matchValues: any[];
//       }>;
//       _id: string;
//     }>;
//   };
// }

// const NotivixFiltersModal: React.FC<NotivixFiltersModalProps> = ({
//   open,
//   onClose,
//   onApplyFilters,
//   currentFilters = {},
//   dataSourceId,
//   filterFlag = 'isFilterEnable',
//   isLoading = false,
// }) => {
//   const theme = useUnifiedTheme();
//   const { getButtonSx } = useComponentTypography();
//   const [filters, setFilters] = useState<Record<string, any>>(currentFilters);
//   const [optionsCache, setOptionsCache] = useState<Record<string, string[]>>({});
//   const [derivedFieldsCache, setDerivedFieldsCache] = useState<Record<string, string[]>>({});

//   // Changed: Store date range values per field using uniqueKey
//   const [dateRangeValues, setDateRangeValues] = useState<Record<string, DateObject[]>>({});
//   const [focusedFields, setFocusedFields] = useState<Record<string, boolean>>({});

//   const queryClient = useQueryClient();

//   // Fetch data source details
//   const dataSourceQuery = useGet<DataSourceResponse>(
//     ['dataSourceDetails', dataSourceId],
//     `${GET.GET_VERSION_DATA_BY_ID}${dataSourceId}`,
//     !!dataSourceId && open // Only fetch when modal is open and dataSourceId exists
//   );

//   // Force refetch when modal opens
//   useEffect(() => {
//     if (open && dataSourceId) {
//       dataSourceQuery.refetch?.();
//     }
//   }, [open, dataSourceId, dataSourceQuery.refetch]);

//   // Prefetch data when dataSourceId is available but modal is closed
//   useEffect(() => {
//     if (dataSourceId && !open) {
//       queryClient.prefetchQuery({
//         queryKey: ['dataSourceDetails', dataSourceId],
//         queryFn: async () => {
//           const response = await axiosInstance.get<DataSourceResponse>(`${GET.GET_VERSION_DATA_BY_ID}${dataSourceId}`);
//           return response.data;
//         },
//         staleTime: 5 * 60 * 1000,
//       });
//     }
//   }, [dataSourceId, open, queryClient]);

//   const filteredFieldSettings = React.useMemo(() => {
//     if (!dataSourceQuery.data?.data?.fieldSettings) return [];
//     return dataSourceQuery.data.data.fieldSettings.filter((field) => field[filterFlag] === true);
//   }, [dataSourceQuery.data, filterFlag]);

//   const entityFieldOptionsMap = React.useMemo(() => {
//     const map: Record<string, EntityFieldOption> = {};
//     dataSourceQuery.data?.data.entityFieldOptions?.forEach((option) => {
//       // Create unique key by combining attributeId with refAttributeId array
//       const refKey = option.value.refAttributeId?.length > 0 ? `-${option.value.refAttributeId.join('-')}` : '';
//       const uniqueKey = `${option.label}${option.value.attributeId}${refKey}`;
//       map[uniqueKey] = option;
//     });
//     return map;
//   }, [dataSourceQuery.data]);

//   const entityFieldOptionsMapByAttributeId = React.useMemo(() => {
//     const map: Record<string, EntityFieldOption> = {};
//     let originalAttributeId: string;
//     dataSourceQuery.data?.data.entityFieldOptions?.forEach((option) => {
//       let isFieldSettingExist = filteredFieldSettings.filter((field) => field['mappedAttributeName'] == option.label);
//       if (isFieldSettingExist.length > 0) {
//         originalAttributeId = option?.value?.attributeId;
//         if (option?.value?.refAttributeId?.length > 0) {
//           originalAttributeId = option?.value?.refAttributeId[option?.value?.refAttributeId?.length - 1];
//         }
//         map[originalAttributeId] = option;
//       }
//     });
//     return map;
//   }, [dataSourceQuery.data]);

//   const entityAttributeOptionMap = React.useMemo(() => {
//     const attrMap: Record<string, string | null> = {};
//     let originalAttributeId: string;
//     dataSourceQuery.data?.data?.fieldSettings.forEach((attr) => {
//       originalAttributeId = attr?.attributeId;
//       if (attr?.refAttributeId?.length > 0) {
//         originalAttributeId = attr?.refAttributeId[attr?.refAttributeId?.length - 1];
//       }
//       attrMap[originalAttributeId] = entityFieldOptionsMapByAttributeId[originalAttributeId]
//         ? entityFieldOptionsMapByAttributeId[originalAttributeId]?.value?.optionAttributeId
//         : null;
//     });
//     return attrMap;
//   }, [dataSourceQuery.data]);

//   // Fetch attribute options for option/multioption fields
//   const fetchAttributeOptions = async (optionAttributeId: string) => {
//     if (optionsCache[optionAttributeId]) {
//       return optionsCache[optionAttributeId];
//     }
//     try {
//       const { data } = await axiosInstance.get<AttributeOptionsResponse>(
//         `/common/attributeOptions/get/${optionAttributeId}`
//       );
//       if (data.success && data.data.attributeValue) {
//         setOptionsCache((prev) => ({
//           ...prev,
//           [optionAttributeId]: data.data.attributeValue,
//         }));
//         return data.data.attributeValue;
//       }
//     } catch (error) {
//       console.error('Error fetching attribute options:', error);
//     }
//     return [];
//   };

//   // Fetch derived field options
//   const fetchDerivedFieldOptions = async (attributeId: string) => {
//     if (derivedFieldsCache[attributeId]) {
//       return derivedFieldsCache[attributeId];
//     }
//     try {
//       const { data } = await axiosInstance.get<DerivedFieldResponse>(`/common/derivedField/${attributeId}`);
//       if (data.success && data.data.valueRules) {
//         const options = data.data.valueRules.map((rule) => rule.value);
//         setDerivedFieldsCache((prev) => ({
//           ...prev,
//           [attributeId]: options,
//         }));
//         return options;
//       }
//     } catch (error) {
//       console.error('Error fetching derived field options:', error);
//     }
//     return [];
//   };

//   // Load options for option/multioption fields
//   useEffect(() => {
//     if (filteredFieldSettings.length > 0) {
//       let originalAttributeId: string;
//       const fetchOptions = async () => {
//         const promises = filteredFieldSettings.map(async (field) => {
//           if (field.type === 'option' || field.type === 'multioption' || field.type === 'text-with-option') {
//             originalAttributeId = field?.attributeId;
//             if (field?.refAttributeId?.length > 0) {
//               originalAttributeId = field?.refAttributeId[field?.refAttributeId?.length - 1];
//             }
//             if (field.isDerived) {
//               // Fetch derived field options
//               await fetchDerivedFieldOptions(originalAttributeId);
//             } else if (!!entityAttributeOptionMap[originalAttributeId]) {
//               // Fetch regular attribute options
//               await fetchAttributeOptions(entityAttributeOptionMap[originalAttributeId]!);
//             }
//           }
//         });
//         await Promise.all(promises);
//       };
//       fetchOptions();
//     }
//   }, [filteredFieldSettings]);

//   const handleApplyFilters = () => {
//     const transformedFilters: Record<string, any> = {};

//     Object.entries(filters).forEach(([filterKey, value]) => {
//       const entityOption = entityFieldOptionsMap[filterKey];

//       // Skip undefined, null, empty string, and empty array
//       const isEmptyValue =
//         value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);

//       if (entityOption && !isEmptyValue) {
//         if (entityOption?.value?.isDerived) {
//           transformedFilters[`Derived.${entityOption.label}`] = value;
//         } else {
//           transformedFilters[entityOption.label] = value;
//         }
//       }
//     });

//     onApplyFilters(transformedFilters);
//     onClose();
//   };

//   const handleClearFilters = () => {
//     setFilters({});
//     setDateRangeValues({}); // Changed: Clear all date range values
//     setFocusedFields({}); // Changed: Clear all focused fields
//     onApplyFilters({});
//   };

//   const handleFilterChange = (uniqueKey: string, value: any) => {
//     setFilters((prev) => ({
//       ...prev,
//       [uniqueKey]: value,
//     }));
//   };

//   // Changed: Helper functions for date range management
//   const handleDateRangeChange = (uniqueKey: string, dateRange: DateObject[]) => {
//     setDateRangeValues((prev) => ({
//       ...prev,
//       [uniqueKey]: dateRange,
//     }));

//     handleFilterChange(uniqueKey, {
//       startDate: dateRange?.[0]?.format?.('YYYY-MM-DD') || '',
//       endDate: dateRange?.[1]?.format?.('YYYY-MM-DD') || '',
//     });
//   };

//   const handleDateRangeFocus = (uniqueKey: string, focused: boolean) => {
//     setFocusedFields((prev) => ({
//       ...prev,
//       [uniqueKey]: focused,
//     }));
//   };

//   const hasActiveFilters = Object.values(filters).some(
//     (value) =>
//       value !== undefined &&
//       value !== '' &&
//       value !== null &&
//       (typeof value !== 'object' ||
//         (Array.isArray(value) && value.length > 0) ||
//         (!Array.isArray(value) && Object.values(value).some((v) => v !== undefined && v !== '' && v !== null)))
//   );

//   const renderFilterField = (field: FieldSetting) => {
//     // Generate the same unique key used in entityFieldOptionsMap
//     const refKey = field.refAttributeId?.length > 0 ? `-${field.refAttributeId.join('-')}` : '';
//     // Get options based on field type
//     let options: string[] = [];
//     let originalAttributeId: string = field?.attributeId;
//     if (field?.refAttributeId?.length > 0) {
//       originalAttributeId = field?.refAttributeId[field?.refAttributeId?.length - 1];
//     }
//     if (field.type === 'option' || field.type === 'multioption' || field.type === 'text-with-option') {
//       if (field.isDerived) {
//         options = derivedFieldsCache[originalAttributeId] || [];
//       } else if (entityAttributeOptionMap[originalAttributeId]) {
//         options = optionsCache[entityAttributeOptionMap[originalAttributeId]!] || [];
//       }
//     }
//     const uniqueKey = `${entityFieldOptionsMapByAttributeId[originalAttributeId]?.label || ''}${
//       field.attributeId
//     }${refKey}`;
//     const currentValue = filters[uniqueKey];

//     switch (field.type) {
//       case 'boolean':
//         return (
//           <Box key={uniqueKey}>
//             <Typography
//               variant="subtitle2"
//               sx={{
//                 mb: STYLE_GUIDE.SPACING.s2,
//                 color: theme.palette.text.secondary,
//               }}
//             >
//               {field.label}
//             </Typography>
//             <RadioGroup value={currentValue || ''} onChange={(e) => handleFilterChange(uniqueKey, e.target.value)} row>
//               <FormControlLabel
//                 value=""
//                 control={<Radio size="small" />}
//                 label="All"
//                 sx={{ color: theme.palette.text.primary }}
//               />
//               <FormControlLabel
//                 value="true"
//                 control={<Radio size="small" />}
//                 label="True"
//                 sx={{ color: theme.palette.text.primary }}
//               />
//               <FormControlLabel
//                 value="false"
//                 control={<Radio size="small" />}
//                 label="False"
//                 sx={{ color: theme.palette.text.primary }}
//               />
//             </RadioGroup>
//           </Box>
//         );
//       case 'date':
//         return (
//           <TextField
//             key={uniqueKey}
//             label={field.label}
//             placeholder={`Enter ${field.label.toLowerCase()}...`}
//             type="date"
//             value={currentValue || ''}
//             onChange={(e) => handleFilterChange(uniqueKey, e.target.value)}
//             fullWidth
//             size="small"
//             InputLabelProps={{ shrink: true }}
//             sx={{
//               '& .MuiOutlinedInput-root': {
//                 backgroundColor: theme.getDropdownBackground(),
//                 '& fieldset': {
//                   borderColor: theme.getInputBorderColor(),
//                 },
//                 '&:hover fieldset': {
//                   borderColor: theme.border?.hover || STYLE_GUIDE.COLORS.darkBorderHover,
//                 },
//                 '&.Mui-focused fieldset': {
//                   borderColor: theme.input?.focusBorder || STYLE_GUIDE.COLORS.inputFocusFallback,
//                 },
//               },
//               '& .MuiInputLabel-root': {
//                 color: theme.palette.text.secondary,
//               },
//               '& .MuiInputBase-input': {
//                 color: theme.getInputTextColor(),
//               },
//             }}
//           />
//         );

//       case 'date-range':
//         // Changed: Use field-specific state for date range
//         const fieldDateRangeValue = dateRangeValues[uniqueKey] || [];
//         const isFieldFocused = focusedFields[uniqueKey] || false;

//         return (
//           <Box key={uniqueKey}>
//             <DatePicker
//               onOpen={() => handleDateRangeFocus(uniqueKey, true)}
//               onClose={() => handleDateRangeFocus(uniqueKey, false)}
//               calendarPosition="top"
//               value={fieldDateRangeValue}
//               onChange={(dateRange) => handleDateRangeChange(uniqueKey, dateRange)}
//               range
//               placeholder={`${field.label}`}
//               numberOfMonths={2}
//               showOtherDays
//               inputClass="w-full"
//               style={{
//                 width: '100%',
//                 padding: '10px 14px',
//                 fontSize: '16px',
//                 borderRadius: 4,
//                 background: theme.getDropdownBackground(),
//                 border: `1px solid ${
//                   isFieldFocused ? theme.input?.focusBorder || 'blue' : theme.getInputBorderColor()
//                 }`,
//                 color: theme.getInputTextColor(),
//                 outline: 'none',
//               }}
//             />
//           </Box>
//         );
//       case 'option':
//         return (
//           <FormControl key={uniqueKey} fullWidth size="small">
//             <InputLabel sx={{ color: theme.palette.text.secondary }}>
//               {field.label} {field.isDerived && '(Derived)'}
//             </InputLabel>
//             <Select
//               value={currentValue || ''}
//               onChange={(e) => handleFilterChange(uniqueKey, e.target.value)}
//               label={`${field.label}${field.isDerived ? ' (Derived)' : ''}`}
//               sx={{
//                 backgroundColor: theme.getDropdownBackground(),
//                 '& .MuiOutlinedInput-notchedOutline': {
//                   borderColor: theme.getInputBorderColor(),
//                 },
//                 '&:hover .MuiOutlinedInput-notchedOutline': {
//                   borderColor: theme.border?.hover || STYLE_GUIDE.COLORS.darkBorderHover,
//                 },
//                 '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
//                   borderColor: theme.input?.focusBorder || STYLE_GUIDE.COLORS.inputFocusFallback,
//                 },
//               }}
//             >
//               <MenuItem value="">All {field.label}</MenuItem>
//               {options.map((option) => (
//                 <MenuItem key={option} value={option}>
//                   {option}
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>
//         );
//       case 'multioption':
//       case 'text-with-option':
//         return (
//           <FormControl key={uniqueKey} fullWidth size="small">
//             <InputLabel sx={{ color: theme.palette.text.secondary }}>
//               {field.label} {field.isDerived && '(Derived)'}
//             </InputLabel>
//             <Select
//               multiple
//               value={currentValue || []}
//               onChange={(e) => handleFilterChange(uniqueKey, e.target.value)}
//               label={`${field.label}${field.isDerived ? ' (Derived)' : ''}`}
//               renderValue={(selected) => (
//                 <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
//                   {(selected as string[]).map((value) => (
//                     <Chip key={value} label={value} size="small" />
//                   ))}
//                 </Box>
//               )}
//               sx={{
//                 backgroundColor: theme.getDropdownBackground(),
//                 '& .MuiOutlinedInput-notchedOutline': {
//                   borderColor: theme.getInputBorderColor(),
//                 },
//               }}
//             >
//               {options.map((option) => (
//                 <MenuItem key={option} value={option}>
//                   <Checkbox checked={(currentValue || []).includes(option)} size="small" />
//                   <ListItemText primary={option} />
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>
//         );
//       case 'number':
//         return (
//           <TextField
//             key={uniqueKey}
//             label={field.label}
//             placeholder={`Enter ${field.label.toLowerCase()}...`}
//             type="number"
//             value={currentValue || ''}
//             onChange={(e) => handleFilterChange(uniqueKey, e.target.value)}
//             fullWidth
//             size="small"
//             sx={{
//               '& .MuiOutlinedInput-root': {
//                 backgroundColor: theme.getDropdownBackground(),
//                 '& fieldset': {
//                   borderColor: theme.getInputBorderColor(),
//                 },
//                 '&:hover fieldset': {
//                   borderColor: theme.border?.hover || STYLE_GUIDE.COLORS.darkBorderHover,
//                 },
//                 '&.Mui-focused fieldset': {
//                   borderColor: theme.input?.focusBorder || STYLE_GUIDE.COLORS.inputFocusFallback,
//                 },
//               },
//             }}
//           />
//         );
//       default: // text, richtext, url, user, email, text-with-option
//         return (
//           <TextField
//             key={uniqueKey}
//             label={field.label}
//             placeholder={`Enter ${field.label.toLowerCase()}...`}
//             value={currentValue || ''}
//             onChange={(e) => handleFilterChange(uniqueKey, e.target.value)}
//             fullWidth
//             size="small"
//             sx={{
//               '& .MuiOutlinedInput-root': {
//                 backgroundColor: theme.getDropdownBackground(),
//                 '& fieldset': {
//                   borderColor: theme.getInputBorderColor(),
//                 },
//                 '&:hover fieldset': {
//                   borderColor: theme.border?.hover || STYLE_GUIDE.COLORS.darkBorderHover,
//                 },
//                 '&.Mui-focused fieldset': {
//                   borderColor: theme.input?.focusBorder || STYLE_GUIDE.COLORS.inputFocusFallback,
//                 },
//               },
//               '& .MuiInputLabel-root': {
//                 color: theme.palette.text.secondary,
//               },
//               '& .MuiInputBase-input': {
//                 color: theme.getInputTextColor(),
//               },
//             }}
//           />
//         );
//     }
//   };

//   return (
//     <Dialog
//       open={open}
//       onClose={onClose}
//       maxWidth="md"
//       fullWidth
//       PaperProps={{
//         sx: {
//           backgroundColor: theme.palette.background.paper,
//           borderRadius: STYLE_GUIDE.SPACING.s2,
//           overflow: 'visible',
//         },
//       }}
//     >
//       <DialogTitle
//         sx={{
//           borderBottom: `1px solid ${theme.palette.divider}`,
//           pb: STYLE_GUIDE.SPACING.s4,
//         }}
//       >
//         <Typography variant="h6" sx={{ fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium }}>
//           Filters
//         </Typography>
//       </DialogTitle>
//       <DialogContent
//         sx={{
//           fontSize: '14px', // normal body font
//           '& .rmdp-input': {
//             fontSize: '14px',
//             lineHeight: '20px',
//           },
//         }}
//       >
//         {isLoading || dataSourceQuery.isLoading ? (
//           <Box
//             sx={{
//               display: 'flex',
//               justifyContent: 'center',
//               py: STYLE_GUIDE.SPACING.s6,
//             }}
//           >
//             <Typography variant="body2" color="text.secondary">
//               Loading filters...
//             </Typography>
//           </Box>
//         ) : dataSourceQuery.isError ? (
//           <Box
//             sx={{
//               display: 'flex',
//               flexDirection: 'column',
//               alignItems: 'center',
//               py: STYLE_GUIDE.SPACING.s6,
//             }}
//           >
//             <Typography variant="body2" color="error" sx={{ mb: 2 }}>
//               Error loading filters: {dataSourceQuery.error?.message || 'Unknown error'}
//             </Typography>
//             <Button variant="outlined" onClick={() => dataSourceQuery.refetch()}>
//               Retry
//             </Button>
//           </Box>
//         ) : filteredFieldSettings.length === 0 ? (
//           <Box
//             sx={{
//               display: 'flex',
//               justifyContent: 'center',
//               py: STYLE_GUIDE.SPACING.s6,
//             }}
//           >
//             <Typography variant="body2" color="text.secondary">
//               No filters available
//             </Typography>
//           </Box>
//         ) : (
//           <Box
//             sx={{
//               display: 'grid',
//               pt: 1.5,
//               gridTemplateColumns: 'repeat(3, 1fr)',
//               gap: STYLE_GUIDE.SPACING.s4,
//               '@media (max-width: 900px)': {
//                 gridTemplateColumns: 'repeat(2, 1fr)',
//               },
//               '@media (max-width: 600px)': {
//                 gridTemplateColumns: '1fr',
//               },
//             }}
//           >
//             {filteredFieldSettings.map((field) => renderFilterField(field))}
//           </Box>
//         )}
//       </DialogContent>
//       <DialogActions sx={{ p: STYLE_GUIDE.SPACING.s4, gap: STYLE_GUIDE.SPACING.s2 }}>
//         <Button
//           onClick={handleClearFilters}
//           variant="outlined"
//           disabled={!hasActiveFilters}
//           sx={{
//             ...getButtonSx(),
//             borderColor: theme.palette.error.main,
//             color: theme.palette.error.main,
//             '&:hover': {
//               borderColor: theme.palette.error.dark,
//               backgroundColor: theme.palette.error.light,
//             },
//             '&:disabled': {
//               borderColor: theme.palette.action.disabled,
//               color: theme.palette.action.disabled,
//             },
//           }}
//         >
//           Clear All
//         </Button>
//         <Button
//           onClick={onClose}
//           variant="outlined"
//           sx={{
//             ...getButtonSx(),
//             borderColor: theme.getInputBorderColor(),
//             color: theme.palette.text.primary,
//             '&:hover': {
//               borderColor: theme.border?.hover || STYLE_GUIDE.COLORS.darkBorderHover,
//             },
//           }}
//         >
//           Cancel
//         </Button>
//         <Button
//           onClick={handleApplyFilters}
//           variant="contained"
//           sx={{
//             ...getButtonSx(),
//             backgroundColor: STYLE_GUIDE.COLORS.primary,
//             color: STYLE_GUIDE.COLORS.white,
//             '&:hover': {
//               backgroundColor: STYLE_GUIDE.COLORS.primaryDark,
//             },
//           }}
//         >
//           Apply Filters
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default NotivixFiltersModal;

// import React, { useState, useEffect } from 'react';
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   Box,
//   Typography,
//   TextField,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Chip,
//   Stack,
//   Checkbox,
//   ListItemText,
//   FormControlLabel,
//   Radio,
//   RadioGroup,
// } from '@mui/material';
// import { STYLE_GUIDE } from '../../../styles';
// import { useUnifiedTheme } from '../../../hooks/useUnifiedTheme';
// import { useComponentTypography } from '../../../hooks/useComponentTypography';
// import useGet from '../../../hooks/useGet';
// import axiosInstance from '../../../services/axiosInstance';
// import { GET } from '../../../services/apiRoutes';
// import { useQueryClient } from '@tanstack/react-query';
// import DatePicker, { Calendar, DateObject } from 'react-multi-date-picker';

// interface NotivixFiltersModalProps {
//   open: boolean;
//   onClose: () => void;
//   onApplyFilters: (filters: Record<string, any>) => void;
//   currentFilters?: Record<string, any>;
//   dataSourceId: string;
//   filterFlag?: 'isFilterEnable' | 'isDashboardFilter';
//   isLoading?: boolean;
// }

// interface FieldSetting {
//   attributeId: string;
//   refAttributeId?: string[];
//   label: string;
//   type: string;
//   isDashboardFilter: boolean;
//   isFilterEnable: boolean;
//   isDerived?: boolean;
//   optionAttributeId?: string;
// }

// interface EntityFieldOption {
//   label: string;
//   value: {
//     attributeId: string;
//     refAttributeId?: string[];
//     type: string;
//     isDerived?: boolean;
//     optionAttributeId: string;
//   };
// }

// interface DataSourceResponse {
//   success: boolean;
//   message: string;
//   data: {
//     _id: string;
//     code: string;
//     name: string;
//     description: string;
//     entityId: {
//       _id: string;
//       name: string;
//       description: string;
//       attributes: EntityAttribute[];
//     };
//     fieldSettings: FieldSetting[];
//     entityFieldOptions: EntityFieldOption[];
//     isActive: boolean;
//     isShowMenu: boolean;
//     isVisible: boolean;
//     versionType: string;
//     createdAt: string;
//     updatedAt: string;
//     createdBy: string;
//     updatedBy: string;
//   };
// }

// interface EntityAttribute {
//   _id: string;
//   name: string;
//   mappingName: string;
//   type: string;
//   required: string;
//   validation: any[];
//   transformations: any[];
//   optionAttributeId: string | null;
//   cleaner: any[];
//   isReferenceEdit: boolean;
//   referenceEntitySetting?: {
//     refEntityId: string;
//     refEntityField: string;
//     relationType: string;
//   };
// }

// interface AttributeOptionsResponse {
//   success: boolean;
//   data: {
//     attributeValue: string[];
//   };
// }

// interface DerivedFieldResponse {
//   success: boolean;
//   message: string;
//   data: {
//     _id: string;
//     name: string;
//     type: string;
//     valueRules: Array<{
//       value: string;
//       conditionOperator: string;
//       conditions: Array<{
//         fieldId: string;
//         operator: string;
//         matchValues: any[];
//       }>;
//       _id: string;
//     }>;
//   };
// }

// const NotivixFiltersModal: React.FC<NotivixFiltersModalProps> = ({
//   open,
//   onClose,
//   onApplyFilters,
//   currentFilters = {},
//   dataSourceId,
//   filterFlag = 'isFilterEnable',
//   isLoading = false,
// }) => {
//   const theme = useUnifiedTheme();
//   const { getButtonSx } = useComponentTypography();
//   const [filters, setFilters] = useState<Record<string, any>>(currentFilters);
//   const [optionsCache, setOptionsCache] = useState<Record<string, string[]>>({});
//   const [derivedFieldsCache, setDerivedFieldsCache] = useState<Record<string, string[]>>({});

//   // Changed: Store date range values per field using uniqueKey
//   const [dateRangeValues, setDateRangeValues] = useState<Record<string, DateObject[]>>({});
//   const [focusedFields, setFocusedFields] = useState<Record<string, boolean>>({});

//   const queryClient = useQueryClient();

//   // Fetch data source details
//   const dataSourceQuery = useGet<DataSourceResponse>(
//     ['dataSourceDetails', dataSourceId],
//     `${GET.GET_VERSION_DATA_BY_ID}${dataSourceId}`,
//     !!dataSourceId && open // Only fetch when modal is open and dataSourceId exists
//   );

//   // Force refetch when modal opens
//   useEffect(() => {
//     if (open && dataSourceId) {
//       dataSourceQuery.refetch?.();
//     }
//   }, [open, dataSourceId, dataSourceQuery.refetch]);

//   // Prefetch data when dataSourceId is available but modal is closed
//   useEffect(() => {
//     if (dataSourceId && !open) {
//       queryClient.prefetchQuery({
//         queryKey: ['dataSourceDetails', dataSourceId],
//         queryFn: async () => {
//           const response = await axiosInstance.get<DataSourceResponse>(`${GET.GET_VERSION_DATA_BY_ID}${dataSourceId}`);
//           return response.data;
//         },
//         staleTime: 5 * 60 * 1000,
//       });
//     }
//   }, [dataSourceId, open, queryClient]);

//   const filteredFieldSettings = React.useMemo(() => {
//     if (!dataSourceQuery.data?.data?.fieldSettings) return [];
//     return dataSourceQuery.data.data.fieldSettings.filter((field) => field[filterFlag] === true);
//   }, [dataSourceQuery.data, filterFlag]);

//   const entityFieldOptionsMap = React.useMemo(() => {
//     const map: Record<string, EntityFieldOption> = {};
//     dataSourceQuery.data?.data.entityFieldOptions?.forEach((option) => {
//       // Create unique key by combining attributeId with refAttributeId array
//       const refKey = option.value.refAttributeId?.length > 0 ? `-${option.value.refAttributeId.join('-')}` : '';
//       const uniqueKey = `${option.label}${option.value.attributeId}${refKey}`;
//       map[uniqueKey] = option;
//     });
//     return map;
//   }, [dataSourceQuery.data]);

//   const entityFieldOptionsMapByAttributeId = React.useMemo(() => {
//     const map: Record<string, EntityFieldOption> = {};
//     let originalAttributeId: string;
//     dataSourceQuery.data?.data.entityFieldOptions?.forEach((option) => {
//       let isFieldSettingExist = filteredFieldSettings.filter((field) => field['mappedAttributeName'] == option.label);
//       if (isFieldSettingExist.length > 0) {
//         originalAttributeId = option?.value?.attributeId;
//         if (option?.value?.refAttributeId?.length > 0) {
//           originalAttributeId = option?.value?.refAttributeId[option?.value?.refAttributeId?.length - 1];
//         }
//         map[originalAttributeId] = option;
//       }
//     });
//     return map;
//   }, [dataSourceQuery.data]);

//   const entityAttributeOptionMap = React.useMemo(() => {
//     const attrMap: Record<string, string | null> = {};
//     let originalAttributeId: string;
//     dataSourceQuery.data?.data?.fieldSettings.forEach((attr) => {
//       originalAttributeId = attr?.attributeId;
//       if (attr?.refAttributeId?.length > 0) {
//         originalAttributeId = attr?.refAttributeId[attr?.refAttributeId?.length - 1];
//       }
//       attrMap[originalAttributeId] = entityFieldOptionsMapByAttributeId[originalAttributeId]
//         ? entityFieldOptionsMapByAttributeId[originalAttributeId]?.value?.optionAttributeId
//         : null;
//     });
//     return attrMap;
//   }, [dataSourceQuery.data]);

//   // Fetch attribute options for option/multioption fields
//   const fetchAttributeOptions = async (optionAttributeId: string) => {
//     if (optionsCache[optionAttributeId]) {
//       return optionsCache[optionAttributeId];
//     }
//     try {
//       const { data } = await axiosInstance.get<AttributeOptionsResponse>(
//         `/common/attributeOptions/get/${optionAttributeId}`
//       );
//       if (data.success && data.data.attributeValue) {
//         setOptionsCache((prev) => ({
//           ...prev,
//           [optionAttributeId]: data.data.attributeValue,
//         }));
//         return data.data.attributeValue;
//       }
//     } catch (error) {
//       console.error('Error fetching attribute options:', error);
//     }
//     return [];
//   };

//   // Fetch derived field options
//   const fetchDerivedFieldOptions = async (attributeId: string) => {
//     if (derivedFieldsCache[attributeId]) {
//       return derivedFieldsCache[attributeId];
//     }
//     try {
//       const { data } = await axiosInstance.get<DerivedFieldResponse>(`/common/derivedField/${attributeId}`);
//       if (data.success && data.data.valueRules) {
//         const options = data.data.valueRules.map((rule) => rule.value);
//         setDerivedFieldsCache((prev) => ({
//           ...prev,
//           [attributeId]: options,
//         }));
//         return options;
//       }
//     } catch (error) {
//       console.error('Error fetching derived field options:', error);
//     }
//     return [];
//   };

//   // Load options for option/multioption fields
//   useEffect(() => {
//     if (filteredFieldSettings.length > 0) {
//       let originalAttributeId: string;
//       const fetchOptions = async () => {
//         const promises = filteredFieldSettings.map(async (field) => {
//           if (field.type === 'option' || field.type === 'multioption' || field.type === 'text-with-option') {
//             originalAttributeId = field?.attributeId;
//             if (field?.refAttributeId?.length > 0) {
//               originalAttributeId = field?.refAttributeId[field?.refAttributeId?.length - 1];
//             }
//             if (field.isDerived) {
//               // Fetch derived field options
//               await fetchDerivedFieldOptions(originalAttributeId);
//             } else if (!!entityAttributeOptionMap[originalAttributeId]) {
//               // Fetch regular attribute options
//               await fetchAttributeOptions(entityAttributeOptionMap[originalAttributeId]!);
//             }
//           }
//         });
//         await Promise.all(promises);
//       };
//       fetchOptions();
//     }
//   }, [filteredFieldSettings]);

//   const handleApplyFilters = () => {
//     const transformedFilters: Record<string, any> = {};

//     Object.entries(filters).forEach(([filterKey, value]) => {
//       const entityOption = entityFieldOptionsMap[filterKey];

//       // Skip undefined, null, empty string, and empty array
//       const isEmptyValue =
//         value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);

//       if (entityOption && !isEmptyValue) {
//         if (entityOption?.value?.isDerived) {
//           transformedFilters[`Derived.${entityOption.label}`] = value;
//         } else {
//           transformedFilters[entityOption.label] = value;
//         }
//       }
//     });

//     onApplyFilters(transformedFilters);
//     onClose();
//   };

//   const handleClearFilters = () => {
//     setFilters({});
//     setDateRangeValues({}); // Changed: Clear all date range values
//     setFocusedFields({}); // Changed: Clear all focused fields
//     onApplyFilters({});
//   };

//   const handleFilterChange = (uniqueKey: string, value: any) => {
//     setFilters((prev) => ({
//       ...prev,
//       [uniqueKey]: value,
//     }));
//   };

//   // Changed: Helper functions for date range management
//   const handleDateRangeChange = (uniqueKey: string, dateRange: DateObject[]) => {
//     setDateRangeValues((prev) => ({
//       ...prev,
//       [uniqueKey]: dateRange,
//     }));

//     handleFilterChange(uniqueKey, {
//       startDate: dateRange?.[0]?.format?.('YYYY-MM-DD') || '',
//       endDate: dateRange?.[1]?.format?.('YYYY-MM-DD') || '',
//     });
//   };

//   const handleDateRangeFocus = (uniqueKey: string, focused: boolean) => {
//     setFocusedFields((prev) => ({
//       ...prev,
//       [uniqueKey]: focused,
//     }));
//   };

//   const hasActiveFilters = Object.values(filters).some(
//     (value) =>
//       value !== undefined &&
//       value !== '' &&
//       value !== null &&
//       (typeof value !== 'object' ||
//         (Array.isArray(value) && value.length > 0) ||
//         (!Array.isArray(value) && Object.values(value).some((v) => v !== undefined && v !== '' && v !== null)))
//   );
//   useEffect(() => {
//     if (Object.keys(entityFieldOptionsMap).length > 0) {
//       const reverseTransformedFilters: Record<string, any> = {};
//       const newDateRangeValues: Record<string, DateObject[]> = {};

//       if (currentFilters && Object.keys(currentFilters).length > 0) {
//         Object.entries(currentFilters).forEach(([filterLabel, value]) => {
//           // Handle derived fields
//           if (filterLabel.startsWith('Derived.')) {
//             const actualLabel = filterLabel.replace('Derived.', '');

//             // Find the corresponding uniqueKey in entityFieldOptionsMap
//             Object.entries(entityFieldOptionsMap).forEach(([uniqueKey, entityOption]) => {
//               if (entityOption.label === actualLabel && entityOption.value.isDerived) {
//                 reverseTransformedFilters[uniqueKey] = value;
//               }
//             });
//           } else {
//             // Handle regular fields
//             Object.entries(entityFieldOptionsMap).forEach(([uniqueKey, entityOption]) => {
//               if (entityOption.label === filterLabel && !entityOption.value.isDerived) {
//                 reverseTransformedFilters[uniqueKey] = value;
//               }
//             });
//           }
//         });

//         // Handle date-range fields specifically
//         Object.entries(reverseTransformedFilters).forEach(([uniqueKey, value]) => {
//           // Find the field setting for this uniqueKey
//           const fieldSetting = filteredFieldSettings.find((field) => {
//             const refKey = field.refAttributeId?.length > 0 ? `-${field?.refAttributeId.join('-')}` : '';
//             let originalAttributeId = field.attributeId;
//             if (field?.refAttributeId?.length > 0) {
//               originalAttributeId = field?.refAttributeId[field?.refAttributeId?.length - 1];
//             }
//             const fieldUniqueKey = `${entityFieldOptionsMapByAttributeId[originalAttributeId]?.label || ''}${
//               field.attributeId
//             }${refKey}`;
//             return fieldUniqueKey === uniqueKey;
//           });

//           if (
//             fieldSetting?.type === 'date-range' &&
//             value &&
//             typeof value === 'object' &&
//             value.startDate &&
//             value.endDate
//           ) {
//             // Convert the date range back to DateObject array
//             const startDate = new DateObject(value.startDate);
//             const endDate = new DateObject(value.endDate);
//             newDateRangeValues[uniqueKey] = [startDate, endDate];
//           }
//         });
//       }

//       setFilters(reverseTransformedFilters);
//       setDateRangeValues(newDateRangeValues);
//     }
//   }, [currentFilters, entityFieldOptionsMap, filteredFieldSettings, entityFieldOptionsMapByAttributeId]);
//   const renderFilterField = (field: FieldSetting) => {
//     // Generate the same unique key used in entityFieldOptionsMap
//     const refKey = field.refAttributeId?.length > 0 ? `-${field.refAttributeId.join('-')}` : '';
//     // Get options based on field type
//     let options: string[] = [];
//     let originalAttributeId: string = field?.attributeId;
//     if (field?.refAttributeId?.length > 0) {
//       originalAttributeId = field?.refAttributeId[field?.refAttributeId?.length - 1];
//     }
//     if (field.type === 'option' || field.type === 'multioption' || field.type === 'text-with-option') {
//       if (field.isDerived) {
//         options = derivedFieldsCache[originalAttributeId] || [];
//       } else if (entityAttributeOptionMap[originalAttributeId]) {
//         options = optionsCache[entityAttributeOptionMap[originalAttributeId]!] || [];
//       }
//     }
//     const uniqueKey = `${entityFieldOptionsMapByAttributeId[originalAttributeId]?.label || ''}${
//       field.attributeId
//     }${refKey}`;
//     const currentValue = filters[uniqueKey];

//     switch (field.type) {
//       case 'boolean':
//         return (
//           <Box key={uniqueKey}>
//             <Typography
//               variant="subtitle2"
//               sx={{
//                 mb: STYLE_GUIDE.SPACING.s2,
//                 color: theme.palette.text.secondary,
//               }}
//             >
//               {field.label}
//             </Typography>
//             <RadioGroup value={currentValue || ''} onChange={(e) => handleFilterChange(uniqueKey, e.target.value)} row>
//               <FormControlLabel
//                 value=""
//                 control={<Radio size="small" />}
//                 label="All"
//                 sx={{ color: theme.palette.text.primary }}
//               />
//               <FormControlLabel
//                 value="true"
//                 control={<Radio size="small" />}
//                 label="True"
//                 sx={{ color: theme.palette.text.primary }}
//               />
//               <FormControlLabel
//                 value="false"
//                 control={<Radio size="small" />}
//                 label="False"
//                 sx={{ color: theme.palette.text.primary }}
//               />
//             </RadioGroup>
//           </Box>
//         );
//       case 'date':
//         return (
//           <TextField
//             key={uniqueKey}
//             label={field.label}
//             placeholder={`Enter ${field.label.toLowerCase()}...`}
//             type="date"
//             value={currentValue || ''}
//             onChange={(e) => handleFilterChange(uniqueKey, e.target.value)}
//             fullWidth
//             size="small"
//             InputLabelProps={{ shrink: true }}
//             sx={{
//               '& .MuiOutlinedInput-root': {
//                 backgroundColor: theme.getDropdownBackground(),
//                 '& fieldset': {
//                   borderColor: theme.getInputBorderColor(),
//                 },
//                 '&:hover fieldset': {
//                   borderColor: theme.border?.hover || STYLE_GUIDE.COLORS.darkBorderHover,
//                 },
//                 '&.Mui-focused fieldset': {
//                   borderColor: theme.input?.focusBorder || STYLE_GUIDE.COLORS.inputFocusFallback,
//                 },
//               },
//               '& .MuiInputLabel-root': {
//                 color: theme.palette.text.secondary,
//               },
//               '& .MuiInputBase-input': {
//                 color: theme.getInputTextColor(),
//               },
//             }}
//           />
//         );

//       case 'date-range':
//         // Changed: Use field-specific state for date range
//         const fieldDateRangeValue = dateRangeValues[uniqueKey] || [];
//         const isFieldFocused = focusedFields[uniqueKey] || false;

//         return (
//           <Box key={uniqueKey}>
//             <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
//               <Box sx={{ flex: 1 }}>
//                 <DatePicker
//                   onOpen={() => handleDateRangeFocus(uniqueKey, true)}
//                   onClose={() => handleDateRangeFocus(uniqueKey, false)}
//                   calendarPosition="top"
//                   value={fieldDateRangeValue}
//                   onChange={(dateRange) => handleDateRangeChange(uniqueKey, dateRange)}
//                   range
//                   placeholder={`${field.label}`}
//                   numberOfMonths={2}
//                   showOtherDays
//                   inputClass="w-full"
//                   style={{
//                     width: '100%',
//                     padding: '10px 14px',
//                     fontSize: '16px',
//                     borderRadius: 4,
//                     background: theme.getDropdownBackground(),
//                     border: `1px solid ${
//                       isFieldFocused ? theme.input?.focusBorder || 'blue' : theme.getInputBorderColor()
//                     }`,
//                     color: theme.getInputTextColor(),
//                     outline: 'none',
//                   }}
//                 />
//               </Box>
//               {fieldDateRangeValue.length > 0 && (
//                 <Button
//                   size="small"
//                   onClick={() => {
//                     setDateRangeValues((prev) => ({
//                       ...prev,
//                       [uniqueKey]: [],
//                     }));
//                     handleFilterChange(uniqueKey, undefined);
//                   }}
//                   sx={{
//                     right: '8px',
//                     minWidth: 'auto',
//                     padding: '4px',
//                     color: theme.palette.text.secondary,
//                     '&:hover': {
//                       backgroundColor: 'rgba(0, 0, 0, 0.04)',
//                     },
//                   }}
//                 >
//                   x
//                 </Button>
//               )}
//             </Box>
//           </Box>
//         );
//       case 'option':
//         return (
//           <FormControl key={uniqueKey} fullWidth size="small">
//             <InputLabel sx={{ color: theme.palette.text.secondary }}>
//               {field.label} {field.isDerived && '(Derived)'}
//             </InputLabel>
//             <Select
//               value={currentValue || ''}
//               onChange={(e) => handleFilterChange(uniqueKey, e.target.value)}
//               label={`${field.label}${field.isDerived ? ' (Derived)' : ''}`}
//               sx={{
//                 backgroundColor: theme.getDropdownBackground(),
//                 '& .MuiOutlinedInput-notchedOutline': {
//                   borderColor: theme.getInputBorderColor(),
//                 },
//                 '&:hover .MuiOutlinedInput-notchedOutline': {
//                   borderColor: theme.border?.hover || STYLE_GUIDE.COLORS.darkBorderHover,
//                 },
//                 '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
//                   borderColor: theme.input?.focusBorder || STYLE_GUIDE.COLORS.inputFocusFallback,
//                 },
//               }}
//             >
//               <MenuItem value="">All {field.label}</MenuItem>
//               {options.map((option) => (
//                 <MenuItem key={option} value={option}>
//                   {option}
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>
//         );
//       case 'multioption':
//       case 'text-with-option':
//         return (
//           <FormControl key={uniqueKey} fullWidth size="small">
//             <InputLabel sx={{ color: theme.palette.text.secondary }}>
//               {field.label} {field.isDerived && '(Derived)'}
//             </InputLabel>
//             <Select
//               multiple
//               value={currentValue || []}
//               onChange={(e) => handleFilterChange(uniqueKey, e.target.value)}
//               label={`${field.label}${field.isDerived ? ' (Derived)' : ''}`}
//               renderValue={(selected) => (
//                 <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
//                   {(selected as string[]).map((value) => (
//                     <Chip key={value} label={value} size="small" />
//                   ))}
//                 </Box>
//               )}
//               sx={{
//                 backgroundColor: theme.getDropdownBackground(),
//                 '& .MuiOutlinedInput-notchedOutline': {
//                   borderColor: theme.getInputBorderColor(),
//                 },
//               }}
//             >
//               {options.map((option) => (
//                 <MenuItem key={option} value={option}>
//                   <Checkbox checked={(currentValue || []).includes(option)} size="small" />
//                   <ListItemText primary={option} />
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>
//         );
//       case 'number':
//         return (
//           <TextField
//             key={uniqueKey}
//             label={field.label}
//             placeholder={`Enter ${field.label.toLowerCase()}...`}
//             type="number"
//             value={currentValue || ''}
//             onChange={(e) => handleFilterChange(uniqueKey, e.target.value)}
//             fullWidth
//             size="small"
//             sx={{
//               '& .MuiOutlinedInput-root': {
//                 backgroundColor: theme.getDropdownBackground(),
//                 '& fieldset': {
//                   borderColor: theme.getInputBorderColor(),
//                 },
//                 '&:hover fieldset': {
//                   borderColor: theme.border?.hover || STYLE_GUIDE.COLORS.darkBorderHover,
//                 },
//                 '&.Mui-focused fieldset': {
//                   borderColor: theme.input?.focusBorder || STYLE_GUIDE.COLORS.inputFocusFallback,
//                 },
//               },
//             }}
//           />
//         );
//       default: // text, richtext, url, user, email, text-with-option
//         return (
//           <TextField
//             key={uniqueKey}
//             label={field.label}
//             placeholder={`Enter ${field.label.toLowerCase()}...`}
//             value={currentValue || ''}
//             onChange={(e) => handleFilterChange(uniqueKey, e.target.value)}
//             fullWidth
//             size="small"
//             sx={{
//               '& .MuiOutlinedInput-root': {
//                 backgroundColor: theme.getDropdownBackground(),
//                 '& fieldset': {
//                   borderColor: theme.getInputBorderColor(),
//                 },
//                 '&:hover fieldset': {
//                   borderColor: theme.border?.hover || STYLE_GUIDE.COLORS.darkBorderHover,
//                 },
//                 '&.Mui-focused fieldset': {
//                   borderColor: theme.input?.focusBorder || STYLE_GUIDE.COLORS.inputFocusFallback,
//                 },
//               },
//               '& .MuiInputLabel-root': {
//                 color: theme.palette.text.secondary,
//               },
//               '& .MuiInputBase-input': {
//                 color: theme.getInputTextColor(),
//               },
//             }}
//           />
//         );
//     }
//   };

//   return (
//     <Dialog
//       open={open}
//       onClose={onClose}
//       maxWidth="md"
//       fullWidth
//       PaperProps={{
//         sx: {
//           backgroundColor: theme.palette.background.paper,
//           borderRadius: STYLE_GUIDE.SPACING.s2,
//           overflow: 'visible',
//         },
//       }}
//     >
//       <DialogTitle
//         sx={{
//           borderBottom: `1px solid ${theme.palette.divider}`,
//           pb: STYLE_GUIDE.SPACING.s4,
//         }}
//       >
//         <Typography variant="h6" sx={{ fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium }}>
//           Filters
//         </Typography>
//       </DialogTitle>
//       <DialogContent
//         sx={{
//           fontSize: '14px', // normal body font
//           '& .rmdp-input': {
//             fontSize: '14px',
//             lineHeight: '20px',
//           },
//         }}
//       >
//         {isLoading || dataSourceQuery.isLoading ? (
//           <Box
//             sx={{
//               display: 'flex',
//               justifyContent: 'center',
//               py: STYLE_GUIDE.SPACING.s6,
//             }}
//           >
//             <Typography variant="body2" color="text.secondary">
//               Loading filters...
//             </Typography>
//           </Box>
//         ) : dataSourceQuery.isError ? (
//           <Box
//             sx={{
//               display: 'flex',
//               flexDirection: 'column',
//               alignItems: 'center',
//               py: STYLE_GUIDE.SPACING.s6,
//             }}
//           >
//             <Typography variant="body2" color="error" sx={{ mb: 2 }}>
//               Error loading filters: {dataSourceQuery.error?.message || 'Unknown error'}
//             </Typography>
//             <Button variant="outlined" onClick={() => dataSourceQuery.refetch()}>
//               Retry
//             </Button>
//           </Box>
//         ) : filteredFieldSettings.length === 0 ? (
//           <Box
//             sx={{
//               display: 'flex',
//               justifyContent: 'center',
//               py: STYLE_GUIDE.SPACING.s6,
//             }}
//           >
//             <Typography variant="body2" color="text.secondary">
//               No filters available
//             </Typography>
//           </Box>
//         ) : (
//           <Box
//             sx={{
//               display: 'grid',
//               pt: 1.5,
//               gridTemplateColumns: 'repeat(3, 1fr)',
//               gap: STYLE_GUIDE.SPACING.s4,
//               '@media (max-width: 900px)': {
//                 gridTemplateColumns: 'repeat(2, 1fr)',
//               },
//               '@media (max-width: 600px)': {
//                 gridTemplateColumns: '1fr',
//               },
//             }}
//           >
//             {filteredFieldSettings.map((field) => renderFilterField(field))}
//           </Box>
//         )}
//       </DialogContent>
//       <DialogActions sx={{ p: STYLE_GUIDE.SPACING.s4, gap: STYLE_GUIDE.SPACING.s2 }}>
//         <Button
//           onClick={handleClearFilters}
//           variant="outlined"
//           disabled={!hasActiveFilters}
//           sx={{
//             ...getButtonSx(),
//             borderColor: theme.palette.error.main,
//             color: theme.palette.error.main,
//             '&:hover': {
//               borderColor: theme.palette.error.dark,
//               backgroundColor: theme.palette.error.light,
//             },
//             '&:disabled': {
//               borderColor: theme.palette.action.disabled,
//               color: theme.palette.action.disabled,
//             },
//           }}
//         >
//           Clear All
//         </Button>
//         <Button
//           onClick={onClose}
//           variant="outlined"
//           sx={{
//             ...getButtonSx(),
//             borderColor: theme.getInputBorderColor(),
//             color: theme.palette.text.primary,
//             '&:hover': {
//               borderColor: theme.border?.hover || STYLE_GUIDE.COLORS.darkBorderHover,
//             },
//           }}
//         >
//           Cancel
//         </Button>
//         <Button
//           onClick={handleApplyFilters}
//           variant="contained"
//           sx={{
//             ...getButtonSx(),
//             backgroundColor: STYLE_GUIDE.COLORS.primary,
//             color: STYLE_GUIDE.COLORS.white,
//             '&:hover': {
//               backgroundColor: STYLE_GUIDE.COLORS.primaryDark,
//             },
//           }}
//         >
//           Apply Filters
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default NotivixFiltersModal;

import React, { useState, useEffect, useRef, useMemo } from "react";
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
  Checkbox,
  ListItemText,
  FormControlLabel,
  Radio,
  RadioGroup,
} from "@mui/material";
import { STYLE_GUIDE } from "../../../styles";
import { useUnifiedTheme } from "../../../hooks/useUnifiedTheme";
import { useComponentTypography } from "../../../hooks/useComponentTypography";
import useGet from "../../../hooks/useGet";
import axiosInstance from "../../../services/axiosInstance";
import { GET } from "../../../services/apiRoutes";
import { useQueryClient } from "@tanstack/react-query";
import DatePicker, { DateObject } from "react-multi-date-picker";
import "react-multi-date-picker/styles/colors/purple.css";
import DialogContainer from "../../../components/molecule/dialog";

// Add global styles for datepicker portal to ensure it appears above modal
const style = document.createElement("style");
style.textContent = `
  .rmdp-container:not(.rmdp-input) {
    z-index: 9999 !important;
  }
  .rmdp-wrapper {
    z-index: 9999 !important;
  }
`;
if (!document.getElementById("rmdp-portal-styles")) {
  style.id = "rmdp-portal-styles";
  document.head.appendChild(style);
}

interface NotivixFiltersModalProps {
  open: boolean;
  onClose: () => void;
  onApplyFilters: (filters: Record<string, any>) => void;
  currentFilters?: Record<string, any>;
  dataSourceId: string;
  filterFlag?: "isFilterEnable" | "isDashboardFilter";
  isLoading?: boolean;
  defaultFilters?: Record<string, any>;
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
  mappedAttributeName?: string;
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
  filterFlag = "isFilterEnable",
  isLoading = false,
  defaultFilters = {},
}) => {
  const theme = useUnifiedTheme();
  const { getButtonSx } = useComponentTypography();
  const [filters, setFilters] = useState<Record<string, any>>(currentFilters);
  const [optionsCache, setOptionsCache] = useState<Record<string, string[]>>(
    {}
  );
  const [derivedFieldsCache, setDerivedFieldsCache] = useState<
    Record<string, string[]>
  >({});

  // Changed: Store date range values per field using uniqueKey
  const [dateRangeValues, setDateRangeValues] = useState<
    Record<string, DateObject[]>
  >({});
  const [focusedFields, setFocusedFields] = useState<Record<string, boolean>>(
    {}
  );

  const caseStatusValue = useMemo(() => {
    const caseStatusEntry = Object.entries(filters).find(([key]) =>
      key.startsWith("Case Status")
    );
    return caseStatusEntry ? caseStatusEntry[1] : undefined;
  }, [filters]);

  const queryClient = useQueryClient();

  // Fetch data source details
  const dataSourceQuery = useGet<DataSourceResponse>(
    ["dataSourceDetails", dataSourceId],
    `${GET.GET_VERSION_DATA_BY_ID}${dataSourceId}`,
    !!dataSourceId && open // Only fetch when modal is open and dataSourceId exists
  );

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
        queryKey: ["dataSourceDetails", dataSourceId],
        queryFn: async () => {
          const response = await axiosInstance.get<DataSourceResponse>(
            `${GET.GET_VERSION_DATA_BY_ID}${dataSourceId}`
          );
          return response.data;
        },
        staleTime: 5 * 60 * 1000,
      });
    }
  }, [dataSourceId, open, queryClient]);

  // Memoize filtered field settings
  const filteredFieldSettings = useMemo(() => {
    if (!dataSourceQuery.data?.data?.fieldSettings) return [];
    return dataSourceQuery.data.data.fieldSettings.filter(
      (field) => field[filterFlag] === true
    );
  }, [dataSourceQuery.data, filterFlag]);

  // Memoize entity field options map
  const entityFieldOptionsMap = useMemo(() => {
    const map: Record<string, EntityFieldOption> = {};
    dataSourceQuery.data?.data.entityFieldOptions?.forEach((option) => {
      // Create unique key by combining attributeId with refAttributeId array
      const refKey =
        (option.value.refAttributeId?.length || 0) > 0
          ? `-${option.value.refAttributeId!.join("-")}`
          : "";
      const uniqueKey = `${option.label}${option.value.attributeId}${refKey}`;
      map[uniqueKey] = option;
    });
    return map;
  }, [dataSourceQuery.data]);

  // Memoize entity field options map by attribute ID
  const entityFieldOptionsMapByAttributeId = useMemo(() => {
    const map: Record<string, EntityFieldOption> = {};
    let originalAttributeId: string;
    dataSourceQuery.data?.data.entityFieldOptions?.forEach((option) => {
      originalAttributeId = option?.value?.attributeId;
      if ((option?.value?.refAttributeId?.length || 0) > 0) {
        originalAttributeId =
          option?.value?.refAttributeId?.[
            option?.value?.refAttributeId?.length - 1
          ] ?? "";
      }
      map[originalAttributeId] = option;
    });
    return map;
  }, [dataSourceQuery.data]);

  // Memoize entity attribute option map
  const entityAttributeOptionMap = useMemo(() => {
    const attrMap: Record<string, string | null> = {};
    let originalAttributeId: string;
    dataSourceQuery.data?.data?.fieldSettings.forEach((attr) => {
      originalAttributeId = attr?.attributeId;
      if ((attr?.refAttributeId?.length || 0) > 0) {
        originalAttributeId =
          attr.refAttributeId?.[attr.refAttributeId.length - 1] ?? "";
      }
      attrMap[originalAttributeId] = entityFieldOptionsMapByAttributeId[
        originalAttributeId
      ]
        ? entityFieldOptionsMapByAttributeId[originalAttributeId]?.value
            ?.optionAttributeId
        : null;
    });
    return attrMap;
  }, [dataSourceQuery.data, entityFieldOptionsMapByAttributeId]);

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
      console.error("Error fetching attribute options:", error);
    }
    return [];
  };

  // Fetch derived field options
  const fetchDerivedFieldOptions = async (attributeId: string) => {
    if (derivedFieldsCache[attributeId]) {
      return derivedFieldsCache[attributeId];
    }
    try {
      const { data } = await axiosInstance.get<DerivedFieldResponse>(
        `/common/derivedField/${attributeId}`
      );
      if (data.success && data.data.valueRules) {
        const options = data.data.valueRules.map((rule) => rule.value);
        setDerivedFieldsCache((prev) => ({
          ...prev,
          [attributeId]: options,
        }));
        return options;
      }
    } catch (error) {
      console.error("Error fetching derived field options:", error);
    }
    return [];
  };

  // Load options for option/multioption fields
  useEffect(() => {
    if (filteredFieldSettings.length > 0) {
      let originalAttributeId: string;
      const fetchOptions = async () => {
        const promises = filteredFieldSettings.map(async (field) => {
          if (
            field.type === "option" ||
            field.type === "multioption" ||
            field.type === "text-with-option"
          ) {
            originalAttributeId = field?.attributeId;
            if ((field?.refAttributeId?.length || 0) > 0) {
              originalAttributeId =
                field?.refAttributeId?.[field?.refAttributeId.length - 1] ?? "";
            }
            if (field.isDerived) {
              // Fetch derived field options
              await fetchDerivedFieldOptions(originalAttributeId);
            } else if (entityAttributeOptionMap[originalAttributeId]) {
              // Fetch regular attribute options
              await fetchAttributeOptions(
                entityAttributeOptionMap[originalAttributeId]!
              );
            }
          }
        });
        await Promise.all(promises);
      };
      fetchOptions();
    }
  }, [filteredFieldSettings, entityAttributeOptionMap]);

  const handleApplyFilters = () => {
    const transformedFilters: Record<string, any> = {};

    Object.entries(filters).forEach(([filterKey, value]) => {
      const entityOption = entityFieldOptionsMap[filterKey];

      const isEmptyValue =
        value === undefined ||
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0);

      if (entityOption && !isEmptyValue) {
        if (entityOption?.value?.isDerived) {
          transformedFilters[`Derived.${entityOption.label}`] = value;
        } else {
          transformedFilters[entityOption.label] = value;
        }
      }
    });

    onApplyFilters(transformedFilters);
    onClose();
  };

  const handleClearFilters = () => {
    setFilters({ ...defaultFilters, __reset: Date.now() });
    setDateRangeValues({}); // Changed: Clear all date range values
    setFocusedFields({}); // Changed: Clear all focused fields
    onApplyFilters({ ...defaultFilters });
    onClose();
  };

  const handleFilterChange = (uniqueKey: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [uniqueKey]: value,
    }));
  };

  // Changed: Helper functions for date range management
  const handleDateRangeChange = (
    uniqueKey: string,
    dateRange: DateObject[]
  ) => {
    setDateRangeValues((prev) => ({
      ...prev,
      [uniqueKey]: dateRange,
    }));

    handleFilterChange(uniqueKey, {
      startDate: dateRange?.[0]?.format?.("YYYY-MM-DD") || "",
      endDate: dateRange?.[1]?.format?.("YYYY-MM-DD") || "",
    });
  };

  const handleDateRangeFocus = (uniqueKey: string, focused: boolean) => {
    setFocusedFields((prev) => ({
      ...prev,
      [uniqueKey]: focused,
    }));
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) =>
      value !== undefined &&
      value !== "" &&
      value !== null &&
      (typeof value !== "object" ||
        (Array.isArray(value) && value.length > 0) ||
        (!Array.isArray(value) &&
          Object.values(value).some(
            (v) => v !== undefined && v !== "" && v !== null
          )))
  );

  // Refs to track previous state values
  const prevFiltersRef = useRef<Record<string, any>>({});
  const prevDateRangeValuesRef = useRef<Record<string, DateObject[]>>({});
  const prevDataSourceIdRef = useRef<string>(dataSourceId);

  // Effect to transform currentFilters
  useEffect(() => {
    if (
      !dataSourceQuery.data ||
      (!filteredFieldSettings.length &&
        Object.keys(entityFieldOptionsMap).length === 0)
    )
      return;

    const reverseTransformedFilters: Record<string, any> = {};
    const newDateRangeValues: Record<string, DateObject[]> = {};

    const dataSourceChanged = prevDataSourceIdRef.current !== dataSourceId;

    if (currentFilters && Object.keys(currentFilters).length > 0) {
      Object.entries(currentFilters).forEach(([filterLabel, value]) => {
        let isDerived = false;
        let actualLabel = filterLabel;

        if (filterLabel.startsWith("Derived.")) {
          actualLabel = filterLabel.replace("Derived.", "");
          isDerived = true;
        }

        const matchedField = filteredFieldSettings.find((field) => {
          const fieldIsDerived = !!field.isDerived;
          if (fieldIsDerived !== isDerived) return false;

          if (field.label === actualLabel) return true;

          if (
            field.mappedAttributeName &&
            field.mappedAttributeName.startsWith(actualLabel)
          ) {
            return true;
          }

          return false;
        });

        if (matchedField) {
          const refKey =
            (matchedField.refAttributeId?.length || 0) > 0
              ? `-${matchedField.refAttributeId!.join("-")}`
              : "";
          let originalAttributeId = matchedField.attributeId;
          if ((matchedField.refAttributeId?.length || 0) > 0) {
            originalAttributeId =
              matchedField.refAttributeId?.[
                matchedField.refAttributeId?.length - 1
              ] ?? "";
          }

          const option =
            entityFieldOptionsMapByAttributeId[originalAttributeId];
          const prefixLabel = option?.label || "";

          const uniqueKey = `${prefixLabel}${matchedField.attributeId}${refKey}`;

          reverseTransformedFilters[uniqueKey] = value;
        } else {
          const matchingEntry = Object.entries(entityFieldOptionsMap).find(
            ([, opt]) =>
              opt.label === actualLabel && !!opt.value.isDerived === isDerived
          );
          if (matchingEntry) {
            reverseTransformedFilters[matchingEntry[0]] = value;
          }
        }
      });

      Object.entries(reverseTransformedFilters).forEach(
        ([uniqueKey, value]) => {
          const fieldSetting = filteredFieldSettings.find((field) => {
            const refKey =
              (field.refAttributeId?.length || 0) > 0
                ? `-${field?.refAttributeId?.join("-")}`
                : "";
            let originalAttributeId = field.attributeId;
            if ((field?.refAttributeId?.length || 0) > 0) {
              originalAttributeId =
                field.refAttributeId?.[field.refAttributeId?.length - 1] ?? "";
            }
            const prefixLabel =
              entityFieldOptionsMapByAttributeId[originalAttributeId]?.label ||
              "";
            const fieldUniqueKey = `${prefixLabel}${field.attributeId}${refKey}`;
            return fieldUniqueKey === uniqueKey;
          });

          if (
            fieldSetting?.type === "date-range" &&
            value &&
            typeof value === "object" &&
            value.startDate &&
            value.endDate
          ) {
            // Convert the date range back to DateObject array
            const startDate = new DateObject(value.startDate);
            const endDate = new DateObject(value.endDate);
            newDateRangeValues[uniqueKey] = [startDate, endDate];
          }
        }
      );
    }

    const filtersChanged =
      JSON.stringify(reverseTransformedFilters) !==
      JSON.stringify(prevFiltersRef.current);
    const dateRangeValuesChanged =
      JSON.stringify(newDateRangeValues) !==
      JSON.stringify(prevDateRangeValuesRef.current);

    if (filtersChanged || dateRangeValuesChanged || dataSourceChanged) {
      setFilters(reverseTransformedFilters);
      setDateRangeValues(newDateRangeValues);
    }
    prevFiltersRef.current = reverseTransformedFilters;
    prevDateRangeValuesRef.current = newDateRangeValues;

    if (dataSourceChanged) {
      prevDataSourceIdRef.current = dataSourceId;
    }
  }, [
    currentFilters,
    dataSourceQuery.data,
    entityFieldOptionsMap,
    filteredFieldSettings,
    entityFieldOptionsMapByAttributeId,
    dataSourceId,
  ]);

  const renderFilterField = (field: FieldSetting) => {
    // Generate the same unique key used in entityFieldOptionsMap
    const refKey =
      (field.refAttributeId?.length || 0) > 0
        ? `-${field.refAttributeId!.join("-")}`
        : "";
    // Get options based on field type
    let options: string[] = [];
    let originalAttributeId: string = field?.attributeId;
    if ((field?.refAttributeId?.length || 0) > 0) {
      originalAttributeId =
        field.refAttributeId![field.refAttributeId!.length - 1];
    }
    if (
      field.type === "option" ||
      field.type === "multioption" ||
      field.type === "text-with-option"
    ) {
      if (field.isDerived) {
        options = derivedFieldsCache[originalAttributeId] || [];
      } else if (entityAttributeOptionMap[originalAttributeId]) {
        options =
          optionsCache[entityAttributeOptionMap[originalAttributeId]!] || [];
      }
    }
    const uniqueKey = `${
      entityFieldOptionsMapByAttributeId[originalAttributeId]?.label || ""
    }${field.attributeId}${refKey}`;
    const currentValue = filters[uniqueKey];

    switch (field.type) {
      case "boolean":
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
            <RadioGroup
              value={currentValue || ""}
              onChange={(e) => handleFilterChange(uniqueKey, e.target.value)}
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
      case "date":
        return (
          <TextField
            key={uniqueKey}
            label={field.label}
            placeholder={`Enter ${field.label.toLowerCase()}...`}
            type="date"
            value={currentValue || ""}
            onChange={(e) => handleFilterChange(uniqueKey, e.target.value)}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: theme.getDropdownBackground(),
                "& fieldset": {
                  borderColor: theme.getInputBorderColor(),
                },
                "&:hover fieldset": {
                  borderColor:
                    theme.border?.hover || STYLE_GUIDE.COLORS.darkBorderHover,
                },
                "&.Mui-focused fieldset": {
                  borderColor:
                    theme.input?.focusBorder ||
                    STYLE_GUIDE.COLORS.inputFocusFallback,
                },
              },
              "& .MuiInputLabel-root": {
                color: theme.palette.text.secondary,
              },
              "& .MuiInputBase-input": {
                color: theme.getInputTextColor(),
              },
            }}
          />
        );

      case "date-range": {
        // Changed: Use field-specific state for date range
        const fieldDateRangeValue = dateRangeValues?.[uniqueKey] || [];
        const isFieldFocused = focusedFields?.[uniqueKey] || false;

        return (
          <Box key={uniqueKey}>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Box
                sx={{
                  flex: 1,
                  height: 40,
                  position: "relative",
                  "& .rmdp-container ": {
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "40px !important",
                  },
                  "& .rmdp-container input": {
                    height: "40px !important",
                    position: "absolute",
                    top: 0,
                    left: 0,
                  },
                }}
              >
                <DatePicker
                  onOpen={() => handleDateRangeFocus(uniqueKey, true)}
                  onClose={() => handleDateRangeFocus(uniqueKey, false)}
                  value={fieldDateRangeValue}
                  onChange={(dateRange) =>
                    handleDateRangeChange(uniqueKey, dateRange)
                  }
                  range
                  portal
                  placeholder={`${field.label}`}
                  numberOfMonths={2}
                  showOtherDays
                  className="purple"
                  format="DD/MM/YYYY"
                  inputClass="w-full"
                  style={{
                    width: "100%",
                    height: "38px",
                    padding: "8.5px 14px",
                    fontSize: "14px",
                    borderRadius: 4,
                    background: theme.getDropdownBackground(),
                    border: `1px solid ${
                      isFieldFocused
                        ? theme.input?.focusBorder || "blue"
                        : theme.getInputBorderColor()
                    }`,
                    color: theme.getInputTextColor(),
                    outline: "none",
                    boxSizing: "border-box",
                    fontFamily:
                      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  }}
                  containerStyle={{
                    width: "100%",
                  }}
                  portalTarget={document.body}
                  zIndex={9999}
                  maxDate={
                    field.label === "DateTaken" &&
                    caseStatusValue === "Completed"
                      ? new Date()
                      : undefined
                  }
                />
              </Box>
              {fieldDateRangeValue.length > 0 && (
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => {
                    setDateRangeValues((prev) => ({
                      ...prev,
                      [uniqueKey]: [],
                    }));
                    handleFilterChange(uniqueKey, undefined);
                  }}
                  sx={{
                    // right: "8px",
                    minWidth: "40px",
                    // padding: "4px",
                    height: "40px",
                    color: "white",
                    // "&:hover": {
                    //   backgroundColor: "rgba(0, 0, 0, 0.04)",
                    // },
                  }}
                >
                  x
                </Button>
              )}
            </Box>
          </Box>
        );
      }
      case "option":
        return (
          <FormControl key={uniqueKey} fullWidth size="small">
            <InputLabel sx={{ color: theme.palette.text.secondary }}>
              {field.label} {field.isDerived && "(Derived)"}
            </InputLabel>
            <Select
              value={currentValue || "all"}
              onChange={(e) => handleFilterChange(uniqueKey, e.target.value)}
              label={`${field.label}${field.isDerived ? " (Derived)" : ""}`}
              sx={{
                backgroundColor: theme.getDropdownBackground(),
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.getInputBorderColor(),
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor:
                    theme.border?.hover || STYLE_GUIDE.COLORS.darkBorderHover,
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor:
                    theme.input?.focusBorder ||
                    STYLE_GUIDE.COLORS.inputFocusFallback,
                },
              }}
            >
              <MenuItem value="all">All {field.label}</MenuItem>
              {options.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case "multioption":
      case "text-with-option":
        return (
          <FormControl key={uniqueKey} fullWidth size="small">
            <InputLabel sx={{ color: theme.palette.text.secondary }}>
              {field.label} {field.isDerived && "(Derived)"}
            </InputLabel>
            <Select
              multiple
              value={currentValue || []}
              onChange={(e) => handleFilterChange(uniqueKey, e.target.value)}
              label={`${field.label}${field.isDerived ? " (Derived)" : ""}`}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {(selected as string[]).map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
              sx={{
                backgroundColor: theme.getDropdownBackground(),
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.getInputBorderColor(),
                },
              }}
            >
              {options.map((option) => (
                <MenuItem key={option} value={option}>
                  <Checkbox
                    checked={(currentValue || []).includes(option)}
                    size="small"
                  />
                  <ListItemText primary={option} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case "number":
        return (
          <TextField
            key={uniqueKey}
            label={field.label}
            placeholder={`Enter ${field.label.toLowerCase()}...`}
            type="number"
            value={currentValue || ""}
            onChange={(e) => handleFilterChange(uniqueKey, e.target.value)}
            fullWidth
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: theme.getDropdownBackground(),
                "& fieldset": {
                  borderColor: theme.getInputBorderColor(),
                },
                "&:hover fieldset": {
                  borderColor:
                    theme.border?.hover || STYLE_GUIDE.COLORS.darkBorderHover,
                },
                "&.Mui-focused fieldset": {
                  borderColor:
                    theme.input?.focusBorder ||
                    STYLE_GUIDE.COLORS.inputFocusFallback,
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
            value={currentValue || ""}
            onChange={(e) => handleFilterChange(uniqueKey, e.target.value)}
            fullWidth
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: theme.getDropdownBackground(),
                "& fieldset": {
                  borderColor: theme.getInputBorderColor(),
                },
                "&:hover fieldset": {
                  borderColor:
                    theme.border?.hover || STYLE_GUIDE.COLORS.darkBorderHover,
                },
                "&.Mui-focused fieldset": {
                  borderColor:
                    theme.input?.focusBorder ||
                    STYLE_GUIDE.COLORS.inputFocusFallback,
                },
              },
              "& .MuiInputLabel-root": {
                color: theme.palette.text.secondary,
              },
              "& .MuiInputBase-input": {
                color: theme.getInputTextColor(),
              },
            }}
          />
        );
    }
  };

  return (
    <DialogContainer
      open={open}
      onClose={onClose}
      title="Filters"
      id="filters-modal-portal-target"
      actions={
        <>
          <Button
            onClick={handleClearFilters}
            variant="outlined"
            disabled={!hasActiveFilters}
            sx={{
              ...getButtonSx(),
              borderColor: theme.palette.error.main,
              color: theme.palette.error.main,
              "&:hover": {
                borderColor: theme.palette.error.dark,
                backgroundColor: theme.palette.error.light,
              },
              "&:disabled": {
                borderColor: theme.palette.action.disabled,
                color: theme.palette.action.disabled,
              },
            }}
          >
            Reset
          </Button>
          <Button
            onClick={handleApplyFilters}
            variant="contained"
            sx={{
              ...getButtonSx(),
              backgroundColor: STYLE_GUIDE.COLORS.primary,
              color: STYLE_GUIDE.COLORS.white,
              "&:hover": {
                backgroundColor: STYLE_GUIDE.COLORS.primaryDark,
              },
            }}
          >
            Apply
          </Button>
        </>
      }
    >
      {isLoading || dataSourceQuery.isLoading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
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
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            py: STYLE_GUIDE.SPACING.s6,
          }}
        >
          <Typography variant="body2" color="error" sx={{ mb: 2 }}>
            Error loading filters:{" "}
            {dataSourceQuery.error?.message || "Unknown error"}
          </Typography>
          <Button variant="outlined" onClick={() => dataSourceQuery.refetch()}>
            Retry
          </Button>
        </Box>
      ) : filteredFieldSettings.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
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
            display: "grid",
            pt: 1.5,
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: STYLE_GUIDE.SPACING.s4,
            "@media (max-width: 900px)": {
              gridTemplateColumns: "repeat(2, 1fr)",
            },
            "@media (max-width: 600px)": {
              gridTemplateColumns: "1fr",
            },
          }}
        >
          {filteredFieldSettings.map((field) => renderFilterField(field))}
        </Box>
      )}
    </DialogContainer>
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
          overflow: "visible",
        },
      }}
    >
      <DialogTitle
        sx={{
          borderBottom: `1px solid ${theme.palette.divider}`,
          pb: STYLE_GUIDE.SPACING.s4,
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium }}
        >
          Filters
        </Typography>
      </DialogTitle>
      <DialogContent
        sx={{
          fontSize: "14px", // normal body font
          "& .rmdp-input": {
            fontSize: "14px",
            lineHeight: "20px",
          },
        }}
      >
        {isLoading || dataSourceQuery.isLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
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
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: STYLE_GUIDE.SPACING.s6,
            }}
          >
            <Typography variant="body2" color="error" sx={{ mb: 2 }}>
              Error loading filters:{" "}
              {dataSourceQuery.error?.message || "Unknown error"}
            </Typography>
            <Button
              variant="outlined"
              onClick={() => dataSourceQuery.refetch()}
            >
              Retry
            </Button>
          </Box>
        ) : filteredFieldSettings.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
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
              display: "grid",
              pt: 1.5,
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: STYLE_GUIDE.SPACING.s4,
              "@media (max-width: 900px)": {
                gridTemplateColumns: "repeat(2, 1fr)",
              },
              "@media (max-width: 600px)": {
                gridTemplateColumns: "1fr",
              },
            }}
          >
            {filteredFieldSettings.map((field) => renderFilterField(field))}
          </Box>
        )}
      </DialogContent>
      <DialogActions
        sx={{ p: STYLE_GUIDE.SPACING.s4, gap: STYLE_GUIDE.SPACING.s2 }}
      >
        <Button
          onClick={handleClearFilters}
          variant="outlined"
          disabled={!hasActiveFilters}
          sx={{
            ...getButtonSx(),
            borderColor: theme.palette.error.main,
            color: theme.palette.error.main,
            "&:hover": {
              borderColor: theme.palette.error.dark,
              backgroundColor: theme.palette.error.light,
            },
            "&:disabled": {
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
            "&:hover": {
              borderColor:
                theme.border?.hover || STYLE_GUIDE.COLORS.darkBorderHover,
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
            "&:hover": {
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

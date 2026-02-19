// import React, { useState, useRef, useEffect, useMemo } from 'react';
// import { Box, Typography, TextField, Button, ButtonGroup, Stack, MenuItem, SelectChangeEvent } from '@mui/material';
// import StyledSelect from '../../../components/atom/common/StyledSelect';
// import AddIcon from '@mui/icons-material/Add';
// import EditIcon from '@mui/icons-material/Edit';
// import DoneIcon from '@mui/icons-material/Done';
// import PauseIcon from '@mui/icons-material/Pause';
// import ViewColumnIcon from '@mui/icons-material/ViewColumn';
// import SquareIcon from '@mui/icons-material/Square';
// import { useParams, useLocation } from 'react-router-dom';
// import { ChartGrid } from './ChartGrid';
// import { AddChartModal, ChartFormData } from './AddChartModal';
// import { useAppDispatch, useAppSelector } from '../../../storeHooks';
// import { updateWidget, saveWidgets, fetchWidgetTheme, fetchChartData, selectDashboardTheme } from '../dashboardActions';
// import { toast } from 'react-toastify';
// import { ChartResponse, TemporaryChart, Dashboard } from '../types';
// import usePost from '../../../hooks/usePost';
// import { POST } from '../../../services/apiRoutes';
// import CommonDatePicker from '../../../components/common/datePicker/datePicker';
// import { useForm } from 'react-hook-form';
// import { DateTime } from 'luxon';
// import { yupResolver } from '@hookform/resolvers/yup';
// import * as yup from 'yup';
// import { fetchThemeList } from '../../createTheme/themeActions';
// import { STYLE_GUIDE } from '../../../styles';
// import { useUnifiedTheme } from '../../../hooks/useUnifiedTheme';
// import { useComponentTypography } from '../../../hooks/useComponentTypography';
// import NotivixFiltersModal from '../../notivixDashboard/components/NotivixFiltersModal';
// import { GridFilterListIcon } from '@mui/x-data-grid';
// import { ToggleButton, ToggleButtonGroup } from '@mui/material';
// import DatePicker, { Calendar, DateObject } from 'react-multi-date-picker';

// interface DashboardViewProps {
//   title: string;
//   onTitleChange: (newTitle: string) => void;
// }

// export const DashboardView: React.FC<DashboardViewProps> = ({ title: initialTitle, onTitleChange }): JSX.Element => {
//   const theme = useUnifiedTheme();
//   const { getHeadingSx, getButtonSx } = useComponentTypography();
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [editedTitle, setEditedTitle] = useState(initialTitle);
//   const [title, setTitle] = useState(initialTitle);
//   const [isAddChartModalOpen, setIsAddChartModalOpen] = useState(false);
//   const [isEditChartModalOpen, setIsEditChartModalOpen] = useState(false);
//   const [selectedChart, setSelectedChart] = useState<ChartResponse | null>(null);
//   const [gridColumns, setGridColumns] = useState(2);
//   const [selectedTheme, setSelectedTheme] = useState<string>('');

//   const inputRef = useRef<HTMLInputElement>(null);
//   const { id: dashboardId } = useParams();
//   const location = useLocation();
//   const dispatch = useAppDispatch();
//   const temporaryCharts = useAppSelector((state) => state.dashboard.temporaryCharts);
//   const dashboards = useAppSelector((state) => state.dashboard.dashboards);
//   const currentDashboard = dashboards.find((d) => d._id === dashboardId);
//   const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
//   const [dashboardFilters, setDashboardFilters] = useState<any>({});
//   const { dataSourceDetails, dataSourceDetailsLoading } = useAppSelector((state) => state.notivixDashboard);
//   const [statusToggle, setStatusToggle] = useState<'Pending' | 'Completed'>('Pending');
//   const [dateRange, setDateRange] = useState<DateObject[] | null>(null);
//   const [isDateRangeFocused, setIsDateRangeFocused] = useState(false);
//   const { themes } = useAppSelector((state) => state.theme);

//   const postGridColumns = usePost(['']);

//   useEffect(() => {
//     if (!!currentDashboard?.settings?.dataSource?._id) {
//       setDashboardFilters((prev) => ({
//         ...prev,
//         'Derived.Case Status': statusToggle,
//       }));
//     }
//   }, [currentDashboard?.settings?.dataSource?._id]);

//   const handleOpenFiltersModal = async () => {
//     if (currentDashboard?.settings?.dataSource?._id) {
//       try {
//         setIsFiltersModalOpen(true);
//       } catch (error) {
//         toast.error('Failed to load filters. Please try again.');
//       }
//     } else {
//       setIsFiltersModalOpen(true);
//     }
//   };

//   const handleStatusToggle = (event: React.MouseEvent<HTMLElement>, newStatus: 'Pending' | 'Completed' | null) => {
//     if (newStatus !== null) {
//       setStatusToggle(newStatus);
//       setDashboardFilters((prev) => ({
//         ...prev,
//         'Derived.Case Status': newStatus,
//       }));
//     }
//   };

//   const handleDateRangeChange = (dateRange: DateObject[] | DateObject | null) => {
//     const range = Array.isArray(dateRange) ? dateRange : dateRange ? [dateRange] : null;
//     setDateRange(range);

//     if (range && range.length === 2) {
//       const startDate = range[0].format('YYYY-MM-DD');
//       const endDate = range[1].format('YYYY-MM-DD');

//       setDashboardFilters((prev) => ({
//         ...prev,
//         DueDate: {
//           startDate,
//           endDate,
//         },
//       }));
//     }
//   };
//   const handleDateRangeFocus = (focused: boolean) => {
//     setIsDateRangeFocused(focused);
//   };

//   const handleCloseFiltersModal = () => {
//     setIsFiltersModalOpen(false);
//   };
//   const handleApplyFilters = async (filters: any) => {
//     setDashboardFilters(filters);
//   };
//   const validationSchema = yup.object({
//     versionValue: yup.string().nullable().optional(),
//     startDate: yup
//       .string()
//       .nullable()
//       .when('$isDashboardTrend', ([isDashboardTrend]) => {
//         if (isDashboardTrend) {
//           return yup.string().nullable().required('Start date is required');
//         }
//         return yup.string().nullable().optional();
//       }),
//     endDate: yup
//       .string()
//       .nullable()
//       .when(['$isDashboardTrend', 'startDate'], ([isDashboardTrend, startDate]) => {
//         if (isDashboardTrend && startDate) {
//           return yup
//             .string()
//             .nullable()
//             .required('End date is required')
//             .test('is-after-start', 'End date must be after or equal to start date', function (value) {
//               const { startDate } = this.parent;
//               if (!value || !startDate) return true;

//               try {
//                 const startDateTime = DateTime.fromISO(startDate);
//                 const endDateTime = DateTime.fromISO(value);
//                 return endDateTime >= startDateTime;
//               } catch {
//                 return false;
//               }
//             });
//         }
//         return yup.string().nullable().optional();
//       }),
//   });

//   const {
//     control,
//     watch,
//     setValue,
//     formState: { errors },
//     trigger,
//   } = useForm<{
//     versionValue?: string | null | undefined;
//     startDate?: string | null | undefined;
//     endDate?: string | null | undefined;
//   }>({
//     resolver: yupResolver(validationSchema),
//     defaultValues: {
//       versionValue: null,
//       startDate: null,
//       endDate: DateTime.now().toISO(),
//     },
//     context: {
//       isDashboardTrend: currentDashboard?.settings?.dashboardType === 'trend',
//     },
//   });

//   const versionValue = watch('versionValue');
//   const formattedVersionValue = versionValue ? DateTime.fromISO(versionValue).toFormat('yyyy-LL') : undefined;

//   const startDate = watch('startDate');
//   const startVersionValue = startDate ? DateTime.fromISO(startDate).toFormat('yyyy-LL') : undefined;

//   const endDate = watch('endDate');
//   const endVersionValue = endDate ? DateTime.fromISO(endDate).toFormat('yyyy-LL') : undefined;

//   useEffect(() => {
//     if (dashboards.length > 0) {
//       setGridColumns(dashboards.find((dashboard) => dashboard?._id === dashboardId)?.settings?.gridColumns || 2);
//     }
//   }, [dashboards, dashboardId]);

//   const hasErrors = useMemo(() => {
//     return !!errors.startDate || !!errors.endDate;
//   }, [errors.startDate, errors.endDate]);

//   useEffect(() => {
//     if (dashboardId) {
//       if (currentDashboard?.settings?.dashboardType === 'normal') {
//         dispatch(
//           fetchChartData({
//             dashboardId,
//             // versionValue: formattedVersionValue || "",
//             dashboardType: 'normal',
//             startVersionValue,
//             endVersionValue,
//             versionValue,
//             dashboardFilters,
//           })
//         );
//       } else if (
//         currentDashboard?.settings?.dashboardType === 'trend' &&
//         startVersionValue &&
//         endVersionValue &&
//         DateTime.fromISO(startVersionValue) < DateTime.fromISO(endVersionValue) &&
//         !hasErrors
//       ) {
//         dispatch(
//           fetchChartData({
//             dashboardId,
//             versionValue: undefined,
//             startVersionValue,
//             endVersionValue,
//             dashboardType: currentDashboard?.settings?.dashboardType,
//             dashboardFilters,
//           })
//         );
//       }
//     }
//   }, [
//     currentDashboard?.settings?.dashboardType,
//     dashboardId,
//     dispatch,
//     endVersionValue,
//     formattedVersionValue,
//     hasErrors,
//     startVersionValue,
//   ]);

//   useEffect(() => {
//     setIsEditMode(false);
//     if (location.state?.enableEditMode) {
//       setIsEditMode(true);
//     }
//   }, [location.state]);

//   useEffect(() => {
//     if (isEditMode && inputRef.current) {
//       inputRef.current.focus();
//     }
//   }, [isEditMode]);

//   useEffect(() => {
//     setEditedTitle(initialTitle);
//     setTitle(initialTitle);
//   }, [initialTitle]);

//   useEffect(() => {
//     if (currentDashboard?.widgetThemeId) {
//       setSelectedTheme(currentDashboard.widgetThemeId);
//       dispatch(fetchWidgetTheme(currentDashboard.widgetThemeId));
//     }
//   }, [currentDashboard?.widgetThemeId, dispatch]);

//   useEffect(() => {
//     dispatch(fetchThemeList());
//   }, [dispatch]);

//   useEffect(() => {
//     if (currentDashboard?.settings) {
//       setValue('versionValue', null);

//       const currentDate = DateTime.now();
//       setValue('endDate', currentDate.toISO());

//       if (currentDashboard.settings.dynamicVersionValue) {
//         const period = currentDashboard.settings.dynamicVersionValue;
//         let monthsToSubtract = 1;

//         switch (period) {
//           case '1m':
//             monthsToSubtract = 1;
//             break;
//           case '3m':
//             monthsToSubtract = 3;
//             break;
//           case '6m':
//             monthsToSubtract = 6;
//             break;
//           case '12m':
//             monthsToSubtract = 12;
//             break;
//         }

//         const startDate = currentDate.minus({ months: monthsToSubtract });
//         setValue('startDate', startDate.toISO());
//       } else {
//         setValue('startDate', currentDate.minus({ months: 1 }).toISO());
//       }
//     }
//   }, [currentDashboard?.settings, setValue]);

//   const handleGridColumns = (columns: number) => {
//     setGridColumns(columns);
//     postGridColumns.mutate({
//       url: `${POST.UPDATE_DASHBOARD}/${dashboardId}`,
//       payload: {
//         gridColumns: columns,
//       },
//     });
//   };

//   const handleEditModeToggle = async () => {
//     if (isEditMode) {
//       // Save title first if it has changed
//       if (editedTitle !== title) {
//         onTitleChange(editedTitle);
//         setTitle(editedTitle);
//       }

//       // Save temporary charts only if there are any
//       if (temporaryCharts.length > 0) {
//         try {
//           const result = await dispatch(
//             saveWidgets({
//               widgets: temporaryCharts.map((chart: TemporaryChart) => ({
//                 dashboardId: chart.dashboardId,
//                 widgetTypeId: chart.widgetTypeId?._id || '',
//                 name: chart.name,
//                 dimensions: chart.dimensions.join(','),
//                 groupBy: chart.groupBy,
//                 aggregation: chart.aggregation,
//                 position: chart.position,
//                 conditions: chart.conditions,
//                 dataSourceId: chart.dataSourceId?._id || '',
//                 entityId: chart.dataSourceId?.entityId || '',
//                 isIncremental: chart.isIncremental || false,
//               })),
//             })
//           ).unwrap();

//           if (result.success) {
//             toast.success('Charts saved successfully!');
//           } else {
//             toast.error(result.message || 'Failed to save charts');
//           }
//         } catch (error) {
//           if (typeof error === 'object' && error !== null && 'message' in error) {
//             toast.error(error.message as string);
//           } else {
//             toast.error('Failed to save charts');
//           }
//         }
//       }

//       setIsEditMode(false);
//     } else {
//       setIsEditMode(!isEditMode);
//     }
//   };

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter') {
//       onTitleChange(editedTitle);
//       setIsEditMode(false);
//     }
//   };

//   const handleCloseModal = () => {
//     setIsAddChartModalOpen(false);
//   };

//   const handleEditChart = (chart: ChartResponse) => {
//     setSelectedChart(chart);
//     setIsEditChartModalOpen(true);
//   };

//   const handleCloseEditModal = () => {
//     setIsEditChartModalOpen(false);
//     setSelectedChart(null);
//   };

//   const handleChartUpdate = async (formData: ChartFormData) => {
//     if (!selectedChart) return;

//     try {
//       const result = await dispatch(
//         updateWidget({
//           ...formData,
//           _id: selectedChart._id,
//           dashboardId: dashboardId || '',
//         })
//       ).unwrap();

//       if (result.success) {
//         toast.success('Chart updated successfully!');
//         handleCloseEditModal();

//         // Fetch updated chart data
//         if (dashboardId) {
//           dispatch(
//             fetchChartData({
//               dashboardId,
//               dashboardType: currentDashboard?.settings?.dashboardType || 'normal',
//               startVersionValue,
//               endVersionValue,
//               versionValue: formattedVersionValue || '',
//               dashboardFilters,
//             })
//           );
//         }
//       } else {
//         toast.error(result.message || 'Failed to update chart');
//       }
//     } catch (error) {
//       if (typeof error === 'object' && error !== null && 'message' in error) {
//         toast.error(error.message as string);
//       } else {
//         toast.error('Failed to update chart');
//       }
//     }
//   };

//   useEffect(() => {
//     if (startDate && endDate && currentDashboard?.settings?.dashboardType === 'trend') {
//       trigger('endDate');
//       trigger('startDate');
//     }
//   }, [startDate, endDate, currentDashboard?.settings?.dashboardType, trigger]);

//   const handleThemeChange = async (event: SelectChangeEvent<unknown>) => {
//     const themeId = event.target.value as string;
//     setSelectedTheme(themeId);

//     if (dashboardId) {
//       try {
//         const result = await dispatch(selectDashboardTheme({ dashboardId, widgetThemeId: themeId })).unwrap();

//         if (result.success) {
//           toast.success('Theme updated successfully!');
//           dispatch(fetchWidgetTheme(themeId));
//         } else {
//           toast.error(result.message || 'Failed to update theme');
//         }
//       } catch (error) {
//         if (typeof error === 'object' && error !== null && 'message' in error) {
//           toast.error(error.message as string);
//         } else {
//           toast.error('Failed to update theme');
//         }
//       }
//     }
//   };

//   return (
//     <Box
//       sx={{
//         height: '100%',
//         display: 'flex',
//         flexDirection: 'column',
//         overflow: 'hidden',
//       }}
//     >
//       <Box
//         sx={{
//           p: STYLE_GUIDE.SPACING.s6,
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'space-between',
//           flexShrink: 0,
//           gap: STYLE_GUIDE.SPACING.s4,
//           borderBottom: 1,
//           borderColor: 'divider',
//         }}
//       >
//         <Box sx={{ flex: 1, mr: STYLE_GUIDE.SPACING.s4 }}>
//           {isEditMode ? (
//             <TextField
//               inputRef={inputRef}
//               value={editedTitle}
//               onChange={(e) => setEditedTitle(e.target.value)}
//               onKeyDown={handleKeyPress}
//               size="small"
//               fullWidth
//               sx={{
//                 '& .MuiOutlinedInput-root': {
//                   borderRadius: STYLE_GUIDE.SPACING.s2,
//                   alignItems: 'flex-start',
//                   paddingRight: STYLE_GUIDE.SPACING.s2,
//                   fontSize: '14px',
//                   backgroundColor: theme.getDropdownBackground(),
//                   '& fieldset': { borderColor: theme.getInputBorderColor() },
//                   '&:hover fieldset': { borderColor: theme.border?.hover || STYLE_GUIDE.COLORS.darkBorderHover },
//                   '&.Mui-focused fieldset': {
//                     borderColor: theme.input?.focusBorder || STYLE_GUIDE.COLORS.inputFocusFallback,
//                   },
//                 },
//                 '& .MuiInputLabel-root': { color: theme.palette.text.secondary },
//                 '& .MuiInputLabel-root.Mui-focused': {
//                   color: theme.input?.focusBorder || STYLE_GUIDE.COLORS.inputFocusFallback,
//                 },
//                 '& .MuiInputBase-input': { color: `${theme.getInputTextColor()} !important` },
//                 '& .MuiInputBase-input::placeholder': { color: `${theme.palette.text.secondary} !important` },
//                 '& .MuiInputBase-input:-webkit-autofill': {
//                   WebkitTextFillColor: `${theme.getInputTextColor()} !important`,
//                   WebkitBoxShadow: `0 0 0 1000px ${theme.getDropdownBackground()} inset !important`,
//                 },
//               }}
//             />
//           ) : (
//             <Box sx={{ display: 'flex', gap: STYLE_GUIDE.SPACING.s4, alignItems: 'center' }}>
//               <Typography
//                 variant="h4"
//                 component="h1"
//                 sx={{
//                   ...getHeadingSx(),
//                   mr: STYLE_GUIDE.SPACING.s4,
//                   fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
//                 }}
//               >
//                 {title}
//               </Typography>
//               {!!currentDashboard?.settings?.dataSource?._id && (
//                 <>
//                   <ToggleButtonGroup
//                     value={statusToggle}
//                     exclusive
//                     onChange={handleStatusToggle}
//                     aria-label="status toggle"
//                     size="small"
//                   >
//                     <ToggleButton
//                       value="Pending"
//                       aria-label="pending"
//                       sx={{
//                         px: STYLE_GUIDE.SPACING.s6,
//                         color: theme.palette.text.primary,
//                         borderColor: theme.getInputBorderColor(),
//                         '&:hover': {
//                           borderColor: theme.border?.hover || STYLE_GUIDE.COLORS.darkBorderHover,
//                         },
//                         '&.Mui-selected': {
//                           backgroundColor: theme.palette.primary.main,
//                           color: theme.palette.primary.contrastText,
//                         },
//                       }}
//                     >
//                       PENDING
//                     </ToggleButton>
//                     <ToggleButton
//                       value="Completed"
//                       aria-label="completed"
//                       sx={{
//                         px: STYLE_GUIDE.SPACING.s6,
//                         color: theme.palette.text.primary,
//                         borderColor: theme.getInputBorderColor(),
//                         '&:hover': {
//                           borderColor: theme.border?.hover || STYLE_GUIDE.COLORS.darkBorderHover,
//                         },
//                         '&.Mui-selected': {
//                           backgroundColor: theme.palette.primary.main,
//                           color: theme.palette.primary.contrastText,
//                         },
//                       }}
//                     >
//                       COMPLETED
//                     </ToggleButton>
//                   </ToggleButtonGroup>
//                   {/* Date Range Picker */}
//                   <Box>
//                     <DatePicker
//                       onOpen={() => handleDateRangeFocus(true)}
//                       onClose={() => handleDateRangeFocus(false)}
//                       calendarPosition="top"
//                       value={dateRange}
//                       onChange={handleDateRangeChange}
//                       range
//                       placeholder="Select Date Range"
//                       numberOfMonths={2}
//                       showOtherDays
//                       inputClass="w-full"
//                       style={{
//                         width: '250px',
//                         padding: '10px 14px',
//                         fontSize: '16px',
//                         borderRadius: 4,
//                         background: theme.getDropdownBackground(),
//                         border: `1px solid ${
//                           isDateRangeFocused ? theme.input?.focusBorder || 'blue' : theme.getInputBorderColor()
//                         }`,
//                         color: theme.getInputTextColor(),
//                         outline: 'none',
//                       }}
//                     />
//                   </Box>
//                 </>
//               )}
//             </Box>
//           )}
//         </Box>

//         <Box sx={{ mr: STYLE_GUIDE.SPACING.s4 }}>
//           {isEditMode ? (
//             <StyledSelect
//               label="Theme"
//               value={selectedTheme}
//               onChange={handleThemeChange}
//               size="small"
//               sx={{ minWidth: 200 }}
//             >
//               {themes?.map((theme) => (
//                 <MenuItem key={theme._id} value={theme._id}>
//                   {theme.name}
//                 </MenuItem>
//               ))}
//             </StyledSelect>
//           ) : null}
//         </Box>

//         <Box sx={{ display: 'flex', gap: STYLE_GUIDE.SPACING.s4 }}>
//           {isEditMode ? (
//             <>
//               <ButtonGroup variant="outlined" aria-label="grid columns" size="small">
//                 <Button
//                   onClick={() => handleGridColumns(1)}
//                   variant={gridColumns === 1 ? 'contained' : 'outlined'}
//                   sx={{ px: STYLE_GUIDE.SPACING.s6 }}
//                 >
//                   <SquareIcon />
//                 </Button>
//                 <Button
//                   onClick={() => handleGridColumns(2)}
//                   variant={gridColumns === 2 ? 'contained' : 'outlined'}
//                   sx={{ px: STYLE_GUIDE.SPACING.s6 }}
//                 >
//                   <PauseIcon />
//                 </Button>
//                 <Button
//                   onClick={() => handleGridColumns(3)}
//                   variant={gridColumns === 3 ? 'contained' : 'outlined'}
//                   sx={{ px: STYLE_GUIDE.SPACING.s6 }}
//                 >
//                   <ViewColumnIcon />
//                 </Button>
//               </ButtonGroup>
//               <Button
//                 variant="contained"
//                 color="primary"
//                 startIcon={<AddIcon />}
//                 onClick={() => setIsAddChartModalOpen(true)}
//                 sx={{ ...getButtonSx(), px: STYLE_GUIDE.SPACING.s6 }}
//               >
//                 Add Chart
//               </Button>
//               <Button
//                 onClick={handleEditModeToggle}
//                 color="success"
//                 variant="contained"
//                 startIcon={<DoneIcon />}
//                 sx={{ ...getButtonSx(), px: STYLE_GUIDE.SPACING.s6 }}
//               >
//                 Save
//               </Button>
//             </>
//           ) : (
//             <>
//               {!!currentDashboard?.settings?.dataSource?._id && (
//                 <Button
//                   onClick={handleOpenFiltersModal}
//                   color="secondary"
//                   variant="outlined"
//                   startIcon={<GridFilterListIcon />}
//                   sx={{
//                     ...getButtonSx(),
//                     borderColor: theme.getInputBorderColor(),
//                     color: theme.palette.text.primary,
//                     '&:hover': {
//                       borderColor: theme.border?.hover || STYLE_GUIDE.COLORS.darkBorderHover,
//                     },
//                   }}
//                 >
//                   Filters
//                 </Button>
//               )}
//               <Box>
//                 {currentDashboard?.settings?.dashboardType === 'normal' ? (
//                   <Box>
//                     <CommonDatePicker
//                       name="versionValue"
//                       control={control}
//                       views={['year', 'month']}
//                       label="Period"
//                       rules={{ required: 'Period is required' }}
//                       sx={{
//                         '& .MuiInputBase-input': {
//                           py: 1.1,
//                         },
//                         '& .MuiFormLabel-root': {
//                           top: '-6px',
//                         },
//                       }}
//                     />
//                   </Box>
//                 ) : currentDashboard?.settings?.dashboardType === 'trend' ? (
//                   <Stack direction="row" spacing={STYLE_GUIDE.SPACING.s6}>
//                     <CommonDatePicker
//                       name="startDate"
//                       control={control}
//                       views={['year', 'month']}
//                       label="Start Date"
//                       rules={{ required: 'Start date is required' }}
//                       sx={{
//                         '& .MuiInputBase-input': {
//                           py: 1.1,
//                         },
//                       }}
//                     />

//                     <CommonDatePicker
//                       name="endDate"
//                       control={control}
//                       views={['year', 'month']}
//                       label="End Date"
//                       rules={{ required: 'End date is required' }}
//                       sx={{
//                         '& .MuiInputBase-input': {
//                           py: 1.1,
//                         },
//                       }}
//                     />
//                   </Stack>
//                 ) : null}
//               </Box>
//               <Button
//                 onClick={handleEditModeToggle}
//                 color="primary"
//                 variant="contained"
//                 startIcon={<EditIcon />}
//                 sx={{ ...getButtonSx() }}
//               >
//                 Edit
//               </Button>
//             </>
//           )}
//         </Box>
//       </Box>

//       <Box
//         sx={{
//           display: 'flex',
//           flex: 1,
//           overflow: 'hidden',
//           gap: STYLE_GUIDE.SPACING.s6,
//           height: 'calc(100% - 100px)',
//         }}
//       >
//         <Box
//           sx={{
//             flex: 1,
//             overflow: 'auto',
//             display: 'grid',
//             gridTemplateColumns: {
//               xs: '1fr',
//               sm: 'repeat(auto-fit, minmax(400px, 1fr))',
//               md: 'repeat(auto-fit, minmax(450px, 1fr))',
//               lg: 'repeat(auto-fit, minmax(500px, 1fr))',
//             },
//             gap: STYLE_GUIDE.SPACING.s4,
//             p: STYLE_GUIDE.SPACING.s4,

//             transition: 'all 0.3s ease',
//             ...((isAddChartModalOpen || isEditChartModalOpen) && {
//               flex: '1 1 70%',
//             }),
//             '&::-webkit-scrollbar': {
//               width: '8px',
//               height: '8px',
//             },
//             '&::-webkit-scrollbar-thumb': {
//               backgroundColor: 'rgba(0, 0, 0, 0.1)',
//               borderRadius: '4px',
//             },
//             '&::-webkit-scrollbar-track': {
//               backgroundColor: 'transparent',
//             },
//           }}
//         >
//           {dashboardId && (
//             <ChartGrid
//               dashboardId={dashboardId}
//               isEditMode={isEditMode}
//               onEditChart={handleEditChart}
//               isAddChartModalOpen={isAddChartModalOpen}
//               isEditChartModalOpen={isEditChartModalOpen}
//               gridColumns={gridColumns}
//               currentDashboard={currentDashboard as Dashboard}
//               startVersionValue={currentDashboard?.settings?.dashboardType === 'normal' ? '' : startVersionValue || ''}
//               endVersionValue={currentDashboard?.settings?.dashboardType === 'normal' ? '' : endVersionValue || ''}
//               versionValue={versionValue || ''}
//               isTrend={currentDashboard?.settings?.dashboardType === 'trend'}
//               dashboardFilters={dashboardFilters}
//             />
//           )}
//         </Box>

//         {(isAddChartModalOpen || isEditChartModalOpen) && (
//           <Box
//             sx={{
//               width: {
//                 xs: '100%',
//                 sm: '400px',
//                 md: '450px',
//                 lg: '500px',
//               },
//               flexShrink: 0,
//               display: 'flex',
//               flexDirection: 'column',
//               borderLeft: '1px solid',
//               borderColor: 'divider',
//               overflow: 'hidden',
//               height: '100%',
//             }}
//           >
//             {isAddChartModalOpen && (
//               <AddChartModal
//                 open={isAddChartModalOpen}
//                 onClose={handleCloseModal}
//                 isSubmitting={false}
//                 dashboardId={dashboardId || ''}
//                 isTrend={currentDashboard?.settings?.dashboardType === 'trend'}
//                 currentDashboard={currentDashboard}
//                 startVersionValue={startVersionValue}
//                 endVersionValue={endVersionValue}
//                 versionValue={formattedVersionValue}
//               />
//             )}
//             {isEditChartModalOpen && selectedChart && (
//               <AddChartModal
//                 open={isEditChartModalOpen}
//                 onClose={handleCloseEditModal}
//                 isSubmitting={false}
//                 dashboardId={dashboardId || ''}
//                 initialData={selectedChart}
//                 onSave={handleChartUpdate}
//                 isTrend={currentDashboard?.settings?.dashboardType === 'trend'}
//                 currentDashboard={currentDashboard}
//                 startVersionValue={startVersionValue}
//                 endVersionValue={endVersionValue}
//                 versionValue={formattedVersionValue}
//               />
//             )}
//           </Box>
//         )}
//       </Box>
//       {!!currentDashboard?.settings?.dataSource?._id && (
//         <NotivixFiltersModal
//           open={isFiltersModalOpen}
//           onClose={handleCloseFiltersModal}
//           onApplyFilters={handleApplyFilters}
//           // currentFilters={currentFilters}
//           dataSourceId={currentDashboard?.settings?.dataSource?._id} // Pass your dataSourceId here
//           filterFlag="isFilterEnable" // Specify which flag to use for filtering
//           isLoading={dataSourceDetailsLoading}
//         />
//       )}
//     </Box>
//   );
// };

// import React, { useState, useRef, useEffect, useMemo } from 'react';
// import { Box, Typography, TextField, Button, ButtonGroup, Stack, MenuItem, SelectChangeEvent } from '@mui/material';
// import StyledSelect from '../../../components/atom/common/StyledSelect';
// import AddIcon from '@mui/icons-material/Add';
// import EditIcon from '@mui/icons-material/Edit';
// import DoneIcon from '@mui/icons-material/Done';
// import PauseIcon from '@mui/icons-material/Pause';
// import ViewColumnIcon from '@mui/icons-material/ViewColumn';
// import SquareIcon from '@mui/icons-material/Square';
// import { useParams, useLocation } from 'react-router-dom';
// import { ChartGrid } from './ChartGrid';
// import { AddChartModal, ChartFormData } from './AddChartModal';
// import { useAppDispatch, useAppSelector } from '../../../storeHooks';
// import { updateWidget, saveWidgets, fetchWidgetTheme, fetchChartData, selectDashboardTheme } from '../dashboardActions';
// import { toast } from 'react-toastify';
// import { ChartResponse, TemporaryChart, Dashboard } from '../types';
// import usePost from '../../../hooks/usePost';
// import { POST } from '../../../services/apiRoutes';
// import CommonDatePicker from '../../../components/common/datePicker/datePicker';
// import { useForm } from 'react-hook-form';
// import { DateTime } from 'luxon';
// import { yupResolver } from '@hookform/resolvers/yup';
// import * as yup from 'yup';
// import { fetchThemeList } from '../../createTheme/themeActions';
// import { STYLE_GUIDE } from '../../../styles';
// import { useUnifiedTheme } from '../../../hooks/useUnifiedTheme';
// import { useComponentTypography } from '../../../hooks/useComponentTypography';
// import NotivixFiltersModal from '../../notivixDashboard/components/NotivixFiltersModal';
// import { GridFilterListIcon } from '@mui/x-data-grid';
// import { ToggleButton, ToggleButtonGroup } from '@mui/material';
// import DatePicker, { Calendar, DateObject } from 'react-multi-date-picker';

// interface DashboardViewProps {
//   title: string;
//   onTitleChange: (newTitle: string) => void;
// }

// export const DashboardView: React.FC<DashboardViewProps> = ({ title: initialTitle, onTitleChange }): JSX.Element => {
//   const theme = useUnifiedTheme();
//   const { getHeadingSx, getButtonSx } = useComponentTypography();
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [editedTitle, setEditedTitle] = useState(initialTitle);
//   const [title, setTitle] = useState(initialTitle);
//   const [isAddChartModalOpen, setIsAddChartModalOpen] = useState(false);
//   const [isEditChartModalOpen, setIsEditChartModalOpen] = useState(false);
//   const [selectedChart, setSelectedChart] = useState<ChartResponse | null>(null);
//   const [gridColumns, setGridColumns] = useState(2);
//   const [selectedTheme, setSelectedTheme] = useState<string>('');

//   const inputRef = useRef<HTMLInputElement>(null);
//   const { id: dashboardId } = useParams();
//   const location = useLocation();
//   const dispatch = useAppDispatch();
//   const temporaryCharts = useAppSelector((state) => state.dashboard.temporaryCharts);
//   const dashboards = useAppSelector((state) => state.dashboard.dashboards);
//   const currentDashboard = dashboards.find((d) => d._id === dashboardId);
//   const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
//   const [dashboardFilters, setDashboardFilters] = useState<any>({});
//   const { dataSourceDetails, dataSourceDetailsLoading } = useAppSelector((state) => state.notivixDashboard);
//   const [statusToggle, setStatusToggle] = useState<'Pending' | 'Completed'>('Pending');
//   const [dateRange, setDateRange] = useState<DateObject[] | null>(null);
//   const [isDateRangeFocused, setIsDateRangeFocused] = useState(false);
//   const { themes } = useAppSelector((state) => state.theme);

//   const postGridColumns = usePost(['']);

//   useEffect(() => {
//     if (!!currentDashboard?.settings?.dataSource?._id) {
//       setDashboardFilters((prev) => {
//         if (statusToggle === 'Pending') {
//           const today = new DateObject(); // Current date
//           const thirtyDaysAfter = new DateObject().add(1, 'month');
//           setDateRange([today, thirtyDaysAfter]);
//           return {
//             ...prev,
//             DueDate: { startDate: today.format('YYYY-MM-DD'), endDate: thirtyDaysAfter.format('YYYY-MM-DD') },
//             'Derived.Case Status': statusToggle,
//           };
//         } else if (statusToggle === 'Completed') {
//           const today = new DateObject(); // Current date
//           const thirtyDaysAgo = new DateObject().subtract(1, 'month');

//           setDateRange([thirtyDaysAgo, today]);
//           return {
//             ...prev,
//             DateTaken: { startDate: thirtyDaysAgo.format('YYYY-MM-DD'), endDate: today.format('YYYY-MM-DD') },
//             'Derived.Case Status': statusToggle,
//           };
//         }
//         return { ...prev, 'Derived.Case Status': statusToggle };
//       });
//     }
//   }, [currentDashboard?.settings?.dataSource?._id]);

//   const handleOpenFiltersModal = async () => {
//     if (currentDashboard?.settings?.dataSource?._id) {
//       try {
//         setIsFiltersModalOpen(true);
//       } catch (error) {
//         toast.error('Failed to load filters. Please try again.');
//       }
//     } else {
//       setIsFiltersModalOpen(true);
//     }
//   };

//   const handleStatusToggle = (event: React.MouseEvent<HTMLElement>, newStatus: 'Pending' | 'Completed' | null) => {
//     if (newStatus !== null) {
//       setStatusToggle(newStatus);
//       setDashboardFilters((prev) => {
//         const { DueDate, DateTaken, ...rest } = prev;
//         if (newStatus === 'Pending') {
//           const today = new DateObject(); // Current date
//           const thirtyDaysAfter = new DateObject().add(1, 'month');
//           setDateRange([today, thirtyDaysAfter]);

//           return {
//             ...rest,
//             DueDate: { startDate: today.format('YYYY-MM-DD'), endDate: thirtyDaysAfter.format('YYYY-MM-DD') },
//             'Derived.Case Status': newStatus,
//           };
//         } else if (newStatus === 'Completed') {
//           const today = new DateObject(); // Current date
//           const thirtyDaysAgo = new DateObject().subtract(1, 'month');

//           setDateRange([thirtyDaysAgo, today]);
//           return {
//             ...rest,
//             DateTaken: { startDate: thirtyDaysAgo.format('YYYY-MM-DD'), endDate: today.format('YYYY-MM-DD') },
//             'Derived.Case Status': newStatus,
//           };
//         }
//         return { ...rest, 'Derived.Case Status': newStatus };
//       });
//     }
//   };

//   const handleDateRangeChange = (dateRange: DateObject[] | DateObject | null) => {
//     const range = Array.isArray(dateRange) ? dateRange : dateRange ? [dateRange] : null;
//     setDateRange(range);

//     if (range && range.length === 2) {
//       const startDate = range[0].format('YYYY-MM-DD');
//       const endDate = range[1].format('YYYY-MM-DD');
//       setDashboardFilters((prev) => {
//         const { DueDate, DateTaken, ...rest } = prev;
//         if (statusToggle === 'Pending') {
//           return {
//             ...rest,
//             DueDate: {
//               startDate,
//               endDate,
//             },
//           };
//         } else if (statusToggle === 'Completed' && DateTaken) {
//           return {
//             ...rest,
//             DateTaken: {
//               startDate,
//               endDate,
//             },
//           };
//         }
//         return { ...rest };
//       });
//     }
//   };
//   const handleDateRangeFocus = (focused: boolean) => {
//     setIsDateRangeFocused(focused);
//   };

//   const handleCloseFiltersModal = () => {
//     setIsFiltersModalOpen(false);
//   };
//   const handleApplyFilters = async (filters: any) => {
//     setDashboardFilters(filters);
//     setStatusToggle(filters['Derived.Case Status'] ? filters['Derived.Case Status'] : 'Pending');

//     // Fix: Use DateObject instead of Date
//     if (filters['DueDate'] && filters['DueDate'].startDate && filters['DueDate'].endDate) {
//       setDateRange([new DateObject(filters['DueDate'].startDate), new DateObject(filters['DueDate'].endDate)]);
//     } else {
//       // Clear date range if no date filter is applied
//       setDateRange(null);
//     }
//   };
//   const validationSchema = yup.object({
//     versionValue: yup.string().nullable().optional(),
//     startDate: yup
//       .string()
//       .nullable()
//       .when('$isDashboardTrend', ([isDashboardTrend]) => {
//         if (isDashboardTrend) {
//           return yup.string().nullable().required('Start date is required');
//         }
//         return yup.string().nullable().optional();
//       }),
//     endDate: yup
//       .string()
//       .nullable()
//       .when(['$isDashboardTrend', 'startDate'], ([isDashboardTrend, startDate]) => {
//         if (isDashboardTrend && startDate) {
//           return yup
//             .string()
//             .nullable()
//             .required('End date is required')
//             .test('is-after-start', 'End date must be after or equal to start date', function (value) {
//               const { startDate } = this.parent;
//               if (!value || !startDate) return true;

//               try {
//                 const startDateTime = DateTime.fromISO(startDate);
//                 const endDateTime = DateTime.fromISO(value);
//                 return endDateTime >= startDateTime;
//               } catch {
//                 return false;
//               }
//             });
//         }
//         return yup.string().nullable().optional();
//       }),
//   });

//   const {
//     control,
//     watch,
//     setValue,
//     formState: { errors },
//     trigger,
//   } = useForm<{
//     versionValue?: string | null | undefined;
//     startDate?: string | null | undefined;
//     endDate?: string | null | undefined;
//   }>({
//     resolver: yupResolver(validationSchema),
//     defaultValues: {
//       versionValue: null,
//       startDate: null,
//       endDate: DateTime.now().toISO(),
//     },
//     context: {
//       isDashboardTrend: currentDashboard?.settings?.dashboardType === 'trend',
//     },
//   });

//   const versionValue = watch('versionValue');
//   const formattedVersionValue = versionValue ? DateTime.fromISO(versionValue).toFormat('yyyy-LL') : undefined;

//   const startDate = watch('startDate');
//   const startVersionValue = startDate ? DateTime.fromISO(startDate).toFormat('yyyy-LL') : undefined;

//   const endDate = watch('endDate');
//   const endVersionValue = endDate ? DateTime.fromISO(endDate).toFormat('yyyy-LL') : undefined;

//   useEffect(() => {
//     if (dashboards.length > 0) {
//       setGridColumns(dashboards.find((dashboard) => dashboard?._id === dashboardId)?.settings?.gridColumns || 2);
//     }
//   }, [dashboards, dashboardId]);

//   const hasErrors = useMemo(() => {
//     return !!errors.startDate || !!errors.endDate;
//   }, [errors.startDate, errors.endDate]);

//   useEffect(() => {
//     if (dashboardId) {
//       if (currentDashboard?.settings?.dashboardType === 'normal') {
//         dispatch(
//           fetchChartData({
//             dashboardId,
//             // versionValue: formattedVersionValue || "",
//             dashboardType: 'normal',
//             startVersionValue,
//             endVersionValue,
//             versionValue,
//             dashboardFilters,
//           })
//         );
//       } else if (
//         currentDashboard?.settings?.dashboardType === 'trend' &&
//         startVersionValue &&
//         endVersionValue &&
//         DateTime.fromISO(startVersionValue) < DateTime.fromISO(endVersionValue) &&
//         !hasErrors
//       ) {
//         dispatch(
//           fetchChartData({
//             dashboardId,
//             versionValue: undefined,
//             startVersionValue,
//             endVersionValue,
//             dashboardType: currentDashboard?.settings?.dashboardType,
//             dashboardFilters,
//           })
//         );
//       }
//     }
//   }, [
//     currentDashboard?.settings?.dashboardType,
//     dashboardId,
//     dispatch,
//     endVersionValue,
//     formattedVersionValue,
//     hasErrors,
//     startVersionValue,
//   ]);

//   useEffect(() => {
//     setIsEditMode(false);
//     if (location.state?.enableEditMode) {
//       setIsEditMode(true);
//     }
//   }, [location.state]);

//   useEffect(() => {
//     if (isEditMode && inputRef.current) {
//       inputRef.current.focus();
//     }
//   }, [isEditMode]);

//   useEffect(() => {
//     setEditedTitle(initialTitle);
//     setTitle(initialTitle);
//   }, [initialTitle]);

//   useEffect(() => {
//     if (currentDashboard?.widgetThemeId) {
//       setSelectedTheme(currentDashboard.widgetThemeId);
//       dispatch(fetchWidgetTheme(currentDashboard.widgetThemeId));
//     }
//   }, [currentDashboard?.widgetThemeId, dispatch]);

//   useEffect(() => {
//     dispatch(fetchThemeList());
//   }, [dispatch]);

//   useEffect(() => {
//     if (currentDashboard?.settings) {
//       setValue('versionValue', null);

//       const currentDate = DateTime.now();
//       setValue('endDate', currentDate.toISO());

//       if (currentDashboard.settings.dynamicVersionValue) {
//         const period = currentDashboard.settings.dynamicVersionValue;
//         let monthsToSubtract = 1;

//         switch (period) {
//           case '1m':
//             monthsToSubtract = 1;
//             break;
//           case '3m':
//             monthsToSubtract = 3;
//             break;
//           case '6m':
//             monthsToSubtract = 6;
//             break;
//           case '12m':
//             monthsToSubtract = 12;
//             break;
//         }

//         const startDate = currentDate.minus({ months: monthsToSubtract });
//         setValue('startDate', startDate.toISO());
//       } else {
//         setValue('startDate', currentDate.minus({ months: 1 }).toISO());
//       }
//     }
//   }, [currentDashboard?.settings, setValue]);

//   const handleGridColumns = (columns: number) => {
//     setGridColumns(columns);
//     postGridColumns.mutate({
//       url: `${POST.UPDATE_DASHBOARD}/${dashboardId}`,
//       payload: {
//         gridColumns: columns,
//       },
//     });
//   };

//   const handleEditModeToggle = async () => {
//     if (isEditMode) {
//       // Save title first if it has changed
//       if (editedTitle !== title) {
//         onTitleChange(editedTitle);
//         setTitle(editedTitle);
//       }

//       // Save temporary charts only if there are any
//       if (temporaryCharts.length > 0) {
//         try {
//           const result = await dispatch(
//             saveWidgets({
//               widgets: temporaryCharts.map((chart: TemporaryChart) => ({
//                 dashboardId: chart.dashboardId,
//                 widgetTypeId: chart.widgetTypeId?._id || '',
//                 name: chart.name,
//                 dimensions: chart.dimensions.join(','),
//                 groupBy: chart.groupBy,
//                 aggregation: chart.aggregation,
//                 position: chart.position,
//                 conditions: chart.conditions,
//                 dataSourceId: chart.dataSourceId?._id || '',
//                 entityId: chart.dataSourceId?.entityId || '',
//                 isIncremental: chart.isIncremental || false,
//               })),
//             })
//           ).unwrap();

//           if (result.success) {
//             toast.success('Charts saved successfully!');
//           } else {
//             toast.error(result.message || 'Failed to save charts');
//           }
//         } catch (error) {
//           if (typeof error === 'object' && error !== null && 'message' in error) {
//             toast.error(error.message as string);
//           } else {
//             toast.error('Failed to save charts');
//           }
//         }
//       }

//       setIsEditMode(false);
//     } else {
//       setIsEditMode(!isEditMode);
//     }
//   };

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter') {
//       onTitleChange(editedTitle);
//       setIsEditMode(false);
//     }
//   };

//   const handleCloseModal = () => {
//     setIsAddChartModalOpen(false);
//   };

//   const handleEditChart = (chart: ChartResponse) => {
//     setSelectedChart(chart);
//     setIsEditChartModalOpen(true);
//   };

//   const handleCloseEditModal = () => {
//     setIsEditChartModalOpen(false);
//     setSelectedChart(null);
//   };

//   const handleChartUpdate = async (formData: ChartFormData) => {
//     if (!selectedChart) return;

//     try {
//       const result = await dispatch(
//         updateWidget({
//           ...formData,
//           _id: selectedChart._id,
//           dashboardId: dashboardId || '',
//         })
//       ).unwrap();

//       if (result.success) {
//         toast.success('Chart updated successfully!');
//         handleCloseEditModal();

//         // Fetch updated chart data
//         if (dashboardId) {
//           dispatch(
//             fetchChartData({
//               dashboardId,
//               dashboardType: currentDashboard?.settings?.dashboardType || 'normal',
//               startVersionValue,
//               endVersionValue,
//               versionValue: formattedVersionValue || '',
//               dashboardFilters,
//             })
//           );
//         }
//       } else {
//         toast.error(result.message || 'Failed to update chart');
//       }
//     } catch (error) {
//       if (typeof error === 'object' && error !== null && 'message' in error) {
//         toast.error(error.message as string);
//       } else {
//         toast.error('Failed to update chart');
//       }
//     }
//   };

//   useEffect(() => {
//     if (startDate && endDate && currentDashboard?.settings?.dashboardType === 'trend') {
//       trigger('endDate');
//       trigger('startDate');
//     }
//   }, [startDate, endDate, currentDashboard?.settings?.dashboardType, trigger]);

//   const handleThemeChange = async (event: SelectChangeEvent<unknown>) => {
//     const themeId = event.target.value as string;
//     setSelectedTheme(themeId);

//     if (dashboardId) {
//       try {
//         const result = await dispatch(selectDashboardTheme({ dashboardId, widgetThemeId: themeId })).unwrap();

//         if (result.success) {
//           toast.success('Theme updated successfully!');
//           dispatch(fetchWidgetTheme(themeId));
//         } else {
//           toast.error(result.message || 'Failed to update theme');
//         }
//       } catch (error) {
//         if (typeof error === 'object' && error !== null && 'message' in error) {
//           toast.error(error.message as string);
//         } else {
//           toast.error('Failed to update theme');
//         }
//       }
//     }
//   };

//   return (
//     <Box
//       sx={{
//         height: '100%',
//         display: 'flex',
//         flexDirection: 'column',
//         overflow: 'hidden',
//       }}
//     >
//       <Box
//         sx={{
//           p: STYLE_GUIDE.SPACING.s6,
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'space-between',
//           flexShrink: 0,
//           gap: STYLE_GUIDE.SPACING.s4,
//           borderBottom: 1,
//           borderColor: 'divider',
//         }}
//       >
//         <Box sx={{ flex: 1, mr: STYLE_GUIDE.SPACING.s4 }}>
//           {isEditMode ? (
//             <TextField
//               inputRef={inputRef}
//               value={editedTitle}
//               onChange={(e) => setEditedTitle(e.target.value)}
//               onKeyDown={handleKeyPress}
//               size="small"
//               fullWidth
//               sx={{
//                 '& .MuiOutlinedInput-root': {
//                   borderRadius: STYLE_GUIDE.SPACING.s2,
//                   alignItems: 'flex-start',
//                   paddingRight: STYLE_GUIDE.SPACING.s2,
//                   fontSize: '14px',
//                   backgroundColor: theme.getDropdownBackground(),
//                   '& fieldset': { borderColor: theme.getInputBorderColor() },
//                   '&:hover fieldset': { borderColor: theme.border?.hover || STYLE_GUIDE.COLORS.darkBorderHover },
//                   '&.Mui-focused fieldset': {
//                     borderColor: theme.input?.focusBorder || STYLE_GUIDE.COLORS.inputFocusFallback,
//                   },
//                 },
//                 '& .MuiInputLabel-root': { color: theme.palette.text.secondary },
//                 '& .MuiInputLabel-root.Mui-focused': {
//                   color: theme.input?.focusBorder || STYLE_GUIDE.COLORS.inputFocusFallback,
//                 },
//                 '& .MuiInputBase-input': { color: `${theme.getInputTextColor()} !important` },
//                 '& .MuiInputBase-input::placeholder': { color: `${theme.palette.text.secondary} !important` },
//                 '& .MuiInputBase-input:-webkit-autofill': {
//                   WebkitTextFillColor: `${theme.getInputTextColor()} !important`,
//                   WebkitBoxShadow: `0 0 0 1000px ${theme.getDropdownBackground()} inset !important`,
//                 },
//               }}
//             />
//           ) : (
//             <Box sx={{ display: 'flex', gap: STYLE_GUIDE.SPACING.s4, alignItems: 'center' }}>
//               <Typography
//                 variant="h4"
//                 component="h1"
//                 sx={{
//                   ...getHeadingSx(),
//                   mr: STYLE_GUIDE.SPACING.s4,
//                   fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
//                 }}
//               >
//                 {title}
//               </Typography>
//               {!!currentDashboard?.settings?.dataSource?._id && (
//                 <>
//                   <ToggleButtonGroup
//                     value={statusToggle}
//                     exclusive
//                     onChange={handleStatusToggle}
//                     aria-label="status toggle"
//                     size="small"
//                   >
//                     <ToggleButton
//                       value="Pending"
//                       aria-label="pending"
//                       sx={{
//                         px: STYLE_GUIDE.SPACING.s6,
//                         color: theme.palette.text.primary,
//                         borderColor: theme.getInputBorderColor(),
//                         '&:hover': {
//                           borderColor: theme.border?.hover || STYLE_GUIDE.COLORS.darkBorderHover,
//                         },
//                         '&.Mui-selected': {
//                           backgroundColor: theme.palette.primary.main,
//                           color: theme.palette.primary.contrastText,
//                         },
//                       }}
//                     >
//                       PENDING
//                     </ToggleButton>
//                     <ToggleButton
//                       value="Completed"
//                       aria-label="completed"
//                       sx={{
//                         px: STYLE_GUIDE.SPACING.s6,
//                         color: theme.palette.text.primary,
//                         borderColor: theme.getInputBorderColor(),
//                         '&:hover': {
//                           borderColor: theme.border?.hover || STYLE_GUIDE.COLORS.darkBorderHover,
//                         },
//                         '&.Mui-selected': {
//                           backgroundColor: theme.palette.primary.main,
//                           color: theme.palette.primary.contrastText,
//                         },
//                       }}
//                     >
//                       COMPLETED
//                     </ToggleButton>
//                   </ToggleButtonGroup>
//                   {/* Date Range Picker */}
//                   <Box sx={{ position: 'relative', display: 'inline-block' }}>
//                     <DatePicker
//                       onOpen={() => handleDateRangeFocus(true)}
//                       onClose={() => handleDateRangeFocus(false)}
//                       calendarPosition="top"
//                       value={dateRange}
//                       onChange={handleDateRangeChange}
//                       range
//                       placeholder="Select Date Range"
//                       numberOfMonths={2}
//                       showOtherDays
//                       inputClass="w-full"
//                       style={{
//                         width: '250px',
//                         padding: '10px 14px',
//                         fontSize: '16px',
//                         borderRadius: 4,
//                         background: theme.getDropdownBackground(),
//                         border: `1px solid ${
//                           isDateRangeFocused ? theme.input?.focusBorder || 'blue' : theme.getInputBorderColor()
//                         }`,
//                         color: theme.getInputTextColor(),
//                         outline: 'none',
//                       }}
//                     />
//                     {dateRange && dateRange.length > 0 && (
//                       <Button
//                         onClick={() => {
//                           setDateRange(null);
//                           setDashboardFilters((prev) => {
//                             const { DueDate, ...rest } = prev;
//                             return rest;
//                           });
//                         }}
//                         size="small"
//                         sx={{
//                           position: 'absolute',
//                           right: '8px',
//                           top: '50%',
//                           transform: 'translateY(-50%)',
//                           minWidth: 'auto',
//                           padding: '4px',
//                           color: theme.palette.text.secondary,
//                           '&:hover': {
//                             backgroundColor: 'rgba(0, 0, 0, 0.04)',
//                           },
//                         }}
//                       >
//                         ✕
//                       </Button>
//                     )}
//                   </Box>
//                 </>
//               )}
//             </Box>
//           )}
//         </Box>

//         <Box sx={{ mr: STYLE_GUIDE.SPACING.s4 }}>
//           {isEditMode ? (
//             <StyledSelect
//               label="Theme"
//               value={selectedTheme}
//               onChange={handleThemeChange}
//               size="small"
//               sx={{ minWidth: 200 }}
//             >
//               {themes?.map((theme) => (
//                 <MenuItem key={theme._id} value={theme._id}>
//                   {theme.name}
//                 </MenuItem>
//               ))}
//             </StyledSelect>
//           ) : null}
//         </Box>

//         <Box sx={{ display: 'flex', gap: STYLE_GUIDE.SPACING.s4 }}>
//           {isEditMode ? (
//             <>
//               <ButtonGroup variant="outlined" aria-label="grid columns" size="small">
//                 <Button
//                   onClick={() => handleGridColumns(1)}
//                   variant={gridColumns === 1 ? 'contained' : 'outlined'}
//                   sx={{ px: STYLE_GUIDE.SPACING.s6 }}
//                 >
//                   <SquareIcon />
//                 </Button>
//                 <Button
//                   onClick={() => handleGridColumns(2)}
//                   variant={gridColumns === 2 ? 'contained' : 'outlined'}
//                   sx={{ px: STYLE_GUIDE.SPACING.s6 }}
//                 >
//                   <PauseIcon />
//                 </Button>
//                 <Button
//                   onClick={() => handleGridColumns(3)}
//                   variant={gridColumns === 3 ? 'contained' : 'outlined'}
//                   sx={{ px: STYLE_GUIDE.SPACING.s6 }}
//                 >
//                   <ViewColumnIcon />
//                 </Button>
//               </ButtonGroup>
//               <Button
//                 variant="contained"
//                 color="primary"
//                 startIcon={<AddIcon />}
//                 onClick={() => setIsAddChartModalOpen(true)}
//                 sx={{ ...getButtonSx(), px: STYLE_GUIDE.SPACING.s6 }}
//               >
//                 Add Chart
//               </Button>
//               <Button
//                 onClick={handleEditModeToggle}
//                 color="success"
//                 variant="contained"
//                 startIcon={<DoneIcon />}
//                 sx={{ ...getButtonSx(), px: STYLE_GUIDE.SPACING.s6 }}
//               >
//                 Save
//               </Button>
//             </>
//           ) : (
//             <>
//               {!!currentDashboard?.settings?.dataSource?._id && (
//                 <Button
//                   onClick={handleOpenFiltersModal}
//                   color="secondary"
//                   variant="outlined"
//                   startIcon={<GridFilterListIcon />}
//                   sx={{
//                     ...getButtonSx(),
//                     borderColor: theme.getInputBorderColor(),
//                     color: theme.palette.text.primary,
//                     '&:hover': {
//                       borderColor: theme.border?.hover || STYLE_GUIDE.COLORS.darkBorderHover,
//                     },
//                   }}
//                 >
//                   Filters
//                 </Button>
//               )}
//               <Box>
//                 {currentDashboard?.settings?.dashboardType === 'normal' ? (
//                   <Box>
//                     <CommonDatePicker
//                       name="versionValue"
//                       control={control}
//                       views={['year', 'month']}
//                       label="Period"
//                       rules={{ required: 'Period is required' }}
//                       sx={{
//                         '& .MuiInputBase-input': {
//                           py: 1.1,
//                         },
//                         '& .MuiFormLabel-root': {
//                           top: '-6px',
//                         },
//                       }}
//                     />
//                   </Box>
//                 ) : currentDashboard?.settings?.dashboardType === 'trend' ? (
//                   <Stack direction="row" spacing={STYLE_GUIDE.SPACING.s6}>
//                     <CommonDatePicker
//                       name="startDate"
//                       control={control}
//                       views={['year', 'month']}
//                       label="Start Date"
//                       rules={{ required: 'Start date is required' }}
//                       sx={{
//                         '& .MuiInputBase-input': {
//                           py: 1.1,
//                         },
//                       }}
//                     />

//                     <CommonDatePicker
//                       name="endDate"
//                       control={control}
//                       views={['year', 'month']}
//                       label="End Date"
//                       rules={{ required: 'End date is required' }}
//                       sx={{
//                         '& .MuiInputBase-input': {
//                           py: 1.1,
//                         },
//                       }}
//                     />
//                   </Stack>
//                 ) : null}
//               </Box>
//               <Button
//                 onClick={handleEditModeToggle}
//                 color="primary"
//                 variant="contained"
//                 startIcon={<EditIcon />}
//                 sx={{ ...getButtonSx() }}
//               >
//                 Edit
//               </Button>
//             </>
//           )}
//         </Box>
//       </Box>

//       <Box
//         sx={{
//           display: 'flex',
//           flex: 1,
//           overflow: 'hidden',
//           gap: STYLE_GUIDE.SPACING.s6,
//           height: 'calc(100% - 100px)',
//         }}
//       >
//         <Box
//           sx={{
//             flex: 1,
//             overflow: 'auto',
//             display: 'grid',
//             gridTemplateColumns: {
//               xs: '1fr',
//               sm: 'repeat(auto-fit, minmax(400px, 1fr))',
//               md: 'repeat(auto-fit, minmax(450px, 1fr))',
//               lg: 'repeat(auto-fit, minmax(500px, 1fr))',
//             },
//             gap: STYLE_GUIDE.SPACING.s4,
//             p: STYLE_GUIDE.SPACING.s4,

//             transition: 'all 0.3s ease',
//             ...((isAddChartModalOpen || isEditChartModalOpen) && {
//               flex: '1 1 70%',
//             }),
//             '&::-webkit-scrollbar': {
//               width: '8px',
//               height: '8px',
//             },
//             '&::-webkit-scrollbar-thumb': {
//               backgroundColor: 'rgba(0, 0, 0, 0.1)',
//               borderRadius: '4px',
//             },
//             '&::-webkit-scrollbar-track': {
//               backgroundColor: 'transparent',
//             },
//           }}
//         >
//           {dashboardId && (
//             <ChartGrid
//               dashboardId={dashboardId}
//               isEditMode={isEditMode}
//               onEditChart={handleEditChart}
//               isAddChartModalOpen={isAddChartModalOpen}
//               isEditChartModalOpen={isEditChartModalOpen}
//               gridColumns={gridColumns}
//               currentDashboard={currentDashboard as Dashboard}
//               startVersionValue={currentDashboard?.settings?.dashboardType === 'normal' ? '' : startVersionValue || ''}
//               endVersionValue={currentDashboard?.settings?.dashboardType === 'normal' ? '' : endVersionValue || ''}
//               versionValue={versionValue || ''}
//               isTrend={currentDashboard?.settings?.dashboardType === 'trend'}
//               dashboardFilters={dashboardFilters}
//             />
//           )}
//         </Box>

//         {(isAddChartModalOpen || isEditChartModalOpen) && (
//           <Box
//             sx={{
//               width: {
//                 xs: '100%',
//                 sm: '400px',
//                 md: '450px',
//                 lg: '500px',
//               },
//               flexShrink: 0,
//               display: 'flex',
//               flexDirection: 'column',
//               borderLeft: '1px solid',
//               borderColor: 'divider',
//               overflow: 'hidden',
//               height: '100%',
//             }}
//           >
//             {isAddChartModalOpen && (
//               <AddChartModal
//                 open={isAddChartModalOpen}
//                 onClose={handleCloseModal}
//                 isSubmitting={false}
//                 dashboardId={dashboardId || ''}
//                 isTrend={currentDashboard?.settings?.dashboardType === 'trend'}
//                 currentDashboard={currentDashboard}
//                 startVersionValue={startVersionValue}
//                 endVersionValue={endVersionValue}
//                 versionValue={formattedVersionValue}
//               />
//             )}
//             {isEditChartModalOpen && selectedChart && (
//               <AddChartModal
//                 open={isEditChartModalOpen}
//                 onClose={handleCloseEditModal}
//                 isSubmitting={false}
//                 dashboardId={dashboardId || ''}
//                 initialData={selectedChart}
//                 onSave={handleChartUpdate}
//                 isTrend={currentDashboard?.settings?.dashboardType === 'trend'}
//                 currentDashboard={currentDashboard}
//                 startVersionValue={startVersionValue}
//                 endVersionValue={endVersionValue}
//                 versionValue={formattedVersionValue}
//               />
//             )}
//           </Box>
//         )}
//       </Box>
//       {!!currentDashboard?.settings?.dataSource?._id && (
//         <NotivixFiltersModal
//           open={isFiltersModalOpen}
//           onClose={handleCloseFiltersModal}
//           onApplyFilters={handleApplyFilters}
//           currentFilters={dashboardFilters}
//           dataSourceId={currentDashboard?.settings?.dataSource?._id} // Pass your dataSourceId here
//           filterFlag="isFilterEnable" // Specify which flag to use for filtering
//           isLoading={dataSourceDetailsLoading}
//         />
//       )}
//     </Box>
//   );
// };

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  ButtonGroup,
  Stack,
  MenuItem,
  SelectChangeEvent,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import StyledSelect from "../../../components/atom/common/StyledSelect";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DoneIcon from "@mui/icons-material/Done";
import PauseIcon from "@mui/icons-material/Pause";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import SquareIcon from "@mui/icons-material/Square";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import "react-multi-date-picker/styles/colors/purple.css";

import { useParams, useLocation } from "react-router-dom";
import { ChartGrid } from "./ChartGrid";
import { AddChartModal, ChartFormData } from "./AddChartModal";
import { EditChartModal } from "./EditChartModal";
import { useAppDispatch, useAppSelector } from "../../../storeHooks";
import {
  updateWidget,
  saveWidgets,
  fetchWidgetTheme,
  fetchChartData,
  fetchWidgetDataLazy,
  selectDashboardTheme,
} from "../dashboardActions";
import { clearAllCaches } from "../dashboardReducer";
import { toast } from "react-toastify";
import { ChartResponse, TemporaryChart, Dashboard } from "../types";
import usePost from "../../../hooks/usePost";
import { POST } from "../../../services/apiRoutes";
import CommonDatePicker from "../../../components/common/datePicker/datePicker";
import { useForm } from "react-hook-form";
import { DateTime } from "luxon";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { fetchThemeList } from "../../createTheme/themeActions";
import { STYLE_GUIDE } from "../../../styles";
import { useUnifiedTheme } from "../../../hooks/useUnifiedTheme";
import { useComponentTypography } from "../../../hooks/useComponentTypography";
import NotivixFiltersModal from "../../notivixDashboard/components/NotivixFiltersModal";
import { GridFilterListIcon } from "@mui/x-data-grid";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import DatePicker, { DateObject } from "react-multi-date-picker";
import FilterListIcon from "@mui/icons-material/FilterList";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import { checkPermission } from "../../../utils/utils";
import { PermissionsMap } from "../../../utils/constants";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import logo from "../../../assets/logo.png";

interface DashboardViewProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  title: initialTitle,
  onTitleChange,
}): JSX.Element => {
  const theme = useUnifiedTheme();
  const { getHeadingSx, getButtonSx } = useComponentTypography();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState(initialTitle);
  const [title, setTitle] = useState(initialTitle);
  const [isAddChartModalOpen, setIsAddChartModalOpen] = useState(false);
  const [isEditChartModalOpen, setIsEditChartModalOpen] = useState(false);
  const [selectedChart, setSelectedChart] = useState<ChartResponse | null>(
    null,
  );
  const [selectedNumberChartColor, setSelectedNumberChartColor] = useState<
    string | undefined
  >(undefined);
  const [isChartUpdating, setIsChartUpdating] = useState(false);
  const [chartPreviewRenderer, setChartPreviewRenderer] = useState<
    ((chart: ChartResponse) => React.ReactNode) | null
  >(null);
  const [gridColumns, setGridColumns] = useState(2);
  const [selectedTheme, setSelectedTheme] = useState<string>("");
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dashboardContainerRef = useRef<HTMLDivElement>(null);
  const fetchChartDataAbortRef = useRef<(() => void) | null>(null);
  const lastEditedChartIdRef = useRef<string | null>(null);
  const { id: dashboardId } = useParams();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const temporaryCharts = useAppSelector(
    (state) => state.dashboard.temporaryCharts,
  );
  const dashboards = useAppSelector((state) => state.dashboard.dashboards);
  const currentDashboard = dashboards.find((d) => d._id === dashboardId);
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [dashboardFilters, setDashboardFilters] = useState<any>({});
  const { dataSourceDetails, dataSourceDetailsLoading } = useAppSelector(
    (state) => state.notivixDashboard,
  );
  const [statusToggle, setStatusToggle] = useState<"Pending" | "Completed">(
    "Pending",
  );
  const [dateRange, setDateRange] = useState<DateObject[] | null>(null);
  const [isDateRangeFocused, setIsDateRangeFocused] = useState(false);
  const { themes } = useAppSelector((state) => state.theme);
  const charts = useAppSelector((state) => state.dashboard.charts);

  const postGridColumns = usePost([""]);

  const permissions = useSelector(
    (state: RootState) => state.userPermission?.permissions,
  );
  const shouldAllowDashboardUpdate = checkPermission(
    permissions,
    PermissionsMap.DASHBOARD,
    "update",
  );

  const shouldAllowDefaultDashboardUpdate = checkPermission(
    permissions,
    PermissionsMap.DEFAULT_DASHBOARD,
    "update",
  );

  const shouldAllowWidgetCreate = checkPermission(
    permissions,
    PermissionsMap.DASHBOARD,
    "create_widget",
  );
  // Predefined range options
  const rangeOptions = {
    Pending: [
      { value: "next3Days", label: "Due in next 3 days" },
      { value: "next7Days", label: "Due in next 7 days" },
      { value: "next15Days", label: "Due in next 15 days" },
      { value: "next1Month", label: "Due in next 1 month" },
      { value: "dueDatePassed", label: "Due date passed" },
    ],
    Completed: [
      { value: "last1Month", label: "Completion date in last 1 month" },
      { value: "last3Months", label: "Completion date in last 3 months" },
      { value: "last6Months", label: "Completion date in last 6 months" },
      { value: "last1Year", label: "Completion date in last 1 year" },
    ],
  };

  // Handle predefined range selection
  const handlePredefinedRangeSelection = (value: string) => {
    const today = new DateObject();
    let start, end;

    if (statusToggle === "Pending") {
      switch (value) {
        case "next3Days":
          start = today;
          end = new DateObject(today).add(3, "day"); // ✅ Creates new instance

          // end = today.add(3, 'day');
          break;
        case "next7Days":
          start = today;
          end = new DateObject(today).add(7, "day");
          break;
        case "next15Days":
          start = today;
          end = new DateObject(today).add(15, "day");
          break;
        case "next1Month":
          start = today;
          end = new DateObject(today).add(1, "month");
          break;
        case "dueDatePassed":
          start = new DateObject(today).subtract(30, "day");
          end = today;
          break;
        default:
          return;
      }
    } else if (statusToggle === "Completed") {
      switch (value) {
        case "last1Month":
          start = new DateObject(today).subtract(1, "month");
          end = today;
          break;
        case "last3Months":
          start = new DateObject(today).subtract(3, "month");
          end = today;
          break;
        case "last6Months":
          start = new DateObject(today).subtract(6, "month");
          end = today;
          break;
        case "last1Year":
          start = new DateObject(today).subtract(1, "year");
          end = today;
          break;
        default:
          return;
      }
    }

    if (start && end) {
      setDateRange([start, end]);
      setDashboardFilters((prev) => {
        const { DueDate, DateTaken, ...rest } = prev;
        if (statusToggle === "Pending") {
          return {
            ...rest,
            DueDate: {
              startDate: start.format("YYYY-MM-DD"),
              endDate: end.format("YYYY-MM-DD"),
            },
            // "Derived.Case Status": statusToggle,
            "Derived.Case Status": statusToggle,
            "Derived.Handled By": "In House",
          };
        } else if (statusToggle === "Completed") {
          return {
            ...rest,
            DateTaken: {
              startDate: start.format("YYYY-MM-DD"),
              endDate: end.format("YYYY-MM-DD"),
            },
            // "Derived.Case Status": statusToggle,
            "Derived.Case Status": statusToggle,
            "Derived.Handled By": "In House",
          };
        }
        return prev;
      });
    }
  };

  // Handle clear date range
  const handleClearDateRange = () => {
    setDateRange(null);
    setDashboardFilters((prev) => {
      const { DueDate, DateTaken, ...rest } = prev;
      return rest;
    });
  };

  useEffect(() => {
    if (currentDashboard?.isDefaultNotivix) {
      setDashboardFilters((prev) => {
        if (statusToggle === "Pending") {
          const today = new DateObject(); // Current date
          const thirtyDaysAfter = new DateObject().add(30, "day");
          setDateRange([today, thirtyDaysAfter]);
          return {
            ...prev,
            DueDate: {
              startDate: today.format("YYYY-MM-DD"),
              endDate: thirtyDaysAfter.format("YYYY-MM-DD"),
            },
            "Derived.Case Status": statusToggle,
            "Derived.Handled By": "In House",
          };
        } else if (statusToggle === "Completed") {
          const today = new DateObject(); // Current date
          const thirtyDaysAgo = new DateObject().subtract(30, "day");

          setDateRange([thirtyDaysAgo, today]);
          return {
            ...prev,
            DateTaken: {
              startDate: thirtyDaysAgo.format("YYYY-MM-DD"),
              endDate: today.format("YYYY-MM-DD"),
            },
            "Derived.Case Status": statusToggle,
            "Derived.Handled By": "In House",
          };
        }
        return {
          ...prev,
          "Derived.Case Status": statusToggle,
          "Derived.Handled By": "In House",
        };
      });
    } else {
      setDashboardFilters({});
    }
  }, [currentDashboard]);

  const handleOpenFiltersModal = async () => {
    if (currentDashboard?.settings?.dataSource?._id) {
      try {
        setIsFiltersModalOpen(true);
      } catch (error) {
        toast.error("Failed to load filters. Please try again.");
      }
    } else {
      setIsFiltersModalOpen(true);
    }
  };

  const handleStatusToggle = (
    event: React.MouseEvent<HTMLElement>,
    newStatus: "Pending" | "Completed" | null,
  ) => {
    if (newStatus !== null) {
      setStatusToggle(newStatus);
      setDashboardFilters((prev) => {
        const { DueDate, DateTaken, ...rest } = prev;
        if (newStatus === "Pending") {
          const today = new DateObject(); // Current date
          const thirtyDaysAfter = new DateObject().add(30, "day");
          setDateRange([today, thirtyDaysAfter]);
          return {
            ...rest,
            DueDate: {
              startDate: today.format("YYYY-MM-DD"),
              endDate: thirtyDaysAfter.format("YYYY-MM-DD"),
            },
            // "Derived.Case Status": newStatus,
            "Derived.Case Status": newStatus,
            "Derived.Handled By": "In House",
          };
        } else if (newStatus === "Completed") {
          const today = new DateObject(); // Current date
          const thirtyDaysAgo = new DateObject().subtract(30, "day");

          setDateRange([thirtyDaysAgo, today]);
          return {
            ...rest,
            DateTaken: {
              startDate: thirtyDaysAgo.format("YYYY-MM-DD"),
              endDate: today.format("YYYY-MM-DD"),
            },
            // "Derived.Case Status": newStatus,
            "Derived.Case Status": newStatus,
            "Derived.Handled By": "In House",
          };
        }
        return {
          ...rest,
          // "Derived.Case Status": newStatus,
          "Derived.Case Status": newStatus,
          "Derived.Handled By": "In House",
        };
      });
    }
  };

  const handleDateRangeChange = (
    dateRange: DateObject[] | DateObject | null,
  ) => {
    const range = Array.isArray(dateRange)
      ? dateRange
      : dateRange
        ? [dateRange]
        : null;
    setDateRange(range);

    if (range && range.length === 2) {
      const startDate = range[0].format("YYYY-MM-DD");
      const endDate = range[1].format("YYYY-MM-DD");
      setDashboardFilters((prev) => {
        const { DueDate, DateTaken, ...rest } = prev;
        if (statusToggle === "Pending") {
          return {
            ...rest,
            DueDate: {
              startDate,
              endDate,
            },
          };
        } else if (statusToggle === "Completed") {
          return {
            ...rest,
            DateTaken: {
              startDate,
              endDate,
            },
          };
        }
        return { ...rest };
      });
    }
  };
  const handleDateRangeFocus = (focused: boolean) => {
    setIsDateRangeFocused(focused);
  };

  const handleCloseFiltersModal = () => {
    setIsFiltersModalOpen(false);
  };
  const handleApplyFilters = async (filters: any) => {
    if (Object.keys(filters).length > 0) {
      setDashboardFilters(filters);

      setStatusToggle(filters["Derived.Case Status"]);

      // Fix: Use DateObject instead of Date
      if (
        filters["DueDate"] &&
        filters["DueDate"].startDate &&
        filters["DueDate"].endDate
      ) {
        setDateRange([
          new DateObject(filters["DueDate"].startDate),
          new DateObject(filters["DueDate"].endDate),
        ]);
      } else if (
        filters["DateTaken"] &&
        filters["DateTaken"].startDate &&
        filters["DateTaken"].endDate
      ) {
        setDateRange([
          new DateObject(filters["DateTaken"].startDate),
          new DateObject(filters["DateTaken"].endDate),
        ]);
      } else {
        // Clear date range if no date filter is applied
        setDateRange(null);
      }
    }
  };

  const handleExportPDF = async () => {
    if (!dashboardContainerRef.current || !currentDashboard) {
      toast.error("Dashboard content not available for export");
      return;
    }

    setIsExportingPdf(true);

    try {
      const dashboardName = currentDashboard.name || "Dashboard";

      const allCards = dashboardContainerRef.current.querySelectorAll(
        "[data-widget-type]",
      ) as NodeListOf<HTMLElement>;

      let cardsToProcess = allCards;
      if (allCards.length === 0) {
        cardsToProcess = dashboardContainerRef.current.querySelectorAll(
          ".MuiCard-root",
        ) as NodeListOf<HTMLElement>;
      }

      if (cardsToProcess.length === 0) {
        toast.error("No widgets found to export");
        setIsExportingPdf(false);
        return;
      }

      const numberWidgets: HTMLElement[] = [];
      const chartWidgets: HTMLElement[] = [];

      cardsToProcess.forEach((card) => {
        const widgetType = card.getAttribute("data-widget-type");
        if (widgetType === "number") {
          numberWidgets.push(card);
        } else {
          chartWidgets.push(card);
        }
      });

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const headerHeight = 25;

      const addHeader = async () => {
        try {
          const logoWidth = 30;
          const logoHeight = 12;
          pdf.addImage(logo, "PNG", margin, margin, logoWidth, logoHeight);

          pdf.setFontSize(16);
          pdf.setFont("helvetica", "bold");
          pdf.text(dashboardName, margin + logoWidth + 10, margin + 8);

          pdf.setFontSize(10);
          pdf.setFont("helvetica", "normal");
          const currentDate = new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
          pdf.text(currentDate, pageWidth - margin - 40, margin + 8);

          pdf.setDrawColor(200, 200, 200);
          pdf.setLineWidth(0.5);
          pdf.line(
            margin,
            margin + headerHeight - 5,
            pageWidth - margin,
            margin + headerHeight - 5,
          );
        } catch (error) {
          console.error("Error adding header:", error);
          pdf.setFontSize(16);
          pdf.setFont("helvetica", "bold");
          pdf.text(dashboardName, margin, margin + 8);

          pdf.setDrawColor(200, 200, 200);
          pdf.setLineWidth(0.5);
          pdf.line(
            margin,
            margin + headerHeight - 5,
            pageWidth - margin,
            margin + headerHeight - 5,
          );
        }
      };

      await addHeader();

      let currentY = margin + headerHeight;

      const addNewPage = async () => {
        pdf.addPage();
        await addHeader();
        currentY = margin + headerHeight;
      };

      if (numberWidgets.length > 0) {
        const numberWidgetColumns = 3;
        const numberWidgetWidth =
          (pageWidth - (numberWidgetColumns + 1) * margin) /
          numberWidgetColumns;
        const numberWidgetHeight = 35;
        const numberWidgetsPerPage = 6;

        for (let i = 0; i < numberWidgets.length; i++) {
          const widgetIndex = i % numberWidgetsPerPage;
          const rowIndex = Math.floor(widgetIndex / numberWidgetColumns);
          const colIndex = widgetIndex % numberWidgetColumns;

          if (i > 0 && widgetIndex === 0) {
            await addNewPage();
          }

          const xPos = margin + colIndex * (numberWidgetWidth + margin);
          const yPos = currentY + rowIndex * (numberWidgetHeight + margin);

          try {
            const canvas = await html2canvas(numberWidgets[i], {
              scale: 2,
              useCORS: true,
              logging: false,
              backgroundColor: "#ffffff",
              ignoreElements: (element) => {
                return (
                  element.classList.contains("MuiIconButton-root") ||
                  element.tagName === "svg" ||
                  element.classList.contains("MuiSvgIcon-root")
                );
              },
            });

            const imgData = canvas.toDataURL("image/jpeg", 0.95);
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;

            const aspectRatio = imgWidth / imgHeight;
            let finalWidth = numberWidgetWidth;
            let finalHeight = numberWidgetWidth / aspectRatio;

            if (finalHeight > numberWidgetHeight) {
              finalHeight = numberWidgetHeight;
              finalWidth = numberWidgetHeight * aspectRatio;
            }

            const offsetX = xPos + (numberWidgetWidth - finalWidth) / 2;
            const offsetY = yPos + (numberWidgetHeight - finalHeight) / 2;

            pdf.addImage(
              imgData,
              "JPEG",
              offsetX,
              offsetY,
              finalWidth,
              finalHeight,
            );
          } catch (error) {
            console.error(`Error processing number widget ${i + 1}:`, error);
          }
        }

        const numberWidgetRows = Math.ceil(
          numberWidgets.length / numberWidgetColumns,
        );
        currentY += numberWidgetRows * (numberWidgetHeight + margin) + margin;
      }

      if (chartWidgets.length > 0) {
        const chartsPerRow = gridColumns;
        let chartWidth: number;
        const chartHeight = pageHeight - headerHeight - 2 * margin;

        if (gridColumns === 1) {
          chartWidth = pageWidth - 2 * margin;
        } else if (gridColumns === 2) {
          chartWidth = (pageWidth - 3 * margin) / 2;
        } else {
          chartWidth = (pageWidth - 4 * margin) / 3;
        }

        const remainingSpace = pageHeight - currentY - margin;

        if (numberWidgets.length > 0 && remainingSpace < chartHeight) {
          await addNewPage();
        }

        for (let i = 0; i < chartWidgets.length; i++) {
          let xPos: number;
          let yPos: number;

          if (gridColumns === 1) {
            xPos = margin;
            yPos = currentY;
          } else {
            const colIndex = i % chartsPerRow;
            xPos = margin + colIndex * (chartWidth + margin);
            yPos = currentY;
          }

          const widgetElement = chartWidgets[i];
          let matchedChart: ChartResponse | undefined;

          const chartNameElement = widgetElement.querySelector(
            "h6, .MuiTypography-root, [class*='chart-name'], [class*='ChartTitle']",
          );
          if (chartNameElement && charts.length > 0) {
            const chartName = chartNameElement.textContent?.trim();
            matchedChart = charts.find((c) => c.name === chartName);
          }

          try {
            const canvas = await html2canvas(widgetElement, {
              scale: 2,
              useCORS: true,
              logging: false,
              backgroundColor: "#ffffff",
              ignoreElements: (element) => {
                return (
                  element.classList.contains("MuiIconButton-root") ||
                  element.tagName === "svg" ||
                  element.classList.contains("MuiSvgIcon-root")
                );
              },
            });

            const imgData = canvas.toDataURL("image/jpeg", 0.95);
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const aspectRatio = imgWidth / imgHeight;

            const descriptionText = matchedChart?.description || "";
            let summaryHeight = 0;

            if (descriptionText) {
              pdf.setFont("helvetica", "bold");
              pdf.setFontSize(12);

              const summaryTitleHeight = 6;

              pdf.setFont("helvetica", "normal");
              pdf.setFontSize(10);

              const wrappedText = pdf.splitTextToSize(
                descriptionText,
                chartWidth - 2,
              );

              const descriptionHeight = wrappedText.length * 5;

              summaryHeight = summaryTitleHeight + descriptionHeight + 8;
            }

            let finalWidth = chartWidth;
            let finalHeight = chartWidth / aspectRatio;

            const maxChartHeight = chartHeight - summaryHeight;

            if (finalHeight > maxChartHeight) {
              finalHeight = maxChartHeight;
              finalWidth = finalHeight * aspectRatio;
            }

            const offsetX = xPos + (chartWidth - finalWidth) / 2;
            const offsetY = yPos;

            pdf.addImage(
              imgData,
              "JPEG",
              offsetX,
              offsetY,
              finalWidth,
              finalHeight,
            );

            if (matchedChart?.description) {
              let summaryY = offsetY + finalHeight + 6;

              pdf.setFont("helvetica", "bold");
              pdf.setFontSize(12);
              pdf.text("Summary", xPos, summaryY);

              summaryY += 6;

              pdf.setFont("helvetica", "normal");
              pdf.setFontSize(10);

              const wrappedText = pdf.splitTextToSize(
                matchedChart.description,
                chartWidth - 2,
              );

              pdf.text(wrappedText, xPos, summaryY);
            }

            if (gridColumns === 1) {
              if (i < chartWidgets.length - 1) {
                await addNewPage();
              }
            } else {
              const colIndex = i % chartsPerRow;
              if (
                colIndex === chartsPerRow - 1 &&
                i < chartWidgets.length - 1
              ) {
                await addNewPage();
              }
            }
          } catch (error) {
            console.error(`Error processing chart ${i + 1}:`, error);
          }
        }
      }

      pdf.save(`${dashboardName}.pdf`);
      toast.success("Dashboard exported as PDF successfully!");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export dashboard as PDF");
    } finally {
      setIsExportingPdf(false);
    }
  };

  const validationSchema = yup.object({
    versionValue: yup.string().nullable().optional(),
    startDate: yup
      .string()
      .nullable()
      .when("$isDashboardTrend", ([isDashboardTrend]) => {
        if (isDashboardTrend) {
          return yup.string().nullable().required("Start date is required");
        }
        return yup.string().nullable().optional();
      }),
    endDate: yup
      .string()
      .nullable()
      .when(
        ["$isDashboardTrend", "startDate"],
        ([isDashboardTrend, startDate]) => {
          if (isDashboardTrend && startDate) {
            return yup
              .string()
              .nullable()
              .required("End date is required")
              .test(
                "is-after-start",
                "End date must be after or equal to start date",
                function (value) {
                  const { startDate } = this.parent;
                  if (!value || !startDate) return true;

                  try {
                    const startDateTime = DateTime.fromISO(startDate);
                    const endDateTime = DateTime.fromISO(value);
                    return endDateTime >= startDateTime;
                  } catch {
                    return false;
                  }
                },
              );
          }
          return yup.string().nullable().optional();
        },
      ),
  });

  const {
    control,
    watch,
    setValue,
    formState: { errors },
    trigger,
  } = useForm<{
    versionValue?: string | null | undefined;
    startDate?: string | null | undefined;
    endDate?: string | null | undefined;
  }>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      versionValue: null,
      startDate: null,
      endDate: DateTime.now().toISO(),
    },
    context: {
      isDashboardTrend: currentDashboard?.settings?.dashboardType === "trend",
    },
  });

  const versionValue = watch("versionValue");
  const formattedVersionValue = versionValue
    ? DateTime.fromISO(versionValue).toFormat("yyyy-LL")
    : undefined;

  const startDate = watch("startDate");
  const startVersionValue = startDate
    ? DateTime.fromISO(startDate).toFormat("yyyy-LL")
    : undefined;

  const endDate = watch("endDate");
  const endVersionValue = endDate
    ? DateTime.fromISO(endDate).toFormat("yyyy-LL")
    : undefined;

  useEffect(() => {
    if (dashboards.length > 0) {
      setGridColumns(
        dashboards.find((dashboard) => dashboard?._id === dashboardId)?.settings
          ?.gridColumns || 2,
      );
    }
  }, [dashboards, dashboardId]);

  const hasErrors = useMemo(() => {
    return !!errors.startDate || !!errors.endDate;
  }, [errors.startDate, errors.endDate]);

  useEffect(() => {
    if (dashboardId) {
      const hasFilters = Object.keys(dashboardFilters).length > 0;

      if (!hasFilters && currentDashboard?.isDefaultNotivix) {
        return;
      }

      if (currentDashboard?.isDefaultNotivix && hasFilters) {
        dispatch(clearAllCaches());
      }

      let thunkPromise: any = null;

      if (
        currentDashboard?.settings?.dashboardType === "normal" &&
        hasFilters
      ) {
        thunkPromise = dispatch(
          fetchChartData({
            dashboardId,
            // versionValue: formattedVersionValue || "",
            dashboardType: "normal",
            startVersionValue,
            endVersionValue,
            versionValue: versionValue || undefined,
            dashboardFilters: currentDashboard?.isDefaultNotivix
              ? dashboardFilters
              : {},
          }),
        );
      } else if (
        currentDashboard?.settings?.dashboardType === "trend" &&
        startVersionValue &&
        endVersionValue &&
        DateTime.fromISO(startVersionValue) <
          DateTime.fromISO(endVersionValue) &&
        !hasErrors &&
        hasFilters
      ) {
        thunkPromise = dispatch(
          fetchChartData({
            dashboardId,
            versionValue: undefined,
            startVersionValue,
            endVersionValue,
            dashboardType: currentDashboard?.settings?.dashboardType,
            dashboardFilters,
          }),
        );
      } else if (!currentDashboard?.isDefaultNotivix) {
        thunkPromise = dispatch(
          fetchChartData({
            dashboardId,
            dashboardFilters,
          }),
        );
      }
      if (thunkPromise && typeof thunkPromise.abort === "function") {
        fetchChartDataAbortRef.current = () => {
          thunkPromise.abort();
        };
      } else {
        fetchChartDataAbortRef.current = null;
      }

      return () => {
        if (fetchChartDataAbortRef.current) {
          fetchChartDataAbortRef.current();
          fetchChartDataAbortRef.current = null;
        }
      };
    }
  }, [
    currentDashboard?.settings?.dashboardType,
    dashboardId,
    dispatch,
    endVersionValue,
    formattedVersionValue,
    hasErrors,
    startVersionValue,
    versionValue,
    dashboardFilters,
    currentDashboard?.isDefaultNotivix,
  ]);

  useEffect(() => {
    setIsEditMode(false);
    setIsAddChartModalOpen(false);
    setIsEditChartModalOpen(false);
    if (location.state?.enableEditMode) {
      setIsEditMode(true);
    }
  }, [location.state]);

  useEffect(() => {
    if (isEditMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditMode]);

  useEffect(() => {
    setEditedTitle(initialTitle);
    setTitle(initialTitle);
  }, [initialTitle]);

  useEffect(() => {
    if (currentDashboard?.widgetThemeId) {
      setSelectedTheme(currentDashboard.widgetThemeId);
      dispatch(fetchWidgetTheme(currentDashboard.widgetThemeId));
    }
  }, [currentDashboard?.widgetThemeId, dispatch]);

  useEffect(() => {
    dispatch(fetchThemeList());
  }, [dispatch]);

  useEffect(() => {
    if (isEditChartModalOpen && selectedChart) {
      const mainContent = document.getElementById("main-screen-content");
      if (mainContent) {
        mainContent.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    }
  }, [isEditChartModalOpen, selectedChart]);

  // Keep selectedChart in sync with the latest chart data from Redux
  // This ensures the edit modal preview updates after a chart is updated
  useEffect(() => {
    if (!isEditChartModalOpen || !selectedChart) return;
    const updatedChart = charts.find(
      (c: ChartResponse) => c._id === selectedChart._id,
    );
    if (updatedChart && updatedChart !== selectedChart) {
      // Only update if the chart object has actually changed
      const hasChanged =
        JSON.stringify(updatedChart) !== JSON.stringify(selectedChart);
      if (hasChanged) {
        setSelectedChart(updatedChart);
      }
    }
  }, [charts, isEditChartModalOpen, selectedChart]);

  useEffect(() => {
    if (currentDashboard?.settings) {
      setValue("versionValue", null);

      const currentDate = DateTime.now();
      setValue("endDate", currentDate.toISO());

      if (currentDashboard.settings.dynamicVersionValue) {
        const period = currentDashboard.settings.dynamicVersionValue;
        let monthsToSubtract = 1;

        switch (period) {
          case "1m":
            monthsToSubtract = 1;
            break;
          case "3m":
            monthsToSubtract = 3;
            break;
          case "6m":
            monthsToSubtract = 6;
            break;
          case "12m":
            monthsToSubtract = 12;
            break;
        }

        const startDate = currentDate.minus({ months: monthsToSubtract });
        setValue("startDate", startDate.toISO());
      } else {
        setValue("startDate", currentDate.minus({ months: 1 }).toISO());
      }
    }
  }, [currentDashboard?.settings, setValue]);

  const handleGridColumns = (columns: number) => {
    setGridColumns(columns);
    postGridColumns.mutate({
      url: `${POST.UPDATE_DASHBOARD}/${dashboardId}`,
      payload: {
        gridColumns: columns,
      },
    });
  };

  const handleEditModeToggle = async () => {
    if (isEditMode) {
      // Save title first if it has changed
      if (editedTitle !== title) {
        onTitleChange(editedTitle);
        setTitle(initialTitle);
        setEditedTitle(initialTitle);
      }

      // Save temporary charts only if there are any
      if (temporaryCharts.length > 0) {
        try {
          const result = await dispatch(
            saveWidgets({
              widgets: temporaryCharts.map((chart: TemporaryChart) => ({
                dashboardId: chart.dashboardId,
                widgetTypeId: chart.widgetTypeId?._id || "",
                name: chart.name,
                dimensions: chart.dimensions.join(","),
                groupBy: chart.groupBy,
                aggregation: chart.aggregation,
                position: chart.position,
                conditions: chart.conditions,
                dataSourceId: chart.dataSourceId?._id || "",
                entityId: chart.dataSourceId?.entityId || "",
                isIncremental: chart.isIncremental || false,
              })),
            }),
          ).unwrap();

          if (result.success) {
            toast.success("Charts saved successfully!");
          } else {
            toast.error(result.message || "Failed to save charts");
          }
        } catch (error) {
          if (
            typeof error === "object" &&
            error !== null &&
            "message" in error
          ) {
            toast.error(error.message as string);
          } else {
            toast.error("Failed to save charts");
          }
        }
      }

      setIsEditMode(false);
      setIsAddChartModalOpen(false);
      setSelectedChart(null);
      setIsEditChartModalOpen(false);
    } else {
      setIsEditMode(!isEditMode);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onTitleChange(editedTitle);
      setIsEditMode(false);
    }
  };

  const handleCloseModal = () => {
    setIsAddChartModalOpen(false);
  };

  const handleEditChart = (
    chart: ChartResponse | null,
    options?: { numberChartColor?: string },
  ) => {
    setSelectedChart(chart);
    setSelectedNumberChartColor(options?.numberChartColor);
    if (chart) {
      setIsEditChartModalOpen(true);
      setIsAddChartModalOpen(false);
    }
  };

  const handleCloseEditModal = () => {
    const editedChartId = lastEditedChartIdRef.current;
    setIsEditChartModalOpen(false);
    setSelectedChart(null);
    setSelectedNumberChartColor(undefined);

    // If a chart was edited, refresh dashboard data and scroll to it
    if (editedChartId) {
      lastEditedChartIdRef.current = null;

      // Re-fetch all chart data to ensure the grid is up-to-date
      if (dashboardId) {
        dispatch(
          fetchChartData({
            dashboardId,
            dashboardType:
              currentDashboard?.settings?.dashboardType || "normal",
            startVersionValue,
            endVersionValue,
            versionValue: formattedVersionValue || "",
            dashboardFilters,
          }),
        );
      }

      // Scroll to the edited chart after a short delay to allow re-render
      setTimeout(() => {
        const chartElement = document.querySelector(
          `[data-chart-id="${editedChartId}"]`,
        );
        if (chartElement) {
          chartElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 500);
    }
  };

  const handleChartUpdate = async (formData: ChartFormData) => {
    if (!selectedChart) return;

    try {
      const result = await dispatch(
        updateWidget({
          ...formData,
          _id: selectedChart._id,
          dashboardId: dashboardId || "",
        }),
      ).unwrap();

      if (result.success) {
        toast.success("Chart updated successfully!");
        // Store the edited chart id for scrolling on modal close
        lastEditedChartIdRef.current = selectedChart._id;

        // Show loader on the chart preview while re-fetching
        setIsChartUpdating(true);

        const dashboardType =
          currentDashboard?.settings?.dashboardType || "normal";

        try {
          // Re-fetch chart list so Redux store has the fully populated chart object
          let updatedChart: ChartResponse | undefined;
          if (dashboardId) {
            const chartDataResult = await dispatch(
              fetchChartData({
                dashboardId,
                dashboardType,
                startVersionValue,
                endVersionValue,
                versionValue: formattedVersionValue || "",
                dashboardFilters,
              }),
            ).unwrap();

            const chartsArray = Array.isArray(chartDataResult)
              ? chartDataResult
              : chartDataResult?.data || [];
            updatedChart = chartsArray.find(
              (c: ChartResponse) => c._id === selectedChart._id,
            );
          }

          // Re-fetch widget data using the fresh chart (not stale selectedChart)
          await dispatch(
            fetchWidgetDataLazy({
              chart: updatedChart || selectedChart,
              dashboardType,
              startVersionValue,
              endVersionValue,
              versionValue: formattedVersionValue || "",
              dashboardFilters,
              isDefaultNotivix: currentDashboard?.isDefaultNotivix || false,
            }),
          );
        } finally {
          setIsChartUpdating(false);
        }
      } else {
        toast.error(result.message || "Failed to update chart");
      }
    } catch (error) {
      if (typeof error === "object" && error !== null && "message" in error) {
        toast.error(error.message as string);
      } else {
        toast.error("Failed to update chart");
      }
    }
  };

  useEffect(() => {
    if (
      startDate &&
      endDate &&
      currentDashboard?.settings?.dashboardType === "trend"
    ) {
      trigger("endDate");
      trigger("startDate");
    }
  }, [startDate, endDate, currentDashboard?.settings?.dashboardType, trigger]);

  const handleThemeChange = async (event: SelectChangeEvent<unknown>) => {
    const themeId = event.target.value as string;
    setSelectedTheme(themeId);

    if (dashboardId) {
      try {
        const result = await dispatch(
          selectDashboardTheme({ dashboardId, widgetThemeId: themeId }),
        ).unwrap();

        if (result.success) {
          toast.success("Theme updated successfully!");
          dispatch(fetchWidgetTheme(themeId));
        } else {
          toast.error(result.message || "Failed to update theme");
        }
      } catch (error) {
        if (typeof error === "object" && error !== null && "message" in error) {
          toast.error(error.message as string);
        } else {
          toast.error("Failed to update theme");
        }
      }
    }
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Typography
        variant="h4"
        component="h1"
        sx={{
          ...getHeadingSx(),
          mr: STYLE_GUIDE.SPACING.s4,
          fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
        }}
      >
        {title}
      </Typography>
      <Box
        sx={{
          // p: { md: STYLE_GUIDE.SPACING.s2 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          gap: STYLE_GUIDE.SPACING.s4,
          borderBottom: 1,
          borderColor: "divider",
          pb: STYLE_GUIDE.SPACING.s2,
          pt: STYLE_GUIDE.SPACING.s2,
        }}
      >
        <Box
          sx={{
            flex: 1,
            mr: STYLE_GUIDE.SPACING.s4,
          }}
        >
          {isEditMode ? (
            <TextField
              inputRef={inputRef}
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onKeyDown={handleKeyPress}
              size="small"
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: STYLE_GUIDE.SPACING.s2,
                  alignItems: "flex-start",
                  paddingRight: STYLE_GUIDE.SPACING.s2,
                  fontSize: "14px",
                  backgroundColor: theme.getDropdownBackground(),
                  "& fieldset": { borderColor: theme.getInputBorderColor() },
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
                "& .MuiInputLabel-root.Mui-focused": {
                  color:
                    theme.input?.focusBorder ||
                    STYLE_GUIDE.COLORS.inputFocusFallback,
                },
                "& .MuiInputBase-input": {
                  color: `${theme.getInputTextColor()} !important`,
                },
                "& .MuiInputBase-input::placeholder": {
                  color: `${theme.palette.text.secondary} !important`,
                },
                "& .MuiInputBase-input:-webkit-autofill": {
                  WebkitTextFillColor: `${theme.getInputTextColor()} !important`,
                  WebkitBoxShadow: `0 0 0 1000px ${theme.getDropdownBackground()} inset !important`,
                },
              }}
            />
          ) : (
            <Box
              sx={{
                display: "flex",
                gap: STYLE_GUIDE.SPACING.s4,
                alignItems: "center",
              }}
            >
              {/* {title.length > 10 ? (
                <Tooltip title={title}>
                  <Typography
                    variant="h4"
                    component="h1"
                    sx={{
                      ...getHeadingSx(),
                      mr: STYLE_GUIDE.SPACING.s4,
                      fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      // maxWidth: "100px",
                    }}
                  >
                    {title}
                  </Typography>
                </Tooltip>
              ) : (
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{
                    ...getHeadingSx(),
                    mr: STYLE_GUIDE.SPACING.s4,
                    fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
                  }}
                >
                  {title}
                </Typography>
              )} */}

              {currentDashboard?.isDefaultNotivix && (
                <>
                  <ToggleButtonGroup
                    value={statusToggle}
                    exclusive
                    onChange={handleStatusToggle}
                    aria-label="status toggle"
                    size="small"
                    sx={{
                      border: "none",
                      gap: "8px",
                    }}
                  >
                    <ToggleButton
                      value="Pending"
                      aria-label="pending"
                      sx={{
                        borderRadius: "8px",
                        textTransform: "none",
                        fontWeight: 500,
                        px: "18px",
                        backgroundColor: STYLE_GUIDE.COLORS.backgroundDefault,
                        color: STYLE_GUIDE.COLORS.textPrimary,
                        "&.Mui-selected": {
                          backgroundColor: STYLE_GUIDE.COLORS.primary,
                          color: STYLE_GUIDE.COLORS.white,
                          "&:hover": {
                            backgroundColor: STYLE_GUIDE.COLORS.primary,
                            color: STYLE_GUIDE.COLORS.white,
                          },
                        },
                      }}
                    >
                      Pending
                    </ToggleButton>

                    <ToggleButton
                      value="Completed"
                      aria-label="completed"
                      size="small"
                      sx={{
                        borderRadius: "8px",
                        textTransform: "none",
                        fontWeight: 500,
                        px: "18px", // STYLE_GUIDE.SPACING.s6
                        backgroundColor: STYLE_GUIDE.COLORS.backgroundDefault,
                        color: STYLE_GUIDE.COLORS.textPrimary,
                        "&.Mui-selected": {
                          backgroundColor: STYLE_GUIDE.COLORS.primary,
                          color: STYLE_GUIDE.COLORS.white,
                          "&:hover": {
                            backgroundColor: STYLE_GUIDE.COLORS.primary,
                            color: STYLE_GUIDE.COLORS.white,
                          },
                        },
                      }}
                    >
                      Completed
                    </ToggleButton>
                  </ToggleButtonGroup>

                  {/* Date Range Selector with Dropdown */}

                  {/* <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      border: `1px solid ${
                        isDateRangeFocused
                          ? theme.input?.focusBorder || "blue"
                          : theme.getInputBorderColor()
                      }`,
                      borderRadius: "8px",
                      background: theme.getDropdownBackground(),
                      width: "280px",
                      overflow: "hidden",
                    }}
                  >
                    {/* Date Picker with Calendar + Cross 
                    <Box sx={{ position: "relative", flex: 1 }}>
                      <CalendarMonthIcon
                        style={{
                          position: "absolute",
                          left: "10px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: theme.palette.text.secondary,
                          pointerEvents: "none",
                        }}
                      />

                      <DatePicker
                        onOpen={() => handleDateRangeFocus(true)}
                        onClose={() => handleDateRangeFocus(false)}
                        calendarPosition="top"
                        value={dateRange}
                        onChange={handleDateRangeChange}
                        range
                        format="DD/MM/YYYY"
                        placeholder="Select Date Range"
                        numberOfMonths={2}
                        showOtherDays
                        inputClass="w-full"
                        style={{
                          width: "100%",
                          padding: "8px 28px 8px 38px",
                          fontSize: "14px",
                          border: "none",
                          background: "transparent",
                          color: theme.getInputTextColor(),
                          outline: "none",
                        }}
                      />

                      {dateRange && dateRange.length > 0 && (
                        <Button
                          onClick={handleClearDateRange}
                          size="small"
                          sx={{
                            position: "absolute",
                            left: "200px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            minWidth: "auto",
                            padding: "2px",
                            color: theme.palette.text.secondary,
                            "&:hover": { backgroundColor: "transparent" },
                          }}
                        >
                          ✕
                        </Button>
                      )}
                    </Box>

                    {/* Divider line 
                    <Box
                      sx={{
                        width: "1px",
                        height: "60%",
                        backgroundColor: theme.getInputBorderColor(),
                      }}
                    />

                    {/* Dropdown for Predefined Ranges 
                    <StyledSelect
                      value=""
                      onChange={(e) =>
                        handlePredefinedRangeSelection(e.target.value)
                      }
                      displayEmpty
                      sx={{
                        minWidth: 10,
                        border: "none",
                        borderRadius: 0,
                        backgroundColor: "transparent",
                        color: theme.getInputTextColor(),
                        "&:hover": { border: "none" },
                        "& .MuiOutlinedInput-notchedOutline": {
                          border: "none",
                        },
                        "& .MuiSelect-select": {
                          p: "8px 28px 8px 12px", // compact padding
                        },
                        "& .MuiSelect-icon": {
                          right: "2px",
                        },
                      }}
                    >
                      {(statusToggle === "Pending"
                        ? rangeOptions.Pending
                        : rangeOptions.Completed
                      ).map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </StyledSelect>
                  </Box> */}

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      border: `1px solid ${
                        isDateRangeFocused
                          ? theme.input?.focusBorder || "purple"
                          : theme.getInputBorderColor()
                      }`,
                      borderRadius: "8px",
                      background: theme.getDropdownBackground(),
                      width: "280px",
                      // overflow: "hidden",
                    }}
                  >
                    {/* Date Picker with Calendar + Cross */}
                    <Box
                      sx={{
                        position: "relative",
                        flex: 1,
                        marginLeft: "10px",
                        border: "1px solid transparent",
                        borderRadius: "8px",
                      }}
                    >
                      <DatePicker
                        onOpen={() => handleDateRangeFocus(true)}
                        onClose={() => handleDateRangeFocus(false)}
                        calendarPosition="top"
                        value={dateRange}
                        onChange={handleDateRangeChange}
                        range
                        format="DD/MM/YYYY"
                        placeholder="Select Date Range"
                        numberOfMonths={2}
                        showOtherDays
                        className="purple"
                        style={{
                          fontSize: "14px",
                        }}
                        maxDate={
                          statusToggle === "Completed" ? new Date() : undefined
                        }
                        // Remove inputClass, use inputProps with full width
                        inputProps={{
                          style: {
                            width: "100%",
                            padding: "8px 28px 8px 38px",
                            fontSize: "10px",
                            border: "none",
                            background: "transparent",
                            color: theme.getInputTextColor(),
                            outline: "none",
                            cursor: "pointer", // ensure clickable
                            fontFamily:
                              '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                          },
                        }}
                      />

                      {dateRange && dateRange.length > 0 && (
                        <Button
                          onClick={handleClearDateRange}
                          size="small"
                          sx={{
                            position: "absolute",
                            right: 13,
                            top: "50%",
                            transform: "translateY(-50%)",
                            minWidth: "auto",
                            padding: "2px",
                            color: theme.palette.text.secondary,
                            "&:hover": { backgroundColor: "transparent" },
                          }}
                        >
                          ✕
                        </Button>
                      )}
                    </Box>

                    {/* Divider line */}
                    <Box
                      sx={{
                        width: "1px",
                        height: "60%",
                        backgroundColor: theme.getInputBorderColor(),
                      }}
                    />

                    {/* Dropdown for Predefined Ranges */}
                    <StyledSelect
                      value=""
                      onChange={(e) =>
                        handlePredefinedRangeSelection(e.target.value)
                      }
                      displayEmpty
                      sx={{
                        minWidth: 10,
                        border: "none",
                        borderRadius: 0,
                        backgroundColor: "transparent",
                        color: theme.getInputTextColor(),
                        "&:hover": { border: "none" },
                        "& .MuiOutlinedInput-notchedOutline": {
                          border: "none",
                        },
                        "& .MuiSelect-select": {
                          p: "8px 28px 8px 12px", // compact padding
                        },
                        "& .MuiSelect-icon": {
                          right: "2px",
                        },
                      }}
                    >
                      {(statusToggle === "Pending"
                        ? rangeOptions.Pending
                        : rangeOptions.Completed
                      ).map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </StyledSelect>
                  </Box>
                </>
              )}
            </Box>
          )}
        </Box>

        {/* <Box sx={{ mr: STYLE_GUIDE.SPACING.s4 }}>
          {isEditMode ? (
            <StyledSelect
              label="Theme"
              value={selectedTheme}
              onChange={handleThemeChange}
              size="small"
              sx={{ minWidth: 180 }}
            >
              {themes?.map((theme) => (
                <MenuItem key={theme._id} value={theme._id}>
                  {theme.name}
                </MenuItem>
              ))}
            </StyledSelect>
          ) : null}
        </Box> */}

        <Box sx={{ display: "flex", gap: STYLE_GUIDE.SPACING.s4 }}>
          {isEditMode ? (
            <>
              <ButtonGroup
                variant="outlined"
                aria-label="grid columns"
                size="small"
              >
                <Button
                  onClick={() => handleGridColumns(1)}
                  variant={gridColumns === 1 ? "contained" : "outlined"}
                  sx={{ px: STYLE_GUIDE.SPACING.s6 }}
                >
                  <SquareIcon />
                </Button>
                <Button
                  onClick={() => handleGridColumns(2)}
                  variant={gridColumns === 2 ? "contained" : "outlined"}
                  sx={{ px: STYLE_GUIDE.SPACING.s6 }}
                >
                  <PauseIcon />
                </Button>
                <Button
                  onClick={() => handleGridColumns(3)}
                  variant={gridColumns === 3 ? "contained" : "outlined"}
                  sx={{ px: STYLE_GUIDE.SPACING.s6 }}
                >
                  <ViewColumnIcon />
                </Button>
              </ButtonGroup>
              {shouldAllowWidgetCreate && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setIsAddChartModalOpen(true);
                    setIsEditChartModalOpen(false);
                  }}
                  sx={{ ...getButtonSx(), px: STYLE_GUIDE.SPACING.s6 }}
                >
                  Add Chart
                </Button>
              )}
              <Button
                onClick={handleEditModeToggle}
                color="success"
                variant="contained"
                startIcon={<DoneIcon />}
                sx={{ ...getButtonSx(), px: STYLE_GUIDE.SPACING.s6 }}
                disabled={isAddChartModalOpen || isEditChartModalOpen}
              >
                Save
              </Button>
              <Button
                onClick={handleExportPDF}
                color="primary"
                variant="contained"
                disabled={isExportingPdf}
                startIcon={
                  isExportingPdf ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <PictureAsPdfIcon />
                  )
                }
                sx={{ ...getButtonSx(), px: STYLE_GUIDE.SPACING.s6 }}
              >
                {isExportingPdf ? "Exporting..." : "Export"}
              </Button>
            </>
          ) : (
            <>
              {currentDashboard?.isDefaultNotivix && (
                <Button
                  onClick={handleOpenFiltersModal}
                  variant="outlined"
                  startIcon={<FilterListIcon />}
                  sx={{ borderRadius: "8px", width: "140px" }}
                >
                  Filters
                </Button>
              )}
              <Box>
                {currentDashboard?.settings?.dashboardType === "normal" &&
                !currentDashboard?.isDefaultNotivix ? (
                  <Box>
                    {/* <CommonDatePicker
                      name="versionValue"
                      control={control}
                      views={["year", "month"]}
                      label="Period"
                      rules={{ required: "Period is required" }}
                      sx={{
                        "& .MuiInputBase-input": {
                          py: 1.1,
                        },
                        "& .MuiFormLabel-root": {
                          top: "-6px",
                        },
                        borderRadius: "8px",
                      }}
                    /> */}
                  </Box>
                ) : currentDashboard?.settings?.dashboardType === "trend" ? (
                  <Stack direction="row" spacing={STYLE_GUIDE.SPACING.s6}>
                    <CommonDatePicker
                      name="startDate"
                      control={control}
                      views={["year", "month"]}
                      label="Start Date"
                      rules={{ required: "Start date is required" }}
                      sx={{
                        "& .MuiInputBase-input": {
                          py: 1.1,
                        },
                      }}
                    />

                    <CommonDatePicker
                      name="endDate"
                      control={control}
                      views={["year", "month"]}
                      label="End Date"
                      rules={{ required: "End date is required" }}
                      sx={{
                        "& .MuiInputBase-input": {
                          py: 1.1,
                        },
                      }}
                    />
                  </Stack>
                ) : null}
              </Box>
              {shouldAllowDashboardUpdate &&
                (!currentDashboard?.isRoleDefault ||
                  shouldAllowDefaultDashboardUpdate) && (
                  <Button
                    onClick={handleEditModeToggle}
                    // color="primary"
                    variant="contained"
                    startIcon={<EditIcon />}
                    // sx={{ ...getButtonSx() }}
                    sx={{
                      borderRadius: "8px",
                      width: "120px",
                    }}
                  >
                    Edit
                  </Button>
                )}
              <Button
                onClick={handleExportPDF}
                color="primary"
                variant="contained"
                disabled={isExportingPdf}
                startIcon={
                  isExportingPdf ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <PictureAsPdfIcon />
                  )
                }
                sx={{
                  borderRadius: "8px",
                  minWidth: "140px",
                }}
              >
                {isExportingPdf ? "Exporting..." : "Export"}
              </Button>
            </>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          flex: 1,
          overflow: "hidden",
          gap: STYLE_GUIDE.SPACING.s6,
          height: "calc(100% - 100px)",
        }}
      >
        <Box
          ref={dashboardContainerRef}
          sx={{
            flex: 1,
            overflow: "auto",
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(auto-fit, minmax(400px, 1fr))",
              md: "repeat(auto-fit, minmax(450px, 1fr))",
              lg: "repeat(auto-fit, minmax(500px, 1fr))",
            },
            gap: STYLE_GUIDE.SPACING.s4,
            p: STYLE_GUIDE.SPACING.s4,

            transition: "all 0.3s ease",
            ...(isAddChartModalOpen && {
              flex: "1 1 70%",
            }),
            "&::-webkit-scrollbar": {
              width: "8px",
              height: "8px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "rgba(0, 0, 0, 0.1)",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "transparent",
            },
          }}
        >
          {dashboardId && (
            <ChartGrid
              dashboardId={dashboardId}
              isEditMode={isEditMode}
              onEditChart={handleEditChart}
              isAddChartModalOpen={isAddChartModalOpen}
              isEditChartModalOpen={isEditChartModalOpen}
              gridColumns={gridColumns}
              currentDashboard={currentDashboard as Dashboard}
              startVersionValue={
                currentDashboard?.settings?.dashboardType === "normal"
                  ? ""
                  : startVersionValue || ""
              }
              endVersionValue={
                currentDashboard?.settings?.dashboardType === "normal"
                  ? ""
                  : endVersionValue || ""
              }
              versionValue={versionValue || ""}
              isTrend={currentDashboard?.settings?.dashboardType === "trend"}
              dashboardFilters={dashboardFilters}
              isDefaultNotivix={currentDashboard?.isDefaultNotivix || false}
              onRegisterChartPreview={setChartPreviewRenderer}
            />
          )}
        </Box>

        {isAddChartModalOpen && (
          <Box
            sx={{
              width: {
                xs: "100%",
                sm: "400px",
                md: "450px",
                lg: "500px",
              },
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              borderLeft: "1px solid",
              borderColor: "divider",
              overflow: "hidden",
              height: "100%",
            }}
          >
            <AddChartModal
              open={isAddChartModalOpen}
              onClose={handleCloseModal}
              isSubmitting={false}
              dashboardId={dashboardId || ""}
              isTrend={currentDashboard?.settings?.dashboardType === "trend"}
              currentDashboard={currentDashboard}
              startVersionValue={startVersionValue}
              endVersionValue={endVersionValue}
              versionValue={formattedVersionValue}
            />
          </Box>
        )}
      </Box>

      <EditChartModal
        open={isEditChartModalOpen && !!selectedChart}
        chart={selectedChart}
        chartPreviewRenderer={chartPreviewRenderer}
        numberChartColor={selectedNumberChartColor}
        onClose={handleCloseEditModal}
        onSave={handleChartUpdate}
        dashboardId={dashboardId || ""}
        isTrend={currentDashboard?.settings?.dashboardType === "trend"}
        currentDashboard={currentDashboard}
        startVersionValue={startVersionValue}
        endVersionValue={endVersionValue}
        versionValue={formattedVersionValue}
        dashboardFilters={dashboardFilters}
        isUpdating={isChartUpdating}
      />
      {currentDashboard?.isDefaultNotivix === true && isFiltersModalOpen ? (
        <NotivixFiltersModal
          open={isFiltersModalOpen}
          onClose={handleCloseFiltersModal}
          onApplyFilters={handleApplyFilters}
          currentFilters={dashboardFilters}
          dataSourceId={currentDashboard?.settings?.dataSource?._id} // Pass your dataSourceId here
          filterFlag="isFilterEnable" // Specify which flag to use for filtering
          isLoading={dataSourceDetailsLoading}
          defaultFilters={{
            "Derived.Case Status": "Pending",
            "Derived.Handled By": "In House",
            DueDate: {
              startDate: new DateObject().format("YYYY-MM-DD"),
              endDate: new DateObject(new DateObject())
                .add(1, "month")
                .format("YYYY-MM-DD"),
            },
          }}
        />
      ) : (
        ""
      )}
    </Box>
  );
};

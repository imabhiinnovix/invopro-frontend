import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Box, Typography, TextField, Button, ButtonGroup, Stack, MenuItem, SelectChangeEvent } from '@mui/material';
import StyledSelect from '../../../components/atom/common/StyledSelect';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DoneIcon from '@mui/icons-material/Done';
import PauseIcon from '@mui/icons-material/Pause';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import SquareIcon from '@mui/icons-material/Square';
import { useParams, useLocation } from 'react-router-dom';
import { ChartGrid } from './ChartGrid';
import { AddChartModal, ChartFormData } from './AddChartModal';
import { useAppDispatch, useAppSelector } from '../../../storeHooks';
import { updateWidget, saveWidgets, fetchWidgetTheme, fetchChartData, selectDashboardTheme } from '../dashboardActions';
import { toast } from 'react-toastify';
import { ChartResponse, TemporaryChart, Dashboard } from '../types';
import usePost from '../../../hooks/usePost';
import { POST } from '../../../services/apiRoutes';
import CommonDatePicker from '../../../components/common/datePicker/datePicker';
import { useForm } from 'react-hook-form';
import { DateTime } from 'luxon';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { fetchThemeList } from '../../createTheme/themeActions';
import { STYLE_GUIDE } from '../../../styles';
import { useUnifiedTheme } from '../../../hooks/useUnifiedTheme';
import { useComponentTypography } from '../../../hooks/useComponentTypography';
import NotivixFiltersModal from '../../notivixDashboard/components/NotivixFiltersModal';
import { GridFilterListIcon } from '@mui/x-data-grid';

interface DashboardViewProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ title: initialTitle, onTitleChange }): JSX.Element => {
  const theme = useUnifiedTheme();
  const { getHeadingSx, getButtonSx } = useComponentTypography();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState(initialTitle);
  const [title, setTitle] = useState(initialTitle);
  const [isAddChartModalOpen, setIsAddChartModalOpen] = useState(false);
  const [isEditChartModalOpen, setIsEditChartModalOpen] = useState(false);
  const [selectedChart, setSelectedChart] = useState<ChartResponse | null>(null);
  const [gridColumns, setGridColumns] = useState(2);
  const [selectedTheme, setSelectedTheme] = useState<string>('');

  const inputRef = useRef<HTMLInputElement>(null);
  const { id: dashboardId } = useParams();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const temporaryCharts = useAppSelector((state) => state.dashboard.temporaryCharts);
  const dashboards = useAppSelector((state) => state.dashboard.dashboards);
  const currentDashboard = dashboards.find((d) => d._id === dashboardId);
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [dashboardFilters, setDashboardFilters] = useState<any>({});
  const { dataSourceDetails, dataSourceDetailsLoading } = useAppSelector((state) => state.notivixDashboard);
  const { themes } = useAppSelector((state) => state.theme);

  const postGridColumns = usePost(['']);

  const handleOpenFiltersModal = async () => {
    if (currentDashboard?.settings?.dataSource?._id) {
      try {
        setIsFiltersModalOpen(true);
      } catch (error) {
        toast.error('Failed to load filters. Please try again.');
      }
    } else {
      setIsFiltersModalOpen(true);
    }
  };

  const handleCloseFiltersModal = () => {
    setIsFiltersModalOpen(false);
  };
  const handleApplyFilters = async (filters: any) => {
    setDashboardFilters(filters);
  };
  const validationSchema = yup.object({
    versionValue: yup.string().nullable().optional(),
    startDate: yup
      .string()
      .nullable()
      .when('$isDashboardTrend', ([isDashboardTrend]) => {
        if (isDashboardTrend) {
          return yup.string().nullable().required('Start date is required');
        }
        return yup.string().nullable().optional();
      }),
    endDate: yup
      .string()
      .nullable()
      .when(['$isDashboardTrend', 'startDate'], ([isDashboardTrend, startDate]) => {
        if (isDashboardTrend && startDate) {
          return yup
            .string()
            .nullable()
            .required('End date is required')
            .test('is-after-start', 'End date must be after or equal to start date', function (value) {
              const { startDate } = this.parent;
              if (!value || !startDate) return true;

              try {
                const startDateTime = DateTime.fromISO(startDate);
                const endDateTime = DateTime.fromISO(value);
                return endDateTime >= startDateTime;
              } catch {
                return false;
              }
            });
        }
        return yup.string().nullable().optional();
      }),
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
      isDashboardTrend: currentDashboard?.settings?.dashboardType === 'trend',
    },
  });

  const versionValue = watch('versionValue');
  const formattedVersionValue = versionValue ? DateTime.fromISO(versionValue).toFormat('yyyy-LL') : undefined;

  const startDate = watch('startDate');
  const startVersionValue = startDate ? DateTime.fromISO(startDate).toFormat('yyyy-LL') : undefined;

  const endDate = watch('endDate');
  const endVersionValue = endDate ? DateTime.fromISO(endDate).toFormat('yyyy-LL') : undefined;

  useEffect(() => {
    if (dashboards.length > 0) {
      setGridColumns(dashboards.find((dashboard) => dashboard?._id === dashboardId)?.settings?.gridColumns || 2);
    }
  }, [dashboards, dashboardId]);

  const hasErrors = useMemo(() => {
    return !!errors.startDate || !!errors.endDate;
  }, [errors.startDate, errors.endDate]);

  useEffect(() => {
    if (dashboardId) {
      if (currentDashboard?.settings?.dashboardType === 'normal') {
        dispatch(
          fetchChartData({
            dashboardId,
            // versionValue: formattedVersionValue || "",
            dashboardType: 'normal',
            startVersionValue,
            endVersionValue,
            versionValue,
            dashboardFilters,
          })
        );
      } else if (
        currentDashboard?.settings?.dashboardType === 'trend' &&
        startVersionValue &&
        endVersionValue &&
        DateTime.fromISO(startVersionValue) < DateTime.fromISO(endVersionValue) &&
        !hasErrors
      ) {
        dispatch(
          fetchChartData({
            dashboardId,
            versionValue: undefined,
            startVersionValue,
            endVersionValue,
            dashboardType: currentDashboard?.settings?.dashboardType,
            dashboardFilters,
          })
        );
      }
    }
  }, [
    currentDashboard?.settings?.dashboardType,
    dashboardId,
    dispatch,
    endVersionValue,
    formattedVersionValue,
    hasErrors,
    startVersionValue,
  ]);

  useEffect(() => {
    setIsEditMode(false);
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
    if (currentDashboard?.settings) {
      setValue('versionValue', null);

      const currentDate = DateTime.now();
      setValue('endDate', currentDate.toISO());

      if (currentDashboard.settings.dynamicVersionValue) {
        const period = currentDashboard.settings.dynamicVersionValue;
        let monthsToSubtract = 1;

        switch (period) {
          case '1m':
            monthsToSubtract = 1;
            break;
          case '3m':
            monthsToSubtract = 3;
            break;
          case '6m':
            monthsToSubtract = 6;
            break;
          case '12m':
            monthsToSubtract = 12;
            break;
        }

        const startDate = currentDate.minus({ months: monthsToSubtract });
        setValue('startDate', startDate.toISO());
      } else {
        setValue('startDate', currentDate.minus({ months: 1 }).toISO());
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
        setTitle(editedTitle);
      }

      // Save temporary charts only if there are any
      if (temporaryCharts.length > 0) {
        try {
          const result = await dispatch(
            saveWidgets({
              widgets: temporaryCharts.map((chart: TemporaryChart) => ({
                dashboardId: chart.dashboardId,
                widgetTypeId: chart.widgetTypeId?._id || '',
                name: chart.name,
                dimensions: chart.dimensions.join(','),
                groupBy: chart.groupBy,
                aggregation: chart.aggregation,
                position: chart.position,
                conditions: chart.conditions,
                dataSourceId: chart.dataSourceId?._id || '',
                entityId: chart.dataSourceId?.entityId || '',
                isIncremental: chart.isIncremental || false,
              })),
            })
          ).unwrap();

          if (result.success) {
            toast.success('Charts saved successfully!');
          } else {
            toast.error(result.message || 'Failed to save charts');
          }
        } catch (error) {
          if (typeof error === 'object' && error !== null && 'message' in error) {
            toast.error(error.message as string);
          } else {
            toast.error('Failed to save charts');
          }
        }
      }

      setIsEditMode(false);
    } else {
      setIsEditMode(!isEditMode);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onTitleChange(editedTitle);
      setIsEditMode(false);
    }
  };

  const handleCloseModal = () => {
    setIsAddChartModalOpen(false);
  };

  const handleEditChart = (chart: ChartResponse) => {
    setSelectedChart(chart);
    setIsEditChartModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditChartModalOpen(false);
    setSelectedChart(null);
  };

  const handleChartUpdate = async (formData: ChartFormData) => {
    if (!selectedChart) return;

    try {
      const result = await dispatch(
        updateWidget({
          ...formData,
          _id: selectedChart._id,
          dashboardId: dashboardId || '',
        })
      ).unwrap();

      if (result.success) {
        toast.success('Chart updated successfully!');
        handleCloseEditModal();

        // Fetch updated chart data
        if (dashboardId) {
          dispatch(
            fetchChartData({
              dashboardId,
              dashboardType: currentDashboard?.settings?.dashboardType || 'normal',
              startVersionValue,
              endVersionValue,
              versionValue: formattedVersionValue || '',
              dashboardFilters,
            })
          );
        }
      } else {
        toast.error(result.message || 'Failed to update chart');
      }
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'message' in error) {
        toast.error(error.message as string);
      } else {
        toast.error('Failed to update chart');
      }
    }
  };

  useEffect(() => {
    if (startDate && endDate && currentDashboard?.settings?.dashboardType === 'trend') {
      trigger('endDate');
      trigger('startDate');
    }
  }, [startDate, endDate, currentDashboard?.settings?.dashboardType, trigger]);

  const handleThemeChange = async (event: SelectChangeEvent<unknown>) => {
    const themeId = event.target.value as string;
    setSelectedTheme(themeId);

    if (dashboardId) {
      try {
        const result = await dispatch(selectDashboardTheme({ dashboardId, widgetThemeId: themeId })).unwrap();

        if (result.success) {
          toast.success('Theme updated successfully!');
          dispatch(fetchWidgetTheme(themeId));
        } else {
          toast.error(result.message || 'Failed to update theme');
        }
      } catch (error) {
        if (typeof error === 'object' && error !== null && 'message' in error) {
          toast.error(error.message as string);
        } else {
          toast.error('Failed to update theme');
        }
      }
    }
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          p: STYLE_GUIDE.SPACING.s6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          gap: STYLE_GUIDE.SPACING.s4,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Box sx={{ flex: 1, mr: STYLE_GUIDE.SPACING.s4 }}>
          {isEditMode ? (
            <TextField
              inputRef={inputRef}
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onKeyDown={handleKeyPress}
              size="small"
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: STYLE_GUIDE.SPACING.s2,
                  alignItems: 'flex-start',
                  paddingRight: STYLE_GUIDE.SPACING.s2,
                  fontSize: '14px',
                  backgroundColor: theme.getDropdownBackground(),
                  '& fieldset': { borderColor: theme.getInputBorderColor() },
                  '&:hover fieldset': { borderColor: theme.border?.hover || STYLE_GUIDE.COLORS.darkBorderHover },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.input?.focusBorder || STYLE_GUIDE.COLORS.inputFocusFallback,
                  },
                },
                '& .MuiInputLabel-root': { color: theme.palette.text.secondary },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: theme.input?.focusBorder || STYLE_GUIDE.COLORS.inputFocusFallback,
                },
                '& .MuiInputBase-input': { color: `${theme.getInputTextColor()} !important` },
                '& .MuiInputBase-input::placeholder': { color: `${theme.palette.text.secondary} !important` },
                '& .MuiInputBase-input:-webkit-autofill': {
                  WebkitTextFillColor: `${theme.getInputTextColor()} !important`,
                  WebkitBoxShadow: `0 0 0 1000px ${theme.getDropdownBackground()} inset !important`,
                },
              }}
            />
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
          )}
        </Box>

        <Box sx={{ mr: STYLE_GUIDE.SPACING.s4 }}>
          {isEditMode ? (
            <StyledSelect
              label="Theme"
              value={selectedTheme}
              onChange={handleThemeChange}
              size="small"
              sx={{ minWidth: 200 }}
            >
              {themes?.map((theme) => (
                <MenuItem key={theme._id} value={theme._id}>
                  {theme.name}
                </MenuItem>
              ))}
            </StyledSelect>
          ) : null}
        </Box>

        <Box sx={{ display: 'flex', gap: STYLE_GUIDE.SPACING.s4 }}>
          {isEditMode ? (
            <>
              <ButtonGroup variant="outlined" aria-label="grid columns" size="small">
                <Button
                  onClick={() => handleGridColumns(1)}
                  variant={gridColumns === 1 ? 'contained' : 'outlined'}
                  sx={{ px: STYLE_GUIDE.SPACING.s6 }}
                >
                  <SquareIcon />
                </Button>
                <Button
                  onClick={() => handleGridColumns(2)}
                  variant={gridColumns === 2 ? 'contained' : 'outlined'}
                  sx={{ px: STYLE_GUIDE.SPACING.s6 }}
                >
                  <PauseIcon />
                </Button>
                <Button
                  onClick={() => handleGridColumns(3)}
                  variant={gridColumns === 3 ? 'contained' : 'outlined'}
                  sx={{ px: STYLE_GUIDE.SPACING.s6 }}
                >
                  <ViewColumnIcon />
                </Button>
              </ButtonGroup>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => setIsAddChartModalOpen(true)}
                sx={{ ...getButtonSx(), px: STYLE_GUIDE.SPACING.s6 }}
              >
                Add Chart
              </Button>
              <Button
                onClick={handleEditModeToggle}
                color="success"
                variant="contained"
                startIcon={<DoneIcon />}
                sx={{ ...getButtonSx(), px: STYLE_GUIDE.SPACING.s6 }}
              >
                Save
              </Button>
            </>
          ) : (
            <>
              {!!currentDashboard?.settings?.dataSource?._id && (
                <Button
                  onClick={handleOpenFiltersModal}
                  color="secondary"
                  variant="outlined"
                  startIcon={<GridFilterListIcon />}
                  sx={{
                    ...getButtonSx(),
                    borderColor: theme.getInputBorderColor(),
                    color: theme.palette.text.primary,
                    '&:hover': {
                      borderColor: theme.border?.hover || STYLE_GUIDE.COLORS.darkBorderHover,
                    },
                  }}
                >
                  Filters
                </Button>
              )}
              <Box>
                {currentDashboard?.settings?.dashboardType === 'normal' ? (
                  <Box>
                    <CommonDatePicker
                      name="versionValue"
                      control={control}
                      views={['year', 'month']}
                      label="Period"
                      rules={{ required: 'Period is required' }}
                      sx={{
                        '& .MuiInputBase-input': {
                          py: 1.1,
                        },
                        '& .MuiFormLabel-root': {
                          top: '-6px',
                        },
                      }}
                    />
                  </Box>
                ) : currentDashboard?.settings?.dashboardType === 'trend' ? (
                  <Stack direction="row" spacing={STYLE_GUIDE.SPACING.s6}>
                    <CommonDatePicker
                      name="startDate"
                      control={control}
                      views={['year', 'month']}
                      label="Start Date"
                      rules={{ required: 'Start date is required' }}
                      sx={{
                        '& .MuiInputBase-input': {
                          py: 1.1,
                        },
                      }}
                    />

                    <CommonDatePicker
                      name="endDate"
                      control={control}
                      views={['year', 'month']}
                      label="End Date"
                      rules={{ required: 'End date is required' }}
                      sx={{
                        '& .MuiInputBase-input': {
                          py: 1.1,
                        },
                      }}
                    />
                  </Stack>
                ) : null}
              </Box>
              <Button
                onClick={handleEditModeToggle}
                color="primary"
                variant="contained"
                startIcon={<EditIcon />}
                sx={{ ...getButtonSx() }}
              >
                Edit
              </Button>
            </>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
          gap: STYLE_GUIDE.SPACING.s6,
          height: 'calc(100% - 100px)',
        }}
      >
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(auto-fit, minmax(400px, 1fr))',
              md: 'repeat(auto-fit, minmax(450px, 1fr))',
              lg: 'repeat(auto-fit, minmax(500px, 1fr))',
            },
            gap: STYLE_GUIDE.SPACING.s4,
            p: STYLE_GUIDE.SPACING.s4,

            transition: 'all 0.3s ease',
            ...((isAddChartModalOpen || isEditChartModalOpen) && {
              flex: '1 1 70%',
            }),
            '&::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'transparent',
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
              startVersionValue={currentDashboard?.settings?.dashboardType === 'normal' ? '' : startVersionValue || ''}
              endVersionValue={currentDashboard?.settings?.dashboardType === 'normal' ? '' : endVersionValue || ''}
              versionValue={versionValue || ''}
              isTrend={currentDashboard?.settings?.dashboardType === 'trend'}
            />
          )}
        </Box>

        {(isAddChartModalOpen || isEditChartModalOpen) && (
          <Box
            sx={{
              width: {
                xs: '100%',
                sm: '400px',
                md: '450px',
                lg: '500px',
              },
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              borderLeft: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden',
              height: '100%',
            }}
          >
            {isAddChartModalOpen && (
              <AddChartModal
                open={isAddChartModalOpen}
                onClose={handleCloseModal}
                isSubmitting={false}
                dashboardId={dashboardId || ''}
                isTrend={currentDashboard?.settings?.dashboardType === 'trend'}
                currentDashboard={currentDashboard}
                startVersionValue={startVersionValue}
                endVersionValue={endVersionValue}
                versionValue={formattedVersionValue}
              />
            )}
            {isEditChartModalOpen && selectedChart && (
              <AddChartModal
                open={isEditChartModalOpen}
                onClose={handleCloseEditModal}
                isSubmitting={false}
                dashboardId={dashboardId || ''}
                initialData={selectedChart}
                onSave={handleChartUpdate}
                isTrend={currentDashboard?.settings?.dashboardType === 'trend'}
                currentDashboard={currentDashboard}
                startVersionValue={startVersionValue}
                endVersionValue={endVersionValue}
                versionValue={formattedVersionValue}
              />
            )}
          </Box>
        )}
      </Box>
      {!!currentDashboard?.settings?.dataSource?._id && (
        <NotivixFiltersModal
          open={isFiltersModalOpen}
          onClose={handleCloseFiltersModal}
          onApplyFilters={handleApplyFilters}
          // currentFilters={currentFilters}
          dataSourceId={currentDashboard?.settings?.dataSource?._id} // Pass your dataSourceId here
          filterFlag="isFilterEnable" // Specify which flag to use for filtering
          isLoading={dataSourceDetailsLoading}
        />
      )}
    </Box>
  );
};

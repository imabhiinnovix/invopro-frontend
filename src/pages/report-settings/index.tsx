import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Typography,
    Paper,
    Box,
    CircularProgress,
    MenuItem,
    Button,
    Divider,
    Alert,
    Stepper,
    Step,
    StepLabel,
    useTheme,
    Card,
    CardContent
} from "@mui/material";
import StyledSelect from "../../components/atom/common/StyledSelect";
import { fetchCustomReportSettings } from "./customReportsActions";
import { RootState, AppDispatch } from "../../store";
import CheckIcon from "@mui/icons-material/Check";
import { STYLE_GUIDE } from '../../styles';
import FilterColumnsEditor from "./components/FilterColumnsEditor";
import ReportNameEditor from "./components/ReportNameEditor";
import SheetNameEditor from "./components/SheetNameEditor";
import AddColumnModal from "./components/AddColumnModal";
import ConfirmDialog from "./components/ConfirmDialog";
import type { Report, FilterColumn, ReportSetting } from "./types";
import { POST } from "../../services/apiRoutes";
import usePost from "../../hooks/usePost";
import { useUnifiedTheme } from '../../hooks/useUnifiedTheme';


const ReportSettings: React.FC = () => {
    const theme = useUnifiedTheme();
    const dispatch = useDispatch<AppDispatch>();
    const { settings = [], loading, error } = useSelector((state: RootState) => state.customReports);
    const [selectedReportId, setSelectedReportId] = useState<any>("");

    const [editReportName, setEditReportName] = useState<string>("");
    const [isEditingReportName, setIsEditingReportName] = useState(false);

    const [selectedSheetCode, setSelectedSheetCode] = useState<string>("");
    const [editSheetName, setEditSheetName] = useState<string>("");
    const [isEditingSheetName, setIsEditingSheetName] = useState(false);

    const [editingColumns, setEditingColumns] = useState<{ [key: string]: boolean }>({});
    const [editColumnValues, setEditColumnValues] = useState<{ [key: string]: string }>({});
    const [attributeValueInputs, setAttributeValueInputs] = useState<{ [key: string]: string }>({});

    const [localSettings, setLocalSettings] = useState<Report[]>([]);

    const [addColumnModal, setAddColumnModal] = useState({
        open: false,
        filterId: "",
        filterInfo: null as { section: string; attribute: string } | null
    });

    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        columnId: string | null;
    }>({ open: false, columnId: null });

    const [originalColumnData, setOriginalColumnData] = useState<{ [key: string]: FilterColumn }>({});

    const selectedReport = localSettings.find(r => r._id === selectedReportId);
    const selectedSheet = selectedReport?.reportSettings.find(s => s.sheetCode === selectedSheetCode);
    const selectedFilters = selectedReport?.filters.filter(f => f.sheetCode === selectedSheetCode) || [];

    useEffect(() => {
        dispatch(fetchCustomReportSettings());
    }, [dispatch]);

    useEffect(() => {
        if (settings.length > 0) {
            setLocalSettings([...settings]);
        }
    }, [settings]);

    useEffect(() => {
        const currentReport = localSettings.find(r => r._id === selectedReportId);
        setEditReportName(currentReport?.reportName || "");
        setSelectedSheetCode("");
        setIsEditingReportName(false);
        setIsEditingSheetName(false);
    }, [selectedReportId]);

    useEffect(() => {
        setEditSheetName(selectedSheet?.sheetName || "");
        setIsEditingSheetName(false);
    }, [selectedSheetCode]);

    const handleEditReportName = () => setIsEditingReportName(true);

    const handleCancelEditReportName = () => {
        const currentReport = localSettings.find(r => r._id === selectedReportId);
        setEditReportName(currentReport?.reportName || "");
        setIsEditingReportName(false);
    };

    const handleSaveReportName = () => {
        if (editReportName.trim() === "") {
            return;
        }

        setLocalSettings(prev =>
            prev.map(report =>
                report._id === selectedReportId
                    ? { ...report, reportName: editReportName }
                    : report
            )
        );

        setIsEditingReportName(false);

    };

    const handleEditSheetName = () => setIsEditingSheetName(true);

    const handleCancelEditSheetName = () => {
        setEditSheetName(selectedSheet?.sheetName || "");
        setIsEditingSheetName(false);
    };

    const handleSaveSheetName = () => {
        if (editSheetName.trim() === "") {
            return;
        }

        setLocalSettings(prev =>
            prev.map(report =>
                report._id === selectedReportId
                    ? {
                        ...report,
                        reportSettings: report.reportSettings.map(sheet =>
                            sheet.sheetCode === selectedSheetCode
                                ? { ...sheet, sheetName: editSheetName }
                                : sheet
                        )
                    }
                    : report
            )
        );

        setIsEditingSheetName(false);

    };

    const handleEditColumn = (columnId: string) => {
        const column = selectedFilters.flatMap(f => f.columns).find(c => c._id === columnId);
        if (column) {
            setEditColumnValues(prev => ({ ...prev, [columnId]: column.reportHeader }));
            setEditingColumns(prev => ({ ...prev, [columnId]: true }));
            setOriginalColumnData(prev => ({ ...prev, [columnId]: { ...column, attributeValues: [...column.attributeValues] } }));
        }
    };

    const handleCancelEditColumn = (columnId: string) => {
        const original = originalColumnData[columnId];
        if (original) {
            setLocalSettings(prev =>
                prev.map(report =>
                    report._id === selectedReportId
                        ? {
                            ...report,
                            filters: report.filters.map(filter => ({
                                ...filter,
                                columns: filter.columns.map(column =>
                                    column._id === columnId
                                        ? { ...original }
                                        : column
                                )
                            }))
                        }
                        : report
                )
            );
        }
        setEditingColumns(prev => ({ ...prev, [columnId]: false }));
        setEditColumnValues(prev => {
            const newValues = { ...prev };
            delete newValues[columnId];
            return newValues;
        });
        setAttributeValueInputs(prev => {
            const newInputs = { ...prev };
            delete newInputs[columnId];
            return newInputs;
        });
        setOriginalColumnData(prev => {
            const newData = { ...prev };
            delete newData[columnId];
            return newData;
        });
    };

    const handleSaveColumn = (columnId: string) => {
        const newValue = editColumnValues[columnId]?.trim();
        if (!newValue) {
            return;
        }

        setLocalSettings(prev =>
            prev.map(report =>
                report._id === selectedReportId
                    ? {
                        ...report,
                        filters: report.filters.map(filter => ({
                            ...filter,
                            columns: filter.columns.map(column =>
                                column._id === columnId
                                    ? { ...column, reportHeader: newValue }
                                    : column
                            )
                        }))
                    }
                    : report
            )
        );

        setEditingColumns(prev => ({ ...prev, [columnId]: false }));
        setEditColumnValues(prev => {
            const newValues = { ...prev };
            delete newValues[columnId];
            return newValues;
        });

    };

    const handleAddColumn = (filterId: string) => {
        const filter = selectedFilters.find(f => f._id === filterId);
        if (filter) {
            setAddColumnModal({
                open: true,
                filterId,
                filterInfo: {
                    section: filter.section,
                    attribute: filter.attribute
                }
            });
        }
    };

    const handleCloseAddColumnModal = () => {
        setAddColumnModal({
            open: false,
            filterId: "",
            filterInfo: null
        });
    };

    const handleAddColumnSubmit = async (reportHeader: string, attributeValues: string[]) => {
        try {
            const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            const newColumn: FilterColumn = {
                _id: tempId,
                reportHeader,
                attributeValues
            };

            setLocalSettings(prev =>
                prev.map(report =>
                    report._id === selectedReportId
                        ? {
                            ...report,
                            filters: report.filters.map(filter =>
                                filter._id === addColumnModal.filterId
                                    ? { ...filter, columns: [...filter.columns, newColumn] }
                                    : filter
                            )
                        }
                        : report
                )
            );


        } catch (e) {
            console.error(e);
        }
    };

    const handleDeleteColumn = (columnId: string) => {
        setDeleteDialog({ open: true, columnId });
    };

    const handleConfirmDeleteColumn = () => {
        if (deleteDialog.columnId) {
            setLocalSettings(prev =>
                prev.map(report =>
                    report._id === selectedReportId
                        ? {
                            ...report,
                            filters: report.filters.map(filter => ({
                                ...filter,
                                columns: filter.columns.filter(column => column._id !== deleteDialog.columnId),
                            })),
                        }
                        : report
                )
            );
        }
        setDeleteDialog({ open: false, columnId: null });
    };

    const handleCancelDeleteColumn = () => {
        setDeleteDialog({ open: false, columnId: null });
    };

    const handleRemoveAttributeValue = (columnId: string, valueToRemove: string) => {
        setLocalSettings(prev =>
            prev.map(report =>
                report._id === selectedReportId
                    ? {
                        ...report,
                        filters: report.filters.map(filter => ({
                            ...filter,
                            columns: filter.columns.map(column =>
                                column._id === columnId
                                    ? {
                                        ...column,
                                        attributeValues: column.attributeValues.filter(value => value !== valueToRemove)
                                    }
                                    : column
                            )
                        }))
                    }
                    : report
            )
        );

    };

    const post = usePost(["update-report-settings"]);

    const handleSaveAllChanges = async () => {
        try {
            if (!selectedReport) return;

            const output = {
                reportName: selectedReport.reportName,
                reportSettings: selectedReport.reportSettings.map(sheet => ({
                    sheetName: sheet.sheetName,
                    sheetCode: sheet.sheetCode,
                })),
                filters: selectedReport.filters.map(filter => ({
                    sheetCode: filter.sheetCode,
                    section: filter.section,
                    attribute: filter.attribute,
                    columns: filter.columns.map(col => ({
                        reportHeader: col.reportHeader,
                        attributeValues: col.attributeValues,
                        ...(col._id ? { _id: col._id } : {})
                    }))
                }))
            };

            post.mutate(
                {
                    url: `${POST.UPDATE_REPORT_SETTINGS}/${selectedReport._id}`,
                    payload: output,
                },
                {
                    onSuccess: () => {
                        dispatch(fetchCustomReportSettings());
                    },
                    onError: (e: any) => {
                        dispatch(fetchCustomReportSettings());
                        console.error(e);
                    }
                }
            );

        } catch (e) {
            console.error(e);
        }
    };

    const getActiveStep = () => {
        if (!selectedReportId) return 0;
        if (!selectedSheetCode) return 1;
        return 2;
    };

    const steps = [
        "Select Report",
        "Edit Sheet",
        "Edit Filter Columns",
    ];

    const isAnyEditActive =
        isEditingReportName ||
        isEditingSheetName ||
        Object.values(editingColumns).some(Boolean);

    return (
        <Box sx={{ backgroundColor: theme.palette.background.paper }}>
            <Paper elevation={3} sx={{
                p: STYLE_GUIDE.SPACING.s4,
                mt: STYLE_GUIDE.SPACING.s4,
                borderRadius: STYLE_GUIDE.SPACING.s1,
                bgcolor: theme.palette.background.paper,
                boxShadow: theme.shadows[3],
            }}>
                <Typography
                    variant="h4"
                    textAlign="center"
                    gutterBottom
                    sx={{
                        fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold,
                        color: theme.palette.primary.main,
                        mb: STYLE_GUIDE.SPACING.s8,
                        letterSpacing: 1,
                    }}
                >
                    Report Settings Management
                </Typography>

                <Stepper activeStep={getActiveStep()} alternativeLabel sx={{ mb: STYLE_GUIDE.SPACING.s4 }}>
                    {steps.map(label => (
                        <Step key={label}>
                            <StepLabel
                                sx={{
                                    '& .MuiStepLabel-label': {
                                        fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
                                        color: theme.palette.text.secondary,
                                    },
                                    '&.Mui-active .MuiStepLabel-label': {
                                        color: theme.palette.primary.main,
                                        fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
                                    },
                                    '&.Mui-completed .MuiStepLabel-label': {
                                        color: theme.palette.success.main,
                                    }
                                }}
                            >
                                {label}
                            </StepLabel>
                        </Step>
                    ))}
                </Stepper>

                <Divider sx={{ mb: STYLE_GUIDE.SPACING.s3 }} />

                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                        <CircularProgress color="primary" />
                    </Box>
                ) : error ? (
                    <Alert severity="error">{error}</Alert>
                ) : (
                    <Box>
                        <Card sx={{ 
                            mb: 3, 
                            border: `1px solid ${theme.palette.border?.main}`,
                            backgroundColor: theme.palette.card?.background || STYLE_GUIDE.COLORS.backgroundSurface,
                            '&:hover': {
                                boxShadow: theme.shadows[4],
                                borderColor: `${theme.palette.border?.hover}`,
                            }
                        }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom sx={{ 
                                    fontWeight: 600,
                                    color: theme.palette.text.primary,
                                }}>
                                    Select Report
                                </Typography>
                                <StyledSelect
                                    label="Select Report to Edit"
                                    value={selectedReportId}
                                    onChange={(e) => {
                                        setSelectedReportId(e.target.value as string);
                                        setIsEditingReportName(false);
                                        setIsEditingSheetName(false);
                                    }}
                                >
                                    {settings.map(report => (
                                        <MenuItem key={report._id} value={report._id}>
                                            {report.reportName}
                                        </MenuItem>
                                    ))}
                                </StyledSelect>
                            </CardContent>
                        </Card>

                        {selectedReport && (
                            <>
                                <Card sx={{ 
                                    mb: 3, 
                                    border: `1px solid ${theme.palette.border?.main}`,
                                    backgroundColor: theme.palette.card?.background || STYLE_GUIDE.COLORS.backgroundSurface,
                                    '&:hover': {
                                        boxShadow: theme.shadows[4],
                                        borderColor: `${theme.palette.border?.hover}`,
                                    }
                                }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Typography variant="h6" gutterBottom sx={{ 
                                            fontWeight: 600,
                                            color: theme.palette.text.primary,
                                        }}>
                                            Edit Report Name
                                        </Typography>
                                        <ReportNameEditor
                                            reportName={selectedReport.reportName}
                                            editReportName={editReportName}
                                            isEditing={isEditingReportName}
                                            onEdit={handleEditReportName}
                                            onChange={setEditReportName}
                                            onSave={handleSaveReportName}
                                            onCancel={handleCancelEditReportName}
                                        />
                                    </CardContent>
                                </Card>

                                <Card sx={{ 
                                    mb: 3, 
                                    border: `1px solid ${theme.palette.border?.main}`,
                                    backgroundColor: theme.palette.card?.background || STYLE_GUIDE.COLORS.backgroundSurface,
                                    '&:hover': {
                                        boxShadow: theme.shadows[4],
                                        borderColor: `${theme.palette.border?.hover}`,
                                    }
                                }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Typography variant="h6" gutterBottom sx={{ 
                                            fontWeight: 600,
                                            color: theme.palette.text.primary,
                                        }}>
                                            Select and Edit Sheet Settings
                                        </Typography>
                                        <StyledSelect
                                            label="Select Sheet to Edit"
                                            value={selectedSheetCode}
                                            onChange={(e) => setSelectedSheetCode(e.target.value as string)}
                                            sx={{ mb: 2 }}
                                        >
                                            {settings.find(r => r._id === selectedReportId)?.reportSettings.map((sheet: ReportSetting) => (
                                                <MenuItem key={sheet._id} value={sheet.sheetCode}>
                                                    {sheet.sheetName}
                                                </MenuItem>
                                            ))}
                                        </StyledSelect>
                                        {selectedSheet && (
                                            <SheetNameEditor
                                                sheetCode={selectedSheet.sheetCode}
                                                sheetName={selectedSheet.sheetName}
                                                editSheetName={editSheetName}
                                                isEditing={isEditingSheetName}
                                                onEdit={handleEditSheetName}
                                                onChange={setEditSheetName}
                                                onSave={handleSaveSheetName}
                                                onCancel={handleCancelEditSheetName}
                                            />
                                        )}
                                    </CardContent>
                                </Card>

                                {selectedSheetCode && selectedFilters.length > 0 && (
                                    <Card sx={{ 
                                        mb: 3, 
                                        border: `1px solid ${theme.palette.border?.main}`,
                                        backgroundColor: theme.palette.card?.background || STYLE_GUIDE.COLORS.backgroundSurface,
                                        '&:hover': {
                                            boxShadow: theme.shadows[4],
                                            borderColor: `${theme.palette.border?.hover}`,
                                        }
                                    }}>
                                        <CardContent sx={{ p: 3 }}>
                                            <Typography variant="h6" gutterBottom sx={{ 
                                                fontWeight: 600,
                                                color: theme.palette.text.primary,
                                            }}>
                                                Edit Filter Columns for {selectedSheet?.sheetName}
                                            </Typography>
                                            <FilterColumnsEditor
                                                filters={selectedFilters}
                                                editingColumns={editingColumns}
                                                editColumnValues={editColumnValues}
                                                attributeValueInputs={attributeValueInputs}
                                                onEditColumn={handleEditColumn}
                                                onCancelEditColumn={handleCancelEditColumn}
                                                onSaveColumn={handleSaveColumn}
                                                onDeleteColumn={handleDeleteColumn}
                                                onRemoveAttributeValue={handleRemoveAttributeValue}
                                                onAddAttributeValue={(columnId, value) => {
                                                    if (!selectedReportId) return;
                                                    setLocalSettings(prev =>
                                                        prev.map(report =>
                                                            report._id === selectedReportId
                                                                ? {
                                                                    ...report,
                                                                    filters: report.filters.map(filter => ({
                                                                        ...filter,
                                                                        columns: filter.columns.map(col =>
                                                                            col._id === columnId && !col.attributeValues.includes(value)
                                                                                ? { ...col, attributeValues: [...col.attributeValues, value] }
                                                                                : col
                                                                        )
                                                                    }))
                                                                }
                                                                : report
                                                        )
                                                    );
                                                    setAttributeValueInputs(prev => ({
                                                        ...prev,
                                                        [columnId]: ""
                                                    }));
                                                }}
                                                onChangeEditColumnValue={(columnId, value) => setEditColumnValues(prev => ({
                                                    ...prev,
                                                    [columnId]: value
                                                }))}
                                                onChangeAttributeValueInput={(columnId, value) => setAttributeValueInputs(prev => ({
                                                    ...prev,
                                                    [columnId]: value
                                                }))}
                                                onAddColumn={handleAddColumn}
                                            />
                                        </CardContent>
                                    </Card>
                                )}

                                {selectedSheetCode && selectedFilters.length === 0 && (
                                    <Card sx={{ 
                                        mb: 3, 
                                        bgcolor: STYLE_GUIDE.COLORS.backgroundGray,
                                        border: `1px solid ${theme.palette.border?.main}`,
                                        '&:hover': {
                                            boxShadow: theme.shadows[4],
                                            borderColor: `${theme.palette.border?.hover}`,
                                        }
                                    }}>
                                        <CardContent sx={{ p: 3 }}>
                                            <Alert severity="info">
                                                No filters found for the selected sheet: {selectedSheet?.sheetName}
                                            </Alert>
                                        </CardContent>
                                    </Card>
                                )}

                                <Box display="flex" justifyContent="flex-end">
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="large"
                                        onClick={handleSaveAllChanges}
                                        startIcon={<CheckIcon />}
                                        sx={{ 
                                            minWidth: 180, 
                                            fontWeight: 600,
                                            bgcolor: theme.palette.primary.main,
                                            color: theme.palette.primary.contrastText,
                                            '&:hover': {
                                                bgcolor: theme.palette.primary.dark,
                                            },
                                            '&:disabled': {
                                                bgcolor: theme.palette.action.disabledBackground,
                                                color: theme.palette.action.disabled,
                                            }
                                        }}
                                        disabled={isAnyEditActive}
                                    >
                                        Save All Changes
                                    </Button>
                                </Box>
                            </>
                        )}
                    </Box>
                )}
            </Paper>

            <AddColumnModal
                open={addColumnModal.open}
                onClose={handleCloseAddColumnModal}
                onAdd={handleAddColumnSubmit}
                filterInfo={addColumnModal.filterInfo}
            />

            <ConfirmDialog
                open={deleteDialog.open}
                title="Delete Column"
                description="Are you sure you want to delete this column? This action cannot be undone."
                onConfirm={handleConfirmDeleteColumn}
                onCancel={handleCancelDeleteColumn}
            />
        </Box>
    );
};

export default ReportSettings;
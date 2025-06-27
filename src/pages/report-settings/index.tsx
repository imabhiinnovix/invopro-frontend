import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Container,
    Typography,
    Paper,
    Box,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Divider,
    Alert,
    Stepper,
    Step,
    StepLabel
} from "@mui/material";
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


const ReportSettings: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { settings = [], loading, error } = useSelector((state: RootState) => state.customReports);
    const [selectedReportId, setSelectedReportId] = useState<string>("");

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
        // Restore original column data if present
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

            console.log("Added new column:", { reportHeader, attributeValues, filterId: addColumnModal.filterId });

        } catch (error) {
            console.error(error);
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

    const handleSaveAllChanges = async () => {
        try {
            if (!selectedReport) return;

            const output = {
                reportName: selectedReport.reportName,
                reportSettings: selectedReport.reportSettings.map(sheet => ({
                    sheetName: sheet.sheetName,
                    sheetCode: sheet.sheetCode
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

            console.log(JSON.stringify(output, null, 2));

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

    return (
        <Container maxWidth={false} sx={{ bgcolor: STYLE_GUIDE.COLORS.backgroundDefault, minHeight: '100vh' }}>
            <Paper elevation={3} sx={{
                p: STYLE_GUIDE.SPACING.s4,
                mt: STYLE_GUIDE.SPACING.s4,
                borderRadius: STYLE_GUIDE.SPACING.s1,
                bgcolor: STYLE_GUIDE.COLORS.backgroundSurface,
                boxShadow: STYLE_GUIDE.SHADOWS.lg,
            }}>
                <Typography
                    variant="h4"
                    textAlign="center"
                    gutterBottom
                    sx={{
                        fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold,
                        color: STYLE_GUIDE.COLORS.primary,
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
                                        color: STYLE_GUIDE.COLORS.textDarkGray,
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
                        <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: STYLE_GUIDE.COLORS.backgroundGray, borderRadius: 2 }}>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                Select Report
                            </Typography>
                            <FormControl fullWidth>
                                <InputLabel id="report-select-label">Select Report to Edit</InputLabel>
                                <Select
                                    labelId="report-select-label"
                                    value={selectedReportId}
                                    label="Select Report to Edit"
                                    onChange={e => {
                                        setSelectedReportId(e.target.value);
                                        setIsEditingReportName(false);
                                        setIsEditingSheetName(false);
                                    }}
                                >
                                    {settings.map(report => (
                                        <MenuItem key={report._id} value={report._id}>
                                            {report.reportName}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Paper>

                        {selectedReport && (
                            <>
                                <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: STYLE_GUIDE.COLORS.backgroundGray, borderRadius: 2 }}>
                                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
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
                                </Paper>

                                <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: STYLE_GUIDE.COLORS.backgroundGray, borderRadius: 2 }}>
                                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                        Select and Edit Sheet Settings
                                    </Typography>
                                    <FormControl fullWidth sx={{ mb: 2 }}>
                                        <InputLabel id="sheet-select-label">Select Sheet to Edit</InputLabel>
                                        <Select
                                            labelId="sheet-select-label"
                                            value={selectedSheetCode}
                                            label="Select Sheet to Edit"
                                            onChange={e => setSelectedSheetCode(e.target.value)}
                                        >
                                            {settings.find(r => r._id === selectedReportId)?.reportSettings.map((sheet: ReportSetting) => (
                                                <MenuItem key={sheet._id} value={sheet.sheetCode}>
                                                    {sheet.sheetName}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
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
                                </Paper>

                                {selectedSheetCode && selectedFilters.length > 0 && (
                                    <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: STYLE_GUIDE.COLORS.backgroundGray, borderRadius: 2 }}>
                                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
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
                                    </Paper>
                                )}

                                {selectedSheetCode && selectedFilters.length === 0 && (
                                    <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: STYLE_GUIDE.COLORS.backgroundGray, borderRadius: 2 }}>
                                        <Alert severity="info">
                                            No filters found for the selected sheet: {selectedSheet?.sheetName}
                                        </Alert>
                                    </Paper>
                                )}

                                <Box display="flex" justifyContent="flex-end">
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="large"
                                        onClick={handleSaveAllChanges}
                                        startIcon={<CheckIcon />}
                                        sx={{ minWidth: 180, fontWeight: 600 }}
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
        </Container>
    );
};

export default ReportSettings;
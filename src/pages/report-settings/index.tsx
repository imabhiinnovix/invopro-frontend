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
    TextField,
    Button,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Divider,
    Alert,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    IconButton,
    Stepper,
    Step,
    StepLabel
} from "@mui/material";
import { fetchCustomReportSettings } from "./customReportsActions";
import { RootState, AppDispatch } from "../../store";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { STYLE_GUIDE } from '../../styles';

interface ReportSetting {
    _id: string;
    sheetName: string;
    sheetCode: string;
    isWhiteBackGround: boolean;
    startTableColumn: string;
    startRowNumber: number;
}

interface FilterColumn {
    _id: string;
    reportHeader: string;
    attributeValues: string[];
}

interface Filter {
    _id: string;
    sheetCode: string;
    section: string;
    attribute: string;
    columns: FilterColumn[];
}

interface Report {
    _id: string;
    reportName: string;
    reportSettings: ReportSetting[];
    filters: Filter[];
}

interface AddColumnModalProps {
    open: boolean;
    onClose: () => void;
    onAdd: (reportHeader: string, attributeValues: string[]) => void;
    filterInfo: {
        section: string;
        attribute: string;
    } | null;
}

const AddColumnModal: React.FC<AddColumnModalProps> = ({
    open,
    onClose,
    onAdd,
    filterInfo
}) => {
    const [reportHeader, setReportHeader] = useState("");
    const [attributeValueInput, setAttributeValueInput] = useState("");
    const [attributeValues, setAttributeValues] = useState<string[]>([]);
    const [errors, setErrors] = useState<{
        reportHeader?: string;
        attributeValues?: string;
    }>({});

    useEffect(() => {
        if (open) {
            setReportHeader("");
            setAttributeValueInput("");
            setAttributeValues([]);
            setErrors({});
        }
    }, [open]);

    const validateForm = () => {
        const newErrors: typeof errors = {};
        if (!reportHeader.trim()) {
            newErrors.reportHeader = "Report header is required";
        }
        if (attributeValues.length === 0) {
            newErrors.attributeValues = "At least one attribute value is required.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddAttributeValue = () => {
        const value = attributeValueInput.trim();
        if (value && !attributeValues.includes(value)) {
            setAttributeValues(prev => [...prev, value]);
            setAttributeValueInput("");
            if (errors.attributeValues) {
                setErrors(prev => ({ ...prev, attributeValues: undefined }));
            }
        }
    };

    const handleRemoveAttributeValue = (valueToRemove: string) => {
        setAttributeValues(prev => prev.filter(value => value !== valueToRemove));
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddAttributeValue();
        }
    };

    const handleSubmit = () => {
        if (validateForm()) {
            onAdd(reportHeader.trim(), attributeValues);
            onClose();
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { minHeight: '400px', bgcolor: STYLE_GUIDE.COLORS.backgroundSurface }
            }}
        >
            <DialogTitle sx={{ fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold, color: STYLE_GUIDE.COLORS.primary }}>
                Add New Filter Column
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: STYLE_GUIDE.COLORS.borderGray,
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                {filterInfo && (
                    <Alert severity="info" sx={{ mb: STYLE_GUIDE.SPACING.s3 }}>
                        Adding column to filter: <strong>{filterInfo.section} - {filterInfo.attribute}</strong>
                    </Alert>
                )}

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: STYLE_GUIDE.SPACING.s3 }}>
                    <FormControl fullWidth error={!!errors.reportHeader}>
                        <TextField
                            label="Report Header"
                            value={reportHeader}
                            onChange={(e) => {
                                setReportHeader(e.target.value);
                                if (errors.reportHeader) {
                                    setErrors(prev => ({ ...prev, reportHeader: undefined }));
                                }
                            }}
                            placeholder="Enter the column header name"
                            error={!!errors.reportHeader}
                            helperText={errors.reportHeader}
                            fullWidth
                            autoFocus
                            sx={{
                                bgcolor: STYLE_GUIDE.COLORS.backgroundDefault,
                                borderRadius: STYLE_GUIDE.SPACING.s1,
                            }}
                        />
                    </FormControl>

                    <Box>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold }}>
                            Attribute Values <span style={{ color: STYLE_GUIDE.COLORS.materialError }}>*</span>
                        </Typography>
                        <Box sx={{ display: 'flex', gap: STYLE_GUIDE.SPACING.s2, mb: STYLE_GUIDE.SPACING.s2 }}>
                            <TextField
                                label="Add Attribute Value"
                                value={attributeValueInput}
                                onChange={(e) => setAttributeValueInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Enter value and press Enter or click Add"
                                size="small"
                                fullWidth
                                sx={{
                                    bgcolor: STYLE_GUIDE.COLORS.backgroundDefault,
                                    borderRadius: STYLE_GUIDE.SPACING.s1,
                                }}
                            />
                            <Button
                                variant="outlined"
                                onClick={handleAddAttributeValue}
                                disabled={!attributeValueInput.trim()}
                                startIcon={<AddIcon />}
                                sx={{
                                    fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
                                    color: STYLE_GUIDE.COLORS.primary,
                                    borderColor: STYLE_GUIDE.COLORS.primary,
                                }}
                            >
                                Add
                            </Button>
                        </Box>
                        {attributeValues.length > 0 ? (
                            <Box>
                                <Typography variant="body2" color={STYLE_GUIDE.COLORS.textMediumGray} sx={{ mb: 1 }}>
                                    Added Values ({attributeValues.length}):
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: STYLE_GUIDE.SPACING.s1 }}>
                                    {attributeValues.map((value, index) => (
                                        <Chip
                                            key={index}
                                            label={value}
                                            onDelete={() => handleRemoveAttributeValue(value)}
                                            deleteIcon={<CloseIcon />}
                                            variant="outlined"
                                            color="primary"
                                            sx={{
                                                fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
                                                bgcolor: STYLE_GUIDE.COLORS.backgroundLight,
                                                color: STYLE_GUIDE.COLORS.primary,
                                            }}
                                        />
                                    ))}
                                </Box>
                            </Box>
                        ) : (
                            <Box sx={{
                                p: STYLE_GUIDE.SPACING.s2,
                                border: `1px dashed ${STYLE_GUIDE.COLORS.divider}`,
                                borderRadius: STYLE_GUIDE.SPACING.s1,
                                textAlign: 'center',
                                bgcolor: STYLE_GUIDE.COLORS.backgroundGray
                            }}>
                                <Typography variant="body2" color={STYLE_GUIDE.COLORS.materialError} sx={{ fontStyle: 'italic' }}>
                                    {errors.attributeValues || "At least one attribute value is required."}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: STYLE_GUIDE.SPACING.s3 }}>
                <Button onClick={onClose} variant="outlined" sx={{ fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium }}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="primary"
                    disabled={!reportHeader.trim() || attributeValues.length === 0}
                    sx={{
                        fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold,
                        boxShadow: STYLE_GUIDE.SHADOWS.sm,
                    }}
                >
                    Add Column
                </Button>
            </DialogActions>
        </Dialog>
    );
};

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    open,
    title,
    description,
    onConfirm,
    onCancel,
}) => (
    <Dialog open={open} onClose={onCancel}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold, }}>
            <WarningAmberIcon color="warning" /> {title}
        </DialogTitle>
        <DialogContent>
            <DialogContentText>{description}</DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={onCancel} variant="outlined" sx={{ fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium }}>
                Cancel
            </Button>
            <Button onClick={onConfirm} color="error" variant="contained" sx={{ fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold, }}>
                Delete
            </Button>
        </DialogActions>
    </Dialog>
);

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
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Typography sx={{ minWidth: 120, fontWeight: 'bold' }}>Report Name:</Typography>
                                        {isEditingReportName ? (
                                            <>
                                                <TextField
                                                    value={editReportName}
                                                    onChange={e => setEditReportName(e.target.value)}
                                                    size="small"
                                                    fullWidth
                                                    error={editReportName.trim() === ""}
                                                    helperText={editReportName.trim() === "" ? "Report name cannot be empty" : ""}
                                                    sx={{ maxWidth: 350 }}
                                                />
                                                <Box sx={{ display: "flex", gap: 1 }}>
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        onClick={handleSaveReportName}
                                                        disabled={editReportName.trim() === "" || editReportName === selectedReport.reportName}
                                                        startIcon={<CheckIcon />}
                                                        size="small"
                                                    >
                                                        Save
                                                    </Button>
                                                    <Button
                                                        variant="outlined"
                                                        onClick={handleCancelEditReportName}
                                                        startIcon={<CloseIcon />}
                                                        size="small"
                                                    >
                                                        Cancel
                                                    </Button>
                                                </Box>
                                            </>
                                        ) : (
                                            <>
                                                <Typography variant="body1" sx={{ flex: 1 }}>
                                                    {selectedReport.reportName}
                                                </Typography>
                                                <Button
                                                    variant="outlined"
                                                    onClick={handleEditReportName}
                                                    startIcon={<EditIcon />}
                                                    size="small"
                                                >
                                                    Edit
                                                </Button>
                                            </>
                                        )}
                                    </Box>
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
                                            {settings.find(r => r._id === selectedReportId)?.reportSettings.map(sheet => (
                                                <MenuItem key={sheet._id} value={sheet.sheetCode}>
                                                    {sheet.sheetName}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    {selectedSheet && (
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="subtitle1" gutterBottom>
                                                Sheet Details:
                                            </Typography>
                                            <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
                                                <Typography sx={{ minWidth: 120, fontWeight: 'bold' }}>Sheet Code:</Typography>
                                                <Chip label={selectedSheet.sheetCode} variant="outlined" />
                                            </Box>
                                            <Box display="flex" alignItems="center" gap={2}>
                                                <Typography sx={{ minWidth: 120, fontWeight: 'bold' }}>Sheet Name:</Typography>
                                                {isEditingSheetName ? (
                                                    <>
                                                        <TextField
                                                            value={editSheetName}
                                                            onChange={e => setEditSheetName(e.target.value)}
                                                            size="small"
                                                            fullWidth
                                                            error={editSheetName.trim() === ""}
                                                            helperText={editSheetName.trim() === "" ? "Sheet name cannot be empty" : ""}
                                                            sx={{ maxWidth: 350 }}
                                                        />
                                                        <Box sx={{ display: "flex", gap: 1 }}>
                                                            <Button
                                                                variant="contained"
                                                                color="primary"
                                                                onClick={handleSaveSheetName}
                                                                disabled={editSheetName.trim() === "" || editSheetName === selectedSheet.sheetName}
                                                                startIcon={<CheckIcon />}
                                                                size="small"
                                                            >
                                                                Save
                                                            </Button>
                                                            <Button
                                                                variant="outlined"
                                                                onClick={handleCancelEditSheetName}
                                                                startIcon={<CloseIcon />}
                                                                size="small"
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </Box>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Typography variant="body1" sx={{ flex: 1 }}>
                                                            {selectedSheet.sheetName}
                                                        </Typography>
                                                        <Button
                                                            variant="outlined"
                                                            onClick={handleEditSheetName}
                                                            startIcon={<EditIcon />}
                                                            size="small"
                                                        >
                                                            Edit
                                                        </Button>
                                                    </>
                                                )}
                                            </Box>
                                        </Box>
                                    )}
                                </Paper>

                                {selectedSheetCode && selectedFilters.length > 0 && (
                                    <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: STYLE_GUIDE.COLORS.backgroundGray, borderRadius: 2 }}>
                                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                            Edit Filter Columns for {selectedSheet?.sheetName}
                                        </Typography>
                                        {selectedFilters.map((filter, filterIndex) => (
                                            <Accordion key={filter._id} defaultExpanded={filterIndex === 0} sx={{ mb: 2, borderRadius: 2, boxShadow: 1 }}>
                                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                                                        {filter.section} - {filter.attribute}
                                                    </Typography>
                                                </AccordionSummary>
                                                <AccordionDetails sx={{ bgcolor: STYLE_GUIDE.COLORS.backgroundLightGray, borderRadius: 2 }}>
                                                    <Box sx={{ mb: 2 }}>
                                                        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                                            <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                                                                Filter Columns ({filter.columns.length})
                                                            </Typography>
                                                            <Button
                                                                variant="outlined"
                                                                size="small"
                                                                startIcon={<AddIcon />}
                                                                onClick={() => handleAddColumn(filter._id)}
                                                            >
                                                                Add Column
                                                            </Button>
                                                        </Box>
                                                        {filter.columns.length === 0 ? (
                                                            <Box sx={{ p: 2, textAlign: "center", color: STYLE_GUIDE.COLORS.textMediumGray }}>
                                                                <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                                                                    No columns added yet.
                                                                </Typography>
                                                            </Box>
                                                        ) : (
                                                            filter.columns.map((column) => (
                                                                <Box key={column._id} sx={{ mb: 2, p: 2, border: `1px solid ${STYLE_GUIDE.COLORS.divider}`, borderRadius: 1, bgcolor: STYLE_GUIDE.COLORS.white }}>
                                                                    <Box display="flex" alignItems="center" gap={2} sx={{ mb: 1 }}>
                                                                        <Typography sx={{ minWidth: 120, fontWeight: 'bold' }}>
                                                                            Report Header:
                                                                        </Typography>
                                                                        {editingColumns[column._id] ? (
                                                                            <TextField
                                                                                value={editColumnValues[column._id] || ""}
                                                                                onChange={e => setEditColumnValues(prev => ({
                                                                                    ...prev,
                                                                                    [column._id]: e.target.value
                                                                                }))}
                                                                                size="small"
                                                                                fullWidth
                                                                                error={!editColumnValues[column._id]?.trim()}
                                                                                helperText={!editColumnValues[column._id]?.trim() ? "Header cannot be empty" : ""}
                                                                                sx={{ maxWidth: 300 }}
                                                                            />
                                                                        ) : (
                                                                            <Typography variant="body1" sx={{ flex: 1 }}>
                                                                                {column.reportHeader}
                                                                            </Typography>
                                                                        )}
                                                                        {/* Actions Row */}
                                                                        <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
                                                                            {editingColumns[column._id] ? (
                                                                                <>
                                                                                    <Button
                                                                                        variant="contained"
                                                                                        color="primary"
                                                                                        size="small"
                                                                                        onClick={() => handleSaveColumn(column._id)}
                                                                                        disabled={!editColumnValues[column._id]?.trim() || !column.attributeValues.length}
                                                                                        startIcon={<CheckIcon />}
                                                                                    >
                                                                                        Save
                                                                                    </Button>
                                                                                    <Button
                                                                                        variant="outlined"
                                                                                        size="small"
                                                                                        onClick={() => handleCancelEditColumn(column._id)}
                                                                                        startIcon={<CloseIcon />}
                                                                                    >
                                                                                        Cancel
                                                                                    </Button>
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <Button
                                                                                        variant="outlined"
                                                                                        size="small"
                                                                                        onClick={() => handleEditColumn(column._id)}
                                                                                        startIcon={<EditIcon />}
                                                                                    >
                                                                                        Edit
                                                                                    </Button>
                                                                                    <Button
                                                                                        variant="outlined"
                                                                                        color="error"
                                                                                        size="small"
                                                                                        onClick={() => handleDeleteColumn(column._id)}
                                                                                        startIcon={<DeleteIcon />}
                                                                                    >
                                                                                        Delete
                                                                                    </Button>
                                                                                </>
                                                                            )}
                                                                        </Box>
                                                                    </Box>

                                                                    <Box>
                                                                        <Typography variant="body2" color={STYLE_GUIDE.COLORS.textMediumGray} sx={{ mb: 1 }}>
                                                                            Attribute Values:
                                                                        </Typography>
                                                                        {editingColumns[column._id] ? (
                                                                            <>
                                                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                                                                                    {column.attributeValues.length > 0 ? (
                                                                                        column.attributeValues.map((value, valueIndex) => (
                                                                                            <Box key={valueIndex} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                                                <Chip
                                                                                                    label={value}
                                                                                                    size="small"
                                                                                                    variant="outlined"
                                                                                                    onDelete={() => handleRemoveAttributeValue(column._id, value)}
                                                                                                    deleteIcon={<CloseIcon />}
                                                                                                />
                                                                                            </Box>
                                                                                        ))
                                                                                    ) : (
                                                                                        <Typography variant="body2" color={STYLE_GUIDE.COLORS.materialError} sx={{ fontStyle: 'italic' }}>
                                                                                            At least one attribute value is required.
                                                                                        </Typography>
                                                                                    )}
                                                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                                                        <TextField
                                                                                            size="small"
                                                                                            placeholder="Add attribute value"
                                                                                            value={attributeValueInputs[column._id] || ""}
                                                                                            onChange={e => {
                                                                                                setAttributeValueInputs(prev => ({
                                                                                                    ...prev,
                                                                                                    [column._id]: e.target.value
                                                                                                }));
                                                                                            }}
                                                                                            onKeyDown={e => {
                                                                                                if (e.key === 'Enter' && attributeValueInputs[column._id]?.trim()) {
                                                                                                    const newValue = attributeValueInputs[column._id].trim();
                                                                                                    if (!column.attributeValues.includes(newValue)) {
                                                                                                        setLocalSettings(prev =>
                                                                                                            prev.map(report =>
                                                                                                                report._id === selectedReportId
                                                                                                                    ? {
                                                                                                                        ...report,
                                                                                                                        filters: report.filters.map(filter => ({
                                                                                                                            ...filter,
                                                                                                                            columns: filter.columns.map(col =>
                                                                                                                                col._id === column._id
                                                                                                                                    ? {
                                                                                                                                        ...col,
                                                                                                                                        attributeValues: [...col.attributeValues, newValue]
                                                                                                                                    }
                                                                                                                                    : col
                                                                                                                            )
                                                                                                                        }))
                                                                                                                    }
                                                                                                                    : report
                                                                                                            )
                                                                                                        );
                                                                                                    }
                                                                                                    setAttributeValueInputs(prev => ({
                                                                                                        ...prev,
                                                                                                        [column._id]: ""
                                                                                                    }));
                                                                                                }
                                                                                            }}
                                                                                        />
                                                                                        <IconButton
                                                                                            color="primary"
                                                                                            onClick={() => {
                                                                                                const newValue = attributeValueInputs[column._id]?.trim();
                                                                                                if (newValue && !column.attributeValues.includes(newValue)) {
                                                                                                    setLocalSettings(prev =>
                                                                                                        prev.map(report =>
                                                                                                            report._id === selectedReportId
                                                                                                                ? {
                                                                                                                    ...report,
                                                                                                                    filters: report.filters.map(filter => ({
                                                                                                                        ...filter,
                                                                                                                        columns: filter.columns.map(col =>
                                                                                                                            col._id === column._id
                                                                                                                                ? {
                                                                                                                                    ...col,
                                                                                                                                    attributeValues: [...col.attributeValues, newValue]
                                                                                                                                }
                                                                                                                                : col
                                                                                                                        )
                                                                                                                    }))
                                                                                                                }
                                                                                                                : report
                                                                                                        )
                                                                                                    );
                                                                                                }
                                                                                                setAttributeValueInputs(prev => ({
                                                                                                    ...prev,
                                                                                                    [column._id]: ""
                                                                                                }));
                                                                                            }}
                                                                                            disabled={!attributeValueInputs[column._id]?.trim()}
                                                                                            size="small"
                                                                                        >
                                                                                            <AddIcon />
                                                                                        </IconButton>
                                                                                    </Box>
                                                                                </Box>
                                                                            </>
                                                                        ) : (
                                                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                                                {column.attributeValues.length > 0 ? (
                                                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                                                        {column.attributeValues.map((value, valueIndex) => (
                                                                                            <Chip
                                                                                                key={valueIndex}
                                                                                                label={value}
                                                                                                size="small"
                                                                                                variant="outlined"
                                                                                            />
                                                                                        ))}
                                                                                    </Box>
                                                                                ) : (
                                                                                    <Typography variant="body2" color={STYLE_GUIDE.COLORS.textMediumGray} sx={{ fontStyle: 'italic' }}>
                                                                                        No attribute values
                                                                                    </Typography>
                                                                                )}
                                                                            </Box>
                                                                        )}
                                                                    </Box>
                                                                </Box>
                                                            ))
                                                        )}
                                                    </Box>
                                                </AccordionDetails>
                                            </Accordion>
                                        ))}
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
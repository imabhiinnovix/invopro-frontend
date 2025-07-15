import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Button,
    Box,
    Typography,
    FormControl,
    TextField,
    Chip,
    Alert
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { STYLE_GUIDE } from '../../../styles';
import { useUnifiedTheme } from '../../../hooks/useUnifiedTheme';

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
    const theme = useUnifiedTheme();
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
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: STYLE_GUIDE.SPACING.s2, alignItems: 'center', fontSize: '14px', backgroundColor: theme.dashboardTheme?.colors?.background?.paper || '#ffffff', '& fieldset': { borderColor: theme.getInputBorderColor() || STYLE_GUIDE.COLORS.darkBackground, }, '&:hover fieldset': { borderColor: theme.border?.hover || STYLE_GUIDE.COLORS.darkBorderHover, }, '&.Mui-focused fieldset': { borderColor: theme.input?.focusBorder || STYLE_GUIDE.COLORS.inputFocusFallback, }, }, '& .MuiInputLabel-root': { color: theme.palette.text.secondary || STYLE_GUIDE.COLORS.darkBorderFocus, }, '& .MuiInputLabel-root.Mui-focused': { color: theme.input?.focusBorder || STYLE_GUIDE.COLORS.inputFocusFallback, }, '& .MuiInputBase-input': { color: `${theme.getInputTextColor() || theme.palette.text.primary || '#000000'} !important`, }, '& .MuiInputBase-input::placeholder': { color: `${theme.palette.text.secondary || '#666'} !important`, }, '& .MuiInputBase-input:-webkit-autofill': { WebkitTextFillColor: `${theme.getInputTextColor() || theme.palette.text.primary || '#000000'} !important`, WebkitBoxShadow: `0 0 0 1000px ${theme.dashboardTheme?.colors?.background?.paper || '#ffffff'} inset !important`, }, }}
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
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: STYLE_GUIDE.SPACING.s2, alignItems: 'center', fontSize: '14px', backgroundColor: theme.dashboardTheme?.colors?.background?.paper || '#ffffff', '& fieldset': { borderColor: theme.getInputBorderColor() || STYLE_GUIDE.COLORS.darkBackground, }, '&:hover fieldset': { borderColor: theme.border?.hover || STYLE_GUIDE.COLORS.darkBorderHover, }, '&.Mui-focused fieldset': { borderColor: theme.input?.focusBorder || STYLE_GUIDE.COLORS.inputFocusFallback, }, }, '& .MuiInputLabel-root': { color: theme.palette.text.secondary || STYLE_GUIDE.COLORS.darkBorderFocus, }, '& .MuiInputLabel-root.Mui-focused': { color: theme.input?.focusBorder || STYLE_GUIDE.COLORS.inputFocusFallback, }, '& .MuiInputBase-input': { color: `${theme.getInputTextColor() || theme.palette.text.primary || '#000000'} !important`, }, '& .MuiInputBase-input::placeholder': { color: `${theme.palette.text.secondary || '#666'} !important`, }, '& .MuiInputBase-input:-webkit-autofill': { WebkitTextFillColor: `${theme.getInputTextColor() || theme.palette.text.primary || '#000000'} !important`, WebkitBoxShadow: `0 0 0 1000px ${theme.dashboardTheme?.colors?.background?.paper || '#ffffff'} inset !important`, }, }}
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

export default AddColumnModal;
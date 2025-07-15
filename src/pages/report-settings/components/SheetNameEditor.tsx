import React from "react";
import { Box, Typography, TextField, Button, Chip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { STYLE_GUIDE } from '../../../styles';
import { useUnifiedTheme } from '../../../hooks/useUnifiedTheme';

interface Props {
    sheetCode: string;
    sheetName: string;
    editSheetName: string;
    isEditing: boolean;
    onEdit: () => void;
    onChange: (val: string) => void;
    onSave: () => void;
    onCancel: () => void;
}

const SheetNameEditor: React.FC<Props> = ({
    sheetCode,
    sheetName,
    editSheetName,
    isEditing,
    onEdit,
    onChange,
    onSave,
    onCancel
}) => {
    
    const theme = useUnifiedTheme();
    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
                Sheet Details:
            </Typography>
            <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
                <Typography sx={{ minWidth: 120, fontWeight: 'bold' }}>Sheet Code:</Typography>
                <Chip label={sheetCode} variant="outlined" />
            </Box>
            <Box display="flex" alignItems="center" gap={2}>
                <Typography sx={{ minWidth: 120, fontWeight: 'bold' }}>Sheet Name:</Typography>
                {isEditing ? (
                    <>
                        <TextField
                            value={editSheetName}
                            onChange={e => onChange(e.target.value)}
                            size="small"
                            fullWidth
                            error={editSheetName.trim() === ""}
                            helperText={editSheetName.trim() === "" ? "Sheet name cannot be empty" : ""}
                            sx={{  maxWidth: 350, '& .MuiOutlinedInput-root': { borderRadius: STYLE_GUIDE.SPACING.s2, alignItems: 'flex-start', paddingRight: STYLE_GUIDE.SPACING.s2, fontSize: '14px', backgroundColor: theme.dashboardTheme?.colors?.background?.paper || '#ffffff', '& fieldset': { borderColor: theme.dashboardTheme?.colors?.inputBorder || STYLE_GUIDE.COLORS.darkBackground, }, '&:hover fieldset': { borderColor: theme.dashboardTheme?.colors?.borderHover || STYLE_GUIDE.COLORS.darkBorderHover, }, '&.Mui-focused fieldset': { borderColor: theme.dashboardTheme?.components?.input?.focusBorderColor || theme.dashboardTheme?.components?.input?.focusBorderColorFallback || STYLE_GUIDE.COLORS.inputFocusFallback, }, }, '& .MuiInputLabel-root': { color: theme.dashboardTheme?.colors?.text?.secondary || STYLE_GUIDE.COLORS.darkBorderFocus, }, '& .MuiInputLabel-root.Mui-focused': { color: theme.dashboardTheme?.components?.input?.focusBorderColor || theme.dashboardTheme?.components?.input?.focusBorderColorFallback || STYLE_GUIDE.COLORS.inputFocusFallback, }, '& .MuiInputBase-input': { color: `${theme.dashboardTheme?.colors?.inputText || theme.palette.text.primary} !important`, }, '& .MuiInputBase-input::placeholder': { color: `${theme.dashboardTheme?.colors?.text?.secondary || '#666'} !important`, }, '& .MuiInputBase-input:-webkit-autofill': { WebkitTextFillColor: `${theme.dashboardTheme?.colors?.inputText || theme.palette.text.primary} !important`, WebkitBoxShadow: `0 0 0 1000px ${theme.dashboardTheme?.colors?.background?.paper || '#ffffff'} inset !important`, }, }}
                        />
                        <Box sx={{ display: "flex", gap: 1 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={onSave}
                                disabled={editSheetName.trim() === "" || editSheetName === sheetName}
                                startIcon={<CheckIcon />}
                                size="small"
                            >
                                Save
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={onCancel}
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
                            {sheetName}
                        </Typography>
                        <Button
                            variant="outlined"
                            onClick={onEdit}
                            startIcon={<EditIcon />}
                            size="small"
                        >
                            Edit
                        </Button>
                    </>
                )}
            </Box>
        </Box>
    );
};

export default SheetNameEditor;
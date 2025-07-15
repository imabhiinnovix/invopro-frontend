import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    Button
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { STYLE_GUIDE } from '../../../styles';
import { useUnifiedTheme } from '../../../hooks/useUnifiedTheme';

export interface ConfirmDialogProps {
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
}) => {
    const theme = useUnifiedTheme();
    
    return (
        <Dialog open={open} onClose={onCancel}>
            <DialogTitle sx={{ 
                display: "flex", 
                alignItems: "center", 
                gap: 1, 
                fontWeight: theme.palette.dialog?.titleFontWeight || STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold,
                color: theme.palette.dialog?.titleColor || STYLE_GUIDE.COLORS.textDarkGray,
                fontSize: theme.palette.dialog?.titleFontSize || '1.25rem',
            }}>
                <WarningAmberIcon color="warning" /> {title}
            </DialogTitle>
            <DialogContent sx={{
                color: theme.palette.dialog?.contentColor || STYLE_GUIDE.COLORS.textDarkGray,
                fontSize: theme.palette.dialog?.contentFontSize || '1rem',
            }}>
                <DialogContentText>{description}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel} variant="outlined" sx={{ fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium }}>
                    Cancel
                </Button>
                <Button onClick={onConfirm} color="error" variant="contained" sx={{ fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold }}>
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmDialog;
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
}) => (
    <Dialog open={open} onClose={onCancel}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold }}>
            <WarningAmberIcon color="warning" /> {title}
        </DialogTitle>
        <DialogContent>
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

export default ConfirmDialog;
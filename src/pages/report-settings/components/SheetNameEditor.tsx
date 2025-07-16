import React from "react";
import { Box, Typography, TextField, Button, Chip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

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
}) => (
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
                        sx={{ maxWidth: 350 }}
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

export default SheetNameEditor;
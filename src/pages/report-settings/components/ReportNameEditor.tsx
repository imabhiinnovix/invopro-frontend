import React from "react";
import { Box, Typography, TextField, Button } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

interface Props {
    reportName: string;
    editReportName: string;
    isEditing: boolean;
    onEdit: () => void;
    onChange: (val: string) => void;
    onSave: () => void;
    onCancel: () => void;
}

const ReportNameEditor: React.FC<Props> = ({
    reportName,
    editReportName,
    isEditing,
    onEdit,
    onChange,
    onSave,
    onCancel
}) => (
    <Box display="flex" alignItems="center" gap={2}>
        <Typography sx={{ minWidth: 120, fontWeight: 'bold' }}>Report Name:</Typography>
        {isEditing ? (
            <>
                <TextField
                    value={editReportName}
                    onChange={e => onChange(e.target.value)}
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
                        onClick={onSave}
                        disabled={editReportName.trim() === "" || editReportName === reportName}
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
                    {reportName}
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
);

export default ReportNameEditor;
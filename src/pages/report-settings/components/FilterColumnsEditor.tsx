import React from "react";
import {
    Accordion, AccordionSummary, AccordionDetails, Typography, Box, Button, Chip, TextField, IconButton, useTheme
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { STYLE_GUIDE } from '../../../styles';

interface FilterColumn {
    _id: string;
    reportHeader: string;
    attributeValues: string[];
}

interface Filter {
    _id: string;
    section: string;
    attribute: string;
    columns: FilterColumn[];
}

interface Props {
    filters: Filter[];
    editingColumns: { [key: string]: boolean };
    editColumnValues: { [key: string]: string };
    attributeValueInputs: { [key: string]: string };
    onEditColumn: (columnId: string) => void;
    onCancelEditColumn: (columnId: string) => void;
    onSaveColumn: (columnId: string) => void;
    onDeleteColumn: (columnId: string) => void;
    onRemoveAttributeValue: (columnId: string, value: string) => void;
    onAddAttributeValue: (columnId: string, value: string) => void;
    onChangeEditColumnValue: (columnId: string, value: string) => void;
    onChangeAttributeValueInput: (columnId: string, value: string) => void;
    onAddColumn: (filterId: string) => void;
}

const FilterColumnsEditor: React.FC<Props> = ({
    filters,
    editingColumns,
    editColumnValues,
    attributeValueInputs,
    onEditColumn,
    onCancelEditColumn,
    onSaveColumn,
    onDeleteColumn,
    onRemoveAttributeValue,
    onAddAttributeValue,
    onChangeEditColumnValue,
    onChangeAttributeValueInput,
    onAddColumn
}) => {
    const theme = useTheme();
    
    return (
    <>
        {filters.map((filter, filterIndex) => (
            <Accordion
                key={filter._id}
                defaultExpanded={filterIndex === 0}
                sx={{
                    mb: STYLE_GUIDE.SPACING.s2,
                    borderRadius: STYLE_GUIDE.SPACING.s2,
                    boxShadow: STYLE_GUIDE.SPACING.s1
                }}
            >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {filter.section} - {filter.attribute}
                    </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{
                    bgcolor: theme.palette.background.default,
                    borderRadius: STYLE_GUIDE.SPACING.s4,
                    border: `1px solid ${theme.palette.divider}`
                }}>
                    <Box sx={{ mb: STYLE_GUIDE.SPACING.s2 }}>
                        <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{ mb: STYLE_GUIDE.SPACING.s2 }}
                        >
                            <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                                Filter Columns ({filter.columns.length})
                            </Typography>
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<AddIcon />}
                                onClick={() => onAddColumn(filter._id)}
                            >
                                Add Column
                            </Button>
                        </Box>
                        {filter.columns.length === 0 ? (
                            <Box sx={{ p: STYLE_GUIDE.SPACING.s2, textAlign: "center", color: theme.palette.text.secondary }}>
                                <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                                    No columns added yet.
                                </Typography>
                            </Box>
                        ) : (
                            filter.columns.map((column) => (
                                <Box
                                    key={column._id}
                                    sx={{
                                        mb: STYLE_GUIDE.SPACING.s2,
                                        p: STYLE_GUIDE.SPACING.s2,
                                        border: `1px solid ${theme.palette.divider}`,
                                        borderRadius: 1,
                                        bgcolor: theme.palette.background.paper
                                    }}
                                >
                                    <Box display="flex" alignItems="center" gap={2} sx={{ mb: STYLE_GUIDE.SPACING.s1 }}>
                                        <Typography sx={{ minWidth: 120, fontWeight: 'bold' }}>
                                            Report Header:
                                        </Typography>
                                        {editingColumns[column._id] ? (
                                            <TextField
                                                value={editColumnValues[column._id] || ""}
                                                onChange={e => onChangeEditColumnValue(column._id, e.target.value)}
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
                                        <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
                                            {editingColumns[column._id] ? (
                                                <>
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        size="small"
                                                        onClick={() => onSaveColumn(column._id)}
                                                        disabled={!editColumnValues[column._id]?.trim() || !column.attributeValues.length}
                                                        startIcon={<CheckIcon />}
                                                    >
                                                        Save
                                                    </Button>
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        onClick={() => onCancelEditColumn(column._id)}
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
                                                        onClick={() => onEditColumn(column._id)}
                                                        startIcon={<EditIcon />}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="outlined"
                                                        color="error"
                                                        size="small"
                                                        onClick={() => onDeleteColumn(column._id)}
                                                        startIcon={<DeleteIcon />}
                                                    >
                                                        Delete
                                                    </Button>
                                                </>
                                            )}
                                        </Box>
                                    </Box>
                                    <Box>
                                        <Typography
                                            variant="body2"
                                            color={theme.palette.text.secondary}
                                            sx={{ mb: STYLE_GUIDE.SPACING.s1 }}
                                        >
                                            Attribute Values:
                                        </Typography>
                                        {editingColumns[column._id] ? (
                                            <>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: STYLE_GUIDE.SPACING.s2 }}>
                                                    {column.attributeValues.length > 0 ? (
                                                        column.attributeValues.map((value, valueIndex) => (
                                                            <Box key={valueIndex} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <Chip
                                                                    label={value}
                                                                    size="small"
                                                                    variant="outlined"
                                                                    onDelete={() => onRemoveAttributeValue(column._id, value)}
                                                                    deleteIcon={<CloseIcon />}
                                                                />
                                                            </Box>
                                                        ))
                                                    ) : (
                                                        <Typography variant="body2" color={theme.palette.error.main} sx={{ fontStyle: 'italic' }}>
                                                            At least one attribute value is required.
                                                        </Typography>
                                                    )}
                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                        <TextField
                                                            size="small"
                                                            placeholder="Add attribute value"
                                                            value={attributeValueInputs[column._id] || ""}
                                                            onChange={e => onChangeAttributeValueInput(column._id, e.target.value)}
                                                            onKeyDown={e => {
                                                                if (e.key === 'Enter' && attributeValueInputs[column._id]?.trim()) {
                                                                    onAddAttributeValue(column._id, attributeValueInputs[column._id].trim());
                                                                }
                                                            }}
                                                        />
                                                        <IconButton
                                                            color="primary"
                                                            onClick={() => {
                                                                if (attributeValueInputs[column._id]?.trim()) {
                                                                    onAddAttributeValue(column._id, attributeValueInputs[column._id].trim());
                                                                }
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
                                                    <Typography variant="body2" color={theme.palette.text.secondary} sx={{ fontStyle: 'italic' }}>
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
    </>
    );
};

export default FilterColumnsEditor;
import * as React from "react";
import {
  Box,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { STYLE_GUIDE } from "../../styles";
import { StyledButton } from "../../components/common";

interface FilterModalProps {
  open: boolean;
  onClose: () => void;
  onApply: () => void;
  formData: Record<string, any>;
  listCurrentData: any;
  sourceVersionData: any;
  setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}

export const FilterNotivixDataModal: React.FC<FilterModalProps> = ({
  open,
  onClose,
  onApply,
  formData,
  listCurrentData,
  sourceVersionData,
  setFormData,
}) => {
  const renderFilterFields = () => {
    const filterFields =
      listCurrentData?.fieldSettings?.filter(
        (field: any) => field.isFilterEnable && field.mappedAttributeName
      ) || [];
    
    const fields = filterFields.map((field: any) => {
      const fieldName = field.mappedAttributeName;
      const fieldLabel = field.label;
      
      if (field.type === "boolean") {
        return (
          <FormControlLabel
            key={fieldName}
            control={
              <Checkbox
                checked={!!formData[fieldName]}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    [fieldName]: e.target.checked,
                  }))
                }
                sx={{ color: STYLE_GUIDE?.COLORS?.textPrimary || "#333" }}
              />
            }
            label={fieldLabel}
            sx={{ mb: 1 }}
          />
        );
      } else if (field.type === "option" || field.type === "multioption") {
        const rawData = sourceVersionData?.data?.data || [];
        const options = Array.from(
          new Set(
            rawData
              .map(
                (item: any) => item.rowData?.[fieldName] || item[fieldName] || ""
              )
              .filter((value: any) => value !== "")
          )
        );
        
        return (
          <FormControl
            key={fieldName}
            variant="outlined"
            fullWidth
            size="small"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
          >
            <InputLabel>{fieldLabel}</InputLabel>
            <Select
              value={formData[fieldName] || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  [fieldName]: e.target.value,
                }))
              }
              label={fieldLabel}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {options.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      } else {
        return (
          <TextField
            key={fieldName}
            label={fieldLabel}
            value={formData[fieldName] || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                [fieldName]: e.target.value,
              }))
            }
            variant="outlined"
            fullWidth
            size="small"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
          />
        );
      }
    });
    
    return fields.length > 0 ? (
      fields
    ) : (
      <Typography>No filterable fields available.</Typography>
    );
  };

  return (
    <>
      {open && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1300,
          }}
          onClick={onClose}
        >
          <Box
            sx={{
              backgroundColor: STYLE_GUIDE?.COLORS?.white || "#ffffff",
              borderRadius: "8px",
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
              p: 3,
              width: "600px",
              maxWidth: "90%",
              maxHeight: "600px",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Typography
              variant="h6"
              sx={{ mb: 2, color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5" }}
            >
              Filter
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 2,
              }}
            >
              {renderFilterFields()}
            </Box>
            <Box
              sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 3 }}
            >
              <StyledButton variant="secondary" onClick={onClose}>
                Cancel
              </StyledButton>
              <StyledButton variant="primary" onClick={onApply}>
                Apply
              </StyledButton>
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
};
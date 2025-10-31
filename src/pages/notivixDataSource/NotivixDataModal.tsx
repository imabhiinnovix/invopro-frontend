import * as React from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Tooltip,
  Checkbox,
  FormControlLabel,
  Autocomplete,
  IconButton,
  Chip,
} from "@mui/material";
import { STYLE_GUIDE } from "../../styles";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import CloseIcon from "@mui/icons-material/Close";
import usePost from "../../hooks/usePost";
import { POST, PUT } from "../../services/apiRoutes";
import { toast } from "react-toastify";
import usePut from "../../hooks/usePut";
import { ConfirmationDialog } from "../../components/common/deleteConfirmationDialog/ConfirmationDialog";
import DialogContainer from "../../components/molecule/dialog";

interface ModelSectionProps {
  openModal: boolean;
  modalMode: "add" | "edit" | "view" | "filter" | null;
  formData: Record<string, any>;
  openDialog: boolean;
  deleteId: string | null;
  listCurrentData: any;
  sourceVersionData: any;
  columns: any[];
  attributeListData: any[];
  handleCloseModal: () => void;
  handleCloseDialog: () => void;
  handleConfirmDelete: () => void;
  handleSave: (data: any) => void;
  setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  switchToEditMode: () => void;
  dataSourceId: string;
  refreshData: () => void;
}

export const NotivixDataModal: React.FC<ModelSectionProps> = ({
  openModal,
  modalMode,
  formData,
  openDialog,
  deleteId,
  listCurrentData,
  attributeListData,
  handleCloseModal,
  handleCloseDialog,
  handleConfirmDelete,
  handleSave,
  setFormData,
  dataSourceId,
  refreshData,
}) => {
  const createVersionRow = usePost(["createVersionRow"]);
  const updateVersionRow = usePut(["updateVersionRow"]);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>(
    {}
  );
  const [submitAttempted, setSubmitAttempted] = React.useState(false);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidNumber = (value: string) => {
    const numberRegex = /^[0-9]*$/;
    return numberRegex.test(value);
  };

  const getOptionsForAttribute = (attributeId: string) => {
    const attribute = attributeListData.find(
      (attr) => attr._id === attributeId
    );
    if (!attribute || !Array.isArray(attribute.attributeValue)) return [];
    return attribute.attributeValue.map((value: string) => ({
      id: value,
      label: value,
    }));
  };

  const convertToPayload = () => {
    const rowData: Record<string, any> = {};
    const attributes = listCurrentData?.entityId?.attributes || [];
    attributes.forEach((attribute: any) => {
      const fieldName = attribute.name;
      const fieldType = attribute.type;
      const value = formData[fieldName];
      if (value !== undefined && value !== null && value !== "") {
        if (fieldType === "date" && value) {
          rowData[fieldName] = dayjs(value).toISOString();
        } else if (fieldType === "boolean") {
          rowData[fieldName] = value ? "true" : "false";
        } else {
          rowData[fieldName] = value;
        }
      }
    });
    return {
      dataSourceId,
      rowData,
    };
  };

  const validateRequiredFields = () => {
    const attributes = listCurrentData?.entityId?.attributes || [];
    const errors: Record<string, string> = {};
    attributes.forEach((attribute: any) => {
      if (attribute.required) {
        const fieldName = attribute.name;
        const value = formData[fieldName];
        if (
          value === undefined ||
          value === null ||
          value === "" ||
          (Array.isArray(value) && value.length === 0) ||
          (typeof value === "string" && value.trim() === "")
        ) {
          errors[fieldName] = `${attribute.name} is required`;
        }
      }
    });
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate
  const validateField = (fieldName: string, value: any) => {
    const attributes = listCurrentData?.entityId?.attributes || [];
    const attribute = attributes.find((attr: any) => attr.name === fieldName);
    if (!attribute) return;
    const errors = { ...fieldErrors };
    // Check required and empty
    if (attribute.required) {
      if (
        value === undefined ||
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0) ||
        (typeof value === "string" && value.trim() === "")
      ) {
        errors[fieldName] = `${attribute.name} is required`;
      } else {
        delete errors[fieldName];
      }
    }
    // Check  validation
    if (value !== undefined && value !== null && value !== "") {
      if (attribute.type === "email" && !isValidEmail(value)) {
        errors[fieldName] = `Please enter a valid email address`;
      } else if (attribute.type === "number" && !isValidNumber(value)) {
        errors[fieldName] = `Please enter a valid number`;
      } else if (
        attribute.type === "email" &&
        isValidEmail(value) &&
        errors[fieldName]?.includes("email")
      ) {
        delete errors[fieldName];
      } else if (
        attribute.type === "number" &&
        isValidNumber(value) &&
        errors[fieldName]?.includes("number")
      ) {
        delete errors[fieldName];
      }
    }
    setFieldErrors(errors);
  };

  const handleSaveClick = async () => {
    try {
      setSubmitAttempted(true);
      if (modalMode === "add" || modalMode === "edit") {
        const attributes = listCurrentData?.entityId?.attributes || [];
        let isValid = true;
        let errorMessage = "";
        if (!validateRequiredFields()) {
          toast.error("Please fill required fields");
          return;
        }
        for (const attribute of attributes) {
          const fieldName = attribute.name;
          const fieldType = attribute.type;
          const value = formData[fieldName];
          if (value !== undefined && value !== null && value !== "") {
            if (fieldType === "email" && !isValidEmail(value)) {
              isValid = false;
              errorMessage = `Please enter a valid email address for ${attribute.name}`;
              break;
            } else if (fieldType === "number" && !isValidNumber(value)) {
              isValid = false;
              errorMessage = `Please enter a valid number for ${attribute.name}`;
              break;
            }
          }
        }
        if (!isValid) {
          toast.error(errorMessage);
          return;
        }
        const payload = convertToPayload();
        if (modalMode === "edit" && formData.id) {
          payload.rowId = formData.id;
        }
        if (modalMode === "add") {
          await createVersionRow.mutateAsync({
            url: `${POST.CREATE_VERSION_ROW}`,
            payload,
          });
        } else if (modalMode === "edit") {
          await updateVersionRow.mutateAsync({
            url: `${PUT.UPDATE_VERSION_ROW}/${formData.id}`,
            payload,
          });
        }
        handleSave(payload);
        refreshData();
        const successMessage =
          modalMode === "add"
            ? "Record added successfully!"
            : "Record updated successfully!";
        toast.success(successMessage);
      } else if (modalMode === "filter") {
        handleSave(formData);
      }
      handleCloseModal();
    } catch (error) {
      toast.error(
        `Error: ${error.message || "Something went wrong. Please try again."}`
      );
    }
  };

  const handleCancel = () => {
    setFieldErrors({});
    setSubmitAttempted(false);
    handleCloseModal();
  };

  function normalizeMultiOptionValue(
    raw: any,
    options: { id: string; label: string }[]
  ) {
    let values: string[] = [];
    if (Array.isArray(raw)) {
      values = raw;
    } else if (typeof raw === "string") {
      values = raw
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
    }
    return values.map((val) => {
      const match = options.find((opt) => opt.id === val);
      return match || { id: val, label: val };
    });
  }

  const renderAttributeField = (attribute: any, isViewMode = false) => {
    const shouldHideField = () => {
      if (
        attribute.name.includes(".") &&
        attribute.isReferenceEditable === "HIDE"
      ) {
        return true;
      }
      return false;
    };
    if (shouldHideField()) return null;

    const fieldName = attribute.name;
    const fieldLabel = attribute.label || attribute.name;
    const isRequired = attribute.required;
    const hasDot = attribute.name.includes(".");

    let isFieldEditable: boolean;
    if (hasDot) {
      // Nested reference fields → follow isReferenceEditable
      isFieldEditable = !isViewMode && attribute.isReferenceEditable === "EDIT";
    } else {
      isFieldEditable = !isViewMode;
    }
    const value = formData[fieldName];

    const renderLabel = (label: string) => (
      <>
        {label}
        {isRequired && (
          <span style={{ color: STYLE_GUIDE?.COLORS?.primaryDark }}> *</span>
        )}
      </>
    );

    if (isViewMode) {
      let displayValue: any = value ?? "-";

      if (attribute.type === "date" && displayValue !== "-") {
        displayValue = dayjs(displayValue).format("DD-MMM-YYYY");
      }

      if (Array.isArray(displayValue)) {
        if (displayValue.length === 0) {
          displayValue = ["No data"];
        }
      } else {
        displayValue = [displayValue];
      }

      return (
        <Box key={fieldName} sx={{ mb: 2 }}>
          <Typography
            variant="body2"
            sx={{
              mb: 0.5,
              fontWeight: 500,
              color: STYLE_GUIDE?.COLORS?.primaryDark,
            }}
          >
            {renderLabel(fieldLabel)}
          </Typography>
          <Box
            sx={{
              p: 1.5,
              borderRadius: "8px",
              backgroundColor:
                STYLE_GUIDE?.COLORS?.backgroundLight || "#f5f5f5",
              minHeight: "40px",
            }}
          >
            {displayValue.map((item: string, idx: number) => (
              <Typography
                key={idx}
                variant="body2"
                sx={{
                  wordBreak: "break-word",
                  color: STYLE_GUIDE?.COLORS?.textPrimary || "#333",
                }}
              >
                {item}
              </Typography>
            ))}
          </Box>
        </Box>
      );
    }

    const handleFieldChange = (val: any) => {
      setFormData((prev) => ({ ...prev, [fieldName]: val }));
      if (submitAttempted) validateField(fieldName, val);
    };

    switch (attribute.type) {
      case "boolean":
        return (
          <FormControlLabel
            key={fieldName}
            control={
              <Checkbox
                checked={!!value}
                onChange={(e) => handleFieldChange(e.target.checked)}
                disabled={!isFieldEditable}
                sx={{ color: STYLE_GUIDE?.COLORS?.primaryDark }}
              />
            }
            label={renderLabel(fieldLabel)}
            sx={{ mb: 1 }}
          />
        );
      case "option": {
        const options = getOptionsForAttribute(attribute.optionAttributeId);
        const selectedOption = options.find((opt) => opt.id === value);
        const isReference = !!attribute.referenceEntitySetting;
        return (
          <Autocomplete
            freeSolo={!isReference}
            key={fieldName}
            options={options}
            value={selectedOption || value || ""}
            onChange={(e, val) =>
              handleFieldChange(typeof val === "string" ? val : val?.id || "")
            }
             onInputChange={(e, newInputValue, reason) => {
              if (!isReference && reason === "input") {
                handleFieldChange(newInputValue);
              }
            }}
            disabled={!isFieldEditable}
            sx={{ height: "56px" }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={renderLabel(fieldLabel)}
                variant="outlined"
                fullWidth
                error={!!fieldErrors[fieldName]}
                helperText={fieldErrors[fieldName] || ""}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                placeholder={isReference ? "Select option" : "Type or select"}
              />
            )}
          />
        );
      }

      case "multioption": {
        const options = getOptionsForAttribute(attribute.optionAttributeId);
        const selectedOptions = normalizeMultiOptionValue(value, options);
        const isReferenceMulti = !!attribute.referenceEntitySetting;

        return (
          <Autocomplete
            multiple
            freeSolo={!isReferenceMulti}
            key={fieldName}
            options={options}
            value={selectedOptions}
            onChange={(e, val) =>
              handleFieldChange(
                val.map((item) => (typeof item === "string" ? item : item.id))
              )
            }
              onInputChange={(e, newInputValue, reason) => {
              if (!isReference && reason === "input") {
                handleFieldChange(newInputValue);
              }
            }}
            disabled={!isFieldEditable}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  key={index}
                  label={typeof option === "string" ? option : option.label}
                  {...getTagProps({ index })}
                  sx={{
                    color: "#000000ff",
                    fontWeight: 500,
                    opacity: 1,
                    pointerEvents: !isFieldEditable ? "none" : "auto",
                    "& .MuiChip-deleteIcon": {
                      display: !isFieldEditable ? "none" : "block",
                    },
                    backgroundColor: !isFieldEditable ? "#cfcfcf" : "#fdeeee",
                    border: !isFieldEditable ? "1px solid #b3b3b3" : "none",
                  }}
                />
              ))
            }
            sx={{
              "& .MuiOutlinedInput-root": { borderRadius: "8px" },
              height: "56px",
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={renderLabel(fieldLabel)}
                variant="outlined"
                fullWidth
                error={!!fieldErrors[fieldName]}
                helperText={fieldErrors[fieldName] || ""}
                placeholder={
                  !isFieldEditable
                    ? ""
                    : isReferenceMulti
                    ? "Select option"
                    : "Type or select"
                }
              />
            )}
          />
        );
      }

      case "date":
      case "date-range":
        return (
          <LocalizationProvider key={fieldName} dateAdapter={AdapterDayjs}>
            <DatePicker
              label={renderLabel(fieldLabel)}
              value={value ? dayjs(value) : null}
              onChange={(date) =>
                handleFieldChange(date ? date.toISOString() : "")
              }
              disabled={!isFieldEditable}
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  variant: "outlined",
                  fullWidth: true,
                  error: !!fieldErrors[fieldName],
                  helperText: fieldErrors[fieldName] || "",
                  sx: { "& .MuiOutlinedInput-root": { borderRadius: "8px" } },
                },
              }}
            />
          </LocalizationProvider>
        );
      case "number":
        return (
          <TextField
            key={fieldName}
            label={renderLabel(fieldLabel)}
            type="number"
            value={value || ""}
            onChange={(e) =>
              handleFieldChange(
                e.target.value === "" || isValidNumber(e.target.value)
                  ? e.target.value
                  : value
              )
            }
            variant="outlined"
            fullWidth
            disabled={!isFieldEditable}
            error={!!fieldErrors[fieldName]}
            helperText={fieldErrors[fieldName] || ""}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
          />
        );
      case "email":
        return (
          <TextField
            key={fieldName}
            label={renderLabel(fieldLabel)}
            type="email"
            value={value || ""}
            onChange={(e) => handleFieldChange(e.target.value)}
            variant="outlined"
            fullWidth
            disabled={!isFieldEditable}
            error={!!fieldErrors[fieldName]}
            helperText={fieldErrors[fieldName] || ""}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
          />
        );
      default:
        return (
          <TextField
            key={fieldName}
            label={renderLabel(fieldLabel)}
            value={value || ""}
            onChange={(e) => handleFieldChange(e.target.value)}
            variant="outlined"
            fullWidth
            disabled={!isFieldEditable}
            error={!!fieldErrors[fieldName]}
            helperText={fieldErrors[fieldName] || ""}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
          />
        );
    }
  };

  const renderModalFields = () => {
    const attributes = listCurrentData?.entityId?.attributes || [];
    if (attributes.length === 0)
      return <Typography>No attributes available.</Typography>;

    const firstColumn = attributes.filter((_, i) => i % 2 === 0);
    const secondColumn = attributes.filter((_, i) => i % 2 === 1);

    return (
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {firstColumn.map((attr) =>
            renderAttributeField(attr, modalMode === "view")
          )}
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {secondColumn.map((attr) =>
            renderAttributeField(attr, modalMode === "view")
          )}
        </Box>
      </Box>
    );
  };

  return (
    <>
      {openModal && modalMode !== "filter" && (
        <DialogContainer
          open={openModal}
          onClose={handleCancel}
          title={
            modalMode === "add" ? "Add" : modalMode === "edit" ? "Edit" : "View"
          }
          actions={
            <>
              <Button
                variant="outlined"
                onClick={handleCancel}
                sx={{
                  borderRadius: "8px",
                  borderColor: STYLE_GUIDE?.COLORS?.divider || "#e0e0e0",
                  color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
                }}
              >
                Cancel
              </Button>
              {modalMode !== "view" && (
                <Button
                  variant="contained"
                  onClick={handleSaveClick}
                  sx={{
                    borderRadius: "8px",
                    backgroundColor:
                      STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
                    color: STYLE_GUIDE?.COLORS?.white || "#ffffff",
                    "&:hover": {
                      backgroundColor:
                        STYLE_GUIDE?.COLORS?.primary || "#5c6bc0",
                    },
                  }}
                >
                  Save
                </Button>
              )}
            </>
          }
        >
          {renderModalFields()}
        </DialogContainer>
        // <Box
        //   sx={{
        //     position: "fixed",
        //     top: 0,
        //     left: 0,
        //     width: "100%",
        //     height: "100%",
        //     backgroundColor: "rgba(0, 0, 0, 0.5)",
        //     display: "flex",
        //     alignItems: "center",
        //     justifyContent: "center",
        //     zIndex: 1300,
        //   }}
        //   onClick={handleCancel}
        // >
        //   <Box
        //     sx={{
        //       backgroundColor: STYLE_GUIDE?.COLORS?.white || "#ffffff",
        //       borderRadius: "8px",
        //       boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
        //       p: 3,
        //       width: "900px",
        //       maxWidth: "90%",
        //       maxHeight: "80vh",
        //       overflowY: "auto",
        //     }}
        //     onClick={(e) => e.stopPropagation()}
        //   >
        //     <Box
        //       sx={{
        //         display: "flex",
        //         justifyContent: "space-between",
        //         alignItems: "center",
        //         mb: 2,
        //       }}
        //     >
        //       <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        //         <Typography
        //           variant="h6"
        //           sx={{ color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5" }}
        //         >
        //           {modalMode === "add"
        //             ? "Add"
        //             : modalMode === "edit"
        //             ? "Edit"
        //             : "View"}
        //         </Typography>
        //       </Box>
        //       <IconButton
        //         onClick={handleCancel}
        //         sx={{
        //           color: STYLE_GUIDE?.COLORS?.textSecondary || "#666",
        //         }}
        //       >
        //         <Tooltip title="Close">
        //           <CloseIcon />
        //         </Tooltip>
        //       </IconButton>
        //     </Box>
        //     {renderModalFields()}
        //     <Box
        //       sx={{
        //         display: "flex",
        //         justifyContent: "flex-end",
        //         gap: 1,
        //         mt: 3,
        //       }}
        //     >
        // <Button
        //   variant="outlined"
        //   onClick={handleCancel}
        //   sx={{
        //     borderRadius: "8px",
        //     borderColor: STYLE_GUIDE?.COLORS?.divider || "#e0e0e0",
        //     color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
        //   }}
        // >
        //   Cancel
        // </Button>
        // {modalMode !== "view" && (
        //   <Button
        //     variant="contained"
        //     onClick={handleSaveClick}
        //     sx={{
        //       borderRadius: "8px",
        //       backgroundColor:
        //         STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
        //       color: STYLE_GUIDE?.COLORS?.white || "#ffffff",
        //       "&:hover": {
        //         backgroundColor:
        //           STYLE_GUIDE?.COLORS?.primary || "#5c6bc0",
        //       },
        //     }}
        //   >
        //     Save
        //   </Button>
        //       )}
        //     </Box>
        //   </Box>
        // </Box>
      )}

      <ConfirmationDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmDelete}
        deleteId={deleteId}
      />
    </>
  );
};

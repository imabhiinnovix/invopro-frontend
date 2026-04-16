import * as React from "react";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Chip,
  FormControlLabel,
  Checkbox,
  Autocomplete,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { STYLE_GUIDE } from "../../styles";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import CloseIcon from "@mui/icons-material/Close";
import { PUT, GET, POST } from "../../services/apiRoutes";
import { toast } from "react-toastify";
import usePost from "../../hooks/usePost";
import { useSelector } from "react-redux";
import { RootState } from "../../reducers";
import DialogContainer from "../../components/molecule/dialog";
import { StyledButton } from "../../components/common";
import usePut from "../../hooks/usePut";

interface ValidationInlineErrorModalProps {
  openModal: boolean;
  rowData: any;
  currentDataSource: any;
  attributeListData: any[];
  handleCloseModal: () => void;
  refreshData: () => void;
  rowDetailData?: any;
  triggerSave?: any;
  onSaved?: () => void;
}

export const ValidationInlineErrorModal: React.FC<ValidationInlineErrorModalProps> = ({
  openModal,
  rowData,
  currentDataSource,
  attributeListData,
  handleCloseModal,
  refreshData,
  rowDetailData,
  triggerSave,
  onSaved
}) => {
  const [formData, setFormData] = React.useState<Record<string, any>>({});
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>(
    {}
  );
  const [matchedDataSource, setMatchedDataSource] = React.useState<any>(null);
  const [submitAttempted, setSubmitAttempted] = React.useState(false);
  const [attributeOptions, setAttributeOptions] = React.useState<
    Record<string, any[]>
  >({});
  const [targetAttribute, setTargetAttribute] = React.useState<any>(null);
  const commonDataSourceList = useSelector(
    (state: RootState) => state.dataSource?.list
  );
  const errorCode = rowData?.errorCode || "";
  const refDataSourceId = rowData?.refDataSourceId || "";
  const refAttributeId = rowData?.refAttributeId || "";
  const dataSourceId = rowData?.dataSourceId || "";
  const updateVersionRow = usePost(["updateVersionRow"]);
  const updateDuplicateVersionRow = usePut(["updateDuplicateVersionRow"]);

  const [isResolved, setIsResolved] = React.useState(false);
  const [openConfirm, setOpenConfirm] = React.useState(false);

React.useEffect(() => {
  if (!triggerSave) return;

  const run = async () => {
    await handleSaveClick();
    // onSaved?.();
  };

  run();
}, [triggerSave]);

  // Helper function to normalize multioption values
  const normalizeMultiOptionValue = (
    raw: any,
    options: { id: string; label: string }[]
  ) => {
    let values: string[] = [];

    // Handle string values (single entity, not array)
    if (typeof raw === "string") {
      values = [raw];
    }
    // Handle existing arrays
    else if (Array.isArray(raw)) {
      values = raw;
    }
    // Handle other types
    else {
      values = raw ? [String(raw)] : [];
    }

    // Remove duplicates
    const uniqueValues = [...new Set(values)];

    return uniqueValues.map((val) => {
      const match = options.find((opt) => opt.id === val);
      return match || { id: val, label: val };
    });
  };

 const getErrorColor = (type: string) => {
  switch (type) {
    case "M":
      return "#d32f2f"; // strong red
    case "P":
      return "#ff9800"; // orange
    case "V":
      return "#ffcdd2"; // light red (variant)
    default:
      return "#9e9e9e";
  }
};

const getTextColor = (type: string) => {
  return type === "V" ? "#b71c1c" : "#fff"; // darker text for light bg
}; 

  // Handle exceptional cases for error codes "1003" and "1002"
React.useEffect(() => {
  if (openModal && rowData?.length) {
    rowData.forEach((row: any) => {
      setMatchedDataSource(null);
      setTargetAttribute(null);

      const {
        errorCode,
        refDataSourceId,
        dataSourceId,
        refAttributeId,
        errorSource
      } = row;

      // Handle error code 1003
      if (
        (errorCode === "1003" ||
          errorCode === "1006" ||
          errorCode === "1004") &&
        refDataSourceId
      ) {
        const matched = commonDataSourceList?.find(
          (ds) => ds._id === refDataSourceId
        );
        if (matched) {
          setMatchedDataSource(matched);

          if (refAttributeId && matched.entityId?.attributes) {
            const attribute = matched.entityId.attributes.find(
              (attr: any) => attr._id === refAttributeId
            );
            if (attribute) {
              setTargetAttribute(attribute);
            }
          }
        }
      }

      // Handle error code 1002
      if (
        (errorCode === "1002" ||
          errorCode === "1001" ||
          errorCode === "1004") &&
        dataSourceId
      ) {
        const matched = commonDataSourceList?.find(
          (ds) => ds._id === dataSourceId
        );
        if (matched) {
          setMatchedDataSource(matched);

          if (refAttributeId && matched.entityId?.attributes) {
            const attribute = matched.entityId.attributes.find(
              (attr: any) => attr._id === refAttributeId
            );
            if (attribute) {
              setTargetAttribute(attribute);
            }
          }
        }
      }
    });
  }
}, [openModal, rowData, commonDataSourceList]);

  // Use effectiveDataSource that prioritizes matchedDataSource for error codes "1003" and "1002"
  const effectiveDataSource = matchedDataSource || currentDataSource;

  // Fetch attribute options for option and multioption fields
  React.useEffect(() => {
    if (effectiveDataSource?.entityId?.attributes && openModal) {
      const attributes = effectiveDataSource.entityId.attributes;
      const optionsMap: Record<string, any[]> = {};
      const fetchOptions = async () => {
        for (const currentAttribute of attributes) {
          if (
            (currentAttribute.type === "option" ||
              currentAttribute.type === "multioption") &&
            currentAttribute.optionAttributeId
          ) {
            try {
              const optionAttribute = attributeListData.find(
                (attr) => attr._id === currentAttribute.optionAttributeId
              );
              if (
                optionAttribute &&
                Array.isArray(optionAttribute.attributeValue)
              ) {
                optionsMap[currentAttribute.optionAttributeId] =
                  optionAttribute.attributeValue.map((value: string) => ({
                    id: value,
                    label: value,
                  }));
              }
            } catch (error) {
              console.error(
                `Error processing options for attribute ${currentAttribute.name}:`,
                error
              );
            }
          }
        }
        setAttributeOptions(optionsMap);
      };
      fetchOptions();
    }
  }, [effectiveDataSource, openModal, attributeListData]);

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

  // Helper function to safely convert a value to a date ISO string
  const safeDateToISOString = (value: any): string | null => {
    if (!value) return null;
    try {
      const date = dayjs(value);
      if (date.isValid()) {
        // Preserve only date part, ignore time zone shifts
        return date.format("YYYY-MM-DD");
      }
      return null;
    } catch (error) {
      console.error("Error converting date:", error);
      return null;
    }
  };

  // Initialize form data when modal opens or row data changes
 React.useEffect(() => {
  if (rowData?.length && openModal && effectiveDataSource?.entityId?.attributes) {

    rowData.forEach((row: any) => {
      const initialFormData: Record<string, any> = {};

      const {
        errorCode,
        refAttributeId
      } = row;

      // For error code 1002, get rowData from rowDetailData if available
      let sourceData = row;

      if (
        (errorCode === "1002" ||
          errorCode === "1001" ||
          errorCode === "1004" ||
          errorCode === "1006") &&
        rowDetailData
      ) {
        sourceData = rowDetailData?.rowData || row;
      }

      effectiveDataSource.entityId.attributes.forEach((attribute: any) => {
        const fieldName = attribute.name;
        let fieldValue = sourceData[fieldName];

        // Special handling for error code "1003" with refAttributeId
        if (
          (errorCode === "1003" || errorCode === "1006") &&
          refAttributeId &&
          attribute._id === refAttributeId
        ) {
          fieldValue = row.fileAttributeValue;
        }

        if (
          (attribute.type === "date" || attribute.type === "date-range") &&
          fieldValue
        ) {
          const isoDate = safeDateToISOString(fieldValue);
          initialFormData[fieldName] = isoDate || "";
        } else if (attribute.type === "boolean") {
          initialFormData[fieldName] =
            fieldValue === "true" || fieldValue === true;
        } else if (attribute.type === "multioption" && fieldValue) {
          const options = getOptionsForAttribute(attribute.optionAttributeId);
          const normalized = normalizeMultiOptionValue(fieldValue, options);
          initialFormData[fieldName] = normalized.map((item) => item.id);
        } else {
          initialFormData[fieldName] = fieldValue || "";
        }
      });

      if (effectiveDataSource) {
        initialFormData.dataSourceName = effectiveDataSource.name;
        initialFormData.dataSourceId = effectiveDataSource._id;
      }

      // ⚠️ Same behavior: will overwrite each iteration (last row wins)
      setFormData(initialFormData);
    });
  }
}, [
  rowData,
  rowDetailData,
  effectiveDataSource,
  openModal,
]);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidNumber = (value: string) => {
  const numberRegex = /^\d*\.?\d*$/;
  return numberRegex.test(value);
};

  // Build the rowData payload for both error codes
  const buildRowDataPayload = () => {
    const rowDataPayload: Record<string, any> = {};
    effectiveDataSource?.entityId?.attributes.forEach((attribute: any) => {
      const fieldName = attribute.name;
      const value = formData[fieldName];

      if (value !== undefined && value !== null && value !== "") {
        if (
          (attribute.type === "date" || attribute.type === "date-range") &&
          value
        ) {
          const isoDate = safeDateToISOString(value);
          if (isoDate) {
            rowDataPayload[fieldName] = isoDate;
          }
        } else if (attribute.type === "boolean") {
          rowDataPayload[fieldName] = value ? "true" : "false";
        } else if (attribute.type === "multioption") {
          // Get the original value from the source data
          // let sourceData = rowData;
          // if ((errorCode === "1002" || errorCode === "1004") && rowDetailData) {
            let sourceData = rowDetailData?.rowData;
          // }

          const originalValue = sourceData[fieldName];

          // If the original value was an array, keep it as an array
          if (Array.isArray(originalValue)) {
            rowDataPayload[fieldName] = value;
          } else {
            // If the original value was not an array, convert array to string
            // if (Array.isArray(value)) {
            //   rowDataPayload[fieldName] = value.join("|");
            // } else {
              rowDataPayload[fieldName] = value;
            // }
          }
        } else {
          rowDataPayload[fieldName] = value;
        }
      }
    });
    return rowDataPayload;
  };

  // Convert form data to payload based on error code
  const convertToPayload = () => {
    const rowDataPayload = buildRowDataPayload();
    // if (errorCode === "1003") {
    //   return {
    //     errorDataSourceVersionId: rowData.dataSourceVersionId,
    //     dataSourceId: rowData.refDataSourceId,
    //     rowData: rowDataPayload,
    //     isErrorResolved: true,
    //     errorDataSourceId: rowData.dataSourceId,
    //     fileAttributeValue: rowData.fileAttributeValue,
    //     attributeName: rowData.attributeName,
    //   };
    // }else if (errorCode === "1006") {
    //   return {
    //     errorDataSourceVersionId: rowData.dataSourceVersionId,
    //     dataSourceId: rowData.refDataSourceId,
    //     rowData: rowDataPayload,
    //     isErrorResolved: true,
    //     errorDataSourceId: rowData.dataSourceId,
    //     fileAttributeValue: rowData.fileAttributeValue,
    //     attributeName: rowData.attributeName,
    //     errorCode: rowData.errorCode
    //   };
    // }else if (errorCode === "1002" || errorCode === "1004") {
    //   return {
    //     action: "update",
    //     rowData: rowDataPayload,
    //     rowNumber: rowData._id,
    //     dataSourceVersionId: rowData.dataSourceVersionId,
    //     dataSourceId: rowData.dataSourceId,
    //     attributeType: rowData.attributeType,
    //     fileAttributeValue: rowData.fileAttributeValue,
    //     attributeName: rowData.attributeName,
    //   };
    // } else if (errorCode === "1001") {
      return {
        action: "updateAll",
        rowData: rowDataPayload,
        rowNumber: rowData[0]._id,
        dataSourceVersionId: rowData[0].dataSourceVersionId,
        dataSourceId: rowData[0].dataSourceId,
        // attributeType: rowData.attributeType,
        // fileAttributeValue: rowData.fileAttributeValue,
        // attributeName: rowData.attributeName,
      };
    // }
  };

  // Validate all required fields
  const validateRequiredFields = () => {
    const errors: Record<string, string> = {};
    effectiveDataSource?.entityId?.attributes.forEach((attribute: any) => {
      if (attribute.required) {
        const fieldName = attribute.name;
        const value = formData[fieldName];
        // Check if field is empty
        if (
          value === undefined ||
          value === null ||
          value === "" ||
          (Array.isArray(value) && value.length === 0) ||
          (typeof value === "string" && value.trim() === "")
        ) {
          errors[fieldName] = `${attribute.label} is required`;
        }
      }
    });
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateField = (fieldName: string, value: any, attribute: any) => {
    const errors = { ...fieldErrors };
    // Check if field is required and empty
    if (attribute.required) {
      if (
        value === undefined ||
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0) ||
        (typeof value === "string" && value.trim() === "")
      ) {
        errors[fieldName] = `${attribute.label} is required`;
      } else {
        delete errors[fieldName];
      }
    }
    // Check field type validation
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
      console.log('dddddd');
      setSubmitAttempted(true);
      // First validate required fields
      if (!validateRequiredFields()) {
        toast.error("Please fill required fields");
        return;
      }
      // Then validate field types
      let isValid = true;
      effectiveDataSource?.entityId?.attributes.forEach((attribute: any) => {
        const fieldName = attribute.name;
        const value = formData[fieldName];
        validateField(fieldName, value, attribute);
        if (fieldErrors[fieldName]) {
          isValid = false;
        }
      });
      if (!isValid) {
        toast.error("Please fix the errors in the form");
        return;
      }
      const payload = convertToPayload();
      // if (errorCode === "1003") {
      //   await updateVersionRow.mutateAsync({
      //     url: `${POST.CREATE_VERSION_ROW}`,
      //     payload,
      //   });
      // }else if (errorCode === "1006") {
      //   await updateDuplicateVersionRow.mutateAsync({
      //     url: `${PUT.UPDATE_VERSION_ROW}/${rowData?.errorRowId}`,
      //     payload,
      //   });
      // }
      // else {
        await updateVersionRow.mutateAsync({
          url: `${POST.RESOLVE_DATA_IMPORT_ERROR}`,
          payload,
        });
      // }
      toast.success("Record updated successfully!");
      setIsResolved(true);
      refreshData();
      onSaved?.();
    } catch (error) {
      console.error("Error updating record:", error);
      toast.error(
        `Error: ${error.message || "Something went wrong. Please try again."}`
      );
    }
  };
   const handleForceSaveClick = async () => {
    try {
      setSubmitAttempted(true);
      // First validate required fields
      if (!validateRequiredFields()) {
        toast.error("Please fill required fields");
        return;
      }
      // Then validate field types
      let isValid = true;
      effectiveDataSource?.entityId?.attributes.forEach((attribute: any) => {
        const fieldName = attribute.name;
        const value = formData[fieldName];
        validateField(fieldName, value, attribute);
        if (fieldErrors[fieldName]) {
          isValid = false;
        }
      });
      if (!isValid) {
        toast.error("Please fix the errors in the form");
        return;
      }
      const payload = convertToPayload();
      // if (errorCode === "1003") {
      //   await updateVersionRow.mutateAsync({
      //     url: `${POST.CREATE_VERSION_ROW}`,
      //     payload,
      //   });
      // }else if (errorCode === "1006") {
      //   await updateDuplicateVersionRow.mutateAsync({
      //     url: `${PUT.UPDATE_VERSION_ROW}/${rowData?.errorRowId}`,
      //     payload,
      //   });
      // }
      // else {
        await updateVersionRow.mutateAsync({
          url: `${POST.RESOLVE_DATA_IMPORT_ERROR}`,
          payload: {...payload, isPortfolioErrorOverwrite: true},
        });
      // }
      toast.success("Record updated successfully!");
      setIsResolved(true);
      refreshData();
      onSaved?.();
    } catch (error) {
      console.error("Error updating record:", error);
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

  const handleFieldChange = (fieldName: string, value: any, attribute: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
    // Always validate on change if submit was attempted or if it's a required field
    if (submitAttempted || attribute.required) {
      validateField(fieldName, value, attribute);
    }
  };

const errorMap = React.useMemo(() => {
  const map: Record<string, string[]> = {};
console.log('rowData',rowData);
  (rowData || []).forEach((row: any) => {
    if (
      ["1001", "1002", "1004"].includes(row.errorCode) &&
      row.refAttributeId
    ) {
      const short =
        row.errorSource === "master"
          ? "M"
          : row.errorSource === "portfolio"
          ? "P"
          : row.errorSource === "validation"
          ? "V"
          : "";

      if (!map[row.refAttributeId]) {
        map[row.refAttributeId] = [];
      }

      if (short && !map[row.refAttributeId].includes(short)) {
        map[row.refAttributeId].push(short);
      }
    }
  });

  return map;
}, [rowData]);

const getErrorMessages = (attributeId: string) => {
  return (rowData || [])
    .filter(
      (row: any) =>
        ["1001", "1002", "1004"].includes(row.errorCode) &&
        row.refAttributeId === attributeId
    )
    .map((row: any) => row.errorMessage)
    .filter(Boolean); // remove empty
};

// const isForceSubmit = Object.values(errorMap).some((arr) =>
//   arr.includes("P") || arr.includes("V")
// );
const canForceSave = (row: any) => {
  if (!["1001", "1002", "1004"].includes(row.errorCode)) return false;

  return (
    row.errorSource === "portfolio" ||
    (row.errorSource === "validation" &&
      row.attributeName === "SABIC Case Refrence Number")
  );
};

const isForceSubmit = (rowData || []).some(canForceSave);
  // const renderAttributeField = (attribute: any) => {
  //   const fieldName = attribute.name;
  //   const fieldLabel = attribute.label;
  //   const fieldType = attribute.type;
  //   const fieldValue = formData[fieldName];
  //   const hasError = fieldErrors[fieldName];
  //   const isRequired = attribute.required;
  //   const options = attributeOptions[attribute.optionAttributeId] || [];

  //   // Check if this is the target attribute for error codes 1003 or 1002
  //   const isTargetAttributeFor1003 =
  //     (errorCode === "1003" || errorCode === "1006") &&
  //     refAttributeId &&
  //     attribute._id === refAttributeId;

  //   const isTargetAttributeFor1002 =
  //     (errorCode === "1002" || errorCode === "1004") &&
  //     refAttributeId &&
  //     attribute._id === refAttributeId;

  //   const isTargetAttributeFor1001 =
  //     errorCode === "1001" &&
  //     refAttributeId &&
  //     attribute._id === refAttributeId;

  //   // Disable the field only for error code 1003 target attribute
  //   const isDisabled = isTargetAttributeFor1003;

  //   // Highlight for both 1003 and 1002
  //   const isTargetAttribute =
  //     isTargetAttributeFor1003 ||
  //     isTargetAttributeFor1002 ||
  //     isTargetAttributeFor1001;

  //   const renderLabel = (label: string) => (
  //     <React.Fragment>
  //       {label}
  //       {isRequired && (
  //         <Typography
  //           component="span"
  //           sx={{ color: "red" }}
  //         >
  //           {" *"}
  //         </Typography>
  //       )}
  //       {isTargetAttributeFor1003 && (
  //         <Typography
  //           component="span"
  //           sx={{
  //             color: STYLE_GUIDE?.COLORS?.primaryDark,
  //             fontWeight: "bold",
  //             ml: 1,
  //           }}
  //         >
  //           (Error Field - Disabled)
  //         </Typography>
  //       )}
  //       {(isTargetAttributeFor1002 || isTargetAttributeFor1001) && (
  //         <Typography
  //           component="span"
  //           sx={{
  //             color: STYLE_GUIDE?.COLORS?.primaryDark,
  //             fontWeight: "bold",
  //             ml: 1,
  //           }}
  //         >
  //           (Error Field)
  //         </Typography>
  //       )}
  //     </React.Fragment>
  //   );

  //   switch (fieldType) {
  //     case "boolean":
  //       return (
  //         <FormControlLabel
  //           key={fieldName}
  //           control={
  //             <Checkbox
  //               checked={!!fieldValue}
  //               onChange={(e) =>
  //                 !isDisabled &&
  //                 handleFieldChange(fieldName, e.target.checked, attribute)
  //               }
  //               disabled={isDisabled}
  //             />
  //           }
  //           label={renderLabel(fieldLabel)}
  //           sx={{
  //             mb: 1,
  //             ...(isTargetAttribute && {
  //               backgroundColor: isTargetAttributeFor1003
  //                 ? "rgba(200, 200, 200, 0.3)"
  //                 : "rgba(255, 235, 238, 0.5)",
  //               p: 1,
  //               borderRadius: "4px",
  //             }),
  //           }}
  //         />
  //       );
  //     case "option":
  //       const optionOptions = getOptionsForAttribute(
  //         attribute.optionAttributeId
  //       );
  //       const selectedOption = optionOptions.find(
  //         (option) => option.id === fieldValue
  //       );
  //       const isReference = !!attribute.referenceEntitySetting;
  //       return (
  //         <Autocomplete
  //           freeSolo={!isReference}
  //           key={fieldName}
  //           options={optionOptions}
  //           getOptionLabel={(option) => {
  //             if (typeof option === "string") {
  //               return option;
  //             }
  //             return option.label || "";
  //           }}
  //           value={selectedOption || ""}
  //           onChange={(e, value) => {
  //             if (!isDisabled) {
  //               if (typeof value === "string") {
  //                 handleFieldChange(fieldName, value, attribute);
  //               } else if (value && value.id) {
  //                 handleFieldChange(fieldName, value.id, attribute);
  //               } else {
  //                 handleFieldChange(fieldName, "", attribute);
  //               }
  //             }
  //           }}
  //           disabled={isDisabled}
  //           renderInput={(params) => (
  //             <TextField
  //               {...params}
  //               label={renderLabel(fieldLabel)}
  //               variant="outlined"
  //               fullWidth
  //               size="small"
  //               error={!!hasError}
  //               helperText={fieldErrors[fieldName] || ""}
  //               sx={{
  //                 "& .MuiOutlinedInput-root": {
  //                   borderRadius: "8px",
  //                   ...(isTargetAttribute && {
  //                     backgroundColor: isTargetAttributeFor1003
  //                       ? "rgba(200, 200, 200, 0.3)"
  //                       : "rgba(255, 235, 238, 0.5)",
  //                   }),
  //                 },
  //               }}
  //               placeholder={isReference ? "Select option" : "Type or select"}
  //             />
  //           )}
  //           renderOption={(props, option) => {
  //             const { key, ...otherProps } = props;
  //             return (
  //               <li
  //                 key={typeof option === "string" ? option : option.id}
  //                 {...otherProps}
  //               >
  //                 {typeof option === "string" ? option : option.label}
  //               </li>
  //             );
  //           }}
  //           renderTags={(value, getTagProps) => {
  //             if (!value) return null;
  //             return (
  //               <Chip
  //                 label={typeof value === "string" ? value : value.label}
  //                 {...getTagProps({})}
  //                 size="small"
  //                 disabled={isDisabled}
  //                 onDelete={() => {
  //                   if (!isDisabled) {
  //                     handleFieldChange(fieldName, "", attribute);
  //                   }
  //                 }}
  //               />
  //             );
  //           }}
  //         />
  //       );
  //     case "multioption":
  //       const multioptionOptions = getOptionsForAttribute(
  //         attribute.optionAttributeId
  //       );

  //       // Get the array of IDs from form data
  //       const selectedIds = formData[fieldName] || [];
  //       // Convert IDs to full option objects
  //       // const selectedOptions = selectedIds.map((id: string) => {
  //       //   const option = multioptionOptions.find((opt) => opt.id === id);
  //       //   return option || { id, label: id };
  //       // });
  //       const selectedOptions = selectedIds
  //                       .map((id: string) =>
  //                         multioptionOptions.find((opt) => opt.id === id)
  //                       )
  //                       .filter(Boolean); // removes invalid values


  //       const isReferenceMulti = !!attribute.referenceEntitySetting;
  //       return (
  //         <Autocomplete
  //           multiple
  //           freeSolo={!isReferenceMulti}
  //           key={fieldName}
  //           options={multioptionOptions}
  //           getOptionLabel={(option) => {
  //             if (typeof option === "string") {
  //               return option;
  //             }
  //             return option.label || "";
  //           }}
  //           value={selectedOptions || ""}
  //           onChange={(e, value) => {
  //             if (!isDisabled) {
  //               const values = value.map((item) => {
  //                 if (typeof item === "string") {
  //                   return item;
  //                 }
  //                 return item.id;
  //               });
  //               handleFieldChange(fieldName, values, attribute);
  //             }
  //           }}
  //           disabled={isDisabled}
  //           renderInput={(params) => (
  //             <TextField
  //               {...params}
  //               label={renderLabel(fieldLabel)}
  //               variant="outlined"
  //               fullWidth
  //               size="small"
  //               error={!!hasError}
  //               helperText={fieldErrors[fieldName] || ""}
  //               sx={{
  //                 "& .MuiOutlinedInput-root": {
  //                   borderRadius: "8px",
  //                   ...(isTargetAttribute && {
  //                     backgroundColor: isTargetAttributeFor1003
  //                       ? "rgba(200, 200, 200, 0.3)"
  //                       : "rgba(255, 235, 238, 0.5)",
  //                   }),
  //                 },
  //               }}
  //               placeholder={
  //                 isReferenceMulti ? "Select option" : "Type or select"
  //               }
  //             />
  //           )}
  //           renderTags={(value, getTagProps) =>
  //             value.map((option, index) => (
  //               <Chip
  //                 key={`${option.id}-${index}`} // Add unique key to prevent duplicates
  //                 label={typeof option === "string" ? option : option.label}
  //                 {...getTagProps({ index })}
  //                 size="small"
  //                 disabled={isDisabled}
  //                 onDelete={() => {
  //                   if (!isDisabled) {
  //                     // Remove the specific option when chip is deleted
  //                     const currentValues = formData[fieldName] || [];
  //                     const newValues = currentValues.filter(
  //                       (id: string) => id !== option.id
  //                     );
  //                     handleFieldChange(fieldName, newValues, attribute);
  //                   }
  //                 }}
  //               />
  //             ))
  //           }
  //         />
  //       );
  //     case "date":
  //     case "date-range":
  //       const dateValue = fieldValue ? dayjs(fieldValue) : null;
  //       return (
  //         <LocalizationProvider key={fieldName} dateAdapter={AdapterDayjs}>
  //           <DatePicker
  //             label={renderLabel(fieldLabel)}
  //             value={dateValue && dateValue.isValid() ? dateValue : null}
  //             onChange={(date) => {
  //               if (!isDisabled) {
  //                 handleFieldChange(
  //                   fieldName,
  //                   date ? date.toISOString() : "",
  //                   attribute
  //                 );
  //               }
  //             }}
  //             format="DD/MM/YYYY"
  //             disabled={isDisabled}
  //             slotProps={{
  //               textField: {
  //                 variant: "outlined",
  //                 fullWidth: true,
  //                 size: "small",
  //                 error: !!hasError,
  //                 helperText: fieldErrors[fieldName] || "",
  //                 sx: {
  //                   "& .MuiOutlinedInput-root": {
  //                     borderRadius: "8px",
  //                     ...(isTargetAttribute && {
  //                       backgroundColor: isTargetAttributeFor1003
  //                         ? "rgba(200, 200, 200, 0.3)"
  //                         : "rgba(255, 235, 238, 0.5)",
  //                     }),
  //                   },
  //                 },
  //               },
  //             }}
  //           />
  //         </LocalizationProvider>
  //       );
  //     case "number":
  //       return (
  //         <TextField
  //           key={fieldName}
  //           label={renderLabel(fieldLabel)}
  //           type="number"
  //           value={fieldValue || ""}
  //           onChange={(e) => {
  //             if (!isDisabled) {
  //               const value = e.target.value;
  //               if (value === "" || isValidNumber(value)) {
  //                 handleFieldChange(fieldName, value, attribute);
  //               }
  //             }
  //           }}
  //           disabled={isDisabled}
  //           variant="outlined"
  //           fullWidth
  //           size="small"
  //           error={!!hasError}
  //           helperText={fieldErrors[fieldName] || ""}
  //           sx={{
  //             "& .MuiOutlinedInput-root": {
  //               borderRadius: "8px",
  //               ...(isTargetAttribute && {
  //                 backgroundColor: isTargetAttributeFor1003
  //                   ? "rgba(200, 200, 200, 0.3)"
  //                   : "rgba(255, 235, 238, 0.5)",
  //               }),
  //             },
  //           }}
  //         />
  //       );
  //     case "email":
  //       return (
  //         <TextField
  //           key={fieldName}
  //           label={renderLabel(fieldLabel)}
  //           type="email"
  //           value={fieldValue || ""}
  //           onChange={(e) => {
  //             if (!isDisabled) {
  //               handleFieldChange(fieldName, e.target.value, attribute);
  //             }
  //           }}
  //           disabled={isDisabled}
  //           variant="outlined"
  //           fullWidth
  //           size="small"
  //           error={!!hasError}
  //           helperText={fieldErrors[fieldName] || ""}
  //           sx={{
  //             "& .MuiOutlinedInput-root": {
  //               borderRadius: "8px",
  //               ...(isTargetAttribute && {
  //                 backgroundColor: isTargetAttributeFor1003
  //                   ? "rgba(200, 200, 200, 0.3)"
  //                   : "rgba(255, 235, 238, 0.5)",
  //               }),
  //             },
  //           }}
  //         />
  //       );
  //     default:
  //       return (
  //         <TextField
  //           key={fieldName}
  //           label={renderLabel(fieldLabel)}
  //           value={fieldValue || ""}
  //           onChange={(e) => {
  //             if (!isDisabled) {
  //               handleFieldChange(fieldName, e.target.value, attribute);
  //             }
  //           }}
  //           disabled={isDisabled}
  //           variant="outlined"
  //           fullWidth
  //           size="small"
  //           error={!!hasError}
  //           helperText={fieldErrors[fieldName] || ""}
  //           sx={{
  //             "& .MuiOutlinedInput-root": {
  //               borderRadius: "8px",
  //               ...(isTargetAttribute && {
  //                 backgroundColor: isTargetAttributeFor1003
  //                   ? "rgba(200, 200, 200, 0.3)"
  //                   : "rgba(255, 235, 238, 0.5)",
  //               }),
  //             },
  //           }}
  //         />
  //       );
  //   }
  // };
  const renderAttributeField = (attribute: any) => {
    const fieldName = attribute.name;
    const fieldLabel = attribute.label;
    const fieldType = attribute.type;
    const fieldValue = formData[fieldName];
    const hasError = fieldErrors[fieldName];
    const isRequired = attribute.required;
    const options = attributeOptions[attribute.optionAttributeId] || [];

   const errorShortForms = errorMap[attribute._id] || [];
   const errorMessages = getErrorMessages(attribute._id);
const isTargetAttribute = errorShortForms.length > 0;
const isDisabled = false; // no disable now

   const renderLabel = (label: string) => (
  <>
    {label}
    {isRequired && (
      <Typography component="span" sx={{ color: "red" }}>
        {" *"}
      </Typography>
    )}

    {isTargetAttribute && (
      <Box component="span" sx={{ ml: 1, display: "inline-flex", gap: 0.5 }}>
        {errorShortForms.map((type: string, idx: number) => (
          <Tooltip
        key={idx}
        arrow
        placement="top"
        title={errorMessages[idx] || ""} // ✅ message only
      >
          <Chip
            key={type}
            label={type}
            size="small"
            sx={{
              height: 20,
              fontSize: "12px",
              backgroundColor: getErrorColor(type),
              color: getTextColor(type),
            }}
          />
          </Tooltip>
        ))}
      </Box>
    )}
  </>
);
const isAmountField =
  fieldName?.toLowerCase().includes("fees") ||
  fieldName?.toLowerCase().includes("amount");

    switch (fieldType) {
      case "boolean":
        return (
          <FormControlLabel
            key={fieldName}
            control={
              <Checkbox
                checked={!!fieldValue}
                onChange={(e) =>
                  !isDisabled &&
                  handleFieldChange(fieldName, e.target.checked, attribute)
                }
                disabled={isDisabled}
              />
            }
            label={renderLabel(fieldLabel)}
            sx={{
              mb: 1,
              ...(isTargetAttribute && {
                              backgroundColor: isTargetAttribute
                ? "rgba(255, 235, 238, 0.5)"
                : undefined,
                p: 1,
                borderRadius: "4px",
              }),
            }}
          />
        );
      case "option":
        const optionOptions = getOptionsForAttribute(
          attribute.optionAttributeId
        );
        const selectedOption = optionOptions.find(
          (option) => option.id === fieldValue
        );
        const isReference = !!attribute.referenceEntitySetting;
        return (
          <Autocomplete
            freeSolo={!isReference}
            key={fieldName}
            options={optionOptions}
            getOptionLabel={(option) => {
              if (typeof option === "string") {
                return option;
              }
              return option.label || "";
            }}
            value={selectedOption || ""}
            onChange={(e, value) => {
              if (!isDisabled) {
                if (typeof value === "string") {
                  handleFieldChange(fieldName, value, attribute);
                } else if (value && value.id) {
                  handleFieldChange(fieldName, value.id, attribute);
                } else {
                  handleFieldChange(fieldName, "", attribute);
                }
              }
            }}
            disabled={isDisabled}
            renderInput={(params) => (
              <TextField
                {...params}
                label={renderLabel(fieldLabel)}
                variant="outlined"
                fullWidth
                size="small"
                error={!!hasError}
                helperText={fieldErrors[fieldName] || ""}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    ...(isTargetAttribute && {
                      backgroundColor: isTargetAttribute
  ? "rgba(255, 235, 238, 0.5)"
  : undefined,
                    }),
                  },
                }}
                placeholder={isReference ? "Select option" : "Type or select"}
              />
            )}
            renderOption={(props, option) => {
              const { key, ...otherProps } = props;
              return (
                <li
                  key={typeof option === "string" ? option : option.id}
                  {...otherProps}
                >
                  {typeof option === "string" ? option : option.label}
                </li>
              );
            }}
            renderTags={(value, getTagProps) => {
              if (!value) return null;
              return (
                <Chip
                  label={typeof value === "string" ? value : value.label}
                  {...getTagProps({})}
                  size="small"
                  disabled={isDisabled}
                  onDelete={() => {
                    if (!isDisabled) {
                      handleFieldChange(fieldName, "", attribute);
                    }
                  }}
                />
              );
            }}
          />
        );
      case "multioption":
        const multioptionOptions = getOptionsForAttribute(
          attribute.optionAttributeId
        );

        // Get the array of IDs from form data
        const selectedIds = formData[fieldName] || [];
        // Convert IDs to full option objects
        // const selectedOptions = selectedIds.map((id: string) => {
        //   const option = multioptionOptions.find((opt) => opt.id === id);
        //   return option || { id, label: id };
        // });
        const selectedOptions = selectedIds
                        .map((id: string) =>
                          multioptionOptions.find((opt) => opt.id === id)
                        )
                        .filter(Boolean); // removes invalid values


        const isReferenceMulti = !!attribute.referenceEntitySetting;
        return (
          <Autocomplete
            multiple
            freeSolo={!isReferenceMulti}
            key={fieldName}
            options={multioptionOptions}
            getOptionLabel={(option) => {
              if (typeof option === "string") {
                return option;
              }
              return option.label || "";
            }}
            value={selectedOptions || ""}
            onChange={(e, value) => {
              if (!isDisabled) {
                const values = value.map((item) => {
                  if (typeof item === "string") {
                    return item;
                  }
                  return item.id;
                });
                handleFieldChange(fieldName, values, attribute);
              }
            }}
            disabled={isDisabled}
            renderInput={(params) => (
              <TextField
                {...params}
                label={renderLabel(fieldLabel)}
                variant="outlined"
                fullWidth
                size="small"
                error={!!hasError}
                helperText={fieldErrors[fieldName] || ""}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    ...(isTargetAttribute && {
                     backgroundColor: isTargetAttribute
  ? "rgba(255, 235, 238, 0.5)"
  : undefined,
                    }),
                  },
                }}
                placeholder={
                  isReferenceMulti ? "Select option" : "Type or select"
                }
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  key={`${option.id}-${index}`} // Add unique key to prevent duplicates
                  label={typeof option === "string" ? option : option.label}
                  {...getTagProps({ index })}
                  size="small"
                  disabled={isDisabled}
                  onDelete={() => {
                    if (!isDisabled) {
                      // Remove the specific option when chip is deleted
                      const currentValues = formData[fieldName] || [];
                      const newValues = currentValues.filter(
                        (id: string) => id !== option.id
                      );
                      handleFieldChange(fieldName, newValues, attribute);
                    }
                  }}
                />
              ))
            }
          />
        );
      case "date":
      case "date-range":
        const dateValue = fieldValue ? dayjs(fieldValue) : null;
        return (
          <LocalizationProvider key={fieldName} dateAdapter={AdapterDayjs}>
            <DatePicker
              label={renderLabel(fieldLabel)}
              value={dateValue && dateValue.isValid() ? dateValue : null}
              onChange={(date) => {
                if (!isDisabled) {
                  handleFieldChange(
                    fieldName,
                    date ? date.toISOString() : "",
                    attribute
                  );
                }
              }}
              format="DD/MM/YYYY"
              disabled={isDisabled}
              slotProps={{
                textField: {
                  variant: "outlined",
                  fullWidth: true,
                  size: "small",
                  error: !!hasError,
                  helperText: fieldErrors[fieldName] || "",
                  sx: {
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      ...(isTargetAttribute && {
                        backgroundColor: isTargetAttribute
  ? "rgba(255, 235, 238, 0.5)"
  : undefined,
                      }),
                    },
                  },
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
            value={
              fieldValue !== undefined && fieldValue !== null && fieldValue !== ""
                ? fieldValue
                : isAmountField
                ? "0.00"
                : ""
            }
            onChange={(e) => {
              if (!isDisabled) {
                const value = e.target.value;
                if (value === "" || isValidNumber(value)) {
                  handleFieldChange(fieldName, value, attribute);
                }
              }
            }}
            disabled={isDisabled}
            variant="outlined"
            fullWidth
            size="small"
            error={!!hasError}
            helperText={fieldErrors[fieldName] || ""}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                ...(isTargetAttribute && {
                 backgroundColor: isTargetAttribute
  ? "rgba(255, 235, 238, 0.5)"
  : undefined,
                }),
              },
            }}
          />
        );
      case "email":
        return (
          <TextField
            key={fieldName}
            label={renderLabel(fieldLabel)}
            type="email"
            value={fieldValue || ""}
            onChange={(e) => {
              if (!isDisabled) {
                handleFieldChange(fieldName, e.target.value, attribute);
              }
            }}
            disabled={isDisabled}
            variant="outlined"
            fullWidth
            size="small"
            error={!!hasError}
            helperText={fieldErrors[fieldName] || ""}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                ...(isTargetAttribute && {
                  backgroundColor: isTargetAttribute
  ? "rgba(255, 235, 238, 0.5)"
  : undefined,
                }),
              },
            }}
          />
        );
      default:
        return (
          <TextField
            key={fieldName}
            label={renderLabel(fieldLabel)}
            value={fieldValue || ""}
            onChange={(e) => {
              if (!isDisabled) {
                handleFieldChange(fieldName, e.target.value, attribute);
              }
            }}
            disabled={isDisabled}
            variant="outlined"
            fullWidth
            size="small"
            error={!!hasError}
            helperText={fieldErrors[fieldName] || ""}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                ...(isTargetAttribute && {
                 backgroundColor: isTargetAttribute
  ? "rgba(255, 235, 238, 0.5)"
  : undefined,
                }),
              },
            }}
          />
        );
    }
  };

  const renderModalFields = () => {
    if (!effectiveDataSource?.entityId?.attributes) {
      return <Typography>No attributes available to display.</Typography>;
    }
    const filteredAttributes = effectiveDataSource.entityId.attributes.filter(
    (attr: any) =>
      !attr.name?.startsWith("Converted|") &&
      !attr.name?.startsWith("Validated|")
  );
    const firstColumnAttributes =
     filteredAttributes.filter(
        (_, index) => index % 3 === 0
      );
    const secondColumnAttributes =
      filteredAttributes.filter(
        (_, index) => index % 3 === 1
      );
    const thirdColumnAttributes =
      filteredAttributes.filter(
        (_, index) => index % 3 === 2
      );
    return (
      <>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {firstColumnAttributes.map(renderAttributeField)}
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {secondColumnAttributes.map(renderAttributeField)}
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {thirdColumnAttributes.map(renderAttributeField)}
        </Box>
      </>
    );
  };

  React.useEffect(() => {
  if (openModal) {
    const status =
      rowDetailData?.errorRecord?.status ||
      rowData?.errorRecord?.status;

    setIsResolved(status === "resolved");
  }
}, [openModal, rowDetailData, rowData]);

return (
  <Box>
    {/* Header */}
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 2,
      }}
    >
      <Typography
        variant="h6"
        sx={{ color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5" }}
      >
        {rowDetailData?.errorAction}
      </Typography>

      {/* Save button top-right */}
      {/* {isForceSubmit && ( */}
        <StyledButton
          variant="primary"
          // onClick={handleForceSaveClick}
          onClick={() => setOpenConfirm(true)}
          disabled={isResolved || !isForceSubmit}
        >
          Force Save
        </StyledButton>
      {/* )} */}
      {/* <StyledButton variant="primary" onClick={handleSaveClick} disabled={isResolved}>
        Save
      </StyledButton> */}
    </Box>

    <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
  <DialogTitle>Confirm Action</DialogTitle>

  <DialogContent>
    Are you sure you want to force overwrite?
  </DialogContent>

  <DialogActions>
    <Button onClick={() => setOpenConfirm(false)}>
      Cancel
    </Button>

    <Button
      color="error"
      onClick={() => {
        setOpenConfirm(false);
        handleForceSaveClick();
      }}
    >
      Yes, Force Save
    </Button>
  </DialogActions>
</Dialog>

    {/* Content */}
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 2,
      }}
    >
      {renderModalFields()}
    </Box>
  </Box>
);
};

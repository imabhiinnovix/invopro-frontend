// import * as React from "react";
// import {
//   Box,
//   Typography,
//   TextField,
//   Button,
//   IconButton,
//   Chip,
//   FormControlLabel,
//   Checkbox,
//   Autocomplete,
//   Tooltip,
// } from "@mui/material";
// import { STYLE_GUIDE } from "../../styles";
// import { DatePicker } from "@mui/x-date-pickers/DatePicker";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import dayjs from "dayjs";
// import CloseIcon from "@mui/icons-material/Close";
// import { PUT, GET, POST } from "../../services/apiRoutes";
// import { toast } from "react-toastify";
// import usePost from "../../hooks/usePost";
// import { useSelector } from "react-redux";
// import { RootState } from "../../reducers";

// interface ValidationErrorModalProps {
//   openModal: boolean;
//   rowData: any;
//   currentDataSource: any;
//   attributeListData: any[];
//   handleCloseModal: () => void;
//   refreshData: () => void;
//   rowDetailData?: any;
// }

// export const ValidationErrorModal: React.FC<ValidationErrorModalProps> = ({
//   openModal,
//   rowData,
//   currentDataSource,
//   attributeListData,
//   handleCloseModal,
//   refreshData,
//   rowDetailData,
// }) => {
//   const [formData, setFormData] = React.useState<Record<string, any>>({});
//   const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>(
//     {}
//   );
//   console.log("rrrrrrr", rowData, rowDetailData);
//   const [matchedDataSource, setMatchedDataSource] = React.useState<any>(null);
//   const [submitAttempted, setSubmitAttempted] = React.useState(false);
//   const [attributeOptions, setAttributeOptions] = React.useState<
//     Record<string, any[]>
//   >({});
//   const [targetAttribute, setTargetAttribute] = React.useState<any>(null);
//   const commonDataSourceList = useSelector(
//     (state: RootState) => state.dataSource?.list
//   );
//   const errorCode = rowData?.errorCode || "";
//   const refDataSourceId = rowData?.refDataSourceId || "";
//   const refAttributeId = rowData?.refAttributeId || "";
//   const dataSourceId = rowData?.dataSourceId || ""; // Added for error code 1002
//   const updateVersionRow = usePost(["updateVersionRow"]);

//   // Handle exceptional cases for error codes "1003" and "1002"
//   React.useEffect(() => {
//     if (openModal) {
//       setMatchedDataSource(null);
//       setTargetAttribute(null);
//       // Handle error code 1003
//       if (errorCode === "1003" && refDataSourceId) {
//         const matched = commonDataSourceList?.find(
//           (ds) => ds._id === refDataSourceId
//         );
//         if (matched) {
//           setMatchedDataSource(matched);
//           // Find the target attribute in the matched data source
//           if (refAttributeId && matched.entityId?.attributes) {
//             const attribute = matched.entityId.attributes.find(
//               (attr: any) => attr._id === refAttributeId
//             );
//             if (attribute) {
//               setTargetAttribute(attribute);
//             }
//           }
//         }
//       }
//       // Handle error code 1002
//       if (errorCode === "1002" && dataSourceId) {
//         const matched = commonDataSourceList?.find(
//           (ds) => ds._id === dataSourceId
//         );
//         if (matched) {
//           console.log("Matched data source for errorCode 1002:", matched);
//           setMatchedDataSource(matched);
//           // Find the target attribute in the matched data source
//           if (refAttributeId && matched.entityId?.attributes) {
//             const attribute = matched.entityId.attributes.find(
//               (attr: any) => attr._id === refAttributeId
//             );
//             if (attribute) {
//               console.log("Target attribute found:", attribute);
//               setTargetAttribute(attribute);
//             }
//           }
//         }
//       }
//     }
//   }, [
//     openModal,
//     errorCode,
//     refDataSourceId,
//     refAttributeId,
//     dataSourceId,
//     commonDataSourceList,
//   ]);

//   // Use effectiveDataSource that prioritizes matchedDataSource for error codes "1003" and "1002"
//   const effectiveDataSource = matchedDataSource || currentDataSource;

//   // Fetch attribute options for option and multioption fields
//   React.useEffect(() => {
//     if (effectiveDataSource?.entityId?.attributes && openModal) {
//       const attributes = effectiveDataSource.entityId.attributes;
//       const optionsMap: Record<string, any[]> = {};
//       const fetchOptions = async () => {
//         for (const currentAttribute of attributes) {
//           if (
//             (currentAttribute.type === "option" ||
//               currentAttribute.type === "multioption") &&
//             currentAttribute.optionAttributeId
//           ) {
//             try {
//               const optionAttribute = attributeListData.find(
//                 (attr) => attr._id === currentAttribute.optionAttributeId
//               );
//               if (
//                 optionAttribute &&
//                 Array.isArray(optionAttribute.attributeValue)
//               ) {
//                 optionsMap[currentAttribute.optionAttributeId] =
//                   optionAttribute.attributeValue.map((value: string) => ({
//                     id: value,
//                     label: value,
//                   }));
//               }
//             } catch (error) {
//               console.error(
//                 `Error processing options for attribute ${currentAttribute.name}:`,
//                 error
//               );
//             }
//           }
//         }
//         setAttributeOptions(optionsMap);
//       };
//       fetchOptions();
//     }
//   }, [effectiveDataSource, openModal, attributeListData]);

//   const getOptionsForAttribute = (attributeId: string) => {
//     const attribute = attributeListData.find(
//       (attr) => attr._id === attributeId
//     );
//     if (!attribute || !Array.isArray(attribute.attributeValue)) return [];
//     return attribute.attributeValue.map((value: string) => ({
//       id: value,
//       label: value,
//     }));
//   };

//   // Helper function to safely convert a value to a date ISO string
//   const safeDateToISOString = (value: any): string | null => {
//     if (!value) return null;
//     try {
//       const date = dayjs(value);
//       if (date.isValid()) {
//         return date.toISOString();
//       }
//       return null;
//     } catch (error) {
//       console.error("Error converting date:", error);
//       return null;
//     }
//   };

//   // Initialize form data when modal opens or row data changes
//   React.useEffect(() => {
//     console.log(
//       "rowData",
//       rowData,
//       "rowDetailData",
//       rowDetailData,
//       openModal,
//       effectiveDataSource
//     );
//     if (rowData && openModal && effectiveDataSource?.entityId?.attributes) {
//       const initialFormData: Record<string, any> = {};

//       // For error code 1002, get rowData from rowDetailData if available
//       let sourceData = rowData;
//       if (errorCode === "1002" && rowDetailData) {
//         sourceData = rowDetailData?.rowData || rowData;
//         console.log("Using rowDetailData for error code 1002:", sourceData);
//       }

//       effectiveDataSource.entityId.attributes.forEach((attribute: any) => {
//         const fieldName = attribute.name;
//         let fieldValue = sourceData[fieldName];

//         // Special handling for error code "1003" with refAttributeId
//         if (
//           errorCode === "1003" &&
//           refAttributeId &&
//           attribute._id === refAttributeId
//         ) {
//           fieldValue = rowData.fileAttributeValue;
//           console.log(
//             `Setting ${fieldName} to fileAttributeValue: ${fieldValue}`
//           );
//         }
//         if (
//           (attribute.type === "date" || attribute.type === "date-range") &&
//           fieldValue
//         ) {
//           // Use safe conversion for dates
//           const isoDate = safeDateToISOString(fieldValue);
//           initialFormData[fieldName] = isoDate || "";
//         } else if (attribute.type === "boolean") {
//           initialFormData[fieldName] =
//             fieldValue === "true" || fieldValue === true;
//         } else if (attribute.type === "multioption" && fieldValue) {
//           // Handle migration from comma-separated to pipe-separated values
//           // Also handle if fieldValue is already an array
//           // if (Array.isArray(fieldValue)) {
//           //   initialFormData[fieldName] = fieldValue.join("|");
//           // } else if (fieldValue.includes(",")) {
//           //   initialFormData[fieldName] = fieldValue
//           //     .split(",")
//           //     .map((v) => v.trim())
//           //     .join("|");
//           // } else {
//           //   initialFormData[fieldName] = fieldValue;
//           // }
//           let normalizedValue = "";

//           if (Array.isArray(fieldValue)) {
//             normalizedValue = fieldValue.join("|");
//           } else if (typeof fieldValue === "string") {
//             // CRITICAL FIX: Always split by pipe OR comma, but store as pipe
//             const parts = fieldValue.includes("|")
//               ? fieldValue.split("|")
//               : fieldValue.includes(",")
//                 ? fieldValue.split(",").map((v) => v.trim())
//                 : [fieldValue.trim()];

//             // Remove empty parts
//             const cleanParts = parts.filter((p) => p && p.trim() !== "");
//             normalizedValue = cleanParts.join("|");
//           }

//           initialFormData[fieldName] = normalizedValue;
//         } else {
//           initialFormData[fieldName] = fieldValue || "";
//         }
//       });

//       if (effectiveDataSource) {
//         initialFormData.dataSourceName = effectiveDataSource.name;
//         initialFormData.dataSourceId = effectiveDataSource._id;
//       }

//       setFormData(initialFormData);
//     }
//   }, [
//     rowData,
//     rowDetailData,
//     effectiveDataSource,
//     openModal,
//     errorCode,
//     refAttributeId,
//   ]);

//   const isValidEmail = (email: string) => {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailRegex.test(email);
//   };

//   const isValidNumber = (value: string) => {
//     const numberRegex = /^[0-9]*$/;
//     return numberRegex.test(value);
//   };

//   // Build the rowData payload for both error codes
//   const buildRowDataPayload = () => {
//     const rowDataPayload: Record<string, any> = {};
//     effectiveDataSource?.entityId?.attributes.forEach((attribute: any) => {
//       const fieldName = attribute.name;
//       const value = formData[fieldName];

//       if (value !== undefined && value !== null && value !== "") {
//         if (
//           (attribute.type === "date" || attribute.type === "date-range") &&
//           value
//         ) {
//           // Use safe conversion for dates
//           const isoDate = safeDateToISOString(value);
//           if (isoDate) {
//             rowDataPayload[fieldName] = isoDate;
//           }
//         } else if (attribute.type === "boolean") {
//           rowDataPayload[fieldName] = value ? "true" : "false";
//         } else if (attribute.type === "multioption") {
//           // Convert pipe-separated string to array for multioption fields
//           if (typeof value === "string") {
//             rowDataPayload[fieldName] = value.split("|").map((v) => v.trim());
//           } else if (Array.isArray(value)) {
//             rowDataPayload[fieldName] = value;
//           }
//         } else {
//           rowDataPayload[fieldName] = value;
//         }
//       }
//     });
//     return rowDataPayload;
//   };

//   // Convert form data to payload based on error code
//   const convertToPayload = () => {
//     const rowDataPayload = buildRowDataPayload();
//     if (errorCode === "1003") {
//       return {
//         errorDataSourceVersionId: rowData.dataSourceVersionId,
//         dataSourceId: rowData.refDataSourceId,
//         rowData: rowDataPayload,
//         isErrorResolved: true,
//         errorDataSourceId: rowData.dataSourceId,
//         fileAttributeValue: rowData.fileAttributeValue,
//         attributeName: rowData.attributeName,
//       };
//     } else if (errorCode === "1002") {
//       return {
//         action: "update",
//         rowData: rowDataPayload,
//         rowNumber: rowData.rowNumber,
//         dataSourceVersionId: rowData.dataSourceVersionId,
//         dataSourceId: rowData.dataSourceId,
//         attributeType: rowData.attributeType,
//         fileAttributeValue: rowData.fileAttributeValue,
//         attributeName: rowData.attributeName,
//       };
//     } else if (errorCode === "1001") {
//       console.log("Building payload for error code 1001", rowDataPayload);
//       return {
//         action: "update",
//         rowData: rowDataPayload,
//       };
//     }
//     // Default payload for other error codes
//   };

//   // Validate all required fields
//   const validateRequiredFields = () => {
//     const errors: Record<string, string> = {};
//     effectiveDataSource?.entityId?.attributes.forEach((attribute: any) => {
//       if (attribute.required) {
//         const fieldName = attribute.name;
//         const value = formData[fieldName];
//         // Check if field is empty
//         if (
//           value === undefined ||
//           value === null ||
//           value === "" ||
//           (Array.isArray(value) && value.length === 0) ||
//           (typeof value === "string" && value.trim() === "")
//         ) {
//           errors[fieldName] = `${attribute.label} is required`;
//         }
//       }
//     });
//     setFieldErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const validateField = (fieldName: string, value: any, attribute: any) => {
//     const errors = { ...fieldErrors };
//     // Check if field is required and empty
//     if (attribute.required) {
//       if (
//         value === undefined ||
//         value === null ||
//         value === "" ||
//         (Array.isArray(value) && value.length === 0) ||
//         (typeof value === "string" && value.trim() === "")
//       ) {
//         errors[fieldName] = `${attribute.label} is required`;
//       } else {
//         // Remove error if field is now filled
//         delete errors[fieldName];
//       }
//     }
//     // Check field type validation
//     if (value !== undefined && value !== null && value !== "") {
//       if (attribute.type === "email" && !isValidEmail(value)) {
//         errors[fieldName] = `Please enter a valid email address`;
//       } else if (attribute.type === "number" && !isValidNumber(value)) {
//         errors[fieldName] = `Please enter a valid number`;
//       } else if (
//         attribute.type === "email" &&
//         isValidEmail(value) &&
//         errors[fieldName]?.includes("email")
//       ) {
//         // Remove email error if it's now valid
//         delete errors[fieldName];
//       } else if (
//         attribute.type === "number" &&
//         isValidNumber(value) &&
//         errors[fieldName]?.includes("number")
//       ) {
//         // Remove number error if it's now valid
//         delete errors[fieldName];
//       }
//     }
//     setFieldErrors(errors);
//   };

//   const handleSaveClick = async () => {
//     try {
//       setSubmitAttempted(true);
//       // First validate required fields
//       if (!validateRequiredFields()) {
//         toast.error("Please fill required fields");
//         return;
//       }
//       // Then validate field types
//       let isValid = true;
//       effectiveDataSource?.entityId?.attributes.forEach((attribute: any) => {
//         const fieldName = attribute.name;
//         const value = formData[fieldName];
//         validateField(fieldName, value, attribute);
//         if (fieldErrors[fieldName]) {
//           isValid = false;
//         }
//       });
//       if (!isValid) {
//         toast.error("Please fix the errors in the form");
//         return;
//       }
//       const payload = convertToPayload();
//       console.log("Update payload for error code", errorCode, ":", payload);
//       if (errorCode === "1003") {
//         await updateVersionRow.mutateAsync({
//           url: `${POST.CREATE_VERSION_ROW}`,
//           payload,
//         });
//       } else if (errorCode === "1002") {
//         await updateVersionRow.mutateAsync({
//           url: `${POST.RESOLVE_DATA_IMPORT_ERROR}`,
//           payload,
//         });
//       } else {
//         await updateVersionRow.mutateAsync({
//           url: `${POST.RESOLVE_DATA_IMPORT_ERROR}`,
//           payload,
//         });
//       }
//       toast.success("Record updated successfully!");
//       refreshData();
//       handleCloseModal();
//     } catch (error) {
//       console.error("Error updating record:", error);
//       toast.error(
//         `Error: ${error.message || "Something went wrong. Please try again."}`
//       );
//     }
//   };

//   const handleCancel = () => {
//     setFieldErrors({});
//     setSubmitAttempted(false);
//     handleCloseModal();
//   };

//   const handleFieldChange = (fieldName: string, value: any, attribute: any) => {
//     setFormData((prev) => ({
//       ...prev,
//       [fieldName]: value,
//     }));
//     // Always validate on change if submit was attempted or if it's a required field
//     if (submitAttempted || attribute.required) {
//       validateField(fieldName, value, attribute);
//     }
//   };

//   const renderAttributeField = (attribute: any) => {
//     const fieldName = attribute.name;
//     const fieldLabel = attribute.label;
//     const fieldType = attribute.type;
//     const fieldValue = formData[fieldName];
//     const hasError = fieldErrors[fieldName];
//     const isRequired = attribute.required;
//     const options = attributeOptions[attribute.optionAttributeId] || [];

//     // Check if this is the target attribute for error codes 1003 or 1002
//     const isTargetAttributeFor1003 =
//       errorCode === "1003" &&
//       refAttributeId &&
//       attribute._id === refAttributeId;

//     const isTargetAttributeFor1002 =
//       errorCode === "1002" &&
//       refAttributeId &&
//       attribute._id === refAttributeId;

//     // Disable the field only for error code 1003 target attribute
//     const isDisabled = isTargetAttributeFor1003;

//     // Highlight for both 1003 and 1002
//     const isTargetAttribute =
//       isTargetAttributeFor1003 || isTargetAttributeFor1002;

//     const renderLabel = (label: string) => (
//       <React.Fragment>
//         {label}
//         {isRequired && (
//           <Typography
//             component="span"
//             sx={{ color: STYLE_GUIDE?.COLORS?.primaryDark }}
//           >
//             {" *"}
//           </Typography>
//         )}
//         {isTargetAttributeFor1003 && (
//           <Typography
//             component="span"
//             sx={{
//               color: STYLE_GUIDE?.COLORS?.primaryDark,
//               fontWeight: "bold",
//               ml: 1,
//             }}
//           >
//             (Error Field - Disabled)
//           </Typography>
//         )}
//         {isTargetAttributeFor1002 && (
//           <Typography
//             component="span"
//             sx={{
//               color: STYLE_GUIDE?.COLORS?.primaryDark,
//               fontWeight: "bold",
//               ml: 1,
//             }}
//           >
//             (Error Field)
//           </Typography>
//         )}
//       </React.Fragment>
//     );

//     switch (fieldType) {
//       case "boolean":
//         return (
//           <FormControlLabel
//             key={fieldName}
//             control={
//               <Checkbox
//                 checked={!!fieldValue}
//                 onChange={(e) =>
//                   !isDisabled &&
//                   handleFieldChange(fieldName, e.target.checked, attribute)
//                 }
//                 disabled={isDisabled}
//                 sx={{
//                   color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
//                 }}
//               />
//             }
//             label={renderLabel(fieldLabel)}
//             sx={{
//               mb: 1,
//               ...(isTargetAttribute && {
//                 backgroundColor: isTargetAttributeFor1003
//                   ? "rgba(200, 200, 200, 0.3)"
//                   : "rgba(255, 235, 238, 0.5)",
//                 p: 1,
//                 borderRadius: "4px",
//               }),
//             }}
//           />
//         );
//       case "option":
//         const optionOptions = getOptionsForAttribute(
//           attribute.optionAttributeId
//         );
//         const selectedOption = optionOptions.find(
//           (option) => option.id === fieldValue
//         );
//         const isReference = !!attribute.referenceEntitySetting;
//         return (
//           <Autocomplete
//             freeSolo={!isReference}
//             key={fieldName}
//             options={optionOptions}
//             getOptionLabel={(option) => {
//               if (typeof option === "string") {
//                 return option;
//               }
//               return option.label || "";
//             }}
//             value={selectedOption || fieldValue || ""}
//             onChange={(e, value) => {
//               if (!isDisabled) {
//                 if (typeof value === "string") {
//                   handleFieldChange(fieldName, value, attribute);
//                 } else if (value && value.id) {
//                   handleFieldChange(fieldName, value.id, attribute);
//                 } else {
//                   handleFieldChange(fieldName, "", attribute);
//                 }
//               }
//             }}
//             disabled={isDisabled}
//             renderInput={(params) => (
//               <TextField
//                 {...params}
//                 label={renderLabel(fieldLabel)}
//                 variant="outlined"
//                 fullWidth
//                 error={!!hasError}
//                 helperText={fieldErrors[fieldName] || ""}
//                 sx={{
//                   "& .MuiOutlinedInput-root": {
//                     borderRadius: "8px",
//                     ...(isTargetAttribute && {
//                       backgroundColor: isTargetAttributeFor1003
//                         ? "rgba(200, 200, 200, 0.3)"
//                         : "rgba(255, 235, 238, 0.5)",
//                     }),
//                   },
//                 }}
//                 placeholder={isReference ? "Select option" : "Type or select"}
//               />
//             )}
//             renderOption={(props, option) => {
//               const { key, ...otherProps } = props;
//               return (
//                 <li
//                   key={typeof option === "string" ? option : option.id}
//                   {...otherProps}
//                 >
//                   {typeof option === "string" ? option : option.label}
//                 </li>
//               );
//             }}
//             renderTags={(value, getTagProps) => {
//               if (!value) return null;
//               return (
//                 <Chip
//                   label={typeof value === "string" ? value : value.label}
//                   {...getTagProps({})}
//                   size="small"
//                   disabled={isDisabled}
//                   onDelete={() => {
//                     if (!isDisabled) {
//                       handleFieldChange(fieldName, "", attribute);
//                     }
//                   }}
//                 />
//               );
//             }}
//           />
//         );
//       // case "multioption":
//       //   const multioptionOptions = getOptionsForAttribute(
//       //     attribute.optionAttributeId
//       //   );
//       //   const delimiter = "|";
//       //   let selectedValues = [];

//       //   if (Array.isArray(fieldValue)) {
//       //     selectedValues = fieldValue;
//       //   } else if (fieldValue && typeof fieldValue === "string") {
//       //     selectedValues = fieldValue
//       //       .split(delimiter)
//       //       .map((val: string) => val.trim());
//       //   }

//       //   const selectedOptions = selectedValues.map((val) => {
//       //     const option = multioptionOptions.find((opt) => opt.id === val);
//       //     return option || { id: val, label: val };
//       //   });

//       //   const isReferenceMulti = !!attribute.referenceEntitySetting;
//       //   return (
//       //     <Autocomplete
//       //       multiple
//       //       freeSolo={!isReferenceMulti}
//       //       key={fieldName}
//       //       options={multioptionOptions}
//       //       getOptionLabel={(option) => {
//       //         if (typeof option === "string") {
//       //           return option;
//       //         }
//       //         return option.label || "";
//       //       }}
//       //       value={selectedOptions}
//       //       onChange={(e, value) => {
//       //         if (!isDisabled) {
//       //           const values = value.map((item) => {
//       //             if (typeof item === "string") {
//       //               return item;
//       //             }
//       //             return item.id;
//       //           });
//       //           handleFieldChange(fieldName, values.join(delimiter), attribute);
//       //         }
//       //       }}
//       //       disabled={isDisabled}
//       //       renderInput={(params) => (
//       //         <TextField
//       //           {...params}
//       //           label={renderLabel(fieldLabel)}
//       //           variant="outlined"
//       //           fullWidth
//       //           error={!!hasError}
//       //           helperText={fieldErrors[fieldName] || ""}
//       //           sx={{
//       //             "& .MuiOutlinedInput-root": {
//       //               borderRadius: "8px",
//       //               ...(isTargetAttribute && {
//       //                 backgroundColor: isTargetAttributeFor1003
//       //                   ? "rgba(200, 200, 200, 0.3)"
//       //                   : "rgba(255, 235, 238, 0.5)",
//       //               }),
//       //             },
//       //           }}
//       //           placeholder={
//       //             isReferenceMulti ? "Select option" : "Type or select"
//       //           }
//       //         />
//       //       )}
//       //       renderTags={(value, getTagProps) =>
//       //         value.map((option, index) => (
//       //           <Chip
//       //             key={typeof option === "string" ? option : option.id}
//       //             label={typeof option === "string" ? option : option.label}
//       //             {...getTagProps({ index })}
//       //             size="small"
//       //             disabled={isDisabled}
//       //             onDelete={() => {
//       //               if (!isDisabled) {
//       //                 handleFieldChange(fieldName, "", attribute);
//       //               }
//       //             }}
//       //           />
//       //         ))
//       //       }
//       //     />
//       //   );

//       case "multioption":
//         const multioptionOptions = getOptionsForAttribute(
//           attribute.optionAttributeId
//         );

//         // Handle different input formats correctly
//         let selectedValues = [];
//         if (Array.isArray(fieldValue)) {
//           selectedValues = fieldValue;
//         } else if (fieldValue && typeof fieldValue === "string") {
//           // Check if it's pipe-separated (new format) or comma-separated (old format)
//           if (fieldValue.includes("|")) {
//             selectedValues = fieldValue
//               .split("|")
//               .map((val: string) => val.trim());
//           } else if (fieldValue.includes(",")) {
//             selectedValues = fieldValue
//               .split(",")
//               .map((val: string) => val.trim());
//           } else {
//             selectedValues = [fieldValue];
//           }
//         }

//         const selectedOptions = selectedValues.map((val) => {
//           const option = multioptionOptions.find((opt) => opt.id === val);
//           return option || { id: val, label: val };
//         });

//         const isReferenceMulti = !!attribute.referenceEntitySetting;
//         return (
//           <Autocomplete
//             multiple
//             freeSolo={!isReferenceMulti}
//             key={fieldName}
//             options={multioptionOptions}
//             getOptionLabel={(option) => {
//               if (typeof option === "string") {
//                 return option;
//               }
//               return option.label || "";
//             }}
//             value={selectedOptions}
//             onChange={(e, value) => {
//               if (!isDisabled) {
//                 const values = value.map((item) => {
//                   if (typeof item === "string") {
//                     return item;
//                   }
//                   return item.id;
//                 });
//                 // Store as pipe-separated string
//                 handleFieldChange(fieldName, values.join("|"), attribute);
//               }
//             }}
//             disabled={isDisabled}
//             renderInput={(params) => (
//               <TextField
//                 {...params}
//                 label={renderLabel(fieldLabel)}
//                 variant="outlined"
//                 fullWidth
//                 error={!!hasError}
//                 helperText={fieldErrors[fieldName] || ""}
//                 sx={{
//                   "& .MuiOutlinedInput-root": {
//                     borderRadius: "8px",
//                     ...(isTargetAttribute && {
//                       backgroundColor: isTargetAttributeFor1003
//                         ? "rgba(200, 200, 200, 0.3)"
//                         : "rgba(255, 235, 238, 0.5)",
//                     }),
//                   },
//                 }}
//                 placeholder={
//                   isReferenceMulti ? "Select option" : "Type or select"
//                 }
//               />
//             )}
//             renderTags={(value, getTagProps) =>
//               value.map((option, index) => (
//                 <Chip
//                   key={`${option.id}-${index}`} // Add unique key to prevent duplicates
//                   label={typeof option === "string" ? option : option.label}
//                   {...getTagProps({ index })}
//                   size="small"
//                   disabled={isDisabled}
//                   onDelete={() => {
//                     if (!isDisabled) {
//                       handleFieldChange(fieldName, "", attribute);
//                     }
//                   }}
//                 />
//               ))
//             }
//           />
//         );
//       case "date":
//       case "date-range":
//         const dateValue = fieldValue ? dayjs(fieldValue) : null;
//         return (
//           <LocalizationProvider key={fieldName} dateAdapter={AdapterDayjs}>
//             <DatePicker
//               label={renderLabel(fieldLabel)}
//               value={dateValue && dateValue.isValid() ? dateValue : null}
//               onChange={(date) => {
//                 if (!isDisabled) {
//                   handleFieldChange(
//                     fieldName,
//                     date ? date.toISOString() : "",
//                     attribute
//                   );
//                 }
//               }}
//               format="DD/MM/YYYY"
//               disabled={isDisabled}
//               slotProps={{
//                 textField: {
//                   variant: "outlined",
//                   fullWidth: true,
//                   error: !!hasError,
//                   helperText: fieldErrors[fieldName] || "",
//                   sx: {
//                     "& .MuiOutlinedInput-root": {
//                       borderRadius: "8px",
//                       ...(isTargetAttribute && {
//                         backgroundColor: isTargetAttributeFor1003
//                           ? "rgba(200, 200, 200, 0.3)"
//                           : "rgba(255, 235, 238, 0.5)",
//                       }),
//                     },
//                   },
//                 },
//               }}
//             />
//           </LocalizationProvider>
//         );
//       case "number":
//         return (
//           <TextField
//             key={fieldName}
//             label={renderLabel(fieldLabel)}
//             type="number"
//             value={fieldValue || ""}
//             onChange={(e) => {
//               if (!isDisabled) {
//                 const value = e.target.value;
//                 if (value === "" || isValidNumber(value)) {
//                   handleFieldChange(fieldName, value, attribute);
//                 }
//               }
//             }}
//             disabled={isDisabled}
//             variant="outlined"
//             fullWidth
//             error={!!hasError}
//             helperText={fieldErrors[fieldName] || ""}
//             sx={{
//               "& .MuiOutlinedInput-root": {
//                 borderRadius: "8px",
//                 ...(isTargetAttribute && {
//                   backgroundColor: isTargetAttributeFor1003
//                     ? "rgba(200, 200, 200, 0.3)"
//                     : "rgba(255, 235, 238, 0.5)",
//                 }),
//               },
//             }}
//           />
//         );
//       case "email":
//         return (
//           <TextField
//             key={fieldName}
//             label={renderLabel(fieldLabel)}
//             type="email"
//             value={fieldValue || ""}
//             onChange={(e) => {
//               if (!isDisabled) {
//                 handleFieldChange(fieldName, e.target.value, attribute);
//               }
//             }}
//             disabled={isDisabled}
//             variant="outlined"
//             fullWidth
//             error={!!hasError}
//             helperText={fieldErrors[fieldName] || ""}
//             sx={{
//               "& .MuiOutlinedInput-root": {
//                 borderRadius: "8px",
//                 ...(isTargetAttribute && {
//                   backgroundColor: isTargetAttributeFor1003
//                     ? "rgba(200, 200, 200, 0.3)"
//                     : "rgba(255, 235, 238, 0.5)",
//                 }),
//               },
//             }}
//           />
//         );
//       default:
//         return (
//           <TextField
//             key={fieldName}
//             label={renderLabel(fieldLabel)}
//             value={fieldValue || ""}
//             onChange={(e) => {
//               if (!isDisabled) {
//                 handleFieldChange(fieldName, e.target.value, attribute);
//               }
//             }}
//             disabled={isDisabled}
//             variant="outlined"
//             fullWidth
//             error={!!hasError}
//             helperText={fieldErrors[fieldName] || ""}
//             sx={{
//               "& .MuiOutlinedInput-root": {
//                 borderRadius: "8px",
//                 ...(isTargetAttribute && {
//                   backgroundColor: isTargetAttributeFor1003
//                     ? "rgba(200, 200, 200, 0.3)"
//                     : "rgba(255, 235, 238, 0.5)",
//                 }),
//               },
//             }}
//           />
//         );
//     }
//   };

//   const renderModalFields = () => {
//     if (!effectiveDataSource?.entityId?.attributes) {
//       return <Typography>No attributes available to display.</Typography>;
//     }
//     const firstColumnAttributes =
//       effectiveDataSource.entityId.attributes.filter(
//         (_, index) => index % 2 === 0
//       );
//     const secondColumnAttributes =
//       effectiveDataSource.entityId.attributes.filter(
//         (_, index) => index % 2 === 1
//       );
//     return (
//       <>
//         <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
//           {firstColumnAttributes.map(renderAttributeField)}
//         </Box>
//         <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
//           {secondColumnAttributes.map(renderAttributeField)}
//         </Box>
//       </>
//     );
//   };

//   return (
//     <>
//       {openModal && (
//         <Box
//           sx={{
//             position: "fixed",
//             top: 0,
//             left: 0,
//             width: "100%",
//             height: "100%",
//             backgroundColor: "rgba(0, 0, 0, 0.5)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             zIndex: 1300,
//           }}
//           onClick={handleCancel}
//         >
//           <Box
//             sx={{
//               backgroundColor: STYLE_GUIDE?.COLORS?.white || "#ffffff",
//               borderRadius: "8px",
//               boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
//               p: 3,
//               width: "900px",
//               maxWidth: "90%",
//               maxHeight: "80vh",
//               overflowY: "auto",
//             }}
//             onClick={(e) => e.stopPropagation()}
//           >
//             <Box
//               sx={{
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//                 mb: 2,
//               }}
//             >
//               <Typography
//                 variant="h6"
//                 sx={{ color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5" }}
//               >
//                 Validation Error
//               </Typography>
//               <IconButton
//                 onClick={handleCancel}
//                 sx={{
//                   color: STYLE_GUIDE?.COLORS?.textSecondary || "#666",
//                 }}
//               >
//                 <Tooltip title="Close">
//                   <CloseIcon />
//                 </Tooltip>
//               </IconButton>
//             </Box>
//             <Box
//               sx={{
//                 display: "grid",
//                 gridTemplateColumns: "1fr 1fr",
//                 gap: 2,
//               }}
//             >
//               {renderModalFields()}
//             </Box>
//             <Box
//               sx={{
//                 display: "flex",
//                 justifyContent: "flex-end",
//                 gap: 1,
//                 mt: 3,
//               }}
//             >
//               <Button
//                 variant="outlined"
//                 onClick={handleCancel}
//                 sx={{
//                   borderRadius: "8px",
//                   borderColor: STYLE_GUIDE?.COLORS?.divider || "#e0e0e0",
//                   color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
//                 }}
//               >
//                 Cancel
//               </Button>
//               <Button
//                 variant="contained"
//                 onClick={handleSaveClick}
//                 sx={{
//                   borderRadius: "8px",
//                   backgroundColor:
//                     STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
//                   color: STYLE_GUIDE?.COLORS?.white || "#ffffff",
//                   "&:hover": {
//                     backgroundColor: STYLE_GUIDE?.COLORS?.primary || "#5c6bc0",
//                   },
//                 }}
//               >
//                 Save
//               </Button>
//             </Box>
//           </Box>
//         </Box>
//       )}
//     </>
//   );
// };

import * as React from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Chip,
  FormControlLabel,
  Checkbox,
  Autocomplete,
  Tooltip,
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

interface ValidationErrorModalProps {
  openModal: boolean;
  rowData: any;
  currentDataSource: any;
  attributeListData: any[];
  handleCloseModal: () => void;
  refreshData: () => void;
  rowDetailData?: any;
}

export const ValidationErrorModal: React.FC<ValidationErrorModalProps> = ({
  openModal,
  rowData,
  currentDataSource,
  attributeListData,
  handleCloseModal,
  refreshData,
  rowDetailData,
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

  // Handle exceptional cases for error codes "1003" and "1002"
  React.useEffect(() => {
    if (openModal) {
      setMatchedDataSource(null);
      setTargetAttribute(null);
      // Handle error code 1003
      if (errorCode === "1003" && refDataSourceId) {
        const matched = commonDataSourceList?.find(
          (ds) => ds._id === refDataSourceId
        );
        if (matched) {
          setMatchedDataSource(matched);
          // Find the target attribute in the matched data source
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
      if ((errorCode === "1002" || errorCode === "1001" || errorCode === '1004') && dataSourceId) {
        const matched = commonDataSourceList?.find(
          (ds) => ds._id === dataSourceId
        );
        if (matched) {
          setMatchedDataSource(matched);
          // Find the target attribute in the matched data source
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
    }
  }, [
    openModal,
    errorCode,
    refDataSourceId,
    refAttributeId,
    dataSourceId,
    commonDataSourceList,
  ]);

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
    if (rowData && openModal && effectiveDataSource?.entityId?.attributes) {
      const initialFormData: Record<string, any> = {};

      // For error code 1002, get rowData from rowDetailData if available
      let sourceData = rowData;
      if ((errorCode === "1002" || errorCode === "1001" || errorCode === "1004") && rowDetailData) {
        sourceData = rowDetailData?.rowData || rowData;
      }

      effectiveDataSource.entityId.attributes.forEach((attribute: any) => {
        const fieldName = attribute.name;
        let fieldValue = sourceData[fieldName];

        // Special handling for error code "1003" with refAttributeId
        if (
          errorCode === "1003" &&
          refAttributeId &&
          attribute._id === refAttributeId
        ) {
          fieldValue = rowData.fileAttributeValue;
        }

        if (
          (attribute.type === "date" || attribute.type === "date-range") &&
          fieldValue
        ) {
          const isoDate = safeDateToISOString(fieldValue);
          console.log(
            `Converted date for field ${fieldName}:`,
            isoDate,
            fieldValue
          );
          initialFormData[fieldName] = isoDate || "";
        } else if (attribute.type === "boolean") {
          initialFormData[fieldName] =
            fieldValue === "true" || fieldValue === true;
        } else if (attribute.type === "multioption" && fieldValue) {
          // Use the normalizeMultiOptionValue function
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

      setFormData(initialFormData);
    }
  }, [
    rowData,
    rowDetailData,
    effectiveDataSource,
    openModal,
    errorCode,
    refAttributeId,
  ]);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidNumber = (value: string) => {
    const numberRegex = /^[0-9]*$/;
    return numberRegex.test(value);
  };

  // Build the rowData payload for both error codes
  // const buildRowDataPayload = () => {
  //   const rowDataPayload: Record<string, any> = {};
  //   effectiveDataSource?.entityId?.attributes.forEach((attribute: any) => {
  //     const fieldName = attribute.name;
  //     const value = formData[fieldName];

  //     if (value !== undefined && value !== null && value !== "") {
  //       if (
  //         (attribute.type === "date" || attribute.type === "date-range") &&
  //         value
  //       ) {
  //         const isoDate = safeDateToISOString(value);
  //         if (isoDate) {
  //           rowDataPayload[fieldName] = isoDate;
  //         }
  //       } else if (attribute.type === "boolean") {
  //         rowDataPayload[fieldName] = value ? "true" : "false";
  //       } else if (attribute.type === "multioption") {
  //         // Already stored as array of IDs
  //         rowDataPayload[fieldName] = value;
  //       } else {
  //         rowDataPayload[fieldName] = value;
  //       }
  //     }
  //   });
  //   return rowDataPayload;
  // };

  // Build the rowData payload for both error codes
  // const buildRowDataPayload = () => {
  //   const rowDataPayload: Record<string, any> = {};
  //   effectiveDataSource?.entityId?.attributes.forEach((attribute: any) => {
  //     const fieldName = attribute.name;
  //     const value = formData[fieldName];

  //     if (value !== undefined && value !== null && value !== "") {
  //       if (
  //         (attribute.type === "date" || attribute.type === "date-range") &&
  //         value
  //       ) {
  //         const isoDate = safeDateToISOString(value);
  //         if (isoDate) {
  //           rowDataPayload[fieldName] = isoDate;
  //         }
  //       } else if (attribute.type === "boolean") {
  //         rowDataPayload[fieldName] = value ? "true" : "false";
  //       } else if (attribute.type === "multioption") {
  //         // Convert array of IDs to pipe-separated string
  //         rowDataPayload[fieldName] = Array.isArray(value) ? value.join("|") : value;
  //       } else {
  //         rowDataPayload[fieldName] = value;
  //       }
  //     }
  //   });
  //   return rowDataPayload;
  // };

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
          let sourceData = rowData;
          if ((errorCode === "1002" || errorCode === "1004") && rowDetailData) {
            sourceData = rowDetailData?.rowData || rowData;
          }

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
    if (errorCode === "1003") {
      return {
        errorDataSourceVersionId: rowData.dataSourceVersionId,
        dataSourceId: rowData.refDataSourceId,
        rowData: rowDataPayload,
        isErrorResolved: true,
        errorDataSourceId: rowData.dataSourceId,
        fileAttributeValue: rowData.fileAttributeValue,
        attributeName: rowData.attributeName,
      };
    } else if (errorCode === "1002" || errorCode === "1004") {
      return {
        action: "update",
        rowData: rowDataPayload,
        rowNumber: rowData.rowNumber,
        dataSourceVersionId: rowData.dataSourceVersionId,
        dataSourceId: rowData.dataSourceId,
        attributeType: rowData.attributeType,
        fileAttributeValue: rowData.fileAttributeValue,
        attributeName: rowData.attributeName,
      };
    } else if (errorCode === "1001") {
      return {
        action: "update",
        rowData: rowDataPayload,
        rowNumber: rowData.rowNumber,
        dataSourceVersionId: rowData.dataSourceVersionId,
        dataSourceId: rowData.dataSourceId,
        attributeType: rowData.attributeType,
        fileAttributeValue: rowData.fileAttributeValue,
        attributeName: rowData.attributeName,
      };
    }
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
      if (errorCode === "1003") {
        await updateVersionRow.mutateAsync({
          url: `${POST.CREATE_VERSION_ROW}`,
          payload,
        });
      } else {
        await updateVersionRow.mutateAsync({
          url: `${POST.RESOLVE_DATA_IMPORT_ERROR}`,
          payload,
        });
      }
      toast.success("Record updated successfully!");
      refreshData();
      handleCloseModal();
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

  const renderAttributeField = (attribute: any) => {
    const fieldName = attribute.name;
    const fieldLabel = attribute.label;
    const fieldType = attribute.type;
    const fieldValue = formData[fieldName];
    const hasError = fieldErrors[fieldName];
    const isRequired = attribute.required;
    const options = attributeOptions[attribute.optionAttributeId] || [];

    // Check if this is the target attribute for error codes 1003 or 1002
    const isTargetAttributeFor1003 =
      errorCode === "1003" &&
      refAttributeId &&
      attribute._id === refAttributeId;

    const isTargetAttributeFor1002 =
      (errorCode === "1002" || errorCode === "1004") &&
      refAttributeId &&
      attribute._id === refAttributeId;

    const isTargetAttributeFor1001 =
      errorCode === "1001" &&
      refAttributeId &&
      attribute._id === refAttributeId;

    // Disable the field only for error code 1003 target attribute
    const isDisabled = isTargetAttributeFor1003;

    // Highlight for both 1003 and 1002
    const isTargetAttribute =
      isTargetAttributeFor1003 ||
      isTargetAttributeFor1002 ||
      isTargetAttributeFor1001;

    const renderLabel = (label: string) => (
      <React.Fragment>
        {label}
        {isRequired && (
          <Typography
            component="span"
            sx={{ color: STYLE_GUIDE?.COLORS?.primaryDark }}
          >
            {" *"}
          </Typography>
        )}
        {isTargetAttributeFor1003 && (
          <Typography
            component="span"
            sx={{
              color: STYLE_GUIDE?.COLORS?.primaryDark,
              fontWeight: "bold",
              ml: 1,
            }}
          >
            (Error Field - Disabled)
          </Typography>
        )}
        {(isTargetAttributeFor1002 || isTargetAttributeFor1001) && (
          <Typography
            component="span"
            sx={{
              color: STYLE_GUIDE?.COLORS?.primaryDark,
              fontWeight: "bold",
              ml: 1,
            }}
          >
            (Error Field)
          </Typography>
        )}
      </React.Fragment>
    );

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
                sx={{
                  color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
                }}
              />
            }
            label={renderLabel(fieldLabel)}
            sx={{
              mb: 1,
              ...(isTargetAttribute && {
                backgroundColor: isTargetAttributeFor1003
                  ? "rgba(200, 200, 200, 0.3)"
                  : "rgba(255, 235, 238, 0.5)",
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
            sx={{ height: "56px" }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={renderLabel(fieldLabel)}
                variant="outlined"
                fullWidth
                error={!!hasError}
                helperText={fieldErrors[fieldName] || ""}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    ...(isTargetAttribute && {
                      backgroundColor: isTargetAttributeFor1003
                        ? "rgba(200, 200, 200, 0.3)"
                        : "rgba(255, 235, 238, 0.5)",
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
            sx={{ height: "56px" }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={renderLabel(fieldLabel)}
                variant="outlined"
                fullWidth
                error={!!hasError}
                helperText={fieldErrors[fieldName] || ""}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    ...(isTargetAttribute && {
                      backgroundColor: isTargetAttributeFor1003
                        ? "rgba(200, 200, 200, 0.3)"
                        : "rgba(255, 235, 238, 0.5)",
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
                  error: !!hasError,
                  helperText: fieldErrors[fieldName] || "",
                  sx: {
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      ...(isTargetAttribute && {
                        backgroundColor: isTargetAttributeFor1003
                          ? "rgba(200, 200, 200, 0.3)"
                          : "rgba(255, 235, 238, 0.5)",
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
            value={fieldValue || ""}
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
            error={!!hasError}
            helperText={fieldErrors[fieldName] || ""}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                ...(isTargetAttribute && {
                  backgroundColor: isTargetAttributeFor1003
                    ? "rgba(200, 200, 200, 0.3)"
                    : "rgba(255, 235, 238, 0.5)",
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
            error={!!hasError}
            helperText={fieldErrors[fieldName] || ""}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                ...(isTargetAttribute && {
                  backgroundColor: isTargetAttributeFor1003
                    ? "rgba(200, 200, 200, 0.3)"
                    : "rgba(255, 235, 238, 0.5)",
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
            error={!!hasError}
            helperText={fieldErrors[fieldName] || ""}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                ...(isTargetAttribute && {
                  backgroundColor: isTargetAttributeFor1003
                    ? "rgba(200, 200, 200, 0.3)"
                    : "rgba(255, 235, 238, 0.5)",
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
    const firstColumnAttributes =
      effectiveDataSource.entityId.attributes.filter(
        (_, index) => index % 2 === 0
      );
    const secondColumnAttributes =
      effectiveDataSource.entityId.attributes.filter(
        (_, index) => index % 2 === 1
      );
    return (
      <>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {firstColumnAttributes.map(renderAttributeField)}
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {secondColumnAttributes.map(renderAttributeField)}
        </Box>
      </>
    );
  };

  return (
    <DialogContainer
      open={openModal}
      onClose={handleCloseModal}
      maxWidth={"md"}
      title={rowDetailData?.errorAction}
      actions={
        <Button
          variant="contained"
          onClick={handleSaveClick}
          sx={{
            borderRadius: "8px",
            backgroundColor: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
            color: STYLE_GUIDE?.COLORS?.white || "#ffffff",
            "&:hover": {
              backgroundColor: STYLE_GUIDE?.COLORS?.primary || "#5c6bc0",
            },
          }}
        >
          Save
        </Button>
      }
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 2,
        }}
      >
        {renderModalFields()}
      </Box>
    </DialogContainer>
  );

  return (
    <>
      {openModal && (
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
          onClick={handleCancel}
        >
          <Box
            sx={{
              backgroundColor: STYLE_GUIDE?.COLORS?.white || "#ffffff",
              borderRadius: "8px",
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
              p: 3,
              width: "900px",
              maxWidth: "90%",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
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
              <IconButton
                onClick={handleCancel}
                sx={{
                  color: STYLE_GUIDE?.COLORS?.textSecondary || "#666",
                }}
              >
                <Tooltip title="Close">
                  <CloseIcon />
                </Tooltip>
              </IconButton>
            </Box>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 2,
              }}
            >
              {renderModalFields()}
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 1,
                mt: 3,
              }}
            >
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
              <Button
                variant="contained"
                onClick={handleSaveClick}
                sx={{
                  borderRadius: "8px",
                  backgroundColor:
                    STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
                  color: STYLE_GUIDE?.COLORS?.white || "#ffffff",
                  "&:hover": {
                    backgroundColor: STYLE_GUIDE?.COLORS?.primary || "#5c6bc0",
                  },
                }}
              >
                Save
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
};

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
// }

// export const ValidationErrorModal: React.FC<ValidationErrorModalProps> = ({
//   openModal,
//   rowData,
//   currentDataSource,
//   attributeListData,
//   handleCloseModal,
//   refreshData,
// }) => {
//   const [formData, setFormData] = React.useState<Record<string, any>>({});
//   const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>(
//     {}
//   );
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
//   const refAttributeId = rowData?.refAttributeId || ""; // Added this line

//   const updateVersionRow = usePost(["updateVersionRow"]);
//   console.log("currentDataSource with rowData:", currentDataSource);
//   // Handle exceptional case for errorCode "1003"
//   React.useEffect(() => {
//     if (openModal) {
//       setMatchedDataSource(null);
//       setTargetAttribute(null);

//       if (errorCode === "1003" && refDataSourceId) {
//         const matched = commonDataSourceList?.find(
//           (ds) => ds._id === refDataSourceId
//         );

//         if (matched) {
//           console.log("Matched data source for errorCode 1003:", matched);
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
//     commonDataSourceList,
//   ]);

//   // Use effectiveDataSource that prioritizes matchedDataSource for errorCode "1003"
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

//   // Initialize form data when modal opens or row data changes
//   React.useEffect(() => {
//     if (rowData && openModal && effectiveDataSource?.entityId?.attributes) {
//       const initialFormData: Record<string, any> = {};

//       effectiveDataSource.entityId.attributes.forEach((attribute: any) => {
//         const fieldName = attribute.name;
//         let fieldValue = rowData[fieldName];

//         // Special handling for errorCode "1003" with refAttributeId
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

//         if (attribute.type === "date" && fieldValue) {
//           initialFormData[fieldName] = dayjs(fieldValue).toISOString();
//         } else if (attribute.type === "boolean") {
//           initialFormData[fieldName] =
//             fieldValue === "true" || fieldValue === true;
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
//   }, [rowData, effectiveDataSource, openModal, errorCode, refAttributeId]);

//   const isValidEmail = (email: string) => {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailRegex.test(email);
//   };

//   const isValidNumber = (value: string) => {
//     const numberRegex = /^[0-9]*$/;
//     return numberRegex.test(value);
//   };

//   const convertToPayload = () => {
//     const rowDataPayload: Record<string, any> = {};
//     effectiveDataSource?.entityId?.attributes.forEach((attribute: any) => {
//       const fieldName = attribute.name;
//       const value = formData[fieldName];
//       if (value !== undefined && value !== null && value !== "") {
//         if (attribute.type === "date" && value) {
//           rowDataPayload[fieldName] = dayjs(value).toISOString();
//         } else if (attribute.type === "boolean") {
//           rowDataPayload[fieldName] = value ? "true" : "false";
//         } else {
//           rowDataPayload[fieldName] = value;
//         }
//       }
//     });
//     return {
//       errorDataSourceVersionId: rowData.dataSourceVersionId,
//       dataSourceId: rowData.refDataSourceId,
//       rowData: rowDataPayload,
//       isErrorResolved: true,
//       errorDataSourceId: rowData.dataSourceId,
//       fileAttributeValue: rowData.fileAttributeValue,
//       attributeName: rowData.attributeName,
//     };
//   };

//   const validateField = (fieldName: string, value: any, attribute: any) => {
//     const errors = { ...fieldErrors };
//     if (attribute.required) {
//       if (
//         value === undefined ||
//         value === null ||
//         value === "" ||
//         (Array.isArray(value) && value.length === 0) ||
//         (typeof value === "string" && value.trim() === "")
//       ) {
//         errors[fieldName] = `${attribute.name} is required`;
//       } else {
//         delete errors[fieldName];
//       }
//     }
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
//         delete errors[fieldName];
//       } else if (
//         attribute.type === "number" &&
//         isValidNumber(value) &&
//         errors[fieldName]?.includes("number")
//       ) {
//         delete errors[fieldName];
//       }
//     }
//     setFieldErrors(errors);
//   };

//   const handleSaveClick = async () => {
//     try {
//       setSubmitAttempted(true);
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
//       // const payload = convertToPayload();
//       if (errorCode === "1003" && refAttributeId) {
//         const payload = convertToPayload();
//         console.log("Update payload:", payload);
//         await updateVersionRow.mutateAsync({
//           url: `${POST.CREATE_VERSION_ROW}`,
//           payload,
//         });
//         toast.success("Record updated successfully!");
//         refreshData();
//         handleCloseModal();
//       }
//       else{
//         // const payload =
//       }
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
//     if (submitAttempted) {
//       validateField(fieldName, value, attribute);
//     }
//   };

//   const renderAttributeField = (attribute: any) => {
//     const fieldName = attribute.name;
//     const fieldLabel = attribute.name;
//     const fieldType = attribute.type;
//     const fieldValue = formData[fieldName];
//     const hasError = fieldErrors[fieldName];
//     const isRequired = attribute.required;
//     const options = attributeOptions[attribute.optionAttributeId] || [];

//     // Highlight the target attribute for errorCode "1003"
//     const isTargetAttribute =
//       errorCode === "1003" &&
//       refAttributeId &&
//       attribute._id === refAttributeId;

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
//         {isTargetAttribute && (
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
//                   handleFieldChange(fieldName, e.target.checked, attribute)
//                 }
//                 sx={{
//                   color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
//                 }}
//               />
//             }
//             label={renderLabel(fieldLabel)}
//             sx={{
//               mb: 1,
//               ...(isTargetAttribute && {
//                 backgroundColor: "rgba(255, 235, 238, 0.5)",
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
//               if (typeof value === "string") {
//                 handleFieldChange(fieldName, value, attribute);
//               } else if (value && value.id) {
//                 handleFieldChange(fieldName, value.id, attribute);
//               } else {
//                 handleFieldChange(fieldName, "", attribute);
//               }
//             }}
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
//                       backgroundColor: "rgba(255, 235, 238, 0.5)",
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
//                   onDelete={() => {
//                     handleFieldChange(fieldName, "", attribute);
//                   }}
//                 />
//               );
//             }}
//           />
//         );
//       case "multioption":
//         const multioptionOptions = getOptionsForAttribute(
//           attribute.optionAttributeId
//         );
//         const selectedValues = fieldValue
//           ? fieldValue.split(",").map((val: string) => val.trim())
//           : [];
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
//               const values = value.map((item) => {
//                 if (typeof item === "string") {
//                   return item;
//                 }
//                 return item.id;
//               });
//               handleFieldChange(fieldName, values.join(","), attribute);
//             }}
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
//                       backgroundColor: "rgba(255, 235, 238, 0.5)",
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
//                   key={typeof option === "string" ? option : option.id}
//                   label={typeof option === "string" ? option : option.label}
//                   {...getTagProps({ index })}
//                   size="small"
//                 />
//               ))
//             }
//           />
//         );
//       case "date":
//         return (
//           <LocalizationProvider key={fieldName} dateAdapter={AdapterDayjs}>
//             <DatePicker
//               label={renderLabel(fieldLabel)}
//               value={fieldValue ? dayjs(fieldValue) : null}
//               onChange={(date) =>
//                 handleFieldChange(
//                   fieldName,
//                   date ? date.toISOString() : "",
//                   attribute
//                 )
//               }
//               format="DD/MM/YYYY"
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
//                         backgroundColor: "rgba(255, 235, 238, 0.5)",
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
//               const value = e.target.value;
//               if (value === "" || isValidNumber(value)) {
//                 handleFieldChange(fieldName, value, attribute);
//               }
//             }}
//             variant="outlined"
//             fullWidth
//             error={!!hasError}
//             helperText={fieldErrors[fieldName] || ""}
//             sx={{
//               "& .MuiOutlinedInput-root": {
//                 borderRadius: "8px",
//                 ...(isTargetAttribute && {
//                   backgroundColor: "rgba(255, 235, 238, 0.5)",
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
//             onChange={(e) =>
//               handleFieldChange(fieldName, e.target.value, attribute)
//             }
//             variant="outlined"
//             fullWidth
//             error={!!hasError}
//             helperText={fieldErrors[fieldName] || ""}
//             sx={{
//               "& .MuiOutlinedInput-root": {
//                 borderRadius: "8px",
//                 ...(isTargetAttribute && {
//                   backgroundColor: "rgba(255, 235, 238, 0.5)",
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
//             onChange={(e) =>
//               handleFieldChange(fieldName, e.target.value, attribute)
//             }
//             variant="outlined"
//             fullWidth
//             error={!!hasError}
//             helperText={fieldErrors[fieldName] || ""}
//             sx={{
//               "& .MuiOutlinedInput-root": {
//                 borderRadius: "8px",
//                 ...(isTargetAttribute && {
//                   backgroundColor: "rgba(255, 235, 238, 0.5)",
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
//                 Edit Validation Error
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

//             {effectiveDataSource && (
//               <Box
//                 sx={{
//                   mb: 2,
//                   p: 2,
//                   backgroundColor:
//                     STYLE_GUIDE?.COLORS?.backgroundLight || "#f5f5f5",
//                   borderRadius: "8px",
//                 }}
//               >
//                 <Typography
//                   variant="subtitle1"
//                   sx={{ fontWeight: "bold", mb: 1 }}
//                 >
//                   Data Source Information
//                 </Typography>
//                 <Typography variant="body2">
//                   <strong>Name:</strong> {effectiveDataSource.name}
//                 </Typography>
//                 <Typography variant="body2">
//                   <strong>ID:</strong> {effectiveDataSource._id}
//                 </Typography>
//                 {matchedDataSource && (
//                   <>
//                     <Typography
//                       variant="body2"
//                       sx={{
//                         color: STYLE_GUIDE?.COLORS?.primaryDark,
//                         mt: 1,
//                         fontStyle: "italic",
//                       }}
//                     >
//                       <strong>Note:</strong> Using reference data source for
//                       error code 1003
//                     </Typography>
//                     {targetAttribute && (
//                       <Typography
//                         variant="body2"
//                         sx={{
//                           color: STYLE_GUIDE?.COLORS?.primaryDark,
//                           fontStyle: "italic",
//                         }}
//                       >
//                         <strong>Target Attribute:</strong>{" "}
//                         {targetAttribute.name} (ID: {targetAttribute._id})
//                       </Typography>
//                     )}
//                     {rowData.fileAttributeValue && (
//                       <Typography
//                         variant="body2"
//                         sx={{
//                           color: STYLE_GUIDE?.COLORS?.primaryDark,
//                           fontStyle: "italic",
//                         }}
//                       >
//                         <strong>File Attribute Value:</strong>{" "}
//                         {rowData.fileAttributeValue}
//                       </Typography>
//                     )}
//                   </>
//                 )}
//               </Box>
//             )}

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
// }

// export const ValidationErrorModal: React.FC<ValidationErrorModalProps> = ({
//   openModal,
//   rowData,
//   currentDataSource,
//   attributeListData,
//   handleCloseModal,
//   refreshData,
// }) => {
//   const [formData, setFormData] = React.useState<Record<string, any>>({});
//   const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>(
//     {}
//   );
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

//   const updateVersionRow = usePost(["updateVersionRow"]);

//   console.log("currentDataSource with rowData:", currentDataSource);

//   // Handle exceptional case for errorCode "1003"
//   React.useEffect(() => {
//     if (openModal) {
//       setMatchedDataSource(null);
//       setTargetAttribute(null);
//       if (errorCode === "1003" && refDataSourceId) {
//         const matched = commonDataSourceList?.find(
//           (ds) => ds._id === refDataSourceId
//         );
//         if (matched) {
//           console.log("Matched data source for errorCode 1003:", matched);
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
//     commonDataSourceList,
//   ]);

//   // Use effectiveDataSource that prioritizes matchedDataSource for errorCode "1003"
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

//   // Initialize form data when modal opens or row data changes
//   React.useEffect(() => {
//     if (rowData && openModal && effectiveDataSource?.entityId?.attributes) {
//       const initialFormData: Record<string, any> = {};
//       effectiveDataSource.entityId.attributes.forEach((attribute: any) => {
//         const fieldName = attribute.name;
//         let fieldValue = rowData[fieldName];
//         // Special handling for errorCode "1003" with refAttributeId
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
//         if (attribute.type === "date" && fieldValue) {
//           initialFormData[fieldName] = dayjs(fieldValue).toISOString();
//         } else if (attribute.type === "boolean") {
//           initialFormData[fieldName] =
//             fieldValue === "true" || fieldValue === true;
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
//   }, [rowData, effectiveDataSource, openModal, errorCode, refAttributeId]);

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
//         if (attribute.type === "date" && value) {
//           rowDataPayload[fieldName] = dayjs(value).toISOString();
//         } else if (attribute.type === "boolean") {
//           rowDataPayload[fieldName] = value ? "true" : "false";
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
//     } else if (errorCode === "1001") {
//       console.log("Building payload for error code 1001",rowDataPayload);
//       // return {
//       //   action: "update",
//       //   // dataSourceVersionId: rowData.dataSourceVersionId,
//       //   // dataSourceId: rowData.dataSourceId,
//       //   // rowNumber: rowData.rowNumber,
//       //   // rowData: rowDataPayload,
//       // };
//     }

//     // // Default payload for other error codes
//     // return {
//     //   action: "update",
//     //   dataSourceVersionId: rowData.dataSourceVersionId,
//     //   dataSourceId: rowData.dataSourceId,
//     //   rowNumber: rowData.rowNumber,
//     //   rowData: rowDataPayload,
//     // };
//   };

//   const validateField = (fieldName: string, value: any, attribute: any) => {
//     const errors = { ...fieldErrors };
//     if (attribute.required) {
//       if (
//         value === undefined ||
//         value === null ||
//         value === "" ||
//         (Array.isArray(value) && value.length === 0) ||
//         (typeof value === "string" && value.trim() === "")
//       ) {
//         errors[fieldName] = `${attribute.name} is required`;
//       } else {
//         delete errors[fieldName];
//       }
//     }
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
//         delete errors[fieldName];
//       } else if (
//         attribute.type === "number" &&
//         isValidNumber(value) &&
//         errors[fieldName]?.includes("number")
//       ) {
//         delete errors[fieldName];
//       }
//     }
//     setFieldErrors(errors);
//   };

//   const handleSaveClick = async () => {
//     try {
//       setSubmitAttempted(true);
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

//       await updateVersionRow.mutateAsync({
//         url: `${POST.CREATE_VERSION_ROW}`,
//         payload,
//       });

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
//     if (submitAttempted) {
//       validateField(fieldName, value, attribute);
//     }
//   };

//   const renderAttributeField = (attribute: any) => {
//     const fieldName = attribute.name;
//     const fieldLabel = attribute.name;
//     const fieldType = attribute.type;
//     const fieldValue = formData[fieldName];
//     const hasError = fieldErrors[fieldName];
//     const isRequired = attribute.required;
//     const options = attributeOptions[attribute.optionAttributeId] || [];

//     // Highlight the target attribute for errorCode "1003"
//     const isTargetAttribute =
//       errorCode === "1003" &&
//       refAttributeId &&
//       attribute._id === refAttributeId;

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
//         {isTargetAttribute && (
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
//                   handleFieldChange(fieldName, e.target.checked, attribute)
//                 }
//                 sx={{
//                   color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
//                 }}
//               />
//             }
//             label={renderLabel(fieldLabel)}
//             sx={{
//               mb: 1,
//               ...(isTargetAttribute && {
//                 backgroundColor: "rgba(255, 235, 238, 0.5)",
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
//               if (typeof value === "string") {
//                 handleFieldChange(fieldName, value, attribute);
//               } else if (value && value.id) {
//                 handleFieldChange(fieldName, value.id, attribute);
//               } else {
//                 handleFieldChange(fieldName, "", attribute);
//               }
//             }}
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
//                       backgroundColor: "rgba(255, 235, 238, 0.5)",
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
//                   onDelete={() => {
//                     handleFieldChange(fieldName, "", attribute);
//                   }}
//                 />
//               );
//             }}
//           />
//         );
//       case "multioption":
//         const multioptionOptions = getOptionsForAttribute(
//           attribute.optionAttributeId
//         );
//         const selectedValues = fieldValue
//           ? fieldValue.split(",").map((val: string) => val.trim())
//           : [];
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
//               const values = value.map((item) => {
//                 if (typeof item === "string") {
//                   return item;
//                 }
//                 return item.id;
//               });
//               handleFieldChange(fieldName, values.join(","), attribute);
//             }}
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
//                       backgroundColor: "rgba(255, 235, 238, 0.5)",
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
//                   key={typeof option === "string" ? option : option.id}
//                   label={typeof option === "string" ? option : option.label}
//                   {...getTagProps({ index })}
//                   size="small"
//                 />
//               ))
//             }
//           />
//         );
//       case "date":
//         return (
//           <LocalizationProvider key={fieldName} dateAdapter={AdapterDayjs}>
//             <DatePicker
//               label={renderLabel(fieldLabel)}
//               value={fieldValue ? dayjs(fieldValue) : null}
//               onChange={(date) =>
//                 handleFieldChange(
//                   fieldName,
//                   date ? date.toISOString() : "",
//                   attribute
//                 )
//               }
//               format="DD/MM/YYYY"
//               slotProps={{
//                 textField: {
//                   variant: "outlined",
//                   fullWidth: true,
//                   error: !!hasError,
//                   helperText:fieldErrors[fieldName] || "",
//                   sx: {
//                     "& .MuiOutlinedInput-root": {
//                       borderRadius: "8px",
//                       ...(isTargetAttribute && {
//                         backgroundColor: "rgba(255, 235, 238, 0.5)",
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
//               const value = e.target.value;
//               if (value === "" || isValidNumber(value)) {
//                 handleFieldChange(fieldName, value, attribute);
//               }
//             }}
//             variant="outlined"
//             fullWidth
//             error={!!hasError}
//             helperText={fieldErrors[fieldName] || ""}
//             sx={{
//               "& .MuiOutlinedInput-root": {
//                 borderRadius: "8px",
//                 ...(isTargetAttribute && {
//                   backgroundColor: "rgba(255, 235, 238, 0.5)",
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
//             onChange={(e) =>
//               handleFieldChange(fieldName, e.target.value, attribute)
//             }
//             variant="outlined"
//             fullWidth
//             error={!!hasError}
//             helperText={fieldErrors[fieldName] || ""}
//             sx={{
//               "& .MuiOutlinedInput-root": {
//                 borderRadius: "8px",
//                 ...(isTargetAttribute && {
//                   backgroundColor: "rgba(255, 235, 238, 0.5)",
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
//             onChange={(e) =>
//               handleFieldChange(fieldName, e.target.value, attribute)
//             }
//             variant="outlined"
//             fullWidth
//             error={!!hasError}
//             helperText={fieldErrors[fieldName] || ""}
//             sx={{
//               "& .MuiOutlinedInput-root": {
//                 borderRadius: "8px",
//                 ...(isTargetAttribute && {
//                   backgroundColor: "rgba(255, 235, 238, 0.5)",
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
//                 Edit Validation Error
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
//             {effectiveDataSource && (
//               <Box
//                 sx={{
//                   mb: 2,
//                   p: 2,
//                   backgroundColor:
//                     STYLE_GUIDE?.COLORS?.backgroundLight || "#f5f5f5",
//                   borderRadius: "8px",
//                 }}
//               >
//                 <Typography
//                   variant="subtitle1"
//                   sx={{ fontWeight: "bold", mb: 1 }}
//                 >
//                   Data Source Information
//                 </Typography>
//                 <Typography variant="body2">
//                   <strong>Name:</strong> {effectiveDataSource.name}
//                 </Typography>
//                 <Typography variant="body2">
//                   <strong>ID:</strong> {effectiveDataSource._id}
//                 </Typography>
//                 <Typography variant="body2">
//                   <strong>Error Code:</strong> {errorCode}
//                 </Typography>
//                 {matchedDataSource && (
//                   <>
//                     <Typography
//                       variant="body2"
//                       sx={{
//                         color: STYLE_GUIDE?.COLORS?.primaryDark,
//                         mt: 1,
//                         fontStyle: "italic",
//                       }}
//                     >
//                       <strong>Note:</strong> Using reference data source for
//                       error code 1003
//                     </Typography>
//                     {targetAttribute && (
//                       <Typography
//                         variant="body2"
//                         sx={{
//                           color: STYLE_GUIDE?.COLORS?.primaryDark,
//                           fontStyle: "italic",
//                         }}
//                       >
//                         <strong>Target Attribute:</strong>{" "}
//                         {targetAttribute.name} (ID: {targetAttribute._id})
//                       </Typography>
//                     )}
//                     {rowData.fileAttributeValue && (
//                       <Typography
//                         variant="body2"
//                         sx={{
//                           color: STYLE_GUIDE?.COLORS?.primaryDark,
//                           fontStyle: "italic",
//                         }}
//                       >
//                         <strong>File Attribute Value:</strong>{" "}
//                         {rowData.fileAttributeValue}
//                       </Typography>
//                     )}
//                   </>
//                 )}
//               </Box>
//             )}
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
// }

// export const ValidationErrorModal: React.FC<ValidationErrorModalProps> = ({
//   openModal,
//   rowData,
//   currentDataSource,
//   attributeListData,
//   handleCloseModal,
//   refreshData,
// }) => {
//   const [formData, setFormData] = React.useState<Record<string, any>>({});
//   const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>(
//     {}
//   );
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

//   const updateVersionRow = usePost(["updateVersionRow"]);

//   console.log("currentDataSource with rowData:", currentDataSource);

//   // Handle exceptional case for errorCode "1003"
//   React.useEffect(() => {
//     if (openModal) {
//       setMatchedDataSource(null);
//       setTargetAttribute(null);
//       if (errorCode === "1003" && refDataSourceId) {
//         const matched = commonDataSourceList?.find(
//           (ds) => ds._id === refDataSourceId
//         );
//         if (matched) {
//           console.log("Matched data source for errorCode 1003:", matched);
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
//     commonDataSourceList,
//   ]);

//   // Use effectiveDataSource that prioritizes matchedDataSource for errorCode "1003"
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

//   // Initialize form data when modal opens or row data changes
//   React.useEffect(() => {
//     if (rowData && openModal && effectiveDataSource?.entityId?.attributes) {
//       const initialFormData: Record<string, any> = {};
//       effectiveDataSource.entityId.attributes.forEach((attribute: any) => {
//         const fieldName = attribute.name;
//         let fieldValue = rowData[fieldName];
//         // Special handling for errorCode "1003" with refAttributeId
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
//         if (attribute.type === "date" && fieldValue) {
//           initialFormData[fieldName] = dayjs(fieldValue).toISOString();
//         } else if (attribute.type === "boolean") {
//           initialFormData[fieldName] =
//             fieldValue === "true" || fieldValue === true;
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
//   }, [rowData, effectiveDataSource, openModal, errorCode, refAttributeId]);

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
//         if (attribute.type === "date" && value) {
//           rowDataPayload[fieldName] = dayjs(value).toISOString();
//         } else if (attribute.type === "boolean") {
//           rowDataPayload[fieldName] = value ? "true" : "false";
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
//     } else if (errorCode === "1001") {
//       console.log("Building payload for error code 1001", rowDataPayload);
//       return {
//         action: "update",

//         rowData: rowDataPayload,
//       };
//     }
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
//     const fieldLabel = attribute.label; // Use label instead of name
//     const fieldType = attribute.type;
//     const fieldValue = formData[fieldName];
//     const hasError = fieldErrors[fieldName];
//     const isRequired = attribute.required;
//     const options = attributeOptions[attribute.optionAttributeId] || [];

//     // Highlight the target attribute for errorCode "1003"
//     const isTargetAttribute =
//       errorCode === "1003" &&
//       refAttributeId &&
//       attribute._id === refAttributeId;

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
//         {isTargetAttribute && (
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
//                   handleFieldChange(fieldName, e.target.checked, attribute)
//                 }
//                 sx={{
//                   color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
//                 }}
//               />
//             }
//             label={renderLabel(fieldLabel)}
//             sx={{
//               mb: 1,
//               ...(isTargetAttribute && {
//                 backgroundColor: "rgba(255, 235, 238, 0.5)",
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
//               if (typeof value === "string") {
//                 handleFieldChange(fieldName, value, attribute);
//               } else if (value && value.id) {
//                 handleFieldChange(fieldName, value.id, attribute);
//               } else {
//                 handleFieldChange(fieldName, "", attribute);
//               }
//             }}
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
//                       backgroundColor: "rgba(255, 235, 238, 0.5)",
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
//                   onDelete={() => {
//                     handleFieldChange(fieldName, "", attribute);
//                   }}
//                 />
//               );
//             }}
//           />
//         );
//       case "multioption":
//         const multioptionOptions = getOptionsForAttribute(
//           attribute.optionAttributeId
//         );
//         const selectedValues = fieldValue
//           ? fieldValue.split(",").map((val: string) => val.trim())
//           : [];
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
//               const values = value.map((item) => {
//                 if (typeof item === "string") {
//                   return item;
//                 }
//                 return item.id;
//               });
//               handleFieldChange(fieldName, values.join(","), attribute);
//             }}
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
//                       backgroundColor: "rgba(255, 235, 238, 0.5)",
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
//                   key={typeof option === "string" ? option : option.id}
//                   label={typeof option === "string" ? option : option.label}
//                   {...getTagProps({ index })}
//                   size="small"
//                 />
//               ))
//             }
//           />
//         );
//       case "date":
//         return (
//           <LocalizationProvider key={fieldName} dateAdapter={AdapterDayjs}>
//             <DatePicker
//               label={renderLabel(fieldLabel)}
//               value={fieldValue ? dayjs(fieldValue) : null}
//               onChange={(date) =>
//                 handleFieldChange(
//                   fieldName,
//                   date ? date.toISOString() : "",
//                   attribute
//                 )
//               }
//               format="DD/MM/YYYY"
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
//                         backgroundColor: "rgba(255, 235, 238, 0.5)",
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
//               const value = e.target.value;
//               if (value === "" || isValidNumber(value)) {
//                 handleFieldChange(fieldName, value, attribute);
//               }
//             }}
//             variant="outlined"
//             fullWidth
//             error={!!hasError}
//             helperText={fieldErrors[fieldName] || ""}
//             sx={{
//               "& .MuiOutlinedInput-root": {
//                 borderRadius: "8px",
//                 ...(isTargetAttribute && {
//                   backgroundColor: "rgba(255, 235, 238, 0.5)",
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
//             onChange={(e) =>
//               handleFieldChange(fieldName, e.target.value, attribute)
//             }
//             variant="outlined"
//             fullWidth
//             error={!!hasError}
//             helperText={fieldErrors[fieldName] || ""}
//             sx={{
//               "& .MuiOutlinedInput-root": {
//                 borderRadius: "8px",
//                 ...(isTargetAttribute && {
//                   backgroundColor: "rgba(255, 235, 238, 0.5)",
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
//             onChange={(e) =>
//               handleFieldChange(fieldName, e.target.value, attribute)
//             }
//             variant="outlined"
//             fullWidth
//             error={!!hasError}
//             helperText={fieldErrors[fieldName] || ""}
//             sx={{
//               "& .MuiOutlinedInput-root": {
//                 borderRadius: "8px",
//                 ...(isTargetAttribute && {
//                   backgroundColor: "rgba(255, 235, 238, 0.5)",
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
//                 Edit Validation Error
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
//             {effectiveDataSource && (
//               <Box
//                 sx={{
//                   mb: 2,
//                   p: 2,
//                   backgroundColor:
//                     STYLE_GUIDE?.COLORS?.backgroundLight || "#f5f5f5",
//                   borderRadius: "8px",
//                 }}
//               >
//                 <Typography
//                   variant="subtitle1"
//                   sx={{ fontWeight: "bold", mb: 1 }}
//                 >
//                   Data Source Information
//                 </Typography>
//                 <Typography variant="body2">
//                   <strong>Name:</strong> {effectiveDataSource.name}
//                 </Typography>
//                 <Typography variant="body2">
//                   <strong>ID:</strong> {effectiveDataSource._id}
//                 </Typography>
//                 <Typography variant="body2">
//                   <strong>Error Code:</strong> {errorCode}
//                 </Typography>
//                 {matchedDataSource && (
//                   <>
//                     <Typography
//                       variant="body2"
//                       sx={{
//                         color: STYLE_GUIDE?.COLORS?.primaryDark,
//                         mt: 1,
//                         fontStyle: "italic",
//                       }}
//                     >
//                       <strong>Note:</strong> Using reference data source for
//                       error code 1003
//                     </Typography>
//                     {targetAttribute && (
//                       <Typography
//                         variant="body2"
//                         sx={{
//                           color: STYLE_GUIDE?.COLORS?.primaryDark,
//                           fontStyle: "italic",
//                         }}
//                       >
//                         <strong>Target Attribute:</strong>{" "}
//                         {targetAttribute.name} (ID: {targetAttribute._id})
//                       </Typography>
//                     )}
//                     {rowData.fileAttributeValue && (
//                       <Typography
//                         variant="body2"
//                         sx={{
//                           color: STYLE_GUIDE?.COLORS?.primaryDark,
//                           fontStyle: "italic",
//                         }}
//                       >
//                         <strong>File Attribute Value:</strong>{" "}
//                         {rowData.fileAttributeValue}
//                       </Typography>
//                     )}
//                   </>
//                 )}
//               </Box>
//             )}
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

//erro code 1002

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
// }

// export const ValidationErrorModal: React.FC<ValidationErrorModalProps> = ({
//   openModal,
//   rowData,
//   currentDataSource,
//   attributeListData,
//   handleCloseModal,
//   refreshData,
// }) => {
//   const [formData, setFormData] = React.useState<Record<string, any>>({});
//   const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>(
//     {}
//   );
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

//   console.log("currentDataSource with rowData:", currentDataSource);

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
//           console.log("Matched data source for errorCode 1003:", matched);
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
//     dataSourceId, // Added dependency
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

//   // Initialize form data when modal opens or row data changes
//   React.useEffect(() => {
//     if (rowData && openModal && effectiveDataSource?.entityId?.attributes) {
//       const initialFormData: Record<string, any> = {};
//       effectiveDataSource.entityId.attributes.forEach((attribute: any) => {
//         const fieldName = attribute.name;
//         let fieldValue = rowData[fieldName];

//         // Special handling for error codes "1003" and "1002" with refAttributeId
//         if (
//           (errorCode === "1003" || errorCode === "1002") &&
//           refAttributeId &&
//           attribute._id === refAttributeId
//         ) {
//           fieldValue = rowData.fileAttributeValue;
//           console.log(
//             `Setting ${fieldName} to fileAttributeValue: ${fieldValue}`
//           );
//         }

//         if (attribute.type === "date" && fieldValue) {
//           initialFormData[fieldName] = dayjs(fieldValue).toISOString();
//         } else if (attribute.type === "boolean") {
//           initialFormData[fieldName] =
//             fieldValue === "true" || fieldValue === true;
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
//   }, [rowData, effectiveDataSource, openModal, errorCode, refAttributeId]);

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
//         if (attribute.type === "date" && value) {
//           rowDataPayload[fieldName] = dayjs(value).toISOString();
//         } else if (attribute.type === "boolean") {
//           rowDataPayload[fieldName] = value ? "true" : "false";
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
//         errorDataSourceVersionId: rowData.dataSourceVersionId,
//         dataSourceId: rowData.dataSourceId, // Using dataSourceId instead of refDataSourceId
//         rowData: rowDataPayload,
//         isErrorResolved: true,
//         errorDataSourceId: rowData.dataSourceId,
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
//     return {
//       action: "update",
//       dataSourceVersionId: rowData.dataSourceVersionId,
//       dataSourceId: rowData.dataSourceId,
//       rowNumber: rowData.rowNumber,
//       rowData: rowDataPayload,
//     };
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
//       if (errorCode === "1003" || errorCode === "1002") {
//         await updateVersionRow.mutateAsync({
//           url: `${POST.CREATE_VERSION_ROW}`,
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
//     const fieldLabel = attribute.label; // Use label instead of name
//     const fieldType = attribute.type;
//     const fieldValue = formData[fieldName];
//     const hasError = fieldErrors[fieldName];
//     const isRequired = attribute.required;
//     const options = attributeOptions[attribute.optionAttributeId] || [];

//     // Highlight the target attribute for error codes "1003" and "1002"
//     const isTargetAttribute =
//       (errorCode === "1003" || errorCode === "1002") &&
//       refAttributeId &&
//       attribute._id === refAttributeId;

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
//         {isTargetAttribute && (
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
//                   handleFieldChange(fieldName, e.target.checked, attribute)
//                 }
//                 sx={{
//                   color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
//                 }}
//               />
//             }
//             label={renderLabel(fieldLabel)}
//             sx={{
//               mb: 1,
//               ...(isTargetAttribute && {
//                 backgroundColor: "rgba(255, 235, 238, 0.5)",
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
//               if (typeof value === "string") {
//                 handleFieldChange(fieldName, value, attribute);
//               } else if (value && value.id) {
//                 handleFieldChange(fieldName, value.id, attribute);
//               } else {
//                 handleFieldChange(fieldName, "", attribute);
//               }
//             }}
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
//                       backgroundColor: "rgba(255, 235, 238, 0.5)",
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
//                   onDelete={() => {
//                     handleFieldChange(fieldName, "", attribute);
//                   }}
//                 />
//               );
//             }}
//           />
//         );
//       case "multioption":
//         const multioptionOptions = getOptionsForAttribute(
//           attribute.optionAttributeId
//         );
//         const selectedValues = fieldValue
//           ? fieldValue.split(",").map((val: string) => val.trim())
//           : [];
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
//               const values = value.map((item) => {
//                 if (typeof item === "string") {
//                   return item;
//                 }
//                 return item.id;
//               });
//               handleFieldChange(fieldName, values.join(","), attribute);
//             }}
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
//                       backgroundColor: "rgba(255, 235, 238, 0.5)",
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
//                   key={typeof option === "string" ? option : option.id}
//                   label={typeof option === "string" ? option : option.label}
//                   {...getTagProps({ index })}
//                   size="small"
//                 />
//               ))
//             }
//           />
//         );
//       case "date":
//         return (
//           <LocalizationProvider key={fieldName} dateAdapter={AdapterDayjs}>
//             <DatePicker
//               label={renderLabel(fieldLabel)}
//               value={fieldValue ? dayjs(fieldValue) : null}
//               onChange={(date) =>
//                 handleFieldChange(
//                   fieldName,
//                   date ? date.toISOString() : "",
//                   attribute
//                 )
//               }
//               format="DD/MM/YYYY"
//               slotProps={{
//                 textField: {
//                   variant: "outlined",
//                   fullWidth: true,
//                   error: !!hasError,
//                   helperText:fieldErrors[fieldName] || "",
//                   sx: {
//                     "& .MuiOutlinedInput-root": {
//                       borderRadius: "8px",
//                       ...(isTargetAttribute && {
//                         backgroundColor: "rgba(255, 235, 238, 0.5)",
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
//               const value = e.target.value;
//               if (value === "" || isValidNumber(value)) {
//                 handleFieldChange(fieldName, value, attribute);
//               }
//             }}
//             variant="outlined"
//             fullWidth
//             error={!!hasError}
//             helperText={fieldErrors[fieldName] || ""}
//             sx={{
//               "& .MuiOutlinedInput-root": {
//                 borderRadius: "8px",
//                 ...(isTargetAttribute && {
//                   backgroundColor: "rgba(255, 235, 238, 0.5)",
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
//             onChange={(e) =>
//               handleFieldChange(fieldName, e.target.value, attribute)
//             }
//             variant="outlined"
//             fullWidth
//             error={!!hasError}
//             helperText={fieldErrors[fieldName] || ""}
//             sx={{
//               "& .MuiOutlinedInput-root": {
//                 borderRadius: "8px",
//                 ...(isTargetAttribute && {
//                   backgroundColor: "rgba(255, 235, 238, 0.5)",
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
//             onChange={(e) =>
//               handleFieldChange(fieldName, e.target.value, attribute)
//             }
//             variant="outlined"
//             fullWidth
//             error={!!hasError}
//             helperText={fieldErrors[fieldName] || ""}
//             sx={{
//               "& .MuiOutlinedInput-root": {
//                 borderRadius: "8px",
//                 ...(isTargetAttribute && {
//                   backgroundColor: "rgba(255, 235, 238, 0.5)",
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
//                 Edit Validation Error
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
//             {effectiveDataSource && (
//               <Box
//                 sx={{
//                   mb: 2,
//                   p: 2,
//                   backgroundColor:
//                     STYLE_GUIDE?.COLORS?.backgroundLight || "#f5f5f5",
//                   borderRadius: "8px",
//                 }}
//               >
//                 <Typography
//                   variant="subtitle1"
//                   sx={{ fontWeight: "bold", mb: 1 }}
//                 >
//                   Data Source Information
//                 </Typography>
//                 <Typography variant="body2">
//                   <strong>Name:</strong> {effectiveDataSource.name}
//                 </Typography>
//                 <Typography variant="body2">
//                   <strong>ID:</strong> {effectiveDataSource._id}
//                 </Typography>
//                 <Typography variant="body2">
//                   <strong>Error Code:</strong> {errorCode}
//                 </Typography>
//                 {matchedDataSource && (
//                   <>
//                     <Typography
//                       variant="body2"
//                       sx={{
//                         color: STYLE_GUIDE?.COLORS?.primaryDark,
//                         mt: 1,
//                         fontStyle: "italic",
//                       }}
//                     >
//                       <strong>Note:</strong> Using reference data source for
//                       error code {errorCode}
//                     </Typography>
//                     {targetAttribute && (
//                       <Typography
//                         variant="body2"
//                         sx={{
//                           color: STYLE_GUIDE?.COLORS?.primaryDark,
//                           fontStyle: "italic",
//                         }}
//                       >
//                         <strong>Target Attribute:</strong>{" "}
//                         {targetAttribute.name} (ID: {targetAttribute._id})
//                       </Typography>
//                     )}
//                     {rowData.fileAttributeValue && (
//                       <Typography
//                         variant="body2"
//                         sx={{
//                           color: STYLE_GUIDE?.COLORS?.primaryDark,
//                           fontStyle: "italic",
//                         }}
//                       >
//                         <strong>File Attribute Value:</strong>{" "}
//                         {rowData.fileAttributeValue}
//                       </Typography>
//                     )}
//                   </>
//                 )}
//               </Box>
//             )}
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

interface ValidationErrorModalProps {
  openModal: boolean;
  rowData: any;
  currentDataSource: any;
  attributeListData: any[];
  handleCloseModal: () => void;
  refreshData: () => void;
}

export const ValidationErrorModal: React.FC<ValidationErrorModalProps> = ({
  openModal,
  rowData,
  currentDataSource,
  attributeListData,
  handleCloseModal,
  refreshData,
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
  const dataSourceId = rowData?.dataSourceId || ""; // Added for error code 1002

  const updateVersionRow = usePost(["updateVersionRow"]);
  console.log("currentDataSource with rowData:", currentDataSource);

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
          console.log("Matched data source for errorCode 1003:", matched);
          setMatchedDataSource(matched);
          // Find the target attribute in the matched data source
          if (refAttributeId && matched.entityId?.attributes) {
            const attribute = matched.entityId.attributes.find(
              (attr: any) => attr._id === refAttributeId
            );
            if (attribute) {
              console.log("Target attribute found:", attribute);
              setTargetAttribute(attribute);
            }
          }
        }
      }

      // Handle error code 1002
      if (errorCode === "1002" && dataSourceId) {
        const matched = commonDataSourceList?.find(
          (ds) => ds._id === dataSourceId
        );
        if (matched) {
          console.log("Matched data source for errorCode 1002:", matched);
          setMatchedDataSource(matched);
          // Find the target attribute in the matched data source
          if (refAttributeId && matched.entityId?.attributes) {
            const attribute = matched.entityId.attributes.find(
              (attr: any) => attr._id === refAttributeId
            );
            if (attribute) {
              console.log("Target attribute found:", attribute);
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
    dataSourceId, // Added dependency
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
      // If it's already a date object or valid dayjs object
      const date = dayjs(value);
      if (date.isValid()) {
        return date.toISOString();
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
      effectiveDataSource.entityId.attributes.forEach((attribute: any) => {
        const fieldName = attribute.name;
        let fieldValue = rowData[fieldName];

        // Special handling for error codes "1003" and "1002" with refAttributeId
        if (
          (errorCode === "1003" || errorCode === "1002") &&
          refAttributeId &&
          attribute._id === refAttributeId
        ) {
          fieldValue = rowData.fileAttributeValue;
          console.log(
            `Setting ${fieldName} to fileAttributeValue: ${fieldValue}`
          );
        }

        if (attribute.type === "date" && fieldValue) {
          // Use safe conversion for dates
          const isoDate = safeDateToISOString(fieldValue);
          initialFormData[fieldName] = isoDate || "";
        } else if (attribute.type === "boolean") {
          initialFormData[fieldName] =
            fieldValue === "true" || fieldValue === true;
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
  }, [rowData, effectiveDataSource, openModal, errorCode, refAttributeId]);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidNumber = (value: string) => {
    const numberRegex = /^[0-9]*$/;
    return numberRegex.test(value);
  };

  // Build the rowData payload for both error codes
  const buildRowDataPayload = () => {
    const rowDataPayload: Record<string, any> = {};
    effectiveDataSource?.entityId?.attributes.forEach((attribute: any) => {
      const fieldName = attribute.name;
      const value = formData[fieldName];
      if (value !== undefined && value !== null && value !== "") {
        if (attribute.type === "date" && value) {
          // Use safe conversion for dates
          const isoDate = safeDateToISOString(value);
          if (isoDate) {
            rowDataPayload[fieldName] = isoDate;
          }
        } else if (attribute.type === "boolean") {
          rowDataPayload[fieldName] = value ? "true" : "false";
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
    } else if (errorCode === "1002") {
      return {
         action: "update",
        rowData: rowDataPayload,
      };
    } else if (errorCode === "1001") {
      console.log("Building payload for error code 1001", rowDataPayload);
      return {
        action: "update",
        rowData: rowDataPayload,
      };
    } 
    // else if (errorCode === "1002") {
    //   return {
    //     action: "update",
    //     rowData: rowDataPayload,
    //   };
    // }
    // Default payload for other error codes
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
        // Remove error if field is now filled
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
        // Remove email error if it's now valid
        delete errors[fieldName];
      } else if (
        attribute.type === "number" &&
        isValidNumber(value) &&
        errors[fieldName]?.includes("number")
      ) {
        // Remove number error if it's now valid
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
      console.log("Update payload for error code", errorCode, ":", payload);
      if (errorCode === "1003") {
        await updateVersionRow.mutateAsync({
          url: `${POST.CREATE_VERSION_ROW}`,
          payload,
        });
      } else if (errorCode === "1002") {
        await updateVersionRow.mutateAsync({
          url: `${POST.RESOLVE_DATA_IMPORT_ERROR}`,
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
    const fieldLabel = attribute.label; // Use label instead of name
    const fieldType = attribute.type;
    const fieldValue = formData[fieldName];
    const hasError = fieldErrors[fieldName];
    const isRequired = attribute.required;
    const options = attributeOptions[attribute.optionAttributeId] || [];

    // Highlight the target attribute for error codes "1003" and "1002"
    const isTargetAttribute =
      (errorCode === "1003" || errorCode === "1002") &&
      refAttributeId &&
      attribute._id === refAttributeId;

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
        {isTargetAttribute && (
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
                  handleFieldChange(fieldName, e.target.checked, attribute)
                }
                sx={{
                  color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
                }}
              />
            }
            label={renderLabel(fieldLabel)}
            sx={{
              mb: 1,
              ...(isTargetAttribute && {
                backgroundColor: "rgba(255, 235, 238, 0.5)",
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
            value={selectedOption || fieldValue || ""}
            onChange={(e, value) => {
              if (typeof value === "string") {
                handleFieldChange(fieldName, value, attribute);
              } else if (value && value.id) {
                handleFieldChange(fieldName, value.id, attribute);
              } else {
                handleFieldChange(fieldName, "", attribute);
              }
            }}
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
                      backgroundColor: "rgba(255, 235, 238, 0.5)",
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
                  onDelete={() => {
                    handleFieldChange(fieldName, "", attribute);
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
        const selectedValues = fieldValue
          ? fieldValue.split(",").map((val: string) => val.trim())
          : [];
        const selectedOptions = selectedValues.map((val) => {
          const option = multioptionOptions.find((opt) => opt.id === val);
          return option || { id: val, label: val };
        });
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
            value={selectedOptions}
            onChange={(e, value) => {
              const values = value.map((item) => {
                if (typeof item === "string") {
                  return item;
                }
                return item.id;
              });
              handleFieldChange(fieldName, values.join(","), attribute);
            }}
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
                      backgroundColor: "rgba(255, 235, 238, 0.5)",
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
                  key={typeof option === "string" ? option : option.id}
                  label={typeof option === "string" ? option : option.label}
                  {...getTagProps({ index })}
                  size="small"
                />
              ))
            }
          />
        );
      case "date":
        // Safely parse the date value for the DatePicker
        const dateValue = fieldValue ? dayjs(fieldValue) : null;
        return (
          <LocalizationProvider key={fieldName} dateAdapter={AdapterDayjs}>
            <DatePicker
              label={renderLabel(fieldLabel)}
              value={dateValue && dateValue.isValid() ? dateValue : null}
              onChange={(date) =>
                handleFieldChange(
                  fieldName,
                  date ? date.toISOString() : "",
                  attribute
                )
              }
              format="DD/MM/YYYY"
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
                        backgroundColor: "rgba(255, 235, 238, 0.5)",
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
              const value = e.target.value;
              if (value === "" || isValidNumber(value)) {
                handleFieldChange(fieldName, value, attribute);
              }
            }}
            variant="outlined"
            fullWidth
            error={!!hasError}
            helperText={fieldErrors[fieldName] || ""}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                ...(isTargetAttribute && {
                  backgroundColor: "rgba(255, 235, 238, 0.5)",
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
            onChange={(e) =>
              handleFieldChange(fieldName, e.target.value, attribute)
            }
            variant="outlined"
            fullWidth
            error={!!hasError}
            helperText={fieldErrors[fieldName] || ""}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                ...(isTargetAttribute && {
                  backgroundColor: "rgba(255, 235, 238, 0.5)",
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
            onChange={(e) =>
              handleFieldChange(fieldName, e.target.value, attribute)
            }
            variant="outlined"
            fullWidth
            error={!!hasError}
            helperText={fieldErrors[fieldName] || ""}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                ...(isTargetAttribute && {
                  backgroundColor: "rgba(255, 235, 238, 0.5)",
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
                Edit Validation Error
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
            {effectiveDataSource && (
              <Box
                sx={{
                  mb: 2,
                  p: 2,
                  backgroundColor:
                    STYLE_GUIDE?.COLORS?.backgroundLight || "#f5f5f5",
                  borderRadius: "8px",
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: "bold", mb: 1 }}
                >
                  Data Source Information
                </Typography>
                <Typography variant="body2">
                  <strong>Name:</strong> {effectiveDataSource.name}
                </Typography>
                <Typography variant="body2">
                  <strong>ID:</strong> {effectiveDataSource._id}
                </Typography>
                <Typography variant="body2">
                  <strong>Error Code:</strong> {errorCode}
                </Typography>
                {matchedDataSource && (
                  <>
                    <Typography
                      variant="body2"
                      sx={{
                        color: STYLE_GUIDE?.COLORS?.primaryDark,
                        mt: 1,
                        fontStyle: "italic",
                      }}
                    >
                      <strong>Note:</strong> Using reference data source for
                      error code {errorCode}
                    </Typography>
                    {targetAttribute && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: STYLE_GUIDE?.COLORS?.primaryDark,
                          fontStyle: "italic",
                        }}
                      >
                        <strong>Target Attribute:</strong>{" "}
                        {targetAttribute.name} (ID: {targetAttribute._id})
                      </Typography>
                    )}
                    {rowData.fileAttributeValue && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: STYLE_GUIDE?.COLORS?.primaryDark,
                          fontStyle: "italic",
                        }}
                      >
                        <strong>File Attribute Value:</strong>{" "}
                        {rowData.fileAttributeValue}
                      </Typography>
                    )}
                  </>
                )}
              </Box>
            )}
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

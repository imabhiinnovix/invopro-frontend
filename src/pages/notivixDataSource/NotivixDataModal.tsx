// import * as React from "react";
// import {
//   Box,
//   Typography,
//   TextField,
//   Button,
//   Tooltip,
//   Checkbox,
//   FormControlLabel,
//   Autocomplete,
//   IconButton,
//   Chip,
// } from "@mui/material";
// import { STYLE_GUIDE } from "../../styles";
// import { DatePicker } from "@mui/x-date-pickers/DatePicker";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import dayjs from "dayjs";
// import { FilterNotivixDataModal } from "./FilterNotivixDataModal";
// import CloseIcon from "@mui/icons-material/Close";
// import usePost from "../../hooks/usePost";
// import { POST, PUT } from "../../services/apiRoutes";
// import { toast } from "react-toastify";
// import usePut from "../../hooks/usePut";
// import { DeleteConfirmationDialog } from "../../components/common/deleteConfirmationDialog/DeleteConfirmationDialog";

// interface ModelSectionProps {
//   openModal: boolean;
//   modalMode: "add" | "edit" | "view" | "filter" | null;
//   formData: Record<string, any>;
//   openDialog: boolean;
//   deleteId: string | null;
//   listCurrentData: any;
//   sourceVersionData: any;
//   columns: any[];
//   attributeListData: any[];
//   handleCloseModal: () => void;
//   handleCloseDialog: () => void;
//   handleConfirmDelete: () => void;
//   handleSave: (data: any) => void;
//   setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
//   switchToEditMode: () => void;
//   dataSourceId: string;
//   refreshData: () => void;
// }

// export const NotivixDataModal: React.FC<ModelSectionProps> = ({
//   openModal,
//   modalMode,
//   formData,
//   openDialog,
//   deleteId,
//   listCurrentData,
//   sourceVersionData,
//   columns,
//   attributeListData,
//   handleCloseModal,
//   handleCloseDialog,
//   handleConfirmDelete,
//   handleSave,
//   setFormData,
//   // switchToEditMode,
//   dataSourceId,
//   refreshData,
// }) => {
//   const createVersionRow = usePost(["createVersionRow"]);
//   const updateVersionRow = usePut(["updateVersionRow"]);
//   const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>(
//     {}
//   );
//   const [submitAttempted, setSubmitAttempted] = React.useState(false);

//   console.log("formData in modal", listCurrentData);

//   // Function to validate email format
//   const isValidEmail = (email: string) => {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailRegex.test(email);
//   };

//   // Function to validate number format
//   const isValidNumber = (value: string) => {
//     const numberRegex = /^[0-9]*$/;
//     return numberRegex.test(value);
//   };

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

//   const convertToPayload = () => {
//     const rowData: Record<string, any> = {};
//     const attributes = listCurrentData?.entityId?.attributes || [];
//     attributes.forEach((attribute: any) => {
//       const fieldName = attribute.name;
//       const fieldType = attribute.type;
//       const value = formData[fieldName];
//       if (value !== undefined && value !== null && value !== "") {
//         if (fieldType === "date" && value) {
//           rowData[fieldName] = dayjs(value).toISOString();
//         } else if (fieldType === "boolean") {
//           rowData[fieldName] = value ? "true" : "false";
//         } else {
//           rowData[fieldName] = value;
//         }
//       }
//     });
//     return {
//       dataSourceId,
//       rowData,
//     };
//   };

//   const validateRequiredFields = () => {
//     const attributes = listCurrentData?.entityId?.attributes || [];
//     const errors: Record<string, string> = {};

//     attributes.forEach((attribute: any) => {
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
//           errors[fieldName] = `${attribute.name} is required`;
//         }
//       }
//     });

//     setFieldErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   // Validate a specific field and update errors
//   const validateField = (fieldName: string, value: any) => {
//     const attributes = listCurrentData?.entityId?.attributes || [];
//     const attribute = attributes.find((attr: any) => attr.name === fieldName);

//     if (!attribute) return;

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
//         errors[fieldName] = `${attribute.name} is required`;
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

//       if (modalMode === "add" || modalMode === "edit") {
//         const attributes = listCurrentData?.entityId?.attributes || [];
//         let isValid = true;
//         let errorMessage = "";

//         // First validate required fields
//         if (!validateRequiredFields()) {
//           toast.error("Please fill in all required fields");
//           return;
//         }

//         // Then validate field types
//         for (const attribute of attributes) {
//           const fieldName = attribute.name;
//           const fieldType = attribute.type;
//           const value = formData[fieldName];

//           if (value !== undefined && value !== null && value !== "") {
//             if (fieldType === "email" && !isValidEmail(value)) {
//               isValid = false;
//               errorMessage = `Please enter a valid email address for ${attribute.name}`;
//               break;
//             } else if (fieldType === "number" && !isValidNumber(value)) {
//               isValid = false;
//               errorMessage = `Please enter a valid number for ${attribute.name}`;
//               break;
//             }
//           }
//         }

//         if (!isValid) {
//           toast.error(errorMessage);
//           return;
//         }

//         const payload = convertToPayload();
//         if (modalMode === "edit" && formData.id) {
//           payload.rowId = formData.id;
//         }

//         if (modalMode === "add") {
//           await createVersionRow.mutateAsync({
//             url: `${POST.CREATE_VERSION_ROW}`,
//             payload,
//           });
//         } else if (modalMode === "edit") {
//           await updateVersionRow.mutateAsync({
//             url: `${PUT.UPDATE_VERSION_ROW}/${formData.id}`,
//             payload,
//           });
//         }

//         handleSave(payload);
//         refreshData();
//         const successMessage =
//           modalMode === "add"
//             ? "Record added successfully!"
//             : "Record updated successfully!";
//         toast.success(successMessage);
//       } else if (modalMode === "filter") {
//         handleSave(formData);
//       }

//       handleCloseModal();
//     } catch (error) {
//       toast.error(
//         `Error: ${error.message || "Something went wrong. Please try again."}`
//       );
//     }
//   };

//   const handleCancel = () => {
//     // Reset validation states when closing the modal
//     setFieldErrors({});
//     setSubmitAttempted(false);
//     handleCloseModal();
//   };

//   const renderViewField = (attribute: any) => {
//     const fieldName = attribute.name;
//     const fieldLabel = attribute.name;
//     let value = formData[fieldName] || "-";
//     if (attribute.type === "date" && value !== "-") {
//       try {
//         const formattedDate = dayjs(value).format("DD-MMM-YYYY");
//         value = formattedDate;
//       } catch (error) {
//         console.error("Error formatting date:", error);
//       }
//     }
//     return (
//       <Box
//         key={fieldName}
//         sx={{
//           mb: 2,
//           display: "flex",
//           flexDirection: "column",
//         }}
//       >
//         <Typography
//           variant="body2"
//           sx={{
//             mb: 0.5,
//             color: STYLE_GUIDE?.COLORS?.primaryDark || "#666",
//             fontWeight: 500,
//             whiteSpace: "nowrap",
//             overflow: "hidden",
//             textOverflow: "ellipsis",
//           }}
//         >
//           {fieldLabel}
//           {attribute.required && (
//             <Typography
//               component="span"
//               sx={{ color: STYLE_GUIDE?.COLORS?.primaryDark }}
//             >
//               {" *"}
//             </Typography>
//           )}
//         </Typography>
//         <Box
//           sx={{
//             p: 1.5,
//             borderRadius: "8px",
//             backgroundColor: STYLE_GUIDE?.COLORS?.backgroundLight || "#f5f5f5",
//             color: STYLE_GUIDE?.COLORS?.textPrimary || "#333",
//             minHeight: "40px",
//             display: "flex",
//             alignItems: "center",
//             wordBreak: "break-word",
//             overflow: "hidden",
//           }}
//         >
//           {value}
//         </Box>
//       </Box>
//     );
//   };

//   function normalizeMultiOptionValue(
//     raw: any,
//     options: { id: string; label: string }[]
//   ) {
//     let values: string[] = [];

//     if (Array.isArray(raw)) {
//       values = raw;
//     } else if (typeof raw === "string") {
//       values = raw
//         .split(",")
//         .map((v) => v.trim())
//         .filter(Boolean);
//     }

//     return values.map((val) => {
//       const match = options.find((opt) => opt.id === val);
//       return match || { id: val, label: val };
//     });
//   }

//   const renderAttributeField = (attribute: any) => {
//     const fieldName = attribute.name;
//     const fieldLabel = attribute.name;
//     const fieldType = attribute.type;
//     const isRequired = attribute.required;
//     const isDisabled = modalMode === "view";
//     const hasError = fieldErrors[fieldName];

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
//       </React.Fragment>
//     );

//     const handleFieldChange = (value: any) => {
//       setFormData((prev) => ({
//         ...prev,
//         [fieldName]: value,
//       }));

//       if (submitAttempted) {
//         validateField(fieldName, value);
//       }
//     };

//     switch (fieldType) {
//       case "boolean":
//         return (
//           <FormControlLabel
//             key={fieldName}
//             control={
//               <Checkbox
//                 checked={!!formData[fieldName]}
//                 onChange={(e) => handleFieldChange(e.target.checked)}
//                 sx={{
//                   color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
//                 }}
//               />
//             }
//             label={renderLabel(fieldLabel)}
//             sx={{ mb: 1 }}
//           />
//         );

//       case "option":
//         const optionOptions = getOptionsForAttribute(
//           attribute.optionAttributeId
//         );
//         const selectedOption = optionOptions.find(
//           (option) => option.id === formData[fieldName]
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
//             value={selectedOption || formData[fieldName] || ""}
//             onChange={(e, value) => {
//               if (typeof value === "string") {
//                 handleFieldChange(value);
//               } else if (value && value.id) {
//                 handleFieldChange(value.id);
//               } else {
//                 handleFieldChange("");
//               }
//             }}
//             renderInput={(params) => (
//               <TextField
//                 {...params}
//                 label={renderLabel(fieldLabel)}
//                 variant="outlined"
//                 fullWidth
//                 disabled={isDisabled}
//                 error={!!fieldErrors[fieldName]}
//                 helperText={fieldErrors[fieldName] || ""}
//                 sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
//                 placeholder={isReference ? "Select option" : "Type or select"}
//               />
//             )}
//             renderOption={(props, option) => {
//               return (
//                 <li {...props}>
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
//                     handleFieldChange("");
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
//         const isReferenceMulti = !!attribute.referenceEntitySetting;

//         const selectedOptions = normalizeMultiOptionValue(
//           formData[fieldName],
//           multioptionOptions
//         );

//         return (
//           <Autocomplete
//             multiple
//             freeSolo={!isReferenceMulti}
//             key={fieldName}
//             options={multioptionOptions}
//             getOptionLabel={(option) =>
//               typeof option === "string" ? option : option.label || ""
//             }
//             value={selectedOptions}
//             onChange={(e, value) => {
//               const values = value.map((item) =>
//                 typeof item === "string" ? item : item.id
//               );
//               handleFieldChange(values);
//             }}
//             renderInput={(params) => (
//               <TextField
//                 {...params}
//                 label={renderLabel(fieldLabel)}
//                 variant="outlined"
//                 fullWidth
//                 disabled={isDisabled}
//                 error={!!fieldErrors[fieldName]}
//                 helperText={fieldErrors[fieldName] || ""}
//                 sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
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
//               value={formData[fieldName] ? dayjs(formData[fieldName]) : null}
//               onChange={(date) =>
//                 handleFieldChange(date ? date.toISOString() : "")
//               }
//               disabled={isDisabled}
//               format="DD/MM/YYYY"
//               slotProps={{
//                 textField: {
//                   variant: "outlined",
//                   fullWidth: true,
//                   error: !!fieldErrors[fieldName],
//                   helperText: fieldErrors[fieldName] || "",
//                   sx: {
//                     "& .MuiOutlinedInput-root": { borderRadius: "8px" },
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
//             value={formData[fieldName] || ""}
//             onChange={(e) => {
//               const value = e.target.value;
//               if (value === "" || isValidNumber(value)) {
//                 handleFieldChange(value);
//               }
//             }}
//             variant="outlined"
//             fullWidth
//             disabled={isDisabled}
//             error={!!fieldErrors[fieldName]}
//             helperText={fieldErrors[fieldName] || ""}
//             sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
//           />
//         );

//       case "email":
//         return (
//           <TextField
//             key={fieldName}
//             label={renderLabel(fieldLabel)}
//             type="email"
//             value={formData[fieldName] || ""}
//             onChange={(e) => handleFieldChange(e.target.value)}
//             variant="outlined"
//             fullWidth
//             disabled={isDisabled}
//             error={!!fieldErrors[fieldName]}
//             helperText={fieldErrors[fieldName] || ""}
//             sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
//           />
//         );

//       default:
//         return (
//           <TextField
//             key={fieldName}
//             label={renderLabel(fieldLabel)}
//             value={formData[fieldName] || ""}
//             onChange={(e) => handleFieldChange(e.target.value)}
//             variant="outlined"
//             fullWidth
//             disabled={isDisabled}
//             error={!!fieldErrors[fieldName]}
//             helperText={fieldErrors[fieldName] || ""}
//             sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
//           />
//         );
//     }
//   };

//   const renderModalFields = () => {
//     if (modalMode === "view" || modalMode === "edit" || modalMode === "add") {
//       const attributes = listCurrentData?.entityId?.attributes || [];
//       if (attributes.length === 0) {
//         return <Typography>No attributes available to display.</Typography>;
//       }

//       if (modalMode === "view") {
//         const attributePairs = [];
//         for (let i = 0; i < attributes.length; i += 2) {
//           attributePairs.push([attributes[i], attributes[i + 1]]);
//         }
//         return (
//           <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
//             {attributePairs.map((pair, index) => (
//               <Box key={index} sx={{ display: "flex", gap: 2 }}>
//                 {/* First column */}
//                 <Box sx={{ flex: 1 }}>{renderViewField(pair[0])}</Box>
//                 {/* Second column - only if it exists */}
//                 {pair[1] && (
//                   <Box sx={{ flex: 1 }}>{renderViewField(pair[1])}</Box>
//                 )}
//               </Box>
//             ))}
//           </Box>
//         );
//       }

//       // Split attributes into two arrays for two-column layout (for edit and add modes)
//       const firstColumnAttributes = attributes.filter(
//         (_, index) => index % 2 === 0
//       );
//       const secondColumnAttributes = attributes.filter(
//         (_, index) => index % 2 === 1
//       );

//       return (
//         <>
//           {/* First column */}
//           <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
//             {firstColumnAttributes.map(renderAttributeField)}
//           </Box>
//           {/* Second column */}
//           <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
//             {secondColumnAttributes.map(renderAttributeField)}
//           </Box>
//         </>
//       );
//     } else {
//       const fields = columns
//         .filter((col) => col.field !== "actions" && col.field !== "_id")
//         .map((col) => (
//           <TextField
//             key={col.field}
//             label={col.headerName}
//             value={formData[col.field] || ""}
//             onChange={(e) =>
//               setFormData((prev) => ({ ...prev, [col.field]: e.target.value }))
//             }
//             variant="outlined"
//             fullWidth
//             sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
//           />
//         ));
//       return fields.length > 0 ? (
//         fields
//       ) : (
//         <Typography>No fields available to display.</Typography>
//       );
//     }
//   };

//   return (
//     <>
//       {openModal && modalMode !== "filter" && (
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
//               <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//                 <Typography
//                   variant="h6"
//                   sx={{ color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5" }}
//                 >
//                   {modalMode === "add"
//                     ? "Add"
//                     : modalMode === "edit"
//                       ? "Edit"
//                       : "View"}
//                 </Typography>
//                 {/* {modalMode === "view" && (
//                   <Tooltip title="Edit">
//                     <IconButton
//                       onClick={switchToEditMode}
//                       sx={{
//                         color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
//                       }}
//                     >
//                       <EditIcon />
//                     </IconButton>
//                   </Tooltip>
//                 )} */}
//               </Box>
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
//                 display: modalMode === "view" ? "block" : "grid",
//                 gridTemplateColumns: modalMode === "view" ? "none" : "1fr 1fr",
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
//               {modalMode !== "view" && (
//                 <Button
//                   variant="contained"
//                   onClick={handleSaveClick}
//                   sx={{
//                     borderRadius: "8px",
//                     backgroundColor:
//                       STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
//                     color: STYLE_GUIDE?.COLORS?.white || "#ffffff",
//                     "&:hover": {
//                       backgroundColor:
//                         STYLE_GUIDE?.COLORS?.primary || "#5c6bc0",
//                     },
//                   }}
//                 >
//                   Save
//                 </Button>
//               )}
//             </Box>
//           </Box>
//         </Box>
//       )}
//       <FilterNotivixDataModal
//         open={openModal && modalMode === "filter"}
//         onClose={handleCancel}
//         onApply={handleSaveClick}
//         formData={formData}
//         listCurrentData={listCurrentData}
//         sourceVersionData={sourceVersionData}
//         setFormData={setFormData}
//       />
//       <DeleteConfirmationDialog
//         open={openDialog}
//         onClose={handleCloseDialog}
//         onConfirm={handleConfirmDelete}
//         deleteId={deleteId}
//       />
//     </>
//   );
// };

// import * as React from "react";
// import {
//   Box,
//   Typography,
//   TextField,
//   Button,
//   Tooltip,
//   Checkbox,
//   FormControlLabel,
//   Autocomplete,
//   IconButton,
//   Chip,
// } from "@mui/material";
// import { STYLE_GUIDE } from "../../styles";
// import { DatePicker } from "@mui/x-date-pickers/DatePicker";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import dayjs from "dayjs";
// import { FilterNotivixDataModal } from "./FilterNotivixDataModal";
// import CloseIcon from "@mui/icons-material/Close";
// import usePost from "../../hooks/usePost";
// import { POST, PUT } from "../../services/apiRoutes";
// import { toast } from "react-toastify";
// import usePut from "../../hooks/usePut";
// import { DeleteConfirmationDialog } from "../../components/common/deleteConfirmationDialog/DeleteConfirmationDialog";
// interface ModelSectionProps {
//   openModal: boolean;
//   modalMode: "add" | "edit" | "view" | "filter" | null;
//   formData: Record<string, any>;
//   openDialog: boolean;
//   deleteId: string | null;
//   listCurrentData: any;
//   sourceVersionData: any;
//   columns: any[];
//   attributeListData: any[];
//   handleCloseModal: () => void;
//   handleCloseDialog: () => void;
//   handleConfirmDelete: () => void;
//   handleSave: (data: any) => void;
//   setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
//   switchToEditMode: () => void;
//   dataSourceId: string;
//   refreshData: () => void;
// }
// export const NotivixDataModal: React.FC<ModelSectionProps> = ({
//   openModal,
//   modalMode,
//   formData,
//   openDialog,
//   deleteId,
//   listCurrentData,
//   sourceVersionData,
//   columns,
//   attributeListData,
//   handleCloseModal,
//   handleCloseDialog,
//   handleConfirmDelete,
//   handleSave,
//   setFormData,
//   // switchToEditMode,
//   dataSourceId,
//   refreshData,
// }) => {
//   const createVersionRow = usePost(["createVersionRow"]);
//   const updateVersionRow = usePut(["updateVersionRow"]);
//   const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>(
//     {}
//   );
//   const [submitAttempted, setSubmitAttempted] = React.useState(false);
//   console.log("formData in modal", formData);
//   // Function to validate email format
//   const isValidEmail = (email: string) => {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailRegex.test(email);
//   };
//   // Function to validate number format
//   const isValidNumber = (value: string) => {
//     const numberRegex = /^[0-9]*$/;
//     return numberRegex.test(value);
//   };
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
//   const convertToPayload = () => {
//     const rowData: Record<string, any> = {};
//     const attributes = listCurrentData?.entityId?.attributes || [];
//     attributes.forEach((attribute: any) => {
//       const fieldName = attribute.name;
//       const fieldType = attribute.type;
//       const value = formData[fieldName];
//       if (value !== undefined && value !== null && value !== "") {
//         if (fieldType === "date" && value) {
//           rowData[fieldName] = dayjs(value).toISOString();
//         } else if (fieldType === "boolean") {
//           rowData[fieldName] = value ? "true" : "false";
//         } else {
//           rowData[fieldName] = value;
//         }
//       }
//     });
//     return {
//       dataSourceId,
//       rowData,
//     };
//   };
//   const validateRequiredFields = () => {
//     const attributes = listCurrentData?.entityId?.attributes || [];
//     const errors: Record<string, string> = {};
//     attributes.forEach((attribute: any) => {
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
//           errors[fieldName] = `${attribute.name} is required`;
//         }
//       }
//     });
//     setFieldErrors(errors);
//     return Object.keys(errors).length === 0;
//   };
//   // Validate a specific field and update errors
//   const validateField = (fieldName: string, value: any) => {
//     const attributes = listCurrentData?.entityId?.attributes || [];
//     const attribute = attributes.find((attr: any) => attr.name === fieldName);
//     if (!attribute) return;
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
//         errors[fieldName] = `${attribute.name} is required`;
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
//       if (modalMode === "add" || modalMode === "edit") {
//         const attributes = listCurrentData?.entityId?.attributes || [];
//         let isValid = true;
//         let errorMessage = "";
//         // First validate required fields
//         if (!validateRequiredFields()) {
//           toast.error("Please fill in all required fields");
//           return;
//         }
//         // Then validate field types
//         for (const attribute of attributes) {
//           const fieldName = attribute.name;
//           const fieldType = attribute.type;
//           const value = formData[fieldName];
//           if (value !== undefined && value !== null && value !== "") {
//             if (fieldType === "email" && !isValidEmail(value)) {
//               isValid = false;
//               errorMessage = `Please enter a valid email address for ${attribute.name}`;
//               break;
//             } else if (fieldType === "number" && !isValidNumber(value)) {
//               isValid = false;
//               errorMessage = `Please enter a valid number for ${attribute.name}`;
//               break;
//             }
//           }
//         }
//         if (!isValid) {
//           toast.error(errorMessage);
//           return;
//         }
//         const payload = convertToPayload();
//         if (modalMode === "edit" && formData.id) {
//           payload.rowId = formData.id;
//         }
//         if (modalMode === "add") {
//           await createVersionRow.mutateAsync({
//             url: `${POST.CREATE_VERSION_ROW}`,
//             payload,
//           });
//         } else if (modalMode === "edit") {
//           await updateVersionRow.mutateAsync({
//             url: `${PUT.UPDATE_VERSION_ROW}/${formData.id}`,
//             payload,
//           });
//         }
//         handleSave(payload);
//         refreshData();
//         const successMessage =
//           modalMode === "add"
//             ? "Record added successfully!"
//             : "Record updated successfully!";
//         toast.success(successMessage);
//       } else if (modalMode === "filter") {
//         handleSave(formData);
//       }
//       handleCloseModal();
//     } catch (error) {
//       toast.error(
//         `Error: ${error.message || "Something went wrong. Please try again."}`
//       );
//     }
//   };
//   const handleCancel = () => {
//     // Reset validation states when closing the modal
//     setFieldErrors({});
//     setSubmitAttempted(false);
//     handleCloseModal();
//   };

//   // Replace the existing renderViewField function with this:
//   const renderViewField = (attribute: any) => {
//     const fieldName = attribute.name;
//     const fieldLabel = attribute.label || attribute.name;
//     let value = formData[fieldName] || "-";

//     // Handle date formatting (only for non-array values)
//     if (attribute.type === "date" && value !== "-" && !Array.isArray(value)) {
//       try {
//         const formattedDate = dayjs(value).format("DD-MMM-YYYY");
//         value = formattedDate;
//       } catch (error) {
//         console.error("Error formatting date:", error);
//       }
//     }

//     // Function to render value content - handles arrays and single values
//     const renderValueContent = (val: any) => {
//       if (val === "-") {
//         return (
//           <Typography
//             variant="body2"
//             sx={{
//               fontSize: "0.875rem",
//               lineHeight: 1.4,
//               color: STYLE_GUIDE?.COLORS?.textSecondary || "#666",
//               fontStyle: "italic",
//             }}
//           >
//             {val}
//           </Typography>
//         );
//       }

//       // Check if value is an array
//       if (Array.isArray(val)) {
//         if (val.length === 0) {
//           return (
//             <Typography
//               variant="body2"
//               sx={{
//                 fontSize: "0.875rem",
//                 color: STYLE_GUIDE?.COLORS?.textSecondary || "#666",
//                 fontStyle: "italic",
//               }}
//             >
//               No data
//             </Typography>
//           );
//         }

//         return (
//           <Box
//             sx={{ display: "flex", flexDirection: "column", gap: 0.5, py: 0.5 }}
//           >
//             {val.map((item, index) => (
//               <Typography
//                 key={index}
//                 variant="body2"
//                 sx={{
//                   fontSize: "0.875rem",
//                   lineHeight: 1.4,
//                   wordBreak: "break-word",
//                   color: STYLE_GUIDE?.COLORS?.textPrimary || "#333",
//                   "&:not(:last-child)": {
//                     borderBottom: `1px solid ${STYLE_GUIDE?.COLORS?.divider || "#f0f0f0"}`,
//                     paddingBottom: "4px",
//                     marginBottom: "4px",
//                   },
//                 }}
//               >
//                 {String(item)}
//               </Typography>
//             ))}
//           </Box>
//         );
//       }

//       // For single values
//       return (
//         <Typography
//           variant="body2"
//           sx={{
//             fontSize: "0.875rem",
//             lineHeight: 1.4,
//             wordBreak: "break-word",
//             color: STYLE_GUIDE?.COLORS?.textPrimary || "#333",
//           }}
//         >
//           {String(val)}
//         </Typography>
//       );
//     };

//     return (
//       <Box
//         key={fieldName}
//         sx={{
//           mb: 2,
//           display: "flex",
//           flexDirection: "column",
//         }}
//       >
//         <Typography
//           variant="body2"
//           sx={{
//             mb: 0.5,
//             color: STYLE_GUIDE?.COLORS?.primaryDark || "#666",
//             fontWeight: 500,
//             whiteSpace: "nowrap",
//             overflow: "hidden",
//             textOverflow: "ellipsis",
//           }}
//         >
//           {fieldLabel}
//           {attribute.required && (
//             <Typography
//               component="span"
//               sx={{ color: STYLE_GUIDE?.COLORS?.primaryDark }}
//             >
//               {" *"}
//             </Typography>
//           )}
//         </Typography>
//         <Box
//           sx={{
//             p: 1.5,
//             borderRadius: "8px",
//             backgroundColor: STYLE_GUIDE?.COLORS?.backgroundLight || "#f5f5f5",
//             minHeight: "40px",
//             display: "flex",
//             alignItems: Array.isArray(value) ? "flex-start" : "center", // Align to top for arrays
//             wordBreak: "break-word",
//             // Allow content to expand vertically for arrays
//             ...(Array.isArray(value) && {
//               alignItems: "stretch",
//               py: 1,
//             }),
//           }}
//         >
//           {renderValueContent(value)}
//         </Box>
//       </Box>
//     );
//   };

//   function normalizeMultiOptionValue(
//     raw: any,
//     options: { id: string; label: string }[]
//   ) {
//     let values: string[] = [];
//     if (Array.isArray(raw)) {
//       values = raw;
//     } else if (typeof raw === "string") {
//       values = raw
//         .split(",")
//         .map((v) => v.trim())
//         .filter(Boolean);
//     }
//     return values.map((val) => {
//       const match = options.find((opt) => opt.id === val);
//       return match || { id: val, label: val };
//     });
//   }
//   const renderAttributeField = (attribute: any) => {
//     const fieldName = attribute.name;
//     const fieldLabel = attribute.label || attribute.name;
//     const fieldType = attribute.type;
//     const isRequired = attribute.required;
//     const isDisabled = modalMode === "view";

//     // Determine if the field should be hidden
//     const shouldHideField = () => {
//       // hide if isReferenceEditable is HIDE
//       if (attribute.isReferenceEditable === "HIDE") return true;

//       // check for dot in name + HIDE
//       if (
//         attribute.name.includes(".") &&
//         attribute.isReferenceEditable === "HIDE"
//       )
//         return true;

//       return false;
//     };

//     if (shouldHideField()) {
//       return null; // hide field in view, add, edit
//     }

//     // Determine if field is editable
//     let isFieldEditable = false;
//     if (attribute.isReferenceEditable === "EDIT" && modalMode !== "view") {
//       isFieldEditable = true;
//     } else if (attribute.isReferenceEditable === "VIEW") {
//       isFieldEditable = false; // readonly
//     }

//     const hasError = fieldErrors[fieldName];
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
//       </React.Fragment>
//     );
//     const handleFieldChange = (value: any) => {
//       setFormData((prev) => ({
//         ...prev,
//         [fieldName]: value,
//       }));
//       if (submitAttempted) {
//         validateField(fieldName, value);
//       }
//     };
//     switch (fieldType) {
//       case "boolean":
//         return (
//           <FormControlLabel
//             key={fieldName}
//             control={
//               <Checkbox
//                 checked={!!formData[fieldName]}
//                 onChange={(e) => handleFieldChange(e.target.checked)}
//                 sx={{
//                   color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
//                 }}
//                 disabled={!isFieldEditable}
//               />
//             }
//             label={renderLabel(fieldLabel)}
//             sx={{ mb: 1 }}
//           />
//         );
//       case "option":
//         const optionOptions = getOptionsForAttribute(
//           attribute.optionAttributeId
//         );
//         const selectedOption = optionOptions.find(
//           (option) => option.id === formData[fieldName]
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
//             value={selectedOption || formData[fieldName] || ""}
//             onChange={(e, value) => {
//               if (typeof value === "string") {
//                 handleFieldChange(value);
//               } else if (value && value.id) {
//                 handleFieldChange(value.id);
//               } else {
//                 handleFieldChange("");
//               }
//             }}
//             disabled={!isFieldEditable}
//             renderInput={(params) => (
//               <TextField
//                 {...params}
//                 label={renderLabel(fieldLabel)}
//                 variant="outlined"
//                 fullWidth
//                 disabled={isDisabled}
//                 error={!!fieldErrors[fieldName]}
//                 helperText={fieldErrors[fieldName] || ""}
//                 sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
//                 placeholder={isReference ? "Select option" : "Type or select"}
//               />
//             )}
//             renderOption={(props, option) => {
//               return (
//                 <li {...props}>
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
//                   sx={{ color: STYLE_GUIDE?.COLORS?.textPrimary || "#333" }}
//                   onDelete={() => {
//                     handleFieldChange("");
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
//         const isReferenceMulti = !!attribute.referenceEntitySetting;
//         const selectedOptions = normalizeMultiOptionValue(
//           formData[fieldName],
//           multioptionOptions
//         );
//         return (
//           <Autocomplete
//             multiple
//             freeSolo={!isReferenceMulti}
//             key={fieldName}
//             options={multioptionOptions}
//             getOptionLabel={(option) =>
//               typeof option === "string" ? option : option.label || ""
//             }
//             value={selectedOptions}
//             onChange={(e, value) => {
//               const values = value.map((item) =>
//                 typeof item === "string" ? item : item.id
//               );
//               handleFieldChange(values);
//             }}
//             disabled={!isFieldEditable}
//             renderInput={(params) => (
//               <TextField
//                 {...params}
//                 label={renderLabel(fieldLabel)}
//                 variant="outlined"
//                 fullWidth
//                 disabled={isDisabled}
//                 error={!!fieldErrors[fieldName]}
//                 helperText={fieldErrors[fieldName] || ""}
//                 sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
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
//               value={formData[fieldName] ? dayjs(formData[fieldName]) : null}
//               onChange={(date) =>
//                 handleFieldChange(date ? date.toISOString() : "")
//               }
//               // disabled={isDisabled}
//               disabled={!isFieldEditable}
//               format="DD/MM/YYYY"
//               slotProps={{
//                 textField: {
//                   variant: "outlined",
//                   fullWidth: true,
//                   error: !!fieldErrors[fieldName],
//                   helperText: fieldErrors[fieldName] || "",
//                   sx: {
//                     "& .MuiOutlinedInput-root": { borderRadius: "8px" },
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
//             value={formData[fieldName] || ""}
//             onChange={(e) => {
//               const value = e.target.value;
//               if (value === "" || isValidNumber(value)) {
//                 handleFieldChange(value);
//               }
//             }}
//             variant="outlined"
//             fullWidth
//             disabled={!isFieldEditable}
//             // disabled={isDisabled}
//             error={!!fieldErrors[fieldName]}
//             helperText={fieldErrors[fieldName] || ""}
//             sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
//           />
//         );
//       case "email":
//         return (
//           <TextField
//             key={fieldName}
//             label={renderLabel(fieldLabel)}
//             type="email"
//             value={formData[fieldName] || ""}
//             onChange={(e) => handleFieldChange(e.target.value)}
//             variant="outlined"
//             fullWidth
//             // disabled={isDisabled}
//             disabled={!isFieldEditable}
//             error={!!fieldErrors[fieldName]}
//             helperText={fieldErrors[fieldName] || ""}
//             sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
//           />
//         );
//       default:
//         return (
//           <TextField
//             key={fieldName}
//             label={renderLabel(fieldLabel)}
//             value={formData[fieldName] || ""}
//             onChange={(e) => handleFieldChange(e.target.value)}
//             variant="outlined"
//             fullWidth
//             // disabled={isDisabled}
//             disabled={!isFieldEditable}
//             error={!!fieldErrors[fieldName]}
//             helperText={fieldErrors[fieldName] || ""}
//             sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
//           />
//         );
//     }
//   };
//   const renderModalFields = () => {
//     if (modalMode === "view" || modalMode === "edit" || modalMode === "add") {
//       const attributes = listCurrentData?.entityId?.attributes || [];
//       if (attributes.length === 0) {
//         return <Typography>No attributes available to display.</Typography>;
//       }
//       if (modalMode === "view") {
//         const attributePairs = [];
//         for (let i = 0; i < attributes.length; i += 2) {
//           attributePairs.push([attributes[i], attributes[i + 1]]);
//         }
//         return (
//           <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
//             {attributePairs.map((pair, index) => (
//               <Box key={index} sx={{ display: "flex", gap: 2 }}>
//                 {/* First column */}
//                 <Box sx={{ flex: 1 }}>{renderViewField(pair[0])}</Box>
//                 {/* Second column - only if it exists */}
//                 {pair[1] && (
//                   <Box sx={{ flex: 1 }}>{renderViewField(pair[1])}</Box>
//                 )}
//               </Box>
//             ))}
//           </Box>
//         );
//       }
//       // Split attributes into two arrays for two-column layout (for edit and add modes)
//       const firstColumnAttributes = attributes.filter(
//         (_, index) => index % 2 === 0
//       );
//       const secondColumnAttributes = attributes.filter(
//         (_, index) => index % 2 === 1
//       );
//       return (
//         <>
//           {/* First column */}
//           <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
//             {firstColumnAttributes.map(renderAttributeField)}
//           </Box>
//           {/* Second column */}
//           <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
//             {secondColumnAttributes.map(renderAttributeField)}
//           </Box>
//         </>
//       );
//     } else {
//       const fields = columns
//         .filter((col) => col.field !== "actions" && col.field !== "_id")
//         .map((col) => (
//           <TextField
//             key={col.field}
//             label={col.headerName}
//             value={formData[col.field] || ""}
//             onChange={(e) =>
//               setFormData((prev) => ({ ...prev, [col.field]: e.target.value }))
//             }
//             variant="outlined"
//             fullWidth
//             sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
//           />
//         ));
//       return fields.length > 0 ? (
//         fields
//       ) : (
//         <Typography>No fields available to display.</Typography>
//       );
//     }
//   };
//   return (
//     <>
//       {openModal && modalMode !== "filter" && (
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
//               <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//                 <Typography
//                   variant="h6"
//                   sx={{ color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5" }}
//                 >
//                   {modalMode === "add"
//                     ? "Add"
//                     : modalMode === "edit"
//                       ? "Edit"
//                       : "View"}
//                 </Typography>
//                 {/* {modalMode === "view" && (
//                   <Tooltip title="Edit">
//                     <IconButton
//                       onClick={switchToEditMode}
//                       sx={{
//                         color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
//                       }}
//                     >
//                       <EditIcon />
//                     </IconButton>
//                   </Tooltip>
//                 )} */}
//               </Box>
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
//                 display: modalMode === "view" ? "block" : "grid",
//                 gridTemplateColumns: modalMode === "view" ? "none" : "1fr 1fr",
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
//               {modalMode !== "view" && (
//                 <Button
//                   variant="contained"
//                   onClick={handleSaveClick}
//                   sx={{
//                     borderRadius: "8px",
//                     backgroundColor:
//                       STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
//                     color: STYLE_GUIDE?.COLORS?.white || "#ffffff",
//                     "&:hover": {
//                       backgroundColor:
//                         STYLE_GUIDE?.COLORS?.primary || "#5c6bc0",
//                     },
//                   }}
//                 >
//                   Save
//                 </Button>
//               )}
//             </Box>
//           </Box>
//         </Box>
//       )}
//       <FilterNotivixDataModal
//         open={openModal && modalMode === "filter"}
//         onClose={handleCancel}
//         onApply={handleSaveClick}
//         formData={formData}
//         listCurrentData={listCurrentData}
//         sourceVersionData={sourceVersionData}
//         setFormData={setFormData}
//       />
//       <DeleteConfirmationDialog
//         open={openDialog}
//         onClose={handleCloseDialog}
//         onConfirm={handleConfirmDelete}
//         deleteId={deleteId}
//       />
//     </>
//   );
// };

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
import { FilterNotivixDataModal } from "./FilterNotivixDataModal";
import CloseIcon from "@mui/icons-material/Close";
import usePost from "../../hooks/usePost";
import { POST, PUT } from "../../services/apiRoutes";
import { toast } from "react-toastify";
import usePut from "../../hooks/usePut";
import { ConfirmationDialog } from "../../components/common/deleteConfirmationDialog/ConfirmationDialog";

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
  sourceVersionData,
  columns,
  attributeListData,
  handleCloseModal,
  handleCloseDialog,
  handleConfirmDelete,
  handleSave,
  setFormData,
  switchToEditMode,
  dataSourceId,
  refreshData,
}) => {
  const createVersionRow = usePost(["createVersionRow"]);
  const updateVersionRow = usePut(["updateVersionRow"]);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>(
    {}
  );
  const [submitAttempted, setSubmitAttempted] = React.useState(false);
  console.log("formData in modal", formData);

  // Function to validate email format
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Function to validate number format
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
        // Check if field is empty
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

  // Validate a specific field and update errors
  const validateField = (fieldName: string, value: any) => {
    const attributes = listCurrentData?.entityId?.attributes || [];
    const attribute = attributes.find((attr: any) => attr.name === fieldName);
    if (!attribute) return;
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
        errors[fieldName] = `${attribute.name} is required`;
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
      if (modalMode === "add" || modalMode === "edit") {
        const attributes = listCurrentData?.entityId?.attributes || [];
        let isValid = true;
        let errorMessage = "";
        // First validate required fields
        if (!validateRequiredFields()) {
          toast.error("Please fill required fields");
          return;
        }
        // Then validate field types
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
    // Reset validation states when closing the modal
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
    // Hide field if isReferenceEditable is HIDE
    const shouldHideField = () => {
      if (
        attribute.name.includes(".") &&
        attribute.isReferenceEditable === "HIDE"
      ) {
        return true;
      }
      return false; // default
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
      // Top-level fields → normal rule
      isFieldEditable = !isViewMode;
    }
    // const isFieldEditable = !isViewMode && attribute.isReferenceEditable === "EDIT";
    const value = formData[fieldName];

    const renderLabel = (label: string) => (
      <>
        {label}
        {isRequired && (
          <span style={{ color: STYLE_GUIDE?.COLORS?.primaryDark }}> *</span>
        )}
      </>
    );

    // In view mode, just display value
    // if (isViewMode) {
    //   let displayValue = value ?? "-";
    //   // Handle dates
    //   if (attribute.type === "date" && displayValue !== "-") {
    //     displayValue = dayjs(displayValue).format("DD-MMM-YYYY");
    //   }
    //   // Handle array
    //   if (Array.isArray(displayValue) && displayValue.length === 0) {
    //     displayValue = "No data";
    //   } else if (Array.isArray(displayValue)) {
    //     displayValue = displayValue.join(", ");
    //   }
    //   return (
    //     <Box key={fieldName} sx={{ mb: 2 }}>
    //       <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500, color: STYLE_GUIDE?.COLORS?.primaryDark }}>
    //         {renderLabel(fieldLabel)}
    //       </Typography>
    //       <Box
    //         sx={{
    //           p: 1.5,
    //           borderRadius: "8px",
    //           backgroundColor: STYLE_GUIDE?.COLORS?.backgroundLight || "#f5f5f5",
    //           minHeight: "40px",
    //         }}
    //       >
    //         <Typography variant="body2" sx={{ wordBreak: "break-word", color: STYLE_GUIDE?.COLORS?.textPrimary || "#333" }}>
    //           {displayValue}
    //         </Typography>
    //       </Box>
    //     </Box>
    //   );
    // }

    if (isViewMode) {
      let displayValue: any = value ?? "-";

      // Handle dates
      if (attribute.type === "date" && displayValue !== "-") {
        displayValue = dayjs(displayValue).format("DD-MMM-YYYY");
      }

      // Handle array
      if (Array.isArray(displayValue)) {
        if (displayValue.length === 0) {
          displayValue = ["No data"];
        }
      } else {
        displayValue = [displayValue]; // single value ko bhi array bana do
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

    // Handle editable input fields (add/edit)
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
            disabled={!isFieldEditable}
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
      // case "multioption": {
      //   const options = getOptionsForAttribute(attribute.optionAttributeId);
      //   const selectedOptions = normalizeMultiOptionValue(value, options);
      //   const isReferenceMulti = !!attribute.referenceEntitySetting;
      //   return (
      //     <Autocomplete
      //       multiple
      //       freeSolo={!isReferenceMulti}
      //       key={fieldName}
      //       options={options}
      //       value={selectedOptions}
      //       onChange={(e, val) =>
      //         handleFieldChange(
      //           val.map((item) => (typeof item === "string" ? item : item.id))
      //         )
      //       }
      //       disabled={!isFieldEditable}
      //       sx={{
      //         "& .MuiChip-label": {
      //           color: "#313031ff", // Changes the chip text color to red
      //           fontWeight: 600,
      //           opacity: 1,
      //         },
      //       }}
      //       renderInput={(params) => (
      //         <TextField
      //           {...params}
      //           label={renderLabel(fieldLabel)}
      //           variant="outlined"
      //           fullWidth
      //           error={!!fieldErrors[fieldName]}
      //           helperText={fieldErrors[fieldName] || ""}
      //           sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
      //           placeholder={
      //             !isFieldEditable
      //               ? ""
      //               : isReferenceMulti
      //                 ? "Select option"
      //                 : "Type or select"
      //           }
      //         />
      //       )}
      //     />
      //   );
      // }
    // case "multioption": {
    //     const options = getOptionsForAttribute(attribute.optionAttributeId);
    //     const selectedOptions = normalizeMultiOptionValue(value, options);
    //     const isReferenceMulti = !!attribute.referenceEntitySetting;

    //     return (
    //       <Autocomplete
    //         multiple
    //         freeSolo={!isReferenceMulti}
    //         key={fieldName}
    //         options={options}
    //         value={selectedOptions}
    //         onChange={(e, val) =>
    //           handleFieldChange(
    //             val.map((item) => (typeof item === "string" ? item : item.id))
    //           )
    //         }
    //         disabled={!isFieldEditable}
    //         renderTags={(value, getTagProps) =>
    //           value.map((option, index) => (
    //             <Chip
    //               key={index}
    //               label={typeof option === "string" ? option : option.label} // ✅ yaha fix
    //               {...getTagProps({ index })}
    //               // Style differently if disabled
    //               sx={{
    //                 color: !isFieldEditable ? "#000000ff" : "#4b4949ff", // darker text when disabled
    //                 fontWeight: 600,
    //                 opacity: !isFieldEditable ? 1 : 0.9, // remove fade
    //                 pointerEvents: "none", // disable hover/click on chips
    //                 "& .MuiChip-deleteIcon": {
    //                   display: !isFieldEditable ? "none" : "block", // hide X if disabled
    //                 },
    //                 backgroundColor: !isFieldEditable ? "#fdeeeeff" : undefined,
    //               }}
    //             />
    //           ))
    //         }
    //         sx={{
    //           "& .MuiOutlinedInput-root": {
    //             borderRadius: "8px",
    //           },
    //         }}
    //         renderInput={(params) => (
    //           <TextField
    //             {...params}
    //             label={renderLabel(fieldLabel)}
    //             variant="outlined"
    //             fullWidth
    //             error={!!fieldErrors[fieldName]}
    //             helperText={fieldErrors[fieldName] || ""}
    //             placeholder={
    //               !isFieldEditable
    //                 ? ""
    //                 : isReferenceMulti
    //                   ? "Select option"
    //                   : "Type or select"
    //             }
    //           />
    //         )}
    //       />
    //     );
    //   }  
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
      disabled={!isFieldEditable}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            key={index}
            label={typeof option === "string" ? option : option.label}
            {...getTagProps({ index })}
            sx={{
              color: "#000000ff",             // Dark text
              fontWeight: 500,
              opacity: 1,                   // No fade
              pointerEvents: !isFieldEditable ? "none" : "auto",
              "& .MuiChip-deleteIcon": {
                display: !isFieldEditable ? "none" : "block", // Hide X
              },
              backgroundColor: !isFieldEditable ? "#cfcfcf" : "#fdeeee", // Solid fill when disabled
              border: !isFieldEditable ? "1px solid #b3b3b3" : "none",
            }}
          />
        ))
      }
      sx={{
        "& .MuiOutlinedInput-root": { borderRadius: "8px" },
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

    // Two-column layout for add/edit/view
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
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  variant="h6"
                  sx={{ color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5" }}
                >
                  {modalMode === "add"
                    ? "Add"
                    : modalMode === "edit"
                      ? "Edit"
                      : "View"}
                </Typography>
                {/* {modalMode === "view" && (
                  <Tooltip title="Edit">
                    <IconButton
                      onClick={switchToEditMode}
                      sx={{
                        color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Tooltip>
                )} */}
              </Box>
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
            {renderModalFields()}
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
            </Box>
          </Box>
        </Box>
      )}
      <FilterNotivixDataModal
        open={openModal && modalMode === "filter"}
        onClose={handleCancel}
        onApply={handleSaveClick}
        formData={formData}
        listCurrentData={listCurrentData}
        sourceVersionData={sourceVersionData}
        setFormData={setFormData}
      />
      <ConfirmationDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmDelete}
        deleteId={deleteId}
      />
    </>
  );
};

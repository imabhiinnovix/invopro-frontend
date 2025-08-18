

// import * as React from "react";
// import {
//   Box,
//   Typography,
//   TextField,
//   Button,
//   Tooltip,
//   Checkbox,
//   FormControlLabel,
//   Select,
//   MenuItem,
//   FormControl,
//   InputLabel,
//   Autocomplete,
//   IconButton,
// } from "@mui/material";
// import { STYLE_GUIDE } from "../../styles";
// import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
// import { FilterModal } from "./FilterModal";
// import { DatePicker } from "@mui/x-date-pickers/DatePicker";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import dayjs from "dayjs";
// import { FilterNotivixDataModal } from "./FilterNotivixDataModal";
// import CloseIcon from "@mui/icons-material/Close";
// import EditIcon from "@mui/icons-material/Edit";

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
//   handleSave: () => void;
//   setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
//   // Add a new prop to handle switching to edit mode
//   // switchToEditMode: () => void;
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
//   switchToEditMode,
// }) => {
//   console.log("Modal Open:", listCurrentData);

//   // Function to get options for a given attribute ID
//   const getOptionsForAttribute = (attributeId: string) => {
//     const attribute = attributeListData.find(attr => attr._id === attributeId);
//     if (!attribute || !attribute.attributeValue) return [];
    
//     // Map the new structure to the format needed for Autocomplete
//     return attribute.attributeValue.map((item: any) => ({
//       id: item._id,
//       label: item.value
//     }));
//   };

//   // Render view mode field (non-editable display)
//   const renderViewField = (attribute: any) => {
//     const fieldName = attribute.mappingName;
//     const fieldLabel = attribute.name;
//     const value = formData[fieldName] || "-";
    
//     return (
//       <Box 
//         key={fieldName} 
//         sx={{ 
//           mb: 2,
//           display: "flex",
//           flexDirection: "column"
//         }}
//       >
//         <Typography
//           variant="body2"
//           sx={{
//             mb: 0.5,
//             color: STYLE_GUIDE?.COLORS?.textSecondary || "#666",
//             fontWeight: 500,
//             whiteSpace: "nowrap",
//             overflow: "hidden",
//             textOverflow: "ellipsis"
//           }}
//         >
//           {fieldLabel}
//         </Typography>
//         <Box
//           sx={{
//             p: 1.5,
//             borderRadius: "8px",
//             backgroundColor: STYLE_GUIDE?.COLORS?.backgroundLight || "#f5f5f5",
//             color: STYLE_GUIDE?.COLORS?.textPrimary || "#333",
//             minHeight: "40px", // Minimum height to ensure consistency
//             display: "flex",
//             alignItems: "center",
//             wordBreak: "break-word", // Allow long words to break
//             overflow: "hidden" // Hide overflow content
//           }}
//         >
//           {value}
//         </Box>
//       </Box>
//     );
//   };

//   // Render form fields based on attributes
//   const renderModalFields = () => {
//     // For view/edit modes, use the attributes from the entity
//     if (modalMode === "view" || modalMode === "edit" || modalMode === "add") {
//       const attributes = listCurrentData?.entityId?.attributes || [];
      
//       if (attributes.length === 0) {
//         return <Typography>No attributes available to display.</Typography>;
//       }

//       // For view mode, use a different rendering
//       if (modalMode === "view") {
//         // Create pairs of attributes for two-column layout
//         const attributePairs = [];
//         for (let i = 0; i < attributes.length; i += 2) {
//           attributePairs.push([attributes[i], attributes[i + 1]]);
//         }

//         return (
//           <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
//             {attributePairs.map((pair, index) => (
//               <Box key={index} sx={{ display: "flex", gap: 2 }}>
//                 {/* First column */}
//                 <Box sx={{ flex: 1 }}>
//                   {renderViewField(pair[0])}
//                 </Box>
//                 {/* Second column - only if it exists */}
//                 {pair[1] && (
//                   <Box sx={{ flex: 1 }}>
//                     {renderViewField(pair[1])}
//                   </Box>
//                 )}
//               </Box>
//             ))}
//           </Box>
//         );
//       }

//       // Split attributes into two arrays for two-column layout (for edit and add modes)
//       const firstColumnAttributes = attributes.filter((_, index) => index % 2 === 0);
//       const secondColumnAttributes = attributes.filter((_, index) => index % 2 === 1);

//       // For edit and add modes, use the existing form fields
//       const renderAttributeField = (attribute: any) => {
//         const fieldName = attribute.mappingName;
//         const fieldLabel = attribute.name;
//         const fieldType = attribute.type;
//         const isDisabled = modalMode === "view";

//         // Render different field types based on the attribute type
//         switch (fieldType) {
//           case "boolean":
//             return (
//               <FormControlLabel
//                 key={fieldName}
//                 control={
//                   <Checkbox
//                     checked={!!formData[fieldName]}
//                     onChange={(e) =>
//                       setFormData((prev) => ({
//                         ...prev,
//                         [fieldName]: e.target.checked,
//                       }))
//                     }
//                     sx={{ color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5" }}
//                   />
//                 }
//                 label={fieldLabel}
//                 sx={{ mb: 1 }}
//               />
//             );

//           case "option":
//             // Get options using the optionAttributeId
//             const optionOptions = getOptionsForAttribute(attribute.optionAttributeId);
            
//             // Find the currently selected option
//             const selectedOption = optionOptions.find(
//               option => option.id === formData[fieldName]
//             ) || null;

//             return (
//               <Autocomplete
//                 key={fieldName}
//                 options={optionOptions}
//                 getOptionLabel={(option) => option?.label || ""}
//                 value={selectedOption}
//                 onChange={(e, value) =>
//                   setFormData((prev) => ({
//                     ...prev,
//                     [fieldName]: value ? value.id : "",
//                   }))
//                 }
//                 renderInput={(params) => (
//                   <TextField
//                     {...params}
//                     label={fieldLabel}
//                     variant="outlined"
//                     fullWidth
//                     disabled={isDisabled}
//                     sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
//                   />
//                 )}
//               />
//             );

//           case "multioption":
//             // Get options using the optionAttributeId
//             const multioptionOptions = getOptionsForAttribute(attribute.optionAttributeId);
            
//             // Get currently selected options (stored as comma-separated IDs)
//             const selectedOptionIds = formData[fieldName] 
//               ? formData[fieldName].split(',').map((id: string) => id.trim())
//               : [];
            
//             const selectedOptions = multioptionOptions.filter(
//               option => selectedOptionIds.includes(option.id)
//             );

//             return (
//               <Autocomplete
//                 key={fieldName}
//                 multiple
//                 options={multioptionOptions}
//                 getOptionLabel={(option) => option?.label || ""}
//                 value={selectedOptions}
//                 onChange={(e, value) =>
//                   setFormData((prev) => ({
//                     ...prev,
//                     [fieldName]: value.map(v => v.id).join(','),
//                   }))
//                 }
//                 renderInput={(params) => (
//                   <TextField
//                     {...params}
//                     label={fieldLabel}
//                     variant="outlined"
//                     fullWidth
//                     disabled={isDisabled}
//                     sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
//                   />
//                 )}
//               />
//             );

//           case "date":
//             return (
//               <LocalizationProvider key={fieldName} dateAdapter={AdapterDayjs}>
//                 <DatePicker
//                   label={fieldLabel}
//                   value={formData[fieldName] ? dayjs(formData[fieldName]) : null}
//                   onChange={(date) =>
//                     setFormData((prev) => ({
//                       ...prev,
//                       [fieldName]: date ? date.toISOString() : "",
//                     }))
//                   }
//                   disabled={isDisabled}
//                   slotProps={{
//                     textField: {
//                       variant: "outlined",
//                       fullWidth: true,
//                       sx: { "& .MuiOutlinedInput-root": { borderRadius: "8px" } }
//                     },
//                   }}
//                 />
//               </LocalizationProvider>
//             );

//           default:
//             // Default to text field
//             return (
//               <TextField
//                 key={fieldName}
//                 label={fieldLabel}
//                 value={formData[fieldName] || ""}
//                 onChange={(e) =>
//                   setFormData((prev) => ({
//                     ...prev,
//                     [fieldName]: e.target.value,
//                   }))
//                 }
//                 variant="outlined"
//                 fullWidth
//                 disabled={isDisabled}
//                 sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
//               />
//             );
//         }
//       };

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
//       // For any other mode, use columns
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
//       {/* Modal for Add/Edit/View */}
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
//           onClick={handleCloseModal}
//         >
//           <Box
//             sx={{
//               backgroundColor: STYLE_GUIDE?.COLORS?.white || "#ffffff",
//               borderRadius: "8px",
//               boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
//               p: 3,
//               width: "900px", // Fixed width of 900px for all modes
//               maxWidth: "90%",
//               maxHeight: "80vh",
//               overflowY: "auto",
//             }}
//             onClick={(e) => e.stopPropagation()}
//           >
//             {/* Modal Header with Title, Edit Button (in view mode), and Close Button */}
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
//                     ? "Edit"
//                     : "View"}
//                 </Typography>
              
//               </Box>
//               <IconButton
//                 onClick={handleCloseModal}
//                 sx={{
//                   color: STYLE_GUIDE?.COLORS?.textSecondary || "#666",
//                 }}
//               >
//                  <Tooltip title="Close">
//                 <CloseIcon />
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
//               sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 3 }}
//             >
//               <Button
//                 variant="outlined"
//                 onClick={handleCloseModal}
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
//                   onClick={handleSave}
//                   sx={{
//                     borderRadius: "8px",
//                     backgroundColor:
//                       STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
//                     color: STYLE_GUIDE?.COLORS?.white || "#ffffff",
//                     "&:hover": {
//                       backgroundColor: STYLE_GUIDE?.COLORS?.primary || "#5c6bc0",
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
//       {/* Filter Modal Component */}
//       <FilterNotivixDataModal
//         open={openModal && modalMode === "filter"}
//         onClose={handleCloseModal}
//         onApply={handleSave}
//         formData={formData}
//         listCurrentData={listCurrentData}
//         sourceVersionData={sourceVersionData}
//         setFormData={setFormData}
//       />
//       {/* Delete Confirmation Dialog Component */}
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Autocomplete,
  IconButton,
} from "@mui/material";
import { STYLE_GUIDE } from "../../styles";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { FilterModal } from "./FilterModal";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { FilterNotivixDataModal } from "./FilterNotivixDataModal";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";

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
  handleSave: (data: any) => void; // Modified to accept data
  setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  switchToEditMode: () => void;
  dataSourceId: string; // Added dataSourceId prop
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
}) => {
  console.log("Modal Open:", listCurrentData);

  // Function to get options for a given attribute ID
  const getOptionsForAttribute = (attributeId: string) => {
    const attribute = attributeListData.find(attr => attr._id === attributeId);
    if (!attribute || !attribute.attributeValue) return [];
    
    // Map the new structure to the format needed for Autocomplete
    return attribute.attributeValue.map((item: any) => ({
      id: item._id,
      label: item.value
    }));
  };

  // Function to convert form data to the required payload format
  const convertToPayload = () => {
    const rowData: Record<string, any> = {};
    
    // Get attributes from the current data
    const attributes = listCurrentData?.entityId?.attributes || [];
    
    // Process each attribute
    attributes.forEach((attribute: any) => {
      const fieldName = attribute.mappingName;
      const fieldType = attribute.type;
      const value = formData[fieldName];
      
      if (value !== undefined && value !== null && value !== "") {
        // For option and multioption types, convert ID to value
        if (fieldType === "option" || fieldType === "multioption") {
          const attributeId = attribute.optionAttributeId;
          const options = attributeListData.find(attr => attr._id === attributeId)?.attributeValue || [];
          
          if (fieldType === "option") {
            // Find the option with the matching ID
            const option = options.find((opt: any) => opt._id === value);
            if (option) {
              rowData[fieldName] = option.value;
            }
          } else if (fieldType === "multioption") {
            // Handle comma-separated IDs for multioption
            const ids = value.split(',').map((id: string) => id.trim());
            const values = ids.map(id => {
              const option = options.find((opt: any) => opt._id === id);
              return option ? option.value : null;
            }).filter(Boolean);
            rowData[fieldName] = values.join(', ');
          }
        } else if (fieldType === "date" && value) {
          // Format date to ISO string
          rowData[fieldName] = dayjs(value).toISOString();
        } else if (fieldType === "boolean") {
          // Convert boolean to string if needed
          rowData[fieldName] = value ? "true" : "false";
        } else {
          // For text and other types, use the value directly
          rowData[fieldName] = value;
        }
      }
    });
    
    return {
      dataSourceId,
      rowData
    };
  };

  // Handle save button click
  const handleSaveClick = () => {
    if (modalMode === "add" || modalMode === "edit") {
      const payload = convertToPayload();
      console.log("Payload to be sent:", payload);
      handleSave(payload);
    } else if (modalMode === "filter") {
      console.log("Applying filter:", formData);
      handleSave(formData);
    }
    handleCloseModal();
  };

  // Render view mode field (non-editable display)
  const renderViewField = (attribute: any) => {
    const fieldName = attribute.mappingName;
    const fieldLabel = attribute.name;
    const value = formData[fieldName] || "-";
    
    return (
      <Box 
        key={fieldName} 
        sx={{ 
          mb: 2,
          display: "flex",
          flexDirection: "column"
        }}
      >
        <Typography
          variant="body2"
          sx={{
            mb: 0.5,
            color: STYLE_GUIDE?.COLORS?.textSecondary || "#666",
            fontWeight: 500,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
          }}
        >
          {fieldLabel}
        </Typography>
        <Box
          sx={{
            p: 1.5,
            borderRadius: "8px",
            backgroundColor: STYLE_GUIDE?.COLORS?.backgroundLight || "#f5f5f5",
            color: STYLE_GUIDE?.COLORS?.textPrimary || "#333",
            minHeight: "40px", // Minimum height to ensure consistency
            display: "flex",
            alignItems: "center",
            wordBreak: "break-word", // Allow long words to break
            overflow: "hidden" // Hide overflow content
          }}
        >
          {value}
        </Box>
      </Box>
    );
  };

  // Render form fields based on attributes
  const renderModalFields = () => {
    // For view/edit modes, use the attributes from the entity
    if (modalMode === "view" || modalMode === "edit" || modalMode === "add") {
      const attributes = listCurrentData?.entityId?.attributes || [];
      
      if (attributes.length === 0) {
        return <Typography>No attributes available to display.</Typography>;
      }

      // For view mode, use a different rendering
      if (modalMode === "view") {
        // Create pairs of attributes for two-column layout
        const attributePairs = [];
        for (let i = 0; i < attributes.length; i += 2) {
          attributePairs.push([attributes[i], attributes[i + 1]]);
        }

        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {attributePairs.map((pair, index) => (
              <Box key={index} sx={{ display: "flex", gap: 2 }}>
                {/* First column */}
                <Box sx={{ flex: 1 }}>
                  {renderViewField(pair[0])}
                </Box>
                {/* Second column - only if it exists */}
                {pair[1] && (
                  <Box sx={{ flex: 1 }}>
                    {renderViewField(pair[1])}
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        );
      }

      // Split attributes into two arrays for two-column layout (for edit and add modes)
      const firstColumnAttributes = attributes.filter((_, index) => index % 2 === 0);
      const secondColumnAttributes = attributes.filter((_, index) => index % 2 === 1);

      // For edit and add modes, use the existing form fields
      const renderAttributeField = (attribute: any) => {
        const fieldName = attribute.mappingName;
        const fieldLabel = attribute.name;
        const fieldType = attribute.type;
        const isDisabled = modalMode === "view";

        // Render different field types based on the attribute type
        switch (fieldType) {
          case "boolean":
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
                    sx={{ color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5" }}
                  />
                }
                label={fieldLabel}
                sx={{ mb: 1 }}
              />
            );

          case "option":
            // Get options using the optionAttributeId
            const optionOptions = getOptionsForAttribute(attribute.optionAttributeId);
            
            // Find the currently selected option
            const selectedOption = optionOptions.find(
              option => option.id === formData[fieldName]
            ) || null;

            return (
              <Autocomplete
                key={fieldName}
                options={optionOptions}
                getOptionLabel={(option) => option?.label || ""}
                value={selectedOption}
                onChange={(e, value) =>
                  setFormData((prev) => ({
                    ...prev,
                    [fieldName]: value ? value.id : "",
                  }))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={fieldLabel}
                    variant="outlined"
                    fullWidth
                    disabled={isDisabled}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                  />
                )}
              />
            );

          case "multioption":
            // Get options using the optionAttributeId
            const multioptionOptions = getOptionsForAttribute(attribute.optionAttributeId);
            
            // Get currently selected options (stored as comma-separated IDs)
            const selectedOptionIds = formData[fieldName] 
              ? formData[fieldName].split(',').map((id: string) => id.trim())
              : [];
            
            const selectedOptions = multioptionOptions.filter(
              option => selectedOptionIds.includes(option.id)
            );

            return (
              <Autocomplete
                key={fieldName}
                multiple
                options={multioptionOptions}
                getOptionLabel={(option) => option?.label || ""}
                value={selectedOptions}
                onChange={(e, value) =>
                  setFormData((prev) => ({
                    ...prev,
                    [fieldName]: value.map(v => v.id).join(','),
                  }))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={fieldLabel}
                    variant="outlined"
                    fullWidth
                    disabled={isDisabled}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                  />
                )}
              />
            );

          case "date":
            return (
              <LocalizationProvider key={fieldName} dateAdapter={AdapterDayjs}>
                <DatePicker
                  label={fieldLabel}
                  value={formData[fieldName] ? dayjs(formData[fieldName]) : null}
                  onChange={(date) =>
                    setFormData((prev) => ({
                      ...prev,
                      [fieldName]: date ? date.toISOString() : "",
                    }))
                  }
                  disabled={isDisabled}
                  slotProps={{
                    textField: {
                      variant: "outlined",
                      fullWidth: true,
                      sx: { "& .MuiOutlinedInput-root": { borderRadius: "8px" } }
                    },
                  }}
                />
              </LocalizationProvider>
            );

          default:
            // Default to text field
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
                disabled={isDisabled}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
              />
            );
        }
      };

      return (
        <>
          {/* First column */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {firstColumnAttributes.map(renderAttributeField)}
          </Box>
          {/* Second column */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {secondColumnAttributes.map(renderAttributeField)}
          </Box>
        </>
      );
    } else {
      // For any other mode, use columns
      const fields = columns
        .filter((col) => col.field !== "actions" && col.field !== "_id")
        .map((col) => (
          <TextField
            key={col.field}
            label={col.headerName}
            value={formData[col.field] || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, [col.field]: e.target.value }))
            }
            variant="outlined"
            fullWidth
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
          />
        ));
      return fields.length > 0 ? (
        fields
      ) : (
        <Typography>No fields available to display.</Typography>
      );
    }
  };

  return (
    <>
      {/* Modal for Add/Edit/View */}
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
          onClick={handleCloseModal}
        >
          <Box
            sx={{
              backgroundColor: STYLE_GUIDE?.COLORS?.white || "#ffffff",
              borderRadius: "8px",
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
              p: 3,
              width: "900px", // Fixed width of 900px for all modes
              maxWidth: "90%",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header with Title, Edit Button (in view mode), and Close Button */}
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
                {modalMode === "view" && (
                  <Tooltip title="Edit">
                    <IconButton
                      onClick={switchToEditMode}
                      sx={{
                        color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
              <IconButton
                onClick={handleCloseModal}
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
                display: modalMode === "view" ? "block" : "grid",
                gridTemplateColumns: modalMode === "view" ? "none" : "1fr 1fr",
                gap: 2,
              }}
            >
              {renderModalFields()}
            </Box>
            <Box
              sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 3 }}
            >
              <Button
                variant="outlined"
                onClick={handleCloseModal}
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
                  onClick={handleSaveClick} // Use the new save handler
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
              )}
            </Box>
          </Box>
        </Box>
      )}
      {/* Filter Modal Component */}
      <FilterNotivixDataModal
        open={openModal && modalMode === "filter"}
        onClose={handleCloseModal}
        onApply={handleSaveClick} // Use the same save handler for filter
        formData={formData}
        listCurrentData={listCurrentData}
        sourceVersionData={sourceVersionData}
        setFormData={setFormData}
      />
      {/* Delete Confirmation Dialog Component */}
      <DeleteConfirmationDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmDelete}
        deleteId={deleteId}
      />
    </>
  );
};
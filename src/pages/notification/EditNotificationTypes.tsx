

// import * as React from "react";
// import { useState, useEffect } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { toast } from "react-toastify";
// import {
//   Box,
//   Card,
//   CardContent,
//   Typography,
//   TextField,
//   Select,
//   MenuItem,
//   Button,
//   IconButton,
//   FormControl,
//   InputLabel,
//   Grid,
//   Accordion,
//   AccordionSummary,
//   AccordionDetails,
//   CircularProgress,
// } from "@mui/material";
// import AddIcon from "@mui/icons-material/Add";
// import CloseIcon from "@mui/icons-material/Close";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// import ChevronRightIcon from "@mui/icons-material/ChevronRight";
// import useGet from "../../hooks/useGet";
// import usePost from "../../hooks/usePost";
// import usePut from "../../hooks/usePut";
// import { GET, POST } from "../../services/apiRoutes";
// import { STYLE_GUIDE } from "../../styles";
// import { useSelector } from "react-redux";
// import { RootState } from "../../reducers";
// import Frequency from "./Frequency";

// // Error Boundary Component
// class ErrorBoundary extends React.Component {
//   state = { hasError: false };

//   static getDerivedStateFromError(error) {
//     return { hasError: true };
//   }

//   render() {
//     if (this.state.hasError) {
//       return <Typography color="error">Something went wrong.</Typography>;
//     }
//     return this.props.children;
//   }
// }

// // ConditionRuleBuilder Component
// const ConditionRuleBuilder = ({
//   onChange,
//   notificationTypeList,
//   fieldOptions,
//   notificationResponse,
//   initialConditionGroup,
//   initialNotificationData, // Add this prop
// }) => {
//   const organizationId = useSelector(
//     (state: RootState) => state.userPermission?.currentUser?.organizationId?._id
//   );
  
//   // Initialize with the initial data passed from parent
//   const [notification, setNotification] = useState({
//     name: initialNotificationData?.name || "",
//     entityId: initialNotificationData?.entityId || "",
//     conditionGroup: initialConditionGroup || {
//       logic: "AND",
//       rules: [],
//     },
//   });

//   const operatorList = usePost(["operatorList"]);

//   useEffect(() => {
//     operatorList.mutate({
//       url: POST.OPERATOR_LIST,
//       payload: { fieldType: "all" },
//     });
//   }, []);

//   // Update notification when initial data changes
//   useEffect(() => {
//     if (initialNotificationData) {
//       setNotification(prev => ({
//         ...prev,
//         name: initialNotificationData.name || "",
//         entityId: initialNotificationData.entityId || "",
//       }));
//     }
//   }, [initialNotificationData]);

//   // Update condition group when it changes
//   useEffect(() => {
//     if (initialConditionGroup) {
//       setNotification(prev => ({
//         ...prev,
//         conditionGroup: initialConditionGroup,
//       }));
//     }
//   }, [initialConditionGroup]);

//   const statusOptions = [
//     "open",
//     "rated to search",
//     "rated to draft ih",
//     "rated to draft oc",
//     "review rate to draft",
//     "filing requested",
//     "submitted",
//   ];
//   const caseTypeOptions = ["PRI", "PRO", "TRA", "DES"];
//   const countryCodeOptions = ["EP", "IN", "WO", "FAM", "US", "CN", "JP"];
//   const timeUnitOptions = [
//     { value: "M", label: "Month (M)" },
//     { value: "d", label: "Days (d)" },
//     { value: "y", label: "Yearly (y)" },
//   ];

//   const generateId = () => Math.random().toString(36).substr(2, 9);

//   const addRule = (groupPath) => {
//     const newRule = {
//       id: generateId(),
//       field: "",
//       operator: "",
//       value: "",
//       timeUnit: "",
//     };
//     const updatedNotification = { ...notification };
//     const group = getGroupByPath(updatedNotification.conditionGroup, groupPath);
//     group.rules.push(newRule);
//     setNotification(updatedNotification);
//   };

//   const addGroup = (groupPath) => {
//     const newGroup = {
//       id: generateId(),
//       logic: "AND",
//       rules: [],
//     };
//     const updatedNotification = { ...notification };
//     const group = getGroupByPath(updatedNotification.conditionGroup, groupPath);
//     group.rules.push(newGroup);
//     setNotification(updatedNotification);
//   };

//   const removeItem = (groupPath, index) => {
//     const updatedNotification = { ...notification };
//     const group = getGroupByPath(updatedNotification.conditionGroup, groupPath);
//     group.rules.splice(index, 1);
//     setNotification(updatedNotification);
//   };

//   const updateRule = (groupPath, index, field, value) => {
//     const updatedNotification = { ...notification };
//     const group = getGroupByPath(updatedNotification.conditionGroup, groupPath);
//     group.rules[index][field] = value;
//     if (field === "operator") {
//       const selectedField = fieldOptions.find(
//         (f) => f.value === group.rules[index].field
//       );
//       const operators = operatorList.data?.data?.find(
//         (op) => op.fieldType === selectedField?.type
//       )?.operators;
//       const selectedOperator = operators?.find(
//         (op) => op.operatorKey === value
//       );
//       if (selectedOperator && !selectedOperator.valueRequired) {
//         group.rules[index].value = "";
//         group.rules[index].timeUnit = "";
//       }
//     }
//     setNotification(updatedNotification);
//   };

//   const updateGroupLogic = (groupPath, logic) => {
//     const updatedNotification = { ...notification };
//     const group = getGroupByPath(updatedNotification.conditionGroup, groupPath);
//     group.logic = logic;
//     setNotification(updatedNotification);
//   };

//   const getGroupByPath = (root, path) => {
//     if (path.length === 0) return root;
//     let current = root;
//     for (const index of path) {
//       current = current.rules[index];
//     }
//     return current;
//   };

//   const validateValue = (rule) => {
//     const field = fieldOptions.find((f) => f.value === rule.field);
//     const operators =
//       operatorList.data?.data?.find((op) => op.fieldType === field?.type)
//         ?.operators || [];
//     const selectedOperator = operators?.find(
//       (op) => op.operatorKey === rule.operator
//     );
//     return selectedOperator?.valueRequired && !rule.value;
//   };

//   const renderValueInput = (rule, groupPath, index) => {
//     const field = fieldOptions.find((f) => f.value === rule.field);
//     const operators =
//       operatorList.data?.data?.find((op) => op.fieldType === field?.type)
//         ?.operators || [];
//     const selectedOperator = operators?.find(
//       (op) => op.operatorKey === rule.operator
//     );
//     const valueRequired = selectedOperator?.valueRequired ?? true;
//     const updateValue = (value) => updateRule(groupPath, index, "value", value);
//     const updateTimeUnit = (value) =>
//       updateRule(groupPath, index, "timeUnit", value);

//     if (!field || !valueRequired) {
//       return null;
//     }

//     switch (field.type) {
//       case "boolean":
//         return (
//           <FormControl fullWidth size="small" error={validateValue(rule)}>
//             <InputLabel>Select...</InputLabel>
//             <Select
//               value={rule.value}
//               onChange={(e) => updateValue(e.target.value === "true")}
//               label="Select..."
//             >
//               <MenuItem value="">Select...</MenuItem>
//               <MenuItem value="true">True</MenuItem>
//               <MenuItem value="false">False</MenuItem>
//             </Select>
//             {validateValue(rule) && (
//               <Typography color="error" variant="caption">
//                 Value is required
//               </Typography>
//             )}
//           </FormControl>
//         );
//       case "select":
//         if (rule.field === "status") {
//           return rule.operator === "in" ? (
//             <FormControl fullWidth size="small" error={validateValue(rule)}>
//               <InputLabel>Select...</InputLabel>
//               <Select
//                 multiple
//                 value={rule.value ? rule.value.split(",") : []}
//                 onChange={(e) => updateValue(e.target.value.join(","))}
//                 label="Select..."
//                 sx={{ minHeight: 80 }}
//               >
//                 {statusOptions.map((option) => (
//                   <MenuItem key={option} value={option}>
//                     {option}
//                   </MenuItem>
//                 ))}
//               </Select>
//               {validateValue(rule) && (
//                 <Typography color="error" variant="caption">
//                   Value is required
//                 </Typography>
//               )}
//             </FormControl>
//           ) : (
//             <FormControl fullWidth size="small" error={validateValue(rule)}>
//               <InputLabel>Select...</InputLabel>
//               <Select
//                 value={rule.value}
//                 onChange={(e) => updateValue(e.target.value)}
//                 label="Select..."
//               >
//                 <MenuItem value="">Select...</MenuItem>
//                 {statusOptions.map((option) => (
//                   <MenuItem key={option} value={option}>
//                     {option}
//                   </MenuItem>
//                 ))}
//               </Select>
//               {validateValue(rule) && (
//                 <Typography color="error" variant="caption">
//                   Value is required
//                 </Typography>
//               )}
//             </FormControl>
//           );
//         }
//         if (rule.field === "case_type") {
//           return rule.operator === "in" ? (
//             <FormControl fullWidth size="small" error={validateValue(rule)}>
//               <InputLabel>Select...</InputLabel>
//               <Select
//                 multiple
//                 value={rule.value ? rule.value.split(",") : []}
//                 onChange={(e) => updateValue(e.target.value.join(","))}
//                 label="Select..."
//                 sx={{ minHeight: 80 }}
//               >
//                 {caseTypeOptions.map((option) => (
//                   <MenuItem key={option} value={option}>
//                     {option}
//                   </MenuItem>
//                 ))}
//               </Select>
//               {validateValue(rule) && (
//                 <Typography color="error" variant="caption">
//                   Value is required
//                 </Typography>
//               )}
//             </FormControl>
//           ) : (
//             <FormControl fullWidth size="small" error={validateValue(rule)}>
//               <InputLabel>Select...</InputLabel>
//               <Select
//                 value={rule.value}
//                 onChange={(e) => updateValue(e.target.value)}
//                 label="Select..."
//               >
//                 <MenuItem value="">Select...</MenuItem>
//                 {caseTypeOptions.map((option) => (
//                   <MenuItem key={option} value={option}>
//                     {option}
//                   </MenuItem>
//                 ))}
//               </Select>
//               {validateValue(rule) && (
//                 <Typography color="error" variant="caption">
//                   Value is required
//                 </Typography>
//               )}
//             </FormControl>
//           );
//         }
//         if (rule.field === "country_code") {
//           return rule.operator === "in" ? (
//             <FormControl fullWidth size="small" error={validateValue(rule)}>
//               <InputLabel>Select...</InputLabel>
//               <Select
//                 multiple
//                 value={rule.value ? rule.value.split(",") : []}
//                 onChange={(e) => updateValue(e.target.value.join(","))}
//                 label="Select..."
//                 sx={{ minHeight: 80 }}
//               >
//                 {countryCodeOptions.map((option) => (
//                   <MenuItem key={option} value={option}>
//                     {option}
//                   </MenuItem>
//                 ))}
//               </Select>
//               {validateValue(rule) && (
//                 <Typography color="error" variant="caption">
//                   Value is required
//                 </Typography>
//               )}
//             </FormControl>
//           ) : (
//             <FormControl fullWidth size="small" error={validateValue(rule)}>
//               <InputLabel>Select...</InputLabel>
//               <Select
//                 value={rule.value}
//                 onChange={(e) => updateValue(e.target.value)}
//                 label="Select..."
//               >
//                 <MenuItem value="">Select...</MenuItem>
//                 {countryCodeOptions.map((option) => (
//                   <MenuItem key={option} value={option}>
//                     {option}
//                   </MenuItem>
//                 ))}
//               </Select>
//               {validateValue(rule) && (
//                 <Typography color="error" variant="caption">
//                   Value is required
//                 </Typography>
//               )}
//             </FormControl>
//           );
//         }
//         return (
//           <FormControl fullWidth size="small" error={validateValue(rule)}>
//             <TextField
//               fullWidth
//               size="small"
//               value={rule.value}
//               onChange={(e) => updateValue(e.target.value)}
//               placeholder="Value"
//               variant="outlined"
//               error={validateValue(rule)}
//               sx={{ marginTop: validateValue(rule) ? "22px" : 0 }}
//             />
//             {validateValue(rule) && (
//               <Typography color="error" variant="caption">
//                 Value is required
//               </Typography>
//             )}
//           </FormControl>
//         );
//       case "date":
//         return (
//           <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
//             <FormControl fullWidth size="small" error={validateValue(rule)}>
//               <TextField
//                 fullWidth
//                 size="small"
//                 type="date"
//                 value={rule.value}
//                 onChange={(e) => updateValue(e.target.value)}
//                 placeholder="Select date"
//                 variant="outlined"
//                 InputLabelProps={{ shrink: true }}
//                 error={validateValue(rule)}
//                 sx={{ marginTop: validateValue(rule) ? "22px" : 0 }}
//               />
//               {validateValue(rule) && (
//                 <Typography color="error" variant="caption">
//                   Value is required
//                 </Typography>
//               )}
//             </FormControl>
//             <FormControl fullWidth size="small">
//               <InputLabel>Time Unit</InputLabel>
//               <Select
//                 value={rule.timeUnit}
//                 onChange={(e) => updateTimeUnit(e.target.value)}
//                 label="Time Unit"
//               >
//                 <MenuItem value="">Select...</MenuItem>
//                 {timeUnitOptions.map((option) => (
//                   <MenuItem key={option.value} value={option.value}>
//                     {option.label}
//                   </MenuItem>
//                 ))}
//               </Select>
//             </FormControl>
//           </Box>
//         );
//       default:
//         return (
//           <FormControl fullWidth size="small" error={validateValue(rule)}>
//             <TextField
//               fullWidth
//               size="small"
//               value={rule.value}
//               onChange={(e) => updateValue(e.target.value)}
//               placeholder="Value"
//               variant="outlined"
//               error={validateValue(rule)}
//               sx={{ marginTop: validateValue(rule) ? "22px" : 0 }}
//             />
//             {validateValue(rule) && (
//               <Typography color="error" variant="caption">
//                 Value is required
//               </Typography>
//             )}
//           </FormControl>
//         );
//     }
//   };

//   const RuleComponent = ({ rule, groupPath, index }) => {
//     const selectedField = fieldOptions.find((f) => f.value === rule.field);
//     const operators =
//       operatorList.data?.data?.find(
//         (op) => op.fieldType === selectedField?.type
//       )?.operators || [];

//     return (
//       <Box
//         sx={{
//           display: "flex",
//           alignItems: "center",
//           gap: 2,
//           p: 2,
//           bgcolor: "grey.100",
//           borderRadius: 2,
//           transition: "background-color 0.2s ease",
//           "&:hover": { bgcolor: "grey.200" },
//         }}
//       >
//         <FormControl fullWidth size="small">
//           <InputLabel>Select field...</InputLabel>
//           <Select
//             value={rule.field}
//             onChange={(e) => {
//               updateRule(groupPath, index, "field", e.target.value);
//               updateRule(groupPath, index, "operator", "");
//               updateRule(groupPath, index, "value", "");
//               updateRule(groupPath, index, "timeUnit", "");
//             }}
//             label="Select field..."
//           >
//             <MenuItem value="">Select field...</MenuItem>
//             {fieldOptions.map((option) => (
//               <MenuItem key={option.value} value={option.value}>
//                 {option.label}
//               </MenuItem>
//             ))}
//           </Select>
//         </FormControl>

//         <FormControl fullWidth size="small" disabled={!rule.field}>
//           <InputLabel>Select operator...</InputLabel>
//           <Select
//             value={rule.operator}
//             onChange={(e) => updateRule(groupPath, index, "operator", e.target.value)}
//             label="Select operator..."
//           >
//             <MenuItem value="">Select operator...</MenuItem>
//             {operatorList.isLoading ? (
//               <MenuItem disabled>Loading operators...</MenuItem>
//             ) : (
//               operators.map((op) => (
//                 <MenuItem key={op._id} value={op.operatorKey}>
//                   {op.operatorName}
//                 </MenuItem>
//               ))
//             )}
//           </Select>
//         </FormControl>

//         {renderValueInput(rule, groupPath, index)}

//         <IconButton
//           onClick={() => removeItem(groupPath, index)}
//           color="error"
//           aria-label="Remove rule"
//         >
//           <CloseIcon />
//         </IconButton>
//       </Box>
//     );
//   };

//   const GroupComponent = ({ group, groupPath = [], isRoot = false }) => {
//     const [collapsed, setCollapsed] = useState(false);

//     return (
//       <Box
//         sx={{
//           border: isRoot ? "2px solid" : "1px solid",
//           borderColor: isRoot ? "primary.light" : "grey.300",
//           borderRadius: 2,
//           p: 3,
//           width: isRoot ? "auto" : "auto",
//           bgcolor: isRoot ? "background.paper" : "inherit",
//           boxShadow: isRoot ? 3 : 1,
//           transition: "all 0.3s ease-in-out",
//           "&:hover": { boxShadow: 4 },
//         }}
//       >
//         <Box
//           sx={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//             mb: 3,
//           }}
//         >
//           <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
//             {!isRoot && (
//               <IconButton
//                 onClick={() => setCollapsed(!collapsed)}
//                 sx={{
//                   bgcolor: "grey.100",
//                   "&:hover": { bgcolor: "grey.200" },
//                   transition: "background-color 0.2s ease",
//                 }}
//                 aria-label="Toggle group collapse"
//               >
//                 {collapsed ? <ChevronRightIcon /> : <ExpandMoreIcon />}
//               </IconButton>
//             )}
//             <Typography
//               variant="subtitle2"
//               sx={{
//                 fontWeight: "medium",
//                 color: "text.secondary",
//                 fontSize: "0.9rem",
//               }}
//             >
//               {isRoot ? "Root Condition Group" : "Nested Group"}
//             </Typography>
//             <FormControl size="small">
//               <InputLabel>Logic</InputLabel>
//               <Select
//                 value={group.logic}
//                 onChange={(e) => updateGroupLogic(groupPath, e.target.value)}
//                 label="Logic"
//                 sx={{ fontSize: "0.85rem" }}
//               >
//                 <MenuItem value="AND">AND</MenuItem>
//                 <MenuItem value="OR">OR</MenuItem>
//               </Select>
//             </FormControl>
//           </Box>

//           <Box sx={{ display: "flex", gap: 1 }}>
//             <Button
//               variant="contained"
//               color="primary"
//               size="small"
//               onClick={() => addRule(groupPath)}
//               startIcon={<AddIcon />}
//               sx={{
//                 fontSize: "0.85rem",
//                 borderRadius: 1,
//                 px: 2,
//                 py: 0.5,
//                 transition: "all 0.2s ease",
//                 "&:hover": { transform: "scale(1.05)" },
//               }}
//             >
//               Rule
//             </Button>
//             <Button
//               variant="contained"
//               color="success"
//               size="small"
//               onClick={() => addGroup(groupPath)}
//               startIcon={<AddIcon />}
//               sx={{
//                 fontSize: "0.85rem",
//                 borderRadius: 1,
//                 px: 2,
//                 py: 0.5,
//                 transition: "all 0.2s ease",
//                 "&:hover": { transform: "scale(1.05)" },
//               }}
//             >
//               Group
//             </Button>
//             {!isRoot && (
//               <IconButton
//                 onClick={() => {
//                   const parentPath = groupPath.slice(0, -1);
//                   const index = groupPath[groupPath.length - 1];
//                   removeItem(parentPath, index);
//                 }}
//                 color="error"
//                 aria-label="Remove group"
//               >
//                 <CloseIcon />
//               </IconButton>
//             )}
//           </Box>
//         </Box>

//         {!collapsed && (
//           <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
//             {group.rules.map((rule, index) => (
//               <Box key={rule.id || index}>
//                 {index > 0 && (
//                   <Box sx={{ py: 1 }}>
//                     <Typography
//                       variant="caption"
//                       sx={{
//                         pl: 1,
//                         fontSize: "0.75rem",
//                         color: "text.secondary",
//                         fontWeight: "medium",
//                         bgcolor: "grey.100",
//                         borderRadius: "12px",
//                         px: 1.5,
//                         py: 0.5,
//                         display: "inline-block",
//                         transition: "all 0.2s ease",
//                       }}
//                     >
//                       {group.logic}
//                     </Typography>
//                   </Box>
//                 )}
//                 {rule.logic ? (
//                   <GroupComponent
//                     group={rule}
//                     groupPath={[...groupPath, index]}
//                   />
//                 ) : (
//                   <RuleComponent
//                     rule={rule}
//                     groupPath={groupPath}
//                     index={index}
//                   />
//                 )}
//               </Box>
//             ))}
//           </Box>
//         )}
//       </Box>
//     );
//   };

//   useEffect(() => {
//     const transformNotificationData = () => {
//       const conditionGroups = [];

//       const flattenGroup = (group, path = []) => {
//         const conditions = [];
//         group.rules.forEach((rule) => {
//           if (rule.logic) {
//             conditionGroups.push({
//               group_operator: rule.logic,
//               conditions: [],
//             });
//             flattenGroup(rule, [...path, conditionGroups.length - 1]);
//           } else {
//             const fieldOption = fieldOptions.find(
//               (f) => f.value === rule.field
//             );
//             if (fieldOption) {
//               conditions.push({
//                 attributeId: fieldOption.attributeId,
//                 operator: rule.operator,
//                 value: rule.value,
//                 timeUnit: rule.timeUnit || "",
//               });
//             }
//           }
//         });
//         if (conditions.length > 0) {
//           conditionGroups.push({
//             group_operator: group.logic,
//             conditions,
//           });
//         }
//       };

//       flattenGroup(notification.conditionGroup);
//       return {
//         name: notification.name,
//         organizationId: organizationId,
//         entityId: notification.entityId,
//         triggerFieldId: "",
//         isActive: true,
//         conditionGroups,
//       };
//     };

//     onChange(transformNotificationData());
//   }, [notification, fieldOptions, onChange, organizationId]);

//   return (
//     <Box
//       sx={{
//         maxWidth: "1200px",
//         mx: "auto",
//         p: 4,
//         bgcolor: "background.paper",
//         borderRadius: 2,
//       }}
//     >
//       <Box sx={{ mb: 4, p: 3, bgcolor: "grey.50", borderRadius: 2 }}>
//         <Grid container spacing={2}>
//           <Grid item xs={12} sm={4}>
//             <TextField
//               fullWidth
//               label="Name"
//               value={notification.name}
//               onChange={(e) =>
//                 setNotification({ ...notification, name: e.target.value })
//               }
//               variant="outlined"
//               size="small"
//               required
//               error={!notification.name}
//               helperText={!notification.name ? "Name is required" : ""}
//             />
//           </Grid>
//           <Grid item xs={12} sm={4}>
//             <FormControl fullWidth size="small">
//               <InputLabel>Entity</InputLabel>
//               <Select
//                 value={notification.entityId}
//                 onChange={(e) =>
//                   setNotification({ ...notification, entityId: e.target.value })
//                 }
//                 label="Entity"
//                 required
//                 error={!notification.entityId}
//               >
//                 <MenuItem value="">Select Entity...</MenuItem>
//                 {notificationTypeList.data?.data?.map((entity) => (
//                   <MenuItem key={entity._id} value={entity._id}>
//                     {entity.name}
//                   </MenuItem>
//                 ))}
//               </Select>
//               {!notification.entityId && (
//                 <Typography color="error" variant="caption">
//                   Entity is required
//                 </Typography>
//               )}
//             </FormControl>
//           </Grid>
//         </Grid>
//       </Box>
//       <GroupComponent group={notification.conditionGroup} isRoot={true} />
//     </Box>
//   );
// };

// // EditNotificationTypes Component
// export default function EditNotificationTypes() {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();
//   const [expanded, setExpanded] = useState({ condition: true, reminder: true });
//   const [notificationData, setNotificationData] = useState({});
//   const [fieldOptions, setFieldOptions] = useState([]);
//   const [notificationTypeId, setNotificationTypeId] = useState<string | null>(id || null);
//   const [initialConditionGroup, setInitialConditionGroup] = useState(null);
//   const [isDataLoaded, setIsDataLoaded] = useState(false);

//   const notificationTypeList = useGet(
//     ["notificationTypeList"],
//     `${GET.Entity_List}`,
//     true
//   );
//   const notificationDetails = useGet(
//     ["notificationDetails", id],
//     id ? `/notivix/notification-setting/type/${id}` : null,
//     !!id
//   );
//   const updateNotification = usePost(["updateNotification"]);
//   const notificationResponse = usePost(["notificationResponse"]);

//   const handleAccordionChange = (panel) => (event, isExpanded) => {
//     setExpanded((prev) => ({ ...prev, [panel]: isExpanded }));
//   };

//   // Transform backend response to condition group format
//   const transformBackendToConditionGroup = (conditionGroups, availableFieldOptions) => {
//     const generateId = () => Math.random().toString(36).substr(2, 9);
    
//     if (!conditionGroups || conditionGroups.length === 0) {
//       return { logic: "AND", rules: [] };
//     }

//     const rootGroup = {
//       logic: conditionGroups[0].group_operator || "AND",
//       rules: [],
//     };

//     conditionGroups.forEach((group) => {
//       group.conditions.forEach((condition) => {
//         // Find the field by attributeId instead of mappingName
//         const fieldOption = availableFieldOptions.find(
//           (f) => f.attributeId === condition.attributeId
//         );
        
//         if (fieldOption) {
//           rootGroup.rules.push({
//             id: generateId(),
//             field: fieldOption.value, // Use mappingName for the field value
//             operator: condition.operator,
//             value: condition.value,
//             timeUnit: condition.timeUnit || "",
//           });
//         } else {
//           // If field not found, still add the rule but with attributeId as field
//           console.warn(`Field with attributeId ${condition.attributeId} not found in fieldOptions`);
//           rootGroup.rules.push({
//             id: generateId(),
//             field: condition.attributeId,
//             operator: condition.operator,
//             value: condition.value,
//             timeUnit: condition.timeUnit || "",
//           });
//         }
//       });
//     });

//     return rootGroup;
//   };

//   // First, load notification details and set basic data
//   useEffect(() => {
//     if (notificationDetails.data?.success && notificationDetails.data?.data && !isDataLoaded) {
//       const data = notificationDetails.data.data;
//       console.log("Backend data:", data);
      
//       setNotificationData({
//         name: data.name || "",
//         organizationId: data.organizationId || "",
//         entityId: data.entityId || "",
//         triggerFieldId: "",
//         isActive: data.isActive || true,
//         conditionGroups: data.conditionGroups || [],
//       });
      
//       setIsDataLoaded(true);
//     }
//   }, [notificationDetails.data, isDataLoaded]);

//   // Then, set field options when entity is available
// //   useEffect(() => {
// //     if (notificationData.entityId && notificationTypeList.data?.data) {
// //       const selectedEntity = notificationTypeList.data.data.find(
// //         (entity) => entity._id === notificationData.entityId
// //       );
      
// //       if (selectedEntity && selectedEntity.attributes) {
// //         const newFieldOptions = selectedEntity.attributes.map((attr) => ({
// //           value: attr.mappingName,
// //           label: attr.name,
// //           type: attr.type,
// //           attributeId: attr._id,
// //         }));
        
// //         console.log("Field options:", newFieldOptions);
// //         setFieldOptions(newFieldOptions);
// //       } else {
// //         setFieldOptions([]);
// //       }
// //     } else {
// //       setFieldOptions([]);
// //     }
// //   }, [notificationData.entityId, notificationTypeList.data]);

//   // Finally, transform condition groups when both data and field options are available
//   useEffect(() => {
//     if (
//       isDataLoaded && 
//       fieldOptions.length > 0 && 
//       notificationData.conditionGroups && 
//       notificationData.conditionGroups.length > 0 &&
//       !initialConditionGroup
//     ) {
//       console.log("Transforming condition groups:", notificationData.conditionGroups);
//       console.log("Available field options:", fieldOptions);
      
//       const transformedGroup = transformBackendToConditionGroup(
//         notificationData.conditionGroups,
//         fieldOptions
//       );
      
//       console.log("Transformed condition group:", transformedGroup);
//       setInitialConditionGroup(transformedGroup);
//     }
//   }, [isDataLoaded, fieldOptions, notificationData.conditionGroups, initialConditionGroup]);

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     if (!notificationData.name || !notificationData.entityId) {
//       toast.error("Name and Entity are required fields.");
//       return;
//     }

//     try {
//       const response = await updateNotification.mutateAsync({
//         url: `/notivix/notification-setting/type/update/${id}`,
//         payload: notificationData,
//       });

//       if (response.success) {
//         toast.success("Notification updated successfully!");
//         navigate("/notivix/notification-types");
//       } else {
//         throw new Error("Notification update failed");
//       }
//     } catch (error) {
//       console.error("Error updating notification:", error);
//       toast.error("Failed to update notification. Please try again.");
//     }
//   };

//   return (
//     <Box
//       sx={{
//         flexGrow: 1,
//         p: 3,
//         ml: { xs: 0 },
//         backgroundColor: STYLE_GUIDE.COLORS.backgroundLight,
//         minHeight: "100vh",
//       }}
//     >
//       <Typography
//         variant="h4"
//         sx={{
//           mb: 3,
//           fontWeight: 400,
//           color: STYLE_GUIDE.COLORS.primaryDark,
//         }}
//       >
//         Edit Notification Type
//       </Typography>
//       <Card
//         sx={{
//           backgroundColor: STYLE_GUIDE.COLORS.white,
//           borderRadius: 2,
//           boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
//         }}
//       >
//         <CardContent sx={{ p: 3 }}>
//           {notificationDetails.isLoading ? (
//             <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
//               <CircularProgress />
//             </Box>
//           ) : notificationDetails.isError ? (
//             <Typography color="error">
//               Failed to load notification type details. Please try again.
//             </Typography>
//           ) : (
//             <Box component="form" onSubmit={handleSubmit}>
//               <Accordion
//                 expanded={expanded.condition}
//                 onChange={handleAccordionChange("condition")}
//                 sx={{ mb: 2, borderRadius: 2, boxShadow: 1 }}
//               >
//                 <AccordionSummary
//                   expandIcon={<ExpandMoreIcon />}
//                   aria-controls="condition-content"
//                   id="condition-header"
//                   sx={{ bgcolor: "grey.50", borderRadius: 2 }}
//                 >
//                   <Typography
//                     variant="h6"
//                     sx={{ fontWeight: "bold", color: "text.primary" }}
//                   >
//                     Condition Rule Builder
//                   </Typography>
//                 </AccordionSummary>
//                 <AccordionDetails>
//                   <ErrorBoundary>
//                     {/* Only render ConditionRuleBuilder when we have the necessary data */}
//                     {isDataLoaded && fieldOptions.length > 0 ? (
//                       <ConditionRuleBuilder
//                         onChange={setNotificationData}
//                         notificationTypeList={notificationTypeList}
//                         fieldOptions={fieldOptions}
//                         notificationResponse={notificationResponse.data?.data}
//                         initialConditionGroup={initialConditionGroup}
//                         initialNotificationData={notificationData}
//                       />
//                     ) : (
//                       <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
//                         <CircularProgress />
//                         <Typography sx={{ ml: 2 }}>Loading form data...</Typography>
//                       </Box>
//                     )}
//                   </ErrorBoundary>
//                   <Box
//                     sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}
//                   >
//                     <Button
//                       variant="outlined"
//                       color="secondary"
//                       onClick={() => navigate("/notivix/notification-types")}
//                       sx={{ px: 4, borderRadius: 1 }}
//                     >
//                       Cancel
//                     </Button>
//                     <Button
//                       type="submit"
//                       variant="contained"
//                       color="primary"
//                       size="large"
//                       sx={{ px: 4, borderRadius: 1 }}
//                       disabled={updateNotification.isLoading || !isDataLoaded}
//                     >
//                       {updateNotification.isLoading ? "Updating..." : "Update"}
//                     </Button>
//                   </Box>
//                 </AccordionDetails>
//               </Accordion>
//               <Accordion
//                 expanded={expanded.reminder && notificationTypeId !== null}
//                 onChange={handleAccordionChange("reminder")}
//                 sx={{ mb: 2, borderRadius: 2, boxShadow: 1 }}
//                 disabled={notificationTypeId === null}
//               >
//                 <AccordionSummary
//                   expandIcon={<ExpandMoreIcon />}
//                   aria-controls="reminder-content"
//                   id="reminder-header"
//                   sx={{ bgcolor: "grey.50", borderRadius: 2 }}
//                 >
//                   <Typography
//                     variant="h6"
//                     sx={{ fontWeight: "bold", color: "text.primary" }}
//                   >
//                     Reminder Task
//                   </Typography>
//                 </AccordionSummary>
//                 <AccordionDetails>
//                   <ErrorBoundary>
//                     <Frequency
//                       fieldOptions={fieldOptions}
//                       notificationTypeId={notificationTypeId}
//                     />
//                   </ErrorBoundary>
//                 </AccordionDetails>
//               </Accordion>
//             </Box>
//           )}
//         </CardContent>
//       </Card>
//     </Box>
//   );
// }

// import * as React from "react";
// import { useState, useEffect, useRef, useCallback } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { toast } from "react-toastify";
// import {
//   Box,
//   Card,
//   CardContent,
//   Typography,
//   TextField,
//   Select,
//   MenuItem,
//   Button,
//   IconButton,
//   FormControl,
//   InputLabel,
//   Grid,
//   Accordion,
//   AccordionSummary,
//   AccordionDetails,
//   CircularProgress,
// } from "@mui/material";
// import AddIcon from "@mui/icons-material/Add";
// import CloseIcon from "@mui/icons-material/Close";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// import ChevronRightIcon from "@mui/icons-material/ChevronRight";
// import useGet from "../../hooks/useGet";
// import usePost from "../../hooks/usePost";
// import usePut from "../../hooks/usePut";
// import { GET, POST } from "../../services/apiRoutes";
// import { STYLE_GUIDE } from "../../styles";
// import { useSelector } from "react-redux";
// import { RootState } from "../../reducers";
// import Frequency from "./Frequency";

// // Custom hook for managing field options
// function useFieldOptions(notificationData, notificationTypeList) {
//   const [fieldOptions, setFieldOptions] = useState([]);
//   const lastProcessedRef = useRef({
//     entityId: null,
//     dataHash: null,
//     fieldOptionsHash: null
//   });

//   const createHash = useCallback((data) => {
//     if (!data) return null;
//     return JSON.stringify(data);
//   }, []);

//   const calculateFieldOptions = useCallback(() => {
//     if (!notificationData.entityId || !notificationTypeList.data?.data) {
//       return [];
//     }
//     const selectedEntity = notificationTypeList.data.data.find(
//       (entity) => entity._id === notificationData.entityId
//     );
    
//     if (!selectedEntity?.attributes) {
//       return [];
//     }
//     return selectedEntity.attributes.map((attr) => ({
//       value: attr.mappingName,
//       label: attr.name,
//       type: attr.type,
//       attributeId: attr._id,
//     }));
//   }, [notificationData.entityId, notificationTypeList.data]);

//   useEffect(() => {
//     // Skip if we don't have the required data
//     if (!notificationData.entityId || !notificationTypeList.data?.data) {
//       if (fieldOptions.length > 0) {
//         setFieldOptions([]);
//         lastProcessedRef.current = {
//           entityId: notificationData.entityId,
//           dataHash: null,
//           fieldOptionsHash: createHash([])
//         };
//       }
//       return;
//     }
    
//     // Create hashes for comparison
//     const currentDataHash = createHash(notificationTypeList.data);
//     const newFieldOptions = calculateFieldOptions();
//     const newFieldOptionsHash = createHash(newFieldOptions);
    
//     // Check if we've already processed this exact data with the same result
//     if (lastProcessedRef.current.entityId === notificationData.entityId &&
//         lastProcessedRef.current.dataHash === currentDataHash &&
//         lastProcessedRef.current.fieldOptionsHash === newFieldOptionsHash) {
//       return;
//     }
    
//     // Only update if field options actually changed
//     if (lastProcessedRef.current.fieldOptionsHash !== newFieldOptionsHash) {
//       setFieldOptions(newFieldOptions);
      
//       // Update the ref with current processed data
//       lastProcessedRef.current = {
//         entityId: notificationData.entityId,
//         dataHash: currentDataHash,
//         fieldOptionsHash: newFieldOptionsHash
//       };
//     }
//   }, [notificationData.entityId, notificationTypeList.data, calculateFieldOptions, createHash, fieldOptions.length]);

//   return fieldOptions;
// }

// // Error Boundary Component
// class ErrorBoundary extends React.Component {
//   state = { hasError: false };
//   static getDerivedStateFromError(error) {
//     return { hasError: true };
//   }
//   render() {
//     if (this.state.hasError) {
//       return <Typography color="error">Something went wrong.</Typography>;
//     }
//     return this.props.children;
//   }
// }

// // ConditionRuleBuilder Component
// const ConditionRuleBuilder = ({
//   onChange,
//   notificationTypeList,
//   fieldOptions,
//   notificationResponse,
//   initialConditionGroup,
//   initialNotificationData,
// }) => {
//   const organizationId = useSelector(
//     (state: RootState) => state.userPermission?.currentUser?.organizationId?._id
//   );
  
//   const [notification, setNotification] = useState({
//     name: initialNotificationData?.name || "",
//     entityId: initialNotificationData?.entityId || "",
//     conditionGroup: initialConditionGroup || {
//       logic: "AND",
//       rules: [],
//     },
//   });
  
//   const operatorList = usePost(["operatorList"]);
  
//   useEffect(() => {
//     operatorList.mutate({
//       url: POST.OPERATOR_LIST,
//       payload: { fieldType: "all" },
//     });
//   }, []);
  
//   // Update notification when initial data changes
//   useEffect(() => {
//     if (initialNotificationData) {
//       setNotification(prev => ({
//         ...prev,
//         name: initialNotificationData.name || "",
//         entityId: initialNotificationData.entityId || "",
//       }));
//     }
//   }, [initialNotificationData]);
  
//   // Update condition group when it changes
//   useEffect(() => {
//     if (initialConditionGroup) {
//       setNotification(prev => ({
//         ...prev,
//         conditionGroup: initialConditionGroup,
//       }));
//     }
//   }, [initialConditionGroup]);

//   const statusOptions = [
//     "open",
//     "rated to search",
//     "rated to draft ih",
//     "rated to draft oc",
//     "review rate to draft",
//     "filing requested",
//     "submitted",
//   ];
  
//   const caseTypeOptions = ["PRI", "PRO", "TRA", "DES"];
//   const countryCodeOptions = ["EP", "IN", "WO", "FAM", "US", "CN", "JP"];
//   const timeUnitOptions = [
//     { value: "M", label: "Month (M)" },
//     { value: "d", label: "Days (d)" },
//     { value: "y", label: "Yearly (y)" },
//   ];

//   const generateId = () => Math.random().toString(36).substr(2, 9);

//   const addRule = (groupPath) => {
//     const newRule = {
//       id: generateId(),
//       field: "",
//       operator: "",
//       value: "",
//       timeUnit: "",
//     };
//     const updatedNotification = { ...notification };
//     const group = getGroupByPath(updatedNotification.conditionGroup, groupPath);
//     group.rules.push(newRule);
//     setNotification(updatedNotification);
//   };

//   const addGroup = (groupPath) => {
//     const newGroup = {
//       id: generateId(),
//       logic: "AND",
//       rules: [],
//     };
//     const updatedNotification = { ...notification };
//     const group = getGroupByPath(updatedNotification.conditionGroup, groupPath);
//     group.rules.push(newGroup);
//     setNotification(updatedNotification);
//   };

//   const removeItem = (groupPath, index) => {
//     const updatedNotification = { ...notification };
//     const group = getGroupByPath(updatedNotification.conditionGroup, groupPath);
//     group.rules.splice(index, 1);
//     setNotification(updatedNotification);
//   };

//   const updateRule = (groupPath, index, field, value) => {
//     const updatedNotification = { ...notification };
//     const group = getGroupByPath(updatedNotification.conditionGroup, groupPath);
//     group.rules[index][field] = value;
//     if (field === "operator") {
//       const selectedField = fieldOptions.find(
//         (f) => f.value === group.rules[index].field
//       );
//       const operators = operatorList.data?.data?.find(
//         (op) => op.fieldType === selectedField?.type
//       )?.operators;
//       const selectedOperator = operators?.find(
//         (op) => op.operatorKey === value
//       );
//       if (selectedOperator && !selectedOperator.valueRequired) {
//         group.rules[index].value = "";
//         group.rules[index].timeUnit = "";
//       }
//     }
//     setNotification(updatedNotification);
//   };

//   const updateGroupLogic = (groupPath, logic) => {
//     const updatedNotification = { ...notification };
//     const group = getGroupByPath(updatedNotification.conditionGroup, groupPath);
//     group.logic = logic;
//     setNotification(updatedNotification);
//   };

//   const getGroupByPath = (root, path) => {
//     if (path.length === 0) return root;
//     let current = root;
//     for (const index of path) {
//       current = current.rules[index];
//     }
//     return current;
//   };

//   const validateValue = (rule) => {
//     const field = fieldOptions.find((f) => f.value === rule.field);
//     const operators =
//       operatorList.data?.data?.find((op) => op.fieldType === field?.type)
//         ?.operators || [];
//     const selectedOperator = operators?.find(
//       (op) => op.operatorKey === rule.operator
//     );
//     return selectedOperator?.valueRequired && !rule.value;
//   };

//   const renderValueInput = (rule, groupPath, index) => {
//     const field = fieldOptions.find((f) => f.value === rule.field);
//     const operators =
//       operatorList.data?.data?.find((op) => op.fieldType === field?.type)
//         ?.operators || [];
//     const selectedOperator = operators?.find(
//       (op) => op.operatorKey === rule.operator
//     );
//     const valueRequired = selectedOperator?.valueRequired ?? true;
//     const updateValue = (value) => updateRule(groupPath, index, "value", value);
//     const updateTimeUnit = (value) =>
//       updateRule(groupPath, index, "timeUnit", value);
    
//     if (!field || !valueRequired) {
//       return null;
//     }
    
//     switch (field.type) {
//       case "boolean":
//         return (
//           <FormControl fullWidth size="small" error={validateValue(rule)}>
//             <InputLabel>Select...</InputLabel>
//             <Select
//               value={rule.value}
//               onChange={(e) => updateValue(e.target.value === "true")}
//               label="Select..."
//             >
//               <MenuItem value="">Select...</MenuItem>
//               <MenuItem value="true">True</MenuItem>
//               <MenuItem value="false">False</MenuItem>
//             </Select>
//             {validateValue(rule) && (
//               <Typography color="error" variant="caption">
//                 Value is required
//               </Typography>
//             )}
//           </FormControl>
//         );
//       case "select":
//         if (rule.field === "status") {
//           return rule.operator === "in" ? (
//             <FormControl fullWidth size="small" error={validateValue(rule)}>
//               <InputLabel>Select...</InputLabel>
//               <Select
//                 multiple
//                 value={rule.value ? rule.value.split(",") : []}
//                 onChange={(e) => updateValue(e.target.value.join(","))}
//                 label="Select..."
//                 sx={{ minHeight: 80 }}
//               >
//                 {statusOptions.map((option) => (
//                   <MenuItem key={option} value={option}>
//                     {option}
//                   </MenuItem>
//                 ))}
//               </Select>
//               {validateValue(rule) && (
//                 <Typography color="error" variant="caption">
//                   Value is required
//                 </Typography>
//               )}
//             </FormControl>
//           ) : (
//             <FormControl fullWidth size="small" error={validateValue(rule)}>
//               <InputLabel>Select...</InputLabel>
//               <Select
//                 value={rule.value}
//                 onChange={(e) => updateValue(e.target.value)}
//                 label="Select..."
//               >
//                 <MenuItem value="">Select...</MenuItem>
//                 {statusOptions.map((option) => (
//                   <MenuItem key={option} value={option}>
//                     {option}
//                   </MenuItem>
//                 ))}
//               </Select>
//               {validateValue(rule) && (
//                 <Typography color="error" variant="caption">
//                   Value is required
//                 </Typography>
//               )}
//             </FormControl>
//           );
//         }
//         if (rule.field === "case_type") {
//           return rule.operator === "in" ? (
//             <FormControl fullWidth size="small" error={validateValue(rule)}>
//               <InputLabel>Select...</InputLabel>
//               <Select
//                 multiple
//                 value={rule.value ? rule.value.split(",") : []}
//                 onChange={(e) => updateValue(e.target.value.join(","))}
//                 label="Select..."
//                 sx={{ minHeight: 80 }}
//               >
//                 {caseTypeOptions.map((option) => (
//                   <MenuItem key={option} value={option}>
//                     {option}
//                   </MenuItem>
//                 ))}
//               </Select>
//               {validateValue(rule) && (
//                 <Typography color="error" variant="caption">
//                   Value is required
//                 </Typography>
//               )}
//             </FormControl>
//           ) : (
//             <FormControl fullWidth size="small" error={validateValue(rule)}>
//               <InputLabel>Select...</InputLabel>
//               <Select
//                 value={rule.value}
//                 onChange={(e) => updateValue(e.target.value)}
//                 label="Select..."
//               >
//                 <MenuItem value="">Select...</MenuItem>
//                 {caseTypeOptions.map((option) => (
//                   <MenuItem key={option} value={option}>
//                     {option}
//                   </MenuItem>
//                 ))}
//               </Select>
//               {validateValue(rule) && (
//                 <Typography color="error" variant="caption">
//                   Value is required
//                 </Typography>
//               )}
//             </FormControl>
//           );
//         }
//         if (rule.field === "country_code") {
//           return rule.operator === "in" ? (
//             <FormControl fullWidth size="small" error={validateValue(rule)}>
//               <InputLabel>Select...</InputLabel>
//               <Select
//                 multiple
//                 value={rule.value ? rule.value.split(",") : []}
//                 onChange={(e) => updateValue(e.target.value.join(","))}
//                 label="Select..."
//                 sx={{ minHeight: 80 }}
//               >
//                 {countryCodeOptions.map((option) => (
//                   <MenuItem key={option} value={option}>
//                     {option}
//                   </MenuItem>
//                 ))}
//               </Select>
//               {validateValue(rule) && (
//                 <Typography color="error" variant="caption">
//                   Value is required
//                 </Typography>
//               )}
//             </FormControl>
//           ) : (
//             <FormControl fullWidth size="small" error={validateValue(rule)}>
//               <InputLabel>Select...</InputLabel>
//               <Select
//                 value={rule.value}
//                 onChange={(e) => updateValue(e.target.value)}
//                 label="Select..."
//               >
//                 <MenuItem value="">Select...</MenuItem>
//                 {countryCodeOptions.map((option) => (
//                   <MenuItem key={option} value={option}>
//                     {option}
//                   </MenuItem>
//                 ))}
//               </Select>
//               {validateValue(rule) && (
//                 <Typography color="error" variant="caption">
//                   Value is required
//                 </Typography>
//               )}
//             </FormControl>
//           );
//         }
//         return (
//           <FormControl fullWidth size="small" error={validateValue(rule)}>
//             <TextField
//               fullWidth
//               size="small"
//               value={rule.value}
//               onChange={(e) => updateValue(e.target.value)}
//               placeholder="Value"
//               variant="outlined"
//               error={validateValue(rule)}
//               sx={{ marginTop: validateValue(rule) ? "22px" : 0 }}
//             />
//             {validateValue(rule) && (
//               <Typography color="error" variant="caption">
//                 Value is required
//               </Typography>
//             )}
//           </FormControl>
//         );
//       case "date":
//         return (
//           <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
//             <FormControl fullWidth size="small" error={validateValue(rule)}>
//               <TextField
//                 fullWidth
//                 size="small"
//                 type="date"
//                 value={rule.value}
//                 onChange={(e) => updateValue(e.target.value)}
//                 placeholder="Select date"
//                 variant="outlined"
//                 InputLabelProps={{ shrink: true }}
//                 error={validateValue(rule)}
//                 sx={{ marginTop: validateValue(rule) ? "22px" : 0 }}
//               />
//               {validateValue(rule) && (
//                 <Typography color="error" variant="caption">
//                   Value is required
//                 </Typography>
//               )}
//             </FormControl>
//             <FormControl fullWidth size="small">
//               <InputLabel>Time Unit</InputLabel>
//               <Select
//                 value={rule.timeUnit}
//                 onChange={(e) => updateTimeUnit(e.target.value)}
//                 label="Time Unit"
//               >
//                 <MenuItem value="">Select...</MenuItem>
//                 {timeUnitOptions.map((option) => (
//                   <MenuItem key={option.value} value={option.value}>
//                     {option.label}
//                   </MenuItem>
//                 ))}
//               </Select>
//             </FormControl>
//           </Box>
//         );
//       default:
//         return (
//           <FormControl fullWidth size="small" error={validateValue(rule)}>
//             <TextField
//               fullWidth
//               size="small"
//               value={rule.value}
//               onChange={(e) => updateValue(e.target.value)}
//               placeholder="Value"
//               variant="outlined"
//               error={validateValue(rule)}
//               sx={{ marginTop: validateValue(rule) ? "22px" : 0 }}
//             />
//             {validateValue(rule) && (
//               <Typography color="error" variant="caption">
//                 Value is required
//               </Typography>
//             )}
//           </FormControl>
//         );
//     }
//   };

//   const RuleComponent = ({ rule, groupPath, index }) => {
//     const selectedField = fieldOptions.find((f) => f.value === rule.field);
//     const operators =
//       operatorList.data?.data?.find(
//         (op) => op.fieldType === selectedField?.type
//       )?.operators || [];
//     return (
//       <Box
//         sx={{
//           display: "flex",
//           alignItems: "center",
//           gap: 2,
//           p: 2,
//           bgcolor: "grey.100",
//           borderRadius: 2,
//           transition: "background-color 0.2s ease",
//           "&:hover": { bgcolor: "grey.200" },
//         }}
//       >
//         <FormControl fullWidth size="small">
//           <InputLabel>Select field...</InputLabel>
//           <Select
//             value={rule.field}
//             onChange={(e) => {
//               updateRule(groupPath, index, "field", e.target.value);
//               updateRule(groupPath, index, "operator", "");
//               updateRule(groupPath, index, "value", "");
//               updateRule(groupPath, index, "timeUnit", "");
//             }}
//             label="Select field..."
//           >
//             <MenuItem value="">Select field...</MenuItem>
//             {fieldOptions.map((option) => (
//               <MenuItem key={option.value} value={option.value}>
//                 {option.label}
//               </MenuItem>
//             ))}
//           </Select>
//         </FormControl>
//         <FormControl fullWidth size="small" disabled={!rule.field}>
//           <InputLabel>Select operator...</InputLabel>
//           <Select
//             value={rule.operator}
//             onChange={(e) => updateRule(groupPath, index, "operator", e.target.value)}
//             label="Select operator..."
//           >
//             <MenuItem value="">Select operator...</MenuItem>
//             {operatorList.isLoading ? (
//               <MenuItem disabled>Loading operators...</MenuItem>
//             ) : (
//               operators.map((op) => (
//                 <MenuItem key={op._id} value={op.operatorKey}>
//                   {op.operatorName}
//                 </MenuItem>
//               ))
//             )}
//           </Select>
//         </FormControl>
//         {renderValueInput(rule, groupPath, index)}
//         <IconButton
//           onClick={() => removeItem(groupPath, index)}
//           color="error"
//           aria-label="Remove rule"
//         >
//           <CloseIcon />
//         </IconButton>
//       </Box>
//     );
//   };

//   const GroupComponent = ({ group, groupPath = [], isRoot = false }) => {
//     const [collapsed, setCollapsed] = useState(false);
//     return (
//       <Box
//         sx={{
//           border: isRoot ? "2px solid" : "1px solid",
//           borderColor: isRoot ? "primary.light" : "grey.300",
//           borderRadius: 2,
//           p: 3,
//           width: isRoot ? "auto" : "auto",
//           bgcolor: isRoot ? "background.paper" : "inherit",
//           boxShadow: isRoot ? 3 : 1,
//           transition: "all 0.3s ease-in-out",
//           "&:hover": { boxShadow: 4 },
//         }}
//       >
//         <Box
//           sx={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//             mb: 3,
//           }}
//         >
//           <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
//             {!isRoot && (
//               <IconButton
//                 onClick={() => setCollapsed(!collapsed)}
//                 sx={{
//                   bgcolor: "grey.100",
//                   "&:hover": { bgcolor: "grey.200" },
//                   transition: "background-color 0.2s ease",
//                 }}
//                 aria-label="Toggle group collapse"
//               >
//                 {collapsed ? <ChevronRightIcon /> : <ExpandMoreIcon />}
//               </IconButton>
//             )}
//             <Typography
//               variant="subtitle2"
//               sx={{
//                 fontWeight: "medium",
//                 color: "text.secondary",
//                 fontSize: "0.9rem",
//               }}
//             >
//               {isRoot ? "Root Condition Group" : "Nested Group"}
//             </Typography>
//             <FormControl size="small">
//               <InputLabel>Logic</InputLabel>
//               <Select
//                 value={group.logic}
//                 onChange={(e) => updateGroupLogic(groupPath, e.target.value)}
//                 label="Logic"
//                 sx={{ fontSize: "0.85rem" }}
//               >
//                 <MenuItem value="AND">AND</MenuItem>
//                 <MenuItem value="OR">OR</MenuItem>
//               </Select>
//             </FormControl>
//           </Box>
//           <Box sx={{ display: "flex", gap: 1 }}>
//             <Button
//               variant="contained"
//               color="primary"
//               size="small"
//               onClick={() => addRule(groupPath)}
//               startIcon={<AddIcon />}
//               sx={{
//                 fontSize: "0.85rem",
//                 borderRadius: 1,
//                 px: 2,
//                 py: 0.5,
//                 transition: "all 0.2s ease",
//                 "&:hover": { transform: "scale(1.05)" },
//               }}
//             >
//               Rule
//             </Button>
//             <Button
//               variant="contained"
//               color="success"
//               size="small"
//               onClick={() => addGroup(groupPath)}
//               startIcon={<AddIcon />}
//               sx={{
//                 fontSize: "0.85rem",
//                 borderRadius: 1,
//                 px: 2,
//                 py: 0.5,
//                 transition: "all 0.2s ease",
//                 "&:hover": { transform: "scale(1.05)" },
//               }}
//             >
//               Group
//             </Button>
//             {!isRoot && (
//               <IconButton
//                 onClick={() => {
//                   const parentPath = groupPath.slice(0, -1);
//                   const index = groupPath[groupPath.length - 1];
//                   removeItem(parentPath, index);
//                 }}
//                 color="error"
//                 aria-label="Remove group"
//               >
//                 <CloseIcon />
//               </IconButton>
//             )}
//           </Box>
//         </Box>
//         {!collapsed && (
//           <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
//             {group.rules.map((rule, index) => (
//               <Box key={rule.id || index}>
//                 {index > 0 && (
//                   <Box sx={{ py: 1 }}>
//                     <Typography
//                       variant="caption"
//                       sx={{
//                         pl: 1,
//                         fontSize: "0.75rem",
//                         color: "text.secondary",
//                         fontWeight: "medium",
//                         bgcolor: "grey.100",
//                         borderRadius: "12px",
//                         px: 1.5,
//                         py: 0.5,
//                         display: "inline-block",
//                         transition: "all 0.2s ease",
//                       }}
//                     >
//                       {group.logic}
//                     </Typography>
//                   </Box>
//                 )}
//                 {rule.logic ? (
//                   <GroupComponent
//                     group={rule}
//                     groupPath={[...groupPath, index]}
//                   />
//                 ) : (
//                   <RuleComponent
//                     rule={rule}
//                     groupPath={groupPath}
//                     index={index}
//                   />
//                 )}
//               </Box>
//             ))}
//           </Box>
//         )}
//       </Box>
//     );
//   };

//   useEffect(() => {
//     const transformNotificationData = () => {
//       const conditionGroups = [];
//       const flattenGroup = (group, path = []) => {
//         const conditions = [];
//         group.rules.forEach((rule) => {
//           if (rule.logic) {
//             conditionGroups.push({
//               group_operator: rule.logic,
//               conditions: [],
//             });
//             flattenGroup(rule, [...path, conditionGroups.length - 1]);
//           } else {
//             const fieldOption = fieldOptions.find(
//               (f) => f.value === rule.field
//             );
//             if (fieldOption) {
//               conditions.push({
//                 attributeId: fieldOption.attributeId,
//                 operator: rule.operator,
//                 value: rule.value,
//                 timeUnit: rule.timeUnit || "",
//               });
//             }
//           }
//         });
//         if (conditions.length > 0) {
//           conditionGroups.push({
//             group_operator: group.logic,
//             conditions,
//           });
//         }
//       };
//       flattenGroup(notification.conditionGroup);
//       return {
//         name: notification.name,
//         organizationId: organizationId,
//         entityId: notification.entityId,
//         triggerFieldId: "",
//         isActive: true,
//         conditionGroups,
//       };
//     };
//     onChange(transformNotificationData());
//   }, [notification, fieldOptions, onChange, organizationId]);

//   return (
//     <Box
//       sx={{
//         maxWidth: "1200px",
//         mx: "auto",
//         p: 4,
//         bgcolor: "background.paper",
//         borderRadius: 2,
//       }}
//     >
//       <Box sx={{ mb: 4, p: 3, bgcolor: "grey.50", borderRadius: 2 }}>
//         <Grid container spacing={2}>
//           <Grid item xs={12} sm={4}>
//             <TextField
//               fullWidth
//               label="Name"
//               value={notification.name}
//               onChange={(e) =>
//                 setNotification({ ...notification, name: e.target.value })
//               }
//               variant="outlined"
//               size="small"
//               required
//               error={!notification.name}
//               helperText={!notification.name ? "Name is required" : ""}
//             />
//           </Grid>
//           <Grid item xs={12} sm={4}>
//             <FormControl fullWidth size="small">
//               <InputLabel>Entity</InputLabel>
//               <Select
//                 value={notification.entityId}
//                 onChange={(e) =>
//                   setNotification({ ...notification, entityId: e.target.value })
//                 }
//                 label="Entity"
//                 required
//                 error={!notification.entityId}
//               >
//                 <MenuItem value="">Select Entity...</MenuItem>
//                 {notificationTypeList.data?.data?.map((entity) => (
//                   <MenuItem key={entity._id} value={entity._id}>
//                     {entity.name}
//                   </MenuItem>
//                 ))}
//               </Select>
//               {!notification.entityId && (
//                 <Typography color="error" variant="caption">
//                   Entity is required
//                 </Typography>
//               )}
//             </FormControl>
//           </Grid>
//         </Grid>
//       </Box>
//       <GroupComponent group={notification.conditionGroup} isRoot={true} />
//     </Box>
//   );
// };

// // EditNotificationTypes Component
// export default function EditNotificationTypes() {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();
//   const [expanded, setExpanded] = useState({ condition: true, reminder: true });
//   const [notificationData, setNotificationData] = useState({});
//   const [notificationTypeId, setNotificationTypeId] = useState<string | null>(id || null);
//   const [initialConditionGroup, setInitialConditionGroup] = useState(null);
//   const [isDataLoaded, setIsDataLoaded] = useState(false);
  
//   const notificationTypeList = useGet(
//     ["notificationTypeList"],
//     `${GET.Entity_List}`,
//     true
//   );
//   const notificationDetails = useGet(
//     ["notificationDetails", id],
//     id ? `/notivix/notification-setting/type/${id}` : null,
//     !!id
//   );
//   const updateNotification = usePost(["updateNotification"]);
//   const notificationResponse = usePost(["notificationResponse"]);
  
//   const handleAccordionChange = (panel) => (event, isExpanded) => {
//     setExpanded((prev) => ({ ...prev, [panel]: isExpanded }));
//   };
  
//   // Use the custom hook to get fieldOptions
//   const fieldOptions = useFieldOptions(notificationData, notificationTypeList);
  
//   // Transform backend response to condition group format
//   const transformBackendToConditionGroup = (conditionGroups, availableFieldOptions) => {
//     const generateId = () => Math.random().toString(36).substr(2, 9);
    
//     if (!conditionGroups || conditionGroups.length === 0) {
//       return { logic: "AND", rules: [] };
//     }
//     const rootGroup = {
//       logic: conditionGroups[0].group_operator || "AND",
//       rules: [],
//     };
//     conditionGroups.forEach((group) => {
//       group.conditions.forEach((condition) => {
//         // Find the field by attributeId instead of mappingName
//         const fieldOption = availableFieldOptions.find(
//           (f) => f.attributeId === condition.attributeId
//         );
        
//         if (fieldOption) {
//           rootGroup.rules.push({
//             id: generateId(),
//             field: fieldOption.value, // Use mappingName for the field value
//             operator: condition.operator,
//             value: condition.value,
//             timeUnit: condition.timeUnit || "",
//           });
//         } else {
//           // If field not found, still add the rule but with attributeId as field
//           console.warn(`Field with attributeId ${condition.attributeId} not found in fieldOptions`);
//           rootGroup.rules.push({
//             id: generateId(),
//             field: condition.attributeId,
//             operator: condition.operator,
//             value: condition.value,
//             timeUnit: condition.timeUnit || "",
//           });
//         }
//       });
//     });
//     return rootGroup;
//   };
  
//   // First, load notification details and set basic data
//   useEffect(() => {
//     if (notificationDetails.data?.success && notificationDetails.data?.data && !isDataLoaded) {
//       const data = notificationDetails.data.data;
//       console.log("Backend data:", data);
      
//       setNotificationData({
//         name: data.name || "",
//         organizationId: data.organizationId || "",
//         entityId: data.entityId || "",
//         triggerFieldId: "",
//         isActive: data.isActive || true,
//         conditionGroups: data.conditionGroups || [],
//       });
      
//       setIsDataLoaded(true);
//     }
//   }, [notificationDetails.data, isDataLoaded]);
  
//   // Finally, transform condition groups when both data and field options are available
//   useEffect(() => {
//     if (
//       isDataLoaded && 
//       fieldOptions.length > 0 && 
//       notificationData.conditionGroups && 
//       notificationData.conditionGroups.length > 0 &&
//       !initialConditionGroup
//     ) {
//       console.log("Transforming condition groups:", notificationData.conditionGroups);
//       console.log("Available field options:", fieldOptions);
      
//       const transformedGroup = transformBackendToConditionGroup(
//         notificationData.conditionGroups,
//         fieldOptions
//       );
      
//       console.log("Transformed condition group:", transformedGroup);
//       setInitialConditionGroup(transformedGroup);
//     }
//   }, [isDataLoaded, fieldOptions, notificationData.conditionGroups, initialConditionGroup]);
  
//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     if (!notificationData.name || !notificationData.entityId) {
//       toast.error("Name and Entity are required fields.");
//       return;
//     }
//     try {
//       const response = await updateNotification.mutateAsync({
//         url: `/notivix/notification-setting/type/update/${id}`,
//         payload: notificationData,
//       });
//       if (response.success) {
//         toast.success("Notification updated successfully!");
//         navigate("/notivix/notification-types");
//       } else {
//         throw new Error("Notification update failed");
//       }
//     } catch (error) {
//       console.error("Error updating notification:", error);
//       toast.error("Failed to update notification. Please try again.");
//     }
//   };
  
//   return (
//     <Box
//       sx={{
//         flexGrow: 1,
//         p: 3,
//         ml: { xs: 0 },
//         backgroundColor: STYLE_GUIDE.COLORS.backgroundLight,
//         minHeight: "100vh",
//       }}
//     >
//       <Typography
//         variant="h4"
//         sx={{
//           mb: 3,
//           fontWeight: 400,
//           color: STYLE_GUIDE.COLORS.primaryDark,
//         }}
//       >
//         Edit Notification Type
//       </Typography>
//       <Card
//         sx={{
//           backgroundColor: STYLE_GUIDE.COLORS.white,
//           borderRadius: 2,
//           boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
//         }}
//       >
//         <CardContent sx={{ p: 3 }}>
//           {notificationDetails.isLoading ? (
//             <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
//               <CircularProgress />
//             </Box>
//           ) : notificationDetails.isError ? (
//             <Typography color="error">
//               Failed to load notification type details. Please try again.
//             </Typography>
//           ) : (
//             <Box component="form" onSubmit={handleSubmit}>
//               <Accordion
//                 expanded={expanded.condition}
//                 onChange={handleAccordionChange("condition")}
//                 sx={{ mb: 2, borderRadius: 2, boxShadow: 1 }}
//               >
//                 <AccordionSummary
//                   expandIcon={<ExpandMoreIcon />}
//                   aria-controls="condition-content"
//                   id="condition-header"
//                   sx={{ bgcolor: "grey.50", borderRadius: 2 }}
//                 >
//                   <Typography
//                     variant="h6"
//                     sx={{ fontWeight: "bold", color: "text.primary" }}
//                   >
//                     Condition Rule Builder
//                   </Typography>
//                 </AccordionSummary>
//                 <AccordionDetails>
//                   <ErrorBoundary>
//                     {/* Only render ConditionRuleBuilder when we have the necessary data */}
//                     {isDataLoaded && fieldOptions.length > 0 ? (
//                       <ConditionRuleBuilder
//                         onChange={setNotificationData}
//                         notificationTypeList={notificationTypeList}
//                         fieldOptions={fieldOptions}
//                         notificationResponse={notificationResponse.data?.data}
//                         initialConditionGroup={initialConditionGroup}
//                         initialNotificationData={notificationData}
//                       />
//                     ) : (
//                       <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
//                         <CircularProgress />
//                         <Typography sx={{ ml: 2 }}>Loading form data...</Typography>
//                       </Box>
//                     )}
//                   </ErrorBoundary>
//                   <Box
//                     sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}
//                   >
//                     <Button
//                       variant="outlined"
//                       color="secondary"
//                       onClick={() => navigate("/notivix/notification-types")}
//                       sx={{ px: 4, borderRadius: 1 }}
//                     >
//                       Cancel
//                     </Button>
//                     <Button
//                       type="submit"
//                       variant="contained"
//                       color="primary"
//                       size="large"
//                       sx={{ px: 4, borderRadius: 1 }}
//                       disabled={updateNotification.isLoading || !isDataLoaded}
//                     >
//                       {updateNotification.isLoading ? "Updating..." : "Update"}
//                     </Button>
//                   </Box>
//                 </AccordionDetails>
//               </Accordion>
//               <Accordion
//                 expanded={expanded.reminder && notificationTypeId !== null}
//                 onChange={handleAccordionChange("reminder")}
//                 sx={{ mb: 2, borderRadius: 2, boxShadow: 1 }}
//                 disabled={notificationTypeId === null}
//               >
//                 <AccordionSummary
//                   expandIcon={<ExpandMoreIcon />}
//                   aria-controls="reminder-content"
//                   id="reminder-header"
//                   sx={{ bgcolor: "grey.50", borderRadius: 2 }}
//                 >
//                   <Typography
//                     variant="h6"
//                     sx={{ fontWeight: "bold", color: "text.primary" }}
//                   >
//                     Reminder Task
//                   </Typography>
//                 </AccordionSummary>
//                 <AccordionDetails>
//                   <ErrorBoundary>
//                     <Frequency
//                       fieldOptions={fieldOptions}
//                       notificationTypeId={notificationTypeId}
//                     />
//                   </ErrorBoundary>
//                 </AccordionDetails>
//               </Accordion>
//             </Box>
//           )}
//         </CardContent>
//       </Card>
//     </Box>
//   );
// }


// import * as React from "react";
// import { useState, useEffect, useMemo } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { toast } from "react-toastify";
// import {
//   Box,
//   Card,
//   CardContent,
//   Typography,
//   TextField,
//   Select,
//   MenuItem,
//   Button,
//   IconButton,
//   FormControl,
//   InputLabel,
//   Grid,
//   Accordion,
//   AccordionSummary,
//   AccordionDetails,
//   CircularProgress,
// } from "@mui/material";
// import AddIcon from "@mui/icons-material/Add";
// import CloseIcon from "@mui/icons-material/Close";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// import ChevronRightIcon from "@mui/icons-material/ChevronRight";
// import useGet from "../../hooks/useGet";
// import usePost from "../../hooks/usePost";
// import usePut from "../../hooks/usePut";
// import { GET, POST } from "../../services/apiRoutes";
// import { STYLE_GUIDE } from "../../styles";
// import { useSelector } from "react-redux";
// import { RootState } from "../../reducers";
// import Frequency from "./Frequency";

// // Error Boundary Component
// class ErrorBoundary extends React.Component {
//   state = { hasError: false };

//   static getDerivedStateFromError(error) {
//     return { hasError: true };
//   }

//   render() {
//     if (this.state.hasError) {
//       return <Typography color="error">Something went wrong.</Typography>;
//     }
//     return this.props.children;
//   }
// }

// // Custom Hook for Field Options
// const useFieldOptions = (entityId, notificationTypeList) => {
//   const [fieldOptions, setFieldOptions] = useState([]);

//   // Memoize dependencies to prevent unnecessary triggers
//   const memoizedEntityId = useMemo(() => entityId, [entityId]);
//   const memoizedNotificationTypeListData = useMemo(
//     () => notificationTypeList.data,
//     [notificationTypeList.data]
//   );

//   useEffect(() => {
//     console.log("useFieldOptions useEffect triggered", {
//       entityId: memoizedEntityId,
//       hasNotificationTypeListData: !!memoizedNotificationTypeListData?.data,
//     });

//     if (memoizedEntityId && memoizedNotificationTypeListData?.data) {
//       const selectedEntity = memoizedNotificationTypeListData.data.find(
//         (entity) => entity._id === memoizedEntityId
//       );

//       if (selectedEntity && selectedEntity.attributes) {
//         const newFieldOptions = selectedEntity.attributes.map((attr) => ({
//           value: attr.mappingName,
//           label: attr.name,
//           type: attr.type,
//           attributeId: attr._id,
//         }));

//         setFieldOptions((prevFieldOptions) => {
//           if (JSON.stringify(prevFieldOptions) !== JSON.stringify(newFieldOptions)) {
//             console.log("Field options updated:", newFieldOptions);
//             return newFieldOptions;
//           }
//           console.log("Field options unchanged, skipping update");
//           return prevFieldOptions;
//         });
//       } else {
//         setFieldOptions((prevFieldOptions) => {
//           if (prevFieldOptions.length > 0) {
//             console.log("Resetting field options to empty");
//             return [];
//           }
//           console.log("Field options already empty, skipping reset");
//           return prevFieldOptions;
//         });
//       }
//     } else {
//       setFieldOptions((prevFieldOptions) => {
//         if (prevFieldOptions.length > 0) {
//           console.log("Resetting field options to empty due to missing entityId or data");
//           return [];
//         }
//         console.log("Field options already empty, skipping reset");
//         return prevFieldOptions;
//       });
//     }
//   }, [memoizedEntityId, memoizedNotificationTypeListData]);

//   return fieldOptions;
// };

// // ConditionRuleBuilder Component
// const ConditionRuleBuilder = ({
//   onChange,
//   notificationTypeList,
//   fieldOptions,
//   notificationResponse,
//   initialConditionGroup,
//   initialNotificationData,
// }) => {
//   const organizationId = useSelector(
//     (state: RootState) => state.userPermission?.currentUser?.organizationId?._id
//   );

//   const [notification, setNotification] = useState({
//     name: initialNotificationData?.name || "",
//     entityId: initialNotificationData?.entityId || "",
//     conditionGroup: initialConditionGroup || {
//       logic: "AND",
//       rules: [],
//     },
//   });

//   const operatorList = usePost(["operatorList"]);

//   useEffect(() => {
//     operatorList.mutate({
//       url: POST.OPERATOR_LIST,
//       payload: { fieldType: "all" },
//     });
//   }, []);

//   useEffect(() => {
//     if (initialNotificationData) {
//       setNotification((prev) => ({
//         ...prev,
//         name: initialNotificationData.name || "",
//         entityId: initialNotificationData.entityId || "",
//       }));
//     }
//   }, [initialNotificationData]);

//   useEffect(() => {
//     if (initialConditionGroup) {
//       setNotification((prev) => ({
//         ...prev,
//         conditionGroup: initialConditionGroup,
//       }));
//     }
//   }, [initialConditionGroup]);

//   const statusOptions = [
//     "open",
//     "rated to search",
//     "rated to draft ih",
//     "rated to draft oc",
//     "review rate to draft",
//     "filing requested",
//     "submitted",
//   ];
//   const caseTypeOptions = ["PRI", "PRO", "TRA", "DES"];
//   const countryCodeOptions = ["EP", "IN", "WO", "FAM", "US", "CN", "JP"];
//   const timeUnitOptions = [
//     { value: "M", label: "Month (M)" },
//     { value: "d", label: "Days (d)" },
//     { value: "y", label: "Yearly (y)" },
//   ];

//   const generateId = () => Math.random().toString(36).substr(2, 9);

//   const addRule = (groupPath) => {
//     const newRule = {
//       id: generateId(),
//       field: "",
//       operator: "",
//       value: "",
//       timeUnit: "",
//     };
//     const updatedNotification = { ...notification };
//     const group = getGroupByPath(updatedNotification.conditionGroup, groupPath);
//     group.rules.push(newRule);
//     setNotification(updatedNotification);
//   };

//   const addGroup = (groupPath) => {
//     const newGroup = {
//       id: generateId(),
//       logic: "AND",
//       rules: [],
//     };
//     const updatedNotification = { ...notification };
//     const group = getGroupByPath(updatedNotification.conditionGroup, groupPath);
//     group.rules.push(newGroup);
//     setNotification(updatedNotification);
//   };

//   const removeItem = (groupPath, index) => {
//     const updatedNotification = { ...notification };
//     const group = getGroupByPath(updatedNotification.conditionGroup, groupPath);
//     group.rules.splice(index, 1);
//     setNotification(updatedNotification);
//   };

//   const updateRule = (groupPath, index, field, value) => {
//     const updatedNotification = { ...notification };
//     const group = getGroupByPath(updatedNotification.conditionGroup, groupPath);
//     group.rules[index][field] = value;
//     if (field === "operator") {
//       const selectedField = fieldOptions.find(
//         (f) => f.value === group.rules[index].field
//       );
//       const operators = operatorList.data?.data?.find(
//         (op) => op.fieldType === selectedField?.type
//       )?.operators;
//       const selectedOperator = operators?.find(
//         (op) => op.operatorKey === value
//       );
//       if (selectedOperator && !selectedOperator.valueRequired) {
//         group.rules[index].value = "";
//         group.rules[index].timeUnit = "";
//       }
//     }
//     setNotification(updatedNotification);
//   };

//   const updateGroupLogic = (groupPath, logic) => {
//     const updatedNotification = { ...notification };
//     const group = getGroupByPath(updatedNotification.conditionGroup, groupPath);
//     group.logic = logic;
//     setNotification(updatedNotification);
//   };

//   const getGroupByPath = (root, path) => {
//     if (path.length === 0) return root;
//     let current = root;
//     for (const index of path) {
//       current = current.rules[index];
//     }
//     return current;
//   };

//   const validateValue = (rule) => {
//     const field = fieldOptions.find((f) => f.value === rule.field);
//     const operators =
//       operatorList.data?.data?.find((op) => op.fieldType === field?.type)
//         ?.operators || [];
//     const selectedOperator = operators?.find(
//       (op) => op.operatorKey === rule.operator
//     );
//     return selectedOperator?.valueRequired && !rule.value;
//   };

//   const renderValueInput = (rule, groupPath, index) => {
//     const field = fieldOptions.find((f) => f.value === rule.field);
//     const operators =
//       operatorList.data?.data?.find((op) => op.fieldType === field?.type)
//         ?.operators || [];
//     const selectedOperator = operators?.find(
//       (op) => op.operatorKey === rule.operator
//     );
//     const valueRequired = selectedOperator?.valueRequired ?? true;
//     const updateValue = (value) => updateRule(groupPath, index, "value", value);
//     const updateTimeUnit = (value) =>
//       updateRule(groupPath, index, "timeUnit", value);

//     if (!field || !valueRequired) {
//       return null;
//     }

//     switch (field.type) {
//       case "boolean":
//         return (
//           <FormControl fullWidth size="small" error={validateValue(rule)}>
//             <InputLabel>Select...</InputLabel>
//             <Select
//               value={rule.value}
//               onChange={(e) => updateValue(e.target.value === "true")}
//               label="Select..."
//             >
//               <MenuItem value="">Select...</MenuItem>
//               <MenuItem value="true">True</MenuItem>
//               <MenuItem value="false">False</MenuItem>
//             </Select>
//             {validateValue(rule) && (
//               <Typography color="error" variant="caption">
//                 Value is required
//               </Typography>
//             )}
//           </FormControl>
//         );
//       case "select":
//         if (rule.field === "status") {
//           return rule.operator === "in" ? (
//             <FormControl fullWidth size="small" error={validateValue(rule)}>
//               <InputLabel>Select...</InputLabel>
//               <Select
//                 multiple
//                 value={rule.value ? rule.value.split(",") : []}
//                 onChange={(e) => updateValue(e.target.value.join(","))}
//                 label="Select..."
//                 sx={{ minHeight: 80 }}
//               >
//                 {statusOptions.map((option) => (
//                   <MenuItem key={option} value={option}>
//                     {option}
//                   </MenuItem>
//                 ))}
//               </Select>
//               {validateValue(rule) && (
//                 <Typography color="error" variant="caption">
//                   Value is required
//                 </Typography>
//               )}
//             </FormControl>
//           ) : (
//             <FormControl fullWidth size="small" error={validateValue(rule)}>
//               <InputLabel>Select...</InputLabel>
//               <Select
//                 value={rule.value}
//                 onChange={(e) => updateValue(e.target.value)}
//                 label="Select..."
//               >
//                 <MenuItem value="">Select...</MenuItem>
//                 {statusOptions.map((option) => (
//                   <MenuItem key={option} value={option}>
//                     {option}
//                   </MenuItem>
//                 ))}
//               </Select>
//               {validateValue(rule) && (
//                 <Typography color="error" variant="caption">
//                   Value is required
//                 </Typography>
//               )}
//             </FormControl>
//           );
//         }
//         if (rule.field === "case_type") {
//           return rule.operator === "in" ? (
//             <FormControl fullWidth size="small" error={validateValue(rule)}>
//               <InputLabel>Select...</InputLabel>
//               <Select
//                 multiple
//                 value={rule.value ? rule.value.split(",") : []}
//                 onChange={(e) => updateValue(e.target.value.join(","))}
//                 label="Select..."
//                 sx={{ minHeight: 80 }}
//               >
//                 {caseTypeOptions.map((option) => (
//                   <MenuItem key={option} value={option}>
//                     {option}
//                   </MenuItem>
//                 ))}
//               </Select>
//               {validateValue(rule) && (
//                 <Typography color="error" variant="caption">
//                   Value is required
//                 </Typography>
//               )}
//             </FormControl>
//           ) : (
//             <FormControl fullWidth size="small" error={validateValue(rule)}>
//               <InputLabel>Select...</InputLabel>
//               <Select
//                 value={rule.value}
//                 onChange={(e) => updateValue(e.target.value)}
//                 label="Select..."
//               >
//                 <MenuItem value="">Select...</MenuItem>
//                 {caseTypeOptions.map((option) => (
//                   <MenuItem key={option} value={option}>
//                     {option}
//                   </MenuItem>
//                 ))}
//               </Select>
//               {validateValue(rule) && (
//                 <Typography color="error" variant="caption">
//                   Value is required
//                 </Typography>
//               )}
//             </FormControl>
//           );
//         }
//         if (rule.field === "country_code") {
//           return rule.operator === "in" ? (
//             <FormControl fullWidth size="small" error={validateValue(rule)}>
//               <InputLabel>Select...</InputLabel>
//               <Select
//                 multiple
//                 value={rule.value ? rule.value.split(",") : []}
//                 onChange={(e) => updateValue(e.target.value.join(","))}
//                 label="Select..."
//                 sx={{ minHeight: 80 }}
//               >
//                 {countryCodeOptions.map((option) => (
//                   <MenuItem key={option} value={option}>
//                     {option}
//                   </MenuItem>
//                 ))}
//               </Select>
//               {validateValue(rule) && (
//                 <Typography color="error" variant="caption">
//                   Value is required
//                 </Typography>
//               )}
//             </FormControl>
//           ) : (
//             <FormControl fullWidth size="small" error={validateValue(rule)}>
//               <InputLabel>Select...</InputLabel>
//               <Select
//                 value={rule.value}
//                 onChange={(e) => updateValue(e.target.value)}
//                 label="Select..."
//               >
//                 <MenuItem value="">Select...</MenuItem>
//                 {countryCodeOptions.map((option) => (
//                   <MenuItem key={option} value={option}>
//                     {option}
//                   </MenuItem>
//                 ))}
//               </Select>
//               {validateValue(rule) && (
//                 <Typography color="error" variant="caption">
//                   Value is required
//                 </Typography>
//               )}
//             </FormControl>
//           );
//         }
//         return (
//           <FormControl fullWidth size="small" error={validateValue(rule)}>
//             <TextField
//               fullWidth
//               size="small"
//               value={rule.value}
//               onChange={(e) => updateValue(e.target.value)}
//               placeholder="Value"
//               variant="outlined"
//               error={validateValue(rule)}
//               sx={{ marginTop: validateValue(rule) ? "22px" : 0 }}
//             />
//             {validateValue(rule) && (
//               <Typography color="error" variant="caption">
//                 Value is required
//               </Typography>
//             )}
//           </FormControl>
//         );
//       case "date":
//         return (
//           <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
//             <FormControl fullWidth size="small" error={validateValue(rule)}>
//               <TextField
//                 fullWidth
//                 size="small"
//                 type="date"
//                 value={rule.value}
//                 onChange={(e) => updateValue(e.target.value)}
//                 placeholder="Select date"
//                 variant="outlined"
//                 InputLabelProps={{ shrink: true }}
//                 error={validateValue(rule)}
//                 sx={{ marginTop: validateValue(rule) ? "22px" : 0 }}
//               />
//               {validateValue(rule) && (
//                 <Typography color="error" variant="caption">
//                   Value is required
//                 </Typography>
//               )}
//             </FormControl>
//             <FormControl fullWidth size="small">
//               <InputLabel>Time Unit</InputLabel>
//               <Select
//                 value={rule.timeUnit}
//                 onChange={(e) => updateTimeUnit(e.target.value)}
//                 label="Time Unit"
//               >
//                 <MenuItem value="">Select...</MenuItem>
//                 {timeUnitOptions.map((option) => (
//                   <MenuItem key={option.value} value={option.value}>
//                     {option.label}
//                   </MenuItem>
//                 ))}
//               </Select>
//             </FormControl>
//           </Box>
//         );
//       default:
//         return (
//           <FormControl fullWidth size="small" error={validateValue(rule)}>
//             <TextField
//               fullWidth
//               size="small"
//               value={rule.value}
//               onChange={(e) => updateValue(e.target.value)}
//               placeholder="Value"
//               variant="outlined"
//               error={validateValue(rule)}
//               sx={{ marginTop: validateValue(rule) ? "22px" : 0 }}
//             />
//             {validateValue(rule) && (
//               <Typography color="error" variant="caption">
//                 Value is required
//               </Typography>
//             )}
//           </FormControl>
//         );
//     }
//   };

//   const RuleComponent = ({ rule, groupPath, index }) => {
//     const selectedField = fieldOptions.find((f) => f.value === rule.field);
//     const operators =
//       operatorList.data?.data?.find(
//         (op) => op.fieldType === selectedField?.type
//       )?.operators || [];

//     return (
//       <Box
//         sx={{
//           display: "flex",
//           alignItems: "center",
//           gap: 2,
//           p: 2,
//           bgcolor: "grey.100",
//           borderRadius: 2,
//           transition: "background-color 0.2s ease",
//           "&:hover": { bgcolor: "grey.200" },
//         }}
//       >
//         <FormControl fullWidth size="small">
//           <InputLabel>Select field...</InputLabel>
//           <Select
//             value={rule.field}
//             onChange={(e) => {
//               updateRule(groupPath, index, "field", e.target.value);
//               updateRule(groupPath, index, "operator", "");
//               updateRule(groupPath, index, "value", "");
//               updateRule(groupPath, index, "timeUnit", "");
//             }}
//             label="Select field..."
//           >
//             <MenuItem value="">Select field...</MenuItem>
//             {fieldOptions.map((option) => (
//               <MenuItem key={option.value} value={option.value}>
//                 {option.label}
//               </MenuItem>
//             ))}
//           </Select>
//         </FormControl>

//         <FormControl fullWidth size="small" disabled={!rule.field}>
//           <InputLabel>Select operator...</InputLabel>
//           <Select
//             value={rule.operator}
//             onChange={(e) => updateRule(groupPath, index, "operator", e.target.value)}
//             label="Select operator..."
//           >
//             <MenuItem value="">Select operator...</MenuItem>
//             {operatorList.isLoading ? (
//               <MenuItem disabled>Loading operators...</MenuItem>
//             ) : (
//               operators.map((op) => (
//                 <MenuItem key={op._id} value={op.operatorKey}>
//                   {op.operatorName}
//                 </MenuItem>
//               ))
//             )}
//           </Select>
//         </FormControl>

//         {renderValueInput(rule, groupPath, index)}

//         <IconButton
//           onClick={() => removeItem(groupPath, index)}
//           color="error"
//           aria-label="Remove rule"
//         >
//           <CloseIcon />
//         </IconButton>
//       </Box>
//     );
//   };

//   const GroupComponent = ({ group, groupPath = [], isRoot = false }) => {
//     const [collapsed, setCollapsed] = useState(false);

//     return (
//       <Box
//         sx={{
//           border: isRoot ? "2px solid" : "1px solid",
//           borderColor: isRoot ? "primary.light" : "grey.300",
//           borderRadius: 2,
//           p: 3,
//           width: isRoot ? "auto" : "auto",
//           bgcolor: isRoot ? "background.paper" : "inherit",
//           boxShadow: isRoot ? 3 : 1,
//           transition: "all 0.3s ease-in-out",
//           "&:hover": { boxShadow: 4 },
//         }}
//       >
//         <Box
//           sx={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//             mb: 3,
//           }}
//         >
//           <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
//             {!isRoot && (
//               <IconButton
//                 onClick={() => setCollapsed(!collapsed)}
//                 sx={{
//                   bgcolor: "grey.100",
//                   "&:hover": { bgcolor: "grey.200" },
//                   transition: "background-color 0.2s ease",
//                 }}
//                 aria-label="Toggle group collapse"
//               >
//                 {collapsed ? <ChevronRightIcon /> : <ExpandMoreIcon />}
//               </IconButton>
//             )}
//             <Typography
//               variant="subtitle2"
//               sx={{
//                 fontWeight: "medium",
//                 color: "text.secondary",
//                 fontSize: "0.9rem",
//               }}
//             >
//               {isRoot ? "Root Condition Group" : "Nested Group"}
//             </Typography>
//             <FormControl size="small">
//               <InputLabel>Logic</InputLabel>
//               <Select
//                 value={group.logic}
//                 onChange={(e) => updateGroupLogic(groupPath, e.target.value)}
//                 label="Logic"
//                 sx={{ fontSize: "0.85rem" }}
//               >
//                 <MenuItem value="AND">AND</MenuItem>
//                 <MenuItem value="OR">OR</MenuItem>
//               </Select>
//             </FormControl>
//           </Box>

//           <Box sx={{ display: "flex", gap: 1 }}>
//             <Button
//               variant="contained"
//               color="primary"
//               size="small"
//               onClick={() => addRule(groupPath)}
//               startIcon={<AddIcon />}
//               sx={{
//                 fontSize: "0.85rem",
//                 borderRadius: 1,
//                 px: 2,
//                 py: 0.5,
//                 transition: "all 0.2s ease",
//                 "&:hover": { transform: "scale(1.05)" },
//               }}
//             >
//               Rule
//             </Button>
//             <Button
//               variant="contained"
//               color="success"
//               size="small"
//               onClick={() => addGroup(groupPath)}
//               startIcon={<AddIcon />}
//               sx={{
//                 fontSize: "0.85rem",
//                 borderRadius: 1,
//                 px: 2,
//                 py: 0.5,
//                 transition: "all 0.2s ease",
//                 "&:hover": { transform: "scale(1.05)" },
//               }}
//             >
//               Group
//             </Button>
//             {!isRoot && (
//               <IconButton
//                 onClick={() => {
//                   const parentPath = groupPath.slice(0, -1);
//                   const index = groupPath[groupPath.length - 1];
//                   removeItem(parentPath, index);
//                 }}
//                 color="error"
//                 aria-label="Remove group"
//               >
//                 <CloseIcon />
//               </IconButton>
//             )}
//           </Box>
//         </Box>

//         {!collapsed && (
//           <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
//             {group.rules.map((rule, index) => (
//               <Box key={rule.id || index}>
//                 {index > 0 && (
//                   <Box sx={{ py: 1 }}>
//                     <Typography
//                       variant="caption"
//                       sx={{
//                         pl: 1,
//                         fontSize: "0.75rem",
//                         color: "text.secondary",
//                         fontWeight: "medium",
//                         bgcolor: "grey.100",
//                         borderRadius: "12px",
//                         px: 1.5,
//                         py: 0.5,
//                         display: "inline-block",
//                         transition: "all 0.2s ease",
//                       }}
//                     >
//                       {group.logic}
//                     </Typography>
//                   </Box>
//                 )}
//                 {rule.logic ? (
//                   <GroupComponent
//                     group={rule}
//                     groupPath={[...groupPath, index]}
//                   />
//                 ) : (
//                   <RuleComponent
//                     rule={rule}
//                     groupPath={groupPath}
//                     index={index}
//                   />
//                 )}
//               </Box>
//             ))}
//           </Box>
//         )}
//       </Box>
//     );
//   };

//   useEffect(() => {
//     const transformNotificationData = () => {
//       const conditionGroups = [];

//       const flattenGroup = (group, path = []) => {
//         const conditions = [];
//         group.rules.forEach((rule) => {
//           if (rule.logic) {
//             conditionGroups.push({
//               group_operator: rule.logic,
//               conditions: [],
//             });
//             flattenGroup(rule, [...path, conditionGroups.length - 1]);
//           } else {
//             const fieldOption = fieldOptions.find(
//               (f) => f.value === rule.field
//             );
//             if (fieldOption) {
//               conditions.push({
//                 attributeId: fieldOption.attributeId,
//                 operator: rule.operator,
//                 value: rule.value,
//                 timeUnit: rule.timeUnit || "",
//               });
//             }
//           }
//         });
//         if (conditions.length > 0) {
//           conditionGroups.push({
//             group_operator: group.logic,
//             conditions,
//           });
//         }
//       };

//       flattenGroup(notification.conditionGroup);
//       return {
//         name: notification.name,
//         organizationId: organizationId,
//         entityId: notification.entityId,
//         triggerFieldId: "",
//         isActive: true,
//         conditionGroups,
//       };
//     };

//     onChange(transformNotificationData());
//   }, [notification, fieldOptions, onChange, organizationId]);

//   return (
//     <Box
//       sx={{
//         maxWidth: "1200px",
//         mx: "auto",
//         p: 4,
//         bgcolor: "background.paper",
//         borderRadius: 2,
//       }}
//     >
//       <Box sx={{ mb: 4, p: 3, bgcolor: "grey.50", borderRadius: 2 }}>
//         <Grid container spacing={2}>
//           <Grid item xs={12} sm={4}>
//             <TextField
//               fullWidth
//               label="Name"
//               value={notification.name}
//               onChange={(e) =>
//                 setNotification({ ...notification, name: e.target.value })
//               }
//               variant="outlined"
//               size="small"
//               required
//               error={!notification.name}
//               helperText={!notification.name ? "Name is required" : ""}
//             />
//           </Grid>
//           <Grid item xs={12} sm={4}>
//             <FormControl fullWidth size="small">
//               <InputLabel>Entity</InputLabel>
//               <Select
//                 value={notification.entityId}
//                 onChange={(e) =>
//                   setNotification({ ...notification, entityId: e.target.value })
//                 }
//                 label="Entity"
//                 required
//                 error={!notification.entityId}
//               >
//                 <MenuItem value="">Select Entity...</MenuItem>
//                 {notificationTypeList.data?.data?.map((entity) => (
//                   <MenuItem key={entity._id} value={entity._id}>
//                     {entity.name}
//                   </MenuItem>
//                 ))}
//               </Select>
//               {!notification.entityId && (
//                 <Typography color="error" variant="caption">
//                   Entity is required
//                 </Typography>
//               )}
//             </FormControl>
//           </Grid>
//         </Grid>
//       </Box>
//       <GroupComponent group={notification.conditionGroup} isRoot={true} />
//     </Box>
//   );
// };

// // EditNotificationTypes Component
// export default function EditNotificationTypes() {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();
//   const [expanded, setExpanded] = useState({ condition: true, reminder: true });
//   const [notificationData, setNotificationData] = useState({});
//   const [notificationTypeId, setNotificationTypeId] = useState<string | null>(id || null);
//   const [initialConditionGroup, setInitialConditionGroup] = useState(null);
//   const [isDataLoaded, setIsDataLoaded] = useState(false);

//   const notificationTypeList = useGet(
//     ["notificationTypeList"],
//     `${GET.Entity_List}`,
//     true
//   );
//   const notificationDetails = useGet(
//     ["notificationDetails", id],
//     id ? `/notivix/notification-setting/type/${id}` : null,
//     !!id
//   );
//   const updateNotification = usePost(["updateNotification"]);
//   const notificationResponse = usePost(["notificationResponse"]);

//   // Use custom hook for fieldOptions
//   const fieldOptions = useFieldOptions(notificationData.entityId, notificationTypeList);

//   const handleAccordionChange = (panel) => (event, isExpanded) => {
//     setExpanded((prev) => ({ ...prev, [panel]: isExpanded }));
//   };

//   // Transform backend response to condition group format
//   const transformBackendToConditionGroup = (conditionGroups, availableFieldOptions) => {
//     const generateId = () => Math.random().toString(36).substr(2, 9);
    
//     if (!conditionGroups || conditionGroups.length === 0) {
//       return { logic: "AND", rules: [] };
//     }

//     const rootGroup = {
//       logic: conditionGroups[0].group_operator || "AND",
//       rules: [],
//     };

//     conditionGroups.forEach((group) => {
//       group.conditions.forEach((condition) => {
//         const fieldOption = availableFieldOptions.find(
//           (f) => f.attributeId === condition.attributeId
//         );
        
//         if (fieldOption) {
//           rootGroup.rules.push({
//             id: generateId(),
//             field: fieldOption.value,
//             operator: condition.operator,
//             value: condition.value,
//             timeUnit: condition.timeUnit || "",
//           });
//         } else {
//           console.warn(`Field with attributeId ${condition.attributeId} not found in fieldOptions`);
//           rootGroup.rules.push({
//             id: generateId(),
//             field: condition.attributeId,
//             operator: condition.operator,
//             value: condition.value,
//             timeUnit: condition.timeUnit || "",
//           });
//         }
//       });
//     });

//     return rootGroup;
//   };

//   // Load notification details and set basic data
//   useEffect(() => {
//     if (notificationDetails.data?.success && notificationDetails.data?.data && !isDataLoaded) {
//       const data = notificationDetails.data.data;
//       console.log("Backend data:", data);
      
//       setNotificationData({
//         name: data.name || "",
//         organizationId: data.organizationId || "",
//         entityId: data.entityId || "",
//         triggerFieldId: "",
//         isActive: data.isActive || true,
//         conditionGroups: data.conditionGroups || [],
//       });
      
//       setIsDataLoaded(true);
//     }
//   }, []);

//   // Transform condition groups when data and field options are available
//   useEffect(() => {
//     if (
//       isDataLoaded &&
//       fieldOptions.length > 0 &&
//       notificationData.conditionGroups &&
//       notificationData.conditionGroups.length > 0 &&
//       !initialConditionGroup
//     ) {
//       console.log("Transforming condition groups:", notificationData.conditionGroups);
//       console.log("Available field options:", fieldOptions);
      
//       const transformedGroup = transformBackendToConditionGroup(
//         notificationData.conditionGroups,
//         fieldOptions
//       );
      
//       console.log("Transformed condition group:", transformedGroup);
//       setInitialConditionGroup(transformedGroup);
//     }
//   }, [isDataLoaded, fieldOptions, notificationData.conditionGroups, initialConditionGroup]);

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     if (!notificationData.name || !notificationData.entityId) {
//       toast.error("Name and Entity are required fields.");
//       return;
//     }

//     try {
//       const response = await updateNotification.mutateAsync({
//         url: `/notivix/notification-setting/type/update/${id}`,
//         payload: notificationData,
//       });

//       if (response.success) {
//         toast.success("Notification updated successfully!");
//         // Close the condition accordion upon successful submission
//         setExpanded((prev) => ({ ...prev, condition: false }));
//         navigate("/notivix/notification-types");
//       } else {
//         throw new Error("Notification update failed");
//       }
//     } catch (error) {
//       console.error("Error updating notification:", error);
//       toast.error("Failed to update notification. Please try again.");
//     }
//   };

//   return (
//     <Box
//       sx={{
//         flexGrow: 1,
//         p: 3,
//         ml: { xs: 0 },
//         backgroundColor: STYLE_GUIDE.COLORS.backgroundLight,
//         minHeight: "100vh",
//       }}
//     >
//       <Typography
//         variant="h4"
//         sx={{
//           mb: 3,
//           fontWeight: 400,
//           color: STYLE_GUIDE.COLORS.primaryDark,
//         }}
//       >
//         Edit Notification Type
//       </Typography>
//       <Card
//         sx={{
//           backgroundColor: STYLE_GUIDE.COLORS.white,
//           borderRadius: 2,
//           boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
//         }}
//       >
//         <CardContent sx={{ p: 3 }}>
//           {notificationDetails.isLoading ? (
//             <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
//               <CircularProgress />
//             </Box>
//           ) : notificationDetails.isError ? (
//             <Typography color="error">
//               Failed to load notification type details. Please try again.
//             </Typography>
//           ) : (
//             <Box component="form" onSubmit={handleSubmit}>
//               <Accordion
//                 expanded={expanded.condition}
//                 onChange={handleAccordionChange("condition")}
//                 sx={{ mb: 2, borderRadius: 2, boxShadow: 1 }}
//               >
//                 <AccordionSummary
//                   expandIcon={<ExpandMoreIcon />}
//                   aria-controls="condition-content"
//                   id="condition-header"
//                   sx={{ bgcolor: "grey.50", borderRadius: 2 }}
//                 >
//                   <Typography
//                     variant="h6"
//                     sx={{ fontWeight: "bold", color: "text.primary" }}
//                   >
//                     Condition Rule Builder
//                   </Typography>
//                 </AccordionSummary>
//                 <AccordionDetails>
//                   <ErrorBoundary>
//                     {isDataLoaded && fieldOptions.length > 0 ? (
//                       <ConditionRuleBuilder
//                         onChange={setNotificationData}
//                         notificationTypeList={notificationTypeList}
//                         fieldOptions={fieldOptions}
//                         notificationResponse={notificationResponse.data?.data}
//                         initialConditionGroup={initialConditionGroup}
//                         initialNotificationData={notificationData}
//                       />
//                     ) : (
//                       <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
//                         <CircularProgress />
//                         <Typography sx={{ ml: 2 }}>Loading form data...</Typography>
//                       </Box>
//                     )}
//                   </ErrorBoundary>
//                   <Box
//                     sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}
//                   >
//                     <Button
//                       variant="outlined"
//                       color="secondary"
//                       onClick={() => navigate("/notivix/notification-types")}
//                       sx={{ px: 4, borderRadius: 1 }}
//                     >
//                       Cancel
//                     </Button>
//                     <Button
//                       type="submit"
//                       variant="contained"
//                       color="primary"
//                       size="large"
//                       sx={{ px: 4, borderRadius: 1 }}
//                       disabled={updateNotification.isLoading || !isDataLoaded}
//                     >
//                       {updateNotification.isLoading ? "Updating..." : "Update"}
//                     </Button>
//                   </Box>
//                 </AccordionDetails>
//               </Accordion>
//               <Accordion
//                 expanded={expanded.reminder && notificationTypeId !== null}
//                 onChange={handleAccordionChange("reminder")}
//                 sx={{ mb: 2, borderRadius: 2, boxShadow: 1 }}
//                 disabled={notificationTypeId === null}
//               >
//                 <AccordionSummary
//                   expandIcon={<ExpandMoreIcon />}
//                   aria-controls="reminder-content"
//                   id="reminder-header"
//                   sx={{ bgcolor: "grey.50", borderRadius: 2 }}
//                 >
//                   <Typography
//                     variant="h6"
//                     sx={{ fontWeight: "bold", color: "text.primary" }}
//                   >
//                     Reminder Task
//                   </Typography>
//                 </AccordionSummary>
//                 <AccordionDetails>
//                   <ErrorBoundary>
//                     <Frequency
//                       fieldOptions={fieldOptions}
//                       notificationTypeId={notificationTypeId}
//                     />
//                   </ErrorBoundary>
//                 </AccordionDetails>
//               </Accordion>
//             </Box>
//           )}
//         </CardContent>
//       </Card>
//     </Box>
//   );
// }

// import * as React from "react";
// import { useState, useEffect, useMemo } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { toast } from "react-toastify";
// import {
//   Box,
//   Card,
//   CardContent,
//   Typography,
//   TextField,
//   Select,
//   MenuItem,
//   Button,
//   IconButton,
//   FormControl,
//   InputLabel,
//   Grid,
//   Accordion,
//   AccordionSummary,
//   AccordionDetails,
//   CircularProgress,
// } from "@mui/material";
// import AddIcon from "@mui/icons-material/Add";
// import CloseIcon from "@mui/icons-material/Close";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// import ChevronRightIcon from "@mui/icons-material/ChevronRight";
// import useGet from "../../hooks/useGet";
// import usePost from "../../hooks/usePost";
// import usePut from "../../hooks/usePut";
// import { GET, POST } from "../../services/apiRoutes";
// import { STYLE_GUIDE } from "../../styles";
// import { useSelector } from "react-redux";
// import { RootState } from "../../reducers";
// import Frequency from "./Frequency";

// // Error Boundary Component
// class ErrorBoundary extends React.Component {
//   state = { hasError: false };

//   static getDerivedStateFromError(error) {
//     return { hasError: true };
//   }

//   render() {
//     if (this.state.hasError) {
//       return <Typography color="error">Something went wrong.</Typography>;
//     }
//     return this.props.children;
//   }
// }

// // Custom Hook for Field Options
// const useFieldOptions = (entityId, notificationTypeList) => {
//   const [fieldOptions, setFieldOptions] = useState([]);

//   // Memoize dependencies to prevent unnecessary triggers
//   const memoizedEntityId = useMemo(() => entityId, [entityId]);
//   const memoizedNotificationTypeListData = useMemo(
//     () => notificationTypeList.data,
//     [notificationTypeList.data?.data] // Depend on the actual data array
//   );

//   useEffect(() => {
//     console.log("useFieldOptions useEffect triggered", {
//       entityId: memoizedEntityId,
//       hasNotificationTypeListData: !!memoizedNotificationTypeListData?.data,
//     });

//     if (memoizedEntityId && memoizedNotificationTypeListData?.data) {
//       const selectedEntity = memoizedNotificationTypeListData.data.find(
//         (entity) => entity._id === memoizedEntityId
//       );

//       if (selectedEntity && selectedEntity.attributes) {
//         const newFieldOptions = selectedEntity.attributes.map((attr) => ({
//           value: attr.mappingName,
//           label: attr.name,
//           type: attr.type,
//           attributeId: attr._id,
//         }));

//         setFieldOptions((prevFieldOptions) => {
//           if (JSON.stringify(prevFieldOptions) !== JSON.stringify(newFieldOptions)) {
//             console.log("Field options updated:", newFieldOptions);
//             return newFieldOptions;
//           }
//           console.log("Field options unchanged, skipping update");
//           return prevFieldOptions;
//         });
//       } else {
//         setFieldOptions((prevFieldOptions) => {
//           if (prevFieldOptions.length > 0) {
//             console.log("Resetting field options to empty");
//             return [];
//           }
//           console.log("Field options already empty, skipping reset");
//           return prevFieldOptions;
//         });
//       }
//     } else {
//       setFieldOptions((prevFieldOptions) => {
//         if (prevFieldOptions.length > 0) {
//           console.log("Resetting field options to empty due to missing entityId or data");
//           return [];
//         }
//         console.log("Field options already empty, skipping reset");
//         return prevFieldOptions;
//       });
//     }
//   }, [memoizedEntityId, memoizedNotificationTypeListData]);

//   return fieldOptions;
// };

// // ConditionRuleBuilder Component
// const ConditionRuleBuilder = ({
//   onChange,
//   notificationTypeList,
//   fieldOptions,
//   notificationResponse,
//   initialConditionGroup,
//   initialNotificationData,
// }) => {
//   const organizationId = useSelector(
//     (state: RootState) => state.userPermission?.currentUser?.organizationId?._id
//   );

//   const [notification, setNotification] = useState({
//     name: initialNotificationData?.name || "",
//     entityId: initialNotificationData?.entityId || "",
//     conditionGroup: initialConditionGroup || {
//       logic: "AND",
//       rules: [],
//     },
//   });

//   const operatorList = usePost(["operatorList"]);

//   useEffect(() => {
//     operatorList.mutate({
//       url: POST.OPERATOR_LIST,
//       payload: { fieldType: "all" },
//     });
//   }, []);

//   useEffect(() => {
//     if (initialNotificationData) {
//       setNotification((prev) => ({
//         ...prev,
//         name: initialNotificationData.name || "",
//         entityId: initialNotificationData.entityId || "",
//       }));
//     }
//   }, [initialNotificationData]);

//   useEffect(() => {
//     if (initialConditionGroup) {
//       setNotification((prev) => ({
//         ...prev,
//         conditionGroup: initialConditionGroup,
//       }));
//     }
//   }, [initialConditionGroup]);

//   const statusOptions = [
//     "open",
//     "rated to search",
//     "rated to draft ih",
//     "rated to draft oc",
//     "review rate to draft",
//     "filing requested",
//     "submitted",
//   ];
//   const caseTypeOptions = ["PRI", "PRO", "TRA", "DES"];
//   const countryCodeOptions = ["EP", "IN", "WO", "FAM", "US", "CN", "JP"];
//   const timeUnitOptions = [
//     { value: "M", label: "Month (M)" },
//     { value: "d", label: "Days (d)" },
//     { value: "y", label: "Yearly (y)" },
//   ];

//   const generateId = () => Math.random().toString(36).substr(2, 9);

//   const addRule = (groupPath) => {
//     const newRule = {
//       id: generateId(),
//       field: "",
//       operator: "",
//       value: "",
//       timeUnit: "",
//     };
//     const updatedNotification = { ...notification };
//     const group = getGroupByPath(updatedNotification.conditionGroup, groupPath);
//     group.rules.push(newRule);
//     setNotification(updatedNotification);
//   };

//   const addGroup = (groupPath) => {
//     const newGroup = {
//       id: generateId(),
//       logic: "AND",
//       rules: [],
//     };
//     const updatedNotification = { ...notification };
//     const group = getGroupByPath(updatedNotification.conditionGroup, groupPath);
//     group.rules.push(newGroup);
//     setNotification(updatedNotification);
//   };

//   const removeItem = (groupPath, index) => {
//     const updatedNotification = { ...notification };
//     const group = getGroupByPath(updatedNotification.conditionGroup, groupPath);
//     group.rules.splice(index, 1);
//     setNotification(updatedNotification);
//   };

//   const updateRule = (groupPath, index, field, value) => {
//     const updatedNotification = { ...notification };
//     const group = getGroupByPath(updatedNotification.conditionGroup, groupPath);
//     group.rules[index][field] = value;
//     if (field === "operator") {
//       const selectedField = fieldOptions.find(
//         (f) => f.value === group.rules[index].field
//       );
//       const operators = operatorList.data?.data?.find(
//         (op) => op.fieldType === selectedField?.type
//       )?.operators;
//       const selectedOperator = operators?.find(
//         (op) => op.operatorKey === value
//       );
//       if (selectedOperator && !selectedOperator.valueRequired) {
//         group.rules[index].value = "";
//         group.rules[index].timeUnit = "";
//       }
//     }
//     setNotification(updatedNotification);
//   };

//   const updateGroupLogic = (groupPath, logic) => {
//     const updatedNotification = { ...notification };
//     const group = getGroupByPath(updatedNotification.conditionGroup, groupPath);
//     group.logic = logic;
//     setNotification(updatedNotification);
//   };

//   const getGroupByPath = (root, path) => {
//     if (path.length === 0) return root;
//     let current = root;
//     for (const index of path) {
//       current = current.rules[index];
//     }
//     return current;
//   };

//   const validateValue = (rule) => {
//     const field = fieldOptions.find((f) => f.value === rule.field);
//     const operators =
//       operatorList.data?.data?.find((op) => op.fieldType === field?.type)
//         ?.operators || [];
//     const selectedOperator = operators?.find(
//       (op) => op.operatorKey === rule.operator
//     );
//     return selectedOperator?.valueRequired && !rule.value;
//   };

//   const renderValueInput = (rule, groupPath, index) => {
//     const field = fieldOptions.find((f) => f.value === rule.field);
//     const operators =
//       operatorList.data?.data?.find((op) => op.fieldType === field?.type)
//         ?.operators || [];
//     const selectedOperator = operators?.find(
//       (op) => op.operatorKey === rule.operator
//     );
//     const valueRequired = selectedOperator?.valueRequired ?? true;
//     const updateValue = (value) => updateRule(groupPath, index, "value", value);
//     const updateTimeUnit = (value) =>
//       updateRule(groupPath, index, "timeUnit", value);

//     if (!field || !valueRequired) {
//       return null;
//     }

//     switch (field.type) {
//       case "boolean":
//         return (
//           <FormControl fullWidth size="small" error={validateValue(rule)}>
//             <InputLabel>Select...</InputLabel>
//             <Select
//               value={rule.value}
//               onChange={(e) => updateValue(e.target.value === "true")}
//               label="Select..."
//             >
//               <MenuItem value="">Select...</MenuItem>
//               <MenuItem value="true">True</MenuItem>
//               <MenuItem value="false">False</MenuItem>
//             </Select>
//             {validateValue(rule) && (
//               <Typography color="error" variant="caption">
//                 Value is required
//               </Typography>
//             )}
//           </FormControl>
//         );
//       case "select":
//         if (rule.field === "status") {
//           return rule.operator === "in" ? (
//             <FormControl fullWidth size="small" error={validateValue(rule)}>
//               <InputLabel>Select...</InputLabel>
//               <Select
//                 multiple
//                 value={rule.value ? rule.value.split(",") : []}
//                 onChange={(e) => updateValue(e.target.value.join(","))}
//                 label="Select..."
//                 sx={{ minHeight: 80 }}
//               >
//                 {statusOptions.map((option) => (
//                   <MenuItem key={option} value={option}>
//                     {option}
//                   </MenuItem>
//                 ))}
//               </Select>
//               {validateValue(rule) && (
//                 <Typography color="error" variant="caption">
//                   Value is required
//                 </Typography>
//               )}
//             </FormControl>
//           ) : (
//             <FormControl fullWidth size="small" error={validateValue(rule)}>
//               <InputLabel>Select...</InputLabel>
//               <Select
//                 value={rule.value}
//                 onChange={(e) => updateValue(e.target.value)}
//                 label="Select..."
//               >
//                 <MenuItem value="">Select...</MenuItem>
//                 {statusOptions.map((option) => (
//                   <MenuItem key={option} value={option}>
//                     {option}
//                   </MenuItem>
//                 ))}
//               </Select>
//               {validateValue(rule) && (
//                 <Typography color="error" variant="caption">
//                   Value is required
//                 </Typography>
//               )}
//             </FormControl>
//           );
//         }
//         if (rule.field === "case_type") {
//           return rule.operator === "in" ? (
//             <FormControl fullWidth size="small" error={validateValue(rule)}>
//               <InputLabel>Select...</InputLabel>
//               <Select
//                 multiple
//                 value={rule.value ? rule.value.split(",") : []}
//                 onChange={(e) => updateValue(e.target.value.join(","))}
//                 label="Select..."
//                 sx={{ minHeight: 80 }}
//               >
//                 {caseTypeOptions.map((option) => (
//                   <MenuItem key={option} value={option}>
//                     {option}
//                   </MenuItem>
//                 ))}
//               </Select>
//               {validateValue(rule) && (
//                 <Typography color="error" variant="caption">
//                   Value is required
//                 </Typography>
//               )}
//             </FormControl>
//           ) : (
//             <FormControl fullWidth size="small" error={validateValue(rule)}>
//               <InputLabel>Select...</InputLabel>
//               <Select
//                 value={rule.value}
//                 onChange={(e) => updateValue(e.target.value)}
//                 label="Select..."
//               >
//                 <MenuItem value="">Select...</MenuItem>
//                 {caseTypeOptions.map((option) => (
//                   <MenuItem key={option} value={option}>
//                     {option}
//                   </MenuItem>
//                 ))}
//               </Select>
//               {validateValue(rule) && (
//                 <Typography color="error" variant="caption">
//                   Value is required
//                 </Typography>
//               )}
//             </FormControl>
//           );
//         }
//         if (rule.field === "country_code") {
//           return rule.operator === "in" ? (
//             <FormControl fullWidth size="small" error={validateValue(rule)}>
//               <InputLabel>Select...</InputLabel>
//               <Select
//                 multiple
//                 value={rule.value ? rule.value.split(",") : []}
//                 onChange={(e) => updateValue(e.target.value.join(","))}
//                 label="Select..."
//                 sx={{ minHeight: 80 }}
//               >
//                 {countryCodeOptions.map((option) => (
//                   <MenuItem key={option} value={option}>
//                     {option}
//                   </MenuItem>
//                 ))}
//               </Select>
//               {validateValue(rule) && (
//                 <Typography color="error" variant="caption">
//                   Value is required
//                 </Typography>
//               )}
//             </FormControl>
//           ) : (
//             <FormControl fullWidth size="small" error={validateValue(rule)}>
//               <InputLabel>Select...</InputLabel>
//               <Select
//                 value={rule.value}
//                 onChange={(e) => updateValue(e.target.value)}
//                 label="Select..."
//               >
//                 <MenuItem value="">Select...</MenuItem>
//                 {countryCodeOptions.map((option) => (
//                   <MenuItem key={option} value={option}>
//                     {option}
//                   </MenuItem>
//                 ))}
//               </Select>
//               {validateValue(rule) && (
//                 <Typography color="error" variant="caption">
//                   Value is required
//                 </Typography>
//               )}
//             </FormControl>
//           );
//         }
//         return (
//           <FormControl fullWidth size="small" error={validateValue(rule)}>
//             <TextField
//               fullWidth
//               size="small"
//               value={rule.value}
//               onChange={(e) => updateValue(e.target.value)}
//               placeholder="Value"
//               variant="outlined"
//               error={validateValue(rule)}
//               sx={{ marginTop: validateValue(rule) ? "22px" : 0 }}
//             />
//             {validateValue(rule) && (
//               <Typography color="error" variant="caption">
//                 Value is required
//               </Typography>
//             )}
//           </FormControl>
//         );
//       case "date":
//         return (
//           <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
//             <FormControl fullWidth size="small" error={validateValue(rule)}>
//               <TextField
//                 fullWidth
//                 size="small"
//                 type="date"
//                 value={rule.value}
//                 onChange={(e) => updateValue(e.target.value)}
//                 placeholder="Select date"
//                 variant="outlined"
//                 InputLabelProps={{ shrink: true }}
//                 error={validateValue(rule)}
//                 sx={{ marginTop: validateValue(rule) ? "22px" : 0 }}
//               />
//               {validateValue(rule) && (
//                 <Typography color="error" variant="caption">
//                   Value is required
//                 </Typography>
//               )}
//             </FormControl>
//             <FormControl fullWidth size="small">
//               <InputLabel>Time Unit</InputLabel>
//               <Select
//                 value={rule.timeUnit}
//                 onChange={(e) => updateTimeUnit(e.target.value)}
//                 label="Time Unit"
//               >
//                 <MenuItem value="">Select...</MenuItem>
//                 {timeUnitOptions.map((option) => (
//                   <MenuItem key={option.value} value={option.value}>
//                     {option.label}
//                   </MenuItem>
//                 ))}
//               </Select>
//             </FormControl>
//           </Box>
//         );
//       default:
//         return (
//           <FormControl fullWidth size="small" error={validateValue(rule)}>
//             <TextField
//               fullWidth
//               size="small"
//               value={rule.value}
//               onChange={(e) => updateValue(e.target.value)}
//               placeholder="Value"
//               variant="outlined"
//               error={validateValue(rule)}
//               sx={{ marginTop: validateValue(rule) ? "22px" : 0 }}
//             />
//             {validateValue(rule) && (
//               <Typography color="error" variant="caption">
//                 Value is required
//               </Typography>
//             )}
//           </FormControl>
//         );
//     }
//   };

//   const RuleComponent = ({ rule, groupPath, index }) => {
//     const selectedField = fieldOptions.find((f) => f.value === rule.field);
//     const operators =
//       operatorList.data?.data?.find(
//         (op) => op.fieldType === selectedField?.type
//       )?.operators || [];

//     return (
//       <Box
//         sx={{
//           display: "flex",
//           alignItems: "center",
//           gap: 2,
//           p: 2,
//           bgcolor: "grey.100",
//           borderRadius: 2,
//           transition: "background-color 0.2s ease",
//           "&:hover": { bgcolor: "grey.200" },
//         }}
//       >
//         <FormControl fullWidth size="small">
//           <InputLabel>Select field...</InputLabel>
//           <Select
//             value={rule.field}
//             onChange={(e) => {
//               updateRule(groupPath, index, "field", e.target.value);
//               updateRule(groupPath, index, "operator", "");
//               updateRule(groupPath, index, "value", "");
//               updateRule(groupPath, index, "timeUnit", "");
//             }}
//             label="Select field..."
//           >
//             <MenuItem value="">Select field...</MenuItem>
//             {fieldOptions.map((option) => (
//               <MenuItem key={option.value} value={option.value}>
//                 {option.label}
//               </MenuItem>
//             ))}
//           </Select>
//         </FormControl>

//         <FormControl fullWidth size="small" disabled={!rule.field}>
//           <InputLabel>Select operator...</InputLabel>
//           <Select
//             value={rule.operator}
//             onChange={(e) => updateRule(groupPath, index, "operator", e.target.value)}
//             label="Select operator..."
//           >
//             <MenuItem value="">Select operator...</MenuItem>
//             {operatorList.isLoading ? (
//               <MenuItem disabled>Loading operators...</MenuItem>
//             ) : (
//               operators.map((op) => (
//                 <MenuItem key={op._id} value={op.operatorKey}>
//                   {op.operatorName}
//                 </MenuItem>
//               ))
//             )}
//           </Select>
//         </FormControl>

//         {renderValueInput(rule, groupPath, index)}

//         <IconButton
//           onClick={() => removeItem(groupPath, index)}
//           color="error"
//           aria-label="Remove rule"
//         >
//           <CloseIcon />
//         </IconButton>
//       </Box>
//     );
//   };

//   const GroupComponent = ({ group, groupPath = [], isRoot = false }) => {
//     const [collapsed, setCollapsed] = useState(false);

//     return (
//       <Box
//         sx={{
//           border: isRoot ? "2px solid" : "1px solid",
//           borderColor: isRoot ? "primary.light" : "grey.300",
//           borderRadius: 2,
//           p: 3,
//           width: isRoot ? "auto" : "auto",
//           bgcolor: isRoot ? "background.paper" : "inherit",
//           boxShadow: isRoot ? 3 : 1,
//           transition: "all 0.3s ease-in-out",
//           "&:hover": { boxShadow: 4 },
//         }}
//       >
//         <Box
//           sx={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//             mb: 3,
//           }}
//         >
//           <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
//             {!isRoot && (
//               <IconButton
//                 onClick={() => setCollapsed(!collapsed)}
//                 sx={{
//                   bgcolor: "grey.100",
//                   "&:hover": { bgcolor: "grey.200" },
//                   transition: "background-color 0.2s ease",
//                 }}
//                 aria-label="Toggle group collapse"
//               >
//                 {collapsed ? <ChevronRightIcon /> : <ExpandMoreIcon />}
//               </IconButton>
//             )}
//             <Typography
//               variant="subtitle2"
//               sx={{
//                 fontWeight: "medium",
//                 color: "text.secondary",
//                 fontSize: "0.9rem",
//               }}
//             >
//               {isRoot ? "Root Condition Group" : "Nested Group"}
//             </Typography>
//             <FormControl size="small">
//               <InputLabel>Logic</InputLabel>
//               <Select
//                 value={group.logic}
//                 onChange={(e) => updateGroupLogic(groupPath, e.target.value)}
//                 label="Logic"
//                 sx={{ fontSize: "0.85rem" }}
//               >
//                 <MenuItem value="AND">AND</MenuItem>
//                 <MenuItem value="OR">OR</MenuItem>
//               </Select>
//             </FormControl>
//           </Box>

//           <Box sx={{ display: "flex", gap: 1 }}>
//             <Button
//               variant="contained"
//               color="primary"
//               size="small"
//               onClick={() => addRule(groupPath)}
//               startIcon={<AddIcon />}
//               sx={{
//                 fontSize: "0.85rem",
//                 borderRadius: 1,
//                 px: 2,
//                 py: 0.5,
//                 transition: "all 0.2s ease",
//                 "&:hover": { transform: "scale(1.05)" },
//               }}
//             >
//               Rule
//             </Button>
//             <Button
//               variant="contained"
//               color="success"
//               size="small"
//               onClick={() => addGroup(groupPath)}
//               startIcon={<AddIcon />}
//               sx={{
//                 fontSize: "0.85rem",
//                 borderRadius: 1,
//                 px: 2,
//                 py: 0.5,
//                 transition: "all 0.2s ease",
//                 "&:hover": { transform: "scale(1.05)" },
//               }}
//             >
//               Group
//             </Button>
//             {!isRoot && (
//               <IconButton
//                 onClick={() => {
//                   const parentPath = groupPath.slice(0, -1);
//                   const index = groupPath[groupPath.length - 1];
//                   removeItem(parentPath, index);
//                 }}
//                 color="error"
//                 aria-label="Remove group"
//               >
//                 <CloseIcon />
//               </IconButton>
//             )}
//           </Box>
//         </Box>

//         {!collapsed && (
//           <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
//             {group.rules.map((rule, index) => (
//               <Box key={rule.id || index}>
//                 {index > 0 && (
//                   <Box sx={{ py: 1 }}>
//                     <Typography
//                       variant="caption"
//                       sx={{
//                         pl: 1,
//                         fontSize: "0.75rem",
//                         color: "text.secondary",
//                         fontWeight: "medium",
//                         bgcolor: "grey.100",
//                         borderRadius: "12px",
//                         px: 1.5,
//                         py: 0.5,
//                         display: "inline-block",
//                         transition: "all 0.2s ease",
//                       }}
//                     >
//                       {group.logic}
//                     </Typography>
//                   </Box>
//                 )}
//                 {rule.logic ? (
//                   <GroupComponent
//                     group={rule}
//                     groupPath={[...groupPath, index]}
//                   />
//                 ) : (
//                   <RuleComponent
//                     rule={rule}
//                     groupPath={groupPath}
//                     index={index}
//                   />
//                 )}
//               </Box>
//             ))}
//           </Box>
//         )}
//       </Box>
//     );
//   };

//   useEffect(() => {
//     const transformNotificationData = () => {
//       const conditionGroups = [];

//       const flattenGroup = (group, path = []) => {
//         const conditions = [];
//         group.rules.forEach((rule) => {
//           if (rule.logic) {
//             conditionGroups.push({
//               group_operator: rule.logic,
//               conditions: [],
//             });
//             flattenGroup(rule, [...path, conditionGroups.length - 1]);
//           } else {
//             const fieldOption = fieldOptions.find(
//               (f) => f.value === rule.field
//             );
//             if (fieldOption) {
//               conditions.push({
//                 attributeId: fieldOption.attributeId,
//                 operator: rule.operator,
//                 value: rule.value,
//                 timeUnit: rule.timeUnit || "",
//               });
//             }
//           }
//         });
//         if (conditions.length > 0) {
//           conditionGroups.push({
//             group_operator: group.logic,
//             conditions,
//           });
//         }
//       };

//       flattenGroup(notification.conditionGroup);
//       return {
//         name: notification.name,
//         organizationId: organizationId,
//         entityId: notification.entityId,
//         triggerFieldId: "",
//         isActive: true,
//         conditionGroups,
//       };
//     };

//     onChange(transformNotificationData());
//   }, [notification, fieldOptions, onChange, organizationId]);

//   return (
//     <Box
//       sx={{
//         maxWidth: "1200px",
//         mx: "auto",
//         p: 4,
//         bgcolor: "background.paper",
//         borderRadius: 2,
//       }}
//     >
//       <Box sx={{ mb: 4, p: 3, bgcolor: "grey.50", borderRadius: 2 }}>
//         <Grid container spacing={2}>
//           <Grid item xs={12} sm={4}>
//             <TextField
//               fullWidth
//               label="Name"
//               value={notification.name}
//               onChange={(e) =>
//                 setNotification({ ...notification, name: e.target.value })
//               }
//               variant="outlined"
//               size="small"
//               required
//               error={!notification.name}
//               helperText={!notification.name ? "Name is required" : ""}
//             />
//           </Grid>
//           <Grid item xs={12} sm={4}>
//             <FormControl fullWidth size="small">
//               <InputLabel>Entity</InputLabel>
//               <Select
//                 value={notification.entityId}
//                 onChange={(e) =>
//                   setNotification({ ...notification, entityId: e.target.value })
//                 }
//                 label="Entity"
//                 required
//                 error={!notification.entityId}
//               >
//                 <MenuItem value="">Select Entity...</MenuItem>
//                 {notificationTypeList.data?.data?.map((entity) => (
//                   <MenuItem key={entity._id} value={entity._id}>
//                     {entity.name}
//                   </MenuItem>
//                 ))}
//               </Select>
//               {!notification.entityId && (
//                 <Typography color="error" variant="caption">
//                   Entity is required
//                 </Typography>
//               )}
//             </FormControl>
//           </Grid>
//         </Grid>
//       </Box>
//       <GroupComponent group={notification.conditionGroup} isRoot={true} />
//     </Box>
//   );
// };

// // EditNotificationTypes Component
// export default function EditNotificationTypes() {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();
//   const [expanded, setExpanded] = useState({ condition: true, reminder: true });
//   const [notificationData, setNotificationData] = useState({});
//   const [notificationTypeId, setNotificationTypeId] = useState<string | null>(id || null);
//   const [initialConditionGroup, setInitialConditionGroup] = useState(null);
//   const [isDataLoaded, setIsDataLoaded] = useState(false);

//   // Configure useGet with caching to prevent frequent refetching
//   const notificationTypeList = useGet(
//     ["notificationTypeList"],
//     `${GET.Entity_List}`,
//     true,
//     {
//       staleTime: 5 * 60 * 1000, // Cache for 5 minutes
//       cacheTime: 10 * 60 * 1000, // Keep cache for 10 minutes
//     }
//   );
//   const notificationDetails = useGet(
//     ["notificationDetails", id],
//     id ? `/notivix/notification-setting/type/${id}` : null,
//     !!id,
//     {
//       staleTime: 5 * 60 * 1000,
//       cacheTime: 10 * 60 * 1000,
//     }
//   );
//   const updateNotification = usePost(["updateNotification"]);
//   const notificationResponse = usePost(["notificationResponse"]);

//   // Memoize notificationDetails.data to stabilize reference
//   const memoizedNotificationDetailsData = useMemo(
//     () => notificationDetails.data,
//     [notificationDetails.data?.success, notificationDetails.data?.data]
//   );

//   // Use custom hook for fieldOptions
//   const fieldOptions = useFieldOptions(notificationData.entityId, notificationTypeList);

//   const handleAccordionChange = (panel) => (event, isExpanded) => {
//     setExpanded((prev) => ({ ...prev, [panel]: isExpanded }));
//   };

//   // Transform backend response to condition group format
//   const transformBackendToConditionGroup = (conditionGroups, availableFieldOptions) => {
//     const generateId = () => Math.random().toString(36).substr(2, 9);
    
//     if (!conditionGroups || conditionGroups.length === 0) {
//       return { logic: "AND", rules: [] };
//     }

//     const rootGroup = {
//       logic: conditionGroups[0].group_operator || "AND",
//       rules: [],
//     };

//     conditionGroups.forEach((group) => {
//       group.conditions.forEach((condition) => {
//         const fieldOption = availableFieldOptions.find(
//           (f) => f.attributeId === condition.attributeId
//         );
        
//         if (fieldOption) {
//           rootGroup.rules.push({
//             id: generateId(),
//             field: fieldOption.value,
//             operator: condition.operator,
//             value: condition.value,
//             timeUnit: condition.timeUnit || "",
//           });
//         } else {
//           console.warn(`Field with attributeId ${condition.attributeId} not found in fieldOptions`);
//           rootGroup.rules.push({
//             id: generateId(),
//             field: condition.attributeId,
//             operator: condition.operator,
//             value: condition.value,
//             timeUnit: condition.timeUnit || "",
//           });
//         }
//       });
//     });

//     return rootGroup;
//   };

//   // Load notification details and set basic data
//   useEffect(() => {
//     console.log("notificationDetails useEffect triggered", {
//       hasData: !!memoizedNotificationDetailsData?.success,
//       isDataLoaded,
//     });

//     if (memoizedNotificationDetailsData?.success && memoizedNotificationDetailsData?.data && !isDataLoaded) {
//       const data = memoizedNotificationDetailsData.data;
//       console.log("Backend data:", data);

//       const newNotificationData = {
//         name: data.name || "",
//         organizationId: data.organizationId || "",
//         entityId: data.entityId || "",
//         triggerFieldId: "",
//         isActive: data.isActive || true,
//         conditionGroups: data.conditionGroups || [],
//       };

//       setNotificationData((prev) => {
//         if (JSON.stringify(prev) !== JSON.stringify(newNotificationData)) {
//           console.log("Updating notificationData:", newNotificationData);
//           return newNotificationData;
//         }
//         console.log("notificationData unchanged, skipping update");
//         return prev;
//       });

//       setIsDataLoaded(true);
//     }
//   }, [memoizedNotificationDetailsData, isDataLoaded]);

//   // Transform condition groups when data and field options are available
//   useEffect(() => {
//     if (
//       isDataLoaded &&
//       fieldOptions.length > 0 &&
//       notificationData.conditionGroups &&
//       notificationData.conditionGroups.length > 0 &&
//       !initialConditionGroup
//     ) {
//       console.log("Transforming condition groups:", notificationData.conditionGroups);
//       console.log("Available field options:", fieldOptions);
      
//       const transformedGroup = transformBackendToConditionGroup(
//         notificationData.conditionGroups,
//         fieldOptions
//       );
      
//       console.log("Transformed condition group:", transformedGroup);
//       setInitialConditionGroup(transformedGroup);
//     }
//   }, [isDataLoaded, fieldOptions, notificationData.conditionGroups, initialConditionGroup]);

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     if (!notificationData.name || !notificationData.entityId) {
//       toast.error("Name and Entity are required fields.");
//       return;
//     }

//     try {
//       const response = await updateNotification.mutateAsync({
//         url: `/notivix/notification-setting/type/update/${id}`,
//         payload: notificationData,
//       });

//       if (response.success) {
//         toast.success("Notification updated successfully!");
//         setExpanded((prev) => ({ ...prev, condition: false }));
//         navigate("/notivix/notification-types");
//       } else {
//         throw new Error("Notification update failed");
//       }
//     } catch (error) {
//       console.error("Error updating notification:", error);
//       toast.error("Failed to update notification. Please try again.");
//     }
//   };

//   return (
//     <Box
//       sx={{
//         flexGrow: 1,
//         p: 3,
//         ml: { xs: 0 },
//         backgroundColor: STYLE_GUIDE.COLORS.backgroundLight,
//         minHeight: "100vh",
//       }}
//     >
//       <Typography
//         variant="h4"
//         sx={{
//           mb: 3,
//           fontWeight: 400,
//           color: STYLE_GUIDE.COLORS.primaryDark,
//         }}
//       >
//         Edit Notification Type
//       </Typography>
//       <Card
//         sx={{
//           backgroundColor: STYLE_GUIDE.COLORS.white,
//           borderRadius: 2,
//           boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
//         }}
//       >
//         <CardContent sx={{ p: 3 }}>
//           {notificationDetails.isLoading ? (
//             <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
//               <CircularProgress />
//             </Box>
//           ) : notificationDetails.isError ? (
//             <Typography color="error">
//               Failed to load notification type details. Please try again.
//             </Typography>
//           ) : (
//             <Box component="form" onSubmit={handleSubmit}>
//               <Accordion
//                 expanded={expanded.condition}
//                 onChange={handleAccordionChange("condition")}
//                 sx={{ mb: 2, borderRadius: 2, boxShadow: 1 }}
//               >
//                 <AccordionSummary
//                   expandIcon={<ExpandMoreIcon />}
//                   aria-controls="condition-content"
//                   id="condition-header"
//                   sx={{ bgcolor: "grey.50", borderRadius: 2 }}
//                 >
//                   <Typography
//                     variant="h6"
//                     sx={{ fontWeight: "bold", color: "text.primary" }}
//                   >
//                     Condition Rule Builder
//                   </Typography>
//                 </AccordionSummary>
//                 <AccordionDetails>
//                   <ErrorBoundary>
//                     {isDataLoaded && fieldOptions.length > 0 ? (
//                       <ConditionRuleBuilder
//                         onChange={setNotificationData}
//                         notificationTypeList={notificationTypeList}
//                         fieldOptions={fieldOptions}
//                         notificationResponse={notificationResponse.data?.data}
//                         initialConditionGroup={initialConditionGroup}
//                         initialNotificationData={notificationData}
//                       />
//                     ) : (
//                       <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
//                         <CircularProgress />
//                         <Typography sx={{ ml: 2 }}>Loading form data...</Typography>
//                       </Box>
//                     )}
//                   </ErrorBoundary>
//                   <Box
//                     sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}
//                   >
//                     <Button
//                       variant="outlined"
//                       color="secondary"
//                       onClick={() => navigate("/notivix/notification-types")}
//                       sx={{ px: 4, borderRadius: 1 }}
//                     >
//                       Cancel
//                     </Button>
//                     <Button
//                       type="submit"
//                       variant="contained"
//                       color="primary"
//                       size="large"
//                       sx={{ px: 4, borderRadius: 1 }}
//                       disabled={updateNotification.isLoading || !isDataLoaded}
//                     >
//                       {updateNotification.isLoading ? "Updating..." : "Update"}
//                     </Button>
//                   </Box>
//                 </AccordionDetails>
//               </Accordion>
//               <Accordion
//                 expanded={expanded.reminder && notificationTypeId !== null}
//                 onChange={handleAccordionChange("reminder")}
//                 sx={{ mb: 2, borderRadius: 2, boxShadow: 1 }}
//                 disabled={notificationTypeId === null}
//               >
//                 <AccordionSummary
//                   expandIcon={<ExpandMoreIcon />}
//                   aria-controls="reminder-content"
//                   id="reminder-header"
//                   sx={{ bgcolor: "grey.50", borderRadius: 2 }}
//                 >
//                   <Typography
//                     variant="h6"
//                     sx={{ fontWeight: "bold", color: "text.primary" }}
//                   >
//                     Reminder Task
//                   </Typography>
//                 </AccordionSummary>
//                 <AccordionDetails>
//                   <ErrorBoundary>
//                     <Frequency
//                       fieldOptions={fieldOptions}
//                       notificationTypeId={notificationTypeId}
//                     />
//                   </ErrorBoundary>
//                 </AccordionDetails>
//               </Accordion>
//             </Box>
//           )}
//         </CardContent>
//       </Card>
//     </Box>
//   );
// }
// import React from 'react'

// const EditNotificationTypes = () => {
//   return (
//     <div>EditNotificationTypes</div>
//   )
// }

// export default EditNotificationTypes


// no more console but has isssues
// import * as React from "react";
// import { useState, useEffect, useMemo } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { toast } from "react-toastify";
// import {
//   Box,
//   Card,
//   CardContent,
//   Typography,
//   TextField,
//   Select,
//   MenuItem,
//   Button,
//   IconButton,
//   FormControl,
//   InputLabel,
//   Grid,
//   Accordion,
//   AccordionSummary,
//   AccordionDetails,
//   CircularProgress,
// } from "@mui/material";
// import AddIcon from "@mui/icons-material/Add";
// import CloseIcon from "@mui/icons-material/Close";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// import ChevronRightIcon from "@mui/icons-material/ChevronRight";
// import useGet from "../../hooks/useGet";
// import usePost from "../../hooks/usePost";
// import usePut from "../../hooks/usePut";
// import { GET, POST } from "../../services/apiRoutes";
// import { STYLE_GUIDE } from "../../styles";
// import { useSelector } from "react-redux";
// import { RootState } from "../../reducers";
// import Frequency from "./Frequency";

// // Error Boundary Component
// class ErrorBoundary extends React.Component {
//   state = { hasError: false };

//   static getDerivedStateFromError(error) {
//     return { hasError: true };
//   }

//   render() {
//     if (this.state.hasError) {
//       return <Typography color="error">Something went wrong.</Typography>;
//     }
//     return this.props.children;
//   }
// }

// // Custom Hook for Field Options
// const useFieldOptions = (entityId, notificationTypeList) => {
//   const [fieldOptions, setFieldOptions] = useState([]);

//   // Memoize dependencies to prevent unnecessary triggers
//   const memoizedEntityId = useMemo(() => entityId, [entityId]);
//   const memoizedNotificationTypeListData = useMemo(
//     () => notificationTypeList.data,
//     [notificationTypeList.data?.data] // Depend on the actual data array
//   );

//   useEffect(() => {
//     console.log("useFieldOptions useEffect triggered", {
//       entityId: memoizedEntityId,
//       hasNotificationTypeListData: !!memoizedNotificationTypeListData?.data,
//     });

//     if (memoizedEntityId && memoizedNotificationTypeListData?.data) {
//       const selectedEntity = memoizedNotificationTypeListData.data.find(
//         (entity) => entity._id === memoizedEntityId
//       );

//       if (selectedEntity && selectedEntity.attributes) {
//         const newFieldOptions = selectedEntity.attributes.map((attr) => ({
//           value: attr.mappingName,
//           label: attr.name,
//           type: attr.type,
//           attributeId: attr._id,
//         }));

//         setFieldOptions((prevFieldOptions) => {
//           if (JSON.stringify(prevFieldOptions) !== JSON.stringify(newFieldOptions)) {
//             console.log("Field options updated:", newFieldOptions);
//             return newFieldOptions;
//           }
//           console.log("Field options unchanged, skipping update");
//           return prevFieldOptions;
//         });
//       } else {
//         setFieldOptions((prevFieldOptions) => {
//           if (prevFieldOptions.length > 0) {
//             console.log("Resetting field options to empty");
//             return [];
//           }
//           console.log("Field options already empty, skipping reset");
//           return prevFieldOptions;
//         });
//       }
//     } else {
//       setFieldOptions((prevFieldOptions) => {
//         if (prevFieldOptions.length > 0) {
//           console.log("Resetting field options to empty due to missing entityId or data");
//           return [];
//         }
//         console.log("Field options already empty, skipping reset");
//         return prevFieldOptions;
//       });
//     }
//   }, [memoizedEntityId, memoizedNotificationTypeListData]);

//   return fieldOptions;
// };

// // ConditionRuleBuilder Component
// const ConditionRuleBuilder = ({
//   onChange,
//   notificationTypeList,
//   fieldOptions,
//   notificationResponse,
//   initialConditionGroup,
//   initialNotificationData,
// }) => {
//   const organizationId = useSelector(
//     (state: RootState) => state.userPermission?.currentUser?.organizationId?._id
//   );

//   const [notification, setNotification] = useState({
//     name: initialNotificationData?.name || "",
//     entityId: initialNotificationData?.entityId || "",
//     conditionGroup: initialConditionGroup || {
//       logic: "AND",
//       rules: [],
//     },
//   });

//   const operatorList = usePost(["operatorList"]);

//   useEffect(() => {
//     operatorList.mutate({
//       url: POST.OPERATOR_LIST,
//       payload: { fieldType: "all" },
//     });
//   }, []);

//   useEffect(() => {
//     if (initialNotificationData) {
//       setNotification((prev) => ({
//         ...prev,
//         name: initialNotificationData.name || "",
//         entityId: initialNotificationData.entityId || "",
//       }));
//     }
//   }, [initialNotificationData]);

//   useEffect(() => {
//     if (initialConditionGroup) {
//       setNotification((prev) => ({
//         ...prev,
//         conditionGroup: initialConditionGroup,
//       }));
//     }
//   }, [initialConditionGroup]);

//   const statusOptions = [
//     "open",
//     "rated to search",
//     "rated to draft ih",
//     "rated to draft oc",
//     "review rate to draft",
//     "filing requested",
//     "submitted",
//   ];
//   const caseTypeOptions = ["PRI", "PRO", "TRA", "DES"];
//   const countryCodeOptions = ["EP", "IN", "WO", "FAM", "US", "CN", "JP"];
//   const timeUnitOptions = [
//     { value: "M", label: "Month (M)" },
//     { value: "d", label: "Days (d)" },
//     { value: "y", label: "Yearly (y)" },
//   ];

//   const generateId = () => Math.random().toString(36).substr(2, 9);

//   const addRule = (groupPath) => {
//     const newRule = {
//       id: generateId(),
//       field: "",
//       operator: "",
//       value: "",
//       timeUnit: "",
//     };
//     const updatedNotification = { ...notification };
//     const group = getGroupByPath(updatedNotification.conditionGroup, groupPath);
//     group.rules.push(newRule);
//     setNotification(updatedNotification);
//   };

//   const addGroup = (groupPath) => {
//     const newGroup = {
//       id: generateId(),
//       logic: "AND",
//       rules: [],
//     };
//     const updatedNotification = { ...notification };
//     const group = getGroupByPath(updatedNotification.conditionGroup, groupPath);
//     group.rules.push(newGroup);
//     setNotification(updatedNotification);
//   };

//   const removeItem = (groupPath, index) => {
//     const updatedNotification = { ...notification };
//     const group = getGroupByPath(updatedNotification.conditionGroup, groupPath);
//     group.rules.splice(index, 1);
//     setNotification(updatedNotification);
//   };

//   const updateRule = (groupPath, index, field, value) => {
//     const updatedNotification = { ...notification };
//     const group = getGroupByPath(updatedNotification.conditionGroup, groupPath);
//     group.rules[index][field] = value;
//     if (field === "operator") {
//       const selectedField = fieldOptions.find(
//         (f) => f.value === group.rules[index].field
//       );
//       const operators = operatorList.data?.data?.find(
//         (op) => op.fieldType === selectedField?.type
//       )?.operators;
//       const selectedOperator = operators?.find(
//         (op) => op.operatorKey === value
//       );
//       if (selectedOperator && !selectedOperator.valueRequired) {
//         group.rules[index].value = "";
//         group.rules[index].timeUnit = "";
//       }
//     }
//     setNotification(updatedNotification);
//   };

//   const updateGroupLogic = (groupPath, logic) => {
//     const updatedNotification = { ...notification };
//     const group = getGroupByPath(updatedNotification.conditionGroup, groupPath);
//     group.logic = logic;
//     setNotification(updatedNotification);
//   };

//   const getGroupByPath = (root, path) => {
//     if (path.length === 0) return root;
//     let current = root;
//     for (const index of path) {
//       current = current.rules[index];
//     }
//     return current;
//   };

//   const validateValue = (rule) => {
//     const field = fieldOptions.find((f) => f.value === rule.field);
//     const operators =
//       operatorList.data?.data?.find((op) => op.fieldType === field?.type)
//         ?.operators || [];
//     const selectedOperator = operators?.find(
//       (op) => op.operatorKey === rule.operator
//     );
//     return selectedOperator?.valueRequired && !rule.value;
//   };

//   const renderValueInput = (rule, groupPath, index) => {
//     const field = fieldOptions.find((f) => f.value === rule.field);
//     const operators =
//       operatorList.data?.data?.find((op) => op.fieldType === field?.type)
//         ?.operators || [];
//     const selectedOperator = operators?.find(
//       (op) => op.operatorKey === rule.operator
//     );
//     const valueRequired = selectedOperator?.valueRequired ?? true;
//     const updateValue = (value) => updateRule(groupPath, index, "value", value);
//     const updateTimeUnit = (value) =>
//       updateRule(groupPath, index, "timeUnit", value);

//     if (!field || !valueRequired) {
//       return null;
//     }

//     switch (field.type) {
//       case "boolean":
//         return (
//           <FormControl fullWidth size="small" error={validateValue(rule)}>
//             <InputLabel>Select...</InputLabel>
//             <Select
//               value={rule.value}
//               onChange={(e) => updateValue(e.target.value === "true")}
//               label="Select..."
//             >
//               <MenuItem value="">Select...</MenuItem>
//               <MenuItem value="true">True</MenuItem>
//               <MenuItem value="false">False</MenuItem>
//             </Select>
//             {validateValue(rule) && (
//               <Typography color="error" variant="caption">
//                 Value is required
//               </Typography>
//             )}
//           </FormControl>
//         );
//       case "select":
//         if (rule.field === "status") {
//           return rule.operator === "in" ? (
//             <FormControl fullWidth size="small" error={validateValue(rule)}>
//               <InputLabel>Select...</InputLabel>
//               <Select
//                 multiple
//                 value={rule.value ? rule.value.split(",") : []}
//                 onChange={(e) => updateValue(e.target.value.join(","))}
//                 label="Select..."
//                 sx={{ minHeight: 80 }}
//               >
//                 {statusOptions.map((option) => (
//                   <MenuItem key={option} value={option}>
//                     {option}
//                   </MenuItem>
//                 ))}
//               </Select>
//               {validateValue(rule) && (
//                 <Typography color="error" variant="caption">
//                   Value is required
//                 </Typography>
//               )}
//             </FormControl>
//           ) : (
//             <FormControl fullWidth size="small" error={validateValue(rule)}>
//               <InputLabel>Select...</InputLabel>
//               <Select
//                 value={rule.value}
//                 onChange={(e) => updateValue(e.target.value)}
//                 label="Select..."
//               >
//                 <MenuItem value="">Select...</MenuItem>
//                 {statusOptions.map((option) => (
//                   <MenuItem key={option} value={option}>
//                     {option}
//                   </MenuItem>
//                 ))}
//               </Select>
//               {validateValue(rule) && (
//                 <Typography color="error" variant="caption">
//                   Value is required
//                 </Typography>
//               )}
//             </FormControl>
//           );
//         }
//         if (rule.field === "case_type") {
//           return rule.operator === "in" ? (
//             <FormControl fullWidth size="small" error={validateValue(rule)}>
//               <InputLabel>Select...</InputLabel>
//               <Select
//                 multiple
//                 value={rule.value ? rule.value.split(",") : []}
//                 onChange={(e) => updateValue(e.target.value.join(","))}
//                 label="Select..."
//                 sx={{ minHeight: 80 }}
//               >
//                 {caseTypeOptions.map((option) => (
//                   <MenuItem key={option} value={option}>
//                     {option}
//                   </MenuItem>
//                 ))}
//               </Select>
//               {validateValue(rule) && (
//                 <Typography color="error" variant="caption">
//                   Value is required
//                 </Typography>
//               )}
//             </FormControl>
//           ) : (
//             <FormControl fullWidth size="small" error={validateValue(rule)}>
//               <InputLabel>Select...</InputLabel>
//               <Select
//                 value={rule.value}
//                 onChange={(e) => updateValue(e.target.value)}
//                 label="Select..."
//               >
//                 <MenuItem value="">Select...</MenuItem>
//                 {caseTypeOptions.map((option) => (
//                   <MenuItem key={option} value={option}>
//                     {option}
//                   </MenuItem>
//                 ))}
//               </Select>
//               {validateValue(rule) && (
//                 <Typography color="error" variant="caption">
//                   Value is required
//                 </Typography>
//               )}
//             </FormControl>
//           );
//         }
//         if (rule.field === "country_code") {
//           return rule.operator === "in" ? (
//             <FormControl fullWidth size="small" error={validateValue(rule)}>
//               <InputLabel>Select...</InputLabel>
//               <Select
//                 multiple
//                 value={rule.value ? rule.value.split(",") : []}
//                 onChange={(e) => updateValue(e.target.value.join(","))}
//                 label="Select..."
//                 sx={{ minHeight: 80 }}
//               >
//                 {countryCodeOptions.map((option) => (
//                   <MenuItem key={option} value={option}>
//                     {option}
//                   </MenuItem>
//                 ))}
//               </Select>
//               {validateValue(rule) && (
//                 <Typography color="error" variant="caption">
//                   Value is required
//                 </Typography>
//               )}
//             </FormControl>
//           ) : (
//             <FormControl fullWidth size="small" error={validateValue(rule)}>
//               <InputLabel>Select...</InputLabel>
//               <Select
//                 value={rule.value}
//                 onChange={(e) => updateValue(e.target.value)}
//                 label="Select..."
//               >
//                 <MenuItem value="">Select...</MenuItem>
//                 {countryCodeOptions.map((option) => (
//                   <MenuItem key={option} value={option}>
//                     {option}
//                   </MenuItem>
//                 ))}
//               </Select>
//               {validateValue(rule) && (
//                 <Typography color="error" variant="caption">
//                   Value is required
//                 </Typography>
//               )}
//             </FormControl>
//           );
//         }
//         return (
//           <FormControl fullWidth size="small" error={validateValue(rule)}>
//             <TextField
//               fullWidth
//               size="small"
//               value={rule.value}
//               onChange={(e) => updateValue(e.target.value)}
//               placeholder="Value"
//               variant="outlined"
//               error={validateValue(rule)}
//               sx={{ marginTop: validateValue(rule) ? "22px" : 0 }}
//             />
//             {validateValue(rule) && (
//               <Typography color="error" variant="caption">
//                 Value is required
//               </Typography>
//             )}
//           </FormControl>
//         );
//       case "date":
//         return (
//           <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
//             <FormControl fullWidth size="small" error={validateValue(rule)}>
//               <TextField
//                 fullWidth
//                 size="small"
//                 type="date"
//                 value={rule.value}
//                 onChange={(e) => updateValue(e.target.value)}
//                 placeholder="Select date"
//                 variant="outlined"
//                 InputLabelProps={{ shrink: true }}
//                 error={validateValue(rule)}
//                 sx={{ marginTop: validateValue(rule) ? "22px" : 0 }}
//               />
//               {validateValue(rule) && (
//                 <Typography color="error" variant="caption">
//                   Value is required
//                 </Typography>
//               )}
//             </FormControl>
//             <FormControl fullWidth size="small">
//               <InputLabel>Time Unit</InputLabel>
//               <Select
//                 value={rule.timeUnit}
//                 onChange={(e) => updateTimeUnit(e.target.value)}
//                 label="Time Unit"
//               >
//                 <MenuItem value="">Select...</MenuItem>
//                 {timeUnitOptions.map((option) => (
//                   <MenuItem key={option.value} value={option.value}>
//                     {option.label}
//                   </MenuItem>
//                 ))}
//               </Select>
//             </FormControl>
//           </Box>
//         );
//       default:
//         return (
//           <FormControl fullWidth size="small" error={validateValue(rule)}>
//             <TextField
//               fullWidth
//               size="small"
//               value={rule.value}
//               onChange={(e) => updateValue(e.target.value)}
//               placeholder="Value"
//               variant="outlined"
//               error={validateValue(rule)}
//               sx={{ marginTop: validateValue(rule) ? "22px" : 0 }}
//             />
//             {validateValue(rule) && (
//               <Typography color="error" variant="caption">
//                 Value is required
//               </Typography>
//             )}
//           </FormControl>
//         );
//     }
//   };

//   const RuleComponent = ({ rule, groupPath, index }) => {
//     const selectedField = fieldOptions.find((f) => f.value === rule.field);
//     const operators =
//       operatorList.data?.data?.find(
//         (op) => op.fieldType === selectedField?.type
//       )?.operators || [];

//     return (
//       <Box
//         sx={{
//           display: "flex",
//           alignItems: "center",
//           gap: 2,
//           p: 2,
//           bgcolor: "grey.100",
//           borderRadius: 2,
//           transition: "background-color 0.2s ease",
//           "&:hover": { bgcolor: "grey.200" },
//         }}
//       >
//         <FormControl fullWidth size="small">
//           <InputLabel>Select field...</InputLabel>
//           <Select
//             value={rule.field}
//             onChange={(e) => {
//               updateRule(groupPath, index, "field", e.target.value);
//               updateRule(groupPath, index, "operator", "");
//               updateRule(groupPath, index, "value", "");
//               updateRule(groupPath, index, "timeUnit", "");
//             }}
//             label="Select field..."
//           >
//             <MenuItem value="">Select field...</MenuItem>
//             {fieldOptions.map((option) => (
//               <MenuItem key={option.value} value={option.value}>
//                 {option.label}
//               </MenuItem>
//             ))}
//           </Select>
//         </FormControl>

//         <FormControl fullWidth size="small" disabled={!rule.field}>
//           <InputLabel>Select operator...</InputLabel>
//           <Select
//             value={rule.operator}
//             onChange={(e) => updateRule(groupPath, index, "operator", e.target.value)}
//             label="Select operator..."
//           >
//             <MenuItem value="">Select operator...</MenuItem>
//             {operatorList.isLoading ? (
//               <MenuItem disabled>Loading operators...</MenuItem>
//             ) : (
//               operators.map((op) => (
//                 <MenuItem key={op._id} value={op.operatorKey}>
//                   {op.operatorName}
//                 </MenuItem>
//               ))
//             )}
//           </Select>
//         </FormControl>

//         {renderValueInput(rule, groupPath, index)}

//         <IconButton
//           onClick={() => removeItem(groupPath, index)}
//           color="error"
//           aria-label="Remove rule"
//         >
//           <CloseIcon />
//         </IconButton>
//       </Box>
//     );
//   };

//   const GroupComponent = ({ group, groupPath = [], isRoot = false }) => {
//     const [collapsed, setCollapsed] = useState(false);

//     return (
//       <Box
//         sx={{
//           border: isRoot ? "2px solid" : "1px solid",
//           borderColor: isRoot ? "primary.light" : "grey.300",
//           borderRadius: 2,
//           p: 3,
//           width: isRoot ? "auto" : "auto",
//           bgcolor: isRoot ? "background.paper" : "inherit",
//           boxShadow: isRoot ? 3 : 1,
//           transition: "all 0.3s ease-in-out",
//           "&:hover": { boxShadow: 4 },
//         }}
//       >
//         <Box
//           sx={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//             mb: 3,
//           }}
//         >
//           <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
//             {!isRoot && (
//               <IconButton
//                 onClick={() => setCollapsed(!collapsed)}
//                 sx={{
//                   bgcolor: "grey.100",
//                   "&:hover": { bgcolor: "grey.200" },
//                   transition: "background-color 0.2s ease",
//                 }}
//                 aria-label="Toggle group collapse"
//               >
//                 {collapsed ? <ChevronRightIcon /> : <ExpandMoreIcon />}
//               </IconButton>
//             )}
//             <Typography
//               variant="subtitle2"
//               sx={{
//                 fontWeight: "medium",
//                 color: "text.secondary",
//                 fontSize: "0.9rem",
//               }}
//             >
//               {isRoot ? "Root Condition Group" : "Nested Group"}
//             </Typography>
//             <FormControl size="small">
//               <InputLabel>Logic</InputLabel>
//               <Select
//                 value={group.logic}
//                 onChange={(e) => updateGroupLogic(groupPath, e.target.value)}
//                 label="Logic"
//                 sx={{ fontSize: "0.85rem" }}
//               >
//                 <MenuItem value="AND">AND</MenuItem>
//                 <MenuItem value="OR">OR</MenuItem>
//               </Select>
//             </FormControl>
//           </Box>

//           <Box sx={{ display: "flex", gap: 1 }}>
//             <Button
//               variant="contained"
//               color="primary"
//               size="small"
//               onClick={() => addRule(groupPath)}
//               startIcon={<AddIcon />}
//               sx={{
//                 fontSize: "0.85rem",
//                 borderRadius: 1,
//                 px: 2,
//                 py: 0.5,
//                 transition: "all 0.2s ease",
//                 "&:hover": { transform: "scale(1.05)" },
//               }}
//             >
//               Rule
//             </Button>
//             <Button
//               variant="contained"
//               color="success"
//               size="small"
//               onClick={() => addGroup(groupPath)}
//               startIcon={<AddIcon />}
//               sx={{
//                 fontSize: "0.85rem",
//                 borderRadius: 1,
//                 px: 2,
//                 py: 0.5,
//                 transition: "all 0.2s ease",
//                 "&:hover": { transform: "scale(1.05)" },
//               }}
//             >
//               Group
//             </Button>
//             {!isRoot && (
//               <IconButton
//                 onClick={() => {
//                   const parentPath = groupPath.slice(0, -1);
//                   const index = groupPath[groupPath.length - 1];
//                   removeItem(parentPath, index);
//                 }}
//                 color="error"
//                 aria-label="Remove group"
//               >
//                 <CloseIcon />
//               </IconButton>
//             )}
//           </Box>
//         </Box>

//         {!collapsed && (
//           <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
//             {group.rules.map((rule, index) => (
//               <Box key={rule.id || index}>
//                 {index > 0 && (
//                   <Box sx={{ py: 1 }}>
//                     <Typography
//                       variant="caption"
//                       sx={{
//                         pl: 1,
//                         fontSize: "0.75rem",
//                         color: "text.secondary",
//                         fontWeight: "medium",
//                         bgcolor: "grey.100",
//                         borderRadius: "12px",
//                         px: 1.5,
//                         py: 0.5,
//                         display: "inline-block",
//                         transition: "all 0.2s ease",
//                       }}
//                     >
//                       {group.logic}
//                     </Typography>
//                   </Box>
//                 )}
//                 {rule.logic ? (
//                   <GroupComponent
//                     group={rule}
//                     groupPath={[...groupPath, index]}
//                   />
//                 ) : (
//                   <RuleComponent
//                     rule={rule}
//                     groupPath={groupPath}
//                     index={index}
//                   />
//                 )}
//               </Box>
//             ))}
//           </Box>
//         )}
//       </Box>
//     );
//   };

//   useEffect(() => {
//     const transformNotificationData = () => {
//       const conditionGroups = [];

//       const flattenGroup = (group, path = []) => {
//         const conditions = [];
//         group.rules.forEach((rule) => {
//           if (rule.logic) {
//             conditionGroups.push({
//               group_operator: rule.logic,
//               conditions: [],
//             });
//             flattenGroup(rule, [...path, conditionGroups.length - 1]);
//           } else {
//             const fieldOption = fieldOptions.find(
//               (f) => f.value === rule.field
//             );
//             if (fieldOption) {
//               conditions.push({
//                 attributeId: fieldOption.attributeId,
//                 operator: rule.operator,
//                 value: rule.value,
//                 timeUnit: rule.timeUnit || "",
//               });
//             }
//           }
//         });
//         if (conditions.length > 0) {
//           conditionGroups.push({
//             group_operator: group.logic,
//             conditions,
//           });
//         }
//       };

//       flattenGroup(notification.conditionGroup);
//       return {
//         name: notification.name,
//         organizationId: organizationId,
//         entityId: notification.entityId,
//         triggerFieldId: "",
//         isActive: true,
//         conditionGroups,
//       };
//     };

//     onChange(transformNotificationData());
//   }, [notification, fieldOptions, onChange, organizationId]);

//   return (
//     <Box
//       sx={{
//         maxWidth: "1200px",
//         mx: "auto",
//         p: 4,
//         bgcolor: "background.paper",
//         borderRadius: 2,
//       }}
//     >
//       <Box sx={{ mb: 4, p: 3, bgcolor: "grey.50", borderRadius: 2 }}>
//         <Grid container spacing={2}>
//           <Grid item xs={12} sm={4}>
//             <TextField
//               fullWidth
//               label="Name"
//               value={notification.name}
//               onChange={(e) =>
//                 setNotification({ ...notification, name: e.target.value })
//               }
//               variant="outlined"
//               size="small"
//               required
//               error={!notification.name}
//               helperText={!notification.name ? "Name is required" : ""}
//             />
//           </Grid>
//           <Grid item xs={12} sm={4}>
//             <FormControl fullWidth size="small">
//               <InputLabel>Entity</InputLabel>
//               <Select
//                 value={notification.entityId}
//                 onChange={(e) =>
//                   setNotification({ ...notification, entityId: e.target.value })
//                 }
//                 label="Entity"
//                 required
//                 error={!notification.entityId}
//               >
//                 <MenuItem value="">Select Entity...</MenuItem>
//                 {notificationTypeList.data?.data?.map((entity) => (
//                   <MenuItem key={entity._id} value={entity._id}>
//                     {entity.name}
//                   </MenuItem>
//                 ))}
//               </Select>
//               {!notification.entityId && (
//                 <Typography color="error" variant="caption">
//                   Entity is required
//                 </Typography>
//               )}
//             </FormControl>
//           </Grid>
//         </Grid>
//       </Box>
//       <GroupComponent group={notification.conditionGroup} isRoot={true} />
//     </Box>
//   );
// };

// // EditNotificationTypes Component
// export default function EditNotificationTypes() {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();
//   const [expanded, setExpanded] = useState({ condition: true, reminder: true });
//   const [notificationData, setNotificationData] = useState({});
//   const [notificationTypeId, setNotificationTypeId] = useState<string | null>(id || null);
//   const [initialConditionGroup, setInitialConditionGroup] = useState(null);
//   const [isDataLoaded, setIsDataLoaded] = useState(false);

//   // Configure useGet with caching to prevent frequent refetching
//   const notificationTypeList = useGet(
//     ["notificationTypeList"],
//     `${GET.Entity_List}`,
//     true,
//     {
//       staleTime: 5 * 60 * 1000, // Cache for 5 minutes
//       cacheTime: 10 * 60 * 1000, // Keep cache for 10 minutes
//     }
//   );
//   const notificationDetails = useGet(
//     ["notificationDetails", id],
//     id ? `/notivix/notification-setting/type/${id}` : null,
//     !!id,
//     {
//       staleTime: 5 * 60 * 1000,
//       cacheTime: 10 * 60 * 1000,
//     }
//   );
//   const updateNotification = usePost(["updateNotification"]);
//   const notificationResponse = usePost(["notificationResponse"]);

//   // Memoize notificationDetails.data to stabilize reference
//   const memoizedNotificationDetailsData = useMemo(
//     () => notificationDetails.data,
//     [notificationDetails.data?.success, notificationDetails.data?.data]
//   );

//   // Use custom hook for fieldOptions
//   const fieldOptions = useFieldOptions(notificationData.entityId, notificationTypeList);

//   const handleAccordionChange = (panel) => (event, isExpanded) => {
//     setExpanded((prev) => ({ ...prev, [panel]: isExpanded }));
//   };

//   // Transform backend response to condition group format
//   const transformBackendToConditionGroup = (conditionGroups, availableFieldOptions) => {
//     const generateId = () => Math.random().toString(36).substr(2, 9);
    
//     if (!conditionGroups || conditionGroups.length === 0) {
//       return { logic: "AND", rules: [] };
//     }

//     const rootGroup = {
//       logic: conditionGroups[0].group_operator || "AND",
//       rules: [],
//     };

//     conditionGroups.forEach((group) => {
//       group.conditions.forEach((condition) => {
//         const fieldOption = availableFieldOptions.find(
//           (f) => f.attributeId === condition.attributeId
//         );
        
//         if (fieldOption) {
//           rootGroup.rules.push({
//             id: generateId(),
//             field: fieldOption.value,
//             operator: condition.operator,
//             value: condition.value,
//             timeUnit: condition.timeUnit || "",
//           });
//         } else {
//           console.warn(`Field with attributeId ${condition.attributeId} not found in fieldOptions`);
//           rootGroup.rules.push({
//             id: generateId(),
//             field: condition.attributeId,
//             operator: condition.operator,
//             value: condition.value,
//             timeUnit: condition.timeUnit || "",
//           });
//         }
//       });
//     });

//     return rootGroup;
//   };

//   // Load notification details and set basic data
//   useEffect(() => {
//     console.log("notificationDetails useEffect triggered", {
//       hasData: !!memoizedNotificationDetailsData?.success,
//       isDataLoaded,
//     });

//     if (memoizedNotificationDetailsData?.success && memoizedNotificationDetailsData?.data && !isDataLoaded) {
//       const data = memoizedNotificationDetailsData.data;
//       console.log("Backend data:", data);

//       const newNotificationData = {
//         name: data.name || "",
//         organizationId: data.organizationId || "",
//         entityId: data.entityId || "",
//         triggerFieldId: "",
//         isActive: data.isActive || true,
//         conditionGroups: data.conditionGroups || [],
//       };

//       setNotificationData((prev) => {
//         if (JSON.stringify(prev) !== JSON.stringify(newNotificationData)) {
//           console.log("Updating notificationData:", newNotificationData);
//           return newNotificationData;
//         }
//         console.log("notificationData unchanged, skipping update");
//         return prev;
//       });

//       setIsDataLoaded(true);
//     }
//   }, [memoizedNotificationDetailsData, isDataLoaded]);

//   // Transform condition groups when data and field options are available
//   useEffect(() => {
//     if (
//       isDataLoaded &&
//       fieldOptions.length > 0 &&
//       notificationData.conditionGroups &&
//       notificationData.conditionGroups.length > 0 &&
//       !initialConditionGroup
//     ) {
//       console.log("Transforming condition groups:", notificationData.conditionGroups);
//       console.log("Available field options:", fieldOptions);
      
//       const transformedGroup = transformBackendToConditionGroup(
//         notificationData.conditionGroups,
//         fieldOptions
//       );
      
//       console.log("Transformed condition group:", transformedGroup);
//       setInitialConditionGroup(transformedGroup);
//     }
//   }, [isDataLoaded, fieldOptions, notificationData.conditionGroups, initialConditionGroup]);

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     if (!notificationData.name || !notificationData.entityId) {
//       toast.error("Name and Entity are required fields.");
//       return;
//     }

//     try {
//       const response = await updateNotification.mutateAsync({
//         url: `/notivix/notification-setting/type/update/${id}`,
//         payload: notificationData,
//       });

//       if (response.success) {
//         toast.success("Notification updated successfully!");
//         setExpanded((prev) => ({ ...prev, condition: false }));
//         navigate("/notivix/notification-types");
//       } else {
//         throw new Error("Notification update failed");
//       }
//     } catch (error) {
//       console.error("Error updating notification:", error);
//       toast.error("Failed to update notification. Please try again.");
//     }
//   };

//   return (
//     <Box
//       sx={{
//         flexGrow: 1,
//         p: 3,
//         ml: { xs: 0 },
//         backgroundColor: STYLE_GUIDE.COLORS.backgroundLight,
//         minHeight: "100vh",
//       }}
//     >
//       <Typography
//         variant="h4"
//         sx={{
//           mb: 3,
//           fontWeight: 400,
//           color: STYLE_GUIDE.COLORS.primaryDark,
//         }}
//       >
//         Edit Notification Type
//       </Typography>
//       <Card
//         sx={{
//           backgroundColor: STYLE_GUIDE.COLORS.white,
//           borderRadius: 2,
//           boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
//         }}
//       >
//         <CardContent sx={{ p: 3 }}>
//           {notificationDetails.isLoading ? (
//             <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
//               <CircularProgress />
//             </Box>
//           ) : notificationDetails.isError ? (
//             <Typography color="error">
//               Failed to load notification type details. Please try again.
//             </Typography>
//           ) : (
//             <Box component="form" onSubmit={handleSubmit}>
//               <Accordion
//                 expanded={expanded.condition}
//                 onChange={handleAccordionChange("condition")}
//                 sx={{ mb: 2, borderRadius: 2, boxShadow: 1 }}
//               >
//                 <AccordionSummary
//                   expandIcon={<ExpandMoreIcon />}
//                   aria-controls="condition-content"
//                   id="condition-header"
//                   sx={{ bgcolor: "grey.50", borderRadius: 2 }}
//                 >
//                   <Typography
//                     variant="h6"
//                     sx={{ fontWeight: "bold", color: "text.primary" }}
//                   >
//                     Condition Rule Builder
//                   </Typography>
//                 </AccordionSummary>
//                 <AccordionDetails>
//                   <ErrorBoundary>
//                     {isDataLoaded && fieldOptions.length > 0 ? (
//                       <ConditionRuleBuilder
//                         onChange={setNotificationData}
//                         notificationTypeList={notificationTypeList}
//                         fieldOptions={fieldOptions}
//                         notificationResponse={notificationResponse.data?.data}
//                         initialConditionGroup={initialConditionGroup}
//                         initialNotificationData={notificationData}
//                       />
//                     ) : (
//                       <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
//                         <CircularProgress />
//                         <Typography sx={{ ml: 2 }}>Loading form data...</Typography>
//                       </Box>
//                     )}
//                   </ErrorBoundary>
//                   <Box
//                     sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}
//                   >
//                     <Button
//                       variant="outlined"
//                       color="secondary"
//                       onClick={() => navigate("/notivix/notification-types")}
//                       sx={{ px: 4, borderRadius: 1 }}
//                     >
//                       Cancel
//                     </Button>
//                     <Button
//                       type="submit"
//                       variant="contained"
//                       color="primary"
//                       size="large"
//                       sx={{ px: 4, borderRadius: 1 }}
//                       disabled={updateNotification.isLoading || !isDataLoaded}
//                     >
//                       {updateNotification.isLoading ? "Updating..." : "Update"}
//                     </Button>
//                   </Box>
//                 </AccordionDetails>
//               </Accordion>
//               <Accordion
//                 expanded={expanded.reminder && notificationTypeId !== null}
//                 onChange={handleAccordionChange("reminder")}
//                 sx={{ mb: 2, borderRadius: 2, boxShadow: 1 }}
//                 disabled={notificationTypeId === null}
//               >
//                 <AccordionSummary
//                   expandIcon={<ExpandMoreIcon />}
//                   aria-controls="reminder-content"
//                   id="reminder-header"
//                   sx={{ bgcolor: "grey.50", borderRadius: 2 }}
//                 >
//                   <Typography
//                     variant="h6"
//                     sx={{ fontWeight: "bold", color: "text.primary" }}
//                   >
//                     Reminder Task
//                   </Typography>
//                 </AccordionSummary>
//                 <AccordionDetails>
//                   <ErrorBoundary>
//                     <Frequency
//                       fieldOptions={fieldOptions}
//                       notificationTypeId={notificationTypeId}
//                     />
//                   </ErrorBoundary>
//                 </AccordionDetails>
//               </Accordion>
//             </Box>
//           )}
//         </CardContent>
//       </Card>
//     </Box>
//   );
// }

import React from 'react'

const EditNotificationTypes = () => {
  return (
    <div>EditNotificationTypes</div>
  )
}

export default EditNotificationTypes
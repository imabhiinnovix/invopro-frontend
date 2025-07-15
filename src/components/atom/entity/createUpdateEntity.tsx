// import React, { useEffect, useState } from "react";
// import { useForm, useFieldArray, FieldError } from "react-hook-form";
// import ExcelJS from "exceljs";

// import {
//   Box,
//   Button,
//   TextField,
//   Typography,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   IconButton,
//   Divider,
//   Stack,
// } from "@mui/material";
// import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
// import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
// import FileUploadButton from "../file/fileUploadButton";
// import { GET, POST } from "../../../services/apiRoutes";
// import ProgressBar from "../../molecule/progressBar";
// import usePost from "../../../hooks/usePost";
// import usePut from "../../../hooks/usePut";
// import { EntityRequestPayload, EntityResponse } from "./types";
// import CommonSelect from "../../common/dropdown/commonSelect";
// import CommonDropdownSearch from "../../common/dropdown/searchableDropdown";
// import { toast } from "react-toastify";
// import axiosInstance from "../../../services/axiosInstance";

// interface CreateUpdateEntityProps {
//   setReloadEntity: React.Dispatch<React.SetStateAction<boolean>>;
//   CustomButton: React.ReactElement;
//   title: string;
//   data?: EntityRequestPayload;
// }

// const CreateUpdateEntity: React.FC<CreateUpdateEntityProps> = ({
//   setReloadEntity,
//   CustomButton,
//   title,
//   data,
// }) => {
//   const [open, setOpen] = useState(false);
//   const [file, setFile] = useState<File | null>(null);
//   const [fileName, setFileName] = useState<string | null>(null);
//   const [fileUploadLoader, setFileUploadLoader] = useState(false);

//   const {
//     control,
//     handleSubmit,
//     register,
//     reset,
//     watch,
//     formState: { errors },
//   } = useForm<EntityRequestPayload>({
//     defaultValues: {
//       name: data?.name ?? "",
//       description: data?.description ?? "",
//       attributes: data?.attributes ?? [
//         {
//           name: "",
//           mappingName: "",
//           type: "",
//           required: "",
//           optionAttributeId: "",
//           referenceEntityId: "",
//           referenceEntityField: "",
//           referenceRelationType: "",
//           validation: [],
//           transformations: [],
//           cleaner: [],
//         },
//       ],
//     },
//   });

//   useEffect(() => {
//     reset({
//       name: data?.name ?? "",
//       description: data?.description ?? "",
//       attributes: data?.attributes ?? [
//         {
//           name: "",
//           mappingName: "",
//           type: "",
//           required: "",
//           optionAttributeId: "",
//           referenceEntityId: "",
//           referenceEntityField: "",
//           referenceRelationType: "",
//           validation: [],
//           transformations: [],
//           cleaner: [],
//         },
//       ],
//     });
//   }, [data, reset]);

//   const { fields, append, remove, replace } = useFieldArray({
//     control,
//     name: "attributes",
//   });
//   const [referenceEntityFields, setReferenceEntityFields] = useState<{
//     [key: number]: string[];
//   }>({});
//   const selectedReferenceEntityIds = watch("attributes")?.map(
//     (attr: any) => attr.referenceEntityId,

//   );
//   const prevEntityIdsRef = React.useRef<(string | undefined)[]>([]);

// //   useEffect(() => {
// //     if (!selectedReferenceEntityIds) return;

// //     selectedReferenceEntityIds.forEach((entityId, idx) => {
// //       if (entityId && prevEntityIdsRef.current[idx] !== entityId) {
// //         axiosInstance
// //           .get(`/entities/${entityId}`)
// //           .then((res) => {
// // console.log("value",res)
// //             //  const fieldsArr =
// //             // res.data?.data?.attributes?.map((f: any) => ({
// //             //   label: f.name,
// //             //   value: f.type,
// //             // })) || [];
// //             const typesArr =
// //             res.data?.data?.attributes?.map((f: any) => f.type) || [];
// //             setReferenceEntityFields((prev) => ({
// //               ...prev,
// //               [idx]: typesArr,
// //             }));
// //           })
// //           .catch(() => {
// //             setReferenceEntityFields((prev) => ({
// //               ...prev,
// //               [idx]: [],
// //             }));
// //           });
// //       } else if (!entityId) {
// //         setReferenceEntityFields((prev) => ({
// //           ...prev,
// //           [idx]: [],
// //         }));
// //       }
// //       prevEntityIdsRef.current[idx] = entityId;
// //     });
// //   }, [JSON.stringify(selectedReferenceEntityIds), fields.length]);

// const [referenceEntityNames, setReferenceEntityNames] = useState<{
//   [key: number]: string[];
// }>({});
// const [referenceEntityTypes, setReferenceEntityTypes] = useState<{
//   [key: number]: string[];
// }>({});

// useEffect(() => {
//   if (!selectedReferenceEntityIds) return;

//   selectedReferenceEntityIds.forEach((entityId, idx) => {
//     if (entityId && prevEntityIdsRef.current[idx] !== entityId) {
//       axiosInstance
//         .get(`/entities/${entityId}`)
//         .then((res) => {
//           console.log("value", res);
//           const namesArr =
//             res.data?.data?.attributes?.map((f: any) => f.name) || [];
//           const typesArr =
//             res.data?.data?.attributes?.map((f: any) => f.type) || [];
//           setReferenceEntityNames((prev) => ({
//             ...prev,
//             [idx]: namesArr,
//           }));
//           setReferenceEntityTypes((prev) => ({
//             ...prev,
//             [idx]: typesArr,
//           }));
//         })
//         .catch(() => {
//           setReferenceEntityNames((prev) => ({ ...prev, [idx]: [] }));
//           setReferenceEntityTypes((prev) => ({ ...prev, [idx]: [] }));
//         });
//     } else if (!entityId) {
//       setReferenceEntityNames((prev) => ({ ...prev, [idx]: [] }));
//       setReferenceEntityTypes((prev) => ({ ...prev, [idx]: [] }));
//     }
//     prevEntityIdsRef.current[idx] = entityId;
//   });
// }, [selectedReferenceEntityIds, fields.length]);
//   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     if (event.target.files?.[0]) {
//       const selectedFile = event.target.files[0];
//       setFile(selectedFile);
//       setFileName(selectedFile.name);

//       if (
//         !selectedFile.name.endsWith(".xlsx") &&
//         !selectedFile.name.endsWith(".xls")
//       ) {
//         toast.error("Please upload a valid Excel file.");
//         setFileName(null);
//         setFile(null);
//         setFileUploadLoader(false);
//         return;
//       }

//       const reader = new FileReader();
//       setFileUploadLoader(true);

//       reader.onload = async (e) => {
//         try {
//           const arrayBuffer = e.target?.result as ArrayBuffer;

//           const workbook = new ExcelJS.Workbook();
//           try {
//             await workbook.xlsx.load(arrayBuffer);
//           } catch {
//             toast.error(
//               "Failed to load the Excel file. Ensure the file is valid."
//             );
//             setFileName(null);
//             setFile(null);
//             setFileUploadLoader(false);
//             return;
//           }

//           if (!workbook.worksheets || workbook.worksheets.length === 0) {
//             toast.error("No sheets found in the Excel file.");
//             setFileName(null);
//             setFile(null);
//             setFileUploadLoader(false);
//             return;
//           }

//           const worksheet = workbook.worksheets[0];
//           const headers: {
//             name: string;
//             mappingName: string;
//             type: string;
//             optionAttributeId: string;
//             referenceEntityId: string;
//             referenceEntityField: string;
//             referenceRelationType: string;
//             validation: unknown[];
//             transformations: unknown[];
//             cleaner: unknown[];
//             required: string;
//           }[] = [];
//           const uniqueNames = new Set<string>();

//           worksheet.getRow(1).eachCell((cell) => {
//             if (cell.value) {
//               const actualHeaderName = cell.value.toString().trim();
//               const cleanedName = cell.value
//                 .toString()
//                 .replace(/[^a-zA-Z0-9/]/g, "")
//                 .replace(/\//g, " or ")
//                 .replace(/\s+/g, " ")
//                 .trim();

//               if (!uniqueNames.has(cleanedName)) {
//                 uniqueNames.add(cleanedName);
//                 headers.push({
//                   name: cleanedName,
//                   mappingName: actualHeaderName,
//                   type: "text",
//                   optionAttributeId: "",
//                   referenceEntityId: "",
//                   referenceEntityField: "",
//                   referenceRelationType: "",
//                   validation: [],
//                   transformations: [],
//                   cleaner: [],
//                   required: "Not Mandatory",
//                 });
//               }
//             }
//           });

//           worksheet.getRow(2).eachCell((cell, colNumber) => {
//             if (headers[colNumber - 1] != undefined) {
//               const firstValue = cell.value;
//               let type = "text";
//               if (typeof firstValue === "number") {
//                 type = "number";
//               } else if (firstValue instanceof Date) {
//                 type = "date";
//               }
//               headers[colNumber - 1].type = type;
//             }
//           });

//           if (headers.length > 0) {
//             replace(headers);
//           } else {
//             toast.error("Headers not found.");
//             setFileName(null);
//             setFile(null);
//           }
//           setFileUploadLoader(false);
//         } catch (e) {
//           toast.error(
//             "Something went wrong while processing the file. Please try again."
//           );
//           setFileName(null);
//           setFile(null);
//           setFileUploadLoader(false);
//         }
//       };

//       reader.readAsArrayBuffer(selectedFile);
//     }
//   };

//   const createEntity = usePost<EntityRequestPayload, EntityResponse>(
//     ["createEntity"],
//     (data) => {
//       if (data?.success) {
//         setReloadEntity(true);
//         setFile(null);
//         setFileName(null);
//         setOpen(false);
//         reset();
//       }
//     },
//     true
//   );

//   const updateEntity = usePut<EntityRequestPayload, EntityResponse>(
//     ["updateEntity"],
//     (data) => {
//       if (data?.success) {
//         setReloadEntity(true);
//         setFile(null);
//         setFileName(null);
//         setOpen(false);
//         reset();
//       }
//     },
//     true
//   );

// const onSubmit = (formData: EntityRequestPayload) => {

//   const newAttributes = formData.attributes?.map((data) => {
//     const {
//       referenceEntityId,
//       referenceEntityField,
//       referenceRelationType,
//       ...rest
//     } = data;

//     const updated = {
//       ...rest,
//       required: data.required === "Mandatory" ? true : false,
//     };

//     if (!["option", "multioption"].includes(data.type)) {
//       updated.optionAttributeId = "";
//     }

//     // Inject referenceEntitySetting if all fields are present
//     if (referenceEntityId && referenceEntityField && referenceRelationType) {
//       updated.referenceEntitySetting = {
//         refEntityId: referenceEntityId,
//         refEntityField: referenceEntityField,
//         relationType: referenceRelationType,
//       };
//     }

//     return updated;
//   });


//   const newFormData = { ...formData, attributes: newAttributes };


//   if (data && data._id) {
//     updateEntity.mutate({
//       url: `${POST.UPDATE_ENTITY}/${data._id}`,
//       payload: newFormData,
//     });
//   } else {
//     createEntity.mutate({ url: POST.CREATE_ENTITY, payload: newFormData });
//   }
// };

//   const handleCancel = () => {
//     setFile(null);
//     setFileName(null);
//     setOpen(false);
//     setFileUploadLoader(false);
//     reset();
//   };

//   return (
//     <>
//       <Box onClick={() => setOpen(true)}>{CustomButton}</Box>

//       <Dialog fullWidth maxWidth="lg" open={open} onClose={handleCancel}>
//         <DialogTitle fontWeight="bold" fontSize={20}>
//           {title}
//         </DialogTitle>
//         <DialogContent dividers>
//           <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
//             <Stack spacing={3}>
//               <TextField
//                 label="Entity Name*"
//                 fullWidth
//                 {...register("name", {
//                   required: "Entity Name is required",
//                   pattern: {
//                     value: /^[A-Za-z\s]+$/,
//                     message: "Entity Name must contain only letters",
//                   },
//                 })}
//                 error={!!errors.name}
//                 helperText={errors.name?.message}
//               />

//               <TextField
//                 label="Entity Description"
//                 fullWidth
//                 multiline
//                 rows={4}
//                 {...register("description")}
//                 error={!!errors.description}
//                 helperText={errors.description?.message}
//               />

//               {fileUploadLoader ? (
//                 <ProgressBar />
//               ) : (
//                 <FileUploadButton
//                   fileName={fileName}
//                   onFileChange={handleFileChange}
//                   buttonName={"Upload File"}
//                 />
//               )}

//               <Divider sx={{ my: 3 }} />

//               {fields.map((attribute, index) => (
//                console.log("atttt",attribute),
//                 <Box
//                   key={attribute.id}
//                   sx={{
//                     mb: 3,
//                     pointerEvents: fileUploadLoader ? "none" : "auto",
//                     opacity: fileUploadLoader ? 0.5 : 1,
//                   }}
//                 >
//                   <Typography variant="h6" mb={2}>
//                     Attribute {index + 1}
//                   </Typography>
//                   <Stack spacing={2}>
//                     <TextField
//                       label="Attribute Name"
//                       fullWidth
//                       {...register(`attributes.${index}.name`, {
//                         required: "Attribute Name is required",
//                       })}
//                       error={!!errors.attributes?.[index]?.name}
//                       helperText={errors.attributes?.[index]?.name?.message}
//                     />
//                     <TextField
//                       label="File Attribute Name"
//                       fullWidth
//                       {...register(`attributes.${index}.mappingName`, {
//                         required: "File Attribute Name is required",
//                       })}
//                       error={!!errors.attributes?.[index]?.mappingName}
//                       helperText={
//                         errors.attributes?.[index]?.mappingName?.message
//                       }
//                     />

//                     <CommonSelect
//                       control={control}
//                       name={`attributes.${index}.type`}
//                       label="Attribute Type"
//                       options={[
//                         "number",
//                         "text",
//                         "date",
//                         "boolean",
//                         "richtext",
//                         "url",
//                         "option",
//                         "multioption",
//                         "email",
//                       ]}
//                       defaultValue={attribute.type || ""}
//                       rules={{ required: "Attribute Type is required" }}
//                       error={!!errors.attributes?.[index]?.type}
//                       errorMessage={
//                         (errors.attributes?.[index]?.type as FieldError)
//                           ?.message
//                       }
//                     />

//                     {watch("attributes") &&
//                       ["option", "multioption"].includes(
//                         watch("attributes")?.[index]?.type!
//                       ) && (
//                         <CommonDropdownSearch
//                           control={control}
//                           name={`attributes.${index}.optionAttributeId`}
//                           label="Attribute Options"
//                           apiUrl={`${GET.Attribute_Option_List}`}
//                           labelName="attributeName"
//                           labelValue="_id"
//                           defaultValue={attribute.optionAttributeId || ""}
//                           rules={{ required: "Attribute Option is required" }}
//                           error={
//                             !!errors.attributes?.[index]?.optionAttributeId
//                           }
//                           errorMessage={
//                             (
//                               errors.attributes?.[index]
//                                 ?.optionAttributeId as FieldError
//                             )?.message
//                           }
//                           apiName="attributeOption"
//                           defaultDataUrl={`${GET.Attribute_Option_Get}`}
//                         />
//                       )}

//                     <CommonSelect
//                       control={control}
//                       name={`attributes.${index}.required`}
//                       label="Attribute Validation"
//                       options={["Mandatory", "Not Mandatory"]}
//                       defaultValue={attribute.required || "Not Mandatory"}
//                       rules={{ required: "Attribute Validation is required" }}
//                       error={!!errors.attributes?.[index]?.required}
//                       errorMessage={
//                         (errors.attributes?.[index]?.required as FieldError)
//                           ?.message
//                       }
//                     />

//                     <CommonDropdownSearch
//                       control={control}
//                       name={`attributes.${index}.referenceEntityId`}
//                       label="Reference Entity ID"
//                       apiUrl={`${GET.Entity_List}`}
//                       labelName="name"
//                       labelValue="_id"
//                       defaultValue={attribute.referenceEntityId || ""}
//                       rules={{ required: "Reference Entity ID is required" }}
//                       error={!!errors.attributes?.[index]?.referenceEntityId}
//                       errorMessage={
//                         (
//                           errors.attributes?.[index]
//                             ?.referenceEntityId as FieldError
//                         )?.message
//                       }
//                       apiName="entities"
//                       defaultDataUrl={`${GET.Entity_List}`}
//                     />
//                     <CommonSelect
//                       control={control}
//                       name={`attributes.${index}.referenceEntityField`}
//                       label="Reference Entity Field"
//                       options={referenceEntityFields[index] || []}
//                       defaultValue={attribute.referenceEntityField || ""}
//                       rules={{ required: "Reference Entity Field is required" }}
//                       error={!!errors.attributes?.[index]?.referenceEntityField}
//                       errorMessage={
//                         (
//                           errors.attributes?.[index]
//                             ?.referenceEntityField as FieldError
//                         )?.message
//                       }
//                     />

//                     <CommonSelect
//                       control={control}
//                       name={`attributes.${index}.referenceRelationType`}
//                       label="Reference Relation Type"
//                       options={[
//                         "many_to_one",
//                         "one_to_one",
//                         "self",
//                       ]}
//                       rules={{
//                         required: "Reference Relation Type is required",
//                       }}
//                     />
//                   </Stack>

//                   <IconButton
//                     color="error"
//                     onClick={() => remove(index)}
//                     sx={{ mt: 2, display: "flex", alignSelf: "flex-start" }}
//                   >
//                     <RemoveCircleOutlineIcon />
//                   </IconButton>
//                 </Box>
//               ))}

//               <Button
//                 variant="contained"
//                 startIcon={<AddCircleOutlineIcon />}
//                 onClick={() =>
//                   append({
//                     name: "",
//                     mappingName: "",
//                     type: "",
//                     required: "",
//                     optionAttributeId: "",
//                     referenceEntityId: "",
//                     referenceEntityField: "",
//                     referenceRelationType: "",
//                     validation: [],
//                     transformations: [],
//                     cleaner: [],
//                   })
//                 }
//               >
//                 Add Attribute
//               </Button>
//             </Stack>
//           </Box>
//         </DialogContent>
//         <DialogActions>
//           {createEntity.isPending || updateEntity.isPending ? (
//             <ProgressBar />
//           ) : (
//             <>
//               <Button
//                 onClick={handleCancel}
//                 color="error"
//                 sx={{ fontSize: 18, fontWeight: "bold", p: 1, pl: 2, pr: 2 }}
//               >
//                 Cancel
//               </Button>
//               <Button
//                 type="submit"
//                 onClick={handleSubmit(onSubmit)}
//                 variant="contained"
//                 color="primary"
//                 sx={{ fontSize: 18, fontWeight: "bold", p: 1, pl: 2, pr: 2 }}
//               >
//                 Save Entity
//               </Button>
//             </>
//           )}
//         </DialogActions>
//       </Dialog>
//     </>
//   );
// };

// export default CreateUpdateEntity;




import React, { useEffect, useState } from "react";
import { useForm, useFieldArray, FieldError } from "react-hook-form";
import ExcelJS from "exceljs";

import {
  Box,
  Button,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  Stack,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import FileUploadButton from "../file/fileUploadButton";
import { GET, POST } from "../../../services/apiRoutes";
import ProgressBar from "../../molecule/progressBar";
import usePost from "../../../hooks/usePost";
import usePut from "../../../hooks/usePut";
import { EntityRequestPayload, EntityResponse } from "./types";
import CommonSelect from "../../common/dropdown/commonSelect";
import CommonDropdownSearch from "../../common/dropdown/searchableDropdown";
import { toast } from "react-toastify";
import axiosInstance from "../../../services/axiosInstance";

interface CreateUpdateEntityProps {
  setReloadEntity: React.Dispatch<React.SetStateAction<boolean>>;
  CustomButton: React.ReactElement;
  title: string;
  data?: EntityRequestPayload;
}

const CreateUpdateEntity: React.FC<CreateUpdateEntityProps> = ({
  setReloadEntity,
  CustomButton,
  title,
  data,
}) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileUploadLoader, setFileUploadLoader] = useState(false);

  const {
    control,
    handleSubmit,
    register,
    reset,
    watch,
    formState: { errors },
  } = useForm<EntityRequestPayload>({
    defaultValues: {
      name: data?.name ?? "",
      description: data?.description ?? "",
      attributes: data?.attributes ?? [
        {
          name: "",
          mappingName: "",
          type: "",
          required: "",
          optionAttributeId: "",
          referenceEntityId: "",
          referenceEntityField: "",
          referenceRelationType: "",
          validation: [],
          transformations: [],
          cleaner: [],
        },
      ],
    },
  });

  useEffect(() => {
    reset({
      name: data?.name ?? "",
      description: data?.description ?? "",
      attributes: data?.attributes ?? [
        {
          name: "",
          mappingName: "",
          type: "",
          required: "",
          optionAttributeId: "",
          referenceEntityId: "",
          referenceEntityField: "",
          referenceRelationType: "",
          validation: [],
          transformations: [],
          cleaner: [],
        },
      ],
    });
  }, [data, reset]);

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "attributes",
  });
  const [referenceEntityNames, setReferenceEntityNames] = useState<{
    [key: number]: string[];
  }>({});
  const [referenceEntityTypes, setReferenceEntityTypes] = useState<{
    [key: number]: string[];
  }>({});
  const selectedReferenceEntityIds = watch("attributes")?.map(
    (attr: any) => attr.referenceEntityId
  );
  const prevEntityIdsRef = React.useRef<(string | undefined)[]>([]);

  useEffect(() => {
    if (!selectedReferenceEntityIds) return;

    selectedReferenceEntityIds.forEach((entityId, idx) => {
      if (entityId && prevEntityIdsRef.current[idx] !== entityId) {
        axiosInstance
          .get(`/entities/${entityId}`)
          .then((res) => {
            console.log("value", res);
            const namesArr =
              res.data?.data?.attributes?.map((f: any) => f.name) || [];
            const typesArr =
              res.data?.data?.attributes?.map((f: any) => f._id) || [];
            setReferenceEntityNames((prev) => ({
              ...prev,
              [idx]: namesArr,
            }));
            setReferenceEntityTypes((prev) => ({
              ...prev,
              [idx]: typesArr,
            }));
          })
          .catch(() => {
            setReferenceEntityNames((prev) => ({ ...prev, [idx]: [] }));
            setReferenceEntityTypes((prev) => ({ ...prev, [idx]: [] }));
          });
      } else if (!entityId) {
        setReferenceEntityNames((prev) => ({ ...prev, [idx]: [] }));
        setReferenceEntityTypes((prev) => ({ ...prev, [idx]: [] }));
      }
      prevEntityIdsRef.current[idx] = entityId;
    });
  }, [selectedReferenceEntityIds, fields.length]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      setFileName(selectedFile.name);

      if (
        !selectedFile.name.endsWith(".xlsx") &&
        !selectedFile.name.endsWith(".xls")
      ) {
        toast.error("Please upload a valid Excel file.");
        setFileName(null);
        setFile(null);
        setFileUploadLoader(false);
        return;
      }

      const reader = new FileReader();
      setFileUploadLoader(true);

      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;

          const workbook = new ExcelJS.Workbook();
          try {
            await workbook.xlsx.load(arrayBuffer);
          } catch {
            toast.error(
              "Failed to load the Excel file. Ensure the file is valid."
            );
            setFileName(null);
            setFile(null);
            setFileUploadLoader(false);
            return;
          }

          if (!workbook.worksheets || workbook.worksheets.length === 0) {
            toast.error("No sheets found in the Excel file.");
            setFileName(null);
            setFile(null);
            setFileUploadLoader(false);
            return;
          }

          const worksheet = workbook.worksheets[0];
          const headers: {
            name: string;
            mappingName: string;
            type: string;
            optionAttributeId: string;
            referenceEntityId: string;
            referenceEntityField: string;
            referenceRelationType: string;
            validation: unknown[];
            transformations: unknown[];
            cleaner: unknown[];
            required: string;
          }[] = [];
          const uniqueNames = new Set<string>();

          worksheet.getRow(1).eachCell((cell) => {
            if (cell.value) {
              const actualHeaderName = cell.value.toString().trim();
              const cleanedName = cell.value
                .toString()
                .replace(/[^a-zA-Z0-9/]/g, "")
                .replace(/\//g, " or ")
                .replace(/\s+/g, " ")
                .trim();

              if (!uniqueNames.has(cleanedName)) {
                uniqueNames.add(cleanedName);
                headers.push({
                  name: cleanedName,
                  mappingName: actualHeaderName,
                  type: "text",
                  optionAttributeId: "",
                  referenceEntityId: "",
                  referenceEntityField: "",
                  referenceRelationType: "",
                  validation: [],
                  transformations: [],
                  cleaner: [],
                  required: "Not Mandatory",
                });
              }
            }
          });

          worksheet.getRow(2).eachCell((cell, colNumber) => {
            if (headers[colNumber - 1] != undefined) {
              const firstValue = cell.value;
              let type = "text";
              if (typeof firstValue === "number") {
                type = "number";
              } else if (firstValue instanceof Date) {
                type = "date";
              }
              headers[colNumber - 1].type = type;
            }
          });

          if (headers.length > 0) {
            replace(headers);
          } else {
            toast.error("Headers not found.");
            setFileName(null);
            setFile(null);
          }
          setFileUploadLoader(false);
        } catch (e) {
          toast.error(
            "Something went wrong while processing the file. Please try again."
          );
          setFileName(null);
          setFile(null);
          setFileUploadLoader(false);
        }
      };

      reader.readAsArrayBuffer(selectedFile);
    }
  };

  const createEntity = usePost<EntityRequestPayload, EntityResponse>(
    ["createEntity"],
    (data) => {
      if (data?.success) {
        setReloadEntity(true);
        setFile(null);
        setFileName(null);
        setOpen(false);
        reset();
      }
    },
    true
  );

  const updateEntity = usePut<EntityRequestPayload, EntityResponse>(
    ["updateEntity"],
    (data) => {
      if (data?.success) {
        setReloadEntity(true);
        setFile(null);
        setFileName(null);
        setOpen(false);
        reset();
      }
    },
    true
  );

  const onSubmit = (formData: EntityRequestPayload) => {
    const newAttributes = formData.attributes?.map((data, index) => {
      const {
        referenceEntityId,
        referenceEntityField,
        referenceRelationType,
        ...rest
      } = data;

      const updated = {
        ...rest,
        required: data.required === "Mandatory" ? true : false,
      };

      if (!["option", "multioption"].includes(data.type)) {
        updated.optionAttributeId = "";
      }

      // Map selected referenceEntityField (name) to its corresponding type
      if (referenceEntityId && referenceEntityField && referenceRelationType) {
        const selectedName = referenceEntityField; // referenceEntityField is the selected name (e.g., "SBU")
        const typeIndex = referenceEntityNames[index]?.indexOf(selectedName);
        const selectedType =
          typeIndex !== -1 && typeIndex !== undefined
            ? referenceEntityTypes[index]?.[typeIndex] || ""
            : "";

        updated.referenceEntitySetting = {
          refEntityId: referenceEntityId,
          refEntityField: selectedType, // Send type (e.g., "option") instead of name
          relationType: referenceRelationType,
        };
      }

      return updated;
    });

    const newFormData = { ...formData, attributes: newAttributes };

    if (data && data._id) {
      updateEntity.mutate({
        url: `${POST.UPDATE_ENTITY}/${data._id}`,
        payload: newFormData,
      });
    } else {
      createEntity.mutate({ url: POST.CREATE_ENTITY, payload: newFormData });
    }
  };

  const handleCancel = () => {
    setFile(null);
    setFileName(null);
    setOpen(false);
    setFileUploadLoader(false);
    reset();
  };

  return (
    <>
      <Box onClick={() => setOpen(true)}>{CustomButton}</Box>

      <Dialog fullWidth maxWidth="lg" open={open} onClose={handleCancel}>
        <DialogTitle fontWeight="bold" fontSize={20}>
          {title}
        </DialogTitle>
        <DialogContent dividers>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={3}>
              <TextField
                label="Entity Name*"
                fullWidth
                {...register("name", {
                  required: "Entity Name is required",
                  pattern: {
                    value: /^[A-Za-z\s]+$/,
                    message: "Entity Name must contain only letters",
                  },
                })}
                error={!!errors.name}
                helperText={errors.name?.message}
              />

              <TextField
                label="Entity Description"
                fullWidth
                multiline
                rows={4}
                {...register("description")}
                error={!!errors.description}
                helperText={errors.description?.message}
              />

              {fileUploadLoader ? (
                <ProgressBar />
              ) : (
                <FileUploadButton
                  fileName={fileName}
                  onFileChange={handleFileChange}
                  buttonName={"Upload File"}
                />
              )}

              <Divider sx={{ my: 3 }} />

              {fields.map((attribute, index) => (
                <Box
                  key={attribute.id}
                  sx={{
                    mb: 3,
                    pointerEvents: fileUploadLoader ? "none" : "auto",
                    opacity: fileUploadLoader ? 0.5 : 1,
                  }}
                >
                  <Typography variant="h6" mb={2}>
                    Attribute {index + 1}
                  </Typography>
                  <Stack spacing={2}>
                    <TextField
                      label="Attribute Name"
                      fullWidth
                      {...register(`attributes.${index}.name`, {
                        required: "Attribute Name is required",
                      })}
                      error={!!errors.attributes?.[index]?.name}
                      helperText={errors.attributes?.[index]?.name?.message}
                    />
                    <TextField
                      label="File Attribute Name"
                      fullWidth
                      {...register(`attributes.${index}.mappingName`, {
                        required: "File Attribute Name is required",
                      })}
                      error={!!errors.attributes?.[index]?.mappingName}
                      helperText={
                        errors.attributes?.[index]?.mappingName?.message
                      }
                    />

                    <CommonSelect
                      control={control}
                      name={`attributes.${index}.type`}
                      label="Attribute Type"
                      options={[
                        "number",
                        "text",
                        "date",
                        "boolean",
                        "richtext",
                        "url",
                        "option",
                        "multioption",
                        "email",
                      ]}
                      defaultValue={attribute.type || ""}
                      rules={{ required: "Attribute Type is required" }}
                      error={!!errors.attributes?.[index]?.type}
                      errorMessage={
                        (errors.attributes?.[index]?.type as FieldError)
                          ?.message
                      }
                    />

                    {watch("attributes") &&
                      ["option", "multioption"].includes(
                        watch("attributes")?.[index]?.type!
                      ) && (
                        <CommonDropdownSearch
                          control={control}
                          name={`attributes.${index}.optionAttributeId`}
                          label="Attribute Options"
                          apiUrl={`${GET.Attribute_Option_List}`}
                          labelName="attributeName"
                          labelValue="_id"
                          defaultValue={attribute.optionAttributeId || ""}
                          rules={{ required: "Attribute Option is required" }}
                          error={
                            !!errors.attributes?.[index]?.optionAttributeId
                          }
                          errorMessage={
                            (
                              errors.attributes?.[index]
                                ?.optionAttributeId as FieldError
                            )?.message
                          }
                          apiName="attributeOption"
                          defaultDataUrl={`${GET.Attribute_Option_Get}`}
                        />
                      )}

                    <CommonSelect
                      control={control}
                      name={`attributes.${index}.required`}
                      label="Attribute Validation"
                      options={["Mandatory", "Not Mandatory"]}
                      defaultValue={attribute.required || "Not Mandatory"}
                      rules={{ required: "Attribute Validation is required" }}
                      error={!!errors.attributes?.[index]?.required}
                      helperText={
                        (errors.attributes?.[index]?.required as FieldError)
                          ?.message
                      }
                    />

                    <CommonDropdownSearch
                      control={control}
                      name={`attributes.${index}.referenceEntityId`}
                      label="Reference Entity ID"
                      apiUrl={`${GET.Entity_List}`}
                      labelName="name"
                      labelValue="_id"
                      defaultValue={attribute.referenceEntityId || ""}
                      rules={{ required: "Reference Entity ID is required" }}
                      error={!!errors.attributes?.[index]?.referenceEntityId}
                      errorMessage={
                        (
                          errors.attributes?.[index]
                            ?.referenceEntityId as FieldError
                        )?.message
                      }
                      apiName="entities"
                      defaultDataUrl={`${GET.Entity_List}`}
                    />

                    <CommonSelect
                      control={control}
                      name={`attributes.${index}.referenceEntityField`}
                      label="Reference Entity Field"
                      options={referenceEntityNames[index] || []} // Use names for display
                      defaultValue={attribute.referenceEntityField || ""}
                      rules={{ required: "Reference Entity Field is required" }}
                      error={!!errors.attributes?.[index]?.referenceEntityField}
                      helperText={
                        (
                          errors.attributes?.[index]
                            ?.referenceEntityField as FieldError
                        )?.message
                      }
                    />

                    <CommonSelect
                      control={control}
                      name={`attributes.${index}.referenceRelationType`}
                      label="Reference Relation Type"
                      options={["many_to_one", "one_to_one", "self"]}
                      rules={{
                        required: "Reference Relation Type is required",
                      }}
                    />
                  </Stack>

                  <IconButton
                    color="error"
                    onClick={() => remove(index)}
                    sx={{ mt: 2, display: "flex", alignSelf: "flex-start" }}
                  >
                    <RemoveCircleOutlineIcon />
                  </IconButton>
                </Box>
              ))}

              <Button
                variant="contained"
                startIcon={<AddCircleOutlineIcon />}
                onClick={() =>
                  append({
                    name: "",
                    mappingName: "",
                    type: "",
                    required: "",
                    optionAttributeId: "",
                    referenceEntityId: "",
                    referenceEntityField: "",
                    referenceRelationType: "",
                    validation: [],
                    transformations: [],
                    cleaner: [],
                  })
                }
              >
                Add Attribute
              </Button>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          {createEntity.isPending || updateEntity.isPending ? (
            <ProgressBar />
          ) : (
            <>
              <Button
                onClick={handleCancel}
                color="error"
                sx={{ fontSize: 18, fontWeight: "bold", p: 1, pl: 2, pr: 2 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={handleSubmit(onSubmit)}
                variant="contained"
                color="primary"
                sx={{ fontSize: 18, fontWeight: "bold", p: 1, pl: 2, pr: 2 }}
              >
                Save Entity
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CreateUpdateEntity;
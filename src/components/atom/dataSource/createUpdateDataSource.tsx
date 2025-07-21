// import React, { useEffect, useState, useRef } from 'react';
// import { useForm, useFieldArray } from 'react-hook-form';
// import {
//   Box,
//   Button,
//   TextField,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Stack,
//   Typography,
//   IconButton,
// } from '@mui/material';
// import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
// import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
// import { GET, POST, PUT } from '../../../services/apiRoutes';
// import ProgressBar from '../../molecule/progressBar';
// import usePost from '../../../hooks/usePost';
// import usePut from '../../../hooks/usePut';
// import CommonSelect from '../../common/dropdown/commonSelect';
// import CommonDropdownSearch from '../../common/dropdown/searchableDropdown';
// import useGet from '../../../hooks/useGet';
// import { STYLE_GUIDE } from '../../../styles';
// import { useUnifiedTheme } from '../../../hooks/useUnifiedTheme';
// import axiosInstance from '../../../services/axiosInstance';

// interface Attribute {
//   _id: string;
//   name: string;
// }

// interface Entity {
//   _id: string;
//   name: string;
//   attributes: Attribute[];
// }

// interface DataSourceRequestPayload {
//   name: string;
//   code: string;
//   description?: string;
//   versionType: string;
//   entityId: string;
//   entityAttributes?: string[][];
//   entityAttributeIds?: string[][];
//   uniqueAttributeRules?: { _id: string; name: string }[][];
//   _id?: string;
// }

// interface DataSourceResponse {
//   success: boolean;
// }

// interface CreateUpdateDataSourceProps {
//   setReload: React.Dispatch<React.SetStateAction<boolean>>;
//   CustomButton: React.ReactElement;
//   title: string;
//   data?: DataSourceRequestPayload & { entityId: Entity | string; uniqueAttributeRules?: { _id: string; name: string }[][] };
// }

// const CreateUpdateDataSource: React.FC<CreateUpdateDataSourceProps> = ({
//   setReload,
//   CustomButton,
//   title,
//   data,
// }) => {
//   const theme = useUnifiedTheme();
//   const [open, setOpen] = useState(false);
//   const [code, setCode] = useState('');
//   const [name, setName] = useState('');
//   const [entityAttributes, setEntityAttributes] = useState<string[]>([]);
//   const [entityAttributeIds, setEntityAttributeIds] = useState<string[]>([]);

//   const {
//     control,
//     handleSubmit,
//     register,
//     reset,
//     setValue,
//     watch,
//     formState: { errors },
//   } = useForm<DataSourceRequestPayload>({
//     defaultValues: {
//       name: data?.name ?? '',
//       code: data?.code ?? '',
//       description: data?.description ?? '',
//       versionType: data?.versionType ?? '',
//       entityId: typeof data?.entityId === 'string' ? data.entityId : data?.entityId?._id ?? '',
//       entityAttributes: data?.uniqueAttributeRules?.length
//         ? data.uniqueAttributeRules.map((rule) => rule.map((attr) => attr.name))
//         : [['']],
//       entityAttributeIds: data?.uniqueAttributeRules?.length
//         ? data.uniqueAttributeRules.map((rule) => rule.map((attr) => attr._id))
//         : [['']],
//     },
//   });

//   const { fields, append, remove } = useFieldArray({
//     control,
//     name: 'entityAttributes',
//   });

//   const entityId = watch('entityId');

//   // console.log('Form State:', watch());



//   useEffect(() => {
//     if (open && fields.length === 0) {
//       append(['']);
//     }
//   }, [open, fields, append]);

//   const codeAvailability = useGet<{ success: boolean; available: boolean; message: string }>(
//     [`codeAvailability`, code],
//     `${GET?.Data_Source_Code}/${code}`,
//     !!code && /^[a-zA-Z0-9_]+$/.test(code)
//   );

//   const nameAvailability = useGet<{ success: boolean; available: boolean; message: string }>(
//     [`nameAvailability`, name],
//     `${GET?.Data_Source_Name}/${name}`,
//     !!name
//   );

//   const createDataSource = usePost<DataSourceRequestPayload, DataSourceResponse>(
//     ['createDataSource'],
//     (data) => {
//       if (data?.success) {
//         setCode('');
//         setName('');
//         setReload(true);
//         setOpen(false);
//         reset();
//       }
//     },
//     true
//   );

//   const updateDataSource = usePut<DataSourceRequestPayload, DataSourceResponse>(
//     ['updateDataSource'],
//     (data) => {
//       if (data?.success) {
//         setCode('');
//         setName('');
//         setReload(true);
//         setOpen(false);
//         reset();
//       }
//     },
//     true
//   );

//   const onSubmit = (formData: DataSourceRequestPayload) => {
//     console.log('formData before processing:', formData);
//     const updatedEntityAttributeIds = formData.entityAttributes?.map((attributes) => {
//       if (!Array.isArray(attributes)) {
//         console.error('Invalid attributes format:', attributes);
//         return [];
//       }
//       return attributes
//         .filter((attribute) => attribute !== '' && typeof attribute === 'string')
//         .map((attribute) => {
//           const typeIndex = entityAttributes.indexOf(attribute);
//           return typeIndex !== -1 ? entityAttributeIds[typeIndex] || '' : '';
//         })
//         .filter((id) => id !== '' && typeof id === 'string');
//     }) || [];

//     const updatedUniqueAttributeRules = updatedEntityAttributeIds.map((ids) =>
//       ids.map((id) => {
//         const index = entityAttributeIds.indexOf(id);
//         return { _id: id, name: entityAttributes[index] || '' };
//       })
//     );

//     const updatedFormData = {
//       ...formData,
//       entityAttributeIds: updatedEntityAttributeIds,
//       uniqueAttributeRules: updatedUniqueAttributeRules,
//     };

//     console.log('updatedFormData:', updatedFormData);

//     if (data && data._id) {
//       updateDataSource.mutate({
//         url: `${PUT.UPDATE_DATA_SOURCE}/${data._id}`,
//         payload: updatedFormData,
//       });
//     } else {
//       createDataSource.mutate({
//         url: POST.CREATE_DATA_SOURCE,
//         payload: updatedFormData,
//       });
//     }
//   };

//   const handleCancel = () => {
//     setOpen(false);
//     setCode('');
//     setName('');
//     setEntityAttributes([]);
//     setEntityAttributeIds([]);
//     reset();
//   };

//   const handleAddMoreEntity = () => {
//     append(['']);
//   };

//   // Transform entityAttributes for CommonSelect
//   const selectOptions = entityAttributes.map((name, idx) => ({
//     label: name,
//     value: entityAttributeIds[idx] || name,
//   }));


// useEffect(() => {
//     console.log('Selected entityId:', entityId);

//     // Fetch entity details if entityId is valid
//     if (entityId) {
//       axiosInstance
//         .get(`/entities/${entityId}`)
//         .then((response) => {
//           console.log('Entity API Response:', response.data);
//           // Optionally update entityAttributes and entityAttributeIds based on response
//           if (response.data?.attributes) {
//             const attributes = response.data.attributes;
//             setEntityAttributes(attributes.map((attr: Attribute) => attr.name));
//             setEntityAttributeIds(attributes.map((attr: Attribute) => attr._id));
//           }
//         })
//         .catch((error) => {
//           console.error('Error fetching entity details:', error);
//         });
//     } else {
//       setEntityAttributes([]);
//       setEntityAttributeIds([]);
//     }
//   }, [entityId]);
//   // Log entityId to console whenever it changes
//   useEffect(() => {
//     console.log('Selected entityId:', entityId);
//   }, [entityId]);
//   return (
//     <>
//       <Box onClick={() => setOpen(true)}>{CustomButton}</Box>

//       <Dialog
//         fullWidth
//         maxWidth="lg"
//         open={open}
//         onClose={handleCancel}
//         PaperProps={{
//           sx: {
//             backgroundColor: theme.palette.dialog?.background || STYLE_GUIDE.COLORS.white,
//             border: `1px solid ${theme.palette.dialog?.border || theme.palette.border?.main || STYLE_GUIDE.COLORS.borderGray}`,
//             borderRadius: theme.palette.dialog?.borderRadius || '8px',
//             boxShadow: theme.palette.dialog?.shadow || STYLE_GUIDE.SHADOWS.lg,
//           },
//         }}
//       >
//         <DialogTitle
//           sx={{
//             fontWeight: theme.palette.dialog?.titleFontWeight || STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold,
//             fontSize: theme.palette.dialog?.titleFontSize || STYLE_GUIDE.TYPOGRAPHY.fontSize.xl,
//             color: theme.palette.dialog?.titleColor || STYLE_GUIDE.COLORS.textDarkGray,
//           }}
//         >
//           {title}
//         </DialogTitle>
//         <DialogContent
//           sx={{
//             color: theme.palette.dialog?.contentColor || STYLE_GUIDE.COLORS.textDarkGray,
//             fontSize: theme.palette.dialog?.contentFontSize || '1rem',
//             borderTop: `1px solid ${theme.palette.divider}`,
//             borderBottom: `1px solid ${theme.palette.divider}`,
//           }}
//         >
//           <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
//             <Stack spacing={3}>
//               <TextField
//                 label="Data Source Name*"
//                 fullWidth
//                 {...register('name', {
//                   required: 'Data source name is required',
//                 })}
//                 onChange={(event) => {
//                   setName(event.target.value);
//                   setValue('name', event.target.value);
//                 }}
//                 onBlur={(event) => {
//                   const sanitizedCode = event.target.value.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '');
//                   setCode(sanitizedCode);
//                   setValue('code', sanitizedCode);
//                 }}
//                 error={!!errors.name}
//                 defaultValue={data?.name ?? ''}
//                 helperText={
//                   errors.name?.message ||
//                   (nameAvailability.isFetched && name.length > 0 ? (
//                     nameAvailability.data?.available ? (
//                       <Typography sx={{ color: STYLE_GUIDE.COLORS.bootstrapSuccess }}>
//                         Name is available
//                       </Typography>
//                     ) : (
//                       <Typography sx={{ color: STYLE_GUIDE.COLORS.bootstrapDanger }}>
//                         Name is not available
//                       </Typography>
//                     )
//                   ) : (
//                     ''
//                   ))
//                 }
//                 sx={{
//                   '& .MuiOutlinedInput-root': {
//                     borderRadius: STYLE_GUIDE.SPACING.s2,
//                     alignItems: 'flex-start',
//                     paddingRight: STYLE_GUIDE.SPACING.s2,
//                     fontSize: '14px',
//                     backgroundColor: theme.dashboardTheme?.colors?.background?.paper || '#ffffff',
//                     '& fieldset': {
//                       borderColor: theme.dashboardTheme?.colors?.inputBorder || STYLE_GUIDE.COLORS.darkBackground,
//                     },
//                     '&:hover fieldset': {
//                       borderColor: theme.dashboardTheme?.colors?.borderHover || STYLE_GUIDE.COLORS.darkBorderHover,
//                     },
//                     '&.Mui-focused fieldset': {
//                       borderColor:
//                         theme.dashboardTheme?.components?.input?.focusBorderColor ||
//                         theme.dashboardTheme?.components?.input?.focusBorderColorFallback ||
//                         STYLE_GUIDE.COLORS.inputFocusFallback,
//                     },
//                   },
//                   '& .MuiInputLabel-root': {
//                     color: theme.dashboardTheme?.colors?.text?.secondary || STYLE_GUIDE.COLORS.darkBorderFocus,
//                   },
//                   '& .MuiInputLabel-root.Mui-focused': {
//                     color:
//                       theme.dashboardTheme?.components?.input?.focusBorderColor ||
//                       theme.dashboardTheme?.components?.input?.focusBorderColorFallback ||
//                       STYLE_GUIDE.COLORS.inputFocusFallback,
//                   },
//                   '& .MuiInputBase-input': {
//                     color: `${theme.dashboardTheme?.colors?.inputText} !important`,
//                   },
//                   '& .MuiInputBase-input::placeholder': {
//                     color: `${theme.dashboardTheme?.colors?.text?.secondary || '#666'} !important`,
//                   },
//                   '& .MuiInputBase-input:-webkit-autofill': {
//                     WebkitTextFillColor: `${theme.dashboardTheme?.colors?.inputText} !important`,
//                     WebkitBoxShadow: `0 0 0 1000px ${theme.dashboardTheme?.colors?.background?.paper || '#ffffff'} inset !important`,
//                   },
//                 }}
//               />

//               <TextField
//                 label="Data Source Description"
//                 fullWidth
//                 multiline
//                 rows={4}
//                 {...register('description')}
//                 error={!!errors.description}
//                 helperText={errors.description?.message}
//                 sx={{
//                   '& .MuiOutlinedInput-root': {
//                     borderRadius: STYLE_GUIDE.SPACING.s2,
//                     alignItems: 'flex-start',
//                     paddingRight: STYLE_GUIDE.SPACING.s2,
//                     fontSize: '14px',
//                     padding: '12px 16px',
//                     backgroundColor: theme.dashboardTheme?.colors?.background?.paper || '#ffffff',
//                     '& fieldset': {
//                       borderColor: theme.dashboardTheme?.colors?.inputBorder || STYLE_GUIDE.COLORS.darkBackground,
//                     },
//                     '&:hover fieldset': {
//                       borderColor: theme.dashboardTheme?.colors?.borderHover || STYLE_GUIDE.COLORS.darkBorderHover,
//                     },
//                     '&.Mui-focused fieldset': {
//                       borderColor:
//                         theme.dashboardTheme?.components?.input?.focusBorderColor ||
//                         theme.dashboardTheme?.components?.input?.focusBorderColorFallback ||
//                         STYLE_GUIDE.COLORS.inputFocusFallback,
//                     },
//                   },
//                   '& .MuiInputLabel-root': {
//                     color: theme.dashboardTheme?.colors?.text?.secondary || STYLE_GUIDE.COLORS.darkBorderFocus,
//                   },
//                   '& .MuiInputLabel-root.Mui-focused': {
//                     color:
//                       theme.dashboardTheme?.components?.input?.focusBorderColor ||
//                       theme.dashboardTheme?.components?.input?.focusBorderColorFallback ||
//                       STYLE_GUIDE.COLORS.inputFocusFallback,
//                   },
//                   '& .MuiInputBase-input': {
//                     color: `${theme.dashboardTheme?.colors?.inputText} !important`,
//                   },
//                   '& .MuiInputBase-input::placeholder': {
//                     color: `${theme.dashboardTheme?.colors?.text?.secondary || '#666'} !important`,
//                   },
//                   '& .MuiInputBase-input:-webkit-autofill': {
//                     WebkitTextFillColor: `${theme.dashboardTheme?.colors?.inputText} !important`,
//                     WebkitBoxShadow: `0 0 0 1000px ${theme.dashboardTheme?.colors?.background?.paper || '#ffffff'} inset !important`,
//                   },
//                 }}
//               />

//               <Box sx={{ mb: 3 }}>
//                 <CommonDropdownSearch
//                   control={control}
//                   name="entityId"
//                   label="Select Entity*"
//                   apiUrl={`${GET.Entity_List}`}
//                   labelName="name"
//                   labelValue="_id"
//                   defaultValue={typeof data?.entityId === 'string' ? data.entityId : data?.entityId?._id || ''}
//                   rules={{ required: 'Entity is required' }}
//                   error={!!errors.entityId}
//                   errorMessage={errors.entityId?.message as string}
//                   apiName="entityList"
//                   defaultDataUrl=""
//                 />
//               </Box>

//               {fields.map((field, index) => (
//                 <Box key={field.id} sx={{ mb: 3 }}>
//                   <Stack direction="row" spacing={2} alignItems="center">
//                     <Box sx={{ flex: 1 }}>
//                       <Typography variant="h6" mb={1}>
//                         Unique {index + 1} Attributes
//                       </Typography>
//                       <CommonSelect
//                         control={control}
//                         name={`entityAttributes.${index}`}
//                         label={`Select Unique Attribute ${index + 1}*`}
//                         options={selectOptions}
//                         multiple={true}
//                         defaultValue={field.value || ['']}
//                         rules={{ required: entityId ? 'Unique Attribute is required' : false }}
//                         error={!!errors.entityAttributes?.[index]}
//                         errorMessage={errors.entityAttributes?.[index]?.message as string}
//                       />
//                     </Box>
//                     {fields.length > 1 && (
//                       <IconButton color="error" onClick={() => remove(index)}>
//                         <RemoveCircleOutlineIcon />
//                       </IconButton>
//                     )}
//                   </Stack>
//                 </Box>
//               ))}

//               <Button
//                 variant="contained"
//                 startIcon={<AddCircleOutlineIcon />}
//                 onClick={handleAddMoreEntity}
//                 sx={{ whiteSpace: 'nowrap', mt: 2 }}
//               >
//                 Add More Entity
//               </Button>

//               {!!data?._id && (
//                 <CommonSelect
//                   control={control}
//                   name="entityType"
//                   label="Select Entity*"
//                   options={
//                     data?.entityId
//                       ? [
//                           {
//                             label: typeof data.entityId === 'string' ? data.entityId : data.entityId.name || '',
//                             value: typeof data.entityId === 'string' ? data.entityId : data.entityId._id || '',
//                           },
//                         ]
//                       : [{ label: '', value: '' }]
//                   }
//                   defaultValue={typeof data?.entityId === 'string' ? data.entityId : data?.entityId?._id || ''}
//                   rules={{ required: '' }}
//                   error={false}
//                   errorMessage=""
//                   disabled={true}
//                 />
//               )}

//               <TextField
//                 label="Data Source Code(Unique Code)*"
//                 fullWidth
//                 {...register('code', {
//                   required: 'Data source code is required',
//                   pattern: {
//                     value: /^(?!.*(\$|\0|^system\.|\.system\.))[\w]+$/,
//                     message:
//                       'Data source code should not contain special characters, null characters, space or restricted prefixes (e.g., "system." or ".system.")',
//                   },
//                 })}
//                 onChange={(event) => {
//                   const sanitizedCode = event.target.value.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '');
//                   setCode(sanitizedCode);
//                   setValue('code', sanitizedCode);
//                 }}
//                 error={!!errors.code}
//                 value={code || (data?.code ? data.code : (name?.toLowerCase() || '').replace(/[^a-zA-Z0-9_]/g, ''))}
//                 disabled={data?.code ? true : false}
//                 helperText={
//                   errors.code?.message ||
//                   (codeAvailability.isFetched && code.length > 0 ? (
//                     codeAvailability.data?.available ? (
//                       <Typography sx={{ color: STYLE_GUIDE.COLORS.bootstrapSuccess }}>
//                         Code is available
//                       </Typography>
//                     ) : (
//                       <Typography sx={{ color: STYLE_GUIDE.COLORS.bootstrapDanger }}>
//                         Code is not available
//                       </Typography>
//                     )
//                   ) : (
//                     ''
//                   ))
//                 }
//                 sx={{
//                   '& .MuiOutlinedInput-root': {
//                     borderRadius: STYLE_GUIDE.SPACING.s2,
//                     alignItems: 'flex-start',
//                     paddingRight: STYLE_GUIDE.SPACING.s2,
//                     fontSize: '14px',
//                     padding: '12px 16px',
//                     backgroundColor: theme.dashboardTheme?.colors?.background?.paper || '#ffffff',
//                     '& fieldset': {
//                       borderColor: theme.dashboardTheme?.colors?.inputBorder || STYLE_GUIDE.COLORS.darkBackground,
//                     },
//                     '&:hover fieldset': {
//                       borderColor: theme.dashboardTheme?.colors?.borderHover || STYLE_GUIDE.COLORS.darkBorderHover,
//                     },
//                     '&.Mui-focused fieldset': {
//                       borderColor:
//                         theme.dashboardTheme?.components?.input?.focusBorderColor ||
//                         theme.dashboardTheme?.components?.input?.focusBorderColorFallback ||
//                         STYLE_GUIDE.COLORS.inputFocusFallback,
//                     },
//                   },
//                   '& .MuiInputLabel-root': {
//                     color: theme.dashboardTheme?.colors?.text?.secondary || STYLE_GUIDE.COLORS.darkBorderFocus,
//                   },
//                   '& .MuiInputLabel-root.Mui-focused': {
//                     color:
//                       theme.dashboardTheme?.components?.input?.focusBorderColor ||
//                       theme.dashboardTheme?.components?.input?.focusBorderColorFallback ||
//                       STYLE_GUIDE.COLORS.inputFocusFallback,
//                   },
//                   '& .MuiInputBase-input': {
//                     color: `${theme.dashboardTheme?.colors?.inputText} !important`,
//                   },
//                   '& .MuiInputBase-input::placeholder': {
//                     color: `${theme.dashboardTheme?.colors?.text?.secondary || '#666'} !important`,
//                   },
//                   '& .MuiInputBase-input:-webkit-autofill': {
//                     WebkitTextFillColor: `${theme.dashboardTheme?.colors?.inputText} !important`,
//                     WebkitBoxShadow: `0 0 0 1000px ${theme.dashboardTheme?.colors?.background?.paper || '#ffffff'} inset !important`,
//                   },
//                 }}
//               />

//               <CommonSelect
//                 control={control}
//                 name="versionType"
//                 label="Version Type"
//                 options={[
//                   { label: 'Monthly', value: 'monthly' },
//                   { label: 'Number', value: 'number' },
//                 ]}
//                 defaultValue={data?.versionType || ''}
//                 rules={{ required: 'Version type is required' }}
//                 error={!!errors.versionType}
//                 errorMessage={errors.versionType?.message}
//               />
//             </Stack>
//           </Box>
//         </DialogContent>
//         <DialogActions>
//           {createDataSource.isPending || updateDataSource.isPending ? (
//             <ProgressBar />
//           ) : (
//             <>
//               <Button
//                 onClick={handleCancel}
//                 color="error"
//                 sx={{
//                   fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.large,
//                   fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold,
//                   p: STYLE_GUIDE.SPACING.s2,
//                   pl: STYLE_GUIDE.SPACING.s4,
//                   pr: STYLE_GUIDE.SPACING.s4,
//                 }}
//               >
//                 Cancel
//               </Button>
//               <Button
//                 type="submit"
//                 variant="contained"
//                 color="primary"
//                 onClick={handleSubmit(onSubmit)}
//                 sx={{
//                   fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.large,
//                   fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold,
//                   p: STYLE_GUIDE.SPACING.s2,
//                   pl: STYLE_GUIDE.SPACING.s4,
//                   pr: STYLE_GUIDE.SPACING.s4,
//                 }}
//               >
//                 Save Data Source
//               </Button>
//             </>
//           )}
//         </DialogActions>
//       </Dialog>
//     </>
//   );
// };

// export default CreateUpdateDataSource;


import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Typography,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { GET, POST, PUT } from '../../../services/apiRoutes';
import ProgressBar from '../../molecule/progressBar';
import usePost from '../../../hooks/usePost';
import usePut from '../../../hooks/usePut';
import CommonSelect from '../../common/dropdown/commonSelect';
import CommonDropdownSearch from '../../common/dropdown/searchableDropdown';
import useGet from '../../../hooks/useGet';
import { STYLE_GUIDE } from '../../../styles';
import { useUnifiedTheme } from '../../../hooks/useUnifiedTheme';
import axiosInstance from '../../../services/axiosInstance';

interface Attribute {
  _id: string;
  name: string;
}

interface Entity {
  _id: string;
  name: string;
  attributes: Attribute[];
}

interface DataSourceRequestPayload {
  name: string;
  code: string;
  description?: string;
  versionType: string;
  entityId: string;
  entityAttributes?: string[][];
  entityAttributeIds?: string[][];
  uniqueAttributeRules?: { _id: string; name: string }[][];
  _id?: string;
}

interface DataSourceResponse {
  success: boolean;
}

interface CreateUpdateDataSourceProps {
  setReload: React.Dispatch<React.SetStateAction<boolean>>;
  CustomButton: React.ReactElement;
  title: string;
  data?: DataSourceRequestPayload & { entityId: Entity | string; uniqueAttributeRules?: { _id: string; name: string }[][] };
}

const CreateUpdateDataSource: React.FC<CreateUpdateDataSourceProps> = ({
  setReload,
  CustomButton,
  title,
  data,
}) => {
  const theme = useUnifiedTheme();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [entityAttributes, setEntityAttributes] = useState<string[]>([]);
  const [entityAttributeIds, setEntityAttributeIds] = useState<string[]>([]);
  const [entityName, setEntityName] = useState<string>(''); // State for entity name
  const [isLoadingEntity, setIsLoadingEntity] = useState(false); // Loading state for API call
  const [error, setError] = useState<string | null>(null); // Error state for API call
console.log("data", data);
  const {
    control,
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DataSourceRequestPayload>({
    defaultValues: {
      name: data?.name ?? '',
      code: data?.code ?? '',
      description: data?.description ?? '',
      versionType: data?.versionType ?? '',
      entityId: typeof data?.entityId === 'string' ? data.entityId : data?.entityId?._id ?? '',
      entityAttributes: data?.uniqueAttributeRules?.length
        ? data.uniqueAttributeRules.map((rule) => rule.map((attr) => attr.name))
        : [['']],
      entityAttributeIds: data?.uniqueAttributeRules?.length
        ? data.uniqueAttributeRules.map((rule) => rule.map((attr) => attr._id))
        : [['']],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'entityAttributes',
  });

  const entityId = watch('entityId');

  // Initialize entityName from data prop (for edit mode)
  useEffect(() => {
    if (data?.entityId && typeof data.entityId !== 'string' && data.entityId.name) {
      setEntityName(data.entityId.name);
      // Optionally set attributes if available in data
      if (data.entityId.attributes) {
        setEntityAttributes(data.entityId.attributes.map((attr) => attr.name));
        setEntityAttributeIds(data.entityId.attributes.map((attr) => attr._id));
      }
    } else {
      setEntityName('');
      setEntityAttributes([]);
      setEntityAttributeIds([]);
    }
  }, [data]);

  // Fetch entity details when dialog is open and entityId changes
  useEffect(() => {
    if (!open || !entityId) {
      // Clear attributes and name if no entityId or dialog is closed
      setEntityAttributes([]);
      setEntityAttributeIds([]);
      setEntityName('');
      return;
    }

    // Skip API call if entityName is already set (e.g., from data prop in edit mode)
    if (entityName && data?.entityId && (typeof data.entityId === 'string' ? data.entityId === entityId : data.entityId._id === entityId)) {
      return;
    }

    setIsLoadingEntity(true);
    setError(null);

    axiosInstance
      .get(`/entities/${entityId}`)
      .then((response) => {
        console.log('Entity API Response:', response.data);
        if (response.data) {
          setEntityName(response.data.name || '');
          setEntityAttributes(response.data.attributes?.map((attr: Attribute) => attr.name) || []);
          setEntityAttributeIds(response.data.attributes?.map((attr: Attribute) => attr._id) || []);
        }
      })
      .catch((error) => {
        console.error('Error fetching entity details:', error);
        setError('Failed to fetch entity details. Please try again.');
      })
      .finally(() => {
        setIsLoadingEntity(false);
      });
  }, [entityId, open, entityName, data]);

  useEffect(() => {
    if (open && fields.length === 0) {
      append(['']);
    }
  }, [open, fields, append]);

 const codeAvailability = useGet<{ success: boolean; available: boolean; message: string }>(
  [`codeAvailability`, code],
  `${GET?.Data_Source_Code}/${code}`,
  !!code && /^[a-zA-Z0-9_]+$/.test(code)
);

  const nameAvailability = useGet<{ success: boolean; available: boolean; message: string }>(
    [`nameAvailability`, name],
    `${GET?.Data_Source_Name}/${name}`,
    !!name
  );

  const createDataSource = usePost<DataSourceRequestPayload, DataSourceResponse>(
    ['createDataSource'],
    (data) => {
      if (data?.success) {
        setCode('');
        setName('');
        setReload(true);
        setOpen(false);
        reset();
      }
    },
    true
  );

  const updateDataSource = usePut<DataSourceRequestPayload, DataSourceResponse>(
    ['updateDataSource'],
    (data) => {
      if (data?.success) {
        setCode('');
        setName('');
        setReload(true);
        setOpen(false);
        reset();
      }
    },
    true
  );

  const onSubmit = (formData: DataSourceRequestPayload) => {
    console.log('formData before processing:', formData);
    const updatedEntityAttributeIds = formData.entityAttributes?.map((attributes) => {
      if (!Array.isArray(attributes)) {
        console.error('Invalid attributes format:', attributes);
        return [];
      }
      return attributes
        .filter((attribute) => attribute !== '' && typeof attribute === 'string')
        .map((attribute) => {
          const typeIndex = entityAttributes.indexOf(attribute);
          return typeIndex !== -1 ? entityAttributeIds[typeIndex] || '' : '';
        })
        .filter((id) => id !== '' && typeof id === 'string');
    }) || [];

    const updatedUniqueAttributeRules = updatedEntityAttributeIds.map((ids) =>
      ids.map((id) => {
        const index = entityAttributeIds.indexOf(id);
        return { _id: id, name: entityAttributes[index] || '' };
      })
    );

    const updatedFormData = {
      ...formData,
      entityAttributeIds: updatedEntityAttributeIds,
      uniqueAttributeRules: updatedUniqueAttributeRules,
    };

    console.log('updatedFormData:', updatedFormData);

    if (data && data._id) {
      updateDataSource.mutate({
        url: `${PUT.UPDATE_DATA_SOURCE}/${data._id}`,
        payload: updatedFormData,
      });
    } else {
      createDataSource.mutate({
        url: POST.CREATE_DATA_SOURCE,
        payload: updatedFormData,
      });
    }
  };

  const handleCancel = () => {
    setOpen(false);
    setCode('');
    setName('');
    setEntityAttributes([]);
    setEntityAttributeIds([]);
    setEntityName('');
    setError(null);
    reset();
  };

  const handleAddMoreEntity = () => {
    append(['']);
  };

  // Transform entityAttributes for CommonSelect
  const selectOptions = entityAttributes.map((name, idx) => ({
    label: name,
    value: entityAttributeIds[idx] || name,
  }));

  return (
    <>
      <Box onClick={() => setOpen(true)}>{CustomButton}</Box>

      <Dialog
        fullWidth
        maxWidth="lg"
        open={open}
        onClose={handleCancel}
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.dialog?.background || STYLE_GUIDE.COLORS.white,
            border: `1px solid ${theme.palette.dialog?.border || theme.palette.border?.main || STYLE_GUIDE.COLORS.borderGray}`,
            borderRadius: theme.palette.dialog?.borderRadius || '8px',
            boxShadow: theme.palette.dialog?.shadow || STYLE_GUIDE.SHADOWS.lg,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: theme.palette.dialog?.titleFontWeight || STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold,
            fontSize: theme.palette.dialog?.titleFontSize || STYLE_GUIDE.TYPOGRAPHY.fontSize.xl,
            color: theme.palette.dialog?.titleColor || STYLE_GUIDE.COLORS.textDarkGray,
          }}
        >
          {title}
        </DialogTitle>
        <DialogContent
          sx={{
            color: theme.palette.dialog?.contentColor || STYLE_GUIDE.COLORS.textDarkGray,
            fontSize: theme.palette.dialog?.contentFontSize || '1rem',
            borderTop: `1px solid ${theme.palette.divider}`,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={3}>
              {/* Display Entity Name */}
              {entityName && (
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Selected Entity: <strong>{entityName}</strong>
                </Typography>
              )}
              {isLoadingEntity && <ProgressBar />}
              <TextField
                label="Data Source Name*"
                fullWidth
                {...register('name', {
                  required: 'Data source name is required',
                })}
                onChange={(event) => {
                  setName(event.target.value);
                  setValue('name', event.target.value);
                }}
                onBlur={(event) => {
                  const sanitizedCode = event.target.value.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '');
                  setCode(sanitizedCode);
                  setValue('code', sanitizedCode);
                }}
                error={!!errors.name}
                defaultValue={data?.name ?? ''}
                helperText={
                  errors.name?.message ||
                  (nameAvailability.isFetched && name.length > 0 ? (
                    nameAvailability.data?.available ? (
                      <Typography sx={{ color: STYLE_GUIDE.COLORS.bootstrapSuccess }}>
                        Name is available
                      </Typography>
                    ) : (
                      <Typography sx={{ color: STYLE_GUIDE.COLORS.bootstrapDanger }}>
                        Name is not available
                      </Typography>
                    )
                  ) : (
                    ''
                  ))
                }
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: STYLE_GUIDE.SPACING.s2,
                    alignItems: 'flex-start',
                    paddingRight: STYLE_GUIDE.SPACING.s2,
                    fontSize: '14px',
                    backgroundColor: theme.dashboardTheme?.colors?.background?.paper || '#ffffff',
                    '& fieldset': {
                      borderColor: theme.dashboardTheme?.colors?.inputBorder || STYLE_GUIDE.COLORS.darkBackground,
                    },
                    '&:hover fieldset': {
                      borderColor: theme.dashboardTheme?.colors?.borderHover || STYLE_GUIDE.COLORS.darkBorderHover,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor:
                        theme.dashboardTheme?.components?.input?.focusBorderColor ||
                        theme.dashboardTheme?.components?.input?.focusBorderColorFallback ||
                        STYLE_GUIDE.COLORS.inputFocusFallback,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: theme.dashboardTheme?.colors?.text?.secondary || STYLE_GUIDE.COLORS.darkBorderFocus,
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color:
                      theme.dashboardTheme?.components?.input?.focusBorderColor ||
                      theme.dashboardTheme?.components?.input?.focusBorderColorFallback ||
                      STYLE_GUIDE.COLORS.inputFocusFallback,
                  },
                  '& .MuiInputBase-input': {
                    color: `${theme.dashboardTheme?.colors?.inputText} !important`,
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: `${theme.dashboardTheme?.colors?.text?.secondary || '#666'} !important`,
                  },
                  '& .MuiInputBase-input:-webkit-autofill': {
                    WebkitTextFillColor: `${theme.dashboardTheme?.colors?.inputText} !important`,
                    WebkitBoxShadow: `0 0 0 1000px ${theme.dashboardTheme?.colors?.background?.paper || '#ffffff'} inset !important`,
                  },
                }}
              />

              <TextField
                label="Data Source Description"
                fullWidth
                multiline
                rows={4}
                {...register('description')}
                error={!!errors.description}
                helperText={errors.description?.message}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: STYLE_GUIDE.SPACING.s2,
                    alignItems: 'flex-start',
                    paddingRight: STYLE_GUIDE.SPACING.s2,
                    fontSize: '14px',
                    padding: '12px 16px',
                    backgroundColor: theme.dashboardTheme?.colors?.background?.paper || '#ffffff',
                    '& fieldset': {
                      borderColor: theme.dashboardTheme?.colors?.inputBorder || STYLE_GUIDE.COLORS.darkBackground,
                    },
                    '&:hover fieldset': {
                      borderColor: theme.dashboardTheme?.colors?.borderHover || STYLE_GUIDE.COLORS.darkBorderHover,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor:
                        theme.dashboardTheme?.components?.input?.focusBorderColor ||
                        theme.dashboardTheme?.components?.input?.focusBorderColorFallback ||
                        STYLE_GUIDE.COLORS.inputFocusFallback,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: theme.dashboardTheme?.colors?.text?.secondary || STYLE_GUIDE.COLORS.darkBorderFocus,
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color:
                      theme.dashboardTheme?.components?.input?.focusBorderColor ||
                      theme.dashboardTheme?.components?.input?.focusBorderColorFallback ||
                      STYLE_GUIDE.COLORS.inputFocusFallback,
                  },
                  '& .MuiInputBase-input': {
                    color: `${theme.dashboardTheme?.colors?.inputText} !important`,
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: `${theme.dashboardTheme?.colors?.text?.secondary || '#666'} !important`,
                  },
                  '& .MuiInputBase-input:-webkit-autofill': {
                    WebkitTextFillColor: `${theme.dashboardTheme?.colors?.inputText} !important`,
                    WebkitBoxShadow: `0 0 0 1000px ${theme.dashboardTheme?.colors?.background?.paper || '#ffffff'} inset !important`,
                  },
                }}
              />

              <Box sx={{ mb: 3 }}>
                <CommonDropdownSearch
                  control={control}
                  name="entityId"
                  label="Select Entity*"
                  apiUrl={`${GET.Entity_List}`}
                  labelName="name"
                  labelValue="_id"
                  defaultValue={typeof data?.entityId === 'string' ? data.entityId : data?.entityId?._id || ''}
                  rules={{ required: 'Entity is required' }}
                  error={!!errors.entity一天前Id}
                  errorMessage={errors.entityId?.message as string}
                  apiName="entityList"
                  defaultDataUrl=""
                />
              </Box>

              {fields.map((field, index) => (
                <Box key={field.id} sx={{ mb: 3 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" mb={1}>
                        Unique {index + 1} Attributes
                      </Typography>
                      <CommonSelect
                        control={control}
                        name={`entityAttributes.${index}`}
                        label={`Select Unique Attribute ${index + 1}*`}
                        options={selectOptions}
                        multiple={true}
                        defaultValue={field.value || ['']}
                        rules={{ required: entityId ? 'Unique Attribute is required' : false }}
                        error={!!errors.entityAttributes?.[index]}
                        errorMessage={errors.entityAttributes?.[index]?.message as string}
                      />
                    </Box>
                    {fields.length > 1 && (
                      <IconButton color="error" onClick={() => remove(index)}>
                        <RemoveCircleOutlineIcon />
                      </IconButton>
                    )}
                  </Stack>
                </Box>
              ))}

              <Button
                variant="contained"
                startIcon={<AddCircleOutlineIcon />}
                onClick={handleAddMoreEntity}
                sx={{ whiteSpace: 'nowrap', mt: 2 }}
              >
                Add More Entity
              </Button>

              {!!data?._id && (
                <CommonSelect
                  control={control}
                  name="entityType"
                  label="Select Entity*"
                  options={
                    data?.entityId
                      ? [
                          {
                            label: typeof data.entityId === 'string' ? data.entityId : data.entityId.name || '',
                            value: typeof data.entityId === 'string' ? data.entityId : data.entityId._id || '',
                          },
                        ]
                      : [{ label: '', value: '' }]
                  }
                  defaultValue={typeof data?.entityId === 'string' ? data.entityId : data?.entityId?._id || ''}
                  rules={{ required: '' }}
                  error={false}
                  errorMessage=""
                  disabled={true}
                />
              )}

              <TextField
                label="Data Source Code(Unique Code)*"
                fullWidth
                {...register('code', {
                  required: 'Data source code is required',
                  pattern: {
                    value: /^(?!.*(\$|\0|^system\.|\.system\.))[\w]+$/,
                    message:
                      'Data source code should not contain special characters, null characters, space or restricted prefixes (e.g., "system." or ".system.")',
                  },
                })}
                onChange={(event) => {
                  const sanitizedCode = event.target.value.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '');
                  setCode(sanitizedCode);
                  setValue('code', sanitizedCode);
                }}
                error={!!errors.code}
                value={code || (data?.code ? data.code : (name?.toLowerCase() || '').replace(/[^a-zA-Z0-9_]/g, ''))}
                disabled={data?.code ? true : false}
                helperText={
                  errors.code?.message ||
                  (codeAvailability.isFetched && code.length > 0 ? (
                    codeAvailability.data?.available ? (
                      <Typography sx={{ color: STYLE_GUIDE.COLORS.bootstrapSuccess }}>
                        Code is available
                      </Typography>
                    ) : (
                      <Typography sx={{ color: STYLE_GUIDE.COLORS.bootstrapDanger }}>
                        Code is not available
                      </Typography>
                    )
                  ) : (
                    ''
                  ))
                }
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: STYLE_GUIDE.SPACING.s2,
                    alignItems: 'flex-start',
                    paddingRight: STYLE_GUIDE.SPACING.s2,
                    fontSize: '14px',
                    padding: '12px 16px',
                    backgroundColor: theme.dashboardTheme?.colors?.background?.paper || '#ffffff',
                    '& fieldset': {
                      borderColor: theme.dashboardTheme?.colors?.inputBorder || STYLE_GUIDE.COLORS.darkBackground,
                    },
                    '&:hover fieldset': {
                      borderColor: theme.dashboardTheme?.colors?.borderHover || STYLE_GUIDE.COLORS.darkBorderHover,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor:
                        theme.dashboardTheme?.components?.input?.focusBorderColor ||
                        theme.dashboardTheme?.components?.input?.focusBorderColorFallback ||
                        STYLE_GUIDE.COLORS.inputFocusFallback,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: theme.dashboardTheme?.colors?.text?.secondary || STYLE_GUIDE.COLORS.darkBorderFocus,
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color:
                      theme.dashboardTheme?.components?.input?.focusBorderColor ||
                      theme.dashboardTheme?.components?.input?.focusBorderColorFallback ||
                      STYLE_GUIDE.COLORS.inputFocusFallback,
                  },
                  '& .MuiInputBase-input': {
                    color: `${theme.dashboardTheme?.colors?.inputText} !important`,
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: `${theme.dashboardTheme?.colors?.text?.secondary || '#666'} !important`,
                  },
                  '& .MuiInputBase-input:-webkit-autofill': {
                    WebkitTextFillColor: `${theme.dashboardTheme?.colors?.inputText} !important`,
                    WebkitBoxShadow: `0 0 0 1000px ${theme.dashboardTheme?.colors?.background?.paper || '#ffffff'} inset !important`,
                  },
                }}
              />

              <CommonSelect
                control={control}
                name="versionType"
                label="Version Type"
                options={[
                  { label: 'Monthly', value: 'monthly' },
                  { label: 'Number', value: 'number' },
                ]}
                defaultValue={data?.versionType || ''}
                rules={{ required: 'Version type is required' }}
                error={!!errors.versionType}
                errorMessage={errors.versionType?.message}
              />
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          {createDataSource.isPending || updateDataSource.isPending ? (
            <ProgressBar />
          ) : (
            <>
              <Button
                onClick={handleCancel}
                color="error"
                sx={{
                  fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.large,
                  fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold,
                  p: STYLE_GUIDE.SPACING.s2,
                  pl: STYLE_GUIDE.SPACING.s4,
                  pr: STYLE_GUIDE.SPACING.s4,
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                onClick={handleSubmit(onSubmit)}
                sx={{
                  fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.large,
                  fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold,
                  p: STYLE_GUIDE.SPACING.s2,
                  pl: STYLE_GUIDE.SPACING.s4,
                  pr: STYLE_GUIDE.SPACING.s4,
                }}
              >
                Save Data Source
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CreateUpdateDataSource;


// import React, { useEffect, useState } from 'react';
// import { useForm, useFieldArray } from 'react-hook-form';
// import {
//   Box,
//   Button,
//   TextField,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Stack,
//   Typography,
//   IconButton,
//   Snackbar,
//   Alert,
// } from '@mui/material';
// import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
// import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
// import { GET, POST, PUT } from '../../../services/apiRoutes';
// import ProgressBar from '../../molecule/progressBar';
// import usePost from '../../../hooks/usePost';
// import usePut from '../../../hooks/usePut';
// import CommonSelect from '../../common/dropdown/commonSelect';
// import CommonDropdownSearch from '../../common/dropdown/searchableDropdown';
// import useGet from '../../../hooks/useGet';
// import { STYLE_GUIDE } from '../../../styles';
// import { useUnifiedTheme } from '../../../hooks/useUnifiedTheme';
// import axiosInstance from '../../../services/axiosInstance';

// interface Attribute {
//   _id: string;
//   name: string;
// }

// interface Entity {
//   _id: string;
//   name: string;
//   attributes: Attribute[];
// }

// interface DataSourceRequestPayload {
//   name: string;
//   code: string;
//   description?: string;
//   versionType: string;
//   entityId: string;
//   entityAttributes?: string[][];
//   entityAttributeIds?: string[][];
//   uniqueAttributeRules?: { _id: string; name: string }[][];
//   _id?: string;
// }

// interface DataSourceResponse {
//   success: boolean;
// }

// interface CreateUpdateDataSourceProps {
//   setReload: React.Dispatch<React.SetStateAction<boolean>>;
//   CustomButton: React.ReactElement;
//   title: string;
//   data?: DataSourceRequestPayload & { entityId: Entity | string; uniqueAttributeRules?: { _id: string; name: string }[][] };
// }

// const CreateUpdateDataSource: React.FC<CreateUpdateDataSourceProps> = ({
//   setReload,
//   CustomButton,
//   title,
//   data,
// }) => {
//   const theme = useUnifiedTheme();
//   const [open, setOpen] = useState(false);
//   const [code, setCode] = useState('');
//   const [name, setName] = useState('');
//   const [entityAttributes, setEntityAttributes] = useState<string[]>([]);
//   const [entityAttributeIds, setEntityAttributeIds] = useState<string[]>([]);
//   const [entityName, setEntityName] = useState<string>(''); // State for entity name
//   const [isLoadingEntity, setIsLoadingEntity] = useState(false); // Loading state for API call
//   const [error, setError] = useState<string | null>(null); // Error state for API call

//   const {
//     control,
//     handleSubmit,
//     register,
//     reset,
//     setValue,
//     watch,
//     formState: { errors },
//   } = useForm<DataSourceRequestPayload>({
//     defaultValues: {
//       name: data?.name ?? '',
//       code: data?.code ?? '',
//       description: data?.description ?? '',
//       versionType: data?.versionType ?? '',
//       entityId: typeof data?.entityId === 'string' ? data.entityId : data?.entityId?._id ?? '',
//       entityAttributes: data?.uniqueAttributeRules?.length
//         ? data.uniqueAttributeRules.map((rule) => rule.map((attr) => attr.name))
//         : [['']],
//       entityAttributeIds: data?.uniqueAttributeRules?.length
//         ? data.uniqueAttributeRules.map((rule) => rule.map((attr) => attr._id))
//         : [['']],
//     },
//   });

//   const { fields, append, remove } = useFieldArray({
//     control,
//     name: 'entityAttributes',
//   });

//   const entityId = watch('entityId');

//   // Initialize entityName and attributes from data prop (for edit mode)
//   useEffect(() => {
//     if (data?.entityId && typeof data.entityId !== 'string' && data.entityId.name) {
//       setEntityName(data.entityId.name);
//       if (data.entityId.attributes) {
//         setEntityAttributes(data.entityId.attributes.map((attr) => attr.name));
//         setEntityAttributeIds(data.entityId.attributes.map((attr) => attr._id));
//       }
//     } else {
//       setEntityName('');
//       setEntityAttributes([]);
//       setEntityAttributeIds([]);
//     }
//   }, [data]);

//   // Fetch entity details when dialog is open and entityId changes
//   useEffect(() => {
//     if (!open || !entityId) {
//       setEntityAttributes([]);
//       setEntityAttributeIds([]);
//       setEntityName('');
//       return;
//     }

//     if (entityName && data?.entityId && (typeof data.entityId === 'string' ? data.entityId === entityId : data.entityId._id === entityId)) {
//       return;
//     }

//     setIsLoadingEntity(true);
//     setError(null);

//     axiosInstance
//       .get(`/entities/${entityId}`)
//       .then((response) => {
//         console.log('Entity API Response:', response.data);
//         if (response.data) {
//           setEntityName(response.data.name || '');
//           setEntityAttributes(response.data.attributes?.map((attr: Attribute) => attr.name) || []);
//           setEntityAttributeIds(response.data.attributes?.map((attr: Attribute) => attr._id) || []);
//         }
//       })
//       .catch((error Electromagnetic Fields and Waves) => {
//         console.error('Error fetching entity details:', error);
//         setError('Failed to fetch entity details. Please try again.');
//       })
//       .finally(() => {
//         setIsLoadingEntity(false);
//       });
//   }, [entityId, open, entityName, data]);

//   useEffect(() => {
//     if (open && fields.length === 0) {
//       append(['']);
//     }
//   }, [open, fields, append]);

//   // Fixed query key for codeAvailability
//   const codeAvailability = useGet<{ success: boolean; available: boolean; message: string }>(
//     ['codeAvailability', code], // Fixed: Use string literal 'codeAvailability'
//     `${GET?.Data_Source_Code}/${code}`,
//     !!code && /^[a-zA-Z0-9_]+$/.test(code)
//   );

//   const nameAvailability = useGet<{ success: boolean; available: boolean; message: string }>(
//     ['nameAvailability', name], // Consistent query key
//     `${GET?.Data_Source_Name}/${name}`,
//     !!name
//   );

//   const createDataSource = usePost<DataSourceRequestPayload, DataSourceResponse>(
//     ['createDataSource'],
//     (data) => {
//       if (data?.success) {
//         setCode('');
//         setName('');
//         setReload(true);
//         setOpen(false);
//         reset();
//       }
//     },
//     true
//   );

//   const updateDataSource = usePut<DataSourceRequestPayload, DataSourceResponse>(
//     ['updateDataSource'],
//     (data) => {
//       if (data?.success) {
//         setCode('');
//         setName('');
//         setReload(true);
//         setOpen(false);
//         reset();
//       }
//     },
//     true
//   );

//   const onSubmit = (formData: DataSourceRequestPayload) => {
//     console.log('formData before processing:', formData);
//     const updatedEntityAttributeIds = formData.entityAttributes?.map((attributes) => {
//       if (!Array.isArray(attributes)) {
//         console.error('Invalid attributes format:', attributes);
//         return [];
//       }
//       return attributes
//         .filter((attribute) => attribute !== '' && typeof attribute === 'string')
//         .map((attribute) => {
//           const typeIndex = entityAttributes.indexOf(attribute);
//           return typeIndex !== -1 ? entityAttributeIds[typeIndex] || '' : '';
//         })
//         .filter((id) => id !== '' && typeof id === 'string');
//     }) || [];

//     const updatedUniqueAttributeRules = updatedEntityAttributeIds.map((ids) =>
//       ids.map((id) => {
//         const index = entityAttributeIds.indexOf(id);
//         return { _id: id, name: entityAttributes[index] || '' };
//       })
//     );

//     const updatedFormData = {
//       ...formData,
//       entityAttributeIds: updatedEntityAttributeIds,
//       uniqueAttributeRules: updatedUniqueAttributeRules,
//     };

//     console.log('updatedFormData:', updatedFormData);

//     if (data && data._id) {
//       updateDataSource.mutate({
//         url: `${PUT.UPDATE_DATA_SOURCE}/${data._id}`,
//         payload: updatedFormData,
//       });
//     } else {
//       createDataSource.mutate({
//         url: POST.CREATE_DATA_SOURCE,
//         payload: updatedFormData,
//       });
//     }
//   };

//   const handleCancel = () => {
//     setOpen(false);
//     setCode('');
//     setName('');
//     setEntityAttributes([]);
//     setEntityAttributeIds([]);
//     setEntityName('');
//     setError(null);
//     reset();
//   };

//   const handleAddMoreEntity = () => {
//     append(['']);
//   };

//   // Transform entityAttributes for CommonSelect
//   const selectOptions = entityAttributes.map((name, idx) => ({
//     label: name,
//     value: entityAttributeIds[idx] || name,
//   }));

//   return (
//     <>
//       <Box onClick={() => setOpen(true)}>{CustomButton}</Box>

//       <Dialog
//         fullWidth
//         maxWidth="lg"
//         open={open}
//         onClose={handleCancel}
//         PaperProps={{
//           sx: {
//             backgroundColor: theme.palette.dialog?.background || STYLE_GUIDE.COLORS.white,
//             border: `1px solid ${theme.palette.dialog?.border || theme.palette.border?.main || STYLE_GUIDE.COLORS.borderGray}`,
//             borderRadius: theme.palette.dialog?.borderRadius || '8px',
//             boxShadow: theme.palette.dialog?.shadow || STYLE_GUIDE.SHADOWS.lg,
//           },
//         }}
//       >
//         <DialogTitle
//           sx={{
//             fontWeight: theme.palette.dialog?.titleFontWeight || STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold,
//             fontSize: theme.palette.dialog?.titleFontSize || STYLE_GUIDE.TYPOGRAPHY.fontSize.xl,
//             color: theme.palette.dialog?.titleColor || STYLE_GUIDE.COLORS.textDarkGray,
//           }}
//         >
//           {title}
//         </DialogTitle>
//         <DialogContent
//           sx={{
//             color: theme.palette.dialog?.contentColor || STYLE_GUIDE.COLORS.textDarkGray,
//             fontSize: theme.palette.dialog?.contentFontSize || '1rem',
//             borderTop: `1px solid ${theme.palette.divider}`,
//             borderBottom: `1px solid ${theme.palette.divider}`,
//           }}
//         >
//           <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
//             <Stack spacing={3}>
//               {/* Display Entity Name */}
//               {entityName && (
//                 <Typography variant="body1" sx={{ mb: 2 }}>
//                   Selected Entity: <strong>{entityName}</strong>
//                 </Typography>
//               )}
//               {isLoadingEntity && <ProgressBar />}
//               <TextField
//                 label="Data Source Name*"
//                 fullWidth
//                 {...register('name', {
//                   required: 'Data source name is required',
//                 })}
//                 onChange={(event) => {
//                   setName(event.target.value);
//                   setValue('name', event.target.value);
//                 }}
//                 onBlur={(event) => {
//                   const sanitizedCode = event.target.value.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '');
//                   setCode(sanitizedCode);
//                   setValue('code', sanitizedCode);
//                 }}
//                 error={!!errors.name}
//                 defaultValue={data?.name ?? ''} // Prefilled with "3r"
//                 helperText={
//                   errors.name?.message ||
//                   (nameAvailability.isFetched && name.length > 0 ? (
//                     nameAvailability.data?.available ? (
//                       <Typography sx={{ color: STYLE_GUIDE.COLORS.bootstrapSuccess }}>
//                         Name is available
//                       </Typography>
//                     ) : (
//                       <Typography sx={{ color: STYLE_GUIDE.COLORS.bootstrapDanger }}>
//                         Name is not available
//                       </Typography>
//                     )
//                   ) : (
//                     ''
//                   ))
//                 }
//                 sx={{
//                   '& .MuiOutlinedInput-root': {
//                     borderRadius: STYLE_GUIDE.SPACING.s2,
//                     alignItems: 'flex-start',
//                     paddingRight: STYLE_GUIDE.SPACING.s2,
//                     fontSize: '14px',
//                     backgroundColor: theme.dashboardTheme?.colors?.background?.paper || '#ffffff',
//                     '& fieldset': {
//                       borderColor: theme.dashboardTheme?.colors?.inputBorder || STYLE_GUIDE.COLORS.darkBackground,
//                     },
//                     '&:hover fieldset': {
//                       borderColor: theme.dashboardTheme?.colors?.borderHover || STYLE_GUIDE.COLORS.darkBorderHover,
//                     },
//                     '&.Mui-focused fieldset': {
//                       borderColor:
//                         theme.dashboardTheme?.components?.input?.focusBorderColor ||
//                         theme.dashboardTheme?.components?.input?.focusBorderColorFallback ||
//                         STYLE_GUIDE.COLORS.inputFocusFallback,
//                     },
//                   },
//                   '& .MuiInputLabel-root': {
//                     color: theme.dashboardTheme?.colors?.text?.secondary || STYLE_GUIDE.COLORS.darkBorderFocus,
//                   },
//                   '& .MuiInputLabel-root.Mui-focused': {
//                     color:
//                       theme.dashboardTheme?.components?.input?.focusBorderColor ||
//                       theme.dashboardTheme?.components?.input?.focusBorderColorFallback ||
//                       STYLE_GUIDE.COLORS.inputFocusFallback,
//                   },
//                   '& .MuiInputBase-input': {
//                     color: `${theme.dashboardTheme?.colors?.inputText} !important`,
//                   },
//                   '& .MuiInputBase-input::placeholder': {
//                     color: `${theme.dashboardTheme?.colors?.text?.secondary || '#666'} !important`,
//                   },
//                   '& .MuiInputBase-input:-webkit-autofill': {
//                     WebkitTextFillColor: `${theme.dashboardTheme?.colors?.inputText} !important`,
//                     WebkitBoxShadow: `0 0 0 1000px ${theme.dashboardTheme?.colors?.background?.paper || '#ffffff'} inset !important`,
//                   },
//                 }}
//               />

//               <TextField
//                 label="Data Source Description"
//                 fullWidth
//                 multiline
//                 rows={4}
//                 {...register('description')}
//                 error={!!errors.description}
//                 helperText={errors.description?.message}
//                 defaultValue={data?.description ?? ''} // Prefilled with "r3"
//                 sx={{
//                   '& .MuiOutlinedInput-root': {
//                     borderRadius: STYLE_GUIDE.SPACING.s2,
//                     alignItems: 'flex-start',
//                     paddingRight: STYLE_GUIDE.SPACING.s2,
//                     fontSize: '14px',
//                     padding: '12px 16px',
//                     backgroundColor: theme.dashboardTheme?.colors?.background?.paper || '#ffffff',
//                     '& fieldset': {
//                       borderColor: theme.dashboardTheme?.colors?.inputBorder || STYLE_GUIDE.COLORS.darkBackground,
//                     },
//                     '&:hover fieldset': {
//                       borderColor: theme.dashboardTheme?.colors?.borderHover || STYLE_GUIDE.COLORS.darkBorderHover,
//                     },
//                     '&.Mui-focused fieldset': {
//                       borderColor:
//                         theme.dashboardTheme?.components?.input?.focusBorderColor ||
//                         theme.dashboardTheme?.components?.input?.focusBorderColorFallback ||
//                         STYLE_GUIDE.COLORS.inputFocusFallback,
//                     },
//                   },
//                   '& .MuiInputLabel-root': {
//                     color: theme.dashboardTheme?.colors?.text?.secondary || STYLE_GUIDE.COLORS.darkBorderFocus,
//                   },
//                   '& .MuiInputLabel-root.Mui-focused': {
//                     color:
//                       theme.dashboardTheme?.components?.input?.focusBorderColor ||
//                       theme.dashboardTheme?.components?.input?.focusBorderColorFallback ||
//                       STYLE_GUIDE.COLORS.inputFocusFallback,
//                   },
//                   '& .MuiInputBase-input': {
//                     color: `${theme.dashboardTheme?.colors?.inputText} !important`,
//                   },
//                   '& .MuiInputBase-input::placeholder': {
//                     color: `${theme.dashboardTheme?.colors?.text?.secondary || '#666'} !important`,
//                   },
//                   '& .MuiInputBase-input:-webkit-autofill': {
//                     WebkitTextFillColor: `${theme.dashboardTheme?.colors?.inputText} !important`,
//                     WebkitBoxShadow: `0 0 0 1000px ${theme.dashboardTheme?.colors?.background?.paper || '#ffffff'} inset !important`,
//                   },
//                 }}
//               />

//               <Box sx={{ mb: 3 }}>
//                 <CommonDropdownSearch
//                   control={control}
//                   name="entityId"
//                   label="Select Entity*"
//                   apiUrl={`${GET.Entity_List}`}
//                   labelName="name"
//                   labelValue="_id"
//                   defaultValue={typeof data?.entityId === 'string' ? data.entityId : data?.entityId?._id || ''} // Prefilled with "68789e30c1d8419ea2d1f81b"
//                   rules={{ required: 'Entity is required' }}
//                   error={!!errors.entityId}
//                   errorMessage={errors.entityId?.message as string}
//                   apiName="entityList"
//                   defaultDataUrl=""
//                 />
//               </Box>

//               {fields.map((field, index) => (
//                 <Box key={field.id} sx={{ mb: 3 }}>
//                   <Stack direction="row" spacing={2} alignItems="center">
//                     <Box sx={{ flex: 1 }}>
//                       <Typography variant="h6" mb={1}>
//                         Unique {index + 1} Attributes
//                       </Typography>
//                       <CommonSelect
//                         control={control}
//                         name={`entityAttributes.${index}`}
//                         label={`Select Unique Attribute ${index + 1}*`}
//                         options={selectOptions}
//                         multiple={true}
//                         defaultValue={field.value || ['']} // Prefilled from uniqueAttributeRules
//                         rules={{ required: entityId ? 'Unique Attribute is required' : false }}
//                         error={!!errors.entityAttributes?.[index]}
//                         errorMessage={errors.entityAttributes?.[index]?.message as string}
//                       />
//                     </Box>
//                     {fields.length > 1 && (
//                       <IconButton color="error" onClick={() => remove(index)}>
//                         <RemoveCircleOutlineIcon />
//                       </IconButton>
//                     )}
//                   </Stack>
//                 </Box>
//               ))}

//               <Button
//                 variant="contained"
//                 startIcon={<AddCircleOutlineIcon />}
//                 onClick={handleAddMoreEntity}
//                 sx={{ whiteSpace: 'nowrap', mt: 2 }}
//               >
//                 Add More Entity
//               </Button>

//               {!!data?._id && (
//                 <CommonSelect
//                   control={control}
//                   name="entityType"
//                   label="Select Entity*"
//                   options={
//                     data?.entityId
//                       ? [
//                           {
//                             label: typeof data.entityId === 'string' ? data.entityId : data.entityId.name || '',
//                             value: typeof data.entityId === 'string' ? data.entityId : data.entityId._id || '',
//                           },
//                         ]
//                       : [{ label: '', value: '' }]
//                   }
//                   defaultValue={typeof data?.entityId === 'string' ? data.entityId : data?.entityId?._id || ''} // Prefilled with "68789e30c1d8419ea2d1f81b"
//                   rules={{ required: '' }}
//                   error={false}
//                   errorMessage=""
//                   disabled={true}
//                 />
//               )}

//               <TextField
//                 label="Data Source Code(Unique Code)*"
//                 fullWidth
//                 {...register('code', {
//                   required: 'Data source code is required',
//                   pattern: {
//                     value: /^(?!.*(\$|\0|^system\.|\.system\.))[\w]+$/,
//                     message:
//                       'Data source code should not contain special characters, null characters, space or restricted prefixes (e.g., "system." or ".system.")',
//                   },
//                 })}
//                 onChange={(event) => {
//                   const sanitizedCode = event.target.value.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '');
//                   setCode(sanitizedCode);
//                   setValue('code', sanitizedCode);
//                 }}
//                 error={!!errors.code}
//                 value={code || (data?.code ? data.code : (name?.toLowerCase() || '').replace(/[^a-zA-Z0-9_]/g, ''))} // Prefilled with "3r"
//                 disabled={data?.code ? true : false}
//                 helperText={
//                   errors.code?.message ||
//                   (codeAvailability.isFetched && code.length > 0 ? (
//                     codeAvailability.data?.available ? (
//                       <Typography sx={{ color: STYLE_GUIDE.COLORS.bootstrapSuccess }}>
//                         Code is available
//                       </Typography>
//                     ) : (
//                       <Typography sx={{ color: STYLE_GUIDE.COLORS.bootstrapDanger }}>
//                         Code is not available
//                       </Typography>
//                     )
//                   ) : (
//                     ''
//                   ))
//                 }
//                 sx={{
//                   '& .MuiOutlinedInput-root': {
//                     borderRadius: STYLE_GUIDE.SPACING.s2,
//                     alignItems: 'flex-start',
//                     paddingRight: STYLE_GUIDE.SPACING.s2,
//                     fontSize: '14px',
//                     padding: '12px 16px',
//                     backgroundColor: theme.dashboardTheme?.colors?.background?.paper || '#ffffff',
//                     '& fieldset': {
//                       borderColor: theme.dashboardTheme?.colors?.inputBorder || STYLE_GUIDE.COLORS.darkBackground,
//                     },
//                     '&:hover fieldset': {
//                       borderColor: theme.dashboardTheme?.colors?.borderHover || STYLE_GUIDE.COLORS.darkBorderHover,
//                     },
//                     '&.Mui-focused fieldset': {
//                       borderColor:
//                         theme.dashboardTheme?.components?.input?.focusBorderColor ||
//                         theme.dashboardTheme?.components?.input?.focusBorderColorFallback ||
//                         STYLE_GUIDE.COLORS.inputFocusFallback,
//                     },
//                   },
//                   '& .MuiInputLabel-root': {
//                     color: theme.dashboardTheme?.colors?.text?.secondary || STYLE_GUIDE.COLORS.darkBorderFocus,
//                   },
//                   '& .MuiInputLabel-root.Mui-focused': {
//                     color:
//                       theme.dashboardTheme?.components?.input?.focusBorderColor ||
//                       theme.dashboardTheme?.components?.input?.focusBorderColorFallback ||
//                       STYLE_GUIDE.COLORS.inputFocusFallback,
//                   },
//                   '& .MuiInputBase-input': {
//                     color: `${theme.dashboardTheme?.colors?.inputText} !important`,
//                   },
//                   '& .MuiInputBase-input::placeholder': {
//                     color: `${theme.dashboardTheme?.colors?.text?.secondary || '#666'} !important`,
//                   },
//                   '& .MuiInputBase-input:-webkit-autofill': {
//                     WebkitTextFillColor: `${theme.dashboardTheme?.colors?.inputText} !important`,
//                     WebkitBoxShadow: `0 0 0 1000px ${theme.dashboardTheme?.colors?.background?.paper || '#ffffff'} inset !important`,
//                   },
//                 }}
//               />

//               <CommonSelect
//                 control={control}
//                 name="versionType"
//                 label="Version Type"
//                 options={[
//                   { label: 'Monthly', value: 'monthly' },
//                   { label: 'Number', value: 'number' },
//                 ]}
//                 defaultValue={data?.versionType || ''} // Prefilled with "monthly"
//                 rules={{ required: 'Version type is required' }}
//                 error={!!errors.versionType}
//                 errorMessage={errors.versionType?.message}
//               />
//             </Stack>
//           </Box>
//         </DialogContent>
//         <DialogActions>
//           {createDataSource.isPending || updateDataSource.isPending ? (
//             <ProgressBar />
//           ) : (
//             <>
//               <Button
//                 onClick={handleCancel}
//                 color="error"
//                 sx={{
//                   fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.large,
//                   fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold,
//                   p: STYLE_GUIDE.SPACING.s2,
//                   pl: STYLE_GUIDE.SPACING.s4,
//                   pr: STYLE_GUIDE.SPACING.s4,
//                 }}
//               >
//                 Cancel
//               </Button>
//               <Button
//                 type="submit"
//                 variant="contained"
//                 color="primary"
//                 onClick={handleSubmit(onSubmit)}
//                 sx={{
//                   fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.large,
//                   fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold,
//                   p: STYLE_GUIDE.SPACING.s2,
//                   pl: STYLE_GUIDE.SPACING.s4,
//                   pr: STYLE_GUIDE.SPACING.s4,
//                 }}
//               >
//                 Save Data Source
//               </Button>
//             </>
//           )}
//         </DialogActions>
//       </Dialog>

//       {/* Error Snackbar */}
//       <Snackbar
//         open={!!error}
//         autoHideDuration={6000}
//         onClose={() => setError(null)}
//         anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
//       >
//         <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
//           {error}
//         </Alert>
//       </Snackbar>
//     </>
//   );
// };

// export default CreateUpdateDataSource;
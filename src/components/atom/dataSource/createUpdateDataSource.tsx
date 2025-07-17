
import React, { useEffect, useState, useRef } from 'react';
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

interface DataSourceRequestPayload {
  name: string;
  code: string;
  description?: string;
  versionType: string;
  entityId: string;
  entityAttributes?: string[][];
  entityAttributeIds?: string[][];
  _id?: string;
}

interface DataSourceResponse {
  success: boolean;
}

interface CreateUpdateDataSourceProps {
  setReload: React.Dispatch<React.SetStateAction<boolean>>;
  CustomButton: React.ReactElement;
  title: string;
  data?: DataSourceRequestPayload;
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
  const lastFetchedEntityId = useRef<string | null>(null);

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
      entityId: data?.entityId ?? '',
      entityAttributes: data?.entityAttributes?.length ? data.entityAttributes : [['']],
      entityAttributeIds: data?.entityAttributeIds?.length ? data.entityAttributeIds : [['']],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'entityAttributes',
  });

  const entityId = watch('entityId');
  const entityAttributesField = watch('entityAttributes');

  // Debugging log to verify form state
  console.log("Form State:", watch());

  useEffect(() => {
    if (entityId && /^[a-f0-9]{24}$/.test(entityId) && entityId !== lastFetchedEntityId.current) {
      console.log('Fetching entityId:', entityId);
      axiosInstance
        .get(`/entities/${entityId}`)
        .then((res) => {
          const namesArr = res.data?.data?.attributes?.map((f: any) => f.name) || [];
          const typesArr = res.data?.data?.attributes?.map((f: any) => f._id) || [];
          setEntityAttributes(namesArr);
          setEntityAttributeIds(typesArr);
          lastFetchedEntityId.current = entityId;
        })
        .catch((error) => {
          console.error(`Error fetching attributes for entityId ${entityId}:`, error.message);
          setEntityAttributes([]);
          setEntityAttributeIds([]);
          if (entityAttributesField) {
            entityAttributesField.forEach((_, index) => {
              setValue(`entityAttributes.${index}`, ['']);
            });
          }
          if (error.response?.status === 404) {
            console.warn(`Invalid entityId: ${entityId}. Resetting to empty.`);
            setValue('entityId', '');
          }
          lastFetchedEntityId.current = null;
        });
    } else if (!entityId && lastFetchedEntityId.current) {
      setEntityAttributes([]);
      setEntityAttributeIds([]);
      if (entityAttributesField) {
        entityAttributesField.forEach((_, index) => {
          setValue(`entityAttributes.${index}`, ['']);
        });
      }
      lastFetchedEntityId.current = null;
    }
  }, [entityId, setValue, entityAttributesField]);

  useEffect(() => {
    // Ensure at least one entityAttributes field is present when modal opens
    if (open && fields.length === 0) {
      append(['']);
    }
  }, [open, fields, append]);

  const codeAvailability = useGet<{ success: boolean; available: boolean; message: string }>(
    [`codeAvailability`, code],
    GET?.Data_Source_Code + `/${code}`,
    !!code && /^[a-zA-Z0-9_]+$/.test(code)
  );

  const nameAvailability = useGet<{ success: boolean; available: boolean; message: string }>(
    [`nameAvailability`, name],
    GET?.Data_Source_Name + `/${name}`,
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
    console.log("formData before processing:", formData);
    const updatedEntityAttributeIds = formData.entityAttributes?.map((attributes) => {
      return attributes
        .filter((attribute) => attribute !== '') 
        .map((attribute) => {
          const typeIndex = entityAttributes.indexOf(attribute);
          return typeIndex !== -1 ? entityAttributeIds[typeIndex] || '' : '';
        })
        .filter((id) => id !== ''); 
    }) || [];

    const updatedFormData = {
      ...formData,
      entityAttributeIds: updatedEntityAttributeIds,
      uniqueAttributeRules: updatedEntityAttributeIds, // Use IDs for uniqueAttributeRules
    };

    console.log("updatedFormData:", updatedFormData);

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
    reset();
  };

  const handleAddMoreEntity = () => {
    append(['']);
  };

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
              <TextField
                label="Data Source Name*"
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
                defaultValue={data?.name ? data.name : ''}
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
                  defaultValue={data?.entityId || ''}
                  rules={{ required: 'Entity is required' }}
                  error={!!errors.entityId}
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
                        options={entityAttributes}
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
                  options={data?.entityId ? [data.entityId] : ['']}
                  defaultValue={data?.entityId || ''}
                  rules={{ required: '' }}
                  error={false}
                  errorMessage=""
                  disabled={true}
                />
              )}

              <TextField
                label="Data Source Code(Unique Code)*"
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
              />

              <CommonSelect
                control={control}
                name="versionType"
                label="Version Type"
                options={['monthly', 'number']}
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
    </>
  );
};

export default CreateUpdateDataSource;

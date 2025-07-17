
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
  entities?: {
    entityId: string;
    entityAttribute?: string;
    entityAttributeId?: string;
  }[];
  entityId?: { name: string }; // For update mode
  _id?: string;
}

interface DataSourceResponse {
  success: boolean;
}
import { useComponentTypography } from '../../../hooks/useComponentTypography';

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
  const { getDialogTitleSx } = useComponentTypography();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [entityAttributes, setEntityAttributes] = useState<{ [key: number]: string[] }>({});
  const [entityAttributeIds, setEntityAttributeIds] = useState<{ [key: number]: string[] }>({});

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
      entities: data?.entities ?? [{ entityId: '', entityAttribute: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'entities',
  });

  const entities = watch('entities');
  const prevEntityIdsRef = useRef<(string | undefined)[]>([]);

  useEffect(() => {
    console.log('data prop:', data); // Debug data prop
    if (!entities?.length) return;

    entities.forEach((entity, index) => {
      const entityId = entity?.entityId ?? '';
      const prevEntityId = prevEntityIdsRef.current[index];

      // Validate entityId before making API call
      if (entityId && entityId !== prevEntityId && /^[a-f0-9]{24}$/.test(entityId)) {
        console.log('Fetching entityId:', entityId, 'at index:', index);
        axiosInstance
          .get(`/entities/${entityId}`)
          .then((res) => {
            const namesArr = res.data?.data?.attributes?.map((f: any) => f.name) || [];
            const typesArr = res.data?.data?.attributes?.map((f: any) => f._id) || [];
            setEntityAttributes((prev) => ({
              ...prev,
              [index]: namesArr,
            }));
            setEntityAttributeIds((prev) => ({
              ...prev,
              [index]: typesArr,
            }));
          })
          .catch((error) => {
            console.error(`Error fetching attributes for entityId ${entityId} at index ${index}:`, error.message);
            setEntityAttributes((prev) => ({ ...prev, [index]: [] }));
            setEntityAttributeIds((prev) => ({ ...prev, [index]: [] }));
            setValue(`entities.${index}.entityAttribute`, '');
            if (error.response?.status === 404) {
              console.warn(`Invalid entityId: ${entityId}. Resetting to empty.`);
              setValue(`entities.${index}.entityId`, '');
            }
          });
      } else if (!entityId && prevEntityId) {
        setEntityAttributes((prev) => ({ ...prev, [index]: [] }));
        setEntityAttributeIds((prev) => ({ ...prev, [index]: [] }));
        setValue(`entities.${index}.entityAttribute`, '');
      } else if (entityId && !/^[a-f0-9]{24}$/.test(entityId)) {
        console.warn(`Invalid entityId format: ${entityId} at index ${index}. Resetting to empty.`);
        setValue(`entities.${index}.entityId`, '');
        setEntityAttributes((prev) => ({ ...prev, [index]: [] }));
        setEntityAttributeIds((prev) => ({ ...prev, [index]: [] }));
        setValue(`entities.${index}.entityAttribute`, '');
      }
    });

    prevEntityIdsRef.current = entities.map((entity) => entity?.entityId ?? '');
  }, [entities.map((entity) => entity?.entityId ?? ''), setValue]);

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

  const updatedEntities = formData.entities?.map((entity, index) => {
    const updatedEntity = { ...entity };
    if (entity.entityId && entity.entityAttribute) {
      const selectedName = entity.entityAttribute;
      const typeIndex = entityAttributes[index]?.indexOf(selectedName);
      updatedEntity.entityAttributeId =
        typeIndex !== -1 ? entityAttributeIds[index]?.[typeIndex] || '' : '';
    } else {
      updatedEntity.entityAttributeId = '';
    }
    return updatedEntity;
  });

  const uniqueAttributeRules = formData.entities?.map(
    (entity) => entity.entityAttribute
  ) || [];

  const updatedFormData = {
    ...formData,
    entities: updatedEntities,
    uniqueAttributeRules, 
  };
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
    setEntityAttributes({});
    setEntityAttributeIds({});
    reset();
  };

  const handleAddMoreEntity = () => {
    const lastEntityId = entities.length > 0 ? entities[entities.length - 1].entityId : '';
    if (lastEntityId && /^[a-f0-9]{24}$/.test(lastEntityId)) {
      append({ entityId: lastEntityId, entityAttribute: '' });
    } else {
      append({ entityId: '', entityAttribute: '' });
    }
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
        <DialogTitle sx={{
          ...getDialogTitleSx(),
          color: theme.palette.dialog?.titleColor || STYLE_GUIDE.COLORS.textDarkGray,
        }}>
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

              {!data?._id && (
                <>
                  {fields.map((field, index) => (
                    <Box key={field.id} sx={{ mb: 3 }}>
                      <Typography variant="h6" mb={1}>
                        Entity {index + 1}
                      </Typography>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ flex: 1 }}>
                          <CommonDropdownSearch
                            control={control}
                            name={`entities.${index}.entityId`}
                            label="Select Entity*"
                            apiUrl={`${GET.Entity_List}`}
                            labelName="name"
                            labelValue="_id"
                            defaultValue={entities[index].entityId || ''}
                            rules={{ required: 'Entity is required' }}
                            error={!!errors.entities?.[index]?.entityId}
                            errorMessage={errors.entities?.[index]?.entityId?.message as string}
                            apiName="entityList"
                            defaultDataUrl=""
                            disabled={index === fields.length - 1 && entities[index].entityId}
                          />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <CommonSelect
                            control={control}
                            name={`entities.${index}.entityAttribute`}
                            label="Select Entity Attribute*"
                            options={entities[index].entityId ? entityAttributes[index] || [] : []}
                            defaultValue={[]}
                            multiple={true}
                            rules={{ required: entities[index].entityId ? 'Entity Attribute is required' : false }}
                            error={!!errors.entities?.[index]?.entityAttribute}
                            errorMessage={errors.entities?.[index]?.entityAttribute?.message as string}
                          />
                        </Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {fields.length > 1 && entities[index].entityId && (
                            <IconButton color="error" onClick={() => remove(index)}>
                              <RemoveCircleOutlineIcon />
                            </IconButton>
                          )}
                          {index === fields.length - 1 && (
                            <Button
                              variant="contained"
                              startIcon={<AddCircleOutlineIcon />}
                              onClick={handleAddMoreEntity}
                              sx={{ whiteSpace: 'nowrap' }}
                            >
                              Add More Entity
                            </Button>
                          )}
                        </Stack>
                      </Stack>
                    </Box>
                  ))}
                </>
              )}

              {!!data?._id && (
                <CommonSelect
                  control={control}
                  name="entityType"
                  label="Select Entity*"
                  options={data?.entityId?.name ? [data.entityId.name] : ['']}
                  defaultValue={data?.entityId?.name || ''}
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

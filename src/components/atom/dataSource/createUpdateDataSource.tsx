import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
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
} from '@mui/material';

import { GET, POST, PUT } from '../../../services/apiRoutes';
import ProgressBar from '../../molecule/progressBar';
import usePost from '../../../hooks/usePost';
import { DataSourceRequestPayload, DataSourceResponse } from './types';
import CommonSelect from '../../common/dropdown/commonSelect';
import CommonDropdownSearch from '../../common/dropdown/searchableDropdown';
import useGet from '../../../hooks/useGet';
import usePut from '../../../hooks/usePut';
import { STYLE_GUIDE } from '../../../styles';
import { useUnifiedTheme } from '../../../hooks/useUnifiedTheme';

interface CreateUpdateDataSourceProps {
  setReload: React.Dispatch<React.SetStateAction<boolean>>;
  CustomButton: React.ReactElement;
  title: string;
  data?: DataSourceRequestPayload;
}

const CreateUpdateDataSource: React.FC<CreateUpdateDataSourceProps> = ({ setReload, CustomButton, title, data }) => {
  const theme = useUnifiedTheme();
  const [open, setOpen] = useState(false);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  

  const {
    control,
    handleSubmit,
    register,
    reset,
    setValue,
    formState: { errors },
  } = useForm<DataSourceRequestPayload>({
    defaultValues: {
      name: data?.name ?? '',
      code: data?.code ?? '',
      description: data?.description ?? '',
      versionType: data?.versionType ?? '',
    },
  });

  useEffect(() => {
    reset({
      versionType: data?.versionType ?? '',
      name: data?.name ?? '',
      code: data?.code ?? '',
      description: data?.description ?? '',
      entityId: '',
    });
  }, [data, reset]);

  const codeAvailability = useGet<{ success: boolean; available: boolean; message: string }>(
    [`codeAvailability`, code],
    GET?.Data_Source_Code + `/${code}`,
    !!code
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
    if (data && data._id) {
      updateDataSource.mutate({ url: `${PUT.UPDATE_DATA_SOURCE}/${data._id}`, payload: formData });
    } else {
      createDataSource.mutate({ url: POST.CREATE_DATA_SOURCE, payload: formData });
    }
  };

  const handleCancel = () => {
    setOpen(false);
    setCode('');
    setName('');
    reset(); // Reset form on cancel
  };

  return (
    <>
      <Box onClick={() => setOpen(true)}>{CustomButton}</Box>

      <Dialog fullWidth maxWidth="lg" open={open} onClose={handleCancel}>
        <DialogTitle sx={{
          fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold,
          fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.xl,

        }}>
          {title}
        </DialogTitle>
        <DialogContent dividers>
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
                      borderColor: theme.dashboardTheme?.components?.input?.focusBorderColor || theme.dashboardTheme?.components?.input?.focusBorderColorFallback || STYLE_GUIDE.COLORS.inputFocusFallback,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: theme.dashboardTheme?.colors?.text?.secondary || STYLE_GUIDE.COLORS.darkBorderFocus,
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: theme.dashboardTheme?.components?.input?.focusBorderColor || theme.dashboardTheme?.components?.input?.focusBorderColorFallback || STYLE_GUIDE.COLORS.inputFocusFallback,
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
                      <Typography sx={{ color: STYLE_GUIDE.COLORS.bootstrapSuccess }}>Name is available</Typography>
                    ) : (
                      <Typography sx={{ color: STYLE_GUIDE.COLORS.bootstrapDanger }}>Name is not available</Typography>
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
                      borderColor: theme.dashboardTheme?.components?.input?.focusBorderColor || theme.dashboardTheme?.components?.input?.focusBorderColorFallback || STYLE_GUIDE.COLORS.inputFocusFallback,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: theme.dashboardTheme?.colors?.text?.secondary || STYLE_GUIDE.COLORS.darkBorderFocus,
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: theme.dashboardTheme?.components?.input?.focusBorderColor || theme.dashboardTheme?.components?.input?.focusBorderColorFallback || STYLE_GUIDE.COLORS.inputFocusFallback,
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
                <CommonDropdownSearch
                  control={control}
                  name={`entityId`}
                  label="Select Enitity* "
                  apiUrl={`${GET.Entity_List}`}
                  labelName="name"
                  labelValue="_id"
                  defaultValue={''}
                  rules={{ required: 'Entity is required' }}
                  error={!!errors.entityId}
                  errorMessage={errors.entityId?.message as string}
                  apiName="entityList"
                  defaultDataUrl={''}
                />
              )}

              {!!data?._id && (
                <CommonSelect
                  control={control}
                  name={`entityType`}
                  label="Select Enitity*"
                  options={[data.entityId.name]}
                  defaultValue={data.entityId.name}
                  rules={{ required: '' }}
                  error={false}
                  errorMessage={''}
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
                      borderColor: theme.dashboardTheme?.components?.input?.focusBorderColor || theme.dashboardTheme?.components?.input?.focusBorderColorFallback || STYLE_GUIDE.COLORS.inputFocusFallback,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: theme.dashboardTheme?.colors?.text?.secondary || STYLE_GUIDE.COLORS.darkBorderFocus,
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: theme.dashboardTheme?.components?.input?.focusBorderColor || theme.dashboardTheme?.components?.input?.focusBorderColorFallback || STYLE_GUIDE.COLORS.inputFocusFallback,
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
                      'Data source code should not contain special characters, null characters,space or restricted prefixes (e.g., "system." or ".system.")',
                  },
                })}
                onChange={(event) => {
                  // Automatically update the code state by sanitizing input
                  const sanitizedCode = event.target.value.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '');
                  setCode(sanitizedCode); // This will update the code state
                  setValue('code', sanitizedCode);
                }}
                error={!!errors.code}
                value={code || (data?.code ? data.code : (name?.toLowerCase() || '').replace(/[^a-zA-Z0-9_]/g, ''))}
                disabled={data?.code ? true : false}
                helperText={
                  errors.code?.message ||
                  (codeAvailability.isFetched && code.length > 0 ? (
                    codeAvailability.data?.available ? (
                      <Typography sx={{ color: STYLE_GUIDE.COLORS.bootstrapSuccess }}>Code is available</Typography>
                    ) : (
                      <Typography sx={{ color: STYLE_GUIDE.COLORS.bootstrapDanger }}>Code is not available</Typography>
                    )
                  ) : (
                    ''
                  ))
                }
              />

              <CommonSelect
                control={control}
                name={`versionType`}
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
              {' '}
              <Button
                onClick={handleCancel}
                color="error"
                sx={{
                  fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.large,
                  fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold,
                  p: STYLE_GUIDE.SPACING.s2,
                  pl: STYLE_GUIDE.SPACING.s4,
                  pr: STYLE_GUIDE.SPACING.s4
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
                  pr: STYLE_GUIDE.SPACING.s4
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

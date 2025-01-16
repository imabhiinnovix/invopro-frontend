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

interface CreateUpdateDataSourceProps {
  setReload: React.Dispatch<React.SetStateAction<boolean>>;
  CustomButton: React.ReactElement;
  title: string;
  data?: DataSourceRequestPayload;
}
const CreateUpdateDataSource: React.FC<CreateUpdateDataSourceProps> = ({ setReload, CustomButton, title, data }) => {
  const [open, setOpen] = useState(false);

  const [code, setCode] = useState('');
  const {
    control,
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<DataSourceRequestPayload>({
    defaultValues: {
      name: data?.name ?? '',
      description: data?.description ?? '',
      versionType: data?.versionType ?? '',
      // entityId: data?._id ?? '',
    },
  });

  useEffect(() => {
    reset({
      versionType: data?.versionType ?? '',
      name: data?.name ?? '',
      description: data?.description ?? '',
      entityId: '',
    });
  }, [data, reset]);

  const codeAvailability = useGet<{ success: boolean; available: boolean; message: string }>(
    [`codeAvailability`, code],
    GET?.Data_Source_Code + `/${code}`,
    !!code
  );

  const createDataSource = usePost<DataSourceRequestPayload, DataSourceResponse>(
    ['createDataSource'],
    (data) => {
      if (data?.success) {
        setCode('');
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
    reset(); // Reset form on cancel
  };

  console.log(data);
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
                label="Data Source Name*"
                fullWidth
                {...register('name', {
                  required: 'Data source name is required',
                })}
                error={!!errors.name}
                helperText={errors.name?.message}
              />

              <TextField
                label="Data Source Description"
                fullWidth
                multiline
                rows={4}
                {...register('description')}
                error={!!errors.description}
                helperText={errors.description?.message}
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
                fullWidth
                {...register('code', {
                  required: 'Data source code is required',
                  pattern: {
                    value: /^(?!.*(\$|\0|^system\.|\.system\.))[\w\s]+$/,
                    message:
                      'Data source code should not contain special characters, null characters, or restricted prefixes (e.g., "system." or ".system.")',
                  },
                })}
                onChange={(event) => {
                  setCode(event.target.value);
                }}
                error={!!errors.code}
                defaultValue={data?.code ? data.code : ''}
                disabled={data?.code ? true : false}
                helperText={
                  errors.code?.message ||
                  (codeAvailability.isFetched && code.length > 0 ? (
                    codeAvailability.data?.available ? (
                      <Typography color="success">Code is available</Typography>
                    ) : (
                      <Typography color="error">Code is not available</Typography>
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
                sx={{ fontSize: 18, fontWeight: 'bold', p: 1, pl: 2, pr: 2 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={handleSubmit(onSubmit)}
                variant="contained"
                color="primary"
                sx={{ fontSize: 18, fontWeight: 'bold', p: 1, pl: 2, pr: 2 }}
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

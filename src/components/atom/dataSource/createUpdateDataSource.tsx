import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Box, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Stack } from '@mui/material';

import { GET, POST } from '../../../services/apiRoutes';
import ProgressBar from '../../molecule/progressBar';
import usePost from '../../../hooks/usePost';
import { DataSourceRequestPayload, DataSourceResponse } from './types';
import CommonSelect from '../../common/dropdown/commonSelect';
import CommonDropdownSearch from '../../common/dropdown/searchableDropdown';

interface CreateUpdateDataSourceProps {
  setReload: React.Dispatch<React.SetStateAction<boolean>>;
  CustomButton: React.ReactElement;
  title: string;
  data?: DataSourceRequestPayload;
}
const CreateUpdateDataSource: React.FC<CreateUpdateDataSourceProps> = ({ setReload, CustomButton, title, data }) => {
  const [open, setOpen] = useState(false);

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
      entityId: data?._id ?? '',
    },
  });

  useEffect(() => {
    reset({
      name: data?.name ?? '',
      description: data?.description ?? '',
      _id: data?._id ?? '',
      entityId: data?._id ?? '',
    });
  }, [data, reset]);

  const createDataSource = usePost<DataSourceRequestPayload, DataSourceResponse>(
    ['createDataSource'],
    (data) => {
      if (data?.success) {
        setReload(true);
        setOpen(false);
        reset();
      }
    },
    true
  );

  const onSubmit = (formData: DataSourceRequestPayload) => {
    if (data && data._id) {
      createDataSource.mutate({ url: `${POST.UPDATE_DATA_SOURCE}/${data._id}`, payload: formData });
    } else {
      createDataSource.mutate({ url: POST.CREATE_DATA_SOURCE, payload: formData });
    }
  };

  const handleCancel = () => {
    setOpen(false);
    reset(); // Reset form on cancel
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
                errorMessage={errors.entityId?.message}
                apiName="entityList"
                defaultDataUrl={`${GET.Entity_List}`}
              />

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
                error={!!errors.code}
                helperText={errors.code?.message}
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
          {createDataSource.isPending ? (
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

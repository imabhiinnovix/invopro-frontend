import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray, Controller, FieldError, useWatch } from 'react-hook-form';
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
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import FileUploadButton from '../file/fileUploadButton';
import useFilePostData from '../../../hooks/usePostMultipart';
import { GET, POST } from '../../../services/apiRoutes';
import ProgressBar from '../../molecule/progressBar';
import usePost from '../../../hooks/usePost';
import { EntityRequestPayload, EntityResponse } from './types';
import CommonSelect from '../../common/dropdown/commonSelect';
import CommonDropdownSearch from '../../common/dropdown/searchableDropdown';

interface CreateUpdateEntityProps {
  setReloadEntity: React.Dispatch<React.SetStateAction<boolean>>;
  CustomButton: React.ReactElement;
  title: string;
  data?: EntityRequestPayload;
}
const CreateUpdateEntity: React.FC<CreateUpdateEntityProps> = ({ setReloadEntity, CustomButton, title, data }) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    register,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EntityRequestPayload>({
    defaultValues: {
      name: data?.name ?? '',
      description: data?.description ?? '',
      attributes: data?.attributes ?? [
        {
          name: '',
          type: '',
          optionAttributeId: '',
          validation: [],
          transformations: [],
          cleaner: [],
        },
      ],
    },
  });

  useEffect(() => {
    reset({
      name: data?.name ?? '',
      description: data?.description ?? '',
      attributes: data?.attributes ?? [
        {
          name: '',
          type: '',
          optionAttributeId: '',
          validation: [],
          transformations: [],
          cleaner: [],
        },
      ],
    });
  }, [data, reset]);

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'attributes',
  });

  const { mutate, isPending } = useFilePostData<{ files: File; operation: string }, { message: string; data?: any }>(
    ['uploadedFiles'],
    (data) => {
      if (data?.data) {
        const newAttributes = data.data.map((attr: any) => ({
          name: attr.name || '',
          type: attr.type || '',
          optionAttributeId: attr.optionAttributeId || '',
          validation: attr.validation || [],
          transformations: attr.transformations || [],
          cleaner: attr.cleaner || [],
        }));

        replace(newAttributes);
      }
    },
    {
      showToast: true,
    }
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleFileUpload = () => {
    if (!file) {
      return;
    }

    mutate({
      url: `${POST.FILE_UPLOAD}`,
      payload: {
        files: file,
        operation: 'getAttributesFromXlsxOrCsvHeaders',
      },
    });
  };

  const createEntity = usePost<EntityRequestPayload, EntityResponse>(
    ['createEntity'],
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
    const newAttributes = formData.attributes?.map((data) => {
      if (!['option', 'multioption'].includes(data.type)) {
        return {
          ...data, // Corrected spread operator
          optionAttributeId: '', // Adding the optionAttributeId property
        };
      } else {
        return data;
      }
    });

    const newFormData = { ...formData, attributes: newAttributes };

    if (data && data._id) {
      createEntity.mutate({ url: `${POST.UPDATE_ENTITY}/${data._id}`, payload: newFormData });
    } else {
      createEntity.mutate({ url: POST.CREATE_ENTITY, payload: newFormData });
    }
  };

  const handleCancel = () => {
    setFile(null);
    setFileName(null);
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
              {/* Entity Name */}
              <TextField
                label="Entity Name*"
                fullWidth
                {...register('name', {
                  required: 'Entity Name is required',
                  pattern: {
                    value: /^[A-Za-z\s]+$/,
                    message: 'Entity Name must contain only letters',
                  },
                })}
                error={!!errors.name}
                helperText={errors.name?.message}
              />

              {/* Entity Description */}
              <TextField
                label="Entity Description"
                fullWidth
                multiline
                rows={4}
                {...register('description')}
                error={!!errors.description}
                helperText={errors.description?.message}
              />

              {/* File Upload */}
              <FileUploadButton fileName={fileName} onFileChange={handleFileChange} />
              {!isPending ? (
                <Button
                  variant={file ? 'contained' : 'outlined'}
                  onClick={handleFileUpload}
                  disabled={!file}
                  sx={{ mt: 2 }}
                >
                  Upload File
                </Button>
              ) : (
                <ProgressBar />
              )}

              <Divider sx={{ my: 3 }} />

              {/* Attributes Section */}
              {fields.map((attribute, index) => {
                return (
                  <Box
                    key={attribute.id}
                    sx={{
                      mb: 3,
                      pointerEvents: isPending ? 'none' : 'auto', // Disable interactions when isPending is true
                      opacity: isPending ? 0.5 : 1,
                    }}
                  >
                    <Typography variant="h6" mb={2}>
                      Attribute {index + 1}
                    </Typography>
                    <Stack spacing={2}>
                      {/* Attribute Name */}
                      <TextField
                        label="Attribute Name"
                        fullWidth
                        {...register(`attributes.${index}.name`, {
                          required: 'Attribute Name is required',
                        })}
                        error={!!errors.attributes?.[index]?.name}
                        helperText={errors.attributes?.[index]?.name?.message}
                      />

                      <CommonSelect
                        control={control}
                        name={`attributes.${index}.type`}
                        label="Attribute Type"
                        options={[
                          'number',
                          'text',
                          'date',
                          'boolean',
                          'richtext',
                          'url',
                          'option',
                          'multioption',
                          'user',
                        ]}
                        defaultValue={attribute.type || ''}
                        rules={{ required: 'Attribute Type is required' }}
                        error={!!errors.attributes?.[index]?.type}
                        errorMessage={(errors.attributes?.[index]?.type as FieldError)?.message}
                      />

                      {watch('attributes') &&
                        ['option', 'multioption'].includes(watch('attributes')?.[index]?.type!) && (
                          <CommonDropdownSearch
                            control={control}
                            name={`attributes.${index}.optionAttributeId`}
                            label="Attribute Options"
                            apiUrl={`${GET.Attribute_Option_List}`}
                            labelName="attributeName"
                            labelValue="_id"
                            defaultValue={attribute.optionAttributeId || ''}
                            rules={{ required: 'Attribute Option is required' }}
                            error={!!errors.attributes?.[index]?.optionAttributeId}
                            errorMessage={(errors.attributes?.[index]?.optionAttributeId as FieldError)?.message}
                            apiName="attributeOption"
                          />
                        )}
                    </Stack>

                    {/* Remove Attribute Button */}
                    <IconButton
                      color="error"
                      onClick={() => remove(index)}
                      sx={{ mt: 2, display: 'flex', alignSelf: 'flex-start' }}
                    >
                      <RemoveCircleOutlineIcon />
                    </IconButton>
                  </Box>
                );
              })}

              {/* Add Attribute Button */}
              <Button
                variant="contained"
                startIcon={<AddCircleOutlineIcon />}
                onClick={() =>
                  append({
                    name: '',
                    type: '',
                    optionAttributeId: '',
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
          {createEntity.isPending ? (
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

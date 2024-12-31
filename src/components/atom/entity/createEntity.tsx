import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import {
  Box,
  Button,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  IconButton,
  Divider,
  Stack,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import FileUploadButton from '../file/fileUploadButton';
import useFilePostData from '../../../hooks/usePostMultipart';

import { POST } from '../../../services/apiRoutes';

type Attribute = {
  name: string;
  attributeType: string;
  options?: string[];
  validation?: string[];
  transformations?: string[];
  cleaner?: string[];
};

type FormValues = {
  entityName: string;
  entityDescription: string;
  attributes: Attribute[];
};

const CreateEntity: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const { mutate } = useFilePostData<{ files: File; organizationId: string; operation: string }, { message: string }>(
    ['uploadedFiles'],
    () => console.log('File uploaded successfully'),
    true,
  );

  const handleFileUpload = () => {
    if (!file) {
      console.error('No file selected for upload');
      return;
    }

    mutate({
      url: `${POST.FILE_UPLOAD}`,
      payload: {
        files: file,
        organizationId: '66de96d3548d06560e2931cb',
        operation: 'getAttributesFromXlsxOrCsvHeaders',
      },
    });
  };

  const {
    control,
    handleSubmit,
    register,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      entityName: '',
      entityDescription: '',
      attributes: [{ name: '', attributeType: '', options: [], validation: [], transformations: [], cleaner: [] }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'attributes',
  });

  const onSubmit = (data: FormValues) => {
    console.log('Form Data:', data);
    setOpen(false);
    reset(); // Reset form after submission
  };

  const handleCancel = () => {
    setOpen(false);
    reset(); // Reset form on cancel
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      p={3}
      gap={4}
      width="100%"
      bgcolor="#f9f9f9"
      sx={{
        '@media (max-width: 600px)': {
          p: 2,
          gap: 2,
        },
      }}
    >
      <Button
        variant="contained"
        size="large"
        sx={{
          fontWeight: 'bold',
          fontSize: '1.2rem',
          padding: '15px 30px',
          bgcolor: '#007bff',
          color: '#fff',
          '&:hover': { bgcolor: '#0056b3' },
          '@media (max-width: 600px)': {
            fontSize: '1rem',
            padding: '10px 20px',
          },
        }}
        onClick={() => setOpen(true)}
      >
        Create New Entity
      </Button>

      <Dialog fullWidth maxWidth="lg" open={open} onClose={handleCancel}>
        <DialogTitle fontWeight="bold" fontSize={20}>
          Create New Entity
        </DialogTitle>
        <DialogContent dividers>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={3}>
              {/* Entity Name */}
              <TextField
                label="Entity Name*"
                fullWidth
                {...register('entityName', {
                  required: 'Entity Name is required',
                  pattern: {
                    value: /^[A-Za-z\s]+$/,
                    message: 'Entity Name must contain only letters',
                  },
                })}
                error={!!errors.entityName}
                helperText={errors.entityName?.message}
              />

              {/* Entity Description */}
              <TextField
                label="Entity Description"
                fullWidth
                multiline
                rows={4}
                {...register('entityDescription')}
                error={!!errors.entityDescription}
                helperText={errors.entityDescription?.message}
              />

              {/* File Upload */}
              <FileUploadButton fileName={fileName} onFileChange={handleFileChange} />
              <Button
                variant={file ? 'contained' : 'outlined'}
                onClick={handleFileUpload}
                disabled={!file}
                sx={{ mt: 2 }}
              >
                Upload File
              </Button>

              <Divider sx={{ my: 3 }} />

              {/* Attributes Section */}
              {fields.map((attribute, index) => (
                <Box key={attribute.id} sx={{ mb: 3 }}>
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
                        pattern: {
                          value: /^[A-Za-z\s]+$/,
                          message: 'Attribute Name must contain only letters',
                        },
                      })}
                      error={!!errors.attributes?.[index]?.name}
                      helperText={errors.attributes?.[index]?.name?.message}
                    />

                    {/* Attribute Type */}
                    <TextField
                      select
                      label="Attribute Type"
                      fullWidth
                      defaultValue={attribute.attributeType || ''}
                      {...register(`attributes.${index}.attributeType`, {
                        required: 'Attribute Type is required',
                      })}
                      error={!!errors.attributes?.[index]?.attributeType}
                      helperText={errors.attributes?.[index]?.attributeType?.message}
                    >
                      {['number', 'text', 'date', 'boolean', 'richtext', 'url', 'option', 'multioption', 'user'].map(
                        (attributeType) => (
                          <MenuItem key={attributeType} value={attributeType}>
                            {attributeType}
                          </MenuItem>
                        ),
                      )}
                    </TextField>
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
              ))}

              {/* Add Attribute Button */}
              <Button
                variant="contained"
                startIcon={<AddCircleOutlineIcon />}
                onClick={() =>
                  append({ name: '', attributeType: '', options: [], validation: [], transformations: [], cleaner: [] })
                }
              >
                Add Attribute
              </Button>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="error">
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit(onSubmit)} variant="contained" color="primary">
            Save Entity
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CreateEntity;

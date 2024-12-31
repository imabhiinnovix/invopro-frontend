import React, { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
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
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import FileUploadButton from '../file/fileUploadButton';
import useFilePostData from '../../../hooks/usePostMultipart';
import { POST } from '../../../services/apiRoutes';
import ProgressBar from '../../molecule/progressBar';

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

  const {
    control,
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      entityName: '',
      entityDescription: '',
      attributes: [{ name: '', attributeType: '', options: [], validation: [], transformations: [], cleaner: [] }],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'attributes',
  });
  console.log('fields', fields);

  const { mutate, isPending } = useFilePostData<{ files: File; operation: string }, { message: string; data?: any }>(
    ['uploadedFiles'],
    (data) => {
      console.log('Upload successful, response:', data);
      if (data?.data) {
        const newAttributes = data.data.map((attr: any) => ({
          name: attr.name || '',
          attributeType: attr.attributeType || '',
          options: attr.options || [],
          validation: attr.validation || [],
          transformations: attr.transformations || [],
          cleaner: attr.cleaner || [],
        }));

        replace(newAttributes);
      }
    },
    {
      showToast: true,
      customToastMessage: 'Attribute Retrieved Successfully',
    },
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
      console.error('No file selected for upload');
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

  const onSubmit = (data: FormValues) => {
    console.log('Form Data:', data);
    setOpen(false);
    reset(); // Reset form after submission
  };

  const handleCancel = () => {
    setFile(null);
    setFileName(null);
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
              {fields.map((attribute, index) => (
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

                    <FormControl fullWidth error={!!errors.attributes?.[index]?.attributeType}>
                      <InputLabel id={`attributeType-${index}`}>Attribute Type</InputLabel>
                      <Controller
                        name={`attributes.${index}.attributeType`}
                        control={control}
                        defaultValue={attribute.attributeType || ''}
                        rules={{ required: 'Attribute Type is required' }}
                        render={({ field }) => (
                          <Select {...field} labelId={`attributeType-${index}`} label="Attribute Type">
                            {[
                              'number',
                              'text',
                              'date',
                              'boolean',
                              'richtext',
                              'url',
                              'option',
                              'multioption',
                              'user',
                            ].map((attributeType) => (
                              <MenuItem key={attributeType} value={attributeType}>
                                {attributeType}
                              </MenuItem>
                            ))}
                          </Select>
                        )}
                      />
                      <FormHelperText>
                        {attribute.attributeType.length === 0 && errors.attributes?.[index]?.attributeType?.message}
                      </FormHelperText>
                    </FormControl>
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
          <Button onClick={handleCancel} color="error" sx={{ fontSize: 18, fontWeight: 'bold', p: 1, pl: 2, pr: 2 }}>
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
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CreateEntity;

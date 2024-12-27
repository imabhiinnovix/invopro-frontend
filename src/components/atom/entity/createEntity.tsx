import * as React from 'react';
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
  Checkbox,
  FormControlLabel,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

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
  const [open, setOpen] = React.useState(false);

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
        <DialogTitle>Create New Entity</DialogTitle>
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
                    value: /^[A-Za-z\s]+$/, // Regular expression for letters and spaces only
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
                          value: /^[A-Za-z\s]+$/, // Regular expression for letters and spaces only
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

                    {/* Options (Visible only for "option" or "multioption") */}
                    {(attribute.attributeType === 'option' || attribute.attributeType === 'multioption') && (
                      <TextField
                        label="Attribute Options (Comma Separated)"
                        fullWidth
                        {...register(`attributes.${index}.options`)}
                      />
                    )}

                    {/* Validation */}
                    <FormControl fullWidth>
                      <InputLabel>Validation</InputLabel>
                      <Controller
                        name={`attributes.${index}.validation`}
                        control={control}
                        render={({ field }) => (
                          <Select
                            multiple
                            label="Validation"
                            value={field.value || []}
                            onChange={field.onChange}
                            renderValue={(selected) => selected.join(', ')}
                            error={!!errors.attributes?.[index]?.validation}
                          >
                            {['required', 'minLength:5', 'maxLength:10'].map((validation) => (
                              <MenuItem key={validation} value={validation}>
                                <Checkbox checked={field.value?.includes(validation)} />
                                {validation}
                              </MenuItem>
                            ))}
                          </Select>
                        )}
                      />
                    </FormControl>

                    {/* Transformations */}
                    <FormControl fullWidth>
                      <InputLabel>Transformations</InputLabel>
                      <Controller
                        name={`attributes.${index}.transformations`}
                        control={control}
                        render={({ field }) => (
                          <Select
                            multiple
                            label="Transformations"
                            value={field.value || []}
                            onChange={field.onChange}
                            renderValue={(selected) => selected.join(', ')}
                            error={!!errors.attributes?.[index]?.transformations}
                          >
                            {['trimSpace', 'makeAllCapital', 'lowerCase'].map((transformation) => (
                              <MenuItem key={transformation} value={transformation}>
                                <Checkbox checked={field.value?.includes(transformation)} />
                                {transformation}
                              </MenuItem>
                            ))}
                          </Select>
                        )}
                      />
                    </FormControl>

                    {/* Cleaner */}
                    <FormControl fullWidth>
                      <InputLabel>Cleaner</InputLabel>
                      <Controller
                        name={`attributes.${index}.cleaner`}
                        control={control}
                        render={({ field }) => (
                          <Select
                            multiple
                            label="Cleaner"
                            value={field.value || []}
                            onChange={field.onChange}
                            renderValue={(selected) => selected.join(', ')}
                            error={!!errors.attributes?.[index]?.cleaner}
                          >
                            {['removeSpecialChars', 'removeNumbers'].map((cleaner) => (
                              <MenuItem key={cleaner} value={cleaner}>
                                <Checkbox checked={field.value?.includes(cleaner)} />
                                {cleaner}
                              </MenuItem>
                            ))}
                          </Select>
                        )}
                      />
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

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Chip,
  Box,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { AttributeOptionRequestPayload } from './types';
import AddIcon from '@mui/icons-material/Add';
interface Payload {
  attributeName: string;
  attributeValue: string[];
}

interface CreateUpdateAttributeOptionProps {
  setAttributeOptionReload: React.Dispatch<React.SetStateAction<boolean>>;
  CustomButton: React.ReactElement;
  title: string;
  data?: AttributeOptionRequestPayload;
}

const CreateUpdateAttributeOption: React.FC<CreateUpdateAttributeOptionProps> = ({
  setAttributeOptionReload,
  CustomButton,
  title,
  data,
}) => {
  const [open, setOpen] = useState(false);
  const { control, handleSubmit, setValue, watch, reset } = useForm<Payload>({
    defaultValues: { attributeName: '', attributeValue: [] },
  });

  const attributeValue = watch('attributeValue');

  const handleAddValue = (value: string) => {
    if (value && !attributeValue.includes(value)) {
      setValue('attributeValue', [...attributeValue, value]);
    }
  };

  const handleDeleteValue = (value: string) => {
    setValue(
      'attributeValue',
      attributeValue.filter((v) => v !== value),
    );
  };

  const handleFormClose = () => {
    reset();
    setOpen(false);
  };

  const onSubmitHandler = (data: Payload) => {
    console.log('Submitted data:', data);
    handleFormClose();
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>{CustomButton}</Button>

      <Dialog open={open} onClose={handleFormClose} fullWidth maxWidth="sm">
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <Controller
              name="attributeName"
              control={control}
              rules={{ required: 'Attribute name is required' }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Attribute Name"
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Box>

          <Box mt={2}>
            <Controller
              name="attributeValue"
              control={control}
              rules={{ required: 'Attribute value is required' }}
              render={() => (
                <Box>
                  <Box display="flex" alignItems="center">
                    <TextField
                      label="Add Attribute Value"
                      fullWidth
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const value = (e.target as HTMLInputElement).value.trim();
                          if (value) {
                            handleAddValue(value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                      slotProps={{
                        input: {
                          name: 'attributeValue',
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => {
                                  const input = document.querySelector(
                                    'input[name="attributeValue"]',
                                  ) as HTMLInputElement;
                                  const value = input?.value.trim();
                                  if (value) {
                                    handleAddValue(value);
                                    input.value = '';
                                  }
                                }}
                                color="primary"
                                aria-label="add value"
                              >
                                <AddIcon />
                              </IconButton>
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  </Box>
                  <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
                    {attributeValue.map((value, index) => (
                      <Chip key={index} label={value} onDelete={() => handleDeleteValue(value)} />
                    ))}
                  </Box>
                </Box>
              )}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleFormClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmitHandler)} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CreateUpdateAttributeOption;

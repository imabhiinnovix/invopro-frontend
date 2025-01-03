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
import { AttributeOptionRequestPayload, AttributeOptionResponse } from './types';
import AddIcon from '@mui/icons-material/Add';
import usePost from '../../../hooks/usePost';
import { POST } from '../../../services/apiRoutes';
import ProgressBar from '../../molecule/progressBar';

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
  const { control, handleSubmit, setValue, watch, reset, clearErrors } = useForm<AttributeOptionRequestPayload>({
    defaultValues: { attributeName: data?.attributeName ?? '', attributeValue: data?.attributeValue ?? [] },
  });

  const attributeValue = watch('attributeValue');

  const handleFormClose = () => {
    reset();
    setOpen(false);
  };

  const handleAddValue = (value: string) => {
    if (value && !attributeValue.includes(value)) {
      setValue('attributeValue', [...attributeValue, value]);
      clearErrors('attributeValue');
    }
  };

  const handleDeleteValue = (value: string) => {
    setValue(
      'attributeValue',
      attributeValue.filter((v) => v !== value)
    );
  };

  const createUpdateAttributeOptions = usePost<AttributeOptionRequestPayload, AttributeOptionResponse>(
    ['createUpdateAttributeOptions'],
    (data) => {
      if (data?.success) {
        setAttributeOptionReload(true);
        handleFormClose();
      }
    },
    true
  );

  const onSubmitHandler = (formData: AttributeOptionRequestPayload) => {
    if (data && data._id) {
      createUpdateAttributeOptions.mutate({ url: `${POST.UPDATE_ATTRIBUTE_OPTION}/${data._id}`, payload: formData });
    } else {
      createUpdateAttributeOptions.mutate({ url: POST.CREATE_ATTRIBUTE_OPTION, payload: formData });
    }
  };

  return (
    <>
      <Box onClick={() => setOpen(true)}>{CustomButton}</Box>

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
              render={({ formState }) => (
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
                      error={!!formState.errors.attributeValue}
                      helperText={formState?.errors?.attributeValue?.message}
                      slotProps={{
                        input: {
                          name: 'attributeValue',
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => {
                                  const input = document.querySelector(
                                    'input[name="attributeValue"]'
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
                    {attributeValue &&
                      attributeValue.map((value, index) => (
                        <Chip key={index} label={value} onDelete={() => handleDeleteValue(value)} />
                      ))}
                  </Box>
                </Box>
              )}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          {createUpdateAttributeOptions.isPending ? (
            <ProgressBar />
          ) : (
            <>
              <Button onClick={handleFormClose} color="secondary">
                Cancel
              </Button>
              <Button onClick={handleSubmit(onSubmitHandler)} color="primary">
                Submit
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CreateUpdateAttributeOption;

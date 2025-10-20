import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import {
  AttributeOptionRequestPayload,
  AttributeOptionResponse,
} from "./types";
import AddIcon from "@mui/icons-material/Add";
import usePost from "../../../hooks/usePost";
import { POST, PUT } from "../../../services/apiRoutes";
import ProgressBar from "../../molecule/progressBar";
import usePut from "../../../hooks/usePut";
import { STYLE_GUIDE } from "../../../styles";
import { useUnifiedTheme } from "../../../hooks/useUnifiedTheme";
import { useComponentTypography } from "../../../hooks/useComponentTypography";
import DialogContainer from "../../molecule/dialog";
import PrimaryButton from "../../common/PrimaryButton";

interface CreateUpdateAttributeOptionProps {
  setAttributeOptionReload: React.Dispatch<React.SetStateAction<boolean>>;
  CustomButton: React.ReactElement;
  title: string;
  data?: AttributeOptionRequestPayload;
}

const CreateUpdateAttributeOption: React.FC<
  CreateUpdateAttributeOptionProps
> = ({ setAttributeOptionReload, CustomButton, title, data }) => {
  const [open, setOpen] = useState(false);
  const { control, handleSubmit, setValue, watch, reset, clearErrors } =
    useForm<AttributeOptionRequestPayload>({
      defaultValues: {
        attributeName: data?.attributeName ?? "",
        attributeValue: data?.attributeValue ?? [],
      },
    });

  const attributeValue = watch("attributeValue");
  const theme = useUnifiedTheme();
  const { getDialogTitleSx } = useComponentTypography();

  useEffect(() => {
    reset({
      attributeName: data?.attributeName ?? "",
      attributeValue: data?.attributeValue ?? [],
    });
  }, [data, reset]);

  const handleFormClose = () => {
    reset();
    setOpen(false);
  };

  const handleAddValue = (value: string) => {
    if (value && !attributeValue.includes(value)) {
      setValue("attributeValue", [...attributeValue, value]);
      clearErrors("attributeValue");
    }
  };

  const handleDeleteValue = (value: string) => {
    setValue(
      "attributeValue",
      attributeValue.filter((v) => v !== value)
    );
  };

  const createAttributeOptions = usePost<
    AttributeOptionRequestPayload,
    AttributeOptionResponse
  >(
    ["createUpdateAttributeOptions"],
    (data) => {
      if (data?.success) {
        setAttributeOptionReload(true);
        handleFormClose();
      }
    },
    true
  );
  const updateAttributeOptions = usePut<
    AttributeOptionRequestPayload,
    AttributeOptionResponse
  >(
    ["updateAttributeOptions"],
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
      updateAttributeOptions.mutate({
        url: `${PUT.UPDATE_ATTRIBUTE_OPTION}/${data._id}`,
        payload: formData,
      });
    } else {
      createAttributeOptions.mutate({
        url: POST.CREATE_ATTRIBUTE_OPTION,
        payload: formData,
      });
    }
  };

  return (
    <>
      <Box onClick={() => setOpen(true)}>{CustomButton}</Box>
      <DialogContainer
        open={open}
        onClose={handleFormClose}
        title={title}
        maxWidth="sm"
        actions={
          <>
            {createAttributeOptions.isPending ||
            updateAttributeOptions.isPending ? (
              <ProgressBar />
            ) : (
              <>
                <PrimaryButton variant="outlined" onClick={handleFormClose}>
                  Cancel
                </PrimaryButton>
                <PrimaryButton onClick={handleSubmit(onSubmitHandler)}>
                  Submit
                </PrimaryButton>
              </>
            )}
          </>
        }
      >
        <Controller
          name="attributeName"
          control={control}
          rules={{ required: "Attribute name is required" }}
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

        <Controller
          name="attributeValue"
          control={control}
          rules={{ required: "Attribute value is required" }}
          render={({ formState }) => (
            <Box>
              <Box display="flex" alignItems="center">
                <TextField
                  label="Add Attribute Value"
                  fullWidth
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const value = (e.target as HTMLInputElement).value.trim();
                      if (value) {
                        handleAddValue(value);
                        (e.target as HTMLInputElement).value = "";
                      }
                    }
                  }}
                  error={!!formState.errors.attributeValue}
                  helperText={formState?.errors?.attributeValue?.message}
                  slotProps={{
                    input: {
                      name: "attributeValue",
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
                                input.value = "";
                              }
                            }}
                            color="primary"
                            aria-label="add value"
                          >
                            <AddIcon sx={{ color: theme.getIconColor() }} />
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
                    <Chip
                      key={index}
                      label={value}
                      onDelete={() => handleDeleteValue(value)}
                    />
                  ))}
              </Box>
            </Box>
          )}
        />
      </DialogContainer>

      {/* <Dialog open={open} onClose={handleFormClose} fullWidth maxWidth="sm">
        <DialogTitle
          sx={{
            ...getDialogTitleSx(),
            color: theme.palette.dialog?.titleColor || STYLE_GUIDE.COLORS.textDarkGray,
          }}
        >
          {title}
        </DialogTitle>
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
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: STYLE_GUIDE.SPACING.s2, alignItems: 'flex-start', paddingRight: STYLE_GUIDE.SPACING.s2, fontSize: '14px', backgroundColor: theme.dashboardTheme?.colors?.background?.paper || '#ffffff', '& fieldset': { borderColor: theme.dashboardTheme?.colors?.inputBorder || STYLE_GUIDE.COLORS.darkBackground, }, '&:hover fieldset': { borderColor: theme.dashboardTheme?.colors?.borderHover || STYLE_GUIDE.COLORS.darkBorderHover, }, '&.Mui-focused fieldset': { borderColor: theme.dashboardTheme?.components?.input?.focusBorderColor || theme.dashboardTheme?.components?.input?.focusBorderColorFallback || STYLE_GUIDE.COLORS.inputFocusFallback, }, }, '& .MuiInputLabel-root': { color: theme.dashboardTheme?.colors?.text?.secondary || STYLE_GUIDE.COLORS.darkBorderFocus, }, '& .MuiInputLabel-root.Mui-focused': { color: theme.dashboardTheme?.components?.input?.focusBorderColor || theme.dashboardTheme?.components?.input?.focusBorderColorFallback || STYLE_GUIDE.COLORS.inputFocusFallback, }, '& .MuiInputBase-input': { color: `${theme.dashboardTheme?.colors?.inputText || theme.dashboardTheme?.colors?.text?.primary || '#000000'} !important`, }, '& .MuiInputBase-input::placeholder': { color: `${theme.dashboardTheme?.colors?.text?.secondary || '#666'} !important`, }, '& .MuiInputBase-input:-webkit-autofill': { WebkitTextFillColor: `${theme.dashboardTheme?.colors?.inputText || theme.dashboardTheme?.colors?.text?.primary || '#000000'} !important`, WebkitBoxShadow: `0 0 0 1000px ${theme.dashboardTheme?.colors?.background?.paper || '#ffffff'} inset !important`, }, }}
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
                                <AddIcon sx={{ color: theme.getIconColor() }}/>
                              </IconButton>
                            </InputAdornment>
                          ),
                        },
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: STYLE_GUIDE.SPACING.s2, alignItems: 'center', fontSize: '14px', backgroundColor: theme.dashboardTheme?.colors?.background?.paper || '#ffffff', '& fieldset': { borderColor: theme.dashboardTheme?.colors?.inputBorder || STYLE_GUIDE.COLORS.darkBackground, }, '&:hover fieldset': { borderColor: theme.dashboardTheme?.colors?.borderHover || STYLE_GUIDE.COLORS.darkBorderHover, }, '&.Mui-focused fieldset': { borderColor: theme.dashboardTheme?.components?.input?.focusBorderColor || theme.dashboardTheme?.components?.input?.focusBorderColorFallback || STYLE_GUIDE.COLORS.inputFocusFallback, }, }, '& .MuiInputLabel-root': { color: theme.dashboardTheme?.colors?.text?.secondary || STYLE_GUIDE.COLORS.darkBorderFocus, }, '& .MuiInputLabel-root.Mui-focused': { color: theme.dashboardTheme?.components?.input?.focusBorderColor || theme.dashboardTheme?.components?.input?.focusBorderColorFallback || STYLE_GUIDE.COLORS.inputFocusFallback, }, '& .MuiInputBase-input': { color: `${theme.dashboardTheme?.colors?.inputText || theme.dashboardTheme?.colors?.text?.primary || '#000000'} !important`, }, '& .MuiInputBase-input::placeholder': { color: `${theme.dashboardTheme?.colors?.text?.secondary || '#666'} !important`, }, '& .MuiInputBase-input:-webkit-autofill': { WebkitTextFillColor: `${theme.dashboardTheme?.colors?.inputText || theme.dashboardTheme?.colors?.text?.primary || '#000000'} !important`, WebkitBoxShadow: `0 0 0 1000px ${theme.dashboardTheme?.colors?.background?.paper || '#ffffff'} inset !important`, }, }}
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
          {createAttributeOptions.isPending || updateAttributeOptions.isPending ? (
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
      </Dialog> */}
    </>
  );
};

export default CreateUpdateAttributeOption;

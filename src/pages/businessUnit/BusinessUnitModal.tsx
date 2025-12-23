import { useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Modal,
  Grid,
  CircularProgress,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useUnifiedTheme } from "../../hooks/useUnifiedTheme";
import useGet from "../../hooks/useGet";
import usePut from "../../hooks/usePut";
import usePost from "../../hooks/usePost";
import { GET, POST, PUT } from "../../services/apiRoutes";

interface BusinessUnitData {
  _id: string;
  name: string;
  status: string;
}

interface BusinessUnitPostPayload {
  name: string;
}

interface BusinessUnitPostResponse {
  success: boolean;
  data?: any;
  message?: string;
}

interface BusinessUnitModalProps {
  open: boolean;
  onClose: () => void;
  mode: "add" | "edit" | "view" | "filter" | null;
  editBusinessUnitId?: string;
  rowData?: BusinessUnitData | null;
  onBusinessUnitCreated?: () => void;
  onBusinessUnitUpdated?: () => void;
  filterValues?: {
    name: string;
  };
  onFilterApply?: (values: { name: string }) => void;
  onFilterReset?: () => void;
}

export function BusinessUnitModal({
  open,
  onClose,
  mode,
  editBusinessUnitId,
  rowData,
  onBusinessUnitCreated,
  onBusinessUnitUpdated,
  filterValues,
  onFilterApply,
  onFilterReset,
}: BusinessUnitModalProps) {
  const theme = useUnifiedTheme();
  const { control, handleSubmit, reset, formState } = useForm({
    defaultValues: {
      name: "",
    },
    mode: "onChange",
  });

  // const businessUnitList = useGet<{
  //   success: boolean;
  //   data: BusinessUnitData[];
  // }>(["businessUnitList"], GET?.BUSINESS_UNIT_LIST, true);

  const createBusinessUnit = usePost<
    BusinessUnitPostPayload,
    BusinessUnitPostResponse
  >(
    ["createBusinessUnit"],
    (data) => {
      if (data?.success) {
        onBusinessUnitCreated?.();
        onClose();
      } else {
        console.log("Failed to create Business Unit:", data?.message);
      }
    },
    true
  );

  const updateBusinessUnit = usePut<
    BusinessUnitPostPayload,
    BusinessUnitPostResponse
  >(
    ["updateBusinessUnit"],
    (data) => {
      if (data?.success) {
        onBusinessUnitUpdated?.();
        onClose();
      } else {
        console.log("Failed to update Business Unit:", data?.message);
      }
    },
    true
  );

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      if (mode === "edit" || mode === "view") {
        reset({
          name: rowData?.name || "",
        });
      } else {
        reset({
          name: "",
        });
      }
    }
  }, [open, mode, rowData, reset]);

  const onSubmit = (data: BusinessUnitPostPayload) => {
    if (mode === "filter" && onFilterApply) {
      onFilterApply(data);
      onClose();
    } else if (mode !== "view") {
      const payload = {
        name: data.name.trim(),
      };

      if (mode === "add") {
        createBusinessUnit.mutate({
          url: POST.CREATE_BUSINESS_UNIT,
          payload,
        });
      } else if (mode === "edit" && editBusinessUnitId) {
        updateBusinessUnit.mutate({
          url: `${PUT.UPDATE_BUSINESS_UNIT}/${editBusinessUnitId}`,
          payload,
        });
      }
    }
  };

  const handleResetFilter = () => {
    reset({
      name: "",
    });
    onFilterReset?.();
  };

  const isFormValid = formState.isValid;
  const isFormDirty = formState.isDirty;
  const isSaving = createBusinessUnit.isPending || updateBusinessUnit.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          backgroundColor: theme.palette.background.paper,
          borderRadius: "8px",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
          p: 3,
          width: "400px",
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          {mode === "add"
            ? "Add Business Unit"
            : mode === "edit"
            ? "Edit Business Unit"
            : mode === "view"
            ? "View Business Unit"
            : "Filter Business Units"}
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              {mode === "view" ? (
                <>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Name
                  </Typography>
                  <Box
                    sx={{
                      padding: 1.5,
                      borderRadius: 1,
                      backgroundColor: "#f5f5f5",
                      color: theme.palette.text.primary,
                    }}
                  >
                    {rowData?.name || "-"}
                  </Box>
                </>
              ) : (
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: "Name is required" }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Name *"
                      placeholder="Enter Business unit name"
                      variant="outlined"
                      fullWidth
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message || " "}
                      disabled={isSaving}
                    />
                  )}
                />
              )}
            </Grid>

            <Grid item xs={12}>
              {/* {mode === "view" ? (
                <></>
                // <>
                //   <Typography variant="subtitle2" sx={{ mb: 1 }}>
                //     Business Unit
                //   </Typography>
                //   <Box
                //     sx={{
                //       padding: 1.5,
                //       borderRadius: 1,
                //       backgroundColor: "#f5f5f5",
                //       color: theme.palette.text.primary,
                //     }}
                //   >
                //     {rowData?.departmentId?.name || "-"}
                //   </Box>
                // </>
              ) : (
                <Controller
                  name="businessUnitId"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Business Unit</InputLabel>
                      <Select
                        {...field}
                        label="Business Unit"
                        onChange={(e) => field.onChange(e.target.value)}
                        disabled={isSaving}
                      >
                        {businessUnitList.data?.data?.map((dept) => (
                          <MenuItem key={dept._id} value={dept._id}>
                            {dept.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              )} */}
            </Grid>
          </Grid>

          {isSaving && (
            <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 1,
              mt: 3,
            }}
          >
            {mode === "filter" ? (
              <>
                <Button
                  variant="outlined"
                  onClick={handleResetFilter}
                  size="small"
                >
                  Reset
                </Button>
                <Button
                  variant="outlined"
                  onClick={onClose}
                  sx={{ borderRadius: "8px" }}
                  size="small"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  size="small"
                  disabled={!filterValues?.name}
                >
                  Apply
                </Button>
              </>
            ) : (
              <>
                <Button variant="outlined" onClick={onClose} size="small">
                  Cancel
                </Button>
                {mode !== "view" && (
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{ borderRadius: "8px" }}
                    size="small"
                    disabled={!isFormValid || !isFormDirty || isSaving}
                  >
                    Save
                  </Button>
                )}
              </>
            )}
          </Box>
        </form>
      </Box>
    </Modal>
  );
}
